
# SPR-MOD-001-002 — Organization Structure Implementation (v1.2, frozen)

Execute the approved Sprint PRD scope verbatim: **Company + Branch + Financial Year** lifecycles as one hierarchy. Nothing added, nothing removed. If a genuine architectural gap surfaces mid-sprint, stop and raise an ADR recommendation.

## 0. Preconditions

- Confirm SPR-MOD-001-001 approved (Acceptance Review recorded 2026-07-23; carried-forward observations remain this sprint's responsibility, renumbered under this sprint's own observation series — no assumed CF-1/CF-2 IDs).
- Re-read: `SPR-MOD-001-002-organization-structure.md`, `MOD-001_SPRINT_PLAN.md`, `WEB-001`, `MOB-001`, `API-001`, `ADR-011/012/014/051`, EEMP Ch. 15/17.
- Author `docs/05_Sprint_Implementation_Plans/active/SIP-SPR-MOD-001-002.md` from `SIP_TEMPLATE.md` with SIP-001…SIP-0NN, each tagged to source AC / US and to the event set in PRD §11.
- **Stop after generating the SIP and await Architecture Board approval before beginning implementation.**

## 1. Scope (verbatim from PRD §1.2)

Company lifecycle (create/activate/deactivate/archive); Branch lifecycle (create/update/archive); Financial Year lifecycle (create/open/close/archive); Tenant→Company→Branch→FY hierarchy enforcement; per-tenant default company, per-company default branch, per-company default FY; validation rules (uniqueness, hierarchy integrity, no overlapping open FYs, block archive with open FY); org-scoped configuration namespace init via ENG-005; audit via ENG-004; the `company.*` / `branch.*` / `financialyear.*` event set as authoritatively defined in **PRD §11** — the SIP transcribes that list verbatim (names, count, payloads). This plan is not a second source of truth for events.

Out of scope: users/roles (SPR-003), config admin UI (SPR-004), localization (SPR-005), audit UI (SPR-006), inter-company / tax profile.

## 2. Reconciliation with existing artefacts

Current DB already has `organizations`, `branches`, `financial_years` (Wave 0 + SPR-001). Reconciliation rules:

- **Implementation mapping, not domain change.** The implementation reuses the existing `organizations` table to represent the PRD concept of **Company**. This is an implementation mapping only and does not alter business terminology used in PRDs, Solution Designs, or user-facing surfaces — those continue to say "Company".
- **Extend, don't duplicate.** Add missing lifecycle columns, defaults, uniqueness, and events on `organizations`.
- `branches` and `financial_years` from SPR-001 exist as seeded singletons for tenant activation. This sprint upgrades them from placeholder rows into fully managed lifecycles.
- Terminology (states, event names, badge labels, RPC names, test names) MUST match PRD/SD wording exactly across DB, backend, UI, events, and tests.
- Any structural gap that cannot be resolved without an architectural change → stop and raise an ADR recommendation.

## 3. Database work

Add new migration(s) using the **next available filename per repository migration numbering convention** — do not hard-code timestamps.

1. `organizations`: add `lifecycle_state` (created|active|inactive|archived), `is_default` per tenant, `activated_at/deactivated_at/archived_at`, unique `(tenant_id, slug)`, partial unique `(tenant_id) WHERE is_default`.
2. `branches`: add `lifecycle_state` (active|archived), `is_default` per organization, `archived_at`, unique `(organization_id, code)`, partial unique default per org.
3. `financial_years`: add `lifecycle_state` (created|open|closed|archived), `is_default` per organization, non-overlap exclusion on `(organization_id, tstzrange(starts_on, ends_on)) WHERE state IN ('created','open')`, partial unique default per org.
4. Lifecycle guards (pure, mirror PRD state matrices):
   - `private.fn_assert_company_lifecycle_transition`
   - `private.fn_assert_branch_lifecycle_transition`
   - `private.fn_assert_financial_year_lifecycle_transition`
5. Mutation RPCs (SECURITY DEFINER, `platform_admin` gated, resilient denial logging, `FOR UPDATE`, idempotent) — **fully qualified names**:
   - Company: `fn_create_company`, `fn_activate_company`, `fn_deactivate_company`, `fn_archive_company`, `fn_set_default_company`
   - Branch: `fn_create_branch`, `fn_update_branch`, `fn_archive_branch`, `fn_set_default_branch`
   - FY: `fn_create_financial_year`, `fn_open_financial_year`, `fn_close_financial_year`, `fn_archive_financial_year`, `fn_set_default_financial_year`
   - `fn_archive_company` MUST reject when any open FY exists (PRD §5.1).
6. RLS: extend tenant-scoped policies to new columns; archived rows readable, not writable at Platform layer.
7. Permissions: `platform.company.*`, `platform.branch.*`, `platform.financial_year.*` seeded into `permissions` / `role_permissions`.
8. `public-schema-grants` block applied to every altered/new object.

## 4. Backend (`src/lib/`)

Reuse SPR-001 primitives (lifecycle assertion pattern, `logTenantEventFn`-style audit writer, `buildTenantEvent` shape).

- `src/lib/organizations/{lifecycle,events,audit}.ts` + `*.functions.ts`
- `src/lib/branches/{lifecycle,events,audit}.ts` + `*.functions.ts`
- `src/lib/financial-years/{lifecycle,events,audit,overlap}.ts` + `*.functions.ts`
- Event builders emit exactly the PRD §11 event names/payloads.
- Idempotent branches for repeat activation / open / close / archive.
- Extend `src/lib/generated/permission-keys.ts` via `scripts/generate-permissions.ts`.

## 5. UI (minimal, RBAC-gated)

Extend `/platform/tenants/$tenantId`:

- Companies tab: DataGrid + create/activate/deactivate/archive/set-default actions.
- Company detail: nested Branches tab + Financial Years tab, DataGrids with lifecycle actions gated by `<Can perm="…">`.
- Register nav nodes in `src/lib/navigation/registry.ts`. No new top-level module.
- Status badge terminology matches PRD state names exactly; user-facing labels say "Company".

## 6. Tests

- Unit: lifecycle machines, FY overlap helper, default-flag invariant.
- Integration / SQL smoke: unique constraints, exclusion constraint, RPC role gate, idempotency, archive-with-open-FY rejection.
- Server-function tests: Zod validators, error surfaces.
- Attempt Playwright runtime verification per `browser-use` (login → create company → activate → add branch → create FY → open → close). If auth injection unavailable, document the limitation, do not fabricate, and log as an observation in this sprint's Acceptance Review under a fresh sprint-local observation ID series.

## 7. Quality gates (EEMP Ch. 17)

`bunx tsgo --noEmit` clean · `bunx vitest run` full green · `supabase--linter` clean except accepted R-074 · no new TODOs, no debug logging, no dead code · SIP §12 traceability matrix populated.

## 8. Deliverables (produced **only after implementation and testing complete successfully**)

- Implementation (migrations, lib, functions, UI) and tests.
- `docs/50-audit-reports/SPR_MOD_001_002_ORGANIZATION_STRUCTURE_REPORT.md` — Sprint Completion Report.
- `docs/50-audit-reports/SPR_MOD_001_002_ACCEPTANCE_REVIEW.md`.
- `docs/04_Program_Status/reports/PROGRAM_STATUS_<ts>.md`.
- `docs/03_Implementation_Master_Plan/CHANGELOG.md` entry v1.0.2.
- Archive SIP → `docs/05_Sprint_Implementation_Plans/archive/2026/SIP-SPR-MOD-001-002.md` with §12 populated.
- Event catalog entries under `docs/70-events/` matching PRD §11 exactly; API doc under `docs/70-api/` for company/branch/FY.

No additional framework or governance documents.

## 9. Stop condition

Stop after the Acceptance Review is completed and the Architecture Board decision is recorded. **Do not begin SPR-MOD-001-003 until the decision is `Approve` or `Approve with Conditions`.**

## Technical detail

```text
tenants ── organizations (Company)  ── branches
                          └────────── financial_years
lifecycle guards → private.fn_assert_{company|branch|financial_year}_lifecycle_transition
mutations       → private.fn_{create|activate|deactivate|archive|open|close|update|set_default}_{company|branch|financial_year}
                    (SECURITY DEFINER, platform_admin gated, idempotent, FOR UPDATE)
server fns      → src/lib/{organizations|branches|financial-years}/*.functions.ts  (requireSupabaseAuth)
audit           → public.audit_logs via shared writer  (ENG-004)
events          → PRD §11 catalog, envelopes per ADR-051  (ENG-024)
UI              → /platform/tenants/$tenantId  (Companies / Branches / FYs tabs)
```

## Changes from v1.1

- §2: explicit "implementation mapping, not domain change" note for Company↔organizations.
- §3: RPC names spelled out with entity suffix (`fn_create_company`, etc.).
- §9: stop condition explicitly requires Approve / Approve with Conditions before the next sprint.
- Prompt is **frozen at v1.2** — further refinement is deferred to implementation experience.
