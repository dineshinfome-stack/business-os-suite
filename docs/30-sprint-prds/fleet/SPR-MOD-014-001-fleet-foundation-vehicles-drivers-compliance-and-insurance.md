---
title: "SPR-MOD-014-001 — Fleet Foundation (Vehicles, Drivers, Compliance & Insurance)"
summary: "Sprint PRD for the foundational Fleet layer of MOD-014: Vehicle, Driver, and License master data; vehicle hierarchy; driver–license linkage; compliance and insurance coverage; expiry-window alerts; and Fleet operations configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals). Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-014-001"
parent_module: "MOD-014"
parent_sprint_plan: "MOD-014_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "16.0.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "fleet", "mod-014", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD014-001-20260716T027000Z-001"
parent_result_id: "GT002-MOD014-20260716T026000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-014-001 — Fleet Foundation (Vehicles, Drivers, Compliance & Insurance)

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-014 Fleet** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-014-001` (permanent) |
| Parent Module | `MOD-014` — Fleet |
| Parent Sprint Plan | [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-014-002` … `SPR-MOD-014-004` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Fleet Foundation** for BusinessOS: the Vehicle, Driver, and License master data; the vehicle hierarchy; the driver–license linkage; compliance and insurance coverage windows; expiry-window alerts published as `ComplianceExpiring`; and the Fleet operations configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals) resolved through `ENG-005`. This foundation is the substrate on which every subsequent Fleet sprint — Trip Planning & Execution, Fuel & Maintenance, and Fleet Analytics & Compliance — depends.

> **Fleet Ownership Convention.** The Fleet module owns the business semantics of the Vehicle, Driver, and License masters, the vehicle hierarchy, the driver–license linkage, compliance and insurance coverage windows, and the Fleet operations configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, document, attachment, workflow, approval, rules, scheduler, numbering, eventing, notification) but **MUST NOT** redefine Fleet business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects of fuel, maintenance, and disposal transactions remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines — no Fleet sprint writes journal entries directly; MOD-002 consumes Fleet-published events through its own posting-rule bindings.

#### 1.1.1 Vehicle, Driver, and License Master Authority

The **Vehicle**, **Driver**, and **License** masters are authoritatively owned by MOD-014 Fleet. No other module MAY create, edit, archive, or independently maintain a parallel Vehicle, Driver, or License master. Downstream sprints and modules consume these masters through Fleet-owned events and read APIs authored in this and later sprints; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 Compliance & Insurance Coverage Authority

**Compliance registrations** and **Insurance coverage** for a Vehicle are authoritatively owned by MOD-014 Fleet, in this sprint. Coverage windows, renewal terms, and reminder cadence are managed under a company through this sprint. Downstream sprints and modules consume compliance/insurance state exclusively via Fleet-published events (`ComplianceExpiring` here) and Fleet read APIs; they MUST NOT redefine compliance/insurance entities.

#### 1.1.3 Fleet ↔ Platform, Accounting, Field Service, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Fleet consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Fleet sprint writes journal entries; downstream sprints emit events that Accounting consumes, but never redefine posting logic.
- **MOD-012 Field Service** publishes `FieldTicketCreated`, consumed downstream (`SPR-MOD-014-002`) to seed trip candidates. Field-ticket authoring is not redefined here.
- **MOD-017 Analytics** owns cross-module KPI definitions. Fleet operational reports are surfaced by `SPR-MOD-014-004`; cross-module KPIs are never redefined by MOD-014.

Ownership boundaries SHALL NOT be redefined in downstream Fleet Sprint PRDs.

#### 1.1.4 Fleet Configuration Authority

Fleet operations configuration — **numbering series**, **compliance reminder windows**, **fuel norms per vehicle**, and **maintenance intervals** — is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline; numbering-series resolution executes through `ENG-017` at document issuance time. The evaluation semantics for fuel norms and maintenance intervals are consumed by downstream sprints (`SPR-MOD-014-003`) per the Sprint Plan capability allocation; this sprint registers those keys and resolves reminder-window semantics for compliance/insurance. No module-specific configuration keys are registered outside Fleet's own ownership boundary.

#### 1.1.5 Foundation Master Lifecycle Boundary

Fleet owns the lifecycle of every foundation master (Vehicle, Driver, License) and the compliance/insurance registration lifecycle. Downstream sprints (Trip Planning & Execution; Fuel & Maintenance; Analytics) consume these entities and states without redefining their lifecycles.

### 1.2 In Scope

- Vehicle master: create, edit, activate, deactivate, archive under a tenant/company; per-Vehicle attributes include class/category, parent-Vehicle binding for hierarchy, and current-Location assignment where used by downstream sprints; fuel-norm binding resolvable through `ENG-005`; maintenance-interval defaults resolvable through `ENG-005`.
- Driver master: create, edit, activate, deactivate, archive under a tenant/company.
- License master: create, edit, activate, deactivate, archive under a tenant/company; per-License validity window; Driver–License linkage under the same company.
- Vehicle hierarchy: parent/child relationships between Vehicles within the same company (e.g. tractor/trailer, cab/chassis) subject to acyclicity.
- Compliance registration per Vehicle: coverage window, renewal terms, and reminder cadence resolvable through `ENG-005` / evaluated on the `ENG-014` scheduler.
- Insurance coverage per Vehicle: coverage window and reminder cadence resolvable through `ENG-005` / evaluated on the `ENG-014` scheduler.
- License renewal reminders for Drivers: reminder cadence resolvable through `ENG-005` / evaluated on the `ENG-014` scheduler.
- Fleet operations configuration namespace initialized per company via `ENG-005`: numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals.
- Document numbers for foundation-scoped documents (registration certificates, insurance certificates, licenses) issued via `ENG-017` from the configured numbering series.
- `ComplianceExpiring` domain event published via `ENG-024` when a compliance or insurance coverage window enters the configured reminder window on the scheduler tick from `ENG-014`.
- Notification emission on approach of expiry (compliance, insurance, license) via `ENG-025` under the tenant's configured channels.
- Read-only consumption of Platform Identity (`ENG-001`) for the actor identity used in foundation lifecycle actions.
- Audit emission via `ENG-004` for every foundation lifecycle transition and every configuration registration.
- Attachment support for registration certificates, insurance certificates, and license documents via `ENG-008`.
- Document classification for Fleet foundation artifacts via `ENG-007`.
- Locale-scoped labels on foundation entities via `ENG-006` where applicable.
- Structural validation (required fields, referential integrity, uniqueness, same-company invariants, no-cycle Vehicle hierarchy, Driver–License same-company invariant, coverage-window validity) via `ENG-012` at capture time.

### 1.3 Out of Scope

- Route master; Trip Sheet transaction; driver/vehicle assignment; odometer capture; trip closure; consumption of `DeliveryDispatched` and `FieldTicketCreated`; `TripClosed` publication — `SPR-MOD-014-002`.
- Fuel Station master; Fuel Entry transaction; telematics reconciliation; Maintenance Order transaction; scheduled preventive maintenance; `FuelRecorded` and `MaintenanceCompleted` publication — `SPR-MOD-014-003`.
- Fleet read model, operational reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar), dashboards, exports, audit-readiness surface — `SPR-MOD-014-004`.
- Financial postings for fuel, maintenance, and disposal — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Field-ticket authoring and `FieldTicketCreated` publication — owned by MOD-012 Field Service.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-014-001`, the following will exist:

- **Business capabilities.**
  - A Fleet Manager can create, edit, activate, deactivate, and archive Vehicle, Driver, and License records under a tenant/company.
  - A Fleet Manager can compose a Vehicle hierarchy (parent/child bindings within the same company) subject to acyclicity.
  - A Fleet Manager can link a Driver to one or more Licenses within the same company; the Driver–License linkage is enforced deterministically via `ENG-012`.
  - A Fleet Manager can register compliance and insurance coverage for a Vehicle under a company; coverage windows and reminder cadence resolve deterministically via `ENG-005` and are evaluated on the `ENG-014` scheduler tick.
  - Foundation-scoped document numbers are issued deterministically at document issuance via `ENG-017` from the configured numbering series.
  - Fleet operations configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals) is registered and resolves deterministically per company through `ENG-005`.
  - Identity linkage for actor actions is consumed read-only from `ENG-001` — no credentials are minted.
- **Domain events.**
  - `ComplianceExpiring` is published via `ENG-024` when a compliance or insurance coverage window enters its configured reminder window on the `ENG-014` scheduler tick. Payload contract is governed by the authoritative event catalog and not redefined here.
- **Configuration artifacts.** Fleet configuration namespace initialized for each company via `ENG-005` (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals). No module-specific keys are registered outside Fleet's own ownership boundary.
- **Audit artifacts.** An audit record exists for every Fleet-foundation lifecycle transition and every configuration registration, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Approaching-expiry events on compliance, insurance, and license produce notifications via `ENG-025` under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-014-001`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-014 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Fleet primitives and personas | Vehicle / Driver / License masters and Fleet Ownership Convention |
| §2 Business Scope — Vehicle master and hierarchy; Driver and license management; Compliance and insurance; submodules Vehicles, Drivers, Compliance | Master data delivered here plus vehicle hierarchy, driver–license linkage, and compliance/insurance registration |
| §3 Personas — Fleet Manager, Dispatcher, Driver; Finance, Maintenance; Regulator, Insurer | User stories (§4) |
| §5 Master Data — Vehicle, Driver, License | All three masters delivered in this sprint |
| §7 Business Rules — vehicles with expired critical compliance cannot be assigned to trips (originating-owned here; end-to-end enforcement continues in `SPR-MOD-014-002`); foundation invariants (tenancy, referential integrity, same-company composition, no-cycle hierarchy) | Enforceable rules via `ENG-012` |
| §8 Integration Points — `ComplianceExpiring` (published) | `ComplianceExpiring` publication via `ENG-024` |
| §10 Configuration — numbering series; compliance reminder windows; fuel norms per vehicle; maintenance intervals | Fleet configuration namespace via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Fleet Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Vehicle master and hierarchy (§2) | `SPR-MOD-014-001` |
| Driver and license management (§2) | `SPR-MOD-014-001` |
| Compliance and insurance (§2) | `SPR-MOD-014-001` |

These allocations are unique; no other Fleet sprint claims "Vehicle master and hierarchy", "Driver and license management", or "Compliance and insurance" as its originating capability. Master-data entities Vehicle, Driver, and License are each originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Vehicle master and hierarchy*, *Driver and license management*, *Compliance and insurance* and submodules *Vehicles*, *Drivers*, *Compliance* → this Sprint PRD → deliverables in §2 (Vehicle, Driver, License masters, vehicle hierarchy, driver–license linkage, compliance/insurance registration, Fleet configuration namespace, `ComplianceExpiring` publication, notifications on approach of expiry, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Fleet Manager, I want to create, edit, activate, deactivate, and archive Vehicles under a company (including class/category, parent-Vehicle binding for hierarchy, and current-Location assignment where used downstream), so that a coherent Vehicle register exists before any trip, fuel, maintenance, or compliance operation.*
- **US-002.** *As a Fleet Manager, I want to create, edit, activate, deactivate, and archive Drivers under a company, so that Driver-driven behavior in later sprints references an authoritative catalog.*
- **US-003.** *As a Fleet Manager, I want to create, edit, activate, deactivate, and archive Licenses under a company (including validity window), and link each Driver to one or more Licenses in the same company, so that Driver–License linkage is deterministic and audit-traceable.*
- **US-004.** *As a Fleet Manager, I want to register compliance and insurance coverage for a Vehicle under a company (including coverage window and reminder cadence resolved via `ENG-005`), so that expiry management is deterministic and reminder cadence is auditable.*
- **US-005.** *As a Fleet Manager, I want the Vehicle hierarchy (parent/child) to be acyclic within the same company, so that the register cannot form cycles under concurrent edits.*
- **US-006.** *As a Fleet Manager, I want to register Fleet operations configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals) per company, so that Vehicle/Driver/License capture and downstream operations resolve their configuration deterministically.*
- **US-007.** *As a Fleet Manager, I want document numbers for foundation-scoped documents to be issued at document issuance via the configured numbering series, so that foundation-document identity is stable and audit-traceable.*
- **US-008.** *As a Fleet Manager, I want the actor identity used for foundation lifecycle actions to be consumed read-only from `ENG-001`, so that identity, authentication, and permissions remain owned by MOD-001 while Fleet captures the master relationships.*
- **US-009.** *As a downstream subscriber (Trip Planning & Execution, Fuel & Maintenance, Analytics, and cross-module consumers), I want `ComplianceExpiring` to be published when a compliance or insurance coverage window enters its configured reminder window, so that downstream sprints and modules can react without polling Fleet state.*
- **US-010.** *As a Fleet Manager, I want notifications on approach of expiry (compliance, insurance, license) under the tenant's configured channels, so that renewal cadence is actionable.*
- **US-011.** *As a security reviewer, I want every Fleet-foundation lifecycle transition and every configuration registration to be audited via `ENG-004`, so that I can reconstruct Vehicle, Driver, License, compliance, insurance, and configuration history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Vehicle master (US-001)

- **Given** a valid Vehicle creation request under a tenant/company (including class/category, and optionally a parent-Vehicle binding in the same company),
  **when** a Fleet Manager submits it,
  **then** the Vehicle is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to bind a Vehicle to a parent Vehicle in a different company, or a parent Vehicle that would introduce a cycle in the hierarchy,
  **when** the request is submitted,
  **then** the request is rejected deterministically via `ENG-012`.

### 5.2 Driver master (US-002)

- **Given** a valid Driver creation request under a tenant/company,
  **when** a Fleet Manager submits it,
  **then** the Driver is persisted with a stable identifier, uniquely identified within the company, and audited.

### 5.3 License master and Driver–License linkage (US-003)

- **Given** a valid License creation request under a tenant/company (including validity window),
  **when** a Fleet Manager submits it,
  **then** the License is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to link a Driver to a License in a different company, or to a License whose validity window is inconsistent (start after end),
  **when** the request is submitted,
  **then** the request is rejected deterministically via `ENG-012`.

### 5.4 Compliance & Insurance registration (US-004)

- **Given** a valid compliance or insurance registration for an active Vehicle under a company (including coverage window and reminder cadence),
  **when** a Fleet Manager submits it,
  **then** the registration is persisted, its reminder cadence resolves via `ENG-005`, and the transition is audited.
- **Given** an attempt to register compliance or insurance against a Vehicle in a different company, or with an invalid coverage window,
  **when** the request is submitted,
  **then** the request is rejected deterministically via `ENG-012`.

### 5.5 Vehicle hierarchy acyclicity (US-005)

- **Given** any Vehicle-hierarchy create or update request,
  **when** the request would introduce a cycle in the parent/child graph within the same company,
  **then** it is rejected deterministically via `ENG-012`.

### 5.6 Fleet operations configuration (US-006)

- **Given** a company under an active tenant,
  **when** numbering series, compliance reminder windows, fuel norms per vehicle, and maintenance intervals are registered,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a downstream sprint querying a configuration key registered by this sprint,
  **when** it queries the key by identifier,
  **then** it receives the deterministic value resolved for its (tenant, company) scope; **evaluation** semantics for fuel norms and maintenance intervals are out of scope here and are delivered by `SPR-MOD-014-003` per §1.1.4.

### 5.7 Numbering (US-007)

- **Given** issuance of a foundation-scoped document (registration certificate, insurance certificate, license) under a company,
  **when** issuance executes,
  **then** a document number is allocated via `ENG-017` from the configured numbering series for that company; the allocated number is immutable thereafter.

### 5.8 Identity consumption (US-008)

- **Given** any Fleet-foundation lifecycle action,
  **when** it executes,
  **then** the actor identity is resolved read-only via `ENG-001`; no credentials are minted by Fleet.

### 5.9 `ComplianceExpiring` publication (US-009)

- **Given** an active compliance or insurance coverage window under a company,
  **when** the scheduler tick from `ENG-014` observes that the window has entered its configured reminder window resolved via `ENG-005`,
  **then** `ComplianceExpiring` is published via `ENG-024` exactly once per (Vehicle, coverage instance, reminder threshold), using the authoritative envelope and payload contract governed by the event catalog.

### 5.10 Notifications (US-010)

- **Given** an approach-of-expiry event for a compliance registration, insurance coverage, or Driver License,
  **when** the reminder threshold is met on the `ENG-014` tick,
  **then** a notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.11 Audit integration (US-011)

- **Given** any Fleet-foundation lifecycle transition (Vehicle / Driver / License / compliance registration / insurance registration / configuration create, update, activate, deactivate, archive),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any Fleet-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.13 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Vehicle, Driver, License, compliance, or insurance data,
  **when** it reads or reacts to these masters/registrations,
  **then** it does so exclusively through Fleet-owned events (`ComplianceExpiring` here; additional events in later sprints) and Fleet read APIs. No downstream module creates an independent Vehicle, Driver, License, compliance, or insurance master.
- **Given** any Fleet code path that requires Identity data,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.
- **Given** any Fleet transaction (in later sprints) that has ledger effects,
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through the corresponding Fleet-published events; no Fleet code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-014` — Fleet.
- **Module PRD:** [`docs/20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Vehicle master and hierarchy; Driver and license management; Compliance and insurance; submodules Vehicles, Drivers, Compliance), §3 (Fleet Manager, Dispatcher, Driver; Finance, Maintenance; Regulator, Insurer), §5 (Vehicle, Driver, License), §7 (expired-compliance rule originating-owned here; foundation invariants), §8 (`ComplianceExpiring` published), §10 (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-014` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (consumed indirectly by later Fleet sprints via published events; not invoked from this sprint).
- **Upstream sprint dependencies (per Sprint Plan §2):** None (Fleet sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` and `MOD002_ACCOUNTING_BASELINE_v1`.
- **Downstream sprints:** `SPR-MOD-014-002` (Trip Planning & Execution), `SPR-MOD-014-003` (Fuel & Maintenance), `SPR-MOD-014-004` (Fleet Analytics & Compliance) — per [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.1 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Fleet Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the Fleet Manager / Dispatcher / Driver / Finance / Maintenance identity used for foundation lifecycle actions and read-only binding to Platform users. |
| `ENG-002` Authorization | Enforces authorization on Fleet-foundation actions. |
| `ENG-003` Permission Management | Registers Fleet-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every Fleet-foundation lifecycle transition and every configuration registration. |
| `ENG-005` Configuration | Resolves Fleet operations configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for Vehicle, Driver, License, compliance, and insurance content where applicable. |
| `ENG-007` Document | Provides document classification for foundation-scoped documents (registration certificates, insurance certificates, licenses). |
| `ENG-008` Attachment | Provides attachment binding for foundation-scoped documents. |
| `ENG-010` Workflow | Enforces the compliance/insurance registration lifecycle where a long-running workflow is required. |
| `ENG-011` Approval | Routes multi-step approvals where required for compliance/insurance registration or renewal. |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, uniqueness, same-company composition, no-cycle Vehicle hierarchy, Driver–License same-company invariant, coverage-window validity) at capture time, and the expired-compliance rule end-to-end from `SPR-MOD-014-002` onward. |
| `ENG-014` Scheduler | Evaluates compliance, insurance, and license reminder cadences and triggers `ComplianceExpiring` publication when a coverage window enters its configured reminder window. |
| `ENG-017` Numbering | Allocates foundation-scoped document numbers at issuance time from the configured numbering series. |
| `ENG-024` Eventing | Publishes `ComplianceExpiring` on approach of expiry. |
| `ENG-025` Notification | Emits notifications on approach of expiry (compliance, insurance, license) under the tenant's configured channels. |

Fleet business semantics (Vehicle, Driver, License, vehicle hierarchy, Driver–License linkage, compliance and insurance registration, Fleet configuration namespace) are owned by this module and are not delegated to any engine.

`ENG-015` Voucher and `ENG-016` Posting are **not** consumed by this or any Fleet sprint per Sprint Plan §5 — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by Fleet-published events in later sprints.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Fleet-foundation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Fleet-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Vehicle | MOD-014 (this sprint) | Named vehicle scoped to a tenant/company, optionally referencing exactly one parent Vehicle for hierarchy, and zero or more compliance registrations and insurance coverages within the same company. |
| Driver | MOD-014 (this sprint) | Named driver scoped to a tenant/company, referencing zero or more Licenses within the same company. |
| License | MOD-014 (this sprint) | Driver license record scoped to a tenant/company, carrying a validity window; referenced by zero or more Drivers within the same company. |
| Compliance Registration | MOD-014 (this sprint) | Compliance coverage record scoped to a tenant/company, referencing exactly one Vehicle in the same company; carries coverage window and reminder cadence. |
| Insurance Coverage | MOD-014 (this sprint) | Insurance coverage record scoped to a tenant/company, referencing exactly one Vehicle in the same company; carries coverage window and reminder cadence. |
| Fleet Configuration | MOD-014 (this sprint, configuration-scoped) | Fleet operations configuration namespace per company resolved via `ENG-005` (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals). |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Vehicles**, zero or more **Drivers**, zero or more **Licenses**, zero or more **Compliance Registrations**, zero or more **Insurance Coverages**, and one **Fleet configuration** namespace.
- A **Vehicle** optionally references exactly one parent **Vehicle** within the same company; the parent/child graph MUST be acyclic; each Vehicle has at most one parent.
- A **Driver** references zero or more **Licenses** within the same company.
- A **Compliance Registration** and an **Insurance Coverage** each reference exactly one **Vehicle** within the same company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-014` per the Fleet Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Fleet-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Fleet-owned entities.
- The **Field Ticket** entity is owned by MOD-012 Field Service; it is consumed downstream (`SPR-MOD-014-002`) and is not a Fleet-owned entity.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`ComplianceExpiring`** — published via `ENG-024` when a compliance or insurance coverage window enters its configured reminder window on the `ENG-014` scheduler tick. Per Sprint Plan §2 (`SPR-MOD-014-001`), this is the single domain event originated by this sprint. Additional Fleet-lifecycle events (`TripClosed`, `FuelRecorded`, `MaintenanceCompleted`) are originated by later Fleet sprints per Module PRD §8.

### 11.2 Consumed

None in this sprint. Consumption of `DeliveryDispatched` and `FieldTicketCreated` is scoped to `SPR-MOD-014-002` and does not occur here.

Payload contracts for Fleet events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Fleet-foundation read and write.
- [ ] Every Fleet-foundation lifecycle transition and every configuration registration produces an audit record via `ENG-004`.
- [ ] Fleet configuration namespace is initialized per company via `ENG-005` (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals).
- [ ] Vehicle hierarchy acyclicity and Driver–License same-company invariants are enforced via `ENG-012` at capture time.
- [ ] Foundation-scoped document numbers are issued at document issuance via `ENG-017` from the configured numbering series.
- [ ] `ComplianceExpiring` is published via `ENG-024` on every scheduler tick that observes a coverage window entering its configured reminder window, exactly once per (Vehicle, coverage instance, reminder threshold).
- [ ] Notifications are emitted via `ENG-025` on approach of expiry (compliance, insurance, license) under the tenant's configured channels.
- [ ] Actor identity for foundation lifecycle actions is exercised end-to-end read-only against `ENG-001`; no credentials are minted by Fleet.
- [ ] No Fleet code path writes to `ENG-015` Voucher or `ENG-016` Posting.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-014_SPRINT_PLAN.md` §2 (`SPR-MOD-014-001`):

- Vehicle, Driver, and License records can be created, edited, and archived under a tenant/company.
- Driver–License linkage is enforced deterministically via `ENG-012`.
- Compliance and insurance coverage windows are tracked; reminder cadence resolves via `ENG-005`/`ENG-014`.
- `ComplianceExpiring` events are published via `ENG-024` within the configured window.
- Document numbers issue through `ENG-017`.
- All state changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-014 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-014 depends on `MOD002_ACCOUNTING_BASELINE_v1` being frozen and stable. Although this sprint does not itself invoke posting, later Fleet sprints depend on MOD-002's event-binding contract for fuel, maintenance, and disposal effects.
  - **Impact:** Any drift in MOD-002 posting-rule bindings would decouple later Fleet events from ledger effects.
  - **Mitigation:** Consume MOD-002 posting bindings per their authoritative contract in later sprints; escalate any change as an Accounting defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Later Fleet sprints (`SPR-MOD-014-002` … `SPR-MOD-014-004`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Fleet-owned entities (Vehicle, Driver, License, compliance registration, insurance coverage, Fleet configuration) MUST NOT be redefined by downstream modules; MOD-012-owned Field Ticket and MOD-002 financial postings MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Vehicle / Driver / License Master Authority convention (§1.1.1), the Compliance & Insurance Coverage Authority (§1.1.2), and the cross-module boundary (§1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-06
  - **Description:** Fleet operations configuration registration is in scope here for numbering series, compliance reminder windows, fuel norms per vehicle, and maintenance intervals; **evaluation** semantics for fuel norms and maintenance intervals are in scope of `SPR-MOD-014-003`.
  - **Impact:** Loose registration semantics would leak evaluation responsibilities into this sprint.
  - **Mitigation:** Register only the numbering-series, compliance-reminder-window, fuel-norm-key, and maintenance-interval-key configuration via `ENG-005` in this sprint; do not expose evaluation paths for fuel-norm or maintenance-interval semantics here.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 1 publishes `ComplianceExpiring`. Downstream Fleet sprints declare additional published events (`TripClosed`, `FuelRecorded`, `MaintenanceCompleted`) and consume `DeliveryDispatched` and `FieldTicketCreated`. Any event name not yet present in the authoritative event catalog at their authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint that publishes/consumes them, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** For `ComplianceExpiring` — confirm event catalog registration before this sprint enters `In Progress`. For later events — handle in each downstream sprint's own §14. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Vehicle, Driver, License, compliance-registration, insurance-coverage, and Fleet-configuration validation; Vehicle hierarchy acyclicity; Driver–License same-company invariants; coverage-window validity; reminder-cadence resolution invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, actor identity resolution via `ENG-001`, structural validation via `ENG-012`, attachment binding via `ENG-008`, workflow via `ENG-010`, approval routing via `ENG-011`, scheduler evaluation via `ENG-014`, numbering allocation via `ENG-017`, event publication via `ENG-024`, notification emission via `ENG-025`.
- **Contract** — `ComplianceExpiring` payload contract per the authoritative event catalog.
- **End-to-end (smoke)** — Vehicle creation → parent-Vehicle binding → compliance/insurance registration → scheduler tick approaching expiry → `ComplianceExpiring` publication → notification emission, with audit records at each step; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, a scheduler-tick fixture that advances the `ENG-014` clock into the configured reminder window, and a Platform-Identity read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Vehicle, Driver, License, compliance-registration, and insurance-coverage lifecycles as small state machines so audit emission (§5.11) is trivially satisfiable at every transition.
- Consider validating tenancy and same-company invariants (Vehicle ↔ parent-Vehicle, Driver ↔ License, Compliance/Insurance ↔ Vehicle) at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating Fleet configuration initialization with company activation events emitted by MOD-001 so the Fleet configuration namespace is ready before the first Vehicle record.
- Consider centralizing the `ComplianceExpiring` publication path so downstream sprints that add fields to the payload (per the authoritative event catalog) touch a single emission point.
- Consider a small idempotent scheduler-handler keyed by (tenant, company, coverage_instance_id, reminder_threshold) so repeated `ENG-014` ticks do not emit duplicate `ComplianceExpiring` events.
- Consider enforcing the no-cycle Vehicle-hierarchy invariant in a dedicated rule evaluated at Vehicle create/update time via `ENG-012` to keep hierarchy operations deterministic under concurrent edits.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-014-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Fleet Foundation — Vehicle, Driver, and License masters, vehicle hierarchy, Driver–License linkage, compliance and insurance registration, Fleet operations configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals), identity consumption, `ComplianceExpiring` publication, and audit (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-014 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Fleet Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates trip planning/execution, fuel/maintenance, analytics, MOD-002-owned ledger postings, MOD-012-owned Field Ticket authoring, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-014-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-014-002` Trip Planning & Execution is the immediate successor per [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-014-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Precedent Foundation Sprint PRDs — [`../assets/SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md`](../assets/SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md), [`../field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md`](../field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md), [`../amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md`](../amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
