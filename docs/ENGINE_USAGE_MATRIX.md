---
title: "Engine Usage Matrix"
summary: "Which ERP Core Engines each planned BusinessOS module is expected to consume. Informational; authoritative dependencies land in Module PRDs."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["erp-core", "modules", "matrix", "index"]
document_type: "Governance Guide"
---

# Engine Usage Matrix

> **Derived document.** Projection of `docs/10-erp-core/ENGINE_CATALOG.md` and the planned module list. It is **informational only** — authoritative engine consumption is declared by each Module PRD (Pass 7+). On any conflict, the engine specification and the Module PRD win.

## Purpose

The **Engine Usage Matrix** is a pre-Pass 7 planning aid: for each ERP Core Engine, it lists the modules that are expected to consume it, distinguishes required vs optional consumption, and captures the rationale. It helps Module PRD authors understand which engines they must integrate before writing their PRD, and helps engine owners anticipate the shape of consumer demand.

## How to Read

- **Engine** — the ERP Core Engine (`ENG-NNN`), linked to its specification.
- **Category** — the engine's ERP Core category.
- **Typical Consumers** — modules expected to consume the engine.
- **Required** — modules for which the engine is essential to the module's core purpose.
- **Optional** — modules that may consume the engine depending on configuration or scope.
- **Notes** — rationale, caveats, or references.

Planned modules (Pass 7+ will confirm the definitive list): Accounting, Sales, Inventory, HRMS, Payroll, CRM, Manufacturing, Projects, AMC, Field Service, Assets, Fleet, POS, Service Desk, Analytics, AI, Platform.

## Maintenance Note

This matrix SHOULD be regenerated or reviewed whenever an engine is added, removed, renamed, or its capabilities materially change, and whenever a Module PRD lands or updates its declared engine dependencies. It MUST NOT become an independent source of truth.

## Matrix

### Foundation

| Engine | Category | Typical Consumers | Required | Optional | Notes |
| --- | --- | --- | --- | --- | --- |
| [ENG-001 Identity Engine](./10-erp-core/foundation/identity-engine.md) | Foundation | All modules | All modules | — | Universally required; every module inherits identity context. |
| [ENG-002 Authorization Engine](./10-erp-core/foundation/authorization-engine.md) | Foundation | All modules | All modules | — | RBAC + ABAC gate for every operation. |
| [ENG-003 Permission Management Engine](./10-erp-core/foundation/permission-management-engine.md) | Foundation | All modules | All modules | — | Grants and role assignments. |
| [ENG-004 Audit Engine](./10-erp-core/foundation/audit-engine.md) | Foundation | All modules | All modules | — | Immutable audit trail for every state change. |
| [ENG-005 Configuration Engine](./10-erp-core/foundation/configuration-engine.md) | Foundation | All modules | All modules | — | Tenant, company, and feature flag configuration. |
| [ENG-006 Localization Engine](./10-erp-core/foundation/localization-engine.md) | Foundation | All modules | All modules | — | i18n, formatting, timezone, locale packs. |

### Document

| Engine | Category | Typical Consumers | Required | Optional | Notes |
| --- | --- | --- | --- | --- | --- |
| [ENG-007 Document Engine](./10-erp-core/document/document-engine.md) | Document | Most modules | Accounting, Sales, Inventory, HRMS, CRM, Manufacturing, Projects, AMC, Field Service, POS, Service Desk | Analytics, AI, Platform | Business document lifecycle. |
| [ENG-008 Attachment Engine](./10-erp-core/document/attachment-engine.md) | Document | Most modules | Accounting, Sales, HRMS, CRM, Field Service, AMC, Service Desk | Inventory, Manufacturing, Projects, POS, Assets, Fleet | File attachments on business documents. |
| [ENG-009 File Storage Engine](./10-erp-core/document/file-storage-engine.md) | Document | Most modules | Document/Attachment consumers | Analytics, AI | Object storage primitives; usually reached via Attachment. |

### Workflow

| Engine | Category | Typical Consumers | Required | Optional | Notes |
| --- | --- | --- | --- | --- | --- |
| [ENG-010 Workflow Engine](./10-erp-core/workflow/workflow-engine.md) | Workflow | Most modules | Sales, Purchase-in-Accounting, HRMS, Manufacturing, Projects, AMC, Field Service, Service Desk | Inventory, POS | Long-running business processes. |
| [ENG-011 Approval Engine](./10-erp-core/workflow/approval-engine.md) | Workflow | Most modules | Accounting, Sales, HRMS, Payroll, Manufacturing, Projects, AMC, AI (approval boundary) | Inventory, CRM, Field Service, POS | Multi-step approvals with delegation. |
| [ENG-012 Rules Engine](./10-erp-core/workflow/rules-engine.md) | Workflow | Most modules | Accounting, Sales, Inventory, Manufacturing, CRM, AMC, Service Desk | Analytics, AI | Declarative business rules. |
| [ENG-013 Automation Engine](./10-erp-core/workflow/automation-engine.md) | Workflow | Most modules | Sales, CRM, HRMS, Field Service, AMC, Service Desk | Accounting, Inventory | Trigger → action automation. |
| [ENG-014 Scheduler Engine](./10-erp-core/workflow/scheduler-engine.md) | Workflow | Most modules | Payroll, AMC, Field Service, Fleet, Assets, Analytics | Accounting, HRMS | Cron and calendar-based scheduling. |

### Financial

| Engine | Category | Typical Consumers | Required | Optional | Notes |
| --- | --- | --- | --- | --- | --- |
| [ENG-015 Voucher Engine](./10-erp-core/financial/voucher-engine.md) | Financial | Voucher-producing modules | Accounting, Sales, Inventory (stock vouchers), Payroll, POS | Manufacturing, Projects, AMC | Voucher lifecycle and integrity. |
| [ENG-016 Posting Engine](./10-erp-core/financial/posting-engine.md) | Financial | Ledger consumers | Accounting, Sales, Payroll, POS | Inventory, Manufacturing, Projects | Double-entry ledger posting. |
| [ENG-017 Numbering Engine](./10-erp-core/financial/numbering-engine.md) | Financial | All voucher-producing modules | Accounting, Sales, Inventory, Payroll, POS, Manufacturing, Projects | AMC, Field Service | Series-based document numbering. |
| [ENG-018 Currency Engine](./10-erp-core/financial/currency-engine.md) | Financial | Multi-currency modules | Accounting, Sales, Payroll | Projects, POS, AMC, Field Service | FX rates, revaluation, base-currency mapping. |
| [ENG-019 Tax Engine](./10-erp-core/financial/tax-engine.md) | Financial | Tax-computing modules | Accounting, Sales, POS | Payroll, Projects, AMC, Field Service | GST, VAT, WHT, and locale packs. |

### Intelligence

| Engine | Category | Typical Consumers | Required | Optional | Notes |
| --- | --- | --- | --- | --- | --- |
| [ENG-020 Search Engine](./10-erp-core/intelligence/search-engine.md) | Intelligence | All modules | All modules | — | Global and scoped search. |
| [ENG-021 Reporting Engine](./10-erp-core/intelligence/reporting-engine.md) | Intelligence | All modules | Accounting, Sales, Inventory, Payroll, HRMS, Analytics | CRM, Manufacturing, Projects, AMC, Field Service, Assets, Fleet, POS, Service Desk | Report definition, rendering, export. |
| [ENG-022 Dashboard Engine](./10-erp-core/intelligence/dashboard-engine.md) | Intelligence | All modules | Analytics, Accounting, Sales, HRMS, Service Desk | All other modules | KPI widgets and dashboards. |

### Integration

| Engine | Category | Typical Consumers | Required | Optional | Notes |
| --- | --- | --- | --- | --- | --- |
| [ENG-023 Integration Engine](./10-erp-core/integration/integration-engine.md) | Integration | External-facing modules | Accounting (banking, e-invoice), Sales (payments), Payroll (banking), CRM (email/WhatsApp), Field Service, POS, Platform | Inventory, HRMS, AMC | Adapters and outbound HTTP. |
| [ENG-024 Event Engine](./10-erp-core/integration/event-engine.md) | Integration | All modules | All modules | — | Domain and integration events. |
| [ENG-025 Notification Engine](./10-erp-core/integration/notification-engine.md) | Integration | Most modules | Sales, CRM, HRMS, Field Service, AMC, Service Desk | Accounting, Inventory, POS | Multi-channel notifications. |

### Data Exchange

| Engine | Category | Typical Consumers | Required | Optional | Notes |
| --- | --- | --- | --- | --- | --- |
| [ENG-026 Import Engine](./10-erp-core/data-exchange/import-engine.md) | Data Exchange | Most modules | Accounting, Inventory, HRMS, CRM, Sales | Manufacturing, Projects, POS, Assets, Fleet | Bulk data import with validation. |
| [ENG-027 Export Engine](./10-erp-core/data-exchange/export-engine.md) | Data Exchange | Most modules | Accounting, Payroll, HRMS, Sales, Inventory, Analytics | All other modules | Bulk data export in standard formats. |

### AI

| Engine | Category | Typical Consumers | Required | Optional | Notes |
| --- | --- | --- | --- | --- | --- |
| [ENG-028 AI Copilot Engine](./10-erp-core/ai/ai-copilot-engine.md) | AI | TBD Pass 7+ | AI | All other modules (via tool calling and RAG) | Consumers finalized as Module PRDs land. |

## References

- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/MODULE_CATALOG.md`
- `docs/DOCUMENT_TRACEABILITY.md`
- `docs/11-adrs/ADR_INDEX.md`
