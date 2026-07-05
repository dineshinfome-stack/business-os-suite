---
title: "MOD-006 — CRM"
summary: "Leads, opportunities, accounts, contacts, activities, and campaigns supporting the revenue pipeline."
layer: "business"
owner: "Revenue"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-006"
module: "CRM"
domain: "Customer"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-006 — CRM

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Leads, opportunities, accounts, contacts, activities, and campaigns supporting the revenue pipeline.

## Business Scope

**Bounded context:** Customer Relationship. **Primary domain:** Customer.

Submodules:

- Leads
- Opportunities
- Accounts & Contacts
- Activities
- Campaigns

## Primary Users

- Sales Representative
- Sales Manager
- Marketing Manager

## Business Capabilities

- Lead capture and qualification
- Opportunity pipeline
- Account and contact management
- Activity, task, and meeting tracking
- Campaigns and segmentation
- Customer 360 view

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
- ENG-012 Rules Engine
- ENG-013 Automation Engine
- ENG-020 Search Engine
- ENG-021 Reporting Engine
- ENG-022 Dashboard Engine
- ENG-024 Event Engine
- ENG-025 Notification Engine

Optional:

- ENG-010 Workflow Engine
- ENG-011 Approval Engine
- ENG-023 Integration Engine
- ENG-026 Import Engine
- ENG-027 Export Engine
- ENG-028 AI Copilot Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration

Provides to:

- MOD-003 Sales
- MOD-016 Service Desk
- MOD-012 Field Service
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
