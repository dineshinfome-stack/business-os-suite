---
title: "MOD-010 Module Publication — Projects"
summary: "GT-005 Module Publication for MOD-010 Projects. Terminal governance artifact derived exclusively from MOD010_PROJECTS_BASELINE_v1 and MOD-010 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-010_MODULE_PUBLICATION"
publication_id: "MOD-010_MODULE_PUBLICATION"
module_id: "MOD-010"
module_name: "Projects"
version: "1.0"
status: "Published"
owner: "Delivery"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/projects/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md"
source_module: "MOD-010"
source_sprints: ["SPR-MOD-010-001", "SPR-MOD-010-002", "SPR-MOD-010-003", "SPR-MOD-010-004", "SPR-MOD-010-005"]
layer: "delivery"
updated: "2026-07-20"
tags: ["publication", "module", "MOD-010", "projects", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD010-20260720T110000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-015", "ENG-017", "ENG-018", "ENG-021", "ENG-022", "ENG-024", "ENG-025", "ENG-026", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
related_modules: ["MOD-001", "MOD-002", "MOD-003", "MOD-007", "MOD-008", "MOD-017"]
---

# MOD-010 Module Publication — Projects

> **Reference publication only.** This publication is a faithful representation of [`MOD010_PROJECTS_BASELINE_v1`](../../40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md) and the [`MOD-010 Module PRD`](../../20-module-prds/projects/MODULE_PRD.md). It introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-010
- **Module Name:** Projects
- **Owner:** Delivery
- **Publication ID:** MOD-010_MODULE_PUBLICATION
- **Source Baseline:** `MOD010_PROJECTS_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md`](../../30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-010-001` … `SPR-MOD-010-005`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

Projects is the authoritative bounded context for the Project Delivery domain (Baseline §1; PRD §1). It owns Project, Task, Milestone, Resource, and Rate Card master lifecycles and project configuration (rate cards, approval hierarchy, billing type per project, numbering series); Timesheet, Milestone Completion, Change Request, and Project Invoice transaction lifecycles; project budgets and project-cost roll-up across T&M and fixed-price billing paths; and the Projects operational read model for reports, dashboards, exports, and audit readiness (Baseline §2; PRD §2). Downstream modules consume Projects state and never redefine it. Identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration; the Employee master remains owned by MOD-007 HRMS; ledger posting of Project Invoice and cost-accrual events is produced by MOD-002 Accounting via `ENG-015` and `ENG-016`; payroll-originating cost signals remain owned by MOD-008 Payroll; cross-module KPI definitions remain owned by MOD-017 Analytics (Baseline §2, §9; PRD §2, §13).

## 3. Approved Scope

Restates the scope consolidated in `MOD010_PROJECTS_BASELINE_v1` §2 and the Module PRD §2. Projects owns:

- Project setup and structure — Project master lifecycle and project configuration (rate cards, approval hierarchy, billing type per project, numbering series) (Baseline §2; PRD §2, §5, §10).
- Task and milestone tracking — Task and Milestone master lifecycles, Milestone Completion transaction, and Change Request transaction (Baseline §2; PRD §2, §5, §6).
- Timesheets and effort — Timesheet transaction lifecycle, effort capture, multi-step approval, and capacity-justification rule enforcement (Baseline §2; PRD §2, §6, §7).
- Project budgets and costs — Project Budget definition and project-cost roll-up (Baseline §2; PRD §2).
- Project billing (T&M and fixed-price) — Project Invoice transaction lifecycle with T&M and fixed-price billing paths (Baseline §2; PRD §2, §6, §7).
- Resource planning — Resource and Rate Card master lifecycles (Baseline §2; PRD §2, §5).
- Projects Analytics & Compliance — read-model operational reports (Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis), dashboards, exports, and audit-readiness surface (Baseline §2; PRD §9, §11).

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Every authority is inherited verbatim from `MOD010_PROJECTS_BASELINE_v1` §7. This publication restates them for consumer convenience; the Module Baseline remains authoritative.

### 4.1 SPR-MOD-010-001 — Projects Foundation (Project & Resource Setup)

- **Projects Ownership Convention Authority** — MOD-010 Projects owns the business semantics of Project, Resource, and Rate Card masters, and project configuration (rate cards, approval hierarchy, billing type per project, numbering series). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, attachments, eventing) but MUST NOT redefine Projects business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-002 (ledger posting), MOD-007 (employee master), MOD-008 (payroll-originating cost signals), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD.

### 4.2 SPR-MOD-010-002 — Tasks, Milestones & Change Requests

- **Tasks & Milestones Ownership Authority** — MOD-010 owns Task and Milestone masters and the Milestone Completion and Change Request transaction lifecycles. The milestone-invoiceable rule ("a milestone can be invoiced only after it is marked completed and approved") is enforced via `ENG-012`. `ProjectCreated` and `MilestoneCompleted` events are published via `ENG-024`.

### 4.3 SPR-MOD-010-003 — Timesheets & Effort

- **Timesheet Ownership Authority** — MOD-010 owns the Timesheet transaction lifecycle, effort capture, and multi-step approval via `ENG-011`. The capacity-justification rule is enforced via `ENG-012`. `TimesheetApproved` events are published via `ENG-024`; `EmployeeHired` (from MOD-007 HRMS) and `PayrollProcessed` (from MOD-008 Payroll) events are consumed read-only.

### 4.4 SPR-MOD-010-004 — Budgets, Costs & Project Billing

- **Budgets & Billing Ownership Authority** — MOD-010 owns Project Budgets, project-cost roll-up, and the Project Invoice transaction lifecycle across T&M and fixed-price billing paths. Invoice issuance uses `ENG-015` Voucher; the fixed-price / timesheet decoupling rule ("fixed-price billing is decoupled from timesheet totals") is enforced via `ENG-012`. `ProjectInvoiceIssued` events are published via `ENG-024`; `SalesOrderConfirmed` (from MOD-003 Sales) is consumed. Ledger effects remain owned by MOD-002 Accounting.

### 4.5 SPR-MOD-010-005 — Projects Analytics & Compliance

- **Projects Analytics Ownership Authority** — MOD-010 owns operational Projects reports, dashboards, exports, and the Projects audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read Model Boundary Convention Authority** — Dashboards, filters, drill-down, and export operate over the Projects read model; no transactional side effects and no new domain events published by Sprint 5.
- **Audit Readiness Boundary Convention Authority** — Audit readiness exposes prior-sprint Projects events through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-010-001` … `SPR-MOD-010-005`) as consolidated in `MOD010_PROJECTS_BASELINE_v1`. This publication introduces no new requirements. See the source Sprint PRDs for requirement-level detail.

## 6. Business Rules

Business rules are inherited verbatim from the Module PRD §7 and the Sprint PRD family:

- Timesheets exceeding capacity require justification and approval (PRD §7).
- A milestone can be invoiced only after it is marked completed and approved (PRD §7).
- Fixed-price billing is decoupled from timesheet totals (PRD §7).
- Projects master and transaction lifecycles are Projects-owned; no other module mutates Projects state.
- The Employee master is owned by MOD-007 HRMS; Projects consumes it read-only via approved APIs (PRD §13).
- Projects does not implement double-entry posting; ledger effects of Project Invoice and cost-accrual events are produced by MOD-002 Accounting via `ENG-015` and `ENG-016` (PRD §2, §6; Baseline §5, §9).
- Analytics surfaces are read-only projections over the Projects read model (Baseline §7).

## 7. Master Data Authorities

Inherited verbatim from Module PRD §5 and Baseline §4:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Project | SPR-MOD-010-001 |
| Resource | SPR-MOD-010-001 |
| Rate Card | SPR-MOD-010-001 |
| Task | SPR-MOD-010-002 |
| Milestone | SPR-MOD-010-002 |

## 8. Transaction Authorities

Inherited verbatim from Module PRD §6 and Baseline §4:

| Transaction | Originating Sprint |
| --- | --- |
| Milestone Completion | SPR-MOD-010-002 |
| Change Request | SPR-MOD-010-002 |
| Timesheet | SPR-MOD-010-003 |
| Project Invoice | SPR-MOD-010-004 |

## 9. Published Events

Emitted via `ENG-024` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by Projects; delivery infrastructure owned by Platform. Verbatim from Baseline §8 and Module PRD §8:

- `ProjectCreated` — SPR-MOD-010-002
- `MilestoneCompleted` — SPR-MOD-010-002
- `TimesheetApproved` — SPR-MOD-010-003
- `ProjectInvoiceIssued` — SPR-MOD-010-004

## 10. Consumed Events

Consumed via `ENG-024`. Consumption is read-only; Projects does not own the semantics of these events. Verbatim from Baseline §8 and Module PRD §8:

- `EmployeeHired` (from MOD-007 HRMS) — SPR-MOD-010-003
- `PayrollProcessed` (from MOD-008 Payroll) — SPR-MOD-010-003
- `SalesOrderConfirmed` (from MOD-003 Sales) — SPR-MOD-010-004

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-010 via their Capability Interfaces. Engine set is inherited verbatim from `MOD010_PROJECTS_BASELINE_v1` §5:

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-010-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-010-001, 002, 003, 004, 005 |
| ENG-003 (Permission Management Engine) | SPR-MOD-010-001 |
| ENG-004 (Audit Engine) | SPR-MOD-010-001, 002, 003, 004, 005 |
| ENG-005 (Configuration Engine) | SPR-MOD-010-001, 002, 004 |
| ENG-006 (Localization Engine) | SPR-MOD-010-001 |
| ENG-007 (Document Engine) | SPR-MOD-010-001, 002, 004 |
| ENG-008 (Attachment Engine) | SPR-MOD-010-001, 002 |
| ENG-010 (Workflow Engine) | SPR-MOD-010-002, 003, 004 |
| ENG-011 (Approval Engine) | SPR-MOD-010-002, 003, 004 |
| ENG-012 (Rules Engine) | SPR-MOD-010-001, 002, 003, 004 |
| ENG-014 (Scheduler Engine) | SPR-MOD-010-003 |
| ENG-015 (Voucher Engine) | SPR-MOD-010-004 |
| ENG-017 (Numbering Engine) | SPR-MOD-010-001, 004 |
| ENG-018 (Currency Engine) | SPR-MOD-010-004 |
| ENG-021 (Reporting Engine) | SPR-MOD-010-005 |
| ENG-022 (Dashboard Engine) | SPR-MOD-010-005 |
| ENG-024 (Event Engine) | SPR-MOD-010-001, 002, 003, 004, 005 |
| ENG-025 (Notification Engine) | SPR-MOD-010-002, 003, 004, 005 |
| ENG-026 (Import Engine) | SPR-MOD-010-005 |
| ENG-027 (Export Engine) | SPR-MOD-010-005 |

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-032` (RBAC + ABAC). `ENG-016` Posting is **not** consumed by any Projects sprint — all ledger effects are owned by MOD-002 Accounting via posting-rule bindings triggered by `ProjectInvoiceIssued` and other emitted events, per the governance boundary declared in the Module PRD and Baseline §5, §7.

## 12. Dependencies

Inherited verbatim from `MOD010_PROJECTS_BASELINE_v1` §9 and Module PRD §13:

**Upstream contracts consumed by Projects:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- `MOD007_HRMS_BASELINE_v1` — Employee master (read-only) for resourcing and timesheet capture; `EmployeeHired` event.
- `MOD008_PAYROLL_BASELINE_v1` — `PayrollProcessed` event for project-cost roll-up.
- `MOD003_SALES_BASELINE_v1` — `SalesOrderConfirmed` event for delivery-linked project-invoice preparation.
- `MOD002_ACCOUNTING_BASELINE_v1` — ledger effects of Project Invoice and cost-accrual events are owned by MOD-002 via `ENG-015` Voucher and `ENG-016` Posting bindings; MOD-010 does not invoke the posting engine directly.

**Downstream consumers of Projects:**

- `MOD-002 Accounting` — consumes `MilestoneCompleted`, `TimesheetApproved`, and `ProjectInvoiceIssued` for ledger effects.
- `MOD-008 Payroll` — consumes `TimesheetApproved` for cost recognition and payroll flows.
- `MOD-017 Analytics` — consumes Projects operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

## 13. Ownership Boundaries

Inherited verbatim from Baseline §7 and §9 and PRD §2:

- MOD-010 owns **only** the authorities enumerated in §4.
- Downstream modules MUST NOT own Projects master data, redefine the Timesheet / Milestone Completion / Change Request / Project Invoice lifecycles, or redefine Projects analytics ownership.
- The Employee master remains owned by MOD-007 HRMS; Projects consumes it read-only.
- Ledger posting for Project Invoice and cost-accrual events is produced by MOD-002 Accounting via `ENG-015` and `ENG-016`; Projects emits events and does not write journal entries directly.
- Identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration.
- Payroll-originating cost signals remain owned by MOD-008 Payroll and consumed by Projects read-only via `PayrollProcessed`.
- `ENG-004` remains authoritative for audit collection; Projects owns only the business-level audit-readiness surface.
- `ENG-024` remains authoritative for event delivery infrastructure; Projects owns the semantics of the events it emits.
- Cross-module KPI definitions remain exclusive to MOD-017 Analytics.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md`](../../30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | `SPR-MOD-010-001` … `SPR-MOD-010-005` |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md`](../../40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |

## 15. Non-Goals

Inherited verbatim from Baseline §11 and Module PRD §14 (as future items):

- Portfolio management (Module PRD §14 Future Enhancements).
- AI resource matching (Module PRD §14; owned by MOD-018 AI Workspace when introduced).
- Predictive overrun alerts (Module PRD §14).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and the MOD-006 / MOD-007 / MOD-008 / MOD-009 reference pattern, Phase 3 Solution Design proceeds in the sequence:

`WEB-010 → MOB-010 → API-010 → CPC-010 → VR-010`

- Next executable pass: **WEB-010 Projects Web Solution Design**.
- Subsequent passes: MOB-010, API-010, CPC-010, VR-010.

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority enumerated in §4 is inherited verbatim from `MOD010_PROJECTS_BASELINE_v1`.
2. Engine and ADR sets in §11 match the Module Baseline §5–§6 exactly.
3. Downstream dependency set in §12 matches the Module Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD010-20260720T110000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD010_PUBLICATION_COMPLETE` → ready for `WEB-010 Projects Solution Design`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD010_PROJECTS_BASELINE_v2`).

## 19. Repository State Transition

`MOD010_BASELINE_FROZEN` → **`MOD010_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md`](../../40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md)
- [`docs/30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md`](../../30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md)
- [`docs/45-module-publications/manufacturing/MOD-009_MODULE_PUBLICATION.md`](../manufacturing/MOD-009_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
