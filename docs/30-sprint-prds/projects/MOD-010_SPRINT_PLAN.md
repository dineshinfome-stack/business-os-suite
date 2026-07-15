---
title: "MOD-010 Projects — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-010 Projects. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Delivery"
status: "Approved"
updated: "2026-07-15"
module_id: "MOD-010"
module_name: "Projects"
sprint_prefix: "SPR-MOD-010-"
stage: "1"
pass: "12.0.0"
parent_module_prd: "docs/20-module-prds/projects/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
governance_specification: "v1.0"
template_standard: "v1.3"
authored_by_template: "GT-002"
execution_id: "GT002-MOD010-20260715T001500Z-001"
tags: ["sprint", "planning", "projects", "mod-010", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-010 Projects — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-010 Projects** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## Normative Source Precedence

On any conflict, the following order wins:

1. `docs/20-module-prds/projects/MODULE_PRD.md` (Module PRD)
2. This Capability Allocation Matrix (§4)
3. The sprint sections in §2 of this Sprint Plan
4. Any derived artifact

## 1. Purpose & Scope

Plan the implementation of MOD-010 Projects by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD.

This plan introduces no new business requirements beyond the approved [MOD-010 Projects Module PRD](../../20-module-prds/projects/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Governance Boundaries (recapitulated).** Per the Module PRD §13:

- **Identity, authentication, and permissions** are owned by **MOD-001 Platform Administration** via `ENG-001`, `ENG-002`, `ENG-003`.
- **Employee master and HR-originating obligations** are owned by **MOD-007 HRMS**; Projects consumes employee identity read-only for resourcing and timesheet capture.
- **Financial postings** for project invoices and cost accruals are owned by **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. No sprint below writes journal entries directly.
- **Payroll-originating cost flows** are owned by **MOD-008 Payroll**; Projects consumes payroll cost signals for project-cost roll-up.
- **Cross-module KPI definitions** are owned by **MOD-017 Analytics**. Operational project reports are surfaced within MOD-010.

**Traceability:**

- Parent Module README — [`../../20-module-prds/projects/README.md`](../../20-module-prds/projects/README.md)
- Parent Module PRD — [`../../20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md)
- Upstream module baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-010 in `SPRINT_ROADMAP.md` is **5**; this plan aligns to **5**.

## 2. Proposed Sprint Sequence

### SPR-MOD-010-001 — Projects Foundation (Project & Resource Setup)

- **Objective.** Establish Projects foundations under a tenant/company: Project, Resource, and Rate Card master data, along with project configuration (rate cards, approval hierarchy, billing type per project, numbering series).
- **Boundaries.**
  - In: Project master, Resource master, Rate Card master; project configuration (rate cards, approval hierarchy, billing types, numbering series); resource planning master data.
  - Out: tasks & milestones (SPR-MOD-010-002), timesheets (SPR-MOD-010-003), budgets & billing (SPR-MOD-010-004), analytics (SPR-MOD-010-005); identity/permissions (owned by MOD-001); ledger posting (owned by MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Project setup and structure; Resource planning; submodules Projects, Resources), §3 Personas, §5 Master Data (Project, Resource, Rate Card), §10 Configuration (Rate cards, Approval hierarchy, Billing types per project, Numbering series).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-007` Document, `ENG-008` Attachment, `ENG-012` Rules, `ENG-017` Numbering, `ENG-024` Event.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (Projects sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` and `MOD007_HRMS_BASELINE_v1`.
- **Sprint Exit Criteria.**
  - Project, Resource, and Rate Card records can be created, edited, and archived under a tenant/company.
  - Project configuration (rate cards, approval hierarchy, billing type, numbering series) resolves deterministically through `ENG-005`.
  - Document numbers issue through `ENG-017`.
  - All structural changes are audited via `ENG-004`.

### SPR-MOD-010-002 — Tasks, Milestones & Change Requests

- **Objective.** Deliver the Setup-to-execution and Change Request processes: Task and Milestone tracking, Milestone Completion transaction lifecycle, and Change Request handling.
- **Boundaries.**
  - In: Task master, Milestone master, Milestone Completion transaction, Change Request transaction.
  - Out: timesheets (SPR-MOD-010-003); budgets & billing (SPR-MOD-010-004); analytics (SPR-MOD-010-005); ledger posting (MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Task and milestone tracking; submodules Tasks), §4 Business Processes (Setup-to-execution, Change request), §5 Master Data (Task, Milestone), §6 Transactions (Milestone Completion, Change Request), §7 Business Rules ("A milestone can be invoiced only after it is marked completed and approved"), §8 Integration Points (`ProjectCreated`, `MilestoneCompleted` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-010-001`.
- **Sprint Exit Criteria.**
  - Tasks and Milestones can be created, tracked, and completed against a Project.
  - Change Requests follow their approval workflow via `ENG-011`.
  - The milestone-invoiceable rule is enforced via `ENG-012`.
  - `ProjectCreated` and `MilestoneCompleted` events are published via `ENG-024`.

### SPR-MOD-010-003 — Timesheets & Effort

- **Objective.** Deliver the Timesheet-to-approval process: Timesheet transaction lifecycle, effort capture, and multi-step approval, including the capacity-justification rule.
- **Boundaries.**
  - In: Timesheet transaction lifecycle, effort capture, approval workflow, capacity-justification rule enforcement.
  - Out: budgets & billing (SPR-MOD-010-004); analytics (SPR-MOD-010-005); ledger posting (MOD-002); payroll disbursement (MOD-008).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Timesheets and effort; submodule Timesheets), §4 Business Processes (Timesheet-to-approval), §6 Transactions (Timesheet), §7 Business Rules ("Timesheets exceeding capacity require justification and approval"), §8 Integration Points (`TimesheetApproved` — published; `EmployeeHired`, `PayrollProcessed` — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-014` Scheduler, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-010-001`.
- **Sprint Exit Criteria.**
  - Timesheets can be captured, submitted, approved, and rejected against Projects and Tasks.
  - The capacity-justification rule is enforced via `ENG-012`.
  - `TimesheetApproved` events are published via `ENG-024`; `EmployeeHired` and `PayrollProcessed` events are consumed.

### SPR-MOD-010-004 — Budgets, Costs & Project Billing

- **Objective.** Deliver the Milestone-to-invoice process: project budgets and cost roll-up, T&M and fixed-price billing, and the Project Invoice transaction lifecycle. Ledger postings remain owned by MOD-002.
- **Boundaries.**
  - In: Project budgets, project-cost roll-up, T&M billing, fixed-price billing, Project Invoice transaction lifecycle.
  - Out: analytics (SPR-MOD-010-005); ledger posting (MOD-002); tax computation and compliance (MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Project budgets and costs; Project billing (T&M and fixed-price); submodules Budgets, Billing), §4 Business Processes (Milestone-to-invoice), §6 Transactions (Project Invoice), §7 Business Rules ("Fixed-price billing is decoupled from timesheet totals"), §8 Integration Points (`ProjectInvoiceIssued` — published; `SalesOrderConfirmed` — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-007` Document, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-015` Voucher, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-010-002`, `SPR-MOD-010-003`.
- **Sprint Exit Criteria.**
  - Project budgets can be defined and costs can be rolled up against a Project.
  - T&M invoices and fixed-price invoices can be issued via `ENG-015` Voucher (posting effects owned by MOD-002).
  - The fixed-price-vs-timesheet decoupling rule is enforced via `ENG-012`.
  - `ProjectInvoiceIssued` events are published via `ENG-024`; `SalesOrderConfirmed` events are consumed.

### SPR-MOD-010-005 — Projects Analytics & Compliance

- **Objective.** Deliver Projects reports (Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis), dashboards, exports, and audit readiness. Read-model only.
- **Boundaries.**
  - In: Projects read model, operational reports and dashboards, KPI surfacing, audit readiness, exports.
  - Out: cross-module KPI definitions (owned by MOD-017 Analytics); transactional functionality of earlier sprints.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (all analytics-facing capabilities as read model), §9 Reports & Analytics (Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis), §11 Non-functional (Audit readiness).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-024` Event, `ENG-025` Notification, `ENG-026` Import, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-010-001` … `SPR-MOD-010-004`.
- **Sprint Exit Criteria.**
  - Reports and dashboards render from data produced by prior sprints and consumed cross-module events.
  - Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
  - Audit readiness surface exposes every Projects event emitted during the sprint sequence.

### Planning Flexibility

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-010-001 (Foundation: Project & Resource Setup)
         │
         ├──────────────────────────────┐
         ▼                              ▼
SPR-MOD-010-002               SPR-MOD-010-003
(Tasks, Milestones & CRs)     (Timesheets & Effort)
         │                              │
         └──────────────┬───────────────┘
                        ▼
              SPR-MOD-010-004 (Budgets, Costs & Billing)
                        │
                        ▼
              SPR-MOD-010-005 (Projects Analytics & Compliance)
                        ▲
                        │
                consumes output from 001 … 004
```

Sprints 002 and 003 depend directly on 001 (Foundation). Sprint 004 depends on both 002 and 003. Sprint 005 consumes output from all four predecessors.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-010 Projects Module PRD](../../20-module-prds/projects/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint.

### 4.1 Capability Allocation Matrix (Forward Map)

| # | Module PRD Capability (§2) | Origin Sprint | PRD Section | Exact Quote | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Project setup and structure | SPR-MOD-010-001 | §2 | "Project setup and structure" | PASS |
| 2 | Task and milestone tracking | SPR-MOD-010-002 | §2 | "Task and milestone tracking" | PASS |
| 3 | Timesheets and effort | SPR-MOD-010-003 | §2 | "Timesheets and effort" | PASS |
| 4 | Project budgets and costs | SPR-MOD-010-004 | §2 | "Project budgets and costs" | PASS |
| 5 | Project billing (T&M and fixed-price) | SPR-MOD-010-004 | §2 | "Project billing (T&M and fixed-price)" | PASS |
| 6 | Resource planning | SPR-MOD-010-001 | §2 | "Resource planning" | PASS |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Projects | SPR-MOD-010-001 |
| Resources | SPR-MOD-010-001 |
| Tasks | SPR-MOD-010-002 |
| Timesheets | SPR-MOD-010-003 |
| Budgets | SPR-MOD-010-004 |
| Billing | SPR-MOD-010-004 |

> Projects Analytics is a read-model surface originating-allocated to `SPR-MOD-010-005` per §9.

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Project | Master Data (§5) | SPR-MOD-010-001 |
| Resource | Master Data (§5) | SPR-MOD-010-001 |
| Rate Card | Master Data (§5) | SPR-MOD-010-001 |
| Task | Master Data (§5) | SPR-MOD-010-002 |
| Milestone | Master Data (§5) | SPR-MOD-010-002 |
| Milestone Completion | Transaction (§6) | SPR-MOD-010-002 |
| Change Request | Transaction (§6) | SPR-MOD-010-002 |
| Timesheet | Transaction (§6) | SPR-MOD-010-003 |
| Project Invoice | Transaction (§6) | SPR-MOD-010-004 |

### 4.4 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-010-001 | §1, §2 (Project setup and structure; Resource planning; submodules Projects, Resources), §3 (personas), §5 (Project, Resource, Rate Card), §10 (Rate cards, Approval hierarchy, Billing types per project, Numbering series) |
| SPR-MOD-010-002 | §2 (Task and milestone tracking; submodule Tasks), §4 (Setup-to-execution, Change request), §5 (Task, Milestone), §6 (Milestone Completion, Change Request), §7 (milestone-invoiceable rule), §8 (`ProjectCreated`, `MilestoneCompleted` — published) |
| SPR-MOD-010-003 | §2 (Timesheets and effort; submodule Timesheets), §4 (Timesheet-to-approval), §6 (Timesheet), §7 (capacity-justification rule), §8 (`TimesheetApproved` — published; `EmployeeHired`, `PayrollProcessed` — consumed) |
| SPR-MOD-010-004 | §2 (Project budgets and costs; Project billing (T&M and fixed-price); submodules Budgets, Billing), §4 (Milestone-to-invoice), §6 (Project Invoice), §7 (fixed-price decoupling rule), §8 (`ProjectInvoiceIssued` — published; `SalesOrderConfirmed` — consumed) |
| SPR-MOD-010-005 | §9 (Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis), §11 (Audit readiness) |

No Module PRD capability, submodule, master-data entity, or transaction sits outside the five sprints above. No capability appears as the originating allocation in more than one sprint. Every capability appears in exactly one originating sprint and in at least one sprint.

## 5. Engine Consumption Map

Derived from Projects Module PRD §12. No engine behavior is redefined. Engine identifiers resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md`.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-008 | ENG-010 | ENG-011 | ENG-012 | ENG-014 | ENG-015 | ENG-017 | ENG-018 | ENG-021 | ENG-022 | ENG-023 | ENG-024 | ENG-025 | ENG-026 | ENG-027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-010-001 | ● | ● | ● | ● | ● | ● | ● | ● |   |   | ● |   |   | ● |   |   |   |   | ● |   |   |   |
| SPR-MOD-010-002 |   | ● |   | ● | ● |   | ● | ● | ● | ● | ● |   |   |   |   |   |   |   | ● | ● |   |   |
| SPR-MOD-010-003 |   | ● |   | ● |   |   |   |   | ● | ● | ● | ● |   |   |   |   |   |   | ● | ● |   |   |
| SPR-MOD-010-004 |   | ● |   | ● | ● |   | ● |   | ● | ● | ● |   | ● | ● | ● |   |   |   | ● | ● |   |   |
| SPR-MOD-010-005 |   | ● |   | ● |   |   |   |   |   |   |   |   |   |   |   | ● | ● |   | ● | ● | ● | ● |

`ENG-016` Posting is **not** consumed by any Projects sprint — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by `ProjectInvoiceIssued`. `ENG-013` Automation is not required by any Projects sprint and is not declared.

## 6. ADR Consumption Map

Accepted ADRs only, per Projects Module PRD (`ADR-011`, `ADR-032`).

| Sprint | ADR-011 | ADR-032 |
| --- | :-: | :-: |
| SPR-MOD-010-001 | ● | ● |
| SPR-MOD-010-002 | ● | ● |
| SPR-MOD-010-003 | ● | ● |
| SPR-MOD-010-004 | ● | ● |
| SPR-MOD-010-005 | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Platform Dependency.** MOD-010 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Tenant, company, branch, and user master are consumed read-only from MOD-001.
>
> **HRMS Dependency.** MOD-010 assumes `MOD007_HRMS_BASELINE_v1` is frozen. Employee master is consumed read-only from **MOD-007 HRMS** for resourcing and timesheet capture.
>
> **Accounting Boundary.** All ledger effects of project invoices and cost accruals are owned by **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting. MOD-010 emits `ProjectInvoiceIssued` and lets Accounting produce the ledger effect through its own posting-rule bindings.
>
> **Payroll Boundary.** Payroll-originating cost signals are owned by **MOD-008 Payroll**; MOD-010 consumes `PayrollProcessed` for project-cost roll-up.
>
> **Analytics Boundary.** Cross-module KPI definitions are owned by **MOD-017 Analytics**. MOD-010 surfaces its own operational reports (§9) but consumes cross-module KPI definitions from MOD-017.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Project / Resource / Rate Card Master | SPR-MOD-010-001 | 002, 003, 004, 005 | Foundational; every later sprint assumes this master data. |
| Project Configuration (rate cards, approval hierarchy, billing type, numbering series) | SPR-MOD-010-001 | 002, 003, 004 | Resolved via `ENG-005`. |
| Task / Milestone Master | SPR-MOD-010-002 | 003, 004, 005 | Timesheets are captured against tasks; billing references milestones. |
| Change Request | SPR-MOD-010-002 | 004, 005 | Change requests may re-baseline budgets and billing. |
| Timesheet | SPR-MOD-010-003 | 004, 005 | Timesheets feed T&M billing and cost roll-up. |
| Project Budget / Project Invoice | SPR-MOD-010-004 | 005 | Feeds P&L, overrun analysis, and burn-down analytics. |
| Tenant / Company / Branch / User Master | External (MOD-001) | 001–005 | Consumed via read-only APIs; never redefined. |
| Employee Master | External (MOD-007) | 001, 003 | Consumed via read-only APIs; owned by MOD-007. |
| `EmployeeHired` (consumed event) | External (MOD-007 HRMS) | SPR-MOD-010-003 | Triggers resource-availability update. |
| `PayrollProcessed` (consumed event) | External (MOD-008 Payroll) | SPR-MOD-010-003 | Feeds project-cost roll-up. |
| `SalesOrderConfirmed` (consumed event) | External (MOD-003 Sales) | SPR-MOD-010-004 | Triggers project-invoice preparation for delivery-linked engagements. |
| `ProjectCreated` event | SPR-MOD-010-002 | MOD-002, MOD-017 | Notifies accounting and analytics. |
| `MilestoneCompleted` event | SPR-MOD-010-002 | MOD-002, MOD-017 | Feeds milestone-based billing and analytics. |
| `TimesheetApproved` event | SPR-MOD-010-003 | MOD-002, MOD-008, MOD-017 | Feeds cost recognition, payroll, and analytics. |
| `ProjectInvoiceIssued` event | SPR-MOD-010-004 | MOD-002, MOD-017 | Feeds ledger posting and analytics. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-010 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Any regression against that baseline blocks Stage 2 authoring.
- **R2 — HRMS baseline dependency.** MOD-010 assumes `MOD007_HRMS_BASELINE_v1` is frozen. Employee master is consumed read-only; MOD-010 MUST NOT redefine employee identity.
- **R3 — Accounting boundary.** All ledger effects remain owned by MOD-002. MOD-010 uses `ENG-015` Voucher for invoice issuance but MUST NOT invoke `ENG-016` Posting directly; posting occurs through MOD-002 rule bindings triggered by emitted events.
- **R4 — Identity boundary.** Identity and permissions remain owned by MOD-001. MOD-010 consumes identity read-only.
- **R5 — Payroll boundary.** Payroll-originating cost signals remain owned by MOD-008. MOD-010 consumes `PayrollProcessed` read-only for cost roll-up and never posts payroll.
- **R6 — Analytics boundary.** Cross-module KPI definitions remain owned by MOD-017. Operational project reports are surfaced within MOD-010.
- **R7 — Optional-engine scope creep.** Optional engines (`ENG-023`, `ENG-026`, `ENG-027`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R8 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md`, no horizontal-only sprints are required for MOD-010; all sprints are vertical slices.
- **R9 — Future-enhancement scope.** Portfolio management, AI resource matching, and predictive overrun alerts are deferred to Module PRD §14 Future Enhancements and are NOT allocated to any sprint in this plan.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-010 is baseline-ready when all of the following are objectively true:

1. Every reserved Projects Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD010_PROJECTS_BASELINE_v1` is authored under `docs/40-module-baselines/`.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no Projects capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md` beyond additive registration.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`../../15-governance/templates/GT-002_STAGE1_AUTHORING.md`](../../15-governance/templates/GT-002_STAGE1_AUTHORING.md)
