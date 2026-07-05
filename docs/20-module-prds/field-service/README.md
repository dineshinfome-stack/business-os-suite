---
title: "MOD-012 — Field Service"
summary: "Field tickets, dispatch, visit execution, spare consumption, and mobile workforce management."
layer: "business"
owner: "Service"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-012"
module: "Field Service"
domain: "Service"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-012 — Field Service

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Field tickets, dispatch, visit execution, spare consumption, and mobile workforce management.

## Business Scope

**Bounded context:** Field Operations. **Primary domain:** Service.

Submodules:

- Tickets
- Dispatch
- Visits
- Spares
- Closure

## Primary Users

- Field Technician
- Dispatcher
- Service Manager

## Business Capabilities

- Ticket capture and triage
- Dispatch and scheduling
- Mobile visit execution
- Spare parts and consumption
- Signature capture and closure
- SLA and escalation tracking

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
- ENG-013 Automation Engine
- ENG-014 Scheduler Engine
- ENG-021 Reporting Engine
- ENG-023 Integration Engine
- ENG-024 Event Engine
- ENG-025 Notification Engine

Optional:

- ENG-011 Approval Engine
- ENG-012 Rules Engine
- ENG-020 Search Engine
- ENG-022 Dashboard Engine
- ENG-027 Export Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration
- MOD-011 AMC
- MOD-005 Inventory

Provides to:

- MOD-016 Service Desk
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
