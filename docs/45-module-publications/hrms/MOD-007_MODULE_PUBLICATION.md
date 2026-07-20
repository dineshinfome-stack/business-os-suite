---
title: "MOD-007 Module Publication — HRMS"
summary: "GT-005 Module Publication for MOD-007 HRMS. Terminal governance artifact derived exclusively from MOD007_HRMS_BASELINE_v1 and MOD-007 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-007_MODULE_PUBLICATION"
publication_id: "MOD-007_MODULE_PUBLICATION"
module_id: "MOD-007"
module_name: "HRMS"
version: "1.0"
status: "Published"
owner: "People"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/hrms/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md"
source_module: "MOD-007"
source_sprints: ["SPR-MOD-007-001", "SPR-MOD-007-002", "SPR-MOD-007-003", "SPR-MOD-007-004", "SPR-MOD-007-005", "SPR-MOD-007-006"]
layer: "delivery"
updated: "2026-07-20"
tags: ["publication", "module", "MOD-007", "hrms", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD007-20260720T080000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
related_modules: ["MOD-001", "MOD-002", "MOD-008", "MOD-010", "MOD-012", "MOD-017"]
---

# MOD-007 Module Publication — HRMS

> **Reference publication only.** This publication is a faithful representation of [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) and the [`MOD-007 Module PRD`](../../20-module-prds/hrms/MODULE_PRD.md). It introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-007
- **Module Name:** HRMS
- **Owner:** People
- **Publication ID:** MOD-007_MODULE_PUBLICATION
- **Source Baseline:** `MOD007_HRMS_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md`](../../30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-007-001` … `SPR-MOD-007-006`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

HRMS is the authoritative bounded context for the Human Capital domain. It owns the Employee master, the org-structure masters (Position, Department, Grade, Shift), organization assignment, employment status transitions, HR operations configuration, the Onboarding and Exit lifecycles, Attendance and Leave, Performance & Appraisal, Learning & Development consumption, Employee Self-Service surfaces, and the HR operational read model together with HR reports. Downstream modules consume HRMS state and never redefine it. Payroll processing, ledger posting for HR-originating obligations, and identity/authentication remain owned by MOD-008, MOD-002, and MOD-001 respectively.

## 3. Approved Scope

Restates the scope consolidated in `MOD007_HRMS_BASELINE_v1` §2 and the Module PRD §2. HRMS owns:

- Employee master and org structure — Employee, Position, Department, Grade, Shift, organization assignment, employment status transitions, and HR operations configuration (approval hierarchies, shift patterns, notice periods).
- Onboarding and offboarding — Onboarding Task and Exit Clearance transaction lifecycles, approvals routing, HR letters, and employment attachments.
- Attendance and leave — Leave Type master, Attendance and Leave Request transactions, leave balance computation, leave policy configuration, and biometric ingestion.
- Performance and appraisal — Appraisal transaction lifecycle, appraiser routing, ratings capture, and appraisal completion.
- Learning and development — consumption of external learning platform events recorded against the employee master.
- Employee self-service — employee-scoped surfaces for profile view, leave initiation, attendance summary, and HR document access.
- HR Analytics & Compliance — read-model operational reports (Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution), dashboards, exports, and audit readiness.

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Every authority is inherited verbatim from `MOD007_HRMS_BASELINE_v1` §7. This publication restates them for consumer convenience; the Module Baseline remains authoritative.

### 4.1 SPR-MOD-007-001 — HRMS Foundation & Employee Master

- **HRMS Ownership Convention Authority** — MOD-007 owns the business semantics of the Employee master, the org-structure masters (Position, Department, Grade, Shift), organization assignment, employment status transitions, the reporting structure, and HR operations configuration. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, rules, document, attachment, eventing) but MUST NOT redefine HRMS business rules. Payroll processing remains exclusive to MOD-008 Payroll; financial postings for HR-originating obligations remain exclusive to MOD-002 Accounting; identity, authentication, and permissions remain exclusive to MOD-001 Platform Administration.

### 4.2 SPR-MOD-007-002 — Employment Lifecycle (Hire & Exit)

- **Employment Lifecycle Ownership Authority** — HRMS owns the Onboarding Task and Exit Clearance transaction lifecycles and the HR letters attached to them. Full-and-final settlement journal entries remain exclusive to MOD-002 Accounting; payroll effects remain exclusive to MOD-008 Payroll.

### 4.3 SPR-MOD-007-003 — Attendance & Leave

- **Attendance & Leave Ownership Authority** — HRMS owns the Leave Type master, the Attendance and Leave Request transactions, leave balance computation, and leave policy configuration. Leave-encashment settlement posting remains exclusive to MOD-002 Accounting; payroll processing (including leave-encashment earnings/deductions) remains exclusive to MOD-008 Payroll.

### 4.4 SPR-MOD-007-004 — Performance & Appraisal

- **Appraisal Ownership Authority** — HRMS owns the Appraisal transaction and its state machine. Compensation revision triggered by an appraisal outcome remains exclusive to MOD-008 Payroll; cross-module performance analytics remain exclusive to MOD-017 Analytics.

### 4.5 SPR-MOD-007-005 — Learning & Development and Self-Service

- **L&D Consumption & Self-Service Ownership Authority** — HRMS owns L&D consumption records against the employee master and employee-scoped self-service surfaces (profile, leave initiation, attendance summary, HR documents). Learning content authoring and hosting remain exclusive to external learning platforms (integration only, via `ENG-023`).

### 4.6 SPR-MOD-007-006 — HR Analytics & Compliance

- **HR Analytics Ownership Authority** — HRMS owns operational HR reports, dashboards, exports, and the HR audit-readiness surface as a read-model consumption of prior-sprint data and consumed events (`PayrollProcessed`). Cross-module KPI definitions remain exclusive to MOD-017 Analytics; payroll analytics remain exclusive to MOD-008 Payroll.
- **Read Model Boundary Convention Authority** — Dashboards, filters, drill-down, and export operate over the HR read model; no transactional side effects and no new domain events published.
- **Audit Readiness Boundary Convention Authority** — Audit readiness exposes prior-sprint events through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-007-001` … `SPR-MOD-007-006`) as consolidated in `MOD007_HRMS_BASELINE_v1`. This publication introduces no new requirements. See the source Sprint PRDs for requirement-level detail.

## 6. Business Rules

Business rules are inherited verbatim from the Module PRD §7 and the Sprint PRD family:

- Leave balance cannot go negative unless the Leave Type permits it.
- An employee cannot approve their own leave.
- Sensitive employee data respects data-classification rules.
- Employee master lifecycle (create, edit, archive) is HRMS-owned; no other module mutates master state.
- Employment status transitions follow the lifecycle authorized by SPR-MOD-007-001/002.
- HRMS transactions have no ledger effect; posting is out of scope (owned by MOD-002 Accounting).
- HRMS does not compute pay; payroll processing is out of scope (owned by MOD-008 Payroll).
- Analytics surfaces are read-only projections over the HR read model.

## 7. Master Data Authorities

Inherited verbatim from Module PRD §5 and Baseline §4:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Employee | SPR-MOD-007-001 |
| Position | SPR-MOD-007-001 |
| Department | SPR-MOD-007-001 |
| Grade | SPR-MOD-007-001 |
| Shift | SPR-MOD-007-001 |
| Leave Type | SPR-MOD-007-003 |

## 8. Transaction Authorities

Inherited verbatim from Module PRD §6 and Baseline §4:

| Transaction | Originating Sprint |
| --- | --- |
| Onboarding Task | SPR-MOD-007-002 |
| Exit Clearance | SPR-MOD-007-002 |
| Attendance | SPR-MOD-007-003 |
| Leave Request | SPR-MOD-007-003 |
| Appraisal | SPR-MOD-007-004 |

## 9. Published Events

Emitted via `ENG-024` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by HRMS; delivery infrastructure owned by Platform. Verbatim from Baseline §8 and Module PRD §8:

- `EmployeeHired` — SPR-MOD-007-002
- `EmployeeExited` — SPR-MOD-007-002
- `AttendanceMarked` — SPR-MOD-007-003
- `LeaveApproved` — SPR-MOD-007-003
- `AppraisalCompleted` — SPR-MOD-007-004

## 10. Consumed Events

Consumed from upstream systems via `ENG-024` / `ENG-023`. Consumption is read-only; HRMS does not own the semantics of these events. Verbatim from Baseline §8:

- `TrainingCompleted` (from external Learning platforms) — SPR-MOD-007-005
- `PayrollProcessed` (from MOD-008 Payroll) — SPR-MOD-007-006

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-007 via their Capability Interfaces. Engine set is inherited verbatim from `MOD007_HRMS_BASELINE_v1` §5:

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

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-014` (Audit Strategy), `ADR-032` (RBAC + ABAC). `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by HRMS — all ledger effects of HR-originating obligations are produced by MOD-002 Accounting per the governance boundary.

## 12. Dependencies

Inherited verbatim from `MOD007_HRMS_BASELINE_v1` §9 and Module PRD §13:

**Upstream contracts consumed by HRMS:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- `MOD-008 Payroll` — `PayrollProcessed` event for HR cost-adjacent analytics.
- **External Learning Platforms** — `TrainingCompleted` event ingested via `ENG-023` Integration Engine.

**Downstream consumers of HRMS:**

- `MOD-008 Payroll`, `MOD-010 Projects`, `MOD-012 Field Service`, `MOD-017 Analytics`, `MOD-002 Accounting` (for HR-originating obligation events).

## 13. Ownership Boundaries

Inherited verbatim from Baseline §7 and §9:

- MOD-007 owns **only** the authorities enumerated in §4.
- Downstream modules MUST NOT own HRMS master data, redefine the Employment / Attendance / Leave / Appraisal lifecycles, or redefine HRMS analytics ownership.
- Payroll computation remains owned by MOD-008; HRMS never computes pay or writes payroll journals.
- Financial postings for HR-originating obligations remain owned by MOD-002 Accounting; HRMS emits events and never posts to the ledger.
- Identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration.
- `ENG-004` remains authoritative for audit collection; HRMS owns only the business-level audit-readiness surface.
- `ENG-024` remains authoritative for event delivery infrastructure; HRMS owns the semantics of the events it emits.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md`](../../30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | `SPR-MOD-007-001` … `SPR-MOD-007-006` |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |

## 15. Non-Goals

Inherited verbatim from Baseline §11 and Module PRD §14 (as future items):

- Skill graph and skill-based resourcing.
- Continuous performance management beyond the appraisal cycle authorized in §8.
- AI attrition risk scoring and predictive workforce analytics (owned by MOD-018 AI Workspace when introduced).
- Payroll processing, earnings/deductions, pay runs, statutory filings, and payslip issuance (owned by MOD-008).
- Ledger posting or financial voucher creation (owned by MOD-002 Accounting).
- Learning content authoring or hosting (owned by external learning platforms; HRMS consumes `TrainingCompleted` only).

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and the MOD-006 reference pattern, Phase 3 Solution Design proceeds in the sequence:

`WEB-007 → MOB-007 → API-007 → CPC-007 → VR-007`

- Next executable pass: **WEB-007 HRMS Solution Design**.
- Subsequent passes: MOB-007, API-007, CPC-007, VR-007.

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority enumerated in §4 is inherited verbatim from `MOD007_HRMS_BASELINE_v1`.
2. Engine and ADR sets in §11 match the Module Baseline §5–§6 exactly.
3. Downstream dependency set in §12 matches the Module Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD007-20260720T080000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD007_PUBLICATION_COMPLETE` → ready for `WEB-007 HRMS Solution Design`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD007_HRMS_BASELINE_v2`).

## 19. Repository State Transition

`MOD007_BASELINE_FROZEN` → **`MOD007_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- [`docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md`](../../30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md)
- [`docs/45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md`](../crm/MOD-006_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
