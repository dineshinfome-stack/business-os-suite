---
title: "WEB-005 — Inventory Web Solution Design Specification"
summary: "Web solution design for MOD-005 Inventory: item master, warehouse/bin master, stock ledger, transactions, valuation, and physical verification."
layer: "design"
owner: "Supply Chain"
status: "approved"
updated: "2026-07-20"
spec_id: "WEB-005"
module_id: "MOD-005"
platform: "web"
depends_on: ["docs/20-module-prds/inventory/MODULE_PRD.md", "docs/11-adrs/architecture/ADR-007-core-erp-module-boundaries.md"]
tags: ["solution-design", "web", "inventory"]
document_type: "Solution Design"
---

# WEB-005 — Inventory Web Solution Design Specification

## 1. Purpose

Web surface for MOD-005 Inventory. Delivers the authoritative UI for Item Master, Warehouse/Bin Master, Stock Ledger, Stock Transactions, Physical Verification, Valuation, and Reservation, as the system of record consumed by MOD-003, MOD-004, and MOD-019.

## 2. Scope

**In scope.** Web (desktop-first, responsive) screens for all MOD-005 capabilities enumerated in the PRD §2.

**Out of scope.** Physical execution UI (owned by MOD-019 web spec), GL posting UI (owned by MOD-002), procurement/sales transaction UI (owned by MOD-004/MOD-003).

## 3. Personas

Warehouse Manager, Stores Officer, Inventory Controller, Accountant (read), Auditor (read).

## 4. Screen Inventory

| # | Screen | Path | Primary Persona |
| --- | --- | --- | --- |
| 1 | Inventory Home / KPIs | `/inventory` | Inventory Controller |
| 2 | Item List | `/inventory/items` | Inventory Controller |
| 3 | Item Detail / Master Form | `/inventory/items/:id` | Inventory Controller |
| 4 | Item Category Tree | `/inventory/categories` | Inventory Controller |
| 5 | UoM Registry | `/inventory/uom` | Inventory Controller |
| 6 | Warehouse List | `/inventory/warehouses` | Warehouse Manager |
| 7 | Warehouse Detail | `/inventory/warehouses/:id` | Warehouse Manager |
| 8 | Bin / Location Tree | `/inventory/warehouses/:id/bins` | Warehouse Manager |
| 9 | Stock Balance Explorer | `/inventory/stock` | Inventory Controller |
| 10 | Stock Ledger (append-only ledger view) | `/inventory/ledger` | Auditor |
| 11 | Stock Receipt (transaction) | `/inventory/receipts` (list) + `/inventory/receipts/:id` | Stores Officer |
| 12 | Stock Issue | `/inventory/issues` + `/:id` | Stores Officer |
| 13 | Stock Transfer | `/inventory/transfers` + `/:id` | Stores Officer |
| 14 | Stock Adjustment | `/inventory/adjustments` + `/:id` | Inventory Controller |
| 15 | Physical Count Session | `/inventory/counts` + `/:id` | Inventory Controller |
| 16 | Reservation Console | `/inventory/reservations` | Inventory Controller |
| 17 | Valuation Dashboard | `/inventory/valuation` | Accountant |
| 18 | Reorder / Replenishment Console | `/inventory/reorder` | Inventory Controller |
| 19 | Import / Export (Items, Balances) | `/inventory/import-export` | Inventory Controller |
| 20 | Configuration | `/inventory/settings` | Inventory Controller |

## 5. Interaction Model

- Master forms follow the Master Form UI Component pattern.
- Transactional forms follow the Voucher Grid + Header pattern with approval timeline.
- List views use the Data Grid with saved filters and column presets.
- Ledger views are strictly read-only, append-only, with immutability indicators.

## 6. Data Contracts (consumed / produced)

- Consumes: MOD-001 Tenant/Company/Branch/User, MOD-002 Chart of Accounts (for variance accounts).
- Produces: all Item, Warehouse, Bin, Stock Balance, Ledger, Transaction records.
- Emits (via API): events per MOD-005 PRD §8.

## 7. Business Rules Surfaced in UI

- Negative-stock policy: per-warehouse toggle; UI hides Save when disallowed.
- Adjustment approval threshold: banner shows required approver level.
- Physical-count variance: banner shows target variance account and posting summary before finalize.

## 8. Design Constraints

- Follows `docs/03-design/ui-ux-design-system.md` and Repository Navigation Standard v1.1.
- Data grid density: comfortable default; compact for ledger; regulatory forms locked to comfortable.
- All state-changing actions produce audit records via ENG-004.

## 9. Accessibility & Localization

WCAG 2.1 AA per ADR-081. Localization via ENG-006; UoM and valuation formats respect locale.

## 10. Traceability

- PRD requirements: MOD-005 PRD §§2, 5, 6, 8, 9, 10.
- Baseline: `MOD005_INVENTORY_BASELINE_v1`.
- ADRs: ADR-007, ADR-011, ADR-014, ADR-032.
- Cross-module: consumers WEB-003 (Sales), WEB-004 (Purchase), WEB-019 (Warehouse); provider MOD-001.

## 11. Acceptance Criteria

- All 20 screens specified with route, primary persona, and interaction pattern.
- Every state-changing screen names its emitted event.
- Every screen cites its PRD section.
- No UI redefines contracts owned by other modules.

## 12. References

- `docs/20-module-prds/inventory/MODULE_PRD.md`
- `docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`
- `docs/11-adrs/architecture/ADR-007-core-erp-module-boundaries.md`
