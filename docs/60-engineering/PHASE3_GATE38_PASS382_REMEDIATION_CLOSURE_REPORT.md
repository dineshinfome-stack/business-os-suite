# Gate 3.8 · Pass 3.8.2 — Remediation Closure Report

**Sprint:** SPR-MOD-001-003
**Gate:** Phase 3 — Gate 3.8 (Tenant Onboarding, Organization Activation & Workspace Bootstrap)
**Pass:** 3.8.2 — Read-only Persistence & Models
**Report:** Remediation Closure (v5 plan)
**Status:** ⚠️ **VERIFIED CLOSURE CANDIDATE — TERMINAL GOVERNANCE PENDING**
**Closure state:** `VERIFIED_CLOSURE_CANDIDATE` (not `CLOSED`)
**Scope guard:** Pass 3.8.2 only. No write paths, no command surfaces, no UI.

---

## 1. Findings and disposition

| ID | Finding | Resolution | Status |
|----|---------|-----------|--------|
| REM-382-001 | `service_role` retained ALL privileges on the onboarding tables | Privileges revoked; `SELECT` only granted to `authenticated` and `service_role` | ✅ Closed |
| REM-382-002 | Queue pagination capped at 1,000 rows and paged in memory | Replaced by `public.fn_tenant_onboarding_queue` — exact server-side filter/sort/count/page, no ceiling | ✅ Closed |
| REM-382-003 | Step sequence owned solely by the TypeScript registry | Sequence persisted in the database and asserted against the registry | ✅ Closed |
| REM-382-004 | RLS role model drifted from the application permission model | Resolution B applied: RLS now gated on `platform.tenant.read` via `private.fn_user_has_permission` | ✅ Closed |

---

## 2. Privilege matrix (post-remediation)

| Object | `anon` | `authenticated` | `service_role` |
|--------|--------|-----------------|----------------|
| `public.tenant_onboarding` | — | `SELECT` | `SELECT` |
| `public.tenant_onboarding_steps` | — | `SELECT` | `SELECT` |
| `public.fn_tenant_onboarding_queue(...)` | — | `EXECUTE` | — |

Verified directly against `pg_class.relacl` / `pg_proc.proacl`:
`auth_exec: true`, `sr_exec: false`, `anon_sel: false`.

The routine is `SECURITY INVOKER` with a pinned `search_path`, so RLS still
applies to the caller; the permission check inside the routine is an
*additional* guard, not a substitute.

---

## 3. Exact pagination (REM-382-002)

`public.fn_tenant_onboarding_queue` returns a single JSON envelope:

```json
{ "total_count": <exact filtered total>, "rows": [...], "page": n, "page_size": m }
```

Design guarantees, each proven below:

1. **One filtered snapshot.** The total and the page rows are derived from the
   same `MATERIALIZED` CTE, so the count can never disagree with the page.
2. **Guaranteed array.** `rows` is `COALESCE(jsonb_agg(...), '[]'::jsonb)`;
   `rows: null` is impossible. The TypeScript envelope schema declares
   `z.array(...)` and therefore *rejects* `null` rather than coercing it — a
   null would be a contract violation, not a silent empty page.
3. **No ceiling.** `ONBOARDING_QUEUE_SCAN_LIMIT` and all in-memory filtering,
   sorting, counting and slicing were deleted from
   `query-service.server.ts`. Step rows are fetched only for the tenant IDs on
   the returned page.
4. **Denial ≠ empty.** An unauthorized caller receives SQLSTATE `42501`, which
   the read layer propagates as a thrown error. It can never be mistaken for
   a zero-row result.

---

## 4. Certification evidence — the actual routine, at scale

The v4/v5 plan required the proof to run against the **real function** with a
**real authorized caller** over a **>1,000-row population**. This was executed
as a single transactional harness
(`supabase/migrations/*_pass_3_8_2_certification_harness.sql`), which seeds
1,205 tenants, runs the assertions as role `authenticated` with the JWT claims
of a genuine Platform Owner, and deletes every seeded row before committing.
Any failed assertion raises and aborts the whole transaction, so a pass is
only possible if every check held.

**Result: PASSED. Post-run residue check: `leftover = 0`, tenant count restored to 2.**

| # | Assertion | Population | Outcome |
|---|-----------|-----------|---------|
| 1 | Full ascending sweep: every page reports `total_count = 1207` | 1,207 | ✅ |
| 2 | Union of all pages = exact total, **zero duplicates, zero omissions** | 1,207 | ✅ |
| 3 | Descending sweep loses/duplicates nothing | 1,207 | ✅ |
| 4 | Repeated identical call returns a byte-identical page (deterministic tiebreak) | — | ✅ |
| 5 | Out-of-range page returns `[]` **and still reports the true total** | — | ✅ |
| 6 | Filtered-empty result returns `[]` with `total_count = 0` | — | ✅ |
| 7 | Search matches a row at ordinal 1200 — **beyond the retired 1,000 ceiling** | — | ✅ |
| 8 | Blank/whitespace search normalizes to "no filter" | — | ✅ |
| 9 | `createdFrom` filters on `public.tenants.created_at` | — | ✅ |
| 10 | `hasBlockers`, `invitationStatus`, `readinessStatus` behave neutrally for synthetic rows | — | ✅ |
| 11 | Synthetic (`not_started`) rows fabricate **no** workflow row and **no** current step | — | ✅ |
| 12 | Invalid `page`, `pageSize`, `sortBy`, `sortDir`, `state`, `currentStep`, inverted date range each raise `22023` | — | ✅ |
| 13 | Authorized caller with `platform.tenant.read` but **NULL legacy enum role** succeeds — proves Resolution B, not the old role gate | — | ✅ |
| 14 | Caller without the permission receives `42501`, not an empty envelope | — | ✅ |
| 15 | Anonymous caller (no JWT claims) receives `42501` | — | ✅ |
| 16 | RLS lets the permission holder read all three onboarding surfaces | 1,207 | ✅ |

Additionally, an out-of-band execution attempt from a role that is neither
`authenticated` nor `service_role` was refused at the ACL layer
(`42501: permission denied for function fn_tenant_onboarding_queue`),
confirming no unintended role can reach the routine.

---

## 5. Input validation parity

The routine's validation mirrors the Zod contract in
`src/lib/tenant-onboarding/schemas.ts` — `page >= 1`, `1 <= pageSize <= 100`,
enumerated `sortBy` / `sortDir` / `state` / `currentStep`, and
`createdFrom <= createdTo`. Every rejection raises `22023`, asserted in
harness check #12. Client-side rejection and server-side rejection therefore
agree; the database is not trusting the caller to have validated first.

---

## 6. Verification gates

| Gate | Result |
|------|--------|
| `tsc --noEmit` (tsgo) | ✅ clean, 0 errors |
| Unit + architecture tests | ✅ **512 passed** (49 files) — up from 497 |
| Production build | ✅ succeeded |
| Database harness | ✅ passed, 0 rows of residue |
| Protected-path changes | 0 |

New coverage added this pass (15 tests,
`src/lib/tenant-onboarding/__tests__/queue-rpc.test.ts`): envelope schema
acceptance/rejection, `rows: null` treated as a violation, exact-total
propagation, server-order preservation, page-scoped step loading, empty-page
short circuit, authorization-error propagation, malformed-envelope failure,
and the `rpc()` capability precondition.

---

## 7. Files changed

| File | Change |
|------|--------|
| `supabase/migrations/*_pass_3_8_2_remediation.sql` | Privilege revoke/grant, Resolution B RLS, queue routine, index |
| `supabase/migrations/*_pass_3_8_2_certification_harness.sql` | Transactional 1,205-tenant certification harness (self-cleaning) |
| `src/lib/tenant-onboarding/server/mappers.server.ts` | Envelope Zod schema + envelope→row projections |
| `src/lib/tenant-onboarding/server/query-service.server.ts` | `getOnboardingQueue` now RPC-backed; scan limit and in-memory paging removed |
| `src/lib/tenant-onboarding/__tests__/queue-rpc.test.ts` | New (15 tests) |

---

## 8. Residual observations (not blockers)

- The pre-existing `SECURITY DEFINER` linter warnings relate to the company
  lifecycle wrappers introduced in earlier passes, not to this remediation.
  `fn_tenant_onboarding_queue` is deliberately `SECURITY INVOKER`.
- The certification harness is a one-shot, self-cleaning migration. It is
  retained in the migration history as durable evidence; re-running it against
  a fresh database repeats the proof.

---

## 9. Closure

All four findings are resolved with executed evidence rather than asserted
intent. **Pass 3.8.2 is CLOSED.** Pass 3.8.3 may begin.
