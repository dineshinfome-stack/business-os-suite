---
title: "Document Index"
summary: "Alphabetical inventory of every BusinessOS repository document with layer, status, authority, and path."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-06"
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

## Governance Templates

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| Governance Template Framework — README | Cross-cutting | Approved | Authoritative | `docs/15-governance/README.md` |
| Governance Template Standard | Cross-cutting | Approved | Authoritative | `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md` |
| Governance Template Lifecycle | Cross-cutting | Approved | Authoritative | `docs/15-governance/GOVERNANCE_TEMPLATE_LIFECYCLE.md` |
| Governance Template Registry | Cross-cutting | Approved | Authoritative | `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` |
| Governance Template Index | Cross-cutting | Approved | Derived | `docs/15-governance/GOVERNANCE_TEMPLATE_INDEX.md` |
| Governance Template Capabilities Registry | Cross-cutting | Approved | Authoritative | `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` |
| Governance Template Dependency Matrix | Cross-cutting | Approved | Authoritative | `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` |
| Governance Template Dependency Matrix (YAML export) | Cross-cutting | Approved | Derived | `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.yaml` |
| GT-002 — Stage 1 Authoring Template | Cross-cutting | Approved | Authoritative | `docs/15-governance/templates/GT-002_STAGE1_AUTHORING.md` |
| GT-003 — Sprint Authoring Template | Cross-cutting | Approved | Authoritative | `docs/15-governance/templates/GT-003_SPRINT_AUTHORING.md` |
| GT-004 — Baseline Consolidation Template | Cross-cutting | Approved | Authoritative | `docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md` |
| GT-005 — Repository Audit Template | Cross-cutting | Approved | Authoritative | `docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md` |
| Governance Framework Release v1.0 | Cross-cutting | Released | Authoritative | `docs/15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md` |
| Governance Framework Release Notes v1.0 | Cross-cutting | Released | Authoritative | `docs/15-governance/GOVERNANCE_FRAMEWORK_RELEASE_NOTES_v1.0.md` |
| Governance Framework Manifest (JSON) | Cross-cutting | Released | Authoritative | `docs/15-governance/GOVERNANCE_FRAMEWORK_MANIFEST.json` |

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
| Product Documentation Baseline v1 | Foundation | Approved | Authoritative | `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md` |
| Sprint PRDs — Layer README | Delivery | Approved | Authoritative | `docs/30-sprint-prds/README.md` |
| Sprint PRD Template | Template | Approved | Authoritative | `docs/99-templates/sprint-prd-template.md` |
| Sprint Catalog | Cross-cutting | Approved | Derived | `docs/SPRINT_CATALOG.md` |
| Sprint Authoring Guide | Delivery | Approved | Authoritative | `docs/SPRINT_AUTHORING_GUIDE.md` |
| Sprint Roadmap | Delivery | Approved | Authoritative | `docs/SPRINT_ROADMAP.md` |
| Sprint Estimation Guide | Delivery | Approved | Authoritative | `docs/SPRINT_ESTIMATION_GUIDE.md` |
| Sprint Dependency Matrix | Delivery | Approved | Derived | `docs/SPRINT_DEPENDENCY_MATRIX.md` |
| Module Implementation Workflow | Delivery | Approved | Authoritative | `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` |
| MOD-001 Platform Administration — Sprint Plan (Stage 1) | Delivery | Approved | Authoritative | `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md` |
| MOD-002 Accounting — Sprint Plan (Stage 1) | Delivery | Approved | Authoritative | `docs/30-sprint-prds/accounting/MOD-002_SPRINT_PLAN.md` |
| MOD-003 Sales — Sprint Plan (Stage 1) | Delivery | Planning | Authoritative | `docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md` |
| MOD-004 Purchase — Sprint Plan (Stage 1) | Delivery | Approved | Authoritative | `docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md` |
| MOD-005 Inventory — Sprint Plan (Stage 1) | Delivery | Approved | Authoritative | `docs/30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md` |
| MOD-006 CRM — Sprint Plan (Stage 1) | Delivery | Approved | Authoritative | `docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md` |
| MOD-007 HRMS — Sprint Plan (Stage 1) | Delivery | Approved | Authoritative | `docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md` |
| MOD-008 Payroll — Sprint Plan (Stage 1) | Delivery | Approved | Authoritative | `docs/30-sprint-prds/payroll/MOD-008_SPRINT_PLAN.md` |
| MOD-019 Warehouse — Sprint Plan (Stage 1) | Delivery | Approved | Authoritative | `docs/30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md` |


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
| MOD001_PLATFORM_BASELINE_v1 | Module Baseline | Approved | Authoritative | `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md` |
| MOD002_ACCOUNTING_BASELINE_v1 | Module Baseline | Frozen | Authoritative | `docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md` |
| MOD003_SALES_BASELINE_v1 | Module Baseline | Frozen | Authoritative | `docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md` |
| MOD004_PURCHASE_BASELINE_v1 | Module Baseline | Frozen | Authoritative | `docs/40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md` |
| MOD005_INVENTORY_BASELINE_v1 | Module Baseline | Frozen | Authoritative | `docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md` |
| MOD006_CRM_BASELINE_v1 | Module Baseline | Frozen | Authoritative | `docs/40-module-baselines/MOD006_CRM_BASELINE_v1.md` |
| MOD007_HRMS_BASELINE_v1 | Module Baseline | Frozen | Authoritative | `docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md` |
| MOD019_WAREHOUSE_BASELINE_v1 | Module Baseline | Approved | Authoritative | `docs/40-module-baselines/MOD019_WAREHOUSE_BASELINE_v1.md` |
| Module Baseline Catalog | Cross-cutting | Approved | Derived | `docs/MODULE_BASELINE_CATALOG.md` |
| Module Baselines — Layer README | Module Baseline | Approved | Authoritative | `docs/40-module-baselines/README.md` |
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
| SPR-MOD-001-001 — Tenancy Foundation | Delivery | Done | Authoritative | `docs/30-sprint-prds/platform/SPR-MOD-001-001-tenancy-foundation.md` |
| SPR-MOD-001-002 — Organization Structure | Delivery | Done | Authoritative | `docs/30-sprint-prds/platform/SPR-MOD-001-002-organization-structure.md` |
| SPR-MOD-001-003 — Users, Roles & Permissions | Delivery | Done | Authoritative | `docs/30-sprint-prds/platform/SPR-MOD-001-003-users-roles-permissions.md` |
| SPR-MOD-001-004 — Configuration Hierarchy | Delivery | Done | Authoritative | `docs/30-sprint-prds/platform/SPR-MOD-001-004-configuration-hierarchy.md` |
| SPR-MOD-001-005 — Localization Packs | Delivery | Done | Authoritative | `docs/30-sprint-prds/platform/SPR-MOD-001-005-localization-packs.md` |
| SPR-MOD-001-006 — Audit Review & Platform Administration | Delivery | Done | Authoritative | `docs/30-sprint-prds/platform/SPR-MOD-001-006-audit-review-platform-administration.md` |
| SPR-MOD-002-001 — Accounting Foundation | Delivery | Done | Authoritative | `docs/30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md` |
| SPR-MOD-002-002 — Voucher Framework | Delivery | Done | Authoritative | `docs/30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md` |
| SPR-MOD-002-003 — Journal & Ledger Posting | Delivery | Done | Authoritative | `docs/30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md` |
| SPR-MOD-002-004 — Financial Statements | Delivery | Done | Authoritative | `docs/30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md` |
| SPR-MOD-002-005 — Taxation & Compliance Foundation | Delivery | Done | Authoritative | `docs/30-sprint-prds/accounting/SPR-MOD-002-005-taxation-compliance-foundation.md` |
| SPR-MOD-002-006 — Period Close & Audit | Delivery | Done | Authoritative | `docs/30-sprint-prds/accounting/SPR-MOD-002-006-period-close-audit.md` |
| SPR-MOD-003-001 — Sales Foundation | Delivery | Draft | Authoritative | `docs/30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md` |
| SPR-MOD-003-002 — Quotations & Sales Orders | Delivery | Draft | Authoritative | `docs/30-sprint-prds/sales/SPR-MOD-003-002-quotations-sales-orders.md` |
| SPR-MOD-003-003 — Delivery & Fulfillment | Delivery | Draft | Authoritative | `docs/30-sprint-prds/sales/SPR-MOD-003-003-delivery-fulfillment.md` |
| SPR-MOD-003-004 — Sales Invoicing | Delivery | Draft | Authoritative | `docs/30-sprint-prds/sales/SPR-MOD-003-004-sales-invoicing.md` |
| SPR-MOD-003-005 — Returns & Customer Adjustments | Delivery | Draft | Authoritative | `docs/30-sprint-prds/sales/SPR-MOD-003-005-returns-customer-adjustments.md` |
| SPR-MOD-003-006 — Sales Analytics & Controls | Delivery | Draft | Authoritative | `docs/30-sprint-prds/sales/SPR-MOD-003-006-sales-analytics-controls.md` |
| SPR-MOD-004-001 — Purchase Foundation | Delivery | Draft | Authoritative | `docs/30-sprint-prds/purchase/SPR-MOD-004-001-purchase-foundation.md` |
| SPR-MOD-004-002 — Requisitions, RFQs & Purchase Orders | Delivery | Draft | Authoritative | `docs/30-sprint-prds/purchase/SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md` |
| SPR-MOD-004-003 — Goods Receipt & Inspection | Delivery | Draft | Authoritative | `docs/30-sprint-prds/purchase/SPR-MOD-004-003-goods-receipt-inspection.md` |
| SPR-MOD-004-004 — Vendor Billing & Commercial 3-Way Match | Delivery | Draft | Authoritative | `docs/30-sprint-prds/purchase/SPR-MOD-004-004-vendor-billing-3-way-match.md` |
| SPR-MOD-004-005 — Purchase Returns & Vendor Adjustments | Delivery | Draft | Authoritative | `docs/30-sprint-prds/purchase/SPR-MOD-004-005-purchase-returns-vendor-adjustments.md` |
| SPR-MOD-004-006 — Purchase Analytics & Controls | Delivery | Draft | Authoritative | `docs/30-sprint-prds/purchase/SPR-MOD-004-006-purchase-analytics-controls.md` |
| SPR-MOD-005-001 — Inventory Foundation | Delivery | Draft | Authoritative | `docs/30-sprint-prds/inventory/SPR-MOD-005-001-inventory-foundation.md` |
| SPR-MOD-005-002 — Inventory Receipts & Putaway | Delivery | Draft | Authoritative | `docs/30-sprint-prds/inventory/SPR-MOD-005-002-inventory-receipts-putaway.md` |
| SPR-MOD-005-003 — Inventory Issues, Transfers & Reservations | Delivery | Draft | Authoritative | `docs/30-sprint-prds/inventory/SPR-MOD-005-003-inventory-issues-transfers-reservations.md` |
| SPR-MOD-005-004 — Inventory Adjustments & Stock Counting | Delivery | Draft | Authoritative | `docs/30-sprint-prds/inventory/SPR-MOD-005-004-inventory-adjustments-stock-counting.md` |
| SPR-MOD-005-005 — Inventory Valuation & Replenishment | Delivery | Draft | Authoritative | `docs/30-sprint-prds/inventory/SPR-MOD-005-005-inventory-valuation-replenishment.md` |
| SPR-MOD-005-006 — Inventory Analytics & Operational Controls | Delivery | Draft | Authoritative | `docs/30-sprint-prds/inventory/SPR-MOD-005-006-inventory-analytics-operational-controls.md` |
| SPR-MOD-019-001 — Warehouse Foundation | Delivery | Draft | Authoritative | `docs/30-sprint-prds/warehouse/SPR-MOD-019-001-warehouse-foundation.md` |
| SPR-MOD-019-002 — Inbound Execution | Delivery | Draft | Authoritative | `docs/30-sprint-prds/warehouse/SPR-MOD-019-002-inbound-execution.md` |
| SPR-MOD-019-003 — Storage & Slotting | Delivery | Draft | Authoritative | `docs/30-sprint-prds/warehouse/SPR-MOD-019-003-storage-slotting.md` |
| SPR-MOD-019-004 — Outbound Execution | Delivery | Draft | Authoritative | `docs/30-sprint-prds/warehouse/SPR-MOD-019-004-outbound-execution.md` |
| SPR-MOD-019-005 — Yard, Dock & Load-Out | Delivery | Draft | Authoritative | `docs/30-sprint-prds/warehouse/SPR-MOD-019-005-yard-dock-load-out.md` |
| SPR-MOD-019-006 — Warehouse Labor, Equipment & Analytics | Delivery | Draft | Authoritative | `docs/30-sprint-prds/warehouse/SPR-MOD-019-006-warehouse-labor-equipment-analytics.md` |
| SPR-MOD-006-001 — CRM Foundation | Delivery | Draft | Authoritative | `docs/30-sprint-prds/crm/SPR-MOD-006-001-crm-foundation.md` |
| SPR-MOD-006-002 — Leads | Delivery | Draft | Authoritative | `docs/30-sprint-prds/crm/SPR-MOD-006-002-leads.md` |
| SPR-MOD-006-003 — Opportunities | Delivery | Draft | Authoritative | `docs/30-sprint-prds/crm/SPR-MOD-006-003-opportunities.md` |
| SPR-MOD-006-004 — Activities & Communications | Delivery | Draft | Authoritative | `docs/30-sprint-prds/crm/SPR-MOD-006-004-activities-communications.md` |
| SPR-MOD-006-005 — Campaigns | Delivery | Draft | Authoritative | `docs/30-sprint-prds/crm/SPR-MOD-006-005-campaigns.md` |
| SPR-MOD-006-006 — Customer 360 & Analytics | Delivery | Draft | Authoritative | `docs/30-sprint-prds/crm/SPR-MOD-006-006-customer-360-analytics.md` |
| SPR-MOD-007-001 — HRMS Foundation & Employee Master | Delivery | Draft | Authoritative | `docs/30-sprint-prds/hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md` |
| SPR-MOD-007-002 — Employment Lifecycle (Hire & Exit) | Delivery | Draft | Authoritative | `docs/30-sprint-prds/hrms/SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md` |
| SPR-MOD-007-003 — Attendance & Leave | Delivery | Draft | Authoritative | `docs/30-sprint-prds/hrms/SPR-MOD-007-003-attendance-and-leave.md` |
| SPR-MOD-007-004 — Performance & Appraisal | Delivery | Draft | Authoritative | `docs/30-sprint-prds/hrms/SPR-MOD-007-004-performance-and-appraisal.md` |
| SPR-MOD-007-005 — Learning & Development and Self-Service | Delivery | Draft | Authoritative | `docs/30-sprint-prds/hrms/SPR-MOD-007-005-learning-development-and-self-service.md` |
| SPR-MOD-007-006 — HR Analytics & Compliance | Delivery | Draft | Authoritative | `docs/30-sprint-prds/hrms/SPR-MOD-007-006-hr-analytics-and-compliance.md` |
| SPR-MOD-008-001 — Payroll Foundation & Salary Structures | Delivery | Draft | Authoritative | `docs/30-sprint-prds/payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md` |
| SPR-MOD-008-002 — Payroll Cycles & Runs | Delivery | Draft | Authoritative | `docs/30-sprint-prds/payroll/SPR-MOD-008-002-payroll-cycles-and-runs.md` |
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

### Module PRDs (`docs/20-module-prds/`)

| Document | Layer | Status | Authority | Path |
| --- | --- | --- | --- | --- |
| 20 Module PRDs — Overview | Module PRDs | Approved | Authoritative | `docs/20-module-prds/README.md` |
| MOD-001 Platform Administration — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/platform/README.md` |
| MOD-001 Platform Administration — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/platform/MODULE_PRD.md` |
| MOD-002 Accounting — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/accounting/README.md` |
| MOD-002 Accounting — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/accounting/MODULE_PRD.md` |
| MOD-003 Sales — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/sales/README.md` |
| MOD-003 Sales — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/sales/MODULE_PRD.md` |
| MOD-004 Purchase — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/purchase/README.md` |
| MOD-004 Purchase — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/purchase/MODULE_PRD.md` |
| MOD-005 Inventory — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/inventory/README.md` |
| MOD-005 Inventory — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/inventory/MODULE_PRD.md` |
| MOD-006 CRM — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/crm/README.md` |
| MOD-006 CRM — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/crm/MODULE_PRD.md` |
| MOD-007 HRMS — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/hrms/README.md` |
| MOD-007 HRMS — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/hrms/MODULE_PRD.md` |
| MOD-008 Payroll — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/payroll/README.md` |
| MOD-008 Payroll — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/payroll/MODULE_PRD.md` |
| MOD-009 Manufacturing — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/manufacturing/README.md` |
| MOD-009 Manufacturing — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/manufacturing/MODULE_PRD.md` |
| MOD-010 Projects — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/projects/README.md` |
| MOD-010 Projects — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/projects/MODULE_PRD.md` |
| MOD-011 AMC — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/amc/README.md` |
| MOD-011 AMC — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/amc/MODULE_PRD.md` |
| MOD-012 Field Service — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/field-service/README.md` |
| MOD-012 Field Service — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/field-service/MODULE_PRD.md` |
| MOD-013 Assets — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/assets/README.md` |
| MOD-013 Assets — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/assets/MODULE_PRD.md` |
| MOD-014 Fleet — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/fleet/README.md` |
| MOD-014 Fleet — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/fleet/MODULE_PRD.md` |
| MOD-015 POS — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/pos/README.md` |
| MOD-015 POS — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/pos/MODULE_PRD.md` |
| MOD-016 Service Desk — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/service-desk/README.md` |
| MOD-016 Service Desk — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/service-desk/MODULE_PRD.md` |
| MOD-017 Analytics — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/analytics/README.md` |
| MOD-017 Analytics — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/analytics/MODULE_PRD.md` |
| MOD-018 AI Workspace — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/ai/README.md` |
| MOD-018 AI Workspace — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/ai/MODULE_PRD.md` |
| MOD-019 Warehouse — Guide | Module PRDs | Approved | Reference | `docs/20-module-prds/warehouse/README.md` |
| MOD-019 Warehouse — PRD | Module PRDs | Approved | Authoritative | `docs/20-module-prds/warehouse/MODULE_PRD.md` |

## References

- `docs/REPOSITORY_MAP.md`
- `docs/DOCUMENT_TRACEABILITY.md`
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md`
- `docs/20-module-prds/README.md`
- `docs/_meta.json`
