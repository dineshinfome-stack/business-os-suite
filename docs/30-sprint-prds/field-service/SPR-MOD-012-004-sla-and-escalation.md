---
title: "SPR-MOD-012-004 — SLA & Escalation"
summary: "Sprint PRD for the SLA & Escalation layer of MOD-012 Field Service: SLA policy master (per ticket type / territory / contract entitlement), SLA clock tracking against Field Ticket and Visit lifecycles, rule-driven escalation workflows and approvals, scheduled SLA checks, automated escalations, and breach notifications. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-012-004"
parent_module: "MOD-012"
parent_sprint_plan: "MOD-012_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "14.0.4"
size: "Small"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "field-service", "mod-012", "sla", "escalation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD012-004-20260716T015000Z-001"
parent_result_id: "GT003-MOD012-003-20260716T014000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-012-004 — SLA & Escalation

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-012 Field Service** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-012-004` (permanent) |
| Parent Module | `MOD-012` — Field Service |
| Parent Sprint Plan | [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Small |
| Upstream Sprints | [`SPR-MOD-012-001`](./SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md), [`SPR-MOD-012-003`](./SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-012-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Escalation** process for BusinessOS Field Service: the **SLA Policy** master (resolved per ticket type × territory × contract entitlement), **SLA clock tracking** against Field Ticket and Visit lifecycles authored in `SPR-MOD-012-001` through `SPR-MOD-012-003`, **rule-driven escalation workflows** via `ENG-010` and approval routing via `ENG-011`, **scheduled SLA checks** via `ENG-014`, **automated escalations** via `ENG-013`, and **breach notifications** via `ENG-025`. This sprint runs strictly on the substrate delivered by `SPR-MOD-012-001` (Field Ticket lifecycle) and `SPR-MOD-012-003` (Visit completion), and prepares SLA state consumed by `SPR-MOD-012-005` (Analytics).

> **Field Service Ownership Convention.** The Field Service module owns the business semantics of the SLA Policy master, SLA clock tracking against Field Ticket and Visit lifecycles, escalation workflow definitions, and the SLA-policy configuration namespace. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, workflow, approval, rules, automation, scheduler, eventing, notification) but **MUST NOT** redefine Field Service business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. **AMC entitlement mechanics** — contract, entitlement, coverage authority — remain exclusive to **MOD-011 AMC**; this sprint consumes entitlement references read-only when resolving SLA policy by contract entitlement. Item master and stock movements remain exclusive to **MOD-005 Inventory**. Service-ticket master ownership boundary with **MOD-016 Service Desk** is preserved. Ledger effects remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting. Cross-module KPI definitions remain exclusive to **MOD-017 Analytics**.

#### 1.1.1 SLA Policy Master Authority

The **SLA Policy** master is authoritatively owned by MOD-012 Field Service. SLA Policies are registered per company and resolved deterministically per (ticket type, territory, contract entitlement) via `ENG-005` and `ENG-012`. No other module MAY redefine SLA Policy semantics.

#### 1.1.2 SLA Clock and Escalation Workflow Authority

**SLA clock tracking** against the Field Ticket and Visit lifecycles is authored, evaluated, and owned within Field Service. Clock evaluations execute via `ENG-012` Rules; scheduled evaluations execute via `ENG-014` Scheduler; automated escalations execute via `ENG-013` Automation; escalation workflow transitions execute via `ENG-010` Workflow, with human approval routing via `ENG-011` Approval where declared by policy.

#### 1.1.3 Field Service ↔ AMC, Service Desk, Accounting, Analytics, and Platform Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Sprint 4 consumes these read-only via `ENG-002`.
- **MOD-011 AMC** owns Contract, Entitlement, and Coverage masters. Sprint 4 resolves SLA policy by contract entitlement using MOD-011-owned entitlement references read-only; **AMC entitlement mechanics are not redefined here**.
- **MOD-016 Service Desk** owns the service-ticket master. Sprint 4 does not redefine MOD-016-owned entities.
- **MOD-002 Accounting** owns financial postings via `ENG-015` and `ENG-016`. No Field Service sprint writes journal entries.
- **MOD-017 Analytics** owns cross-module KPI definitions. Field Service SLA KPIs are surfaced by `SPR-MOD-012-005`; cross-module KPIs are never redefined by MOD-012.

Ownership boundaries SHALL NOT be redefined in downstream Field Service Sprint PRDs.

#### 1.1.4 SLA Configuration Authority

The SLA-policy configuration namespace is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline. This sprint registers and evaluates the SLA-policy keys. Dispatch-strategy and Territory-rule namespaces remain scoped to `SPR-MOD-012-002`; mobile-app settings remain scoped to `SPR-MOD-012-003`. No module-specific configuration keys are registered outside Field Service's own ownership boundary.

#### 1.1.5 SLA Tracking Boundary

Field Service tracks SLA clocks against Field Ticket and Visit lifecycles owned within MOD-012 (from `SPR-MOD-012-001` through `SPR-MOD-012-003`). Clock evaluation does not modify Field Ticket or Visit lifecycles beyond issuing rule-driven escalation transitions declared by policy; the Field Ticket and Visit lifecycles remain as authored in prior sprints and are consumed here read-only for clock context.

### 1.2 In Scope

- **SLA Policy** master: per-company registration and evaluation of SLA Policies resolved per ticket type × territory × contract entitlement via `ENG-005` and `ENG-012`.
- **SLA clock tracking** against Field Ticket lifecycle transitions (from `SPR-MOD-012-001`) and Visit lifecycle transitions (from `SPR-MOD-012-002` and `SPR-MOD-012-003`), enforced via `ENG-012`.
- **Escalation workflows** — rule-driven escalation transitions authored per SLA Policy and enforced via `ENG-010`; human approval routing via `ENG-011` where declared by policy.
- **Scheduled SLA checks** — deterministic runs via `ENG-014` that evaluate open SLA clocks and detect breaches.
- **Automated escalations** — breach-driven automations via `ENG-013` that execute the escalation transition and route notifications.
- **Breach notifications** — notifications emitted via `ENG-025` on SLA breach and on each escalation transition, under the tenant's configured channels.
- **Authorization** on SLA Policy registration, SLA clock adjustments, escalation transitions, and approval decisions via `ENG-002`.
- **Audit** emission via `ENG-004` for every SLA Policy registration, SLA clock start/pause/resume/stop event, breach detection, escalation transition, approval decision, scheduled-SLA-check run, and automated-escalation run.
- **Structural validation** (required fields, referential integrity, same-company invariants, policy well-formedness) via `ENG-012`.
- Read-only consumption via `ENG-024` of upstream Field Service events (`FieldTicketCreated` from `SPR-MOD-012-001`; `VisitAssigned` from `SPR-MOD-012-002`; `FieldVisitCompleted` from `SPR-MOD-012-003`) to drive SLA clock lifecycle. Publication of SLA-specific domain events is deferred to the authoritative event catalog and tracked as a deferred registration risk in §14.

### 1.3 Out of Scope

- Foundation masters (Technician, Skill, Territory, Ticket Type) and Field Ticket capture/triage — `SPR-MOD-012-001`.
- Visit dispatch-phase lifecycle, dispatch-strategy resolution, scheduled/automated dispatch, Dispatch-strategy and Territory-rule configuration namespaces — `SPR-MOD-012-002`.
- Visit on-site completion, Spare Consumption, Closure Report, signature/checklist capture, mobile-app settings, and `FieldVisitCompleted`/`SpareConsumed` publication — `SPR-MOD-012-003`.
- Field Service read model, operational reports, dashboards, exports, audit-readiness surface — `SPR-MOD-012-005`.
- Contract, Entitlement, Coverage masters and AMC entitlement mechanics — owned by MOD-011 AMC.
- Service-ticket master and `ServiceTicketClosed` publication — owned by MOD-016 Service Desk.
- Item master and stock movements — owned by MOD-005 Inventory.
- Financial postings for billable field work — owned by MOD-002 Accounting via `ENG-015` and `ENG-016`.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-012-004`, the following will exist:

- **Business capabilities.**
  - A Service Manager can register SLA Policies per company through `ENG-005`; evaluation resolves deterministically per (ticket type, territory, contract entitlement) via `ENG-012`.
  - A Service Manager can register escalation workflows tied to SLA Policies; escalation transitions execute via `ENG-010`, with approval routing via `ENG-011` where declared by policy.
  - The system tracks SLA clocks against Field Ticket and Visit lifecycles inherited from `SPR-MOD-012-001` through `SPR-MOD-012-003`, with start/pause/resume/stop semantics enforced deterministically via `ENG-012`.
  - Scheduled SLA checks run via `ENG-014` to evaluate open SLA clocks and detect breaches.
  - Automated escalations run via `ENG-013` on breach and execute the escalation transition and notifications.
  - Notifications are emitted via `ENG-025` on breach detection and on each escalation transition.
- **Configuration artifacts.** SLA-policy keys and escalation-workflow definitions registered per company via `ENG-005`. No module-specific keys registered outside Field Service's ownership boundary.
- **Audit artifacts.** An audit record exists for every SLA Policy registration, SLA clock start/pause/resume/stop event, breach detection, escalation transition, approval decision, scheduled-SLA-check run, and automated-escalation run, produced via `ENG-004`.
- **Notification artifacts.** Notifications emitted via `ENG-025` on breach and on each escalation transition under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-012-004`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-012 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — SLA and escalation tracking | SLA Policy master, SLA clock tracking, escalation workflows |
| §3 Personas — Service Manager, Dispatcher, Field Technician | User stories (§4) |
| §4 Business Processes — Escalation | End-to-end SLA policy resolution → clock tracking → breach detection → escalation transition → breach notification |
| §7 Business Rules — "SLA breaches trigger escalation per policy" | Enforced via `ENG-012` (breach detection) and via `ENG-010`/`ENG-011`/`ENG-013` (escalation) |
| §10 Configuration — SLA policies | Registration and evaluation via `ENG-005` and `ENG-012` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Field Service Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| SLA and escalation tracking (§2) | `SPR-MOD-012-004` |

This allocation is unique; no other Field Service sprint claims "SLA and escalation tracking" as its originating capability.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *SLA and escalation tracking* → this Sprint PRD → deliverables in §2 (SLA Policy master, SLA clock tracking, escalation workflows, scheduled SLA checks, automated escalations, breach notifications).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Service Manager, I want to register SLA Policies per company scoped per ticket type × territory × contract entitlement so that SLA resolution is deterministic and per-company configurable.*
- **US-002.** *As a Dispatcher, I want the system to resolve the applicable SLA Policy for a Field Ticket or Visit deterministically so that SLA tracking runs against the correct policy without ambiguity.*
- **US-003.** *As a Service Manager, I want the system to track SLA clocks against Field Ticket and Visit lifecycle transitions (start/pause/resume/stop) so that SLA state is always reconstructible from lifecycle events.*
- **US-004.** *As a Service Manager, I want scheduled SLA checks to evaluate open clocks periodically so that breaches are detected without polling by external systems.*
- **US-005.** *As a Service Manager, I want the system to detect SLA breaches deterministically per policy so that escalation is triggered without manual intervention.*
- **US-006.** *As a Service Manager, I want automated escalations to execute on breach so that the "SLA breaches trigger escalation per policy" rule is enforced without ad-hoc workarounds.*
- **US-007.** *As a Service Manager, I want escalation workflow transitions to run via workflow, with approvals where policy requires, so that escalation governance is deterministic.*
- **US-008.** *As a Service Manager, I want breach notifications dispatched via the tenant's configured channels so that responsible actors are alerted on breach and on each escalation transition.*
- **US-009.** *As a security reviewer, I want every SLA Policy registration, clock event, breach detection, escalation transition, approval decision, scheduled-check run, and automated-escalation run to be audited via `ENG-004` so that SLA history is reconstructible from an authoritative log.*
- **US-010.** *As a Service Manager, I want authorization on SLA Policy registration, clock adjustments, escalation transitions, and approval decisions enforced via `ENG-002` so that only permitted actors can execute them.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 SLA Policy registration (US-001)

- **Given** a company under an active tenant,
  **when** a Service Manager registers an SLA Policy scoped per ticket type × territory × contract entitlement,
  **then** the policy resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline, and structural validation runs via `ENG-012`.
- **Given** an attempt to register an SLA-policy key outside Field Service's declared configuration namespace,
  **when** the registration is submitted,
  **then** the registration is rejected deterministically.

### 5.2 SLA Policy resolution (US-002)

- **Given** a Field Ticket or Visit under a (tenant, company) with a resolvable (ticket type, territory, contract entitlement) tuple,
  **when** SLA resolution is invoked,
  **then** exactly one SLA Policy is selected deterministically via `ENG-012`; ties resolve by the deterministic tiebreaker declared in the registered policy set.
- **Given** no SLA Policy resolves for the tuple,
  **when** resolution completes,
  **then** the outcome is audited via `ENG-004`; no SLA clock is started for that context.

### 5.3 SLA clock tracking (US-003)

- **Given** a Field Ticket or Visit lifecycle transition (from `SPR-MOD-012-001` … `SPR-MOD-012-003`) that starts, pauses, resumes, or stops the SLA clock per the resolved SLA Policy,
  **when** the transition commits,
  **then** the SLA clock state is updated deterministically via `ENG-012` and every clock event is audited via `ENG-004`.
- **Given** upstream Field Service events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`) received via `ENG-024`,
  **when** consumed by the SLA-clock handler,
  **then** each event drives at most one deterministic clock transition; duplicate delivery is idempotent.

### 5.4 Scheduled SLA checks (US-004)

- **Given** open SLA clocks in a (tenant, company),
  **when** the scheduled-SLA-check job runs via `ENG-014`,
  **then** each open clock is evaluated via `ENG-012`; the run itself is audited via `ENG-004`; breaches detected drive §5.5 and §5.6.
- **Given** a scheduler run that yields no open clocks,
  **when** the run completes,
  **then** the run itself is audited but no escalations or notifications are emitted.

### 5.5 SLA breach detection (US-005)

- **Given** an open SLA clock evaluated against its resolved SLA Policy,
  **when** the elapsed time exceeds the policy threshold,
  **then** a breach is detected deterministically via `ENG-012`, and the breach is audited via `ENG-004`.

### 5.6 Automated escalation on breach (US-006)

- **Given** a detected SLA breach,
  **when** the automated-escalation handler runs via `ENG-013`,
  **then** the escalation transition executes via `ENG-010`, approval routing runs via `ENG-011` where declared by policy, and the outcome is audited via `ENG-004`.
- **Given** an escalation whose approval is denied,
  **when** the denial commits,
  **then** the terminal outcome is audited; further escalation steps run only if declared by policy.

### 5.7 Escalation workflow transitions (US-007)

- **Given** an escalation transition declared by the resolved SLA Policy,
  **when** the transition executes,
  **then** it runs via `ENG-010` Workflow; where policy requires human approval, routing runs via `ENG-011` Approval; every transition and approval decision is audited via `ENG-004`.
- **Given** an attempt to execute an escalation transition not declared by the resolved policy,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.8 Breach notifications (US-008)

- **Given** a detected SLA breach or an executed escalation transition,
  **when** the event commits,
  **then** notifications are emitted via `ENG-025` under the tenant's configured channels.

### 5.9 Audit integration (US-009)

- **Given** any SLA Policy registration, SLA clock event, breach detection, escalation transition, approval decision, scheduled-SLA-check run, or automated-escalation run,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition or action type, and timestamp.

### 5.10 Authorization (US-010)

- **Given** any SLA-policy registration, SLA-clock adjustment, escalation-transition, or approval-decision action,
  **when** it executes,
  **then** it is subject to `ENG-002` Authorization under `ADR-032` RBAC + ABAC; unauthorized requests are rejected deterministically.

### 5.11 Isolation invariants (`ADR-011`)

- **Given** any SLA read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.12 Ownership consumption invariants

- **Given** any SLA Policy that references a contract entitlement,
  **when** it resolves,
  **then** the entitlement is consumed read-only from MOD-011 AMC; no AMC-owned entity is redefined here.
- **Given** any downstream module or sprint requiring SLA state,
  **when** it reads or reacts to SLA state,
  **then** it does so exclusively through Field Service read APIs and audit records; no downstream module creates an independent SLA Policy master or clock.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-012` — Field Service.
- **Module PRD:** [`docs/20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (SLA and escalation tracking), §3 (Service Manager, Dispatcher, Field Technician), §4 (Escalation), §7 (SLA breach rule), §10 (SLA policies), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-012` MODULE_PRD.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-012-001`, `SPR-MOD-012-003`.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen) — Contract Entitlement referenced read-only for SLA-policy resolution by contract entitlement.
- **Cross-module consumption (events only):** Upstream Field Service events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`) consumed via `ENG-024` to drive SLA clock lifecycle. MOD-011 entitlement references consumed read-only.
- **Downstream sprints:** `SPR-MOD-012-005` (Field Service Analytics & Compliance) — per [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Field Service Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and of the Sprint Plan §2 engines declared for `SPR-MOD-012-004`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on SLA-policy registration, SLA-clock adjustments, escalation transitions, and approval decisions under `ADR-032` RBAC + ABAC. |
| `ENG-004` Audit | Records every SLA Policy registration, SLA clock event, breach detection, escalation transition, approval decision, scheduled-check run, and automated-escalation run. |
| `ENG-005` Configuration | Registers and resolves SLA Policies and escalation-workflow definitions under the tenant/company hierarchy. |
| `ENG-010` Workflow | Enforces escalation-workflow transitions declared by SLA Policy. |
| `ENG-011` Approval | Routes human approvals declared by escalation policy. |
| `ENG-012` Rules | Evaluates SLA-policy resolution, SLA-clock state transitions, and breach detection. |
| `ENG-013` Automation | Executes automated escalations on breach. |
| `ENG-014` Scheduler | Executes scheduled SLA checks. |
| `ENG-024` Eventing | Consumes upstream Field Service events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`) to drive SLA-clock lifecycle. |
| `ENG-025` Notification | Emits breach and escalation notifications. |

Field Service business semantics (SLA Policy master, SLA clock tracking, escalation-workflow definitions, SLA-policy configuration namespace) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §19.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every SLA-policy, SLA-clock, and escalation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every SLA action. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| SLA Policy | MOD-012 (this sprint) | Per-company policy resolved per ticket type × territory × contract entitlement; registered via `ENG-005`, evaluated via `ENG-012`. |
| SLA Clock | MOD-012 (this sprint) | Clock state tracked per Field Ticket or Visit under a resolved SLA Policy; state transitions (start/pause/resume/stop) driven by upstream lifecycle events. |
| Escalation Workflow Definition | MOD-012 (this sprint) | Per-policy escalation transitions and approval routing; enforced via `ENG-010`/`ENG-011`. |
| SLA Breach Record | MOD-012 (this sprint) | Immutable record of a detected breach against a specific SLA Clock and resolved SLA Policy. |
| Escalation Transition Record | MOD-012 (this sprint) | Immutable record of each escalation transition executed against a Breach Record. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **SLA Policies** and one **SLA-policy configuration** namespace.
- An **SLA Clock** references exactly one **Field Ticket** or exactly one **Visit** in the same (tenant, company), and exactly one resolved **SLA Policy**.
- A **Breach Record** references exactly one **SLA Clock** and exactly one **SLA Policy**.
- An **Escalation Transition Record** references exactly one **Breach Record**.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-012` per the Field Service Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Contract Entitlement** referenced by an SLA Policy is owned by MOD-011 AMC and is consumed read-only; it is not a Field-Service-owned entity.
- The **Field Ticket**, **Ticket Type**, **Territory**, and **Visit** entities are owned by MOD-012 from `SPR-MOD-012-001` through `SPR-MOD-012-003` and are referenced here without redefinition.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Field-Service-owned entity.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- Per Sprint Plan §2 (`SPR-MOD-012-004`), this sprint does not enumerate a newly originated domain event. SLA breach and escalation notifications are dispatched via `ENG-025` under the tenant's configured channels; any SLA-domain event registered in the authoritative event catalog for this sprint is tracked as a deferred registration item in §14.

### 11.2 Consumed

- **`FieldTicketCreated`** (from `SPR-MOD-012-001`) — consumed via `ENG-024` to start SLA clocks against Field Tickets per resolved SLA Policy.
- **`VisitAssigned`** (from `SPR-MOD-012-002`) — consumed via `ENG-024` to drive SLA-clock transitions against Visits per resolved SLA Policy.
- **`FieldVisitCompleted`** (from `SPR-MOD-012-003`) — consumed via `ENG-024` to stop SLA clocks against Visits per resolved SLA Policy.

Payload contracts for Field Service events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every SLA-policy, SLA-clock, and escalation read and write.
- [ ] Every SLA Policy registration, SLA clock event, breach detection, escalation transition, approval decision, scheduled-SLA-check run, and automated-escalation run produces an audit record via `ENG-004`.
- [ ] SLA-policy configuration namespace is initialized per company via `ENG-005`.
- [ ] SLA-policy resolution runs deterministically per (ticket type, territory, contract entitlement) via `ENG-012`.
- [ ] SLA clocks track Field Ticket and Visit lifecycle transitions deterministically via `ENG-012`.
- [ ] Scheduled SLA checks execute via `ENG-014`; automated escalations execute via `ENG-013`.
- [ ] Escalation transitions execute via `ENG-010`; approval routing executes via `ENG-011` where declared by policy.
- [ ] Notifications are emitted on breach and on each escalation transition via `ENG-025`.
- [ ] Upstream Field Service events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`) are consumed via `ENG-024` idempotently.
- [ ] Authorization is enforced on SLA-policy, SLA-clock, escalation, and approval actions via `ENG-002`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-012_SPRINT_PLAN.md` §2 (`SPR-MOD-012-004`):

- SLA policies resolve deterministically per ticket/visit context via `ENG-005`.
- SLA breach rules evaluate via `ENG-012`; escalations run via `ENG-010`/`ENG-011`.
- Scheduled SLA checks run via `ENG-014`; automated escalations run via `ENG-013`.
- Notifications on breach are dispatched via `ENG-025`.

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
  - **Description:** MOD-012 depends on `MOD011_AMC_BASELINE_v1` being frozen and stable for Contract Entitlement references used in SLA-policy resolution.
  - **Impact:** Any drift in AMC-owned entitlement references would break SLA-policy resolution.
  - **Mitigation:** Consume entitlements per the AMC baseline contract; escalate any change as an AMC defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-012 depends on `SPR-MOD-012-001` and `SPR-MOD-012-003` being complete; SLA clocks require Field Ticket and Visit lifecycles authored there.
  - **Impact:** Regressions in prior sprints would block SLA tracking and escalation.
  - **Mitigation:** Consume upstream contracts; treat regressions as defects at their originating sprint.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Non-determinism in SLA-policy resolution or in breach detection (unstable tiebreakers, ambiguous clock semantics) would violate testability of §5.2 and §5.5.
  - **Impact:** Non-deterministic SLA behavior would break audit reconstruction and downstream analytics.
  - **Mitigation:** Require a deterministic tiebreaker as part of the registered SLA-policy configuration; enforce structural validation via `ENG-012` at registration time.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Later Field Service sprint (`SPR-MOD-012-005`) is deferred; scope-creep back into this sprint would dilute SLA & Escalation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Field-Service-owned entities (SLA Policy, SLA Clock, Escalation Workflow Definition, SLA-policy configuration namespace) MUST NOT be redefined by downstream modules; MOD-011 AMC entitlement mechanics, MOD-016 service-ticket master, and MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the SLA Policy Master Authority (§1.1.1), SLA Clock and Escalation Workflow Authority (§1.1.2), and cross-module boundary (§1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 4 consumes `FieldTicketCreated`, `VisitAssigned`, and `FieldVisitCompleted`. Any event name not yet present in the authoritative event catalog at authoring time is a deferred event-catalog registration item; any SLA-domain event that policy governance may later register is likewise deferred.
  - **Impact:** If not registered before the sprint enters `In Progress`, consumers cannot subscribe.
  - **Mitigation:** Confirm event catalog registration of consumed events before this sprint enters `In Progress`. Register any new SLA-domain event via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — SLA-policy resolution determinism; SLA-clock state-transition invariants; breach-detection determinism; escalation-transition invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, workflow via `ENG-010`, approval routing via `ENG-011`, rule evaluation via `ENG-012`, automation via `ENG-013`, scheduler via `ENG-014`, event consumption via `ENG-024`, notification emission via `ENG-025`, authorization via `ENG-002`.
- **Contract** — `FieldTicketCreated`, `VisitAssigned`, and `FieldVisitCompleted` consumption contracts per the authoritative event catalog.
- **End-to-end (smoke)** — Escalation: SLA-policy registration → resolution → clock start on `FieldTicketCreated` / `VisitAssigned` → scheduled check → breach detection → automated escalation with approval routing → notifications; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an MOD-011 Contract-Entitlement read-only fixture, and a deterministic SLA-policy configuration fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider expressing SLA-policy resolution as a pure, deterministic function over (Field Ticket or Visit context, {registered SLA Policies}) so §5.2 tiebreaker determinism is trivially satisfied and testable.
- Consider modeling the SLA Clock as a small state machine driven by upstream lifecycle events so audit emission (§5.9) is trivially satisfiable at every state transition.
- Consider an idempotent consumer keyed by (tenant, company, upstream_event_id) for each of `FieldTicketCreated`, `VisitAssigned`, and `FieldVisitCompleted` so replays do not double-drive clock transitions.
- Consider scoping scheduled-SLA-check batches by (tenant, company) so a slow tenant cannot starve others.
- Consider expressing escalation transitions declaratively per SLA Policy so the same policy configuration drives `ENG-010` and, where applicable, `ENG-011`.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-012-004`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Escalation process: SLA Policy master, SLA clock tracking, escalation workflows with approvals, scheduled SLA checks, automated escalations, and breach notifications (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-012 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Field Service Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters, dispatch, mobile execution/closure, analytics, MOD-011-owned AMC entitlement mechanics, MOD-016-owned service-ticket master, MOD-005-owned Item and stock movements, financial postings, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-012-005`) begin immediately after this one completes?**
   Yes. `SPR-MOD-012-005` Field Service Analytics & Compliance is the immediate successor per [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) §2 and consumes output from `SPR-MOD-012-001` … `SPR-MOD-012-004`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md`](./SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md), [`./SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md`](./SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD011_AMC_BASELINE_v1.md`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
