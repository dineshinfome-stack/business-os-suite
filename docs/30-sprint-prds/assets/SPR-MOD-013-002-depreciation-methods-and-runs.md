---
title: "SPR-MOD-013-002 — Depreciation (Methods & Runs)"
summary: "Sprint PRD for the Depreciation layer of MOD-013 Assets: depreciation methods per class, depreciation schedule generation, and the Depreciation Run transaction lifecycle including scheduled periodic runs. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-013-002"
parent_module: "MOD-013"
parent_sprint_plan: "MOD-013_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "15.0.2"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "assets", "mod-013", "depreciation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD013-002-20260716T021000Z-001"
parent_result_id: "GT003-MOD013-001-20260716T020000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-013-002 — Depreciation (Methods & Runs)

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-013 Assets** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-013-002` (permanent) |
| Parent Module | `MOD-013` — Assets |
| Parent Sprint Plan | [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) |
| Upstream Sprint | [`SPR-MOD-013-001`](./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md) |
| Downstream Sprints | `SPR-MOD-013-003` … `SPR-MOD-013-004` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Capitalize-to-depreciate** process for BusinessOS Assets: registration and evaluation of **depreciation methods** per Asset Class, deterministic generation of per-Asset **depreciation schedules**, and the **Depreciation Run** transaction lifecycle (draft → submitted → approved → posted → reversed), including **scheduled periodic runs** executed via `ENG-014`. This sprint is the substrate on which subsequent Assets sprints — Maintenance/Transfer/Disposal and Assets Analytics & Compliance — depend for depreciation-derived state and events.

> **Assets Ownership Convention (recapitulated).** MOD-013 Assets owns the business semantics of the Depreciation Run transaction, the per-Asset depreciation schedule, and the depreciation-methods-per-class configuration evaluation. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, workflow, approval, rules, scheduler, eventing, notification) but **MUST NOT** redefine Assets depreciation rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects of depreciation remain exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines — no Assets sprint writes journal entries directly; MOD-002 consumes Assets-published events through its own posting-rule bindings.

#### 1.1.1 Depreciation Run Transaction Authority

The **Depreciation Run** transaction is authoritatively owned by MOD-013 Assets, in this sprint. Its lifecycle is enforced via `ENG-010` Workflow and multi-step approval via `ENG-011` Approval. Downstream sprints and modules consume Depreciation Run state; only the transitions declared in this lifecycle are legal. No downstream module MAY author a parallel Depreciation Run entity or redefine its lifecycle.

#### 1.1.2 Depreciation Schedule Authority

The **per-Asset depreciation schedule** is authoritatively owned by MOD-013 Assets, in this sprint. Schedules are generated deterministically from the Asset's Capitalization (owned by `SPR-MOD-013-001`) and the depreciation method resolved for its Asset Class through `ENG-005` and evaluated via `ENG-012`. Once a Depreciation Run has executed against a schedule, the schedule becomes locked with respect to the periods covered by that run; earlier periods MUST NOT be re-generated except via reversal.

#### 1.1.3 Depreciation Method Evaluation Authority

Registration of depreciation methods per Asset Class is a **configuration** activity resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline. **Evaluation** semantics — how a registered method resolves an Asset's periodic depreciation amount given its capitalization amount, useful life, salvage value, and start date — are authoritatively owned here and executed via `ENG-012` Rules. Downstream sprints consume schedules and Depreciation Run outputs but MUST NOT re-implement method evaluation.

#### 1.1.4 Assets ↔ Platform, Accounting, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Assets consumes these read-only.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Assets sprint writes journal entries; the `DepreciationPosted` event published here is the sole depreciation-phase trigger consumed by MOD-002 posting-rule bindings.
- **MOD-017 Analytics** owns cross-module KPI definitions. Depreciation-related operational reports are surfaced by `SPR-MOD-013-004`; cross-module KPIs are never redefined by MOD-013.
- **Upstream Sprint 1 (`SPR-MOD-013-001`)** owns Asset, Asset Class, Location, Insurance Policy masters, the Capitalization transaction, and the Assets operations configuration namespace. This sprint consumes those authorities read-only and does not redefine them.

Ownership boundaries SHALL NOT be redefined in downstream Assets Sprint PRDs.

#### 1.1.5 Capitalization Immutability Enforcement

The capitalization-amount-immutability rule declared originating-owned in `SPR-MOD-013-001` §1.1.2 is enforced **end-to-end from this sprint onward**: once a Depreciation Run has been executed against an Asset's schedule, the Asset's Capitalization amount MUST NOT be modified except via reversal. This sprint provides the enforcement point via `ENG-012` Rules.

#### 1.1.6 Active-Asset-Only Rule

Depreciation Runs and periodic schedule accrual are permitted only against **active** Assets under the Assets Ownership Convention. Assets in `archived`, or those whose Capitalization has been `reversed`, or those subsequently `disposed` (in `SPR-MOD-013-003`), MUST NOT participate in a Depreciation Run. This invariant is originating-owned here and evaluated via `ENG-012` Rules.

### 1.2 In Scope

- Depreciation method registration per Asset Class via `ENG-005` under the Assets operations configuration namespace initialized by `SPR-MOD-013-001`.
- Deterministic evaluation of registered depreciation methods via `ENG-012` given an Asset's capitalization amount, useful life, salvage value, and start date.
- Per-Asset depreciation schedule generation triggered by an Asset's Capitalization reaching `capitalized` (via the consumed `AssetCapitalized` event) and by explicit re-generation requests where legal.
- Depreciation Run transaction lifecycle (draft → submitted → approved → posted → reversed), enforced through `ENG-010` Workflow with multi-step approvals routed through `ENG-011` Approval.
- Scheduled periodic Depreciation Runs orchestrated via `ENG-014` Scheduler under the tenant's configured cadence.
- `DepreciationPosted` domain event published via `ENG-024` when a Depreciation Run reaches `posted`.
- Notification emission on Depreciation Run state transitions via `ENG-025` under the tenant's configured channels.
- Audit emission via `ENG-004` for every Depreciation-method configuration change, schedule-generation event, and Depreciation Run state transition.
- Enforcement of the **capitalization-amount-immutability rule** (post-Depreciation-Run) via `ENG-012`.
- Enforcement of the **active-asset-only rule** via `ENG-012`.
- Read-only consumption of Asset, Asset Class, and Capitalization state from `SPR-MOD-013-001` authorities.
- Read-only consumption of the `AssetCapitalized` event to seed initial schedule generation.

### 1.3 Out of Scope

- Asset, Asset Class, Location, and Insurance Policy master authoring; Capitalization transaction lifecycle; asset register/hierarchy and componentization; Assets operations configuration namespace initialization — `SPR-MOD-013-001`.
- Maintenance Order transaction, calibration tracking, asset transfer between locations, Disposal transaction, `AssetTransferred` and `AssetDisposed` publication, `MaintenanceCompleted` consumption — `SPR-MOD-013-003`.
- Assets read model, operational reports, dashboards, exports, audit-readiness surface — `SPR-MOD-013-004`.
- Financial postings for capitalization, depreciation, and disposal — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-013-002`, the following will exist:

- **Business capabilities.**
  - An Asset Manager can register a depreciation method for an Asset Class under a tenant/company, resolvable via `ENG-005` and evaluable via `ENG-012`.
  - A per-Asset depreciation schedule is generated deterministically on Capitalization → `capitalized` (via consumed `AssetCapitalized`) and re-generation is legal only where invariants allow.
  - An Asset Manager can capture a Depreciation Run (draft) under a tenant/company covering a period across a set of active Assets, and drive it through the lifecycle `draft → submitted → approved → posted → reversed`, enforced via `ENG-010` Workflow with multi-step approvals via `ENG-011` Approval.
  - Scheduled periodic Depreciation Runs execute via `ENG-014` Scheduler under the tenant's configured cadence.
  - The capitalization-amount-immutability rule is enforced end-to-end via `ENG-012` once a Depreciation Run has been executed.
  - The active-asset-only rule is enforced via `ENG-012` for every Depreciation Run and schedule accrual.
- **Domain events.**
  - `DepreciationPosted` is published via `ENG-024` when a Depreciation Run reaches `posted`. Payload contract is governed by the authoritative event catalog and not redefined here.
  - `AssetCapitalized` is consumed via `ENG-024` to seed initial per-Asset schedule generation; the MOD-013 Sprint 1 originating publication is not redefined here.
- **Configuration artifacts.** Depreciation-method registrations per Asset Class recorded through the Assets configuration namespace via `ENG-005`. No module-specific keys are registered outside Assets's own ownership boundary.
- **Audit artifacts.** An audit record exists for every depreciation-method configuration change, schedule-generation event, and Depreciation Run lifecycle transition, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Notification artifacts.** Depreciation Run state transitions produce notifications via `ENG-025` under the tenant's configured channels.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-013-002`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-013 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Depreciation methods and schedules; submodule Depreciation | Depreciation method registration/evaluation, per-Asset schedule generation, and Depreciation Run lifecycle |
| §3 Personas — Asset Manager, Finance; Auditor | User stories (§4) |
| §4 Business Processes — Capitalize-to-depreciate | Depreciation Run lifecycle, scheduled periodic runs |
| §6 Transactions — Depreciation Run | Depreciation Run transaction lifecycle (draft → submitted → approved → posted → reversed) |
| §7 Business Rules — active-asset-only rule; capitalization-amount-immutability rule (end-to-end enforcement) | Enforceable rules via `ENG-012` |
| §8 Integration Points — `DepreciationPosted` (published); `AssetCapitalized` (consumed from Sprint 1) | `DepreciationPosted` publication and `AssetCapitalized` consumption via `ENG-024` |
| §10 Configuration — Depreciation methods per class | Depreciation-method registration via `ENG-005`; evaluation via `ENG-012` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Assets Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Depreciation methods and schedules (§2) | `SPR-MOD-013-002` |

This allocation is unique; no other Assets sprint claims "Depreciation methods and schedules" as its originating capability. The Depreciation Run transaction (§6) is originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Depreciation methods and schedules* and submodule *Depreciation* → this Sprint PRD → deliverables in §2 (depreciation-method registration and evaluation, per-Asset schedule generation, Depreciation Run transaction lifecycle, scheduled periodic runs, `DepreciationPosted` publication, `AssetCapitalized` consumption, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an Asset Manager, I want to register a depreciation method for an Asset Class under a company, so that class-driven depreciation behavior resolves deterministically for every Asset in that class.*
- **US-002.** *As an Asset Manager, I want the registered depreciation method to be evaluated deterministically against an Asset's capitalization amount, useful life, salvage value, and start date, so that the resulting periodic depreciation amounts are reproducible and audit-traceable.*
- **US-003.** *As an Asset Manager, I want a per-Asset depreciation schedule to be generated when an Asset's Capitalization reaches `capitalized` (via the consumed `AssetCapitalized` event), so that no manual schedule-authoring step is required.*
- **US-004.** *As an Asset Manager, I want to capture a Depreciation Run (draft) covering a period across a set of active Assets under a company, so that periodic depreciation posting intent is captured deterministically before approval.*
- **US-005.** *As an Asset Manager, I want to drive a Depreciation Run through its lifecycle (draft → submitted → approved → posted → reversed) via workflow and multi-step approval, so that state transitions are governed deterministically.*
- **US-006.** *As an Asset Manager, I want scheduled periodic Depreciation Runs to execute via `ENG-014` under the tenant's configured cadence, so that recurring depreciation posting does not require manual triggering.*
- **US-007.** *As a downstream subscriber (MOD-002 Accounting; Assets Analytics), I want `DepreciationPosted` to be published when a Depreciation Run reaches `posted`, so that downstream sprints and modules can react without polling Assets state.*
- **US-008.** *As an Asset Manager, I want Depreciation Runs to be legal only against active Assets, so that archived, capitalization-reversed, or disposed Assets do not accrue depreciation in error.*
- **US-009.** *As an Asset Manager, I want the Capitalization amount to be immutable once a Depreciation Run has been executed against the Asset (except via reversal), so that the depreciation schedule and the capitalization amount cannot silently drift out of consistency.*
- **US-010.** *As a security reviewer, I want every depreciation-method configuration change, schedule-generation event, and Depreciation Run state transition to be audited via `ENG-004`, so that I can reconstruct depreciation history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Depreciation method registration (US-001)

- **Given** a valid depreciation-method registration request for an active Asset Class under a tenant/company,
  **when** an Asset Manager submits it,
  **then** the registration is persisted through `ENG-005` and is resolvable deterministically under the caller's (tenant, company) scope, and the change is audited via `ENG-004`.
- **Given** an attempt to register a depreciation method for an Asset Class in a different company or for an archived Asset Class,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.2 Depreciation method evaluation (US-002)

- **Given** an Asset with a resolved depreciation method (per §5.1) and a capitalized Capitalization,
  **when** the evaluation executes for a given period,
  **then** the method resolves the periodic depreciation amount deterministically via `ENG-012` from the capitalization amount, useful life, salvage value, and start date; identical inputs yield identical outputs.

### 5.3 Schedule generation (US-003)

- **Given** an Asset whose Capitalization has reached `capitalized` and the `AssetCapitalized` event has been consumed,
  **when** the consumption completes,
  **then** a per-Asset depreciation schedule is generated deterministically for the Asset's expected life and the generation is audited via `ENG-004`.
- **Given** a schedule for periods already covered by a `posted` Depreciation Run,
  **when** a re-generation request is submitted,
  **then** the request is rejected deterministically; re-generation is legal only for periods not yet covered by a `posted` Depreciation Run or after reversal.

### 5.4 Depreciation Run capture (US-004)

- **Given** a valid Depreciation Run capture request under a tenant/company covering a period and a set of active Assets in the same company with generated schedules,
  **when** an Asset Manager submits it,
  **then** the Depreciation Run is persisted as `draft` with a stable identifier, and the creation is audited via `ENG-004`.
- **Given** an attempt to capture a Depreciation Run that includes any Asset that is not active (archived, capitalization-reversed, or disposed) or any Asset in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.5 Depreciation Run lifecycle (US-005)

- **Given** a Depreciation Run in `draft`,
  **when** it is submitted,
  **then** it transitions to `submitted` via `ENG-010`, and the transition is audited.
- **Given** a Depreciation Run in `submitted`,
  **when** the required approval chain completes via `ENG-011`,
  **then** it transitions to `approved` via `ENG-010`, and the transition is audited.
- **Given** a Depreciation Run in `approved`,
  **when** posting completion is confirmed,
  **then** it transitions to `posted` via `ENG-010`, `DepreciationPosted` is published via `ENG-024`, and the transition is audited.
- **Given** a Depreciation Run in `posted`,
  **when** a legitimate reversal request is submitted and approved via `ENG-011`,
  **then** it transitions to `reversed` via `ENG-010`, and the transition is audited.
- **Given** an attempt to transition a Depreciation Run along any path not declared by the lifecycle,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.6 Scheduled periodic runs (US-006)

- **Given** a tenant/company with a configured Depreciation Run cadence resolved via `ENG-005`,
  **when** the cadence fires via `ENG-014` Scheduler,
  **then** a Depreciation Run for the elapsed period is instantiated in `draft` covering the active Assets in scope, and the instantiation is audited.
- **Given** two scheduled fires for the same period,
  **when** the second fire executes,
  **then** the second fire is idempotent — no duplicate Depreciation Run is created for the same (tenant, company, period).

### 5.7 Event publication (US-007)

- **Given** a Depreciation Run transition to `posted`,
  **when** the transition completes,
  **then** `DepreciationPosted` is published via `ENG-024` exactly once, using the authoritative envelope and payload contract governed by the event catalog.

### 5.8 Active-asset-only rule (US-008)

- **Given** any Depreciation Run capture, submission, approval, or scheduled instantiation,
  **when** the request references an Asset that is not active,
  **then** the request is rejected deterministically via `ENG-012` under the active-asset-only rule.

### 5.9 Capitalization-amount immutability (US-009)

- **Given** an Asset against which any Depreciation Run has reached `posted` at least once,
  **when** an edit request attempts to modify the Asset's Capitalization amount other than via reversal,
  **then** the request is rejected deterministically via `ENG-012` under the capitalization-amount-immutability rule.

### 5.10 Audit integration (US-010)

- **Given** any depreciation-method configuration change, schedule-generation event, or Depreciation Run lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.11 Isolation invariants (`ADR-011`)

- **Given** any depreciation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.12 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Depreciation Run or depreciation-schedule data,
  **when** it reads or reacts to these entities,
  **then** it does so exclusively through Assets-owned events (`DepreciationPosted` here) and Assets read APIs. No downstream module authors a parallel Depreciation Run or depreciation-schedule entity.
- **Given** any Assets code path requiring Asset, Asset Class, or Capitalization data,
  **when** it needs those masters/transactions,
  **then** it consumes them read-only from `SPR-MOD-013-001` authorities; they are not redefined here.
- **Given** any Depreciation Run state change that has ledger effects,
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through the published `DepreciationPosted` event; no Assets code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-013` — Assets.
- **Module PRD:** [`docs/20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Depreciation methods and schedules; submodule Depreciation), §3 (Asset Manager, Finance; Auditor), §4 (Capitalize-to-depreciate), §6 (Depreciation Run transaction), §7 (active-asset-only rule; capitalization-amount-immutability rule end-to-end enforcement), §8 (`DepreciationPosted` published; `AssetCapitalized` consumed), §10 (Depreciation methods per class), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-013` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger, voucher, and posting authority (consumed indirectly via published `DepreciationPosted`, not invoked from Assets).
- **Upstream sprint dependencies (per Sprint Plan §2):** [`SPR-MOD-013-001`](./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md) — Asset, Asset Class, Location, Insurance Policy masters; Capitalization transaction lifecycle; Assets operations configuration namespace; `AssetCapitalized` publication.
- **Cross-module consumption (events only):** none new in this sprint; `AssetCapitalized` is consumed intra-module from Sprint 1.
- **Downstream sprints:** `SPR-MOD-013-003` (Maintenance, Transfer & Disposal), `SPR-MOD-013-004` (Assets Analytics & Compliance) — per [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.1 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Assets Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and the Sprint Plan §5 allocation for `SPR-MOD-013-002`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on depreciation-method configuration changes, schedule-generation triggers, and Depreciation Run actions. |
| `ENG-004` Audit | Records every depreciation-method configuration change, schedule-generation event, and Depreciation Run lifecycle transition. |
| `ENG-005` Configuration | Resolves depreciation-method registration per Asset Class and Depreciation Run cadence under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-010` Workflow | Enforces the Depreciation Run transaction lifecycle (draft → submitted → approved → posted → reversed). |
| `ENG-011` Approval | Routes multi-step approvals for Depreciation Run submission and reversal. |
| `ENG-012` Rules | Evaluates registered depreciation methods; enforces the active-asset-only rule and the capitalization-amount-immutability rule. |
| `ENG-014` Scheduler | Orchestrates scheduled periodic Depreciation Runs under the tenant's configured cadence. |
| `ENG-024` Eventing | Publishes `DepreciationPosted` on Depreciation Run → `posted`; consumes `AssetCapitalized` for initial per-Asset schedule generation. |
| `ENG-025` Notification | Emits notifications on Depreciation Run state transitions under the tenant's configured channels. |

Assets business semantics (Depreciation Run transaction lifecycle, per-Asset depreciation schedules, depreciation-method evaluation, active-asset-only rule, capitalization-amount-immutability rule) are owned by this module and are not delegated to any engine.

`ENG-015` Voucher and `ENG-016` Posting are **not** consumed by this or any Assets sprint per Sprint Plan §5 — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by `DepreciationPosted` and other Assets-published events.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every depreciation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to depreciation-method configuration and Depreciation Run actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Depreciation Method Registration | MOD-013 (this sprint, configuration-scoped) | Per-Asset-Class depreciation-method configuration resolved via `ENG-005` and evaluated via `ENG-012`. |
| Depreciation Schedule | MOD-013 (this sprint) | Per-Asset ordered set of period-scoped depreciation amounts generated deterministically from the Asset's Capitalization and the resolved depreciation method for its Asset Class. |
| Depreciation Run | MOD-013 (this sprint) | Transaction scoped to a tenant/company covering a period across a set of active Assets in the same company; runs a lifecycle (draft → submitted → approved → posted → reversed). |
| Depreciation Run Cadence | MOD-013 (this sprint, configuration-scoped) | Per-company recurrence configuration resolved via `ENG-005` and enforced via `ENG-014`. |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Depreciation Method Registrations**, zero or more **Depreciation Schedules** (one per active Asset once capitalized), zero or more **Depreciation Runs**, and at most one active **Depreciation Run Cadence**.
- A **Depreciation Method Registration** binds exactly one **Asset Class** (owned by `SPR-MOD-013-001`) to a resolvable method identifier evaluated via `ENG-012`.
- A **Depreciation Schedule** references exactly one **Asset** (owned by `SPR-MOD-013-001`) within the same company; it is derived from that Asset's Capitalization and the Depreciation Method Registration for its Asset Class.
- A **Depreciation Run** references one or more **Assets** in the same company via their **Depreciation Schedules** and a period specification; it is a many-to-many linkage between Assets and periods bounded by the run.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-013` per the Assets Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Asset**, **Asset Class**, and **Capitalization** entities are owned by `SPR-MOD-013-001` and consumed read-only here; they are not redefined.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Assets-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- **`DepreciationPosted`** — published via `ENG-024` when a Depreciation Run reaches `posted`. Per Sprint Plan §2 (`SPR-MOD-013-002`), this is the single domain event originated by this sprint. Additional Assets-lifecycle events (`AssetTransferred`, `AssetDisposed`) are originated by later Assets sprints per Module PRD §8.

### 11.2 Consumed

- **`AssetCapitalized`** (from `SPR-MOD-013-001`, intra-module) — consumed via `ENG-024` to seed initial per-Asset schedule generation. The originating publication is not redefined here.

Consumption of `MaintenanceCompleted` and any cross-module event new to Assets is scoped to `SPR-MOD-013-003` and does not occur in this sprint.

Payload contracts for Assets events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every depreciation read and write.
- [ ] Depreciation-method registration per Asset Class resolves deterministically via `ENG-005` and evaluates deterministically via `ENG-012`.
- [ ] Per-Asset depreciation schedule is generated deterministically on consumed `AssetCapitalized` and the generation is audited via `ENG-004`.
- [ ] The Depreciation Run transaction lifecycle (draft → submitted → approved → posted → reversed) is enforced end-to-end via `ENG-010` with multi-step approvals via `ENG-011`.
- [ ] Scheduled periodic Depreciation Runs execute via `ENG-014` under the tenant's configured cadence and are idempotent per (tenant, company, period).
- [ ] The active-asset-only rule is enforced via `ENG-012` for every Depreciation Run and schedule accrual.
- [ ] The capitalization-amount-immutability rule is enforced via `ENG-012` end-to-end once a Depreciation Run has been executed.
- [ ] `DepreciationPosted` is published via `ENG-024` on every Depreciation Run → `posted`, exactly once.
- [ ] `AssetCapitalized` is consumed via `ENG-024` to seed initial per-Asset schedule generation without redefining Sprint 1's originating publication.
- [ ] Notifications are emitted on Depreciation Run state transitions via `ENG-025`.
- [ ] Every depreciation-method configuration change, schedule-generation event, and Depreciation Run lifecycle transition produces an audit record via `ENG-004`.
- [ ] No Assets code path writes to `ENG-015` Voucher or `ENG-016` Posting; ledger effects are consumed by MOD-002 exclusively via `DepreciationPosted`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-013_SPRINT_PLAN.md` §2 (`SPR-MOD-013-002`):

- Depreciation methods and rates resolve per configured asset class via `ENG-005` and `ENG-012`.
- Depreciation schedules are generated deterministically per asset and remain immutable once locked.
- Periodic Depreciation Runs execute via `ENG-014` and complete only for active assets.
- `DepreciationPosted` events are published via `ENG-024` to trigger MOD-002 posting bindings.
- Capitalization amount cannot be altered once a Depreciation Run has occurred (rule enforced via `ENG-012`).

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
  - **Description:** MOD-013 depends on `MOD002_ACCOUNTING_BASELINE_v1` being frozen and stable, since ledger effects of Depreciation are produced by MOD-002 via posting-rule bindings triggered by `DepreciationPosted`. Any drift in the MOD-002 event-binding contract would break depreciation posting.
  - **Impact:** Any drift in MOD-002 posting-rule bindings would decouple Assets state from ledger effects.
  - **Mitigation:** Consume MOD-002 posting bindings per their authoritative contract; escalate any change as an Accounting defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** This sprint depends on `SPR-MOD-013-001` being `Done`. Any drift in the Asset, Asset Class, Location, Insurance Policy master authorities, the Capitalization transaction lifecycle, or the Assets operations configuration namespace would invalidate this sprint's contract.
  - **Impact:** Sprint 2 cannot enter `In Progress` until Sprint 1 is `Done`.
  - **Mitigation:** Treat Sprint 1 outputs as frozen contracts; escalate any drift as a Sprint 1 defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Later Assets sprints (`SPR-MOD-013-003`, `SPR-MOD-013-004`) are deferred; scope-creep back into this sprint would dilute the Depreciation slice.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Assets-owned entities (Depreciation Method Registration, Depreciation Schedule, Depreciation Run, Depreciation Run Cadence) MUST NOT be redefined by downstream modules; MOD-002 financial postings and MOD-013 Sprint 1 masters/transactions MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Depreciation Run Transaction Authority (§1.1.1), the Depreciation Schedule Authority (§1.1.2), the Depreciation Method Evaluation Authority (§1.1.3), and the cross-module boundary (§1.1.4) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 2 publishes `DepreciationPosted` and consumes `AssetCapitalized` (intra-module). Any event name not yet present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If `DepreciationPosted` is not registered before this sprint executes, publishers cannot emit and MOD-002 posting bindings cannot subscribe.
  - **Mitigation:** For `DepreciationPosted` — confirm event catalog registration before this sprint enters `In Progress`. `AssetCapitalized` inherits Sprint 1's registration item. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — depreciation-method evaluation determinism (identical inputs → identical outputs); schedule-generation invariants; Depreciation Run lifecycle transition invariants; active-asset-only invariant; capitalization-amount-immutability invariant post-Depreciation-Run; idempotent scheduled-fire invariant per (tenant, company, period).
- **Integration** — configuration resolution via `ENG-005`; rule evaluation via `ENG-012`; workflow via `ENG-010`; approval routing via `ENG-011`; scheduler firing via `ENG-014`; event publication and consumption via `ENG-024`; audit emission via `ENG-004`; notification emission via `ENG-025`.
- **Contract** — `DepreciationPosted` payload contract per the authoritative event catalog; `AssetCapitalized` consumption contract per the authoritative event catalog.
- **End-to-end (smoke)** — Capitalization → schedule generation → Depreciation Run draft → submitted → approved → posted → reversed, including `DepreciationPosted` publication and audit emission at each step; scheduled-fire smoke including idempotency; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, a set of Asset Class × method fixtures spanning the registered evaluation cases, and a scheduled-fire idempotency fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Depreciation Run lifecycles as small state machines so audit emission (§5.10) is trivially satisfiable at every transition.
- Consider co-locating schedule generation with the `AssetCapitalized` consumer so schedules are produced synchronously with capitalization completion and downstream consumers observe a consistent view.
- Consider a small idempotent scheduled-fire handler keyed by (tenant, company, period) so replays and retries never create duplicate Depreciation Runs.
- Consider centralizing method evaluation behind a single `ENG-012` rule surface so downstream sprints and MOD-002 posting bindings observe a single deterministic evaluation contract.
- Consider enforcing the active-asset-only rule and capitalization-amount-immutability rule at the earliest boundary (input validation layer) so downstream operations inherit the guarantee without additional code.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-013-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Capitalize-to-depreciate process — depreciation-method registration/evaluation, per-Asset schedule generation, Depreciation Run transaction lifecycle, and scheduled periodic runs, with `DepreciationPosted` publication and `AssetCapitalized` consumption (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-013 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Assets Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates Sprint 1 masters/Capitalization, maintenance/transfer/disposal, analytics, MOD-002-owned ledger postings, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-013-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-013-003` Maintenance, Transfer & Disposal is the immediate successor per [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-013-001` and `SPR-MOD-013-002`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md`](./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
