---
title: "Sprint Catalog"
summary: "Catalog of every Sprint PRD (SPR-MOD-NNN-NNN): stable identifier, iteration label, parent module, status, PRD path, and owner. Ships empty; populated iteratively in Pass 8.x."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-17"
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
| SPR-MOD-006-001 | Sprint 1 | MOD-006 CRM | Draft | [`30-sprint-prds/crm/SPR-MOD-006-001-crm-foundation.md`](30-sprint-prds/crm/SPR-MOD-006-001-crm-foundation.md) | Revenue |
| SPR-MOD-006-002 | Sprint 2 | MOD-006 CRM | Draft | [`30-sprint-prds/crm/SPR-MOD-006-002-leads.md`](30-sprint-prds/crm/SPR-MOD-006-002-leads.md) | Revenue |
| SPR-MOD-006-003 | Sprint 3 | MOD-006 CRM | Draft | [`30-sprint-prds/crm/SPR-MOD-006-003-opportunities.md`](30-sprint-prds/crm/SPR-MOD-006-003-opportunities.md) | Revenue |
| SPR-MOD-006-004 | Sprint 4 | MOD-006 CRM | Draft | [`30-sprint-prds/crm/SPR-MOD-006-004-activities-communications.md`](30-sprint-prds/crm/SPR-MOD-006-004-activities-communications.md) | Revenue |
| SPR-MOD-006-005 | Sprint 5 | MOD-006 CRM | Draft | [`30-sprint-prds/crm/SPR-MOD-006-005-campaigns.md`](30-sprint-prds/crm/SPR-MOD-006-005-campaigns.md) | Revenue |
| SPR-MOD-006-006 | Sprint 6 | MOD-006 CRM | Draft | [`30-sprint-prds/crm/SPR-MOD-006-006-customer-360-analytics.md`](30-sprint-prds/crm/SPR-MOD-006-006-customer-360-analytics.md) | Revenue |
| SPR-MOD-007-001 | Sprint 1 | MOD-007 HRMS | Draft | [`30-sprint-prds/hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md`](30-sprint-prds/hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md) | People |
| SPR-MOD-007-002 | Sprint 2 | MOD-007 HRMS | Draft | [`30-sprint-prds/hrms/SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md`](30-sprint-prds/hrms/SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md) | People |
| SPR-MOD-007-003 | Sprint 3 | MOD-007 HRMS | Draft | [`30-sprint-prds/hrms/SPR-MOD-007-003-attendance-and-leave.md`](30-sprint-prds/hrms/SPR-MOD-007-003-attendance-and-leave.md) | People |
| SPR-MOD-007-004 | Sprint 4 | MOD-007 HRMS | Draft | [`30-sprint-prds/hrms/SPR-MOD-007-004-performance-and-appraisal.md`](30-sprint-prds/hrms/SPR-MOD-007-004-performance-and-appraisal.md) | People |
| SPR-MOD-007-005 | Sprint 5 | MOD-007 HRMS | Draft | [`30-sprint-prds/hrms/SPR-MOD-007-005-learning-development-and-self-service.md`](30-sprint-prds/hrms/SPR-MOD-007-005-learning-development-and-self-service.md) | People |
| SPR-MOD-007-006 | Sprint 6 | MOD-007 HRMS | Draft | [`30-sprint-prds/hrms/SPR-MOD-007-006-hr-analytics-and-compliance.md`](30-sprint-prds/hrms/SPR-MOD-007-006-hr-analytics-and-compliance.md) | People |
| SPR-MOD-008-001 | Sprint 1 | MOD-008 Payroll | Draft | [`30-sprint-prds/payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md`](30-sprint-prds/payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md) | People |
| SPR-MOD-008-002 | Sprint 2 | MOD-008 Payroll | Draft | [`30-sprint-prds/payroll/SPR-MOD-008-002-payroll-cycles-and-runs.md`](30-sprint-prds/payroll/SPR-MOD-008-002-payroll-cycles-and-runs.md) | People |
| SPR-MOD-008-003 | Sprint 3 | MOD-008 Payroll | Draft | [`30-sprint-prds/payroll/SPR-MOD-008-003-statutory-computations.md`](30-sprint-prds/payroll/SPR-MOD-008-003-statutory-computations.md) | People |
| SPR-MOD-008-004 | Sprint 4 | MOD-008 Payroll | Draft | [`30-sprint-prds/payroll/SPR-MOD-008-004-reimbursements-and-advances.md`](30-sprint-prds/payroll/SPR-MOD-008-004-reimbursements-and-advances.md) | People |
| SPR-MOD-008-005 | Sprint 5 | MOD-008 Payroll | Draft | [`30-sprint-prds/payroll/SPR-MOD-008-005-payslip-generation-and-disbursement.md`](30-sprint-prds/payroll/SPR-MOD-008-005-payslip-generation-and-disbursement.md) | People |
| SPR-MOD-008-006 | Sprint 6 | MOD-008 Payroll | Draft | [`30-sprint-prds/payroll/SPR-MOD-008-006-payroll-analytics-and-compliance.md`](30-sprint-prds/payroll/SPR-MOD-008-006-payroll-analytics-and-compliance.md) | People |
| SPR-MOD-009-001 | Sprint 1 | MOD-009 Manufacturing | Draft | [`30-sprint-prds/manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md`](30-sprint-prds/manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md) | Operations |
| SPR-MOD-009-002 | Sprint 2 | MOD-009 Manufacturing | Draft | [`30-sprint-prds/manufacturing/SPR-MOD-009-002-production-planning-and-scheduling.md`](30-sprint-prds/manufacturing/SPR-MOD-009-002-production-planning-and-scheduling.md) | Operations |
| SPR-MOD-009-003 | Sprint 3 | MOD-009 Manufacturing | Draft | [`30-sprint-prds/manufacturing/SPR-MOD-009-003-work-orders-and-shopfloor-execution.md`](30-sprint-prds/manufacturing/SPR-MOD-009-003-work-orders-and-shopfloor-execution.md) | Operations |
| SPR-MOD-009-004 | Sprint 4 | MOD-009 Manufacturing | Draft | [`30-sprint-prds/manufacturing/SPR-MOD-009-004-sub-contracting.md`](30-sprint-prds/manufacturing/SPR-MOD-009-004-sub-contracting.md) | Operations |
| SPR-MOD-009-005 | Sprint 5 | MOD-009 Manufacturing | Draft | [`30-sprint-prds/manufacturing/SPR-MOD-009-005-quality-yield-and-scrap.md`](30-sprint-prds/manufacturing/SPR-MOD-009-005-quality-yield-and-scrap.md) | Operations |
| SPR-MOD-009-006 | Sprint 6 | MOD-009 Manufacturing | Draft | [`30-sprint-prds/manufacturing/SPR-MOD-009-006-manufacturing-analytics-and-compliance.md`](30-sprint-prds/manufacturing/SPR-MOD-009-006-manufacturing-analytics-and-compliance.md) | Operations |
| SPR-MOD-010-001 | Sprint 1 | MOD-010 Projects | Draft | [`30-sprint-prds/projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md`](30-sprint-prds/projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md) | Delivery |
| SPR-MOD-010-002 | Sprint 2 | MOD-010 Projects | Draft | [`30-sprint-prds/projects/SPR-MOD-010-002-tasks-milestones-and-change-requests.md`](30-sprint-prds/projects/SPR-MOD-010-002-tasks-milestones-and-change-requests.md) | Delivery |
| SPR-MOD-010-003 | Sprint 3 | MOD-010 Projects | Draft | [`30-sprint-prds/projects/SPR-MOD-010-003-timesheets-and-effort.md`](30-sprint-prds/projects/SPR-MOD-010-003-timesheets-and-effort.md) | Delivery |
| SPR-MOD-010-004 | Sprint 4 | MOD-010 Projects | Draft | [`30-sprint-prds/projects/SPR-MOD-010-004-budgets-costs-and-project-billing.md`](30-sprint-prds/projects/SPR-MOD-010-004-budgets-costs-and-project-billing.md) | Delivery |
| SPR-MOD-010-005 | Sprint 5 | MOD-010 Projects | Draft | [`30-sprint-prds/projects/SPR-MOD-010-005-projects-analytics-and-compliance.md`](30-sprint-prds/projects/SPR-MOD-010-005-projects-analytics-and-compliance.md) | Delivery |
| SPR-MOD-011-001 | Sprint 1 | MOD-011 AMC | Draft | [`30-sprint-prds/amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md`](30-sprint-prds/amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md) | Service |
| SPR-MOD-011-002 | Sprint 2 | MOD-011 AMC | Draft | [`30-sprint-prds/amc/SPR-MOD-011-002-preventive-visit-scheduling.md`](30-sprint-prds/amc/SPR-MOD-011-002-preventive-visit-scheduling.md) | Service |
| SPR-MOD-011-003 | Sprint 3 | MOD-011 AMC | Draft | [`30-sprint-prds/amc/SPR-MOD-011-003-contract-billing-and-renewals.md`](30-sprint-prds/amc/SPR-MOD-011-003-contract-billing-and-renewals.md) | Service |
| SPR-MOD-011-004 | Sprint 4 | MOD-011 AMC | Draft | [`30-sprint-prds/amc/SPR-MOD-011-004-amc-analytics-and-compliance.md`](30-sprint-prds/amc/SPR-MOD-011-004-amc-analytics-and-compliance.md) | Service |
| SPR-MOD-012-001 | Sprint 1 | MOD-012 Field Service | Draft | [`30-sprint-prds/field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md`](30-sprint-prds/field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md) | Service |
| SPR-MOD-012-002 | Sprint 2 | MOD-012 Field Service | Draft | [`30-sprint-prds/field-service/SPR-MOD-012-002-dispatch-and-scheduling.md`](30-sprint-prds/field-service/SPR-MOD-012-002-dispatch-and-scheduling.md) | Service |
| SPR-MOD-012-003 | Sprint 3 | MOD-012 Field Service | Draft | [`30-sprint-prds/field-service/SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md`](30-sprint-prds/field-service/SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md) | Service |
| SPR-MOD-012-004 | Sprint 4 | MOD-012 Field Service | Draft | [`30-sprint-prds/field-service/SPR-MOD-012-004-sla-and-escalation.md`](30-sprint-prds/field-service/SPR-MOD-012-004-sla-and-escalation.md) | Service |
| SPR-MOD-012-005 | Sprint 5 | MOD-012 Field Service | Draft | [`30-sprint-prds/field-service/SPR-MOD-012-005-field-service-analytics-and-compliance.md`](30-sprint-prds/field-service/SPR-MOD-012-005-field-service-analytics-and-compliance.md) | Service |
| SPR-MOD-013-001 | Sprint 1 | MOD-013 Assets | Draft | [`30-sprint-prds/assets/SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md`](30-sprint-prds/assets/SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md) | Operations |
| SPR-MOD-013-002 | Sprint 2 | MOD-013 Assets | Draft | [`30-sprint-prds/assets/SPR-MOD-013-002-depreciation-methods-and-runs.md`](30-sprint-prds/assets/SPR-MOD-013-002-depreciation-methods-and-runs.md) | Operations |
| SPR-MOD-013-003 | Sprint 3 | MOD-013 Assets | Draft | [`30-sprint-prds/assets/SPR-MOD-013-003-maintenance-transfer-and-disposal.md`](30-sprint-prds/assets/SPR-MOD-013-003-maintenance-transfer-and-disposal.md) | Operations |
| SPR-MOD-013-004 | Sprint 4 | MOD-013 Assets | Draft | [`30-sprint-prds/assets/SPR-MOD-013-004-assets-analytics-and-compliance.md`](30-sprint-prds/assets/SPR-MOD-013-004-assets-analytics-and-compliance.md) | Operations |
| SPR-MOD-014-001 | Sprint 1 | MOD-014 Fleet | Draft | [`30-sprint-prds/fleet/SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md`](30-sprint-prds/fleet/SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md) | Operations |
| SPR-MOD-014-002 | Sprint 2 | MOD-014 Fleet | Draft | [`30-sprint-prds/fleet/SPR-MOD-014-002-trip-planning-and-execution.md`](30-sprint-prds/fleet/SPR-MOD-014-002-trip-planning-and-execution.md) | Operations |
| SPR-MOD-014-003 | Sprint 3 | MOD-014 Fleet | Draft | [`30-sprint-prds/fleet/SPR-MOD-014-003-fuel-and-maintenance.md`](30-sprint-prds/fleet/SPR-MOD-014-003-fuel-and-maintenance.md) | Operations |
| SPR-MOD-014-004 | Sprint 4 | MOD-014 Fleet | Draft | [`30-sprint-prds/fleet/SPR-MOD-014-004-fleet-analytics-and-compliance.md`](30-sprint-prds/fleet/SPR-MOD-014-004-fleet-analytics-and-compliance.md) | Operations |
| SPR-MOD-015-001 | Sprint 1 | MOD-015 POS | Draft | [`30-sprint-prds/pos/SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md`](30-sprint-prds/pos/SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md) | Revenue |
| SPR-MOD-015-002 | Sprint 2 | MOD-015 POS | Draft | [`30-sprint-prds/pos/SPR-MOD-015-002-cart-pricing-discounts-and-offline-sale.md`](30-sprint-prds/pos/SPR-MOD-015-002-cart-pricing-discounts-and-offline-sale.md) | Revenue |
| SPR-MOD-015-003 | Sprint 3 | MOD-015 POS | Draft | [`30-sprint-prds/pos/SPR-MOD-015-003-multi-tender-payments-and-receipts.md`](30-sprint-prds/pos/SPR-MOD-015-003-multi-tender-payments-and-receipts.md) | Revenue |
| SPR-MOD-015-004 | Sprint 4 | MOD-015 POS | Draft | [`30-sprint-prds/pos/SPR-MOD-015-004-offers-loyalty-and-returns.md`](30-sprint-prds/pos/SPR-MOD-015-004-offers-loyalty-and-returns.md) | Revenue |
| SPR-MOD-015-005 | Sprint 5 | MOD-015 POS | Draft | [`30-sprint-prds/pos/SPR-MOD-015-005-day-close-analytics-and-compliance.md`](30-sprint-prds/pos/SPR-MOD-015-005-day-close-analytics-and-compliance.md) | Revenue |
| SPR-MOD-016-001 | Sprint 1 | MOD-016 Service Desk | Draft | [`30-sprint-prds/service-desk/sprints/SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md`](30-sprint-prds/service-desk/sprints/SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md) | Service |
| SPR-MOD-016-002 | Sprint 2 | MOD-016 Service Desk | Draft | [`30-sprint-prds/service-desk/sprints/SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md`](30-sprint-prds/service-desk/sprints/SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md) | Service |
| SPR-MOD-016-003 | Sprint 3 | MOD-016 Service Desk | Draft | [`30-sprint-prds/service-desk/sprints/SPR-MOD-016-003_SLA_ENFORCEMENT_AND_ESCALATIONS.md`](30-sprint-prds/service-desk/sprints/SPR-MOD-016-003_SLA_ENFORCEMENT_AND_ESCALATIONS.md) | Service |
| SPR-MOD-016-004 | Sprint 4 | MOD-016 Service Desk | Draft | [`30-sprint-prds/service-desk/sprints/SPR-MOD-016-004_KNOWLEDGE_BASE_MACROS_AND_CSAT.md`](30-sprint-prds/service-desk/sprints/SPR-MOD-016-004_KNOWLEDGE_BASE_MACROS_AND_CSAT.md) | Service |
| SPR-MOD-016-005 | Sprint 5 | MOD-016 Service Desk | Draft | [`30-sprint-prds/service-desk/sprints/SPR-MOD-016-005_SERVICE_ANALYTICS_AND_COMPLIANCE.md`](30-sprint-prds/service-desk/sprints/SPR-MOD-016-005_SERVICE_ANALYTICS_AND_COMPLIANCE.md) | Service |
| SPR-MOD-017-001 | Sprint 1 | MOD-017 Analytics | Draft | [`30-sprint-prds/analytics/sprints/SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md`](30-sprint-prds/analytics/sprints/SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md) | Insights |
| SPR-MOD-017-002 | Sprint 2 | MOD-017 Analytics | Draft | [`30-sprint-prds/analytics/sprints/SPR-MOD-017-002_KPI_FRAMEWORK_AND_METRIC_CATALOG.md`](30-sprint-prds/analytics/sprints/SPR-MOD-017-002_KPI_FRAMEWORK_AND_METRIC_CATALOG.md) | Insights |
| SPR-MOD-017-003 | Sprint 3 | MOD-017 Analytics | Draft | [`30-sprint-prds/analytics/sprints/SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md`](30-sprint-prds/analytics/sprints/SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md) | Insights |
| SPR-MOD-017-004 | Sprint 4 | MOD-017 Analytics | Draft | [`30-sprint-prds/analytics/sprints/SPR-MOD-017-004_SCHEDULED_DISTRIBUTION_REPORTING_AND_EXPORT.md`](30-sprint-prds/analytics/sprints/SPR-MOD-017-004_SCHEDULED_DISTRIBUTION_REPORTING_AND_EXPORT.md) | Insights |
| SPR-MOD-017-005 | Sprint 5 | MOD-017 Analytics | Draft | [`30-sprint-prds/analytics/sprints/SPR-MOD-017-005_ANALYTICAL_MODELS_AND_CROSS_MODULE_ANALYTICS.md`](30-sprint-prds/analytics/sprints/SPR-MOD-017-005_ANALYTICAL_MODELS_AND_CROSS_MODULE_ANALYTICS.md) | Insights |
| SPR-MOD-018-001 | Sprint 1 | MOD-018 AI Workspace | Draft | [`30-sprint-prds/ai/sprints/SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md`](30-sprint-prds/ai/sprints/SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md) | AI Platform |
| SPR-MOD-018-002 | Sprint 2 | MOD-018 AI Workspace | Draft | [`30-sprint-prds/ai/sprints/SPR-MOD-018-002_RETRIEVAL_WORKSPACES_RAG.md`](30-sprint-prds/ai/sprints/SPR-MOD-018-002_RETRIEVAL_WORKSPACES_RAG.md) | AI Platform |
| SPR-MOD-018-003 | Sprint 3 | MOD-018 AI Workspace | Draft | [`30-sprint-prds/ai/sprints/SPR-MOD-018-003_TOOL_CALLING_ON_MODULE_CAPABILITIES.md`](30-sprint-prds/ai/sprints/SPR-MOD-018-003_TOOL_CALLING_ON_MODULE_CAPABILITIES.md) | AI Platform |
| SPR-MOD-018-004 | Sprint 4 | MOD-018 AI Workspace | Draft | [`30-sprint-prds/ai/sprints/SPR-MOD-018-004_COPILOT_SURFACES_AND_CONVERSATIONS.md`](30-sprint-prds/ai/sprints/SPR-MOD-018-004_COPILOT_SURFACES_AND_CONVERSATIONS.md) | AI Platform |





Sprint PRDs are authored iteratively in Pass 8.x. Each new sprint MUST be registered here and in its module subfolder README under `docs/30-sprint-prds/<module>/README.md`.

## References

- `docs/30-sprint-prds/README.md`
- `docs/MODULE_CATALOG.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/99-templates/sprint-prd-template.md`
