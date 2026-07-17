---
title: "SPR-MOD-015-003 — Multi-Tender Payments & Receipts"
summary: "Sprint PRD for the Payment-authorization slice of MOD-015 POS: multi-tender payment capture (cash, card, digital, mixed) on POS Sale; payment terminal integration; receipt generation and reprint; payment reversal on returns handoff. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Revenue"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-015-003"
parent_module: "MOD-015"
parent_sprint_plan: "MOD-015_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "17.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-010", "ENG-012", "ENG-017", "ENG-018", "ENG-023", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "pos", "mod-015", "payments", "receipts", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD015-003-20260717T010000Z-001"
parent_result_id: "GT003-MOD015-002-20260717T000000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-015-003 — Multi-Tender Payments & Receipts

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-015 POS** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-015-003` (permanent) |
| Parent Module | `MOD-015` — POS |
| Parent Sprint Plan | [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-015-001`](./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md), [`SPR-MOD-015-002`](./SPR-MOD-015-002-cart-pricing-discounts-and-offline-sale.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-015-004`, `SPR-MOD-015-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Payment-authorization** slice of MOD-015 POS: **multi-tender payment capture** (cash, card, digital, mixed) against a committed POS Sale; **payment terminal integration** routed exclusively through `ENG-023`; **receipt generation and reprint** with identity-preserving reprint semantics; and **payment reversal on returns handoff** consumed by `SPR-MOD-015-004`. Publication of `POSSaleCompleted` remains owned by `SPR-MOD-015-002`; this sprint does not republish it. This sprint does not deliver offers, loyalty, returns, day close, ledger posting, or foundation masters.

> **POS Ownership Convention (recapitulated, not evolved).** POS owns the business semantics of payment capture on POS Sale, receipt issuance and reprint, and the payment lifecycle on the POS Sale side. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, localization, document, workflow, rules, numbering, currency, integration, eventing, notification) but **MUST NOT** redefine POS business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects of tenders and receipts remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines — no POS sprint writes journal entries directly; MOD-002 consumes `POSSaleCompleted` and its downstream posting-rule bindings. Item, price list, and stock master remain exclusive to **MOD-005 Inventory** and are consumed read-only.

#### 1.1.1 Payment Capture & Tender Authority

The **Payment Capture** working entity and the **payment lifecycle** on POS Sale (initiated → tendered → authorized → captured, or reversed on returns handoff) are authoritatively owned by MOD-015 POS in this sprint. No other module MAY define a parallel payment capture entity or lifecycle for POS Sale tenders. Downstream sprints (Offers/Loyalty/Returns; Day Close/Analytics) consume the resulting payment records through POS-owned read APIs and events; they MUST NOT redefine tender states or transitions.

#### 1.1.2 Receipt Issuance & Reprint Authority

**Receipt issuance** and **reprint** for POS Sale are authoritatively owned by MOD-015 POS in this sprint. Receipts are generated via `ENG-007` Document, numbered via `ENG-017` from the POS receipt numbering series registered in Sprint 001, and every issuance and reprint is audited via `ENG-004`. **Reprints preserve the identity of the original receipt** — the reprint MUST NOT allocate a new receipt number, MUST NOT alter the original payload, and MUST be distinguishable from the original in the audit trail. Where receipt delivery to external recipients is configured, dispatch routes exclusively through `ENG-025` Notification.

#### 1.1.3 Payment Terminal Integration Authority

**Payment terminal integration** is authoritatively owned by MOD-015 POS in this sprint and routed exclusively through `ENG-023` Integration. No POS code path bypasses `ENG-023` to call a terminal directly. Terminal-authorization outcomes (approved, declined, referred, reversed) are recorded against the payment capture record, audited via `ENG-004`, and validated deterministically via `ENG-012`.

#### 1.1.4 POS ↔ Platform, Accounting, Inventory, and Analytics Boundary (recapitulated)

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. POS consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting. Ledger effects of payments and receipts are produced by MOD-002 posting-rule bindings triggered by the events published in Sprint 002 (`POSSaleCompleted`) and by the downstream events published in Sprints 004–005; no POS code path in this sprint writes journal entries or invokes `ENG-015` / `ENG-016` directly.
- **MOD-005 Inventory** owns Item, price list, and stock master data. This sprint does not consume MOD-005 master data on the payment path.
- **MOD-017 Analytics** owns cross-module KPI definitions. Cross-module KPIs are never redefined by MOD-015.

Ownership boundaries SHALL NOT be redefined in downstream POS Sprint PRDs.

### 1.2 In Scope

- **Multi-tender payment capture** against a committed POS Sale for tender categories declared by the Module PRD §2 (*Multi-tender payments*): cash, card, digital, mixed. Tender composition MUST sum to the POS Sale payable amount within currency scale via `ENG-018`; enforcement is deterministic via `ENG-012`.
- **Payment lifecycle** orchestration on the POS Sale side (initiated → tendered → authorized → captured; reversed on returns handoff) via `ENG-010` Workflow.
- **Payment terminal integration** routed exclusively through `ENG-023` Integration; terminal-authorization outcomes recorded, audited via `ENG-004`, validated via `ENG-012`.
- **Receipt generation** at capture completion via `ENG-007`; receipt numbers issue via `ENG-017` from the POS receipt numbering series registered in Sprint 001.
- **Reprint** of a previously issued receipt with **identity-preserving** semantics — same receipt number, same payload, distinguishable reprint audit event via `ENG-004`; enforced via `ENG-012`.
- **Payment reversal on returns handoff**: a reversal request originating from `SPR-MOD-015-004` (POS Return) transitions the referenced payment capture to a reversed state via `ENG-010`, records the reversal via `ENG-004`, and MUST NOT alter the identity of the original payment capture record.
- **Configuration resolution** for tender enablement, terminal endpoints, receipt template selection, and notification delivery policy read-only from POS configuration under the tenant/company hierarchy via `ENG-005`; POS configuration namespace was registered in Sprint 001 and is not redefined here.
- **Locale-scoped labels** on payment and receipt surfaces via `ENG-006` where applicable.
- **Authorization** on all payment and receipt actions via `ENG-002`, evaluated against permissions registered under `ENG-003` (Sprint 001) and ADR-032.
- **Audit** emission via `ENG-004` for every payment lifecycle transition, every terminal-authorization interaction, every receipt issuance, every reprint, and every payment reversal.
- **Structural and business-rule validation** via `ENG-012`: required fields, referential integrity, uniqueness, tender-sum equals POS Sale payable amount, terminal-outcome consistency, reprint identity preservation, reversal-references-valid-capture consistency, currency scale via `ENG-018`.
- **Eventing** — this sprint does not originate a new POS domain event. `POSSaleCompleted` remains owned by `SPR-MOD-015-002`. `ENG-024` is consumed only where a payment lifecycle transition is signaled via an internal, POS-scoped envelope routed through the authoritative event catalog; no new externally-published event is introduced here.

### 1.3 Out of Scope

- Store, Counter, POS operations configuration, and numbering-series registration — `SPR-MOD-015-001`.
- Cart composition, pricing evaluation, discount evaluation, supervisor-override rule, offline sale capture, POS Sale lifecycle and commit, and `POSSaleCompleted` publication — `SPR-MOD-015-002`.
- Offer master; Loyalty Program master; gift cards; POS Return transaction; return-window rule; `OfferPublished` consumption; `POSReturnProcessed` publication — `SPR-MOD-015-004`. This sprint accepts a reversal request originated by `SPR-MOD-015-004` on the payment capture record but does not author the POS Return transaction.
- Cash Deposit and Day Close transactions; mismatched-cash approval rule; operational POS reports and dashboards; bulk exports; `POSDayClosed` publication; `InventoryLowStock` consumption; audit-readiness surface; POS read model — `SPR-MOD-015-005`.
- Financial postings for payments and receipts — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting, triggered by events published in adjacent sprints.
- Item, price list, and stock master authoring — owned by MOD-005 Inventory.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-015-003`, the following will exist:

- **Business capabilities.**
  - A Cashier can capture one or more payment tenders (cash, card, digital, mixed) against a committed POS Sale such that the tender sum equals the POS Sale payable amount within currency scale via `ENG-018`.
  - The payment lifecycle transitions deterministically via `ENG-010` from initiated → tendered → authorized → captured; a reversal path exists from captured → reversed on returns handoff.
  - Payment terminal interactions are routed exclusively through `ENG-023`; terminal-authorization outcomes are recorded, audited, and validated.
  - A receipt is generated at capture completion via `ENG-007`, numbered via `ENG-017`.
  - A previously issued receipt can be reprinted with identity-preserving semantics; reprint events are audited via `ENG-004`.
  - Where configured, receipt notifications are dispatched via `ENG-025`.
- **Domain events.** None originated by this sprint. Publication of `POSSaleCompleted` remains owned by `SPR-MOD-015-002` and is not republished here. `ENG-024` is consumed for POS-internal lifecycle signaling only, subject to the authoritative event catalog.
- **Audit artifacts.** An audit record exists for every payment lifecycle transition, every terminal-authorization interaction, every receipt issuance, every reprint, and every payment reversal, produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-015-003`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-015 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — *Multi-tender payments*; *Receipts and reprints*; submodule **Payments** | Multi-tender capture, receipt issuance, reprint (§1.2) |
| §4 Business Processes — *Payment authorization* | Payment lifecycle via `ENG-010` and terminal integration via `ENG-023` (§1.2, §5) |
| §8 Integration Points — External Systems — *Payment terminals* | Terminal integration routed through `ENG-023` (§1.1.3, §5.3) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved POS Module PRD.**

### 3.1 Capability Allocation Compliance

Per the Module PRD Capability Allocation Matrix in [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) §4.1, the following §2 capabilities are originating-allocated to `SPR-MOD-015-003` and to no other sprint:

| Module PRD §2 Capability | Origin Sprint |
| --- | --- |
| Multi-tender payments | `SPR-MOD-015-003` |
| Receipts and reprints | `SPR-MOD-015-003` |

Per Sprint Plan §4.2, the **Payments** submodule is originating-allocated to `SPR-MOD-015-003`. These originating allocations are unique; no other POS sprint claims them.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Multi-tender payments* and *Receipts and reprints*, §2 submodule *Payments*, §4 process *Payment authorization*, and §8 external system *Payment terminals* → this Sprint PRD → deliverables in §2 (multi-tender capture, payment lifecycle, terminal integration, receipt issuance, reprint, reversal on returns handoff, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Cashier, I want to capture one or more payment tenders (cash, card, digital, or a mix) against a committed POS Sale such that the tender sum equals the sale's payable amount, so that a customer can pay by any accepted combination.*
- **US-002.** *As a Cashier, I want the payment lifecycle to progress deterministically (initiated → tendered → authorized → captured) via `ENG-010`, so that partial or failed tender attempts do not leave the sale in an ambiguous payment state.*
- **US-003.** *As a Cashier processing a card or digital payment, I want the payment terminal interaction to route exclusively through `ENG-023` and the authorization outcome to be recorded against the payment capture, so that terminal responses are attributable and auditable.*
- **US-004.** *As a Cashier, I want a receipt to be generated at capture completion via `ENG-007` with a receipt number issued via `ENG-017`, so that a customer receives a durably identified proof of payment.*
- **US-005.** *As a Cashier, I want to reprint a previously issued receipt with identity-preserving semantics — same receipt number, same payload, distinguishable audit entry — so that reprints cannot be mistaken for original issuances.*
- **US-006.** *As a downstream Returns operator (`SPR-MOD-015-004`), I want to reverse a captured payment on returns handoff so that the reversal is recorded against the original capture, audited via `ENG-004`, and validated for consistency without altering the original capture's identity.*
- **US-007.** *As a customer, where receipt notification is configured, I want the receipt to be dispatched via `ENG-025`, so that I receive a delivery of the receipt through the configured channel.*
- **US-008.** *As a security reviewer, I want every payment lifecycle transition, every terminal-authorization interaction, every receipt issuance, every reprint, and every reversal to be audited via `ENG-004`, so that I can reconstruct payment history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Multi-tender capture (US-001)

- **Given** an authenticated Cashier and a committed POS Sale with a defined payable amount,
  **when** one or more tenders (cash, card, digital, mixed) are captured,
  **then** the tender sum equals the payable amount within currency scale via `ENG-018`, tender-set validation runs deterministically via `ENG-012`, and each tender is audited via `ENG-004`.
- **Given** a tender set whose sum does not equal the payable amount within currency scale,
  **when** submitted,
  **then** the capture is rejected deterministically via `ENG-012` before any lifecycle progression.

### 5.2 Payment lifecycle (US-002)

- **Given** a payment capture record referencing a committed POS Sale,
  **when** lifecycle events occur (initiated → tendered → authorized → captured),
  **then** transitions are orchestrated via `ENG-010`, each transition is audited via `ENG-004`, and no transition may bypass `ENG-012` validation.

### 5.3 Payment terminal integration (US-003)

- **Given** a card or digital tender requiring terminal authorization,
  **when** authorization is requested,
  **then** the request routes exclusively through `ENG-023`, the terminal outcome (approved / declined / referred / reversed) is recorded against the payment capture, validated via `ENG-012`, and audited via `ENG-004`.
- **Given** any code path attempting to reach a payment terminal outside `ENG-023`,
  **when** invoked,
  **then** it is rejected — terminal integration through `ENG-023` is exclusive.

### 5.4 Receipt generation (US-004)

- **Given** a payment capture that has reached the captured state,
  **when** receipt generation runs,
  **then** the receipt is produced via `ENG-007`, its receipt number is issued via `ENG-017` from the POS receipt numbering series registered in Sprint 001, and the issuance is audited via `ENG-004`.

### 5.5 Reprint with identity preservation (US-005)

- **Given** a previously issued receipt,
  **when** a reprint is requested,
  **then** the reprint reproduces the original receipt number and payload without alteration, does not allocate a new receipt number via `ENG-017`, and emits a distinguishable reprint audit event via `ENG-004`; identity preservation is enforced deterministically via `ENG-012`.

### 5.6 Payment reversal on returns handoff (US-006)

- **Given** a captured payment record and a reversal request originated by `SPR-MOD-015-004` on returns handoff,
  **when** reversal executes,
  **then** the referenced payment capture transitions to a reversed state via `ENG-010`, the reversal is validated via `ENG-012` against the referenced capture, and the reversal is audited via `ENG-004`; the original capture identity is preserved and MUST NOT be altered.

### 5.7 Receipt notification (US-007)

- **Given** a configured receipt-notification delivery policy resolved via `ENG-005`,
  **when** a receipt is issued or reprinted,
  **then** the delivery is dispatched via `ENG-025` according to the configured channel and the dispatch is audited via `ENG-004`.

### 5.8 Audit integration (US-008)

- **Given** any payment lifecycle transition, terminal-authorization interaction, receipt issuance, reprint, or reversal,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, Counter and Store references, POS Sale identifier, payment capture identifier (where applicable), receipt number (where applicable), event type, and timestamp.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any payment / receipt read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.10 Authorization invariants (`ADR-032`)

- **Given** any payment / receipt action (initiate, tender, authorize, capture, issue receipt, reprint, reverse, notify),
  **when** it executes,
  **then** it is authorized via `ENG-002` against permissions registered by `ENG-003` under the RBAC + ABAC model; unauthorized actions are rejected before any state change.

### 5.11 Ownership consumption invariants

- **Given** any payment or receipt path,
  **when** ledger effects are required,
  **then** MOD-002 Accounting is triggered exclusively through events published in adjacent sprints; no POS code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.
- **Given** any actor identity resolution for payment or receipt actions,
  **when** performed,
  **then** it is read-only via `ENG-001`; the Identity entity is not redefined here.
- **Given** any consumption of Store, Counter, POS operations configuration, or receipt numbering series,
  **when** performed,
  **then** it is read-only from the authoritative POS surfaces delivered by `SPR-MOD-015-001`; those masters are not redefined here.
- **Given** the POS Sale referenced by a payment capture,
  **when** payment or reversal actions execute,
  **then** the POS Sale identifier and lifecycle owned by `SPR-MOD-015-002` are consumed read-only and are not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-015` — POS.
- **Module PRD:** [`docs/20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Multi-tender payments; Receipts and reprints; submodule Payments), §4 (Payment authorization), §8 (External Systems — Payment terminals), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-015` MODULE_PRD.
- **Upstream sprints:**
  - [`SPR-MOD-015-001`](./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md) — provides Store / Counter masters, POS operations configuration (denominations, rounding, discount limits per role, offline mode policy), and numbering-series registration (including the POS receipt numbering series).
  - [`SPR-MOD-015-002`](./SPR-MOD-015-002-cart-pricing-discounts-and-offline-sale.md) — provides the committed POS Sale that payment capture references and the `POSSaleCompleted` publication that MOD-002 posting-rule bindings consume.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (consumed indirectly via events published in adjacent sprints; not invoked from this sprint).
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — Item, price list, and stock master (not consumed on the payment path).
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-015-001`, `SPR-MOD-015-002`.
- **Downstream sprints:** `SPR-MOD-015-004` (Offers, Loyalty & Returns — originates payment reversal requests on returns handoff), `SPR-MOD-015-005` (Day Close, Analytics & Compliance — consumes payment and receipt read models) — per [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.1 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the POS Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every payment / receipt action. |
| `ENG-004` Audit | Records every payment lifecycle transition, every terminal-authorization interaction, every receipt issuance, every reprint, and every reversal. |
| `ENG-005` Configuration | Resolves tender enablement, terminal endpoints, receipt template selection, and notification delivery policy read-only under the tenant/company hierarchy; namespace registered in Sprint 001. |
| `ENG-006` Localization | Resolves locale-scoped labels on payment and receipt surfaces where applicable. |
| `ENG-007` Document | Generates the receipt document at capture completion and reproduces the identity-preserving reprint. |
| `ENG-010` Workflow | Orchestrates the payment lifecycle (initiated → tendered → authorized → captured; captured → reversed on returns handoff). |
| `ENG-012` Rules | Enforces tender-sum equality, tender-set validity, terminal-outcome consistency, reprint identity preservation, and reversal-references-valid-capture consistency. |
| `ENG-017` Numbering | Allocates receipt numbers from the POS receipt numbering series registered in Sprint 001. |
| `ENG-018` Currency | Applies currency scale and rounding to tender totals and receipt totals. |
| `ENG-023` Integration | Routes payment terminal interactions exclusively; POS bypass is prohibited. |
| `ENG-024` Eventing | Consumed for POS-internal payment-lifecycle signaling only; no new externally-published POS event is originated here. |
| `ENG-025` Notification | Dispatches receipt notifications where configured. |

POS business semantics (payment capture, payment lifecycle on the POS Sale side, receipt issuance and reprint, reversal on returns handoff) are owned by this module and are not delegated to any engine.

`ENG-015` Voucher and `ENG-016` Posting are declared as Required by the Module PRD §12 but are **not** consumed by this sprint per Sprint Plan §2 (`SPR-MOD-015-003`) — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by events published in adjacent sprints.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every payment / receipt read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every payment / receipt action. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Payment Capture | MOD-015 (this sprint) | Working entity representing the payment authorization against a committed POS Sale; carries payment lifecycle state and references the terminal-authorization outcome where applicable. |
| Tender Line | MOD-015 (this sprint) | Individual tender (cash, card, digital) contributing to a Payment Capture; sum of Tender Lines equals the POS Sale payable amount within currency scale. |
| Terminal Authorization Outcome | MOD-015 (this sprint) | Recorded outcome (approved / declined / referred / reversed) of a payment terminal interaction routed through `ENG-023`; attached to the Payment Capture. |
| Receipt | MOD-015 (this sprint) | Document generated via `ENG-007` at capture completion; carries a receipt number issued via `ENG-017` and is subject to identity-preserving reprint. |
| Receipt Reprint Event | MOD-015 (this sprint) | Audit-only artifact via `ENG-004` recording a reprint of an existing Receipt; MUST NOT alter Receipt identity or payload. |
| Payment Reversal | MOD-015 (this sprint) | Lifecycle transition against a Payment Capture originated by a returns handoff from `SPR-MOD-015-004`; validated via `ENG-012` and audited via `ENG-004`. |

### 10.2 Relationships

- A **Payment Capture** references exactly one **POS Sale** (owned by `SPR-MOD-015-002`) within the tenant/company scope; scoping is enforced deterministically via `ENG-012`.
- A **Payment Capture** has one or more **Tender Lines**; the sum of Tender Lines equals the POS Sale payable amount within currency scale via `ENG-018`.
- A **Payment Capture** has zero or one **Terminal Authorization Outcome** per card/digital tender; outcomes are recorded through `ENG-023`.
- A **Receipt** references exactly one **Payment Capture** and carries a unique **receipt number** within the tenant/company scope; reprint MUST NOT allocate a new receipt number.
- A **Payment Reversal** references exactly one **Payment Capture**; reversal identity is separate from capture identity, but capture identity is preserved.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-015` per the POS Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a POS-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as POS-owned entities.
- The **Item**, **Price List**, and **Stock** entities are owned by MOD-005 Inventory; they are not POS-owned entities and are not consumed on the payment path.
- The **Store**, **Counter**, **POS Configuration**, and **POS Numbering Series** entities are owned by MOD-015 but authored by `SPR-MOD-015-001`; they are consumed read-only here.
- The **Cart** and **POS Sale** entities are owned by MOD-015 but authored by `SPR-MOD-015-002`; they are consumed read-only here.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

None originated by this sprint. Per Sprint Plan §2 (`SPR-MOD-015-003`), no domain event is originated here. `POSSaleCompleted` remains owned by `SPR-MOD-015-002` and is not republished. Any POS-internal payment-lifecycle signaling routed through `ENG-024` is confined to the POS bounded context and does not introduce a new externally-published event.

### 11.2 Consumed

None from the authoritative event catalog in this sprint. `OfferPublished` consumption is scoped to `SPR-MOD-015-004`, and `InventoryLowStock` consumption is scoped to `SPR-MOD-015-005`; neither occurs here. Reversal requests from `SPR-MOD-015-004` are POS-internal invocations, not authoritative catalog events.

Payload contracts for POS events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every payment / receipt read and write.
- [ ] Every payment lifecycle transition, every terminal-authorization interaction, every receipt issuance, every reprint, and every reversal produces an audit record via `ENG-004`.
- [ ] Multi-tender capture enforces tender-sum equality to the POS Sale payable amount within currency scale via `ENG-018`, validated via `ENG-012`.
- [ ] Payment lifecycle is orchestrated via `ENG-010`.
- [ ] Payment terminal integration is routed exclusively through `ENG-023`; no POS code path bypasses it.
- [ ] Receipts are generated via `ENG-007`; receipt numbers issue via `ENG-017` from the POS receipt numbering series registered in Sprint 001.
- [ ] Reprints preserve the identity (number and payload) of the original receipt; a distinguishable reprint audit event is produced via `ENG-004`.
- [ ] Payment reversal on returns handoff is orchestrated via `ENG-010`, validated via `ENG-012`, and audited via `ENG-004`; original capture identity is preserved.
- [ ] Receipt notifications, where configured, are dispatched via `ENG-025`.
- [ ] No POS code path writes to `ENG-015` Voucher or `ENG-016` Posting.
- [ ] No new externally-published POS domain event is introduced by this sprint.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-015_SPRINT_PLAN.md` §2 (`SPR-MOD-015-003`):

- Multi-tender payments are captured on POS Sale with deterministic tender validation via `ENG-012`.
- Payment terminal integration is routed through `ENG-023`.
- Receipts are generated via `ENG-007`; reprints preserve identity of the original receipt and are audited via `ENG-004`.
- Notification of receipt (e.g., email/SMS) is dispatched via `ENG-025` where configured.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-015 Sprint 3 depends on `SPR-MOD-015-001` deliverables (numbering series, POS configuration namespace) and `SPR-MOD-015-002` deliverables (committed POS Sale, `POSSaleCompleted` publication) remaining stable through this sprint.
  - **Impact:** Any regression against Sprint 001 or Sprint 002 outputs would block payment capture, receipt numbering, or downstream posting.
  - **Mitigation:** Consume upstream outputs read-only per their authoritative surfaces; escalate any drift as an upstream defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Payment terminal integration relies on `ENG-023` Integration behaving per its authoritative contract.
  - **Impact:** Any drift would compromise terminal-outcome attribution and auditability.
  - **Mitigation:** Consume `ENG-023` per its authoritative contract; escalate any deviation as an engine defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Currency scaling and rounding on tender totals rely on `ENG-018` Currency behaving per its authoritative contract.
  - **Impact:** Any drift would produce non-deterministic tender-sum equality outcomes.
  - **Mitigation:** Consume `ENG-018` per its authoritative contract; escalate any deviation as an engine defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Reprint identity preservation depends on `ENG-007` Document and `ENG-004` Audit distinguishing reprint events from original issuances without altering the underlying document identity.
  - **Impact:** Any drift would allow reprints to be mistaken for original issuances or vice versa.
  - **Mitigation:** Enforce identity preservation deterministically via `ENG-012`; audit reprint events distinctly via `ENG-004`.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Payment reversal is originated by `SPR-MOD-015-004` on returns handoff. This sprint accepts the reversal on the payment capture record but does not author the return; boundary drift could smuggle POS Return authoring into this sprint.
  - **Impact:** Boundary violation would breach the §1.3 out-of-scope list and dilute the Payment Authorization slice.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to `SPR-MOD-015-004` or later sprints.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — tender-set validation and sum equality; payment lifecycle transitions; reprint identity preservation; reversal validation against referenced capture.
- **Integration** — authorization via `ENG-002`, audit emission via `ENG-004`, configuration resolution via `ENG-005`, localization via `ENG-006`, document generation via `ENG-007`, workflow orchestration via `ENG-010`, rules evaluation via `ENG-012`, numbering allocation via `ENG-017`, currency via `ENG-018`, integration routing via `ENG-023`, POS-internal eventing via `ENG-024`, notification via `ENG-025`.
- **Contract** — payment terminal integration contract as governed by `ENG-023`; receipt notification contract as governed by `ENG-025`.
- **End-to-end (smoke)** — committed POS Sale → multi-tender capture (cash + card mixed) → terminal authorization via `ENG-023` → capture → receipt issuance → reprint (identity-preserving) → configured notification dispatch → reversal on returns handoff, with audit records at each step; a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a payment terminal simulator wired through `ENG-023`; a receipt template fixture bound to `ENG-007`; a notification-delivery-policy fixture bound to `ENG-005` and `ENG-025`.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the payment lifecycle as an explicit `ENG-010` state machine (initiated → tendered → authorized → captured; captured → reversed) so audit emission (§5.8) is trivially satisfiable at every transition.
- Consider centralizing terminal interactions in a single `ENG-023`-bound adapter so all outcome recording, retry semantics, and audit emission flow through one instrumented path.
- Consider computing tender-sum equality once per capture attempt with `ENG-018` scale applied, and treating the resulting equality flag as the sole precondition for lifecycle progression from tendered to authorized.
- Consider treating reprint as a strictly read-and-render path against the original Receipt payload, with `ENG-017` explicitly not invoked, so identity preservation is enforced by construction.
- Consider recording the returns-handoff reversal envelope with a stable reference to the origin (`SPR-MOD-015-004` POS Return) so downstream Day-Close reconciliation can attribute reversed captures without traversing external systems.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-015-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Payment Authorization slice — multi-tender capture, payment lifecycle on POS Sale, payment terminal integration, receipt issuance and identity-preserving reprint, payment reversal on returns handoff, and configured receipt notification (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-015 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the POS Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters, cart / POS Sale authoring, offers/loyalty/returns, day close/analytics, MOD-002-owned ledger postings, MOD-005-owned Item/price-list/stock, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-015-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-015-004` Offers, Loyalty & Returns is the immediate successor per [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-015-001`, `SPR-MOD-015-002`, and `SPR-MOD-015-003`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md`](./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md), [`./SPR-MOD-015-002-cart-pricing-discounts-and-offline-sale.md`](./SPR-MOD-015-002-cart-pricing-discounts-and-offline-sale.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
