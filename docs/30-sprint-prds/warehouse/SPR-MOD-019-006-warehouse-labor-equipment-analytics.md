---
title: "SPR-MOD-019-006 — Warehouse Labor, Equipment & Analytics"
summary: "Sprint PRD for the warehouse labor, equipment, and analytics layer of MOD-019 Warehouse: task assignment, labor productivity, equipment utilization, warehouse KPIs, operational dashboards, operational exception monitoring, audit readiness, and exports. Read-model only. Consumes ERP Core Engines and Accepted ADRs; never redefines them. Does not own HR Employee Master, Payroll, Attendance, item master, warehouse master, bin master, stock ledger, valuation, accounting posting, or cross-module KPI definitions."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-11"
sprint_id: "SPR-MOD-019-006"
parent_module: "MOD-019"
parent_sprint_plan: "MOD-019_SPRINT_PLAN.md"
iteration: "Sprint 6"
stage: "2"
pass: "8.9.7"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-020", "ENG-021", "ENG-022", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
related_events: []
tags: ["sprint", "prd", "warehouse", "labor", "equipment", "analytics", "mod-019"]
document_type: "Sprint PRD"
---

# SPR-MOD-019-006 — Warehouse Labor, Equipment & Analytics

> **Stage 2 deliverable.** Final authored Sprint PRD for **MOD-019 Warehouse** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**. This Sprint is **read-model only** — no transactional lifecycle is authored here.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-019-006` (permanent) |
| Parent Module | `MOD-019` — Warehouse |
| Parent Sprint Plan | [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md) |
| Iteration | Sprint 6 |
| Status | Draft |
| Estimated Size | Medium |
| Owner | Operations (inherited verbatim from parent Module PRD `docs/20-module-prds/warehouse/MODULE_PRD.md`) |
| Upstream Sprints | [`SPR-MOD-019-001`](./SPR-MOD-019-001-warehouse-foundation.md) … [`SPR-MOD-019-005`](./SPR-MOD-019-005-yard-dock-load-out.md) — consumes data and events produced by all prior Warehouse sprints per `MOD-019_SPRINT_PLAN.md` §3 |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (all frozen) |
| Downstream Sprints | None (final Stage 2 sprint for MOD-019). |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Warehouse Labor, Equipment & Analytics** layer of BusinessOS Warehouse operations: task assignment of labor and equipment to prior-sprint tasks; labor productivity reporting; equipment utilization reporting; warehouse operational reports (dock utilization, putaway cycle time, pick productivity, pack accuracy, load-out on-time); operational dashboards; warehouse KPI surfacing; operational exception monitoring; audit readiness; and exports. This Sprint is **read-model only**: it consumes data emitted by Sprints 001–005 and by MOD-005 Inventory, MOD-001 Platform, HR (read-only if allocated), and MOD-017 Analytics, and it publishes no new domain events.

> **Warehouse Analytics Ownership Convention.** MOD-019 Warehouse owns task assignment, labor operations, workforce scheduling, workforce assignment, equipment operations, equipment assignment, equipment utilization, warehouse KPI **computation and presentation for Warehouse-scoped KPIs**, operational monitoring, warehouse analytics (module-scoped), the audit-readiness surface, and warehouse operational reports and dashboards. Enterprise / cross-module KPI **definitions** remain owned by **MOD-017 Analytics** and are consumed read-only. Warehouse does **not** own HR Employee Master, Payroll, Attendance, the stock ledger, valuation, item master, warehouse master, bin master, or accounting posting. This complements — and does not redefine — the ownership boundaries established by `MOD001_PLATFORM_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, and `SPR-MOD-019-001` through `SPR-MOD-019-005`.

#### 1.1.1 Inventory Ledger Boundary

**Architectural invariant.** Inventory transactions SHALL occur only through approved Inventory (`MOD-005`) module integration contracts. This Sprint SHALL NOT directly mutate inventory balances or valuation, and SHALL NOT write to the stock ledger. This Sprint is read-model only; it emits no domain events that affect stock state.

#### 1.1.2 HR Ownership Boundary

HR Employee Master, HR Organization Structure, Payroll, and Attendance are owned by the HR module. This Sprint MUST NOT create, edit, archive, or shadow any HR entity. Where HR data is consumed, it is consumed read-only via approved HR APIs. Workforce assignment authored here references HR employees by identifier and does not duplicate HR master data.

#### 1.1.3 Master Data Consumption Boundary

Item master, unit-of-measure master, warehouse master, bin/location master, and stock balance are owned by MOD-005 Inventory. This Sprint MUST NOT create, edit, or independently maintain any of these entities. Analytics computations resolve against MOD-005 read APIs.

#### 1.1.4 Cross-Module KPI Definition Boundary

Cross-module and enterprise KPI **definitions** are owned by **MOD-017 Analytics**. Warehouse owns KPI **computation and presentation** only for Warehouse-scoped KPIs. Cross-module KPI definitions are consumed read-only and MUST NOT be redefined here.

#### 1.1.5 Foundation and Transactional Consumption Boundary

Warehouse foundation masters (`SPR-MOD-019-001`) and warehouse transactional lifecycles (`SPR-MOD-019-002` … `SPR-MOD-019-005`) are not re-authored here. This Sprint consumes the data and event streams they emit and MUST NOT redefine any transactional lifecycle.

#### 1.1.6 Accounting Boundary

Accounting (`MOD-002`) owns accounting vouchers, journal posting, ledger posting, and financial reporting. This Sprint MUST NOT create accounting journals, ledger entries, or accounting voucher lifecycles.

#### 1.1.7 Sales Commercial Boundary

Sales order, delivery note, customer master, pricing, reservation authorship, and invoicing are owned by MOD-003 Sales. This Sprint MUST NOT create, edit, or shadow any sales commercial document.

#### 1.1.8 Governance Complement

This Sprint complements — and does not redefine — `MOD001_PLATFORM_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, and `SPR-MOD-019-001` through `SPR-MOD-019-005`. Ownership established by those artifacts is consumed and preserved; it is not overridden here. No ownership boundary is redefined by this sprint.

### 1.2 In Scope

Verbatim from Sprint Plan §2.006:

- **Task Assignment.** Assignment of labor resources and equipment (from Sprint 001) to prior-sprint tasks (unloading, putaway, slotting-change, replenishment, pick, pack, quality, loading, dispatch-handover). Assignment is a read-model overlay: the task lifecycles remain owned by their originating sprints.
- **Labor Productivity Reporting.** Warehouse-scoped labor productivity reports over data emitted by Sprints 001–005.
- **Equipment Utilization Reporting.** Warehouse-scoped equipment utilization reports over data emitted by Sprints 001–005.
- **Dock Utilization Reporting.** Inbound and outbound dock utilization reports.
- **Putaway Cycle Time Reporting.** Putaway cycle time reports from Sprint 002 event streams.
- **Pick Productivity Reporting.** Pick productivity reports from Sprint 004 event streams.
- **Pack Accuracy Reporting.** Pack accuracy reports from Sprint 004 event streams.
- **Load-Out On-Time Reporting.** Load-out on-time reports from Sprint 005 event streams.
- **Warehouse Operational Reports.** Additional operational reports over the union of Warehouse event streams.
- **Operational Dashboards.** Operational dashboards rendered via `ENG-022`.
- **Warehouse KPI Surfacing.** Warehouse-scoped KPI computation and surfacing; cross-module KPI definitions consumed read-only from MOD-017.
- **Operational Exception Monitoring.** Monitoring surface for exceptions emitted by Sprints 002–005.
- **Audit Readiness.** Audit-readiness surface that exposes every Warehouse event emitted during the sprint sequence.
- **Exports.** Export of reports and dashboard data via `ENG-027`.
- **Audit integration.** Every state-changing operation on the read-model entities in §11 is audited via `ENG-004` per `ADR-014`.
- **Authorization.** All operations are authorized via `ENG-002` under `ENG-003` permission definitions per `ADR-032`.
- **Notification.** Operational alerts, dashboard refresh notifications, and export completion notifications are emitted via `ENG-025`.

### 1.3 Out of Scope

- Warehouse foundation masters — owned by `SPR-MOD-019-001`.
- Inbound execution (dock appointment inbound, unloading, inspection hold, putaway task) — owned by `SPR-MOD-019-002`.
- Storage & slotting — owned by `SPR-MOD-019-003`.
- Outbound execution (wave/batch/order planning, picking, packing, outbound quality check) — owned by `SPR-MOD-019-004`.
- Yard, dock, and load-out — owned by `SPR-MOD-019-005`.
- Item master, unit-of-measure master, warehouse master, bin/location master, stock balance, stock ledger, reorder policy, valuation — owned by MOD-005 Inventory.
- HR Employee Master, HR Organization Structure, Payroll, Attendance — owned by HR module.
- Sales orders, delivery notes, invoices, customer master, pricing — owned by MOD-003 Sales.
- Purchase and manufacturing document ownership — owned by MOD-004 and MOD-009 respectively.
- Accounting vouchers, journal posting, ledger posting — owned by MOD-002 Accounting.
- Cross-module and enterprise KPI **definitions** — owned by MOD-017 Analytics.
- AI-driven forecasting, ML-based labor prediction, autonomous equipment orchestration — Module PRD §14 Future Enhancements.
- Concrete database schema, API contracts, UI mockups, source code, migrations, RLS policies.
- Search index build machinery, reporting engine machinery, dashboard rendering machinery, event bus, notification transport, export engine machinery — implemented by the respective engines.

## 2. Sprint Scope

### 2.1 In-Scope Business Capabilities

Aligned verbatim with the authoritative Capability Allocation Matrix in [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md) §4.1 for `SPR-MOD-019-006`:

- Warehouse labor, equipment, and analytics (task assignment, labor productivity, equipment utilization, warehouse KPIs, audit readiness).

Sprint 006 has no transactional entities in Sprint Plan §4.3; read-model entities are enumerated in §11.

Reports and analytics surfaces allocated to this sprint (Sprint Plan §4.4 / Module PRD §9 and §11):

- Dock Utilization, Putaway Cycle Time, Pick Productivity, Pack Accuracy, Load-out On-Time, Labor Productivity, Equipment Utilization, Audit Readiness.

### 2.2 Out-of-Scope Business Capabilities

Every capability originating in a sibling sprint is excluded here:

- Warehouse operations configuration and foundation masters — owned by `SPR-MOD-019-001`.
- Inbound execution — owned by `SPR-MOD-019-002`.
- Storage and slotting — owned by `SPR-MOD-019-003`.
- Outbound execution — owned by `SPR-MOD-019-004`.
- Yard, dock, and load-out — owned by `SPR-MOD-019-005`.

No capability allocated to `SPR-MOD-019-001` through `SPR-MOD-019-005` is implemented in this Sprint PRD.

## 3. Business Capabilities

Each capability is traceable to the parent [MOD-019 Warehouse Module PRD](../../20-module-prds/warehouse/MODULE_PRD.md).

- **BC-001 — Task Assignment.** Read-model overlay assigning labor and equipment to prior-sprint tasks. Parent Module PRD §2, §9.
- **BC-002 — Labor Productivity Reporting.** Parent Module PRD §9.
- **BC-003 — Equipment Utilization Reporting.** Parent Module PRD §9.
- **BC-004 — Dock Utilization Reporting.** Parent Module PRD §9.
- **BC-005 — Putaway Cycle Time Reporting.** Parent Module PRD §9.
- **BC-006 — Pick Productivity Reporting.** Parent Module PRD §9.
- **BC-007 — Pack Accuracy Reporting.** Parent Module PRD §9.
- **BC-008 — Load-Out On-Time Reporting.** Parent Module PRD §9.
- **BC-009 — Warehouse Operational Reports and Dashboards.** Parent Module PRD §9.
- **BC-010 — Warehouse KPI Surfacing.** Parent Module PRD §9.
- **BC-011 — Operational Exception Monitoring.** Parent Module PRD §9.
- **BC-012 — Audit Readiness.** Parent Module PRD §11.
- **BC-013 — Export.** Parent Module PRD §9.

## 4. Functional Requirements

### 4.1 Task Assignment

- FR-001: The system SHALL allow authorized operations managers to assign labor resources (from Sprint 001 labor master) and equipment (from Sprint 001 equipment master) to prior-sprint tasks (unloading, putaway, slotting-change, replenishment, pick, pack, quality, loading, dispatch-handover).
- FR-002: The system SHALL treat task assignment as a read-model overlay; the underlying task lifecycle remains owned by its originating sprint.
- FR-003: The system SHALL audit every task assignment operation via `ENG-004` per `ADR-014`.

### 4.2 Labor Productivity Reporting

- FR-004: The system SHALL compute Warehouse-scoped labor productivity reports over data emitted by Sprints 001–005.
- FR-005: The system SHALL render labor productivity reports via `ENG-021` Reporting Engine.

### 4.3 Equipment Utilization Reporting

- FR-006: The system SHALL compute Warehouse-scoped equipment utilization reports over data emitted by Sprints 001–005.
- FR-007: The system SHALL render equipment utilization reports via `ENG-021`.

### 4.4 Warehouse Operational Reports

- FR-008: The system SHALL render Warehouse operational reports (Dock Utilization, Putaway Cycle Time, Pick Productivity, Pack Accuracy, Load-out On-Time) via `ENG-021` over the union of Warehouse event streams.
- FR-009: The system SHALL support search over reporting surfaces via `ENG-020` Search Engine.

### 4.5 Operational Dashboards

- FR-010: The system SHALL render Warehouse operational dashboards via `ENG-022` Dashboard Engine over the reporting surfaces in §4.2–§4.4.

### 4.6 Warehouse KPI Surfacing

- FR-011: The system SHALL surface Warehouse-scoped KPIs computed over the reporting surfaces in §4.2–§4.4.
- FR-012: The system SHALL consume cross-module KPI **definitions** from MOD-017 Analytics read-only; Warehouse SHALL NOT redefine cross-module KPI definitions.

### 4.7 Operational Exception Monitoring

- FR-013: The system SHALL surface a read-model monitoring view over exceptions emitted by Sprints 002–005 (inbound, slotting/replenishment, outbound, and yard/dock/loading/dispatch exceptions).
- FR-014: The system SHALL emit operational alerts through `ENG-025` when monitored exception thresholds are breached.

### 4.8 Audit Readiness

- FR-015: The system SHALL expose an audit-readiness surface that reflects every Warehouse event emitted during the Warehouse sprint sequence (Sprints 002–005).
- FR-016: The audit-readiness surface SHALL be scoped by tenant per `ADR-011` and authorized per `ADR-032`.

### 4.9 Export

- FR-017: The system SHALL support export of reports and dashboard data via `ENG-027` Export Engine.
- FR-018: Export completion SHALL emit a notification via `ENG-025`.

### 4.10 Consumed Event Streams

- FR-019: The system SHALL consume via `ENG-024` subscription: `InboundAppointmentScheduled`, `UnloadingCompleted`, `PutawayCompleted`, `SlottingChangeApplied`, `InternalReplenishmentCompleted`, `PickCompleted`, `PackCompleted`, `OutboundAppointmentScheduled`, `LoadingCompleted`, and `DispatchHandoverCompleted`. Event owners are the originating Warehouse sprints; this Sprint publishes no domain events.

### 4.11 Audit, Authorization, Configuration

- FR-020: Every state-changing operation on §4.1–§4.9 SHALL emit an audit record via `ENG-004` per `ADR-014`.
- FR-021: Every operation SHALL be authorized via `ENG-002` under `ENG-003` permission definitions per `ADR-032`.
- FR-022: Report definitions, dashboard definitions, KPI computation windows, and export configuration SHALL resolve via `ENG-005` under the namespace registered by Sprint 001; no configuration is hard-coded.

## 5. Business Processes

Read-model processes only; no transactional lifecycle is authored here.

- **BP-001 — Task Assignment.** The Warehouse Operations Manager assigns labor and equipment to prior-sprint tasks; the underlying task lifecycle remains owned by its originating sprint.
- **BP-002 — Labor Productivity Review.** The Warehouse Operations Manager reviews Warehouse-scoped labor productivity reports.
- **BP-003 — Equipment Utilization Review.** The Warehouse Operations Manager reviews Warehouse-scoped equipment utilization reports.
- **BP-004 — KPI Collection.** The Warehouse Analytics Consumer surfaces Warehouse-scoped KPIs; cross-module KPI definitions are consumed read-only from MOD-017.
- **BP-005 — Operational Monitoring.** The Warehouse Operations Manager monitors operational exceptions; alerts are emitted via `ENG-025`.
- **BP-006 — Performance Reporting.** The Warehouse Operations Manager renders operational reports and dashboards.
- **BP-007 — Audit Readiness.** The Auditor consumes the audit-readiness surface.
- **BP-008 — Export.** The Warehouse Analytics Consumer runs report and dashboard exports; export completion notifications are emitted via `ENG-025`.

## 6. Governance

- **Tenant/Company/Warehouse hierarchy** per `ADR-011` Multi-Tenant Isolation. All read-model entities in §11 are scoped under this hierarchy.
- **Authorization** per `ADR-032` (RBAC + ABAC) enforced by `ENG-002` and `ENG-003`.
- **Audit** per `ADR-014` enforced by `ENG-004`.
- **KPI-definition governance.** Cross-module KPI definitions are consumed read-only from MOD-017 Analytics; Warehouse governs Warehouse-scoped KPI computation and presentation only.
- **Reporting, dashboard, search, and export governance** is declared to `ENG-021`, `ENG-022`, `ENG-020`, and `ENG-027`; no reporting, dashboard, search, or export machinery is reimplemented here.
- **Notification governance** is declared to `ENG-025`.
- **Configuration** for report/dashboard definitions, KPI computation windows, and export configuration resolves via `ENG-005` under the namespace registered by `SPR-MOD-019-001`.
- **Governance registrations** for this Sprint PRD are maintained in `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`, and `docs/30-sprint-prds/warehouse/README.md`. No upstream authoritative document (`MODULE_CATALOG.md`, `ENGINE_CATALOG.md`, `ADR_INDEX.md`, `event-catalog.md`, `ENGINE_USAGE_MATRIX.md`, `MODULE_PRD.md`, `MOD-019_SPRINT_PLAN.md`, `MODULE_IMPLEMENTATION_WORKFLOW.md`, module baselines) is modified by this sprint.

## 7. Ownership Boundaries

- **Owned by MOD-019 Warehouse (this sprint).** Task Assignment Record, Labor Productivity Snapshot, Equipment Utilization Snapshot, Dock Utilization Snapshot, Putaway Cycle Time Snapshot, Pick Productivity Snapshot, Pack Accuracy Snapshot, Load-Out On-Time Snapshot, Warehouse KPI Snapshot, Operational Dashboard Definition, Monitoring Alert, Warehouse Performance Report, Audit-Readiness Record, Export Job.
- **KPI Ownership Clarification.** Warehouse owns KPI **computation and presentation only for Warehouse-scoped KPIs**; enterprise / cross-module KPI **definitions** remain owned by **MOD-017 Analytics** and are consumed read-only.
- **Consumed read-only from `SPR-MOD-019-001`.** Warehouse zone/area master, dock door master, equipment master, labor resource master, task type registry, dock appointment calendar, warehouse operations configuration namespace, warehouse numbering series registrations.
- **Consumed read-only from `SPR-MOD-019-002` … `SPR-MOD-019-005`.** Transactional records and event streams.
- **Consumed read-only from MOD-005 Inventory.** Item master, unit-of-measure master, warehouse master, bin/location master, stock balance.
- **Consumed read-only from MOD-001 Platform Administration.** Tenant, Company, Branch, User, Role Registry.
- **Consumed read-only from HR (if allocated).** HR Employee Master, HR Organization Structure.
- **Consumed read-only from MOD-017 Analytics.** Cross-module and enterprise KPI definitions.
- **Not owned here.** HR Employee Master, Payroll, Attendance (HR); Inventory Ledger, Inventory Valuation, Warehouse/Bin Master (MOD-005); Accounting, Financial Posting (MOD-002); Sales commercial documents (MOD-003); cross-module KPI definitions (MOD-017); transactional lifecycles (Sprints 001–005).
- **Architectural invariant.** Warehouse SHALL NEVER modify HR records, Payroll, Inventory Ledger, or Inventory Valuation. This Sprint is read-model only — no transactional state is authored, and no domain event is published.
- **Prohibited.** Writes to the Inventory stock ledger. Modification of item, warehouse, or bin master records. Creation, modification, or shadowing of HR Employee, Payroll, Attendance, sales orders, delivery notes, invoices, customer master, or reservation policy. Accounting voucher creation. Redefinition of foundation, inbound-execution, storage-and-slotting, outbound-execution, or yard/dock/load-out lifecycle ownership. Redefinition of cross-module KPI definitions. Search, reporting, dashboard, notification, or export machinery implementation.

## 8. Dependencies

- **Parent Module PRD.** [`docs/20-module-prds/warehouse/MODULE_PRD.md`](../../20-module-prds/warehouse/MODULE_PRD.md).
- **Parent Sprint Plan.** [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md).
- **Preceding Sprint PRDs.** `SPR-MOD-019-001` through `SPR-MOD-019-005` — consumes the data and event streams they emit.
- **Upstream frozen module baselines.** `MOD001_PLATFORM_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`.
- **Cross-module dependencies.** MOD-001 (tenant/company/branch/user), MOD-005 (warehouse/bin master read APIs, stock balance), MOD-017 (cross-module KPI definitions), HR module read-only if HR data is consumed. All resolve via `docs/MODULE_CATALOG.md`.

## 9. ERP Core Engine Consumption

Resolved verbatim from `MOD-019_SPRINT_PLAN.md` §2.006 for `SPR-MOD-019-006`. No engine behavior is redefined.

- **ENG-002 Authorization Engine.** Enforces role- and attribute-based authorization on every read-model operation per `ADR-032`. Consumption boundary: enforcement only.
- **ENG-004 Audit Engine.** Emits an audit record for every state-changing operation on read-model entities per `ADR-014`. Consumption boundary: emission only.
- **ENG-020 Search Engine.** Provides search over reporting surfaces. Consumption boundary: search-index consumption only.
- **ENG-021 Reporting Engine.** Renders Warehouse operational reports (Dock Utilization, Putaway Cycle Time, Pick Productivity, Pack Accuracy, Load-Out On-Time, Labor Productivity, Equipment Utilization) and additional Warehouse-scoped reports. Consumption boundary: report definition consumption only.
- **ENG-022 Dashboard Engine.** Renders Warehouse operational dashboards. Consumption boundary: dashboard definition consumption only.
- **ENG-024 Event Engine.** **Consumes** events via `ENG-024` (subscription only); **publishes notifications** through `ENG-025` only. No domain events are published by this Sprint.
- **ENG-025 Notification Engine.** Delivers operational alerts, dashboard refresh notifications, and export completion notifications. Consumption boundary: template consumption only.
- **ENG-027 Export Engine.** Exports reports and dashboard data. Consumption boundary: export configuration consumption only.

## 10. ADR Consumption

Resolved verbatim from `MOD-019_SPRINT_PLAN.md` §2.006. Only Accepted ADRs are referenced.

- **ADR-011 Multi-Tenant Isolation.** All read-model entities are tenant-scoped; cross-tenant reads and writes are prohibited.
- **ADR-014 Audit Strategy.** Every state-changing operation on read-model entities produces an audit record via `ENG-004`; audit fields, retention, and immutability follow the ADR.
- **ADR-032 RBAC + ABAC.** Authorization on every operation, including report/dashboard/export access, combines role-based and attribute-based policies enforced by `ENG-002` under permission definitions from `ENG-003`.

## 11. Data Model

Read-model business entities only; no schema is defined here.

- **Task Assignment Record** — assignment identifier, parent task reference (from Sprint 002 / 003 / 004 / 005), labor resource reference (from Sprint 001), equipment reference (from Sprint 001), assignment status, tenancy binding.
- **Labor Productivity Snapshot** — snapshot identifier, computation window, labor resource reference, productivity metric, tenancy binding.
- **Equipment Utilization Snapshot** — snapshot identifier, computation window, equipment reference, utilization metric, tenancy binding.
- **Dock Utilization Snapshot** — snapshot identifier, computation window, dock door reference (from Sprint 001), utilization metric, tenancy binding.
- **Putaway Cycle Time Snapshot** — snapshot identifier, computation window, cycle-time metric, tenancy binding.
- **Pick Productivity Snapshot** — snapshot identifier, computation window, productivity metric, tenancy binding.
- **Pack Accuracy Snapshot** — snapshot identifier, computation window, accuracy metric, tenancy binding.
- **Load-Out On-Time Snapshot** — snapshot identifier, computation window, on-time metric, tenancy binding.
- **Warehouse KPI Snapshot** — snapshot identifier, KPI definition reference (Warehouse-scoped local or MOD-017 read-only), computation window, KPI value, tenancy binding.
- **Operational Dashboard Definition** — dashboard identifier, dashboard configuration reference (resolved via `ENG-005`), authorized audience, tenancy binding.
- **Monitoring Alert** — alert identifier, monitored exception source, alert threshold reference, alert status, tenancy binding.
- **Warehouse Performance Report** — report identifier, report definition reference (resolved via `ENG-005`), computation window, tenancy binding.
- **Audit-Readiness Record** — record identifier, referenced Warehouse event, capture timestamp, tenancy binding.
- **Export Job** — job identifier, export configuration reference, target report or dashboard reference, job status, completion timestamp, tenancy binding.

Concrete schemas, indexes, RLS policies, and physical persistence choices are implementation activities and are explicitly out of scope for this PRD.

## 12. Events

Event identifiers are resolved verbatim from the parent Module PRD §8 and `MOD-019_SPRINT_PLAN.md` §2.006. No event identifier is invented by this Sprint PRD.

**Published (owned by this sprint):**

- None. Sprint Plan §2.006 allocates no published domain events to this Sprint. Notifications are delivered through `ENG-025` and are not domain events.

**Consumed (owned by upstream sprints):**

- `InboundAppointmentScheduled`, `UnloadingCompleted`, `PutawayCompleted` — from `SPR-MOD-019-002`.
- `SlottingChangeApplied`, `InternalReplenishmentCompleted` — from `SPR-MOD-019-003`.
- `PickCompleted`, `PackCompleted` — from `SPR-MOD-019-004`.
- `OutboundAppointmentScheduled`, `LoadingCompleted`, `DispatchHandoverCompleted` — from `SPR-MOD-019-005`.

## 13. Integration Contracts

- **Warehouse foundation configuration (from Sprint 001, read-only).** Zone, area, dock, equipment, labor, task-type, dock appointment calendar, and configuration-namespace resolution via the read surface established by Sprint 001.
- **Warehouse transactional event streams (from Sprints 002–005, read-only).** Consumed via `ENG-024` subscription.
- **MOD-005 Inventory read APIs (read-only).** Warehouse master, bin/location master, item master, unit-of-measure master, stock balance consumed via approved MOD-005 read APIs. No writes to Inventory-owned entities are permitted.
- **MOD-001 Platform Administration read APIs (read-only).** Tenant, company, branch, user, and role registry resolution consumed via approved MOD-001 read APIs.
- **HR read APIs (read-only, if allocated).** HR Employee Master and HR Organization Structure consumed via approved HR read APIs. No writes to HR-owned entities are permitted.
- **MOD-017 Analytics read APIs (read-only).** Cross-module and enterprise KPI definitions consumed read-only. Warehouse SHALL NOT redefine cross-module KPI definitions.
- **MDM read APIs (read-only).** Consumed as needed for master-data consistency.
- **Publish outbound (informational only).** KPI updates, operational alerts, equipment utilization surface, workforce utilization surface, dashboard refresh notifications, audit-readiness surface, and export completion notifications are published via approved integration contracts and `ENG-025`.
- **Read-model invariant.** Analytics outputs are **informational only and SHALL NOT trigger transactional state changes**. Warehouse SHALL NOT directly modify HR, Payroll, Inventory Ledger, Inventory Valuation, or Financial state.
- **ERP Core Engine contracts.** Consumed as published by their respective engine documents; never restated here.
- **Concrete request/response shapes.** Defined during implementation, not in this PRD.

## 14. Security

- All read-model entities are tenant-scoped per `ADR-011`.
- Cross-tenant reads are prohibited and MUST be denied by `ENG-002`.
- Analytics surfaces respect the same tenant boundary as underlying transactional data.
- Security-hardening standards (transport, secrets, encryption at rest) inherit from the platform baseline and are not restated here.

## 15. Authorization

- Authorization is enforced by `ENG-002` under permission definitions from `ENG-003` per `ADR-032`.
- Business-level roles referenced by this sprint (Warehouse Operations Manager, Warehouse Analytics Consumer, Warehouse Executive, Auditor) are named for scoping purposes only; concrete grants and policies live in `ENG-003`.
- Report, dashboard, and export access is authorized under the same RBAC + ABAC framework.
- No authorization model is redefined in this Sprint PRD.

## 16. Operational Constraints

Inherited verbatim from Module PRD §11 and `docs/02-architecture/quality-attributes.md`:

- Interactive latency budget applies to report rendering, dashboard rendering, KPI surfacing, monitoring, and export-job initiation paths.
- Availability of MOD-005 and MOD-017 read APIs, and of the ERP Core reporting, dashboard, search, and export engines, gates all analytics operations; operations MUST degrade gracefully when any is delayed.
- Compliance follows the Data Constitution and platform data-classification rules.
- Accessibility meets the platform baseline; enforcement lives in the design system, not this PRD.

## 17. Implementation Readiness

Sprint Exit Criteria — verbatim from `MOD-019_SPRINT_PLAN.md` §2.006:

- Warehouse reports and dashboards render from data produced by prior sprints.
- Warehouse operational KPIs and controls are available for operational review.
- Audit readiness surface exposes every Warehouse event emitted during the sprint sequence.

Sprint completion additionally requires:

- Every acceptance-testable functional requirement in §4 has at least one observable test covering it (Given/When/Then per `SPRINT_AUTHORING_GUIDE.md` §10).
- All governance registrations in §6 are recorded exactly once.
- Repository verification (Pass 8.9.7-V) reports 15/15 Passed.
- Post-Implementation Repository Audit (Spec v1.0) reports `Repository Status: READY`.

## 18. References

- [`docs/20-module-prds/warehouse/MODULE_PRD.md`](../../20-module-prds/warehouse/MODULE_PRD.md)
- [`docs/30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-001-warehouse-foundation.md`](./SPR-MOD-019-001-warehouse-foundation.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-002-inbound-execution.md`](./SPR-MOD-019-002-inbound-execution.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-003-storage-slotting.md`](./SPR-MOD-019-003-storage-slotting.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-004-outbound-execution.md`](./SPR-MOD-019-004-outbound-execution.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-005-yard-dock-load-out.md`](./SPR-MOD-019-005-yard-dock-load-out.md)
- [`docs/30-sprint-prds/warehouse/README.md`](./README.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- [`docs/MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
