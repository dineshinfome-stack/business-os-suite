# SPR-MOD-001-002 — Phase 2: Backend Foundation

Execute SIP tasks **SIP-010, SIP-011, SIP-012, SIP-013, SIP-014** exclusively. Consume Phase 1 RPCs; no schema, UI, tests, docs, or sprint closure.

## Reuse Contract (from SPR-MOD-001-001)

- **Event envelope**: replicate the shape used by `src/lib/tenants/events.ts` 1:1 (`event`, `version:1`, `emitted_at`, `<entity>_id`, `actor_id`, `correlation_id`, `data{from_state,to_state,...}`).
- **Audit writer**: mirror `src/lib/tenants/audit.ts` — one `createServerFn` per entity type, writes `public.audit_logs` under caller JWT (RLS-scoped), includes `actor_id`, `entity_type`, `entity_id`, `from_state`, `to_state`, `correlation_id`.
- **Lifecycle module**: pure state-machine mirror (`STATES`, `ALLOWED`, `canTransition`, `assertTransition`) matching the DB `private.fn_assert_*_lifecycle_transition` guards.
- **Server-fn pattern**: `createServerFn` → `.middleware([requireSupabaseAuth])` → Zod `.inputValidator` → `.handler` calling `context.supabase.rpc("fn_*", args as never)`. Reuse the existing repository approach for typing private-schema RPCs.
- **Permissions**: enforce via `requirePermission(PERMISSIONS.PLATFORM_COMPANY_*|BRANCH_*|FINANCIAL_YEAR_*)` from `src/lib/authorization.server.ts` (generated in Phase 1). No hard-coded permission strings.
- **Idempotency & audit policy**: follow the approved SPR-001 audit policy — idempotent no-op branches (`already_active`, `already_archived`, etc. returned by the RPC) skip the audit write and return `event: null`. Any deviation is a blocker to raise, not resolve locally.

## Event names & payloads

Event builders shall emit exactly the event names and payloads defined in **PRD §11**. This plan does not restate them.

## Files (new)

**Company** — reuses `public.organizations`:
- `src/lib/organizations/lifecycle.ts`
- `src/lib/organizations/events.ts`
- `src/lib/organizations/audit.ts` — `logCompanyEventFn` (entity_type `"company"`)
- `src/lib/organizations/company.functions.ts` — `listCompanies`, `createCompany`, `activateCompany`, `deactivateCompany`, `archiveCompany`, `setDefaultCompany`

**Branch**:
- `src/lib/branches/lifecycle.ts`
- `src/lib/branches/events.ts`
- `src/lib/branches/audit.ts` — `logBranchEventFn`
- `src/lib/branches/branch.functions.ts` — `listBranches`, `createBranch`, `updateBranch`, `archiveBranch`, `setDefaultBranch`

**Financial Year**:
- `src/lib/financial-years/lifecycle.ts`
- `src/lib/financial-years/events.ts`
- `src/lib/financial-years/audit.ts` — `logFinancialYearEventFn`
- `src/lib/financial-years/financial-year.functions.ts` — `listFinancialYears`, `createFinancialYear`, `openFinancialYear`, `closeFinancialYear`, `archiveFinancialYear`, `setDefaultFinancialYear`

Each `*.functions.ts` invokes only the corresponding Phase 1 `private.fn_*` RPCs verified in the repository's Phase 1 lifecycle RPC migration.

## Configuration initialization (SIP-014)

- On successful `activateCompany`, initialize the company-scoped config namespace via the approved settings framework (ENG-005).
- On successful `createBranch`, initialize the branch-scoped namespace via the same framework.
- If the settings framework does not expose a suitable initializer, insert a namespace marker row through its existing API — no new abstraction.
- If neither is possible without schema changes, **stop and report as a blocker** with an ADR recommendation. No schema edits in Phase 2.

## Constraints & Guardrails

- No new DB migrations. No modifications to Phase 1 SQL.
- No direct table mutations for lifecycle transitions — RPCs only.
- Reads shall follow the existing repository pattern (RLS-scoped Supabase client or approved repository abstraction). Do not introduce a new data-access pattern.
- No new event names or payload fields beyond PRD §11.
- No `console.*` debug logging, no TODOs, no dead code.
- Client-safe file placement (`src/lib/**/*.functions.ts`); never import `client.server` at module scope.

## Validation Before Stop

- `bunx tsgo --noEmit` clean.
- Grep: zero hard-coded permission strings in new files; zero direct lifecycle-table mutations (`.insert|update|delete` against `organizations`, `branches`, `financial_years`) outside approved read helpers.
- No circular imports (lifecycle → events → audit → functions is one-way).

## Deliverables at Stop

- File list of the 12 new modules.
- Completed SIP task IDs: SIP-010, SIP-011, SIP-012, SIP-013, SIP-014.
- Validation summary (tsgo + grep results).
- **Repository deviations**: list any unavoidable deviations from SPR-MOD-001-001 patterns with justification. Ideally "none".
- Blockers, if any, with ADR recommendation.
- Recommendations for Phase 3 (UI & RBAC).

**Explicitly out of scope**: UI, nav registry, Playwright, unit/integration tests, Sprint Completion Report, Acceptance Review, Program Status, IMP CHANGELOG, SIP archival.
