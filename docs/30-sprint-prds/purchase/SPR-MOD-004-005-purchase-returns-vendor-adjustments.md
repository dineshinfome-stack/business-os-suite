---
title: "SPR-MOD-004-005 — Purchase Returns & Vendor Adjustments"
summary: "Sprint PRD for the commercial Purchase Returns and Vendor Adjustments lifecycle: return authoring against GRN and Vendor Bill lines, return approvals, replacement requests, vendor adjustment and debit-note requests, attachments, numbering, notifications, audit, and commercial return events. Consumes SPR-MOD-004-002 Purchase Orders, SPR-MOD-004-003 Goods Receipts, SPR-MOD-004-004 Vendor Bills, and upstream baselines; never redefines them; does not own inventory transactions, accounting journals, ledger posting, payables, tax posting, or payment execution."
layer: "delivery"
owner: "Procurement"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-004-005"
parent_module: "MOD-004"
parent_sprint_plan: "MOD-004_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "8.6.5"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-018", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "purchase", "returns", "vendor-adjustments", "mod-004", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-004-005 — Purchase Returns & Vendor Adjustments

> **Stage 2 deliverable.** Fifth authored Sprint PRD for **MOD-004 Purchase** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines, Accepted ADRs, the Purchase Orders established by `SPR-MOD-004-002`, the Goods Receipts established by `SPR-MOD-004-003`, the Vendor Bills established by `SPR-MOD-004-004`, the Vendor Master established by `SPR-MOD-004-001`, Accounting ownership established by `MOD002_ACCOUNTING_BASELINE_v1`, and Inventory ownership assigned to MOD-005; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-004-005` (permanent) |
| Parent Module | `MOD-004` — Purchase |
| Parent Sprint Plan | [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (all frozen) |
| Upstream Sprints | [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md), [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md) (originating supplier of Purchase Order capabilities), [`SPR-MOD-004-003`](./SPR-MOD-004-003-goods-receipt-inspection.md) (originating supplier of Goods Receipt capabilities), [`SPR-MOD-004-004`](./SPR-MOD-004-004-vendor-billing-3-way-match.md) (originating supplier of Vendor Bill capabilities) |
| Downstream Sprints | `SPR-MOD-004-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial Purchase Returns and Vendor Adjustments lifecycle** for BusinessOS: authoring of Purchase Returns against received Goods Receipt lines and (optionally) Vendor Bill lines, return approval, replacement requests, vendor return authorization, debit-note requests, vendor adjustment requests, attachments, purchase-return numbering, notifications, audit, and commercial return events. Sprint 5 owns the buyer-side commercial decision that previously-received goods (or invoiced quantities) are to be returned or adjusted with the vendor. It is the substrate that purchase analytics (`SPR-MOD-004-006`) depends on for return volumes, adjustment volumes, and exception surfaces.

> **Purchase Return Ownership Convention.** MOD-004 Purchase owns the business semantics of the commercial Purchase Return document lifecycle, return validation, amendment, approval, cancellation, finalization, replacement request, vendor return authorization, debit-note request, and vendor adjustment request. ERP Core Engines provide shared infrastructure (authorization, audit, document, attachment, workflow, approval, rules, numbering, currency, eventing, notification) but **MUST NOT** redefine purchase-return business rules. Downstream Purchase sprints consume commercial return context rather than reintroducing parallel return lifecycles. This complements — and does not redefine — the Purchase Ownership Convention established in `SPR-MOD-004-001`, the Purchase Document Ownership Convention established in `SPR-MOD-004-002`, the Goods Receipt Ownership Convention established in `SPR-MOD-004-003`, the Vendor Billing Ownership Convention established in `SPR-MOD-004-004`, and the ownership boundaries codified by `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, and `MOD003_SALES_BASELINE_v1`.

#### 1.1.1 Purchase Order Consumption (Upstream Dependency on SPR-MOD-004-002)

`SPR-MOD-004-002` SHALL be treated as the **originating supplier** of all Purchase Order capabilities consumed by Sprint 5. Sprint 5 SHALL consume Purchase Orders originating from `SPR-MOD-004-002` and SHALL NOT redefine Purchase Order ownership, PO lifecycle, PO approval routing, PO pricing/discount application, PO amendment lifecycle, or buyer-commitment semantics. Any PO attribute required for Purchase Return validation is resolved from the Purchase Order established by `SPR-MOD-004-002`.

#### 1.1.2 Goods Receipt Consumption (Upstream Dependency on SPR-MOD-004-003)

`SPR-MOD-004-003` SHALL be treated as the **originating supplier** of all Goods Receipt capabilities consumed by Sprint 5. Sprint 5 SHALL consume Goods Receipts originating from `SPR-MOD-004-003` and SHALL NOT redefine Goods Receipt ownership, GR lifecycle, receipt validation, quantity verification, damage recording, inspection hold, acceptance, or rejection. Any GRN attribute required for Purchase Return validation is resolved from the Goods Receipt established by `SPR-MOD-004-003`.

#### 1.1.3 Vendor Bill Consumption (Upstream Dependency on SPR-MOD-004-004)

`SPR-MOD-004-004` SHALL be treated as the **originating supplier** of all Vendor Bill capabilities consumed by Sprint 5. Sprint 5 SHALL consume Vendor Bills originating from `SPR-MOD-004-004` and SHALL NOT redefine Vendor Bill ownership, Vendor Bill lifecycle, validation, amendment, approval, cancellation, finalization, Commercial 3-Way Match, or match-exception workflow. Any Vendor Bill attribute required for Purchase Return traceability or debit-note request context is resolved from the Vendor Bill established by `SPR-MOD-004-004`.

#### 1.1.4 Inventory Consumption Boundary

Inventory ownership remains governed exclusively by MOD-005 Inventory. Sprint 5 SHALL NOT:

- perform inventory putaway reversal
- perform stock ledger writes or adjustments
- perform bin management or warehouse operations
- perform stock valuation, cost-layer reversal, or FIFO/LIFO/AVCO recalculation
- own inventory transactions or movements

A commercial Purchase Return authored under Sprint 5 is a Purchase-domain signal. Any inventory effect (physical outbound movement of returned goods, stock ledger reversal, cost-layer reversal, warehouse operation) is owned by MOD-005 Inventory and requested through the repository-defined **Inventory Return Contract** consumed via MOD-005. Sprint 5 emits commercial return events and structured return payloads; it does not mutate the stock ledger.

#### 1.1.5 Accounting Consumption Boundary

Accounting ownership remains governed exclusively by [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md). Sprint 5 SHALL NOT:

- create accounting vouchers or debit-note accounting documents
- create journals
- post to the general ledger
- create or mutate payables ledger records
- perform accounting tax posting or tax-register maintenance
- execute payments or maintain payment records
- own accounting period governance or financial reporting

Purchase Return finalization and debit-note request emission by Sprint 5 are Purchase-domain commercial signals. Any accounting effect (return-accounting voucher creation, journal posting, payables adjustment, tax posting, refund payment) is owned by Accounting and requested through the repository-defined **Accounting Voucher Creation Contract** consumed via `MOD002_ACCOUNTING_BASELINE_v1`. Sprint 5 does not create the accounting voucher itself.

#### 1.1.6 Vendor Adjustment Boundary

A **Vendor Adjustment Request** authored under Sprint 5 is a structured commercial request for a non-return adjustment against a Vendor Bill or line (e.g. price correction, rebate, allowance) with a structured reason. Sprint 5 authors the commercial request only. Any accounting effect (voucher creation, journal posting, payables adjustment, tax-register maintenance) is owned by Accounting and requested through the Accounting Voucher Creation Contract. Sprint 5 SHALL NOT issue the corresponding accounting adjustment or the adjusted payables balance.

#### 1.1.7 Numbering Consumption

Purchase Return document numbering is consumed via `ENG-017` from a series registered by `SPR-MOD-004-001` (Purchase Foundation, purchase-document numbering series). Sprint 5 does not register a new numbering scheme; it consumes the repository-approved numbering engine allocated to Sprint 5 in [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-005`).

#### 1.1.8 Governance Complement

This Sprint PRD complements but SHALL NOT redefine:

- [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md)
- [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md)
- [`SPR-MOD-004-003`](./SPR-MOD-004-003-goods-receipt-inspection.md)
- [`SPR-MOD-004-004`](./SPR-MOD-004-004-vendor-billing-3-way-match.md)

### 1.2 In Scope

- **Purchase Return lifecycle.** Creation, drafts, validation, amendment, submission, approval, cancellation, and finalization of Purchase Returns against one or more Goods Receipt lines and (optionally) Vendor Bill lines under a tenant/company.
- **Purchase Return validation.** Structural and referential validation: GRN reference validity, Vendor Bill reference validity (where applicable), supplier consistency between GRN/Vendor Bill/Return, currency consistency, line reference validity, return-quantity constraints against received-quantity (rule resolution via `ENG-012`).
- **Return approvals.** Approval routing of Purchase Returns and of return-quantity or reason overrides via `ENG-011`.
- **Amendments.** Structured amendment of a Purchase Return prior to finalization, with audit of prior and new values.
- **Cancellation.** Deterministic cancellation of a non-finalized Purchase Return, with structured reason and audit.
- **Finalization.** Terminal commercial state for an approved Purchase Return; the finalization event triggers downstream consumers, the Inventory Return Contract handoff to MOD-005, and (where applicable) the Accounting Voucher Creation Contract handoff.
- **Replacement Request.** Commercial request for replacement of returned goods from the vendor with a structured reason.
- **Vendor Return Authorization.** Structured record of vendor acknowledgement or authorization to accept the return.
- **Debit Note Request.** Commercial request for issuance of a debit note against a Vendor Bill or line, with structured reason. Sprint 5 authors the commercial request; the accounting debit-note document is owned by Accounting.
- **Vendor Adjustment Request.** Commercial request for a non-return adjustment (price correction, rebate, allowance) against a Vendor Bill or line, with structured reason.
- **Purchase Return numbering.** Consumption of the Purchase Return numbering series via `ENG-017` from a series registered by `SPR-MOD-004-001`.
- **Attachments.** Attachment binding on Purchase Return documents via `ENG-008` (return evidence, correspondence, quality inspection reports).
- **Notifications.** Buyer, procurement manager, vendor coordinator, branch manager, and accounts liaison notifications on lifecycle transitions via `ENG-025`.
- **Audit.** Audit records for every Purchase Return and adjustment-request lifecycle transition via `ENG-004`.
- **Commercial return events.** Publication of commercial return events via `ENG-024`, subject to authoritative event-catalog resolution (see §11 and `R-EV-01`). `DebitNoteIssued` is published on debit-note-request finalization per Module PRD §8 and Sprint Plan Sprint 5 Exit Criteria.
- **Inventory Return Contract handoff.** Consumption of the repository-approved contract exposed by MOD-005 Inventory to request physical inventory reversal.
- **Accounting Voucher Creation Contract handoff.** Consumption of the repository-approved contract exposed by `MOD002_ACCOUNTING_BASELINE_v1` (via approved event / request wiring) to request downstream accounting voucher creation for the debit-note or vendor adjustment.

### 1.3 Out of Scope

Reserved for later Purchase sprints (see [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)):

- Purchase analytics, spend analytics, PO ageing, supplier performance, price variance dashboards, 3-way match exception review dashboards, purchase-return volume dashboards — `SPR-MOD-004-006`.

Owned elsewhere and consumed only:

- Vendor Master, supplier categorisation, buyer master, purchasing organization, T&C master, purchase price list master, purchase configuration namespace, purchase-document numbering series registration — `SPR-MOD-004-001`.
- Purchase Requisition, RFQ, Vendor Quotation, Quote Comparison, and Purchase Order lifecycles; PO approval routing; PO amendments; commercial pricing/discount application on the PO chain — `SPR-MOD-004-002`.
- Goods Receipt lifecycle, receipt validation, quantity verification, damage recording, inspection hold, acceptance, rejection, receipt completion — `SPR-MOD-004-003`.
- Vendor Bill lifecycle, validation, amendment, approval, cancellation, finalization, Commercial 3-Way Match, match-exception workflow — `SPR-MOD-004-004`.
- Accounting vouchers, journal posting, ledger posting, taxation posting, payables ledger adjustment, refund payment execution, `PaymentSent` event publication, accounting period governance, financial reporting — MOD-002 Accounting via `MOD002_ACCOUNTING_BASELINE_v1`.
- Inventory item master, stock ledger, putaway reversal, bin management, stock valuation, cost-layer reversal, warehouse operations, inventory transactions and movements — MOD-005 Inventory.
- Customer master and sales-side lifecycles — MOD-003 Sales via `MOD003_SALES_BASELINE_v1`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-004-005`, the following will exist:

- **Business capabilities.**
  - A purchase executive can create a Purchase Return referencing one or more Goods Receipt lines (and, optionally, Vendor Bill lines) under a tenant/company, driving it through draft, submit, approve, cancel, and finalize transitions, with structured amendments prior to finalization.
  - A procurement manager can approve Purchase Returns and return-quantity / reason overrides via `ENG-011`.
  - Purchase Return validation enforces GRN reference validity, Vendor Bill reference validity (where applicable), supplier and currency consistency, and return-quantity constraints (rule resolution via `ENG-012`).
  - A purchase executive can author a Replacement Request, a Vendor Return Authorization, a Debit Note Request, and a Vendor Adjustment Request, each with structured reason.
  - Purchase Return numbering is consumed via `ENG-017` from the series registered by `SPR-MOD-004-001`.
  - Attachments bind to Purchase Return documents via `ENG-008`; notifications reach buyer, procurement manager, vendor coordinator, branch manager, and accounts liaison roles via `ENG-025`.
- **Published events.** Commercial return event contracts (see §11) registered in the event catalog and emitted by the corresponding lifecycle transitions. `DebitNoteIssued` is published on debit-note-request finalization (Module PRD §8, Sprint Plan §2 `SPR-MOD-004-005` Exit Criteria).
- **Audit artifacts.** An audit record exists for every Purchase Return and adjustment-request lifecycle transition, produced via `ENG-004`.
- **Inventory Return Contract handoff.** Finalization emits a repository-defined request via `ENG-024` for downstream inventory reversal, consumed by MOD-005 Inventory. Sprint 5 SHALL NOT perform the inventory reversal itself.
- **Accounting Voucher Creation Contract handoff.** Debit-note-request finalization and vendor-adjustment finalization emit the repository-defined request for downstream accounting voucher creation, consumed by MOD-002 Accounting under `MOD002_ACCOUNTING_BASELINE_v1`. Sprint 5 SHALL NOT create the accounting voucher itself.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-004-005`.
  - Commercial return event entries in the event catalog referenced from §11.
- **Downstream forward references.** Deliverables produced here are consumed by `SPR-MOD-004-006` (return volumes and adjustment volumes for analytics).
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Bidirectional Sprint ↔ Module PRD Traceability

Bidirectional traceability. Every Sprint-5 capability traces back to an approved MOD-004 Module PRD section, and every relevant Module PRD section covered by Sprint 5 traces forward to a deliverable below. No Sprint-5 capability is orphaned from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-005`); unique originating allocation is preserved (no capability delivered here is also allocated to another Purchase sprint).

**Traceability invariants:**

- Every Module PRD capability SHALL map to exactly one originating Sprint allocation.
- Every Sprint capability SHALL trace back to an approved Module PRD capability.
- No orphan Sprint capability.
- No unallocated Module PRD capability.
- No duplicate originating allocation.

### 3.1 Forward Map — Sprint 5 Capability → MOD-004 Module PRD Section

| Sprint 5 Capability | MOD-004 MODULE_PRD Section |
| --- | --- |
| Purchase Return lifecycle (create, submit, amend, approve, cancel, finalize) | §2 Business Scope — Purchase returns; §2 Submodule — Returns; §4 Business Processes — Return-to-debit-note; §6 Transactions — Debit Note (context document) |
| Purchase Return validation (references, supplier/currency consistency, quantity constraints) | §7 Business Rules — return-quantity constraints against received quantity |
| Return approvals and return-override approval routing | §2 Business Scope — Purchase returns; §4 Return-to-debit-note |
| Replacement Request | §2 Business Scope — Purchase returns |
| Vendor Return Authorization | §2 Business Scope — Purchase returns |
| Debit Note Request (commercial) | §6 Transactions — Debit Note; §4 Return-to-debit-note; §8 Integration Points — `DebitNoteIssued` (published) |
| Vendor Adjustment Request | §2 Business Scope — Purchase returns (adjustment surface) |
| Purchase Return numbering | §10 Configuration — Numbering series |
| Attachments on Purchase Returns | §2 Business Scope — Purchase returns (document evidence surface) |
| Notifications on lifecycle transitions | §2 Business Scope — Purchase returns (operational communication) |
| Audit on Purchase Return and adjustment-request lifecycle | §11 Non-functional — Audit readiness |
| Commercial return events (`DebitNoteIssued`, `purchase-return.*`) | §8 Integration Points — `DebitNoteIssued` (published) |
| Inventory Return Contract handoff | §2 Business Scope — Purchase returns (physical reversal is owned by MOD-005 Inventory) |
| Accounting Voucher Creation Contract handoff | §2 Business Scope — Purchase returns (accounting effect is owned by MOD-002 Accounting) |

### 3.2 Reverse Map — MOD-004 Module PRD Section → Sprint 5 Deliverable

| MOD-004 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Purchase returns | Purchase Return lifecycle, Replacement Request, Vendor Return Authorization, Vendor Adjustment Request (§1.2, §5) |
| §2 Submodule — Returns | Conceptual data model (§10), lifecycle (§5) |
| §3 Personas — Purchase Executive, Procurement Manager, Buyer, Vendor Coordinator, Branch Manager, Accounts Liaison | User stories (§4) |
| §4 Business Processes — Return-to-debit-note | End-to-end lifecycle acceptance criteria (§5) |
| §6 Transactions — Debit Note | Debit Note Request model (§10), acceptance criteria (§5.9) — accounting debit-note document owned by MOD-002 Accounting |
| §7 Business Rules — return-quantity constraints against received quantity | Rule binding via `ENG-012` (§5.4) |
| §8 Integration Points — `DebitNoteIssued` (published) | Events (§11) |
| §11 Non-functional — Audit readiness | Audit via `ENG-004` (§5.14) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

No Module PRD capability, submodule, master-data entity, or transaction allocated to Sprint 5 in `MOD-004_SPRINT_PLAN.md` §2 sits outside the maps above. No capability appears as the originating allocation in more than one sprint. **No capability introduced in this Sprint PRD is outside the approved Purchase Module PRD, and no capability allocated to Sprint 5 in `MOD-004_SPRINT_PLAN.md` is orphaned from this Sprint PRD** (unique originating allocation preserved; no orphans; no duplicates).

---

## 4. User Stories

- **US-001.** *As a purchase executive, I want to create a Purchase Return referencing one or more Goods Receipt lines (and, optionally, Vendor Bill lines) under a company, so that returns to the vendor can be captured with commercial provenance.*
- **US-002.** *As a purchase executive, I want to amend a Purchase Return prior to finalization with an audit trail, so that return corrections are traceable.*
- **US-003.** *As a procurement manager, I want return-quantity constraints against received quantity to be enforced deterministically, so that unauthorized over-return is prevented.*
- **US-004.** *As a procurement manager, I want to approve Purchase Returns and to override return quantity or reason with structured justification, so that commercial resolution is auditable.*
- **US-005.** *As a buyer, I want to author a Replacement Request against a Purchase Return, so that the vendor supplies replacement goods against a structured request.*
- **US-006.** *As a vendor coordinator, I want to record a Vendor Return Authorization, so that the vendor's acknowledgement of the return is captured commercially.*
- **US-007.** *As a purchase executive, I want to author a Debit Note Request from a Vendor Bill or line with a structured reason, so that Accounting can issue the debit-note accounting document via the Accounting Voucher Creation Contract.*
- **US-008.** *As an accounts liaison, I want a Vendor Adjustment Request against a Vendor Bill or line with structured reason, so that non-return commercial adjustments (price correction, rebate, allowance) are captured for Accounting to post.*
- **US-009.** *As a branch manager, I want every Purchase Return and adjustment-request to be scoped to my tenant/company, so that isolation invariants are preserved.*
- **US-010.** *As a downstream module (system persona), I want to receive commercial return finalization, replacement, vendor-authorization, debit-note-request, and adjustment-request events, so that inventory reversal, accounting voucher creation, and analytics can react deterministically through approved repository contracts.*
- **US-011.** *As a system administrator, I want every commercial return and adjustment-request lifecycle transition to be audited via `ENG-004`, so that the return history can be reconstructed from an authoritative log.*

Each user story traces to at least one Sprint Deliverable in §2.

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

**Ownership invariants.** In addition to the scenario-level criteria below, the following invariants apply globally to every Purchase Return and Vendor Adjustment Request handled by this sprint:

- **Purchase Returns SHALL NOT mutate the inventory stock ledger; physical reversal is requested from MOD-005 Inventory via the Inventory Return Contract.**
- **Purchase Returns and Vendor Adjustment Requests SHALL NOT create accounting journals, payables entries, or tax postings; accounting effect is requested from MOD-002 Accounting via the Accounting Voucher Creation Contract.**
- **Debit Note Requests authored here are commercial requests; the accounting debit-note document is owned by MOD-002 Accounting and SHALL NOT be issued by this sprint.**

### 5.1 Purchase Return creation (US-001)

- **Given** one or more accepted Goods Receipt lines (and, optionally, referenced Vendor Bill lines) under an active company,
  **when** a purchase executive creates a Purchase Return referencing them,
  **then** the Purchase Return is persisted with a stable identifier, its number is consumed from the Purchase Return series via `ENG-017`, and the transition is audited via `ENG-004`.
- **Given** a Purchase Return in an editable state,
  **when** a purchase executive edits allowed fields (lines, quantities, reasons, remarks, attachments),
  **then** the update is persisted and audited.

### 5.2 Purchase Return validation (US-001)

- **Given** a Purchase Return draft,
  **when** it is submitted,
  **then** it is validated to reference valid GRN lines and, where applicable, valid Vendor Bill lines; supplier and currency consistency between GRN/Vendor Bill/Return is enforced; inconsistencies are rejected deterministically and the rejection is audited.

### 5.3 Amendment (US-002)

- **Given** a submitted but non-finalized Purchase Return,
  **when** an amendment is applied with a structured reason,
  **then** prior and new values are audited via `ENG-004` and the amendment is persisted.

### 5.4 Return-quantity rule (US-003)

- **Given** the return-quantity rule resolved via the rule set registered by `SPR-MOD-004-001`,
  **when** a Purchase Return line is submitted whose return quantity exceeds the accepted-receipt quantity net of prior returns,
  **then** the line is rejected deterministically via `ENG-012`; an approved override recorded via `ENG-011` MAY permit the exception with an audited rationale.

### 5.5 Approval (US-004)

- **Given** a submitted Purchase Return (or a return-quantity / reason override),
  **when** approval is invoked,
  **then** approval routing executes via `ENG-011`, the outcome is audited, and notifications are dispatched via `ENG-025`.

### 5.6 Cancellation (US-004)

- **Given** a non-finalized Purchase Return,
  **when** cancellation is invoked with a structured reason,
  **then** the Purchase Return transitions to cancelled, no inventory reversal request is emitted, no debit-note-request is finalized, and the cancellation is audited.

### 5.7 Finalization and Inventory Return Contract handoff (US-001, US-010)

- **Given** an approved Purchase Return,
  **when** finalization is submitted,
  **then** the Purchase Return transitions to finalized, the `purchase-return.finalized` event is published via `ENG-024`, and a request for physical inventory reversal is emitted under the Inventory Return Contract to MOD-005 Inventory. Sprint 5 SHALL NOT perform the inventory reversal itself.

### 5.8 Replacement Request (US-005)

- **Given** a submitted or finalized Purchase Return,
  **when** a buyer authors a Replacement Request with a structured reason,
  **then** the Replacement Request is persisted, an audit record is produced via `ENG-004`, and the corresponding event is published via `ENG-024`.

### 5.9 Vendor Return Authorization (US-006)

- **Given** a submitted Purchase Return awaiting vendor acknowledgement,
  **when** a vendor coordinator records a Vendor Return Authorization,
  **then** the authorization is persisted, audited, and the corresponding event is published via `ENG-024`.

### 5.10 Debit Note Request (US-007)

- **Given** a finalized Purchase Return (or a referenced Vendor Bill line) with a commercial disagreement,
  **when** a purchase executive authors a Debit Note Request with a structured reason,
  **then** the request is persisted, audited, and — on finalization of the request — `DebitNoteIssued` is published via `ENG-024`, and a request for accounting voucher creation is emitted under the Accounting Voucher Creation Contract exposed by `MOD002_ACCOUNTING_BASELINE_v1`. Sprint 5 SHALL NOT issue the accounting debit-note document itself.

### 5.11 Vendor Adjustment Request (US-008)

- **Given** a Vendor Bill (or line) requiring non-return commercial adjustment,
  **when** an accounts liaison authors a Vendor Adjustment Request with a structured reason,
  **then** the request is persisted, audited, and — on finalization — the corresponding event is published via `ENG-024`, and a request for accounting voucher creation is emitted under the Accounting Voucher Creation Contract. Sprint 5 SHALL NOT post the adjustment itself.

### 5.12 Attachments (US-005, US-006, US-007)

- **Given** a Purchase Return or adjustment-request in an editable or submitted state,
  **when** an actor attaches a file (return evidence, correspondence, quality inspection report),
  **then** the attachment binds via `ENG-008` and is audited.

### 5.13 Notifications (US-004, US-006, US-008)

- **Given** a lifecycle transition on a Purchase Return, Replacement Request, Vendor Return Authorization, Debit Note Request, or Vendor Adjustment Request,
  **when** it completes,
  **then** the configured notifications are dispatched via `ENG-025` to buyer, procurement manager, vendor coordinator, branch manager, and accounts liaison roles as configured.

### 5.14 Authorization and Audit (US-009, US-011)

- **Given** any Purchase Return, Replacement Request, Vendor Return Authorization, Debit Note Request, or Vendor Adjustment Request action (create, edit, submit, amend, approve, override, reject, cancel, finalize, attach),
  **when** it is invoked,
  **then** authorization is enforced via `ENG-002` per `ADR-032` (RBAC + ABAC), unauthorized actions are rejected without side effects, and an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp, per `ADR-014`.

### 5.15 Tenant isolation invariants (`ADR-011`)

- **Given** any Purchase Return or adjustment-request read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.16 Commercial return events (US-010)

- **Given** a commercial return or adjustment lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used; unresolved names are recorded as deferred `R-EV-*` risks in §14.

### 5.17 Ownership consumption invariants

- **Given** any Purchase Return or adjustment-request authored under this sprint,
  **when** it references supplier, PO, GRN, or Vendor Bill entities,
  **then** it does so exclusively through masters and documents established by `SPR-MOD-004-001` (Vendor Master), `SPR-MOD-004-002` (Purchase Order), `SPR-MOD-004-003` (Goods Receipt), and `SPR-MOD-004-004` (Vendor Bill). No parallel supplier, PO, GRN, or Vendor Bill master is introduced here, no inventory transaction is authored here, and no accounting journal, ledger entry, tax posting, payables record, or payment record is authored here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-004` — Purchase.
- **Module PRD:** [`docs/20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Purchase returns; Returns submodule), §3 (Purchase Executive, Procurement Manager, Buyer, Vendor Coordinator, Branch Manager, Accounts Liaison), §4 (Return-to-debit-note), §6 (Debit Note), §7 (return-quantity constraint), §8 (`DebitNoteIssued` — published), §11 (Audit readiness), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-004` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting ownership and the **Accounting Voucher Creation Contract** consumed by Debit Note Request and Vendor Adjustment Request finalization. Sprint 5 MUST NOT create accounting journals, ledger entries, payables records, tax postings, or payment records.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Customer master ownership boundary. Sprint 5 MUST NOT reference customer entities on procurement documents.
- **Upstream sprint dependencies:**
  - [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md) — Purchase Foundation (Vendor Master, buyer master, purchasing organization, purchase-document numbering series, purchase configuration namespace, return-quantity rule registration).
  - [`SPR-MOD-004-002`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md) — Requisitions, RFQs & Purchase Orders. **`SPR-MOD-004-002` SHALL be treated as the originating supplier of Purchase Order capabilities. Sprint 5 SHALL consume Purchase Orders originating from `SPR-MOD-004-002` and SHALL NOT redefine Purchase Order ownership.**
  - [`SPR-MOD-004-003`](./SPR-MOD-004-003-goods-receipt-inspection.md) — Goods Receipt & Inspection. **`SPR-MOD-004-003` SHALL be treated as the originating supplier of Goods Receipt capabilities. Sprint 5 SHALL consume Goods Receipts originating from `SPR-MOD-004-003` and SHALL NOT redefine Goods Receipt ownership.**
  - [`SPR-MOD-004-004`](./SPR-MOD-004-004-vendor-billing-3-way-match.md) — Vendor Billing & Commercial 3-Way Match. **`SPR-MOD-004-004` SHALL be treated as the originating supplier of Vendor Bill capabilities. Sprint 5 SHALL consume Vendor Bills originating from `SPR-MOD-004-004` and SHALL NOT redefine Vendor Bill ownership.**
  - [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) — Sprint 5 allocation.
- **Downstream sprints:** `SPR-MOD-004-006` (Purchase Analytics & Controls — consumes return volumes, adjustment volumes, and commercial return events).
- **Downstream module consumers of Sprint-5 events:** `MOD-004` (self, subsequent sprints), `MOD-005` Inventory (subscribes to `purchase-return.finalized` for inventory reversal via the Inventory Return Contract), `MOD-002` Accounting (subscribes to `DebitNoteIssued` and vendor-adjustment finalization for voucher creation via the Accounting Voucher Creation Contract), `MOD-017` Analytics — consuming exclusively via events and read APIs. Module identifiers resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md).

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Purchase Return Ownership Convention in §1.1). See each engine's specification for capability details.

One-line usage note per engine. Every engine identifier SHALL resolve verbatim from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 5 allocation in [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-005`). No placeholder, deprecated, undefined, duplicate, or additional engine identifiers are permitted.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every Purchase Return and adjustment-request action. |
| `ENG-004` Audit | Records every Purchase Return and adjustment-request lifecycle transition with actor, tenant/company scope, entity identifier, transition type, and timestamp. |
| `ENG-007` Document | Provides the commercial-document primitive (identifier, header/line structure, lifecycle scaffolding) used by the Purchase Return and adjustment-request documents. |
| `ENG-008` Attachment | Binds return evidence, correspondence, and quality inspection reports to Purchase Return and adjustment-request documents. |
| `ENG-010` Workflow | Drives the Purchase Return and adjustment-request lifecycle state transitions. |
| `ENG-011` Approval | Routes Purchase Return approvals and return-quantity / reason override approvals. |
| `ENG-012` Rules | Evaluates the return-quantity rule against accepted-receipt quantity net of prior returns (Module PRD §7). |
| `ENG-017` Numbering | Consumes the Purchase Return numbering series registered by `SPR-MOD-004-001`. |
| `ENG-018` Currency | Resolves document currency and FX on Purchase Return and adjustment-request documents; currency semantics are consumed, not redefined. |
| `ENG-024` Eventing | Publishes commercial return and adjustment events (`DebitNoteIssued` and `purchase-return.*`, `vendor-adjustment.*`, `replacement-request.*`, `vendor-return-authorization.*`) with the contracts declared in §11. |
| `ENG-025` Notification | Dispatches buyer, procurement manager, vendor coordinator, branch manager, and accounts liaison notifications on lifecycle transitions. |

Purchase business semantics (Purchase Return lifecycle, validation, amendment, approval, cancellation, finalization, Replacement Request, Vendor Return Authorization, Debit Note Request, Vendor Adjustment Request) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Identifiers resolve verbatim from [`ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md).

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Purchase Return and adjustment-request read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Purchase Return and adjustment-request actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Purchase Return | MOD-004 (this sprint) | Header for a commercial Purchase Return under a company, referencing one or more Goods Receipt lines and (optionally) Vendor Bill lines. |
| Return Line | MOD-004 (this sprint) | Line item on a Purchase Return referencing a GRN line and (optionally) a Vendor Bill line. |
| Return Status | MOD-004 (this sprint) | Deterministic state on a Purchase Return (draft, submitted, approved, blocked, finalized, cancelled). |
| Vendor Return Authorization | MOD-004 (this sprint) | Structured record of vendor acknowledgement or authorization of the Purchase Return. |
| Replacement Request | MOD-004 (this sprint) | Commercial request for replacement of returned goods, with structured reason and lifecycle state. |
| Vendor Adjustment Request | MOD-004 (this sprint) | Commercial request for a non-return adjustment against a Vendor Bill or line (price correction, rebate, allowance) with structured reason. |
| Debit Note Request | MOD-004 (this sprint) | Commercial request for issuance of a debit note against a Vendor Bill or line (accounting debit-note document owned by MOD-002 Accounting). |
| Return Attachment | MOD-004 (this sprint) | Attachment binding on a Purchase Return or adjustment-request document (return evidence, correspondence, inspection report) via `ENG-008`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Purchase Returns**.
- A **Purchase Return** has one or more **Return Lines**; each line references at least one GRN line owned by `SPR-MOD-004-003` and (optionally) one or more Vendor Bill lines owned by `SPR-MOD-004-004`.
- A **Purchase Return** and each of its lines carry a **Return Status**; state transitions are audited.
- A **Purchase Return** MAY have zero or one prevailing **Vendor Return Authorization** and zero or more **Replacement Requests**.
- A **Purchase Return** MAY have zero or more **Debit Note Requests**.
- A Vendor Bill (owned by `SPR-MOD-004-004`) MAY have zero or more **Vendor Adjustment Requests** authored here.
- A **Return Attachment** belongs to exactly one Purchase Return or adjustment-request document.
- Supplier references resolve against the Vendor Master owned by `SPR-MOD-004-001`; PO references resolve against `SPR-MOD-004-002`; GRN references resolve against `SPR-MOD-004-003`; Vendor Bill references resolve against `SPR-MOD-004-004`; item references resolve against the Inventory item master (MOD-005) transitively via the GRN/Vendor Bill line.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-004` per the Purchase Return Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- **Inventory stock ledger, putaway reversal, cost-layer reversal, warehouse operations, and inventory transactions/movements are NOT represented here** — owned by MOD-005 Inventory.
- **Accounting vouchers, journals, ledger entries, payables ledger balances, tax postings, and payment records are NOT represented here** — owned by MOD-002 Accounting. Any accounting effect is requested via the Accounting Voucher Creation Contract.
- Customer master is NOT represented here — owned by MOD-003 Sales.
- Vendor Master, buyer master, purchasing organization, T&C master, purchase price list master, and purchase configuration namespace are consumed from `SPR-MOD-004-001` and are NOT redefined here.
- Purchase Requisition, RFQ, Vendor Quotation, and Purchase Order are consumed from `SPR-MOD-004-002` and are NOT redefined here.
- Goods Receipt Note, receipt lifecycle, inspection, acceptance, and rejection are consumed from `SPR-MOD-004-003` and are NOT redefined here.
- Vendor Bill, Commercial 3-Way Match, and match-exception workflow are consumed from `SPR-MOD-004-004` and are NOT redefined here.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Every event name SHALL resolve verbatim from [`docs/02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Any event that cannot be resolved SHALL NOT be invented and SHALL instead be recorded as a deferred `R-EV-*` risk in §14. No Event Catalog modifications are permitted by this sprint. `DebitNoteIssued` is declared verbatim from `MOD-004` Module PRD §8 and from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-005`) Sprint Exit Criteria.

| Event Name (subject to catalog resolution) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `DebitNoteIssued` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self, downstream sprints), MOD-002 (Accounting — voucher creation via Accounting Voucher Creation Contract), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `purchase-return.created` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `purchase-return.submitted` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `purchase-return.amended` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `purchase-return.approved` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self, downstream sprints), MOD-017 | At-least-once, ordered per tenant |
| `purchase-return.cancelled` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `purchase-return.finalized` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self, downstream sprints), MOD-005 (Inventory — inventory reversal via Inventory Return Contract), MOD-017 | At-least-once, ordered per tenant |
| `replacement-request.raised` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `vendor-return-authorization.recorded` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `vendor-adjustment.requested` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self), MOD-002, MOD-017 | At-least-once, ordered per tenant |
| `vendor-adjustment.finalized` | MOD-004 | SPR-MOD-004-005 | MOD-004 (self, downstream sprints), MOD-002 (Accounting — voucher creation via Accounting Voucher Creation Contract), MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Commercial return events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Purchase Return and adjustment-request read and write.
- [ ] Every Purchase Return and adjustment-request lifecycle transition produces an audit record via `ENG-004`.
- [ ] Return-quantity rule (Module PRD §7) is enforced via `ENG-012`.
- [ ] Purchase Return numbering is consumed via `ENG-017` from the series registered by `SPR-MOD-004-001`.
- [ ] Attachments bind via `ENG-008`; notifications dispatch via `ENG-025` on configured transitions.
- [ ] Finalization emits a request for inventory reversal to MOD-005 Inventory under the Inventory Return Contract; no inventory transaction is authored by this sprint.
- [ ] Debit Note Request and Vendor Adjustment Request finalization emit requests for accounting voucher creation under the Accounting Voucher Creation Contract exposed by `MOD002_ACCOUNTING_BASELINE_v1`; no accounting journal, ledger entry, payables record, or payment record is authored by this sprint.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-005`):

- Purchase returns can be created, approved, and linked to original GRN and invoice lines.
- Debit notes are issued through the business lifecycle and are auditable and traceable to the original transaction.
- Return accounting contracts are produced for `MOD002_ACCOUNTING_BASELINE_v1` consumption.
- `DebitNoteIssued` event is published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable).

- **Risk ID:** R-01
  - **Description:** Inventory dependency — Purchase Return finalization requests physical inventory reversal from MOD-005 Inventory under the Inventory Return Contract.
  - **Impact:** Contract drift between Purchase and Inventory could break downstream stock reversal and cost-layer reversal.
  - **Mitigation:** Emit only the repository-defined inventory reversal request via `ENG-024`; do not perform stock ledger writes directly; treat Inventory-side contract changes as governance events, not silent absorption.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Accounting dependency — Debit Note Request and Vendor Adjustment Request finalization request accounting voucher creation via the Accounting Voucher Creation Contract exposed by `MOD002_ACCOUNTING_BASELINE_v1`.
  - **Impact:** Contract drift between Purchase and Accounting could break downstream voucher creation and payables adjustment.
  - **Mitigation:** Emit only the repository-defined voucher-creation request; do not perform accounting posting directly; treat Accounting-side contract changes as governance events.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** GRN dependency — Sprint 5 consumes GRN context authored by `SPR-MOD-004-003` for return-quantity validation and traceability.
  - **Impact:** Regression against the GRN contract (line semantics, acceptance state, quantity variance) would corrupt return validation.
  - **Mitigation:** Consume GRN context read-only; treat any regression as a `SPR-MOD-004-003` defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Vendor Bill dependency — Sprint 5 consumes Vendor Bill context authored by `SPR-MOD-004-004` for Debit Note Request and Vendor Adjustment Request traceability.
  - **Impact:** Regression against the Vendor Bill contract (line semantics, finalization state) would corrupt debit-note-request and adjustment-request context.
  - **Mitigation:** Consume Vendor Bill context read-only; treat any regression as a `SPR-MOD-004-004` defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Purchase Order dependency — Sprint 5 consumes PO context authored by `SPR-MOD-004-002` transitively via GRN and Vendor Bill references.
  - **Impact:** Regression against the PO contract (line semantics, amendment lifecycle) would corrupt commercial provenance on returns and adjustments.
  - **Mitigation:** Consume PO context read-only; treat any regression as a `SPR-MOD-004-002` defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Cross-module contract drift — downstream sprints (`SPR-MOD-004-006`) and MOD-005 Inventory / MOD-002 Accounting consume Sprint-5 events and Purchase Return / adjustment-request context.
  - **Impact:** Changes to event payloads or Purchase Return state semantics after Sprint 5 completes would ripple downstream.
  - **Mitigation:** Publish event contracts through the authoritative catalog; treat contract changes as catalog governance events.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Purchase Return approval dependency — approval routing depends on the workflow model and approval semantics exposed by `ENG-011` and the rule set registered by `SPR-MOD-004-001`.
  - **Impact:** Regression in approval routing would block Purchase Return approvals and return-quantity overrides.
  - **Mitigation:** Consume `ENG-011` per its specification; treat any regression as an engine or Foundation defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Purchase Return numbering dependency — Sprint 5 consumes the Purchase Return numbering series registered by `SPR-MOD-004-001` via `ENG-017`. `ENG-017` is cited by verbatim engine identifier because it appears in both the Sprint 5 allocation of [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-005`) and [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md) for MOD-004.
  - **Impact:** Regression in the numbering series registration or in `ENG-017` allocation would block Purchase Return authoring and audit reconstruction.
  - **Mitigation:** Consume the repository-approved numbering engine only; treat any regression as a Foundation / numbering-engine defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** Shipment discrepancy risk — commercial returns MAY be authored against goods received under quantity, quality, or specification discrepancy.
  - **Impact:** If discrepancy handling on the GRN side (`SPR-MOD-004-003`) is not consumed correctly, return provenance and evidence trails may be inconsistent.
  - **Mitigation:** Reference the accepted-receipt quantity net of prior returns via the rule set registered by `SPR-MOD-004-001`; require structured reason on submission; retain evidence via `ENG-008`.
  - **Status:** Open

- **Risk ID:** R-10
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** The authoritative event catalog is currently a stub. Every event name declared in §11 — including `DebitNoteIssued` (verbatim from Module PRD §8) and the `purchase-return.*`, `replacement-request.*`, `vendor-return-authorization.*`, and `vendor-adjustment.*` lifecycle events — is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before Purchase Sprint 6 begins consuming these events. The Event Catalog is not modified by this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Purchase Return lifecycle invariants; amendment prior/new-value capture; return-quantity rule binding; Replacement Request, Vendor Return Authorization, Debit Note Request, and Vendor Adjustment Request persistence and state transitions.
- **Integration** — audit emission via `ENG-004`; document primitive via `ENG-007`; attachment binding via `ENG-008`; workflow via `ENG-010`; approval routing via `ENG-011`; rule evaluation via `ENG-012`; numbering consumption via `ENG-017`; currency via `ENG-018`; event publication via `ENG-024`; notification dispatch via `ENG-025`.
- **Contract** — commercial return event contracts against the event catalog for `DebitNoteIssued` and `purchase-return.*` / `replacement-request.*` / `vendor-return-authorization.*` / `vendor-adjustment.*` events; Inventory Return Contract consumed by MOD-005; Accounting Voucher Creation Contract consumed by MOD-002.
- **End-to-end (smoke)** — GRN acceptance → Purchase Return authoring → approval (with a return-quantity override) → finalization → Inventory Return Contract handoff → Debit Note Request → finalization → Accounting Voucher Creation Contract handoff, executed under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation, return-quantity enforcement, and contract handoffs.

Sprint-specific fixtures: a two-company smoke fixture with a pre-seeded Vendor Master (from `SPR-MOD-004-001`), open POs (from `SPR-MOD-004-002`), accepted GRNs (from `SPR-MOD-004-003`), finalized Vendor Bills (from `SPR-MOD-004-004`), and configured return-quantity rule used to prove tenancy, quantity enforcement, and contract handoff invariants.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Purchase Return and adjustment-request lifecycles as small state machines so audit emission (§5.14) and event publication (§5.16) are trivially satisfiable at every transition.
- Consider carrying Return Lines, Replacement Requests, Vendor Return Authorizations, Debit Note Requests, and Vendor Adjustment Requests as first-class Purchase Return / Vendor Bill children so downstream analytics (`SPR-MOD-004-006`) can consume them without recomputation.
- Consider isolating the Inventory Return Contract handoff and the Accounting Voucher Creation Contract handoff behind explicit repository boundaries so the "no inventory transactions" and "no accounting journals" invariants are enforced structurally.
- Consider guarding the return-quantity evaluation behind an explicit rule identifier registered by `SPR-MOD-004-001`, so the enforcement path is diagnosable.
- Consider mapping `DebitNoteIssued` and the `purchase-return.*` / `replacement-request.*` / `vendor-return-authorization.*` / `vendor-adjustment.*` events to authoritative catalog names as soon as `R-EV-01` is resolved.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-004-005`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial Purchase Returns and Vendor Adjustments lifecycle: Purchase Return lifecycle, validation, amendment, approval, cancellation, finalization, Replacement Request, Vendor Return Authorization, Debit Note Request, and Vendor Adjustment Request (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 forward and reverse traceability tables; every feature is tied to a `MOD-004` MODULE_PRD section. No orphan requirements. Bidirectional mapping preserved; unique originating allocation preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Purchase Return Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists analytics (deferred to Sprint 6), plus Accounting/Inventory/Sales-owned scope and Foundation/PO/GRN/Vendor Bill scope, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes and explicit ownership invariants.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-004-006`) begin immediately after this one completes?**
   Yes. `SPR-MOD-004-006 Purchase Analytics & Controls` is the immediate successor per [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-004-001` … `SPR-MOD-004-005`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)
- Upstream Sprint — [`./SPR-MOD-004-001-purchase-foundation.md`](./SPR-MOD-004-001-purchase-foundation.md)
- Upstream Sprint — [`./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md)
- Upstream Sprint — [`./SPR-MOD-004-003-goods-receipt-inspection.md`](./SPR-MOD-004-003-goods-receipt-inspection.md)
- Upstream Sprint — [`./SPR-MOD-004-004-vendor-billing-3-way-match.md`](./SPR-MOD-004-004-vendor-billing-3-way-match.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
