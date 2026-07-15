---
title: "SPR-MOD-008-003 — Statutory Computations"
summary: "Sprint PRD for the Statutory Computations slice of MOD-008 Payroll: Statutory Setup master lifecycle, per-locale statutory component evaluation within a payroll run, statutory report definitions, and wiring of the Module PRD §7 finalization gate on statutory completion. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-008-003"
parent_module: "MOD-008"
parent_sprint_plan: "MOD-008_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "10.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-006", "ENG-012", "ENG-019", "ENG-021", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "payroll", "mod-008", "statutory", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD008-003-20260715T000000Z-001"
parent_result_id: "GT003-MOD008-002-20260714T001400Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-008-003 — Statutory Computations

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-008 Payroll** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-008-003` (permanent) |
| Parent Module | `MOD-008` — Payroll |
| Parent Sprint Plan | [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-008-002`](./SPR-MOD-008-002-payroll-cycles-and-runs.md) (Draft) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) |
| Downstream Sprints | `SPR-MOD-008-005`, `SPR-MOD-008-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver **statutory computations per locale** for MOD-008 Payroll: the **Statutory Setup** master lifecycle (create, edit, archive) scoped by locale via `ENG-006`, per-locale statutory component evaluation within a Payroll Run via `ENG-012` and `ENG-019`, statutory report definitions surfaced through `ENG-021`, and wiring of the Module PRD §7 rule *"A payroll run cannot be finalized until all statutory computations complete."* The rule is enforced at the finalization gate reserved by Sprint 2 (§5.10 of `SPR-MOD-008-002`) without modifying the Payroll Run lifecycle authored there.

> **Payroll Ownership Convention (recapitulated).** The Payroll module owns the business semantics of statutory computations within a Payroll Run, the Statutory Setup master, and statutory report definitions. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, localization, rules, tax, reporting, eventing) but **MUST NOT** redefine Payroll business rules. Employee master, org structure, attendance, and leave remain exclusive to **MOD-007 HRMS** and are consumed read-only. External statutory portals are integration targets only. Reimbursements/advances, payslip issuance, disbursement, posting, and analytics are reserved for later Payroll sprints.

#### 1.1.1 Statutory Setup Authority

The **Statutory Setup** master is authoritatively owned by MOD-008 Payroll. It parameterizes per-locale statutory components; it does not encode legal tax logic beyond configuration parameters. Concrete tax computation semantics are delegated to `ENG-019` Tax under `ENG-006` Localization. No other module MAY create, edit, or archive a Statutory Setup record.

#### 1.1.2 Payroll Run Finalization Gate (Module PRD §7)

Per Module PRD §7 business rule: *"A payroll run cannot be finalized until all statutory computations complete."* This sprint wires that gate against the "awaiting statutory completion" finalization-request state reserved in Sprint 2 (§5.10 of `SPR-MOD-008-002`). The Payroll Run lifecycle authored in Sprint 2 is **not modified**; this sprint adds the completion predicate consumed at that gate.

#### 1.1.3 Payroll ↔ HRMS / External Statutory Portals Boundary

- **MOD-007 HRMS** continues to own Employee master, org structure, attendance, and leave. Statutory evaluations consume Employee attributes read-only through the HRMS baseline read surface.
- **External statutory portals** are business-category external systems (Module PRD §8) and are integration targets for statutory report submission. Submission mechanics (bulk file transport to portals) remain originating-allocated to `SPR-MOD-008-005` per Sprint Plan §2; this sprint defines only the statutory report definitions surfaced through `ENG-021`.

### 1.2 In Scope

- **Statutory Setup** master lifecycle (create, edit, archive) scoped by tenant, company, and locale via `ENG-006`.
- Per-locale statutory component evaluation within a Payroll Run: given a Payroll Run's gross computation (produced by Sprint 2), statutory components resolve deterministically via `ENG-012` Rules and `ENG-019` Tax, using Statutory Setup configuration resolved through `ENG-005`.
- Statutory report definitions (per Module PRD §9 category "Statutory Reports") registered against `ENG-021` Reporting.
- Wiring of the Module PRD §7 finalization gate: a Payroll Run in the Sprint-2 "awaiting statutory completion" state advances to finalized only when all statutory computations for the run complete; the predicate is enforced via `ENG-012`.
- Audit emission via `ENG-004` for every Statutory Setup lifecycle transition and every statutory-evaluation transition within a Payroll Run, per `ADR-014`.
- Authorization via `ENG-002` under `ADR-032` for all statutory-related actions.
- `ENG-024` Eventing is exercised only for internal orchestration; **no new domain events are published by this sprint** (payroll-lifecycle events remain originating-allocated to `SPR-MOD-008-005`).

### 1.3 Out of Scope

- Salary Structure, Component, Bank Mandate, Payroll operations configuration — `SPR-MOD-008-001`.
- Payroll Run transaction lifecycle, input reconciliation, gross computation, approval routing, reversal — `SPR-MOD-008-002`.
- Reimbursement and Advance transaction lifecycles — `SPR-MOD-008-004`.
- Payslip transaction lifecycle, payslip issuance, disbursement file generation, invocation of `ENG-015` Voucher and `ENG-016` Posting, transport to bank/statutory portals — `SPR-MOD-008-005`.
- Payroll read model, dashboards, exports, audit-readiness surface — `SPR-MOD-008-006`.
- Employee master, attendance, and leave — owned by MOD-007.
- Financial postings for statutory obligations — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-008-003`, the following will exist:

- **Business capabilities.**
  - A Payroll administrator can create, edit, and archive Statutory Setup records scoped by (tenant, company, locale), with locale resolved through `ENG-006`.
  - A Payroll Run in the Sprint-2 "awaiting statutory completion" finalization-request state evaluates all applicable statutory components via `ENG-012` and `ENG-019`, resolved against the Statutory Setup applicable to the run's (tenant, company, locale, period) tuple.
  - The Module PRD §7 rule that a payroll run cannot be finalized until all statutory computations complete is enforced deterministically via `ENG-012`.
  - Statutory report definitions (per Module PRD §9) are registered against `ENG-021` for rendering.
- **Configuration artifacts.** Statutory-setup configuration is registered against `ENG-005` under the Payroll configuration namespace registered by Sprint 1; per-locale content packs are activated via `ENG-006` per Module PRD §10.
- **Audit artifacts.** An audit record exists for every Statutory Setup lifecycle transition and every statutory-evaluation transition within a Payroll Run, produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-008-003`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

Sprint 3 publishes **no new domain events** (per Sprint Plan §2 — Payroll-lifecycle domain events are originating-allocated to `SPR-MOD-008-005`). This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-008 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Statutory computations (per locale); submodule Statutory | Statutory Setup master and per-locale statutory evaluation |
| §3 Personas — Payroll Officer, HR, Finance, Auditor | User stories (§4) |
| §5 Master Data — Statutory Setup | Statutory Setup master lifecycle |
| §7 Business Rules — A payroll run cannot be finalized until all statutory computations complete | Finalization gate wired via `ENG-012` |
| §8 Integration Points — Statutory portals (external systems) | Statutory report definitions surfaced through `ENG-021`; portal transport reserved for `SPR-MOD-008-005` |
| §9 Reports & Analytics — Statutory Reports | Statutory report definitions registered against `ENG-021` |
| §10 Configuration — Statutory settings per locale | Locale-scoped configuration via `ENG-005` and `ENG-006` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Payroll Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Statutory computations (per locale) (§2) | `SPR-MOD-008-003` |

This allocation is unique; no other Payroll sprint claims "Statutory computations (per locale)" as an originating capability. The Statutory Setup master (§5) is originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Statutory computations (per locale)* and submodule *Statutory*, §5 master *Statutory Setup*, §7 finalization rule, §8 statutory portals, §9 Statutory Reports, §10 Statutory settings per locale → this Sprint PRD → deliverables in §2 (Statutory Setup lifecycle, per-locale evaluation within a run, finalization gate wiring, statutory report definitions, audit).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Payroll administrator, I want to create, edit, and archive Statutory Setup records scoped by (tenant, company, locale), so that per-locale statutory parameters are governed under the Payroll configuration namespace.*
- **US-002.** *As a Payroll administrator, I want a Payroll Run's applicable statutory components to evaluate deterministically via `ENG-012` and `ENG-019` against the Statutory Setup for the run's locale and period, so that statutory obligations are computed reproducibly.*
- **US-003.** *As a Payroll administrator, I want a Payroll Run in the Sprint-2 "awaiting statutory completion" state to be blocked from finalization until all applicable statutory computations complete, so that Module PRD §7 is enforced.*
- **US-004.** *As an Auditor, I want every Statutory Setup lifecycle transition and every statutory-evaluation transition within a Payroll Run to be audited via `ENG-004`, so that statutory history is fully reconstructible.*
- **US-005.** *As a Finance user, I want statutory report definitions (per Module PRD §9) to be registered against `ENG-021`, so that statutory reports can be rendered from the Payroll read model authored in Sprint 6.*
- **US-006.** *As a Payroll administrator, I want statutory-related actions to be authorized under `ADR-032` via `ENG-002`, so that only entitled users can maintain Statutory Setup and drive statutory evaluations.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Statutory Setup lifecycle (US-001)

- **Given** a valid Statutory Setup creation request for a (tenant, company, locale) tuple where the locale is registered via `ENG-006`,
  **when** a Payroll admin submits it,
  **then** the Statutory Setup is persisted, scoped to that (tenant, company, locale), and the transition is audited via `ENG-004`.
- **Given** an existing Statutory Setup in an active state,
  **when** a Payroll admin edits or archives it,
  **then** the transition succeeds, is audited, and archived records cannot be selected as the applicable setup for a new statutory evaluation.

### 5.2 Statutory component evaluation (US-002)

- **Given** a Payroll Run with completed gross computation (produced by Sprint 2) and a Statutory Setup applicable to the run's (tenant, company, locale, period) tuple,
  **when** statutory evaluation executes,
  **then** each applicable statutory component resolves deterministically via `ENG-012` Rules and `ENG-019` Tax, and each resolved value is persisted and audited.
- **Given** a Statutory Setup archived after the Payroll Run's period start,
  **when** the run evaluates statutory components,
  **then** evaluation uses the setup applicable at the period-start point deterministically, per Sprint 1's configuration hierarchy through `ENG-005`.

### 5.3 Finalization gate (US-003, Module PRD §7)

- **Given** a Payroll Run in the Sprint-2 "awaiting statutory completion" finalization-request state with one or more applicable statutory components not yet evaluated,
  **when** finalization is requested,
  **then** the request is rejected deterministically by `ENG-012` and the run remains in the "awaiting statutory completion" state.
- **Given** a Payroll Run in the Sprint-2 "awaiting statutory completion" finalization-request state with every applicable statutory component evaluated,
  **when** finalization is requested,
  **then** the gate predicate passes via `ENG-012`, the run advances to finalized, and the transition is audited.

### 5.4 Audit integration (US-004)

- **Given** any Statutory Setup lifecycle transition (create, edit, archive) or any statutory-evaluation transition within a Payroll Run,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company/locale scope, statutory-setup or run identifier, transition type, and timestamp.

### 5.5 Statutory report definitions (US-005)

- **Given** the statutory report categories declared in Module PRD §9 ("Statutory Reports"),
  **when** this sprint's registration step runs,
  **then** the corresponding report definitions are registered against `ENG-021` for later rendering (rendering itself is exercised by `SPR-MOD-008-006`).

### 5.6 Authorization (US-006)

- **Given** a statutory-related action (Statutory Setup create/edit/archive, statutory evaluation trigger),
  **when** it is attempted,
  **then** it is authorized via `ENG-002` under the model defined by `ADR-032`; unauthorized attempts are rejected deterministically.

### 5.7 Isolation invariants (`ADR-011`)

- **Given** any Statutory Setup read or write, or any statutory-evaluation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed. Statutory Setup selection during evaluation is restricted to the run's (tenant, company, locale) scope.

### 5.8 Locale coverage (Module PRD §10)

- **Given** a locale registered via `ENG-006`,
  **when** a Statutory Setup for that locale is authored and a Payroll Run for the same locale evaluates statutory components,
  **then** evaluation uses locale-specific parameters resolved via `ENG-006`; no locale-specific parameter is hard-coded outside `ENG-005`/`ENG-006`.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-008` — Payroll.
- **Module PRD:** [`docs/20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Statutory computations per locale; submodule Statutory), §3 (Payroll Officer, HR, Finance, Auditor), §5 (Statutory Setup), §7 (statutory-completion finalization rule), §8 (Statutory portals — external), §9 (Statutory Reports), §10 (Statutory settings per locale), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-008` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) — Employee master consumed read-only for statutory attribute resolution.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-008-002` (Payroll Cycles & Runs) — provides the Payroll Run lifecycle including the "awaiting statutory completion" finalization-request state.
- **Cross-module consumption:** external Statutory portals (per Module PRD §8) — this sprint defines statutory report definitions only; transport is reserved for `SPR-MOD-008-005`.
- **Downstream sprints:** `SPR-MOD-008-005` (Payslip Generation & Disbursement), `SPR-MOD-008-006` (Payroll Analytics & Compliance) — per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.0,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Payroll Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Statutory Setup lifecycle and statutory-evaluation actions per `ADR-032`. |
| `ENG-004` Audit | Records every Statutory Setup lifecycle transition and statutory-evaluation transition per `ADR-014`. |
| `ENG-005` Configuration | Resolves Statutory Setup configuration in the Payroll configuration namespace registered by Sprint 1. |
| `ENG-006` Localization | Scopes Statutory Setup by locale; activates per-locale content packs per Module PRD §10. |
| `ENG-012` Rules | Enforces statutory-completeness predicate (Module PRD §7 finalization gate) and applicability rules for statutory components. |
| `ENG-019` Tax | Evaluates statutory tax components per locale; owns tax computation semantics. |
| `ENG-021` Reporting | Registers statutory report definitions (Module PRD §9 Statutory Reports category); rendering is exercised in `SPR-MOD-008-006`. |
| `ENG-024` Eventing | Exercised for internal orchestration; no new domain events are published by this sprint. |

Payroll business semantics (Statutory Setup master, statutory evaluation gating, statutory report definitions) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Statutory Setup read/write and every statutory-evaluation read/write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for every statutory transition. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to statutory-related actions via `ENG-002`. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Statutory Setup | MOD-008 (this sprint) | Per-locale configuration parameterizing statutory components applicable within a Payroll Run. |
| Statutory Component Evaluation | MOD-008 (this sprint) | Per-Payroll-Run, per-employee resolved statutory component values produced via `ENG-012` and `ENG-019`. |
| Statutory Report Definition | MOD-008 (this sprint) | Definition entries for Module PRD §9 "Statutory Reports" registered against `ENG-021`. |

### 10.2 Relationships

- A **Statutory Setup** is scoped to a (tenant, company, locale) tuple; locale is resolved through `ENG-006`.
- A **Statutory Component Evaluation** references a Payroll Run (owned by Sprint 2), an in-scope employee (HRMS read-only), and the Statutory Setup applicable at the run's period start.
- A **Statutory Report Definition** references one or more Statutory Setup parameters as inputs and is materialized only at rendering time by `ENG-021`.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-008` per the Payroll Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Employee** entity is owned by MOD-007 HRMS and is consumed read-only.
- The **Payroll Run** entity is owned by MOD-008 Payroll and originated in Sprint 2; it is not redefined here.
- Financial-posting entities (vouchers, GL entries) remain owned by MOD-002 Accounting and are not represented here.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

Sprint 3 publishes **no new domain events**. Per Sprint Plan §2, Payroll-lifecycle domain events (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`) are originating-allocated to `SPR-MOD-008-005`. This sprint exercises `ENG-024` only for internal orchestration.

### 11.2 Consumed

Sprint 3 consumes no additional cross-module domain events beyond those already consumed by Sprint 2 for run inputs. Statutory evaluation reads HRMS Employee attributes read-only via the HRMS baseline read surface (not via events). Any event name required by the event catalog contract at execution time that is not present is recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Statutory Setup read/write and every statutory-evaluation read/write.
- [ ] Every Statutory Setup lifecycle transition and every statutory-evaluation transition produces an audit record via `ENG-004`.
- [ ] Per-locale statutory component evaluation is exercised end-to-end via `ENG-012` and `ENG-019` under `ENG-006` locale scoping.
- [ ] The Module PRD §7 finalization gate is enforced end-to-end against the Sprint-2 "awaiting statutory completion" state via `ENG-012`.
- [ ] Statutory report definitions declared in Module PRD §9 are registered against `ENG-021`.
- [ ] Authorization for statutory-related actions is exercised end-to-end via `ENG-002` under `ADR-032`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-008_SPRINT_PLAN.md` §2 (`SPR-MOD-008-003`):

- Statutory Setup master can be maintained per locale via `ENG-006`.
- Statutory components evaluate deterministically within a payroll run via `ENG-012` and `ENG-019`.
- Run finalization is gated on statutory completion per §7 business rule.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 3 depends on `SPR-MOD-008-002` delivering the "awaiting statutory completion" finalization-request state (§5.10 of Sprint 2) unchanged.
  - **Impact:** Any regression in the Sprint-2 Payroll Run lifecycle would break the Sprint-3 finalization gate wiring.
  - **Mitigation:** Treat any regression as a Sprint 2 defect and re-plan; do not modify the Payroll Run lifecycle in this sprint.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Statutory tax semantics per locale are delegated to `ENG-019` under `ENG-006`; this sprint MUST NOT re-encode legal tax logic outside `ENG-019`.
  - **Impact:** Blurring this boundary would fragment tax logic and violate the Payroll Ownership Convention.
  - **Mitigation:** Confine statutory logic to Statutory Setup parameters and `ENG-012` applicability rules; delegate computation to `ENG-019`.
  - **Status:** Accepted

- **Risk ID:** R-03
  - **Description:** External statutory portal transport is originating-allocated to `SPR-MOD-008-005`; this sprint MUST NOT implement portal transport.
  - **Impact:** Portal transport semantics would leak into Sprint 3 if implemented here.
  - **Mitigation:** Confine this sprint to statutory report definitions registered against `ENG-021`; wire portal transport in Sprint 5 via `ENG-023`.
  - **Status:** Accepted

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Locale coverage for statutory computation depends on locale content packs activated via `ENG-006` per Module PRD §10; not every locale in `docs/14-localization/` MAY have a Statutory Setup at execution time.
  - **Impact:** Runs in locales without a Statutory Setup cannot pass the §7 finalization gate.
  - **Mitigation:** Author Statutory Setup entries for every in-scope locale before advancing runs to finalization; escalate missing locales through the localization governance process.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Sprint 3 publishes no new domain events. If future scope requires a `StatutoryComputed` event, it MUST be added through event catalog governance rather than authored here.
  - **Impact:** Publishing an event in this sprint outside catalog governance would violate the FROZEN Wrapper.
  - **Mitigation:** Defer any new event to a governance pass; keep `ENG-024` usage internal-orchestration only.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Statutory Setup lifecycle invariants; applicability rules for statutory components; §7 finalization-gate predicate; locale-scoped selection of Statutory Setup.
- **Integration** — `ENG-002` authorization on statutory actions; `ENG-004` audit emission on every transition; `ENG-005` configuration resolution; `ENG-006` locale activation; `ENG-012` rule enforcement; `ENG-019` tax evaluation; `ENG-021` statutory report definition registration.
- **Contract** — HRMS baseline read surface for Employee statutory attributes; Module PRD §9 statutory report categories.
- **End-to-end (smoke)** — Statutory Setup create → Payroll Run statutory evaluation → §7 finalization-gate pass and fail paths, under a two-tenant / two-locale smoke fixture to verify `ADR-011` isolation and `ENG-006` locale scoping.

Sprint-specific fixtures: a two-locale smoke fixture, a Statutory Setup fixture per locale, and a Payroll Run fixture in the Sprint-2 "awaiting statutory completion" state.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling statutory-component evaluation as an idempotent projection keyed by `(run_id, employee_id, statutory_component_id)` so replays under `ENG-014` scheduler windows do not double-count.
- Consider snapshotting the applicable Statutory Setup at Payroll Run period start so that mid-period edits to Statutory Setup do not retroactively alter an evaluated run.
- Consider co-locating the §7 finalization-gate predicate with the Payroll Run reversal-rule predicate (Sprint 2) inside `ENG-012` so both rules share a single evaluation surface.
- Consider registering statutory report definitions against `ENG-021` behind a stable definition identifier so `SPR-MOD-008-006` rendering pipelines resolve them by identifier rather than by name.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-008-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver statutory computations per locale, including Statutory Setup master, per-locale evaluation, statutory report definitions, and the Module PRD §7 finalization gate wiring (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-008 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Payroll Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation (Sprint 1), cycles & runs (Sprint 2), reimbursements/advances (Sprint 4), payslips/disbursement (Sprint 5), analytics (Sprint 6), HRMS-owned entities, financial postings, and identity/permissions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-008-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-008-004` Reimbursements & Advances is the immediate successor per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-008-001` and `SPR-MOD-008-002`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-008-002-payroll-cycles-and-runs.md`](./SPR-MOD-008-002-payroll-cycles-and-runs.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- Authoritative Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
