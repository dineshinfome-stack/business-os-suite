---
title: "SPR-MOD-016-001 — Service Desk Foundation (Categories, SLA Policies, Business Hours & Routing)"
summary: "Sprint PRD for the foundational Service Desk layer of MOD-016: Ticket Category and SLA Policy master data; routing rules; escalation matrices; business hours per region; numbering series for Service Desk documents. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-016-001"
parent_module: "MOD-016"
parent_sprint_plan: "MOD-016_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "18.0.1"
size: "Small"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-012", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "service-desk", "mod-016", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD016-001-20260717T070000Z-001"
parent_result_id: "GT002-MOD016-20260717T060000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-016-001 — Service Desk Foundation (Categories, SLA Policies, Business Hours & Routing)

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-016 Service Desk** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-016-001` (permanent) |
| Parent Module | `MOD-016` — Service Desk |
| Parent Sprint Plan | [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Small |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD006_CRM_BASELINE_v1`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-016-002` … `SPR-MOD-016-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Service Desk Foundation** for BusinessOS: the Ticket Category and SLA Policy master data; the routing rules and escalation matrices; the business hours per region resolved through `ENG-005`; and the numbering series for Service Desk documents registered through `ENG-005` for allocation via `ENG-017` at document issuance. This foundation is the substrate on which every subsequent Service Desk sprint — Ticket Capture & Lifecycle, SLA Enforcement & Escalations, Knowledge Base/Macros/CSAT, and Service Analytics & Compliance — depends.

> **Service Desk Ownership Convention.** The Service Desk module owns the business semantics of the Ticket Category and SLA Policy masters, the routing rules and escalation matrices, the business hours per region, and the numbering series for Service Desk documents. ERP Core Engines provide shared infrastructure (identity, authorization, permissions, audit, configuration, localization, rules, numbering, eventing, notification) but **MUST NOT** redefine Service Desk business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Customer master data remains exclusive to **MOD-006 CRM** and is consumed read-only. Field visit handoff to **MOD-012 Field Service** occurs strictly through published events in later sprints. Cross-module KPI definitions remain exclusive to **MOD-017 Analytics**. Ledger effects (if any) remain exclusive to **MOD-002 Accounting** via `ENG-015` / `ENG-016`.

#### 1.1.1 Ticket Category and SLA Policy Master Authority

The **Ticket Category** and **SLA Policy** masters are authoritatively owned by MOD-016 Service Desk. No other module MAY create, edit, archive, or independently maintain a parallel Ticket Category or SLA Policy master. Downstream sprints and modules consume these masters through Service-Desk-owned read APIs authored in this and later sprints; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 Service Desk Foundation Configuration Authority

**Service Desk operations configuration** — **routing rules**, **escalation matrices**, and **business hours per region** — plus **numbering series for Service Desk documents** is authoritatively owned by MOD-016 Service Desk, in this sprint. These keys are registered under a tenant/company through this sprint and resolve deterministically via `ENG-005` in the tenant → company → context hierarchy. Downstream sprints (Ticket Capture & Lifecycle, SLA Enforcement & Escalations, Knowledge Base/Macros/CSAT, Service Analytics & Compliance) consume this configuration read-only.

#### 1.1.3 Service Desk ↔ Platform, CRM, Field Service, Accounting, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Service Desk consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **MOD-006 CRM** owns Customer master data. Service Desk consumes it read-only through CRM APIs in downstream sprints; no Customer master is authored here.
- **MOD-012 Field Service** consumes `FieldVisitCompleted` and related field-service handoffs strictly through events emitted in later Service Desk sprints; no field-service transaction is redefined by MOD-016.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. MOD-016 declares no direct posting responsibilities.
- **MOD-017 Analytics** owns cross-module KPI definitions. Operational Service Desk reports are surfaced by `SPR-MOD-016-005`; cross-module KPIs are never redefined by MOD-016.

Ownership boundaries SHALL NOT be redefined in downstream Service Desk Sprint PRDs.

#### 1.1.4 Foundation Master Lifecycle Boundary

Service Desk owns the lifecycle of every foundation master (Ticket Category, SLA Policy) and the Service Desk operations configuration lifecycle (routing rules, escalation matrices, business hours per region, numbering series). Downstream sprints (Ticket Capture & Lifecycle; SLA Enforcement & Escalations; Knowledge Base/Macros/CSAT; Service Analytics & Compliance) consume these entities and states without redefining their lifecycles.

### 1.2 In Scope

- Ticket Category master: create, edit, activate, deactivate, archive under a tenant/company; per-Category attributes (name, parent category where hierarchical, operating-locale hint consumed via `ENG-006` where applicable).
- SLA Policy master: create, edit, activate, deactivate, archive under a tenant/company; per-Policy attributes (name, response and resolution targets, business-hours reference, escalation-matrix reference); the enforcement clocks themselves are out of scope here and belong to `SPR-MOD-016-003`.
- Routing rules configuration namespace initialized per company via `ENG-005`; rule references to Ticket Categories and business hours resolved deterministically via `ENG-012` at rule-registration time.
- Escalation matrix configuration namespace initialized per company via `ENG-005`; matrices reference SLA Policies and business-hours regions.
- Business hours per region: configuration namespace initialized per company via `ENG-005` covering working days, working hours, and public-holiday sets; each region is uniquely identified under a tenant/company.
- Numbering series for Service Desk documents (Service Ticket, SLA Breach Event, CSAT Response) registered per company via `ENG-005`; document numbers issue through `ENG-017` at document issuance in the originating downstream sprint.
- Read-only consumption of Platform Identity (`ENG-001`) for the actor identity used in foundation lifecycle actions.
- Authorization on Service-Desk-foundation actions via `ENG-002`; permission registration for Service-Desk-foundation permissions via `ENG-003`.
- Audit emission via `ENG-004` for every foundation lifecycle transition and every configuration registration.
- Locale-scoped labels on foundation entities via `ENG-006` where applicable.
- Structural validation (required fields, referential integrity, uniqueness, same-company references, valid SLA target definitions, valid routing-rule references, valid escalation-matrix references, valid business-hours regions) via `ENG-012` at capture time.
- Domain event `ServiceDeskFoundationConfigured` published via `ENG-024` when the Service Desk configuration namespace is initialized or materially updated for a company, so downstream sprints and modules can react without polling Service Desk state. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.
- Notification emission via `ENG-025` on foundation lifecycle transitions where the tenant has configured a channel (e.g., SLA Policy activation).

### 1.3 Out of Scope

- Multi-channel ticket capture (Email, Chat, WhatsApp, Voice); Service Ticket transaction lifecycle; categorization/routing execution against tickets; close-with-open-child-task rule enforcement; consumption of `FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon`; publication of `ServiceTicketCreated` and `ServiceTicketClosed` — `SPR-MOD-016-002`.
- SLA clock evaluation; pause-on-customer-waiting rule; SLA Breach Event transaction lifecycle; escalation execution; `SLABreached` publication — `SPR-MOD-016-003`.
- Knowledge Article master and review-before-publish rule; macros; CSAT Response transaction; CSAT surveys; `KnowledgeArticlePublished` publication — `SPR-MOD-016-004`.
- Operational reports (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity); dashboards; bulk exports; consumption of MOD-017 KPI definitions; audit-readiness surface; module read model — `SPR-MOD-016-005`.
- Customer master authoring — owned by MOD-006 CRM.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Financial postings (if any) — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-016-001`, the following will exist:

- **Business capabilities.**
  - A Support Manager can create, edit, activate, deactivate, and archive Ticket Category and SLA Policy records under a tenant/company.
  - A Support Manager can register routing rules, escalation matrices, and business hours per region for a company; each resolves deterministically via `ENG-005`.
  - Numbering series for Service Desk documents (Service Ticket, SLA Breach Event, CSAT Response) are registered per company; document numbers issue deterministically via `ENG-017` at document issuance in downstream sprints.
  - Identity linkage for actor actions is consumed read-only from `ENG-001` — no credentials are minted.
- **Domain events.**
  - `ServiceDeskFoundationConfigured` is published via `ENG-024` when the Service Desk configuration namespace is initialized or materially updated for a company. Payload contract is governed by the authoritative event catalog and not redefined here.
- **Configuration artifacts.** Service Desk configuration namespace initialized for each company via `ENG-005` (routing rules, escalation matrices, business hours per region, numbering series). No module-specific keys are registered outside Service Desk's own ownership boundary.
- **Audit artifacts.** An audit record exists for every Service-Desk-foundation lifecycle transition and every configuration registration, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Foundation lifecycle transitions produce notifications via `ENG-025` under the tenant's configured channels where enabled.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-016-001`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-016 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — ticketing primitives and personas | Ticket Category / SLA Policy masters and Service Desk Ownership Convention |
| §2 Business Scope — foundation surface for submodules Tickets, SLAs, Knowledge Base, Escalations, CSAT (configuration surface for "Categorization and routing" and "SLA and escalation policies") | Ticket Category / SLA Policy masters, routing/escalation/business-hours configuration namespace |
| §3 Personas — Support Agent, Support Manager; Field Service, CRM; Customer, Employee | User stories (§4) |
| §5 Master Data — Ticket Category, SLA Policy | Both masters delivered in this sprint |
| §7 Business Rules — foundation invariants (tenancy, referential integrity, same-company composition, valid configuration entries) | Enforceable rules via `ENG-012` |
| §10 Configuration — SLA policies (master); Routing rules; Escalation matrices; Business hours per region | Service Desk configuration namespace via `ENG-005`; numbering series registered here for consumption via `ENG-017` in downstream sprints |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Service Desk Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md) §4.1 allocates the following §2 capabilities as originating to `SPR-MOD-016-001` (configuration surface):

| Module PRD §2 Capability | Origin Sprint |
| --- | --- |
| Categorization and routing | `SPR-MOD-016-001` |
| SLA and escalation policies | `SPR-MOD-016-001` |

Per Sprint Plan §4.3, the master-data entities **Ticket Category** and **SLA Policy** are each originating-allocated to `SPR-MOD-016-001`:

| Master Data (Module PRD §5) | Origin Sprint |
| --- | --- |
| Ticket Category | `SPR-MOD-016-001` |
| SLA Policy | `SPR-MOD-016-001` |

These allocations are unique; no other Service Desk sprint claims these capabilities or masters as its origin. No §2 capability is originating-allocated in more than one sprint.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §5 master-data entities *Ticket Category* and *SLA Policy*, Module PRD §10 configuration entries *SLA policies*, *Routing rules*, *Escalation matrices*, *Business hours per region*, and the numbering-series surface for §6 transactions → this Sprint PRD → deliverables in §2 (Ticket Category, SLA Policy masters, routing/escalation/business-hours configuration namespace, numbering-series registration, `ServiceDeskFoundationConfigured` publication, notifications on foundation lifecycle transitions, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Support Manager, I want to create, edit, activate, deactivate, and archive Ticket Categories under a company (including name, optional parent category, and operating-locale hint), so that a coherent Category register exists before any ticket capture, routing, SLA enforcement, or reporting operation.*
- **US-002.** *As a Support Manager, I want to create, edit, activate, deactivate, and archive SLA Policies under a company (including response and resolution targets, business-hours reference, and escalation-matrix reference), so that SLA enforcement in later sprints references an authoritative policy catalog.*
- **US-003.** *As a Support Manager, I want to register routing rules per company (referencing Ticket Categories and business hours), so that ticket routing execution in later sprints runs deterministically against authoritative configuration.*
- **US-004.** *As a Support Manager, I want to register escalation matrices per company (referencing SLA Policies and business-hours regions), so that escalation execution in later sprints resolves deterministically.*
- **US-005.** *As a Support Manager, I want to register business hours per region (working days, working hours, public-holiday sets) per company, so that SLA clocks and routing decisions in later sprints have an authoritative time model.*
- **US-006.** *As a Support Manager, I want numbering series for Service Desk documents (Service Ticket, SLA Breach Event, CSAT Response) to be registered per company, so that document numbers in later sprints issue deterministically at document issuance via `ENG-017`.*
- **US-007.** *As a Support Manager, I want the actor identity used for foundation lifecycle actions to be consumed read-only from `ENG-001`, so that identity, authentication, and permissions remain owned by MOD-001 while Service Desk captures the master relationships.*
- **US-008.** *As a downstream subscriber (Ticket Capture & Lifecycle; SLA Enforcement & Escalations; Knowledge Base/Macros/CSAT; Service Analytics & Compliance; and cross-module consumers), I want `ServiceDeskFoundationConfigured` to be published when the Service Desk configuration namespace is initialized or materially updated for a company, so that downstream sprints and modules can react without polling Service Desk state.*
- **US-009.** *As a Support Manager, I want notifications on Service-Desk-foundation lifecycle transitions under the tenant's configured channels, so that Category / SLA Policy / configuration onboarding is actionable.*
- **US-010.** *As a security reviewer, I want every Service-Desk-foundation lifecycle transition and every configuration registration to be audited via `ENG-004`, so that I can reconstruct Category, SLA Policy, routing, escalation, business-hours, and numbering-series history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Ticket Category master (US-001)

- **Given** a valid Ticket Category creation request under a tenant/company,
  **when** a Support Manager submits it,
  **then** the Category is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to assign a parent Category in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically via `ENG-012`.

### 5.2 SLA Policy master (US-002)

- **Given** a valid SLA Policy creation request under a tenant/company (including response and resolution targets, business-hours reference, and escalation-matrix reference),
  **when** a Support Manager submits it,
  **then** the Policy is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to reference a business-hours region or escalation matrix from a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically via `ENG-012`.

### 5.3 Routing rules configuration (US-003)

- **Given** a company under an active tenant,
  **when** routing rules referencing Ticket Categories and business hours are registered,
  **then** each rule resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline, with references validated via `ENG-012` at registration time.
- **Given** a routing rule referencing an inactive or foreign-company Category or business-hours region,
  **when** registration is attempted,
  **then** the request is rejected deterministically via `ENG-012`.

### 5.4 Escalation matrices configuration (US-004)

- **Given** a company under an active tenant,
  **when** an escalation matrix referencing SLA Policies and business-hours regions is registered,
  **then** it resolves deterministically for that company through `ENG-005`, with references validated via `ENG-012` at registration time.

### 5.5 Business hours per region (US-005)

- **Given** a company under an active tenant,
  **when** business hours for a region (working days, working hours, public-holiday sets) are registered,
  **then** the region is uniquely identified within the company and resolves deterministically through `ENG-005`; overlapping or contradictory definitions are rejected via `ENG-012`.

### 5.6 Numbering series registration (US-006)

- **Given** a company under an active tenant,
  **when** numbering series for Service Desk documents (Service Ticket, SLA Breach Event, CSAT Response) are registered,
  **then** each series is persisted and resolvable via `ENG-005`; document-number allocation itself executes through `ENG-017` at issuance time in the originating downstream sprint; allocated numbers are immutable thereafter.

### 5.7 Identity consumption (US-007)

- **Given** any Service-Desk-foundation lifecycle action,
  **when** it executes,
  **then** the actor identity is resolved read-only via `ENG-001`; no credentials are minted by Service Desk.

### 5.8 `ServiceDeskFoundationConfigured` publication (US-008)

- **Given** a Service Desk configuration namespace initialized or materially updated for a company (Category / SLA Policy / routing / escalation / business-hours / numbering-series),
  **when** the transaction commits,
  **then** `ServiceDeskFoundationConfigured` is published via `ENG-024` exactly once per (tenant, company, configuration revision), using the authoritative envelope and payload contract governed by the event catalog.

### 5.9 Notifications (US-009)

- **Given** a Service-Desk-foundation lifecycle transition where the tenant has configured a channel,
  **when** the transition commits,
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.10 Audit integration (US-010)

- **Given** any Service-Desk-foundation lifecycle transition (Ticket Category / SLA Policy create, update, activate, deactivate, archive; routing-rule / escalation-matrix / business-hours-region / numbering-series registration or update),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.11 Isolation invariants (`ADR-011`)

- **Given** any Service-Desk-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.12 Authorization invariants (`ADR-032`)

- **Given** any Service-Desk-foundation action,
  **when** it executes,
  **then** it is authorized via `ENG-002` against permissions registered by `ENG-003` under the RBAC + ABAC model; unauthorized actions are rejected before any state change.

### 5.13 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Ticket Category, SLA Policy, routing, escalation, business-hours, or numbering-series data,
  **when** it reads these masters/registrations,
  **then** it does so exclusively through Service-Desk-owned events (`ServiceDeskFoundationConfigured` here; additional events in later sprints) and Service-Desk read APIs. No downstream module creates an independent Ticket Category, SLA Policy, routing, escalation, business-hours, or numbering-series master.
- **Given** any Service Desk code path that requires Identity data,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.
- **Given** any Service Desk code path that requires Customer data (in later sprints),
  **when** it needs Customer master data,
  **then** it consumes it read-only through MOD-006 CRM APIs; the Customer master is not redefined here.
- **Given** any Service Desk transaction (in later sprints) that has ledger effects,
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through the corresponding Service-Desk-published events; no Service Desk code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-016` — Service Desk.
- **Module PRD:** [`docs/20-module-prds/service-desk/MODULE_PRD.md`](../../../20-module-prds/service-desk/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (foundation and configuration surface for Categorization and routing; SLA and escalation policies), §3 (Support Agent, Support Manager; Field Service, CRM; Customer, Employee), §5 (Ticket Category, SLA Policy), §7 (foundation invariants), §10 (SLA policies, Routing rules, Escalation matrices, Business hours per region; numbering series), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-016` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD006_CRM_BASELINE_v1`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) — Customer master (consumed indirectly by later Service Desk sprints via read-only APIs; not invoked from this sprint).
- **Upstream sprint dependencies (per Sprint Plan §2):** None (Service Desk sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` and `MOD006_CRM_BASELINE_v1`.
- **Downstream sprints:** `SPR-MOD-016-002` (Ticket Capture & Lifecycle), `SPR-MOD-016-003` (SLA Enforcement & Escalations), `SPR-MOD-016-004` (Knowledge Base, Macros & CSAT), `SPR-MOD-016-005` (Service Analytics & Compliance) — per [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md).

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
| `ENG-001` Identity | Provides the Support Agent / Support Manager identity used for foundation lifecycle actions and read-only binding to Platform users. |
| `ENG-002` Authorization | Enforces authorization on Service-Desk-foundation actions. |
| `ENG-003` Permission Management | Registers Service-Desk-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every Service-Desk-foundation lifecycle transition and every configuration registration. |
| `ENG-005` Configuration | Resolves Service Desk operations configuration (routing rules, escalation matrices, business hours per region) and numbering-series registration under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for Ticket Category, SLA Policy, and configuration content where applicable. |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, uniqueness, same-company composition, valid SLA target definitions, valid routing-rule references, valid escalation-matrix references, valid business-hours regions) at capture time. |
| `ENG-017` Numbering | Registers numbering series for Service Desk documents here; allocation of document numbers executes at issuance time in downstream sprints. |
| `ENG-024` Event | Publishes `ServiceDeskFoundationConfigured` when the Service Desk configuration namespace is initialized or materially updated for a company. |
| `ENG-025` Notification | Emits notifications on foundation lifecycle transitions under the tenant's configured channels. |

Service Desk business semantics (Ticket Category, SLA Policy, routing rules, escalation matrices, business hours per region, numbering-series registration) are owned by this module and are not delegated to any engine.

The remaining engines listed in Module PRD §12 (`ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-013` Automation, `ENG-020` Search, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-023` Integration, `ENG-027` Export, `ENG-028` AI Copilot) are declared by the Module PRD but are **not** consumed by this sprint per Sprint Plan §2 (`SPR-MOD-016-001`) — they are consumed by later Service Desk sprints per their allocated scope.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Service-Desk-foundation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Service-Desk-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Event. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Ticket Category | MOD-016 (this sprint) | Named category scoped to a tenant/company, optionally hierarchical, used to classify Service Tickets in later sprints. |
| SLA Policy | MOD-016 (this sprint) | Named policy scoped to a tenant/company defining response and resolution targets, referencing business hours and an escalation matrix. |
| Service Desk Configuration | MOD-016 (this sprint, configuration-scoped) | Configuration namespace per company resolved via `ENG-005` (routing rules, escalation matrices, business hours per region). |
| Service Desk Numbering Series | MOD-016 (this sprint, configuration-scoped) | Numbering-series registration per company for Service Desk documents (Service Ticket, SLA Breach Event, CSAT Response); allocation via `ENG-017` at issuance in downstream sprints. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Ticket Categories**, zero or more **SLA Policies**, one **Service Desk Configuration** namespace, and one **Service Desk Numbering Series** registration set.
- An **SLA Policy** references at most one **business-hours region** and at most one **escalation matrix**, both defined within the same company.
- A **routing rule** references one or more **Ticket Categories** and at most one **business-hours region**, all defined within the same company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-016` per the Service Desk Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Service-Desk-owned entity.
- The **Customer** entity is owned by MOD-006 CRM and is consumed read-only in later sprints; it is not a Service-Desk-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Service-Desk-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../../02-architecture/event-catalog.md`](../../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Event.

### 11.1 Published

- **`ServiceDeskFoundationConfigured`** — published via `ENG-024` when the Service Desk configuration namespace is initialized or materially updated for a company. Per Sprint Plan §2 (`SPR-MOD-016-001`), this is the single domain event originated by this sprint. Additional Service-Desk-lifecycle events (`ServiceTicketCreated`, `ServiceTicketClosed`, `SLABreached`, `KnowledgeArticlePublished`) are originated by later Service Desk sprints per Module PRD §8.

### 11.2 Consumed

None in this sprint. Consumption of `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon` is scoped to `SPR-MOD-016-002`; neither occurs here.

Payload contracts for Service Desk events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Service-Desk-foundation read and write.
- [ ] Every Service-Desk-foundation lifecycle transition and every configuration registration produces an audit record via `ENG-004`.
- [ ] Service Desk configuration namespace is initialized per company via `ENG-005` (routing rules, escalation matrices, business hours per region).
- [ ] Numbering series for Service Desk documents are registered per company and resolvable at issuance time via `ENG-017` in downstream sprints.
- [ ] Same-company composition invariant (Category parents, SLA Policy references, routing-rule references, escalation-matrix references, business-hours references) is enforced via `ENG-012` at capture time.
- [ ] `ServiceDeskFoundationConfigured` is published via `ENG-024` on every configuration initialization or material update, exactly once per (tenant, company, configuration revision).
- [ ] Notifications are emitted via `ENG-025` on foundation lifecycle transitions under the tenant's configured channels where enabled.
- [ ] Actor identity for foundation lifecycle actions is exercised end-to-end read-only against `ENG-001`; no credentials are minted by Service Desk.
- [ ] No Service Desk code path writes to `ENG-015` Voucher or `ENG-016` Posting.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) and in [`../README.md`](../README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-016_SPRINT_PLAN.md` §2 (`SPR-MOD-016-001`):

- Ticket Category and SLA Policy records can be created, edited, and archived under a tenant/company.
- Routing rules, escalation matrices, and business hours per region are resolvable via `ENG-005` in the tenant → company → context hierarchy.
- Structural validation and hierarchy enforcement run deterministically via `ENG-012`.
- Document numbers for Service Desk transactions issue through `ENG-017`.
- All state changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-016 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-016 depends on `MOD006_CRM_BASELINE_v1` being frozen and stable. Although this sprint does not itself consume Customer reads, later Service Desk sprints depend on MOD-006's Customer master.
  - **Impact:** Any drift in MOD-006 read APIs would decouple later Service Desk operations from Customer data.
  - **Mitigation:** Consume MOD-006 read APIs per their authoritative contract in later sprints; escalate any change as a CRM defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Later Service Desk sprints (`SPR-MOD-016-002` … `SPR-MOD-016-005`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Service-Desk-owned entities (Ticket Category, SLA Policy, routing rules, escalation matrices, business hours per region, numbering series) MUST NOT be redefined by downstream modules; MOD-006-owned Customer and MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Ticket Category & SLA Policy Master Authority convention (§1.1.1), the Service Desk Foundation Configuration Authority (§1.1.2), and the cross-module boundary (§1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 1 publishes `ServiceDeskFoundationConfigured`. Downstream Service Desk sprints declare additional published events (`ServiceTicketCreated`, `ServiceTicketClosed`, `SLABreached`, `KnowledgeArticlePublished`) and consume `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon`. Any event name not yet present in the authoritative event catalog at their authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint that publishes/consumes them, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register each event in the authoritative event catalog through the governance path before the originating sprint enters `In Progress`. This sprint does not modify the event catalog.
  - **Status:** Open

---

## 15. References

- Parent Module PRD — [`../../../20-module-prds/service-desk/MODULE_PRD.md`](../../../20-module-prds/service-desk/MODULE_PRD.md)
- Module Sprint Plan (Stage 1) — [`../MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md)
- Sprint Framework — [`../../../SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md), [`../../../SPRINT_ROADMAP.md`](../../../SPRINT_ROADMAP.md), [`../../../SPRINT_ESTIMATION_GUIDE.md`](../../../SPRINT_ESTIMATION_GUIDE.md), [`../../../SPRINT_DEPENDENCY_MATRIX.md`](../../../SPRINT_DEPENDENCY_MATRIX.md), [`../../../SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md)
- ERP Core Engines — [`../../../10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md)
- ADR Index — [`../../../11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../../02-architecture/event-catalog.md`](../../../02-architecture/event-catalog.md)
- Upstream Baselines — [`../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md)
- Module Implementation Workflow — [`../../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md)
