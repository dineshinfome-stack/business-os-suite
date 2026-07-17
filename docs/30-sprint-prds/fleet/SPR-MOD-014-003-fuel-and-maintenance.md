---
title: "SPR-MOD-014-003 — Fuel & Maintenance"
summary: "Sprint PRD for the Fuel & Maintenance layer of MOD-014: Fuel Station master; Fuel Entry transaction lifecycle with telematics reconciliation; Maintenance Order transaction lifecycle with scheduled preventive maintenance; FuelRecorded and MaintenanceCompleted publication. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-014-003"
parent_module: "MOD-014"
parent_sprint_plan: "MOD-014_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "16.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "fleet", "mod-014", "fuel", "maintenance", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD014-003-20260716T029000Z-001"
parent_result_id: "GT003-MOD014-002-20260716T028000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-014-003 — Fuel & Maintenance

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-014 Fleet** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-014-003` (permanent) |
| Parent Module | `MOD-014` — Fleet |
| Parent Sprint Plan | [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) |
| Upstream Sprints | [`SPR-MOD-014-001`](./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md), [`SPR-MOD-014-002`](./SPR-MOD-014-002-trip-planning-and-execution.md) |
| Downstream Sprints | `SPR-MOD-014-004` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Fuel-entry** and **Maintenance-cycle** processes for MOD-014 Fleet: the **Fuel Station** master; the **Fuel Entry** transaction lifecycle with deterministic **telematics reconciliation** where telematics data is available; the **Maintenance Order** transaction lifecycle with **scheduled preventive maintenance** driven by the configured maintenance intervals; and publication of `FuelRecorded` and `MaintenanceCompleted` on completion. This sprint operationalizes the Foundation layer authored in `SPR-MOD-014-001` and the Trip layer authored in `SPR-MOD-014-002` — no upstream master or transaction is reopened here.

> **Fleet Ownership Convention (recapitulated).** The Fleet module owns the business semantics of Fuel Station master, Fuel Entry transaction, telematics-reconciliation rule, Maintenance Order transaction, and scheduled preventive maintenance. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, document, attachment, workflow, approval, rules, automation, scheduler, numbering, eventing, notification) but **MUST NOT** redefine Fleet business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects of fuel and maintenance transactions remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines — no Fleet sprint writes journal entries directly; MOD-002 consumes Fleet-published events through its own posting-rule bindings.

#### 1.1.1 Fuel Station Master Authority

The **Fuel Station** master is authoritatively owned by MOD-014 Fleet, in this sprint. No other module MAY create, edit, archive, or independently maintain a parallel Fuel Station master. Downstream sprints and modules consume the Fuel Station master through Fleet read APIs authored in this and later sprints; they MUST NOT redefine the Fuel Station entity or its lifecycle.

#### 1.1.2 Fuel Entry Transaction Authority

The **Fuel Entry** transaction is authoritatively owned by MOD-014 Fleet, in this sprint. The Fuel Entry lifecycle (`draft → submitted → reconciled → posted → reversed`) — including quantity/amount capture, per-vehicle attribution, and the telematics-reconciliation rule — is defined and enforced here. Downstream sprints and modules consume Fuel Entry state exclusively via Fleet-published events (`FuelRecorded`) and Fleet read APIs; they MUST NOT redefine the Fuel Entry transaction, its lifecycle, or its reconciliation semantics.

#### 1.1.3 Maintenance Order Transaction Authority

The **Maintenance Order** transaction is authoritatively owned by MOD-014 Fleet, in this sprint. The Maintenance Order lifecycle (`draft → scheduled → in-progress → completed → reversed`) — including preventive/corrective classification, service scope, and completion semantics — is defined and enforced here. Downstream sprints and modules consume Maintenance Order state exclusively via Fleet-published events (`MaintenanceCompleted`) and Fleet read APIs; they MUST NOT redefine the Maintenance Order transaction or its lifecycle.

#### 1.1.4 Fleet ↔ Platform, Accounting, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Fleet consumes these read-only via `ENG-002` on this sprint's actions.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Fleet sprint writes journal entries; MOD-002 subscribes to Fleet-published events (`FuelRecorded`, `MaintenanceCompleted`) via its own posting-rule bindings.
- **MOD-017 Analytics** owns cross-module KPI definitions. Fleet operational reports on fuel and maintenance are surfaced by `SPR-MOD-014-004`; cross-module KPIs are never redefined by MOD-014.

Ownership boundaries SHALL NOT be redefined in downstream Fleet Sprint PRDs.

#### 1.1.5 Fuel & Maintenance Configuration Consumption

Fuel Entry and Maintenance Order lifecycles resolve their numbering series via `ENG-017` from the Fleet configuration namespace registered by `SPR-MOD-014-001` (its §1.1.4). Fuel-norms-per-vehicle and maintenance-intervals runtime configuration is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline, consuming the same Fleet configuration namespace. Preventive-maintenance schedule generation and evaluation is driven by `ENG-014` Scheduler from the configured maintenance intervals; deterministic reconciliation automation may be delegated to `ENG-013` Automation where the tenant so configures. No configuration keys owned by other modules are redefined here.

### 1.2 In Scope

- Fuel Station master: create, edit, activate, deactivate, archive under a tenant/company; carrying station identity, location, supplier/fuel-card linkage attributes as authored per the Fuel Station entity.
- Fuel Entry transaction: create (draft) → submit (submitted) → reconcile (reconciled, where telematics available) → post (posted, emitting `FuelRecorded`) → reverse (with explicit reason), under a tenant/company; per-vehicle attribution honoring the Fleet Foundation Vehicle master.
- Telematics-reconciliation rule: **fuel entries reconcile against telematics where available**, evaluated deterministically via `ENG-012` at the `submitted → reconciled` transition when telematics readings for the vehicle and window exist. Where telematics is unavailable, the entry transitions directly per tenant configuration without reconciliation; the absence is recorded on the entry.
- Maintenance Order transaction: create (draft) → schedule (scheduled) → open (in-progress) → complete (completed, emitting `MaintenanceCompleted`) → reverse (with explicit reason), under a tenant/company; preventive/corrective classification; per-vehicle attribution honoring the Fleet Foundation Vehicle master.
- Scheduled preventive maintenance: `ENG-014` Scheduler generates Maintenance Order candidates from the configured maintenance intervals (per Fleet configuration namespace registered by `SPR-MOD-014-001`) on a deterministic cadence.
- Same-company invariants: Fuel Station, Vehicle on a Fuel Entry, and Vehicle on a Maintenance Order MUST belong to the same company under the same tenant as the transaction.
- Multi-step approval routing for Fuel Entry posting and Maintenance Order completion where required by tenant configuration via `ENG-011`.
- Long-running Fuel Entry and Maintenance Order workflow orchestration via `ENG-010`.
- Deterministic reconciliation and preventive-maintenance-generation automation via `ENG-013` where the tenant so configures.
- Structural validations (required fields, referential integrity, uniqueness, same-company composition, state-transition legality, telematics-reconciliation rule) evaluated at capture and transition time via `ENG-012`.
- Document numbers for Fuel Entry and Maintenance Order issued via `ENG-017` from the Fleet configuration namespace registered by `SPR-MOD-014-001`.
- Notifications on Fuel Entry posting, Maintenance Order scheduling, opening, completion, and reversal under the tenant's configured channels via `ENG-025`.
- Audit emission via `ENG-004` for every Fuel Station lifecycle transition, every Fuel Entry lifecycle transition, and every Maintenance Order lifecycle transition.
- Attachment support for fuel- and maintenance-scoped documents (e.g. fuel receipts, service-report photos) via `ENG-008` and document classification via `ENG-007`.
- `FuelRecorded` and `MaintenanceCompleted` domain events published via `ENG-024` on posting and completion respectively.

### 1.3 Out of Scope

- Vehicle, Driver, License masters; vehicle hierarchy; driver–license linkage; compliance and insurance registration; `ComplianceExpiring` publication — `SPR-MOD-014-001` (foundation authored upstream and consumed read-only here).
- Route master; Trip Sheet transaction; driver/vehicle assignment invariants; odometer capture; trip closure; `TripClosed` publication; `DeliveryDispatched` and `FieldTicketCreated` consumption — `SPR-MOD-014-002` (trip layer authored upstream and consumed read-only here where fuel or maintenance entries reference a trip context).
- Fleet read model, operational reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar), dashboards, exports, audit-readiness surface — `SPR-MOD-014-004`.
- Financial postings for fuel and maintenance — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting through posting-rule bindings triggered by `FuelRecorded` and `MaintenanceCompleted`.
- Telematics ingestion pipeline authoring — this sprint consumes telematics readings read-only through the integration surface provided by MOD-014's external systems category (GPS/telematics per Module PRD §8) and does not redefine the telematics contract.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-014-003`, the following will exist:

- **Business capabilities.**
  - A Fleet Manager can create, edit, activate, deactivate, and archive Fuel Station records under a tenant/company.
  - A Driver or Dispatcher can record a Fuel Entry against a Vehicle at a Fuel Station under a company; the entry lifecycle progresses `draft → submitted → reconciled → posted → reversed`.
  - Where telematics readings exist for the Vehicle and the fuel-entry window, the entry reconciles deterministically via `ENG-012`; where telematics is unavailable, the absence is recorded and the entry transitions per tenant configuration.
  - A Maintenance planner can schedule, open, complete, and reverse Maintenance Orders (preventive or corrective) against a Vehicle under a company.
  - `ENG-014` Scheduler generates preventive Maintenance Order candidates from the configured maintenance intervals on the tenant's cadence.
  - Same-company invariants are enforced via `ENG-012` for every Fuel Entry and Maintenance Order at capture and transition time.
  - Multi-step approval on Fuel Entry posting and Maintenance Order completion routes via `ENG-011` where the tenant so configures.
  - Fuel Entry and Maintenance Order document numbers are issued deterministically at issuance via `ENG-017` from the Fleet configuration namespace registered by `SPR-MOD-014-001`.
- **Domain events.**
  - `FuelRecorded` is published via `ENG-024` when a Fuel Entry transitions from `reconciled → posted` (or, where reconciliation is skipped by tenant configuration, from `submitted → posted`). Payload contract is governed by the authoritative event catalog and not redefined here.
  - `MaintenanceCompleted` is published via `ENG-024` when a Maintenance Order transitions from `in-progress → completed`. Payload contract is governed by the authoritative event catalog and not redefined here.
- **Configuration artifacts.** Fuel-norms-per-vehicle and maintenance-intervals runtime configuration resolvable per vehicle and per company via `ENG-005`; Fuel Entry and Maintenance Order numbering series resolved from the Fleet configuration namespace registered by `SPR-MOD-014-001`.
- **Audit artifacts.** An audit record exists for every Fuel Station lifecycle transition, every Fuel Entry lifecycle transition, and every Maintenance Order lifecycle transition, produced via `ENG-004`, consumable by the Platform audit review surface.
- **Notification artifacts.** Fuel Entry posting and Maintenance Order scheduling, opening, completion, and reversal produce notifications via `ENG-025` under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-014-003`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-014 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Fuel and consumables; Maintenance and service; submodules Fuel, Maintenance | Fuel Station master, Fuel Entry lifecycle, and Maintenance Order lifecycle delivered here |
| §3 Personas — Fleet Manager, Dispatcher, Driver; Finance, Maintenance; Regulator, Insurer | User stories (§4) |
| §4 Business Processes — Fuel entry; Maintenance cycle | Fuel Entry and Maintenance Order lifecycles orchestrated via `ENG-010`/`ENG-011`; preventive schedule via `ENG-014` |
| §5 Master Data — Fuel Station | Fuel Station master delivered in this sprint |
| §6 Transactions — Fuel Entry; Maintenance Order | Fuel Entry and Maintenance Order transactions delivered in this sprint |
| §7 Business Rules — fuel entries reconcile against telematics where available | Enforced end-to-end here via `ENG-012` |
| §8 Integration Points — `FuelRecorded`, `MaintenanceCompleted` (published) | Publication via `ENG-024` |
| §10 Configuration — fuel norms per vehicle; maintenance intervals | Resolution via `ENG-005` from the Fleet configuration namespace registered by `SPR-MOD-014-001` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Fleet Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as their originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Fuel and consumables (§2) | `SPR-MOD-014-003` |
| Maintenance and service (§2) | `SPR-MOD-014-003` |

These allocations are unique; no other Fleet sprint claims "Fuel and consumables" or "Maintenance and service" as its originating capability. The Fuel Station master, Fuel Entry transaction, and Maintenance Order transaction are each originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Fuel and consumables* and *Maintenance and service* and submodules *Fuel* and *Maintenance* → this Sprint PRD → deliverables in §2 (Fuel Station master; Fuel Entry lifecycle; telematics-reconciliation rule; Maintenance Order lifecycle; preventive-maintenance scheduling; `FuelRecorded` and `MaintenanceCompleted` publication; audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Fleet Manager, I want to create, edit, activate, deactivate, and archive Fuel Stations under a company (identity, location, supplier/fuel-card linkage), so that a coherent Fuel Station register exists before any Fuel Entry is recorded.*
- **US-002.** *As a Driver (or Dispatcher on their behalf), I want to record a Fuel Entry against a Vehicle at a Fuel Station under a company (quantity, amount, date/time), so that consumption is captured against the correct vehicle and station.*
- **US-003.** *As a Dispatcher, I want the system to reconcile the Fuel Entry against telematics readings for the same Vehicle and window when telematics data is available, so that reconciliation is deterministic and auditable; where telematics is unavailable, the absence is recorded on the entry.*
- **US-004.** *As a Maintenance planner, I want to schedule, open, complete, and reverse Maintenance Orders (preventive or corrective) against a Vehicle under a company, so that service history is captured against the correct vehicle.*
- **US-005.** *As a Maintenance planner, I want `ENG-014` Scheduler to generate preventive Maintenance Order candidates from the configured maintenance intervals on the tenant's cadence, so that preventive maintenance does not depend on manual scheduling.*
- **US-006.** *As a Dispatcher, I want same-company invariants enforced on every Fuel Entry (Fuel Station, Vehicle) and every Maintenance Order (Vehicle), so that cross-company composition cannot occur.*
- **US-007.** *As a Fleet Manager, I want the Fuel Entry lifecycle (`draft → submitted → reconciled → posted → reversed`) and the Maintenance Order lifecycle (`draft → scheduled → in-progress → completed → reversed`) enforced via `ENG-010`, with multi-step approval via `ENG-011` on posting or completion where the tenant so configures, so that both transactions are auditable and reversible only via explicit reason-carrying transitions.*
- **US-008.** *As a downstream subscriber (Accounting for posting bindings; Analytics for read-model projections), I want `FuelRecorded` and `MaintenanceCompleted` to be published via `ENG-024` on posting and completion respectively, so that ledger effects and reporting can react without polling Fleet state.*
- **US-009.** *As a Fleet Manager, I want Fuel Entry and Maintenance Order document numbers to issue at document issuance via the configured numbering series, so that each transaction's identity is stable and audit-traceable.*
- **US-010.** *As a Fleet Manager, I want notifications on Fuel Entry posting and on Maintenance Order scheduling, opening, completion, and reversal under the tenant's configured channels, so that operational visibility is actionable.*
- **US-011.** *As a security reviewer, I want every Fuel Station lifecycle transition, every Fuel Entry lifecycle transition, and every Maintenance Order lifecycle transition to be audited via `ENG-004`, so that fuel and maintenance history are reconstructable from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Fuel Station master (US-001)

- **Given** a valid Fuel Station creation request under a tenant/company (identity, location, supplier/fuel-card linkage),
  **when** a Fleet Manager submits it,
  **then** the Fuel Station is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** a Fuel Station update, deactivation, or archive request,
  **when** a Fleet Manager submits it,
  **then** the transition executes deterministically and every state change is audited via `ENG-004`.

### 5.2 Fuel Entry capture and same-company invariant (US-002, US-006)

- **Given** a Fuel Entry creation request bearing a Fuel Station and a Vehicle,
  **when** either belongs to a different company than the Fuel Entry,
  **then** the request is rejected deterministically via `ENG-012`.
- **Given** a valid same-company Fuel Entry,
  **when** submitted,
  **then** the Fuel Entry transitions from `draft → submitted` and is audited via `ENG-004`.

### 5.3 Telematics reconciliation (US-003)

- **Given** a Fuel Entry in state `submitted` for a Vehicle,
  **when** telematics readings exist for that Vehicle covering the fuel-entry window,
  **then** the reconciliation rule evaluates deterministically via `ENG-012` and the Fuel Entry transitions from `submitted → reconciled`.
- **Given** a Fuel Entry in state `submitted` for a Vehicle,
  **when** telematics readings for that Vehicle and window are unavailable,
  **then** the absence is recorded on the Fuel Entry and the entry transitions per tenant configuration (either directly to `posted` where the tenant permits, or remains `submitted` pending manual reconciliation).

### 5.4 Maintenance Order capture and same-company invariant (US-004, US-006)

- **Given** a Maintenance Order creation request bearing a Vehicle,
  **when** the Vehicle belongs to a different company than the Maintenance Order,
  **then** the request is rejected deterministically via `ENG-012`.
- **Given** a valid same-company Maintenance Order,
  **when** submitted,
  **then** the Maintenance Order transitions from `draft → scheduled` and is audited via `ENG-004`.

### 5.5 Preventive maintenance scheduling (US-005)

- **Given** a tenant's configured maintenance intervals for a Vehicle (per Fleet configuration namespace registered by `SPR-MOD-014-001`),
  **when** `ENG-014` Scheduler evaluates the cadence,
  **then** preventive Maintenance Order candidates are generated deterministically and idempotently; duplicate generation for the same (vehicle, interval, cycle) is suppressed.

### 5.6 Fuel Entry and Maintenance Order lifecycle and approval (US-007)

- **Given** a Fuel Entry in any state,
  **when** the state machine transition is not one of `draft → submitted`, `submitted → reconciled`, `reconciled → posted`, `submitted → posted` (where tenant configuration permits), or `posted → reversed` (with reason),
  **then** the transition is rejected deterministically via `ENG-010` / `ENG-012`.
- **Given** a Maintenance Order in any state,
  **when** the state machine transition is not one of `draft → scheduled`, `scheduled → in-progress`, `in-progress → completed`, or `completed → reversed` (with reason),
  **then** the transition is rejected deterministically via `ENG-010` / `ENG-012`.
- **Given** a tenant configuration requiring multi-step approval on Fuel Entry posting or Maintenance Order completion,
  **when** a posting or completion is submitted,
  **then** approval is routed via `ENG-011`; the transition completes only upon final approval.

### 5.7 `FuelRecorded` and `MaintenanceCompleted` publication (US-008)

- **Given** a Fuel Entry transitioning to `posted`,
  **when** the transition completes (post-approval where required),
  **then** `FuelRecorded` is published via `ENG-024` exactly once per Fuel Entry posting, using the authoritative envelope and payload contract governed by the event catalog.
- **Given** a Maintenance Order transitioning from `in-progress → completed`,
  **when** the transition completes (post-approval where required),
  **then** `MaintenanceCompleted` is published via `ENG-024` exactly once per Maintenance Order completion, using the authoritative envelope and payload contract governed by the event catalog.

### 5.8 Numbering (US-009)

- **Given** Fuel Entry or Maintenance Order issuance under a company,
  **when** issuance executes,
  **then** a document number is allocated via `ENG-017` from the corresponding numbering series registered under the Fleet configuration namespace by `SPR-MOD-014-001`; the allocated number is immutable thereafter.

### 5.9 Notifications (US-010)

- **Given** a Fuel Entry transition to `posted` or `reversed`, or a Maintenance Order transition to `scheduled`, `in-progress`, `completed`, or `reversed`,
  **when** the transition completes,
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.10 Audit integration (US-011)

- **Given** any Fuel Station lifecycle transition, any Fuel Entry lifecycle transition, or any Maintenance Order lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.11 Isolation invariants (`ADR-011`)

- **Given** any Fuel Station, Fuel Entry, or Maintenance Order read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.12 Ownership consumption invariants

- **Given** any Fuel Entry or Maintenance Order code path that requires Vehicle, Driver, License, compliance, or insurance data,
  **when** it reads these entities,
  **then** it does so exclusively through Fleet read APIs and events owned by `SPR-MOD-014-001`. This sprint does not redefine Foundation masters or their lifecycles.
- **Given** any Fuel Entry or Maintenance Order code path that references a trip context,
  **when** it reads Trip Sheet, Route, or Trip Candidate data,
  **then** it does so exclusively through Fleet read APIs and events owned by `SPR-MOD-014-002`. This sprint does not redefine the Trip layer.
- **Given** any Fuel Entry posting or Maintenance Order completion with ledger effects,
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through `FuelRecorded` or `MaintenanceCompleted`; no Fleet code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-014` — Fleet.
- **Module PRD:** [`docs/20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Fuel and consumables; Maintenance and service; submodules Fuel, Maintenance), §3 (Fleet Manager, Dispatcher, Driver; Finance, Maintenance; Regulator, Insurer), §4 (Fuel entry; Maintenance cycle), §5 (Fuel Station), §6 (Fuel Entry; Maintenance Order), §7 (fuel-telematics-reconciliation rule), §8 (`FuelRecorded`, `MaintenanceCompleted` published), §10 (fuel norms per vehicle; maintenance intervals), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-014` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (consumed indirectly through `FuelRecorded` and `MaintenanceCompleted` posting-rule bindings; not invoked from this sprint).
- **Upstream sprint dependencies (per Sprint Plan §2):**
  - [`SPR-MOD-014-001`](./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md) — Vehicle, Driver, License masters; compliance and insurance state; Fleet configuration namespace (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals).
  - [`SPR-MOD-014-002`](./SPR-MOD-014-002-trip-planning-and-execution.md) — Route master and Trip Sheet transaction consumed read-only where fuel or maintenance entries reference a trip context.
- **Downstream sprints:** `SPR-MOD-014-004` (Fleet Analytics & Compliance) — per [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md).

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
| `SPR-MOD-014-002` — Trip Planning & Execution | Active (Draft; authored) | PASS |

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Fleet Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and matches the allocation in Sprint Plan §5 for `SPR-MOD-014-003`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Fuel Station, Fuel Entry, and Maintenance Order actions. |
| `ENG-004` Audit | Records every Fuel Station lifecycle transition, every Fuel Entry lifecycle transition, and every Maintenance Order lifecycle transition. |
| `ENG-005` Configuration | Resolves fuel-norms-per-vehicle and maintenance-intervals runtime configuration under the tenant/company hierarchy established by the Platform baseline; consumes the Fleet configuration namespace registered by `SPR-MOD-014-001`. |
| `ENG-007` Document | Provides document classification for fuel- and maintenance-scoped documents (fuel receipts, service-report photos, work-order documents). |
| `ENG-008` Attachment | Provides attachment binding for fuel- and maintenance-scoped documents. |
| `ENG-010` Workflow | Orchestrates the Fuel Entry lifecycle (`draft → submitted → reconciled → posted → reversed`) and the Maintenance Order lifecycle (`draft → scheduled → in-progress → completed → reversed`). |
| `ENG-011` Approval | Routes multi-step approvals on Fuel Entry posting and Maintenance Order completion where the tenant so configures. |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, uniqueness, same-company composition, state-transition legality) and the operational rule (fuel-telematics-reconciliation) at capture and transition time. |
| `ENG-013` Automation | Executes deterministic reconciliation and preventive-maintenance-generation automation where the tenant so configures. |
| `ENG-014` Scheduler | Generates preventive Maintenance Order candidates from configured maintenance intervals on the tenant's cadence. |
| `ENG-017` Numbering | Allocates Fuel Entry and Maintenance Order document numbers at issuance time from the numbering series registered under the Fleet configuration namespace by `SPR-MOD-014-001`. |
| `ENG-024` Eventing | Publishes `FuelRecorded` on Fuel Entry posting and `MaintenanceCompleted` on Maintenance Order completion. |
| `ENG-025` Notification | Emits notifications on Fuel Entry posting and Maintenance Order scheduling, opening, completion, and reversal under the tenant's configured channels. |

Fleet business semantics (Fuel Station master, Fuel Entry transaction, telematics-reconciliation rule, Maintenance Order transaction, scheduled preventive maintenance) are owned by this module and are not delegated to any engine.

`ENG-015` Voucher and `ENG-016` Posting are **not** consumed by this or any Fleet sprint per Sprint Plan §5 — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by Fleet-published events.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Fuel Station, Fuel Entry, and Maintenance Order read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Fuel Station, Fuel Entry, and Maintenance Order actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Fuel Station | MOD-014 (this sprint) | Named fuel station scoped to a tenant/company, carrying identity, location, and supplier/fuel-card linkage attributes. |
| Fuel Entry | MOD-014 (this sprint) | Fuel-consumption transaction scoped to a tenant/company, referencing exactly one Vehicle and exactly one Fuel Station from the same company; carrying quantity, amount, date/time, telematics-reconciliation state, and lifecycle state. |
| Maintenance Order | MOD-014 (this sprint) | Maintenance transaction scoped to a tenant/company, referencing exactly one Vehicle from the same company; carrying preventive/corrective classification, service scope, and lifecycle state. |

### 10.2 Relationships

- A **company** (owned by MOD-001) owns zero or more **Fuel Stations**, zero or more **Fuel Entries**, and zero or more **Maintenance Orders**.
- A **Fuel Entry** references exactly one **Fuel Station** and exactly one **Vehicle**, both within the same company.
- A **Maintenance Order** references exactly one **Vehicle** within the same company.

### 10.3 Ownership Boundaries

- **Fuel Station**, **Fuel Entry**, and **Maintenance Order** are owned by `MOD-014` per the Fleet Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- **Vehicle**, **Driver**, **License**, **Compliance Registration**, **Insurance Coverage**, and **Fleet Configuration** are owned by `SPR-MOD-014-001`; this sprint consumes them read-only.
- **Route**, **Trip Sheet**, and **Trip Candidate** are owned by `SPR-MOD-014-002`; this sprint consumes them read-only where a fuel or maintenance transaction references a trip context.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only via `ENG-002`; it is not a Fleet-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Fleet-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`FuelRecorded`** — published via `ENG-024` when a Fuel Entry transitions to `posted` (post-approval where required). Per Sprint Plan §2 (`SPR-MOD-014-003`), this event is originated by this sprint.
- **`MaintenanceCompleted`** — published via `ENG-024` when a Maintenance Order transitions from `in-progress → completed` (post-approval where required). Per Sprint Plan §2 (`SPR-MOD-014-003`), this event is originated by this sprint.

### 11.2 Consumed

- No cross-module event consumption originates in this sprint. `DeliveryDispatched` and `FieldTicketCreated` are consumed by `SPR-MOD-014-002`; `ComplianceExpiring` is originated by `SPR-MOD-014-001`. This sprint consumes upstream Fleet state read-only through Fleet-owned APIs.

Payload contracts for Fleet events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Fuel Station, Fuel Entry, and Maintenance Order read and write.
- [ ] Every Fuel Station lifecycle transition, every Fuel Entry lifecycle transition, and every Maintenance Order lifecycle transition produces an audit record via `ENG-004`.
- [ ] Fuel Entry lifecycle (`draft → submitted → reconciled → posted → reversed`) and Maintenance Order lifecycle (`draft → scheduled → in-progress → completed → reversed`) are orchestrated via `ENG-010`; illegal transitions are rejected.
- [ ] Multi-step approval on Fuel Entry posting and Maintenance Order completion routes via `ENG-011` where the tenant so configures.
- [ ] Telematics-reconciliation rule is enforced at the `submitted → reconciled` transition via `ENG-012` when telematics readings for the vehicle and window exist; absence is recorded on the entry when unavailable.
- [ ] Same-company invariants for Fuel Entry (Fuel Station, Vehicle) and Maintenance Order (Vehicle) are enforced at capture and transition time via `ENG-012`.
- [ ] `ENG-014` Scheduler generates preventive Maintenance Order candidates from configured maintenance intervals; duplicate generation for the same (vehicle, interval, cycle) is suppressed.
- [ ] Fuel Entry and Maintenance Order numbering issues via `ENG-017` from the corresponding series registered under the Fleet configuration namespace by `SPR-MOD-014-001`.
- [ ] `FuelRecorded` is published via `ENG-024` exactly once per Fuel Entry posting; `MaintenanceCompleted` is published via `ENG-024` exactly once per Maintenance Order completion.
- [ ] Notifications are emitted via `ENG-025` on Fuel Entry posting and Maintenance Order scheduling, opening, completion, and reversal under the tenant's configured channels.
- [ ] No Fleet code path writes to `ENG-015` Voucher or `ENG-016` Posting.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-014_SPRINT_PLAN.md` §2 (`SPR-MOD-014-003`):

- Fuel Station records can be created, edited, and archived.
- Fuel Entry lifecycle is enforced via `ENG-010`/`ENG-011`; reconciliation against telematics runs deterministically via `ENG-012` when telematics data is available.
- Maintenance Order lifecycle is enforced via `ENG-010`/`ENG-011`; scheduled preventive maintenance triggers via `ENG-014` per configured intervals.
- `FuelRecorded` and `MaintenanceCompleted` events publish via `ENG-024`.
- Document numbers issue through `ENG-017`; all state changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 3 depends on `SPR-MOD-014-001` (Fleet Foundation) being authored and its Vehicle master, Fleet configuration namespace (fuel norms per vehicle, maintenance intervals), and numbering series semantics stable.
  - **Impact:** Any regression in Sprint 1 semantics blocks Fuel Entry and Maintenance Order same-company invariants, numbering, and configuration resolution.
  - **Mitigation:** Consume Sprint 1 masters, configuration namespace, and numbering series read-only through Fleet-owned APIs; escalate any regression as a Sprint 1 defect.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Sprint 3 depends on `SPR-MOD-014-002` (Trip Planning & Execution) for read-only trip-context references from Fuel Entries and Maintenance Orders that carry trip attribution.
  - **Impact:** Any regression in the Trip Sheet or Route contract breaks trip-context attribution on fuel and maintenance transactions.
  - **Mitigation:** Consume the Trip layer read-only via Fleet-owned APIs; escalate any regression as a Sprint 2 defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-014 depends on `MOD001_PLATFORM_BASELINE_v1` (tenancy, company hierarchy, users/roles/permissions, configuration hierarchy) being frozen.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen Platform baseline contract; treat any regression as a Platform defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** MOD-014 depends on `MOD002_ACCOUNTING_BASELINE_v1` for downstream ledger effects triggered by `FuelRecorded` and `MaintenanceCompleted`. This sprint does not itself invoke posting, but the posting-rule binding contract must remain stable.
  - **Impact:** Drift in MOD-002 posting-rule bindings would decouple `FuelRecorded` and `MaintenanceCompleted` from ledger effects.
  - **Mitigation:** Publish both events per the authoritative event catalog contract; escalate any change as an Accounting defect.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Telematics data availability varies by tenant. The telematics-reconciliation rule is conditional on telematics readings existing for the vehicle and window.
  - **Impact:** Where telematics is unavailable, reconciliation cannot run; without an explicit tenant-configured fallback, Fuel Entries could stall in `submitted`.
  - **Mitigation:** Resolve the fallback path (skip-to-`posted` versus remain-`submitted` pending manual reconciliation) via `ENG-005` per tenant; record telematics absence explicitly on the entry.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Fleet-owned Fuel Station, Fuel Entry, and Maintenance Order entities MUST NOT be redefined by downstream modules; MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce Fuel Station Master Authority (§1.1.1), Fuel Entry Transaction Authority (§1.1.2), Maintenance Order Transaction Authority (§1.1.3), and cross-module boundary (§1.1.4) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 3 publishes `FuelRecorded` and `MaintenanceCompleted`. Any event name not present in the authoritative event catalog at Sprint 3 In-Progress time is a deferred event-catalog registration item.
  - **Impact:** If not registered before this sprint enters `In Progress`, publishers cannot emit and subscribers cannot subscribe.
  - **Mitigation:** Confirm event catalog registration for `FuelRecorded` and `MaintenanceCompleted` before this sprint enters `In Progress`. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Fuel Station validation; Fuel Entry and Maintenance Order state-transition legality; same-company invariants; telematics-reconciliation rule evaluation; preventive-maintenance idempotency keying by (vehicle, interval, cycle).
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, structural validation via `ENG-012`, attachment binding via `ENG-008`, workflow via `ENG-010`, approval routing via `ENG-011`, automation via `ENG-013`, scheduler evaluation via `ENG-014`, numbering allocation via `ENG-017`, event publication via `ENG-024`, notification emission via `ENG-025`.
- **Contract** — `FuelRecorded` and `MaintenanceCompleted` payload contracts per the authoritative event catalog.
- **End-to-end (smoke)** — Fuel Station creation → Fuel Entry submit → reconcile against telematics fixture → post → `FuelRecorded` publication → notification emission, with audit records at each step; parallel path with telematics absent producing the configured fallback. Maintenance Order schedule → open → complete → `MaintenanceCompleted` publication → notification emission, with audit records at each step; preventive-maintenance generation smoke exercising `ENG-014` cadence. Two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, a telematics-present Vehicle fixture, a telematics-absent Vehicle fixture, a preventive-maintenance interval fixture, and a Fuel Entry approval-required fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Fuel Entry and Maintenance Order lifecycles as explicit `ENG-010` workflows so approval routing on posting or completion via `ENG-011` is a first-class transition rather than an out-of-band gate.
- Consider centralizing the telematics-reconciliation rule behind a single deterministic evaluator so both same-window and near-window strategies remain configurable via `ENG-005` without redefining the rule.
- Consider generating preventive Maintenance Order candidates behind a single idempotent handler keyed by (vehicle, interval, cycle) so `ENG-014` cadence re-runs do not duplicate candidates.
- Consider co-locating Fuel Entry and Maintenance Order numbering with issuance so `ENG-017` is invoked at the state transition that stamps a stable identity on each transaction.
- Consider recording the telematics reading identifiers used during reconciliation as immutable audit-visible references so reconciliation is defensible.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-014-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver Fuel-entry and Maintenance-cycle: Fuel Station master, Fuel Entry transaction with telematics reconciliation, Maintenance Order transaction with scheduled preventive maintenance, and publication of `FuelRecorded` and `MaintenanceCompleted` (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-014 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Fleet Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters (`SPR-MOD-014-001`), trip layer (`SPR-MOD-014-002`), analytics (`SPR-MOD-014-004`), MOD-002-owned ledger postings, telematics ingestion pipeline authoring, identity/permissions (MOD-001), and cross-module KPI definitions (MOD-017) — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-014-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-014-004` Fleet Analytics & Compliance is the immediate successor per [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-014-001`, `SPR-MOD-014-002`, and `SPR-MOD-014-003`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md)
- Upstream Fleet Sprint PRDs — [`./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md`](./SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md), [`./SPR-MOD-014-002-trip-planning-and-execution.md`](./SPR-MOD-014-002-trip-planning-and-execution.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
