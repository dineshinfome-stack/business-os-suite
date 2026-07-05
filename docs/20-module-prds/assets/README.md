---
title: "MOD-013 — Assets"
summary: "Asset register, capitalization, depreciation, maintenance, and disposal for fixed assets."
layer: "business"
owner: "Operations"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-013"
module: "Assets"
domain: "Operations"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-013 — Assets

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Asset register, capitalization, depreciation, maintenance, and disposal for fixed assets.

## Business Scope

**Bounded context:** Fixed Asset Management. **Primary domain:** Operations.

Submodules:

- Register
- Depreciation
- Maintenance
- Disposal
- Insurance

## Primary Users

- Asset Manager
- Finance
- Maintenance

## Business Capabilities

- Asset register and hierarchy
- Capitalization and componentization
- Depreciation methods and schedules
- Maintenance and calibration
- Transfer and disposal
- Insurance and warranty

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
- ENG-014 Scheduler Engine
- ENG-021 Reporting Engine
- ENG-024 Event Engine

Optional:

- ENG-010 Workflow Engine
- ENG-011 Approval Engine
- ENG-015 Voucher Engine
- ENG-016 Posting Engine
- ENG-017 Numbering Engine
- ENG-025 Notification Engine
- ENG-026 Import Engine
- ENG-027 Export Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration
- MOD-002 Accounting

Provides to:

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
