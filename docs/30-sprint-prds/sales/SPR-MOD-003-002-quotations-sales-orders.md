---
title: "SPR-MOD-003-002 — Quotations & Sales Orders"
summary: "Sprint PRD for the commercial document lifecycle of MOD-003 Sales: quotation lifecycle, sales order lifecycle, pricing and discount evaluation, credit-limit approval routing, order amendments, numbering, attachments, notifications, and sales-order events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Sales"
status: "Draft"
updated: "2026-07-07"
sprint_id: "SPR-MOD-003-002"
parent_module: "MOD-003"
parent_sprint_plan: "MOD-003_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "8.4.2"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-018", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "sales", "mod-003", "quotations", "sales-orders", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-003-002 — Quotations & Sales Orders

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-003 Sales** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-003-002` (permanent) |
| Parent Module | `MOD-003` — Sales |
| Parent Sprint Plan | [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (both frozen) |
| Upstream Sprint | [`SPR-MOD-003-001`](./SPR-MOD-003-001-sales-foundation.md) — Sales Foundation |
| Downstream Sprints | `SPR-MOD-003-003` … `SPR-MOD-003-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial document lifecycle** for BusinessOS Sales: quotation lifecycle, sales order lifecycle, pricing and discount evaluation, credit-limit approval routing, order amendments and cancellations, sales-document numbering consumption, attachments, notifications, and sales-order lifecycle events. This sprint sits on top of the Sales Foundation (`SPR-MOD-003-001`) and produces the commercial commitments that downstream Sales sprints (delivery, invoicing, returns, analytics) will consume.

> **Sales Ownership Convention (reiterated).** The Sales module owns the business semantics of quotations, sales orders, pricing/discount evaluation, order approval, and order amendment. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, document, attachment, workflow, approval, rules, numbering, currency, eventing, notification) but **MUST NOT** redefine sales business rules. These conventions complement — and do not redefine — the Platform governance conventions and the Accounting ownership conventions established in `MOD002_ACCOUNTING_BASELINE_v1`, or the Sales Foundation ownership established in `SPR-MOD-003-001`.

#### 1.1.1 Commercial Document Authority

The Quotation and Sales Order transactions are authoritatively owned by MOD-003 Sales. No other module MAY create, edit, approve, or cancel quotations or sales orders. Downstream modules consume order data via published events and read APIs; they MUST NOT redefine the commercial commitment.

#### 1.1.2 Pricing & Discount Boundary

Sales owns the resolution of pricing and discounts against a quotation or sales order line. Price list ownership (data), discount scheme ownership (data), and tax determination (owned by Accounting via `ENG-019`) are consumed from their authoritative sources and are not redefined here.

#### 1.1.3 Credit-Limit Boundary (Sales ↔ Accounting)

Sales enforces the **credit-limit breach approval routing** business rule from the Sales Module PRD §7. Financial standing of a customer (outstanding receivables, credit exposure, dunning status) is **consumed** from Accounting via `MOD002_ACCOUNTING_BASELINE_v1`; Sales does not compute, own, or persist receivables state. When a proposed order would exceed the customer credit-limit policy resolved via `ENG-005`, the order transition routes through `ENG-011` Approval for explicit approval.

#### 1.1.4 Order Lifecycle Boundary

Sales owns the sales order lifecycle up to `Confirmed` (and its amendment / cancellation transitions). Delivery / dispatch, inventory reservation, invoicing, and returns are deferred to `SPR-MOD-003-003` … `SPR-MOD-003-005` respectively.

### 1.2 In Scope

- Quotation lifecycle: draft → issued → revised → expired → converted, with revision history preserved.
- Sales order lifecycle: captured → approved → confirmed, with amend and cancel transitions.
- Order approval workflows routed via `ENG-010` Workflow and `ENG-011` Approval.
- Credit-limit breach routing via `ENG-011` per `ENG-005`-resolved credit-limit policy.
- Pricing and discount evaluation on quotation and order lines via `ENG-005` configuration and `ENG-012` Rules.
- Multi-step order amendment with audit trail via `ENG-004`.
- Sales-document numbering *consumption* (quotation, sales order) via `ENG-017` (series registered in `SPR-MOD-003-001`).
- Multi-currency awareness on quotation and order via `ENG-018` (currency semantics consumed, not redefined).
- Document rendering hooks for quotation and order via `ENG-007`; attachments via `ENG-008`.
- Notifications (issue, approve, confirm, cancel) via `ENG-025`.
- Sales-order lifecycle events (see §11) delivered via `ENG-024`.
- Authorization on every quotation and order action via `ENG-002` per `ADR-032`.

### 1.3 Out of Scope

Reserved for later Sales sprints (see [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)):

- Delivery orders, pick/pack, shipment readiness, fulfillment lifecycle, inventory reservation consumption — `SPR-MOD-003-003`.
- Sales invoice, credit note, debit note lifecycle, tax determination, receivables creation, invoice export, accounting voucher handoff — `SPR-MOD-003-004`.
- Sales returns and customer adjustments — `SPR-MOD-003-005`.
- Sales analytics, sales dashboards, sales KPIs, margin analysis, credit-limit enforcement analytics — `SPR-MOD-003-006`.
- Accounting vouchers, journal posting, ledger posting, taxation calculation, receivables ledger, sales revenue reporting — owned by MOD-002 Accounting; consumed via `MOD002_ACCOUNTING_BASELINE_v1`.
- Inventory item master, stock, reservation semantics — owned by MOD-005 Inventory.
- CRM lead/prospect/opportunity lifecycles pre-conversion — owned by CRM.
- Customer master, customer hierarchy, sales organization, territories, salespersons, sales configuration, sales-document numbering *registration* — owned by `SPR-MOD-003-001`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-003-002`, the following will exist:

- **Business capabilities.**
  - A sales executive can create, revise, issue, expire, and convert quotations under a tenant/company.
  - A sales executive can capture, amend, cancel, and submit sales orders for approval; a sales manager can approve, reject, and return orders for revision.
  - Pricing and discount evaluation on quotation and sales order lines resolves deterministically via `ENG-005` configuration and `ENG-012` rules.
  - Credit-limit breaches route deterministically to `ENG-011` Approval per the credit-limit policy resolved via `ENG-005`.
  - Order approval workflows execute via `ENG-010` and `ENG-011` under the approval thresholds registered in `SPR-MOD-003-001`.
  - Quotation and sales order documents consume the numbering series registered in `SPR-MOD-003-001` via `ENG-017`.
  - Notifications on issue, approve, confirm, and cancel are dispatched via `ENG-025`.
- **Published events.** Six sales-order lifecycle event contracts (see §11) registered in the event catalog and emitted by the corresponding transitions.
- **Configuration artifacts.** Pricing, discount, approval, and credit-limit policy values resolve via `ENG-005` under the sales configuration namespace initialized in `SPR-MOD-003-001`. No new configuration keys are registered outside Sales' own ownership boundary.
- **Audit artifacts.** An audit record exists for every quotation and sales order lifecycle transition, produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-003-002`.
  - Sales-order lifecycle event entries referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-003 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Quotation and pricing, Sales order capture and fulfilment, Discounts/schemes/promotions | Quotation lifecycle, sales order lifecycle, pricing/discount evaluation |
| §3 Personas — Sales Executive, Sales Manager, Order Desk, Accountant (secondary), Customer (external actor) | User stories (§4) |
| §4 Business Processes — Quote-to-order | Quotation → conversion → sales order pipeline |
| §6 Transactions — Quotation, Sales Order | Transaction lifecycles and state transitions (§5) |
| §7 Business Rules — Credit-limit breach requires explicit approval | Credit-limit routing via `ENG-011` (§5.4) |
| §8 Integration Points — `QuotationIssued`, `SalesOrderConfirmed` events published; `CustomerCreated` consumed | Event contracts (§11) |
| §10 Configuration — Default price list, Approval thresholds, Numbering series, Credit-limit policy | Pricing/approval/numbering/credit consumed from sales configuration namespace |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Sales Module PRD.**

---

## 4. User Stories

- **US-001.** *As a sales executive, I want to create, revise, and issue quotations to customers, so that I can commit prices to a customer before an order is placed.*
- **US-002.** *As a sales executive, I want to convert an issued quotation into a sales order, preserving the quotation reference, so that the commercial commitment is auditable end-to-end.*
- **US-003.** *As a sales executive, I want pricing and applicable discounts on quotation and order lines to resolve deterministically, so that quoted prices are reproducible and free of ad-hoc adjustments.*
- **US-004.** *As a sales manager, I want sales orders that exceed approval thresholds or the customer credit limit to route to me for explicit approval, so that commercial risk is contained.*
- **US-005.** *As a sales manager, I want to approve, reject, or return orders for revision, so that the order lifecycle can be governed without silent commitments.*
- **US-006.** *As an order-desk operator, I want to amend an approved order (quantity, price within limits, address) with an audit trail, so that legitimate commercial changes do not require a full re-approval when within amendment policy.*
- **US-007.** *As an order-desk operator, I want to cancel an order that is not yet confirmed, so that commercial commitments can be withdrawn cleanly.*
- **US-008.** *As an accountant (secondary), I want visibility into confirmed sales orders that would exceed credit exposure, so that I can review credit-limit breach approvals against Accounting-owned receivables state.*
- **US-009.** *As a downstream module (system persona), I want to receive `quotation.*` and `salesorder.*` events, so that I can react to commercial-document transitions in a decoupled way.*
- **US-010.** *As a security reviewer, I want every quotation and sales order lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the commercial-document history from an authoritative log.*
- **US-011.** *As a customer (external actor, system persona), I want issued quotations and confirmed orders to be rendered as documents I can receive, so that commercial commitments are legible outside the system.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Quotation lifecycle (US-001, US-002, US-011)

- **Given** a valid quotation draft under an active tenant/company with an active Sales-owned customer,
  **when** a sales executive submits it,
  **then** the quotation is persisted, receives a stable identifier and a document number resolved via `ENG-017`, and remains in state `Draft`.
- **Given** a `Draft` quotation,
  **when** the executive issues it,
  **then** it transitions to `Issued`, the `quotation.issued` event is published via `ENG-024`, and any prior revision history is preserved.
- **Given** an `Issued` quotation,
  **when** it is revised,
  **then** a new revision is persisted, the `quotation.revised` event is published, and the prior revision remains readable and audit-linked.
- **Given** an `Issued` quotation past its expiry,
  **when** the expiry evaluation runs,
  **then** the quotation transitions to `Expired` and cannot be converted.
- **Given** an `Issued` (non-expired) quotation,
  **when** it is converted,
  **then** a sales order is created that references the quotation, and the quotation transitions to `Converted`.

### 5.2 Sales order lifecycle (US-002, US-005, US-006, US-007, US-011)

- **Given** a valid sales order capture request,
  **when** an order-desk operator submits it,
  **then** the order is persisted with a stable identifier and a document number resolved via `ENG-017`, and remains in state `Captured`.
- **Given** a `Captured` order,
  **when** approval is submitted,
  **then** the order routes through `ENG-010` Workflow and, when thresholds or credit-limit policy require it, through `ENG-011` Approval per §5.4; otherwise it transitions to `Approved`.
- **Given** an `Approved` order,
  **when** confirmation is submitted,
  **then** it transitions to `Confirmed` and the `salesorder.confirmed` event is published via `ENG-024`.
- **Given** an `Approved` or `Confirmed` order and a valid amendment within amendment policy,
  **when** the amendment is submitted,
  **then** the change is persisted, an audit record is produced via `ENG-004`, and the `salesorder.amended` event is published.
- **Given** an order in any state prior to `Confirmed`,
  **when** cancellation is submitted,
  **then** the order transitions to `Cancelled` and the `salesorder.cancelled` event is published.

### 5.3 Pricing and discount evaluation (US-003)

- **Given** a quotation or sales order line referencing a price list and applicable discount schemes resolved via `ENG-005`,
  **when** pricing is evaluated,
  **then** the resulting unit price, discount, and net amount are deterministic and reproducible against the same input state.
- **Given** a discount rule expressed via `ENG-012` Rules,
  **when** it evaluates against a line,
  **then** the rule outcome is deterministic and audit-linked.

### 5.4 Credit-limit routing (US-004, US-008)

- **Given** a sales order whose proposed exposure would exceed the customer credit-limit policy resolved via `ENG-005` (with financial standing consumed from Accounting per `MOD002_ACCOUNTING_BASELINE_v1`),
  **when** approval is submitted,
  **then** the order routes to `ENG-011` for explicit credit-limit approval and cannot transition to `Approved` without an approval record.
- **Given** a sales order whose exposure is within the credit-limit policy,
  **when** approval is submitted,
  **then** the order does not require credit-limit approval routing (standard approval thresholds still apply).

### 5.5 Order approval workflow (US-004, US-005)

- **Given** an order whose total exceeds an approval threshold resolved via `ENG-005`,
  **when** approval is submitted,
  **then** the order routes through `ENG-010`/`ENG-011` to the appropriate approver set per `ADR-032`.
- **Given** an order in approval,
  **when** it is rejected or returned for revision,
  **then** the order transitions deterministically to `Rejected` or back to `Captured`, and the outcome is audited via `ENG-004`.

### 5.6 Numbering, attachments, notifications (US-001, US-002, US-011)

- **Given** a quotation or sales order transition that requires a document number,
  **when** it is executed,
  **then** the number resolves via `ENG-017` from the series registered in `SPR-MOD-003-001` and is unique within the tenant/company.
- **Given** a quotation or sales order,
  **when** an attachment is added via `ENG-008`,
  **then** the attachment is bound to the document, isolated per tenant, and audited.
- **Given** any of `quotation.issued`, `salesorder.approved`, `salesorder.confirmed`, `salesorder.cancelled`,
  **when** it fires,
  **then** a notification is dispatched via `ENG-025` per the notification configuration resolved via `ENG-005`.

### 5.7 Audit integration (US-010)

- **Given** any quotation or sales order lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, document identifier, transition type, and timestamp.

### 5.8 Events (US-009)

- **Given** a quotation or sales order lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used; unregistered names are deferred under `R-EV-01`.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any quotation or sales order read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.10 Ownership consumption invariants

- **Given** any downstream module requiring sales-order data,
  **when** it reads or reacts to sales-order lifecycle,
  **then** it does so exclusively through Sales-owned events and read APIs. No downstream module creates an independent order commitment.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-003` — Sales.
- **Module PRD:** [`docs/20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Quotation and pricing, Sales order capture and fulfilment, Discounts / schemes / promotions), §3 (Sales Executive, Sales Manager, Order Desk, Accountant secondary), §4 (Quote-to-order), §6 (Quotation, Sales Order transactions), §7 (Credit-limit breach approval), §8 (`QuotationIssued`, `SalesOrderConfirmed` published; `CustomerCreated` consumed), §10 (Default price list, Approval thresholds, Numbering series, Credit-limit policy), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-003` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting ownership conventions, customer receivables and credit-exposure references consumed for §5.4 credit-limit routing.
- **Upstream sprint:** [`SPR-MOD-003-001`](./SPR-MOD-003-001-sales-foundation.md) (Sales Foundation) — Customer master, sales organization, salespersons, sales configuration namespace, sales-document numbering series registration.
- **Downstream sprints:** `SPR-MOD-003-003` (Delivery & Fulfillment), `SPR-MOD-003-004` (Sales Invoicing), `SPR-MOD-003-005` (Returns & Customer Adjustments), `SPR-MOD-003-006` (Sales Analytics & Controls) — per [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md).
- **Downstream module consumers of sales-order data:** MOD-005 Inventory (reservation triggers), MOD-002 Accounting (via later invoicing sprint), MOD-017 Analytics — consuming exclusively via events and read APIs.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Sales Ownership Convention in §1.1). See each engine's specification for capability details. Consumption mirrors the Sprint 2 row of `MOD-003_SPRINT_PLAN.md` §4.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every quotation and sales order action per `ADR-032`. |
| `ENG-004` Audit | Records every quotation and sales order lifecycle transition. |
| `ENG-005` Configuration | Resolves default price list, approval thresholds, credit-limit policy, and notification configuration under the tenant/company hierarchy. |
| `ENG-007` Document | Provides quotation and sales order document rendering hooks. |
| `ENG-008` Attachment | Binds attachments to quotations and sales orders. |
| `ENG-010` Workflow | Drives the sales order approval workflow. |
| `ENG-011` Approval | Executes multi-step order approval, including credit-limit breach approval. |
| `ENG-012` Rules | Evaluates pricing and discount rules deterministically on quotation and order lines. |
| `ENG-017` Numbering | Consumes the sales-document numbering series registered in `SPR-MOD-003-001` for quotation and sales order document numbers. |
| `ENG-018` Currency | Provides currency references on quotation and order lines; currency semantics are consumed, not redefined. |
| `ENG-024` Eventing | Publishes sales-order lifecycle events with the contracts declared in §11. |
| `ENG-025` Notification | Dispatches notifications on issue, approve, confirm, and cancel transitions. |

Sales business semantics (quotation lifecycle, sales order lifecycle, pricing/discount evaluation policy, credit-limit routing policy, amendment policy) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every quotation and sales order read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every quotation and sales order action, including approval routing. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Quotation | MOD-003 (this sprint) | Commercial price offer bound to a customer under a tenant/company. |
| Quotation Line | MOD-003 (this sprint) | Line-level offer with item reference (consumed from Inventory), quantity, price, and discount. |
| Quotation Revision | MOD-003 (this sprint) | Historical revision of a quotation preserved for audit. |
| Sales Order | MOD-003 (this sprint) | Commercial commitment created from a customer instruction or a converted quotation. |
| Sales Order Line | MOD-003 (this sprint) | Line-level commitment with item reference, quantity, price, and discount. |
| Order Approval | MOD-003 (this sprint) | Approval decision record produced by `ENG-011` for order approval routing (standard and credit-limit). |
| Order Amendment | MOD-003 (this sprint) | Amendment record produced during order lifecycle amend transitions. |
| Discount Scheme Reference | MOD-003 (this sprint, reference-scoped) | Reference to Sales-owned discount scheme data consumed during pricing evaluation. |
| Price List Reference | MOD-003 (this sprint, reference-scoped) | Reference to Sales-owned price list data consumed during pricing evaluation. |

### 10.2 Relationships

- A **customer** (owned by `SPR-MOD-003-001`) is referenced by zero or more **quotations** and zero or more **sales orders** within the same tenant/company.
- A **quotation** owns one or more **quotation lines** and zero or more **quotation revisions**.
- A **sales order** owns one or more **sales order lines** and, optionally, references the **quotation** it was converted from.
- A **sales order** owns zero or more **order approvals** (one per approval routing step) and zero or more **order amendments**.
- A **quotation line** and a **sales order line** each reference an **item** (owned by Inventory) and MAY reference a **price list** and/or one or more **discount schemes** during pricing evaluation.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-003` per the Sales Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Item master, stock, and inventory reservations are consumed from Inventory; they are not represented as Sales-owned entities.
- Customer master, hierarchy, sales organization, sales territories, salespersons, and sales configuration are consumed from `SPR-MOD-003-001`; they are not redefined here.
- Financial standing of a customer (receivables, credit exposure, dunning) is consumed from Accounting; it is not represented as a Sales-owned entity.
- Tax determination, accounting vouchers, ledger posting, and financial reporting are consumed from Accounting via `MOD002_ACCOUNTING_BASELINE_v1`.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

The Sales Module PRD §8 declares `QuotationIssued` and `SalesOrderConfirmed` as the illustrative business-level events for this bounded context. The lifecycle event contracts below are aligned to those business-level events under the Sales Ownership Convention.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `quotation.issued` | MOD-003 | SPR-MOD-003-002 | MOD-003 (self), MOD-CRM, MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `quotation.revised` | MOD-003 | SPR-MOD-003-002 | MOD-003 (self), MOD-CRM, MOD-017 | At-least-once, ordered per tenant |
| `salesorder.created` | MOD-003 | SPR-MOD-003-002 | MOD-003 (self), MOD-005 (Inventory), MOD-017 | At-least-once, ordered per tenant |
| `salesorder.confirmed` | MOD-003 | SPR-MOD-003-002 | MOD-003 (self), MOD-005 (Inventory), MOD-002 (Accounting, via later invoicing sprint), MOD-017 | At-least-once, ordered per tenant |
| `salesorder.amended` | MOD-003 | SPR-MOD-003-002 | MOD-003 (self), MOD-005, MOD-017 | At-least-once, ordered per tenant |
| `salesorder.cancelled` | MOD-003 | SPR-MOD-003-002 | MOD-003 (self), MOD-005, MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Quotation and sales order lifecycle transitions are governed by `ENG-010`/`ENG-011` and, where credit-limit policy triggers it, credit-limit approval routing per §5.4 is enforced.
- [ ] Pricing and discount evaluation is deterministic against `ENG-005` configuration and `ENG-012` rules.
- [ ] Sales-order lifecycle events (§11) are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every quotation and sales order read and write.
- [ ] Every quotation and sales order lifecycle transition produces an audit record via `ENG-004`.
- [ ] Quotation and sales order document numbers resolve via `ENG-017` from the series registered in `SPR-MOD-003-001`.
- [ ] Notifications on issue, approve, confirm, and cancel are dispatched via `ENG-025`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-003_SPRINT_PLAN.md` §2 (`SPR-MOD-003-002`):

- Quotations and sales orders can be created, amended, approved, and cancelled through the business lifecycle.
- Credit-limit breaches route through `ENG-011` for explicit approval.
- Pricing, discounts, and schemes resolve via `ENG-005` configuration and `ENG-012` rules.
- `SalesOrderConfirmed` event is published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable).

- **Risk ID:** R-01
  - **Description:** MOD-003 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, users/roles/permissions, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-003 depends on `MOD002_ACCOUNTING_BASELINE_v1` being frozen for accounting ownership boundaries and for the receivables and credit-exposure references consumed by §5.4 credit-limit routing.
  - **Impact:** Any weakening of Accounting ownership boundaries or of the receivables reference contract would blur the Sales/Accounting split.
  - **Mitigation:** Rely on the frozen `MOD002_ACCOUNTING_BASELINE_v1`; treat boundary regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-003 depends on `SPR-MOD-003-001` (Sales Foundation) for Customer master, sales configuration namespace, and sales-document numbering series registration.
  - **Impact:** Any regression against `SPR-MOD-003-001` breaks this sprint's assumptions.
  - **Mitigation:** Rely on `SPR-MOD-003-001` in its authored state; escalate as a sprint dependency defect if regression occurs.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Delivery, invoicing, returns, and analytics are deferred to `SPR-MOD-003-003` … `SPR-MOD-003-006`.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries and pollute the commercial-document layer.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Pricing and discount evaluation complexity: the space of price lists, discount schemes, and rules can grow beyond what `ENG-005` + `ENG-012` can resolve deterministically without careful configuration ownership.
  - **Impact:** Non-deterministic pricing would break §5.3 acceptance criteria and downstream reporting.
  - **Mitigation:** Bound pricing/discount rule expression to what `ENG-012` supports deterministically; escalate any pattern that requires new engine behavior as an engine change rather than absorbing it here.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Credit-limit boundary with Accounting: `MOD002_ACCOUNTING_BASELINE_v1` owns receivables and credit exposure; Sales enforces the routing rule but does not compute exposure.
  - **Impact:** Duplicated computation of credit exposure in Sales would violate ownership boundaries and drift from Accounting.
  - **Mitigation:** Consume credit-exposure references from Accounting; keep Sales limited to the routing decision based on policy resolved via `ENG-005`.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sales-order lifecycle event names declared in §11 (`quotation.issued`, `quotation.revised`, `salesorder.created`, `salesorder.confirmed`, `salesorder.amended`, `salesorder.cancelled`) are not yet present in the authoritative event catalog at authoring time.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Map to an authoritative equivalent where one exists; otherwise register via the event catalog governance process before this sprint enters `In Progress`.
  - **Status:** Deferred

- **Risk ID:** R-08
  - **Description:** Order amendment policy (which fields, which state transitions, what re-approval is required) is a policy surface within Sales' ownership.
  - **Impact:** Loose amendment policy would allow silent commercial commitment changes.
  - **Mitigation:** Encode amendment policy via `ENG-005` configuration and `ENG-012` rules; audit every amendment via `ENG-004`.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — quotation and sales order state transitions; pricing/discount evaluation determinism; credit-limit routing decision; amendment policy invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, rule evaluation via `ENG-012`, workflow via `ENG-010`, approval via `ENG-011`, numbering via `ENG-017`, event publication via `ENG-024`, notification dispatch via `ENG-025`.
- **Contract** — sales-order lifecycle event contracts against the event catalog.
- **End-to-end (smoke)** — end-to-end quote-to-confirmed-order flow including a credit-limit-breach routing case, under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a customer credit-limit fixture (with a receivables-reference stub) used to prove §5.4 routing without redefining Accounting-owned computation.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling quotation and sales order lifecycles as explicit state machines so audit emission (§5.7) and event publication (§5.8) are trivially satisfiable at every transition.
- Consider expressing the credit-limit routing decision as a single `ENG-012` rule whose inputs are (proposed exposure, receivables reference, credit-limit policy) so the decision is independently testable.
- Consider co-locating pricing evaluation with quotation and order line capture so evaluation determinism is enforceable at the input boundary.
- Consider registering the sales-order lifecycle event names in the event catalog before this sprint enters `In Progress` (per `R-EV-01`), so downstream sprints subscribing to those events are not blocked.
- Consider bounding amendment policy to a small, enumerated field set in `ENG-005` configuration to keep amendment audits interpretable.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-003-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial document lifecycle for quotations and sales orders — capture, pricing, approval (including credit-limit routing), amendment, and confirmation — with audit and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-003` MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Sales Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists delivery, invoicing, returns, analytics, plus Accounting/Inventory/CRM-owned scope, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-003-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-003-003 Delivery & Fulfillment` is the immediate successor per [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-003-002`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md)
- Stage 1 Sprint Plan — [`./MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)
- Upstream sprint — [`./SPR-MOD-003-001-sales-foundation.md`](./SPR-MOD-003-001-sales-foundation.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- ERP Core Engines — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
