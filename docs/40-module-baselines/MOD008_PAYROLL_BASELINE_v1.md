---
title: "MOD008_PAYROLL_BASELINE_v1 — Payroll Module Baseline"
summary: "Stage 3 Module Baseline for MOD-008 Payroll. Freezes the module after successful completion of Sprint PRDs SPR-MOD-008-001..006. Reference consolidation only — introduces no new requirements, engines, ADRs, events, or Sprint PRDs."
baseline_id: "MOD008_PAYROLL_BASELINE_v1"
module_id: "MOD-008"
module_name: "Payroll"
version: "1.0"
status: "Frozen"
owner: "People"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/payroll/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-008-001", "SPR-MOD-008-002", "SPR-MOD-008-003", "SPR-MOD-008-004", "SPR-MOD-008-005", "SPR-MOD-008-006"]
layer: "delivery"
updated: "2026-07-15"
tags: ["baseline", "module", "MOD-008", "payroll", "stage-3", "freeze"]
document_type: "Module Baseline"
governance_specification: "v1.0"
authored_via_template: "GT-004"
authored_via_template_version: "v1.0"
execution_id: "GT004-MOD008-20260715-001"
parent_execution_id: "GT003-MOD008-006-20260715T000300Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-015", "ENG-016", "ENG-017", "ENG-018", "ENG-019", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
---

# MOD008_PAYROLL_BASELINE_v1 — Payroll Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-008. It introduces no new requirements, engines, ADRs, events, or Sprint PRDs. Future changes to Payroll scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD008_PAYROLL_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD008_PAYROLL_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the Payroll module (`MOD-008`). It certifies that:

- Every Sprint PRD reserved in [`MOD-008_SPRINT_PLAN.md`](../30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md) (`SPR-MOD-008-001` … `SPR-MOD-008-006`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-008. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD008_PAYROLL_BASELINE_v1` is the authoritative repository-wide Payroll contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-008 Payroll Module PRD](../20-module-prds/payroll/MODULE_PRD.md); reference only. Payroll owns:

- Salary structures and components — Salary Structure and Component master lifecycles, Bank Mandate master, and payroll operations configuration (pay cycles, rounding policy, numbering series).
- Payroll cycles and runs — Payroll Run transaction lifecycle, input consumption from HRMS signals (attendance, leave, employee lifecycle), gross computation, approval routing, and run reversal.
- Statutory computations (per locale) — Statutory Setup master lifecycle, locale-scoped statutory component evaluation within a payroll run, and locale-scoped statutory report definitions.
- Reimbursements and advances — Reimbursement and Advance transaction lifecycles, approvals routing, receipt attachments, and adjustment against subsequent payroll runs.
- Payslip generation — Payslip transaction lifecycle and payslip issuance for every completed payroll run.
- Disbursement and posting — Bulk disbursement file generation (immutable once generated), delivery to Bank via `ENG-023` Integration Engine, and invocation of `ENG-015` Voucher and `ENG-016` Posting for payroll ledger effects.
- Payroll Analytics & Compliance — Read-model operational reports (Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home), dashboards, exports, and audit readiness.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition. Employee master, org structure, attendance, and leave remain owned by MOD-007 HRMS; financial posting of payroll obligations remains produced by MOD-002 Accounting via `ENG-015` and `ENG-016`; identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration; cross-module KPI definitions remain owned by MOD-017 Analytics.

## 3. Implemented Sprint Summary

Each row records the sprint's title, status, and primary capability delivered — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-008-001](../30-sprint-prds/payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md) | Payroll Foundation & Salary Structures | Done | Salary Structure, Component, and Bank Mandate masters; payroll operations configuration (pay cycles, rounding policy, numbering series); Payroll Ownership Convention. |
| [SPR-MOD-008-002](../30-sprint-prds/payroll/SPR-MOD-008-002-payroll-cycles-and-runs.md) | Payroll Cycles & Runs | Done | Payroll Run transaction lifecycle, input consumption from HRMS events (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`), gross computation, approval routing, and run reversal. |
| [SPR-MOD-008-003](../30-sprint-prds/payroll/SPR-MOD-008-003-statutory-computations.md) | Statutory Computations | Done | Statutory Setup master, per-locale statutory component evaluation within a payroll run, locale-scoped statutory report definitions, and statutory-completion gate on run finalization. |
| [SPR-MOD-008-004](../30-sprint-prds/payroll/SPR-MOD-008-004-reimbursements-and-advances.md) | Reimbursements & Advances | Done | Reimbursement and Advance transaction lifecycles, approvals routing, receipt attachments, and adjustment against subsequent payroll runs. |
| [SPR-MOD-008-005](../30-sprint-prds/payroll/SPR-MOD-008-005-payslip-generation-and-disbursement.md) | Payslip Generation & Disbursement | Done | Payslip transaction lifecycle, disbursement file generation (immutable once generated), invocation of `ENG-015` Voucher and `ENG-016` Posting, and publication of `PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, and `DisbursementInitiated` events. |
| [SPR-MOD-008-006](../30-sprint-prds/payroll/SPR-MOD-008-006-payroll-analytics-and-compliance.md) | Payroll Analytics & Compliance | Done | Payroll read model, operational reports (Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home), dashboards, exports, and audit-readiness surface. |

## 4. Capability Coverage

Every capability defined by the Payroll Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the Payroll Module PRD and the Sprint PRD family. No capability has been **added, removed, renamed, merged, split, or ownership-transferred** by this consolidation.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-008 Capability (Module PRD §2) | Originating Sprint |
| --- | --- |
| Salary structures and components | SPR-MOD-008-001 |
| Payroll cycles and runs | SPR-MOD-008-002 |
| Statutory computations (per locale) | SPR-MOD-008-003 |
| Reimbursements and advances | SPR-MOD-008-004 |
| Payslip generation | SPR-MOD-008-005 |
| Disbursement and posting | SPR-MOD-008-005 |
| Payroll reports, dashboards, exports, audit readiness (Module PRD §9, §11) | SPR-MOD-008-006 |
| Payroll governance conventions (summarized in §7) | Established across SPR-MOD-008-001 … SPR-MOD-008-006 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-008-001 | Salary structures and components |
| SPR-MOD-008-002 | Payroll cycles and runs |
| SPR-MOD-008-003 | Statutory computations (per locale) |
| SPR-MOD-008-004 | Reimbursements and advances |
| SPR-MOD-008-005 | Payslip generation; Disbursement and posting |
| SPR-MOD-008-006 | Payroll reports, dashboards, exports, audit readiness (§9, §11) |

No Payroll capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-008-001` through `SPR-MOD-008-006`, and reconciled with the Sprint Plan §5 Engine Consumption Map.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim, and canonical ordering from `ENGINE_CATALOG.md` is preserved.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-008-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-008-001, 002, 003, 004, 005, 006 |
| ENG-003 (Permission Management Engine) | SPR-MOD-008-001 |
| ENG-004 (Audit Engine) | SPR-MOD-008-001, 002, 003, 004, 005, 006 |
| ENG-005 (Configuration Engine) | SPR-MOD-008-001, 002, 003 |
| ENG-006 (Localization Engine) | SPR-MOD-008-001, 003 |
| ENG-007 (Document Engine) | SPR-MOD-008-004, 005 |
| ENG-010 (Workflow Engine) | SPR-MOD-008-002, 004 |
| ENG-011 (Approval Engine) | SPR-MOD-008-002, 004 |
| ENG-012 (Rules Engine) | SPR-MOD-008-002, 003, 004 |
| ENG-014 (Scheduler Engine) | SPR-MOD-008-002 |
| ENG-015 (Voucher Engine) | SPR-MOD-008-005 |
| ENG-016 (Posting Engine) | SPR-MOD-008-005 |
| ENG-017 (Numbering Engine) | SPR-MOD-008-001, 002, 004, 005 |
| ENG-018 (Currency Engine) | SPR-MOD-008-001, 002, 004, 005 |
| ENG-019 (Tax Engine) | SPR-MOD-008-003 |
| ENG-021 (Reporting Engine) | SPR-MOD-008-003, 006 |
| ENG-022 (Dashboard Engine) | SPR-MOD-008-006 |
| ENG-023 (Integration Engine) | SPR-MOD-008-005 |
| ENG-024 (Event Engine) | SPR-MOD-008-001, 002, 003, 004, 005, 006 |
| ENG-025 (Notification Engine) | SPR-MOD-008-002, 004, 005 |
| ENG-027 (Export Engine) | SPR-MOD-008-005, 006 |

No Payroll sprint redefines engine behavior; all engines are consumed via their Capability Interfaces. `ENG-015` Voucher and `ENG-016` Posting are invoked by Payroll but their behavior remains owned by MOD-002 Accounting per the governance boundary — posting logic is not redefined here. Optional `ENG-026` Import is not tabulated as required consumption in the Sprint Plan.

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-008-001` through `SPR-MOD-008-006`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim; canonical ordering from `ADR_INDEX.md` is preserved.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-008-001, 002, 003, 004, 005, 006 |
| ADR-014 (Audit Strategy) | SPR-MOD-008-001, 002, 003, 004, 005, 006 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-008-001, 002, 003, 004, 005, 006 |

## 7. Governance Conventions Established

Every governance convention established across Payroll Sprint PRDs 001–006 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-008-001 — Payroll Foundation & Salary Structures**

- **Payroll Ownership Convention** — MOD-008 Payroll owns the business semantics of the Salary Structure and Component master, Bank Mandate master, and payroll operations configuration (pay cycles, rounding policy, numbering series). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, currency, eventing) but MUST NOT redefine Payroll business rules. Employee master, attendance, and leave remain exclusive to MOD-007 HRMS; ledger posting remains exclusive to MOD-002 Accounting; identity, authentication, and permissions remain exclusive to MOD-001 Platform Administration.

**From SPR-MOD-008-002 — Payroll Cycles & Runs**

- **Payroll Run Ownership** — MOD-008 owns the Payroll Run transaction and its state machine (Inputs-to-run, Run-to-approval, reversal via a new reversing run). HRMS signals (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`) are consumed read-only; HRMS transaction lifecycles are not redefined.

**From SPR-MOD-008-003 — Statutory Computations**

- **Statutory Ownership** — MOD-008 owns Statutory Setup master and per-locale statutory component evaluation within a payroll run, gated by the Module PRD §7 rule that a payroll run cannot be finalized until all statutory computations complete. Locale packs remain owned by `ENG-006` Localization; tax algorithms remain owned by `ENG-019` Tax Engine.

**From SPR-MOD-008-004 — Reimbursements & Advances**

- **Reimbursement & Advance Ownership** — MOD-008 owns the Reimbursement and Advance transaction lifecycles, receipt attachments (via `ENG-007`), and adjustment of approved balances against subsequent payroll runs. Approval routing remains owned by `ENG-011`.

**From SPR-MOD-008-005 — Payslip Generation & Disbursement**

- **Payslip & Disbursement Ownership** — MOD-008 owns the Payslip transaction lifecycle, payslip issuance for every completed payroll run, and the generation of disbursement files that are immutable once generated per Module PRD §7. Payroll ledger effects are produced by invoking `ENG-015` Voucher and `ENG-016` Posting; the posting logic itself remains exclusive to MOD-002 Accounting. Bulk disbursement delivery to Bank is performed via `ENG-023` Integration Engine.

**From SPR-MOD-008-006 — Payroll Analytics & Compliance**

- **Payroll Analytics Ownership** — MOD-008 owns operational Payroll reports, dashboards, exports, and the Payroll audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read Model Boundary Convention** — Dashboards, filters, drill-down, and export operate over the Payroll read model; no transactional side effects and no new domain events published by Sprint 6.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint Payroll events through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform, Accounting, Sales, Purchase, Inventory, CRM, HRMS, and Warehouse governance conventions established in prior Module Baselines.

**Freeze.** Governance conventions summarized herein are frozen for `MOD008_PAYROLL_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-008-001` through `SPR-MOD-008-006`.** Every referenced event resolves verbatim from [`docs/20-module-prds/payroll/MODULE_PRD.md`](../20-module-prds/payroll/MODULE_PRD.md) §8 or the authoritative [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md). **No new event names SHALL be introduced by the Module Baseline.**

**Events Published by Payroll** (verbatim from Payroll Module PRD §8; all originating-allocated to SPR-MOD-008-005):

- `PayrollProcessed` — SPR-MOD-008-005
- `PayrollPosted` — SPR-MOD-008-005
- `PayslipIssued` — SPR-MOD-008-005
- `DisbursementInitiated` — SPR-MOD-008-005

**Events Consumed by Payroll** (verbatim from Payroll Module PRD §8; all consumed by SPR-MOD-008-002 to drive run inputs):

- `EmployeeHired` (from MOD-007 HRMS) — SPR-MOD-008-002
- `EmployeeExited` (from MOD-007 HRMS) — SPR-MOD-008-002
- `AttendanceMarked` (from MOD-007 HRMS) — SPR-MOD-008-002
- `LeaveApproved` (from MOD-007 HRMS) — SPR-MOD-008-002

Deferred event surfaces are inherited as `R-EV-*` risks from the originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD008_PAYROLL_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by Payroll. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**Payroll SHALL consume Platform, HRMS, Accounting, and Analytics services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by Payroll:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-007 HRMS** — Employee master, org assignments (read-only APIs); `EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved` events.
- **MOD-002 Accounting** — `ENG-015` Voucher and `ENG-016` Posting are invoked (not redefined) for payroll ledger effects.
- **External Bank systems** — bulk disbursement delivery via `ENG-023` Integration Engine.
- **External Statutory portals** — locale-scoped statutory reporting surfaces.

**Downstream consumers of the Payroll baseline** (per Payroll Module PRD §13 *Provides To Modules*):

- **MOD-002 Accounting** — consumes `PayrollProcessed`, `PayrollPosted`, and `DisbursementInitiated` for payroll ledger effects and reconciliation.
- **MOD-007 HRMS** — consumes `PayrollProcessed` for HR cost-adjacent analytics and `PayslipIssued` for employee self-service.
- **MOD-017 Analytics** — consumes Payroll operational read models and lifecycle events (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`) for cross-module KPIs; owns cross-module KPI definitions.

Downstream modules MUST NOT own Payroll master data, redefine the Payroll Run / Payslip / Reimbursement / Advance / Statutory Computation lifecycles, or redefine Payroll analytics ownership. No downstream module owns Payroll assets.

## 10. Module Completion & Freeze Statement

All six planned Payroll Sprint PRDs (`SPR-MOD-008-001` … `SPR-MOD-008-006`) exist, the [Sprint Plan](../30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md) is executed, and repository verification has been completed under GT-004. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-008 Payroll is now frozen for downstream consumption. Future changes to `MOD008_PAYROLL_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD008_PAYROLL_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD008_PAYROLL_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Multi-country payroll harmonization (Module PRD §14 Future Enhancements).
- AI anomaly detection on payroll inputs (Module PRD §14).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Locales not yet activated in `docs/14-localization/` (deferred until locale packs are extended per Sprint Plan R6).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/payroll/MODULE_PRD.md`](../20-module-prds/payroll/MODULE_PRD.md) — MOD-008 Module PRD (authoritative).
- [`docs/30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md`](../30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md`](../30-sprint-prds/payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md)
- [`docs/30-sprint-prds/payroll/SPR-MOD-008-002-payroll-cycles-and-runs.md`](../30-sprint-prds/payroll/SPR-MOD-008-002-payroll-cycles-and-runs.md)
- [`docs/30-sprint-prds/payroll/SPR-MOD-008-003-statutory-computations.md`](../30-sprint-prds/payroll/SPR-MOD-008-003-statutory-computations.md)
- [`docs/30-sprint-prds/payroll/SPR-MOD-008-004-reimbursements-and-advances.md`](../30-sprint-prds/payroll/SPR-MOD-008-004-reimbursements-and-advances.md)
- [`docs/30-sprint-prds/payroll/SPR-MOD-008-005-payslip-generation-and-disbursement.md`](../30-sprint-prds/payroll/SPR-MOD-008-005-payslip-generation-and-disbursement.md)
- [`docs/30-sprint-prds/payroll/SPR-MOD-008-006-payroll-analytics-and-compliance.md`](../30-sprint-prds/payroll/SPR-MOD-008-006-payroll-analytics-and-compliance.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`](../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md) — authoring template.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](./MOD002_ACCOUNTING_BASELINE_v1.md) — upstream Accounting baseline.
- [`docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](./MOD007_HRMS_BASELINE_v1.md) — upstream HRMS baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
