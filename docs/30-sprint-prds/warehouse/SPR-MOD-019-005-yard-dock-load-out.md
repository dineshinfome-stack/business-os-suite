---
title: "SPR-MOD-019-005 — Yard, Dock & Load-Out"
summary: "Sprint PRD for the yard, dock, and load-out layer of MOD-019 Warehouse: outbound dock appointment scheduling, yard management, loading task lifecycle, and dispatch handover. Consumes ERP Core Engines and Accepted ADRs; never redefines them. Does not own item master, warehouse master, bin master, stock ledger, valuation, sales commercial process, or accounting posting."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-11"
sprint_id: "SPR-MOD-019-005"
parent_module: "MOD-019"
parent_sprint_plan: "MOD-019_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "8.9.6"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-010", "ENG-012", "ENG-014", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
related_events: ["OutboundAppointmentScheduled", "LoadingCompleted", "DispatchHandoverCompleted"]
tags: ["sprint", "prd", "warehouse", "yard", "dock", "load-out", "mod-019"]
document_type: "Sprint PRD"
---

# SPR-MOD-019-005 — Yard, Dock & Load-Out

> **Stage 2 deliverable.** Fifth authored Sprint PRD for **MOD-019 Warehouse** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-019-005` (permanent) |
| Parent Module | `MOD-019` — Warehouse |
| Parent Sprint Plan | [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Owner | Operations (inherited verbatim from parent Module PRD `docs/20-module-prds/warehouse/MODULE_PRD.md`) |
| Upstream Sprints | [`SPR-MOD-019-001`](./SPR-MOD-019-001-warehouse-foundation.md) (Warehouse Foundation) and [`SPR-MOD-019-004`](./SPR-MOD-019-004-outbound-execution.md) (Outbound Execution) per `MOD-019_SPRINT_PLAN.md` §3 |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (all frozen) |
| Downstream Sprints | `SPR-MOD-019-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Yard, Dock & Load-Out** layer of BusinessOS Warehouse operations: outbound dock appointment scheduling, yard management (vehicle arrival, gate check-in, yard queue, vehicle departure), loading task lifecycle over packed/quality-cleared loads staged by `SPR-MOD-019-004`, and dispatch handover to the outbound counter-party. Yard, Dock & Load-Out overlays the Inventory-owned stock lifecycle and the Sales-owned commercial process; it never redefines either. All state-changing operations are emitted as domain events; the corresponding stock ledger effect of every physical outbound movement remains owned by MOD-005 Inventory, and every commercial artefact remains owned by MOD-003 Sales.

> **Yard Scheduling Ownership Convention.** MOD-019 Warehouse owns yard operations, dock operations, and yard scheduling — which encompasses dock scheduling, gate scheduling, appointment scheduling, trailer management, carrier coordination, and vehicle movement — together with the operational lifecycle of the outbound dock appointment, loading task, and dispatch handover. It publishes `OutboundAppointmentScheduled`, `LoadingCompleted`, and `DispatchHandoverCompleted`. Warehouse does **not** own sales orders, delivery notes, invoices, reservation policy, the stock ledger, valuation, item master, warehouse master, or bin master. This complements — and does not redefine — the ownership boundaries established by `MOD001_PLATFORM_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, `SPR-MOD-019-001`, `SPR-MOD-019-002`, `SPR-MOD-019-003`, and `SPR-MOD-019-004`.

#### 1.1.1 Inventory Ledger Boundary

**Architectural invariant.** Inventory transactions SHALL occur only through approved Inventory (`MOD-005`) module integration contracts. This Sprint SHALL NOT directly mutate inventory balances or valuation, and SHALL NOT write to the stock ledger. Loading completion and dispatch handover emit `LoadingCompleted` and `DispatchHandoverCompleted` via `ENG-024` Event Engine; MOD-005 Inventory owns any corresponding stock effect on the ledger. Warehouse never writes to the ledger and never derives valuation.

#### 1.1.2 Sales Commercial Boundary

Sales order, delivery note, customer master, pricing, reservation authorship, and invoicing are owned by MOD-003 Sales per `MOD003_SALES_BASELINE_v1`. This sprint MUST NOT create, edit, or shadow any sales commercial document. The outbound delivery-dispatch surface is consumed read-only for appointment authoring and dispatch handover reconciliation; the event owner remains MOD-003. No parallel copy of Sales commercial data is created here.

#### 1.1.3 Master Data Consumption Boundary

Item master, unit-of-measure master, warehouse master, bin/location master, and stock balance are owned by MOD-005 Inventory. This sprint MUST NOT create, edit, archive, or independently maintain any of these entities. Loading validation and dispatch handover reconciliation resolve against MOD-005 read APIs. No parallel copy of Inventory master data is created here.

#### 1.1.4 Foundation Consumption Boundary

Warehouse zone master, warehouse area master, dock door master, equipment master, labor resource master, task type registry, dock appointment calendar, warehouse operations configuration namespace, and warehouse numbering series registrations are owned by `SPR-MOD-019-001`. This sprint consumes those foundations and MUST NOT redefine them. Outbound dock appointment, loading task, and dispatch handover numbering series are issued through the series registered by Sprint 001.

#### 1.1.5 Outbound Execution Boundary

Wave / batch / order pick plan, pick task, pack task, and outbound quality check are owned by `SPR-MOD-019-004`. This sprint MUST NOT redefine them. Packed, quality-cleared loads staged at the outbound handover point by Sprint 004 are the read surface consumed here; loading operates only on staged loads that Sprint 004 has cleared.

#### 1.1.6 Inbound and Slotting Boundary

Inbound execution (`SPR-MOD-019-002`) and storage & slotting (`SPR-MOD-019-003`) are not authored here. Dock appointment inbound, unloading task, inbound quality inspection hold, putaway task, slotting rule master, bin allocation strategy configuration, slotting change order, and internal replenishment task remain owned by those sprints.

#### 1.1.7 Analytics Boundary

Warehouse labor productivity reports, equipment utilization reports, dock utilization reports, load-out on-time reports, KPIs, dashboards, and audit-readiness surfaces are owned by `SPR-MOD-019-006`. This sprint emits the underlying events and lifecycle records; it does not implement analytics.

#### 1.1.8 Accounting Boundary

Accounting (`MOD-002`) owns accounting vouchers, journal posting, ledger posting, and financial reporting. Yard, Dock & Load-Out MUST NOT create accounting journals, ledger entries, or accounting voucher lifecycles. Warehouse events may be consumed by MOD-002 downstream; that consumption is not owned here.

#### 1.1.9 Governance Complement

This Sprint complements — and does not redefine — `MOD001_PLATFORM_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, `SPR-MOD-019-001`, `SPR-MOD-019-002`, `SPR-MOD-019-003`, and `SPR-MOD-019-004`. Ownership established by those artifacts is consumed and preserved; it is not overridden here. No ownership boundary is redefined by this sprint.

### 1.2 In Scope

- **Outbound Dock Appointment Scheduling.** Authoring, rescheduling, cancellation, and lifecycle of outbound dock appointments over dock master and dock appointment calendar authored by Sprint 001; scheduling windows resolved via `ENG-014` Scheduler Engine and configuration namespace authored by Sprint 001.
- **Yard Management.** Vehicle arrival capture, gate check-in, yard queue authoring, yard bay/lane assignment, vehicle movement tracking, and vehicle departure capture.
- **Carrier & Trailer Coordination.** Recording carrier and trailer identity against the appointment and yard record; carrier and trailer identity are captured as attributes of the appointment/arrival record and are not master data owned by this sprint.
- **Dock Assignment.** Runtime assignment of an appointment to a dock door subject to authorization (`ENG-002`) and workflow transitions (`ENG-010`).
- **Loading Task Lifecycle.** Creation, assignment (to labor and equipment resources from Sprint 001), execution, load validation, exception capture, and closure of loading tasks over packed/quality-cleared loads staged by Sprint 004. Loading completion emits `LoadingCompleted`.
- **Load Verification.** Content, unit, quantity, seal, and destination validation against the staged load via `ENG-012` Rules Engine; failed validation raises a loading exception routed via `ENG-010`.
- **Outbound Quality Hold Gating.** Loading MUST be blocked when an unresolved outbound quality hold (owned by Sprint 004) is attached to the staged load, per Module PRD §7 outbound-quality-hold rule.
- **Dispatch Handover.** Handover confirmation to the outbound counter-party at the dock; dispatch handover emits `DispatchHandoverCompleted`.
- **Vehicle Departure.** Capture of vehicle departure from the yard and closure of the yard record.
- **Yard, Dock & Load-Out Exceptions.** Recording and resolving yard exceptions (late arrival, no-show, gate deny), dock exceptions (dock unavailable, appointment overlap), loading exceptions (validation failure, missing staged load, incomplete load), and dispatch exceptions (handover mismatch) via `ENG-010` workflow.
- **Audit integration.** Every state-changing operation on the entities above is audited via `ENG-004` per `ADR-014`.
- **Authorization.** All operations are authorized via `ENG-002` under `ENG-003` permission definitions per `ADR-032`.
- **Numbering.** Concrete numbers for outbound dock appointments, loading tasks, and dispatch handovers are issued via `ENG-017` from the series registered by Sprint 001.
- **Scheduling.** Appointment windows are scheduled via `ENG-014` Scheduler Engine.
- **Document generation.** Human-readable loading sheets, dispatch handover notes, and yard gate passes are rendered via `ENG-007` Document Engine.
- **Notification.** Operational notifications (appointment scheduled, appointment rescheduled, vehicle arrived, dock assigned, loading task assigned, loading exception raised, quality hold blocking, dispatch handover completed, vehicle departed) are emitted via `ENG-025`.

### 1.3 Out of Scope

- Warehouse zone master, area master, dock door master, equipment master, labor resource master, task type registry, dock appointment calendar, warehouse operations configuration namespace, warehouse numbering series **registration** — owned by `SPR-MOD-019-001`.
- Item master, unit-of-measure master, warehouse master, bin/location master, stock balance, stock ledger, reorder policy, valuation — owned by **MOD-005 Inventory**. This sprint consumes those read-only.
- Sales order, delivery note, customer master, pricing, reservation authorship, invoicing — owned by **MOD-003 Sales**.
- Inbound execution (dock appointment inbound, unloading, inspection hold, putaway task) — owned by `SPR-MOD-019-002`.
- Storage and slotting — owned by `SPR-MOD-019-003`.
- Wave/batch/order pick planning, pick task lifecycle, pack task lifecycle, outbound quality-check authoring — owned by `SPR-MOD-019-004`.
- Warehouse labor productivity, equipment utilization, KPIs, dashboards, audit-readiness surface — owned by `SPR-MOD-019-006`.
- Purchase and manufacturing document ownership — owned by MOD-004 and MOD-009 respectively.
- Accounting vouchers, journal posting, ledger posting — owned by **MOD-002 Accounting**.
- Concrete database schema, API contracts, UI mockups, source code, migrations, RLS policies.
- Numbering algorithms, authorization enforcement logic, audit persistence, event dispatch machinery, workflow state machines, scheduler dispatch, document rendering — implemented by the respective engines.

## 2. Sprint Scope

### 2.1 In-Scope Business Capabilities

Aligned verbatim with the authoritative Capability Allocation Matrix in [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md) §4.1 for `SPR-MOD-019-005`:

- Yard, dock, and load-out (dock appointments, yard management, loading tasks, dispatch handover).

Transactional entities allocated to this sprint (Sprint Plan §4.3):

- Dock Appointment (outbound), Loading Task, Dispatch Handover.

Business processes allocated to this sprint (Sprint Plan §4.4 / Module PRD §4):

- Stock-to-Dock (load-out half); Dock appointment scheduling.

### 2.2 Out-of-Scope Business Capabilities

Every capability originating in a sibling sprint is excluded here:

- Warehouse operations configuration and foundation masters — owned by `SPR-MOD-019-001`.
- Inbound execution — owned by `SPR-MOD-019-002`.
- Storage and slotting — owned by `SPR-MOD-019-003`.
- Outbound execution (wave/batch/order planning, picking, packing, outbound quality check) — owned by `SPR-MOD-019-004`.
- Warehouse labor, equipment, and analytics — owned by `SPR-MOD-019-006`.

No capability allocated to `SPR-MOD-019-001`, `SPR-MOD-019-002`, `SPR-MOD-019-003`, `SPR-MOD-019-004`, or `SPR-MOD-019-006` is implemented in this Sprint PRD.

## 3. Business Capabilities

Each capability is traceable to the parent [MOD-019 Warehouse Module PRD](../../20-module-prds/warehouse/MODULE_PRD.md).

- **BC-001 — Outbound Dock Appointment Scheduling.** Author, reschedule, cancel, and close outbound dock appointments over Sprint 001 dock master and calendar. Parent Module PRD §2, §4, §6.
- **BC-002 — Yard Management.** Vehicle arrival, gate check-in, yard queue, yard bay assignment, vehicle movement tracking. Parent Module PRD §2, §4.
- **BC-003 — Carrier & Trailer Coordination.** Record carrier and trailer identity as appointment/arrival attributes. Parent Module PRD §2, §4.
- **BC-004 — Dock Assignment.** Assign appointment to dock door at runtime. Parent Module PRD §2, §4, §6.
- **BC-005 — Loading Task Lifecycle.** Create, assign, execute, and close loading tasks over staged, quality-cleared loads. Parent Module PRD §2, §6.
- **BC-006 — Load Verification.** Content/unit/quantity/seal/destination validation via `ENG-012`. Parent Module PRD §6, §7.
- **BC-007 — Outbound Quality Hold Gating.** Block loading on unresolved outbound quality holds per Module PRD §7. Parent Module PRD §7.
- **BC-008 — Dispatch Handover.** Confirm handover to the outbound counter-party. Parent Module PRD §2, §6.
- **BC-009 — Vehicle Departure.** Capture vehicle departure and close yard record. Parent Module PRD §2, §4.
- **BC-010 — Yard/Dock/Loading/Dispatch Exception Handling.** Record and resolve exceptions via `ENG-010`. Parent Module PRD §4, §7.
- **BC-011 — Load-Out Event Emission.** Emit `OutboundAppointmentScheduled`, `LoadingCompleted`, and `DispatchHandoverCompleted` via `ENG-024`. Parent Module PRD §8.

## 4. Functional Requirements

### 4.1 Outbound Dock Appointment Scheduling

- FR-001: The system SHALL allow authorized planners to author outbound dock appointments over dock master and dock appointment calendar registered by Sprint 001, with scheduling windows resolved via `ENG-014`.
- FR-002: The system SHALL issue outbound dock appointment numbers via `ENG-017` from the series registered by Sprint 001.
- FR-003: The system SHALL transition outbound dock appointments through their lifecycle states (Scheduled → Rescheduled → Confirmed → Consumed → Closed / Cancelled) via `ENG-010` workflow.
- FR-004: The system SHALL publish `OutboundAppointmentScheduled` via `ENG-024` on successful appointment authoring.
- FR-005: The system SHALL audit every appointment authoring, rescheduling, cancellation, and closure event via `ENG-004` per `ADR-014`.

### 4.2 Yard Management

- FR-006: The system SHALL capture vehicle arrival at the gate, including the referenced outbound dock appointment (where applicable), carrier identity, and trailer identity.
- FR-007: The system SHALL author a yard queue entry per arrival and support yard bay/lane assignment.
- FR-008: The system SHALL track vehicle movement between yard bay, dock queue, and dock face; every movement SHALL be audited via `ENG-004`.
- FR-009: The system SHALL capture vehicle departure and close the yard record.

### 4.3 Dock Assignment

- FR-010: The system SHALL allow authorized operators to assign an outbound appointment to a dock door at runtime, subject to `ENG-002` authorization.
- FR-011: The system SHALL prevent overlapping dock assignments on the same dock door and window via `ENG-012` Rules Engine.

### 4.4 Loading Task Lifecycle

- FR-012: The system SHALL generate loading tasks against packed, quality-cleared loads staged by `SPR-MOD-019-004`, assigned to labor and equipment resources from Sprint 001.
- FR-013: The system SHALL issue loading task numbers via `ENG-017`.
- FR-014: The system SHALL transition loading tasks through their lifecycle states via `ENG-010` workflow.
- FR-015: The system SHALL render human-readable loading sheets via `ENG-007` Document Engine.
- FR-016: The system SHALL publish `LoadingCompleted` via `ENG-024` on closure of a loading task.

### 4.5 Load Verification

- FR-017: The system SHALL validate load content, unit, quantity, seal, and destination against the staged load via `ENG-012`; failed validation SHALL raise a loading exception routed via `ENG-010`.
- FR-018: The system SHALL enforce the outbound-quality-hold rule per Module PRD §7 via `ENG-012`: loading against a load with an unresolved outbound quality hold (owned by Sprint 004) SHALL be rejected.

### 4.6 Dispatch Handover

- FR-019: The system SHALL author a dispatch handover record on completion of loading, referencing the loading task, the outbound dock appointment, and the carrier/trailer identity.
- FR-020: The system SHALL issue dispatch handover numbers via `ENG-017`.
- FR-021: The system SHALL render human-readable dispatch handover notes via `ENG-007`.
- FR-022: The system SHALL publish `DispatchHandoverCompleted` via `ENG-024` on closure of a dispatch handover.

### 4.7 Yard/Dock/Loading/Dispatch Exception Handling

- FR-023: The system SHALL record yard exceptions (late arrival, no-show, gate deny), dock exceptions (dock unavailable, appointment overlap), loading exceptions (validation failure, missing staged load, incomplete load), and dispatch exceptions (handover mismatch) against the appropriate lifecycle stage.
- FR-024: The system SHALL route exception resolutions via `ENG-010`; resolution outcomes SHALL be audited via `ENG-004`.

### 4.8 Notifications

- FR-025: The system SHALL emit operational notifications (appointment scheduled, appointment rescheduled, vehicle arrived, dock assigned, loading task assigned, loading exception raised, quality hold blocking, dispatch handover completed, vehicle departed) via `ENG-025` Notification Engine.

### 4.9 Consumed Surfaces

- FR-026: The system SHALL consume the outbound delivery-dispatch surface owned by MOD-003 Sales read-only for appointment authoring and dispatch handover reconciliation; the surface owner remains MOD-003.
- FR-027: The system SHALL consume packed, quality-cleared load-staging surfaces owned by `SPR-MOD-019-004` read-only.

### 4.10 Audit, Authorization, Configuration

- FR-028: Every state-changing operation on §4.1–§4.9 SHALL emit an audit record via `ENG-004` per `ADR-014`.
- FR-029: Every operation SHALL be authorized via `ENG-002` under `ENG-003` permission definitions per `ADR-032`.
- FR-030: Yard/dock/loading/dispatch policy defaults, the outbound-quality-hold rule reference, and appointment-scheduling windows SHALL resolve via `ENG-005` under the namespace registered by Sprint 001; no configuration is hard-coded.

## 5. Business Processes

Execution processes only; no master-data authoring outside this sprint's declared ownership.

- **BP-001 — Outbound Appointment Scheduling.** The Warehouse Planner authors an outbound dock appointment over the dock master and calendar; `OutboundAppointmentScheduled` is published.
- **BP-002 — Vehicle Arrival & Yard Entry.** The Yard Operator captures vehicle arrival, gate check-in, and yard queue entry against the appointment.
- **BP-003 — Dock Assignment.** The Yard Operator or Dock Coordinator assigns the appointment to a dock door.
- **BP-004 — Loading.** The Warehouse Operator executes a loading task over a staged, quality-cleared load; load verification runs via `ENG-012`; `LoadingCompleted` is published on closure.
- **BP-005 — Dispatch Handover.** The Dispatch Operator confirms handover to the outbound counter-party; `DispatchHandoverCompleted` is published.
- **BP-006 — Vehicle Departure.** The Yard Operator captures vehicle departure and closes the yard record.
- **BP-007 — Exception Processing.** Yard/dock/loading/dispatch exceptions are routed via `ENG-010`; resolutions are audited via `ENG-004`.

## 6. Governance

- **Tenant/Company/Warehouse hierarchy** per `ADR-011` Multi-Tenant Isolation. All entities in §4 are scoped under this hierarchy.
- **Authorization** per `ADR-032` (RBAC + ABAC) enforced by `ENG-002` and `ENG-003`.
- **Audit** per `ADR-014` enforced by `ENG-004`.
- **Workflow lifecycles** for outbound dock appointments, dock assignments, loading tasks, dispatch handovers, and exception records are declared to `ENG-010`; no lifecycle state machine is reimplemented here.
- **Scheduling** of appointment windows is declared to `ENG-014`; no scheduler is reimplemented here.
- **Document rendering** for loading sheets, dispatch handover notes, and gate passes is declared to `ENG-007`; no renderer is reimplemented here.
- **Configuration** for yard/dock/loading/dispatch policy defaults, the outbound-quality-hold rule reference, and appointment-scheduling windows resolves via `ENG-005` under the namespace registered by `SPR-MOD-019-001`.
- **Governance registrations** for this Sprint PRD are maintained in `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`, and `docs/30-sprint-prds/warehouse/README.md`. No upstream authoritative document (`MODULE_CATALOG.md`, `ENGINE_CATALOG.md`, `ADR_INDEX.md`, `event-catalog.md`, `ENGINE_USAGE_MATRIX.md`, `MODULE_PRD.md`, `MOD-019_SPRINT_PLAN.md`, `MODULE_IMPLEMENTATION_WORKFLOW.md`, module baselines) is modified by this sprint.

## 7. Ownership Boundaries

- **Owned by MOD-019 Warehouse (this sprint).** Outbound Dock Appointment (transactional), Loading Task (transactional), Dispatch Handover (transactional), Yard Record, Dock Assignment, Yard/Dock/Loading/Dispatch Exception Records, emission of `OutboundAppointmentScheduled`, `LoadingCompleted`, and `DispatchHandoverCompleted`.
- **Yard Scheduling Ownership.** Yard scheduling — encompassing dock scheduling, gate scheduling, appointment scheduling, trailer management, carrier coordination, and vehicle movement — is owned here.
- **Consumed read-only from `SPR-MOD-019-001`.** Warehouse zone/area master, dock door master, equipment master, labor resource master, task type registry, dock appointment calendar, warehouse operations configuration namespace, warehouse numbering series registrations.
- **Consumed read-only from `SPR-MOD-019-004`.** Packed, quality-cleared load-staging surface (shipment preparation records); wave/batch/order pick plans, pick tasks, pack tasks, and outbound quality checks are not re-authored here.
- **Consumed read-only from MOD-005 Inventory.** Item master, unit-of-measure master, warehouse master, bin/location master, stock balance.
- **Consumed read-only from MOD-003 Sales.** Outbound delivery-dispatch surface; sales orders, delivery notes, invoices, customer master, and pricing remain owned by MOD-003.
- **Consumed read-only from MOD-001 Platform Administration.** Tenant, Company, Branch, User, Role Registry.
- **Not owned here.** Item master, warehouse master, bin master, stock balance, stock ledger, valuation, reservation policy (MOD-005); sales orders, delivery notes, invoices, customer master, pricing (MOD-003); purchase and manufacturing documents; accounting posting (MOD-002); foundation masters (SPR-MOD-019-001); inbound execution (SPR-MOD-019-002); storage and slotting (SPR-MOD-019-003); outbound execution — wave/pick/pack/outbound quality check (SPR-MOD-019-004); warehouse analytics (SPR-MOD-019-006).
- **Architectural invariant.** Warehouse SHALL NEVER directly mutate inventory balances or valuation; changes flow only through approved MOD-005 Inventory module integration contracts. Warehouse emits events; MOD-005 owns all ledger writes.
- **Prohibited.** Writes to the Inventory stock ledger. Creation of item, warehouse, or bin master records. Authoring or shadowing of sales orders, delivery notes, invoices, or customer master. Authoring or shadowing of reservation policy. Accounting voucher creation. Redefinition of foundation, inbound-execution, storage-and-slotting, or outbound-execution document ownership. Numbering algorithm implementation. Workflow, approval-routing, scheduler, or document-rendering state-machine implementation.

## 8. Dependencies

- **Parent Module PRD.** [`docs/20-module-prds/warehouse/MODULE_PRD.md`](../../20-module-prds/warehouse/MODULE_PRD.md).
- **Parent Sprint Plan.** [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md).
- **Preceding Sprint PRDs.** `SPR-MOD-019-001` — Warehouse Foundation and `SPR-MOD-019-004` — Outbound Execution (direct upstream, per Sprint Plan §3). `SPR-MOD-019-002` and `SPR-MOD-019-003` are peer siblings; their surfaces are not consumed by this sprint.
- **Upstream frozen module baselines.** `MOD001_PLATFORM_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`.
- **Cross-module dependencies.** MOD-001 (tenant/company/branch/user), MOD-003 (delivery-dispatch surface), MOD-005 (warehouse/bin master read APIs). All resolve via `docs/MODULE_CATALOG.md`.

## 9. ERP Core Engine Consumption

Resolved verbatim from `MOD-019_SPRINT_PLAN.md` §2.005 for `SPR-MOD-019-005`. No engine behavior is redefined.

- **ENG-002 Authorization Engine.** Enforces role- and attribute-based authorization on every state-changing operation per `ADR-032`. Consumption boundary: enforcement only; no policy is authored here.
- **ENG-004 Audit Engine.** Emits an audit record for every state-changing operation on yard/dock/load-out entities per `ADR-014`. Consumption boundary: emission only.
- **ENG-007 Document Engine.** Renders human-readable loading sheets, dispatch handover notes, and yard gate passes. Consumption boundary: template consumption; template governance is not owned here.
- **ENG-010 Workflow Engine.** Owns state transitions for outbound dock appointments, dock assignments, loading tasks, dispatch handovers, and exception records. Consumption boundary: declarative registration; no state-machine machinery is implemented here.
- **ENG-012 Rules Engine.** Enforces dock-assignment overlap prevention, load verification, and outbound-quality-hold gating. Consumption boundary: rule authoring only.
- **ENG-014 Scheduler Engine.** Schedules outbound appointment windows. Consumption boundary: schedule declaration only.
- **ENG-017 Numbering Engine.** Issues concrete numbers for outbound dock appointments, loading tasks, and dispatch handovers from series registered by Sprint 001. Consumption boundary: number issuance only.
- **ENG-024 Event Engine.** Publishes `OutboundAppointmentScheduled`, `LoadingCompleted`, and `DispatchHandoverCompleted`. Consumption boundary: publication only; the bus itself is not implemented here.
- **ENG-025 Notification Engine.** Delivers operational notifications for appointment lifecycle, vehicle arrival, dock assignment, loading, exceptions, dispatch handover, and vehicle departure. Consumption boundary: template consumption only.

## 10. ADR Consumption

Resolved verbatim from `MOD-019_SPRINT_PLAN.md` §2.005. Only Accepted ADRs are referenced.

- **ADR-011 Multi-Tenant Isolation.** All yard/dock/load-out entities are tenant-scoped; cross-tenant reads and writes are prohibited.
- **ADR-014 Audit Strategy.** Every state-changing operation on yard/dock/load-out entities produces an audit record via `ENG-004`; audit fields, retention, and immutability follow the ADR.
- **ADR-032 RBAC + ABAC.** Authorization on every operation, including dock assignment, loading, and dispatch handover, combines role-based and attribute-based policies enforced by `ENG-002` under permission definitions from `ENG-003`.

## 11. Data Model

Business entities only; no schema is defined here.

- **Outbound Dock Appointment** — appointment identifier, dock door reference (from Sprint 001), scheduled window, carrier identity, trailer identity, referenced outbound delivery-dispatch surface (from MOD-003), lifecycle status, tenancy binding.
- **Yard Record** — yard record identifier, vehicle identity, carrier identity, trailer identity, referenced outbound dock appointment (nullable), gate check-in timestamp, yard bay/lane assignment, movement history, departure timestamp, lifecycle status, tenancy binding.
- **Yard Queue Entry** — queue identifier, parent yard record reference, dock queue position, capture timestamp, tenancy binding.
- **Dock Assignment** — assignment identifier, appointment reference, dock door reference, assignment window, assignment status, tenancy binding.
- **Loading Task** — task identifier, parent dock assignment reference, staged-load reference (from Sprint 004), assigned labor, assigned equipment, execution progress, task status, tenancy binding.
- **Load Verification Record** — parent loading-task reference, content check, unit check, quantity check, seal check, destination check, outcome, capture timestamp.
- **Dispatch Handover** — handover identifier, referenced loading task, referenced outbound dock appointment, carrier identity, trailer identity, handover outcome, capture timestamp, tenancy binding.
- **Yard/Dock/Loading/Dispatch Exception Record** — exception identifier, exception category (yard, dock, loading, dispatch), parent lifecycle entity, resolution outcome, resolution audit, tenancy binding.

Concrete schemas, indexes, RLS policies, and physical persistence choices are implementation activities and are explicitly out of scope for this PRD.

## 12. Events

Event identifiers are resolved verbatim from the parent Module PRD §8 and `MOD-019_SPRINT_PLAN.md` §2.005. No event identifier is invented by this Sprint PRD. Formal registration in `docs/02-architecture/event-catalog.md` is a downstream governance activity outside this sprint's ownership; where an identifier is not yet catalogued, this PRD references the Sprint-Plan-allocated name verbatim and does not introduce a substitute.

**Published (owned by this sprint):**

- `OutboundAppointmentScheduled` — emitted on successful authoring of an outbound dock appointment.
- `LoadingCompleted` — emitted on closure of a loading task.
- `DispatchHandoverCompleted` — emitted on closure of a dispatch handover.

**Consumed (owned by upstream modules or sprints):**

- No new event subscriptions are introduced by this sprint. The outbound delivery-dispatch surface (MOD-003) and the Sprint 004 staged-load surface are consumed as read-only integration surfaces per §13.

## 13. Integration Contracts

- **MOD-003 Sales read-only surface.** The outbound delivery-dispatch surface, sales orders, delivery notes, customers, and pricing are consumed read-only via approved MOD-003 read APIs where needed for appointment authoring and dispatch handover reconciliation; no writes to Sales-owned entities are permitted.
- **MOD-005 Inventory read APIs (read-only).** Warehouse master, bin/location master, item master, unit-of-measure master, and stock balance consumed via approved MOD-005 read APIs. No writes to Inventory-owned entities are permitted. No local caching that could diverge from MOD-005.
- **MOD-001 Platform Administration read APIs (read-only).** Tenant, company, branch, user, and role registry resolution consumed via approved MOD-001 read APIs.
- **Warehouse foundation configuration (from Sprint 001, read-only).** Zone, area, dock, equipment, labor, task-type, dock appointment calendar, and configuration-namespace resolution via the read surface established by Sprint 001.
- **Warehouse outbound execution surface (from Sprint 004, read-only).** Packed, quality-cleared load-staging (shipment preparation records) consumed for loading task creation.
- **Outbound status publication (this sprint publishes).** Warehouse publishes outbound dock, loading, and departure status via approved integration contracts: appointment authoring emits `OutboundAppointmentScheduled`; dock arrival acknowledgement and dock assignment are published as operational status updates; appointment lifecycle changes are published as appointment status updates; loading completion emits `LoadingCompleted`; dispatch handover completion emits `DispatchHandoverCompleted`; vehicle departure is published as a departure status update. Warehouse SHALL NOT directly update Inventory Ledger or Sales Commercial state; downstream ledger effect remains owned by MOD-005 and commercial artefacts remain owned by MOD-003.
- **ERP Core Engine contracts.** Consumed as published by their respective engine documents; never restated here.
- **Concrete request/response shapes.** Defined during implementation, not in this PRD.

## 14. Security

- All yard, dock, and load-out entities are tenant-scoped per `ADR-011`.
- Cross-tenant reads and writes are prohibited and MUST be denied by `ENG-002`.
- Security-hardening standards (transport, secrets, encryption at rest) inherit from the platform baseline and are not restated here.

## 15. Authorization

- Authorization is enforced by `ENG-002` under permission definitions from `ENG-003` per `ADR-032`.
- Business-level roles referenced by this sprint (Warehouse Planner, Warehouse Operations Manager, Yard Operator, Dock Coordinator, Warehouse Operator, Dispatch Operator, Auditor) are named for scoping purposes only; concrete grants and policies live in `ENG-003`.
- Dock-assignment authorization, loading authorization, dispatch-handover authorization, and quality-hold-block override authorization are enforced under the same RBAC + ABAC framework.
- No authorization model is redefined in this Sprint PRD.

## 16. Operational Constraints

Inherited verbatim from Module PRD §11 and `docs/02-architecture/quality-attributes.md`:

- Interactive latency budget applies to appointment authoring, dock assignment, loading-task capture, load-verification capture, and dispatch-handover capture CRUD paths.
- Availability of MOD-003 delivery-dispatch and MOD-005 read APIs gates all yard, dock, and load-out operations; operations MUST degrade gracefully when either is delayed.
- Compliance follows the Data Constitution and platform data-classification rules.
- Accessibility meets the platform baseline; enforcement lives in the design system, not this PRD.

## 17. Implementation Readiness

Sprint Exit Criteria — verbatim from `MOD-019_SPRINT_PLAN.md` §2.005:

- Outbound dock appointments, loading tasks, and dispatch handovers execute end-to-end.
- Loading blocked when outbound quality hold is unresolved.
- `OutboundAppointmentScheduled`, `LoadingCompleted`, `DispatchHandoverCompleted` events are published via `ENG-024`.

Sprint completion additionally requires:

- Every acceptance-testable functional requirement in §4 has at least one observable test covering it (Given/When/Then per `SPRINT_AUTHORING_GUIDE.md` §10).
- All governance registrations in §6 are recorded exactly once.
- Repository verification (Pass 8.9.6-V) reports 15/15 Passed.
- Post-Implementation Repository Audit (Spec v1.0) reports `Repository Status: READY`.

## 18. References

- [`docs/20-module-prds/warehouse/MODULE_PRD.md`](../../20-module-prds/warehouse/MODULE_PRD.md)
- [`docs/30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-001-warehouse-foundation.md`](./SPR-MOD-019-001-warehouse-foundation.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-002-inbound-execution.md`](./SPR-MOD-019-002-inbound-execution.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-003-storage-slotting.md`](./SPR-MOD-019-003-storage-slotting.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-004-outbound-execution.md`](./SPR-MOD-019-004-outbound-execution.md)
- [`docs/30-sprint-prds/warehouse/README.md`](./README.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- [`docs/MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- [`docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
