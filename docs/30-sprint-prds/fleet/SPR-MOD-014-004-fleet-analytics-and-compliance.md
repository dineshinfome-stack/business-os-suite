---
title: "SPR-MOD-014-004 — Fleet Analytics & Compliance"
summary: "Sprint PRD for the Fleet Analytics & Compliance layer of MOD-014: Fleet read model; operational reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar); dashboards surface; bulk exports; audit-readiness posture. Read-model-only; consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-014-004"
parent_module: "MOD-014"
parent_sprint_plan: "MOD-014_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "16.0.4"
size: "Small"
related_engines: ["ENG-002", "ENG-004", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "fleet", "mod-014", "analytics", "compliance", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD014-004-20260716T030000Z-001"
parent_result_id: "GT003-MOD014-003-20260716T029000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-014-004 — Fleet Analytics & Compliance

> **Stage 2 deliverable.** Fourth and final authored Sprint PRD for **MOD-014 Fleet** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-014-004` (permanent) |
| Parent Module | `MOD-014` — Fleet |
| Parent Sprint Plan | [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Small |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) |
| Upstream Sprints | [`SPR-MOD-014-001`](./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md), [`SPR-MOD-014-002`](./SPR-MOD-014-002-trip-planning-and-execution.md), [`SPR-MOD-014-003`](./SPR-MOD-014-003-fuel-and-maintenance.md) |
| Downstream Sprints | *None (final MOD-014 sprint; next artifact is GT-004 baseline consolidation)* |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Fleet read model and operational reporting surface** for MOD-014: the Trip Sheet, Fuel Efficiency, Maintenance Cost, and Compliance Calendar operational reports; the Fleet dashboards surface; bulk exports of operational reports; and the module's audit-readiness posture. This sprint consolidates the read-model view of the upstream Fleet layers authored in `SPR-MOD-014-001`, `SPR-MOD-014-002`, and `SPR-MOD-014-003` — no upstream master or transaction is reopened here.

> **Fleet Read-Model & Report Authority (this sprint).** The Fleet module owns its operational-report catalog, dashboard surface, and read-model projections for Fleet-owned entities and transactions. ERP Core Engines provide shared infrastructure (authorization, audit, search, reporting, dashboards, integration, eventing, notification, export). Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Financial-posting semantics remain exclusive to **MOD-002 Accounting**. **Cross-module KPI definitions** remain exclusive to **MOD-017 Analytics**; MOD-014 consumes cross-module KPI definitions read-only from MOD-017 and does not redefine them.

#### 1.1.1 Fleet Read Model & Report Authority

The **Fleet read model** and the **Fleet operational report catalog** (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar) are authoritatively owned by MOD-014 Fleet, in this sprint. No other module MAY redefine these reports or their read-model projections. Downstream sprints and modules consume Fleet operational reports through the reporting and dashboard surfaces authored here; they MUST NOT redefine the report specifications or the read-model projections.

#### 1.1.2 Fleet ↔ Analytics Boundary

**MOD-017 Analytics** owns the cross-module KPI catalog. This sprint consumes cross-module KPI definitions read-only from MOD-017 via `ENG-023` Integration and surfaces them alongside Fleet operational reports on the Fleet dashboards. Fleet does not redefine cross-module KPIs and does not author KPI definitions of its own.

#### 1.1.3 Fleet ↔ Platform and Accounting Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, tenant/company/branch hierarchy, and the Platform audit-review surface. This sprint consumes them read-only via `ENG-002` on every report and dashboard action.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Fleet sprint writes journal entries. This sprint surfaces operational Fleet views only; any financial view remains owned by MOD-002.

Ownership boundaries SHALL NOT be redefined here or in any downstream Fleet artifact.

#### 1.1.4 Read-Model-Only Boundary

This sprint is **read-model-only**. It introduces **no new master data**, **no new transactions**, **no new engines**, and **no new ADRs** relative to the Module PRD. It publishes **no new domain events**; the events emitted by upstream Fleet sprints (`ComplianceExpiring`, `TripClosed`, `FuelRecorded`, `MaintenanceCompleted`) are consumed to update the Fleet read model but are not re-published. Notifications on report/export delivery may be emitted via `ENG-025` where the tenant so configures.

### 1.2 In Scope

- **Fleet read model** — deterministic projections of Fleet-owned entities (Vehicle, Driver, License, Compliance Registration, Insurance Coverage, Route, Fuel Station, Fleet Configuration) and transactions (Trip Sheet, Fuel Entry, Maintenance Order) suitable for operational reporting and dashboards.
- **Operational reports** — Trip Sheet, Fuel Efficiency, Maintenance Cost, and Compliance Calendar rendered via `ENG-021` Reporting.
- **Fleet dashboards surface** — Fleet read-model projections and consumed cross-module KPI definitions surfaced via `ENG-022` Dashboard.
- **Search** — search over Fleet-owned entities and transactions via `ENG-020`.
- **Cross-module KPI consumption** — cross-module KPI definitions consumed read-only from MOD-017 via `ENG-023` Integration.
- **Bulk exports** — bulk exports of operational reports in standard formats via `ENG-027` Export.
- **Audit-readiness surface** — every state-changing transaction produced by upstream Fleet sprints is traceable to an `ENG-004` audit event; this sprint surfaces the audit-readiness posture over Fleet-owned entities and transactions.
- **Read authorization** — every report, dashboard, search, and export action is authorized under `ENG-002` scoped to the caller's tenant/company under `ADR-011`.
- **Notifications** — where the tenant so configures, notifications on report delivery, scheduled export completion, and dashboard alert conditions are emitted via `ENG-025`.
- **Event consumption for read-model updates** — `ComplianceExpiring`, `TripClosed`, `FuelRecorded`, and `MaintenanceCompleted` are consumed via `ENG-024` to update the Fleet read model.

### 1.3 Out of Scope

- Vehicle, Driver, License masters; vehicle hierarchy; driver–license linkage; compliance and insurance registration; `ComplianceExpiring` publication; Fleet configuration namespace registration — `SPR-MOD-014-001`.
- Route master; Trip Sheet transaction; driver/vehicle assignment invariants; odometer capture; trip closure; `TripClosed` publication; `DeliveryDispatched` and `FieldTicketCreated` consumption for trip seeding — `SPR-MOD-014-002`.
- Fuel Station master; Fuel Entry transaction; telematics-reconciliation rule; Maintenance Order transaction; scheduled preventive maintenance; `FuelRecorded` and `MaintenanceCompleted` publication — `SPR-MOD-014-003`.
- Financial postings for fuel, maintenance, and disposal — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting through posting-rule bindings triggered by Fleet-published events.
- Cross-module KPI **definitions** — owned by MOD-017 Analytics; consumed read-only here.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Physical schema, indexes, code, routes, migrations, and UI — implementation activities excluded from this PRD.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-014-004`, the following will exist:

- **Business capabilities.**
  - A Fleet Manager, Dispatcher, Finance user, Maintenance user, Regulator, or Insurer (per Module PRD §3, scoped by `ENG-002`) can view the **Trip Sheet**, **Fuel Efficiency**, **Maintenance Cost**, and **Compliance Calendar** operational reports rendered via `ENG-021`.
  - Fleet dashboards surface read-model projections of Fleet-owned entities and transactions via `ENG-022`, alongside cross-module KPI definitions consumed read-only from MOD-017 via `ENG-023`.
  - Search over Fleet-owned entities and transactions is available via `ENG-020`, tenant-scoped under `ADR-011`.
  - Bulk exports of operational reports in standard formats are produced via `ENG-027`.
  - The audit-readiness surface exposes, for any Fleet-owned state-changing transaction, the corresponding audit record produced by upstream Fleet sprints via `ENG-004`.
- **Read-model artifacts.** Deterministic Fleet read-model projections updated by consumption of `ComplianceExpiring`, `TripClosed`, `FuelRecorded`, and `MaintenanceCompleted` via `ENG-024`.
- **Domain events.** *None originated by this sprint.* This sprint publishes no new events; upstream Fleet events remain owned by their originating sprints.
- **Notification artifacts.** Where tenant-configured, report delivery, scheduled export completion, and dashboard alert conditions produce notifications via `ENG-025`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-014-004`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-014 MODULE_PRD Section | Delivered By |
| --- | --- |
| §9 Reports & Analytics — Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar | Operational reports rendered via `ENG-021` |
| §9 Reports & Analytics — Dashboards (via ENG-022 Dashboard Engine) | Fleet dashboards surface via `ENG-022` |
| §9 Reports & Analytics — KPIs (defined once in MOD-017 Analytics and referenced) | Cross-module KPI definitions consumed read-only from MOD-017 via `ENG-023` |
| §9 Reports & Analytics — Exports (bulk exports handled by ENG-027 Export Engine) | Bulk exports via `ENG-027` |
| §11 Non-functional Considerations — Compliance/audit readiness | Audit-readiness surface over Fleet-owned entities and transactions via `ENG-004` |
| §12 ERP Core Engine Consumption — ENG-020 Search, ENG-022 Dashboard, ENG-023 Integration, ENG-027 Export | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Fleet Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) §4.1 allocates no §2 originating capability to this sprint; `SPR-MOD-014-004` is the **read-model-and-reporting** sprint per Sprint Plan §2 and covers Module PRD §9 and §11 only. Sprint Plan §4.4 confirms this sprint's Module PRD coverage. No capability originating-allocated to another sprint is duplicated here.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §9 (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar; Dashboards; KPIs; Exports) and §11 (audit readiness) → this Sprint PRD → deliverables in §2 (operational reports; dashboards; cross-module KPI consumption; bulk exports; audit-readiness surface; read-model projections).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Fleet Manager, I want to run the **Trip Sheet** report over Fleet-owned Trip Sheet transactions under a tenant/company, so that trip activity is auditable and reviewable.*
- **US-002.** *As a Fleet Manager, I want to run the **Fuel Efficiency** report over Fleet-owned Fuel Entries under a tenant/company, so that vehicle fuel performance is observable.*
- **US-003.** *As a Finance user, I want to run the **Maintenance Cost** report over Fleet-owned Maintenance Orders under a tenant/company, so that maintenance spend is observable operationally, without duplicating any Accounting ledger view.*
- **US-004.** *As a Regulator or Insurer (scoped by `ENG-002`), I want to run the **Compliance Calendar** report over Fleet-owned Compliance Registrations and Insurance Coverages under a tenant/company, so that upcoming and lapsed compliance items are visible.*
- **US-005.** *As a Fleet Manager, I want a **Fleet dashboards** surface that projects Fleet read-model views and consumed cross-module KPI definitions from MOD-017, so that operational and cross-module signals are visible in one place without redefining KPIs.*
- **US-006.** *As a Fleet Manager or Finance user, I want **bulk export** of operational reports in standard formats via `ENG-027`, so that reports can be delivered to downstream consumers on the tenant's cadence.*
- **US-007.** *As a Dispatcher, I want **search** over Fleet-owned entities and transactions via `ENG-020`, tenant-scoped under `ADR-011`, so that Fleet records are findable by attribute.*
- **US-008.** *As a security reviewer, I want an **audit-readiness surface** that traces every Fleet-owned state-changing transaction to its `ENG-004` audit record, so that Fleet history is reconstructable from an authoritative log.*
- **US-009.** *As a downstream consumer, I want the Fleet **read model** to be updated deterministically from `ComplianceExpiring`, `TripClosed`, `FuelRecorded`, and `MaintenanceCompleted` events via `ENG-024`, so that reports and dashboards remain consistent with authoritative Fleet state.*
- **US-010.** *As a Fleet Manager, I want notifications on report delivery, scheduled export completion, and dashboard alert conditions under the tenant's configured channels via `ENG-025`, so that operational visibility is actionable.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Trip Sheet report (US-001)

- **Given** Trip Sheet transactions owned by `SPR-MOD-014-002` under a tenant/company,
  **when** an authorized caller (per `ENG-002`) runs the Trip Sheet report,
  **then** the report is rendered via `ENG-021` over the Fleet read-model projection, tenant/company-scoped under `ADR-011`.

### 5.2 Fuel Efficiency report (US-002)

- **Given** Fuel Entry transactions owned by `SPR-MOD-014-003` under a tenant/company,
  **when** an authorized caller runs the Fuel Efficiency report,
  **then** the report is rendered via `ENG-021` over the Fleet read-model projection, deterministic given the same input state.

### 5.3 Maintenance Cost report (US-003)

- **Given** Maintenance Order transactions owned by `SPR-MOD-014-003` under a tenant/company,
  **when** an authorized caller runs the Maintenance Cost report,
  **then** the report is rendered via `ENG-021` over the Fleet read-model projection; no Accounting ledger view is duplicated here.

### 5.4 Compliance Calendar report (US-004)

- **Given** Compliance Registrations and Insurance Coverages owned by `SPR-MOD-014-001` under a tenant/company,
  **when** an authorized caller runs the Compliance Calendar report,
  **then** the report is rendered via `ENG-021` and includes upcoming, current, and lapsed compliance items scoped to the caller's tenant/company under `ADR-011`.

### 5.5 Fleet dashboards surface (US-005)

- **Given** the Fleet read model and cross-module KPI definitions available in MOD-017 Analytics,
  **when** an authorized caller opens the Fleet dashboards surface,
  **then** dashboards render via `ENG-022`, surfacing Fleet read-model projections and cross-module KPI definitions consumed read-only from MOD-017 via `ENG-023`. Cross-module KPIs are not redefined here.

### 5.6 Bulk exports (US-006)

- **Given** any Fleet operational report enumerated in §5.1–§5.4,
  **when** an authorized caller requests a bulk export in a standard format,
  **then** the export is produced via `ENG-027`, tenant/company-scoped under `ADR-011`.

### 5.7 Search (US-007)

- **Given** Fleet-owned entities and transactions authored by upstream Fleet sprints,
  **when** an authorized caller issues a search query,
  **then** results are returned via `ENG-020`, tenant/company-scoped under `ADR-011`; no cross-tenant result is exposed.

### 5.8 Audit-readiness surface (US-008)

- **Given** any state-changing transaction produced by upstream Fleet sprints (Fuel Station, Fuel Entry, Maintenance Order, Trip Sheet, Route, Vehicle, Driver, License, Compliance Registration, Insurance Coverage, Fleet Configuration),
  **when** the audit-readiness surface is queried,
  **then** the corresponding `ENG-004` audit record is discoverable and traceable to the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.9 Read-model projection consistency (US-009)

- **Given** the events `ComplianceExpiring`, `TripClosed`, `FuelRecorded`, and `MaintenanceCompleted` published by upstream Fleet sprints,
  **when** they are consumed via `ENG-024`,
  **then** the Fleet read model is updated deterministically and idempotently; duplicate delivery of the same event does not double-project.

### 5.10 Notifications (US-010)

- **Given** a tenant-configured notification channel for report delivery, scheduled export completion, or dashboard alert conditions,
  **when** the corresponding event occurs,
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.11 Isolation invariants (`ADR-011`)

- **Given** any Fleet report, dashboard, search, export, or audit-readiness read,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read can succeed.

### 5.12 Read-model-only invariants

- **Given** any Fleet code path in this sprint,
  **when** it executes,
  **then** it MUST NOT create, edit, or archive any Fleet master (Vehicle, Driver, License, Route, Fuel Station, Compliance Registration, Insurance Coverage, Fleet Configuration) or any Fleet transaction (Trip Sheet, Fuel Entry, Maintenance Order). Read-model projections are derived exclusively from consumed events and upstream Fleet read APIs.
- **Given** any Fleet code path that references cross-module KPI definitions,
  **when** it consumes them,
  **then** it does so read-only from MOD-017 via `ENG-023`. No KPI definition is authored here.
- **Given** any Fleet code path that surfaces a financial view,
  **when** it executes,
  **then** it MUST NOT invoke `ENG-015` Voucher or `ENG-016` Posting and MUST NOT duplicate an Accounting ledger view; operational fuel and maintenance surfaces remain Fleet-owned, financial postings remain MOD-002-owned.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-014` — Fleet.
- **Module PRD:** [`docs/20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §9 (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar; Dashboards; KPIs; Exports), §11 (audit readiness), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-014` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (referenced only for boundary preservation; not invoked from this sprint).
- **Upstream sprint dependencies (per Sprint Plan §2):**
  - [`SPR-MOD-014-001`](./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md) — Vehicle, Driver, License masters; Compliance Registration; Insurance Coverage; Fleet configuration namespace; `ComplianceExpiring` publication.
  - [`SPR-MOD-014-002`](./SPR-MOD-014-002-trip-planning-and-execution.md) — Route master and Trip Sheet transaction; `TripClosed` publication.
  - [`SPR-MOD-014-003`](./SPR-MOD-014-003-fuel-and-maintenance.md) — Fuel Station master; Fuel Entry transaction; Maintenance Order transaction; `FuelRecorded` and `MaintenanceCompleted` publication.
- **Cross-module read dependency:** **MOD-017 Analytics** — cross-module KPI definitions consumed read-only via `ENG-023`.
- **Downstream sprints:** *None.* This is the final MOD-014 sprint; the next artifact is GT-004 Baseline Consolidation per [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.1 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

### 7.2 Upstream Sprint Dependencies (per GT-003 §10 VAL-013B)

| Sprint | Resolved State | Result |
| --- | --- | --- |
| `SPR-MOD-014-001` — Fleet Foundation (Vehicles, Drivers, Compliance & Insurance) | Active (Draft; authored) | PASS |
| `SPR-MOD-014-002` — Trip Planning & Execution | Active (Draft; authored) | PASS |
| `SPR-MOD-014-003` — Fuel & Maintenance | Active (Draft; authored) | PASS |

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Fleet Read-Model & Report Authority in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and matches the allocation in Sprint Plan §5 for `SPR-MOD-014-004`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every report, dashboard, search, export, and audit-readiness read. |
| `ENG-004` Audit | Provides the authoritative audit trail from upstream Fleet sprints; surfaced by the audit-readiness view. |
| `ENG-020` Search | Provides search over Fleet-owned entities and transactions, tenant/company-scoped. |
| `ENG-021` Reporting | Renders operational reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar). |
| `ENG-022` Dashboard | Provides the Fleet dashboards surface for read-model projections and consumed KPI definitions. |
| `ENG-023` Integration | Provides read-only access to cross-module KPI definitions owned by MOD-017 Analytics. |
| `ENG-024` Eventing | Consumes `ComplianceExpiring`, `TripClosed`, `FuelRecorded`, and `MaintenanceCompleted` to update the Fleet read model. This sprint publishes no new events. |
| `ENG-025` Notification | Emits notifications on report delivery, scheduled export completion, and dashboard alert conditions under the tenant's configured channels, where the tenant so configures. |
| `ENG-027` Export | Produces bulk exports of operational reports in standard formats. |

Fleet business semantics remain owned by upstream Fleet sprints. This sprint owns Fleet **read-model projections** and the **operational report catalog** only; no upstream engine behavior is redefined.

`ENG-015` Voucher and `ENG-016` Posting are **not** consumed by this or any Fleet sprint per Sprint Plan §5 — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by Fleet-published events.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Fleet report, dashboard, search, export, and audit-readiness read. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every Fleet read/report/dashboard/export action. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Fleet Read-Model Projection | MOD-014 (this sprint) | Derived, read-only projections of Fleet-owned entities and transactions maintained by consuming upstream Fleet events; suitable for operational reports and dashboards. |
| Fleet Operational Report Specification | MOD-014 (this sprint) | Catalog of the four operational reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar), each specified over the Fleet read model. |

No new authoritative Fleet master or transaction entity is introduced by this sprint.

### 10.2 Relationships

- Each **Fleet Read-Model Projection** is derived from one or more Fleet-owned entities/transactions authored by `SPR-MOD-014-001`, `SPR-MOD-014-002`, and `SPR-MOD-014-003` and updated by consuming their emitted events.
- Each **Fleet Operational Report Specification** is defined over one or more Fleet Read-Model Projections and rendered via `ENG-021`.

### 10.3 Ownership Boundaries

- **Fleet Read-Model Projections** and the **Fleet Operational Report Specification catalog** are owned by `MOD-014` per the Fleet Read-Model & Report Authority (§1.1.1). ERP Core Engines do not redefine them.
- **Vehicle**, **Driver**, **License**, **Compliance Registration**, **Insurance Coverage**, and **Fleet Configuration** are owned by `SPR-MOD-014-001`; consumed read-only here.
- **Route**, **Trip Sheet**, and **Trip Candidate** are owned by `SPR-MOD-014-002`; consumed read-only here.
- **Fuel Station**, **Fuel Entry**, and **Maintenance Order** are owned by `SPR-MOD-014-003`; consumed read-only here.
- **Cross-module KPI definitions** are owned by **MOD-017 Analytics**; consumed read-only via `ENG-023`.
- **Identity** entities are owned by MOD-001 Platform; consumed read-only via `ENG-002`.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

*None.* Per Sprint Plan §2 (`SPR-MOD-014-004`), this sprint is read-model-only and originates no new domain events.

### 11.2 Consumed

- **`ComplianceExpiring`** — originated by `SPR-MOD-014-001`; consumed via `ENG-024` to update the Compliance Calendar read-model projection.
- **`TripClosed`** — originated by `SPR-MOD-014-002`; consumed via `ENG-024` to update the Trip Sheet read-model projection.
- **`FuelRecorded`** — originated by `SPR-MOD-014-003`; consumed via `ENG-024` to update the Fuel Efficiency read-model projection.
- **`MaintenanceCompleted`** — originated by `SPR-MOD-014-003`; consumed via `ENG-024` to update the Maintenance Cost read-model projection.

Payload contracts for Fleet events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Fleet report, dashboard, search, export, and audit-readiness read.
- [ ] Trip Sheet, Fuel Efficiency, Maintenance Cost, and Compliance Calendar reports render via `ENG-021` over the Fleet read model.
- [ ] Fleet dashboards surface renders via `ENG-022` and consumes cross-module KPI definitions read-only from MOD-017 via `ENG-023`.
- [ ] Search over Fleet-owned entities and transactions is available via `ENG-020`.
- [ ] Bulk exports of operational reports are produced via `ENG-027`.
- [ ] Fleet read-model projections are updated deterministically and idempotently from `ComplianceExpiring`, `TripClosed`, `FuelRecorded`, and `MaintenanceCompleted` consumed via `ENG-024`.
- [ ] Audit-readiness surface exposes, for every Fleet-owned state-changing transaction, the corresponding `ENG-004` audit record.
- [ ] Notifications emit via `ENG-025` under the tenant's configured channels where the tenant so configures.
- [ ] No new master data, transactions, engines, or ADRs are introduced by this sprint.
- [ ] No Fleet code path writes to `ENG-015` Voucher or `ENG-016` Posting; no cross-module KPI definition is authored here.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-014_SPRINT_PLAN.md` §2 (`SPR-MOD-014-004`):

- Trip Sheet, Fuel Efficiency, Maintenance Cost, and Compliance Calendar reports render via `ENG-021`.
- Dashboards surface Fleet read-model projections via `ENG-022`; KPI definitions are consumed read-only from MOD-017.
- Bulk exports of operational reports are produced via `ENG-027`.
- Audit-readiness surface is complete: every state-changing transaction traces to an `ENG-004` audit event.
- No new master data, transactions, engines, or ADRs are introduced; the sprint is read-model-only.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 4 depends on `SPR-MOD-014-001` (Fleet Foundation), `SPR-MOD-014-002` (Trip Planning & Execution), and `SPR-MOD-014-003` (Fuel & Maintenance) being authored and their masters, transactions, and events stable.
  - **Impact:** Any regression in upstream Fleet sprints breaks the Fleet read model and every operational report.
  - **Mitigation:** Consume upstream Fleet state read-only through Fleet-owned APIs and consumed events; escalate any regression as an upstream Fleet defect.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Sprint 4 consumes cross-module KPI definitions from MOD-017 Analytics via `ENG-023`. MOD-017 authority for cross-module KPI definitions must remain stable.
  - **Impact:** Drift in MOD-017 KPI definitions would fragment the dashboards surface.
  - **Mitigation:** Consume MOD-017 KPI definitions read-only; escalate any change as an Analytics defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-014 depends on `MOD001_PLATFORM_BASELINE_v1` (tenancy, company hierarchy, users/roles/permissions, configuration hierarchy, audit review) being frozen.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen Platform baseline contract; treat any regression as a Platform defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** MOD-014 depends on `MOD002_ACCOUNTING_BASELINE_v1` for the ledger authority preserved by the Fleet ↔ Accounting boundary. This sprint does not itself invoke posting but must not duplicate an Accounting ledger view.
  - **Impact:** Blurring the boundary would fragment financial visibility.
  - **Mitigation:** Surface operational Fleet views only; escalate any duplication as a design defect.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Fleet Read-Model & Report Authority (§1.1.1) MUST NOT be redefined by downstream modules; cross-module KPI definitions MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment the reporting surface and duplicate KPIs.
  - **Mitigation:** Enforce §1.1.1, the Fleet ↔ Analytics Boundary (§1.1.2), the Fleet ↔ Platform and Accounting Boundary (§1.1.3), and the Read-Model-Only Boundary (§1.1.4) at every module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 4 consumes `ComplianceExpiring`, `TripClosed`, `FuelRecorded`, and `MaintenanceCompleted`. Any event name not present in the authoritative event catalog at Sprint 4 In-Progress time is a deferred event-catalog registration item.
  - **Impact:** If not registered before this sprint enters `In Progress`, the read model cannot be updated from the event stream.
  - **Mitigation:** Confirm event catalog registration for all four consumed events before this sprint enters `In Progress`; registration itself is owned by the originating sprints.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — read-model projection idempotency keying by (event, offset); tenant/company scoping on every projection; report specification determinism given the same read-model state.
- **Integration** — audit-readiness surface over `ENG-004`; search via `ENG-020`; reporting via `ENG-021`; dashboards via `ENG-022`; cross-module KPI consumption via `ENG-023`; event consumption via `ENG-024`; notification emission via `ENG-025`; bulk export via `ENG-027`.
- **Contract** — cross-module KPI definitions consumed from MOD-017 conform to the authoritative interface; consumed event payloads conform to the authoritative event catalog.
- **End-to-end (smoke)** — publish `TripClosed` → Fleet read model updates → Trip Sheet report renders → export requested → notification emitted; publish `FuelRecorded` → Fuel Efficiency report updates; publish `MaintenanceCompleted` → Maintenance Cost report updates; publish `ComplianceExpiring` → Compliance Calendar report updates. Two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an event-replay fixture for idempotency, and a MOD-017 KPI-definition fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider building each Fleet read-model projection behind a single idempotent event-consumption handler keyed by (event type, event id) so replay does not double-project.
- Consider co-locating report specifications with their read-model projections so report determinism is defensible from a single source.
- Consider surfacing the audit-readiness view as a projection over `ENG-004` events tagged with Fleet-owned entity kinds, rather than a separate audit store.
- Consider making cross-module KPI consumption via `ENG-023` explicit at the dashboard boundary so any drift with MOD-017 is contained to a single seam.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-014-004`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Fleet read-model and operational reporting surface (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar; dashboards; exports; audit-readiness) — read-model-only (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-014 MODULE_PRD section (§9, §11, §12, §13). No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Fleet Read-Model & Report Authority (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters (`SPR-MOD-014-001`), trip layer (`SPR-MOD-014-002`), fuel & maintenance (`SPR-MOD-014-003`), MOD-002-owned ledger postings, cross-module KPI definitions (MOD-017), and identity/permissions (MOD-001) — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next artifact begin immediately after this one completes?**
   Yes. Being the final MOD-014 sprint, the immediate successor is **GT-004 Baseline Consolidation** for MOD-014 per [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md).

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md)
- Upstream Fleet Sprint PRDs — [`./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md`](./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md), [`./SPR-MOD-014-002-trip-planning-and-execution.md`](./SPR-MOD-014-002-trip-planning-and-execution.md), [`./SPR-MOD-014-003-fuel-and-maintenance.md`](./SPR-MOD-014-003-fuel-and-maintenance.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
