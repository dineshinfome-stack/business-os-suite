---
title: "MOD-005 Inventory — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-005 Inventory. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Supply Chain"
status: "Approved"
updated: "2026-07-10"
module_id: "MOD-005"
module_name: "Inventory"
sprint_prefix: "SPR-MOD-005-"
stage: "1"
pass: "8.8.0"
parent_module_prd: "docs/20-module-prds/inventory/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
tags: ["sprint", "planning", "inventory", "mod-005", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-005 Inventory — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-005 Inventory** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## 1. Purpose & Scope

Plan the implementation of MOD-005 Inventory by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD and is **not** registered in `SPRINT_CATALOG.md`.

This plan introduces no new business requirements beyond the approved [MOD-005 Inventory Module PRD](../../20-module-prds/inventory/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Traceability:**

- Parent Module README — [`../../20-module-prds/inventory/README.md`](../../20-module-prds/inventory/README.md)
- Parent Module PRD — [`../../20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md)
- Upstream module baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen), [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen), [`../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-005 in `SPRINT_ROADMAP.md` is reconciled to **6** by this plan. This plan is authoritative for MOD-005 Stage 1 sprint decomposition.

## 2. Proposed Sprint Sequence

### SPR-MOD-005-001 — Inventory Foundation

- **Objective.** Establish Inventory foundations under a tenant/company: item master, item categorisation, warehouse master, bin/location master, unit-of-measure master, inventory configuration, and inventory numbering foundations.
- **Boundaries.**
  - In: item master data and lifecycle, item categories, warehouse master, bin/location master, unit-of-measure master, inventory configuration, numbering series registration, document settings.
  - Out: stock movements, receipts, issues, transfers, adjustments, physical verification, valuation, reorder policies, analytics.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Item master and categorization; Warehouse and bin management — submodules Items, Warehouses), §3 Personas (Warehouse Manager, Stores Officer, Inventory Controller), §5 Master Data (Item, Item Category, Warehouse, Bin/Location, Unit of Measure, Stock Balance), §10 Configuration (Numbering series, Negative-stock policy defaults).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-017` Numbering, `ENG-024` Event.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (Inventory sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` for tenancy, organization structure, users/roles/permissions, configuration hierarchy, and localization.
- **Sprint Exit Criteria.**
  - Item, item category, warehouse, bin/location, and unit-of-measure master data can be created, edited, and archived under a tenant/company.
  - Inventory configuration resolves deterministically through `ENG-005`.
  - Numbering series for inventory documents are registered and resolve via `ENG-017`.
  - All structural changes are audited via `ENG-004`.

### SPR-MOD-005-002 — Stock Receipts & Putaway

- **Objective.** Deliver the stock receipt transaction: creation, validation, warehouse handover consumption, and putaway to bin/location, driven by upstream `GoodsReceived` events.
- **Boundaries.**
  - In: stock receipt lifecycle, receipt validation, putaway to bin/location, warehouse handover consumption, receipt numbering, attachments, notifications.
  - Out: stock issues, transfers, adjustments, physical count, valuation, reorder, analytics, accounting posting, purchase document ownership.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Stock movements and adjustments — inbound half; submodule Movements — inbound half), §4 Business Processes (Inward-to-storage), §6 Transactions (Stock Receipt), §8 Integration Points (`StockReceived` — published; `GoodsReceived` — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-012` Rules, `ENG-017` Numbering, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-005-001`.
- **Sprint Exit Criteria.**
  - Stock receipts can be created against warehouse handover contracts and driven through the receipt lifecycle.
  - Putaway to bin/location resolves against warehouse and bin master.
  - Receipt validation is enforced via `ENG-012`.
  - `StockReceived` event is published via `ENG-024`; `GoodsReceived` is consumed from MOD-004 Purchase.

### SPR-MOD-005-003 — Stock Issues & Transfers

- **Objective.** Deliver the stock issue and stock transfer transactions: issue against outbound consumers (e.g. sales delivery, manufacturing), inter-warehouse transfer, and inter-bin movement.
- **Boundaries.**
  - In: stock issue lifecycle, stock transfer lifecycle (inter-warehouse and inter-bin), movement validation, movement numbering, attachments, notifications.
  - Out: stock receipts, adjustments, physical count, valuation, reorder, analytics, accounting posting, sales/manufacturing document ownership.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Stock movements and adjustments — outbound and internal-transfer half; submodule Movements — outbound and transfer half), §4 Business Processes (Storage-to-outward, Stock transfer), §6 Transactions (Stock Issue, Stock Transfer), §8 Integration Points (`StockIssued`, `StockTransferred` — published; `DeliveryDispatched`, `ProductionCompleted` — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-010` Workflow, `ENG-012` Rules, `ENG-017` Numbering, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-005-001`.
- **Sprint Exit Criteria.**
  - Stock issues and stock transfers can be created, validated, and driven through the movement lifecycle.
  - Movement validation enforces negative-stock policy per Module PRD §7 via `ENG-012`.
  - `StockIssued` and `StockTransferred` events are published via `ENG-024`; `DeliveryDispatched` and `ProductionCompleted` are consumed from downstream modules.

### SPR-MOD-005-004 — Stock Adjustments & Physical Verification

- **Objective.** Deliver stock adjustments and physical verification: adjustment lifecycle with approval, cycle count, physical count, and variance recording.
- **Boundaries.**
  - In: stock adjustment lifecycle, adjustment approval, cycle count, physical count, variance recording, adjustment/count numbering, attachments, notifications.
  - Out: stock receipts, issues, transfers, valuation, reorder, analytics, accounting voucher creation, ledger posting.
- **Estimated size.** Large.
- **Module PRD sections covered.** §2 Business Scope (Stock movements and adjustments — adjustment half; Physical stock verification; submodule Physical Verification), §4 Business Processes (Adjustment and write-off, Cycle count), §6 Transactions (Stock Adjustment, Physical Count), §7 Business Rules (Adjustments beyond a threshold require approval; Physical count differences post to the configured variance account).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-005-001`.
- **Sprint Exit Criteria.**
  - Stock adjustments can be created, approved, and driven through the adjustment lifecycle.
  - Cycle counts and physical counts can be scheduled, executed, and reconciled; variances are recorded.
  - Approval thresholds resolve via `ENG-005` configuration and route through `ENG-011`.
  - Variance write-off contracts are produced for consumption by `MOD002_ACCOUNTING_BASELINE_v1`.

### SPR-MOD-005-005 — Inventory Valuation & Replenishment

- **Objective.** Deliver inventory valuation (FIFO / moving average / standard) and reorder/replenishment: valuation policy resolution per company, valuation recalculation on stock events, reorder point maintenance, and replenishment suggestions.
- **Boundaries.**
  - In: valuation method configuration per company, valuation recalculation on stock events, valuation-change events, reorder policy maintenance, replenishment suggestion generation, low-stock detection.
  - Out: accounting voucher creation, ledger posting, purchase requisition creation (owned by MOD-004 Purchase), transactional stock-movement functionality of earlier sprints.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Valuation (FIFO/moving average/standard); Reorder and replenishment; submodule Valuation), §7 Business Rules (Physical count differences post to the configured variance account — valuation side), §8 Integration Points (`InventoryValuationChanged`, `InventoryLowStock` — published), §10 Configuration (Valuation method per company; Reorder policies).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-012` Rules, `ENG-013` Automation, `ENG-015` Voucher, `ENG-016` Posting, `ENG-024` Event.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-005-002`, `SPR-MOD-005-003`, `SPR-MOD-005-004` (valuation and reorder consume stock events published by all prior transactional sprints).
- **Sprint Exit Criteria.**
  - Valuation method resolves per company via `ENG-005` and recalculates on stock receipts, issues, transfers, and adjustments.
  - Reorder policies and replenishment suggestions are maintained under the tenant/company hierarchy.
  - `InventoryValuationChanged` and `InventoryLowStock` events are published via `ENG-024`.
  - Voucher-creation contracts are produced for downstream `MOD002_ACCOUNTING_BASELINE_v1` consumption; Inventory does not create accounting journals or ledger entries.

### SPR-MOD-005-006 — Inventory Analytics & Controls

- **Objective.** Deliver the inventory analytics and controls surface: stock ledger, stock valuation, reorder, ageing, and stock-turn reports; dashboards, KPIs, operational controls, and audit readiness.
- **Boundaries.**
  - In: inventory reports, dashboards, KPIs, operational controls, audit readiness, exports.
  - Out: cross-module KPI definitions (owned by MOD-017 Analytics), AI-driven forecasting, predictive analytics, transactional functionality of earlier sprints.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §9 Reports & Analytics (Stock Ledger, Stock Valuation, Reorder Report, Ageing Analysis, Stock Turn), §11 Non-functional (Audit readiness).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-020` Search, `ENG-021` Reporting, `ENG-024` Event, `ENG-025` Notification, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-005-001` … `SPR-MOD-005-005` (consumes data and events produced by all prior sprints).
- **Sprint Exit Criteria.**
  - Inventory reports and dashboards render from data produced by prior sprints.
  - Inventory KPIs and operational controls are available for operational review.
  - Audit readiness surface exposes every Inventory event emitted during the sprint sequence.

### Planning Flexibility

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-005-001 (Inventory Foundation)
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
SPR-MOD-005-002   SPR-MOD-005-003   SPR-MOD-005-004
(Receipts &        (Issues &         (Adjustments &
 Putaway)           Transfers)        Physical Verification)
         │              │              │
         └──────────────┼──────────────┘
                        ▼
              SPR-MOD-005-005 (Valuation & Replenishment)
                        │
                        ▼
              SPR-MOD-005-006 (Analytics & Controls)
```

Sprints 002, 003, and 004 all depend directly on 001 (Foundation) and MAY be authored in parallel during Stage 2. Sprint 005 (Valuation & Replenishment) depends on the transactional surface established by 002, 003, and 004. Sprint 006 consumes output from all five predecessors. This preserves the baseline-first dependency model established by MOD-001 … MOD-004.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-005 Inventory Module PRD](../../20-module-prds/inventory/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint. Shared consumption of upstream sprint outputs by later sprints is permitted, but originating ownership is unique. This forward mapping (PRD → Sprint) and reverse mapping (Sprint → PRD) together satisfy the repository bidirectional-traceability rule.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| Module PRD Capability (§2) | Originating Sprint |
| --- | --- |
| Item master and categorization | SPR-MOD-005-001 |
| Warehouse and bin management | SPR-MOD-005-001 |
| Stock movements and adjustments — inbound (Stock Receipt) | SPR-MOD-005-002 |
| Stock movements and adjustments — outbound and internal transfer (Stock Issue, Stock Transfer) | SPR-MOD-005-003 |
| Stock movements and adjustments — adjustments (Stock Adjustment) | SPR-MOD-005-004 |
| Physical stock verification | SPR-MOD-005-004 |
| Valuation (FIFO/moving average/standard) | SPR-MOD-005-005 |
| Reorder and replenishment | SPR-MOD-005-005 |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Items | SPR-MOD-005-001 |
| Warehouses | SPR-MOD-005-001 |
| Movements — inbound (Stock Receipt) | SPR-MOD-005-002 |
| Movements — outbound and transfer (Stock Issue, Stock Transfer) | SPR-MOD-005-003 |
| Movements — adjustments (Stock Adjustment) | SPR-MOD-005-004 |
| Physical Verification | SPR-MOD-005-004 |
| Valuation | SPR-MOD-005-005 |

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Item | Master Data (§5) | SPR-MOD-005-001 |
| Item Category | Master Data (§5) | SPR-MOD-005-001 |
| Warehouse | Master Data (§5) | SPR-MOD-005-001 |
| Bin/Location | Master Data (§5) | SPR-MOD-005-001 |
| Unit of Measure | Master Data (§5) | SPR-MOD-005-001 |
| Stock Balance | Master Data (§5) | SPR-MOD-005-001 |
| Stock Receipt | Transaction (§6) | SPR-MOD-005-002 |
| Stock Issue | Transaction (§6) | SPR-MOD-005-003 |
| Stock Transfer | Transaction (§6) | SPR-MOD-005-003 |
| Stock Adjustment | Transaction (§6) | SPR-MOD-005-004 |
| Physical Count | Transaction (§6) | SPR-MOD-005-004 |

### 4.4 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-005-001 | §1, §2 (Item master and categorization; Warehouse and bin management; submodules Items, Warehouses), §3 (personas), §5 (Item, Item Category, Warehouse, Bin/Location, Unit of Measure, Stock Balance), §10 (Configuration foundations) |
| SPR-MOD-005-002 | §2 (Stock movements — inbound half; submodule Movements — inbound half), §4 (Inward-to-storage), §6 (Stock Receipt), §8 (`StockReceived` — published; `GoodsReceived` — consumed) |
| SPR-MOD-005-003 | §2 (Stock movements — outbound and transfer half; submodule Movements — outbound and transfer half), §4 (Storage-to-outward, Stock transfer), §6 (Stock Issue, Stock Transfer), §8 (`StockIssued`, `StockTransferred` — published; `DeliveryDispatched`, `ProductionCompleted` — consumed) |
| SPR-MOD-005-004 | §2 (Stock movements — adjustment half; Physical stock verification; submodule Physical Verification), §4 (Adjustment and write-off, Cycle count), §6 (Stock Adjustment, Physical Count), §7 (adjustment threshold rule; physical count variance rule) |
| SPR-MOD-005-005 | §2 (Valuation; Reorder and replenishment; submodule Valuation), §8 (`InventoryValuationChanged`, `InventoryLowStock` — published), §10 (Valuation method per company; Reorder policies) |
| SPR-MOD-005-006 | §9 (Stock Ledger, Stock Valuation, Reorder Report, Ageing Analysis, Stock Turn), §11 (Audit readiness) |

No Module PRD capability, submodule, master-data entity, or transaction sits outside the six sprints above. No capability appears as the originating allocation in more than one sprint.

## 5. Engine Consumption Map

Derived from Inventory Module PRD §12 (Required: `ENG-001`, `ENG-002`, `ENG-003`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-007`, `ENG-012`, `ENG-015`, `ENG-017`, `ENG-020`, `ENG-021`, `ENG-024`, `ENG-026`; Optional: `ENG-008`, `ENG-010`, `ENG-011`, `ENG-013`, `ENG-016`, `ENG-025`, `ENG-027`). No engine behavior is redefined.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-008 | ENG-010 | ENG-011 | ENG-012 | ENG-013 | ENG-015 | ENG-016 | ENG-017 | ENG-020 | ENG-021 | ENG-024 | ENG-025 | ENG-027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-005-001 | ● | ● | ● | ● | ● | ● |   |   |   |   |   |   |   |   | ● |   |   | ● |   |   |
| SPR-MOD-005-002 |   | ● |   | ● |   |   | ● | ● | ● |   | ● |   |   |   | ● |   |   | ● | ● |   |
| SPR-MOD-005-003 |   | ● |   | ● |   |   | ● |   | ● |   | ● |   |   |   | ● |   |   | ● | ● |   |
| SPR-MOD-005-004 |   | ● |   | ● |   |   | ● | ● | ● | ● | ● |   |   |   | ● |   |   | ● | ● |   |
| SPR-MOD-005-005 |   | ● |   | ● | ● |   |   |   |   |   | ● | ● | ● | ● |   |   |   | ● |   |   |
| SPR-MOD-005-006 |   | ● |   | ● |   |   |   |   |   |   |   |   |   |   |   | ● | ● | ● | ● | ● |

Optional engines (`ENG-026` Import) MAY be consumed during Stage 2 authoring per the Module PRD; they are not tabulated as required consumption in this plan. Engine identifiers listed above resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md` and are consistent with the consumer expectations in `docs/ENGINE_USAGE_MATRIX.md`.

## 6. ADR Consumption Map

Accepted ADRs only, per Inventory Module PRD (`ADR-011`, `ADR-014`, `ADR-032`).

| Sprint | ADR-011 | ADR-014 | ADR-032 |
| --- | :-: | :-: | :-: |
| SPR-MOD-005-001 | ● | ● | ● |
| SPR-MOD-005-002 | ● | ● | ● |
| SPR-MOD-005-003 | ● | ● | ● |
| SPR-MOD-005-004 | ● | ● | ● |
| SPR-MOD-005-005 | ● | ● | ● |
| SPR-MOD-005-006 | ● | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Accounting Dependency.** All accounting behavior required by MOD-005 is consumed through `MOD002_ACCOUNTING_BASELINE_v1`. Inventory owns stock lifecycle (physical); Accounting owns valuation posting (financial). Ownership boundaries established by the Accounting baseline SHALL NOT be redefined in Inventory Sprint PRDs.
>
> **Purchase Dependency.** MOD-005 consumes warehouse-handover contracts and the `GoodsReceived` event from `MOD004_PURCHASE_BASELINE_v1`. Inventory owns the resulting putaway and stock ledger; Purchase owns the commercial receipt document. Ownership boundaries established by MOD-004 SHALL NOT be redefined in Inventory Sprint PRDs.
>
> **Sales & Manufacturing Boundary.** Inventory consumes `DeliveryDispatched` (MOD-003 Sales) and `ProductionCompleted` (MOD-009 Manufacturing) to drive stock issues. Inventory does NOT own delivery documents or production orders; source-module ownership stands.
>
> **Analytics Boundary.** Cross-module KPI definitions are owned by **MOD-017 Analytics**. Inventory surfaces its own operational reports (§9) but consumes cross-module KPI definitions from MOD-017.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Item Master | SPR-MOD-005-001 | 002, 003, 004, 005, 006 | Foundational; every later sprint assumes item data. |
| Warehouse & Bin Master | SPR-MOD-005-001 | 002, 003, 004, 005, 006 | Consumed by every stock transaction. |
| Unit of Measure | SPR-MOD-005-001 | 002, 003, 004, 005, 006 | Consumed by every stock transaction. |
| Inventory Configuration | SPR-MOD-005-001 | 002, 003, 004, 005, 006 | Numbering series, negative-stock policy, adjustment thresholds. |
| Numbering Series | SPR-MOD-005-001 (registration) | 002, 003, 004 | Document numbers resolved via `ENG-017`. |
| Stock Receipt Documents | SPR-MOD-005-002 | 005, 006 | Valuation and analytics consume receipt lifecycle. |
| Stock Issue & Transfer Documents | SPR-MOD-005-003 | 005, 006 | Valuation and analytics consume issue/transfer lifecycle. |
| Stock Adjustment & Physical Count | SPR-MOD-005-004 | 005, 006 | Valuation, variance write-off, and analytics consume adjustments. |
| Approval Rules | SPR-MOD-005-004 (thresholds) | — | Multi-step approvals routed via `ENG-011`. |
| Valuation Recalculation | SPR-MOD-005-005 | 006 | Valuation events surfaced in analytics; voucher-creation contracts produced for Accounting. |
| Reorder Policies | SPR-MOD-005-005 | 006 | Low-stock detection surfaced in analytics. |
| Warehouse Handover Contracts | External (MOD-004 Purchase) | SPR-MOD-005-002 | Inventory consumes the handover produced by Purchase GRN. |
| Voucher Creation Contracts (variance / valuation) | SPR-MOD-005-004, SPR-MOD-005-005 | MOD-002 Accounting (external) | Inventory does not implement accounting journals or ledger posting. |
| `GoodsReceived` (consumed event) | External (MOD-004) | SPR-MOD-005-002 | Drives stock receipts, per Module PRD §8. |
| `DeliveryDispatched` (consumed event) | External (MOD-003) | SPR-MOD-005-003 | Drives stock issues, per Module PRD §8. |
| `ProductionCompleted` (consumed event) | External (MOD-009) | SPR-MOD-005-003 | Drives stock receipts/issues linked to production, per Module PRD §8. |
| `StockReceived` event | SPR-MOD-005-002 | 005, 006, MOD-002, MOD-017 | Triggers valuation, analytics, and downstream accounting/reporting. |
| `StockIssued` event | SPR-MOD-005-003 | 005, 006, MOD-002, MOD-017 | Triggers valuation, analytics, and downstream accounting/reporting. |
| `StockTransferred` event | SPR-MOD-005-003 | 005, 006, MOD-017 | Triggers valuation recalculation and analytics. |
| `InventoryValuationChanged` event | SPR-MOD-005-005 | 006, MOD-002, MOD-017 | Triggers accounting voucher creation and analytics. |
| `InventoryLowStock` event | SPR-MOD-005-005 | 006, MOD-004, MOD-017 | Seeds requisition workflow and analytics. |
| Inventory Reporting | SPR-MOD-005-001 (master data) | 006 | Final sprint produces dashboards and reports from all prior data. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-005 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen and available. Any regression against that baseline blocks Stage 2 authoring of MOD-005 sprints until the platform baseline is amended via a new versioned baseline.
- **R2 — Accounting baseline dependency.** MOD-005 assumes `MOD002_ACCOUNTING_BASELINE_v1` is frozen. Adjustment write-offs and valuation posting consume the Accounting baseline for voucher creation and accounting period governance; Inventory MUST NOT redefine accounting ownership.
- **R3 — Purchase baseline dependency.** MOD-005 assumes `MOD004_PURCHASE_BASELINE_v1` is frozen. Stock receipts consume warehouse-handover contracts and the `GoodsReceived` event from Purchase; Inventory MUST NOT redefine Purchase ownership.
- **R4 — Optional-engine scope creep.** Optional engines (`ENG-008`, `ENG-010`, `ENG-011`, `ENG-013`, `ENG-016`, `ENG-025`, `ENG-027`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R5 — Downstream module boundary.** Sales delivery documents, production orders, and cross-module analytics remain owned by their source modules (MOD-003, MOD-009, MOD-017). Inventory consumes events from these modules and MUST NOT redefine their ownership.
- **R6 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md` §3, no horizontal-only sprints are required for MOD-005 beyond the sequence above; all sprints are vertical slices.
- **R7 — Future-enhancement scope.** Serial/batch traceability upgrades, slotting optimization, and IoT-based stock capture are Module PRD §14 Future Enhancements and are NOT allocated to any sprint in this plan.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-005 is baseline-ready when all of the following are objectively true:

1. Every reserved Inventory Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD005_INVENTORY_BASELINE_v1` is authored under `docs/40-module-baselines/` per the repository-standard Stage 3 location.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no Inventory capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md`.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- [`../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
