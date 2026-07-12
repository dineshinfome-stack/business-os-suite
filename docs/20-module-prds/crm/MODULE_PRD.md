---
title: "MOD-006 — CRM Module PRD"
summary: "Authoritative business specification for the CRM (Customer Relationship) bounded context. Consumes ERP Core Engines and Accepted ADRs; does not redefine platform behavior."
layer: "business"
owner: "Revenue"
status: "approved"
updated: "2026-07-12"
legacy_updated: "2026-07-05"
module_id: "MOD-006"
module: "CRM"
domain: "Customer"
bounded_context: "Customer Relationship"
depends_on: ["docs/canon.md", "docs/10-erp-core/ENGINE_CATALOG.md", "docs/11-adrs/ADR_INDEX.md", "docs/02-architecture/quality-attributes.md"]
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-026", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
related_modules: ["MOD-001", "MOD-003", "MOD-012", "MOD-016", "MOD-017"]
referenced_by: []
tags: ["module", "prd"]
document_type: "Module PRD"
derived_from: "docs/20-module-prds/crm/MODULE_PRD.md (pre-freeze, updated 2026-07-05)"
---

# MOD-006 — CRM Module PRD

> **Authoritative business specification** for the **CRM (MOD-006)** bounded context. This document consumes — and MUST NOT redefine — Foundation, Architecture, ERP Core Engines (`ENG-NNN`), and Accepted ADRs (`ADR-NNN`). Cross-module references use `MOD-NNN`. On any conflict with an upstream authoritative document, the upstream wins and this PRD is corrected in the same change.

## 1. Module Overview

**Purpose.** Leads, opportunities, accounts, contacts, activities, and campaigns supporting the revenue pipeline.

**Business Objectives.**

- Provide the authoritative business surface for the Customer Relationship bounded context.
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

- Lead capture and qualification
- Opportunity pipeline
- Account and contact management
- Activity, task, and meeting tracking
- Campaigns and segmentation
- Customer 360 view

**Submodules.**

- Leads
- Opportunities
- Accounts & Contacts
- Activities
- Campaigns

**Business Responsibilities.**

- Own the master data and transactions listed in sections 5–6 for the Customer Relationship bounded context.
- Emit the events in section 8 for downstream consumers.
- Respect the module dependency graph declared in section 13.

**Business Ownership.**

- Primary owner: **Revenue**.
- Governance: Product + Architecture review per `docs/DOCUMENT_OWNERSHIP_MATRIX.md`.

## 3. Personas

**Primary Users.**

- Sales Representative
- Sales Manager
- Marketing Manager

**Secondary Users.**

- Service Desk
- Field Service

**External Actors.**

- Prospect
- Customer
- Email/WhatsApp Provider

**Permissions (business level).** Concrete grants and RBAC/ABAC policies are enforced by ENG-002 Authorization Engine and ENG-003 Permission Management Engine, per ADR-032 (RBAC + ABAC). This PRD names business-level roles only; it does not redefine the authorization model.

## 4. Business Processes

**Process Catalogue.**

- Lead-to-opportunity
- Opportunity-to-order
- Campaign-to-lead
- Case-to-retention

**High-level Workflows.** Each process runs on ENG-010 Workflow Engine (where a long-running workflow is required) and ENG-011 Approval Engine (where multi-step approval is required). Rule evaluations use ENG-012 Rules Engine.

**Business Lifecycle & State Transitions.** State machines for each transaction are declared in section 6. States and transitions are business-owned; enforcement of transition legality is delegated to the workflow and rules engines.

## 5. Master Data

**Business Entities.**

- Lead
- Opportunity
- Account
- Contact
- Campaign
- Segment

**Ownership.** All entities above are owned by **CRM (MOD-006)** unless explicitly declared as shared in section 13.

**Relationships.** Entities relate to platform master data (Tenant, Company, Branch, User) exposed by **Platform Administration (MOD-001)** and to cross-module master data listed in section 13.

**Lifecycle.** Standard lifecycle: `Draft → Active → Inactive → Archived`. Deviations, if any, are declared per entity in the module's future data-model artifacts (out of scope here).

**Validation Rules.** Structural validations (required fields, referential integrity, uniqueness) are declarative and enforced by ENG-012 Rules Engine at capture time. Business-specific validations are listed in section 7.

## 6. Transactions

**Business Transactions.**

- Activity
- Meeting
- Campaign Send

**Lifecycle.** Each transaction follows a business lifecycle governed by ENG-010 Workflow Engine and, where applicable, ENG-011 Approval Engine.

**Approvals.** Multi-step approvals, delegation, and out-of-office handling are provided by ENG-011 Approval Engine per ADR-032 (RBAC + ABAC).

**Posting Behavior.** CRM transactions have no accounting ledger effect and produce no financial vouchers. Ledger posting is out of scope for this module and remains owned by **MOD-002 Accounting**.

**Numbering.** CRM does not implement numbering algorithms. Where CRM documents require a tenant-visible number, numbers are produced by ENG-017 Numbering Engine only when a corresponding series is registered by the consuming sprint; ENG-017 is not listed as a required engine in section 12.

**Audit.** Every state-changing operation is audited by ENG-004 Audit Engine per ADR-014 (Audit Strategy) — this module does not implement its own audit trail.

## 7. Business Rules

Module-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

- A lead may be converted only once.
- Assignment rules must resolve to exactly one owner.
- Marketing consent must be recorded before campaign inclusion.

## 8. Integration Points

**Inbound Interactions.** Callers invoke this module via approved APIs (API contracts are defined in Sprint PRDs, not here) and through subscribed events.

**Outbound Interactions.** This module invokes ERP Core Engines through their Capability Interfaces and consumes cross-module master data listed in section 13.

**Events Published.**

- LeadCreated
- OpportunityWon
- OpportunityLost
- CampaignSent
- ActivityLogged

**Events Consumed.**

- SalesInvoiceIssued
- CustomerCreated
- ServiceTicketClosed

**External Systems (business categories only).**

- Email
- WhatsApp
- SMS
- Marketing platforms

## 9. Reports & Analytics

**Operational and Management Reports.**

- Pipeline
- Win/Loss
- Activity Report
- Campaign Effectiveness
- Customer 360

**Dashboards.** Delivered via ENG-022 Dashboard Engine; the cross-module KPI catalog is maintained in **Analytics (MOD-017)**.

**KPIs.** Cross-module KPIs are defined once in **Analytics (MOD-017)** and referenced from this module.

**Exports.** Bulk exports are handled by ENG-027 Export Engine in standard formats.

## 10. Configuration

**Business Configuration.** Delivered via ENG-005 Configuration Engine (tenant → company → context hierarchy). No configuration is hard-coded.

- Pipeline stages
- Lead scoring model
- Assignment rules
- Communication templates

**Defaults.** Reasonable defaults are set at platform level and may be overridden per tenant, per company, and per context, subject to the hierarchy above.

**Feature Toggles (business level only).** Business-level toggles for optional capabilities in section 2. Platform-level flags remain in **Platform Administration (MOD-001)**.

**Localization Options.** Provided by ENG-006 Localization Engine; per-locale content packs are activated per tenant. Locale coverage is declared in `docs/14-localization/`.

## 11. Non-functional Considerations

Non-functional targets inherit from `docs/02-architecture/quality-attributes.md`. Module-specific refinements:

- **Performance.** Interactive operations complete within the platform latency budget; batch operations (imports, campaign sends) use the platform batch envelope.
- **Compliance.** Follows the data-classification and retention rules in the Data Constitution; regulated reports live in section 9.
- **Accessibility.** Meets the platform accessibility baseline per ADR-081 (Accessibility Standard) — enforcement lives in the design system, not this PRD.

## 12. ERP Core Engine Consumption

No engine behavior may be redefined. Consumption declared here is authoritative for **CRM (MOD-006)**.

**Required Engines.**

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

**Optional Engines.**

- ENG-010 Workflow Engine
- ENG-011 Approval Engine
- ENG-023 Integration Engine
- ENG-026 Import Engine
- ENG-027 Export Engine
- ENG-028 AI Copilot Engine

**Reason for Consumption.** Each engine is consumed to fulfil one or more capabilities declared in section 2 and to satisfy the transactional guarantees declared in section 6. Detailed engine-by-engine reasons are captured in Sprint PRDs.

## 13. Dependencies

**Depends On Modules.**

- MOD-001 Platform Administration

**Provides To Modules.**

- MOD-003 Sales
- MOD-016 Service Desk
- MOD-012 Field Service
- MOD-017 Analytics

**Shared Master Data.** Master data owned elsewhere and consumed by this module (Customer, Supplier, Employee, Item, Bank Account, etc.) is consumed via read-only APIs owned by the source module.

**Shared Transactions.** Cross-module transactional handoffs occur only through published events in section 8 or approved APIs. No cyclic module dependency is permitted.

## 14. Future Enhancements

- AI next-best-action
- Predictive scoring
- Social listening

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
