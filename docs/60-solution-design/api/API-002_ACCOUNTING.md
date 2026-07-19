---
title: "API-002 — Accounting API Solution Design Specification"
summary: "Phase 3 API Solution Design specification for MOD-002 Accounting. Derived exclusively from the Accounting Module Publication (with WEB-002 and MOB-002 referenced only for cross-platform terminology and workflow consistency). Defines API architecture, service groups, resource model, endpoint inventory, request/response standards, authorization, versioning, error behaviour, engine integration, cross-module service contracts, and cross-platform alignment. Introduces no new business requirements."
spec_id: "API-002"
family: "API"
source_module: "MOD-002"
source_module_name: "Accounting"
source_publication: "MOD-002_MODULE_PUBLICATION"
source_baseline: "MOD002_ACCOUNTING_BASELINE_v1"
source_module_prd: "docs/20-module-prds/accounting/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-002-001", "SPR-MOD-002-002", "SPR-MOD-002-003", "SPR-MOD-002-004", "SPR-MOD-002-005", "SPR-MOD-002-006"]
related_web_spec: "WEB-002"
related_mobile_spec: "MOB-002"
version: "1.0"
status: "Active"
lifecycle_state: "Active"
owner: "Accounting"
layer: "delivery"
updated: "2026-07-19"
tags: ["solution-design", "api", "phase-3", "SD-001_API_SPEC", "API-002", "MOD-002", "accounting"]
document_type: "API Solution Design Specification"
template: "SD-001_API_SPEC"
template_version: "v1.0"
governance_specification: "v1.0"
pass_classification: "Phase 3 — Solution Design — API — Read/Author with scoped verification"
related_engines: ["ENG-001", "ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-011", "ENG-012", "ENG-015", "ENG-016", "ENG-017", "ENG-018", "ENG-021", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-013", "ADR-014", "ADR-015", "ADR-032", "ADR-051", "ADR-053"]
dependencies:
  publication: "docs/45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md"
  baseline: "docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md"
  module_prd: "docs/20-module-prds/accounting/MODULE_PRD.md"
  sprint_plan: "docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md"
  web_reference: "docs/60-solution-design/web/WEB-002_ACCOUNTING.md"
  mobile_reference: "docs/60-solution-design/mobile/MOB-002_ACCOUNTING.md"
  api_reference_pattern: "docs/60-solution-design/api/API-001_PLATFORM_ADMINISTRATION.md"
---

# API-002 — Accounting API Solution Design Specification

> **Reference derivation only.** API-002 is an API-surface projection of the Accounting Module Publication [`MOD-002_MODULE_PUBLICATION`](../../45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md). It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. [`WEB-002`](../web/WEB-002_ACCOUNTING.md) and [`MOB-002`](../mobile/MOB-002_ACCOUNTING.md) are referenced only to maintain cross-platform terminology, workflow, and authorization consistency. Endpoint paths in §E are illustrative business-level shapes derived from Publication authorities; concrete payload schemas, wire formats, and infrastructure design remain out of scope. On any conflict with the Module Publication or its parent Module Baseline, the upstream artefact wins and API-002 is corrected in the same change.

## A. Overview

### A.1 Purpose

Define the API-surface through which authorized consumers — the Accounting Web application (WEB-002), the Accounting Mobile application (MOB-002), authorized internal Business OS services (Sales, Purchase, Inventory, Payroll, POS, Analytics), and approved external integrations — invoke the Accounting capabilities published in `MOD-002_MODULE_PUBLICATION`: Chart of Accounts and ledger hierarchy, fiscal calendar and accounting periods, the canonical Voucher Framework, journal creation and ledger posting, financial statements as deterministic ledger projections, taxation & compliance foundation, and period close & audit review — while honouring the ownership conventions (Voucher Ownership, Ledger Posting Ownership, Ledger Immutability, Balance Integrity, Ledger Access Boundary, Financial Reporting Ownership, Tax Ownership, Period Authority, Financial Year Ownership, Audit Review Boundary, Financial Freeze) that bind the module.

### A.2 Scope

In scope for API-002:

- Business-level API architecture (service boundaries, statelessness, authentication and authorization pipeline, tenant isolation).
- API domain decomposition into Foundation, Vouchers, Journal & Ledger, Financial Statements, Taxation, and Period Close & Audit.
- Business resource model, business-level endpoint inventory, and request/response standards.
- Authorization boundaries derived from `ADR-032` (RBAC + ABAC) and tenant isolation derived from `ADR-011`.
- Error behaviour, pagination/filtering/sorting, idempotency, concurrency, and versioning governance.
- Integration points with the 14 platform engines consumed by MOD-002 per Publication §11.
- Cross-module service contracts consumed and provided by MOD-002 per Publication §10, §12.
- Cross-platform alignment with WEB-002 and MOB-002.

Out of scope: Web-surface UX (belongs to WEB-002), mobile-surface UX (belongs to MOB-002), payload schemas, protocol tuning, database schema, infrastructure sizing, authentication mechanics (SSO, MFA, identity federation), statutory filing integrations (GST/GSTN, e-invoicing, e-way bill — Publication §15), consolidation across companies, budgeting/forecasting, AI-driven accounting analysis, and any business-rule authoring.

### A.3 Source Published Module

- **Module ID / Name:** MOD-002 Accounting
- **Publication:** [`MOD-002_MODULE_PUBLICATION`](../../45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md)
- **Baseline:** [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- **Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- **Sprint Plan:** [`docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`](../../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md)
- **Sprint PRDs:** `SPR-MOD-002-001` … `SPR-MOD-002-006`
- **Related Web Specification:** [`WEB-002`](../web/WEB-002_ACCOUNTING.md) — consistency reference only.
- **Related Mobile Specification:** [`MOB-002`](../mobile/MOB-002_ACCOUNTING.md) — consistency reference only.

### A.4 Version

- **Specification Version:** 1.0
- **Aligned to Publication Version:** MOD-002 v1.0

### A.5 Endpoint Identifier Convention

Every endpoint in §E is assigned a stable business-level identifier of the form `API002-EP-NNN`. Endpoint IDs are unique within this specification and referenced by the Traceability Matrix (§P). Every endpoint referenced elsewhere in this specification MUST resolve to a row in §E.

### A.6 Traceability References

See §P for the full authority-to-resource-to-endpoint-to-engine-to-ADR matrix, cross-referenced to the parity WEB-002 pages and MOB-002 screens. Frontmatter records the full chain (Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → Module Publication → API-002).

## B. API Architecture

Business-level architecture only. No protocol, framework, or infrastructure design.

### B.1 Service Boundaries

The Accounting API is decomposed into six business domains, each aligned to a Publication §4 Sprint authority group: **Foundation** (Chart of Accounts, Cost Centre, Bank Account master, Fiscal Year, Accounting Period, base accounting configuration), **Vouchers** (Voucher Framework across Journal / Payment / Receipt / Contra / Credit-Debit Note), **Journal & Ledger** (Journal Entry, Ledger Posting, Reversal, Ledger Read Model), **Financial Statements** (Trial Balance, General Ledger, P&L, Balance Sheet, Cash Flow), **Taxation** (Tax Codes, Tax Applicability, Tax Determination, Tax Reports), and **Period Close & Audit** (Period Lifecycle, Financial Year Close, Closing Adjustments, Opening Balances, Accounting Audit Review). Each domain owns its resource model, endpoint surface, and lifecycle transitions; cross-domain interactions occur only through Published Module authorities and platform engines. No cross-domain shortcut is exposed.

### B.2 Stateless Design

Every API request is self-describing. Session state is not held by the API surface; caller identity, tenant scope, company scope, and authorization scope are resolved from the caller's credentials on every request via `ENG-001` and `ADR-032`. Long-running lifecycles (voucher approvals, period close, financial-year close, ledger reconciliation, report generation) are represented as resources with explicit lifecycle state — never as transient session state.

### B.3 Authentication Pipeline

All consumers authenticate through `ENG-001` (Identity Engine). Authentication mechanics remain platform concerns and are not defined by this specification. The API surface accepts only authenticated principals; anonymous access is not exposed. Service-to-service identity for downstream modules (MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017) is expressed under the same `ENG-001` boundary.

### B.4 Authorization Pipeline

Every request is authorized by `ENG-002` (Authorization) with grants managed by MOD-001 per `ADR-032` (RBAC + ABAC). Authorization decisions consider role, tenant scope, company scope, branch, and attribute-based context (voucher type, account, period, cost centre). Denials produce a business-level "unauthorized" outcome that discloses no protected content or existence beyond the caller's role.

### B.5 Tenant Isolation

Tenant isolation is enforced per `ADR-011`. Every request is executed within the caller's tenant scope; cross-tenant access is not exposed on this surface. Cross-company access within a tenant is subject to explicit authorization per §B.4.

### B.6 Ledger Access Boundary

Per the **Ledger Access Boundary Convention Authority** (Publication §4.3), downstream modules consume ledger state only through this API. No endpoint permits direct writes to ledger tables. All ledger movements originate from posted vouchers via the Voucher Framework (§C.2) and the Posting Engine (`ENG-016`).

## C. API Domains

Domains correspond to Publication §4 Sprint authority groupings. No new domains introduced.

### C.1 Foundation (SPR-MOD-002-001)

- **Business Purpose.** Expose Chart of Accounts, ledger hierarchy, Cost Centre, Bank Account master, Fiscal Year, Accounting Periods, and base accounting configuration.
- **Authorities.** Accounting Ownership Convention Authority (Publication §4.1).
- **Primary Business Operations.** CRUD on Chart of Accounts, Cost Centres, Bank Accounts within authorized scope; open/close Fiscal Years subject to preconditions; retrieve accounting configuration; capture opening balances.

### C.2 Vouchers (SPR-MOD-002-002)

- **Business Purpose.** Expose the canonical Voucher Framework across all voucher types.
- **Authorities.** Voucher Ownership Convention Authority (Publication §4.2).
- **Primary Business Operations.** Draft / submit / approve / cancel / reverse Journal, Payment, Receipt, Contra, and Credit/Debit Note vouchers; retrieve voucher detail and lifecycle history; attach supporting documents via `ENG-008`; obtain voucher numbers via `ENG-017`.

### C.3 Journal & Ledger (SPR-MOD-002-003)

- **Business Purpose.** Expose journal entries produced from posted vouchers, ledger read model, ledger balances, and reversal postings.
- **Authorities.** Ledger Posting Ownership Convention Authority; Ledger Immutability Convention Authority; Balance Integrity Convention Authority; Ledger Access Boundary Convention Authority (Publication §4.3).
- **Primary Business Operations.** Retrieve journals for a voucher; read ledger movements by account / cost centre / period / currency; retrieve ledger balances; create reversal postings via reversal voucher; perform bank reconciliation.

### C.4 Financial Statements (SPR-MOD-002-004)

- **Business Purpose.** Expose Trial Balance, General Ledger report, Profit & Loss, Balance Sheet, and Cash Flow as deterministic projections of authoritative ledger movements.
- **Authorities.** Financial Reporting Ownership Convention Authority; Ledger Consumption Convention Authority; Report Determinism Convention Authority; Reporting Read Model Convention Authority; Financial Statement Boundary Convention Authority (Publication §4.4).
- **Primary Business Operations.** Run statements over an authorized scope and period; retrieve statement drill-down; request statement export via `ENG-021`. Statement endpoints are strictly read-only over the ledger read model.

### C.5 Taxation (SPR-MOD-002-005)

- **Business Purpose.** Expose Tax Code master, tax applicability, tax determination, tax classifications, and tax reports.
- **Authorities.** Tax Ownership Convention Authority; Tax Calculation Boundary Convention Authority; Tax Configuration Authority Convention; Compliance Readiness Convention Authority; Tax Reporting Boundary Convention Authority (Publication §4.5).
- **Primary Business Operations.** CRUD on Tax Codes within authorized scope; resolve tax applicability for a business context; compute tax over a candidate line (read-only, non-posting); retrieve tax reports. Tax calculation MUST NOT create vouchers, modify journals, or modify ledgers.

### C.6 Period Close & Audit (SPR-MOD-002-006)

- **Business Purpose.** Expose Accounting Period lifecycle, Financial Year close, closing-adjustment governance, opening-balance preparation, and the business-level Accounting Audit Review projection.
- **Authorities.** Period Authority Convention Authority; Financial Year Ownership Convention Authority; Period Close Boundary Convention Authority; Controlled Reopening Convention Authority; Audit Review Boundary Convention Authority; Financial Freeze Convention Authority (Publication §4.6).
- **Primary Business Operations.** Transition period lifecycle (Open → Soft Closed → Closed → Reopened); submit closing adjustment vouchers; capture year-end carry forward and opening balances; project accounting audit events read-only over `ENG-004` outputs.

## D. Resource Model

Resources are inherited from Publication §7 (Master Data), §8 (Transactions), and §9 (Events). No new resources introduced. No wire schemas.

| Resource | Ownership | Lifecycle | Notes |
| --- | --- | --- | --- |
| **Chart of Accounts (Account)** | MOD-002 (SPR-001) | Draft → Active → Inactive → Archived | Hierarchical; scope-bound. |
| **Cost Centre** | MOD-002 (SPR-001) | Draft → Active → Inactive → Archived | Optional analytical dimension. |
| **Bank Account** | MOD-002 (SPR-001) | Draft → Active → Inactive → Archived | Sub-ledger of Chart of Accounts. |
| **Fiscal Year** | MOD-002 (SPR-001) | Open → Closed → Archived | Owns the accounting period sequence. |
| **Accounting Period** | MOD-002 (SPR-001, SPR-006) | Open → Soft Closed → Closed → Reopened | Reopen through Controlled Reopening Convention. |
| **Voucher Type** | MOD-002 (SPR-002) | Draft → Active → Inactive → Archived | Binds numbering series and approval hooks. |
| **Numbering Series (Accounting)** | MOD-002 (SPR-002) | Draft → Active → Inactive → Archived | Consumed via `ENG-017`. |
| **Voucher (Journal / Payment / Receipt / Contra / Credit-Debit Note)** | MOD-002 (SPR-002) | Draft → Submitted → Approved → Posted → Cancelled / Reversed | Immutable after Posted; corrections via reversal. |
| **Journal Entry** | MOD-002 (SPR-003) | Emitted from posted voucher | Immutable; corresponds 1:1 to a posted voucher. |
| **Ledger Posting** | MOD-002 (SPR-003) | Immutable | Governed by Ledger Immutability Convention. |
| **Reversal Posting** | MOD-002 (SPR-003) | Immutable | Created via reversal voucher; preserves original. |
| **Ledger Balance** (read model) | MOD-002 (SPR-003) | Deterministic projection | Read-only; per account / tenant / currency / period. |
| **Customer AR Balance** (sub-ledger) | MOD-002 (SPR-003) | Deterministic projection | Read-only sub-ledger. |
| **Supplier AP Balance** (sub-ledger) | MOD-002 (SPR-003) | Deterministic projection | Read-only sub-ledger. |
| **Bank Reconciliation** (transaction) | MOD-002 (SPR-003) | Draft → Submitted → Reconciled | Emits `BankReconciled`. |
| **Trial Balance / GL / P&L / Balance Sheet / Cash Flow** (report) | MOD-002 (SPR-004) | Deterministic projection | Delivered via `ENG-021`. |
| **Statement Export Request** (transaction) | MOD-002 (SPR-004) | Requested → Preparing → Ready → Delivered / Failed | Delivered via `ENG-021`. |
| **Tax Code** | MOD-002 (SPR-005) | Draft → Active → Inactive → Archived | Applicability and determination bound to Tax Code. |
| **Tax Applicability Rule** | MOD-002 (SPR-005) | Draft → Active → Inactive → Archived | Consumed via `ENG-012`. |
| **Tax Report** | MOD-002 (SPR-005) | Deterministic projection | Statutory filing itself is out of scope (Publication §15). |
| **Closing Adjustment Voucher** | MOD-002 (SPR-006) | Follows Voucher lifecycle | Bounded by Period Close governance. |
| **Opening Balance Entry** | MOD-002 (SPR-006) | Draft → Applied → Archived | Prepared at Financial Year open. |
| **Accounting Audit Event** (read-only projection) | `ENG-004` (owner) | Governed by `ENG-004` and `ADR-014` | Read-only through Audit Review Boundary. |
| **Attachment** | `ENG-008` (owner) | Governed by `ENG-008` | Attached to voucher / reconciliation / adjustment. |

Events emitted (Publication §9, delivered via `ENG-005` / `ENG-024` under the Transactional Outbox pattern per `ADR-051`): `VoucherPosted`, `PeriodClosed`, `PaymentRecorded`, `ReceiptRecorded`, `BankReconciled`. Events consumed (Publication §10): `SalesInvoiceIssued`, `PurchaseInvoiceReceived`, `PayrollPosted`, `POSDayClosed`, `InventoryValuationChanged`.

## E. Endpoint Inventory

Business-level endpoint identities. Paths are illustrative shapes; concrete wire contracts are established in downstream implementation artefacts. Every endpoint carries a stable `API002-EP-NNN` identifier, HTTP verb (business-level), path template, business purpose, authorization scope, and idempotency posture. Where the verb is a lifecycle transition, the operation is idempotent under the same idempotency key.

### E.1 Foundation

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API002-EP-001` | GET | `/v1/accounting/accounts` | List Chart of Accounts entries in scope | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-002` | POST | `/v1/accounting/accounts` | Create an account | Controller | Yes (keyed) |
| `API002-EP-003` | GET | `/v1/accounting/accounts/{accountId}` | Retrieve account detail | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-004` | PATCH | `/v1/accounting/accounts/{accountId}` | Update account attributes | Controller | Yes |
| `API002-EP-005` | POST | `/v1/accounting/accounts/{accountId}/lifecycle` | Activate / deactivate / archive an account | Controller | Yes (keyed) |
| `API002-EP-006` | GET | `/v1/accounting/cost-centres` | List cost centres | Accountant / Controller | Yes |
| `API002-EP-007` | POST | `/v1/accounting/cost-centres` | Create a cost centre | Controller | Yes (keyed) |
| `API002-EP-008` | PATCH | `/v1/accounting/cost-centres/{costCentreId}` | Update cost centre | Controller | Yes |
| `API002-EP-009` | GET | `/v1/accounting/bank-accounts` | List bank accounts | Accountant / Controller | Yes |
| `API002-EP-010` | POST | `/v1/accounting/bank-accounts` | Create a bank account | Controller | Yes (keyed) |
| `API002-EP-011` | PATCH | `/v1/accounting/bank-accounts/{bankAccountId}` | Update bank account | Controller | Yes |
| `API002-EP-012` | GET | `/v1/accounting/fiscal-years` | List fiscal years | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-013` | POST | `/v1/accounting/fiscal-years` | Open a fiscal year | Controller / CFO | Yes (keyed) |
| `API002-EP-014` | GET | `/v1/accounting/periods` | List accounting periods | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-015` | GET | `/v1/accounting/periods/{periodId}` | Retrieve period detail incl. lifecycle state | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-016` | GET | `/v1/accounting/configuration` | Retrieve base accounting configuration for scope | Accountant / Controller / CFO | Yes |
| `API002-EP-017` | PATCH | `/v1/accounting/configuration` | Update base accounting configuration | Controller / CFO | Yes |

### E.2 Vouchers

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API002-EP-020` | GET | `/v1/accounting/voucher-types` | List voucher types | Accountant / Controller | Yes |
| `API002-EP-021` | GET | `/v1/accounting/vouchers` | List vouchers within scope and filter | Accountant / Controller / CFO / Auditor / AP Clerk / AR Clerk | Yes |
| `API002-EP-022` | POST | `/v1/accounting/vouchers` | Create a voucher (Journal / Payment / Receipt / Contra / Credit-Debit Note) as draft | Accountant / AP Clerk / AR Clerk | Yes (keyed) |
| `API002-EP-023` | GET | `/v1/accounting/vouchers/{voucherId}` | Retrieve voucher detail | Accountant / Controller / CFO / Auditor / AP Clerk / AR Clerk | Yes |
| `API002-EP-024` | PATCH | `/v1/accounting/vouchers/{voucherId}` | Update a draft voucher | Accountant / AP Clerk / AR Clerk | Yes |
| `API002-EP-025` | POST | `/v1/accounting/vouchers/{voucherId}/submit` | Submit a voucher for approval | Accountant / AP Clerk / AR Clerk | Yes (keyed) |
| `API002-EP-026` | POST | `/v1/accounting/vouchers/{voucherId}/decision` | Approve or reject a submitted voucher | Controller / CFO | Yes (keyed) |
| `API002-EP-027` | POST | `/v1/accounting/vouchers/{voucherId}/cancel` | Cancel a non-posted voucher | Accountant / Controller | Yes (keyed) |
| `API002-EP-028` | POST | `/v1/accounting/vouchers/{voucherId}/reversal` | Create a reversal voucher of a posted voucher | Controller / CFO | Yes (keyed) |
| `API002-EP-029` | GET | `/v1/accounting/vouchers/{voucherId}/lifecycle-history` | Retrieve voucher lifecycle history | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-030` | POST | `/v1/accounting/vouchers/{voucherId}/attachments` | Attach a supporting document | Accountant / AP Clerk / AR Clerk | Yes (keyed) |
| `API002-EP-031` | GET | `/v1/accounting/vouchers/{voucherId}/attachments` | List voucher attachments | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-032` | GET | `/v1/accounting/vouchers/{voucherId}/attachments/{attachmentId}` | Retrieve a voucher attachment (delivered via `ENG-008`) | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-033` | GET | `/v1/accounting/numbering-series` | List numbering series in scope | Controller | Yes |
| `API002-EP-034` | POST | `/v1/accounting/numbering-series` | Author a numbering series | Controller | Yes (keyed) |

### E.3 Journal & Ledger

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API002-EP-040` | GET | `/v1/accounting/journal-entries` | List journal entries within scope and filter | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-041` | GET | `/v1/accounting/journal-entries/{journalEntryId}` | Retrieve journal entry detail | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-042` | GET | `/v1/accounting/vouchers/{voucherId}/journal-entries` | Retrieve the journal entry produced by a posted voucher | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-043` | GET | `/v1/accounting/ledger-movements` | Query ledger movements by account / cost centre / period / currency | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-044` | GET | `/v1/accounting/ledger-balances` | Retrieve ledger balance for an account, scope, and period | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-045` | GET | `/v1/accounting/sub-ledgers/ar` | Retrieve customer AR balances (read-only sub-ledger) | Accountant / Controller / CFO / Auditor / AR Clerk | Yes |
| `API002-EP-046` | GET | `/v1/accounting/sub-ledgers/ap` | Retrieve supplier AP balances (read-only sub-ledger) | Accountant / Controller / CFO / Auditor / AP Clerk | Yes |
| `API002-EP-047` | GET | `/v1/accounting/bank-reconciliations` | List bank reconciliations | Accountant / Controller | Yes |
| `API002-EP-048` | POST | `/v1/accounting/bank-reconciliations` | Create a bank reconciliation draft | Accountant | Yes (keyed) |
| `API002-EP-049` | POST | `/v1/accounting/bank-reconciliations/{reconciliationId}/submit` | Submit a reconciliation for posting | Accountant / Controller | Yes (keyed) |
| `API002-EP-050` | GET | `/v1/accounting/bank-reconciliations/{reconciliationId}` | Retrieve reconciliation detail | Accountant / Controller / Auditor | Yes |

### E.4 Financial Statements

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API002-EP-060` | GET | `/v1/accounting/reports/trial-balance` | Run Trial Balance over an authorized scope and period | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-061` | GET | `/v1/accounting/reports/general-ledger` | Run General Ledger report | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-062` | GET | `/v1/accounting/reports/profit-and-loss` | Run Profit & Loss statement | Controller / CFO / Auditor | Yes |
| `API002-EP-063` | GET | `/v1/accounting/reports/balance-sheet` | Run Balance Sheet | Controller / CFO / Auditor | Yes |
| `API002-EP-064` | GET | `/v1/accounting/reports/cash-flow` | Run Cash Flow statement | Controller / CFO / Auditor | Yes |
| `API002-EP-065` | GET | `/v1/accounting/reports/{reportKey}/drilldown` | Retrieve report drill-down to journal entries | Accountant / Controller / CFO / Auditor | Yes |
| `API002-EP-066` | POST | `/v1/accounting/reports/exports` | Request a statement export via `ENG-021` | Accountant / Controller / CFO / Auditor | Yes (keyed) |
| `API002-EP-067` | GET | `/v1/accounting/reports/exports/{exportId}` | Retrieve export request status | Accountant / Controller / CFO / Auditor | Yes |

### E.5 Taxation

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API002-EP-080` | GET | `/v1/accounting/tax-codes` | List tax codes in scope | Tax Officer / Controller / Accountant | Yes |
| `API002-EP-081` | POST | `/v1/accounting/tax-codes` | Create a tax code | Tax Officer / Controller | Yes (keyed) |
| `API002-EP-082` | GET | `/v1/accounting/tax-codes/{taxCodeId}` | Retrieve tax code detail | Tax Officer / Controller / Accountant | Yes |
| `API002-EP-083` | PATCH | `/v1/accounting/tax-codes/{taxCodeId}` | Update a tax code | Tax Officer / Controller | Yes |
| `API002-EP-084` | GET | `/v1/accounting/tax/applicability` | Resolve tax applicability for a business context | Tax Officer / Controller / Accountant / AR Clerk / AP Clerk | Yes |
| `API002-EP-085` | POST | `/v1/accounting/tax/determination` | Compute tax over a candidate line (read-only; MUST NOT post) | Tax Officer / Controller / Accountant | Yes |
| `API002-EP-086` | GET | `/v1/accounting/tax/reports` | List available tax reports | Tax Officer / Controller / CFO / Auditor | Yes |
| `API002-EP-087` | GET | `/v1/accounting/tax/reports/{reportKey}` | Run a tax report over an authorized scope and period | Tax Officer / Controller / CFO / Auditor | Yes |

### E.6 Period Close & Audit

| Endpoint ID | Verb | Path | Business Purpose | Auth Scope | Idempotent |
| --- | --- | --- | --- | --- | --- |
| `API002-EP-100` | POST | `/v1/accounting/periods/{periodId}/soft-close` | Transition a period to Soft Closed | Controller / CFO | Yes (keyed) |
| `API002-EP-101` | POST | `/v1/accounting/periods/{periodId}/close` | Transition a period to Closed | Controller / CFO | Yes (keyed) |
| `API002-EP-102` | POST | `/v1/accounting/periods/{periodId}/reopen` | Controlled reopening of a closed period | CFO | Yes (keyed) |
| `API002-EP-103` | POST | `/v1/accounting/fiscal-years/{fiscalYearId}/close` | Close a Financial Year with year-end carry forward | CFO | Yes (keyed) |
| `API002-EP-104` | GET | `/v1/accounting/opening-balances` | Retrieve prepared opening balances | Controller / CFO / Accountant / Auditor | Yes |
| `API002-EP-105` | POST | `/v1/accounting/opening-balances` | Capture / update opening balance entries prior to first period post | Controller / CFO | Yes (keyed) |
| `API002-EP-106` | POST | `/v1/accounting/closing-adjustments` | Author a closing adjustment voucher (routed through §E.2) | Controller / CFO | Yes (keyed) |
| `API002-EP-107` | GET | `/v1/accounting/audit/events` | Query accounting audit events (read-only projection of `ENG-004`) | Auditor / Controller / CFO | Yes |
| `API002-EP-108` | GET | `/v1/accounting/audit/events/{eventId}` | Retrieve an accounting audit event detail | Auditor / Controller / CFO | Yes |
| `API002-EP-109` | POST | `/v1/accounting/audit/exports` | Request an accounting audit export | Auditor / CFO | Yes (keyed) |
| `API002-EP-110` | GET | `/v1/accounting/audit/exports/{exportId}` | Retrieve audit export status | Auditor / CFO | Yes |

## F. Request Models

Business-level request conventions only. No wire schemas.

- **Resource Identity.** Every resource is addressed by a stable, tenant-scoped identifier owned by MOD-002; identifiers are opaque and immutable.
- **Scope Envelope.** Every request carries or is bound to an authorization scope (tenant, company, branch, financial year, period as applicable). Scope mismatch against the caller's authorization is rejected per §I.
- **Lifecycle Transitions.** Lifecycle mutations (submit / decision / cancel / reversal / soft-close / close / reopen / fiscal-year close) accept an idempotency key and, where applicable, a business reason.
- **Voucher Line Semantics.** Voucher creation and update requests carry line-level intent (account, cost centre, debit/credit, currency, amount, optional tax hint). Every posted voucher MUST balance (Publication §6). The API surface enforces balance as a validation invariant; it does not post — posting is delegated to `ENG-016`.
- **Money Representation** (`ADR-013`). Money-valued fields are represented in an unambiguous minor-unit form with currency scope; no float truncation is exposed.
- **Attachment References.** Attachment references resolve via `ENG-008`; the API surface never carries binary content.
- **Idempotency Keys** (`ADR-053`). Every keyed mutation accepts a caller-supplied idempotency key per §K.

## G. Response Models

Business-level response conventions only. No wire schemas.

- **Envelope.** Every response conveys the resource plus a stable metadata block (resource identity, lifecycle state, scope, audit-visibility, optimistic-concurrency token). No implementation detail leaks into the envelope.
- **Timestamps.** All timestamps are UTC and carry an unambiguous ISO representation.
- **Locale-Aware Fields.** Locale-aware content is resolved via `ENG-018`.
- **Voucher Response.** Voucher responses carry the voucher body, line summary, lifecycle state, numbering, related journal entry reference (once posted), and attachment references.
- **Ledger Response.** Ledger movement and balance responses carry account, cost centre, period, currency, and deterministic aggregation identifiers to preserve the Balance Integrity Convention (Publication §4.3).
- **Report Response.** Statement responses carry the report key, scope, period, resolution timestamp, and drill-down reference; they do not carry mutation affordances (Report Determinism Convention).
- **Audit Response.** Accounting audit event responses carry the event identity, actor scope, event category, and object reference; no mutation is exposed (Audit Review Boundary).

## H. Validation Rules

Rules are inherited verbatim from Publication §6 and Module PRD §7. Key API-visible invariants:

- Every posted voucher MUST balance: sum of debits equals sum of credits.
- Posted ledger movements are immutable; corrections occur through reversal postings only.
- A closed period cannot be posted into; posting into a Soft Closed period is limited to closing adjustments per §E.6.
- Reversal creates a new voucher; the original voucher is never mutated.
- Tax calculation (§E.5) MUST NOT create vouchers, modify journals, or modify ledger entries.
- Financial statements (§E.4) are deterministic projections and MUST NOT mutate ledger, voucher, or journal state.
- Downstream modules consume ledger state only through this API; no endpoint permits direct ledger writes (Ledger Access Boundary Convention).
- A financial year cannot be closed while open periods, unresolved unposted vouchers, or unresolved downstream-module preconditions exist.
- Numbering series (`ENG-017`) allocations are gap-free at the business level; API surface exposes the allocated number, never the internal sequence state.
- Tax code deactivation is blocked while active applicability rules or in-flight vouchers reference it.

## I. Authentication & Authorization

Business-level expectations only. Implementation is delegated to the platform engines and ADRs cited.

- **OAuth / SSO Handoff.** All consumer categories authenticate via `ENG-001`. SSO / MFA mechanics are platform concerns and out of scope.
- **Session Lifecycle.** Session credentials follow the Platform Identity Engine's lifecycle; expiry, refresh, and revocation are `ENG-001` concerns. The API surface honours revocation on every request.
- **RBAC + ABAC.** Every request is evaluated by `ENG-002` with grants managed by MOD-001 per `ADR-032`. Role membership provides the coarse permission set; attribute-based context (tenant, company, branch, voucher type, account, period) narrows the decision.
- **Service Identity.** Cross-module service-to-service calls from MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, and MOD-017 carry a service identity under the same `ENG-001` boundary and honour the same RBAC + ABAC evaluation.
- **Cross-Tenant Access.** Not exposed on this surface (§B.5).

## J. Error Model

Business-level error behaviour. No protocol-level status catalog.

- **Standard Error Envelope.** Every error response conveys a business error category, a human-readable summary, a stable business error identifier suitable for support and audit correlation, and a correlation identifier for tracing. No stack traces, protocol codes beyond the standard set, or internal implementation identifiers are leaked.
- **Correlation Identifiers.** Every request MAY carry a caller-supplied correlation identifier; every response — success and error — echoes a stable correlation identifier for audit traceability via `ENG-004`.
- **Status Code Mapping.** Success responses use the standard success band; authorization denials use the standard authorization-denied band; validation failures use the standard validation band; resource-not-found uses the standard not-found band; conflicts (idempotency collision, optimistic-concurrency stale token, lifecycle precondition) use the standard conflict band; engine unavailability uses the standard unavailable band. The precise codes and their business meaning are fixed at implementation time under §M.
- **Validation Failures.** Precise about which business field is invalid, without leaking business content beyond the caller's authorization.
- **Authorization Failures.** Disclose no protected content or existence beyond what the caller's role permits; denials are audited via `ENG-004`.
- **Business Rule Violations.** Return the applicable business rule identifier from §H so the caller can present a coherent remediation (e.g. "voucher does not balance", "period is closed", "financial year has unresolved preconditions").
- **Engine Failures.** Failures propagated from `ENG-011` (approval), `ENG-016` (posting), `ENG-017` (numbering), `ENG-018` (currency), `ENG-019` (tax — via Publication surface), `ENG-021` (reporting) are surfaced as retryable or non-retryable business-level failures without leaking engine-internal state.
- **Retry Guidance.** Idempotent operations (GET, PATCH, keyed mutations) are safe to retry under the same idempotency key. Non-idempotent operations MUST NOT be retried without a fresh idempotency key. Retry timing follows the platform back-off convention.

## K. Pagination, Filtering, Sorting & Search

- **Pagination.** Every list endpoint (`API002-EP-001, -006, -009, -012, -014, -020, -021, -033, -040, -043, -045, -046, -047, -080, -086, -107`) supports stable, opaque cursor-style pagination bounded by an implementation-declared maximum page size.
- **Filtering.** Filtering is limited to business fields declared by the Publication. Voucher filtering supports voucher type, lifecycle state, scope, date range, actor, and reference. Ledger filtering supports account, cost centre, period, currency, and voucher reference. Audit filtering supports actor, scope, time range, event category, and object reference.
- **Sorting.** Sorting is limited to stable business fields (identifier, effective date, lifecycle timestamp, updated timestamp).
- **Search.** Free-text search over voucher narrations and account descriptions is scope-bound and honours authorization. Report searches never bypass the ledger read model.
- **Field Selection.** Optional field selection is not exposed at the business-API level; response envelopes are stable.

## L. File & Attachment Interfaces

Every file/attachment interface is delivered via `ENG-008` (Attachment Engine) as authorized by Publication §11.

- Voucher attachments are exposed at `API002-EP-030` … `API002-EP-032`. The API surface never carries binary content; attachment references resolve through `ENG-008`.
- Statement and audit exports (`API002-EP-066`, `API002-EP-067`, `API002-EP-109`, `API002-EP-110`) are represented as long-running Export Request resources; delivery is governed by `ENG-021` and `ENG-004` respectively.
- No file interface is exposed outside these endpoints; direct ledger, journal, or period file interfaces are not permitted (Ledger Access Boundary, Audit Review Boundary).

## M. Event & Notification Interfaces

- **Emitted Events** (Publication §9). Emitted only through `ENG-005` under the Transactional Outbox pattern (`ADR-051`) with configuration hierarchy resolved via `ENG-024`.
  - `VoucherPosted` — emitted on transition to Posted (§E.2, §E.3).
  - `PeriodClosed` — emitted on transition to Closed (`API002-EP-101`, `API002-EP-103`).
  - `PaymentRecorded` — emitted on Payment Voucher post (§E.2, §E.3).
  - `ReceiptRecorded` — emitted on Receipt Voucher post (§E.2, §E.3).
  - `BankReconciled` — emitted on Bank Reconciliation post (`API002-EP-049`).
- **Consumed Events** (Publication §10). Delivered via `ENG-005`; consumption is read-only and never redefines source-module semantics.
  - `SalesInvoiceIssued` (MOD-003), `PurchaseInvoiceReceived` (MOD-004), `PayrollPosted` (MOD-008), `POSDayClosed` (MOD-015), `InventoryValuationChanged` (MOD-005).
- **Notifications.** Long-running outcomes (approval decision, period close, financial-year close, export ready) surface both through the resource lifecycle state and, where the notification policy authorized by Publication §11 applies, through the platform notification surface.

No new event contracts are introduced by this specification.

## N. Engine Integration Mapping

Only the 14 engines consumed by MOD-002 per Publication §11 are enumerated. No new engine dependencies introduced.

| Engine | Consumption Surface |
| --- | --- |
| **`ENG-001` (Identity)** | Authentication pipeline (§B.3, §I). |
| **`ENG-002` (Authorization)** | Authorization pipeline on every request (§B.4, §I) per `ADR-032`. |
| **`ENG-004` (Audit)** | Every state-changing endpoint contributes an audit record; `API002-EP-107` … `API002-EP-110` are read-only projections per `ADR-014`. |
| **`ENG-005` (Event)** | Emission of Publication §9 events under Transactional Outbox (`ADR-051`); consumption of Publication §10 events. |
| **`ENG-007` (Document)** | Voucher documents and statement rendering support. |
| **`ENG-008` (Attachment)** | Voucher and reconciliation attachments (§L). |
| **`ENG-011` (Approval)** | Voucher approval decision (`API002-EP-026`), period/year lifecycle approvals, tax and closing adjustment approvals. |
| **`ENG-012` (Rules)** | Tax applicability and determination (§E.5); voucher balance and period preconditions. |
| **`ENG-015` (Voucher)** | Canonical voucher lifecycle behind §E.2 and closing adjustments (§E.6). |
| **`ENG-016` (Posting)** | Journal creation and ledger posting behind §E.3; reversal postings. |
| **`ENG-017` (Numbering)** | Numbering series allocation for §E.2 vouchers per configured series. |
| **`ENG-018` (Currency)** | Currency resolution, revaluation, and locale-aware money presentation across §E.3–§E.6. |
| **`ENG-021` (Reporting)** | Trial Balance / GL / P&L / Balance Sheet / Cash Flow generation and statement export (§E.4); tax report generation (§E.5). |
| **`ENG-024` (Configuration)** | Effective configuration resolution for numbering, approval thresholds, tax configuration, close policies. |

Cross-cutting alignments:

- **Audit Engine (`ENG-004`).** Every state-changing endpoint contributes an audit record. No caller can suppress the audit record.
- **Configuration Engine (`ENG-024`).** All API behaviour that depends on tenant/company-scoped configuration (numbering, approval thresholds, retention windows, tax configuration, period-close policy) resolves via `ENG-024`.

## O. Cross-Module Service Contracts

Cross-module interactions occur only through Published Module authorities and published events (Publication §10, §12). No cross-module shortcut is exposed.

- **MOD-001 Platform Administration (upstream).** Consumes MOD-001 for tenancy (`ADR-011`), organization/company/branch/financial-year masters, users/roles/permissions (`ADR-032`), configuration hierarchy (via `ENG-024`), localization (`ENG-018`), and audit review (via `ENG-004`). API-002 endpoints resolve scope, role, and configuration from MOD-001's authoritative surfaces (API-001).
- **MOD-003 Sales (downstream consumer).** Consumes `API002-EP-021`–`API002-EP-028` to create Sales-originated vouchers through the Accounting voucher contract; consumes `API002-EP-045` (AR sub-ledger), `API002-EP-060`–`API002-EP-065` (statements). Emits `SalesInvoiceIssued` consumed by MOD-002.
- **MOD-004 Purchase (downstream consumer).** Consumes `API002-EP-021`–`API002-EP-028` for Purchase-originated vouchers; `API002-EP-046` (AP sub-ledger). Emits `PurchaseInvoiceReceived` consumed by MOD-002.
- **MOD-005 Inventory (downstream contributor).** Emits `InventoryValuationChanged` consumed by MOD-002 for inventory valuation postings via the voucher contract.
- **MOD-008 Payroll (downstream consumer).** Consumes `API002-EP-021`–`API002-EP-028` for payroll-originated vouchers. Emits `PayrollPosted` consumed by MOD-002.
- **MOD-015 POS (downstream consumer).** Emits `POSDayClosed` consumed by MOD-002 for day-close postings via the voucher contract.
- **MOD-017 Analytics (downstream reader).** Consumes read-only projections (`API002-EP-043`, `API002-EP-044`, `API002-EP-060`–`API002-EP-065`, `API002-EP-107`) for cross-module analytics; never mutates ledger, voucher, or period state.

Direct ledger, journal, or period-state writes from any downstream module are forbidden by the Ledger Access Boundary Convention (Publication §4.3).

## O-bis. Non-functional Requirements

Business-facing envelopes only; no infrastructure sizing.

- **Performance.**
  - Interactive reads (`API002-EP-001, -003, -006, -009, -012, -014, -020, -021, -023, -040, -041, -043, -044, -045, -046, -080, -082, -107, -108`) inherit the platform interactive latency envelope declared in Module PRD §11.
  - Interactive writes (voucher CRUD, submit, decision, cancel, reversal, cost-centre / account / bank-account create) inherit the interactive envelope.
  - Long-running operations (`API002-EP-066`, `API002-EP-067`, `API002-EP-101`, `API002-EP-102`, `API002-EP-103`, `API002-EP-109`, `API002-EP-110`) inherit the platform batch envelope; callers poll for completion.
  - Statement generation (§E.4) is bounded by the ledger read model resolution envelope declared by the Reporting Read Model Convention.
- **Concurrency.** Every mutating operation on a stateful resource (voucher, period, financial year, tax code, opening balance) honours optimistic-concurrency tokens (§Q). Voucher post is serialized per voucher; period lifecycle transitions are serialized per period.
- **Reliability.** All event emissions (§M) follow the Transactional Outbox pattern (`ADR-051`); no event is lost across a mutation boundary. Idempotency (`ADR-053`) guarantees safe replay of keyed mutations.
- **Auditability.** Every state-changing endpoint contributes an audit record via `ENG-004` per `ADR-014`. The Accounting audit projection (§E.6) is strictly read-only.
- **Security.** Multi-tenant isolation per `ADR-011` is enforced on every request; RBAC + ABAC per `ADR-032` is enforced on every request; soft-delete policy per `ADR-015` applies to master data lifecycle; money representation per `ADR-013` is enforced on every money-valued field; UUID primary keys per `ADR-012` apply to every resource identifier.
- **Versioning Compatibility.** Every endpoint is served under the `v1` namespace. Every published capability MUST remain backward compatible until formally deprecated. Deprecation follows `Active → Deprecated → Archived`. Non-authoritative refinements follow the additive-only convention (new endpoints, new optional fields, new optional filters). Any change that alters a business capability, master data lifecycle, transaction lifecycle, event, or authorization boundary is a governed change and requires a new Module Baseline version.

## P. API Traceability Matrix

Every MOD-002 authority from Publication §4 is represented with one row. Every endpoint referenced in this matrix appears in §E; every endpoint in §E maps back to at least one authority row. No orphan capabilities. No baseline-introduced items.

| GT-005 Authority (Publication §4) | Sprint | API Resource / Endpoint(s) | Engine(s) | ADR(s) | WEB-002 / MOB-002 Reference |
| --- | --- | --- | --- | --- | --- |
| Accounting Ownership Convention Authority (§4.1) | SPR-001 | Foundation resources; `API002-EP-001`–`API002-EP-017` | ENG-001, ENG-002, ENG-004, ENG-024, ENG-018 | ADR-011, ADR-012, ADR-014, ADR-032 | WEB-002 Foundation domain / MOB-002 Foundation screens (`MOD002-SCR-001`…) |
| Voucher Ownership Convention Authority (§4.2) | SPR-002 | Voucher + Attachment resources; `API002-EP-020`–`API002-EP-034` | ENG-002, ENG-004, ENG-007, ENG-008, ENG-011, ENG-015, ENG-017, ENG-024 | ADR-013, ADR-014, ADR-032, ADR-053 | WEB-002 Vouchers domain / MOB-002 Voucher screens |
| Ledger Posting Ownership Convention Authority (§4.3) | SPR-003 | Journal Entry, Ledger Posting; `API002-EP-040`–`API002-EP-042` | ENG-002, ENG-004, ENG-015, ENG-016, ENG-018, ENG-024 | ADR-013, ADR-014, ADR-051 | WEB-002 Journals & Ledgers domain / MOB-002 Journals screens |
| Ledger Immutability Convention Authority (§4.3) | SPR-003 | Ledger Posting, Reversal Posting; `API002-EP-028`, `API002-EP-040`–`API002-EP-043` | ENG-004, ENG-015, ENG-016 | ADR-014, ADR-015 | WEB-002 Reversal flow / MOB-002 Reversal screen |
| Balance Integrity Convention Authority (§4.3) | SPR-003 | Ledger Balance, Sub-ledgers; `API002-EP-043`–`API002-EP-046` | ENG-004, ENG-016, ENG-018 | ADR-013, ADR-014 | WEB-002 Ledger Read Model / MOB-002 Ledger screens |
| Ledger Access Boundary Convention Authority (§4.3) | SPR-003 | (cross-cutting; §B.6) | ENG-002, ENG-016 | ADR-032 | WEB-002 §L / MOB-002 §L-bis |
| Financial Reporting Ownership Convention Authority (§4.4) | SPR-004 | Trial Balance, GL, P&L, Balance Sheet, Cash Flow; `API002-EP-060`–`API002-EP-067` | ENG-004, ENG-018, ENG-021, ENG-024 | ADR-013, ADR-014 | WEB-002 Financial Statements domain / MOB-002 Statement screens |
| Ledger Consumption Convention Authority (§4.4) | SPR-004 | (cross-cutting on §E.4) | ENG-016, ENG-021 | ADR-014 | WEB-002 Financial Statements / MOB-002 Statement screens |
| Report Determinism Convention Authority (§4.4) | SPR-004 | (cross-cutting on §E.4, §G, §I) | ENG-021 | ADR-014 | WEB-002 Design Constraints / MOB-002 Design Constraints |
| Reporting Read Model Convention Authority (§4.4) | SPR-004 | `API002-EP-060`–`API002-EP-065` | ENG-016, ENG-021 | ADR-014 | WEB-002 Statement Runner / MOB-002 Statement Runner |
| Financial Statement Boundary Convention Authority (§4.4) | SPR-004 | (cross-cutting; §H) | ENG-021 | ADR-014 | WEB-002 §L / MOB-002 §L-bis |
| Tax Ownership Convention Authority (§4.5) | SPR-005 | Tax Code, Applicability, Determination, Reports; `API002-EP-080`–`API002-EP-087` | ENG-002, ENG-004, ENG-012, ENG-021, ENG-024 | ADR-013, ADR-014, ADR-032 | WEB-002 Taxation domain / MOB-002 Taxation screens |
| Tax Calculation Boundary Convention Authority (§4.5) | SPR-005 | `API002-EP-085` (read-only) | ENG-012 | ADR-014 | WEB-002 Tax Determination / MOB-002 Tax screens |
| Tax Configuration Authority Convention (§4.5) | SPR-005 | `API002-EP-016`, `API002-EP-017`, tax-code CRUD | ENG-024 | ADR-014 | WEB-002 Configuration / MOB-002 Configuration screens |
| Compliance Readiness Convention Authority (§4.5) | SPR-005 | `API002-EP-086`, `API002-EP-087` | ENG-021 | ADR-014 | WEB-002 Tax Reports / MOB-002 Tax Report screens |
| Tax Reporting Boundary Convention Authority (§4.5) | SPR-005 | `API002-EP-086`, `API002-EP-087` | ENG-021 | ADR-014 | WEB-002 §L / MOB-002 §L-bis |
| Period Authority Convention Authority (§4.6) | SPR-006 | Accounting Period; `API002-EP-014`, `API002-EP-015`, `API002-EP-100`, `API002-EP-101` | ENG-002, ENG-004, ENG-024 | ADR-014, ADR-032 | WEB-002 Period Close domain / MOB-002 Period Close screens |
| Financial Year Ownership Convention Authority (§4.6) | SPR-006 | Fiscal Year, Opening Balance; `API002-EP-012`, `API002-EP-013`, `API002-EP-103`–`API002-EP-105` | ENG-002, ENG-004, ENG-011, ENG-015, ENG-016, ENG-024 | ADR-013, ADR-014, ADR-032 | WEB-002 Fiscal Year Close / MOB-002 Year Close screen |
| Period Close Boundary Convention Authority (§4.6) | SPR-006 | (cross-cutting on §E.6; §H) | ENG-016, ENG-021 | ADR-014 | WEB-002 §L / MOB-002 §L-bis |
| Controlled Reopening Convention Authority (§4.6) | SPR-006 | `API002-EP-102` | ENG-004, ENG-011 | ADR-014 | WEB-002 Reopen flow / MOB-002 Reopen screen |
| Audit Review Boundary Convention Authority (§4.6) | SPR-006 | `API002-EP-107`–`API002-EP-110` | ENG-004 | ADR-014 | WEB-002 Accounting Audit / MOB-002 Audit screens |
| Financial Freeze Convention Authority (§4.6) | SPR-006 | (cross-cutting on §E.6; §H) | ENG-004, ENG-016 | ADR-014, ADR-015 | WEB-002 §L / MOB-002 §L-bis |

## Q. Idempotency & Concurrency

- **Idempotency Keys** (`ADR-053`). Every keyed mutation endpoint (marked "Yes (keyed)" in §E) accepts a caller-supplied idempotency key. Repeat submissions with the same key and payload are treated as the same operation; a repeat submission with the same key but a different payload is rejected.
- **Optimistic Concurrency.** Mutating operations on stateful resources (voucher draft, account, tax code, opening balance, period lifecycle, fiscal year, reconciliation) honour an optimistic-concurrency token (an opaque version identifier). Stale-token updates return a conflict outcome; the caller MUST re-read and retry with the current token.
- **Long-Running Operations.** Statement export (§E.4), period close, financial-year close, audit export (§E.6), and controlled reopening are represented as resources with explicit lifecycle state. Callers poll the resource; the API never blocks indefinitely.

## R. Cross-Platform Consistency

Terminology, personas, workflows, and authorization boundaries are aligned across WEB-002, MOB-002, and this specification. The mapping below preserves consistency; it introduces no new alignment obligations beyond those in the Published Module.

| API Domain (§C) | WEB-002 Section | MOB-002 Section |
| --- | --- | --- |
| C.1 Foundation | Foundation domain — Chart of Accounts, Cost Centres, Bank Accounts, Fiscal Year / Periods, Configuration | Foundation screens (`MOD002-SCR-001` … `MOD002-SCR-010`) |
| C.2 Vouchers | Vouchers domain — Journal / Payment / Receipt / Contra / Credit-Debit Note | Voucher capture / list / detail / approval screens |
| C.3 Journal & Ledger | Journals & Ledgers domain — Journal Entry Explorer, Ledger Movements, Ledger Balances, AR / AP sub-ledgers, Bank Reconciliation | Journal / Ledger / Reconciliation screens |
| C.4 Financial Statements | Financial Statements domain — Trial Balance, General Ledger, P&L, Balance Sheet, Cash Flow, Statement Runner, Drill-down | Statement Runner and Drill-down screens |
| C.5 Taxation | Taxation domain — Tax Codes, Applicability, Determination, Tax Reports | Tax screens |
| C.6 Period Close & Audit | Period Close & Audit domain — Period Lifecycle, Fiscal Year Close, Closing Adjustments, Opening Balances, Accounting Audit Review | Period Close, Year Close, Reopen, Audit screens |

## S. Design Constraints

Applies to every section of this specification.

- **No new business requirements.** API-002 does not add, remove, or reinterpret any authority beyond Publication §4. On any conflict with the Module Publication or its parent Module Baseline, the upstream artefact wins and API-002 is corrected in the same change.
- **No implementation technology decisions beyond ADRs.** API-002 does not prescribe framework choices, programming languages, database technologies, or deployment architectures. Every technology-shaped choice is deferred to the ADRs cited in frontmatter and §N.
- **Complete parity with GT-005, WEB-002, and MOB-002.** Every authority in Publication §4 resolves to at least one endpoint in §E and one row in §P. Every WEB-002 domain and MOB-002 screen group resolves to an API-002 domain per §R.
- **Implementation-independent service contract.** §E paths, §F/§G models, §J error catalogs, and §K conventions describe business-level shapes only. Wire schemas, protocol tuning, and infrastructure sizing remain out of scope.
- **Upstream inconsistencies are reported, not corrected.** Any inconsistency detected in Publication, Baseline, or Sprint PRDs during authoring is recorded as a blocking finding in the pass verification report; API-002 does not silently correct upstream state.

## T. Acceptance Criteria

This specification is Accepted when:

1. Every authority enumerated in Publication §4 resolves to at least one row in §P.
2. Every endpoint in §E carries a stable `API002-EP-NNN` identifier and appears in §P.
3. Engine set in §N matches Publication §11 exactly (14 engines).
4. ADR set in frontmatter matches Publication §11 supporting ADR list.
5. Cross-module service contracts in §O match Publication §10 (consumed events) and §12 (downstream consumers).
6. Cross-platform consistency mapping in §R resolves for every WEB-002 domain and MOB-002 screen group.
7. Design Constraints (§S) are present and asserted.
8. Verification report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0` with MAJOR = 0 and CRITICAL = 0.

## U. Repository State Transition

`MOD002_MOBILE_SOLUTION_DESIGN_COMPLETE` → **`MOD002_API_SOLUTION_DESIGN_COMPLETE`**

Authorizes Pass 37.5.0 — MOD-002 Solution Design Certification & Cross-Platform Consistency Verification.

## V. References

- [`docs/45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md`](../../45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md) — sole functional authority.
- [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- [`docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`](../../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md)
- [`docs/60-solution-design/web/WEB-002_ACCOUNTING.md`](../web/WEB-002_ACCOUNTING.md) — cross-platform parity reference.
- [`docs/60-solution-design/mobile/MOB-002_ACCOUNTING.md`](../mobile/MOB-002_ACCOUNTING.md) — cross-platform parity reference.
- [`docs/60-solution-design/api/API-001_PLATFORM_ADMINISTRATION.md`](./API-001_PLATFORM_ADMINISTRATION.md) — canonical API structural reference.
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`](../../15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md)
- [`docs/15-governance/FINDING_SEVERITY_STANDARD.md`](../../15-governance/FINDING_SEVERITY_STANDARD.md)
- [`docs/15-governance/SCREEN_IDENTIFIER_STANDARD.md`](../../15-governance/SCREEN_IDENTIFIER_STANDARD.md)
