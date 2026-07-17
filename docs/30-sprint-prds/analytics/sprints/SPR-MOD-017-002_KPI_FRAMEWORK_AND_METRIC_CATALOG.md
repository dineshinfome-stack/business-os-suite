---
title: "SPR-MOD-017-002 — KPI Framework & Metric Catalog"
summary: "Sprint PRD for the KPI Framework and Metric Catalog authorities of MOD-017 Analytics: the single, versioned KPI catalog (definitions, metadata, classifications, ownership, versioning, lifecycle, visibility, validation, catalog maintenance) consumed read-only by every downstream MOD-017 sprint and by downstream modules. Consumes ERP Core Engines and Accepted ADRs; never redefines them. Analytics remains read-model-only relative to source-module transactional truth."
layer: "delivery"
owner: "Insights"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-017-002"
parent_module: "MOD-017"
parent_sprint_plan: "MOD-017_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "21.0.2"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-010", "ENG-011", "ENG-017", "ENG-020", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "analytics", "mod-017", "kpi", "metric-catalog", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD017-002-20260717T170000Z-001"
parent_result_id: "GT003-MOD017-001-20260717T151727Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-017-002 — KPI Framework & Metric Catalog

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-017 Analytics** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Analytics is **read-model-only** relative to source-module transactional truth. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-017-002` (permanent) |
| Parent Module | `MOD-017` — Analytics |
| Parent Sprint Plan | [`MOD-017_SPRINT_PLAN.md`](../MOD-017_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint Dependencies | `SPR-MOD-017-001` |
| Downstream Sprints | `SPR-MOD-017-003` … `SPR-MOD-017-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **KPI-definition-to-publish** capability for MOD-017 Analytics by establishing two authorities allocated to Sprint 002 by the approved Sprint Plan:

- **KPI Framework Authority** — the business framework governing KPI authoring, classification, ownership, versioning, lifecycle, visibility, validation, and searchability across the tenant/company/context hierarchy.
- **KPI Metric Catalog Authority** — the single, versioned catalog of KPI definitions consumed read-only by every downstream MOD-017 sprint and by every downstream module referencing cross-module KPIs.

> **Analytics Ownership Convention (recapitulated).** MOD-017 Analytics owns KPI Framework and KPI Metric Catalog business semantics. ERP Core Engines provide shared infrastructure (identity, authorization, permissions, audit, configuration, localization, workflow, approval, numbering, search, eventing). MOD-017 **MUST NOT** redefine engine behavior. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Source-module master and transactional data remain exclusive to their owning modules and are consumed **read-only**. Ledger effects (if any) remain exclusive to **MOD-002 Accounting** via `ENG-015` / `ENG-016`.

#### 1.1.1 KPI Framework Authority

The **KPI Framework** is authoritatively owned by MOD-017 Analytics. This sprint establishes:

- **KPI definition management** — authoring KPI records under a tenant/company with all required business metadata.
- **KPI metadata** — descriptive attributes (name, description, category, classification, owner, unit, direction/goal semantics) consumed downstream.
- **KPI categories** — the business grouping used to organize KPIs in the catalog.
- **KPI classifications** — the sensitivity/data-classification hint used to enforce visibility per `ADR-032`.
- **KPI ownership metadata** — the business role or team accountable for a KPI's definition and continued correctness.
- **KPI versioning** — every published KPI carries a monotonically increasing version; prior versions remain traceable.
- **KPI lifecycle** — the standard `Draft → Active → Inactive → Archived` lifecycle; only **Active** KPIs may be referenced by consumers.
- **KPI visibility** — sensitive-KPI visibility enforced via `ENG-002` and `ENG-003` per `ADR-032`, including row-level access on every read.
- **KPI validation** — declarative structural and rule validation of KPI records at capture time via the platform rules surface.
- **KPI searchability** — the KPI master registered under `ENG-020` for read discoverability.
- **KPI documentation** — the business documentation surface (locale-sensitive via `ENG-006`) attached to a KPI definition.

No other module MAY create, edit, activate, deactivate, archive, or independently maintain a parallel KPI master. Downstream MOD-017 sprints and downstream modules consume the KPI master strictly through Analytics-owned read surfaces; they **MUST NOT** redefine the KPI entity, its lifecycle, its versioning semantics, or its visibility model.

#### 1.1.2 KPI Metric Catalog Authority

The **KPI Metric Catalog** — the single, versioned catalog aggregating all Active KPI definitions — is authoritatively owned by MOD-017 Analytics in this sprint. The catalog is the read-only reference surface consumed by:

- Downstream MOD-017 sprints (Dashboards `SPR-MOD-017-003`, Distribution/Reporting/Export `SPR-MOD-017-004`, Models & Cross-Module Analytics `SPR-MOD-017-005`).
- Downstream modules that reference cross-module KPIs.

Only Active KPI definitions are exposed through the catalog. Catalog maintenance operations (add, deprecate, retire) are Analytics-owned and audited via `ENG-004` per `ADR-014`. Catalog change signals are emitted via `ENG-024` for downstream consumers.

#### 1.1.3 Analytics ↔ Platform, Source Modules, and Downstream Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management. Analytics consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **Source modules** own master and transactional data. Analytics consumes source data strictly read-only. KPI definitions in this sprint reference source-module master and transactional shapes at the business-semantic level only; no source-module transaction is mutated.
- **MOD-002 Accounting** owns financial postings via `ENG-015` / `ENG-016`. MOD-017 declares no direct posting responsibilities.
- **Data Mart master and Analytics Foundation configuration** remain owned by MOD-017 Analytics under `SPR-MOD-017-001` and are consumed here read-only.
- **Cross-module KPI definitions** originate exclusively in MOD-017 Analytics **in this sprint**. Downstream modules referencing cross-module KPIs consume them read-only from the catalog.
- **MOD-018 AI Workspace** consumes MOD-017 outputs strictly read-only through surfaces authored in `SPR-MOD-017-005`. No MOD-018 surface is redefined here.

Ownership boundaries SHALL NOT be redefined in downstream MOD-017 Sprint PRDs.

### 1.2 In Scope

- **KPI master** — create, edit, activate, deactivate, archive under a tenant/company; locale-sensitive attributes via `ENG-006`.
- **KPI metadata** — name, description, category, classification, owner, unit, direction/goal semantics.
- **KPI categories** — the business grouping master used to organize KPIs.
- **KPI classifications** — the approved catalog of KPI classifications (sensitivity/data-classification hint).
- **KPI ownership metadata** — role/team accountable for the KPI (resolved via MOD-001 identities read-only).
- **KPI versioning** — monotonic KPI version records; single-active-version invariant per KPI.
- **KPI lifecycle** — `Draft → Active → Inactive → Archived`, enforced declaratively.
- **KPI visibility** — sensitive-KPI visibility per `ADR-032`, including row-level access on read.
- **KPI validation** — declarative structural and rule validation at capture time.
- **KPI searchability** — registration under `ENG-020` for read discoverability.
- **KPI documentation** — locale-sensitive documentation attached to a KPI (via `ENG-006`).
- **KPI catalog maintenance** — the read-only catalog projection of Active KPI definitions; catalog change signals emitted via `ENG-024`.
- **Audit** — every state change on a KPI record, KPI version, category, or classification is audited via `ENG-004` per `ADR-014`.

### 1.3 Out of Scope

- Data Mart master, Analytics Foundation configuration, refresh cadence, retention, ingestion contracts, numbering series registration, module-wide search-index baseline — allocated to `SPR-MOD-017-001`.
- Dashboard master, Dashboard View transaction, freshness-declaration rule, drill-downs, `DashboardShared` publication — allocated to `SPR-MOD-017-003`.
- Distribution List master, Report Run transaction, scheduled distribution execution, distribution channels configuration, bulk exports, `ReportPublished` publication — allocated to `SPR-MOD-017-004`. (KPI Trends report authoring is out of scope here; scheduled distribution of reports occurs in Sprint 004.)
- Model Run transaction, Anomaly Highlights, cross-module event consumption as mart inputs, compliance/retention audit-readiness reporting, `ModelRunCompleted` publication, read-only surface provided to MOD-018 — allocated to `SPR-MOD-017-005`.
- Dashboard rendering, reporting execution surfaces, exports, analytical models, cross-module analytics surfaces.
- Identity, authentication, permissions — owned by MOD-001 via `ENG-001`, `ENG-002`, `ENG-003`.
- Any redefinition of ERP Core Engine behavior.
- Physical schema, code, routes, migrations, and UI.
- Module Baseline and Module Publication.
- Governance evolution.

---

## 2. Sprint Deliverables

| # | Deliverable | Kind | Notes |
| --- | --- | --- | --- |
| 1 | KPI master authority | Master Data | Definition, metadata, uniqueness, lifecycle, versioning. |
| 2 | KPI Category master | Master Data | Business grouping consumed by the KPI master. |
| 3 | KPI Classification master | Master Data | Approved classifications for sensitivity/visibility per `ADR-032`. |
| 4 | KPI Version master | Master Data | Monotonic version records per KPI; single-active-version invariant. |
| 5 | KPI Ownership metadata | Master Data attribute | Role/team accountable for the KPI (references MOD-001 read-only). |
| 6 | KPI validation | Rule surface | Declarative structural and rule validation at capture time. |
| 7 | KPI visibility enforcement | Integration | `ENG-002` + `ENG-003` per `ADR-032`, including row-level access. |
| 8 | KPI searchability | Integration | KPI master registered under `ENG-020`. |
| 9 | KPI documentation | Master Data attribute | Locale-sensitive documentation via `ENG-006`. |
| 10 | KPI Metric Catalog | Read-only surface | Read-only catalog projection of Active KPI definitions. |
| 11 | KPI Framework events published | Events | `KPIDefined`, `KPIUpdated`, `KPIVersioned`, `KPIActivated`, `KPIDeactivated`. |
| 12 | Ownership boundaries recapitulation | Documentation | §1.1.3 — no reassignment. |

---

## 3. Traceability to Module PRD

Bidirectional traceability from the [MOD-017 Analytics Module PRD](../../../20-module-prds/analytics/MODULE_PRD.md) and the approved [MOD-017 Sprint Plan](../MOD-017_SPRINT_PLAN.md) to this Sprint PRD.

### 3.1 Forward Map — Module PRD → Sprint 002

| Module PRD Item | Module PRD § | Sprint Plan Allocation | Realized In This Sprint PRD |
| --- | --- | --- | --- |
| KPI catalog and definitions | §2 Capabilities | SPR-MOD-017-002 (origin) | §1, §2, §4 |
| Submodule: KPIs | §2 Submodules | SPR-MOD-017-002 (origin) | §1, §2 |
| KPI (Master Data) | §5 Master Data | SPR-MOD-017-002 (origin) | §4.1 KPI |
| KPI definition-to-publish (process) | §4 Business Processes | SPR-MOD-017-002 (origin) | §4.1 lifecycle; §5 rules; §6 events |
| Single, versioned KPI catalog | §7 Business Rules | SPR-MOD-017-002 (origin) | §4.1; §5 Rule 1, 3 |
| Sensitive KPIs — data classification + row-level access | §7 Business Rules | SPR-MOD-017-002 (origin) | §4.1 Classification; §5 Rule 5 |
| KPI Trends (defined once here; report authoring in Sprint 004) | §9 Reports & Analytics | SPR-MOD-017-002 (definition origin) | §4.1 KPI metadata; §11 boundary to Sprint 004 |
| KPIs — cross-module KPIs defined once here | §9 Reports & Analytics | SPR-MOD-017-002 (origin) | §1.1.2 Catalog Authority |

### 3.2 Reverse Map — Sprint 002 → Module PRD / Sprint Plan

| Sprint 002 Item | Traces To Module PRD | Traces To Sprint Plan |
| --- | --- | --- |
| KPI Framework Authority | §2 Capabilities; §4 Business Processes; §5 Master Data; §7 Business Rules | §2 SPR-MOD-017-002 Objective / Boundaries |
| KPI Metric Catalog Authority | §7 Business Rules (single versioned catalog); §9 (cross-module KPIs defined once here) | §2 SPR-MOD-017-002 Objective / Exit Criteria |
| KPI master | §5 Master Data (KPI) | §4.3 Master Data Forward Map (KPI → SPR-MOD-017-002) |
| KPI Category / Classification / Version / Ownership metadata | §5 Master Data; §7 Business Rules | §2 SPR-MOD-017-002 Boundaries |
| KPI validation | §5 Validation Rules; §7 Business Rules | §2 SPR-MOD-017-002 Exit Criteria (single active version, catalog integrity) |
| KPI visibility | §7 Business Rules (sensitive KPIs); §12 ENG-002, ENG-003 | §2 SPR-MOD-017-002 Exit Criteria (ADR-032) |
| KPI searchability | §12 ENG-020 Search | §2 SPR-MOD-017-002 Engines Consumed |
| KPI documentation | §10 Localization; §5 Master Data | §2 SPR-MOD-017-002 Engines Consumed (ENG-006) |
| KPI Metric Catalog | §7 Business Rules; §9 Reports & Analytics | §2 SPR-MOD-017-002 Exit Criteria |
| KPIDefined / KPIUpdated / KPIVersioned / KPIActivated / KPIDeactivated | §8 Events Published (event surface derived from §2 KPI capability and §4 KPI definition-to-publish process) | §2 SPR-MOD-017-002 Exit Criteria (catalog changes emit change signals via ENG-024) |

### 3.3 Bidirectional Completeness

Every deliverable in §2 traces to at least one Module PRD section and to the approved Sprint Plan's SPR-MOD-017-002 allocation. Every Module PRD item allocated to SPR-MOD-017-002 by the approved Sprint Plan is realized by exactly one deliverable in §2. No orphan requirement. No scope expansion. Analytics remains read-model-only against source-module transactional truth.

---

## 4. Data Model Impact

### 4.1 Master Data

**KPI (business entity — MOD-017 authority).**

- **Purpose.** Represents a single business KPI under a tenant/company. Referenced downstream by Dashboards, Reports, and Models strictly read-only.
- **Attributes (business level).**
  - Identifier (business-level; numbering series registered under `SPR-MOD-017-001`).
  - Name (locale-sensitive via `ENG-006`).
  - Description (locale-sensitive via `ENG-006`).
  - Category (references KPI Category master).
  - Classification (references KPI Classification master; drives visibility per `ADR-032`).
  - Owner (business role/team; resolved via MOD-001 identities read-only).
  - Unit (business-level; e.g. currency, count, percent — business semantics only).
  - Direction/Goal semantics (business-level; e.g. higher-is-better, lower-is-better).
  - Current version (references KPI Version master).
  - Documentation (locale-sensitive via `ENG-006`).
  - Lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`. Only **Active** KPIs may be referenced by consumers.
- **Uniqueness.** KPI definitions are unique within a tenant/company on `(category, name)`; enforced declaratively at capture time.
- **Validation.** Declarative structural and rule validation at capture time via the platform rules surface.
- **Audit.** All state changes audited via `ENG-004` per `ADR-014`.
- **Search.** Registered under `ENG-020`.

**KPI Category (business entity — MOD-017 authority).**

- **Purpose.** Business grouping used to organize KPIs in the catalog.
- **Uniqueness.** Category name unique within a tenant/company.
- **Lifecycle.** `Draft → Active → Inactive → Archived`.
- **Audit.** State changes audited via `ENG-004`.

**KPI Classification (business entity — MOD-017 authority).**

- **Purpose.** Approved classifications for sensitivity/data-classification hint; drives visibility per `ADR-032`.
- **Uniqueness.** Classification name unique within a tenant/company.
- **Lifecycle.** `Draft → Active → Inactive → Archived`.
- **Audit.** State changes audited via `ENG-004`.

**KPI Version (business entity — MOD-017 authority).**

- **Purpose.** Immutable version record of a KPI at a point in time.
- **Attributes.** Version number (monotonic per KPI); definition snapshot (business-level); publication timestamp; author (via MOD-001 read-only); prior version reference.
- **Invariant.** At most one Active version per KPI at any time.
- **Audit.** State changes audited via `ENG-004`.

**KPI Ownership metadata (attribute of KPI).**

- References MOD-001 role/team read-only; not owned or redefined here.

### 4.2 Configuration

This sprint introduces **no new** Analytics Foundation configuration keys. The keys established under `SPR-MOD-017-001` (Analytics module configuration, environment-level analytics settings) are consumed read-only through `ENG-005`.

### 4.3 Transactions

**No transactional authority is established in this sprint.** MOD-017 remains read-model-only against source-module transactional truth. The MOD-017 transactions declared in the Module PRD §6 (Report Run, Dashboard View, Model Run) are allocated to `SPR-MOD-017-004`, `SPR-MOD-017-003`, and `SPR-MOD-017-005` respectively by the approved Sprint Plan.

---

## 5. Business Rules

Module- and sprint-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

1. **Unique identifiability.** Every KPI definition shall be uniquely identifiable within a tenant/company (uniqueness on `(category, name)`).
2. **Version traceability.** Every KPI shall carry a monotonically increasing version; every prior version shall remain traceable via the KPI Version master.
3. **Single active version.** At most one Active version of a KPI shall exist at any time; only Active KPIs may be referenced by downstream consumers.
4. **Approved classifications.** KPI classifications shall follow the approved KPI Classification master; no ad-hoc classifications may be assigned.
5. **Sensitive-KPI visibility.** Sensitive-KPI visibility shall follow `ADR-032`, enforced via `ENG-002` and `ENG-003`; row-level access shall be respected on every read.
6. **Metadata auditability.** Every state-changing operation on a KPI record, KPI Category, KPI Classification, or KPI Version shall be auditable via `ENG-004` per `ADR-014`.
7. **Read-model-only.** Analytics remains read-model-only. No KPI operation shall mutate source-module master or transactional data.
8. **Lifecycle enforcement.** KPI, KPI Category, and KPI Classification lifecycle transitions (`Draft → Active → Inactive → Archived`) shall be enforced declaratively; transitions that would violate this ordering shall be rejected at capture time.
9. **Catalog integrity.** The KPI Metric Catalog shall expose only Active KPI definitions; deprecation of a KPI shall remove it from the catalog projection without deleting historical versions.

---

## 6. Events

### 6.1 Events Published (Sprint 002 KPI Framework events)

| Event | Emitted On | Purpose |
| --- | --- | --- |
| `KPIDefined` | A KPI record enters `Active` for the first time (Draft → Active transition of its first version) | Signals to downstream MOD-017 sprints and downstream modules that a new KPI is available in the catalog. |
| `KPIUpdated` | A KPI's metadata, category, classification, ownership, or documentation changes (non-version-bumping edit) | Signals to downstream consumers that the KPI's business definition changed. |
| `KPIVersioned` | A new KPI Version is published, superseding the prior Active version | Signals to downstream consumers that a new authoritative version is available. |
| `KPIActivated` | A KPI transitions to `Active` (from `Draft` or `Inactive`) | Signals catalog inclusion. |
| `KPIDeactivated` | A KPI transitions to `Inactive` or `Archived` | Signals catalog removal. |

Events are emitted via `ENG-024` and traced to their originating audit record in `ENG-004`.

### 6.2 Events Consumed

Only upstream platform events explicitly allocated. In Sprint 002 the KPI Framework and Metric Catalog are consumers of the Data Mart master and Analytics Foundation configuration established under `SPR-MOD-017-001` — read-only. No source-module transactional event is consumed here; source-module event consumption at scale is allocated to `SPR-MOD-017-005`.

No new event contract is defined outside the Sprint Plan and Module PRD allocation.

---

## 7. Integrations

MOD-017 Analytics **consumes** the following platform services in this sprint. None are redefined; ownership remains with the engine owner.

| Engine | Role in Sprint 002 |
| --- | --- |
| `ENG-001` Identity | Resolve caller identity for KPI authoring, versioning, and catalog maintenance. |
| `ENG-002` Authorization | Authorize KPI authoring and enforce sensitive-KPI visibility per `ADR-032`. |
| `ENG-003` Permission Management | Resolve role and permission grants for KPI authoring and consumption. |
| `ENG-004` Audit | Persist audit records for every state change per `ADR-014`. |
| `ENG-005` Configuration | Read-only consumption of Analytics module configuration and environment-level analytics settings established under `SPR-MOD-017-001`. |
| `ENG-006` Localization | Resolve locale-sensitive KPI attributes (name, description, documentation). |
| `ENG-010` Workflow | Support the KPI definition-to-publish process (Draft → Review → Active), where a long-running workflow is required. |
| `ENG-011` Approval | Support multi-step approval on KPI publication where configured. |
| `ENG-017` Numbering | Allocate identifiers for KPI documents where required (series registered under `SPR-MOD-017-001`). |
| `ENG-020` Search | Register the KPI master for read discoverability. |
| `ENG-024` Event | Publish `KPIDefined`, `KPIUpdated`, `KPIVersioned`, `KPIActivated`, `KPIDeactivated`. |

No engine ownership is established by this sprint.

---

## 8. Dependencies

### 8.1 Upstream Dependencies

- **Governance Framework v1.0** — Released.
- **GT-003 v1.0** — Active.
- **FROZEN Execution Wrapper v1.0** — FROZEN.
- **Module PRD** — [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../../20-module-prds/analytics/MODULE_PRD.md) — Approved.
- **Sprint Plan** — [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../MOD-017_SPRINT_PLAN.md) — Approved.
- **Upstream Sprint PRD** — [`SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md`](./SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md) — Draft (structural reference; Data Mart master and Analytics Foundation configuration consumed read-only).
- **Prior repository audit** — `REPOSITORY_AUDIT_20260717T151727Z` — Repository READY.

### 8.2 Engine and ADR Dependencies

- **Engines required (Sprint 002):** `ENG-001`, `ENG-002`, `ENG-003`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-010`, `ENG-011`, `ENG-017`, `ENG-020`, `ENG-024`.
- **ADRs consumed:** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.

### 8.3 Sprint Dependencies

- **Upstream sprint dependencies.** `SPR-MOD-017-001` (Analytics Foundation & Data Marts).
- **Downstream sprints.** `SPR-MOD-017-003` … `SPR-MOD-017-005` depend on this sprint per the approved Sprint Plan §3 dependency graph.

---

## 9. Acceptance Criteria

Each acceptance criterion binds to one or more functional requirements from §2 / §4 or one business rule from §5. Numbering is stable within this document.

1. **AC-001 — KPI creation.** A caller with appropriate `ENG-002` / `ENG-003` grants can create a KPI record under a tenant/company; the record persists with all required attributes; `KPIDefined` is emitted via `ENG-024` on first activation; an `ENG-004` audit record is written. (Deliverable 1; Rule 1, 6.)
2. **AC-002 — KPI unique identifiability.** Attempting to create a KPI whose `(category, name)` collides with an existing record under the same tenant/company is rejected at capture time by the platform rules surface. (Deliverable 1; Rule 1.)
3. **AC-003 — KPI metadata update.** A caller with appropriate grants can edit a KPI's metadata (name, description, category, classification, owner, unit, direction/goal, documentation); `KPIUpdated` is emitted via `ENG-024`; an `ENG-004` audit record is written. (Deliverable 1, 5, 9; Rule 6.)
4. **AC-004 — KPI lifecycle.** A KPI record follows the `Draft → Active → Inactive → Archived` lifecycle; transitions that would violate this ordering are rejected at capture time; every transition is audited; `KPIActivated` / `KPIDeactivated` are emitted via `ENG-024`. (Deliverable 1; Rule 8, 6.)
5. **AC-005 — KPI versioning.** Publishing a new authoritative version of a KPI creates a new KPI Version record with a monotonic version number and preserves prior versions; `KPIVersioned` is emitted via `ENG-024`. (Deliverable 4; Rule 2.)
6. **AC-006 — Single active version.** At any point in time, at most one Active version of a KPI exists; attempts to publish a second Active version simultaneously are rejected at capture time. (Deliverable 4; Rule 3.)
7. **AC-007 — Approved classifications.** Assigning a classification not present in the KPI Classification master is rejected at capture time. (Deliverable 3; Rule 4.)
8. **AC-008 — KPI Category lifecycle.** KPI Category records follow the `Draft → Active → Inactive → Archived` lifecycle; violations are rejected at capture time; all state changes audited. (Deliverable 2; Rule 8, 6.)
9. **AC-009 — KPI Classification lifecycle.** KPI Classification records follow the `Draft → Active → Inactive → Archived` lifecycle; violations are rejected at capture time; all state changes audited. (Deliverable 3; Rule 8, 6.)
10. **AC-010 — KPI Ownership metadata.** KPI ownership references a MOD-001-resolved role/team and is not redefined by MOD-017; ownership edits are audited. (Deliverable 5; Rule 6.)
11. **AC-011 — Sensitive-KPI visibility.** Sensitive KPIs are visible only to callers whose `ENG-002` / `ENG-003` grants satisfy `ADR-032`; row-level access is enforced on every read. (Deliverable 7; Rule 5.)
12. **AC-012 — KPI validation at capture time.** KPI records, KPI Versions, KPI Categories, and KPI Classifications are validated declaratively at capture time; invalid inputs are rejected before persistence. (Deliverable 6; Rule 1, 2, 3, 4, 8.)
13. **AC-013 — KPI searchability.** The KPI master is registered under `ENG-020` and Active KPIs are discoverable via read-only search subject to visibility. (Deliverable 8; Rule 5.)
14. **AC-014 — KPI documentation.** KPI documentation is locale-sensitive via `ENG-006` and resolves per the caller's locale. (Deliverable 9.)
15. **AC-015 — KPI Metric Catalog exposure.** The KPI Metric Catalog exposes only Active KPI definitions; deprecation removes a KPI from the catalog projection without deleting historical versions. (Deliverable 10; Rule 9.)
16. **AC-016 — Catalog change signals.** Catalog inclusions and removals emit `KPIActivated` / `KPIDeactivated` via `ENG-024`; version changes emit `KPIVersioned`. (Deliverable 10, 11; Rule 2, 3, 9.)
17. **AC-017 — Read-model-only.** No Sprint 002 operation writes to a source module's master or transactional data. (Deliverable 12; Rule 7.)
18. **AC-018 — Audit trail.** Every state-changing operation in §2 (KPI, KPI Category, KPI Classification, KPI Version create/edit/lifecycle; catalog maintenance) emits an `ENG-004` audit record per `ADR-014`. (Deliverables 1–4, 10; Rule 6.)
19. **AC-019 — Ownership boundaries preserved.** No MOD-001 / MOD-002 / source-module authority is redefined; MOD-017 does not claim ownership of any platform engine. (Deliverable 12.)

---

## 10. Ownership Boundaries

Recapitulated from §1.1.3 (not evolved):

- **MOD-017 Analytics** owns the KPI Framework and KPI Metric Catalog authorities (this sprint), and continues to own Data Mart and Analytics Foundation configuration established under `SPR-MOD-017-001`.
- **Source modules** continue to own all transactional and master data; MOD-017 consumes strictly read-only.
- **Platform modules and engines** retain ownership of Identity (`ENG-001` / MOD-001), Authorization (`ENG-002` / MOD-001), Permission (`ENG-003` / MOD-001), Configuration (`ENG-005`), Audit (`ENG-004`), Workflow (`ENG-010`), Approval (`ENG-011`), Search (`ENG-020`), Event infrastructure (`ENG-024`), Numbering (`ENG-017`), and Localization (`ENG-006`).
- **Analytics remains a read-model-only consumer** of operational data.

**No ownership reassignment. No transactional authority introduced.**

---

## 11. Non-Goals

- No Data Mart master, Analytics Foundation configuration, refresh cadence, retention, ingestion contracts, numbering series registration, module-wide search-index baseline (allocated to `SPR-MOD-017-001`).
- No Dashboard master, Dashboard View transaction, freshness-declaration rule, drill-downs, or `DashboardShared` publication (allocated to `SPR-MOD-017-003`).
- No visualization surfaces of any kind.
- No Distribution List master, Report Run transaction, scheduled distribution execution, distribution channels configuration, bulk exports, or `ReportPublished` publication (allocated to `SPR-MOD-017-004`).
- No reporting execution or export execution surfaces.
- No Model Run transaction, Anomaly Highlights, cross-module event consumption as mart inputs, compliance/retention audit-readiness reporting, `ModelRunCompleted` publication, or read-only surface provided to MOD-018 (allocated to `SPR-MOD-017-005`).
- No cross-module analytical models.
- No Module Baseline. No Module Publication.
- No transactional authority. No modification of source-module master or transactional data.
- No redefinition of any ERP Core Engine or ADR.
- No Module PRD modification. No Sprint Plan modification.
- No implementation activity (schema, code, routes, migrations, UI).
- No governance evolution. No GT template evolution. No Wrapper evolution.

---

## 12. References

- [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../../20-module-prds/analytics/MODULE_PRD.md) — Parent Module PRD (authoritative).
- [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../MOD-017_SPRINT_PLAN.md) — Parent Sprint Plan (Stage 1).
- [`docs/30-sprint-prds/analytics/README.md`](../README.md) — Sprint container.
- [`docs/30-sprint-prds/analytics/sprints/SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md`](./SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md) — Upstream Sprint PRD (structural reference).
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md) — Module lifecycle workflow.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring rules.
- [`docs/SPRINT_ESTIMATION_GUIDE.md`](../../../SPRINT_ESTIMATION_GUIDE.md) — Sprint sizing.
- [`docs/SPRINT_DEPENDENCY_MATRIX.md`](../../../SPRINT_DEPENDENCY_MATRIX.md) — Sprint dependency rules.
- [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) — Sprint catalog projection.
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md) — ERP Core Engines (authoritative).
- [`docs/11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md) — Accepted ADRs.
- [`docs/50-audit-reports/REPOSITORY_AUDIT_20260717T151727Z.md`](../../../50-audit-reports/REPOSITORY_AUDIT_20260717T151727Z.md) — Preceding audit (Repository READY).
