---
title: "SPR-MOD-004-004 — Vendor Billing & Commercial 3-Way Match"
summary: "Sprint PRD for the commercial vendor billing lifecycle: Vendor Bill creation, drafts, validation, amendments, approval, cancellation, finalization, debit/credit note requests, attachments, numbering, Commercial 3-Way Match against PO and GRN, exception identification and workflow, notifications, audit, and commercial billing events. Consumes SPR-MOD-004-002 Purchase Orders, SPR-MOD-004-003 Goods Receipts, and upstream baselines; never redefines them; does not own accounting journals, ledger posting, payables, tax posting, or payment execution."
layer: "delivery"
owner: "Procurement"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-004-004"
parent_module: "MOD-004"
parent_sprint_plan: "MOD-004_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "8.6.4"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-011", "ENG-012", "ENG-015", "ENG-017", "ENG-018", "ENG-019", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "purchase", "vendor-billing", "three-way-match", "mod-004", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-004-004 — Vendor Billing & Commercial 3-Way Match

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-004 Purchase** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines, Accepted ADRs, the Purchase Orders established by `SPR-MOD-004-002`, the Goods Receipts established by `SPR-MOD-004-003`, the Vendor Master established by `SPR-MOD-004-001`, and Accounting ownership established by `MOD002_ACCOUNTING_BASELINE_v1`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-004-004` (permanent) |
| Parent Module | `MOD-004` — Purchase |
| Parent Sprint Plan | [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (all frozen) |
| Upstream Sprints | [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md), [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md) (originating supplier of Purchase Order capabilities), [`SPR-MOD-004-003`](./SPR-MOD-004-003-goods-receipt-inspection.md) (originating supplier of Goods Receipt capabilities) |
| Downstream Sprints | `SPR-MOD-004-005`, `SPR-MOD-004-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial vendor billing lifecycle** for BusinessOS: Vendor Bill creation, drafts, validation, amendments, approval, cancellation, finalization, debit-note and credit-note requests, attachments, vendor-bill numbering, **Commercial 3-Way Match** comparing Purchase Order ↔ Goods Receipt Note ↔ Vendor Bill, exception identification and commercial resolution workflow, notifications, audit, and commercial billing events. Sprint 4 owns the buyer-side commercial decision that a supplier bill is authentic, matched, and approved from a commercial standpoint. It is the substrate that purchase returns (`SPR-MOD-004-005`) and purchase analytics (`SPR-MOD-004-006`) depend on for billing traceability and match-exception surfaces.

> **Vendor Billing Ownership Convention.** MOD-004 Purchase owns the business semantics of the commercial Vendor Bill document lifecycle, bill validation, amendment, approval, cancellation, finalization, debit/credit note request, and Commercial 3-Way Match. ERP Core Engines provide shared infrastructure (authorization, audit, document, attachment, approval, rules, voucher-request wiring, numbering, currency, tax input, eventing, notification) but **MUST NOT** redefine vendor-billing business rules. Downstream Purchase sprints consume commercial billing context rather than reintroducing parallel billing lifecycles. This complements — and does not redefine — the Purchase Ownership Convention established in `SPR-MOD-004-001`, the Purchase Document Ownership Convention established in `SPR-MOD-004-002`, the Goods Receipt Ownership Convention established in `SPR-MOD-004-003`, and the ownership boundaries codified by `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, and `MOD003_SALES_BASELINE_v1`.

#### 1.1.1 Purchase Order Consumption (Upstream Dependency on SPR-MOD-004-002)

`SPR-MOD-004-002` SHALL be treated as the **originating supplier** of all Purchase Order capabilities consumed by Sprint 4. Sprint 4 SHALL consume Purchase Orders originating from `SPR-MOD-004-002` and SHALL NOT redefine Purchase Order ownership, PO lifecycle, PO approval routing, PO pricing/discount application, PO amendment lifecycle, or buyer-commitment semantics. Any PO attribute required for Vendor Bill validation or Commercial 3-Way Match is resolved from the Purchase Order established by `SPR-MOD-004-002`.

#### 1.1.2 Goods Receipt Consumption (Upstream Dependency on SPR-MOD-004-003)

`SPR-MOD-004-003` SHALL be treated as the **originating supplier** of all Goods Receipt capabilities consumed by Sprint 4. Sprint 4 SHALL consume Goods Receipts originating from `SPR-MOD-004-003` and SHALL NOT redefine Goods Receipt ownership, GR lifecycle, receipt validation, quantity verification, damage recording, inspection hold, acceptance, or rejection. Any GRN attribute required for Vendor Bill validation or Commercial 3-Way Match is resolved from the Goods Receipt established by `SPR-MOD-004-003`.

#### 1.1.3 Accounting Consumption Boundary

Accounting ownership remains governed exclusively by [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md). Sprint 4 SHALL NOT:

- create accounting vouchers
- create journals
- post to the general ledger
- create or mutate payables ledger records
- perform accounting tax posting
- execute payments or maintain payment records
- own accounting period governance or financial reporting

Vendor Bill finalization by Sprint 4 is a Purchase-domain commercial signal. Any accounting effect (voucher creation, journal posting, payables recognition, tax posting) is owned by Accounting and requested through the repository-defined **Accounting Voucher Creation Contract** consumed via `MOD002_ACCOUNTING_BASELINE_v1`. `ENG-015` Voucher is consumed strictly as the repository-standard wiring surface for requesting accounting voucher creation; Sprint 4 does not redefine voucher semantics or perform ledger posting.

#### 1.1.4 Commercial 3-Way Match Boundary

Sprint 4 governs **commercial** 3-Way Match only — a deterministic commercial comparison of Purchase Order ↔ Goods Receipt Note ↔ Vendor Bill (quantity, price, and receipt reconciliation), commercial exception identification, and commercial approval / override of exceptions. Sprint 4 SHALL NOT:

- perform accounting reconciliation
- perform ledger reconciliation
- perform payables reconciliation
- perform tax reconciliation
- perform any GR/IR or accrual reconciliation

Accounting-side reconciliation remains owned by Accounting.

#### 1.1.5 Tax Boundary

MOD-002 Accounting owns taxation. Sprint 4 MAY consume calculated tax values from `ENG-019` Tax as inputs to the Vendor Bill totals and Commercial 3-Way Match, but SHALL NOT redefine tax determination rules, tax posting, tax registers, or tax reporting. All tax posting remains owned by Accounting.

#### 1.1.6 Commercial Billing Boundary

Vendor Bill finalization MAY emit repository-defined commercial billing events and SHALL request downstream accounting processing through approved repository contracts (see §1.1.3). Sprint 4 SHALL NOT post accounting journals directly, and SHALL NOT execute payments.

#### 1.1.7 Numbering Consumption

Vendor Bill document numbering is consumed via `ENG-017` from a series registered by `SPR-MOD-004-001` (Purchase Foundation, purchase-document numbering series). Sprint 4 does not register a new numbering scheme; it consumes the repository-approved numbering engine allocated to Sprint 4 in [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-004`).

#### 1.1.8 Governance Complement

This Sprint PRD complements but SHALL NOT redefine:

- [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md)
- [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md)
- [`SPR-MOD-004-003`](./SPR-MOD-004-003-goods-receipt-inspection.md)

### 1.2 In Scope

- **Vendor Bill lifecycle.** Creation, drafts, validation, amendment, submission, approval, cancellation, and finalization of Vendor Bills against one or more Purchase Orders and Goods Receipts under a tenant/company.
- **Vendor Bill validation.** Structural and referential validation: PO reference validity, GRN reference validity, supplier consistency between PO/GRN/Vendor Bill, currency consistency, line reference validity.
- **Amendments.** Structured amendment of a Vendor Bill prior to finalization, with audit of prior and new values.
- **Approval.** Approval routing of Vendor Bills and of match-exception overrides via `ENG-011`.
- **Cancellation.** Deterministic cancellation of a non-finalized Vendor Bill, with structured reason and audit.
- **Finalization.** Terminal commercial state for an approved and matched Vendor Bill; the finalization event triggers downstream consumers and the Accounting Voucher Creation Contract handoff.
- **Debit / Credit Note requests.** Commercial request for a debit note or credit note against a Vendor Bill or Vendor Bill line, with structured reason (physical returns and debit-note issuance are owned by `SPR-MOD-004-005`).
- **Vendor Bill numbering.** Consumption of the Vendor Bill numbering series via `ENG-017` from a series registered by `SPR-MOD-004-001`.
- **Attachments.** Attachment binding on Vendor Bill documents via `ENG-008` (supplier invoice PDF, evidence, correspondence).
- **Commercial 3-Way Match.** Deterministic commercial comparison of PO ↔ GRN ↔ Vendor Bill at line and header granularity, using tolerance rules resolved via `ENG-012` (Module PRD §7).
- **Match exceptions.** Structured identification of qty, price, and receipt mismatches with typed exception records.
- **Match-exception workflow.** Commercial exception resolution: acknowledgement, override with structured reason (via `ENG-011`), or rejection back to the vendor.
- **Tax input.** Consumption of calculated tax values via `ENG-019` as inputs to Vendor Bill totals and Commercial 3-Way Match; tax posting is not performed here.
- **Notifications.** Buyer, procurement manager, accounts liaison, and finance reviewer notifications on lifecycle transitions via `ENG-025`.
- **Audit.** Audit records for every Vendor Bill and match-exception lifecycle transition via `ENG-004`.
- **Commercial billing events.** Publication of commercial billing events via `ENG-024`, subject to authoritative event-catalog resolution (see §11 and `R-EV-01`). `PurchaseInvoiceReceived` is published on finalization per Module PRD §8 and Sprint Plan Sprint 4 Exit Criteria.
- **Accounting Voucher Creation Contract.** Consumption of the repository-approved contract exposed by `MOD002_ACCOUNTING_BASELINE_v1`, wired through `ENG-015`, to request downstream accounting voucher creation.

### 1.3 Out of Scope

Reserved for later Purchase sprints (see [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)):

- Purchase returns and debit-note issuance (physical return of previously-received goods; debit-note document issuance) — `SPR-MOD-004-005`.
- Purchase analytics, spend analytics, PO ageing, supplier performance, price variance dashboards, 3-way match exception review dashboards — `SPR-MOD-004-006`.

Owned elsewhere and consumed only:

- Vendor Master, supplier categorisation, buyer master, purchasing organization, T&C master, purchase price list master, purchase configuration namespace, purchase-document numbering series registration — `SPR-MOD-004-001`.
- Purchase Requisition, RFQ, Vendor Quotation, Quote Comparison, and Purchase Order lifecycles; PO approval routing; PO amendments; commercial pricing/discount application on the PO chain — `SPR-MOD-004-002`.
- Goods Receipt lifecycle, receipt validation, quantity verification, damage recording, inspection hold, acceptance, rejection, receipt completion — `SPR-MOD-004-003`.
- Accounting vouchers, journal posting, ledger posting, taxation posting, payables ledger, payment execution, `PaymentSent` event publication, accounting period governance, financial reporting — MOD-002 Accounting via `MOD002_ACCOUNTING_BASELINE_v1`.
- Inventory item master, stock ledger, putaway, bin management, stock valuation, warehouse operations, inventory transactions and movements — MOD-005 Inventory.
- Customer master and sales-side lifecycles — MOD-003 Sales via `MOD003_SALES_BASELINE_v1`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-004-004`, the following will exist:

- **Business capabilities.**
  - A purchase executive can create a Vendor Bill referencing one or more Purchase Orders and Goods Receipts under a tenant/company, driving it through draft, submit, approve, cancel, and finalize transitions, with structured amendments prior to finalization.
  - A procurement manager can approve Vendor Bills and match-exception overrides via `ENG-011`.
  - Commercial 3-Way Match compares PO ↔ GRN ↔ Vendor Bill at line and header granularity; qty, price, and receipt mismatches are identified as typed exception records; exceptions are resolved via acknowledgement, override with reason, or rejection.
  - Vendor Bill validation enforces PO reference validity, GRN reference validity, supplier and currency consistency, and tolerance rules (Module PRD §7) via `ENG-012`.
  - Vendor Bill numbering is consumed via `ENG-017` from the series registered by `SPR-MOD-004-001`.
  - Attachments bind to Vendor Bill documents via `ENG-008`; notifications reach buyer, procurement manager, accounts liaison, and finance reviewer roles via `ENG-025`.
  - Debit-note and credit-note **requests** can be issued from a Vendor Bill or line, with structured reason; issuance of the debit-note document is deferred to `SPR-MOD-004-005`.
  - Tax input is consumed via `ENG-019` as an input to totals and match; no tax posting occurs here.
- **Published events.** Commercial billing event contracts (see §11) registered in the event catalog and emitted by the corresponding lifecycle transitions. `PurchaseInvoiceReceived` is published on finalization (Module PRD §8, Sprint Plan §2 `SPR-MOD-004-004` Exit Criteria).
- **Audit artifacts.** An audit record exists for every Vendor Bill and match-exception lifecycle transition, produced via `ENG-004`.
- **Accounting Voucher Creation Contract handoff.** Finalization emits the repository-defined request via `ENG-015` for downstream accounting voucher creation, consumed by MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`. Sprint 4 SHALL NOT create the accounting voucher itself.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-004-004`.
  - Commercial billing event entries in the event catalog referenced from §11.
- **Downstream forward references.** Deliverables produced here are consumed by `SPR-MOD-004-005` (Vendor Bill and match-exception context for returns and debit-note issuance) and `SPR-MOD-004-006` (billing data and match-exception events for analytics).
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

Bidirectional traceability. Every Sprint-4 capability traces back to an approved MOD-004 Module PRD section, and every relevant Module PRD section covered by Sprint 4 traces forward to a deliverable below. No Sprint-4 capability is orphaned from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-004`); unique originating allocation is preserved (no capability delivered here is also allocated to another Purchase sprint).

| MOD-004 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Supplier invoices and 3-way match | Vendor Bill lifecycle, Commercial 3-Way Match (§1.2, §5) |
| §2 Submodule — Invoices | Conceptual data model (§10), lifecycle (§5) |
| §3 Personas — Purchase Executive, Procurement Manager, Accounts Liaison, Finance Reviewer | User stories (§4) |
| §4 Business Processes — GRN-to-invoice, 3-way match | End-to-end lifecycle acceptance criteria (§5) |
| §6 Transactions — Purchase Invoice | Conceptual data model (§10) |
| §7 Business Rules — Invoice cannot exceed matched GRN plus configured tolerance without override | Rule binding via `ENG-012` (§5.4) |
| §8 Integration Points — `PurchaseInvoiceReceived` (published); `PaymentSent` (consumed) | Events (§11) |
| §9 Reports & Analytics — Purchase Register (data), 3-Way Match Exceptions (data) | Match exception model (§10), events (§11) — analytics dashboards owned by `SPR-MOD-004-006` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Purchase Module PRD, and no capability allocated to Sprint 4 in `MOD-004_SPRINT_PLAN.md` is orphaned from this Sprint PRD** (unique originating allocation preserved).

---

## 4. User Stories

- **US-001.** *As a purchase executive, I want to create a Vendor Bill referencing one or more Purchase Orders and Goods Receipts under a company, so that supplier invoices can be captured with commercial provenance.*
- **US-002.** *As a purchase executive, I want to amend a Vendor Bill prior to finalization with an audit trail, so that supplier corrections are traceable.*
- **US-003.** *As a procurement manager, I want Commercial 3-Way Match to compare PO ↔ GRN ↔ Vendor Bill deterministically, so that qty, price, and receipt mismatches are surfaced as typed exceptions.*
- **US-004.** *As a procurement manager, I want to approve Vendor Bills and to override match exceptions with a structured reason, so that commercial resolution is auditable.*
- **US-005.** *As a purchase controller, I want Vendor Bills that exceed configured tolerance without an override to be rejected deterministically, so that unauthorized over-billing is prevented.*
- **US-006.** *As a purchase executive, I want to issue a debit-note or credit-note request from a Vendor Bill or line with a structured reason, so that downstream `SPR-MOD-004-005` can issue the document.*
- **US-007.** *As an accounts liaison, I want Vendor Bill finalization to request accounting voucher creation via the repository-approved contract, so that Accounting can post the journal without Purchase encroaching on its ownership.*
- **US-008.** *As a finance reviewer, I want notifications on Vendor Bill and match-exception lifecycle transitions and the ability to attach the supplier invoice PDF and correspondence, so that supporting evidence is preserved.*
- **US-009.** *As a branch manager, I want every Vendor Bill and match record to be scoped to my tenant/company, so that isolation invariants are preserved.*
- **US-010.** *As a downstream module (system persona), I want to receive commercial billing finalization and match-exception events, so that returns, debit-note issuance, and analytics can react deterministically through approved repository contracts.*
- **US-011.** *As a system administrator, I want every commercial-document lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the vendor billing history from an authoritative log.*

Each user story traces to at least one Sprint Deliverable in §2.

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

**Ownership invariants.** In addition to the scenario-level criteria below, the following invariants apply globally to every Vendor Bill handled by this sprint:

- **Commercial 3-Way Match SHALL compare commercial documents only.**
- **Commercial Billing SHALL NOT create accounting journals.**
- **Vendor Bill completion MAY emit repository-defined billing events and SHALL request downstream accounting processing through approved repository contracts.**

### 5.1 Vendor Bill creation (US-001)

- **Given** one or more open Purchase Orders and associated Goods Receipts under an active company,
  **when** a purchase executive creates a Vendor Bill referencing them,
  **then** the Vendor Bill is persisted with a stable identifier, its number is consumed from the Vendor Bill series via `ENG-017`, and the transition is audited via `ENG-004`.
- **Given** a Vendor Bill in an editable state,
  **when** a purchase executive edits allowed fields (lines, amounts, references, remarks, attachments),
  **then** the update is persisted and audited.

### 5.2 Vendor Bill validation (US-001)

- **Given** a Vendor Bill draft,
  **when** it is submitted,
  **then** the Vendor Bill is validated to reference valid PO lines and GRN lines, and supplier and currency consistency between PO/GRN/Vendor Bill is enforced; inconsistencies are rejected deterministically and the rejection is audited.

### 5.3 Amendment (US-002)

- **Given** a submitted but non-finalized Vendor Bill,
  **when** an amendment is applied with a structured reason,
  **then** prior and new values are audited via `ENG-004` and the amendment is persisted.

### 5.4 Tolerance rule and Commercial 3-Way Match (US-003, US-005)

- **Given** a configured tolerance (Module PRD §7) resolved via the rule set registered by `SPR-MOD-004-001`,
  **when** a Vendor Bill is submitted for match against its PO and GRN,
  **then** Commercial 3-Way Match executes deterministically via `ENG-012` and computes typed exception records for qty, price, and receipt mismatches; any exception exceeding tolerance without an approved override causes the Vendor Bill to be blocked from finalization.
- **Given** a mismatch within tolerance,
  **when** the Vendor Bill is submitted,
  **then** the mismatch is recorded as an informational match result and does not block finalization.

### 5.5 Match-exception workflow (US-004)

- **Given** a Vendor Bill with one or more open match exceptions,
  **when** a procurement manager acknowledges, overrides (with structured reason routed via `ENG-011`), or rejects,
  **then** the exception transitions deterministically, the outcome is audited, and — on rejection — the Vendor Bill returns to the supplier with a structured rejection reason.

### 5.6 Approval (US-004)

- **Given** a submitted and matched Vendor Bill (or a match-exception override),
  **when** approval is invoked,
  **then** approval routing executes via `ENG-011`, the outcome is audited, and notifications are dispatched via `ENG-025`.

### 5.7 Cancellation (US-004)

- **Given** a non-finalized Vendor Bill,
  **when** cancellation is invoked with a structured reason,
  **then** the Vendor Bill transitions to cancelled, no accounting voucher request is emitted, and the cancellation is audited.

### 5.8 Finalization and Accounting Voucher Creation Contract handoff (US-007)

- **Given** an approved Vendor Bill whose match exceptions (if any) have been resolved,
  **when** finalization is submitted,
  **then** the Vendor Bill transitions to finalized, `PurchaseInvoiceReceived` is published via `ENG-024`, and a request for accounting voucher creation is emitted via `ENG-015` under the Accounting Voucher Creation Contract exposed by `MOD002_ACCOUNTING_BASELINE_v1`. Sprint 4 SHALL NOT post the accounting journal itself.

### 5.9 Debit / Credit Note request (US-006)

- **Given** a finalized Vendor Bill (or line) with a commercial disagreement,
  **when** a purchase executive issues a debit-note or credit-note **request** with a structured reason,
  **then** the request is persisted and audited, and downstream `SPR-MOD-004-005` MAY consume it to issue the debit-note document. Sprint 4 SHALL NOT issue the debit-note document itself.

### 5.10 Tax input (US-003)

- **Given** a Vendor Bill line requiring tax input,
  **when** it is validated or matched,
  **then** calculated tax values are consumed from `ENG-019` as an input to totals and to Commercial 3-Way Match; Sprint 4 SHALL NOT post tax.

### 5.11 Attachments (US-008)

- **Given** a Vendor Bill in an editable or submitted state,
  **when** an actor attaches a file (supplier invoice PDF, correspondence, evidence),
  **then** the attachment binds via `ENG-008` and is audited.

### 5.12 Notifications (US-008)

- **Given** a lifecycle transition on a Vendor Bill or match exception (submit, approve, override, reject, cancel, finalize),
  **when** it completes,
  **then** the configured notifications are dispatched via `ENG-025` to buyer, procurement manager, accounts liaison, and finance reviewer roles as configured.

### 5.13 Authorization (US-009)

- **Given** any Vendor Bill or match-exception action (create, edit, submit, amend, approve, override, reject, cancel, finalize, request DN/CN, attach),
  **when** it is invoked,
  **then** authorization is enforced via `ENG-002` per `ADR-032` (RBAC + ABAC), and unauthorized actions are rejected without side effects.

### 5.14 Audit integration (US-011)

- **Given** any Vendor Bill or match-exception lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp, per `ADR-014`.

### 5.15 Tenant isolation invariants (`ADR-011`)

- **Given** any Vendor Bill or match-exception read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.16 Commercial billing events (US-010)

- **Given** a commercial billing lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used; unresolved names are recorded as deferred `R-EV-*` risks in §14.

### 5.17 Ownership consumption invariants

- **Given** any Vendor Bill authored under this sprint,
  **when** it references supplier, PO, or GRN entities,
  **then** it does so exclusively through masters and documents established by `SPR-MOD-004-001` (Vendor Master), `SPR-MOD-004-002` (Purchase Order), and `SPR-MOD-004-003` (Goods Receipt). No parallel supplier, PO, or GRN master is introduced here, and no accounting journal, ledger entry, tax posting, payables record, or payment record is authored here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-004` — Purchase.
- **Module PRD:** [`docs/20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Supplier invoices and 3-way match; Invoices submodule), §3 (Purchase Executive, Procurement Manager, Accounts Liaison, Finance Reviewer), §4 (GRN-to-invoice, 3-way match), §6 (Purchase Invoice), §7 (Invoice-vs-matched-GRN tolerance rule), §8 (`PurchaseInvoiceReceived` — published; `PaymentSent` — consumed), §9 (Purchase Register data, 3-Way Match Exceptions data), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-004` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting ownership and the **Accounting Voucher Creation Contract** consumed by Vendor Bill finalization. Sprint 4 MUST NOT create accounting journals, ledger entries, payables ledger balances, tax postings, or payment records.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Customer master ownership boundary. Sprint 4 MUST NOT reference customer entities on procurement documents.
- **Upstream sprint dependencies:**
  - [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md) — Purchase Foundation (Vendor Master, buyer master, purchasing organization, purchase-document numbering series, purchase configuration namespace, tolerance rule registration).
  - [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md) — Requisitions, RFQs & Purchase Orders. **`SPR-MOD-004-002` SHALL be treated as the originating supplier of Purchase Order capabilities. Sprint 4 SHALL consume Purchase Orders originating from `SPR-MOD-004-002` and SHALL NOT redefine Purchase Order ownership.**
  - [`SPR-MOD-004-003`](./SPR-MOD-004-003-goods-receipt-inspection.md) — Goods Receipt & Inspection. **`SPR-MOD-004-003` SHALL be treated as the originating supplier of Goods Receipt capabilities. Sprint 4 SHALL consume Goods Receipts originating from `SPR-MOD-004-003` and SHALL NOT redefine Goods Receipt ownership.**
  - [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) — Sprint 4 allocation.
- **Downstream sprints:** `SPR-MOD-004-005` (Purchase Returns & Debit Notes — consumes Vendor Bill and match-exception context; issues the debit-note document), `SPR-MOD-004-006` (Purchase Analytics & Controls — consumes billing data and match-exception events).
- **Downstream module consumers of Sprint-4 events:** `MOD-004` (self, subsequent sprints), `MOD-002` Accounting (subscribes to finalization for voucher creation via the Accounting Voucher Creation Contract), `MOD-017` Analytics — consuming exclusively via events and read APIs. Module identifiers resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md).

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Vendor Billing Ownership Convention in §1.1). See each engine's specification for capability details.

One-line usage note per engine. Every engine identifier SHALL resolve verbatim from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 4 allocation in [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-004`). No placeholder, deprecated, undefined, or additional engine identifiers are permitted.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every Vendor Bill and match-exception action. |
| `ENG-004` Audit | Records every Vendor Bill and match-exception lifecycle transition with actor, tenant/company scope, entity identifier, transition type, and timestamp. |
| `ENG-007` Document | Provides the commercial-document primitive (identifier, header/line structure, lifecycle scaffolding) used by the Vendor Bill. |
| `ENG-008` Attachment | Binds supplier invoice PDFs, correspondence, and evidence to Vendor Bill documents. |
| `ENG-011` Approval | Routes Vendor Bill approvals and match-exception overrides. |
| `ENG-012` Rules | Evaluates the invoice-vs-matched-GRN tolerance rule (Module PRD §7) and drives Commercial 3-Way Match at submission. |
| `ENG-015` Voucher | Wires the request for downstream accounting voucher creation under the Accounting Voucher Creation Contract exposed by `MOD002_ACCOUNTING_BASELINE_v1`; Sprint 4 does not create the voucher itself. |
| `ENG-017` Numbering | Consumes the Vendor Bill numbering series registered by `SPR-MOD-004-001`. |
| `ENG-018` Currency | Resolves document currency and FX on the Vendor Bill for supplier-facing reporting; currency semantics are consumed, not redefined. |
| `ENG-019` Tax | Supplies calculated tax values as inputs to Vendor Bill totals and Commercial 3-Way Match; tax posting remains owned by Accounting. |
| `ENG-024` Eventing | Publishes commercial billing events (`PurchaseInvoiceReceived` and lifecycle events) with the contracts declared in §11. |
| `ENG-025` Notification | Dispatches buyer, procurement manager, accounts liaison, and finance reviewer notifications on lifecycle transitions. |

Purchase business semantics (Vendor Bill lifecycle, validation, amendment, approval, cancellation, finalization, Commercial 3-Way Match, match-exception workflow, DN/CN request) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Identifiers resolve verbatim from [`ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md).

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Vendor Bill and match-exception read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Vendor Bill and match-exception actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Vendor Bill | MOD-004 (this sprint) | Header for a commercial vendor invoice under a company, referencing one or more Purchase Orders and Goods Receipts. |
| Vendor Bill Line | MOD-004 (this sprint) | Line item on a Vendor Bill referencing a PO line and (where applicable) a GRN line. |
| Vendor Bill Status | MOD-004 (this sprint) | Deterministic state on a Vendor Bill (draft, submitted, matched, approved, blocked, finalized, cancelled). |
| Vendor Bill Amendment | MOD-004 (this sprint) | Structured amendment record on a Vendor Bill prior to finalization, retaining prior and new values. |
| Three-Way Match | MOD-004 (this sprint) | Deterministic commercial comparison of PO ↔ GRN ↔ Vendor Bill at line and header granularity. |
| Match Result | MOD-004 (this sprint) | Outcome of the Three-Way Match for a Vendor Bill or line (matched, matched within tolerance, exception). |
| Match Exception | MOD-004 (this sprint) | Typed exception record (qty, price, receipt) associated to a Vendor Bill line with structured reason and lifecycle state (open, acknowledged, overridden, rejected). |
| Debit Note Request | MOD-004 (this sprint) | Commercial request for issuance of a debit note against a Vendor Bill or line (issuance itself owned by `SPR-MOD-004-005`). |
| Credit Note Request | MOD-004 (this sprint) | Commercial request for issuance of a credit note against a Vendor Bill or line. |
| Bill Attachment | MOD-004 (this sprint) | Attachment binding on a Vendor Bill (supplier invoice PDF, correspondence, evidence) via `ENG-008`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Vendor Bills**.
- A **Vendor Bill** has one or more **Vendor Bill Lines**; each line references at least one PO line owned by `SPR-MOD-004-002` and (where applicable) one or more GRN lines owned by `SPR-MOD-004-003`.
- A **Vendor Bill** and each of its lines carry a **Vendor Bill Status**; state transitions are audited.
- A **Vendor Bill** MAY have zero or more **Vendor Bill Amendments** prior to finalization.
- A **Vendor Bill** has exactly one prevailing **Three-Way Match** result at any time after submission; each line MAY have zero or more typed **Match Exceptions**.
- A **Vendor Bill** or line MAY have zero or more **Debit Note Requests** or **Credit Note Requests**.
- A **Bill Attachment** belongs to exactly one Vendor Bill.
- Supplier references resolve against the Vendor Master owned by `SPR-MOD-004-001`; PO references resolve against `SPR-MOD-004-002`; GRN references resolve against `SPR-MOD-004-003`; item references resolve against the Inventory item master (MOD-005) transitively via the PO/GRN line.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-004` per the Vendor Billing Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- **Accounting vouchers, journals, ledger entries, payables ledger balances, tax postings, and payment records are NOT represented here** — owned by MOD-002 Accounting. Any accounting effect is requested via the Accounting Voucher Creation Contract.
- **Inventory item master, stock ledger, warehouse operations, and inventory transactions/movements are NOT represented here** — owned by MOD-005 Inventory.
- Customer master is NOT represented here — owned by MOD-003 Sales.
- Vendor Master, buyer master, purchasing organization, T&C master, purchase price list master, and purchase configuration namespace are consumed from `SPR-MOD-004-001` and are NOT redefined here.
- Purchase Requisition, RFQ, Vendor Quotation, and Purchase Order are consumed from `SPR-MOD-004-002` and are NOT redefined here.
- Goods Receipt Note, receipt lifecycle, inspection, acceptance, and rejection are consumed from `SPR-MOD-004-003` and are NOT redefined here.
- Debit-note **document issuance** and purchase-return lifecycle are NOT represented here — owned by `SPR-MOD-004-005`.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Only event names present verbatim in the authoritative event catalog are used. Any illustrative event below that does not resolve at authoring time is either replaced with its authoritative equivalent or deferred as `R-EV-*` in §14. The Event Catalog is **not** modified by this sprint. `PurchaseInvoiceReceived` is declared verbatim from `MOD-004` Module PRD §8 and from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-004`) Sprint Exit Criteria.

| Event Name (subject to catalog resolution) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `PurchaseInvoiceReceived` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self, downstream sprints), MOD-002 (Accounting — voucher creation via Accounting Voucher Creation Contract), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `vendor-bill.created` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `vendor-bill.submitted` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `vendor-bill.amended` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `vendor-bill.approved` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self, downstream sprints), MOD-017 | At-least-once, ordered per tenant |
| `vendor-bill.cancelled` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `vendor-bill.finalized` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self, downstream sprints), MOD-002, MOD-017 | At-least-once, ordered per tenant |
| `vendor-bill.match-exception-raised` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self, downstream sprints), MOD-017 | At-least-once, ordered per tenant |
| `vendor-bill.match-exception-overridden` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self, downstream sprints), MOD-017 | At-least-once, ordered per tenant |
| `vendor-bill.match-exception-rejected` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self, downstream sprints), MOD-017 | At-least-once, ordered per tenant |
| `vendor-bill.debit-note-requested` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self, `SPR-MOD-004-005`), MOD-017 | At-least-once, ordered per tenant |
| `vendor-bill.credit-note-requested` | MOD-004 | SPR-MOD-004-004 | MOD-004 (self, `SPR-MOD-004-005`), MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14.

**Consumed events.** `PaymentSent` (per Module PRD §8) is consumed where relevant to reconcile paid-bill state; Sprint 4 does not own or publish this event.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Commercial billing events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Vendor Bill and match-exception read and write.
- [ ] Every Vendor Bill and match-exception lifecycle transition produces an audit record via `ENG-004`.
- [ ] Invoice-vs-matched-GRN tolerance rule (Module PRD §7) is enforced via `ENG-012`.
- [ ] Commercial 3-Way Match is deterministic and produces typed exception records for qty, price, and receipt mismatches.
- [ ] Vendor Bill numbering is consumed via `ENG-017` from the series registered by `SPR-MOD-004-001`.
- [ ] Attachments bind via `ENG-008`; notifications dispatch via `ENG-025` on configured transitions.
- [ ] Tax input is consumed via `ENG-019`; no tax posting is authored by this sprint.
- [ ] Finalization emits a request for accounting voucher creation via `ENG-015` under the Accounting Voucher Creation Contract exposed by `MOD002_ACCOUNTING_BASELINE_v1`; no accounting journal, ledger entry, payables record, or payment record is authored by this sprint.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-004`):

- Purchase invoices can be created, matched (3-way), approved, and cancelled through the business lifecycle.
- Tolerance validation is enforced via `ENG-012` per Module PRD §7.
- Tax determination resolves via `ENG-019`.
- Payables creation contracts are produced for downstream consumption.
- `PurchaseInvoiceReceived` event is published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable).

- **Risk ID:** R-01
  - **Description:** Accounting dependency — Vendor Bill finalization requests accounting voucher creation via the Accounting Voucher Creation Contract exposed by `MOD002_ACCOUNTING_BASELINE_v1`.
  - **Impact:** Contract drift between Purchase and Accounting could break downstream voucher creation and payables recognition.
  - **Mitigation:** Emit only the repository-defined voucher-creation request via `ENG-015`; do not perform accounting posting directly; treat Accounting-side contract changes as governance events, not silent absorption.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** GRN dependency — Sprint 4 consumes GRN context authored by `SPR-MOD-004-003` for Commercial 3-Way Match.
  - **Impact:** Regression against the GRN contract (line semantics, acceptance state, quantity variance) would corrupt match arithmetic.
  - **Mitigation:** Consume GRN context read-only; treat any regression as a `SPR-MOD-004-003` defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Purchase Order dependency — Sprint 4 consumes open PO context authored by `SPR-MOD-004-002`.
  - **Impact:** Regression against the PO contract (line semantics, open-quantity accounting, amendment lifecycle) would corrupt match arithmetic and validation.
  - **Mitigation:** Consume PO context read-only; treat any regression as a `SPR-MOD-004-002` defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Commercial 3-Way Match governance — commercial match must remain deterministic and separable from accounting reconciliation (owned by Accounting).
  - **Impact:** Blurring of the boundary would leak accounting reconciliation into Purchase and undermine ownership boundaries.
  - **Mitigation:** Sprint 4 compares commercial documents only (PO ↔ GRN ↔ Vendor Bill); accounting reconciliation is consumed as an outcome of the Accounting Voucher Creation Contract.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Accounting contract dependency — the Accounting Voucher Creation Contract exposed by `MOD002_ACCOUNTING_BASELINE_v1` is the sole approved surface for requesting voucher creation.
  - **Impact:** Any deviation (direct ledger writes, bespoke payables mutation) would violate Accounting ownership.
  - **Mitigation:** Wire finalization through `ENG-015` under the baseline contract; treat any deviation as an architectural exception requiring baseline governance.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Tax dependency — Accounting owns tax posting; Sprint 4 consumes calculated tax values via `ENG-019` as inputs only.
  - **Impact:** Sprint 4 accidentally introducing tax posting or tax-register semantics would violate Accounting ownership.
  - **Mitigation:** Consume tax values as inputs only; no tax posting, no tax register, no tax reporting is authored here.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Cross-module contract drift — downstream sprints (`SPR-MOD-004-005`, `SPR-MOD-004-006`) and MOD-002 Accounting consume Sprint-4 events and Vendor Bill / match-exception context.
  - **Impact:** Changes to event payloads or Vendor Bill state semantics after Sprint 4 completes would ripple downstream.
  - **Mitigation:** Publish event contracts through the authoritative catalog; treat contract changes as catalog governance events.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Vendor billing approval dependency — approval routing depends on the workflow model and approval semantics exposed by `ENG-011` and the rule set registered by `SPR-MOD-004-001`.
  - **Impact:** Regression in approval routing would block Vendor Bill approvals and match-exception overrides.
  - **Mitigation:** Consume `ENG-011` per its specification; treat any regression as an engine or Foundation defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** Vendor Bill numbering dependency — Sprint 4 consumes the Vendor Bill numbering series registered by `SPR-MOD-004-001` via `ENG-017` (allocated to Sprint 4 in `MOD-004_SPRINT_PLAN.md` §2).
  - **Impact:** Regression in the numbering series registration or in `ENG-017` allocation would block Vendor Bill authoring and audit reconstruction.
  - **Mitigation:** Consume the repository-approved numbering engine only; treat any regression as a Foundation / numbering-engine defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-10
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** The authoritative event catalog is currently a stub. Every event name declared in §11 — including `PurchaseInvoiceReceived` (verbatim from Module PRD §8) and the `vendor-bill.*` lifecycle and match-exception events — is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before Purchase Sprint 5 begins consuming these events. The Event Catalog is not modified by this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Vendor Bill lifecycle invariants; amendment prior/new-value capture; tolerance rule binding; Commercial 3-Way Match arithmetic across qty/price/receipt dimensions; match-exception transitions (open → acknowledged / overridden / rejected); DN/CN request persistence.
- **Integration** — audit emission via `ENG-004`; document primitive via `ENG-007`; attachment binding via `ENG-008`; approval routing via `ENG-011`; rule and match evaluation via `ENG-012`; voucher-request wiring via `ENG-015`; numbering consumption via `ENG-017`; currency via `ENG-018`; tax input via `ENG-019`; event publication via `ENG-024`; notification dispatch via `ENG-025`.
- **Contract** — commercial billing event contracts against the event catalog for `PurchaseInvoiceReceived` and `vendor-bill.*` events; Accounting Voucher Creation Contract consumed by MOD-002.
- **End-to-end (smoke)** — PO → GRN → Vendor Bill → Commercial 3-Way Match (with qty and price exception) → override → finalize → voucher-request handoff under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation, tolerance enforcement, and Accounting Voucher Creation Contract handoff.

Sprint-specific fixtures: a two-company smoke fixture with a pre-seeded Vendor Master (from `SPR-MOD-004-001`), open POs (from `SPR-MOD-004-002`), accepted GRNs (from `SPR-MOD-004-003`), and configured tolerance thresholds used to prove tenancy, tolerance enforcement, and match-exception invariants.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Vendor Bill and match-exception lifecycles as small state machines so audit emission (§5.14) and event publication (§5.16) are trivially satisfiable at every transition.
- Consider carrying Commercial 3-Way Match results and typed exceptions as first-class Vendor Bill children so downstream analytics (`SPR-MOD-004-006`) can consume them without recomputation.
- Consider isolating the Accounting Voucher Creation Contract handoff behind an explicit repository boundary so the "no accounting journals" invariant is enforced structurally.
- Consider guarding the tolerance evaluation behind an explicit rule identifier registered by `SPR-MOD-004-001`, so the enforcement path is diagnosable.
- Consider mapping `PurchaseInvoiceReceived` and the `vendor-bill.*` events to authoritative catalog names as soon as `R-EV-01` is resolved.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-004-004`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial vendor billing lifecycle and Commercial 3-Way Match: Vendor Bill lifecycle, validation, amendment, approval, cancellation, finalization, match, exception workflow, and DN/CN request (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-004` MODULE_PRD section. No orphan requirements. Bidirectional mapping preserved; unique originating allocation preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Vendor Billing Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists returns/debit-note issuance and analytics, plus Accounting/Inventory/Sales-owned scope and Foundation/PO/GRN scope, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes and explicit ownership invariants.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-004-005`) begin immediately after this one completes?**
   Yes. `SPR-MOD-004-005 Purchase Returns & Debit Notes` is the immediate successor per [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-004-004`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)
- Upstream Sprint — [`./SPR-MOD-004-001-purchase-foundation.md`](./SPR-MOD-004-001-purchase-foundation.md)
- Upstream Sprint — [`./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md)
- Upstream Sprint — [`./SPR-MOD-004-003-goods-receipt-inspection.md`](./SPR-MOD-004-003-goods-receipt-inspection.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
