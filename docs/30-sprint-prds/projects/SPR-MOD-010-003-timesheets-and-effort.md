---
title: "SPR-MOD-010-003 — Timesheets & Effort"
summary: "Sprint PRD for the Timesheet-to-approval business process of MOD-010 Projects: Timesheet transaction lifecycle, effort capture, multi-step approval, and capacity-justification rule enforcement. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Delivery"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-010-003"
parent_module: "MOD-010"
parent_sprint_plan: "MOD-010_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "12.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "projects", "mod-010", "timesheets", "effort", "approval", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD010-003-20260715T001800Z-001"
parent_result_id: "GT003-MOD010-002-20260715T001700Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-010-003 — Timesheets & Effort

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-010 Projects** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-010-003` (permanent) |
| Parent Module | `MOD-010` — Projects |
| Parent Sprint Plan | [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-010-001`](./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md) (Projects Foundation) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen), [`MOD008_PAYROLL_BASELINE_v1`](../../40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-010-004`, `SPR-MOD-010-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Timesheet-to-approval** business process of MOD-010 Projects by authoring the **Timesheet** transaction lifecycle, effort-capture semantics against Project and Task, and its multi-step approval routing. Enforce the business rule *"Timesheets exceeding capacity require justification and approval"* via `ENG-012` Rules and `ENG-011` Approval. Publish the `TimesheetApproved` domain event on approval and consume `EmployeeHired` and `PayrollProcessed` domain events per Module PRD §8.

> **Projects Ownership Convention (inherited from `SPR-MOD-010-001` and `SPR-MOD-010-002`).** The Projects module owns the business semantics of the Timesheet transaction. ERP Core Engines provide shared infrastructure but MUST NOT redefine Projects business rules. Financial posting remains exclusive to **MOD-002 Accounting**. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Employee master remains exclusive to **MOD-007 HRMS**. Payroll processing remains exclusive to **MOD-008 Payroll**.

#### 1.1.1 Timesheet Transaction Authority

The **Timesheet** transaction is authoritatively owned by MOD-010 Projects. No other module MAY create, edit, approve, or independently maintain a parallel Timesheet transaction against a Project. Its lifecycle (draft → submitted → approved/rejected) is governed by `ENG-010` Workflow and `ENG-011` Approval. Downstream modules and sprints consume Timesheet outcomes exclusively through the Projects-owned `TimesheetApproved` event and read APIs.

#### 1.1.2 Capacity-Justification Rule Boundary

The business rule "Timesheets exceeding capacity require justification and approval" (Module PRD §7) is declared and enforced in this sprint via `ENG-012` at Timesheet submission and re-evaluated at approval. **Capacity** is derived from Resource attributes owned by `SPR-MOD-010-001` and, where applicable, resource-availability signals derived from consumed events (§1.1.4). This sprint does not redefine capacity semantics beyond what Sprint 1 exposes.

#### 1.1.3 Projects ↔ HRMS / Payroll / Accounting / Platform Boundary (inherited)

Boundaries declared in `SPR-MOD-010-001` §1.1.2 – §1.1.3 apply verbatim and are not redefined here. Identity is consumed read-only via `ENG-001` (established in Sprint 1). Employee master is consumed read-only from **MOD-007 HRMS**; Timesheet capture resolves to a Sprint-1-owned **Resource**, never directly to an Employee master record. Payroll cost signals are consumed read-only from **MOD-008 Payroll** via `PayrollProcessed`. Financial postings remain exclusive to **MOD-002 Accounting**; no ledger effect is produced by this sprint.

#### 1.1.4 Event-Publication and Event-Consumption Authority

Sprint 3 originates the `TimesheetApproved` domain event per Module PRD §8 and Sprint Plan §2. Sprint 3 additionally consumes the `EmployeeHired` and `PayrollProcessed` domain events per Module PRD §8. Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. This sprint does not redefine any event contract.

- `EmployeeHired` (consumed, owned by MOD-007 HRMS): triggers a resource-availability refresh so Timesheet capture reflects the current active resource pool. This sprint does not redefine employee identity.
- `PayrollProcessed` (consumed, owned by MOD-008 Payroll): read-only signal supporting Timesheet reconciliation cadence; no ledger posting is derived here.

### 1.2 In Scope

- Timesheet transaction lifecycle: draft → submitted → approved → (or rejected), governed by `ENG-010` Workflow and `ENG-011` Approval.
- Effort capture: hours per day per Task (or Project where the Sprint-1 configuration allows Project-level capture), captured against Sprint-1-owned Project, Task (owned by Sprint 2), and Resource.
- Multi-step approval routing (e.g. Team Lead / Project Manager, Finance where policy requires) resolved via `ENG-011`.
- Enforcement of the capacity-justification rule via `ENG-012`: submissions whose captured effort exceeds the applicable capacity within the timesheet period MUST include a justification and traverse the approval step declared by policy; submissions without required justification are rejected at submission time.
- Structural validation (required fields, referential integrity, uniqueness within the resource-period, non-negative hours, same-project composition) via `ENG-012` at capture time.
- Scheduled cadence for timesheet-period rollover, submission reminders, and stale-timesheet notifications via `ENG-014` Scheduler and `ENG-025` Notification.
- Publication of `TimesheetApproved` via `ENG-024` on approved Timesheet, per the authoritative event catalog contract.
- Consumption of `EmployeeHired` and `PayrollProcessed` via `ENG-024` per §1.1.4.
- Read-only consumption of Projects Foundation masters (Project, Resource, Rate Card) authored in Sprint 1 and of Task master authored in Sprint 2.
- Audit emission via `ENG-004` for every Timesheet lifecycle transition and every approval decision.
- Notification of workflow/approval outcomes via `ENG-025` to relevant actors (Resource, Team Lead, Project Manager, Finance where required).

### 1.3 Out of Scope

- Project, Resource, and Rate Card master lifecycles — `SPR-MOD-010-001`.
- Task and Milestone masters, Milestone Completion, Change Request, `ProjectCreated` / `MilestoneCompleted` publication — `SPR-MOD-010-002`.
- Project Budgets, project-cost roll-up, T&M and fixed-price billing, Project Invoice transaction lifecycle, `ProjectInvoiceIssued` publication — `SPR-MOD-010-004`.
- Projects read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-010-005`.
- Employee master and HR-originating lifecycle — MOD-007 HRMS.
- Payroll disbursement, payroll postings — MOD-008 Payroll.
- Financial postings for timesheet-derived cost — MOD-002 Accounting.
- Identity, authentication, and permission grants — MOD-001 Platform.
- Cross-module KPI definitions — MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-010-003`, the following will exist:

- **Business capabilities.**
  - A Resource can capture, edit, and submit a Timesheet against a Project and its Tasks for a defined timesheet period.
  - A Team Lead / Project Manager (and Finance where policy requires) can approve or reject a submitted Timesheet; approvals route through `ENG-010` Workflow and `ENG-011` Approval.
  - The capacity-justification rule is enforced deterministically via `ENG-012` at submission and re-evaluated at approval; submissions that exceed capacity without a justification are rejected at submission.
  - A downstream sprint (`SPR-MOD-010-004`) can query approved Timesheets against a Project/Task/Resource for T&M billing and cost roll-up; queries are deterministic and enforced by tenant isolation.
- **Event artifacts.**
  - `TimesheetApproved` event is published via `ENG-024` on approved Timesheet, per the authoritative event catalog contract, exactly once per approved transaction.
  - `EmployeeHired` and `PayrollProcessed` are consumed via `ENG-024` per §1.1.4.
- **Scheduled artifacts.** Timesheet-period rollover, submission reminders, and stale-timesheet notifications are scheduled via `ENG-014` and delivered via `ENG-025`.
- **Audit artifacts.** An audit record exists for every Timesheet lifecycle transition and every approval decision, produced via `ENG-004`.
- **Notification artifacts.** Approval and workflow-outcome notifications are dispatched via `ENG-025` to the actors declared by the approval policy.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-010-003`.
- **Migration artifacts.** *N/A at PRD authoring time.*

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-010 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Timesheets and effort; submodule Timesheets | Timesheet transaction lifecycle (§5.1) |
| §3 Personas — Project Manager, Consultant, Team Lead, Finance | User stories (§4) and approval routing (§5.2) |
| §4 Business Processes — Timesheet-to-approval | Timesheet lifecycle (§5.1) and approval routing (§5.2) |
| §6 Transactions — Timesheet | Timesheet transaction (§5.1) |
| §7 Business Rules — "Timesheets exceeding capacity require justification and approval" | Capacity-justification enforcement (§5.3) |
| §8 Integration Points — `TimesheetApproved` (published); `EmployeeHired`, `PayrollProcessed` (consumed) | Event publication and consumption (§5.4, §11) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Projects Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Timesheets and effort (§2) | `SPR-MOD-010-003` |

Business-process origination allocated to this sprint per Sprint Plan §4.2:

| Business Process | Origin Sprint |
| --- | --- |
| Timesheet-to-approval | `SPR-MOD-010-003` |

Transaction Timesheet is originating-allocated to this sprint per Sprint Plan §4.3. Event `TimesheetApproved` is originating-allocated to this sprint per Sprint Plan §4.5, and event consumptions `EmployeeHired` and `PayrollProcessed` are originating-allocated to this sprint per Sprint Plan §4.5. Allocations are unique; no other Projects sprint claims them.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Timesheets and effort*, §4 process *Timesheet-to-approval*, §6 transaction *Timesheet*, §7 rule *capacity-justification*, §8 events *TimesheetApproved* (published) and *EmployeeHired*, *PayrollProcessed* (consumed) → this Sprint PRD → deliverables in §2.
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3; every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Resource, I want to capture effort hours per day against Projects and Tasks so that my work is measurable and billable where applicable.*
- **US-002.** *As a Resource, I want to submit my Timesheet for approval so that my captured effort is authoritatively recorded.*
- **US-003.** *As a Resource whose captured effort exceeds my applicable capacity, I want to attach a justification, so that the excess routes through the required approval step deterministically.*
- **US-004.** *As a Team Lead / Project Manager, I want to approve or reject a submitted Timesheet, so that the Timesheet reaches a deterministic terminal state.*
- **US-005.** *As Finance, where the approval policy declares my involvement, I want to review capacity-justified Timesheets so that off-capacity effort is authoritatively controlled before billing.*
- **US-006.** *As `SPR-MOD-010-004` (downstream billing and cost roll-up), I want to query approved Timesheets against a Project/Task/Resource, so that T&M billing and cost roll-up use authoritative data without redefining the Timesheet.*
- **US-007.** *As a downstream consumer (Analytics, Accounting, Payroll), I want to subscribe to `TimesheetApproved`, so that timesheet-approval progress is observable without polling.*
- **US-008.** *As Projects (this sprint), I want to react to `EmployeeHired` and `PayrollProcessed`, so that resource availability and payroll-cadence signals are reflected in Timesheet capture without redefining employee identity or payroll semantics.*
- **US-009.** *As a Project Manager, I want stale timesheets and upcoming period rollovers to be surfaced through scheduled notifications, so that submission is timely.*
- **US-010.** *As a security reviewer, I want every Timesheet lifecycle transition and every approval decision to be audited via `ENG-004`, so that I can reconstruct their history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Timesheet transaction lifecycle (US-001, US-002, US-004)

- **Given** a valid Timesheet capture request under an active Project in the caller's tenant/company by a Sprint-1-owned Resource,
  **when** the Resource submits it,
  **then** the Timesheet is persisted with a stable identifier unique within the resource-period, transitions to `submitted`, is routed via `ENG-010` Workflow, and the transition is audited via `ENG-004`.
- **Given** a submitted Timesheet routed to an approver declared by the approval policy,
  **when** the approver approves,
  **then** the Timesheet transitions to `approved`, `TimesheetApproved` is published via `ENG-024`, and the transition is audited.
- **Given** a submitted Timesheet,
  **when** the approver rejects,
  **then** the Timesheet transitions to `rejected` deterministically, `TimesheetApproved` is NOT published, and the transition is audited.
- **Given** an attempt to capture Timesheet effort against an archived Project, an archived Task, or a Resource in a different company,
  **when** the request is submitted,
  **then** it is rejected deterministically.
- **Given** an attempt to capture negative hours or hours violating same-project composition rules,
  **when** the request is submitted,
  **then** it is rejected deterministically at capture time via `ENG-012`.

### 5.2 Multi-step approval routing (US-004, US-005)

- **Given** the approval hierarchy configuration resolved via `ENG-005` under the Projects configuration namespace (registered by Sprint 1),
  **when** a Timesheet is submitted,
  **then** it is routed through the declared steps via `ENG-011`, notifications are dispatched via `ENG-025`, and the routing decisions are audited via `ENG-004`.
- **Given** an approval policy that requires Finance participation for capacity-justified Timesheets,
  **when** such a Timesheet is submitted,
  **then** the Finance step is invoked deterministically and MUST terminate before the Timesheet reaches `approved`.

### 5.3 Capacity-justification rule (US-003)

- **Given** a Timesheet whose captured effort within the timesheet period does not exceed the applicable capacity for the Resource,
  **when** it is submitted without a justification,
  **then** submission proceeds and the Timesheet routes to the standard approval path.
- **Given** a Timesheet whose captured effort within the timesheet period exceeds the applicable capacity for the Resource and does NOT include a justification,
  **when** it is submitted,
  **then** submission is rejected deterministically at capture time via `ENG-012`.
- **Given** a Timesheet whose captured effort exceeds the applicable capacity and DOES include a justification,
  **when** it is submitted,
  **then** submission proceeds and routing traverses the additional approval step declared by policy before reaching `approved`.
- **Given** an approved Timesheet whose capacity or justification value is later invalidated by a re-evaluation trigger,
  **when** re-evaluation is executed,
  **then** the outcome is deterministic and audited; approved terminal state is not silently mutated.

### 5.4 Event publication and consumption (US-007, US-008)

- **Given** a Timesheet that transitions to `approved`,
  **when** the transition commits,
  **then** exactly one `TimesheetApproved` event is published via `ENG-024`, conforming to the authoritative event catalog envelope.
- **Given** an `EmployeeHired` domain event from MOD-007 HRMS,
  **when** it is delivered via `ENG-024`,
  **then** Projects performs a deterministic resource-availability refresh confined to consumable read-only surfaces; no employee-master field is created, edited, or archived here.
- **Given** a `PayrollProcessed` domain event from MOD-008 Payroll,
  **when** it is delivered via `ENG-024`,
  **then** Projects records a read-only reconciliation signal; no ledger posting and no payroll-master mutation is derived.

### 5.5 Scheduled cadence (US-009)

- **Given** the timesheet-period rollover schedule resolved via `ENG-005` under the Projects configuration namespace,
  **when** the schedule fires via `ENG-014`,
  **then** rollover proceeds deterministically, and stale-timesheet notifications are dispatched via `ENG-025` to declared actors.

### 5.6 Downstream query surface (US-006)

- **Given** an approved Timesheet against a Project/Task/Resource,
  **when** `SPR-MOD-010-004` (or any Projects-owned downstream) queries approved Timesheets scoped to the caller's tenant/company,
  **then** the result is deterministic and enforces tenant isolation; unapproved Timesheets are not returned by this query.

### 5.7 Audit invariants (US-010)

- **Given** any Timesheet lifecycle transition or any approval decision,
  **when** it commits,
  **then** an audit record is produced via `ENG-004` capturing actor, action, subject, before-state, after-state, and timestamp.

### 5.8 Authorization invariants

- **Given** any Timesheet action (capture, edit, submit, approve, reject, query),
  **when** it is executed,
  **then** authorization is enforced via `ENG-002` per `ADR-032` (RBAC + ABAC); an unauthorized principal is rejected deterministically.

### 5.9 Tenant isolation invariants

- **Given** any Sprint-3 read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.10 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Timesheet data,
  **when** it reads or reacts,
  **then** it does so exclusively through Projects-owned events and read APIs. No downstream module redefines the Timesheet transaction or transitions its state independently.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-010` — Projects.
- **Module PRD:** [`docs/20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Timesheets and effort; submodule Timesheets), §3 (Project Manager, Consultant, Team Lead, Finance), §4 (Timesheet-to-approval), §6 (Timesheet), §7 (capacity-justification rule), §8 (`TimesheetApproved` published; `EmployeeHired`, `PayrollProcessed` consumed), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-010` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen).
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen).
  - [`MOD008_PAYROLL_BASELINE_v1`](../../40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md) (frozen).
- **Upstream sprint dependencies (per Sprint Plan §2):** [`SPR-MOD-010-001`](./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md) — Projects Foundation (Project, Resource, Rate Card masters and Projects configuration namespace). Task master (owned by [`SPR-MOD-010-002`](./SPR-MOD-010-002-tasks-milestones-and-change-requests.md)) is consumed read-only where Timesheet effort is captured at Task granularity.
- **Cross-module consumption (events only):** `EmployeeHired` (owned by MOD-007 HRMS), `PayrollProcessed` (owned by MOD-008 Payroll).
- **Downstream sprints:** `SPR-MOD-010-004` (Budgets, Costs & Project Billing — consumes approved Timesheets and `TimesheetApproved`), `SPR-MOD-010-005` (Projects Analytics & Compliance — consumes `TimesheetApproved`).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Projects Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Timesheet capture, edit, submit, approve, reject, and query actions. |
| `ENG-004` Audit | Records every Timesheet lifecycle transition and every approval decision. |
| `ENG-010` Workflow | Governs Timesheet transaction lifecycle. |
| `ENG-011` Approval | Governs multi-step approvals for Timesheet, including the capacity-justification approval step. |
| `ENG-012` Rules | Evaluates structural validations and the capacity-justification rule at submission and at approval re-evaluation. |
| `ENG-014` Scheduler | Fires timesheet-period rollover, submission-reminder, and stale-timesheet cadence. |
| `ENG-024` Eventing | Publishes `TimesheetApproved` on approved Timesheet; consumes `EmployeeHired` and `PayrollProcessed`. |
| `ENG-025` Notification | Dispatches approval, workflow-outcome, rollover, and stale-timesheet notifications to policy-declared actors. |

Configuration resolution (`ENG-005`) is inherited from Sprint 1's Projects configuration namespace and is used to read approval-hierarchy and rollover-schedule values; no new configuration namespace is introduced here.

Projects business semantics (Timesheet, capacity-justification rule) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Sprint-3 read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Timesheet actions and to approval-role evaluation. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Workflow and approval contracts are governed by `ENG-010` and `ENG-011`. Scheduling contracts are governed by `ENG-014`.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Timesheet | MOD-010 (this sprint) | Transaction capturing a Resource's effort within a timesheet period against a Project (and its Tasks) and routed through workflow/approval to a deterministic terminal state. |

### 10.2 Relationships

- A **Timesheet** references exactly one Sprint-1-owned **Resource** and exactly one Sprint-1-owned **Project** in the same company; effort lines within the Timesheet MAY reference Sprint-2-owned **Tasks** within that Project.
- A **Timesheet** is unique per (Resource, timesheet period).
- A **Timesheet** is scoped to a single tenant/company (`ADR-011`).

### 10.3 Ownership Boundaries

- Timesheet is owned by `MOD-010` per the Projects Ownership Convention (§1.1). ERP Core Engines do not redefine it.
- Project, Resource, and Rate Card remain owned by Sprint 1; they are consumed read-only here.
- Task and Milestone remain owned by Sprint 2; Task is consumed read-only here.
- Employee entity remains owned by MOD-007 HRMS and is not represented here; Timesheet capture resolves against a Projects-owned Resource, not directly against an Employee.
- Payroll-master entities remain owned by MOD-008 Payroll; `PayrollProcessed` is consumed read-only.
- Financial-posting entities remain owned by MOD-002 Accounting.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

| Event | Trigger | Contract Owner |
| --- | --- | --- |
| `TimesheetApproved` | Timesheet transitions to `approved`. | MOD-010 |

Payload contracts are declared in the authoritative event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

### 11.2 Consumed

| Event | Producer | Effect in this sprint |
| --- | --- | --- |
| `EmployeeHired` | MOD-007 HRMS | Triggers deterministic resource-availability refresh confined to read-only Projects surfaces. |
| `PayrollProcessed` | MOD-008 Payroll | Read-only reconciliation signal supporting Timesheet cadence; no ledger effect and no payroll-master mutation. |

`SalesOrderConfirmed` is consumed by `SPR-MOD-010-004` per Module PRD §8 and is out of scope here.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Sprint-3 read and write.
- [ ] Every Timesheet lifecycle transition and every approval decision produces an audit record via `ENG-004`.
- [ ] Timesheet is routed via `ENG-010` Workflow and `ENG-011` Approval end-to-end.
- [ ] The capacity-justification rule is enforced via `ENG-012` at submission and re-evaluated at approval.
- [ ] `TimesheetApproved` is published via `ENG-024` per the authoritative event catalog envelope, exactly once per approved Timesheet.
- [ ] `EmployeeHired` and `PayrollProcessed` are consumed via `ENG-024` per §5.4 without mutating upstream masters.
- [ ] Timesheet-period rollover and stale-timesheet cadence fire via `ENG-014` and are delivered via `ENG-025`.
- [ ] Approval-hierarchy and rollover-schedule configuration resolve deterministically via `ENG-005` under the namespace registered by Sprint 1.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-010_SPRINT_PLAN.md` §2 (`SPR-MOD-010-003`):

- Timesheets can be captured, submitted, approved, and rejected against Projects and Tasks.
- The capacity-justification rule is enforced via `ENG-012`.
- `TimesheetApproved` events are published via `ENG-024`; `EmployeeHired` and `PayrollProcessed` events are consumed.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 3 depends on `SPR-MOD-010-001` deliverables (Project, Resource, Rate Card, Projects configuration namespace). Any regression against Sprint 1 blocks Sprint 3.
  - **Impact:** Timesheet capture and approval-hierarchy resolution would fail if Sprint 1 outputs regress.
  - **Mitigation:** Consume Sprint 1 outputs read-only; escalate defects to Sprint 1.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** `ENG-010` Workflow, `ENG-011` Approval, and `ENG-014` Scheduler contracts must be stable and available at Sprint-3 authoring/implementation time.
  - **Impact:** Instability in any of these engines would fragment Timesheet lifecycle or scheduled cadence.
  - **Mitigation:** Consume each engine per its authoritative contract; escalate defects to the engine owner.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** The capacity-justification rule (Module PRD §7) is declared and enforced here; leakage of billing or cost-roll-up semantics into this sprint would violate boundaries.
  - **Impact:** Rule leakage would blur `SPR-MOD-010-004` scope and duplicate cost/billing logic.
  - **Mitigation:** Restrict this sprint to Timesheet lifecycle and rule enforcement via `ENG-012`; do not author billing or cost roll-up.
  - **Status:** Accepted

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Timesheet MUST NOT be redefined by downstream modules; Employee master (MOD-007), Payroll master (MOD-008), Projects foundation masters (Sprint 1), Task master (Sprint 2), and financial postings (MOD-002) MUST NOT be authored here.
  - **Impact:** Blurring ownership boundaries would fragment domain data and break traceability.
  - **Mitigation:** Enforce §1.1.1–§1.1.4 boundaries at every downstream sprint gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** `TimesheetApproved` payload contract, and the envelopes for consumed `EmployeeHired` and `PayrollProcessed`, are governed by the authoritative event catalog. If any event name is not yet registered at Sprint-3 authoring time, it is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before Sprint-3 implementation begins.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Timesheet validation; capacity-justification rule evaluation at submission and at approval re-evaluation; approval-hierarchy resolution invariants; schedule-parameter resolution invariants.
- **Integration** — Workflow orchestration via `ENG-010`; approval routing via `ENG-011`; audit emission via `ENG-004`; configuration resolution via `ENG-005`; scheduled cadence via `ENG-014`; notification dispatch via `ENG-025`; structural validation via `ENG-012`; event publication and consumption via `ENG-024`.
- **Contract** — `TimesheetApproved` payload conformance against the authoritative event catalog envelope; `EmployeeHired` and `PayrollProcessed` consumer-side conformance.
- **End-to-end (smoke)** — Timesheet within capacity → submit → approve → `TimesheetApproved`; Timesheet over capacity without justification → rejected at submission; Timesheet over capacity with justification → routed through additional approval step → approved; period rollover fires and dispatches stale-timesheet notifications; `EmployeeHired` triggers resource-availability refresh; `PayrollProcessed` records reconciliation signal.

Sprint-specific fixtures: a Project with a Task graph and multiple Resources spanning capacity boundaries under a two-company smoke fixture, and an approval-policy fixture routed via `ENG-011` covering both baseline and capacity-justified paths.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Timesheet as a header-plus-lines state machine so effort lines can be validated line-by-line while the header owns the workflow state.
- Consider enforcing the capacity-justification rule via a single `ENG-012` predicate keyed by (Resource, timesheet period) so re-evaluation on edit and on approval is idempotent.
- Consider publishing `TimesheetApproved` as part of the approval commit transaction to guarantee "exactly once per approved Timesheet" without a separate outbox.
- Consider deriving approval routing entirely from `ENG-005`-resolved approval-hierarchy configuration so no in-code policy is embedded.
- Consider surfacing consumed-event handlers (`EmployeeHired`, `PayrollProcessed`) as idempotent projections so replays do not mutate authoritative Timesheet state.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-010-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Timesheet-to-approval process with the Timesheet transaction, capacity-justification enforcement, `TimesheetApproved` publication, and `EmployeeHired` / `PayrollProcessed` consumption (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Projects Ownership Convention with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters, tasks/milestones, budgets/billing, analytics, MOD-007/MOD-008-owned entities, financial postings, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-010-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-010-004` Budgets, Costs & Project Billing is the immediate successor per [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-010-002` and `SPR-MOD-010-003`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md`](./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md), [`./SPR-MOD-010-002-tasks-milestones-and-change-requests.md`](./SPR-MOD-010-002-tasks-milestones-and-change-requests.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md), [`../../40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md`](../../40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md)
- Precedent Sprint-3 PRDs — [`../manufacturing/SPR-MOD-009-003-work-order-execution-and-material-consumption.md`](../manufacturing/SPR-MOD-009-003-work-order-execution-and-material-consumption.md), [`../payroll/SPR-MOD-008-003-statutory-computations.md`](../payroll/SPR-MOD-008-003-statutory-computations.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
