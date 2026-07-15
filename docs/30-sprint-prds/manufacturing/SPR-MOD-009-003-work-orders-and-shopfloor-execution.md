---
title: "SPR-MOD-009-003 — Work Orders & Shopfloor Execution"
summary: "Sprint PRD for the Work-order-to-completion layer of MOD-009 Manufacturing: Work Order transaction lifecycle, Production Entry capture, and shopfloor execution surface. Publishes WorkOrderReleased and ProductionCompleted events and invokes MES/SCADA/IoT integrations via ENG-023 where configured."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-009-003"
parent_module: "MOD-009"
parent_sprint_plan: "MOD-009_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "11.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-023", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "manufacturing", "mod-009", "work-orders", "shopfloor", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD009-003-20260715T000900Z-001"
parent_result_id: "GT003-MOD009-002-20260715T000800Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-009-003 — Work Orders & Shopfloor Execution

> **Stage 2 deliverable.** Third Sprint PRD for **MOD-009 Manufacturing** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines, Accepted ADRs, the Manufacturing Foundation authored in `SPR-MOD-009-001`, and the Production Planning surface authored in `SPR-MOD-009-002`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-009-003` (permanent) |
| Parent Module | `MOD-009` — Manufacturing |
| Parent Sprint Plan | [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-009-002`](./SPR-MOD-009-002-production-planning-and-scheduling.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-009-004`, `SPR-MOD-009-005`, `SPR-MOD-009-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Work-order-to-completion** business process for BusinessOS: allow a Shopfloor Supervisor and Operators to release a released-ready Production Plan into a Work Order, execute the Work Order on the shopfloor via Production Entry capture, and complete the Work Order — emitting `WorkOrderReleased` on release and `ProductionCompleted` on completion, and invoking MES / SCADA / IoT integrations via `ENG-023` where configured for the tenant/company.

> **Manufacturing Ownership Convention (re-stated).** The Manufacturing module owns the business semantics of Work Order and Production Entry transactions, the shopfloor-execution state machine, and the emission of Manufacturing-lifecycle events. ERP Core Engines provide shared infrastructure (authorization, audit, document, attachment, workflow, approval, rules, automation, integration, eventing, notification) but **MUST NOT** redefine Manufacturing business rules. Stock ledgers, reservations, and stock-movement postings remain exclusive to **MOD-005 Inventory**. Financial posting remains exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**.

#### 1.1.1 Work Order and Production Entry Authority

The **Work Order** and **Production Entry** transactions are authoritatively owned by MOD-009 Manufacturing and originate in this sprint. No other module MAY create, edit, close, or independently maintain parallel Work Order / Production Entry records. Downstream sprints and modules consume Work Order and Production Entry data through Manufacturing-owned read APIs and Manufacturing-owned events (`WorkOrderReleased`, `ProductionCompleted`); they MUST NOT redefine these entities or their lifecycles.

#### 1.1.2 Manufacturing ↔ Inventory Boundary (Stock Movements)

- **MOD-005 Inventory** owns the stock ledger, inventory movements, and reservations. Any consumption of raw material or production of finished output that materializes as a stock movement is posted by MOD-005 in response to Manufacturing-emitted events; this sprint does not write to the stock ledger.
- **MOD-009 Manufacturing** captures on the Production Entry the Manufacturing-owned facts (quantities produced, quantities consumed against the Work Order's BOM, operational timings) and emits `ProductionCompleted` for MOD-005 to consume.

#### 1.1.3 Manufacturing ↔ Accounting and Platform Boundary

- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting. This sprint writes no journal entries and invokes no posting engine.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Manufacturing consumes these read-only via `ENG-002`.

#### 1.1.4 MES / SCADA / IoT Integration Authority

Where the tenant/company configuration registers an external MES, SCADA, or IoT endpoint, Manufacturing invokes the endpoint via `ENG-023` Integration. This sprint delivers the invocation seam and the shopfloor-execution surface; the external endpoints themselves are external systems and are not owned by Manufacturing.

Ownership boundaries authored in `SPR-MOD-009-001` §1.1 and `SPR-MOD-009-002` §1.1 SHALL NOT be redefined here.

### 1.2 In Scope

- **Work Order transaction lifecycle:** release, edit, execute, hold, resume, complete, cancel, and archive Work Orders derived from a release-ready Production Plan authored in `SPR-MOD-009-002` under a tenant/company.
- **Production Entry transaction lifecycle:** create, edit, submit, correct, and cancel Production Entries against an open Work Order — capturing produced quantity, consumed quantities against the Work Order's BOM composition (Manufacturing-owned facts only), and operational timings.
- **Shopfloor execution surface:** the Manufacturing-owned execution state machine (draft → released → in-progress → on-hold → completed → cancelled/archived) covering the Work Order and its Production Entries.
- **Event emission:**
  - `WorkOrderReleased` — published via `ENG-024` on Work Order release.
  - `ProductionCompleted` — published via `ENG-024` on Work Order completion.
- **MES / SCADA / IoT invocation via `ENG-023`** where configured on the (tenant, company) scope; opaque to Manufacturing business semantics.
- **Workflow and approval:** Work Order release and Production Entry submission drive through `ENG-010` Workflow and `ENG-011` Approval per Manufacturing configuration authored in `SPR-MOD-009-001`.
- **Automation triggers:** consumption-driven automation via `ENG-013` for release-ready Production Plans and shopfloor lifecycle transitions.
- **Document and attachment surfaces:** Work Order and Production Entry documents (via `ENG-007`) and attachments (via `ENG-008`).
- **Audit:** every Work Order and Production Entry lifecycle transition is audited via `ENG-004` per `ADR-014`.
- **Notifications:** supervisor and operator notifications via `ENG-025` at configured Work Order and Production Entry lifecycle transitions.

### 1.3 Out of Scope

- Production Plan intake, material-availability confirmation, and initial scheduling — `SPR-MOD-009-002`.
- BOM, Routing, Work Center, Machine, Operation master authoring and Manufacturing configuration — `SPR-MOD-009-001`.
- Sub-contract Challan transactions and sub-contractor dispatch/return — `SPR-MOD-009-004`.
- Quality Inspection transactions, quality-rejection handling, and yield/scrap tracking — `SPR-MOD-009-005`.
- Manufacturing analytics, dashboards, exports, and audit-readiness surface — `SPR-MOD-009-006`.
- Item master, stock ledger, inventory movements, reservations — owned by MOD-005 Inventory.
- Financial postings for production consumption or output — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-009-003`:

- **Business capabilities.**
  - A Shopfloor Supervisor can release a release-ready Production Plan into one or more Work Orders under a tenant/company.
  - A Shopfloor Supervisor can edit, hold, resume, complete, cancel, and archive Work Orders per the Manufacturing-owned execution state machine.
  - An Operator can capture Production Entries against an open Work Order, recording produced quantity, consumed quantities against the Work Order's BOM composition, and operational timings.
  - `WorkOrderReleased` and `ProductionCompleted` events are published via `ENG-024` on the corresponding lifecycle transitions.
  - MES / SCADA / IoT integrations are invoked via `ENG-023` where configured on the (tenant, company) scope.
- **Workflow and approval.** Work Order release and Production Entry submission flows registered via `ENG-010` and `ENG-011`, keyed to Manufacturing approval-threshold configuration authored in `SPR-MOD-009-001`.
- **Event registration.** Publisher-side registrations for `WorkOrderReleased` and `ProductionCompleted` declared and wired against `ENG-024` per the authoritative event catalog.
- **Audit artifacts.** An audit record exists for every Work Order and Production Entry lifecycle transition via `ENG-004`.
- **Notification artifacts.** Supervisor and operator notifications wired via `ENG-025` at configured lifecycle transitions.
- **Document and attachment artifacts.** Work Order and Production Entry documents rendered via `ENG-007`; attachments surfaced via `ENG-008`.
- **Documentation updates.** This Sprint PRD; sprint catalog entry for `SPR-MOD-009-003`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-009 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Work orders and shopfloor execution; submodule Work Orders | Work Order and Production Entry transaction lifecycles; shopfloor execution surface |
| §3 Personas — Shopfloor Supervisor (primary), Operator (primary), Production Planner (secondary — read) | User stories (§4) |
| §4 Business Processes — Work-order-to-completion | End-to-end release → execute → complete flow |
| §6 Transactions — Work Order, Production Entry | Transaction lifecycles authored here |
| §8 Integration Points — `WorkOrderReleased`, `ProductionCompleted` (published); MES / SCADA / IoT (external via `ENG-023`) | Event emission and integration invocation (§8, §11) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Manufacturing Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Work orders and shopfloor execution (§2) | `SPR-MOD-009-003` |

This allocation is unique; no other Manufacturing sprint claims "Work orders and shopfloor execution" as an originating capability. The **Work Orders** submodule (Sprint Plan §4.2) is originating-allocated exclusively to `SPR-MOD-009-003`.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Work orders and shopfloor execution* and submodule *Work Orders* → this Sprint PRD → deliverables in §2.
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3; every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Shopfloor Supervisor, I want to release a release-ready Production Plan into one or more Work Orders under a company, so that shopfloor execution has an authoritative work object.*
- **US-002.** *As a Shopfloor Supervisor, I want to edit, hold, resume, complete, cancel, and archive Work Orders through the Manufacturing execution state machine, so that shopfloor state remains deterministic and auditable.*
- **US-003.** *As an Operator, I want to capture Production Entries against an open Work Order — recording produced quantity, consumed quantities against the BOM composition, and operational timings — so that Manufacturing-owned execution facts are captured accurately.*
- **US-004.** *As a downstream module (MOD-005 Inventory, MOD-002 Accounting, MOD-009 Sprint 5, MOD-017 Analytics), I want `WorkOrderReleased` and `ProductionCompleted` events published via `ENG-024`, so that downstream state transitions can occur without redefining Manufacturing semantics.*
- **US-005.** *As a tenant/company with a configured MES / SCADA / IoT endpoint, I want the shopfloor surface to invoke the endpoint via `ENG-023` at the appropriate transitions, so that external systems remain synchronized without cross-cutting Manufacturing business rules.*
- **US-006.** *As a Shopfloor Supervisor, I want Work Order release and Production Entry submission to run through `ENG-010` Workflow and `ENG-011` Approval keyed to Manufacturing configuration authored in Sprint 1, so that approval semantics are consistent across the module.*
- **US-007.** *As a Shopfloor Supervisor or Operator, I want Work Order and Production Entry documents rendered via `ENG-007` and attachments surfaced via `ENG-008`, so that supporting evidence is captured against the authoritative transaction.*
- **US-008.** *As a security reviewer, I want every Work Order and Production Entry lifecycle transition audited via `ENG-004`, so that shopfloor history can be reconstructed from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then. Objective and testable.

### 5.1 Work Order release (US-001)

- **Given** a release-ready Production Plan authored in `SPR-MOD-009-002` whose material-availability state is confirmed and whose approval state is approved, under a tenant/company,
  **when** a Shopfloor Supervisor releases it,
  **then** one or more Work Orders are persisted with stable identifiers unique within the company, the release is audited, and `WorkOrderReleased` is published via `ENG-024` per the authoritative event catalog.
- **Given** a Production Plan whose material-availability is not confirmed or whose approval is not approved,
  **when** release is attempted,
  **then** the release is rejected deterministically (per the plan-release gate enforced in `SPR-MOD-009-002`); no Work Order is created and no event is published.

### 5.2 Work Order lifecycle (US-002)

- **Given** an open Work Order,
  **when** the Supervisor edits, holds, resumes, completes, cancels, or archives it,
  **then** the transition is validated against the Manufacturing-owned execution state machine, persisted deterministically, and audited.
- **Given** a completed Work Order,
  **when** completion is finalized,
  **then** `ProductionCompleted` is published via `ENG-024` per the authoritative event catalog.

### 5.3 Production Entry capture (US-003)

- **Given** an open Work Order under a tenant/company,
  **when** an Operator submits a Production Entry capturing produced quantity, consumed BOM-composition quantities, and operational timings,
  **then** the entry is persisted with a stable identifier unique within the company, linked to the Work Order, and audited.
- **Given** a Production Entry that references a Work Order in a different company, an archived/cancelled Work Order, or BOM components not present in the Work Order's BOM composition,
  **when** submission is attempted,
  **then** the submission is rejected deterministically.

### 5.4 Event emission (US-004)

- **Given** a Work Order release,
  **when** it completes,
  **then** exactly one `WorkOrderReleased` event is published via `ENG-024` per the authoritative event catalog envelope and delivery guarantee.
- **Given** a Work Order completion,
  **when** it completes,
  **then** exactly one `ProductionCompleted` event is published via `ENG-024` per the authoritative event catalog envelope and delivery guarantee.

### 5.5 MES / SCADA / IoT invocation (US-005)

- **Given** a tenant/company with a configured MES / SCADA / IoT endpoint,
  **when** a Work Order lifecycle transition or Production Entry submission occurs at a configured invocation point,
  **then** `ENG-023` invokes the endpoint deterministically and the outcome is audited via `ENG-004`.
- **Given** a tenant/company with no configured endpoint,
  **when** the transition occurs,
  **then** no invocation is attempted and Manufacturing state advances normally.

### 5.6 Workflow and approval (US-006)

- **Given** the Manufacturing approval-threshold configuration authored in `SPR-MOD-009-001` resolved for the plan's (tenant, company) scope via `ENG-005`,
  **when** a Work Order release or Production Entry submission is requested,
  **then** `ENG-010` Workflow drives the appropriate approval steps and `ENG-011` records approver decisions; every state transition is audited.

### 5.7 Document and attachment (US-007)

- **Given** a Work Order or Production Entry,
  **when** the corresponding document is requested,
  **then** it is rendered via `ENG-007` bound to the authoritative transaction record.
- **Given** a Work Order or Production Entry,
  **when** an attachment is added or removed,
  **then** the attachment is persisted via `ENG-008` and the operation is audited.

### 5.8 Audit (US-008)

- **Given** any Work Order or Production Entry lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, transaction identifier, transition type, and timestamp.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any Work Order or Production Entry read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.10 Ownership consumption invariants

- **Given** any Manufacturing code path that consumes or produces stock material,
  **when** it needs to reflect stock state,
  **then** it emits the appropriate Manufacturing event for MOD-005 to consume; the stock ledger is not written by this sprint.
- **Given** any production event with financial consequence,
  **when** it materializes,
  **then** it is emitted for MOD-002 Accounting to post; no journal entry is written by this sprint.
- **Given** any Manufacturing code path that requires identity,
  **when** it needs the actor,
  **then** it consumes it read-only via `ENG-002`; Identity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-009` — Manufacturing.
- **Module PRD:** [`docs/20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Work orders and shopfloor execution; submodule Work Orders), §3 (personas), §4 (Work-order-to-completion), §6 (Work Order, Production Entry transactions), §8 (`WorkOrderReleased`, `ProductionCompleted` published; MES/SCADA/IoT external), §12 (Engine consumption), §13 (Dependencies).

---

## 7. Dependencies

- **Parent:** `MOD-009` MODULE_PRD.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-009-002` — Production Planning & Scheduling.
- **Transitive upstream dependency:** `SPR-MOD-009-001` — Manufacturing Foundation (BOM & Routing).
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, audit review.
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — consumer of `WorkOrderReleased` and `ProductionCompleted` for stock movements.
- **Downstream sprints:** `SPR-MOD-009-004` (Sub-contracting) and `SPR-MOD-009-005` (Quality, Yield & Scrap) depend on this sprint; `SPR-MOD-009-006` consumes Work Order and Production Entry data.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined**. Each engine is a subset of the Module PRD engine union per Module PRD §12 and matches Sprint Plan §5 (Engine Consumption Map) for `SPR-MOD-009-003`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Work Order and Production Entry actions. |
| `ENG-004` Audit | Records every Work Order and Production Entry lifecycle transition. |
| `ENG-007` Document | Renders Work Order and Production Entry documents. |
| `ENG-008` Attachment | Persists attachments against Work Orders and Production Entries. |
| `ENG-010` Workflow | Drives Work Order release and Production Entry submission lifecycles deterministically. |
| `ENG-011` Approval | Records approver decisions per Manufacturing approval-threshold configuration. |
| `ENG-012` Rules | Evaluates structural validations for Work Order and Production Entry transitions. |
| `ENG-013` Automation | Automates transitions from release-ready Production Plans and shopfloor lifecycle events. |
| `ENG-023` Integration | Invokes configured MES / SCADA / IoT endpoints at the shopfloor invocation points. |
| `ENG-024` Eventing | Publishes `WorkOrderReleased` and `ProductionCompleted` per the authoritative event catalog. |
| `ENG-025` Notification | Emits supervisor and operator notifications at configured lifecycle transitions. |

Manufacturing business semantics (Work Order and Production Entry lifecycles, execution state machine, event emission triggers) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model enforced on every Work Order, Production Entry, and event publication. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Work Order and Production Entry actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Work Order | MOD-009 (this sprint) | Authoritative shopfloor work object derived from a release-ready Production Plan, bound to a BOM and Routing in the same company. |
| Production Entry | MOD-009 (this sprint) | Authoritative shopfloor execution record capturing produced quantity, consumed BOM-composition quantities, and operational timings against a Work Order. |
| Work Order Execution State | MOD-009 (this sprint) | Manufacturing-owned execution state machine (draft, released, in-progress, on-hold, completed, cancelled, archived). |
| Work Order Document / Attachment | MOD-009 (this sprint, via `ENG-007` / `ENG-008`) | Rendered document and supporting attachments bound to the Work Order. |
| Production Entry Document / Attachment | MOD-009 (this sprint, via `ENG-007` / `ENG-008`) | Rendered document and supporting attachments bound to the Production Entry. |
| MES/SCADA/IoT Invocation Record | MOD-009 (this sprint) | Manufacturing-owned record of `ENG-023` invocation outcomes at shopfloor invocation points. |

### 10.2 Relationships

- A **company** (owned by MOD-001) owns zero or more **Work Orders**.
- A **Work Order** MUST derive from exactly one release-ready **Production Plan** (Sprint 2) in the same company.
- A **Work Order** MAY have zero or more **Production Entries**, each linked to it.
- A **Production Entry** references BOM composition items owned by the Work Order's bound BOM (Sprint 1); it does not redefine them.
- A **Work Order** and each **Production Entry** MAY have zero or more attachments and exactly one rendered document per rendered request.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-009` per the Manufacturing Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **BOM**, **Routing**, **Work Center**, **Machine**, **Operation** entities are owned by `SPR-MOD-009-001`.
- The **Production Plan** entity is owned by `SPR-MOD-009-002`.
- The **Item** entity and stock-ledger state are owned by MOD-005 Inventory and are consumed read-only through BOM composition references; not Manufacturing-owned.
- Financial-posting entities are owned by MOD-002 Accounting; not Manufacturing-owned.

Physical schema is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

| Event | Trigger | Consumed By (per authoritative catalog) |
| --- | --- | --- |
| `WorkOrderReleased` | A Work Order transitions from draft/pending to released. | MOD-005 Inventory (stock reservations/movements), MOD-009 Sprints 4–6, MOD-017 Analytics. |
| `ProductionCompleted` | A Work Order transitions to completed. | MOD-005 Inventory (stock movements for produced output and consumed BOM composition), MOD-002 Accounting (posting via `ENG-015` / `ENG-016`), MOD-009 Sprints 4–6, MOD-017 Analytics. |

### 11.2 Consumed

Sprint 3 consumes **no new domain events**. Transitions in this sprint are driven by Manufacturing-owned actions on the Production Plan authored in `SPR-MOD-009-002`; automation via `ENG-013` operates over Manufacturing-owned state, not over external events consumed here.

Payload contracts remain owned by the authoritative event catalog. Any event name not present in the authoritative event catalog at authoring time is mapped to its authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Work Order, Production Entry, and event publication.
- [ ] Every Work Order and Production Entry lifecycle transition produces an audit record via `ENG-004`.
- [ ] `WorkOrderReleased` and `ProductionCompleted` are published via `ENG-024` per the authoritative event catalog envelope and delivery guarantee.
- [ ] MES / SCADA / IoT integrations are invoked via `ENG-023` where configured and audited.
- [ ] Manufacturing configuration authored in `SPR-MOD-009-001` is consumed via `ENG-005`; no new configuration keys are registered here.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md`); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-009_SPRINT_PLAN.md` §2 (`SPR-MOD-009-003`):

- Work Orders can be released, executed on the shopfloor, and completed.
- `WorkOrderReleased` and `ProductionCompleted` events are published via `ENG-024`.
- MES / SCADA / IoT integrations are invoked via `ENG-023` where configured.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **Risk ID:** R-01
  - **Description:** MOD-009 depends on `SPR-MOD-009-002` release-ready Production Plans being stable, including plan-release-gate enforcement.
  - **Impact:** Regressions against Sprint 2 semantics would block Work Order release.
  - **Mitigation:** Treat Sprint 2 outputs as an internal contract; escalate drift as a Sprint 2 defect.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-009 depends on `SPR-MOD-009-001` masters (BOM, Routing, Work Center, Machine, Operation) being stable.
  - **Impact:** Regressions against Sprint 1 masters corrupt Work Order and Production Entry references.
  - **Mitigation:** Treat Sprint 1 outputs as an internal contract; escalate drift as a Sprint 1 defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Downstream MOD-005 Inventory postings depend on the `WorkOrderReleased` and `ProductionCompleted` event contracts being stable per the authoritative event catalog.
  - **Impact:** Drift in event envelopes would corrupt stock movements.
  - **Mitigation:** Publish events per the authoritative event catalog only; escalate any envelope change through event-catalog governance.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** MES / SCADA / IoT endpoints are external systems outside Manufacturing ownership; endpoint reliability and semantics are external contracts.
  - **Impact:** External failures could stall shopfloor state advancement if not correctly surfaced.
  - **Mitigation:** Encapsulate all external calls behind `ENG-023`; surface failures via `ENG-004` audit and `ENG-025` notifications; do not couple Manufacturing state advancement to external success where the tenant has not opted in.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Scope-creep from downstream sprints (`SPR-MOD-009-004` sub-contracting, `SPR-MOD-009-005` quality/yield/scrap, `SPR-MOD-009-006` analytics) into this sprint.
  - **Impact:** Silent absorption of downstream scope would dilute the Work-order-to-completion surface.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions belonging to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Manufacturing MUST NOT maintain its own stock ledger or write journal entries; MOD-005 owns the stock ledger, MOD-002 owns postings.
  - **Impact:** Blurring these boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Manufacturing ↔ Inventory (§1.1.2) and Manufacturing ↔ Accounting (§1.1.3) boundaries at every code path and event contract.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Published events `WorkOrderReleased` and `ProductionCompleted` MUST be registered in the authoritative event catalog before this sprint enters `In Progress`.
  - **Impact:** Missing or drifted registration would break stock-movement and financial-posting paths in downstream modules.
  - **Mitigation:** Register/verify via the event catalog governance process before the sprint begins; do not modify the event catalog inside this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Work Order state-machine transitions; Production Entry validation (quantity, BOM composition, timings); release-gate consumption; approval routing per threshold configuration.
- **Integration** — audit emission via `ENG-004`, document rendering via `ENG-007`, attachment persistence via `ENG-008`, workflow via `ENG-010`, approval via `ENG-011`, rules via `ENG-012`, automation via `ENG-013`, external invocation via `ENG-023`, event publication via `ENG-024`, notifications via `ENG-025`.
- **Contract** — `WorkOrderReleased` and `ProductionCompleted` event envelopes per the authoritative event catalog; MES / SCADA / IoT invocation contract surface exposed by `ENG-023`.
- **End-to-end (smoke)** — Release-to-completion smoke across a two-tenant / two-company fixture to verify `ADR-011` isolation; MES-configured tenant vs. non-MES-configured tenant to verify `ENG-023` invocation conditionality.

Sprint-specific fixtures: a Production Plan release-ready fixture (from `SPR-MOD-009-002`), a Manufacturing configuration fixture (from `SPR-MOD-009-001`), a two-company smoke fixture, and an MES/SCADA/IoT `ENG-023` stub fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Work Order execution state machine as a small deterministic FSM so audit emission (§5.8) and workflow (§5.6) are trivially satisfiable at every transition.
- Consider treating `WorkOrderReleased` and `ProductionCompleted` publication as post-commit hooks tied to the corresponding FSM edges, so event emission is coupled with the durable transition and cannot silently drift.
- Consider encapsulating MES / SCADA / IoT invocation behind a single `ENG-023`-facing seam so external failures are localized and observability signals are uniform.
- Consider modeling Production Entry consumption records as pure references to the Work Order's BOM composition rather than re-declaring BOM structure, so Sprint 1 remains the sole authority for BOM composition semantics.
- Consider aligning approval routing for Work Order release and Production Entry submission with the same threshold-configuration surface used in `SPR-MOD-009-002`, so approver ergonomics remain consistent across the Plan→Order→Entry chain.

These notes are **non-authoritative**.

---

## 17. Review Gate

1. **Does the sprint have exactly one objective?** Yes. Deliver the Work-order-to-completion process — Work Order release, Production Entry capture, shopfloor execution, event emission, and external integration invocation (§1.1).
2. **Does every feature trace to a specific Module PRD section?** Yes. See §3 and §3.2.
3. **Are engines and ADRs consumed rather than redefined?** Yes. §8 and §9 under the Manufacturing Ownership Convention.
4. **Are out-of-scope items enumerated and linked to their owning sprints?** Yes. §1.3.
5. **Are acceptance criteria objective and testable?** Yes. §5 Given/When/Then.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?** Yes. §2, §12, §13 distinct.
7. **Does the next reserved sprint (`SPR-MOD-009-004`) begin immediately after this one completes?** Yes. Sub-contracting is the immediate successor per Sprint Plan §2.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md)
- Predecessor Sprints — [`./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md`](./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md), [`./SPR-MOD-009-002-production-planning-and-scheduling.md`](./SPR-MOD-009-002-production-planning-and-scheduling.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
