---
title: "MOD-003 — Sales Module PRD"
summary: "Authoritative business specification for the Sales bounded context. Consumes ERP Core Engines and Accepted ADRs; does not redefine platform behavior."
layer: "business"
owner: "Revenue"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-003"
module: "Sales"
domain: "Revenue"
bounded_context: "Order-to-Cash"
depends_on: ["docs/canon.md", "docs/10-erp-core/ENGINE_CATALOG.md", "docs/11-adrs/ADR_INDEX.md", "docs/02-architecture/quality-attributes.md"]
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-015", "ENG-017", "ENG-018", "ENG-019", "ENG-021", "ENG-024", "ENG-025", "ENG-012", "ENG-013", "ENG-016", "ENG-020", "ENG-022", "ENG-023", "ENG-026", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-032", "ADR-014"]
related_modules: ["MOD-001", "MOD-002", "MOD-005", "MOD-006", "MOD-002", "MOD-017"]
referenced_by: []
tags: ["module", "prd"]
document_type: "Module PRD"
---

# MOD-003 — Sales Module PRD

> **Authoritative business specification** for the **Sales (MOD-003)** bounded context. This document consumes — and MUST NOT redefine — Foundation, Architecture, ERP Core Engines (`ENG-NNN`), and Accepted ADRs (`ADR-NNN`). Cross-module references use `MOD-NNN`. On any conflict with an upstream authoritative document, the upstream wins and this PRD is corrected in the same change.

## 1. Module Overview

**Purpose.** Quotations, sales orders, delivery, invoicing, and receivables handoff for the order-to-cash lifecycle.

**Business Objectives.**

- Provide the authoritative business surface for the Order-to-Cash bounded context.
- Deliver the capabilities enumerated in section 2 to the personas in section 3.
- Consume ERP Core Engines listed in section 12 without redefining platform behavior.

**Success Criteria.**

- All in-scope capabilities are supported end-to-end with the declared engines.
- All state-changing transactions are audited (via ENG-004 Audit Engine) and authorized (via ENG-002 Authorization Engine).
- Cross-module interactions occur only via published events, approved APIs, or shared master data.

**Out of Scope.**

- Redefinition of any ERP Core Engine behavior.
- Concrete database schemas, API contracts, UI mockups, or source code.
- Sprint-level user stories and test cases.

## 2. Business Scope

**Capabilities.**

- Quotation and pricing
- Sales order capture and fulfilment
- Delivery / dispatch
- Sales invoicing (incl. e-invoice)
- Discounts, schemes, and promotions
- Sales returns and credit notes

**Submodules.**

- Quotations
- Orders
- Deliveries
- Invoices
- Returns

**Business Responsibilities.**

- Own the master data and transactions listed in sections 5–6 for the Order-to-Cash bounded context.
- Emit the events in section 8 for downstream consumers.
- Respect the module dependency graph declared in section 13.

**Business Ownership.**

- Primary owner: **Revenue**.
- Governance: Product + Architecture review per `docs/DOCUMENT_OWNERSHIP_MATRIX.md`.

## 3. Personas

**Primary Users.**

- Sales Executive
- Sales Manager
- Order Desk

**Secondary Users.**

- Accountant
- Warehouse Manager

**External Actors.**

- Customer
- Payment Gateway

**Permissions (business level).** Concrete grants and RBAC/ABAC policies are enforced by ENG-002 Authorization Engine and ENG-003 Permission Management Engine, per ADR-032 (RBAC + ABAC). This PRD names business-level roles only; it does not redefine the authorization model.

## 4. Business Processes

**Process Catalogue.**

- Quote-to-order
- Order-to-delivery
- Delivery-to-invoice
- Return and credit note

**High-level Workflows.** Each process runs on ENG-010 Workflow Engine (where a long-running workflow is required) and ENG-011 Approval Engine (where multi-step approval is required). Rule evaluations use ENG-012 Rules Engine.

**Business Lifecycle & State Transitions.** State machines for each transaction are declared in section 6. States and transitions are business-owned; enforcement of transition legality is delegated to the workflow and rules engines.

## 5. Master Data

**Business Entities.**

- Customer
- Price List
- Discount Scheme
- Sales Territory
- Salesperson

**Ownership.** All entities above are owned by **Sales (MOD-003)** unless explicitly declared as shared in section 13.

**Relationships.** Entities relate to platform master data (Tenant, Company, Branch, User) exposed by **Platform Administration (MOD-001)** and to cross-module master data listed in section 13.

**Lifecycle.** Standard lifecycle: `Draft → Active → Inactive → Archived`. Deviations, if any, are declared per entity in the module's future data-model artifacts (out of scope here).

**Validation Rules.** Structural validations (required fields, referential integrity, uniqueness) are declarative and enforced by ENG-012 Rules Engine at capture time. Business-specific validations are listed in section 7.

## 6. Transactions

**Business Transactions.**

- Quotation
- Sales Order
- Delivery Note
- Sales Invoice
- Credit Note

**Lifecycle.** Each transaction follows a business lifecycle governed by ENG-010 Workflow Engine and, where applicable, ENG-011 Approval Engine.

**Approvals.** Multi-step approvals, delegation, and out-of-office handling are provided by ENG-011 Approval Engine per ADR-032 (RBAC + ABAC).

**Posting Behavior.** All ledger effects of module transactions are produced by ENG-016 Posting Engine — this module does not implement double-entry posting logic itself.

**Numbering.** All document numbers are produced by ENG-017 Numbering Engine using tenant-configured series — this module does not implement numbering algorithms.

**Audit.** Every state-changing operation is audited by ENG-004 Audit Engine per ADR-014 (Audit Strategy) — this module does not implement its own audit trail.

## 7. Business Rules

Module-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

- A sales invoice cannot be issued for a cancelled order.
- Credit limit breach requires explicit approval.
- Returns must reference an original invoice line.

## 8. Integration Points

**Inbound Interactions.** Callers invoke this module via approved APIs (API contracts are defined in Sprint PRDs, not here) and through subscribed events.

**Outbound Interactions.** This module invokes ERP Core Engines through their Capability Interfaces and consumes cross-module master data listed in section 13.

**Events Published.**

- QuotationIssued
- SalesOrderConfirmed
- DeliveryDispatched
- SalesInvoiceIssued
- CreditNoteIssued

**Events Consumed.**

- CustomerCreated
- InventoryReserved
- PaymentReceived

**External Systems (business categories only).**

- E-invoice gateway
- Payment gateway
- Logistics providers

## 9. Reports & Analytics

**Operational and Management Reports.**

- Sales Register
- Order Book
- Sales by Customer / Product / Territory
- Discount Impact
- Return Analysis

**Dashboards.** Delivered via ENG-022 Dashboard Engine; the KPI catalog is maintained in **Analytics (MOD-017)**.

**KPIs.** Cross-module KPIs are defined once in **Analytics (MOD-017)** and referenced from this module.

**Exports.** Bulk exports are handled by ENG-027 Export Engine in standard formats.

## 10. Configuration

**Business Configuration.** Delivered via ENG-005 Configuration Engine (tenant → company → context hierarchy). No configuration is hard-coded.

- Default price list
- Approval thresholds
- Numbering series
- Return window
- Credit-limit policy

**Defaults.** Reasonable defaults are set at platform level and may be overridden per tenant, per company, and per context, subject to the hierarchy above.

**Feature Toggles (business level only).** Business-level toggles for optional capabilities in section 2. Platform-level flags remain in **Platform Administration (MOD-001)**.

**Localization Options.** Provided by ENG-006 Localization Engine; per-locale content packs are activated per tenant. Locale coverage is declared in `docs/14-localization/`.

## 11. Non-functional Considerations

Non-functional targets inherit from `docs/02-architecture/quality-attributes.md`. Module-specific refinements:

- **Performance.** Interactive operations complete within the platform latency budget; batch operations (posting, payroll runs, imports) use the platform batch envelope.
- **Compliance.** Follows the data-classification and retention rules in the Data Constitution; regulated reports live in section 9.
- **Accessibility.** Meets the platform accessibility baseline per ADR-081 (Accessibility Standard) — enforcement lives in the design system, not this PRD.

## 12. ERP Core Engine Consumption

No engine behavior may be redefined. Consumption declared here is authoritative for **Sales (MOD-003)**.

**Required Engines.**

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
- ENG-015 Voucher Engine
- ENG-017 Numbering Engine
- ENG-018 Currency Engine
- ENG-019 Tax Engine
- ENG-021 Reporting Engine
- ENG-024 Event Engine
- ENG-025 Notification Engine

**Optional Engines.**

- ENG-012 Rules Engine
- ENG-013 Automation Engine
- ENG-016 Posting Engine
- ENG-020 Search Engine
- ENG-022 Dashboard Engine
- ENG-023 Integration Engine
- ENG-026 Import Engine
- ENG-027 Export Engine
- ENG-028 AI Copilot Engine

**Reason for Consumption.** Each engine is consumed to fulfil one or more capabilities declared in section 2 and to satisfy the transactional guarantees declared in section 6. Detailed engine-by-engine reasons are captured in Sprint PRDs.

## 13. Dependencies

**Depends On Modules.**

- MOD-001 Platform Administration
- MOD-002 Accounting
- MOD-005 Inventory
- MOD-006 CRM

**Provides To Modules.**

- MOD-002 Accounting
- MOD-017 Analytics

**Shared Master Data.** Master data owned elsewhere and consumed by this module (Customer, Supplier, Employee, Item, Bank Account, etc.) is consumed via read-only APIs owned by the source module.

**Shared Transactions.** Cross-module transactional handoffs occur only through published events in section 8 or approved APIs. No cyclic module dependency is permitted.

## 14. Future Enhancements

- Configure-Price-Quote
- Guided selling with AI
- Subscription billing

## 15. Conforms to Canon

- References **Foundation** — `docs/FOUNDATION_FREEZE_v1.md`.
- References **Canon** — `docs/canon.md`.
- References **Architecture** — `docs/02-architecture/master-architecture.md`.
- References **ERP Core** — `docs/10-erp-core/ENGINE_CATALOG.md`.
- References **Accepted ADRs** — `docs/11-adrs/ADR_INDEX.md`.

No content in this PRD overrides, replaces, or reinterprets the above.

## 16. Decisions Pending

Open decisions relevant to this module are recorded as ADR placeholders in `docs/11-adrs/` when raised, and referenced here by `ADR-NNN` once opened. No pending decisions are ratified in this PRD.

## 17. References

- `docs/FOUNDATION_FREEZE_v1.md`
- `docs/canon.md`
- `docs/02-architecture/master-architecture.md`
- `docs/02-architecture/quality-attributes.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/20-module-prds/README.md`
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md`
