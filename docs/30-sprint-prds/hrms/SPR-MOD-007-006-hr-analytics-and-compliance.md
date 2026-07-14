---
title: "SPR-MOD-007-006 — HR Analytics & Compliance"
summary: "Sprint PRD for HRMS HR Analytics & Compliance: read-model operational reports, dashboards, exports, and audit-readiness surface built over data produced by SPR-MOD-007-001..005 and the consumed PayrollProcessed event."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-14"
sprint_id: "SPR-MOD-007-006"
parent_module: "MOD-007"
parent_sprint_plan: "MOD-007_SPRINT_PLAN.md"
iteration: "Sprint 6"
stage: "2"
pass: "9.3.5"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-020", "ENG-021", "ENG-022", "ENG-024", "ENG-025", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "hrms", "mod-007", "analytics", "compliance", "audit-readiness", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_wrapper_version: "1.0"
execution_wrapper_compatibility: ">=1.0,<2.0"
execution_id: "GT003-MOD007-006-20260714T000900Z-001"
parent_execution_id: "GT003-MOD007-005-20260714T000800Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per Wrapper v1.0 Snapshot Freeze>"
---

# SPR-MOD-007-006 — HR Analytics & Compliance

> **Stage 2 deliverable.** Sixth and final Stage 2 Sprint PRD for **MOD-007 HRMS** under the [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the FROZEN GT-003 Execution Wrapper v1.0. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-007-006` (permanent) |
| Parent Module | `MOD-007` — HRMS |
| Parent Sprint Plan | [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) |
| Iteration | Sprint 6 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-007-001`](./SPR-MOD-007-001-hrms-foundation-employee-master.md), [`SPR-MOD-007-002`](./SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md), [`SPR-MOD-007-003`](./SPR-MOD-007-003-attendance-and-leave.md), [`SPR-MOD-007-004`](./SPR-MOD-007-004-performance-and-appraisal.md), [`SPR-MOD-007-005`](./SPR-MOD-007-005-learning-development-and-self-service.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream | Stage 3 — `MOD007_HRMS_BASELINE_v1` consolidation via GT-004. |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |
| Execution Wrapper | v1.0 (FROZEN) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver **HR Analytics & Compliance** for MOD-007 HRMS as a **read-model surface**: operational HR reports (Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution), dashboards, KPI surfacing, exports, and an audit-readiness surface. Consumes — but does not redefine — the data produced by `SPR-MOD-007-001` … `SPR-MOD-007-005` and the `PayrollProcessed` event from MOD-008. **No transactional lifecycles are introduced.**

> **HRMS Ownership Convention (inherited from `SPR-MOD-007-001` §1.1).** MOD-007 HRMS owns operational HR reports and the HR audit-readiness surface. ERP Core Engines provide shared infrastructure but MUST NOT redefine HRMS report semantics. **Cross-module KPI definitions** remain exclusive to **MOD-017 Analytics**. **Payroll analytics** remain exclusive to **MOD-008 Payroll**. **Identity, authentication, and permissions** remain exclusive to **MOD-001 Platform**.

#### 1.1.1 HR Analytics Authority

The operational HR reports enumerated in Module PRD §9 (Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution) are authoritatively owned by MOD-007 HRMS. No other module MAY re-implement these operational reports. Cross-module KPI definitions and the cross-module KPI catalog remain owned by **MOD-017 Analytics** and are consumed from there.

#### 1.1.2 HRMS ↔ Analytics Boundary (MOD-017)

- **Cross-module KPI definitions** are authored once in **MOD-017 Analytics** and referenced from this sprint. This sprint MUST NOT redefine KPI formulas that already exist in MOD-017.
- Operational HR reports listed in Module PRD §9 remain within MOD-007 as the read-model surface for the HRMS bounded context.

#### 1.1.3 HRMS ↔ Payroll Boundary (MOD-008)

- **Payroll analytics, payslip issuance, statutory filings, and pay-run reports** remain owned by **MOD-008 Payroll**.
- This sprint **consumes** `PayrollProcessed` via `ENG-024` for HR cost-adjacent analytics only; it does not compute earnings, deductions, or pay-run outputs.

#### 1.1.4 HRMS ↔ Platform Boundary (Identity)

- Identity, authentication, roles, and permissions remain owned by MOD-001 Platform via `ENG-001` / `ENG-002` / `ENG-003`.
- All report reads, dashboard reads, and export invocations are authorized by `ENG-002` and audited by `ENG-004`.

#### 1.1.5 Audit Readiness Surface

- The audit-readiness surface exposes every HRMS domain event emitted during the sprint sequence (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`, `AppraisalCompleted`) for compliance review. It reads from the authoritative event catalog and audit records produced by `ENG-004`; it does NOT re-emit domain events.

### 1.2 In Scope

- **Operational HR reports** (Module PRD §9) delivered via `ENG-021` Reporting:
  - Headcount
  - Attendance Summary
  - Leave Balance
  - Attrition
  - Performance Distribution
- **Dashboards** delivered via `ENG-022` Dashboard for the reports above; cross-module KPI catalog is consumed from MOD-017 Analytics.
- **Search over HR read-model data** via `ENG-020` for report and dashboard lookups.
- **Bulk exports** via `ENG-027` in standard formats.
- **Event consumption:** `PayrollProcessed` via `ENG-024` for HR cost-adjacent analytics only.
- **Notifications** via `ENG-025` for scheduled report distribution and threshold-driven analytics alerts (business alerts only; platform alerts remain in MOD-001).
- **AI Copilot** via `ENG-028` to surface natural-language queries over HR read-model data (read-only; no state changes).
- **Audit readiness surface** exposing every HRMS domain event emitted by prior sprints (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`, `AppraisalCompleted`) plus every audit record produced by `ENG-004`.
- **Authorization** on every report read, dashboard read, export invocation, and audit-readiness read via `ENG-002` per `ADR-032`.
- **Audit integration** via `ENG-004` for every access to sensitive report and audit-readiness data.

### 1.3 Out of Scope

Reserved for later HRMS sprints or other modules:

- **Cross-module KPI definitions and KPI catalog** — owned by **MOD-017 Analytics**.
- **Payroll analytics, payslip issuance, statutory filings, pay-run reports** — owned by **MOD-008 Payroll**.
- **Financial postings** — owned by **MOD-002 Accounting** via `ENG-015` / `ENG-016`.
- **Transactional functionality** of prior HRMS sprints — Employee/org master (Sprint 1), Onboarding/Exit transactions (Sprint 2), Attendance/Leave transactions (Sprint 3), Appraisal transactions (Sprint 4), L&D consumption records and self-service surfaces (Sprint 5).
- **Identity provisioning / deprovisioning and permissions** — owned by **MOD-001 Platform**.
- New domain events published from analytics — this sprint is read-only.
- Physical schema, API routes, UI mockups, and source code.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-007-006`, the following will exist:

- **Business capabilities.**
  - Headcount, Attendance Summary, Leave Balance, Attrition, and Performance Distribution reports render via `ENG-021` over data produced by `SPR-MOD-007-001` … `SPR-MOD-007-005`.
  - Dashboards for the above reports render via `ENG-022`; cross-module KPI catalog is consumed from MOD-017.
  - Bulk exports of the above reports operate via `ENG-027` in standard formats.
  - `PayrollProcessed` is consumed via `ENG-024` and surfaces cost-adjacent HR analytics.
  - The audit-readiness surface exposes every HRMS domain event emitted during the sprint sequence and every `ENG-004` audit record for HR entities.
- **Event contracts.** `PayrollProcessed` is consumed via `ENG-024` per the authoritative event catalog. Payload shape, envelope, and delivery guarantees are governed by [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).
- **Audit artifacts.** Every read of sensitive report and audit-readiness data produces an audit record via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-007-006`.
- **Migration artifacts.** *N/A at PRD authoring time.*

---

## 3. Traceability to Module PRD

| MOD-007 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — all analytics-facing capabilities as read model | Operational reports, dashboards, exports, audit-readiness surface |
| §8 Integration Points — `PayrollProcessed` (consumed) | Event consumption via `ENG-024` |
| §9 Reports & Analytics — Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution | Reports via `ENG-021`; dashboards via `ENG-022`; KPI catalog consumed from MOD-017; exports via `ENG-027` |
| §11 Non-functional — Audit readiness | Audit-readiness surface exposing HRMS domain events and `ENG-004` audit records |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. **No capability introduced in this Sprint PRD is outside the approved HRMS Module PRD.**

### 3.1 Capability Allocation Compliance

Per [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) §4.4:

| Module PRD Reference | Origin Sprint |
| --- | --- |
| §9 Reports — Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution | `SPR-MOD-007-006` |
| §11 Audit readiness | `SPR-MOD-007-006` |
| §8 `PayrollProcessed` (consumed) | `SPR-MOD-007-006` |

The operational HR reports, dashboards, exports, and audit-readiness surface are originating-allocated to this sprint per Sprint Plan §2 and §4.4. `PayrollProcessed` is originating-consumed by this sprint per Sprint Plan §7.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §9 report names and §11 audit-readiness commitment → this Sprint PRD → deliverables in §2 (reports via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`; `PayrollProcessed` consumption; audit-readiness surface).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an HR Business Partner, I want to view the Headcount report scoped to my tenant/company, so that I can review workforce size.*
- **US-002.** *As an HR Manager, I want to view the Attendance Summary report, so that I can review attendance coverage across periods.*
- **US-003.** *As an HR Manager, I want to view Leave Balance across employees, so that I can review outstanding leave liability.*
- **US-004.** *As an HR Business Partner, I want to view the Attrition report, so that I can monitor exit patterns.*
- **US-005.** *As an HR Manager, I want to view the Performance Distribution report, so that I can review appraisal outcomes.*
- **US-006.** *As an HR Manager, I want to view HR dashboards that surface the above reports and consume cross-module KPI definitions from MOD-017 Analytics, so that I have an aggregate view.*
- **US-007.** *As an HR Business Partner, I want to export any HR report in a standard format, so that I can share with reviewers.*
- **US-008.** *As an HR Business Partner, I want to receive scheduled report distributions and threshold-driven analytics alerts, so that I stay informed without polling.*
- **US-009.** *As an HR Manager, I want to consume `PayrollProcessed` events for cost-adjacent HR analytics, so that HR reports can surface pay-processing signals without HR computing pay.*
- **US-010.** *As a compliance reviewer, I want an audit-readiness surface that exposes every HRMS domain event emitted during the sprint sequence and every `ENG-004` audit record for HR entities, so that HR compliance is demonstrable.*
- **US-011.** *As a security reviewer, I want every read of report, dashboard, export, and audit-readiness data to be authorized by `ENG-002` and audited by `ENG-004`.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Headcount report (US-001)

- **Given** an authenticated caller with authorization for HR reports within a tenant/company,
  **when** the caller requests the Headcount report,
  **then** the report is produced via `ENG-021` over Employee master data owned by `SPR-MOD-007-001`, scoped by `ENG-002`, and the access is audited via `ENG-004`.

### 5.2 Attendance Summary report (US-002)

- **Given** an authenticated caller with authorization for HR reports within a tenant/company,
  **when** the caller requests the Attendance Summary report,
  **then** the report is produced via `ENG-021` over Attendance data owned by `SPR-MOD-007-003`, scoped by `ENG-002`, and the access is audited via `ENG-004`.

### 5.3 Leave Balance report (US-003)

- **Given** an authenticated caller with authorization for HR reports within a tenant/company,
  **when** the caller requests the Leave Balance report,
  **then** the report is produced via `ENG-021` over Leave Request and leave-balance data owned by `SPR-MOD-007-003`, scoped by `ENG-002`, and the access is audited via `ENG-004`.

### 5.4 Attrition report (US-004)

- **Given** an authenticated caller with authorization for HR reports within a tenant/company,
  **when** the caller requests the Attrition report,
  **then** the report is produced via `ENG-021` over Exit Clearance data (and derived employment-lifecycle signals) owned by `SPR-MOD-007-002`, scoped by `ENG-002`, and the access is audited via `ENG-004`.

### 5.5 Performance Distribution report (US-005)

- **Given** an authenticated caller with authorization for HR reports within a tenant/company,
  **when** the caller requests the Performance Distribution report,
  **then** the report is produced via `ENG-021` over Appraisal data owned by `SPR-MOD-007-004`, scoped by `ENG-002`, and the access is audited via `ENG-004`.

### 5.6 Dashboards (US-006)

- **Given** an authenticated caller with authorization for HR dashboards,
  **when** the caller opens an HR dashboard,
  **then** the dashboard renders via `ENG-022` over the reports in §5.1–§5.5 and consumes cross-module KPI definitions from MOD-017 Analytics without redefining them; the access is scoped by `ENG-002` and audited via `ENG-004`.

### 5.7 Exports (US-007)

- **Given** an authenticated caller with authorization for HR exports,
  **when** the caller requests an export of any HR report in §5.1–§5.5,
  **then** the export is produced via `ENG-027` in a standard format, scoped by `ENG-002`, and the access is audited via `ENG-004`.

### 5.8 Scheduled distributions and alerts (US-008)

- **Given** a configured scheduled distribution or a configured analytics threshold,
  **when** the schedule fires or the threshold is crossed,
  **then** the recipients are notified via `ENG-025` and the delivery is audited via `ENG-004`.

### 5.9 `PayrollProcessed` consumption (US-009)

- **Given** a `PayrollProcessed` event delivered via `ENG-024`,
  **when** the event is consumed within a tenant/company,
  **then** the cost-adjacent HR analytics surface reflects the signal; this sprint MUST NOT compute earnings, deductions, or pay-run outputs (owned by MOD-008).

### 5.10 Audit-readiness surface (US-010)

- **Given** an authenticated compliance reviewer with authorization for the audit-readiness surface,
  **when** the reviewer opens the surface,
  **then** every HRMS domain event emitted during the sprint sequence (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`, `AppraisalCompleted`) and every `ENG-004` audit record for HR entities within the caller's tenant/company is enumerable; the access is scoped by `ENG-002` and audited via `ENG-004`.

### 5.11 Authorization and audit invariants (US-011)

- **Given** any read of report, dashboard, export, or audit-readiness data,
  **when** it executes,
  **then** authorization is enforced by `ENG-002` per `ADR-032`, and the access is audited via `ENG-004` per `ADR-014`.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any HR report, dashboard, export, event consumption, or audit-readiness read,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read can succeed.

### 5.13 Ownership consumption invariants

- **Given** any HR report or dashboard,
  **when** it renders,
  **then** it consumes data owned by `SPR-MOD-007-001` … `SPR-MOD-007-005` read-only; no transactional lifecycle is redefined.
- **Given** any dashboard that surfaces cross-module KPIs,
  **when** it renders,
  **then** the KPI definitions are consumed from **MOD-017 Analytics**; this sprint does not redefine them.
- **Given** any `PayrollProcessed` consumption,
  **when** it executes,
  **then** payroll semantics remain owned by **MOD-008 Payroll**; this sprint MUST NOT compute pay.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-007` — HRMS.
- **Module PRD:** [`docs/20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md).
- **Upstream Sprints (Stage 2):** [`SPR-MOD-007-001`](./SPR-MOD-007-001-hrms-foundation-employee-master.md), [`SPR-MOD-007-002`](./SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md), [`SPR-MOD-007-003`](./SPR-MOD-007-003-attendance-and-leave.md), [`SPR-MOD-007-004`](./SPR-MOD-007-004-performance-and-appraisal.md), [`SPR-MOD-007-005`](./SPR-MOD-007-005-learning-development-and-self-service.md).
- **Module PRD sections fulfilled:** §2 (analytics-facing capabilities as read model), §8 (`PayrollProcessed` consumed), §9 (Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution; dashboards; KPIs; exports), §11 (audit readiness), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-007` MODULE_PRD.
- **Upstream module baselines:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen).
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-007-001`, `SPR-MOD-007-002`, `SPR-MOD-007-003`, `SPR-MOD-007-004`, `SPR-MOD-007-005` — every prior HRMS sprint contributes read-model data.
- **Cross-module consumption (events only):** `PayrollProcessed` from **MOD-008 Payroll** (per Module PRD §8).
- **Cross-module consumption (definitions):** cross-module KPI catalog from **MOD-017 Analytics** (per Module PRD §9).
- **Downstream:** Stage 3 baseline `MOD007_HRMS_BASELINE_v1` (consolidated via GT-004 in Pass 9.4.0).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at v1.1 (Active). Execution Wrapper v1.0 (FROZEN) applies, compatibility `>=1.0,<2.0`.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (§1.1). Each engine matches Sprint Plan §SPR-MOD-007-006 verbatim.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every report, dashboard, export, event consumption, and audit-readiness read. |
| `ENG-004` Audit | Records every access to sensitive report and audit-readiness data; feeds the audit-readiness surface. |
| `ENG-020` Search | Backs report and dashboard lookups over HR read-model data. |
| `ENG-021` Reporting | Renders the operational HR reports enumerated in Module PRD §9. |
| `ENG-022` Dashboard | Renders HR dashboards; consumes cross-module KPI definitions from MOD-017. |
| `ENG-024` Eventing | Consumes `PayrollProcessed` per the authoritative event catalog. |
| `ENG-025` Notification | Delivers scheduled report distributions and threshold-driven analytics alerts. |
| `ENG-027` Export | Produces bulk exports of HR reports in standard formats. |
| `ENG-028` AI Copilot | Surfaces natural-language queries over the HR read model (read-only). |

HRMS business semantics (operational HR report definitions in Module PRD §9 and the audit-readiness surface) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every report, dashboard, export, event consumption, and audit-readiness read. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration and by the audit-readiness surface. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to all reads in scope. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

No new master or transactional entity is introduced. This sprint is a **read-model surface** over data produced by prior HRMS sprints and consumed cross-module events.

### 10.2 Relationships

- HR reports consume: **Employee / Position / Department / Grade / Shift** (owned by `SPR-MOD-007-001`); **Onboarding Task / Exit Clearance** (owned by `SPR-MOD-007-002`); **Attendance / Leave Request / Leave Type** (owned by `SPR-MOD-007-003`); **Appraisal** (owned by `SPR-MOD-007-004`); **L&D Consumption Record** (owned by `SPR-MOD-007-005`).
- The audit-readiness surface reads: every HRMS domain event (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`, `AppraisalCompleted`) and every `ENG-004` audit record for HR entities.
- The cost-adjacent analytics surface reads: `PayrollProcessed` (owned upstream by **MOD-008 Payroll**).

### 10.3 Ownership Boundaries

- Operational HR reports listed in Module PRD §9 and the HR audit-readiness surface are owned by `MOD-007` (this sprint) per §1.1.
- Cross-module KPI definitions remain owned by **MOD-017 Analytics**.
- Payroll analytics remain owned by **MOD-008 Payroll**.
- Underlying HR entities remain owned by their originating sprints (`SPR-MOD-007-001` … `SPR-MOD-007-005`).

Physical schema is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).

### 11.1 Published

Sprint 6 publishes **no new cross-module domain events**. HR analytics is a read-model surface; it enumerates existing HRMS domain events via the audit-readiness surface but does not emit new events.

### 11.2 Consumed

- **`PayrollProcessed`** — consumed from **MOD-008 Payroll** via `ENG-024`. Purpose: HR cost-adjacent analytics only. This sprint MUST NOT compute earnings, deductions, or pay-run outputs.

### 11.3 Event-Catalog Registration

`PayrollProcessed` is declared in Module PRD §8 and Sprint Plan §2 / §7 as consumed by this sprint. Every HRMS domain event enumerated by the audit-readiness surface (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`, `AppraisalCompleted`) is declared in Module PRD §8 as published by earlier HRMS sprints. If any of these event names is not yet present in the authoritative event catalog at authoring time, the shortfall is recorded as a deferred `R-EV-*` risk in §14 per Wrapper v1.0 event-resolution policy; the event catalog is not modified by this Sprint PRD.

---

## 12. Definition of Done

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every report, dashboard, export, event consumption, and audit-readiness read.
- [ ] Every access to sensitive report and audit-readiness data produces an audit record via `ENG-004`.
- [ ] Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
- [ ] `PayrollProcessed` is consumed via `ENG-024` per the authoritative event catalog.
- [ ] Cross-module KPI definitions are consumed from MOD-017 Analytics without redefinition.
- [ ] The audit-readiness surface exposes every HRMS domain event emitted during the sprint sequence and every `ENG-004` audit record for HR entities.
- [ ] Reads are authorized by `ENG-002` per `ADR-032`.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-007_SPRINT_PLAN.md` §2 (`SPR-MOD-007-006`):

- Reports and dashboards render from data produced by prior sprints and consumed cross-module events.
- Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
- Audit readiness surface exposes every HRMS event emitted during the sprint sequence.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **Risk ID:** R-01
  - **Description:** This sprint depends on data produced by `SPR-MOD-007-001` … `SPR-MOD-007-005`.
  - **Impact:** Any prior-sprint regression blocks report rendering.
  - **Mitigation:** Consume prior sprint outputs read-only; treat regressions as defects.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Cross-module KPI definitions are owned by MOD-017 Analytics; drift between MOD-007 dashboards and MOD-017 catalogue would violate the analytics boundary.
  - **Impact:** Duplicated ownership and traceability loss.
  - **Mitigation:** Consume KPI definitions from MOD-017 without local redefinition; enforce §1.1.2 and §1.3.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** `PayrollProcessed` payload semantics are owned by MOD-008 Payroll and may evolve.
  - **Impact:** Cost-adjacent HR analytics may need to re-bind to updated payload shapes.
  - **Mitigation:** Bind to the authoritative event catalog contract; treat MOD-008 payload evolution as a contract change managed via the event-catalog governance process.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time.
  - **Impact:** Non-Accepted status would invalidate this sprint's contract.
  - **Mitigation:** Re-plan if acceptance status changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** `PayrollProcessed` and the HRMS-published events enumerated by the audit-readiness surface (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`, `AppraisalCompleted`) are declared authoritatively in Module PRD §8 and Sprint Plan §2 / §7. The event-catalog file is a repository stub at authoring time and does not yet enumerate these event names.
  - **Impact:** Publishers and consumers cannot bind until catalog registration occurs.
  - **Mitigation:** Recorded as a **Deferred Repository Risk (Events)** per Wrapper v1.0 event-resolution policy. Register via the event-catalog governance process before implementation begins.
  - **Status:** Deferred

- **Risk ID:** R-EV-02
  - **Description:** MOD-008 Payroll may not yet be implemented at analytics implementation time.
  - **Impact:** Cost-adjacent HR analytics remains dormant until `PayrollProcessed` is emitted.
  - **Mitigation:** Consumption contract is uniform; dormancy is non-blocking for the remainder of the sprint's read-model surface.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

- **Unit** — report and dashboard scoping rules; audit-readiness enumeration rules.
- **Integration** — report rendering via `ENG-021`; dashboard rendering via `ENG-022`; export production via `ENG-027`; `PayrollProcessed` consumption via `ENG-024`; audit emission via `ENG-004`; audit-readiness reads over `ENG-004` records and event streams.
- **Contract** — `PayrollProcessed` payload contract against the authoritative event catalog (once registered); dashboard consumption of MOD-017 KPI definitions.
- **End-to-end (smoke)** — happy paths for each report in §5.1–§5.5, dashboard render, export, and audit-readiness read under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture pre-populated with the outputs of `SPR-MOD-007-001` … `SPR-MOD-007-005` and an event-recorder for `ENG-024` assertions on `PayrollProcessed` ingestion.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance. They MUST NOT introduce new business requirements, ADRs, or engine behavior.*

- Consider a canonical HR read-model projection that materializes joined views over `SPR-MOD-007-001` … `SPR-MOD-007-005` outputs to keep report queries deterministic.
- Consider deterministic export naming and content hashing to make exports reproducible for compliance review.
- Consider a lightweight envelope validator for `PayrollProcessed` so contract regressions are caught locally.
- Keep AI Copilot (`ENG-028`) strictly read-only over the HR read-model projection; do not extend it to state changes in this sprint.

Non-authoritative.

---

## 17. Review Gate

1. **Does the sprint have exactly one objective?** Yes. Deliver HR read-model reports, dashboards, exports, and the audit-readiness surface.
2. **Does every feature trace to a specific Module PRD section?** Yes. §3 and §3.2.
3. **Are engines and ADRs consumed rather than redefined?** Yes. §8 / §9.
4. **Are out-of-scope items enumerated and linked to their owning sprints?** Yes. §1.3.
5. **Are acceptance criteria objective and testable?** Yes. §5 uses Given/When/Then.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?** Yes. §2, §12, §13.
7. **Is this the terminal Stage 2 sprint for MOD-007 HRMS?** Yes. Next pass is Stage 3 baseline consolidation via GT-004 (Pass 9.4.0).

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- Parent Module Sprint Plan — [`./MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md)
- Upstream Sprint PRD (masters) — [`./SPR-MOD-007-001-hrms-foundation-employee-master.md`](./SPR-MOD-007-001-hrms-foundation-employee-master.md)
- Upstream Sprint PRD (lifecycle) — [`./SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md`](./SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md)
- Upstream Sprint PRD (attendance & leave) — [`./SPR-MOD-007-003-attendance-and-leave.md`](./SPR-MOD-007-003-attendance-and-leave.md)
- Upstream Sprint PRD (performance) — [`./SPR-MOD-007-004-performance-and-appraisal.md`](./SPR-MOD-007-004-performance-and-appraisal.md)
- Upstream Sprint PRD (L&D + self-service) — [`./SPR-MOD-007-005-learning-development-and-self-service.md`](./SPR-MOD-007-005-learning-development-and-self-service.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Event Catalog (authoritative) — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
