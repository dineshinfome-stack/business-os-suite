---
title: "MOD004_PURCHASE_BASELINE_v1 — Purchase Module Baseline"
summary: "Stage 3 Module Baseline for MOD-004 Purchase. Freezes the module after successful completion of Sprint PRDs SPR-MOD-004-001..006. Reference consolidation only — introduces no new requirements, engines, ADRs, or Sprint PRDs."
baseline_id: "MOD004_PURCHASE_BASELINE_v1"
module_id: "MOD-004"
module_name: "Purchase"
version: "1.0"
status: "Frozen"
owner: "Purchase"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/purchase/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-004-001", "SPR-MOD-004-002", "SPR-MOD-004-003", "SPR-MOD-004-004", "SPR-MOD-004-005", "SPR-MOD-004-006"]
layer: "delivery"
updated: "2026-07-10"
tags: ["baseline", "module", "MOD-004", "purchase", "stage-3", "freeze"]
document_type: "Module Baseline"
---

# MOD004_PURCHASE_BASELINE_v1 — Purchase Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-004. It introduces no new requirements, engines, ADRs, or Sprint PRDs. Future changes to Purchase scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD004_PURCHASE_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD004_PURCHASE_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the Purchase module (`MOD-004`). It certifies that:

- Every Sprint PRD reserved in [`MOD-004_SPRINT_PLAN.md`](../30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md) (`SPR-MOD-004-001` … `SPR-MOD-004-006`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-004. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD004_PURCHASE_BASELINE_v1` is the authoritative repository-wide Purchase contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-004 Module PRD](../20-module-prds/purchase/MODULE_PRD.md); reference only. Purchase owns:

- Purchase Foundation — vendor master, vendor categories, vendor groups, purchase organization, buyer assignment, purchase configuration, terms & conditions master, purchase price list master, and purchase numbering readiness.
- Requisitions, RFQs & Purchase Orders — purchase requisition lifecycle, requisition approval, RFQ lifecycle, supplier comparison, purchase-order lifecycle, purchase-order approval, purchase-order amendments, pricing and discount application, and commercial-document numbering, attachments, notifications, and events.
- Goods Receipt & Inspection — goods-receipt lifecycle (partial and complete), commercial inspection hold, tolerance validation against open PO quantity, warehouse handover contracts, attachments, notifications, and goods-receipt lifecycle events; consumes inventory ownership contracts owned by MOD-005 Inventory.
- Vendor Billing & Commercial 3-Way Match — vendor bill lifecycle, commercial 3-way match against PO and GRN, tolerance enforcement, tax determination inputs, payables creation contracts, attachments, notifications, and vendor-bill lifecycle events; consumes accounting voucher creation, tax determination, and payables creation contracts owned by MOD-002 Accounting.
- Purchase Returns & Vendor Adjustments — purchase return request, vendor return authorization, return approval, partial and complete returns, replacement requests, vendor adjustment requests, debit-note requests, return numbering, attachments, notifications, and commercial return lifecycle events.
- Purchase Analytics & Operational Controls — purchase dashboards, KPI reporting, spend and ageing analytics, supplier and buyer performance, price variance, 3-way match exception review, purchasing KPIs, operational controls, audit readiness, read-model consumption, dashboard filtering, export readiness, and reporting events.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition.

## 3. Implemented Sprint Summary

Each subsection below records the sprint's purpose, major business capabilities, and completion status (**Done**) — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-004-001](../30-sprint-prds/purchase/SPR-MOD-004-001-purchase-foundation.md) | Purchase Foundation | Done | Vendor master, vendor categories, vendor groups, purchase organization, buyer assignment, purchase configuration, terms & conditions master, purchase price list master, purchase numbering readiness, foundation events, and the Purchase Ownership, Vendor Master Authority, Purchase Configuration Authority, Supplier Boundary, and Purchase Organization Authority conventions. |
| [SPR-MOD-004-002](../30-sprint-prds/purchase/SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md) | Requisitions, RFQs & Purchase Orders | Done | Requisition lifecycle, RFQ lifecycle, supplier comparison, purchase-order lifecycle, purchase-order approval, purchase-order amendments, pricing and discount application, commercial-document numbering, attachments, notifications, purchase-order events, and the Requisition Ownership, RFQ Ownership, Purchase Order Ownership, and Purchase Approval Stage conventions. |
| [SPR-MOD-004-003](../30-sprint-prds/purchase/SPR-MOD-004-003-goods-receipt-inspection.md) | Goods Receipt & Inspection | Done | Goods-receipt lifecycle, commercial inspection hold, tolerance validation against open PO quantity, warehouse handover contracts, goods-receipt numbering, attachments, notifications, goods-receipt lifecycle events, and the Goods Receipt Ownership, Commercial Inspection Boundary, Inventory Consumption Boundary, and Warehouse Consumption Boundary conventions. |
| [SPR-MOD-004-004](../30-sprint-prds/purchase/SPR-MOD-004-004-vendor-billing-3-way-match.md) | Vendor Billing & Commercial 3-Way Match | Done | Vendor bill lifecycle, commercial 3-way match against PO and GRN, tolerance enforcement and override, tax determination inputs, payables creation contracts, vendor-bill numbering, attachments, notifications, vendor-bill lifecycle events, and the Vendor Billing Ownership, Commercial 3-Way Match Boundary, Accounting Consumption Boundary, and Tax Consumption Boundary conventions. |
| [SPR-MOD-004-005](../30-sprint-prds/purchase/SPR-MOD-004-005-purchase-returns-vendor-adjustments.md) | Purchase Returns & Vendor Adjustments | Done | Purchase return request, vendor return authorization, return approval, partial and complete returns, replacement requests, vendor adjustment requests, debit-note requests, return numbering, attachments, notifications, commercial return lifecycle events, and the Purchase Return Ownership and Vendor Adjustment Boundary conventions. |
| [SPR-MOD-004-006](../30-sprint-prds/purchase/SPR-MOD-004-006-purchase-analytics-controls.md) | Purchase Analytics & Controls | Done | Purchase dashboards, KPI reporting, spend and ageing analytics, supplier and buyer performance, price variance, 3-way match exception review, purchasing KPIs, operational controls, audit readiness, read-model consumption, dashboard filtering, export readiness, reporting events, and the Reporting Consumption Boundary, Dashboard Read Model, Analytics Read Model, Operational Controls Boundary, and Audit Readiness Boundary conventions. |

## 4. Capability Coverage

Every capability defined by the Purchase Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the Purchase Module PRD and the Sprint PRD family.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-004 Capability Area | Originating Sprint |
| --- | --- |
| Vendor master, vendor categories, vendor groups, buyer master, terms & conditions, purchase price list, purchase organization | SPR-MOD-004-001 |
| Purchase configuration, purchase numbering readiness | SPR-MOD-004-001 |
| Purchase requisition and approval | SPR-MOD-004-002 |
| Request for quotation and supplier comparison | SPR-MOD-004-002 |
| Purchase orders and amendments | SPR-MOD-004-002 |
| Goods receipt and inspection | SPR-MOD-004-003 |
| Supplier invoices and commercial 3-way match | SPR-MOD-004-004 |
| Purchase returns and vendor adjustments | SPR-MOD-004-005 |
| Purchase analytics, KPI/spend/ageing/supplier/buyer performance, operational controls, dashboards | SPR-MOD-004-006 |
| Purchase governance conventions (all summarized in §7) | Established across SPR-MOD-004-001 … SPR-MOD-004-006 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-004-001 | Vendor master, vendor categories, vendor groups, buyer master, terms & conditions, purchase price list, purchase organization, purchase configuration, purchase numbering readiness |
| SPR-MOD-004-002 | Purchase requisition and approval; RFQ and supplier comparison; purchase orders and amendments |
| SPR-MOD-004-003 | Goods receipt and inspection |
| SPR-MOD-004-004 | Supplier invoices and commercial 3-way match |
| SPR-MOD-004-005 | Purchase returns and vendor adjustments |
| SPR-MOD-004-006 | Purchase analytics, spend/ageing/supplier/buyer KPI reporting, operational controls, audit readiness |

No Purchase capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-004-001` through `SPR-MOD-004-006`.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-004-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-004-001, 002, 003, 004, 005, 006 |
| ENG-003 (Permission Management Engine) | SPR-MOD-004-001 |
| ENG-004 (Audit Engine) | SPR-MOD-004-001, 002, 003, 004, 005, 006 |
| ENG-005 (Configuration Engine) | SPR-MOD-004-001, 002 |
| ENG-006 (Localization Engine) | SPR-MOD-004-001 |
| ENG-007 (Document Engine) | SPR-MOD-004-002, 003, 004, 005 |
| ENG-008 (Attachment Engine) | SPR-MOD-004-002, 003, 004, 005 |
| ENG-010 (Workflow Engine) | SPR-MOD-004-002, 003, 005 |
| ENG-011 (Approval Engine) | SPR-MOD-004-002, 003, 004, 005 |
| ENG-012 (Rules Engine) | SPR-MOD-004-002, 003, 004, 005 |
| ENG-015 (Voucher Engine) | SPR-MOD-004-004 |
| ENG-017 (Numbering Engine) | SPR-MOD-004-001, 002, 003, 004, 005 |
| ENG-018 (Currency Engine) | SPR-MOD-004-001, 002, 003, 004, 005 |
| ENG-019 (Tax Engine) | SPR-MOD-004-004 |
| ENG-020 (Search Engine) | SPR-MOD-004-006 |
| ENG-021 (Reporting Engine) | SPR-MOD-004-006 |
| ENG-024 (Event Engine) | SPR-MOD-004-001, 002, 003, 004, 005, 006 |
| ENG-025 (Notification Engine) | SPR-MOD-004-002, 003, 004, 005, 006 |
| ENG-027 (Export Engine) | SPR-MOD-004-006 |

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-004-001` through `SPR-MOD-004-006`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-004-001, 002, 003, 004, 005, 006 |
| ADR-014 (Audit Strategy) | SPR-MOD-004-001, 002, 003, 004, 005, 006 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-004-001, 002, 003, 004, 005, 006 |

## 7. Governance Conventions Established

Every governance convention established across Purchase Sprint PRDs 001–006 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-004-001 — Purchase Foundation**

- **Purchase Ownership Convention** — Purchase owns vendor master, vendor categories, vendor groups, purchase organization, buyer assignment, purchase configuration, terms & conditions master, purchase price list master, and purchase numbering readiness under a tenant/company. Downstream modules consume this state and never redefine it.
- **Vendor Master Authority Convention** — Vendor master data lifecycle (create, edit, archive) is owned by Purchase; other modules reference vendors by stable identifier and never mutate vendor master state.
- **Purchase Configuration Authority Convention** — Purchase configuration resolves through Platform configuration hierarchy (`ENG-005`); Purchase never redefines the Configuration Engine.
- **Supplier Boundary Convention** — Purchase owns commercial vendor state; Accounting, Inventory, and CRM ownership boundaries are preserved and never redefined by Purchase.
- **Purchase Organization Authority Convention** — Purchasing organization structure resolves through Platform organization primitives; Purchase never redefines organization ownership.

**From SPR-MOD-004-002 — Requisitions, RFQs & Purchase Orders**

- **Requisition Ownership Convention** — Purchase owns the requisition lifecycle end-to-end.
- **RFQ Ownership Convention** — Purchase owns the RFQ lifecycle and supplier comparison end-to-end.
- **Purchase Order Ownership Convention** — Purchase owns the purchase-order lifecycle end-to-end, including amendments and cancellation.
- **Purchase Approval Stage Convention** — Approval thresholds resolve via `ENG-005` configuration and route through `ENG-011`; approval semantics are consumed, not redefined.

**From SPR-MOD-004-003 — Goods Receipt & Inspection**

- **Goods Receipt Ownership Convention** — Purchase owns the goods-receipt lifecycle (partial receipt, complete receipt, inspection hold).
- **Commercial Inspection Boundary Convention** — Commercial inspection is a Purchase-owned state distinct from quality-management and warehouse-inspection states.
- **Inventory Consumption Boundary Convention** — Inventory ownership, stock movement, warehouse operations, and inventory valuation remain owned by MOD-005 Inventory; Purchase requests downstream inventory processing through approved repository contracts and never redefines inventory ownership.
- **Warehouse Consumption Boundary Convention** — Warehouse handover contracts are produced for consumption by MOD-005 Inventory; Purchase never redefines warehouse ownership.

**From SPR-MOD-004-004 — Vendor Billing & Commercial 3-Way Match**

- **Vendor Billing Ownership Convention** — Purchase owns the commercial vendor bill lifecycle (submission, approval, matching, cancellation, amendment).
- **Commercial 3-Way Match Boundary Convention** — Purchase owns commercial matching arithmetic across PO, GRN, and vendor bill; tolerance evaluation resolves via `ENG-012`. Accounting matching, payables reconciliation, and payment execution remain owned by MOD-002 Accounting.
- **Accounting Consumption Boundary Convention** — Accounting voucher creation, journals, ledger posting, payables, and payments are owned by MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`; Purchase consumes the accounting voucher creation contract and never redefines Accounting ownership.
- **Tax Consumption Boundary Convention** — Tax determination is owned by MOD-002 Accounting; Purchase consumes tax determination results and never redefines tax calculation or configuration.

**From SPR-MOD-004-005 — Purchase Returns & Vendor Adjustments**

- **Purchase Return Ownership Convention** — Purchase owns the commercial purchase return lifecycle end-to-end (return request, vendor return authorization, approval, partial/complete return, cancellation, replacement request, debit-note request).
- **Vendor Adjustment Boundary Convention** — Purchase owns commercial adjustment requests, replacement requests, and debit-note requests. Financial adjustments, accounting postings, payables adjustments, and payment reversals remain owned by MOD-002 Accounting. Physical inventory reversal remains owned by MOD-005 Inventory. Purchase never redefines Inventory or Accounting ownership.

**From SPR-MOD-004-006 — Purchase Analytics & Controls**

- **Reporting Consumption Boundary Convention** — Purchase analytics consume operational data from prior Purchase Sprints; analytics SHALL NOT redefine operational ownership.
- **Dashboard Read Model Convention** — Dashboards, filters, drill-down, and export operate over the read model; no transactional side effects.
- **Analytics Read Model Convention** — Purchase KPI and pipeline reporting are read-only projections; analytics never mutate transactional data.
- **Operational Controls Boundary Convention** — Operational controls are read-only surfaces over prior-sprint state; controls never redefine operational ownership.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint events through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform governance conventions established in `MOD001_PLATFORM_BASELINE_v1` (Event Ownership, Effective Configuration, Configuration Ownership, Localization Ownership, Audit Ownership), the Accounting governance conventions established in `MOD002_ACCOUNTING_BASELINE_v1` (Voucher, Ledger Posting, Financial Reporting, Tax, Period Close, and Audit Review ownership), and the Sales governance conventions established in `MOD003_SALES_BASELINE_v1`.

**Freeze.** Governance conventions summarized herein are frozen for `MOD004_PURCHASE_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-004-001` through `SPR-MOD-004-006`.** Every referenced event exists in [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md) or has been recorded as a deferred `R-EV-*` risk in the originating Sprint PRD. The Event Catalog remains the sole authoritative source and is not modified by this baseline. **No new event names SHALL be introduced by the Module Baseline.** Deferred `R-EV-*` risks are inherited from their originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD004_PURCHASE_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by Purchase. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**Purchase SHALL consume Inventory, Accounting, Reporting, Workflow and Notification services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by Purchase:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-002 Accounting** — accounting voucher creation contract, tax determination, payables creation, financial reporting summaries.
- **MOD-003 Sales** — commercial ownership boundary parity; Sales master data is consumed by reference where relevant.
- **MOD-005 Inventory** — inventory ownership, stock movement, warehouse operations, inventory valuation, and inventory reporting.
- **MOD-006 CRM** — supplier collaboration references consumed where applicable.

**Downstream consumers of the Purchase baseline:**

- **MOD-011 AMC** — consumes vendor master and commercial vendor-bill references.
- **MOD-015 POS** — consumes vendor master and purchase-price-list references where applicable.
- **MOD-017 Analytics** — consumes Purchase operational read models for portfolio KPIs; owns portfolio-level analytics.
- **MOD-018 AI Workspace** — consumes Purchase operational read models for predictive analytics; owns predictive analytics.

Downstream modules MUST NOT own Purchase master data, redefine commercial-document lifecycles, redefine the goods-receipt lifecycle, redefine the vendor-bill lifecycle, redefine the purchase-return lifecycle, or redefine Purchase analytics ownership. No downstream module owns Purchase assets.

## 10. Module Completion & Freeze Statement

All six planned Purchase Sprint PRDs (`SPR-MOD-004-001` … `SPR-MOD-004-006`) exist, the [Sprint Plan](../30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md) is executed, and repository verification has been completed. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-004 Purchase is now frozen for downstream consumption. Future changes to `MOD004_PURCHASE_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD004_PURCHASE_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD004_PURCHASE_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- AI-driven procurement recommendations and supplier-selection assistance.
- Predictive procurement analytics and ML-driven vendor scoring.
- Purchase budgeting and forecasting.
- Enterprise business-intelligence integrations.
- Advanced dashboard authoring beyond the read-model surface delivered in SPR-MOD-004-006.
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/purchase/MODULE_PRD.md`](../20-module-prds/purchase/MODULE_PRD.md) — MOD-004 Module PRD (authoritative).
- [`docs/30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md`](../30-sprint-prds/purchase/MOD-004_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/purchase/SPR-MOD-004-001-purchase-foundation.md`](../30-sprint-prds/purchase/SPR-MOD-004-001-purchase-foundation.md)
- [`docs/30-sprint-prds/purchase/SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md`](../30-sprint-prds/purchase/SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md)
- [`docs/30-sprint-prds/purchase/SPR-MOD-004-003-goods-receipt-inspection.md`](../30-sprint-prds/purchase/SPR-MOD-004-003-goods-receipt-inspection.md)
- [`docs/30-sprint-prds/purchase/SPR-MOD-004-004-vendor-billing-3-way-match.md`](../30-sprint-prds/purchase/SPR-MOD-004-004-vendor-billing-3-way-match.md)
- [`docs/30-sprint-prds/purchase/SPR-MOD-004-005-purchase-returns-vendor-adjustments.md`](../30-sprint-prds/purchase/SPR-MOD-004-005-purchase-returns-vendor-adjustments.md)
- [`docs/30-sprint-prds/purchase/SPR-MOD-004-006-purchase-analytics-controls.md`](../30-sprint-prds/purchase/SPR-MOD-004-006-purchase-analytics-controls.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring framework.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](./MOD002_ACCOUNTING_BASELINE_v1.md) — upstream Accounting baseline.
- [`docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md`](./MOD003_SALES_BASELINE_v1.md) — upstream Sales baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
