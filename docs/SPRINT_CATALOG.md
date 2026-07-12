---
title: "Sprint Catalog"
summary: "Catalog of every Sprint PRD (SPR-MOD-NNN-NNN): stable identifier, iteration label, parent module, status, PRD path, and owner. Ships empty; populated iteratively in Pass 8.x."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-10"
tags: ["sprint", "catalog", "index"]
document_type: "Governance Guide"
---

# Sprint Catalog

> **Derived document.** Projection of `docs/30-sprint-prds/`. Authoritative sprint scope lives in each `SPR-MOD-NNN-NNN.md`. On any conflict, the Sprint PRD wins and this catalog is corrected in the same change.

## Purpose

The **Sprint Catalog** enumerates every Sprint PRD, keyed by its permanent `SPR-MOD-NNN-NNN` identifier. Rows link to the authoritative Sprint PRD file.

## How to Read

- **Sprint ID** — permanent identifier `SPR-MOD-NNN-NNN`. Never reassigned or reused.
- **Iteration** — human-readable schedule label (e.g. `Sprint 1`, `2026-Q3-S1`). MAY change without touching the Sprint ID.
- **Parent Module** — `MOD-NNN` — <module name>.
- **Status** — `Draft` \| `Planned` \| `In Progress` \| `Done` \| `Superseded`.
- **PRD** — link to the Sprint PRD file.
- **Owner** — sprint-owning team.

## Maintenance Note

This catalog SHOULD be regenerated or reviewed whenever a Sprint PRD is added, renamed, superseded, or transitions status. It MUST NOT become an independent source of truth.

## Catalog

| Sprint ID | Iteration | Parent Module | Status | PRD | Owner |
| --- | --- | --- | --- | --- | --- |
| SPR-MOD-001-001 | Sprint 1 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-001-tenancy-foundation.md`](30-sprint-prds/platform/SPR-MOD-001-001-tenancy-foundation.md) | Platform |
| SPR-MOD-001-002 | Sprint 2 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md`](30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md) | Platform |
| SPR-MOD-001-003 | Sprint 3 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-003-users-roles-permissions.md`](30-sprint-prds/platform/SPR-MOD-001-003-users-roles-permissions.md) | Platform |
| SPR-MOD-001-004 | Sprint 4 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-004-configuration-hierarchy.md`](30-sprint-prds/platform/SPR-MOD-001-004-configuration-hierarchy.md) | Platform |
| SPR-MOD-001-005 | Sprint 5 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-005-localization-packs.md`](30-sprint-prds/platform/SPR-MOD-001-005-localization-packs.md) | Platform |
| SPR-MOD-001-006 | Sprint 6 | MOD-001 Platform Administration | Done | [`30-sprint-prds/platform/SPR-MOD-001-006-audit-review-platform-administration.md`](30-sprint-prds/platform/SPR-MOD-001-006-audit-review-platform-administration.md) | Platform |
| SPR-MOD-002-001 | Sprint 1 | MOD-002 Accounting | Done | [`30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md`](30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md) | Accounting |
| SPR-MOD-002-002 | Sprint 2 | MOD-002 Accounting | Done | [`30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md`](30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md) | Accounting |
| SPR-MOD-002-003 | Sprint 3 | MOD-002 Accounting | Done | [`30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md`](30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md) | Accounting |
| SPR-MOD-002-004 | Sprint 4 | MOD-002 Accounting | Done | [`30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md`](30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md) | Accounting |
| SPR-MOD-002-005 | Sprint 5 | MOD-002 Accounting | Done | [`30-sprint-prds/accounting/SPR-MOD-002-005-taxation-compliance-foundation.md`](30-sprint-prds/accounting/SPR-MOD-002-005-taxation-compliance-foundation.md) | Accounting |
| SPR-MOD-002-006 | Sprint 6 | MOD-002 Accounting | Done | [`30-sprint-prds/accounting/SPR-MOD-002-006-period-close-audit.md`](30-sprint-prds/accounting/SPR-MOD-002-006-period-close-audit.md) | Accounting |
| SPR-MOD-003-001 | Sprint 1 | MOD-003 Sales | Done | [`30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md`](30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md) | Sales |
| SPR-MOD-003-002 | Sprint 2 | MOD-003 Sales | Done | [`30-sprint-prds/sales/SPR-MOD-003-002-quotations-sales-orders.md`](30-sprint-prds/sales/SPR-MOD-003-002-quotations-sales-orders.md) | Sales |
| SPR-MOD-003-003 | Sprint 3 | MOD-003 Sales | Done | [`30-sprint-prds/sales/SPR-MOD-003-003-delivery-fulfillment.md`](30-sprint-prds/sales/SPR-MOD-003-003-delivery-fulfillment.md) | Sales |
| SPR-MOD-003-004 | Sprint 4 | MOD-003 Sales | Done | [`30-sprint-prds/sales/SPR-MOD-003-004-sales-invoicing.md`](30-sprint-prds/sales/SPR-MOD-003-004-sales-invoicing.md) | Sales |
| SPR-MOD-003-005 | Sprint 5 | MOD-003 Sales | Done | [`30-sprint-prds/sales/SPR-MOD-003-005-returns-customer-adjustments.md`](30-sprint-prds/sales/SPR-MOD-003-005-returns-customer-adjustments.md) | Sales |
| SPR-MOD-003-006 | Sprint 6 | MOD-003 Sales | Done | [`30-sprint-prds/sales/SPR-MOD-003-006-sales-analytics-controls.md`](30-sprint-prds/sales/SPR-MOD-003-006-sales-analytics-controls.md) | Sales |
| SPR-MOD-004-001 | Sprint 1 | MOD-004 Purchase | Done | [`30-sprint-prds/purchase/SPR-MOD-004-001-purchase-foundation.md`](30-sprint-prds/purchase/SPR-MOD-004-001-purchase-foundation.md) | Procurement |
| SPR-MOD-004-002 | Sprint 2 | MOD-004 Purchase | Done | [`30-sprint-prds/purchase/SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md`](30-sprint-prds/purchase/SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md) | Procurement |
| SPR-MOD-004-003 | Sprint 3 | MOD-004 Purchase | Done | [`30-sprint-prds/purchase/SPR-MOD-004-003-goods-receipt-inspection.md`](30-sprint-prds/purchase/SPR-MOD-004-003-goods-receipt-inspection.md) | Procurement |
| SPR-MOD-004-004 | Sprint 4 | MOD-004 Purchase | Done | [`30-sprint-prds/purchase/SPR-MOD-004-004-vendor-billing-3-way-match.md`](30-sprint-prds/purchase/SPR-MOD-004-004-vendor-billing-3-way-match.md) | Procurement |
| SPR-MOD-004-005 | Sprint 5 | MOD-004 Purchase | Done | [`30-sprint-prds/purchase/SPR-MOD-004-005-purchase-returns-vendor-adjustments.md`](30-sprint-prds/purchase/SPR-MOD-004-005-purchase-returns-vendor-adjustments.md) | Procurement |
| SPR-MOD-004-006 | Sprint 6 | MOD-004 Purchase | Done | [`30-sprint-prds/purchase/SPR-MOD-004-006-purchase-analytics-controls.md`](30-sprint-prds/purchase/SPR-MOD-004-006-purchase-analytics-controls.md) | Procurement |
| SPR-MOD-005-001 | Sprint 1 | MOD-005 Inventory | Draft | [`30-sprint-prds/inventory/SPR-MOD-005-001-inventory-foundation.md`](30-sprint-prds/inventory/SPR-MOD-005-001-inventory-foundation.md) | Inventory |
| SPR-MOD-005-002 | Sprint 2 | MOD-005 Inventory | Draft | [`30-sprint-prds/inventory/SPR-MOD-005-002-inventory-receipts-putaway.md`](30-sprint-prds/inventory/SPR-MOD-005-002-inventory-receipts-putaway.md) | Inventory |
| SPR-MOD-005-003 | Sprint 3 | MOD-005 Inventory | Draft | [`30-sprint-prds/inventory/SPR-MOD-005-003-inventory-issues-transfers-reservations.md`](30-sprint-prds/inventory/SPR-MOD-005-003-inventory-issues-transfers-reservations.md) | Inventory |
| SPR-MOD-005-004 | Sprint 4 | MOD-005 Inventory | Draft | [`30-sprint-prds/inventory/SPR-MOD-005-004-inventory-adjustments-stock-counting.md`](30-sprint-prds/inventory/SPR-MOD-005-004-inventory-adjustments-stock-counting.md) | Inventory |
| SPR-MOD-005-005 | Sprint 5 | MOD-005 Inventory | Draft | [`30-sprint-prds/inventory/SPR-MOD-005-005-inventory-valuation-replenishment.md`](30-sprint-prds/inventory/SPR-MOD-005-005-inventory-valuation-replenishment.md) | Inventory |
| SPR-MOD-005-006 | Sprint 6 | MOD-005 Inventory | Draft | [`30-sprint-prds/inventory/SPR-MOD-005-006-inventory-analytics-operational-controls.md`](30-sprint-prds/inventory/SPR-MOD-005-006-inventory-analytics-operational-controls.md) | Inventory |
| SPR-MOD-019-001 | Sprint 1 | MOD-019 Warehouse | Draft | [`30-sprint-prds/warehouse/SPR-MOD-019-001-warehouse-foundation.md`](30-sprint-prds/warehouse/SPR-MOD-019-001-warehouse-foundation.md) | Operations |
| SPR-MOD-019-002 | Sprint 2 | MOD-019 Warehouse | Draft | [`30-sprint-prds/warehouse/SPR-MOD-019-002-inbound-execution.md`](30-sprint-prds/warehouse/SPR-MOD-019-002-inbound-execution.md) | Operations |
| SPR-MOD-019-003 | Sprint 3 | MOD-019 Warehouse | Draft | [`30-sprint-prds/warehouse/SPR-MOD-019-003-storage-slotting.md`](30-sprint-prds/warehouse/SPR-MOD-019-003-storage-slotting.md) | Operations |
| SPR-MOD-019-004 | Sprint 4 | MOD-019 Warehouse | Draft | [`30-sprint-prds/warehouse/SPR-MOD-019-004-outbound-execution.md`](30-sprint-prds/warehouse/SPR-MOD-019-004-outbound-execution.md) | Operations |
| SPR-MOD-019-005 | Sprint 5 | MOD-019 Warehouse | Draft | [`30-sprint-prds/warehouse/SPR-MOD-019-005-yard-dock-load-out.md`](30-sprint-prds/warehouse/SPR-MOD-019-005-yard-dock-load-out.md) | Operations |
| SPR-MOD-019-006 | Sprint 6 | MOD-019 Warehouse | Draft | [`30-sprint-prds/warehouse/SPR-MOD-019-006-warehouse-labor-equipment-analytics.md`](30-sprint-prds/warehouse/SPR-MOD-019-006-warehouse-labor-equipment-analytics.md) | Operations |

Sprint PRDs are authored iteratively in Pass 8.x. Each new sprint MUST be registered here and in its module subfolder README under `docs/30-sprint-prds/<module>/README.md`.

## References

- `docs/30-sprint-prds/README.md`
- `docs/MODULE_CATALOG.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/99-templates/sprint-prd-template.md`
