---
title: "SPR-MOD-005-005 — Inventory Valuation & Replenishment"
summary: "Sprint PRD for the commercial Inventory Valuation and Replenishment surface of MOD-005 Inventory: valuation method configuration per company, valuation recalculation on stock events, valuation snapshot, revaluation request, reorder policy, replenishment suggestion, low-stock detection, replenishment approval, numbering, attachments, notifications, and valuation & replenishment events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Inventory"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-005-005"
parent_module: "MOD-005"
parent_sprint_plan: "MOD-005_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "8.8.5"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-012", "ENG-013", "ENG-015", "ENG-016", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "inventory", "valuation", "replenishment", "mod-005"]
document_type: "Sprint PRD"
---

# SPR-MOD-005-005 — Inventory Valuation & Replenishment

> **Stage 2 deliverable.** Fifth authored Sprint PRD for **MOD-005 Inventory** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-005-005` (permanent) |
| Parent Module | `MOD-005` — Inventory |
| Parent Sprint Plan | [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium (mirrored verbatim from `MOD-005_SPRINT_PLAN.md` § SPR-MOD-005-005 "Estimated size") |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md), [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (all frozen) |
| Upstream Sprints | [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md), [`SPR-MOD-005-002`](./SPR-MOD-005-002-inventory-receipts-putaway.md), [`SPR-MOD-005-003`](./SPR-MOD-005-003-inventory-issues-transfers-reservations.md), [`SPR-MOD-005-004`](./SPR-MOD-005-004-inventory-adjustments-stock-counting.md) |
| Downstream Sprints | `SPR-MOD-005-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial Inventory Valuation and Replenishment surface** for BusinessOS: commercial valuation method configuration per company (FIFO / Moving Average / Standard as commercial classification), commercial valuation recalculation on stock events published by upstream Inventory sprints, valuation snapshot, revaluation request, commercial reorder policy maintenance, replenishment suggestion generation, low-stock detection, replenishment approval, replenishment numbering, attachments, notifications, and valuation & replenishment events. The commercial Valuation Policy, Valuation Snapshot, Reorder Policy, and Replenishment Suggestion are the substrates consumed by downstream Inventory sprints — analytics — and by Accounting (`MOD-002`) via voucher-creation contracts and by Purchase (`MOD-004`) via replenishment handoff contracts.

> **Inventory Valuation & Replenishment Ownership Convention.** The Inventory module owns the business semantics of the commercial Valuation Policy (per company), the Valuation Snapshot, the Revaluation Request, the commercial Reorder Policy, the Replenishment Suggestion, the Low-Stock Signal, and the commercial Replenishment Approval. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, rules, automation, voucher-request, posting-request, eventing) but **MUST NOT** redefine inventory valuation or replenishment business rules. Downstream modules consume commercial Valuation and Replenishment events and read APIs rather than introducing independent valuation or replenishment lifecycles. This complements — and does not redefine — the governance conventions established by `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, `SPR-MOD-005-001`, `SPR-MOD-005-002`, `SPR-MOD-005-003`, and `SPR-MOD-005-004`.

#### 1.1.1 Inventory Valuation Ownership

Inventory owns the commercial Valuation Policy per company (method selection as commercial classification: FIFO / Moving Average / Standard), commercial valuation recalculation triggered by stock events published by upstream Inventory sprints, the Valuation Snapshot, and the Revaluation Request. No other module MAY create, edit, close, or independently maintain a parallel commercial valuation lifecycle. Downstream modules consume Valuation events and read APIs; they MUST NOT redefine the commercial Valuation Policy, the Valuation Snapshot, the Revaluation Request, or their status lifecycles.

#### 1.1.2 Replenishment Ownership

Inventory owns the commercial Reorder Policy per item / warehouse, the Replenishment Suggestion, the Low-Stock Signal, and the commercial Replenishment Approval facet. No other module MAY create, edit, close, or independently maintain a parallel commercial replenishment lifecycle. Downstream Purchase (`MOD-004`) consumes Replenishment Suggestion events and read APIs and originates Purchase Requisitions and Purchase Orders on its own authority; Inventory MUST NOT create Purchase Requisitions or Purchase Orders.

#### 1.1.3 Accounting Boundary

Accounting (`MOD-002`) owns accounting vouchers, journal posting, ledger posting, financial valuation, financial costing, taxation, and financial reconciliation per `MOD002_ACCOUNTING_BASELINE_v1`. Inventory Valuation & Replenishment SHALL request downstream accounting processing through approved repository contracts (voucher-creation contract via `ENG-015` request; posting-effect request via `ENG-016` request). Inventory Valuation & Replenishment SHALL NOT create journals, SHALL NOT create vouchers, SHALL NOT perform financial valuation, SHALL NOT perform financial costing, SHALL NOT update ledgers, and SHALL NOT perform financial reconciliation. Commercial valuation state produced here is a management view; the accounting view is owned by Accounting.

#### 1.1.4 Purchase Consumption Boundary

Purchase (`MOD-004`) SHALL remain authoritative for Purchase Requisition, Purchase Order, and Vendor Billing lifecycles per `MOD004_PURCHASE_BASELINE_v1`. Inventory Valuation & Replenishment MAY emit Replenishment Suggestion events and expose Replenishment Suggestion read APIs; Purchase originates Purchase Requisitions and Purchase Orders on its own authority. Inventory Valuation & Replenishment SHALL NOT create Purchase Requisitions, Purchase Orders, or Vendor Bills, SHALL NOT redefine Purchase ownership, and SHALL NOT drive Purchase document lifecycles.

#### 1.1.5 Sales Consumption Boundary

Sales (`MOD-003`) SHALL remain authoritative for Sales Order, Sales Delivery, and Sales Invoice lifecycles per `MOD003_SALES_BASELINE_v1`. Inventory Valuation & Replenishment MAY consume Sales demand signals through approved repository contracts (read-only Sales Order backlog / demand summaries) to inform reorder policy evaluation. Inventory Valuation & Replenishment SHALL NOT mutate Sales Order state, SHALL NOT redefine Sales ownership, and SHALL NOT drive Sales document lifecycles.

#### 1.1.6 Warehouse Consumption Boundary

Warehouse SHALL remain authoritative for physical warehouse execution (physical bin operations, physical put-away, physical scanning, external 3PL integration, physical stock verification). Inventory Valuation & Replenishment consumes warehouse execution outcomes only through the stock-event surfaces published by upstream Inventory sprints; it SHALL NOT perform Warehouse operations directly, SHALL NOT redefine Warehouse ownership, and SHALL NOT drive external WMS execution.

#### 1.1.7 Manufacturing Consumption Boundary

Manufacturing (as identified in [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md)) SHALL remain authoritative for production planning and execution lifecycles. Inventory Valuation & Replenishment MAY consume production demand signals through approved repository contracts (read-only demand summaries) to inform reorder policy evaluation. Inventory Valuation & Replenishment SHALL NOT mutate Manufacturing state, SHALL NOT redefine Manufacturing ownership, and SHALL NOT drive Manufacturing document lifecycles.

#### 1.1.8 Numbering Boundary

Commercial Replenishment Suggestion and Revaluation Request numbers SHALL be generated by the repository-approved numbering capability already registered in `SPR-MOD-005-001`. Numbering series consumed by this sprint are the Inventory numbering series registered in `SPR-MOD-005-001`; no new numbering series are registered here. The numbering engine (`ENG-017`) is not in the Sprint 5 engine allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) § SPR-MOD-005-005 "Engines consumed"; where a commercial number is required by an acceptance criterion in this sprint, that number is provided by the numbering surface established in `SPR-MOD-005-001` (which owns `ENG-017` consumption) and is not re-consumed here.

#### 1.1.9 No Downstream Ownership Transfer

Sprint 5 SHALL consume Manufacturing, Warehouse, Purchase, Sales, and Accounting capabilities through approved repository contracts and SHALL NOT redefine or transfer ownership. Downstream Sprint 6 (Analytics) and downstream modules (Accounting, Purchase, Analytics) MAY consume Valuation and Replenishment events and read APIs; they MUST NOT redefine the commercial Valuation Policy, Valuation Snapshot, Revaluation Request, Reorder Policy, Replenishment Suggestion, Low-Stock Signal, or Replenishment Approval owned here.

#### 1.1.10 Governance Complement

This Sprint complements — and does not redefine — `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md), [`SPR-MOD-005-002`](./SPR-MOD-005-002-inventory-receipts-putaway.md), [`SPR-MOD-005-003`](./SPR-MOD-005-003-inventory-issues-transfers-reservations.md), and [`SPR-MOD-005-004`](./SPR-MOD-005-004-inventory-adjustments-stock-counting.md). Ownership established by those baselines and by prior Inventory sprints is consumed and preserved; it is not overridden here. Ownership boundaries SHALL NOT be redefined in downstream Inventory Sprint PRDs.

### 1.2 In Scope

Commercial Inventory Valuation and Replenishment surface only:

- Valuation Method Configuration per company under a tenant/company scope (commercial classification: FIFO / Moving Average / Standard) resolved via `ENG-005` under the tenant → company → context hierarchy.
- Valuation Recalculation triggered by stock events published by upstream Inventory sprints (Stock Receipt, Stock Issue, Stock Transfer, Stock Adjustment).
- Valuation Snapshot creation per item / warehouse / company (commercial management view).
- Revaluation Request emission (commercial re-evaluation of the Valuation Snapshot without redefining Accounting revaluation).
- Reorder Policy maintenance per item / warehouse under a tenant/company scope (commercial parameters: reorder point, min / max, EOQ classification as a commercial signal).
- Replenishment Suggestion generation from Reorder Policy evaluation and current stock signals.
- Low-Stock Detection driven by Reorder Policy evaluation and current stock signals.
- Replenishment Approval — commercial multi-step approval driven by threshold policy declared in Module PRD §7 and configuration surfaced by `SPR-MOD-005-001`, routed through `ENG-011` **only if allocated in Sprint 5**; where not allocated in Sprint 5, approval is deferred to the automation-driven policy path consumed via `ENG-013` per the Sprint 5 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) § SPR-MOD-005-005 "Engines consumed".
- Attachments on Valuation Snapshot, Revaluation Request, and Replenishment Suggestion documents consumed via the attachment surface declared in `SPR-MOD-005-001`.
- Notifications on valuation and replenishment lifecycle transitions consumed via the notification surface declared in `SPR-MOD-005-001`.
- Valuation-change and low-stock events emitted via `ENG-024` (subject to authoritative event-catalog resolution — see §11 and `R-EV-01`).
- Voucher-creation and posting-effect contracts requested from Accounting via `ENG-015` / `ENG-016` request paths (Inventory does not itself create vouchers or ledger entries).

### 1.3 Out of Scope

Reserved for other sprints, upstream baselines, or explicit non-redefinition:

- Item Master, Item Category, Item Group, UoM, warehouse master, storage-location master, numbering series registration, attachment surface registration, notification surface registration — owned by `SPR-MOD-005-001`.
- Purchase Requisition, Purchase Order, and Vendor Billing lifecycles — owned by MOD-004 Purchase via `MOD004_PURCHASE_BASELINE_v1`.
- Sales Order, Sales Delivery, and Sales Invoice lifecycles — owned by MOD-003 Sales via `MOD003_SALES_BASELINE_v1`.
- Manufacturing production planning and execution lifecycles — owned externally per `MODULE_CATALOG.md`.
- Warehouse ownership (physical WMS, external 3PL, physical count execution, physical bin operations, physical scanning) — external; consumed via upstream Inventory sprint stock events.
- Accounting vouchers, journal posting, ledger posting, financial valuation, financial costing, financial reconciliation, receivables, payables, taxation — owned by MOD-002 Accounting via `MOD002_ACCOUNTING_BASELINE_v1`.
- Inventory Receipt and Putaway — owned by `SPR-MOD-005-002`.
- Inventory Issues, Transfers, and Reservations — owned by `SPR-MOD-005-003`.
- Inventory Adjustments & Stock Counting — owned by `SPR-MOD-005-004`.
- Lot Control and Serial Control — not in the approved MOD-005 Module PRD; explicitly not authored here.
- Dashboards, KPIs, Analytics, and Reporting — `SPR-MOD-005-006` and MOD-017 Analytics.
- Financial costing calculations (weighted-average financial cost, standard-cost variance analysis, financial revaluation, GL revaluation) — owned by MOD-002 Accounting.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-005-005`, the following will exist:

- **Valuation Method Configuration.** Commercial Valuation Method (FIFO / Moving Average / Standard as commercial classification) is configurable per company under the configuration hierarchy consumed via `ENG-005`.
- **Valuation Recalculation.** Commercial valuation recalculation is triggered deterministically on Stock Receipt, Stock Issue, Stock Transfer, and Stock Adjustment events published by upstream Inventory sprints.
- **Valuation Snapshot.** Commercial Valuation Snapshot documents can be produced per item / warehouse / company under a tenant/company scope.
- **Revaluation Request.** Commercial Revaluation Request documents can be emitted against a Valuation Snapshot.
- **Reorder Policy.** Commercial Reorder Policy records can be created, edited, and closed per item / warehouse under a tenant/company scope.
- **Replenishment Suggestion.** Commercial Replenishment Suggestion documents can be generated from Reorder Policy evaluation.
- **Low-Stock Detection.** Commercial Low-Stock Signal is emitted deterministically from Reorder Policy evaluation.
- **Replenishment Approval.** Commercial multi-step approval is enforced against a threshold policy declared in Module PRD §10 and surfaced by `SPR-MOD-005-001`, driven by `ENG-013` automation per the Sprint 5 engine allocation (approval routing engine `ENG-011` is not in Sprint 5's allocation and is not re-consumed here).
- **Attachments and Notifications.** The attachment and notification surfaces declared in `SPR-MOD-005-001` are consumed on Valuation Snapshot, Revaluation Request, and Replenishment Suggestion documents.
- **Valuation & Replenishment Events.** Event contracts for the commercial Valuation and Replenishment lifecycles (see §11) are emitted via `ENG-024`, subject to authoritative event-catalog resolution (see §11 and `R-EV-01`).
- **Voucher-creation and posting-effect request contracts.** Inventory-side request contracts (via `ENG-015` and `ENG-016` request paths) are produced for downstream `MOD002_ACCOUNTING_BASELINE_v1` consumption; Inventory does not itself create vouchers or ledger entries.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-005-005`.
- **Forward references.** Downstream sprint `SPR-MOD-005-006` (Analytics & Controls) consumes the commercial valuation and replenishment substrate established here.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Bidirectional Traceability

The following six invariants govern this section:

1. Every Module capability SHALL map to exactly one originating Sprint allocation.
2. Every Sprint capability SHALL trace back to exactly one approved Module capability.
3. Every Module PRD capability allocated to Sprint 5 SHALL appear exactly once in this Sprint PRD, and every Sprint PRD capability SHALL map back to exactly one originating Module capability.
4. No orphan Sprint capability.
5. No duplicate originating allocation.
6. No unallocated Module capability.

### 3.1 Forward Map — Module PRD Capability → Sprint 5 Deliverable

| MOD-005 MODULE_PRD Reference | Delivered By |
| --- | --- |
| §2 Business Scope — Valuation (FIFO / moving average / standard); submodule Valuation | Valuation Method Configuration, Valuation Recalculation, Valuation Snapshot, Revaluation Request |
| §2 Business Scope — Reorder and replenishment | Reorder Policy, Replenishment Suggestion, Low-Stock Detection, Replenishment Approval |
| §7 Business Rules — Physical count differences post to the configured variance account (valuation side) | Valuation Recalculation on Stock Adjustment events (Inventory-side management view; Accounting posting requested via voucher-creation contract) |
| §8 Integration Points — Events Published (`InventoryValuationChanged`, `InventoryLowStock`) | Valuation & Replenishment Events (§11), subject to verbatim resolution in the event catalog under `R-EV-01` |
| §10 Configuration — Valuation method per company | Valuation Method Configuration via `ENG-005` |
| §10 Configuration — Reorder policies | Reorder Policy maintenance |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

### 3.2 Reverse Map — Sprint 5 Capability → Module PRD Reference

| Sprint 5 Capability | Module PRD Reference |
| --- | --- |
| Valuation Method Configuration | §2 (Valuation; submodule Valuation); §10 (Valuation method per company) |
| Valuation Recalculation | §2 (Valuation); §7 (Physical count differences — valuation side) |
| Valuation Snapshot | §2 (Valuation; submodule Valuation) |
| Revaluation Request | §2 (Valuation); §7 (Physical count differences — valuation side) |
| Reorder Policy | §2 (Reorder and replenishment); §10 (Reorder policies) |
| Replenishment Suggestion | §2 (Reorder and replenishment) |
| Low-Stock Detection | §2 (Reorder and replenishment); §8 (`InventoryLowStock` — published) |
| Replenishment Approval | §2 (Reorder and replenishment); §10 (Reorder policies) |
| Attachments | §12 (Optional engines — Attachment; consumed via surface registered in `SPR-MOD-005-001`) |
| Notifications | §12 (Optional engines — Notification; consumed via surface registered in `SPR-MOD-005-001`) |
| Valuation & Replenishment Events | §8 (Integration Points — Events Published: `InventoryValuationChanged`, `InventoryLowStock`) |
| Voucher-creation and posting-effect request contracts | §12 (Optional engines — Posting, Voucher); §13 (Provides To — MOD-002 Accounting) |

Sprint scope is bounded strictly by these references. **No capability introduced in this Sprint PRD is outside the approved Inventory Module PRD, and no Sprint 5 capability approved in `MOD-005_SPRINT_PLAN.md` is orphaned from this Sprint PRD.** Unique originating allocation is preserved. Every Module PRD capability allocated to Sprint 5 appears exactly once above, and every Sprint 5 capability listed above maps back to exactly one originating Module capability. No capability has been added, omitted, renamed, merged, or reallocated relative to `MOD-005_SPRINT_PLAN.md` § SPR-MOD-005-005.

---

## 4. User Stories

Every user story SHALL trace to exactly one Sprint Deliverable (§2).

- **US-001.** *As an inventory controller, I want a single authoritative Valuation Method per company, so that commercial valuation classification is resolved once and consumed by every downstream Inventory sprint.* — Deliverable: Valuation Method Configuration.
- **US-002.** *As an inventory analyst, I want commercial valuation to recalculate deterministically on stock events published by upstream Inventory sprints, so that the Valuation Snapshot always reflects the most recent authoritative stock state.* — Deliverables: Valuation Recalculation, Valuation Snapshot.
- **US-003.** *As an inventory controller, I want to produce a Valuation Snapshot per item / warehouse / company on demand, so that the commercial management view of inventory value is auditable at a point in time.* — Deliverable: Valuation Snapshot.
- **US-004.** *As an inventory controller, I want to emit a Revaluation Request against a Valuation Snapshot without redefining Accounting revaluation, so that the commercial re-evaluation event is observable to downstream consumers.* — Deliverable: Revaluation Request.
- **US-005.** *As an inventory controller, I want to maintain a Reorder Policy per item / warehouse under a tenant/company scope, so that replenishment governance is centralized in Inventory.* — Deliverable: Reorder Policy.
- **US-006.** *As a procurement coordinator (consumer), I want Replenishment Suggestions generated from authoritative Reorder Policy evaluation, so that Purchase can originate Purchase Requisitions from a single Inventory-owned suggestion surface.* — Deliverable: Replenishment Suggestion.
- **US-007.** *As an inventory analyst, I want Low-Stock Signals emitted deterministically from Reorder Policy evaluation, so that consuming modules can react without redefining low-stock detection.* — Deliverable: Low-Stock Detection.
- **US-008.** *As an inventory controller, I want commercial approval of Replenishment Suggestions beyond a configured threshold, so that high-impact replenishment is governed per Module PRD §10 without redefining Purchase approval.* — Deliverable: Replenishment Approval.
- **US-009.** *As a branch manager, I want Valuation Snapshots, Revaluation Requests, Reorder Policies, and Replenishment Suggestions scoped under the tenant/company/branch hierarchy established by the Platform baseline, so that valuation and replenishment remain isolated per tenant per `ADR-011`.* — Deliverables: Valuation Snapshot, Revaluation Request, Reorder Policy, Replenishment Suggestion.
- **US-010.** *As an inventory administrator, I want to attach evidence (policy documents, supporting analyses, sign-offs) to Valuation Snapshot, Revaluation Request, and Replenishment Suggestion documents, so that audit review has full context.* — Deliverable: Attachments.
- **US-011.** *As an inventory administrator, I want notifications on valuation and replenishment lifecycle transitions, so that approvers and reviewers act in time.* — Deliverable: Notifications.
- **US-012.** *As an inventory analyst, I want valuation-change and low-stock events published so that downstream systems (Accounting, Purchase, Analytics) can react without Inventory publishing directly to consuming modules.* — Deliverable: Valuation & Replenishment Events.
- **US-013.** *As an accountant (consumer), I want Inventory to request voucher creation and posting effects through approved repository contracts rather than creating journals itself, so that Accounting ownership is preserved.* — Deliverable: Voucher-creation and posting-effect request contracts.
- **US-014.** *As a warehouse coordinator (consumer), I want Inventory to consume stock events published by upstream Inventory sprints rather than driving Warehouse operations, so that Warehouse ownership is preserved.* — Deliverable: (Warehouse consumption via upstream Inventory stock-event surfaces; no new Inventory Valuation & Replenishment capability writes to Warehouse.)
- **US-015.** *As a system administrator, I want every commercial valuation and replenishment lifecycle transition to be audited via `ENG-004`, so that valuation and replenishment history can be reconstructed from an authoritative log.* — Deliverable: (audit thread across all deliverables).

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Valuation Method Configuration (US-001)

- **Given** a tenant/company scope,
  **when** an inventory controller selects a commercial Valuation Method (FIFO / Moving Average / Standard as commercial classification),
  **then** the selection is persisted under the configuration hierarchy consumed via `ENG-005`, is resolvable per company, and can be re-resolved deterministically thereafter.

### 5.2 Valuation Recalculation on Stock Events (US-002)

- **Given** a Stock Receipt, Stock Issue, Stock Transfer, or Stock Adjustment event published by upstream Inventory sprints (`SPR-MOD-005-002` … `SPR-MOD-005-004`),
  **when** the event is consumed by the Inventory Valuation & Replenishment automation surface via `ENG-013`,
  **then** commercial valuation is recalculated deterministically per the configured Valuation Method (§5.1) and the resulting change is observable in the Valuation Snapshot for the affected item / warehouse / company.

### 5.3 Valuation Snapshot (US-003)

- **Given** a valid request under a tenant/company scope,
  **when** an inventory controller produces a Valuation Snapshot,
  **then** a Valuation Snapshot document is persisted per item / warehouse / company, is stable at its point in time, and is authoritative for the commercial management view.

### 5.4 Revaluation Request (US-004)

- **Given** a Valuation Snapshot,
  **when** an inventory controller emits a Revaluation Request,
  **then** a Revaluation Request document is persisted linked to the source Valuation Snapshot, and a valuation-change event surface is emitted (subject to §5.14 and `R-EV-01`).

> **Inventory Valuation & Replenishment SHALL NOT perform Accounting posting; any accounting effect is requested through approved repository contracts.**

### 5.5 Reorder Policy (US-005)

- **Given** a tenant/company scope and a valid Item + Warehouse reference (both owned by `SPR-MOD-005-001`),
  **when** an inventory controller creates or edits a Reorder Policy (reorder point, min / max, EOQ classification as a commercial signal),
  **then** the Reorder Policy record is persisted deterministically and is observable to Reorder Policy evaluation (§5.6, §5.7).

### 5.6 Replenishment Suggestion (US-006)

- **Given** a Reorder Policy and current stock signals derived from upstream Inventory sprint events,
  **when** Reorder Policy evaluation runs (driven by `ENG-013` automation per Sprint 5 engine allocation),
  **then** a commercial Replenishment Suggestion document is generated deterministically per the policy; the suggestion carries item / warehouse / suggested quantity / suggestion reason.

### 5.7 Low-Stock Detection (US-007)

- **Given** a Reorder Policy and current stock signals derived from upstream Inventory sprint events,
  **when** Reorder Policy evaluation runs,
  **then** a commercial Low-Stock Signal is emitted deterministically when the current stock signal for the item / warehouse falls at or below the reorder point (subject to §5.14 and `R-EV-01`).

### 5.8 Replenishment Approval (US-008)

- **Given** a Replenishment Suggestion whose absolute impact meets or exceeds the threshold configured per Module PRD §10 and surfaced by `SPR-MOD-005-001`,
  **when** the suggestion is submitted,
  **then** the approval policy is evaluated deterministically via `ENG-013` automation against the configured threshold, and the approval outcome is recorded and audited via `ENG-004`.

> **Inventory Valuation & Replenishment SHALL NOT create Purchase Requisitions or Purchase Orders; downstream Purchase originates those on its own authority.**

### 5.9 Tenant scope (US-009, `ADR-011`)

- **Given** any Valuation Snapshot, Revaluation Request, Reorder Policy, or Replenishment Suggestion read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.10 Attachments (US-010)

- **Given** a Valuation Snapshot, Revaluation Request, or Replenishment Suggestion document,
  **when** an attachment is uploaded,
  **then** the attachment is persisted against the attachment surface declared in `SPR-MOD-005-001`.

### 5.11 Notifications (US-011)

- **Given** a valuation or replenishment lifecycle transition,
  **when** the transition completes,
  **then** notification is emitted against the notification surface declared in `SPR-MOD-005-001`.

### 5.12 Authorization (US-001…US-013, `ADR-032`)

- **Given** any commercial valuation or replenishment action,
  **when** it is attempted,
  **then** it is authorized under `ENG-002` per the RBAC + ABAC model authoritatively established by `ADR-032`.

### 5.13 Audit logging (US-015)

- **Given** any commercial valuation or replenishment lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, document identifier, transition type, and timestamp.

### 5.14 Valuation & Replenishment events (US-012)

- **Given** a commercial valuation or replenishment lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the authoritative event catalog. Completion MAY emit repository-defined events that resolve verbatim from [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md); any name not resolvable verbatim SHALL be deferred as `R-EV-*`; no event identifier SHALL be invented. Unresolved names are deferred under `R-EV-01` (§14).

### 5.15 Voucher-creation and posting-effect request contracts (US-013)

- **Given** a commercial Valuation Snapshot or Revaluation Request whose downstream accounting effect is required,
  **when** the request is emitted,
  **then** a voucher-creation contract (via `ENG-015` request path) and/or a posting-effect request (via `ENG-016` request path) is produced for downstream consumption by `MOD002_ACCOUNTING_BASELINE_v1`; Inventory itself SHALL NOT create journals, vouchers, or ledger entries.

### 5.16 Ownership boundary invariants

- Inventory Valuation & Replenishment SHALL NOT perform Accounting posting or create Accounting journals, vouchers, ledgers, or financial revaluation.
- Inventory Valuation & Replenishment SHALL NOT create Purchase Requisitions, Purchase Orders, or Vendor Bills.
- Inventory Valuation & Replenishment SHALL NOT mutate Sales Order, Sales Delivery, or Sales Invoice state.
- Inventory Valuation & Replenishment SHALL NOT drive Warehouse operations directly or drive external WMS execution.
- Inventory Valuation & Replenishment SHALL NOT mutate Manufacturing state.
- Inventory Valuation & Replenishment SHALL NOT redefine Inventory Master ownership established by `SPR-MOD-005-001`, Inventory Receipt ownership established by `SPR-MOD-005-002`, Inventory Issue / Transfer / Reservation ownership established by `SPR-MOD-005-003`, or Inventory Adjustment / Stock Count ownership established by `SPR-MOD-005-004`.
- Commercial Replenishment Approval SHALL NOT be confused with, and SHALL NOT redefine, Purchase approval owned by MOD-004.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-005` — Inventory.
- **Module PRD:** [`docs/20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 Business Scope (Valuation (FIFO / moving average / standard); Reorder and replenishment; submodule Valuation), §7 Business Rules (Physical count differences post to the configured variance account — valuation side; commercial view), §8 Integration Points (published-event surfaces for valuation-change and low-stock, subject to verbatim resolution per §5.14 / §11), §10 Configuration (Valuation method per company; Reorder policies), §12 ERP Core Engine Consumption, §13 Dependencies. See §3.

---

## 7. Dependencies

- **Parent:** `MOD-005` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — Accounting ownership boundaries. Inventory Valuation & Replenishment MUST NOT redefine Accounting ownership.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Sales ownership boundaries. Inventory Valuation & Replenishment MUST NOT redefine Sales ownership.
  - [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (frozen) — Purchase ownership boundaries. Inventory Valuation & Replenishment MUST NOT redefine Purchase ownership.
- **Upstream sprint dependencies:**
  - [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md) — Item master, warehouse master, storage-location master, UoM master, inventory configuration namespace, inventory-document numbering series, attachment surface, notification surface, adjustment-threshold configuration.
  - [`SPR-MOD-005-002`](./SPR-MOD-005-002-inventory-receipts-putaway.md) — Commercial Inventory Receipt substrate; Stock Receipt events consumed by valuation recalculation.
  - [`SPR-MOD-005-003`](./SPR-MOD-005-003-inventory-issues-transfers-reservations.md) — Commercial Inventory Issue and Inventory Transfer substrate; Stock Issue and Stock Transfer events consumed by valuation recalculation.
  - [`SPR-MOD-005-004`](./SPR-MOD-005-004-inventory-adjustments-stock-counting.md) — Commercial Inventory Adjustment substrate; Stock Adjustment events consumed by valuation recalculation.
- **Downstream sprints:** `SPR-MOD-005-006` (Inventory Analytics & Operational Controls) — per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).

Warehouse ownership, Accounting ownership, Sales ownership, Purchase ownership, and Manufacturing ownership are consumed and SHALL NOT be redefined by this Sprint PRD. Module identifiers SHALL resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md). Manufacturing, Warehouse, Purchase, Sales, and Accounting capabilities SHALL be consumed through approved repository contracts and SHALL NOT redefine ownership established by their originating modules.

> **Manufacturing SHALL be treated as the originating supplier of production demand signal capabilities.**
>
> **Warehouse SHALL be treated as the originating supplier of warehouse execution capabilities.**
>
> **Purchase SHALL be treated as the originating supplier of Purchase Requisition, Purchase Order, and Vendor Billing capabilities.**
>
> **Sales SHALL be treated as the originating supplier of Sales Order, Sales Delivery, and Sales Invoice capabilities.**
>
> **Accounting SHALL be treated as the originating supplier of accounting capabilities.**
>
> **Sprint 5 SHALL consume Manufacturing, Warehouse, Purchase, Sales, and Accounting capabilities through approved repository contracts and SHALL NOT redefine or transfer ownership.**

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see §1.1). Verbatim IDs SHALL resolve verbatim from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 5 allocation defined in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) § SPR-MOD-005-005 "Engines consumed"; no placeholder, deprecated, undefined, duplicate, or additional identifiers.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every commercial valuation and replenishment action per `ADR-032` RBAC + ABAC. |
| `ENG-004` Audit | Records every commercial valuation and replenishment lifecycle transition per `ADR-014`. |
| `ENG-005` Configuration | Resolves the commercial Valuation Method per company under the tenant → company → context hierarchy and surfaces Reorder Policy configuration defaults consumed by Reorder Policy evaluation. |
| `ENG-012` Rules | Evaluates commercial valuation-recalculation rules, Reorder Policy evaluation rules, and Low-Stock detection rules. |
| `ENG-013` Automation | Drives automated valuation recalculation on stock events, Reorder Policy evaluation, Replenishment Suggestion generation, Low-Stock Signal emission, and commercial approval evaluation against configured threshold policy. |
| `ENG-015` Voucher | Consumed as the **request** contract for downstream voucher creation by Accounting; Inventory does not itself create vouchers. |
| `ENG-016` Posting | Consumed as the **request** contract for downstream posting effects by Accounting; Inventory does not itself create ledger entries. |
| `ENG-024` Eventing | Publishes commercial Valuation and Replenishment events with the contracts declared in §11. |

Inventory business semantics of the commercial Valuation and Replenishment lifecycles (Valuation Method Configuration, Valuation Recalculation, Valuation Snapshot, Revaluation Request, Reorder Policy, Replenishment Suggestion, Low-Stock Signal, Replenishment Approval) are owned by this module and are not delegated to any engine.

Identity (`ENG-001`), Permission Management (`ENG-003`), Localization (`ENG-006`), Document (`ENG-007`), Attachment (`ENG-008`), Workflow (`ENG-010`), Approval (`ENG-011`), Numbering (`ENG-017`), Search (`ENG-020`), Reporting (`ENG-021`), Notification (`ENG-025`), Import (`ENG-026`), and Export (`ENG-027`) are NOT invoked here per the Sprint 5 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) § SPR-MOD-005-005 "Engines consumed". Where an acceptance criterion in this sprint references an attachment or notification surface, that surface is consumed via the surface **already registered** in `SPR-MOD-005-001` (which owns `ENG-008` and `ENG-025` registration) and is not re-consumed as an engine identifier here. Numbering (`ENG-017`) consumption is likewise inherited from `SPR-MOD-005-001` where required.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Identifiers resolve verbatim from [`ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md).

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every commercial valuation and replenishment read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration on every valuation and replenishment lifecycle transition. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every commercial valuation and replenishment action via `ENG-002`. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Valuation Method | MOD-005 (this sprint) | Authoritative commercial Valuation Method classification (FIFO / Moving Average / Standard) resolved per company via `ENG-005`. |
| Valuation Policy | MOD-005 (this sprint) | Authoritative commercial Valuation Policy record per company; carries Valuation Method reference and policy status. |
| Cost Layer | MOD-005 (this sprint) | Commercial state supporting FIFO / Moving Average / Standard classification; carries layer identity, item reference, warehouse reference, quantity, and commercial unit value derived from stock events. |
| Valuation Snapshot | MOD-005 (this sprint) | Authoritative commercial Valuation Snapshot document per item / warehouse / company at a stable point in time. |
| Revaluation Request | MOD-005 (this sprint) | Authoritative commercial Revaluation Request document linked to a source Valuation Snapshot. |
| Reorder Policy | MOD-005 (this sprint) | Authoritative commercial Reorder Policy per item / warehouse under a tenant/company scope; carries reorder point, min / max, and EOQ classification. |
| Replenishment Suggestion | MOD-005 (this sprint) | Authoritative commercial Replenishment Suggestion document generated from Reorder Policy evaluation. |
| Low-Stock Signal | MOD-005 (this sprint) | Authoritative commercial Low-Stock state emitted when current stock signal for an item / warehouse falls at or below the reorder point. |
| Replenishment Approval | MOD-005 (this sprint) | Commercial approval state on a Replenishment Suggestion driven by `ENG-013` automation per threshold configuration surfaced by `SPR-MOD-005-001`. |
| Replenishment Status | MOD-005 (this sprint) | Deterministic lifecycle state of a Replenishment Suggestion (`Draft → Evaluated → Pending Approval → Approved → Handed Off → Closed`; `Rejected` and `Cancelled` terminal). |
| Valuation & Replenishment Attachment | MOD-005 (this sprint) | Attachment record against Valuation Snapshot, Revaluation Request, or Replenishment Suggestion on the surface declared in `SPR-MOD-005-001`. |
| Valuation & Replenishment Notification | MOD-005 (this sprint) | Notification record against valuation or replenishment lifecycle transitions on the surface declared in `SPR-MOD-005-001`. |

### 10.2 Relationships

- A **Valuation Policy** belongs to exactly one **company** (owned by MOD-001) and references exactly one **Valuation Method**.
- A **Valuation Snapshot** belongs to exactly one **company**, references exactly one **item** and exactly one **warehouse** (all owned by `SPR-MOD-005-001`), and is stable at its point in time.
- A **Cost Layer** belongs to exactly one **item** and exactly one **warehouse** and one **company**, and is affected by stock events published by upstream Inventory sprints.
- A **Revaluation Request** belongs to exactly one **Valuation Snapshot**.
- A **Reorder Policy** belongs to exactly one **item** and exactly one **warehouse** under a tenant/company scope.
- A **Replenishment Suggestion** belongs to exactly one **Reorder Policy** at its point of evaluation and references exactly one **item** and exactly one **warehouse**.
- A **Low-Stock Signal** belongs to exactly one **item / warehouse** pair evaluated against a **Reorder Policy**.
- A **Replenishment Approval** state belongs to exactly one **Replenishment Suggestion**.
- A **Valuation & Replenishment Attachment** belongs to exactly one **Valuation Snapshot**, **Revaluation Request**, or **Replenishment Suggestion**.
- A **Valuation & Replenishment Notification** belongs to exactly one valuation or replenishment lifecycle transition.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-005` per the Inventory Valuation & Replenishment Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Item master, warehouse master, storage-location master, and UoM master remain owned by `SPR-MOD-005-001` and are consumed read-only.
- Inventory Receipt, Inventory Issue, Inventory Transfer, Inventory Adjustment, Physical Count, Cycle Count, Blind Count, Recount, Inventory Variance, and Reconciliation Request remain owned by `SPR-MOD-005-002` … `SPR-MOD-005-004` and are consumed as event substrate.
- Accounting entities (voucher, journal, ledger, valuation ledger, receivable, payable) remain owned by MOD-002 Accounting and are not represented as Inventory-owned entities.
- Purchase entities (Purchase Requisition, Purchase Order, Vendor Bill) remain owned by MOD-004 Purchase and are not represented as Inventory-owned entities.
- Sales entities (Sales Order, Sales Delivery, Sales Invoice) remain owned by MOD-003 Sales and are not represented as Inventory-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Only event names present verbatim in the authoritative event catalog are used. Any name not resolvable verbatim SHALL be deferred as `R-EV-*`; **no event identifier SHALL be invented**. The authoritative event catalog is currently a stub (all sections marked *"content to be filled in a later pass"*); consequently, every commercial Valuation and Replenishment event surface enumerated below is **deferred** as `R-EV-01` in §14 pending event-catalog registration. The Event Catalog is **not** modified by this sprint.

| Event Surface (deferred to catalog resolution under `R-EV-01`) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| Valuation Snapshot lifecycle surface (create / recalculate / close) | MOD-005 | SPR-MOD-005-005 | MOD-005 (self), MOD-002 (Accounting via voucher-creation request), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Revaluation Request lifecycle surface (emit / linked / settled / cancelled) | MOD-005 | SPR-MOD-005-005 | MOD-005 (self), MOD-002 (Accounting via voucher-creation request), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Valuation-change surface (per Module PRD §8 published-event row) | MOD-005 | SPR-MOD-005-005 | MOD-005 (self), MOD-002 (Accounting), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Reorder Policy lifecycle surface (create / update / close) | MOD-005 | SPR-MOD-005-005 | MOD-005 (self), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Replenishment Suggestion lifecycle surface (generate / submit / approve / reject / hand-off / close / cancel) | MOD-005 | SPR-MOD-005-005 | MOD-005 (self), MOD-004 (Purchase via replenishment handoff), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Low-Stock surface (per Module PRD §8 published-event row) | MOD-005 | SPR-MOD-005-005 | MOD-005 (self), MOD-004 (Purchase), MOD-017 (Analytics) | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14 (see `R-EV-01`). Every published/consumed event name in this Sprint PRD SHALL resolve verbatim in `event-catalog.md`; where verbatim resolution is not possible, the name is deferred under `R-EV-01`.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Commercial Valuation and Replenishment event surfaces are registered in the event catalog with their contracts and are emitted on the corresponding transitions (or, if the catalog remains a stub, `R-EV-01` remains deferred with no active blocker for downstream Sprint 6 authoring).
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every commercial valuation and replenishment read and write.
- [ ] Every commercial valuation and replenishment lifecycle transition produces an audit record via `ENG-004`.
- [ ] Valuation Method resolves per company via `ENG-005` and is consumed deterministically by Valuation Recalculation.
- [ ] Reorder Policy evaluation is driven by `ENG-013` automation and produces Replenishment Suggestion and Low-Stock Signal deterministically.
- [ ] Replenishment Approval is enforced via `ENG-013` automation against threshold configuration surfaced by `SPR-MOD-005-001`.
- [ ] Voucher-creation and posting-effect request contracts are produced via `ENG-015` and `ENG-016` request paths for downstream `MOD002_ACCOUNTING_BASELINE_v1` consumption; Inventory itself creates no journals, vouchers, or ledger entries.
- [ ] Attachments and notifications are consumed against the surfaces declared in `SPR-MOD-005-001` (attachment via `ENG-008` registered in Sprint 1; notification via `ENG-025` registered in Sprint 1) without re-registering the engines here.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-005_SPRINT_PLAN.md` § SPR-MOD-005-005 "Sprint Exit Criteria":

- Valuation method resolves per company via `ENG-005` and recalculates on stock receipts, issues, transfers, and adjustments.
- Reorder policies and replenishment suggestions are maintained under the tenant/company hierarchy.
- `InventoryValuationChanged` and `InventoryLowStock` events are published via `ENG-024`.
- Voucher-creation contracts are produced for downstream `MOD002_ACCOUNTING_BASELINE_v1` consumption; Inventory does not create accounting journals or ledger entries.

If any exit criterion is not met, the sprint MUST NOT move to `Done`. Event name resolution against the authoritative event catalog is governed by §11 and §5.14; unresolved names are deferred under `R-EV-01`.

---

## 14. Risk Register

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open`, `Mitigated`, `Accepted`, `Deferred`, `Closed`.

- **Risk ID:** R-01
  - **Description:** Accounting dependency. Inventory Valuation & Replenishment must not create journals, vouchers, valuation entries, ledger entries, or perform financial reconciliation.
  - **Impact:** Silent absorption of Accounting semantics into Inventory would violate `MOD002_ACCOUNTING_BASELINE_v1`.
  - **Mitigation:** Enforce the Accounting Boundary (§1.1.3) at sprint gates; downstream accounting effects delivered via voucher-creation and posting-effect request contracts consumed by Accounting.
  - **Status:** Accepted

- **Risk ID:** R-02
  - **Description:** Purchase dependency (requisition handoff). Replenishment Suggestions must not be materialized as Purchase Requisitions or Purchase Orders by Inventory.
  - **Impact:** Silent absorption of Purchase semantics into Inventory would violate `MOD004_PURCHASE_BASELINE_v1`.
  - **Mitigation:** Enforce the Purchase Consumption Boundary (§1.1.4) at sprint gates; expose Replenishment Suggestion via events and read APIs only.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Sales dependency (demand signal). Sales demand signals are consumed read-only; Inventory must not mutate Sales Order, Sales Delivery, or Sales Invoice state.
  - **Impact:** Cross-writes into Sales would violate `MOD003_SALES_BASELINE_v1`.
  - **Mitigation:** Enforce the Sales Consumption Boundary (§1.1.5) at sprint gates; consume Sales demand signals via approved read-only repository contracts.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Warehouse dependency. Warehouse execution is consumed only through stock events published by upstream Inventory sprints; Inventory Valuation & Replenishment must not drive physical warehouse operations.
  - **Impact:** Silent absorption of Warehouse execution into Inventory would violate the Warehouse Consumption Boundary (§1.1.6).
  - **Mitigation:** Enforce the Warehouse Consumption Boundary at sprint gates; consume only via upstream Inventory sprint stock-event surfaces.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Manufacturing dependency. Production demand signals are consumed read-only; Inventory must not mutate Manufacturing state.
  - **Impact:** Cross-writes into Manufacturing would violate the Manufacturing Consumption Boundary (§1.1.7) and Manufacturing ownership.
  - **Mitigation:** Enforce the Manufacturing Consumption Boundary at sprint gates; consume Manufacturing demand signals via approved read-only repository contracts; Manufacturing identifier resolves verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md).
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Valuation policy governance. Valuation Method drift between company scopes or between the Inventory management view and the Accounting financial view could produce inconsistent commercial and accounting valuations.
  - **Impact:** Divergence in commercial valuation would corrupt the management view and downstream analytics.
  - **Mitigation:** Resolve Valuation Method exclusively via `ENG-005` per company; audit method resolution via `ENG-004`; keep Inventory-side valuation clearly labelled as the commercial management view.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Replenishment approval dependency. Approval thresholds are declared in Module PRD §10 and surfaced by `SPR-MOD-005-001`; drift in threshold configuration would silently bypass commercial approval.
  - **Impact:** High-impact replenishment could be handed off to Purchase without the intended governance.
  - **Mitigation:** Route every Replenishment Suggestion through `ENG-013` automation against configured threshold policy; treat threshold-policy drift as a configuration defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Numbering dependency. Where commercial Valuation & Replenishment documents require numbering, series and engine consumption is inherited from `SPR-MOD-005-001`. The numbering engine (`ENG-017`) is not in the Sprint 5 engine allocation per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) § SPR-MOD-005-005 "Engines consumed" and is therefore not re-consumed here.
  - **Impact:** Divergence from the registered numbering series would break document-number stability across the Inventory module.
  - **Mitigation:** Consume series registered in `SPR-MOD-005-001`; do not register new series here.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Event Catalog gaps. The authoritative event catalog (`docs/02-architecture/event-catalog.md`) is currently a stub; every commercial Valuation and Replenishment event surface enumerated in §11 is a deferred event-catalog registration item. Module PRD §8 references `InventoryValuationChanged` and `InventoryLowStock`; these names are used only where they resolve verbatim in the authoritative event catalog. No event identifiers are invented.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register commercial Valuation and Replenishment events via the event catalog governance process before downstream Inventory sprints consume them.
  - **Status:** Deferred

- **Risk ID:** R-10
  - **Description:** Cross-module contracts. Voucher-creation contracts consumed by Accounting via `SPR-MOD-005-005` and replenishment handoff contracts consumed by Purchase must be exposed exclusively via events and read APIs.
  - **Impact:** Ambiguous consumption contracts would encourage parallel valuation or replenishment lifecycles in consuming modules.
  - **Mitigation:** Expose Valuation and Replenishment lifecycles exclusively via events and read APIs; enforce consumption boundaries at sprint gates.
  - **Status:** Open

- **Risk ID:** R-11
  - **Description:** Authorization dependency. All commercial valuation and replenishment actions must be authorized under `ENG-002` per `ADR-032`. All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** Any bypass of `ENG-002`, or degradation of ADR acceptance status, would invalidate this sprint's contract.
  - **Mitigation:** Route every commercial valuation and replenishment action through `ENG-002`; re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Valuation Method resolution via `ENG-005` per company; commercial valuation recalculation determinism per method (FIFO / Moving Average / Standard classification); Reorder Policy evaluation rules; Low-Stock Signal emission rules; commercial Replenishment Approval threshold evaluation; Replenishment Suggestion lifecycle transitions.
- **Integration** — audit emission via `ENG-004`; rule evaluation via `ENG-012`; automation via `ENG-013` (stock-event-driven recalculation, reorder policy evaluation, low-stock detection, approval evaluation); voucher-creation request contract via `ENG-015`; posting-effect request contract via `ENG-016`; event publication via `ENG-024`; authorization via `ENG-002`.
- **Contract** — commercial Valuation and Replenishment event contracts against the authoritative event catalog (deferred under `R-EV-01`); voucher-creation contract handoff to Accounting; replenishment handoff contract to Purchase.
- **End-to-end (smoke)** — Stock event (Receipt / Issue / Transfer / Adjustment) → Valuation Recalculation → Valuation Snapshot → Revaluation Request → voucher-creation request; Reorder Policy → Replenishment Suggestion (Draft → Evaluated → Pending Approval → Approved → Handed Off → Closed) → Purchase handoff surface, under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture used to prove tenancy and ownership invariants across companies, a fixture emulating each of the four upstream stock-event surfaces (Stock Receipt, Stock Issue, Stock Transfer, Stock Adjustment) as inputs to Valuation Recalculation, and a fixture emulating a Reorder Policy evaluation cycle that produces a Replenishment Suggestion and a Low-Stock Signal.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the commercial Valuation Snapshot as an immutable point-in-time artifact so audit emission (§5.13) and event publication (§5.14) are trivially satisfiable per snapshot.
- Consider modeling the Cost Layer as a small append-mostly structure so FIFO / Moving Average / Standard classification is observable without conflating commercial and accounting valuation.
- Consider modeling the Replenishment Suggestion lifecycle (`Draft → Evaluated → Pending Approval → Approved → Handed Off → Closed`) as an explicit state machine so approval routing via `ENG-013` and Purchase handoff observation via events remain observable.
- Consider surfacing the voucher-creation and posting-effect request contracts as separate outbound envelopes so the Inventory / Accounting boundary is unambiguous.
- Consider suppressing any Inventory-side write into Purchase, Sales, or Accounting entities at the automation boundary so the ownership boundaries are enforced structurally rather than only by convention.
- Consider surfacing the Inventory Valuation & Replenishment Ownership Convention as a hard boundary in downstream module gates so Analytics consumes events rather than writing commercial valuation or replenishment state.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-005-005`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial Inventory Valuation and Replenishment surface (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix (forward and reverse); every feature is tied to a `MOD-005` MODULE_PRD reference. No orphan requirements. Bidirectional mapping preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Inventory Valuation & Replenishment Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here. Engine list exactly matches `MOD-005_SPRINT_PLAN.md` § SPR-MOD-005-005 "Engines consumed".
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists Item Master, Purchase, Sales, Manufacturing, Warehouse, Accounting, Journal Posting, GL, Financial Reconciliation, Payments, Lot / Serial, Analytics, Reporting, Dashboards, Inventory Receipt & Putaway, Inventory Issues / Transfers / Reservations, and Inventory Adjustments & Stock Counting, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes and includes explicit ownership-boundary invariants (§5.16) and the verbatim boundary statements. Event-name policy in §5.14 forbids invented identifiers.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-005-006`) begin immediately after this one completes?**
   Yes. `SPR-MOD-005-006 Inventory Analytics & Controls` is the immediate successor per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) and depends on the commercial valuation and replenishment substrate delivered here.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-005-001-inventory-foundation.md`](./SPR-MOD-005-001-inventory-foundation.md), [`./SPR-MOD-005-002-inventory-receipts-putaway.md`](./SPR-MOD-005-002-inventory-receipts-putaway.md), [`./SPR-MOD-005-003-inventory-issues-transfers-reservations.md`](./SPR-MOD-005-003-inventory-issues-transfers-reservations.md), [`./SPR-MOD-005-004-inventory-adjustments-stock-counting.md`](./SPR-MOD-005-004-inventory-adjustments-stock-counting.md)
- Platform Baseline (frozen) — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Accounting Baseline (frozen) — [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Sales Baseline (frozen) — [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- Purchase Baseline (frozen) — [`../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
