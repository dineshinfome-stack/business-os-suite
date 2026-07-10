---
title: "SPR-MOD-004-002 — Requisitions, RFQs & Purchase Orders"
summary: "Sprint PRD for the commercial procurement document lifecycle: purchase requisitions, requests for quotation, supplier comparison, and purchase orders — creation, approval, amendment, cancellation, pricing/discount application, attachments, notifications, and events. Consumes SPR-MOD-004-001 Vendor Master and upstream baselines; never redefines them."
layer: "delivery"
owner: "Procurement"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-004-002"
parent_module: "MOD-004"
parent_sprint_plan: "MOD-004_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "8.6.2"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-018", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "purchase", "requisitions", "rfq", "purchase-order", "mod-004", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-004-002 — Requisitions, RFQs & Purchase Orders

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-004 Purchase** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines, Accepted ADRs, and the Vendor Master established by `SPR-MOD-004-001`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-004-002` (permanent) |
| Parent Module | `MOD-004` — Purchase |
| Parent Sprint Plan | [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (all frozen) |
| Upstream Sprint | [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md) — Purchase Foundation (originating supplier of Vendor Master) |
| Downstream Sprints | `SPR-MOD-004-003` … `SPR-MOD-004-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **commercial procurement document lifecycle** for BusinessOS: purchase requisitions, requests for quotation (RFQ) with supplier comparison, and purchase orders (PO). Sprint 2 owns creation, approval, amendment, cancellation, pricing and discount application, buyer commitment, attachments, notifications, audit, and events for these three document types. It is the substrate that every subsequent Purchase sprint — goods receipt, vendor billing, returns, and analytics — depends on for open PO context and buyer-commitment history.

> **Purchase Document Ownership Convention.** MOD-004 Purchase owns the business semantics of the purchase requisition, RFQ, supplier quotation, quote comparison, and purchase order document lifecycles. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, document, attachment, workflow, approval, rules, numbering, currency, eventing, notification) but **MUST NOT** redefine purchase document business rules. Downstream Purchase sprints consume open PO context, requisition history, and buyer commitments rather than reintroducing parallel commercial document lifecycles. This complements — and does not redefine — the Purchase Ownership Convention established in `SPR-MOD-004-001` and the ownership boundaries codified by `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, and `MOD003_SALES_BASELINE_v1`.

#### 1.1.1 Vendor Master Consumption (Upstream Dependency on SPR-MOD-004-001)

`SPR-MOD-004-001` SHALL be treated as the **originating supplier** of all Vendor Master capabilities consumed by Sprint 2. Sprint 2 SHALL consume, and SHALL NOT redefine, Vendor Master ownership, supplier categorisation, buyer master, purchasing organization structure, terms & conditions master, purchase price list master, purchase configuration namespace, and purchase-document numbering series established by `SPR-MOD-004-001`. Any supplier attribute required by a requisition, RFQ, quotation, or PO is resolved from the Purchase Foundation, not redefined here. This mirrors the explicit dependency chain established in MOD-003 Sales (`SPR-MOD-003-001` Foundation → `SPR-MOD-003-002` Orders → `SPR-MOD-003-003` Delivery → `SPR-MOD-003-004` Invoicing).

#### 1.1.2 Commercial Ownership Boundary (Purchase ↔ Accounting ↔ Inventory ↔ Sales)

Ownership boundaries at the requisitions/RFQs/POs layer:

- **Purchase owns** the requisition, RFQ, quotation, quote comparison, and purchase order document lifecycles; approval routing configuration for these documents; commercial pricing/discount application on these documents; and buyer commitment semantics.
- **Accounting owns** accounting vouchers, journal posting, ledger posting, taxation calculation, financial reporting, payables ledger, payment execution, and accounting period governance. Sprint 2 MUST NOT create accounting journals, ledger entries, or independently manage accounting voucher lifecycles. Buyer commitment on a PO is a commercial signal, not a ledger posting.
- **Inventory owns** item master, stock ledger, putaway, and inventory reservation semantics. Sprint 2 consumes item references from Inventory for line items on requisitions, RFQs, quotations, and POs; it does not redefine inventory ownership. Goods receipt is delivered by `SPR-MOD-004-003`.
- **Sales owns** the Customer master. Sprint 2 MUST NOT reference customer entities on procurement documents.

Ownership boundaries SHALL NOT be redefined in downstream Purchase Sprint PRDs.

#### 1.1.3 Approval Ownership

Approval routing and thresholds for requisitions and purchase orders are resolved through `ENG-005` Configuration (thresholds registered by `SPR-MOD-004-001`) and routed through `ENG-011` Approval. Sprint 2 owns the approval **binding** on procurement documents; it does not redefine the Approval engine.

#### 1.1.4 Blocked-Supplier Rule Enforcement

The blocked-supplier flag is **registered** on the Vendor Master by `SPR-MOD-004-001`. Sprint 2 enforces the blocked-supplier rule via `ENG-012` Rules on requisition-to-supplier assignment, RFQ issuance, and purchase order creation, per Module PRD §7. The rule evaluation itself is delegated to `ENG-012`; Sprint 2 owns the binding of that rule to procurement document lifecycles.

### 1.2 In Scope

- **Purchase Requisition lifecycle.** Creation, edit, submission, approval, rejection, cancellation, and closure of purchase requisitions with line items.
- **Requisition approval.** Approval routing via `ENG-011` using thresholds resolved through `ENG-005`; multi-stage approval decisions where configured.
- **RFQ lifecycle.** RFQ creation from an approved requisition (or standalone), issuance to selected suppliers, vendor quotation intake, quote comparison, and RFQ closure with a winning supplier selection.
- **Supplier comparison.** Deterministic comparison of vendor quotations across suppliers on price, terms, and delivery — as a Purchase-owned commercial primitive.
- **Purchase Order lifecycle.** Creation of a PO (from an approved requisition, an awarded RFQ, or standalone), approval, issuance to the supplier, amendment, cancellation, and closure. Buyer commitment is the terminal issued state.
- **PO amendments.** Structured amendment lifecycle preserving audit history and re-triggering approval where the amendment crosses configured thresholds.
- **Pricing and discount application.** Application of purchase price list references (from `SPR-MOD-004-001`) and line/document discounts on requisitions, RFQs, quotations, and POs. Tax and ledger posting remain out of scope (owned by Accounting).
- **Terms & conditions binding.** Reference to Terms & Conditions templates (from `SPR-MOD-004-001`) on RFQs and POs.
- **Currency handling.** PO currency resolved via `ENG-018` for supplier-facing documents; currency semantics are consumed, not redefined.
- **Attachments.** Attachment binding on requisitions, RFQs, quotations, and POs via `ENG-008`.
- **Notifications.** Buyer, supplier, and requester notifications on lifecycle transitions via `ENG-025`.
- **Blocked-supplier enforcement.** Rule evaluation via `ENG-012` at requisition-to-supplier assignment, RFQ issuance, and PO creation.
- **Numbering consumption.** Consumption of the purchase-document numbering series registered by `SPR-MOD-004-001` via `ENG-017` — for purchase requisition, RFQ, and purchase order document types. Consumption for goods receipt, purchase invoice, and debit note remains scoped to their owning downstream sprints.
- **Audit.** Audit records for every requisition, RFQ, quotation, quote comparison, and purchase order lifecycle transition via `ENG-004`.
- **Events published (see §11).** `RequisitionApproved`, `PurchaseOrderIssued`, and additional lifecycle events subject to authoritative event-catalog resolution (see §11 and `R-EV-01`).

### 1.3 Out of Scope

Reserved for later Purchase sprints (see [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)):

- Goods receipt, inspection hold, tolerance validation on GRN quantity, warehouse-handover contracts — `SPR-MOD-004-003`.
- Vendor bill / purchase invoice lifecycle, 3-way match arithmetic, tax determination, payables creation contracts, accounting voucher handoff — `SPR-MOD-004-004`.
- Purchase returns and debit-note issuance — `SPR-MOD-004-005`.
- Purchase analytics, spend analytics, PO ageing, supplier performance, price variance, 3-way match exception review — `SPR-MOD-004-006`.
- Accounting vouchers, journal posting, ledger posting, taxation calculation, payables ledger, payment execution — owned by MOD-002 Accounting; consumed via `MOD002_ACCOUNTING_BASELINE_v1`.
- Inventory item master, stock ledger, putaway, reservation semantics — owned by MOD-005 Inventory.
- Vendor Master, supplier categorisation, buyer master, purchasing organization, T&C master, purchase price list master, purchase configuration namespace, purchase-document numbering series registration — owned by `SPR-MOD-004-001` and consumed here.
- Customer master and sales-side lifecycles — owned by MOD-003 Sales; consumed via `MOD003_SALES_BASELINE_v1`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-004-002`, the following will exist:

- **Business capabilities.**
  - A buyer or requester can create, edit, submit, approve, reject, cancel, and close a purchase requisition under a tenant/company.
  - A buyer can create an RFQ from an approved requisition or standalone, issue it to selected suppliers, receive vendor quotations, and produce a deterministic supplier comparison.
  - A buyer can create a purchase order from an approved requisition, an awarded RFQ, or standalone, drive it through approval, issuance, amendment, cancellation, and closure.
  - Approval thresholds resolve via `ENG-005` and route through `ENG-011`; multi-stage approvals are supported where configured.
  - Blocked-supplier rule is enforced via `ENG-012` on requisition-to-supplier assignment, RFQ issuance, and PO creation.
  - Pricing and discount application uses purchase price lists from `SPR-MOD-004-001`; currency resolves via `ENG-018`.
  - Attachments bind to requisitions, RFQs, quotations, and POs via `ENG-008`.
  - Notifications reach buyers, suppliers, and requesters on lifecycle transitions via `ENG-025`.
  - Purchase requisition, RFQ, and purchase order numbering is consumed via `ENG-017` from series registered by `SPR-MOD-004-001`.
- **Published events.** Purchase-commercial-document event contracts (see §11) registered in the event catalog and emitted by the corresponding lifecycle transitions.
- **Audit artifacts.** An audit record exists for every requisition, RFQ, quotation, quote comparison, and PO lifecycle transition, produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-004-002`.
  - Purchase-commercial-document event entries in the event catalog referenced from §11.
- **Downstream forward references.** Deliverables produced here are consumed by `SPR-MOD-004-003` (open PO context for GRN), `SPR-MOD-004-004` (PO context for 3-way match), `SPR-MOD-004-005` (PO/GRN traceability for returns), and `SPR-MOD-004-006` (analytics inputs).
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

Bidirectional traceability. Every Sprint-2 capability traces back to an approved MOD-004 Module PRD section, and every relevant Module PRD section covered by Sprint 2 traces forward to a deliverable below. No Sprint-2 capability is orphaned from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-002`); unique originating allocation is preserved (no capability delivered here is also allocated to another Purchase sprint).

| MOD-004 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Purchase requisition and approval, RFQ and supplier comparison, Purchase orders and amendments | Requisition, RFQ, quotation, quote comparison, purchase order lifecycles (§1.2) |
| §3 Personas — Buyer, Procurement Manager, Requester | User stories (§4) |
| §4 Business Processes — Requisition-to-PO | End-to-end lifecycle acceptance criteria (§5) |
| §6 Transactions — Purchase Requisition, RFQ, Purchase Order | Conceptual data model (§10) |
| §7 Business Rules — Blocked-supplier rule enforcement | Rule binding via `ENG-012` (§5.5) |
| §8 Integration Points — `RequisitionApproved`, `PurchaseOrderIssued` (published) | Events (§11) |
| §10 Configuration — Approval thresholds, tolerance settings | Approval binding via `ENG-005` + `ENG-011` (§5.2, §5.6) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Purchase Module PRD, and no capability allocated to Sprint 2 in `MOD-004_SPRINT_PLAN.md` is orphaned from this Sprint PRD** (unique originating allocation preserved).

---

## 4. User Stories

- **US-001.** *As a requester, I want to create a purchase requisition with line items under my company, so that I can request materials or services with a deterministic approval path.*
- **US-002.** *As a department manager, I want requisitions above a configured threshold to route to me for approval, so that spend control is enforced before commitments are made.*
- **US-003.** *As a procurement manager, I want multi-stage approval decisions to be recorded per approval stage, so that audit and traceability of the approval chain are unambiguous.*
- **US-004.** *As a buyer, I want to create an RFQ from an approved requisition, issue it to selected suppliers, and receive vendor quotations, so that competitive sourcing is possible before commitment.*
- **US-005.** *As a buyer, I want a deterministic supplier comparison across vendor quotations on price, terms, and delivery, so that award decisions are objective and auditable.*
- **US-006.** *As a buyer, I want to create a purchase order from an approved requisition, an awarded RFQ, or standalone, so that supplier commitment can be issued deterministically.*
- **US-007.** *As a buyer, I want to amend or cancel a purchase order with full audit history, so that legitimate change control is preserved.*
- **US-008.** *As a buyer, I want the blocked-supplier rule to prevent requisition assignment, RFQ issuance, and PO creation against blocked suppliers, so that commercial policy is enforced deterministically.*
- **US-009.** *As a buyer, I want to apply purchase price list references and line/document discounts to requisitions, RFQs, quotations, and POs, so that commercial pricing is consistent across the document chain.*
- **US-010.** *As a buyer, I want attachments and notifications on every procurement document, so that supporting evidence is preserved and stakeholders are informed.*
- **US-011.** *As a downstream module (system persona), I want to receive `RequisitionApproved`, `PurchaseOrderIssued`, and related lifecycle events, so that goods receipt, vendor billing, returns, and analytics can react deterministically.*
- **US-012.** *As a security reviewer, I want every commercial-document lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the requisition, RFQ, quotation, and PO history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Purchase Requisition lifecycle (US-001)

- **Given** a valid purchase requisition creation request under an active company, with line items referencing item and supplier candidates,
  **when** a requester submits it,
  **then** the requisition is persisted with a stable identifier, its number is consumed from the requisition series via `ENG-017`, and the transition is audited via `ENG-004`.
- **Given** a purchase requisition in an editable state,
  **when** a requester edits allowed fields,
  **then** the update is persisted and audited.
- **Given** a purchase requisition submitted for approval,
  **when** approval is granted or rejected,
  **then** the lifecycle transitions deterministically, downstream state is set, and audit and event records are produced.
- **Given** a purchase requisition in a cancellable state,
  **when** a requester or authorized actor cancels it,
  **then** the requisition is transitioned to cancelled and no partial state is left behind.

### 5.2 Requisition approval routing (US-002, US-003)

- **Given** an approval threshold configured under a company via `ENG-005`,
  **when** a requisition is submitted whose value crosses the threshold,
  **then** it routes to the configured approver(s) through `ENG-011` and is not treated as approved until the routing completes deterministically.
- **Given** a multi-stage approval configuration,
  **when** each stage records a decision (approve or reject),
  **then** each **Purchase Approval Stage** decision is persisted with its actor, stage index, decision, and timestamp, and the overall requisition state advances only when all required stages approve.

### 5.3 RFQ lifecycle and vendor quotations (US-004)

- **Given** an approved purchase requisition (or a standalone RFQ request),
  **when** a buyer creates an RFQ and issues it to selected suppliers,
  **then** the RFQ is persisted, its number is consumed via `ENG-017`, notifications reach the selected suppliers via `ENG-025`, and the transition is audited.
- **Given** an issued RFQ,
  **when** a vendor quotation is recorded against it,
  **then** the quotation is persisted, associated to the RFQ and its issuing supplier, and audited.

### 5.4 Supplier comparison and RFQ award (US-005)

- **Given** at least two vendor quotations against a single RFQ,
  **when** a buyer performs a supplier comparison,
  **then** a deterministic comparison is produced across price, terms, and delivery, and the RFQ can be closed with a recorded winning supplier selection.
- **Given** an RFQ closure with an awarded supplier,
  **when** closure is submitted,
  **then** the RFQ is transitioned to closed and audit and event records are produced.

### 5.5 Purchase order lifecycle, amendments, and blocked-supplier enforcement (US-006, US-007, US-008)

- **Given** an approved requisition, an awarded RFQ, or a valid standalone PO input,
  **when** a buyer creates a PO,
  **then** the PO is persisted, its number is consumed via `ENG-017`, and the transition is audited.
- **Given** a PO in an approvable state,
  **when** approval routing configured via `ENG-005` completes through `ENG-011`,
  **then** the PO advances to issued, buyer commitment is recorded, and the `PurchaseOrderIssued` event is produced.
- **Given** an issued PO,
  **when** an amendment is submitted,
  **then** the amendment is persisted with full history, and if the amendment crosses configured thresholds, approval is re-triggered through `ENG-011`.
- **Given** a PO in a cancellable state,
  **when** a buyer or authorized actor cancels it,
  **then** it is transitioned to cancelled and no partial commitment is left behind.
- **Given** a supplier flagged as blocked on the Vendor Master (`SPR-MOD-004-001`),
  **when** a requisition-to-supplier assignment, RFQ issuance, or PO creation references that supplier,
  **then** the operation is rejected deterministically via `ENG-012` and the rejection is audited.

### 5.6 Pricing, discounts, currency, and terms binding (US-009)

- **Given** a purchase price list registered by `SPR-MOD-004-001`,
  **when** a requisition, RFQ, quotation, or PO references it,
  **then** the price reference is resolved and applied to the referencing line, and line/document discounts are applied deterministically.
- **Given** a document currency,
  **when** the PO is issued to a supplier,
  **then** currency semantics resolve via `ENG-018` without being redefined here.
- **Given** a Terms & Conditions template registered by `SPR-MOD-004-001`,
  **when** an RFQ or PO references it,
  **then** the reference is persisted on the document.

### 5.7 Attachments and notifications (US-010)

- **Given** any procurement document (requisition, RFQ, quotation, PO) in an editable or issued state,
  **when** an actor attaches a file,
  **then** the attachment binds via `ENG-008` and is audited.
- **Given** a lifecycle transition on any procurement document,
  **when** it completes,
  **then** the configured notifications are dispatched via `ENG-025`.

### 5.8 Audit integration (US-012)

- **Given** any commercial-document lifecycle transition (requisition, RFQ, quotation, quote comparison, PO create, submit, approve, reject, issue, amend, cancel, close),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.9 Events (US-011)

- **Given** a commercial-document lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used; unresolved names are recorded as deferred `R-EV-*` risks in §14.

### 5.10 Isolation invariants (`ADR-011`)

- **Given** any commercial-document read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.11 Ownership consumption invariants

- **Given** any procurement document authored under this sprint,
  **when** it references supplier, buyer, purchasing organization, T&C, or price list entities,
  **then** it does so exclusively through Purchase Foundation-owned masters established by `SPR-MOD-004-001`. No parallel supplier, buyer, T&C, or price list master is introduced here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-004` — Purchase.
- **Module PRD:** [`docs/20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Purchase requisition and approval, RFQ and supplier comparison, Purchase orders and amendments), §3 (Buyer, Procurement Manager, Requester), §4 (Requisition-to-PO), §6 (Purchase Requisition, RFQ, Purchase Order), §7 (Blocked-supplier rule enforcement), §8 (`RequisitionApproved`, `PurchaseOrderIssued` — published), §10 (Approval thresholds), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-004` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting ownership conventions. Buyer commitment on a PO is a commercial signal; Sprint 2 MUST NOT create accounting journals or ledger entries.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Customer master ownership boundary. Sprint 2 MUST NOT reference customer entities on procurement documents.
- **Upstream sprint dependencies:**
  - [`SPR-MOD-004-001`](./SPR-MOD-004-001-purchase-foundation.md) — Purchase Foundation. **`SPR-MOD-004-001` SHALL be treated as the originating supplier of all Vendor Master capabilities consumed by Sprint 2. Sprint 2 SHALL consume, and SHALL NOT redefine, Vendor Master ownership established by `SPR-MOD-004-001`.** This includes supplier master, supplier categorisation, buyer master, purchasing organization, T&C master, purchase price list master, purchase configuration namespace, blocked-supplier flag registration, and purchase-document numbering series. This mirrors the explicit Foundation → Orders → Delivery → Invoicing dependency chain established in MOD-003 Sales.
  - [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) — Sprint 2 allocation.
- **Downstream sprints:** `SPR-MOD-004-003` (Goods Receipt & Inspection — consumes open PO context), `SPR-MOD-004-004` (Vendor Billing & 3-Way Match — consumes PO context), `SPR-MOD-004-005` (Purchase Returns & Debit Notes — consumes PO/GRN traceability), `SPR-MOD-004-006` (Purchase Analytics & Controls — consumes commercial-document data and events).
- **Downstream module consumers of Sprint-2 events:** `MOD-004` (self, subsequent sprints), `MOD-005` Inventory (for open PO reference where applicable), `MOD-002` Accounting (for future payables reference in `SPR-MOD-004-004`), `MOD-017` Analytics — consuming exclusively via events and read APIs. Module identifiers resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md).

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Purchase Document Ownership Convention in §1.1). See each engine's specification for capability details.

One-line usage note per engine. Every engine identifier SHALL resolve verbatim from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 2 allocation in [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 (`SPR-MOD-004-002`). No placeholder, deprecated, undefined, or additional engine identifiers are permitted.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on requisition, RFQ, quotation, quote-comparison, and PO actions. |
| `ENG-004` Audit | Records every commercial-document lifecycle transition. |
| `ENG-005` Configuration | Resolves approval thresholds and other purchase configuration under the tenant/company hierarchy registered by `SPR-MOD-004-001`. |
| `ENG-007` Document | Provides the commercial-document primitive (identifier, header/line structure, lifecycle scaffolding) used by requisitions, RFQs, quotations, and POs. |
| `ENG-008` Attachment | Binds attachments to procurement documents. |
| `ENG-010` Workflow | Drives the requisition, RFQ, and PO lifecycle transitions. |
| `ENG-011` Approval | Routes requisition and PO approvals per thresholds resolved via `ENG-005`; records multi-stage approval decisions. |
| `ENG-012` Rules | Evaluates the blocked-supplier rule at requisition-to-supplier assignment, RFQ issuance, and PO creation. |
| `ENG-017` Numbering | Consumes the requisition, RFQ, and purchase-order numbering series registered by `SPR-MOD-004-001`. |
| `ENG-018` Currency | Resolves document currency on RFQs, quotations, and POs; currency semantics are consumed, not redefined. |
| `ENG-024` Eventing | Publishes commercial-document events with the contracts declared in §11. |
| `ENG-025` Notification | Dispatches buyer, supplier, and requester notifications on lifecycle transitions. |

Purchase business semantics (requisition/RFQ/quotation/quote-comparison/PO lifecycles, buyer commitment, commercial pricing and discount application, supplier comparison) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every commercial-document read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to commercial-document actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Purchase Requisition | MOD-004 (this sprint) | Header for a request to procure items or services under a company. |
| Requisition Line | MOD-004 (this sprint) | Line item on a purchase requisition referencing an item and optional supplier candidate. |
| RFQ | MOD-004 (this sprint) | Request-for-quotation header issued to one or more suppliers. |
| RFQ Vendor | MOD-004 (this sprint) | Association between an RFQ and an invited supplier. |
| Vendor Quotation | MOD-004 (this sprint) | Supplier response to an RFQ, associated to the issuing supplier. |
| Quote Comparison | MOD-004 (this sprint) | Deterministic comparison record across vendor quotations for an RFQ. |
| Purchase Order | MOD-004 (this sprint) | Header for a supplier commitment, referencing an approved requisition, an awarded RFQ, or a standalone origin. |
| Purchase Order Line | MOD-004 (this sprint) | Line item on a purchase order referencing an item and applying price/discount. |
| Purchase Approval | MOD-004 (this sprint) | Approval record bound to a requisition or PO. |
| Purchase Approval Stage | MOD-004 (this sprint) | Per-stage decision record within a multi-stage approval (actor, stage index, decision, timestamp). |
| Purchase Attachment | MOD-004 (this sprint) | Attachment binding on any procurement document via `ENG-008`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **purchase requisitions**, **RFQs**, **vendor quotations**, and **purchase orders**.
- A **purchase requisition** has one or more **requisition lines**; a **purchase order** has one or more **purchase order lines**.
- An **RFQ** has one or more **RFQ vendors** and zero or more **vendor quotations**; a **quote comparison** references at least two vendor quotations for the same RFQ.
- A **purchase order** MAY originate from an approved **purchase requisition**, from an awarded **RFQ**, or standalone.
- A **purchase approval** belongs to exactly one requisition or one PO; a **purchase approval** MAY have one or more **purchase approval stages** when multi-stage approval is configured.
- A **purchase attachment** belongs to exactly one procurement document (requisition, RFQ, quotation, or PO).
- All line-level item references resolve against the Inventory item master (MOD-005); supplier references resolve against the Vendor Master (`SPR-MOD-004-001`); T&C and price list references resolve against Purchase Foundation masters.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-004` per the Purchase Document Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Accounting journals, ledger entries, payables balances, tax postings, and payment records are NOT represented here — owned by Accounting.
- Inventory item master, stock ledger, putaway, and reservation are NOT represented here — owned by Inventory.
- Customer master is NOT represented here — owned by Sales.
- Vendor Master, supplier categorisation, buyer master, purchasing organization, T&C master, purchase price list master, and purchase configuration namespace are consumed from `SPR-MOD-004-001` and are NOT redefined here.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Only event names present verbatim in the authoritative event catalog are used. Any illustrative event below that does not resolve at authoring time is either replaced with its authoritative equivalent or deferred as `R-EV-*` in §14. The Event Catalog is **not** modified by this sprint. `RequisitionApproved` and `PurchaseOrderIssued` are declared verbatim from `MOD-004` Module PRD §8 and from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-002`) Sprint Exit Criteria.

| Event Name (subject to catalog resolution) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `RequisitionApproved` | MOD-004 | SPR-MOD-004-002 | MOD-004 (self), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `PurchaseOrderIssued` | MOD-004 | SPR-MOD-004-002 | MOD-004 (self, downstream sprints), MOD-005 (Inventory), MOD-002 (Accounting, payables reference in SPR-MOD-004-004), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `requisition.created` | MOD-004 | SPR-MOD-004-002 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `requisition.cancelled` | MOD-004 | SPR-MOD-004-002 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `rfq.issued` | MOD-004 | SPR-MOD-004-002 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `rfq.closed` | MOD-004 | SPR-MOD-004-002 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `vendor-quotation.received` | MOD-004 | SPR-MOD-004-002 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `purchase-order.amended` | MOD-004 | SPR-MOD-004-002 | MOD-004 (self, downstream sprints), MOD-017 | At-least-once, ordered per tenant |
| `purchase-order.cancelled` | MOD-004 | SPR-MOD-004-002 | MOD-004 (self, downstream sprints), MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Commercial-document events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every commercial-document read and write.
- [ ] Every commercial-document lifecycle transition produces an audit record via `ENG-004`.
- [ ] Approval thresholds resolve via `ENG-005` and route through `ENG-011`; multi-stage approval decisions are recorded per stage.
- [ ] Blocked-supplier rule is enforced via `ENG-012` on requisition-to-supplier assignment, RFQ issuance, and PO creation.
- [ ] Requisition, RFQ, and PO numbering is consumed via `ENG-017` from the series registered by `SPR-MOD-004-001`.
- [ ] Attachments bind via `ENG-008`; notifications dispatch via `ENG-025` on configured transitions.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-002`):

- Requisitions, RFQs, and purchase orders can be created, amended, approved, and cancelled through the business lifecycle.
- Approval thresholds resolve via `ENG-005` configuration and route through `ENG-011`.
- Blocked-supplier rule (Module PRD §7) is enforced via `ENG-012`.
- `RequisitionApproved` and `PurchaseOrderIssued` events are published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable).

- **Risk ID:** R-01
  - **Description:** Sprint 2 depends on `SPR-MOD-004-001` Purchase Foundation being authored and its masters (Vendor, buyer, purchasing organization, T&C, price list, configuration, numbering series) being resolvable.
  - **Impact:** Regression against the Purchase Foundation contract would block commercial-document authoring.
  - **Mitigation:** Consume `SPR-MOD-004-001` masters only; treat any regression as a Foundation defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-004 depends on `MOD001_PLATFORM_BASELINE_v1` for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks Sprint 2.
  - **Mitigation:** Rely on the frozen Platform baseline; treat regressions as baseline defects.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Accounting ownership boundaries (`MOD002_ACCOUNTING_BASELINE_v1`) MUST NOT be blurred by buyer-commitment semantics on POs.
  - **Impact:** Sprint 2 accidentally introducing ledger-adjacent semantics would violate Accounting ownership.
  - **Mitigation:** Buyer commitment is a commercial signal only; no journal, ledger, tax, or payables logic is introduced here.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Inventory item master (`MOD-005`) is not yet baselined; commercial-document line items reference items that will be authoritatively owned by Inventory.
  - **Impact:** If Inventory item master semantics evolve materially, line-item references may need reconciliation.
  - **Mitigation:** Treat item references as consumed-only pointers; do not embed inventory semantics in Purchase document logic.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Vendor quotation governance — supplier submissions may vary in structure, currency, and terms; deterministic supplier comparison depends on quotations normalising against RFQ contract.
  - **Impact:** Poorly structured vendor quotations undermine deterministic supplier comparison and audit.
  - **Mitigation:** Enforce quotation structure to conform to RFQ contract at intake; audit deviations via `ENG-004`.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Purchase approval workflow — multi-stage decisions must remain deterministic and reversible only through explicit re-approval, especially on PO amendments crossing thresholds.
  - **Impact:** Non-deterministic approval routing would break spend control and audit.
  - **Mitigation:** Route strictly through `ENG-011` with `ENG-005`-resolved thresholds; record every stage decision via **Purchase Approval Stage**.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Cross-module contract drift — downstream sprints (`SPR-MOD-004-003`, `SPR-MOD-004-004`, `SPR-MOD-004-005`, `SPR-MOD-004-006`) consume Sprint-2 events and open PO context.
  - **Impact:** Changes to event payloads or PO state semantics after Sprint 2 completes would ripple downstream.
  - **Mitigation:** Publish event contracts through the authoritative catalog; treat contract changes as catalog governance events, not silent absorption.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Supplier commercial pricing governance — purchase price list references and line/document discounts must remain consistent across requisition → RFQ → quotation → PO.
  - **Impact:** Divergent pricing along the document chain corrupts spend analytics and 3-way match arithmetic (`SPR-MOD-004-004`).
  - **Mitigation:** Resolve price-list references from `SPR-MOD-004-001` masters only; audit discount application on every transition.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** The authoritative event catalog is currently a stub. Every event name declared in §11 — including `RequisitionApproved` and `PurchaseOrderIssued` (verbatim from Module PRD §8) and the `requisition.*`, `rfq.*`, `vendor-quotation.*`, and `purchase-order.*` lifecycle events — is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before Purchase Sprint 3 begins consuming these events. The Event Catalog is not modified by this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — requisition, RFQ, quotation, quote-comparison, and PO lifecycle invariants; pricing and discount application; blocked-supplier rule binding; approval-stage decision persistence.
- **Integration** — audit emission via `ENG-004`; configuration resolution via `ENG-005`; document primitive via `ENG-007`; attachment binding via `ENG-008`; workflow via `ENG-010`; approval routing via `ENG-011`; rule evaluation via `ENG-012`; numbering consumption via `ENG-017`; currency via `ENG-018`; event publication via `ENG-024`; notification dispatch via `ENG-025`.
- **Contract** — commercial-document event contracts against the event catalog for `RequisitionApproved`, `PurchaseOrderIssued`, and lifecycle events.
- **End-to-end (smoke)** — requisition → approval → RFQ → quotation → comparison → PO → issuance → amendment → cancellation under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture with a pre-seeded Vendor Master, blocked supplier, and configured approval thresholds used to prove tenancy, blocked-supplier enforcement, and multi-stage approval invariants.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the commercial-document lifecycles as small state machines so audit emission (§5.8) and event publication (§5.9) are trivially satisfiable at every transition.
- Consider co-locating requisition → RFQ → PO derivation logic so line-level provenance is preserved without duplicating pricing application.
- Consider surfacing the blocked-supplier rejection with a structured audit reason so `R-05` and `R-08` are diagnosable.
- Consider making Purchase Approval Stage a first-class record from day one (even for single-stage approvals) so the multi-stage invariant is uniform.
- Consider guarding PO amendment approval re-triggering behind explicit threshold-delta checks so `R-06` mitigation is deterministic.
- Consider mapping `RequisitionApproved` and `PurchaseOrderIssued` to authoritative catalog names as soon as `R-EV-01` is resolved.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-004-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the commercial procurement document lifecycle for requisitions, RFQs, and purchase orders (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-004` MODULE_PRD section. No orphan requirements. Bidirectional mapping preserved; unique originating allocation preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Purchase Document Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists goods receipt, vendor billing, returns, analytics, plus Accounting/Inventory/Sales-owned scope and Vendor Master (owned by `SPR-MOD-004-001`), each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-004-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-004-003 Goods Receipt & Inspection` is the immediate successor per [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-004-002`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)
- Upstream Sprint — [`./SPR-MOD-004-001-purchase-foundation.md`](./SPR-MOD-004-001-purchase-foundation.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
