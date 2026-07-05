---
title: "MOD-001 — Platform Administration"
summary: "Tenant, company, branch, financial-year, user, role, and platform-wide configuration surface."
layer: "business"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-001"
module: "Platform Administration"
domain: "Platform"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-001 — Platform Administration

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Tenant, company, branch, financial-year, user, role, and platform-wide configuration surface.

## Business Scope

**Bounded context:** Platform. **Primary domain:** Platform.

Submodules:

- Tenancy
- Organization Structure
- Users & Roles
- Configuration
- Localization Packs
- Audit Review

## Primary Users

- Platform Admin
- Tenant Admin
- Company Admin

## Business Capabilities

- Tenant provisioning and lifecycle
- Company, branch, and financial-year management
- User, role, and permission administration
- Tenant-scoped configuration and feature toggles
- Localization pack activation
- Audit review and export

## ERP Core Engines Consumed

Required:

- ENG-001 Identity Engine
- ENG-002 Authorization Engine
- ENG-003 Permission Management Engine
- ENG-004 Audit Engine
- ENG-005 Configuration Engine
- ENG-006 Localization Engine
- ENG-020 Search Engine
- ENG-024 Event Engine

Optional:

- ENG-021 Reporting Engine
- ENG-023 Integration Engine
- ENG-025 Notification Engine

## Related Modules

Depends on:

- —

Provides to:

- MOD-002 Accounting
- MOD-003 Sales
- MOD-004 Purchase
- MOD-005 Inventory
- MOD-006 CRM
- MOD-007 HRMS
- MOD-008 Payroll
- MOD-009 Manufacturing
- MOD-010 Projects
- MOD-011 AMC
- MOD-012 Field Service
- MOD-013 Assets
- MOD-014 Fleet
- MOD-015 POS
- MOD-016 Service Desk
- MOD-017 Analytics
- MOD-018 AI Workspace

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
