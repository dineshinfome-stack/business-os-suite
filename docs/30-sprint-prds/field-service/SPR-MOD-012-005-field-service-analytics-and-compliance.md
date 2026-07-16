---
title: "SPR-MOD-012-005 — Field Service Analytics & Compliance"
summary: "Sprint PRD for the Analytics & Compliance layer of MOD-012 Field Service: Field Service read model, operational reports (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), dashboards, exports, and audit readiness. Read-model only. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-012-005"
parent_module: "MOD-012"
parent_sprint_plan: "MOD-012_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "14.0.5"
size: "Small"
related_engines: ["ENG-002", "ENG-004", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "field-service", "mod-012", "analytics", "compliance", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD012-005-20260716T016000Z-001"
parent_result_id: "GT003-MOD012-004-20260716T015000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-012-005 — Field Service Analytics & Compliance

> **Stage 2 deliverable.** Fifth and final authored Sprint PRD for **MOD-012 Field Service** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-012-005` (permanent) |
| Parent Module | `MOD-012` — Field Service |
| Parent Sprint Plan | [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) |
| Iteration | Sprint 5 (final Stage 2 sprint) |
| Status | Draft |
| Estimated Size | Small |
| Upstream Sprints | [`SPR-MOD-012-001`](./SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md), [`SPR-MOD-012-002`](./SPR-MOD-012-002-dispatch-and-scheduling.md), [`SPR-MOD-012-003`](./SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md), [`SPR-MOD-012-004`](./SPR-MOD-012-004-sla-and-escalation.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen), [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen) |
| Downstream Sprints | None (final MOD-012 Stage 2 sprint) |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Field Service read model** and its analytics/compliance surface for BusinessOS Field Service: operational reports **Ticket Ageing**, **First-Time-Fix Rate**, **Technician Utilization**, and **SLA Adherence** (per Module PRD §9), dashboards for these reports via `ENG-022`, search via `ENG-020`, exports via `ENG-027`, integration surfaces via `ENG-023`, and an **audit-readiness surface** that exposes every Field Service event emitted during the sprint sequence `SPR-MOD-012-001` … `SPR-MOD-012-004`. This sprint is **read-model only**: it consumes upstream Field Service state and events but **MUST NOT** author new transactional behavior, new master data, or new lifecycle transitions.

> **Field Service Ownership Convention.** MOD-012 Field Service owns the **Field Service read model** and its operational reports, dashboards, exports, and audit-readiness surface. ERP Core Engines provide shared infrastructure (authorization, audit, search, reporting, dashboards, integration, eventing, notification, export) but **MUST NOT** redefine Field Service business rules or reports. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Item master and stock movements remain exclusive to **MOD-005 Inventory**. AMC contract, entitlement, coverage, and preventive-visit scheduling authority remain exclusive to **MOD-011 AMC**. Service-ticket master ownership remains with **MOD-016 Service Desk**. Ledger effects remain exclusive to **MOD-002 Accounting** via `ENG-015` and `ENG-016`. **Cross-module KPI definitions remain exclusive to MOD-017 Analytics**; MOD-012 surfaces operational Field Service reports listed in Module PRD §9 and does not redefine cross-module KPIs.

#### 1.1.1 Field Service Read Model & Report Authority

The **Field Service read model** and the operational reports enumerated in Module PRD §9 (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence) are authoritatively owned by MOD-012 Field Service. Their input state comes exclusively from Field-Service-owned transactions and lifecycles authored in `SPR-MOD-012-001` through `SPR-MOD-012-004` and from cross-module events consumed read-only per §1.1.3. No other module MAY redefine these reports.

#### 1.1.2 Field Service ↔ Analytics Boundary

**Cross-module KPI definitions** remain exclusive to **MOD-017 Analytics**. This sprint surfaces operational Field Service reports listed in Module PRD §9 only. Where a cross-module KPI is required at the tenant level, its definition is consumed read-only from MOD-017 Analytics; MOD-012 never authors a cross-module KPI.

#### 1.1.3 Field Service ↔ AMC, Service Desk, Inventory, Accounting, and Platform Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. This sprint consumes them read-only via `ENG-002`.
- **MOD-011 AMC** owns Contract, Entitlement, Coverage masters, and preventive-visit scheduling authority. This sprint consumes AMC references read-only for report context (e.g., SLA Adherence by contract entitlement); AMC-owned entities are not redefined.
- **MOD-016 Service Desk** owns the service-ticket master. This sprint consumes service-desk references read-only for closure reconciliation reporting; MOD-016-owned entities are not redefined.
- **MOD-005 Inventory** owns Item master and stock movements. This sprint consumes Item references read-only for reports touching Spare Consumption; MOD-005-owned entities are not redefined.
- **MOD-002 Accounting** owns financial postings via `ENG-015` and `ENG-016`. No Field Service sprint writes journal entries.
- **MOD-017 Analytics** owns cross-module KPI definitions. This sprint surfaces operational reports only; cross-module KPIs are not redefined.

Ownership boundaries SHALL NOT be redefined in any downstream context.

#### 1.1.4 Read-Model-Only Boundary

This sprint **MUST NOT**:

- author any new master data, transaction, lifecycle, or state machine;
- redefine any Field-Service-owned entity, event, or business rule from `SPR-MOD-012-001` … `SPR-MOD-012-004`;
- publish new domain events beyond those already registered by prior Field Service sprints in the authoritative event catalog;
- author cross-module KPI definitions.

Any deficit discovered in upstream Field Service state or events is a defect at its originating sprint, not new scope here.

#### 1.1.5 Audit-Readiness Surface

The **audit-readiness surface** exposes every Field Service event emitted during `SPR-MOD-012-001` … `SPR-MOD-012-004` (as registered in the authoritative event catalog) together with their audit records via `ENG-004`. It is a read-only surface; it neither replays events nor re-emits them.

### 1.2 In Scope

- **Field Service read model** — a read-only projection over Field-Service-owned transactions (Field Ticket, Visit, Spare Consumption, Closure Report) and SLA state (SLA Policy, SLA Clock, Breach Record, Escalation Transition Record) authored in `SPR-MOD-012-001` … `SPR-MOD-012-004`.
- **Operational reports** — **Ticket Ageing**, **First-Time-Fix Rate**, **Technician Utilization**, **SLA Adherence** as declared in Module PRD §9; rendered via `ENG-021`.
- **Dashboards** — dashboard surfaces for the four operational reports rendered via `ENG-022`.
- **Search** — search over the Field Service read model via `ENG-020`.
- **Integration surfaces** — read-only integration surfaces for the Field Service read model via `ENG-023`.
- **Exports** — dataset and report exports via `ENG-027`.
- **Notifications** — scheduled or event-driven report notifications (e.g., report readiness, threshold-based digests) via `ENG-025` under the tenant's configured channels.
- **Read-only consumption of upstream Field Service events** via `ENG-024`: `FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed` (as registered in the authoritative event catalog for prior Field Service sprints) to keep the read model current.
- **Audit-readiness surface** — a read-only surface that lists every Field Service event emitted during `SPR-MOD-012-001` … `SPR-MOD-012-004` with its `ENG-004` audit record and its tenant/company scope.
- **Authorization** on every report render, dashboard view, search query, integration read, and export request via `ENG-002`.
- **Audit** emission via `ENG-004` for every report render, export request, integration read, and audit-readiness-surface access, per Module PRD §11 (Audit readiness).

### 1.3 Out of Scope

- Foundation masters (Technician, Skill, Territory, Ticket Type) and Field Ticket capture/triage — `SPR-MOD-012-001`.
- Visit dispatch-phase lifecycle, dispatch-strategy resolution, scheduled/automated dispatch, and Dispatch-strategy/Territory-rule configuration — `SPR-MOD-012-002`.
- Visit on-site completion, Spare Consumption, Closure Report, signature/checklist capture, and mobile-app settings — `SPR-MOD-012-003`.
- SLA Policy master, SLA clock tracking, escalation workflows, scheduled SLA checks, automated escalations, and breach notifications — `SPR-MOD-012-004`.
- Contract, Entitlement, Coverage masters and AMC entitlement mechanics — owned by MOD-011 AMC.
- Service-ticket master and `ServiceTicketClosed` publication — owned by MOD-016 Service Desk.
- Item master and stock movements — owned by MOD-005 Inventory.
- Financial postings for billable field work — owned by MOD-002 Accounting via `ENG-015` and `ENG-016`.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-012-005`, the following will exist:

- **Business capabilities.**
  - A Service Manager can render **Ticket Ageing**, **First-Time-Fix Rate**, **Technician Utilization**, and **SLA Adherence** reports via `ENG-021` from the Field Service read model.
  - A Service Manager and Dispatcher can view Field Service dashboards for the four operational reports via `ENG-022`.
  - A Service Manager can search the Field Service read model via `ENG-020`.
  - An authorized integrator can consume the Field Service read model via read-only integration surfaces exposed through `ENG-023`.
  - A Service Manager can export report datasets via `ENG-027`.
  - Report notifications (readiness or threshold-based digests) are dispatched via `ENG-025` under the tenant's configured channels where configured.
  - An auditor can access the audit-readiness surface listing every Field Service event emitted during `SPR-MOD-012-001` … `SPR-MOD-012-004` together with its `ENG-004` audit record.
- **Configuration artifacts.** *N/A at PRD authoring time.* No new Field-Service-owned configuration namespace is registered by this sprint beyond dashboard/report-registration surfaces provided by `ENG-021`/`ENG-022`.
- **Audit artifacts.** An audit record exists for every report render, export request, integration read, dashboard view (where declared by policy), and audit-readiness-surface access, produced via `ENG-004`.
- **Notification artifacts.** Report-readiness or threshold-based notifications emitted via `ENG-025` under the tenant's configured channels where configured.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-012-005`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-012 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — all analytics-facing capabilities as read model | Field Service read model, dashboards, exports, audit-readiness surface |
| §3 Personas — Service Manager, Dispatcher, Field Technician | User stories (§4) |
| §9 Reports & Analytics — Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence | Operational reports rendered via `ENG-021`; dashboards via `ENG-022` |
| §11 Non-functional — Audit readiness | Audit-readiness surface (§1.1.5) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Field Service Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) §4.1/§4.2 allocates the Field Service Analytics read-model surface to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Field Service Analytics (read-model surface over §2 capabilities) | `SPR-MOD-012-005` |

Each Module PRD §2 business capability is allocated to exactly one originating transactional sprint (`SPR-MOD-012-001` … `SPR-MOD-012-004`); no other sprint claims the Field Service Analytics read-model surface as its originating capability.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §9 reports (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence) and §11 Audit readiness → this Sprint PRD → deliverables in §2 (Field Service read model, operational reports, dashboards, search, integration surfaces, exports, audit-readiness surface).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Service Manager, I want to render the Ticket Ageing report per company so that I can see open Field Tickets by age buckets and act on the oldest cases.*
- **US-002.** *As a Service Manager, I want to render the First-Time-Fix Rate report so that I can measure the proportion of visits that close a Field Ticket on first attempt without a follow-up visit.*
- **US-003.** *As a Service Manager, I want to render the Technician Utilization report so that I can see technician time allocation across dispatched/on-site/completed visits.*
- **US-004.** *As a Service Manager, I want to render the SLA Adherence report so that I can see SLA outcomes (met, breached, escalated) by ticket type, territory, and contract entitlement.*
- **US-005.** *As a Service Manager and Dispatcher, I want dashboards over the four operational reports so that I can monitor Field Service performance without running each report manually.*
- **US-006.** *As a Service Manager, I want to search the Field Service read model so that I can locate Field Tickets, Visits, Spare Consumption, and Closure Reports by common attributes.*
- **US-007.** *As an integrator, I want authorized read-only access to the Field Service read model so that downstream systems can consume operational state without direct database access.*
- **US-008.** *As a Service Manager, I want to export report datasets so that I can share Field Service performance data outside the system through tenant-approved channels.*
- **US-009.** *As a Service Manager, I want report-readiness or threshold-based notifications so that I am alerted when a scheduled report is ready or a threshold is crossed.*
- **US-010.** *As an auditor, I want a read-only audit-readiness surface listing every Field Service event emitted during Sprints 001–004 together with its audit record so that Field Service history is reconstructible from an authoritative log.*
- **US-011.** *As a security reviewer, I want authorization enforced on every report render, dashboard view, search query, integration read, and export request so that only permitted actors can access Field Service data.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Ticket Ageing report (US-001)

- **Given** Field Tickets authored by `SPR-MOD-012-001` under a (tenant, company),
  **when** an authorized Service Manager renders the Ticket Ageing report via `ENG-021`,
  **then** open Field Tickets are grouped into deterministic age buckets from `FieldTicketCreated` (or its authoritative equivalent) onward; render is audited via `ENG-004`.

### 5.2 First-Time-Fix Rate report (US-002)

- **Given** completed Visits (`FieldVisitCompleted` or authoritative equivalent) authored by `SPR-MOD-012-003`,
  **when** the First-Time-Fix Rate report renders via `ENG-021`,
  **then** the rate is computed deterministically as the share of Field Tickets closed on first Visit completion without a follow-up Visit; render is audited via `ENG-004`.

### 5.3 Technician Utilization report (US-003)

- **Given** Visits authored by `SPR-MOD-012-002` and `SPR-MOD-012-003` with dispatch and completion lifecycle events,
  **when** the Technician Utilization report renders via `ENG-021`,
  **then** utilization is computed deterministically over the requested period; render is audited via `ENG-004`.

### 5.4 SLA Adherence report (US-004)

- **Given** SLA Clocks, Breach Records, and Escalation Transition Records authored by `SPR-MOD-012-004`,
  **when** the SLA Adherence report renders via `ENG-021`,
  **then** outcomes are aggregated deterministically by (ticket type, territory, contract entitlement); render is audited via `ENG-004`.

### 5.5 Dashboards (US-005)

- **Given** the four reports of §5.1–§5.4,
  **when** an authorized Service Manager or Dispatcher opens the Field Service dashboards,
  **then** the dashboards render via `ENG-022` from the same read-model projection as the underlying reports; access is audited via `ENG-004` where declared by policy.

### 5.6 Read-model search (US-006)

- **Given** the Field Service read model,
  **when** an authorized user searches via `ENG-020`,
  **then** search results are scoped to the caller's (tenant, company) per `ADR-011`; every search is audited via `ENG-004` where declared by policy.

### 5.7 Integration surface (US-007)

- **Given** an authorized integrator credential,
  **when** it reads the Field Service read model via `ENG-023`,
  **then** access is read-only, scoped to the caller's tenant, enforced via `ENG-002` under `ADR-032`, and audited via `ENG-004`; no write operation is exposed.

### 5.8 Exports (US-008)

- **Given** an authorized Service Manager,
  **when** an export is requested via `ENG-027`,
  **then** the export runs against the read-model projection, is scoped to the caller's (tenant, company), and is audited via `ENG-004`; no cross-tenant data appears in the export.

### 5.9 Report notifications (US-009)

- **Given** a configured report-readiness or threshold-based notification,
  **when** the notification condition is satisfied,
  **then** the notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.10 Audit-readiness surface (US-010)

- **Given** Field Service events emitted during `SPR-MOD-012-001` … `SPR-MOD-012-004` (as registered in the authoritative event catalog),
  **when** an authorized auditor queries the audit-readiness surface,
  **then** each event is listed together with its `ENG-004` audit record and its (tenant, company) scope; the surface is read-only and does not re-emit events.

### 5.11 Authorization (US-011)

- **Given** any report render, dashboard view, search query, integration read, or export request,
  **when** it executes,
  **then** it is subject to `ENG-002` Authorization under `ADR-032` RBAC + ABAC; unauthorized requests are rejected deterministically.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any read against the Field Service read model (report, dashboard, search, integration, export, audit-readiness surface),
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read can succeed.

### 5.13 Read-model-only invariants

- **Given** any operation exposed by this sprint,
  **when** it executes,
  **then** it MUST NOT create, update, or delete any Field-Service-owned master data, transaction, lifecycle state, SLA state, or domain event; write attempts against the read-model surface are rejected deterministically.
- **Given** any cross-module reference required by a report or dashboard,
  **when** it resolves,
  **then** the referenced entity is consumed read-only from its owning module (MOD-001, MOD-005, MOD-011, MOD-016, MOD-017); no owning-module entity is redefined here.

### 5.14 Event consumption idempotency

- **Given** upstream Field Service events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed`) received via `ENG-024`,
  **when** consumed by the read-model projector,
  **then** each event drives at most one deterministic projection update; duplicate delivery is idempotent.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-012` — Field Service.
- **Module PRD:** [`docs/20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (analytics-facing capabilities as read model), §3 (Service Manager, Dispatcher, Field Technician), §9 (Reports & Analytics — Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), §11 (Audit readiness), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-012` MODULE_PRD.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-012-001`, `SPR-MOD-012-002`, `SPR-MOD-012-003`, `SPR-MOD-012-004`.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — Item master consumed read-only in reports touching Spare Consumption.
  - [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen) — Contract Entitlement consumed read-only in SLA Adherence context.
- **Cross-module consumption (events only):** Upstream Field Service events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed`) consumed via `ENG-024` to keep the read model current.
- **Downstream sprints:** None. `SPR-MOD-012-005` is the final Stage 2 sprint for MOD-012.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Field Service Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and of the Sprint Plan §2 engines declared for `SPR-MOD-012-005`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every report render, dashboard view, search query, integration read, and export request under `ADR-032` RBAC + ABAC. |
| `ENG-004` Audit | Records every report render, export request, integration read, dashboard view (where declared by policy), and audit-readiness-surface access. |
| `ENG-020` Search | Backs read-model search over Field Service transactions and SLA state. |
| `ENG-021` Reporting | Renders the four operational reports declared in Module PRD §9. |
| `ENG-022` Dashboard | Renders dashboards over the four operational reports. |
| `ENG-023` Integration | Exposes read-only integration surfaces over the Field Service read model. |
| `ENG-024` Eventing | Consumes upstream Field Service events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed`) to keep the read model current. |
| `ENG-025` Notification | Emits report-readiness or threshold-based notifications under the tenant's configured channels. |
| `ENG-027` Export | Executes dataset and report exports scoped to the caller's (tenant, company). |

Field Service business semantics (Field Service read model, operational report definitions in Module PRD §9, audit-readiness surface) are owned by this module and are not delegated to any engine. Cross-module KPI definitions remain exclusive to MOD-017 Analytics and are not authored here.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §19.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every read (report, dashboard, search, integration, export, audit-readiness surface). |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every read exposed by this sprint. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Field Service Read Model | MOD-012 (this sprint) | Read-only projection over Field-Service-owned transactions (Field Ticket, Visit, Spare Consumption, Closure Report) and SLA state (SLA Policy, SLA Clock, Breach Record, Escalation Transition Record). |
| Field Service Report Definition | MOD-012 (this sprint) | Operational-report definitions for Ticket Ageing, First-Time-Fix Rate, Technician Utilization, and SLA Adherence, rendered via `ENG-021`. |
| Field Service Dashboard Definition | MOD-012 (this sprint) | Dashboard compositions over the four operational reports, rendered via `ENG-022`. |
| Audit-Readiness Surface | MOD-012 (this sprint) | Read-only listing of every Field Service event emitted during `SPR-MOD-012-001` … `SPR-MOD-012-004` with its `ENG-004` audit record and (tenant, company) scope. |

### 10.2 Relationships

- The **Field Service Read Model** references only Field-Service-owned transactions/SLA state authored in `SPR-MOD-012-001` … `SPR-MOD-012-004`, and read-only references to MOD-001-owned Identity, MOD-005-owned Item, MOD-011-owned Contract Entitlement, and MOD-016-owned service-ticket references where surfaced by a report.
- **Field Service Report Definitions** and **Dashboard Definitions** are scoped per tenant/company and reference only the Field Service Read Model.
- The **Audit-Readiness Surface** references only Field Service events registered in the authoritative event catalog and their `ENG-004` audit records; it does not reference other modules' events.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-012` per the Field Service Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Cross-module KPI definitions are owned by MOD-017 Analytics and are not authored here.
- Upstream master data (Identity, Item, Contract Entitlement, service-ticket) is consumed read-only from its owning module.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- Per Sprint Plan §2 (`SPR-MOD-012-005`) and the Read-Model-Only Boundary (§1.1.4), this sprint does not publish any new domain event. All Field Service domain events remain those originated by `SPR-MOD-012-001` … `SPR-MOD-012-004`.

### 11.2 Consumed

- **`FieldTicketCreated`** (from `SPR-MOD-012-001`) — consumed via `ENG-024` to project Field Ticket state into the read model.
- **`VisitAssigned`** (from `SPR-MOD-012-002`) — consumed via `ENG-024` to project Visit dispatch state into the read model.
- **`FieldVisitCompleted`** (from `SPR-MOD-012-003`) — consumed via `ENG-024` to project Visit completion into the read model (feeds First-Time-Fix Rate and Technician Utilization).
- **`SpareConsumed`** (from `SPR-MOD-012-003`) — consumed via `ENG-024` to project spare-consumption context into the read model.

Payload contracts for Field Service events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every read (report, dashboard, search, integration, export, audit-readiness surface).
- [ ] Every report render, export request, integration read, dashboard view (where declared by policy), and audit-readiness-surface access produces an audit record via `ENG-004`.
- [ ] The four operational reports (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence) render deterministically via `ENG-021` from the Field Service read model.
- [ ] Field Service dashboards render via `ENG-022` from the same read-model projection.
- [ ] Read-model search runs via `ENG-020` scoped to caller (tenant, company).
- [ ] Read-only integration surfaces expose the read model via `ENG-023`; no write is exposed.
- [ ] Exports run via `ENG-027` scoped to caller (tenant, company).
- [ ] Upstream Field Service events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed`) are consumed via `ENG-024` idempotently.
- [ ] The audit-readiness surface exposes every Field Service event emitted during `SPR-MOD-012-001` … `SPR-MOD-012-004` together with its `ENG-004` audit record.
- [ ] Authorization is enforced on every read exposed by this sprint via `ENG-002`.
- [ ] Read-model-only invariants (§5.13) are enforced: no write against Field-Service-owned state is exposed.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-012_SPRINT_PLAN.md` §2 (`SPR-MOD-012-005`):

- Reports and dashboards render from data produced by prior sprints and consumed cross-module events.
- Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
- Audit-readiness surface exposes every Field Service event emitted during the sprint sequence.

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
  - **Description:** MOD-012 depends on `MOD005_INVENTORY_BASELINE_v1` and `MOD011_AMC_BASELINE_v1` being frozen and stable for Item and Contract Entitlement references surfaced by reports.
  - **Impact:** Drift in Item or Entitlement references would break reports that surface those fields.
  - **Mitigation:** Consume references per baseline contracts; escalate any change as an owning-module defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** This sprint depends on `SPR-MOD-012-001` … `SPR-MOD-012-004` being complete; the read model requires transactional and SLA state authored there.
  - **Impact:** Regressions in prior Field Service sprints would break the read model, reports, dashboards, and the audit-readiness surface.
  - **Mitigation:** Consume upstream contracts; treat regressions as defects at their originating sprint.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Non-determinism in report aggregation (unstable buckets, ambiguous "first-time-fix" definition, non-deterministic utilization periods) would violate testability of §5.1–§5.4.
  - **Impact:** Non-deterministic reports would break audit reconstruction and trust in Field Service analytics.
  - **Mitigation:** Freeze deterministic aggregation definitions as part of the registered Field Service Report Definitions; enforce structural validation at registration time.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Scope-creep from cross-module KPI definitions (owned by MOD-017 Analytics) back into this sprint would violate the Field Service ↔ Analytics boundary (§1.1.2).
  - **Impact:** Silent absorption of MOD-017-owned KPIs would fragment master ownership.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to MOD-017 Analytics.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Field-Service-owned entities (Field Service Read Model, Field Service Report Definitions, Field Service Dashboard Definitions, Audit-Readiness Surface) MUST NOT be redefined by downstream modules; cross-module KPI definitions MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Field Service Read Model & Report Authority (§1.1.1), the Field Service ↔ Analytics boundary (§1.1.2), and the Read-Model-Only Boundary (§1.1.4).
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 5 consumes `FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, and `SpareConsumed`. Any event name not yet present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint enters `In Progress`, consumers cannot subscribe and the read model cannot stay current.
  - **Mitigation:** Confirm event catalog registration of consumed events before this sprint enters `In Progress`.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — report-aggregation determinism (age buckets, first-time-fix definition, utilization windows, SLA outcome aggregation); read-model projector idempotency; audit-readiness-surface listing correctness.
- **Integration** — audit emission via `ENG-004`, authorization via `ENG-002`, search via `ENG-020`, reporting via `ENG-021`, dashboards via `ENG-022`, integration surfaces via `ENG-023`, event consumption via `ENG-024`, notification emission via `ENG-025`, exports via `ENG-027`.
- **Contract** — `FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, and `SpareConsumed` consumption contracts per the authoritative event catalog.
- **End-to-end (smoke)** — Analytics: upstream event ingestion → read-model projection → each of the four reports rendered → dashboards → export → audit-readiness-surface listing; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture; deterministic Field Service Report Definitions; a deterministic Field Service Dashboard Definition set.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the read-model projector as an idempotent consumer keyed by (tenant, company, upstream_event_id) so replays do not double-project.
- Consider expressing each of the four report aggregations as a pure, deterministic function over the read-model snapshot so §5.1–§5.4 tests are trivially reproducible.
- Consider registering Field Service Report Definitions and Dashboard Definitions declaratively so `ENG-021`/`ENG-022` render them without bespoke code.
- Consider scoping export batches by (tenant, company) so a slow tenant cannot starve others.
- Consider modeling the audit-readiness surface as a join over the authoritative event catalog and `ENG-004` records so no separate storage is required.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-012-005`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Field Service read model and its analytics/compliance surface — operational reports (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), dashboards, search, integration surfaces, exports, and audit-readiness surface (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-012 MODULE_PRD section (§2, §3, §9, §11, §12, §13). No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Field Service Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates every foundation/dispatch/mobile-execution/SLA item and every cross-module ownership (MOD-001, MOD-002, MOD-005, MOD-011, MOD-016, MOD-017) — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Is this the final Stage 2 sprint for MOD-012?**
   Yes. `SPR-MOD-012-005` is the fifth and final sprint per [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) §2; on completion, MOD-012 Stage 2 concludes and the module becomes eligible for Stage 3 Baseline Consolidation (GT-004) per the released GT-003 lifecycle.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md`](./SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md), [`./SPR-MOD-012-002-dispatch-and-scheduling.md`](./SPR-MOD-012-002-dispatch-and-scheduling.md), [`./SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md`](./SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md), [`./SPR-MOD-012-004-sla-and-escalation.md`](./SPR-MOD-012-004-sla-and-escalation.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md), [`../../40-module-baselines/MOD011_AMC_BASELINE_v1.md`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
