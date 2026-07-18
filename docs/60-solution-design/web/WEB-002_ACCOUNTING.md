---
title: "WEB-002 — Accounting Web Solution Design Specification"
summary: "Phase 3 Web Solution Design specification for MOD-002 Accounting. Derived exclusively from the Accounting Module Publication. Defines Web-surface personas, journeys, navigation, screen inventory, forms, collaboration, accessibility, localization, and user-facing security expectations. Introduces no new business requirements."
spec_id: "WEB-002"
family: "WEB"
source_module: "MOD-002"
source_module_name: "Accounting"
source_publication: "MOD-002_MODULE_PUBLICATION"
source_baseline: "MOD002_ACCOUNTING_BASELINE_v1"
source_module_prd: "docs/20-module-prds/accounting/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-002-001", "SPR-MOD-002-002", "SPR-MOD-002-003", "SPR-MOD-002-004", "SPR-MOD-002-005", "SPR-MOD-002-006"]
related_mobile_spec: "MOB-002"
related_api_spec: "API-002"
version: "1.0"
status: "Active"
lifecycle_state: "Active"
owner: "Accounting"
layer: "delivery"
updated: "2026-07-19"
tags: ["solution-design", "web", "phase-3", "WEB-002", "MOD-002", "accounting"]
document_type: "Web Solution Design Specification"
template: "SD-001_WEB_SPEC"
template_version: "v1.0"
governance_specification: "v1.0"
related_engines: ["ENG-001", "ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-011", "ENG-012", "ENG-015", "ENG-016", "ENG-017", "ENG-018", "ENG-021", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-013", "ADR-014", "ADR-015", "ADR-032", "ADR-051", "ADR-053"]
---

# WEB-002 — Accounting Web Solution Design Specification

> **Reference derivation only.** WEB-002 is a Web-surface projection of the Accounting Module Publication [`MOD-002_MODULE_PUBLICATION`](../../45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md). It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. On any conflict with the Module Publication or its parent Module Baseline, the upstream artifact wins and WEB-002 is corrected in the same change.

## A. Overview

### A.1 Purpose

Define the Web-surface user experience through which authorized accounting personas consume the Accounting capabilities published in `MOD-002_MODULE_PUBLICATION` — Chart of Accounts and fiscal calendar, the canonical Voucher Framework, journal creation and ledger posting, deterministic financial statements, taxation & compliance foundation, and period close & audit review — while honouring the governance conventions (Accounting Ownership, Voucher Ownership, Ledger Posting Ownership, Ledger Immutability, Financial Reporting Ownership, Tax Ownership, Period Authority, Financial Freeze) declared in Publication §4.

### A.2 Scope

Web (desktop, tablet, mobile-browser responsive) surface covering:

- Accounting Foundation — Chart of Accounts, cost centers, bank accounts, fiscal year and accounting periods, base accounting configuration, and opening balance readiness.
- Voucher Framework — canonical voucher lifecycle across voucher types (Journal, Payment, Receipt, Contra, Credit / Debit Note), numbering, approvals, cancellation, reversal, and post-posting immutability.
- Journal & Ledger Posting — journal creation from posted vouchers, ledger posting to General Ledger and sub-ledgers, reversal postings, and balance inspection per account, tenant, currency, and period.
- Financial Statements — Trial Balance, General Ledger, Profit & Loss, Balance Sheet, and Cash Flow as deterministic read-only projections of authoritative ledger movements.
- Taxation & Compliance Foundation — tax master data, applicability and determination surfaces, tax classifications, and tax reporting semantics preparation.
- Period Close & Audit — accounting period lifecycle (Open / Soft Closed / Closed / Reopened), financial-year close, closing adjustment governance, opening balance preparation, and business-level accounting audit review.

Out of scope for WEB-002: mobile-native surfaces (belong to MOB-002), API contracts (belong to API-002), UI mockups, framework decisions, statutory filing to government portals, government tax integrations (GST/GSTN, e-invoicing/IRN, e-way bill), consolidation across companies, budgeting and forecasting, AI-driven accounting analysis, and any business-rule authoring beyond what the Module Publication declares.

### A.3 Source Published Module

- **Module ID / Name:** MOD-002 Accounting
- **Publication:** [`MOD-002_MODULE_PUBLICATION`](../../45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md)
- **Baseline:** [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- **Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- **Sprint Plan:** [`docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`](../../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md)
- **Sprint PRDs:** `SPR-MOD-002-001` … `SPR-MOD-002-006`

### A.4 Version

- **Specification Version:** 1.0
- **Aligned to Publication Version:** MOD-002 v1.0

### A.5 Design Principles

- **Publication-derived only.** Every WEB-002 element traces to a capability, authority, master entity, transaction, or convention in `MOD-002_MODULE_PUBLICATION`.
- **Ledger immutability is visible.** Every posting surface conveys that posted ledger movements are immutable; corrections occur only through reversal postings.
- **Determinism is transparent.** Financial statements convey their inputs, resolving period, and originating ledger snapshot so identical inputs yield identical outputs.
- **Boundary conventions are conveyed, not overridden.** Financial Statement, Tax Calculation, Period Close, and Audit Review Boundary conventions are surfaced as read-only rules; the Web surface never offers actions that violate them.
- **Governance conventions are conveyed, not redefined.** Accounting Ownership, Voucher Ownership, Ledger Posting Ownership, Ledger Access Boundary, Tax Ownership, Period Authority, and Financial Freeze conventions are surfaced as informational context.

### A.6 Business Boundary

WEB-002 covers only the Accounting bounded context. Business master data, transactions, and reports of downstream modules (MOD-003 Sales, MOD-004 Purchase, MOD-005 Inventory, MOD-008 Payroll, MOD-015 POS, MOD-017 Analytics) remain owned by those modules and are out of scope. Statutory filing, government tax integrations, consolidation across companies, budgeting/forecasting, and AI-driven accounting analysis are explicitly out of scope per Publication §15. Tenancy, organization structure, users, roles, permissions, configuration hierarchy, localization pack lifecycle, and audit collection remain owned by MOD-001 and are consumed here.

### A.7 Traceability References

See §L for the complete authority-to-sprint-to-page-to-engine-to-ADR traceability matrix. Frontmatter records the full chain (Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → Module Publication → WEB-002).

## B. Web Personas

Personas are inherited from the Module PRD §3 and the Module Publication; WEB-002 introduces no new roles. Concrete grants remain enforced by the Authorization Engine (`ENG-002`) per `ADR-032` (RBAC + ABAC) at accounting scope within tenancy boundaries per `ADR-011`.

### B.1 Accountant

- **Responsibilities:** Author and post vouchers within scope; maintain Chart of Accounts entries permitted at their scope; review journal entries and ledger movements; prepare period-end adjustments; consume financial statements.
- **Permissions (business-level):** Voucher authoring and posting within scope; read access to Journal Entries, Ledger Postings, and financial statements within scope; edit of Chart of Accounts entries where the Accounting Ownership Convention permits.
- **Primary Web Scenarios:** Create Journal / Payment / Receipt / Contra Voucher; Post Voucher; Inspect Ledger Balances; Review Trial Balance; Prepare Closing Adjustment.

### B.2 Controller

- **Responsibilities:** Oversee ledger integrity, approve high-value or restricted vouchers, govern period lifecycle (Soft Close / Close / controlled Reopen), oversee tax determination outcomes, and validate financial statements before publication within the company.
- **Permissions (business-level):** Voucher approval and cancellation within scope; period lifecycle transitions per Period Authority Convention; controlled reopening initiation; oversight over Chart of Accounts changes and Tax master.
- **Primary Web Scenarios:** Approve Voucher; Cancel Voucher; Soft-Close Period; Close Period; Initiate Controlled Reopening; Review Reversal Postings.

### B.3 CFO / Finance Executive

- **Responsibilities:** Consume authoritative financial statements at company / organization scope; oversee financial-year close; monitor period lifecycle posture; consume business-level audit review outputs.
- **Permissions (business-level):** Read access to all Accounting reports within scope; execute or authorize Financial-Year Close per Financial Year Ownership Convention.
- **Primary Web Scenarios:** Open Financial Statements; Execute Financial-Year Close; Review Period Lifecycle Dashboard; Review Business-Level Audit Summary.

### B.4 Auditor

- **Responsibilities:** Verify audit-visible history of Accounting activity — voucher lifecycle, journal creation, ledger postings, reversals, period lifecycle transitions, closing adjustments, tax determination outcomes; verify determinism of financial statements over declared inputs.
- **Permissions (business-level):** Read-only access to Accounting audit-visible surfaces within scope per `ADR-014`; no mutation rights. Audit collection remains authoritative in `ENG-004` under MOD-001.
- **Primary Web Scenarios:** Open Accounting Audit Review; Filter Audit Events; Drill-down to Event Detail; Compare Financial Statement Runs; Inspect Reversal Chain.

### B.5 AP Clerk

- **Responsibilities:** Author supplier-side vouchers (Payment Voucher, supplier Credit / Debit Note in accounting form), review Supplier AP Balance sub-ledger, and hand off to Controller for approval where required.
- **Permissions (business-level):** Voucher authoring within AP scope; read access to Supplier AP Balance sub-ledger and related journal entries.
- **Primary Web Scenarios:** Create Payment Voucher; Author Credit / Debit Note; Inspect Supplier AP Balance; Submit Voucher for Approval.

### B.6 AR Clerk

- **Responsibilities:** Author customer-side vouchers (Receipt Voucher, customer Credit / Debit Note in accounting form), review Customer AR Balance sub-ledger, and hand off for approval where required.
- **Permissions (business-level):** Voucher authoring within AR scope; read access to Customer AR Balance sub-ledger and related journal entries.
- **Primary Web Scenarios:** Create Receipt Voucher; Author Credit / Debit Note; Inspect Customer AR Balance; Submit Voucher for Approval.

### B.7 Tax Officer

- **Responsibilities:** Maintain Tax Code master, oversee tax applicability and determination outcomes, review tax classifications, prepare tax-reporting readiness, and coordinate with Controller for tax-related closing adjustments.
- **Permissions (business-level):** Tax master authoring; read access to tax-relevant vouchers, journal entries, and Accounting-owned tax reports; no direct ledger posting authority (posting flows through vouchers per Voucher Ownership Convention).
- **Primary Web Scenarios:** Maintain Tax Code; Review Tax Determination Outcome; Prepare Tax Reporting Readiness; Coordinate Closing Adjustment.

### B.8 External Actors (surfaced only where the Publication permits)

- **Downstream Business Modules (Sales, Purchase, Inventory, Payroll, POS):** Referenced as event producers via `SalesInvoiceIssued`, `PurchaseInvoiceReceived`, `PayrollPosted`, `POSDayClosed`, `InventoryValuationChanged` per Publication §10; consumption is read-only and never redefines Accounting state.
- **Analytics (MOD-017):** Read-only consumer of Accounting reports and events; owns no Accounting master data or transactions.

## C. Web User Journeys

Every journey is derived from a capability in Module Publication §3 and an authority in Publication §4. WEB-002 defines Web-surface flows only; business rules, state legality, and authorization are owned by the Module Publication and enforced by platform engines and Accounting engines (`ENG-015` Voucher Engine, `ENG-016` Posting Engine, `ENG-017` Numbering Engine).

### C.1 Journey — Establish Accounting Foundation for a Company

- **Entry Points:** Accounting Home → Foundation → Chart of Accounts / Fiscal Calendar.
- **Primary Flow:** Accountant or Controller within scope maintains Chart of Accounts entries under the Accounting Ownership Convention → configures cost centers and bank accounts → opens Fiscal Year and Accounting Periods → captures opening balance readiness. Base accounting configuration resolves through the Platform Configuration Hierarchy via `ENG-024` per Publication §4.1.
- **Alternate Flows:** Deactivate a Chart of Accounts leaf; roll fiscal calendar to next year; recapture opening balance readiness prior to first posting.
- **Interruption / Resume:** Draft foundation entries persist per author within company scope.
- **Exception Flows:** Duplicate account code within scope → validation feedback; period bounds overlap with an existing period → rejected before persistence.

### C.2 Journey — Author and Post a Voucher

- **Entry Points:** Vouchers → New Voucher → Journal / Payment / Receipt / Contra / Credit-Debit Note.
- **Primary Flow:** Author selects Voucher Type → numbering series resolves via `ENG-017` under the Voucher Ownership Convention → captures voucher lines (debit / credit) → Voucher Engine (`ENG-015`) validates balance (debits equal credits) → optional approval flows via `ENG-011` per Voucher Type policy → posting emits `VoucherPosted` via `ENG-005`; ledger posting occurs via `ENG-016` under the Ledger Posting Ownership Convention.
- **Alternate Flows:** Save Draft; submit for approval; recall a submitted-but-unapproved voucher; attach supporting documents via `ENG-008`.
- **Interruption / Resume:** Draft vouchers persist per author within company scope with reserved numbering behaviour per Voucher Type.
- **Exception Flows:** Debits ≠ credits → posting rejected with validation feedback; posting into a Closed period → rejected under Period Close Boundary Convention; attempted mutation of a posted voucher → rejected under the immutability-after-posting rule.

### C.3 Journey — Reverse a Posted Voucher

- **Entry Points:** Voucher Detail (posted) → Reverse; Journal Entry Detail → Reverse Origin.
- **Primary Flow:** Author with reversal authority initiates reversal → a new Reversal Voucher is created (never a mutation of the original) → posting via `ENG-016` produces a Reversal Posting preserving historical integrity per Ledger Immutability Convention → `VoucherPosted` emits for the reversal voucher.
- **Alternate Flows:** Capture a reason attachment via `ENG-008`; route reversal through approval via `ENG-011`.
- **Interruption / Resume:** Reversal draft persists per author.
- **Exception Flows:** Reversal targeting a Closed period → rejected under Period Close Boundary Convention; original voucher already reversed → rejected under Ledger Immutability Convention.

### C.4 Journey — Inspect Ledger Balances

- **Entry Points:** Ledger → Account Selector → Balance View; deep-link from Chart of Accounts leaf.
- **Primary Flow:** Persona selects an Account within scope → selects tenant / company / currency / period filter set → Balance Integrity Convention Authority computes deterministic aggregation across ledger movements → results display alongside originating journal entries.
- **Alternate Flows:** Drill from balance line to Journal Entry Detail; drill from Journal Entry to source Voucher; export the balance snapshot as a read-only report.
- **Interruption / Resume:** Filter and scope selections persist per session.
- **Exception Flows:** Cross-tenant selection is not offered per `ADR-011`; attempted access outside scope is rejected via `ENG-002`.

### C.5 Journey — Consume a Financial Statement

- **Entry Points:** Reports → Trial Balance / General Ledger / Profit & Loss / Balance Sheet / Cash Flow.
- **Primary Flow:** Persona selects a report → selects reporting period, company, and currency → the report is computed under the Report Determinism Convention using the Reporting Read Model (via `ENG-021`) with `ENG-018` (Currency Engine) for currency resolution → results render read-only with source-ledger references. The surface never mutates ledger, voucher, or journal state (Financial Statement Boundary Convention).
- **Alternate Flows:** Compare two runs of the same report for identical inputs to verify determinism; export the report to a downstream consumer under the Reporting Read Model.
- **Interruption / Resume:** Report configuration persists per session.
- **Exception Flows:** Report requested for a period entirely outside the persona's scope → rejected; request for a period with unresolved Opening Balance readiness → surfaced as a warning; the surface still MUST NOT mutate state.

### C.6 Journey — Maintain Tax Master and Review Tax Determination

- **Entry Points:** Taxation → Tax Codes; Taxation → Determination Review.
- **Primary Flow:** Tax Officer maintains Tax Code master under the Tax Ownership Convention → tax applicability and classifications resolve via the Rules Engine (`ENG-012`) → tax determination outcomes surface on candidate vouchers before posting → tax reporting semantics prepare Accounting-owned tax reports via `ENG-021`.
- **Alternate Flows:** Compare determination outcome across two candidate vouchers; export tax reporting readiness snapshot.
- **Interruption / Resume:** Draft tax master entries persist per author within scope.
- **Exception Flows:** Attempt to have tax calculation create vouchers, mutate journals, or mutate ledger entries → rejected under Tax Calculation Boundary Convention; attempted external filing action → not offered under Publication §15.

### C.7 Journey — Manage the Period Lifecycle

- **Entry Points:** Period Close → Period Selector → Lifecycle Panel.
- **Primary Flow:** Controller transitions a period through Open → Soft Closed → Closed under the Period Authority Convention → `PeriodClosed` emits via `ENG-005` at Closed transition → posting into a Closed period is blocked under Period Close Boundary Convention. Financial-year close follows the Financial Year Ownership Convention with opening balance preparation for the next year.
- **Alternate Flows:** Attach a closing narrative via `ENG-008`; route close through approval via `ENG-011`; initiate a Controlled Reopening.
- **Interruption / Resume:** Period selection persists per session.
- **Exception Flows:** Close blocked by unresolved closing preconditions (declared by upstream and downstream modules through emitted events) → transition rejected until preconditions resolve; attempt to close a period out of order → rejected.

### C.8 Journey — Initiate a Controlled Reopening

- **Entry Points:** Period Detail (Closed) → Request Reopening.
- **Primary Flow:** Controller with authorized authority initiates a Reopening request → approval via `ENG-011` per Controlled Reopening Convention → on approval, the period transitions to Reopened preserving historical integrity → every reopening is audit-visible via `ENG-004` per `ADR-014`; on completion the period follows the Period Authority Convention back to Soft Closed / Closed.
- **Alternate Flows:** Withdraw a pending reopening request; append additional justification via `ENG-008`.
- **Interruption / Resume:** Request state persists per requester.
- **Exception Flows:** Reopening without authorization → rejected under Controlled Reopening Convention; attempted reopening after Financial Freeze at year-end → rejected under Financial Freeze Convention unless the Financial Year Ownership Authority permits.

### C.9 Journey — Prepare and Post a Closing Adjustment

- **Entry Points:** Period Close → Closing Adjustments; Voucher Detail from adjustment ledger references.
- **Primary Flow:** Accountant or Controller authors a Closing Adjustment Voucher under the Voucher Ownership Convention within a Soft Closed period → voucher balance is validated by `ENG-015` → approval via `ENG-011` under the Financial Year Ownership Convention → posting emits `VoucherPosted` and produces the corresponding Journal Entry and Ledger Posting via `ENG-016`.
- **Alternate Flows:** Attach a closing narrative; withdraw a draft adjustment; sequence multiple adjustments prior to Close.
- **Interruption / Resume:** Adjustment drafts persist per author.
- **Exception Flows:** Adjustment authored against a Closed period → rejected until a Controlled Reopening authorises action; unbalanced adjustment → rejected before posting.

### C.10 Journey — Capture an Opening Balance Entry

- **Entry Points:** Foundation → Opening Balances; Fiscal Year Detail → Prepare Opening.
- **Primary Flow:** Accountant captures Opening Balance Entries per Company under the Financial Year Ownership Convention → entries are validated for balance and scope → posting occurs through the Voucher Framework; ledger reflects readiness for the new fiscal year.
- **Alternate Flows:** Roll opening balances from a prior closed fiscal year; adjust opening balances before first posting.
- **Interruption / Resume:** Draft opening entries persist per author.
- **Exception Flows:** Opening balance attempted after first posting into the new fiscal year → rejected under Financial Year Ownership Convention.

### C.11 Journey — Review the Accounting Audit Timeline

- **Entry Points:** Audit Review → Timeline; deep links from any Accounting master or transaction detail.
- **Primary Flow:** Auditor or Controller opens the Accounting Audit Review surface → applies scope, actor, action, and time filters → drills into an event detail → optionally exports a filtered selection. Audit content is consumed read-only from `ENG-004`; the surface never mutates audit state per Audit Review Boundary Convention.
- **Alternate Flows:** Bookmark a filter set; open source entity detail from an event; jump from an event to the corresponding Reversal chain.
- **Interruption / Resume:** Filter state persists across sessions.
- **Exception Flows:** Access denied where audit visibility policy prohibits; retention-aged events surfaced as archived.

## D. Menu Hierarchy

Derived strictly from Publication §3 (Approved Scope) and §4 authorities.

### D.1 Application Areas

- **Accounting Home** — persona-appropriate landing surface with scope selector, pending accounting tasks, current period lifecycle indicators, and recent audit-visible events.
- **Foundation** — Chart of Accounts, Cost Centers, Bank Accounts, Fiscal Calendar, Base Accounting Configuration, Opening Balances.
- **Vouchers** — Voucher Types, Voucher authoring, approvals, cancellations, reversals.
- **Journals & Ledgers** — Journal Entries, Ledger Postings, Balance Inspection, Reversal Chain.
- **Financial Statements** — Trial Balance, General Ledger, Profit & Loss, Balance Sheet, Cash Flow.
- **Taxation** — Tax Codes, Determination Review, Tax Reporting Readiness.
- **Period Close** — Period Lifecycle, Closing Adjustments, Financial-Year Close, Controlled Reopening.
- **Audit Review** — Accounting Audit Timeline, Filters, Exports (read-only over `ENG-004`).
- **Governance** — read-only surface displaying the Accounting-owned conventions (Accounting Ownership, Voucher Ownership, Ledger Posting Ownership, Ledger Immutability, Balance Integrity, Ledger Access Boundary, Financial Reporting Ownership, Ledger Consumption, Report Determinism, Reporting Read Model, Financial Statement Boundary, Tax Ownership, Tax Calculation Boundary, Tax Configuration Authority, Compliance Readiness, Tax Reporting Boundary, Period Authority, Financial Year Ownership, Period Close Boundary, Controlled Reopening, Audit Review Boundary, Financial Freeze).

### D.2 Menu Hierarchy

```text
Accounting
├── Home
├── Foundation
│   ├── Chart of Accounts
│   ├── Cost Centers
│   ├── Bank Accounts
│   ├── Fiscal Calendar
│   ├── Base Configuration
│   └── Opening Balances
├── Vouchers
│   ├── Voucher Types
│   ├── Journal Vouchers
│   ├── Payment Vouchers
│   ├── Receipt Vouchers
│   ├── Contra Vouchers
│   ├── Credit / Debit Notes
│   └── Approvals
├── Journals & Ledgers
│   ├── Journal Entries
│   ├── Ledger Postings
│   ├── Balance Inspection
│   └── Reversal Chain
├── Financial Statements
│   ├── Trial Balance
│   ├── General Ledger
│   ├── Profit & Loss
│   ├── Balance Sheet
│   └── Cash Flow
├── Taxation
│   ├── Tax Codes
│   ├── Determination Review
│   └── Tax Reporting Readiness
├── Period Close
│   ├── Period Lifecycle
│   ├── Closing Adjustments
│   ├── Financial-Year Close
│   └── Controlled Reopening
├── Audit Review
│   ├── Timeline
│   ├── Filters
│   └── Exports
└── Governance
    ├── Accounting Ownership
    ├── Voucher Ownership
    ├── Ledger Posting & Immutability
    ├── Financial Reporting Ownership
    ├── Tax Ownership
    ├── Period Authority & Financial Freeze
    └── Audit Review Boundary
```

### D.3 Deep-Link Entry Points

Direct links resolve to: a Chart of Accounts leaf, a Cost Center, a Bank Account, a Fiscal Year, an Accounting Period, a Voucher Type, a Voucher, a Journal Entry, a Ledger Posting, a Balance Inspection scope, a Financial Statement run, a Tax Code, a Tax Determination outcome, a Closing Adjustment, an Audit Event, and any Governance convention read surface. Every deep-link is re-evaluated against the caller's authorization on resolution.

### D.4 Breadcrumbs

Breadcrumbs mirror the menu hierarchy and always root at "Accounting". Entity detail surfaces append the entity's business name and, where applicable, the resolved company, period, and currency scope.

### D.5 Back-Navigation Behaviour

Back-navigation returns to the prior surface preserving scope, filter, period, and pagination selections. Back-navigation from an Audit Event detail returns to the Audit Timeline with filters intact; back-navigation from a Journal Entry Detail returns to the ledger view that opened it.

### D.6 Cross-Module Navigation

Drill-downs into downstream module surfaces (for example from a Journal Entry to the originating Sales Invoice in MOD-003, or a Purchase Invoice in MOD-004) surrender control to that module's own surface and its own authorization. Accounting never mutates downstream module master data or transactions. Downstream modules never write to Accounting state directly — the Ledger Access Boundary Convention permits consumption only.

## E. Screen Inventory

Each entry: purpose, business capability, primary actions, displayed business information, navigation relationships. Derived from the capabilities, master data, and transactions declared in the Module Publication. Visual mockups are out of scope. Consistent with WEB-001, this inventory uses page-based identification; stable per-screen identifiers are Mobile-scoped per `SCREEN_IDENTIFIER_STANDARD` and are not introduced here.

### E.1 Accounting Home

- **Purpose:** Persona-appropriate landing surface for Accounting.
- **Business Capability:** Cross-area overview (Publication §3).
- **Primary Actions:** Open Vouchers, Open Journals & Ledgers, Open Financial Statements, Open Period Close, Open Audit Review.
- **Displayed Business Information:** Resolved company / period scope, pending accounting tasks, current period lifecycle state, recent audit-visible events.
- **Relationships:** Entry point to all §D application areas.

### E.2 Chart of Accounts Catalog and Detail

- **Purpose:** Browse and maintain the Chart of Accounts.
- **Business Capability:** Accounting Ownership Convention Authority (Publication §4.1).
- **Primary Actions:** New leaf, Open, Edit, Deactivate.
- **Displayed Business Information:** Account code, name, type, parent, currency posture, lifecycle state.
- **Relationships:** Ledger Balance Inspection (§E.13); Journal Entry Detail (§E.11).

### E.3 Cost Centers Catalog and Detail

- **Purpose:** Browse and maintain Cost Centers.
- **Business Capability:** Accounting Ownership Convention Authority (Publication §4.1).
- **Primary Actions:** New, Open, Edit, Deactivate.
- **Displayed Business Information:** Cost Center identifier, name, parent, lifecycle state.
- **Relationships:** Voucher Authoring (§E.8); Balance Inspection (§E.13).

### E.4 Bank Accounts Catalog and Detail

- **Purpose:** Browse and maintain Bank Accounts.
- **Business Capability:** Accounting Ownership Convention Authority (Publication §4.1).
- **Primary Actions:** New, Open, Edit, Deactivate.
- **Displayed Business Information:** Bank Account identifier, name, linked ledger account, currency, lifecycle state.
- **Relationships:** Payment / Receipt / Contra Voucher (§E.8).

### E.5 Fiscal Calendar

- **Purpose:** Maintain Fiscal Years and Accounting Periods.
- **Business Capability:** Accounting Ownership Convention Authority; Financial Year Ownership Convention Authority (Publication §4.1, §4.6).
- **Primary Actions:** Open Fiscal Year, Open Period, transition period lifecycle (via Period Close, §E.20).
- **Displayed Business Information:** Fiscal Year bounds, period bounds, period lifecycle state.
- **Relationships:** Period Lifecycle (§E.20); Financial Statements (§E.14–§E.18).

### E.6 Base Configuration

- **Purpose:** Read the resolved Accounting base configuration for the current scope.
- **Business Capability:** Accounting Ownership Convention Authority (Publication §4.1); Configuration Hierarchy consumption via `ENG-024`.
- **Primary Actions:** Inspect resolved values, open originating scope reference (deep-link to Platform Administration surface, WEB-001).
- **Displayed Business Information:** Configuration key, resolved value, originating scope.
- **Relationships:** Read-only; edits occur through Platform Administration.

### E.7 Opening Balances Workbench

- **Purpose:** Capture and review Opening Balance Entries per Company.
- **Business Capability:** Financial Year Ownership Convention Authority (Publication §4.6).
- **Primary Actions:** Capture Entry, Roll from Prior Year, Submit for Approval, Post.
- **Displayed Business Information:** Account, opening amount, currency, source fiscal year.
- **Relationships:** Voucher Authoring (§E.8); Journal Entry (§E.11).

### E.8 Voucher Authoring (per Voucher Type)

- **Purpose:** Author a Journal, Payment, Receipt, Contra, or Credit / Debit Note voucher.
- **Business Capability:** Voucher Ownership Convention Authority (Publication §4.2).
- **Primary Actions:** Save Draft, Submit for Approval, Post, Withdraw, Attach Document.
- **Displayed Business Information:** Voucher number (from `ENG-017`), voucher type, lines (debit / credit), resolved tax determination outcome, total, lifecycle state.
- **Relationships:** Approvals (§E.10); Journal Entry (§E.11); Reversal (§E.12).

### E.9 Voucher Types Catalog

- **Purpose:** Browse Voucher Type master and their numbering, approval, and reversal policies.
- **Business Capability:** Voucher Ownership Convention Authority (Publication §4.2).
- **Primary Actions:** Open, Filter.
- **Displayed Business Information:** Voucher Type identifier, name, numbering series binding, approval policy, reversal policy.
- **Relationships:** Voucher Authoring (§E.8).

### E.10 Voucher Approvals

- **Purpose:** Review and act on pending voucher approvals.
- **Business Capability:** Voucher Ownership Convention Authority; `ENG-011` (Approval Engine).
- **Primary Actions:** Approve, Reject, Request Changes.
- **Displayed Business Information:** Pending voucher, author, submission time, policy invoked, lifecycle state.
- **Relationships:** Voucher Detail (§E.8); Audit Timeline (§E.24).

### E.11 Journal Entries Catalog and Detail

- **Purpose:** Browse Journal Entries produced from posted vouchers.
- **Business Capability:** Ledger Posting Ownership Convention Authority (Publication §4.3).
- **Primary Actions:** Open, Drill to Source Voucher, Drill to Ledger Posting.
- **Displayed Business Information:** Journal Entry identifier, posting date, source Voucher reference, line summary.
- **Relationships:** Voucher (§E.8); Ledger Posting (§E.12); Balance Inspection (§E.13).

### E.12 Ledger Postings and Reversal Chain

- **Purpose:** Read the ledger postings for a Journal Entry, and read the Reversal chain if any.
- **Business Capability:** Ledger Posting Ownership Convention Authority; Ledger Immutability Convention Authority (Publication §4.3).
- **Primary Actions:** Open Reversal Voucher (if authorized), Drill to source Voucher.
- **Displayed Business Information:** Ledger movements per account, immutability indicator, reversal linkage.
- **Relationships:** Journal Entry (§E.11); Voucher (§E.8).

### E.13 Balance Inspection

- **Purpose:** Present the deterministic aggregate balance for a selected Account, tenant, currency, and period.
- **Business Capability:** Balance Integrity Convention Authority (Publication §4.3).
- **Primary Actions:** Select scope, drill into constituent Journal Entries, export a read-only snapshot.
- **Displayed Business Information:** Account balance, ledger movement contributions, resolving scope indicator.
- **Relationships:** Chart of Accounts (§E.2); Journal Entry (§E.11).

### E.14 Trial Balance

- **Purpose:** Present the Trial Balance as a deterministic ledger projection.
- **Business Capability:** Financial Reporting Ownership Convention Authority; Report Determinism Convention Authority (Publication §4.4).
- **Primary Actions:** Configure period / company / currency, run, compare with a prior run, export.
- **Displayed Business Information:** Debit and credit totals per account, resolving inputs, determinism indicator, source snapshot reference.
- **Relationships:** Chart of Accounts (§E.2); General Ledger (§E.15).

### E.15 General Ledger Report

- **Purpose:** Present the General Ledger as an authoritative Accounting report.
- **Business Capability:** Financial Reporting Ownership Convention Authority; Ledger Consumption Convention Authority (Publication §4.4).
- **Primary Actions:** Configure filters (account, period, cost center), run, drill to Journal Entry (§E.11).
- **Displayed Business Information:** Ordered ledger movements per account, running balance, resolving inputs.
- **Relationships:** Journal Entry (§E.11); Balance Inspection (§E.13).

### E.16 Profit & Loss Statement

- **Purpose:** Present the Profit & Loss statement as a deterministic projection.
- **Business Capability:** Financial Reporting Ownership Convention Authority (Publication §4.4).
- **Primary Actions:** Configure period / company / currency, run, compare with a prior run, export.
- **Displayed Business Information:** Revenue and expense aggregation by classification, resolving inputs, determinism indicator.
- **Relationships:** Balance Sheet (§E.17); Cash Flow (§E.18).

### E.17 Balance Sheet

- **Purpose:** Present the Balance Sheet as a deterministic projection.
- **Business Capability:** Financial Reporting Ownership Convention Authority (Publication §4.4).
- **Primary Actions:** Configure period / company / currency, run, compare with a prior run, export.
- **Displayed Business Information:** Assets, liabilities, equity classification, resolving inputs.
- **Relationships:** Profit & Loss (§E.16); Trial Balance (§E.14).

### E.18 Cash Flow Statement

- **Purpose:** Present the Cash Flow statement as a deterministic projection.
- **Business Capability:** Financial Reporting Ownership Convention Authority (Publication §4.4).
- **Primary Actions:** Configure period / company / currency, run, export.
- **Displayed Business Information:** Cash inflow / outflow classification, resolving inputs.
- **Relationships:** Profit & Loss (§E.16); Balance Sheet (§E.17).

### E.19 Tax Codes Catalog and Detail

- **Purpose:** Browse and maintain Tax Code master.
- **Business Capability:** Tax Ownership Convention Authority (Publication §4.5).
- **Primary Actions:** New, Open, Edit, Deactivate.
- **Displayed Business Information:** Tax Code identifier, classification, applicability rule set, lifecycle state.
- **Relationships:** Determination Review (§E.20); Voucher Authoring (§E.8).

### E.20 Tax Determination Review

- **Purpose:** Review tax determination outcomes on candidate and posted vouchers.
- **Business Capability:** Tax Ownership Convention Authority; Rules Engine (`ENG-012`) (Publication §4.5).
- **Primary Actions:** Filter, drill to Voucher (§E.8), compare determination across vouchers.
- **Displayed Business Information:** Applied Tax Codes, computed tax amount (business-level, read-only), classification.
- **Relationships:** Voucher (§E.8); Tax Reporting Readiness (§E.21).

### E.21 Tax Reporting Readiness

- **Purpose:** Present Accounting-owned tax reports for readiness purposes.
- **Business Capability:** Compliance Readiness Convention Authority; Tax Reporting Boundary Convention Authority (Publication §4.5).
- **Primary Actions:** Configure period, run, export.
- **Displayed Business Information:** Tax classification totals, resolving inputs, readiness indicator.
- **Relationships:** Tax Determination Review (§E.20). Statutory filing itself is out of scope per Publication §15.

### E.22 Period Lifecycle Panel

- **Purpose:** Manage Accounting Period lifecycle (Open / Soft Closed / Closed / Reopened).
- **Business Capability:** Period Authority Convention Authority; Period Close Boundary Convention Authority (Publication §4.6).
- **Primary Actions:** Soft Close, Close, Initiate Reopening.
- **Displayed Business Information:** Period identifier, bounds, lifecycle state, blocking preconditions.
- **Relationships:** Financial-Year Close (§E.23); Controlled Reopening (part of §E.22 flow); Audit Timeline (§E.24).

### E.23 Financial-Year Close Workbench

- **Purpose:** Execute the Financial-Year Close with authorized authority.
- **Business Capability:** Financial Year Ownership Convention Authority; Financial Freeze Convention Authority (Publication §4.6).
- **Primary Actions:** Prepare, Approve, Close, Prepare Opening Balances for next year.
- **Displayed Business Information:** Year bounds, close preconditions, opening balance readiness for the next year, freeze indicator on completion.
- **Relationships:** Opening Balances (§E.7); Period Lifecycle (§E.22).

### E.24 Accounting Audit Timeline

- **Purpose:** Present the accounting audit-visible timeline within scope.
- **Business Capability:** Audit Review Boundary Convention Authority (Publication §4.6).
- **Primary Actions:** Filter by scope / actor / action / time; open event detail; export selection.
- **Displayed Business Information:** Ordered audit events, actor, action, scope, source entity reference.
- **Relationships:** Audit Event Detail (§E.25); every Accounting detail surface (§E.2–§E.23).

### E.25 Audit Event Detail

- **Purpose:** Read a single audit-visible event.
- **Business Capability:** Audit Review Boundary Convention Authority; audit visibility per `ADR-014`.
- **Primary Actions:** Open source entity, add to export selection.
- **Displayed Business Information:** Actor, action, scope, timestamp, source entity reference, event payload summary (business-level, read-only).
- **Relationships:** Source entity detail; Audit Timeline (§E.24).

### E.26 Governance Conventions

- **Purpose:** Present the Accounting-owned governance conventions in force.
- **Business Capability:** All authorities enumerated in Publication §4.
- **Primary Actions:** Open Convention read view.
- **Displayed Business Information:** Textual restatement of each convention, references to source publication section.
- **Relationships:** Read-only surfaces only.

## F. Forms & User Interactions

Every form derives its fields from the Master Data and Transaction authorities declared in Module Publication §7 and §8, and from the conventions declared in §4. Validation is business-level; technical validation is out of scope.

### F.1 Chart of Accounts Form

- **Purpose:** Create / edit a Chart of Accounts leaf.
- **Business Fields:** Account code, name, type (asset / liability / equity / income / expense), parent, currency posture, lifecycle state.
- **Required vs Optional:** Code, name, type, parent (except root) required; currency posture optional (defaults resolved via `ENG-024`).
- **Business Validation Rules:** Code unique within company scope; type consistent with parent classification; posted movements block deletion of the leaf.
- **User Actions:** Save Draft, Activate, Deactivate.
- **Submit Outcome:** Entry persisted; downstream ledger references remain valid; audit-visible per `ADR-014`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.2 Cost Center / Bank Account Form

- **Purpose:** Create / edit a Cost Center or Bank Account.
- **Business Fields:** Identifier, name, parent (Cost Center only), linked ledger account (Bank Account), currency (Bank Account), lifecycle state.
- **Required vs Optional:** Identifier, name required; linked ledger account required for Bank Account.
- **Business Validation Rules:** Identifier unique within scope; ledger account of appropriate type for Bank Account.
- **User Actions:** Save Draft, Activate, Deactivate.
- **Submit Outcome:** Entry persisted; audit-visible per `ADR-014`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.3 Fiscal Year / Period Form

- **Purpose:** Open / edit a Fiscal Year and its Accounting Periods.
- **Business Fields:** Fiscal Year identifier, bounds (start, end), period breakdown, calendar notes.
- **Required vs Optional:** Identifier, bounds required; notes optional.
- **Business Validation Rules:** Bounds non-overlapping with existing Fiscal Years; period breakdown covers year bounds exactly.
- **User Actions:** Open, Save Draft.
- **Submit Outcome:** Fiscal Year persisted; period lifecycle proceeds through the Period Lifecycle surface (§E.22).
- **Cancel / Retry Outcome:** Draft preserved.

### F.4 Voucher Form (per Voucher Type)

- **Purpose:** Create / edit a Journal, Payment, Receipt, Contra, or Credit / Debit Note voucher.
- **Business Fields:** Voucher Type, voucher date, reference party (where applicable), lines (account, cost center, currency, debit / credit amount), tax code references, narration, attachments (via `ENG-008`).
- **Required vs Optional:** Voucher Type, date, at least two lines with balanced debits and credits required; party required for Payment / Receipt / Credit / Debit Note.
- **Business Validation Rules:** Debits equal credits (Publication §6); posting into a Closed period rejected (Period Close Boundary Convention); numbering resolves via `ENG-017`.
- **User Actions:** Save Draft, Submit for Approval, Post, Withdraw, Attach Document.
- **Submit Outcome:** Voucher persisted; on Post, `VoucherPosted` emits via `ENG-005`; ledger posting occurs via `ENG-016`.
- **Cancel / Retry Outcome:** Draft preserved; retry surfaces validation feedback.

### F.5 Voucher Reversal Form

- **Purpose:** Reverse a posted voucher by creating a new Reversal Voucher.
- **Business Fields:** Source voucher reference (read-only), reversal date, reason narration, attachments.
- **Required vs Optional:** Source reference (system-populated), reversal date, reason required.
- **Business Validation Rules:** Source voucher must be posted and not already reversed; target period must not be Closed; the original voucher is never mutated (Ledger Immutability Convention).
- **User Actions:** Create Reversal, Submit for Approval, Post.
- **Submit Outcome:** Reversal Voucher persisted and posted; `VoucherPosted` emits for the reversal; audit-visible per `ADR-014`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.6 Voucher Approval Action Form

- **Purpose:** Approve, reject, or request changes on a pending voucher.
- **Business Fields:** Decision, comment, attachments.
- **Required vs Optional:** Decision required; comment required for Reject / Request Changes.
- **Business Validation Rules:** Approver must be within the approving authority declared by the Voucher Type's approval policy.
- **User Actions:** Approve, Reject, Request Changes.
- **Submit Outcome:** Approval decision persisted via `ENG-011`; audit-visible per `ADR-014`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.7 Tax Code Form

- **Purpose:** Create / edit a Tax Code.
- **Business Fields:** Tax Code identifier, description, classification, applicability rule references, lifecycle state.
- **Required vs Optional:** Identifier, classification, applicability required; description optional.
- **Business Validation Rules:** Identifier unique within scope; applicability rule set resolvable by `ENG-012`.
- **User Actions:** Save Draft, Activate, Deactivate.
- **Submit Outcome:** Tax Code persisted; determination outcomes for future vouchers reflect the change.
- **Cancel / Retry Outcome:** Draft preserved.

### F.8 Period Lifecycle Action Form

- **Purpose:** Transition a period through its lifecycle (Soft Close / Close / initiate Reopening).
- **Business Fields:** Target period reference, action, comment.
- **Required vs Optional:** Target period, action required.
- **Business Validation Rules:** Action must satisfy Period Authority Convention; Close blocked by unresolved preconditions; Reopening requires authorized authority per Controlled Reopening Convention.
- **User Actions:** Soft Close, Close, Request Reopening, Withdraw Request.
- **Submit Outcome:** Period transitions accordingly; `PeriodClosed` emits via `ENG-005` on Closed; audit-visible per `ADR-014`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.9 Financial-Year Close Form

- **Purpose:** Execute the Financial-Year Close.
- **Business Fields:** Target Fiscal Year, opening-balance preparation summary, comment.
- **Required vs Optional:** Target year required; comment optional.
- **Business Validation Rules:** All periods within the year must be Closed; opening balance readiness for the next year must be prepared; Financial Freeze Convention applies on completion.
- **User Actions:** Prepare, Approve, Close.
- **Submit Outcome:** Year closed; opening balances for the next year initialised via `ENG-016`; audit-visible per `ADR-014`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.10 Closing Adjustment Voucher Form

- **Purpose:** Author a Closing Adjustment Voucher within a Soft Closed period.
- **Business Fields:** As Voucher Form (§F.4), scoped to Closing Adjustment Voucher Type.
- **Required vs Optional:** Same as §F.4; scope indicator locked to the target period.
- **Business Validation Rules:** As §F.4, with additional constraint that the target period is Soft Closed and not Closed.
- **User Actions:** Save Draft, Submit for Approval, Post.
- **Submit Outcome:** Adjustment persisted and posted; `VoucherPosted` emits.
- **Cancel / Retry Outcome:** Draft preserved.

### F.11 Opening Balance Entry Form

- **Purpose:** Capture an Opening Balance Entry per Company.
- **Business Fields:** Company, target Fiscal Year, account lines (account, amount, currency), source (roll-from-prior / manual).
- **Required vs Optional:** Company, target year, at least one line required.
- **Business Validation Rules:** Entries balance across debits and credits; capture prior to first posting in the target year (per Financial Year Ownership Convention).
- **User Actions:** Save Draft, Submit for Approval, Post.
- **Submit Outcome:** Opening balances persisted; ledger initialised for the target year.
- **Cancel / Retry Outcome:** Draft preserved.

### F.12 Audit Export Selection Form

- **Purpose:** Assemble an audit export selection.
- **Business Fields:** Selection criteria (scope, actor, action, time range), export label, retention preference.
- **Required vs Optional:** Selection criteria required; label optional.
- **Business Validation Rules:** Selection must fall within the requester's audit-visibility scope per `ADR-014`; retention consistent with Platform Audit Ownership Convention.
- **User Actions:** Assemble, Submit Export, Cancel.
- **Submit Outcome:** Export request submitted through the Accounting Audit Review surface; audit-visible per `ADR-014`.
- **Cancel / Retry Outcome:** Draft preserved.

## G. Collaboration

Collaboration is supported only where the Module Publication permits it. WEB-002 introduces no new collaboration surfaces beyond those authorized by Publication §4.

- **Shared Authoring:** Voucher authoring, closing adjustments, tax master, and opening balances are scoped shared workspaces. Concurrent edits on the same voucher surface as validation-time conflict indicators; there is no free-form co-editing.
- **Approvals:** Voucher approvals, closing adjustment approvals, financial-year close approvals, and controlled-reopening approvals route via `ENG-011` per Voucher Ownership, Financial Year Ownership, and Controlled Reopening Conventions.
- **Notifications:** Approval requests, approval decisions, period lifecycle transitions, financial-year close completion, and controlled-reopening outcomes route via the Platform Notification surface (owned by MOD-001, consumed here) as declared in Publication §11 through the Configuration Engine and Audit Engine indications.
- **Audit Participation:** Every state-changing action (voucher post, reversal, period transition, closing adjustment post, financial-year close, controlled reopening, tax master change, opening balance post) is audit-visible per `ADR-014` via `ENG-004`.
- **Handoff:** Draft state persists per author within scope; back-navigation and deep-links preserve scope and filter state so accounting personas can hand off drafts within a scope-authorized team.

## H. Accessibility (WCAG 2.1 AA)

Aligned to WCAG 2.1 AA as declared by the Accessibility Standard (`ADR-081`) inherited through the Platform reference implementation. No implementation guidance; objectives only.

- **Keyboard Navigation:** Every action reachable via keyboard alone. Escape returns focus predictably from Voucher Authoring, Financial Statement configurators, Period Lifecycle Panel, Financial-Year Close Workbench, and Audit Event Detail surfaces.
- **Focus Management:** Focus lands on the primary editable field after opening a form; focus lands on the resolved-value display after a report run; focus indicators are always visible on ledger lines, voucher lines, and audit events.
- **Screen Reader Compatibility:** All interactive elements have accessible names; scope changes, resolution outcomes, lifecycle transitions, posting outcomes, and audit event details are announced.
- **Color-Independent Communication:** Voucher lifecycle state (Draft / Pending Approval / Approved / Posted / Cancelled / Reversed), period lifecycle state (Open / Soft Closed / Closed / Reopened), immutability indicators, and audit event categories are communicated by more than color alone (icon + text label).
- **Responsive Behaviour:** Catalogs (Chart of Accounts, Journal Entries, Ledger Postings, Financial Statements, Audit Timeline) reflow across desktop, tablet, and mobile browser widths without loss of content or actions. Complex authoring (multi-line vouchers, financial-year close) may be deferred to larger widths.
- **Localization:** All labels resolvable via the Platform Localization surface (owned by MOD-001, consumed here); layout tolerates text expansion; currency and number formats resolve through `ENG-018`.

Mobile-native experiences (offline voucher capture, push notifications, camera-based document capture, device capabilities) are out of scope for WEB-002 and belong to MOB-002.

## I. Localization

Derived from the Platform Localization Pack Master Authority and Localization Pack Lifecycle Authority (owned by MOD-001), consumed by Accounting. Currency resolution is owned by `ENG-018` (Currency Engine) per Publication §11.

- **Locale Resolution:** All Web surfaces resolve locale via the Platform Localization surface. The resolved locale is displayed alongside the scope indicator.
- **Currency Resolution:** Every ledger value, voucher line, and report line resolves through `ENG-018`. Multi-currency vouchers display source and resolved values.
- **Regional Defaults:** Number, date, and currency formats surface consistently across all Accounting surfaces per the activated Localization Pack.
- **No Regional Behaviour Beyond the Publication:** WEB-002 introduces no country-specific rules; regional behaviour is entirely governed by the activated Platform Localization Pack and by the Tax Ownership Convention within Accounting.

## J. Security & Authorization

User-facing security expectations derived from Module Publication §4 authorities and §11 engine / ADR consumption. No authentication implementation.

### J.1 Authentication Entry Points

- Access to Accounting requires authenticated identity per `ENG-001`. Unauthenticated navigation is redirected to the platform-level sign-in surface owned by MOD-001. WEB-002 does not define authentication mechanics.

### J.2 Authorization Visibility

- Menus, actions, and detail fields are gated per `ADR-032` (RBAC + ABAC) via `ENG-002` (Authorization Engine). Users see only entities within their tenant, organization, company, branch, and row-level scope.
- Voucher approval, period lifecycle transition, controlled reopening, and financial-year close actions require the corresponding authorized authority declared by the Module Publication.

### J.3 Tenant Isolation

- All catalogs and detail surfaces honour tenant isolation per `ADR-011`. Cross-tenant navigation, sharing, and lookup are not offered. Deep-links are re-evaluated against the caller's tenant scope on resolution.

### J.4 Ledger Access Boundary

- The Ledger Access Boundary Convention Authority is surfaced as a hard rule: downstream module surfaces cannot post directly to ledger tables; every ledger movement traces to a posted voucher via `ENG-016`. WEB-002 offers no action that violates this rule.

### J.5 Boundary Conventions

- Financial Statement Boundary, Tax Calculation Boundary, Period Close Boundary, and Audit Review Boundary Conventions are surfaced as read-only rules on the corresponding surfaces. Attempted state changes that would violate a boundary are rejected before persistence.

### J.6 Financial Freeze

- The Financial Freeze Convention Authority is surfaced on the Fiscal Year and Period Lifecycle surfaces. Once a period reaches Closed, posting is not permitted; corrections occur only through Controlled Reopening under authorized authority.

### J.7 Audit Visibility

- Every state-changing action (`VoucherPosted`, `PeriodClosed`, `PaymentRecorded`, `ReceiptRecorded`, `BankReconciled`, closing adjustments, controlled reopenings, financial-year close, opening balance capture, tax master change) is audit-visible per `ADR-014` via `ENG-004`.
- Audit content is consumed read-only through the Accounting Audit Review surface (§E.24–§E.25). The surface never mutates audit state — audit collection remains authoritative in `ENG-004` under MOD-001.

### J.8 Secure Handling of Business Information

- The Web surface never offers actions that mutate downstream module master data or transactions from within Accounting. Drill-down into a downstream module surface surrenders control to that module's own surface and its own authorization.
- Event delivery infrastructure is owned by `ENG-005`; Accounting emits event semantics under the Event Ownership Convention without surfacing event bus internals to end users.
- Numbering is issued exclusively through `ENG-017` under the Voucher Ownership Convention; no manual override is offered.

## K. Cross-Platform Alignment

WEB-002 aligns with the planned Mobile (MOB-002) and API (API-002) specifications derived from the same Module Publication.

- **MOB-002 (planned):** Personas, entity vocabulary, voucher and period lifecycle states, ledger immutability, and audit visibility are intended to remain consistent with WEB-002. Mobile-native concerns (offline voucher capture, push, camera-based document capture, device capabilities) belong to MOB-002 and are out of scope here.
- **API-002 (planned):** Business capabilities exposed by WEB-002 (Chart of Accounts, Cost Center, Bank Account, Fiscal Year, Accounting Period, Voucher Type, Voucher, Journal Entry, Ledger Posting, Balance Inspection, Financial Statements, Tax Code, Tax Determination outcome, Period Lifecycle transitions, Financial-Year Close, Controlled Reopening, Opening Balance Entry, Audit Review) are intended to be exposed consistently to API consumers, subject to the same authorities and governance conventions. Endpoint contracts, transport, and payload schemas remain out of scope for WEB-002.
- **Consistency Rules:** All three surfaces share the same source authorities; any divergence must be reconciled at the Module Publication level, not at a family specification.

## L. Design Constraints

The WEB-002 Solution Design shall:

- introduce no business requirements beyond `MOD-002_MODULE_PUBLICATION`;
- introduce no implementation-specific technology decisions unless already established by an ADR referenced in Publication §11;
- preserve traceability to every authority enumerated in Publication §4;
- remain implementation-independent so that multiple compliant web implementations are possible from this specification;
- respect all Boundary Conventions (Financial Statement Boundary, Tax Calculation Boundary, Period Close Boundary, Audit Review Boundary, Ledger Access Boundary, Financial Freeze) as hard constraints in every surface;
- consume Platform capabilities (tenancy, organization structure, users/roles, configuration hierarchy, localization, platform audit) without redefining them.

## M. Acceptance Criteria

This specification is Accepted when:

1. Every authority enumerated in `MOD-002_MODULE_PUBLICATION` §4 traces to at least one WEB-002 journey, screen, and form (see §N).
2. No WEB-002 element introduces a capability, master entity, transaction, event, engine, ADR, or convention beyond those declared in the Module Publication.
3. The screen inventory (§E) covers all six functional domains (Foundation, Vouchers, Journals & Ledgers, Financial Statements, Taxation, Period Close & Audit).
4. Every state-changing form (§F) declares business validation rules consistent with Publication §6 and the Boundary Conventions in §4.
5. WCAG 2.1 AA objectives are declared in §H.
6. The Design Constraints in §L are explicit and consistent with the Publication.
7. Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0` (MAJOR = 0 ∧ CRITICAL = 0).

## N. Traceability Matrix

Every WEB-002 authority row maps to its originating Sprint, the Web surface(s) that convey it, the platform / accounting engine(s) that back it, and the ADR(s) that govern it. Every row resolves to `MOD-002_MODULE_PUBLICATION`.

| MOD-002 Authority | Sprint | Page(s) | Engine(s) | ADR(s) |
| --- | --- | --- | --- | --- |
| Accounting Ownership Convention Authority (§4.1) | SPR-MOD-002-001 | §E.2–§E.6, §F.1–§F.3 | ENG-024 | ADR-011, ADR-012 |
| Voucher Ownership Convention Authority (§4.2) | SPR-MOD-002-002 | §E.8–§E.10, §F.4–§F.6 | ENG-015, ENG-017, ENG-011, ENG-007, ENG-008 | ADR-032, ADR-051, ADR-053 |
| Ledger Posting Ownership Convention Authority (§4.3) | SPR-MOD-002-003 | §E.11–§E.12 | ENG-016 | ADR-013, ADR-051 |
| Ledger Immutability Convention Authority (§4.3) | SPR-MOD-002-003 | §E.12, §F.5 | ENG-016 | ADR-014, ADR-015 |
| Balance Integrity Convention Authority (§4.3) | SPR-MOD-002-003 | §E.13 | ENG-016, ENG-018 | ADR-013 |
| Ledger Access Boundary Convention Authority (§4.3) | SPR-MOD-002-003 | §J.4, §E.11–§E.13 | ENG-016 | ADR-011, ADR-032 |
| Financial Reporting Ownership Convention Authority (§4.4) | SPR-MOD-002-004 | §E.14–§E.18 | ENG-021, ENG-018 | ADR-013 |
| Ledger Consumption Convention Authority (§4.4) | SPR-MOD-002-004 | §E.15, §E.14, §E.16–§E.18 | ENG-021 | ADR-013 |
| Report Determinism Convention Authority (§4.4) | SPR-MOD-002-004 | §E.14, §E.16–§E.18 | ENG-021 | ADR-053 |
| Reporting Read Model Convention Authority (§4.4) | SPR-MOD-002-004 | §E.14–§E.18 | ENG-021 | ADR-013 |
| Financial Statement Boundary Convention Authority (§4.4) | SPR-MOD-002-004 | §J.5, §E.14–§E.18 | ENG-021 | ADR-014 |
| Tax Ownership Convention Authority (§4.5) | SPR-MOD-002-005 | §E.19–§E.20, §F.7 | ENG-012 | ADR-032 |
| Tax Calculation Boundary Convention Authority (§4.5) | SPR-MOD-002-005 | §J.5, §E.19–§E.21 | ENG-012 | ADR-014 |
| Tax Configuration Authority Convention (§4.5) | SPR-MOD-002-005 | §E.19, §E.6 | ENG-024 | ADR-032 |
| Compliance Readiness Convention Authority (§4.5) | SPR-MOD-002-005 | §E.21 | ENG-021 | ADR-014 |
| Tax Reporting Boundary Convention Authority (§4.5) | SPR-MOD-002-005 | §E.21, §J.5 | ENG-021 | ADR-014 |
| Period Authority Convention Authority (§4.6) | SPR-MOD-002-006 | §E.22, §F.8 | ENG-011, ENG-024 | ADR-014 |
| Financial Year Ownership Convention Authority (§4.6) | SPR-MOD-002-006 | §E.7, §E.23, §F.9, §F.11 | ENG-016, ENG-011 | ADR-014, ADR-015 |
| Period Close Boundary Convention Authority (§4.6) | SPR-MOD-002-006 | §J.5, §E.22, §F.4, §F.10 | ENG-016 | ADR-014 |
| Controlled Reopening Convention Authority (§4.6) | SPR-MOD-002-006 | §C.8, §E.22, §F.8 | ENG-011, ENG-004 | ADR-014 |
| Audit Review Boundary Convention Authority (§4.6) | SPR-MOD-002-006 | §E.24–§E.25, §F.12, §J.7 | ENG-004 | ADR-014 |
| Financial Freeze Convention Authority (§4.6) | SPR-MOD-002-006 | §J.6, §E.23 | ENG-016 | ADR-014 |
| Published events (`VoucherPosted`, `PeriodClosed`, `PaymentRecorded`, `ReceiptRecorded`, `BankReconciled`) (§9) | SPR-MOD-002-002 … 006 | §C.2, §C.7, §J.7 | ENG-005 | ADR-051 |
| Consumed events (`SalesInvoiceIssued`, `PurchaseInvoiceReceived`, `PayrollPosted`, `POSDayClosed`, `InventoryValuationChanged`) (§10) | SPR-MOD-002-003 … 006 | §D.6, §E.11 | ENG-005 | ADR-051 |
| Platform capability consumption — Identity, Tenancy, RBAC/ABAC, Localization, Audit collection | SPR-MOD-002-001 … 006 | §J.1–§J.3, §I | ENG-001, ENG-002, ENG-004, ENG-018 | ADR-011, ADR-032 |

No WEB-002 feature is absent from the traceability matrix. No authority in the Module Publication §4 lacks a WEB-002 conveyance. WEB-002 introduces no capability, master data entity, transaction, event, engine, or ADR beyond those declared by `MOD-002_MODULE_PUBLICATION`.

## O. Repository State Transition

`MOD002_PUBLICATION_COMPLETE` → **`MOD002_WEB_SOLUTION_DESIGN_COMPLETE`**

## References

- [`docs/45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md`](../../45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md)
- [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- [`docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`](../../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md)
- [`docs/60-solution-design/web/WEB-001_PLATFORM_ADMINISTRATION.md`](./WEB-001_PLATFORM_ADMINISTRATION.md) — reference implementation pattern
- [`docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`](../../15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md)
- [`docs/15-governance/SCREEN_IDENTIFIER_STANDARD.md`](../../15-governance/SCREEN_IDENTIFIER_STANDARD.md)
- [`docs/15-governance/FINDING_SEVERITY_STANDARD.md`](../../15-governance/FINDING_SEVERITY_STANDARD.md)
- [`docs/60-solution-design/README.md`](../README.md)
- [`docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`](../SOLUTION_DESIGN_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
