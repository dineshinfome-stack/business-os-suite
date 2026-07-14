---
title: "MOD007_HRMS_BASELINE_v1 — HRMS Module Baseline"
summary: "Stage 3 Module Baseline for MOD-007 HRMS. Freezes the module after successful completion of Sprint PRDs SPR-MOD-007-001..006. Reference consolidation only — introduces no new requirements, engines, ADRs, events, or Sprint PRDs."
baseline_id: "MOD007_HRMS_BASELINE_v1"
module_id: "MOD-007"
module_name: "HRMS"
version: "1.0"
status: "Frozen"
owner: "People"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/hrms/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-007-001", "SPR-MOD-007-002", "SPR-MOD-007-003", "SPR-MOD-007-004", "SPR-MOD-007-005", "SPR-MOD-007-006"]
layer: "delivery"
updated: "2026-07-14"
tags: ["baseline", "module", "MOD-007", "hrms", "stage-3", "freeze"]
document_type: "Module Baseline"
governance_specification: "v1.0"
authored_via_template: "GT-004"
authored_via_template_version: "v1.0"
execution_id: "GT004-MOD007-20260714-001"
parent_execution_id: "GT003-MOD007-006-20260714T000900Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
---

# MOD007_HRMS_BASELINE_v1 — HRMS Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-007. It introduces no new requirements, engines, ADRs, events, or Sprint PRDs. Future changes to HRMS scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD007_HRMS_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD007_HRMS_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the HRMS module (`MOD-007`). It certifies that:

- Every Sprint PRD reserved in [`MOD-007_SPRINT_PLAN.md`](../30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md) (`SPR-MOD-007-001` … `SPR-MOD-007-006`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-007. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD007_HRMS_BASELINE_v1` is the authoritative repository-wide HRMS contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-007 HRMS Module PRD](../20-module-prds/hrms/MODULE_PRD.md); reference only. HRMS owns:

- Employee master and org structure — Employee master, Position, Department, Grade, Shift, organization assignment, employment status transitions, and HR operations configuration (approval hierarchies, shift patterns, notice periods).
- Onboarding and offboarding — Onboarding Task and Exit Clearance transaction lifecycles, approvals routing, HR letters, and employment attachments.
- Attendance and leave — Leave Type master, Attendance and Leave Request transactions, leave balance computation, leave policy configuration, and biometric ingestion.
- Performance and appraisal — Appraisal transaction lifecycle, appraiser routing, ratings capture, and appraisal completion.
- Learning and development — Consumption of external learning platform events recorded against the employee master.
- Employee self-service — Employee-scoped surfaces for profile view, leave initiation, attendance summary, and HR document access.
- HR Analytics & Compliance — Read-model operational reports (Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution), dashboards, exports, and audit readiness.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition. Payroll processing (earnings, deductions, pay runs, statutory filings, payslip issuance) remains owned by MOD-008 Payroll; financial postings for HR-originating obligations remain owned by MOD-002 Accounting; identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration; cross-module KPI definitions remain owned by MOD-017 Analytics.

## 3. Implemented Sprint Summary

Each row records the sprint's title, status, and primary capability delivered — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-007-001](../30-sprint-prds/hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md) | HRMS Foundation & Employee Master | Done | Employee master, Position/Department/Grade/Shift masters, organization assignment, HR operations configuration (approval hierarchies, shift patterns, notice periods), and the HRMS Ownership Convention. |
| [SPR-MOD-007-002](../30-sprint-prds/hrms/SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md) | Employment Lifecycle (Hire & Exit) | Done | Onboarding Task and Exit Clearance transaction lifecycles, approvals routing, HR letters and attachments, and `EmployeeHired` / `EmployeeExited` events. |
| [SPR-MOD-007-003](../30-sprint-prds/hrms/SPR-MOD-007-003-attendance-and-leave.md) | Attendance & Leave | Done | Leave Type master, Attendance and Leave Request transaction lifecycles, leave balance computation, biometric ingestion, leave policy configuration, and `AttendanceMarked` / `LeaveApproved` events. |
| [SPR-MOD-007-004](../30-sprint-prds/hrms/SPR-MOD-007-004-performance-and-appraisal.md) | Performance & Appraisal | Done | Appraisal transaction lifecycle, appraiser routing, ratings capture, appraisal completion, and `AppraisalCompleted` event. |
| [SPR-MOD-007-005](../30-sprint-prds/hrms/SPR-MOD-007-005-learning-development-and-self-service.md) | Learning & Development and Self-Service | Done | L&D consumption of `TrainingCompleted` against the employee master and Employee Self-Service surfaces (profile view, leave initiation, attendance summary, HR document access). |
| [SPR-MOD-007-006](../30-sprint-prds/hrms/SPR-MOD-007-006-hr-analytics-and-compliance.md) | HR Analytics & Compliance | Done | HR read model, operational reports (Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution), dashboards, exports, audit readiness, and consumption of `PayrollProcessed`. |

## 4. Capability Coverage

Every capability defined by the HRMS Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the HRMS Module PRD and the Sprint PRD family. No capability has been **added, removed, renamed, merged, split, or ownership-transferred** by this consolidation.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-007 Capability Area (Module PRD §2) | Originating Sprint |
| --- | --- |
| Employee master and org structure | SPR-MOD-007-001 |
| Onboarding and offboarding | SPR-MOD-007-002 |
| Attendance and leave | SPR-MOD-007-003 |
| Performance and appraisal | SPR-MOD-007-004 |
| Learning and development | SPR-MOD-007-005 |
| Employee self-service | SPR-MOD-007-005 |
| HR reports, dashboards, exports, audit readiness (Module PRD §9, §11) | SPR-MOD-007-006 |
| HRMS governance conventions (summarized in §7) | Established across SPR-MOD-007-001 … SPR-MOD-007-006 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-007-001 | Employee master and org structure |
| SPR-MOD-007-002 | Onboarding and offboarding |
| SPR-MOD-007-003 | Attendance and leave |
| SPR-MOD-007-004 | Performance and appraisal |
| SPR-MOD-007-005 | Learning and development; Employee self-service |
| SPR-MOD-007-006 | HR reports, dashboards, exports, audit readiness (§9, §11) |

No HRMS capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-007-001` through `SPR-MOD-007-006`.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim, and canonical ordering from `ENGINE_CATALOG.md` is preserved.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-007-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-007-001, 002, 003, 004, 005, 006 |
| ENG-003 (Permission Management Engine) | SPR-MOD-007-001 |
| ENG-004 (Audit Engine) | SPR-MOD-007-001, 002, 003, 004, 005, 006 |
| ENG-005 (Configuration Engine) | SPR-MOD-007-001, 003 |
| ENG-006 (Localization Engine) | SPR-MOD-007-001 |
| ENG-007 (Document Engine) | SPR-MOD-007-001, 002, 005 |
| ENG-008 (Attachment Engine) | SPR-MOD-007-001, 002, 005 |
| ENG-010 (Workflow Engine) | SPR-MOD-007-002, 003, 004 |
| ENG-011 (Approval Engine) | SPR-MOD-007-002, 003, 004 |
| ENG-012 (Rules Engine) | SPR-MOD-007-001, 002, 003, 004 |
| ENG-013 (Automation Engine) | SPR-MOD-007-002, 003, 005 |
| ENG-014 (Scheduler Engine) | SPR-MOD-007-003 |
| ENG-020 (Search Engine) | SPR-MOD-007-006 |
| ENG-021 (Reporting Engine) | SPR-MOD-007-006 |
| ENG-022 (Dashboard Engine) | SPR-MOD-007-006 |
| ENG-023 (Integration Engine) | SPR-MOD-007-002, 003, 005 |
| ENG-024 (Event Engine) | SPR-MOD-007-001, 002, 003, 004, 005, 006 |
| ENG-025 (Notification Engine) | SPR-MOD-007-002, 003, 004, 005, 006 |
| ENG-027 (Export Engine) | SPR-MOD-007-006 |
| ENG-028 (AI Copilot Engine) | SPR-MOD-007-006 |

No HRMS sprint redefines engine behavior; all engines are consumed via their Capability Interfaces. `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any HRMS sprint — all ledger effects of HR-originating obligations are produced by MOD-002 Accounting per the governance boundary.

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-007-001` through `SPR-MOD-007-006`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim; canonical ordering from `ADR_INDEX.md` is preserved.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-007-001, 002, 003, 004, 005, 006 |
| ADR-014 (Audit Strategy) | SPR-MOD-007-001, 002, 003, 004, 005, 006 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-007-001, 002, 003, 004, 005, 006 |

## 7. Governance Conventions Established

Every governance convention established across HRMS Sprint PRDs 001–006 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-007-001 — HRMS Foundation & Employee Master**

- **HRMS Ownership Convention** — MOD-007 HRMS owns the business semantics of the Employee master, the org-structure masters (Position, Department, Grade, Shift), organization assignment, employment status transitions, the reporting structure, and HR operations configuration. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, rules, document, attachment, eventing) but MUST NOT redefine HRMS business rules. Payroll processing remains exclusive to MOD-008 Payroll; financial postings for HR-originating obligations remain exclusive to MOD-002 Accounting; identity, authentication, and permissions remain exclusive to MOD-001 Platform Administration.

**From SPR-MOD-007-002 — Employment Lifecycle (Hire & Exit)**

- **Employment Lifecycle Ownership** — HRMS owns the Onboarding Task and Exit Clearance transaction lifecycles and the HR letters attached to them. Full-and-final settlement journal entries remain exclusive to MOD-002 Accounting; payroll effects remain exclusive to MOD-008 Payroll.

**From SPR-MOD-007-003 — Attendance & Leave**

- **Attendance & Leave Ownership** — HRMS owns the Leave Type master, the Attendance and Leave Request transactions, leave balance computation, and leave policy configuration. Leave-encashment settlement posting remains exclusive to MOD-002 Accounting; payroll processing (including leave-encashment earnings/deductions) remains exclusive to MOD-008 Payroll.

**From SPR-MOD-007-004 — Performance & Appraisal**

- **Appraisal Ownership** — HRMS owns the Appraisal transaction and its state machine. Compensation revision triggered by an appraisal outcome remains exclusive to MOD-008 Payroll; HR analytics (including performance distribution reporting) remains exclusive to SPR-MOD-007-006.

**From SPR-MOD-007-005 — Learning & Development and Self-Service**

- **L&D Consumption & Self-Service Ownership** — HRMS owns L&D consumption records against the employee master and employee-scoped self-service surfaces (profile, leave initiation, attendance summary, HR documents). Learning content authoring and hosting remain exclusive to external learning platforms (integration only, via ENG-023).

**From SPR-MOD-007-006 — HR Analytics & Compliance**

- **HR Analytics Ownership** — HRMS owns operational HR reports, dashboards, exports, and the HR audit-readiness surface as a read-model consumption of prior-sprint data and consumed events (`PayrollProcessed`). Cross-module KPI definitions remain exclusive to MOD-017 Analytics; payroll analytics remain exclusive to MOD-008 Payroll.
- **Read Model Boundary Convention** — Dashboards, filters, drill-down, and export operate over the HR read model; no transactional side effects and no new domain events published.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint events through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform, Accounting, Sales, Purchase, Inventory, CRM, and Warehouse governance conventions established in prior Module Baselines.

**Freeze.** Governance conventions summarized herein are frozen for `MOD007_HRMS_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-007-001` through `SPR-MOD-007-006`.** Every referenced event resolves verbatim from [`docs/20-module-prds/hrms/MODULE_PRD.md`](../20-module-prds/hrms/MODULE_PRD.md) §8 or the authoritative [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md). **No new event names SHALL be introduced by the Module Baseline.**

**Events Published by HRMS** (verbatim from HRMS Module PRD §8):

- `EmployeeHired` — SPR-MOD-007-002
- `EmployeeExited` — SPR-MOD-007-002
- `AttendanceMarked` — SPR-MOD-007-003
- `LeaveApproved` — SPR-MOD-007-003
- `AppraisalCompleted` — SPR-MOD-007-004

**Events Consumed by HRMS** (verbatim from HRMS Module PRD §8):

- `TrainingCompleted` (from external Learning platforms) — SPR-MOD-007-005
- `PayrollProcessed` (from MOD-008 Payroll) — SPR-MOD-007-006

Deferred event surfaces are inherited as `R-EV-*` risks from the originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD007_HRMS_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by HRMS. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**HRMS SHALL consume Platform, Payroll, Accounting, and Analytics services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by HRMS:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-008 Payroll** — `PayrollProcessed` event for HR cost-adjacent analytics.
- **External Learning Platforms** — `TrainingCompleted` event ingested via `ENG-023` Integration Engine.

**Downstream consumers of the HRMS baseline** (per HRMS Module PRD §13 *Provides To Modules*):

- **MOD-008 Payroll** — consumes Employee master, org assignments, attendance/leave signals, and lifecycle events (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`, `AppraisalCompleted`).
- **MOD-010 Projects** — consumes Employee master and org assignments for resourcing.
- **MOD-012 Field Service** — consumes Employee master and org assignments for field workforce.
- **MOD-017 Analytics** — consumes HR operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.
- **MOD-002 Accounting** — consumes HR-originating obligation events (leave encashment, exit settlement) for downstream posting; MOD-002 owns all resulting journal entries.

Downstream modules MUST NOT own HRMS master data, redefine the Employment / Attendance / Leave / Appraisal lifecycles, or redefine HRMS analytics ownership. No downstream module owns HRMS assets.

## 10. Module Completion & Freeze Statement

All six planned HRMS Sprint PRDs (`SPR-MOD-007-001` … `SPR-MOD-007-006`) exist, the [Sprint Plan](../30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md) is executed, and repository verification has been completed under GT-004. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-007 HRMS is now frozen for downstream consumption. Future changes to `MOD007_HRMS_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD007_HRMS_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD007_HRMS_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Skill graph and skill-based matching (Module PRD §14 Future Enhancements).
- Continuous performance management beyond the Appraisal cycle (Module PRD §14).
- AI-driven attrition risk prediction (Module PRD §14; MOD-018 AI Workspace when introduced).
- Advanced workforce planning and headcount forecasting.
- Payroll processing, statutory filings, and payslip issuance (owned by MOD-008 Payroll).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/hrms/MODULE_PRD.md`](../20-module-prds/hrms/MODULE_PRD.md) — MOD-007 Module PRD (authoritative).
- [`docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md`](../30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md`](../30-sprint-prds/hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md)
- [`docs/30-sprint-prds/hrms/SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md`](../30-sprint-prds/hrms/SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md)
- [`docs/30-sprint-prds/hrms/SPR-MOD-007-003-attendance-and-leave.md`](../30-sprint-prds/hrms/SPR-MOD-007-003-attendance-and-leave.md)
- [`docs/30-sprint-prds/hrms/SPR-MOD-007-004-performance-and-appraisal.md`](../30-sprint-prds/hrms/SPR-MOD-007-004-performance-and-appraisal.md)
- [`docs/30-sprint-prds/hrms/SPR-MOD-007-005-learning-development-and-self-service.md`](../30-sprint-prds/hrms/SPR-MOD-007-005-learning-development-and-self-service.md)
- [`docs/30-sprint-prds/hrms/SPR-MOD-007-006-hr-analytics-and-compliance.md`](../30-sprint-prds/hrms/SPR-MOD-007-006-hr-analytics-and-compliance.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`](../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md) — authoring template.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
