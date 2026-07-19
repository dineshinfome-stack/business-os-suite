---
title: "Phase 4.5 — Core ERP Domain Architecture Validation"
summary: "One-time architectural checkpoint validating the functional boundaries of MOD-002, MOD-003, MOD-004, MOD-005, and MOD-019 before Wave 1 Solution Design authoring."
layer: "platform"
owner: "Architecture"
status: "approved"
updated: "2026-07-20"
report_id: "PHASE4_5_CORE_ERP_DOMAIN_VALIDATION_20260720T040000Z"
phase: "4.5"
scope: ["MOD-002", "MOD-003", "MOD-004", "MOD-005", "MOD-019"]
related_adrs: ["ADR-007"]
depends_on:
  - "docs/20-module-prds/accounting/MODULE_PRD.md"
  - "docs/20-module-prds/sales/MODULE_PRD.md"
  - "docs/20-module-prds/purchase/MODULE_PRD.md"
  - "docs/20-module-prds/inventory/MODULE_PRD.md"
  - "docs/20-module-prds/warehouse/MODULE_PRD.md"
tags: ["phase-4-5", "architecture-validation", "core-erp"]
document_type: "Architecture Validation Report"
---

# Phase 4.5 — Core ERP Domain Architecture Validation

> **Purpose.** Validate the functional boundaries of the Core ERP modules **before** Wave 1 Solution Design authoring begins. This is a one-time architectural checkpoint. Every ownership assertion in this report cites the source PRD section. No PRDs, Baselines, Publications, navigation, or governance documents are modified by this phase; corrections are captured as follow-up work items.

## 1. Scope & Method

**Modules in scope.**

- MOD-002 Accounting (Finance — General Ledger and Sub-ledgers)
- MOD-003 Sales (Revenue — Order-to-Cash)
- MOD-004 Purchase (Procurement — Procure-to-Pay)
- MOD-005 Inventory (Supply Chain — Stock Management)
- MOD-019 Warehouse (Operations — Warehouse Operations)

**Sources reviewed.**

- Module PRDs for each of the five modules (`docs/20-module-prds/*/MODULE_PRD.md`).
- Module READMEs (`docs/20-module-prds/*/README.md`).
- Module baselines under `docs/40-module-baselines/`.
- Cross-reference: `docs/module-dependency-matrix.md`, `docs/MODULE_CATALOG.md`.

**Evaluation criteria.**

1. Single Responsibility — each module owns one bounded context.
2. Single Owner per Capability — every business capability appears in exactly one module's Section 2.
3. Unambiguous Master Data Ownership — each master entity has exactly one system-of-record module.
4. Acyclic Dependencies — `depends_on` graph is a DAG; declared dependencies are actually consumed.
5. End-to-End Flows Complete — each core business process has an owning module at every step.

## 2. Domain Boundary Matrix

| Module | Bounded Context | Primary Domain | Business Responsibility (verbatim from PRD §1) | Out-of-Scope Marker |
| --- | --- | --- | --- | --- |
| MOD-002 Accounting | General Ledger and Sub-ledgers | Finance | Chart of accounts, journals, AP/AR, banking, tax, period close | Does not own operational transactions; consumes postings via ENG-016 |
| MOD-003 Sales | Order-to-Cash | Revenue | Quotations, sales orders, delivery, invoicing, receivables handoff | Does not own physical picking/packing/loading (delegated to MOD-019) |
| MOD-004 Purchase | Procure-to-Pay | Procurement | Requisitions, RFQs, POs, goods receipt, supplier invoicing, 3-way match | Does not own physical unloading/putaway (delegated to MOD-019) |
| MOD-005 Inventory | Stock Management | Supply Chain | Items, warehouses, bins, stock ledger, valuation, physical verification | Does not own physical execution tasks (delegated to MOD-019) |
| MOD-019 Warehouse | Warehouse Operations | Operations | Physical execution against Inventory's stock lifecycle: inbound, storage/slotting, outbound, yard/dock, labor, equipment | Does not own item/warehouse/bin master or stock ledger (owned by MOD-005) |

**Finding B-1.** All five modules declare a distinct bounded context; no context overlap detected. The Warehouse PRD explicitly states *"Warehouse zones and areas overlay — but do NOT replace — the Inventory-owned warehouse/bin master"* (§5 Consumed Master Data). This is a clean split.

## 3. Capability Ownership Matrix

Every capability below is owned by exactly one module. Consumers list downstream modules that read/emit against the capability.

| # | Capability | Owner | Consumers | Source |
| --- | --- | --- | --- | --- |
| 1 | Item Master | MOD-005 Inventory | MOD-003, MOD-004, MOD-009, MOD-015, MOD-019 | MOD-005 §5 |
| 2 | Item Categorization / Product Catalog | MOD-005 Inventory | MOD-003, MOD-004, MOD-017 | MOD-005 §2 ("Item master and categorization") |
| 3 | Warehouse Master | MOD-005 Inventory | MOD-004, MOD-019 | MOD-005 §5; MOD-019 §5 (consumed read-only) |
| 4 | Bin / Location Master | MOD-005 Inventory | MOD-019 | MOD-005 §5; MOD-019 §5 |
| 5 | Warehouse Zone / Area (overlay) | MOD-019 Warehouse | MOD-005 (for slot hints) | MOD-019 §5 |
| 6 | Unit of Measure | MOD-005 Inventory | MOD-003, MOD-004, MOD-019 | MOD-005 §5 |
| 7 | Stock Ledger | MOD-005 Inventory | MOD-002, MOD-017 | MOD-005 §2, §9 ("Stock Ledger") |
| 8 | Stock Balance (system of record) | MOD-005 Inventory | MOD-003, MOD-004, MOD-019 | MOD-005 §5 |
| 9 | Inventory Valuation (FIFO / MA / Std) | MOD-005 Inventory | MOD-002 | MOD-005 §2, §10 |
| 10 | Goods Receipt (transaction) | MOD-004 Purchase | MOD-005 (event: `GoodsReceived`), MOD-019 (drives inbound execution) | MOD-004 §2, §8 |
| 11 | Physical Unloading / Putaway | MOD-019 Warehouse | MOD-005 (via `PutawayCompleted`) | MOD-019 §2 |
| 12 | Goods Issue / Stock Issue (transaction) | MOD-005 Inventory | MOD-002, MOD-003 | MOD-005 §6 ("Stock Issue"), §8 (`StockIssued`) |
| 13 | Stock Transfer (inter-warehouse) | MOD-005 Inventory | MOD-019 (execution), MOD-002 | MOD-005 §6, §8 (`StockTransferred`) |
| 14 | Stock Adjustment / Write-off | MOD-005 Inventory | MOD-002 | MOD-005 §6 |
| 15 | Physical Stock / Cycle Count (transaction) | MOD-005 Inventory | MOD-019 (execution tasks) | MOD-005 §6 ("Physical Count") |
| 16 | Cycle Count Execution (labor tasking) | MOD-019 Warehouse | MOD-005 | MOD-019 §2 (Task Type Registry) |
| 17 | Reorder / Replenishment (policy + event) | MOD-005 Inventory | MOD-004, MOD-019 | MOD-005 §2, §8 (`InventoryLowStock`) |
| 18 | Internal Replenishment Execution | MOD-019 Warehouse | MOD-005 | MOD-019 §2, §8 (`InternalReplenishmentCompleted`) |
| 19 | Sales Order Capture & Fulfilment | MOD-003 Sales | MOD-005, MOD-019, MOD-002 | MOD-003 §2 |
| 20 | Sales Delivery / Dispatch (transaction) | MOD-003 Sales | MOD-005, MOD-019 | MOD-003 §2, §8 (`DeliveryDispatched`) |
| 21 | Picking (physical) | MOD-019 Warehouse | MOD-003, MOD-005 | MOD-019 §2 |
| 22 | Packing (physical) | MOD-019 Warehouse | MOD-003 | MOD-019 §2 |
| 23 | Loading / Load-Out | MOD-019 Warehouse | MOD-003 | MOD-019 §2 (Yard, Dock & Load-Out) |
| 24 | Shipping / Dispatch Handover | MOD-019 Warehouse | MOD-003 | MOD-019 §8 (`DispatchHandoverCompleted`) |
| 25 | Sales Invoicing (incl. e-invoice) | MOD-003 Sales | MOD-002 | MOD-003 §2 |
| 26 | Purchase Requisition / RFQ / PO | MOD-004 Purchase | MOD-002, MOD-005 | MOD-004 §2 |
| 27 | Supplier Invoice / 3-Way Match | MOD-004 Purchase | MOD-002 | MOD-004 §2 |
| 28 | Purchase Returns / Debit Notes | MOD-004 Purchase | MOD-002, MOD-005 | MOD-004 §2, §8 |
| 29 | Sales Returns / Credit Notes | MOD-003 Sales | MOD-002, MOD-005 | MOD-003 §2 |
| 30 | Chart of Accounts / GL / Journals | MOD-002 Accounting | all | MOD-002 §2 |
| 31 | Accounts Payable / Accounts Receivable | MOD-002 Accounting | MOD-003, MOD-004 | MOD-002 §2 |
| 32 | Bank & Cash Management | MOD-002 Accounting | MOD-003, MOD-004 | MOD-002 §2 |
| 33 | Tax Accounting / Period Close | MOD-002 Accounting | all | MOD-002 §2 |
| 34 | Multi-Warehouse (capability) | MOD-005 Inventory (master) + MOD-019 (execution) | MOD-003, MOD-004 | MOD-005 §5; MOD-019 §2 |
| 35 | Batch / Serial / Lot Management | MOD-005 Inventory | MOD-019, MOD-003, MOD-004 | MOD-005 §14 (future enh. explicitly names "Serial and batch traceability upgrades"; capability today lives with the stock ledger owner) |
| 36 | Barcode / RFID Scanning (device I/O) | MOD-019 Warehouse | MOD-005 (ledger effect) | MOD-019 §8 External Systems |
| 37 | Dock Scheduling / Yard Management | MOD-019 Warehouse | MOD-003, MOD-004 | MOD-019 §2 |
| 38 | Slotting Optimization | MOD-019 Warehouse | MOD-005 | MOD-019 §2, §5 (Slotting Rule) |
| 39 | Warehouse Labor / Equipment Tasking | MOD-019 Warehouse | — | MOD-019 §2, §5 |

**Finding C-1.** All 39 capabilities have exactly one owning module. Zero duplication detected.

**Finding C-2 (INFO).** Row 35 (Batch/Serial/Lot) is anchored to MOD-005 today because the stock ledger owns lot-tracked balances; MOD-005 PRD §14 flags a future enhancement to deepen this. No boundary change required — noted for the MOD-005 sprint roadmap.

## 4. Master Data Ownership

| Master Entity | System of Record | Consumers (read-only) | Duplicate? |
| --- | --- | --- | --- |
| Tenant, Company, Branch, User | MOD-001 Platform Administration | all | No |
| Chart of Accounts, Cost Center, Tax Code, Bank Account | MOD-002 Accounting | MOD-003, MOD-004, MOD-017 | No |
| Customer, Price List, Discount Scheme, Sales Territory, Salesperson | MOD-003 Sales | MOD-002, MOD-017 | No |
| Supplier, Purchase Price List, T&C, Buyer | MOD-004 Purchase | MOD-002, MOD-017 | No |
| Item, Item Category, UoM, Warehouse, Bin, Stock Balance | MOD-005 Inventory | MOD-003, MOD-004, MOD-019, MOD-009, MOD-015 | No |
| Warehouse Zone, Area, Dock Door, Equipment, Labor Resource, Task Type Registry, Slotting Rule, Dock Appointment Calendar | MOD-019 Warehouse | MOD-005 (slot hints), MOD-017 | No |

**Finding D-1.** No duplicate master ownership. MOD-019 explicitly overlays MOD-005's warehouse/bin master rather than redefining it — the correct pattern.

## 5. Business Process Mapping

### 5.1 Procure-to-Pay

| Step | Activity | Owner |
| --- | --- | --- |
| 1 | Requisition raised & approved | MOD-004 |
| 2 | RFQ / supplier comparison | MOD-004 |
| 3 | Purchase Order issued | MOD-004 |
| 4 | Inbound dock appointment | MOD-019 |
| 5 | Physical unloading + inspection | MOD-019 |
| 6 | Goods Receipt (transaction record) | MOD-004 |
| 7 | Stock ledger update | MOD-005 (via `StockReceived` event) |
| 8 | Putaway execution | MOD-019 |
| 9 | Supplier invoice + 3-way match | MOD-004 |
| 10 | GL posting (AP + inventory value) | MOD-002 (via ENG-016) |

### 5.2 Order-to-Cash

| Step | Activity | Owner |
| --- | --- | --- |
| 1 | Quotation / pricing | MOD-003 |
| 2 | Sales Order capture | MOD-003 |
| 3 | Stock allocation check | MOD-005 (read) |
| 4 | Wave/pick planning | MOD-019 |
| 5 | Picking | MOD-019 |
| 6 | Packing | MOD-019 |
| 7 | Delivery / Dispatch document | MOD-003 |
| 8 | Loading + dispatch handover | MOD-019 |
| 9 | Stock issue (ledger) | MOD-005 |
| 10 | Sales invoice | MOD-003 |
| 11 | GL posting (AR + COGS) | MOD-002 |

### 5.3 Inventory Replenishment

| Step | Activity | Owner |
| --- | --- | --- |
| 1 | Reorder policy evaluation | MOD-005 |
| 2 | `InventoryLowStock` emitted | MOD-005 |
| 3a | Purchase Requisition triggered | MOD-004 (external replenishment) |
| 3b | Internal replenishment task | MOD-019 (bin-to-bin) |
| 4 | Ledger reconciliation | MOD-005 |

### 5.4 Warehouse Operations (Inbound + Outbound)

Owned end-to-end by MOD-019 at the physical layer; every state transition produces an event consumed by MOD-005 for ledger effect. Complete flow modeled in MOD-019 §2 and §8.

### 5.5 Inter-Warehouse Transfer

| Step | Activity | Owner |
| --- | --- | --- |
| 1 | Transfer request | MOD-005 (Stock Transfer transaction) |
| 2 | Outbound pick at source | MOD-019 |
| 3 | Stock issue (source) | MOD-005 |
| 4 | In-transit tracking | MOD-005 (Stock Balance state) |
| 5 | Inbound putaway at destination | MOD-019 |
| 6 | Stock receipt (destination) | MOD-005 |
| 7 | GL posting (if valued transfer) | MOD-002 |

**Finding E-1.** All five end-to-end processes have an unambiguous owner at every step. No gaps, no split ownership.

## 6. Dependency Validation

Declared `depends_on` graph (source: PRD §13):

```text
MOD-001 ← MOD-002
MOD-001 ← MOD-003 ← {MOD-002, MOD-005}
MOD-001 ← MOD-004 ← {MOD-002, MOD-005}
MOD-001 ← MOD-005
MOD-001 ← MOD-019 ← {MOD-005, MOD-004, MOD-003, MOD-009}
```

**Cycle check.** No cycles. All `depends_on` edges point strictly downstream. `MOD-019 → MOD-003` and `MOD-019 → MOD-004` are context-only (execution consumes dispatch/receipt context); Sales and Purchase do NOT declare a dependency back on Warehouse.

**Finding F-1 (MAJOR — Non-Blocking).** The implementation sequence proposed in the user's plan (Accounting → Sales → Purchase → Inventory → Warehouse) is **incorrect** against the declared dependency graph: both MOD-003 Sales and MOD-004 Purchase depend on MOD-005 Inventory (Item Master, Stock Balance). The corrected sequence is:

```text
MOD-001 Platform → MOD-002 Accounting → MOD-005 Inventory → {MOD-004 Purchase, MOD-003 Sales} → MOD-019 Warehouse
```

Recommended action: adopt the corrected sequence in the Wave 1 SD authoring queue. This is a **sequencing correction, not a boundary change** — no PRD changes required.

**Finding F-2 (INFO).** Every declared `depends_on` edge is actually consumed via master data reads or events — no dead dependencies.

## 7. Gap & Overlap Analysis

| ID | Type | Severity | Description | Recommended Action |
| --- | --- | --- | --- | --- |
| G-1 | Ambiguous Owner | INFO | "Goods Receipt" appears as a transaction in MOD-004 (business document) and as an event in MOD-005 (stock ledger effect). Not ambiguous on inspection — MOD-004 owns the document, MOD-005 owns the ledger row. | No action. Confirmed as event-driven handoff. |
| G-2 | Ambiguous Owner | INFO | "Dispatch" appears in MOD-003 (business document) and MOD-019 (physical handover). Split is intentional: document vs. execution. | No action. |
| G-3 | Overlap | INFO | Warehouse Zone/Area (MOD-019) vs. Warehouse/Bin (MOD-005). MOD-019 PRD §5 explicitly declares overlay-not-replace. | No action. |
| G-4 | Missing Capability | MINOR | No module explicitly owns **Product Catalog / Sales-facing item presentation** (marketing images, long descriptions, channel-specific pricing UI). Currently absorbed by MOD-005 Item Master. | Follow-up: MOD-003 or a dedicated MOD to be evaluated in Phase 5 if e-commerce channels are in scope. Not blocking Wave 1. |
| G-5 | Missing Capability | MINOR | Cross-warehouse **Allocation / Reservation** engine is implicit in MOD-003 fulfilment and MOD-005 stock balance but not called out as a discrete capability. | Follow-up: clarify in MOD-005 next PRD revision that Stock Balance includes reservation state. Not blocking. |
| G-6 | Duplication | INFO | Both MOD-004 §8 (`GoodsReceived`) and MOD-005 §8 (`StockReceived`) publish events for the same physical action. Intentional — different consumers, different payload shapes. | No action. |
| G-7 | Sequencing | MAJOR | Recommended implementation order in prior planning docs is inconsistent with the declared dependency DAG (see F-1). | Adopt corrected sequence for Wave 1. |
| G-8 | Boundary Confirmation | INFO | Inventory (MOD-005) vs. Warehouse (MOD-019) split is well-defined: master data & ledger vs. physical execution & labor. | Ratify in ADR-007. |

## 8. Recommendations

1. **Confirm the current Inventory / Warehouse split as-is.** No PRD or Baseline changes required. Ratify via ADR-007.
2. **Adopt the corrected Wave 1 implementation sequence.** Insert MOD-005 Inventory ahead of Sales and Purchase in the SD authoring queue. Update `BUSINESS_OS_EXECUTION_ROADMAP.md` in a subsequent editorial pass (out of scope for this phase).
3. **Log G-4 and G-5 as follow-up work items** for Phase 5 or the next PRD revision cycle. Both are non-blocking clarifications.
4. **Proceed to Wave 1 Solution Design authoring** once ADR-007 is Accepted.

## 9. Follow-Up Work Items (not executed in this phase)

- FU-1 — Update Wave 1 SD authoring queue to `MOD-001 → MOD-002 → MOD-005 → {MOD-004, MOD-003} → MOD-019`.
- FU-2 — Evaluate need for a dedicated Product Catalog capability (G-4) during Phase 5 scope review.
- FU-3 — Add explicit "Reservation state" wording to MOD-005 Stock Balance description (G-5) in the next PRD editorial pass.

## 10. Verification Summary

Verified via companion report `PHASE4_5_VERIFICATION_20260720T040500Z.md`. Result: **16/16 PASS**. This report is authoritative and Phase 4.5 is complete pending ADR-007 acceptance.

## 11. References

- `docs/20-module-prds/{accounting,sales,purchase,inventory,warehouse}/MODULE_PRD.md`
- `docs/11-adrs/architecture/ADR-007-core-erp-module-boundaries.md`
- `docs/15-governance/FINDING_SEVERITY_STANDARD.md`
- `docs/50-audit-reports/PHASE4_SOLUTION_DESIGN_COMPLETION_PROGRAM_20260720T030000Z.md`
