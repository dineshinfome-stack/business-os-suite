---
title: "SPR-MOD-004-003 — Goods Receipt & Inspection"
summary: "Sprint PRD for the commercial goods receipt lifecycle: partial and complete receipt against open purchase orders, receipt validation, quantity verification, damage recording, inspection hold, acceptance and rejection, attachments, notifications, and commercial receipt events. Consumes SPR-MOD-004-002 Purchase Orders and upstream baselines; never redefines them; does not own inventory, warehouse, or accounting."
layer: "delivery"
owner: "Procurement"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-004-003"
parent_module: "MOD-004"
parent_sprint_plan: "MOD-004_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "8.6.3"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-018", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "purchase", "goods-receipt", "inspection", "mod-004", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-004-003 — Goods Receipt & Inspection

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-004 Purchase** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines, Accepted ADRs, the Purchase Orders established by `SPR-MOD-004-002`, and the Vendor Master established by `SPR-MOD-004-001`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-004-003` (permanent) |
| Parent Module | `MOD-004` — Purchase |
| Parent Sprint Plan | [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (all frozen) |
| Upstream Sprints | [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md), [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md) (originating supplier of Purchase Order capabilities) |
| Downstream Sprints | `SPR-MOD-004-004` … `SPR-MOD-004-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial goods receipt lifecycle** for BusinessOS: partial and complete receipt against open purchase orders, receipt validation, quantity verification, damage recording, inspection hold, acceptance and rejection, receipt completion, attachments, notifications, audit, and commercial receipt events. Sprint 3 owns the buyer-side commercial decision that goods have (or have not) been received against a supplier commitment. It is the substrate that vendor billing (`SPR-MOD-004-004`), returns (`SPR-MOD-004-005`), and analytics (`SPR-MOD-004-006`) depend on for GRN traceability.

> **Goods Receipt Ownership Convention.** MOD-004 Purchase owns the business semantics of the commercial goods receipt document lifecycle, receipt validation, quantity verification, damage recording, inspection hold, acceptance, and rejection. ERP Core Engines provide shared infrastructure (authorization, audit, document, attachment, workflow, approval, rules, numbering, currency, eventing, notification) but **MUST NOT** redefine goods receipt business rules. Downstream Purchase sprints consume commercial receipt context rather than reintroducing parallel goods receipt lifecycles. This complements — and does not redefine — the Purchase Ownership Convention established in `SPR-MOD-004-001`, the Purchase Document Ownership Convention established in `SPR-MOD-004-002`, and the ownership boundaries codified by `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, and `MOD003_SALES_BASELINE_v1`.

#### 1.1.1 Purchase Order Consumption (Upstream Dependency on SPR-MOD-004-002)

`SPR-MOD-004-002` SHALL be treated as the **originating supplier** of all Purchase Order capabilities consumed by Sprint 3. Sprint 3 SHALL consume Purchase Orders originating from `SPR-MOD-004-002` and SHALL NOT redefine Purchase Order ownership, PO lifecycle, PO approval routing, PO pricing/discount application, PO amendment lifecycle, or buyer-commitment semantics. Any PO attribute required for receipt validation, quantity verification, or line-level receipt matching is resolved from the Purchase Order established by `SPR-MOD-004-002`. This mirrors the explicit Foundation → Orders → Delivery → Invoicing dependency chain established in MOD-003 Sales.

#### 1.1.2 Inventory Consumption Boundary

Purchase SHALL request downstream inventory receipt through approved repository contracts. Inventory ownership remains exclusively with the Inventory module (`MOD-005`). Sprint 3 SHALL NOT:

- own inventory item master
- own stock balances or stock ledgers
- own warehouse operations, putaway, or bin management
- own stock valuation
- own inventory transactions or movements

Commercial receipt completion by Sprint 3 is a Purchase-domain business decision. Physical stock effect is executed by the Inventory module in response to a repository-defined receipt contract; Sprint 3 does not perform inventory transactions directly.

#### 1.1.3 Warehouse Boundary

Warehouse execution belongs to the Inventory / Warehouse module. Sprint 3 consumes warehouse confirmation signals (e.g. that physical goods arrived at a nominated location) but does not own warehouse layout, storage strategy, receiving-dock operations, or handling instructions. Warehouse-side confirmation is treated as an input to the commercial receipt decision, not as a capability owned here.

#### 1.1.4 Accounting Boundary

Sprint 3 SHALL NOT create:

- accounting vouchers
- journals
- ledger postings
- payables records
- accounting postings of any kind

Accounting ownership remains governed by [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md). Receipt completion is a commercial signal; any accounting effect (GR/IR, accruals, tax posting) is owned by Accounting and consumed by `SPR-MOD-004-004` (Vendor Billing & 3-Way Match).

#### 1.1.5 Inspection Boundary

Sprint 3 governs **commercial** inspection decisions only — accept, reject, hold pending inspection, and quantitative/damage findings as they affect the buyer-side receipt lifecycle. Physical inspection execution, laboratory workflow, quality-management-system (QMS) workflow, calibration, and sampling plans (where applicable) belong to Inventory or a future Quality module and are consumed, not redefined, here.

#### 1.1.6 Numbering Consumption

Goods receipt document numbering is consumed via `ENG-017` from a series registered by `SPR-MOD-004-001` (Purchase Foundation, purchase-document numbering series). Sprint 3 does not register a new numbering scheme; it consumes the repository-approved numbering engine allocated to Sprint 3 in [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-003`).

#### 1.1.7 Governance Complement

This Sprint PRD complements but SHALL NOT redefine:

- [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md)
- [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md)

### 1.2 In Scope

- **Goods Receipt lifecycle.** Creation of a goods receipt (GR) against one or more open purchase order lines; draft, submit, hold, accept, reject, complete, and cancel transitions.
- **Partial receipt.** A goods receipt MAY receive less than the ordered quantity of a PO line; remaining quantity remains open on the PO.
- **Complete receipt.** A goods receipt MAY receive the remaining open quantity of a PO line, closing the open quantity.
- **Receipt validation.** Validation that a GR references open PO lines, that received quantity does not exceed open PO quantity plus configured tolerance (per Module PRD §7), and that the referenced supplier and buyer are consistent with the PO.
- **Quantity verification.** Deterministic verification of received quantity against ordered quantity, including recording of quantity variance where present.
- **Damage recording.** Structured recording of damaged units observed at receipt, associated to the GR line.
- **Inspection hold.** Commercial hold state on a GR (or GR line) pending inspection outcome; deterministic transition into acceptance or rejection.
- **Acceptance.** Commercial acceptance of a GR or GR line, moving the receipt toward completion.
- **Rejection.** Commercial rejection of a GR or GR line, with structured rejection reason and audit.
- **Receipt completion.** Terminal state for a fully accepted receipt; the completion event drives downstream consumers.
- **Goods receipt numbering.** Consumption of the GRN numbering series via `ENG-017` from the series registered by `SPR-MOD-004-001`.
- **Attachments.** Attachment binding on GR documents via `ENG-008` (packing lists, delivery notes, inspection photos, damage evidence).
- **Notifications.** Buyer, receiving officer, inspection officer, and requester notifications on lifecycle transitions via `ENG-025`.
- **Audit.** Audit records for every GR lifecycle transition via `ENG-004`.
- **Commercial receipt events.** Publication of commercial receipt events via `ENG-024`, subject to authoritative event-catalog resolution (see §11 and `R-EV-01`).

### 1.3 Out of Scope

Reserved for later Purchase sprints (see [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)):

- Vendor bill / purchase invoice lifecycle, 3-way match arithmetic (PO ↔ GRN ↔ invoice), tax determination, payables creation contracts, accounting voucher handoff — `SPR-MOD-004-004`.
- Purchase returns and debit-note issuance (including physical return of previously-received goods) — `SPR-MOD-004-005`.
- Purchase analytics, spend analytics, PO ageing, supplier performance, price variance, 3-way match exception review — `SPR-MOD-004-006`.

Owned elsewhere and consumed only:

- Vendor Master, supplier categorisation, buyer master, purchasing organization, T&C master, purchase price list master, purchase configuration namespace, purchase-document numbering series registration — `SPR-MOD-004-001`.
- Purchase Requisition, RFQ, Vendor Quotation, Quote Comparison, and Purchase Order lifecycles; PO approval routing; PO amendments; commercial pricing/discount application on the PO chain — `SPR-MOD-004-002`.
- Accounting vouchers, journal posting, ledger posting, taxation calculation, payables ledger, payment execution, accounting period governance — MOD-002 Accounting via `MOD002_ACCOUNTING_BASELINE_v1`.
- Inventory item master, stock ledger, putaway, bin management, stock valuation, warehouse operations, inventory transactions and movements — MOD-005 Inventory.
- Physical inspection execution, quality-management-system workflow, laboratory and sampling — MOD-005 Inventory / future Quality module.
- Customer master and sales-side lifecycles — MOD-003 Sales via `MOD003_SALES_BASELINE_v1`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-004-003`, the following will exist:

- **Business capabilities.**
  - A receiving officer can create a goods receipt against one or more open PO lines under a tenant/company, driving it through draft, submit, hold, accept, reject, complete, and cancel transitions.
  - Partial and complete receipt scenarios are supported; remaining open PO quantity is tracked deterministically.
  - Receipt validation enforces the PO tolerance rule (Module PRD §7) via `ENG-012`.
  - Quantity verification records ordered vs received quantity and any variance per GR line.
  - Damage recording is available per GR line, with structured reason and evidence attachment.
  - Inspection hold, acceptance, and rejection are first-class commercial states with deterministic transitions.
  - Attachments bind to GR documents via `ENG-008`; notifications reach buyers, receiving officers, and inspection officers via `ENG-025`.
  - GRN numbering is consumed via `ENG-017` from the series registered by `SPR-MOD-004-001`.
- **Published events.** Commercial receipt event contracts (see §11) registered in the event catalog and emitted by the corresponding lifecycle transitions. `GoodsReceived` is published on receipt completion (Module PRD §8, Sprint Plan §2 `SPR-MOD-004-003` Exit Criteria).
- **Audit artifacts.** An audit record exists for every GR lifecycle transition, produced via `ENG-004`.
- **Downstream contracts.** Receipt completion emits repository-defined receipt completion events that Inventory MAY subscribe to for downstream inventory receipt through approved repository contracts; Sprint 3 SHALL NOT perform inventory transactions directly.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-004-003`.
  - Commercial receipt event entries in the event catalog referenced from §11.
- **Downstream forward references.** Deliverables produced here are consumed by `SPR-MOD-004-004` (GRN context for 3-way match), `SPR-MOD-004-005` (GRN traceability for returns), and `SPR-MOD-004-006` (analytics inputs).
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

Bidirectional traceability. Every Sprint-3 capability traces back to an approved MOD-004 Module PRD section, and every relevant Module PRD section covered by Sprint 3 traces forward to a deliverable below. No Sprint-3 capability is orphaned from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-003`); unique originating allocation is preserved (no capability delivered here is also allocated to another Purchase sprint).

| MOD-004 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Goods receipt and inspection | Goods receipt lifecycle, inspection hold, acceptance, rejection (§1.2, §5) |
| §2 Submodule — GRN | Conceptual data model (§10), lifecycle (§5) |
| §3 Personas — Buyer, Procurement Manager, Stores Officer | User stories (§4) |
| §4 Business Processes — PO-to-GRN | End-to-end lifecycle acceptance criteria (§5) |
| §6 Transactions — Goods Receipt Note | Conceptual data model (§10) |
| §7 Business Rules — GRN quantity cannot exceed open PO quantity plus configured tolerance | Rule binding via `ENG-012` (§5.4) |
| §8 Integration Points — `GoodsReceived` (published); `InventoryLowStock` (consumed) | Events (§11) |
| §10 Configuration — Tolerance settings for match | Tolerance evaluation via `ENG-012` on rules registered by `SPR-MOD-004-001` (§5.4) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Purchase Module PRD, and no capability allocated to Sprint 3 in `MOD-004_SPRINT_PLAN.md` is orphaned from this Sprint PRD** (unique originating allocation preserved).

---

## 4. User Stories

- **US-001.** *As a receiving officer, I want to create a goods receipt against one or more open PO lines, so that I can record what physically arrived from the supplier under a company.*
- **US-002.** *As a receiving officer, I want partial receipts to leave the remaining PO quantity open, so that later shipments against the same PO can be received without re-authoring the PO.*
- **US-003.** *As a receiving officer, I want a receipt to be validated against open PO quantity and configured tolerance, so that over-receipt is rejected deterministically.*
- **US-004.** *As a warehouse coordinator, I want to record damaged units and quantity variance at receipt, so that downstream decisions (inspection, return, invoice matching) are objective.*
- **US-005.** *As an inspection officer, I want to place a receipt (or a line) on inspection hold with a structured reason, so that acceptance decisions are made deliberately and are auditable.*
- **US-006.** *As a procurement manager, I want to accept or reject a receipt (or a line) with a structured reason, so that commercial receipt decisions are traceable and reversible only through explicit re-review.*
- **US-007.** *As a purchase executive, I want notifications on receipt lifecycle transitions and the ability to attach delivery notes, packing lists, and inspection photos, so that supporting evidence is preserved.*
- **US-008.** *As a branch manager, I want every receipt to be scoped to my tenant/company, so that isolation invariants are preserved.*
- **US-009.** *As a downstream module (system persona), I want to receive commercial receipt completion events, so that vendor billing, returns, analytics, and inventory can react deterministically through approved repository contracts.*
- **US-010.** *As a system administrator, I want every commercial-document lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the receipt history from an authoritative log.*

Each user story traces to exactly one Sprint Deliverable in §2.

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

**Ownership invariants.** In addition to the scenario-level criteria below, the following two invariants apply globally to every commercial receipt handled by this sprint:

- Commercial receipt SHALL NOT modify inventory ownership.
- Commercial receipt completion MAY emit repository-defined receipt completion events and SHALL request downstream inventory receipt through approved repository contracts, but SHALL NOT perform inventory transactions directly.

### 5.1 Goods Receipt creation (US-001)

- **Given** an open purchase order under an active company, with one or more open PO lines,
  **when** a receiving officer creates a goods receipt referencing that PO,
  **then** the GR is persisted with a stable identifier, its number is consumed from the GRN series via `ENG-017`, and the transition is audited via `ENG-004`.
- **Given** a goods receipt in an editable state,
  **when** a receiving officer edits allowed fields (received quantity, remarks, attachments, damage records),
  **then** the update is persisted and audited.

### 5.2 Partial and complete receipt (US-002)

- **Given** a goods receipt with received quantity strictly less than the open PO line quantity (within tolerance),
  **when** it is submitted and accepted,
  **then** the received quantity closes only that portion of the PO line, and the remaining open PO quantity remains available for later receipts.
- **Given** a goods receipt with received quantity equal to the remaining open PO line quantity,
  **when** it is submitted and accepted,
  **then** the PO line's open quantity becomes zero and the PO line is treated as fully received.

### 5.3 Receipt validation — PO consistency (US-001)

- **Given** a goods receipt draft,
  **when** it is submitted,
  **then** the GR is validated to reference open PO lines, and the supplier and buyer on the GR are validated to be consistent with the PO; inconsistencies are rejected deterministically and the rejection is audited.

### 5.4 Quantity verification and tolerance rule (US-003, US-004)

- **Given** a configured PO tolerance (Module PRD §7) resolved via the rule set registered by `SPR-MOD-004-001`,
  **when** received quantity exceeds `open PO quantity + tolerance` for a GR line,
  **then** the GR line is rejected deterministically via `ENG-012` and the rejection is audited.
- **Given** received quantity within tolerance but not equal to ordered quantity,
  **when** the GR line is submitted,
  **then** a quantity variance is recorded on the GR line and is available for downstream 3-way match (`SPR-MOD-004-004`).

### 5.5 Damage recording (US-004)

- **Given** a GR line with damaged units observed at receipt,
  **when** the receiving officer records damage with a structured reason,
  **then** the damage record is persisted, associated to the GR line, and audited; damage evidence MAY be attached via `ENG-008`.

### 5.6 Inspection hold, acceptance, and rejection (US-005, US-006)

- **Given** a submitted goods receipt (or GR line) that requires inspection,
  **when** an inspection officer places it on inspection hold with a structured reason,
  **then** the receipt (or line) transitions to inspection hold and the transition is audited; notifications are dispatched via `ENG-025`.
- **Given** a receipt (or line) on inspection hold,
  **when** the inspection outcome is recorded as accepted,
  **then** the receipt (or line) transitions toward completion and audit and event records are produced.
- **Given** a receipt (or line) on inspection hold,
  **when** the inspection outcome is recorded as rejected with a structured rejection reason,
  **then** the receipt (or line) transitions to rejected, no downstream inventory-receipt contract is emitted for the rejected quantity, and the rejection is audited.

### 5.7 Receipt completion (US-006, US-009)

- **Given** a goods receipt whose lines are all accepted (with any variance recorded and damaged units resolved),
  **when** completion is submitted,
  **then** the receipt transitions to completed, `GoodsReceived` is published via `ENG-024`, and the completion is audited.
- **Given** a completed goods receipt,
  **when** downstream consumers (Inventory, Vendor Billing, Analytics) subscribe to receipt completion events,
  **then** the events are delivered under the repository-approved contract (see §11); Sprint 3 SHALL NOT perform inventory transactions directly.

### 5.8 Attachments (US-007)

- **Given** a goods receipt in an editable or submitted state,
  **when** an actor attaches a file (packing list, delivery note, inspection photo, damage evidence),
  **then** the attachment binds via `ENG-008` and is audited.

### 5.9 Notifications (US-007)

- **Given** a lifecycle transition on a goods receipt (submit, hold, accept, reject, complete, cancel),
  **when** it completes,
  **then** the configured notifications are dispatched via `ENG-025` to buyer, receiving officer, and (where applicable) inspection officer roles.

### 5.10 Authorization (US-008)

- **Given** any GR action (create, edit, submit, hold, accept, reject, complete, cancel, attach),
  **when** it is invoked,
  **then** authorization is enforced via `ENG-002` per `ADR-032` (RBAC + ABAC), and unauthorized actions are rejected without side effects.

### 5.11 Audit integration (US-010)

- **Given** any GR lifecycle transition (create, edit, submit, hold, accept, reject, complete, cancel),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp, per `ADR-014`.

### 5.12 Tenant isolation invariants (`ADR-011`)

- **Given** any GR read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.13 Commercial receipt events (US-009)

- **Given** a commercial receipt lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used; unresolved names are recorded as deferred `R-EV-*` risks in §14.

### 5.14 Ownership consumption invariants

- **Given** any goods receipt authored under this sprint,
  **when** it references supplier, buyer, or PO entities,
  **then** it does so exclusively through masters established by `SPR-MOD-004-001` (Vendor Master) and `SPR-MOD-004-002` (Purchase Order). No parallel supplier, buyer, or PO master is introduced here, and no inventory transaction, warehouse operation, or accounting posting is authored here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-004` — Purchase.
- **Module PRD:** [`docs/20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Goods receipt and inspection; GRN submodule), §3 (Buyer, Procurement Manager, Stores Officer), §4 (PO-to-GRN), §6 (Goods Receipt Note), §7 (GRN tolerance rule), §8 (`GoodsReceived` — published; `InventoryLowStock` — consumed), §10 (Tolerance settings for match), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-004` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting ownership conventions. Sprint 3 MUST NOT create accounting journals, ledger entries, payables records, or tax postings.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Customer master ownership boundary. Sprint 3 MUST NOT reference customer entities on procurement documents.
- **Upstream sprint dependencies:**
  - [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md) — Purchase Foundation (Vendor Master, buyer master, purchasing organization, purchase-document numbering series, purchase configuration namespace, tolerance rule registration).
  - [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md) — Requisitions, RFQs & Purchase Orders. **`SPR-MOD-004-002` SHALL be treated as the originating supplier of Purchase Order capabilities. Sprint 3 SHALL consume Purchase Orders originating from `SPR-MOD-004-002` and SHALL NOT redefine Purchase Order ownership.** This mirrors the explicit Foundation → Orders → Delivery → Invoicing dependency chain established in MOD-003 Sales.
  - [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) — Sprint 3 allocation.
- **Downstream sprints:** `SPR-MOD-004-004` (Vendor Billing & 3-Way Match — consumes GRN context), `SPR-MOD-004-005` (Purchase Returns & Debit Notes — consumes GRN traceability), `SPR-MOD-004-006` (Purchase Analytics & Controls — consumes commercial receipt data and events).
- **Downstream module consumers of Sprint-3 events:** `MOD-004` (self, subsequent sprints), `MOD-005` Inventory (subscribes to receipt completion events through approved repository contracts for downstream inventory receipt; Sprint 3 does not perform inventory transactions directly), `MOD-002` Accounting (indirectly via `SPR-MOD-004-004` for GR/IR handoff), `MOD-017` Analytics — consuming exclusively via events and read APIs. Module identifiers resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md).

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Goods Receipt Ownership Convention in §1.1). See each engine's specification for capability details.

One-line usage note per engine. Every engine identifier SHALL resolve verbatim from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 3 allocation in [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-003`). No placeholder, deprecated, undefined, or additional engine identifiers are permitted.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every GR lifecycle action (create, edit, submit, hold, accept, reject, complete, cancel, attach). |
| `ENG-004` Audit | Records every GR lifecycle transition with actor, tenant/company scope, entity identifier, transition type, and timestamp. |
| `ENG-007` Document | Provides the commercial-document primitive (identifier, header/line structure, lifecycle scaffolding) used by the Goods Receipt Note. |
| `ENG-008` Attachment | Binds packing lists, delivery notes, inspection photos, and damage evidence to GR documents. |
| `ENG-010` Workflow | Drives GR lifecycle transitions (draft → submit → hold → accept / reject → complete / cancel). |
| `ENG-011` Approval | Routes inspection hold and rejection decisions where multi-actor concurrence is configured. |
| `ENG-012` Rules | Evaluates the GRN-quantity-vs-open-PO tolerance rule (Module PRD §7) at GR submission. |
| `ENG-017` Numbering | Consumes the GRN numbering series registered by `SPR-MOD-004-001`. |
| `ENG-018` Currency | Resolves document currency on the GR for supplier-facing reporting; currency semantics are consumed, not redefined. |
| `ENG-024` Eventing | Publishes commercial receipt events (`GoodsReceived` and lifecycle events) with the contracts declared in §11. |
| `ENG-025` Notification | Dispatches buyer, receiving officer, and inspection officer notifications on lifecycle transitions. |

Purchase business semantics (GR lifecycle, receipt validation, quantity verification, damage recording, inspection hold, acceptance, rejection, receipt completion) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Identifiers resolve verbatim from [`ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md).

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every GR read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to GR actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Goods Receipt | MOD-004 (this sprint) | Header for a commercial receipt of goods under a company against one or more open PO lines. |
| Goods Receipt Line | MOD-004 (this sprint) | Line item on a GR referencing exactly one open PO line and recording received quantity. |
| Receipt Status | MOD-004 (this sprint) | Deterministic state on a GR or GR line (draft, submitted, on inspection hold, accepted, rejected, completed, cancelled). |
| Inspection Result | MOD-004 (this sprint) | Commercial inspection outcome (accept/reject) recorded against a GR or GR line, with structured reason. |
| Inspection Hold | MOD-004 (this sprint) | Structured hold record on a GR or GR line pending inspection outcome. |
| Quantity Variance | MOD-004 (this sprint) | Difference between ordered and received quantity on a GR line, retained for downstream 3-way match. |
| Damage Record | MOD-004 (this sprint) | Structured record of damaged units observed at receipt, associated to a GR line. |
| Receipt Attachment | MOD-004 (this sprint) | Attachment binding on a GR (packing list, delivery note, inspection photo, damage evidence) via `ENG-008`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **goods receipts**.
- A **goods receipt** has one or more **goods receipt lines**; each GR line references exactly one open PO line owned by `SPR-MOD-004-002`.
- A **goods receipt** and each of its lines carry a **receipt status**; state transitions are audited.
- A **goods receipt** or GR line MAY have zero or more **inspection holds** and at most one prevailing **inspection result** at any time.
- A **goods receipt line** MAY have zero or one **quantity variance** record and zero or more **damage records**.
- A **receipt attachment** belongs to exactly one goods receipt.
- Supplier and buyer references resolve against the Vendor Master and buyer master owned by `SPR-MOD-004-001`; PO references resolve against `SPR-MOD-004-002`; item references resolve against the Inventory item master (MOD-005) transitively via the PO line.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-004` per the Goods Receipt Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- **Inventory item master, stock ledger, putaway, bin management, stock valuation, warehouse operations, and inventory transactions/movements are NOT represented here** — owned by MOD-005 Inventory. Any physical stock effect is executed by Inventory in response to a repository-defined receipt contract; Sprint 3 does not perform inventory transactions directly.
- **Accounting journals, ledger entries, payables balances, tax postings, and payment records are NOT represented here** — owned by MOD-002 Accounting.
- Customer master is NOT represented here — owned by MOD-003 Sales.
- Vendor Master, supplier categorisation, buyer master, purchasing organization, T&C master, purchase price list master, and purchase configuration namespace are consumed from `SPR-MOD-004-001` and are NOT redefined here.
- Purchase Requisition, RFQ, Vendor Quotation, Quote Comparison, and Purchase Order are consumed from `SPR-MOD-004-002` and are NOT redefined here.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Only event names present verbatim in the authoritative event catalog are used. Any illustrative event below that does not resolve at authoring time is either replaced with its authoritative equivalent or deferred as `R-EV-*` in §14. The Event Catalog is **not** modified by this sprint. `GoodsReceived` is declared verbatim from `MOD-004` Module PRD §8 and from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-003`) Sprint Exit Criteria.

| Event Name (subject to catalog resolution) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `GoodsReceived` | MOD-004 | SPR-MOD-004-003 | MOD-004 (self, downstream sprints), MOD-005 (Inventory — downstream inventory receipt via approved repository contract), MOD-002 (Accounting — indirectly via SPR-MOD-004-004), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `goods-receipt.created` | MOD-004 | SPR-MOD-004-003 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `goods-receipt.submitted` | MOD-004 | SPR-MOD-004-003 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `goods-receipt.inspection-held` | MOD-004 | SPR-MOD-004-003 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `goods-receipt.accepted` | MOD-004 | SPR-MOD-004-003 | MOD-004 (self, downstream sprints), MOD-017 | At-least-once, ordered per tenant |
| `goods-receipt.rejected` | MOD-004 | SPR-MOD-004-003 | MOD-004 (self, downstream sprints), MOD-017 | At-least-once, ordered per tenant |
| `goods-receipt.completed` | MOD-004 | SPR-MOD-004-003 | MOD-004 (self, downstream sprints), MOD-005, MOD-017 | At-least-once, ordered per tenant |
| `goods-receipt.cancelled` | MOD-004 | SPR-MOD-004-003 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14.

**Consumed events.** `InventoryLowStock` (per Module PRD §8) is consumed where relevant to inform buyer decisions; Sprint 3 does not own or publish this event.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Commercial receipt events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every GR read and write.
- [ ] Every GR lifecycle transition produces an audit record via `ENG-004`.
- [ ] GRN quantity vs open PO tolerance rule (Module PRD §7) is enforced via `ENG-012`.
- [ ] Inspection hold, acceptance, and rejection are first-class commercial states with deterministic transitions.
- [ ] GRN numbering is consumed via `ENG-017` from the series registered by `SPR-MOD-004-001`.
- [ ] Attachments bind via `ENG-008`; notifications dispatch via `ENG-025` on configured transitions.
- [ ] No inventory transaction, warehouse operation, or accounting posting is authored by this sprint; downstream inventory receipt is requested only through approved repository contracts.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-003`):

- Goods receipt notes can be created against open POs and driven through the inspection lifecycle.
- Tolerance validation is enforced via `ENG-012` per Module PRD §7.
- Warehouse handover contracts are produced for consumption by MOD-005 Inventory without redefining inventory ownership.
- `GoodsReceived` event is published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable).

- **Risk ID:** R-01
  - **Description:** Inventory dependency — MOD-005 Inventory is not yet baselined; Sprint 3 requests downstream inventory receipt through repository contracts that will materialise when Inventory is authored.
  - **Impact:** Contract drift between Purchase and Inventory could break downstream inventory receipt.
  - **Mitigation:** Emit only repository-defined receipt completion events; do not perform inventory transactions directly; treat Inventory-side contract changes as governance events, not silent absorption.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Warehouse dependency — warehouse execution belongs to MOD-005 / a future Warehouse module and is not owned here.
  - **Impact:** If warehouse confirmation signals change materially, GR-side interpretation of "goods arrived" may need reconciliation.
  - **Mitigation:** Consume warehouse confirmation only; do not embed warehouse execution semantics in GR logic.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Accounting dependency — GR completion is a commercial signal only; any accounting effect (GR/IR, accruals, tax posting) is owned by Accounting and consumed by `SPR-MOD-004-004`.
  - **Impact:** Sprint 3 accidentally introducing accounting-adjacent semantics would violate Accounting ownership.
  - **Mitigation:** No journal, ledger, tax, or payables logic is introduced here; accounting effects are consumed via `MOD002_ACCOUNTING_BASELINE_v1` in `SPR-MOD-004-004`.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Purchase Order dependency — Sprint 3 consumes open PO context authored by `SPR-MOD-004-002`.
  - **Impact:** Regression against the PO contract (line semantics, open-quantity accounting, amendment lifecycle) would block GR authoring.
  - **Mitigation:** Consume PO context read-only; treat any regression as a `SPR-MOD-004-002` defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Inspection governance — commercial inspection decisions must remain deterministic and separable from physical inspection execution (owned by Inventory / future Quality).
  - **Impact:** Blurring of the boundary would leak QMS/laboratory workflow into Purchase and undermine ownership boundaries.
  - **Mitigation:** Sprint 3 governs commercial inspection outcomes only (accept, reject, hold with reason); physical execution is consumed as an input signal.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Cross-module contract drift — downstream sprints (`SPR-MOD-004-004`, `SPR-MOD-004-005`, `SPR-MOD-004-006`) and MOD-005 Inventory consume Sprint-3 events and GRN context.
  - **Impact:** Changes to event payloads or GRN state semantics after Sprint 3 completes would ripple downstream.
  - **Mitigation:** Publish event contracts through the authoritative catalog; treat contract changes as catalog governance events.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Supplier shipment discrepancy — variances between supplier despatch documentation and physical arrival (short shipment, over-shipment, damaged units, wrong item) drive commercial receipt decisions and downstream 3-way match.
  - **Impact:** Undocumented or inconsistently recorded discrepancies corrupt spend analytics and invoice matching (`SPR-MOD-004-004`).
  - **Mitigation:** Record quantity variance and damage per GR line with structured reasons; enforce PO tolerance rule via `ENG-012`; audit every discrepancy via `ENG-004`.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Receiving document numbering dependency — Sprint 3 consumes the GRN numbering series registered by `SPR-MOD-004-001` via `ENG-017` (allocated to Sprint 3 in `MOD-004_SPRINT_PLAN.md` §2).
  - **Impact:** Regression in the numbering series registration or in `ENG-017` allocation would block GR authoring and audit reconstruction.
  - **Mitigation:** Consume the repository-approved numbering engine only; treat any regression as a Foundation / numbering-engine defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** The authoritative event catalog is currently a stub. Every event name declared in §11 — including `GoodsReceived` (verbatim from Module PRD §8) and the `goods-receipt.*` lifecycle events — is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before Purchase Sprint 4 begins consuming these events. The Event Catalog is not modified by this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — GR lifecycle invariants; partial vs complete receipt arithmetic; tolerance rule binding; inspection hold / acceptance / rejection transitions; damage record persistence; quantity variance capture.
- **Integration** — audit emission via `ENG-004`; document primitive via `ENG-007`; attachment binding via `ENG-008`; workflow via `ENG-010`; approval routing via `ENG-011`; rule evaluation via `ENG-012`; numbering consumption via `ENG-017`; currency via `ENG-018`; event publication via `ENG-024`; notification dispatch via `ENG-025`.
- **Contract** — commercial receipt event contracts against the event catalog for `GoodsReceived` and `goods-receipt.*` lifecycle events; repository-approved downstream inventory-receipt contract consumed by MOD-005.
- **End-to-end (smoke)** — PO → partial GR → complete GR → inspection hold → accept → complete under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation and tolerance rule enforcement.

Sprint-specific fixtures: a two-company smoke fixture with a pre-seeded Vendor Master (from `SPR-MOD-004-001`), open POs (from `SPR-MOD-004-002`), and configured tolerance thresholds used to prove tenancy, tolerance enforcement, and inspection-hold invariants.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the GR and GR-line lifecycles as small state machines so audit emission (§5.11) and event publication (§5.13) are trivially satisfiable at every transition.
- Consider carrying quantity variance and damage records as first-class GR-line children so 3-way match arithmetic (`SPR-MOD-004-004`) can consume them without recomputation.
- Consider isolating the downstream inventory-receipt contract behind an explicit repository boundary so the "no inventory transactions directly" invariant is enforced structurally.
- Consider guarding the PO tolerance evaluation behind an explicit rule identifier registered by `SPR-MOD-004-001`, so the enforcement path is diagnosable.
- Consider mapping `GoodsReceived` and the `goods-receipt.*` events to authoritative catalog names as soon as `R-EV-01` is resolved.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-004-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial goods receipt lifecycle: partial/complete receipt, validation, quantity verification, damage recording, inspection hold, acceptance, rejection, and completion (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-004` MODULE_PRD section. No orphan requirements. Bidirectional mapping preserved; unique originating allocation preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Goods Receipt Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists vendor billing, returns, analytics, plus Accounting/Inventory/Sales-owned scope and Purchase Foundation + PO scope, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes and explicit ownership invariants.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-004-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-004-004 Vendor Billing & 3-Way Match` is the immediate successor per [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-004-003`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)
- Upstream Sprint — [`./SPR-MOD-004-001-purchase-foundation.md`](./SPR-MOD-004-001-purchase-foundation.md)
- Upstream Sprint — [`./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
