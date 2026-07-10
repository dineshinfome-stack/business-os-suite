---
title: "SPR-MOD-005-002 — Inventory Receipts & Putaway"
summary: "Sprint PRD for the commercial Inventory Receipt and Putaway lifecycle of MOD-005 Inventory: inventory receipt creation, receipt validation, Purchase Goods Receipt consumption, warehouse confirmation consumption, putaway request, bin assignment request, partial and complete receipt, receipt status, receipt numbering, attachments, notifications, and inventory receipt events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Inventory"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-005-002"
parent_module: "MOD-005"
parent_sprint_plan: "MOD-005_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "8.8.2"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-010", "ENG-012", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "inventory", "receipts", "putaway", "mod-005"]
document_type: "Sprint PRD"
---

# SPR-MOD-005-002 — Inventory Receipts & Putaway

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-005 Inventory** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-005-002` (permanent) |
| Parent Module | `MOD-005` — Inventory |
| Parent Sprint Plan | [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md), [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (all frozen) |
| Upstream Sprint | [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md) |
| Downstream Sprints | `SPR-MOD-005-003` … `SPR-MOD-005-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial Inventory Receipt and Putaway lifecycle** for BusinessOS: the Inventory Receipt document lifecycle, receipt validation, consumption of Purchase Goods Receipts as originating supplier evidence, consumption of Warehouse confirmation, putaway request, bin assignment request, partial and complete receipt handling, receipt status, receipt numbering, attachments, notifications, and inventory receipt events. The commercial Inventory Receipt is the substrate consumed by downstream Inventory sprints — issues and transfers, adjustments and physical verification, valuation and replenishment, analytics — for authoritative inbound activity.

> **Inventory Receipt Ownership Convention.** The Inventory module owns the business semantics of the commercial Inventory Receipt document, receipt validation, receipt status, and putaway/bin-assignment requests. ERP Core Engines provide shared infrastructure (authorization, audit, document, attachment, workflow, rules, numbering, eventing, notification) but **MUST NOT** redefine inventory receipt business rules. Downstream modules consume commercial Inventory Receipt events and read APIs rather than introducing independent receipt lifecycles. This complements — and does not redefine — the governance conventions established by `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, and `SPR-MOD-005-001`.

#### 1.1.1 Inventory Receipt Ownership

Inventory owns the commercial Inventory Receipt lifecycle (Inventory Receipt document, Inventory Receipt Line, Receipt Status, Putaway Request, Bin Assignment Request, Receipt Attachment, Receipt Notification). No other module MAY create, edit, close, or independently maintain a parallel commercial Inventory Receipt lifecycle. Downstream modules consume Inventory Receipt events and read APIs; they MUST NOT redefine the commercial receipt entity, its validation, or its status lifecycle.

#### 1.1.2 Purchase Consumption Boundary

Purchase (`MOD-004`) owns the supplier master, the purchasing organization, purchase orders, and Purchase Goods Receipts per `MOD004_PURCHASE_BASELINE_v1`. `SPR-MOD-004-003` (Goods Receipt & Inspection) SHALL remain the originating supplier of Goods Receipt capabilities. Inventory Receipts & Putaway SHALL consume approved Purchase repository contracts (Goods Receipt evidence, GR line references, inspection outcomes) and SHALL NOT redefine Purchase ownership. No purchase document lifecycle, no supplier master, and no procurement configuration is created or modified in this sprint.

#### 1.1.3 Warehouse Consumption Boundary

Warehouse SHALL remain authoritative for warehouse execution (physical WMS execution, external 3PL integration, physical putaway operations, physical bin operations). Inventory Receipts & Putaway MAY request putaway confirmation and MAY consume warehouse confirmation via approved repository contracts. Inventory Receipts & Putaway SHALL NOT perform Warehouse operations directly, SHALL NOT redefine warehouse ownership, and SHALL NOT drive external WMS execution.

#### 1.1.4 Bin Assignment Boundary

Inventory Receipts & Putaway consumes approved Warehouse contracts for **Bin Assignment** and **Storage Confirmation**. Inventory Receipts & Putaway SHALL NOT own Warehouse structure, warehouse hierarchy, or bin operational semantics. Bin master data itself remains under Inventory Foundation (`SPR-MOD-005-001`) and is consumed here read-only.

#### 1.1.5 Accounting Boundary

Accounting (`MOD-002`) owns accounting vouchers, journal posting, ledger posting, taxation, financial reporting, valuation ledger, and payables per `MOD002_ACCOUNTING_BASELINE_v1`. Inventory Receipts & Putaway SHALL NOT create journals, SHALL NOT create vouchers, SHALL NOT perform valuation, SHALL NOT update ledgers, and SHALL NOT create payables. Any accounting effect of a completed commercial receipt is delivered downstream by `SPR-MOD-005-005` via voucher-creation contracts consumed by Accounting.

#### 1.1.6 Inventory Transaction Boundary

Commercial receipt completion SHALL request downstream inventory transaction processing (stock balance updates, inventory movement records) through approved repository contracts. Receipt completion SHALL NOT redefine transaction ownership, SHALL NOT bypass configured negative-stock policy defaults registered in `SPR-MOD-005-001`, and SHALL NOT collapse commercial and transactional concerns into a single write path.

#### 1.1.7 Putaway Boundary

Putaway in this sprint SHALL request Warehouse processing only. Warehouse owns physical execution. Putaway Request is a commercial contract emitted by Inventory Receipts & Putaway; the underlying physical putaway is performed by Warehouse and confirmation is consumed back through approved repository contracts.

#### 1.1.8 Governance Complement

This Sprint complements — and does not redefine — `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, and [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md). Ownership established by those baselines and by Inventory Foundation is consumed and preserved; it is not overridden here. Ownership boundaries SHALL NOT be redefined in downstream Inventory Sprint PRDs.

### 1.2 In Scope

Commercial Inventory Receipt and Putaway lifecycle only:

- Inventory Receipt creation under a tenant/company.
- Receipt validation (referential integrity against Item master, warehouse, storage location; tenancy; UoM consistency; quantity invariants).
- Purchase Goods Receipt consumption — read-only intake of approved Purchase Goods Receipt evidence originating from `SPR-MOD-004-003`.
- Receipt confirmation lifecycle transitions.
- Warehouse confirmation consumption — read-only intake of approved warehouse confirmation contracts.
- Putaway Request emission from a commercial Inventory Receipt.
- Bin Assignment Request emission to Warehouse.
- Storage location assignment on a commercial Inventory Receipt Line.
- Partial receipt handling (line-level partial receipt on the same Inventory Receipt).
- Complete receipt handling (line-level completion, receipt-level completion).
- Receipt status lifecycle (`Draft → Validated → Confirmed → Partially Received → Received → Closed`; `Cancelled` as a terminal negative transition).
- Receipt numbering via the numbering series registered in `SPR-MOD-005-001`.
- Attachments on Inventory Receipt via `ENG-008` (surface declared in `SPR-MOD-005-001`).
- Notifications on Inventory Receipt lifecycle transitions via `ENG-025` (surface declared in `SPR-MOD-005-001`).
- Inventory receipt events emitted via `ENG-024`.

### 1.3 Out of Scope

Reserved for other sprints, upstream baselines, or explicit non-redefinition:

- Purchase ownership, Purchase document lifecycles, and supplier master — owned by MOD-004 Purchase; consumed via `MOD004_PURCHASE_BASELINE_v1`.
- Goods Receipt ownership — owned by `SPR-MOD-004-003`; consumed as originating supplier evidence.
- Warehouse ownership (physical WMS, external 3PL, warehouse operational systems) — external ownership; consumed via approved warehouse-handover contracts.
- Inventory Master data (item, item category, item group, UoM, warehouse master, storage-location master) — owned by `SPR-MOD-005-001`.
- Stock Issue and internal or branch Transfer — `SPR-MOD-005-003`.
- Reservations, allocation, availability — `SPR-MOD-005-003`.
- Stock Adjustments — `SPR-MOD-005-004`.
- Stock Counting (cycle count, physical count, variance recording) — `SPR-MOD-005-004`.
- Lot Control and Serial Control — not in the approved MOD-005 Module PRD; explicitly not authored here.
- Accounting vouchers, journal posting, ledger posting, taxation, and payables — owned by MOD-002 Accounting.
- Inventory Valuation (FIFO / moving average / standard) — `SPR-MOD-005-005`.
- Costing — deferred to `SPR-MOD-005-005` (valuation) and MOD-002 Accounting (accounting valuation ledger).
- Financial Posting — owned by MOD-002 Accounting.
- Dashboards, KPIs, and Analytics — `SPR-MOD-005-006` and MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-005-002`, the following will exist:

- **Inventory Receipts.** Commercial Inventory Receipt documents can be created, edited, validated, confirmed, partially received, fully received, closed, and cancelled under a tenant/company.
- **Receipt Validation.** Receipt validation rules (referential integrity against Item master, warehouse, storage location; tenancy; UoM consistency; quantity invariants) are enforced deterministically via `ENG-012`.
- **Receipt Confirmation.** Receipt confirmation transitions are driven through `ENG-010` and produce audit records via `ENG-004`.
- **Putaway Requests.** Putaway Requests can be emitted from a commercial Inventory Receipt and consumed by Warehouse via approved repository contracts.
- **Bin Assignment Requests.** Bin Assignment Requests can be emitted to Warehouse; Warehouse confirmation is consumed read-only.
- **Receipt Numbering.** Commercial Inventory Receipt numbering resolves via `ENG-017` against the numbering series registered in `SPR-MOD-005-001`.
- **Receipt Status.** Receipt status lifecycle (§1.2) is enforced deterministically.
- **Attachments.** Attachment surface declared in `SPR-MOD-005-001` is consumed via `ENG-008`.
- **Notifications.** Notification surface declared in `SPR-MOD-005-001` is consumed via `ENG-025`.
- **Inventory Receipt Events.** Event contracts for the commercial Inventory Receipt lifecycle (see §11) are emitted via `ENG-024`, subject to authoritative event-catalog resolution (see §11 and `R-EV-01`).
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-005-002`.
- **Forward references.** Downstream sprints `SPR-MOD-005-003`, `SPR-MOD-005-004`, `SPR-MOD-005-005`, `SPR-MOD-005-006` consume the commercial receipt and putaway substrate established here.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Bidirectional Traceability

Every Module capability SHALL map to exactly one originating Sprint. Every Sprint capability SHALL trace back to one approved Module capability. No orphan Sprint capability. No duplicate originating allocation. No unallocated Module capability.

### 3.1 Forward Map — Module PRD Capability → Sprint 2 Deliverable

| MOD-005 MODULE_PRD Reference | Delivered By |
| --- | --- |
| §2 Business Scope — Stock movements and adjustments (inbound half; submodule Movements — inbound half) | Inventory Receipts (creation, validation, confirmation, partial / complete, status, numbering) |
| §4 Business Processes — Inward-to-storage | Inventory Receipt lifecycle + Putaway Request + Bin Assignment Request |
| §6 Transactions — Stock Receipt | Inventory Receipt document, Inventory Receipt Line, Receipt Status |
| §6 Transactions — Approvals (workflow gating on receipt confirmation) | Receipt confirmation via `ENG-010`; multi-step approvals (if configured) via engines reserved by upstream and downstream sprints |
| §6 Transactions — Numbering | Receipt numbering via `ENG-017` against series registered in `SPR-MOD-005-001` |
| §6 Transactions — Audit | Audit of every receipt lifecycle transition via `ENG-004` |
| §8 Integration Points — `StockReceived` published; `GoodsReceived` consumed | Inventory Receipt Events (§11) + Purchase Goods Receipt consumption |
| §10 Configuration — Negative-stock policy defaults (consumed) | Receipt validation consumes negative-stock defaults registered in `SPR-MOD-005-001` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

### 3.2 Reverse Map — Sprint 2 Capability → Module PRD Reference

| Sprint 2 Capability | Module PRD Reference |
| --- | --- |
| Inventory Receipt creation | §2 (Stock movements — inbound); §6 (Stock Receipt) |
| Receipt validation | §6 (Stock Receipt); §7 (Business rules — negative stock policy consumption) |
| Purchase Goods Receipt consumption | §8 (`GoodsReceived` — consumed); §13 (Depends On Modules: MOD-004 Purchase via baseline) |
| Receipt confirmation | §4 (Inward-to-storage); §6 (Stock Receipt lifecycle) |
| Warehouse confirmation consumption | §4 (Inward-to-storage); §13 (Shared master data / external systems — 3PL / WMS) |
| Putaway Request | §2 (Warehouse and bin management — putaway side, inbound movement); §4 (Inward-to-storage) |
| Bin Assignment Request | §2 (Warehouse and bin management — bin operations); §4 (Inward-to-storage) |
| Storage location assignment on receipt line | §2 (Warehouse and bin management); §5 (Bin/Location) |
| Partial receipt | §6 (Stock Receipt lifecycle) |
| Complete receipt | §6 (Stock Receipt lifecycle) |
| Receipt status | §6 (Stock Receipt lifecycle) |
| Receipt numbering | §6 (Numbering); §10 (Configuration — Numbering series) |
| Attachments | §12 (Optional engines — Attachment) |
| Notifications | §12 (Optional engines — Notification) |
| Inventory Receipt Events | §8 (Integration Points — Events Published: `StockReceived`) |

Sprint scope is bounded strictly by these references. **No capability introduced in this Sprint PRD is outside the approved Inventory Module PRD, and no Sprint 2 capability approved in `MOD-005_SPRINT_PLAN.md` is orphaned from this Sprint PRD.** Unique originating allocation is preserved.

---

## 4. User Stories

Every user story SHALL trace to exactly one Sprint Deliverable (§2).

- **US-001.** *As an inventory executive, I want a single authoritative Inventory Receipt document across the enterprise, so that inbound activity is recorded once and consumed by every downstream Inventory sprint.*  — Deliverable: Inventory Receipts.
- **US-002.** *As a receiving officer, I want to create and validate an Inventory Receipt against Item master, warehouse, and storage-location master, so that only referentially consistent receipts enter the lifecycle.*  — Deliverables: Inventory Receipts, Receipt Validation.
- **US-003.** *As a warehouse coordinator, I want the Inventory Receipt to consume approved Purchase Goods Receipt evidence originating from `SPR-MOD-004-003`, so that supplier evidence is preserved without redefining Purchase ownership.*  — Deliverable: Receipt Validation (Purchase GR consumption path).
- **US-004.** *As a warehouse coordinator, I want to emit a Putaway Request from a confirmed Inventory Receipt so that Warehouse can execute putaway without Inventory redefining warehouse execution.*  — Deliverable: Putaway Requests.
- **US-005.** *As a receiving officer, I want to emit a Bin Assignment Request and consume the Warehouse confirmation read-only, so that storage location assignment on a receipt line remains deterministic and audited.*  — Deliverable: Bin Assignment Requests.
- **US-006.** *As an inventory controller, I want partial and complete receipt handling at the line level and the receipt level, so that mixed and staged deliveries are recorded truthfully.*  — Deliverable: Inventory Receipts (partial/complete handling).
- **US-007.** *As a branch manager, I want commercial Inventory Receipts to be scoped under the tenant/company/branch hierarchy established by the Platform baseline, so that receipts remain isolated per tenant per `ADR-011`.*  — Deliverable: Inventory Receipts.
- **US-008.** *As an inventory administrator, I want commercial Inventory Receipt numbers to be generated deterministically from the numbering series registered in `SPR-MOD-005-001`, so that document numbers are stable and non-colliding within a company.*  — Deliverable: Receipt Numbering.
- **US-009.** *As a purchase liaison, I want Inventory Receipt events published so that downstream systems (Analytics, valuation) can react to receipts without Inventory publishing directly to consuming modules.*  — Deliverable: Inventory Receipt Events.
- **US-010.** *As a system administrator, I want every commercial Inventory Receipt lifecycle transition to be audited via `ENG-004`, so that the receipt history can be reconstructed from an authoritative log.*  — Deliverable: Receipt Confirmation (audit thread across all deliverables).

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Inventory Receipt creation (US-001, US-002)

- **Given** a valid Inventory Receipt creation request under a tenant/company,
  **when** a receiving officer submits it,
  **then** an Inventory Receipt is persisted in `Draft` with a stable identifier scoped to the company.

### 5.2 Receipt validation (US-002)

- **Given** an Inventory Receipt referencing an item, warehouse, and storage location,
  **when** validation runs,
  **then** referential integrity against the Item master, warehouse, and storage-location master (owned by `SPR-MOD-005-001`) is enforced via `ENG-012`; invalid references are rejected deterministically.
- **Given** a receipt line with a UoM that is not an assigned UoM for the item,
  **when** validation runs,
  **then** the line is rejected with a deterministic UoM-consistency error.

### 5.3 Partial receipt (US-006)

- **Given** an Inventory Receipt with a receipt line whose received quantity is less than the ordered / expected quantity,
  **when** the receipt is confirmed line-by-line,
  **then** the receipt transitions to `Partially Received` and the outstanding quantity is preserved.

### 5.4 Complete receipt (US-006)

- **Given** an Inventory Receipt whose every receipt line is fully received,
  **when** the receipt is completed,
  **then** the receipt transitions to `Received` and MAY be closed per configured policy.

### 5.5 Purchase Goods Receipt consumption (US-003)

- **Given** an approved Purchase Goods Receipt originating from `SPR-MOD-004-003`,
  **when** an Inventory Receipt consumes the Goods Receipt evidence,
  **then** the Goods Receipt reference is preserved read-only on the Inventory Receipt and Purchase ownership is not redefined.

> **Inventory Receipt SHALL NOT redefine Purchase Goods Receipt ownership.**

### 5.6 Warehouse confirmation (US-004, US-005)

- **Given** a Putaway Request or Bin Assignment Request emitted by an Inventory Receipt,
  **when** Warehouse confirms via an approved repository contract,
  **then** the confirmation is consumed read-only on the Inventory Receipt / Putaway Request record; no Warehouse execution is performed by Inventory.

> **Inventory Receipt SHALL NOT execute Warehouse putaway directly.**

### 5.7 Putaway Request (US-004)

- **Given** a confirmed Inventory Receipt,
  **when** a warehouse coordinator emits a Putaway Request,
  **then** the request is persisted, audited via `ENG-004`, and routed to Warehouse via an approved repository contract.

### 5.8 Bin Assignment Request (US-005)

- **Given** a Putaway Request that requires bin resolution,
  **when** a Bin Assignment Request is emitted,
  **then** the request is persisted and Warehouse confirmation of the assigned bin is consumed read-only.

### 5.9 Receipt completion (US-006)

- **Given** an Inventory Receipt in `Received` status,
  **when** the receipt is closed,
  **then** the receipt transitions to `Closed` and downstream inventory transaction processing is requested through approved repository contracts.

> **Receipt completion MAY emit repository-defined receipt events and SHALL request downstream Warehouse processing through approved repository contracts.**

### 5.10 Receipt status (US-001, US-006)

- **Given** any commercial Inventory Receipt,
  **when** a status transition is attempted,
  **then** only transitions consistent with the approved lifecycle (`Draft → Validated → Confirmed → Partially Received → Received → Closed`; `Cancelled` as a terminal negative transition) are permitted; invalid transitions are rejected deterministically and audited via `ENG-004`.

### 5.11 Numbering (US-008)

- **Given** an Inventory Receipt entering `Validated`,
  **when** numbering resolution runs,
  **then** a commercial receipt number is generated deterministically via `ENG-017` from the numbering series registered in `SPR-MOD-005-001`; numbers are unique and non-colliding within a company.

### 5.12 Attachments (US-006)

- **Given** an Inventory Receipt,
  **when** an attachment is uploaded,
  **then** the attachment is persisted via `ENG-008` against the attachment surface declared in `SPR-MOD-005-001`.

### 5.13 Notifications (US-004, US-005, US-006)

- **Given** a receipt lifecycle transition,
  **when** the transition completes,
  **then** notification is emitted via `ENG-025` against the notification surface declared in `SPR-MOD-005-001`.

### 5.14 Authorization (US-002, US-004, US-005, US-006, ADR-032)

- **Given** any commercial Inventory Receipt action,
  **when** it is attempted,
  **then** it is authorized under `ENG-002` per the RBAC + ABAC model authoritatively established by `ADR-032`.

### 5.15 Audit logging (US-010)

- **Given** any commercial Inventory Receipt lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, receipt identifier, transition type, and timestamp.

### 5.16 Tenant isolation (`ADR-011`)

- **Given** any commercial Inventory Receipt read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.17 Receipt events (US-009)

- **Given** a commercial Inventory Receipt lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used; unresolved names are deferred under `R-EV-01`.

### 5.18 Ownership boundary invariants

- Inventory Receipts & Putaway SHALL NOT redefine Purchase Goods Receipt ownership.
- Inventory Receipts & Putaway SHALL NOT execute Warehouse putaway directly.
- Inventory Receipts & Putaway SHALL NOT create accounting journals, vouchers, valuation entries, ledger entries, or payables.
- Inventory Receipts & Putaway SHALL NOT redefine Inventory Master ownership established by `SPR-MOD-005-001`.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-005` — Inventory.
- **Module PRD:** [`docs/20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 Business Scope (Stock movements and adjustments — inbound half; submodule Movements — inbound half; Warehouse and bin management — putaway/bin operational request path), §4 Business Processes (Inward-to-storage), §6 Transactions (Stock Receipt), §8 Integration Points (`StockReceived` — published; `GoodsReceived` — consumed), §10 Configuration (Numbering series — consumed), §12 ERP Core Engine Consumption, §13 Dependencies. See §3.

---

## 7. Dependencies

- **Parent:** `MOD-005` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — Accounting ownership boundaries. Inventory Receipts & Putaway MUST NOT redefine Accounting ownership.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Sales ownership boundaries. Inventory Receipts & Putaway MUST NOT redefine Sales ownership.
  - [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (frozen) — Supplier master and commercial procurement ownership, including Purchase Goods Receipt ownership at `SPR-MOD-004-003`.
- **Upstream sprint dependency:** [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md) — Item master, warehouse master, storage-location master, UoM master, inventory configuration namespace, inventory-document numbering series, attachment surface, notification surface.
- **Downstream sprints:** `SPR-MOD-005-003` (Inventory Issues, Transfers & Reservations), `SPR-MOD-005-004` (Inventory Adjustments & Stock Counting), `SPR-MOD-005-005` (Inventory Valuation & Replenishment), `SPR-MOD-005-006` (Inventory Analytics & Operational Controls) — per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).

Purchase ownership, Warehouse ownership, and Accounting ownership are consumed and SHALL NOT be redefined by this Sprint PRD. Module identifiers resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md).

> **SPR-MOD-004-003 SHALL be treated as the originating supplier of Goods Receipt capabilities.**
>
> **Sprint 2 SHALL consume Goods Receipts and SHALL NOT redefine Purchase ownership.**

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see §1.1). Every engine identifier SHALL resolve verbatim from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 2 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md). No placeholder, deprecated, undefined, duplicate, or additional engine identifiers are permitted.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every commercial Inventory Receipt action per `ADR-032` RBAC + ABAC. |
| `ENG-004` Audit | Records every commercial Inventory Receipt lifecycle transition per `ADR-014`. |
| `ENG-007` Document | Provides the commercial Inventory Receipt document infrastructure (versioning, header/line composition) consumed by this sprint. |
| `ENG-008` Attachment | Persists attachments against the attachment surface declared on Inventory Receipt in `SPR-MOD-005-001`. |
| `ENG-010` Workflow | Drives receipt status transitions and putaway/bin-assignment request routing. |
| `ENG-012` Rules | Evaluates receipt validation rules (referential integrity, tenancy, UoM consistency, quantity invariants, negative-stock defaults consumption). |
| `ENG-017` Numbering | Generates commercial Inventory Receipt numbers from the numbering series registered in `SPR-MOD-005-001`. |
| `ENG-024` Eventing | Publishes commercial Inventory Receipt events with the contracts declared in §11. |
| `ENG-025` Notification | Emits notifications on receipt lifecycle transitions against the notification surface declared in `SPR-MOD-005-001`. |

Inventory business semantics of the commercial Inventory Receipt lifecycle are owned by this module and are not delegated to any engine.

Identity (`ENG-001`), Permission Management (`ENG-003`), Configuration (`ENG-005`), Localization (`ENG-006`), Approval (`ENG-011`), Voucher (`ENG-015`), Posting (`ENG-016`), Search (`ENG-020`), Reporting (`ENG-021`), Export (`ENG-027`), Automation (`ENG-013`), and Import (`ENG-026`) are NOT invoked here per the Sprint 2 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md). Their consumption is delivered by upstream (`SPR-MOD-005-001`) or downstream Inventory sprints (`SPR-MOD-005-003` … `SPR-MOD-005-006`).

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Identifiers resolve verbatim from [`ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md).

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every commercial Inventory Receipt read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration on every receipt lifecycle transition. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every commercial Inventory Receipt action via `ENG-002`. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Inventory Receipt | MOD-005 (this sprint) | Authoritative commercial Inventory Receipt document owned by Inventory; carries identity, tenancy, status, and header-level references (warehouse, source Goods Receipt reference read-only). |
| Inventory Receipt Line | MOD-005 (this sprint) | Line-level record of items received, UoM, expected and received quantities, and storage-location assignment. |
| Receipt Status | MOD-005 (this sprint) | Deterministic lifecycle state of an Inventory Receipt (`Draft → Validated → Confirmed → Partially Received → Received → Closed`; `Cancelled` terminal). |
| Putaway Request | MOD-005 (this sprint) | Commercial contract emitted from a confirmed Inventory Receipt to request Warehouse putaway. |
| Bin Assignment Request | MOD-005 (this sprint) | Commercial contract emitted to Warehouse to request bin assignment; Warehouse confirmation is consumed read-only. |
| Receipt Attachment | MOD-005 (this sprint) | Attachment record against Inventory Receipt via `ENG-008` on the surface declared in `SPR-MOD-005-001`. |
| Receipt Notification | MOD-005 (this sprint) | Notification record against Inventory Receipt lifecycle transitions via `ENG-025` on the surface declared in `SPR-MOD-005-001`. |

### 10.2 Relationships

- An **Inventory Receipt** belongs to exactly one **company** (owned by MOD-001 per baseline) and references exactly one **warehouse** (owned by `SPR-MOD-005-001`).
- An **Inventory Receipt** carries one or more **Inventory Receipt Lines**.
- An **Inventory Receipt Line** references exactly one **Item** (owned by `SPR-MOD-005-001`), one **UoM** consistent with the item's assigned UoMs (owned by `SPR-MOD-005-001`), and zero or one **Storage Location** (owned by `SPR-MOD-005-001`).
- An **Inventory Receipt** MAY reference exactly one approved **Purchase Goods Receipt** originating from `SPR-MOD-004-003` (read-only).
- A **Putaway Request** belongs to exactly one **Inventory Receipt**.
- A **Bin Assignment Request** belongs to exactly one **Putaway Request**.
- A **Receipt Attachment** belongs to exactly one **Inventory Receipt**.
- A **Receipt Notification** belongs to exactly one **Inventory Receipt** lifecycle transition.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-005` per the Inventory Receipt Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Item master, warehouse master, storage-location master, and UoM master remain owned by `SPR-MOD-005-001` and are consumed read-only.
- Purchase Goods Receipt remains owned by `SPR-MOD-004-003` and is consumed read-only.
- Warehouse execution (physical putaway, physical bin operations) remains external and is consumed via approved repository contracts.
- Accounting entities (voucher, journal, ledger, payable, valuation ledger) remain owned by MOD-002 Accounting and are not represented as Inventory-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Only event names present verbatim in the authoritative event catalog are used. The authoritative event catalog is currently a stub (all sections marked *"content to be filled in a later pass"*); consequently, every commercial Inventory Receipt event surface enumerated below is **deferred** as `R-EV-01` in §14 pending event-catalog registration. The Event Catalog is **not** modified by this sprint.

| Event Surface (deferred to catalog resolution under `R-EV-01`) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| Inventory Receipt lifecycle surface (create / validate / confirm / partial / complete / close / cancel) — aligned with Module PRD §8 `StockReceived` semantics | MOD-005 | SPR-MOD-005-002 | MOD-005 (self), MOD-004 (Purchase), MOD-002 (Accounting), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Putaway Request lifecycle surface (emit / confirmed / cancelled) | MOD-005 | SPR-MOD-005-002 | MOD-005 (self), MOD-017 | At-least-once, ordered per tenant |
| Bin Assignment Request lifecycle surface (emit / confirmed / rejected) | MOD-005 | SPR-MOD-005-002 | MOD-005 (self), MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14 (see `R-EV-01`).

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Commercial Inventory Receipt event surfaces are registered in the event catalog with their contracts and are emitted on the corresponding transitions (or, if the catalog remains a stub, `R-EV-01` remains deferred with no active blocker for downstream Sprint 3 authoring).
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every commercial Inventory Receipt read and write.
- [ ] Every commercial Inventory Receipt lifecycle transition produces an audit record via `ENG-004`.
- [ ] Commercial Inventory Receipt numbering resolves via `ENG-017` against the series registered in `SPR-MOD-005-001`.
- [ ] Attachments and notifications are consumed against the surfaces declared in `SPR-MOD-005-001` via `ENG-008` and `ENG-025`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-005_SPRINT_PLAN.md` §2 (`SPR-MOD-005-002`):

- Stock receipts can be created against warehouse handover contracts and driven through the receipt lifecycle.
- Putaway to bin/location resolves against warehouse and bin master.
- Receipt validation is enforced via `ENG-012`.
- `StockReceived` event is published via `ENG-024`; `GoodsReceived` is consumed from MOD-004 Purchase.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risk Register

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open`, `Mitigated`, `Accepted`, `Deferred`, `Closed`.

- **Risk ID:** R-01
  - **Description:** Purchase dependency. Inventory Receipts & Putaway depends on `MOD004_PURCHASE_BASELINE_v1` and `SPR-MOD-004-003` being stable so that supplier master and Purchase Goods Receipt ownership are not silently absorbed by Inventory.
  - **Impact:** Weakened Purchase boundaries would blur the Inventory / Purchase split at receipt.
  - **Mitigation:** Rely on the frozen `MOD004_PURCHASE_BASELINE_v1`; treat boundary regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Goods Receipt dependency. Purchase Goods Receipts consumed by Inventory Receipts are owned by `SPR-MOD-004-003`; drift in that contract silently changes Inventory Receipt semantics.
  - **Impact:** Contract drift on Goods Receipt evidence would corrupt commercial Inventory Receipt validation and downstream inventory transaction requests.
  - **Mitigation:** Consume Goods Receipt evidence strictly via approved repository contracts; escalate divergences as Purchase contract defects.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Warehouse dependency. Physical warehouse execution is external; Inventory only requests putaway and consumes confirmation via approved contracts.
  - **Impact:** Silent absorption of warehouse execution into Inventory would violate the Warehouse Consumption Boundary (§1.1.3).
  - **Mitigation:** Enforce the Warehouse Consumption Boundary at sprint gates; do not implement physical putaway inside Inventory.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Putaway dependency. Putaway Requests emitted by Inventory require Warehouse confirmation to close cleanly.
  - **Impact:** Missing or delayed Warehouse confirmation would leave Putaway Requests in indeterminate state.
  - **Mitigation:** Model Putaway Request as its own lifecycle with explicit `confirmed` / `cancelled` terminal states; escalate stuck requests via `ENG-025` notification.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Bin Assignment dependency. Bin Assignment Requests depend on Warehouse-side bin resolution and on the bin master owned by `SPR-MOD-005-001`.
  - **Impact:** Divergence between Inventory bin master and Warehouse bin state would corrupt storage-location assignment on receipt lines.
  - **Mitigation:** Consume bin master read-only from `SPR-MOD-005-001`; consume Warehouse confirmation read-only; reject inconsistent assignments deterministically.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Accounting dependency. Inventory Receipts must not create journals, vouchers, valuation entries, ledger entries, or payables.
  - **Impact:** Silent absorption of Accounting semantics into Inventory would violate `MOD002_ACCOUNTING_BASELINE_v1`.
  - **Mitigation:** Enforce the Accounting Boundary (§1.1.5) at sprint gates; downstream accounting effects delivered by `SPR-MOD-005-005` via voucher-creation contracts.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Event Catalog gaps. The authoritative event catalog (`docs/02-architecture/event-catalog.md`) is currently a stub; every commercial Inventory Receipt event surface enumerated in §11 is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register commercial Inventory Receipt events via the event catalog governance process before downstream Inventory sprints consume them.
  - **Status:** Deferred

- **Risk ID:** R-07
  - **Description:** Cross-module contracts. Inventory Receipts consume Purchase Goods Receipt evidence and Warehouse confirmation via approved repository contracts; downstream consumers (Accounting via `SPR-MOD-005-005`, Analytics) depend on Inventory Receipt events.
  - **Impact:** Ambiguous consumption contracts would encourage parallel receipt lifecycles in consuming modules.
  - **Mitigation:** Expose Inventory Receipt lifecycle exclusively via events and read APIs; enforce consumption boundaries at sprint gates.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Receipt numbering dependency. Commercial Inventory Receipt numbering consumes the numbering series registered in `SPR-MOD-005-001`. The repository-approved numbering engine (`ENG-017`) is present in Sprint 2 engine allocation per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) and in [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and is referenced by identifier accordingly.
  - **Impact:** Divergence from the registered numbering series would break document-number stability across the Inventory module.
  - **Mitigation:** Consume series registered in `SPR-MOD-005-001` via `ENG-017`; do not register new series here.
  - **Status:** Accepted

- **Risk ID:** R-09
  - **Description:** Receipt authorization dependency. All commercial Inventory Receipt actions must be authorized under `ENG-002` per `ADR-032`.
  - **Impact:** Any bypass of `ENG-002` would break RBAC + ABAC guarantees on commercial receipts.
  - **Mitigation:** Route every commercial Inventory Receipt action through `ENG-002`; reject unauthorized actions deterministically.
  - **Status:** Open

- **Risk ID:** R-10
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — receipt validation rules (referential integrity, tenancy, UoM consistency, quantity invariants), receipt status transitions, partial/complete receipt handling, Putaway Request and Bin Assignment Request emission.
- **Integration** — audit emission via `ENG-004`, workflow transitions via `ENG-010`, rule evaluation via `ENG-012`, numbering via `ENG-017`, event publication via `ENG-024`, notifications via `ENG-025`, attachments via `ENG-008`, authorization via `ENG-002`, and document composition via `ENG-007`.
- **Contract** — commercial Inventory Receipt event contracts against the event catalog (deferred under `R-EV-01`); Purchase Goods Receipt consumption contract against `SPR-MOD-004-003`; Warehouse confirmation contract.
- **End-to-end (smoke)** — receipt creation → validation → confirmation → Putaway Request → Warehouse confirmation → complete → close under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture used to prove tenancy and ownership invariants across companies, and a fixture emulating an approved Purchase Goods Receipt from `SPR-MOD-004-003` for consumption paths.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the commercial Inventory Receipt lifecycle as a small state machine so audit emission (§5.15) and event publication (§5.17) are trivially satisfiable at every transition.
- Consider modeling Putaway Request and Bin Assignment Request as their own small lifecycles rather than as flags on the Inventory Receipt, so Warehouse confirmation semantics remain observable.
- Consider validating tenancy and referential integrity at the earliest boundary (input validation) so `ENG-012` rule evaluation runs against already-tenant-scoped data.
- Consider consuming Purchase Goods Receipt evidence strictly by reference (no denormalized copy of GR fields) so upstream contract changes do not leak into Inventory business logic.
- Consider surfacing the Inventory Receipt Ownership convention as a hard boundary in downstream module gates so `SPR-MOD-005-005` and Analytics consume events rather than write commercial receipt state.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-005-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial Inventory Receipt and Putaway lifecycle (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix (forward and reverse); every feature is tied to a `MOD-005` MODULE_PRD reference. No orphan requirements. Bidirectional mapping preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Inventory Receipt Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists Purchase, Warehouse, Accounting, Inventory Master, Issues, Transfers, Reservations, Adjustments, Counting, Lot/Serial, Valuation, Costing, Posting, and Analytics, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes and includes explicit ownership-boundary invariants (§5.18) and the three verbatim boundary statements.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-005-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-005-003 Inventory Issues, Transfers & Reservations` is the immediate successor per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-005-001` (and, transitively, on the commercial receipt substrate delivered here).

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-005-001-inventory-foundation.md`](./SPR-MOD-005-001-inventory-foundation.md)
- Purchase Baseline (frozen) — [`../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
