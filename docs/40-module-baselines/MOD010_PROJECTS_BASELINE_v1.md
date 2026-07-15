---
title: "MOD010_PROJECTS_BASELINE_v1 — Projects Module Baseline"
summary: "Stage 3 Module Baseline for MOD-010 Projects. Freezes the module after successful completion of Sprint PRDs SPR-MOD-010-001..005. Reference consolidation only — introduces no new requirements, engines, ADRs, events, or Sprint PRDs."
baseline_id: "MOD010_PROJECTS_BASELINE_v1"
module_id: "MOD-010"
module_name: "Projects"
version: "1.0"
status: "Frozen"
owner: "Delivery"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/projects/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-010-001", "SPR-MOD-010-002", "SPR-MOD-010-003", "SPR-MOD-010-004", "SPR-MOD-010-005"]
layer: "delivery"
updated: "2026-07-15"
tags: ["baseline", "module", "MOD-010", "projects", "stage-3", "freeze"]
document_type: "Module Baseline"
governance_specification: "v1.0"
authored_via_template: "GT-004"
authored_via_template_version: "v1.0"
execution_id: "GT004-MOD010-20260715-001"
parent_execution_id: "GT003-MOD010-005-20260715T011000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-015", "ENG-017", "ENG-018", "ENG-021", "ENG-022", "ENG-024", "ENG-025", "ENG-026", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
---

# MOD010_PROJECTS_BASELINE_v1 — Projects Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-010. It introduces no new requirements, engines, ADRs, events, or Sprint PRDs. Future changes to Projects scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD010_PROJECTS_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD010_PROJECTS_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the Projects module (`MOD-010`). It certifies that:

- Every Sprint PRD reserved in [`MOD-010_SPRINT_PLAN.md`](../30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md) (`SPR-MOD-010-001` … `SPR-MOD-010-005`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-010. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD010_PROJECTS_BASELINE_v1` is the authoritative repository-wide Projects contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-010 Projects Module PRD](../20-module-prds/projects/MODULE_PRD.md); reference only. Projects owns:

- Project setup and structure — Project master lifecycle, project configuration (rate cards, approval hierarchy, billing type per project, numbering series).
- Task and milestone tracking — Task and Milestone master lifecycles, Milestone Completion transaction, and Change Request transaction.
- Timesheets and effort — Timesheet transaction lifecycle, effort capture, multi-step approval, and capacity-justification rule enforcement.
- Project budgets and costs — Project Budget definition and project-cost roll-up.
- Project billing (T&M and fixed-price) — Project Invoice transaction lifecycle with T&M and fixed-price billing paths.
- Resource planning — Resource and Rate Card master lifecycles.
- Projects Analytics & Compliance — Read-model operational reports (Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis), dashboards, exports, and audit-readiness surface.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition. Ownership boundaries (identity/permissions, ledger posting, employee master, payroll-originating cost signals, and cross-module KPI definitions) are established in the Module PRD §13 and preserved verbatim across the Sprint PRD family; this baseline does not restate them.

## 3. Implemented Sprint Summary

Each row records the sprint's title, status, and primary capability delivered — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-010-001](../30-sprint-prds/projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md) | Projects Foundation (Project & Resource Setup) | Done | Project, Resource, and Rate Card master data; project configuration (rate cards, approval hierarchy, billing type, numbering series); Projects Ownership Convention. |
| [SPR-MOD-010-002](../30-sprint-prds/projects/SPR-MOD-010-002-tasks-milestones-and-change-requests.md) | Tasks, Milestones & Change Requests | Done | Task and Milestone masters; Milestone Completion and Change Request transaction lifecycles; milestone-invoiceable rule enforcement via `ENG-012`; publication of `ProjectCreated` and `MilestoneCompleted`. |
| [SPR-MOD-010-003](../30-sprint-prds/projects/SPR-MOD-010-003-timesheets-and-effort.md) | Timesheets & Effort | Done | Timesheet transaction lifecycle, effort capture, multi-step approval via `ENG-011`, capacity-justification rule enforcement via `ENG-012`, publication of `TimesheetApproved`, and consumption of `EmployeeHired` and `PayrollProcessed`. |
| [SPR-MOD-010-004](../30-sprint-prds/projects/SPR-MOD-010-004-budgets-costs-and-project-billing.md) | Budgets, Costs & Project Billing | Done | Project Budgets, project-cost roll-up, T&M and fixed-price billing, Project Invoice lifecycle via `ENG-015`, fixed-price/timesheet decoupling rule via `ENG-012`, publication of `ProjectInvoiceIssued`, and consumption of `SalesOrderConfirmed`. |
| [SPR-MOD-010-005](../30-sprint-prds/projects/SPR-MOD-010-005-projects-analytics-and-compliance.md) | Projects Analytics & Compliance | Done | Projects read model, operational reports (Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis), dashboards, exports, and audit-readiness surface. |

## 4. Capability Coverage

Every capability defined by the Projects Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the Projects Module PRD and the Sprint PRD family. No capability has been **added, removed, renamed, merged, split, or ownership-transferred** by this consolidation.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-010 Capability (Module PRD §2) | Originating Sprint |
| --- | --- |
| Project setup and structure | SPR-MOD-010-001 |
| Resource planning | SPR-MOD-010-001 |
| Task and milestone tracking | SPR-MOD-010-002 |
| Timesheets and effort | SPR-MOD-010-003 |
| Project budgets and costs | SPR-MOD-010-004 |
| Project billing (T&M and fixed-price) | SPR-MOD-010-004 |
| Projects reports, dashboards, exports, audit readiness (Module PRD §9, §11) | SPR-MOD-010-005 |
| Projects governance conventions (summarized in §7) | Established across SPR-MOD-010-001 … SPR-MOD-010-005 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-010-001 | Project setup and structure; Resource planning |
| SPR-MOD-010-002 | Task and milestone tracking |
| SPR-MOD-010-003 | Timesheets and effort |
| SPR-MOD-010-004 | Project budgets and costs; Project billing (T&M and fixed-price) |
| SPR-MOD-010-005 | Projects reports, dashboards, exports, audit readiness (§9, §11) |

No Projects capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-010-001` through `SPR-MOD-010-005`, and reconciled with the Sprint Plan §5 Engine Consumption Map.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim, and canonical ordering from `ENGINE_CATALOG.md` is preserved.

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

No Projects sprint redefines engine behavior; all engines are consumed via their Capability Interfaces. `ENG-016` Posting is **not** consumed by any Projects sprint — all ledger effects are owned by MOD-002 Accounting via posting-rule bindings triggered by `ProjectInvoiceIssued` and other emitted events, per the governance boundary declared in the Module PRD and Sprint Plan §5.

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-010-001` through `SPR-MOD-010-005`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim; canonical ordering from `ADR_INDEX.md` is preserved.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-010-001, 002, 003, 004, 005 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-010-001, 002, 003, 004, 005 |

## 7. Governance Conventions Established

Every governance convention established across Projects Sprint PRDs 001–005 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-010-001 — Projects Foundation (Project & Resource Setup)**

- **Projects Ownership Convention** — MOD-010 Projects owns the business semantics of Project, Resource, and Rate Card masters, and project configuration (rate cards, approval hierarchy, billing type per project, numbering series). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, attachments, eventing) but MUST NOT redefine Projects business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-002 (ledger posting), MOD-007 (employee master), MOD-008 (payroll-originating cost signals), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD.

**From SPR-MOD-010-002 — Tasks, Milestones & Change Requests**

- **Tasks & Milestones Ownership** — MOD-010 owns Task and Milestone masters and the Milestone Completion and Change Request transaction lifecycles. The milestone-invoiceable rule ("a milestone can be invoiced only after it is marked completed and approved") is enforced via `ENG-012`. `ProjectCreated` and `MilestoneCompleted` events are published via `ENG-024`.

**From SPR-MOD-010-003 — Timesheets & Effort**

- **Timesheet Ownership** — MOD-010 owns the Timesheet transaction lifecycle, effort capture, and multi-step approval via `ENG-011`. The capacity-justification rule is enforced via `ENG-012`. `TimesheetApproved` events are published via `ENG-024`; `EmployeeHired` (from MOD-007 HRMS) and `PayrollProcessed` (from MOD-008 Payroll) events are consumed read-only.

**From SPR-MOD-010-004 — Budgets, Costs & Project Billing**

- **Budgets & Billing Ownership** — MOD-010 owns Project Budgets, project-cost roll-up, and the Project Invoice transaction lifecycle across T&M and fixed-price billing paths. Invoice issuance uses `ENG-015` Voucher; the fixed-price / timesheet decoupling rule ("fixed-price billing is decoupled from timesheet totals") is enforced via `ENG-012`. `ProjectInvoiceIssued` events are published via `ENG-024`; `SalesOrderConfirmed` (from MOD-003 Sales) is consumed. Ledger effects remain owned by MOD-002 Accounting.

**From SPR-MOD-010-005 — Projects Analytics & Compliance**

- **Projects Analytics Ownership** — MOD-010 owns operational Projects reports, dashboards, exports, and the Projects audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read Model Boundary Convention** — Dashboards, filters, drill-down, and export operate over the Projects read model; no transactional side effects and no new domain events published by Sprint 5.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint Projects events through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform, Accounting, Sales, Purchase, Inventory, CRM, HRMS, Payroll, Manufacturing, and Warehouse governance conventions established in prior Module Baselines.

**Freeze.** Governance conventions summarized herein are frozen for `MOD010_PROJECTS_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-010-001` through `SPR-MOD-010-005`.** Every referenced event resolves verbatim from [`docs/20-module-prds/projects/MODULE_PRD.md`](../20-module-prds/projects/MODULE_PRD.md) §8 or the authoritative [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md). **No new event names SHALL be introduced by the Module Baseline.**

**Events Published by Projects** (verbatim from Projects Module PRD §8):

- `ProjectCreated` — SPR-MOD-010-002
- `MilestoneCompleted` — SPR-MOD-010-002
- `TimesheetApproved` — SPR-MOD-010-003
- `ProjectInvoiceIssued` — SPR-MOD-010-004

**Events Consumed by Projects** (verbatim from Projects Module PRD §8):

- `EmployeeHired` (from MOD-007 HRMS) — SPR-MOD-010-003
- `PayrollProcessed` (from MOD-008 Payroll) — SPR-MOD-010-003
- `SalesOrderConfirmed` (from MOD-003 Sales) — SPR-MOD-010-004

Deferred event surfaces are inherited as `R-EV-*` risks from the originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD010_PROJECTS_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by Projects. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**Projects SHALL consume Platform, HRMS, Payroll, Sales, Accounting, and Analytics services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by Projects:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-007 HRMS** — Employee master (read-only) for resourcing and timesheet capture; `EmployeeHired` event.
- **MOD-008 Payroll** — `PayrollProcessed` event for project-cost roll-up.
- **MOD-003 Sales** — `SalesOrderConfirmed` event for delivery-linked project-invoice preparation.
- **MOD-002 Accounting** — ledger effects of Project Invoice and cost-accrual events are owned by MOD-002 via `ENG-015` Voucher and `ENG-016` Posting bindings; MOD-010 does not invoke the posting engine directly.

**Downstream consumers of the Projects baseline** (per Projects Module PRD §13 *Provides To Modules*):

- **MOD-002 Accounting** — consumes `MilestoneCompleted`, `TimesheetApproved`, and `ProjectInvoiceIssued` for ledger effects.
- **MOD-008 Payroll** — consumes `TimesheetApproved` for cost recognition and payroll flows.
- **MOD-017 Analytics** — consumes Projects operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

Downstream modules MUST NOT own Projects master data, redefine the Timesheet / Milestone Completion / Change Request / Project Invoice lifecycles, or redefine Projects analytics ownership. No downstream module owns Projects assets.

## 10. Module Completion & Freeze Statement

All five planned Projects Sprint PRDs (`SPR-MOD-010-001` … `SPR-MOD-010-005`) exist, the [Sprint Plan](../30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md) is executed, and repository verification has been completed under GT-004. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-010 Projects is now frozen for downstream consumption. Future changes to `MOD010_PROJECTS_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD010_PROJECTS_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD010_PROJECTS_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Portfolio management (Module PRD §14 Future Enhancements).
- AI resource matching (Module PRD §14).
- Predictive overrun alerts (Module PRD §14).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/projects/MODULE_PRD.md`](../20-module-prds/projects/MODULE_PRD.md) — MOD-010 Module PRD (authoritative).
- [`docs/30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md`](../30-sprint-prds/projects/MOD-010_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md`](../30-sprint-prds/projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md)
- [`docs/30-sprint-prds/projects/SPR-MOD-010-002-tasks-milestones-and-change-requests.md`](../30-sprint-prds/projects/SPR-MOD-010-002-tasks-milestones-and-change-requests.md)
- [`docs/30-sprint-prds/projects/SPR-MOD-010-003-timesheets-and-effort.md`](../30-sprint-prds/projects/SPR-MOD-010-003-timesheets-and-effort.md)
- [`docs/30-sprint-prds/projects/SPR-MOD-010-004-budgets-costs-and-project-billing.md`](../30-sprint-prds/projects/SPR-MOD-010-004-budgets-costs-and-project-billing.md)
- [`docs/30-sprint-prds/projects/SPR-MOD-010-005-projects-analytics-and-compliance.md`](../30-sprint-prds/projects/SPR-MOD-010-005-projects-analytics-and-compliance.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`](../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md) — authoring template.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](./MOD007_HRMS_BASELINE_v1.md) — upstream HRMS baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
