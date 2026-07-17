---
title: "SPR-MOD-015-004 — Offers, Loyalty & Returns"
summary: "Sprint PRD for the Offers, Loyalty, and Returns slice of MOD-015 POS: Offer and Loyalty Program master data; gift-card handling; POS Return transaction lifecycle; return-window rule; consumption of `OfferPublished`; publication of `POSReturnProcessed`. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Revenue"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-015-004"
parent_module: "MOD-015"
parent_sprint_plan: "MOD-015_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "17.0.4"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-023", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "pos", "mod-015", "offers", "loyalty", "returns", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD015-004-20260717T020000Z-001"
parent_result_id: "GT003-MOD015-003-20260717T010000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-015-004 — Offers, Loyalty & Returns

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-015 POS** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-015-004` (permanent) |
| Parent Module | `MOD-015` — POS |
| Parent Sprint Plan | [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-015-001`](./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md), [`SPR-MOD-015-002`](./SPR-MOD-015-002-cart-pricing-discounts-and-offline-sale.md), [`SPR-MOD-015-003`](./SPR-MOD-015-003-multi-tender-payments-and-receipts.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-015-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Offers, Loyalty, and Returns** slice of MOD-015 POS: **Offer** and **Loyalty Program** master data; **gift-card** issuance and redemption via offers/loyalty surfaces; the **POS Return** transaction lifecycle; the **return-must-reference-valid-sale-within-window** rule; consumption of the authoritative `OfferPublished` event; and publication of `POSReturnProcessed`. Reversal of the underlying payment capture on returns handoff is invoked against `SPR-MOD-015-003` and MUST NOT be redefined here. This sprint does not deliver foundation masters, sale capture, payment authorization or receipts, day close, or ledger posting.

> **POS Ownership Convention (recapitulated, not evolved).** POS owns the business semantics of Offer master, Loyalty Program master, gift-card handling on POS transactions, the POS Return transaction, and the return-window rule. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, document, workflow, approval, rules, numbering, integration, eventing, notification) but **MUST NOT** redefine POS business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects of returns remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines — no POS sprint writes journal entries directly; MOD-002 consumes `POSReturnProcessed` and its downstream posting-rule bindings. Item, price list, and stock master remain exclusive to **MOD-005 Inventory** and are consumed read-only.

#### 1.1.1 Offer & Loyalty Program Master Authority

The **Offer** master entity and the **Loyalty Program** master entity are authoritatively owned by MOD-015 POS in this sprint. No other module MAY define a parallel Offer or Loyalty Program master for POS. Offer and Loyalty Program records are created, edited, and archived under the tenant/company hierarchy, configuration is resolved via `ENG-005`, document numbers issue via `ENG-017`, state transitions are orchestrated via `ENG-010`, and every state change is audited via `ENG-004`. Gift cards are issued and redeemed through the Offer / Loyalty Program surfaces defined here; a stand-alone gift-card master is not introduced.

#### 1.1.2 POS Return Transaction & Return-Window Authority

The **POS Return** transaction lifecycle and the **return-must-reference-valid-sale-within-window** rule are authoritatively owned by MOD-015 POS in this sprint. Every POS Return MUST reference a valid POS Sale (owned by `SPR-MOD-015-002`) within the configured return window (resolved via `ENG-005`), enforced deterministically via `ENG-012`. The POS Return lifecycle is orchestrated via `ENG-010`; where the return exceeds a configured threshold or violates a policy predicate, approval is enforced via `ENG-011`. Payment reversal on the referenced payment capture is invoked against `SPR-MOD-015-003` — the reversal is owned by Sprint 003 and MUST NOT be re-authored here.

#### 1.1.3 `OfferPublished` Consumption & `POSReturnProcessed` Publication Authority

**Consumption** of the authoritative `OfferPublished` event (activating offers at counters) and **publication** of `POSReturnProcessed` on POS Return completion are authoritatively owned by MOD-015 POS in this sprint. Both flow through the authoritative event catalog and `ENG-024` Eventing. `POSReturnProcessed` is the sole domain event originated by this sprint; it MUST NOT be re-published from any other POS sprint. Loyalty-platform interactions (accrual, redemption, balance sync) are routed exclusively through `ENG-023` Integration.

#### 1.1.4 POS ↔ Platform, Accounting, Inventory, and Analytics Boundary (recapitulated)

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. POS consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting. Ledger effects of POS Returns are produced by MOD-002 posting-rule bindings triggered by `POSReturnProcessed`; no POS code path in this sprint writes journal entries or invokes `ENG-015` / `ENG-016` directly.
- **MOD-005 Inventory** owns Item, price list, and stock master data. This sprint references items on POS Return lines read-only via the Sprint 002 sale reference; MOD-005 subscribes to `POSReturnProcessed` for stock adjustment.
- **MOD-017 Analytics** owns cross-module KPI definitions. Cross-module KPIs are never redefined by MOD-015.

Ownership boundaries SHALL NOT be redefined in downstream POS Sprint PRDs.

### 1.2 In Scope

- **Offer master** — create, edit, archive Offer records under the tenant/company hierarchy; numbering via `ENG-017`; configuration resolution via `ENG-005`; lifecycle via `ENG-010`; audit via `ENG-004`.
- **Loyalty Program master** — create, edit, archive Loyalty Program records under the tenant/company hierarchy; numbering via `ENG-017`; configuration resolution via `ENG-005`; lifecycle via `ENG-010`; audit via `ENG-004`.
- **Gift-card handling** — issuance and redemption expressed as behaviors on the Offer / Loyalty Program surfaces; validated via `ENG-012`; audited via `ENG-004`.
- **POS Return transaction lifecycle** — initiated → validated → approved (where applicable) → processed, orchestrated via `ENG-010`; approvals via `ENG-011`; document numbers via `ENG-017`; audit via `ENG-004`.
- **Return-must-reference-valid-sale-within-window rule** — enforced deterministically via `ENG-012`; the return window is resolved read-only via `ENG-005` under the tenant/company hierarchy.
- **`OfferPublished` consumption** — activates the referenced Offer at eligible counters within the tenant scope; consumed via `ENG-024`; validated via `ENG-012`; audited via `ENG-004`.
- **`POSReturnProcessed` publication** — emitted on POS Return completion via `ENG-024`; envelope and naming per the authoritative event catalog; the event is originated by this sprint and by no other POS sprint.
- **Loyalty-platform integration** — routed exclusively through `ENG-023`; outcomes recorded, validated via `ENG-012`, audited via `ENG-004`.
- **Payment reversal handoff to Sprint 003** — origination of a reversal request against the payment capture referenced by the original POS Sale; the reversal itself is executed and audited by `SPR-MOD-015-003` and is not re-authored here.
- **Configuration resolution** for offer/loyalty policy, gift-card policy, return-window, and approval thresholds — read-only from POS configuration under the tenant/company hierarchy via `ENG-005`; namespace was registered in Sprint 001 and is not redefined here.
- **Authorization** on all offer, loyalty, gift-card, and return actions via `ENG-002`, evaluated against permissions registered under `ENG-003` (Sprint 001) and ADR-032.
- **Audit** emission via `ENG-004` for every Offer / Loyalty Program lifecycle transition, every gift-card issuance and redemption, every POS Return lifecycle transition and approval, every `OfferPublished` consumption, every `POSReturnProcessed` publication, and every loyalty-platform interaction.
- **Structural and business-rule validation** via `ENG-012`: required fields, referential integrity, uniqueness, valid-sale-and-window reference on POS Return, gift-card balance non-negativity, loyalty-outcome consistency, event-envelope conformance.
- **Notification** dispatch via `ENG-025` where a return / offer / loyalty notification policy is configured.
- **Documents** — printable return acknowledgement and loyalty / offer artifacts generated via `ENG-007` where applicable.

### 1.3 Out of Scope

- Store, Counter, POS operations configuration, and numbering-series registration — `SPR-MOD-015-001`.
- Cart composition, pricing evaluation, discount evaluation, supervisor-override rule, offline sale capture, POS Sale lifecycle and commit, and `POSSaleCompleted` publication — `SPR-MOD-015-002`.
- Multi-tender payment capture, payment lifecycle on POS Sale, payment terminal integration, receipt generation and reprint, and the payment-reversal execution on returns handoff — `SPR-MOD-015-003`. This sprint originates the reversal request but does not execute or re-author it.
- Cash Deposit and Day Close transactions; mismatched-cash approval rule; operational POS reports and dashboards; bulk exports; `POSDayClosed` publication; `InventoryLowStock` consumption; audit-readiness surface; POS read model — `SPR-MOD-015-005`.
- Financial postings for POS Returns — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting, triggered by `POSReturnProcessed`.
- Item, price list, and stock master authoring — owned by MOD-005 Inventory.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-015-004`, the following will exist:

- **Business capabilities.**
  - A Merchandising / Loyalty Manager can create, edit, and archive Offer and Loyalty Program records under the tenant/company hierarchy.
  - Gift cards can be issued and redeemed through the Offer / Loyalty Program surfaces.
  - A Cashier / Returns Operator can initiate a POS Return that references a valid POS Sale within the configured return window; the return progresses deterministically via `ENG-010`, requires approval via `ENG-011` where configured, and is audited via `ENG-004`.
  - `OfferPublished` events activate the referenced Offer at eligible counters within the tenant scope.
  - `POSReturnProcessed` is published on POS Return completion.
  - Loyalty-platform interactions are routed exclusively through `ENG-023`.
  - Where configured, offer / loyalty / return notifications are dispatched via `ENG-025`.
- **Domain events.** `POSReturnProcessed` — originated by this sprint. `OfferPublished` — consumed by this sprint. Envelopes and naming per the authoritative event catalog.
- **Audit artifacts.** An audit record exists for every Offer / Loyalty Program lifecycle transition, every gift-card issuance and redemption, every POS Return lifecycle transition and approval, every `OfferPublished` consumption, every `POSReturnProcessed` publication, every loyalty-platform interaction, and every notification dispatch, produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-015-004`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-015 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — *Loyalty and gift cards*; submodules **Offers**, **Loyalty** | Offer and Loyalty Program master; gift-card handling (§1.2) |
| §4 Business Processes — *Return-to-refund* | POS Return lifecycle via `ENG-010` / `ENG-011` and reversal handoff to Sprint 003 (§1.2, §5) |
| §5 Master Data — *Offer*, *Loyalty Program* | Offer and Loyalty Program master (§1.1.1, §1.2, §10) |
| §6 Transactions — *POS Return* | POS Return transaction (§1.1.2, §1.2, §10) |
| §7 Business Rules — *return-must-reference-valid-sale-within-window* | Return-window rule enforced via `ENG-012` (§1.1.2, §5) |
| §8 Integration Points — *`OfferPublished`* (consumed); *`POSReturnProcessed`* (published); External Systems — *Loyalty platforms* | `OfferPublished` consumption; `POSReturnProcessed` publication; loyalty-platform integration via `ENG-023` (§1.1.3, §1.2, §11) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved POS Module PRD.**

### 3.1 Capability Allocation Compliance

Per the Module PRD Capability Allocation Matrix in [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) §4.1, the following §2 capability is originating-allocated to `SPR-MOD-015-004` and to no other sprint:

| Module PRD §2 Capability | Origin Sprint |
| --- | --- |
| Loyalty and gift cards | `SPR-MOD-015-004` |

Per Sprint Plan §4.2, the **Offers** and **Loyalty** submodules are originating-allocated to `SPR-MOD-015-004`. Per Sprint Plan §4.3, the **Offer** and **Loyalty Program** master-data entities and the **POS Return** transaction are originating-allocated to `SPR-MOD-015-004`. These originating allocations are unique; no other POS sprint claims them.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Loyalty and gift cards*, §2 submodules *Offers* and *Loyalty*, §4 process *Return-to-refund*, §5 masters *Offer* and *Loyalty Program*, §6 transaction *POS Return*, §7 rule *return-must-reference-valid-sale-within-window*, and §8 events `OfferPublished` (consumed) / `POSReturnProcessed` (published) / external *Loyalty platforms* → this Sprint PRD → deliverables in §2.
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Merchandising Manager, I want to create, edit, and archive Offer records under the tenant/company hierarchy so that promotional offers can be authored and governed centrally.*
- **US-002.** *As a Loyalty Manager, I want to create, edit, and archive Loyalty Program records under the tenant/company hierarchy so that loyalty programs can be authored and governed centrally.*
- **US-003.** *As a Cashier, I want to issue and redeem gift cards through the Offer / Loyalty Program surfaces so that gift-card handling operates within a single governed surface.*
- **US-004.** *As a Cashier, I want to initiate a POS Return that references a valid POS Sale within the configured return window, so that returns cannot bypass the return-window rule.*
- **US-005.** *As a Returns Supervisor, I want returns beyond a configured policy predicate to require approval via `ENG-011` before processing, so that policy exceptions are governed.*
- **US-006.** *As a Cashier processing a POS Return, I want the referenced payment capture to be reversed by the Sprint 003 payment surface so that the reversal is executed by its owner without duplication here.*
- **US-007.** *As a Counter Operator, I want an activated Offer (from `OfferPublished`) to become available for cart evaluation at eligible counters within my tenant scope, so that published offers propagate deterministically.*
- **US-008.** *As a downstream Accounting posting-rule (MOD-002), I want a `POSReturnProcessed` event on POS Return completion so that ledger effects can be produced by MOD-002 without POS invoking `ENG-015` / `ENG-016` directly.*
- **US-009.** *As a Loyalty operator, I want loyalty-platform interactions (accrual, redemption, balance sync) to be routed exclusively through `ENG-023`, so that external calls are attributable and auditable.*
- **US-010.** *As a security reviewer, I want every Offer / Loyalty Program lifecycle transition, gift-card issuance and redemption, POS Return lifecycle transition and approval, `OfferPublished` consumption, `POSReturnProcessed` publication, loyalty-platform interaction, and notification dispatch to be audited via `ENG-004`, so that I can reconstruct offer / loyalty / return history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Offer master (US-001)

- **Given** an authenticated Merchandising Manager,
  **when** an Offer record is created, edited, or archived under the tenant/company hierarchy,
  **then** the lifecycle transition is orchestrated via `ENG-010`, structural and referential validation runs via `ENG-012`, a document number is issued via `ENG-017`, and the transition is audited via `ENG-004`.

### 5.2 Loyalty Program master (US-002)

- **Given** an authenticated Loyalty Manager,
  **when** a Loyalty Program record is created, edited, or archived under the tenant/company hierarchy,
  **then** the lifecycle transition is orchestrated via `ENG-010`, structural and referential validation runs via `ENG-012`, a document number is issued via `ENG-017`, and the transition is audited via `ENG-004`.

### 5.3 Gift-card handling (US-003)

- **Given** an active Offer or Loyalty Program that supports gift cards,
  **when** a gift card is issued or redeemed,
  **then** the operation is validated via `ENG-012` (including non-negative balance and referential integrity to the owning surface), the balance state transitions deterministically, and the operation is audited via `ENG-004`.

### 5.4 POS Return referencing a valid sale within the return window (US-004)

- **Given** an authenticated Cashier and a candidate POS Sale reference,
  **when** a POS Return is initiated,
  **then** `ENG-012` enforces that the referenced POS Sale exists, belongs to the caller's tenant scope, and lies within the configured return window resolved via `ENG-005`; a return that violates any of these conditions is rejected before any lifecycle progression.

### 5.5 POS Return lifecycle and approval (US-005)

- **Given** a POS Return that satisfies the reference-and-window rule,
  **when** the lifecycle progresses (initiated → validated → approved [where applicable] → processed),
  **then** transitions are orchestrated via `ENG-010`, approval is enforced via `ENG-011` where the return exceeds a configured threshold or policy predicate, each transition is audited via `ENG-004`, and no transition may bypass `ENG-012` validation.

### 5.6 Payment reversal handoff to Sprint 003 (US-006)

- **Given** a POS Return that has reached the processed state,
  **when** payment reversal is required,
  **then** a reversal request is originated against the payment capture referenced by the original POS Sale and is executed and audited by `SPR-MOD-015-003`; no POS code path in this sprint alters the payment capture or writes reversal audit entries.

### 5.7 `OfferPublished` consumption (US-007)

- **Given** an authoritative `OfferPublished` event delivered via `ENG-024`,
  **when** it is consumed,
  **then** the referenced Offer is activated for eligible counters within the tenant scope, envelope conformance is validated via `ENG-012`, and the consumption is audited via `ENG-004`.

### 5.8 `POSReturnProcessed` publication (US-008)

- **Given** a POS Return that has reached the processed state,
  **when** publication runs,
  **then** `POSReturnProcessed` is emitted via `ENG-024` with an envelope conforming to the authoritative event catalog, and the publication is audited via `ENG-004`.

### 5.9 Loyalty-platform integration (US-009)

- **Given** any loyalty-platform interaction (accrual, redemption, balance sync),
  **when** invoked,
  **then** the interaction routes exclusively through `ENG-023`, the outcome is recorded and validated via `ENG-012`, and the interaction is audited via `ENG-004`.
- **Given** any code path attempting to reach a loyalty platform outside `ENG-023`,
  **when** invoked,
  **then** it is rejected — loyalty-platform integration through `ENG-023` is exclusive.

### 5.10 Notification dispatch

- **Given** a configured offer / loyalty / return notification delivery policy resolved via `ENG-005`,
  **when** a triggering event occurs,
  **then** the delivery is dispatched via `ENG-025` according to the configured channel and the dispatch is audited via `ENG-004`.

### 5.11 Audit integration (US-010)

- **Given** any Offer / Loyalty Program lifecycle transition, gift-card issuance or redemption, POS Return lifecycle transition or approval, `OfferPublished` consumption, `POSReturnProcessed` publication, loyalty-platform interaction, or notification dispatch,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, Counter and Store references (where applicable), POS Sale identifier (where applicable), Offer / Loyalty Program / POS Return identifier (where applicable), event type, and timestamp.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any offer / loyalty / gift-card / return read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.13 Authorization invariants (`ADR-032`)

- **Given** any offer / loyalty / gift-card / return action,
  **when** it executes,
  **then** it is authorized via `ENG-002` against permissions registered by `ENG-003` under the RBAC + ABAC model; unauthorized actions are rejected before any state change.

### 5.14 Ownership consumption invariants

- **Given** any POS Return path,
  **when** ledger effects are required,
  **then** MOD-002 Accounting is triggered exclusively via `POSReturnProcessed`; no POS code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.
- **Given** any actor identity resolution for offer / loyalty / gift-card / return actions,
  **when** performed,
  **then** it is read-only via `ENG-001`; the Identity entity is not redefined here.
- **Given** any consumption of Store, Counter, POS operations configuration, or numbering series,
  **when** performed,
  **then** it is read-only from the authoritative POS surfaces delivered by `SPR-MOD-015-001`; those masters are not redefined here.
- **Given** any consumption of the POS Sale referenced by a POS Return,
  **when** performed,
  **then** the POS Sale identifier and lifecycle owned by `SPR-MOD-015-002` are consumed read-only and are not redefined here.
- **Given** any consumption of the payment capture referenced by a POS Return,
  **when** reversal is required,
  **then** the reversal execution owned by `SPR-MOD-015-003` is invoked and is not re-authored here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-015` — POS.
- **Module PRD:** [`docs/20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Loyalty and gift cards; submodules Offers, Loyalty), §4 (Return-to-refund), §5 (Offer, Loyalty Program), §6 (POS Return), §7 (return-window rule), §8 (`OfferPublished` consumed; `POSReturnProcessed` published; External Systems — Loyalty platforms), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-015` MODULE_PRD.
- **Upstream sprints:**
  - [`SPR-MOD-015-001`](./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md) — provides Store / Counter masters, POS operations configuration (including return-window), and numbering-series registration.
  - [`SPR-MOD-015-002`](./SPR-MOD-015-002-cart-pricing-discounts-and-offline-sale.md) — provides the committed POS Sale that POS Returns reference.
  - [`SPR-MOD-015-003`](./SPR-MOD-015-003-multi-tender-payments-and-receipts.md) — owns the payment reversal executed on returns handoff.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (consumed indirectly via `POSReturnProcessed`; not invoked from this sprint).
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — Item, price list, and stock master (consumed indirectly via `POSReturnProcessed` for stock adjustment).
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-015-001`, `SPR-MOD-015-002`, `SPR-MOD-015-003`.
- **Downstream sprints:** `SPR-MOD-015-005` (Day Close, Analytics & Compliance — consumes return and offer / loyalty read models) — per [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md).

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
| `ENG-002` Authorization | Enforces authorization on every offer / loyalty / gift-card / return action. |
| `ENG-004` Audit | Records every offer / loyalty / gift-card / return lifecycle transition, event consumption / publication, loyalty-platform interaction, and notification dispatch. |
| `ENG-005` Configuration | Resolves offer / loyalty / gift-card policy, return-window, approval thresholds, and notification delivery policy read-only under the tenant/company hierarchy; namespace registered in Sprint 001. |
| `ENG-007` Document | Generates return acknowledgements and offer / loyalty artifacts where applicable. |
| `ENG-010` Workflow | Orchestrates Offer, Loyalty Program, and POS Return lifecycles. |
| `ENG-011` Approval | Enforces approval on POS Returns exceeding a configured threshold or policy predicate. |
| `ENG-012` Rules | Enforces referential integrity, return-must-reference-valid-sale-within-window, gift-card balance non-negativity, loyalty-outcome consistency, and event-envelope conformance. |
| `ENG-017` Numbering | Allocates numbers for Offer, Loyalty Program, and POS Return documents from the series registered in Sprint 001. |
| `ENG-023` Integration | Routes loyalty-platform interactions exclusively; POS bypass is prohibited. |
| `ENG-024` Eventing | Consumes `OfferPublished`; publishes `POSReturnProcessed`. |
| `ENG-025` Notification | Dispatches offer / loyalty / return notifications where configured. |

POS business semantics (Offer master, Loyalty Program master, gift-card handling, POS Return transaction, return-window rule) are owned by this module and are not delegated to any engine.

`ENG-015` Voucher and `ENG-016` Posting are declared as Required by the Module PRD §12 but are **not** consumed by this sprint per Sprint Plan §2 (`SPR-MOD-015-004`) — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by `POSReturnProcessed`.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every offer / loyalty / gift-card / return read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every offer / loyalty / gift-card / return action. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Offer | MOD-015 (this sprint) | Master data representing a promotional offer under the tenant/company hierarchy; carries lifecycle state and policy binding. |
| Loyalty Program | MOD-015 (this sprint) | Master data representing a loyalty program under the tenant/company hierarchy; carries lifecycle state and policy binding. |
| Gift Card | MOD-015 (this sprint) | Balance-carrying artifact issued and redeemed through Offer / Loyalty Program surfaces; scoped to the tenant. |
| POS Return | MOD-015 (this sprint) | Transaction referencing exactly one valid POS Sale within the configured return window; carries lifecycle state and approval where required. |
| Offer Activation Record | MOD-015 (this sprint) | Consumption-side artifact recording activation of a referenced Offer at eligible counters upon `OfferPublished` intake. |
| Return Reversal Handoff | MOD-015 (this sprint) | Reference recording the reversal request originated against the Sprint 003 payment capture; the reversal execution itself is owned by Sprint 003. |

### 10.2 Relationships

- An **Offer** and a **Loyalty Program** each exist under exactly one tenant/company scope; scoping is enforced deterministically via `ENG-012`.
- A **Gift Card** references exactly one owning Offer or Loyalty Program within the tenant/company scope; balance is non-negative at every state.
- A **POS Return** references exactly one **POS Sale** (owned by `SPR-MOD-015-002`) within the tenant/company scope, and the reference MUST lie within the configured return window resolved via `ENG-005`.
- An **Offer Activation Record** references exactly one **Offer** and is created upon `OfferPublished` consumption.
- A **Return Reversal Handoff** references exactly one **POS Return** and one payment capture owned by `SPR-MOD-015-003`; the handoff does not carry payment lifecycle state itself.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-015` per the POS Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a POS-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as POS-owned entities.
- The **Item**, **Price List**, and **Stock** entities are owned by MOD-005 Inventory; they are not POS-owned entities. `POSReturnProcessed` triggers MOD-005 stock adjustment.
- The **Store**, **Counter**, **POS Configuration**, and **POS Numbering Series** entities are owned by MOD-015 but authored by `SPR-MOD-015-001`; they are consumed read-only here.
- The **Cart** and **POS Sale** entities are owned by MOD-015 but authored by `SPR-MOD-015-002`; they are consumed read-only here.
- The **Payment Capture**, **Receipt**, and **Payment Reversal** entities are owned by MOD-015 but authored by `SPR-MOD-015-003`; the reversal execution is invoked, not re-authored.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`POSReturnProcessed`** — originated by this sprint on POS Return completion. Envelope per the authoritative event catalog; MOD-002 Accounting posting-rule bindings and MOD-005 Inventory stock-adjustment subscribers consume it. This event MUST NOT be re-published from any other POS sprint.

### 11.2 Consumed

- **`OfferPublished`** — consumed via `ENG-024` to activate the referenced Offer at eligible counters within the tenant scope; envelope conformance validated via `ENG-012`; consumption audited via `ENG-004`.

Payload contracts for POS events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every offer / loyalty / gift-card / return read and write.
- [ ] Every Offer / Loyalty Program lifecycle transition, gift-card issuance and redemption, POS Return lifecycle transition and approval, `OfferPublished` consumption, `POSReturnProcessed` publication, loyalty-platform interaction, and notification dispatch produces an audit record via `ENG-004`.
- [ ] Every POS Return references a valid POS Sale within the configured return window, enforced deterministically via `ENG-012`.
- [ ] POS Return lifecycle is orchestrated via `ENG-010`; approvals are enforced via `ENG-011` where configured.
- [ ] `POSReturnProcessed` publishes via `ENG-024`; `OfferPublished` is consumed via `ENG-024`.
- [ ] Loyalty-platform integration is routed exclusively through `ENG-023`; no POS code path bypasses it.
- [ ] Document numbers for Offer, Loyalty Program, and POS Return issue via `ENG-017` from the series registered in Sprint 001.
- [ ] Notifications, where configured, are dispatched via `ENG-025`.
- [ ] Payment reversal on returns handoff is executed by `SPR-MOD-015-003`; this sprint originates the reversal request only.
- [ ] No POS code path writes to `ENG-015` Voucher or `ENG-016` Posting.
- [ ] `POSReturnProcessed` is the sole domain event originated by this sprint.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-015_SPRINT_PLAN.md` §2 (`SPR-MOD-015-004`):

- Offer and Loyalty Program records can be created, edited, and archived; gift cards are issued and redeemed through offers/loyalty surfaces.
- POS Return lifecycle is enforced via `ENG-010`/`ENG-011`; returns must reference a valid POS Sale within the configured return window, enforced via `ENG-012`.
- `OfferPublished` events are consumed to activate offers at counters; `POSReturnProcessed` events publish via `ENG-024`.
- Loyalty platform interactions are routed through `ENG-023`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-015 Sprint 4 depends on `SPR-MOD-015-001` (numbering series, POS configuration namespace, return-window configuration slot), `SPR-MOD-015-002` (committed POS Sale reference), and `SPR-MOD-015-003` (payment capture and reversal execution) remaining stable through this sprint.
  - **Impact:** Any regression against upstream sprint outputs would block Offer / Loyalty Program authoring, POS Return validation, or reversal handoff.
  - **Mitigation:** Consume upstream outputs read-only per their authoritative surfaces; escalate any drift as an upstream defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Loyalty-platform integration relies on `ENG-023` Integration behaving per its authoritative contract.
  - **Impact:** Any drift would compromise loyalty-outcome attribution and auditability.
  - **Mitigation:** Consume `ENG-023` per its authoritative contract; escalate any deviation as an engine defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** `OfferPublished` consumption and `POSReturnProcessed` publication rely on `ENG-024` Eventing and the authoritative event catalog envelopes remaining stable.
  - **Impact:** Any drift would compromise offer activation propagation or downstream posting/stock-adjustment triggers.
  - **Mitigation:** Consume `ENG-024` per its authoritative contract; validate envelope conformance via `ENG-012`; escalate any deviation as an engine or catalog defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** The return-must-reference-valid-sale-within-window rule depends on `ENG-005` Configuration and `ENG-012` Rules behaving per their authoritative contracts.
  - **Impact:** Any drift would allow returns that violate the return window to reach lifecycle progression.
  - **Mitigation:** Enforce the rule deterministically via `ENG-012` against a return window resolved via `ENG-005`; escalate any deviation as an engine defect.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Payment reversal execution is owned by `SPR-MOD-015-003`. Boundary drift could smuggle payment lifecycle authoring into this sprint.
  - **Impact:** Boundary violation would breach the §1.3 out-of-scope list and dilute the Offers/Loyalty/Returns slice.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to `SPR-MOD-015-003` or later sprints.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Offer / Loyalty Program lifecycle transitions; gift-card balance semantics; POS Return validation (reference-and-window); envelope conformance for `OfferPublished` and `POSReturnProcessed`.
- **Integration** — authorization via `ENG-002`, audit emission via `ENG-004`, configuration resolution via `ENG-005`, document generation via `ENG-007`, workflow orchestration via `ENG-010`, approval enforcement via `ENG-011`, rules evaluation via `ENG-012`, numbering allocation via `ENG-017`, integration routing via `ENG-023`, event publication / consumption via `ENG-024`, notification via `ENG-025`.
- **Contract** — loyalty-platform integration contract governed by `ENG-023`; event envelope contracts for `OfferPublished` (consumed) and `POSReturnProcessed` (published) governed by the event catalog and `ENG-024`.
- **End-to-end (smoke)** — Offer authoring → `OfferPublished` consumption → cart-eligible activation → POS Sale → POS Return within window → approval where required → `POSReturnProcessed` publication → reversal handoff to Sprint 003 → configured notification dispatch, with audit records at each step; a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a loyalty-platform simulator wired through `ENG-023`; a return-window configuration fixture bound to `ENG-005`; an event fixture emitting `OfferPublished` conforming to the authoritative catalog.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the POS Return lifecycle as an explicit `ENG-010` state machine (initiated → validated → approved → processed) so approval gating (§5.5) and event publication (§5.8) are wired at deterministic transitions.
- Consider centralizing loyalty-platform interactions in a single `ENG-023`-bound adapter so all outcome recording, retry semantics, and audit emission flow through one instrumented path.
- Consider computing the return-window predicate once per POS Return validation using the tenant-scoped configuration resolved via `ENG-005`, and treating the resulting eligibility flag as the sole precondition for lifecycle progression from initiated to validated.
- Consider treating gift-card balance updates as a single `ENG-012`-validated operation with non-negativity as an invariant, so no partial update can leave a card in an invalid state.
- Consider recording the reversal-handoff envelope with a stable reference to `SPR-MOD-015-003`'s payment capture identifier so downstream Day-Close reconciliation can attribute reversed captures without traversing external systems.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-015-004`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Offers, Loyalty, and Returns slice — Offer master, Loyalty Program master, gift-card handling, POS Return lifecycle, return-window rule, `OfferPublished` consumption, `POSReturnProcessed` publication, loyalty-platform integration, and configured notification dispatch (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-015 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the POS Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters, cart / POS Sale authoring, payments/receipts, day close/analytics, MOD-002-owned ledger postings, MOD-005-owned Item/price-list/stock, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-015-005`) begin immediately after this one completes?**
   Yes. `SPR-MOD-015-005` Day Close, Analytics & Compliance is the immediate successor per [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-015-001`, `SPR-MOD-015-002`, `SPR-MOD-015-003`, and `SPR-MOD-015-004`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md`](./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md), [`./SPR-MOD-015-002-cart-pricing-discounts-and-offline-sale.md`](./SPR-MOD-015-002-cart-pricing-discounts-and-offline-sale.md), [`./SPR-MOD-015-003-multi-tender-payments-and-receipts.md`](./SPR-MOD-015-003-multi-tender-payments-and-receipts.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
