---
title: "SPR-MOD-012-002 — Dispatch & Scheduling"
summary: "Sprint PRD for the Dispatch layer of MOD-012 Field Service: Visit transaction lifecycle (assigned → en route → on site), dispatch strategy resolution over skill/territory/availability, scheduled and automated dispatch, technician assignment, and consumption of AMC-driven `VisitScheduled` events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-012-002"
parent_module: "MOD-012"
parent_sprint_plan: "MOD-012_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "14.0.2"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-012", "ENG-013", "ENG-014", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "field-service", "mod-012", "dispatch", "scheduling", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD012-002-20260716T013000Z-001"
parent_result_id: "GT003-MOD012-001-20260716T012000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-012-002 — Dispatch & Scheduling

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-012 Field Service** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-012-002` (permanent) |
| Parent Module | `MOD-012` — Field Service |
| Parent Sprint Plan | [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-012-001`](./SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-012-003` … `SPR-MOD-012-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Ticket-to-dispatch** process for BusinessOS Field Service: the **Visit** transaction and its dispatch-phase lifecycle (`assigned → en route → on site`), deterministic **dispatch strategy resolution** over skill × territory × availability via `ENG-005` and `ENG-012`, **scheduled dispatch** via `ENG-014`, **automated re-dispatch** on decline via `ENG-013`, **technician assignment**, publication of `VisitAssigned` via `ENG-024`, and read-only consumption of MOD-011-owned `VisitScheduled` to materialize AMC-driven visits. This sprint runs strictly on the foundation delivered by `SPR-MOD-012-001` and prepares the substrate consumed by `SPR-MOD-012-003` (Mobile Visit Execution), `SPR-MOD-012-004` (SLA & Escalation), and `SPR-MOD-012-005` (Analytics).

> **Field Service Ownership Convention.** The Field Service module owns the business semantics of the Visit transaction, dispatch strategy resolution, and Dispatch/Territory-rule configuration namespaces. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, workflow, rules, automation, scheduler, eventing, notification) but **MUST NOT** redefine Field Service business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Contract, Entitlement, Coverage, preventive-visit-scheduling authority, and `VisitScheduled` publication remain exclusive to **MOD-011 AMC**; this sprint consumes `VisitScheduled` read-only to materialize AMC-driven Visits. Ledger effects of any billable field work remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting. Service-ticket master ownership boundary with **MOD-016 Service Desk** is preserved. Cross-module KPI definitions remain exclusive to **MOD-017 Analytics**.

#### 1.1.1 Visit Transaction Authority

The **Visit** transaction is authoritatively owned by MOD-012 Field Service. The dispatch-phase lifecycle (`assigned → en route → on site`) is enforced via `ENG-010` Workflow. Downstream sprints consume Visit state; only the transitions declared here and in `SPR-MOD-012-003` (which extends the lifecycle through `completed`) are legal. Preventive-visit **scheduling authority** remains with MOD-011 AMC; this sprint materializes the Visit only after consuming `VisitScheduled`.

#### 1.1.2 Dispatch Strategy and Territory Rule Authority

**Dispatch strategy** and **Territory rules** are authored, registered, and evaluated within Field Service. Registration executes through `ENG-005` under the tenant/company hierarchy established by the Platform baseline; deterministic evaluation over skill × territory × availability executes through `ENG-012`. No other module MAY redefine Dispatch strategy or Territory rules.

#### 1.1.3 Field Service ↔ AMC, Service Desk, Accounting, Analytics, and Platform Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Field Service consumes these read-only via `ENG-002` in this sprint (Identity was exercised in `SPR-MOD-012-001`).
- **MOD-011 AMC** owns the Contract, Entitlement, and Coverage masters and publishes `VisitScheduled` for preventive-visit-driven Visits. Sprint 2 consumes `VisitScheduled` read-only to materialize a Visit against a MOD-011-owned scheduling reference; AMC-owned entities are not redefined here.
- **MOD-016 Service Desk** owns the service-ticket master and emits `ServiceTicketClosed`. Sprint 2 does not consume `ServiceTicketClosed`; that consumption is scoped to `SPR-MOD-012-003`.
- **MOD-002 Accounting** owns financial postings via `ENG-015` and `ENG-016`. No Field Service sprint writes journal entries; downstream sprints emit events that Accounting consumes.
- **MOD-017 Analytics** owns cross-module KPI definitions. Field Service dispatch KPIs are surfaced by `SPR-MOD-012-005`; cross-module KPIs are never redefined by MOD-012.

Ownership boundaries SHALL NOT be redefined in downstream Field Service Sprint PRDs.

#### 1.1.4 Dispatch Configuration Authority

Dispatch strategy and Territory rule configuration is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline. This sprint registers and evaluates the Dispatch-strategy and Territory-rule keys. SLA policies remain in scope of `SPR-MOD-012-004`; mobile-app settings remain in scope of `SPR-MOD-012-003`. No module-specific configuration keys are registered outside Field Service's own ownership boundary.

#### 1.1.5 Visit Lifecycle Boundary

Field Service owns the Visit transaction lifecycle. This sprint delivers the dispatch phase (`assigned → en route → on site`); the on-site completion transition (`on site → completed`) and closure semantics are scoped to `SPR-MOD-012-003`. Downstream sprints (Mobile Execution, SLA/Escalation, Analytics) consume Visit state without redefining its lifecycle.

### 1.2 In Scope

- **Visit** transaction: create against an open Field Ticket (from `SPR-MOD-012-001`) or against an MOD-011-owned scheduled visit received via consumed `VisitScheduled`; scoped to a tenant/company; unique document identifier issued via inherited numbering (Field Ticket numbering per `SPR-MOD-012-001`; Visit numbering keys resolved via `ENG-005` where declared by the Sprint Plan).
- **Dispatch-phase Visit lifecycle** (`assigned → en route → on site`), enforced through `ENG-010` Workflow.
- **Technician assignment** on Visit creation or reassignment, respecting tenancy and same-company invariants; enforced via `ENG-012`.
- **Dispatch strategy resolution** over **skill × territory × availability**: configuration keys registered via `ENG-005`; evaluation via `ENG-012` at Visit-creation and reassignment time.
- **Territory rule** registration and evaluation via `ENG-005` and `ENG-012`.
- **Scheduled dispatch** — deterministic runs via `ENG-014` Scheduler that materialize pending Visits according to registered dispatch strategy.
- **Automated re-dispatch on decline** — a Visit refused (declined) by the assigned technician re-enters dispatch via `ENG-013` Automation, subject to the same dispatch-strategy evaluation.
- **Event publication.** `VisitAssigned` published via `ENG-024` when a Visit becomes `assigned` (initial assignment or re-assignment).
- **Event consumption.** `VisitScheduled` consumed via `ENG-024` from MOD-011 AMC to materialize AMC-driven Visits, storing the read-only linkage to the MOD-011-owned scheduling reference.
- **Authorization** on Visit and dispatch actions via `ENG-002`.
- **Audit** emission via `ENG-004` for every dispatch-phase Visit lifecycle transition, assignment, re-assignment, scheduled-dispatch run, and automated re-dispatch.
- **Notification** emission via `ENG-025` on Visit assignment, re-assignment, and dispatch-phase transitions.
- **Structural validation** (required fields, referential integrity, same-company invariants, skill/territory/availability constraints) via `ENG-012`.

### 1.3 Out of Scope

- Foundation masters (Technician, Skill, Territory, Ticket Type) and Field Ticket capture/triage — `SPR-MOD-012-001`.
- Visit `on site → completed` transition, on-site execution, Spare Consumption transaction, Closure Report, signature/checklist capture, `FieldVisitCompleted`/`SpareConsumed` publication, `ServiceTicketClosed` consumption, mobile-app settings — `SPR-MOD-012-003`.
- SLA policy master, SLA tracking, escalation workflows and notifications — `SPR-MOD-012-004`.
- Field Service read model, operational reports, dashboards, exports, audit-readiness surface — `SPR-MOD-012-005`.
- Contract, Entitlement, Coverage masters and preventive-visit scheduling (authoring) — owned by MOD-011 AMC.
- Customer-facing service-ticket master and `ServiceTicketClosed` publication — owned by MOD-016 Service Desk.
- Financial postings for billable field work — owned by MOD-002 Accounting via `ENG-015` and `ENG-016`.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.
- Item master and stock movements — owned by MOD-005 Inventory (consumption scoped to `SPR-MOD-012-003`).

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-012-002`, the following will exist:

- **Business capabilities.**
  - A Dispatcher can create a Visit against an open Field Ticket or against an AMC-scheduled visit materialized from a consumed `VisitScheduled` event, under a tenant/company.
  - A Dispatcher can assign a Visit to a Technician deterministically resolved from Dispatch strategy over skill × territory × availability, and can reassign a Visit subject to the same rules.
  - A Dispatcher can register Dispatch strategy and Territory-rule configuration per company through `ENG-005`; evaluation runs through `ENG-012` at Visit creation and reassignment.
  - Scheduled dispatch runs materialize pending Visits deterministically via `ENG-014`.
  - Automated re-dispatch on decline reruns dispatch-strategy evaluation via `ENG-013`.
  - A Dispatcher can drive a Visit through the dispatch-phase lifecycle: `assigned → en route → on site`, enforced via `ENG-010` Workflow.
- **Domain events.**
  - `VisitAssigned` published via `ENG-024` on every Visit assignment (initial and re-assignment). Payload contract is governed by the authoritative event catalog and not redefined here.
  - `VisitScheduled` consumed via `ENG-024` to materialize AMC-driven Visits with a read-only linkage to the MOD-011-owned scheduling reference.
- **Configuration artifacts.** Dispatch strategy and Territory-rule keys registered per company via `ENG-005`. No module-specific keys registered outside Field Service's ownership boundary.
- **Audit artifacts.** An audit record exists for every dispatch-phase Visit lifecycle transition, assignment, re-assignment, scheduled-dispatch run, and automated re-dispatch, produced via `ENG-004`.
- **Notification artifacts.** Notifications emitted via `ENG-025` on Visit assignment, re-assignment, and dispatch-phase transitions under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-012-002`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-012 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Dispatch and scheduling; submodule Dispatch | Visit transaction, dispatch strategy resolution, scheduled and automated dispatch |
| §3 Personas — Dispatcher, Service Manager; Field Technician | User stories (§4) |
| §4 Business Processes — Ticket-to-dispatch | End-to-end Ticket → Visit creation → assignment → dispatch-phase lifecycle |
| §6 Transactions — Visit | Visit transaction with dispatch-phase lifecycle `assigned → en route → on site` |
| §7 Business Rules — dispatch invariants (tenancy, referential integrity, same-company composition, skill/territory/availability) | Enforced via `ENG-012` |
| §8 Integration Points — `VisitAssigned` (published); `VisitScheduled` (consumed) | `VisitAssigned` publication and `VisitScheduled` consumption via `ENG-024` |
| §10 Configuration — Dispatch strategy, Territory rules | Registration and evaluation via `ENG-005` and `ENG-012` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Field Service Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Dispatch and scheduling (§2) | `SPR-MOD-012-002` |

This allocation is unique; no other Field Service sprint claims "Dispatch and scheduling" as its originating capability. The **Dispatch** submodule and the **Visit** transaction are originating-allocated to this sprint per Sprint Plan §4.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Dispatch and scheduling* and submodule *Dispatch* → this Sprint PRD → deliverables in §2 (Visit transaction, dispatch-phase lifecycle, dispatch-strategy resolution, scheduled and automated dispatch, `VisitAssigned` publication, `VisitScheduled` consumption).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Dispatcher, I want to create a Visit against an open Field Ticket under a company so that the Ticket-to-dispatch process can begin deterministically.*
- **US-002.** *As a Dispatcher, I want to materialize a Visit from a consumed AMC `VisitScheduled` event so that preventive-maintenance visits from MOD-011 are dispatched without duplicating AMC scheduling authority.*
- **US-003.** *As a Dispatcher, I want the system to resolve dispatch strategy over skill × territory × availability so that Visit assignment is deterministic and audit-traceable.*
- **US-004.** *As a Dispatcher, I want to reassign a Visit prior to `on site` under the same dispatch-strategy rules so that operational changes are handled without ad-hoc workarounds.*
- **US-005.** *As a Service Manager, I want to register Dispatch strategy and Territory-rule configuration per company so that dispatch behavior is deterministic and per-company configurable.*
- **US-006.** *As a Dispatcher, I want scheduled dispatch runs to materialize pending Visits via a scheduler so that dispatch is time-driven when required and does not depend on manual triggering.*
- **US-007.** *As a Dispatcher, I want a Visit declined by the assigned Technician to be automatically re-dispatched under the same strategy so that no Visit is stranded.*
- **US-008.** *As a Dispatcher, I want to drive a Visit through the dispatch-phase lifecycle (`assigned → en route → on site`) via workflow so that state transitions are governed deterministically.*
- **US-009.** *As a downstream subscriber (Mobile Execution, SLA/Escalation, Analytics, and cross-module consumers), I want `VisitAssigned` to be published on assignment so that downstream sprints and modules can react without polling Field Service state.*
- **US-010.** *As a security reviewer, I want every dispatch-phase Visit lifecycle transition, assignment, re-assignment, scheduled-dispatch run, and automated re-dispatch to be audited via `ENG-004` so that dispatch history is reconstructible from an authoritative log.*
- **US-011.** *As a Dispatcher, I want authorization on Visit and dispatch actions enforced via `ENG-002` so that only permitted actors can dispatch, assign, or reassign.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Visit creation against an open Field Ticket (US-001)

- **Given** an open Field Ticket in `triaged` under a tenant/company (from `SPR-MOD-012-001`),
  **when** a Dispatcher creates a Visit against it,
  **then** the Visit is persisted with a stable identifier scoped to the same (tenant, company), linked to the Field Ticket, and audited via `ENG-004`.
- **Given** an attempt to create a Visit against a Field Ticket in a different company, or against a Field Ticket that is `closed` or `cancelled`,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.2 Visit materialization from consumed `VisitScheduled` (US-002)

- **Given** an MOD-011-published `VisitScheduled` event received via `ENG-024` referencing an active AMC contract in a company,
  **when** the consumer materializes the Visit,
  **then** a Visit is persisted scoped to the same (tenant, company), linked read-only to the MOD-011-owned scheduling reference, and audited via `ENG-004`. The MOD-011-owned scheduling entity is not redefined; only the reference is stored.
- **Given** duplicate delivery of the same `VisitScheduled` reference,
  **when** consumption is retried,
  **then** the consumer is idempotent — no duplicate Visit is materialized.

### 5.3 Dispatch strategy resolution (US-003)

- **Given** a Visit awaiting assignment and Dispatch-strategy configuration registered via `ENG-005` in the company,
  **when** dispatch strategy is evaluated over the pool of active Technicians via `ENG-012`,
  **then** a Technician is selected deterministically according to registered skill × territory × availability rules; ties resolve by the deterministic tiebreaker declared in the configured strategy.
- **Given** no Technician satisfies the strategy for the Visit,
  **when** evaluation completes,
  **then** the Visit remains unassigned and the outcome is audited; no `VisitAssigned` event is emitted.

### 5.4 Technician assignment and reassignment (US-004)

- **Given** a Visit in `assigned` or `en route` and a re-assignment request under the same (tenant, company),
  **when** the request executes,
  **then** dispatch-strategy evaluation reruns via `ENG-012`; on success the Visit is reassigned, `VisitAssigned` is republished via `ENG-024`, and the reassignment is audited via `ENG-004`.
- **Given** an attempt to reassign a Visit in `on site` (or a later state introduced by `SPR-MOD-012-003`),
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.5 Dispatch configuration registration (US-005)

- **Given** a company under an active tenant,
  **when** a Service Manager registers Dispatch strategy and Territory-rule configuration,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** an attempt to register a Dispatch-strategy or Territory-rule key outside Field Service's declared configuration namespace,
  **when** the registration is submitted,
  **then** the registration is rejected deterministically.

### 5.6 Scheduled dispatch (US-006)

- **Given** pending Visits eligible for scheduled dispatch,
  **when** the scheduled-dispatch job runs via `ENG-014`,
  **then** each eligible Visit is evaluated through dispatch strategy (§5.3); successful assignments publish `VisitAssigned` via `ENG-024` and are audited via `ENG-004`.
- **Given** a scheduler run that yields no eligible Visits,
  **when** the run completes,
  **then** the run itself is audited but no assignments or events are emitted.

### 5.7 Automated re-dispatch on decline (US-007)

- **Given** a Visit in `assigned` that is declined by the assigned Technician,
  **when** decline is recorded,
  **then** automated re-dispatch runs via `ENG-013` Automation, dispatch-strategy evaluation reruns via `ENG-012`, and on success `VisitAssigned` is republished and audited.
- **Given** repeated declines that exhaust the strategy-eligible pool,
  **when** the pool is exhausted,
  **then** the Visit remains unassigned; the terminal exhaustion is audited; no `VisitAssigned` event is emitted.

### 5.8 Dispatch-phase Visit lifecycle (US-008)

- **Given** a Visit in `assigned`,
  **when** the Technician acknowledges departure,
  **then** the Visit transitions to `en route` via `ENG-010`, and the transition is audited.
- **Given** a Visit in `en route`,
  **when** the Technician reports arrival on site,
  **then** the Visit transitions to `on site` via `ENG-010`, and the transition is audited. Full-fidelity on-site completion semantics (checklist, signatures, closure report) are enforced by `SPR-MOD-012-003`.
- **Given** an attempt to transition a Visit along any path not declared by the dispatch-phase lifecycle,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.9 Event publication (US-009)

- **Given** a Visit assignment or re-assignment,
  **when** the operation completes,
  **then** `VisitAssigned` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.

### 5.10 Audit integration (US-010)

- **Given** any dispatch-phase Visit lifecycle transition, assignment, re-assignment, scheduled-dispatch run, or automated re-dispatch,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition or action type, and timestamp.

### 5.11 Authorization (US-011)

- **Given** any Visit-creation, assignment, re-assignment, dispatch-phase lifecycle transition, or configuration-registration action,
  **when** it executes,
  **then** it is subject to `ENG-002` Authorization under `ADR-032` RBAC + ABAC; unauthorized requests are rejected deterministically.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any Visit or dispatch read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.13 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Visit data,
  **when** it reads or reacts to Visits,
  **then** it does so exclusively through Field-Service-owned events (`VisitAssigned` here; additional events in later sprints) and Field Service read APIs. No downstream module creates an independent Visit master.
- **Given** any Field Service code path that requires the MOD-011 scheduling reference from `VisitScheduled`,
  **when** it needs the linked scheduling entity,
  **then** it consumes the linkage via the `VisitScheduled` reference only; the MOD-011-owned scheduling entity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-012` — Field Service.
- **Module PRD:** [`docs/20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Dispatch and scheduling; submodule Dispatch), §3 (Dispatcher, Service Manager, Field Technician), §4 (Ticket-to-dispatch), §6 (Visit), §7 (dispatch invariants), §8 (`VisitAssigned` published; `VisitScheduled` consumed), §10 (Dispatch strategy, Territory rules), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-012` MODULE_PRD.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-012-001`.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen) — `VisitScheduled` publication consumed by this sprint to materialize AMC-driven Visits.
- **Cross-module consumption (events only):** `VisitScheduled` (from MOD-011) via `ENG-024`. Consumption of `ServiceTicketClosed` (from MOD-016) and MOD-005 Item read APIs is scoped to `SPR-MOD-012-003`.
- **Downstream sprints:** `SPR-MOD-012-003` (Mobile Visit Execution: Spares, Signatures, Closure), `SPR-MOD-012-004` (SLA & Escalation), `SPR-MOD-012-005` (Field Service Analytics & Compliance) — per [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Field Service Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and of the Sprint Plan §2 engines declared for `SPR-MOD-012-002`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Visit and dispatch actions under `ADR-032` RBAC + ABAC. |
| `ENG-004` Audit | Records every dispatch-phase Visit lifecycle transition, assignment, re-assignment, scheduled-dispatch run, and automated re-dispatch. |
| `ENG-005` Configuration | Registers and resolves Dispatch strategy and Territory-rule configuration under the tenant/company hierarchy. |
| `ENG-010` Workflow | Enforces the dispatch-phase Visit lifecycle (`assigned → en route → on site`). |
| `ENG-012` Rules | Evaluates dispatch strategy over skill × territory × availability and structural validations. |
| `ENG-013` Automation | Executes automated re-dispatch on decline. |
| `ENG-014` Scheduler | Executes scheduled dispatch runs. |
| `ENG-024` Eventing | Publishes `VisitAssigned` on assignment/reassignment; consumes `VisitScheduled` for AMC-driven materialization. |
| `ENG-025` Notification | Emits notifications on Visit assignment, re-assignment, and dispatch-phase transitions. |

Field Service business semantics (Visit transaction, dispatch-phase lifecycle, dispatch-strategy resolution, Dispatch/Territory-rule configuration namespaces, Visit ↔ AMC scheduling read-only linkage) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §19.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every dispatch read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Visit and dispatch actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Visit | MOD-012 (this sprint) | Field-service transaction scoped to a tenant/company, linked to a Field Ticket (from `SPR-MOD-012-001`) or to an MOD-011-owned scheduling reference via consumed `VisitScheduled`; runs the dispatch-phase lifecycle (`assigned → en route → on site`), extended in `SPR-MOD-012-003`. |
| Visit ↔ AMC Scheduling Binding | MOD-012 (this sprint) | Read-only reference from a Visit materialized via `VisitScheduled` to the MOD-011-owned scheduling entity in the same company. |
| Dispatch Strategy Configuration | MOD-012 (this sprint, configuration-scoped) | Per-company Dispatch-strategy keys registered and resolved via `ENG-005`, evaluated via `ENG-012`. |
| Territory Rule Configuration | MOD-012 (this sprint, configuration-scoped) | Per-company Territory-rule keys registered and resolved via `ENG-005`, evaluated via `ENG-012`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Visits**, one **Dispatch-strategy configuration** namespace, and one **Territory-rule configuration** namespace.
- A **Visit** references exactly one **Field Ticket** (from `SPR-MOD-012-001`) OR exactly one MOD-011-owned scheduling reference (via consumed `VisitScheduled`) within the same company; both linkages are mutually exclusive per Visit.
- A **Visit** references exactly one **Technician** while in `assigned`, `en route`, or `on site` (may be null when unassigned and pending re-dispatch).

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-012` per the Field Service Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The MOD-011-owned scheduling entity is referenced read-only via consumed `VisitScheduled`; it is not a Field-Service-owned entity.
- The **Field Ticket**, **Technician**, **Skill**, **Territory**, and **Ticket Type** entities are owned by MOD-012 from `SPR-MOD-012-001` and are referenced here without redefinition.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Field-Service-owned entity.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`VisitAssigned`** — published via `ENG-024` on every Visit assignment (initial assignment and re-assignment). Per Sprint Plan §2 (`SPR-MOD-012-002`), this is the single domain event originated by this sprint.

### 11.2 Consumed

- **`VisitScheduled`** (from MOD-011 AMC) — consumed via `ENG-024` to materialize AMC-driven Visits with a read-only linkage to the MOD-011-owned scheduling reference. MOD-011-owned entities are not redefined here.

Consumption of `ServiceTicketClosed` (from MOD-016 Service Desk) and MOD-005 Item read APIs is scoped to `SPR-MOD-012-003` and does not occur in this sprint.

Payload contracts for Field Service events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Visit and dispatch read and write.
- [ ] Every dispatch-phase Visit lifecycle transition, assignment, re-assignment, scheduled-dispatch run, and automated re-dispatch produces an audit record via `ENG-004`.
- [ ] Dispatch strategy and Territory-rule configuration namespaces are initialized per company via `ENG-005`.
- [ ] The dispatch-phase Visit lifecycle (`assigned → en route → on site`) is enforced end-to-end via `ENG-010`.
- [ ] Dispatch strategy resolves deterministically over skill × territory × availability via `ENG-012`.
- [ ] Scheduled dispatch executes via `ENG-014`; automated re-dispatch on decline executes via `ENG-013`.
- [ ] `VisitAssigned` is published via `ENG-024` on every Visit assignment (initial and re-assignment), exactly once.
- [ ] `VisitScheduled` (MOD-011) is consumed via `ENG-024` idempotently and stored as a read-only Visit ↔ scheduling linkage without redefining MOD-011-owned entities.
- [ ] Notifications are emitted on Visit assignment, re-assignment, and dispatch-phase transitions via `ENG-025`.
- [ ] Authorization is enforced on Visit and dispatch actions via `ENG-002`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-012_SPRINT_PLAN.md` §2 (`SPR-MOD-012-002`):

- Visits can be created and assigned against an open Field Ticket or an AMC-scheduled visit.
- Dispatch strategy resolves per configured skill/territory/availability rules via `ENG-005` and `ENG-012`.
- Scheduled dispatch runs via `ENG-014`; automated re-dispatch on decline via `ENG-013`.
- `VisitAssigned` events are published via `ENG-024`; `VisitScheduled` events are consumed to materialize AMC-driven visits.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-012 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-012 depends on `MOD011_AMC_BASELINE_v1` being frozen and stable for `VisitScheduled` publication consumed to materialize AMC-driven Visits.
  - **Impact:** Any drift in the AMC `VisitScheduled` payload would break Visit materialization.
  - **Mitigation:** Consume `VisitScheduled` per its authoritative event-catalog contract; escalate any change as an AMC defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-012 depends on `SPR-MOD-012-001` (Field Service Foundation) being complete; Visit creation requires a triaged Field Ticket, and dispatch requires Technician / Skill / Territory master data.
  - **Impact:** Foundation regressions would block dispatch.
  - **Mitigation:** Consume the foundation contract; treat regressions as defects at `SPR-MOD-012-001`.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Non-determinism in dispatch-strategy resolution (unstable tiebreakers, unbounded evaluation, unauthorized field references) would violate testability of §5.3.
  - **Impact:** Non-deterministic dispatch would break audit reconstruction and downstream analytics.
  - **Mitigation:** Require a deterministic tiebreaker as part of the registered dispatch-strategy configuration; enforce structural validation via `ENG-012` at registration time.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Later Field Service sprints (`SPR-MOD-012-003` … `SPR-MOD-012-005`) are deferred; scope-creep back into this sprint would dilute Dispatch & Scheduling.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Field-Service-owned entities (Visit, Dispatch-strategy and Territory-rule configuration) MUST NOT be redefined by downstream modules; MOD-011 scheduling, MOD-016 service-ticket, and MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Visit Transaction Authority convention (§1.1.1), Dispatch Strategy Authority (§1.1.2), and cross-module boundary (§1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 2 publishes `VisitAssigned` and consumes `VisitScheduled`. Any event name not yet present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint enters `In Progress`, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Confirm event catalog registration of `VisitAssigned` publication and `VisitScheduled` consumption before this sprint enters `In Progress`. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Visit validation; Visit ↔ Field Ticket linkage invariants; Visit ↔ AMC scheduling read-only linkage invariants; dispatch-strategy tiebreaker determinism; dispatch-phase lifecycle transition invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, workflow via `ENG-010`, rule evaluation via `ENG-012`, automation via `ENG-013`, scheduler via `ENG-014`, event publication and consumption via `ENG-024`, notification emission via `ENG-025`, authorization via `ENG-002`.
- **Contract** — `VisitAssigned` payload contract per the authoritative event catalog; `VisitScheduled` consumption contract per the authoritative event catalog.
- **End-to-end (smoke)** — Ticket-to-dispatch: open Field Ticket → Visit creation → dispatch-strategy resolution → assignment → `assigned → en route → on site` transitions, including `VisitAssigned` publication; AMC-driven materialization via consumed `VisitScheduled`; scheduled dispatch run; automated re-dispatch on decline; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an MOD-011 `VisitScheduled` read-only fixture, a Technician / Skill / Territory pool fixture inherited from `SPR-MOD-012-001`, and a deterministic Dispatch-strategy configuration fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider expressing dispatch strategy as a pure, deterministic function over (Visit, {active Technicians}, {Skill/Territory index}, {availability window}) so §5.3 tiebreaker determinism is trivially satisfied and testable.
- Consider modeling the Visit dispatch-phase lifecycle as a small state machine so audit emission (§5.10) is trivially satisfiable at every transition.
- Consider a single `VisitAssigned` emission path shared by initial-assignment, re-assignment, scheduled-dispatch, and automated re-dispatch to keep the publication contract centralized.
- Consider an idempotent `VisitScheduled`-consumption handler keyed by (tenant, company, scheduling_reference_id) so replays do not double-materialize Visits.
- Consider scoping scheduled-dispatch batches by (tenant, company) so a slow tenant cannot starve others.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-012-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Ticket-to-dispatch process: Visit transaction with dispatch-phase lifecycle, dispatch-strategy resolution, scheduled and automated dispatch, technician assignment, `VisitAssigned` publication, and `VisitScheduled` consumption (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-012 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Field Service Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters, on-site execution/closure, SLA/escalation, analytics, MOD-011-owned AMC entities, MOD-016-owned service-ticket master, financial postings, identity/permissions, cross-module KPI definitions, and MOD-005-owned Item — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-012-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-012-003` Mobile Visit Execution is the immediate successor per [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-012-002`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md`](./SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD011_AMC_BASELINE_v1.md`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
