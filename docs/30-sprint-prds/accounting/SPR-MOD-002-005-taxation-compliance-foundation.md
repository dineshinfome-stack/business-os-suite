---
title: "SPR-MOD-002-005 — Taxation & Compliance Foundation"
summary: "Sprint PRD for the Taxation & Compliance Foundation of MOD-002 Accounting: repository-standard tax master data, applicability, determination, classifications, tax reporting semantics, and tax posting preparation, built exclusively on authoritative Accounting master data and ledger movements produced by SPR-MOD-002-001…004. Consumes upstream layers; never redefines voucher, journal, ledger, financial reporting, or period ownership."
layer: "delivery"
owner: "Accounting"
status: "Draft"
updated: "2026-07-07"
sprint_id: "SPR-MOD-002-005"
parent_module: "MOD-002"
parent_sprint_plan: "MOD-002_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "8.3.5"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-011", "ENG-012", "ENG-018", "ENG-021", "ENG-024"]
related_adrs: ["ADR-011", "ADR-013", "ADR-014", "ADR-032", "ADR-051", "ADR-053"]
tags: ["sprint", "prd", "accounting", "mod-002", "taxation", "compliance", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-002-005 — Taxation & Compliance Foundation

> **Stage 2 deliverable.** Fifth authored Sprint PRD for **MOD-002 Accounting** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-002-005` (permanent) |
| Parent Module | `MOD-002` — Accounting |
| Parent Sprint Plan | [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) through [`SPR-MOD-002-004`](./SPR-MOD-002-004-financial-statements.md) (all required) |
| Upstream Baseline | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-002-006` (Period Close & Audit); every module that consumes accounting taxation (MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017, MOD-018) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **repository-standard Taxation & Compliance Foundation** for BusinessOS — authoritative tax master data, tax applicability, tax determination, tax classifications, tax reporting semantics, and tax posting preparation — built **exclusively on authoritative Accounting master data and ledger movements** produced by [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) through [`SPR-MOD-002-004`](./SPR-MOD-002-004-financial-statements.md). Taxation is owned by Accounting; downstream modules consume it and never redefine it.

> **Tax Ownership Convention.** The Accounting module owns tax semantics: master data (Tax Codes, Tax Groups, Tax Rates, Tax Classifications, Tax Jurisdictions, Applicability Rules), tax applicability, tax determination, tax reporting semantics, and tax posting preparation. No downstream module may redefine accounting tax rules. ERP Core Engines provide shared configuration, rules, currency, event, audit, and authorization infrastructure but **MUST NOT** redefine tax business rules.
>
> **Tax Calculation Boundary.** Business modules determine commercial transactions; Accounting determines taxation. Downstream modules **MUST NOT** implement independent tax engines and **MUST** consume Accounting's taxation services for tax determination and tax classification.
>
> **Tax Configuration Authority.** Tax Codes, Tax Groups, Tax Rates (version-aware), Tax Classifications, Tax Jurisdictions, and Applicability Rules are authoritative Accounting master data owned by this sprint. No downstream module may create parallel tax masters.
>
> **Compliance Readiness Convention.** This sprint establishes the repository-standard compliance readiness posture only. Statutory return filing, government integrations, e-invoicing, e-way bill, and country-specific compliance are deferred to a future compliance sprint and are **not** delivered here.
>
> **Tax Reporting Boundary.** Tax reporting consumes authoritative ledger movements (produced by `SPR-MOD-002-003`) and tax classifications defined here; it **MUST NOT** derive taxation directly from vouchers or source documents. The ledger is the single authoritative accounting source, consistent with the Ledger Consumption Convention from `SPR-MOD-002-004`.

These conventions **complement** — and do not replace — the Accounting Ownership Convention from [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md), the Accounting Voucher Ownership Convention from [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md), the Ledger Posting Ownership / Ledger Immutability / Balance Integrity / Accounting Period Authority / Ledger Access Boundary conventions from [`SPR-MOD-002-003`](./SPR-MOD-002-003-journal-ledger-posting.md), and the Financial Reporting Ownership / Ledger Consumption / Report Determinism / Reporting Read Model / Financial Statement Boundary conventions from [`SPR-MOD-002-004`](./SPR-MOD-002-004-financial-statements.md). Tax semantics introduced here **MUST NOT** redefine voucher ownership, journal ownership, ledger ownership, financial reporting ownership, or period ownership established by earlier Accounting Sprint PRDs.

### 1.2 In Scope

- **Tax master configuration** — Tax Codes, Tax Groups, Tax Types (e.g., GST, VAT, Withholding, Reverse Charge, Compound), status lifecycle, effective dating.
- **Tax rates (version-aware)** — Rate values keyed by tax code, jurisdiction, and effective period; historic rates preserved and never mutated retroactively.
- **Tax classifications** — Input tax vs. output tax classification, reverse-charge classification, exemption classification, jurisdiction classification.
- **Tax jurisdictions** — Authoritative jurisdiction configuration (country / state / region) as Accounting master data.
- **Applicability rules** — Deterministic resolution of applicable Tax Codes/Rates given a set of determination inputs (jurisdiction, party classification, item classification, transaction classification, date).
- **Tax determination service (semantic)** — Accounting-owned service that, given business-module determination inputs, returns applicable tax classification and computed tax amounts using version-aware rates and `ENG-018` currency semantics. The service is **consumed** by downstream modules and never bypassed.
- **Reverse-charge readiness** — Classification and applicability wiring; posting behaviour is a preparation input, not journal creation.
- **Tax posting preparation** — **Metadata and posting inputs only.** This sprint produces the tax posting inputs (accounts, classifications, direction, amounts) consumed by the ledger posting pipeline. **Journal creation and ledger posting remain owned by `SPR-MOD-002-003`.**
- **Tax reconciliation readiness** — Data shape and traceability sufficient for downstream tax reconciliation, driven by authoritative ledger movements and tax classifications.
- **Compliance reporting prerequisites** — Tax registers / summaries expressed as deterministic projections of ledger movements + tax classifications (report families themselves are delivered under `ENG-021` Reporting infrastructure consumed here, consistent with `SPR-MOD-002-004`).
- **Tax audit traceability** — Every tax figure references the ledger movements and applicability decision that produced it.
- **Tax configuration versioning** — Effective-dated versions of tax masters; audited configuration change stream via `ENG-004`.
- **Tax reporting parameterization** — Period, jurisdiction, company, and financial-year selection.
- **Cross-module tax consumption contracts** — Read-only tax determination and classification surface consumed by MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017, MOD-018.
- **Taxation events** — See §11 for the illustrative expected event surface and the Event Catalog governance rule.

### 1.3 Out of Scope

Reserved for later Accounting sprints and other modules (see [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) and [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)):

- **Statutory return filing** — GSTR/VAT return submission and equivalents.
- **Government integrations** — e-invoicing portals, e-way bill, IRP, GSP, tax authority APIs.
- **Country-specific statutory compliance** — India GST filing, EU VAT MOSS/OSS, US Sales Tax jurisdictions beyond authoritative jurisdiction configuration.
- **Tax payment workflow** — Tax payment orchestration and remittance.
- **Journal creation and ledger posting for tax** — Owned by `SPR-MOD-002-003`; this sprint prepares posting inputs only.
- **Financial statement generation** — Owned by `SPR-MOD-002-004`.
- **Period close, period lock, tax freeze-at-close** — Owned by `SPR-MOD-002-006`.
- **Payroll taxation** — Delivered by payroll module scope.
- **Budgeting, forecasting, BI cubes, dashboards, AI compliance analysis, custom report designer.**
- **Voucher lifecycle** — Owned by `SPR-MOD-002-002`; this sprint consumes voucher outputs indirectly through the ledger.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-002-005`, the following will exist:

- **Business capabilities.**
  - Tax Codes, Tax Groups, Tax Rates (version-aware), Tax Classifications, Tax Jurisdictions, and Applicability Rules can be configured and maintained per tenant × company.
  - A deterministic Accounting-owned tax determination service returns applicable tax classification and amounts for a given set of determination inputs.
  - Tax reporting prerequisites are available as deterministic projections of authoritative ledger movements + tax classifications.
  - Tax posting preparation produces posting inputs consumed by `SPR-MOD-002-003`'s ledger posting pipeline (this sprint never creates journals or mutates ledger state).
  - Every tax figure is traceable to the ledger movements and applicability decision that produced it.
- **Cross-module contract.**
  - Downstream modules consume Accounting's tax determination and tax classification surface; they MUST NOT implement independent tax engines or create parallel tax masters (per Tax Calculation Boundary and Tax Configuration Authority).
  - Tax paths MUST NOT post, modify journals, create vouchers, reopen periods, mutate ledger balances, or perform statutory submission.
- **Published events.** Taxation-lifecycle events per §11, published only for events that exist in the authoritative Event Catalog at authoring time.
- **Audit artifacts.** An audit record exists for every tax master change and every determination decision that alters posting inputs, produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-002-005`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

> **Traceability Requirement.** Every capability documented in this Sprint PRD MUST trace to one or more sections of [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md). No orphan requirements may be introduced. Consistent with Sprints 001–004.

| MOD-002 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Taxation and compliance foundation | Tax master data, applicability, determination, classifications |
| §4 Business Processes — Tax determination and classification | Deterministic tax determination service |
| §5 Reports — Tax registers and summaries | Tax reporting prerequisites (deterministic projections of ledger + classifications) |
| §7 Business Rules — Taxation consumes authoritative accounting data | Tax Reporting Boundary and Tax Calculation Boundary (§1.1) |
| §8 Multi-Currency — Tax in transaction currency | Version-aware tax rates + `ENG-018` currency consumption |
| §10 Configuration — Tax masters, jurisdictions, applicability | Tax Configuration Authority (§1.1) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here.

---

## 4. User Stories

- **US-001.** *As a tax administrator, I want to configure Tax Codes, Tax Groups, and version-aware Tax Rates per jurisdiction, so that taxation is deterministic and auditable across periods.*
- **US-002.** *As a tax administrator, I want to define Applicability Rules that resolve applicable taxes for a given set of determination inputs, so that downstream modules never invent tax logic.*
- **US-003.** *As a business module (system persona), I want to consume Accounting's tax determination service with my transaction determination inputs, so that I never redefine tax semantics.*
- **US-004.** *As an accountant, I want tax posting inputs produced by taxation to feed the ledger posting pipeline (SPR-MOD-002-003) without journal or ledger mutation happening in the tax layer.*
- **US-005.** *As a controller, I want tax registers and summaries derived exclusively from authoritative ledger movements and tax classifications, so that tax reporting reconciles with the ledger.*
- **US-006.** *As an auditor, I want every tax figure traceable to its ledger movements and applicability decision, so that tax positions can be reconstructed unambiguously.*
- **US-007.** *As a security reviewer, I want every tax master change and every determination decision that alters posting inputs to be authorized via `ENG-002` and audited via `ENG-004`.*
- **US-008.** *As a tax administrator, I want historic tax rates preserved and never mutated retroactively, so that prior-period taxation remains reproducible.*
- **US-009.** *As a compliance officer, I want the repository-standard compliance readiness posture in place, so that statutory submission can be layered on later without redesigning taxation.*
- **US-010.** *As a downstream module (system persona), I want any attempt to create parallel tax masters or bypass Accounting's tax determination to be refused deterministically.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Configurable tax masters (US-001)

- **Given** a valid tax administrator context under a tenant and company,
  **when** Tax Codes, Tax Groups, Tax Rates, Tax Classifications, Tax Jurisdictions, and Applicability Rules are created or updated,
  **then** the change is persisted as version-aware master data with effective dating, and prior versions are preserved unchanged.

### 5.2 Deterministic applicability (US-002, US-003)

- **Given** a set of determination inputs (jurisdiction, party classification, item classification, transaction classification, date),
  **when** the tax determination service is invoked twice against unchanged tax master data,
  **then** both invocations return identical applicable tax classification and computed amounts.

### 5.3 Version-aware rates (US-001, US-008)

- **Given** a tax determination whose effective date falls under a specific rate version,
  **when** the determination is computed,
  **then** it applies the rate version effective on that date; retroactive mutation of historic rates is rejected.

### 5.4 Authoritative jurisdiction (US-001)

- **Given** any tax master or applicability rule,
  **when** it references a jurisdiction,
  **then** the jurisdiction MUST exist in the authoritative Accounting Tax Jurisdiction master; references to non-existent jurisdictions are refused deterministically.

### 5.5 Ledger-based tax reporting (US-005)

- **Given** a tax register or summary request,
  **when** it is generated,
  **then** every figure is derived exclusively from authoritative ledger movements (from `SPR-MOD-002-003`) joined to tax classifications defined here; no figure is reconstructed from vouchers or source documents.

### 5.6 Deterministic tax posting preparation (US-004)

- **Given** a determination that produces tax posting inputs,
  **when** the inputs are handed to the ledger posting pipeline,
  **then** the inputs (accounts, direction, amounts, tax classifications, tax metadata) are complete, deterministic, and independent of caller ordering; the tax layer itself never creates a journal or mutates the ledger.

### 5.7 Audited configuration changes (US-007)

- **Given** any create or update on tax master data or applicability rules,
  **when** the change is committed,
  **then** the change is authorized via `ENG-002` and an audit record is produced via `ENG-004` capturing actor, tenant, company, before/after, and effective date.

### 5.8 Rejection of unauthorized changes (US-007, US-010)

- **Given** an unauthorized attempt to modify tax master data, or a downstream module attempting to create parallel tax masters, or a downstream module attempting to bypass the tax determination service,
  **when** the attempt occurs,
  **then** it is refused deterministically at the Accounting boundary and audited.

### 5.9 Ledger traceability (US-006)

- **Given** any tax figure in any tax register, summary, or posting-preparation output,
  **when** the caller requests its provenance,
  **then** the figure references the ledger movements and applicability decision that produced it, preserving the traceability chain from `SPR-MOD-002-003` and this sprint's determination.

### 5.10 Authoritative-only events (US-005)

- **Given** a taxation event whose name is registered in the authoritative Event Catalog at authoring time (see §11),
  **when** the corresponding lifecycle transition occurs,
  **then** the event is published via `ENG-024` conforming to the catalog's contract.
- **Given** an illustrative taxation event listed in §11 that is **not** present in the Event Catalog,
  **when** the corresponding transition occurs,
  **then** no event is published for that name until the event is introduced in the Event Catalog by a dedicated architecture pass (see Risks R-EV-01).

### 5.11 Boundary preservation

- **Given** any interaction with the taxation surface,
  **when** an attempt is made through this surface to post, modify a journal, create a voucher, reopen a period, alter a ledger balance, or bypass the reporting read-model surface,
  **then** it is refused deterministically. Tax semantics introduced here MUST NOT redefine voucher, journal, ledger, financial reporting, or period ownership established by earlier Accounting Sprint PRDs.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any tax master read, applicability resolution, or determination call,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-002` — Accounting.
- **Module PRD:** [`docs/20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2, §4, §5, §7, §8, §10, §12. See §3.

---

## 7. Dependencies

- **Parent:** `MOD-002` MODULE_PRD.
- **Upstream sprints:** `SPR-MOD-002-001` through `SPR-MOD-002-004` (all required).
  - [`SPR-MOD-002-001`](./SPR-MOD-002-001-accounting-foundation.md) — Chart of Accounts, account classifications, fiscal year, accounting periods, base accounting configuration.
  - [`SPR-MOD-002-002`](./SPR-MOD-002-002-voucher-framework.md) — Voucher outputs consumed transitively via the ledger.
  - [`SPR-MOD-002-003`](./SPR-MOD-002-003-journal-ledger-posting.md) — Authoritative journal entries, ledger movements, ledger balances, Ledger Immutability, Ledger Access Boundary.
  - [`SPR-MOD-002-004`](./SPR-MOD-002-004-financial-statements.md) — Ledger Consumption Convention and Reporting Read Model Convention consumed for tax reporting.
- **Upstream baseline:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen). Individual Platform Sprint PRDs are cited only where sprint-level traceability is specifically required.
- **Downstream sprints:** `SPR-MOD-002-006` (Period Close & Audit — tax positions freeze at close).
- **Downstream modules:** MOD-003, MOD-004, MOD-005, MOD-008, MOD-015, MOD-017, MOD-018 — consume Accounting's tax determination and classification surface.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Tax Ownership Convention in §1.1). Engine identifiers below match the authoritative entries in [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md) and [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md); no new identifiers are introduced here.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Authorizes every tax master change, applicability change, and determination that alters posting inputs. |
| `ENG-004` Audit | Records tax master changes, applicability changes, and determination decisions per authoritative audit contract. |
| `ENG-011` Configuration | Provides authoritative configuration infrastructure consumed by tax masters and applicability rules; not redefined. |
| `ENG-012` Rules | Provides shared rule-evaluation infrastructure consumed by applicability resolution; Accounting tax business semantics remain owned by this sprint. |
| `ENG-018` Currency | Provides currency utilities consumed by version-aware rates and multi-currency tax figures; not redefined. |
| `ENG-021` Reporting | Provides shared reporting infrastructure consumed by tax registers and summaries. |
| `ENG-024` Eventing | Publishes taxation-lifecycle events per §11, subject to the Event Catalog governance rule. |

Engine identifiers listed above are treated as expected. If the authoritative catalog resolves any of them differently at authoring time (rename, split, merge), the catalog wins and this PRD is corrected in a subsequent authoring pass. Accounting taxation business semantics (tax ownership, tax calculation boundary, tax configuration authority, compliance readiness, tax reporting boundary) are owned by this sprint and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every tax master read/write and every determination call. |
| `ADR-013` Persistence & Transactionality | Authoritative persistence contract for tax master data and configuration-change stream. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for tax master and determination auditing. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to taxation surface. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for taxation-lifecycle events. |
| `ADR-053` Multi-Currency Handling | Authoritative multi-currency model consumed by version-aware tax rates and tax amount presentation. |

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Tax Code | MOD-002 (this sprint) | Named tax construct (e.g., GST-Standard, VAT-Reduced) belonging to a tenant × company × jurisdiction. |
| Tax Group | MOD-002 (this sprint) | Logical grouping of Tax Codes for compound taxation and reporting. |
| Tax Rate (versioned) | MOD-002 (this sprint) | Effective-dated rate value bound to a Tax Code and jurisdiction; historic versions preserved. |
| Tax Classification | MOD-002 (this sprint) | Input/output/reverse-charge/exempt classification applied at determination. |
| Tax Jurisdiction | MOD-002 (this sprint) | Authoritative country/state/region reference used by tax masters and applicability. |
| Applicability Rule | MOD-002 (this sprint) | Deterministic mapping from determination inputs to applicable Tax Codes. |
| Tax Determination Decision | MOD-002 (this sprint) | Record of a determination invocation (inputs, applicable Tax Codes, resolved classification, computed amounts, effective date). |
| Tax Posting Input | MOD-002 (this sprint) | Posting-ready metadata (accounts, direction, amounts, tax classification) handed to the `SPR-MOD-002-003` posting pipeline. |
| Tax Configuration Change | MOD-002 (this sprint) | Audit record of a tax master / applicability change (actor, before/after, effective date). |

### 10.2 Relationships

- A **Tax Code** belongs to a tenant × company × jurisdiction and has zero or more effective-dated **Tax Rates**.
- A **Tax Group** aggregates one or more Tax Codes for compound taxation and reporting.
- An **Applicability Rule** maps a determination-input pattern to one or more applicable Tax Codes.
- A **Tax Determination Decision** references the Applicability Rule(s) fired, the Tax Rate versions used, and the resulting Tax Classification(s).
- A **Tax Posting Input** references the Tax Determination Decision and the target ledger accounts (from `SPR-MOD-002-001` CoA); it is consumed by `SPR-MOD-002-003` to produce ledger movements.
- A **Tax Configuration Change** references the affected master entity and captures before/after state.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-002` per the Tax Ownership Convention and Tax Configuration Authority (§1.1). ERP Core Engines do not redefine them.
- Ledger movements and journal entries consumed by tax reporting and referenced by Tax Posting Input outcomes are owned by `SPR-MOD-002-003`.
- Chart of Accounts, account classifications, fiscal year, and accounting periods are owned by `SPR-MOD-002-001`.
- Vouchers referenced transitively through the ledger are owned by `SPR-MOD-002-002`.
- Financial-statement projections consumed for reconciliation are owned by `SPR-MOD-002-004`.

Physical schema (tables, columns, indexes) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`.

**Event Catalog governance (architecture-doc immutability).** Sprint PRD authoring is documentation-only and MUST NOT modify `docs/02-architecture/event-catalog.md`. This Sprint PRD references only event names that exist in the authoritative Event Catalog at authoring time. Introduction of new event definitions requires a separate, explicitly authorized architecture pass — never this pass.

Expected event surface includes (**illustrative, not normative — subject to the authoritative Event Catalog**):

| Event Name (illustrative) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `taxcode.created` | MOD-002 | SPR-MOD-002-005 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant (per `ADR-051`) |
| `taxcode.updated` | MOD-002 | SPR-MOD-002-005 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |
| `taxrate.created` | MOD-002 | SPR-MOD-002-005 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |
| `taxrate.updated` | MOD-002 | SPR-MOD-002-005 | MOD-002 (self), MOD-017 | At-least-once, ordered per tenant |
| `taxclassification.updated` | MOD-002 | SPR-MOD-002-005 | MOD-002 (self), MOD-017, MOD-018 | At-least-once, ordered per tenant |
| `taxconfiguration.changed` | MOD-002 | SPR-MOD-002-005 | MOD-002 (self), MOD-017, MOD-018 | At-least-once, ordered per tenant |

The Event Catalog is the sole authoritative source of event names, envelopes, and delivery guarantees. For any illustrative name above that is not present in the Event Catalog at authoring time, implementation MUST either (a) reference the closest authoritative equivalent or (b) defer emission and record it under Risks R-EV-01. Consumer lists reflect **known** consumers at authoring time and MAY grow.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tax Codes, Tax Groups, version-aware Tax Rates, Tax Classifications, Tax Jurisdictions, and Applicability Rules can be configured per tenant × company.
- [ ] The tax determination service is deterministic against unchanged master data.
- [ ] Version-aware rates apply the rate version effective on the transaction date; retroactive mutation of historic rates is refused.
- [ ] Jurisdiction references are validated against the authoritative Tax Jurisdiction master.
- [ ] Tax registers and summaries derive exclusively from authoritative ledger movements + tax classifications.
- [ ] Tax posting preparation produces posting inputs only; no journal or ledger mutation occurs in the tax layer.
- [ ] Every tax master change and every determination that alters posting inputs is authorized via `ENG-002` and audited via `ENG-004`.
- [ ] Every tax figure is traceable to its ledger movements and applicability decision.
- [ ] Downstream attempts to create parallel tax masters or bypass tax determination are refused deterministically.
- [ ] Tax semantics introduced here do NOT redefine voucher, journal, ledger, financial reporting, or period ownership from Sprints 001–004.
- [ ] Taxation events registered in the Event Catalog are emitted per §11; deferred events are recorded as such in Risks/Assumptions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every taxation read/write.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-002_SPRINT_PLAN.md` §2 (`SPR-MOD-002-005`):

- Tax Codes, Tax Groups, version-aware Tax Rates, Tax Classifications, Tax Jurisdictions, and Applicability Rules are authoritative Accounting master data per tenant × company.
- The Accounting-owned tax determination service is deterministic against unchanged master data and consumed by downstream modules.
- Tax reporting derives exclusively from authoritative ledger movements and tax classifications; no reconstruction from source documents.
- Tax posting preparation produces posting inputs only; journal creation and ledger posting remain owned by `SPR-MOD-002-003`.
- Every tax master change and determination decision altering posting inputs is authorized via `ENG-002` and audited via `ENG-004`; taxation events registered in the Event Catalog are emitted via `ENG-024`.
- No taxation path performs posting, journal mutation, voucher creation, period reopening, or ledger balance mutation.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable). Repository-wide ratification of this vocabulary is queued for a future governance pass and is not performed here.

- **Risk ID:** R-01
  - **Description:** This sprint depends on `SPR-MOD-002-001` through `SPR-MOD-002-004` all being `Done`, with CoA, account classifications, fiscal year/periods, ledger movements, ledger balances, and financial reporting projections available.
  - **Impact:** Any regression in upstream ownership boundaries (voucher / journal / ledger / financial reporting / period) blocks this sprint.
  - **Mitigation:** Gate this sprint on Sprints 001–004; treat regressions as upstream defects.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** This sprint depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, users/roles/permissions, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen baseline contract; treat regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Statutory return filing, government integrations, e-invoicing, e-way bill, and country-specific compliance are deferred to a future compliance sprint.
  - **Impact:** Silent absorption of statutory scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to future compliance work.
  - **Status:** Accepted

- **Risk ID:** R-04
  - **Description:** Downstream modules may attempt to implement independent tax engines or parallel tax masters.
  - **Impact:** Violates the Tax Calculation Boundary and Tax Configuration Authority; fragments taxation semantics.
  - **Mitigation:** Enforce Accounting-owned tax determination surface; refuse parallel tax master creation deterministically; audit refusals.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** `ENG-011` Configuration and `ENG-012` Rules are consumed as shared infrastructure and must accept the tax master and applicability shapes defined here without redefining tax semantics.
  - **Impact:** A weaker configuration or rules contract would compromise determinism or ownership.
  - **Mitigation:** Consume `ENG-011` and `ENG-012` per their authoritative contracts; escalate weakening as engine defects.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** `ENG-018` Currency is consumed for multi-currency tax figures and must not silently rewrite stored source-currency values.
  - **Impact:** Silent rewrites would break audit traceability and the Tax Reporting Boundary.
  - **Mitigation:** Consume `ENG-018` per its authoritative contract; enforce preservation of stored source-currency values.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-013`, `ADR-014`, `ADR-032`, `ADR-051`, `ADR-053`) are Accepted at authoring time.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Taxation event definitions listed illustratively in §11 may not all be present in the authoritative Event Catalog.
  - **Impact:** Any illustrative event not yet in the catalog cannot be formally referenced or published; taxation still functions, but no event is published for that name.
  - **Mitigation:** Execute a dedicated Event Catalog governance pass before implementation or baseline freeze; this Sprint PRD MUST NOT edit `docs/02-architecture/event-catalog.md` (per §11); either reference the closest authoritative equivalent or defer.
  - **Status:** Deferred

- **Risk ID:** R-08
  - **Description:** Historic tax rate versions must remain immutable; retroactive mutation would silently change prior-period taxation.
  - **Impact:** Prior-period tax figures would no longer be reproducible.
  - **Mitigation:** Enforce version immutability at the tax master boundary; refuse retroactive rate mutation deterministically and audit refusals.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** Determination-time input classifications (party, item, transaction) are provided by business modules and may drift.
  - **Impact:** Drifted inputs would produce inconsistent determinations across modules.
  - **Mitigation:** Publish stable determination-input contracts; version them under `ENG-011` Configuration; reject unknown inputs.
  - **Status:** Open

- **Risk ID:** R-10
  - **Description:** Compliance Readiness Convention establishes readiness only; statutory submission is not delivered here.
  - **Impact:** Stakeholders expecting statutory filing in this sprint would be surprised.
  - **Mitigation:** Communicate §1.3 boundary; queue statutory submission as future work.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — applicability rule resolution, version-aware rate selection, jurisdiction validation, determination determinism against fixed master data, tax posting input completeness, boundary refusal (no journal/ledger mutation in tax layer).
- **Integration** — tax masters via `ENG-011`, applicability via `ENG-012`, multi-currency amounts via `ENG-018`, authorization via `ENG-002`, audit emission via `ENG-004`, event publication via `ENG-024` for events registered in the Event Catalog, tax posting inputs consumed by the `SPR-MOD-002-003` posting pipeline (contract test only; posting is not redefined here).
- **Contract** — cross-module tax consumption contract (business modules calling the tax determination service, refusal of parallel tax master creation); event contracts for registered events.
- **End-to-end (smoke)** — business-module determination inputs → Accounting tax determination → posting inputs → ledger posting (owned by Sprint 003) → ledger movements → tax register (deterministic projection). Two-tenant / two-company / multi-currency / multi-jurisdiction / multi-period smoke fixture to verify `ADR-011` isolation, version-aware rates, traceability, and ownership boundaries.

Sprint-specific fixtures: two-jurisdiction tax master set (e.g., GST-like and VAT-like) with version-aware rates spanning at least two periods; applicability rules exercising input/output/reverse-charge/exempt classifications; determination-input samples from representative business-module personas.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling tax masters as effective-dated aggregates so version-aware rate selection is a boundary-time lookup rather than an application-time computation.
- Consider expressing Applicability Rules on top of `ENG-012` Rules as declarative bindings from determination-input patterns to Tax Codes, keeping the rule-evaluation engine untouched.
- Consider surfacing the Tax Calculation Boundary as an explicit consumption-only interface for downstream modules so any attempt at parallel tax logic is refused deterministically.
- Consider surfacing the Tax Configuration Authority as an explicit write-side gate refusing parallel tax master creation from any non-Accounting caller.
- Consider deferring event emission per illustrative event name behind a feature check that reads the authoritative Event Catalog, so events for un-registered names are silently skipped until the catalog registers them (per R-EV-01).
- Consider driving tax reporting read models from the `ledger.posted` / `ledger.reversed` events produced by `SPR-MOD-002-003`, keyed idempotently, so tax reports remain strict projections without ever mutating ledger state (consistent with the Reporting Read Model Convention from `SPR-MOD-002-004`).

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-002-005`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the repository-standard Taxation & Compliance Foundation as authoritative Accounting master data, applicability, determination, classifications, tax reporting semantics, and tax posting preparation (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every capability is tied to a `MOD-002` MODULE_PRD section. No orphan requirements are introduced.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Tax Ownership Convention (§1.1) with "consumed, not redefined" language; engine identifiers match the authoritative catalog verbatim; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists statutory filing, government integrations, country-specific compliance, tax payment workflow, journal creation/posting, financial statements, period close, payroll taxation, budgeting, forecasting, BI, AI compliance, and custom report designer, each linked to its owning sprint or module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes, including determinism, version-aware rates, jurisdiction validation, ledger-based reporting, boundary refusals, and ownership-boundary preservation.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) each have a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-002-006`) begin immediately after this one completes?**
   Yes. `SPR-MOD-002-006 Period Close & Audit` is the immediate successor per [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) §2–§3 and depends on the taxation outputs this sprint produces.
8. **Is the architecture-doc immutability rule preserved?**
   Yes. This sprint MUST NOT modify `docs/02-architecture/event-catalog.md` or any other architecture document. Illustrative taxation events not yet in the catalog are recorded in Risks (R-EV-01) and deferred to a dedicated architecture pass (§11).

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-002-001-accounting-foundation.md`](./SPR-MOD-002-001-accounting-foundation.md), [`./SPR-MOD-002-002-voucher-framework.md`](./SPR-MOD-002-002-voucher-framework.md), [`./SPR-MOD-002-003-journal-ledger-posting.md`](./SPR-MOD-002-003-journal-ledger-posting.md), [`./SPR-MOD-002-004-financial-statements.md`](./SPR-MOD-002-004-financial-statements.md)
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
