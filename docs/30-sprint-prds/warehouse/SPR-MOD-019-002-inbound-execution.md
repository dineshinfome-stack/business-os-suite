---
title: "SPR-MOD-019-002 — Inbound Execution"
summary: "Sprint PRD for the inbound execution layer of MOD-019 Warehouse: inbound dock appointment scheduling, unloading task lifecycle, inbound quality inspection hold, putaway task generation and execution, and inbound handover confirmation to MOD-005 Inventory. Consumes upstream `GoodsReceived` (MOD-004) and `ProductionCompleted` (MOD-009) events; is confirmed by `StockReceived` (MOD-005). Consumes ERP Core Engines and Accepted ADRs; never redefines them. Does not own item master, warehouse master, bin master, or the stock ledger (owned by MOD-005 Inventory)."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-11"
sprint_id: "SPR-MOD-019-002"
parent_module: "MOD-019"
parent_sprint_plan: "MOD-019_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "8.9.3"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-010", "ENG-012", "ENG-014", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
related_events: ["InboundAppointmentScheduled", "UnloadingCompleted", "PutawayCompleted", "GoodsReceived", "ProductionCompleted", "StockReceived"]
tags: ["sprint", "prd", "warehouse", "inbound", "mod-019"]
document_type: "Sprint PRD"
---

# SPR-MOD-019-002 — Inbound Execution

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-019 Warehouse** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-019-002` (permanent) |
| Parent Module | `MOD-019` — Warehouse |
| Parent Sprint Plan | [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Large |
| Owner | Operations (inherited verbatim from parent Module PRD `docs/20-module-prds/warehouse/MODULE_PRD.md`) |
| Upstream Sprint | [`SPR-MOD-019-001`](./SPR-MOD-019-001-warehouse-foundation.md) (Warehouse Foundation) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (all frozen) |
| Downstream Sprints | `SPR-MOD-019-003` … `SPR-MOD-019-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Inbound Execution** layer of BusinessOS Warehouse operations: inbound dock appointment scheduling against the calendar registered in `SPR-MOD-019-001`, unloading task lifecycle, inbound quality inspection hold, putaway task generation and execution against Inventory-owned warehouse/bin master, and inbound handover confirmation to MOD-005 Inventory. Inbound execution is driven by upstream `GoodsReceived` (MOD-004 Purchase) and `ProductionCompleted` (MOD-009 Manufacturing) events, and is confirmed by the `StockReceived` event owned by MOD-005 Inventory once the stock ledger effect of putaway is booked.

> **Inbound Execution Ownership Convention.** MOD-019 Warehouse owns the operational lifecycle of inbound dock appointments, unloading tasks, inbound quality inspection holds, and putaway tasks. Warehouse emits inbound domain events describing physical execution and consumes read-only warehouse/bin master, item master, and stock balance surfaces from MOD-005 Inventory. Warehouse does **not** own the stock ledger, item master, warehouse master, bin master, purchase document lifecycle, delivery document lifecycle, or accounting posting. This complements — and does not redefine — the ownership boundaries established by `MOD001_PLATFORM_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, and by `SPR-MOD-019-001`.

#### 1.1.1 Inventory Ledger Boundary

**Architectural invariant.** Inventory transactions SHALL occur only through approved Inventory (`MOD-005`) module integration contracts. This Sprint SHALL NOT directly mutate inventory balances or valuation, and SHALL NOT write to the stock ledger. Putaway completion emits `PutawayCompleted` via `ENG-024` Event Engine; MOD-005 Inventory owns the corresponding ledger effect and confirms it by publishing `StockReceived`. Warehouse never writes to the ledger and never derives valuation.

#### 1.1.2 Master Data Consumption Boundary

Item master, unit-of-measure master, warehouse master, bin/location master, and stock balance are owned by MOD-005 Inventory per `MOD005_INVENTORY_BASELINE_v1`. This sprint MUST NOT create, edit, archive, or independently maintain any of these entities. Putaway target bin validation, warehouse resolution, and item resolution are performed via read-only MOD-005 APIs. No parallel copy of Inventory master data is created here.

#### 1.1.3 Purchase & Manufacturing Consumption Boundary

Purchase document ownership (purchase order, goods receipt note) is owned by MOD-004 Purchase per `MOD004_PURCHASE_BASELINE_v1`. Manufacturing production order ownership is owned by MOD-009 Manufacturing. Warehouse consumes the `GoodsReceived` and `ProductionCompleted` events as drivers for inbound execution planning; it does not create, edit, or archive purchase or production documents.

#### 1.1.4 Foundation Consumption Boundary

Warehouse zone master, warehouse area master, dock door master, equipment master, labor resource master, task type registry, dock appointment calendar, warehouse operations configuration namespace, and warehouse numbering series registrations are owned by `SPR-MOD-019-001`. This sprint consumes those foundations and MUST NOT redefine them. Dock appointments in this sprint bind to calendar windows registered by Sprint 001.

#### 1.1.5 Accounting Boundary

Accounting (`MOD-002`) owns accounting vouchers, journal posting, ledger posting, and financial reporting. Inbound Execution MUST NOT create accounting journals, ledger entries, or accounting voucher lifecycles. Warehouse events may be consumed by MOD-002 downstream; that consumption is not owned here.

#### 1.1.6 Governance Complement

This Sprint complements — and does not redefine — `MOD001_PLATFORM_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, and `SPR-MOD-019-001`. Ownership established by those artifacts is consumed and preserved; it is not overridden here. No ownership boundary is redefined by this sprint.

### 1.2 In Scope

- **Inbound Dock Appointment.** Creation, rescheduling, cancellation, and closure of inbound dock appointments against a calendar window registered in Sprint 001, driven by upstream `GoodsReceived` and `ProductionCompleted` events.
- **Unloading Task.** Task creation on appointment arrival, assignment to labor and equipment resources (registered by Sprint 001), execution recording, exception capture, and closure.
- **Inbound Quality Inspection Hold.** Placing received quantities on inspection hold, recording inspection outcomes (accept, reject, rework), and releasing or diverting held quantities.
- **Putaway Task.** Generation of putaway tasks for accepted, released quantities; putaway target bin resolution via read-only Inventory bin master; execution recording; and putaway completion event emission.
- **Inbound Handover Confirmation.** Emission of `PutawayCompleted` via `ENG-024` and reconciliation with the `StockReceived` confirmation from MOD-005 Inventory.
- **Inbound Exception Handling.** Recording and resolving inbound exceptions (short receipt, over-receipt, damaged goods, wrong item, unscheduled arrival) within the appointment / unloading / putaway lifecycle.
- **Audit integration.** Every state-changing operation on the entities above is audited via `ENG-004` per `ADR-014`.
- **Authorization.** All operations are authorized via `ENG-002` under `ENG-003` permission definitions per `ADR-032`.
- **Numbering.** Concrete numbers for inbound dock appointment, unloading task, inbound quality inspection hold, and putaway task are issued via `ENG-017` from the series registered by Sprint 001.
- **Notification.** Operational notifications (appointment scheduled, exception raised, task assigned) are emitted via `ENG-025`.

### 1.3 Out of Scope

- Warehouse zone master, area master, dock door master, equipment master, labor resource master, task type registry, dock appointment calendar, warehouse operations configuration namespace, warehouse numbering series **registration** — owned by `SPR-MOD-019-001`.
- Item master, unit-of-measure master, warehouse master, bin/location master, stock balance, stock ledger — owned by **MOD-005 Inventory**. This sprint consumes those read-only.
- Storage and slotting (bin allocation strategy execution, slotting change order lifecycle, internal replenishment task lifecycle) — owned by `SPR-MOD-019-003`. Slotting rule master also owned there.
- Outbound execution (wave/batch/order pick plan, pick task, pack task, outbound quality check) — owned by `SPR-MOD-019-004`.
- Yard, dock, and load-out execution (outbound dock appointment, loading task, dispatch handover) — owned by `SPR-MOD-019-005`.
- Warehouse labor assignment execution reporting, labor productivity, equipment utilization, KPIs, dashboards, audit-readiness surface — owned by `SPR-MOD-019-006`.
- Purchase document ownership (purchase order, goods receipt note) — owned by **MOD-004 Purchase**.
- Manufacturing production order ownership — owned by **MOD-009 Manufacturing**.
- Delivery document ownership — owned by **MOD-003 Sales**.
- Accounting vouchers, journal posting, ledger posting — owned by **MOD-002 Accounting**.
- Concrete database schema, API contracts, UI mockups, source code, migrations, RLS policies.
- Numbering algorithms, authorization enforcement logic, audit persistence, event dispatch machinery, workflow state machines, scheduler mechanics — implemented by the respective engines.

## 2. Sprint Scope

### 2.1 In-Scope Business Capabilities

Aligned verbatim with the authoritative Capability Allocation Matrix in [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md) §4.1 for `SPR-MOD-019-002`:

- Inbound execution (dock scheduling, unloading, quality inspection hold, putaway task generation and execution).

Transactional entities allocated to this sprint (Sprint Plan §4.3):

- Dock Appointment (inbound), Unloading Task, Inbound Quality Inspection Hold, Putaway Task.

Business processes allocated to this sprint (Sprint Plan §4.4 / Module PRD §4):

- Dock-to-Stock inbound flow.

### 2.2 Out-of-Scope Business Capabilities

Every capability originating in a sibling sprint is excluded here:

- Warehouse operations configuration and foundation masters — owned by `SPR-MOD-019-001`.
- Storage and slotting — owned by `SPR-MOD-019-003`.
- Outbound execution — owned by `SPR-MOD-019-004`.
- Yard, dock, and load-out — owned by `SPR-MOD-019-005`.
- Warehouse labor, equipment, and analytics — owned by `SPR-MOD-019-006`.

No capability allocated to `SPR-MOD-019-001` or `SPR-MOD-019-003` … `SPR-MOD-019-006` is implemented in this Sprint PRD.

## 3. Business Capabilities

Each capability is traceable to the parent [MOD-019 Warehouse Module PRD](../../20-module-prds/warehouse/MODULE_PRD.md).

- **BC-001 — Inbound Dock Appointment Lifecycle.** Schedule, reschedule, cancel, and close inbound dock appointments against calendar windows registered by Sprint 001. Parent Module PRD §2, §6.
- **BC-002 — Unloading Task Lifecycle.** Create, assign, execute, and close unloading tasks per inbound appointment. Parent Module PRD §2, §6.
- **BC-003 — Inbound Quality Inspection Hold.** Place received quantities on inspection hold; record accept/reject/rework outcomes; release or divert held quantities. Parent Module PRD §2, §6.
- **BC-004 — Putaway Task Lifecycle.** Generate, assign, execute, and close putaway tasks; validate target bins via MOD-005 read APIs. Parent Module PRD §2, §6.
- **BC-005 — Inbound Handover to Inventory.** Emit `PutawayCompleted` via `ENG-024`; reconcile with `StockReceived` from MOD-005 Inventory. Parent Module PRD §8.
- **BC-006 — Inbound Exception Handling.** Record and resolve inbound exceptions across the appointment / unloading / putaway lifecycle. Parent Module PRD §4, §7.

## 4. Functional Requirements

### 4.1 Inbound Dock Appointment

- FR-001: The system SHALL allow authorized operators to create an inbound dock appointment against a dock door and a calendar window registered by `SPR-MOD-019-001`.
- FR-002: The system SHALL allow authorized operators to reschedule or cancel an inbound dock appointment while its state permits, subject to `ENG-010` workflow rules.
- FR-003: The system SHALL reject an inbound appointment whose dock door, calendar window, source purchase order (via MOD-004), or source production order (via MOD-009) reference cannot be resolved through approved read APIs.
- FR-004: The system SHALL issue the inbound appointment number via `ENG-017` from the series registered by Sprint 001.
- FR-005: The system SHALL publish `InboundAppointmentScheduled` via `ENG-024` on appointment confirmation.

### 4.2 Unloading Task

- FR-006: The system SHALL create an unloading task on inbound appointment arrival, bound to the appointment, dock door, and assigned labor and equipment resources registered by Sprint 001.
- FR-007: The system SHALL record unloading execution progress (quantity unloaded, exceptions, timestamps) and transition the task through its lifecycle states via `ENG-010` workflow.
- FR-008: The system SHALL publish `UnloadingCompleted` via `ENG-024` on unloading closure.

### 4.3 Inbound Quality Inspection Hold

- FR-009: The system SHALL place received quantities on inspection hold when the inbound quality policy (resolved via `ENG-005` under the configuration namespace registered by Sprint 001) requires inspection.
- FR-010: The system SHALL record inspection outcomes (accept, reject, rework) and route held quantities via `ENG-010` workflow — accepted quantities proceed to putaway; rejected and rework-flagged quantities are diverted per policy.
- FR-011: The system SHALL enforce that no held quantity proceeds to putaway until the hold is released.

### 4.4 Putaway Task

- FR-012: The system SHALL generate a putaway task for each accepted, released receipt quantity.
- FR-013: The system SHALL resolve the target bin against the MOD-005 Inventory bin master read API; the system SHALL NOT create bin master records.
- FR-014: The system SHALL record putaway execution progress and transition the task through its lifecycle states via `ENG-010` workflow.
- FR-015: The system SHALL publish `PutawayCompleted` via `ENG-024` on putaway closure. The corresponding stock ledger effect is owned by MOD-005 Inventory and confirmed via `StockReceived`.
- FR-016: The system SHALL reconcile emitted `PutawayCompleted` events with the `StockReceived` confirmations consumed from MOD-005; unreconciled events SHALL raise an operational alert via `ENG-025`.

### 4.5 Inbound Exception Handling

- FR-017: The system SHALL record inbound exceptions (short receipt, over-receipt, damaged goods, wrong item, unscheduled arrival) against the appropriate lifecycle stage (appointment, unloading, hold, or putaway).
- FR-018: The system SHALL route exception resolutions via `ENG-010` workflow; resolution outcomes SHALL be audited via `ENG-004`.

### 4.6 Attachments, Notifications, Scheduling

- FR-019: The system SHALL allow authorized operators to attach documents and photos to inbound appointments, unloading tasks, inspection holds, and putaway tasks via `ENG-008` Attachment Engine.
- FR-020: The system SHALL emit operational notifications (appointment scheduled, task assigned, exception raised, putaway completed) via `ENG-025` Notification Engine.
- FR-021: The system SHALL use `ENG-014` Scheduler Engine to raise operational alerts for overdue putaway tasks and unreconciled `PutawayCompleted` events.

### 4.7 Consumed Events

- FR-022: The system SHALL consume `GoodsReceived` (from MOD-004 Purchase) to drive inbound appointment and unloading planning; the event owner remains MOD-004.
- FR-023: The system SHALL consume `ProductionCompleted` (from MOD-009 Manufacturing) to drive inbound appointment and unloading planning; the event owner remains MOD-009.
- FR-024: The system SHALL consume `StockReceived` (from MOD-005 Inventory) to confirm the ledger effect of putaway; the event owner remains MOD-005.

### 4.8 Audit, Authorization, Documents

- FR-025: Every state-changing operation on §4.1–§4.7 SHALL emit an audit record via `ENG-004` per `ADR-014`.
- FR-026: Every operation SHALL be authorized via `ENG-002` under `ENG-003` permission definitions per `ADR-032`.
- FR-027: Inbound appointment, unloading task, inspection hold, and putaway task documents SHALL be produced via `ENG-007` Document Engine where a document artifact is required by policy.

## 5. Business Processes

Execution processes only; no master-data authoring.

- **BP-001 — Dock-to-Stock Inbound Planning.** On receipt of `GoodsReceived` (MOD-004) or `ProductionCompleted` (MOD-009), the Inbound Coordinator schedules an inbound dock appointment against a calendar window; `InboundAppointmentScheduled` is published.
- **BP-002 — Unloading Execution.** On appointment arrival, the Dock Supervisor creates an unloading task, assigns labor and equipment, records execution progress, and closes the task; `UnloadingCompleted` is published.
- **BP-003 — Inbound Quality Inspection.** Where inbound quality policy requires inspection, the Quality Inspector records inspection outcomes; accepted quantities proceed to putaway; rejected and rework-flagged quantities are diverted.
- **BP-004 — Putaway Execution.** The Warehouse Operator receives a putaway task, resolves the target bin via MOD-005 read APIs, records execution progress, and closes the task; `PutawayCompleted` is published.
- **BP-005 — Inbound Handover Reconciliation.** `PutawayCompleted` emissions are reconciled with `StockReceived` confirmations from MOD-005 Inventory; unreconciled events raise an operational alert.
- **BP-006 — Inbound Exception Resolution.** Inbound exceptions raised at any lifecycle stage are routed via `ENG-010` workflow; resolutions are audited via `ENG-004`.

## 6. Governance

- **Tenant/Company/Warehouse hierarchy** per `ADR-011` Multi-Tenant Isolation. All entities in §4 are scoped under this hierarchy.
- **Authorization** per `ADR-032` (RBAC + ABAC) enforced by `ENG-002` and `ENG-003`.
- **Audit** per `ADR-014` enforced by `ENG-004`.
- **Workflow lifecycles** for appointments, unloading tasks, inspection holds, and putaway tasks are declared to `ENG-010`; no lifecycle state machine is reimplemented here.
- **Configuration** for inbound quality policy, appointment window policy, putaway strategy per zone, and notification routing resolves via `ENG-005` under the namespace registered by `SPR-MOD-019-001`.
- **Governance registrations** for this Sprint PRD are maintained in `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`, and `docs/30-sprint-prds/warehouse/README.md`. No upstream authoritative document (`MODULE_CATALOG.md`, `ENGINE_CATALOG.md`, `ADR_INDEX.md`, `event-catalog.md`, `ENGINE_USAGE_MATRIX.md`, `MODULE_PRD.md`, `MOD-019_SPRINT_PLAN.md`, `MODULE_IMPLEMENTATION_WORKFLOW.md`) is modified by this sprint.

## 7. Ownership Boundaries

- **Owned by MOD-019 Warehouse (this sprint).** Inbound Dock Appointment (transactional), Unloading Task, Inbound Quality Inspection Hold, Putaway Task, Inbound Exception Records, emission of `InboundAppointmentScheduled`, `UnloadingCompleted`, and `PutawayCompleted`.
- **Consumed read-only from `SPR-MOD-019-001`.** Warehouse zone/area master, dock door master, equipment master, labor resource master, task type registry, dock appointment calendar, warehouse operations configuration namespace, warehouse numbering series registrations.
- **Consumed read-only from MOD-005 Inventory.** Item master, unit-of-measure master, warehouse master, bin/location master, stock balance.
- **Consumed read-only from MOD-001 Platform Administration.** Tenant, Company, Branch, User, Role Registry.
- **Consumed as upstream events.** `GoodsReceived` (owned by MOD-004 Purchase), `ProductionCompleted` (owned by MOD-009 Manufacturing), `StockReceived` (owned by MOD-005 Inventory).
- **Not owned here.** Item master, warehouse master, bin master, stock balance, stock ledger, valuation, item-level policy configuration (MOD-005); purchase order and goods receipt note (MOD-004); production order (MOD-009); delivery documents (MOD-003); accounting posting (MOD-002); slotting rule master and slotting change order (SPR-MOD-019-003); outbound execution (SPR-MOD-019-004); yard, dock, and load-out (SPR-MOD-019-005); warehouse analytics (SPR-MOD-019-006).
- **Architectural invariant.** Inventory transactions SHALL occur only through approved Inventory module integration contracts. This Sprint SHALL NOT directly mutate inventory balances or valuation. Warehouse emits events; MOD-005 owns all ledger writes.
- **Prohibited.** Writes to the Inventory stock ledger. Creation of item, warehouse, or bin master records. Accounting voucher creation. Redefinition of purchase, production, or delivery document ownership. Numbering algorithm implementation.

## 8. Dependencies

- **Parent Module PRD.** [`docs/20-module-prds/warehouse/MODULE_PRD.md`](../../20-module-prds/warehouse/MODULE_PRD.md).
- **Parent Sprint Plan.** [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md).
- **Preceding Sprint PRD.** `SPR-MOD-019-001` — Warehouse Foundation.
- **Upstream frozen module baselines.** `MOD001_PLATFORM_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`.
- **Cross-module dependencies.** MOD-001 (tenant/company/branch/user), MOD-004 (`GoodsReceived` event), MOD-005 (warehouse/bin master read APIs, `StockReceived` event), MOD-009 (`ProductionCompleted` event). All resolve via `docs/MODULE_CATALOG.md`.

## 9. ERP Core Engine Consumption

Resolved verbatim from `MOD-019_SPRINT_PLAN.md` §2.002 for `SPR-MOD-019-002`. No engine behavior is redefined.

- **ENG-002 Authorization Engine.** Enforces role- and attribute-based authorization on every state-changing operation per `ADR-032`.
- **ENG-004 Audit Engine.** Emits an audit record for every state-changing operation on inbound entities per `ADR-014`.
- **ENG-007 Document Engine.** Produces inbound appointment, unloading task, inspection hold, and putaway task documents where policy requires a document artifact.
- **ENG-008 Attachment Engine.** Attaches supporting evidence (photos, delivery notes, inspection reports) to inbound entities.
- **ENG-010 Workflow Engine.** Owns state transitions for appointment, unloading task, inspection hold, putaway task, and exception lifecycles.
- **ENG-012 Rules Engine.** Enforces inbound validation rules (source document resolution, calendar-window binding, exception categorisation).
- **ENG-014 Scheduler Engine.** Raises alerts for overdue putaway tasks and unreconciled `PutawayCompleted` events.
- **ENG-017 Numbering Engine.** Issues concrete numbers for inbound appointment, unloading task, inspection hold, and putaway task from series registered by Sprint 001.
- **ENG-024 Event Engine.** Publishes `InboundAppointmentScheduled`, `UnloadingCompleted`, and `PutawayCompleted`; consumes `GoodsReceived`, `ProductionCompleted`, and `StockReceived`.
- **ENG-025 Notification Engine.** Delivers operational notifications for appointment, task assignment, exception, and putaway completion.

## 10. ADR Consumption

Resolved verbatim from `MOD-019_SPRINT_PLAN.md` §2.002. Only Accepted ADRs are referenced.

- **ADR-011 Multi-Tenant Isolation.** All inbound entities are tenant-scoped; cross-tenant reads and writes are prohibited.
- **ADR-014 Audit Strategy.** Every state-changing operation on inbound entities produces an audit record via `ENG-004`; audit fields, retention, and immutability follow the ADR.
- **ADR-032 RBAC + ABAC.** Authorization on every operation combines role-based and attribute-based policies enforced by `ENG-002` under permission definitions from `ENG-003`.

## 11. Data Model

Business entities only; no schema is defined here.

- **Inbound Dock Appointment** — appointment identifier, dock reference (from Sprint 001), calendar window reference (from Sprint 001), source purchase order or production order reference (read-only), scheduled window, appointment status, tenancy binding.
- **Unloading Task** — task identifier, parent appointment, assigned labor, assigned equipment, execution progress, exception references, task status, tenancy binding.
- **Inbound Quality Inspection Hold** — hold identifier, parent receipt line, hold quantity, inspection outcome (accept/reject/rework), disposition, hold status, tenancy binding.
- **Putaway Task** — task identifier, parent receipt line, target bin reference (read-only from MOD-005), assigned labor, assigned equipment, execution progress, task status, tenancy binding.
- **Inbound Exception Record** — exception identifier, exception category, parent lifecycle entity, resolution outcome, resolution audit, tenancy binding.

Concrete schemas, indexes, RLS policies, and physical persistence choices are implementation activities and are explicitly out of scope for this PRD.

## 12. Events

Event identifiers are resolved verbatim from the parent Module PRD §8 and `MOD-019_SPRINT_PLAN.md` §2.002. No event identifier is invented by this Sprint PRD. Formal registration in `docs/02-architecture/event-catalog.md` is a downstream governance activity outside this sprint's ownership; where an identifier is not yet catalogued, this PRD references the Sprint-Plan-allocated name verbatim and does not introduce a substitute.

**Published (owned by this sprint):**

- `InboundAppointmentScheduled` — emitted on confirmation of an inbound dock appointment.
- `UnloadingCompleted` — emitted on closure of an unloading task.
- `PutawayCompleted` — emitted on closure of a putaway task.

**Consumed (owned by upstream modules):**

- `GoodsReceived` — from MOD-004 Purchase; drives inbound execution planning.
- `ProductionCompleted` — from MOD-009 Manufacturing; drives inbound execution planning.
- `StockReceived` — from MOD-005 Inventory; confirms the ledger effect of putaway.

## 13. Integration Contracts

- **MOD-005 Inventory read APIs (read-only).** Warehouse master, bin/location master, item master, and stock-balance resolution consumed via approved MOD-005 read APIs. No writes to Inventory-owned entities are permitted. No local caching that could diverge from MOD-005.
- **MOD-004 Purchase event consumption.** `GoodsReceived` consumed via the platform event bus; no writes to Purchase-owned documents.
- **MOD-009 Manufacturing event consumption.** `ProductionCompleted` consumed via the platform event bus; no writes to Manufacturing-owned documents.
- **MOD-005 Inventory event consumption.** `StockReceived` consumed via the platform event bus; used only for handover reconciliation.
- **MOD-001 Platform Administration read APIs (read-only).** Tenant, company, branch, and user resolution consumed via approved MOD-001 read APIs.
- **ERP Core Engine contracts.** Consumed as published by their respective engine documents; never restated here.
- **Concrete request/response shapes.** Defined during implementation, not in this PRD.

## 14. Security

- All inbound entities are tenant-scoped per `ADR-011`.
- Cross-tenant reads and writes are prohibited and MUST be denied by `ENG-002`.
- Attachments carried via `ENG-008` inherit the platform data-classification scheme.
- Security-hardening standards (transport, secrets, encryption at rest) inherit from the platform baseline and are not restated here.

## 15. Authorization

- Authorization is enforced by `ENG-002` under permission definitions from `ENG-003` per `ADR-032`.
- Business-level roles referenced by this sprint (Inbound Coordinator, Dock Supervisor, Warehouse Operator, Quality Inspector, Auditor) are named for scoping purposes only; concrete grants and policies live in `ENG-003`.
- No authorization model is redefined in this Sprint PRD.

## 16. Operational Constraints

Inherited verbatim from Module PRD §11 and `docs/02-architecture/quality-attributes.md`:

- Interactive latency budget applies to inbound execution CRUD paths.
- Availability of inbound reads gates all downstream execution paths; inbound reads MUST degrade gracefully.
- Compliance follows the Data Constitution and platform data-classification rules.
- Accessibility meets the platform baseline; enforcement lives in the design system, not this PRD.

## 17. Implementation Readiness

Sprint Exit Criteria — verbatim from `MOD-019_SPRINT_PLAN.md` §2.002:

- Inbound dock appointments, unloading tasks, quality inspection holds, and putaway tasks can be created, executed, and closed.
- Putaway validates target bin against MOD-005 warehouse/bin master via read-only API.
- `InboundAppointmentScheduled`, `UnloadingCompleted`, and `PutawayCompleted` events are published via `ENG-024`; `GoodsReceived`, `ProductionCompleted`, and `StockReceived` are consumed.

Sprint completion additionally requires:

- Every acceptance-testable functional requirement in §4 has at least one observable test covering it (Given/When/Then per `SPRINT_AUTHORING_GUIDE.md` §10).
- All governance registrations in §6 are recorded exactly once.
- Repository verification (Pass 8.9.3-V) reports 15/15 Passed.
- Post-Implementation Repository Audit (Spec v1.0) reports `Repository Status: READY`.

## 18. References

- [`docs/20-module-prds/warehouse/MODULE_PRD.md`](../../20-module-prds/warehouse/MODULE_PRD.md)
- [`docs/30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-001-warehouse-foundation.md`](./SPR-MOD-019-001-warehouse-foundation.md)
- [`docs/30-sprint-prds/warehouse/README.md`](./README.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- [`docs/MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`docs/40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md)
- [`docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
