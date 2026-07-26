
# Pass 3.8.2 — Remediation Closure (v5, approved + 3 execution safeguards)

Status stays `COMPLETE — REMEDIATION REQUIRED` until every completion-gate item verifies. Remediation only: no commands, no routes, no UI, no Pass 3.8.3 work.

## Verified current state (pre-plan evidence)

| Item | Evidence |
|---|---|
| Grants | `service_role=arwdDxtm` on both onboarding tables; `authenticated=r`; no `anon` |
| Onboarding RLS | One SELECT policy per table using `private.fn_has_role(auth.uid(),'admin')` |
| `public.tenants` RLS | `tenants_select_platform_admin` (legacy enum predicate) + separate tenant-member policy |
| Queue | `ONBOARDING_QUEUE_SCAN_LIMIT = 1000`; filter/sort/count/page in JS |
| Date filters | `createdFrom`/`createdTo` currently applied to mapped `updatedAt` |
| Zod contract | `page >= 1`; `1 <= pageSize <= 100`; enum state/step/sort/direction; offset-aware ISO datetimes; `createdFrom <= createdTo` |
| Mapper current step | first canonical step whose status is not `completed` or `skipped` |
| Sequence | Not persisted; TS `ONBOARDING_STEPS` canonical |
| Auth drift | A `platform_owner` holds `platform.tenant.read` with enum role `NULL` → Resolution B |

## Scope statement

No protected source-code paths are modified. One approved cross-domain database authorization change is made: an additive SELECT policy on `public.tenants` for the canonical `platform.tenant.read` permission. No tenant schema, lifecycle behavior, INSERT policy, UPDATE policy, member policy, or existing platform-admin policy is removed or weakened. No business table schema outside the two onboarding tables changes.

## Phase A — Baseline capture
Record migrations, `relacl`, `pg_policies`, RLS flags, constraints, indexes, function ACLs, 497 tests, typecheck, production build. Confirm no Pass 3.8.3 artifacts.

## Phase B — Forward corrective migration (new file; originals untouched)

1. **Grants** — `REVOKE ALL` on both onboarding tables from `anon`, `authenticated`, `service_role`; `GRANT SELECT` to `authenticated`, `service_role`. No sequences exist (UUID defaults).
2. **Onboarding RLS (Resolution B)** — drop `*_select_platform_admin`; create `*_select_platform_permission` `FOR SELECT TO authenticated USING (private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.read'))` on both tables.
3. **Additive tenants policy**
   ```sql
   CREATE POLICY tenants_select_platform_permission
     ON public.tenants FOR SELECT TO authenticated
     USING (private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.read'));
   ```
   Permissive policies OR together: member access OR legacy platform-admin OR canonical permission. The RPC keeps its own guard, so an ordinary member exposed by the member policy still cannot invoke the global queue.
4. **`public.fn_tenant_onboarding_queue(...)`** — `LANGUAGE plpgsql`, `STABLE`, `SECURITY INVOKER`, `SET search_path = pg_catalog, public, private`, every object schema-qualified.
   - Projection: `public.tenants` where `deleted_at IS NULL` and `lifecycle_state NOT IN ('pending_deletion','deleted')`, `LEFT JOIN public.tenant_onboarding`, `LEFT JOIN` step CTE.

### 1. Unauthorized RPC behavior (explicit)
PL/pgSQL is chosen precisely so denial is procedural and unambiguous:
```sql
IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.read') THEN
  RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
END IF;
```
An unauthorized direct caller never receives an envelope. An authorized caller over an empty population receives exactly one envelope with `total_count = 0`, `rows = []`. Tests assert both outcomes and that they are distinguishable.

### 2. Pagination envelope (bound behaviour)
Single-row envelope `{ total_count, rows, page, page_size }`. `total_count` is the exact filtered count computed independently of `OFFSET/LIMIT`; `rows` is `[]` on an empty or out-of-range page; `page`/`page_size` echo the effective values. The application never infers `total = 0` from `rows = []`. A private internal Zod schema in `mappers.server.ts` parses the envelope before mapping — no direct cast of unvalidated jsonb to a v1 DTO.

**Safeguard 1 — guaranteed empty array.** `jsonb_agg` returns `NULL` over zero rows, so the aggregate is wrapped:
```sql
COALESCE(jsonb_agg(to_jsonb(page_rows) ORDER BY page_rows.result_position), '[]'::jsonb)
```
The internal Zod schema **rejects `rows: null`** rather than coercing it — a null array is a contract violation, not a tolerated shape. A test asserts `rows` is `[]` (not null) for both an empty population and an out-of-range page.

**Safeguard 2 — one filtered snapshot.** The exact total and the page rows come from the *same* filtered CTE in a **single** SQL statement:
```sql
WITH canonical_steps AS (...),
     step_projection AS (...),
     filtered AS MATERIALIZED (...),
     ranked AS (...),
     page_rows AS (...)
SELECT
  (SELECT count(*) FROM filtered),
  COALESCE((SELECT jsonb_agg(to_jsonb(page_rows) ORDER BY result_position) FROM page_rows), '[]'::jsonb),
  effective_page,
  effective_page_size
INTO ...;
```
No separate count statement followed by an independent page statement — concurrent tenant changes must not produce a total and a row set from different snapshots.

### 3. Deterministic JSON element order
`result_position` is the row number assigned by the paginating window (static `CASE` sort expressions, `NULLS LAST`, `tenant_id ASC` tie-breaker), and the aggregate orders by it explicitly. No dynamic SQL, no concatenated caller text.

### 4. Database validation mirrors the Zod contract
| Input | RPC behavior |
|---|---|
| Missing page | default `1` |
| Missing page size | default `25` |
| Page `< 1` | reject |
| Page size `< 1` or `> 100` | reject |
| Invalid sort/direction/state/step | reject |
| Invalid or inverted datetime range | reject |
| Blank/whitespace search | normalize to `NULL` |
| Valid `createdFrom` | `tenants.created_at >= createdFrom` |
| Valid `createdTo` | `tenants.created_at <= createdTo` |

Offset-aware `timestamptz` comparison throughout — no truncation to calendar dates, no implicit end-of-day. Offset arithmetic overflow-protected. Rejections raise, matching application-level rejection rather than silently clamping.

### 5. Full-signature ACL operations (Safeguard 3)
Every grant, revoke, catalog check, and effective-privilege assertion names the **complete** signature with the final parameter types and order, so no overload or stale signature retains rights:
```sql
REVOKE EXECUTE ON FUNCTION public.fn_tenant_onboarding_queue(
  text, text, text, boolean, text, text,
  timestamptz, timestamptz, text, text, integer, integer
) FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.fn_tenant_onboarding_queue(
  text, text, text, boolean, text, text,
  timestamptz, timestamptz, text, text, integer, integer
) TO authenticated;
```
Tests use the same full signature:
```sql
has_function_privilege('authenticated',
  'public.fn_tenant_onboarding_queue(<exact argument types>)', 'EXECUTE')
```
A test also asserts exactly one function with that name exists (no unintended overload).

### 6. Current-step SQL semantics
`currentStepKey` = first canonical registry step whose status is **not** `completed` and **not** `skipped`; a missing step row projects as `not_started`; when every applicable step is settled, `currentStepKey = NULL`. Computed via a non-persisted, parity-tested inline ordered `VALUES` mirror of `ONBOARDING_STEPS` (`('provisioning_verified',1) … ('activation',10)`), used only to compute/filter the current step — no column, no step-definition table, not a configuration source.

### 7. Date-filter semantics (binding decision)
`createdFrom`/`createdTo` filter `public.tenants.created_at`, as their names imply. The current behaviour (filtering mapped `updatedAt`) is recorded in `PHASE3_GATE38_ONBOARDING_MATRIX.md` as a defect corrected here, with before/after semantics stated explicitly — a contract clarification, not new scope.

### 8. Blocker contract preserved
No blocker aggregation. `blockerCount = 0`, `blockers = []`, `hasBlockers = true` yields no rows, `hasBlockers = false` excludes nothing, `blocked_reason_summary` stays in its existing summary field. `invitationStatus = none` and `readinessStatus = not_evaluated` remain constants. Blocker evaluation stays deferred to Pass 3.8.5.

## Phase C — Read layer
`getOnboardingQueue` calls the RPC with validated inputs, parses the envelope (rejecting `rows: null`), maps through `mappers.server.ts`, and fetches step rows only for the returned page's tenant IDs. `ONBOARDING_QUEUE_SCAN_LIMIT` removed from queue correctness (`ONBOARDING_ACTIVITY_LIMIT` retained). Caller-scoped `context.supabase` throughout; synthetic `not_started` identity rules, audit-permission degradation, tenant-member denial, and no-read-side-writes preserved.

## Phase D — Ratify registry-owned sequence
Matrix decision record: sequence not persisted; `ONBOARDING_STEPS` canonical; SQL validates the key set and may carry a parity-tested non-persisted ordering mirror; supersedes the earlier `(step_key, sequence)` design.

## Phase E — Tests

### Large-population proof against the actual RPC
```
isolated/transactional database
→ seed 1,205+ real public.tenants rows (owner/test-admin identity; app roles stay read-only)
→ mix persisted and synthetic workflows
→ invoke the actual public.fn_tenant_onboarding_queue(...) as an authorized caller
→ page through everything
→ assert exact total, full union, no duplicates, no omissions
→ delete seeded rows / destroy the ephemeral environment
```
Must exercise the real function through the database — not a copied body, not a mock. A `generate_series` SQL unit test may be retained as an extra check. If the actual-function run cannot be performed, remediation does not close.

### Authorization matrix (drift directions)
| Legacy enum role | Canonical `platform.tenant.read` | Expected |
|---|---|---|
| `admin` | present | allowed |
| `admin` | absent | denied (`42501`) |
| null / non-admin | present | allowed |
| null / non-admin | absent | denied (`42501`) |

Plus: tenant member without the permission cannot invoke the queue; permission holder reads `public.tenants` through RLS; permission holder reads both onboarding tables through RLS; the same caller succeeds through the actual RPC; direct RPC execution cannot bypass the guard and never returns an envelope when denied; no tenant INSERT/UPDATE/member/legacy-admin policy changed; anon denied everywhere.

### Ordering / pagination
Array order equals the requested sort; equal primary-sort values tie-break on `tenant_id ASC`; repeated calls over static data return identical sequences; ascending and descending page unions contain no duplicates or omissions; empty population; final partial page; first and far out-of-range pages; filtered result whose requested page is empty (correct total, `rows: []`, never null); search hitting a tenant beyond the former 1,000 ceiling; null ordering.

### Current-step parity
All step rows absent; early step completed; skipped conditional step; blocked step; failed step; all steps settled (`NULL`); SQL current step equals mapper current step over the same dataset. Registry parity on key set **and** sequence (unique, contiguous); mapper ignores any externally supplied `sequence`.

### Privilege verification — ACL text **and** effective privileges
Catalog: `relacl`, `pg_policies`, `relrowsecurity`; function `prosecdef = false`, `provolatile = 's'`, owner recorded, `proconfig` contains the hardened `search_path`, `proacl` (looked up by full signature) shows PUBLIC/`anon`/`service_role` execute absent and `authenticated` present.
Effective: `has_table_privilege` / `has_function_privilege` assertions for both tables and all relevant privileges, e.g. `anon`/SELECT false, `authenticated`/INSERT false, `service_role`/UPDATE false, `authenticated`/EXECUTE true, `service_role`/EXECUTE false. Also verify role inheritance does not restore a privilege absent from the direct ACL entry.

| Role | Tables | RPC |
|---|---|---|
| anon | none | no execute |
| authenticated | SELECT only | execute |
| service_role | SELECT only | no execute |
| database owner | owner-controlled | owner-controlled |

### Other
Direct-RPC input hardening cases per the validation matrix; original migrations byte-unchanged; corrective migration applies on both clean and populated Pass 3.8.2 databases; regression suite (synthetic identity, no read-side writes, readiness pinned to `not_evaluated`, activity degradation without `platform.audit.view`, DTO sanitisation, architecture allow-list of exactly three server files, neutral blockers); date-filter semantics test asserting `created_at` filtering.

## Phase F — Report and completion gate
Append `## Amendment — Pass 3.8.2 Remediation Closure` (dated) to `PHASE3_GATE38_PASS382_COMPLETION_REPORT.md`, original body preserved: original defects stated honestly; corrective migration; final database state (grants, effective privileges, policies including the additive tenants policy recorded as an **approved remediation dependency**, full-signature function ACL/config); lifecycle-enum evidence and exclusion rationale; unauthorized-RPC denial contract; date-filter decision; test totals (497 baseline + new).

Mark `Pass 3.8.2 — COMPLETE AND CLOSED` only when every item holds: original migrations byte-identical; corrective migration succeeds on clean and populated databases; `anon` has no table or function privileges; `authenticated` has onboarding-table SELECT and RPC EXECUTE only; `service_role` has table SELECT only and no RPC execution; onboarding RLS uses `platform.tenant.read`; the additive tenants policy works for canonical permission holders; legacy admin without the canonical permission is denied; the actual RPC passes the 1,205+ tenant test; empty and out-of-range pages return exact totals and `rows: []`; filters and sorting are exact and deterministic; SQL and TypeScript current-step results match; SQL key/sequence mirror matches the registry; date filtering uses `tenants.created_at`; neutral blocker/invitation/readiness behavior unchanged; no service-role client or read-side write introduced; all 497 existing plus new tests pass; typecheck clean; production build succeeds; generated-file and protected-path reviews pass; the amendment is appended. Then stop — Pass 3.8.3 remains NOT STARTED.

## Files
New: one `supabase/migrations/*.sql`. Modified: `server/query-service.server.ts`, `server/mappers.server.ts`, `queries.functions.ts` (only if filter plumbing requires it), `__tests__/**`, `PHASE3_GATE38_ONBOARDING_MATRIX.md`, `PHASE3_GATE38_PASS382_COMPLETION_REPORT.md`.
