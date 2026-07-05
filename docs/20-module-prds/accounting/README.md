---
title: "MOD-002 — Accounting"
summary: "General ledger, journals, banking, receivables, payables, and period-close for every legal entity."
layer: "business"
owner: "Finance"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-002"
module: "Accounting"
domain: "Finance"
tags: ["module", "prd", "readme"]
document_type: "Module Guide"
---

# MOD-002 — Accounting

> **Module Guide.** Lightweight companion to [`MODULE_PRD.md`](./MODULE_PRD.md). On any conflict, the Module PRD wins. All engine references use the stable `ENG-NNN` identifiers from `docs/10-erp-core/ENGINE_CATALOG.md`; all ADR references use `ADR-NNN` from `docs/11-adrs/ADR_INDEX.md`; all module references use `MOD-NNN` from `docs/20-module-prds/README.md`.

## Purpose

General ledger, journals, banking, receivables, payables, and period-close for every legal entity.

## Business Scope

**Bounded context:** General Ledger and Sub-ledgers. **Primary domain:** Finance.

Submodules:

- General Ledger
- Accounts Payable
- Accounts Receivable
- Banking
- Tax
- Period Close

## Primary Users

- Accountant
- Controller
- CFO

## Business Capabilities

- Chart of accounts management
- Journals and general ledger
- Accounts payable and receivable
- Bank and cash management
- Tax accounting
- Period close and consolidation

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
- ENG-011 Approval Engine
- ENG-015 Voucher Engine
- ENG-016 Posting Engine
- ENG-017 Numbering Engine
- ENG-018 Currency Engine
- ENG-019 Tax Engine
- ENG-021 Reporting Engine
- ENG-024 Event Engine
- ENG-026 Import Engine
- ENG-027 Export Engine

Optional:

- ENG-010 Workflow Engine
- ENG-012 Rules Engine
- ENG-020 Search Engine
- ENG-022 Dashboard Engine
- ENG-023 Integration Engine
- ENG-025 Notification Engine
- ENG-028 AI Copilot Engine

## Related Modules

Depends on:

- MOD-001 Platform Administration

Provides to:

- MOD-003 Sales
- MOD-004 Purchase
- MOD-008 Payroll
- MOD-015 POS
- MOD-017 Analytics

## Related ADRs

- ADR-011 Multi-Tenant Isolation
- ADR-014 Audit Strategy
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
