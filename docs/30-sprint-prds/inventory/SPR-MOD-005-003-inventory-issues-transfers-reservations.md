---
title: "SPR-MOD-005-003 — Inventory Issues, Transfers & Reservations"
summary: "Sprint PRD for the commercial Inventory Issue and Inventory Transfer lifecycle of MOD-005 Inventory: inventory issue creation, issue validation, downstream-consumer evidence consumption (Sales Delivery, Manufacturing production completion), stock reservation and allocation semantics on issues, inter-warehouse transfer, inter-bin transfer, transfer request lifecycle, movement validation, movement status, movement numbering, attachments, notifications, and inventory movement events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Inventory"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-005-003"
parent_module: "MOD-005"
parent_sprint_plan: "MOD-005_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "8.8.3"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-010", "ENG-012", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "inventory", "issues", "transfers", "reservations", "mod-005"]
document_type: "Sprint PRD"
---

# SPR-MOD-005-003 — Inventory Issues, Transfers & Reservations

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-005 Inventory** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-005-003` (permanent) |
| Parent Module | `MOD-005` — Inventory |
| Parent Sprint Plan | [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md), [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (all frozen) |
| Upstream Sprint | [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md) |
| Downstream Sprints | `SPR-MOD-005-004` … `SPR-MOD-005-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial Inventory Issue and Inventory Transfer lifecycle** for BusinessOS: the Inventory Issue document lifecycle (including reservation and allocation semantics on issue lines that support outbound consumers), the Inventory Transfer document lifecycle (inter-warehouse and inter-bin), the Transfer Request lifecycle, movement validation, consumption of downstream-consumer evidence (`DeliveryDispatched` from MOD-003 Sales, `ProductionCompleted` from MOD-009 Manufacturing) as originating drivers, movement status, movement numbering, attachments, notifications, and inventory movement events. The commercial Inventory Issue and Inventory Transfer are the substrates consumed by downstream Inventory sprints — adjustments and physical counting, valuation and replenishment, analytics — for authoritative outbound and internal-transfer activity.

> **Inventory Movement Ownership Convention.** The Inventory module owns the business semantics of the commercial Inventory Issue document, the commercial Inventory Transfer document, the Transfer Request document, movement validation, movement status, and the reservation and allocation state carried on Inventory Issue lines. ERP Core Engines provide shared infrastructure (authorization, audit, document, workflow, rules, numbering, eventing, notification) but **MUST NOT** redefine inventory movement business rules. Downstream modules consume commercial Inventory Movement events and read APIs rather than introducing independent issue, transfer, or reservation lifecycles. This complements — and does not redefine — the governance conventions established by `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, `SPR-MOD-005-001`, and `SPR-MOD-005-002`.

#### 1.1.1 Inventory Movement Ownership

Inventory owns the commercial Inventory Issue lifecycle, the commercial Inventory Transfer lifecycle (inter-warehouse and inter-bin), and the Transfer Request lifecycle, together with the reservation and allocation state carried on Inventory Issue lines. No other module MAY create, edit, close, or independently maintain a parallel commercial Inventory Issue, Inventory Transfer, or Transfer Request lifecycle. Downstream modules consume Inventory Movement events and read APIs; they MUST NOT redefine the commercial issue or transfer entities, their validation, or their status lifecycles.

#### 1.1.2 Sales Consumption Boundary

Sales (`MOD-003`) owns the customer master, the sales organization, sales orders, sales quotations, and Sales Delivery documents per `MOD003_SALES_BASELINE_v1`. `SPR-MOD-003-003` (Delivery & Fulfillment) SHALL remain the originating supplier of Sales Delivery capabilities and of the `DeliveryDispatched` event. Inventory Issues, Transfers & Reservations SHALL consume approved Sales repository contracts (Sales Delivery evidence, delivery line references, `DeliveryDispatched` events) and SHALL NOT redefine Sales ownership. No sales document lifecycle, no customer master, and no sales configuration is created or modified in this sprint.

#### 1.1.3 Warehouse Consumption Boundary

Warehouse SHALL remain authoritative for warehouse execution (physical WMS execution, external 3PL integration, physical picking operations, physical bin operations, physical inter-warehouse movement). Inventory Issues, Transfers & Reservations MAY request pick confirmation and MAY consume warehouse confirmation via approved repository contracts. Inventory Issues, Transfers & Reservations SHALL NOT perform Warehouse operations directly, SHALL NOT redefine warehouse ownership, and SHALL NOT drive external WMS execution.

#### 1.1.4 Reservation Boundary

Reservation and allocation state carried on Inventory Issue lines is owned by Inventory as a facet of the commercial Inventory Issue lifecycle. Reservation SHALL NOT redefine Sales Order ownership, Manufacturing Production Order ownership, or Purchase Order ownership; upstream document ownership remains with the originating module. Reservation is exclusively the mechanism by which Inventory records the intended assignment of on-hand quantity to an approved outbound consumer contract, and is not exposed as an independently governed lifecycle outside Inventory.

#### 1.1.5 Accounting Boundary

Accounting (`MOD-002`) owns accounting vouchers, journal posting, ledger posting, taxation, financial reporting, valuation ledger, and receivables per `MOD002_ACCOUNTING_BASELINE_v1`. Inventory Issues, Transfers & Reservations SHALL NOT create journals, SHALL NOT create vouchers, SHALL NOT perform valuation, SHALL NOT update ledgers, and SHALL NOT create receivables or payables. Any accounting effect of a completed commercial issue or transfer is delivered downstream by `SPR-MOD-005-005` via voucher-creation contracts consumed by Accounting.

#### 1.1.6 Transfer Coordination Boundary

Inter-warehouse and inter-bin Transfers coordinate two Warehouse endpoints. Inventory owns the Transfer Request and Transfer document lifecycles as commercial contracts; Warehouse owns the physical pick, dispatch, in-transit handling, and receipt at destination. Inventory Issues, Transfers & Reservations SHALL request Warehouse processing through approved repository contracts at each endpoint and SHALL consume Warehouse confirmation read-only. No cross-warehouse physical execution is performed by Inventory.

#### 1.1.7 Inventory Transaction Boundary

Commercial issue completion and commercial transfer completion SHALL request downstream inventory transaction processing (stock balance updates, inventory movement records) through approved repository contracts. Issue and transfer completion SHALL enforce the configured negative-stock policy defaults registered in `SPR-MOD-005-001` and SHALL NOT collapse commercial and transactional concerns into a single write path.

#### 1.1.8 Governance Complement

This Sprint complements — and does not redefine — `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, `MOD004_PURCHASE_BASELINE_v1`, [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md), and [`SPR-MOD-005-002`](./SPR-MOD-005-002-inventory-receipts-putaway.md). Ownership established by those baselines and by Inventory Foundation and Inventory Receipts & Putaway is consumed and preserved; it is not overridden here. Ownership boundaries SHALL NOT be redefined in downstream Inventory Sprint PRDs.

### 1.2 In Scope

Commercial Inventory Issue and Inventory Transfer lifecycle (including reservation and allocation state on issue lines) only:

- Inventory Issue creation under a tenant/company (outbound issue against approved outbound-consumer evidence).
- Issue validation (referential integrity against Item master, warehouse, storage location; tenancy; UoM consistency; quantity invariants; negative-stock policy consumption).
- Sales Delivery consumption — read-only intake of approved Sales Delivery evidence originating from `SPR-MOD-003-003` and its `DeliveryDispatched` event.
- Production completion consumption — read-only intake of approved `ProductionCompleted` evidence originating from MOD-009 Manufacturing (via approved repository contracts; MOD-009 remains authoritative).
- Reservation and allocation state on Inventory Issue lines (line-level reservation of on-hand quantity, allocation, release-on-cancel).
- Inventory Transfer creation (inter-warehouse and inter-bin) under a tenant/company.
- Transfer Request lifecycle (request emission from a source warehouse; request confirmation at the destination warehouse).
- Warehouse confirmation consumption — read-only intake of approved warehouse confirmation contracts at each transfer endpoint.
- Movement validation (issue and transfer) via `ENG-012`.
- Partial issue and partial transfer handling at line level.
- Complete issue and complete transfer handling at line level and document level.
- Movement status lifecycle (`Draft → Validated → Reserved → Confirmed → Partially Issued|Transferred → Issued|Transferred → Closed`; `Cancelled` as a terminal negative transition; the `Reserved` state applies to Inventory Issue only).
- Movement numbering via numbering series registered in `SPR-MOD-005-001` (Inventory Issue series and Inventory Transfer series).
- Attachments on Inventory Issue and Inventory Transfer via `ENG-008` surfaces declared in `SPR-MOD-005-001`. *(Note: `ENG-008` is delivered by `SPR-MOD-005-002`; this sprint consumes the surface, not the engine — see §8.)*
- Notifications on movement lifecycle transitions via `ENG-025` against the notification surface declared in `SPR-MOD-005-001`.
- Inventory movement events emitted via `ENG-024`.

### 1.3 Out of Scope

Reserved for other sprints, upstream baselines, or explicit non-redefinition:

- Sales ownership, Sales document lifecycles, and customer master — owned by MOD-003 Sales; consumed via `MOD003_SALES_BASELINE_v1`.
- Sales Delivery ownership — owned by `SPR-MOD-003-003`; consumed as originating outbound-consumer evidence.
- Manufacturing ownership and Production Order ownership — owned by MOD-009 Manufacturing; consumed via approved repository contracts.
- Purchase ownership and Purchase Goods Receipt ownership — owned by MOD-004 Purchase and `SPR-MOD-004-003`; consumed by `SPR-MOD-005-002`, not this sprint.
- Warehouse ownership (physical WMS, external 3PL, warehouse operational systems, physical pick, physical inter-warehouse movement) — external ownership; consumed via approved warehouse contracts.
- Inventory Master data (item, item category, item group, UoM, warehouse master, storage-location master) — owned by `SPR-MOD-005-001`.
- Inventory Receipt and Putaway — owned by `SPR-MOD-005-002`.
- Stock Adjustments — `SPR-MOD-005-004`.
- Stock Counting (cycle count, physical count, variance recording) — `SPR-MOD-005-004`.
- Lot Control and Serial Control — not in the approved MOD-005 Module PRD; explicitly not authored here.
- Accounting vouchers, journal posting, ledger posting, taxation, and receivables/payables — owned by MOD-002 Accounting.
- Inventory Valuation (FIFO / moving average / standard) — `SPR-MOD-005-005`.
- Costing — deferred to `SPR-MOD-005-005` (valuation) and MOD-002 Accounting (accounting valuation ledger).
- Reorder policies and replenishment suggestions — `SPR-MOD-005-005`.
- Financial Posting — owned by MOD-002 Accounting.
- Dashboards, KPIs, and Analytics — `SPR-MOD-005-006` and MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-005-003`, the following will exist:

- **Inventory Issues.** Commercial Inventory Issue documents can be created, edited, validated, reserved, confirmed, partially issued, fully issued, closed, and cancelled under a tenant/company.
- **Reservation and Allocation State.** Line-level reservation of on-hand quantity against approved outbound-consumer contracts and release-on-cancel are enforced deterministically as a facet of the Inventory Issue lifecycle.
- **Inventory Transfers.** Commercial Inventory Transfer documents (inter-warehouse and inter-bin) can be created, edited, validated, confirmed, partially transferred, fully transferred, closed, and cancelled.
- **Transfer Requests.** Transfer Request documents can be emitted from a source warehouse and confirmed at the destination warehouse; Warehouse confirmation is consumed read-only at each endpoint.
- **Movement Validation.** Issue and transfer validation rules (referential integrity, tenancy, UoM consistency, quantity invariants, negative-stock policy consumption) are enforced deterministically via `ENG-012`.
- **Movement Confirmation.** Issue and transfer status transitions are driven through `ENG-010` and produce audit records via `ENG-004`.
- **Sales Delivery Consumption.** Approved Sales Delivery evidence originating from `SPR-MOD-003-003` and `DeliveryDispatched` events are consumed read-only as originating outbound-consumer evidence.
- **Production Completion Consumption.** Approved `ProductionCompleted` evidence originating from MOD-009 Manufacturing is consumed read-only as originating outbound-consumer evidence.
- **Movement Numbering.** Commercial Inventory Issue and Inventory Transfer numbering resolves via `ENG-017` against the numbering series registered in `SPR-MOD-005-001`.
- **Movement Status.** Movement status lifecycles (§1.2) are enforced deterministically.
- **Attachments.** Attachment surfaces declared in `SPR-MOD-005-001` are consumed on Inventory Issue and Inventory Transfer via `ENG-008` (delivered by `SPR-MOD-005-002`).
- **Notifications.** Notification surface declared in `SPR-MOD-005-001` is consumed via `ENG-025`.
- **Inventory Movement Events.** Event contracts for the commercial Inventory Issue and Inventory Transfer lifecycles (see §11) are emitted via `ENG-024`, subject to authoritative event-catalog resolution (see §11 and `R-EV-01`).
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-005-003`.
- **Forward references.** Downstream sprints `SPR-MOD-005-004`, `SPR-MOD-005-005`, `SPR-MOD-005-006` consume the commercial issue and transfer substrate established here.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Bidirectional Traceability

Every Module capability SHALL map to exactly one originating Sprint. Every Sprint capability SHALL trace back to one approved Module capability. No orphan Sprint capability. No duplicate originating allocation. No unallocated Module capability.

### 3.1 Forward Map — Module PRD Capability → Sprint 3 Deliverable

| MOD-005 MODULE_PRD Reference | Delivered By |
| --- | --- |
| §2 Business Scope — Stock movements and adjustments (outbound and internal-transfer half; submodule Movements — outbound and transfer half) | Inventory Issues + Inventory Transfers (creation, validation, reservation, confirmation, partial / complete, status, numbering) |
| §4 Business Processes — Storage-to-outward | Inventory Issue lifecycle + Sales Delivery consumption + `DeliveryDispatched` consumption |
| §4 Business Processes — Stock transfer | Inventory Transfer lifecycle + Transfer Request lifecycle |
| §6 Transactions — Stock Issue | Inventory Issue document, Inventory Issue Line, Movement Status (Issue), Reservation state on issue lines |
| §6 Transactions — Stock Transfer | Inventory Transfer document, Inventory Transfer Line, Transfer Request, Movement Status (Transfer) |
| §6 Transactions — Numbering | Issue and Transfer numbering via `ENG-017` against series registered in `SPR-MOD-005-001` |
| §6 Transactions — Audit | Audit of every issue and transfer lifecycle transition via `ENG-004` |
| §7 Business Rules — Negative-stock policy (consumed) | Movement validation consumes negative-stock defaults registered in `SPR-MOD-005-001` |
| §8 Integration Points — `StockIssued` published; `StockTransferred` published | Inventory Movement Events (§11) |
| §8 Integration Points — `DeliveryDispatched` consumed; `ProductionCompleted` consumed | Sales Delivery consumption + Production completion consumption |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

### 3.2 Reverse Map — Sprint 3 Capability → Module PRD Reference

| Sprint 3 Capability | Module PRD Reference |
| --- | --- |
| Inventory Issue creation | §2 (Stock movements — outbound); §6 (Stock Issue) |
| Issue validation | §6 (Stock Issue); §7 (Business rules — negative stock policy consumption) |
| Reservation and allocation state on issue lines | §2 (Stock movements — outbound half, allocation of on-hand to outbound consumers); §6 (Stock Issue lifecycle) |
| Sales Delivery consumption | §8 (`DeliveryDispatched` — consumed); §13 (Depends On Modules: MOD-003 Sales via baseline) |
| Production completion consumption | §8 (`ProductionCompleted` — consumed); §13 (Depends On Modules: MOD-009 Manufacturing via approved contracts) |
| Issue confirmation | §4 (Storage-to-outward); §6 (Stock Issue lifecycle) |
| Inventory Transfer creation (inter-warehouse and inter-bin) | §2 (Stock movements — internal transfer half); §6 (Stock Transfer) |
| Transfer Request lifecycle | §4 (Stock transfer); §6 (Stock Transfer) |
| Warehouse confirmation consumption at transfer endpoints | §4 (Stock transfer); §13 (Shared master data / external systems — 3PL / WMS) |
| Partial issue and partial transfer | §6 (Stock Issue lifecycle; Stock Transfer lifecycle) |
| Complete issue and complete transfer | §6 (Stock Issue lifecycle; Stock Transfer lifecycle) |
| Movement status | §6 (Stock Issue lifecycle; Stock Transfer lifecycle) |
| Movement numbering | §6 (Numbering); §10 (Configuration — Numbering series) |
| Attachments | §12 (Optional engines — Attachment) |
| Notifications | §12 (Optional engines — Notification) |
| Inventory Movement Events | §8 (Integration Points — Events Published: `StockIssued`, `StockTransferred`) |

Sprint scope is bounded strictly by these references. **No capability introduced in this Sprint PRD is outside the approved Inventory Module PRD, and no Sprint 3 capability approved in `MOD-005_SPRINT_PLAN.md` is orphaned from this Sprint PRD.** Unique originating allocation is preserved.

---

## 4. User Stories

Every user story SHALL trace to exactly one Sprint Deliverable (§2).

- **US-001.** *As an inventory executive, I want a single authoritative Inventory Issue document across the enterprise, so that outbound activity is recorded once and consumed by every downstream Inventory sprint.*  — Deliverable: Inventory Issues.
- **US-002.** *As a dispatch officer, I want to create and validate an Inventory Issue against Item master, warehouse, and storage-location master, so that only referentially consistent issues enter the lifecycle.*  — Deliverables: Inventory Issues, Movement Validation.
- **US-003.** *As a sales liaison, I want the Inventory Issue to consume approved Sales Delivery evidence and `DeliveryDispatched` events originating from `SPR-MOD-003-003`, so that outbound-consumer evidence is preserved without redefining Sales ownership.*  — Deliverable: Sales Delivery Consumption.
- **US-004.** *As an inventory controller, I want reservation and allocation state on Inventory Issue lines so that on-hand quantity can be committed to approved outbound-consumer contracts and released deterministically on cancel.*  — Deliverable: Reservation and Allocation State.
- **US-005.** *As a warehouse coordinator, I want to create an Inventory Transfer (inter-warehouse or inter-bin) and emit a Transfer Request to the destination warehouse, so that internal movement is coordinated without Inventory redefining Warehouse execution.*  — Deliverables: Inventory Transfers, Transfer Requests.
- **US-006.** *As a warehouse coordinator, I want Warehouse confirmation at the source and destination of a Transfer to be consumed read-only, so that transfer completion remains deterministic and audited.*  — Deliverable: Transfer Requests.
- **US-007.** *As an inventory controller, I want partial and complete issue and transfer handling at the line level and the document level, so that mixed and staged movements are recorded truthfully.*  — Deliverable: Inventory Issues (partial/complete); Inventory Transfers (partial/complete).
- **US-008.** *As a branch manager, I want commercial Inventory Issues and Transfers to be scoped under the tenant/company/branch hierarchy established by the Platform baseline, so that movements remain isolated per tenant per `ADR-011`.*  — Deliverables: Inventory Issues, Inventory Transfers.
- **US-009.** *As an inventory administrator, I want commercial Inventory Issue and Inventory Transfer numbers to be generated deterministically from the numbering series registered in `SPR-MOD-005-001`, so that document numbers are stable and non-colliding within a company.*  — Deliverable: Movement Numbering.
- **US-010.** *As a manufacturing liaison, I want the Inventory Issue to consume `ProductionCompleted` evidence from MOD-009 Manufacturing so that production-driven outbound movement is recorded without redefining Manufacturing ownership.*  — Deliverable: Production Completion Consumption.
- **US-011.** *As an inventory analyst, I want Inventory Movement events published so that downstream systems (Analytics, valuation) can react to movements without Inventory publishing directly to consuming modules.*  — Deliverable: Inventory Movement Events.
- **US-012.** *As a system administrator, I want every commercial Inventory Issue and Inventory Transfer lifecycle transition to be audited via `ENG-004`, so that the movement history can be reconstructed from an authoritative log.*  — Deliverable: Movement Confirmation (audit thread across all deliverables).

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Inventory Issue creation (US-001, US-002)

- **Given** a valid Inventory Issue creation request under a tenant/company,
  **when** a dispatch officer submits it,
  **then** an Inventory Issue is persisted in `Draft` with a stable identifier scoped to the company.

### 5.2 Issue validation (US-002)

- **Given** an Inventory Issue referencing an item, warehouse, and storage location,
  **when** validation runs,
  **then** referential integrity against the Item master, warehouse, and storage-location master (owned by `SPR-MOD-005-001`) is enforced via `ENG-012`; invalid references are rejected deterministically.
- **Given** an issue line with a UoM that is not an assigned UoM for the item,
  **when** validation runs,
  **then** the line is rejected with a deterministic UoM-consistency error.
- **Given** an issue line that would drive on-hand quantity negative,
  **when** validation runs,
  **then** the line is rejected or accepted deterministically per the negative-stock policy defaults registered in `SPR-MOD-005-001` via `ENG-012`.

### 5.3 Reservation and allocation (US-004)

- **Given** an Inventory Issue line referencing available on-hand quantity,
  **when** reservation is requested,
  **then** the reserved quantity is recorded on the issue line and the Inventory Issue transitions to `Reserved`; released-on-cancel deterministically returns the reserved quantity to available on-hand.

> **Reservation SHALL NOT redefine Sales Order, Production Order, or Purchase Order ownership.**

### 5.4 Sales Delivery consumption (US-003)

- **Given** an approved Sales Delivery originating from `SPR-MOD-003-003` and a corresponding `DeliveryDispatched` event,
  **when** an Inventory Issue consumes the delivery evidence,
  **then** the Sales Delivery reference is preserved read-only on the Inventory Issue and Sales ownership is not redefined.

> **Inventory Issue SHALL NOT redefine Sales Delivery ownership.**

### 5.5 Production completion consumption (US-010)

- **Given** an approved `ProductionCompleted` event originating from MOD-009 Manufacturing,
  **when** an Inventory Issue consumes the production evidence,
  **then** the production reference is preserved read-only on the Inventory Issue and Manufacturing ownership is not redefined.

### 5.6 Partial issue (US-007)

- **Given** an Inventory Issue with an issue line whose issued quantity is less than the requested quantity,
  **when** the issue is confirmed line-by-line,
  **then** the issue transitions to `Partially Issued` and the outstanding quantity is preserved.

### 5.7 Complete issue (US-007)

- **Given** an Inventory Issue whose every issue line is fully issued,
  **when** the issue is completed,
  **then** the issue transitions to `Issued` and MAY be closed per configured policy.

### 5.8 Inventory Transfer creation (US-005)

- **Given** a valid Inventory Transfer creation request (inter-warehouse or inter-bin) under a tenant/company,
  **when** a warehouse coordinator submits it,
  **then** an Inventory Transfer is persisted in `Draft` with a stable identifier scoped to the company.

### 5.9 Transfer Request lifecycle (US-005, US-006)

- **Given** a validated Inventory Transfer,
  **when** a Transfer Request is emitted from the source warehouse,
  **then** the request is persisted, audited via `ENG-004`, and routed to the destination warehouse via an approved repository contract.
- **Given** an emitted Transfer Request awaiting destination confirmation,
  **when** the destination warehouse confirms via an approved repository contract,
  **then** the confirmation is consumed read-only on the Transfer Request record; no Warehouse execution is performed by Inventory.

> **Inventory Transfer SHALL NOT execute Warehouse operations directly.**

### 5.10 Partial transfer (US-007)

- **Given** an Inventory Transfer with a transfer line whose transferred quantity is less than the requested quantity,
  **when** the transfer is confirmed line-by-line,
  **then** the transfer transitions to `Partially Transferred` and the outstanding quantity is preserved.

### 5.11 Complete transfer (US-007)

- **Given** an Inventory Transfer whose every transfer line is fully transferred and confirmed at the destination,
  **when** the transfer is completed,
  **then** the transfer transitions to `Transferred` and MAY be closed per configured policy.

### 5.12 Movement completion (US-007)

- **Given** an Inventory Issue in `Issued` status or an Inventory Transfer in `Transferred` status,
  **when** the movement is closed,
  **then** the movement transitions to `Closed` and downstream inventory transaction processing is requested through approved repository contracts.

> **Movement completion MAY emit repository-defined movement events and SHALL request downstream inventory transaction processing through approved repository contracts.**

### 5.13 Movement status (US-001, US-005, US-007)

- **Given** any commercial Inventory Issue or Inventory Transfer,
  **when** a status transition is attempted,
  **then** only transitions consistent with the approved lifecycle (`Draft → Validated → Reserved (Issue only) → Confirmed → Partially Issued|Transferred → Issued|Transferred → Closed`; `Cancelled` as a terminal negative transition) are permitted; invalid transitions are rejected deterministically and audited via `ENG-004`.

### 5.14 Numbering (US-009)

- **Given** an Inventory Issue or Inventory Transfer entering `Validated`,
  **when** numbering resolution runs,
  **then** a commercial movement number is generated deterministically via `ENG-017` from the numbering series registered in `SPR-MOD-005-001`; numbers are unique and non-colliding within a company.

### 5.15 Attachments (US-007)

- **Given** an Inventory Issue or Inventory Transfer,
  **when** an attachment is uploaded,
  **then** the attachment is persisted via `ENG-008` against the attachment surface declared in `SPR-MOD-005-001`.

### 5.16 Notifications (US-005, US-006, US-007)

- **Given** an issue or transfer lifecycle transition,
  **when** the transition completes,
  **then** notification is emitted via `ENG-025` against the notification surface declared in `SPR-MOD-005-001`.

### 5.17 Authorization (US-002, US-005, US-006, US-007, ADR-032)

- **Given** any commercial Inventory Issue or Inventory Transfer action,
  **when** it is attempted,
  **then** it is authorized under `ENG-002` per the RBAC + ABAC model authoritatively established by `ADR-032`.

### 5.18 Audit logging (US-012)

- **Given** any commercial Inventory Issue or Inventory Transfer lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, movement identifier, transition type, and timestamp.

### 5.19 Tenant isolation (`ADR-011`)

- **Given** any commercial Inventory Issue or Inventory Transfer read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.20 Movement events (US-011)

- **Given** a commercial Inventory Issue or Inventory Transfer lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used; unresolved names are deferred under `R-EV-01`.

### 5.21 Ownership boundary invariants

- Inventory Issues, Transfers & Reservations SHALL NOT redefine Sales Delivery ownership.
- Inventory Issues, Transfers & Reservations SHALL NOT redefine Manufacturing Production Order ownership.
- Inventory Issues, Transfers & Reservations SHALL NOT execute Warehouse operations directly; downstream Warehouse processing SHALL be requested through approved repository contracts.
- Inventory Issues, Transfers & Reservations SHALL NOT create accounting journals, vouchers, valuation entries, ledger entries, receivables, or payables.
- Inventory Issues, Transfers & Reservations SHALL NOT redefine Inventory Master ownership established by `SPR-MOD-005-001` or Inventory Receipt ownership established by `SPR-MOD-005-002`.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-005` — Inventory.
- **Module PRD:** [`docs/20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 Business Scope (Stock movements and adjustments — outbound and internal-transfer half; submodule Movements — outbound and transfer half), §4 Business Processes (Storage-to-outward, Stock transfer), §6 Transactions (Stock Issue, Stock Transfer), §7 Business Rules (Negative-stock policy — consumed), §8 Integration Points (`StockIssued`, `StockTransferred` — published; `DeliveryDispatched`, `ProductionCompleted` — consumed), §10 Configuration (Numbering series — consumed), §12 ERP Core Engine Consumption, §13 Dependencies. See §3.

---

## 7. Dependencies

- **Parent:** `MOD-005` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — Accounting ownership boundaries. Inventory Issues, Transfers & Reservations MUST NOT redefine Accounting ownership.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Customer master and commercial sales ownership, including Sales Delivery ownership at `SPR-MOD-003-003`.
  - [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (frozen) — Purchase ownership boundaries. Inventory Issues, Transfers & Reservations MUST NOT redefine Purchase ownership.
- **Upstream sprint dependencies:**
  - [`SPR-MOD-005-001`](./SPR-MOD-005-001-inventory-foundation.md) — Item master, warehouse master, storage-location master, UoM master, inventory configuration namespace, inventory-document numbering series, attachment surface, notification surface, negative-stock policy defaults.
  - [`SPR-MOD-005-002`](./SPR-MOD-005-002-inventory-receipts-putaway.md) — Commercial Inventory Receipt and Putaway substrate; on-hand quantity produced by receipts is consumed by reservation and issue lifecycles here. Attachment engine (`ENG-008`) surface consumption originates from Sprint 2 and is consumed here.
- **Downstream sprints:** `SPR-MOD-005-004` (Inventory Adjustments & Stock Counting), `SPR-MOD-005-005` (Inventory Valuation & Replenishment), `SPR-MOD-005-006` (Inventory Analytics & Operational Controls) — per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).

Sales ownership, Purchase ownership, Warehouse ownership, Manufacturing ownership, and Accounting ownership are consumed and SHALL NOT be redefined by this Sprint PRD. Module identifiers resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md).

> **SPR-MOD-003-003 SHALL be treated as the originating supplier of Sales Delivery capabilities.**
>
> **Sprint 3 SHALL consume Sales Delivery evidence and `DeliveryDispatched` events, and SHALL NOT redefine Sales ownership.**
>
> **Sprint 3 SHALL consume `ProductionCompleted` evidence via approved repository contracts, and SHALL NOT redefine Manufacturing ownership.**

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see §1.1). Every engine identifier SHALL resolve verbatim from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 3 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md). No placeholder, deprecated, undefined, duplicate, or additional engine identifiers are permitted.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every commercial Inventory Issue and Inventory Transfer action per `ADR-032` RBAC + ABAC. |
| `ENG-004` Audit | Records every commercial Inventory Issue and Inventory Transfer lifecycle transition per `ADR-014`. |
| `ENG-007` Document | Provides the commercial Inventory Issue and Inventory Transfer document infrastructure (versioning, header/line composition) consumed by this sprint. |
| `ENG-010` Workflow | Drives issue and transfer status transitions and Transfer Request routing. |
| `ENG-012` Rules | Evaluates movement validation rules (referential integrity, tenancy, UoM consistency, quantity invariants, negative-stock defaults consumption, reservation invariants). |
| `ENG-017` Numbering | Generates commercial Inventory Issue and Inventory Transfer numbers from the numbering series registered in `SPR-MOD-005-001`. |
| `ENG-024` Eventing | Publishes commercial Inventory Movement events with the contracts declared in §11. |
| `ENG-025` Notification | Emits notifications on issue and transfer lifecycle transitions against the notification surface declared in `SPR-MOD-005-001`. |

Inventory business semantics of the commercial Inventory Issue and Inventory Transfer lifecycles (including reservation and allocation state) are owned by this module and are not delegated to any engine.

Identity (`ENG-001`), Permission Management (`ENG-003`), Configuration (`ENG-005`), Localization (`ENG-006`), Attachment (`ENG-008`), Approval (`ENG-011`), Voucher (`ENG-015`), Posting (`ENG-016`), Search (`ENG-020`), Reporting (`ENG-021`), Export (`ENG-027`), Automation (`ENG-013`), and Import (`ENG-026`) are NOT invoked here per the Sprint 3 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md). Their consumption is delivered by upstream (`SPR-MOD-005-001`, `SPR-MOD-005-002`) or downstream Inventory sprints (`SPR-MOD-005-004` … `SPR-MOD-005-006`). Attachment surfaces on Inventory Issue and Inventory Transfer consume the `ENG-008` integration already established in `SPR-MOD-005-002`.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Identifiers resolve verbatim from [`ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md).

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every commercial Inventory Issue and Inventory Transfer read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration on every movement lifecycle transition. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every commercial Inventory Issue and Inventory Transfer action via `ENG-002`. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Inventory Issue | MOD-005 (this sprint) | Authoritative commercial Inventory Issue document owned by Inventory; carries identity, tenancy, status, and header-level references (warehouse, source Sales Delivery reference read-only, source Production reference read-only). |
| Inventory Issue Line | MOD-005 (this sprint) | Line-level record of items issued, UoM, requested and issued quantities, reservation and allocation state, storage-location reference. |
| Inventory Transfer | MOD-005 (this sprint) | Authoritative commercial Inventory Transfer document owned by Inventory; carries identity, tenancy, status, source and destination warehouse references, and inter-bin/inter-warehouse discriminator. |
| Inventory Transfer Line | MOD-005 (this sprint) | Line-level record of items transferred, UoM, requested and transferred quantities, source and destination storage-location references. |
| Transfer Request | MOD-005 (this sprint) | Commercial contract emitted from a source warehouse to request destination-warehouse handling of an Inventory Transfer; consumed by Warehouse at each endpoint. |
| Inventory Reservation | MOD-005 (this sprint) | Reservation state carried on an Inventory Issue Line; records the intended assignment of on-hand quantity to an approved outbound-consumer contract. Not exposed as an independently governed lifecycle outside Inventory. |
| Inventory Allocation | MOD-005 (this sprint) | Allocation state carried on an Inventory Issue Line; records the confirmed assignment of reserved quantity to the outbound consumer at confirmation time. |
| Movement Status | MOD-005 (this sprint) | Deterministic lifecycle state of an Inventory Issue or Inventory Transfer (`Draft → Validated → Reserved (Issue only) → Confirmed → Partially Issued|Transferred → Issued|Transferred → Closed`; `Cancelled` terminal). |
| Reservation Status | MOD-005 (this sprint) | Deterministic state of the reservation and allocation facet on an Inventory Issue Line (`None → Reserved → Allocated → Released`). |
| Movement Attachment | MOD-005 (this sprint) | Attachment record against Inventory Issue or Inventory Transfer via `ENG-008` on the surface declared in `SPR-MOD-005-001`. |
| Movement Notification | MOD-005 (this sprint) | Notification record against Inventory Issue or Inventory Transfer lifecycle transitions via `ENG-025` on the surface declared in `SPR-MOD-005-001`. |

### 10.2 Relationships

- An **Inventory Issue** belongs to exactly one **company** (owned by MOD-001 per baseline) and references exactly one **warehouse** (owned by `SPR-MOD-005-001`).
- An **Inventory Issue** carries one or more **Inventory Issue Lines**.
- An **Inventory Issue Line** references exactly one **Item** (owned by `SPR-MOD-005-001`), one **UoM** consistent with the item's assigned UoMs (owned by `SPR-MOD-005-001`), and zero or one **Storage Location** (owned by `SPR-MOD-005-001`).
- An **Inventory Issue** MAY reference exactly one approved **Sales Delivery** originating from `SPR-MOD-003-003` (read-only) OR exactly one approved **Production Completion** evidence originating from MOD-009 Manufacturing (read-only).
- An **Inventory Issue Line** carries exactly one **Inventory Reservation** state and exactly one **Inventory Allocation** state (each of which MAY be `None`).
- An **Inventory Transfer** belongs to exactly one **company** and references exactly one **source warehouse** and exactly one **destination warehouse** (owned by `SPR-MOD-005-001`).
- An **Inventory Transfer** carries one or more **Inventory Transfer Lines**.
- An **Inventory Transfer Line** references exactly one **Item**, one **UoM** consistent with the item's assigned UoMs, and exactly one **source Storage Location** and one **destination Storage Location** (owned by `SPR-MOD-005-001`).
- A **Transfer Request** belongs to exactly one **Inventory Transfer**.
- A **Movement Attachment** belongs to exactly one **Inventory Issue** or one **Inventory Transfer**.
- A **Movement Notification** belongs to exactly one **Inventory Issue** or one **Inventory Transfer** lifecycle transition.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-005` per the Inventory Movement Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Item master, warehouse master, storage-location master, and UoM master remain owned by `SPR-MOD-005-001` and are consumed read-only.
- Inventory Receipt and Putaway remain owned by `SPR-MOD-005-002` and are consumed as substrate (on-hand quantity input) via approved repository contracts.
- Sales Delivery remains owned by `SPR-MOD-003-003` and is consumed read-only.
- Manufacturing Production Order and Production completion remain owned by MOD-009 and are consumed read-only via approved repository contracts.
- Warehouse execution (physical pick, physical inter-warehouse movement, physical bin operations) remains external and is consumed via approved repository contracts.
- Accounting entities (voucher, journal, ledger, receivable, payable, valuation ledger) remain owned by MOD-002 Accounting and are not represented as Inventory-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Only event names present verbatim in the authoritative event catalog are used. The authoritative event catalog is currently a stub (all sections marked *"content to be filled in a later pass"*); consequently, every commercial Inventory Movement event surface enumerated below is **deferred** as `R-EV-01` in §14 pending event-catalog registration. The Event Catalog is **not** modified by this sprint.

| Event Surface (deferred to catalog resolution under `R-EV-01`) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| Inventory Issue lifecycle surface (create / validate / reserve / confirm / partial / complete / close / cancel) — aligned with Module PRD §8 `StockIssued` semantics | MOD-005 | SPR-MOD-005-003 | MOD-005 (self), MOD-003 (Sales), MOD-009 (Manufacturing), MOD-002 (Accounting), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Inventory Transfer lifecycle surface (create / validate / confirm / partial / complete / close / cancel) — aligned with Module PRD §8 `StockTransferred` semantics | MOD-005 | SPR-MOD-005-003 | MOD-005 (self), MOD-002 (Accounting), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Transfer Request lifecycle surface (emit / confirmed / cancelled) | MOD-005 | SPR-MOD-005-003 | MOD-005 (self), MOD-017 | At-least-once, ordered per tenant |
| Reservation state surface (reserved / allocated / released) on Inventory Issue lines | MOD-005 | SPR-MOD-005-003 | MOD-005 (self), MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14 (see `R-EV-01`).

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Commercial Inventory Movement event surfaces are registered in the event catalog with their contracts and are emitted on the corresponding transitions (or, if the catalog remains a stub, `R-EV-01` remains deferred with no active blocker for downstream Sprint 4 authoring).
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every commercial Inventory Issue and Inventory Transfer read and write.
- [ ] Every commercial Inventory Issue and Inventory Transfer lifecycle transition produces an audit record via `ENG-004`.
- [ ] Commercial Inventory Issue and Inventory Transfer numbering resolves via `ENG-017` against the series registered in `SPR-MOD-005-001`.
- [ ] Attachments and notifications are consumed against the surfaces declared in `SPR-MOD-005-001` via `ENG-008` (delivered by `SPR-MOD-005-002`) and `ENG-025`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-005_SPRINT_PLAN.md` §2 (`SPR-MOD-005-003`):

- Stock issues and stock transfers can be created, validated, and driven through the movement lifecycle.
- Movement validation enforces negative-stock policy per Module PRD §7 via `ENG-012`.
- `StockIssued` and `StockTransferred` events are published via `ENG-024`; `DeliveryDispatched` and `ProductionCompleted` are consumed from downstream modules.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risk Register

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open`, `Mitigated`, `Accepted`, `Deferred`, `Closed`.

- **Risk ID:** R-01
  - **Description:** Sales dependency. Inventory Issues, Transfers & Reservations depends on `MOD003_SALES_BASELINE_v1` and `SPR-MOD-003-003` being stable so that customer master and Sales Delivery ownership are not silently absorbed by Inventory.
  - **Impact:** Weakened Sales boundaries would blur the Inventory / Sales split at issue.
  - **Mitigation:** Rely on the frozen `MOD003_SALES_BASELINE_v1`; treat boundary regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Sales Delivery dependency. Sales Deliveries consumed by Inventory Issues are owned by `SPR-MOD-003-003`; drift in that contract silently changes Inventory Issue semantics.
  - **Impact:** Contract drift on Sales Delivery evidence would corrupt commercial Inventory Issue validation and downstream inventory transaction requests.
  - **Mitigation:** Consume Sales Delivery evidence strictly via approved repository contracts; escalate divergences as Sales contract defects.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Manufacturing dependency. `ProductionCompleted` consumed by Inventory Issues is owned by MOD-009 Manufacturing; production ownership is external.
  - **Impact:** Silent absorption of Manufacturing execution into Inventory would violate MOD-009 ownership and Module PRD §8.
  - **Mitigation:** Consume production evidence read-only; do not implement production execution inside Inventory.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Warehouse dependency. Physical Warehouse execution (pick, dispatch, in-transit handling, receipt at destination) is external; Inventory only requests processing and consumes confirmation via approved contracts.
  - **Impact:** Silent absorption of warehouse execution into Inventory would violate the Warehouse Consumption Boundary (§1.1.3).
  - **Mitigation:** Enforce the Warehouse Consumption Boundary at sprint gates; do not implement physical pick or physical transfer inside Inventory.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Transfer coordination dependency. Inter-warehouse transfers require Warehouse confirmation at both endpoints; missing or delayed confirmation at either endpoint leaves the transfer in an indeterminate state.
  - **Impact:** Stuck Transfer Requests would corrupt on-hand quantity at either endpoint.
  - **Mitigation:** Model Transfer Request as its own lifecycle with explicit `confirmed` / `cancelled` terminal states at each endpoint; escalate stuck requests via `ENG-025` notification.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Reservation invariants. Reservation and allocation state on Inventory Issue lines must be released deterministically on cancel and must not double-count on-hand quantity.
  - **Impact:** Reservation leaks would corrupt available-to-issue quantities and downstream valuation.
  - **Mitigation:** Enforce reservation-release invariants via `ENG-012`; model reservation as an explicit facet of the Inventory Issue lifecycle with release-on-cancel.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Accounting dependency. Inventory Issues and Transfers must not create journals, vouchers, valuation entries, ledger entries, receivables, or payables.
  - **Impact:** Silent absorption of Accounting semantics into Inventory would violate `MOD002_ACCOUNTING_BASELINE_v1`.
  - **Mitigation:** Enforce the Accounting Boundary (§1.1.5) at sprint gates; downstream accounting effects delivered by `SPR-MOD-005-005` via voucher-creation contracts.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Event Catalog gaps. The authoritative event catalog (`docs/02-architecture/event-catalog.md`) is currently a stub; every commercial Inventory Movement event surface enumerated in §11 is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register commercial Inventory Movement events via the event catalog governance process before downstream Inventory sprints consume them.
  - **Status:** Deferred

- **Risk ID:** R-08
  - **Description:** Cross-module contracts. Inventory Issues consume Sales Delivery evidence and `ProductionCompleted` evidence via approved repository contracts; downstream consumers (Accounting via `SPR-MOD-005-005`, Analytics) depend on Inventory Movement events.
  - **Impact:** Ambiguous consumption contracts would encourage parallel issue lifecycles in consuming modules.
  - **Mitigation:** Expose Inventory Issue and Inventory Transfer lifecycles exclusively via events and read APIs; enforce consumption boundaries at sprint gates.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** Movement numbering dependency. Commercial Inventory Issue and Inventory Transfer numbering consumes the numbering series registered in `SPR-MOD-005-001`. The repository-approved numbering engine (`ENG-017`) is present in Sprint 3 engine allocation per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) and in [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and is referenced by identifier accordingly.
  - **Impact:** Divergence from the registered numbering series would break document-number stability across the Inventory module.
  - **Mitigation:** Consume series registered in `SPR-MOD-005-001` via `ENG-017`; do not register new series here.
  - **Status:** Accepted

- **Risk ID:** R-10
  - **Description:** Movement authorization dependency. All commercial Inventory Issue and Inventory Transfer actions must be authorized under `ENG-002` per `ADR-032`. All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** Any bypass of `ENG-002`, or degradation of ADR acceptance status, would invalidate this sprint's contract.
  - **Mitigation:** Route every commercial Inventory Issue and Inventory Transfer action through `ENG-002`; re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — issue and transfer validation rules (referential integrity, tenancy, UoM consistency, quantity invariants, negative-stock policy consumption), reservation-release invariants, movement status transitions, partial/complete issue and transfer handling, Transfer Request emission and endpoint confirmation.
- **Integration** — audit emission via `ENG-004`, workflow transitions via `ENG-010`, rule evaluation via `ENG-012`, numbering via `ENG-017`, event publication via `ENG-024`, notifications via `ENG-025`, authorization via `ENG-002`, and document composition via `ENG-007`.
- **Contract** — commercial Inventory Movement event contracts against the event catalog (deferred under `R-EV-01`); Sales Delivery and `DeliveryDispatched` consumption contract against `SPR-MOD-003-003`; `ProductionCompleted` consumption contract against MOD-009; Warehouse confirmation contract at each transfer endpoint.
- **End-to-end (smoke)** — issue creation → validation → reservation → confirmation → complete → close under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation; transfer creation → Transfer Request emission → source confirmation → destination confirmation → complete → close under an inter-warehouse smoke fixture.

Sprint-specific fixtures: a two-company smoke fixture used to prove tenancy and ownership invariants across companies, a fixture emulating an approved Sales Delivery and `DeliveryDispatched` event from `SPR-MOD-003-003`, and a fixture emulating an approved `ProductionCompleted` event from MOD-009 Manufacturing.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the commercial Inventory Issue lifecycle and Inventory Transfer lifecycle as small state machines so audit emission (§5.18) and event publication (§5.20) are trivially satisfiable at every transition.
- Consider modeling the Reservation and Allocation facet as an explicit sub-state on the Inventory Issue Line rather than as scattered flags, so reservation-release invariants (§5.3) remain observable.
- Consider modeling Transfer Request as its own small lifecycle rather than as flags on the Inventory Transfer, so Warehouse confirmation semantics at each endpoint remain observable.
- Consider validating tenancy and referential integrity at the earliest boundary (input validation) so `ENG-012` rule evaluation runs against already-tenant-scoped data.
- Consider consuming Sales Delivery evidence and `ProductionCompleted` evidence strictly by reference (no denormalized copy of upstream fields) so upstream contract changes do not leak into Inventory business logic.
- Consider surfacing the Inventory Movement Ownership convention as a hard boundary in downstream module gates so `SPR-MOD-005-005` and Analytics consume events rather than write commercial issue or transfer state.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-005-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial Inventory Issue and Inventory Transfer lifecycle (including reservation and allocation state on issue lines) (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix (forward and reverse); every feature is tied to a `MOD-005` MODULE_PRD reference. No orphan requirements. Bidirectional mapping preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Inventory Movement Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists Sales, Manufacturing, Purchase, Warehouse, Accounting, Inventory Master, Inventory Receipt & Putaway, Adjustments, Counting, Lot/Serial, Valuation, Costing, Reorder, Posting, and Analytics, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes and includes explicit ownership-boundary invariants (§5.21) and the three verbatim boundary statements.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-005-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-005-004 Inventory Adjustments & Stock Counting` is the immediate successor per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-005-001` (and, transitively, on the commercial issue and transfer substrate delivered here).

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-005-001-inventory-foundation.md`](./SPR-MOD-005-001-inventory-foundation.md), [`./SPR-MOD-005-002-inventory-receipts-putaway.md`](./SPR-MOD-005-002-inventory-receipts-putaway.md)
- Sales Baseline (frozen) — [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- Purchase Baseline (frozen) — [`../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
