---
title: "SPR-MOD-003-003 — Delivery & Fulfillment"
summary: "Sprint PRD for the delivery and fulfillment lifecycle of MOD-003 Sales: delivery orders, pick and pack workflows, shipment readiness, partial and complete fulfillment, delivery completion, delivery numbering, delivery attachments, delivery notifications, and delivery lifecycle events. Consumes upstream layers (Platform, Accounting, Sales Foundation, Quotations & Sales Orders, and Inventory reservation contracts); never redefines them."
layer: "delivery"
owner: "Sales"
status: "Draft"
updated: "2026-07-07"
sprint_id: "SPR-MOD-003-003"
parent_module: "MOD-003"
parent_sprint_plan: "MOD-003_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "8.4.3"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-018", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "sales", "delivery", "fulfillment", "mod-003", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-003-003 — Delivery & Fulfillment

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-003 Sales** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-003-003` (permanent) |
| Parent Module | `MOD-003` — Sales |
| Parent Sprint Plan | [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (both frozen) |
| Upstream Sprints | [`SPR-MOD-003-001`](./SPR-MOD-003-001-sales-foundation.md), [`SPR-MOD-003-002`](./SPR-MOD-003-002-quotations-sales-orders.md) |
| Downstream Sprints | `SPR-MOD-003-004` … `SPR-MOD-003-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **delivery and fulfillment lifecycle** for BusinessOS Sales: delivery orders, pick and pack workflows, shipment readiness, partial and complete fulfillment, delivery completion, delivery numbering, delivery attachments, delivery notifications, and delivery lifecycle events. This sprint sits on top of the Quotations & Sales Orders sprint (`SPR-MOD-003-002`) and produces the fulfillment surface that downstream Sales sprints (invoicing, returns, analytics) will consume.

> **Sales Ownership Convention (reiterated).** The Sales module owns the business semantics of the commercial delivery lifecycle. ERP Core Engines provide shared infrastructure (authorization, audit, document, workflow, approval, rules, numbering, currency, eventing, notification) but **MUST NOT** redefine Sales delivery business rules. These conventions complement — and do not redefine — the Platform governance conventions established in `MOD001_PLATFORM_BASELINE_v1`, the Accounting ownership conventions established in `MOD002_ACCOUNTING_BASELINE_v1`, the Sales Foundation ownership established in `SPR-MOD-003-001`, or the commercial document lifecycle established in `SPR-MOD-003-002`.

#### 1.1.1 Delivery Ownership

The Delivery Order transaction and the commercial delivery lifecycle are authoritatively owned by MOD-003 Sales. Sales owns delivery orders, shipment readiness determination, fulfillment status, delivery completion, and customer delivery commitments. No other module MAY create, edit, approve, or cancel a delivery order. Downstream modules consume delivery data via published events and read APIs; they MUST NOT redefine the delivery commitment.

#### 1.1.2 Inventory Consumption Boundary

**MOD-005 Inventory** (module identifier resolved verbatim from [`docs/MODULE_CATALOG.md`](../../MODULE_CATALOG.md)) remains the authoritative owner of the item master, warehouse master, stock, the reservation engine, inventory movement, and stock valuation. Sales consumes inventory reservation contracts and stock availability references produced by Inventory; Sales MUST NOT redefine item master, warehouse, stock, reservation semantics, inventory movement, or stock valuation. No sprint deliverable performs a stock movement; stock movement remains an Inventory-owned activity triggered by consumption of the delivery events produced by this sprint.

#### 1.1.3 Commercial Fulfillment Boundary

Sales owns *what* is being delivered, *when* it is committed to the customer, and to *which* customer address — the commercial commitments. Inventory owns *whether* stock exists, *where* it sits, and *how* it moves — the physical operations. The split is enforced through consumption of Inventory-owned reservation contracts by Sales-owned delivery orders.

#### 1.1.4 Shipment Readiness

Shipment readiness is determined by Sales from three inputs: an approved sales order (per `SPR-MOD-003-002`), Inventory reservation state (consumed from `MOD-005`), and fulfillment validation rules resolved via `ENG-012`. Readiness determination is a Sales-owned decision. The decision does not, and MUST NOT, perform a stock movement.

#### 1.1.5 Accounting Boundary

Delivery completion MAY trigger downstream accounting workflows in a later Sprint PRD (e.g. invoicing in `SPR-MOD-003-004`), but this sprint MUST NOT create accounting vouchers, journals, ledger postings, tax computations, receivables entries, or payment records. Accounting ownership remains with `MOD002_ACCOUNTING_BASELINE_v1`; Sales-owned events published by this sprint are the boundary contract that downstream sprints consume.

### 1.2 In Scope

- Delivery order lifecycle: draft → prepared → picked → packed → ready → dispatched → completed, with amend and cancel transitions where the sales order and inventory state permit.
- Pick task lifecycle within a delivery order, coordinated via `ENG-010` Workflow.
- Pack task lifecycle within a delivery order, coordinated via `ENG-010` Workflow.
- Shipment readiness determination via `ENG-012` Rules against the approved sales order and Inventory reservation state (consumed from `MOD-005`).
- Partial and complete fulfillment, including preparation of a backorder placeholder for undelivered lines (backorder consumption sits with `SPR-MOD-003-002` amendments and downstream sprints).
- Delivery amendment (address, delivery date, quantity within amendment policy) with audit trail via `ENG-004`.
- Delivery approval routing via `ENG-011` Approval where amendment or exceptional-dispatch policy resolved via `ENG-012` requires it.
- Sales delivery-document numbering *consumption* (delivery order) via `ENG-017` (series registered in `SPR-MOD-003-001`).
- Multi-currency awareness on delivery order references via `ENG-018` (currency semantics consumed, not redefined).
- Document rendering hooks for delivery orders via `ENG-007`; delivery attachments via `ENG-008` are consumed from the attachment surface established in `SPR-MOD-003-002` and are not re-registered here.
- Notifications (prepared, ready, dispatched, completed, cancelled) via `ENG-025`.
- Delivery-lifecycle events (see §11) delivered via `ENG-024`.
- Authorization on every delivery-order action via `ENG-002` per `ADR-032`.
- Audit of every delivery-lifecycle transition via `ENG-004` per `ADR-014`.
- Tenant isolation of every delivery-order read and write per `ADR-011`.

### 1.3 Out of Scope

Reserved for later Sales sprints (see [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)) or owned by upstream/adjacent modules:

- Quotation lifecycle, sales order lifecycle, pricing/discount evaluation, credit-limit routing, order approval, order amendment — `SPR-MOD-003-002`.
- Sales invoice, credit note, debit note lifecycle, tax determination, receivables creation, invoice export, accounting voucher handoff — `SPR-MOD-003-004`.
- Sales returns and customer adjustments — `SPR-MOD-003-005`.
- Sales analytics, sales dashboards, sales KPIs, fulfillment analytics — `SPR-MOD-003-006`.
- Item master, warehouse master, stock, reservation semantics, inventory movement, stock valuation, bin-level operations, cycle counts — owned by `MOD-005` Inventory.
- Accounting vouchers, journal posting, ledger posting, taxation, receivables ledger, payments — owned by `MOD-002` Accounting; consumed via `MOD002_ACCOUNTING_BASELINE_v1`.
- Logistics provider / carrier integrations, tracking-number provisioning, external carrier events — deferred and not scoped to any Sales sprint by `MOD-003_SPRINT_PLAN.md`.
- Customer master, sales organization, salespersons, sales configuration, sales-document numbering *registration* — owned by `SPR-MOD-003-001`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-003-003`, the following will exist:

- **Business capabilities.**
  - A sales executive or order-desk operator can create, amend, and cancel delivery orders for an approved sales order under a tenant/company.
  - A warehouse user can execute pick tasks against a delivery order; a warehouse user can execute pack tasks against a delivery order.
  - A dispatch coordinator can validate shipment readiness, dispatch a ready delivery, and record delivery completion.
  - Partial fulfillment produces a completed delivery for shipped lines and preserves undelivered quantity for downstream backorder handling per Sales Order amendment policy (owned by `SPR-MOD-003-002`).
  - Delivery order documents consume the numbering series registered in `SPR-MOD-003-001` via `ENG-017`.
  - Notifications on prepared, ready, dispatched, completed, and cancelled transitions are dispatched via `ENG-025`.
- **Published events.** Delivery-lifecycle event contracts (see §11) are prepared for registration in the event catalog and emitted by the corresponding transitions. Any event name not present in the authoritative event catalog at authoring time is deferred under `R-EV-01` (§14).
- **Configuration artifacts.** Amendment policy, exceptional-dispatch policy, and notification configuration values resolve via `ENG-005` under the sales configuration namespace initialized in `SPR-MOD-003-001`. No new configuration keys are registered outside Sales' own ownership boundary.
- **Audit artifacts.** An audit record exists for every delivery-order lifecycle transition, produced via `ENG-004`.
- **Consumption contracts.** Inventory reservation references consumed from `MOD-005` and sales order references consumed from `SPR-MOD-003-002` are documented as read-only inputs. No Inventory-owned or Sales-Orders-owned entity is redefined.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-003-003`.
  - Delivery-lifecycle event entries referenced from §11 (subject to `R-EV-01` in §14).
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

> **Bidirectional traceability.** Every Sprint Deliverable SHALL trace to one or more sections of [`docs/20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md); no orphan requirements and no unallocated Module PRD capabilities that this sprint is chartered to deliver are permitted.

| MOD-003 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Delivery / dispatch | Delivery order lifecycle, pick/pack, shipment readiness, delivery completion (§2, §5) |
| §3 Personas — Order Desk, Sales Executive, Sales Manager, Warehouse User (system persona), Customer (external actor) | User stories (§4) |
| §4 Business Processes — Order-to-delivery | Sales-order → delivery → dispatch → completion pipeline (§5) |
| §6 Transactions — Delivery Note | Delivery order lifecycle and state transitions (§5) |
| §8 Integration Points — `InventoryReserved` consumed; delivery-lifecycle events published | Consumption of Inventory reservation references (§1.1.2, §7); events (§11) |
| §10 Configuration — Numbering series, Approval thresholds | Numbering consumed from Sales configuration namespace; amendment/exceptional-dispatch policy resolved via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Sales Module PRD, and no Sprint Deliverable is left un-traced.**

---

## 4. User Stories

- **US-001.** *As a sales executive, I want to create a delivery order against an approved sales order, so that the fulfillment lifecycle can begin for a customer commitment.*
- **US-002.** *As an order-desk operator, I want to amend a delivery order (address, delivery date, quantity within amendment policy) with an audit trail, so that legitimate delivery changes do not require a full re-approval when within amendment policy.*
- **US-003.** *As a warehouse user (system persona), I want to execute pick tasks for a delivery order, so that stock consumed against inventory reservations is prepared for packing.*
- **US-004.** *As a warehouse user (system persona), I want to execute pack tasks for a delivery order, so that a picked delivery can be packaged for dispatch.*
- **US-005.** *As a dispatch coordinator, I want shipment readiness to be validated deterministically against the approved sales order and Inventory reservation state, so that only complete, valid deliveries are dispatched.*
- **US-006.** *As a dispatch coordinator, I want to record delivery completion after dispatch, so that fulfillment status is authoritative and downstream sprints can react.*
- **US-007.** *As an order-desk operator, I want to fulfill an order partially, producing a completed delivery for shipped lines and preserving undelivered quantity for downstream backorder handling, so that customers can receive available goods without waiting for the full order.*
- **US-008.** *As a sales manager, I want delivery amendments and exceptional-dispatch cases (per policy resolved via `ENG-012`) to route for explicit approval through `ENG-011`, so that fulfillment risk is contained.*
- **US-009.** *As an inventory controller (external persona owned by `MOD-005`), I want the delivery events published by Sales to indicate consumption of an inventory reservation, so that Inventory can trigger the corresponding stock movement without ambiguity.*
- **US-010.** *As a downstream module (system persona), I want to receive `delivery.*` and related fulfillment events, so that I can react to delivery-lifecycle transitions in a decoupled way.*
- **US-011.** *As a security reviewer, I want every delivery-lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the delivery history from an authoritative log.*
- **US-012.** *As a customer (external actor, system persona), I want delivery orders to be rendered as documents I can receive, and delivery notifications to be dispatched at key transitions, so that fulfillment status is legible outside the system.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Delivery order creation (US-001, US-012)

- **Given** an approved sales order under an active tenant/company with an inventory reservation reference produced by `MOD-005`,
  **when** a sales executive submits a delivery order draft,
  **then** the delivery order is persisted, receives a stable identifier and a document number resolved via `ENG-017`, and remains in state `Draft`.
- **Given** a delivery order referencing a sales order that has been cancelled or is not yet approved,
  **when** creation is submitted,
  **then** the request is rejected and no delivery order is persisted.

### 5.2 Shipment readiness validation (US-005)

- **Given** a `Draft` delivery order,
  **when** shipment-readiness validation runs via `ENG-012` against the approved sales order and the consumed inventory reservation reference,
  **then** the delivery order transitions to `Prepared` when readiness rules are satisfied and remains in `Draft` otherwise; no stock movement is performed.
- **Given** a delivery order whose consumed inventory reservation is insufficient or expired,
  **when** readiness validation runs,
  **then** the delivery order does not advance past `Draft` and the failure reason is recorded via `ENG-004`.

### 5.3 Pick task completion (US-003)

- **Given** a `Prepared` delivery order,
  **when** a warehouse user completes pick tasks under `ENG-010`,
  **then** the delivery order transitions to `Picked` and a pick-completion audit record is produced via `ENG-004`.

### 5.4 Pack task completion (US-004)

- **Given** a `Picked` delivery order,
  **when** a warehouse user completes pack tasks under `ENG-010`,
  **then** the delivery order transitions to `Packed` and a pack-completion audit record is produced via `ENG-004`.

### 5.5 Ready and dispatch (US-005, US-006, US-012)

- **Given** a `Packed` delivery order,
  **when** a dispatch coordinator marks it ready and dispatches it,
  **then** the delivery order transitions to `Dispatched` and the corresponding delivery-lifecycle event (§11) is published via `ENG-024`.
- **Given** a `Dispatched` delivery order,
  **when** delivery completion is recorded,
  **then** the delivery order transitions to `Completed` and the delivery-completion event (§11) is published via `ENG-024`.

### 5.6 Partial fulfillment (US-007)

- **Given** an approved sales order for which only a subset of lines can be fulfilled from consumed inventory reservations,
  **when** a delivery order is created and dispatched for the fulfillable subset,
  **then** the delivery order completes for the shipped lines and undelivered quantity is preserved for downstream backorder handling per Sales Order amendment policy (owned by `SPR-MOD-003-002`); no Sales Order amendment policy is redefined here.

### 5.7 Amendment and approval routing (US-002, US-008)

- **Given** a delivery order not yet `Dispatched` and a valid amendment within amendment policy resolved via `ENG-005`,
  **when** the amendment is submitted,
  **then** the change is persisted, an audit record is produced via `ENG-004`, and the delivery-amended event (§11) is published.
- **Given** an amendment or exceptional-dispatch case whose policy (resolved via `ENG-012`) requires explicit approval,
  **when** approval is submitted,
  **then** the request routes through `ENG-011` Approval per `ADR-032` and cannot transition to `Dispatched` without an approval record.

### 5.8 Cancellation (US-002)

- **Given** a delivery order in any state prior to `Dispatched`,
  **when** cancellation is submitted,
  **then** the delivery order transitions to `Cancelled` and the delivery-cancelled event (§11) is published.
- **Given** a `Dispatched` or `Completed` delivery order,
  **when** cancellation is submitted,
  **then** the request is rejected; correction routes through Returns (`SPR-MOD-003-005`), not Delivery.

### 5.9 Numbering and notifications (US-001, US-012)

- **Given** a delivery-order transition that requires a document number,
  **when** it is executed,
  **then** the number resolves via `ENG-017` from the series registered in `SPR-MOD-003-001` and is unique within the tenant/company.
- **Given** any of the transitions Prepared / Ready / Dispatched / Completed / Cancelled,
  **when** it fires,
  **then** a notification is dispatched via `ENG-025` per the notification configuration resolved via `ENG-005`.

### 5.10 Inventory reservation consumption (US-009)

- **Given** any delivery-lifecycle transition that references an inventory reservation,
  **when** it is executed,
  **then** the reservation reference is consumed exclusively as a read-only input; no Sales deliverable creates, edits, cancels, or fulfills an Inventory-owned reservation, and no stock movement is performed by Sales.

### 5.11 Unauthorized fulfillment rejection (US-011)

- **Given** any delivery-order action,
  **when** it is submitted by a principal lacking the required permission under `ADR-032`,
  **then** `ENG-002` rejects the action and an audit record is produced via `ENG-004`.

### 5.12 Audit integration (US-011)

- **Given** any delivery-order lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, delivery-order identifier, transition type, and timestamp.

### 5.13 Isolation invariants (`ADR-011`)

- **Given** any delivery-order read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.14 Events (US-010)

- **Given** a delivery-lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the authoritative event catalog. Only event names present in the event catalog are used; unregistered names are deferred under `R-EV-01`.

### 5.15 Ownership consumption invariants

- **Given** any downstream module requiring delivery data,
  **when** it reads or reacts to delivery lifecycle,
  **then** it does so exclusively through Sales-owned events and read APIs. No downstream module creates an independent delivery commitment, and no Inventory-owned stock movement or reservation semantics is redefined by Sales.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-003` — Sales.
- **Module PRD:** [`docs/20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Delivery / dispatch), §3 (Order Desk, Sales Executive, Sales Manager, Warehouse User system persona, Customer external actor), §4 (Order-to-delivery), §6 (Delivery Note transaction), §8 (`InventoryReserved` consumed; delivery-lifecycle events published), §10 (Numbering series, Approval thresholds), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

> **Consumer module identifiers.** The consumer modules named in this section are identified by the authoritative module IDs recorded in [`docs/MODULE_CATALOG.md`](../../MODULE_CATALOG.md). If a consumer's module ID changes in the catalog, this section is corrected — the catalog remains the source of truth.

- **Parent:** `MOD-003` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting ownership boundary; delivery completion produces events consumed by later sprints but MUST NOT create accounting entries here.
- **Upstream sprints:**
  - [`SPR-MOD-003-001`](./SPR-MOD-003-001-sales-foundation.md) — Customer master, sales organization, salespersons, sales configuration namespace, sales-document numbering series registration.
  - [`SPR-MOD-003-002`](./SPR-MOD-003-002-quotations-sales-orders.md) — Approved sales order, order amendment policy, sales-order lifecycle events consumed here.
- **Upstream module consumption (read-only contracts):**
  - **MOD-005 Inventory** (per `docs/MODULE_CATALOG.md`) — inventory reservation references consumed for §5.2 shipment readiness and §5.10 consumption invariants; no reservation, stock, or item-master semantics are redefined here.
- **Downstream sprints:** `SPR-MOD-003-004` (Sales Invoicing), `SPR-MOD-003-005` (Returns & Customer Adjustments), `SPR-MOD-003-006` (Sales Analytics & Controls) — per [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md).
- **Downstream module consumers of delivery data** (identifiers resolved from `docs/MODULE_CATALOG.md`; consumption is exclusively via events and read APIs, no independent delivery commitment):
  - **MOD-005 Inventory** — consumes delivery-lifecycle events to trigger stock movement.
  - **MOD-002 Accounting** — consumes via the later invoicing sprint (`SPR-MOD-003-004`); no direct Accounting consumption in this sprint.
  - **MOD-017 Analytics** — consumes delivery events for fulfillment analytics (via `SPR-MOD-003-006`).
  - **MOD-010 Projects** — consumes delivery events where a project references a delivered commitment.
  - **MOD-006 CRM** — consumes delivery events for customer-facing status.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Sales Ownership Convention in §1.1). See each engine's specification for capability details. Consumption mirrors the Sprint 3 row of `MOD-003_SPRINT_PLAN.md` §4 verbatim.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every delivery-order action per `ADR-032`. |
| `ENG-004` Audit | Records every delivery-lifecycle transition per `ADR-014`. |
| `ENG-007` Document | Provides delivery-order document rendering hooks. |
| `ENG-010` Workflow | Drives pick, pack, ready, and dispatch coordination across the delivery-order lifecycle. |
| `ENG-011` Approval | Executes explicit approval for amendments and exceptional-dispatch cases resolved via `ENG-012`. |
| `ENG-012` Rules | Evaluates shipment-readiness, amendment, and exceptional-dispatch policy deterministically. |
| `ENG-017` Numbering | Consumes the delivery-document numbering series registered in `SPR-MOD-003-001` for delivery-order document numbers. |
| `ENG-018` Currency | Provides currency references on delivery-order lines derived from the referenced sales order; currency semantics are consumed, not redefined. |
| `ENG-024` Eventing | Publishes delivery-lifecycle events with the contracts declared in §11. |
| `ENG-025` Notification | Dispatches notifications on prepared, ready, dispatched, completed, and cancelled transitions. |

Sales delivery business semantics (delivery lifecycle, pick/pack coordination policy, shipment-readiness policy, amendment policy, partial-fulfillment policy) are owned by this module and are not delegated to any engine. Inventory reservation semantics, item master, stock, and inventory movement are consumed from `MOD-005` Inventory and are not redefined here.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every delivery-order read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for every delivery-lifecycle transition. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every delivery-order action, including approval routing. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Delivery Order | MOD-003 (this sprint) | Commercial delivery commitment created against an approved sales order under a tenant/company. |
| Delivery Order Line | MOD-003 (this sprint) | Line-level delivery commitment referencing an approved sales order line, an item (consumed from `MOD-005` Inventory), a quantity, and a fulfillment status. |
| Pick Task | MOD-003 (this sprint) | Task record produced during pick-workflow coordination via `ENG-010`. |
| Pack Task | MOD-003 (this sprint) | Task record produced during pack-workflow coordination via `ENG-010`. |
| Shipment Readiness Decision | MOD-003 (this sprint) | Decision record produced by `ENG-012` evaluation of shipment readiness. |
| Delivery Amendment | MOD-003 (this sprint) | Amendment record produced during delivery-order amend transitions. |
| Delivery Approval | MOD-003 (this sprint) | Approval decision record produced by `ENG-011` for amendments or exceptional dispatch. |
| Delivery Status | MOD-003 (this sprint) | Enumeration of delivery-order lifecycle states. |
| Inventory Reservation Reference | MOD-005 (reference-scoped) | Read-only reference to an Inventory-owned reservation consumed by delivery-order creation and readiness validation. |
| Sales Order Reference | MOD-003 / `SPR-MOD-003-002` (reference-scoped) | Read-only reference to an approved sales order and its lines consumed by delivery-order creation. |

### 10.2 Relationships

- A **sales order** (owned by `SPR-MOD-003-002`) is referenced by zero or more **delivery orders** within the same tenant/company.
- A **delivery order** owns one or more **delivery order lines**.
- A **delivery order line** references exactly one **sales order line** (read-only, owned by `SPR-MOD-003-002`) and one **item** (read-only, owned by `MOD-005`).
- A **delivery order** owns zero or more **pick tasks**, zero or more **pack tasks**, zero or more **shipment readiness decisions**, zero or more **delivery amendments**, and zero or more **delivery approvals**.
- A **delivery order** consumes zero or more **inventory reservation references** (read-only, owned by `MOD-005`) for readiness validation.

### 10.3 Ownership Boundaries

- All entities listed as "MOD-003 (this sprint)" are owned by `MOD-003` per the Sales Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Item master, warehouse master, stock, and inventory reservations are consumed from `MOD-005` Inventory; they are not represented as Sales-owned entities in this sprint.
- Customer master, sales organization, salespersons, and sales configuration are consumed from `SPR-MOD-003-001`; they are not redefined here.
- Approved sales orders, order lines, order amendment policy, and sales-order lifecycle events are consumed from `SPR-MOD-003-002`; they are not redefined here.
- Accounting vouchers, ledger posting, tax determination, and receivables remain with Accounting via `MOD002_ACCOUNTING_BASELINE_v1`.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

The Sales Module PRD §8 declares the delivery-lifecycle events as the illustrative business-level events for this bounded context. The lifecycle event contracts below are aligned to those business-level events under the Sales Ownership Convention. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is **not** modified by this sprint.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `delivery.prepared` | MOD-003 | SPR-MOD-003-003 | MOD-003 (self), MOD-005 (Inventory), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `delivery.picked` | MOD-003 | SPR-MOD-003-003 | MOD-003 (self), MOD-005, MOD-017 | At-least-once, ordered per tenant |
| `delivery.packed` | MOD-003 | SPR-MOD-003-003 | MOD-003 (self), MOD-005, MOD-017 | At-least-once, ordered per tenant |
| `delivery.dispatched` | MOD-003 | SPR-MOD-003-003 | MOD-003 (self), MOD-005, MOD-002 (Accounting, via later invoicing sprint), MOD-017, MOD-006 (CRM) | At-least-once, ordered per tenant |
| `delivery.completed` | MOD-003 | SPR-MOD-003-003 | MOD-003 (self), MOD-005, MOD-002 (via later invoicing sprint), MOD-017, MOD-010 (Projects), MOD-006 | At-least-once, ordered per tenant |
| `delivery.amended` | MOD-003 | SPR-MOD-003-003 | MOD-003 (self), MOD-005, MOD-017 | At-least-once, ordered per tenant |
| `delivery.cancelled` | MOD-003 | SPR-MOD-003-003 | MOD-003 (self), MOD-005, MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name above that is not present in the authoritative event catalog at authoring time is deferred via `R-EV-01` in §14 until registered through the event catalog governance process.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Delivery-order lifecycle transitions are coordinated by `ENG-010` and, where amendment or exceptional-dispatch policy triggers it, approval is enforced via `ENG-011` per §5.7.
- [ ] Shipment-readiness validation is deterministic against `ENG-012` rules and the consumed inventory reservation reference.
- [ ] Delivery-lifecycle events (§11) are registered in the event catalog with their contracts and are emitted on the corresponding transitions, or deferred via `R-EV-01`.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every delivery-order read and write.
- [ ] Every delivery-order lifecycle transition produces an audit record via `ENG-004` per `ADR-014`.
- [ ] Delivery-order document numbers resolve via `ENG-017` from the series registered in `SPR-MOD-003-001`.
- [ ] Notifications on prepared, ready, dispatched, completed, and cancelled are dispatched via `ENG-025`.
- [ ] No sprint deliverable performs a stock movement or redefines Inventory-owned reservation, item, warehouse, or stock semantics.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-003_SPRINT_PLAN.md` §2 (`SPR-MOD-003-003`):

- Delivery orders can be created, picked, packed, and dispatched through the fulfillment lifecycle.
- Inventory reservation contracts are consumed from MOD-005 Inventory without redefining inventory ownership.
- `DeliveryDispatched` event is published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable).

- **Risk ID:** R-01
  - **Description:** MOD-003 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen for tenancy, users/roles/permissions, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-003 depends on `MOD002_ACCOUNTING_BASELINE_v1` for the ownership boundary that keeps Sales delivery completion out of the accounting lifecycle.
  - **Impact:** Any weakening of Accounting ownership boundaries would allow Sales to accidentally absorb accounting behavior in this sprint.
  - **Mitigation:** Rely on the frozen `MOD002_ACCOUNTING_BASELINE_v1`; treat boundary regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-003 depends on `SPR-MOD-003-001` (Sales Foundation) for customer master, sales configuration, and sales-document numbering series registration, and on `SPR-MOD-003-002` (Quotations & Sales Orders) for the approved sales order contract and order amendment policy.
  - **Impact:** Any regression against `SPR-MOD-003-001` or `SPR-MOD-003-002` breaks this sprint's assumptions.
  - **Mitigation:** Rely on the authored state of the upstream Sales sprints; escalate as a sprint dependency defect if regression occurs.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Inventory ownership boundary — Sales consumes `MOD-005`-owned reservation references but MUST NOT redefine reservation, stock, item-master, warehouse, or inventory-movement semantics; no sprint deliverable performs a stock movement.
  - **Impact:** Silent absorption of Inventory-owned semantics would violate the Sales/Inventory split and diverge from `MOD-005`.
  - **Mitigation:** Restrict Sales-owned entities in §10 to Sales-scoped records; consume Inventory reservation references as read-only inputs; emit delivery events for Inventory to trigger stock movement.
  - **Status:** Accepted

- **Risk ID:** R-05
  - **Description:** Invoicing, returns, and analytics are deferred to `SPR-MOD-003-004` … `SPR-MOD-003-006`.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries and pollute the fulfillment layer.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Fulfillment complexity — pick, pack, ready, dispatch, and completion coordination via `ENG-010` can grow non-linearly with multi-warehouse or split-shipment scenarios.
  - **Impact:** Non-deterministic coordination would break §5 acceptance criteria and downstream event ordering.
  - **Mitigation:** Model the delivery-order lifecycle as an explicit state machine; bound coordination to what `ENG-010` supports deterministically; escalate patterns requiring new engine behavior as engine changes rather than absorbing them here.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Partial-fulfillment governance — partial delivery preserves undelivered quantity for downstream backorder handling, which sits with `SPR-MOD-003-002` amendment policy.
  - **Impact:** Loose governance would let backorder policy leak into the fulfillment layer and diverge from Sales Order amendment policy.
  - **Mitigation:** Restrict this sprint to producing a completed delivery for shipped lines only; forward undelivered quantity through the sales-order amendment surface owned by `SPR-MOD-003-002`; do not redefine amendment policy here.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Delivery-lifecycle event names declared in §11 (`delivery.prepared`, `delivery.picked`, `delivery.packed`, `delivery.dispatched`, `delivery.completed`, `delivery.amended`, `delivery.cancelled`) are not yet present in the authoritative event catalog at authoring time.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Map to an authoritative equivalent where one exists; otherwise register via the event catalog governance process before this sprint enters `In Progress`. The event catalog is not modified by this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — delivery-order state transitions; shipment-readiness rule determinism; amendment policy invariants; partial-fulfillment invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005` (for amendment and notification policy), rule evaluation via `ENG-012`, workflow via `ENG-010`, approval via `ENG-011`, numbering via `ENG-017`, event publication via `ENG-024`, notification dispatch via `ENG-025`.
- **Contract** — delivery-lifecycle event contracts against the event catalog; Inventory reservation reference contract against `MOD-005`.
- **End-to-end (smoke)** — end-to-end order-to-completed-delivery flow including a partial-fulfillment case and an amendment-approval case, under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: an inventory reservation reference stub (owned by `MOD-005`) used to prove §5.2 readiness and §5.10 consumption invariants without redefining Inventory-owned semantics.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the delivery-order lifecycle as an explicit state machine so audit emission (§5.12) and event publication (§5.14) are trivially satisfiable at every transition.
- Consider expressing shipment-readiness as a single `ENG-012` rule whose inputs are (sales-order approval status, consumed inventory reservation reference, delivery policy) so the decision is independently testable.
- Consider registering the delivery-lifecycle event names in the event catalog before this sprint enters `In Progress` (per `R-EV-01`), so downstream sprints subscribing to those events are not blocked.
- Consider bounding partial-fulfillment behavior to producing a completed delivery for shipped lines only and forwarding undelivered quantity through the `SPR-MOD-003-002` amendment surface, to keep backorder policy in one place.
- Consider co-locating pick and pack task coordination under a single `ENG-010` workflow definition so state ordering is enforceable at the workflow boundary rather than in ad-hoc code.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-003-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the delivery and fulfillment lifecycle — delivery orders, pick/pack, shipment readiness, partial and complete fulfillment, delivery completion — with audit and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-003` MODULE_PRD section and every Module PRD capability chartered to this sprint is covered. No orphan requirements and no unallocated chartered capabilities.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Sales Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists invoicing, returns, analytics, plus Accounting/Inventory/CRM-owned scope, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-003-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-003-004 Sales Invoicing` is the immediate successor per [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-003-003`.
8. **Are Inventory ownership boundaries preserved?**
   Yes. §1.1.2, §1.1.3, §1.1.4, §5.10, §5.15, §10.3, R-04. Sales consumes `MOD-005`-owned reservation references as read-only inputs; no stock movement is performed by any Sales deliverable and no Inventory-owned semantics is redefined.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md)
- Stage 1 Sprint Plan — [`./MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)
- Upstream sprints — [`./SPR-MOD-003-001-sales-foundation.md`](./SPR-MOD-003-001-sales-foundation.md), [`./SPR-MOD-003-002-quotations-sales-orders.md`](./SPR-MOD-003-002-quotations-sales-orders.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- ERP Core Engines — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
