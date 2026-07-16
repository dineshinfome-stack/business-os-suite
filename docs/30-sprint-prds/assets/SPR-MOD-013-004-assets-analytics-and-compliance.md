---
title: "SPR-MOD-013-004 — Assets Analytics & Compliance"
summary: "Sprint PRD for the Analytics & Compliance layer of MOD-013 Assets: Assets read model, operational reports (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary), dashboards, exports, and audit readiness. Read-model only. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-16"
sprint_id: "SPR-MOD-013-004"
parent_module: "MOD-013"
parent_sprint_plan: "MOD-013_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "15.0.4"
size: "Small"
related_engines: ["ENG-002", "ENG-004", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "assets", "mod-013", "analytics", "compliance", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD013-004-20260716T023000Z-001"
parent_result_id: "GT003-MOD013-003-20260716T022000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-013-004 — Assets Analytics & Compliance

> **Stage 2 deliverable.** Fourth and final authored Sprint PRD for **MOD-013 Assets** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-013-004` (permanent) |
| Parent Module | `MOD-013` — Assets |
| Parent Sprint Plan | [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) |
| Iteration | Sprint 4 (final Stage 2 sprint) |
| Status | Draft |
| Estimated Size | Small |
| Upstream Sprints | [`SPR-MOD-013-001`](./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md), [`SPR-MOD-013-002`](./SPR-MOD-013-002-depreciation-methods-and-runs.md), [`SPR-MOD-013-003`](./SPR-MOD-013-003-maintenance-transfer-and-disposal.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) |
| Downstream Sprints | None (final MOD-013 Stage 2 sprint) |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Assets read model** and its analytics/compliance surface for BusinessOS Assets: operational reports **Asset Register**, **Depreciation Schedule**, **Maintenance History**, and **Disposal Summary** (per Module PRD §9), dashboards for these reports via `ENG-022`, search via `ENG-020`, exports via `ENG-027`, integration surfaces via `ENG-023`, and an **audit-readiness surface** that exposes every Assets event emitted during the sprint sequence `SPR-MOD-013-001` … `SPR-MOD-013-003`. This sprint is **read-model only**: it consumes upstream Assets state and events but **MUST NOT** author new transactional behavior, new master data, or new lifecycle transitions.

> **Assets Ownership Convention.** MOD-013 Assets owns the **Assets read model** and its operational reports, dashboards, exports, and audit-readiness surface. ERP Core Engines provide shared infrastructure (authorization, audit, search, reporting, dashboards, integration, eventing, notification, export) but **MUST NOT** redefine Assets business rules or reports. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Ledger effects remain exclusive to **MOD-002 Accounting** via `ENG-015` and `ENG-016`. **Cross-module KPI definitions remain exclusive to MOD-017 Analytics**; MOD-013 surfaces operational Assets reports listed in Module PRD §9 and does not redefine cross-module KPIs.

#### 1.1.1 Assets Read Model & Report Authority

The **Assets read model** and the operational reports enumerated in Module PRD §9 (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary) are authoritatively owned by MOD-013 Assets. Their input state comes exclusively from Assets-owned transactions and lifecycles authored in `SPR-MOD-013-001` through `SPR-MOD-013-003` and from cross-module events consumed read-only per §1.1.3. No other module MAY redefine these reports.

#### 1.1.2 Assets ↔ Analytics Boundary

**Cross-module KPI definitions** remain exclusive to **MOD-017 Analytics**. This sprint surfaces operational Assets reports listed in Module PRD §9 only. Where a cross-module KPI is required at the tenant level, its definition is consumed read-only from MOD-017 Analytics; MOD-013 never authors a cross-module KPI.

#### 1.1.3 Assets ↔ Platform and Accounting Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. This sprint consumes them read-only via `ENG-002`.
- **MOD-002 Accounting** owns financial postings via `ENG-015` and `ENG-016`. No Assets sprint writes journal entries; ledger effects are produced by MOD-002 via posting-rule bindings triggered by Assets-published events.
- **MOD-017 Analytics** owns cross-module KPI definitions. This sprint surfaces operational reports only; cross-module KPIs are not redefined.

Ownership boundaries SHALL NOT be redefined in any downstream context.

#### 1.1.4 Read-Model-Only Boundary

This sprint **MUST NOT**:

- author any new master data, transaction, lifecycle, or state machine;
- redefine any Assets-owned entity, event, or business rule from `SPR-MOD-013-001` … `SPR-MOD-013-003`;
- publish new domain events beyond those already registered by prior Assets sprints in the authoritative event catalog;
- author cross-module KPI definitions.

Any deficit discovered in upstream Assets state or events is a defect at its originating sprint, not new scope here.

#### 1.1.5 Audit-Readiness Surface

The **audit-readiness surface** exposes every Assets event emitted during `SPR-MOD-013-001` … `SPR-MOD-013-003` (as registered in the authoritative event catalog) together with their audit records via `ENG-004`. It is a read-only surface; it neither replays events nor re-emits them.

### 1.2 In Scope

- **Assets read model** — a read-only projection over Assets-owned master data (Asset, Asset Class, Location, Insurance Policy) and transactions (Capitalization, Depreciation Run, Depreciation Schedule, Maintenance Order, Disposal, Asset Transfer) authored in `SPR-MOD-013-001` … `SPR-MOD-013-003`.
- **Operational reports** — **Asset Register**, **Depreciation Schedule**, **Maintenance History**, **Disposal Summary** as declared in Module PRD §9; rendered via `ENG-021`.
- **Dashboards** — dashboard surfaces for the four operational reports rendered via `ENG-022`.
- **Search** — search over the Assets read model via `ENG-020`.
- **Integration surfaces** — read-only integration surfaces for the Assets read model via `ENG-023`.
- **Exports** — dataset and report exports via `ENG-027`.
- **Notifications** — scheduled or event-driven report notifications (e.g., report readiness, threshold-based digests) via `ENG-025` under the tenant's configured channels.
- **Read-only consumption of upstream Assets events** via `ENG-024`: `AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed` (as registered in the authoritative event catalog for prior Assets sprints) to keep the read model current.
- **Audit-readiness surface** — a read-only surface that lists every Assets event emitted during `SPR-MOD-013-001` … `SPR-MOD-013-003` with its `ENG-004` audit record and its tenant/company scope.
- **Authorization** on every report render, dashboard view, search query, integration read, and export request via `ENG-002`.
- **Audit** emission via `ENG-004` for every report render, export request, integration read, and audit-readiness-surface access, per Module PRD §11 (Audit readiness).

### 1.3 Out of Scope

- Asset, Asset Class, Location, and Insurance Policy masters and Capitalization transaction — `SPR-MOD-013-001`.
- Depreciation Method configuration, Depreciation Run lifecycle, and Depreciation Schedule authoring — `SPR-MOD-013-002`.
- Maintenance Order, Asset Transfer, Disposal, and calibration tracking — `SPR-MOD-013-003`.
- Financial postings for capitalization, depreciation, and disposal — owned by MOD-002 Accounting via `ENG-015` and `ENG-016`.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-013-004`, the following will exist:

- **Business capabilities.**
  - An Assets Manager can render **Asset Register**, **Depreciation Schedule**, **Maintenance History**, and **Disposal Summary** reports via `ENG-021` from the Assets read model.
  - An Assets Manager can view Assets dashboards for the four operational reports via `ENG-022`.
  - An Assets Manager can search the Assets read model via `ENG-020`.
  - An authorized integrator can consume the Assets read model via read-only integration surfaces exposed through `ENG-023`.
  - An Assets Manager can export report datasets via `ENG-027`.
  - Report notifications (readiness or threshold-based digests) are dispatched via `ENG-025` under the tenant's configured channels where configured.
  - An auditor can access the audit-readiness surface listing every Assets event emitted during `SPR-MOD-013-001` … `SPR-MOD-013-003` together with its `ENG-004` audit record.
- **Configuration artifacts.** *N/A at PRD authoring time.* No new Assets-owned configuration namespace is registered by this sprint beyond dashboard/report-registration surfaces provided by `ENG-021`/`ENG-022`.
- **Audit artifacts.** An audit record exists for every report render, export request, integration read, dashboard view (where declared by policy), and audit-readiness-surface access, produced via `ENG-004`.
- **Notification artifacts.** Report-readiness or threshold-based notifications emitted via `ENG-025` under the tenant's configured channels where configured.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-013-004`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-013 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — all analytics-facing capabilities as read model | Assets read model, dashboards, exports, audit-readiness surface |
| §3 Personas — Assets Manager, Auditor | User stories (§4) |
| §9 Reports & Analytics — Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary | Operational reports rendered via `ENG-021`; dashboards via `ENG-022` |
| §11 Non-functional — Audit readiness | Audit-readiness surface (§1.1.5) |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Assets Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) §4.1/§4.2 allocates the Assets Analytics read-model surface to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Assets Analytics (read-model surface over §2 capabilities) | `SPR-MOD-013-004` |

Each Module PRD §2 business capability is allocated to exactly one originating transactional sprint (`SPR-MOD-013-001` … `SPR-MOD-013-003`); no other sprint claims the Assets Analytics read-model surface as its originating capability.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §9 reports (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary) and §11 Audit readiness → this Sprint PRD → deliverables in §2 (Assets read model, operational reports, dashboards, search, integration surfaces, exports, audit-readiness surface).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an Assets Manager, I want to render the Asset Register report per company so that I can see all active assets with their class, location, capitalization, and current status.*
- **US-002.** *As an Assets Manager, I want to render the Depreciation Schedule report so that I can see per-asset depreciation posted, remaining schedule, and net book value.*
- **US-003.** *As an Assets Manager, I want to render the Maintenance History report so that I can see maintenance orders per asset with calibration outcomes.*
- **US-004.** *As an Assets Manager, I want to render the Disposal Summary report so that I can see disposed assets with disposal method, date, and outcome.*
- **US-005.** *As an Assets Manager, I want dashboards over the four operational reports so that I can monitor Assets performance without running each report manually.*
- **US-006.** *As an Assets Manager, I want to search the Assets read model so that I can locate Assets, Capitalizations, Depreciation Runs, Maintenance Orders, and Disposals by common attributes.*
- **US-007.** *As an integrator, I want authorized read-only access to the Assets read model so that downstream systems can consume operational state without direct database access.*
- **US-008.** *As an Assets Manager, I want to export report datasets so that I can share Assets performance data outside the system through tenant-approved channels.*
- **US-009.** *As an Assets Manager, I want report-readiness or threshold-based notifications so that I am alerted when a scheduled report is ready or a threshold is crossed.*
- **US-010.** *As an auditor, I want a read-only audit-readiness surface listing every Assets event emitted during Sprints 001–003 together with its audit record so that Assets history is reconstructible from an authoritative log.*
- **US-011.** *As a security reviewer, I want authorization enforced on every report render, dashboard view, search query, integration read, and export request so that only permitted actors can access Assets data.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Asset Register report (US-001)

- **Given** Assets, Asset Classes, Locations, and Capitalizations authored by `SPR-MOD-013-001` under a (tenant, company),
  **when** an authorized Assets Manager renders the Asset Register report via `ENG-021`,
  **then** all active assets are listed with class, location, capitalization amount, and current lifecycle status deterministically; render is audited via `ENG-004`.

### 5.2 Depreciation Schedule report (US-002)

- **Given** Depreciation Runs and Depreciation Schedules authored by `SPR-MOD-013-002`,
  **when** the Depreciation Schedule report renders via `ENG-021`,
  **then** per-asset posted depreciation, remaining schedule, and net book value are computed deterministically; render is audited via `ENG-004`.

### 5.3 Maintenance History report (US-003)

- **Given** Maintenance Orders authored by `SPR-MOD-013-003`,
  **when** the Maintenance History report renders via `ENG-021`,
  **then** maintenance orders are aggregated per asset deterministically with calibration outcomes where applicable; render is audited via `ENG-004`.

### 5.4 Disposal Summary report (US-004)

- **Given** Disposals authored by `SPR-MOD-013-003`,
  **when** the Disposal Summary report renders via `ENG-021`,
  **then** disposed assets are listed with disposal method, date, and outcome deterministically; render is audited via `ENG-004`.

### 5.5 Dashboards (US-005)

- **Given** the four reports of §5.1–§5.4,
  **when** an authorized Assets Manager opens the Assets dashboards,
  **then** the dashboards render via `ENG-022` from the same read-model projection as the underlying reports; access is audited via `ENG-004` where declared by policy.

### 5.6 Read-model search (US-006)

- **Given** the Assets read model,
  **when** an authorized user searches via `ENG-020`,
  **then** search results are scoped to the caller's (tenant, company) per `ADR-011`; every search is audited via `ENG-004` where declared by policy.

### 5.7 Integration surface (US-007)

- **Given** an authorized integrator credential,
  **when** it reads the Assets read model via `ENG-023`,
  **then** access is read-only, scoped to the caller's tenant, enforced via `ENG-002` under `ADR-032`, and audited via `ENG-004`; no write operation is exposed.

### 5.8 Exports (US-008)

- **Given** an authorized Assets Manager,
  **when** an export is requested via `ENG-027`,
  **then** the export runs against the read-model projection, is scoped to the caller's (tenant, company), and is audited via `ENG-004`; no cross-tenant data appears in the export.

### 5.9 Report notifications (US-009)

- **Given** a configured report-readiness or threshold-based notification,
  **when** the notification condition is satisfied,
  **then** the notification is emitted via `ENG-025` under the tenant's configured channels.

### 5.10 Audit-readiness surface (US-010)

- **Given** Assets events emitted during `SPR-MOD-013-001` … `SPR-MOD-013-003` (as registered in the authoritative event catalog),
  **when** an authorized auditor queries the audit-readiness surface,
  **then** each event is listed together with its `ENG-004` audit record and its (tenant, company) scope; the surface is read-only and does not re-emit events.

### 5.11 Authorization (US-011)

- **Given** any report render, dashboard view, search query, integration read, or export request,
  **when** it executes,
  **then** it is subject to `ENG-002` Authorization under `ADR-032` RBAC + ABAC; unauthorized requests are rejected deterministically.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any read against the Assets read model (report, dashboard, search, integration, export, audit-readiness surface),
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read can succeed.

### 5.13 Read-model-only invariants

- **Given** any operation exposed by this sprint,
  **when** it executes,
  **then** it MUST NOT create, update, or delete any Assets-owned master data, transaction, lifecycle state, or domain event; write attempts against the read-model surface are rejected deterministically.
- **Given** any cross-module reference required by a report or dashboard,
  **when** it resolves,
  **then** the referenced entity is consumed read-only from its owning module (MOD-001, MOD-002, MOD-017); no owning-module entity is redefined here.

### 5.14 Event consumption idempotency

- **Given** upstream Assets events (`AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed`) received via `ENG-024`,
  **when** consumed by the read-model projector,
  **then** each event drives at most one deterministic projection update; duplicate delivery is idempotent.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-013` — Assets.
- **Module PRD:** [`docs/20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (analytics-facing capabilities as read model), §3 (Assets Manager, Auditor), §9 (Reports & Analytics — Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary), §11 (Audit readiness), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-013` MODULE_PRD.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-013-001`, `SPR-MOD-013-002`, `SPR-MOD-013-003`.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD002_ACCOUNTING_BASELINE_v1`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) (frozen) — ledger authority; no direct posting occurs here.
- **Cross-module consumption (events only):** Upstream Assets events (`AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed`) consumed via `ENG-024` to keep the read model current.
- **Downstream sprints:** None. `SPR-MOD-013-004` is the final Stage 2 sprint for MOD-013.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Assets Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and of the Sprint Plan §2 engines declared for `SPR-MOD-013-004`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every report render, dashboard view, search query, integration read, and export request under `ADR-032` RBAC + ABAC. |
| `ENG-004` Audit | Records every report render, export request, integration read, dashboard view (where declared by policy), and audit-readiness-surface access. |
| `ENG-020` Search | Backs read-model search over Assets master data and transactions. |
| `ENG-021` Reporting | Renders the four operational reports declared in Module PRD §9. |
| `ENG-022` Dashboard | Renders dashboards over the four operational reports. |
| `ENG-023` Integration | Exposes read-only integration surfaces over the Assets read model. |
| `ENG-024` Eventing | Consumes upstream Assets events (`AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed`) to keep the read model current. |
| `ENG-025` Notification | Emits report-readiness or threshold-based notifications under the tenant's configured channels. |
| `ENG-027` Export | Executes dataset and report exports scoped to the caller's (tenant, company). |

Assets business semantics (Assets read model, operational report definitions in Module PRD §9, audit-readiness surface) are owned by this module and are not delegated to any engine. Cross-module KPI definitions remain exclusive to MOD-017 Analytics and are not authored here. `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by this sprint or any Assets sprint; ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by Assets-published events.

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
| Assets Read Model | MOD-013 (this sprint) | Read-only projection over Assets-owned master data (Asset, Asset Class, Location, Insurance Policy) and transactions (Capitalization, Depreciation Run, Depreciation Schedule, Maintenance Order, Disposal, Asset Transfer). |
| Assets Report Definition | MOD-013 (this sprint) | Operational-report definitions for Asset Register, Depreciation Schedule, Maintenance History, and Disposal Summary, rendered via `ENG-021`. |
| Assets Dashboard Definition | MOD-013 (this sprint) | Dashboard compositions over the four operational reports, rendered via `ENG-022`. |
| Audit-Readiness Surface | MOD-013 (this sprint) | Read-only listing of every Assets event emitted during `SPR-MOD-013-001` … `SPR-MOD-013-003` with its `ENG-004` audit record and (tenant, company) scope. |

### 10.2 Relationships

- The **Assets Read Model** references only Assets-owned master data and transactions authored in `SPR-MOD-013-001` … `SPR-MOD-013-003`, and read-only references to MOD-001-owned Identity where surfaced by a report.
- **Assets Report Definitions** and **Dashboard Definitions** are scoped per tenant/company and reference only the Assets Read Model.
- The **Audit-Readiness Surface** references only Assets events registered in the authoritative event catalog and their `ENG-004` audit records; it does not reference other modules' events.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-013` per the Assets Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- Cross-module KPI definitions are owned by MOD-017 Analytics and are not authored here.
- Upstream master data (Identity) is consumed read-only from its owning module.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

- Per Sprint Plan §2 (`SPR-MOD-013-004`) and the Read-Model-Only Boundary (§1.1.4), this sprint does not publish any new domain event. All Assets domain events remain those originated by `SPR-MOD-013-001` … `SPR-MOD-013-003`.

### 11.2 Consumed

- **`AssetCapitalized`** (from `SPR-MOD-013-001`) — consumed via `ENG-024` to project Asset and Capitalization state into the read model.
- **`DepreciationPosted`** (from `SPR-MOD-013-002`) — consumed via `ENG-024` to project depreciation state and net book value into the read model.
- **`AssetTransferred`** (from `SPR-MOD-013-003`) — consumed via `ENG-024` to project location changes into the read model.
- **`AssetDisposed`** (from `SPR-MOD-013-003`) — consumed via `ENG-024` to project disposal outcomes into the read model.

Payload contracts for Assets events are declared in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every read (report, dashboard, search, integration, export, audit-readiness surface).
- [ ] Every report render, export request, integration read, dashboard view (where declared by policy), and audit-readiness-surface access produces an audit record via `ENG-004`.
- [ ] The four operational reports (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary) render deterministically via `ENG-021` from the Assets read model.
- [ ] Assets dashboards render via `ENG-022` from the same read-model projection.
- [ ] Read-model search runs via `ENG-020` scoped to caller (tenant, company).
- [ ] Read-only integration surfaces expose the read model via `ENG-023`; no write is exposed.
- [ ] Exports run via `ENG-027` scoped to caller (tenant, company).
- [ ] Upstream Assets events (`AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed`) are consumed via `ENG-024` idempotently.
- [ ] The audit-readiness surface exposes every Assets event emitted during `SPR-MOD-013-001` … `SPR-MOD-013-003` together with its `ENG-004` audit record.
- [ ] Authorization is enforced on every read exposed by this sprint via `ENG-002`.
- [ ] Read-model-only invariants (§5.13) are enforced: no write against Assets-owned state is exposed.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-013_SPRINT_PLAN.md` §2 (`SPR-MOD-013-004`):

- Asset Register, Depreciation Schedule, Maintenance History, and Disposal Summary reports render via `ENG-021`.
- Dashboards surface Assets read-model projections via `ENG-022`; KPI definitions are consumed read-only from MOD-017 via `ENG-023`.
- Bulk exports of operational reports are produced via `ENG-027`.
- Audit-readiness surface is complete: every state-changing transaction traces to an `ENG-004` audit event.
- No new master data, transactions, engines, or ADRs are introduced; the sprint is read-model-only.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-013 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-013 depends on `MOD002_ACCOUNTING_BASELINE_v1` being frozen and stable; ledger effects for capitalization, depreciation, and disposal are produced by MOD-002 via posting-rule bindings triggered by Assets-published events.
  - **Impact:** Drift in accounting posting rules would decouple Assets events from ledger effects.
  - **Mitigation:** Consume the Accounting baseline contract; escalate any change as an owning-module defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** This sprint depends on `SPR-MOD-013-001` … `SPR-MOD-013-003` being complete; the read model requires master data and transactional state authored there.
  - **Impact:** Regressions in prior Assets sprints would break the read model, reports, dashboards, and the audit-readiness surface.
  - **Mitigation:** Consume upstream contracts; treat regressions as defects at their originating sprint.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Non-determinism in report aggregation (unstable net-book-value computation, ambiguous "active" definition in Asset Register, non-deterministic maintenance aggregation periods) would violate testability of §5.1–§5.4.
  - **Impact:** Non-deterministic reports would break audit reconstruction and trust in Assets analytics.
  - **Mitigation:** Freeze deterministic aggregation definitions as part of the registered Assets Report Definitions; enforce structural validation at registration time.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Scope-creep from cross-module KPI definitions (owned by MOD-017 Analytics) back into this sprint would violate the Assets ↔ Analytics boundary (§1.1.2).
  - **Impact:** Silent absorption of MOD-017-owned KPIs would fragment master ownership.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to MOD-017 Analytics.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Assets-owned entities (Assets Read Model, Assets Report Definitions, Assets Dashboard Definitions, Audit-Readiness Surface) MUST NOT be redefined by downstream modules; cross-module KPI definitions MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Assets Read Model & Report Authority (§1.1.1), the Assets ↔ Analytics boundary (§1.1.2), and the Read-Model-Only Boundary (§1.1.4).
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 4 consumes `AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, and `AssetDisposed`. Any event name not yet present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint enters `In Progress`, consumers cannot subscribe and the read model cannot stay current.
  - **Mitigation:** Confirm event catalog registration of consumed events before this sprint enters `In Progress`.
  - **Status:** Open

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — report-aggregation determinism (Asset Register status derivation, Depreciation Schedule net-book-value computation, Maintenance History aggregation windows, Disposal Summary outcome aggregation); read-model projector idempotency; audit-readiness-surface listing correctness.
- **Integration** — audit emission via `ENG-004`, authorization via `ENG-002`, search via `ENG-020`, reporting via `ENG-021`, dashboards via `ENG-022`, integration surfaces via `ENG-023`, event consumption via `ENG-024`, notification emission via `ENG-025`, exports via `ENG-027`.
- **Contract** — `AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, and `AssetDisposed` consumption contracts per the authoritative event catalog.
- **End-to-end (smoke)** — Analytics: upstream event ingestion → read-model projection → each of the four reports rendered → dashboards → export → audit-readiness-surface listing; two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture; deterministic Assets Report Definitions; a deterministic Assets Dashboard Definition set.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the read-model projector as an idempotent consumer keyed by (tenant, company, upstream_event_id) so replays do not double-project.
- Consider expressing each of the four report aggregations as a pure, deterministic function over the read-model snapshot so §5.1–§5.4 tests are trivially reproducible.
- Consider registering Assets Report Definitions and Dashboard Definitions declaratively so `ENG-021`/`ENG-022` render them without bespoke code.
- Consider scoping export batches by (tenant, company) so a slow tenant cannot starve others.
- Consider modeling the audit-readiness surface as a join over the authoritative event catalog and `ENG-004` records so no separate storage is required.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-013-004`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Assets read model and its analytics/compliance surface — operational reports (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary), dashboards, search, integration surfaces, exports, and audit-readiness surface (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-013 MODULE_PRD section (§2, §3, §9, §11, §12, §13). No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Assets Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates every foundation/depreciation/maintenance-disposal item and every cross-module ownership (MOD-001, MOD-002, MOD-017) — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Is this the final Stage 2 sprint for MOD-013?**
   Yes. `SPR-MOD-013-004` is the fourth and final sprint per [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) §2; on completion, MOD-013 Stage 2 concludes and the module becomes eligible for Stage 3 Baseline Consolidation (GT-004) per the released GT-003 lifecycle.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md`](./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md), [`./SPR-MOD-013-002-depreciation-methods-and-runs.md`](./SPR-MOD-013-002-depreciation-methods-and-runs.md), [`./SPR-MOD-013-003-maintenance-transfer-and-disposal.md`](./SPR-MOD-013-003-maintenance-transfer-and-disposal.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](../../40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
