---
title: "API-004 — Purchase API Solution Design Specification"
summary: "API solution design for MOD-004 Purchase: supplier master, requisitions, RFQs, POs, GRN, supplier invoices, 3-way match, and event contracts."
layer: "design"
owner: "Procurement"
status: "approved"
updated: "2026-07-20"
spec_id: "API-004"
module_id: "MOD-004"
platform: "api"
depends_on: ["docs/20-module-prds/purchase/MODULE_PRD.md", "docs/60-solution-design/api/inventory/API-005_INVENTORY.md"]
tags: ["solution-design", "api", "purchase"]
document_type: "Solution Design"
---

# API-004 — Purchase API Solution Design Specification

## 1. Purpose

Authoritative API surface for MOD-004 Purchase. Consumes MOD-005 Inventory contracts frozen at Stage 3; does not redefine them.

## 2. API Capability Neutrality Clause

Specifies capabilities and semantics, not transport encoding.

## 3. Resource Catalog

| Resource | Operations | Notes |
| --- | --- | --- |
| Suppliers | list, get, create, update, deactivate | Owned by MOD-004. |
| SupplierPriceLists | list, get, create, update | Owned by MOD-004. |
| Requisitions | list, get, create, submit, approve, cancel | Approval-gated. |
| RFQs | list, get, create, publish, receive-quotes, award | |
| PurchaseOrders | list, get, create, approve, amend, cancel, close | |
| GoodsReceiptNotes | list, get, create, post | Emits `GoodsReceived`. |
| SupplierInvoices | list, get, create, post, cancel | |
| ThreeWayMatches | list, get, run | Read-only projection over PO/GRN/Invoice. |
| DebitNotes | list, get, create, post | |

## 4. Consumed Contracts (frozen at Stage 3)

- `Items`, `UoM`, `Warehouses`, `Bins`, `StockBalances`, `Reservations` (API-005).
- `ChartOfAccounts`, `TaxCodes` (API-002).

MOD-004 SHALL NOT create, mutate, or redefine any of the above.

## 5. Event Catalog

**Published:**

| Event | Trigger | Payload |
| --- | --- | --- |
| `GoodsReceived` | GRN posted | grn_id, po_id, supplier_id, lines[{item_id, qty, uom, warehouse_id, unit_cost}] |
| `PurchaseOrderIssued` | PO approved | po_id, supplier_id, currency, total |
| `SupplierInvoiceMatched` | 3-way match success | invoice_id, po_id, grn_ids[], variances[] |

**Consumed:** `StockReceived` (MOD-005 acknowledges the ledger side-effect).

## 6. Authorization

RBAC + ABAC via ENG-002/003; approvals via ENG-011.

## 7. Numbering, Audit, Posting

Numbering via ENG-017; audit via ENG-004; AP + inventory postings via ENG-016.

## 8. Idempotency, Concurrency, Errors

Idempotency keys on all `post` operations; ETag/version concurrency; uniform error envelope with `MATCH_VARIANCE` for 3-way failures.

## 9. Traceability Matrix

| Requirement | PRD § | Resource / Event |
| --- | --- | --- |
| Requisition-to-PO flow | §2 | Requisitions, RFQs, PurchaseOrders |
| Goods receipt | §2, §8 | GoodsReceiptNotes, `GoodsReceived` |
| Supplier invoicing & 3-way | §2 | SupplierInvoices, ThreeWayMatches |
| Debit notes / returns | §2 | DebitNotes |
| Supplier master authority | §5 | Suppliers |
| Approvals | §6 | ENG-011 |
| GL posting | §6 | ENG-016 |
| Events published | §8 | Event Catalog §5 |
| Consumed inventory contracts | §5, §13 | API-005 (frozen) |
| Consumed accounting contracts | §13 | API-002 |

## 10. Contracts Frozen (end-of-stage)

`GoodsReceived` event shape and Supplier Master read contract are FROZEN at the close of Stage 4.

## 11. Traceability

- PRD: MOD-004 PRD §§2, 5, 6, 8, 13.
- Baseline: `MOD004_PURCHASE_BASELINE_v1`.
- ADRs: ADR-007, ADR-011, ADR-014, ADR-032.

## 12. References

- `docs/20-module-prds/purchase/MODULE_PRD.md`
- `docs/60-solution-design/api/inventory/API-005_INVENTORY.md`

## 13. Notes

No local override of any MOD-005 contract; consumers of MOD-004 (MOD-002 AP posting, MOD-019 dock scheduling) receive only MOD-004-owned resources and events listed above.
