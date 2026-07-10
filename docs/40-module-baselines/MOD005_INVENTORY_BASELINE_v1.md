---
title: "MOD005_INVENTORY_BASELINE_v1 — Inventory Module Baseline"
summary: "Stage 3 Module Baseline for MOD-005 Inventory. Freezes the module after successful completion of Sprint PRDs SPR-MOD-005-001..006. Reference consolidation only — introduces no new requirements, engines, ADRs, or Sprint PRDs."
baseline_id: "MOD005_INVENTORY_BASELINE_v1"
module_id: "MOD-005"
module_name: "Inventory"
version: "1.0"
status: "Frozen"
owner: "Supply Chain"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/inventory/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-005-001", "SPR-MOD-005-002", "SPR-MOD-005-003", "SPR-MOD-005-004", "SPR-MOD-005-005", "SPR-MOD-005-006"]
layer: "delivery"
updated: "2026-07-10"
tags: ["baseline", "module", "MOD-005", "inventory", "stage-3", "freeze"]
document_type: "Module Baseline"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-015", "ENG-016", "ENG-017", "ENG-020", "ENG-021", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
---

# MOD005_INVENTORY_BASELINE_v1 — Inventory Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-005. It introduces no new requirements, engines, ADRs, or Sprint PRDs. Future changes to Inventory scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD005_INVENTORY_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD005_INVENTORY_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the Inventory module (`MOD-005`). It certifies that:

- Every Sprint PRD reserved in [`MOD-005_SPRINT_PLAN.md`](../30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md) (`SPR-MOD-005-001` … `SPR-MOD-005-006`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-005. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD005_INVENTORY_BASELINE_v1` is the authoritative repository-wide Inventory contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-005 Module PRD](../20-module-prds/inventory/MODULE_PRD.md); reference only. Inventory owns:

- Inventory Foundation — item master, item categorisation, item groups, item attributes, unit-of-measure master, warehouse master, bin/location master, stock balance projections, inventory configuration, and inventory numbering readiness under a tenant/company.
- Inventory Receipts & Putaway — commercial Inventory Receipt lifecycle, receipt validation, putaway/bin assignment, warehouse-handover consumption from Purchase, receipt numbering, attachments, notifications, and Inventory Receipt lifecycle events.
- Inventory Issues, Transfers & Reservations — commercial Inventory Issue lifecycle, inter-warehouse and inter-bin Inventory Transfer lifecycle, Transfer Request lifecycle, movement validation (including negative-stock policy), reservation/allocation state on issue lines, movement numbering, attachments, notifications, and Inventory Movement lifecycle events.
- Inventory Adjustments & Stock Counting — commercial Inventory Adjustment lifecycle (Stock Adjustment Request, Adjustment Approval, and Reconciliation Request facets), Physical/Cycle/Scheduled/Blind/Recount execution lifecycles, variance recording and review, adjustment/count numbering, attachments, notifications, and Inventory Adjustment and Stock Count lifecycle events; consumes accounting voucher-creation contracts owned by MOD-002 Accounting.
- Inventory Valuation & Replenishment — commercial Valuation Policy (per company), Valuation Snapshot, Revaluation Request, valuation recalculation on stock events, commercial Reorder Policy, Replenishment Suggestion, Low-Stock Signal, and commercial Replenishment Approval; produces voucher-creation contracts for downstream MOD-002 Accounting consumption without redefining accounting ownership.
- Inventory Analytics & Operational Controls — inventory dashboards, KPI reporting, stock-ledger, stock-valuation, reorder, ageing, and stock-turn reports; operational controls, audit readiness, read-model consumption, dashboard filtering, export readiness, and reporting events.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition.

## 3. Implemented Sprint Summary

Each subsection below records the sprint's purpose, major business capabilities, and completion status (**Done**) — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-005-001](../30-sprint-prds/inventory/SPR-MOD-005-001-inventory-foundation.md) | Inventory Foundation | Done | Item master, item categories, item groups, item attributes, unit-of-measure master, warehouse master, bin/location master, stock balance projection, inventory configuration, inventory numbering readiness, foundation events, and the Inventory Ownership Convention and Item Master Authority Convention. |
| [SPR-MOD-005-002](../30-sprint-prds/inventory/SPR-MOD-005-002-inventory-receipts-putaway.md) | Inventory Receipts & Putaway | Done | Commercial Inventory Receipt lifecycle, receipt validation, putaway/bin assignment, warehouse-handover consumption, receipt numbering, attachments, notifications, Inventory Receipt lifecycle events, and the Inventory Receipt Ownership Convention. |
| [SPR-MOD-005-003](../30-sprint-prds/inventory/SPR-MOD-005-003-inventory-issues-transfers-reservations.md) | Inventory Issues, Transfers & Reservations | Done | Commercial Inventory Issue lifecycle, inter-warehouse and inter-bin Inventory Transfer lifecycle, Transfer Request lifecycle, movement validation, reservation/allocation state, movement numbering, attachments, notifications, Inventory Movement lifecycle events, and the Inventory Movement Ownership Convention. |
| [SPR-MOD-005-004](../30-sprint-prds/inventory/SPR-MOD-005-004-inventory-adjustments-stock-counting.md) | Inventory Adjustments & Stock Counting | Done | Commercial Inventory Adjustment lifecycle (Stock Adjustment Request, Adjustment Approval, Reconciliation Request facets), Physical/Cycle/Scheduled/Blind/Recount execution lifecycles, variance recording and review, adjustment/count numbering, attachments, notifications, Inventory Adjustment and Stock Count lifecycle events, and the Inventory Adjustment Ownership Convention, Stock Count Boundary Convention, and Accounting Consumption Boundary Convention. |
| [SPR-MOD-005-005](../30-sprint-prds/inventory/SPR-MOD-005-005-inventory-valuation-replenishment.md) | Inventory Valuation & Replenishment | Done | Commercial Valuation Policy, Valuation Snapshot, Revaluation Request, valuation recalculation on stock events, Reorder Policy, Replenishment Suggestion, Low-Stock Signal, Replenishment Approval, valuation and replenishment events, and the Inventory Valuation & Replenishment Ownership Convention. |
| [SPR-MOD-005-006](../30-sprint-prds/inventory/SPR-MOD-005-006-inventory-analytics-operational-controls.md) | Inventory Analytics & Operational Controls | Done | Inventory dashboards, KPI reporting, stock-ledger/stock-valuation/reorder/ageing/stock-turn analytics, operational controls, audit readiness, read-model consumption, dashboard filtering, export readiness, reporting events, and the Inventory Analytics Ownership Convention, Read Model Boundary Convention, and Operational Control Boundary Convention. |

## 4. Capability Coverage

Every capability defined by the Inventory Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the Inventory Module PRD and the Sprint PRD family. No capability has been **added, removed, renamed, merged, split, or ownership-transferred** by this consolidation.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-005 Capability Area | Originating Sprint |
| --- | --- |
| Item master and categorization | SPR-MOD-005-001 |
| Warehouse and bin management | SPR-MOD-005-001 |
| Unit-of-measure master, inventory configuration, inventory numbering readiness | SPR-MOD-005-001 |
| Stock movements — inbound (Stock Receipt) | SPR-MOD-005-002 |
| Stock movements — outbound and internal transfer (Stock Issue, Stock Transfer, Reservations) | SPR-MOD-005-003 |
| Stock movements — adjustments (Stock Adjustment) | SPR-MOD-005-004 |
| Physical stock verification (Physical/Cycle/Scheduled/Blind/Recount) | SPR-MOD-005-004 |
| Valuation (FIFO / moving average / standard) | SPR-MOD-005-005 |
| Reorder and replenishment | SPR-MOD-005-005 |
| Reports & Analytics (Stock Ledger, Stock Valuation, Reorder, Ageing, Stock Turn) and audit readiness | SPR-MOD-005-006 |
| Inventory governance conventions (all summarized in §7) | Established across SPR-MOD-005-001 … SPR-MOD-005-006 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-005-001 | Item master, item categories, item groups, item attributes, unit-of-measure master, warehouse master, bin/location master, stock balance, inventory configuration, inventory numbering readiness |
| SPR-MOD-005-002 | Stock movements — inbound (Stock Receipt); warehouse-handover consumption |
| SPR-MOD-005-003 | Stock movements — outbound and internal transfer (Stock Issue, Stock Transfer); reservations/allocations |
| SPR-MOD-005-004 | Stock adjustments; physical stock verification |
| SPR-MOD-005-005 | Inventory valuation; reorder and replenishment |
| SPR-MOD-005-006 | Inventory reports, dashboards, KPIs, operational controls, audit readiness |

No Inventory capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-005-001` through `SPR-MOD-005-006`.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim, and canonical ordering from `ENGINE_CATALOG.md` is preserved.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-005-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-005-001, 002, 003, 004, 005, 006 |
| ENG-003 (Permission Management Engine) | SPR-MOD-005-001 |
| ENG-004 (Audit Engine) | SPR-MOD-005-001, 002, 003, 004, 005, 006 |
| ENG-005 (Configuration Engine) | SPR-MOD-005-001, 005 |
| ENG-006 (Localization Engine) | SPR-MOD-005-001 |
| ENG-007 (Document Engine) | SPR-MOD-005-002, 003, 004 |
| ENG-008 (Attachment Engine) | SPR-MOD-005-002, 004 |
| ENG-010 (Workflow Engine) | SPR-MOD-005-002, 003, 004 |
| ENG-011 (Approval Engine) | SPR-MOD-005-004 |
| ENG-012 (Rules Engine) | SPR-MOD-005-002, 003, 004, 005 |
| ENG-013 (Automation Engine) | SPR-MOD-005-005 |
| ENG-015 (Voucher Engine) | SPR-MOD-005-005 |
| ENG-016 (Posting Engine) | SPR-MOD-005-005 |
| ENG-017 (Numbering Engine) | SPR-MOD-005-001, 002, 003, 004 |
| ENG-020 (Search Engine) | SPR-MOD-005-006 |
| ENG-021 (Reporting Engine) | SPR-MOD-005-006 |
| ENG-024 (Event Engine) | SPR-MOD-005-001, 002, 003, 004, 005, 006 |
| ENG-025 (Notification Engine) | SPR-MOD-005-002, 003, 004, 006 |
| ENG-027 (Export Engine) | SPR-MOD-005-006 |

`ENG-015` (Voucher) and `ENG-016` (Posting) are consumed strictly as voucher-request and posting-request contracts to MOD-002 Accounting; Inventory MUST NOT redefine accounting voucher creation or ledger posting.

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-005-001` through `SPR-MOD-005-006`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim; canonical ordering from `ADR_INDEX.md` is preserved.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-005-001, 002, 003, 004, 005, 006 |
| ADR-014 (Audit Strategy) | SPR-MOD-005-001, 002, 003, 004, 005, 006 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-005-001, 002, 003, 004, 005, 006 |

## 7. Governance Conventions Established

Every governance convention established across Inventory Sprint PRDs 001–006 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-005-001 — Inventory Foundation**

- **Inventory Ownership Convention** — Inventory owns the business semantics of item master, item categorisation, item groups, item attributes, unit-of-measure master, storage locations (warehouse and bin/location master), stock balance projection, and inventory configuration under a tenant/company. ERP Core Engines provide shared infrastructure but MUST NOT redefine inventory business rules. Downstream modules consume Item master data and inventory services and never introduce independent item masters or parallel inventory structures.
- **Item Master Authority Convention** — Item master data lifecycle (create, edit, archive) is owned by Inventory as the single enterprise source; other modules reference items by stable identifier and never mutate item master state.

**From SPR-MOD-005-002 — Inventory Receipts & Putaway**

- **Inventory Receipt Ownership Convention** — Inventory owns the commercial Inventory Receipt lifecycle, receipt validation, receipt status, and putaway/bin-assignment requests. Downstream modules consume Inventory Receipt events and read APIs and never introduce independent receipt lifecycles.

**From SPR-MOD-005-003 — Inventory Issues, Transfers & Reservations**

- **Inventory Movement Ownership Convention** — Inventory owns the commercial Inventory Issue and Inventory Transfer lifecycles, the Transfer Request lifecycle, movement validation, movement status, and reservation/allocation state carried on Inventory Issue lines. Downstream modules consume Inventory Movement events and read APIs and never introduce independent issue, transfer, or reservation lifecycles.

**From SPR-MOD-005-004 — Inventory Adjustments & Stock Counting**

- **Inventory Adjustment Ownership Convention** — Inventory owns the commercial Inventory Adjustment lifecycle (including the Stock Adjustment Request, Adjustment Approval, and Reconciliation Request facets) and the Physical, Cycle, Scheduled, Blind, and Recount execution lifecycles, variance recording, and variance review.
- **Stock Count Boundary Convention** — Inventory owns the count documents and variance recording; physical execution on the warehouse floor remains owned by MOD-006 Warehouse (when introduced), consumed via approved repository contracts.
- **Accounting Consumption Boundary Convention** — Accounting voucher creation, ledger posting, and variance write-off postings are owned by MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`; Inventory consumes the accounting voucher-creation contract and never redefines Accounting ownership.

**From SPR-MOD-005-005 — Inventory Valuation & Replenishment**

- **Inventory Valuation & Replenishment Ownership Convention** — Inventory owns the commercial Valuation Policy (per company), Valuation Snapshot, Revaluation Request, commercial Reorder Policy, Replenishment Suggestion, Low-Stock Signal, and commercial Replenishment Approval. Downstream modules consume Valuation and Replenishment events and read APIs and never introduce independent valuation or replenishment lifecycles.

**From SPR-MOD-005-006 — Inventory Analytics & Operational Controls**

- **Inventory Analytics Ownership Convention** — Inventory analytics consume operational data from prior Inventory Sprints; analytics SHALL NOT redefine operational ownership.
- **Read Model Boundary Convention** — Dashboards, filters, drill-down, and export operate over the Inventory read model; no transactional side effects.
- **Operational Control Boundary Convention** — Operational controls are observation-only surfaces over prior-sprint state; controls never redefine operational ownership.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint events through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform governance conventions established in `MOD001_PLATFORM_BASELINE_v1`, the Accounting governance conventions established in `MOD002_ACCOUNTING_BASELINE_v1`, the Sales governance conventions established in `MOD003_SALES_BASELINE_v1`, and the Purchase governance conventions established in `MOD004_PURCHASE_BASELINE_v1`.

**Freeze.** Governance conventions summarized herein are frozen for `MOD005_INVENTORY_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-005-001` through `SPR-MOD-005-006`.** Every referenced event exists in [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md) or has been recorded as a deferred `R-EV-*` risk in the originating Sprint PRD. The Event Catalog remains the sole authoritative source and is not modified by this baseline. **No new event names SHALL be introduced by the Module Baseline.** Deferred `R-EV-*` risks are inherited from their originating Sprints and remain governed by those Sprint PRDs.

Events referenced by the Inventory Sprint PRD family include `StockReceived`, `StockIssued`, `StockTransferred`, `InventoryValuationChanged`, and `InventoryLowStock` (published by Inventory), and `GoodsReceived`, `DeliveryDispatched`, and `ProductionCompleted` (consumed by Inventory from MOD-004 Purchase, MOD-003 Sales, and MOD-009 Manufacturing respectively). Inventory Adjustment and Stock Count event surfaces remain deferred under `R-EV-01` pending event-catalog registration.

## 9. Cross-Module Contracts

The following modules consume `MOD005_INVENTORY_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by Inventory. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**Inventory SHALL consume Platform, Accounting, Purchase, Sales, Manufacturing, Warehouse, and Analytics services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by Inventory:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-002 Accounting** — accounting voucher-creation contract, ledger posting, and variance-write-off posting for adjustment and valuation events.
- **MOD-003 Sales** — `DeliveryDispatched` event consumption to drive stock issues linked to delivery.
- **MOD-004 Purchase** — warehouse-handover contracts and the `GoodsReceived` event to drive stock receipts.
- **MOD-006 Warehouse** — physical warehouse execution contracts consumed for count execution and putaway staging where applicable.
- **MOD-009 Manufacturing** — `ProductionCompleted` event consumption to drive production-linked stock receipts and issues.

**Downstream consumers of the Inventory baseline:**

- **MOD-003 Sales** — consumes item master, stock availability, and reservation state.
- **MOD-004 Purchase** — consumes item master, `InventoryLowStock` signals for requisition seeding.
- **MOD-011 AMC**, **MOD-015 POS** — consume item master and stock availability where applicable.
- **MOD-017 Analytics** — consumes Inventory operational read models for portfolio KPIs; owns portfolio-level analytics.
- **MOD-018 AI Workspace** — consumes Inventory operational read models for predictive analytics; owns predictive analytics.

Downstream modules MUST NOT own Inventory master data, redefine the Inventory Receipt / Issue / Transfer / Adjustment / Count lifecycles, redefine valuation or replenishment ownership, or redefine Inventory analytics ownership. No downstream module owns Inventory assets.

## 10. Module Completion & Freeze Statement

All six planned Inventory Sprint PRDs (`SPR-MOD-005-001` … `SPR-MOD-005-006`) exist, the [Sprint Plan](../30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md) is executed, and repository verification has been completed. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-005 Inventory is now frozen for downstream consumption. Future changes to `MOD005_INVENTORY_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD005_INVENTORY_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD005_INVENTORY_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Serial and batch traceability upgrades beyond the master-data primitives established in SPR-MOD-005-001.
- Slotting optimization and warehouse-slotting analytics.
- IoT-based stock capture (RFID, weight bridge integration).
- AI-driven demand forecasting and predictive replenishment.
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Advanced dashboard authoring beyond the read-model surface delivered in SPR-MOD-005-006.
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs (notably `R-EV-01` for Inventory Adjustment and Stock Count event surfaces).

## 12. References

- [`docs/20-module-prds/inventory/MODULE_PRD.md`](../20-module-prds/inventory/MODULE_PRD.md) — MOD-005 Module PRD (authoritative).
- [`docs/30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md`](../30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/inventory/SPR-MOD-005-001-inventory-foundation.md`](../30-sprint-prds/inventory/SPR-MOD-005-001-inventory-foundation.md)
- [`docs/30-sprint-prds/inventory/SPR-MOD-005-002-inventory-receipts-putaway.md`](../30-sprint-prds/inventory/SPR-MOD-005-002-inventory-receipts-putaway.md)
- [`docs/30-sprint-prds/inventory/SPR-MOD-005-003-inventory-issues-transfers-reservations.md`](../30-sprint-prds/inventory/SPR-MOD-005-003-inventory-issues-transfers-reservations.md)
- [`docs/30-sprint-prds/inventory/SPR-MOD-005-004-inventory-adjustments-stock-counting.md`](../30-sprint-prds/inventory/SPR-MOD-005-004-inventory-adjustments-stock-counting.md)
- [`docs/30-sprint-prds/inventory/SPR-MOD-005-005-inventory-valuation-replenishment.md`](../30-sprint-prds/inventory/SPR-MOD-005-005-inventory-valuation-replenishment.md)
- [`docs/30-sprint-prds/inventory/SPR-MOD-005-006-inventory-analytics-operational-controls.md`](../30-sprint-prds/inventory/SPR-MOD-005-006-inventory-analytics-operational-controls.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring framework.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](./MOD002_ACCOUNTING_BASELINE_v1.md) — upstream Accounting baseline.
- [`docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md`](./MOD003_SALES_BASELINE_v1.md) — upstream Sales baseline.
- [`docs/40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](./MOD004_PURCHASE_BASELINE_v1.md) — upstream Purchase baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
