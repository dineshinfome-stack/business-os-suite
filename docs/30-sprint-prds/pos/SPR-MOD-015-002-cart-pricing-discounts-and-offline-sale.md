---
title: "SPR-MOD-015-002 — Cart, Pricing, Discounts & Offline Sale"
summary: "Sprint PRD for the Cart-to-checkout slice of MOD-015 POS: cart composition; pricing and discount evaluation; supervisor-override rule for beyond-threshold discounts; offline resilience for sale capture; POS Sale transaction lifecycle; POSSaleCompleted event publication. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Revenue"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-015-002"
parent_module: "MOD-015"
parent_sprint_plan: "MOD-015_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "17.0.2"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-018", "ENG-019", "ENG-024"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "pos", "mod-015", "cart", "offline-sale", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD015-002-20260717T000000Z-001"
parent_result_id: "GT003-MOD015-001-20260716T034000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-015-002 — Cart, Pricing, Discounts & Offline Sale

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-015 POS** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-015-002` (permanent) |
| Parent Module | `MOD-015` — POS |
| Parent Sprint Plan | [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-015-001`](./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-015-003` … `SPR-MOD-015-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Cart-to-checkout** slice of MOD-015 POS: cart composition; deterministic pricing and discount evaluation; the **supervisor-override** rule for beyond-threshold discounts; **offline resilience** for sale capture per the offline mode policy registered in Sprint 001; the **POS Sale** transaction lifecycle; and publication of `POSSaleCompleted` at commit. This sprint delivers the Cart submodule and the POS Sale transaction; it does not deliver payment authorization, receipts, offers/loyalty, returns, day close, or ledger posting.

> **POS Ownership Convention (recapitulated, not evolved).** POS owns the business semantics of the Cart, pricing evaluation, discount evaluation, offline sale capture, and the POS Sale transaction lifecycle. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, localization, document, workflow, approval, rules, numbering, currency, tax, eventing) but **MUST NOT** redefine POS business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects of POS Sale remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines — no POS sprint writes journal entries directly; MOD-002 consumes `POSSaleCompleted` through its own posting-rule bindings. Item, price list, and stock master remain exclusive to **MOD-005 Inventory** and are consumed read-only.

#### 1.1.1 Cart & POS Sale Authority

The **Cart** working entity and the **POS Sale** transaction lifecycle are authoritatively owned by MOD-015 POS, in this sprint. No other module MAY define a parallel Cart or POS Sale lifecycle. Downstream sprints (Multi-Tender Payments & Receipts; Offers/Loyalty/Returns; Day Close/Analytics) consume the POS Sale through POS-owned events and read APIs; they MUST NOT redefine its states or transitions.

#### 1.1.2 Pricing, Discount & Supervisor-Override Rule Authority

Deterministic evaluation of **pricing** and **discounts** at the cart line and cart level, and the **supervisor-override-for-beyond-threshold-discount** rule (Module PRD §7), are authoritatively owned by MOD-015 POS in this sprint and evaluated via `ENG-012` Rules with approval via `ENG-011` where thresholds are breached. Thresholds resolve read-only from the `discount limits per role` POS configuration registered in Sprint 001 via `ENG-005`. Currency handling routes through `ENG-018` and tax evaluation through `ENG-019`; neither is redefined here.

#### 1.1.3 Offline Sale Capture Authority

Deterministic **offline sale capture** and reconnect reconciliation for POS Sale are authoritatively owned by MOD-015 POS in this sprint, per the `offline mode policy` POS configuration registered in Sprint 001 via `ENG-005`. Offline-captured sales reconcile deterministically on reconnect and MUST NOT produce duplicate POS Sale identifiers, duplicate document numbers, or duplicate `POSSaleCompleted` publications.

#### 1.1.4 POS ↔ Platform, Accounting, Inventory, and Analytics Boundary (recapitulated)

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. POS consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting. POS Sale ledger effects are produced by MOD-002 posting-rule bindings triggered by `POSSaleCompleted`; no POS code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.
- **MOD-005 Inventory** owns Item, price list, and stock master data. This sprint consumes them read-only for cart line composition and pricing inputs; stock adjustment on sale is triggered by MOD-005's subscription to `POSSaleCompleted` in the Inventory domain, not by MOD-015 writing stock.
- **MOD-017 Analytics** owns cross-module KPI definitions. Cross-module KPIs are never redefined by MOD-015.

Ownership boundaries SHALL NOT be redefined in downstream POS Sprint PRDs.

### 1.2 In Scope

- Cart composition: add / update / remove cart lines; per-line quantity, unit, and item reference resolved read-only from MOD-005 Inventory; cart headers scoped to a Store and Counter registered by Sprint 001.
- Pricing evaluation at cart line and cart level, resolved deterministically via `ENG-012` Rules using pricing inputs consumed read-only from MOD-005 Inventory; currency handling via `ENG-018`; tax evaluation via `ENG-019`.
- Discount evaluation at cart line and cart level, resolved deterministically via `ENG-012` Rules; effective discount ceilings resolve read-only from the `discount limits per role` POS configuration registered in Sprint 001 via `ENG-005`.
- Supervisor-override for beyond-threshold discounts (Module PRD §7): when an evaluated discount exceeds the configured limit for the acting role, the cart transitions to a supervisor-approval state via `ENG-011`; the request is enforced via `ENG-012` prior to POS Sale commit.
- POS Sale transaction lifecycle: cart → priced → discount-evaluated → (optionally) supervisor-approved → committed, orchestrated via `ENG-010` Workflow and, where approval is required, `ENG-011` Approval. Commit produces a POS Sale document; document number issues via `ENG-017` from the numbering series registered in Sprint 001.
- Offline sale capture per the `offline mode policy` POS configuration registered in Sprint 001 via `ENG-005`; deterministic reconciliation on reconnect (no duplicate POS Sale identifier, no duplicate document number, no duplicate `POSSaleCompleted` publication) enforced via `ENG-012`.
- Publication of `POSSaleCompleted` via `ENG-024` on POS Sale commit (online and reconciled-offline paths).
- Authorization on all cart and POS Sale actions via `ENG-002`, evaluated against permissions registered under `ENG-003` (Sprint 001) and ADR-032.
- Audit emission via `ENG-004` for every cart / POS Sale lifecycle transition, every discount override request and outcome, every offline-capture and reconciliation event, and every `POSSaleCompleted` publication.
- Document classification for POS Sale artifacts via `ENG-007` where applicable.
- Locale-scoped labels on cart and POS Sale surfaces via `ENG-006` where applicable.
- Structural and business-rule validation via `ENG-012`: required fields, referential integrity, uniqueness, cart–Counter–Store consistency (single company), non-negative quantities per pricing rules, discount ceiling enforcement, offline-mode-policy consistency, reconcile idempotency.

### 1.3 Out of Scope

- Store, Counter, POS operations configuration, and numbering-series registration — `SPR-MOD-015-001`.
- Multi-tender payment capture; payment terminal integration; receipt generation and reprint — `SPR-MOD-015-003`.
- Offer master; Loyalty Program master; gift cards; POS Return transaction; return-window rule; `OfferPublished` consumption; `POSReturnProcessed` publication — `SPR-MOD-015-004`.
- Cash Deposit and Day Close transactions; mismatched-cash approval rule; operational POS reports and dashboards; bulk exports; `POSDayClosed` publication; `InventoryLowStock` consumption; audit-readiness surface; POS read model — `SPR-MOD-015-005`.
- Financial postings for POS Sale — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting, triggered by `POSSaleCompleted`.
- Item, price list, and stock master authoring — owned by MOD-005 Inventory.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-015-002`, the following will exist:

- **Business capabilities.**
  - A Cashier can compose a Cart at a Counter under a Store within a tenant/company, adding, updating, and removing cart lines that reference Items resolved read-only from MOD-005.
  - Pricing evaluates deterministically at cart line and cart level via `ENG-012`, using currency handling via `ENG-018` and tax evaluation via `ENG-019`.
  - Discounts evaluate deterministically via `ENG-012` against effective ceilings resolved read-only from the `discount limits per role` POS configuration.
  - When an evaluated discount breaches the configured ceiling for the acting role, the cart transitions to a supervisor-approval state via `ENG-011`; commit is blocked until the override is resolved.
  - A Cashier commits a POS Sale from a priced and (where applicable) supervisor-approved cart via `ENG-010`; a POS Sale document number issues via `ENG-017`.
  - Offline sale capture is supported per the configured offline mode policy; reconnect reconciliation is deterministic and idempotent.
- **Domain events.**
  - `POSSaleCompleted` is published via `ENG-024` on POS Sale commit (online path and reconciled-offline path). Payload contract is governed by the authoritative event catalog and not redefined here.
- **Audit artifacts.** An audit record exists for every cart / POS Sale lifecycle transition, every discount override request and outcome, every offline-capture and reconciliation event, and every `POSSaleCompleted` publication, produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-015-002`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-015 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — *Cart, pricing, and discounts*; *Offline resilience*; submodule **Cart** | Cart composition, pricing/discount evaluation, offline sale capture (§1.2) |
| §4 Business Processes — *Cart-to-checkout* | POS Sale lifecycle via `ENG-010`/`ENG-011` (§1.2, §5) |
| §6 Transactions — *POS Sale* | POS Sale transaction lifecycle and commit (§1.2, §5) |
| §7 Business Rules — *Discounts beyond a threshold require supervisor override* | Supervisor-override rule via `ENG-011` and `ENG-012` (§1.1.2, §5.4) |
| §8 Integration Points — *POSSaleCompleted* (published) | Publication via `ENG-024` (§5.7, §11) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved POS Module PRD.**

### 3.1 Capability Allocation Compliance

Per the Module PRD Capability Allocation Matrix in [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) §4.1, the following §2 capabilities are originating-allocated to `SPR-MOD-015-002` and to no other sprint:

| Module PRD §2 Capability | Origin Sprint |
| --- | --- |
| Cart, pricing, and discounts | `SPR-MOD-015-002` |
| Offline resilience | `SPR-MOD-015-002` |

Per Sprint Plan §4.2, the **Cart** submodule is originating-allocated to `SPR-MOD-015-002`. Per Sprint Plan §4.3, the **POS Sale** transaction is originating-allocated to `SPR-MOD-015-002`. These originating allocations are unique; no other POS sprint claims them.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Cart, pricing, and discounts* and *Offline resilience*, §2 submodule *Cart*, §4 process *Cart-to-checkout*, §6 transaction *POS Sale*, §7 rule *Discounts beyond a threshold require supervisor override*, and §8 event *POSSaleCompleted (published)* → this Sprint PRD → deliverables in §2 (Cart composition, deterministic pricing/discount evaluation, supervisor-override enforcement, POS Sale lifecycle commit, offline capture and reconciliation, `POSSaleCompleted` publication, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Cashier, I want to compose a Cart at a Counter under a Store by adding, updating, and removing lines that reference Items resolved read-only from MOD-005 Inventory, so that a sale can be prepared before checkout.*
- **US-002.** *As a Cashier, I want pricing to evaluate deterministically at cart line and cart level using currency handling and tax evaluation, so that displayed totals match the resolved pricing rules for the cart's context.*
- **US-003.** *As a Cashier, I want discount evaluation to run deterministically against effective ceilings resolved from POS configuration, so that permitted discounts apply without manual arbitration.*
- **US-004.** *As a Store Manager (Supervisor), I want beyond-threshold discounts to require supervisor approval via `ENG-011`, so that discretionary discounts remain governed.*
- **US-005.** *As a Cashier, I want to commit a priced and (where applicable) supervisor-approved cart into a POS Sale that receives a document number from the registered numbering series, so that a durable, uniquely identified sale exists at checkout.*
- **US-006.** *As a Cashier operating a counter under a configured offline mode policy, I want to capture sales offline and have them reconcile deterministically and idempotently on reconnect, so that connectivity gaps do not lose or duplicate sales.*
- **US-007.** *As a downstream subscriber (Payments/Receipts, Offers/Loyalty/Returns, Day Close/Analytics, MOD-002 Accounting, MOD-005 Inventory, and cross-module consumers), I want `POSSaleCompleted` to publish on every POS Sale commit — online and reconciled-offline — so that downstream sprints and modules can react without polling POS state.*
- **US-008.** *As a security reviewer, I want every cart / POS Sale lifecycle transition, every discount override request and outcome, and every offline-capture and reconciliation event to be audited via `ENG-004`, so that I can reconstruct sale history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Cart composition (US-001)

- **Given** an authenticated Cashier at an active Counter bound to an active Store under a tenant/company,
  **when** cart lines referencing valid Items are added / updated / removed,
  **then** the Cart is maintained with a stable identifier scoped to the Counter, each line references an Item resolved read-only from MOD-005 Inventory, and each state change is audited via `ENG-004`.
- **Given** a cart-line request referencing an Item that is not resolvable read-only from MOD-005 or that violates cart–Counter–Store single-company consistency,
  **when** submitted,
  **then** the request is rejected deterministically via `ENG-012` before any state change.

### 5.2 Pricing evaluation (US-002)

- **Given** a Cart with one or more lines,
  **when** pricing is evaluated,
  **then** line and cart totals resolve deterministically via `ENG-012`, currency handling routes through `ENG-018`, and tax evaluation routes through `ENG-019`, using pricing inputs consumed read-only from MOD-005 Inventory.

### 5.3 Discount evaluation (US-003)

- **Given** a priced Cart and the `discount limits per role` POS configuration registered in Sprint 001,
  **when** discount evaluation runs,
  **then** the effective ceiling for the acting role resolves read-only via `ENG-005` and discount application is enforced deterministically via `ENG-012`.

### 5.4 Supervisor-override for beyond-threshold discounts (US-004)

- **Given** a Cart whose evaluated discount exceeds the configured ceiling for the acting role,
  **when** the Cashier attempts to progress the cart toward commit,
  **then** the cart transitions to a supervisor-approval state via `ENG-011`; commit is blocked until an authorized Supervisor approves the override, and the request, outcome, actor, and timestamp are audited via `ENG-004`.
- **Given** an approved override,
  **when** the cart resumes toward commit,
  **then** `ENG-012` re-validates the discount against the recorded approval and permits progression only if the approval matches the discount under evaluation.

### 5.5 POS Sale lifecycle and commit (US-005)

- **Given** a priced Cart in a commit-eligible state (approved override where required),
  **when** the Cashier commits the sale,
  **then** the POS Sale is orchestrated via `ENG-010` (and `ENG-011` where approval is required), a POS Sale document number issues via `ENG-017` from the numbering series registered in Sprint 001, the commit is audited via `ENG-004`, and the POS Sale identifier is immutable thereafter.

### 5.6 Offline sale capture and reconnect reconciliation (US-006)

- **Given** a Counter operating under the configured offline mode policy resolved via `ENG-005`,
  **when** a sale is captured offline,
  **then** the sale is persisted locally with a stable identifier reserved under the offline-mode policy, and every offline capture is audited via `ENG-004`.
- **Given** offline-captured sales upon reconnect,
  **when** reconciliation runs,
  **then** each offline sale reconciles idempotently — no duplicate POS Sale identifier, no duplicate document number allocated via `ENG-017`, and no duplicate `POSSaleCompleted` publication — with idempotency enforced deterministically via `ENG-012`, and reconciliation outcomes audited via `ENG-004`.

### 5.7 `POSSaleCompleted` publication (US-007)

- **Given** a POS Sale commit on either the online path or the reconciled-offline path,
  **when** the commit transaction completes,
  **then** `POSSaleCompleted` is published via `ENG-024` exactly once per POS Sale identifier, using the authoritative envelope and payload contract governed by the event catalog.

### 5.8 Audit integration (US-008)

- **Given** any cart / POS Sale lifecycle transition, discount override request or outcome, offline capture, or reconnect reconciliation event,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, Counter and Store references, cart / POS Sale identifier, transition or event type, and timestamp.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any cart / POS Sale read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.10 Authorization invariants (`ADR-032`)

- **Given** any cart / POS Sale action (compose, price, discount, override, commit, offline capture, reconcile),
  **when** it executes,
  **then** it is authorized via `ENG-002` against permissions registered by `ENG-003` under the RBAC + ABAC model; unauthorized actions are rejected before any state change.

### 5.11 Ownership consumption invariants

- **Given** any pricing / discount / cart-line composition path,
  **when** Item, price list, or stock inputs are needed,
  **then** they are consumed read-only from MOD-005 Inventory; MOD-005 masters are not redefined here.
- **Given** POS Sale commit,
  **when** ledger effects are required,
  **then** MOD-002 Accounting is triggered exclusively through `POSSaleCompleted`; no POS code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.
- **Given** any actor identity resolution for cart / POS Sale actions,
  **when** performed,
  **then** it is read-only via `ENG-001`; the Identity entity is not redefined here.
- **Given** any consumption of Store, Counter, POS operations configuration, or numbering series,
  **when** performed,
  **then** it is read-only from the authoritative POS surfaces delivered by `SPR-MOD-015-001`; those masters are not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-015` — POS.
- **Module PRD:** [`docs/20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Cart, pricing, and discounts; Offline resilience; submodule Cart), §4 (Cart-to-checkout), §6 (POS Sale), §7 (supervisor-override rule), §8 (`POSSaleCompleted` — published), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-015` MODULE_PRD.
- **Upstream sprint:** [`SPR-MOD-015-001`](./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md) — provides Store / Counter masters, POS operations configuration (denominations, rounding, discount limits per role, offline mode policy), and numbering-series registration.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (consumed indirectly via `POSSaleCompleted`; not invoked from this sprint).
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — Item, price list, and stock master (consumed read-only for pricing and cart line composition).
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-015-001`.
- **Downstream sprints:** `SPR-MOD-015-003` (Multi-Tender Payments & Receipts), `SPR-MOD-015-004` (Offers, Loyalty & Returns), `SPR-MOD-015-005` (Day Close, Analytics & Compliance) — per [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md).

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
| `ENG-002` Authorization | Enforces authorization on every cart / POS Sale action. |
| `ENG-004` Audit | Records every cart / POS Sale lifecycle transition, every override request and outcome, and every offline-capture and reconciliation event. |
| `ENG-005` Configuration | Resolves POS operations configuration (denominations, rounding, discount limits per role, offline mode policy) read-only under the tenant/company hierarchy; namespace registered in Sprint 001. |
| `ENG-006` Localization | Resolves locale-scoped labels on cart and POS Sale surfaces where applicable. |
| `ENG-007` Document | Provides document classification for POS Sale artifacts where applicable. |
| `ENG-010` Workflow | Orchestrates the POS Sale lifecycle (cart → priced → discount-evaluated → optional supervisor-approval → committed). |
| `ENG-011` Approval | Executes the supervisor-override approval when an evaluated discount exceeds the configured ceiling for the acting role. |
| `ENG-012` Rules | Evaluates pricing rules, discount rules, discount-ceiling enforcement, cart–Counter–Store consistency, and offline reconcile idempotency at capture and commit time. |
| `ENG-017` Numbering | Allocates POS Sale document numbers from the numbering series registered in Sprint 001 at commit time (online and reconciled-offline paths). |
| `ENG-018` Currency | Handles currency scaling, rounding, and conversion inputs for pricing evaluation. |
| `ENG-019` Tax | Evaluates tax on cart lines and cart totals. |
| `ENG-024` Eventing | Publishes `POSSaleCompleted` on POS Sale commit. |

POS business semantics (Cart, POS Sale lifecycle, pricing/discount decisions, supervisor-override rule, offline capture and reconciliation) are owned by this module and are not delegated to any engine.

`ENG-015` Voucher and `ENG-016` Posting are declared as Required by the Module PRD §12 but are **not** consumed by this sprint per Sprint Plan §2 (`SPR-MOD-015-002`) — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by `POSSaleCompleted`.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every cart / POS Sale read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every cart / POS Sale action. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Cart | MOD-015 (this sprint) | Working entity scoped to a Counter under a Store within a tenant/company, containing zero or more cart lines and evaluated pricing/discount state prior to POS Sale commit. |
| Cart Line | MOD-015 (this sprint) | Individual line on a Cart referencing an Item (read-only from MOD-005) with quantity and unit; evaluated pricing/discount state at line level. |
| POS Sale | MOD-015 (this sprint) | Committed sale transaction with a stable identifier, POS Sale document number issued via `ENG-017`, and audited lifecycle. Originated per Sprint Plan §4.3. |
| Offline Sale Capture | MOD-015 (this sprint) | Locally-persisted representation of a POS Sale captured while offline; reconciles deterministically and idempotently to a committed POS Sale on reconnect. |
| Discount Override Request | MOD-015 (this sprint) | Approval artifact produced by `ENG-011` when an evaluated discount exceeds the configured ceiling for the acting role; recorded with actor, outcome, and timestamp. |

### 10.2 Relationships

- A **Cart** is scoped to exactly one **Counter** (owned by MOD-015 per Sprint 001) under exactly one **Store** within a single company; scoping is enforced deterministically via `ENG-012`.
- A **Cart** has zero or more **Cart Lines**; each **Cart Line** references exactly one **Item** consumed read-only from MOD-005 Inventory.
- A **POS Sale** originates from exactly one **Cart** commit; its identifier is unique within the tenant/company scope and immutable thereafter.
- An **Offline Sale Capture** reconciles at most once to exactly one **POS Sale**; reconciliation idempotency is enforced deterministically via `ENG-012`.
- A **Discount Override Request** references exactly one **Cart** and, when approved, gates its progression to POS Sale commit.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-015` per the POS Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a POS-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as POS-owned entities.
- The **Item**, **Price List**, and **Stock** entities are owned by MOD-005 Inventory; they are not POS-owned entities.
- The **Store**, **Counter**, **POS Configuration**, and **POS Numbering Series** entities are owned by MOD-015 but authored by `SPR-MOD-015-001`; they are consumed read-only here.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`POSSaleCompleted`** — published via `ENG-024` on POS Sale commit (online path and reconciled-offline path). Per Sprint Plan §2 (`SPR-MOD-015-002`), this is the single domain event originated by this sprint. Payload contract is declared in the authoritative event catalog and not redefined here.

### 11.2 Consumed

None in this sprint. `OfferPublished` consumption is scoped to `SPR-MOD-015-004`, and `InventoryLowStock` consumption is scoped to `SPR-MOD-015-005`; neither occurs here.

Payload contracts for POS events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every cart / POS Sale read and write.
- [ ] Every cart / POS Sale lifecycle transition, every discount override request and outcome, and every offline-capture and reconciliation event produces an audit record via `ENG-004`.
- [ ] Pricing evaluation routes through `ENG-012` with `ENG-018` currency and `ENG-019` tax; discount evaluation routes through `ENG-012` against ceilings resolved via `ENG-005`.
- [ ] Supervisor-override for beyond-threshold discounts runs through `ENG-011`; commit is blocked until the override is resolved; `ENG-012` re-validates the approved discount at commit time.
- [ ] POS Sale lifecycle is orchestrated via `ENG-010`; POS Sale document numbers issue via `ENG-017` from the numbering series registered in Sprint 001.
- [ ] Offline sale capture and reconnect reconciliation are deterministic and idempotent; no duplicate POS Sale identifier, no duplicate document number, and no duplicate `POSSaleCompleted` publication is possible.
- [ ] `POSSaleCompleted` is published via `ENG-024` exactly once per POS Sale identifier (online and reconciled-offline paths).
- [ ] No POS code path writes to `ENG-015` Voucher or `ENG-016` Posting.
- [ ] No POS code path writes to MOD-005 Inventory masters; all Item, price list, and stock consumption is read-only.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-015_SPRINT_PLAN.md` §2 (`SPR-MOD-015-002`):

- Carts can be composed, priced, and discounted deterministically via `ENG-012`; tax evaluation runs via `ENG-019`; currency handling runs via `ENG-018`.
- Beyond-threshold discounts require supervisor approval via `ENG-011`.
- POS Sale lifecycle is enforced via `ENG-010`/`ENG-011`.
- Offline sale capture is supported per configured offline mode policy; sales reconcile deterministically when connectivity is restored.
- `POSSaleCompleted` events publish via `ENG-024`.
- Document numbers issue through `ENG-017`; all state changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-015 Sprint 2 depends on `SPR-MOD-015-001` deliverables (Store, Counter, POS operations configuration, numbering series) remaining stable through this sprint.
  - **Impact:** Any regression against Sprint 001 outputs would block cart composition, discount-ceiling resolution, offline-mode-policy resolution, or POS Sale document numbering.
  - **Mitigation:** Consume Sprint 001 outputs read-only per their authoritative surfaces; escalate any drift as a Sprint 001 defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Pricing and tax evaluation depend on `ENG-018` Currency and `ENG-019` Tax behaving per their authoritative contracts.
  - **Impact:** Any drift would produce non-deterministic totals or tax outcomes.
  - **Mitigation:** Consume both engines per their authoritative contracts; escalate any deviation as an engine defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Read-only consumption of MOD-005 Inventory (Item, price list, stock inputs) depends on `MOD005_INVENTORY_BASELINE_v1` remaining frozen.
  - **Impact:** Any drift in Inventory read APIs would decouple pricing inputs from MOD-005 authority.
  - **Mitigation:** Consume MOD-005 read APIs per their authoritative contract; escalate any change as an Inventory defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** `POSSaleCompleted` is the sole trigger for MOD-002 posting-rule bindings and MOD-005 stock adjustment for POS sales. Publication drift would decouple ledger and stock effects from POS.
  - **Impact:** Missed or duplicate publications would cause missed or duplicate downstream effects.
  - **Mitigation:** Enforce exactly-once publication semantics per the authoritative event catalog and `ENG-024`; back publication with the reconcile-idempotency invariant from §5.6.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Later POS sprints (`SPR-MOD-015-003` … `SPR-MOD-015-005`) are deferred; scope-creep back into this sprint (payments, receipts, offers, loyalty, returns, day close) would dilute the Cart-to-checkout slice.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Sprint 2 publishes `POSSaleCompleted`. If this event name is not present in the authoritative event catalog at authoring time, it is a deferred event-catalog registration item.
  - **Impact:** If not registered before this sprint enters `In Progress`, publishers cannot emit and consumers (MOD-002 posting, MOD-005 stock, later POS sprints) cannot subscribe.
  - **Mitigation:** Confirm event catalog registration of `POSSaleCompleted` before this sprint enters `In Progress`. Register via the event catalog governance process; the event catalog is not modified by this sprint.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — cart composition validation; cart–Counter–Store single-company invariant; pricing rule evaluation; discount rule evaluation; discount-ceiling enforcement; supervisor-override request/approval semantics; offline reconcile idempotency.
- **Integration** — authorization via `ENG-002`, audit emission via `ENG-004`, configuration resolution via `ENG-005`, workflow orchestration via `ENG-010`, approval via `ENG-011`, rules evaluation via `ENG-012`, numbering allocation via `ENG-017`, currency via `ENG-018`, tax via `ENG-019`, event publication via `ENG-024`; read-only consumption from MOD-005 Inventory.
- **Contract** — `POSSaleCompleted` payload contract per the authoritative event catalog.
- **End-to-end (smoke)** — Cart composition → pricing → discount evaluation → (optional supervisor-override → approval) → POS Sale commit → document-number allocation → `POSSaleCompleted` publication, with audit records at each step; a separate offline-capture-and-reconnect smoke exercising deterministic idempotent reconciliation; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: an offline-mode-policy fixture with a scripted disconnect/reconnect harness; a discount-ceiling fixture bound to a specific role from Sprint 001 configuration; a MOD-005 Inventory read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the POS Sale lifecycle as an explicit `ENG-010` state machine (cart → priced → discount-evaluated → optional supervisor-approval → committed) so audit emission (§5.8) and reconcile idempotency (§5.6) are trivially satisfiable at every transition.
- Consider treating each offline-captured sale as a reserved (POS Sale identifier, document number) pair — allocated locally under the offline-mode policy — so reconnect reconciliation collapses to a deterministic upsert with `ENG-012`-enforced idempotency.
- Consider centralizing the `POSSaleCompleted` publication path so both online and reconciled-offline commits emit through a single instrumented emission point, simplifying exactly-once semantics against `ENG-024`.
- Consider resolving the `discount limits per role` ceiling once per cart-evaluation cycle via `ENG-005` and caching within the evaluation transaction; do not persist a shadow copy that could drift from the POS configuration namespace.
- Consider re-running `ENG-012` discount validation at commit time against the recorded approval envelope so a mid-cart change to the discounted amount cannot bypass the supervisor override.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-015-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Cart-to-checkout slice — Cart composition, deterministic pricing/discount evaluation, supervisor-override for beyond-threshold discounts, offline sale capture and reconnect reconciliation, POS Sale lifecycle and commit, and `POSSaleCompleted` publication (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-015 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the POS Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters, payments/receipts, offers/loyalty/returns, day close/analytics, MOD-002-owned ledger postings, MOD-005-owned Item/price-list/stock, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-015-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-015-003` Multi-Tender Payments & Receipts is the immediate successor per [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-015-001` and `SPR-MOD-015-002`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md`](./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- Precedent Sprint 2 PRDs — [`../fleet/SPR-MOD-014-002-trip-planning-and-execution.md`](../fleet/SPR-MOD-014-002-trip-planning-and-execution.md), [`../field-service/SPR-MOD-012-002-dispatch-and-scheduling.md`](../field-service/SPR-MOD-012-002-dispatch-and-scheduling.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
