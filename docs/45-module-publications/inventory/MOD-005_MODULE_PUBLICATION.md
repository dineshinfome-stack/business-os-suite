---
title: "MOD-005 Module Publication — Inventory"
summary: "GT-005 Module Publication for MOD-005 Inventory. Terminal governance artifact derived exclusively from MOD005_INVENTORY_BASELINE_v1 and MOD-005 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-005_MODULE_PUBLICATION"
publication_id: "MOD-005_MODULE_PUBLICATION"
module_id: "MOD-005"
module_name: "Inventory"
version: "1.0"
status: "Published"
owner: "Supply Chain"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/inventory/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md"
source_module: "MOD-005"
source_sprints: ["SPR-MOD-005-001", "SPR-MOD-005-002", "SPR-MOD-005-003", "SPR-MOD-005-004", "SPR-MOD-005-005", "SPR-MOD-005-006"]
layer: "delivery"
updated: "2026-07-21"
tags: ["publication", "module", "MOD-005", "inventory", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD005-20260721T030000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-015", "ENG-016", "ENG-017", "ENG-020", "ENG-021", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
related_modules: ["MOD-001", "MOD-002", "MOD-003", "MOD-004", "MOD-009", "MOD-011", "MOD-015", "MOD-017", "MOD-018", "MOD-019"]
depends_on:
  - "docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md"
  - "docs/20-module-prds/inventory/MODULE_PRD.md"
---

# MOD-005 Module Publication — Inventory

> **Reference publication only.** This publication is a faithful representation of [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) and the [`MOD-005 Module PRD`](../../20-module-prds/inventory/MODULE_PRD.md). It introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Executive Summary

MOD-005 Inventory is the authoritative bounded context for the Stock Management lifecycle and system of record for stock. It owns the enterprise Item, Warehouse, and Bin master; unit-of-measure master; stock balance projection; the commercial Inventory Receipt, Issue, Transfer, Adjustment, and Physical/Cycle Count lifecycles; valuation policy and valuation snapshots (FIFO / moving average / standard); reorder and replenishment; and the inventory analytics and operational-controls read-model surface. Physical warehouse execution (putaway, picking, packing, load-out) is owned by MOD-019 Warehouse, which consumes Inventory master data read-only and triggers ledger effects through published events. (Baseline §2; PRD §§1–2; ADR-007 boundary.)

## 2. Module Scope

Restates the scope consolidated in `MOD005_INVENTORY_BASELINE_v1` §2 and the Module PRD §2. Inventory owns:

- **Inventory Foundation** — item master, item categorisation, item groups, item attributes, unit-of-measure master, warehouse master, bin/location master, stock balance projections, inventory configuration, and inventory numbering readiness. (Baseline §2; PRD §5, §10.)
- **Inventory Receipts & Putaway** — commercial Inventory Receipt lifecycle, receipt validation, putaway/bin assignment, warehouse-handover consumption from Purchase, receipt numbering, attachments, notifications, and Inventory Receipt lifecycle events. (Baseline §2; PRD §6.)
- **Inventory Issues, Transfers & Reservations** — commercial Inventory Issue lifecycle, inter-warehouse and inter-bin Inventory Transfer lifecycle, Transfer Request lifecycle, movement validation (including negative-stock policy), reservation/allocation state, movement numbering, attachments, notifications, and Inventory Movement lifecycle events. (Baseline §2; PRD §6, §7.)
- **Inventory Adjustments & Stock Counting** — commercial Inventory Adjustment lifecycle (Stock Adjustment Request, Adjustment Approval, and Reconciliation Request facets), Physical/Cycle/Scheduled/Blind/Recount execution lifecycles, variance recording and review, adjustment/count numbering, attachments, notifications, and Inventory Adjustment and Stock Count lifecycle events; consumes accounting voucher-creation contracts owned by MOD-002 Accounting. (Baseline §2; PRD §6, §7.)
- **Inventory Valuation & Replenishment** — commercial Valuation Policy (per company), Valuation Snapshot, Revaluation Request, valuation recalculation on stock events, commercial Reorder Policy, Replenishment Suggestion, Low-Stock Signal, and commercial Replenishment Approval; produces voucher-creation contracts for downstream MOD-002 Accounting consumption. (Baseline §2; PRD §10.)
- **Inventory Analytics & Operational Controls** — inventory dashboards, KPI reporting, stock-ledger, stock-valuation, reorder, ageing, and stock-turn reports; operational controls, audit readiness, read-model consumption, dashboard filtering, export readiness, and reporting events. (Baseline §2; PRD §9.)

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 3. Business Objectives

Inherited verbatim from Module PRD §1:

- Provide the authoritative business surface for the Stock Management bounded context.
- Deliver the capabilities enumerated in §2 to the personas in §6.
- Consume ERP Core Engines listed in §15 without redefining platform behavior.

**Success Criteria** (PRD §1):

- All in-scope capabilities are supported end-to-end with the declared engines.
- All state-changing transactions are audited (`ENG-004`) and authorized (`ENG-002`).
- Cross-module interactions occur only via published events, approved APIs, or shared master data.

## 4. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-005-001` … `SPR-MOD-005-006`) as consolidated in `MOD005_INVENTORY_BASELINE_v1` §§3–4. This publication introduces no new requirements. See the source Sprint PRDs for requirement-level detail.

## 5. Business Capabilities

Inherited verbatim from `MOD005_INVENTORY_BASELINE_v1` §4 and PRD §2:

| Capability Area | Originating Sprint |
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
| Reports, dashboards, KPIs, operational controls, audit readiness | SPR-MOD-005-006 |

## 6. Actors

Inherited verbatim from PRD §3.

- **Primary Users:** Warehouse Manager; Stores Officer; Inventory Controller.
- **Secondary Users:** Accountant; Auditor.
- **External Actors:** 3PL; Logistics.

## 7. User Roles

Business-level roles named in PRD §3 and enforced via `ENG-002` and `ENG-003` under ADR-032.

- Warehouse Manager
- Stores Officer
- Inventory Controller
- Accountant (read-oriented)
- Auditor (read-only)
- 3PL / Logistics (external, contract-scope only)

## 8. Workflows

Inherited verbatim from PRD §4:

- **Inward-to-Storage** — receipt capture → putaway assignment → stock-balance update.
- **Storage-to-Outward** — issue capture → allocation → stock-balance update.
- **Stock Transfer** — transfer request → dispatch → in-transit → receipt at destination.
- **Adjustment and Write-Off** — adjustment request → approval (above threshold) → posting via variance account (MOD-002).
- **Cycle Count** — count schedule → count execution → variance recording → reconciliation.

Long-running orchestration uses `ENG-010`; approvals use `ENG-011`; rules use `ENG-012`.

## 9. Business Rules

Inherited verbatim from PRD §7 and Baseline §7:

- Negative stock is only permitted when explicitly enabled per warehouse. (PRD §7)
- Adjustments beyond a configured threshold require approval. (PRD §7)
- Physical count differences post to the configured variance account via MOD-002 Accounting. (PRD §7)
- Item master lifecycle (create, edit, archive) is Inventory-owned; other modules reference items by stable identifier and never mutate item master state. (Baseline §7)
- Inventory Receipt lifecycle is Inventory-owned; downstream modules consume Inventory Receipt events and read APIs and never introduce independent receipt lifecycles. (Baseline §7)
- Inventory Issue, Transfer, and Transfer Request lifecycles, movement validation, and reservation/allocation state are Inventory-owned. (Baseline §7)
- Inventory Adjustment lifecycle (Stock Adjustment Request, Adjustment Approval, Reconciliation Request) and Physical/Cycle/Scheduled/Blind/Recount execution lifecycles are Inventory-owned; physical execution on the warehouse floor is owned by MOD-019 Warehouse. (Baseline §7)
- Accounting voucher creation, ledger posting, and variance write-off postings are owned by MOD-002; Inventory consumes the voucher-creation contract and never redefines Accounting ownership. (Baseline §7)
- Valuation Policy (per company), Valuation Snapshot, Revaluation Request, Reorder Policy, Replenishment Suggestion, Low-Stock Signal, and Replenishment Approval are Inventory-owned. (Baseline §7)
- Analytics and operational-controls surfaces are read-only projections over the Inventory read model. (Baseline §7)

## 10. Validation Rules

Inherited verbatim from PRD §5, §7; enforced via `ENG-012`:

- Structural validations (required fields, referential integrity, uniqueness) evaluated by `ENG-012`. (PRD §5)
- Negative-stock policy check per warehouse. (PRD §7)
- Adjustment threshold check triggering approval. (PRD §7)
- Tolerance and variance evaluation for physical counts. (Baseline §7)

## 11. Security Requirements

Derived from ADRs (Baseline §6):

- **Multi-Tenant Isolation** — `ADR-011`. Every Inventory entity is tenant-scoped.
- **RBAC + ABAC** — `ADR-032`. Enforced via `ENG-002` and registered via `ENG-003`.
- **Platform Policies** — Encryption, secrets management, and data classification inherited from `MOD001_PLATFORM_BASELINE_v1`.
- **Identity** — Resolved via `ENG-001`; Inventory maintains no parallel identity store.

## 12. Audit Requirements

Inherited verbatim from PRD §6 and Baseline §6:

- Every state-changing Inventory operation is audited via `ENG-004` under `ADR-014`.
- Audit-readiness surface exposes prior-sprint events through the read model; audit collection remains owned by Platform.

## 13. Notifications

Delivered via `ENG-025`. Surfaces inherited from Sprint PRDs:

- Inventory Receipt confirmation and exception notifications. (SPR-MOD-005-002)
- Inventory Issue, Transfer, and Transfer Request notifications. (SPR-MOD-005-003)
- Inventory Adjustment, approval, and Physical/Cycle Count variance notifications. (SPR-MOD-005-004)
- Analytics / operational-control notifications for KPI breach and exception review. (SPR-MOD-005-006)

Inventory never redefines notification infrastructure; it emits notification requests through `ENG-025`.

## 14. Reports

Inherited verbatim from PRD §9:

- Stock Ledger
- Stock Valuation
- Reorder Report
- Ageing Analysis
- Stock Turn

Dashboards via `ENG-022`; cross-module KPI catalog maintained in **MOD-017 Analytics**. Bulk exports via `ENG-027`.

## 15. Integration Requirements

### 15.1 Events Published

Inherited verbatim from PRD §8 and Baseline §8. Emitted via `ENG-024`:

- `StockReceived`
- `StockIssued`
- `StockTransferred`
- `InventoryLowStock`
- `InventoryValuationChanged`

Inventory Adjustment and Stock Count event surfaces remain deferred under `R-EV-01` pending event-catalog registration (Baseline §8, §11).

### 15.2 Events Consumed

Inherited verbatim from PRD §8:

- `GoodsReceived` (MOD-004 Purchase)
- `DeliveryDispatched` (MOD-003 Sales)
- `ProductionCompleted` (MOD-009 Manufacturing)

### 15.3 External System Categories

Inherited verbatim from PRD §8 (business categories only):

- 3PL / WMS
- Barcode / label printers

### 15.4 Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-005 via their Capability Interfaces. Engine set inherited verbatim from `MOD005_INVENTORY_BASELINE_v1` §5:

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

`ENG-015` (Voucher) and `ENG-016` (Posting) are consumed strictly as voucher-request and posting-request contracts to MOD-002; Inventory MUST NOT redefine accounting voucher creation or ledger posting.

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011`, `ADR-014`, `ADR-032`.

### 15.5 Cross-Module Contracts

Inherited verbatim from Baseline §9:

- **Upstream contracts consumed by Inventory:** MOD-001 Platform Administration, MOD-002 Accounting, MOD-003 Sales, MOD-004 Purchase, MOD-019 Warehouse (physical execution contracts), MOD-009 Manufacturing.
- **Downstream consumers of Inventory:** MOD-003 Sales, MOD-004 Purchase, MOD-011 AMC, MOD-015 POS, MOD-017 Analytics, MOD-018 AI Workspace.

## 16. AI Requirements

Per Baseline §11 (Deferred Items):

- AI-driven demand forecasting and predictive replenishment — deferred.
- Cross-module KPI definitions consumed from MOD-017 Analytics remain that module's authority.

No AI capability is authored by this publication.

## 17. Acceptance Criteria

1. Every authority summarized in §§5–15 is inherited verbatim from `MOD005_INVENTORY_BASELINE_v1` and the MOD-005 Module PRD.
2. Engine and ADR sets in §15.4 match the Module Baseline §5–§6 exactly.
3. Cross-module dependency set in §15.5 matches the Module Baseline §9 exactly.
4. Traceability matrix in §18 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Traceability Matrix

| # | Publication Section | Requirement | Source | Section |
| --- | --- | --- | --- | --- |
| 1 | §1 Executive Summary | System-of-record for stock | PRD | §1; Baseline §2 |
| 2 | §2 Scope — Foundation | Item/warehouse/bin master authority | Baseline | §2; §7 |
| 3 | §2 Scope — Receipts & Putaway | Receipt lifecycle | Baseline | §2; §7 |
| 4 | §2 Scope — Issues/Transfers/Reservations | Issue/Transfer/Reservation | Baseline | §2; §7 |
| 5 | §2 Scope — Adjustments & Counting | Adjustment/Count lifecycles | Baseline | §2; §7 |
| 6 | §2 Scope — Valuation & Replenishment | Valuation/Reorder policy | Baseline | §2; §7 |
| 7 | §2 Scope — Analytics & Controls | Read-model surfaces | Baseline | §2; §7 |
| 8 | §3 Objectives | Objectives + success | PRD | §1 |
| 9 | §5 Capabilities | Capability → Sprint map | Baseline | §4 |
| 10 | §6 Actors | Personas | PRD | §3 |
| 11 | §7 User Roles | Business roles | PRD | §3 |
| 12 | §8 Workflows | Process catalogue | PRD | §4 |
| 13 | §9 Business Rules | Negative stock, adjustment threshold, variance | PRD | §7; Baseline §7 |
| 14 | §10 Validation Rules | Structural + business validations | PRD | §5, §7 |
| 15 | §11 Security | Multi-tenant + RBAC/ABAC | Baseline | §6 |
| 16 | §12 Audit | ENG-004 audit | PRD | §6; Baseline §6 |
| 17 | §13 Notifications | Notification surfaces | Sprint PRDs | 002–006 |
| 18 | §14 Reports | Reports & dashboards | PRD | §9 |
| 19 | §15.1 Events Published | Event set | PRD | §8; Baseline §8 |
| 20 | §15.2 Events Consumed | Consumed set | PRD | §8 |
| 21 | §15.3 External Systems | External categories | PRD | §8 |
| 22 | §15.4 Engines | Engine table | Baseline | §5 |
| 23 | §15.5 Cross-Module | Contracts | Baseline | §9 |
| 24 | §16 AI | Deferred AI items | Baseline | §11 |
| 25 | §17 Acceptance | Publication acceptance | GT-005 | v1.0 |

## 19. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD005-20260721T030000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD005_PUBLICATION_COMPLETE` → satisfies remediation finding `F-PRR-002`.
- **Supersession Rule:** Superseded only by a future publication derived from `MOD005_INVENTORY_BASELINE_v2` or later.

## 20. References

- [`docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md)
- [`docs/30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md`](../../30-sprint-prds/inventory/MOD-005_SPRINT_PLAN.md)
- [`docs/45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md`](../crm/MOD-006_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/11-adrs/architecture/ADR-007-core-erp-module-boundaries.md`](../../11-adrs/architecture/ADR-007-core-erp-module-boundaries.md) — Inventory/Warehouse boundary.
