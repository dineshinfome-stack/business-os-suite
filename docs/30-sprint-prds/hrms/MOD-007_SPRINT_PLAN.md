---
title: "MOD-007 HRMS — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-007 HRMS. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "People"
status: "Approved"
updated: "2026-07-13"
module_id: "MOD-007"
module_name: "HRMS"
sprint_prefix: "SPR-MOD-007-"
stage: "1"
pass: "9.0.0"
parent_module_prd: "docs/20-module-prds/hrms/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
governance_specification: "v1.0"
template_standard: "v1.3"
authored_by_template: "GT-002"
execution_id: "GT002-MOD007-20260713-001"
tags: ["sprint", "planning", "hrms", "mod-007", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-007 HRMS — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-007 HRMS** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## Normative Source Precedence

On any conflict, the following order wins:

1. `docs/20-module-prds/hrms/MODULE_PRD.md` (Module PRD)
2. This Capability Allocation Matrix (§4)
3. The sprint sections in §2 of this Sprint Plan
4. Any derived artifact

## 1. Purpose & Scope

Plan the implementation of MOD-007 HRMS by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD.

This plan introduces no new business requirements beyond the approved [MOD-007 HRMS Module PRD](../../20-module-prds/hrms/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Governance Boundaries (recapitulated).** Per the Module PRD §2:

- **Payroll processing** (earnings, deductions, pay runs, statutory filings, payslip issuance) is owned by **MOD-008 Payroll**. HRMS supplies employee master, org assignments, attendance/leave signals, and lifecycle events only.
- **Financial postings** for HR-originating obligations are owned by **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. No sprint below writes journal entries.
- **Identity, authentication, and permissions** remain owned by **MOD-001 Platform Administration** via `ENG-001`, `ENG-002`, `ENG-003`.

**Traceability:**

- Parent Module README — [`../../20-module-prds/hrms/README.md`](../../20-module-prds/hrms/README.md)
- Parent Module PRD — [`../../20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- Upstream module baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-007 is reconciled to **6** by this plan (upward from the 5 recorded in `SPRINT_ROADMAP.md`, absorbing HR Analytics & Compliance as a dedicated sprint).

## 2. Proposed Sprint Sequence

### SPR-MOD-007-001 — HRMS Foundation & Employee Master

- **Objective.** Establish HRMS foundations under a tenant/company: Employee master, org structure master (Position, Department, Grade, Shift), and HR operations configuration (approval hierarchies, shift patterns, notice periods).
- **Boundaries.**
  - In: Employee master, Position, Department, Grade, Shift master; HR operations configuration; org assignment.
  - Out: onboarding/exit transactions, attendance, leave, performance, L&D, self-service, analytics; payroll (owned by MOD-008); identity/permissions (owned by MOD-001); ledger posting (owned by MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Employee master and org structure; submodule Employee Master), §3 Personas, §5 Master Data (Employee, Position, Department, Grade, Shift), §10 Configuration (Shift patterns, Approval hierarchies, Notice periods).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-007` Document, `ENG-008` Attachment, `ENG-012` Rules, `ENG-024` Event.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (HRMS sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1`.
- **Sprint Exit Criteria.**
  - Employee, Position, Department, Grade, and Shift records can be created, edited, and archived under a tenant/company.
  - HR operations configuration (approval hierarchies, shift patterns, notice periods) resolves deterministically through `ENG-005`.
  - Identity linkage to Employee records is consumed read-only from `ENG-001` — no credentials are minted.
  - All structural changes are audited via `ENG-004`.

### SPR-MOD-007-002 — Employment Lifecycle (Hire & Exit)

- **Objective.** Deliver the Hire-to-onboard and Exit business processes: Onboarding Task and Exit Clearance transactions, and their approvals.
- **Boundaries.**
  - In: Onboarding Task transaction lifecycle, Exit Clearance transaction lifecycle, approvals routing, HR letters and attachments.
  - Out: attendance, leave, performance, L&D, analytics; final settlement posting (owned by MOD-002); payroll effects (owned by MOD-008).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Onboarding and offboarding), §4 Business Processes (Hire-to-onboard, Exit), §6 Transactions (Onboarding Task, Exit Clearance), §8 Integration Points (`EmployeeHired`, `EmployeeExited` — published; Background verification — external).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-013` Automation, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-007-001`.
- **Sprint Exit Criteria.**
  - Onboarding Task and Exit Clearance transactions can be created, routed through approvals, and completed.
  - `EmployeeHired` and `EmployeeExited` events are published via `ENG-024`.
  - Background verification integrations are invoked via `ENG-023`; results are attached via `ENG-008`.

### SPR-MOD-007-003 — Attendance & Leave

- **Objective.** Deliver the Timesheet-to-attendance and Leave request-to-approval processes: Leave Type master, Attendance transaction, Leave Request transaction, leave balances, and biometric ingestion.
- **Boundaries.**
  - In: Leave Type master lifecycle, Attendance transaction lifecycle, Leave Request transaction lifecycle, leave balance computation, biometric device ingestion via `ENG-023`.
  - Out: payroll processing (owned by MOD-008); leave encashment settlement posting (owned by MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Attendance and leave; submodules Attendance, Leave), §4 Business Processes (Timesheet-to-attendance, Leave request-to-approval), §5 Master Data (Leave Type), §6 Transactions (Attendance, Leave Request), §7 Business Rules (Leave balance cannot go negative unless the leave type permits it; An employee cannot approve their own leave), §8 Integration Points (`AttendanceMarked`, `LeaveApproved` — published; Biometric — external), §10 Configuration (Leave policies).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-013` Automation, `ENG-014` Scheduler, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-007-001`.
- **Sprint Exit Criteria.**
  - Attendance can be captured (manual and via biometric ingestion) and Leave Requests can be raised, approved, and reflected in leave balances.
  - Leave balance rule and self-approval rule are enforced via `ENG-012`.
  - `AttendanceMarked` and `LeaveApproved` events are published via `ENG-024`.

### SPR-MOD-007-004 — Performance & Appraisal

- **Objective.** Deliver the Appraisal cycle process: Appraisal transaction lifecycle, appraiser routing, ratings capture, and appraisal completion.
- **Boundaries.**
  - In: Appraisal transaction lifecycle, appraisal approval routing, ratings capture.
  - Out: compensation revision (owned by MOD-008 Payroll); analytics (owned by SPR-MOD-007-006).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Performance and appraisal; submodule Performance), §4 Business Processes (Appraisal cycle), §6 Transactions (Appraisal), §8 Integration Points (`AppraisalCompleted` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-007-001`.
- **Sprint Exit Criteria.**
  - Appraisal transactions can be initiated, routed through appraisers, and completed.
  - Appraisal self-approval is prevented via `ENG-012`.
  - `AppraisalCompleted` events are published via `ENG-024`.

### SPR-MOD-007-005 — Learning & Development and Self-Service

- **Objective.** Deliver Learning & Development integration and Employee Self-Service surfaces. Consumes `TrainingCompleted` events from external learning platforms and exposes employee-facing HR surfaces.
- **Boundaries.**
  - In: L&D consumption (records training completion against the employee master), self-service surfaces (profile, leave request initiation, attendance view, document access).
  - Out: authoring or hosting learning content (external platforms); authoring identity/permissions (owned by MOD-001).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Learning and development; Employee self-service; submodules L&D, Self-Service), §8 Integration Points (`TrainingCompleted` — consumed; Learning platforms — external).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-013` Automation, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-007-001`, `SPR-MOD-007-003` (self-service consumes attendance/leave surfaces).
- **Sprint Exit Criteria.**
  - `TrainingCompleted` events are consumed and recorded against the employee master.
  - Self-service surfaces render employee profile, leave request initiation, attendance summary, and HR documents scoped to the acting employee.

### SPR-MOD-007-006 — HR Analytics & Compliance

- **Objective.** Deliver HR reports (Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution), dashboards, exports, and audit readiness. Consumes `PayrollProcessed` (MOD-008) for cost-adjacent analytics. Read-model only.
- **Boundaries.**
  - In: HR read model, operational reports and dashboards, KPI surfacing, audit readiness, exports.
  - Out: cross-module KPI definitions (owned by MOD-017 Analytics); payroll analytics (owned by MOD-008); transactional functionality of earlier sprints.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (all analytics-facing capabilities as read model), §9 Reports & Analytics (Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution), §11 Non-functional (Audit readiness), §8 Integration Points (`PayrollProcessed` — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-020` Search, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-024` Event, `ENG-025` Notification, `ENG-027` Export, `ENG-028` AI Copilot.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-007-001` … `SPR-MOD-007-005` (consumes data and events produced by all prior sprints).
- **Sprint Exit Criteria.**
  - Reports and dashboards render from data produced by prior sprints and consumed cross-module events.
  - Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
  - Audit readiness surface exposes every HRMS event emitted during the sprint sequence.

### Planning Flexibility

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-007-001 (Foundation & Employee Master)
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
SPR-MOD-007-002   SPR-MOD-007-003   SPR-MOD-007-004   (…)
(Employment       (Attendance       (Performance
 Lifecycle)        & Leave)          & Appraisal)
                        │
                        ▼
                  SPR-MOD-007-005 (L&D + Self-Service)
                        │
                        └────► SPR-MOD-007-006 (HR Analytics & Compliance)
                                        ▲
                                        │
         ┌──────────────────────────────┴──────────────────────────┐
   SPR-MOD-007-002   SPR-MOD-007-003   SPR-MOD-007-004
```

Sprints 002, 003, and 004 depend directly on 001 (Foundation). Sprint 005 depends on 001 and 003 (self-service consumes attendance/leave surfaces). Sprint 006 consumes output from all five predecessors.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-007 HRMS Module PRD](../../20-module-prds/hrms/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint.

### 4.1 Capability Allocation Matrix (Forward Map)

| # | Module PRD Capability (§2) | Origin Sprint | PRD Section | Exact Quote | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Employee master and org structure | SPR-MOD-007-001 | §2 | "Employee master and org structure" | PASS |
| 2 | Onboarding and offboarding | SPR-MOD-007-002 | §2 | "Onboarding and offboarding" | PASS |
| 3 | Attendance and leave | SPR-MOD-007-003 | §2 | "Attendance and leave" | PASS |
| 4 | Performance and appraisal | SPR-MOD-007-004 | §2 | "Performance and appraisal" | PASS |
| 5 | Learning and development | SPR-MOD-007-005 | §2 | "Learning and development" | PASS |
| 6 | Employee self-service | SPR-MOD-007-005 | §2 | "Employee self-service" | PASS |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Employee Master | SPR-MOD-007-001 |
| Attendance | SPR-MOD-007-003 |
| Leave | SPR-MOD-007-003 |
| Performance | SPR-MOD-007-004 |
| L&D | SPR-MOD-007-005 |
| Self-Service | SPR-MOD-007-005 |

> The Employment Lifecycle (Onboarding/Exit) has no dedicated submodule in the Module PRD §2 submodule list; it is originating-allocated to `SPR-MOD-007-002` via §2 capability ("Onboarding and offboarding") and §6 transactions. HR Analytics is a read-model surface originating-allocated to `SPR-MOD-007-006` per §9.

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Employee | Master Data (§5) | SPR-MOD-007-001 |
| Position | Master Data (§5) | SPR-MOD-007-001 |
| Department | Master Data (§5) | SPR-MOD-007-001 |
| Grade | Master Data (§5) | SPR-MOD-007-001 |
| Shift | Master Data (§5) | SPR-MOD-007-001 |
| Leave Type | Master Data (§5) | SPR-MOD-007-003 |
| Attendance | Transaction (§6) | SPR-MOD-007-003 |
| Leave Request | Transaction (§6) | SPR-MOD-007-003 |
| Appraisal | Transaction (§6) | SPR-MOD-007-004 |
| Onboarding Task | Transaction (§6) | SPR-MOD-007-002 |
| Exit Clearance | Transaction (§6) | SPR-MOD-007-002 |

### 4.4 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-007-001 | §1, §2 (Employee master and org structure; submodule Employee Master), §3 (personas), §5 (Employee, Position, Department, Grade, Shift), §10 (Shift patterns, Approval hierarchies, Notice periods) |
| SPR-MOD-007-002 | §2 (Onboarding and offboarding), §4 (Hire-to-onboard, Exit), §6 (Onboarding Task, Exit Clearance), §8 (`EmployeeHired`, `EmployeeExited` — published; Background verification — external) |
| SPR-MOD-007-003 | §2 (Attendance and leave; submodules Attendance, Leave), §4 (Timesheet-to-attendance, Leave request-to-approval), §5 (Leave Type), §6 (Attendance, Leave Request), §7 (leave-balance rule; self-approval rule), §8 (`AttendanceMarked`, `LeaveApproved` — published; Biometric — external), §10 (Leave policies) |
| SPR-MOD-007-004 | §2 (Performance and appraisal; submodule Performance), §4 (Appraisal cycle), §6 (Appraisal), §8 (`AppraisalCompleted` — published) |
| SPR-MOD-007-005 | §2 (Learning and development; Employee self-service; submodules L&D, Self-Service), §8 (`TrainingCompleted` — consumed; Learning platforms — external) |
| SPR-MOD-007-006 | §9 (Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution), §11 (Audit readiness), §8 (`PayrollProcessed` — consumed) |

No Module PRD capability, submodule, master-data entity, or transaction sits outside the six sprints above. No capability appears as the originating allocation in more than one sprint. Every capability appears in exactly one originating sprint and in at least one sprint.

## 5. Engine Consumption Map

Derived from HRMS Module PRD §12. No engine behavior is redefined. Engine identifiers resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md`.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-008 | ENG-010 | ENG-011 | ENG-012 | ENG-013 | ENG-014 | ENG-020 | ENG-021 | ENG-022 | ENG-023 | ENG-024 | ENG-025 | ENG-027 | ENG-028 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-007-001 | ● | ● | ● | ● | ● | ● | ● | ● |   |   | ● |   |   |   |   |   |   | ● |   |   |   |
| SPR-MOD-007-002 |   | ● |   | ● |   |   | ● | ● | ● | ● | ● | ● |   |   |   |   | ● | ● | ● |   |   |
| SPR-MOD-007-003 |   | ● |   | ● | ● |   |   |   | ● | ● | ● | ● | ● |   |   |   | ● | ● | ● |   |   |
| SPR-MOD-007-004 |   | ● |   | ● |   |   |   |   | ● | ● | ● |   |   |   |   |   |   | ● | ● |   |   |
| SPR-MOD-007-005 |   | ● |   | ● |   |   | ● | ● |   |   |   | ● |   |   |   |   | ● | ● | ● |   |   |
| SPR-MOD-007-006 |   | ● |   | ● |   |   |   |   |   |   |   |   |   | ● | ● | ● |   | ● | ● | ● | ● |

Optional engine `ENG-026` Import MAY be consumed during Stage 2 authoring for master data seeding (employees, org structure); it is not tabulated as required consumption in this plan. `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any HRMS sprint — all ledger effects are produced by MOD-002 Accounting per the governance boundary.

## 6. ADR Consumption Map

Accepted ADRs only, per HRMS Module PRD (`ADR-011`, `ADR-014`, `ADR-032`).

| Sprint | ADR-011 | ADR-014 | ADR-032 |
| --- | :-: | :-: | :-: |
| SPR-MOD-007-001 | ● | ● | ● |
| SPR-MOD-007-002 | ● | ● | ● |
| SPR-MOD-007-003 | ● | ● | ● |
| SPR-MOD-007-004 | ● | ● | ● |
| SPR-MOD-007-005 | ● | ● | ● |
| SPR-MOD-007-006 | ● | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Platform Dependency.** MOD-007 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Tenant, company, branch, and user master are consumed read-only from MOD-001.
>
> **Payroll Boundary.** MOD-007 emits employee master, attendance, and leave signals consumed by **MOD-008 Payroll**. Pay computation, statutory filings, and payslip issuance remain owned by MOD-008. MOD-007 consumes `PayrollProcessed` only for HR analytics.
>
> **Accounting Boundary.** All ledger effects of HR-originating obligations (leave encashment, exit settlement) are owned by **MOD-002 Accounting** via `ENG-015` and `ENG-016`. MOD-007 does not invoke the posting engine.
>
> **Analytics Boundary.** Cross-module KPI definitions are owned by **MOD-017 Analytics**. MOD-007 surfaces its own operational reports (§9) but consumes cross-module KPI definitions from MOD-017.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Employee / Position / Department / Grade / Shift Master | SPR-MOD-007-001 | 002, 003, 004, 005, 006 | Foundational; every later sprint assumes this master data. |
| HR Configuration (approval hierarchies, shift patterns, leave policies, notice periods) | SPR-MOD-007-001 / 003 | 002, 003, 004, 005 | Resolved via `ENG-005`. |
| Onboarding / Exit Transactions | SPR-MOD-007-002 | 006 | Analytics consumes attrition metrics. |
| Attendance / Leave Surface | SPR-MOD-007-003 | 005, 006 | Self-service and analytics both consume these. |
| Appraisal Surface | SPR-MOD-007-004 | 006 | Analytics consumes performance distribution. |
| Tenant / Company / Branch / User Master | External (MOD-001) | 001–006 | Consumed via read-only APIs; never redefined. |
| `PayrollProcessed` (consumed event) | External (MOD-008) | SPR-MOD-007-006 | Feeds HR cost-adjacent analytics. |
| `TrainingCompleted` (consumed event) | External (Learning platforms) | SPR-MOD-007-005 | Records training against the employee master. |
| `EmployeeHired` event | SPR-MOD-007-002 | MOD-001, MOD-008, MOD-017 | Notifies identity, payroll, analytics. |
| `EmployeeExited` event | SPR-MOD-007-002 | MOD-001, MOD-008, MOD-017 | Notifies identity, payroll, analytics. |
| `AttendanceMarked` event | SPR-MOD-007-003 | MOD-008, MOD-017 | Feeds payroll and analytics. |
| `LeaveApproved` event | SPR-MOD-007-003 | MOD-008, MOD-017 | Feeds payroll and analytics. |
| `AppraisalCompleted` event | SPR-MOD-007-004 | MOD-008, MOD-017 | Feeds compensation revision and analytics. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-007 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Any regression against that baseline blocks Stage 2 authoring.
- **R2 — Payroll boundary.** Payroll processing, statutory filings, and payslip issuance remain owned by MOD-008. MOD-007 MUST NOT compute pay or post payroll journals.
- **R3 — Accounting boundary.** All ledger effects remain owned by MOD-002. MOD-007 MUST NOT invoke `ENG-015` or `ENG-016` directly. HR-originating obligations flow to Accounting via events or explicit vendor/employee liability contracts owned by MOD-002.
- **R4 — Identity boundary.** Identity and permissions remain owned by MOD-001. MOD-007 consumes identity read-only; it does not mint credentials or grant application permissions.
- **R5 — Analytics boundary.** Cross-module KPI definitions remain owned by MOD-017. Operational HR reports are surfaced within MOD-007; cross-module HR KPIs are consumed from MOD-017.
- **R6 — Optional-engine scope creep.** Optional engines (`ENG-023`, `ENG-026`, `ENG-027`, `ENG-028`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R7 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md`, no horizontal-only sprints are required for MOD-007; all sprints are vertical slices.
- **R8 — Future-enhancement scope.** Any AI-driven attrition prediction, skill-graph matching, or advanced workforce planning is deferred to Module PRD §14 Future Enhancements and is NOT allocated to any sprint in this plan.
- **R9 — Sprint count reconciliation.** The Estimated Sprint Count in `SPRINT_ROADMAP.md` is `5`; this plan reconciles to `6`. The roadmap MUST be updated in the same registration change that promotes this plan to `Approved`.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-007 is baseline-ready when all of the following are objectively true:

1. Every reserved HRMS Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD007_HRMS_BASELINE_v1` is authored under `docs/40-module-baselines/`.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no HRMS capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md`.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`../../15-governance/templates/GT-002_STAGE1_AUTHORING.md`](../../15-governance/templates/GT-002_STAGE1_AUTHORING.md)
