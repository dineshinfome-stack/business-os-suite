---
title: "SPR-MOD-016-003 — SLA Enforcement & Escalations"
summary: "Sprint PRD for the Escalation slice of MOD-016: SLA clock lifecycle over Service Tickets against SLA Policies and Business Hours from Sprint 001, pause-on-customer-waiting rule, deterministic Escalation-Matrix execution, SLA Breach Event transaction, and publication of SLAPaused / SLAResumed / SLABreached / EscalationTriggered. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-016-003"
parent_module: "MOD-016"
parent_sprint_plan: "MOD-016_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "18.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "service-desk", "mod-016", "sla", "escalation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD016-003-20260717T090000Z-001"
parent_result_id: "GT003-MOD016-002-20260717T080000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-016-003 — SLA Enforcement & Escalations

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-016 Service Desk** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-016-003` (permanent) |
| Parent Module | `MOD-016` — Service Desk |
| Parent Sprint Plan | [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md) |
| Upstream Sprints | [`SPR-MOD-016-001`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md), [`SPR-MOD-016-002`](./SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD006_CRM_BASELINE_v1`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-016-004`, `SPR-MOD-016-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Escalation** capability substrate for BusinessOS Service Desk: the **SLA clock lifecycle** attached to every Service Ticket (established by `SPR-MOD-016-002`); SLA timer calculation for **Response** and **Resolution** SLAs against the **SLA Policy** master and **Business Hours** configuration established by `SPR-MOD-016-001`; the **pause-on-customer-waiting** rule (Module PRD §7) enforced via `ENG-012`; automatic resume on customer response; deterministic **breach detection** at configured thresholds; the **SLA Breach Event** transaction lifecycle governed by `ENG-010`; deterministic **Escalation-Matrix execution** across multiple ordered levels via `ENG-013`; escalation history and SLA status tracking; SLA-related audit trail via `ENG-004`; and publication of `SLAPaused`, `SLAResumed`, `SLABreached`, and `EscalationTriggered` via `ENG-024`. Ticket capture and lifecycle, Knowledge / Macros / CSAT, and analytics are explicitly **not** in scope — they belong to `SPR-MOD-016-002`, `SPR-MOD-016-004`, and `SPR-MOD-016-005`.

> **Service Desk Ownership Convention (recapitulated).** The Service Desk module owns the business semantics of the **SLA clock**, the **SLA Breach Event** transaction, and **Escalation execution** attached to a Service Ticket. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, workflow, approval, rules, automation, numbering, event, notification) but **MUST NOT** redefine Service Desk business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Customer master data remains exclusive to **MOD-006 CRM** and is consumed read-only. Field visit handoff to **MOD-012 Field Service** occurs strictly through the Sprint 002 event surface. Cross-module KPI definitions remain exclusive to **MOD-017 Analytics**. Ledger effects (if any) remain exclusive to **MOD-002 Accounting** via `ENG-015` / `ENG-016`.

#### 1.1.1 SLA Clock Authority

The **SLA clock** attached to each Service Ticket is authoritatively owned by MOD-016 Service Desk in this sprint. Its lifecycle — start, pause, resume, breach, stop — is defined here and executed via `ENG-010`. No other module MAY start, pause, resume, breach, or stop a Service-Desk SLA clock, nor maintain a parallel SLA clock over a Service Ticket. Downstream sprints and modules consume SLA clock state exclusively through Service-Desk-owned events (`SLAPaused`, `SLAResumed`, `SLABreached`) and Service-Desk-owned read APIs; they MUST NOT redefine the clock or its lifecycle.

#### 1.1.2 SLA Breach Event Transaction Authority

The **SLA Breach Event** transaction is authoritatively owned by MOD-016 Service Desk in this sprint. It records the fact of a threshold breach against a specific SLA Policy target on a specific Service Ticket. Breaches are recorded **exactly once per applicable threshold** per (tenant, company, ticket, SLA target) via `ENG-012` deduplication. No other module MAY create, edit, or independently maintain a parallel SLA Breach Event transaction.

#### 1.1.3 Escalation Execution Authority

**Escalation execution** — the deterministic evaluation and firing of Escalation-Matrix levels attached to an SLA Policy or a ticket state — is authoritatively owned by MOD-016 Service Desk in this sprint. Multiple escalation levels execute in the deterministic order declared by the Escalation Matrix registered in `SPR-MOD-016-001`; each level is fired at most once per (tenant, company, ticket, level) via `ENG-012` deduplication. Escalation notifications are emitted via `ENG-025` and automation actions are orchestrated via `ENG-013`. No other module MAY redefine Escalation-Matrix semantics or the order of level execution.

#### 1.1.4 Service Desk ↔ Platform, CRM, Field Service, Accounting, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Service Desk consumes these read-only via `ENG-001` (transitively through `ENG-002`), `ENG-002`, `ENG-003`.
- **MOD-006 CRM** owns Customer master data. Service Desk consumes it read-only through CRM APIs; no Customer master is authored here.
- **MOD-012 Field Service** interaction remains scoped to `FieldVisitCompleted` consumption declared in `SPR-MOD-016-002`. This sprint neither publishes to nor consumes from Field Service beyond that surface.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. MOD-016 declares no direct posting responsibilities in this sprint.
- **MOD-017 Analytics** owns cross-module KPI definitions. SLA Adherence and Escalation KPIs are surfaced by `SPR-MOD-016-005` and consumed from MOD-017; cross-module KPIs are never redefined by MOD-016.

Ownership boundaries SHALL NOT be redefined in downstream Service Desk Sprint PRDs.

### 1.2 In Scope

- **SLA clock lifecycle** over every Service Ticket established by `SPR-MOD-016-002`. The clock is started when the ticket enters a running state, paused when the ticket enters a customer-waiting state, resumed automatically when a customer response is received, and stopped upon ticket closure (per the Sprint 002 lifecycle event surface).
- **SLA timer calculation** for Response and Resolution SLA targets defined on the SLA Policy master from `SPR-MOD-016-001`, respecting the tenant's configured **Business Hours per region** resolved via `ENG-005`. All time arithmetic runs deterministically via `ENG-012`.
- **Response SLA tracking** — the elapsed running time from ticket start until the first agent response, evaluated against the Response threshold(s) on the SLA Policy.
- **Resolution SLA tracking** — the elapsed running time from ticket start until resolution/close, evaluated against the Resolution threshold(s) on the SLA Policy.
- **Pause-on-customer-waiting rule (Module PRD §7)** — enforced via `ENG-012` on entry to a customer-waiting state; the SLA clock pauses and `SLAPaused` is published via `ENG-024`.
- **Automatic resume** — the SLA clock resumes when a customer response is received (through the Sprint 002 update surface) and `SLAResumed` is published via `ENG-024`.
- **SLA breach detection** — deterministic detection at each configured threshold on the SLA Policy; each breach is recorded exactly once per (tenant, company, ticket, SLA target, threshold) via `ENG-012`.
- **SLA Breach Event transaction** — created via `ENG-010` at breach detection; carries the ticket reference, SLA Policy reference, target (Response / Resolution), threshold identifier, and breach timestamp; numbered via `ENG-017` from the series registered in `SPR-MOD-016-001`.
- **Escalation execution** — deterministic evaluation of the Escalation Matrix registered in `SPR-MOD-016-001`; multiple ordered levels fire in declared order via `ENG-013`; each level fires at most once per (tenant, company, ticket, level) via `ENG-012` deduplication. Where the Escalation Matrix requires human acknowledgement, the corresponding step is routed via `ENG-011`.
- **Escalation history** — a per-ticket, per-level record of triggered escalations with actor, timestamp, and outcome.
- **SLA status tracking** — a computed status view per Service Ticket (`On Track`, `At Risk`, `Breached`) derived from the SLA clock and thresholds, updated deterministically on every clock transition and threshold evaluation.
- **SLA audit trail** — every SLA clock start / pause / resume / stop / breach, every Escalation-Matrix level firing, and every escalation acknowledgement is audited via `ENG-004`.
- **Authorization** on every SLA and Escalation action via `ENG-002`; permissions consumed against grants registered by `ENG-003` under the RBAC + ABAC model per `ADR-032`.
- **Events published** via `ENG-024`: `SLAPaused`, `SLAResumed`, `SLABreached`, `EscalationTriggered`. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.
- **Events consumed** via `ENG-024`: `ServiceTicketCreated`, `ServiceTicketUpdated`, `ServiceTicketClosed` (from `SPR-MOD-016-002`), used to drive SLA clock start, pause/resume on customer-waiting transitions, and clock stop on closure.
- **Notification emission** via `ENG-025` on SLA breach and on each Escalation-Matrix level firing under the tenant's configured channels.

### 1.3 Out of Scope

- Foundation masters (Ticket Category, SLA Policy) and Service Desk operations configuration (routing rules, escalation matrices, business hours per region, numbering-series registration) — `SPR-MOD-016-001`.
- Service Ticket transaction, its lifecycle, multi-channel capture, parent/child relations, close-with-open-child rule, and `ServiceTicketCreated` / `ServiceTicketUpdated` / `ServiceTicketClosed` publication — `SPR-MOD-016-002`.
- Knowledge Article master, review-before-publish rule, macros, CSAT Response transaction, CSAT surveys, and `KnowledgeArticlePublished` publication — `SPR-MOD-016-004`.
- Operational reports (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity); dashboards; bulk exports; consumption of MOD-017 KPI definitions; module read model — `SPR-MOD-016-005`.
- Customer master authoring — owned by MOD-006 CRM.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Financial postings (if any) — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Cross-module KPI definitions — owned by MOD-017 Analytics.
- Field-visit transactions and mobile field execution — owned by MOD-012 Field Service.
- Modifications to the Escalation Matrix configuration itself — owned by `SPR-MOD-016-001`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-016-003`, the following will exist:

- **Business capabilities.**
  - Every Service Ticket carries an SLA clock whose lifecycle is deterministically driven by the ticket's state transitions.
  - Response and Resolution SLA targets from the SLA Policy master are evaluated against configured Business Hours per region.
  - The pause-on-customer-waiting rule is enforced; the clock resumes automatically on customer response.
  - Threshold breaches on each SLA target produce exactly one **SLA Breach Event** per threshold, with a Service-Desk-issued document number.
  - The Escalation Matrix executes deterministically across multiple ordered levels; each level fires at most once per ticket.
  - Escalation history and SLA status are queryable per ticket.
  - `SLAPaused`, `SLAResumed`, `SLABreached`, and `EscalationTriggered` are published; Sprint 002 ticket lifecycle events are consumed.
  - Every SLA clock transition, breach event, and escalation level firing is audited.
- **Governance surface.**
  - This Sprint PRD.
  - Registration entries in `docs/30-sprint-prds/service-desk/README.md`, `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, and `docs/_meta.json`.
  - Repository audit report for Pass 18.0.3.
- **Explicit non-deliverables.** No implementation code, migrations, physical schema, API contracts, UI, or infrastructure. No changes to ERP Core Engines, ADRs, event catalog, Sprint Plan, Sprint 001 PRD, Sprint 002 PRD, Module PRD, governance templates, or the Wrapper.

---

## 3. Traceability to Module PRD

| Module PRD Reference | Coverage in this sprint |
| --- | --- |
| §1 Module Overview | Recapitulated (this sprint delivers Escalation, one of the Module Business Objectives). |
| §2 Business Scope — SLA and escalation policies (enforcement); submodules SLAs, Escalations | Fully covered by §1.2 In Scope. |
| §3 Personas (Support Agent, Support Manager, Field Service, CRM, Customer, Employee) | Support Agent and Support Manager act on SLA and escalation surfaces; other personas are unaffected in this sprint. |
| §4 Business Processes — Escalation | Fully covered — SLA clock, breach detection, and Escalation-Matrix execution constitute the Escalation process. |
| §6 Transactions — SLA Breach Event | Owned here (§1.1.2); lifecycle via `ENG-010`; numbered via `ENG-017`. |
| §7 Business Rules — SLA-pause-during-customer-waiting | Enforced via `ENG-012` (§1.2, §5.3, §5.4). |
| §8 Integration Points — `SLABreached` (published) | Published via `ENG-024` (§11.1). `SLAPaused`, `SLAResumed`, `EscalationTriggered` are additional Service-Desk-owned events required by the Escalation process, subject to the deferred event-catalog registration risk in §14. |
| §12 ERP Core Engine Consumption | Only subsets of the Module PRD engine union are consumed (see §8). |
| §13 Dependencies | Only declared dependencies are consumed (see §7). |

No capability, submodule, transaction, business rule, event, engine, or ADR outside the Module PRD is introduced. No Sprint 004 / Sprint 005 scope is absorbed.

---

## 4. Functional Requirements

FR identifiers are local to this sprint. Every requirement is traceable to Module PRD §§2, 4, 6, 7, 8, 12, 13, and to `SPR-MOD-016-001` / `SPR-MOD-016-002` outputs.

- **FR-001 — SLA clock start.** On consumption of `ServiceTicketCreated` (or the equivalent Sprint 002 lifecycle event that marks a ticket entering a running state), start an SLA clock on the ticket against the SLA Policy resolved from the Ticket Category / customer / configuration via `ENG-005`. Time accumulates only within configured Business Hours.
- **FR-002 — SLA clock pause on customer-waiting.** On consumption of a `ServiceTicketUpdated` event that reflects a transition into a customer-waiting state (per the Sprint 002 lifecycle), pause the SLA clock via `ENG-010` and publish `SLAPaused` via `ENG-024`.
- **FR-003 — SLA clock resume on customer response.** On consumption of a `ServiceTicketUpdated` event that reflects a customer response (per the Sprint 002 lifecycle), resume the SLA clock via `ENG-010` and publish `SLAResumed` via `ENG-024`.
- **FR-004 — SLA clock stop on closure.** On consumption of `ServiceTicketClosed`, stop the SLA clock via `ENG-010`; no further breach evaluation occurs against the ticket.
- **FR-005 — SLA timer calculation.** Elapsed SLA time is computed via `ENG-012` as accumulated running time within Business Hours resolved via `ENG-005`, excluding paused intervals.
- **FR-006 — Response SLA tracking.** For each ticket, track elapsed running time until the first agent response; evaluate against the SLA Policy's Response threshold(s).
- **FR-007 — Resolution SLA tracking.** For each ticket, track elapsed running time until resolution/close; evaluate against the SLA Policy's Resolution threshold(s).
- **FR-008 — Breach detection.** When elapsed running time crosses a configured threshold on any SLA target (Response or Resolution), record an **SLA Breach Event** via `ENG-010` and publish `SLABreached` via `ENG-024`. `ENG-012` guarantees exactly one record per (tenant, company, ticket, SLA target, threshold).
- **FR-009 — SLA Breach Event numbering.** Each SLA Breach Event is numbered at creation via `ENG-017` using the series registered in `SPR-MOD-016-001`.
- **FR-010 — Escalation-Matrix evaluation.** On each SLA-related event (threshold crossing, breach, or configured elapsed proportion), evaluate the Escalation Matrix registered in `SPR-MOD-016-001` for the ticket's SLA Policy via `ENG-012`.
- **FR-011 — Deterministic ordered execution.** When multiple escalation levels apply, fire them in the deterministic order declared by the Escalation Matrix via `ENG-013`; each level fires at most once per (tenant, company, ticket, level) via `ENG-012` deduplication.
- **FR-012 — Escalation acknowledgement (where configured).** Where the Escalation Matrix requires human acknowledgement, route the step via `ENG-011`; record the acknowledgement outcome in escalation history.
- **FR-013 — Escalation notification.** On each Escalation-Matrix level firing, emit a notification via `ENG-025` under the tenant's configured channels.
- **FR-014 — Escalation history.** Maintain a per-ticket, per-level record of triggered escalations with actor, timestamp, and outcome; accessible to authorized readers.
- **FR-015 — SLA status view.** Provide a computed SLA status per ticket (`On Track`, `At Risk`, `Breached`) derived from the SLA clock and thresholds; recomputed on every clock transition and threshold evaluation via `ENG-012`.
- **FR-016 — Business Hours respect.** SLA timers respect the Business Hours per region resolved via `ENG-005` from `SPR-MOD-016-001`; no accumulation occurs outside configured Business Hours.
- **FR-017 — Configuration read-only.** SLA Policy, Business Hours, and Escalation Matrix configuration are read-only in this sprint; changes to the configuration are made through `SPR-MOD-016-001`, not here.
- **FR-018 — Event publication.** `SLAPaused`, `SLAResumed`, `SLABreached`, and `EscalationTriggered` are published exactly once per corresponding transition via `ENG-024` (idempotent by construction of the deduplication keys in FR-002 – FR-011).
- **FR-019 — Event consumption.** Sprint 002 ticket lifecycle events (`ServiceTicketCreated`, `ServiceTicketUpdated`, `ServiceTicketClosed`) are consumed via `ENG-024` to drive FR-001 – FR-004.
- **FR-020 — Audit emission.** Every SLA clock start / pause / resume / stop / breach, every Escalation-Matrix level firing, and every escalation acknowledgement is audited via `ENG-004`.
- **FR-021 — Authorization.** Every SLA and Escalation action is authorized via `ENG-002` against grants registered by `ENG-003` under the RBAC + ABAC model per `ADR-032`.
- **FR-022 — Tenant isolation.** All reads and writes are restricted to the caller's tenant scope per `ADR-011`.

---

## 5. Acceptance Criteria (Given / When / Then)

Acceptance is observable and testable at the business surface. Concrete APIs, tables, UI, and error codes are implementation activities and are out of scope.

### 5.1 SLA clock start (US-001)

- **Given** a Service Ticket that enters a running state via a Sprint 002 lifecycle event,
  **when** MOD-016 consumes that event,
  **then** an SLA clock is started on the ticket against the SLA Policy resolved via `ENG-005`; time accumulates only within configured Business Hours.

### 5.2 SLA clock pause on customer-waiting (US-002)

- **Given** an active SLA clock on a Service Ticket,
  **when** the ticket transitions to a customer-waiting state per Sprint 002,
  **then** the SLA clock pauses via `ENG-010`, `SLAPaused` is published via `ENG-024`, and the pause is audited via `ENG-004`.

### 5.3 SLA clock automatic resume (US-003)

- **Given** a paused SLA clock on a Service Ticket,
  **when** a customer response is received per Sprint 002,
  **then** the SLA clock resumes via `ENG-010`, `SLAResumed` is published via `ENG-024`, and the resume is audited via `ENG-004`.

### 5.4 SLA clock stop on closure (US-004)

- **Given** an SLA clock on a Service Ticket,
  **when** `ServiceTicketClosed` is consumed,
  **then** the SLA clock stops via `ENG-010`; no further breach evaluation occurs; the stop is audited via `ENG-004`.

### 5.5 SLA timer respects Business Hours (US-005)

- **Given** a Service Ticket associated with a tenant/region whose Business Hours are configured in `SPR-MOD-016-001`,
  **when** SLA elapsed time is computed,
  **then** accumulation occurs only within Business Hours; time outside Business Hours does not accrue.

### 5.6 Response SLA breach detection (US-006)

- **Given** an SLA Policy with a configured Response threshold,
  **when** elapsed running time crosses that threshold before the first agent response,
  **then** an SLA Breach Event is created via `ENG-010`, `SLABreached` is published via `ENG-024`, and the event is recorded exactly once per (tenant, company, ticket, Response, threshold) via `ENG-012`.

### 5.7 Resolution SLA breach detection (US-007)

- **Given** an SLA Policy with a configured Resolution threshold,
  **when** elapsed running time crosses that threshold before ticket resolution/close,
  **then** an SLA Breach Event is created via `ENG-010`, `SLABreached` is published via `ENG-024`, and the event is recorded exactly once per (tenant, company, ticket, Resolution, threshold) via `ENG-012`.

### 5.8 SLA Breach Event numbering (US-008)

- **Given** any SLA Breach Event creation,
  **when** it is accepted,
  **then** a document number is issued via `ENG-017` from the SLA-Breach-Event numbering series registered in `SPR-MOD-016-001`; allocated numbers are immutable thereafter.

### 5.9 Escalation-Matrix ordered execution (US-009)

- **Given** an Escalation Matrix registered in `SPR-MOD-016-001` with multiple levels for the ticket's SLA Policy,
  **when** an SLA event triggers escalation,
  **then** the levels fire in the deterministic order declared by the matrix via `ENG-013`; each level fires at most once per (tenant, company, ticket, level) via `ENG-012`; `EscalationTriggered` is published via `ENG-024` for each firing.

### 5.10 Escalation acknowledgement (US-010)

- **Given** an Escalation-Matrix level that requires human acknowledgement,
  **when** the level fires,
  **then** the acknowledgement step is routed via `ENG-011`, the outcome is recorded in escalation history, and the outcome is audited via `ENG-004`.

### 5.11 Escalation notification (US-011)

- **Given** an Escalation-Matrix level firing and a tenant with a configured channel,
  **when** the firing commits,
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.12 Escalation history (US-012)

- **Given** one or more Escalation-Matrix levels fired on a ticket,
  **when** an authorized reader queries the ticket's escalation history,
  **then** each firing is retrievable with actor, timestamp, level identifier, and outcome under the caller's tenant scope only.

### 5.13 SLA status view (US-013)

- **Given** any Service Ticket with an active or stopped SLA clock,
  **when** the SLA status view is requested,
  **then** the computed status is `On Track`, `At Risk`, or `Breached` per `ENG-012` derivation from the clock and thresholds; the value is recomputed deterministically on every relevant transition.

### 5.14 Event publication (US-014)

- **Given** any SLA clock pause, resume, breach, or Escalation-Matrix level firing,
  **when** the corresponding transition commits,
  **then** `SLAPaused`, `SLAResumed`, `SLABreached`, or `EscalationTriggered` (respectively) is published via `ENG-024` exactly once per corresponding transition, using the authoritative envelope and payload contract governed by the event catalog.

### 5.15 Event consumption (US-015)

- **Given** any Sprint 002 lifecycle event (`ServiceTicketCreated`, `ServiceTicketUpdated`, `ServiceTicketClosed`) delivered to MOD-016,
  **when** it is consumed via `ENG-024`,
  **then** the SLA clock lifecycle transitions accordingly (FR-001 – FR-004) and the transition is audited via `ENG-004`.

### 5.16 Audit integration (US-016)

- **Given** any SLA clock transition, SLA Breach Event creation, Escalation-Matrix level firing, or escalation acknowledgement,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, ticket identifier, transition/change type, and timestamp.

### 5.17 Isolation & authorization invariants (US-017; `ADR-011`, `ADR-032`)

- **Given** any SLA or Escalation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope per `ADR-011`, and authorized via `ENG-002` against permissions registered by `ENG-003` under the RBAC + ABAC model per `ADR-032`; unauthorized or cross-tenant actions are rejected before any state change.

### 5.18 Ownership consumption invariants

- **Given** any Service Desk code path that requires SLA Policy, Business Hours, or Escalation Matrix data,
  **when** it needs that configuration,
  **then** it consumes it read-only from `SPR-MOD-016-001` outputs via `ENG-005`; the configuration is not redefined here.
- **Given** any Service Desk code path that requires Service Ticket state,
  **when** it needs that state,
  **then** it consumes it exclusively through the Sprint 002 event surface and Service-Desk-owned read APIs; the Service Ticket lifecycle is not redefined here.
- **Given** any Service Desk code path,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001` (transitively through `ENG-002`); the Identity entity is not redefined here.
- **Given** any SLA / Escalation processing with potential ledger effects,
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through Service-Desk-published events (in this or later sprints); no Service Desk code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-016` — Service Desk.
- **Module PRD:** [`docs/20-module-prds/service-desk/MODULE_PRD.md`](../../../20-module-prds/service-desk/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md).
- **Upstream Sprints:** [`SPR-MOD-016-001`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md), [`SPR-MOD-016-002`](./SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md).
- **Module PRD sections fulfilled:** §1, §2 (SLA and escalation policies — enforcement; submodules SLAs, Escalations), §4 (Escalation), §6 (SLA Breach Event), §7 (SLA-pause-during-customer-waiting), §8 (`SLABreached` — published), §12, §13. See §3.

---

## 7. Dependencies

- **Parent:** `MOD-016` MODULE_PRD.
- **Upstream sprint dependencies:**
  - [`SPR-MOD-016-001`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md) — provides SLA Policy master, Business Hours per region, Escalation Matrix configuration, and numbering-series registration (including the SLA-Breach-Event series). Consumed read-only.
  - [`SPR-MOD-016-002`](./SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md) — provides the Service Ticket transaction, its lifecycle, and the `ServiceTicketCreated` / `ServiceTicketUpdated` / `ServiceTicketClosed` event surface. Consumed read-only through events and read APIs.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD006_CRM_BASELINE_v1`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) — Customer master (read-only association context on the ticket).
- **Downstream sprints:** `SPR-MOD-016-004` (Knowledge Base, Macros & CSAT), `SPR-MOD-016-005` (Service Analytics & Compliance) — per [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.1 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Service Desk Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and of the Sprint Plan §5 allocation for `SPR-MOD-016-003`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every SLA and Escalation action (RBAC + ABAC per `ADR-032`). |
| `ENG-004` Audit | Records every SLA clock transition, SLA Breach Event creation, Escalation-Matrix level firing, and escalation acknowledgement. |
| `ENG-005` Configuration | Resolves the SLA Policy for a ticket, Business Hours per region, and Escalation Matrix references registered in `SPR-MOD-016-001` under the tenant → company → context hierarchy (read-only). |
| `ENG-010` Workflow | Executes the SLA clock lifecycle (start / pause / resume / stop) and the SLA Breach Event transaction lifecycle. |
| `ENG-011` Approval | Routes escalation acknowledgement steps where the Escalation Matrix requires human acknowledgement. |
| `ENG-012` Rules | Evaluates SLA time arithmetic, threshold crossing, deduplication of breach records and escalation-level firings, pause-on-customer-waiting rule, and SLA status derivation. |
| `ENG-013` Automation | Orchestrates deterministic ordered execution of Escalation-Matrix levels and any automation actions declared on those levels. |
| `ENG-017` Numbering | Allocates SLA Breach Event document numbers at creation time using the series registered in `SPR-MOD-016-001`. |
| `ENG-024` Event | Publishes `SLAPaused`, `SLAResumed`, `SLABreached`, `EscalationTriggered`; consumes `ServiceTicketCreated`, `ServiceTicketUpdated`, `ServiceTicketClosed`. |
| `ENG-025` Notification | Emits notifications on SLA breach and on each Escalation-Matrix level firing under the tenant's configured channels. |

Service Desk business semantics (SLA clock lifecycle, SLA Breach Event transaction, Escalation-Matrix execution semantics, pause-on-customer-waiting rule) are owned by this module and are not delegated to any engine.

Identity (`ENG-001`), Permission Management (`ENG-003`), Localization (`ENG-006`), Document (`ENG-007`), Attachment (`ENG-008`), Search (`ENG-020`), Integration (`ENG-023`), Reporting (`ENG-021`), Dashboard (`ENG-022`), Export (`ENG-027`), and AI Copilot (`ENG-028`) are declared in the Module PRD engine union but are **not** consumed by this sprint per Sprint Plan §5 (`SPR-MOD-016-003`): identity is transitively consumed through `ENG-002`; permissions are consumed for permission-check evaluation via `ENG-002` without new registrations here; and the remaining engines are consumed by earlier or later Service Desk sprints per their allocated scope.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every SLA and Escalation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every SLA and Escalation action. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Event. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| SLA Clock | MOD-016 (this sprint) | The authoritative Service-Desk SLA clock attached to a Service Ticket. Scoped to a tenant/company. Carries references to the ticket and the resolved SLA Policy; state includes `Running`, `Paused`, `Stopped`; running-time accumulation is Business-Hours-scoped. |
| SLA Breach Event | MOD-016 (this sprint) | The authoritative Service-Desk transaction recording a threshold breach on a Service Ticket. Scoped to a tenant/company. Carries references to the ticket, SLA Policy, SLA target (Response / Resolution), threshold identifier, and breach timestamp. Numbered via `ENG-017`. |
| Escalation Firing | MOD-016 (this sprint) | The record of a single Escalation-Matrix level firing on a Service Ticket. Scoped to a tenant/company. Carries references to the ticket, the Escalation Matrix, and the level identifier; carries actor, timestamp, and outcome (including acknowledgement outcome where applicable). |
| SLA Status View | MOD-016 (this sprint) | The computed per-ticket SLA status (`On Track`, `At Risk`, `Breached`) derived deterministically from the SLA Clock and SLA Policy thresholds via `ENG-012`. |

### 10.2 Relationships

- A **Service Ticket** (owned by MOD-016, established in `SPR-MOD-016-002`) has at most one active **SLA Clock** under the same tenant/company at any time; a stopped SLA Clock is retained for audit.
- An **SLA Clock** references exactly one **SLA Policy** (owned by MOD-016, established in `SPR-MOD-016-001`) and resolves Business Hours from configuration via `ENG-005`.
- An **SLA Breach Event** references exactly one **Service Ticket**, exactly one **SLA Policy**, and one SLA target (Response or Resolution) together with one threshold identifier.
- An **Escalation Firing** references exactly one **Service Ticket** and exactly one Escalation-Matrix level within the ticket's SLA Policy's Escalation Matrix.
- **SLA Status View** is a derived read model over the SLA Clock and SLA Policy thresholds; it introduces no ownership beyond those entities.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-016` per the Service Desk Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- **SLA Policy** and **Escalation Matrix** configuration are owned by `SPR-MOD-016-001` and are consumed read-only here.
- **Service Ticket** is owned by `SPR-MOD-016-002` and is consumed here through its event surface and read APIs.
- The **Customer** entity is owned by MOD-006 CRM and is consumed read-only.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Service-Desk-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published and Consumed

Referenced authoritatively in [`../../../02-architecture/event-catalog.md`](../../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Event.

### 11.1 Published

- **`SLAPaused`** — published via `ENG-024` when the SLA clock pauses under the pause-on-customer-waiting rule. Origin sprint: `SPR-MOD-016-003`.
- **`SLAResumed`** — published via `ENG-024` when the SLA clock resumes on customer response. Origin sprint: `SPR-MOD-016-003`.
- **`SLABreached`** — published via `ENG-024` on SLA Breach Event creation. Origin sprint per Sprint Plan §4.4.
- **`EscalationTriggered`** — published via `ENG-024` on each Escalation-Matrix level firing. Origin sprint: `SPR-MOD-016-003`.

### 11.2 Consumed

- **`ServiceTicketCreated`** — consumed from `SPR-MOD-016-002` via `ENG-024`; drives SLA clock start (FR-001).
- **`ServiceTicketUpdated`** — consumed from `SPR-MOD-016-002` via `ENG-024`; drives SLA clock pause (customer-waiting entry) and resume (customer response) per FR-002, FR-003.
- **`ServiceTicketClosed`** — consumed from `SPR-MOD-016-002` via `ENG-024`; drives SLA clock stop (FR-004).

No event outside the Module PRD event union is published or consumed. `SLAPaused`, `SLAResumed`, and `EscalationTriggered` are Service-Desk-owned lifecycle events required by the Escalation process; any event name not present in the authoritative event catalog at authoring time is a deferred registration item recorded as `R-EV-01` in §14.

---

## 12. Non-functional Considerations

Non-functional targets inherit from `docs/02-architecture/quality-attributes.md` and the Module PRD §11. This sprint introduces no bespoke non-functional targets. Concrete performance envelopes for SLA-timer evaluation and Escalation-Matrix execution are implementation concerns and are out of scope for this PRD.

- Interactive SLA-status and escalation-history reads run inside the platform latency envelope; batch breach evaluations run inside the platform batch envelope.
- Data classification and retention rules follow the Data Constitution as consumed by MOD-016 Module PRD §11.
- Accessibility of any surfaced SLA / Escalation UI is enforced by the platform design system (ADR-081), not by this Sprint PRD.

---

## 13. Acceptance & Exit Criteria

Sprint Plan §2 for `SPR-MOD-016-003` defines the objective exit criteria. Reproduced verbatim:

- SLA clocks start, pause, resume, and stop deterministically over Service Tickets against the SLA Policy master and Business Hours resolved via `ENG-005`.
- The pause-on-customer-waiting rule (Module PRD §7) is enforced via `ENG-012`; automatic resume on customer response is enforced via `ENG-012`.
- Threshold crossings produce an **SLA Breach Event** exactly once per (tenant, company, ticket, SLA target, threshold) via `ENG-012`; each SLA Breach Event is numbered via `ENG-017` using the series from `SPR-MOD-016-001`; `SLABreached` publishes via `ENG-024`.
- The Escalation Matrix executes deterministically across multiple ordered levels via `ENG-013`; each level fires at most once per (tenant, company, ticket, level) via `ENG-012`; where required, acknowledgement is routed via `ENG-011`.
- `SLAPaused`, `SLAResumed`, `SLABreached`, and `EscalationTriggered` publish via `ENG-024`; `ServiceTicketCreated`, `ServiceTicketUpdated`, `ServiceTicketClosed` are consumed via `ENG-024`.
- All SLA clock transitions, breach records, and escalation firings are audited via `ENG-004`; all actions are authorized via `ENG-002` under `ADR-032`; all data access is tenant-isolated per `ADR-011`.

Each acceptance criterion in §5 is testable at the business surface and observable through the events, notifications, audit records, and read views declared above.

---

## 14. Risks & Assumptions

- **Risk ID:** R-01
  - **Description:** MOD-016 depends on `SPR-MOD-016-001` outputs (SLA Policy master, Business Hours per region, Escalation Matrix configuration, and SLA-Breach-Event numbering series) being present and complete.
  - **Impact:** Missing foundation configuration would prevent deterministic SLA-timer evaluation, deterministic Escalation-Matrix execution, and correct SLA Breach Event numbering.
  - **Mitigation:** Consume `SPR-MOD-016-001` outputs read-only; treat any drift as a foundation defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-016 depends on `SPR-MOD-016-002` outputs (Service Ticket transaction, its lifecycle, and the `ServiceTicketCreated` / `ServiceTicketUpdated` / `ServiceTicketClosed` event surface).
  - **Impact:** Regressions in the Sprint 002 event surface or lifecycle would break SLA clock lifecycle driving.
  - **Mitigation:** Consume Sprint 002 outputs read-only through the event surface and Service-Desk-owned read APIs; escalate any change as a Sprint 002 defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-016 depends on `MOD001_PLATFORM_BASELINE_v1` (tenancy, users/roles/permissions, configuration hierarchy, audit review) being frozen and stable.
  - **Impact:** Regressions in the Platform baseline would break tenant isolation, authorization, or configuration resolution for SLA and Escalation processing.
  - **Mitigation:** Consume the Platform baseline per its frozen contract; escalate any change as a baseline defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Later Service Desk sprints (`SPR-MOD-016-004` and `SPR-MOD-016-005`) are deferred; scope-creep of KB / Macros / CSAT or analytics back into this sprint would dilute the SLA Enforcement & Escalations scope.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries and Sprint Plan §4 allocations.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Service-Desk-owned entities (SLA Clock, SLA Breach Event, Escalation Firing, SLA Status View) MUST NOT be redefined by downstream modules; MOD-006-owned Customer, MOD-001-owned Identity, and MOD-002 financial postings MUST NOT be authored here; `SPR-MOD-016-001`-owned SLA Policy / Business Hours / Escalation Matrix configuration MUST NOT be redefined here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the SLA Clock Authority (§1.1.1), the SLA Breach Event Transaction Authority (§1.1.2), the Escalation Execution Authority (§1.1.3), and the cross-module boundary (§1.1.4) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** This sprint publishes `SLAPaused`, `SLAResumed`, `SLABreached`, and `EscalationTriggered`, and consumes `ServiceTicketCreated`, `ServiceTicketUpdated`, `ServiceTicketClosed`. Any of these event names not present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before this sprint enters `In Progress`, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register each event in the authoritative event catalog through the governance path before this sprint enters `In Progress`. This sprint does not modify the event catalog.
  - **Status:** Open

---

## 15. References

- Parent Module PRD — [`../../../20-module-prds/service-desk/MODULE_PRD.md`](../../../20-module-prds/service-desk/MODULE_PRD.md)
- Module Sprint Plan (Stage 1) — [`../MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md), [`./SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md`](./SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md)
- Sprint Framework — [`../../../SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md), [`../../../SPRINT_ROADMAP.md`](../../../SPRINT_ROADMAP.md), [`../../../SPRINT_ESTIMATION_GUIDE.md`](../../../SPRINT_ESTIMATION_GUIDE.md), [`../../../SPRINT_DEPENDENCY_MATRIX.md`](../../../SPRINT_DEPENDENCY_MATRIX.md), [`../../../SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md)
- ERP Core Engines — [`../../../10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md)
- ADR Index — [`../../../11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../../02-architecture/event-catalog.md`](../../../02-architecture/event-catalog.md)
- Upstream Baselines — [`../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md)
- Module Implementation Workflow — [`../../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md)
