---
title: "MOD-008 — Payroll"
summary: "Salary structures, payroll runs, statutory computations, and disbursement across countries and cycles."
layer: "business"
owner: "People"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-008"
module: "Payroll"
domain: "People"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-008 — Payroll

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

Salary structures, payroll runs, statutory computations, and disbursement across countries and cycles.

## Business Scope

**Bounded context:** Payroll and Compensation. **Primary domain:** People.

Submodules:

- Structures
- Cycles
- Statutory
- Payslips
- Disbursement

## Primary Users

- Payroll Officer
- HR
- Finance

## Business Capabilities

- Salary structures and components
- Payroll cycles and runs
- Statutory computations (per locale)
- Reimbursements and advances
- Payslip generation
- Disbursement and posting

## ERP Core Engines Consumed

Required:

- ENG-001 Identity Engine
- ENG-002 Authorization Engine
- ENG-003 Permission Management Engine
- ENG-004 Audit Engine
- ENG-005 Configuration Engine
- ENG-006 Localization Engine
- ENG-011 Approval Engine
- ENG-014 Scheduler Engine
- ENG-015 Voucher Engine
- ENG-016 Posting Engine
- ENG-017 Numbering Engine
- ENG-018 Currency Engine
- ENG-021 Reporting Engine
- ENG-024 Event Engine
- ENG-026 Import Engine
- ENG-027 Export Engine

Optional:

- ENG-007 Document Engine
- ENG-019 Tax Engine
- ENG-023 Integration Engine
- ENG-025 Notification Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration
- MOD-002 Accounting
- MOD-007 HRMS

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
