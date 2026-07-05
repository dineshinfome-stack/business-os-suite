---
title: "MOD-004 — Purchase"
summary: "Requisitions, RFQs, purchase orders, goods receipt, and supplier invoicing for the procure-to-pay lifecycle."
layer: "business"
owner: "Procurement"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-004"
module: "Purchase"
domain: "Procurement"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-004 — Purchase

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Requisitions, RFQs, purchase orders, goods receipt, and supplier invoicing for the procure-to-pay lifecycle.

## Business Scope

**Bounded context:** Procure-to-Pay. **Primary domain:** Procurement.

Submodules:

- Requisitions
- RFQs
- Purchase Orders
- GRN
- Invoices
- Returns

## Primary Users

- Buyer
- Procurement Manager
- Stores Officer

## Business Capabilities

- Purchase requisition and approval
- Request for quotation and supplier comparison
- Purchase orders and amendments
- Goods receipt and inspection
- Supplier invoices and 3-way match
- Purchase returns

## ERP Core Engines Consumed

Required:

- ENG-001 Identity Engine
- ENG-002 Authorization Engine
- ENG-003 Permission Management Engine
- ENG-004 Audit Engine
- ENG-005 Configuration Engine
- ENG-006 Localization Engine
- ENG-007 Document Engine
- ENG-008 Attachment Engine
- ENG-010 Workflow Engine
- ENG-011 Approval Engine
- ENG-015 Voucher Engine
- ENG-017 Numbering Engine
- ENG-018 Currency Engine
- ENG-019 Tax Engine
- ENG-021 Reporting Engine
- ENG-024 Event Engine

Optional:

- ENG-012 Rules Engine
- ENG-013 Automation Engine
- ENG-016 Posting Engine
- ENG-020 Search Engine
- ENG-023 Integration Engine
- ENG-025 Notification Engine
- ENG-026 Import Engine
- ENG-027 Export Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration
- MOD-002 Accounting
- MOD-005 Inventory

Provides to:

- MOD-002 Accounting
- MOD-017 Analytics

## Related ADRs

- ADR-011 Multi-Tenant Isolation
- ADR-032 RBAC + ABAC
- ADR-014 Audit Strategy

## Reading Order

1. This README.
2. [`MODULE_PRD.md`](./MODULE_PRD.md).
3. Referenced engines in `docs/10-erp-core/` and ADRs in `docs/11-adrs/`.

## References

- [`MODULE_PRD.md`](./MODULE_PRD.md)
- `docs/20-module-prds/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
