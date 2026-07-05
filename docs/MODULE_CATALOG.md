---
title: "Module Catalog"
summary: "Placeholder catalog of every planned BusinessOS module or bounded context currently in scope. Planning metadata only; PRDs land in Pass 7+."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["modules", "catalog", "index"]
document_type: "Governance Guide"
---

# Module Catalog

> **Derived document.** Planning metadata only. Authoritative module specifications land in Pass 7+ Module PRDs under `docs/04-domains/`. On any conflict, the Module PRD wins.

## Purpose

The **Module Catalog** enumerates every BusinessOS module (or bounded context) currently in scope, together with its planned status, primary domain, expected engine dependencies, and planned owner. It is a pre-Pass 7 planning aid: it does **not** specify behavior and MUST NOT be used as a source of truth for module design.

## How to Read

- **Module Name** — the working name of the module or bounded context.
- **Status** — all entries are `Planned` until their Module PRD lands.
- **Primary Domain** — the business domain the module owns.
- **Planned PRD** — the expected location of the future Module PRD.
- **Expected Engine Dependencies** — ERP Core engines the module is expected to consume (indicative; final list is set by the Module PRD).
- **Planned Owner** — the owning team or role.

## Maintenance Note

This catalog SHOULD be regenerated or reviewed whenever a Module PRD is authored, renamed, or its scope changes, and whenever a new module or bounded context is proposed. It MUST NOT become an independent source of truth.

## Catalog

| Module Name | Status | Primary Domain | Planned PRD | Expected Engine Dependencies | Planned Owner |
| --- | --- | --- | --- | --- | --- |
| Accounting | Planned | Finance | `docs/04-domains/accounting/` | ENG-001..006, 007..009, 011, 015..019, 021, 024, 026, 027 | Finance |
| Sales | Planned | Revenue | `docs/04-domains/sales/` | ENG-001..006, 007..009, 010, 011, 013, 015, 017..019, 021, 024, 025, 026, 027 | Revenue |
| Purchase | Planned | Procurement | `docs/04-domains/purchase/` | ENG-001..006, 007..009, 010, 011, 015..019, 021, 024, 026, 027 | Procurement |
| Inventory | Planned | Supply Chain | `docs/04-domains/inventory/` | ENG-001..006, 007..009, 012, 015, 017, 020, 021, 024, 026, 027 | Supply Chain |
| HRMS | Planned | People | `docs/04-domains/hr/` | ENG-001..006, 007..009, 010, 011, 013, 014, 021, 024, 025, 026, 027 | People |
| Payroll | Planned | People | `docs/04-domains/payroll/` | ENG-001..006, 011, 014, 015..019, 021, 024, 026, 027 | People |
| CRM | Planned | Customer | `docs/04-domains/crm/` | ENG-001..006, 007, 008, 012, 013, 020, 021, 022, 023, 024, 025, 027 | Revenue |
| Manufacturing | Planned | Operations | `docs/04-domains/manufacturing/` | ENG-001..006, 007..009, 010, 011, 012, 014, 015, 017, 021, 024, 026, 027 | Operations |
| Projects | Planned | Delivery | `docs/04-domains/projects/` | ENG-001..006, 007..009, 010, 011, 014, 015, 017, 021, 022, 024, 026, 027 | Delivery |
| AMC | Planned | Service | `docs/04-domains/amc/` | ENG-001..006, 007..009, 010, 011, 013, 014, 021, 024, 025, 027 | Service |
| Field Service | Planned | Service | `docs/04-domains/field-service/` | ENG-001..006, 007..009, 010, 013, 014, 021, 023, 024, 025, 027 | Service |
| Assets | Planned | Operations | `docs/04-domains/assets/` | ENG-001..006, 007, 008, 014, 021, 024, 026, 027 | Operations |
| Fleet | Planned | Operations | `docs/04-domains/fleet/` | ENG-001..006, 007, 008, 014, 021, 023, 024, 025, 027 | Operations |
| POS | Planned | Revenue | `docs/04-domains/pos/` | ENG-001..006, 007, 015..019, 021, 023, 024, 025, 027 | Revenue |
| Service Desk | Planned | Service | `docs/04-domains/service-desk/` | ENG-001..006, 007..009, 010..013, 020, 021, 022, 024, 025, 027 | Service |
| Analytics | Planned | Insights | `docs/04-domains/analytics/` | ENG-001..006, 020, 021, 022, 024, 026, 027, 028 | Insights |
| AI | Planned | Platform / AI | `docs/09-ai/` + future `docs/04-domains/ai/` | ENG-001..006, 011, 020, 021, 022, 024, 028 | AI Platform |
| Platform | Planned | Platform | `docs/04-domains/foundation/` (extended) | ENG-001..028 | Platform |

## References

- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/ENGINE_USAGE_MATRIX.md`
- `docs/02-architecture/domain-map.md`
- `docs/DOCUMENT_TRACEABILITY.md`
- `docs/99-templates/module-prd-template.md`
