---
title: "SPR-MOD-007-002 — Employment Lifecycle (Hire & Exit)"
summary: "Sprint PRD for the HRMS Employment Lifecycle: Onboarding Task and Exit Clearance transactions, approvals routing, HR letters, employment attachments, and publication of EmployeeHired / EmployeeExited events."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-14"
sprint_id: "SPR-MOD-007-002"
parent_module: "MOD-007"
parent_sprint_plan: "MOD-007_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "9.3.1"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-023", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "hrms", "mod-007", "employment-lifecycle", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_wrapper_version: "1.0"
execution_wrapper_compatibility: ">=1.0,<2.0"
execution_id: "GT003-MOD007-002-20260714T000500Z-001"
parent_execution_id: "GT003-MOD007-001-20260714T000400Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per Wrapper v1.0 Snapshot Freeze>"
---

# SPR-MOD-007-002 — Employment Lifecycle (Hire & Exit)

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-007 HRMS** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0). Executed under the FROZEN GT-003 Execution Wrapper v1.0. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-007-002` (permanent) |
| Parent Module | `MOD-007` — HRMS |
| Parent Sprint Plan | [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-007-001`](./SPR-MOD-007-001-hrms-foundation-employee-master.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-007-003` … `SPR-MOD-007-006` (Analytics consumes attrition metrics via `SPR-MOD-007-006`) |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |
| Execution Wrapper | v1.0 (FROZEN) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Hire-to-onboard** and **Exit** business processes for MOD-007 HRMS: the **Onboarding Task** and **Exit Clearance** transaction lifecycles, approvals routing (via `ENG-010` / `ENG-011`), HR letter generation (via `ENG-007`), employment attachments (via `ENG-008`), background-verification external integration (via `ENG-023`), and publication of the `EmployeeHired` and `EmployeeExited` domain events on `ENG-024`. This sprint consumes — but does not redefine — the Employee master and org-structure masters authored in `SPR-MOD-007-001`.

> **HRMS Ownership Convention (inherited from `SPR-MOD-007-001` §1.1).** MOD-007 HRMS owns the business semantics of employment lifecycle transactions (Onboarding Task, Exit Clearance) and the HR letters attached to them. ERP Core Engines provide shared infrastructure (authorization, workflow, approval, rules, automation, document, attachment, integration, eventing, notification) but MUST NOT redefine HRMS business rules. Payroll processing (earnings, deductions, pay runs, statutory filings) remains exclusive to **MOD-008 Payroll**; financial postings for HR-originating obligations (including full-and-final settlement journal entries) remain exclusive to **MOD-002 Accounting**; identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**.

#### 1.1.1 Employment Lifecycle Authority

The **Onboarding Task** and **Exit Clearance** transactions are authoritatively owned by MOD-007 HRMS. No other module MAY create, edit, complete, or independently maintain a parallel Onboarding or Exit Clearance transaction. Downstream modules consume these lifecycles via `EmployeeHired` / `EmployeeExited` events and read APIs; they MUST NOT redefine those transactions, their approvals, or their state machines.

#### 1.1.2 HRMS ↔ Payroll and Accounting Boundary (Full-and-Final Settlement)

- **Full-and-final (F&F) settlement financial computation and posting** are owned by MOD-008 Payroll (computation) and MOD-002 Accounting (posting via `ENG-015` / `ENG-016`).
- This sprint publishes `EmployeeExited` and completes the HRMS-side Exit Clearance workflow; it does **not** compute F&F earnings, deductions, or write journal entries. Downstream MOD-008 / MOD-002 sprints react to `EmployeeExited` to perform settlement.

#### 1.1.3 HRMS ↔ Identity Boundary

MOD-001 Platform owns Identity. This sprint MAY trigger identity provisioning or deprovisioning via `ENG-023` integration and notification (`ENG-025`) but MUST NOT mint credentials, edit permissions, or redefine the Identity contract.

### 1.2 In Scope

- **Onboarding Task transaction lifecycle:** create Draft → route through approval hierarchy → Complete; supports task-checklist semantics scoped to the transaction (offer acceptance, ID collection, background verification launch, appointment letter dispatch, first-day readiness).
- **Exit Clearance transaction lifecycle:** create Draft → route through approval hierarchy → Complete; supports task-checklist semantics scoped to the transaction (asset recovery, knowledge transfer sign-off, notice-period reconciliation reference, exit letter dispatch). Notice-period configuration is *resolved* from HRMS configuration authored in Sprint 1 (`ENG-005`); *enforcement* is delegated to `ENG-012` rules registered here.
- **Approvals routing** via `ENG-010` Workflow + `ENG-011` Approval, using approval hierarchies registered in `SPR-MOD-007-001` (`ENG-005`).
- **HR letters** (offer letter, appointment letter, exit letter) generated via `ENG-007` Document and attached to the parent Onboarding Task or Exit Clearance transaction via `ENG-008` Attachment.
- **Employment attachments** — background-verification results, identity documents, exit-checklist attachments — via `ENG-008`.
- **Background-verification external integration** via `ENG-023` Integration; verification results are captured as attachments via `ENG-008`.
- **Rule enforcement** via `ENG-012` — including "an employee cannot approve their own onboarding or exit" and "notice-period reference on Exit Clearance MUST resolve deterministically against HRMS configuration".
- **Automation** via `ENG-013` for deterministic follow-on actions (e.g. auto-attach appointment letter on Onboarding Task Complete).
- **Notification** via `ENG-025` for approver assignment, task completion, and event fan-out.
- **Domain events published** via `ENG-024`:
  - `EmployeeHired` — emitted on Onboarding Task Complete.
  - `EmployeeExited` — emitted on Exit Clearance Complete.
- **Audit integration** via `ENG-004` for every Onboarding Task / Exit Clearance / letter / attachment lifecycle transition.

### 1.3 Out of Scope

Reserved for later HRMS sprints (see [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md)) or other modules:

- Attendance capture, Leave Type master, Leave Request transaction, leave balances, biometric ingestion — `SPR-MOD-007-003`.
- Appraisal transaction lifecycle, appraiser routing, ratings capture — `SPR-MOD-007-004`.
- Learning & Development, Employee Self-Service surfaces — `SPR-MOD-007-005`.
- HR read model, HR reports, dashboards, exports, audit-readiness surface — `SPR-MOD-007-006` (attrition analytics consumes `EmployeeExited` from this sprint).
- **Payroll processing**, including F&F earnings/deductions and payslip issuance — owned by **MOD-008 Payroll**.
- **Financial postings**, including F&F settlement journal entries — owned by **MOD-002 Accounting** via `ENG-015` / `ENG-016`.
- **Identity provisioning / deprovisioning** — owned by **MOD-001 Platform**; this sprint MAY trigger it via `ENG-023` / `ENG-025` but does not implement it.
- Editing or redefining any master authored in `SPR-MOD-007-001` (Employee, Position, Department, Grade, Shift, HRMS configuration).

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-007-002`, the following will exist:

- **Business capabilities.**
  - An HR administrator can create an Onboarding Task against an existing Employee record, route it through the approval hierarchy, complete it, and observe the emission of `EmployeeHired`.
  - An HR administrator can create an Exit Clearance against an existing Employee record, route it through the approval hierarchy, complete it, and observe the emission of `EmployeeExited`.
  - Approvers cannot approve their own Onboarding or Exit Clearance transactions (`ENG-012` rule).
  - Notice-period references on Exit Clearance resolve deterministically against HRMS configuration authored in `SPR-MOD-007-001`.
  - Background-verification integrations are invoked via `ENG-023`, and their results are attached to the Onboarding Task via `ENG-008`.
  - HR letters (offer, appointment, exit) are generated via `ENG-007` and attached via `ENG-008`.
- **Event contracts.** `EmployeeHired` and `EmployeeExited` are published via `ENG-024` per the authoritative event catalog. Payload shape, envelope, and delivery guarantees are governed by [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).
- **Audit artifacts.** Every Onboarding Task / Exit Clearance / letter / attachment lifecycle transition produces an audit record via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-007-002`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

---

## 3. Traceability to Module PRD

| MOD-007 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Onboarding and offboarding | Onboarding Task and Exit Clearance lifecycles |
| §3 Personas — HR Business Partner, HR Manager, Employee, Manager | User stories (§4) |
| §4 Business Processes — Hire-to-onboard, Exit | Onboarding Task / Exit Clearance state machines and approvals |
| §6 Transactions — Onboarding Task, Exit Clearance | Both transactions authored here |
| §7 Business Rules — self-approval prohibition, notice-period reference | Rules registered via `ENG-012` |
| §8 Integration Points — `EmployeeHired`, `EmployeeExited` (published); Background verification (external) | Events published via `ENG-024`; BV via `ENG-023` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved HRMS Module PRD.**

### 3.1 Capability Allocation Compliance

Per [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) §4.1:

| Capability | Origin Sprint |
| --- | --- |
| Onboarding and offboarding (§2) | `SPR-MOD-007-002` |

Onboarding Task and Exit Clearance transactions are each originating-allocated to this sprint per Sprint Plan §4.3. `EmployeeHired` and `EmployeeExited` are originating-allocated event contracts per Sprint Plan §4 / §8.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Onboarding and offboarding* → this Sprint PRD → deliverables in §2 (Onboarding Task lifecycle, Exit Clearance lifecycle, HR letters, attachments, background-verification integration, `EmployeeHired` / `EmployeeExited` events, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an HR administrator, I want to create an Onboarding Task against an existing Employee record, route it through the approval hierarchy, and complete it, so that hires are onboarded deterministically and downstream modules observe `EmployeeHired`.*
- **US-002.** *As an HR administrator, I want to attach background-verification results and generated HR letters (offer, appointment) to the Onboarding Task, so that hire artifacts are traceable against the employment relationship.*
- **US-003.** *As an HR administrator, I want to create an Exit Clearance against an existing Employee record, route it through the approval hierarchy, and complete it, so that exits are processed deterministically and downstream modules observe `EmployeeExited`.*
- **US-004.** *As an HR administrator, I want the exit letter and exit-checklist attachments recorded against the Exit Clearance transaction, so that exit artifacts are traceable.*
- **US-005.** *As an approver, I want to be blocked from approving my own Onboarding Task or Exit Clearance transaction, so that segregation of duties is preserved.*
- **US-006.** *As an HR administrator, I want notice-period references on Exit Clearance to resolve against HRMS configuration authored in Sprint 1, so that exit approvals are aligned with configured company policy.*
- **US-007.** *As a security reviewer, I want every Onboarding Task, Exit Clearance, letter, and attachment lifecycle transition to be audited via `ENG-004`, so that I can reconstruct hire and exit history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Onboarding Task (US-001, US-002)

- **Given** an active Employee record and a registered approval hierarchy under the same company,
  **when** an HR admin creates an Onboarding Task,
  **then** the transaction is persisted in `Draft`, routed through the configured approval hierarchy via `ENG-010` / `ENG-011`, and audited.
- **Given** an Onboarding Task in the approved terminal state,
  **when** it is completed,
  **then** `EmployeeHired` is published via `ENG-024` per the authoritative event catalog and audited.
- **Given** background-verification results returned by an external provider,
  **when** the integration webhook / callback is received via `ENG-023`,
  **then** the results are attached to the Onboarding Task via `ENG-008` and audited.
- **Given** an Onboarding Task in `Draft` or later,
  **when** an offer letter or appointment letter is generated,
  **then** the letter is produced via `ENG-007` and attached via `ENG-008`.

### 5.2 Exit Clearance (US-003, US-004, US-006)

- **Given** an active Employee record and a registered approval hierarchy under the same company,
  **when** an HR admin creates an Exit Clearance,
  **then** the transaction is persisted in `Draft`, routed through the configured approval hierarchy via `ENG-010` / `ENG-011`, and audited.
- **Given** an Exit Clearance with a notice-period reference,
  **when** the transaction is validated,
  **then** the reference resolves deterministically against HRMS configuration authored in `SPR-MOD-007-001` via `ENG-005`; unresolved references reject deterministically per `ENG-012`.
- **Given** an Exit Clearance in the approved terminal state,
  **when** it is completed,
  **then** `EmployeeExited` is published via `ENG-024` per the authoritative event catalog and audited.
- **Given** an Exit Clearance in `Draft` or later,
  **when** an exit letter is generated,
  **then** the letter is produced via `ENG-007` and attached via `ENG-008`.

### 5.3 Self-Approval Prohibition (US-005)

- **Given** an approver identical to the Employee referenced by an Onboarding Task or Exit Clearance transaction,
  **when** an approval action is attempted,
  **then** the action is rejected deterministically via `ENG-012` and audited as a rejected attempt.

### 5.4 Audit Integration (US-007)

- **Given** any Onboarding Task, Exit Clearance, letter, or attachment lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, transaction identifier, transition type, and timestamp.

### 5.5 Isolation Invariants (`ADR-011`)

- **Given** any Onboarding Task / Exit Clearance read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.6 Ownership Consumption Invariants

- **Given** any Onboarding Task or Exit Clearance transaction,
  **when** it references an Employee, Position, Department, Grade, or Shift,
  **then** it consumes those masters read-only from `SPR-MOD-007-001`; no re-definition occurs.
- **Given** completion of an Exit Clearance,
  **when** `EmployeeExited` is emitted,
  **then** F&F financial computation and posting remain the responsibility of MOD-008 / MOD-002 respectively; this sprint MUST NOT compute earnings/deductions or write journal entries.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-007` — HRMS.
- **Module PRD:** [`docs/20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md).
- **Upstream Sprint (Stage 2):** [`SPR-MOD-007-001`](./SPR-MOD-007-001-hrms-foundation-employee-master.md).
- **Module PRD sections fulfilled:** §2 (Onboarding and offboarding), §3 (personas), §4 (Hire-to-onboard, Exit), §6 (Onboarding Task, Exit Clearance), §7 (self-approval prohibition, notice-period reference), §8 (`EmployeeHired`, `EmployeeExited` published; Background verification external), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-007` MODULE_PRD.
- **Upstream module baselines:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen).
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-007-001` (Employee/Position/Department/Grade/Shift masters, org assignment, HRMS configuration namespace).
- **Cross-module consumption (events only):** None published by other modules are consumed here. Background verification is an *external* integration, not a cross-module event.
- **Downstream sprints:** `SPR-MOD-007-006` HR Analytics & Compliance (consumes `EmployeeExited` for attrition analytics); MOD-001, MOD-008, MOD-017 also react to `EmployeeHired` / `EmployeeExited` per Module PRD §8 and the cross-module event flows in `MOD-007_SPRINT_PLAN.md`.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at v1.1 (Active). Execution Wrapper v1.0 (FROZEN) applies, compatibility `>=1.0,<2.0`.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and matches Sprint Plan §SPR-MOD-007-002 verbatim.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Onboarding Task / Exit Clearance actions. |
| `ENG-004` Audit | Records every Onboarding Task / Exit Clearance / letter / attachment lifecycle transition. |
| `ENG-007` Document | Generates offer, appointment, and exit letters. |
| `ENG-008` Attachment | Attaches HR letters, background-verification results, and exit-checklist artifacts to transactions. |
| `ENG-010` Workflow | Executes the Onboarding Task and Exit Clearance state machines. |
| `ENG-011` Approval | Routes Onboarding Task and Exit Clearance transactions through approval hierarchies authored in `SPR-MOD-007-001`. |
| `ENG-012` Rules | Enforces self-approval prohibition and notice-period reference resolution. |
| `ENG-013` Automation | Executes deterministic follow-on actions (e.g. auto-attach letters on Complete). |
| `ENG-023` Integration | Invokes external background-verification providers and receives their results. |
| `ENG-024` Eventing | Publishes `EmployeeHired` and `EmployeeExited` per the authoritative event catalog. |
| `ENG-025` Notification | Notifies approvers, initiators, and downstream systems of transaction transitions. |

HRMS business semantics (Onboarding Task, Exit Clearance, letter generation, attachment classification, event emission) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Onboarding Task / Exit Clearance read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Onboarding Task / Exit Clearance actions and approver routing. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Onboarding Task | MOD-007 (this sprint) | HR-managed transaction that carries a hire through approvals to `EmployeeHired`. |
| Exit Clearance | MOD-007 (this sprint) | HR-managed transaction that carries a separation through approvals to `EmployeeExited`. |
| HR Letter | MOD-007 (this sprint) | Offer / appointment / exit letters generated via `ENG-007` and attached to a parent transaction via `ENG-008`. |
| Employment Attachment | MOD-007 (this sprint) | Attachment associated with an Onboarding Task or Exit Clearance (BV results, ID docs, exit checklist artifacts). |

### 10.2 Relationships

- An **Onboarding Task** references exactly one **Employee** (owned by `SPR-MOD-007-001`) within the same company.
- An **Exit Clearance** references exactly one **Employee** within the same company.
- Each transaction MAY carry zero or more **HR Letters** and zero or more **Employment Attachments**.
- Both transactions consume the **HRMS Configuration** namespace (approval hierarchies, notice periods) authored in `SPR-MOD-007-001` via `ENG-005`.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-007` per the HRMS Ownership Convention (§1.1).
- The Employee master and org-structure masters remain owned by `SPR-MOD-007-001`; this sprint does not redefine them.
- Payroll-owned F&F entities (settlement lines, payslip adjustments) are owned by MOD-008; financial-posting entities are owned by MOD-002 Accounting. Neither is represented as HRMS-owned in this sprint.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`EmployeeHired`** — emitted on Onboarding Task Complete. Origin sprint: `SPR-MOD-007-002` per Sprint Plan §2 / §8. Downstream consumers per Sprint Plan §7 include MOD-001 (identity provisioning trigger), MOD-008 (payroll enrolment), and MOD-017 (analytics).
- **`EmployeeExited`** — emitted on Exit Clearance Complete. Origin sprint: `SPR-MOD-007-002` per Sprint Plan §2 / §8. Downstream consumers per Sprint Plan §7 include MOD-001 (identity deprovisioning trigger), MOD-008 (F&F trigger), and MOD-017 (attrition analytics), and `SPR-MOD-007-006` for HR-internal analytics.

Payload contract, envelope, versioning, and delivery guarantees are governed by the authoritative event catalog. This sprint does not redefine them.

### 11.2 Consumed

Sprint 2 consumes **no cross-module domain events**. Background verification is an *external* integration via `ENG-023`, not a cross-module event subscription.

### 11.3 Event-Catalog Registration

`EmployeeHired` and `EmployeeExited` are declared in Module PRD §8 and Sprint Plan §2 / §8 as originating from this sprint. If a name is not yet present in the authoritative event catalog at authoring time, the shortfall is recorded as a deferred `R-EV-*` risk in §14 per the Execution Wrapper v1.0 event-resolution policy; the event catalog is not modified by this Sprint PRD.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Onboarding Task / Exit Clearance read and write.
- [ ] Every lifecycle transition produces an audit record via `ENG-004`.
- [ ] Onboarding Task Complete emits `EmployeeHired`; Exit Clearance Complete emits `EmployeeExited`; both via `ENG-024` per the authoritative event catalog.
- [ ] Self-approval prohibition is enforced via `ENG-012` and audited on rejection.
- [ ] Notice-period references on Exit Clearance resolve deterministically against HRMS configuration via `ENG-005`.
- [ ] Background-verification results are captured as attachments via `ENG-008`.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-007_SPRINT_PLAN.md` §2 (`SPR-MOD-007-002`):

- Onboarding Task and Exit Clearance transactions can be created, routed through approvals, and completed.
- `EmployeeHired` and `EmployeeExited` events are published via `ENG-024`.
- Background verification integrations are invoked via `ENG-023`; results are attached via `ENG-008`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** This sprint depends on `SPR-MOD-007-001` masters (Employee, Position, Department, Grade, Shift) and HRMS configuration (approval hierarchies, notice periods).
  - **Impact:** Any regression against Sprint 1 blocks lifecycle execution.
  - **Mitigation:** Consume Sprint 1 outputs read-only; treat any Sprint 1 regression as a defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** F&F financial computation and journal posting are explicitly out of scope; scope-creep would violate the HRMS ↔ Payroll / Accounting boundary.
  - **Impact:** Duplicated ownership and traceability loss.
  - **Mitigation:** Enforce §1.1.2; reject additions that belong to MOD-008 / MOD-002.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time.
  - **Impact:** Non-Accepted status would invalidate this sprint's contract.
  - **Mitigation:** Re-plan if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Background-verification providers are external and MAY be rate-limited or return asynchronously.
  - **Impact:** Onboarding Task completion could be delayed pending BV results.
  - **Mitigation:** Model BV as an attachment inbound via `ENG-023`; Onboarding Task Complete does not block on BV unless configured to; policy is enforced via `ENG-012`.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Approver identity is enforced via `ENG-001` read-only; self-approval prohibition depends on stable Identity ↔ Employee linkage authored in Sprint 1.
  - **Impact:** Weak linkage would degrade the segregation-of-duties rule.
  - **Mitigation:** Consume linkage read-only; treat drift as a Sprint 1 defect.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** `EmployeeHired` and `EmployeeExited` are declared authoritatively in Module PRD §8 and Sprint Plan §2 / §8. The event-catalog file (`docs/02-architecture/event-catalog.md`) is a repository stub at authoring time and does not yet enumerate these event names.
  - **Impact:** Publishers cannot emit and consumers cannot subscribe until catalog registration occurs.
  - **Mitigation:** Recorded as a **Deferred Repository Risk (Events)** per Execution Wrapper v1.0 event-resolution policy. This sprint does not modify the event catalog, Module PRD, or Sprint Plan. Register the two names via the event-catalog governance process before implementation begins.
  - **Status:** Deferred

- **Risk ID:** R-EV-02
  - **Description:** Downstream cross-module reactions to `EmployeeHired` / `EmployeeExited` (MOD-001, MOD-008, MOD-017) depend on their respective sprints subscribing correctly.
  - **Impact:** Late subscription would delay identity provisioning, F&F, and analytics.
  - **Mitigation:** Publication of the events is complete once this sprint delivers; subscription is scoped to each consumer sprint. Not a Sprint 2 obligation.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md). Test categories exercised:

- **Unit** — Onboarding Task and Exit Clearance state machines; self-approval prohibition rule; notice-period reference resolution.
- **Integration** — approvals routing via `ENG-010` / `ENG-011`; document generation via `ENG-007`; attachment via `ENG-008`; audit emission via `ENG-004`; event emission via `ENG-024`; BV integration via `ENG-023`.
- **Contract** — `EmployeeHired` / `EmployeeExited` payload contract against the authoritative event catalog (once registered).
- **End-to-end (smoke)** — hire and exit happy-paths under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation and event emission.

Sprint-specific fixtures: a two-company smoke fixture, a background-verification stub for `ENG-023`, and an event-recorder for `ENG-024` assertions.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Onboarding Task and Exit Clearance as small, symmetric state machines so audit emission is trivially satisfiable at every transition.
- Consider registering the self-approval prohibition rule at authoring time so it is enforced from the first Draft transaction.
- Consider making the BV integration asynchronous (webhook / callback pattern) via `ENG-023` so Onboarding Task Draft is not blocked on external latency.
- Consider co-locating letter generation with lifecycle transitions via `ENG-013` so appointment and exit letters are auto-produced on Complete.
- Consider a small envelope validator for `EmployeeHired` / `EmployeeExited` so contract regressions are caught locally before publication.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-007-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Onboarding Task and Exit Clearance lifecycles and publish `EmployeeHired` / `EmployeeExited` (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates attendance/leave, performance, L&D/self-service, analytics, payroll, financial postings, and identity provisioning — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-007-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-007-003` Attendance & Leave depends only on `SPR-MOD-007-001` and MAY run in parallel with or after `SPR-MOD-007-002` per Sprint Plan §3.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-007-001-hrms-foundation-employee-master.md`](./SPR-MOD-007-001-hrms-foundation-employee-master.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Event Catalog (authoritative) — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
