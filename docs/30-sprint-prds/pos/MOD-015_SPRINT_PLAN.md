---
title: "MOD-015 POS — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-015 POS. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Revenue"
status: "Approved"
updated: "2026-07-16"
module_id: "MOD-015"
module_name: "POS"
sprint_prefix: "SPR-MOD-015-"
stage: "1"
pass: "17.0.0"
parent_module_prd: "docs/20-module-prds/pos/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
governance_specification: "v1.0"
template_standard: "v1.3"
authored_by_template: "GT-002"
execution_id: "GT002-MOD015-20260716T033000Z-001"
tags: ["sprint", "planning", "pos", "mod-015", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-015 POS — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-015 POS** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## Normative Source Precedence

On any conflict, the following order wins:

1. `docs/20-module-prds/pos/MODULE_PRD.md` (Module PRD)
2. This Capability Allocation Matrix (§4)
3. The sprint sections in §2 of this Sprint Plan
4. Any derived artifact

## 1. Purpose & Scope

Plan the implementation of MOD-015 POS by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD.

This plan introduces no new business requirements beyond the approved [MOD-015 POS Module PRD](../../20-module-prds/pos/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Governance Boundaries (recapitulated).** Per the Module PRD §13:

- **Identity, authentication, and permissions** are owned by **MOD-001 Platform Administration** via `ENG-001`, `ENG-002`, `ENG-003`.
- **Ledger effects** of POS sales, returns, cash deposits, and day close are produced via `ENG-015` Voucher and `ENG-016` Posting engines with posting-rule bindings owned by **MOD-002 Accounting**. MOD-015 does not implement double-entry posting logic itself.
- **Item, price list, and stock master data** are consumed read-only from **MOD-005 Inventory**; POS sales publish events that MOD-005 subscribes to for stock adjustment.
- **Cross-module KPI definitions** are owned by **MOD-017 Analytics**. Operational POS reports are surfaced within MOD-015.

**Traceability:**

- Parent Module README — [`../../20-module-prds/pos/README.md`](../../20-module-prds/pos/README.md)
- Parent Module PRD — [`../../20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md)
- Upstream module baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-015 in `SPRINT_ROADMAP.md` is **5**; this plan aligns to **5**.

## 2. Proposed Sprint Sequence

### SPR-MOD-015-001 — POS Foundation (Stores, Counters & Configuration)

- **Objective.** Establish POS foundations under a tenant/company: Store and Counter master data; counter-to-store hierarchy; POS configuration surface (denominations, rounding, discount limits per role, offline mode policy); numbering series for POS documents.
- **Boundaries.**
  - In: Store master; Counter master; counter–store hierarchy; POS configuration (denominations, rounding, discount limits per role, offline mode policy); numbering series.
  - Out: cart and sale checkout (SPR-MOD-015-002); payments and receipts (SPR-MOD-015-003); offers, loyalty, and returns (SPR-MOD-015-004); day close and analytics (SPR-MOD-015-005); identity/permissions (owned by MOD-001); ledger posting (owned by MOD-002).
- **Estimated size.** Small.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (submodules — foundation surface for Cart, Payments, Offers, Day Close, Loyalty), §3 Personas, §5 Master Data (Store, Counter), §10 Configuration (denominations, rounding, discount limits per role, offline mode policy).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-007` Document, `ENG-012` Rules, `ENG-017` Numbering, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (MOD-015 sprint 1). Depends on frozen `MOD001_PLATFORM_BASELINE_v1`.
- **Sprint Exit Criteria.**
  - Store and Counter records can be created, edited, and archived under a tenant/company.
  - Counter–store hierarchy is enforced deterministically via `ENG-012`.
  - POS configuration (denominations, rounding, discount limits per role, offline mode policy) is resolvable via `ENG-005` in the tenant → company → context hierarchy.
  - Document numbers for POS transactions issue through `ENG-017`.
  - All state changes are audited via `ENG-004`.

### SPR-MOD-015-002 — Cart, Pricing, Discounts & Offline Sale

- **Objective.** Deliver the Cart-to-checkout process: cart composition, pricing and discount evaluation, supervisor override for beyond-threshold discounts, offline resilience for sale capture, and the POS Sale transaction lifecycle.
- **Boundaries.**
  - In: cart composition; pricing and discount evaluation; supervisor override rule; offline resilience for sale capture; POS Sale transaction lifecycle; `POSSaleCompleted` event publication.
  - Out: foundation masters and configuration (SPR-MOD-015-001); payment authorization and receipts (SPR-MOD-015-003); offers, loyalty, and returns (SPR-MOD-015-004); day close (SPR-MOD-015-005); ledger posting (owned by MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Cart, pricing, and discounts; Offline resilience; submodule Cart), §4 Business Processes (Cart-to-checkout), §6 Transactions (POS Sale), §7 (supervisor-override-for-beyond-threshold-discount rule), §8 Integration Points (`POSSaleCompleted` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-007` Document, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-018` Currency, `ENG-019` Tax, `ENG-024` Event.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-015-001`.
- **Sprint Exit Criteria.**
  - Carts can be composed, priced, and discounted deterministically via `ENG-012`; tax evaluation runs via `ENG-019`; currency handling runs via `ENG-018`.
  - Beyond-threshold discounts require supervisor approval via `ENG-011`.
  - POS Sale lifecycle is enforced via `ENG-010`/`ENG-011`.
  - Offline sale capture is supported per configured offline mode policy; sales reconcile deterministically when connectivity is restored.
  - `POSSaleCompleted` events publish via `ENG-024`.
  - Document numbers issue through `ENG-017`; all state changes are audited via `ENG-004`.

### SPR-MOD-015-003 — Multi-Tender Payments & Receipts

- **Objective.** Deliver the Payment authorization process for POS Sales: multi-tender payment capture (cash, card, digital, mixed), payment terminal integration, and receipt printing/reprint.
- **Boundaries.**
  - In: multi-tender payment capture on POS Sale; payment terminal integration; receipt generation and reprint; payment reversal on returns handoff.
  - Out: foundation masters (SPR-MOD-015-001); sale composition (SPR-MOD-015-002); offers, loyalty, and returns (SPR-MOD-015-004); day close (SPR-MOD-015-005); ledger posting (owned by MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Multi-tender payments; Receipts and reprints; submodule Payments), §4 Business Processes (Payment authorization), §8 Integration Points (External Systems — Payment terminals).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-007` Document, `ENG-010` Workflow, `ENG-012` Rules, `ENG-017` Numbering, `ENG-018` Currency, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-015-001`, `SPR-MOD-015-002`.
- **Sprint Exit Criteria.**
  - Multi-tender payments are captured on POS Sale with deterministic tender validation via `ENG-012`.
  - Payment terminal integration is routed through `ENG-023`.
  - Receipts are generated via `ENG-007`; reprints preserve identity of the original receipt and are audited via `ENG-004`.
  - Notification of receipt (e.g., email/SMS) is dispatched via `ENG-025` where configured.

### SPR-MOD-015-004 — Offers, Loyalty & Returns

- **Objective.** Deliver Offer and Loyalty Program master data, gift-card handling, the POS Return transaction, the Return-to-refund process, consumption of `OfferPublished` events, and publication of `POSReturnProcessed`.
- **Boundaries.**
  - In: Offer master; Loyalty Program master; gift cards; POS Return transaction lifecycle; return-window rule; `OfferPublished` consumption; `POSReturnProcessed` publication.
  - Out: foundation masters (SPR-MOD-015-001); sale capture (SPR-MOD-015-002); payments and receipts (SPR-MOD-015-003); day close (SPR-MOD-015-005); ledger posting (owned by MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Loyalty and gift cards; submodules Offers, Loyalty), §4 Business Processes (Return-to-refund), §5 Master Data (Offer, Loyalty Program), §6 Transactions (POS Return), §7 (return-must-reference-valid-sale-within-window rule), §8 Integration Points (`OfferPublished` — consumed; `POSReturnProcessed` — published; External Systems — Loyalty platforms).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-007` Document, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-015-001`, `SPR-MOD-015-002`, `SPR-MOD-015-003`.
- **Sprint Exit Criteria.**
  - Offer and Loyalty Program records can be created, edited, and archived; gift cards are issued and redeemed through offers/loyalty surfaces.
  - POS Return lifecycle is enforced via `ENG-010`/`ENG-011`; returns must reference a valid POS Sale within the configured return window, enforced via `ENG-012`.
  - `OfferPublished` events are consumed to activate offers at counters; `POSReturnProcessed` events publish via `ENG-024`.
  - Loyalty platform interactions are routed through `ENG-023`.

### SPR-MOD-015-005 — Day Close, Analytics & Compliance

- **Objective.** Deliver the Day close and posting process: Cash Deposit and Day Close transactions, the mismatched-cash approval rule, operational reports (Day Sales, Cashier Report, Offer Impact, Returns Report), dashboards, exports, `POSDayClosed` publication, `InventoryLowStock` consumption, and the module audit-readiness surface.
- **Boundaries.**
  - In: Cash Deposit and Day Close transactions; mismatched-cash approval rule; operational POS reports and dashboards; bulk exports; `POSDayClosed` publication; `InventoryLowStock` consumption; audit-readiness surface; module read model.
  - Out: master and transaction authoring for sales, payments, offers, loyalty, and returns (SPR-MOD-015-001..004); cross-module KPI definitions (owned by MOD-017); ledger posting (owned by MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Day-close and hand-over; submodule Day Close), §4 Business Processes (Day close and posting), §6 Transactions (Cash Deposit, Day Close), §7 (day-cannot-be-closed-with-mismatched-cash-without-approval rule), §8 Integration Points (`POSDayClosed` — published; `InventoryLowStock` — consumed), §9 Reports & Analytics (Day Sales, Cashier Report, Offer Impact, Returns Report; Dashboards; KPIs; Exports), §11 Non-functional Considerations (compliance/audit readiness).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-023` Integration (KPI catalog consumption), `ENG-024` Event, `ENG-025` Notification, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-015-001`, `SPR-MOD-015-002`, `SPR-MOD-015-003`, `SPR-MOD-015-004`.
- **Sprint Exit Criteria.**
  - Cash Deposit and Day Close transactions run via `ENG-010`/`ENG-011`; mismatched-cash close requires approval via `ENG-011`, enforced through `ENG-012`.
  - Day Sales, Cashier Report, Offer Impact, and Returns Report render via `ENG-021`.
  - Dashboards surface POS read-model projections via `ENG-022`; KPI definitions are consumed read-only from MOD-017 via `ENG-023`.
  - Bulk exports of operational reports are produced via `ENG-027`.
  - `POSDayClosed` publishes via `ENG-024`; `InventoryLowStock` is consumed and surfaced to counter and management dashboards.
  - Audit-readiness surface is complete: every state-changing transaction traces to an `ENG-004` audit event.

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-015-001 (POS Foundation: Stores, Counters & Configuration)
         │
         ▼
SPR-MOD-015-002 (Cart, Pricing, Discounts & Offline Sale)
         │
         ▼
SPR-MOD-015-003 (Multi-Tender Payments & Receipts)
         │
         ▼
SPR-MOD-015-004 (Offers, Loyalty & Returns)
         │
         ▼
SPR-MOD-015-005 (Day Close, Analytics & Compliance)
         ▲
         │
   consumes output from 001 … 004
```

Sprint 002 depends on 001. Sprint 003 depends on 001 and 002. Sprint 004 depends on 001, 002, and 003. Sprint 005 consumes output from all four predecessors.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-015 POS Module PRD](../../20-module-prds/pos/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint.

### 4.1 Capability Allocation Matrix (Forward Map)

| # | Module PRD Capability (§2) | Origin Sprint | PRD Section | Exact Quote | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Cart, pricing, and discounts | SPR-MOD-015-002 | §2 | "Cart, pricing, and discounts" | PASS |
| 2 | Multi-tender payments | SPR-MOD-015-003 | §2 | "Multi-tender payments" | PASS |
| 3 | Receipts and reprints | SPR-MOD-015-003 | §2 | "Receipts and reprints" | PASS |
| 4 | Loyalty and gift cards | SPR-MOD-015-004 | §2 | "Loyalty and gift cards" | PASS |
| 5 | Offline resilience | SPR-MOD-015-002 | §2 | "Offline resilience" | PASS |
| 6 | Day-close and hand-over | SPR-MOD-015-005 | §2 | "Day-close and hand-over" | PASS |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Cart | SPR-MOD-015-002 |
| Payments | SPR-MOD-015-003 |
| Offers | SPR-MOD-015-004 |
| Day Close | SPR-MOD-015-005 |
| Loyalty | SPR-MOD-015-004 |

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Store | Master Data (§5) | SPR-MOD-015-001 |
| Counter | Master Data (§5) | SPR-MOD-015-001 |
| Offer | Master Data (§5) | SPR-MOD-015-004 |
| Loyalty Program | Master Data (§5) | SPR-MOD-015-004 |
| POS Sale | Transaction (§6) | SPR-MOD-015-002 |
| POS Return | Transaction (§6) | SPR-MOD-015-004 |
| Cash Deposit | Transaction (§6) | SPR-MOD-015-005 |
| Day Close | Transaction (§6) | SPR-MOD-015-005 |

### 4.4 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-015-001 | §1, §2 (foundation surface for all submodules), §3, §5 (Store, Counter), §10 (denominations, rounding, discount limits per role, offline mode policy) |
| SPR-MOD-015-002 | §2 (Cart, pricing, and discounts; Offline resilience; submodule Cart), §4 (Cart-to-checkout), §6 (POS Sale), §7 (supervisor-override rule), §8 (`POSSaleCompleted` — published) |
| SPR-MOD-015-003 | §2 (Multi-tender payments; Receipts and reprints; submodule Payments), §4 (Payment authorization), §8 (External Systems — Payment terminals) |
| SPR-MOD-015-004 | §2 (Loyalty and gift cards; submodules Offers, Loyalty), §4 (Return-to-refund), §5 (Offer, Loyalty Program), §6 (POS Return), §7 (return-window rule), §8 (`OfferPublished` — consumed; `POSReturnProcessed` — published; External Systems — Loyalty platforms) |
| SPR-MOD-015-005 | §2 (Day-close and hand-over; submodule Day Close), §4 (Day close and posting), §6 (Cash Deposit, Day Close), §7 (mismatched-cash rule), §8 (`POSDayClosed` — published; `InventoryLowStock` — consumed), §9 (Day Sales, Cashier Report, Offer Impact, Returns Report; Dashboards; KPIs; Exports), §11 (audit readiness) |

No Module PRD capability, submodule, master-data entity, or transaction sits outside the five sprints above. No capability appears as the originating allocation in more than one sprint. Every capability appears in exactly one originating sprint and in at least one sprint.

## 5. Engine Consumption Map

Derived from POS Module PRD §12. No engine behavior is redefined. Engine identifiers resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md`.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-010 | ENG-011 | ENG-012 | ENG-015 | ENG-016 | ENG-017 | ENG-018 | ENG-019 | ENG-021 | ENG-022 | ENG-023 | ENG-024 | ENG-025 | ENG-027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-015-001 | ● | ● | ● | ● | ● | ● | ● |   |   | ● |   |   | ● |   |   |   |   |   | ● | ● |   |
| SPR-MOD-015-002 |   | ● |   | ● | ● | ● | ● | ● | ● | ● |   |   | ● | ● | ● |   |   |   | ● |   |   |
| SPR-MOD-015-003 |   | ● |   | ● | ● | ● | ● | ● |   | ● |   |   | ● | ● |   |   |   | ● | ● | ● |   |
| SPR-MOD-015-004 |   | ● |   | ● | ● |   | ● | ● | ● | ● |   |   | ● |   |   |   |   | ● | ● | ● |   |
| SPR-MOD-015-005 |   | ● |   | ● |   |   |   | ● | ● | ● |   |   | ● |   |   | ● | ● | ● | ● | ● | ● |

`ENG-015` Voucher and `ENG-016` Posting are declared as Required by the Module PRD §12 and are exercised through posting-rule bindings triggered by POS-published events; the concrete voucher shape and posting rules are authored under **MOD-002 Accounting**. Optional engines from Module PRD §12 that are not required by any sprint are not declared.

## 6. ADR Consumption Map

Accepted ADRs only, per POS Module PRD (`ADR-011`, `ADR-032`).

| Sprint | ADR-011 | ADR-032 |
| --- | :-: | :-: |
| SPR-MOD-015-001 | ● | ● |
| SPR-MOD-015-002 | ● | ● |
| SPR-MOD-015-003 | ● | ● |
| SPR-MOD-015-004 | ● | ● |
| SPR-MOD-015-005 | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Platform Dependency.** MOD-015 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Tenant, company, branch, and user master are consumed read-only from MOD-001.
>
> **Accounting Dependency.** MOD-015 assumes `MOD002_ACCOUNTING_BASELINE_v1` is frozen. Ledger effects of POS Sale, POS Return, Cash Deposit, and Day Close are produced by MOD-002 via `ENG-015` Voucher and `ENG-016` Posting engines with posting-rule bindings owned by MOD-002.
>
> **Inventory Dependency.** MOD-015 assumes `MOD005_INVENTORY_BASELINE_v1` is frozen. Item, price list, and stock master are consumed read-only; `InventoryLowStock` is consumed at day-close/analytics.
>
> **Analytics Boundary.** Cross-module KPI definitions are owned by **MOD-017 Analytics**. MOD-015 surfaces its own operational reports (§9) but consumes cross-module KPI definitions from MOD-017.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Store / Counter Master | SPR-MOD-015-001 | 002, 003, 004, 005 | Foundational; every later sprint assumes this master data. |
| POS Configuration (denominations, rounding, discount limits, offline mode) | SPR-MOD-015-001 | 002, 003, 004, 005 | Resolved via `ENG-005`. |
| POS Sale Transaction | SPR-MOD-015-002 | 003, 004, 005 | Sale record is the anchor for payment capture, returns reference, and day close. |
| Payment capture + Receipts | SPR-MOD-015-003 | 004, 005 | Returns reverse payments; day close reconciles tender totals. |
| Offer / Loyalty Program Master | SPR-MOD-015-004 | 002 (offer activation), 005 | Offer activation is consumed at cart-time via `OfferPublished`. |
| POS Return Transaction | SPR-MOD-015-004 | 005 | Returns feed Returns Report and day close balances. |
| Tenant / Company / Branch / User Master | External (MOD-001) | 001–005 | Consumed via read-only APIs; never redefined. |
| Item / Price List / Stock Master | External (MOD-005) | 002, 003, 004, 005 | Consumed via read-only APIs from Inventory. |
| `OfferPublished` (consumed event) | External (MOD-003 Sales / Offers publisher) | SPR-MOD-015-004 | Activates offers at counters. |
| `InventoryLowStock` (consumed event) | External (MOD-005 Inventory) | SPR-MOD-015-005 | Feeds counter/management dashboards and operational alerting. |
| `POSSaleCompleted` event | SPR-MOD-015-002 | MOD-002, MOD-005, MOD-017 | Feeds accounting posting bindings, inventory stock adjustment, and analytics. |
| `POSReturnProcessed` event | SPR-MOD-015-004 | MOD-002, MOD-005, MOD-017 | Feeds accounting posting bindings, inventory stock adjustment, and analytics. |
| `POSDayClosed` event | SPR-MOD-015-005 | MOD-002, MOD-017 | Feeds accounting posting bindings and analytics. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-015 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Any regression against that baseline blocks Stage 2 authoring.
- **R2 — Accounting baseline dependency.** MOD-015 assumes `MOD002_ACCOUNTING_BASELINE_v1` is frozen. All ledger effects remain owned by MOD-002.
- **R3 — Inventory baseline dependency.** MOD-015 assumes `MOD005_INVENTORY_BASELINE_v1` is frozen. Item, price list, and stock master are consumed read-only.
- **R4 — Identity boundary.** Identity and permissions remain owned by MOD-001. MOD-015 consumes identity read-only.
- **R5 — Analytics boundary.** Cross-module KPI definitions remain owned by MOD-017. Operational POS reports are surfaced within MOD-015.
- **R6 — Optional-engine scope creep.** Optional engines (`ENG-012`, `ENG-018`, `ENG-022`, `ENG-027`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R7 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md`, no horizontal-only sprints are required for MOD-015; all sprints are vertical slices.
- **R8 — Future-enhancement scope.** Omni-channel receipts and AI upsell prompts are deferred to Module PRD §14 Future Enhancements and are NOT allocated to any sprint in this plan.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-015 is baseline-ready when all of the following are objectively true:

1. Every reserved POS Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD015_POS_BASELINE_v1` is authored under `docs/40-module-baselines/`.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no POS capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md` beyond additive registration.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`../../15-governance/templates/GT-002_STAGE1_AUTHORING.md`](../../15-governance/templates/GT-002_STAGE1_AUTHORING.md)
