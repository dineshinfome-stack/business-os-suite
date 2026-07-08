---
title: "SPR-MOD-003-005 — Returns & Customer Adjustments"
summary: "Sprint PRD for the commercial sales-returns lifecycle of MOD-003 Sales: return request, approval, validation against original invoice lines, return-receipt confirmation, customer adjustments, replacement and refund preparation, return numbering, attachments, notifications, and lifecycle events. Consumes credit-note issuance owned by SPR-MOD-003-004, invoice references owned by SPR-MOD-003-004, delivery references owned by SPR-MOD-003-003, inventory ownership owned by MOD-005 Inventory, and accounting voucher, tax, and receivable-adjustment contracts owned by MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`; never redefines Sales-Invoicing, Delivery, Inventory, Accounting, Tax, or Platform ownership."
layer: "delivery"
owner: "Sales"
status: "Draft"
updated: "2026-07-07"
sprint_id: "SPR-MOD-003-005"
parent_module: "MOD-003"
parent_sprint_plan: "MOD-003_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "8.4.5"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-018", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "sales", "returns", "customer-adjustments", "mod-003", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-003-005 — Returns & Customer Adjustments

> **Stage 2 deliverable.** Fifth authored Sprint PRD for **MOD-003 Sales** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-003-005` (permanent) |
| Parent Module | `MOD-003` — Sales |
| Parent Sprint Plan | [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (both frozen) |
| Upstream Sprints | [`SPR-MOD-003-001`](./SPR-MOD-003-001-sales-foundation.md), [`SPR-MOD-003-002`](./SPR-MOD-003-002-quotations-sales-orders.md), [`SPR-MOD-003-003`](./SPR-MOD-003-003-delivery-fulfillment.md), [`SPR-MOD-003-004`](./SPR-MOD-003-004-sales-invoicing.md) |
| Downstream Sprints | `SPR-MOD-003-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial sales-returns lifecycle** for BusinessOS Sales: return request, approval, validation against original invoice lines, return-receipt confirmation, customer adjustments, replacement and refund preparation, return numbering, attachments, notifications, and lifecycle events. This sprint sits on top of Sales Invoicing (`SPR-MOD-003-004`) and produces the commercial-returns surface that downstream Sales sprints (analytics) and Accounting will consume via published contracts and events.

> **Sales Ownership Convention (reiterated).** The Sales module owns the business semantics of the commercial-returns lifecycle. ERP Core Engines provide shared infrastructure (authorization, audit, document, workflow, approval, rules, numbering, currency, eventing, notification) but **MUST NOT** redefine Sales-Returns business rules. These conventions complement — and do not redefine — the Platform governance conventions established in `MOD001_PLATFORM_BASELINE_v1`, the Accounting ownership conventions established in `MOD002_ACCOUNTING_BASELINE_v1`, Sales Foundation (`SPR-MOD-003-001`), the Commercial Document Lifecycle (`SPR-MOD-003-002`), Delivery & Fulfillment (`SPR-MOD-003-003`), or Sales Invoicing (`SPR-MOD-003-004`).

#### 1.1.1 Commercial Return Ownership

The Sales Return Request, Return Authorization, Return Line, Customer Adjustment, Replacement Request, and Refund Request commercial transactions and their commercial lifecycles are authoritatively owned by MOD-003 Sales. Sales owns return-request submission, return validation against the original invoice line, return approval, return-receipt confirmation (as a commercial event, not a stock movement), customer adjustment, replacement preparation, refund preparation, return numbering, return attachments, return notifications, and return lifecycle events. No other module MAY create, edit, approve, cancel, or amend a sales return, replacement request, or refund request. Downstream modules consume commercial-return data via published events and read APIs; they MUST NOT redefine the commercial-returns commitment.

#### 1.1.2 Inventory Consumption Boundary

Sales returns MAY trigger downstream inventory movement, but the **stock movement, putaway, valuation, warehouse ownership, item mastering, and reverse logistics** for returned goods are owned by MOD-005 Inventory. Sales MUST NOT:

- perform a stock receipt or putaway;
- update stock quantities;
- update stock valuation;
- own warehouse or bin state;
- own item mastering;
- perform reverse-logistics execution.

Inventory remains the authoritative owner of the physical goods lifecycle. Sales publishes return-receipt-confirmed events which Inventory MAY consume to trigger its own putaway lifecycle; this sprint does not redefine Inventory ownership.

#### 1.1.3 Accounting Consumption Boundary

Sales returns SHALL request accounting voucher creation and receivable adjustment exclusively through the contracts defined by [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md). Sales MUST NOT:

- create accounting vouchers;
- own the voucher lifecycle;
- create journals;
- post ledgers;
- calculate accounting balances;
- maintain the receivables ledger;
- allocate receipts or refunds;
- close accounting periods;
- calculate refund tax or reverse tax posting.

Accounting remains the authoritative owner of accounting vouchers, journal posting, ledger posting, tax semantics, receivables, and accounting period governance under `MOD002_ACCOUNTING_BASELINE_v1`.

#### 1.1.4 Customer Adjustment Boundary

Sales owns the **commercial** customer adjustment: the authoritative record that a customer commitment has been reduced, replaced, or refunded and the commercial trail linking that decision back to the original invoice line and (where applicable) delivery. Accounting owns the **financial** customer adjustment: any resulting voucher, ledger entry, receivable movement, refund posting, or tax reversal, executed under `MOD002_ACCOUNTING_BASELINE_v1`. These two views MUST NOT be conflated: Sales publishes the commercial adjustment record and the corresponding accounting-adjustment request; Accounting materializes the financial adjustment.

#### 1.1.5 Delivery and Invoice Consumption Boundary

Return validation consumes **issued sales invoices** produced by `SPR-MOD-003-004` and **completed deliveries** produced by `SPR-MOD-003-003` as read-only references. This sprint MUST NOT redefine invoice ownership, invoice lifecycle, credit-note lifecycle (owned by `SPR-MOD-003-004`), delivery ownership, delivery lifecycle, pick/pack coordination, shipment readiness, or delivery numbering. A return line MUST reference exactly one original invoice line (per MOD-003 MODULE_PRD §7). Where a returned quantity requires a credit note, Sales Returns publishes a **credit-note issuance request** consumed by `SPR-MOD-003-004`; the credit-note document itself is created by `SPR-MOD-003-004`, not by this sprint.

#### 1.1.6 Governance Complement

These conventions complement — and do not redefine — the Platform governance conventions established in `MOD001_PLATFORM_BASELINE_v1`, the Accounting ownership conventions established in `MOD002_ACCOUNTING_BASELINE_v1`, Sales Foundation (`SPR-MOD-003-001`), Commercial Document Lifecycle (`SPR-MOD-003-002`), Delivery & Fulfillment (`SPR-MOD-003-003`), and Sales Invoicing (`SPR-MOD-003-004`).

### 1.2 In Scope

- Return-request lifecycle: draft → submitted → validated → approved → receipt-confirmed → completed, with rejection and cancellation transitions where policy permits.
- Return validation against exactly one original invoice line, including quantity-not-exceeding-invoiced-quantity and "return must reference an original invoice line" (MOD-003 MODULE_PRD §7) business rules.
- Return approval routing via `ENG-011` per policy resolved via `ENG-005` (sales configuration namespace initialized in `SPR-MOD-003-001`).
- Return validation rules deterministic evaluation via `ENG-012` (rules engine consumed, not redefined).
- Return workflow orchestration via `ENG-010` where state transitions require workflow coordination (consumed, not redefined).
- Return-receipt confirmation as a **commercial event** (not a stock movement); the stock movement is executed downstream by MOD-005 Inventory.
- Customer adjustment record referencing the return, the original invoice line, and the resulting commercial outcome (replacement / refund / no-op).
- Replacement preparation contract published for downstream commercial-document sprints or MOD-005 Inventory consumption; the replacement dispatch itself is out of scope.
- Refund preparation contract published for Accounting consumption; refund execution and payment are out of scope.
- Return document numbering consumption via `ENG-017` (series registered in `SPR-MOD-003-001`).
- Multi-currency awareness on return lines via `ENG-018` (currency semantics consumed, not redefined).
- Return document rendering hooks via `ENG-007`.
- Return attachments via the attachment surface established in `SPR-MOD-003-002` (consumed, not re-registered here).
- Notifications (submitted, approved, rejected, receipt-confirmed, completed, cancelled) via `ENG-025`.
- Return-lifecycle events (see §11) delivered via `ENG-024`.
- **Credit-note issuance request** contract published for consumption by `SPR-MOD-003-004`; the credit note itself is issued by `SPR-MOD-003-004`.
- **Accounting adjustment request** contract published for consumption by `MOD002_ACCOUNTING_BASELINE_v1`; the accounting voucher and receivable adjustment are executed by Accounting.
- **Inventory return-receipt event** contract published for consumption by MOD-005 Inventory; the putaway itself is executed by Inventory.
- Authorization on every return action via `ENG-002` per `ADR-032`.
- Audit of every return-lifecycle transition via `ENG-004` per `ADR-014`.
- Tenant isolation of every return read and write per `ADR-011`.

### 1.3 Out of Scope

Reserved for later Sales sprints (see [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)) or owned by upstream/adjacent modules:

- Credit-note lifecycle and credit-note issuance — owned by `SPR-MOD-003-004` Sales Invoicing; consumed here via the credit-note issuance request contract.
- Stock receipt, putaway, warehouse or bin state, stock valuation, item mastering, reverse-logistics execution — owned by MOD-005 Inventory; consumed via the inventory return-receipt event contract.
- Refund payment execution, payment gateway integration, receipt allocation, receivables ledger management, collections — owned by MOD-002 Accounting; consumed via `MOD002_ACCOUNTING_BASELINE_v1`.
- Journal creation, ledger posting, accounting voucher lifecycle, accounting balances, tax reversal computation, financial statements, accounting period close — owned by MOD-002 Accounting.
- Sales analytics, sales dashboards, KPIs, return analysis — `SPR-MOD-003-006`.
- Quotation and sales-order lifecycle, pricing, discount, credit-limit routing — `SPR-MOD-003-002`.
- Delivery order, pick/pack, shipment readiness, delivery completion — `SPR-MOD-003-003`.
- Invoice, credit-note, and debit-note lifecycle — `SPR-MOD-003-004`.
- Customer master, sales organization, salespersons, sales configuration, numbering-series *registration* — owned by `SPR-MOD-003-001`.
- Reverse logistics gateway integrations, courier/return-pickup integrations — deferred and not scoped to any Sales sprint by `MOD-003_SPRINT_PLAN.md`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-003-005`, the following will exist:

- **Business capabilities.**
  - A customer-service executive can register a sales return request against an issued invoice line under a tenant/company.
  - A returns coordinator or sales manager can validate, approve, reject, receipt-confirm, complete, and cancel a return through its commercial lifecycle within policy.
  - A returns coordinator can register a customer adjustment referencing the return, the original invoice line, and the resulting commercial outcome (replacement / refund / no-op).
  - Return documents consume the numbering series registered in `SPR-MOD-003-001` via `ENG-017`.
  - Notifications on submitted, approved, rejected, receipt-confirmed, completed, and cancelled transitions are dispatched via `ENG-025`.
- **Published contracts.**
  - **Credit-note issuance request** contract published for consumption by `SPR-MOD-003-004`.
  - **Accounting adjustment request** contract published for consumption by `MOD002_ACCOUNTING_BASELINE_v1` (voucher + receivable adjustment).
  - **Inventory return-receipt event** contract published for consumption by MOD-005 Inventory.
  - **Replacement preparation** contract published for downstream consumption (replacement dispatch itself is out of scope).
  - **Refund preparation** contract published for Accounting consumption (refund execution itself is out of scope).
- **Published events.** Return-lifecycle event contracts (see §11) are prepared for registration in the event catalog and emitted by the corresponding transitions. Any event name not present in the authoritative event catalog at authoring time is deferred under `R-EV-01` (§14).
- **Configuration artifacts.** Return approval policy, return-eligibility window, and notification configuration values resolve via `ENG-005` under the sales configuration namespace initialized in `SPR-MOD-003-001`. No new configuration keys are registered outside Sales' own ownership boundary.
- **Audit artifacts.** An audit record exists for every return-lifecycle transition and every customer-adjustment record, produced via `ENG-004`.
- **Consumption contracts.** Issued-invoice references consumed from `SPR-MOD-003-004`, completed-delivery references consumed from `SPR-MOD-003-003`, approved-sales-order references consumed from `SPR-MOD-003-002`, and customer / sales-organization references consumed from `SPR-MOD-003-001` are documented as read-only inputs. No invoice-, delivery-, order-, or foundation-owned entity is redefined.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-003-005`.
  - Return-lifecycle event entries referenced from §11 (subject to `R-EV-01` in §14).
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

Forward reference: `SPR-MOD-003-006` (Sales Analytics & Controls) consumes return-lifecycle events and the return register produced here.

---

## 3. Traceability to Module PRD

> **Bidirectional traceability.** Every Sprint Deliverable SHALL trace to one or more sections of [`docs/20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md); no orphan requirements and no unallocated Module PRD capabilities that this sprint is chartered to deliver are permitted.

| MOD-003 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Sales returns | Return-request lifecycle; customer adjustments; replacement/refund preparation contracts (§2, §5) |
| §3 Personas — Sales Executive, Customer Service Executive, Sales Manager | User stories (§4) |
| §4 Business Processes — Return process | Return-request → validation → approval → receipt-confirmed → completed pipeline (§5) |
| §6 Transactions — Sales Return, Customer Adjustment | Return, Return Line, Customer Adjustment, Replacement Request, Refund Request lifecycles (§5) |
| §7 Business Rules — "Returns must reference an original invoice line" | §5.2 acceptance criteria |
| §7 Business Rules — "Return quantity SHALL NOT exceed invoiced quantity" | §5.2 acceptance criteria |
| §8 Integration Points — return-lifecycle events consumed by Accounting, Inventory, Analytics | Return-lifecycle events (§11); accounting adjustment, credit-note, inventory return-receipt, replacement, refund request contracts (§2) |
| §9 Reports & Analytics — Return Analysis | Deferred to `SPR-MOD-003-006` (return-lifecycle events published here) |
| §10 Configuration — Numbering series, Approval thresholds | Numbering consumed from Sales configuration namespace; return approval policy resolved via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Sales Module PRD, and no Sprint Deliverable is left un-traced.**

---

## 4. User Stories

- **US-001.** *As a **customer-service executive**, I want to register a sales return request against an issued invoice line, so that a legitimate customer commitment reduction is captured authoritatively.*
- **US-002.** *As a **customer-service executive**, I want return validation to enforce "return must reference an original invoice line" and "return quantity SHALL NOT exceed invoiced quantity" (MOD-003 MODULE_PRD §7), so that invalid returns are rejected early.*
- **US-003.** *As a **sales manager** or **returns coordinator**, I want return approval to be routed through `ENG-011` when policy requires it, so that commercial-return risk is contained.*
- **US-004.** *As a **returns coordinator**, I want to receipt-confirm a return as a commercial event, so that downstream Inventory can execute putaway and Accounting can execute the adjustment.*
- **US-005.** *As a **returns coordinator**, I want to register a customer adjustment referencing the return and the original invoice line, so that the commercial adjustment is auditable and traceable.*
- **US-006.** *As a **returns coordinator**, I want to submit a replacement-preparation request, so that a downstream commercial-document sprint or MOD-005 Inventory can prepare the replacement dispatch.*
- **US-007.** *As a **returns coordinator**, I want to submit a refund-preparation request, so that Accounting can execute the refund under `MOD002_ACCOUNTING_BASELINE_v1`.*
- **US-008.** *As a **returns coordinator**, I want a credit-note issuance request to be produced when policy requires a credit note, so that `SPR-MOD-003-004` can issue the credit note without Sales-Returns redefining the credit-note lifecycle.*
- **US-009.** *As a **returns coordinator**, I want an accounting adjustment request to be produced on return completion, so that Accounting can create the voucher and receivable adjustment under `MOD002_ACCOUNTING_BASELINE_v1`.*
- **US-010.** *As a **warehouse coordinator** (Inventory-side actor), I want return-receipt events published, so that MOD-005 Inventory can trigger its own putaway lifecycle without Sales owning stock movement.*
- **US-011.** *As a **customer** (external actor, system persona), I want return-status notifications on submitted, approved, receipt-confirmed, completed, and cancelled transitions, so that return status is legible outside the system.*
- **US-012.** *As a **sales executive**, I want return documents to be rendered via `ENG-007`, so that authoritative commercial documents can be produced for the return.*
- **US-013.** *As a **security reviewer** (system administrator persona), I want every return-lifecycle transition and every customer-adjustment record to be audited via `ENG-004`, so that I can reconstruct the return history from an authoritative log.*
- **US-014.** *As a **system administrator**, I want tenant isolation invariants (`ADR-011`) enforced on every return read and write, so that no cross-tenant leakage is possible.*
- **US-015.** *As a **downstream module** (system persona), I want to receive return-lifecycle events, so that I can react to return transitions in a decoupled way.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Return-request creation (US-001)

- **Given** an issued sales invoice (owned by `SPR-MOD-003-004`) under an active tenant/company,
  **when** a customer-service executive submits a return request referencing an eligible invoice line,
  **then** the return request is persisted, receives a stable identifier and a document number resolved via `ENG-017`, and remains in state `Draft`.

### 5.2 Return validation and invoice-line reference (US-002)

- **Given** a `Draft` return request,
  **when** validation runs against Sales-owned business rules via `ENG-012` (return line references exactly one original invoice line; return quantity does not exceed invoiced quantity; return-eligibility window resolved via `ENG-005` is satisfied; customer is active),
  **then** the return transitions to `Validated` when rules are satisfied and remains in `Draft` otherwise; failure reasons are recorded via `ENG-004`.
- **Given** a return line without an original invoice-line reference (per MOD-003 MODULE_PRD §7),
  **when** validation runs,
  **then** the return is rejected and an audit record of the rejection is produced via `ENG-004`.

### 5.3 Return approval routing (US-003)

- **Given** a `Validated` return whose approval policy (resolved via `ENG-005`) requires explicit approval,
  **when** approval is submitted,
  **then** the request routes through `ENG-011` per `ADR-032`; the return cannot transition to `ReceiptConfirmed` without an approval record.

### 5.4 Return receipt confirmation (US-004, US-010)

- **Given** an `Approved` return,
  **when** the returns coordinator confirms receipt,
  **then** the return transitions to `ReceiptConfirmed`, an **inventory return-receipt event** (§11) is published via `ENG-024` for MOD-005 Inventory consumption, and no Sales deliverable performs a stock movement, putaway, or valuation update.

### 5.5 Return completion, accounting adjustment and credit-note request (US-008, US-009)

- **Given** a `ReceiptConfirmed` return,
  **when** it is completed,
  **then** the return transitions to `Completed`, an **accounting adjustment request** conforming to the contract defined by `MOD002_ACCOUNTING_BASELINE_v1` is published for Accounting consumption, a **credit-note issuance request** is published for `SPR-MOD-003-004` consumption where policy requires a credit note, and the `return.completed` event (§11) is published via `ENG-024`.

### 5.6 Customer adjustment (US-005)

- **Given** a `Completed` return,
  **when** a returns coordinator registers a customer adjustment referencing the return and the original invoice line,
  **then** the customer-adjustment record is persisted, an audit record is produced via `ENG-004`, and the `return.adjustment.recorded` event (§11) is published.

### 5.7 Replacement preparation (US-006)

- **Given** a `Completed` return whose commercial outcome is a replacement,
  **when** the replacement-preparation request is submitted,
  **then** a **replacement preparation** contract is published for downstream consumption and the `return.replacement.requested` event (§11) is published; replacement dispatch itself is not executed by this sprint.

### 5.8 Refund preparation (US-007)

- **Given** a `Completed` return whose commercial outcome is a refund,
  **when** the refund-preparation request is submitted,
  **then** a **refund preparation** contract is published for Accounting consumption and the `return.refund.requested` event (§11) is published; refund payment execution itself is not performed by this sprint.

### 5.9 Return rejection and cancellation (US-002, US-003)

- **Given** a `Draft` or `Validated` return,
  **when** it is cancelled by an authorized actor,
  **then** the return transitions to `Cancelled` and the `return.cancelled` event (§11) is published.
- **Given** a `Draft` return that fails validation or approval,
  **when** rejection is submitted,
  **then** the return transitions to `Rejected` and the `return.rejected` event (§11) is published.

### 5.10 Numbering and notifications (US-001, US-004, US-011)

- **Given** a return-lifecycle transition that requires a document number,
  **when** it is executed,
  **then** the number resolves via `ENG-017` from the series registered in `SPR-MOD-003-001` and is unique within the tenant/company.
- **Given** any of the transitions Submitted / Approved / Rejected / ReceiptConfirmed / Completed / Cancelled,
  **when** it fires,
  **then** a notification is dispatched via `ENG-025` per the notification configuration resolved via `ENG-005`.

### 5.11 Invoice reference consumption (US-001, US-002)

- **Given** any return-lifecycle transition that references an original invoice line,
  **when** it is executed,
  **then** the invoice-line reference is consumed exclusively as a read-only input; no Sales deliverable in this sprint creates, edits, cancels, or amends a sales invoice, credit note, or debit note.

### 5.12 Credit-note issuance request (US-008)

- **Given** a return whose policy requires a credit note,
  **when** completion fires,
  **then** a **credit-note issuance request** conforming to the contract published by `SPR-MOD-003-004` is emitted; Sales-Returns MUST NOT issue the credit note itself.

### 5.13 Accounting adjustment request (US-009)

- **Given** a return completion transition,
  **when** it completes,
  **then** an **accounting adjustment request** conforming to the contract defined by `MOD002_ACCOUNTING_BASELINE_v1` is published; Sales MUST NOT create the voucher, journal, ledger entry, tax reversal, or receivable adjustment itself.

### 5.14 Inventory return-receipt boundary (US-004, US-010)

- **Given** a receipt-confirmed return,
  **when** the inventory return-receipt event is published,
  **then** Sales MUST NOT execute a stock movement, putaway, warehouse-state update, or stock-valuation update. Physical-goods lifecycle remains authoritatively owned by MOD-005 Inventory.

### 5.15 Unauthorized modification rejection (US-013, US-014)

- **Given** any return action,
  **when** it is submitted by a principal lacking the required permission under `ADR-032`,
  **then** `ENG-002` rejects the action and an audit record is produced via `ENG-004`.

### 5.16 Audit integration (US-013)

- **Given** any return-lifecycle transition or customer-adjustment record,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, return identifier, transition or record type, and timestamp.

### 5.17 Isolation invariants (`ADR-011`) (US-014)

- **Given** any return read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.18 Return-lifecycle events (US-015)

- **Given** a return-lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the authoritative event catalog. Only event names present in the event catalog are used; unregistered names are deferred under `R-EV-01`.

### 5.19 Ownership consumption invariants

- **Given** any downstream module requiring return data,
  **when** it reads or reacts to return-lifecycle,
  **then** it does so exclusively through Sales-owned events and read APIs. No downstream module creates an independent commercial-returns commitment. Accounting owns vouchers, journals, ledgers, tax, receivables, and refund execution; Inventory owns stock movement, putaway, warehouse state, and item mastering; Sales-Invoicing owns credit-note issuance; Sales-Returns owns the commercial return, replacement request, refund request, and customer adjustment record.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-003` — Sales.
- **Module PRD:** [`docs/20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Sales returns), §3 (Sales Executive, Customer Service Executive, Sales Manager), §4 (Return process), §6 (Sales Return, Customer Adjustment), §7 (Business rules — "Returns must reference an original invoice line", "Return quantity SHALL NOT exceed invoiced quantity"), §8 (Return-lifecycle events; accounting adjustment, credit-note, inventory return-receipt, replacement, refund request contracts), §10 (Numbering series, Approval thresholds), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

> **Consumer module identifiers.** Consumer module identifiers SHALL be resolved verbatim from [`docs/MODULE_CATALOG.md`](../../MODULE_CATALOG.md) and MUST NOT be hardcoded anywhere in the Sprint PRD. If a consumer's module ID changes in the catalog, this section is corrected — the catalog remains the source of truth.

- **Parent:** `MOD-003` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting adjustment contract, receivables ownership, tax reversal semantics, refund execution.
- **Upstream sprints:**
  - [`SPR-MOD-003-001`](./SPR-MOD-003-001-sales-foundation.md) — Customer master, sales organization, salespersons, sales configuration namespace, sales-document numbering-series registration.
  - [`SPR-MOD-003-002`](./SPR-MOD-003-002-quotations-sales-orders.md) — Approved sales-order reference (consumed indirectly through invoice reference).
  - [`SPR-MOD-003-003`](./SPR-MOD-003-003-delivery-fulfillment.md) — Completed-delivery reference (consumed for return-eligibility checks where policy requires).
  - [`SPR-MOD-003-004`](./SPR-MOD-003-004-sales-invoicing.md) — Issued sales-invoice reference and credit-note issuance contract consumed here.
- **Downstream sprints:** `SPR-MOD-003-006` (Sales Analytics & Controls) — per [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md).
- **Downstream module consumers of return data** (identifiers resolved from `docs/MODULE_CATALOG.md`; consumption is exclusively via events, read APIs, and the published request contracts):
  - **MOD-002 Accounting** — consumes accounting adjustment and refund preparation requests; owns vouchers, journals, ledgers, tax, receivables, and refund execution under `MOD002_ACCOUNTING_BASELINE_v1`.
  - **MOD-005 Inventory** — consumes inventory return-receipt events; owns stock movement, putaway, warehouse state, and item mastering.
  - **MOD-017 Analytics** — consumes return-lifecycle events for the return-analysis surface (via `SPR-MOD-003-006`).
  - **MOD-006 CRM** — consumes return-lifecycle events for customer-facing return status.
  - **MOD-010 Projects** — consumes return-lifecycle events where a project references a returned commitment.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Sales Ownership Convention in §1.1). See each engine's specification for capability details. Consumption mirrors the Sprint 5 row of `MOD-003_SPRINT_PLAN.md` §4 verbatim.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every return action per `ADR-032`. |
| `ENG-004` Audit | Records every return-lifecycle transition and every customer-adjustment record per `ADR-014`. |
| `ENG-007` Document | Provides return-request and return-authorization document rendering hooks. |
| `ENG-010` Workflow | Orchestrates return-lifecycle state transitions where workflow coordination is required. |
| `ENG-011` Approval | Executes explicit approval where return approval policy resolved via `ENG-005` requires it. |
| `ENG-012` Rules | Evaluates return validation rules deterministically (invoice-line reference, quantity ceiling, eligibility window, customer status). |
| `ENG-017` Numbering | Consumes the sales-return and customer-adjustment numbering series registered in `SPR-MOD-003-001`. |
| `ENG-018` Currency | Provides currency references on return lines derived from the referenced original invoice line; currency semantics are consumed, not redefined. |
| `ENG-024` Eventing | Publishes return-lifecycle events with the contracts declared in §11. |
| `ENG-025` Notification | Dispatches notifications on submitted, approved, rejected, receipt-confirmed, completed, and cancelled transitions. |

Sales returns business semantics (return lifecycle, validation rules, approval policy, customer-adjustment record, replacement / refund preparation) are owned by this module and are not delegated to any engine. Credit-note lifecycle is consumed from `SPR-MOD-003-004`; stock movement is consumed from MOD-005 Inventory; accounting vouchers, journals, ledgers, tax reversal, receivables, and refund execution are consumed from Accounting via `MOD002_ACCOUNTING_BASELINE_v1`. None of these are redefined here.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every return read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for every return-lifecycle transition and every customer-adjustment record. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every return action, including approval routing. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Return Request | MOD-003 (this sprint) | Commercial return commitment referencing an issued invoice line under a tenant/company. |
| Return Authorization | MOD-003 (this sprint) | Approval decision record produced by `ENG-011` for return approval routing. |
| Return Line | MOD-003 (this sprint) | Line-level return commitment referencing exactly one original invoice line and a returned quantity. |
| Customer Adjustment | MOD-003 (this sprint) | Commercial customer-adjustment record referencing the return, the original invoice line, and the resulting commercial outcome. |
| Replacement Request | MOD-003 (this sprint) | Replacement-preparation record produced when a return's commercial outcome is a replacement. |
| Refund Request | MOD-003 (this sprint) | Refund-preparation record produced when a return's commercial outcome is a refund; consumed by Accounting. |
| Return Status | MOD-003 (this sprint) | Enumeration of return-lifecycle states. |
| Return Attachment | MOD-003 (this sprint) | Attachment references, consumed from the attachment surface established in `SPR-MOD-003-002`. |
| Credit-Note Issuance Request | MOD-003 (this sprint) → `SPR-MOD-003-004`-consumed | Request record produced on completion (where policy requires) and consumed by Sales Invoicing. |
| Accounting Adjustment Request | MOD-003 (this sprint) → Accounting-consumed | Request record produced on completion and consumed by Accounting per `MOD002_ACCOUNTING_BASELINE_v1`. |
| Inventory Return-Receipt Event | MOD-003 (this sprint) → MOD-005-consumed | Commercial event published on receipt confirmation and consumed by MOD-005 Inventory. |
| Issued Invoice Line Reference | `SPR-MOD-003-004` (reference-scoped) | Read-only reference to an issued invoice line consumed by return validation. |
| Completed Delivery Reference | `SPR-MOD-003-003` (reference-scoped) | Read-only reference to a completed delivery consumed for return-eligibility checks where policy requires. |

### 10.2 Relationships

- A **return request** references exactly one **customer** and one or more **issued invoice lines** (read-only, owned by `SPR-MOD-003-004`) within the same tenant/company.
- A **return request** owns one or more **return lines**; each **return line** references exactly one **original invoice line**.
- A **customer adjustment** references exactly one **return request** and the originating **invoice line**.
- A **replacement request** references exactly one **return request** and MAY reference downstream commercial-document targets.
- A **refund request** references exactly one **return request** and is consumed by Accounting.
- A **return request** produces at most one **credit-note issuance request** and at most one **accounting adjustment request** on completion.
- A **return request** publishes exactly one **inventory return-receipt event** on receipt confirmation.
- A **return request / customer adjustment** owns zero or more **return attachments** and zero or more **return authorizations**.

### 10.3 Ownership Boundaries

- All entities listed as "MOD-003 (this sprint)" are owned by `MOD-003` per the Sales Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Credit-note lifecycle is consumed from `SPR-MOD-003-004`; it is not represented as a Sales-Returns-owned entity.
- Stock movement, putaway, warehouse state, and item mastering are consumed from MOD-005 Inventory; they are not represented as Sales-Returns-owned entities.
- Accounting vouchers, journals, ledgers, receivables ledger, tax reversal, and refund execution are consumed from Accounting via `MOD002_ACCOUNTING_BASELINE_v1`; they are not represented as Sales-Returns-owned entities.
- Issued invoices, completed deliveries, approved sales orders, customer master, sales organization, salespersons, and sales configuration are consumed from prior sprints; they are not redefined here.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

Only event names present verbatim in the authoritative event catalog are used at implementation time. Any illustrative event name below that is not yet present in the catalog SHALL be replaced with the authoritative catalog name or deferred through `R-EV-01` in §14. The event catalog is **not** modified by this sprint.

| Event Name (illustrative — subject to `R-EV-01`) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `return.submitted` | MOD-003 | SPR-MOD-003-005 | MOD-003 (self), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `return.validated` | MOD-003 | SPR-MOD-003-005 | MOD-003 (self), MOD-017 | At-least-once, ordered per tenant |
| `return.approved` | MOD-003 | SPR-MOD-003-005 | MOD-003 (self), MOD-002, MOD-005, MOD-017 | At-least-once, ordered per tenant |
| `return.rejected` | MOD-003 | SPR-MOD-003-005 | MOD-003 (self), MOD-006, MOD-017 | At-least-once, ordered per tenant |
| `return.receipt.confirmed` | MOD-003 | SPR-MOD-003-005 | MOD-003 (self), MOD-005, MOD-017 | At-least-once, ordered per tenant |
| `return.completed` | MOD-003 | SPR-MOD-003-005 | MOD-003 (self), MOD-002, MOD-005, MOD-017, MOD-006 | At-least-once, ordered per tenant |
| `return.cancelled` | MOD-003 | SPR-MOD-003-005 | MOD-003 (self), MOD-002, MOD-017, MOD-006 | At-least-once, ordered per tenant |
| `return.adjustment.recorded` | MOD-003 | SPR-MOD-003-005 | MOD-003 (self), MOD-002, MOD-017 | At-least-once, ordered per tenant |
| `return.replacement.requested` | MOD-003 | SPR-MOD-003-005 | MOD-003 (self), MOD-005, MOD-017 | At-least-once, ordered per tenant |
| `return.refund.requested` | MOD-003 | SPR-MOD-003-005 | MOD-003 (self), MOD-002, MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name above that is not present in the authoritative event catalog at authoring time is deferred via `R-EV-01` in §14 until registered through the event catalog governance process.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Return-lifecycle transitions and customer-adjustment records produce audit records via `ENG-004` per `ADR-014`.
- [ ] Approval routing where policy requires it executes via `ENG-011` per §5.3.
- [ ] Return validation rules evaluate deterministically via `ENG-012` per §5.2.
- [ ] A **credit-note issuance request** is published on completion where policy requires per §5.12; Sales-Returns does not issue the credit note.
- [ ] An **accounting adjustment request** is published on every completion transition per §5.13; Sales does not create the voucher, journal, ledger entry, tax reversal, or receivable adjustment.
- [ ] An **inventory return-receipt event** is published on every receipt-confirmation transition per §5.14; Sales does not perform a stock movement.
- [ ] Return-lifecycle events (§11) are registered in the event catalog with their contracts and are emitted on the corresponding transitions, or deferred via `R-EV-01`.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every return read and write.
- [ ] Return document numbers resolve via `ENG-017` from the series registered in `SPR-MOD-003-001`.
- [ ] Notifications on submitted, approved, rejected, receipt-confirmed, completed, and cancelled transitions are dispatched via `ENG-025`.
- [ ] No sprint deliverable creates a credit note, invoice, stock movement, accounting voucher, journal, ledger entry, receivable ledger entry, tax reversal, or refund payment.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-003_SPRINT_PLAN.md` §2 (`SPR-MOD-003-005`):

- Sales returns can be created, approved, and linked to original invoice lines.
- Customer adjustments are auditable and traceable to the original transaction.
- Return accounting contracts are produced for `MOD002_ACCOUNTING_BASELINE_v1` consumption.

**Cross-module Ownership Reaffirmation.** Sales produces commercial return, replacement, refund, adjustment, and credit-note-issuance request records; Sales-Invoicing owns credit-note issuance; Inventory owns stock movement and putaway; Accounting owns vouchers, journals, ledgers, tax, receivables, and refund execution under `MOD002_ACCOUNTING_BASELINE_v1`. Sales MUST NOT redefine any of these boundaries.

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
  - **Description:** MOD-003 depends on `MOD002_ACCOUNTING_BASELINE_v1` for the accounting adjustment contract, receivables ownership, tax reversal semantics, and refund execution.
  - **Impact:** Any weakening of Accounting ownership boundaries would allow Sales-Returns to accidentally absorb accounting, tax, or refund-execution behavior.
  - **Mitigation:** Rely on the frozen `MOD002_ACCOUNTING_BASELINE_v1`; treat boundary regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-003 depends on `SPR-MOD-003-001` … `SPR-MOD-003-004` for customer master, sales configuration, sales-document numbering series, approved-order references, completed-delivery references, issued-invoice references, and the credit-note issuance contract.
  - **Impact:** Any regression against the upstream Sales sprints breaks this sprint's assumptions.
  - **Mitigation:** Rely on the authored state of the upstream Sales sprints; escalate as a sprint dependency defect if regression occurs.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Inventory dependency — Sales-Returns publishes inventory return-receipt events but MUST NOT perform stock movement, putaway, valuation, warehouse-state update, or item mastering.
  - **Impact:** Silent absorption of Inventory semantics would violate the Sales-Returns / Inventory split and diverge from MOD-005 Inventory ownership.
  - **Mitigation:** Publish inventory return-receipt events as pure commercial events; consume no MOD-005-owned entities; never update stock state in Sales-Returns.
  - **Status:** Accepted

- **Risk ID:** R-05
  - **Description:** Credit-note dependency — Sales-Returns publishes credit-note issuance requests consumed by `SPR-MOD-003-004` but MUST NOT issue credit notes itself.
  - **Impact:** Silent absorption of credit-note lifecycle would violate the Sales-Returns / Sales-Invoicing split.
  - **Mitigation:** Publish credit-note issuance requests conforming to the `SPR-MOD-003-004` contract; never persist a credit-note document in this sprint.
  - **Status:** Accepted

- **Risk ID:** R-06
  - **Description:** Contract-drift dependency — the accounting adjustment request, credit-note issuance request, and refund preparation contracts must remain stable against `MOD002_ACCOUNTING_BASELINE_v1` and `SPR-MOD-003-004`.
  - **Impact:** Any drift between the Sales-Returns-published requests and the consumer contracts breaks the handoff.
  - **Mitigation:** Version each request contract against its consumer contract from the first draft; treat contract drift as a baseline/sprint defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Analytics is deferred to `SPR-MOD-003-006`.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries and pollute the returns layer.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Return-lifecycle event names declared in §11 (`return.submitted`, `return.validated`, `return.approved`, `return.rejected`, `return.receipt.confirmed`, `return.completed`, `return.cancelled`, `return.adjustment.recorded`, `return.replacement.requested`, `return.refund.requested`) are not yet present in the authoritative event catalog at authoring time.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Map to an authoritative equivalent where one exists; otherwise register via the event catalog governance process before this sprint enters `In Progress`. The event catalog is not modified by this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — return-request / return-line / customer-adjustment / replacement-request / refund-request state transitions; validation rule determinism ("return must reference an original invoice line", "return quantity SHALL NOT exceed invoiced quantity"); approval policy invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005` (approval and notification policy), workflow orchestration via `ENG-010`, approval via `ENG-011`, rules evaluation via `ENG-012`, numbering via `ENG-017`, event publication via `ENG-024`, notification dispatch via `ENG-025`, document rendering via `ENG-007`.
- **Contract** — return-lifecycle event contracts against the event catalog; credit-note issuance request against `SPR-MOD-003-004`; accounting adjustment request against `MOD002_ACCOUNTING_BASELINE_v1`; refund preparation request against `MOD002_ACCOUNTING_BASELINE_v1`; inventory return-receipt event against MOD-005 Inventory; invoice-line reference contract against `SPR-MOD-003-004`.
- **End-to-end (smoke)** — invoice-to-return-to-completion pipeline covering a rejection case, a receipt-confirmed-plus-completed case, a replacement-outcome case, and a refund-outcome case, under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: an issued-invoice-line reference stub (owned by `SPR-MOD-003-004`), an accounting-adjustment consumer stub, an Inventory return-receipt consumer stub, and a credit-note-issuance consumer stub, each proving cross-module ownership without redefining consumer behavior.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the return-request, customer-adjustment, replacement-request, and refund-request lifecycles as explicit state machines so audit emission (§5.16) and event publication (§5.18) are trivially satisfiable at every transition.
- Consider expressing return validation (§5.2) as a single deterministic rule set evaluated via `ENG-012` whose inputs are (invoice-line reference, return quantity, invoice-line invoiced quantity, customer status, return-eligibility window) so the decision is independently testable.
- Consider registering return-lifecycle event names in the event catalog before this sprint enters `In Progress` (per `R-EV-01`), so downstream sprints subscribing to those events are not blocked.
- Consider versioning the credit-note issuance request, the accounting adjustment request, and the refund preparation request against their consumer contracts from the first draft, so contract drift is detectable early.
- Consider isolating inventory return-receipt event publication behind a single adapter, so any change to the MOD-005 Inventory-consumed contract is absorbed in one place.
- Consider co-locating return-document numbering series resolution through a single `ENG-017` adapter to keep numbering behavior in one place.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-003-005`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial sales-returns lifecycle — return request, approval, validation against original invoice lines, return-receipt confirmation, customer adjustments, replacement and refund preparation, return numbering, attachments, notifications, and lifecycle events — with audit, approval, cross-module request contracts, and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-003` MODULE_PRD section and every Module PRD capability chartered to this sprint is covered. No orphan requirements and no unallocated chartered capabilities.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Sales Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists credit-note issuance, stock movement / putaway, refund payment execution, journal / ledger posting, tax reversal computation, financial statements, analytics, quotations / sales orders, delivery, invoicing, and reverse-logistics gateways — each linked to its owning sprint, upstream baseline, or engine.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-003-006`) begin immediately after this one completes?**
   Yes. `SPR-MOD-003-006 Sales Analytics & Controls` is the immediate successor per [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-003-001` … `SPR-MOD-003-005`.
8. **Are Sales-Invoicing, Delivery, Inventory, Accounting, Tax, and Platform ownership boundaries preserved?**
   Yes. §1.1.2, §1.1.3, §1.1.4, §1.1.5, §5.11, §5.12, §5.13, §5.14, §5.19, §10.3, R-02, R-04, R-05, R-06. Sales publishes commercial return, replacement, refund, and adjustment records and the corresponding credit-note-issuance, accounting-adjustment, refund-preparation, and inventory-return-receipt request/event contracts consumed by their owning modules; consumes Platform baseline for tenancy, users, roles, permissions, configuration hierarchy, localization, and audit review. No upstream ownership is redefined.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md)
- Stage 1 Sprint Plan — [`./MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)
- Upstream sprints — [`./SPR-MOD-003-001-sales-foundation.md`](./SPR-MOD-003-001-sales-foundation.md), [`./SPR-MOD-003-002-quotations-sales-orders.md`](./SPR-MOD-003-002-quotations-sales-orders.md), [`./SPR-MOD-003-003-delivery-fulfillment.md`](./SPR-MOD-003-003-delivery-fulfillment.md), [`./SPR-MOD-003-004-sales-invoicing.md`](./SPR-MOD-003-004-sales-invoicing.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- ERP Core Engines — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
