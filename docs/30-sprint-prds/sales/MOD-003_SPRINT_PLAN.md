---
title: "MOD-003 Sales — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-003 Sales. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Revenue"
status: "Planning"
updated: "2026-07-07"
module_id: "MOD-003"
module_name: "Sales"
sprint_prefix: "SPR-MOD-003-"
stage: "1"
pass: "8.4.0"
parent_module_prd: "docs/20-module-prds/sales/MODULE_PRD.md"
workflow_stage: "Stage 1"
tags: ["sprint", "planning", "sales", "mod-003", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-003 Sales — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-003 Sales** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## 1. Purpose & Scope

Plan the implementation of MOD-003 Sales by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD and is **not** registered in `SPRINT_CATALOG.md`.

This plan introduces no new business requirements beyond the approved [MOD-003 Sales Module PRD](../../20-module-prds/sales/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Traceability:**

- Parent Module README — [`../../20-module-prds/sales/README.md`](../../20-module-prds/sales/README.md)
- Parent Module PRD — [`../../20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md)
- Upstream module baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-003 in `SPRINT_ROADMAP.md` is **6**. This plan aligns with that estimate.

## 2. Proposed Sprint Sequence

### SPR-MOD-003-001 — Sales Foundation

- **Objective.** Establish Sales foundations under a tenant/company: customer master, customer hierarchy, sales organization, sales territories, salespersons, sales configuration, and sales numbering foundations.
- **Boundaries.**
  - In: customer master data and lifecycle, customer hierarchy and classification, sales organization, sales territories, salespersons, sales configuration, numbering series registration, document settings.
  - Out: quotations, sales orders, delivery workflow, invoicing, returns, analytics, credit-control enforcement, pricing rules.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Sales submodules), §3 Personas (Sales Executive, Sales Manager, Order Desk), §5 Master Data (Customer, Sales Territory, Salesperson), §10 Configuration (Default price list, Approval thresholds, Numbering series, Return window, Credit-limit policy).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-017` Numbering, `ENG-018` Currency.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (Sales sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` for tenancy, organization structure, users/roles/permissions, configuration hierarchy, and localization.
- **Sprint Exit Criteria.**
  - Customer, customer hierarchy, sales territory, and salesperson master data can be created, edited, and archived under a tenant/company.
  - Sales organization and sales configuration resolve deterministically through `ENG-005`.
  - Numbering series for sales documents are registered and resolve via `ENG-017`.
  - All structural changes are audited via `ENG-004`.

### SPR-MOD-003-002 — Quotations & Sales Orders

- **Objective.** Deliver the commercial document lifecycle for quotations and sales orders: creation, pricing, approval, amendment, and customer commitment.
- **Boundaries.**
  - In: quotation lifecycle, sales order lifecycle, order approval, order amendments, pricing and discount application, customer commitment.
  - Out: delivery dispatch, inventory reservation, shipment readiness, invoicing, returns, credit-note issuance, accounting voucher creation.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Quotation and pricing, Sales order capture and fulfilment), §4 Business Processes (Quote-to-order), §6 Transactions (Quotation, Sales Order), §7 Business Rules (Credit limit breach requires explicit approval).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-003-001`.
- **Sprint Exit Criteria.**
  - Quotations and sales orders can be created, amended, approved, and cancelled through the business lifecycle.
  - Credit-limit breaches route through `ENG-011` for explicit approval.
  - Pricing, discounts, and schemes resolve via `ENG-005` configuration and `ENG-012` rules.
  - `SalesOrderConfirmed` event is published via `ENG-024`.

### SPR-MOD-003-003 — Delivery & Fulfillment

- **Objective.** Deliver the delivery and fulfillment workflow: delivery orders, pick/pack, shipment readiness, and fulfillment lifecycle up to the point of invoicing.
- **Boundaries.**
  - In: delivery orders, shipment readiness, pick/pack workflow, fulfillment lifecycle, inventory reservation consumption contracts.
  - Out: sales invoicing, accounting voucher creation, return processing, warehouse bin-level operations, logistics provider integrations.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Delivery / dispatch), §4 Business Processes (Order-to-delivery), §6 Transactions (Delivery Note), §8 Integration Points (InventoryReserved — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-003-002`.
- **Sprint Exit Criteria.**
  - Delivery orders can be created, picked, packed, and dispatched through the fulfillment lifecycle.
  - Inventory reservation contracts are consumed from MOD-005 Inventory without redefining inventory ownership.
  - `DeliveryDispatched` event is published via `ENG-024`.

### SPR-MOD-003-004 — Sales Invoicing

- **Objective.** Deliver the sales invoicing surface: sales invoice, credit notes, debit notes, invoice lifecycle, and the accounting handoff.
- **Boundaries.**
  - In: sales invoice lifecycle, credit notes, debit notes, tax determination, receivable creation, invoice export.
  - Out: payment collection (payment gateway integration), ledger posting logic, journal creation, accounting period close, financial reporting.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Sales invoicing), §4 Business Processes (Delivery-to-invoice), §6 Transactions (Sales Invoice, Credit Note), §7 Business Rules (A sales invoice cannot be issued for a cancelled order), §8 Integration Points (PaymentReceived — consumed), §9 Reports & Analytics (Sales Register).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-011` Approval, `ENG-015` Voucher, `ENG-017` Numbering, `ENG-018` Currency, `ENG-019` Tax, `ENG-021` Reporting, `ENG-024` Event, `ENG-025` Notification, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-003-003`.
- **Sprint Exit Criteria.**
  - Sales invoices, credit notes, and debit notes can be created, approved, and cancelled through the business lifecycle.
  - Tax determination resolves via `ENG-019`.
  - Receivable creation contracts are produced for downstream consumption.
  - `SalesInvoiceIssued` and `CreditNoteIssued` events are published via `ENG-024`.
- **Accounting Voucher Creation Contract.** Sales produces commercial documents (Sales Invoice, Credit Note, Debit Note) and requests accounting voucher creation by consuming `MOD002_ACCOUNTING_BASELINE_v1`. Sales MUST NOT create accounting journals, ledger entries, or independently manage accounting voucher lifecycles. Accounting remains the authoritative owner of accounting vouchers, journal posting, ledger posting, taxation, financial reporting, and accounting period governance.

### SPR-MOD-003-005 — Returns & Customer Adjustments

- **Objective.** Deliver sales returns and customer adjustments: return lifecycle, return approvals, replacement/refund preparation, and return accounting contracts.
- **Boundaries.**
  - In: sales returns, return approvals, return lifecycle, customer adjustments, replacement/refund preparation, return accounting contracts.
  - Out: inventory putaway, refund payment execution, logistics reverse logistics integrations, credit-note issuance (handled in SPR-004).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Sales returns and credit notes), §4 Business Processes (Return and credit note), §6 Transactions (Credit Note), §7 Business Rules (Returns must reference an original invoice line).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-003-002`, `SPR-MOD-003-004` (returns reference original invoice lines; credit notes consume the invoice contract).
- **Sprint Exit Criteria.**
  - Sales returns can be created, approved, and linked to original invoice lines.
  - Customer adjustments are auditable and traceable to the original transaction.
  - Return accounting contracts are produced for `MOD002_ACCOUNTING_BASELINE_v1` consumption.

### SPR-MOD-003-006 — Sales Analytics & Controls

- **Objective.** Deliver the sales analytics and controls surface: dashboards, pipeline reporting, KPIs, approval analytics, margin analysis, and operational controls.
- **Boundaries.**
  - In: sales dashboards, pipeline reports, sales KPIs, approval analytics, margin analysis, operational controls, audit readiness.
  - Out: cross-module KPI definitions (owned by MOD-017 Analytics), AI-driven forecasting, predictive analytics.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §9 Reports & Analytics (Sales Register, Order Book, Sales by Customer / Product / Territory, Discount Impact, Return Analysis), §11 Non-functional (Audit readiness).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-020` Search, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-025` Notification, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-003-001` … `SPR-MOD-003-005` (consumes data and events produced by all prior sprints).
- **Sprint Exit Criteria.**
  - Sales dashboards and pipeline reports render from data produced by prior sprints.
  - Sales KPIs and approval analytics are available for operational review.
  - Audit readiness surface exposes every Sales event emitted during the sprint sequence.

### Planning Flexibility

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-003-001 (Sales Foundation)
         │
         ▼
SPR-MOD-003-002 (Quotations & Sales Orders)
         │
         ▼
SPR-MOD-003-003 (Delivery & Fulfillment)
         │
         ▼
SPR-MOD-003-004 (Sales Invoicing)
         │
         ▼
SPR-MOD-003-005 (Returns & Customer Adjustments)
         │
         ▼
SPR-MOD-003-006 (Sales Analytics & Controls)
```

The sequence is strictly linear: each sprint depends on the immediately preceding one, and the final sprint consumes output from all five predecessors. This preserves the baseline-first dependency model established by MOD-001 and MOD-002.

## 4. Engine Consumption Map

Derived from Sales Module PRD §12 (Required: `ENG-001..006`, `007`, `008`, `010`, `011`, `015`, `017`, `018`, `019`, `021`, `024`, `025`; Optional: `ENG-012`, `013`, `016`, `020`, `022`, `023`, `026`, `027`, `028`). No engine behavior is redefined.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-008 | ENG-010 | ENG-011 | ENG-012 | ENG-015 | ENG-017 | ENG-018 | ENG-019 | ENG-020 | ENG-021 | ENG-022 | ENG-024 | ENG-025 | ENG-027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-003-001 | ● | ● | ● | ● | ● | ● |   |   |   |   |   |   | ● | ● |   |   |   |   |   |   |   |
| SPR-MOD-003-002 |   | ● |   | ● | ● |   | ● | ● | ● | ● | ● |   | ● | ● |   |   |   |   | ● | ● |   |
| SPR-MOD-003-003 |   | ● |   | ● |   |   | ● |   | ● | ● | ● |   | ● | ● |   |   |   |   | ● | ● |   |
| SPR-MOD-003-004 |   | ● |   | ● |   |   | ● |   |   | ● |   | ● | ● | ● | ● |   | ● |   | ● | ● | ● |
| SPR-MOD-003-005 |   | ● |   | ● |   |   | ● |   | ● | ● | ● |   | ● | ● |   |   |   |   | ● | ● |   |
| SPR-MOD-003-006 |   | ● |   | ● |   |   |   |   |   |   |   |   |   |   |   | ● | ● | ● | ● | ● | ● |

Optional engines (`ENG-013`, `ENG-016`, `ENG-023`, `ENG-026`, `ENG-028`) MAY be consumed during Stage 2 authoring per the Module PRD; they are not tabulated as required consumption.

## 5. ADR Consumption Map

Accepted ADRs only, per Sales Module PRD (`ADR-011`, `ADR-014`, `ADR-032`) plus supporting Accepted ADRs referenced by the engines consumed above.

| Sprint | ADR-011 | ADR-014 | ADR-032 |
| --- | :-: | :-: | :-: |
| SPR-MOD-003-001 | ● | ● | ● |
| SPR-MOD-003-002 | ● | ● | ● |
| SPR-MOD-003-003 | ● | ● | ● |
| SPR-MOD-003-004 | ● | ● | ● |
| SPR-MOD-003-005 | ● | ● | ● |
| SPR-MOD-003-006 | ● | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 6. Cross-Sprint Dependency Matrix

> **Accounting Dependency.** All accounting behavior required by MOD-003 is consumed through `MOD002_ACCOUNTING_BASELINE_v1`. Sales owns commercial document lifecycle; Accounting owns accounting lifecycle. Ownership boundaries established by the Accounting baseline SHALL NOT be redefined in Sales Sprint PRDs.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Customer Master | SPR-MOD-003-001 | 002, 003, 004, 005, 006 | Foundational; every later sprint assumes customer and sales organization data. |
| Customer Credit Limits | SPR-MOD-003-001 (policy) | 002, 005 | Enforced during order capture and return processing. |
| Sales Configuration | SPR-MOD-003-001 | 002, 003, 004, 005, 006 | Numbering series, approval thresholds, return window, credit-limit policy. |
| Numbering Series | SPR-MOD-003-001 (registration) | 002, 003, 004, 005 | Document numbers resolved via `ENG-017`. |
| Approval Rules | SPR-MOD-003-001 (thresholds) | 002, 003, 004, 005 | Multi-step approvals routed via `ENG-011`. |
| Sales Documents (Quotation, Order, Delivery, Invoice) | 002, 003, 004 | 005, 006 | Returns and analytics consume earlier document lifecycle. |
| Voucher Creation Contracts | SPR-MOD-003-004 | 005, 006 | Accounting voucher requests produced by invoicing; returns reference them. |
| Inventory Reservation Contracts | SPR-MOD-003-003 | 004 | Invoicing assumes delivery has consumed inventory reservations. |
| Tax Determination Contracts | SPR-MOD-003-004 | 005, 006 | Tax resolution via `ENG-019`; downstream analytics may reference tax lines. |
| Receivable Creation Contracts | SPR-MOD-003-004 | 006 | Analytics reports on receivables created at invoice time. |
| Sales Reporting | SPR-MOD-003-001 (master data) | 006 | Final sprint produces dashboards and reports from all prior data. |
| `SalesOrderConfirmed` event | SPR-MOD-003-002 | 003, 006 | Triggers downstream fulfillment and analytics. |
| `DeliveryDispatched` event | SPR-MOD-003-003 | 004, 006 | Triggers invoicing and analytics. |
| `SalesInvoiceIssued` event | SPR-MOD-003-004 | 005, 006 | Triggers returns and analytics. |
| `CreditNoteIssued` event | SPR-MOD-003-004 | 005, 006 | Triggers return processing and analytics. |

## 7. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-003 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen and available. Any regression against that baseline blocks Stage 2 authoring of MOD-003 sprints until the platform baseline is amended via a new versioned baseline.
- **R2 — Accounting baseline dependency.** MOD-003 assumes `MOD002_ACCOUNTING_BASELINE_v1` is frozen. Sales invoicing and returns consume the Accounting baseline for voucher creation and accounting period governance; Sales MUST NOT redefine accounting ownership.
- **R3 — Optional-engine scope creep.** Optional engines (`ENG-013`, `ENG-016`, `ENG-020`, `ENG-022`, `ENG-023`, `ENG-026`, `ENG-027`, `ENG-028`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R4 — Inventory and CRM dependencies.** Shared master data (Customer, Item) and inventory reservation contracts are consumed from MOD-005 Inventory and MOD-006 CRM as those modules become available. Until those modules are baselined, Sales Sprint PRDs MAY declare outbound contract expectations while treating the concrete implementation as a downstream dependency.
- **R5 — E-invoice and payment gateways.** External gateway integrations (§8) are contract-shape-only in this plan; concrete gateway integrations are scheduled as later Sprint PRDs or a separate module, not folded into MOD-003.
- **R6 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md` §3, no horizontal-only sprints are required for MOD-003 beyond the sequence above; all sprints are vertical slices.

## 8. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-003 is baseline-ready when all of the following are objectively true:

1. Every reserved Sales Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD003_SALES_BASELINE_v1` is authored under `docs/40-module-baselines/` per the repository-standard Stage 3 location.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD; no Sales capability sits outside the baseline.
5. All engines and ADRs listed in §4 and §5 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass (`Pass 8.4.Z`).

## 9. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md`.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 10. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
