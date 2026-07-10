---
title: "MOD-004 Purchase — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-004 Purchase. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Procurement"
status: "Approved"
updated: "2026-07-10"
module_id: "MOD-004"
module_name: "Purchase"
sprint_prefix: "SPR-MOD-004-"
stage: "1"
pass: "8.6.0"
parent_module_prd: "docs/20-module-prds/purchase/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
tags: ["sprint", "planning", "purchase", "mod-004", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-004 Purchase — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-004 Purchase** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## 1. Purpose & Scope

Plan the implementation of MOD-004 Purchase by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD and is **not** registered in `SPRINT_CATALOG.md`.

This plan introduces no new business requirements beyond the approved [MOD-004 Purchase Module PRD](../../20-module-prds/purchase/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Traceability:**

- Parent Module README — [`../../20-module-prds/purchase/README.md`](../../20-module-prds/purchase/README.md)
- Parent Module PRD — [`../../20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)
- Upstream module baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen), [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-004 in `SPRINT_ROADMAP.md` will be reconciled to **6** by this plan (superseding the earlier planning estimate of 5). This plan is authoritative for MOD-004 Stage 1 sprint decomposition.

## 2. Proposed Sprint Sequence

### SPR-MOD-004-001 — Purchase Foundation

- **Objective.** Establish Purchase foundations under a tenant/company: supplier master, supplier categorisation, buyer master, purchasing organization, terms & conditions master, purchase price list master, purchasing configuration, and purchasing numbering foundations.
- **Boundaries.**
  - In: supplier master data and lifecycle, supplier categorisation, buyer master, terms & conditions master, purchase price list master, purchasing organization, purchasing configuration, numbering series registration, document settings.
  - Out: requisitions, RFQs, purchase orders, goods receipt, supplier invoicing, returns, analytics, 3-way match enforcement, posting behavior.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Purchase submodules — foundation surface), §3 Personas (Buyer, Procurement Manager, Stores Officer), §5 Master Data (Supplier, Purchase Price List, Terms & Conditions, Buyer), §10 Configuration (Approval thresholds, Preferred supplier defaults, Numbering series, Tolerance settings for match).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (Purchase sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` for tenancy, organization structure, users/roles/permissions, configuration hierarchy, and localization.
- **Sprint Exit Criteria.**
  - Supplier, buyer, terms & conditions, and purchase price list master data can be created, edited, and archived under a tenant/company.
  - Purchasing organization and purchasing configuration resolve deterministically through `ENG-005`.
  - Numbering series for purchasing documents are registered and resolve via `ENG-017`.
  - All structural changes are audited via `ENG-004`.

### SPR-MOD-004-002 — Requisitions, RFQs & Purchase Orders

- **Objective.** Deliver the commercial document lifecycle for purchase requisitions, requests for quotation, supplier comparison, and purchase orders: creation, approval, supplier comparison, amendment, and buyer commitment.
- **Boundaries.**
  - In: purchase requisition lifecycle, requisition approval, RFQ lifecycle, supplier comparison, purchase order lifecycle, purchase order approval, purchase order amendments, pricing and discount application, buyer commitment.
  - Out: goods receipt, inspection, supplier invoicing, 3-way match, returns, debit-note issuance, accounting voucher creation, ledger posting.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Purchase requisition and approval, Request for quotation and supplier comparison, Purchase orders and amendments), §4 Business Processes (Requisition-to-PO), §6 Transactions (Purchase Requisition, RFQ, Purchase Order), §8 Integration Points (`RequisitionApproved`, `PurchaseOrderIssued` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-004-001`.
- **Sprint Exit Criteria.**
  - Requisitions, RFQs, and purchase orders can be created, amended, approved, and cancelled through the business lifecycle.
  - Approval thresholds resolve via `ENG-005` configuration and route through `ENG-011`.
  - Blocked-supplier rule (Module PRD §7) is enforced via `ENG-012`.
  - `RequisitionApproved` and `PurchaseOrderIssued` events are published via `ENG-024`.

### SPR-MOD-004-003 — Goods Receipt & Inspection

- **Objective.** Deliver the goods-receipt workflow: partial and complete receipt against open purchase orders, inspection hold, and warehouse handover contracts.
- **Boundaries.**
  - In: goods receipt lifecycle (partial and complete), inspection hold, tolerance validation against open PO quantity, warehouse handover contracts, attachments, notifications.
  - Out: inventory putaway (owned by MOD-005 Inventory), supplier invoicing, 3-way match invoice-side arithmetic, accounting voucher creation, returns.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Goods receipt and inspection), §4 Business Processes (PO-to-GRN), §6 Transactions (Goods Receipt Note), §7 Business Rules (GRN quantity cannot exceed open PO quantity plus configured tolerance), §8 Integration Points (`GoodsReceived` — published; `InventoryLowStock` — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-004-002`.
- **Sprint Exit Criteria.**
  - Goods receipt notes can be created against open POs and driven through the inspection lifecycle.
  - Tolerance validation is enforced via `ENG-012` per Module PRD §7.
  - Warehouse handover contracts are produced for consumption by MOD-005 Inventory without redefining inventory ownership.
  - `GoodsReceived` event is published via `ENG-024`.

### SPR-MOD-004-004 — Vendor Billing & 3-Way Match

- **Objective.** Deliver the supplier invoicing surface: purchase invoice lifecycle, 3-way match against PO and GRN, tolerance enforcement, and the accounting handoff.
- **Boundaries.**
  - In: purchase invoice lifecycle, 3-way match arithmetic against PO and GRN, tolerance validation and override, tax determination inputs, payables creation contracts, invoice export.
  - Out: accounting voucher creation, journal creation, ledger posting logic, accounts-payable module logic, payment execution (`PaymentSent` is consumed, not produced), returns, debit-note issuance.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Supplier invoices and 3-way match), §4 Business Processes (GRN-to-invoice, 3-way match), §6 Transactions (Purchase Invoice), §7 Business Rules (Invoice cannot exceed matched GRN plus configured tolerance without override), §8 Integration Points (`PurchaseInvoiceReceived` — published; `PaymentSent` — consumed), §9 Reports & Analytics (Purchase Register, 3-Way Match Exceptions).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-011` Approval, `ENG-012` Rules, `ENG-015` Voucher, `ENG-017` Numbering, `ENG-018` Currency, `ENG-019` Tax, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-004-003`.
- **Sprint Exit Criteria.**
  - Purchase invoices can be created, matched (3-way), approved, and cancelled through the business lifecycle.
  - Tolerance validation is enforced via `ENG-012` per Module PRD §7.
  - Tax determination resolves via `ENG-019`.
  - Payables creation contracts are produced for downstream consumption.
  - `PurchaseInvoiceReceived` event is published via `ENG-024`.
- **Accounting Voucher Creation Contract.** Purchase produces commercial documents (Purchase Invoice) and requests accounting voucher creation by consuming `MOD002_ACCOUNTING_BASELINE_v1`. Purchase MUST NOT create accounting journals, ledger entries, payables ledger balances, tax postings, payment records, or independently manage accounting voucher lifecycles. Accounting remains the authoritative owner of accounting vouchers, journal posting, ledger posting, taxation, financial reporting, and accounting period governance.

### SPR-MOD-004-005 — Purchase Returns & Debit Notes

- **Objective.** Deliver purchase returns and debit-note issuance: return lifecycle, return approvals, replacement preparation, and return accounting contracts.
- **Boundaries.**
  - In: purchase returns, return approvals, return lifecycle, replacement preparation, debit-note issuance, return accounting contracts.
  - Out: inventory putaway reversal, refund payment execution, ledger posting, accounts-payable adjustments.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Purchase returns), §4 Business Processes (Return-to-debit-note), §6 Transactions (Debit Note), §8 Integration Points (`DebitNoteIssued` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-018` Currency, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-004-003`, `SPR-MOD-004-004` (returns reference original GRN and invoice lines; debit notes consume the invoice contract).
- **Sprint Exit Criteria.**
  - Purchase returns can be created, approved, and linked to original GRN and invoice lines.
  - Debit notes are issued through the business lifecycle and are auditable and traceable to the original transaction.
  - Return accounting contracts are produced for `MOD002_ACCOUNTING_BASELINE_v1` consumption.
  - `DebitNoteIssued` event is published via `ENG-024`.

### SPR-MOD-004-006 — Purchase Analytics & Controls

- **Objective.** Deliver the purchase analytics and controls surface: purchase reporting, spend and ageing analytics, supplier and buyer performance, price variance, 3-way match exception review, KPIs, and operational controls.
- **Boundaries.**
  - In: purchase reports, spend analytics, PO ageing, supplier performance, price variance, 3-way match exception surface, purchasing KPIs, operational controls, audit readiness, exports.
  - Out: cross-module KPI definitions (owned by MOD-017 Analytics), AI-driven supplier scoring, predictive analytics, transactional functionality of earlier sprints.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §9 Reports & Analytics (Purchase Register, PO Ageing, Supplier Performance, Price Variance, 3-Way Match Exceptions), §11 Non-functional (Audit readiness).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-020` Search, `ENG-021` Reporting, `ENG-024` Event, `ENG-025` Notification, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-004-001` … `SPR-MOD-004-005` (consumes data and events produced by all prior sprints).
- **Sprint Exit Criteria.**
  - Purchase reports and dashboards render from data produced by prior sprints.
  - Purchasing KPIs and 3-way match exception reviews are available for operational review.
  - Audit readiness surface exposes every Purchase event emitted during the sprint sequence.

### Planning Flexibility

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-004-001 (Purchase Foundation)
         │
         ▼
SPR-MOD-004-002 (Requisitions, RFQs & Purchase Orders)
         │
         ▼
SPR-MOD-004-003 (Goods Receipt & Inspection)
         │
         ▼
SPR-MOD-004-004 (Vendor Billing & 3-Way Match)
         │
         ▼
SPR-MOD-004-005 (Purchase Returns & Debit Notes)
         │
         ▼
SPR-MOD-004-006 (Purchase Analytics & Controls)
```

The sequence is strictly linear: each sprint depends on the immediately preceding one, and the final sprint consumes output from all five predecessors. This preserves the baseline-first dependency model established by MOD-001, MOD-002, and MOD-003.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-004 Purchase Module PRD](../../20-module-prds/purchase/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint. Shared consumption of upstream sprint outputs by later sprints is permitted, but originating ownership is unique. This forward mapping (PRD → Sprint) and reverse mapping (Sprint → PRD) together satisfy the repository bidirectional-traceability rule.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| Module PRD Capability (§2) | Originating Sprint |
| --- | --- |
| Purchase requisition and approval | SPR-MOD-004-002 |
| Request for quotation and supplier comparison | SPR-MOD-004-002 |
| Purchase orders and amendments | SPR-MOD-004-002 |
| Goods receipt and inspection | SPR-MOD-004-003 |
| Supplier invoices and 3-way match | SPR-MOD-004-004 |
| Purchase returns | SPR-MOD-004-005 |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Requisitions | SPR-MOD-004-002 |
| RFQs | SPR-MOD-004-002 |
| Purchase Orders | SPR-MOD-004-002 |
| GRN | SPR-MOD-004-003 |
| Invoices | SPR-MOD-004-004 |
| Returns | SPR-MOD-004-005 |

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Supplier | Master Data (§5) | SPR-MOD-004-001 |
| Purchase Price List | Master Data (§5) | SPR-MOD-004-001 |
| Terms & Conditions | Master Data (§5) | SPR-MOD-004-001 |
| Buyer | Master Data (§5) | SPR-MOD-004-001 |
| Purchase Requisition | Transaction (§6) | SPR-MOD-004-002 |
| RFQ | Transaction (§6) | SPR-MOD-004-002 |
| Purchase Order | Transaction (§6) | SPR-MOD-004-002 |
| Goods Receipt Note | Transaction (§6) | SPR-MOD-004-003 |
| Purchase Invoice | Transaction (§6) | SPR-MOD-004-004 |
| Debit Note | Transaction (§6) | SPR-MOD-004-005 |

### 4.4 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-004-001 | §1, §2 (submodule foundation surface), §3 (personas), §5 (Supplier, Purchase Price List, Terms & Conditions, Buyer), §10 (Configuration) |
| SPR-MOD-004-002 | §2 (Requisition and approval, RFQ and supplier comparison, POs and amendments), §4 (Requisition-to-PO), §6 (Purchase Requisition, RFQ, Purchase Order), §8 (RequisitionApproved, PurchaseOrderIssued — published) |
| SPR-MOD-004-003 | §2 (Goods receipt and inspection), §4 (PO-to-GRN), §6 (Goods Receipt Note), §7 (GRN tolerance rule), §8 (GoodsReceived — published; InventoryLowStock — consumed) |
| SPR-MOD-004-004 | §2 (Supplier invoices and 3-way match), §4 (GRN-to-invoice, 3-way match), §6 (Purchase Invoice), §7 (Invoice tolerance rule), §8 (PurchaseInvoiceReceived — published; PaymentSent — consumed), §9 (Purchase Register, 3-Way Match Exceptions) |
| SPR-MOD-004-005 | §2 (Purchase returns), §4 (Return-to-debit-note), §6 (Debit Note), §8 (DebitNoteIssued — published) |
| SPR-MOD-004-006 | §9 (Purchase Register, PO Ageing, Supplier Performance, Price Variance, 3-Way Match Exceptions), §11 (Audit readiness) |

No Module PRD capability, submodule, master-data entity, or transaction sits outside the six sprints above. No capability appears as the originating allocation in more than one sprint.

## 5. Engine Consumption Map

Derived from Purchase Module PRD §12 (Required: `ENG-001..006`, `ENG-007`, `ENG-008`, `ENG-010`, `ENG-011`, `ENG-015`, `ENG-017`, `ENG-018`, `ENG-019`, `ENG-021`, `ENG-024`; Optional: `ENG-012`, `ENG-013`, `ENG-016`, `ENG-020`, `ENG-023`, `ENG-025`, `ENG-026`, `ENG-027`). No engine behavior is redefined.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-008 | ENG-010 | ENG-011 | ENG-012 | ENG-015 | ENG-017 | ENG-018 | ENG-019 | ENG-020 | ENG-021 | ENG-024 | ENG-025 | ENG-027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-004-001 | ● | ● | ● | ● | ● | ● |   |   |   |   |   |   | ● | ● |   |   |   | ● |   |   |
| SPR-MOD-004-002 |   | ● |   | ● | ● |   | ● | ● | ● | ● | ● |   | ● | ● |   |   |   | ● | ● |   |
| SPR-MOD-004-003 |   | ● |   | ● |   |   | ● | ● | ● | ● | ● |   | ● | ● |   |   |   | ● | ● |   |
| SPR-MOD-004-004 |   | ● |   | ● |   |   | ● | ● |   | ● | ● | ● | ● | ● | ● |   |   | ● | ● |   |
| SPR-MOD-004-005 |   | ● |   | ● |   |   | ● | ● | ● | ● | ● |   | ● | ● |   |   |   | ● | ● |   |
| SPR-MOD-004-006 |   | ● |   | ● |   |   |   |   |   |   |   |   |   |   |   | ● | ● | ● | ● | ● |

Optional engines (`ENG-013`, `ENG-016`, `ENG-023`, `ENG-026`) MAY be consumed during Stage 2 authoring per the Module PRD; they are not tabulated as required consumption in this plan. Engine identifiers listed above resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md` and are consistent with the consumer expectations in `docs/ENGINE_USAGE_MATRIX.md`.

## 6. ADR Consumption Map

Accepted ADRs only, per Purchase Module PRD (`ADR-011`, `ADR-014`, `ADR-032`).

| Sprint | ADR-011 | ADR-014 | ADR-032 |
| --- | :-: | :-: | :-: |
| SPR-MOD-004-001 | ● | ● | ● |
| SPR-MOD-004-002 | ● | ● | ● |
| SPR-MOD-004-003 | ● | ● | ● |
| SPR-MOD-004-004 | ● | ● | ● |
| SPR-MOD-004-005 | ● | ● | ● |
| SPR-MOD-004-006 | ● | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Accounting Dependency.** All accounting behavior required by MOD-004 is consumed through `MOD002_ACCOUNTING_BASELINE_v1`. Purchase owns commercial document lifecycle; Accounting owns accounting lifecycle. Ownership boundaries established by the Accounting baseline SHALL NOT be redefined in Purchase Sprint PRDs.
>
> **Inventory Dependency.** All inventory behavior (item master, stock ledger, putaway, reservations) is owned by **MOD-005 Inventory**. Purchase produces warehouse-handover contracts at goods receipt; Inventory owns the resulting stock movement. Ownership boundaries established by MOD-005 SHALL NOT be redefined in Purchase Sprint PRDs.
>
> **Sales Boundary.** Purchase does NOT consume Customer master data. Purchase owns Supplier/Vendor master (§5); Customer master is owned by MOD-003 Sales. Purchase Sprint PRDs SHALL NOT redefine customer ownership.
>
> **Analytics Boundary.** Cross-module KPI definitions are owned by **MOD-017 Analytics**. Purchase surfaces its own operational reports (§9) but consumes cross-module KPI definitions from MOD-017.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Supplier Master | SPR-MOD-004-001 | 002, 003, 004, 005, 006 | Foundational; every later sprint assumes supplier and buyer data. |
| Buyer & Purchase Price List | SPR-MOD-004-001 | 002, 003, 004, 005 | Consumed by requisition-to-invoice document lifecycle. |
| Purchasing Configuration | SPR-MOD-004-001 | 002, 003, 004, 005, 006 | Numbering series, approval thresholds, preferred supplier defaults, tolerance settings. |
| Numbering Series | SPR-MOD-004-001 (registration) | 002, 003, 004, 005 | Document numbers resolved via `ENG-017`. |
| Approval Rules | SPR-MOD-004-001 (thresholds) | 002, 003, 004, 005 | Multi-step approvals routed via `ENG-011`. |
| Purchase Documents (Requisition, RFQ, PO, GRN, Invoice) | 002, 003, 004 | 005, 006 | Returns and analytics consume earlier document lifecycle. |
| Tolerance Rules (GRN / Invoice) | 003 (GRN), 004 (Invoice) | 004, 005, 006 | Rules evaluated via `ENG-012`. |
| Warehouse Handover Contracts | SPR-MOD-004-003 | MOD-005 Inventory (external) | Purchase does not implement putaway. |
| Voucher Creation Contracts | SPR-MOD-004-004 | 005, 006 | Accounting voucher requests produced by invoicing; returns reference them. |
| Tax Determination Contracts | SPR-MOD-004-004 | 005, 006 | Tax resolution via `ENG-019`; downstream analytics may reference tax lines. |
| Payables Creation Contracts | SPR-MOD-004-004 | 006 | Analytics reports on payables created at invoice time. |
| `PaymentSent` (consumed event) | External (MOD-002) | SPR-MOD-004-004 | Payment execution owned by Accounting; Purchase consumes the outcome. |
| `SupplierCreated` (consumed event) | External (MOD-001/MOD-002) | SPR-MOD-004-001 | Cross-module supplier lifecycle notification, per Module PRD §8. |
| `InventoryLowStock` (consumed event) | External (MOD-005) | SPR-MOD-004-002 | May seed requisition workflow, per Module PRD §8. |
| `RequisitionApproved` event | SPR-MOD-004-002 | 003, 006 | Triggers downstream PO and analytics. |
| `PurchaseOrderIssued` event | SPR-MOD-004-002 | 003, 006 | Triggers goods receipt and analytics. |
| `GoodsReceived` event | SPR-MOD-004-003 | 004, 006, MOD-005 | Triggers invoicing, inventory update, and analytics. |
| `PurchaseInvoiceReceived` event | SPR-MOD-004-004 | 005, 006, MOD-002 | Triggers accounting voucher creation, returns, and analytics. |
| `DebitNoteIssued` event | SPR-MOD-004-005 | 006, MOD-002 | Triggers return processing and analytics. |
| Purchase Reporting | SPR-MOD-004-001 (master data) | 006 | Final sprint produces dashboards and reports from all prior data. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-004 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen and available. Any regression against that baseline blocks Stage 2 authoring of MOD-004 sprints until the platform baseline is amended via a new versioned baseline.
- **R2 — Accounting baseline dependency.** MOD-004 assumes `MOD002_ACCOUNTING_BASELINE_v1` is frozen. Purchase invoicing and returns consume the Accounting baseline for voucher creation and accounting period governance; Purchase MUST NOT redefine accounting ownership.
- **R3 — Inventory dependency.** MOD-004 depends on MOD-005 Inventory for item master, stock ledger, putaway, and reservation behavior. Until MOD-005 is baselined, Purchase Sprint PRDs MAY declare outbound warehouse-handover contract expectations while treating the concrete implementation as a downstream dependency.
- **R4 — Optional-engine scope creep.** Optional engines (`ENG-013`, `ENG-016`, `ENG-020`, `ENG-023`, `ENG-025`, `ENG-026`, `ENG-027`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R5 — External integrations.** Supplier-portal and e-invoice inbound integrations (Module PRD §8) are contract-shape-only in this plan; concrete gateway integrations are scheduled as later Sprint PRDs or a separate module, not folded into MOD-004.
- **R6 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md` §3, no horizontal-only sprints are required for MOD-004 beyond the sequence above; all sprints are vertical slices.
- **R7 — Sprint Roadmap reconciliation.** The prior planning estimate in `SPRINT_ROADMAP.md` for MOD-004 (5 sprints) is superseded by the six-sprint decomposition in this plan; the Roadmap will be reconciled during Stage 2 authoring rather than in this documentation-only pass.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-004 is baseline-ready when all of the following are objectively true:

1. Every reserved Purchase Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD004_PURCHASE_BASELINE_v1` is authored under `docs/40-module-baselines/` per the repository-standard Stage 3 location.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no Purchase capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md`.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
