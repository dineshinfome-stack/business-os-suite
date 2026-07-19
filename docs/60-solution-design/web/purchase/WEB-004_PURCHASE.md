---
title: "WEB-004 — Purchase Web Solution Design Specification"
summary: "Web solution design for MOD-004 Purchase: requisitions, RFQs, purchase orders, goods receipt, supplier invoicing, and 3-way match."
layer: "design"
owner: "Procurement"
status: "approved"
updated: "2026-07-20"
spec_id: "WEB-004"
module_id: "MOD-004"
platform: "web"
depends_on: ["docs/20-module-prds/purchase/MODULE_PRD.md", "docs/60-solution-design/api/inventory/API-005_INVENTORY.md"]
tags: ["solution-design", "web", "purchase"]
document_type: "Solution Design"
---

# WEB-004 — Purchase Web Solution Design Specification

## 1. Purpose

Web surface for MOD-004 Purchase (Procure-to-Pay). Consumes MOD-005 Inventory contracts and MOD-002 Accounting interfaces; does not redefine them.

## 2. Scope

**In scope.** Supplier master (procurement view), requisitions, RFQs, purchase orders, goods receipt (business document), supplier invoicing, 3-way match, returns/debit notes.

**Out of scope.** Physical unloading and putaway UI (MOD-019), stock ledger UI (MOD-005), GL posting UI (MOD-002).

## 3. Personas

Buyer, Procurement Manager, Approver, Accountant (AP), Auditor.

## 4. Screen Inventory

| # | Screen | Path |
| --- | --- | --- |
| 1 | Purchase Home / KPIs | `/purchase` |
| 2 | Suppliers | `/purchase/suppliers` (+ detail) |
| 3 | Supplier Price Lists | `/purchase/price-lists` |
| 4 | Requisitions | `/purchase/requisitions` (+ detail) |
| 5 | RFQ | `/purchase/rfqs` (+ detail, comparison) |
| 6 | Purchase Orders | `/purchase/orders` (+ detail) |
| 7 | Goods Receipt Notes | `/purchase/receipts` (+ detail) |
| 8 | Supplier Invoices | `/purchase/invoices` (+ detail) |
| 9 | 3-Way Match Console | `/purchase/match` |
| 10 | Debit Notes / Returns | `/purchase/returns` (+ detail) |
| 11 | Purchase Analytics | `/purchase/analytics` |
| 12 | Configuration | `/purchase/settings` |

## 5. Interaction Model

Master + Voucher + Approval Timeline patterns. RFQ comparison uses a side-by-side quote grid. 3-Way Match shows PO, GRN, Invoice lines with variance flags.

## 6. Data Contracts

- Consumes: `Items`, `UoM`, `Warehouses`, `Reservations`, `StockBalances` (API-005); Suppliers (owned here); Chart of Accounts (MOD-002).
- Produces: Requisition, RFQ, PurchaseOrder, GoodsReceiptNote, SupplierInvoice, DebitNote.
- Emits event: `GoodsReceived` (business document); ledger side-effect via MOD-005 `StockReceived`.

## 7. Business Rules Surfaced in UI

Approval matrices, budget checks (via ENG-012), 3-way tolerance thresholds, supplier hold flags.

## 8. Design Constraints

Follows Repository Navigation Standard v1.1 and design system. No inventory master editing from Purchase screens (read-only Item picker).

## 9. Accessibility & Localization

WCAG 2.1 AA; multi-currency & tax code per ENG-006 / locale packs.

## 10. Traceability

- PRD: MOD-004 PRD §§2, 5, 6, 8.
- Baseline: `MOD004_PURCHASE_BASELINE_v1`.
- ADRs: ADR-007, ADR-011, ADR-014.
- Consumes: API-005 (Inventory), API-002 (Accounting).

## 11. Acceptance Criteria

Every screen names its persona, path, and consumed contracts. No screen redefines a MOD-005 or MOD-002 contract.

## 12. References

- `docs/20-module-prds/purchase/MODULE_PRD.md`
- `docs/60-solution-design/api/inventory/API-005_INVENTORY.md`
