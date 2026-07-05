---
title: "MOD-011 — AMC"
summary: "Contracts, entitlements, scheduled visits, and renewals for annual maintenance and support agreements."
layer: "business"
owner: "Service"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-011"
module: "AMC"
domain: "Service"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-011 — AMC

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Contracts, entitlements, scheduled visits, and renewals for annual maintenance and support agreements.

## Business Scope

**Bounded context:** Annual Maintenance Contracts. **Primary domain:** Service.

Submodules:

- Contracts
- Entitlements
- Scheduling
- Billing
- Renewals

## Primary Users

- Service Manager
- Contracts Officer
- Field Coordinator

## Business Capabilities

- Contract creation and management
- Entitlement tracking
- Preventive visit scheduling
- Contract billing (upfront/periodic)
- Renewals and terminations
- Service level tracking

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
- ENG-013 Automation Engine
- ENG-014 Scheduler Engine
- ENG-021 Reporting Engine
- ENG-024 Event Engine
- ENG-025 Notification Engine

Optional:

- ENG-012 Rules Engine
- ENG-015 Voucher Engine
- ENG-017 Numbering Engine
- ENG-020 Search Engine
- ENG-023 Integration Engine
- ENG-027 Export Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration
- MOD-006 CRM

Provides to:

- MOD-012 Field Service
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
