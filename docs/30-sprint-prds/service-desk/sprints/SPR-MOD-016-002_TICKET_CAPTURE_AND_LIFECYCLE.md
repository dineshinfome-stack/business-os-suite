---
title: "SPR-MOD-016-002 — Ticket Capture & Lifecycle"
summary: "Sprint PRD for the Ticket-to-resolution slice of MOD-016: multi-channel Service Ticket capture (Email, Chat, WhatsApp, Voice), Service Ticket transaction lifecycle, categorization/routing execution, parent/child ticket relations, close-with-open-child-task rule, initial assignment invocation, attachment registration, and publication of ServiceTicketCreated / ServiceTicketUpdated / ServiceTicketClosed. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-016-002"
parent_module: "MOD-016"
parent_sprint_plan: "MOD-016_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "18.0.2"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-012", "ENG-017", "ENG-020", "ENG-023", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "service-desk", "mod-016", "ticket-capture", "ticket-lifecycle", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD016-002-20260717T080000Z-001"
parent_result_id: "GT003-MOD016-001-20260717T070000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-016-002 — Ticket Capture & Lifecycle

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-016 Service Desk** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-016-002` (permanent) |
| Parent Module | `MOD-016` — Service Desk |
| Parent Sprint Plan | [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md) |
| Upstream Sprint | [`SPR-MOD-016-001`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD006_CRM_BASELINE_v1`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-016-003`, `SPR-MOD-016-004`, `SPR-MOD-016-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Ticket-to-resolution** capability substrate for BusinessOS Service Desk: multi-channel capture of Service Tickets (Email, Chat, WhatsApp, Voice) via `ENG-023`; the **Service Ticket** transaction and its lifecycle governed by `ENG-010`; categorization and routing execution against the Ticket Category master and routing rules established by `SPR-MOD-016-001`; parent/child ticket relations; the close-with-open-child-task rule enforced via `ENG-012`; initial assignment invocation; attachment registration via `ENG-008` and document handling via `ENG-007`; consumption of upstream events `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon`; and publication of `ServiceTicketCreated`, `ServiceTicketUpdated`, and `ServiceTicketClosed` via `ENG-024`. SLA clock evaluation, escalation execution, and analytics are explicitly **not** in scope — they belong to `SPR-MOD-016-003` and `SPR-MOD-016-005`.

> **Service Desk Ownership Convention (recapitulated).** The Service Desk module owns the business semantics of the **Service Ticket** transaction, its lifecycle, and its cross-entity associations (Customer, Contact, Asset, Location). ERP Core Engines provide shared infrastructure (authorization, audit, configuration, localization, document, attachment, workflow, rules, numbering, search, integration, event, notification) but **MUST NOT** redefine Service Desk business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Customer master data remains exclusive to **MOD-006 CRM** and is consumed read-only. Asset master data remains exclusive to **MOD-013 Assets** and is consumed read-only. Field visit handoff to **MOD-012 Field Service** occurs strictly through published events. Cross-module KPI definitions remain exclusive to **MOD-017 Analytics**. Ledger effects (if any) remain exclusive to **MOD-002 Accounting** via `ENG-015` / `ENG-016`.

#### 1.1.1 Service Ticket Transaction Authority

The **Service Ticket** transaction is authoritatively owned by MOD-016 Service Desk in this sprint. No other module MAY create, edit, close, reopen, or independently maintain a parallel Service Ticket transaction. Downstream sprints and modules consume Service Ticket state exclusively through Service-Desk-owned events (`ServiceTicketCreated`, `ServiceTicketUpdated`, `ServiceTicketClosed`) and Service-Desk-owned read APIs; they MUST NOT redefine the Service Ticket entity or its lifecycle.

#### 1.1.2 Multi-Channel Capture Authority

**Multi-channel Service Ticket capture** — Email, Chat, WhatsApp, Voice — is authoritatively owned by MOD-016 Service Desk in this sprint. Inbound channel adapters are invoked via `ENG-023` and normalized to the Service Ticket entity within Service Desk. External channel providers, transport protocols, and provider credentials remain outside Service Desk ownership and are governed by their integration contracts; MOD-016 does not redefine them.

#### 1.1.3 Ticket Lifecycle & Parent/Child Authority

The **Service Ticket state machine** and the **parent/child ticket relationship model** are authoritatively owned by this sprint. State transitions are executed via `ENG-010` and validated deterministically via `ENG-012`. The **close-with-open-child-task rule** (Module PRD §7) is enforced via `ENG-012` at transition time. No downstream sprint or module MAY redefine the Service Ticket lifecycle or the parent/child model.

#### 1.1.4 Service Desk ↔ Platform, CRM, Assets, Field Service, Accounting, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Service Desk consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **MOD-006 CRM** owns Customer master data. Service Desk consumes it read-only through CRM APIs; no Customer master is authored here.
- **MOD-013 Assets** owns Asset master data (where an Asset is associated with a ticket). Service Desk consumes it read-only through Assets APIs; no Asset master is authored here.
- **MOD-012 Field Service** consumes `FieldVisitCompleted` and is consumed by MOD-016 via `FieldVisitCompleted` reconciliation to Service Tickets. Field-service transactions are not redefined by MOD-016.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. MOD-016 declares no direct posting responsibilities.
- **MOD-017 Analytics** owns cross-module KPI definitions. Operational Service Desk reports are surfaced by `SPR-MOD-016-005`; cross-module KPIs are never redefined by MOD-016.

Ownership boundaries SHALL NOT be redefined in downstream Service Desk Sprint PRDs.

### 1.2 In Scope

- Service Ticket transaction: create, update, assign, transition, close, and reopen (where the lifecycle permits) under a tenant/company; per-ticket attributes including channel of origin, category (from `SPR-MOD-016-001`), Customer / Contact / Asset / Location associations, description, priority, requester identity (read-only from `ENG-001`), and lifecycle state.
- **Multi-channel capture** via `ENG-023` for Email, Chat, WhatsApp, and Voice inbound channels; normalization to Service Ticket at capture time; deduplication of concurrent captures for the same channel-thread key via `ENG-012`.
- **Service Ticket lifecycle** executed via `ENG-010` covering business states (e.g., `New → Assigned → In Progress → Waiting on Customer → Resolved → Closed`; `Reopened` where permitted). Concrete state labels are business-owned; enforcement of transition legality is delegated to `ENG-010` + `ENG-012`.
- **Categorization and routing execution** against Ticket Categories and routing rules from `SPR-MOD-016-001`; routing decisions run deterministically via `ENG-012`; the resulting initial assignment is recorded on the ticket.
- **Parent/child ticket relationship** creation and traversal; the close-with-open-child-task rule (Module PRD §7) enforced via `ENG-012` on `Close` transitions.
- **Attachment registration** via `ENG-008` for evidence, screenshots, and channel-artifact files; document handling via `ENG-007` for structured artifacts (e.g., ticket transcripts, exports of channel threads).
- **Ticket numbering** issued at Service Ticket creation via `ENG-017` using the Service-Ticket numbering series registered in `SPR-MOD-016-001`.
- **Ticket search** via `ENG-020` over ticket identifier, requester, category, state, and free-text description.
- **Audit emission** via `ENG-004` for every Service Ticket state transition, association change, attachment registration, and reassignment.
- **Authorization** on every Service Ticket action via `ENG-002`; permissions registered by `ENG-003` under the RBAC + ABAC model.
- **Locale-scoped** ticket labels and channel-content presentation via `ENG-006` where applicable.
- **Events published** via `ENG-024`: `ServiceTicketCreated`, `ServiceTicketUpdated`, `ServiceTicketClosed`. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.
- **Events consumed** via `ENG-024`: `FieldVisitCompleted` (reconciles field-visit outcome to the originating ticket), `CustomerCreated` (allows a ticket authored against an ad-hoc requester to bind to the canonical Customer once created), `OpportunityWon` (allows a Service Desk onboarding ticket to be raised or reconciled).
- **Notification emission** via `ENG-025` on ticket creation, reassignment, state transitions, and closure under the tenant's configured channels.
- **Read-only consumption** of Customer master via MOD-006 CRM APIs and Asset master via MOD-013 Assets APIs (where an Asset association is provided).

### 1.3 Out of Scope

- Foundation masters (Ticket Category, SLA Policy) and Service Desk operations configuration (routing rules, escalation matrices, business hours per region, numbering-series registration) — `SPR-MOD-016-001`.
- **SLA clock evaluation**, pause-on-customer-waiting rule, **SLA Breach Event** transaction lifecycle, **escalation execution**, and `SLABreached` publication — `SPR-MOD-016-003`.
- Knowledge Article master and review-before-publish rule; macros; CSAT Response transaction; CSAT surveys; `KnowledgeArticlePublished` publication — `SPR-MOD-016-004`.
- Operational reports (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity); dashboards; bulk exports; consumption of MOD-017 KPI definitions; module read model — `SPR-MOD-016-005`.
- Customer master authoring — owned by MOD-006 CRM.
- Asset master authoring — owned by MOD-013 Assets.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Financial postings (if any) — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Cross-module KPI definitions — owned by MOD-017 Analytics.
- Field-visit transactions and mobile field execution — owned by MOD-012 Field Service; MOD-016 only consumes `FieldVisitCompleted`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-016-002`, the following will exist:

- **Business capabilities.**
  - A Support Agent or an inbound channel adapter can capture a Service Ticket via Email, Chat, WhatsApp, or Voice; the ticket is normalized to the authoritative Service Ticket entity.
  - A Support Agent / Manager can update, assign, transition, close, and (where permitted) reopen a Service Ticket under a tenant/company.
  - A Support Manager can register parent/child ticket relationships; the close-with-open-child-task rule is enforced deterministically.
  - Categorization and routing execute against the Ticket Category master and routing rules from `SPR-MOD-016-001` at capture time.
  - Customer, Contact, Asset, and Location associations are captured against the ticket; Customer and Asset associations resolve read-only through MOD-006 and MOD-013 APIs.
  - Attachments and channel-artifact documents are registered via `ENG-008` and `ENG-007`.
  - Service Ticket numbers issue via `ENG-017` at creation using the series registered in `SPR-MOD-016-001`.
- **Domain events.**
  - `ServiceTicketCreated`, `ServiceTicketUpdated`, and `ServiceTicketClosed` are published via `ENG-024` on the corresponding lifecycle transitions. Payload contracts are governed by the authoritative event catalog and not redefined here.
  - `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon` are consumed via `ENG-024` and reconciled to Service Tickets where applicable.
- **Configuration artifacts.** No new configuration namespaces are introduced. Routing rules, escalation matrices, business hours per region, and numbering series are consumed read-only from the configuration namespace initialized in `SPR-MOD-016-001`.
- **Audit artifacts.** An audit record exists for every Service Ticket state transition, association change, attachment registration, and reassignment, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Ticket creation, reassignment, state transitions, and closure produce notifications via `ENG-025` under the tenant's configured channels where enabled.
- **Search artifacts.** Ticket search is available via `ENG-020` over ticket identifier, requester, category, state, and free-text description.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-016-002`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-016 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Ticketing primitives | Service Ticket transaction and its lifecycle |
| §2 Business Scope — Multi-channel ticket capture; submodule Tickets | Multi-channel capture via `ENG-023`; Service Ticket lifecycle |
| §3 Personas — Support Agent, Support Manager; Customer, Employee | User stories (§4) |
| §4 Business Processes — Ticket-to-resolution | Lifecycle executed via `ENG-010` with rules via `ENG-012` |
| §6 Transactions — Service Ticket | Service Ticket transaction lifecycle |
| §7 Business Rules — a ticket cannot be closed while it has open child tasks | Enforced via `ENG-012` on `Close` transitions |
| §8 Integration Points — External Systems (Email, Chat, WhatsApp, Voice); published `ServiceTicketCreated`, `ServiceTicketClosed`; consumed `FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon` | Inbound channels via `ENG-023`; publication via `ENG-024`; consumption via `ENG-024` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Service Desk Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md) §4.1 allocates the following §2 capability as originating to `SPR-MOD-016-002`:

| Module PRD §2 Capability | Origin Sprint |
| --- | --- |
| Multi-channel ticket capture | `SPR-MOD-016-002` |

Per Sprint Plan §4.3, the transaction entity **Service Ticket** is originating-allocated to `SPR-MOD-016-002`:

| Transaction (Module PRD §6) | Origin Sprint |
| --- | --- |
| Service Ticket | `SPR-MOD-016-002` |

Per Sprint Plan §4.4, the following events are originating-allocated to `SPR-MOD-016-002`:

| Event | Direction | Origin Sprint |
| --- | --- | --- |
| ServiceTicketCreated | Published | `SPR-MOD-016-002` |
| ServiceTicketClosed | Published | `SPR-MOD-016-002` |
| FieldVisitCompleted | Consumed | `SPR-MOD-016-002` |
| CustomerCreated | Consumed | `SPR-MOD-016-002` |
| OpportunityWon | Consumed | `SPR-MOD-016-002` |

`ServiceTicketUpdated` is published by this sprint as the standard state-change event of the Service Ticket transaction (Module PRD §6, §8); no other Service Desk sprint claims it as its origin. These allocations are unique; no §2 capability or §6 transaction is originating-allocated in more than one sprint.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 (Multi-channel ticket capture), §4 (Ticket-to-resolution), §6 (Service Ticket), §7 (close-with-open-child-task), §8 (Email/Chat/WhatsApp/Voice; `ServiceTicketCreated`/`ServiceTicketClosed`; `FieldVisitCompleted`/`CustomerCreated`/`OpportunityWon`) → this Sprint PRD → deliverables in §2 (multi-channel capture, Service Ticket lifecycle, categorization/routing execution, parent/child + close-with-open-child rule, attachments/documents, ticket numbering, search, event publication/consumption, notifications, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Support Agent, I want a Service Ticket to be created automatically when an inbound Email, Chat, WhatsApp, or Voice interaction arrives via `ENG-023`, so that no support interaction is lost and every interaction is a first-class Service Ticket.*
- **US-002.** *As a Support Agent, I want to create a Service Ticket manually against a Customer / Contact / Asset / Location under a company, so that internally-originated tickets are captured with full context.*
- **US-003.** *As a Support Agent, I want to update a Service Ticket's category, priority, description, and associations, so that the ticket reflects the current understanding of the case.*
- **US-004.** *As a Support Manager, I want the Service Ticket lifecycle (New → Assigned → In Progress → Waiting on Customer → Resolved → Closed; Reopened where permitted) to be enforced deterministically via `ENG-010` with legality validated via `ENG-012`, so that no invalid transition can be applied.*
- **US-005.** *As a Support Manager, I want categorization and routing to execute against the Ticket Category master and routing rules from `SPR-MOD-016-001` at capture time and produce an initial assignment recorded on the ticket, so that tickets reach the correct queue/agent without manual triage.*
- **US-006.** *As a Support Agent, I want to establish parent/child relationships between Service Tickets, so that a master case with subordinate tasks is representable.*
- **US-007.** *As a Support Manager, I want a Service Ticket to be blocked from closing while it has open child tasks (Module PRD §7), so that master closures never leave orphaned open work.*
- **US-008.** *As a Support Agent, I want to attach evidence files and register channel-artifact documents against a Service Ticket via `ENG-008` and `ENG-007`, so that the ticket carries all supporting material.*
- **US-009.** *As a Support Manager, I want each new Service Ticket to receive a document number issued via `ENG-017` from the series registered in `SPR-MOD-016-001`, so that ticket numbering is deterministic and immutable.*
- **US-010.** *As a Support Agent, I want to search Service Tickets via `ENG-020` by identifier, requester, category, state, and free-text description, so that I can locate cases quickly.*
- **US-011.** *As a downstream subscriber (SLA/Escalation, KB/CSAT, Analytics, Field Service, external), I want `ServiceTicketCreated`, `ServiceTicketUpdated`, and `ServiceTicketClosed` to be published via `ENG-024` on the corresponding transitions, so that downstream sprints and modules can react without polling Service Desk state.*
- **US-012.** *As a Support Manager, I want `FieldVisitCompleted` from MOD-012 Field Service, `CustomerCreated` from MOD-006 CRM, and `OpportunityWon` from MOD-006 CRM to be consumed via `ENG-024` and reconciled to Service Tickets where applicable, so that field-visit outcomes, customer canonicalization, and won-opportunity onboarding are reflected on the ticket without manual reconciliation.*
- **US-013.** *As a Support Agent, I want notifications on ticket creation, reassignment, state transitions, and closure under the tenant's configured channels, so that stakeholders are kept informed.*
- **US-014.** *As a Support Manager, I want every Service Ticket state transition, association change, attachment registration, and reassignment to be audited via `ENG-004`, so that I can reconstruct the full ticket history from an authoritative log.*
- **US-015.** *As a security reviewer, I want every Service Ticket action to be authorized via `ENG-002` against permissions registered by `ENG-003` under the RBAC + ABAC model, and every read/write to be tenant-isolated per `ADR-011`, so that no cross-tenant or unauthorized action can succeed.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Multi-channel capture (US-001)

- **Given** an inbound interaction arriving on a configured channel (Email, Chat, WhatsApp, Voice) via `ENG-023`,
  **when** it is received under a tenant/company,
  **then** a Service Ticket is created with `channel_of_origin` set, categorization/routing invoked, and `ServiceTicketCreated` published exactly once per (tenant, company, ticket identifier).
- **Given** two concurrent inbound interactions carrying the same channel-thread key,
  **when** they are received,
  **then** they are deduplicated to a single Service Ticket via `ENG-012`; a second Service Ticket is not created.

### 5.2 Manual ticket creation (US-002)

- **Given** a valid Service Ticket creation request under a tenant/company referencing an active Customer (via MOD-006), an optional Contact, an optional Asset (via MOD-013), and an optional Location,
  **when** a Support Agent submits it,
  **then** the ticket is persisted with a stable identifier, a document number issued via `ENG-017`, and is audited.
- **Given** an attempt to reference a Customer, Asset, or Category from a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically via `ENG-012`.

### 5.3 Ticket update (US-003)

- **Given** an existing Service Ticket in a state that permits update,
  **when** category, priority, description, or associations are modified by an authorized actor,
  **then** the change is persisted, `ServiceTicketUpdated` is published via `ENG-024`, and the change is audited via `ENG-004`.

### 5.4 Lifecycle enforcement (US-004)

- **Given** a Service Ticket in state `S`,
  **when** a transition to state `S'` is requested,
  **then** `ENG-010` executes the transition only if the transition (`S → S'`) is legal per the business state machine; illegal transitions are rejected via `ENG-012` before any state change.
- **Given** any state transition that completes,
  **when** it commits,
  **then** an audit record is produced via `ENG-004` and `ServiceTicketUpdated` (for interior transitions) or `ServiceTicketClosed` (for `Closed`) is published.

### 5.5 Categorization and routing execution (US-005)

- **Given** a Service Ticket at creation time,
  **when** categorization/routing runs,
  **then** the ticket's category and initial assignment are resolved deterministically via `ENG-012` against the Ticket Category master and routing rules from `SPR-MOD-016-001`; the assignment is recorded on the ticket.
- **Given** a routing rule reference to an inactive Category or business-hours region,
  **when** routing runs,
  **then** the request is rejected deterministically via `ENG-012` and no assignment is persisted.

### 5.6 Parent/child relationship (US-006)

- **Given** two Service Tickets under the same tenant/company,
  **when** a parent/child relationship is registered,
  **then** it is persisted and audited; cycles are rejected via `ENG-012`.
- **Given** an attempt to relate tickets across different companies,
  **when** the request is submitted,
  **then** it is rejected via `ENG-012`.

### 5.7 Close-with-open-child rule (US-007) — Module PRD §7

- **Given** a Service Ticket with at least one open child ticket,
  **when** a `Close` transition is attempted,
  **then** the transition is rejected deterministically via `ENG-012` before any state change; no `ServiceTicketClosed` is published.
- **Given** a Service Ticket with no open child tickets,
  **when** a `Close` transition is attempted,
  **then** it succeeds via `ENG-010`, `ServiceTicketClosed` is published via `ENG-024`, and the transition is audited via `ENG-004`.

### 5.8 Attachments and documents (US-008)

- **Given** an authorized actor and an existing Service Ticket,
  **when** an attachment is registered,
  **then** it is registered via `ENG-008`, associated to the ticket, and audited; structured artifacts are handled via `ENG-007`.

### 5.9 Ticket numbering (US-009)

- **Given** a valid Service Ticket creation request,
  **when** it is accepted,
  **then** a document number is issued via `ENG-017` from the Service-Ticket series registered in `SPR-MOD-016-001`; allocated numbers are immutable thereafter.

### 5.10 Ticket search (US-010)

- **Given** any Service Ticket persisted under a tenant/company,
  **when** a search is executed via `ENG-020` by identifier, requester, category, state, or free-text description,
  **then** the ticket is retrievable under the caller's tenant scope only.

### 5.11 Event publication (US-011)

- **Given** a Service Ticket create, interior update, or close transition,
  **when** the transaction commits,
  **then** `ServiceTicketCreated`, `ServiceTicketUpdated`, or `ServiceTicketClosed` (respectively) is published via `ENG-024` exactly once per (tenant, company, ticket identifier, transition), using the authoritative envelope and payload contract governed by the event catalog.

### 5.12 Event consumption (US-012)

- **Given** a `FieldVisitCompleted` event referencing a Service Ticket,
  **when** it is consumed via `ENG-024`,
  **then** the ticket is reconciled with the visit outcome (state and associations updated per the business rule set) and the change is audited via `ENG-004`.
- **Given** a `CustomerCreated` event referencing a prior ad-hoc requester on an open ticket,
  **when** it is consumed,
  **then** the ticket's requester binds to the canonical Customer under `ENG-012` validation and the change is audited.
- **Given** an `OpportunityWon` event that maps to a Service Desk onboarding case per the routing rules,
  **when** it is consumed,
  **then** a Service Ticket is created or reconciled accordingly and audited.

### 5.13 Notifications (US-013)

- **Given** a ticket creation, reassignment, state transition, or closure and a tenant with a configured channel,
  **when** the transition commits,
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.14 Audit integration (US-014)

- **Given** any Service Ticket state transition, association change, attachment registration, or reassignment,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, ticket identifier, transition/change type, and timestamp.

### 5.15 Isolation & authorization invariants (US-015; `ADR-011`, `ADR-032`)

- **Given** any Service Ticket read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope per `ADR-011`, and authorized via `ENG-002` against permissions registered by `ENG-003` under the RBAC + ABAC model per `ADR-032`; unauthorized or cross-tenant actions are rejected before any state change.

### 5.16 Ownership consumption invariants

- **Given** any Service Desk code path that requires Customer data,
  **when** it needs Customer master data,
  **then** it consumes it read-only through MOD-006 CRM APIs; the Customer master is not redefined here.
- **Given** any Service Desk code path that requires Asset data,
  **when** it needs Asset master data,
  **then** it consumes it read-only through MOD-013 Assets APIs; the Asset master is not redefined here.
- **Given** any Service Desk code path,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.
- **Given** any Service Ticket transaction with potential ledger effects (billable service, etc.),
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through Service-Desk-published events (in this or later sprints); no Service Desk code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-016` — Service Desk.
- **Module PRD:** [`docs/20-module-prds/service-desk/MODULE_PRD.md`](../../../20-module-prds/service-desk/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md).
- **Upstream Sprint:** [`SPR-MOD-016-001`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md).
- **Module PRD sections fulfilled:** §1, §2 (Multi-channel ticket capture; submodule Tickets), §3, §4 (Ticket-to-resolution), §6 (Service Ticket), §7 (close-with-open-child-task), §8 (Email/Chat/WhatsApp/Voice; `ServiceTicketCreated`/`ServiceTicketClosed`; consumption of `FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon`), §12, §13. See §3.

---

## 7. Dependencies

- **Parent:** `MOD-016` MODULE_PRD.
- **Upstream sprint dependency:** [`SPR-MOD-016-001`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md) — provides Ticket Category / SLA Policy masters, routing rules, escalation matrices, business hours per region, and numbering-series registration. This sprint consumes those outputs read-only.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD006_CRM_BASELINE_v1`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) — Customer master (consumed read-only for ticket associations and `CustomerCreated`/`OpportunityWon` consumption).
- **Cross-module read-only integrations:** MOD-013 Assets (Asset master read; consumed via Assets APIs where an Asset is associated with a ticket); MOD-012 Field Service (`FieldVisitCompleted` consumption via `ENG-024`).
- **Downstream sprints:** `SPR-MOD-016-003` (SLA Enforcement & Escalations), `SPR-MOD-016-004` (Knowledge Base, Macros & CSAT), `SPR-MOD-016-005` (Service Analytics & Compliance) — per [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.1 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Service Desk Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every Service Ticket action (RBAC + ABAC per `ADR-032`). |
| `ENG-004` Audit | Records every Service Ticket state transition, association change, attachment registration, and reassignment. |
| `ENG-005` Configuration | Resolves routing rules, escalation-matrix references, business-hours references, and numbering-series references registered in `SPR-MOD-016-001` under the tenant → company → context hierarchy (read-only in this sprint). |
| `ENG-006` Localization | Resolves locale-scoped ticket labels and channel content where applicable. |
| `ENG-007` Document | Handles structured artifacts on Service Tickets (e.g., channel-thread exports, ticket transcripts). |
| `ENG-008` Attachment | Registers file attachments (evidence, screenshots, channel artifacts) against Service Tickets. |
| `ENG-010` Workflow | Executes the Service Ticket state machine (state transitions and their orchestration). |
| `ENG-012` Rules | Evaluates transition legality, referential integrity, same-company composition, close-with-open-child-task rule, routing-rule references, deduplication of channel-thread keys, and cycle detection on parent/child relations. |
| `ENG-017` Numbering | Allocates Service Ticket document numbers at creation time using the series registered in `SPR-MOD-016-001`. |
| `ENG-020` Search | Indexes and retrieves Service Tickets by identifier, requester, category, state, and free-text description. |
| `ENG-023` Integration | Provides the inbound channel adapters (Email, Chat, WhatsApp, Voice) that deliver interactions for capture as Service Tickets. |
| `ENG-024` Event | Publishes `ServiceTicketCreated`, `ServiceTicketUpdated`, `ServiceTicketClosed`; consumes `FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon`. |
| `ENG-025` Notification | Emits notifications on ticket creation, reassignment, state transitions, and closure under the tenant's configured channels. |

Service Desk business semantics (Service Ticket transaction, its lifecycle, parent/child model, multi-channel capture semantics, close-with-open-child-task rule) are owned by this module and are not delegated to any engine.

Identity (`ENG-001`), Permission Management (`ENG-003`), Approval (`ENG-011`), Automation (`ENG-013`), Reporting (`ENG-021`), Dashboard (`ENG-022`), Export (`ENG-027`), and AI Copilot (`ENG-028`) are declared in the Module PRD engine union but are **not** consumed by this sprint per Sprint Plan §2 (`SPR-MOD-016-002`): identity is transitively consumed through `ENG-002`, permissions are consumed for permission-check evaluation via `ENG-002` without new registrations here, and the remaining engines are consumed by later Service Desk sprints per their allocated scope.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Service Ticket read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every Service Ticket action. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Event. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Service Ticket | MOD-016 (this sprint) | The authoritative Service Desk transaction. Scoped to a tenant/company. Carries `channel_of_origin`, category (references `SPR-MOD-016-001`), priority, requester identity (read-only from `ENG-001`), Customer/Contact/Asset/Location associations, description, current lifecycle state, and initial assignment. |
| Service Ticket Association | MOD-016 (this sprint) | The relationship between a Service Ticket and Customer / Contact / Asset / Location entities. Customer and Asset associations are read-only references to MOD-006 and MOD-013 masters. |
| Service Ticket Relationship | MOD-016 (this sprint) | The parent/child relationship between two Service Tickets in the same company. Acyclic; enforced via `ENG-012`. |
| Service Ticket Attachment | MOD-016 (this sprint, `ENG-008`-registered) | Registered attachment against a Service Ticket. Physical storage and metadata belong to `ENG-008`. |
| Service Ticket Document | MOD-016 (this sprint, `ENG-007`-registered) | Structured artifact (e.g., channel-thread export) associated with a Service Ticket via `ENG-007`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Service Tickets**.
- A **Service Ticket** references at most one **Ticket Category** (from `SPR-MOD-016-001`), at most one **Customer** (from MOD-006), zero or more **Contacts**, at most one **Asset** (from MOD-013), and at most one **Location**, all under the same company.
- A **Service Ticket Relationship** references exactly two Service Tickets under the same company (parent, child); the graph is acyclic.
- A **Service Ticket** owns zero or more **Service Ticket Attachments** and zero or more **Service Ticket Documents**.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-016` per the Service Desk Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Customer** entity is owned by MOD-006 CRM and is consumed read-only; it is not a Service-Desk-owned entity.
- The **Asset** entity is owned by MOD-013 Assets and is consumed read-only; it is not a Service-Desk-owned entity.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Service-Desk-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Service-Desk-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published and Consumed

Referenced authoritatively in [`../../../02-architecture/event-catalog.md`](../../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Event.

### 11.1 Published

- **`ServiceTicketCreated`** — published via `ENG-024` on Service Ticket creation. Origin sprint per Sprint Plan §4.4.
- **`ServiceTicketUpdated`** — published via `ENG-024` on interior Service Ticket updates (category / priority / description / association / state change other than close). Per Module PRD §6 and §8 this is the standard state-change event of the Service Ticket transaction and is originated by this sprint.
- **`ServiceTicketClosed`** — published via `ENG-024` on Service Ticket closure. Origin sprint per Sprint Plan §4.4.

### 11.2 Consumed

- **`FieldVisitCompleted`** — consumed from MOD-012 Field Service via `ENG-024`; reconciled to the originating Service Ticket per business rules.
- **`CustomerCreated`** — consumed from MOD-006 CRM via `ENG-024`; used to bind ad-hoc requesters on open tickets to the canonical Customer.
- **`OpportunityWon`** — consumed from MOD-006 CRM via `ENG-024`; used to originate or reconcile a Service Desk onboarding ticket per the routing rules from `SPR-MOD-016-001`.

Payload contracts for Service Desk events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

`SLABreached` and `KnowledgeArticlePublished` are declared in Module PRD §8 but are originated by later Service Desk sprints (`SPR-MOD-016-003` and `SPR-MOD-016-004` respectively) — not by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Service Ticket read and write.
- [ ] Authorization invariants (`ADR-032`) are enforced on every Service Ticket action.
- [ ] Every Service Ticket state transition, association change, attachment registration, and reassignment produces an audit record via `ENG-004`.
- [ ] The Service Ticket lifecycle is executed via `ENG-010`; illegal transitions are rejected via `ENG-012` before any state change.
- [ ] Categorization/routing runs deterministically via `ENG-012` against Ticket Category and routing rules from `SPR-MOD-016-001`; results are recorded on the ticket.
- [ ] The close-with-open-child-task rule (Module PRD §7) is enforced via `ENG-012`; no `ServiceTicketClosed` is published for tickets with open child tasks.
- [ ] `ServiceTicketCreated`, `ServiceTicketUpdated`, and `ServiceTicketClosed` publish via `ENG-024` exactly once per (tenant, company, ticket identifier, transition).
- [ ] `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon` are consumed via `ENG-024` and reconciled to Service Tickets per §5.12.
- [ ] Inbound channel adapters (Email, Chat, WhatsApp, Voice) capture via `ENG-023` and normalize to Service Ticket; concurrent captures for the same channel-thread key are deduplicated via `ENG-012`.
- [ ] Service Ticket document numbers issue via `ENG-017` from the series registered in `SPR-MOD-016-001`.
- [ ] Attachments register via `ENG-008` and structured artifacts via `ENG-007`.
- [ ] Ticket search is available via `ENG-020` per §5.10.
- [ ] Notifications are emitted via `ENG-025` on ticket creation, reassignment, state transitions, and closure under the tenant's configured channels where enabled.
- [ ] No Service Desk code path writes to `ENG-015` Voucher or `ENG-016` Posting.
- [ ] No Service Desk code path authors Customer master (MOD-006) or Asset master (MOD-013).
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) and in [`../README.md`](../README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-016_SPRINT_PLAN.md` §2 (`SPR-MOD-016-002`):

- Tickets can be captured across Email, Chat, WhatsApp, and Voice channels via `ENG-023`; attachments are handled via `ENG-008`; documents via `ENG-007`.
- Service Ticket lifecycle is enforced via `ENG-010`; categorization/routing decisions run deterministically via `ENG-012` against Ticket Category and routing rules from sprint 001.
- A ticket cannot be closed while it has open child tasks (rule enforced via `ENG-012`).
- `ServiceTicketCreated` and `ServiceTicketClosed` publish via `ENG-024`; `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon` are consumed and reconciled to tickets.
- Ticket search and retrieval are supported via `ENG-020`.
- Document numbers issue through `ENG-017`; all state changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-016 depends on `SPR-MOD-016-001` outputs (Ticket Category master, SLA Policy master, routing rules, escalation matrices, business hours per region, numbering-series registration) being in place before this sprint's implementation exits.
  - **Impact:** Missing foundation configuration would prevent deterministic categorization/routing execution, deterministic numbering, and correct SLA-Policy referencing in downstream sprints.
  - **Mitigation:** Consume `SPR-MOD-016-001` outputs read-only; treat any drift as a foundation defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-016 depends on `MOD001_PLATFORM_BASELINE_v1` (tenancy, users/roles/permissions, configuration hierarchy, localization, audit review) and `MOD006_CRM_BASELINE_v1` (Customer master) being frozen and stable.
  - **Impact:** Regressions in the Platform or CRM baselines would break tenant isolation, authorization, or Customer read access for tickets.
  - **Mitigation:** Consume upstream baselines per their frozen contracts; escalate any change as a baseline defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-013 Assets is not yet published (Baseline v1 exists but publication state is tracked in `MODULE_BASELINE_CATALOG.md`). Asset associations on Service Tickets depend on MOD-013 read APIs being available.
  - **Impact:** If Asset APIs are not available at implementation time, Asset associations become deferred; ticket capture and lifecycle for tickets without Asset context remain fully in scope.
  - **Mitigation:** Consume MOD-013 read APIs per their authoritative contract; where Asset APIs are unavailable, permit ticket creation without an Asset association without blocking capture (Asset association is optional per §5.2).
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Later Service Desk sprints (`SPR-MOD-016-003` … `SPR-MOD-016-005`) are deferred; scope-creep of SLA clock evaluation, escalation execution, KB/macros/CSAT, or analytics back into this sprint would dilute the Ticket Capture & Lifecycle scope.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries and Sprint Plan §4 allocations.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Service-Desk-owned entities (Service Ticket transaction, its lifecycle, parent/child model) MUST NOT be redefined by downstream modules; MOD-006-owned Customer, MOD-013-owned Asset, and MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Service Ticket Transaction Authority convention (§1.1.1), the Multi-Channel Capture Authority (§1.1.2), the Ticket Lifecycle & Parent/Child Authority (§1.1.3), and the cross-module boundary (§1.1.4) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** This sprint publishes `ServiceTicketCreated`, `ServiceTicketUpdated`, and `ServiceTicketClosed`, and consumes `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon`. Any of these event names not present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before this sprint enters `In Progress`, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register each event in the authoritative event catalog through the governance path before this sprint enters `In Progress`. This sprint does not modify the event catalog.
  - **Status:** Open

---

## 15. References

- Parent Module PRD — [`../../../20-module-prds/service-desk/MODULE_PRD.md`](../../../20-module-prds/service-desk/MODULE_PRD.md)
- Module Sprint Plan (Stage 1) — [`../MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md)
- Sprint Framework — [`../../../SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md), [`../../../SPRINT_ROADMAP.md`](../../../SPRINT_ROADMAP.md), [`../../../SPRINT_ESTIMATION_GUIDE.md`](../../../SPRINT_ESTIMATION_GUIDE.md), [`../../../SPRINT_DEPENDENCY_MATRIX.md`](../../../SPRINT_DEPENDENCY_MATRIX.md), [`../../../SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md)
- ERP Core Engines — [`../../../10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md)
- ADR Index — [`../../../11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../../02-architecture/event-catalog.md`](../../../02-architecture/event-catalog.md)
- Upstream Baselines — [`../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md)
- Module Implementation Workflow — [`../../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md)
