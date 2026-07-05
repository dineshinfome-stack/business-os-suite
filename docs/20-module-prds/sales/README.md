---
title: "MOD-003 — Sales"
summary: "Quotations, sales orders, delivery, invoicing, and receivables handoff for the order-to-cash lifecycle."
layer: "business"
owner: "Revenue"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-003"
module: "Sales"
domain: "Revenue"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-003 — Sales

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Quotations, sales orders, delivery, invoicing, and receivables handoff for the order-to-cash lifecycle.

## Business Scope

**Bounded context:** Order-to-Cash. **Primary domain:** Revenue.

Submodules:

- Quotations
- Orders
- Deliveries
- Invoices
- Returns

## Primary Users

- Sales Executive
- Sales Manager
- Order Desk

## Business Capabilities

- Quotation and pricing
- Sales order capture and fulfilment
- Delivery / dispatch
- Sales invoicing (incl. e-invoice)
- Discounts, schemes, and promotions
- Sales returns and credit notes

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
- ENG-025 Notification Engine

Optional:

- ENG-012 Rules Engine
- ENG-013 Automation Engine
- ENG-016 Posting Engine
- ENG-020 Search Engine
- ENG-022 Dashboard Engine
- ENG-023 Integration Engine
- ENG-026 Import Engine
- ENG-027 Export Engine
- ENG-028 AI Copilot Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration
- MOD-002 Accounting
- MOD-005 Inventory
- MOD-006 CRM

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
