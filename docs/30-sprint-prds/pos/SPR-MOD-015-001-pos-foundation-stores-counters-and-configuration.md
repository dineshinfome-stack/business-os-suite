---
title: "SPR-MOD-015-001 — POS Foundation (Stores, Counters & Configuration)"
summary: "Sprint PRD for the foundational POS layer of MOD-015: Store and Counter master data; counter-to-store hierarchy; POS operations configuration (denominations, rounding, discount limits per role, offline mode policy); numbering series for POS documents. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Revenue"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-015-001"
parent_module: "MOD-015"
parent_sprint_plan: "MOD-015_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "17.0.1"
size: "Small"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-012", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "pos", "mod-015", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD015-001-20260716T034000Z-001"
parent_result_id: "GT002-MOD015-20260716T033000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-015-001 — POS Foundation (Stores, Counters & Configuration)

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-015 POS** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-015-001` (permanent) |
| Parent Module | `MOD-015` — POS |
| Parent Sprint Plan | [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Small |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-015-002` … `SPR-MOD-015-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **POS Foundation** for BusinessOS: the Store and Counter master data; the counter-to-store hierarchy; the POS operations configuration namespace (denominations, rounding, discount limits per role, offline mode policy) resolved through `ENG-005`; and the numbering series for POS documents resolved through `ENG-017`. This foundation is the substrate on which every subsequent POS sprint — Cart/Offline Sale, Multi-Tender Payments & Receipts, Offers/Loyalty/Returns, and Day Close/Analytics — depends.

> **POS Ownership Convention.** The POS module owns the business semantics of the Store and Counter masters, the counter-to-store hierarchy, and the POS operations configuration (denominations, rounding, discount limits per role, offline mode policy). ERP Core Engines provide shared infrastructure (identity, authorization, permissions, audit, configuration, localization, document, rules, numbering, eventing, notification) but **MUST NOT** redefine POS business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects of POS Sale, POS Return, Cash Deposit, and Day Close transactions remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines — no POS sprint writes journal entries directly; MOD-002 consumes POS-published events through its own posting-rule bindings. Item, price list, and stock master remain exclusive to **MOD-005 Inventory** and are consumed read-only.

#### 1.1.1 Store and Counter Master Authority

The **Store** and **Counter** masters are authoritatively owned by MOD-015 POS. No other module MAY create, edit, archive, or independently maintain a parallel Store or Counter master. Downstream sprints and modules consume these masters through POS-owned read APIs authored in this and later sprints; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 POS Configuration Authority

**POS operations configuration** — **denominations**, **rounding**, **discount limits per role**, and **offline mode policy** — plus **numbering series for POS documents** is authoritatively owned by MOD-015 POS, in this sprint. These keys are registered under a company through this sprint and resolve deterministically via `ENG-005` in the tenant → company → context hierarchy. Downstream sprints (Cart/Offline Sale, Payments/Receipts, Offers/Loyalty/Returns, Day Close/Analytics) consume this configuration read-only.

#### 1.1.3 POS ↔ Platform, Accounting, Inventory, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. POS consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No POS sprint writes journal entries; downstream POS sprints emit events that Accounting consumes, but never redefine posting logic.
- **MOD-005 Inventory** owns Item, price list, and stock master data. POS consumes these read-only through Inventory APIs; POS sales in later sprints publish events that Inventory subscribes to for stock adjustment.
- **MOD-017 Analytics** owns cross-module KPI definitions. POS operational reports are surfaced by `SPR-MOD-015-005`; cross-module KPIs are never redefined by MOD-015.

Ownership boundaries SHALL NOT be redefined in downstream POS Sprint PRDs.

#### 1.1.4 Foundation Master Lifecycle Boundary

POS owns the lifecycle of every foundation master (Store, Counter) and the POS operations configuration lifecycle. Downstream sprints (Cart/Offline Sale; Multi-Tender Payments & Receipts; Offers/Loyalty/Returns; Day Close/Analytics) consume these entities and states without redefining their lifecycles.

### 1.2 In Scope

- Store master: create, edit, activate, deactivate, archive under a tenant/company; per-Store attributes (name, address, operating locale hint consumed via `ENG-006` where applicable).
- Counter master: create, edit, activate, deactivate, archive under a tenant/company; per-Counter attributes (name, parent-Store binding).
- Counter–Store hierarchy: each Counter references exactly one Store within the same company; enforced deterministically via `ENG-012`.
- POS operations configuration namespace initialized per company via `ENG-005`: denominations, rounding, discount limits per role, offline mode policy.
- Numbering series for POS documents registered per company via `ENG-005`; document numbers issue through `ENG-017` at document issuance time (POS Sale, POS Return, Cash Deposit, Day Close numbers are allocated in their originating sprints; the series themselves are registered here).
- Read-only consumption of Platform Identity (`ENG-001`) for the actor identity used in foundation lifecycle actions.
- Authorization on POS-foundation actions via `ENG-002`; permission registration for POS-foundation permissions via `ENG-003`.
- Audit emission via `ENG-004` for every foundation lifecycle transition and every configuration registration.
- Document classification for POS foundation artifacts via `ENG-007` where applicable.
- Locale-scoped labels on foundation entities via `ENG-006` where applicable.
- Structural validation (required fields, referential integrity, uniqueness, same-company Counter–Store invariant, valid denomination set, valid rounding rule, valid discount-limit-per-role bindings, valid offline mode policy) via `ENG-012` at capture time.
- Domain event `POSFoundationConfigured` published via `ENG-024` when the POS configuration namespace is initialized or materially updated for a company, so downstream sprints and modules can react without polling POS state. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.
- Notification emission via `ENG-025` on foundation lifecycle transitions where the tenant has configured a channel (e.g., store activation).

### 1.3 Out of Scope

- Cart composition; pricing and discount evaluation; supervisor-override rule for beyond-threshold discounts; offline resilience for sale capture; POS Sale transaction lifecycle; `POSSaleCompleted` publication — `SPR-MOD-015-002`.
- Multi-tender payment capture; payment terminal integration; receipt generation and reprint; notification of receipt — `SPR-MOD-015-003`.
- Offer master; Loyalty Program master; gift cards; POS Return transaction; return-window rule; `OfferPublished` consumption; `POSReturnProcessed` publication — `SPR-MOD-015-004`.
- Cash Deposit and Day Close transactions; mismatched-cash approval rule; operational POS reports and dashboards; bulk exports; `POSDayClosed` publication; `InventoryLowStock` consumption; audit-readiness surface; POS read model — `SPR-MOD-015-005`.
- Financial postings for POS Sale, POS Return, Cash Deposit, and Day Close — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Item, price list, and stock master authoring — owned by MOD-005 Inventory.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-015-001`, the following will exist:

- **Business capabilities.**
  - A Store Manager can create, edit, activate, deactivate, and archive Store and Counter records under a tenant/company.
  - A Store Manager can bind Counters to their parent Store within the same company; the Counter–Store linkage is enforced deterministically via `ENG-012`.
  - A Store Manager can register POS operations configuration (denominations, rounding, discount limits per role, offline mode policy) per company; configuration resolves deterministically via `ENG-005`.
  - Numbering series for POS documents are registered per company; document numbers issue deterministically via `ENG-017` at document issuance in downstream sprints.
  - Identity linkage for actor actions is consumed read-only from `ENG-001` — no credentials are minted.
- **Domain events.**
  - `POSFoundationConfigured` is published via `ENG-024` when the POS configuration namespace is initialized or materially updated for a company. Payload contract is governed by the authoritative event catalog and not redefined here.
- **Configuration artifacts.** POS configuration namespace initialized for each company via `ENG-005` (denominations, rounding, discount limits per role, offline mode policy, numbering series). No module-specific keys are registered outside POS's own ownership boundary.
- **Audit artifacts.** An audit record exists for every POS-foundation lifecycle transition and every configuration registration, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Foundation lifecycle transitions produce notifications via `ENG-025` under the tenant's configured channels where enabled.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-015-001`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-015 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — POS primitives and personas | Store / Counter masters and POS Ownership Convention |
| §2 Business Scope — foundation surface for submodules Cart, Payments, Offers, Day Close, Loyalty | Store / Counter masters and POS operations configuration namespace |
| §3 Personas — Cashier, Store Manager; Accountant, Inventory Controller; Customer, Payment Terminal | User stories (§4) |
| §5 Master Data — Store, Counter | Both masters delivered in this sprint |
| §7 Business Rules — foundation invariants (tenancy, referential integrity, same-company Counter–Store composition, valid configuration entries) | Enforceable rules via `ENG-012` |
| §10 Configuration — denominations; rounding; discount limits per role; offline mode policy | POS configuration namespace via `ENG-005`; numbering series registered here for consumption via `ENG-017` in downstream sprints |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved POS Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) §4.1 does not allocate any Module PRD §2 capability as originating to `SPR-MOD-015-001`; instead this sprint delivers the **foundation surface** required by every §2 capability's originating sprint. Per Sprint Plan §4.3, the master-data entities **Store** and **Counter** are each originating-allocated to `SPR-MOD-015-001`.

| Master Data (Module PRD §5) | Origin Sprint |
| --- | --- |
| Store | `SPR-MOD-015-001` |
| Counter | `SPR-MOD-015-001` |

These master-data allocations are unique; no other POS sprint claims "Store" or "Counter" as its originating master. No §2 capability is originating-allocated in more than one sprint.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §5 master-data entities *Store* and *Counter*, Module PRD §10 configuration entries *denominations*, *rounding*, *discount limits per role*, *offline mode policy*, and the numbering-series surface for §6 transactions → this Sprint PRD → deliverables in §2 (Store, Counter masters, Counter–Store hierarchy, POS operations configuration namespace, numbering-series registration, `POSFoundationConfigured` publication, notifications on foundation lifecycle transitions, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Store Manager, I want to create, edit, activate, deactivate, and archive Stores under a company (including name, address, and operating-locale hint), so that a coherent Store register exists before any cart, payment, offer, return, or day-close operation.*
- **US-002.** *As a Store Manager, I want to create, edit, activate, deactivate, and archive Counters under a company (including name and parent-Store binding), so that Counter-driven behavior in later sprints references an authoritative catalog.*
- **US-003.** *As a Store Manager, I want the Counter–Store hierarchy to require same-company composition, so that Counters cannot be bound to Stores in a different company under concurrent edits.*
- **US-004.** *As a Store Manager, I want to register POS operations configuration (denominations, rounding, discount limits per role, offline mode policy) per company, so that Cart, Payment, Offer, Return, and Day Close operations in later sprints resolve their configuration deterministically.*
- **US-005.** *As a Store Manager, I want numbering series for POS documents to be registered per company, so that document numbers for POS Sale, POS Return, Cash Deposit, and Day Close in later sprints issue deterministically at document issuance via `ENG-017`.*
- **US-006.** *As a Store Manager, I want the actor identity used for foundation lifecycle actions to be consumed read-only from `ENG-001`, so that identity, authentication, and permissions remain owned by MOD-001 while POS captures the master relationships.*
- **US-007.** *As a downstream subscriber (Cart/Offline Sale, Payments/Receipts, Offers/Loyalty/Returns, Day Close/Analytics, and cross-module consumers), I want `POSFoundationConfigured` to be published when the POS configuration namespace is initialized or materially updated for a company, so that downstream sprints and modules can react without polling POS state.*
- **US-008.** *As a Store Manager, I want notifications on POS-foundation lifecycle transitions under the tenant's configured channels, so that store/counter onboarding is actionable.*
- **US-009.** *As a security reviewer, I want every POS-foundation lifecycle transition and every configuration registration to be audited via `ENG-004`, so that I can reconstruct Store, Counter, and configuration history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Store master (US-001)

- **Given** a valid Store creation request under a tenant/company,
  **when** a Store Manager submits it,
  **then** the Store is persisted with a stable identifier, uniquely identified within the company, and audited.

### 5.2 Counter master and Counter–Store hierarchy (US-002, US-003)

- **Given** a valid Counter creation request under a tenant/company (including parent-Store binding in the same company),
  **when** a Store Manager submits it,
  **then** the Counter is persisted with a stable identifier, uniquely identified within the company, bound to its parent Store, and audited.
- **Given** an attempt to bind a Counter to a Store in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically via `ENG-012`.

### 5.3 POS operations configuration (US-004)

- **Given** a company under an active tenant,
  **when** denominations, rounding, discount limits per role, and offline mode policy are registered,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a downstream sprint querying a configuration key registered by this sprint,
  **when** it queries the key by identifier,
  **then** it receives the deterministic value resolved for its (tenant, company) scope.
- **Given** an invalid configuration entry (e.g., duplicate denomination, undefined rounding rule, discount limit bound to an undefined role, invalid offline mode policy),
  **when** registration is attempted,
  **then** the request is rejected deterministically via `ENG-012`.

### 5.4 Numbering series registration (US-005)

- **Given** a company under an active tenant,
  **when** numbering series for POS documents (POS Sale, POS Return, Cash Deposit, Day Close) are registered,
  **then** each series is persisted and resolvable via `ENG-005`; document-number allocation itself executes through `ENG-017` at issuance time in the originating downstream sprint; allocated numbers are immutable thereafter.

### 5.5 Identity consumption (US-006)

- **Given** any POS-foundation lifecycle action,
  **when** it executes,
  **then** the actor identity is resolved read-only via `ENG-001`; no credentials are minted by POS.

### 5.6 `POSFoundationConfigured` publication (US-007)

- **Given** a POS configuration namespace initialized or materially updated for a company,
  **when** the transaction commits,
  **then** `POSFoundationConfigured` is published via `ENG-024` exactly once per (tenant, company, configuration revision), using the authoritative envelope and payload contract governed by the event catalog.

### 5.7 Notifications (US-008)

- **Given** a POS-foundation lifecycle transition where the tenant has configured a channel,
  **when** the transition commits,
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.8 Audit integration (US-009)

- **Given** any POS-foundation lifecycle transition (Store / Counter / configuration create, update, activate, deactivate, archive; numbering-series registration),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any POS-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.10 Authorization invariants (`ADR-032`)

- **Given** any POS-foundation action,
  **when** it executes,
  **then** it is authorized via `ENG-002` against permissions registered by `ENG-003` under the RBAC + ABAC model; unauthorized actions are rejected before any state change.

### 5.11 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Store, Counter, or POS operations configuration data,
  **when** it reads these masters/registrations,
  **then** it does so exclusively through POS-owned events (`POSFoundationConfigured` here; additional events in later sprints) and POS read APIs. No downstream module creates an independent Store, Counter, or POS operations configuration master.
- **Given** any POS code path that requires Identity data,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.
- **Given** any POS transaction (in later sprints) that has ledger effects,
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through the corresponding POS-published events; no POS code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.
- **Given** any POS code path that requires Item, price list, or stock data,
  **when** it needs Inventory master data,
  **then** it consumes it read-only through MOD-005 Inventory APIs; the Inventory masters are not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-015` — POS.
- **Module PRD:** [`docs/20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (foundation surface for submodules Cart, Payments, Offers, Day Close, Loyalty), §3 (Cashier, Store Manager; Accountant, Inventory Controller; Customer, Payment Terminal), §5 (Store, Counter), §7 (foundation invariants), §10 (denominations, rounding, discount limits per role, offline mode policy; numbering series), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-015` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (consumed indirectly by later POS sprints via published events; not invoked from this sprint).
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — Item, price list, and stock master (consumed indirectly by later POS sprints via read-only APIs; not invoked from this sprint).
- **Upstream sprint dependencies (per Sprint Plan §2):** None (POS sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, and `MOD005_INVENTORY_BASELINE_v1`.
- **Downstream sprints:** `SPR-MOD-015-002` (Cart, Pricing, Discounts & Offline Sale), `SPR-MOD-015-003` (Multi-Tender Payments & Receipts), `SPR-MOD-015-004` (Offers, Loyalty & Returns), `SPR-MOD-015-005` (Day Close, Analytics & Compliance) — per [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md).

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
| `ENG-001` Identity | Provides the Cashier / Store Manager / Accountant / Inventory Controller identity used for foundation lifecycle actions and read-only binding to Platform users. |
| `ENG-002` Authorization | Enforces authorization on POS-foundation actions. |
| `ENG-003` Permission Management | Registers POS-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every POS-foundation lifecycle transition and every configuration registration. |
| `ENG-005` Configuration | Resolves POS operations configuration (denominations, rounding, discount limits per role, offline mode policy) and numbering-series registration under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for Store, Counter, and configuration content where applicable. |
| `ENG-007` Document | Provides document classification for POS-foundation artifacts where applicable. |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, uniqueness, same-company Counter–Store composition, valid denomination set, valid rounding rule, valid discount-limit-per-role bindings, valid offline mode policy) at capture time. |
| `ENG-017` Numbering | Registers numbering series for POS documents here; allocation of document numbers executes at issuance time in downstream sprints. |
| `ENG-024` Eventing | Publishes `POSFoundationConfigured` when the POS configuration namespace is initialized or materially updated for a company. |
| `ENG-025` Notification | Emits notifications on foundation lifecycle transitions under the tenant's configured channels. |

POS business semantics (Store, Counter, Counter–Store hierarchy, POS operations configuration namespace, numbering-series registration) are owned by this module and are not delegated to any engine.

`ENG-015` Voucher and `ENG-016` Posting are declared as Required by the Module PRD §12 but are **not** consumed by this sprint per Sprint Plan §2 (`SPR-MOD-015-001`) — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by POS-published events in later sprints.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every POS-foundation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to POS-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Store | MOD-015 (this sprint) | Named retail store scoped to a tenant/company, with zero or more Counters within the same company. |
| Counter | MOD-015 (this sprint) | Named POS counter scoped to a tenant/company, referencing exactly one parent Store within the same company. |
| POS Configuration | MOD-015 (this sprint, configuration-scoped) | POS operations configuration namespace per company resolved via `ENG-005` (denominations, rounding, discount limits per role, offline mode policy). |
| POS Numbering Series | MOD-015 (this sprint, configuration-scoped) | Numbering-series registration per company for POS documents (POS Sale, POS Return, Cash Deposit, Day Close); allocation via `ENG-017` at issuance in downstream sprints. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Stores**, zero or more **Counters**, one **POS Configuration** namespace, and one **POS Numbering Series** registration set.
- A **Counter** references exactly one parent **Store** within the same company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-015` per the POS Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a POS-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as POS-owned entities.
- The **Item**, **Price List**, and **Stock** entities are owned by MOD-005 Inventory; they are not POS-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`POSFoundationConfigured`** — published via `ENG-024` when the POS configuration namespace is initialized or materially updated for a company. Per Sprint Plan §2 (`SPR-MOD-015-001`), this is the single domain event originated by this sprint. Additional POS-lifecycle events (`POSSaleCompleted`, `POSReturnProcessed`, `POSDayClosed`) are originated by later POS sprints per Module PRD §8.

### 11.2 Consumed

None in this sprint. Consumption of `OfferPublished` is scoped to `SPR-MOD-015-004`, and consumption of `InventoryLowStock` is scoped to `SPR-MOD-015-005`; neither occurs here.

Payload contracts for POS events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every POS-foundation read and write.
- [ ] Every POS-foundation lifecycle transition and every configuration registration produces an audit record via `ENG-004`.
- [ ] POS configuration namespace is initialized per company via `ENG-005` (denominations, rounding, discount limits per role, offline mode policy).
- [ ] Numbering series for POS documents are registered per company and resolvable at issuance time via `ENG-017` in downstream sprints.
- [ ] Counter–Store same-company invariant is enforced via `ENG-012` at capture time.
- [ ] `POSFoundationConfigured` is published via `ENG-024` on every configuration initialization or material update, exactly once per (tenant, company, configuration revision).
- [ ] Notifications are emitted via `ENG-025` on foundation lifecycle transitions under the tenant's configured channels where enabled.
- [ ] Actor identity for foundation lifecycle actions is exercised end-to-end read-only against `ENG-001`; no credentials are minted by POS.
- [ ] No POS code path writes to `ENG-015` Voucher or `ENG-016` Posting.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-015_SPRINT_PLAN.md` §2 (`SPR-MOD-015-001`):

- Store and Counter records can be created, edited, and archived under a tenant/company.
- Counter–store hierarchy is enforced deterministically via `ENG-012`.
- POS configuration (denominations, rounding, discount limits per role, offline mode policy) is resolvable via `ENG-005` in the tenant → company → context hierarchy.
- Document numbers for POS transactions issue through `ENG-017`.
- All state changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-015 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-015 depends on `MOD002_ACCOUNTING_BASELINE_v1` being frozen and stable. Although this sprint does not itself invoke posting, later POS sprints depend on MOD-002's event-binding contract for sale, return, cash-deposit, and day-close effects.
  - **Impact:** Any drift in MOD-002 posting-rule bindings would decouple later POS events from ledger effects.
  - **Mitigation:** Consume MOD-002 posting bindings per their authoritative contract in later sprints; escalate any change as an Accounting defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-015 depends on `MOD005_INVENTORY_BASELINE_v1` being frozen and stable. Although this sprint does not itself consume Inventory reads, later POS sprints depend on MOD-005's Item, price list, and stock master.
  - **Impact:** Any drift in MOD-005 read APIs would decouple later POS operations from Inventory data.
  - **Mitigation:** Consume MOD-005 read APIs per their authoritative contract in later sprints; escalate any change as an Inventory defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Later POS sprints (`SPR-MOD-015-002` … `SPR-MOD-015-005`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** POS-owned entities (Store, Counter, POS operations configuration, POS numbering series) MUST NOT be redefined by downstream modules; MOD-005-owned Item/price-list/stock and MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Store & Counter Master Authority convention (§1.1.1), the POS Configuration Authority (§1.1.2), and the cross-module boundary (§1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 1 publishes `POSFoundationConfigured`. Downstream POS sprints declare additional published events (`POSSaleCompleted`, `POSReturnProcessed`, `POSDayClosed`) and consume `OfferPublished` and `InventoryLowStock`. Any event name not yet present in the authoritative event catalog at their authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint that publishes/consumes them, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** For `POSFoundationConfigured` — confirm event catalog registration before this sprint enters `In Progress`. For later events — handle in each downstream sprint's own §14. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Store, Counter, POS-configuration validation; Counter–Store same-company invariant; denomination-set validity; rounding-rule validity; discount-limit-per-role binding validity; offline-mode-policy validity.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, actor identity resolution via `ENG-001`, authorization via `ENG-002`, permission registration via `ENG-003`, structural validation via `ENG-012`, numbering-series registration via `ENG-017`, event publication via `ENG-024`, notification emission via `ENG-025`.
- **Contract** — `POSFoundationConfigured` payload contract per the authoritative event catalog.
- **End-to-end (smoke)** — Store creation → Counter binding → POS-configuration registration → numbering-series registration → `POSFoundationConfigured` publication → notification emission, with audit records at each step; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, a configuration-registration fixture, and a Platform-Identity read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Store, Counter, and POS-configuration lifecycles as small state machines so audit emission (§5.8) is trivially satisfiable at every transition.
- Consider validating tenancy and same-company invariants (Counter ↔ Store) at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating POS configuration initialization with company activation events emitted by MOD-001 so the POS configuration namespace is ready before the first Store record.
- Consider centralizing the `POSFoundationConfigured` publication path so downstream sprints that add fields to the payload (per the authoritative event catalog) touch a single emission point.
- Consider registering the discount-limit-per-role binding against the RBAC role identifiers owned by MOD-001, so `ENG-012` evaluation in `SPR-MOD-015-002` supervisor-override can resolve the role deterministically without introducing a parallel role table.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-015-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the POS Foundation — Store and Counter masters, Counter–Store hierarchy, POS operations configuration (denominations, rounding, discount limits per role, offline mode policy), numbering-series registration, identity consumption, `POSFoundationConfigured` publication, and audit (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-015 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the POS Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates cart/offline sale, payments/receipts, offers/loyalty/returns, day close/analytics, MOD-002-owned ledger postings, MOD-005-owned Item/price-list/stock, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-015-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-015-002` Cart, Pricing, Discounts & Offline Sale is the immediate successor per [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-015-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- Precedent Foundation Sprint PRDs — [`../fleet/SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md`](../fleet/SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md), [`../assets/SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md`](../assets/SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md), [`../field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md`](../field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md), [`../amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md`](../amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
