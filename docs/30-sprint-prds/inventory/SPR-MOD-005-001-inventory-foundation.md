---
title: "SPR-MOD-005-001 — Inventory Foundation"
summary: "Sprint PRD for the foundational inventory layer of MOD-005 Inventory: item master, item categorisation, item groups, item attributes, unit-of-measure master, SKU generation preparation, item status, branch and warehouse assignment, storage locations, inventory configuration, inventory numbering readiness, and inventory-foundation events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Inventory"
status: "Draft"
updated: "2026-07-10"
sprint_id: "SPR-MOD-005-001"
parent_module: "MOD-005"
parent_sprint_plan: "MOD-005_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "8.8.1"
size: "Large"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-017", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "inventory", "foundation", "mod-005"]
document_type: "Sprint PRD"
---

# SPR-MOD-005-001 — Inventory Foundation

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-005 Inventory** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-005-001` (permanent) |
| Parent Module | `MOD-005` — Inventory |
| Parent Sprint Plan | [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md), [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (all frozen) |
| Downstream Sprints | `SPR-MOD-005-002` … `SPR-MOD-005-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Inventory Foundation** for BusinessOS: the item master and its lifecycle, item categorisation and grouping, item attributes, unit-of-measure master, SKU generation preparation, item status, branch and warehouse assignment, storage location master, inventory configuration namespace, inventory numbering readiness, and audit integration for inventory-foundation lifecycle events. This foundation is the substrate that every subsequent Inventory sprint — receipts and putaway, issues and transfers, adjustments and physical verification, valuation and replenishment, analytics — depends on. It is also the authoritative source of Item master data consumed by other operational modules (Purchase, Sales, Manufacturing, Accounting for costing reference, Analytics).

> **Inventory Ownership Convention.** The Inventory module owns the business semantics of the Item master, item categorisation, item groups, item attributes, unit-of-measure master, storage locations, and inventory configuration. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, eventing) but **MUST NOT** redefine inventory business rules. Downstream modules consume Item master data and inventory services rather than introducing independent item masters or parallel inventory structures. This complements — and does not redefine — the Platform governance conventions (`MOD001_PLATFORM_BASELINE_v1`), the Accounting ownership conventions (`MOD002_ACCOUNTING_BASELINE_v1`), the Sales ownership conventions (`MOD003_SALES_BASELINE_v1`), and the Purchase ownership conventions (`MOD004_PURCHASE_BASELINE_v1`).

#### 1.1.1 Inventory Master Ownership

Inventory master data (Item, Item Category, Item Group, Item Attribute, Unit of Measure, Storage Location, Warehouse Assignment, Branch Assignment) is authoritatively owned by MOD-005 Inventory. No other module MAY create, edit, archive, or independently maintain a parallel Item master. Downstream modules (Purchase, Sales, Manufacturing, Accounting for costing reference, Analytics) consume Item master data via published events and read APIs; they MUST NOT redefine the item entity, its categorisation, or its lifecycle.

#### 1.1.2 Item Master Authority

The Item master is the single authoritative source of item identity, SKU, item categorisation, item grouping, item attributes, and item lifecycle. Every downstream document that references an item (purchase order, goods receipt, sales quotation, delivery, stock movement, work order) resolves the item via the Item master owned here.

#### 1.1.3 Purchase Consumption Boundary

Purchase (`MOD-004`) owns the supplier master, purchasing organization, and commercial procurement documents per `MOD004_PURCHASE_BASELINE_v1`. Inventory Foundation consumes purchase-related lifecycle contracts only in downstream Inventory sprints (Receipts & Putaway, `SPR-MOD-005-002`) and MUST NOT redefine purchase ownership. No purchase document lifecycle, no supplier master, and no procurement configuration is created or modified in this sprint.

#### 1.1.4 Warehouse Consumption Boundary

Warehouse infrastructure ownership (physical warehouse operational systems, external WMS, 3PL integration) is external to this sprint. Inventory Foundation registers **inventory-side** warehouse and storage-location master data (identifiers, hierarchy, tenancy binding) under the tenant/company hierarchy established by the Platform baseline; it does not redefine warehouse infrastructure ownership. Warehouse-handover contracts and putaway execution are delivered in `SPR-MOD-005-002`.

#### 1.1.5 Accounting Consumption Boundary

Accounting (`MOD-002`) owns accounting vouchers, journal posting, ledger posting, taxation, financial reporting, valuation ledger, and accounting period governance per `MOD002_ACCOUNTING_BASELINE_v1`. Inventory Foundation MUST NOT create accounting journals, ledger entries, or independently manage accounting voucher lifecycles. Costing reference on the Item master is a declarative attribute; accounting valuation is delivered by `SPR-MOD-005-005` via voucher-creation contracts consumed by Accounting.

#### 1.1.6 Inventory Configuration Authority

Inventory configuration (default unit-of-measure per item class, SKU generation policy, negative-stock policy defaults, reorder-policy defaults, storage-location resolution defaults, numbering series registration) is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline. No module-specific configuration keys are registered outside Inventory's own ownership boundary.

#### 1.1.7 Governance Complement

This Sprint complements — and does not redefine — `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `MOD003_SALES_BASELINE_v1`, and `MOD004_PURCHASE_BASELINE_v1`. Ownership established by those baselines is consumed and preserved; it is not overridden here. Ownership boundaries SHALL NOT be redefined in downstream Inventory Sprint PRDs.

### 1.2 In Scope

- Item master: creation, editing, archival; item identifiers; item classification; item status flags.
- Item categories: classification taxonomy for items.
- Item groups: grouping of items for downstream aggregation.
- Item attributes: extensible attribute definitions on items.
- Unit of Measure master: base and alternate UoM definitions and per-item UoM assignment.
- SKU generation preparation: SKU policy registration under configuration (rule *evaluation* is delivered by downstream Inventory sprints; the policy itself is registered here).
- Item status lifecycle: draft, active, inactive, archived transitions.
- Branch assignment: assignment of items to one or more branches under the tenant/company hierarchy established by the Platform baseline.
- Warehouse assignment: assignment of items to one or more warehouses under the tenant/company hierarchy.
- Storage locations: bin / storage-location master under a warehouse.
- Inventory configuration: default UoM per item class, SKU generation policy, negative-stock policy defaults, reorder-policy defaults, storage-location resolution defaults — resolved via `ENG-005`.
- Inventory numbering readiness: registration of inventory-document numbering series (stock receipt, stock issue, stock transfer, stock adjustment, physical count) via `ENG-017`. Numbering *consumption* by those document types is delivered by downstream Inventory sprints; only the series registration and resolution readiness are in scope here.
- Attachment readiness on Item master and inventory-foundation entities (attachment engine consumption itself is delivered in downstream Inventory sprints; this sprint registers the attachment surface expected by later sprints).
- Notification readiness on inventory-foundation lifecycle transitions (notification engine consumption itself is delivered in downstream Inventory sprints; this sprint registers the notification surface expected by later sprints).
- Item master validation invariants (uniqueness, referential integrity, tenancy).
- Audit integration for every inventory-foundation lifecycle transition via `ENG-004`.
- Inventory-foundation events (see §11), delivered via `ENG-024`, subject to authoritative event-catalog resolution (see §11 and `R-EV-01`).

### 1.3 Out of Scope

Reserved for later Inventory sprints (see [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md)):

- Stock receipts, goods-receipt consumption, putaway, warehouse handover confirmation, bin assignment execution — `SPR-MOD-005-002`.
- Stock issues, internal and branch transfers, reservations, allocation, availability — `SPR-MOD-005-003`.
- Stock adjustments, physical count, cycle count, variance recording, reconciliation — `SPR-MOD-005-004`.
- Inventory valuation (FIFO / moving average / standard), reorder policy evaluation, replenishment suggestions, valuation-change events — `SPR-MOD-005-005`.
- Inventory analytics, dashboards, KPIs, stock ageing, inventory turnover, operational controls, audit readiness — `SPR-MOD-005-006`.
- Purchase requisition, RFQ, purchase order, goods-receipt processing, purchase-side lifecycles — owned by MOD-004 Purchase; consumed via `MOD004_PURCHASE_BASELINE_v1`.
- Warehouse operations (physical WMS execution, 3PL integration internals) — external ownership; consumed via warehouse-handover contracts in `SPR-MOD-005-002`.
- Accounting vouchers, journal posting, ledger posting, taxation, valuation-ledger posting, financial reporting — owned by MOD-002 Accounting; consumed via `MOD002_ACCOUNTING_BASELINE_v1`.
- Manufacturing bill-of-materials, work-order lifecycle, production consumption — owned by MOD-009 Manufacturing.
- Cross-module analytics KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-005-001`, the following will exist:

- **Business capabilities.**
  - An inventory administrator can create, edit, and archive items under a tenant/company, with coherent item categorisation, item grouping, and item attributes.
  - Unit-of-measure master data (base and alternate) can be maintained and assigned to items.
  - SKU generation policy is registered under inventory configuration; SKU evaluation is delivered by downstream sprints.
  - Item status lifecycle (draft, active, inactive, archived) is enforced deterministically.
  - Items can be assigned to one or more branches and one or more warehouses under the tenant/company hierarchy established by the Platform baseline.
  - Storage locations (bins) can be defined under a warehouse and maintained deterministically.
  - Inventory configuration (default UoM per class, SKU policy, negative-stock defaults, reorder-policy defaults, storage-location resolution defaults) is resolved deterministically per company through `ENG-005`.
  - Inventory-document numbering series are registered and resolvable via `ENG-017` (consumption by document types occurs in downstream sprints).
  - Attachment and notification surfaces are declared on inventory-foundation entities for consumption by downstream Inventory sprints.
- **Published events.** Inventory-foundation event contracts (see §11), registered in the event catalog and emitted by the corresponding lifecycle transitions. All event names in §11 are deferred against the authoritative event catalog under `R-EV-01` (§14).
- **Configuration artifacts.** Inventory configuration namespace initialized for each company via `ENG-005`. No module-specific keys are registered outside Inventory's own ownership boundary.
- **Audit artifacts.** An audit record exists for every inventory-foundation lifecycle transition, produced via `ENG-004`, in a form consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-005-001`.
  - Inventory-foundation event entries in the event catalog referenced from §11.
- **Forward references.** Downstream sprints [`SPR-MOD-005-002`](./MOD-005_SPRINT_PLAN.md), `SPR-MOD-005-003`, `SPR-MOD-005-004`, `SPR-MOD-005-005`, `SPR-MOD-005-006` consume the foundation established here.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Bidirectional Traceability

Every Module capability SHALL map to exactly one originating Sprint allocation. Every Sprint capability SHALL trace back to an approved Module capability. No orphan Sprint capability. No duplicate originating allocation. No unallocated Module capability.

### 3.1 Forward Map — Module PRD Capability → Sprint 1 Deliverable

| MOD-005 MODULE_PRD Reference | Delivered By |
| --- | --- |
| §1 Overview — Inventory primitives and personas | Item master and Inventory Ownership Convention (§1.1) |
| §2 Business Scope — Item master and categorization (Items submodule) | Item master, item categories, item groups, item attributes |
| §2 Business Scope — Warehouse and bin management (Warehouses submodule) | Warehouse assignment, storage-location master |
| §3 Personas — Warehouse Manager, Stores Officer, Inventory Controller | User stories (§4) |
| §5 Master Data — Item, Item Category, Warehouse, Bin/Location, Unit of Measure, Stock Balance | Item, item category, item group, UoM, warehouse assignment, storage location; Stock Balance registered as the read model consumed by downstream sprints |
| §5 Master Data — Lifecycle `Draft → Active → Inactive → Archived` | Item status lifecycle (§5.6 in this PRD) |
| §7 Business Rules — Negative stock permitted per warehouse; adjustments beyond threshold require approval; physical count differences post to variance account | Negative-stock policy defaults registered via `ENG-005`; rule *evaluation* is delivered downstream (`SPR-MOD-005-003` / `SPR-MOD-005-004`) |
| §10 Configuration — Valuation method per company, reorder policies, negative-stock policy, numbering series | Inventory configuration namespace, numbering series registration, negative-stock defaults, reorder-policy defaults (evaluation delivered downstream) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

### 3.2 Reverse Map — Sprint 1 Capability → Module PRD Reference

| Sprint 1 Capability | Module PRD Reference |
| --- | --- |
| Item master (create/edit/archive) | §2 (Item master and categorization); §5 (Item) |
| Item categories | §2 (Item master and categorization); §5 (Item Category) |
| Item groups | §2 (Item master and categorization) |
| Item attributes | §2 (Item master and categorization) |
| Unit of Measure master | §5 (Unit of Measure) |
| SKU generation preparation | §2 (Item master and categorization); §10 (Configuration) |
| Item status lifecycle | §5 (Lifecycle `Draft → Active → Inactive → Archived`) |
| Branch assignment | §2 (Warehouse and bin management); §13 (Dependencies on MOD-001) |
| Warehouse assignment | §2 (Warehouse and bin management); §5 (Warehouse) |
| Storage locations | §2 (Warehouse and bin management); §5 (Bin/Location) |
| Inventory configuration namespace | §10 (Configuration) |
| Numbering readiness | §10 (Configuration — Numbering series) |
| Attachment / notification readiness | §12 (Optional engines to be consumed downstream) |
| Inventory-foundation events | §8 (Integration Points — event publication surface established) |
| Audit integration | §11 (Non-functional — audit); ADR-014 |

Sprint scope is bounded strictly by these references. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Inventory Module PRD, and no capability approved for Sprint 1 in `MOD-005_SPRINT_PLAN.md` is orphaned from this Sprint PRD** (unique originating allocation preserved).

---

## 4. User Stories

Every user story SHALL trace to exactly one Sprint Deliverable (§2).

- **US-001.** *As an inventory executive, I want a single authoritative view of items across the enterprise, so that every downstream module resolves items against the same master.*
- **US-002.** *As an inventory manager, I want to create, edit, and archive items under a company, with coherent categorisation, grouping, and attributes, so that a stable item master exists before any stock transaction is created.*
- **US-003.** *As an inventory manager, I want to define base and alternate units of measure and assign them to items, so that downstream documents resolve UoM deterministically.*
- **US-004.** *As an inventory manager, I want to register an SKU generation policy under inventory configuration, so that downstream sprints can generate SKUs deterministically without redefining the policy.*
- **US-005.** *As a warehouse manager, I want to define warehouses, storage locations (bins), and item-to-warehouse assignments under the tenant/company hierarchy, so that downstream stock movements resolve warehouses and locations deterministically.*
- **US-006.** *As a branch manager, I want to assign items to one or more branches under a company, so that branch-level operations resolve item eligibility deterministically.*
- **US-007.** *As an inventory administrator, I want to configure default UoM per item class, negative-stock defaults, reorder-policy defaults, and storage-location resolution defaults per company, so that later Inventory sprints resolve configuration deterministically.*
- **US-008.** *As an inventory administrator, I want inventory-document numbering series to be registered and resolvable, so that downstream Inventory sprints can consume them without redefining numbering.*
- **US-009.** *As a downstream module (system persona), I want to receive inventory-foundation events (item, category, warehouse, storage-location, UoM lifecycle), so that I can react to inventory-foundation transitions in a decoupled way.*
- **US-010.** *As a system administrator, I want every inventory-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the item master and warehouse-assignment history from an authoritative log.*
- **US-011.** *As an inventory controller, I want to drive items through a deterministic status lifecycle (`Draft → Active → Inactive → Archived`), so that downstream sprints can rely on item availability semantics.*
- **US-012.** *As an inventory administrator, I want attachment and notification surfaces declared on inventory-foundation entities, so that downstream Inventory sprints can consume attachments and notifications without redefining the surface.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Item master (US-001, US-002)

- **Given** a valid item creation request under a tenant/company,
  **when** an inventory admin submits it,
  **then** the item is persisted with a stable identifier and its identifiers are unique within the company.
- **Given** a valid item update that maintains referential integrity,
  **when** an inventory admin submits it,
  **then** the update is persisted and audited.
- **Given** an item with dependent stock references (created in later sprints),
  **when** archival is attempted,
  **then** archival is either permitted with a clean lifecycle transition or rejected deterministically per the item lifecycle rules established here.

### 5.2 Item categories, groups, and attributes (US-002)

- **Given** a valid item category, item group, or item attribute definition,
  **when** an inventory admin submits it,
  **then** it is persisted and consumable by downstream sprints.
- **Given** an item classified against a category, group, or attribute set,
  **when** the classification is submitted,
  **then** the classification is persisted, uniquely identified within the item, and audited.

### 5.3 Unit of Measure (US-003)

- **Given** a valid base UoM under an active company,
  **when** an inventory admin submits it,
  **then** it is persisted uniquely within the company.
- **Given** a valid alternate UoM referencing an existing base UoM with a conversion factor,
  **when** an inventory admin submits it,
  **then** it is persisted deterministically and audited.
- **Given** an item with an assigned base UoM,
  **when** an alternate UoM is assigned to the item,
  **then** the assignment is persisted and referentially consistent.

### 5.4 SKU generation preparation (US-004)

- **Given** an SKU generation policy definition,
  **when** an inventory admin submits it under a company,
  **then** the policy is registered under inventory configuration and resolves deterministically via `ENG-005`. Rule *evaluation* is delivered by downstream Inventory sprints.

### 5.5 Warehouse assignment, branch assignment, storage locations (US-005, US-006)

- **Given** a valid warehouse definition and item-to-warehouse assignment,
  **when** an inventory admin or warehouse manager submits it,
  **then** the assignment is persisted under the tenant/company hierarchy established by the Platform baseline.
- **Given** a valid item-to-branch assignment,
  **when** a branch manager submits it,
  **then** the assignment is persisted and audited.
- **Given** a valid storage-location (bin) definition under an active warehouse,
  **when** a warehouse manager submits it,
  **then** the storage location is persisted, uniquely identified within the warehouse, and audited.

### 5.6 Item status transitions (US-011)

- **Given** an item in `Draft`,
  **when** an inventory admin transitions it to `Active`, `Inactive`, or `Archived` per the approved lifecycle,
  **then** the transition is persisted and audited; invalid transitions are rejected deterministically.

### 5.7 Inventory configuration and numbering readiness (US-007, US-008)

- **Given** a company under an active tenant,
  **when** default UoM per item class, negative-stock defaults, reorder-policy defaults, and storage-location resolution defaults are configured,
  **then** the values resolve deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** an inventory-document numbering series registered under a company,
  **when** it is queried by identifier,
  **then** it resolves deterministically via `ENG-017`. (Consumption by specific document types is delivered by downstream Inventory sprints.)

### 5.8 Attachment and notification readiness (US-012)

- **Given** an inventory-foundation entity in scope of §1.2,
  **when** downstream Inventory sprints attach documents or emit notifications,
  **then** the attachment and notification surfaces declared here support consumption deterministically. Attachment engine and notification engine *consumption* is delivered by downstream Inventory sprints.

### 5.9 Authorization (US-002, US-005, US-006, US-007, ADR-032)

- **Given** any inventory-foundation action,
  **when** it is attempted,
  **then** it is authorized under `ENG-002` per the RBAC + ABAC model authoritatively established by `ADR-032`.

### 5.10 Audit integration (US-010)

- **Given** any inventory-foundation lifecycle transition (item / category / group / attribute / UoM / warehouse assignment / branch assignment / storage location / configuration / numbering-series registration),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.11 Tenant isolation (`ADR-011`)

- **Given** any inventory-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.12 Inventory events (US-009)

- **Given** an inventory-foundation lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used; unresolved names are deferred under `R-EV-01`.

### 5.13 Ownership boundary invariants

- Inventory Foundation SHALL NOT create inventory transactions. All stock movements (receipt, issue, transfer, adjustment, physical count) are delivered by downstream Inventory sprints.
- Inventory Foundation SHALL NOT modify warehouse ownership. Warehouse infrastructure ownership remains external per §1.1.4.
- Inventory Foundation SHALL NOT perform accounting processing. Accounting vouchers, ledger posting, and valuation are owned by MOD-002 Accounting per §1.1.5.
- Inventory Foundation SHALL NOT redefine purchase ownership. Purchase master data and lifecycles are owned by MOD-004 Purchase per §1.1.3.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-005` — Inventory.
- **Module PRD:** [`docs/20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1 Overview, §2 Business Scope (Item master and categorization; Warehouse and bin management — submodules Items, Warehouses), §3 Personas (Warehouse Manager, Stores Officer, Inventory Controller), §5 Master Data (Item, Item Category, Warehouse, Bin/Location, Unit of Measure, Stock Balance), §10 Configuration (Numbering series, Negative-stock policy defaults), §12 ERP Core Engine Consumption, §13 Dependencies. See §3.

---

## 7. Dependencies

- **Parent:** `MOD-005` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — accounting ownership conventions. Not directly consumed at the Inventory Foundation layer but declared as upstream so ownership boundaries are respected in downstream Inventory sprints.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — Customer master ownership boundary. Inventory MUST NOT redefine customer ownership.
  - [`MOD004_PURCHASE_BASELINE_v1`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) (frozen) — Supplier master and commercial procurement ownership boundaries. Inventory MUST NOT redefine purchase ownership.
- **Upstream sprint dependencies:** None (Inventory Sprint 1). Sequenced immediately after Stage 1 planning per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).
- **Downstream sprints:** `SPR-MOD-005-002` (Inventory Receipts & Putaway), `SPR-MOD-005-003` (Inventory Issues, Transfers & Reservations), `SPR-MOD-005-004` (Inventory Adjustments & Stock Counting), `SPR-MOD-005-005` (Inventory Valuation & Replenishment), `SPR-MOD-005-006` (Inventory Analytics & Operational Controls) — per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).
- **Downstream module consumers of Item master:** `MOD-004` Purchase, `MOD-003` Sales, `MOD-009` Manufacturing, `MOD-002` Accounting (costing reference), `MOD-015` POS, `MOD-017` Analytics — consuming exclusively via events and read APIs. Module identifiers resolve verbatim from [`MODULE_CATALOG.md`](../../MODULE_CATALOG.md).

Purchase, Warehouse, and Accounting ownership are consumed and SHALL NOT be redefined by this Sprint PRD.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Inventory Ownership Convention in §1.1). See each engine's specification for capability details.

One-line usage note per engine. Every engine identifier SHALL resolve verbatim from [`ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md), SHALL match [`ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md), and SHALL exactly match the Sprint 1 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md). No placeholder, deprecated, undefined, duplicate, or additional engine identifiers are permitted.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the inventory-administrator, warehouse-manager, and branch-manager identity used for foundation lifecycle actions. |
| `ENG-002` Authorization | Enforces authorization on inventory-foundation actions per `ADR-032` RBAC + ABAC. |
| `ENG-003` Permission Management | Registers inventory-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every inventory-foundation lifecycle transition per `ADR-014`. |
| `ENG-005` Configuration | Resolves inventory configuration (default UoM per class, SKU policy, negative-stock defaults, reorder-policy defaults, storage-location resolution defaults) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for inventory master data (item names, category labels, UoM labels) where applicable. |
| `ENG-017` Numbering | Registers and resolves inventory-document numbering series. Consumption by document types occurs in downstream sprints. |
| `ENG-024` Eventing | Publishes inventory-foundation events with the contracts declared in §11. |

Inventory business semantics (item master, categorisation, item groups, item attributes, UoM, storage locations, warehouse and branch assignment, inventory configuration) are owned by this module and are not delegated to any engine.

Attachment (`ENG-008`), notification (`ENG-025`), document (`ENG-007`), rules (`ENG-012`), approval (`ENG-011`), workflow (`ENG-010`), voucher (`ENG-015`), and posting (`ENG-016`) engines are consumed by downstream Inventory sprints and are NOT invoked here per the Sprint 1 allocation in [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md).

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Identifiers resolve verbatim from [`ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md).

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every inventory-foundation read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to inventory-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. A formal Accepted event-envelope ADR is not yet ratified and is tracked as a deferred governance item under `R-EV-01` (§14); no non-Accepted ADR is relied upon here.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Item | MOD-005 (this sprint) | Authoritative item entity owned by Inventory; carries identity, classification, attributes, and lifecycle status. |
| Item Category | MOD-005 (this sprint) | Taxonomy classifying items for downstream aggregation and reporting. |
| Item Group | MOD-005 (this sprint) | Classification grouping applied to items. |
| Item Attribute | MOD-005 (this sprint) | Extensible attribute definition applied to items. |
| Unit of Measure | MOD-005 (this sprint) | Base and alternate UoM definitions with conversion factors. |
| Inventory Configuration | MOD-005 (this sprint, configuration-scoped) | Inventory configuration namespace per company resolved via `ENG-005`. |
| Warehouse Assignment | MOD-005 (this sprint) | Association of an item to one or more warehouses under a company. |
| Branch Assignment | MOD-005 (this sprint) | Association of an item to one or more branches under a company. |
| Storage Location | MOD-005 (this sprint) | Bin / storage-location master under a warehouse. |
| Item Attachment | MOD-005 (this sprint) | Attachment surface declared on inventory-foundation entities for downstream consumption. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **items**, **item categories**, **item groups**, **UoMs**, **warehouses**, and **storage locations**.
- An **item** belongs to zero or one **item group** and zero or one **item category**, and carries zero or more **item attributes**.
- An **item** carries exactly one base **UoM** and zero or more alternate **UoMs**.
- An **item** MAY be assigned to zero or more **branches** and zero or more **warehouses** under a company.
- A **storage location** belongs to exactly one **warehouse**.
- An **inventory configuration** belongs to exactly one company.
- **Stock Balance** (Module PRD §5) is a read model computed from downstream stock movements and is not a Foundation-authored write entity; its shape is registered here for consumption by later Inventory sprints.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-005` per the Inventory Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Supplier master is owned by MOD-004 Purchase; it is not represented as an Inventory-owned entity.
- Customer master is owned by MOD-003 Sales; it is not represented as an Inventory-owned entity.
- Accounting valuation ledger is owned by MOD-002 Accounting; it is not represented as an Inventory-owned entity.
- Warehouse infrastructure ownership is external per §1.1.4; Inventory owns only the inventory-side warehouse and storage-location master.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing; a formal event-envelope ADR is deferred (see `R-EV-01` in §14). The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

**Event-name policy.** Only event names present verbatim in the authoritative event catalog are used. The authoritative event catalog is currently a stub (all sections marked *"content to be filled in a later pass"*); consequently, every inventory-foundation event surface enumerated below is **deferred** as `R-EV-01` in §14 pending event-catalog registration. The Event Catalog is **not** modified by this sprint.

| Event Surface (deferred to catalog resolution under `R-EV-01`) | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| Item lifecycle surface (create / update / status transition / archive) | MOD-005 | SPR-MOD-005-001 | MOD-005 (self), MOD-004 (Purchase), MOD-003 (Sales), MOD-009 (Manufacturing), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| Item category / group / attribute lifecycle surface | MOD-005 | SPR-MOD-005-001 | MOD-005 (self), MOD-017 | At-least-once, ordered per tenant |
| Unit-of-measure lifecycle surface | MOD-005 | SPR-MOD-005-001 | MOD-005 (self), MOD-004, MOD-003, MOD-017 | At-least-once, ordered per tenant |
| Warehouse / storage-location master surface | MOD-005 | SPR-MOD-005-001 | MOD-005 (self), MOD-004, MOD-003, MOD-017 | At-least-once, ordered per tenant |
| Item ↔ warehouse / branch assignment surface | MOD-005 | SPR-MOD-005-001 | MOD-005 (self), MOD-004, MOD-003, MOD-017 | At-least-once, ordered per tenant |
| Inventory configuration change surface | MOD-005 | SPR-MOD-005-001 | MOD-005 (self), MOD-017 | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14 (see `R-EV-01`).

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Inventory-foundation event surfaces are registered in the event catalog with their contracts and are emitted on the corresponding transitions (or, if the catalog remains a stub, `R-EV-01` remains deferred with no active blocker for downstream Sprint 2 authoring).
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every inventory-foundation read and write.
- [ ] Every inventory-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] Inventory configuration namespace is initialized per company via `ENG-005` (default UoM per class, SKU policy, negative-stock defaults, reorder-policy defaults, storage-location resolution defaults).
- [ ] Inventory-document numbering series are registered and resolvable via `ENG-017`.
- [ ] Attachment and notification surfaces are declared on inventory-foundation entities for downstream consumption.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-005_SPRINT_PLAN.md` §2 (`SPR-MOD-005-001`):

- Item, item category, warehouse, bin/location, and unit-of-measure master data can be created, edited, and archived under a tenant/company.
- Inventory configuration resolves deterministically through `ENG-005`.
- Numbering series for inventory documents are registered and resolve via `ENG-017`.
- All structural changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risk Register

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**. Status values are drawn from the working vocabulary `Open` (active), `Mitigated` (residual only), `Accepted` (consciously accepted), `Deferred` (postponed), and `Closed` (no longer applicable).

- **Risk ID:** R-01
  - **Description:** MOD-005 depends on `MOD004_PURCHASE_BASELINE_v1` being frozen so that Purchase ownership boundaries (supplier master, procurement documents, commercial procurement) are stable and not redefined by Inventory in downstream sprints.
  - **Impact:** Any weakening of Purchase ownership boundaries would blur the Inventory / Purchase split at Receipts & Putaway.
  - **Mitigation:** Rely on the frozen `MOD004_PURCHASE_BASELINE_v1`; treat boundary regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Warehouse infrastructure ownership (physical WMS, external 3PL, warehouse operational systems) is external to this sprint and is consumed via warehouse-handover contracts in downstream sprints.
  - **Impact:** Silent absorption of warehouse infrastructure ownership into Inventory would violate the Warehouse Consumption Boundary (§1.1.4).
  - **Mitigation:** Enforce the Warehouse Consumption Boundary at sprint gates; consume warehouse operations only via handover contracts in `SPR-MOD-005-002`.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-005 depends on `MOD002_ACCOUNTING_BASELINE_v1` being frozen so that Accounting ownership boundaries (vouchers, ledger, taxation, valuation ledger, payables) are stable and not redefined by Inventory.
  - **Impact:** Any weakening of Accounting ownership boundaries would blur the Inventory / Accounting split at valuation and adjustment.
  - **Mitigation:** Rely on the frozen `MOD002_ACCOUNTING_BASELINE_v1`; treat boundary regressions as baseline defects and re-plan.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Inventory governance ownership is exclusive to MOD-005; downstream modules MUST consume via events and read APIs.
  - **Impact:** Independent item masters in downstream modules would fragment master data.
  - **Mitigation:** Enforce the Inventory Master Ownership convention (§1.1.1) at sprint gates for consuming modules.
  - **Status:** Accepted

- **Risk ID:** R-05
  - **Description:** Item Master authority is exclusive to MOD-005; every downstream document that references an item resolves the item via the Item master owned here.
  - **Impact:** Parallel item identifiers in downstream modules would corrupt cross-module reporting, valuation, and 3-way match.
  - **Mitigation:** Enforce the Item Master Authority convention (§1.1.2) at sprint gates; expose item master exclusively via events and read APIs.
  - **Status:** Accepted

- **Risk ID:** R-06
  - **Description:** Cross-module contract drift for events consumed from Purchase (`goods-receipt` lifecycle), Sales (`delivery` lifecycle), and Manufacturing (`production-completed` lifecycle) — consumed by downstream Inventory sprints, not by Foundation itself.
  - **Impact:** Publisher contracts changing outside Inventory's control would silently break downstream stock movement handoffs.
  - **Mitigation:** Treat consumed events strictly against the authoritative event catalog contract; escalate divergences as catalog defects rather than absorbing them into Inventory business logic.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** The authoritative event catalog (`docs/02-architecture/event-catalog.md`) is currently a stub. Every inventory-foundation event surface enumerated in §11 is therefore a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register inventory-foundation events via the event catalog governance process before `SPR-MOD-005-002` begins consuming those events.
  - **Status:** Deferred

- **Risk ID:** R-07
  - **Description:** Inventory configuration namespace is centrally resolved via `ENG-005`. Configuration drift or bypass of the tenant/company hierarchy would violate the Inventory Configuration Authority convention (§1.1.6).
  - **Impact:** Bypassing `ENG-005` would fragment inventory configuration across the enterprise.
  - **Mitigation:** Register every inventory configuration key exclusively under Inventory ownership via `ENG-005`; reject foreign registrations.
  - **Status:** Open

- **Risk ID:** R-08
  - **Description:** Item master and item classification data quality dependency. Inventory Foundation is the authoritative source of item data for the enterprise; low-quality item onboarding (duplicate items, incomplete UoM, unverified classification) propagates to every downstream Inventory sprint and every consuming module.
  - **Impact:** Duplicate or unverified item data would corrupt stock ledger, valuation, purchase requisitions, sales orders, and downstream analytics; remediation cost grows super-linearly once documents reference bad master data.
  - **Mitigation:** Enforce uniqueness invariants (§5.1), classification integrity (§5.2), UoM referential consistency (§5.3), and lifecycle audit (§5.10) at the foundation layer; treat item-master quality as a governance concern raised at sprint gates for downstream Inventory sprints and consuming modules.
  - **Status:** Open

- **Risk ID:** R-09
  - **Description:** Cross-module contracts (item consumption, UoM resolution, warehouse and branch assignment) are consumed by MOD-004 Purchase, MOD-003 Sales, MOD-009 Manufacturing, MOD-002 Accounting (costing reference), MOD-015 POS, and MOD-017 Analytics.
  - **Impact:** Ambiguous consumption contracts would encourage independent item masters in consuming modules.
  - **Mitigation:** Expose Item master exclusively via events and read APIs; enforce consumption boundaries at sprint gates.
  - **Status:** Open

- **Risk ID:** R-10
  - **Description:** Inventory-document numbering series registration is in scope here; consumption by document types (stock receipt, stock issue, stock transfer, stock adjustment, physical count) is in scope of downstream Inventory sprints. The repository-approved numbering engine (`ENG-017`) is present in Sprint 1 engine allocation per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) and is referenced by identifier accordingly.
  - **Impact:** Loose registration semantics would leak into downstream consumption.
  - **Mitigation:** Register series with deterministic identifiers via `ENG-017`; do not expose consumption paths in this sprint.
  - **Status:** Accepted

- **Risk ID:** R-11
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — item, item category, item group, item attribute validation; UoM base/alternate invariants; warehouse assignment, branch assignment, storage-location invariants; item status lifecycle transitions; inventory configuration resolution rules.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, localization resolution via `ENG-006`, numbering-series registration via `ENG-017`, event publication via `ENG-024`, authorization via `ENG-002` and `ENG-003`.
- **Contract** — inventory-foundation event contracts against the event catalog (deferred under `R-EV-01`).
- **End-to-end (smoke)** — item creation, classification, UoM assignment, warehouse and branch assignment, storage-location definition, and configuration resolution under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture used to prove tenancy and ownership invariants across companies.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling item lifecycle as a small state machine so audit emission (§5.10) and event publication (§5.12) are trivially satisfiable at every transition.
- Consider validating tenancy at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating inventory configuration initialization with company activation events emitted by MOD-001 so the inventory configuration namespace is ready before the first item action.
- Consider registering all inventory-document numbering series upfront in this sprint, even though only downstream sprints consume them, so numbering readiness is deterministic.
- Consider surfacing the Inventory Master Ownership and Item Master Authority conventions as hard boundaries in downstream module gates.
- Consider item data quality checks (identifier uniqueness, minimum required attributes, UoM referential consistency) at onboarding so R-08 mitigation is enforced from day one.
- Consider registering the attachment and notification surfaces declaratively so downstream Inventory sprints inherit them without redefinition.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-005-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Inventory Foundation — item master, categorisation, groups, attributes, UoM, SKU preparation, item status, branch and warehouse assignment, storage locations, inventory configuration, numbering readiness, attachment and notification readiness, audit and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix (both forward and reverse); every feature is tied to a `MOD-005` MODULE_PRD reference. No orphan requirements. Bidirectional mapping preserved.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Inventory Ownership Convention (§1.1) with "consumed, not redefined" language; no engine or ADR text is duplicated here.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 lists stock receipts/putaway, issues/transfers, adjustments/physical count, valuation/replenishment, analytics, plus Purchase/Warehouse/Accounting/Manufacturing/Analytics-owned scope, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes and includes explicit ownership-boundary invariants (§5.13).
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-005-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-005-002 Inventory Receipts & Putaway` is the immediate successor per [`MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-005-001` (and the frozen `MOD004_PURCHASE_BASELINE_v1`).

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/inventory/MODULE_PRD.md`](../../20-module-prds/inventory/MODULE_PRD.md)
- Parent Sprint Plan — [`./MOD-005_SPRINT_PLAN.md`](./MOD-005_SPRINT_PLAN.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Upstream baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md), [`../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](../../40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md)
- Module Catalog — [`../../MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
