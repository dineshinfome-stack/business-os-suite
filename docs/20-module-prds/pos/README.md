---
title: "MOD-015 — POS"
summary: "Retail counter operations: cart, payments, receipts, offers, and day-close integrated with inventory and finance."
layer: "business"
owner: "Revenue"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-015"
module: "POS"
domain: "Revenue"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-015 — POS

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Retail counter operations: cart, payments, receipts, offers, and day-close integrated with inventory and finance.

## Business Scope

**Bounded context:** Point of Sale. **Primary domain:** Revenue.

Submodules:

- Cart
- Payments
- Offers
- Day Close
- Loyalty

## Primary Users

- Cashier
- Store Manager

## Business Capabilities

- Cart, pricing, and discounts
- Multi-tender payments
- Receipts and reprints
- Loyalty and gift cards
- Offline resilience
- Day-close and hand-over

## ERP Core Engines Consumed

Required:

- ENG-001 Identity Engine
- ENG-002 Authorization Engine
- ENG-003 Permission Management Engine
- ENG-004 Audit Engine
- ENG-005 Configuration Engine
- ENG-006 Localization Engine
- ENG-007 Document Engine
- ENG-015 Voucher Engine
- ENG-016 Posting Engine
- ENG-017 Numbering Engine
- ENG-019 Tax Engine
- ENG-021 Reporting Engine
- ENG-023 Integration Engine
- ENG-024 Event Engine
- ENG-025 Notification Engine

Optional:

- ENG-012 Rules Engine
- ENG-018 Currency Engine
- ENG-022 Dashboard Engine
- ENG-027 Export Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration
- MOD-002 Accounting
- MOD-005 Inventory

Provides to:

- MOD-002 Accounting
- MOD-005 Inventory
- MOD-017 Analytics

## Related ADRs

- ADR-011 Multi-Tenant Isolation
- ADR-032 RBAC + ABAC

## Reading Order

1. This README.
2. [`MODULE_PRD.md`](./MODULE_PRD.md).
3. Referenced engines in `docs/10-erp-core/` and ADRs in `docs/11-adrs/`.

## References

- [`MODULE_PRD.md`](./MODULE_PRD.md)
- `docs/20-module-prds/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
