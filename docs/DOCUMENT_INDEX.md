---
title: "Document Index"
summary: "Alphabetical inventory of every BusinessOS repository document with layer, status, authority, and path."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["inventory", "index"]
document_type: "Governance Guide"
---

# Document Index

> **Derived document.** Alphabetical inventory of files in `docs/`. Complements `docs/_meta.json` (portal sidebar) and `docs/REPOSITORY_MAP.md` (hierarchy); replaces neither. On any conflict, the source files win and this inventory is corrected in the same change.

## Purpose

The **Document Index** is the searchable inventory of every document in the repository, sorted alphabetically. Each row records the document's layer, status, authority (`Authoritative` | `Derived` | `Reference` | `Superseded`), and path.

## How to Read

- **Document** — human-readable name.
- **Layer** — Foundation, Business Blueprint, Architecture, Design, ERP Core, ADR, Reference, Cross-cutting, Legacy, Template.
- **Status** — `Approved`, `Draft`, `Proposed`, `Accepted`, `Superseded`.
- **Authority** — `Authoritative` (source of truth), `Derived` (index/matrix), `Reference` (supporting material), `Superseded`.
- **Path** — repository-relative path.

## Maintenance Note

This inventory SHOULD be regenerated or reviewed whenever any document is added, removed, or renamed. It MUST NOT become an independent source of truth.

## Inventory

### A

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Accounting Reports | Reference | Approved | Reference | `docs/07-reports/accounting-reports.md` |
| Accounting Rules | Reference | Approved | Reference | `docs/08-business-rules/accounting-rules.md` |
| ADR Impact Matrix | Cross-cutting | Approved | Derived | `docs/ADR_IMPACT_MATRIX.md` |
| ADR Index | ADR | Approved | Derived | `docs/11-adrs/ADR_INDEX.md` |
| ADR Repository README | ADR | Approved | Authoritative | `docs/11-adrs/README.md` |
| ADR Template | ADR | Approved | Authoritative | `docs/11-adrs/ADR_TEMPLATE.md` |
| ADRs — AI (ADR-040..045) | ADR | Proposed | Authoritative | `docs/11-adrs/ai/` |
| ADRs — Architecture (ADR-001..006) | ADR | Accepted/Proposed | Authoritative | `docs/11-adrs/architecture/` |
| ADRs — Data (ADR-010..016) | ADR | Accepted/Proposed | Authoritative | `docs/11-adrs/data/` |
| ADRs — DevOps (ADR-060..065) | ADR | Proposed | Authoritative | `docs/11-adrs/devops/` |
| ADRs — Engineering (ADR-070..075) | ADR | Proposed | Authoritative | `docs/11-adrs/engineering/` |
| ADRs — Integration (ADR-050..055) | ADR | Proposed | Authoritative | `docs/11-adrs/integration/` |
| ADRs — Platform (ADR-020..026) | ADR | Proposed | Authoritative | `docs/11-adrs/platform/` |
| ADRs — Security (ADR-030..036) | ADR | Accepted/Proposed | Authoritative | `docs/11-adrs/security/` |
| ADRs — UI (ADR-080..084) | ADR | Proposed | Authoritative | `docs/11-adrs/ui/` |
| AI Architecture | Architecture | Approved | Authoritative | `docs/02-architecture/ai-architecture.md` |
| AI Copilot | Reference | Approved | Reference | `docs/09-ai/ai-copilot.md` |
| AI Copilot Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/ai/ai-copilot-engine.md` |
| AI Guardrails | Reference | Approved | Reference | `docs/09-ai/ai-guardrails.md` |
| AI Providers | Reference | Approved | Reference | `docs/06-integrations/ai-providers.md` |
| API Architecture | Architecture | Approved | Authoritative | `docs/02-architecture/api-architecture.md` |
| API Spec Template | Template | Approved | Reference | `docs/99-templates/api-spec-template.md` |
| Approval Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/workflow/approval-engine.md` |
| Approval Rules | Reference | Approved | Reference | `docs/08-business-rules/approval-rules.md` |
| Approval Workflow | Reference | Approved | Reference | `docs/13-workflows/approval-workflow.md` |
| Assumptions Register | Business Blueprint | Approved | Authoritative | `docs/01-master/assumptions.md` |
| Attachment Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/document/attachment-engine.md` |
| Audit Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/foundation/audit-engine.md` |
| Authorization Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/foundation/authorization-engine.md` |
| Automation Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/workflow/automation-engine.md` |

### B

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Bank APIs | Reference | Approved | Reference | `docs/06-integrations/bank-apis.md` |
| Barcode / QR | Reference | Approved | Reference | `docs/06-integrations/barcode-qr.md` |
| Business Advisor | Reference | Approved | Reference | `docs/09-ai/business-advisor.md` |
| Business Model | Business Blueprint | Approved | Authoritative | `docs/01-master/business-model.md` |
| Business Rules — Numbering | Reference | Approved | Reference | `docs/08-business-rules/numbering-rules.md` |

### C

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Canon | Foundation | Approved | Authoritative | `docs/canon.md` |
| Coding Standards | Design | Approved | Authoritative | `docs/03-design/coding-standards.md` |
| Configuration Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/foundation/configuration-engine.md` |
| CRM Reports | Reference | Approved | Reference | `docs/07-reports/crm-reports.md` |
| Currency Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/financial/currency-engine.md` |

### D

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Dashboard Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/intelligence/dashboard-engine.md` |
| Dashboards | Reference | Approved | Reference | `docs/07-reports/dashboards.md` |
| Data Dictionary | Architecture | Approved | Authoritative | `docs/02-architecture/data-dictionary.md` |
| Database Architecture | Architecture | Approved | Authoritative | `docs/02-architecture/database-architecture.md` |
| Database Standards | Architecture | Approved | Authoritative | `docs/02-architecture/database-standards.md` |
| Decision Register (Redirect) | Cross-cutting | Approved | Derived | `docs/decision-register.md` |
| Deployment Architecture | Architecture | Approved | Authoritative | `docs/02-architecture/deployment-architecture.md` |
| DevOps Architecture | Architecture | Approved | Authoritative | `docs/02-architecture/devops-architecture.md` |
| Document AI | Reference | Approved | Reference | `docs/09-ai/document-ai.md` |
| Document Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/document/document-engine.md` |
| Document Index (this file) | Cross-cutting | Approved | Derived | `docs/DOCUMENT_INDEX.md` |
| Document Ownership Matrix | Cross-cutting | Approved | Derived | `docs/DOCUMENT_OWNERSHIP_MATRIX.md` |
| Document Traceability | Cross-cutting | Approved | Derived | `docs/DOCUMENT_TRACEABILITY.md` |
| Domain-Driven Design | Architecture | Approved | Authoritative | `docs/02-architecture/domain-driven-design.md` |
| Domain Map | Architecture | Approved | Authoritative | `docs/02-architecture/domain-map.md` |
| Domain notes — Foundation, and 15 module folders | Reference | Draft | Reference | `docs/04-domains/` |

### E

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| E-Invoice / IRN | Reference | Approved | Reference | `docs/06-integrations/e-invoice-irn.md` |
| E-Way Bill | Reference | Approved | Reference | `docs/06-integrations/e-way-bill.md` |
| Email Integration | Reference | Approved | Reference | `docs/06-integrations/email.md` |
| Engine Catalog | ERP Core | Approved | Derived | `docs/10-erp-core/ENGINE_CATALOG.md` |
| Engine Usage Matrix | Cross-cutting | Approved | Derived | `docs/ENGINE_USAGE_MATRIX.md` |
| ERD — Foundation | Reference | Approved | Reference | `docs/11-erd/foundation.mmd` |
| ERD Template | Template | Approved | Reference | `docs/11-erd/_template.mmd` |
| ERP Core README | ERP Core | Approved | Authoritative | `docs/10-erp-core/README.md` |
| Event Catalog | Architecture | Approved | Authoritative | `docs/02-architecture/event-catalog.md` |
| Event Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/integration/event-engine.md` |
| Event Template | Template | Approved | Reference | `docs/99-templates/event-template.md` |
| Export Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/data-exchange/export-engine.md` |

### F

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| File Storage Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/document/file-storage-engine.md` |
| Forecasting | Reference | Approved | Reference | `docs/09-ai/forecasting.md` |
| Foundation Freeze v1 | Foundation | Approved | Authoritative | `docs/FOUNDATION_FREEZE_v1.md` |
| FRS | Business Blueprint | Approved | Authoritative | `docs/01-master/frs.md` |

### G

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Glossary | Foundation | Approved | Authoritative | `docs/glossary.md` |
| Glossary Index | Cross-cutting | Approved | Derived | `docs/GLOSSARY_INDEX.md` |
| Google Workspace | Reference | Approved | Reference | `docs/06-integrations/google-workspace.md` |
| Governance | Foundation | Approved | Authoritative | `docs/governance.md` |
| GST / GSTN | Reference | Approved | Reference | `docs/06-integrations/gst-gstn.md` |
| GST Reports | Reference | Approved | Reference | `docs/07-reports/gst-reports.md` |

### I

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Identity Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/foundation/identity-engine.md` |
| Import Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/data-exchange/import-engine.md` |
| Integration Architecture | Architecture | Approved | Authoritative | `docs/02-architecture/integration-architecture.md` |
| Integration Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/integration/integration-engine.md` |
| Integration Template | Template | Approved | Reference | `docs/99-templates/integration-template.md` |
| Inventory Reports | Reference | Approved | Reference | `docs/07-reports/inventory-reports.md` |
| Inventory Rules | Reference | Approved | Reference | `docs/08-business-rules/inventory-rules.md` |

### L

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Legacy ADRs (ADR-0000..ADR-0011) | Legacy | Superseded | Superseded | `docs/05-adr/` |
| Locale Template | Template | Approved | Reference | `docs/99-templates/locale-template.md` |
| Localization — Bahrain, Global, India, Kuwait, Oman, Qatar, Saudi Arabia, UAE | Reference | Approved | Reference | `docs/14-localization/` |
| Localization Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/foundation/localization-engine.md` |

### M

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Master Architecture | Architecture | Approved | Authoritative | `docs/02-architecture/master-architecture.md` |
| Master PRD | Business Blueprint | Approved | Authoritative | `docs/01-master/prd.md` |
| Microsoft 365 | Reference | Approved | Reference | `docs/06-integrations/microsoft-365.md` |
| Migration Strategy | Foundation | Approved | Authoritative | `docs/migration-strategy.md` |
| Module Catalog | Cross-cutting | Approved | Derived | `docs/MODULE_CATALOG.md` |
| Module Dependency Matrix | Cross-cutting | Draft | Derived | `docs/module-dependency-matrix.md` |
| Module PRD Template | Template | Approved | Reference | `docs/99-templates/module-prd-template.md` |
| Multi-Tenant Architecture | Architecture | Approved | Authoritative | `docs/02-architecture/multi-tenant-architecture.md` |

### N

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Notification Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/integration/notification-engine.md` |
| Numbering Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/financial/numbering-engine.md` |

### O

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Observability Architecture | Architecture | Approved | Authoritative | `docs/02-architecture/observability-architecture.md` |
| OCR | Reference | Approved | Reference | `docs/06-integrations/ocr.md` |

### P

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Payments — PhonePe | Reference | Approved | Reference | `docs/06-integrations/payments-phonepe.md` |
| Payments — Razorpay | Reference | Approved | Reference | `docs/06-integrations/payments-razorpay.md` |
| Payments — Stripe | Reference | Approved | Reference | `docs/06-integrations/payments-stripe.md` |
| Payroll Reports | Reference | Approved | Reference | `docs/07-reports/payroll-reports.md` |
| Performance | Foundation | Approved | Authoritative | `docs/performance.md` |
| Permission Management Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/foundation/permission-management-engine.md` |
| Posting Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/financial/posting-engine.md` |
| Posting Rules | Reference | Approved | Reference | `docs/08-business-rules/posting-rules.md` |
| Prompt Library | Reference | Approved | Reference | `docs/09-ai/prompt-library.md` |
| Projects Reports | Reference | Approved | Reference | `docs/07-reports/projects-reports.md` |

### Q

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Quality Attributes | Architecture | Approved | Authoritative | `docs/02-architecture/quality-attributes.md` |

### R

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| RAG | Reference | Approved | Reference | `docs/09-ai/rag.md` |
| Reference Data | Architecture | Approved | Authoritative | `docs/02-architecture/reference-data.md` |
| Report Template | Template | Approved | Reference | `docs/99-templates/report-template.md` |
| Reporting Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/intelligence/reporting-engine.md` |
| Repository Map | Cross-cutting | Approved | Derived | `docs/REPOSITORY_MAP.md` |
| Risk Register | Business Blueprint | Approved | Authoritative | `docs/01-master/risk-register.md` |
| Roadmap | Business Blueprint | Approved | Authoritative | `docs/01-master/roadmap.md` |
| Rules Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/workflow/rules-engine.md` |

### S

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Scheduler Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/workflow/scheduler-engine.md` |
| Scope | Business Blueprint | Approved | Authoritative | `docs/01-master/scope.md` |
| Search Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/intelligence/search-engine.md` |
| Security Architecture | Architecture | Approved | Authoritative | `docs/02-architecture/security-architecture.md` |
| SMS Integration | Reference | Approved | Reference | `docs/06-integrations/sms.md` |
| Sprint PRD Template | Template | Approved | Reference | `docs/99-templates/sprint-prd-template.md` |
| SRS | Business Blueprint | Approved | Authoritative | `docs/01-master/srs.md` |
| Success Metrics | Business Blueprint | Approved | Authoritative | `docs/01-master/success-metrics.md` |

### T

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Tax Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/financial/tax-engine.md` |
| Tax Rules | Reference | Approved | Reference | `docs/08-business-rules/tax-rules.md` |
| Testing Strategy | Architecture | Approved | Authoritative | `docs/02-architecture/testing-strategy.md` |
| Tool Calling | Reference | Approved | Reference | `docs/09-ai/tool-calling.md` |

### U

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| UI Component Template | Template | Approved | Reference | `docs/99-templates/ui-component-template.md` |
| UI Components — Data Grid, Voucher Grid, Master Form, Lookup Dialog, Filter Panel, Dashboard Cards, Approval Timeline, Activity Feed | Reference | Approved | Reference | `docs/12-ui-components/` |
| UI/UX Design System | Design | Approved | Authoritative | `docs/03-design/ui-ux-design-system.md` |
| UX Standards | Design | Approved | Authoritative | `docs/03-design/ux-standards.md` |

### V

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Vision | Business Blueprint | Approved | Authoritative | `docs/00-vision/vision.md` |
| Voucher Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/financial/voucher-engine.md` |
| Voucher Posting Workflow | Reference | Approved | Reference | `docs/13-workflows/voucher-posting.md` |

### W

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| WhatsApp Integration | Reference | Approved | Reference | `docs/06-integrations/whatsapp.md` |
| Workflow Engine | ERP Core | Approved | Authoritative | `docs/10-erp-core/workflow/workflow-engine.md` |
| Workflow Rules | Reference | Approved | Reference | `docs/08-business-rules/workflow-rules.md` |
| Workflow Template | Template | Approved | Reference | `docs/99-templates/workflow-template.md` |
| Workflows — Sales, Purchase, Inventory, Payroll, AMC, Field Visit | Reference | Approved | Reference | `docs/13-workflows/` |

## References

- `docs/REPOSITORY_MAP.md`
- `docs/DOCUMENT_TRACEABILITY.md`
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md`
- `docs/_meta.json`
