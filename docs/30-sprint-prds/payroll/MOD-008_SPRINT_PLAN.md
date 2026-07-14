---
title: "MOD-008 Payroll — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-008 Payroll. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "People"
status: "Approved"
updated: "2026-07-14"
module_id: "MOD-008"
module_name: "Payroll"
sprint_prefix: "SPR-MOD-008-"
stage: "1"
pass: "10.0.0"
parent_module_prd: "docs/20-module-prds/payroll/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
governance_specification: "v1.0"
template_standard: "v1.3"
authored_by_template: "GT-002"
execution_id: "GT002-MOD008-20260714-001"
tags: ["sprint", "planning", "payroll", "mod-008", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-008 Payroll — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-008 Payroll** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## Normative Source Precedence

On any conflict, the following order wins:

1. `docs/20-module-prds/payroll/MODULE_PRD.md` (Module PRD)
2. This Capability Allocation Matrix (§4)
3. The sprint sections in §2 of this Sprint Plan
4. Any derived artifact

## 1. Purpose & Scope

Plan the implementation of MOD-008 Payroll by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD.

This plan introduces no new business requirements beyond the approved [MOD-008 Payroll Module PRD](../../20-module-prds/payroll/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Governance Boundaries (recapitulated).** Per the Module PRD §2 and §13:

- **Employee master, org structure, attendance, and leave** are owned by **MOD-007 HRMS**. Payroll consumes them read-only via published events (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`) and read-only APIs.
- **Financial posting** of payroll obligations is performed by **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. Payroll invokes these engines; it does not redefine posting logic.
- **Identity, authentication, and permissions** remain owned by **MOD-001 Platform Administration** via `ENG-001`, `ENG-002`, `ENG-003`.
- **Cross-module analytics KPIs** are owned by **MOD-017 Analytics**. Payroll surfaces operational reports (§9) and consumes cross-module KPI definitions.

**Traceability:**

- Parent Module README — [`../../20-module-prds/payroll/README.md`](../../20-module-prds/payroll/README.md)
- Parent Module PRD — [`../../20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- Upstream module baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (all frozen/published)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-008 is reconciled to **6** by this plan (upward from the 4 recorded in `SPRINT_ROADMAP.md`, decomposing statutory, reimbursement/advance, and payroll analytics into dedicated sprints).

## 2. Proposed Sprint Sequence

### SPR-MOD-008-001 — Payroll Foundation & Salary Structures

- **Objective.** Establish payroll foundations under a tenant/company: Salary Structure and Component master, Bank Mandate master, payroll operations configuration (pay cycles, rounding policy, numbering series).
- **Boundaries.**
  - In: Salary Structure and Component master, Bank Mandate master, payroll operations configuration.
  - Out: payroll runs, statutory computations, reimbursements/advances, payslip generation, disbursement, analytics; employee master (owned by MOD-007); identity/permissions (owned by MOD-001); ledger posting (owned by MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Salary structures and components; submodule Structures), §3 Personas, §5 Master Data (Salary Structure, Component, Bank Mandate), §10 Configuration (Pay cycles, Rounding policy, Numbering series).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (Payroll sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` and the published `MOD007_HRMS_BASELINE_v1` for employee master read-only.
- **Sprint Exit Criteria.**
  - Salary Structure, Component, and Bank Mandate records can be created, edited, and archived under a tenant/company.
  - Payroll operations configuration (pay cycles, rounding policy, numbering series) resolves deterministically through `ENG-005`.
  - Employee master linkage is consumed read-only from MOD-007 — no employee master is re-authored.
  - All structural changes are audited via `ENG-004`.

### SPR-MOD-008-002 — Payroll Cycles & Runs

- **Objective.** Deliver the Inputs-to-run and Run-to-approval business processes: Payroll Run transaction lifecycle, input consumption (attendance, leave, structures), gross computation, and approval routing.
- **Boundaries.**
  - In: Payroll Run transaction lifecycle, input consumption from HRMS events, gross computation, approval routing, run reversal.
  - Out: statutory computations (sprint 003), reimbursements/advances (sprint 004), payslip generation (sprint 005), disbursement and posting (sprint 005), analytics (sprint 006).
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Payroll cycles and runs; submodule Cycles), §4 Business Processes (Inputs-to-run, Run-to-approval), §6 Transactions (Payroll Run), §7 Business Rules (Reversal of a finalized run creates a new, reversing run), §8 Integration Points (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited` — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-014` Scheduler, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-008-001`.
- **Sprint Exit Criteria.**
  - Payroll Run transactions can be created, populated from HRMS signals, routed through approval, and reversed via a new reversing run.
  - Run reversal rule is enforced via `ENG-012`.
  - Consumed HRMS events (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`) drive run inputs deterministically.

### SPR-MOD-008-003 — Statutory Computations

- **Objective.** Deliver statutory computations per locale: Statutory Setup master lifecycle, statutory component evaluation, and locale-specific statutory reports.
- **Boundaries.**
  - In: Statutory Setup master lifecycle, per-locale statutory component evaluation within a payroll run, statutory report definitions.
  - Out: payroll run orchestration (sprint 002); disbursement to statutory portals (sprint 005); analytics (sprint 006).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Statutory computations per locale; submodule Statutory), §5 Master Data (Statutory Setup), §7 Business Rules (A payroll run cannot be finalized until all statutory computations complete), §8 Integration Points (Statutory portals — external), §10 Configuration (Statutory settings per locale).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-012` Rules, `ENG-019` Tax, `ENG-021` Reporting, `ENG-024` Event.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-008-002`.
- **Sprint Exit Criteria.**
  - Statutory Setup master can be maintained per locale via `ENG-006`.
  - Statutory components evaluate deterministically within a payroll run via `ENG-012` and `ENG-019`.
  - Run finalization is gated on statutory completion per §7 business rule.

### SPR-MOD-008-004 — Reimbursements & Advances

- **Objective.** Deliver the Reimbursement and Advance transaction lifecycles, approvals, and their consumption within payroll runs.
- **Boundaries.**
  - In: Reimbursement transaction lifecycle, Advance transaction lifecycle, approvals routing, adjustment against subsequent payroll runs.
  - Out: payslip generation (sprint 005); disbursement/posting (sprint 005); analytics (sprint 006).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Reimbursements and advances), §6 Transactions (Reimbursement, Advance).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-008-001`, `SPR-MOD-008-002`.
- **Sprint Exit Criteria.**
  - Reimbursement and Advance transactions can be raised, approved, and reflected in subsequent payroll runs.
  - Document attachments (receipts) are managed via `ENG-007`.
  - Approval routing is enforced via `ENG-011`.

### SPR-MOD-008-005 — Payslip Generation & Disbursement

- **Objective.** Deliver the Approval-to-disbursement and Disbursement-to-posting processes: Payslip transaction lifecycle, payslip issuance, bulk disbursement file generation, and ledger posting via MOD-002.
- **Boundaries.**
  - In: Payslip transaction lifecycle, payslip issuance, disbursement file generation (immutable once generated), invocation of `ENG-015` Voucher and `ENG-016` Posting for payroll ledger effects.
  - Out: analytics (sprint 006); redefinition of posting logic (owned by MOD-002).
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Payslip generation; Disbursement and posting; submodules Payslips, Disbursement), §4 Business Processes (Approval-to-disbursement, Disbursement-to-posting), §6 Transactions (Payslip; Posting Behavior clause), §7 Business Rules (Disbursement files are immutable once generated), §8 Integration Points (`PayslipIssued`, `DisbursementInitiated`, `PayrollProcessed`, `PayrollPosted` — published; Bank — external).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-015` Voucher, `ENG-016` Posting, `ENG-017` Numbering, `ENG-018` Currency, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-008-002`, `SPR-MOD-008-003`, `SPR-MOD-008-004`.
- **Sprint Exit Criteria.**
  - Payslips can be issued for every completed payroll run.
  - Disbursement files are generated, delivered via `ENG-023`, and are immutable per §7 business rule.
  - Payroll ledger effects are produced via `ENG-015` + `ENG-016` (invoked, not redefined).
  - `PayslipIssued`, `DisbursementInitiated`, `PayrollProcessed`, and `PayrollPosted` are published via `ENG-024`.

### SPR-MOD-008-006 — Payroll Analytics & Compliance

- **Objective.** Deliver payroll reports (Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home), dashboards, exports, and audit readiness. Read-model only.
- **Boundaries.**
  - In: Payroll read model, operational reports and dashboards, KPI surfacing, audit readiness, bulk exports.
  - Out: cross-module KPI definitions (owned by MOD-017 Analytics); transactional functionality of earlier sprints.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §9 Reports & Analytics (Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home), §11 Non-functional (Compliance, audit readiness).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-024` Event, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-008-001` … `SPR-MOD-008-005` (consumes data produced by all prior sprints).
- **Sprint Exit Criteria.**
  - Reports and dashboards render from data produced by prior sprints.
  - Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
  - Audit readiness surface exposes every payroll event emitted during the sprint sequence.

### Planning Flexibility

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-008-001 (Foundation & Salary Structures)
         │
         ▼
SPR-MOD-008-002 (Cycles & Runs)
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
SPR-MOD-008-003   SPR-MOD-008-004   (…)
(Statutory)       (Reimbursements
                   & Advances)
         │              │
         └──────┬───────┘
                ▼
       SPR-MOD-008-005 (Payslips & Disbursement)
                │
                ▼
       SPR-MOD-008-006 (Payroll Analytics & Compliance)
```

Sprint 002 depends on 001. Sprints 003 and 004 depend on 002 (and 004 also on 001 for master). Sprint 005 depends on 002, 003, and 004. Sprint 006 consumes output from all five predecessors.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-008 Payroll Module PRD](../../20-module-prds/payroll/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint.

### 4.1 Capability Allocation Matrix (Forward Map)

| # | Module PRD Capability (§2) | Origin Sprint | PRD Section | Exact Quote | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Salary structures and components | SPR-MOD-008-001 | §2 | "Salary structures and components" | PASS |
| 2 | Payroll cycles and runs | SPR-MOD-008-002 | §2 | "Payroll cycles and runs" | PASS |
| 3 | Statutory computations (per locale) | SPR-MOD-008-003 | §2 | "Statutory computations (per locale)" | PASS |
| 4 | Reimbursements and advances | SPR-MOD-008-004 | §2 | "Reimbursements and advances" | PASS |
| 5 | Payslip generation | SPR-MOD-008-005 | §2 | "Payslip generation" | PASS |
| 6 | Disbursement and posting | SPR-MOD-008-005 | §2 | "Disbursement and posting" | PASS |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Structures | SPR-MOD-008-001 |
| Cycles | SPR-MOD-008-002 |
| Statutory | SPR-MOD-008-003 |
| Payslips | SPR-MOD-008-005 |
| Disbursement | SPR-MOD-008-005 |

> Reimbursements & Advances (§2 capability and §6 transactions) has no dedicated submodule in the Module PRD §2 submodule list; it is originating-allocated to `SPR-MOD-008-004` via the §2 capability ("Reimbursements and advances") and §6 transactions (Reimbursement, Advance). Payroll Analytics is a read-model surface originating-allocated to `SPR-MOD-008-006` per §9.

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Salary Structure | Master Data (§5) | SPR-MOD-008-001 |
| Component | Master Data (§5) | SPR-MOD-008-001 |
| Bank Mandate | Master Data (§5) | SPR-MOD-008-001 |
| Statutory Setup | Master Data (§5) | SPR-MOD-008-003 |
| Payroll Run | Transaction (§6) | SPR-MOD-008-002 |
| Reimbursement | Transaction (§6) | SPR-MOD-008-004 |
| Advance | Transaction (§6) | SPR-MOD-008-004 |
| Payslip | Transaction (§6) | SPR-MOD-008-005 |

### 4.4 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-008-001 | §1, §2 (Salary structures and components; submodule Structures), §3 (personas), §5 (Salary Structure, Component, Bank Mandate), §10 (Pay cycles, Rounding policy, Numbering series) |
| SPR-MOD-008-002 | §2 (Payroll cycles and runs; submodule Cycles), §4 (Inputs-to-run, Run-to-approval), §6 (Payroll Run), §7 (Reversal rule), §8 (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited` — consumed) |
| SPR-MOD-008-003 | §2 (Statutory computations per locale; submodule Statutory), §5 (Statutory Setup), §7 (statutory-completion finalization rule), §8 (Statutory portals — external), §10 (Statutory settings per locale) |
| SPR-MOD-008-004 | §2 (Reimbursements and advances), §6 (Reimbursement, Advance) |
| SPR-MOD-008-005 | §2 (Payslip generation; Disbursement and posting; submodules Payslips, Disbursement), §4 (Approval-to-disbursement, Disbursement-to-posting), §6 (Payslip; Posting Behavior clause), §7 (Disbursement-file immutability), §8 (`PayslipIssued`, `DisbursementInitiated`, `PayrollProcessed`, `PayrollPosted` — published; Bank — external) |
| SPR-MOD-008-006 | §9 (Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home), §11 (Compliance, audit readiness) |

No Module PRD capability, submodule, master-data entity, or transaction sits outside the six sprints above. No capability appears as the originating allocation in more than one sprint. Every capability appears in exactly one originating sprint and in at least one sprint.

## 5. Engine Consumption Map

Derived from Payroll Module PRD §12. No engine behavior is redefined. Engine identifiers resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md`.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-010 | ENG-011 | ENG-012 | ENG-014 | ENG-015 | ENG-016 | ENG-017 | ENG-018 | ENG-019 | ENG-021 | ENG-022 | ENG-023 | ENG-024 | ENG-025 | ENG-027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-008-001 | ● | ● | ● | ● | ● | ● |   |   |   |   |   |   |   | ● | ● |   |   |   |   | ● |   |   |
| SPR-MOD-008-002 |   | ● |   | ● | ● |   |   | ● | ● | ● | ● |   |   | ● | ● |   |   |   |   | ● | ● |   |
| SPR-MOD-008-003 |   | ● |   | ● | ● | ● |   |   |   | ● |   |   |   |   |   | ● | ● |   |   | ● |   |   |
| SPR-MOD-008-004 |   | ● |   | ● |   |   | ● | ● | ● | ● |   |   |   | ● | ● |   |   |   |   | ● | ● |   |
| SPR-MOD-008-005 |   | ● |   | ● |   |   | ● |   |   |   |   | ● | ● | ● | ● |   |   |   | ● | ● | ● | ● |
| SPR-MOD-008-006 |   | ● |   | ● |   |   |   |   |   |   |   |   |   |   |   |   | ● | ● |   | ● |   | ● |

Optional engine `ENG-026` Import MAY be consumed during Stage 2 authoring for master data seeding (salary structures, statutory setup); it is not tabulated as required consumption in this plan.

## 6. ADR Consumption Map

Accepted ADRs only, per Payroll Module PRD (`ADR-011`, `ADR-014`, `ADR-032`).

| Sprint | ADR-011 | ADR-014 | ADR-032 |
| --- | :-: | :-: | :-: |
| SPR-MOD-008-001 | ● | ● | ● |
| SPR-MOD-008-002 | ● | ● | ● |
| SPR-MOD-008-003 | ● | ● | ● |
| SPR-MOD-008-004 | ● | ● | ● |
| SPR-MOD-008-005 | ● | ● | ● |
| SPR-MOD-008-006 | ● | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Platform Dependency.** MOD-008 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Tenant, company, branch, and user master are consumed read-only from MOD-001.
>
> **HRMS Dependency.** MOD-008 assumes `MOD007_HRMS_BASELINE_v1` is published. Employee master, attendance, and leave signals are consumed read-only from MOD-007 via APIs and published events.
>
> **Accounting Dependency.** MOD-008 invokes `ENG-015` and `ENG-016` (owned by MOD-002 Accounting) for payroll ledger effects. Posting logic is not redefined.
>
> **Analytics Boundary.** Cross-module KPI definitions are owned by MOD-017 Analytics. MOD-008 surfaces its own operational reports (§9).

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Salary Structure / Component / Bank Mandate Master | SPR-MOD-008-001 | 002, 004, 005, 006 | Foundational; every later sprint assumes this master data. |
| Payroll Configuration (pay cycles, rounding policy, numbering series) | SPR-MOD-008-001 | 002, 003, 004, 005 | Resolved via `ENG-005`. |
| Payroll Run Transaction | SPR-MOD-008-002 | 003, 004, 005, 006 | Central transactional surface. |
| Statutory Setup / Computation Surface | SPR-MOD-008-003 | 005, 006 | Gates finalization; feeds payslips and analytics. |
| Reimbursement / Advance Surface | SPR-MOD-008-004 | 005, 006 | Feeds payslips and analytics. |
| Employee Master | External (MOD-007) | 001–006 | Consumed via read-only APIs; never redefined. |
| Tenant / Company / Branch / User Master | External (MOD-001) | 001–006 | Consumed via read-only APIs; never redefined. |
| `AttendanceMarked` (consumed event) | External (MOD-007) | SPR-MOD-008-002 | Drives payroll run inputs. |
| `LeaveApproved` (consumed event) | External (MOD-007) | SPR-MOD-008-002 | Drives payroll run inputs. |
| `EmployeeHired` (consumed event) | External (MOD-007) | SPR-MOD-008-002 | Drives new-hire pro-ration. |
| `EmployeeExited` (consumed event) | External (MOD-007) | SPR-MOD-008-002 | Drives final settlement inputs. |
| Ledger Posting via `ENG-015` + `ENG-016` | External (MOD-002) | SPR-MOD-008-005 | Invoked, not redefined. |
| `PayrollProcessed` event | SPR-MOD-008-005 | MOD-002, MOD-007, MOD-017 | Notifies accounting, HRMS analytics, cross-module analytics. |
| `PayrollPosted` event | SPR-MOD-008-005 | MOD-002, MOD-017 | Notifies accounting and cross-module analytics. |
| `PayslipIssued` event | SPR-MOD-008-005 | MOD-007, MOD-017 | Notifies HRMS self-service and analytics. |
| `DisbursementInitiated` event | SPR-MOD-008-005 | MOD-002, MOD-017 | Notifies accounting and analytics. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-008 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Any regression against that baseline blocks Stage 2 authoring.
- **R2 — HRMS baseline dependency.** MOD-008 assumes `MOD007_HRMS_BASELINE_v1` is published. Any regression blocks Stage 2 authoring of sprints 002–005.
- **R3 — Accounting boundary.** All ledger effects are produced by MOD-002 Accounting via `ENG-015` and `ENG-016`. MOD-008 invokes these engines; it MUST NOT redefine posting logic.
- **R4 — Identity boundary.** Identity and permissions remain owned by MOD-001. MOD-008 consumes identity read-only.
- **R5 — Analytics boundary.** Cross-module KPI definitions remain owned by MOD-017. Operational payroll reports are surfaced within MOD-008; cross-module payroll KPIs are consumed from MOD-017.
- **R6 — Statutory locale coverage.** Per-locale statutory computation depends on activated locale packs (`ENG-006`). Locales not yet activated in `docs/14-localization/` MUST NOT be added to Sprint PRD scope without first extending the localization set.
- **R7 — Optional-engine scope creep.** Optional engines (`ENG-007`, `ENG-019`, `ENG-023`, `ENG-025`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R8 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md`, no horizontal-only sprints are required for MOD-008; all sprints are vertical slices.
- **R9 — Future-enhancement scope.** Multi-country payroll harmonization and AI anomaly detection are deferred to Module PRD §14 Future Enhancements and are NOT allocated to any sprint in this plan.
- **R10 — Sprint count reconciliation.** The Estimated Sprint Count in `SPRINT_ROADMAP.md` is `4`; this plan reconciles to `6`. The roadmap MUST be updated in the same registration change that promotes this plan to `Approved`.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-008 is baseline-ready when all of the following are objectively true:

1. Every reserved Payroll Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD008_PAYROLL_BASELINE_v1` is authored under `docs/40-module-baselines/`.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no Payroll capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md` semantics.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`../../15-governance/templates/GT-002_STAGE1_AUTHORING.md`](../../15-governance/templates/GT-002_STAGE1_AUTHORING.md)
