---
title: "SPR-MOD-014-002 — Trip Planning & Execution"
summary: "Sprint PRD for the Trip Planning & Execution layer of MOD-014: Route master; Trip Sheet transaction lifecycle; driver/vehicle assignment; odometer capture at open and close; trip closure; consumption of DeliveryDispatched and FieldTicketCreated to seed trip candidates; TripClosed publication. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-014-002"
parent_module: "MOD-014"
parent_sprint_plan: "MOD-014_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "16.0.2"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "fleet", "mod-014", "trips", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD014-002-20260716T028000Z-001"
parent_result_id: "GT003-MOD014-001-20260716T027000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-014-002 — Trip Planning & Execution

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-014 Fleet** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-014-002` (permanent) |
| Parent Module | `MOD-014` — Fleet |
| Parent Sprint Plan | [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen), [`MOD012_FIELD_SERVICE_BASELINE_v1`](../../40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md) (frozen) |
| Upstream Sprint | [`SPR-MOD-014-001`](./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md) |
| Downstream Sprints | `SPR-MOD-014-003`, `SPR-MOD-014-004` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Trip-plan-to-close** process for MOD-014 Fleet: the **Route** master; the **Trip Sheet** transaction lifecycle (`draft → planned → in-progress → closed → reversed`); driver/vehicle assignment governed by compliance state; odometer capture at trip open and close; trip closure semantics; consumption of `DeliveryDispatched` (from MOD-003 Sales) and `FieldTicketCreated` (from MOD-012 Field Service) to seed trip candidates; and publication of `TripClosed` on close. This sprint operationalizes the Foundation layer authored in `SPR-MOD-014-001` — no foundation-master authoring is reopened here.

> **Fleet Ownership Convention (recapitulated).** The Fleet module owns the business semantics of Route master, Trip Sheet transaction, driver/vehicle assignment invariants, odometer capture, and trip closure. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, document, attachment, workflow, approval, rules, scheduler, numbering, eventing, notification) but **MUST NOT** redefine Fleet business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects of trip closure (if any) remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines — no Fleet sprint writes journal entries directly; MOD-002 consumes Fleet-published events through its own posting-rule bindings.

#### 1.1.1 Route Master Authority

The **Route** master is authoritatively owned by MOD-014 Fleet, in this sprint. No other module MAY create, edit, archive, or independently maintain a parallel Route master. Downstream sprints and modules consume the Route master through Fleet read APIs authored in this and later sprints; they MUST NOT redefine the Route entity or its lifecycle.

#### 1.1.2 Trip Sheet Transaction Authority

The **Trip Sheet** transaction is authoritatively owned by MOD-014 Fleet, in this sprint. The Trip Sheet lifecycle (`draft → planned → in-progress → closed → reversed`) — including driver/vehicle assignment, odometer capture, and closure semantics — is defined and enforced here. Downstream sprints and modules consume Trip Sheet state exclusively via Fleet-published events (`TripClosed` here) and Fleet read APIs; they MUST NOT redefine the Trip Sheet transaction, its lifecycle, or its closure semantics.

#### 1.1.3 Fleet ↔ Platform, Accounting, Field Service, Sales, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Fleet consumes these read-only via `ENG-002` on this sprint's actions.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Fleet sprint writes journal entries; MOD-002 subscribes to Fleet-published events (`TripClosed`) via its own posting-rule bindings.
- **MOD-003 Sales** publishes `DeliveryDispatched`, consumed read-only in this sprint to seed outbound-delivery trip candidates. Delivery authoring is not redefined here.
- **MOD-012 Field Service** publishes `FieldTicketCreated`, consumed read-only in this sprint to seed field-service trip candidates. Field-ticket authoring is not redefined here.
- **MOD-017 Analytics** owns cross-module KPI definitions. Fleet operational reports on trips are surfaced by `SPR-MOD-014-004`; cross-module KPIs are never redefined by MOD-014.

Ownership boundaries SHALL NOT be redefined in downstream Fleet Sprint PRDs.

#### 1.1.4 Trip Configuration Consumption

Trip Sheet lifecycle resolves its numbering series via `ENG-017` from the Fleet configuration namespace registered by `SPR-MOD-014-001` (§1.1.4 of that sprint). Trip-Sheet-specific runtime configuration (e.g. approval thresholds for trip closure, notification cadence on trip open/close) is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline. No configuration keys owned by other modules are redefined here.

### 1.2 In Scope

- Route master: create, edit, activate, deactivate, archive under a tenant/company; origin/destination, waypoints, distance, and standard-duration attributes as authored per the Route entity.
- Trip Sheet transaction: create (draft) → plan (assign Route, Vehicle, Driver) → open (in-progress, opening odometer) → close (closing odometer) → reverse (with explicit reason), under a tenant/company.
- Driver/vehicle assignment invariants:
  - Vehicles with **expired critical compliance** cannot be assigned to a Trip Sheet — rule evaluated deterministically via `ENG-012` against compliance state owned by `SPR-MOD-014-001`.
  - Driver–License linkage (owned by `SPR-MOD-014-001`) is honored read-only; a Driver whose linked License is expired cannot be assigned to a Trip Sheet.
  - Same-company invariant: Route, Vehicle, and Driver on a Trip Sheet MUST belong to the same company under the same tenant.
- Odometer capture:
  - Opening odometer MUST be captured when the Trip Sheet transitions from `planned → in-progress`.
  - Closing odometer MUST be captured when the Trip Sheet transitions from `in-progress → closed`, and MUST be greater-than-or-equal-to the opening odometer.
- Trip closure semantics: closure emits `TripClosed` via `ENG-024`; a closed Trip Sheet is immutable except through the explicit `reverse` transition (which is itself audited).
- Consumption of `DeliveryDispatched` (from MOD-003 Sales) to seed outbound-delivery trip candidates in the Fleet backlog. Seeding does NOT redefine the delivery entity.
- Consumption of `FieldTicketCreated` (from MOD-012 Field Service) to seed field-service trip candidates in the Fleet backlog. Seeding does NOT redefine the field-ticket entity.
- Multi-step approval routing for trip closure where required by tenant configuration via `ENG-011`.
- Long-running Trip Sheet workflow orchestration via `ENG-010`.
- Structural validations (required fields, referential integrity, uniqueness, same-company composition, odometer monotonicity, expired-compliance rule, expired-license rule) evaluated at capture and transition time via `ENG-012`.
- Document numbers for Trip Sheet issued via `ENG-017` from the Fleet configuration namespace registered by `SPR-MOD-014-001`.
- Notifications on Trip Sheet open, close, and reverse under the tenant's configured channels via `ENG-025`.
- Audit emission via `ENG-004` for every Trip Sheet lifecycle transition, every Route lifecycle transition, and every seed-event ingestion.
- Attachment support for trip documents (e.g. odometer photos, gate-passes) via `ENG-008` and document classification via `ENG-007`.
- `TripClosed` domain event published via `ENG-024` on trip closure.

### 1.3 Out of Scope

- Vehicle, Driver, License masters; vehicle hierarchy; driver–license linkage; compliance and insurance registration; `ComplianceExpiring` publication — `SPR-MOD-014-001` (foundation authored upstream and consumed read-only here).
- Fuel Station master; Fuel Entry transaction; telematics reconciliation; Maintenance Order transaction; scheduled preventive maintenance; `FuelRecorded` and `MaintenanceCompleted` publication — `SPR-MOD-014-003`.
- Fleet read model, operational reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar), dashboards, exports, audit-readiness surface — `SPR-MOD-014-004`.
- Financial postings for trip closure (if any) — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting through posting-rule bindings triggered by `TripClosed`.
- Delivery authoring and `DeliveryDispatched` publication — owned by MOD-003 Sales.
- Field-ticket authoring and `FieldTicketCreated` publication — owned by MOD-012 Field Service.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.
- Localization content packs — owned by MOD-001 via `ENG-006`; not consumed by this sprint's runtime path.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-014-002`, the following will exist:

- **Business capabilities.**
  - A Dispatcher can create, edit, activate, deactivate, and archive Route records under a tenant/company.
  - A Dispatcher can plan a Trip Sheet by assigning a Route, Vehicle, and Driver from the Foundation masters (same-company invariant enforced via `ENG-012`).
  - A Vehicle with expired critical compliance cannot be assigned to a Trip Sheet; a Driver whose linked License is expired cannot be assigned to a Trip Sheet.
  - A Driver (or Dispatcher on their behalf) can open a Trip Sheet with an opening odometer and close it with a closing odometer, subject to odometer monotonicity.
  - A Trip Sheet lifecycle (`draft → planned → in-progress → closed → reversed`) is orchestrated via `ENG-010`; multi-step approval on close routes via `ENG-011` where the tenant so configures.
  - `DeliveryDispatched` and `FieldTicketCreated` events seed trip candidates into a Fleet-owned backlog without mutating source entities.
  - Trip Sheet document numbers are issued deterministically at issuance via `ENG-017` from the Fleet configuration namespace registered by `SPR-MOD-014-001`.
- **Domain events.**
  - `TripClosed` is published via `ENG-024` when a Trip Sheet transitions from `in-progress → closed`. Payload contract is governed by the authoritative event catalog and not redefined here.
- **Consumed events.**
  - `DeliveryDispatched` (from MOD-003 Sales) — consumed read-only to seed trip candidates. No mutation of source entities.
  - `FieldTicketCreated` (from MOD-012 Field Service) — consumed read-only to seed trip candidates. No mutation of source entities.
- **Configuration artifacts.** Trip-Sheet-specific runtime configuration (e.g. closure approval thresholds, notification cadence) resolvable per company via `ENG-005`; Trip Sheet numbering series resolved from the Fleet configuration namespace registered by `SPR-MOD-014-001`.
- **Audit artifacts.** An audit record exists for every Route lifecycle transition, every Trip Sheet lifecycle transition, and every seed-event ingestion, produced via `ENG-004`, consumable by the Platform audit review surface.
- **Notification artifacts.** Trip open, close, and reverse produce notifications via `ENG-025` under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-014-002`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-014 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Trip planning and tracking; submodule Trips | Route master and Trip Sheet lifecycle delivered here |
| §3 Personas — Fleet Manager, Dispatcher, Driver; Finance, Maintenance; Regulator, Insurer | User stories (§4) |
| §4 Business Processes — Trip-plan-to-close | Trip Sheet lifecycle orchestrated via `ENG-010`/`ENG-011` |
| §5 Master Data — Route | Route master delivered in this sprint |
| §6 Transactions — Trip Sheet | Trip Sheet transaction delivered in this sprint |
| §7 Business Rules — a trip cannot be closed without odometer readings; vehicles with expired critical compliance cannot be assigned to trips | Enforced end-to-end here via `ENG-012` against compliance state owned by `SPR-MOD-014-001` |
| §8 Integration Points — `TripClosed` (published); `DeliveryDispatched`, `FieldTicketCreated` (consumed) | Publication via `ENG-024`; consumption via `ENG-024` subscription |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Fleet Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Trip planning and tracking (§2) | `SPR-MOD-014-002` |

This allocation is unique; no other Fleet sprint claims "Trip planning and tracking" as its originating capability. The Route master and Trip Sheet transaction are each originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Trip planning and tracking* and submodule *Trips* → this Sprint PRD → deliverables in §2 (Route master; Trip Sheet lifecycle; driver/vehicle assignment invariants; odometer capture; trip closure; `TripClosed` publication; `DeliveryDispatched` and `FieldTicketCreated` consumption; audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Dispatcher, I want to create, edit, activate, deactivate, and archive Routes under a company (origin, destination, waypoints, distance, standard duration), so that a coherent Route register exists before any Trip Sheet is planned.*
- **US-002.** *As a Dispatcher, I want to plan a Trip Sheet by assigning a Route, a Vehicle, and a Driver — all from the same company — so that trip execution has an authoritative, same-company binding.*
- **US-003.** *As a Dispatcher, I want the system to reject the assignment of a Vehicle with expired critical compliance to any Trip Sheet, so that non-compliant vehicles cannot leave the yard.*
- **US-004.** *As a Dispatcher, I want the system to reject the assignment of a Driver whose linked License is expired, so that unlicensed operation cannot begin.*
- **US-005.** *As a Driver (or Dispatcher on their behalf), I want to open a Trip Sheet with an opening odometer reading and close it with a closing odometer reading (closing ≥ opening), so that trip distance is derived deterministically and defensibly.*
- **US-006.** *As a Dispatcher, I want the Trip Sheet lifecycle (`draft → planned → in-progress → closed → reversed`) enforced via `ENG-010`, with multi-step closure approval via `ENG-011` where the tenant so configures, so that trip execution is auditable and reversible only via an explicit reason-carrying transition.*
- **US-007.** *As a downstream subscriber (Accounting for posting bindings; Analytics for read-model projections), I want `TripClosed` to be published via `ENG-024` on trip closure, so that ledger effects and reporting can react without polling Fleet state.*
- **US-008.** *As a Dispatcher, I want `DeliveryDispatched` (from MOD-003 Sales) and `FieldTicketCreated` (from MOD-012 Field Service) to seed trip candidates into a Fleet-owned backlog, so that outbound deliveries and field visits translate into candidate trips without duplicating source entities.*
- **US-009.** *As a Dispatcher, I want Trip Sheet document numbers to issue at document issuance via the configured numbering series, so that trip identity is stable and audit-traceable.*
- **US-010.** *As a Fleet Manager, I want notifications on Trip Sheet open, close, and reverse under the tenant's configured channels, so that operational visibility is actionable.*
- **US-011.** *As a security reviewer, I want every Route lifecycle transition, every Trip Sheet lifecycle transition, and every seed-event ingestion to be audited via `ENG-004`, so that trip history is reconstructable from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Route master (US-001)

- **Given** a valid Route creation request under a tenant/company (origin, destination, waypoints, distance, standard duration),
  **when** a Dispatcher submits it,
  **then** the Route is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** a Route update, deactivation, or archive request,
  **when** a Dispatcher submits it,
  **then** the transition executes deterministically and every state change is audited via `ENG-004`.

### 5.2 Trip Sheet planning and same-company invariant (US-002)

- **Given** a Trip Sheet plan request bearing a Route, a Vehicle, and a Driver,
  **when** any of Route, Vehicle, or Driver belongs to a different company than the Trip Sheet,
  **then** the request is rejected deterministically via `ENG-012`.
- **Given** a valid same-company plan,
  **when** submitted,
  **then** the Trip Sheet transitions from `draft → planned` and is audited via `ENG-004`.

### 5.3 Expired-compliance blocks assignment (US-003)

- **Given** a Trip Sheet plan or update request assigning a Vehicle,
  **when** that Vehicle has any critical compliance coverage window in an expired state per the compliance state owned by `SPR-MOD-014-001`,
  **then** the assignment is rejected deterministically via `ENG-012`.

### 5.4 Expired-license blocks assignment (US-004)

- **Given** a Trip Sheet plan or update request assigning a Driver,
  **when** the Driver's linked License (per `SPR-MOD-014-001`) has a validity window in an expired state,
  **then** the assignment is rejected deterministically via `ENG-012`.

### 5.5 Odometer capture and monotonicity (US-005)

- **Given** a Trip Sheet in state `planned`,
  **when** it transitions to `in-progress`,
  **then** an opening odometer reading MUST be captured; missing opening odometer causes the transition to be rejected via `ENG-012`.
- **Given** a Trip Sheet in state `in-progress`,
  **when** it transitions to `closed`,
  **then** a closing odometer reading MUST be captured and MUST be greater-than-or-equal-to the opening odometer; violation causes the transition to be rejected via `ENG-012`.

### 5.6 Trip Sheet lifecycle and approval (US-006)

- **Given** a Trip Sheet in any state,
  **when** the state machine transition is not one of `draft → planned`, `planned → in-progress`, `in-progress → closed`, or `closed → reversed` (with reason),
  **then** the transition is rejected deterministically via `ENG-010` / `ENG-012`.
- **Given** a tenant configuration requiring multi-step approval on Trip Sheet closure,
  **when** a closure is submitted,
  **then** approval is routed via `ENG-011`; closure completes only upon final approval.

### 5.7 `TripClosed` publication (US-007)

- **Given** a Trip Sheet transitioning from `in-progress → closed`,
  **when** closure completes (post-approval where required),
  **then** `TripClosed` is published via `ENG-024` exactly once per Trip Sheet closure, using the authoritative envelope and payload contract governed by the event catalog.

### 5.8 Seed-event consumption (US-008)

- **Given** a `DeliveryDispatched` event received from MOD-003 Sales,
  **when** ingested,
  **then** a Fleet-owned trip candidate is registered in the Fleet backlog referencing the source delivery by identifier; the source delivery entity is NOT mutated.
- **Given** a `FieldTicketCreated` event received from MOD-012 Field Service,
  **when** ingested,
  **then** a Fleet-owned trip candidate is registered in the Fleet backlog referencing the source field ticket by identifier; the source field-ticket entity is NOT mutated.
- **Given** a duplicate seed-event delivery for the same source identifier,
  **when** ingested,
  **then** ingestion is idempotent — exactly one trip candidate exists per (source module, source identifier).

### 5.9 Numbering (US-009)

- **Given** Trip Sheet issuance under a company,
  **when** issuance executes,
  **then** a document number is allocated via `ENG-017` from the Trip Sheet numbering series registered under the Fleet configuration namespace by `SPR-MOD-014-001`; the allocated number is immutable thereafter.

### 5.10 Notifications (US-010)

- **Given** a Trip Sheet transition to `in-progress`, `closed`, or `reversed`,
  **when** the transition completes,
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.11 Audit integration (US-011)

- **Given** any Route lifecycle transition, any Trip Sheet lifecycle transition, or any seed-event ingestion,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition (or ingestion) type, and timestamp.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any Route or Trip Sheet read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.13 Ownership consumption invariants

- **Given** any Trip Sheet code path that requires Vehicle, Driver, License, compliance, or insurance data,
  **when** it reads these entities,
  **then** it does so exclusively through Fleet read APIs and events owned by `SPR-MOD-014-001`. This sprint does not redefine Foundation masters or their lifecycles.
- **Given** any Trip Sheet closure with ledger effects (if any),
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through `TripClosed`; no Fleet code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.
- **Given** any seed-event ingestion,
  **when** a Fleet trip candidate is created,
  **then** the source entity (delivery in MOD-003; field ticket in MOD-012) is NOT mutated by Fleet.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-014` — Fleet.
- **Module PRD:** [`docs/20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Trip planning and tracking; submodule Trips), §3 (Fleet Manager, Dispatcher, Driver; Finance, Maintenance; Regulator, Insurer), §4 (Trip-plan-to-close), §5 (Route), §6 (Trip Sheet), §7 (odometer-required-on-close rule; expired-compliance blocks-assignment rule), §8 (`TripClosed` published; `DeliveryDispatched`, `FieldTicketCreated` consumed), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-014` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (consumed indirectly through `TripClosed` posting-rule bindings; not invoked from this sprint).
  - [`MOD012_FIELD_SERVICE_BASELINE_v1`](../../40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md) (frozen) — `FieldTicketCreated` event contract consumed read-only.
- **Upstream sprint dependencies (per Sprint Plan §2):** [`SPR-MOD-014-001`](./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md) — Vehicle, Driver, License masters; vehicle hierarchy; driver–license linkage; compliance and insurance state; Fleet configuration namespace (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals).
- **Cross-module event consumption:** `DeliveryDispatched` from MOD-003 Sales; `FieldTicketCreated` from MOD-012 Field Service. Both consumed read-only via `ENG-024` subscription.
- **Downstream sprints:** `SPR-MOD-014-003` (Fuel & Maintenance), `SPR-MOD-014-004` (Fleet Analytics & Compliance) — per [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.1 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

### 7.2 Upstream Sprint Dependencies (per GT-003 §10 VAL-013B)

| Sprint | Resolved State | Result |
| --- | --- | --- |
| `SPR-MOD-014-001` — Fleet Foundation (Vehicles, Drivers, Compliance & Insurance) | Active (Draft; authored) | PASS |

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Fleet Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and matches the allocation in Sprint Plan §5 for `SPR-MOD-014-002`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Route and Trip Sheet actions. |
| `ENG-004` Audit | Records every Route lifecycle transition, every Trip Sheet lifecycle transition, and every seed-event ingestion. |
| `ENG-005` Configuration | Resolves Trip-Sheet-specific runtime configuration (closure approval thresholds, notification cadence) under the tenant/company hierarchy established by the Platform baseline; consumes the Fleet configuration namespace registered by `SPR-MOD-014-001`. |
| `ENG-007` Document | Provides document classification for trip-scoped documents (odometer photos, gate-passes, way-bills). |
| `ENG-008` Attachment | Provides attachment binding for trip-scoped documents. |
| `ENG-010` Workflow | Orchestrates the Trip Sheet lifecycle (`draft → planned → in-progress → closed → reversed`). |
| `ENG-011` Approval | Routes multi-step approvals on Trip Sheet closure where the tenant so configures. |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, uniqueness, same-company composition) and the operational rules (expired-compliance blocks assignment; expired-license blocks assignment; odometer monotonicity; state-transition legality) at capture and transition time. |
| `ENG-014` Scheduler | Evaluates scheduled Trip Sheet lifecycle triggers where required (e.g. auto-open on scheduled dispatch time). |
| `ENG-017` Numbering | Allocates Trip Sheet document numbers at issuance time from the Trip Sheet numbering series registered under the Fleet configuration namespace by `SPR-MOD-014-001`. |
| `ENG-024` Eventing | Publishes `TripClosed`; subscribes to `DeliveryDispatched` and `FieldTicketCreated` to seed trip candidates. |
| `ENG-025` Notification | Emits notifications on Trip Sheet open, close, and reverse under the tenant's configured channels. |

Fleet business semantics (Route master, Trip Sheet transaction, driver/vehicle assignment invariants, odometer capture, trip closure) are owned by this module and are not delegated to any engine.

`ENG-015` Voucher and `ENG-016` Posting are **not** consumed by this or any Fleet sprint per Sprint Plan §5 — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by Fleet-published events.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Route and Trip Sheet read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Route and Trip Sheet actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Route | MOD-014 (this sprint) | Named route scoped to a tenant/company, carrying origin, destination, waypoints, distance, and standard duration. |
| Trip Sheet | MOD-014 (this sprint) | Trip transaction scoped to a tenant/company, referencing exactly one Route, one Vehicle, and one Driver from the same company; carrying opening and closing odometer readings and a lifecycle state. |
| Trip Candidate | MOD-014 (this sprint) | Fleet-owned backlog record referencing a source event (delivery or field ticket) by identifier; NOT a mutation of the source entity. |

### 10.2 Relationships

- A **company** (owned by MOD-001) owns zero or more **Routes**, zero or more **Trip Sheets**, and zero or more **Trip Candidates**.
- A **Trip Sheet** references exactly one **Route**, exactly one **Vehicle**, and exactly one **Driver**, all within the same company.
- A **Trip Candidate** references exactly one source event by (source module, source identifier); the pair is unique.

### 10.3 Ownership Boundaries

- **Route**, **Trip Sheet**, and **Trip Candidate** are owned by `MOD-014` per the Fleet Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- **Vehicle**, **Driver**, **License**, **Compliance Registration**, **Insurance Coverage**, and **Fleet Configuration** are owned by `SPR-MOD-014-001`; this sprint consumes them read-only.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only via `ENG-002`; it is not a Fleet-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Fleet-owned entities.
- The **Delivery** entity is owned by MOD-003 Sales; the **Field Ticket** entity is owned by MOD-012 Field Service. Neither is redefined here; both are referenced by identifier only.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`TripClosed`** — published via `ENG-024` when a Trip Sheet transitions from `in-progress → closed` (post-approval where required). Per Sprint Plan §2 (`SPR-MOD-014-002`), this is the single domain event originated by this sprint. `FuelRecorded` and `MaintenanceCompleted` are originated by `SPR-MOD-014-003`; `ComplianceExpiring` is originated by `SPR-MOD-014-001`.

### 11.2 Consumed

- **`DeliveryDispatched`** — consumed read-only from MOD-003 Sales via `ENG-024` subscription to seed outbound-delivery trip candidates. Source-entity mutation is prohibited.
- **`FieldTicketCreated`** — consumed read-only from MOD-012 Field Service via `ENG-024` subscription to seed field-service trip candidates. Source-entity mutation is prohibited.

Payload contracts for Fleet events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Route and Trip Sheet read and write.
- [ ] Every Route lifecycle transition, every Trip Sheet lifecycle transition, and every seed-event ingestion produces an audit record via `ENG-004`.
- [ ] Trip Sheet lifecycle (`draft → planned → in-progress → closed → reversed`) is orchestrated via `ENG-010`; illegal transitions are rejected.
- [ ] Multi-step approval on Trip Sheet closure routes via `ENG-011` where the tenant so configures.
- [ ] Expired-compliance-blocks-assignment and expired-license-blocks-assignment rules are enforced at capture and transition time via `ENG-012`.
- [ ] Odometer monotonicity (closing ≥ opening) is enforced at close via `ENG-012`; opening odometer required at open.
- [ ] Trip Sheet numbering issues via `ENG-017` from the Trip Sheet series registered under the Fleet configuration namespace by `SPR-MOD-014-001`.
- [ ] `TripClosed` is published via `ENG-024` exactly once per Trip Sheet closure.
- [ ] `DeliveryDispatched` and `FieldTicketCreated` consumption is idempotent per (source module, source identifier); source entities are never mutated by Fleet.
- [ ] Notifications are emitted via `ENG-025` on Trip Sheet open, close, and reverse under the tenant's configured channels.
- [ ] No Fleet code path writes to `ENG-015` Voucher or `ENG-016` Posting.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-014_SPRINT_PLAN.md` §2 (`SPR-MOD-014-002`):

- Route master records can be created, edited, and archived.
- Trip Sheet lifecycle (draft → planned → in-progress → closed → reversed) is enforced via `ENG-010`/`ENG-011`.
- Trip closure requires captured odometer readings, enforced via `ENG-012`.
- Vehicles with expired critical compliance cannot be assigned, enforced via `ENG-012`.
- `TripClosed` events publish via `ENG-024`; `DeliveryDispatched` and `FieldTicketCreated` events are consumed to seed trip candidates.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 2 depends on `SPR-MOD-014-001` (Fleet Foundation) being authored and its Vehicle, Driver, License, compliance/insurance, and Fleet configuration semantics stable.
  - **Impact:** Any regression in Sprint 1 semantics blocks Trip Sheet assignment invariants (expired-compliance, expired-license, same-company).
  - **Mitigation:** Consume Sprint 1 masters and state read-only through Fleet-owned APIs and events; escalate any regression as a Sprint 1 defect.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-014 depends on `MOD001_PLATFORM_BASELINE_v1` (tenancy, company hierarchy, users/roles/permissions, configuration hierarchy) being frozen.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen Platform baseline contract; treat any regression as a Platform defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-014 depends on `MOD002_ACCOUNTING_BASELINE_v1` for downstream ledger effects triggered by `TripClosed`. This sprint does not itself invoke posting, but the posting-rule binding contract must remain stable.
  - **Impact:** Drift in MOD-002 posting-rule bindings would decouple `TripClosed` from ledger effects.
  - **Mitigation:** Publish `TripClosed` per the authoritative event catalog contract; escalate any change as an Accounting defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** MOD-014 depends on `MOD012_FIELD_SERVICE_BASELINE_v1` for the `FieldTicketCreated` contract.
  - **Impact:** Any regression in the `FieldTicketCreated` contract breaks trip-candidate seeding for field-service dispatch.
  - **Mitigation:** Consume `FieldTicketCreated` per the authoritative event catalog; escalate any change as a Field Service defect.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** MOD-014 consumes `DeliveryDispatched` from MOD-003 Sales. The MOD-003 baseline is authoritative for the source contract.
  - **Impact:** Any regression in the `DeliveryDispatched` contract breaks trip-candidate seeding for outbound deliveries.
  - **Mitigation:** Consume `DeliveryDispatched` per the authoritative event catalog; escalate any change as a Sales defect.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Fleet-owned Route, Trip Sheet, and Trip Candidate entities MUST NOT be redefined by downstream modules; MOD-003 delivery, MOD-012 field ticket, and MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce Route Master Authority (§1.1.1), Trip Sheet Transaction Authority (§1.1.2), and cross-module boundary (§1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 2 publishes `TripClosed` and consumes `DeliveryDispatched` and `FieldTicketCreated`. Any event name not present in the authoritative event catalog at Sprint 2 In-Progress time is a deferred event-catalog registration item.
  - **Impact:** If not registered before this sprint enters `In Progress`, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Confirm event catalog registration for `TripClosed`, `DeliveryDispatched`, and `FieldTicketCreated` before this sprint enters `In Progress`. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Route validation; Trip Sheet state-transition legality; same-company invariants; odometer monotonicity; expired-compliance and expired-license rule evaluation; seed-event idempotency keying.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, structural validation via `ENG-012`, attachment binding via `ENG-008`, workflow via `ENG-010`, approval routing via `ENG-011`, scheduler evaluation via `ENG-014`, numbering allocation via `ENG-017`, event publication and subscription via `ENG-024`, notification emission via `ENG-025`.
- **Contract** — `TripClosed` payload contract per the authoritative event catalog; `DeliveryDispatched` and `FieldTicketCreated` subscriber contracts per the event catalog.
- **End-to-end (smoke)** — Route creation → Trip Sheet plan (assigning compliant Vehicle and licensed Driver) → open with opening odometer → close with closing odometer → `TripClosed` publication → notification emission, with audit records at each step; expired-compliance and expired-license rejection scenarios; seed-event ingestion (delivery and field ticket) producing idempotent trip candidates; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an expired-compliance Vehicle fixture, an expired-license Driver fixture, a `DeliveryDispatched` seed fixture, and a `FieldTicketCreated` seed fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Trip Sheet lifecycle as an explicit `ENG-010` workflow so approval routing on close via `ENG-011` is a first-class transition rather than an out-of-band gate.
- Consider evaluating the expired-compliance and expired-license rules at both plan-time and each subsequent transition so an assignment that becomes non-compliant after planning is caught before open.
- Consider centralizing seed-event ingestion behind a single idempotent handler keyed by (source module, source identifier) so `DeliveryDispatched` and `FieldTicketCreated` share the same de-duplication path.
- Consider recording the opening and closing odometer readings as immutable audit-visible values so trip-distance derivation is transparent and defensible.
- Consider co-locating Trip Sheet numbering with issuance so `ENG-017` is invoked at the state transition that stamps a stable identity on the trip.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-014-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver Trip-plan-to-close: Route master, Trip Sheet transaction lifecycle, driver/vehicle assignment invariants, odometer capture, trip closure, `TripClosed` publication, and consumption of `DeliveryDispatched` and `FieldTicketCreated` (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-014 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Fleet Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters (`SPR-MOD-014-001`), fuel/maintenance (`SPR-MOD-014-003`), analytics (`SPR-MOD-014-004`), MOD-002-owned ledger postings, MOD-003-owned delivery authoring, MOD-012-owned field-ticket authoring, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-014-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-014-003` Fuel & Maintenance is the immediate successor per [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-014-001` and `SPR-MOD-014-002`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md)
- Upstream Fleet Sprint PRD — [`./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md`](./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md), [`../../40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md`](../../40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
