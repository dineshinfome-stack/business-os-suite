---
title: "SPR-MOD-012-003 — Mobile Visit Execution (Spares, Signatures, Closure)"
summary: "Sprint PRD for the Mobile Visit Execution layer of MOD-012 Field Service: on-site Visit lifecycle extension (`on site → completed`), Spare Consumption transaction, signature and checklist capture, Closure Report authoring, van-stock decrement via `SpareConsumed`, publication of `FieldVisitCompleted` and `SpareConsumed`, and consumption of MOD-016-owned `ServiceTicketClosed` for ticket-closure reconciliation. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-012-003"
parent_module: "MOD-012"
parent_sprint_plan: "MOD-012_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "14.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-010", "ENG-012", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "field-service", "mod-012", "mobile-execution", "spares", "closure", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD012-003-20260716T014000Z-001"
parent_result_id: "GT003-MOD012-002-20260716T013000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-012-003 — Mobile Visit Execution (Spares, Signatures, Closure)

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-012 Field Service** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-012-003` (permanent) |
| Parent Module | `MOD-012` — Field Service |
| Parent Sprint Plan | [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-012-002`](./SPR-MOD-012-002-dispatch-and-scheduling.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen), [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-012-004`, `SPR-MOD-012-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Visit-to-closure** and **Spare consumption** processes for BusinessOS Field Service: the on-site extension of the **Visit** transaction lifecycle (`on site → completed`), the **Spare Consumption** transaction with numbering via `ENG-017` and van-stock decrement via published `SpareConsumed`, **signature and checklist capture** enforced via `ENG-012`, **Closure Report** authoring rendered via `ENG-007` and attached via `ENG-008`, publication of `FieldVisitCompleted` and `SpareConsumed` via `ENG-024`, and read-only consumption of MOD-016-owned `ServiceTicketClosed` via `ENG-024` for ticket-closure reconciliation. This sprint runs strictly on the dispatch substrate delivered by `SPR-MOD-012-002` and prepares the substrate consumed by `SPR-MOD-012-004` (SLA & Escalation) and `SPR-MOD-012-005` (Analytics).

> **Field Service Ownership Convention.** The Field Service module owns the business semantics of the Visit transaction (including the on-site completion transition), the Spare Consumption transaction, the Closure Report, signature/checklist capture, and the mobile-app configuration namespace. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, document, attachment, workflow, rules, numbering, eventing, notification) but **MUST NOT** redefine Field Service business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. **Item master** and **stock movements** remain exclusive to **MOD-005 Inventory**; this sprint consumes Item read-only and emits `SpareConsumed` for inventory adjustment without redefining Item or stock-movement semantics. Contract, Entitlement, Coverage, and preventive-visit scheduling authority remain exclusive to **MOD-011 AMC**. **Service-ticket master ownership** and `ServiceTicketClosed` publication remain exclusive to **MOD-016 Service Desk**; this sprint consumes `ServiceTicketClosed` read-only to reconcile ticket closure with Visit completion. Ledger effects remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting. Cross-module KPI definitions remain exclusive to **MOD-017 Analytics**.

#### 1.1.1 Visit Completion Authority

The on-site completion transition (`on site → completed`) is authoritatively owned by MOD-012 Field Service and enforced via `ENG-010` Workflow. Completion is gated by the signature/checklist rule (§1.1.4) enforced via `ENG-012`. Downstream sprints (SLA/Escalation, Analytics) consume Visit-completion state; only the transition declared here — building on the dispatch-phase lifecycle authored in `SPR-MOD-012-002` — is legal.

#### 1.1.2 Spare Consumption Transaction Authority

The **Spare Consumption** transaction is authoritatively owned by MOD-012 Field Service and scoped to a tenant/company. Document numbering issues via `ENG-017` under configuration registered in `SPR-MOD-012-001`. Van-stock decrement is effected by the **published** `SpareConsumed` event; MOD-005 Inventory owns Item master and stock-movement semantics and consumes `SpareConsumed` to adjust van stock. No stock ledger row is authored here.

#### 1.1.3 Closure Report Authority

The **Closure Report** transaction is authoritatively owned by MOD-012 Field Service. Rendering executes through `ENG-007` Document; attachment execution occurs through `ENG-008` Attachment; the Closure Report is bound to exactly one Visit within the same (tenant, company).

#### 1.1.4 Signature and Checklist Rule Authority

Signature and checklist requirements for Visit completion are authored, registered, and evaluated within Field Service. Configuration registers through `ENG-005` under the mobile-app-settings namespace scoped to (tenant, company); evaluation of the "a visit cannot be closed without required signatures/checklists" rule executes through `ENG-012` at the `on site → completed` gate. No other module MAY redefine this rule.

#### 1.1.5 Field Service ↔ Inventory, Service Desk, AMC, Accounting, Analytics, and Platform Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Sprint 3 consumes these read-only via `ENG-002`.
- **MOD-005 Inventory** owns Item master and stock-movement semantics. Sprint 3 references Item read-only when authoring Spare Consumption line items; van-stock is decremented by MOD-005 in response to consumed `SpareConsumed`. No Item master or stock-movement entity is authored here.
- **MOD-011 AMC** owns Contract, Entitlement, and Coverage. Sprint 3 does not redefine AMC-owned entities.
- **MOD-016 Service Desk** owns the service-ticket master and publishes `ServiceTicketClosed`. Sprint 3 consumes `ServiceTicketClosed` read-only to reconcile ticket closure with Visit completion; the MOD-016-owned service-ticket entity is not redefined here.
- **MOD-002 Accounting** owns financial postings via `ENG-015` and `ENG-016`. No Field Service sprint writes journal entries; billable-work effects are consumed downstream from Field Service events.
- **MOD-017 Analytics** owns cross-module KPI definitions. Field Service execution KPIs are surfaced by `SPR-MOD-012-005`; cross-module KPIs are never redefined by MOD-012.

Ownership boundaries SHALL NOT be redefined in downstream Field Service Sprint PRDs.

#### 1.1.6 Mobile-App Settings Configuration Authority

The mobile-app-settings configuration namespace (signature/checklist requirements, capture policies, and Closure Report rendering settings) is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline. This sprint registers and evaluates the mobile-app-settings keys. Dispatch-strategy and Territory-rule namespaces remain scoped to `SPR-MOD-012-002`; SLA policies remain scoped to `SPR-MOD-012-004`. No module-specific configuration keys are registered outside Field Service's own ownership boundary.

### 1.2 In Scope

- **On-site Visit lifecycle extension** (`on site → completed`), enforced through `ENG-010` Workflow and gated by the signature/checklist rule via `ENG-012`.
- **Signature and checklist capture** as attachments via `ENG-008`, gating completion via `ENG-012` under mobile-app-settings registered via `ENG-005`.
- **Spare Consumption** transaction: create against an `on site` Visit under a (tenant, company); document identifier issued via `ENG-017` numbering registered in `SPR-MOD-012-001`; line items reference MOD-005-owned Item read-only.
- **Closure Report** transaction: authored per Visit; rendered via `ENG-007`; attached via `ENG-008`; scoped to (tenant, company).
- **Event publication.** `FieldVisitCompleted` published via `ENG-024` on the `on site → completed` transition. `SpareConsumed` published via `ENG-024` on Spare Consumption commit.
- **Event consumption.** `ServiceTicketClosed` (from MOD-016) consumed via `ENG-024` to reconcile ticket closure with Visit completion.
- **Authorization** on Visit completion, Spare Consumption, Closure Report, and signature/checklist actions via `ENG-002`.
- **Audit** emission via `ENG-004` for every `on site → completed` transition, Spare Consumption commit, Closure Report author/attach, signature/checklist capture, and `ServiceTicketClosed` reconciliation.
- **Notification** emission via `ENG-025` on Visit completion and on Spare Consumption commit.
- **Structural validation** (required fields, referential integrity, same-company invariants, signature/checklist gate, Item read-only reference well-formedness) via `ENG-012`.

### 1.3 Out of Scope

- Foundation masters (Technician, Skill, Territory, Ticket Type) and Field Ticket capture/triage — `SPR-MOD-012-001`.
- Visit `assigned → en route → on site` dispatch-phase lifecycle, dispatch-strategy resolution, scheduled/automated dispatch, `VisitAssigned` publication, `VisitScheduled` consumption, Dispatch-strategy and Territory-rule configuration namespaces — `SPR-MOD-012-002`.
- SLA policy master, SLA tracking, escalation workflows and notifications — `SPR-MOD-012-004`.
- Field Service read model, operational reports, dashboards, exports, audit-readiness surface — `SPR-MOD-012-005`.
- Item master and stock movements (van-stock ledger effect) — owned by MOD-005 Inventory (consumed here read-only; MOD-005 adjusts stock in response to `SpareConsumed`).
- Service-ticket master and `ServiceTicketClosed` publication — owned by MOD-016 Service Desk (consumed here read-only).
- Contract, Entitlement, Coverage masters and preventive-visit scheduling — owned by MOD-011 AMC.
- Financial postings for billable field work — owned by MOD-002 Accounting via `ENG-015` and `ENG-016`.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-012-003`, the following will exist:

- **Business capabilities.**
  - A Field Technician can capture required signatures and checklists against a Visit in `on site`, under the mobile-app-settings resolved through `ENG-005`.
  - A Field Technician can drive a Visit from `on site → completed` via `ENG-010` Workflow; completion is rejected by `ENG-012` when required signatures/checklists are absent.
  - A Field Technician can author a Spare Consumption transaction against a Visit in `on site`, referencing MOD-005-owned Items read-only, with a document identifier issued via `ENG-017`.
  - A Field Technician can author a Closure Report for a Visit; the report renders via `ENG-007` and is attached via `ENG-008`.
  - The service-ticket-closure reconciliation runs on receipt of a MOD-016-published `ServiceTicketClosed` linked to a Visit in `completed`.
- **Domain events.**
  - `FieldVisitCompleted` published via `ENG-024` on every `on site → completed` transition. Payload contract is governed by the authoritative event catalog and not redefined here.
  - `SpareConsumed` published via `ENG-024` on every Spare Consumption commit. Payload contract is governed by the authoritative event catalog and not redefined here.
  - `ServiceTicketClosed` consumed via `ENG-024` to reconcile ticket closure with Visit completion.
- **Configuration artifacts.** Mobile-app-settings keys (signature/checklist requirements, capture policies, Closure Report rendering settings) registered per company via `ENG-005`. No module-specific keys registered outside Field Service's ownership boundary.
- **Audit artifacts.** An audit record exists for every `on site → completed` transition, Spare Consumption commit, Closure Report author/attach, signature/checklist capture, and `ServiceTicketClosed` reconciliation, produced via `ENG-004`.
- **Notification artifacts.** Notifications emitted via `ENG-025` on Visit completion and on Spare Consumption commit under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-012-003`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-012 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Mobile visit execution; Spare parts and consumption; Signature capture and closure; submodules Visits, Spares, Closure | Visit completion transition; Spare Consumption transaction; Closure Report; signature/checklist capture |
| §3 Personas — Field Technician; Service Manager; Dispatcher | User stories (§4) |
| §4 Business Processes — Visit-to-closure; Spare consumption | End-to-end `on site → completed`; Spare Consumption commit and `SpareConsumed` publication |
| §6 Transactions — Visit; Spare Consumption; Closure Report | Visit completion transition; Spare Consumption transaction; Closure Report transaction |
| §7 Business Rules — "A visit cannot be closed without required signatures/checklists"; "Spare consumption reduces the technician's van stock" | Enforced via `ENG-012` (signature/checklist gate) and via published `SpareConsumed` (MOD-005-owned van-stock adjustment) |
| §8 Integration Points — `FieldVisitCompleted`, `SpareConsumed` (published); `ServiceTicketClosed` (consumed) | Publication and consumption via `ENG-024` |
| §10 Configuration — Mobile app settings | Registration and evaluation via `ENG-005` and `ENG-012` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Field Service Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as their originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Mobile visit execution (§2) | `SPR-MOD-012-003` |
| Spare parts and consumption (§2) | `SPR-MOD-012-003` |
| Signature capture and closure (§2) | `SPR-MOD-012-003` |

These allocations are unique; no other Field Service sprint claims these capabilities as its originating capability. The **Visits**, **Spares**, and **Closure** submodules and the **Spare Consumption** and **Closure Report** transactions are originating-allocated to this sprint per Sprint Plan §4.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Mobile visit execution*, *Spare parts and consumption*, *Signature capture and closure* and submodules *Visits*, *Spares*, *Closure* → this Sprint PRD → deliverables in §2 (Visit completion transition, Spare Consumption transaction, Closure Report, signature/checklist capture, `FieldVisitCompleted` and `SpareConsumed` publication, `ServiceTicketClosed` consumption).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Field Technician, I want to capture required signatures and checklists against a Visit in `on site` so that the closure gate is satisfied deterministically.*
- **US-002.** *As a Field Technician, I want the system to reject Visit completion when required signatures/checklists are absent so that the business rule is enforced without ad-hoc workarounds.*
- **US-003.** *As a Field Technician, I want to drive a Visit from `on site → completed` via workflow so that the completion transition is governed deterministically.*
- **US-004.** *As a Field Technician, I want to author a Spare Consumption transaction against a Visit in `on site`, referencing MOD-005-owned Items, so that spares consumed on site are recorded authoritatively without redefining Item master.*
- **US-005.** *As a Field Technician, I want a document number issued for each Spare Consumption via `ENG-017` so that the transaction has a stable identifier.*
- **US-006.** *As a Field Technician, I want to author a Closure Report for a Visit and attach it via `ENG-008` so that closure evidence is durable and retrievable.*
- **US-007.** *As a Service Manager, I want to register mobile-app-settings (signature/checklist requirements, capture policies, Closure Report rendering) per company so that mobile execution behavior is deterministic and per-company configurable.*
- **US-008.** *As a downstream subscriber (SLA/Escalation, Analytics, MOD-005 Inventory, and other cross-module consumers), I want `FieldVisitCompleted` and `SpareConsumed` to be published on the respective commits so that downstream sprints and modules can react without polling Field Service state.*
- **US-009.** *As a Service Manager, I want the system to reconcile a Visit's completion with a consumed MOD-016 `ServiceTicketClosed` event so that ticket closure and Visit completion are reflected consistently.*
- **US-010.** *As a security reviewer, I want every completion transition, Spare Consumption commit, Closure Report author/attach, signature/checklist capture, and `ServiceTicketClosed` reconciliation to be audited via `ENG-004` so that execution history is reconstructible from an authoritative log.*
- **US-011.** *As a Dispatcher, I want authorization on Visit completion, Spare Consumption, Closure Report, and signature/checklist actions enforced via `ENG-002` so that only permitted actors can execute them.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Signature and checklist capture (US-001)

- **Given** a Visit in `on site` under a tenant/company and mobile-app-settings registered via `ENG-005` in the company,
  **when** a Field Technician captures required signatures and checklists,
  **then** each capture is persisted as an attachment via `ENG-008`, scoped to (tenant, company) and linked to the Visit, and audited via `ENG-004`.
- **Given** an attempt to capture a signature or checklist against a Visit outside `on site`, or against a Visit in another company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.2 Signature/checklist gate on completion (US-002)

- **Given** a Visit in `on site` with required signatures/checklists absent per registered mobile-app-settings,
  **when** completion is requested,
  **then** the request is rejected deterministically by `ENG-012` and the outcome is audited via `ENG-004`; no `FieldVisitCompleted` event is emitted.

### 5.3 Visit completion transition (US-003)

- **Given** a Visit in `on site` with required signatures/checklists satisfied,
  **when** completion is requested,
  **then** the Visit transitions to `completed` via `ENG-010`, the transition is audited via `ENG-004`, and `FieldVisitCompleted` is published via `ENG-024`.
- **Given** an attempt to transition a Visit along any path not declared by the Visit lifecycle (as extended by this sprint on the dispatch-phase lifecycle authored in `SPR-MOD-012-002`),
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.4 Spare Consumption authoring (US-004)

- **Given** a Visit in `on site` under a tenant/company and a MOD-005-owned Item reference resolvable read-only in the same company,
  **when** a Field Technician commits a Spare Consumption line against that Item and Visit,
  **then** the Spare Consumption is persisted, linked to the Visit, scoped to (tenant, company), audited via `ENG-004`, and `SpareConsumed` is published via `ENG-024`.
- **Given** an attempt to author a Spare Consumption against a Visit outside `on site`, or referencing an Item in another company, or with unresolvable Item reference,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.5 Spare Consumption numbering (US-005)

- **Given** Spare Consumption numbering configuration registered in `SPR-MOD-012-001` for the (tenant, company),
  **when** a Spare Consumption is committed,
  **then** a document number is issued via `ENG-017` deterministically, per the registered numbering series.

### 5.6 Closure Report authoring (US-006)

- **Given** a Visit in `completed` under a tenant/company,
  **when** a Field Technician authors a Closure Report,
  **then** the Closure Report is persisted, linked to exactly one Visit within the same (tenant, company), rendered via `ENG-007`, attached via `ENG-008`, and audited via `ENG-004`.
- **Given** an attempt to author a Closure Report bound to a Visit outside `completed`, or to more than one Visit, or in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.7 Mobile-app-settings registration (US-007)

- **Given** a company under an active tenant,
  **when** a Service Manager registers mobile-app-settings (signature/checklist requirements, capture policies, Closure Report rendering settings),
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** an attempt to register a mobile-app-settings key outside Field Service's declared configuration namespace,
  **when** the registration is submitted,
  **then** the registration is rejected deterministically.

### 5.8 Event publication (US-008)

- **Given** a Visit `on site → completed` transition,
  **when** the transition commits,
  **then** `FieldVisitCompleted` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.
- **Given** a Spare Consumption commit,
  **when** the commit completes,
  **then** `SpareConsumed` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.

### 5.9 Service-ticket-closure reconciliation (US-009)

- **Given** a MOD-016-published `ServiceTicketClosed` event received via `ENG-024` referencing a service ticket linked to a Visit in the same (tenant, company),
  **when** the consumer reconciles the event,
  **then** the reconciliation is persisted read-only against the linked Visit and audited via `ENG-004`; the MOD-016-owned service-ticket entity is not redefined.
- **Given** duplicate delivery of the same `ServiceTicketClosed` reference,
  **when** consumption is retried,
  **then** the consumer is idempotent — no duplicate reconciliation is persisted.

### 5.10 Audit integration (US-010)

- **Given** any `on site → completed` transition, Spare Consumption commit, Closure Report author/attach, signature/checklist capture, or `ServiceTicketClosed` reconciliation,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition or action type, and timestamp.

### 5.11 Authorization (US-011)

- **Given** any Visit-completion, Spare-Consumption, Closure-Report, or signature/checklist action,
  **when** it executes,
  **then** it is subject to `ENG-002` Authorization under `ADR-032` RBAC + ABAC; unauthorized requests are rejected deterministically.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any Visit-completion, Spare-Consumption, Closure-Report, signature/checklist, or reconciliation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.13 Ownership consumption invariants

- **Given** any Spare Consumption line item,
  **when** it references an Item,
  **then** the Item reference is resolved read-only against MOD-005 Inventory; no Item master or stock-movement entity is authored here.
- **Given** any downstream module or sprint requiring Visit-completion or Spare-Consumption data,
  **when** it reads or reacts to that data,
  **then** it does so exclusively through Field-Service-owned events (`FieldVisitCompleted`, `SpareConsumed`) and Field Service read APIs. No downstream module creates an independent Visit, Spare Consumption, or Closure Report master.
- **Given** any Field Service code path that requires service-ticket linkage from `ServiceTicketClosed`,
  **when** it needs the linked service-ticket entity,
  **then** it consumes the linkage via the `ServiceTicketClosed` reference only; the MOD-016-owned service-ticket entity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-012` — Field Service.
- **Module PRD:** [`docs/20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Mobile visit execution; Spare parts and consumption; Signature capture and closure; submodules Visits, Spares, Closure), §3 (Field Technician, Service Manager, Dispatcher), §4 (Visit-to-closure, Spare consumption), §6 (Visit, Spare Consumption, Closure Report), §7 (signature/checklist rule, van-stock rule), §8 (`FieldVisitCompleted`, `SpareConsumed` published; `ServiceTicketClosed` consumed), §10 (Mobile app settings), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-012` MODULE_PRD.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-012-002`.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — Item master consumed read-only; MOD-005 adjusts van stock in response to `SpareConsumed`.
  - [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen) — Visit ↔ AMC-scheduling linkage inherited from `SPR-MOD-012-002` is preserved read-only.
- **Cross-module consumption (events only):** `ServiceTicketClosed` (from MOD-016) via `ENG-024`. Item read APIs (MOD-005) referenced read-only for Spare Consumption line items.
- **Downstream sprints:** `SPR-MOD-012-004` (SLA & Escalation), `SPR-MOD-012-005` (Field Service Analytics & Compliance) — per [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Field Service Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and of the Sprint Plan §2 engines declared for `SPR-MOD-012-003`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Visit-completion, Spare-Consumption, Closure-Report, and signature/checklist actions under `ADR-032` RBAC + ABAC. |
| `ENG-004` Audit | Records every `on site → completed` transition, Spare Consumption commit, Closure Report author/attach, signature/checklist capture, and `ServiceTicketClosed` reconciliation. |
| `ENG-005` Configuration | Registers and resolves mobile-app-settings (signature/checklist requirements, capture policies, Closure Report rendering) under the tenant/company hierarchy. |
| `ENG-007` Document | Renders Closure Reports. |
| `ENG-008` Attachment | Persists signature/checklist captures and Closure Report attachments. |
| `ENG-010` Workflow | Enforces the on-site completion transition (`on site → completed`) atop the dispatch-phase lifecycle authored in `SPR-MOD-012-002`. |
| `ENG-012` Rules | Evaluates the signature/checklist gate at `on site → completed` and structural validations on Spare Consumption line items. |
| `ENG-017` Numbering | Issues Spare Consumption document numbers per the numbering series registered in `SPR-MOD-012-001`. |
| `ENG-024` Eventing | Publishes `FieldVisitCompleted` on Visit completion and `SpareConsumed` on Spare Consumption commit; consumes `ServiceTicketClosed` for ticket-closure reconciliation. |
| `ENG-025` Notification | Emits notifications on Visit completion and on Spare Consumption commit. |

Field Service business semantics (Visit completion transition, Spare Consumption transaction, Closure Report, signature/checklist rule, mobile-app-settings configuration namespace) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §19.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Visit-completion, Spare-Consumption, Closure-Report, signature/checklist, and reconciliation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to all Field Service actions in this sprint. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Visit (completion extension) | MOD-012 (this sprint) | Extends the Visit transaction authored in `SPR-MOD-012-002` with the on-site completion transition (`on site → completed`) and its signature/checklist gate. |
| Spare Consumption | MOD-012 (this sprint) | Field-service transaction scoped to a tenant/company, linked to exactly one Visit in `on site`, with line items referencing MOD-005-owned Items read-only. |
| Closure Report | MOD-012 (this sprint) | Rendered document bound to exactly one Visit in `completed` within the same (tenant, company). |
| Signature / Checklist Capture | MOD-012 (this sprint) | Attachment payload persisted against a Visit in `on site`, satisfying the completion gate. |
| Mobile-App-Settings Configuration | MOD-012 (this sprint, configuration-scoped) | Per-company mobile-app-settings keys registered and resolved via `ENG-005`, evaluated via `ENG-012` (signature/checklist gate) and consumed by `ENG-007` (Closure Report rendering). |
| Visit ↔ Service Ticket Reconciliation | MOD-012 (this sprint) | Read-only reconciliation record produced by consuming `ServiceTicketClosed`; references the MOD-016-owned service ticket. |

### 10.2 Relationships

- A **Visit** in `on site` may have zero or more **Spare Consumption** transactions and zero or more **Signature/Checklist Captures** in the same (tenant, company).
- A **Visit** in `completed` has zero or one **Closure Report** in the same (tenant, company).
- A **Spare Consumption** line item references exactly one MOD-005-owned **Item** in the same company (read-only).
- A **Visit ↔ Service Ticket Reconciliation** references exactly one MOD-016-owned service ticket per reconciliation event.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-012` per the Field Service Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Item** entity is owned by MOD-005 Inventory and is consumed read-only; it is not a Field-Service-owned entity. Van-stock movements are effected by MOD-005 in response to consumed `SpareConsumed`.
- The **Service Ticket** entity is owned by MOD-016 Service Desk and is referenced read-only via consumed `ServiceTicketClosed`; it is not a Field-Service-owned entity.
- The **Visit**, **Field Ticket**, **Technician**, **Skill**, **Territory**, and **Ticket Type** entities are owned by MOD-012 from `SPR-MOD-012-001` and `SPR-MOD-012-002` and are referenced here without redefinition.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Field-Service-owned entity.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`FieldVisitCompleted`** — published via `ENG-024` on every Visit `on site → completed` transition.
- **`SpareConsumed`** — published via `ENG-024` on every Spare Consumption commit. Per Sprint Plan §2 (`SPR-MOD-012-003`), these are the domain events originated by this sprint.

### 11.2 Consumed

- **`ServiceTicketClosed`** (from MOD-016 Service Desk) — consumed via `ENG-024` to reconcile ticket closure with Visit completion. MOD-016-owned entities are not redefined here.

MOD-005 Item read APIs are consumed read-only for Spare Consumption line items; MOD-005 adjusts van stock in response to `SpareConsumed` under its own module boundary.

Payload contracts for Field Service events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Visit-completion, Spare-Consumption, Closure-Report, signature/checklist, and reconciliation read and write.
- [ ] Every `on site → completed` transition, Spare Consumption commit, Closure Report author/attach, signature/checklist capture, and `ServiceTicketClosed` reconciliation produces an audit record via `ENG-004`.
- [ ] Mobile-app-settings configuration namespace is initialized per company via `ENG-005`.
- [ ] The Visit on-site completion transition (`on site → completed`) is enforced end-to-end via `ENG-010`, gated by the signature/checklist rule via `ENG-012`.
- [ ] Spare Consumption line items reference MOD-005-owned Items read-only; no Item master or stock-movement entity is authored here.
- [ ] Spare Consumption document numbers issue via `ENG-017`.
- [ ] Closure Reports render via `ENG-007` and are attached via `ENG-008`.
- [ ] `FieldVisitCompleted` and `SpareConsumed` are published via `ENG-024` on their respective commits, exactly once each.
- [ ] `ServiceTicketClosed` (MOD-016) is consumed via `ENG-024` idempotently and stored as a read-only reconciliation against the linked Visit without redefining MOD-016-owned entities.
- [ ] Notifications are emitted on Visit completion and on Spare Consumption commit via `ENG-025`.
- [ ] Authorization is enforced on Visit-completion, Spare-Consumption, Closure-Report, and signature/checklist actions via `ENG-002`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-012_SPRINT_PLAN.md` §2 (`SPR-MOD-012-003`):

- Visits complete only when required signatures/checklists are captured — enforced via `ENG-012`.
- Spare Consumption transactions issue via `ENG-017` numbering and are audited via `ENG-004`.
- Closure Reports are attached via `ENG-008` and rendered via `ENG-007`.
- `FieldVisitCompleted` and `SpareConsumed` events are published via `ENG-024`; `ServiceTicketClosed` events are consumed to reconcile ticket closure with visit completion.

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
  - **Description:** MOD-012 depends on `MOD005_INVENTORY_BASELINE_v1` being frozen and stable for Item read APIs and for van-stock adjustment in response to `SpareConsumed`.
  - **Impact:** Any drift in the MOD-005 Item contract or stock-movement semantics would break Spare Consumption authoring and van-stock reduction.
  - **Mitigation:** Consume Item read-only per its baseline contract; publish `SpareConsumed` per its authoritative event-catalog contract; escalate any change as an MOD-005 defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** MOD-012 depends on `SPR-MOD-012-002` (Dispatch & Scheduling) being complete; Visit completion requires a Visit in `on site` reached through the dispatch-phase lifecycle.
  - **Impact:** Dispatch regressions would block on-site execution and closure.
  - **Mitigation:** Consume the dispatch contract; treat regressions as defects at `SPR-MOD-012-002`.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** The signature/checklist gate is business-critical; a misconfigured mobile-app-settings namespace could either block legitimate completions or admit non-compliant closures.
  - **Impact:** Either failure mode violates the "a visit cannot be closed without required signatures/checklists" rule.
  - **Mitigation:** Enforce mobile-app-settings registration via `ENG-005` structural validation; evaluate the gate exclusively via `ENG-012` at the `on site → completed` transition.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Later Field Service sprints (`SPR-MOD-012-004`, `SPR-MOD-012-005`) are deferred; scope-creep back into this sprint would dilute Mobile Visit Execution.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Field-Service-owned entities (Visit completion transition, Spare Consumption, Closure Report, signature/checklist capture, mobile-app-settings configuration) MUST NOT be redefined by downstream modules; MOD-005 Item and stock-movement semantics, MOD-016 service-ticket master, MOD-011 AMC entities, and MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Visit Completion Authority (§1.1.1), Spare Consumption Authority (§1.1.2), Closure Report Authority (§1.1.3), Signature/Checklist Rule Authority (§1.1.4), and cross-module boundary (§1.1.5) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 3 publishes `FieldVisitCompleted` and `SpareConsumed` and consumes `ServiceTicketClosed`. Any event name not yet present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint enters `In Progress`, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Confirm event catalog registration of `FieldVisitCompleted` and `SpareConsumed` publication and `ServiceTicketClosed` consumption before this sprint enters `In Progress`. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — signature/checklist gate determinism; Visit completion transition invariants; Spare Consumption line-item validation; Item read-only reference invariants; Closure Report ↔ Visit binding invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, document rendering via `ENG-007`, attachment persistence via `ENG-008`, workflow via `ENG-010`, rule evaluation via `ENG-012`, numbering via `ENG-017`, event publication and consumption via `ENG-024`, notification emission via `ENG-025`, authorization via `ENG-002`.
- **Contract** — `FieldVisitCompleted` and `SpareConsumed` payload contracts per the authoritative event catalog; `ServiceTicketClosed` consumption contract per the authoritative event catalog.
- **End-to-end (smoke)** — Visit-to-closure: Visit in `on site` → signature/checklist capture → `on site → completed` transition (with `FieldVisitCompleted` publication) → Closure Report authoring; Spare consumption: Spare Consumption commit against a Visit in `on site` with `SpareConsumed` publication; service-ticket-closure reconciliation via consumed `ServiceTicketClosed`; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an MOD-005 Item read-only fixture, an MOD-016 `ServiceTicketClosed` read-only fixture, and a deterministic mobile-app-settings configuration fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider expressing the signature/checklist gate as a pure, deterministic function over (Visit, {registered mobile-app-settings}, {captured attachments}) so §5.2 rejection determinism is trivially satisfied and testable.
- Consider a single `FieldVisitCompleted` emission path bound to the `on site → completed` transition so publication is centralized and idempotent.
- Consider a single `SpareConsumed` emission path bound to the Spare Consumption commit; keep line-item aggregation deterministic per event envelope.
- Consider an idempotent `ServiceTicketClosed`-consumption handler keyed by (tenant, company, service_ticket_reference_id) so replays do not double-reconcile.
- Consider decoupling Closure Report rendering (`ENG-007`) from attachment persistence (`ENG-008`) so partial failures do not leave orphaned attachments.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-012-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Visit-to-closure and Spare consumption processes: on-site Visit completion transition, Spare Consumption transaction, signature/checklist capture, Closure Report, `FieldVisitCompleted` and `SpareConsumed` publication, and `ServiceTicketClosed` consumption (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-012 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Field Service Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation masters, dispatch-phase lifecycle, SLA/escalation, analytics, MOD-005-owned Item and stock movements, MOD-016-owned service-ticket master, MOD-011-owned AMC entities, financial postings, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-012-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-012-004` SLA & Escalation is the immediate successor per [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-012-001` and `SPR-MOD-012-003`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-012-002-dispatch-and-scheduling.md`](./SPR-MOD-012-002-dispatch-and-scheduling.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md), [`../../40-module-baselines/MOD011_AMC_BASELINE_v1.md`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
