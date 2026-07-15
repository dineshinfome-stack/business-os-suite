---
title: "SPR-MOD-009-001 — Manufacturing Foundation (BOM & Routing)"
summary: "Sprint PRD for the foundational Manufacturing layer of MOD-009 Manufacturing: BOM, Routing, Work Center, Machine, and Operation master data, plus manufacturing operations configuration (default routing choice, scrap tolerance, approval thresholds, numbering series). Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-009-001"
parent_module: "MOD-009"
parent_sprint_plan: "MOD-009_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "11.0.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-012", "ENG-017", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "manufacturing", "mod-009", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD009-001-20260715T000700Z-001"
parent_result_id: "GT002-MOD009-20260715T000600Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-009-001 — Manufacturing Foundation (BOM & Routing)

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-009 Manufacturing** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-009-001` (permanent) |
| Parent Module | `MOD-009` — Manufacturing |
| Parent Sprint Plan | [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-009-002` … `SPR-MOD-009-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Manufacturing Foundation** for BusinessOS: the BOM, Routing, Work Center, Machine, and Operation master data, plus the manufacturing operations configuration (default routing choice, scrap tolerance, approval thresholds, numbering series) resolved through `ENG-005`. This foundation is the substrate on which every subsequent Manufacturing sprint — Production Planning & Scheduling, Work Orders & Shopfloor Execution, Sub-contracting, Quality/Yield/Scrap, and Manufacturing Analytics & Compliance — depends.

> **Manufacturing Ownership Convention.** The Manufacturing module owns the business semantics of the BOM, Routing, Work Center, Machine, and Operation masters, and the manufacturing operations configuration. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, document, attachment, rules, numbering, eventing) but **MUST NOT** redefine Manufacturing business rules. Stock ledgers, inventory movements, and reservations remain exclusive to **MOD-005 Inventory**. Financial posting of production, sub-contract, and yield/scrap effects remains exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**.

#### 1.1.1 BOM, Routing, Work Center, Machine, and Operation Master Authority

The **BOM**, **Routing**, **Work Center**, **Machine**, and **Operation** masters are authoritatively owned by MOD-009 Manufacturing. No other module MAY create, edit, archive, or independently maintain a parallel BOM, Routing, Work Center, Machine, or Operation master. Downstream sprints and modules consume these masters through Manufacturing-owned events and read APIs authored in later sprints; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 Manufacturing ↔ Inventory Boundary (Bill of Material vs. Stock Ledger)

- **MOD-005 Inventory** owns the Item master, the stock ledger, inventory movements, reservations, and material-availability computation.
- **MOD-009 Manufacturing** owns the compositional-shape masters (BOM, Routing) and the shopfloor-resource masters (Work Center, Machine, Operation). Manufacturing references an Inventory-owned Item read-only when a BOM component or output is bound to an item; the Item master itself is **not** redefined in this sprint.
- Cross-module event flow (`SalesOrderConfirmed`, `InventoryLowStock` — consumed; `WorkOrderReleased`, `ProductionCompleted`, `SubContractDispatched`, `QualityRejected` — published) is scoped to later Manufacturing sprints and is **not** exercised for new contracts in Sprint 1.

#### 1.1.3 Manufacturing ↔ Accounting and Platform Boundary

- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Manufacturing sprint writes journal entries; downstream sprints emit events that Accounting consumes, but never redefine posting logic.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Manufacturing consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.

Ownership boundaries SHALL NOT be redefined in downstream Manufacturing Sprint PRDs.

#### 1.1.4 Manufacturing Configuration Authority

Manufacturing operations configuration — default routing choice, scrap tolerance, approval thresholds, and numbering series — is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline; numbering-series resolution executes through `ENG-017` at transaction time in later sprints. No module-specific configuration keys are registered outside Manufacturing's own ownership boundary. Configuration **consumption** by downstream Manufacturing sprints (Planning, Work Orders, Sub-contracting, Quality, Analytics) uses these registrations without redefining them.

#### 1.1.5 Foundation Master Lifecycle Boundary

Manufacturing owns the lifecycle of every foundation master (BOM, Routing, Work Center, Machine, Operation). Downstream sprints (Planning & Scheduling, Work Orders & Shopfloor, Sub-contracting, Quality/Yield/Scrap, Analytics & Compliance) consume these entities without redefining their lifecycles.

### 1.2 In Scope

- BOM master: create, edit, activate, deactivate, archive under a tenant/company; composition of components referencing MOD-005-owned Items read-only.
- Routing master: create, edit, activate, deactivate, archive under a tenant/company; composition of Operations executed on Work Centers.
- Work Center master: create, edit, activate, deactivate, archive under a tenant/company; association with one or more Machines.
- Machine master: create, edit, activate, deactivate, archive under a tenant/company; association with a Work Center.
- Operation master: create, edit, activate, deactivate, archive under a tenant/company; used in Routing composition.
- Manufacturing operations configuration namespace initialized per company via `ENG-005`: default routing choice, scrap tolerance, approval thresholds, numbering series.
- Read-only consumption of Platform Identity (`ENG-001`) for the actor identity used in foundation lifecycle actions.
- Read-only consumption of MOD-005-owned Item master for BOM component and output binding; Item master itself is not redefined here.
- Audit emission via `ENG-004` for every foundation lifecycle transition per `ADR-014`.
- Attachment support for BOMs and Routings via `ENG-008` (drawings, technical specifications) where applicable.
- Document classification for foundation entities via `ENG-007` where applicable.
- Locale-scoped labels on foundation entities via `ENG-006` where applicable.
- Structural validation (required fields, referential integrity, uniqueness, same-company invariants) via `ENG-012` at capture time.
- `ENG-024` engine consumption is reserved for downstream sprints; Sprint 1 publishes no new domain events (per Sprint Plan §2).

### 1.3 Out of Scope

- Production plan intake, material-availability confirmation, work-center scheduling via `ENG-014` — `SPR-MOD-009-002`.
- Work Order transaction lifecycle, Production Entry, shopfloor execution surface, MES/SCADA/IoT integration — `SPR-MOD-009-003`.
- Sub-contract Challan transaction lifecycle, dispatch and return reconciliation, sub-contract ageing — `SPR-MOD-009-004`.
- Quality Inspection transaction lifecycle, quality-rejection handling, yield and scrap capture — `SPR-MOD-009-005`.
- Manufacturing read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-009-006`.
- Item master, stock ledger, inventory movements, reservations — owned by MOD-005 Inventory.
- Financial postings for production, sub-contract, and yield/scrap events — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-009-001`, the following will exist:

- **Business capabilities.**
  - A Production Planner can create, edit, activate, deactivate, and archive BOM records under a tenant/company.
  - A Production Planner can create, edit, activate, deactivate, and archive Routing records under a tenant/company and compose them from Operations executed on Work Centers.
  - A Shopfloor Supervisor (or Production Planner) can create, edit, activate, deactivate, and archive Work Center, Machine, and Operation records under a tenant/company.
  - Manufacturing operations configuration (default routing choice, scrap tolerance, approval thresholds, numbering series) is registered and resolves deterministically per company through `ENG-005`.
  - Identity linkage for actor actions is consumed read-only from `ENG-001` — no credentials are minted.
  - Item references for BOM composition are consumed read-only from MOD-005 — no Item master is re-authored.
- **Configuration artifacts.** Manufacturing configuration namespace initialized for each company via `ENG-005`. No module-specific keys are registered outside Manufacturing's own ownership boundary.
- **Audit artifacts.** An audit record exists for every Manufacturing-foundation lifecycle transition, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-009-001`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

Sprint 1 publishes **no new domain events** (per Sprint Plan §2 — Sprint 1 declares engine consumption of `ENG-024` for downstream readiness but reserves manufacturing-lifecycle events `WorkOrderReleased` / `ProductionCompleted` / `SubContractDispatched` / `QualityRejected` to later Manufacturing sprints). This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-009 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Manufacturing primitives and personas | BOM / Routing / Work Center / Machine / Operation masters and Manufacturing Ownership Convention |
| §2 Business Scope — Bills of material and routings; submodules BOM, Routing | BOM and Routing masters; Work Center, Machine, Operation masters supporting them |
| §3 Personas — Production Planner, Shopfloor Supervisor, Quality Inspector, Inventory Controller, Accountant, Sub-contractor | User stories (§4) |
| §5 Master Data — BOM, Routing, Work Center, Machine, Operation | All five masters delivered in this sprint |
| §7 Business Rules — foundation invariants (tenancy, referential integrity, same-company composition) | Enforceable classification, tenancy, and lifecycle invariants |
| §10 Configuration — Default routing choice, Scrap tolerance, Approval thresholds, Numbering series | Manufacturing configuration namespace via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Manufacturing Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Bills of material and routings (§2) | `SPR-MOD-009-001` |

This allocation is unique; no other Manufacturing sprint claims "Bills of material and routings" as an originating capability. Master-data entities BOM, Routing, Work Center, Machine, and Operation are each originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Bills of material and routings* and submodules *BOM* and *Routing* → this Sprint PRD → deliverables in §2 (BOM, Routing, Work Center, Machine, Operation masters, Manufacturing configuration namespace, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Production Planner, I want to create, edit, activate, deactivate, and archive BOMs under a company, so that a coherent bill-of-material catalog exists before any work order is released.*
- **US-002.** *As a Production Planner, I want to create, edit, activate, deactivate, and archive Routings under a company and compose them from Operations executed on Work Centers, so that Routings can be composed deterministically from re-usable Operations.*
- **US-003.** *As a Shopfloor Supervisor, I want to create, edit, activate, deactivate, and archive Work Centers, Machines, and Operations under a company, so that shopfloor resources are catalogued before Routings are composed.*
- **US-004.** *As a Production Planner, I want to reference Inventory-owned Items read-only when composing a BOM, so that BOM components resolve to authoritative Items without redefining the Item master.*
- **US-005.** *As a Production Planner, I want to register Manufacturing operations configuration (default routing choice, scrap tolerance, approval thresholds, numbering series) per company, so that later Manufacturing sprints resolve their configuration deterministically.*
- **US-006.** *As a Production Planner, I want the actor identity used for foundation lifecycle actions to be consumed read-only from `ENG-001`, so that identity, authentication, and permissions remain owned by MOD-001 while Manufacturing captures the composition-shape relationship.*
- **US-007.** *As a security reviewer, I want every Manufacturing-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct BOM, Routing, Work Center, Machine, and Operation history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 BOM master (US-001, US-004)

- **Given** a valid BOM creation request under a tenant/company,
  **when** a Production Planner submits it,
  **then** the BOM is persisted with a stable identifier and its identifiers are unique within the company.
- **Given** a valid BOM composition that references active MOD-005-owned Items in the same company,
  **when** the composition is submitted,
  **then** the composition is persisted deterministically and audited; the Item master is not redefined.
- **Given** a BOM composition that references an archived Item, an Item in a different company, or a non-existent Item,
  **when** the request is submitted,
  **then** the request is rejected deterministically.
- **Given** a BOM with dependent Manufacturing references (created in later sprints),
  **when** archival is attempted,
  **then** archival is either permitted with a clean lifecycle transition or rejected deterministically per the BOM lifecycle rules established here.

### 5.2 Routing master (US-002)

- **Given** a valid Routing creation request under a tenant/company,
  **when** a Production Planner submits it,
  **then** the Routing is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an active Operation and an active Work Center under the same company,
  **when** a Production Planner composes a Routing step from that Operation on that Work Center,
  **then** the Routing step is persisted deterministically and audited.
- **Given** an attempt to compose a Routing from an archived Operation, an archived Work Center, or entities in different companies,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.3 Work Center, Machine, and Operation masters (US-003)

- **Given** a valid Work Center, Machine, or Operation creation request under a tenant/company,
  **when** a Shopfloor Supervisor submits it,
  **then** the record is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an active Machine and an active Work Center under the same company,
  **when** a Shopfloor Supervisor associates the Machine with the Work Center,
  **then** the association is persisted deterministically and audited.
- **Given** an attempt to associate a Machine with a Work Center in a different company or with an archived Work Center,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.4 Manufacturing operations configuration (US-005)

- **Given** a company under an active tenant,
  **when** default routing choice, scrap tolerance, approval thresholds, and numbering series are registered,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a downstream sprint querying a configuration key registered by this sprint,
  **when** it queries the key by identifier,
  **then** it receives the deterministic value resolved for its (tenant, company) scope; **evaluation semantics** (routing selection at work-order release, scrap-tolerance evaluation at production-entry capture, approval-threshold evaluation at run time, numbering-series allocation at transaction time via `ENG-017`) remain out of scope here and are delivered by later Manufacturing sprints.

### 5.5 Identity consumption (US-006)

- **Given** any Manufacturing-foundation lifecycle action,
  **when** it executes,
  **then** the actor identity is resolved read-only via `ENG-001`; no credentials are minted by Manufacturing.

### 5.6 Audit integration (US-007)

- **Given** any Manufacturing-foundation lifecycle transition (BOM / Routing / Work Center / Machine / Operation / configuration / composition / association create, update, activate, deactivate, archive),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.7 Isolation invariants (`ADR-011`)

- **Given** any Manufacturing-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.8 Ownership consumption invariants

- **Given** any downstream module or sprint requiring BOM, Routing, Work Center, Machine, or Operation data,
  **when** it reads or reacts to these masters,
  **then** it does so exclusively through Manufacturing-owned events (published by later Manufacturing sprints) and read APIs. No downstream module creates an independent BOM, Routing, Work Center, Machine, or Operation master.
- **Given** any Manufacturing code path that requires Item data,
  **when** it needs the MOD-005 Item,
  **then** it consumes it read-only from MOD-005; the Item entity is not redefined here.
- **Given** any Manufacturing code path that requires Identity data,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-009` — Manufacturing.
- **Module PRD:** [`docs/20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Bills of material and routings; submodules BOM, Routing), §3 (Production Planner, Shopfloor Supervisor, Quality Inspector, Inventory Controller, Accountant, Sub-contractor), §5 (BOM, Routing, Work Center, Machine, Operation), §7 (foundation invariants), §10 (Default routing choice, Scrap tolerance, Approval thresholds, Numbering series), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-009` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — Item master consumed read-only for BOM composition.
- **Upstream sprint dependencies (per Sprint Plan §2):** None (Manufacturing sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` and the frozen `MOD005_INVENTORY_BASELINE_v1`.
- **Cross-module consumption (events only):** None in this sprint. Consumption of Sales/Inventory-published events (`SalesOrderConfirmed`, `InventoryLowStock`) is scoped to `SPR-MOD-009-002`; consumption of Maintenance-published events (`MaintenanceCompleted`) is scoped to `SPR-MOD-009-005`.
- **Downstream sprints:** `SPR-MOD-009-002` (Planning & Scheduling), `SPR-MOD-009-003` (Work Orders & Shopfloor), `SPR-MOD-009-004` (Sub-contracting), `SPR-MOD-009-005` (Quality, Yield & Scrap), `SPR-MOD-009-006` (Manufacturing Analytics & Compliance) — per [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Manufacturing Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the Production-Planner / Shopfloor-Supervisor identity used for foundation lifecycle actions and read-only binding to Platform users. |
| `ENG-002` Authorization | Enforces authorization on Manufacturing-foundation actions. |
| `ENG-003` Permission Management | Registers Manufacturing-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every Manufacturing-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves Manufacturing operations configuration (default routing choice, scrap tolerance, approval thresholds, numbering series) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for BOM, Routing, Work Center, Machine, and Operation content where applicable. |
| `ENG-007` Document | Provides document classification for BOM and Routing artifacts where applicable. |
| `ENG-008` Attachment | Provides attachment binding for BOM drawings and Routing technical specifications where applicable. |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, uniqueness, same-company composition) at capture time. |
| `ENG-017` Numbering | Registered as the numbering-series producer for later Manufacturing transactions; **allocation** semantics execute at transaction time in downstream sprints. |
| `ENG-024` Eventing | Reserved for downstream Manufacturing sprints (`WorkOrderReleased`, `ProductionCompleted`, `SubContractDispatched`, `QualityRejected`). Sprint 1 publishes no new domain events; the engine is available but not exercised for new event contracts here. |

Manufacturing business semantics (BOM, Routing, Work Center, Machine, Operation, Manufacturing configuration namespace, Routing ↔ Operation composition, Machine ↔ Work Center association, BOM ↔ Item read-only reference) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Manufacturing-foundation read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Manufacturing-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| BOM | MOD-009 (this sprint) | Named compositional shape referencing Items and Operations, scoped to a tenant/company. |
| Routing | MOD-009 (this sprint) | Named ordered sequence of Operations executed on Work Centers, scoped to a tenant/company. |
| Work Center | MOD-009 (this sprint) | Shopfloor resource grouping one or more Machines, scoped to a tenant/company. |
| Machine | MOD-009 (this sprint) | Individual shopfloor resource associated with a Work Center, scoped to a tenant/company. |
| Operation | MOD-009 (this sprint) | Re-usable unit of work referenced by Routing steps, scoped to a tenant/company. |
| Routing ↔ Operation Composition | MOD-009 (this sprint) | Ordered composition of Operations within a Routing. |
| Machine ↔ Work Center Association | MOD-009 (this sprint) | Membership of Machines in a Work Center. |
| Manufacturing Configuration | MOD-009 (this sprint, configuration-scoped) | Manufacturing operations configuration namespace per company resolved via `ENG-005` (default routing choice, scrap tolerance, approval thresholds, numbering series). |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **BOMs**, zero or more **Routings**, zero or more **Work Centers**, zero or more **Machines**, zero or more **Operations**, and one **Manufacturing configuration** namespace.
- A **BOM** MAY reference one or more MOD-005-owned **Items** within the same company as components or output; the Item entity is not represented as a Manufacturing-owned entity here.
- A **Routing** MAY compose zero or more **Operations** in ordered sequence within the same company, each step executed on a **Work Center** within the same company.
- A **Machine** belongs to at most one **Work Center** within the same company.
- An **Operation** MAY be referenced by zero or more Routing steps within the same company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-009` per the Manufacturing Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Item** entity is owned by MOD-005 Inventory and is consumed read-only; it is not a Manufacturing-owned entity.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Manufacturing-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Manufacturing-owned entities.
- Stock-ledger entities (stock movements, reservations, on-hand balances) are owned by MOD-005 Inventory; they are not represented as Manufacturing-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

Sprint 1 publishes **no new domain events**. Per Sprint Plan §2 (`SPR-MOD-009-001`), no event contract is originated by this sprint. Manufacturing-lifecycle events (`WorkOrderReleased`, `ProductionCompleted`, `SubContractDispatched`, `QualityRejected`) are originated by later Manufacturing sprints per Module PRD §8.

### 11.2 Consumed

Sprint 1 consumes **no cross-module domain events**. It consumes Platform Identity (`ENG-001`) read-only and MOD-005-owned Item master read-only (for BOM composition), which is engine-level and API-level consumption rather than a domain event subscription. Consumption of upstream domain events (`SalesOrderConfirmed`, `InventoryLowStock`, `MaintenanceCompleted`) is scoped to `SPR-MOD-009-002` and `SPR-MOD-009-005`.

Payload contracts for downstream Manufacturing events are declared in the event catalog when those sprints author them; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Manufacturing-foundation read and write.
- [ ] Every Manufacturing-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] Manufacturing configuration namespace is initialized per company via `ENG-005` (default routing choice, scrap tolerance, approval thresholds, numbering series).
- [ ] Actor identity for foundation lifecycle actions is exercised end-to-end read-only against `ENG-001`; no credentials are minted by Manufacturing.
- [ ] BOM ↔ Item read-only reference is exercised end-to-end against the MOD-005 Item read API; no Item master is re-authored.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-009_SPRINT_PLAN.md` §2 (`SPR-MOD-009-001`):

- BOM, Routing, Work Center, Machine, and Operation records can be created, edited, and archived under a tenant/company.
- Manufacturing configuration (default routing, scrap tolerance, approval thresholds, numbering series) resolves deterministically through `ENG-005`.
- Document numbers issue through `ENG-017`.
- All structural changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-009 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-009 depends on `MOD005_INVENTORY_BASELINE_v1` being frozen and stable for read-only Item consumption in BOM composition.
  - **Impact:** Any drift in the Inventory Item read API would break BOM composition.
  - **Mitigation:** Consume the Inventory Item read API per its authoritative contract; escalate any change as an Inventory defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Later Manufacturing sprints (`SPR-MOD-009-002` … `SPR-MOD-009-006`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Manufacturing-owned entities (BOM, Routing, Work Center, Machine, Operation, Routing ↔ Operation composition, Machine ↔ Work Center association, Manufacturing configuration) MUST NOT be redefined by downstream modules; Inventory Item master (MOD-005) and financial postings (MOD-002) MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the BOM / Routing / Work Center / Machine / Operation Master Authority convention (§1.1.1) and the Manufacturing ↔ Inventory / Accounting boundary (§1.1.2, §1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-06
  - **Description:** Manufacturing operations configuration registration is in scope here; **evaluation** semantics (routing selection at work-order release, scrap-tolerance evaluation at production-entry capture, approval-threshold evaluation at run time, numbering-series allocation at transaction time via `ENG-017`) are in scope of downstream Manufacturing sprints.
  - **Impact:** Loose registration semantics would leak evaluation responsibilities into this sprint.
  - **Mitigation:** Register configuration deterministically via `ENG-005`; do not expose evaluation paths in this sprint.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 1 publishes no new domain events. Downstream Manufacturing sprints declare events (`WorkOrderReleased`, `ProductionCompleted`, `SubContractDispatched`, `QualityRejected`) and consume cross-module events (`SalesOrderConfirmed`, `InventoryLowStock`, `MaintenanceCompleted`). Any event name not yet present in the authoritative event catalog at their authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint that publishes/consumes them, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Handle in each downstream sprint's own §14; not a Sprint 1 obligation. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — BOM, Routing, Work Center, Machine, Operation validation; Routing ↔ Operation composition invariants; Machine ↔ Work Center association invariants; BOM ↔ Item reference invariants; Manufacturing configuration resolution rules.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, actor identity resolution via `ENG-001`, Inventory Item read via MOD-005 read API, structural validation via `ENG-012`, attachment binding via `ENG-008`.
- **Contract** — Inventory Item read API contract used by BOM composition.
- **End-to-end (smoke)** — BOM creation with Item references, Routing creation with Operation composition on Work Centers, Machine association with Work Center, and configuration resolution under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an Inventory-Item read-only fixture, and a Platform-Identity read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling BOM, Routing, Work Center, Machine, and Operation lifecycles as small state machines so audit emission (§5.6) is trivially satisfiable at every transition.
- Consider validating tenancy and same-company invariants (BOM ↔ Item reference, Routing ↔ Operation composition, Machine ↔ Work Center association) at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating Manufacturing configuration initialization with company activation events emitted by MOD-001 so the Manufacturing configuration namespace is ready before the first BOM record.
- Consider registering default routing choice, scrap tolerance, approval thresholds, and numbering series upfront in this sprint (even though only downstream sprints consume them) so configuration readiness is deterministic.
- Consider a small BOM-Item reconciliation surface keyed by (tenant, company, item_id) so downstream Inventory Item lifecycle changes propagate observably into BOM state without silent drift.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-009-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Manufacturing Foundation — BOM, Routing, Work Center, Machine, and Operation masters, Manufacturing operations configuration, identity consumption, Inventory Item consumption, and audit (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-009 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Manufacturing Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates planning/scheduling, work orders/shopfloor, sub-contracting, quality/yield/scrap, analytics, MOD-005-owned entities, financial postings, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-009-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-009-002` Production Planning & Scheduling is the immediate successor per [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-009-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- Precedent Foundation Sprint PRDs — [`../payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md`](../payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md), [`../hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md`](../hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md), [`../crm/SPR-MOD-006-001-crm-foundation.md`](../crm/SPR-MOD-006-001-crm-foundation.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
