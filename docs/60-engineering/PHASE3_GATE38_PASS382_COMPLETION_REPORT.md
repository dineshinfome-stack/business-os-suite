# Phase 3 — Gate 3.8 · Pass 3.8.2 Completion Report

**Sprint:** SPR-MOD-001-003 · **Gate:** 3.8 · **Pass:** 3.8.2
**Scope:** Workflow persistence, RLS and read models — **READ-ONLY**
**Date:** 2026-07-26

---

## 1. Scope statement

Pass 3.8.2 delivers durable onboarding workflow persistence and a read-only
composition layer over it. **No command, mutation, activation, readiness
evaluation or UI route is introduced.** Every write path remains unimplemented
and is enforced as unimplemented at three levels: no application write code, a
SELECT-only grant matrix, and a SELECT-only RLS policy set.

---

## 2. Database changes

### 2.1 Tables created

| Table | Purpose |
|---|---|
| `public.tenant_onboarding` | One workflow row per tenant (state, timestamps, blocked/cancellation reasons, correlation id, `version`) |
| `public.tenant_onboarding_steps` | Per-step tracking (`step_key`, `status`, attempts, timestamps, sanitized failure code/summary, `version`) |

No readiness-check table and no activity/event-history table were created.
Activity is a **composed read** over `audit_logs` + `tenant_onboarding_steps`
(G38-POL-008). Readiness is contract-only in this pass.

### 2.2 Integrity constraints

| Constraint | Table | Effect |
|---|---|---|
| `tenant_onboarding_tenant_unique` | parent | exactly one workflow per tenant |
| `tenant_onboarding_parent_key` UNIQUE `(id, tenant_id)` | parent | target for the composite child FK |
| `tenant_onboarding_steps_parent_fk` FK `(tenant_onboarding_id, tenant_id)` | child | **parent consistency enforced by the database** — a step row cannot reference a workflow belonging to another tenant |
| `tenant_onboarding_steps_unique (tenant_id, step_key)` | child | one row per step per tenant |
| `tenant_onboarding_state_check` | parent | state ∈ the six workflow states (SQL/TS parity) |
| `tenant_onboarding_steps_key_check` | child | step_key ∈ the ten canonical registry keys (SQL/TS parity) |
| `tenant_onboarding_steps_status_check` | child | status ∈ the six step statuses |
| `*_activated_consistency`, `*_cancelled_consistency` | parent | terminal timestamps only in the matching state |
| `*_reason_len`, `*_summary_len` | both | operator text bounded to 500 chars |

Persistence is keyed to **`tenant_id`**, never to `organizations`.

**Canonical-step seeding:** step rows are **not** pre-seeded. Key parity with
the TypeScript registry is enforced by the SQL `CHECK` constraint; absent rows
read as `not_started` from the registry-driven projection, so the registry
remains the single source of truth.

### 2.3 Grant matrix (verified against `pg_class.relacl`)

| Table | anon | authenticated | service_role | RLS |
|---|---|---|---|---|
| `public.tenant_onboarding` | **none** | `r` (SELECT only) | ALL | enabled |
| `public.tenant_onboarding_steps` | **none** | `r` (SELECT only) | ALL | enabled |

The project's schema-level default privileges grant ALL to `anon` and
`authenticated`; a follow-up migration explicitly `REVOKE`s both roles and
re-grants `SELECT` to `authenticated` only. Verified read-back:

```
tenant_onboarding        relrowsecurity=t  {postgres=arwdDxtm, service_role=arwdDxtm, authenticated=r}
tenant_onboarding_steps  relrowsecurity=t  {postgres=arwdDxtm, service_role=arwdDxtm, authenticated=r}
```

No `anon` entry is present on either table. No INSERT/UPDATE/DELETE privilege
is held by any application role.

### 2.4 RLS — operator surface only

One policy per table:

```sql
FOR SELECT TO authenticated
USING (private.fn_has_role(auth.uid(), 'admin'::app_role))
```

This is the same platform-admin predicate used by `tenants` and `audit_logs`.
**Tenant members are denied**: there is deliberately no membership-scoped
policy, so an ordinary organization member reading either table receives zero
rows. There are no INSERT/UPDATE/DELETE policies at all.

### 2.5 Linter

Both migrations returned the same 12 pre-existing WARNs (11
`SECURITY DEFINER` public wrappers created in earlier passes, plus
"Leaked Password Protection Disabled" — a project auth setting). **Zero new
findings**: this pass created no functions and no new exposure.

---

## 3. Application changes

### 3.1 Server files — exactly three (allow-listed)

| File | Role |
|---|---|
| `src/lib/tenant-onboarding/server/mappers.server.ts` | Pure row → DTO conversion; **the application owns the contract** |
| `src/lib/tenant-onboarding/server/query-service.server.ts` | Caller-scoped composition/read service |
| `src/lib/tenant-onboarding/queries.functions.ts` | `createServerFn` read facade (thin wrapper) |

No SQL view is introduced; no PostgREST shape crosses the boundary. Mapping is
the sole conversion point and is fully unit-tested in isolation.

### 3.2 Authorization

| Server function | Middleware | Notes |
|---|---|---|
| `listTenantOnboarding` | `platform.tenant.read` | queue projection |
| `getTenantOnboardingDetail` | `platform.tenant.read` | never requires audit permission |
| `getTenantOnboardingSteps` / `...Progress` / `...Readiness` | `platform.tenant.read` | |
| `getTenantOnboardingActivity` | `platform.tenant.read` **+ runtime `platform.audit.view` check** | returns `{ entries, includesAuditEntries }` |

**Activity authorization correction (blocking item closed):** global audit
access is never granted through the tenant-read permission. A caller holding
only `platform.tenant.read` receives a **partially composed timeline**
containing step-derived entries only, with `includesAuditEntries: false`. The
detail read contains no audit-derived data at all and therefore cannot fail
when audit permission is absent.

Every query runs on `context.supabase` — the caller-scoped client injected by
`requireSupabaseAuth`. The service-role client is **not imported anywhere** in
the read layer (asserted by test), so RLS applies as the caller.

Audit-derived entries are additionally restricted to a 13-entry
**allow-list of `onboarding.*` actions**; any other audit action is dropped, so
the onboarding surface cannot become a general audit feed. `old_values` and
`new_values` are never selected.

### 3.3 Synthetic (non-persisted) workflow contract

A tenant with no `tenant_onboarding` row is a valid, expected state, projected
as a `not_started` workflow with **no fabricated identity**:

- `persisted: false`, `version: null` — no synthetic UUID, no `version: 0`.
- `startedAt` / `readyAt` / `activatedAt` = `null`.
- `updatedAt` reuses the tenant's own persisted `tenants.updated_at`; no
  `new Date()` value is ever produced by the read layer.
- No database error, and **no side-effect write**: reads never lazily seed.

Two additive/widening DTO amendments were required and are documented in
`onboarding-summary.dto.ts` and `onboarding-detail.dto.ts`:
`TenantOnboardingSummaryDTO.persisted` (new), `TenantOnboardingDetailDTO.persisted`
(new) and `TenantOnboardingDetailDTO.version` widened to `number | null`. Both
remain within v1 (no consumer existed).

### 3.4 Queue pagination

The operator queue is a **LEFT JOIN of `tenants` → `tenant_onboarding`**: every
non-deleted tenant is a queue row whether or not a workflow row exists. Filters,
sorting and pagination are applied to the **combined projection**, so synthetic
`not_started` rows page identically to persisted ones and `total` / `pageCount`
are correct. A hard scan ceiling (`ONBOARDING_QUEUE_SCAN_LIMIT = 1000`) bounds
the read.

### 3.5 Readiness

Pinned to `evaluationStatus: "not_evaluated"`, `overallStatus: null`,
`checks: []`, `blockingCount: 0`, `warningCount: 0`. Blockers are `[]`.
Evaluation remains owned by Pass 3.8.5.

### 3.6 Available actions

The detail read advertises the legal transitions for the current state (from
the pure state machine) but **every action is `enabled: false`** with a
sanitized `disabledReason`, because no command exists in this pass.

---

## 4. Architecture boundary test evolution

`__tests__/architecture.test.ts` now separates:

- `SERVER_ALLOW_LIST` — exactly the three files above. The test asserts the
  set of `*.server.ts` / `*.functions.ts` files in the module **equals** that
  allow-list (no more, no fewer).
- `MODULE_FILES` — everything else, still asserted pure: no Supabase /
  `@/integrations` / `.server` / `@/modules` / `@/components` /
  `@tanstack/react-start` / `react` imports, no `process.env`, no
  `import.meta.env`, no `PERMISSIONS.`, no `.tsx`, no `.sql`.
- The three server files are additionally asserted free of `client.server`,
  `supabaseAdmin`, `SERVICE_ROLE`, `process.env`, and of `.insert(`,
  `.update(`, `.upsert(`, `.delete(` — a machine-checked read-only guarantee.

---

## 5. Verification evidence

| Check | Result |
|---|---|
| Full test suite | **497 passed / 497** (481 baseline + 4 Pass 3.8.1 closure + 12 Pass 3.8.2), 48 files |
| Typecheck (`tsgo --noEmit`) | clean, no output |
| Production build (`npm run build`) | exit 0, Nitro output generated |
| Test integrity | no `skip` / `only` / `todo`; no pre-existing test deleted or weakened |
| Generated files | `src/routeTree.gen.ts` transiently touched by the build; no net change retained |
| Security linter | 12 WARNs, all pre-existing; 0 new |

New tests for this pass (12): 10 in `__tests__/read-models.test.ts` (registry
projection, progress computation, synthetic identity, persisted identity,
readiness pinning, disabled actions, summary neutrality, audit allow-listing,
merge ordering, step-only timeline) and 2 added cases in
`architecture.test.ts` (server allow-list exactness, read-layer purity /
no-write assertions). A further 4 tests landed with the Pass 3.8.1 closure
amendment (`contract-colocation.test.ts`).

---

## 6. Deviations and deferrals

- **Domain composition deferred.** `organization`, `primaryBranch`,
  `adminInvitation`, `adminMembership` are `null` and `invitationStatus` is
  `"none"` in this pass; they are owned by Passes 3.8.3–3.8.4.
- **Blockers deferred.** `blockerCount: 0`, `blockers: []` until the Pass 3.8.5
  readiness engine exists. `blockerSummary` surfaces only the persisted
  `blocked_reason_summary`.
- **Financial-year trigger** (G38-POL-004) remains unresolved — Pass 3.8.5.
- **Queue projection is composed in the application**, not in SQL, to keep the
  synthetic/persisted pagination correct without a view owning the contract.

---

## 7. Original functional completion

**Pass 3.8.2 functional scope is complete** (persistence, RLS, read models);
that completion was recorded as repository state
`GATE38_PASS382_READ_MODELS_READY`. Sections 1–6 above describe that original
functional delivery and are unchanged.

Pass 3.8.3 (bootstrap commands) not started.

---

## 8. Migration-history remediation closure (separate from §7)

Functional completion did **not** close Pass 3.8.2. A separate defect —
the certification harness had been stored as a **production migration with
hard-coded live UUIDs and JWT-claim manipulation** — mutated real migration
history and made the repository's migration chain environment-dependent. That
defect required the Architecture Office-approved Commit A repair: the harness
migration was replaced with a comment-only tombstone and the certification
logic was re-authored as a deterministic, self-cleaning script under
`supabase/tests/`.

| Item | Value |
|---|---|
| Technical Commit A SHA | `98019c2cad8ae8467d123a46a5714dcced929a50` |
| Governed reconciliation SHA | `77a95a15e59d0a4c48d7b9746e525adf1c4e7934` |
| Commit B stable baseline | `77a95a15e59d0a4c48d7b9746e525adf1c4e7934` |

### 8.1 Authoritative Commit B quality results

All commands were executed in a disposable worktree created directly from the
stable governed baseline, with `bun install --frozen-lockfile` (exit 0, no
lockfile mutation), on Node `v22.22.0` / bun `1.3.3` / `Linux 4.4.0 x86_64`.

| Gate | Command | Result |
|---|---|---|
| Test suite | `bun run test` (`vitest run`) | **PASS** — exit 0, 49 files, **512 passed, 0 failed, 0 skipped**, 8.78s |
| Typecheck | `bunx tsgo --noEmit` | **PASS** — exit 0, **0 diagnostics** |
| Production build | `bun run build` | **PASS** — exit 0, 14s, `dist/client`, `dist/server`, `dist/nitro.json` |
| Commit A technical files | Git blob comparison | **4/4 unchanged** |
| Protected files | blob + SHA-256 comparison | **10/10 PASS**, drift 0 |

The earlier 497/497 and 512/512 observations are historical; the table above is
the authoritative Commit B evidence.

### 8.2 Remaining Commit C requirements

Commit C (terminal governance) remains **mandatory and not started**. It must
pin the Commit B SHA, update the migration registry, create the terminal audit
report, and record formal closure. None of these is performed here.

### 8.3 Separate signup finding

`FND-20260726-AUTH-SIGNUP-TENANTID` — `private.fn_handle_new_auth_user()`
inserts into `public.organizations` without `tenant_id`, aborting
trigger-enabled `auth.users` inserts with SQLSTATE `23502`. Disposition:
**OPEN — SEPARATE_TRIAGE_REQUIRED**. It is not repaired under this remediation
and does not block the closure candidate.

---

## 9. Status

**Pass 3.8.2: COMPLETE — VERIFIED CLOSURE CANDIDATE — TERMINAL GOVERNANCE
PENDING.** Pass 3.8.2 is *not* formally closed.

**Pass 3.8.3: NOT STARTED.**
