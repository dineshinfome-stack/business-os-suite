---
title: "Module Catalog"
summary: "Catalog of every BusinessOS module (MOD-001..MOD-018): stable identifier, status, primary domain, PRD path, and planned owner."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["modules", "catalog", "index"]
document_type: "Governance Guide"
---

# Module Catalog

> **Derived document.** Projection of `docs/20-module-prds/`. Authoritative module behavior lives in each `MODULE_PRD.md`. On any conflict, the Module PRD wins and this catalog is corrected in the same change.

## Purpose

The **Module Catalog** enumerates every BusinessOS module or bounded context, keyed by its permanent `MOD-NNN` identifier. Rows link to the authoritative Module PRD.

## How to Read

- **Module ID** — permanent identifier of the form `MOD-NNN`. Never reassigned or reused.
- **Module Name** — human-readable name (may evolve; the ID does not).
- **Status** — `Planned` before the PRD lands, `Authored` after.
- **Primary Domain** — the business domain the module owns.
- **PRD Path** — link to the module's `MODULE_PRD.md`.
- **Engine Dependencies** — see Section 12 of the PRD (authoritative).
- **Owner** — the owning team.

## Maintenance Note

This catalog SHOULD be regenerated or reviewed whenever a Module PRD is added, renamed, superseded, or its scope changes. It MUST NOT become an independent source of truth.

## Catalog

| Module ID | Module Name | Status | Primary Domain | PRD | Engine Dependencies | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| MOD-001 | Platform Administration | Authored | Platform | [`docs/20-module-prds/platform/MODULE_PRD.md`](./20-module-prds/platform/MODULE_PRD.md) | See Section 12 of the PRD | Platform |
| MOD-002 | Accounting | Authored | Finance | [`docs/20-module-prds/accounting/MODULE_PRD.md`](./20-module-prds/accounting/MODULE_PRD.md) | See Section 12 of the PRD | Finance |
| MOD-003 | Sales | Authored | Revenue | [`docs/20-module-prds/sales/MODULE_PRD.md`](./20-module-prds/sales/MODULE_PRD.md) | See Section 12 of the PRD | Revenue |
| MOD-004 | Purchase | Authored | Procurement | [`docs/20-module-prds/purchase/MODULE_PRD.md`](./20-module-prds/purchase/MODULE_PRD.md) | See Section 12 of the PRD | Procurement |
| MOD-005 | Inventory | Authored | Supply Chain | [`docs/20-module-prds/inventory/MODULE_PRD.md`](./20-module-prds/inventory/MODULE_PRD.md) | See Section 12 of the PRD | Supply Chain |
| MOD-006 | CRM | Authored | Customer | [`docs/20-module-prds/crm/MODULE_PRD.md`](./20-module-prds/crm/MODULE_PRD.md) | See Section 12 of the PRD | Revenue |
| MOD-007 | HRMS | Authored | People | [`docs/20-module-prds/hrms/MODULE_PRD.md`](./20-module-prds/hrms/MODULE_PRD.md) | See Section 12 of the PRD | People |
| MOD-008 | Payroll | Authored | People | [`docs/20-module-prds/payroll/MODULE_PRD.md`](./20-module-prds/payroll/MODULE_PRD.md) | See Section 12 of the PRD | People |
| MOD-009 | Manufacturing | Authored | Operations | [`docs/20-module-prds/manufacturing/MODULE_PRD.md`](./20-module-prds/manufacturing/MODULE_PRD.md) | See Section 12 of the PRD | Operations |
| MOD-010 | Projects | Authored | Delivery | [`docs/20-module-prds/projects/MODULE_PRD.md`](./20-module-prds/projects/MODULE_PRD.md) | See Section 12 of the PRD | Delivery |
| MOD-011 | AMC | Authored | Service | [`docs/20-module-prds/amc/MODULE_PRD.md`](./20-module-prds/amc/MODULE_PRD.md) | See Section 12 of the PRD | Service |
| MOD-012 | Field Service | Authored | Service | [`docs/20-module-prds/field-service/MODULE_PRD.md`](./20-module-prds/field-service/MODULE_PRD.md) | See Section 12 of the PRD | Service |
| MOD-013 | Assets | Authored | Operations | [`docs/20-module-prds/assets/MODULE_PRD.md`](./20-module-prds/assets/MODULE_PRD.md) | See Section 12 of the PRD | Operations |
| MOD-014 | Fleet | Authored | Operations | [`docs/20-module-prds/fleet/MODULE_PRD.md`](./20-module-prds/fleet/MODULE_PRD.md) | See Section 12 of the PRD | Operations |
| MOD-015 | POS | Authored | Revenue | [`docs/20-module-prds/pos/MODULE_PRD.md`](./20-module-prds/pos/MODULE_PRD.md) | See Section 12 of the PRD | Revenue |
| MOD-016 | Service Desk | Authored | Service | [`docs/20-module-prds/service-desk/MODULE_PRD.md`](./20-module-prds/service-desk/MODULE_PRD.md) | See Section 12 of the PRD | Service |
| MOD-017 | Analytics | Authored | Insights | [`docs/20-module-prds/analytics/MODULE_PRD.md`](./20-module-prds/analytics/MODULE_PRD.md) | See Section 12 of the PRD | Insights |
| MOD-018 | AI Workspace | Authored | AI | [`docs/20-module-prds/ai/MODULE_PRD.md`](./20-module-prds/ai/MODULE_PRD.md) | See Section 12 of the PRD | AI Platform |

## References

- `docs/20-module-prds/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/ENGINE_USAGE_MATRIX.md`
- `docs/DOCUMENT_TRACEABILITY.md`
- `docs/99-templates/module-prd-template.md`
