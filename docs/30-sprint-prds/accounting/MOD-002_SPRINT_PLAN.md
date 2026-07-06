---
title: "MOD-002 Accounting — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-002 Accounting. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Finance"
status: "approved"
updated: "2026-07-06"
module_id: "MOD-002"
module_name: "Accounting"
sprint_prefix: "SPR-MOD-002-"
stage: "1"
pass: "8.3.0"
parent_module_prd: "docs/20-module-prds/accounting/MODULE_PRD.md"
workflow_stage: "Stage 1"
tags: ["sprint", "planning", "accounting", "mod-002", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-002 Accounting — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-002 Accounting** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## 1. Purpose & Scope

Plan the implementation of MOD-002 Accounting by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD and is **not** registered in `SPRINT_CATALOG.md`.

This plan introduces no new business requirements beyond the approved [MOD-002 Accounting Module PRD](../../20-module-prds/accounting/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Traceability:**

- Parent Module README — [`../../20-module-prds/accounting/README.md`](../../20-module-prds/accounting/README.md)
- Parent Module PRD — [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- Upstream module baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-002 in `SPRINT_ROADMAP.md` reflects the initial roadmap estimate. This plan reserves **six** Sprint identifiers as the Stage 1 planning baseline; the roadmap will be reconciled if Stage 2 refinement changes the count under the Planning Flexibility clause below.

## 2. Proposed Sprint Sequence

### SPR-MOD-002-001 — Accounting Foundation

- **Objective.** Establish Accounting foundations under a tenant/company: Chart of Accounts (CoA), ledger hierarchy, account classifications, accounting periods, and fiscal-year setup consistent with the platform organization structure.
- **Boundaries.**
  - In: CoA structure and lifecycle, ledger groupings, account classifications, accounting periods, fiscal calendar activation per company.
  - Out: voucher lifecycle, posting logic, financial statements, tax framework, period close.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Chart of accounts, Period configuration), §5 Master Data (Chart of Accounts, Cost Center, Bank Account skeleton), §10 Configuration (Fiscal calendar, Base/reporting currencies).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permissions, `ENG-004` Audit, `ENG-005` Configuration, `ENG-018` Currency.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (Accounting sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` for tenancy, organization structure, users/roles/permissions, configuration hierarchy, and localization.
- **Sprint Exit Criteria.**
  - CoA, ledger hierarchy, and account classifications can be created, edited, and archived under a tenant/company.
  - Accounting periods and a fiscal calendar can be defined and activated per company.
  - All structural changes are audited via `ENG-004`.
  - Base and reporting currencies resolve deterministically through `ENG-005` and `ENG-018`.

### SPR-MOD-002-002 — Voucher Framework

- **Objective.** Deliver the Accounting voucher framework consumed by every downstream Accounting flow: voucher lifecycle, numbering series, and posting workflow shell (Draft / Posted / Cancelled), atop `ENG-015` Voucher Engine.
- **Boundaries.**
  - In: voucher entity definitions (Journal, Payment, Receipt, Contra, Credit/Debit Note), voucher lifecycle state machine, numbering series binding, approval hooks, cancellation and reversal semantics.
  - Out: double-entry posting into the general ledger (next sprint), tax computation, financial statements, period close.
- **Estimated size.** Large.
- **Module PRD sections covered.** §6 Transactions (Journal / Payment / Receipt / Contra / Credit-Debit Note), §7 Business Rules (voucher balancing rule at contract level; posting-into-closed-period rule declared, enforced next), §10 Configuration (Numbering series, Approval thresholds).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-011` Approval, `ENG-015` Voucher, `ENG-017` Numbering, `ENG-024` Event. Optional: `ENG-010` Workflow, `ENG-012` Rules.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-002-001`.
- **Sprint Exit Criteria.**
  - Every voucher type in §6 can be created in `Draft`, transitioned to `Posted`, and `Cancelled` where allowed.
  - Numbering series resolve via `ENG-017` under the tenant-configured hierarchy.
  - Approvals resolve via `ENG-011`; every state transition is audited via `ENG-004`.
  - Reversal creates a new voucher; original vouchers are never mutated (per §7).

### SPR-MOD-002-003 — Journal & Ledger Posting

- **Objective.** Consume `ENG-016` Posting Engine to produce ledger effects from posted vouchers, deliver the journal and general ledger read models, and lay the trial-balance foundation.
- **Boundaries.**
  - In: posting of every voucher type into the general ledger, journal register, ledger balance projections, trial-balance skeleton (data model + query surface).
  - Out: presentation-ready P&L / Balance Sheet / Cash Flow reports (next sprint), tax posting rules, period close enforcement.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Journals and general ledger), §6 Transactions (Posting Behavior), §7 Business Rules (debits equal credits).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-015` Voucher, `ENG-016` Posting, `ENG-018` Currency, `ENG-024` Event. Optional: `ENG-012` Rules, `ENG-020` Search.
- **ADRs consumed.** `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-002-002`.
- **Sprint Exit Criteria.**
  - Every `Posted` voucher produces balanced ledger entries via `ENG-016`.
  - Journal register and general ledger read models return correct balances for any account across any date range within an open period.
  - Trial Balance data query returns zero-net across all accounts for any consistent set of posted vouchers.
  - `VoucherPosted` event is published via `ENG-024` for every successful post.

### SPR-MOD-002-004 — Financial Statements

- **Objective.** Deliver the Accounting financial-statement surface — Trial Balance, Profit & Loss, Balance Sheet, Cash Flow, and General Ledger reports — atop the ledger projections from SPR-003.
- **Boundaries.**
  - In: report definitions and layouts, ledger-driven aggregations, currency presentation, drill-down from statement lines to journal register, export.
  - Out: dashboard KPIs (owned by MOD-017 Analytics), consolidation across companies, tax filings.
- **Estimated size.** Large.
- **Module PRD sections covered.** §9 Reports & Analytics (Trial Balance, P&L, Balance Sheet, Cash Flow), §2 Business Scope (Reports), §10 Configuration (Base and reporting currencies).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-018` Currency, `ENG-021` Reporting, `ENG-027` Export. Optional: `ENG-022` Dashboard, `ENG-020` Search.
- **ADRs consumed.** `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-002-003`.
- **Sprint Exit Criteria.**
  - Trial Balance, P&L, Balance Sheet, Cash Flow, and General Ledger render deterministically from ledger projections.
  - Statements reconcile: P&L + Balance Sheet movements are internally consistent for any date range.
  - Currency presentation follows `ENG-018` for base and reporting currency.
  - Exports produce standard formats via `ENG-027`.

### SPR-MOD-002-005 — Taxation & Compliance Foundation

- **Objective.** Deliver the Accounting-side tax framework: tax code configuration, tax posting on vouchers via `ENG-019` Tax Engine, and the compliance readiness surface required by downstream filing.
- **Boundaries.**
  - In: Tax Code master data, tax-rate resolution, tax computation and posting on vouchers, tax summary report, compliance-ready dataset for filing.
  - Out: e-filing gateway integration, jurisdiction-specific filing UIs, tax authority connectors beyond baseline.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Tax accounting), §5 Master Data (Tax Code), §9 Reports & Analytics (Tax Summary), §8 Integration Points (Tax filing gateway — outbound contract shape only).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-016` Posting, `ENG-018` Currency, `ENG-019` Tax, `ENG-021` Reporting, `ENG-024` Event. Optional: `ENG-023` Integration.
- **ADRs consumed.** `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-002-003` (posting); may be authored in parallel with `SPR-MOD-002-004` provided ledger contracts remain stable.
- **Sprint Exit Criteria.**
  - Tax codes can be configured per tenant/company and resolved on every taxable voucher.
  - Tax posting produces balanced ledger effects via `ENG-016` in the correct tax control accounts.
  - Tax Summary report is generated for any period via `ENG-021`.
  - Compliance-ready dataset is exportable via `ENG-027` for downstream filing.

### SPR-MOD-002-006 — Period Close & Audit

- **Objective.** Deliver fiscal period close: locking, reopening, closing adjustments, retained-earnings roll-forward, and the audit support surface that closes the loop on Accounting.
- **Boundaries.**
  - In: period locking and reopening, closing adjustment vouchers, retained-earnings roll-forward, close checklist, audit review surface for Accounting events.
  - Out: cross-company consolidation, continuous-close automation, external auditor portal.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Period close and consolidation — close only), §6 Transactions (closing adjustments), §7 Business Rules (a closed period cannot be posted into), §11 Non-functional (retention for audit).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-011` Approval, `ENG-015` Voucher, `ENG-016` Posting, `ENG-021` Reporting, `ENG-024` Event, `ENG-027` Export. Optional: `ENG-010` Workflow, `ENG-025` Notification.
- **ADRs consumed.** `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-002-004`, `SPR-MOD-002-005` (period close consumes all posted ledger and tax data).
- **Sprint Exit Criteria.**
  - A period can be `Closed` (locked), `Reopened`, and `Finally-Closed` under approval.
  - Posting into a `Closed` period is refused deterministically per §7.
  - Retained-earnings roll-forward is produced at fiscal-year close and matches Balance Sheet equity movement.
  - `PeriodClosed` event is published via `ENG-024`.
  - Audit review surface exposes every Accounting event emitted during the sprint sequence.

### Planning Flexibility

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-002-001 (Accounting Foundation)
         │
         ▼
SPR-MOD-002-002 (Voucher Framework)
         │
         ▼
SPR-MOD-002-003 (Journal & Ledger Posting)
        ├─────────────────────────┐
        ▼                         ▼
SPR-MOD-002-004 (Financials)   SPR-MOD-002-005 (Tax & Compliance)
        └────────────┬────────────┘
                     ▼
       SPR-MOD-002-006 (Period Close & Audit)
```

The sequence is a directed acyclic graph: sprints 001 → 002 → 003 are strictly linear; 004 and 005 branch from 003 and MAY be authored in parallel provided ledger contracts remain stable; 006 consumes both branches and closes the module.

## 4. Engine Consumption Map

Derived from Accounting Module PRD §12 (Required: `ENG-001..008`, `011`, `015..019`, `021`, `024`, `026`, `027`; Optional: `ENG-010`, `012`, `020`, `022`, `023`, `025`, `028`). No engine behavior is redefined.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-007 | ENG-008 | ENG-011 | ENG-015 | ENG-016 | ENG-017 | ENG-018 | ENG-019 | ENG-021 | ENG-024 | ENG-027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-002-001 | ● | ● | ● | ● | ● |   |   |   |   |   |   | ● |   |   |   |   |
| SPR-MOD-002-002 |   | ● |   | ● |   | ● | ● | ● | ● |   | ● |   |   |   | ● |   |
| SPR-MOD-002-003 |   | ● |   | ● |   |   |   |   | ● | ● |   | ● |   |   | ● |   |
| SPR-MOD-002-004 |   | ● |   | ● |   |   |   |   |   |   |   | ● |   | ● |   | ● |
| SPR-MOD-002-005 |   | ● |   | ● |   |   |   |   |   | ● |   | ● | ● | ● | ● |   |
| SPR-MOD-002-006 |   | ● |   | ● |   |   |   | ● | ● | ● |   |   |   | ● | ● | ● |

Optional engines (`ENG-010`, `012`, `020`, `022`, `023`, `025`, `028`) MAY be consumed during Stage 2 authoring per the Module PRD; they are not tabulated as required consumption.

## 5. ADR Consumption Map

Accepted ADRs only, per Accounting Module PRD (`ADR-011`, `ADR-014`, `ADR-032`) plus supporting Accepted ADRs referenced by the engines consumed above.

| Sprint | ADR-011 | ADR-014 | ADR-032 |
| --- | :-: | :-: | :-: |
| SPR-MOD-002-001 | ● | ● | ● |
| SPR-MOD-002-002 | ● | ● | ● |
| SPR-MOD-002-003 |   | ● | ● |
| SPR-MOD-002-004 |   | ● | ● |
| SPR-MOD-002-005 |   | ● | ● |
| SPR-MOD-002-006 |   | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 6. Cross-Sprint Dependency Matrix

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Chart of Accounts & fiscal calendar | SPR-MOD-002-001 | 002, 003, 004, 005, 006 | Foundational; every later sprint assumes CoA and fiscal periods. |
| Voucher lifecycle & numbering | SPR-MOD-002-002 | 003, 005, 006 | Posting, tax, and period close all operate on posted vouchers. |
| Ledger projections | SPR-MOD-002-003 | 004, 005, 006 | Financials, tax posting, and close all read the ledger. |
| Tax codes & tax posting | SPR-MOD-002-005 | 006 | Period close verifies tax-account balances. |
| `VoucherPosted` event | SPR-MOD-002-003 | 004, 005, 006 | Downstream reports and close consume the event stream. |
| `PeriodClosed` event | SPR-MOD-002-006 | External modules (MOD-003, 004, 008, 015, 017) | Emitted at module boundary; not consumed within MOD-002. |
| Bank Account master data | SPR-MOD-002-001 (skeleton) | 002, 003, 005, 006 | Owned by Accounting per §5; sub-ledger reconciliation is out of scope for this plan. |
| Numbering series configuration | SPR-MOD-002-001 (registration) | 002, 006 | Numbering resolved via `ENG-017` at voucher creation. |

## 7. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-002 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen and available. Any regression against that baseline blocks Stage 2 authoring of MOD-002 sprints until the platform baseline is amended via a new versioned baseline.
- **R2 — Optional-engine scope creep.** Optional engines (`ENG-010`, `012`, `020`, `022`, `023`, `025`, `028`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R3 — Parallel authoring of sprints 004 and 005.** Both branch from sprint 003. Parallel authoring is permitted only while ledger contracts remain stable; if sprint 004 changes ledger read models, sprint 005 MUST re-baseline against the updated contract.
- **R4 — Consolidation across companies.** Cross-company consolidation is explicitly deferred (Module PRD §14 Future Enhancements) and MUST NOT be folded into sprint 006.
- **R5 — Filing gateways.** External tax and e-invoice gateways (§8) are contract-shape-only in sprint 005; concrete gateway integrations are scheduled as later Sprint PRDs or a separate module, not folded into MOD-002.
- **R6 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md` §3, no horizontal-only sprints are required for MOD-002 beyond the sequence above; all sprints are vertical slices.

## 8. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-002 is baseline-ready when all of the following are objectively true:

1. Every reserved Accounting Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD002_ACCOUNTING_BASELINE_v1` is authored under `docs/40-module-baselines/` per the repository-standard Stage 3 location.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD; no Accounting capability sits outside the baseline.
5. All engines and ADRs listed in §4 and §5 are `Accepted` at baseline time.
6. Downstream modules (MOD-003 Sales, MOD-004 Purchase, MOD-008 Payroll, MOD-015 POS, MOD-017 Analytics) MAY consume the frozen Accounting baseline without further coordination with the Accounting sprint sequence.

Failure to meet any criterion blocks the Stage 3 pass for Accounting. Any post-freeze change requires a new versioned baseline (`MOD002_ACCOUNTING_BASELINE_v2`).

## 9. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, `SPRINT_CATALOG.md`, or `MODULE_BASELINE_CATALOG.md`.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes and Estimated Sprint Count remain planning estimates, not implementation commitments.

## 10. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
