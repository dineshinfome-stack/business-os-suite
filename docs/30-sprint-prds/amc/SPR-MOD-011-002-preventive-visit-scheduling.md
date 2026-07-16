---
title: "SPR-MOD-011-002 — Preventive Visit Scheduling"
summary: "Sprint PRD for the Preventive Visit Scheduling slice of MOD-011: Visit Schedule transaction lifecycle, automated preventive schedule generation, entitlement consumption tracking, and coverage-window rule enforcement. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-011-002"
parent_module: "MOD-011"
parent_sprint_plan: "MOD-011_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "13.0.2"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-012", "ENG-013", "ENG-014", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "amc", "mod-011", "scheduling", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD011-002-20260716T002000Z-001"
parent_result_id: "GT003-MOD011-001-20260716T001000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-011-002 — Preventive Visit Scheduling

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-011 AMC** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-011-002` (permanent) |
| Parent Module | `MOD-011` — AMC |
| Parent Sprint Plan | [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-011-001`](./SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD006_CRM_BASELINE_v1`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-011-003` … `SPR-MOD-011-004` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver **Preventive Visit Scheduling** for BusinessOS on top of the AMC Foundation authored in `SPR-MOD-011-001`: the Visit Schedule transaction lifecycle, automated preventive schedule generation from contract terms via `ENG-013` Automation and `ENG-014` Scheduler, entitlement consumption tracking, and enforcement of the coverage-window rule via `ENG-012`. This sprint completes the Contract-to-schedule and Visit-to-consumption business processes owned by AMC.

> **AMC Ownership Convention.** The AMC module owns the business semantics of the Visit Schedule transaction lifecycle, the preventive-schedule generation policy, entitlement-consumption accounting against Contracts and Entitlements owned by `SPR-MOD-011-001`, and the coverage-window rule. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, workflow, rules, automation, scheduling, eventing, notification) but **MUST NOT** redefine AMC business rules. Field-visit execution remains exclusive to **MOD-012 Field Service**; AMC schedules visits and consumes `FieldVisitCompleted` events, but never executes visits itself. Service-desk closures remain exclusive to **MOD-016 Service Desk**; AMC consumes `ServiceTicketClosed` events for entitlement-consumption bookkeeping. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Customer master remains exclusive to **MOD-006 CRM**. Financial posting remains exclusive to **MOD-002 Accounting**.

#### 1.1.1 Visit Schedule Transaction Authority

The **Visit Schedule** transaction is authoritatively owned by MOD-011 AMC. No other module MAY create, edit, cancel, or independently maintain a parallel Visit Schedule. Downstream sprints and modules consume Visit Schedules through the AMC-owned event `VisitScheduled` published in this sprint and the AMC read APIs authored here; they MUST NOT redefine the transaction or its lifecycle.

#### 1.1.2 AMC ↔ Field Service Boundary (Visit Execution)

- **MOD-012 Field Service** owns field-visit execution (dispatch, on-site work, closure) and originates `FieldVisitCompleted` per the authoritative event catalog.
- **MOD-011 AMC** owns the *scheduling* of preventive visits against contracts and consumes `FieldVisitCompleted` read-only to advance entitlement consumption. Visit execution semantics are **not** redefined here.

#### 1.1.3 AMC ↔ Service Desk Boundary (Reactive Consumption)

- **MOD-016 Service Desk** owns the service-ticket lifecycle and originates `ServiceTicketClosed` per the authoritative event catalog.
- **MOD-011 AMC** consumes `ServiceTicketClosed` read-only to record reactive entitlement consumption against the referenced Contract/Entitlement. Service-desk semantics are **not** redefined here.

#### 1.1.4 AMC ↔ Foundation Boundary

- The Contract, Entitlement, and Coverage masters remain owned by `SPR-MOD-011-001`. This sprint reads them read-only and MUST NOT redefine their lifecycles, coverage semantics, or entitlement definitions.
- AMC operations configuration (SLA definitions, escalation policies, numbering series) registered in `SPR-MOD-011-001` is **evaluated** here for scheduling and notification purposes without redefining the registration.

#### 1.1.5 AMC ↔ Platform Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. AMC consumes these read-only via `ENG-002` Authorization and the identity resolution inherited from `SPR-MOD-011-001`.

Ownership boundaries SHALL NOT be redefined in downstream AMC Sprint PRDs.

### 1.2 In Scope

- Visit Schedule transaction: create, update, and cancel against an `active` Contract under a tenant/company. Each Visit Schedule references exactly one Contract and, where applicable, a specific Entitlement scoped to that Contract; every reference resolves within the same tenant/company.
- Visit Schedule transaction lifecycle (planned → confirmed → completed | cancelled) enforced via `ENG-010` Workflow.
- Automated preventive schedule generation from contract terms (Coverage window, contractual visit cadence, SLA definitions resolved via `ENG-005`) using `ENG-013` Automation and `ENG-014` Scheduler.
- Entitlement consumption tracking driven by `FieldVisitCompleted` and `ServiceTicketClosed` consumption; consumption is recorded against the referenced Contract/Entitlement within the same tenant/company.
- Enforcement of the Module PRD §7 rule: *"A visit cannot be booked outside the contract's coverage window."* Enforced via `ENG-012` Rules at Visit Schedule capture time.
- `VisitScheduled` domain event published via `ENG-024` when a Visit Schedule is confirmed for execution.
- Read-only consumption of `FieldVisitCompleted` (originated by MOD-012 Field Service) via `ENG-024` to advance entitlement consumption; field-visit execution is not redefined.
- Read-only consumption of `ServiceTicketClosed` (originated by MOD-016 Service Desk) via `ENG-024` to record reactive entitlement consumption; service-ticket semantics are not redefined.
- Notification emission on Visit Schedule state transitions via `ENG-025` under the tenant's configured channels.
- Structural validation (required fields, referential integrity, same-company invariants, contract-state invariants, coverage-window rule) via `ENG-012` at capture time.
- Audit emission via `ENG-004` for every Visit Schedule lifecycle transition and every entitlement-consumption update.

### 1.3 Out of Scope

- Contract, Entitlement, Coverage master data; Contract transaction lifecycle; AMC operations configuration *registration*; `ContractSigned` publication — `SPR-MOD-011-001` (this sprint consumes them without redefining them).
- Renewal Terms master, Contract Invoice transaction (upfront and periodic), Renewal transaction lifecycle, termination handling, auto-renewal rules, notice-period rule, post-termination entitlement-block rule — `SPR-MOD-011-003`.
- AMC read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-011-004`.
- Field-visit execution (dispatch, on-site work, visit closure) and the origination of `FieldVisitCompleted` — owned by MOD-012 Field Service.
- Service-ticket lifecycle and the origination of `ServiceTicketClosed` — owned by MOD-016 Service Desk.
- Customer master and CRM-originating lifecycle — owned by MOD-006 CRM.
- Financial postings for any downstream contract-invoice events — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-011-002`, the following will exist:

- **Business capabilities.**
  - A Field Coordinator can create, update, and cancel Visit Schedules against an `active` Contract under a tenant/company, referencing an in-scope Entitlement where applicable.
  - A Field Coordinator can drive a Visit Schedule through its lifecycle (`planned → confirmed → completed | cancelled`), enforced via `ENG-010` Workflow.
  - Preventive schedules are generated automatically from contract terms and Coverage windows via `ENG-013` Automation and `ENG-014` Scheduler, using SLA definitions and cadence configuration resolved through `ENG-005` (registered by `SPR-MOD-011-001`).
  - The coverage-window rule is enforced deterministically via `ENG-012` at Visit Schedule capture time.
  - Entitlement consumption is recorded against the referenced Contract/Entitlement upon consumption of `FieldVisitCompleted` and `ServiceTicketClosed`.
- **Domain events.**
  - `VisitScheduled` is published via `ENG-024` when a Visit Schedule is confirmed for execution.
  - `FieldVisitCompleted` and `ServiceTicketClosed` are consumed via `ENG-024`. Payload contracts are governed by the authoritative event catalog and not redefined here.
- **Configuration artifacts.** No new configuration namespace is registered by this sprint. AMC operations configuration registered in `SPR-MOD-011-001` is *evaluated* here.
- **Audit artifacts.** An audit record exists for every Visit Schedule lifecycle transition and every entitlement-consumption update, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Visit Schedule state transitions produce notifications via `ENG-025` under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-011-002`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-011 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Preventive visit scheduling; Service level tracking; submodule Scheduling | Visit Schedule transaction, automated preventive generation, and entitlement-consumption tracking |
| §3 Personas — Field Coordinator, Service Manager; Customer | User stories (§4) |
| §4 Business Processes — Contract-to-schedule, Visit-to-consumption | End-to-end Visit Schedule lifecycle and entitlement consumption via `FieldVisitCompleted` and `ServiceTicketClosed` |
| §6 Transactions — Visit Schedule | Visit Schedule transaction lifecycle (`planned → confirmed → completed | cancelled`) |
| §7 Business Rules — "A visit cannot be booked outside the contract's coverage window" | Coverage-window rule enforcement via `ENG-012` |
| §8 Integration Points — `VisitScheduled` (published); `FieldVisitCompleted`, `ServiceTicketClosed` (consumed) | `VisitScheduled` publication via `ENG-024`; consumption of `FieldVisitCompleted` and `ServiceTicketClosed` via `ENG-024` |
| §10 Configuration — SLA definitions, Escalation policies | Evaluated via `ENG-005` (registered by `SPR-MOD-011-001`) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved AMC Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as their originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Preventive visit scheduling (§2) | `SPR-MOD-011-002` |
| Service level tracking (§2) | `SPR-MOD-011-002` |

These allocations are unique; no other AMC sprint claims "Preventive visit scheduling" or "Service level tracking" as originating capabilities. The **Visit Schedule** transaction is originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Preventive visit scheduling* and *Service level tracking*, and submodule *Scheduling* → this Sprint PRD → deliverables in §2 (Visit Schedule transaction lifecycle, automated preventive schedule generation, entitlement-consumption tracking, coverage-window rule enforcement, `VisitScheduled` publication, `FieldVisitCompleted` and `ServiceTicketClosed` consumption, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Field Coordinator, I want to create, update, and cancel Visit Schedules against an `active` Contract under a company, referencing an in-scope Entitlement where applicable, so that a coherent preventive schedule exists per contract.*
- **US-002.** *As a Field Coordinator, I want to drive a Visit Schedule through its lifecycle (`planned → confirmed → completed | cancelled`) via workflow, so that state transitions are governed deterministically.*
- **US-003.** *As a Service Manager, I want preventive schedules to be generated automatically from contract terms, Coverage windows, and SLA definitions, so that operational cadence is deterministic and audit-traceable.*
- **US-004.** *As a Contracts Officer, I want the coverage-window rule enforced at Visit Schedule capture time, so that no visit can be booked outside a contract's coverage window.*
- **US-005.** *As a downstream subscriber (Field Service, Analytics), I want `VisitScheduled` to be published when a Visit Schedule is confirmed, so that downstream modules can react without polling AMC state.*
- **US-006.** *As a Service Manager, I want entitlement consumption to advance automatically upon `FieldVisitCompleted` consumption, so that entitlement balances reflect completed preventive work without manual reconciliation.*
- **US-007.** *As a Service Manager, I want entitlement consumption to advance automatically upon `ServiceTicketClosed` consumption when the closure references an AMC-covered Contract/Entitlement, so that reactive consumption is captured against the same authoritative ledger.*
- **US-008.** *As a Field Coordinator, I want notifications on Visit Schedule state transitions, so that stakeholders are informed under the tenant's configured channels.*
- **US-009.** *As a security reviewer, I want every Visit Schedule lifecycle transition and every entitlement-consumption update to be audited via `ENG-004`, so that I can reconstruct scheduling and consumption history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Visit Schedule creation and update (US-001)

- **Given** a valid Visit Schedule request under a tenant/company referencing an `active` Contract in the same company and, where applicable, an Entitlement scoped to that Contract,
  **when** a Field Coordinator submits it,
  **then** the Visit Schedule is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to bind a Visit Schedule to a Contract that is not `active` (i.e. in `draft`, `signed`, or `terminated`), or to a Contract in a different company, or to a non-existent Contract,
  **when** the request is submitted,
  **then** the request is rejected deterministically.
- **Given** an attempt to reference an Entitlement not scoped to the Visit Schedule's Contract or not in the same company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.2 Visit Schedule lifecycle (US-002)

- **Given** a Visit Schedule in `planned`,
  **when** a Field Coordinator confirms it,
  **then** the Visit Schedule transitions to `confirmed` via `ENG-010`, `VisitScheduled` is published via `ENG-024`, and the transition is audited.
- **Given** a Visit Schedule in `confirmed`,
  **when** the underlying field visit completes (via `FieldVisitCompleted` consumption),
  **then** the Visit Schedule transitions to `completed` deterministically, and the transition is audited.
- **Given** a Visit Schedule in `planned` or `confirmed`,
  **when** a legitimate cancellation is submitted,
  **then** the Visit Schedule transitions to `cancelled` via `ENG-010`, and the transition is audited.
- **Given** an attempt to transition a Visit Schedule along any path not declared by the lifecycle (e.g. `completed → planned`, `cancelled → confirmed`),
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.3 Automated preventive schedule generation (US-003)

- **Given** an `active` Contract with a well-formed Coverage window and cadence resolvable via `ENG-005`,
  **when** the scheduling window advances (via `ENG-014` Scheduler triggering `ENG-013` Automation),
  **then** Visit Schedules are generated for each cadence slot within the Coverage window, each in `planned` state, and each generation is audited.
- **Given** a Contract that is not `active`, or a Contract lacking cadence configuration,
  **when** the scheduling window advances,
  **then** no Visit Schedule is generated for that Contract.

### 5.4 Coverage-window rule (US-004)

- **Given** a Visit Schedule request whose scheduled window falls outside the Contract's Coverage window,
  **when** the request is submitted,
  **then** it is rejected deterministically via `ENG-012` (foundation enforcement of the Module PRD §7 "A visit cannot be booked outside the contract's coverage window" rule).
- **Given** a Visit Schedule request whose scheduled window falls entirely within the Contract's Coverage window,
  **when** the request is submitted,
  **then** the coverage-window rule is satisfied and processing continues.

### 5.5 Event publication (US-005)

- **Given** a Visit Schedule transitioning to `confirmed`,
  **when** the transition completes,
  **then** `VisitScheduled` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.

### 5.6 `FieldVisitCompleted` consumption (US-006)

- **Given** a `FieldVisitCompleted` event whose payload references an AMC-owned Visit Schedule under the same tenant/company,
  **when** the event is delivered via `ENG-024`,
  **then** the referenced Visit Schedule transitions to `completed` (if still `confirmed`), the associated Entitlement (where applicable) advances its consumption, and the update is audited.
- **Given** a `FieldVisitCompleted` event that does not reference an AMC-owned Visit Schedule or references one in a different tenant/company,
  **when** the event is delivered,
  **then** it is ignored deterministically (no state change, no consumption update).

### 5.7 `ServiceTicketClosed` consumption (US-007)

- **Given** a `ServiceTicketClosed` event whose payload references an AMC-covered Contract/Entitlement under the same tenant/company,
  **when** the event is delivered via `ENG-024`,
  **then** the referenced Entitlement advances its consumption, and the update is audited.
- **Given** a `ServiceTicketClosed` event that does not reference an AMC-covered Contract/Entitlement or references one in a different tenant/company,
  **when** the event is delivered,
  **then** it is ignored deterministically (no consumption update).

### 5.8 Notification emission (US-008)

- **Given** any Visit Schedule state transition,
  **when** it completes,
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.9 Audit integration (US-009)

- **Given** any Visit Schedule lifecycle transition or entitlement-consumption update,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor (or automation identity), tenant/company scope, entity identifier, transition or consumption type, and timestamp.

### 5.10 Isolation invariants (`ADR-011`)

- **Given** any Visit Schedule read or write, or any consumption-update read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed. `FieldVisitCompleted` and `ServiceTicketClosed` events are only applied to Visit Schedules and Entitlements within the same tenant/company as the event payload.

### 5.11 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Visit Schedule data,
  **when** it reads or reacts to Visit Schedules,
  **then** it does so exclusively through the AMC-owned event `VisitScheduled` and AMC read APIs. No downstream module creates an independent Visit Schedule transaction.
- **Given** any AMC code path that requires field-visit execution data,
  **when** it needs a completed field visit,
  **then** it consumes `FieldVisitCompleted` read-only from MOD-012; field-visit execution is not redefined here.
- **Given** any AMC code path that requires service-ticket closure data,
  **when** it needs a closed service ticket,
  **then** it consumes `ServiceTicketClosed` read-only from MOD-016; service-ticket lifecycle is not redefined here.
- **Given** any AMC code path that requires Contract, Entitlement, or Coverage data,
  **when** it reads them,
  **then** it does so read-only against the masters owned by `SPR-MOD-011-001`; those masters are not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-011` — AMC.
- **Module PRD:** [`docs/20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Preventive visit scheduling; Service level tracking; submodule Scheduling), §3 (Field Coordinator, Service Manager; Customer), §4 (Contract-to-schedule, Visit-to-consumption), §6 (Visit Schedule transaction), §7 ("A visit cannot be booked outside the contract's coverage window"), §8 (`VisitScheduled` published; `FieldVisitCompleted`, `ServiceTicketClosed` consumed), §10 (SLA definitions, Escalation policies — evaluated), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-011` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD006_CRM_BASELINE_v1`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) — Customer master consumed read-only via the Contract binding inherited from `SPR-MOD-011-001`.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-011-001` — AMC Foundation (Contracts & Entitlements).
- **Cross-module consumption (events only):**
  - `FieldVisitCompleted` originated by **MOD-012 Field Service**, consumed read-only via `ENG-024`.
  - `ServiceTicketClosed` originated by **MOD-016 Service Desk**, consumed read-only via `ENG-024`.
- **Downstream sprints:** `SPR-MOD-011-003` (Contract Billing & Renewals), `SPR-MOD-011-004` (AMC Analytics & Compliance) — per [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the AMC Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Visit Schedule actions and consumption updates. |
| `ENG-004` Audit | Records every Visit Schedule lifecycle transition and every entitlement-consumption update. |
| `ENG-005` Configuration | Resolves AMC operations configuration (SLA definitions, escalation policies, cadence) registered by `SPR-MOD-011-001` for scheduling and notification purposes. |
| `ENG-010` Workflow | Enforces the Visit Schedule transaction lifecycle (`planned → confirmed → completed | cancelled`). |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, same-company invariants, contract-state invariants) and the coverage-window rule at capture time. |
| `ENG-013` Automation | Executes preventive-schedule generation from contract terms. |
| `ENG-014` Scheduler | Triggers preventive-schedule generation at the configured cadence. |
| `ENG-024` Eventing | Publishes `VisitScheduled`; consumes `FieldVisitCompleted` and `ServiceTicketClosed`. |
| `ENG-025` Notification | Emits notifications on Visit Schedule state transitions under the tenant's configured channels. |

AMC business semantics (Visit Schedule transaction lifecycle, preventive-schedule generation policy, entitlement-consumption accounting, coverage-window rule) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Visit Schedule read/write and every entitlement-consumption update, including event application. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Visit Schedule actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Visit Schedule | MOD-011 (this sprint) | Scheduled preventive or reactive visit against an `active` Contract under a tenant/company; references at most one Entitlement scoped to that Contract; runs a lifecycle (`planned → confirmed → completed | cancelled`). |
| Entitlement Consumption Record | MOD-011 (this sprint) | Consumption entry against an Entitlement (owned by `SPR-MOD-011-001`) driven by `FieldVisitCompleted` or `ServiceTicketClosed`. |

### 10.2 Relationships

- A **Contract** (owned by `SPR-MOD-011-001`) originates zero or more **Visit Schedules** while it is `active`, all within the same tenant/company.
- A **Visit Schedule** references exactly one Contract within the same company and at most one Entitlement scoped to that Contract.
- An **Entitlement Consumption Record** references exactly one Entitlement within the same tenant/company and is driven by exactly one upstream event (`FieldVisitCompleted` or `ServiceTicketClosed`).

### 10.3 Ownership Boundaries

- Entities listed here are owned by `MOD-011` per the AMC Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Contract**, **Entitlement**, and **Coverage** entities are owned by `SPR-MOD-011-001` and are consumed read-only here.
- The **Field Visit** and **Service Ticket** entities are owned by MOD-012 and MOD-016 respectively; only their closure events are consumed.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`VisitScheduled`** — published via `ENG-024` when a Visit Schedule transitions to `confirmed`. Per Sprint Plan §2 (`SPR-MOD-011-002`), this is the single domain event originated by this sprint.

### 11.2 Consumed

- **`FieldVisitCompleted`** — originated by MOD-012 Field Service, consumed read-only via `ENG-024` to complete the referenced Visit Schedule and advance entitlement consumption.
- **`ServiceTicketClosed`** — originated by MOD-016 Service Desk, consumed read-only via `ENG-024` to record reactive entitlement consumption against an AMC-covered Contract/Entitlement.

Payload contracts for these events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Visit Schedule read/write and every consumption update, including event application.
- [ ] Every Visit Schedule lifecycle transition and every entitlement-consumption update produces an audit record via `ENG-004`.
- [ ] The Visit Schedule transaction lifecycle (`planned → confirmed → completed | cancelled`) is enforced end-to-end via `ENG-010`.
- [ ] Preventive-schedule generation is triggered on cadence via `ENG-014` and executed via `ENG-013`, consuming AMC configuration registered in `SPR-MOD-011-001` via `ENG-005`.
- [ ] The coverage-window rule is enforced end-to-end via `ENG-012`.
- [ ] `VisitScheduled` is published via `ENG-024` on every Visit Schedule confirmation, exactly once.
- [ ] `FieldVisitCompleted` and `ServiceTicketClosed` are consumed via `ENG-024` with tenancy filtering; out-of-scope events are ignored deterministically.
- [ ] Notifications are emitted on Visit Schedule state transitions via `ENG-025`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-011_SPRINT_PLAN.md` §2 (`SPR-MOD-011-002`):

- Visit Schedules can be created, updated, and cancelled against an active Contract.
- Preventive schedules generate automatically per contract terms via `ENG-013` and `ENG-014`.
- The coverage-window rule is enforced via `ENG-012`.
- `VisitScheduled` events are published via `ENG-024`; `FieldVisitCompleted` and `ServiceTicketClosed` events are consumed to update entitlement consumption.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-011 Sprint 2 depends on `SPR-MOD-011-001` being complete and the Contract, Entitlement, Coverage masters and AMC configuration namespace being available.
  - **Impact:** Any regression against `SPR-MOD-011-001` blocks this sprint.
  - **Mitigation:** Rely on the AMC Foundation contract authored in `SPR-MOD-011-001`; treat any regression as a foundation defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-011 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen for tenancy, company/branch hierarchy, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Consumption of `FieldVisitCompleted` requires that MOD-012 Field Service originate the event per the authoritative event catalog; consumption of `ServiceTicketClosed` requires that MOD-016 Service Desk originate its event per the same catalog.
  - **Impact:** If either producer is not yet published in a corresponding module baseline, this sprint's consumption paths cannot be exercised end-to-end.
  - **Mitigation:** During implementation, gate the consumption paths against a producer-readiness contract and record any gap as a deferred integration item; the AMC Sprint boundary is unchanged.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Later AMC sprints (`SPR-MOD-011-003`, `SPR-MOD-011-004`) are deferred; scope-creep back into this sprint would dilute Preventive Visit Scheduling.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** AMC-owned Visit Schedule transaction and entitlement-consumption accounting MUST NOT be redefined by downstream modules; MOD-012 Field Service and MOD-016 Service Desk semantics MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment scheduling data and break traceability.
  - **Mitigation:** Enforce the Visit Schedule Transaction Authority convention (§1.1.1) and the AMC ↔ Field Service / Service Desk boundaries (§1.1.2, §1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 2 publishes `VisitScheduled` and consumes `FieldVisitCompleted` and `ServiceTicketClosed`. Any event name not present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before this sprint enters `In Progress`, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Confirm event catalog registration for `VisitScheduled`, `FieldVisitCompleted`, and `ServiceTicketClosed` before this sprint enters `In Progress`. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Visit Schedule validation; Contract-state invariants; Entitlement-scope invariants; coverage-window rule; Visit Schedule lifecycle transition invariants; consumption-update invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, workflow via `ENG-010`, rules evaluation via `ENG-012`, automation via `ENG-013`, scheduler via `ENG-014`, event publication and consumption via `ENG-024`, notification emission via `ENG-025`.
- **Contract** — `VisitScheduled` payload contract per the authoritative event catalog; `FieldVisitCompleted` and `ServiceTicketClosed` payload contracts as consumed.
- **End-to-end (smoke)** — Contract-to-schedule generation → Visit Schedule confirmation → `VisitScheduled` publication → `FieldVisitCompleted` consumption → Visit Schedule completion → entitlement-consumption update; separately, `ServiceTicketClosed` consumption → entitlement-consumption update; two-tenant / two-company smoke fixture to verify `ADR-011` isolation on both publication and consumption paths.

Sprint-specific fixtures: a two-company smoke fixture, a MOD-012-produced `FieldVisitCompleted` fixture, a MOD-016-produced `ServiceTicketClosed` fixture, and an AMC-configuration cadence fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Visit Schedule lifecycle as a small state machine so audit emission (§5.9) is trivially satisfiable at every transition.
- Consider centralizing the coverage-window rule (§5.4) behind a single `ENG-012` predicate so both interactive capture and automated generation share identical semantics.
- Consider isolating the preventive-generation loop (`ENG-014` → `ENG-013`) behind an idempotent slot key derived from (Contract, cadence-slot) so re-triggering does not double-generate schedules.
- Consider centralizing the `VisitScheduled` publication path so downstream sprints that add fields to the payload (per the authoritative event catalog) touch a single emission point.
- Consider tenancy-scoping the `FieldVisitCompleted` and `ServiceTicketClosed` consumers at the earliest boundary so §5.10 isolation is inherited by every downstream consumption update without additional code.
- Consider recording the entitlement-consumption update as a first-class record (rather than an in-place mutation) so the audit trail (§5.9) is self-explanatory.

These notes are **non-authoritative** and MAY be superseded by implementation decisions provided the acceptance criteria (§5), Definition of Done (§12), and Sprint Exit Criteria (§13) continue to hold.

---

## 17. Review Gate

This Sprint PRD MUST pass review against the released GT-003 Sprint Authoring template under Governance Framework v1.0 before it is registered in the Sprint Catalog. The Review Gate binds:

- Every canonical GT-003 section is present.
- Traceability to the Module PRD and Sprint Plan is bidirectional.
- Registration is limited to GT-003-declared surfaces.
- Ownership boundaries §1.1.1–§1.1.5 are preserved.
- Acceptance criteria §5 cover every user story §4.
- Sprint Exit Criteria §13 are verbatim from the Sprint Plan.
- Governance Template Dependencies §7.1 are stated and resolved.

Failure at any binding blocks registration.

---

## 18. References

- [`docs/20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md)
- [`docs/30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md)
- [`docs/30-sprint-prds/amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md`](./SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md)
- [`docs/30-sprint-prds/amc/README.md`](./README.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- [`docs/MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- [`docs/DOCUMENT_INDEX.md`](../../DOCUMENT_INDEX.md)
- [`docs/15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- [`docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md`](../../15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md)
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`docs/40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md)
