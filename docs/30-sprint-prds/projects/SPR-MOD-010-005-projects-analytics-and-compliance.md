---
title: "SPR-MOD-010-005 — Projects Analytics & Compliance"
summary: "Sprint PRD for the Projects read-model surface of MOD-010: operational reports (Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis), dashboards, exports, and audit readiness. Read-model only; consumes data and events produced by SPR-MOD-010-001 … SPR-MOD-010-004 and publishes no new business events."
layer: "delivery"
owner: "Delivery"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-010-005"
parent_module: "MOD-010"
parent_sprint_plan: "MOD-010_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "12.0.5"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-021", "ENG-022", "ENG-024", "ENG-025", "ENG-026", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "projects", "mod-010", "analytics", "reporting", "dashboards", "compliance", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD010-005-20260715T011000Z-001"
parent_result_id: "GT003-MOD010-004-20260715T010000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-010-005 — Projects Analytics & Compliance

> **Stage 2 deliverable.** Fifth and final Sprint PRD for **MOD-010 Projects** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines, Accepted ADRs, and the transactional surfaces authored in `SPR-MOD-010-001` … `SPR-MOD-010-004`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-010-005` (permanent) |
| Parent Module | `MOD-010` — Projects |
| Parent Sprint Plan | [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-010-001`](./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md), [`SPR-MOD-010-002`](./SPR-MOD-010-002-tasks-milestones-and-change-requests.md), [`SPR-MOD-010-003`](./SPR-MOD-010-003-timesheets-and-effort.md), [`SPR-MOD-010-004`](./SPR-MOD-010-004-budgets-costs-and-project-billing.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen) |
| Downstream Sprints | *None* — final Stage 2 sprint for MOD-010 |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Projects read-model surface** for BusinessOS: operational reports (Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis — Module PRD §9), dashboards, exports, and an audit-readiness surface that exposes every Projects event emitted during Sprints 1 – 4. Reports render via `ENG-021` Reporting; dashboards render via `ENG-022` Dashboard; exports run via `ENG-027` Export; bulk import of reference data (where applicable to reporting configuration) runs via `ENG-026` Import. Read-model only — no new transactional entities, no new business rules, no new business events.

> **Projects Ownership Convention (re-stated).** The Projects module owns the read-model view over its own transactional surfaces (Project, Resource, Rate Card, Task, Milestone, Milestone Completion, Change Request, Timesheet, Project Budget, Project Invoice) and surfaces the operational reports listed in Module PRD §9. ERP Core Engines provide shared infrastructure (authorization, audit, reporting, dashboard, eventing, notification, import, export) but **MUST NOT** redefine Projects business semantics. **Cross-module KPI definitions remain owned exclusively by MOD-017 Analytics** (Sprint Plan §7). Financial posting remains exclusive to **MOD-002 Accounting**. Payroll disbursement remains exclusive to **MOD-008 Payroll**. Employee master remains exclusive to **MOD-007 HRMS**. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**.

#### 1.1.1 Analytics Boundary — MOD-010 ↔ MOD-017

- **MOD-017 Analytics** owns cross-module KPI definitions and the enterprise KPI catalog per Module PRD §9. This sprint MUST NOT define, redefine, or duplicate cross-module KPIs.
- **MOD-010 Projects** surfaces its own operational reports listed in Module PRD §9 as a **read-model** projected from transactional data authored in Sprints 1 – 4.
- Where a Projects report references a cross-module KPI, the KPI definition is consumed from MOD-017; only the projection over Projects-owned data is authored here.

#### 1.1.2 Read-Model Boundary

- No new transactional entity is authored here. Every projection is derived from entities owned by `SPR-MOD-010-001` … `SPR-MOD-010-004`.
- No new business event is published by this sprint. Consumption of Projects-owned events (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued` — Module PRD §8) is limited to advancing read-model state.
- No new business rule is authored. Rule enforcement remains owned by the originating transactional sprints.

#### 1.1.3 Audit Readiness Surface

The audit-readiness surface exposes every Projects event emitted during Sprints 1 – 4 in a review-optimized read model backed by `ENG-004` Audit records. The audit contract remains owned by `ENG-004`; this sprint consumes it.

Ownership boundaries authored in `SPR-MOD-010-001` §1.1, `SPR-MOD-010-002` §1.1, `SPR-MOD-010-003` §1.1, and `SPR-MOD-010-004` §1.1 SHALL NOT be redefined here.

### 1.2 In Scope

- **Operational reports (Module PRD §9).** Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis — rendered via `ENG-021` Reporting.
- **Dashboards.** Projects dashboards surfaced via `ENG-022` Dashboard against the reports above.
- **Exports.** Bulk exports of report data via `ENG-027` Export in standard formats.
- **Import (reporting-adjacent reference data only).** Where reporting requires reference data ingestion, use `ENG-026` Import; MUST NOT ingest transactional Projects data.
- **Audit-readiness surface.** A read model over `ENG-004` audit records exposing every Projects event emitted during Sprints 1 – 4.
- **Event consumption.** Projects-owned events (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`) consumed via `ENG-024` to advance read-model state, per the authoritative event catalog.
- **Authorization.** Report, dashboard, export, and audit-readiness access authorized via `ENG-002` per `ADR-032`.
- **Notifications.** Subscription-based delivery of report snapshots and threshold alerts via `ENG-025` at configured trigger points.

### 1.3 Out of Scope

- Project, Resource, and Rate Card masters and Projects configuration — `SPR-MOD-010-001`.
- Task, Milestone, Milestone Completion, and Change Request — `SPR-MOD-010-002`.
- Timesheet transaction lifecycle and the capacity-justification rule — `SPR-MOD-010-003`.
- Project Budget authoring and re-baseline, project-cost roll-up, T&M and fixed-price billing, and the Project Invoice transaction lifecycle — `SPR-MOD-010-004`.
- Cross-module KPI definitions and the enterprise KPI catalog — owned by MOD-017 Analytics.
- Financial postings and tax computation — owned by MOD-002 Accounting.
- Payroll disbursement and payroll postings — owned by MOD-008 Payroll.
- Employee master and HR-originating lifecycle — owned by MOD-007 HRMS.
- Sales-order authoring and confirmation — owned by MOD-003 Sales.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Publication of new business events; introduction of new business rules; introduction of new transactional entities.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-010-005`:

- **Business capabilities.**
  - Users can render the five operational reports in Module PRD §9 (Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis).
  - Users can view Projects dashboards composed from these reports.
  - Users can export report data in standard formats.
  - Reviewers can consult an audit-readiness surface listing every Projects event emitted during Sprints 1 – 4.
- **Reporting.** Report definitions registered via `ENG-021` for each operational report in Module PRD §9.
- **Dashboards.** Dashboard definitions registered via `ENG-022` composed against the reports above.
- **Exports.** Export bindings registered via `ENG-027` for each operational report.
- **Import (reporting reference data).** Import bindings registered via `ENG-026` limited to reporting-adjacent reference data.
- **Event consumption wiring.** Consumer-side registrations against `ENG-024` for `ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued` per the authoritative event catalog.
- **Audit-readiness surface.** A read model over `ENG-004` audit records covering every Projects event emitted during Sprints 1 – 4.
- **Notification artifacts.** Report-snapshot and threshold-alert wiring via `ENG-025` at configured trigger points.
- **Documentation updates.** This Sprint PRD; sprint catalog entry for `SPR-MOD-010-005`.
- **Migration artifacts.** *N/A at PRD authoring time.*

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-010 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — analytics-facing view of all capabilities as read model | Read-model projections over Sprints 1 – 4 transactional data |
| §3 Personas — Project Manager, Consultant, Team Lead, Finance (secondary readers) | User stories (§4) |
| §8 Integration Points — Projects-owned events consumed as read-model input | Event consumption via `ENG-024` (§11.2) |
| §9 Reports & Analytics — Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis; Dashboards; Exports | Reports (`ENG-021`), Dashboards (`ENG-022`), Exports (`ENG-027`) |
| §11 Non-functional — Audit readiness | Audit-readiness surface backed by `ENG-004` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Projects Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) §4.1 allocates every §2 Business Scope capability to Sprints 1 – 4 as their originating sprint. Sprint 5 originates **no §2 capability**; it is originating-allocated to the **Projects Analytics read-model surface** (Sprint Plan §4.2 note; §9 coverage). This is a read-model-over-existing-transactions allocation and does not duplicate any prior originating claim.

| Originating Allocation | Origin Sprint |
| --- | --- |
| Projects Analytics read-model surface (§9) | `SPR-MOD-010-005` |
| Audit-readiness surface (§11 Non-functional) | `SPR-MOD-010-005` |

These allocations are unique; no other Projects sprint claims the analytics read-model surface or the audit-readiness surface as originating capabilities.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §9 reports + §11 audit-readiness → this Sprint PRD → deliverables in §2.
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3; every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Project Manager, I want to view the Project P&L report, so that revenue and cost roll-up for each Project under my tenant/company scope are visible at aggregate.*
- **US-002.** *As a Project Manager, I want to view the Utilization report, so that Resource utilization derived from approved Timesheets recorded in Sprint 3 is visible.*
- **US-003.** *As a Project Manager, I want to view the Burn Down report, so that Project Budget consumption against cost roll-up recorded in Sprint 4 is visible over time.*
- **US-004.** *As a Team Lead, I want to view the Milestone Status report, so that milestone-completion state authored in Sprint 2 is visible across the portfolio.*
- **US-005.** *As a Project Manager, I want to view the Overrun Analysis report, so that Projects whose actual cost exceeds their Project Budget (Sprint 4) are visible.*
- **US-006.** *As any Projects reader, I want dashboards that compose the reports above via `ENG-022`, so that operational state is visible in a single surface.*
- **US-007.** *As any Projects reader, I want to export report data via `ENG-027` in standard formats, so that data can be shared outside the platform.*
- **US-008.** *As the Projects read model, I want to consume Projects-owned events via `ENG-024`, so that read-model state advances deterministically with transactional state changes.*
- **US-009.** *As a compliance reviewer, I want an audit-readiness surface that lists every Projects event emitted during Sprints 1 – 4, so that review can be conducted without querying `ENG-004` directly.*
- **US-010.** *As a subscriber, I want configurable notifications for report snapshots and threshold alerts via `ENG-025`.*
- **US-011.** *As a security reviewer, I want every report/dashboard/export/audit-readiness access authorized via `ENG-002` per `ADR-032` and audited via `ENG-004`.*

---

## 5. Acceptance Criteria

Given / When / Then. Objective and testable.

### 5.1 Operational reports (US-001 … US-005)

- **Given** the read model projected from Sprints 1 – 4 data,
  **when** a caller with the appropriate authorization renders any of *Project P&L*, *Utilization*, *Burn Down*, *Milestone Status*, or *Overrun Analysis*,
  **then** the report renders via `ENG-021` scoped to the caller's tenant/company, records access via `ENG-004`, and reflects the current read-model state.
- **Given** a report request that includes fields outside Projects ownership (e.g. journal-entry postings, payroll disbursement records, cross-module KPI definitions),
  **when** rendered,
  **then** the report MUST NOT project those fields from Projects-owned sources; where a cross-module KPI is referenced, its definition is consumed from MOD-017 Analytics.

### 5.2 Dashboards (US-006)

- **Given** the operational reports registered via `ENG-021`,
  **when** a caller renders a Projects dashboard,
  **then** the dashboard renders via `ENG-022`, composes only the operational reports declared in §2, is scoped to the caller's tenant/company, and access is audited via `ENG-004`.

### 5.3 Exports (US-007)

- **Given** any operational report registered via `ENG-021`,
  **when** a caller exports it,
  **then** the export runs via `ENG-027` in a standard format, is scoped to the caller's tenant/company, and access is audited via `ENG-004`.

### 5.4 Event consumption (US-008)

- **Given** any Projects-owned event (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`) delivered via `ENG-024` per the authoritative event catalog envelope,
  **when** consumed,
  **then** the read-model state advances deterministically and idempotently, scoped to the tenant/company of the emitting transaction, and the consumption is audited via `ENG-004`.
- **Given** any event whose envelope does not conform to the authoritative event catalog,
  **when** delivered,
  **then** it is rejected deterministically and the rejection is audited via `ENG-004`; the event catalog is not modified here.

### 5.5 Audit-readiness surface (US-009)

- **Given** the audit-readiness surface backed by `ENG-004`,
  **when** a compliance reviewer queries it,
  **then** it exposes every Projects event emitted during Sprints 1 – 4 (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`) scoped to the caller's tenant/company and access is audited via `ENG-004`.

### 5.6 Notifications (US-010)

- **Given** a subscription registered via `ENG-025` for a report snapshot or threshold alert,
  **when** the configured trigger fires,
  **then** the notification is dispatched via `ENG-025` scoped to the subscriber's tenant/company, and dispatch is audited via `ENG-004`.

### 5.7 Authorization invariants (US-011)

- **Given** any Sprint-5 action (report render, dashboard render, export, event-consumption inspection, audit-readiness query, notification subscription),
  **when** executed,
  **then** authorization is enforced via `ENG-002` per `ADR-032` (RBAC + ABAC); an unauthorized principal is rejected deterministically.

### 5.8 Tenant isolation invariants

- **Given** any Sprint-5 read,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope per `ADR-011`; no cross-tenant read can succeed.

### 5.9 Read-model boundary invariants

- **Given** any Sprint-5 action,
  **when** executed,
  **then** it MUST NOT create, edit, approve, or archive any transactional entity owned by Sprints 1 – 4; MUST NOT publish any new business event; MUST NOT introduce a new business rule; MUST NOT define a cross-module KPI.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-010` — Projects.
- **Module PRD:** [`docs/20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (analytics-facing view of all capabilities as read model), §3 (Project Manager, Consultant, Team Lead, Finance — secondary readers), §8 (Projects-owned events consumed as read-model input), §9 (Reports & Analytics), §11 (Audit readiness), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-010` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen).
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen).
- **Upstream sprint dependencies (per Sprint Plan §2 and §7):** [`SPR-MOD-010-001`](./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md), [`SPR-MOD-010-002`](./SPR-MOD-010-002-tasks-milestones-and-change-requests.md), [`SPR-MOD-010-003`](./SPR-MOD-010-003-timesheets-and-effort.md), [`SPR-MOD-010-004`](./SPR-MOD-010-004-budgets-costs-and-project-billing.md).
- **Cross-module consumption (definitions only, read-only):** MOD-017 Analytics for cross-module KPI definitions referenced by any Projects report.
- **Downstream consumers:** *None inside MOD-010.* MOD-017 Analytics MAY consume Projects read-model surfaces for cross-module KPI composition through its own governance.

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
| `ENG-002` Authorization | Enforces authorization on every read-model action per `ADR-032`. |
| `ENG-004` Audit | Records report/dashboard/export/audit-readiness access, event consumption, and notification dispatch. |
| `ENG-021` Reporting | Renders each operational report registered by this sprint per Module PRD §9. |
| `ENG-022` Dashboard | Renders Projects dashboards composed against reports registered via `ENG-021`. |
| `ENG-024` Event | Consumes Projects-owned events (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`) to advance read-model state. |
| `ENG-025` Notification | Dispatches subscription-based report-snapshot and threshold-alert notifications. |
| `ENG-026` Import | Ingests reporting-adjacent reference data only; MUST NOT ingest transactional Projects data. |
| `ENG-027` Export | Runs bulk exports of report data in standard formats. |

`ENG-005` Configuration is consumed transitively through Sprints 1 – 4 outputs. `ENG-001` Identity, `ENG-003` Permission Management, `ENG-006` Localization, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-014` Scheduler, `ENG-015` Voucher, `ENG-016` Posting, `ENG-017` Numbering, `ENG-018` Currency, and `ENG-020` Search are **not** consumed by this sprint. Consumption is a strict subset of the Module PRD engine union per Sprint Plan §5.

---

## 9. ADR Consumption

Every ADR referenced here is `Accepted` in [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md).

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model enforced on every read-model access, report, dashboard, export, audit-readiness view, and notification. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every read-model action. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; they are not redefined here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Projects Read Model | MOD-010 (this sprint) | Read-only projection over transactional entities owned by `SPR-MOD-010-001` … `SPR-MOD-010-004`. |
| Report Registration | MOD-010 (this sprint), consumed by `ENG-021` | Declarative registration of each operational report in Module PRD §9. |
| Dashboard Registration | MOD-010 (this sprint), consumed by `ENG-022` | Declarative registration of Projects dashboards composed from operational reports. |
| Audit-Readiness View | MOD-010 (this sprint), backed by `ENG-004` | Read model over `ENG-004` audit records for Projects events emitted in Sprints 1 – 4. |

### 10.2 Relationships

- The **Projects Read Model** references (read-only) all transactional entities authored by `SPR-MOD-010-001` … `SPR-MOD-010-004`.
- A **Report Registration** projects zero or more Projects read-model entities.
- A **Dashboard Registration** composes one or more **Report Registrations**.
- An **Audit-Readiness View** projects zero or more `ENG-004` audit records scoped to Projects events.

### 10.3 Ownership Boundaries

- All entities listed here are **read-model** and non-authoritative for transactional state. Transactional ownership remains with `SPR-MOD-010-001` … `SPR-MOD-010-004`.
- Cross-module KPI definitions are owned by MOD-017 Analytics; not Projects-owned.
- The **Employee** entity remains owned by MOD-007 HRMS; consumed read-only where surfaced via Sprint-1-owned Resource references.
- Financial-posting entities remain owned by MOD-002 Accounting; not surfaced in Projects reports.
- Payroll-master entities remain owned by MOD-008 Payroll; not surfaced in Projects reports.

Physical schema is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).

### 11.1 Published

*None.* Per §1.1.2, this sprint publishes no new business events.

### 11.2 Consumed

| Event | Handled As | Emitted By (per authoritative catalog) |
| --- | --- | --- |
| `ProjectCreated` | Advances Project P&L, Burn Down, Milestone Status, and Overrun Analysis read-model projections. | `SPR-MOD-010-002` |
| `MilestoneCompleted` | Advances Milestone Status and Project P&L read-model projections. | `SPR-MOD-010-002` |
| `TimesheetApproved` | Advances Utilization, Project P&L, and Burn Down read-model projections. | `SPR-MOD-010-003` |
| `ProjectInvoiceIssued` | Advances Project P&L, Burn Down, and Overrun Analysis read-model projections. | `SPR-MOD-010-004` |

Payload contracts remain owned by the authoritative event catalog. Any event name not present in the authoritative event catalog at authoring time is mapped to its authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every read-model access, report, dashboard, export, audit-readiness view, and notification.
- [ ] Every read-model access, event consumption, and notification dispatch produces an audit record via `ENG-004`.
- [ ] Report definitions are registered via `ENG-021` for each operational report in Module PRD §9.
- [ ] Dashboard definitions are registered via `ENG-022` composed against those reports.
- [ ] Export bindings are registered via `ENG-027` for each operational report.
- [ ] Projects-owned events (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`) are consumed via `ENG-024` and advance the read-model deterministically and idempotently.
- [ ] The audit-readiness surface exposes every Projects event emitted during Sprints 1 – 4.
- [ ] No new business event is published; no new business rule is authored; no new transactional entity is created.
- [ ] Cross-module KPI definitions remain owned by MOD-017; no such definition is authored here.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-010_SPRINT_PLAN.md` §2 (`SPR-MOD-010-005`):

- Reports and dashboards render from data produced by prior sprints and consumed cross-module events.
- Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
- Audit readiness surface exposes every Projects event emitted during the sprint sequence.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **Risk ID:** R-01
  - **Description:** MOD-010 read model depends on `SPR-MOD-010-001` … `SPR-MOD-010-004` transactional outputs being stable.
  - **Impact:** Regressions against any predecessor sprint corrupt read-model projections and derived reports.
  - **Mitigation:** Treat predecessor outputs as an internal contract; escalate drift as a defect in the originating sprint.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Cross-module KPI definitions are owned by MOD-017 Analytics; ownership drift could cause duplication or divergence.
  - **Impact:** Duplicate KPI definitions would fragment enterprise reporting and break traceability to MOD-017.
  - **Mitigation:** Consume MOD-017 KPI definitions only; escalate divergence through MOD-017 governance. Enforce §1.1.1 boundary.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Consumed Projects events (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`) must have stable envelopes per the authoritative event catalog.
  - **Impact:** Envelope drift would corrupt read-model projections and downstream reports.
  - **Mitigation:** Consume only per the authoritative event catalog; surface envelope failures via `ENG-004`; escalate through event-catalog governance.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Scope-creep from downstream MOD-017 Analytics or upstream transactional sprints into this sprint.
  - **Impact:** Silent absorption of adjacent scope would blur analytics ownership and dilute the read-model surface.
  - **Mitigation:** Enforce the §1.3 out-of-scope list and the §1.1 ownership boundaries.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Projects MUST NOT publish new business events, write journal entries, or perform payroll disbursement from the read-model surface.
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
- **Integration** — authorization via `ENG-002`, audit via `ENG-004`, reporting via `ENG-021`, dashboard via `ENG-022`, event consumption via `ENG-024`, notification via `ENG-025`, import via `ENG-026`, export via `ENG-027`.
- **Contract** — consumed event envelopes (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`) per the authoritative event catalog.
- **End-to-end (smoke)** — full read-model smoke across a two-tenant / two-company fixture to verify `ADR-011` isolation and to verify that reports, dashboards, and exports project only Projects-owned data. Audit-readiness smoke to verify every Projects event emitted during Sprints 1 – 4 is present in the audit-readiness surface.

Sprint-specific fixtures: fixtures inherited from Sprints 1 – 4 plus a subscription fixture for notification tests.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or business rules.*

- Consider projecting the read model as materialized views maintained by idempotent event consumers, rebuildable from `ENG-004` audit records and Sprint-1 – 4 transactional state.
- Prefer subscription-based notification delivery via `ENG-025` at explicit trigger points rather than polling.
- Where a report references a cross-module KPI, resolve the definition from MOD-017 Analytics at render time; do not cache the definition locally.

---

## 17. Authoring Compliance

- Authored via **GT-003 Sprint Authoring v1.0** under **Governance Framework v1.0** and **FROZEN Execution Wrapper v1.0**.
- Zero fabrication: every sprint-specific identifier, capability, engine, ADR, event, and exit criterion resolves verbatim from the authoritative sources declared in the FROZEN Wrapper v1.0 Step 3 (`docs/20-module-prds/projects/MODULE_PRD.md`, `docs/30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md`, `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`, `docs/11-adrs/ADR_INDEX.md`, `docs/02-architecture/event-catalog.md`, `docs/MODULE_CATALOG.md`).
- Registration limited to GT-003 surfaces: `docs/30-sprint-prds/projects/README.md`, `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`.
- Governance Framework v1.0, GT templates, and Execution Wrapper v1.0 unchanged.
