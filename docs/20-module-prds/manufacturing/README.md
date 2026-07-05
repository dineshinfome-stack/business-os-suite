---
title: "MOD-009 — Manufacturing"
summary: "BOMs, routings, work orders, production planning, and shopfloor execution for make-to-stock and make-to-order."
layer: "business"
owner: "Operations"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-009"
module: "Manufacturing"
domain: "Operations"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-009 — Manufacturing

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

BOMs, routings, work orders, production planning, and shopfloor execution for make-to-stock and make-to-order.

## Business Scope

**Bounded context:** Production and Planning. **Primary domain:** Operations.

Submodules:

- BOM
- Routing
- Planning
- Work Orders
- Sub-contracting
- Quality

## Primary Users

- Production Planner
- Shopfloor Supervisor
- Quality Inspector

## Business Capabilities

- Bills of material and routings
- Production planning and scheduling
- Work orders and shopfloor execution
- Sub-contracting
- Quality checks
- Yield and scrap tracking

## ERP Core Engines Consumed

Required:

- ENG-001 Identity Engine
- ENG-002 Authorization Engine
- ENG-003 Permission Management Engine
- ENG-004 Audit Engine
- ENG-005 Configuration Engine
- ENG-006 Localization Engine
- ENG-007 Document Engine
- ENG-010 Workflow Engine
- ENG-011 Approval Engine
- ENG-012 Rules Engine
- ENG-014 Scheduler Engine
- ENG-017 Numbering Engine
- ENG-021 Reporting Engine
- ENG-024 Event Engine

Optional:

- ENG-008 Attachment Engine
- ENG-013 Automation Engine
- ENG-015 Voucher Engine
- ENG-020 Search Engine
- ENG-022 Dashboard Engine
- ENG-023 Integration Engine
- ENG-025 Notification Engine
- ENG-026 Import Engine
- ENG-027 Export Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration
- MOD-005 Inventory

Provides to:

- MOD-005 Inventory
- MOD-002 Accounting
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
