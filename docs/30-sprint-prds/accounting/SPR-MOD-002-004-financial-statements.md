---
title: "SPR-MOD-002-004 — Financial Statements"
summary: "Sprint PRD for Financial Statements of MOD-002 Accounting: repository-standard financial reporting (Trial Balance, General Ledger, Profit & Loss, Balance Sheet, Cash Flow) built exclusively on authoritative ledger movements produced by SPR-MOD-002-003. Deterministic projections of ledger state; consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Accounting"
status: "Draft"
updated: "2026-07-07"
sprint_id: "SPR-MOD-002-004"
parent_module: "MOD-002"
parent_sprint_plan: "MOD-002_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "8.3.4"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-018", "ENG-021", "ENG-024"]
related_adrs: ["ADR-011", "ADR-013", "ADR-014", "ADR-032", "ADR-051", "ADR-053"]
tags: ["sprint", "prd", "accounting", "mod-002", "financial-statements", "reporting", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-002-004 — Financial Statements

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-002 Accounting** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-002-004` (permanent) |
| Parent Module | `MOD-002` — Accounting |
| Parent Sprint Plan | [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Sprint | [`SPR-MOD-002-003`](./SPR-MOD-002-003-journal-ledger-posting.md) — Journal & Ledger Posting |
| Upstream Baseline | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-002-005` (Taxation & Compliance), `SPR-MOD-002-006` (Period Close & Audit); every module that consumes accounting reports (MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017, MOD-018) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **repository-standard financial reporting layer** for BusinessOS — Trial Balance, General Ledger report, Profit & Loss, Balance Sheet, and Cash Flow Statement — built **exclusively on authoritative ledger movements** produced by [`SPR-MOD-002-003`](./SPR-MOD-002-003-journal-ledger-posting.md). Financial statements are deterministic projections of ledger state; they do not perform posting, do not modify accounting transactions, and do not define period lifecycle.

> **Financial Reporting Ownership Convention.** The Accounting module owns the business semantics of all standard financial statements (Trial Balance, General Ledger, Profit & Loss, Balance Sheet, Cash Flow). No downstream module may redefine accounting report calculations. ERP Core Engines provide shared reporting, currency, event, audit, and authorization infrastructure but **MUST NOT** redefine financial statement business rules.
>
> **Ledger Consumption Convention.** Financial Statements consume authoritative ledger movements produced by `SPR-MOD-002-003`. Financial reports **MUST NOT** reconstruct accounting transactions from vouchers or source documents. The ledger is the single authoritative accounting source.
>
> **Report Determinism Rule.** Identical report parameters applied against an unchanged ledger MUST always produce identical report output. Financial reports are deterministic projections of ledger state; they never introduce non-deterministic transformations at read time.
>
> **Reporting Read Model Convention.** Financial Statements expose repository-approved read models. Read models MAY optimize reporting performance but **MUST NOT** become independent sources of accounting truth; ledger state remains authoritative and read models are strict projections of it.
>
> **Financial Statement Boundary.** Financial Statements describe accounting position only. They MUST NOT perform posting, modify journals, create vouchers, reopen accounting periods, calculate taxes, or change ledger balances.

These conventions complement — and do not replace — the Accounting Ownership Convention from [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md), the Accounting Voucher Ownership Convention from [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md), and the Ledger Posting Ownership / Ledger Immutability / Balance Integrity / Accounting Period Authority / Ledger Access Boundary conventions from [`SPR-MOD-002-003`](./SPR-MOD-002-003-journal-ledger-posting.md).

### 1.2 In Scope

- **Trial Balance** — per account × tenant × company × currency × period, with debit and credit totals and net position; totals balance to zero at report level.
- **General Ledger report** — account activity per account × tenant × company × currency × period, presenting opening balance, movements, and closing balance; reconciles exactly with account balances produced by `SPR-MOD-002-003`.
- **Profit & Loss Statement** — revenue and expense presentation for a period, derived exclusively from posted ledger movements against P&L-classified accounts (classification owned by `SPR-MOD-002-001`).
- **Balance Sheet** — assets, liabilities, and equity at a point in time, derived exclusively from posted ledger movements against Balance Sheet-classified accounts; satisfies `Assets = Liabilities + Equity`.
- **Cash Flow Statement** — cash movement presentation derived from authoritative accounting movements against cash-classified accounts.
- **Account activity reporting** — line-level movement listing for a given account, traceable back to source journal entries.
- **Comparative reporting across accounting periods** — side-by-side presentation across two or more periods on the same report family.
- **Opening / Closing balance presentation** — deterministically computed from ledger movements and the fiscal-year / period boundaries defined by `SPR-MOD-002-001`.
- **Report parameterization** — period, branch, company, and financial year selection at report generation time.
- **Multi-company reporting boundaries** — reports are scoped to a single tenant / company by default; cross-company presentation is bounded and does not perform consolidation (see §1.3).
- **Multi-currency presentation** — reports present stored accounting values in their source currency and, where the report expresses a reporting currency, use conversion utilities consumed via `ENG-018` (currency) without redefining currency semantics.
- **Report export readiness** — reports are structured so that authoritative export flows (invoked outside this sprint's boundary) can serialize them without recomputation.
- **Audit traceability from report line back to ledger entries** — every report line references the ledger movements that produced it, preserving the traceability chain established by `SPR-MOD-002-003`.
- **Financial reporting events** — see §11 for the expected event surface and the Event Catalog governance rule that governs their publication.

### 1.3 Out of Scope

Reserved for later Accounting sprints and other modules (see [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) and [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)):

- **Tax reports and tax-specific statements** — delivered by `SPR-MOD-002-005`.
- **Period close, period lock, and closing adjustments** — delivered by `SPR-MOD-002-006`.
- **Financial consolidation** — cross-company or multi-entity consolidation is not delivered here; multi-company reporting in this sprint stops at boundary presentation, not consolidation.
- **Budgeting and forecasting.**
- **Analytics dashboards, BI cubes, regulatory reporting, AI insights, and custom report designer.**
- **Voucher lifecycle, journal creation, ledger posting, and period lifecycle** — owned by `SPR-MOD-002-002`, `SPR-MOD-002-003`, and `SPR-MOD-002-006` respectively; this sprint consumes their outputs and does not re-declare them.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-002-004`, the following will exist:

- **Business capabilities.**
  - Trial Balance, General Ledger report, Profit & Loss, Balance Sheet, and Cash Flow can be generated per tenant × company × currency × period.
  - Every report is a deterministic projection of ledger state produced by `SPR-MOD-002-003`.
  - Trial Balance balances to zero; Balance Sheet satisfies `Assets = Liabilities + Equity`; General Ledger reconciles exactly with account balances.
  - Every report line is traceable back to its underlying journal entries.
  - Comparative reporting across accounting periods is available for each report family.
  - Multi-currency presentation preserves stored source-currency values and consumes `ENG-018` for conversion; conversion semantics are not redefined here.
- **Cross-module contract.**
  - Downstream modules consume financial reports through the read-model surface defined by this sprint; they MUST NOT read or mutate ledger state directly (per the Ledger Access Boundary from `SPR-MOD-002-003`).
  - Financial reports MUST NOT drive posting, journal changes, voucher creation, period reopening, tax calculation, or ledger balance mutation.
- **Published events.** Reporting-lifecycle events per §11, published only for events that exist in the authoritative Event Catalog at authoring time.
- **Audit artifacts.** An audit record exists for every report generation, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-002-004`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema, materialized read models, and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-002 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Financial statements | Trial Balance, General Ledger, P&L, Balance Sheet, Cash Flow |
| §4 Business Processes — Reporting and statements | Deterministic report generation from authoritative ledger movements |
| §5 Reports — Standard financial statements | Report families listed in §1.2 |
| §7 Business Rules — Balance Sheet identity, TB balances to zero | Balance Integrity applied at report boundary as a projection of ledger balances |
| §7 Business Rules — Reports read the ledger; posting is one-way | Ledger Consumption Convention (§1.1) |
| §8 Multi-Currency — Presentation | Multi-currency presentation using stored values and `ENG-018` conversion |
| §10 Configuration — Fiscal year, periods, account classification | Consumed from `SPR-MOD-002-001` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here.

---

## 4. User Stories

- **US-001.** *As an accountant, I want to generate a Trial Balance for a selected period, company, and currency, so that I can verify debits equal credits before further reporting.*
- **US-002.** *As a controller, I want to generate a Profit & Loss statement for a period, so that I can evaluate operating performance from authoritative posted movements only.*
- **US-003.** *As a controller, I want to generate a Balance Sheet at a point in time, so that I can inspect the accounting position with `Assets = Liabilities + Equity` guaranteed.*
- **US-004.** *As an accountant, I want a General Ledger report for a selected account, so that I can review opening balance, all movements, and closing balance for the period.*
- **US-005.** *As a treasurer, I want a Cash Flow statement derived from authoritative ledger movements, so that I can review cash movement without reconstructing it from source documents.*
- **US-006.** *As a controller, I want comparative reporting across accounting periods on the same report family, so that I can review trends without leaving the standard reporting surface.*
- **US-007.** *As a controller, I want identical parameters against an unchanged ledger to produce identical report output, so that reports are trustworthy artefacts.*
- **US-008.** *As a downstream module (system persona), I want to consume financial reports through the read-model surface, so that ledger state remains encapsulated inside Accounting.*
- **US-009.** *As a security reviewer, I want every report generation to be authorized via `ENG-002` and audited via `ENG-004`, so that report access can be reconstructed from an authoritative log.*
- **US-010.** *As an auditor, I want every report line to be traceable back to its underlying journal entries, so that report figures can be reconciled without ambiguity.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Trial Balance (US-001)

- **Given** a valid Trial Balance request naming tenant, company, currency, and period,
  **when** the report is generated,
  **then** it lists every account with a non-zero movement or balance in scope with debit total, credit total, and net position, and the report-level total of `debits − credits` equals zero.

### 5.2 Balance Sheet identity (US-003)

- **Given** a Balance Sheet request for a valid tenant, company, currency, and point in time,
  **when** the report is generated,
  **then** it satisfies `Assets = Liabilities + Equity` exactly against the ledger state at that point in time.

### 5.3 Profit & Loss (US-002)

- **Given** a Profit & Loss request for a valid tenant, company, currency, and period,
  **when** the report is generated,
  **then** every figure is derived exclusively from posted ledger movements against P&L-classified accounts; no figure originates from vouchers or source documents.

### 5.4 General Ledger reconciliation (US-004)

- **Given** a General Ledger request for an account, tenant, company, currency, and period,
  **when** the report is generated,
  **then** its opening balance, listed movements, and closing balance reconcile exactly with the account balance produced by `SPR-MOD-002-003`.

### 5.5 Cash Flow (US-005)

- **Given** a Cash Flow request for a valid tenant, company, currency, and period,
  **when** the report is generated,
  **then** every figure is derived from authoritative accounting movements against cash-classified accounts; no figure is reconstructed from source documents.

### 5.6 Determinism (US-007)

- **Given** identical report parameters applied against an unchanged ledger,
  **when** the report is generated twice,
  **then** both invocations produce identical output byte-for-byte at the report data layer.

### 5.7 Boundary scoping (US-001–US-005)

- **Given** any financial report request,
  **when** it executes,
  **then** it respects the caller's tenant, company, branch, and financial-year boundaries; no cross-tenant or cross-company data leaks into the result.

### 5.8 Traceability (US-010)

- **Given** any line on a generated report,
  **when** the caller requests its provenance,
  **then** the line references the specific journal entries that produced it, preserving the traceability chain established by `SPR-MOD-002-003`.

### 5.9 Authorization and audit (US-009)

- **Given** any report generation request,
  **when** it is submitted,
  **then** the request is authorized via `ENG-002` under the caller's tenant/company/role context, and every successful or refused generation produces an audit record via `ENG-004`.
- **Given** an unauthorized report request,
  **when** it is evaluated,
  **then** it is refused deterministically and audited.

### 5.10 Ledger access boundary (US-008)

- **Given** a downstream module (system persona) attempting to bypass the reporting read-model surface and read ledger state directly,
  **when** the attempt occurs,
  **then** it is refused deterministically at the Accounting boundary (per the Ledger Access Boundary from `SPR-MOD-002-003`).

### 5.11 Events

- **Given** a report generation event that is registered in the authoritative Event Catalog at authoring time (see §11),
  **when** the corresponding report generation completes,
  **then** the event is published via `ENG-024` conforming to the catalog's contract.
- **Given** an expected reporting event listed in §11 that is **not** present in the Event Catalog at authoring time,
  **when** the corresponding report generation completes,
  **then** no event is published for that report family until the event is introduced in the Event Catalog by a dedicated architecture pass (see Risks R-EV-01).

### 5.12 Financial Statement Boundary (US-002…US-005)

- **Given** any interaction with the financial reporting surface,
  **when** an attempt is made to post, modify a journal, create a voucher, reopen a period, calculate a tax, or change a ledger balance through this surface,
  **then** it is refused deterministically.

### 5.13 Isolation invariants (`ADR-011`)

- **Given** any report read,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read can succeed.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-002` — Accounting.
- **Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Financial statements), §4 (Reporting and statements), §5 (Standard financial statements), §7 (Balance identity, TB balances to zero, reports read the ledger), §8 (Multi-currency presentation), §10 (Configuration consumed), §12 (Engine consumption). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-002` MODULE_PRD.
- **Upstream sprint:** [`SPR-MOD-002-003`](./SPR-MOD-002-003-journal-ledger-posting.md) — Journal & Ledger Posting. Required: authoritative journal entries, ledger movements, ledger balances, Ledger Immutability Convention, Ledger Access Boundary.
- **Upstream sprint (transitive):** [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md) — Voucher Framework. Consumed indirectly through the ledger produced by Sprint 003.
- **Upstream sprint (transitive):** [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) — Accounting Foundation. Required master data: Chart of Accounts, account classifications (P&L / Balance Sheet / Cash), fiscal year, accounting periods, base accounting configuration.
- **Upstream baseline:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen). Individual Platform Sprint PRDs are cited only where sprint-level traceability is specifically required.
- **Downstream sprints:** `SPR-MOD-002-005` (Taxation & Compliance — reads P&L / Balance Sheet outputs where applicable), `SPR-MOD-002-006` (Period Close & Audit — reads financial statements at close time). See [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Downstream modules:** MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017, MOD-018 — consume financial reports via the read-model surface established here.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Financial Reporting Ownership Convention in §1.1). Engine identifiers below match the authoritative entries in [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md) and [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md); no new identifiers are introduced here.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Authorizes every report generation request against the actor's tenant/company/role context. |
| `ENG-004` Audit | Records every report generation, including refusals for authorization or boundary violations. |
| `ENG-018` Currency | Provides currency conversion utilities consumed by multi-currency presentation; not redefined here. |
| `ENG-021` Reporting | Provides shared reporting infrastructure consumed to build read models and render report families. Accounting reporting business semantics remain owned by this sprint. |
| `ENG-024` Eventing | Publishes reporting-lifecycle events with the contracts declared in §11, subject to the Event Catalog governance rule. |

Accounting reporting business semantics (report families, balance identities, determinism rule, read-model authority, Financial Statement Boundary) are owned by this sprint and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every report read. |
| `ADR-013` Persistence & Transactionality | Authoritative persistence contract for reporting read models as strict projections of the ledger. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for report generation. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to report access. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for reporting-lifecycle events. |
| `ADR-053` Multi-Currency Handling | Authoritative multi-currency model consumed by multi-currency presentation. |

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Financial Report Definition | MOD-002 (this sprint) | Definition of a report family (Trial Balance, General Ledger, P&L, Balance Sheet, Cash Flow), its parameters, and its projection rules over ledger state. |
| Report Parameter Set | MOD-002 (this sprint) | Parameter binding for a single report generation (tenant, company, branch, currency, financial year, period, comparison periods). |
| Report Output | MOD-002 (this sprint) | Structured result of a report generation, composed of header metadata and report lines; a deterministic projection of the ledger. |
| Report Line | MOD-002 (this sprint) | Individual output line under a Report Output, carrying account reference (where applicable), amounts, and provenance references. |
| Report Line Provenance | MOD-002 (this sprint) | Directed references from a Report Line to the ledger movements (and their journal entries) that produced it, preserving the traceability chain from `SPR-MOD-002-003`. |
| Reporting Read Model | MOD-002 (this sprint) | Repository-approved read model that materializes ledger balances and movements for reporting; not an independent source of accounting truth. |

### 10.2 Relationships

- A **Financial Report Definition** describes one report family with a fixed set of parameters.
- A **Report Parameter Set** binds a Financial Report Definition to a specific tenant / company / branch / currency / financial year / period.
- A **Report Output** is produced by exactly one Report Parameter Set and belongs to exactly one tenant / company.
- A **Report Output** owns one or more **Report Lines**.
- A **Report Line** carries zero or one account reference (some report families use group / total lines) and one or more **Report Line Provenance** references.
- A **Report Line Provenance** references ledger movements owned by `SPR-MOD-002-003`.
- A **Reporting Read Model** is a projection over ledger movements and balances; it never mutates ledger state.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-002` per the Financial Reporting Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Ledger movements, ledger balances, and journal entries referenced by report lines are owned by `SPR-MOD-002-003`.
- Account classifications, fiscal year, and accounting periods are owned by `SPR-MOD-002-001`.
- Vouchers referenced transitively through provenance are owned by `SPR-MOD-002-002`.

Physical schema (tables, columns, indexes, materialized-view choices) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`.

**Event Catalog governance (architecture-doc immutability).** Sprint PRD authoring is documentation-only and MUST NOT modify `docs/02-architecture/event-catalog.md`. This Sprint PRD references only event names that exist in the authoritative Event Catalog at authoring time. Introduction of new event definitions requires a separate, explicitly authorized architecture pass — never this pass.

The expected reporting event surface for this sprint, using the single-entity dotted namespace precedent set by `SPR-MOD-002-002` and `SPR-MOD-002-003`, is:

| Event Name (expected) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `financialstatement.generated` | MOD-002 | SPR-MOD-002-004 | MOD-002 (self), MOD-017, MOD-018 | At-least-once, ordered per tenant (per `ADR-051`) |
| `trialbalance.generated` | MOD-002 | SPR-MOD-002-004 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |
| `balancesheet.generated` | MOD-002 | SPR-MOD-002-004 | MOD-002 (self), MOD-017, MOD-018 | At-least-once, ordered per tenant |
| `profitloss.generated` | MOD-002 | SPR-MOD-002-004 | MOD-002 (self), MOD-017, MOD-018 | At-least-once, ordered per tenant |
| `cashflow.generated` | MOD-002 | SPR-MOD-002-004 | MOD-002 (self), MOD-017, MOD-018 | At-least-once, ordered per tenant |

Each event above is published **only if and when it is registered in the authoritative Event Catalog** by a dedicated architecture pass. Any event listed above that is not present in the catalog at implementation time is deferred; the report family still functions, but no event is published for it until the catalog registers it (see Risks R-EV-01). Consumer lists reflect **known** consumers at authoring time and MAY grow. If the authoritative catalog uses variant names, the catalog wins and this PRD is corrected in a subsequent authoring pass.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Trial Balance, General Ledger, P&L, Balance Sheet, and Cash Flow can be generated for a tenant × company × currency × period.
- [ ] Trial Balance balances to zero.
- [ ] Balance Sheet satisfies `Assets = Liabilities + Equity`.
- [ ] General Ledger reconciles exactly with the account balances produced by `SPR-MOD-002-003`.
- [ ] Profit & Loss and Cash Flow derive exclusively from posted ledger movements.
- [ ] Report determinism is demonstrated: identical parameters against an unchanged ledger produce identical output.
- [ ] Reports respect tenant, company, branch, and financial-year boundaries.
- [ ] Every report line is traceable back to its underlying journal entries.
- [ ] The Ledger Access Boundary is enforced: no report path bypasses the read-model surface.
- [ ] The Financial Statement Boundary is enforced: no report path posts, modifies journals, creates vouchers, reopens periods, calculates taxes, or changes ledger balances.
- [ ] Every report generation is authorized via `ENG-002` and audited via `ENG-004`.
- [ ] Reporting-lifecycle events that exist in the Event Catalog are emitted per §11; deferred events are recorded as such in Risks/Assumptions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every report read.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-002_SPRINT_PLAN.md` §2 (`SPR-MOD-002-004`):

- Trial Balance, General Ledger, Profit & Loss, Balance Sheet, and Cash Flow can be generated per tenant × company × currency × period from authoritative ledger movements only.
- Trial Balance balances to zero; Balance Sheet satisfies `Assets = Liabilities + Equity`; General Ledger reconciles exactly with account balances.
- Identical parameters against an unchanged ledger produce identical report output.
- Every report line is traceable back to its underlying journal entries.
- Every report generation is authorized via `ENG-002` and audited via `ENG-004`; reporting-lifecycle events that exist in the Event Catalog are emitted via `ENG-024`.
- No report path performs posting, journal mutation, voucher creation, period reopening, tax calculation, or ledger balance mutation.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable). Repository-wide ratification of this vocabulary is queued for a future governance pass and is not performed here.

- **Risk ID:** R-01
  - **Description:** This sprint depends on `SPR-MOD-002-003` (Journal & Ledger Posting) being `Done` with ledger movements, ledger balances, and account balances available.
  - **Impact:** Any regression in ledger immutability or balance integrity blocks this sprint.
  - **Mitigation:** Gate this sprint on `SPR-MOD-002-003` completion; treat regressions as upstream defects.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Transitive dependency on `SPR-MOD-002-001` master data (CoA, account classifications, fiscal year, accounting periods) and `SPR-MOD-002-002` voucher/journal traceability under every participating tenant / company.
  - **Impact:** Missing foundation or voucher-layer state blocks reporting exercises and smoke fixtures.
  - **Mitigation:** Consume upstream seeds; treat missing state as an upstream defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** This sprint depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, users/roles/permissions, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen baseline contract; treat regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Tax reports, period close, and consolidation are deferred to `SPR-MOD-002-005`, `SPR-MOD-002-006`, and future work.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** `ENG-021` Reporting is consumed as shared infrastructure and must accept the report families defined here without weakening determinism or the Reporting Read Model Convention.
  - **Impact:** A weaker reporting contract would compromise determinism or make read models an independent source of truth.
  - **Mitigation:** Consume `ENG-021` per its authoritative contract; escalate weakening as an engine defect.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** `ENG-018` Currency is consumed for multi-currency presentation and must not silently rewrite stored source-currency values.
  - **Impact:** Silent rewrites would break audit traceability and the Ledger Consumption Convention.
  - **Mitigation:** Consume `ENG-018` per its authoritative contract; enforce preservation of stored source-currency values at the report boundary.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-013`, `ADR-014`, `ADR-032`, `ADR-051`, `ADR-053`) are Accepted at authoring time.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Reporting event definitions are not yet present in the authoritative Event Catalog.
  - **Impact:** Financial reporting events cannot be formally referenced or published until Event Catalog governance is updated; report families still function, but no event is published for them.
  - **Mitigation:** Execute a dedicated Event Catalog governance pass before implementation or baseline freeze; this Sprint PRD MUST NOT edit `docs/02-architecture/event-catalog.md` (per §11).
  - **Status:** Deferred

- **Risk ID:** R-08
  - **Description:** Reporting read models must remain strict projections of the ledger.
  - **Impact:** Treating a read model as a write-side source of accounting truth would violate the Reporting Read Model Convention.
  - **Mitigation:** Implementation MUST NOT treat any read model as a write-side source of truth; enforce projection-only semantics at the read-model boundary.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** Multi-company reporting in this sprint stops at boundary presentation and does not perform consolidation.
  - **Impact:** Stakeholders expecting consolidation would be surprised.
  - **Mitigation:** Communicate the §1.3 boundary; queue consolidation as future work.
  - **Status:** Accepted

- **Risk ID:** R-10
  - **Description:** Determinism (§5.6) applies against an unchanged ledger; ordinary ledger changes between two invocations legitimately change output.
  - **Impact:** Misinterpreting legitimate change as a determinism violation would cause false defects.
  - **Mitigation:** Scope determinism tests to a fixed ledger snapshot; document expected drift behaviour in test fixtures.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — report projection logic per family (Trial Balance zero-sum, Balance Sheet identity, P&L classification filter, Cash Flow classification filter, General Ledger opening/closing reconciliation), determinism against a fixed ledger snapshot, and Financial Statement Boundary refusal cases.
- **Integration** — reporting pipeline against `ENG-021`, multi-currency presentation via `ENG-018`, authorization via `ENG-002`, audit emission via `ENG-004`, and event publication via `ENG-024` for events registered in the Event Catalog.
- **Contract** — reporting-lifecycle event contracts against the event catalog (for registered events only); Ledger Access Boundary against downstream module system personas attempting to bypass the reporting surface.
- **End-to-end (smoke)** — voucher → journal → ledger → each report family, under a two-tenant / two-company / multi-currency / multi-period smoke fixture to verify `ADR-011` isolation, balance identities, determinism, and provenance traceability.

Sprint-specific fixtures: a two-company fixture with pre-seeded CoA, account classifications (P&L / Balance Sheet / Cash), fiscal year, accounting periods (mixed open/closed to demonstrate reads across period states), and a representative set of posted journal entries covering all report families (produced by `SPR-MOD-002-001` … `SPR-MOD-002-003` foundation seeds).

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider materializing reporting read models as projections keyed by tenant × company × currency × period so determinism (§5.6) is trivially satisfied under an unchanged ledger.
- Consider driving read-model updates from the `ledger.posted` / `ledger.reversed` events produced by `SPR-MOD-002-003`, keyed idempotently, so read models remain strict projections without ever mutating ledger state.
- Consider computing Balance Sheet identity and Trial Balance zero-sum as invariants asserted at the boundary of report generation, so any violation surfaces before the report reaches the caller.
- Consider surfacing the Financial Statement Boundary as an explicit write-side gate on the reporting surface so any caller attempting posting, journal mutation, voucher creation, period reopening, tax calculation, or ledger balance mutation is refused with a deterministic error.
- Consider deferring event emission per report family behind a feature check that reads the authoritative Event Catalog, so events for un-registered names are silently skipped until the catalog registers them (per R-EV-01).

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-002-004`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the repository-standard financial reporting layer as deterministic projections of the ledger (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-002` MODULE_PRD section.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Financial Reporting Ownership Convention (§1.1) with "consumed, not redefined" language; engine identifiers match the authoritative catalog verbatim; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists tax reports, period close, consolidation, budgeting, forecasting, analytics dashboards, BI cubes, regulatory reporting, AI insights, and custom report designer, each linked to its owning sprint or module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes, including balance identities, determinism, traceability, and boundary refusals.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-002-005`) begin immediately after this one completes?**
   Yes. `SPR-MOD-002-005 Taxation & Compliance Foundation` is the immediate successor per [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) §2–§3 and depends on the reporting outputs this sprint produces.
8. **Is the architecture-doc immutability rule preserved?**
   Yes. This sprint MUST NOT modify `docs/02-architecture/event-catalog.md` or any other architecture document. Missing reporting-event definitions are recorded in Risks (R-EV-01) and deferred to a dedicated architecture pass (§11).

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-002-003-journal-ledger-posting.md`](./SPR-MOD-002-003-journal-ledger-posting.md)
- Transitive Upstream Sprint PRDs — [`./SPR-MOD-002-002-voucher-framework.md`](./SPR-MOD-002-002-voucher-framework.md), [`./SPR-MOD-002-001-accounting-foundation.md`](./SPR-MOD-002-001-accounting-foundation.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
