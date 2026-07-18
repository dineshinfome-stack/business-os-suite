---
title: "MOB-002 — Accounting Mobile Solution Design Specification"
summary: "Phase 3 Mobile Solution Design specification for MOD-002 Accounting. Derived exclusively from the Accounting Module Publication (with WEB-002 referenced only for terminology, journey, and navigation parity). Defines mobile personas, journeys, navigation, screen inventory with stable module-scoped Screen IDs, forms, offline behaviour, device capabilities, notifications, accessibility, and user-facing security expectations. Introduces no new business requirements."
spec_id: "MOB-002"
family: "MOB"
source_module: "MOD-002"
source_module_name: "Accounting"
source_publication: "MOD-002_MODULE_PUBLICATION"
source_baseline: "MOD002_ACCOUNTING_BASELINE_v1"
source_module_prd: "docs/20-module-prds/accounting/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-002-001", "SPR-MOD-002-002", "SPR-MOD-002-003", "SPR-MOD-002-004", "SPR-MOD-002-005", "SPR-MOD-002-006"]
related_web_spec: "WEB-002"
related_api_spec: "API-002"
version: "1.0"
status: "Active"
lifecycle_state: "Active"
owner: "Accounting"
layer: "delivery"
updated: "2026-07-19"
tags: ["solution-design", "mobile", "phase-3", "MOB-002", "MOD-002", "accounting"]
document_type: "Mobile Solution Design Specification"
template: "SD-001_MOBILE_SPEC"
template_version: "1.0"
governance_specification: "v1.0"
screen_identifier_standard: "SCREEN_IDENTIFIER_STANDARD v1.0"
finding_severity_standard: "FINDING_SEVERITY_STANDARD v1.0"
frontmatter_standard: "GOVERNANCE_FRONTMATTER_STANDARD v1.0"
pass_classification: "Solution Design — Mobile"
execution_id: "MOB002-SD-20260719T060000Z-001"
parent_execution_id: "WEB002-SD-20260719T050000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-011", "ENG-012", "ENG-015", "ENG-016", "ENG-017", "ENG-018", "ENG-021", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-013", "ADR-014", "ADR-015", "ADR-032", "ADR-051", "ADR-053", "ADR-081", "ADR-083"]
---

# MOB-002 — Accounting Mobile Solution Design Specification

> **Reference derivation only.** MOB-002 is a Mobile-surface projection of the Accounting Module Publication [`MOD-002_MODULE_PUBLICATION`](../../45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md). It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. [`WEB-002`](../web/WEB-002_ACCOUNTING.md) is referenced only to preserve functional parity of journeys, terminology, and navigation; it is not a business source. Screen identifiers follow [`SCREEN_IDENTIFIER_STANDARD`](../../15-governance/SCREEN_IDENTIFIER_STANDARD.md) v1.0. On any conflict with the Module Publication or its parent Module Baseline, the upstream artefact wins and MOB-002 is corrected in the same change.

## A. Overview

### A.1 Purpose

Define the Mobile-surface user experience through which authorized accounting personas consume the Accounting capabilities published in `MOD-002_MODULE_PUBLICATION` — Chart of Accounts and fiscal calendar, the canonical Voucher Framework, journal creation and ledger posting, deterministic financial statements, taxation & compliance foundation, and period close & audit review — on mobile-native devices, while honouring the governance conventions (Accounting Ownership, Voucher Ownership, Ledger Posting Ownership, Ledger Immutability, Financial Reporting Ownership, Tax Ownership, Period Authority, Financial Freeze) declared in Publication §4.

### A.2 Scope

Mobile-native surface (phone and tablet form factors) covering:

- On-the-go browse and light-authoring of Chart of Accounts, Cost Centers, Bank Accounts, and fiscal calendar entries within scope.
- Voucher authoring (Journal / Payment / Receipt / Contra / Credit-Debit Note) and posting within the author's scope, including submission for approval and voucher reversal.
- Voucher approvals and closing-adjustment approvals from notifications.
- Read-only journal, ledger, balance inspection, and reversal-chain surfaces.
- Read-only deterministic financial statements (Trial Balance, General Ledger, Profit & Loss, Balance Sheet, Cash Flow) with export requests.
- Tax master browse and read-only tax determination review.
- Period lifecycle actions (Soft Close / Close / Reopening request) within the actor's authority and the Financial-Year Close status view.
- Read-only Accounting Audit Timeline with drill-down and export requests.
- Governance conventions surface (read-only).
- Notification handling for accounting events delivered via `ENG-025` (owned by MOD-001).
- Offline availability limited strictly to what the Published Module and applicable ADRs support (cached read-only viewing, and offline voucher draft capture with queued submission on reconnect per ADR-083 opted-in field flows).

Out of scope for MOB-002: Web surfaces (WEB-002), API contracts (API-002 — forward reference), UI mockups, framework decisions, statutory filing to government portals, government tax integrations (GST/GSTN, e-invoicing/IRN, e-way bill), consolidation across companies, budgeting/forecasting, AI-driven accounting analysis, authentication mechanics (SSO, MFA, identity federation), and any business-rule authoring beyond what the Module Publication declares.

### A.3 Source Published Module

- **Module ID / Name:** MOD-002 Accounting
- **Publication:** [`MOD-002_MODULE_PUBLICATION`](../../45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md)
- **Baseline:** [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- **Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- **Sprint Plan:** [`docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`](../../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md)
- **Sprint PRDs:** `SPR-MOD-002-001` … `SPR-MOD-002-006`
- **Related Web Specification:** [`WEB-002`](../web/WEB-002_ACCOUNTING.md) — parity reference only.
- **Related API Specification:** `API-002` — forward reference (Pass 37.4.0).

### A.4 Version

- **Specification Version:** 1.0
- **Aligned to Publication Version:** MOD-002 v1.0

### A.5 Screen Identifier Convention

Every screen in §E is assigned a stable Screen ID of the form `MOD002-SCR-NNN` per [`SCREEN_IDENTIFIER_STANDARD`](../../15-governance/SCREEN_IDENTIFIER_STANDARD.md) v1.0. Screen IDs are immutable once assigned; deprecated screens retain their IDs. Every Screen ID referenced in User Journeys (§C), Forms (§F), and the Traceability Matrix (§N) MUST resolve to a Screen defined in §E.

### A.6 Business Boundary

MOB-002 covers only the Accounting bounded context. Tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization pack lifecycle, notification infrastructure, and audit collection remain owned by MOD-001 and are consumed here. Downstream business modules (MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017) are consumed only through their own surfaces and published events per Publication §10.

### A.7 Traceability References

See §N for the complete authority-to-sprint-to-screen-to-workflow-to-engine-to-ADR traceability matrix. Frontmatter records the full chain (Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → Module Publication → MOB-002).

## B. Mobile Personas

Personas are inherited from the Module PRD §3, the Module Publication, and the Sprint PRD family; MOB-002 introduces no new roles. Concrete grants remain enforced by `ENG-002` per `ADR-032` (RBAC + ABAC) at accounting scope within tenancy boundaries per `ADR-011`. This section describes mobile-specific responsibilities and primary scenarios only.

### B.1 Accountant

- **Mobile Responsibilities:** Author and post vouchers on the go; capture supporting attachments via camera; inspect ledger balances and journal entries; prepare closing adjustments; consume financial statements read-only.
- **Primary Mobile Scenarios:** Create a Journal / Payment / Receipt / Contra Voucher from a notification prompt; attach a scanned receipt to a Voucher; inspect a Ledger Balance from a Chart of Accounts leaf; open the Trial Balance for the current period.

### B.2 Controller

- **Mobile Responsibilities:** Approve high-value or restricted vouchers; act on period-lifecycle transitions within authority; oversee reversal postings; consume validated financial statements.
- **Primary Mobile Scenarios:** Approve a pending Voucher from a push notification; initiate a Soft Close from the Period Lifecycle surface; review a Reversal Chain from a Journal Entry.

### B.3 CFO / Finance Executive

- **Mobile Responsibilities:** Consume authoritative financial statements at company / organization scope; oversee financial-year close status; monitor period-lifecycle posture; consume business-level audit review summaries.
- **Primary Mobile Scenarios:** Open the Balance Sheet at company scope; review Financial-Year Close status; open the Accounting Audit Timeline summary.

### B.4 Auditor

- **Mobile Responsibilities:** Read-only inspection of the Accounting Audit Timeline; drill into event detail; request an export of a filtered selection. No mutation rights.
- **Primary Mobile Scenarios:** Open Audit Timeline from a notification; filter by actor and time range; request an export.

### B.5 AP Clerk

- **Mobile Responsibilities:** Author supplier-side vouchers (Payment Voucher, supplier Credit / Debit Note); review Supplier AP Balance; submit for approval.
- **Primary Mobile Scenarios:** Create a Payment Voucher; author a Debit Note; inspect Supplier AP Balance from a supplier reference; submit a voucher for approval.

### B.6 AR Clerk

- **Mobile Responsibilities:** Author customer-side vouchers (Receipt Voucher, customer Credit / Debit Note); review Customer AR Balance; submit for approval.
- **Primary Mobile Scenarios:** Create a Receipt Voucher; author a Credit Note; inspect Customer AR Balance from a customer reference; submit a voucher for approval.

### B.7 Tax Officer

- **Mobile Responsibilities:** Maintain Tax Code master within scope; review tax determination outcomes read-only; coordinate closing adjustments with Controller.
- **Primary Mobile Scenarios:** Open Tax Code Detail; review a Tax Determination Outcome on a candidate voucher; open Tax Reporting Readiness.

## C. Mobile User Journeys

Every journey derives from a capability in Module Publication §3 and an authority in Publication §4. Corresponding WEB-002 sections are cited parenthetically for parity only. Screen IDs reference §E.

### C.1 Journey — Establish Accounting Foundation (WEB-002 §C.1)

- **Entry Points:** Home (`MOD002-SCR-001`) → Foundation → Chart of Accounts (`MOD002-SCR-010`) or Fiscal Calendar (`MOD002-SCR-013`).
- **Primary Flow:** Accountant or Controller browses Chart of Accounts, Cost Centers (`MOD002-SCR-011`), and Bank Accounts (`MOD002-SCR-012`) → captures light edits via the Chart of Accounts Form (`MOD002-SCR-015`) under the Accounting Ownership Convention → resolves Base Configuration read-only (`MOD002-SCR-014`) via `ENG-024`.
- **Offline / Online Transitions:** Foundation reads render read-only from cache with a "cached at" indicator; foundation authoring requires connectivity and is retained locally as pending submission.
- **Exception Flows:** Duplicate account code within scope → validation feedback; deletion blocked while posted movements exist.

### C.2 Journey — Author and Post a Voucher (WEB-002 §C.2)

- **Entry Points:** Vouchers tab → New Voucher; deep link from an "approval requested" or "draft reminder" notification.
- **Primary Flow:** Author selects Voucher Type (`MOD002-SCR-021`) → numbering series resolves via `ENG-017` → captures voucher lines via the Voucher Form (`MOD002-SCR-022`) → Voucher Engine (`ENG-015`) validates debits equal credits → optional attachment capture via camera through `ENG-008` → submits for approval or posts → `VoucherPosted` emits via `ENG-005` under the Ledger Posting Ownership Convention.
- **Offline / Online Transitions:** Voucher **drafts** may be captured offline per ADR-083 opted-in field flows and are queued as pending submission until reconnect; posting and approval submission require connectivity.
- **Exception Flows:** Debits ≠ credits → posting rejected; posting into a Closed period → rejected under Period Close Boundary Convention; attempted mutation of a posted voucher → rejected under the Ledger Immutability Convention.

### C.3 Journey — Approve or Reject a Voucher (WEB-002 §C.2 alternate)

- **Entry Points:** Push notification for a pending voucher approval; Approvals list (`MOD002-SCR-023`).
- **Primary Flow:** Controller opens Voucher Detail (`MOD002-SCR-024`) → acts via the Voucher Approval Form (`MOD002-SCR-025`) → decision persists via `ENG-011` and is audit-visible per `ADR-014`.
- **Offline / Online Transitions:** Approvals not submitted offline; decisions are retained locally as clearly pending submission until reconnected.
- **Exception Flows:** Approver outside the Voucher Type's approval policy → rejected before submission.

### C.4 Journey — Reverse a Posted Voucher (WEB-002 §C.3)

- **Entry Points:** Voucher Detail (posted) `MOD002-SCR-024` → Reverse; Journal Entry Detail (`MOD002-SCR-031`) → Reverse Origin.
- **Primary Flow:** Author with reversal authority opens the Voucher Reversal Form (`MOD002-SCR-026`) → a new Reversal Voucher is created (never a mutation of the original) → posting via `ENG-016` produces a Reversal Posting preserving historical integrity per Ledger Immutability Convention.
- **Exception Flows:** Reversal targeting a Closed period → rejected; original already reversed → rejected.

### C.5 Journey — Inspect Ledger Balances (WEB-002 §C.4)

- **Entry Points:** Journals & Ledgers tab → Balance Inspection (`MOD002-SCR-033`); deep-link from a Chart of Accounts leaf.
- **Primary Flow:** Persona selects Account, tenant, company, currency, period → Balance Integrity Convention Authority computes deterministic aggregation → results display alongside originating Journal Entries (`MOD002-SCR-030`, `MOD002-SCR-031`) with drill-through to Ledger Postings (`MOD002-SCR-032`).
- **Offline / Online Transitions:** Recently viewed balances render read-only from cache with a "cached at" indicator; new queries require connectivity.
- **Exception Flows:** Cross-tenant selection not offered per `ADR-011`.

### C.6 Journey — Consume a Financial Statement (WEB-002 §C.5)

- **Entry Points:** Reports tab → Trial Balance / General Ledger / P&L / Balance Sheet / Cash Flow.
- **Primary Flow:** Persona opens Trial Balance (`MOD002-SCR-040`), General Ledger (`MOD002-SCR-041`), Profit & Loss (`MOD002-SCR-042`), Balance Sheet (`MOD002-SCR-043`), or Cash Flow (`MOD002-SCR-044`) → configures period / company / currency via the Report Configuration Form (`MOD002-SCR-045`) → the report is computed under the Report Determinism Convention using the Reporting Read Model (`ENG-021`) with `ENG-018` for currency → renders read-only.
- **Offline / Online Transitions:** Last-run report snapshots render read-only from cache with a "cached at" indicator; new runs require connectivity.
- **Exception Flows:** Attempted state change on a report surface → rejected under Financial Statement Boundary Convention.

### C.7 Journey — Maintain Tax Master and Review Determination (WEB-002 §C.6)

- **Entry Points:** More → Taxation → Tax Codes (`MOD002-SCR-050`); Voucher Detail → Tax Determination.
- **Primary Flow:** Tax Officer maintains Tax Code master via the Tax Code Form (`MOD002-SCR-052`) under the Tax Ownership Convention → determination outcomes surface read-only on Determination Review (`MOD002-SCR-051`) and Tax Reporting Readiness (`MOD002-SCR-053`).
- **Exception Flows:** Attempt to have tax calculation create vouchers, mutate journals, or mutate ledger entries → rejected under Tax Calculation Boundary Convention; external filing → not offered per Publication §15.

### C.8 Journey — Manage the Period Lifecycle (WEB-002 §C.7)

- **Entry Points:** More → Period Close → Period Lifecycle (`MOD002-SCR-060`).
- **Primary Flow:** Controller opens Period Detail → acts via the Period Lifecycle Action Form (`MOD002-SCR-061`) transitioning Open → Soft Closed → Closed under the Period Authority Convention → `PeriodClosed` emits via `ENG-005` at Closed.
- **Exception Flows:** Close blocked by unresolved preconditions → rejected until resolved; out-of-order transitions → rejected.

### C.9 Journey — Initiate a Controlled Reopening (WEB-002 §C.8)

- **Entry Points:** Period Detail (Closed) `MOD002-SCR-060` → Request Reopening.
- **Primary Flow:** Controller with authorized authority initiates a Reopening request via the Period Lifecycle Action Form (`MOD002-SCR-061`) → approval via `ENG-011` per Controlled Reopening Convention → on approval, the period transitions to Reopened preserving historical integrity; every reopening is audit-visible per `ADR-014`.
- **Exception Flows:** Reopening without authorization → rejected; reopening after Financial Freeze → rejected unless Financial Year Ownership Authority permits.

### C.10 Journey — Prepare and Post a Closing Adjustment (WEB-002 §C.9)

- **Entry Points:** Period Close → Closing Adjustments (`MOD002-SCR-062`).
- **Primary Flow:** Accountant or Controller opens the Closing Adjustment Voucher Form (`MOD002-SCR-063`) within a Soft Closed period → balance validated by `ENG-015` → approval via `ENG-011` → posting emits `VoucherPosted` and produces the corresponding Journal Entry and Ledger Posting via `ENG-016`.
- **Offline / Online Transitions:** Draft adjustments may be captured offline; submission and posting require connectivity.
- **Exception Flows:** Adjustment against a Closed period → rejected; unbalanced adjustment → rejected before posting.

### C.11 Journey — Capture an Opening Balance Entry (WEB-002 §C.10)

- **Entry Points:** Foundation → Opening Balances (`MOD002-SCR-016`); Fiscal Year Detail → Prepare Opening.
- **Primary Flow:** Accountant captures Opening Balance Entries via the Opening Balance Entry Form (`MOD002-SCR-017`) under the Financial Year Ownership Convention → validated for balance and scope → posted through the Voucher Framework.
- **Exception Flows:** Opening balance attempted after first posting into the new fiscal year → rejected.

### C.12 Journey — Execute Financial-Year Close (WEB-002 §C.7 companion)

- **Entry Points:** More → Period Close → Financial-Year Close (`MOD002-SCR-064`).
- **Primary Flow:** CFO or authorized Controller opens the Financial-Year Close status → reviews close preconditions and opening-balance readiness → executes close within authority; Financial Freeze Convention applies on completion.
- **Exception Flows:** Any period within the year not Closed → close rejected until resolved.

### C.13 Journey — Review the Accounting Audit Timeline (WEB-002 §C.11)

- **Entry Points:** Audit tab → Timeline (`MOD002-SCR-070`); deep-link from any Accounting master or transaction detail.
- **Primary Flow:** Auditor or Controller applies filters via the Audit Filter Form (`MOD002-SCR-072`) → opens Audit Event Detail (`MOD002-SCR-071`) → optionally requests an export via Audit Export Request (`MOD002-SCR-073`). Content is consumed read-only from `ENG-004`; the surface never mutates audit state per Audit Review Boundary Convention.
- **Offline / Online Transitions:** Recently viewed events render read-only from cache with a "cached at" indicator; new queries require connectivity.
- **Exception Flows:** Access denied where audit visibility policy prohibits; retention-aged events surfaced as archived.

## D. Mobile Navigation Architecture

Navigation groups derive from Module Publication §3 and mirror the WEB-002 §D menu areas, projected onto the mobile form factor. Behaviour only — no visual designs.

### D.1 Bottom Navigation (Primary)

- **Home** — persona-appropriate landing surface with resolved company / period scope, pending accounting tasks, current period lifecycle indicator, and recent audit-visible events.
- **Vouchers** — Voucher Types, authoring, approvals, reversals.
- **Ledgers** — Journal Entries, Ledger Postings, Balance Inspection, Reversal Chain.
- **Reports** — Trial Balance, General Ledger, Profit & Loss, Balance Sheet, Cash Flow.
- **More** — Foundation, Taxation, Period Close, Audit Review, Governance, Notifications, Settings.

### D.2 Contextual / Drawer Navigation

The "More" drawer exposes Foundation (Chart of Accounts, Cost Centers, Bank Accounts, Fiscal Calendar, Base Configuration, Opening Balances), Taxation, Period Close (Period Lifecycle, Closing Adjustments, Financial-Year Close), Audit Review, Governance conventions (read-only), Notifications, and Settings.

### D.3 Deep Links

Push notifications from `ENG-025` deep-link to the corresponding detail screen: Voucher Detail, Journal Entry Detail, Balance Inspection, Period Detail, Audit Event Detail, Tax Code Detail. Every deep-link is re-evaluated against the caller's authorization on resolution.

### D.4 Back-Navigation Behaviour

Back-navigation returns to the prior surface preserving scope, filter, period, and pagination selections, consistent with WEB-002 §D.5.

### D.5 Cross-Module Navigation

Drill-downs into downstream module surfaces (Sales Invoice, Purchase Invoice, POS Day Close) surrender control to that module's own mobile surface and its own authorization. Accounting never mutates downstream module state; downstream modules never write to Accounting state directly per the Ledger Access Boundary Convention.

## D-bis. Mobile Information Architecture

The information hierarchy anchors at the resolved company/period scope, exposed persistently at the top of every surface. Within each primary tab, catalogs → detail → child-detail chains are honoured; back-navigation preserves the resolved scope. All surfaces respect tenant isolation (`ADR-011`); cross-tenant navigation is not offered.

## E. Screen Inventory

Canonical screen inventory. Every screen carries a stable Screen ID per [`SCREEN_IDENTIFIER_STANDARD`](../../15-governance/SCREEN_IDENTIFIER_STANDARD.md) v1.0. Every Screen ID referenced elsewhere in this specification MUST resolve here.

### E.1 Home & Session

| Screen ID | Screen | Primary Persona | Navigation Entry | Related Workflow | GT-005 Authority Mapping |
| --- | --- | --- | --- | --- | --- |
| `MOD002-SCR-001` | Accounting Home | All accounting personas | Bottom nav → Home | §C (all) | Publication §3 (cross-area) |
| `MOD002-SCR-002` | Scope Selector (Company / Period / Currency) | All accounting personas | Home header | §C (all) | Publication §4.1, §4.6 |

### E.2 Foundation

| Screen ID | Screen | Primary Persona | Navigation Entry | Related Workflow | GT-005 Authority Mapping |
| --- | --- | --- | --- | --- | --- |
| `MOD002-SCR-010` | Chart of Accounts Catalog & Detail | Accountant, Controller | More → Foundation → CoA | §C.1 | Accounting Ownership Convention Authority (§4.1) |
| `MOD002-SCR-011` | Cost Centers Catalog & Detail | Accountant | More → Foundation → Cost Centers | §C.1 | Accounting Ownership Convention Authority (§4.1) |
| `MOD002-SCR-012` | Bank Accounts Catalog & Detail | Accountant, AP/AR Clerk | More → Foundation → Bank Accounts | §C.1 | Accounting Ownership Convention Authority (§4.1) |
| `MOD002-SCR-013` | Fiscal Calendar | Controller, Accountant | More → Foundation → Fiscal Calendar | §C.1, §C.8 | Accounting Ownership + Financial Year Ownership (§4.1, §4.6) |
| `MOD002-SCR-014` | Base Configuration (read-only) | Controller, Accountant | More → Foundation → Base Config | §C.1 | Accounting Ownership Convention Authority (§4.1) |
| `MOD002-SCR-015` | Chart of Accounts Form | Accountant, Controller | CoA → New / Edit | §C.1 | Accounting Ownership Convention Authority (§4.1) |
| `MOD002-SCR-016` | Opening Balances Workbench | Accountant, Controller | More → Foundation → Opening Balances | §C.11 | Financial Year Ownership Convention Authority (§4.6) |
| `MOD002-SCR-017` | Opening Balance Entry Form | Accountant | Opening Balances → Capture | §C.11 | Financial Year Ownership Convention Authority (§4.6) |

### E.3 Vouchers

| Screen ID | Screen | Primary Persona | Navigation Entry | Related Workflow | GT-005 Authority Mapping |
| --- | --- | --- | --- | --- | --- |
| `MOD002-SCR-020` | Vouchers List | Accountant, AP/AR Clerk, Controller | Bottom nav → Vouchers | §C.2 | Voucher Ownership Convention Authority (§4.2) |
| `MOD002-SCR-021` | Voucher Types Catalog | Accountant, Controller | Vouchers → Types | §C.2 | Voucher Ownership Convention Authority (§4.2) |
| `MOD002-SCR-022` | Voucher Form (per Voucher Type) | Accountant, AP/AR Clerk | Vouchers → New | §C.2 | Voucher Ownership + Ledger Posting Ownership (§4.2, §4.3) |
| `MOD002-SCR-023` | Voucher Approvals List | Controller | Vouchers → Approvals; notification deep-link | §C.3 | Voucher Ownership Convention Authority (§4.2) |
| `MOD002-SCR-024` | Voucher Detail | All voucher personas | Vouchers List / notifications | §C.2, §C.3, §C.4 | Voucher Ownership + Ledger Immutability (§4.2, §4.3) |
| `MOD002-SCR-025` | Voucher Approval Action Form | Controller | Voucher Detail → Approve/Reject | §C.3 | Voucher Ownership Convention Authority (§4.2) |
| `MOD002-SCR-026` | Voucher Reversal Form | Accountant, Controller | Voucher Detail (posted) → Reverse | §C.4 | Ledger Immutability Convention Authority (§4.3) |

### E.4 Journals, Ledgers & Balances

| Screen ID | Screen | Primary Persona | Navigation Entry | Related Workflow | GT-005 Authority Mapping |
| --- | --- | --- | --- | --- | --- |
| `MOD002-SCR-030` | Journal Entries Catalog | Accountant, Auditor | Bottom nav → Ledgers → Journal Entries | §C.5 | Ledger Posting Ownership Convention Authority (§4.3) |
| `MOD002-SCR-031` | Journal Entry Detail | Accountant, Auditor | Journal Entries → open | §C.5, §C.4 | Ledger Posting Ownership Convention Authority (§4.3) |
| `MOD002-SCR-032` | Ledger Postings & Reversal Chain | Accountant, Controller, Auditor | Journal Entry → Postings | §C.5, §C.4 | Ledger Immutability Convention Authority (§4.3) |
| `MOD002-SCR-033` | Balance Inspection | Accountant, Controller, CFO | Bottom nav → Ledgers → Balances | §C.5 | Balance Integrity Convention Authority (§4.3) |

### E.5 Financial Statements

| Screen ID | Screen | Primary Persona | Navigation Entry | Related Workflow | GT-005 Authority Mapping |
| --- | --- | --- | --- | --- | --- |
| `MOD002-SCR-040` | Trial Balance | Accountant, Controller, CFO, Auditor | Reports → Trial Balance | §C.6 | Financial Reporting Ownership + Report Determinism (§4.4) |
| `MOD002-SCR-041` | General Ledger Report | Accountant, Controller, Auditor | Reports → General Ledger | §C.6 | Financial Reporting Ownership + Ledger Consumption (§4.4) |
| `MOD002-SCR-042` | Profit & Loss Statement | Controller, CFO | Reports → P&L | §C.6 | Financial Reporting Ownership Convention Authority (§4.4) |
| `MOD002-SCR-043` | Balance Sheet | Controller, CFO | Reports → Balance Sheet | §C.6 | Financial Reporting Ownership Convention Authority (§4.4) |
| `MOD002-SCR-044` | Cash Flow Statement | Controller, CFO | Reports → Cash Flow | §C.6 | Financial Reporting Ownership Convention Authority (§4.4) |
| `MOD002-SCR-045` | Report Configuration Form | Controller, CFO, Accountant | Any report → Configure | §C.6 | Reporting Read Model + Financial Statement Boundary (§4.4) |

### E.6 Taxation

| Screen ID | Screen | Primary Persona | Navigation Entry | Related Workflow | GT-005 Authority Mapping |
| --- | --- | --- | --- | --- | --- |
| `MOD002-SCR-050` | Tax Codes Catalog & Detail | Tax Officer, Controller | More → Taxation → Tax Codes | §C.7 | Tax Ownership Convention Authority (§4.5) |
| `MOD002-SCR-051` | Tax Determination Review | Tax Officer, Auditor | Voucher Detail → Tax; More → Taxation | §C.7 | Tax Ownership + Tax Calculation Boundary (§4.5) |
| `MOD002-SCR-052` | Tax Code Form | Tax Officer | Tax Codes → New / Edit | §C.7 | Tax Ownership + Tax Configuration Authority (§4.5) |
| `MOD002-SCR-053` | Tax Reporting Readiness | Tax Officer, Controller | More → Taxation → Readiness | §C.7 | Compliance Readiness + Tax Reporting Boundary (§4.5) |

### E.7 Period Close

| Screen ID | Screen | Primary Persona | Navigation Entry | Related Workflow | GT-005 Authority Mapping |
| --- | --- | --- | --- | --- | --- |
| `MOD002-SCR-060` | Period Lifecycle Panel | Controller, CFO | More → Period Close → Lifecycle | §C.8, §C.9 | Period Authority + Period Close Boundary (§4.6) |
| `MOD002-SCR-061` | Period Lifecycle Action Form | Controller | Period Detail → Soft Close / Close / Reopen | §C.8, §C.9 | Period Authority + Controlled Reopening (§4.6) |
| `MOD002-SCR-062` | Closing Adjustments List | Accountant, Controller | More → Period Close → Closing Adjustments | §C.10 | Financial Year Ownership Convention Authority (§4.6) |
| `MOD002-SCR-063` | Closing Adjustment Voucher Form | Accountant, Controller | Closing Adjustments → New | §C.10 | Voucher Ownership + Financial Year Ownership (§4.2, §4.6) |
| `MOD002-SCR-064` | Financial-Year Close Workbench | CFO, Controller | More → Period Close → FY Close | §C.12 | Financial Year Ownership + Financial Freeze (§4.6) |

### E.8 Audit Review

| Screen ID | Screen | Primary Persona | Navigation Entry | Related Workflow | GT-005 Authority Mapping |
| --- | --- | --- | --- | --- | --- |
| `MOD002-SCR-070` | Accounting Audit Timeline | Auditor, Controller, CFO | More → Audit Review → Timeline | §C.13 | Audit Review Boundary Convention Authority (§4.6) |
| `MOD002-SCR-071` | Audit Event Detail | Auditor, Controller | Timeline → open | §C.13 | Audit Review Boundary Convention Authority (§4.6) |
| `MOD002-SCR-072` | Audit Filter Form | Auditor, Controller | Timeline → Filter | §C.13 | Audit Review Boundary Convention Authority (§4.6) |
| `MOD002-SCR-073` | Audit Export Request | Auditor | Timeline → Export | §C.13 | Audit Review Boundary Convention Authority (§4.6) |

### E.9 Governance, Notifications & Settings

| Screen ID | Screen | Primary Persona | Navigation Entry | Related Workflow | GT-005 Authority Mapping |
| --- | --- | --- | --- | --- | --- |
| `MOD002-SCR-080` | Governance Conventions (read-only) | All accounting personas | More → Governance | §C (all) | All authorities enumerated in Publication §4 |
| `MOD002-SCR-081` | Notifications | All accounting personas | More → Notifications | §C.3, §C.8, §C.13 | Consumed from MOD-001 via `ENG-025` |
| `MOD002-SCR-082` | Notification Preferences | All accounting personas | More → Notifications → Preferences | Cross-cutting | Consumed from MOD-001 via `ENG-025` |
| `MOD002-SCR-083` | Settings & Session | All accounting personas | More → Settings | Cross-cutting | Session surface per `ENG-001` |

## E-bis. Screen Specifications

Each screen listed in §E is a business-level surface only. Purpose, primary actions, displayed business information, and cross-screen relationships are inherited verbatim from the WEB-002 §E screen inventory (see WEB-002 §E.1–§E.26) for functional parity, projected onto mobile form-factor constraints:

- Catalog surfaces show list + detail navigation; large tabular views collapse to summary cards with detail drill-through.
- Complex authoring surfaces (multi-line vouchers, Financial-Year Close workbench, closing adjustments) preserve every business field but present line-by-line entry on phone form factors.
- Read-only report surfaces preserve determinism indicators and resolving-input displays.
- Every screen resolves the active company / period / currency scope in a persistent header.
- Visual mockups remain out of scope; only business surface obligations are declared here.

## F. Forms & Data Entry Optimization

Every form is bound to a Screen in §E. Business fields, required / optional split, validation rules, and outcomes are derived from Module Publication §7, §8, and §4 authorities and are consistent with WEB-002 §F. Mobile-specific data-entry optimizations are additive presentation-only and never introduce new business fields or rules.

### F.1 Chart of Accounts Form (`MOD002-SCR-015`)

- **Purpose:** Create / edit a Chart of Accounts leaf.
- **Business Fields:** Account code, name, type, parent, currency posture, lifecycle state.
- **Required:** Code, name, type, parent (except root).
- **Business Validation Rules:** Code unique within company scope; type consistent with parent classification; deletion blocked while posted movements exist.
- **Submit Outcome:** Entry persisted; audit-visible per `ADR-014`.
- **Mobile Optimization:** Alphanumeric keyboard with account-code shortcut; type field uses picker; parent field uses searchable lookup.

### F.2 Cost Center / Bank Account Form (extends `MOD002-SCR-011` / `MOD002-SCR-012`)

- **Purpose:** Create / edit a Cost Center or Bank Account.
- **Business Fields:** Identifier, name, parent (Cost Center), linked ledger account (Bank Account), currency (Bank Account), lifecycle state.
- **Required:** Identifier, name; linked ledger account for Bank Account.
- **Business Validation Rules:** Identifier unique within scope; ledger account of appropriate type.
- **Mobile Optimization:** Currency selector uses locale-resolved picker via `ENG-018`.

### F.3 Fiscal Year / Period Form (`MOD002-SCR-013`)

- **Purpose:** Open / edit a Fiscal Year and its Accounting Periods.
- **Business Fields:** Fiscal Year identifier, bounds, period breakdown, calendar notes.
- **Required:** Identifier, bounds.
- **Business Validation Rules:** Bounds non-overlapping; period breakdown covers year bounds exactly.
- **Mobile Optimization:** Native date pickers; period breakdown presented as an editable list.

### F.4 Voucher Form (`MOD002-SCR-022`)

- **Purpose:** Create / edit a Journal, Payment, Receipt, Contra, or Credit / Debit Note voucher.
- **Business Fields:** Voucher Type, voucher date, reference party (where applicable), lines (account, cost center, currency, debit / credit amount), tax code references, narration, attachments (via `ENG-008`).
- **Required:** Voucher Type, date, at least two balanced lines; party for Payment / Receipt / Credit / Debit Note.
- **Business Validation Rules:** Debits equal credits; posting into a Closed period rejected; numbering resolves via `ENG-017`.
- **Submit Outcome:** Voucher persisted; on Post, `VoucherPosted` emits via `ENG-005`; ledger posting via `ENG-016`.
- **Mobile Optimization:** Numeric keypad for amount fields with debit/credit toggle; account selector uses searchable lookup; camera attachment capture via `ENG-008` for receipts and supporting documents; running debit/credit balance shown live at the footer.
- **Offline Behaviour:** Voucher **drafts** may be created offline per ADR-083 opted-in flow and are queued as pending submission until reconnected.

### F.5 Voucher Reversal Form (`MOD002-SCR-026`)

- **Purpose:** Reverse a posted voucher by creating a new Reversal Voucher.
- **Business Fields:** Source voucher reference (read-only), reversal date, reason narration, attachments.
- **Required:** Source reference (system-populated), reversal date, reason.
- **Business Validation Rules:** Source posted and not already reversed; target period not Closed; original never mutated (Ledger Immutability Convention).
- **Submit Outcome:** Reversal Voucher persisted; `VoucherPosted` emits for the reversal.

### F.6 Voucher Approval Action Form (`MOD002-SCR-025`)

- **Purpose:** Approve, reject, or request changes on a pending voucher.
- **Business Fields:** Decision, comment, attachments.
- **Required:** Decision; comment for Reject / Request Changes.
- **Business Validation Rules:** Approver must be within the Voucher Type's approval policy.
- **Submit Outcome:** Approval decision persisted via `ENG-011`; audit-visible per `ADR-014`.
- **Mobile Optimization:** Deep-linked from push notification; single-action confirmation for approve.

### F.7 Tax Code Form (`MOD002-SCR-052`)

- **Purpose:** Create / edit a Tax Code.
- **Business Fields:** Tax Code identifier, description, classification, applicability rule references, lifecycle state.
- **Required:** Identifier, classification, applicability.
- **Business Validation Rules:** Identifier unique within scope; applicability rule set resolvable by `ENG-012`.

### F.8 Period Lifecycle Action Form (`MOD002-SCR-061`)

- **Purpose:** Transition a period through its lifecycle (Soft Close / Close / initiate Reopening).
- **Business Fields:** Target period reference, action, comment.
- **Required:** Target period, action.
- **Business Validation Rules:** Action satisfies Period Authority Convention; Close blocked by unresolved preconditions; Reopening requires authorized authority.
- **Submit Outcome:** Period transitions; `PeriodClosed` emits at Closed; audit-visible per `ADR-014`.

### F.9 Financial-Year Close Form (`MOD002-SCR-064`)

- **Purpose:** Execute Financial-Year Close.
- **Business Fields:** Target Fiscal Year, opening-balance preparation summary, comment.
- **Required:** Target year.
- **Business Validation Rules:** All periods within the year Closed; opening balance readiness prepared; Financial Freeze Convention applies on completion.

### F.10 Closing Adjustment Voucher Form (`MOD002-SCR-063`)

- **Purpose:** Author a Closing Adjustment Voucher within a Soft Closed period.
- **Business Fields:** As Voucher Form (§F.4), scoped to Closing Adjustment Voucher Type.
- **Business Validation Rules:** As §F.4, with target period Soft Closed and not Closed.

### F.11 Opening Balance Entry Form (`MOD002-SCR-017`)

- **Purpose:** Capture an Opening Balance Entry per Company.
- **Business Fields:** Company, target Fiscal Year, account lines (account, amount, currency), source (roll-from-prior / manual).
- **Required:** Company, target year, at least one line.
- **Business Validation Rules:** Entries balance; capture prior to first posting in the target year.

### F.12 Audit Export Request (`MOD002-SCR-073`)

- **Purpose:** Assemble an audit export selection.
- **Business Fields:** Selection criteria (scope, actor, action, time range), export label, retention preference.
- **Business Validation Rules:** Selection within the requester's audit-visibility scope per `ADR-014`.
- **Submit Outcome:** Export request routed via `ENG-004`; completion notification via `ENG-025`.

### F.13 Notification Preferences Form (`MOD002-SCR-082`)

- **Purpose:** Manage per-user notification preferences for Accounting categories exposed by `ENG-025`.
- **Business Fields:** Category, delivery preference.
- **Business Validation Rules:** Categories and preferences within the permitted set exposed by `ENG-025`.

### F.14 Report Configuration Form (`MOD002-SCR-045`)

- **Purpose:** Configure a Financial Statement run (period, company, currency).
- **Business Fields:** Report type reference, period, company, currency, comparison run reference (optional).
- **Business Validation Rules:** Selections within scope; report never mutates ledger, voucher, or journal state.

### F.15 Data-Entry Optimizations (cross-cutting)

- **Numeric Keypad:** All amount fields use the platform numeric keypad with debit/credit toggle where applicable.
- **Attachment Capture:** Camera and file-picker attachment capture via `ENG-008` for vouchers, closing adjustments, and audit export requests.
- **Date Pickers:** Native date pickers for voucher date, period bounds, reversal date, and audit filter time range; locale resolved via `ENG-018`.
- **Search Patterns:** Searchable lookups for Chart of Accounts leaves, Cost Centers, Bank Accounts, Voucher Types, Tax Codes, Customers, and Suppliers with type-ahead resolution.
- **Validation Feedback:** Inline validation; running debit/credit balance in Voucher Form; blocking messages for boundary-convention violations.
- **Barcode / QR:** **Not authorized** by the Publication for accounting flows; intentionally omitted.

## G. Mobile UI Component Architecture

Component obligations only; no framework decisions and no visual guidance.

- **Scope Header** — persistently displays resolved tenant / company / period / currency; hosts the Scope Selector (`MOD002-SCR-002`).
- **Catalog Card List** — used for Chart of Accounts, Cost Centers, Bank Accounts, Voucher Types, Journal Entries, Tax Codes, and Audit Events; every card carries lifecycle state via icon + text label.
- **Voucher Line Editor** — line-by-line data-entry with running debit/credit balance footer.
- **Report Configurator** — bound to `MOD002-SCR-045`; presents period / company / currency selection and comparison run picker.
- **Determinism Indicator** — surfaces on every Financial Statement result.
- **Immutability Indicator** — surfaces on every posted voucher and ledger posting.
- **Boundary-Convention Banner** — surfaces on Tax Determination, Financial Statement, Period Close, and Audit Review screens to convey the applicable boundary convention.
- **Notification Card** — deep-links to the corresponding detail screen.

## H. Permissions & RBAC

- Access requires authenticated identity per `ENG-001`. MOB-002 defines no authentication mechanics.
- Menus, actions, and fields are gated per `ADR-032` (RBAC + ABAC) via `ENG-002`. Users see only entities within their tenant, organization, company, branch, and row-level scope.
- Voucher authoring, approval, reversal, period lifecycle transition, controlled reopening, financial-year close, tax master authoring, and opening-balance capture require the corresponding authorized authority declared by the Module Publication.
- Cross-tenant navigation is not permitted per `ADR-011`.

## I. Offline Behaviour

Offline behaviour is limited strictly to what the Module Publication and applicable ADRs authorize. MOB-002 adopts the online-first with graceful degradation posture declared by `ADR-083`.

### I.1 Cached Read Surfaces

Recently viewed Chart of Accounts leaves, Cost Centers, Bank Accounts, Voucher Types, Vouchers, Journal Entries, Ledger Postings, Balance snapshots, Financial Statement last-run outputs, Tax Codes, Periods, and Audit Events render read-only from cache with a "cached at" indicator. New queries require connectivity.

### I.2 Offline Transactions

Under ADR-083's opted-in field-flow posture, **voucher drafts** (including closing-adjustment drafts and opening-balance drafts) may be captured offline via `MOD002-SCR-022`, `MOD002-SCR-063`, and `MOD002-SCR-017`. Drafts are queued locally as pending submission and are neither posted nor submitted for approval until reconnection.

Voucher **posting**, **approval submission**, period **lifecycle transitions**, **reversal** submission, **financial-year close**, and **audit export requests** are never executed offline; the corresponding actions are retained locally as clearly pending submission until reconnected.

### I.3 Synchronization

On reconnect the mobile client:

1. Revalidates the queued drafts against the authoritative state (numbering series, period lifecycle, scope authority, balance) via the API surface;
2. Surfaces any validation feedback in-app before the draft becomes submitted;
3. On successful submission, receives the authoritative voucher reference (numbering from `ENG-017`) and updates local state.

### I.4 Conflict Handling

If a queued draft targets a period that has transitioned to Closed while the client was offline, or a voucher type whose approval policy has changed, or a scope no longer authorized, the draft is preserved locally and the conflict is surfaced as an in-app resolution state. The mobile client never silently overwrites authoritative state, and never mutates a posted voucher or a posted ledger movement.

### I.5 Retry Strategy

Queued submissions retry on reconnect with an increasing backoff bounded by the platform envelope. A queued submission never retries beyond its business-level validity window (for example, a period that has transitioned to Closed).

### I.6 Sign-Out

Cache and queued drafts are cleared within the platform envelope on sign-out.

## J. Device Capability Integration

Only capabilities authorized by the Module Publication, MOD-001 Platform Administration, or existing ADRs are surfaced. MOB-002 introduces no unauthorized capability.

- **Biometric Unlock (entry convenience).** Biometric unlock is an entry convenience only and does not substitute for the platform authentication mechanism enforced by `ENG-001`. MOB-002 defines no authentication mechanics.
- **Camera-Based Attachment Capture.** Vouchers, closing adjustments, and audit export requests may capture supporting attachments via the device camera through `ENG-008` (Attachment Engine), consistent with Publication §11 engine consumption.
- **Secure File Upload.** Attachments are uploaded through `ENG-008` under Platform security posture; the mobile client never bypasses the attachment pipeline.
- **Push Notifications.** Delivered exclusively via `ENG-025` (owned by MOD-001, consumed here) with deep-links to the corresponding detail screen. Notification categories are limited to Accounting-relevant events (voucher approval requested, voucher posted, period closed, financial-year close outcome, reversal completed, audit export ready).
- **Not Surfaced.** Barcode/QR scanning, offline biometric authentication, on-device signature capture, geo-tagging of vouchers, and voice authoring are intentionally not surfaced — the Publication and referenced ADRs do not authorize them.

## K. State Management, Search, Notifications, Errors

### K.1 State Management

- Resolved company / period / currency scope persists per session across all screens.
- Filter, pagination, and comparison-run selections persist per screen per session.
- Draft state (vouchers, closing adjustments, opening balances, tax master edits) persists per author within scope until submission, cancellation, or sign-out.

### K.2 Search & Filtering

- Every catalog surface offers scope-honouring type-ahead search: Chart of Accounts, Cost Centers, Bank Accounts, Vouchers, Journal Entries, Balances, Financial Statement runs, Tax Codes, Periods, and Audit Events.
- Advanced filters (Audit Filter Form `MOD002-SCR-072`, Report Configuration Form `MOD002-SCR-045`) accept business-level criteria only; cross-tenant selection is not offered.

### K.3 Notifications

- Push notifications delivered via `ENG-025` deep-link to Voucher Detail (`MOD002-SCR-024`), Journal Entry Detail (`MOD002-SCR-031`), Period Detail (`MOD002-SCR-060`), Audit Event Detail (`MOD002-SCR-071`), or Tax Code Detail (`MOD002-SCR-050`).
- The Notifications screen (`MOD002-SCR-081`) surfaces the ordered history; Notification Preferences (`MOD002-SCR-082`) manages per-category delivery preferences within the permitted set exposed by `ENG-025`.

### K.4 Error Handling

- Business-rule violations (unbalanced debits/credits, closed-period posting, cross-tenant selection, unauthorized scope, boundary-convention violation) surface as inline validation with plain business-language messages; no state change occurs.
- Connectivity failures surface as retryable states with a clear "pending submission" indicator; drafts are preserved.
- Cache staleness surfaces as a "cached at" indicator; refresh requires connectivity.
- Authorization changes surfaced when a queued action is no longer permitted at submission time.

## L. Accessibility

Aligned to `ADR-081` (Accessibility Standard). Objectives only.

- All actionable targets meet the platform accessibility baseline.
- State changes (voucher lifecycle transitions, period lifecycle transitions, posting outcomes, approval decisions, reversal postings, audit event categories) are announced.
- Color-independent communication is required for voucher and period lifecycle states, immutability indicators, determinism indicators, offline / online state, and error states.
- Localization is resolvable via the Platform Localization surface (owned by MOD-001) and currency via `ENG-018`.

## M. Responsive Mobile Layout, Non-Functional & Cross-Module Integration

### M.1 Responsive Mobile Layout

- Phone and tablet form factors are supported. Catalogs, detail surfaces, and read-only reports reflow across widths without loss of business content or actions.
- Complex authoring (multi-line vouchers, closing adjustments, financial-year close) preserves every business field; on phone form factors, line-by-line entry is used with a persistent running-balance footer.

### M.2 Engine Integration Mapping

Every engine below is consumed exactly as declared in Publication §11. MOB-002 introduces no new engine consumption.

| Engine | Mobile Consumption |
| --- | --- |
| ENG-001 (Identity Engine) | Authenticated session; scope resolution. |
| ENG-002 (Authorization Engine) | Menu, screen, action, and field gating per `ADR-032`. |
| ENG-004 (Audit Engine) | Read-only source for Audit Timeline (§C.13); export routing. |
| ENG-005 (Event Engine) | Emits `VoucherPosted`, `PeriodClosed`, `PaymentRecorded`, `ReceiptRecorded`, `BankReconciled` semantics as consumed by mobile deep-links and notifications. |
| ENG-007 (Document Engine) | Document generation for voucher and statement views where authorized. |
| ENG-008 (Attachment Engine) | Camera / file-picker attachment capture for vouchers, closing adjustments, and audit exports. |
| ENG-011 (Approval Engine) | Voucher approvals, closing-adjustment approvals, controlled-reopening approvals. |
| ENG-012 (Rules Engine) | Tax applicability and determination read-only surfaces. |
| ENG-015 (Voucher Engine) | Voucher lifecycle validation (balance, immutability). |
| ENG-016 (Posting Engine) | Journal Entry and Ledger Posting production; reversal posting production. |
| ENG-017 (Numbering Engine) | Voucher numbering resolution. |
| ENG-018 (Currency Engine) | Currency resolution across vouchers, balances, and reports. |
| ENG-021 (Reporting Engine) | Financial Statement production via the Reporting Read Model. |
| ENG-024 (Configuration Engine) | Base Accounting Configuration and Tax Configuration resolution through the Platform configuration hierarchy. |

### M.3 Cross-Module Integration

Consistent with WEB-002 §D.6 and Publication §10. Mobile cross-module drill-downs surrender control to the target module's own surface:

- **MOD-001 Platform Administration:** Tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization pack lifecycle, notification infrastructure, and audit collection are consumed here; owned there.
- **MOD-003 Sales / MOD-004 Purchase / MOD-005 Inventory / MOD-008 Payroll / MOD-015 POS:** Read-only event consumers per Publication §10 (`SalesInvoiceIssued`, `PurchaseInvoiceReceived`, `InventoryValuationChanged`, `PayrollPosted`, `POSDayClosed`). Accounting never mutates downstream state.
- **MOD-017 Analytics:** Read-only consumer of Accounting reports and events; owns no Accounting master data or transactions.

### M.4 Non-Functional Requirements

- Interactive operations complete within the platform latency budget declared in `docs/02-architecture/quality-attributes.md`.
- Cache size, retention, and eviction remain within the platform envelope.
- Battery, network, and storage impact remain within the platform envelope.
- All state-changing actions are audit-visible per `ADR-014`.

## L-bis. Design Constraints

MOB-002 asserts, in accordance with the Solution Design framework:

- **No new business requirements.** Every capability, master data reference, transaction, event, rule, and convention is inherited from `MOD-002_MODULE_PUBLICATION`. Any perceived gap is a Publication concern, not an MOB-002 concern.
- **No implementation-specific technology decisions unless established by ADR.** No framework, library, runtime, storage engine, database schema, or transport protocol is prescribed. Where mobile behaviour depends on a technology decision, the decision resides in an existing ADR (`ADR-081` Accessibility, `ADR-083` Offline UX, `ADR-011` Multi-Tenant Isolation, `ADR-032` RBAC + ABAC, `ADR-014` Audit Strategy, `ADR-051` Transactional Outbox, `ADR-053` Idempotency).
- **Functional parity with GT-005 and WEB-002.** Every authority in Publication §4 is represented on the mobile surface at least once (see §N); every WEB-002 journey has a mobile analogue where mobile support is warranted; mobile deltas (barcode/QR omission, phone form-factor projection of complex authoring) are conservative subsets and never introduce new capabilities.
- **Implementation-independent.** The specification remains valid across any conforming native or hybrid implementation.

## M-bis. Acceptance Criteria

MOB-002 is Accepted when:

1. Every authority in Publication §4 is represented at least once in §N and resolves to a Screen ID defined in §E.
2. Engine and ADR sets are consistent with Publication §11 (with the additive `ADR-081`, `ADR-083` for mobile-surface concerns already authorized by Platform posture).
3. Screen inventory (§E) uses canonical `MOD002-SCR-NNN` identifiers and every referenced Screen ID resolves in §E.
4. Functional parity with WEB-002 is preserved for personas, journeys, forms, and boundary conventions.
5. Offline and device capability sections declare only Publication- and ADR-authorized behaviour.
6. Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0` with `MAJOR = 0` and `CRITICAL = 0`.

## N. Traceability Matrix

Repository standard 6-column matrix per Verification Reporting Standard. Every MOD-002 authority in Publication §4 appears at least once; every `Screen ID` entry resolves to a Screen in §E; every WEB-002 journey has an MOB-002 analogue.

| GT-005 Authority | Sprint | Screen ID | Workflow | Engine(s) | ADR(s) |
| --- | --- | --- | --- | --- | --- |
| Accounting Ownership Convention Authority | SPR-MOD-002-001 | `MOD002-SCR-010`, `MOD002-SCR-011`, `MOD002-SCR-012`, `MOD002-SCR-013`, `MOD002-SCR-014`, `MOD002-SCR-015` | §C.1 | ENG-001, ENG-024 | ADR-011, ADR-012, ADR-014 |
| Voucher Ownership Convention Authority | SPR-MOD-002-002 | `MOD002-SCR-020`, `MOD002-SCR-021`, `MOD002-SCR-022`, `MOD002-SCR-023`, `MOD002-SCR-024`, `MOD002-SCR-025` | §C.2, §C.3 | ENG-011, ENG-015, ENG-017, ENG-008 | ADR-014, ADR-032, ADR-053 |
| Ledger Posting Ownership Convention Authority | SPR-MOD-002-003 | `MOD002-SCR-030`, `MOD002-SCR-031`, `MOD002-SCR-032` | §C.2, §C.5 | ENG-016, ENG-018 | ADR-013, ADR-014, ADR-051 |
| Ledger Immutability Convention Authority | SPR-MOD-002-003 | `MOD002-SCR-024`, `MOD002-SCR-026`, `MOD002-SCR-032` | §C.4 | ENG-015, ENG-016 | ADR-014, ADR-015 |
| Balance Integrity Convention Authority | SPR-MOD-002-003 | `MOD002-SCR-033` | §C.5 | ENG-016, ENG-018 | ADR-011, ADR-013 |
| Ledger Access Boundary Convention Authority | SPR-MOD-002-003 | `MOD002-SCR-030`, `MOD002-SCR-032`, `MOD002-SCR-033`, `MOD002-SCR-080` | §C.5, §D.5 | ENG-016 | ADR-011, ADR-032 |
| Financial Reporting Ownership Convention Authority | SPR-MOD-002-004 | `MOD002-SCR-040`, `MOD002-SCR-041`, `MOD002-SCR-042`, `MOD002-SCR-043`, `MOD002-SCR-044` | §C.6 | ENG-021, ENG-018 | ADR-014 |
| Ledger Consumption Convention Authority | SPR-MOD-002-004 | `MOD002-SCR-041`, `MOD002-SCR-045` | §C.6 | ENG-021, ENG-016 | ADR-014 |
| Report Determinism Convention Authority | SPR-MOD-002-004 | `MOD002-SCR-040`, `MOD002-SCR-041`, `MOD002-SCR-042`, `MOD002-SCR-043`, `MOD002-SCR-044`, `MOD002-SCR-045` | §C.6 | ENG-021 | ADR-053 |
| Reporting Read Model Convention Authority | SPR-MOD-002-004 | `MOD002-SCR-040`, `MOD002-SCR-041`, `MOD002-SCR-045`, `MOD002-SCR-080` | §C.6 | ENG-021 | ADR-014 |
| Financial Statement Boundary Convention Authority | SPR-MOD-002-004 | `MOD002-SCR-040`, `MOD002-SCR-042`, `MOD002-SCR-043`, `MOD002-SCR-044`, `MOD002-SCR-080` | §C.6 | ENG-021 | ADR-014 |
| Tax Ownership Convention Authority | SPR-MOD-002-005 | `MOD002-SCR-050`, `MOD002-SCR-051`, `MOD002-SCR-052` | §C.7 | ENG-012, ENG-024 | ADR-014 |
| Tax Calculation Boundary Convention Authority | SPR-MOD-002-005 | `MOD002-SCR-051`, `MOD002-SCR-080` | §C.7 | ENG-012 | ADR-014 |
| Tax Configuration Authority Convention | SPR-MOD-002-005 | `MOD002-SCR-050`, `MOD002-SCR-052` | §C.7 | ENG-024 | ADR-014 |
| Compliance Readiness Convention Authority | SPR-MOD-002-005 | `MOD002-SCR-053` | §C.7 | ENG-021 | ADR-014 |
| Tax Reporting Boundary Convention Authority | SPR-MOD-002-005 | `MOD002-SCR-053`, `MOD002-SCR-080` | §C.7 | ENG-021 | ADR-014 |
| Period Authority Convention Authority | SPR-MOD-002-006 | `MOD002-SCR-060`, `MOD002-SCR-061` | §C.8 | ENG-005, ENG-011 | ADR-014, ADR-051 |
| Financial Year Ownership Convention Authority | SPR-MOD-002-006 | `MOD002-SCR-013`, `MOD002-SCR-016`, `MOD002-SCR-017`, `MOD002-SCR-062`, `MOD002-SCR-063`, `MOD002-SCR-064` | §C.10, §C.11, §C.12 | ENG-011, ENG-015, ENG-016 | ADR-014 |
| Period Close Boundary Convention Authority | SPR-MOD-002-006 | `MOD002-SCR-060`, `MOD002-SCR-080` | §C.8 | ENG-005 | ADR-014 |
| Controlled Reopening Convention Authority | SPR-MOD-002-006 | `MOD002-SCR-060`, `MOD002-SCR-061` | §C.9 | ENG-011 | ADR-014 |
| Audit Review Boundary Convention Authority | SPR-MOD-002-006 | `MOD002-SCR-070`, `MOD002-SCR-071`, `MOD002-SCR-072`, `MOD002-SCR-073`, `MOD002-SCR-080` | §C.13 | ENG-004, ENG-025 | ADR-014 |
| Financial Freeze Convention Authority | SPR-MOD-002-006 | `MOD002-SCR-064`, `MOD002-SCR-080` | §C.12 | ENG-016 | ADR-014, ADR-015 |
| Session, Notification & Preference Surface (cross-cutting) | Cross-cutting | `MOD002-SCR-001`, `MOD002-SCR-002`, `MOD002-SCR-081`, `MOD002-SCR-082`, `MOD002-SCR-083` | Cross-cutting | ENG-001, ENG-025 | ADR-011, ADR-032, ADR-081, ADR-083 |

**Consistency Note.** No Screen ID referenced in §N is absent from §E; every Screen defined in §E appears at least once in this matrix or in §C, satisfying §7 V3 of the Screen Identifier Standard. MOB-002 introduces no capability, master data entity, transaction, event, engine, or ADR beyond those declared by `MOD-002_MODULE_PUBLICATION` (and the mobile-surface accessibility/offline ADRs already authorized by Platform posture).

## O. Web / Mobile Parity Notes (deltas vs WEB-002)

- WEB-002 §D Menu Hierarchy is projected onto MOB-002 §D bottom navigation (Home / Vouchers / Ledgers / Reports / More).
- WEB-002 §C.1 (Establish Accounting Foundation) is lower-frequency on mobile and surfaces via the "More" drawer rather than a primary tab; light authoring is supported.
- Complex authoring (multi-line vouchers, Financial-Year Close workbench, closing adjustments) preserves every business field but presents line-by-line entry with a running-balance footer on phone form factors.
- Barcode/QR is intentionally omitted: the Publication does not authorize it for accounting flows.
- Financial-Year Close full workbench remains WEB-primary; MOB-002 exposes status and single-action execution within authority.
- Voucher drafting is offline-capable under ADR-083 opted-in flow; posting and approval submission remain online-only.

## P. Repository State Transition

`MOD002_WEB_SOLUTION_DESIGN_COMPLETE` → **`MOD002_MOBILE_SOLUTION_DESIGN_COMPLETE`**

Authorizes Pass 37.4.0 — API-002 Accounting Solution Design.

## References

- [`docs/45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md`](../../45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md) — sole functional authority.
- [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- [`docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md`](../../30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md)
- [`docs/60-solution-design/web/WEB-002_ACCOUNTING.md`](../web/WEB-002_ACCOUNTING.md) — parity reference only.
- [`docs/60-solution-design/mobile/MOB-001_PLATFORM_ADMINISTRATION.md`](./MOB-001_PLATFORM_ADMINISTRATION.md) — canonical reference pattern.
- [`docs/15-governance/SCREEN_IDENTIFIER_STANDARD.md`](../../15-governance/SCREEN_IDENTIFIER_STANDARD.md)
- [`docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`](../../15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md)
- [`docs/15-governance/FINDING_SEVERITY_STANDARD.md`](../../15-governance/FINDING_SEVERITY_STANDARD.md)
- [`docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`](../SOLUTION_DESIGN_CATALOG.md)
