---
title: "Product Scope"
document_type: "Product Scope"
summary: "Normative in-scope and out-of-scope definition for BusinessOS ERP, with deferrals and the scope change procedure."
layer: "platform"
owner: "Platform / Product Council"
status: "approved"
version: "1.0.0"
created: "2026-07-05"
updated: "2026-07-05"
depends_on: ["canon", "00-vision/vision", "01-master/prd", "01-master/business-model"]
referenced_by: ["01-master/prd", "01-master/roadmap", "01-master/business-model", "04-domains"]
tags: ["scope", "in-scope", "out-of-scope", "boundary", "business-blueprint"]
---

# Product Scope

## Conforms to Canon

- **Chapter 1** — Product Philosophy: what BusinessOS is and is not.
- **Chapter 2** — Product Principles: configuration over customization, plugin framework for extension.
- **P.3** — Scope changes that require Canon changes MUST be raised as ADRs first.

This document is **normative** for scope. When any other document appears to widen or narrow scope, this document wins until amended via §5.

---

## 1. In Scope

The following modules and capabilities are in scope for BusinessOS ERP over the six roadmap layers. Depth per module is defined in the domain PRDs; this list fixes *inclusion*.

### 1.1 Platform layer

- Multi-tenant, multi-company, multi-branch foundation.
- Auth, MFA, SSO baseline.
- Users and Roles (RBAC).
- Workflow Engine and Approval Engine.
- Notification Engine (in-app, email, SMS, WhatsApp, push).
- Audit Engine.
- Document Engine and Attachment Engine.
- Numbering Engine.
- Currency Engine.
- Localization Engine (India + GCC + baseline global).
- Scheduler, Automation, Rules Engines.
- Import, Export, Search, Reporting, Dashboard Engines.
- Permission Engine.
- API v1 gateway.
- Plugin Framework.

### 1.2 Financial layer

- **Accounting** (double-entry, statement-grade).
- **Voucher** (journal, receipt, payment, contra, adjustment, credit/debit note, memorandum).
- **Tax** (GST, TDS, TCS for India; VAT for GCC target jurisdictions).
- **Statements** (Trial Balance, P&L, Balance Sheet, Cash Flow, Ledger, Day Book).
- **Statutory returns** (GSTR-1, GSTR-3B; VAT returns per shipping GCC jurisdiction).
- **Banking** (statement import, reconciliation, payment initiation via file/API).
- **AR / AP** (aging, outstanding, dunning, collections basics).
- **Period close** and reopen with audit.

### 1.3 Operations layer

- **Inventory** (items, HSN/SAC, UoM, batches, serials, warehouses, bins, transfers, valuation FIFO/Weighted).
- **Sales** (Quote → Order → Delivery → Invoice → Return).
- **Purchase** (Requisition → RFQ → PO → GRN → Bill → Return).
- **Manufacturing (SME scale)** (BOM, production order, consumption, yield, basic routing).
- **POS** (fast checkout, offline queue, mixed tender).

### 1.4 Business layer

- **CRM** (leads, opportunities, activities, pipeline, campaigns).
- **Projects** (tasks, timesheets, milestones, billing).
- **AMC** (contracts, schedules, renewals, entitlement).
- **Field Service** (tickets, dispatch, offline mobile visits, parts consumption, signature).

### 1.5 People layer

- **HRMS** (employee master, org, positions, attendance, leave, shifts).
- **Payroll** (structures, statutory PF/ESI/PT/TDS for India; equivalents for shipping GCC jurisdictions; payslips, bank files).
- **Assets** (register, depreciation, transfers, disposal).
- **Fleet** (vehicles, drivers, trips, expenses).

### 1.6 Intelligence layer

- **Analytics** (dashboards, reports, drilldowns, exports).
- **AI Copilot** (chat, tool-calling, RAG on tenant data, module surfaces).
- **Forecasting** (cash, inventory, demand at SME scale).
- **Automation** (rules, schedules, triggers usable without code).

### 1.7 Cross-cutting

- **Mobile parity** for field-user primary tasks (Canon 1.R3).
- **Offline-first** for field workflows (Canon 2.R4).
- **Localization** for India and GCC target jurisdictions (Canon Ch. 14).
- **Plugin Framework** for extension (Canon 2.R7).

## 2. Out of Scope (initially)

The following are explicitly **not** in scope. They may be delivered by partner plugins or in a later scope change (§5), but they are not commitments of the core product.

- **CAD / PLM** — engineering design tooling.
- **Generic e-commerce storefront** — customer-facing storefronts. (Channel *connectors* to third-party e-commerce platforms are in scope as marketplace/plugin integrations.)
- **Social networking** — feeds, follows, generic messaging.
- **Generic no-code / low-code app builder** — the Plugin Framework is the extension mechanism (Canon 2.R7).
- **Implementation consulting services as a product line** — BusinessOS is SaaS software, not a services company; partners deliver implementation.
- **Vertical SaaS for industries outside the target list** (§4) — delivered via partner plugins.
- **CAD/PLM/BIM, healthcare EMR, ERP-for-education (deep), legal case management (deep), banking core** — out of scope for core.
- **Custom per-tenant code branches** — prohibited by Canon 2.R7.
- **Advanced MES / SCADA / shop-floor deep integration** — out of core; partner plugin territory.
- **Treasury management (advanced)** — beyond basic banking and reconciliation.
- **Multi-legal-entity consolidation beyond baseline** — deferred (§3).

## 3. Deferred (in-scope over time, not now)

The following are *directionally* in scope but explicitly deferred beyond the first four roadmap layers. They require Roadmap review before they are picked up.

- **Advanced MES** (shop-floor scheduling, OEE tracking, machine telemetry ingestion).
- **Treasury** (netting, cash pooling, FX exposure management).
- **Multi-legal-entity consolidation** (intercompany eliminations, multi-GAAP reporting).
- **Deep vertical extensions** in target industries (e.g., beverage distribution, jewelry retail).
- **On-prem / private-cloud deployment mode** (Assumption A-005 currently pins cloud-first).
- **Additional GCC jurisdictions** beyond the first shipping jurisdiction.
- **Additional global localizations** beyond baseline.

## 4. Target industries (for reference)

Scope is bounded by target industries. Feature depth is prioritized for:

- Trading and distribution
- Manufacturing (discrete and process, SME scale)
- Field service and AMC
- Professional services
- Retail (multi-store)
- Contracting and projects

Non-target industries (healthcare EMR, banking core, education administration deep, legal case management deep) are addressed via partner plugins, not core features.

## 5. Scope change procedure

Scope changes are governed by `governance.md`. In summary:

1. **Proposal** — anyone MAY propose a scope change with a written rationale and impact assessment.
2. **Impact assessment** — Product Council reviews impact on the Master PRD, Roadmap, Business Model, Assumptions Register, and Risk Register.
3. **Canon check** — if the change requires a Canon amendment, an ADR MUST be raised first (Canon P.3, A.2).
4. **Approval** — the Product Council approves or rejects. Approved changes update this document and every affected downstream document in the same pass.
5. **Traceability** — every scope change carries an ID and appears in the Decision Register (`decision-register.md`).

Scope changes that shrink scope (dropping a deliverable) MUST also update the Roadmap and Success Metrics accordingly.

## 6. Non-negotiables

Regardless of scope changes, the following remain in scope permanently:

- Multi-tenant, multi-company, multi-branch, multi-currency, multi-language, multi-financial-year (Canon 1.R2).
- Statutory-first behavior in target jurisdictions (Canon 1.R4).
- Mobile parity for field-user primary tasks (Canon 1.R3).
- Offline-first for field workflows (Canon 2.R4).
- API v1 for every shipped capability (Canon 2.R1).
- Full audit trail on every state change (Canon Ch. 12).
- Configuration-over-customization; no per-tenant code branches (Canon 2.R7).

## 7. References

- Canon (`canon.md`)
- Vision (`00-vision/vision.md`)
- Master PRD (`01-master/prd.md`)
- Roadmap (`01-master/roadmap.md`)
- Business Model (`01-master/business-model.md`)
- Assumptions Register (`01-master/assumptions.md`)
- Risk Register (`01-master/risk-register.md`)
- Governance (`governance.md`)
- Decision Register (`decision-register.md`)
