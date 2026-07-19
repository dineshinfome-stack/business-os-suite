---
title: "API-005 — Inventory API Solution Design Specification"
summary: "API solution design for MOD-005 Inventory: master data, transactional, reservation, valuation, and event contracts consumed by MOD-003, MOD-004, MOD-019."
layer: "design"
owner: "Supply Chain"
status: "approved"
updated: "2026-07-20"
spec_id: "API-005"
module_id: "MOD-005"
platform: "api"
depends_on: ["docs/20-module-prds/inventory/MODULE_PRD.md", "docs/11-adrs/architecture/ADR-007-core-erp-module-boundaries.md"]
tags: ["solution-design", "api", "inventory"]
document_type: "Solution Design"
---

# API-005 — Inventory API Solution Design Specification

## 1. Purpose

Authoritative API surface for MOD-005 Inventory. Defines every contract that MOD-003, MOD-004, and MOD-019 will consume. Contracts frozen at the end of this stage per Wave 1 Contract Freeze.

## 2. API Capability Neutrality Clause

This document specifies **capabilities** (resources, operations, event semantics), not transport encoding. Transport (REST/JSON, gRPC, or async event bus) is implementation-time; contract shape and semantics are authoritative.

## 3. Resource Catalog

| Resource | Operations | Notes |
| --- | --- | --- |
| Items | list, get, create, update, deactivate | Item Master; owned exclusively by MOD-005. |
| ItemCategories | list, get, create, update, delete | Tree structure. |
| UoM | list, get, create, update | Master. |
| Warehouses | list, get, create, update, deactivate | Warehouse Master. |
| Bins | list, get, create, update, deactivate | Under a Warehouse. |
| StockBalances | list, get | Read-only projection (includes reservation state). |
| StockLedger | list, get | Append-only. |
| StockReceipts | list, get, create, post, cancel | Emits `StockReceived` on post. |
| StockIssues | list, get, create, post, cancel | Emits `StockIssued`. |
| StockTransfers | list, get, create, post, cancel | Emits `StockTransferred`. |
| StockAdjustments | list, get, create, post | Approval-gated. |
| PhysicalCounts | list, get, create, submit-lines, finalize | Emits variance posting request. |
| Reservations | list, get, create, release | Reservation API used by MOD-003 fulfilment. |
| Valuations | list, get | Read; reports FIFO/MA/Std per policy. |
| ReorderRecommendations | list | Emits `InventoryLowStock`. |

## 4. Event Catalog (published)

| Event | Trigger | Payload (business fields) |
| --- | --- | --- |
| `StockReceived` | Receipt posted | receipt_id, item_id, warehouse_id, bin_id, qty, uom, batch/serial (optional), unit_cost, timestamp |
| `StockIssued` | Issue posted | issue_id, item_id, warehouse_id, bin_id, qty, uom, cost_layer_refs, timestamp |
| `StockTransferred` | Transfer posted | transfer_id, item_id, from_wh/bin, to_wh/bin, qty, in_transit_ref, timestamp |
| `InventoryLowStock` | Reorder policy tripped | item_id, warehouse_id, on_hand, reorder_level, recommended_qty |
| `InventoryValuationChanged` | Valuation run | item_id, warehouse_id, old_value, new_value, method, effective_date |

## 5. Events Consumed

- `GoodsReceived` (MOD-004) — triggers a matched `StockReceipt`.
- `DeliveryDispatched` (MOD-003) — triggers a matched `StockIssue`.
- `ProductionCompleted` (MOD-009) — triggers a matched `StockReceipt`.
- Warehouse execution events (`PutawayCompleted`, `PickCompleted`, `InternalReplenishmentCompleted`) — update bin allocations under the same ledger transaction.

## 6. Authorization

All operations authorised via ENG-002/ENG-003 (RBAC + ABAC per ADR-032). Approval-gated operations invoke ENG-011.

## 7. Numbering, Audit, Posting

Numbering via ENG-017. Audit via ENG-004. Ledger effects post via ENG-016 (no MOD-005 module-internal posting logic).

## 8. Idempotency, Concurrency

- All `create` and `post` operations accept an idempotency key.
- Optimistic concurrency via ETag / version on master records.
- Reservation operations use conditional stock decrement with retry semantics.

## 9. Errors

Uniform error envelope: `code`, `message`, `retryable`, `details[]`. Reservation failures use `INSUFFICIENT_STOCK`; approval-blocked posts use `APPROVAL_REQUIRED` with a workflow link.

## 10. Traceability Matrix

| Requirement | PRD § | Resource / Event |
| --- | --- | --- |
| Item master authority | §5 | `Items` |
| Warehouse/bin authority | §5 | `Warehouses`, `Bins` |
| Stock ledger (append-only) | §2, §6 | `StockLedger`, `StockReceipts`/`Issues`/`Transfers` |
| Adjustment with approval | §6, §7 | `StockAdjustments` + ENG-011 |
| Physical count with variance posting | §6, §7 | `PhysicalCounts` + ENG-016 |
| Reservation | §5 (Stock Balance state) | `Reservations` |
| Valuation methods | §2 | `Valuations` |
| Reorder | §2, §8 | `ReorderRecommendations` + `InventoryLowStock` |
| Events published | §8 | Event Catalog §4 |
| Events consumed | §8 | §5 |
| Numbering | §6 | ENG-017 |
| Audit | §6 | ENG-004 |
| Authorization | §3 | ENG-002/003 |

## 11. Contracts Frozen (end-of-stage)

Item Master, Warehouse/Bin Master, StockLedger read shape, StockReceipts/Issues/Transfers post payloads, Reservation API, Valuation reads, and all five published event shapes are FROZEN at the close of Stage 3.

## 12. Traceability

- PRD: MOD-005 PRD §§2, 5, 6, 8, 10, 12.
- Baseline: `MOD005_INVENTORY_BASELINE_v1`.
- ADRs: ADR-007, ADR-011, ADR-014, ADR-032.
- Consumers: API-003, API-004, API-019.

## 13. References

- `docs/20-module-prds/inventory/MODULE_PRD.md`
- `docs/11-adrs/architecture/ADR-007-core-erp-module-boundaries.md`
