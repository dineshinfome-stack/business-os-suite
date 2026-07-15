---
title: "SPR-MOD-010-002 — Tasks, Milestones & Change Requests"
summary: "Sprint PRD for the Setup-to-execution and Change Request processes of MOD-010 Projects: Task and Milestone masters, Milestone Completion transaction lifecycle, and Change Request handling. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Delivery"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-010-002"
parent_module: "MOD-010"
parent_sprint_plan: "MOD-010_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "12.0.2"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "projects", "mod-010", "tasks", "milestones", "change-requests", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD010-002-20260715T001700Z-001"
parent_result_id: "GT003-MOD010-001-20260715T001600Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-010-002 — Tasks, Milestones & Change Requests

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-010 Projects** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-010-002` (permanent) |
| Parent Module | `MOD-010` — Projects |
| Parent Sprint Plan | [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-010-001`](./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md) (Projects Foundation) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-010-003` … `SPR-MOD-010-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Setup-to-execution** and **Change Request** business processes of MOD-010 Projects by authoring the **Task** and **Milestone** masters, the **Milestone Completion** transaction lifecycle, and the **Change Request** transaction lifecycle. Publish the first two Projects-lifecycle domain events (`ProjectCreated`, `MilestoneCompleted`) to downstream modules. Enforce the business rule *"A milestone can be invoiced only after it is marked completed and approved"* via `ENG-012` Rules and `ENG-011` Approval.

> **Projects Ownership Convention (inherited from `SPR-MOD-010-001`).** The Projects module owns the business semantics of Task, Milestone, Milestone Completion, and Change Request. ERP Core Engines provide shared infrastructure but MUST NOT redefine Projects business rules. Financial posting remains exclusive to **MOD-002 Accounting**. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Employee master remains exclusive to **MOD-007 HRMS**.

#### 1.1.1 Task and Milestone Master Authority

The **Task** and **Milestone** masters are authoritatively owned by MOD-010 Projects. No other module MAY create, edit, archive, or independently maintain a parallel Task or Milestone master. Downstream sprints and modules consume these masters through Projects-owned events (`ProjectCreated`, `MilestoneCompleted`) and read APIs; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 Milestone Completion and Change Request Transaction Authority

The **Milestone Completion** and **Change Request** transactions are authoritatively owned by MOD-010 Projects. Their lifecycles (draft → submitted → approved/rejected → completed) are governed by `ENG-010` Workflow and `ENG-011` Approval. No downstream module redefines the transaction lifecycle or independently transitions its state.

#### 1.1.3 Milestone-Invoiceable Rule Boundary

The business rule "A milestone can be invoiced only after it is marked completed and approved" (Module PRD §7) is declared and enforced in this sprint via `ENG-012` at the Milestone Completion lifecycle boundary. **Invoicing** itself — Project Invoice authoring, ledger posting, tax treatment — is out of scope here and is owned by `SPR-MOD-010-004` (Budgets, Costs & Project Billing) and MOD-002 Accounting.

#### 1.1.4 Projects ↔ HRMS / Accounting / Platform Boundary (inherited)

Boundaries declared in `SPR-MOD-010-001` §1.1.2 – §1.1.3 apply verbatim and are not redefined here. Identity is consumed read-only via `ENG-001` (established in Sprint 1); Employee master is consumed read-only from MOD-007 where Task assignment resolves to an internal resource; financial postings remain exclusive to MOD-002 Accounting.

#### 1.1.5 Event-Publication Authority

Sprint 2 originates the `ProjectCreated` and `MilestoneCompleted` domain events per Module PRD §8 and Sprint Plan §2. Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. This sprint does not redefine either.

### 1.2 In Scope

- Task master: create, edit, assign, reassign, close, and archive under a Project; task assignment MAY reference a Projects-owned Resource (owned by Sprint 1).
- Milestone master: create, edit, sequence, cancel, and archive under a Project.
- Milestone Completion transaction lifecycle: draft → submitted → approved → completed (or rejected), governed by `ENG-010` Workflow and `ENG-011` Approval.
- Change Request transaction lifecycle: draft → submitted → approved/rejected, governed by `ENG-010` Workflow and `ENG-011` Approval.
- Enforcement of the milestone-invoiceable rule via `ENG-012` Rules at the completion boundary — a Milestone that is not both `completed` and `approved` cannot be flagged as invoiceable downstream.
- Publication of `ProjectCreated` on Project activation (Project master owned by Sprint 1; the event contract is originated here per Sprint Plan §2).
- Publication of `MilestoneCompleted` on approved Milestone Completion.
- Read-only consumption of Projects Foundation masters (Project, Resource, Rate Card) authored in Sprint 1.
- Attachment support for Milestones and Change Requests via `ENG-008` (deliverable artifacts, change-request rationale).
- Document classification for Milestone and Change Request artifacts via `ENG-007` where applicable.
- Structural validation (required fields, referential integrity, uniqueness, same-project composition) via `ENG-012` at capture time.
- Notification of workflow/approval outcomes via `ENG-025` to relevant actors (Project Manager, Team Lead, Consultant, Finance where required by approval policy).
- Audit emission via `ENG-004` for every Task, Milestone, Milestone Completion, and Change Request lifecycle transition.

### 1.3 Out of Scope

- Project, Resource, and Rate Card master lifecycles — `SPR-MOD-010-001`.
- Timesheet transaction lifecycle, effort capture, capacity-justification rule — `SPR-MOD-010-003`.
- Project Budgets, project-cost roll-up, T&M and fixed-price billing, Project Invoice transaction lifecycle, `ProjectInvoiceIssued` publication — `SPR-MOD-010-004`.
- Projects read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-010-005`.
- `TimesheetApproved` publication — `SPR-MOD-010-003`.
- Employee master and HR-originating lifecycle — MOD-007 HRMS.
- Financial postings for milestone-completion or change-request cost impacts — MOD-002 Accounting.
- Identity, authentication, and permission grants — MOD-001 Platform.
- Cross-module KPI definitions — MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-010-002`, the following will exist:

- **Business capabilities.**
  - A Project Manager can create, edit, sequence, and archive Tasks and Milestones under a Project.
  - A Team Lead or Consultant can be assigned to a Task; assignment resolves to a Sprint-1-owned Resource.
  - A Project Manager can submit a Milestone for completion; the request routes through `ENG-010` Workflow and `ENG-011` Approval and, on approval, marks the Milestone `completed` and `approved`.
  - A Project Manager can raise a Change Request; the request routes through `ENG-010` Workflow and `ENG-011` Approval and reaches a deterministic terminal state (approved or rejected).
  - A downstream sprint (`SPR-MOD-010-004`) can query whether a Milestone is invoiceable and receive a deterministic answer enforced by `ENG-012`.
- **Event artifacts.**
  - `ProjectCreated` event is published via `ENG-024` on Project activation, per the authoritative event catalog contract.
  - `MilestoneCompleted` event is published via `ENG-024` on approved Milestone Completion, per the authoritative event catalog contract.
- **Configuration artifacts.** Approval-hierarchy configuration for Milestone Completion and Change Request is resolved via `ENG-005` under the namespace registered by Sprint 1; no new configuration namespaces are introduced.
- **Audit artifacts.** An audit record exists for every Task, Milestone, Milestone Completion, and Change Request lifecycle transition, produced via `ENG-004`.
- **Notification artifacts.** Approval and workflow outcome notifications are dispatched via `ENG-025` to the actors declared by the approval policy.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-010-002`.
- **Migration artifacts.** *N/A at PRD authoring time.*

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-010 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Task and milestone tracking; submodule Tasks | Task and Milestone masters (§5.1, §5.2) |
| §3 Personas — Project Manager, Consultant, Team Lead, Finance | User stories (§4) and approval routing (§5.3) |
| §4 Business Processes — Setup-to-execution, Change request | Task/Milestone lifecycle (§5.1–§5.2), Milestone Completion (§5.3), Change Request (§5.4) |
| §5 Master Data — Task, Milestone | Task and Milestone masters (§5.1, §5.2) |
| §6 Transactions — Milestone Completion, Change Request | Milestone Completion (§5.3), Change Request (§5.4) |
| §7 Business Rules — "A milestone can be invoiced only after it is marked completed and approved" | Milestone-invoiceable enforcement (§5.5) |
| §8 Integration Points — `ProjectCreated`, `MilestoneCompleted` (published) | Event publication (§5.6, §11.1) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Projects Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as their originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Task and milestone tracking (§2) | `SPR-MOD-010-002` |

Business-process origination allocated to this sprint per Sprint Plan §4.2:

| Business Process | Origin Sprint |
| --- | --- |
| Setup-to-execution | `SPR-MOD-010-002` |
| Change request | `SPR-MOD-010-002` |

Master-data entities Task and Milestone are each originating-allocated to this sprint per Sprint Plan §4.3. Transactions Milestone Completion and Change Request are originating-allocated to this sprint per Sprint Plan §4.4. Events `ProjectCreated` and `MilestoneCompleted` are originating-allocated to this sprint per Sprint Plan §4.5. Allocations are unique; no other Projects sprint claims them.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Task and milestone tracking*, §4 processes *Setup-to-execution* and *Change request*, §6 transactions *Milestone Completion* and *Change Request*, §7 rule *milestone invoiceable only after completed and approved*, §8 events *ProjectCreated* and *MilestoneCompleted* → this Sprint PRD → deliverables in §2.
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3; every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Project Manager, I want to create, edit, sequence, and archive Tasks under a Project so that execution work is decomposed into trackable units.*
- **US-002.** *As a Project Manager, I want to assign a Task to a Sprint-1-owned Resource, so that ownership of execution is unambiguous.*
- **US-003.** *As a Project Manager, I want to create, edit, sequence, and cancel Milestones under a Project, so that progress is measurable and billable events are defined.*
- **US-004.** *As a Project Manager, I want to submit a Milestone for completion and see it routed through an approval workflow, so that milestone completion is authoritatively controlled.*
- **US-005.** *As an approver (Team Lead, Finance where required), I want to approve or reject a Milestone Completion, so that the completion state is deterministic.*
- **US-006.** *As a Project Manager, I want to raise a Change Request against a Project, so that scope changes are captured, routed, and decided authoritatively.*
- **US-007.** *As `SPR-MOD-010-004` (downstream billing), I want to query whether a Milestone is invoiceable and receive a deterministic answer, so that invoicing enforces the "completed and approved" rule without redefining it.*
- **US-008.** *As a downstream consumer (Analytics, Accounting, downstream Projects sprints), I want to subscribe to `ProjectCreated` and `MilestoneCompleted` events, so that project-lifecycle progress is observable without polling.*
- **US-009.** *As a security reviewer, I want every Task, Milestone, Milestone Completion, and Change Request lifecycle transition to be audited via `ENG-004`, so that I can reconstruct their history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Task master (US-001, US-002)

- **Given** a valid Task creation request under an active Project within the caller's tenant/company,
  **when** a Project Manager submits it,
  **then** the Task is persisted with a stable identifier unique within the Project, and the transition is audited.
- **Given** a Task assignment to a Sprint-1-owned Resource in the same company,
  **when** the assignment is submitted,
  **then** it is persisted deterministically and audited.
- **Given** an attempt to assign a Task to a Resource in a different company or an archived Resource,
  **when** the request is submitted,
  **then** it is rejected deterministically.

### 5.2 Milestone master (US-003)

- **Given** a valid Milestone creation request under an active Project,
  **when** a Project Manager submits it,
  **then** the Milestone is persisted with a stable identifier unique within the Project, is sequenced deterministically, and is audited.
- **Given** a cancellation request for a Milestone that has no in-flight Milestone Completion,
  **when** submitted,
  **then** the Milestone transitions to `cancelled` deterministically and is audited.

### 5.3 Milestone Completion transaction (US-004, US-005)

- **Given** an active Milestone under an active Project,
  **when** a Project Manager submits a Milestone Completion,
  **then** the transaction enters `submitted` and is routed via `ENG-010` Workflow and `ENG-011` Approval per the approval-hierarchy configuration resolved via `ENG-005`.
- **Given** an approver acting within their authority,
  **when** they approve the Milestone Completion,
  **then** the Milestone transitions to `completed` and `approved` atomically and the transaction is audited.
- **Given** an approver acting within their authority,
  **when** they reject the Milestone Completion,
  **then** the Milestone remains not-completed, the transaction terminates as `rejected`, and both are audited.

### 5.4 Change Request transaction (US-006)

- **Given** an active Project,
  **when** a Project Manager submits a Change Request with a business rationale,
  **then** the transaction enters `submitted` and is routed via `ENG-010` Workflow and `ENG-011` Approval per the approval-hierarchy configuration resolved via `ENG-005`.
- **Given** an approver acting within their authority,
  **when** they approve or reject the Change Request,
  **then** the transaction reaches a deterministic terminal state (`approved` or `rejected`) and is audited.

### 5.5 Milestone-invoiceable rule (US-007)

- **Given** a Milestone whose state is not both `completed` and `approved`,
  **when** any downstream code path queries invoiceability,
  **then** `ENG-012` returns non-invoiceable deterministically.
- **Given** a Milestone whose state is both `completed` and `approved`,
  **when** the same query is made,
  **then** `ENG-012` returns invoiceable deterministically.
- **Given** any downstream sprint or module,
  **when** it attempts to bypass the rule and mark a non-completed or non-approved Milestone invoiceable,
  **then** the attempt is rejected deterministically.

### 5.6 Event publication (US-008)

- **Given** a Project transitioning to `active` (lifecycle owned by Sprint 1),
  **when** activation completes,
  **then** `ProjectCreated` is published exactly once via `ENG-024` per the authoritative event catalog envelope.
- **Given** a Milestone Completion reaching `approved`,
  **when** the transition commits,
  **then** `MilestoneCompleted` is published exactly once via `ENG-024` per the authoritative event catalog envelope.
- **Given** any consumer of these events,
  **when** it subscribes,
  **then** it receives the events per the authoritative delivery guarantees of `ENG-024`; this sprint does not redefine them.

### 5.7 Notification (implicit across US-004 – US-006)

- **Given** any workflow transition requiring approver action or announcing outcome,
  **when** the transition executes,
  **then** a notification is dispatched via `ENG-025` to the actors declared by the approval policy resolved via `ENG-005`.

### 5.8 Audit integration (US-009)

- **Given** any Task / Milestone / Milestone Completion / Change Request lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any Sprint-2 read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.10 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Task, Milestone, Milestone Completion, or Change Request data,
  **when** it reads or reacts,
  **then** it does so exclusively through Projects-owned events and read APIs. No downstream module redefines these entities or transitions their state independently.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-010` — Projects.
- **Module PRD:** [`docs/20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Task and milestone tracking; submodule Tasks), §3 (Project Manager, Consultant, Team Lead, Finance), §4 (Setup-to-execution, Change request), §5 (Task, Milestone), §6 (Milestone Completion, Change Request), §7 (milestone-invoiceable rule), §8 (`ProjectCreated`, `MilestoneCompleted` published), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-010` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen).
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen).
- **Upstream sprint dependencies (per Sprint Plan §2):** [`SPR-MOD-010-001`](./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md) — Projects Foundation (Project, Resource, Rate Card masters and Projects configuration namespace).
- **Cross-module consumption (events only):** None in this sprint.
- **Downstream sprints:** `SPR-MOD-010-003` (Timesheets & Effort), `SPR-MOD-010-004` (Budgets, Costs & Project Billing — consumes the milestone-invoiceable rule and `MilestoneCompleted`), `SPR-MOD-010-005` (Projects Analytics & Compliance — consumes `ProjectCreated` and `MilestoneCompleted`).

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
| `ENG-002` Authorization | Enforces authorization on Task, Milestone, Milestone Completion, and Change Request actions. |
| `ENG-004` Audit | Records every Task / Milestone / Milestone Completion / Change Request lifecycle transition. |
| `ENG-005` Configuration | Resolves approval-hierarchy configuration for Milestone Completion and Change Request under the namespace registered by Sprint 1. |
| `ENG-007` Document | Provides document classification for Milestone and Change Request artifacts where applicable. |
| `ENG-008` Attachment | Provides attachment binding for Milestone deliverables and Change Request rationale artifacts. |
| `ENG-010` Workflow | Governs Milestone Completion and Change Request transaction lifecycles. |
| `ENG-011` Approval | Governs multi-step approvals for Milestone Completion and Change Request. |
| `ENG-012` Rules | Evaluates structural validations and the milestone-invoiceable rule at capture and query time. |
| `ENG-024` Eventing | Publishes `ProjectCreated` on Project activation and `MilestoneCompleted` on approved Milestone Completion. |
| `ENG-025` Notification | Dispatches approval and workflow-outcome notifications to policy-declared actors. |

Projects business semantics (Task, Milestone, Milestone Completion, Change Request, milestone-invoiceable rule) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Sprint-2 read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Task, Milestone, Milestone Completion, and Change Request actions and to approval-role evaluation. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Workflow and approval contracts are governed by `ENG-010` and `ENG-011`.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Task | MOD-010 (this sprint) | Unit of execution work under a Project, optionally assigned to a Sprint-1-owned Resource. |
| Milestone | MOD-010 (this sprint) | Measurable, sequenced project checkpoint under a Project. |
| Milestone Completion | MOD-010 (this sprint) | Transaction that transitions a Milestone to `completed` and `approved` under `ENG-010` / `ENG-011`. |
| Change Request | MOD-010 (this sprint) | Transaction capturing a proposed scope change and routing it to a deterministic terminal state. |

### 10.2 Relationships

- A **Project** (owned by Sprint 1) owns zero or more **Tasks** and zero or more **Milestones**.
- A **Task** MAY reference at most one Sprint-1-owned **Resource** within the same company as an assignee.
- A **Milestone Completion** references exactly one **Milestone** within the same Project.
- A **Change Request** references exactly one **Project** within the same tenant/company.

### 10.3 Ownership Boundaries

- Task, Milestone, Milestone Completion, and Change Request are owned by `MOD-010` per the Projects Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Project, Resource, and Rate Card remain owned by Sprint 1; they are consumed read-only here.
- Employee entity remains owned by MOD-007 HRMS and is not represented here; Task assignment resolves against a Projects-owned Resource, not directly against an Employee.
- Financial-posting entities remain owned by MOD-002 Accounting.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

| Event | Trigger | Contract Owner |
| --- | --- | --- |
| `ProjectCreated` | Project transitions to `active` (Project lifecycle owned by Sprint 1; event contract originated here per Sprint Plan §2). | MOD-010 |
| `MilestoneCompleted` | Milestone Completion transitions to `approved`. | MOD-010 |

Payload contracts are declared in the authoritative event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

### 11.2 Consumed

Sprint 2 consumes **no cross-module domain events**. Consumption of upstream domain events (`EmployeeHired`, `PayrollProcessed`, `SalesOrderConfirmed`) is scoped to `SPR-MOD-010-003` and `SPR-MOD-010-004` per Module PRD §8.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Sprint-2 read and write.
- [ ] Every Task, Milestone, Milestone Completion, and Change Request lifecycle transition produces an audit record via `ENG-004`.
- [ ] Milestone Completion and Change Request are routed via `ENG-010` Workflow and `ENG-011` Approval end-to-end.
- [ ] The milestone-invoiceable rule is enforced via `ENG-012` and is exercised end-to-end from a downstream query surface.
- [ ] `ProjectCreated` and `MilestoneCompleted` are published via `ENG-024` per the authoritative event catalog envelope, exactly once per triggering transition.
- [ ] Approval and workflow-outcome notifications are dispatched via `ENG-025` per policy.
- [ ] Approval-hierarchy configuration resolves deterministically via `ENG-005` under the namespace registered by Sprint 1.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-010_SPRINT_PLAN.md` §2 (`SPR-MOD-010-002`):

- Tasks and Milestones can be created, tracked, and completed against a Project.
- Change Requests follow their approval workflow via `ENG-011`.
- The milestone-invoiceable rule is enforced via `ENG-012`.
- `ProjectCreated` and `MilestoneCompleted` events are published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 2 depends on `SPR-MOD-010-001` deliverables (Project, Resource, Rate Card, Projects configuration namespace).
  - **Impact:** Any regression in Sprint 1 foundation blocks this sprint.
  - **Mitigation:** Rely on Sprint-1 contracts; treat any regression as a Sprint-1 defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** `ENG-010` Workflow and `ENG-011` Approval contracts must be stable and available at Sprint-2 authoring/implementation time.
  - **Impact:** Instability in either engine would fragment Milestone Completion and Change Request lifecycles.
  - **Mitigation:** Consume both engines per their authoritative contracts; escalate defects to the engine owner.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** The milestone-invoiceable rule (Module PRD §7) is declared and enforced here; leakage of "invoicing" semantics into this sprint would violate boundaries.
  - **Impact:** Rule leakage would blur `SPR-MOD-010-004` scope and duplicate billing logic.
  - **Mitigation:** Restrict this sprint to enforcement via `ENG-012` at the completion boundary; do not author invoicing.
  - **Status:** Accepted

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Task, Milestone, Milestone Completion, and Change Request MUST NOT be redefined by downstream modules; Employee master (MOD-007), Projects foundation masters (Sprint 1), and financial postings (MOD-002) MUST NOT be authored here.
  - **Impact:** Blurring ownership boundaries would fragment domain data and break traceability.
  - **Mitigation:** Enforce §1.1.1–§1.1.5 boundaries at every downstream sprint gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** `ProjectCreated` and `MilestoneCompleted` payload contracts are governed by the authoritative event catalog. If either event name is not yet registered at Sprint-2 authoring time, it is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before Sprint-2 implementation begins.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Task, Milestone, Milestone Completion, and Change Request validation; milestone-invoiceable rule evaluation; approval-hierarchy resolution invariants.
- **Integration** — Workflow orchestration via `ENG-010`; approval routing via `ENG-011`; audit emission via `ENG-004`; configuration resolution via `ENG-005`; notification dispatch via `ENG-025`; structural validation via `ENG-012`; event publication via `ENG-024`.
- **Contract** — `ProjectCreated` and `MilestoneCompleted` payload conformance against the authoritative event catalog envelope.
- **End-to-end (smoke)** — Project activation → `ProjectCreated`; Milestone Completion submission → approval → `MilestoneCompleted` → invoiceable-query returns invoiceable; rejection path terminates deterministically and does not publish `MilestoneCompleted`; Change Request submission → approval/rejection terminates deterministically.

Sprint-specific fixtures: a Project with a small Task/Milestone graph under a two-company smoke fixture and an approval-policy fixture routed via `ENG-011`.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Milestone and Milestone Completion as separate state machines linked by a strong `completion → milestone` reference so approval-driven state changes on the Milestone are auditable and idempotent.
- Consider enforcing the milestone-invoiceable rule via a single `ENG-012` predicate keyed by Milestone identifier so downstream sprints (billing, analytics) share one authoritative call site.
- Consider publishing `MilestoneCompleted` as part of the approval commit transaction to guarantee "exactly once per approved completion" without a separate outbox.
- Consider co-locating `ProjectCreated` emission with Sprint-1 Project activation so the event is a natural consequence of activation rather than an out-of-band step.
- Consider deriving Change-Request routing entirely from `ENG-005`-resolved approval-hierarchy configuration so no in-code policy is embedded.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-010-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Setup-to-execution and Change Request processes with Task/Milestone masters, Milestone Completion and Change Request transactions, milestone-invoiceable enforcement, and `ProjectCreated`/`MilestoneCompleted` publication (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Projects Ownership Convention with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates timesheets, budgets/billing, analytics, MOD-007-owned entities, financial postings, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-010-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-010-003` Timesheets & Effort is the immediate successor per [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-010-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md`](./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- Precedent Sprint-2 PRDs — [`../manufacturing/SPR-MOD-009-002-production-planning-and-scheduling.md`](../manufacturing/SPR-MOD-009-002-production-planning-and-scheduling.md), [`../payroll/SPR-MOD-008-002-payroll-cycles-and-runs.md`](../payroll/SPR-MOD-008-002-payroll-cycles-and-runs.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
