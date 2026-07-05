---
title: "MOD-007 — HRMS"
summary: "Employee master, org structure, attendance, leave, performance, and lifecycle for the workforce."
layer: "business"
owner: "People"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-007"
module: "HRMS"
domain: "People"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-007 — HRMS

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Employee master, org structure, attendance, leave, performance, and lifecycle for the workforce.

## Business Scope

**Bounded context:** Human Capital. **Primary domain:** People.

Submodules:

- Employee Master
- Attendance
- Leave
- Performance
- L&D
- Self-Service

## Primary Users

- HR Business Partner
- HR Manager
- Employee
- Manager

## Business Capabilities

- Employee master and org structure
- Onboarding and offboarding
- Attendance and leave
- Performance and appraisal
- Learning and development
- Employee self-service

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
- ENG-021 Reporting Engine
- ENG-024 Event Engine
- ENG-025 Notification Engine

Optional:

- ENG-012 Rules Engine
- ENG-014 Scheduler Engine
- ENG-020 Search Engine
- ENG-022 Dashboard Engine
- ENG-026 Import Engine
- ENG-027 Export Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration

Provides to:

- MOD-008 Payroll
- MOD-010 Projects
- MOD-012 Field Service
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
