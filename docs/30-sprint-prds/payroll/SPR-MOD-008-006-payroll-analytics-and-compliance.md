---
title: "SPR-MOD-008-006 — Payroll Analytics & Compliance"
summary: "Sprint PRD for the Payroll Analytics & Compliance slice of MOD-008 Payroll: payroll read model, operational reports (Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home), dashboards, bulk exports, and audit-readiness surface. Read-model only; consumes upstream layers; never redefines them."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-008-006"
parent_module: "MOD-008"
parent_sprint_plan: "MOD-008_SPRINT_PLAN.md"
iteration: "Sprint 6"
stage: "2"
pass: "10.0.6"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-021", "ENG-022", "ENG-024", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "payroll", "mod-008", "analytics", "compliance", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD008-006-20260715T000300Z-001"
parent_result_id: "GT003-MOD008-005-20260715T000200Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-008-006 — Payroll Analytics & Compliance

> **Stage 2 deliverable.** Sixth and final authored Sprint PRD for **MOD-008 Payroll** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-008-006` (permanent) |
| Parent Module | `MOD-008` — Payroll |
| Parent Sprint Plan | [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) |
| Iteration | Sprint 6 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-008-001`](./SPR-MOD-008-001-payroll-foundation-and-salary-structures.md) (Draft), [`SPR-MOD-008-002`](./SPR-MOD-008-002-payroll-cycles-and-runs.md) (Draft), [`SPR-MOD-008-003`](./SPR-MOD-008-003-statutory-computations.md) (Draft), [`SPR-MOD-008-004`](./SPR-MOD-008-004-reimbursements-and-advances.md) (Draft), [`SPR-MOD-008-005`](./SPR-MOD-008-005-payslip-generation-and-disbursement.md) (Draft) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) |
| Downstream Sprints | *(none — final sprint in MOD-008 Stage 2)* |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Payroll read model** and the operational **reports, dashboards, and bulk exports** enumerated in Module PRD §9 (Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home), plus the **audit-readiness surface** that exposes every Payroll domain event emitted during the sprint sequence. Read-model only: this sprint MUST NOT author transactional behavior, MUST NOT redefine any upstream sprint's semantics, and MUST NOT redefine cross-module KPIs owned by MOD-017 Analytics.

> **Payroll Ownership Convention (recapitulated).** The Payroll module owns the read model and operational reports/dashboards for Payroll data. ERP Core Engines provide shared infrastructure (authorization, audit, reporting, dashboard, eventing, export) but **MUST NOT** redefine Payroll semantics. Employee master remains exclusive to **MOD-007 HRMS** and is consumed read-only. Voucher and posting semantics remain exclusive to **MOD-002 Accounting** via `ENG-015`/`ENG-016` and are not re-represented here. Cross-module KPI definitions remain exclusive to **MOD-017 Analytics**.

#### 1.1.1 Read-Model-Only Boundary

- This sprint delivers **read-model** projections over the Payroll data produced by Sprints 001–005. It does not create, mutate, reverse, or finalize any transaction.
- No new master data entity or transaction is introduced. No engine invocation is added for ledger, statutory, or disbursement effects.
- The finalization gate authored in Sprint 3 (Module PRD §7) and the Disbursement File immutability rule authored in Sprint 5 (Module PRD §7) remain in force and are not weakened by this sprint.

#### 1.1.2 Report / Dashboard Delivery Contract

- Reports enumerated in Module PRD §9 are rendered via **`ENG-021` Reporting**.
- Dashboards enumerated in Module PRD §9 are rendered via **`ENG-022` Dashboard**.
- Bulk exports are produced via **`ENG-027` Export**.
- Every read-model access, report render, dashboard render, export, and event replay is authorized via **`ENG-002`** under `ADR-032` and audited via **`ENG-004`** per `ADR-014`.

#### 1.1.3 Audit-Readiness Surface

- The audit-readiness surface exposes every Payroll domain event emitted during the sprint sequence, sourced from **`ENG-024` Eventing** under the authoritative event catalog. It does not redefine event envelopes or delivery guarantees.
- The scope explicitly covers the four Payroll-lifecycle events originating-allocated to Sprint 5 (`PayrollProcessed`, `PayslipIssued`, `PayrollPosted`, `DisbursementInitiated`) plus any additional Payroll domain events emitted by Sprints 001–005.

#### 1.1.4 Cross-Module KPI Boundary

- Cross-module KPI definitions (e.g. workforce cost blended with financial or CRM data) are owned by **MOD-017 Analytics** per Sprint Plan §2. This sprint provides only Payroll-owned operational reports and dashboards; consumption by MOD-017 remains via the authoritative event catalog and read-model exposure, not by embedding cross-module KPI logic here.

### 1.2 In Scope

- **Payroll read model** projected over data produced by Sprints 001–005 (salary structures, payroll runs, statutory computations, reimbursements/advances, payslips, disbursement files, ledger invocations).
- **Operational reports** rendered via `ENG-021`:
  - **Payroll Register** — per (tenant, company, payroll run) view of Payslips, gross, deductions, statutory, and net-pay obligations.
  - **Statutory Reports** — per (tenant, company, locale, period) view of statutory computations produced by Sprint 3.
  - **Reimbursement Summary** — per (tenant, company, period) view of approved Reimbursements and Advances produced by Sprint 4.
  - **CTC vs Take-home** — per (tenant, company, employee, period) reconciliation view.
- **Operational dashboards** rendered via `ENG-022` surfacing Payroll operational KPIs (in-module only; cross-module KPIs remain owned by MOD-017).
- **Bulk exports** of the above reports via `ENG-027` in the standard export format.
- **Audit-readiness surface** exposing every Payroll domain event emitted during the sprint sequence, sourced from `ENG-024` under the authoritative event catalog.
- **Authorization and audit** on every read-model access, render, export, and event replay via `ENG-002` and `ENG-004`.

### 1.3 Out of Scope

- Salary Structure, Component, Bank Mandate master, Payroll operations configuration — `SPR-MOD-008-001`.
- Payroll Run lifecycle, input reconciliation, gross computation, approval routing, reversal — `SPR-MOD-008-002`.
- Statutory Setup, per-locale statutory evaluation, Module PRD §7 finalization gate — `SPR-MOD-008-003`.
- Reimbursement and Advance transaction lifecycles — `SPR-MOD-008-004`.
- Payslip transaction, Disbursement File generation and transport, ledger invocation via `ENG-015`/`ENG-016`, publication of the four Payroll-lifecycle events — `SPR-MOD-008-005`.
- Employee master, attendance, and leave — owned by MOD-007.
- Double-entry posting logic, chart-of-accounts resolution, voucher construction — owned by MOD-002 via `ENG-015`/`ENG-016`.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions and cross-module analytics blending — owned by MOD-017 Analytics.
- Event envelope, naming, and delivery guarantees — owned by the authoritative event catalog and `ENG-024`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-008-006`, the following will exist:

- **Business capabilities.**
  - A Payroll administrator, HR user, Finance user, or Auditor (per §4) can view the Payroll Register, Statutory Reports, Reimbursement Summary, and CTC vs Take-home reports for any (tenant, company, period) scope authorized under `ENG-002`.
  - Payroll operational dashboards render via `ENG-022` for the tenant scope.
  - Any authorized report can be exported in the standard bulk format via `ENG-027`.
  - The audit-readiness surface enumerates every Payroll domain event emitted during the sprint sequence, sourced from `ENG-024` under the authoritative event catalog.
- **Domain events published (per §11.1).** *(None as originating publisher.)* This sprint publishes no new domain events; it consumes and surfaces existing Payroll events for audit readiness.
- **Configuration artifacts.** No new configuration namespace is introduced; this sprint consumes existing Payroll configuration (numbering series, rounding policy) established in Sprint 1 and platform-level report/dashboard configuration surfaced by MOD-001.
- **Audit artifacts.** An audit record exists for every read-model access, report render, dashboard render, export, and event replay, produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-008-006`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-008 MODULE_PRD Section | Delivered By |
| --- | --- |
| §9 Reports & Analytics — Payroll Register | Payroll Register report (§5.1) |
| §9 Reports & Analytics — Statutory Reports | Statutory Reports (§5.2) |
| §9 Reports & Analytics — Reimbursement Summary | Reimbursement Summary report (§5.3) |
| §9 Reports & Analytics — CTC vs Take-home | CTC vs Take-home report (§5.4) |
| §9 Reports & Analytics — Dashboards | Operational dashboards (§5.5) |
| §11 Non-functional — Compliance, audit readiness | Audit-readiness surface (§5.7) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Payroll Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §4.1 does not enumerate a §2 capability originating-allocated to this sprint; per Sprint Plan §4.2, this sprint is the originating allocation for **Payroll Analytics** as a read-model surface anchored by Module PRD §9 and by §11 (Compliance, audit readiness). This allocation is unique: no other Payroll sprint claims Payroll Analytics or the audit-readiness surface as its originating allocation.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §9 (Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home, Dashboards) and §11 (Compliance, audit readiness) → this Sprint PRD → deliverables in §2 (read-model, four operational reports, dashboards, exports, audit-readiness surface).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Payroll administrator, I want to view the Payroll Register for a (tenant, company, payroll run) scope, so that I can review Payslips, gross, deductions, statutory, and net-pay obligations in one operational view.*
- **US-002.** *As a Finance user, I want Statutory Reports for a (tenant, company, locale, period) scope, so that statutory computations produced by Sprint 3 can be inspected for compliance and audit.*
- **US-003.** *As an HR user, I want the Reimbursement Summary for a (tenant, company, period) scope, so that approved Reimbursements and Advances produced by Sprint 4 are visible in aggregate.*
- **US-004.** *As a Payroll administrator, I want the CTC vs Take-home reconciliation for a (tenant, company, employee, period) scope, so that structure vs realized pay is reviewable per employee.*
- **US-005.** *As a Payroll administrator, I want Payroll operational dashboards rendered via `ENG-022`, so that in-module KPIs are visible without cross-module blending.*
- **US-006.** *As any authorized report consumer, I want to export any report in the standard bulk format via `ENG-027`, so that the data can be shared under the tenant's compliance policy.*
- **US-007.** *As an Auditor, I want an audit-readiness surface that enumerates every Payroll domain event emitted during the sprint sequence via `ENG-024`, so that Payroll history is fully reconstructible under the authoritative event catalog.*
- **US-008.** *As any read-model consumer, I want every access, render, export, and event replay authorized via `ENG-002` and audited via `ENG-004`, so that read-side compliance is symmetric with the write-side.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Payroll Register (US-001)

- **Given** a (tenant, company, payroll run) scope where the Payroll Run is finalized and Payslips have been issued per Sprint 5,
  **when** an authorized user requests the Payroll Register,
  **then** the report renders via `ENG-021` with per-employee gross, deductions, statutory, and net-pay obligations sourced from the read model; access is authorized via `ENG-002` and audited via `ENG-004`; the report is exportable via `ENG-027`.
- **Given** a Payroll Run that is not finalized,
  **when** the Payroll Register is requested for it,
  **then** the request is honored under the read-model semantics (in-progress data is labeled as such) or rejected per the tenant's authorization policy; in no case does rendering mutate any upstream transaction.

### 5.2 Statutory Reports (US-002)

- **Given** a (tenant, company, locale, period) scope with statutory computations produced by Sprint 3,
  **when** an authorized user requests the Statutory Reports for that scope,
  **then** the report renders via `ENG-021` sourced from the read model over Sprint 3 outputs; access is authorized via `ENG-002` and audited via `ENG-004`; the report is exportable via `ENG-027`.

### 5.3 Reimbursement Summary (US-003)

- **Given** a (tenant, company, period) scope with approved Reimbursements and Advances produced by Sprint 4,
  **when** an authorized user requests the Reimbursement Summary,
  **then** the report renders via `ENG-021` sourced from the read model over Sprint 4 outputs; access is authorized via `ENG-002` and audited via `ENG-004`; the report is exportable via `ENG-027`.

### 5.4 CTC vs Take-home (US-004)

- **Given** a (tenant, company, employee, period) scope with a Salary Structure (Sprint 1) and issued Payslips (Sprint 5),
  **when** an authorized user requests the CTC vs Take-home reconciliation,
  **then** the report renders via `ENG-021` sourced from the read model; access is authorized via `ENG-002` and audited via `ENG-004`; the report is exportable via `ENG-027`.

### 5.5 Payroll Dashboards (US-005)

- **Given** a tenant scope,
  **when** an authorized user opens the Payroll dashboard surface,
  **then** dashboards render via `ENG-022` sourced from the read model; access is authorized via `ENG-002` and audited via `ENG-004`; no cross-module KPI is embedded (cross-module KPIs remain owned by MOD-017).

### 5.6 Bulk export (US-006)

- **Given** any of the reports in §5.1–§5.4 rendered for an authorized scope,
  **when** export is requested,
  **then** the report is exported in the standard bulk format via `ENG-027` and the export is audited via `ENG-004`.

### 5.7 Audit-readiness surface (US-007)

- **Given** the Payroll domain events emitted by Sprints 001–005 via `ENG-024` under the authoritative event catalog,
  **when** an authorized Auditor queries the audit-readiness surface,
  **then** the surface enumerates every Payroll domain event within the queried scope (including the four Payroll-lifecycle events originating-allocated to Sprint 5) without redefining envelope, naming, or delivery guarantees; the query is authorized via `ENG-002` and audited via `ENG-004`.

### 5.8 Authorization and audit symmetry (US-008)

- **Given** any read-model access, report render, dashboard render, export, or event replay,
  **when** it executes,
  **then** it is authorized via `ENG-002` under `ADR-032` and audit-recorded via `ENG-004` per `ADR-014`.

### 5.9 Read-only invariant (§1.1.1)

- **Given** any operation performed by this sprint,
  **when** it executes,
  **then** no upstream transaction (Payroll Run, Statutory Computation, Reimbursement, Advance, Payslip, Disbursement File, Ledger Invocation Record) is created, mutated, reversed, or finalized; the finalization gate (§7 of the Module PRD) and Disbursement File immutability remain in force.

### 5.10 Isolation invariants (`ADR-011`)

- **Given** any read-model access, report, dashboard, export, or event replay,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read, render, export, or replay can succeed.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-008` — Payroll.
- **Module PRD:** [`docs/20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §9 (Payroll Register; Statutory Reports; Reimbursement Summary; CTC vs Take-home; Dashboards), §11 (Compliance, audit readiness), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-008` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, authorization surface consumed by `ENG-002`, audit review surface consumed by `ENG-004`.
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) — Employee master consumed read-only for report scoping.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-008-001` (Payroll Foundation & Salary Structures) — Salary Structures for CTC reconciliation and numbering series; `SPR-MOD-008-002` (Payroll Cycles & Runs) — finalized Payroll Runs; `SPR-MOD-008-003` (Statutory Computations) — statutory outputs; `SPR-MOD-008-004` (Reimbursements & Advances) — approved reimbursements and advances; `SPR-MOD-008-005` (Payslip Generation & Disbursement) — Payslips, Disbursement Files, and the four Payroll-lifecycle events consumed by the audit-readiness surface.
- **Downstream sprints:** *(none — final sprint in MOD-008 Stage 2.)* Downstream consumption of Payroll data by MOD-017 Analytics remains via the authoritative event catalog and read-model exposure, not by mutation of this sprint.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.0,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Payroll Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every read-model access, report render, dashboard render, export, and event replay per `ADR-032`. |
| `ENG-004` Audit | Records every read-model access, render, export, and event replay per `ADR-014`. |
| `ENG-021` Reporting | Renders Payroll Register, Statutory Reports, Reimbursement Summary, and CTC vs Take-home. |
| `ENG-022` Dashboard | Renders Payroll operational dashboards (in-module only). |
| `ENG-024` Eventing | Sourced by the audit-readiness surface to enumerate Payroll domain events under the authoritative event catalog. |
| `ENG-027` Export | Renders bulk exports of the reports in the standard export format. |

Payroll business semantics (Payslip lifecycle, Disbursement File generation, statutory finalization gate, ledger invocation) remain owned by upstream sprints and are **not** re-authored by this sprint. Cross-module KPI definitions remain owned by MOD-017 Analytics.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every read-model access, report, dashboard, export, and event replay. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for every read-side action. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every read-side action, including audit-readiness queries. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing; this sprint consumes only.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Payroll Read Model Projection | MOD-008 (this sprint) | Read-only projection over Sprints 001–005 outputs used to render reports and dashboards. |
| Payroll Report Render Record | MOD-008 (this sprint, backed by `ENG-021` / `ENG-022` / `ENG-027`) | Audit-visible record of a report/dashboard render or export action. |
| Audit-Readiness Query Record | MOD-008 (this sprint, backed by `ENG-004` / `ENG-024`) | Audit-visible record of an audit-readiness query and the event scope returned. |

### 10.2 Relationships

- The **Payroll Read Model Projection** references upstream master data and transactions (Salary Structures, Payroll Runs, Statutory Setup / Computations, Reimbursements, Advances, Payslips, Disbursement Files, Ledger Invocation Records) read-only; no upstream entity is redefined here.
- A **Payroll Report Render Record** references exactly one report/dashboard/export invocation and the scope (tenant, company, and additional scoping keys per §5.1–§5.6).
- An **Audit-Readiness Query Record** references the scope of the query and the set of Payroll domain events enumerated by the query under the authoritative event catalog contract.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-008` per the Payroll Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Employee** entity is owned by MOD-007 HRMS and consumed read-only.
- The **Payroll Run**, **Statutory Setup / Computation**, **Reimbursement**, **Advance**, **Payslip**, **Disbursement File**, and **Ledger Invocation Record** entities remain owned by earlier MOD-008 sprints and are consumed read-only.
- **Voucher** and **GL Entry** entities remain owned by MOD-002 Accounting via `ENG-015` and `ENG-016` and are not represented as MOD-008 entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

*None as originating publisher.* This sprint publishes no new Payroll domain events. Sprint 5 remains the originating sprint for `PayrollProcessed`, `PayslipIssued`, `PayrollPosted`, and `DisbursementInitiated`.

### 11.2 Consumed

- The four Payroll-lifecycle events originating-allocated to Sprint 5 (`PayrollProcessed`, `PayslipIssued`, `PayrollPosted`, `DisbursementInitiated`) are consumed via `ENG-024` for the audit-readiness surface (§5.7).
- Any additional Payroll domain events emitted by Sprints 001–005 that appear in the authoritative event catalog are consumed by the audit-readiness surface without redefinition. Any event name required by the event catalog contract at execution time that is not present is recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every read-model access, report, dashboard, export, and event replay.
- [ ] Every read-model access, render, export, and event replay produces an audit record via `ENG-004`.
- [ ] Payroll Register, Statutory Reports, Reimbursement Summary, and CTC vs Take-home render via `ENG-021` from data produced by Sprints 001–005.
- [ ] Payroll operational dashboards render via `ENG-022` for the tenant scope; no cross-module KPI is embedded.
- [ ] Bulk exports of the four reports render via `ENG-027` in the standard export format.
- [ ] The audit-readiness surface enumerates every Payroll domain event emitted during the sprint sequence via `ENG-024` under the authoritative event catalog contract.
- [ ] Read-only invariant enforced: no upstream transaction is created, mutated, reversed, or finalized by this sprint.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-008_SPRINT_PLAN.md` §2 (`SPR-MOD-008-006`):

- Reports and dashboards render from data produced by prior sprints.
- Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
- Audit readiness surface exposes every payroll event emitted during the sprint sequence.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 6 depends on Sprints 001–005 for every read-model input (structures, runs, statutory, reimbursements/advances, payslips, disbursement files, ledger invocation records, and the four Payroll-lifecycle events).
  - **Impact:** Any regression in upstream sprints degrades every report, dashboard, export, and the audit-readiness surface.
  - **Mitigation:** Treat any regression as an upstream defect and re-plan; do not restate upstream semantics here.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Cross-module KPI definitions are owned by MOD-017 Analytics. Embedding cross-module KPI logic here would blur the Analytics boundary.
  - **Impact:** Ownership drift; duplicate KPI surfaces across modules.
  - **Mitigation:** Confine this sprint to Payroll-owned operational reports and dashboards; leave cross-module blending to MOD-017 consumers of the read model and event stream.
  - **Status:** Accepted

- **Risk ID:** R-03
  - **Description:** The audit-readiness surface consumes `ENG-024` under the authoritative event catalog; any envelope or delivery-guarantee change must be reconciled through event-catalog governance.
  - **Impact:** Locally redefining event envelopes would violate the FROZEN Wrapper.
  - **Mitigation:** Consume only under the authoritative catalog; defer any envelope change to a governance pass.
  - **Status:** Deferred

- **Risk ID:** R-04
  - **Description:** Read-model timeliness relative to write-side transactions is governed by the authoritative event-delivery and read-model contracts, not by this sprint.
  - **Impact:** Ambiguity about "when does a Payroll Register show a freshly-issued Payslip" is resolved by upstream contracts, not by this sprint.
  - **Mitigation:** Reference (do not redefine) the read-model timeliness contract; treat freshness gaps as consumer-facing UX signals rather than mutations of upstream data.
  - **Status:** Accepted

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Any Payroll domain event required by the event catalog at execution time that is not yet present in the catalog is a catalog-governance gap, not a Sprint-6 defect.
  - **Impact:** Locally patching the event catalog would violate the FROZEN Wrapper.
  - **Mitigation:** Defer catalog additions to a governance pass; keep the audit-readiness surface aligned with whatever events are present under the authoritative contract.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Read-model projection invariants (no upstream mutation; scope constraints); report-shape invariants for the four §9 reports; audit-readiness enumeration invariants (event scope is a subset of the caller's tenant scope).
- **Integration** — `ENG-002` authorization on every read-side action; `ENG-004` audit emission on every render, export, and event replay; `ENG-021` render for the four §9 reports; `ENG-022` dashboard render; `ENG-024` consumption for the audit-readiness surface; `ENG-027` export in the standard bulk format.
- **Contract** — Read-model projection contract over Sprints 001–005 outputs; authoritative event-catalog contract for the four Payroll-lifecycle events consumed by the audit-readiness surface.
- **End-to-end (smoke)** — Finalize Payroll Run (Sprint 2) → statutory completion (Sprint 3) → reimbursement/advance approval (Sprint 4) → issue Payslips and generate Disbursement File (Sprint 5) → render Payroll Register, Statutory Reports, Reimbursement Summary, and CTC vs Take-home (this sprint) → export via `ENG-027` → query the audit-readiness surface for the sprint sequence, under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture spanning the full Sprint 001–005 chain, an event-catalog conformance fixture over the four Payroll-lifecycle events, and an authorization matrix fixture for the personas listed in §4.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Payroll read model as append-only projections keyed by (tenant, company, period) so that Sprint-1–Sprint-5 outputs feed the four §9 reports without cross-report coupling.
- Consider rendering Payroll Register and CTC vs Take-home from the same underlying projection so that reconciliation between per-run and per-period views is a projection query rather than a duplicated computation.
- Consider building the audit-readiness surface as a thin adapter over `ENG-024` so that the surface auto-expands as the authoritative event catalog grows without editing this sprint.
- Consider exposing dashboards as compositions of report cells so that dashboard drift from the four §9 reports is structurally prevented.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-008-006`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Payroll read model, the four §9 operational reports, dashboards, exports, and the audit-readiness surface (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-008 MODULE_PRD §9 or §11 section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Payroll Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation (Sprint 1), cycles & runs (Sprint 2), statutory (Sprint 3), reimbursements/advances (Sprint 4), payslips & disbursement (Sprint 5), HRMS-owned entities, MOD-002-owned posting internals, MOD-001-owned identity, and MOD-017-owned cross-module KPIs — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint begin immediately after this one completes?**
   N/A. `SPR-MOD-008-006` is the final sprint in MOD-008 Stage 2 per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §2. The immediate successor is **Pass 10.1.0 — GT-004 Baseline Consolidation (`MOD008_PAYROLL_BASELINE_v1`)**.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-008-001-payroll-foundation-and-salary-structures.md`](./SPR-MOD-008-001-payroll-foundation-and-salary-structures.md), [`./SPR-MOD-008-002-payroll-cycles-and-runs.md`](./SPR-MOD-008-002-payroll-cycles-and-runs.md), [`./SPR-MOD-008-003-statutory-computations.md`](./SPR-MOD-008-003-statutory-computations.md), [`./SPR-MOD-008-004-reimbursements-and-advances.md`](./SPR-MOD-008-004-reimbursements-and-advances.md), [`./SPR-MOD-008-005-payslip-generation-and-disbursement.md`](./SPR-MOD-008-005-payslip-generation-and-disbursement.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- Authoritative Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
