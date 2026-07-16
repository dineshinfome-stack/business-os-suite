---
title: "SPR-MOD-013-003 — Maintenance, Transfer & Disposal"
summary: "Sprint PRD for the Maintenance, Transfer, and Disposal layer of MOD-013 Assets: Maintenance Order transaction lifecycle, calibration tracking, asset transfer between locations, and the Disposal transaction lifecycle. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-013-003"
parent_module: "MOD-013"
parent_sprint_plan: "MOD-013_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "15.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-017", "ENG-024", "ENG-025", "ENG-026"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "assets", "mod-013", "maintenance", "transfer", "disposal", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD013-003-20260716T022000Z-001"
parent_result_id: "GT003-MOD013-002-20260716T021000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-013-003 — Maintenance, Transfer & Disposal

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-013 Assets** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-013-003` (permanent) |
| Parent Module | `MOD-013` — Assets |
| Parent Sprint Plan | [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) |
| Upstream Sprints | [`SPR-MOD-013-001`](./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md), [`SPR-MOD-013-002`](./SPR-MOD-013-002-depreciation-methods-and-runs.md) |
| Downstream Sprint | `SPR-MOD-013-004` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Maintain** and **Transfer/Dispose** processes for BusinessOS Assets: the **Maintenance Order** transaction lifecycle with **calibration** tracking, **asset transfer** between locations, and the **Disposal** transaction lifecycle. This sprint completes the write-side surface of MOD-013 by finalizing the Asset lifecycle from active operation through end-of-life, publishing `AssetTransferred` and `AssetDisposed`, and consuming `MaintenanceCompleted` to close open Maintenance Orders. Assets Analytics & Compliance (`SPR-MOD-013-004`) consumes this sprint's outputs read-only.

> **Assets Ownership Convention (recapitulated).** MOD-013 Assets owns the business semantics of the Maintenance Order and Disposal transactions, the asset transfer transition, and calibration cadence configuration evaluation. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, document, attachment, workflow, approval, rules, scheduler, numbering, eventing, notification, import) but **MUST NOT** redefine Assets maintenance/transfer/disposal rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects of maintenance capitalization, transfers between accounts, and disposal remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines — no Assets sprint writes journal entries directly; MOD-002 consumes Assets-published events through its own posting-rule bindings.

#### 1.1.1 Maintenance Order Transaction Authority

The **Maintenance Order** transaction is authoritatively owned by MOD-013 Assets, in this sprint. Its lifecycle is enforced via `ENG-010` Workflow with multi-step approval via `ENG-011` Approval. Scheduled recurrence — where calibration cadence or preventive-maintenance policy triggers automatic Maintenance Order instantiation — is orchestrated via `ENG-014` Scheduler. Downstream sprints and modules consume Maintenance Order state exclusively through Assets-owned events and read APIs. No downstream module MAY author a parallel Maintenance Order entity or redefine its lifecycle.

#### 1.1.2 Disposal Transaction Authority

The **Disposal** transaction is authoritatively owned by MOD-013 Assets, in this sprint. Its lifecycle is enforced via `ENG-010` Workflow with multi-step approval via `ENG-011` Approval. Once a Disposal reaches `posted`, the **disposed-asset immutability rule** applies: the associated Asset MUST NOT be edited except via disposal reversal. This invariant is originating-owned here and evaluated via `ENG-012` Rules.

#### 1.1.3 Asset Transfer Authority

The **asset transfer** transition — a location change on an active Asset preserving Asset identity — is authoritatively owned by MOD-013 Assets, in this sprint. Transfers preserve Asset identifier, capitalization, and depreciation schedule; only Location association changes. Every transfer produces an `AssetTransferred` event via `ENG-024` and an audit record via `ENG-004`. Downstream modules MUST NOT reassign Location outside of an Assets-owned transfer.

#### 1.1.4 Calibration Tracking Authority

**Calibration cadence** is a configuration-scoped property resolved via `ENG-005` under the Assets operations configuration namespace established by `SPR-MOD-013-001`. **Calibration state** — the last completed calibration timestamp and next-due timestamp per Asset — is authoritatively owned by MOD-013 Assets. Calibration completion is closed through Maintenance Order completion (types classified as calibration) or through consumption of the `MaintenanceCompleted` event where the source system is external. Downstream sprints and modules consume calibration state read-only.

#### 1.1.5 Assets ↔ Platform, Accounting, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Assets consumes these read-only.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Assets sprint writes journal entries; the `AssetTransferred` and `AssetDisposed` events published here are the sole triggers consumed by MOD-002 posting-rule bindings for their respective phases.
- **MOD-017 Analytics** owns cross-module KPI definitions. Maintenance, transfer, and disposal operational reports are surfaced by `SPR-MOD-013-004`; cross-module KPIs are never redefined by MOD-013.
- **Upstream Sprints (`SPR-MOD-013-001`, `SPR-MOD-013-002`)** own the Asset, Asset Class, Location, Insurance Policy masters, the Capitalization transaction, the Depreciation Run transaction, and the per-Asset depreciation schedule. This sprint consumes those authorities read-only and does not redefine them.

Ownership boundaries SHALL NOT be redefined in downstream Assets Sprint PRDs.

#### 1.1.6 Disposed-Asset Immutability Enforcement

The disposed-asset immutability rule declared in the Sprint Plan (§2, `SPR-MOD-013-003`) is enforced end-to-end from this sprint onward: once a Disposal has reached `posted` for an Asset, the Asset MUST NOT be modified except via disposal reversal. This sprint provides the enforcement point via `ENG-012` Rules. Attempts to run Depreciation, register Maintenance, initiate Transfer, or amend Capitalization against a disposed Asset are rejected deterministically.

### 1.2 In Scope

- Maintenance Order transaction lifecycle (draft → submitted → approved → scheduled → in progress → completed → reversed) enforced through `ENG-010` Workflow with multi-step approvals via `ENG-011` Approval and document numbering via `ENG-017`.
- Scheduled preventive-maintenance and calibration recurrence orchestrated via `ENG-014` Scheduler under the tenant's configured cadence resolved via `ENG-005`.
- Calibration cadence configuration via `ENG-005` and calibration-state evaluation via `ENG-012` under the Assets operations configuration namespace initialized by `SPR-MOD-013-001`.
- Attachment of maintenance-related documents (work orders, service reports, calibration certificates) via `ENG-007` Document and `ENG-008` Attachment.
- Asset transfer transition between Locations on active Assets, preserving Asset identity, capitalization, and depreciation schedule.
- Disposal transaction lifecycle (draft → submitted → approved → posted → reversed) enforced through `ENG-010` Workflow with multi-step approvals via `ENG-011` Approval and document numbering via `ENG-017`.
- Enforcement of the **disposed-asset immutability rule** via `ENG-012` end-to-end.
- Enforcement of the **active-asset-only rule** (inherited from `SPR-MOD-013-002`) for maintenance, transfer, and disposal initiation — none may begin against archived, capitalization-reversed, or already-disposed Assets.
- `AssetTransferred` domain event published via `ENG-024` when an asset transfer completes.
- `AssetDisposed` domain event published via `ENG-024` when a Disposal reaches `posted`.
- `MaintenanceCompleted` event consumed via `ENG-024` to close matching open Maintenance Orders originated externally, under `ADR-011` isolation.
- Bulk-import surface for backfilling legacy maintenance history via `ENG-026` Import, under `ENG-002` Authorization and audited via `ENG-004`.
- Notification emission on Maintenance Order, transfer, and Disposal state transitions via `ENG-025` under the tenant's configured channels.
- Audit emission via `ENG-004` for every Maintenance Order state transition, calibration-state change, asset transfer, and Disposal state transition.
- Read-only consumption of Asset, Asset Class, Location, Insurance Policy, Capitalization, Depreciation Run, and depreciation-schedule state from `SPR-MOD-013-001` and `SPR-MOD-013-002` authorities.

### 1.3 Out of Scope

- Asset, Asset Class, Location, and Insurance Policy master authoring; Capitalization transaction lifecycle; asset register/hierarchy and componentization; Assets operations configuration namespace initialization — `SPR-MOD-013-001`.
- Depreciation method registration and evaluation; per-Asset depreciation schedule generation; Depreciation Run transaction lifecycle; scheduled periodic Depreciation Runs; `DepreciationPosted` publication; `AssetCapitalized` consumption for schedule seeding — `SPR-MOD-013-002`.
- Assets read model, operational reports, dashboards, exports, audit-readiness surface — `SPR-MOD-013-004`.
- Financial postings for maintenance capitalization, transfer, and disposal — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-013-003`, the following will exist:

- **Business capabilities.**
  - An Asset Manager can capture a Maintenance Order under a tenant/company against an active Asset and drive it through the lifecycle `draft → submitted → approved → scheduled → in progress → completed → reversed`, enforced via `ENG-010` Workflow with multi-step approvals via `ENG-011` Approval and document numbering via `ENG-017`.
  - Preventive-maintenance and calibration Maintenance Orders instantiate automatically via `ENG-014` Scheduler under the tenant's configured cadence resolved via `ENG-005`.
  - Calibration cadence resolves per Asset (and/or Asset Class) via `ENG-005`; calibration state (last completed / next due) evaluates deterministically via `ENG-012`.
  - Maintenance-related documents attach to Maintenance Orders via `ENG-007` Document and `ENG-008` Attachment.
  - An Asset Manager can transfer an active Asset between Locations under a tenant/company, preserving identity, capitalization, and depreciation schedule.
  - An Asset Manager can capture a Disposal under a tenant/company against an active Asset and drive it through the lifecycle `draft → submitted → approved → posted → reversed`, enforced via `ENG-010` and `ENG-011` with numbering via `ENG-017`.
  - The disposed-asset immutability rule is enforced end-to-end via `ENG-012` once a Disposal has reached `posted`.
  - The active-asset-only rule (inherited from `SPR-MOD-013-002`) is enforced via `ENG-012` at initiation of every maintenance, transfer, and disposal action.
  - A bulk-import surface backfills legacy maintenance history via `ENG-026` under `ENG-002` and is audited via `ENG-004`.
- **Domain events.**
  - `AssetTransferred` is published via `ENG-024` when an asset transfer completes. Payload contract is governed by the authoritative event catalog and not redefined here.
  - `AssetDisposed` is published via `ENG-024` when a Disposal reaches `posted`. Payload contract is governed by the authoritative event catalog and not redefined here.
  - `MaintenanceCompleted` is consumed via `ENG-024` to close matching open Maintenance Orders; the originating publication is not redefined here.
- **Configuration artifacts.** Calibration-cadence and preventive-maintenance-schedule configuration recorded through the Assets configuration namespace via `ENG-005`. No module-specific keys are registered outside Assets's own ownership boundary.
- **Audit artifacts.** An audit record exists for every Maintenance Order state transition, calibration-state change, asset transfer, and Disposal state transition, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Maintenance Order, transfer, and Disposal state transitions produce notifications via `ENG-025` under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-013-003`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-013 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Maintenance and calibration; Transfer and disposal; submodules Maintenance, Disposal | Maintenance Order lifecycle, calibration tracking, asset transfer transition, Disposal lifecycle |
| §3 Personas — Asset Manager, Maintenance Technician, Finance; Auditor | User stories (§4) |
| §4 Business Processes — Maintain; Transfer/Dispose | Maintenance Order lifecycle with scheduled recurrence; asset transfer transition; Disposal lifecycle |
| §6 Transactions — Maintenance Order; Disposal | Maintenance Order transaction lifecycle; Disposal transaction lifecycle |
| §7 Business Rules — disposed-asset immutability rule; active-asset-only rule (inherited enforcement) | Enforceable rules via `ENG-012` |
| §8 Integration Points — `AssetTransferred`, `AssetDisposed` (published); `MaintenanceCompleted` (consumed) | Publication and consumption via `ENG-024` |
| §10 Configuration — calibration cadence and preventive-maintenance schedules | Configuration via `ENG-005`; evaluation via `ENG-012` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Assets Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Maintenance and calibration (§2) | `SPR-MOD-013-003` |
| Transfer and disposal (§2) | `SPR-MOD-013-003` |

These allocations are unique; no other Assets sprint claims "Maintenance and calibration" or "Transfer and disposal" as its originating capability. The Maintenance Order and Disposal transactions (§6) are originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Maintenance and calibration* and *Transfer and disposal*, and submodules *Maintenance* and *Disposal* → this Sprint PRD → deliverables in §2 (Maintenance Order lifecycle, calibration tracking, asset transfer transition, Disposal lifecycle, `AssetTransferred`/`AssetDisposed` publication, `MaintenanceCompleted` consumption, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an Asset Manager, I want to capture a Maintenance Order (draft) under a company against an active Asset, so that maintenance intent is captured deterministically before approval.*
- **US-002.** *As an Asset Manager, I want to drive a Maintenance Order through its lifecycle (draft → submitted → approved → scheduled → in progress → completed → reversed) via workflow and multi-step approval, so that state transitions are governed deterministically.*
- **US-003.** *As an Asset Manager, I want preventive-maintenance and calibration Maintenance Orders to instantiate automatically via `ENG-014` under the tenant's configured cadence, so that recurring maintenance does not require manual triggering.*
- **US-004.** *As an Asset Manager, I want calibration cadence to be configurable per Asset (and/or Asset Class) via `ENG-005` and calibration state to be evaluated deterministically via `ENG-012`, so that calibration due-dates are reproducible and audit-traceable.*
- **US-005.** *As a Maintenance Technician, I want to attach service reports and calibration certificates to a Maintenance Order via `ENG-007` and `ENG-008`, so that maintenance evidence is preserved with the transaction.*
- **US-006.** *As an Asset Manager, I want to transfer an active Asset between Locations under a company, preserving its identifier, capitalization, and depreciation schedule, so that physical relocation is reflected without disturbing depreciation continuity.*
- **US-007.** *As an Asset Manager, I want to capture a Disposal (draft) against an active Asset and drive it through the lifecycle (draft → submitted → approved → posted → reversed) via workflow and multi-step approval, so that end-of-life transactions are governed deterministically.*
- **US-008.** *As an Asset Manager, I want an Asset to become immutable once its Disposal reaches `posted` (edit only via disposal reversal), so that disposed Assets cannot silently drift.*
- **US-009.** *As an Asset Manager, I want maintenance, transfer, and disposal actions to be legal only against active Assets, so that archived, capitalization-reversed, or already-disposed Assets do not participate in error.*
- **US-010.** *As a downstream subscriber (MOD-002 Accounting; Assets Analytics), I want `AssetTransferred` to be published when a transfer completes and `AssetDisposed` to be published when a Disposal reaches `posted`, so that downstream sprints and modules can react without polling Assets state.*
- **US-011.** *As an Asset Manager, I want externally originated `MaintenanceCompleted` events to close matching open Maintenance Orders, so that maintenance closure is consistent whether triggered internally or externally.*
- **US-012.** *As an operations lead, I want to bulk-import legacy maintenance history via `ENG-026`, so that historical maintenance state is available in the Assets read model.*
- **US-013.** *As a security reviewer, I want every Maintenance Order state transition, calibration-state change, asset transfer, and Disposal state transition to be audited via `ENG-004`, so that I can reconstruct maintenance, transfer, and disposal history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Maintenance Order capture (US-001)

- **Given** a valid Maintenance Order capture request under a tenant/company against an active Asset in the same company,
  **when** an Asset Manager submits it,
  **then** the Maintenance Order is persisted as `draft` with a stable identifier issued via `ENG-017`, and the creation is audited via `ENG-004`.
- **Given** an attempt to capture a Maintenance Order against an Asset that is not active (archived, capitalization-reversed, or already-disposed) or in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.2 Maintenance Order lifecycle (US-002)

- **Given** a Maintenance Order in `draft`,
  **when** it is submitted,
  **then** it transitions to `submitted` via `ENG-010`, and the transition is audited.
- **Given** a Maintenance Order in `submitted`,
  **when** the required approval chain completes via `ENG-011`,
  **then** it transitions to `approved` via `ENG-010`, and the transition is audited.
- **Given** a Maintenance Order in `approved`,
  **when** a schedule slot resolves via `ENG-014`,
  **then** it transitions to `scheduled` via `ENG-010`, and the transition is audited.
- **Given** a Maintenance Order in `scheduled`,
  **when** work commencement is confirmed,
  **then** it transitions to `in progress` via `ENG-010`, and the transition is audited.
- **Given** a Maintenance Order in `in progress`,
  **when** work completion is confirmed (internally or via a consumed `MaintenanceCompleted` event),
  **then** it transitions to `completed` via `ENG-010`, calibration state (where applicable) is updated via `ENG-012`, and the transition is audited.
- **Given** a Maintenance Order in `completed`,
  **when** a legitimate reversal request is submitted and approved via `ENG-011`,
  **then** it transitions to `reversed` via `ENG-010`, and the transition is audited.
- **Given** an attempt to transition a Maintenance Order along any path not declared by the lifecycle,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.3 Scheduled preventive maintenance and calibration (US-003)

- **Given** a tenant/company with a configured preventive-maintenance or calibration cadence resolved via `ENG-005` for an Asset (or its Asset Class),
  **when** the cadence fires via `ENG-014` Scheduler,
  **then** a Maintenance Order is instantiated in `draft` (or `scheduled` where policy permits) against the target Asset, and the instantiation is audited.
- **Given** two scheduled fires for the same (tenant, company, Asset, cadence period),
  **when** the second fire executes,
  **then** the second fire is idempotent — no duplicate Maintenance Order is created.

### 5.4 Calibration cadence and state (US-004)

- **Given** a calibration cadence registered for an Asset (or its Asset Class) via `ENG-005`,
  **when** calibration state is evaluated via `ENG-012`,
  **then** last-completed and next-due timestamps resolve deterministically from prior completed calibration Maintenance Orders and the registered cadence; identical inputs yield identical outputs.
- **Given** a calibration-classified Maintenance Order transitioning to `completed`,
  **when** the transition completes,
  **then** the Asset's last-completed calibration timestamp is updated, next-due is recomputed via `ENG-012`, and the state change is audited via `ENG-004`.

### 5.5 Maintenance attachments (US-005)

- **Given** a Maintenance Order under any pre-`completed` state,
  **when** a Maintenance Technician attaches a document via `ENG-007` / `ENG-008`,
  **then** the attachment is persisted against the Maintenance Order under the caller's tenant/company scope, and the attachment event is audited via `ENG-004`.

### 5.6 Asset transfer (US-006)

- **Given** a valid transfer request under a tenant/company from an active Asset's current Location to a target Location in the same company,
  **when** an Asset Manager submits it,
  **then** the Location association updates atomically, Asset identifier, capitalization, and depreciation schedule are unchanged, `AssetTransferred` is published via `ENG-024`, and the transition is audited via `ENG-004`.
- **Given** an attempt to transfer an Asset that is not active or to a Location in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.7 Disposal capture and lifecycle (US-007)

- **Given** a valid Disposal capture request under a tenant/company against an active Asset in the same company,
  **when** an Asset Manager submits it,
  **then** the Disposal is persisted as `draft` with a stable identifier issued via `ENG-017`, and the creation is audited via `ENG-004`.
- **Given** a Disposal in `draft`,
  **when** it is submitted,
  **then** it transitions to `submitted` via `ENG-010`, and the transition is audited.
- **Given** a Disposal in `submitted`,
  **when** the required approval chain completes via `ENG-011`,
  **then** it transitions to `approved` via `ENG-010`, and the transition is audited.
- **Given** a Disposal in `approved`,
  **when** posting completion is confirmed,
  **then** it transitions to `posted` via `ENG-010`, `AssetDisposed` is published via `ENG-024`, and the transition is audited.
- **Given** a Disposal in `posted`,
  **when** a legitimate reversal request is submitted and approved via `ENG-011`,
  **then** it transitions to `reversed` via `ENG-010`, and the transition is audited.
- **Given** an attempt to transition a Disposal along any path not declared by the lifecycle,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.8 Disposed-asset immutability (US-008)

- **Given** an Asset whose most recent Disposal is in `posted` and not `reversed`,
  **when** any edit request attempts to modify the Asset (Maintenance Order initiation, transfer, Depreciation Run inclusion, Capitalization amendment) other than via disposal reversal,
  **then** the request is rejected deterministically via `ENG-012` under the disposed-asset immutability rule.

### 5.9 Active-asset-only rule (US-009)

- **Given** any Maintenance Order capture, transfer initiation, or Disposal capture,
  **when** the request references an Asset that is not active,
  **then** the request is rejected deterministically via `ENG-012` under the active-asset-only rule.

### 5.10 Event publication (US-010)

- **Given** an asset transfer completion,
  **when** the transition completes,
  **then** `AssetTransferred` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.
- **Given** a Disposal transition to `posted`,
  **when** the transition completes,
  **then** `AssetDisposed` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.

### 5.11 MaintenanceCompleted consumption (US-011)

- **Given** an externally originated `MaintenanceCompleted` event whose payload references an open Maintenance Order in the caller's tenant/company scope,
  **when** it is consumed via `ENG-024`,
  **then** the matching Maintenance Order transitions to `completed` via `ENG-010`, calibration state (where applicable) is updated via `ENG-012`, and the transition is audited.
- **Given** a `MaintenanceCompleted` event with no matching open Maintenance Order or one whose scope crosses tenants,
  **when** it is consumed,
  **then** it is rejected deterministically under `ADR-011`.

### 5.12 Bulk import of legacy maintenance history (US-012)

- **Given** a bulk-import job for legacy maintenance history under a tenant/company via `ENG-026`,
  **when** an authorized operations lead executes it,
  **then** the job is authorized via `ENG-002`, each accepted row produces a Maintenance Order in a terminal state consistent with the import contract, and every accepted row is audited via `ENG-004`.

### 5.13 Audit integration (US-013)

- **Given** any Maintenance Order state transition, calibration-state change, asset transfer, or Disposal state transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.14 Isolation invariants (`ADR-011`)

- **Given** any Assets read or write in this sprint's scope,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.15 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Maintenance Order, asset-transfer, Disposal, or calibration state,
  **when** it reads or reacts to these entities,
  **then** it does so exclusively through Assets-owned events (`AssetTransferred`, `AssetDisposed`) and Assets read APIs. No downstream module authors a parallel Maintenance Order, transfer, or Disposal entity.
- **Given** any Assets code path requiring Asset, Asset Class, Location, Capitalization, Depreciation Run, or depreciation-schedule data,
  **when** it needs those masters/transactions,
  **then** it consumes them read-only from `SPR-MOD-013-001` and `SPR-MOD-013-002` authorities; they are not redefined here.
- **Given** any state change in this sprint that has ledger effects,
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through the published `AssetTransferred` / `AssetDisposed` events; no Assets code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-013` — Assets.
- **Module PRD:** [`docs/20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Maintenance and calibration; Transfer and disposal; submodules Maintenance, Disposal), §3 (Asset Manager, Maintenance Technician, Finance; Auditor), §4 (Maintain; Transfer/Dispose), §6 (Maintenance Order; Disposal transactions), §7 (disposed-asset immutability rule; active-asset-only rule enforcement), §8 (`AssetTransferred`, `AssetDisposed` published; `MaintenanceCompleted` consumed), §10 (calibration cadence and preventive-maintenance schedules), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-013` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (consumed indirectly via published `AssetTransferred` and `AssetDisposed`, not invoked from Assets).
- **Upstream sprint dependencies (per Sprint Plan §2):**
  - [`SPR-MOD-013-001`](./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md) — Asset, Asset Class, Location, Insurance Policy masters; Capitalization transaction lifecycle; Assets operations configuration namespace.
  - [`SPR-MOD-013-002`](./SPR-MOD-013-002-depreciation-methods-and-runs.md) — Depreciation Run transaction lifecycle; per-Asset depreciation schedule; capitalization-amount-immutability rule end-to-end enforcement.
- **Cross-module consumption (events only):** `MaintenanceCompleted` — consumed from external systems per the authoritative event catalog under `ADR-011` isolation.
- **Downstream sprints:** `SPR-MOD-013-004` (Assets Analytics & Compliance) — per [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.1 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Assets Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and the Sprint Plan §5 allocation for `SPR-MOD-013-003`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Maintenance Order, transfer, Disposal, calibration configuration, and bulk-import actions. |
| `ENG-004` Audit | Records every Maintenance Order state transition, calibration-state change, asset transfer, and Disposal state transition. |
| `ENG-005` Configuration | Resolves calibration cadence and preventive-maintenance-schedule configuration under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-007` Document | Materializes maintenance-related documents (work orders, service reports, calibration certificates). |
| `ENG-008` Attachment | Attaches supporting artifacts to Maintenance Orders. |
| `ENG-010` Workflow | Enforces the Maintenance Order and Disposal transaction lifecycles. |
| `ENG-011` Approval | Routes multi-step approvals for Maintenance Order submission/reversal and Disposal submission/reversal. |
| `ENG-012` Rules | Evaluates calibration state; enforces the disposed-asset immutability rule and the active-asset-only rule. |
| `ENG-014` Scheduler | Orchestrates scheduled preventive-maintenance and calibration Maintenance Order instantiation. |
| `ENG-017` Numbering | Issues document numbers for Maintenance Orders and Disposals. |
| `ENG-024` Eventing | Publishes `AssetTransferred` on transfer completion and `AssetDisposed` on Disposal → `posted`; consumes `MaintenanceCompleted` to close matching open Maintenance Orders. |
| `ENG-025` Notification | Emits notifications on Maintenance Order, transfer, and Disposal state transitions. |
| `ENG-026` Import | Ingests bulk backfill of legacy maintenance history under `ENG-002` and audited via `ENG-004`. |

Assets business semantics (Maintenance Order transaction lifecycle, Disposal transaction lifecycle, asset transfer transition, calibration cadence evaluation, disposed-asset immutability rule) are owned by this module and are not delegated to any engine.

`ENG-015` Voucher and `ENG-016` Posting are **not** consumed by this or any Assets sprint per Sprint Plan §5 — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by `AssetTransferred`, `AssetDisposed`, and other Assets-published events.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every read, write, and consumed event. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Maintenance Order, transfer, Disposal, calibration configuration, and bulk-import actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Maintenance Order | MOD-013 (this sprint) | Transaction scoped to a tenant/company against an active Asset; runs a lifecycle (draft → submitted → approved → scheduled → in progress → completed → reversed). |
| Calibration Cadence Registration | MOD-013 (this sprint, configuration-scoped) | Per-Asset or per-Asset-Class calibration cadence resolved via `ENG-005` and evaluated via `ENG-012`. |
| Preventive Maintenance Schedule Registration | MOD-013 (this sprint, configuration-scoped) | Per-Asset or per-Asset-Class preventive-maintenance cadence resolved via `ENG-005` and enforced via `ENG-014`. |
| Asset Transfer Record | MOD-013 (this sprint) | Immutable record of a Location change against an active Asset preserving Asset identifier, capitalization, and depreciation schedule. |
| Disposal | MOD-013 (this sprint) | Transaction scoped to a tenant/company against an active Asset; runs a lifecycle (draft → submitted → approved → posted → reversed). |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Maintenance Orders**, zero or more **Calibration Cadence Registrations**, zero or more **Preventive Maintenance Schedule Registrations**, zero or more **Asset Transfer Records**, and zero or more **Disposals**.
- A **Maintenance Order** references exactly one **Asset** (owned by `SPR-MOD-013-001`) in the same company; optionally references attachments produced via `ENG-007` / `ENG-008`.
- A **Calibration Cadence Registration** or **Preventive Maintenance Schedule Registration** binds to an **Asset** and/or an **Asset Class** (both owned by `SPR-MOD-013-001`) and a resolvable cadence identifier evaluated via `ENG-012` and enforced via `ENG-014`.
- An **Asset Transfer Record** references exactly one **Asset** and two **Locations** (source and target) in the same company (all owned by `SPR-MOD-013-001`).
- A **Disposal** references exactly one **Asset** in the same company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-013` per the Assets Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Asset**, **Asset Class**, **Location**, **Insurance Policy**, and **Capitalization** entities are owned by `SPR-MOD-013-001` and consumed read-only here; they are not redefined.
- The **Depreciation Run**, **Depreciation Schedule**, **Depreciation Method Registration**, and **Depreciation Run Cadence** entities are owned by `SPR-MOD-013-002` and consumed read-only here; they are not redefined.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Assets-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`AssetTransferred`** — published via `ENG-024` when an asset transfer completes. Per Sprint Plan §2 (`SPR-MOD-013-003`).
- **`AssetDisposed`** — published via `ENG-024` when a Disposal reaches `posted`. Per Sprint Plan §2 (`SPR-MOD-013-003`).

### 11.2 Consumed

- **`MaintenanceCompleted`** (external) — consumed via `ENG-024` under `ADR-011` isolation to close matching open Maintenance Orders. The originating publication is not redefined here.

Payload contracts for Assets events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every read, write, and consumed event.
- [ ] Maintenance Order transaction lifecycle (draft → submitted → approved → scheduled → in progress → completed → reversed) is enforced end-to-end via `ENG-010` with multi-step approvals via `ENG-011` and numbering via `ENG-017`.
- [ ] Scheduled preventive-maintenance and calibration Maintenance Orders execute via `ENG-014` under the tenant's configured cadence and are idempotent per (tenant, company, Asset, cadence period).
- [ ] Calibration cadence resolves deterministically via `ENG-005` and calibration state evaluates deterministically via `ENG-012`.
- [ ] Attachments persist against Maintenance Orders via `ENG-007` and `ENG-008`.
- [ ] Asset transfer preserves Asset identifier, capitalization, and depreciation schedule; only Location association changes.
- [ ] Disposal transaction lifecycle (draft → submitted → approved → posted → reversed) is enforced end-to-end via `ENG-010` with multi-step approvals via `ENG-011` and numbering via `ENG-017`.
- [ ] The disposed-asset immutability rule is enforced via `ENG-012` end-to-end once a Disposal has reached `posted`.
- [ ] The active-asset-only rule (inherited from `SPR-MOD-013-002`) is enforced via `ENG-012` at initiation of every maintenance, transfer, and disposal action.
- [ ] `AssetTransferred` is published via `ENG-024` on every transfer completion, exactly once.
- [ ] `AssetDisposed` is published via `ENG-024` on every Disposal → `posted`, exactly once.
- [ ] `MaintenanceCompleted` is consumed via `ENG-024` to close matching open Maintenance Orders, under `ADR-011` isolation.
- [ ] Bulk-import backfill of legacy maintenance history executes via `ENG-026` under `ENG-002` and is audited via `ENG-004`.
- [ ] Notifications are emitted on Maintenance Order, transfer, and Disposal state transitions via `ENG-025`.
- [ ] Every Maintenance Order state transition, calibration-state change, asset transfer, and Disposal state transition produces an audit record via `ENG-004`.
- [ ] No Assets code path writes to `ENG-015` Voucher or `ENG-016` Posting; ledger effects are consumed by MOD-002 exclusively via `AssetTransferred` and `AssetDisposed`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-013_SPRINT_PLAN.md` §2 (`SPR-MOD-013-003`):

- Maintenance Orders can be created, scheduled via `ENG-014`, approved via `ENG-011`, and completed against active assets.
- Calibration cadence and completion state are tracked deterministically via `ENG-005`/`ENG-012`.
- Asset transfers between locations preserve identity and audit trail via `ENG-004`.
- Disposal transaction lifecycle enforces the disposed-asset immutability rule (edit only via reversal) through `ENG-012`.
- `AssetTransferred`, `AssetDisposed` events publish via `ENG-024`; `MaintenanceCompleted` events are consumed to close open maintenance orders.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-013 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-013 depends on `MOD002_ACCOUNTING_BASELINE_v1` being frozen and stable, since ledger effects of transfer and disposal are produced by MOD-002 via posting-rule bindings triggered by `AssetTransferred` and `AssetDisposed`. Any drift in the MOD-002 event-binding contract would break maintenance/transfer/disposal posting.
  - **Impact:** Any drift in MOD-002 posting-rule bindings would decouple Assets state from ledger effects.
  - **Mitigation:** Consume MOD-002 posting bindings per their authoritative contract; escalate any change as an Accounting defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** This sprint depends on `SPR-MOD-013-001` and `SPR-MOD-013-002` being `Done`. Any drift in the Asset/Asset Class/Location/Insurance Policy master authorities, the Capitalization transaction, the Depreciation Run transaction, or the per-Asset depreciation schedule would invalidate this sprint's contract.
  - **Impact:** Sprint 3 cannot enter `In Progress` until Sprints 1 and 2 are `Done`.
  - **Mitigation:** Treat Sprints 1 and 2 outputs as frozen contracts; escalate any drift as an upstream defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** The successor sprint (`SPR-MOD-013-004`) is deferred; scope-creep back into this sprint would dilute the Maintenance/Transfer/Disposal slice.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Assets-owned entities (Maintenance Order, Calibration Cadence Registration, Preventive Maintenance Schedule Registration, Asset Transfer Record, Disposal) MUST NOT be redefined by downstream modules; MOD-002 financial postings and MOD-013 Sprint 1/2 masters/transactions MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Maintenance Order Transaction Authority (§1.1.1), the Disposal Transaction Authority (§1.1.2), the Asset Transfer Authority (§1.1.3), the Calibration Tracking Authority (§1.1.4), and the cross-module boundary (§1.1.5) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 3 publishes `AssetTransferred` and `AssetDisposed` and consumes `MaintenanceCompleted`. Any event name not yet present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If `AssetTransferred`, `AssetDisposed`, or `MaintenanceCompleted` is not registered before this sprint executes, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Confirm event catalog registration for `AssetTransferred`, `AssetDisposed`, and `MaintenanceCompleted` before this sprint enters `In Progress`. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Maintenance Order lifecycle transition invariants; Disposal lifecycle transition invariants; asset-transfer identity-preservation invariant; disposed-asset immutability invariant; active-asset-only invariant; calibration-state evaluation determinism (identical inputs → identical outputs); idempotent scheduled-fire invariant per (tenant, company, Asset, cadence period).
- **Integration** — configuration resolution via `ENG-005`; rule evaluation via `ENG-012`; workflow via `ENG-010`; approval routing via `ENG-011`; scheduler firing via `ENG-014`; numbering via `ENG-017`; document/attachment via `ENG-007`/`ENG-008`; event publication and consumption via `ENG-024`; audit emission via `ENG-004`; notification emission via `ENG-025`; import via `ENG-026`.
- **Contract** — `AssetTransferred` payload contract per the authoritative event catalog; `AssetDisposed` payload contract per the authoritative event catalog; `MaintenanceCompleted` consumption contract per the authoritative event catalog.
- **End-to-end (smoke)** — Maintenance Order draft → submitted → approved → scheduled → in progress → completed → reversed; scheduled preventive-maintenance and calibration fire including idempotency; asset transfer between two Locations; Disposal draft → submitted → approved → posted → reversed including `AssetDisposed` publication and audit at each step; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, calibration-cadence fixtures spanning class-scoped and asset-scoped registrations, a scheduled-fire idempotency fixture, and a bulk-import fixture for legacy maintenance backfill.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Maintenance Order and Disposal lifecycles as small state machines so audit emission (§5.13) is trivially satisfiable at every transition.
- Consider a shared `MaintenanceCompleted` reducer that internal completion and external event consumption both call, so calibration-state update semantics remain single-sourced.
- Consider an idempotent scheduled-fire handler keyed by (tenant, company, Asset, cadence period) so replays and retries never create duplicate Maintenance Orders.
- Consider modeling asset transfer as an append-only transfer record referencing source and target Locations, so identity and audit trail are trivially preserved.
- Consider enforcing the disposed-asset immutability rule and the active-asset-only rule at the earliest boundary (input validation layer) so downstream operations inherit the guarantee without additional code.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-013-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Maintain and Transfer/Dispose processes — Maintenance Order lifecycle with calibration tracking, asset transfer, and Disposal lifecycle, with `AssetTransferred` / `AssetDisposed` publication and `MaintenanceCompleted` consumption (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-013 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Assets Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates Sprint 1 masters/Capitalization, Sprint 2 depreciation, Sprint 4 analytics, MOD-002-owned ledger postings, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-013-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-013-004` Assets Analytics & Compliance is the immediate successor per [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-013-001`, `SPR-MOD-013-002`, and `SPR-MOD-013-003`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md`](./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md), [`./SPR-MOD-013-002-depreciation-methods-and-runs.md`](./SPR-MOD-013-002-depreciation-methods-and-runs.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
