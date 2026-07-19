---
title: "API-019 — Warehouse API Solution Design Specification"
summary: "API solution design for MOD-019 Warehouse: overlay masters, tasks, dock appointments, and execution events."
layer: "design"
owner: "Operations"
status: "approved"
updated: "2026-07-20"
spec_id: "API-019"
module_id: "MOD-019"
platform: "api"
depends_on: ["docs/20-module-prds/warehouse/MODULE_PRD.md", "docs/60-solution-design/api/inventory/API-005_INVENTORY.md"]
tags: ["solution-design", "api", "warehouse"]
document_type: "Solution Design"
---

# API-019 — Warehouse API Solution Design Specification

## 1. Purpose

Authoritative API surface for MOD-019 Warehouse execution. Consumes MOD-005 as system of record; overlays MOD-005 warehouse/bin master with Zone/Area/Dock overlays. Does not own Item, Warehouse, Bin master, Stock Ledger, or Valuation.

## 2. API Capability Neutrality Clause

Specifies capabilities and semantics, not transport encoding.

## 3. Resource Catalog

| Resource | Operations | Notes |
| --- | --- | --- |
| Zones | list, get, create, update, deactivate | Overlay over MOD-005 warehouses. |
| Areas | list, get, create, update, deactivate | Within a Zone. |
| Docks | list, get, create, update | Dock master. |
| Equipment | list, get, create, update | Equipment master. |
| LaborResources | list, get, create, update | Labor master. |
| TaskTypes | list, get, create, update | Task Type Registry. |
| DockAppointments | list, get, create, reschedule, cancel | |
| Tasks | list, get, assign, start, complete, cancel | Putaway/Pick/Pack/Load/Replenishment/Count instances. |
| Waves | list, get, plan, release, close | Outbound wave planning. |
| SlottingRules | list, get, create, evaluate | Slotting recommendations. |

## 4. Consumed Contracts (frozen at Stages 3, 4, 5)

- MOD-005: `Items`, `Warehouses`, `Bins`, `StockBalances`, `Reservations` (READ), plus event triggers for ledger effects.
- MOD-004: `GoodsReceived` (drives inbound execution).
- MOD-003: `DeliveryDispatched` (drives outbound execution completion).

MOD-019 SHALL NOT create, mutate, or redefine any of the above.

## 5. Event Catalog

**Published:**

| Event | Trigger | Payload |
| --- | --- | --- |
| `PutawayCompleted` | Putaway task complete | task_id, item_id, qty, to_bin_id, license_plate |
| `PickCompleted` | Pick task complete | task_id, item_id, qty, from_bin_id, wave_id |
| `PackCompleted` | Pack task complete | task_id, package_id, contents[], weight |
| `LoadCompleted` | Load task complete | task_id, package_ids[], dock_id, vehicle_ref |
| `DispatchHandoverCompleted` | Handover complete | delivery_ref, dock_id, timestamp |
| `InternalReplenishmentCompleted` | Replenishment task complete | task_id, item_id, qty, from_bin, to_bin |

**Consumed:** `GoodsReceived`, `DeliveryDispatched`, `StockTransferred`, `InventoryLowStock`.

## 6. Authorization

RBAC + ABAC via ENG-002/003, task-type scoped.

## 7. Numbering, Audit

Numbering via ENG-017; audit via ENG-004.

## 8. Idempotency, Concurrency, Errors

Idempotency keys per task-complete operation; ETag concurrency on task assignments; error codes include `TASK_ALREADY_COMPLETE`, `RESERVATION_LOST`.

## 9. Traceability Matrix

| Requirement | PRD § | Resource / Event |
| --- | --- | --- |
| Zone/Area overlay | §5 | Zones, Areas |
| Dock master | §2 | Docks |
| Equipment/Labor master | §2 | Equipment, LaborResources |
| Task Type Registry | §2 | TaskTypes |
| Inbound execution | §2 | Tasks (Putaway), `GoodsReceived` consumed, `PutawayCompleted` emitted |
| Slotting | §2 | SlottingRules |
| Outbound execution | §2 | Waves, Tasks (Pick/Pack), events |
| Yard/dock/load-out | §2 | DockAppointments, Tasks (Load), `DispatchHandoverCompleted` |
| Cycle count execution | §2 | Tasks (Count) |
| Events published | §8 | Event Catalog §5 |
| Events consumed | §8 | §5 |
| No inventory master ownership | §5 | Consumed contracts only |

## 10. Traceability

- PRD: MOD-019 PRD §§2, 5, 8.
- Baseline: `MOD019_WAREHOUSE_BASELINE_v1`.
- ADRs: ADR-007.

## 11. References

- `docs/20-module-prds/warehouse/MODULE_PRD.md`
- `docs/60-solution-design/api/inventory/API-005_INVENTORY.md`
