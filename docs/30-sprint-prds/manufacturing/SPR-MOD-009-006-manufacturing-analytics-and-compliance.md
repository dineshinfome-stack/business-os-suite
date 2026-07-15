---
title: "SPR-MOD-009-006 — Manufacturing Analytics & Compliance"
summary: "Sprint PRD for the Manufacturing read-model surface of MOD-009: operational reports (Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate), dashboards, exports, and audit readiness. Read-model only; consumes data and events produced by SPR-MOD-009-001 … SPR-MOD-009-005 and publishes no new business events."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-009-006"
parent_module: "MOD-009"
parent_sprint_plan: "MOD-009_SPRINT_PLAN.md"
iteration: "Sprint 6"
stage: "2"
pass: "11.0.6"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-020", "ENG-021", "ENG-022", "ENG-024", "ENG-025", "ENG-026", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "manufacturing", "mod-009", "analytics", "reporting", "dashboards", "compliance", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD009-006-20260715T001200Z-001"
parent_result_id: "GT003-MOD009-005-20260715T001100Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-009-006 — Manufacturing Analytics & Compliance

> **Stage 2 deliverable.** Sixth and final Sprint PRD for **MOD-009 Manufacturing** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines, Accepted ADRs, and the transactional surfaces authored in `SPR-MOD-009-001` … `SPR-MOD-009-005`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-009-006` (permanent) |
| Parent Module | `MOD-009` — Manufacturing |
| Parent Sprint Plan | [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) |
| Iteration | Sprint 6 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-009-001`](./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md), [`SPR-MOD-009-002`](./SPR-MOD-009-002-production-planning-and-scheduling.md), [`SPR-MOD-009-003`](./SPR-MOD-009-003-work-orders-and-shopfloor-execution.md), [`SPR-MOD-009-004`](./SPR-MOD-009-004-sub-contracting.md), [`SPR-MOD-009-005`](./SPR-MOD-009-005-quality-yield-and-scrap.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) |
| Downstream Sprints | *None* — final Stage 2 sprint for MOD-009 |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Manufacturing read-model surface** for BusinessOS: operational reports (Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate — Module PRD §9), dashboards, exports, and an audit-readiness surface that exposes every Manufacturing event emitted during Sprints 1 – 5. Reports render via `ENG-021` Reporting; dashboards render via `ENG-022` Dashboard; exports run via `ENG-027` Export; bulk import of reference data (where applicable to reporting configuration) runs via `ENG-026` Import; discoverability runs via `ENG-020` Search. Read-model only — no new transactional entities, no new business rules, no new business events.

> **Manufacturing Ownership Convention (re-stated).** The Manufacturing module owns the read-model view over its own transactional surfaces (BOM, Routing, Production Plan, Work Order, Production Entry, Sub-contract Challan, Quality Inspection) and surfaces the operational reports listed in Module PRD §9. ERP Core Engines provide shared infrastructure (authorization, audit, search, reporting, dashboard, eventing, notification, import, export) but **MUST NOT** redefine Manufacturing business semantics. **Cross-module KPI definitions remain owned exclusively by MOD-017 Analytics** (Sprint Plan §6, R5). Financial posting remains exclusive to **MOD-002 Accounting**. Stock disposition remains exclusive to **MOD-005 Inventory**. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**.

#### 1.1.1 Analytics Boundary — MOD-009 ↔ MOD-017

- **MOD-017 Analytics** owns cross-module KPI definitions and the enterprise KPI catalog. This sprint MUST NOT define, redefine, or duplicate cross-module KPIs.
- **MOD-009 Manufacturing** surfaces its own operational reports listed in Module PRD §9 as a **read-model** projected from transactional data authored in Sprints 1 – 5.
- Where a Manufacturing report references a cross-module KPI (e.g. OEE composite metrics that aggregate maintenance data), the KPI definition is consumed from MOD-017; only the projection over Manufacturing-owned data is authored here.

#### 1.1.2 Read-Model Boundary

- No new transactional entity is authored here. Every projection is derived from entities owned by `SPR-MOD-009-001` … `SPR-MOD-009-005`.
- No new business event is published by this sprint. Consumption of Manufacturing-owned events (`WorkOrderReleased`, `ProductionCompleted`, `QualityRejected`, `SubContractDispatched` — Module PRD §8) is limited to advancing read-model state.
- No new business rule is authored. Rule enforcement remains owned by the originating transactional sprints.

#### 1.1.3 Audit Readiness Surface

The audit-readiness surface exposes every Manufacturing event emitted during Sprints 1 – 5 in a review-optimized read model backed by `ENG-004` Audit records. Retention, tamper evidence, and the audit contract remain owned by `ADR-014` and `ENG-004`; this sprint consumes them.

Ownership boundaries authored in `SPR-MOD-009-001` §1.1, `SPR-MOD-009-002` §1.1, `SPR-MOD-009-003` §1.1, `SPR-MOD-009-004` §1.1, and `SPR-MOD-009-005` §1.1 SHALL NOT be redefined here.

### 1.2 In Scope

- **Operational reports (Module PRD §9).** Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate — rendered via `ENG-021` Reporting.
- **Dashboards.** Manufacturing dashboards surfaced via `ENG-022` Dashboard against the reports above.
- **Exports.** Bulk exports of report data via `ENG-027` Export in standard formats.
- **Search.** Discoverability of Manufacturing read-model entities via `ENG-020` Search.
- **Import (reporting-adjacent reference data only).** Where reporting requires reference data ingestion, use `ENG-026` Import; MUST NOT ingest transactional Manufacturing data.
- **Audit-readiness surface.** A read model over `ENG-004` audit records exposing every Manufacturing event emitted during Sprints 1 – 5.
- **Event consumption.** Manufacturing-owned events (`WorkOrderReleased`, `ProductionCompleted`, `QualityRejected`, `SubContractDispatched`) consumed via `ENG-024` to advance read-model state, per the authoritative event catalog.
- **Authorization.** Report, dashboard, export, search, and audit-readiness access authorized via `ENG-002` per `ADR-032`.
- **Notifications.** Subscription-based delivery of report snapshots and threshold alerts via `ENG-025` at configured trigger points.

### 1.3 Out of Scope

- BOM, Routing, Item, and Manufacturing configuration authoring — `SPR-MOD-009-001`.
- Production Plan lifecycle — `SPR-MOD-009-002`.
- Work Order and Production Entry lifecycle — `SPR-MOD-009-003`.
- Sub-contract Challan lifecycle and sub-contract return-window enforcement — `SPR-MOD-009-004`.
- Quality Inspection lifecycle and quality-rejection issuance enforcement — `SPR-MOD-009-005`.
- Cross-module KPI definitions and the enterprise KPI catalog — owned by MOD-017 Analytics.
- Item master, stock ledger, and inventory movements — owned by MOD-005 Inventory.
- Financial postings and financial reports — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Publication of new business events; introduction of new business rules; introduction of new transactional entities.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-009-006`:

- **Business capabilities.**
  - Users can render the five operational reports in Module PRD §9 (Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate).
  - Users can view Manufacturing dashboards composed from these reports.
  - Users can export report data in standard formats.
  - Users can discover Manufacturing read-model entities via search.
  - Reviewers can consult an audit-readiness surface listing every Manufacturing event emitted during Sprints 1 – 5.
- **Reporting.** Report definitions registered via `ENG-021` for each operational report in Module PRD §9.
- **Dashboards.** Dashboard definitions registered via `ENG-022` composed against the reports above.
- **Exports.** Export bindings registered via `ENG-027` for each operational report.
- **Search.** Search registrations via `ENG-020` for the Manufacturing read-model entities projected here.
- **Import (reporting reference data).** Import bindings registered via `ENG-026` limited to reporting-adjacent reference data.
- **Event consumption wiring.** Consumer-side registrations against `ENG-024` for `WorkOrderReleased`, `ProductionCompleted`, `QualityRejected`, `SubContractDispatched` per the authoritative event catalog.
- **Audit-readiness surface.** A read model over `ENG-004` audit records covering every Manufacturing event emitted during Sprints 1 – 5.
- **Notification artifacts.** Report-snapshot and threshold-alert wiring via `ENG-025` at configured trigger points.
- **Documentation updates.** This Sprint PRD; sprint catalog entry for `SPR-MOD-009-006`.
- **Migration artifacts.** *N/A at PRD authoring time.*

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-009 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — analytics-facing view of all capabilities as read model | Read-model projections over Sprints 1 – 5 transactional data |
| §3 Personas — Production Planner, Shopfloor Supervisor, Quality Inspector (secondary readers) | User stories (§4) |
| §8 Integration Points — Manufacturing-owned events consumed as read-model input | Event consumption via `ENG-024` (§11.2) |
| §9 Reports & Analytics — Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate; Dashboards; Exports | Reports (`ENG-021`), Dashboards (`ENG-022`), Exports (`ENG-027`) |
| §11 Non-functional — Audit readiness | Audit-readiness surface backed by `ENG-004` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Manufacturing Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) §4.1 allocates every §2 Business Scope capability to Sprints 1 – 5 as their originating sprint. Sprint 6 originates **no §2 capability**; it is originating-allocated to the **Manufacturing Analytics read-model surface** (Sprint Plan §4.2 note; §9 coverage). This is a read-model-over-existing-transactions allocation and does not duplicate any prior originating claim.

| Originating Allocation | Origin Sprint |
| --- | --- |
| Manufacturing Analytics read-model surface (§9) | `SPR-MOD-009-006` |
| Audit-readiness surface (§11 Non-functional) | `SPR-MOD-009-006` |

These allocations are unique; no other Manufacturing sprint claims the analytics read-model surface or the audit-readiness surface as originating capabilities.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §9 reports + §11 audit-readiness → this Sprint PRD → deliverables in §2.
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3; every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Production Planner, I want to view the Work Order Status report, so that I can see the state of every Work Order under my tenant/company scope.*
- **US-002.** *As a Shopfloor Supervisor, I want to view the OEE report, so that I can see equipment effectiveness derived from Production Entries recorded in Sprint 3.*
- **US-003.** *As a Production Planner, I want to view the Yield & Scrap report, so that Manufacturing yield and scrap captured in Sprint 5 are visible at aggregate.*
- **US-004.** *As a Production Planner, I want to view the Sub-contract Ageing report, so that sub-contract dispatches from Sprint 4 that have exceeded expected return windows are visible.*
- **US-005.** *As a Quality Inspector, I want to view the Quality Reject Rate report, so that Quality Inspection outcomes recorded in Sprint 5 are visible at aggregate.*
- **US-006.** *As any Manufacturing reader, I want dashboards that compose the reports above via `ENG-022`, so that operational state is visible in a single surface.*
- **US-007.** *As any Manufacturing reader, I want to export report data via `ENG-027` in standard formats, so that data can be shared outside the platform.*
- **US-008.** *As any Manufacturing reader, I want to search Manufacturing read-model entities via `ENG-020`, so that entities are discoverable.*
- **US-009.** *As the Manufacturing read model, I want to consume Manufacturing-owned events via `ENG-024`, so that read-model state advances deterministically with transactional state changes.*
- **US-010.** *As a compliance reviewer, I want an audit-readiness surface that lists every Manufacturing event emitted during Sprints 1 – 5, so that review can be conducted without querying `ENG-004` directly.*
- **US-011.** *As a subscriber, I want configurable notifications for report snapshots and threshold alerts via `ENG-025`.*
- **US-012.** *As a security reviewer, I want every report/dashboard/export/search/audit-readiness access authorized via `ENG-002` per `ADR-032` and audited via `ENG-004`.*

---

## 5. Acceptance Criteria

Given / When / Then. Objective and testable.

### 5.1 Operational reports (US-001 … US-005)

- **Given** the read model projected from Sprints 1 – 5 data,
  **when** a caller with the appropriate authorization renders any of *Work Order Status*, *OEE*, *Yield & Scrap*, *Sub-contract Ageing*, or *Quality Reject Rate*,
  **then** the report renders via `ENG-021` scoped to the caller's tenant/company, records access via `ENG-004`, and reflects the current read-model state.
- **Given** a report request that includes fields outside Manufacturing ownership (e.g. stock-ledger balances, journal-entry postings, cross-module KPI definitions),
  **when** rendered,
  **then** the report MUST NOT project those fields from Manufacturing-owned sources; where a cross-module KPI is referenced, its definition is consumed from MOD-017 Analytics.

### 5.2 Dashboards (US-006)

- **Given** the operational reports registered via `ENG-021`,
  **when** a caller renders a Manufacturing dashboard,
  **then** the dashboard renders via `ENG-022`, composes only the operational reports declared in §2, is scoped to the caller's tenant/company, and access is audited via `ENG-004`.

### 5.3 Exports (US-007)

- **Given** any operational report registered via `ENG-021`,
  **when** a caller exports it,
  **then** the export runs via `ENG-027` in a standard format, is scoped to the caller's tenant/company, and access is audited via `ENG-004`.

### 5.4 Search (US-008)

- **Given** the Manufacturing read-model entities projected here,
  **when** a caller searches via `ENG-020`,
  **then** results are scoped to the caller's tenant/company and access is audited via `ENG-004`.

### 5.5 Event consumption (US-009)

- **Given** any Manufacturing-owned event (`WorkOrderReleased`, `ProductionCompleted`, `QualityRejected`, `SubContractDispatched`) delivered via `ENG-024` per the authoritative event catalog,
  **when** it is consumed,
  **then** the corresponding Manufacturing read-model projection advances deterministically, consumption is idempotent under redelivery, and the consumption is audited via `ENG-004`.

### 5.6 Audit-readiness surface (US-010)

- **Given** every Manufacturing event emitted during Sprints 1 – 5,
  **when** a reviewer opens the audit-readiness surface,
  **then** the surface lists each emission with its Manufacturing event name, transactional identifier, tenant/company scope, actor, and timestamp, sourced from `ENG-004` audit records per `ADR-014`.

### 5.7 Notifications (US-011)

- **Given** a configured subscription to a report snapshot or threshold alert,
  **when** the trigger condition is met,
  **then** the notification is dispatched via `ENG-025` to the subscribed recipient(s), scoped to the caller's tenant/company, and dispatch is audited.

### 5.8 Authorization and audit (US-012)

- **Given** any report render, dashboard render, export, search, audit-readiness view, or notification dispatch,
  **when** it executes,
  **then** authorization is evaluated via `ENG-002` per `ADR-032` and access/execution is audited via `ENG-004` per `ADR-014`.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any read-model projection, report, dashboard, export, search result, audit-readiness view, or notification,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read can succeed.

### 5.10 Ownership consumption invariants

- **Given** any Manufacturing read-model code path,
  **when** it operates,
  **then** it MUST NOT define or duplicate a cross-module KPI (owned by MOD-017), MUST NOT write to the stock ledger (owned by MOD-005), MUST NOT write journal entries (owned by MOD-002), MUST NOT redefine identity (owned by MOD-001), and MUST NOT publish new business events.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-009` — Manufacturing.
- **Module PRD:** [`docs/20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Business Scope as read model), §8 (event consumption for read-model projection), §9 (Reports & Analytics), §11 (Audit readiness), §12 (Engine consumption), §13 (Dependencies).

---

## 7. Dependencies

- **Parent:** `MOD-009` MODULE_PRD.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-009-001` … `SPR-MOD-009-005` — all prior Manufacturing sprints (this sprint consumes their outputs).
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, hierarchy, users/roles/permissions, audit review.
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — read-only reference for Item identity where surfaced in reports.
- **Downstream sprints:** *None* — final Stage 2 sprint for MOD-009.
- **Cross-module boundary:** cross-module KPI definitions are consumed from MOD-017 Analytics; they are not authored here.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined**. Each engine is a subset of the Module PRD engine union per Module PRD §12 and matches Sprint Plan §5 (Engine Consumption Map) for `SPR-MOD-009-006`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Authorizes report, dashboard, export, search, audit-readiness, and notification actions. |
| `ENG-004` Audit | Records every read-model access, event consumption, and notification dispatch; also backs the audit-readiness surface. |
| `ENG-020` Search | Provides discoverability over Manufacturing read-model entities. |
| `ENG-021` Reporting | Renders the operational reports in Module PRD §9. |
| `ENG-022` Dashboard | Renders Manufacturing dashboards composed from the operational reports. |
| `ENG-024` Eventing | Consumes Manufacturing-owned events (`WorkOrderReleased`, `ProductionCompleted`, `QualityRejected`, `SubContractDispatched`) per the authoritative event catalog. |
| `ENG-025` Notification | Dispatches report snapshots and threshold alerts to subscribers. |
| `ENG-026` Import | Ingests reporting-adjacent reference data only; MUST NOT ingest transactional Manufacturing data. |
| `ENG-027` Export | Exports report data in standard formats. |

Manufacturing business semantics remain owned by the originating transactional sprints (`SPR-MOD-009-001` … `SPR-MOD-009-005`) and are not delegated to any engine here.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model enforced on every read-model access, report, dashboard, export, search, audit-readiness view, and notification. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration and by the audit-readiness surface. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every read-model action. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; they are not redefined here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Manufacturing Read Model | MOD-009 (this sprint) | Read-only projection over transactional entities owned by `SPR-MOD-009-001` … `SPR-MOD-009-005`. |
| Report Registration | MOD-009 (this sprint), consumed by `ENG-021` | Declarative registration of each operational report in Module PRD §9. |
| Dashboard Registration | MOD-009 (this sprint), consumed by `ENG-022` | Declarative registration of Manufacturing dashboards composed from operational reports. |
| Audit-Readiness View | MOD-009 (this sprint), backed by `ENG-004` | Read model over `ENG-004` audit records for Manufacturing events emitted in Sprints 1 – 5. |

### 10.2 Relationships

- The **Manufacturing Read Model** references (read-only) all transactional entities authored by `SPR-MOD-009-001` … `SPR-MOD-009-005`.
- A **Report Registration** projects zero or more Manufacturing read-model entities.
- A **Dashboard Registration** composes one or more **Report Registrations**.
- An **Audit-Readiness View** projects zero or more `ENG-004` audit records scoped to Manufacturing events.

### 10.3 Ownership Boundaries

- All entities listed here are **read-model** and non-authoritative for transactional state. Transactional ownership remains with `SPR-MOD-009-001` … `SPR-MOD-009-005`.
- Cross-module KPI definitions are owned by MOD-017 Analytics; not Manufacturing-owned.
- The **Item** entity and stock-ledger state are owned by MOD-005 Inventory; consumed read-only where surfaced.
- Financial-posting entities are owned by MOD-002 Accounting; not surfaced in Manufacturing reports.

Physical schema is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).

### 11.1 Published

*None.* Per §1.1.2, this sprint publishes no new business events.

### 11.2 Consumed

| Event | Handled As | Emitted By (per authoritative catalog) |
| --- | --- | --- |
| `WorkOrderReleased` | Advances Work Order Status and OEE read-model projections. | `SPR-MOD-009-003` |
| `ProductionCompleted` | Advances Work Order Status, OEE, and Yield & Scrap read-model projections. | `SPR-MOD-009-003` |
| `QualityRejected` | Advances Yield & Scrap and Quality Reject Rate read-model projections. | `SPR-MOD-009-005` |
| `SubContractDispatched` | Advances Sub-contract Ageing read-model projection. | `SPR-MOD-009-004` |

Payload contracts remain owned by the authoritative event catalog. Any event name not present in the authoritative event catalog at authoring time is mapped to its authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every read-model access, report, dashboard, export, search, audit-readiness view, and notification.
- [ ] Every read-model access, event consumption, and notification dispatch produces an audit record via `ENG-004`.
- [ ] Report definitions are registered via `ENG-021` for each operational report in Module PRD §9.
- [ ] Dashboard definitions are registered via `ENG-022` composed against those reports.
- [ ] Export bindings are registered via `ENG-027` for each operational report.
- [ ] Search registrations exist via `ENG-020` for Manufacturing read-model entities.
- [ ] Manufacturing-owned events (`WorkOrderReleased`, `ProductionCompleted`, `QualityRejected`, `SubContractDispatched`) are consumed via `ENG-024` and advance the read-model deterministically and idempotently.
- [ ] The audit-readiness surface exposes every Manufacturing event emitted during Sprints 1 – 5.
- [ ] No new business event is published; no new business rule is authored; no new transactional entity is created.
- [ ] Cross-module KPI definitions remain owned by MOD-017; no such definition is authored here.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-009_SPRINT_PLAN.md` §2 (`SPR-MOD-009-006`):

- Reports and dashboards render from data produced by prior sprints and consumed cross-module events.
- Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
- Audit readiness surface exposes every Manufacturing event emitted during the sprint sequence.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **Risk ID:** R-01
  - **Description:** MOD-009 read model depends on `SPR-MOD-009-001` … `SPR-MOD-009-005` transactional outputs being stable.
  - **Impact:** Regressions against any predecessor sprint corrupt read-model projections and derived reports.
  - **Mitigation:** Treat predecessor outputs as an internal contract; escalate drift as a defect in the originating sprint.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Cross-module KPI definitions are owned by MOD-017 Analytics; ownership drift could cause duplication or divergence.
  - **Impact:** Duplicate KPI definitions would fragment enterprise reporting and break traceability to MOD-017.
  - **Mitigation:** Consume MOD-017 KPI definitions only; escalate divergence through MOD-017 governance. Enforce §1.1.1 boundary.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Consumed Manufacturing events (`WorkOrderReleased`, `ProductionCompleted`, `QualityRejected`, `SubContractDispatched`) must have stable envelopes per the authoritative event catalog.
  - **Impact:** Envelope drift would corrupt read-model projections and downstream reports.
  - **Mitigation:** Consume only per the authoritative event catalog; surface envelope failures via `ENG-004`; escalate through event-catalog governance.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Scope-creep from downstream MOD-017 Analytics or upstream transactional sprints into this sprint.
  - **Impact:** Silent absorption of adjacent scope would blur analytics ownership and dilute the read-model surface.
  - **Mitigation:** Enforce the §1.3 out-of-scope list and the §1.1 ownership boundaries.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Manufacturing MUST NOT publish new business events, write to the stock ledger, or write journal entries from the read-model surface.
  - **Impact:** Blurring these boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce §1.1 ownership boundaries and the §1.1.2 read-model boundary.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Every consumed event MUST be registered in the authoritative event catalog before this sprint enters `In Progress`.
  - **Impact:** Missing or drifted registration would break read-model projections.
  - **Mitigation:** Verify via event-catalog governance before the sprint begins; do not modify the event catalog inside this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md).

- **Unit** — read-model projection functions for each operational report; idempotent event consumers; authorization predicates per `ADR-032`.
- **Integration** — authorization via `ENG-002`, audit via `ENG-004`, search via `ENG-020`, reporting via `ENG-021`, dashboard via `ENG-022`, event consumption via `ENG-024`, notification via `ENG-025`, import via `ENG-026`, export via `ENG-027`.
- **Contract** — consumed event envelopes (`WorkOrderReleased`, `ProductionCompleted`, `QualityRejected`, `SubContractDispatched`) per the authoritative event catalog.
- **End-to-end (smoke)** — full read-model smoke across a two-tenant / two-company fixture to verify `ADR-011` isolation and to verify that reports, dashboards, and exports project only Manufacturing-owned data. Audit-readiness smoke to verify every Manufacturing event emitted during Sprints 1 – 5 is present in the audit-readiness surface.

Sprint-specific fixtures: fixtures inherited from Sprints 1 – 5 plus a subscription fixture for notification tests.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing.*

- Consider projecting the read model as materialized views maintained by idempotent event consumers so replay cannot corrupt state.
- Consider co-locating audit-readiness projections with `ENG-004` cursor state so reviewer views are consistent under concurrent audit writes.
- Consider registering reports via `ENG-021` before wiring dashboards via `ENG-022` so dashboard composition is authoritative from the first render.
- Consider treating export via `ENG-027` and search via `ENG-020` as read-only integrations that cannot mutate read-model state.
- Consider gating notification triggers behind idempotent read-model transitions so subscribers cannot receive duplicate alerts under event redelivery.

These notes are **non-authoritative**.

---

## 17. Review Gate

1. **Does the sprint have exactly one objective?** Yes. Deliver the Manufacturing read-model surface (§1.1).
2. **Does every feature trace to a specific Module PRD section?** Yes. See §3 and §3.2.
3. **Are engines and ADRs consumed rather than redefined?** Yes. §8 and §9.
4. **Are out-of-scope items enumerated and linked to their owning sprints?** Yes. §1.3.
5. **Are acceptance criteria objective and testable?** Yes. §5.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?** Yes. §2, §12, §13 distinct.
7. **Does the next reserved sprint begin immediately after this one completes?** *N/A* — `SPR-MOD-009-006` is the final Stage 2 sprint for MOD-009. The successor artifact is `MOD009_MANUFACTURING_BASELINE_v1` under GT-004.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md)
- Predecessor Sprints — [`./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md`](./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md), [`./SPR-MOD-009-002-production-planning-and-scheduling.md`](./SPR-MOD-009-002-production-planning-and-scheduling.md), [`./SPR-MOD-009-003-work-orders-and-shopfloor-execution.md`](./SPR-MOD-009-003-work-orders-and-shopfloor-execution.md), [`./SPR-MOD-009-004-sub-contracting.md`](./SPR-MOD-009-004-sub-contracting.md), [`./SPR-MOD-009-005-quality-yield-and-scrap.md`](./SPR-MOD-009-005-quality-yield-and-scrap.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
