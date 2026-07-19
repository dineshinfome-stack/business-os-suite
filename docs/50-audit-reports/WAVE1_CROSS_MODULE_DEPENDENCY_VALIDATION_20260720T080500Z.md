---
title: "Wave 1 Cross-Module Dependency Validation"
summary: "Validates every Wave 1 cross-module dependency edge against ADR-007."
layer: "platform"
owner: "Architecture"
status: "approved"
updated: "2026-07-20"
report_id: "WAVE1_CROSS_MODULE_DEPENDENCY_VALIDATION_20260720T080500Z"
phase: "5.1"
tags: ["phase-5-1", "wave-1", "closeout"]
document_type: "Dependency Validation"
---

# Wave 1 Cross-Module Dependency Validation

Every declared consumption edge in the Wave 1 SDs is validated against ADR-007 and the Stage 3/4/5 Contract Freezes.

| Edge | Consumer | Provider | Contract Consumed | ADR-007? | Frozen? | Result |
| --- | --- | --- | --- | :---: | :---: | :---: |
| WEB/API-004 → API-005 | Purchase | Inventory | Items, UoM, Warehouses, StockBalances, Reservations | ✓ | ✓ | PASS |
| WEB/API-004 → API-002 | Purchase | Accounting | ChartOfAccounts, TaxCodes | ✓ | ✓ | PASS |
| WEB/API-003 → API-005 | Sales | Inventory | Items, StockBalances, Reservations | ✓ | ✓ | PASS |
| WEB/API-003 → API-002 | Sales | Accounting | ChartOfAccounts, TaxCodes, AR | ✓ | ✓ | PASS |
| WEB/API-019 → API-005 | Warehouse | Inventory | Items, Warehouses, Bins, StockBalances | ✓ | ✓ | PASS |
| WEB/API-019 → API-004 (event) | Warehouse | Purchase | `GoodsReceived` | ✓ | ✓ | PASS |
| WEB/API-019 → API-003 (event) | Warehouse | Sales | `DeliveryDispatched` | ✓ | ✓ | PASS |
| API-005 → API-004 (event) | Inventory | Purchase | `GoodsReceived` (drives `StockReceived`) | ✓ | ✓ | PASS |
| API-005 ↔ API-019 (events) | Inventory | Warehouse | Execution events (`PutawayCompleted`, etc.) | ✓ | ✓ | PASS |
| API-002 → API-004 / API-003 (events) | Accounting | Purchase / Sales | Posting triggers via ENG-016 | ✓ | ✓ | PASS |

**Result: all Wave 1 cross-module edges validate against ADR-007 with no contract redefinition.**
