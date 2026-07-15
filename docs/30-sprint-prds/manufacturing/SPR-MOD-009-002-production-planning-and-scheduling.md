---
title: "SPR-MOD-009-002 — Production Planning & Scheduling"
summary: "Sprint PRD for the Plan-to-work-order layer of MOD-009 Manufacturing: production plan intake, material-availability confirmation, and scheduling of operations onto work centers via ENG-014 Scheduler. Consumes the Manufacturing Foundation authored in SPR-MOD-009-001 and cross-module domain events (SalesOrderConfirmed, InventoryLowStock)."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-009-002"
parent_module: "MOD-009"
parent_sprint_plan: "MOD-009_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "11.0.2"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "manufacturing", "mod-009", "planning", "scheduling", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD009-002-20260715T000800Z-001"
parent_result_id: "GT003-MOD009-001-20260715T000700Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-009-002 — Production Planning & Scheduling

> **Stage 2 deliverable.** Second Sprint PRD for **MOD-009 Manufacturing** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines, Accepted ADRs, the Manufacturing Foundation authored in `SPR-MOD-009-001`, and cross-module domain events; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-009-002` (permanent) |
| Parent Module | `MOD-009` — Manufacturing |
| Parent Sprint Plan | [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-009-001`](./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen), [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen — `SalesOrderConfirmed` producer) |
| Downstream Sprints | `SPR-MOD-009-003` … `SPR-MOD-009-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Plan-to-work-order** business process for BusinessOS: allow a Production Planner to intake a production plan (from a confirmed sales order, from replenishment demand, or on demand), confirm material availability against MOD-005 Inventory, and schedule the plan's operations onto Manufacturing Work Centers via `ENG-014` Scheduler. Enforce the material-availability rule via `ENG-012` before the plan may be released to work-order execution in `SPR-MOD-009-003`.

> **Manufacturing Ownership Convention (re-stated).** The Manufacturing module owns the business semantics of the Production Plan intake, material-availability confirmation surface (via read-only consumption of MOD-005), and scheduling of Manufacturing-owned Operations onto Manufacturing-owned Work Centers. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, workflow, approval, rules, automation, scheduler, eventing, notification) but **MUST NOT** redefine Manufacturing business rules. Stock ledgers, reservations, and material-availability computation remain exclusive to **MOD-005 Inventory**. Financial posting remains exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**.

#### 1.1.1 Production Plan Master Authority

The **Production Plan** entity is authoritatively owned by MOD-009 Manufacturing and originates in this sprint. No other module MAY create, edit, archive, or independently maintain a parallel Production Plan. Downstream sprints and modules consume Production Plans through Manufacturing-owned read APIs and (in later sprints) Manufacturing-owned events; they MUST NOT redefine the entity or its lifecycle.

#### 1.1.2 Manufacturing ↔ Inventory Boundary (Material Availability)

- **MOD-005 Inventory** owns the Item master, the stock ledger, inventory movements, reservations, and the authoritative material-availability computation.
- **MOD-009 Manufacturing** consumes material availability read-only through the MOD-005 read API and reflects the confirmation state on the Production Plan. Reservation of stock, if performed, remains an MOD-005 concern; this sprint does not write to the stock ledger.
- The material-availability rule ("A work order cannot start without material availability confirmation" — Module PRD §7) is enforced by `ENG-012` inside this sprint as a **plan-release precondition** for `SPR-MOD-009-003`; the physical work-order lifecycle itself remains scoped to `SPR-MOD-009-003`.

#### 1.1.3 Manufacturing ↔ Accounting and Platform Boundary

- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. This sprint writes no journal entries and invokes no posting engine.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Manufacturing consumes these read-only via `ENG-001` / `ENG-002` / `ENG-003`; permission grants for Planner and Approver roles remain owned by MOD-001.

Ownership boundaries authored in `SPR-MOD-009-001` §1.1 SHALL NOT be redefined here.

#### 1.1.4 Scheduling Authority

Scheduling of Operations (Manufacturing-owned) onto Work Centers (Manufacturing-owned) is executed via `ENG-014` Scheduler. This sprint provides the **initial-schedule** semantics for the plan-to-work-order flow. Fine-grained shopfloor rescheduling, work-order-level scheduling, and MES-driven schedule adjustments remain scoped to `SPR-MOD-009-003`.

### 1.2 In Scope

- **Production Plan intake:** create, edit, submit for approval, approve, cancel, and archive Production Plans under a tenant/company. Sources include: (a) a confirmed sales order (via the consumed `SalesOrderConfirmed` event), (b) replenishment demand (via the consumed `InventoryLowStock` event), and (c) an on-demand planner-originated request.
- **Production Plan composition:** binding of a Production Plan to a BOM and a Routing authored in `SPR-MOD-009-001`, and target quantity and target date resolution.
- **Material availability confirmation:** read-only consumption of MOD-005 Inventory material availability for the plan's BOM components under the plan's (tenant, company) scope; reflection of the confirmation state on the Production Plan.
- **Scheduling:** allocation of the Plan's Routing steps (Operations) onto Work Centers via `ENG-014` Scheduler using authored Manufacturing masters and Manufacturing configuration (default routing choice, approval thresholds) authored in `SPR-MOD-009-001`.
- **Plan-release gate:** enforcement of the material-availability rule via `ENG-012` as a precondition for downstream work-order release in `SPR-MOD-009-003`.
- **Workflow and approval:** Production Plan approval per approval-threshold configuration authored in `SPR-MOD-009-001`, executed via `ENG-010` Workflow and `ENG-011` Approval.
- **Automation triggers:** consumption-driven automation via `ENG-013` when a `SalesOrderConfirmed` or `InventoryLowStock` event is delivered (e.g., initialize a draft Production Plan proposal).
- **Consumed events:**
  - `SalesOrderConfirmed` — published by MOD-003 Sales, consumed as a Production Plan source.
  - `InventoryLowStock` — published by MOD-005 Inventory, consumed as a Production Plan source.
- **Notifications:** planner and approver notifications via `ENG-025` at plan-lifecycle transitions where configured.
- **Audit:** every Production Plan lifecycle transition (create, edit, submit, approve, cancel, archive, schedule, confirm availability) is audited via `ENG-004` per `ADR-014`.
- **Configuration consumption:** default routing choice, approval thresholds, and scrap tolerance registered in `SPR-MOD-009-001` are consumed here through `ENG-005`.

### 1.3 Out of Scope

- Work Order transaction lifecycle, Production Entry, and shopfloor execution — `SPR-MOD-009-003`.
- MES / SCADA / IoT integration for real-time shopfloor telemetry — `SPR-MOD-009-003`.
- Sub-contract Challan intake, dispatch, and return reconciliation — `SPR-MOD-009-004`.
- Quality Inspection, quality-rejection handling, and yield/scrap tracking — `SPR-MOD-009-005`.
- Manufacturing analytics, dashboards, and audit-readiness surface — `SPR-MOD-009-006`.
- Numbering-series **allocation** at Production Plan capture: numbering registration was authored in `SPR-MOD-009-001`; per Sprint Plan §5 (Engine Consumption Map), `ENG-017` allocation for Production Plan documents is scoped to the sprint that authors the numbering-issuing transaction and is not exercised as a new contract here. Any Production Plan document number that this sprint requires resolves through the numbering-series registration already authored in `SPR-MOD-009-001`.
- Item master, stock ledger, inventory movements, reservations — owned by MOD-005 Inventory.
- Financial postings for planning obligations — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-009-002`, the following will exist:

- **Business capabilities.**
  - A Production Planner can intake, edit, submit, approve, cancel, and archive Production Plans under a tenant/company.
  - A Production Planner can bind a Production Plan to a BOM and Routing authored in `SPR-MOD-009-001` and set target quantity and date.
  - A Production Planner can confirm material availability for a Production Plan by consuming MOD-005 Inventory read-only.
  - A Production Planner can schedule a Production Plan's Operations onto Work Centers via `ENG-014` Scheduler.
  - A Production Plan MUST NOT be released to work-order execution unless material availability is confirmed (rule enforced via `ENG-012`).
  - Consumers of `SalesOrderConfirmed` and `InventoryLowStock` events initialize the corresponding Production Plan proposals via `ENG-013`.
- **Workflow and approval.** Production Plan approval flow registered via `ENG-010` and `ENG-011`, keyed to the approval-threshold configuration authored in `SPR-MOD-009-001`.
- **Consumed event registration.** Subscriptions to `SalesOrderConfirmed` (MOD-003) and `InventoryLowStock` (MOD-005) declared and wired against `ENG-024` Event.
- **Audit artifacts.** An audit record exists for every Production Plan lifecycle transition, produced via `ENG-004`.
- **Notification artifacts.** Planner and approver notifications wired via `ENG-025` at configured lifecycle transitions.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-009-002`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

Sprint 2 publishes **no new domain events**. Per Sprint Plan §7 (Cross-Sprint & Cross-Module Dependency Matrix), Manufacturing-lifecycle events (`WorkOrderReleased`, `ProductionCompleted`, `SubContractDispatched`, `QualityRejected`) originate in later Manufacturing sprints. This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-009 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Production planning and scheduling; submodule Planning | Production Plan intake, material-availability confirmation surface, and scheduling of Operations onto Work Centers |
| §3 Personas — Production Planner (primary), Shopfloor Supervisor (secondary — read), Inventory Controller (secondary — availability consumer) | User stories (§4) |
| §4 Business Processes — Plan-to-work-order | End-to-end plan intake → availability confirmation → schedule → approve → release-gate |
| §7 Business Rules — "A work order cannot start without material availability confirmation" | Rule enforced via `ENG-012` as a plan-release precondition |
| §8 Integration Points — `SalesOrderConfirmed`, `InventoryLowStock` (consumed) | Consumed event subscriptions declared against `ENG-024` |
| §10 Configuration — Default routing choice, Approval thresholds | Read-only consumption via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Manufacturing Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Production planning and scheduling (§2) | `SPR-MOD-009-002` |

This allocation is unique; no other Manufacturing sprint claims "Production planning and scheduling" as an originating capability. The **Planning** submodule (Sprint Plan §4.2) is originating-allocated exclusively to `SPR-MOD-009-002`.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Production planning and scheduling* and submodule *Planning* → this Sprint PRD → deliverables in §2 (Production Plan intake, material-availability confirmation, scheduling, release gate, consumed-event subscriptions).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Production Planner, I want to intake a Production Plan under a company from a confirmed sales order, from replenishment demand, or on demand, so that manufacturing intent is captured before any work order is released.*
- **US-002.** *As a Production Planner, I want to bind a Production Plan to a BOM and Routing authored in Sprint 1 and set target quantity and target date, so that the Plan resolves deterministically to compositional shape and operational sequence.*
- **US-003.** *As a Production Planner, I want to confirm material availability for a Production Plan by consuming MOD-005 Inventory read-only, so that the material-availability state is authoritative and never re-authored inside Manufacturing.*
- **US-004.** *As a Production Planner, I want to schedule the Plan's Operations onto Work Centers via `ENG-014` Scheduler, so that a deterministic initial schedule exists before work-order release.*
- **US-005.** *As a Production Planner, I want the material-availability rule enforced by `ENG-012` as a plan-release precondition, so that a Plan without confirmed availability cannot be released to work-order execution in `SPR-MOD-009-003`.*
- **US-006.** *As a Production Planner or approver, I want Production Plan approval to run through `ENG-010` Workflow and `ENG-011` Approval keyed to the approval-threshold configuration authored in Sprint 1, so that approval semantics are consistent with Manufacturing configuration.*
- **US-007.** *As a subscriber to `SalesOrderConfirmed` and `InventoryLowStock`, I want the Manufacturing planning surface to initialize a draft Production Plan proposal via `ENG-013` when either event is delivered, so that plan-to-work-order flow is triggered without silent drift.*
- **US-008.** *As a security reviewer, I want every Production Plan lifecycle transition to be audited via `ENG-004`, so that plan history can be reconstructed from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Production Plan intake (US-001, US-002)

- **Given** a valid Production Plan creation request under a tenant/company that references an active BOM and an active Routing in the same company,
  **when** a Production Planner submits it,
  **then** the Production Plan is persisted with a stable identifier unique within the company and its creation is audited.
- **Given** a Production Plan request that references an archived BOM, an archived Routing, or entities in different companies,
  **when** the request is submitted,
  **then** the request is rejected deterministically.
- **Given** a Production Plan bound to a BOM and Routing,
  **when** target quantity and target date are set,
  **then** they are persisted deterministically and audited.

### 5.2 Material availability confirmation (US-003)

- **Given** a Production Plan bound to a BOM whose components resolve to active MOD-005 Items under the same company,
  **when** a Production Planner requests material-availability confirmation,
  **then** availability is resolved read-only through the MOD-005 Inventory read API and the confirmation state is persisted on the Production Plan and audited.
- **Given** a Production Plan whose BOM references an Item that MOD-005 reports as unavailable in the plan's scope,
  **when** availability is queried,
  **then** the Production Plan reflects the unavailable state deterministically; MOD-005 stock is not mutated by this sprint.

### 5.3 Scheduling (US-004)

- **Given** an approved Routing composed of Operations executed on active Work Centers in the plan's company,
  **when** a Production Planner triggers scheduling for the Plan,
  **then** `ENG-014` Scheduler produces an initial schedule allocating each Operation to a Work Center within the plan's (tenant, company) scope, and the schedule is persisted and audited.
- **Given** a scheduling request that references an archived Work Center, an archived Operation, or entities in different companies,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.4 Plan-release gate — material-availability rule (US-005)

- **Given** a Production Plan whose material-availability state is not confirmed,
  **when** a caller attempts to release it to work-order execution,
  **then** the release is rejected deterministically by `ENG-012` enforcing the material-availability rule ("A work order cannot start without material availability confirmation" — Module PRD §7).
- **Given** a Production Plan whose material-availability state is confirmed and whose approval state is approved,
  **when** a caller attempts to release it to work-order execution,
  **then** the release precondition is satisfied deterministically; the physical work-order lifecycle itself is delivered in `SPR-MOD-009-003`.

### 5.5 Workflow and approval (US-006)

- **Given** the approval-threshold configuration authored in `SPR-MOD-009-001` resolved for the plan's (tenant, company) scope via `ENG-005`,
  **when** a Production Plan is submitted for approval,
  **then** `ENG-010` Workflow drives the plan through the appropriate approval steps and `ENG-011` records approver decisions; every state transition is audited.
- **Given** a Production Plan whose value or attributes fall below the configured approval threshold,
  **when** it is submitted,
  **then** it advances per the configured no-approval-needed branch deterministically.

### 5.6 Consumed events and automation (US-007)

- **Given** a `SalesOrderConfirmed` event delivered by MOD-003 Sales within a tenant/company where Manufacturing configuration is initialized,
  **when** the event is consumed via `ENG-024`,
  **then** `ENG-013` initializes a draft Production Plan proposal referencing the confirmed sales order deterministically, and the initialization is audited.
- **Given** an `InventoryLowStock` event delivered by MOD-005 Inventory within a tenant/company where Manufacturing configuration is initialized,
  **when** the event is consumed via `ENG-024`,
  **then** `ENG-013` initializes a draft Production Plan proposal referencing the low-stock signal deterministically, and the initialization is audited.
- **Given** an event whose (tenant, company) is not initialized for Manufacturing,
  **when** it is delivered,
  **then** no Production Plan is initialized and the skip is observably logged.

### 5.7 Audit integration (US-008)

- **Given** any Production Plan lifecycle transition (create, edit, submit, approve, cancel, archive, schedule, confirm availability, release-gate evaluation),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, plan identifier, transition type, and timestamp.

### 5.8 Isolation invariants (`ADR-011`)

- **Given** any Production Plan read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.9 Ownership consumption invariants

- **Given** any Manufacturing code path that requires material availability,
  **when** it needs the availability decision,
  **then** it consumes it read-only through the MOD-005 Inventory read API; the stock ledger is not written by this sprint.
- **Given** any Manufacturing code path that requires identity for a plan action,
  **when** it needs the actor,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.
- **Given** any planning obligation with financial consequence,
  **when** it materializes,
  **then** it is emitted (in later sprints) for MOD-002 Accounting to post; no journal entry is written by this sprint.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-009` — Manufacturing.
- **Module PRD:** [`docs/20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Production planning and scheduling; submodule Planning), §3 (personas — Production Planner primary; Inventory Controller and Shopfloor Supervisor secondary), §4 (Plan-to-work-order), §7 (material-availability rule), §8 (`SalesOrderConfirmed`, `InventoryLowStock` — consumed), §10 (Default routing choice, Approval thresholds — consumed), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-009` MODULE_PRD.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-009-001` — Manufacturing Foundation (BOM & Routing).
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — Item master and material availability consumed read-only; producer of `InventoryLowStock`.
  - [`MOD003_SALES_BASELINE_v1`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md) (frozen) — producer of `SalesOrderConfirmed`.
- **Cross-module consumption (events):**
  - `SalesOrderConfirmed` — consumed from MOD-003 Sales.
  - `InventoryLowStock` — consumed from MOD-005 Inventory.
- **Downstream sprints:** `SPR-MOD-009-003` (Work Orders & Shopfloor) depends directly on this sprint; `SPR-MOD-009-006` consumes Production Plan data.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Manufacturing Ownership Convention re-stated in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and matches Sprint Plan §5 (Engine Consumption Map) for `SPR-MOD-009-002`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Production Plan intake, availability confirmation, scheduling, approval, and release-gate actions. |
| `ENG-004` Audit | Records every Production Plan lifecycle transition. |
| `ENG-005` Configuration | Resolves Manufacturing operations configuration (default routing choice, approval thresholds) authored in `SPR-MOD-009-001` under the tenant/company hierarchy. |
| `ENG-010` Workflow | Drives Production Plan lifecycle transitions (draft → submitted → approved → scheduled → release-ready) deterministically. |
| `ENG-011` Approval | Records approver decisions per the approval-threshold configuration. |
| `ENG-012` Rules | Evaluates structural validations and enforces the material-availability rule as a plan-release precondition. |
| `ENG-013` Automation | Initializes draft Production Plan proposals in response to consumed `SalesOrderConfirmed` and `InventoryLowStock` events. |
| `ENG-014` Scheduler | Allocates a Production Plan's Operations to Work Centers to produce the initial schedule. |
| `ENG-024` Eventing | Subscribes to `SalesOrderConfirmed` (MOD-003) and `InventoryLowStock` (MOD-005) per the authoritative event catalog. Sprint 2 publishes no new domain events. |
| `ENG-025` Notification | Emits planner and approver notifications at configured Production Plan lifecycle transitions. |

Manufacturing business semantics (Production Plan entity, availability-confirmation state, schedule state, plan-release gate, plan approval semantics keyed to Manufacturing configuration) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Production Plan, scheduling, and event-subscription read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Production Plan actions and approval flows. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Production Plan | MOD-009 (this sprint) | Named plan-to-work-order intent binding a BOM and Routing to a target quantity and date under a tenant/company. |
| Production Plan ↔ BOM Reference | MOD-009 (this sprint) | Read-only binding of a Production Plan to a Sprint-1-owned BOM in the same company. |
| Production Plan ↔ Routing Reference | MOD-009 (this sprint) | Read-only binding of a Production Plan to a Sprint-1-owned Routing in the same company. |
| Production Plan Availability State | MOD-009 (this sprint) | Confirmation state on a Production Plan derived from MOD-005 Inventory read-only. |
| Production Plan Schedule | MOD-009 (this sprint) | Initial schedule produced by `ENG-014` allocating Routing Operations to Work Centers. |
| Production Plan Approval Record | MOD-009 (this sprint) | Approval decisions recorded via `ENG-011` keyed to Manufacturing approval-threshold configuration. |
| Sales/Inventory Event Subscription Registration | MOD-009 (this sprint, integration-scoped) | Manufacturing-owned registration wiring `SalesOrderConfirmed` and `InventoryLowStock` via `ENG-024`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Production Plans**.
- A **Production Plan** MUST reference exactly one active **BOM** (Sprint 1) and exactly one active **Routing** (Sprint 1) within the same company.
- A **Production Plan** MAY reference zero or more MOD-005-owned **Items** transitively via its BOM composition; those references remain owned by the BOM and are consumed read-only here.
- A **Production Plan** has at most one **Schedule** in the plan lifecycle governed by this sprint (initial schedule); shopfloor-level reschedules are scoped to `SPR-MOD-009-003`.
- A **Production Plan** MAY reference at most one **Sales Order** (via the consumed `SalesOrderConfirmed` payload) or at most one **Inventory Low-Stock signal** (via the consumed `InventoryLowStock` payload), or neither for planner-originated plans.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-009` per the Manufacturing Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **BOM**, **Routing**, **Work Center**, **Machine**, and **Operation** entities are owned by `SPR-MOD-009-001` and consumed here without redefinition.
- The **Item** entity and stock-ledger state are owned by MOD-005 Inventory and are consumed read-only; they are not represented as Manufacturing-owned entities.
- The **Sales Order** entity is owned by MOD-003 Sales and is referenced read-only through the consumed event payload; it is not represented as a Manufacturing-owned entity.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Manufacturing-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Manufacturing-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

Sprint 2 publishes **no new domain events**. Per Sprint Plan §7 (Cross-Sprint & Cross-Module Dependency Matrix) and Module PRD §8, Manufacturing-lifecycle events (`WorkOrderReleased`, `ProductionCompleted`, `SubContractDispatched`, `QualityRejected`) originate in later Manufacturing sprints. This sprint originates no event contract.

### 11.2 Consumed

| Event | Producer | Consumed Purpose |
| --- | --- | --- |
| `SalesOrderConfirmed` | MOD-003 Sales | Initializes a draft Production Plan proposal via `ENG-013`. |
| `InventoryLowStock` | MOD-005 Inventory | Initializes a draft Production Plan proposal via `ENG-013`. |

Payload contracts for the consumed events remain owned by their producer modules per the authoritative event catalog; this sprint does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to its authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Production Plan, scheduling, and event-subscription read and write.
- [ ] Every Production Plan lifecycle transition produces an audit record via `ENG-004`.
- [ ] The material-availability rule is enforced via `ENG-012` as a plan-release precondition, demonstrated to reject unconfirmed plans deterministically.
- [ ] `ENG-014` Scheduler produces an initial schedule for an approved Plan within its (tenant, company) scope.
- [ ] `SalesOrderConfirmed` and `InventoryLowStock` subscriptions are wired via `ENG-024` and initialize a draft Production Plan via `ENG-013` deterministically.
- [ ] Manufacturing configuration (default routing choice, approval thresholds) authored in `SPR-MOD-009-001` is consumed via `ENG-005`; no new configuration keys are registered here.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-009_SPRINT_PLAN.md` §2 (`SPR-MOD-009-002`):

- Production plans can be created, material availability can be confirmed, and operations can be scheduled onto work centers via `ENG-014`.
- The material-availability rule is enforced via `ENG-012` before work-order release.
- `SalesOrderConfirmed` and `InventoryLowStock` events are consumed and reflected in planning.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-009 depends on `SPR-MOD-009-001` deliverables (BOM, Routing, Work Center, Machine, Operation masters and Manufacturing configuration) being complete and stable.
  - **Impact:** Regressions against the Sprint 1 masters block Production Plan intake and scheduling.
  - **Mitigation:** Treat Sprint 1 outputs as an internal contract; escalate any drift as a Sprint 1 defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-009 depends on the MOD-005 Inventory Item read API and material-availability computation being stable.
  - **Impact:** Any drift in MOD-005 read semantics would corrupt availability confirmation.
  - **Mitigation:** Consume the MOD-005 read API per its authoritative contract; escalate any change as an Inventory defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-009 depends on the MOD-003 Sales `SalesOrderConfirmed` event contract being stable.
  - **Impact:** Any drift in the event envelope or payload would break the make-to-order plan initialization path.
  - **Mitigation:** Consume the event per the authoritative event catalog; escalate any change as a Sales/event-catalog defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Downstream Manufacturing sprints (`SPR-MOD-009-003` … `SPR-MOD-009-006`) are deferred; scope-creep back into this sprint would dilute the planning surface.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Manufacturing MUST NOT maintain its own stock ledger or write journal entries; MOD-005 owns the stock ledger, MOD-002 owns postings.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Manufacturing ↔ Inventory (§1.1.2) and Manufacturing ↔ Accounting (§1.1.3) boundaries at every code path and every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Consumed events `SalesOrderConfirmed` and `InventoryLowStock` MUST be registered in the authoritative event catalog before this sprint enters `In Progress`. Payload evolution remains owned by the producer modules.
  - **Impact:** Missing or drifted registration would break the plan-initialization path.
  - **Mitigation:** Register/verify via the event catalog governance process before the sprint begins; do not modify the event catalog inside this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Production Plan validation; BOM/Routing binding invariants; availability-state transitions; schedule allocation invariants; plan-release-gate rule; approval routing per threshold configuration.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, workflow via `ENG-010`, approval via `ENG-011`, rule enforcement via `ENG-012`, automation via `ENG-013`, scheduling via `ENG-014`, event consumption via `ENG-024`, notification via `ENG-025`, MOD-005 Item read.
- **Contract** — MOD-005 Inventory Item and material-availability read API; `SalesOrderConfirmed` (MOD-003) event envelope; `InventoryLowStock` (MOD-005) event envelope — all per the authoritative event catalog.
- **End-to-end (smoke)** — On-demand Production Plan creation, availability confirmation, scheduling, approval, and plan-release-gate evaluation under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation; `SalesOrderConfirmed`- and `InventoryLowStock`-driven plan initialization under the same fixture.

Sprint-specific fixtures: a Sales `SalesOrderConfirmed` fixture, an Inventory `InventoryLowStock` fixture, an Inventory-Item read-only fixture, a two-company smoke fixture, and a Platform-Identity read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Production Plan lifecycle as a small state machine (draft → submitted → approved → scheduled → release-ready → cancelled/archived) so audit emission (§5.7) and workflow (§5.5) are trivially satisfiable at every transition.
- Consider evaluating the material-availability rule as a pure `ENG-012` predicate over the plan's BOM component set and MOD-005 read state, so the rule remains observable and idempotent.
- Consider isolating the `SalesOrderConfirmed` and `InventoryLowStock` handlers behind a Manufacturing-owned automation entry point, so the automation semantics are independent of the producer modules' event envelope evolution.
- Consider expressing the initial schedule as an ordered list of (Operation, Work Center, planned window) tuples derived from `ENG-014` output, so downstream `SPR-MOD-009-003` can consume it without additional transformation.
- Consider co-locating approval routing with the plan lifecycle machine, so approver notifications via `ENG-025` fire on the same transition set audited via `ENG-004`.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-009-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Plan-to-work-order process — Production Plan intake, material-availability confirmation, scheduling via `ENG-014`, and enforcement of the material-availability rule via `ENG-012` as a plan-release precondition (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-009 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Manufacturing Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates work orders/shopfloor, sub-contracting, quality/yield/scrap, analytics, MOD-005-owned entities, financial postings, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-009-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-009-003` Work Orders & Shopfloor Execution is the immediate successor per [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-009-002`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md)
- Predecessor Sprint — [`./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md`](./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md), [`../../40-module-baselines/MOD003_SALES_BASELINE_v1.md`](../../40-module-baselines/MOD003_SALES_BASELINE_v1.md)
- Precedent Planning-Style Sprint PRDs — [`../payroll/SPR-MOD-008-002-payroll-cycles-and-runs.md`](../payroll/SPR-MOD-008-002-payroll-cycles-and-runs.md), [`../hrms/SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md`](../hrms/SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
