---
title: "Master PRD"
document_type: "Master PRD"
summary: "The single largest product document. The table of contents for the entire ERP: what BusinessOS does, for whom, and to what standard."
layer: "platform"
owner: "Platform / Product Council"
status: "approved"
version: "1.0.0"
created: "2026-07-05"
updated: "2026-07-05"
depends_on: ["canon", "00-vision/vision", "01-master/scope", "01-master/business-model", "01-master/success-metrics", "01-master/roadmap"]
referenced_by: ["01-master/roadmap", "02-architecture/master-architecture", "04-domains"]
tags: ["prd", "master", "business-blueprint", "requirements"]
---

# Master PRD — BusinessOS ERP

## Conforms to Canon

- **P.3** Authority Hierarchy — the Master PRD is subordinate to the Canon and to Architecture; every downstream domain PRD is subordinate to this document.
- **Chapter 1** Product Philosophy — one product, multi-everything by default, mobile parity, statutory-first, marketplace-independent core, ≤ 1 business day to first transaction.
- **Chapter 2** Product Principles — API-first, configuration-over-customization, mobile-first, offline-first, localizable-by-default.
- **Chapter 3** Architecture Principles — modular monolith, PostgreSQL as system of record, ERP Core Engines shared, bounded contexts.
- **Chapters 4–14** — every functional and non-functional area of this PRD conforms to the corresponding Canon chapter.

Any conflict resolves in the Canon's favor until amended by an approved ADR.

---

## 1. Executive Summary

BusinessOS ERP is one product that runs the entire operations, financial, people, and intelligence surface of a business — from a three-user startup to a three-thousand-user enterprise — on a single unified data model with an AI Copilot fabric threaded through every module.

This PRD is the **table of contents for the entire ERP**. Detailed requirements live in domain PRDs (`04-domains/**`), engine specifications (`10-erp-core/**`), integrations (`06-integrations/**`), reports (`07-reports/**`), business rules (`08-business-rules/**`), and AI surfaces (`09-ai/**`). This document establishes the frame; downstream documents fill it in.

**What we are building:** a modular-monolith SaaS ERP with the six capability layers defined in Canon P.4 (Platform, Financial, Operations, Business, People, Intelligence), delivered incrementally per the Roadmap, and governed as one product with one identity, one audit trail, and one AI fabric.

**Who it is for:** SMEs in India and the GCC that intend to grow into mid-market or enterprise on the same product. Full personas in §3.

**How success is judged:** by the Success Metrics document (`01-master/success-metrics.md`). Measurable, not aspirational.

## 2. Product Scope Summary

The **normative** in-scope / out-of-scope lists live in `01-master/scope.md`. In summary:

**In-scope (Phase 1 through Phase 4 of the Roadmap):** Accounting, Voucher, Tax (GST/TDS/TCS/VAT), Inventory, Sales, Purchase, Manufacturing (SME scale), CRM, Projects, AMC, Field Service, HRMS, Payroll, Assets, Fleet, POS, Analytics, AI Copilot, Reporting, Dashboards, Mobile parity, Localization (IN + GCC), Plugin framework.

**Out-of-scope initially:** CAD/PLM, implementation consulting services, generic e-commerce storefront, social networking, generic no-code app builder, industry verticals outside the target list.

## 3. Personas

Full persona narratives are maintained in `04-domains/personas.md` (deferred). Summary here:

| Persona | Primary modules used | Key needs |
|---|---|---|
| **Founder / CEO** | Dashboards, Cash flow, KPIs, AI Copilot | One-screen truth about the business; act on it in one tap. |
| **CFO / Finance Head** | Accounting, Statements, Tax, Audit, Approvals | Statutory correctness; hours-to-close; audit trail. |
| **Controller / Accountant** | Vouchers, Statements, Bank Recon, GST | Fast entry, keyboard parity, correct posting rules. |
| **Operations Head** | Sales, Purchase, Inventory, Production | Real-time stock; margins per order; workflow control. |
| **Sales Manager** | CRM, Quotes, Orders, Dashboards | Pipeline, quote-to-order, commission clarity. |
| **Field Sales Rep** | CRM Mobile, Orders Mobile | Offline order taking, price lists, customer 360. |
| **Warehouse Supervisor** | Inventory, Stock Moves, Barcode | Fast issue/receipt, count-based ops, mobile. |
| **HR Head** | HRMS, Payroll, Attendance, Leave | Compliant payroll, single source of employee truth. |
| **Payroll Admin** | Payroll, Statutory reports (PF, ESI, TDS) | Correct, on-time, provable. |
| **Field Technician (AMC/Service)** | Field Service Mobile | Offline visits, parts consumption, customer signoff. |
| **Store Cashier** | POS | Fast checkout, offline resilience, mixed payment. |
| **IT Lead / Admin** | Users, Roles, Configuration, Plugins | Configuration-over-customization; real API; audit. |
| **Auditor (external)** | Read-only audit surface | Machine-verifiable trail; export; drill-down. |

## 4. User Journeys (high-level)

Detailed journeys live per domain (`04-domains/**`). The frame:

- **J1 — Onboard a new tenant.** Sign up → pick country/edition → seeded CoA, tax, HSN, roles → first invoice within 1 business day (Canon 1.R6).
- **J2 — Order-to-cash.** Lead → Quote → Sales Order → Delivery → Invoice → Payment → Reconciliation.
- **J3 — Procure-to-pay.** Requisition → RFQ → Purchase Order → GRN → Bill → Payment → Reconciliation.
- **J4 — Hire-to-retire.** Requisition → Offer → Onboarding → Attendance/Leave → Payroll → Statutory → Exit.
- **J5 — Plan-to-produce.** BOM → Production Order → Consumption → Yield → Costing → Inventory update.
- **J6 — Field visit.** Ticket → Assign → Offline visit → Consumption → Signature → Sync → Invoice / warranty update.
- **J7 — Close the books.** Period → Reconcile → Adjustments → Reports → Statutory filing → Lock.
- **J8 — AI-assisted anything.** User asks; AI plans, proposes, gets approval, executes with audit (Canon 9).

## 5. Modules

Each module below is a bounded context (Canon 3.R2) and has a domain PRD under `04-domains/**` (to be authored in Pass 7+). Cross-links point to the destination even where the stub is still empty.

### 5.1 Platform layer

- **Foundation** — Tenancy, Companies, Branches, Financial Years, Number Series, Configuration.
- **Auth & Identity** — Login, SSO, MFA, session, device trust.
- **Users & Roles** — RBAC on the Permission Engine (`10-erp-core/permission-engine`).
- **Workflow** — Workflow Engine, state machines, approvals (`10-erp-core/workflow-engine`).
- **Notifications** — In-app, email, SMS, WhatsApp, push (`10-erp-core/notification-engine`).
- **Audit** — Immutable trail on every state change (`10-erp-core/audit-engine`).
- **Documents & Attachments** — Document + Attachment engines.

### 5.2 Financial Platform

- **Accounting Engine** (`10-erp-core/posting-engine`, `04-domains/accounting`).
- **Voucher Engine** — journal, receipt, payment, contra, adjustment, credit/debit note, memorandum.
- **Tax Engine** — GST (India), TDS, TCS, VAT (GCC), configurable jurisdictions.
- **Statements** — Trial Balance, P&L, Balance Sheet, Cash Flow, Ledger, Day Book, GSTR-1/3B, VAT return.
- **Banking** — Bank recon, cheque printing, payment files.

### 5.3 Operations Platform

- **Inventory** — Items, HSN/SAC, UoM, batches, serials, warehouses, bins, transfers, valuation (FIFO/Weighted).
- **Sales** — Quote → Order → Delivery → Invoice → Return.
- **Purchase** — Requisition → RFQ → PO → GRN → Bill → Return.
- **Manufacturing (SME scale)** — BOM, routing (basic), production orders, consumption, yield.
- **POS** — Fast checkout, offline resilience, mixed tender.

### 5.4 Business Platform

- **CRM** — Leads, opportunities, pipeline, activities, campaigns.
- **Projects** — Projects, tasks, timesheets, milestones, billing.
- **AMC** — Contracts, schedules, renewals, entitlement.
- **Field Service** — Tickets, dispatch, offline mobile visits, parts consumption.

### 5.5 People Platform

- **HRMS** — Employee master, org, positions, attendance, leave, shifts.
- **Payroll** — Salary structures, statutory (PF, ESI, PT, TDS), payslips.
- **Assets** — Asset register, depreciation, transfers, disposal.
- **Fleet** — Vehicles, drivers, trips, expenses.

### 5.6 Intelligence Platform

- **Analytics** — Dashboards, reports, drilldowns, exports.
- **AI Copilot** — Chat, agents, tool-calling, RAG, forecasting (`09-ai/**`).
- **Automation** — Rules, schedules, triggers (`10-erp-core/automation-engine`, `10-erp-core/rules-engine`).

## 6. Functional Scope (by capability layer)

Detailed FRs live in domain PRDs. This section is the *frame* — the capabilities each layer MUST deliver by the end of its roadmap phase. See `01-master/roadmap.md` for phasing.

### 6.1 Platform (foundation)

- Multi-tenant, multi-company, multi-branch from day one (Canon 1.R2).
- Configuration-as-data for numbering, workflows, approvals, roles, dashboards.
- Audit trail on every state change with actor, before, after, correlation id.
- Notification fanout across in-app / email / SMS / WhatsApp / push, controlled per user.

### 6.2 Financial Platform

- Double-entry posting via the Posting Engine only (Canon Ch. 5).
- Statutory-first tax handling (GST India, VAT GCC, TDS, TCS).
- Statement generation with drill-down to voucher and original transaction.
- Period lock and reopen with audit.

### 6.3 Operations Platform

- Item master with HSN/SAC, batches, serials, multi-UoM.
- Order-to-cash and procure-to-pay end-to-end with configurable approvals.
- POS with offline queue and reconciliation on reconnect.
- Manufacturing at SME depth (BOM, production order, consumption, yield).

### 6.4 Business Platform

- CRM with pipeline, activities, mobile field sales.
- Projects with timesheet-to-invoice.
- AMC with contract-to-renewal and entitlement checks.
- Field Service with offline-first mobile.

### 6.5 People Platform

- HRMS master with org, positions, attendance, leave, shifts.
- Payroll with country-correct statutory outputs.
- Assets and Fleet at SME depth.

### 6.6 Intelligence Platform

- Dashboards per persona and per module.
- AI Copilot with tool-calling, RAG on tenant data, and mandatory approval on state changes (Canon 9).
- Forecasting for cash, inventory, and demand.
- Automation triggers and schedules.

## 7. Non-functional Requirements

Non-functional targets are anchored to two normative documents; this section summarizes.

- **Performance:** dashboard first paint, API p95, list/search latency, mobile sync, report generation — targets in `performance.md`.
- **Quality attributes:** availability, durability, recoverability, security posture, privacy, scalability — targets in `quality-attributes.md`.
- **Multi-tenancy:** Canon 3.R6, 3.R7 — shared engines, isolated data.
- **Localization:** Canon 2.R5, Chapter 14 — every string, currency, date, and number format is locale-sourced.
- **Mobile parity:** Canon 1.R3 — primary field-user tasks work on a mobile viewport.
- **Offline resilience:** Canon 2.R4 — field workflows reconcile on reconnect.
- **Audit:** every state change is recorded with actor, correlation id, before/after (Canon Ch. 12).
- **Accessibility:** WCAG AA on every user-facing surface (details in `03-design/ux-standards.md`).

## 8. Business Rules

Authoritative rules live in `08-business-rules/**`:

- Accounting rules (posting invariants).
- Inventory rules (valuation, allocation, negative stock policy).
- Tax rules (per jurisdiction).
- Approval rules (configurable per tenant).
- Numbering rules (per company, per document type, per year).
- Workflow rules (state machines).
- Posting rules (which voucher posts to which accounts).

## 9. Constraints

- **Technical:** PostgreSQL as system of record (Canon 3.R1); modular monolith default (Canon 3.3); no per-tenant code branches (Canon 2.R7).
- **Regulatory:** GST/e-Invoice/e-Way Bill (India); VAT return schemas (GCC); data residency where required by contract.
- **Product:** No third-party paid marketplace required to deliver core operational capability (Canon 1.R5).
- **Delivery:** Time-to-first-transaction ≤ 1 business day with defaults (Canon 1.R6).

## 10. Integrations

Detailed integration contracts live in `06-integrations/**`. Categories:

- **Statutory:** GSTN, e-Invoice IRP, e-Way Bill, VAT portals per jurisdiction.
- **Banking:** payment initiation, statement fetch, virtual accounts.
- **Payments:** UPI, cards, wallets, mandate.
- **Communications:** email, SMS, WhatsApp Business, push.
- **AI:** provider-agnostic model gateway (Canon Ch. 9).
- **Marketplaces:** e-commerce channels (via connectors, not as core dependency).
- **Files:** object storage.
- **Directory / identity:** SSO providers.

Every integration MUST be replaceable without core code changes.

## 11. Reporting

Reports catalog lives in `07-reports/**`. Every report MUST be produced by the Reporting Engine (`10-erp-core/reporting-engine`) with a versioned definition, tenant-configurable filters, and drilldown to the underlying voucher or transaction.

## 12. AI Surfaces

AI is not a feature — it is a fabric. Detailed AI surfaces per module live in `09-ai/**`. The MUSTs:

- Every module has at least one AI surface designed with the module.
- Every AI state change requires human approval (Canon 9).
- Every AI action is fully audited with prompt, tool calls, and citations.
- The model provider is swappable behind the AI Gateway.

## 13. Mobile

Mobile parity is normative for field-user primary tasks (Canon 1.R3). The requirement is *capability* parity for primary tasks, not visual identity. Offline-first (Canon 2.R4) applies to field workflows.

## 14. Security & Compliance

Detailed posture lives in `02-architecture/security-architecture.md` (Pass 4C). This PRD requires:

- MFA available to every tenant; enforceable per role.
- RBAC on the Permission Engine; no module-local permissions (Canon 3.R6).
- Immutable audit trail on all state changes.
- Encryption at rest and in transit.
- Data residency options where the market or contract demands it.
- Privacy: subject rights (access, portability, erasure) supported at the platform layer.

## 15. Product-level Acceptance Criteria

For every capability layer and for the product as a whole, the layer is "shipped" only when:

1. Its Canon-referenced normative rules are met.
2. Its `performance.md` targets are met at agreed load.
3. Its `quality-attributes.md` targets are met.
4. Its API is versioned at `/v1` (Canon 2.R1).
5. Its mobile parity requirement is met (where applicable — Canon 1.R3).
6. Its localization catalog is complete for the shipping locales (Canon 2.R5).
7. Its audit and permission integration passes review.
8. Its acceptance journeys (§4) complete end-to-end on the target device/network profiles.
9. Its exit criteria in `01-master/roadmap.md` are satisfied.
10. Its success-metric baselines (`01-master/success-metrics.md`) are instrumented.

## 16. Dependencies

Cross-module and cross-engine dependencies live in `module-dependency-matrix.md`. The Master PRD only tracks *product-level* dependencies:

- The Canon precedes every PRD (Canon P.3).
- Business Model (`01-master/business-model.md`) influences metering, entitlement, and plan-gating; those architectural implications are decided in ADRs (Pass 6), not in the PRD.
- Success Metrics (`01-master/success-metrics.md`) must be instrumentable before a layer is "shipped."

Assumptions and risks live in their own registers (§17, §18).

## 17. Assumptions

Full register in `01-master/assumptions.md`. Do not duplicate here; when the PRD relies on an assumption, cite its `A-###` id.

## 18. Risks

Full register in `01-master/risk-register.md`. Do not duplicate here; when the PRD acknowledges a risk, cite its `R-###` id.

## 19. Open Questions

Product-level open questions (not module-specific):

- **OQ-1** — Depth of manufacturing beyond SME scale (deferred to Roadmap review after Phase 3).
- **OQ-2** — Multi-legal-entity consolidation depth beyond baseline (deferred).
- **OQ-3** — On-prem deployment mode (currently deferred; cloud-first per assumption A-005).
- **OQ-4** — Marketplace revenue share and certification depth (Business Model to sharpen; ADR to bind).

Module-level open questions live in the respective domain PRDs.

## 20. References

- **Canon:** `canon.md`
- **Vision:** `00-vision/vision.md`
- **Roadmap:** `01-master/roadmap.md`
- **Business Model:** `01-master/business-model.md`
- **Product Scope:** `01-master/scope.md`
- **Success Metrics:** `01-master/success-metrics.md`
- **Assumptions Register:** `01-master/assumptions.md`
- **Risk Register:** `01-master/risk-register.md`
- **Performance:** `performance.md`
- **Quality Attributes:** `quality-attributes.md`
- **Module Dependency Matrix:** `module-dependency-matrix.md`
- **Migration Strategy:** `migration-strategy.md`
- **Domain PRDs:** `04-domains/**`
- **ERP Core Engines:** `10-erp-core/**`
- **Business Rules:** `08-business-rules/**`
- **Integrations:** `06-integrations/**`
- **Reports:** `07-reports/**`
- **AI Surfaces:** `09-ai/**`
