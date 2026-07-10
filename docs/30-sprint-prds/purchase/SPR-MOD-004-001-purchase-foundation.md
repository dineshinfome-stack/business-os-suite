---
title: "SPR-MOD-004-001 — Purchase Foundation"
summary: "Sprint PRD for the foundational purchase layer of MOD-004 Purchase: supplier master, supplier categorisation, buyer master, purchasing organization, terms & conditions master, purchase price list master, purchasing configuration, purchasing numbering readiness, and purchase-foundation events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Procurement"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-004-001"
parent_module: "MOD-004"
parent_sprint_plan: "MOD-004_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "8.6.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-017", "ENG-018", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "purchase", "mod-004", "foundation", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-004-001 — Purchase Foundation

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-004 Purchase** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-004-001` (permanent) |
| Parent Module | `MOD-004` — Purchase |
| Parent Sprint Plan | [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (all frozen) |
| Downstream Sprints | `SPR-MOD-004-002` … `SPR-MOD-004-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Purchase Foundation** for BusinessOS: the supplier master and its lifecycle, supplier categorisation and classification, buyer master, purchasing organization structure (purchasing branches, buyer groups), terms & conditions master, purchase price list master, purchasing configuration namespace, purchasing numbering readiness, and audit integration for purchase-foundation lifecycle events. This foundation is the substrate that every subsequent Purchase sprint — requisitions/RFQs/POs, goods receipt, vendor billing, returns, and analytics — depends on. It is also the authoritative source of Supplier master data consumed by other operational modules (Inventory, Accounting for payables reference, Analytics).

> **Purchase Ownership Convention.** The Purchase module owns the business semantics of the Supplier master, supplier categorisation, buyer master, purchasing organization, terms & conditions, purchase price list, and purchasing configuration. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, numbering, currency, eventing) but **MUST NOT** redefine purchase business rules. Downstream modules consume Supplier master data and purchasing services rather than introducing independent supplier masters or parallel purchasing structures. This complements — and does not redefine — the Platform governance conventions (`MOD001_PLATFORM_BASELINE_v1`), the Accounting ownership conventions (`MOD002_ACCOUNTING_BASELINE_v1`), and the Sales ownership conventions (`MOD003_SALES_BASELINE_v1`).

#### 1.1.1 Supplier Master Authority

The Supplier master is authoritatively owned by MOD-004 Purchase. No other module MAY create, edit, archive, or independently maintain a parallel Supplier master. Downstream modules (Inventory, Accounting for payables reference, Analytics — as applicable) consume Supplier master data via published events and read APIs; they MUST NOT redefine the supplier entity, its categorisation, or its lifecycle.

#### 1.1.2 Commercial Ownership Boundary (Purchase ↔ Accounting ↔ Inventory ↔ Sales)

Ownership boundaries at the Purchase Foundation layer:

- **Purchase owns** the supplier master, purchasing organization structure, buyers, terms & conditions master, purchase price list master, and purchasing configuration; and, in downstream sprints, the commercial procurement document lifecycle (requisitions, RFQs, POs, goods receipt, vendor bills, returns, debit notes).
- **Accounting owns** accounting vouchers, journal posting, ledger posting, taxation, financial reporting, payables ledger, payment execution, and accounting period governance. Purchase MUST NOT create accounting journals, ledger entries, or independently manage accounting voucher lifecycles.
- **Inventory owns** item master, stock ledger, putaway, and inventory reservation semantics. Purchase produces warehouse-handover contracts at goods receipt (downstream sprint); it does not redefine inventory ownership.
- **Sales owns** the Customer master. Purchase MUST NOT redefine customer ownership.

Ownership boundaries SHALL NOT be redefined in downstream Purchase Sprint PRDs.

#### 1.1.3 Purchase Configuration Authority

Purchase configuration (approval thresholds, preferred supplier defaults, numbering series registration, tolerance settings for match, purchase-return-window defaults) is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline. No module-specific configuration keys are registered outside Purchase's own ownership boundary.

#### 1.1.4 Supplier Lifecycle Boundary

Purchase owns the supplier lifecycle (create, activate, suspend, block, archive) and supplier commercial classification (category, group, buyer assignment, purchasing organization assignment). Financial standing of a supplier — outstanding payables, payment status — is **consumed** from Accounting; it is not redefined here.

### 1.2 In Scope

- Supplier master: creation, editing, archival; supplier identifiers; commercial classification; blocked-supplier flag registration (rule *evaluation* is delivered in `SPR-MOD-004-002` via `ENG-012`).
- Supplier categorisation and supplier groups: classification taxonomy.
- Supplier status: active, suspended, blocked, archived lifecycle transitions.
- Supplier contacts and supplier addresses (billing, remit-to, and other business addresses).
- Buyer master: definition, activation, buyer group assignment.
- Purchasing organization: purchasing branches, buyer groups under the tenant/company hierarchy established by the Platform baseline.
- Terms & conditions master: named T&C templates referenced by later purchase documents.
- Purchase price list master: named price lists referenced by later purchase documents.
- Supplier ↔ purchasing organization ↔ buyer assignment rules.
- Purchase configuration: approval thresholds, preferred supplier defaults, tolerance settings for match, return-window defaults — resolved via `ENG-005`.
- Purchase numbering readiness: registration of the purchase-document numbering series (purchase requisition, RFQ, purchase order, goods receipt note, purchase invoice, debit note) via `ENG-017`. Numbering *consumption* by those document types is delivered by downstream Purchase sprints; only the series registration and resolution readiness are in scope here.
- Purchase master validation invariants (uniqueness, referential integrity, tenancy).
- Audit integration for every purchase-foundation lifecycle transition via `ENG-004`.
- Events published (see §11): `supplier.created`, `supplier.updated`, `supplier.activated`, `supplier.deactivated`, `buyer.created`, `purchasing-organization.updated` — delivered via `ENG-024`, subject to authoritative event-catalog resolution (see §11 and `R-EV-01`).

### 1.3 Out of Scope

Reserved for later Purchase sprints (see [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)):

- Purchase requisition, RFQ, supplier comparison, purchase order lifecycle, approval routing, pricing/discount evaluation — `SPR-MOD-004-002`.
- Goods receipt, inspection hold, tolerance validation, warehouse-handover contracts — `SPR-MOD-004-003`.
- Vendor bill / purchase invoice lifecycle, 3-way match, tax determination, payables creation contracts, accounting voucher handoff — `SPR-MOD-004-004`.
- Purchase returns and debit-note issuance — `SPR-MOD-004-005`.
- Purchase analytics, purchasing KPIs, spend analytics, supplier performance, 3-way match exception review — `SPR-MOD-004-006`.
- Accounting vouchers, journal posting, ledger posting, taxation calculation, payables ledger, payment execution — owned by MOD-002 Accounting; consumed via `MOD002_ACCOUNTING_BASELINE_v1`.
- Inventory item master, stock ledger, putaway, reservation semantics — owned by MOD-005 Inventory.
- Customer master and sales-side lifecycles — owned by MOD-003 Sales; consumed via `MOD003_SALES_BASELINE_v1`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-004-001`, the following will exist:

- **Business capabilities.**
  - A purchase administrator can create, edit, and archive suppliers under a tenant/company, with coherent supplier categorisation and classification.
  - Supplier contacts and supplier addresses (billing, remit-to, other) can be maintained on every supplier.
  - A purchase administrator can define purchasing branches and buyer groups under the tenant/company hierarchy.
  - Buyers can be defined and assigned to buyer groups and suppliers deterministically.
  - Terms & conditions templates and purchase price lists can be created, edited, and archived.
  - Purchase configuration (thresholds, preferred supplier defaults, tolerance settings, return-window) is resolved deterministically per company through `ENG-005`.
  - Purchase-document numbering series are registered and resolvable via `ENG-017` (consumption by document types occurs in downstream sprints).
- **Published events.** Six purchase-foundation event contracts (see §11) registered in the event catalog and emitted by the corresponding lifecycle transitions.
- **Configuration artifacts.** Purchase configuration namespace initialized for each company via `ENG-005`. No module-specific keys are registered outside Purchase's own ownership boundary.
- **Audit artifacts.** An audit record exists for every purchase-foundation lifecycle transition, produced via `ENG-004`, in a form consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-004-001`.
  - Purchase-foundation event entries in the event catalog referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

Bidirectional traceability. Every Sprint-1 capability traces back to an approved MOD-004 Module PRD section, and every relevant Module PRD section covered by Sprint 1 traces forward to a deliverable below.

| MOD-004 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Purchase primitives and personas | Supplier master and purchase-foundation ownership convention |
| §2 Business Scope — foundation surface for procurement submodules | Supplier master, supplier categorisation, buyer master, purchasing organization |
| §3 Personas — Buyer, Procurement Manager, Stores Officer | User stories (§4) |
| §5 Master Data — Supplier, Purchase Price List, Terms & Conditions, Buyer | Supplier, supplier contacts/addresses, buyer, T&C master, purchase price list master |
| §7 Business Rules — supplier commercial invariants; blocked-supplier flag registration | Enforceable classification, tenancy, and lifecycle invariants; blocked-supplier flag registered (evaluation in `SPR-MOD-004-002` via `ENG-012`) |
| §8 Integration Points — Supplier master consumption; `SupplierCreated` (consumed) | Downstream consumption contracts through `ENG-024` events; consumer contract for cross-module supplier lifecycle notifications |
| §10 Configuration — Approval thresholds, Preferred supplier defaults, Numbering series, Tolerance settings for match | Purchase configuration namespace via `ENG-005`; numbering series registration via `ENG-017` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Purchase Module PRD, and no capability approved for Sprint 1 in `MOD-004_SPRINT_PLAN.md` is orphaned from this Sprint PRD** (unique originating allocation preserved).

---

## 4. User Stories

- **US-001.** *As a purchase administrator, I want to create, edit, and archive suppliers under a company, so that a coherent supplier master exists before any requisition or purchase order is created.*
- **US-002.** *As a purchase administrator, I want to classify suppliers by category and group, so that downstream comparison, approval, and reporting sprints can rely on deterministic classifications.*
- **US-003.** *As a purchase administrator, I want to maintain supplier contacts and multiple addresses (billing, remit-to, other), so that commercial documents can resolve the correct party addresses.*
- **US-004.** *As a procurement manager, I want to define purchasing branches and buyer groups, so that suppliers and buyers can be assigned to a deterministic purchasing organization.*
- **US-005.** *As a procurement manager, I want to define buyers and assign them to buyer groups and suppliers, so that ownership of supplier relationships is unambiguous.*
- **US-006.** *As a procurement manager, I want to maintain a terms & conditions master and a purchase price list master, so that later purchase documents reference stable templates and lists.*
- **US-007.** *As an admin, I want to configure approval thresholds, preferred supplier defaults, tolerance settings, and return-window defaults per company, so that later Purchase sprints resolve configuration deterministically.*
- **US-008.** *As an admin, I want purchase-document numbering series to be registered and resolvable, so that downstream Purchase sprints can consume them without redefining numbering.*
- **US-009.** *As a downstream module (system persona), I want to receive `supplier.*`, `buyer.*`, and `purchasing-organization.*` events, so that I can react to purchase-foundation transitions in a decoupled way.*
- **US-010.** *As a security reviewer, I want every purchase-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the supplier master and purchasing-organization history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Supplier master (US-001, US-002, US-003)

- **Given** a valid supplier creation request under a tenant/company,
  **when** a purchase admin submits it,
  **then** the supplier is persisted with a stable identifier and its identifiers are unique within the company.
- **Given** a valid supplier update that maintains referential integrity,
  **when** a purchase admin submits it,
  **then** the update is persisted and audited.
- **Given** a supplier with dependent commercial references (created in later sprints),
  **when** archival is attempted,
  **then** archival is either permitted with a clean lifecycle transition or rejected deterministically per the supplier lifecycle rules established here.
- **Given** a valid supplier contact or address (billing, remit-to, other),
  **when** a purchase admin submits it against an active supplier,
  **then** the contact or address is persisted, uniquely identified within the supplier, and audited.

### 5.2 Supplier categorisation and classification (US-002)

- **Given** a valid supplier category and supplier group taxonomy,
  **when** a supplier is classified against them,
  **then** the classification is persisted and consumable by downstream sprints.
- **Given** a supplier flagged as blocked,
  **when** the flag is set or cleared,
  **then** the transition is persisted and audited; downstream evaluation of the block rule is delivered by `SPR-MOD-004-002` via `ENG-012`.

### 5.3 Purchasing organization (US-004)

- **Given** a valid purchasing branch or buyer group definition under an active company,
  **when** a procurement manager submits it,
  **then** the entity is persisted under the tenant/company hierarchy established by the Platform baseline.
- **Given** an attempt to define a purchasing organization entity that violates tenancy or hierarchy invariants,
  **when** the request is submitted,
  **then** the request is rejected deterministically and no partial state is left behind.

### 5.4 Buyers (US-005)

- **Given** a valid buyer definition,
  **when** a procurement manager submits it,
  **then** the entity is persisted with a stable identifier and can be assigned to buyer groups and suppliers.
- **Given** a supplier without a buyer assignment,
  **when** assignment is submitted,
  **then** the assignment is persisted deterministically and audited.

### 5.5 Terms & conditions and purchase price list masters (US-006)

- **Given** a valid terms & conditions template or purchase price list under an active company,
  **when** it is created, updated, or archived,
  **then** the transition is persisted, uniquely identified within the company, and audited.

### 5.6 Purchase configuration and numbering readiness (US-007, US-008)

- **Given** a company under an active tenant,
  **when** approval thresholds, preferred supplier defaults, tolerance settings, and return-window defaults are configured,
  **then** the values resolve deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a purchase-document numbering series registered under a company,
  **when** it is queried by identifier,
  **then** it resolves deterministically via `ENG-017`. (Consumption by specific document types is delivered by downstream Purchase sprints.)

### 5.7 Audit integration (US-010)

- **Given** any purchase-foundation lifecycle transition (supplier / contact / address / category / group / purchasing branch / buyer group / buyer / T&C / price list / assignment / configuration create or update),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.8 Events (US-009)

- **Given** a purchase-foundation lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any purchase-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.10 Ownership consumption invariants

- **Given** any downstream module (Inventory, Accounting for payables reference, Analytics) requiring supplier data,
  **when** it reads or reacts to supplier lifecycle,
  **then** it does so exclusively through Purchase-owned events and read APIs. No downstream module creates an independent supplier master.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-004` — Purchase.
- **Module PRD:** [`docs/20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (foundation surface), §3 (Buyer, Procurement Manager, Stores Officer), §5 (Supplier, Purchase Price List, Terms & Conditions, Buyer), §7 (supplier commercial invariants; blocked-supplier flag registration), §8 (Supplier master consumption; `SupplierCreated` consumed), §10 (Approval thresholds, Preferred supplier defaults, Numbering series, Tolerance settings for match), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-004` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting ownership conventions. Not directly consumed at the Purchase Foundation layer but declared as upstream so ownership boundaries are respected in downstream Purchase sprints.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Customer master ownership boundary. Purchase MUST NOT redefine customer ownership.
- **Upstream sprint dependencies:** None (Purchase Sprint 1). Sequenced immediately after Stage 1 planning per [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md).
- **Downstream sprints:** `SPR-MOD-004-002` (Requisitions, RFQs & Purchase Orders), `SPR-MOD-004-003` (Goods Receipt & Inspection), `SPR-MOD-004-004` (Vendor Billing & 3-Way Match), `SPR-MOD-004-005` (Purchase Returns & Debit Notes), `SPR-MOD-004-006` (Purchase Analytics & Controls) — per [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md).
- **Downstream module consumers of Supplier master:** `MOD-005` Inventory, `MOD-002` Accounting (payables reference), `MOD-017` Analytics — consuming exclusively via events and read APIs. Module identifiers resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md).

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Purchase Ownership Convention in §1.1). See each engine's specification for capability details.

One-line usage note per engine. Every engine identifier SHALL resolve verbatim from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 1 allocation in [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md). No placeholder, deprecated, undefined, or additional engine identifiers are permitted.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the purchase-administrator and procurement-manager identity used for foundation lifecycle actions. |
| `ENG-002` Authorization | Enforces authorization on purchase-foundation actions. |
| `ENG-003` Permission Management | Registers purchase-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every purchase-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves purchase configuration (approval thresholds, preferred supplier defaults, tolerance settings, return-window) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for purchase master data where applicable. |
| `ENG-017` Numbering | Registers and resolves purchase-document numbering series. Consumption by document types occurs in downstream sprints. |
| `ENG-018` Currency | Resolves the default reporting currency reference on the supplier master and purchase price list master; currency semantics are consumed, not redefined. |
| `ENG-024` Eventing | Publishes purchase-foundation events with the contracts declared in §11. |

Purchase business semantics (supplier master, categorisation, buyer master, T&C master, purchase price list master, purchasing organization semantics, buyer assignment) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every purchase-foundation read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to purchase-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Supplier | MOD-004 (this sprint) | Commercial party owned by Purchase; carries commercial classification and lifecycle status. |
| Supplier Category | MOD-004 (this sprint) | Taxonomy classifying suppliers for comparison/reporting downstream. |
| Supplier Group | MOD-004 (this sprint) | Classification grouping applied to suppliers. |
| Supplier Contact | MOD-004 (this sprint) | Named contact person on a supplier. |
| Supplier Address | MOD-004 (this sprint) | Billing, remit-to, or other business address on a supplier. |
| Purchasing Organization | MOD-004 (this sprint) | Commercial procurement container under the tenant/company hierarchy. |
| Purchasing Branch | MOD-004 (this sprint) | Branch-level procurement container under a purchasing organization. |
| Buyer Group | MOD-004 (this sprint) | Grouping of buyers under a purchasing organization. |
| Buyer | MOD-004 (this sprint) | Named buyer associated with an identity. |
| Terms & Conditions Template | MOD-004 (this sprint) | Named T&C template referenced by later purchase documents. |
| Purchase Price List | MOD-004 (this sprint) | Named price list referenced by later purchase documents. |
| Purchase Configuration | MOD-004 (this sprint, configuration-scoped) | Purchase configuration namespace per company resolved via `ENG-005`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **suppliers**, **purchasing organizations**, **buyer groups**, **T&C templates**, and **purchase price lists**.
- A **supplier** belongs to zero or one **supplier group** and zero or one **supplier category**.
- A **supplier** owns zero or more **supplier contacts** and zero or more **supplier addresses**.
- A **purchasing branch** belongs to exactly one **purchasing organization**; a **buyer group** is scoped to exactly one purchasing organization.
- A **supplier** MAY be assigned to at most one **buyer** or **buyer group** per procurement context.
- A **purchase configuration** belongs to exactly one company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-004` per the Purchase Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Financial standing of a supplier (payables, payment status) is consumed from Accounting; it is not represented as a Purchase-owned entity.
- Inventory item master, stock, putaway, and reservations are consumed from Inventory; they are not represented as Purchase-owned entities.
- Customer master is owned by Sales; it is not represented as a Purchase-owned entity.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Only event names present verbatim in the authoritative event catalog are used. Any illustrative event below that does not resolve at authoring time is either replaced with its authoritative equivalent or deferred as `R-EV-*` in §14. The Event Catalog is **not** modified by this sprint.

| Event Name (subject to catalog resolution) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `supplier.created` | MOD-004 | SPR-MOD-004-001 | MOD-004 (self), MOD-005 (Inventory), MOD-002 (Accounting, payables reference), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `supplier.updated` | MOD-004 | SPR-MOD-004-001 | MOD-004 (self), MOD-005, MOD-002, MOD-017 | At-least-once, ordered per tenant |
| `supplier.activated` | MOD-004 | SPR-MOD-004-001 | MOD-004 (self), MOD-005, MOD-002, MOD-017 | At-least-once, ordered per tenant |
| `supplier.deactivated` | MOD-004 | SPR-MOD-004-001 | MOD-004 (self), MOD-005, MOD-002, MOD-017 | At-least-once, ordered per tenant |
| `buyer.created` | MOD-004 | SPR-MOD-004-001 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |
| `purchasing-organization.updated` | MOD-004 | SPR-MOD-004-001 | MOD-004 (self), MOD-017 | At-least-once, ordered per tenant |

Additionally, `SupplierCreated` (per Module PRD §8) is a cross-module supplier-lifecycle notification **consumed** by this sprint from external sources (MOD-001 / MOD-002 identity/party sync). Its contract is not defined here.

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Purchase-foundation events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every purchase-foundation read and write.
- [ ] Every purchase-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] Purchase configuration namespace is initialized per company via `ENG-005` (approval thresholds, preferred supplier defaults, tolerance settings, return-window).
- [ ] Purchase-document numbering series are registered and resolvable via `ENG-017`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-004_SPRINT_PLAN.md` §2 (`SPR-MOD-004-001`):

- Supplier, buyer, terms & conditions, and purchase price list master data can be created, edited, and archived under a tenant/company.
- Purchasing organization and purchasing configuration resolve deterministically through `ENG-005`.
- Numbering series for purchasing documents are registered and resolve via `ENG-017`.
- All structural changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable).

- **Risk ID:** R-01
  - **Description:** MOD-004 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Downstream Purchase sprints depend on `MOD002_ACCOUNTING_BASELINE_v1` being frozen so that Accounting ownership boundaries (vouchers, ledger, taxation, payables, payments) are stable and not redefined by Purchase.
  - **Impact:** Any weakening of Accounting ownership boundaries would blur the Purchase/Accounting split.
  - **Mitigation:** Rely on the frozen `MOD002_ACCOUNTING_BASELINE_v1`; treat boundary regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Downstream Purchase sprints (`SPR-MOD-004-003`, `SPR-MOD-004-005`) will depend on MOD-005 Inventory for item master, stock ledger, putaway, and reservation behavior. MOD-005 is not yet baselined.
  - **Impact:** Purchase Foundation itself is unaffected, but if MOD-005 baselining slips, Sprint 3 and Sprint 5 may declare warehouse-handover contracts against an evolving Inventory contract.
  - **Mitigation:** Treat inventory as a downstream dependency in this sprint; Sprint 3 will declare outbound contract expectations rather than assume Inventory internals.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Requisitions/RFQs/POs, goods receipt, vendor billing / 3-way match, returns/debit notes, and analytics are deferred to `SPR-MOD-004-002` … `SPR-MOD-004-006`.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries and pollute the Foundation.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Purchase-foundation events rely on `ENG-024` delivery guarantees governed by the authoritative event catalog. A formal event-envelope ADR (candidate `ADR-051` Transactional Outbox) is currently `Proposed` and is not relied upon by this sprint.
  - **Impact:** Weakened delivery guarantees at the engine or catalog level would break consumer contracts.
  - **Mitigation:** Consume `ENG-024` per the authoritative event catalog without redefining delivery semantics; escalate any weakening as an engine / catalog defect. Adopt an eventing ADR once ratified.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Any event name declared in §11 that is not yet present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Map to an authoritative equivalent where one exists; otherwise register via the event catalog governance process before Purchase Sprint 2 begins consuming those events.
  - **Status:** Deferred

- **Risk ID:** R-07
  - **Description:** Supplier master ownership is exclusive to Purchase; downstream modules MUST consume via events and read APIs.
  - **Impact:** Independent supplier masters in downstream modules would fragment master data.
  - **Mitigation:** Enforce the Supplier Master Authority convention (§1.1.1) at sprint gates for consuming modules.
  - **Status:** Accepted

- **Risk ID:** R-08
  - **Description:** Numbering series registration is in scope here; consumption by document types is in scope of downstream Purchase sprints.
  - **Impact:** Loose registration semantics would leak into downstream consumption.
  - **Mitigation:** Register series with deterministic identifiers via `ENG-017`; do not expose consumption paths in this sprint.
  - **Status:** Accepted

- **Risk ID:** R-09
  - **Description:** Cross-module contract drift for consumed events (`SupplierCreated` per Module PRD §8, and any future cross-module supplier-sync contract from MOD-001 / MOD-002).
  - **Impact:** Publisher contracts changing outside Purchase's control would silently break foundation-level supplier sync.
  - **Mitigation:** Treat consumed events strictly against the authoritative event catalog contract; escalate divergences as catalog defects rather than absorbing them into Purchase business logic.
  - **Status:** Open

- **Risk ID:** R-10
  - **Description:** Supplier data governance and master-data quality dependency. Purchase Foundation is the authoritative source of supplier data for the enterprise; low-quality onboarding (duplicate suppliers, incomplete tax/legal identifiers, unverified bank details) is one of the largest operational risks in procurement systems and propagates to every downstream Purchase sprint and every consuming module.
  - **Impact:** Duplicate or unverified supplier data would corrupt spend analytics, 3-way match, payables, and downstream reporting; remediation cost grows super-linearly once downstream documents reference bad master data.
  - **Mitigation:** Enforce uniqueness invariants (§5.1), classification integrity (§5.2), and lifecycle audit (§5.7) at the foundation layer; treat supplier-data quality as a governance concern raised at sprint gates for downstream Purchase sprints and consuming modules.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — supplier, supplier categorisation, contact/address validation; buyer and purchasing-organization invariants; T&C and price-list validation; purchase configuration resolution rules.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, numbering-series registration via `ENG-017`, event publication via `ENG-024`.
- **Contract** — purchase-foundation event contracts against the event catalog; consumer contract for `SupplierCreated`.
- **End-to-end (smoke)** — supplier creation, categorisation, buyer/purchasing-organization assignment, and configuration resolution under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture used to prove tenancy and ownership invariants across companies.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling supplier lifecycle as a small state machine so audit emission (§5.7) and event publication (§5.8) are trivially satisfiable at every transition.
- Consider validating tenancy at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating purchase configuration initialization with company activation events emitted by MOD-001 so the purchase configuration namespace is ready before the first supplier action.
- Consider registering all purchase-document numbering series upfront in this sprint, even though only downstream sprints consume them, so numbering readiness is deterministic.
- Consider surfacing the Supplier Master Authority convention as a hard boundary in downstream module gates.
- Consider supplier data quality checks (identifier uniqueness, minimum required attributes) at onboarding so R-10 mitigation is enforced from day one.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-004-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Purchase Foundation — supplier master, categorisation, buyer master, purchasing organization, T&C master, price list master, purchase configuration, numbering readiness, audit and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-004` MODULE_PRD section. No orphan requirements. Bidirectional mapping preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Purchase Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists requisitions/RFQs/POs, goods receipt, vendor billing, returns, analytics, plus Accounting/Inventory/Sales-owned scope, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-004-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-004-002 Requisitions, RFQs & Purchase Orders` is the immediate successor per [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-004-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
