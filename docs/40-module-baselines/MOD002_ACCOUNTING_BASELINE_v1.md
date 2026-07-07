---
title: "MOD002_ACCOUNTING_BASELINE_v1 — Accounting Module Baseline"
summary: "Stage 3 Module Baseline for MOD-002 Accounting. Freezes the module after successful completion of Sprint PRDs SPR-MOD-002-001..006. Reference consolidation only — introduces no new requirements, engines, ADRs, or Sprint PRDs."
baseline_id: "MOD002_ACCOUNTING_BASELINE_v1"
module_id: "MOD-002"
module_name: "Accounting"
version: "1.0"
status: "Frozen"
owner: "Accounting"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/accounting/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-002-001", "SPR-MOD-002-002", "SPR-MOD-002-003", "SPR-MOD-002-004", "SPR-MOD-002-005", "SPR-MOD-002-006"]
layer: "delivery"
updated: "2026-07-07"
tags: ["baseline", "module", "MOD-002", "accounting", "stage-3", "freeze"]
document_type: "Module Baseline"
---

# MOD002_ACCOUNTING_BASELINE_v1 — Accounting Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-002. It introduces no new requirements, engines, ADRs, or Sprint PRDs. Future changes to Accounting scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD002_ACCOUNTING_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD002_ACCOUNTING_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the Accounting module (`MOD-002`). It certifies that:

- Every Sprint PRD reserved in [`MOD-002_SPRINT_PLAN.md`](../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md) (`SPR-MOD-002-001` … `SPR-MOD-002-006`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

The module is now frozen for downstream consumption. It becomes the authoritative inter-module Accounting contract; downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required.

## 2. Module Scope

Restates capabilities from the [MOD-002 Module PRD](../20-module-prds/accounting/MODULE_PRD.md); reference only. Accounting owns:

- Chart of Accounts and ledger hierarchy.
- Fiscal year, accounting periods, and base accounting configuration.
- Voucher Framework — canonical voucher lifecycle across voucher types, numbering, approvals, cancellation, reversal, immutability after posting.
- Journal creation from posted vouchers and Ledger Posting to General Ledger and sub-ledgers.
- Ledger balance computation per account, tenant, currency, and period.
- Financial Statements — Trial Balance, General Ledger, Profit & Loss, Balance Sheet, Cash Flow — as deterministic projections of authoritative ledger movements.
- Taxation & Compliance Foundation — tax master data, applicability, determination, classifications, tax reporting semantics, and tax posting preparation.
- Period Close & Audit — accounting period lifecycle (Open / Soft Close / Close / Reopen), financial-year close, closing adjustment governance, opening balance preparation, accounting lock rules, and business-level accounting audit review over Platform Audit outputs.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition.

## 3. Implemented Sprint Summary

Each subsection below includes the sprint's purpose, major business capabilities, and completion status (**Done**) — reflecting the Sprint Catalog transition performed by Pass 8.3.Z.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-002-001](../30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md) | Accounting Foundation | Done | Chart of Accounts, ledger hierarchy, account classifications, fiscal year and accounting periods, base accounting configuration, currency foundation defaults, opening balance readiness, and Accounting Ownership Convention. |
| [SPR-MOD-002-002](../30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md) | Voucher Framework | Done | Canonical voucher lifecycle, voucher types, numbering series binding, approval hooks, cancellation and reversal semantics, immutability after posting, cross-module voucher creation contract, and Voucher Ownership Convention. |
| [SPR-MOD-002-003](../30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md) | Journal & Ledger Posting | Done | Journal entry creation from posted vouchers, ledger posting to General Ledger and sub-ledgers, ledger balance computation, posting-time period-state validation (consume-only), reversal posting, and the Ledger Posting Ownership, Ledger Immutability, Balance Integrity, and Ledger Access Boundary conventions. |
| [SPR-MOD-002-004](../30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md) | Financial Statements | Done | Trial Balance, General Ledger, Profit & Loss, Balance Sheet, and Cash Flow as deterministic projections of ledger state, plus the Financial Reporting Ownership, Ledger Consumption, Report Determinism, Reporting Read Model, and Financial Statement Boundary conventions. |
| [SPR-MOD-002-005](../30-sprint-prds/accounting/SPR-MOD-002-005-taxation-compliance-foundation.md) | Taxation & Compliance Foundation | Done | Tax master data, applicability, determination, classifications, tax reporting semantics, tax posting preparation, and the Tax Ownership, Tax Calculation Boundary, Tax Configuration Authority, Compliance Readiness, and Tax Reporting Boundary conventions. |
| [SPR-MOD-002-006](../30-sprint-prds/accounting/SPR-MOD-002-006-period-close-audit.md) | Period Close & Audit | Done | Accounting period lifecycle, financial-year close, closing adjustment governance, opening balance preparation, accounting lock rules, business-level accounting audit review, and the Period Authority, Financial Year Ownership, Period Close Boundary, Controlled Reopening, Audit Review Boundary, and Financial Freeze conventions. |

## 4. Capability Coverage

Every Module PRD capability traces to at least one Sprint PRD.

| MOD-002 Capability Area | Sprint(s) |
| --- | --- |
| Chart of Accounts and ledger hierarchy | SPR-MOD-002-001 |
| Fiscal year and accounting periods (foundation) | SPR-MOD-002-001 |
| Voucher Framework (lifecycle, numbering, approvals, cancellation, reversal, immutability) | SPR-MOD-002-002 |
| Journal creation and Ledger Posting | SPR-MOD-002-003 |
| Ledger balance computation and reversal posting | SPR-MOD-002-003 |
| Financial Statements (Trial Balance, GL, P&L, Balance Sheet, Cash Flow) | SPR-MOD-002-004 |
| Taxation & Compliance Foundation | SPR-MOD-002-005 |
| Period lifecycle, financial-year close, opening balances, closing adjustment governance | SPR-MOD-002-006 |
| Accounting audit review (consuming Platform Audit) | SPR-MOD-002-006 |
| Accounting governance conventions (all 22 listed in §7) | Established across SPR-MOD-002-001 … SPR-MOD-002-006 |

No Accounting capability sits outside the baseline; no orphans.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-002-001` through `SPR-MOD-002-006`.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-002-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-002-002, 003, 004, 005, 006 |
| ENG-004 (Audit Engine) | SPR-MOD-002-001, 002, 003, 004, 005, 006 |
| ENG-005 (Event Engine) | SPR-MOD-002-001 |
| ENG-007 (Document Engine) | SPR-MOD-002-002 |
| ENG-008 (Attachment Engine) | SPR-MOD-002-002 |
| ENG-011 (Approval Engine) | SPR-MOD-002-002, 005, 006 |
| ENG-012 (Rules Engine) | SPR-MOD-002-005 |
| ENG-015 (Voucher Engine) | SPR-MOD-002-001, 002, 003 |
| ENG-016 (Posting Engine) | SPR-MOD-002-001, 003 |
| ENG-017 (Numbering Engine) | SPR-MOD-002-002 |
| ENG-018 (Currency Engine) | SPR-MOD-002-003, 004, 005, 006 |
| ENG-021 (Reporting Engine) | SPR-MOD-002-003, 004, 005, 006 |
| ENG-024 (Configuration Engine) | SPR-MOD-002-001, 002, 003, 004, 005, 006 |

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-002-001` through `SPR-MOD-002-006`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-002-001, 002, 003, 004, 005, 006 |
| ADR-012 (UUID Primary Keys) | SPR-MOD-002-001 |
| ADR-013 (Money Representation) | SPR-MOD-002-003, 004, 005, 006 |
| ADR-014 (Audit Strategy) | SPR-MOD-002-001, 002, 003, 004, 005, 006 |
| ADR-015 (Soft Delete Policy) | SPR-MOD-002-003 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-002-001, 002, 003, 004, 005, 006 |
| ADR-051 (Transactional Outbox) | SPR-MOD-002-001, 002, 003, 004, 005, 006 |
| ADR-053 (Idempotency) | SPR-MOD-002-003, 004, 005, 006 |

## 7. Governance Conventions Established

Every governance convention established across Accounting Sprint PRDs 001–006 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-002-001 — Accounting Foundation**

- **Accounting Ownership Convention** — Accounting owns Chart of Accounts, ledger hierarchy, fiscal calendar, accounting periods, base accounting configuration, and opening balance readiness for every legal entity. Downstream modules consume this state and never redefine it.

**From SPR-MOD-002-002 — Voucher Framework**

- **Voucher Ownership Convention** — Accounting owns the canonical voucher lifecycle, voucher types, numbering series binding, approval hooks, cancellation and reversal semantics, and immutability after posting. Cross-module voucher creation occurs only through the Accounting voucher contract.

**From SPR-MOD-002-003 — Journal & Ledger Posting**

- **Ledger Posting Ownership Convention** — Accounting exclusively owns journal creation from posted vouchers and ledger posting to General Ledger and sub-ledgers.
- **Ledger Immutability Convention** — Posted ledger movements are immutable; corrections occur only through reversal postings that preserve historical integrity.
- **Balance Integrity Convention** — Ledger balances are deterministic aggregations of authoritative ledger movements per account, tenant, currency, and period.
- **Ledger Access Boundary Convention** — Downstream modules consume ledger state only through Accounting; direct writes to ledger tables are forbidden.

**From SPR-MOD-002-004 — Financial Statements**

- **Financial Reporting Ownership Convention** — Accounting owns Trial Balance, General Ledger, Profit & Loss, Balance Sheet, and Cash Flow as authoritative Accounting reports.
- **Ledger Consumption Convention** — Financial statements are built exclusively on authoritative ledger movements produced by SPR-MOD-002-003.
- **Report Determinism Convention** — Financial statements are deterministic projections of ledger state; identical inputs produce identical outputs.
- **Reporting Read Model Convention** — Financial statements consume the ledger read model and do not mutate ledger, voucher, or journal state.
- **Financial Statement Boundary Convention** — Financial statements MUST NOT create vouchers, modify journals, or modify ledger entries.

**From SPR-MOD-002-005 — Taxation & Compliance Foundation**

- **Tax Ownership Convention** — Accounting owns tax master data, applicability, determination, classifications, and tax reporting semantics.
- **Tax Calculation Boundary Convention** — Tax calculation is confined to the taxation surface; it MUST NOT create vouchers, modify journals, modify ledger entries, or generate financial statements.
- **Tax Configuration Authority Convention** — Tax configuration is owned by Accounting and resolved through the Platform configuration hierarchy.
- **Compliance Readiness Convention** — The taxation foundation prepares authoritative Accounting state for downstream statutory filing; statutory filing itself remains out of scope.
- **Tax Reporting Boundary Convention** — Tax reports are Accounting reports; external statutory filing consumes them and never redefines them.

**From SPR-MOD-002-006 — Period Close & Audit**

- **Period Authority Convention** — Accounting exclusively owns period lifecycle states (Open, Soft Closed, Closed, Reopened).
- **Financial Year Ownership Convention** — Accounting owns fiscal year close, year-end carry forward, opening balance preparation, and closing adjustment governance.
- **Period Close Boundary Convention** — Period Close determines whether posting is permitted; it MUST NOT create vouchers, modify journals, modify ledger entries, calculate taxes, or generate financial statements.
- **Controlled Reopening Convention** — Closed periods may be reopened only through authorized accounting governance; every reopening is fully audited and preserves historical integrity; no accounting history is ever deleted.
- **Audit Review Boundary Convention** — Accounting owns business-level accounting audit review; Platform Audit (`ENG-004`, MOD-001) remains authoritative for audit collection, storage, integrity, and lifecycle. Accounting consumes Platform audit services.
- **Financial Freeze Convention** — Once a period reaches Closed, accounting movements are frozen; downstream modules consume the closed state; subsequent corrections occur only through controlled reopening.

All 22 conventions above complement — and do not replace — the Platform governance conventions established in `MOD001_PLATFORM_BASELINE_v1` (Event Ownership, Effective Configuration, Configuration Ownership, Localization Ownership, Audit Ownership).

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-002-001` through `SPR-MOD-002-006`.** Every referenced event exists in [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md) or has been recorded as a deferred `R-EV-*` risk in the originating Sprint PRD. The Event Catalog remains the sole authoritative source and is not modified by this baseline. Deferred `R-EV-*` risks are inherited from their originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD002_ACCOUNTING_BASELINE_v1` as an upstream contract. They MUST NOT own accounting master data, post directly to ledgers, create independent voucher lifecycles, redefine accounting reports, or redefine accounting periods. Module IDs are used for repository-wide traceability consistency.

- MOD-003 Sales
- MOD-004 Purchase
- MOD-005 Inventory
- MOD-008 Payroll
- MOD-015 POS
- MOD-017 Projects
- MOD-018 Analytics

## 10. Module Completion & Freeze Statement

All six planned Accounting Sprint PRDs (`SPR-MOD-002-001` … `SPR-MOD-002-006`) exist, the [Sprint Plan](../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md) is executed, and repository verification has been completed. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-002 Accounting is now frozen for downstream consumption. Future changes to Accounting scope, capabilities, or governance conventions MUST occur through a subsequent documented baseline revision (e.g., `MOD002_ACCOUNTING_BASELINE_v2`) rather than by modifying this baseline in place. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD002_ACCOUNTING_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Statutory filing to government portals.
- Government tax integrations (GST/GSTN, e-invoicing/IRN, e-way bill).
- E-invoicing and e-way bill generation and transmission.
- Consolidation across companies and legal entities.
- Budgeting and forecasting.
- AI-driven accounting analysis and reconciliation.
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/accounting/MODULE_PRD.md`](../20-module-prds/accounting/MODULE_PRD.md) — MOD-002 Module PRD (authoritative).
- [`docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`](../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md`](../30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md)
- [`docs/30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md`](../30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md)
- [`docs/30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md`](../30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md)
- [`docs/30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md`](../30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md)
- [`docs/30-sprint-prds/accounting/SPR-MOD-002-005-taxation-compliance-foundation.md`](../30-sprint-prds/accounting/SPR-MOD-002-005-taxation-compliance-foundation.md)
- [`docs/30-sprint-prds/accounting/SPR-MOD-002-006-period-close-audit.md`](../30-sprint-prds/accounting/SPR-MOD-002-006-period-close-audit.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring framework.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
