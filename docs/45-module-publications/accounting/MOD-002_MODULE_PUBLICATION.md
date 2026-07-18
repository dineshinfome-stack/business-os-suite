---
title: "MOD-002 Module Publication — Accounting"
summary: "GT-005 Module Publication for MOD-002 Accounting. Terminal governance artifact derived exclusively from MOD002_ACCOUNTING_BASELINE_v1. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-002_MODULE_PUBLICATION"
publication_id: "MOD-002_MODULE_PUBLICATION"
module_id: "MOD-002"
module_name: "Accounting"
version: "1.0"
status: "Published"
owner: "Accounting"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/accounting/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md"
source_module: "MOD-002"
source_sprints: ["SPR-MOD-002-001", "SPR-MOD-002-002", "SPR-MOD-002-003", "SPR-MOD-002-004", "SPR-MOD-002-005", "SPR-MOD-002-006"]
layer: "delivery"
updated: "2026-07-19"
tags: ["publication", "module", "MOD-002", "accounting", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD002-20260719T040000Z-001"
parent_execution_id: "MOD002-KICKOFF-20260719T020000Z-001"
previous_audit_report_id: "MOD002_KICKOFF_VERIFICATION_20260719T030000Z"
related_engines: ["ENG-001", "ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-011", "ENG-012", "ENG-015", "ENG-016", "ENG-017", "ENG-018", "ENG-021", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-013", "ADR-014", "ADR-015", "ADR-032", "ADR-051", "ADR-053"]
related_modules: ["MOD-001", "MOD-003", "MOD-004", "MOD-005", "MOD-008", "MOD-015", "MOD-017"]
---

# MOD-002 Module Publication — Accounting

> **Reference publication only.** This publication is a faithful representation of [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md). It introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-002
- **Module Name:** Accounting
- **Owner:** Accounting (Finance)
- **Publication ID:** MOD-002_MODULE_PUBLICATION
- **Source Baseline:** `MOD002_ACCOUNTING_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`](../../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-002-001` … `SPR-MOD-002-006`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

Accounting is the authoritative bounded context for the General Ledger and sub-ledgers of every legal entity. It owns the Chart of Accounts, fiscal calendar and accounting periods, the canonical Voucher Framework, journal creation and ledger posting, financial statements as deterministic ledger projections, taxation & compliance foundation, and period close & audit review. Downstream modules consume Accounting state and never redefine it.

## 3. Approved Scope

Restates the scope consolidated in `MOD002_ACCOUNTING_BASELINE_v1` §2. Accounting owns:

- Chart of Accounts and ledger hierarchy.
- Fiscal year, accounting periods, and base accounting configuration.
- Voucher Framework — canonical voucher lifecycle across voucher types, numbering, approvals, cancellation, reversal, and immutability after posting.
- Journal creation from posted vouchers and Ledger Posting to General Ledger and sub-ledgers.
- Ledger balance computation per account, tenant, currency, and period.
- Financial Statements — Trial Balance, General Ledger, Profit & Loss, Balance Sheet, and Cash Flow — as deterministic projections of authoritative ledger movements.
- Taxation & Compliance Foundation — tax master data, applicability, determination, classifications, tax reporting semantics, and tax posting preparation.
- Period Close & Audit — accounting period lifecycle (Open / Soft Close / Close / Reopen), financial-year close, closing adjustment governance, opening balance preparation, accounting lock rules, and business-level accounting audit review over Platform Audit outputs.

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Every authority is inherited verbatim from the Module Baseline. This publication restates them for consumer convenience; the Module Baseline remains authoritative.

### 4.1 SPR-MOD-002-001 — Accounting Foundation

- **Accounting Ownership Convention Authority** — Chart of Accounts, ledger hierarchy, fiscal calendar, accounting periods, base accounting configuration, and opening balance readiness per legal entity.

### 4.2 SPR-MOD-002-002 — Voucher Framework

- **Voucher Ownership Convention Authority** — canonical voucher lifecycle, voucher types, numbering series binding, approval hooks, cancellation and reversal semantics, and immutability after posting; cross-module voucher creation occurs only through the Accounting voucher contract.

### 4.3 SPR-MOD-002-003 — Journal & Ledger Posting

- **Ledger Posting Ownership Convention Authority** — journal creation from posted vouchers and ledger posting to General Ledger and sub-ledgers.
- **Ledger Immutability Convention Authority** — posted ledger movements are immutable; corrections occur only through reversal postings preserving historical integrity.
- **Balance Integrity Convention Authority** — deterministic aggregation of ledger movements per account, tenant, currency, and period.
- **Ledger Access Boundary Convention Authority** — downstream modules consume ledger state only through Accounting; direct writes to ledger tables are forbidden.

### 4.4 SPR-MOD-002-004 — Financial Statements

- **Financial Reporting Ownership Convention Authority** — Trial Balance, General Ledger, Profit & Loss, Balance Sheet, and Cash Flow as authoritative Accounting reports.
- **Ledger Consumption Convention Authority** — financial statements built exclusively on authoritative ledger movements.
- **Report Determinism Convention Authority** — identical inputs produce identical outputs.
- **Reporting Read Model Convention Authority** — statements consume the ledger read model and do not mutate ledger, voucher, or journal state.
- **Financial Statement Boundary Convention Authority** — statements MUST NOT create vouchers, modify journals, or modify ledger entries.

### 4.5 SPR-MOD-002-005 — Taxation & Compliance Foundation

- **Tax Ownership Convention Authority** — tax master data, applicability, determination, classifications, and tax reporting semantics.
- **Tax Calculation Boundary Convention Authority** — tax calculation is confined to the taxation surface; it MUST NOT create vouchers, modify journals, modify ledger entries, or generate financial statements.
- **Tax Configuration Authority Convention** — tax configuration resolved through the Platform configuration hierarchy.
- **Compliance Readiness Convention Authority** — prepares authoritative Accounting state for downstream statutory filing; filing itself remains out of scope.
- **Tax Reporting Boundary Convention Authority** — tax reports are Accounting reports; external statutory filing consumes them and never redefines them.

### 4.6 SPR-MOD-002-006 — Period Close & Audit

- **Period Authority Convention Authority** — period lifecycle states (Open, Soft Closed, Closed, Reopened).
- **Financial Year Ownership Convention Authority** — fiscal year close, year-end carry forward, opening balance preparation, and closing adjustment governance.
- **Period Close Boundary Convention Authority** — Period Close determines whether posting is permitted; it MUST NOT create vouchers, modify journals, modify ledger entries, calculate taxes, or generate financial statements.
- **Controlled Reopening Convention Authority** — closed periods may be reopened only through authorized accounting governance; every reopening is audited and preserves historical integrity.
- **Audit Review Boundary Convention Authority** — Accounting owns business-level accounting audit review; `ENG-004` (via MOD-001) remains authoritative for audit collection, storage, integrity, and lifecycle.
- **Financial Freeze Convention Authority** — once a period reaches Closed, accounting movements are frozen; downstream modules consume the closed state; corrections occur only through controlled reopening.

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-002-001` … `SPR-MOD-002-006`) as consolidated in `MOD002_ACCOUNTING_BASELINE_v1`. This publication introduces no new requirements. See the source Sprint PRDs for requirement-level detail.

## 6. Business Rules

Business rules are inherited verbatim from the Sprint PRD family as consolidated in the Module Baseline. Key rule invariants:

- Every posted voucher balances: debits equal credits.
- Posted ledger movements are immutable; corrections occur through reversal postings only.
- A closed period cannot be posted into.
- Reversal creates a new voucher; original vouchers are never mutated.
- Tax calculation MUST NOT create vouchers, modify journals, or modify ledger entries.
- Financial statements are deterministic projections and MUST NOT mutate ledger, voucher, or journal state.
- Downstream modules consume ledger state only through Accounting; direct ledger writes are forbidden.

## 7. Master Data Authorities

Inherited verbatim from the Module Baseline (Module PRD §5):

| Master Data Entity | Originating Sprint |
| --- | --- |
| Chart of Accounts | SPR-MOD-002-001 |
| Cost Center | SPR-MOD-002-001 |
| Bank Account | SPR-MOD-002-001 |
| Fiscal Year / Accounting Period | SPR-MOD-002-001 |
| Voucher Type | SPR-MOD-002-002 |
| Numbering Series (Accounting-owned) | SPR-MOD-002-002 |
| Tax Code | SPR-MOD-002-005 |
| Customer AR Balance (sub-ledger) | SPR-MOD-002-003 |
| Supplier AP Balance (sub-ledger) | SPR-MOD-002-003 |

## 8. Transaction Authorities

Inherited verbatim from the Module Baseline (Module PRD §6):

| Transaction | Originating Sprint |
| --- | --- |
| Journal Voucher | SPR-MOD-002-002 |
| Payment Voucher | SPR-MOD-002-002 |
| Receipt Voucher | SPR-MOD-002-002 |
| Contra Voucher | SPR-MOD-002-002 |
| Credit / Debit Note | SPR-MOD-002-002 |
| Journal Entry (from posted voucher) | SPR-MOD-002-003 |
| Ledger Posting | SPR-MOD-002-003 |
| Reversal Posting | SPR-MOD-002-003 |
| Closing Adjustment Voucher | SPR-MOD-002-006 |
| Opening Balance Entry | SPR-MOD-002-006 |

## 9. Published Events

Emitted via `ENG-005` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by Accounting; delivery infrastructure owned by Platform.

- `VoucherPosted` — SPR-MOD-002-003
- `PeriodClosed` — SPR-MOD-002-006
- `PaymentRecorded` — SPR-MOD-002-002 / 003
- `ReceiptRecorded` — SPR-MOD-002-002 / 003
- `BankReconciled` — SPR-MOD-002-003 (contract shape)

## 10. Consumed Events

Consumed from upstream business modules via `ENG-005`. Consumption is read-only; Accounting does not own the semantics of these events.

- `SalesInvoiceIssued` (MOD-003)
- `PurchaseInvoiceReceived` (MOD-004)
- `PayrollPosted` (MOD-008)
- `POSDayClosed` (MOD-015)
- `InventoryValuationChanged` (MOD-005)

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-002 via their Capability Interfaces. Engine set is inherited verbatim from `MOD002_ACCOUNTING_BASELINE_v1` §5:

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

Related ADRs (all `Accepted`, inherited from `MOD002_ACCOUNTING_BASELINE_v1` §6): `ADR-011` (Multi-Tenant Isolation), `ADR-012` (UUID Primary Keys), `ADR-013` (Money Representation), `ADR-014` (Audit Strategy), `ADR-015` (Soft Delete Policy), `ADR-032` (RBAC + ABAC), `ADR-051` (Transactional Outbox), `ADR-053` (Idempotency).

## 12. Dependencies

Inherited verbatim from `MOD002_ACCOUNTING_BASELINE_v1` §9 and the Module PRD §13:

**Upstream contracts consumed by Accounting:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit review surface.

**Downstream consumers of Accounting:**

- MOD-003 Sales, MOD-004 Purchase, MOD-005 Inventory, MOD-008 Payroll, MOD-015 POS, MOD-017 Analytics.

## 13. Ownership Boundaries

Inherited verbatim from `MOD002_ACCOUNTING_BASELINE_v1` §7 and §9:

- MOD-002 owns **only** the authorities enumerated in §4 of this publication.
- Downstream modules MUST NOT own accounting master data, post directly to ledgers, create independent voucher lifecycles, redefine accounting reports, or redefine accounting periods.
- `ENG-004` remains authoritative for audit collection, storage, integrity, and lifecycle; Accounting owns only the business-level accounting audit review surface.
- `ENG-005` remains authoritative for event delivery infrastructure; Accounting owns the semantics of the events it emits.
- Statutory filing, government tax integrations (GST/GSTN, e-invoicing/IRN, e-way bill), consolidation across companies, budgeting/forecasting, and AI-driven accounting analysis are explicitly out of scope (see §15).

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`](../../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | [`SPR-MOD-002-001`](../../30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md) · [`002`](../../30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md) · [`003`](../../30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md) · [`004`](../../30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md) · [`005`](../../30-sprint-prds/accounting/SPR-MOD-002-005-taxation-compliance-foundation.md) · [`006`](../../30-sprint-prds/accounting/SPR-MOD-002-006-period-close-audit.md) |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |
| Lifecycle Kickoff | [`MOD002_LIFECYCLE_KICKOFF_20260719T020000Z`](../../50-audit-reports/MOD002_LIFECYCLE_KICKOFF_20260719T020000Z.md) |
| Kickoff Verification | [`MOD002_KICKOFF_VERIFICATION_20260719T030000Z`](../../50-audit-reports/MOD002_KICKOFF_VERIFICATION_20260719T030000Z.md) |

## 15. Non-Goals

Inherited verbatim from `MOD002_ACCOUNTING_BASELINE_v1` §11:

- Statutory filing to government portals.
- Government tax integrations (GST/GSTN, e-invoicing/IRN, e-way bill).
- E-invoicing and e-way bill generation and transmission.
- Consolidation across companies and legal entities.
- Budgeting and forecasting.
- AI-driven accounting analysis and reconciliation.
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and inherited from the MOD-001 reference pattern (Pass 33.1.0 identifier alignment applied), Phase 3 Solution Design proceeds in the sequence:

`WEB-002 → MOB-002 → API-002`

- Next executable pass: **WEB-002 Accounting Solution Design**.
- Subsequent passes: MOB-002, then API-002.

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority enumerated in §4 is inherited verbatim from `MOD002_ACCOUNTING_BASELINE_v1`.
2. Engine and ADR sets in §11 match the Module Baseline §5–§6 exactly.
3. Downstream dependency set in §12 matches the Module Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0 (per `GOVERNANCE_FRONTMATTER_STANDARD.md`)
- **Governance Specification:** v1.0
- **Execution Wrapper:** FROZEN v1.0
- **Execution ID:** `GT005-MOD002-20260719T040000Z-001`
- **Parent Execution ID:** `MOD002-KICKOFF-20260719T020000Z-001`
- **Previous Audit Report:** `MOD002_KICKOFF_VERIFICATION_20260719T030000Z`
- **Emitted Audit Report:** `MOD002_PUBLICATION_VERIFICATION_20260719T040000Z`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD002_PUBLICATION_COMPLETE` → ready for `WEB-002 Accounting Solution Design`
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD002_ACCOUNTING_BASELINE_v2`), through a separately approved governance process.

## 19. Repository State Transition

`MOD002_LIFECYCLE_INITIATED` → **`MOD002_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- [`docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`](../../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md)
- [`docs/45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md`](../platform/MOD-001_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`](../../15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md)
- [`docs/15-governance/FINDING_SEVERITY_STANDARD.md`](../../15-governance/FINDING_SEVERITY_STANDARD.md)
- [`docs/MODULE_PUBLICATION_CATALOG.md`](../../MODULE_PUBLICATION_CATALOG.md)
- [`docs/MODULE_BASELINE_CATALOG.md`](../../MODULE_BASELINE_CATALOG.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
