---
title: "MOD-017 — Analytics"
summary: "Curated data marts, KPIs, dashboards, and scheduled analytics across the enterprise."
layer: "business"
owner: "Insights"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-017"
module: "Analytics"
domain: "Insights"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-017 — Analytics

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Curated data marts, KPIs, dashboards, and scheduled analytics across the enterprise.

## Business Scope

**Bounded context:** Business Analytics. **Primary domain:** Insights.

Submodules:

- KPIs
- Dashboards
- Marts
- Distribution
- Models

## Primary Users

- Analyst
- Business Lead
- Executive

## Business Capabilities

- KPI catalog and definitions
- Curated data marts (per domain)
- Dashboards and drill-downs
- Scheduled report distribution
- Data exports
- Analytical models and forecasts

## ERP Core Engines Consumed

Required:

- ENG-001 Identity Engine
- ENG-002 Authorization Engine
- ENG-003 Permission Management Engine
- ENG-004 Audit Engine
- ENG-005 Configuration Engine
- ENG-006 Localization Engine
- ENG-020 Search Engine
- ENG-021 Reporting Engine
- ENG-022 Dashboard Engine
- ENG-024 Event Engine
- ENG-027 Export Engine

Optional:

- ENG-014 Scheduler Engine
- ENG-023 Integration Engine
- ENG-025 Notification Engine
- ENG-026 Import Engine
- ENG-028 AI Copilot Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration
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

Provides to:

- MOD-018 AI Workspace

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
