---
title: "SPR-MOD-011-001 — AMC Foundation (Contracts & Entitlements)"
summary: "Sprint PRD for the foundational AMC layer of MOD-011: Contract, Entitlement, and Coverage master data, the Contract transaction lifecycle, and AMC operations configuration (SLA definitions, escalation policies, numbering series). Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-011-001"
parent_module: "MOD-011"
parent_sprint_plan: "MOD-011_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "13.0.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "amc", "mod-011", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD011-001-20260716T001000Z-001"
parent_result_id: "GT002-MOD011-20260716T000000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-011-001 — AMC Foundation (Contracts & Entitlements)

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-011 AMC** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-011-001` (permanent) |
| Parent Module | `MOD-011` — AMC |
| Parent Sprint Plan | [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD006_CRM_BASELINE_v1`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-011-002` … `SPR-MOD-011-004` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **AMC Foundation** for BusinessOS: the Contract, Entitlement, and Coverage master data, the Contract transaction lifecycle (draft → signed → active → terminated), and the AMC operations configuration (SLA definitions, escalation policies, numbering series) resolved through `ENG-005`. This foundation is the substrate on which every subsequent AMC sprint — Preventive Visit Scheduling, Contract Billing & Renewals, and AMC Analytics & Compliance — depends.

> **AMC Ownership Convention.** The AMC module owns the business semantics of the Contract, Entitlement, and Coverage masters, the Contract transaction lifecycle, and the AMC operations configuration. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, document, attachment, workflow, approval, rules, numbering, eventing, notification) but **MUST NOT** redefine AMC business rules. Financial posting of contract-invoice effects remains exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Customer master remains exclusive to **MOD-006 CRM**; AMC consumes Customer read-only for contract counterparties. Field visit execution remains exclusive to **MOD-012 Field Service**; service-desk closures remain exclusive to **MOD-016 Service Desk**.

#### 1.1.1 Contract, Entitlement, and Coverage Master Authority

The **Contract**, **Entitlement**, and **Coverage** masters are authoritatively owned by MOD-011 AMC. No other module MAY create, edit, archive, or independently maintain a parallel Contract, Entitlement, or Coverage master. Downstream sprints and modules consume these masters through AMC-owned events and read APIs authored in this and later sprints; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 AMC ↔ CRM Boundary (Contract Counterparty)

- **MOD-006 CRM** owns the Customer master and the customer-originating lifecycle.
- **MOD-011 AMC** owns the Contract master, which references a CRM-owned Customer read-only for the contract counterparty; the Customer master itself is **not** redefined in this sprint. Contract semantics (coverage, entitlements, lifecycle) belong to AMC.
- Cross-module event flow from CRM into AMC (Customer state changes) is engine-level and API-level consumption; no cross-module domain event is exercised for new contracts in Sprint 1.

#### 1.1.3 AMC ↔ Accounting, Field Service, and Platform Boundary

- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No AMC sprint writes journal entries; downstream sprints emit events that Accounting consumes, but never redefine posting logic.
- **MOD-012 Field Service** owns field-visit execution. Sprint 1 does not consume `FieldVisitCompleted`; that consumption is scoped to `SPR-MOD-011-002`.
- **MOD-016 Service Desk** owns service-ticket lifecycle. Sprint 1 does not consume `ServiceTicketClosed`; that consumption is scoped to `SPR-MOD-011-002`.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. AMC consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.

Ownership boundaries SHALL NOT be redefined in downstream AMC Sprint PRDs.

#### 1.1.4 AMC Configuration Authority

AMC operations configuration — SLA definitions, escalation policies, and numbering series — is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline; numbering-series resolution executes through `ENG-017` at Contract issuance time. No module-specific configuration keys are registered outside AMC's own ownership boundary. Configuration **consumption** by downstream AMC sprints (Scheduling, Billing & Renewals, Analytics) uses these registrations without redefining them.

#### 1.1.5 Foundation Master Lifecycle Boundary

AMC owns the lifecycle of every foundation master (Contract, Entitlement, Coverage) and the Contract transaction lifecycle (draft → signed → active → terminated) enforced through `ENG-010` Workflow and `ENG-011` Approval. Downstream sprints (Scheduling, Billing & Renewals, Analytics) consume these entities and states without redefining their lifecycles.

### 1.2 In Scope

- Contract master: create, edit, activate, deactivate, archive under a tenant/company; per-contract attributes include CRM-owned Customer read-only reference, coverage window, and numbering-series selection.
- Entitlement master: create, edit, activate, deactivate, archive under a tenant/company; scoped to a Contract for entitlement tracking.
- Coverage master: create, edit, activate, deactivate, archive under a tenant/company; declares the coverage terms used by the Contract.
- Contract transaction lifecycle (draft → signed → active → terminated), enforced through `ENG-010` Workflow and `ENG-011` Approval.
- AMC operations configuration namespace initialized per company via `ENG-005`: SLA definitions, escalation policies, numbering series.
- Document numbers for Contract documents issued via `ENG-017`.
- `ContractSigned` domain event published via `ENG-024` when a Contract transitions to `signed`.
- Notification emission on Contract state transitions via `ENG-025` under the tenant's configured channels.
- Read-only consumption of Platform Identity (`ENG-001`) for the actor identity used in foundation lifecycle actions.
- Read-only consumption of MOD-006-owned Customer master for the Contract counterparty; Customer master itself is not redefined here.
- Audit emission via `ENG-004` for every foundation lifecycle transition.
- Attachment support for Contract documents (signed agreements, schedules) via `ENG-008`.
- Document classification for Contract artifacts via `ENG-007`.
- Locale-scoped labels on foundation entities via `ENG-006` where applicable.
- Structural validation (required fields, referential integrity, uniqueness, same-company invariants) via `ENG-012` at capture time.

### 1.3 Out of Scope

- Visit Schedule transaction lifecycle, preventive schedule generation, entitlement consumption tracking, coverage-window rule enforcement — `SPR-MOD-011-002`.
- Renewal Terms master, Contract Invoice transaction (upfront and periodic), Renewal transaction lifecycle, termination handling with auto-renewal rules, notice-period rule, post-termination entitlement-block rule — `SPR-MOD-011-003`.
- AMC read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-011-004`.
- Customer master and CRM-originating lifecycle — owned by MOD-006 CRM.
- Field-visit execution and `FieldVisitCompleted` event consumption — owned by MOD-012 Field Service and scoped to `SPR-MOD-011-002`.
- Service-ticket lifecycle and `ServiceTicketClosed` event consumption — owned by MOD-016 Service Desk and scoped to `SPR-MOD-011-002`.
- Financial postings for contract-invoice events — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-011-001`, the following will exist:

- **Business capabilities.**
  - A Contracts Officer can create, edit, activate, deactivate, and archive Contract records under a tenant/company, including CRM-owned Customer reference, coverage window, and numbering-series selection.
  - A Contracts Officer can create, edit, activate, deactivate, and archive Entitlement and Coverage records under a tenant/company, scoped to the Contract they describe.
  - A Contracts Officer (with approver participation) can drive a Contract through its lifecycle: `draft → signed → active → terminated`, enforced via `ENG-010` Workflow and `ENG-011` Approval.
  - Contract document numbers are issued deterministically at signing via `ENG-017`.
  - AMC operations configuration (SLA definitions, escalation policies, numbering series) is registered and resolves deterministically per company through `ENG-005`.
  - Identity linkage for actor actions is consumed read-only from `ENG-001` — no credentials are minted.
  - Customer references for Contract counterparty binding are consumed read-only from MOD-006 — no Customer master is re-authored.
- **Domain events.** `ContractSigned` is published via `ENG-024` when a Contract transitions to `signed`. Payload contract is governed by the authoritative event catalog and not redefined here.
- **Configuration artifacts.** AMC configuration namespace initialized for each company via `ENG-005`. No module-specific keys are registered outside AMC's own ownership boundary.
- **Audit artifacts.** An audit record exists for every AMC-foundation lifecycle transition, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Contract state transitions produce notifications via `ENG-025` under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-011-001`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-011 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — AMC primitives and personas | Contract / Entitlement / Coverage masters and AMC Ownership Convention |
| §2 Business Scope — Contract creation and management; Entitlement tracking; submodules Contracts, Entitlements | Contract, Entitlement, and Coverage masters plus Contract transaction lifecycle |
| §3 Personas — Service Manager, Contracts Officer, Field Coordinator; Sales, Finance; Customer | User stories (§4) |
| §5 Master Data — Contract, Entitlement, Coverage | All three masters delivered in this sprint |
| §6 Transactions — Contract | Contract transaction lifecycle (draft → signed → active → terminated) |
| §7 Business Rules — foundation invariants (tenancy, referential integrity, same-company composition, terminated-Contract-blocks-new-entitlements as a downstream invariant enforced from Sprint 1 state) | Enforceable classification, tenancy, and lifecycle invariants |
| §8 Integration Points — `ContractSigned` (published) | `ContractSigned` publication via `ENG-024` |
| §10 Configuration — SLA definitions, Escalation policies, Numbering series | AMC configuration namespace via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved AMC Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as their originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Contract creation and management (§2) | `SPR-MOD-011-001` |
| Entitlement tracking (§2) | `SPR-MOD-011-001` |

These allocations are unique; no other AMC sprint claims "Contract creation and management" or "Entitlement tracking" as originating capabilities. Master-data entities Contract, Entitlement, and Coverage, and the Contract transaction, are each originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Contract creation and management* and *Entitlement tracking*, and submodules *Contracts* and *Entitlements* → this Sprint PRD → deliverables in §2 (Contract, Entitlement, Coverage masters, Contract transaction lifecycle, AMC configuration namespace, `ContractSigned` publication, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Contracts Officer, I want to create, edit, activate, deactivate, and archive Contracts under a company, including CRM-owned Customer reference, coverage window, and numbering-series selection, so that a coherent contract catalog exists before any schedule, invoice, or renewal.*
- **US-002.** *As a Contracts Officer, I want to create, edit, activate, deactivate, and archive Entitlements scoped to a Contract, so that entitlement tracking is grounded in an authoritative entitlement catalog.*
- **US-003.** *As a Contracts Officer, I want to create, edit, activate, deactivate, and archive Coverage records under a company and reference them from a Contract, so that coverage terms are declared explicitly and used by later sprints.*
- **US-004.** *As a Contracts Officer with the Service Manager as approver, I want to drive a Contract through its lifecycle (draft → signed → active → terminated) via workflow and approval, so that state transitions are governed deterministically.*
- **US-005.** *As a Contracts Officer, I want the Contract document number to be issued at signing via the configured numbering series, so that Contract identity is stable and audit-traceable.*
- **US-006.** *As a Service Manager, I want to register AMC operations configuration (SLA definitions, escalation policies, numbering series) per company, so that later AMC sprints resolve their configuration deterministically.*
- **US-007.** *As a Contracts Officer, I want the actor identity used for foundation lifecycle actions to be consumed read-only from `ENG-001`, so that identity, authentication, and permissions remain owned by MOD-001 while AMC captures the master relationships.*
- **US-008.** *As a downstream subscriber (Field Service, Accounting, Analytics), I want `ContractSigned` to be published when a Contract transitions to `signed`, so that downstream modules can react without polling AMC state.*
- **US-009.** *As a security reviewer, I want every AMC-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct Contract, Entitlement, Coverage, and configuration history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Contract master (US-001)

- **Given** a valid Contract creation request under a tenant/company referencing an active CRM-owned Customer in the same company,
  **when** a Contracts Officer submits it,
  **then** the Contract is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** a Contract record whose coverage window is well-formed and whose numbering series is selected from an active series registered for the company,
  **when** the request is submitted,
  **then** the Contract is persisted deterministically and audited.
- **Given** an attempt to bind a Contract to an archived Customer, a Customer in a different company, or a non-existent Customer,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.2 Entitlement master (US-002)

- **Given** a valid Entitlement creation request under a tenant/company scoped to an active Contract in the same company,
  **when** a Contracts Officer submits it,
  **then** the Entitlement is persisted with a stable identifier, uniquely identified within the Contract scope, and audited.
- **Given** an attempt to create an Entitlement against a `terminated` Contract,
  **when** the request is submitted,
  **then** the request is rejected deterministically (foundation enforcement of the Module PRD §7 "Terminated contracts cannot accept new entitlements" rule against Sprint 1-owned state).

### 5.3 Coverage master (US-003)

- **Given** a valid Coverage creation request under a tenant/company,
  **when** a Contracts Officer submits it,
  **then** the Coverage is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to reference a Coverage from a Contract in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.4 Contract transaction lifecycle (US-004)

- **Given** a Contract in `draft`,
  **when** approvers complete the configured approval chain via `ENG-011`,
  **then** the Contract transitions to `signed` via `ENG-010`, a Contract document number is issued via `ENG-017`, `ContractSigned` is published via `ENG-024`, and the transition is audited via `ENG-004`.
- **Given** a Contract in `signed`,
  **when** its coverage window opens,
  **then** the Contract transitions to `active` deterministically, and the transition is audited.
- **Given** a Contract in `signed` or `active`,
  **when** a legitimate termination request is submitted and approved via `ENG-011`,
  **then** the Contract transitions to `terminated` via `ENG-010`, and the transition is audited.
- **Given** an attempt to transition a Contract along any path not declared by the lifecycle (e.g. `draft → active` directly, or `terminated → active`),
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.5 Numbering (US-005)

- **Given** a Contract transitioning to `signed`,
  **when** the transition executes,
  **then** a Contract document number is allocated via `ENG-017` from the numbering series selected on the Contract for that company; the allocated number is immutable thereafter.

### 5.6 AMC operations configuration (US-006)

- **Given** a company under an active tenant,
  **when** SLA definitions, escalation policies, and numbering series are registered,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a downstream sprint querying a configuration key registered by this sprint,
  **when** it queries the key by identifier,
  **then** it receives the deterministic value resolved for its (tenant, company) scope; **evaluation semantics** (SLA evaluation at run time, escalation-policy evaluation at breach time, numbering-series allocation at transaction time via `ENG-017`) beyond Contract issuance remain out of scope here and are delivered by later AMC sprints.

### 5.7 Identity consumption (US-007)

- **Given** any AMC-foundation lifecycle action,
  **when** it executes,
  **then** the actor identity is resolved read-only via `ENG-001`; no credentials are minted by AMC.

### 5.8 Event publication (US-008)

- **Given** a Contract transitioning to `signed`,
  **when** the transition completes,
  **then** `ContractSigned` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.

### 5.9 Audit integration (US-009)

- **Given** any AMC-foundation lifecycle transition (Contract / Entitlement / Coverage / configuration create, update, activate, deactivate, archive, and Contract state transition),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.10 Isolation invariants (`ADR-011`)

- **Given** any AMC-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.11 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Contract, Entitlement, or Coverage data,
  **when** it reads or reacts to these masters,
  **then** it does so exclusively through AMC-owned events (`ContractSigned` here; additional events in later sprints) and AMC read APIs. No downstream module creates an independent Contract, Entitlement, or Coverage master.
- **Given** any AMC code path that requires Customer data,
  **when** it needs the MOD-006 Customer,
  **then** it consumes it read-only from MOD-006; the Customer entity is not redefined here.
- **Given** any AMC code path that requires Identity data,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-011` — AMC.
- **Module PRD:** [`docs/20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Contract creation and management; Entitlement tracking; submodules Contracts, Entitlements), §3 (Service Manager, Contracts Officer, Field Coordinator; Sales, Finance; Customer), §5 (Contract, Entitlement, Coverage), §6 (Contract transaction), §7 (foundation invariants including "Terminated contracts cannot accept new entitlements"), §8 (`ContractSigned` published), §10 (SLA definitions, Escalation policies, Numbering series), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-011` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD006_CRM_BASELINE_v1`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) — Customer master consumed read-only for Contract counterparty.
- **Upstream sprint dependencies (per Sprint Plan §2):** None (AMC sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` and the frozen `MOD006_CRM_BASELINE_v1`.
- **Cross-module consumption (events only):** None in this sprint. Consumption of Field-Service–published events (`FieldVisitCompleted`), Service-Desk–published events (`ServiceTicketClosed`), and Sales-published events (`SalesInvoiceIssued`) is scoped to `SPR-MOD-011-002` and `SPR-MOD-011-003`.
- **Downstream sprints:** `SPR-MOD-011-002` (Preventive Visit Scheduling), `SPR-MOD-011-003` (Contract Billing & Renewals), `SPR-MOD-011-004` (AMC Analytics & Compliance) — per [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md).

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
| `ENG-001` Identity | Provides the Contracts-Officer / Service-Manager identity used for foundation lifecycle actions and read-only binding to Platform users. |
| `ENG-002` Authorization | Enforces authorization on AMC-foundation actions. |
| `ENG-003` Permission Management | Registers AMC-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every AMC-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves AMC operations configuration (SLA definitions, escalation policies, numbering series) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for Contract, Entitlement, and Coverage content where applicable. |
| `ENG-007` Document | Provides document classification for Contract artifacts. |
| `ENG-008` Attachment | Provides attachment binding for signed Contract agreements and schedules. |
| `ENG-010` Workflow | Enforces the Contract transaction lifecycle (draft → signed → active → terminated). |
| `ENG-011` Approval | Provides multi-step approval for Contract signing and termination. |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, uniqueness, same-company composition, terminated-blocks-new-entitlement) at capture time. |
| `ENG-017` Numbering | Allocates Contract document numbers at signing time from the numbering series selected on the Contract. |
| `ENG-024` Eventing | Publishes `ContractSigned` when a Contract transitions to `signed`. |
| `ENG-025` Notification | Emits notifications on Contract state transitions under the tenant's configured channels. |

AMC business semantics (Contract, Entitlement, Coverage, Contract transaction lifecycle, AMC configuration namespace, Contract ↔ Customer read-only binding) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every AMC-foundation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to AMC-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Contract | MOD-011 (this sprint) | Named contract scoped to a tenant/company, referencing a CRM-owned Customer read-only; carries coverage window and numbering-series selection; runs a lifecycle (draft → signed → active → terminated). |
| Entitlement | MOD-011 (this sprint) | Entitlement record scoped to a Contract under the same tenant/company. |
| Coverage | MOD-011 (this sprint) | Coverage-terms record scoped to a tenant/company, referenced by Contracts. |
| Contract ↔ Customer Binding | MOD-011 (this sprint) | Read-only reference from a Contract to an MOD-006-owned Customer within the same company. |
| AMC Configuration | MOD-011 (this sprint, configuration-scoped) | AMC operations configuration namespace per company resolved via `ENG-005` (SLA definitions, escalation policies, numbering series). |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Contracts**, zero or more **Coverage** records, and one **AMC configuration** namespace.
- A **Contract** references exactly one CRM-owned **Customer** within the same company, exactly one **Coverage** record within the same company, and exactly one selected numbering series active within the same company; a Contract owns zero or more **Entitlements**.
- An **Entitlement** is scoped to exactly one **Contract** within the same company; an Entitlement MUST NOT be created against a `terminated` Contract.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-011` per the AMC Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Customer** entity is owned by MOD-006 CRM and is consumed read-only; it is not an AMC-owned entity.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not an AMC-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as AMC-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`ContractSigned`** — published via `ENG-024` when a Contract transitions to `signed`. Per Sprint Plan §2 (`SPR-MOD-011-001`), this is the single domain event originated by this sprint. Additional AMC-lifecycle events (`VisitScheduled`, `ContractRenewed`, `ContractExpired`) are originated by later AMC sprints per Module PRD §8.

### 11.2 Consumed

Sprint 1 consumes **no cross-module domain events**. It consumes Platform Identity (`ENG-001`) read-only and MOD-006-owned Customer master read-only (for Contract ↔ Customer binding), which is engine-level and API-level consumption rather than a domain event subscription. Consumption of upstream domain events (`FieldVisitCompleted`, `ServiceTicketClosed`, `SalesInvoiceIssued`) is scoped to `SPR-MOD-011-002` and `SPR-MOD-011-003`.

Payload contracts for AMC events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every AMC-foundation read and write.
- [ ] Every AMC-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] AMC configuration namespace is initialized per company via `ENG-005` (SLA definitions, escalation policies, numbering series).
- [ ] The Contract transaction lifecycle (draft → signed → active → terminated) is enforced end-to-end via `ENG-010` and `ENG-011`.
- [ ] Contract document numbers are issued at signing via `ENG-017` from the numbering series selected on the Contract.
- [ ] `ContractSigned` is published via `ENG-024` on every Contract signing, exactly once.
- [ ] Notifications are emitted on Contract state transitions via `ENG-025`.
- [ ] Actor identity for foundation lifecycle actions is exercised end-to-end read-only against `ENG-001`; no credentials are minted by AMC.
- [ ] Contract ↔ Customer read-only reference is exercised end-to-end against the MOD-006 Customer read API; no Customer master is re-authored.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-011_SPRINT_PLAN.md` §2 (`SPR-MOD-011-001`):

- Contract, Entitlement, and Coverage records can be created, edited, and archived under a tenant/company.
- Contract transaction lifecycle (draft → signed → active → terminated) is enforced via `ENG-010` and `ENG-011`.
- Contract configuration (SLA definitions, escalation policies, numbering series) resolves deterministically through `ENG-005`.
- Document numbers issue through `ENG-017`.
- `ContractSigned` events are published via `ENG-024`.
- All state changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-011 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-011 depends on `MOD006_CRM_BASELINE_v1` being frozen and stable for read-only Customer consumption in Contract ↔ Customer binding.
  - **Impact:** Any drift in the CRM Customer read API would break Contract binding.
  - **Mitigation:** Consume the CRM Customer read API per its authoritative contract; escalate any change as a CRM defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Later AMC sprints (`SPR-MOD-011-002` … `SPR-MOD-011-004`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** AMC-owned entities (Contract, Entitlement, Coverage, Contract ↔ Customer binding, AMC configuration) MUST NOT be redefined by downstream modules; CRM Customer master (MOD-006) and financial postings (MOD-002) MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Contract / Entitlement / Coverage Master Authority convention (§1.1.1) and the AMC ↔ CRM / Accounting / Field Service / Service Desk / Platform boundary (§1.1.2, §1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-06
  - **Description:** AMC operations configuration registration is in scope here; **evaluation** semantics (SLA evaluation at run time, escalation-policy evaluation at breach time, numbering-series allocation beyond Contract issuance) are in scope of downstream AMC sprints.
  - **Impact:** Loose registration semantics would leak evaluation responsibilities into this sprint.
  - **Mitigation:** Register configuration deterministically via `ENG-005`; do not expose evaluation paths beyond Contract issuance in this sprint.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 1 publishes `ContractSigned`. Downstream AMC sprints declare additional events (`VisitScheduled`, `ContractRenewed`, `ContractExpired`) and consume cross-module events (`FieldVisitCompleted`, `ServiceTicketClosed`, `SalesInvoiceIssued`). Any event name not yet present in the authoritative event catalog at their authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint that publishes/consumes them, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** For `ContractSigned` — confirm event catalog registration before this sprint enters `In Progress`. For later events — handle in each downstream sprint's own §14. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Contract, Entitlement, and Coverage validation; Contract ↔ Customer binding invariants; AMC configuration resolution rules; numbering-series selection invariants; Contract lifecycle transition invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, actor identity resolution via `ENG-001`, CRM Customer read via MOD-006 read API, structural validation via `ENG-012`, attachment binding via `ENG-008`, workflow via `ENG-010`, approval via `ENG-011`, numbering allocation via `ENG-017`, event publication via `ENG-024`, notification emission via `ENG-025`.
- **Contract** — CRM Customer read API contract used by Contract binding; `ContractSigned` payload contract per the authoritative event catalog.
- **End-to-end (smoke)** — Contract creation → approval → signing → activation → termination, including document-number allocation, `ContractSigned` publication, and audit emission at each step; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, a CRM-Customer read-only fixture, and a Platform-Identity read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Contract, Entitlement, and Coverage lifecycles as small state machines so audit emission (§5.9) is trivially satisfiable at every transition.
- Consider validating tenancy and same-company invariants (Contract ↔ Customer binding, Coverage scope, Contract numbering-series selection, Entitlement ↔ Contract binding) at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating AMC configuration initialization with company activation events emitted by MOD-001 so the AMC configuration namespace is ready before the first Contract record.
- Consider registering SLA definitions, escalation policies, and numbering series upfront in this sprint (even though only downstream sprints exercise the full evaluation surface) so configuration readiness is deterministic.
- Consider a small Contract-Customer reconciliation surface keyed by (tenant, company, customer_id) so CRM Customer lifecycle changes propagate observably into Contract state without silent drift.
- Consider centralizing the `ContractSigned` publication path so downstream sprints that add fields to the payload (per the authoritative event catalog) touch a single emission point.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-011-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the AMC Foundation — Contract, Entitlement, and Coverage masters, Contract transaction lifecycle, AMC operations configuration, identity consumption, Customer consumption, `ContractSigned` publication, and audit (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-011 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the AMC Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates preventive scheduling, billing & renewals, analytics, MOD-006-owned entities, financial postings, identity/permissions, field-visit execution, service-desk closures, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-011-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-011-002` Preventive Visit Scheduling is the immediate successor per [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-011-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md)
- Precedent Foundation Sprint PRDs — [`../projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md`](../projects/SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md), [`../manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md`](../manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md), [`../payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md`](../payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
