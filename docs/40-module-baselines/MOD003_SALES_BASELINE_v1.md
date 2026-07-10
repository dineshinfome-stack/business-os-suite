---
title: "MOD003_SALES_BASELINE_v1 — Sales Module Baseline"
summary: "Stage 3 Module Baseline for MOD-003 Sales. Freezes the module after successful completion of Sprint PRDs SPR-MOD-003-001..006. Reference consolidation only — introduces no new requirements, engines, ADRs, or Sprint PRDs."
baseline_id: "MOD003_SALES_BASELINE_v1"
module_id: "MOD-003"
module_name: "Sales"
version: "1.0"
status: "Frozen"
owner: "Sales"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/sales/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-003-001", "SPR-MOD-003-002", "SPR-MOD-003-003", "SPR-MOD-003-004", "SPR-MOD-003-005", "SPR-MOD-003-006"]
layer: "delivery"
updated: "2026-07-07"
tags: ["baseline", "module", "MOD-003", "sales", "stage-3", "freeze"]
document_type: "Module Baseline"
---

# MOD003_SALES_BASELINE_v1 — Sales Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-003. It introduces no new requirements, engines, ADRs, or Sprint PRDs. Future changes to Sales scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD003_SALES_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD003_SALES_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the Sales module (`MOD-003`). It certifies that:

- Every Sprint PRD reserved in [`MOD-003_SPRINT_PLAN.md`](../30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md) (`SPR-MOD-003-001` … `SPR-MOD-003-006`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-003. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD003_SALES_BASELINE_v1` is the authoritative repository-wide Sales contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-003 Module PRD](../20-module-prds/sales/MODULE_PRD.md); reference only. Sales owns:

- Sales Foundation — customer master, customer hierarchy, sales organization, sales territories, salespersons, sales configuration, and sales numbering readiness.
- Quotations & Sales Orders — quotation lifecycle, sales-order lifecycle, pricing and discount evaluation, credit-limit approval routing, order amendments, and commercial-document numbering, attachments, notifications, and events.
- Delivery & Fulfillment — delivery orders, pick/pack workflow, shipment readiness, partial and complete fulfillment, delivery completion, and delivery lifecycle events; consumes inventory reservation contracts owned by MOD-005 Inventory.
- Sales Invoicing — commercial invoice generation, validation, approval, amendment and cancellation; credit notes and debit notes; invoice numbering, attachments, notifications, and lifecycle events; consumes accounting voucher creation, tax determination, and receivable creation contracts owned by MOD-002 Accounting.
- Returns & Customer Adjustments — return request, approval, validation against original invoice lines, return-receipt confirmation, customer adjustments, replacement and refund preparation, return numbering, attachments, notifications, and lifecycle events.
- Sales Analytics & Operational Controls — sales dashboards, KPI reporting, pipeline reporting, territory and salesperson performance, customer sales analytics, margin analytics, approval analytics, operational controls, audit readiness, read-model consumption, dashboard filtering, export readiness, and reporting events.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition.

## 3. Implemented Sprint Summary

Each subsection below records the sprint's purpose, major business capabilities, and completion status (**Done**) — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-003-001](../30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md) | Sales Foundation | Done | Customer master, customer hierarchy, sales organization, sales territories, salespersons, sales configuration, sales numbering readiness, foundation events, and the Sales Ownership, Customer Master Authority, Commercial Ownership Boundary, Sales Configuration Authority, and Customer Lifecycle Boundary conventions. |
| [SPR-MOD-003-002](../30-sprint-prds/sales/SPR-MOD-003-002-quotations-sales-orders.md) | Quotations & Sales Orders | Done | Quotation lifecycle, sales-order lifecycle, pricing and discount evaluation, credit-limit approval routing, order amendments, commercial-document numbering, attachments, notifications, sales-order events, and the Quotation Ownership, Sales Order Ownership, Pricing Boundary, and Approval Boundary conventions. |
| [SPR-MOD-003-003](../30-sprint-prds/sales/SPR-MOD-003-003-delivery-fulfillment.md) | Delivery & Fulfillment | Done | Delivery orders, pick/pack workflows, shipment readiness, partial and complete fulfillment, delivery completion, delivery numbering, delivery attachments, delivery notifications, delivery lifecycle events, and the Delivery Ownership, Inventory Consumption Boundary, Shipment Readiness, and Commercial Fulfillment Boundary conventions. |
| [SPR-MOD-003-004](../30-sprint-prds/sales/SPR-MOD-003-004-sales-invoicing.md) | Sales Invoicing | Done | Sales invoice generation, validation, approval, amendment, cancellation; credit notes and debit notes; invoice numbering, attachments, notifications, lifecycle events, and the Commercial Invoice Ownership, Accounting Consumption Boundary, Tax Consumption Boundary, and Receivable Boundary conventions. |
| [SPR-MOD-003-005](../30-sprint-prds/sales/SPR-MOD-003-005-returns-customer-adjustments.md) | Returns & Customer Adjustments | Done | Return request, approval, invoice-line validation, return-receipt confirmation, customer adjustments, replacement and refund preparation, return numbering, attachments, notifications, lifecycle events, and the Return Ownership and Customer Adjustment Boundary conventions. |
| [SPR-MOD-003-006](../30-sprint-prds/sales/SPR-MOD-003-006-sales-analytics-controls.md) | Sales Analytics & Controls | Done | Sales dashboards, KPI reporting, pipeline reporting, territory and salesperson performance, customer sales analytics, margin analytics, approval analytics, operational controls, audit readiness, read-model consumption, dashboard filtering, export readiness, reporting events, and the Analytics Ownership, Reporting Consumption Boundary, Analytics Read Model, Operational Reporting Boundary, and Dashboard Read Model conventions. |

## 4. Capability Coverage

Every capability defined by the Sales Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities.

| MOD-003 Capability Area | Sprint(s) |
| --- | --- |
| Customer master, customer hierarchy, sales organization, territories, salespersons | SPR-MOD-003-001 |
| Sales configuration, sales numbering readiness | SPR-MOD-003-001 |
| Quotation lifecycle, sales-order lifecycle, amendments | SPR-MOD-003-002 |
| Pricing and discount evaluation, credit-limit approval routing | SPR-MOD-003-002 |
| Delivery orders, pick/pack, shipment readiness, fulfillment lifecycle | SPR-MOD-003-003 |
| Sales invoicing, credit notes, debit notes | SPR-MOD-003-004 |
| Sales returns, customer adjustments, refund/replacement preparation | SPR-MOD-003-005 |
| Sales analytics, KPI/pipeline/territory/salesperson reporting, operational controls, dashboards | SPR-MOD-003-006 |
| Sales governance conventions (all summarized in §7) | Established across SPR-MOD-003-001 … SPR-MOD-003-006 |

No Sales capability sits outside the baseline; no orphans.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-003-001` through `SPR-MOD-003-006`.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-003-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-003-001, 002, 003, 004, 005, 006 |
| ENG-003 (Permission Management Engine) | SPR-MOD-003-001 |
| ENG-004 (Audit Engine) | SPR-MOD-003-001, 002, 003, 004, 005, 006 |
| ENG-005 (Configuration Engine) | SPR-MOD-003-001, 002 |
| ENG-006 (Localization Engine) | SPR-MOD-003-001 |
| ENG-007 (Document Engine) | SPR-MOD-003-002, 003, 004, 005 |
| ENG-008 (Attachment Engine) | SPR-MOD-003-002 |
| ENG-010 (Workflow Engine) | SPR-MOD-003-002, 003, 005 |
| ENG-011 (Approval Engine) | SPR-MOD-003-002, 003, 004, 005 |
| ENG-012 (Rules Engine) | SPR-MOD-003-002, 003, 005 |
| ENG-015 (Voucher Engine) | SPR-MOD-003-004 |
| ENG-017 (Numbering Engine) | SPR-MOD-003-001, 002, 003, 004, 005 |
| ENG-018 (Currency Engine) | SPR-MOD-003-001, 002, 003, 004, 005 |
| ENG-019 (Tax Engine) | SPR-MOD-003-004 |
| ENG-020 (Search Engine) | SPR-MOD-003-006 |
| ENG-021 (Reporting Engine) | SPR-MOD-003-004, 006 |
| ENG-022 (Dashboard Engine) | SPR-MOD-003-006 |
| ENG-024 (Event Engine) | SPR-MOD-003-001, 002, 003, 004, 005, 006 |
| ENG-025 (Notification Engine) | SPR-MOD-003-002, 003, 004, 005, 006 |
| ENG-027 (Export Engine) | SPR-MOD-003-004, 006 |

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-003-001` through `SPR-MOD-003-006`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-003-001, 002, 003, 004, 005, 006 |
| ADR-014 (Audit Strategy) | SPR-MOD-003-001, 002, 003, 004, 005, 006 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-003-001, 002, 003, 004, 005, 006 |

## 7. Governance Conventions Established

Every governance convention established across Sales Sprint PRDs 001–006 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-003-001 — Sales Foundation**

- **Sales Ownership Convention** — Sales owns customer master, customer hierarchy, sales organization, sales territories, salespersons, sales configuration, and sales numbering readiness under a tenant/company. Downstream modules consume this state and never redefine it.
- **Customer Master Authority Convention** — Customer master data lifecycle (create, edit, archive) is owned by Sales; other modules reference customers by stable identifier and never mutate customer master state.
- **Commercial Ownership Boundary Convention** — Sales owns commercial ownership; Accounting, Inventory, and CRM ownership boundaries are preserved and never redefined by Sales.
- **Sales Configuration Authority Convention** — Sales configuration resolves through Platform configuration hierarchy (`ENG-005`); Sales never redefines the Configuration Engine.
- **Customer Lifecycle Boundary Convention** — CRM lead/opportunity ownership remains with MOD-006 CRM; Sales consumes qualified customer records and never redefines CRM lifecycle state.

**From SPR-MOD-003-002 — Quotations & Sales Orders**

- **Quotation Ownership Convention** — Sales owns the quotation lifecycle end-to-end.
- **Sales Order Ownership Convention** — Sales owns the sales-order lifecycle end-to-end, including amendments and cancellation.
- **Pricing Boundary Convention** — Pricing and discount evaluation resolve via `ENG-005` configuration and `ENG-012` rules; Sales never redefines Configuration or Rules engine behavior.
- **Approval Boundary Convention** — Credit-limit breaches route through `ENG-011` for explicit approval; approval semantics are consumed, not redefined.

**From SPR-MOD-003-003 — Delivery & Fulfillment**

- **Delivery Ownership Convention** — Sales owns the delivery lifecycle (delivery order, pick/pack, shipment readiness, completion).
- **Inventory Consumption Boundary Convention** — Inventory reservation and stock movement remain owned by MOD-005 Inventory; Sales consumes reservation contracts and never redefines Inventory ownership.
- **Shipment Readiness Convention** — Shipment readiness is a Sales-owned commercial state distinct from Inventory stock state.
- **Commercial Fulfillment Boundary Convention** — Delivery completion is a commercial event; it does not create accounting vouchers, journals, or ledger movements.

**From SPR-MOD-003-004 — Sales Invoicing**

- **Commercial Invoice Ownership Convention** — Sales owns the commercial invoice lifecycle (invoice, credit note, debit note).
- **Accounting Consumption Boundary Convention** — Accounting voucher creation, journals, and ledger posting are owned by MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`; Sales consumes the accounting voucher contract and never redefines Accounting ownership.
- **Tax Consumption Boundary Convention** — Tax determination is owned by MOD-002 Accounting; Sales consumes tax determination results and never redefines tax calculation or configuration.
- **Receivable Boundary Convention** — Receivable creation and lifecycle remain owned by MOD-002 Accounting; Sales consumes the receivable contract and never redefines receivable state.

**From SPR-MOD-003-005 — Returns & Customer Adjustments**

- **Return Ownership Convention** — Sales owns the commercial return lifecycle end-to-end.
- **Customer Adjustment Boundary Convention** — Customer adjustments prepare downstream Accounting and Inventory state (via credit-note issuance owned by SPR-MOD-003-004 and inventory receipts owned by MOD-005) and never redefine those ownership boundaries.

**From SPR-MOD-003-006 — Sales Analytics & Controls**

- **Analytics Ownership Convention** — Sales owns commercial analytics and operational reporting.
- **Reporting Consumption Boundary Convention** — Analytics consume operational data from prior Sales Sprints; analytics SHALL NOT redefine operational ownership.
- **Analytics Read Model Convention** — Dashboards and KPIs are read-only projections; analytics never mutate transactional data.
- **Operational Reporting Boundary Convention** — Financial reporting is owned by MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`; inventory reporting is owned by MOD-005; analytics-portfolio KPIs are owned by MOD-017; predictive analytics are owned by MOD-018. Sales analytics consumes upstream summaries and never redefines them.
- **Dashboard Read Model Convention** — Dashboard filters, drill-down, and export operate over the read model; no transactional side effects.

**Governance Complement.** All conventions above complement — and do not replace — the Platform governance conventions established in `MOD001_PLATFORM_BASELINE_v1` (Event Ownership, Effective Configuration, Configuration Ownership, Localization Ownership, Audit Ownership) and the Accounting governance conventions established in `MOD002_ACCOUNTING_BASELINE_v1` (Voucher, Ledger Posting, Financial Reporting, Tax, Period Close, and Audit Review ownership).

**Freeze.** Governance conventions summarized herein are frozen for `MOD003_SALES_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-003-001` through `SPR-MOD-003-006`.** Every referenced event exists in [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md) or has been recorded as a deferred `R-EV-*` risk in the originating Sprint PRD. The Event Catalog remains the sole authoritative source and is not modified by this baseline. **No new event names SHALL be introduced by the Module Baseline.** Deferred `R-EV-*` risks are inherited from their originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD003_SALES_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by Sales. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**Upstream contracts consumed by Sales:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-002 Accounting** — voucher creation contract, tax determination, receivable creation, financial reporting summaries.
- **MOD-005 Inventory** — inventory reservation contracts, stock ownership, inventory reporting.
- **MOD-006 CRM** — qualified customer/opportunity records.

**Downstream consumers of the Sales baseline:**

- **MOD-011 AMC** — consumes customer master and commercial invoice references.
- **MOD-015 POS** — consumes customer master, sales configuration, and commercial-document contracts.
- **MOD-017 Analytics** — consumes Sales operational read models for portfolio KPIs; owns portfolio-level analytics.
- **MOD-018 AI Workspace** — consumes Sales operational read models for predictive analytics; owns predictive analytics.

Downstream modules MUST NOT own Sales master data, redefine commercial-document lifecycles, redefine the delivery lifecycle, or redefine Sales analytics ownership. No downstream module owns Sales assets.

## 10. Module Completion & Freeze Statement

All six planned Sales Sprint PRDs (`SPR-MOD-003-001` … `SPR-MOD-003-006`) exist, the [Sprint Plan](../30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md) is executed, and repository verification has been completed. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-003 Sales is now frozen for downstream consumption. Future changes to `MOD003_SALES_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD003_SALES_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD003_SALES_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- AI-driven sales forecasting.
- Predictive sales analytics and ML recommendations.
- Sales budgeting and target forecasting.
- Enterprise business-intelligence integrations.
- Advanced dashboard authoring beyond the read-model surface delivered in SPR-MOD-003-006.
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/sales/MODULE_PRD.md`](../20-module-prds/sales/MODULE_PRD.md) — MOD-003 Module PRD (authoritative).
- [`docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md`](../30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md`](../30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md)
- [`docs/30-sprint-prds/sales/SPR-MOD-003-002-quotations-sales-orders.md`](../30-sprint-prds/sales/SPR-MOD-003-002-quotations-sales-orders.md)
- [`docs/30-sprint-prds/sales/SPR-MOD-003-003-delivery-fulfillment.md`](../30-sprint-prds/sales/SPR-MOD-003-003-delivery-fulfillment.md)
- [`docs/30-sprint-prds/sales/SPR-MOD-003-004-sales-invoicing.md`](../30-sprint-prds/sales/SPR-MOD-003-004-sales-invoicing.md)
- [`docs/30-sprint-prds/sales/SPR-MOD-003-005-returns-customer-adjustments.md`](../30-sprint-prds/sales/SPR-MOD-003-005-returns-customer-adjustments.md)
- [`docs/30-sprint-prds/sales/SPR-MOD-003-006-sales-analytics-controls.md`](../30-sprint-prds/sales/SPR-MOD-003-006-sales-analytics-controls.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring framework.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](./MOD002_ACCOUNTING_BASELINE_v1.md) — upstream Accounting baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
