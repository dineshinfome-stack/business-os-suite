---
document: Sprint Implementation Plan
sip_id: SIP-SPR-MOD-001-002
sprint_id: SPR-MOD-001-002
module_id: MOD-001
version: 1.0.0
owner: Program Delivery
approver: Architecture Board
authority: Execution / Non-authoritative
lifecycle_state: Draft
---

# SIP-SPR-MOD-001-002 — Organization Structure

> Derived from approved documentation. Introduces no new requirements. Acceptance Criteria (§7) and Out of Scope (§11) are restated **verbatim** from `SPR-MOD-001-002-organization-structure.md`. The event catalog in §4 references PRD §11 as the single source of truth — this SIP is not a second source of truth for events.

## Execution Metadata

```yaml
execution_status: Phase 2 — Approved with Conditions
phase_1_status: Complete
phase_2_status: Approved with Conditions (SIP-014 Deferred)
phase_3_status: Pending closeout acceptance
completion_date:
implemented_by:
reviewed_by: Architecture Board (Phase 2 review — 10/10)
quality_gate: V1–V5 passed (see PHASE2_SPR-MOD-001-002_CLOSEOUT.md)
archive_date:
```

## Deferred Items

| Item | Status | Reason | Resolution Path |
|---|---|---|---|
| SIP-014 — Config namespace initialization on company activation / branch creation via ENG-005 | **Deferred** | ENG-005 exposes no namespace-init primitive and no company- or branch-scoped `setting_definitions` exist. Implementing either requires a schema/catalog change outside Phase 2 scope. | Tracked as an engineering proposal: `docs/30-sprint-prds/engineering/PROPOSAL-settings-namespace-bootstrap.md`. The Architecture Board will decide at intake whether it becomes SPR-ENG-005-001, is folded into another workstream, or is deferred further. No sprint identifier is reserved. |

Phase 3 (UI & RBAC) may proceed. Any UI element that edits company- or branch-scoped settings is out of scope until the settings enhancement lands.



## Evidence

| Field | Value |
|---|---|
| Source | Sprint PRD (approved), MOD-001 Sprint Plan, WEB-001 / MOB-001 / API-001, ADR-011/012/014/051, EEMP Ch 15/17 |
| Path | `docs/30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md` |
| Authority | Approved |
| Reference | PRD §1.2, §5.1–§5.6, §8, §9, §11, §12, §13 |
| Confidence | High |

---

## 1. Sprint Overview

- **Sprint ID:** `SPR-MOD-001-002`
- **Module:** `MOD-001` — Platform Administration
- **Objective:** *Deliver the foundational organizational hierarchy required by every downstream business module. Establish company, branch, and financial-year lifecycles under a tenant; the Tenant → Company → Branch → Financial Year hierarchy; default organization and default financial-year selection; organizational validation rules; org-scoped configuration initialization; audit integration; and the `company.*`, `branch.*`, and `financialyear.*` event contracts on which Accounting, Sales, Purchase, and every subsequent module depends.* (PRD §1.1)
- **Scope:** PRD §1.2 (see §3 below).
- **Dependencies:** `SPR-MOD-001-001` (Done); ENG-001, ENG-004, ENG-005, ENG-024; ADR-011, ADR-012, ADR-014, ADR-051.
- **Expected Duration:** Medium (per MOD-001 Sprint Plan).

## 2. Input Documents

| Document | Path | Version |
|---|---|---|
| Module PRD | `docs/20-module-prds/platform/MODULE_PRD.md` | Approved |
| Web SD | `docs/60-solution-design/web/WEB-001_*.md` | Approved |
| Mobile SD | `docs/60-solution-design/mobile/MOB-001_*.md` | Approved |
| API SD | `docs/60-solution-design/api/API-001_*.md` | Approved |
| Sprint Plan | `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md` | Approved |
| Sprint PRD | `docs/30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md` | Approved |
| ADRs | `docs/11-adrs/**/ADR-011,-012,-014,-051*.md` | Accepted |
| EEMP | `docs/02_Engineering_Execution_Master_Plan/` | v1.0 |
| IMP | `docs/03_Implementation_Master_Plan/` | v1.0.1 |
| Upstream SIP | `docs/05_Sprint_Implementation_Plans/archive/2026/SIP-SPR-MOD-001-001.md` | Archived |

## 3. Implementation Scope

Restated from PRD §1.2 (no expansion):

- Company lifecycle: `create`, `activate`, `deactivate`, `archive`.
- Branch lifecycle: `create`, `update`, `archive`.
- Financial Year lifecycle: `create`, `open`, `close`, `archive`.
- Organizational hierarchy: `Tenant → Company → Branch → Financial Year`.
- Default organization assignment (per-tenant default company / default branch).
- Default financial-year selection (per-company).
- Organizational validation rules (hierarchy integrity, lifecycle preconditions, uniqueness).
- Company metadata (identity, legal name, region, default locale, timezone, plan tier context).
- Branch metadata (identity, address / location fields, operational timezone, activation status).
- Financial-year metadata (label, start / end period, open / closed state).
- Org-scoped configuration initialization via ENG-005 (company- and branch-scoped namespaces only; module-owned keys are not registered here).
- Audit integration for every company / branch / financial-year lifecycle transition via ENG-004.
- Events published as authoritatively defined in PRD §11 (`company.created`, `company.updated`, `company.archived`, `branch.created`, `branch.updated`, `financialyear.created`, `financialyear.opened`, `financialyear.closed`) delivered via ENG-024.

**Implementation reconciliation (mapping only, not a domain change).** The implementation reuses the existing `public.organizations` table to represent the PRD concept of **Company**. Documentation and user-facing surfaces continue to use "Company". Existing `branches` and `financial_years` singletons seeded by SPR-MOD-001-001 are upgraded in place into fully managed lifecycles, preserving identifiers.

**Terminology invariant.** State names, event names, badge labels, RPC names, and test names MUST match PRD/SD wording exactly across DB, backend, UI, events, and tests.

## 4. Development Tasks

Migration filenames use the **next available filename per repository migration numbering convention** — no hard-coded timestamps. RPC names are fully qualified with entity suffix.

| Task ID | Task | Layer | Source Requirement | Status |
|---|---|---|---|---|
| SIP-001 | Migration A — extend `public.organizations` with `lifecycle_state` (`created|active|inactive|archived`), `is_default`, `activated_at/deactivated_at/archived_at`, unique `(tenant_id, slug)`, partial unique default per tenant. Grants + RLS extension. | Database | PRD §5.1, §5.4 | Not Started |
| SIP-002 | Migration A — extend `public.branches` with `lifecycle_state` (`active|archived`), `is_default`, `archived_at`, unique `(organization_id, code)`, partial unique default per organization. Grants + RLS extension. | Database | PRD §5.2, §5.4 | Not Started |
| SIP-003 | Migration A — extend `public.financial_years` with `lifecycle_state` (`created|open|closed|archived`), `is_default`, non-overlap EXCLUDE on `(organization_id, tstzrange(starts_on, ends_on)) WHERE state IN ('created','open')`, partial unique default per organization. Grants + RLS extension. | Database | PRD §5.3, §5.4, R6 | Not Started |
| SIP-004 | Migration B — lifecycle guards: `private.fn_assert_company_lifecycle_transition`, `private.fn_assert_branch_lifecycle_transition`, `private.fn_assert_financial_year_lifecycle_transition` (pure, fixed `search_path`, mirror PRD state matrices). | Database | PRD §5.1–§5.3; ADR-012 | Not Started |
| SIP-005 | Migration B — company RPCs (SECURITY DEFINER, `platform_admin`-gated, idempotent, `FOR UPDATE`, resilient denial logging): `private.fn_create_company`, `fn_activate_company`, `fn_deactivate_company`, `fn_archive_company`, `fn_set_default_company`. `fn_archive_company` rejects when any open FY exists. | Database | PRD §5.1, §5.4 | Not Started |
| SIP-006 | Migration B — branch RPCs: `private.fn_create_branch`, `fn_update_branch`, `fn_archive_branch`, `fn_set_default_branch`. | Database | PRD §5.2, §5.4 | Not Started |
| SIP-007 | Migration B — financial-year RPCs: `private.fn_create_financial_year`, `fn_open_financial_year`, `fn_close_financial_year`, `fn_archive_financial_year`, `fn_set_default_financial_year`. Open transition enforces non-overlap atomically. | Database | PRD §5.3, R6 | Not Started |
| SIP-008 | Migration C — register `platform.company.*`, `platform.branch.*`, `platform.financial_year.*` in `permissions` + `role_permissions`; grant to `platform_admin`. | Database / Security | PRD §5.4; ADR-011 | Not Started |
| SIP-009 | Regenerate `src/lib/generated/permission-keys.ts` via `scripts/generate-permissions.ts`. | Backend | SIP-008 | Not Started |
| SIP-010 | `src/lib/organizations/{lifecycle,events,audit,slug}.ts` — state machine + event builders + audit writer, reusing SPR-001 primitives. Event payloads match PRD §11 exactly. | Backend | PRD §5.1, §5.5, §5.6, §11 | Not Started |
| SIP-011 | `src/lib/organizations/organizations.functions.ts` — `listCompanies`, `createCompany`, `activateCompany`, `deactivateCompany`, `archiveCompany`, `setDefaultCompany` under `requireSupabaseAuth`; Zod validators; idempotent branches. | Backend | PRD §5.1, §5.4 | Not Started |
| SIP-012 | `src/lib/branches/{lifecycle,events,audit}.ts` + `branches.functions.ts` (`listBranches`, `createBranch`, `updateBranch`, `archiveBranch`, `setDefaultBranch`). | Backend | PRD §5.2, §5.4 | Not Started |
| SIP-013 | `src/lib/financial-years/{lifecycle,events,audit,overlap}.ts` + `financial-years.functions.ts` (`listFinancialYears`, `createFinancialYear`, `openFinancialYear`, `closeFinancialYear`, `archiveFinancialYear`, `setDefaultFinancialYear`). | Backend | PRD §5.3, R6 | Not Started |
| SIP-014 | Company-scoped config namespace initialization on activation via ENG-005 (branch-scoped on branch creation). | Backend | PRD §1.2, §5.1 | **Deferred — Architecture Dependency (ENG-005)**. See Deferred Items and `PROPOSAL-settings-namespace-bootstrap.md`. |
| SIP-015 | Extend `/platform/tenants/$tenantId` UI: add Companies tab (DataGrid + create/activate/deactivate/archive/set-default actions gated by `<Can>`), label "Company", status badges match PRD state names. | Frontend | WEB-001; PRD §5.1 | Not Started |
| SIP-016 | Add Company detail route with nested Branches and Financial Years tabs; DataGrids and lifecycle action buttons gated by `<Can>`. | Frontend | WEB-001; PRD §5.2, §5.3 | Not Started |
| SIP-017 | Register nav nodes in `src/lib/navigation/registry.ts` (no new top-level module). | Frontend | WEB-001 | Not Started |
| SIP-018 | Unit tests: lifecycle machines (company, branch, FY), FY overlap helper, default-flag invariant, slug normalization reuse. | Testing | PRD §15 | Not Started |
| SIP-019 | Integration / SQL smoke tests: unique constraints, EXCLUDE constraint, RPC role gate, idempotency, archive-with-open-FY rejection, default uniqueness. | Testing | PRD §15; R6 | Not Started |
| SIP-020 | Server-function tests for Zod validators and error surfaces across company / branch / FY functions. | Testing | PRD §15 | Not Started |
| SIP-021 | Attempt Playwright runtime verification: login → create company → activate → add branch → create FY → open → close. If auth injection unavailable, document limitation transparently (no fabrication) as a sprint-local observation. | Testing | PRD §15 | Not Started |
| SIP-022 | Author event-catalog entries under `docs/70-events/` matching PRD §11 exactly, and API docs under `docs/70-api/` for company / branch / FY. | Documentation | PRD §11 | Not Started |
| SIP-023 | Sprint Completion Report + Acceptance Review + Program Status report + IMP CHANGELOG v1.0.2. Archive SIP per `SIP_LIFECYCLE.md` with §12 populated. Deliverables produced **only after** implementation and tests pass. | Documentation | EEMP Ch 17 | Not Started |

## 5. Repository Impact

- **Files to create:**
  - `supabase/migrations/<next>_organization_lifecycle_schema.sql`
  - `supabase/migrations/<next+1>_organization_lifecycle_rpcs.sql`
  - `supabase/migrations/<next+2>_organization_permissions.sql`
  - `src/lib/organizations/{lifecycle,events,audit,slug,organizations.functions}.ts`
  - `src/lib/branches/{lifecycle,events,audit,branches.functions}.ts`
  - `src/lib/financial-years/{lifecycle,events,audit,overlap,financial-years.functions}.ts`
  - `src/lib/organizations/__tests__/*.test.ts`, `src/lib/branches/__tests__/*.test.ts`, `src/lib/financial-years/__tests__/*.test.ts`
  - Route additions under `src/routes/_authenticated/platform/tenants/$tenantId/` (companies list + detail + nested tabs)
  - `docs/70-events/company-events.md`, `branch-events.md`, `financial-year-events.md`
  - `docs/70-api/companies.md`, `branches.md`, `financial-years.md`
- **Files to modify:**
  - `src/lib/generated/permission-keys.ts` (regenerated)
  - `src/lib/navigation/registry.ts`
  - `src/routes/_authenticated/platform/tenants/$tenantId.tsx`
  - `docs/03_Implementation_Master_Plan/CHANGELOG.md`
- **Components affected:** DataGrid instances for company / branch / FY; `<Can>` gates.
- **Services affected:** `organizations`, `branches`, `financial-years` server functions.
- **APIs affected:** New server-function endpoints (no external HTTP routes).
- **Database objects affected:** `public.organizations`, `public.branches`, `public.financial_years`; new `private.fn_*` lifecycle guards and RPCs; `public.permissions`, `public.role_permissions`.

## 6. Testing Plan

References EEMP Ch 15 — do not restate.

- **Unit tests:** lifecycle state machines, FY overlap, default-flag invariants, slug normalization.
- **Integration tests:** RPC idempotency, unique / EXCLUDE constraints, archive-with-open-FY rejection, RBAC role gate, config-namespace initialization, audit-log emission, event-envelope shape.
- **API tests:** server-function Zod validators, error surfaces, `requireSupabaseAuth` enforcement.
- **UI tests:** Playwright happy-path per SIP-021 (best-effort; document limitations, no fabrication).
- **Security checks:** `supabase--linter` clean except accepted R-074; grants match RLS; SECURITY DEFINER fns have fixed `search_path` and `platform_admin` gate.
- **Regression tests:** full `bunx vitest run` green; SPR-001 tenancy tests still pass.

## 7. Acceptance Criteria

Restated **verbatim** from Sprint PRD §5:

### 5.1 Company creation and lifecycle (US-001, US-002)

- Given a valid company creation request under an active tenant with identity, legal name, region, default locale, and timezone, when a platform admin submits it, then a company record is persisted with a stable, immutable company ID, and its slug / code is unique within the tenant.
- Given a company in `created` state, when a platform admin activates it, then the company transitions to `active`, its company-scoped configuration namespace is initialized via ENG-005, and a `company.created` event is emitted via ENG-024 (if not already emitted at creation) followed by a `company.updated` event reflecting the state change.
- Given an `active` company, when a platform admin deactivates it, then the company transitions to `inactive`, company-scoped writes are blocked in the Platform layer, and a `company.updated` event is emitted.
- Given an `inactive` or `active` company with no dependent open financial years, when a platform admin archives it, then the company transitions to `archived`, all company-scoped writes are blocked, historical reads remain permitted, and a `company.archived` event is emitted.
- Given an attempted archive of a company with an `open` financial year, when the request is submitted, then it is rejected deterministically and no partial state is left behind.

### 5.2 Branch lifecycle (US-003, US-004)

- Given an `active` parent company, when a platform admin creates a branch with identity, address / location, and operational timezone, then a branch record is persisted under that company, its code is unique within the company, and a `branch.created` event is emitted.
- Given an existing branch, when a platform admin updates its metadata, then changes are persisted and a `branch.updated` event is emitted.
- Given a branch with no active downstream dependencies, when a platform admin archives it, then the branch transitions to `archived`, branch-scoped writes are blocked, historical reads remain permitted, and (per §11) a `branch.updated` event reflecting the archival state is emitted.

### 5.3 Financial year lifecycle (US-005)

- Given an `active` parent company, when a platform admin creates a financial year with a label, start period, and end period, then an FY record is persisted, its label is unique within the company, its period range does not overlap another open FY of the same company, and a `financialyear.created` event is emitted.
- Given a financial year in `created` state, when a platform admin opens it, then the FY transitions to `open`, and a `financialyear.opened` event is emitted.
- Given an `open` financial year, when a platform admin closes it, then the FY transitions to `closed`, further postings against it are blocked in the Platform layer, and a `financialyear.closed` event is emitted.
- Given a `closed` financial year, when a platform admin archives it, then the FY transitions to `archived` and historical reads remain permitted.

### 5.4 Hierarchy and defaults (US-006, US-007)

- Given any organizational write in the Platform layer, when it executes, then it is restricted to the caller's tenant scope and the `Tenant → Company → Branch → Financial Year` hierarchy is enforced (no orphan branches, no cross-tenant parents).
- Given a tenant with at least one active company, when a default company is designated, then exactly one company per tenant is marked default, and downstream resolution of "default company" returns that company deterministically.
- Given a company with at least one active branch, when a default branch is designated, then exactly one branch per company is marked default, and downstream resolution returns that branch deterministically.
- Given a company with at least one open financial year, when a default FY is designated, then exactly one FY per company is marked default, and downstream resolution returns that FY deterministically.

### 5.5 Audit integration (US-009)

- Given any organization lifecycle transition (company / branch / FY), when it completes, then an audit record is produced via ENG-004 containing the actor, tenant ID, company / branch / FY ID (as applicable), transition type, and timestamp.

### 5.6 Events (US-008)

- Given an organization lifecycle transition, when it completes, then the corresponding event listed in §11 is published via ENG-024 conforming to that contract.

## 8. Definition of Done

Restated from Sprint PRD §12 with EEMP quality-gate references appended:

- [ ] All acceptance criteria in §7 are met and demonstrated.
- [ ] `company.*`, `branch.*`, and `financialyear.*` events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] The `Tenant → Company → Branch → Financial Year` hierarchy is enforceable on every org-scoped read and write in the Platform layer.
- [ ] Every organization lifecycle transition produces an audit record via ENG-004.
- [ ] Company- and branch-scoped configuration namespaces are initialized on activation via ENG-005.
- [ ] Default company (per tenant), default branch (per company), and default financial year (per company) are resolvable deterministically.
- [ ] Automated tests pass per EEMP Ch 15.
- [ ] Observability signals in place per EEMP Ch 17.
- [ ] `bunx tsgo --noEmit` clean; `bunx vitest run` full green; `supabase--linter` clean except accepted R-074.
- [ ] Sprint status updated in Sprint Catalog and Program Status.
- [ ] No unresolved architectural exceptions.

## 9. Risks and Assumptions

Implementation-specific only (does not alter approved architecture):

- **I-R1.** Existing seeded `branches` / `financial_years` singletons must be back-fitted with `lifecycle_state` and `is_default` without breaking SPR-001 tenancy activation. Mitigation: default `is_default=true` and `lifecycle_state='active'` / `'open'` for existing rows during Migration A.
- **I-R2.** EXCLUDE constraint for FY non-overlap requires `btree_gist`. Mitigation: verify extension present (was added in Sprint 0.2 extensions migration) before shipping Migration A.
- **I-R3.** Idempotent activation/open/close must not re-emit events. Mitigation: guards check current state and return early without event emission.
- **I-R4.** Playwright auth injection may not be available in this environment. Mitigation: document as sprint-local observation per SIP-021; do not fabricate evidence.
- Reference `docs/01-master/risk-register.md` for R-074 (accepted) and prior CFs.

## 10. Execution Checklist

- [ ] Read Sprint PRD end-to-end
- [ ] Read ADR-011, ADR-012, ADR-014, ADR-051
- [ ] Confirm SPR-MOD-001-001 is `Done` (Acceptance Review approved 2026-07-23)
- [ ] Obtain Architecture Board approval of this SIP
- [ ] Execute SIP-001 → SIP-023 in order
- [ ] Run tests per §6 after each layer
- [ ] Verify each Acceptance Criterion (§7)
- [ ] Confirm Definition of Done (§8)
- [ ] Prepare Sprint Completion Report + Acceptance Review
- [ ] Archive SIP per `SIP_LIFECYCLE.md`

## 11. Out of Scope

Restated verbatim from Sprint PRD §1.3:

- User management, roles, permissions, RBAC, authentication, and role assignment to organizations — `SPR-MOD-001-003`.
- Feature administration UI, configuration hierarchy resolution (org / user scope resolution), and feature-flag administration surface — `SPR-MOD-001-004`.
- Localization activation and locale pack administration — `SPR-MOD-001-005`.
- Audit Review UI (search, export, dashboards) — `SPR-MOD-001-006`.
- Advanced company configuration (multi-jurisdiction tax profiles, chart-of-accounts binding, statutory registrations) — owned by Accounting (`MOD-002`) and later modules.
- Inter-company processing (transfers, consolidations, elimination entries) — owned by Accounting (`MOD-002`) and later modules.

## 12. Sprint Outcome

> **Populated at archival only.** Do not edit during the sprint.

```yaml
status:
implemented_tasks:
deferred:
blocked:
known_issues:
lessons_learned:
references:
  sprint_completion_report:
  pull_requests: []
  release_tag:
```
