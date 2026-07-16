---
title: "SPR-MOD-012-001 — Field Service Foundation (Tickets & Field Workforce)"
summary: "Sprint PRD for the foundational Field Service layer of MOD-012: Technician, Skill, Territory, and Ticket Type master data, the Field Ticket transaction lifecycle, ticket capture and triage, and Field Service operations configuration (numbering series, ticket-type policies). Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-012-001"
parent_module: "MOD-012"
parent_sprint_plan: "MOD-012_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "14.0.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-012", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "field-service", "mod-012", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD012-001-20260716T012000Z-001"
parent_result_id: "GT002-MOD012-20260716T011000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-012-001 — Field Service Foundation (Tickets & Field Workforce)

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-012 Field Service** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-012-001` (permanent) |
| Parent Module | `MOD-012` — Field Service |
| Parent Sprint Plan | [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen), [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-012-002` … `SPR-MOD-012-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Field Service Foundation** for BusinessOS: the Technician, Skill, Territory, and Ticket Type master data, the Field Ticket transaction lifecycle (open → triaged → dispatched → in progress → closed → cancelled) covering **ticket capture and triage**, and the Field Service operations configuration (numbering series, ticket-type policies) resolved through `ENG-005`. This foundation is the substrate on which every subsequent Field Service sprint — Dispatch & Scheduling, Mobile Visit Execution, SLA & Escalation, and Field Service Analytics & Compliance — depends.

> **Field Service Ownership Convention.** The Field Service module owns the business semantics of the Technician, Skill, Territory, and Ticket Type masters, the Field Ticket transaction lifecycle, and the Field Service operations configuration (numbering series, ticket-type policies). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, document, attachment, workflow, rules, numbering, eventing, notification) but **MUST NOT** redefine Field Service business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Item master and stock movements remain exclusive to **MOD-005 Inventory**; Field Service consumes Item read-only in later sprints. Contract, entitlement, and preventive-visit-scheduling authority remains exclusive to **MOD-011 AMC**; this sprint consumes `ContractSigned` read-only to link tickets to active AMC contracts. Ledger effects of any billable field work remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. Service-ticket master ownership boundary with **MOD-016 Service Desk** is preserved: MOD-012 owns the Field Ticket transaction; MOD-016 owns the customer-facing service-ticket master and emits `ServiceTicketClosed` consumed by later Field Service sprints.

#### 1.1.1 Technician, Skill, Territory, and Ticket Type Master Authority

The **Technician**, **Skill**, **Territory**, and **Ticket Type** masters are authoritatively owned by MOD-012 Field Service. No other module MAY create, edit, archive, or independently maintain a parallel Technician, Skill, Territory, or Ticket Type master. Downstream sprints and modules consume these masters through Field-Service-owned events and read APIs authored in this and later sprints; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 Field Ticket Transaction Authority

The **Field Ticket** transaction is authoritatively owned by MOD-012 Field Service, in this sprint. The lifecycle (open → triaged → dispatched → in progress → closed → cancelled) is enforced via `ENG-010` Workflow. Downstream sprints consume Field Ticket state; only the transitions declared in this lifecycle are legal. Dispatch of a ticket (open → triaged → dispatched) is initiated in this sprint but the dispatch-execution semantics (Visit creation, dispatch strategy resolution, technician assignment) are scoped to `SPR-MOD-012-002`.

#### 1.1.3 Field Service ↔ AMC, Inventory, Service Desk, Accounting, Analytics, and Platform Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Field Service consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **MOD-005 Inventory** owns the Item master and stock movements. Sprint 1 does not consume Item; that consumption is scoped to `SPR-MOD-012-003` (Spare Consumption). Field Service never redefines Item.
- **MOD-011 AMC** owns the Contract, Entitlement, and Coverage masters and publishes `ContractSigned`. Sprint 1 consumes `ContractSigned` read-only to link a Field Ticket to an active AMC contract at capture time; AMC-owned entities are not redefined here.
- **MOD-016 Service Desk** owns the service-ticket master and emits `ServiceTicketClosed`. Sprint 1 does not consume `ServiceTicketClosed`; that consumption is scoped to `SPR-MOD-012-003` (Closure reconciliation).
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Field Service sprint writes journal entries; downstream sprints emit events that Accounting consumes, but never redefine posting logic.
- **MOD-017 Analytics** owns cross-module KPI definitions. Field Service operational reports are surfaced by `SPR-MOD-012-005`; cross-module KPIs are never redefined by MOD-012.

Ownership boundaries SHALL NOT be redefined in downstream Field Service Sprint PRDs.

#### 1.1.4 Field Service Configuration Authority

Field Service operations configuration — **numbering series** and **ticket-type policies** — is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline; numbering-series resolution executes through `ENG-017` at Field Ticket issuance time. Dispatch strategy, territory rules, SLA policies, and mobile-app settings are declared in the Module PRD §10 but their registration and evaluation are scoped to the sprints that originate the corresponding capabilities: Dispatch strategy and Territory rules to `SPR-MOD-012-002`; SLA policies to `SPR-MOD-012-004`; Mobile-app settings to `SPR-MOD-012-003`. No module-specific configuration keys are registered outside Field Service's own ownership boundary.

#### 1.1.5 Foundation Master Lifecycle Boundary

Field Service owns the lifecycle of every foundation master (Technician, Skill, Territory, Ticket Type) and the Field Ticket transaction lifecycle enforced through `ENG-010` Workflow. Downstream sprints (Dispatch, Mobile Execution, SLA/Escalation, Analytics) consume these entities and states without redefining their lifecycles.

### 1.2 In Scope

- Technician master: create, edit, activate, deactivate, archive under a tenant/company; per-Technician attributes include skill assignments and territory assignments consumed by later dispatch logic.
- Skill master: create, edit, activate, deactivate, archive under a tenant/company.
- Territory master: create, edit, activate, deactivate, archive under a tenant/company.
- Ticket Type master: create, edit, activate, deactivate, archive under a tenant/company; per-Ticket-Type policies (numbering series selection, default triage rules) resolvable through `ENG-005`.
- Field Ticket transaction lifecycle (open → triaged → dispatched → in progress → closed → cancelled), enforced through `ENG-010` Workflow.
- **Ticket capture and triage**: field-ticket capture from an operator, tenant-scoped uniqueness, initial triage classification (assign Ticket Type, priority, and optional AMC-contract linkage) prior to dispatch.
- Field Service operations configuration namespace initialized per company via `ENG-005`: numbering series and ticket-type policies.
- Document numbers for Field Ticket documents issued via `ENG-017`.
- `FieldTicketCreated` domain event published via `ENG-024` when a Field Ticket is created.
- `ContractSigned` domain event consumed via `ENG-024` to link a Field Ticket to an active MOD-011-owned AMC contract at capture time.
- Notification emission on Field Ticket state transitions via `ENG-025` under the tenant's configured channels.
- Read-only consumption of Platform Identity (`ENG-001`) for the actor identity used in foundation lifecycle actions.
- Audit emission via `ENG-004` for every foundation lifecycle transition.
- Attachment support for Field Ticket documents (customer inputs, photos, diagnostic notes) via `ENG-008`.
- Document classification for Field Ticket artifacts via `ENG-007`.
- Locale-scoped labels on foundation entities via `ENG-006` where applicable.
- Structural validation (required fields, referential integrity, uniqueness, same-company invariants) via `ENG-012` at capture time.

### 1.3 Out of Scope

- Visit transaction lifecycle, dispatch strategy resolution, skill/territory routing, technician assignment — `SPR-MOD-012-002`.
- Mobile visit execution, Spare Consumption transaction, Closure Report, signature/checklist capture, `FieldVisitCompleted` and `SpareConsumed` publication, `ServiceTicketClosed` consumption, mobile-app settings — `SPR-MOD-012-003`.
- SLA policy master, SLA tracking, escalation workflows and notifications — `SPR-MOD-012-004`.
- Field Service read model, operational reports, dashboards, exports, audit-readiness surface — `SPR-MOD-012-005`.
- Item master and stock movements — owned by MOD-005 Inventory.
- Contract, Entitlement, Coverage masters and preventive-visit scheduling — owned by MOD-011 AMC.
- Customer-facing service-ticket master and `ServiceTicketClosed` publication — owned by MOD-016 Service Desk.
- Financial postings for billable field work — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-012-001`, the following will exist:

- **Business capabilities.**
  - A Dispatcher / Service Manager can create, edit, activate, deactivate, and archive Technician, Skill, Territory, and Ticket Type records under a tenant/company.
  - A Dispatcher / Service Manager can capture and triage a Field Ticket (open → triaged) under a tenant/company, including Ticket Type classification, priority assignment, and optional linkage to an MOD-011-owned AMC contract via a consumed `ContractSigned` reference.
  - A Dispatcher / Service Manager can drive a Field Ticket through the foundation-visible portion of its lifecycle: `open → triaged → dispatched → in progress → closed → cancelled`, enforced via `ENG-010` Workflow. Downstream sprints execute the dispatched → in progress → closed transitions in cooperation with Visits, Spare Consumption, and Closure.
  - Field Ticket document numbers are issued deterministically at creation via `ENG-017` from the numbering series selected on the Ticket Type.
  - Field Service operations configuration (numbering series, ticket-type policies) is registered and resolves deterministically per company through `ENG-005`.
  - Identity linkage for actor actions is consumed read-only from `ENG-001` — no credentials are minted.
- **Domain events.**
  - `FieldTicketCreated` is published via `ENG-024` when a Field Ticket is created. Payload contract is governed by the authoritative event catalog and not redefined here.
  - `ContractSigned` is consumed via `ENG-024` to link a Field Ticket to an active MOD-011-owned AMC contract at capture time.
- **Configuration artifacts.** Field Service configuration namespace initialized for each company via `ENG-005` (numbering series, ticket-type policies). No module-specific keys are registered outside Field Service's own ownership boundary.
- **Audit artifacts.** An audit record exists for every Field-Service-foundation lifecycle transition, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Field Ticket state transitions produce notifications via `ENG-025` under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-012-001`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-012 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Field Service primitives and personas | Technician / Skill / Territory / Ticket Type masters and Field Service Ownership Convention |
| §2 Business Scope — Ticket capture and triage; submodule Tickets | Field Ticket transaction lifecycle (open → triaged) and ticket-type-driven classification |
| §3 Personas — Field Technician, Dispatcher, Service Manager; Inventory, AMC Coordinator; Customer | User stories (§4) |
| §5 Master Data — Technician, Skill, Territory, Ticket Type | All four masters delivered in this sprint |
| §6 Transactions — Field Ticket | Field Ticket transaction lifecycle (open → triaged → dispatched → in progress → closed → cancelled) |
| §7 Business Rules — foundation invariants (tenancy, referential integrity, same-company composition; downstream rules referenced but enforced in later sprints) | Enforceable classification, tenancy, and lifecycle invariants |
| §8 Integration Points — `FieldTicketCreated` (published); `ContractSigned` (consumed) | `FieldTicketCreated` publication and `ContractSigned` consumption via `ENG-024` |
| §10 Configuration — numbering series (in scope this sprint); ticket-type policies (in scope this sprint) | Field Service configuration namespace via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Field Service Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Ticket capture and triage (§2) | `SPR-MOD-012-001` |

This allocation is unique; no other Field Service sprint claims "Ticket capture and triage" as its originating capability. Master-data entities Technician, Skill, Territory, and Ticket Type, and the Field Ticket transaction, are each originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Ticket capture and triage* and submodule *Tickets* → this Sprint PRD → deliverables in §2 (Technician, Skill, Territory, Ticket Type masters, Field Ticket transaction lifecycle, Field Service configuration namespace, `FieldTicketCreated` publication, `ContractSigned` consumption, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Service Manager, I want to create, edit, activate, deactivate, and archive Technicians under a company (including their skill and territory assignments), so that a coherent workforce catalog exists before any dispatch, visit, or closure.*
- **US-002.** *As a Service Manager, I want to create, edit, activate, deactivate, and archive Skills under a company, so that skill-based dispatch in later sprints references an authoritative catalog.*
- **US-003.** *As a Service Manager, I want to create, edit, activate, deactivate, and archive Territories under a company, so that territory-based dispatch in later sprints references an authoritative catalog.*
- **US-004.** *As a Service Manager, I want to create, edit, activate, deactivate, and archive Ticket Types under a company (including per-type numbering-series selection and default triage rules), so that ticket capture is deterministic and audit-traceable.*
- **US-005.** *As a Dispatcher, I want to capture a Field Ticket for a customer under a company, classify it via a Ticket Type, assign priority, and optionally link it to an active AMC contract (via consumed `ContractSigned`), so that triage is deterministic from the moment the ticket is opened.*
- **US-006.** *As a Dispatcher, I want to drive a Field Ticket through the foundation-visible portion of its lifecycle (open → triaged → dispatched → in progress → closed → cancelled) via workflow, so that state transitions are governed deterministically.*
- **US-007.** *As a Dispatcher, I want the Field Ticket document number to be issued at creation via the configured numbering series (per Ticket Type), so that Field Ticket identity is stable and audit-traceable.*
- **US-008.** *As a Service Manager, I want to register Field Service operations configuration (numbering series, ticket-type policies) per company, so that ticket capture resolves its configuration deterministically.*
- **US-009.** *As a Dispatcher, I want the actor identity used for foundation lifecycle actions to be consumed read-only from `ENG-001`, so that identity, authentication, and permissions remain owned by MOD-001 while Field Service captures the master relationships.*
- **US-010.** *As a downstream subscriber (Dispatch, Mobile Execution, Analytics, and cross-module consumers), I want `FieldTicketCreated` to be published when a Field Ticket is created, so that downstream sprints and modules can react without polling Field Service state.*
- **US-011.** *As a Dispatcher, I want an active AMC contract (`ContractSigned` consumed) to be optionally linked to a Field Ticket at capture time, so that AMC-eligible tickets are recognized immediately without redefining AMC-owned entities.*
- **US-012.** *As a security reviewer, I want every Field-Service-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct Technician, Skill, Territory, Ticket Type, Field Ticket, and configuration history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Technician master (US-001)

- **Given** a valid Technician creation request under a tenant/company referencing active Skills and an active Territory in the same company,
  **when** a Service Manager submits it,
  **then** the Technician is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to assign an archived Skill or a Territory in a different company to a Technician,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.2 Skill master (US-002)

- **Given** a valid Skill creation request under a tenant/company,
  **when** a Service Manager submits it,
  **then** the Skill is persisted with a stable identifier, uniquely identified within the company, and audited.

### 5.3 Territory master (US-003)

- **Given** a valid Territory creation request under a tenant/company,
  **when** a Service Manager submits it,
  **then** the Territory is persisted with a stable identifier, uniquely identified within the company, and audited.

### 5.4 Ticket Type master (US-004)

- **Given** a valid Ticket Type creation request under a tenant/company referencing an active numbering series registered for the company,
  **when** a Service Manager submits it,
  **then** the Ticket Type is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to bind a Ticket Type to an inactive or non-existent numbering series or to a series registered under a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.5 Field Ticket capture and triage (US-005)

- **Given** a valid Field Ticket creation request under a tenant/company referencing an active Ticket Type in the same company, a priority value, and (optionally) an active AMC contract received via a consumed `ContractSigned` reference,
  **when** a Dispatcher submits it,
  **then** the Field Ticket is persisted with a stable identifier, its document number is allocated via `ENG-017`, `FieldTicketCreated` is published via `ENG-024`, and the creation is audited via `ENG-004`.
- **Given** an attempt to bind a Field Ticket to an archived Ticket Type, a Ticket Type in a different company, or to a `ContractSigned` reference that is not resolvable to an active MOD-011-owned Contract in the same company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.6 Field Ticket transaction lifecycle (US-006)

- **Given** a Field Ticket in `open`,
  **when** a Dispatcher completes triage classification,
  **then** the Field Ticket transitions to `triaged` via `ENG-010`, and the transition is audited.
- **Given** a Field Ticket in `triaged`,
  **when** the ticket is handed over to dispatch execution (details are scoped to `SPR-MOD-012-002`),
  **then** the Field Ticket transitions to `dispatched` via `ENG-010`, and the transition is audited.
- **Given** a Field Ticket in `dispatched` or `in progress`,
  **when** downstream sprints report progression through mobile-execution completion (`SPR-MOD-012-003`),
  **then** the Field Ticket transitions along `dispatched → in progress → closed` via `ENG-010`, and each transition is audited. Full-fidelity closure semantics (signatures, checklist, closure report) are enforced by `SPR-MOD-012-003`.
- **Given** a Field Ticket in any pre-closure state,
  **when** a legitimate cancellation request is submitted,
  **then** the Field Ticket transitions to `cancelled` via `ENG-010`, and the transition is audited.
- **Given** an attempt to transition a Field Ticket along any path not declared by the lifecycle (e.g. `open → dispatched` directly, or `closed → in progress`),
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.7 Numbering (US-007)

- **Given** a Field Ticket creation,
  **when** the creation executes,
  **then** a Field Ticket document number is allocated via `ENG-017` from the numbering series selected on the Ticket Type for that company; the allocated number is immutable thereafter.

### 5.8 Field Service operations configuration (US-008)

- **Given** a company under an active tenant,
  **when** numbering series and ticket-type policies are registered,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a downstream sprint querying a configuration key registered by this sprint,
  **when** it queries the key by identifier,
  **then** it receives the deterministic value resolved for its (tenant, company) scope; **evaluation semantics** for dispatch strategy, territory rules, SLA policies, and mobile-app settings are out of scope here and are delivered by later Field Service sprints per §1.1.4.

### 5.9 Identity consumption (US-009)

- **Given** any Field-Service-foundation lifecycle action,
  **when** it executes,
  **then** the actor identity is resolved read-only via `ENG-001`; no credentials are minted by Field Service.

### 5.10 Event publication (US-010)

- **Given** a Field Ticket creation,
  **when** the creation completes,
  **then** `FieldTicketCreated` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.

### 5.11 AMC contract linkage via consumed event (US-011)

- **Given** an MOD-011-published `ContractSigned` event received via `ENG-024`,
  **when** a Field Ticket capture request supplies the corresponding Contract reference in the same company,
  **then** the Field Ticket is persisted with the AMC-contract linkage, and the linkage is audited. The MOD-011-owned Contract entity is not redefined; only the reference is stored.

### 5.12 Audit integration (US-012)

- **Given** any Field-Service-foundation lifecycle transition (Technician / Skill / Territory / Ticket Type / configuration create, update, activate, deactivate, archive, and Field Ticket state transition),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.13 Isolation invariants (`ADR-011`)

- **Given** any Field-Service-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.14 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Technician, Skill, Territory, Ticket Type, or Field Ticket data,
  **when** it reads or reacts to these masters/transactions,
  **then** it does so exclusively through Field-Service-owned events (`FieldTicketCreated` here; additional events in later sprints) and Field Service read APIs. No downstream module creates an independent Technician, Skill, Territory, Ticket Type, or Field Ticket master.
- **Given** any Field Service code path that requires MOD-011 Contract data,
  **when** it needs the linked Contract,
  **then** it consumes the linkage via the `ContractSigned` reference only; the MOD-011-owned Contract entity is not redefined here.
- **Given** any Field Service code path that requires Identity data,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-012` — Field Service.
- **Module PRD:** [`docs/20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Ticket capture and triage; submodule Tickets), §3 (Field Technician, Dispatcher, Service Manager; Inventory, AMC Coordinator; Customer), §5 (Technician, Skill, Territory, Ticket Type), §6 (Field Ticket transaction), §7 (foundation invariants), §8 (`FieldTicketCreated` published; `ContractSigned` consumed), §10 (numbering series, ticket-type policies), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-012` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — Item master (consumed read-only from `SPR-MOD-012-003`, not this sprint).
  - [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen) — `ContractSigned` publication consumed by this sprint for AMC-contract linkage.
- **Upstream sprint dependencies (per Sprint Plan §2):** None (Field Service sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, and `MOD011_AMC_BASELINE_v1`.
- **Cross-module consumption (events only):** `ContractSigned` (from MOD-011) via `ENG-024` for optional AMC-contract linkage on Field Ticket capture. Consumption of `ServiceTicketClosed` (from MOD-016) and MOD-005 Item read APIs is scoped to `SPR-MOD-012-003`.
- **Downstream sprints:** `SPR-MOD-012-002` (Dispatch & Scheduling), `SPR-MOD-012-003` (Mobile Visit Execution: Spares, Signatures, Closure), `SPR-MOD-012-004` (SLA & Escalation), `SPR-MOD-012-005` (Field Service Analytics & Compliance) — per [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Field Service Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the Dispatcher / Service-Manager identity used for foundation lifecycle actions and read-only binding to Platform users. |
| `ENG-002` Authorization | Enforces authorization on Field-Service-foundation actions. |
| `ENG-003` Permission Management | Registers Field-Service-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every Field-Service-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves Field Service operations configuration (numbering series, ticket-type policies) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for Technician, Skill, Territory, Ticket Type, and Field Ticket content where applicable. |
| `ENG-007` Document | Provides document classification for Field Ticket artifacts. |
| `ENG-008` Attachment | Provides attachment binding for Field Ticket documents (customer inputs, photos, diagnostic notes). |
| `ENG-010` Workflow | Enforces the Field Ticket transaction lifecycle (open → triaged → dispatched → in progress → closed → cancelled). |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, uniqueness, same-company composition) at capture time. |
| `ENG-017` Numbering | Allocates Field Ticket document numbers at creation time from the numbering series selected on the Ticket Type. |
| `ENG-024` Eventing | Publishes `FieldTicketCreated` on Field Ticket creation; consumes `ContractSigned` for optional AMC-contract linkage. |
| `ENG-025` Notification | Emits notifications on Field Ticket state transitions under the tenant's configured channels. |

Field Service business semantics (Technician, Skill, Territory, Ticket Type, Field Ticket transaction lifecycle, Field Service configuration namespace, Field Ticket ↔ AMC Contract read-only linkage) are owned by this module and are not delegated to any engine.

Engines declared in the Sprint Plan §2 for this sprint but not exercised at the acceptance-criteria level here — namely `ENG-011` Approval — are reserved for downstream Field Service sprints and remain subset-legal against the Module PRD engine union.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §19.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Field-Service-foundation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Field-Service-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Technician | MOD-012 (this sprint) | Named field worker scoped to a tenant/company, referencing zero-or-more Skills and one-or-more Territories within the same company. |
| Skill | MOD-012 (this sprint) | Named skill scoped to a tenant/company, referenced by Technicians and (in later sprints) by dispatch logic. |
| Territory | MOD-012 (this sprint) | Named territory scoped to a tenant/company, referenced by Technicians and (in later sprints) by dispatch logic. |
| Ticket Type | MOD-012 (this sprint) | Named ticket classifier scoped to a tenant/company, carrying numbering-series selection and default triage policy resolved via `ENG-005`. |
| Field Ticket | MOD-012 (this sprint) | Field-service transaction scoped to a tenant/company, referencing a Ticket Type and (optionally) an MOD-011-owned Contract read-only via `ContractSigned`; runs a lifecycle (open → triaged → dispatched → in progress → closed → cancelled). |
| Field Ticket ↔ AMC Contract Binding | MOD-012 (this sprint) | Read-only reference from a Field Ticket to an MOD-011-owned Contract received via consumed `ContractSigned` within the same company. |
| Field Service Configuration | MOD-012 (this sprint, configuration-scoped) | Field Service operations configuration namespace per company resolved via `ENG-005` (numbering series, ticket-type policies). |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Technicians**, zero or more **Skills**, zero or more **Territories**, zero or more **Ticket Types**, zero or more **Field Tickets**, and one **Field Service configuration** namespace.
- A **Technician** references zero or more **Skills** and one or more **Territories**, all within the same company.
- A **Ticket Type** references exactly one active numbering series within the same company.
- A **Field Ticket** references exactly one **Ticket Type** within the same company, and optionally exactly one MOD-011-owned **Contract** (via consumed `ContractSigned`) within the same company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-012` per the Field Service Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Contract** entity is owned by MOD-011 AMC and is referenced read-only via consumed `ContractSigned`; it is not a Field-Service-owned entity.
- The **Item** entity is owned by MOD-005 Inventory; it is not referenced in this sprint (consumption is scoped to `SPR-MOD-012-003`).
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Field-Service-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Field-Service-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`FieldTicketCreated`** — published via `ENG-024` when a Field Ticket is created. Per Sprint Plan §2 (`SPR-MOD-012-001`), this is the single domain event originated by this sprint. Additional Field-Service-lifecycle events (`VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed`) are originated by later Field Service sprints per Module PRD §8.

### 11.2 Consumed

- **`ContractSigned`** (from MOD-011 AMC) — consumed via `ENG-024` to link a Field Ticket to an active MOD-011-owned Contract at capture time. MOD-011-owned entities are not redefined here; only the reference is stored.

Consumption of `ServiceTicketClosed` (from MOD-016 Service Desk) and MOD-005 Item read APIs is scoped to `SPR-MOD-012-003` and does not occur in this sprint.

Payload contracts for Field Service events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Field-Service-foundation read and write.
- [ ] Every Field-Service-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] Field Service configuration namespace is initialized per company via `ENG-005` (numbering series, ticket-type policies).
- [ ] The Field Ticket transaction lifecycle (open → triaged → dispatched → in progress → closed → cancelled) is enforced end-to-end via `ENG-010`.
- [ ] Field Ticket document numbers are issued at creation via `ENG-017` from the numbering series selected on the Ticket Type.
- [ ] `FieldTicketCreated` is published via `ENG-024` on every Field Ticket creation, exactly once.
- [ ] `ContractSigned` (MOD-011) is consumed via `ENG-024` and stored as a read-only Field Ticket ↔ Contract linkage without redefining MOD-011-owned entities.
- [ ] Notifications are emitted on Field Ticket state transitions via `ENG-025`.
- [ ] Actor identity for foundation lifecycle actions is exercised end-to-end read-only against `ENG-001`; no credentials are minted by Field Service.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-012_SPRINT_PLAN.md` §2 (`SPR-MOD-012-001`):

- Technician, Skill, Territory, and Ticket Type records can be created, edited, and archived under a tenant/company.
- Field Ticket transaction lifecycle (open → triaged → dispatched → in progress → closed → cancelled) is enforced via `ENG-010`.
- Ticket-type policies resolve deterministically through `ENG-005`.
- Document numbers issue through `ENG-017`.
- `FieldTicketCreated` events are published via `ENG-024`; `ContractSigned` events are consumed to link tickets to active AMC contracts.
- All state changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-012 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-012 depends on `MOD011_AMC_BASELINE_v1` being frozen and stable for `ContractSigned` publication consumed by Field Ticket capture for optional AMC-contract linkage.
  - **Impact:** Any drift in the AMC `ContractSigned` payload would break Field Ticket ↔ Contract linkage.
  - **Mitigation:** Consume `ContractSigned` per its authoritative event-catalog contract; escalate any change as an AMC defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-012 depends on `MOD005_INVENTORY_BASELINE_v1` being frozen for Item consumption in `SPR-MOD-012-003`. This sprint does not consume Item directly, but sprint sequencing assumes the baseline remains stable.
  - **Impact:** Regression against the Inventory baseline would delay `SPR-MOD-012-003`.
  - **Mitigation:** Preserve subset-legal engine and event scope; treat baseline regression as a defect at the owning module.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Later Field Service sprints (`SPR-MOD-012-002` … `SPR-MOD-012-005`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Field-Service-owned entities (Technician, Skill, Territory, Ticket Type, Field Ticket, Field Service configuration) MUST NOT be redefined by downstream modules; MOD-011 Contract, MOD-005 Item, MOD-016 Service Ticket, and MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Technician / Skill / Territory / Ticket Type Master Authority convention (§1.1.1), the Field Ticket Transaction Authority (§1.1.2), and the cross-module boundary (§1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-07
  - **Description:** Field Service operations configuration registration is in scope here for numbering series and ticket-type policies; **evaluation** semantics for dispatch strategy, territory rules, SLA policies, and mobile-app settings are in scope of downstream Field Service sprints.
  - **Impact:** Loose registration semantics would leak evaluation responsibilities into this sprint.
  - **Mitigation:** Register only the numbering-series and ticket-type-policy configuration via `ENG-005` in this sprint; do not expose evaluation paths for dispatch, territory, SLA, or mobile-app configuration here.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 1 publishes `FieldTicketCreated` and consumes `ContractSigned`. Downstream Field Service sprints declare additional events (`VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed`) and consume additional cross-module events (`ServiceTicketClosed`). Any event name not yet present in the authoritative event catalog at their authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint that publishes/consumes them, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** For `FieldTicketCreated` and consumption of `ContractSigned` — confirm event catalog registration before this sprint enters `In Progress`. For later events — handle in each downstream sprint's own §14. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Technician, Skill, Territory, Ticket Type, and Field Ticket validation; Ticket Type ↔ numbering-series binding invariants; Field Ticket ↔ Ticket Type invariants; Field Ticket ↔ AMC Contract read-only linkage invariants; Field Ticket lifecycle transition invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, actor identity resolution via `ENG-001`, structural validation via `ENG-012`, attachment binding via `ENG-008`, workflow via `ENG-010`, numbering allocation via `ENG-017`, event publication and consumption via `ENG-024`, notification emission via `ENG-025`.
- **Contract** — `FieldTicketCreated` payload contract per the authoritative event catalog; `ContractSigned` consumption contract per the authoritative event catalog.
- **End-to-end (smoke)** — Field Ticket capture → triage → dispatched → in progress → closed → cancelled, including document-number allocation, `FieldTicketCreated` publication, optional `ContractSigned`-driven linkage, and audit emission at each step; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an MOD-011 `ContractSigned` read-only fixture, and a Platform-Identity read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Technician, Skill, Territory, Ticket Type, and Field Ticket lifecycles as small state machines so audit emission (§5.12) is trivially satisfiable at every transition.
- Consider validating tenancy and same-company invariants (Technician ↔ Skill/Territory binding, Ticket Type ↔ numbering-series binding, Field Ticket ↔ Ticket Type binding, Field Ticket ↔ AMC Contract linkage) at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating Field Service configuration initialization with company activation events emitted by MOD-001 so the Field Service configuration namespace is ready before the first Field Ticket record.
- Consider centralizing the `FieldTicketCreated` publication path so downstream sprints that add fields to the payload (per the authoritative event catalog) touch a single emission point.
- Consider a small idempotent `ContractSigned`-consumption handler keyed by (tenant, company, contract_id) so replays do not double-link AMC contracts to a Field Ticket.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-012-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Field Service Foundation — Technician, Skill, Territory, and Ticket Type masters, Field Ticket transaction lifecycle covering ticket capture and triage, Field Service operations configuration (numbering series, ticket-type policies), identity consumption, `FieldTicketCreated` publication, `ContractSigned` consumption, and audit (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-012 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Field Service Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates dispatch, mobile execution and closure, SLA/escalation, analytics, MOD-005-owned Item, MOD-011-owned AMC entities, MOD-016-owned service-ticket master, financial postings, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-012-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-012-002` Dispatch & Scheduling is the immediate successor per [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-012-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md), [`../../40-module-baselines/MOD011_AMC_BASELINE_v1.md`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md)
- Precedent Foundation Sprint PRDs — [`../amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md`](../amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md), [`../projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md`](../projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md), [`../manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md`](../manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
