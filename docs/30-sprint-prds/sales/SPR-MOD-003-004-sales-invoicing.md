---
title: "SPR-MOD-003-004 — Sales Invoicing"
summary: "Sprint PRD for the commercial invoicing lifecycle of MOD-003 Sales: sales invoice generation, validation, approval, amendment and cancellation; credit notes and debit notes; invoice numbering, attachments, notifications, and lifecycle events. Consumes accounting voucher creation, tax determination, and receivable creation contracts owned by MOD-002 Accounting; consumes completed deliveries from SPR-MOD-003-003; never redefines Accounting, Tax, Delivery, or Platform ownership."
layer: "delivery"
owner: "Sales"
status: "Draft"
updated: "2026-07-07"
sprint_id: "SPR-MOD-003-004"
parent_module: "MOD-003"
parent_sprint_plan: "MOD-003_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "8.4.4"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-011", "ENG-015", "ENG-017", "ENG-018", "ENG-019", "ENG-021", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "sales", "invoicing", "mod-003", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-003-004 — Sales Invoicing

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-003 Sales** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-003-004` (permanent) |
| Parent Module | `MOD-003` — Sales |
| Parent Sprint Plan | [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (both frozen) |
| Upstream Sprints | [`SPR-MOD-003-001`](./SPR-MOD-003-001-sales-foundation.md), [`SPR-MOD-003-002`](./SPR-MOD-003-002-quotations-sales-orders.md), [`SPR-MOD-003-003`](./SPR-MOD-003-003-delivery-fulfillment.md) |
| Downstream Sprints | `SPR-MOD-003-005`, `SPR-MOD-003-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial invoicing lifecycle** for BusinessOS Sales: sales invoice generation, validation, approval, amendment and cancellation; credit notes and debit notes; invoice numbering, attachments, notifications, and lifecycle events. This sprint sits on top of the Delivery & Fulfillment sprint (`SPR-MOD-003-003`) and produces the commercial-invoicing surface that downstream Sales sprints (returns, analytics) and Accounting will consume via published contracts.

> **Sales Ownership Convention (reiterated).** The Sales module owns the business semantics of the commercial invoicing lifecycle. ERP Core Engines provide shared infrastructure (authorization, audit, document, approval, voucher, numbering, currency, tax, reporting, eventing, notification, export) but **MUST NOT** redefine Sales invoicing business rules. These conventions complement — and do not redefine — the Platform governance conventions established in `MOD001_PLATFORM_BASELINE_v1`, the Accounting ownership conventions established in `MOD002_ACCOUNTING_BASELINE_v1`, the Sales Foundation established in `SPR-MOD-003-001`, the Commercial Document Lifecycle established in `SPR-MOD-003-002`, or the Delivery & Fulfillment lifecycle established in `SPR-MOD-003-003`.

#### 1.1.1 Commercial Invoice Ownership

The Sales Invoice, Credit Note, and Debit Note commercial transactions and their commercial lifecycles are authoritatively owned by MOD-003 Sales. Sales owns invoice generation, invoice validation, invoice approval, invoice amendment, invoice cancellation, credit-note lifecycle, debit-note lifecycle, invoice numbering, invoice attachments, invoice notifications, and invoice lifecycle events. No other module MAY create, edit, approve, cancel, or amend a sales invoice, credit note, or debit note. Downstream modules consume commercial-invoice data via published events and read APIs; they MUST NOT redefine the commercial-invoicing commitment.

#### 1.1.2 Accounting Consumption Boundary

Commercial invoices, credit notes, and debit notes SHALL request accounting voucher creation exclusively through the contracts defined by [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md). Sales MUST NOT:

- create accounting vouchers;
- own the voucher lifecycle;
- create journals;
- post ledgers;
- calculate accounting balances;
- maintain receivables;
- close accounting periods.

Accounting remains the authoritative owner of accounting vouchers, journal posting, ledger posting, receivables ledger, and accounting period governance under `MOD002_ACCOUNTING_BASELINE_v1`. `ENG-015` Voucher and `ENG-019` Tax are consumed via the Accounting-owned contracts; their behavior is not redefined here.

#### 1.1.3 Tax Consumption Boundary

Sales consumes taxation provided through the Accounting-owned tax surface. Sales MAY determine which commercial transactions are taxable and which taxable line participates in a document, but Sales SHALL NOT redefine:

- the tax engine;
- tax configuration;
- tax calculation;
- tax reporting.

Tax determination is delegated to `ENG-019` Tax via the Accounting boundary; the resolved tax lines flow into invoice contracts as read-only inputs.

#### 1.1.4 Receivable Boundary

Invoice completion (invoice issued, credit note issued, debit note issued) MAY create downstream **receivable requests** for Accounting to consume. Receivable ownership belongs to Accounting per `MOD002_ACCOUNTING_BASELINE_v1`. Sales owns only the commercial invoice; Sales MUST NOT maintain a receivables ledger, allocate receipts, or manage collections. Payment collection, receipt allocation, and receivables reconciliation are out of scope for this sprint.

#### 1.1.5 Delivery Consumption Boundary

Sales invoices consume **completed deliveries** produced by `SPR-MOD-003-003` (Delivery & Fulfillment) as read-only references. This sprint MUST NOT redefine delivery ownership, delivery lifecycle, pick/pack coordination, shipment readiness, or delivery numbering. A sales invoice may exist against one or more completed delivery references, and a completed delivery may be invoiced in whole or in parts as permitted by amendment policy resolved via `ENG-005` (namespace initialized in `SPR-MOD-003-001`).

#### 1.1.6 Governance Complement

These conventions complement — and do not redefine — the Platform governance conventions established in `MOD001_PLATFORM_BASELINE_v1`, the Accounting ownership conventions established in `MOD002_ACCOUNTING_BASELINE_v1`, Sales Foundation (`SPR-MOD-003-001`), Commercial Document Lifecycle (`SPR-MOD-003-002`), and Delivery & Fulfillment (`SPR-MOD-003-003`).

### 1.2 In Scope

- Sales invoice lifecycle: draft → validated → approved → issued → cancelled, with amendment transitions where policy permits.
- Credit note lifecycle referencing an original invoice line.
- Debit note lifecycle referencing an original invoice line or an out-of-invoice adjustment permitted by policy.
- Invoice generation from one or more completed delivery references (consumed from `SPR-MOD-003-003`).
- Invoice validation via `ENG-012` (optional) and business rules owned by this sprint (e.g. "a sales invoice cannot be issued for a cancelled order" per MOD-003 MODULE_PRD §7).
- Invoice approval routing via `ENG-011` per amendment / exceptional-issue policy resolved via `ENG-005`.
- Invoice amendment (customer address, remit-to, invoice date within policy) with audit trail via `ENG-004`.
- Invoice cancellation prior to accounting handoff; post-handoff correction routes through Credit Note.
- Invoice document numbering consumption via `ENG-017` (series registered in `SPR-MOD-003-001`).
- Multi-currency awareness on invoice lines via `ENG-018` (currency semantics consumed, not redefined).
- Document rendering hooks for invoices, credit notes, and debit notes via `ENG-007`.
- Invoice attachments via the attachment surface established in `SPR-MOD-003-002` (consumed, not re-registered here).
- Notifications (validated, approved, issued, cancelled, credit-note-issued, debit-note-issued) via `ENG-025`.
- Invoice-lifecycle events (see §11) delivered via `ENG-024`.
- **Accounting voucher creation request** contract (published for consumption by `MOD002_ACCOUNTING_BASELINE_v1`); the voucher itself is created by Accounting via `ENG-015`.
- **Tax determination consumption** contract (Sales presents taxable lines; `ENG-019` returns resolved tax lines via the Accounting boundary).
- **Receivable creation request** contract (published for consumption by Accounting); the receivable is owned by Accounting.
- Invoice register consumption via `ENG-021` Reporting for the sales invoice register (report definition owned by Sales; formatting / delivery mechanics owned by `ENG-021`).
- Invoice bulk export via `ENG-027` for e-invoice-adjacent operational exports (external e-invoice / IRN gateway integrations remain out of scope; see §1.3).
- Authorization on every invoicing action via `ENG-002` per `ADR-032`.
- Audit of every invoice-lifecycle transition via `ENG-004` per `ADR-014`.
- Tenant isolation of every invoice read and write per `ADR-011`.

### 1.3 Out of Scope

Reserved for later Sales sprints (see [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)) or owned by upstream/adjacent modules:

- Payment collection, payment gateway integration, receipt allocation, receivables ledger management, collections — owned by `MOD-002` Accounting; consumed via `MOD002_ACCOUNTING_BASELINE_v1`.
- Journal creation, ledger posting, accounting voucher lifecycle, accounting balances, financial statements, accounting period close — owned by `MOD-002` Accounting.
- Tax engine implementation, tax configuration, tax calculation semantics, tax reporting — owned by `ENG-019` Tax via the Accounting boundary; consumed here.
- Accounting reports, financial statements — owned by `MOD-002` Accounting.
- Sales analytics, sales dashboards, KPIs — `SPR-MOD-003-006`.
- Sales returns lifecycle and customer adjustments — `SPR-MOD-003-005` (this sprint owns credit-note and debit-note commercial lifecycle; the *return* commercial process that produces credit notes ends here at the credit-note document).
- Quotation and sales order lifecycle, pricing, discount, credit-limit routing — `SPR-MOD-003-002`.
- Delivery order, pick/pack, shipment readiness, delivery completion — `SPR-MOD-003-003`.
- External e-invoice gateway / IRN provisioning, e-way-bill integrations, payment-gateway integrations — deferred and not scoped to any Sales sprint by `MOD-003_SPRINT_PLAN.md`; operational exports remain via `ENG-027`.
- Customer master, sales organization, salespersons, sales configuration, numbering-series *registration* — owned by `SPR-MOD-003-001`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-003-004`, the following will exist:

- **Business capabilities.**
  - A billing executive can generate a sales invoice against one or more completed delivery references under a tenant/company.
  - A billing executive or sales manager can validate, approve, amend, and cancel a sales invoice through its commercial lifecycle within policy.
  - A billing executive can issue a credit note referencing an original invoice line and a debit note referencing an original invoice line or a permitted out-of-invoice adjustment.
  - The sales invoice register and equivalent credit-/debit-note registers are available through `ENG-021` Reporting.
  - Invoice documents consume the numbering series registered in `SPR-MOD-003-001` via `ENG-017`.
  - Notifications on validated, approved, issued, cancelled, credit-note-issued, and debit-note-issued transitions are dispatched via `ENG-025`.
- **Published contracts.**
  - **Accounting voucher creation request** contract published for Accounting to consume; the voucher itself is created by Accounting via `ENG-015`.
  - **Tax determination consumption** contract used to obtain resolved tax lines via the Accounting-owned `ENG-019` boundary.
  - **Receivable creation request** contract published for Accounting to consume; receivable ownership remains with Accounting.
- **Published events.** Invoice-lifecycle event contracts (see §11) are prepared for registration in the event catalog and emitted by the corresponding transitions. Any event name not present in the authoritative event catalog at authoring time is deferred under `R-EV-01` (§14).
- **Configuration artifacts.** Invoice amendment policy, exceptional-issue policy, and notification configuration values resolve via `ENG-005` under the sales configuration namespace initialized in `SPR-MOD-003-001`. No new configuration keys are registered outside Sales' own ownership boundary.
- **Audit artifacts.** An audit record exists for every invoice / credit-note / debit-note lifecycle transition, produced via `ENG-004`.
- **Consumption contracts.** Completed-delivery references consumed from `SPR-MOD-003-003`, approved sales-order references consumed from `SPR-MOD-003-002`, and customer / sales-organization references consumed from `SPR-MOD-003-001` are documented as read-only inputs. No delivery-, order-, or foundation-owned entity is redefined.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-003-004`.
  - Invoice-lifecycle event entries referenced from §11 (subject to `R-EV-01` in §14).
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

Forward references: `SPR-MOD-003-005` (Returns & Customer Adjustments) consumes credit-note lifecycle produced here; `SPR-MOD-003-006` (Sales Analytics & Controls) consumes invoice events and the invoice register produced here.

---

## 3. Traceability to Module PRD

> **Bidirectional traceability.** Every Sprint Deliverable SHALL trace to one or more sections of [`docs/20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md); no orphan requirements and no unallocated Module PRD capabilities that this sprint is chartered to deliver are permitted.

| MOD-003 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Sales invoicing (incl. e-invoice) | Sales-invoice lifecycle; credit-/debit-note lifecycle; invoice numbering; operational export hooks (§2, §5) |
| §3 Personas — Sales Executive, Sales Manager, Order Desk; Accountant (secondary) | User stories (§4) |
| §4 Business Processes — Delivery-to-invoice | Completed-delivery → invoice → accounting-voucher-request → receivable-request pipeline (§5) |
| §6 Transactions — Sales Invoice, Credit Note | Invoice, credit-note, debit-note lifecycles and state transitions (§5) |
| §7 Business Rules — "A sales invoice cannot be issued for a cancelled order" | §5.1 acceptance criteria |
| §7 Business Rules — "Credit limit breach requires explicit approval" | Consumed from `SPR-MOD-003-002`; no re-definition (§1.6, §7) |
| §8 Integration Points — `SalesInvoiceIssued`, `CreditNoteIssued` published; `PaymentReceived` consumed by later sprints | Invoice-lifecycle events (§11); receivable-request contract (§2); payment-received consumption deferred to Accounting |
| §9 Reports & Analytics — Sales Register | Invoice register via `ENG-021` (§8) |
| §10 Configuration — Numbering series, Approval thresholds | Numbering consumed from Sales configuration namespace; amendment / exceptional-issue policy resolved via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Sales Module PRD, and no Sprint Deliverable is left un-traced.**

---

## 4. User Stories

- **US-001.** *As a **billing executive**, I want to generate a sales invoice from one or more completed delivery references, so that the customer commitment is billed against fulfilled goods.*
- **US-002.** *As a **billing executive**, I want to validate an invoice against Sales-owned business rules (including "no invoice for a cancelled order") before submitting it for approval, so that invalid invoices are rejected early.*
- **US-003.** *As a **sales manager** or **finance reviewer**, I want invoice approval to be routed through `ENG-011` when amendment / exceptional-issue policy requires it, so that commercial-invoicing risk is contained.*
- **US-004.** *As a **billing executive**, I want to amend an invoice (customer address, remit-to, invoice date within amendment policy) with an audit trail, so that legitimate corrections do not require full re-issuance.*
- **US-005.** *As a **billing executive**, I want to cancel an invoice prior to accounting handoff, so that erroneous invoices do not enter the accounting lifecycle.*
- **US-006.** *As a **billing executive**, I want to issue a credit note referencing an original invoice line, so that a legitimate reduction is captured as an authoritative commercial document.*
- **US-007.** *As a **billing executive**, I want to issue a debit note referencing an original invoice line or a permitted out-of-invoice adjustment, so that legitimate additions are captured authoritatively.*
- **US-008.** *As a **sales executive**, I want invoice documents to be rendered via `ENG-007` and dispatched to the **customer** via `ENG-025`, so that the customer receives an authoritative commercial document.*
- **US-009.** *As a **billing executive**, I want an accounting voucher creation request to be produced on invoice issuance, so that Accounting can create the voucher via `ENG-015` under `MOD002_ACCOUNTING_BASELINE_v1`.*
- **US-010.** *As a **billing executive**, I want tax determination to be delegated to `ENG-019` via the Accounting boundary, so that Sales does not redefine tax semantics.*
- **US-011.** *As a **billing executive**, I want a receivable creation request to be produced on invoice issuance, so that Accounting can materialize the receivable without Sales owning the receivables ledger.*
- **US-012.** *As a **customer** (external actor, system persona), I want invoice, credit-note, and debit-note notifications on issuance and cancellation, so that commercial-invoicing status is legible outside the system.*
- **US-013.** *As a **security reviewer** (system administrator persona), I want every invoice / credit-note / debit-note lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the invoicing history from an authoritative log.*
- **US-014.** *As a **system administrator**, I want tenant isolation invariants (`ADR-011`) enforced on every invoice read and write, so that no cross-tenant leakage is possible.*
- **US-015.** *As a **downstream module** (system persona), I want to receive invoice-lifecycle events, so that I can react to invoicing transitions in a decoupled way.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Invoice creation and cancelled-order guard (US-001, US-002)

- **Given** one or more completed delivery references (owned by `SPR-MOD-003-003`) for an active approved sales order under an active tenant/company,
  **when** a billing executive submits an invoice draft against those deliveries,
  **then** the invoice is persisted, receives a stable identifier and a document number resolved via `ENG-017`, and remains in state `Draft`.
- **Given** a completed delivery reference whose underlying sales order has been cancelled,
  **when** invoice creation is submitted,
  **then** the request is rejected (per MOD-003 MODULE_PRD §7) and no invoice is persisted; an audit record of the rejection is produced via `ENG-004`.

### 5.2 Invoice validation (US-002)

- **Given** a `Draft` invoice,
  **when** validation runs against Sales-owned business rules (delivery reference is `Completed`, customer is active, invoice line references a delivered quantity within policy, numbering series is resolvable),
  **then** the invoice transitions to `Validated` when rules are satisfied and remains in `Draft` otherwise; failure reasons are recorded via `ENG-004`.

### 5.3 Invoice approval routing (US-003)

- **Given** a `Validated` invoice whose amendment / exceptional-issue policy (resolved via `ENG-005`) requires explicit approval,
  **when** approval is submitted,
  **then** the request routes through `ENG-011` per `ADR-032`; the invoice cannot transition to `Issued` without an approval record.

### 5.4 Invoice issuance, tax, voucher and receivable requests (US-008, US-009, US-010, US-011)

- **Given** a `Validated` (or `Approved` where required) invoice,
  **when** it is issued,
  **then** the invoice transitions to `Issued`, tax lines are resolved via `ENG-019` through the Accounting boundary, an **accounting voucher creation request** is published for Accounting consumption (voucher creation itself is executed by Accounting via `ENG-015`), a **receivable creation request** is published for Accounting consumption, and the `invoice.issued` event (§11) is published via `ENG-024`.

### 5.5 Invoice amendment (US-004)

- **Given** an invoice not yet accepted by Accounting and a valid amendment within amendment policy resolved via `ENG-005`,
  **when** the amendment is submitted,
  **then** the change is persisted, an audit record is produced via `ENG-004`, and the `invoice.amended` event (§11) is published; post-handoff correction routes through Credit Note (§5.7) and not through amendment.

### 5.6 Invoice cancellation (US-005)

- **Given** an invoice not yet accepted by Accounting,
  **when** cancellation is submitted,
  **then** the invoice transitions to `Cancelled` and the `invoice.cancelled` event (§11) is published.
- **Given** an invoice already accepted by Accounting,
  **when** cancellation is submitted,
  **then** the request is rejected; correction routes through a Credit Note.

### 5.7 Credit note issuance (US-006)

- **Given** an `Issued` invoice with a line eligible for credit under policy,
  **when** a credit note referencing that line is submitted,
  **then** the credit note is persisted with a number resolved via `ENG-017`, tax and totals are resolved via the same Accounting-boundary contracts (§5.4), an accounting voucher creation request and a receivable-adjustment request are published for Accounting consumption, and the `creditnote.issued` event (§11) is published via `ENG-024`.

### 5.8 Debit note issuance (US-007)

- **Given** an `Issued` invoice with a line eligible for debit, or a permitted out-of-invoice adjustment resolved via `ENG-005`,
  **when** a debit note is submitted,
  **then** the debit note is persisted with a number resolved via `ENG-017`, tax and totals are resolved via the Accounting-boundary contracts (§5.4), an accounting voucher creation request and a receivable-adjustment request are published for Accounting consumption, and the `debitnote.issued` event (§11) is published via `ENG-024`.

### 5.9 Numbering and notifications (US-001, US-006, US-007, US-008, US-012)

- **Given** an invoice, credit-note, or debit-note transition that requires a document number,
  **when** it is executed,
  **then** the number resolves via `ENG-017` from the series registered in `SPR-MOD-003-001` and is unique within the tenant/company.
- **Given** any of the transitions Validated / Approved / Issued / Cancelled / CreditNoteIssued / DebitNoteIssued,
  **when** it fires,
  **then** a notification is dispatched via `ENG-025` per the notification configuration resolved via `ENG-005`.

### 5.10 Delivery reference consumption (US-001)

- **Given** any invoice-lifecycle transition that references a completed delivery,
  **when** it is executed,
  **then** the delivery reference is consumed exclusively as a read-only input; no Sales deliverable in this sprint creates, edits, cancels, or completes a delivery order, and no Sales deliverable performs a stock movement.

### 5.11 Accounting voucher request generation (US-009)

- **Given** an invoice, credit-note, or debit-note issuance transition,
  **when** it completes,
  **then** an **accounting voucher creation request** conforming to the contract defined by `MOD002_ACCOUNTING_BASELINE_v1` is published; Sales MUST NOT create the voucher, journal, or ledger entry itself.

### 5.12 Tax consumption (US-010)

- **Given** an invoice, credit-note, or debit-note that requires tax lines,
  **when** tax determination is invoked,
  **then** it is delegated to `ENG-019` via the Accounting boundary; Sales presents taxable lines and consumes the resolved tax lines as read-only inputs. Sales MUST NOT redefine tax engine, configuration, calculation, or reporting.

### 5.13 Receivable request generation (US-011)

- **Given** an invoice, credit-note, or debit-note issuance transition,
  **when** it completes,
  **then** a **receivable creation (or adjustment) request** is published for Accounting consumption; Sales MUST NOT maintain a receivables ledger, allocate receipts, or manage collections.

### 5.14 Unauthorized modification rejection (US-013, US-014)

- **Given** any invoice / credit-note / debit-note action,
  **when** it is submitted by a principal lacking the required permission under `ADR-032`,
  **then** `ENG-002` rejects the action and an audit record is produced via `ENG-004`.

### 5.15 Audit integration (US-013)

- **Given** any invoice / credit-note / debit-note lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, invoice / credit-note / debit-note identifier, transition type, and timestamp.

### 5.16 Isolation invariants (`ADR-011`) (US-014)

- **Given** any invoice / credit-note / debit-note read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.17 Invoice-lifecycle events (US-015)

- **Given** an invoice / credit-note / debit-note lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the authoritative event catalog. Only event names present in the event catalog are used; unregistered names are deferred under `R-EV-01`.

### 5.18 Ownership consumption invariants

- **Given** any downstream module requiring invoice data,
  **when** it reads or reacts to invoice / credit-note / debit-note lifecycle,
  **then** it does so exclusively through Sales-owned events and read APIs. No downstream module creates an independent commercial-invoicing commitment. Accounting owns vouchers, journals, ledgers, tax, and receivables; Sales owns the commercial invoice, credit note, and debit note.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-003` — Sales.
- **Module PRD:** [`docs/20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Sales invoicing), §3 (Sales Executive, Sales Manager, Order Desk, Accountant as secondary), §4 (Delivery-to-invoice), §6 (Sales Invoice, Credit Note), §7 (Business rule — no invoice for a cancelled order), §8 (`SalesInvoiceIssued`, `CreditNoteIssued` published; `PaymentReceived` deferred to Accounting consumption), §9 (Sales Register), §10 (Numbering series, Approval thresholds), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

> **Consumer module identifiers.** The consumer modules named in this section are identified by the authoritative module IDs recorded in [`docs/MODULE_CATALOG.md`](../../MODULE_CATALOG.md). If a consumer's module ID changes in the catalog, this section is corrected — the catalog remains the source of truth.

- **Parent:** `MOD-003` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting voucher creation contract, tax determination via `ENG-019`, receivables ownership, accounting period governance.
- **Upstream sprints:**
  - [`SPR-MOD-003-001`](./SPR-MOD-003-001-sales-foundation.md) — Customer master, sales organization, salespersons, sales configuration namespace, sales-document numbering-series registration.
  - [`SPR-MOD-003-002`](./SPR-MOD-003-002-quotations-sales-orders.md) — Approved sales-order reference and order amendment policy consumed here.
  - [`SPR-MOD-003-003`](./SPR-MOD-003-003-delivery-fulfillment.md) — Completed-delivery references consumed here.
- **Downstream sprints:** `SPR-MOD-003-005` (Returns & Customer Adjustments), `SPR-MOD-003-006` (Sales Analytics & Controls) — per [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md).
- **Downstream module consumers of invoice data** (identifiers resolved from `docs/MODULE_CATALOG.md`; consumption is exclusively via events, read APIs, and the published voucher / receivable request contracts):
  - **MOD-002 Accounting** — consumes accounting voucher creation requests and receivable creation requests; owns vouchers, journals, ledgers, tax, and receivables under `MOD002_ACCOUNTING_BASELINE_v1`.
  - **MOD-005 Inventory** — no direct consumption in this sprint; inventory movement is triggered upstream via delivery events (`SPR-MOD-003-003`).
  - **MOD-017 Analytics** — consumes invoice-lifecycle events for the invoice register and downstream analytics (via `SPR-MOD-003-006`).
  - **MOD-010 Projects** — consumes invoice-lifecycle events where a project references an invoiced commitment.
  - **MOD-006 CRM** — consumes invoice-lifecycle events for customer-facing invoicing status.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Sales Ownership Convention in §1.1). See each engine's specification for capability details. Consumption mirrors the Sprint 4 row of `MOD-003_SPRINT_PLAN.md` §4 verbatim.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every invoice / credit-note / debit-note action per `ADR-032`. |
| `ENG-004` Audit | Records every invoice / credit-note / debit-note lifecycle transition per `ADR-014`. |
| `ENG-007` Document | Provides invoice, credit-note, and debit-note document rendering hooks. |
| `ENG-011` Approval | Executes explicit approval for amendments and exceptional-issue cases resolved via `ENG-005` policy. |
| `ENG-015` Voucher | Consumed via `MOD002_ACCOUNTING_BASELINE_v1`; the accounting voucher creation request published by Sales is materialized by Accounting through `ENG-015`. Sales does not create vouchers. |
| `ENG-017` Numbering | Consumes the sales-invoice, credit-note, and debit-note numbering series registered in `SPR-MOD-003-001` for document numbers. |
| `ENG-018` Currency | Provides currency references on invoice / credit-note / debit-note lines derived from the referenced sales order and completed delivery; currency semantics are consumed, not redefined. |
| `ENG-019` Tax | Consumed via `MOD002_ACCOUNTING_BASELINE_v1`; resolves tax lines against taxable invoice / credit-note / debit-note lines. Tax semantics are consumed, not redefined. |
| `ENG-021` Reporting | Delivers the sales invoice register (and equivalent credit-/debit-note registers) as report definitions owned by Sales; report formatting and delivery mechanics are owned by `ENG-021`. |
| `ENG-024` Eventing | Publishes invoice-lifecycle events with the contracts declared in §11. |
| `ENG-025` Notification | Dispatches notifications on validated, approved, issued, cancelled, credit-note-issued, and debit-note-issued transitions. |
| `ENG-027` Export | Provides operational bulk export of invoice / credit-note / debit-note documents (e-invoice / IRN gateway integrations remain out of scope; see §1.3). |

Sales invoicing business semantics (invoice lifecycle, validation rules, amendment policy, exceptional-issue policy, credit-note and debit-note lifecycle) are owned by this module and are not delegated to any engine. Accounting vouchers, journals, ledgers, tax semantics, and receivables are consumed from Accounting via `MOD002_ACCOUNTING_BASELINE_v1` and are not redefined here.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every invoice / credit-note / debit-note read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for every invoice / credit-note / debit-note lifecycle transition. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every invoice / credit-note / debit-note action, including approval routing. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Sales Invoice | MOD-003 (this sprint) | Commercial invoice commitment issued against one or more completed delivery references under a tenant/company. |
| Invoice Line | MOD-003 (this sprint) | Line-level invoice commitment referencing a delivered quantity, an item (consumed from `MOD-005` Inventory), and a resolved tax reference (consumed via `ENG-019`). |
| Credit Note | MOD-003 (this sprint) | Commercial credit document referencing an original invoice line. |
| Debit Note | MOD-003 (this sprint) | Commercial debit document referencing an original invoice line or a permitted out-of-invoice adjustment. |
| Invoice Approval | MOD-003 (this sprint) | Approval decision record produced by `ENG-011` for amendment / exceptional-issue routing. |
| Invoice Amendment | MOD-003 (this sprint) | Amendment record produced during in-lifecycle amendment. |
| Invoice Attachment | MOD-003 (this sprint) | Attachment references, consumed from the attachment surface established in `SPR-MOD-003-002`. |
| Invoice Status | MOD-003 (this sprint) | Enumeration of sales-invoice lifecycle states. |
| Accounting Voucher Creation Request | MOD-003 (this sprint) → Accounting-consumed | Request record produced on issuance and consumed by Accounting per `MOD002_ACCOUNTING_BASELINE_v1`. |
| Receivable Creation Request | MOD-003 (this sprint) → Accounting-consumed | Request record produced on issuance and consumed by Accounting per `MOD002_ACCOUNTING_BASELINE_v1`. |
| Completed Delivery Reference | `SPR-MOD-003-003` (reference-scoped) | Read-only reference to a completed delivery consumed by invoice generation. |
| Sales Order Reference | `SPR-MOD-003-002` (reference-scoped) | Read-only reference to an approved sales order consumed indirectly through the completed-delivery reference. |
| Tax Line Reference | `ENG-019` via Accounting boundary (reference-scoped) | Read-only reference to resolved tax lines consumed by invoice / credit-note / debit-note totals. |

### 10.2 Relationships

- A **sales invoice** references one or more **completed delivery references** (read-only, owned by `SPR-MOD-003-003`) within the same tenant/company.
- A **sales invoice** owns one or more **invoice lines**.
- A **credit note** references exactly one **invoice line** (read-only, owned by this sprint) as its originating line.
- A **debit note** references exactly one **invoice line** or one policy-permitted out-of-invoice adjustment reference.
- A **sales invoice / credit note / debit note** owns zero or more **invoice amendments** and zero or more **invoice approvals**.
- A **sales invoice / credit note / debit note** produces exactly one **accounting voucher creation request** and exactly one **receivable creation request** on issuance.

### 10.3 Ownership Boundaries

- All entities listed as "MOD-003 (this sprint)" are owned by `MOD-003` per the Sales Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Accounting vouchers, journals, ledgers, receivables ledger, tax computation, and accounting periods are consumed from Accounting via `MOD002_ACCOUNTING_BASELINE_v1`; they are not represented as Sales-owned entities in this sprint.
- Completed deliveries and delivery-lifecycle events are consumed from `SPR-MOD-003-003`; they are not redefined here.
- Approved sales orders and order amendment policy are consumed from `SPR-MOD-003-002`; they are not redefined here.
- Customer master, sales organization, salespersons, and sales configuration are consumed from `SPR-MOD-003-001`; they are not redefined here.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

The Sales Module PRD §8 declares `SalesInvoiceIssued` and `CreditNoteIssued` as the illustrative business-level events for this bounded context. The lifecycle event contracts below are aligned to those business-level events under the Sales Ownership Convention. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is **not** modified by this sprint.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `invoice.created` | MOD-003 | SPR-MOD-003-004 | MOD-003 (self), MOD-002 (Accounting), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `invoice.validated` | MOD-003 | SPR-MOD-003-004 | MOD-003 (self), MOD-017 | At-least-once, ordered per tenant |
| `invoice.approved` | MOD-003 | SPR-MOD-003-004 | MOD-003 (self), MOD-002, MOD-017 | At-least-once, ordered per tenant |
| `invoice.issued` | MOD-003 | SPR-MOD-003-004 | MOD-003 (self), MOD-002, MOD-017, MOD-006 (CRM), MOD-010 (Projects) | At-least-once, ordered per tenant |
| `invoice.amended` | MOD-003 | SPR-MOD-003-004 | MOD-003 (self), MOD-002, MOD-017 | At-least-once, ordered per tenant |
| `invoice.cancelled` | MOD-003 | SPR-MOD-003-004 | MOD-003 (self), MOD-002, MOD-017, MOD-006 | At-least-once, ordered per tenant |
| `creditnote.created` | MOD-003 | SPR-MOD-003-004 | MOD-003 (self), MOD-002, MOD-017 | At-least-once, ordered per tenant |
| `creditnote.issued` | MOD-003 | SPR-MOD-003-004 | MOD-003 (self), MOD-002, MOD-017, MOD-006 | At-least-once, ordered per tenant |
| `debitnote.created` | MOD-003 | SPR-MOD-003-004 | MOD-003 (self), MOD-002, MOD-017 | At-least-once, ordered per tenant |
| `debitnote.issued` | MOD-003 | SPR-MOD-003-004 | MOD-003 (self), MOD-002, MOD-017, MOD-006 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name above that is not present in the authoritative event catalog at authoring time is deferred via `R-EV-01` in §14 until registered through the event catalog governance process.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Invoice-lifecycle transitions produce audit records via `ENG-004` per `ADR-014`.
- [ ] Approval routing for amendment / exceptional-issue cases executes via `ENG-011` per §5.3.
- [ ] Tax determination is delegated to `ENG-019` via the Accounting boundary per §5.12; Sales does not compute tax.
- [ ] An **accounting voucher creation request** is published on every issuance transition per §5.11; Sales does not create the voucher.
- [ ] A **receivable creation (or adjustment) request** is published on every issuance transition per §5.13; Sales does not maintain a receivables ledger.
- [ ] Invoice-lifecycle events (§11) are registered in the event catalog with their contracts and are emitted on the corresponding transitions, or deferred via `R-EV-01`.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every invoice / credit-note / debit-note read and write.
- [ ] Invoice / credit-note / debit-note document numbers resolve via `ENG-017` from the series registered in `SPR-MOD-003-001`.
- [ ] Notifications on validated, approved, issued, cancelled, credit-note-issued, and debit-note-issued transitions are dispatched via `ENG-025`.
- [ ] No sprint deliverable creates an accounting voucher, journal, ledger entry, receivables ledger entry, or redefines tax semantics.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-003_SPRINT_PLAN.md` §2 (`SPR-MOD-003-004`):

- Sales invoices, credit notes, and debit notes can be created, approved, and cancelled through the business lifecycle.
- Tax determination resolves via `ENG-019`.
- Receivable creation contracts are produced for downstream consumption.
- `SalesInvoiceIssued` and `CreditNoteIssued` events are published via `ENG-024`.

**Accounting Voucher Creation Contract.** Sales produces commercial documents (Sales Invoice, Credit Note, Debit Note) and requests accounting voucher creation by consuming `MOD002_ACCOUNTING_BASELINE_v1`. Sales MUST NOT create accounting journals, ledger entries, or independently manage accounting voucher lifecycles. Accounting remains the authoritative owner of accounting vouchers, journal posting, ledger posting, taxation, financial reporting, and accounting period governance.

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
  - **Description:** MOD-003 depends on `MOD002_ACCOUNTING_BASELINE_v1` for the accounting voucher creation contract, `ENG-019` Tax boundary, and receivables ownership.
  - **Impact:** Any weakening of Accounting ownership boundaries would allow Sales to accidentally absorb accounting, tax, or receivables behavior.
  - **Mitigation:** Rely on the frozen `MOD002_ACCOUNTING_BASELINE_v1`; treat boundary regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-003 depends on `SPR-MOD-003-001` (Sales Foundation), `SPR-MOD-003-002` (Quotations & Sales Orders), and `SPR-MOD-003-003` (Delivery & Fulfillment) for customer master, sales configuration, sales-document numbering series, approved sales-order references, order amendment policy, and completed-delivery references.
  - **Impact:** Any regression against the upstream Sales sprints breaks this sprint's assumptions.
  - **Mitigation:** Rely on the authored state of the upstream Sales sprints; escalate as a sprint dependency defect if regression occurs.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Tax dependency — Sales consumes `ENG-019` Tax via the Accounting boundary but MUST NOT redefine tax semantics.
  - **Impact:** Silent absorption of tax semantics would violate the Sales/Accounting split and diverge from `ENG-019`.
  - **Mitigation:** Present taxable lines to `ENG-019` via the Accounting boundary; consume resolved tax lines as read-only inputs; never compute tax in Sales.
  - **Status:** Accepted

- **Risk ID:** R-05
  - **Description:** Delivery dependency — Sales consumes completed-delivery references from `SPR-MOD-003-003` but MUST NOT redefine delivery ownership, lifecycle, or stock movement.
  - **Impact:** Silent absorption of delivery semantics would violate the Sales-Invoicing / Delivery split.
  - **Mitigation:** Consume completed-delivery references as read-only inputs; do not re-open delivery lifecycle; forward corrections through Credit Note or Delivery cancellation upstream.
  - **Status:** Accepted

- **Risk ID:** R-06
  - **Description:** Voucher contract dependency — the accounting voucher creation request produced here must conform to a stable contract defined by `MOD002_ACCOUNTING_BASELINE_v1`.
  - **Impact:** Any drift between the Sales-published request and the Accounting-consumed contract breaks the handoff.
  - **Mitigation:** Version the request against `MOD002_ACCOUNTING_BASELINE_v1`; treat contract drift as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Returns, credit-limit enforcement on invoicing, and analytics are deferred to `SPR-MOD-003-005` and `SPR-MOD-003-006`.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries and pollute the invoicing layer.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Invoice-lifecycle event names declared in §11 (`invoice.created`, `invoice.validated`, `invoice.approved`, `invoice.issued`, `invoice.amended`, `invoice.cancelled`, `creditnote.created`, `creditnote.issued`, `debitnote.created`, `debitnote.issued`) are not yet present in the authoritative event catalog at authoring time.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Map to an authoritative equivalent where one exists; otherwise register via the event catalog governance process before this sprint enters `In Progress`. The event catalog is not modified by this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — invoice / credit-note / debit-note state transitions; validation rule determinism ("no invoice for a cancelled order", "credit note references an original invoice line"); amendment policy invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005` (amendment and notification policy), approval via `ENG-011`, numbering via `ENG-017`, tax resolution via `ENG-019` boundary, reporting via `ENG-021`, event publication via `ENG-024`, notification dispatch via `ENG-025`, export via `ENG-027`.
- **Contract** — invoice-lifecycle event contracts against the event catalog; accounting voucher creation request against `MOD002_ACCOUNTING_BASELINE_v1`; receivable creation request against `MOD002_ACCOUNTING_BASELINE_v1`; tax determination request against the `ENG-019` boundary; completed-delivery reference contract against `SPR-MOD-003-003`.
- **End-to-end (smoke)** — delivery-to-invoice-to-voucher-request pipeline including a cancellation-guard case, a credit-note case, and an amendment-approval case, under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a completed-delivery reference stub (owned by `SPR-MOD-003-003`), a tax-resolution stub (owned by `ENG-019` via the Accounting boundary), and an Accounting voucher-consumer stub to prove §5.11 without redefining `MOD002_ACCOUNTING_BASELINE_v1` behavior.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the invoice, credit-note, and debit-note lifecycles as explicit state machines so audit emission (§5.15) and event publication (§5.17) are trivially satisfiable at every transition.
- Consider expressing invoice validation (§5.2) as a single deterministic rule set whose inputs are (delivery reference status, sales-order status, customer status, numbering-series resolvability, amendment policy) so the decision is independently testable.
- Consider registering invoice-lifecycle event names in the event catalog before this sprint enters `In Progress` (per `R-EV-01`), so downstream sprints subscribing to those events are not blocked.
- Consider versioning the accounting voucher creation request and the receivable creation request against `MOD002_ACCOUNTING_BASELINE_v1` from the first draft, so contract drift is detectable early.
- Consider isolating tax-line consumption behind a single adapter over the `ENG-019` boundary, so any change to the Accounting-owned tax surface is absorbed in one place.
- Consider co-locating invoice, credit-note, and debit-note numbering series resolution through a single `ENG-017` adapter to keep numbering behavior in one place.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-003-004`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial invoicing lifecycle — sales invoice, credit notes, debit notes, invoice numbering, attachments, notifications, and lifecycle events — with audit, approval, tax consumption, voucher / receivable request generation, and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-003` MODULE_PRD section and every Module PRD capability chartered to this sprint is covered. No orphan requirements and no unallocated chartered capabilities.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Sales Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists payment collection, receivables ledger, journal / ledger posting, tax engine implementation, financial statements, analytics, returns, quotations / sales orders, delivery, and external gateways — each linked to its owning sprint, upstream baseline, or engine.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-003-005`) begin immediately after this one completes?**
   Yes. `SPR-MOD-003-005 Returns & Customer Adjustments` is the immediate successor per [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-003-002` and `SPR-MOD-003-004`.
8. **Are Accounting, Tax, Delivery, and Platform ownership boundaries preserved?**
   Yes. §1.1.2, §1.1.3, §1.1.4, §1.1.5, §5.10, §5.11, §5.12, §5.13, §5.18, §10.3, R-02, R-04, R-05, R-06. Sales publishes accounting voucher and receivable request contracts consumed by `MOD002_ACCOUNTING_BASELINE_v1`; consumes tax via `ENG-019` through the Accounting boundary; consumes completed-delivery references as read-only inputs; consumes Platform baseline for tenancy, users, roles, permissions, configuration hierarchy, localization, and audit review. No upstream ownership is redefined.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md)
- Stage 1 Sprint Plan — [`./MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)
- Upstream sprints — [`./SPR-MOD-003-001-sales-foundation.md`](./SPR-MOD-003-001-sales-foundation.md), [`./SPR-MOD-003-002-quotations-sales-orders.md`](./SPR-MOD-003-002-quotations-sales-orders.md), [`./SPR-MOD-003-003-delivery-fulfillment.md`](./SPR-MOD-003-003-delivery-fulfillment.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- ERP Core Engines — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
