---
document: Sprint Implementation Plan
sip_id: SIP-SPR-MOD-001-001
sprint_id: SPR-MOD-001-001
module_id: MOD-001
version: 1.0.0
owner: Program Delivery
approver: Architecture Board
authority: Execution / Non-authoritative
lifecycle_state: Draft
---

# SIP-SPR-MOD-001-001 — Tenancy Foundation

> Execution artifact. Non-authoritative. Derived from approved PRD, Solution Designs, Sprint Plan, ADRs, EEMP, and IMP. Introduces no new requirements, features, or architectural decisions. Acceptance Criteria (§7) are restated **verbatim** from the Sprint PRD.

## Execution Metadata

```yaml
execution_status: Draft
completion_date:
implemented_by:
reviewed_by:
quality_gate:
archive_date:
```

## Evidence

| Field | Value |
|---|---|
| Source | Sprint PRD `SPR-MOD-001-001`, Module PRD `MOD-001`, Sprint Plan `MOD-001_SPRINT_PLAN.md`, Solution Designs WEB/MOB/API-001, ADRs 001/005/007/011/012/014/051 |
| Path | see §2 Input Documents |
| Authority | Approved / Accepted |
| Reference | Sprint PRD §1–§15; Sprint Plan §2 (SPR-MOD-001-001) |
| Confidence | High |

---

## 1. Sprint Overview

- **Sprint ID:** `SPR-MOD-001-001`
- **Module:** `MOD-001` — Platform Administration
- **Objective:** Establish the **tenant** as the primary isolation unit of the BusinessOS platform. Deliver tenant lifecycle (create, activate, suspend, archive), stable tenant identity and metadata, initial organization bootstrap, tenant isolation enforcement, audit integration, tenant-scoped configuration and feature-flag initialization, and the `tenant.*` event contracts on which every downstream module depends. *(Sprint PRD §1.1)*
- **Scope:** In-scope items per Sprint PRD §1.2; explicit exclusions per §11 below.
- **Dependencies:** None upstream (first authored sprint). Engines: `ENG-001`, `ENG-002`, `ENG-004`, `ENG-005`, `ENG-024`. ADRs: `ADR-011`, `ADR-012`, `ADR-014`, `ADR-051`. Platform foundation from Wave 0 (multi-tenancy, RBAC, Settings, Audit) is a working prerequisite.
- **Expected Duration:** Medium (per Sprint PRD frontmatter and Sprint Plan §2).

## 2. Input Documents

| Document | Path | Version / Status |
|---|---|---|
| Module PRD | `docs/20-module-prds/platform/MODULE_PRD.md` | Approved |
| Sprint Plan | `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md` | Approved (Stage 1) |
| Sprint PRD | `docs/30-sprint-prds/platform/SPR-MOD-001-001-tenancy-foundation.md` | Draft (per §Frontmatter) — approved for execution |
| Web SD | `docs/60-solution-design/web/WEB-001_PLATFORM_ADMINISTRATION.md` | Approved |
| Mobile SD | `docs/60-solution-design/mobile/MOB-001_PLATFORM_ADMINISTRATION.md` | Approved |
| API SD | `docs/60-solution-design/api/API-001_PLATFORM_ADMINISTRATION.md` | Approved |
| ADR-001 Modular Monolith | `docs/11-adrs/architecture/ADR-001-modular-monolith.md` | Accepted |
| ADR-005 Clean Architecture | `docs/11-adrs/architecture/ADR-005-clean-architecture.md` | Accepted |
| ADR-007 Core ERP Boundaries | `docs/11-adrs/architecture/ADR-007-core-erp-module-boundaries.md` | Accepted |
| ADR-011 Multi-Tenant Isolation | `docs/11-adrs/` (referenced) | Accepted |
| ADR-012 Tenant Lifecycle | `docs/11-adrs/` (referenced) | Accepted |
| ADR-014 Audit Strategy | `docs/11-adrs/` (referenced) | Accepted |
| ADR-051 Event Contracts | `docs/11-adrs/` (referenced) | Accepted |
| EEMP | `docs/02_Engineering_Execution_Master_Plan/` | v1.0 Published |
| IMP | `docs/03_Implementation_Master_Plan/` | v1.x Living |
| Program Status Baseline | `docs/04_Program_Status/reports/PROGRAM_STATUS_BASELINE_20260723T165339Z.md` | Issued |

## 3. Implementation Scope

Restated from Sprint PRD §1.2 (In Scope):

- Tenant lifecycle transitions: `create`, `activate`, `suspend`, `archive`.
- Tenant identity: stable tenant ID, slug, display name.
- Tenant metadata: region, default locale, timezone, plan tier.
- Initial organization bootstrap: one seed company, one default branch, one placeholder default financial-year record — created atomically with `tenant.activated`.
- Tenant isolation enforcement per `ADR-011` (consumed, not redefined).
- Audit integration for every tenant lifecycle transition via `ENG-004`.
- Tenant-scoped configuration initialization via `ENG-005` (platform → tenant scope only).
- Feature-flag namespace initialization for the new tenant via `ENG-005` (bootstrap only).
- Events: `tenant.created`, `tenant.activated`, `tenant.suspended`, `tenant.archived` via `ENG-024`.

## 4. Development Tasks

Every task carries a stable `Task ID` (`SIP-###`) and a `Source Requirement`.

| Task ID | Task | Layer | Source Requirement | Status |
|---|---|---|---|---|
| SIP-001 | Model tenant conceptual entity (id, slug, display name, region, default_locale, timezone, plan_tier, lifecycle_state) | Database / Backend | PRD-PLT §5 Tenant; SPR-MOD-001-001 §1.2, §10.1 | Not Started |
| SIP-002 | Enforce tenant slug uniqueness and immutable tenant ID | Database / Backend | SPR-MOD-001-001 §5.1 AC-1 | Not Started |
| SIP-003 | Implement tenant lifecycle state machine (`created → active → suspended → archived`) per ADR-012 | Backend | ADR-012; SPR-MOD-001-001 §5.2–§5.4 | Not Started |
| SIP-004 | Atomic seed bootstrap: one company + one default branch + one placeholder financial-year record on activation | Backend / Database | SPR-MOD-001-001 §5.1 AC-2, §10.2, R5 | Not Started |
| SIP-005 | Deterministic validation and rejection with no partial state on duplicate slug or invalid metadata | Backend | SPR-MOD-001-001 §5.1 AC-3 | Not Started |
| SIP-006 | Guard invalid lifecycle transitions (reject `activate` on already-active/suspended/archived tenants; no event emitted) | Backend | SPR-MOD-001-001 §5.2 AC-2 | Not Started |
| SIP-007 | Enforce tenant isolation invariants on every tenant-scoped read/write in the Platform layer per ADR-011 | Backend / Database (RLS) | ADR-011; SPR-MOD-001-001 §5.5 | Not Started |
| SIP-008 | Deny cross-tenant access and emit an audit record on denial | Backend / Security | SPR-MOD-001-001 §5.5 AC-2 | Not Started |
| SIP-009 | Integrate `ENG-004` audit for every lifecycle transition (actor, tenant ID, transition, timestamp) | Backend | ENG-004; SPR-MOD-001-001 §5.6, §8 | Not Started |
| SIP-010 | Initialize tenant-scoped configuration namespace via `ENG-005` on activation | Backend | ENG-005; SPR-MOD-001-001 §5.2 AC-1, §8 | Not Started |
| SIP-011 | Initialize tenant-scoped feature-flag namespace via `ENG-005` on activation | Backend | ENG-005; SPR-MOD-001-001 §1.2, §8 | Not Started |
| SIP-012 | Publish `tenant.created` via `ENG-024` on create, per ADR-051 envelope | Backend / Eventing | ADR-051; SPR-MOD-001-001 §5.7, §11 | Not Started |
| SIP-013 | Publish `tenant.activated` via `ENG-024` on activation | Backend / Eventing | ADR-051; SPR-MOD-001-001 §5.7, §11 | Not Started |
| SIP-014 | Publish `tenant.suspended` via `ENG-024` on suspension | Backend / Eventing | ADR-051; SPR-MOD-001-001 §5.7, §11 | Not Started |
| SIP-015 | Publish `tenant.archived` via `ENG-024` on archival | Backend / Eventing | ADR-051; SPR-MOD-001-001 §5.7, §11 | Not Started |
| SIP-016 | Register `tenant.*` events in the event catalog | Documentation / Eventing | SPR-MOD-001-001 §11; DoD | Not Started |
| SIP-017 | Expose platform-admin API endpoints for create / activate / suspend / archive | API | API-001; SPR-MOD-001-001 §5.1–§5.4 | Not Started |
| SIP-018 | Web UI: Platform Admin tenant list + create/activate/suspend/archive flows | Frontend | WEB-001; SPR-MOD-001-001 §5.1–§5.4 | Not Started |
| SIP-019 | Mobile: verify tenant context propagation (read-only surface for this sprint) | Mobile | MOB-001; SPR-MOD-001-001 §1.2 | Not Started |
| SIP-020 | Propagate tenant context on every downstream Platform-layer request path | Backend / Infrastructure | SPR-MOD-001-001 §13 exit criterion 2 | Not Started |
| SIP-021 | Observability signals per platform observability standard | Backend / Infrastructure | SPR-MOD-001-001 §12 DoD | Not Started |
| SIP-022 | Unit + integration + isolation smoke fixture tests | Testing | SPR-MOD-001-001 §12 DoD, §13 exit criterion 4 | Not Started |
| SIP-023 | Update Sprint Catalog and MOD-001 README status | Documentation | SPR-MOD-001-001 §12 DoD | Not Started |

## 5. Repository Impact

Expectation only — no code produced by this SIP.

- **Files to create:** new migration(s) for `tenants` and bootstrap tables; server functions for tenant lifecycle; API route(s); event publisher wiring; Platform Admin route(s) under `src/routes/_authenticated/`; RLS policies; audit hooks; event catalog entries.
- **Files to modify:** organization context helpers (`src/lib/tenancy/*`), settings resolution to add tenant-scope defaults, navigation registry (Platform Admin section), permission catalog manifest.
- **Components affected:** Platform Admin (Web), OrgProvider/OrgSwitcher, DataGrid list view.
- **Services affected:** `ENG-001`, `ENG-002`, `ENG-004`, `ENG-005`, `ENG-024`.
- **APIs affected:** new tenant lifecycle endpoints (create, activate, suspend, archive, list, get).
- **Database objects affected:** `tenants` table + lifecycle columns; seed `companies`, `branches`, `financial_years` (placeholder); RLS policies keyed on tenant; audit table entries.

## 6. Testing Plan

References EEMP Ch 15 — not restated.

- **Unit tests:** validators (slug, metadata), lifecycle state-machine guards, event-payload builders.
- **Integration tests:** create → activate flow with atomic seed bootstrap; suspend/archive guards; audit record produced per transition; config + flag namespace initialization.
- **API tests:** contract tests for every lifecycle endpoint; error paths (duplicate slug, invalid state transitions).
- **UI tests:** Platform Admin tenant list, create modal, lifecycle action modals.
- **Security checks:** RLS smoke fixture per ADR-011 (SPR §13 exit criterion 4); cross-tenant denial produces audit record.
- **Regression tests:** existing Wave 0 org/multi-tenancy tests remain green (17/17 baseline).

## 7. Acceptance Criteria

Restated **verbatim** from Sprint PRD §5.

### 5.1 Tenant creation (US-001, US-002)

- **Given** a valid tenant creation request with identity, slug, region, default locale, timezone, and plan tier, **when** a platform admin submits it, **then** a tenant record is persisted with a stable, immutable tenant ID, and its slug is unique across the platform.
- **Given** a successful tenant creation, **when** the transaction completes, **then** exactly one seed company, one default branch, and one placeholder default financial year record are created and associated with the tenant.
- **Given** a duplicate slug or invalid metadata, **when** the request is submitted, **then** the request is rejected with a deterministic validation outcome and no partial tenant state is left behind.

### 5.2 Tenant activation (US-003)

- **Given** a tenant in `created` state, **when** a platform admin activates it, **then** the tenant transitions to `active`, its configuration and feature flag namespaces are initialized via `ENG-005`, and a `tenant.activated` event is emitted via `ENG-024`.
- **Given** a tenant already in `active`, `suspended`, or `archived` state, **when** activation is attempted, **then** the attempt is rejected deterministically without emitting an event.

### 5.3 Tenant suspension (US-004)

- **Given** an `active` tenant, **when** a platform admin suspends it, **then** the tenant transitions to `suspended`, tenant-scoped writes are blocked in the Platform layer, and a `tenant.suspended` event is emitted via `ENG-024`.

### 5.4 Tenant archival (US-005)

- **Given** a `suspended` or `active` tenant, **when** a platform admin archives it, **then** the tenant transitions to `archived`, all tenant-scoped writes are blocked, historical reads remain permitted, and a `tenant.archived` event is emitted via `ENG-024`.

### 5.5 Isolation invariants (`ADR-011`)

- **Given** any tenant-scoped read or write in the Platform layer, **when** it executes, **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.
- **Given** an attempted cross-tenant access, **when** it occurs, **then** it is denied and an audit record is produced.

### 5.6 Audit integration (US-007)

- **Given** any tenant lifecycle transition (`create`, `activate`, `suspend`, `archive`), **when** it completes, **then** an audit record is produced via `ENG-004` containing the actor, tenant ID, transition type, and timestamp.

### 5.7 Events (US-006)

- **Given** a tenant lifecycle transition, **when** it completes, **then** the corresponding `tenant.*` event is published via `ENG-024` conforming to the contract listed in Sprint PRD §10 / §11.

## 8. Definition of Done

Restated from Sprint PRD §12, plus EEMP Ch 14 quality-gate reference:

- [ ] All acceptance criteria in §7 are met and demonstrated.
- [ ] `tenant.*` events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every tenant-scoped read and write in the Platform layer.
- [ ] Every tenant lifecycle transition produces an audit record via `ENG-004`.
- [ ] Tenant-scoped configuration and feature flag namespaces are initialized on activation via `ENG-005`.
- [ ] Automated tests exist and pass per the authoritative testing standard (EEMP Ch 15; `docs/02-architecture/testing-strategy.md`).
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in `docs/SPRINT_CATALOG.md` and in `docs/30-sprint-prds/platform/README.md`.
- [ ] EEMP AI Quality Gates (Ch 14) satisfied.
- [ ] No unresolved architectural exceptions.

Sprint Exit Criteria (Sprint PRD §13, verbatim):

- A tenant can be created, suspended, and archived through the platform admin surface.
- Tenant context is present on every subsequent request path in the platform layer.
- Every tenant lifecycle transition emits an audit record via `ENG-004`.
- `ADR-011` isolation invariants (row-level scoping or equivalent) are verified against a smoke fixture.

## 9. Risks and Assumptions

Implementation-specific — carries forward Sprint PRD §14 without modification and adds one execution-time assumption:

- **R1 — Downstream deferrals hold.** Users, RBAC, org hierarchy, config resolution, localization, and audit UI are deferred to SPR-002…006.
- **R2 — Bootstrap placeholders are placeholders.** SPR-002 upgrades the seed company / branch / FY.
- **R3 — ADR acceptance.** ADR-011/012/014/051 remain Accepted.
- **R4 — Event delivery.** `ENG-024` delivery guarantees (per ADR-051) hold.
- **R5 — Bootstrap atomicity.** Non-atomic implementation paths are rejected; the acceptance criterion is not weakened.
- **R6 — Wave 0 primitives.** Multi-tenancy, RBAC, and audit foundations delivered in Sprints 0.4–0.9 are treated as prerequisites, not re-implemented.
- **R7 — Accepted Risk R-074.** Leaked-password protection remains disabled per `docs/01-master/risk-register.md`; unchanged by this sprint.

## 10. Execution Checklist

- [ ] Read Sprint PRD `SPR-MOD-001-001` end-to-end.
- [ ] Read ADR-011, ADR-012, ADR-014, ADR-051.
- [ ] Confirm Wave 0 (Sprints 0.4–0.9) primitives are in place.
- [ ] Execute Development Tasks SIP-001 → SIP-023 in order (or per dependency).
- [ ] Run tests per §6 and confirm green.
- [ ] Verify each Acceptance Criterion in §7.
- [ ] Confirm Definition of Done and Exit Criteria in §8.
- [ ] Prepare Sprint Completion Report.
- [ ] Archive this SIP per `SIP_LIFECYCLE.md` (copy to `archive/2026/`, populate §12).

## 11. Out of Scope

Restated from Sprint PRD §1.3:

- User management, invitations, and identity federation — deferred to `SPR-MOD-001-003`.
- Roles, permissions, and access checks — deferred to `SPR-MOD-001-003`.
- Organization / company / branch hierarchy management beyond the seed bootstrap — deferred to `SPR-MOD-001-002`.
- Configuration hierarchy resolution (org / user scopes) and feature-flag administration UI — deferred to `SPR-MOD-001-004`.
- Localization pack administration — deferred to `SPR-MOD-001-005`.
- Audit review, search, and export surface — deferred to `SPR-MOD-001-006`.

## 12. Sprint Outcome

> **Populated at archival only. Do not edit during the sprint.**

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
