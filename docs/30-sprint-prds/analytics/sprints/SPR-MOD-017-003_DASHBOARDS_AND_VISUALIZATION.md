---
title: "SPR-MOD-017-003 — Dashboards & Visualization"
summary: "Sprint PRD for the Dashboard and Visualization authorities of MOD-017 Analytics: Dashboard master (definition, metadata, layout, ownership, lifecycle, visibility, filtering, grouping), Dashboard View transaction, freshness-declaration rule, drill-downs, Executive/Domain dashboard scaffolding, `DashboardShared` publication. Consumes ERP Core Engines and Accepted ADRs; never redefines them. Analytics remains read-model-only relative to source-module transactional truth."
layer: "delivery"
owner: "Insights"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-017-003"
parent_module: "MOD-017"
parent_sprint_plan: "MOD-017_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "21.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-006", "ENG-010", "ENG-012", "ENG-017", "ENG-020", "ENG-022", "ENG-024"]
related_adrs: ["ADR-011", "ADR-032", "ADR-081"]
tags: ["sprint", "prd", "analytics", "mod-017", "dashboards", "visualization", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD017-003-20260717T180000Z-001"
parent_result_id: "GT003-MOD017-002-20260717T170000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-017-003 — Dashboards & Visualization

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-017 Analytics** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Analytics is **read-model-only** relative to source-module transactional truth. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-017-003` (permanent) |
| Parent Module | `MOD-017` — Analytics |
| Parent Sprint Plan | [`MOD-017_SPRINT_PLAN.md`](../MOD-017_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint Dependencies | `SPR-MOD-017-001`, `SPR-MOD-017-002` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Dashboard-authoring** capability for MOD-017 Analytics by establishing two authorities allocated to Sprint 003 by the approved Sprint Plan:

- **Dashboard Authority** — the business authority over Dashboard master (definition, metadata, layout, ownership, lifecycle, visibility, filtering, grouping) and the Dashboard View transaction lifecycle, including drill-down navigation and Executive/Domain dashboard scaffolding.
- **Visualization Authority** — the business authority over Visualization configuration, metadata, and validation as declared within a Dashboard definition.

> **Analytics Ownership Convention (recapitulated).** MOD-017 Analytics owns Dashboard and Visualization business semantics. ERP Core Engines provide shared infrastructure. MOD-017 **MUST NOT** redefine engine behavior. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Source-module master and transactional data remain exclusive to their owning modules and are consumed **read-only**. Ledger effects remain exclusive to **MOD-002 Accounting**.

#### 1.1.1 Dashboard Authority

The **Dashboard** business entity is authoritatively owned by MOD-017 Analytics. This sprint establishes:

- **Dashboard definition management** — authoring Dashboard records under a tenant/company with all required business metadata.
- **Dashboard metadata** — descriptive attributes (name, description, category/group, owner, freshness declaration, category tags) consumed by all downstream reads.
- **Dashboard layout configuration** — the business-level layout composition (regions, visualization placement) declared per Dashboard.
- **Dashboard ownership metadata** — the business role/team accountable for the Dashboard.
- **Dashboard lifecycle** — the standard `Draft → Active → Inactive → Archived` lifecycle; only **Active** Dashboards may be published or shared.
- **Dashboard visibility** — enforced via `ENG-002` and `ENG-003` per `ADR-032`, including row-level access on every read; drill-down navigation preserves tenant/permission scope.
- **Dashboard filtering** — declarative filter definitions available on a Dashboard (business level).
- **Dashboard grouping** — Dashboards may be organized under a Dashboard Group master (Executive Overview, Domain-specific dashboards).
- **Dashboard freshness declaration** — every Dashboard declares its data-freshness expectation, resolved deterministically via `ENG-012` per Module PRD §7 Business Rules.
- **Dashboard searchability** — the Dashboard master registered under `ENG-020` for read discoverability.
- **Dashboard validation** — declarative structural and rule validation of Dashboard records at capture time.
- **Dashboard View transaction** — the run-time act of rendering a Dashboard is a Dashboard View transaction executed via `ENG-010` and rendered via `ENG-022`; document numbers issued through `ENG-017`; state changes audited via `ENG-004`.
- **Drill-down navigation** — declarative drill-down targets on visualizations that preserve tenant/permission scope via `ENG-002`.
- **`DashboardShared` publication** — publication of the `DashboardShared` domain event via `ENG-024` when a Dashboard is shared with a caller/audience.

No other module MAY create, edit, activate, deactivate, archive, or independently maintain a parallel Dashboard master. Downstream MOD-017 sprints and downstream modules consume the Dashboard master strictly through Analytics-owned read surfaces.

#### 1.1.2 Visualization Authority

The **Visualization Configuration** is authoritatively owned by MOD-017 Analytics in this sprint. This sprint establishes:

- **Visualization configuration** — the business-level configuration of a visualization block within a Dashboard definition (visualization type, bound KPI reference, filter binding, display options).
- **Visualization metadata** — descriptive attributes needed for rendering and discoverability.
- **Visualization validation** — declarative validation ensuring a visualization's configuration is compatible with its host Dashboard definition and references only Active KPI definitions from the KPI Metric Catalog (established under `SPR-MOD-017-002`).

Visualizations exist only in the context of a Dashboard definition; they are not independently addressable authorities outside a Dashboard.

#### 1.1.3 Analytics ↔ Platform, Source Modules, and Downstream Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management. Analytics consumes these read-only.
- **Source modules** own master and transactional data. Analytics consumes source data strictly read-only through mart projections established in `SPR-MOD-017-001`.
- **KPI master and KPI Metric Catalog** remain owned by MOD-017 Analytics under `SPR-MOD-017-002` and are consumed here read-only.
- **Data Mart master and Analytics Foundation configuration** remain owned by MOD-017 Analytics under `SPR-MOD-017-001` and are consumed here read-only.
- **Scheduled distribution, Reporting, and Export** authorities are allocated to `SPR-MOD-017-004` and are **out of scope** here.
- **Analytical models and cross-module analytics** are allocated to `SPR-MOD-017-005` and are **out of scope** here.

Ownership boundaries SHALL NOT be redefined in downstream MOD-017 Sprint PRDs.

### 1.2 In Scope

- **Dashboard master** — create, edit, activate, deactivate, archive under a tenant/company; locale-sensitive attributes via `ENG-006`.
- **Dashboard metadata** — name, description, category tags, owner, freshness declaration.
- **Dashboard layout** — declarative layout composition (regions, visualization placement).
- **Dashboard Group master** — Executive Overview, Domain-specific groupings.
- **Dashboard Visibility** — sensitive-Dashboard visibility per `ADR-032`, row-level access on read.
- **Dashboard filtering** — declarative filter definitions per Dashboard.
- **Dashboard ownership metadata** — role/team accountable (resolved via MOD-001 read-only).
- **Dashboard activation/deactivation** — lifecycle transitions enforced declaratively.
- **Dashboard freshness declaration** — every Dashboard declares a data-freshness expectation resolved via `ENG-012`.
- **Dashboard searchability** — registration under `ENG-020`.
- **Dashboard validation** — declarative structural and rule validation at capture time.
- **Visualization Configuration** — business-level configuration of visualization blocks within a Dashboard.
- **Visualization validation** — declarative validation against host Dashboard and KPI Metric Catalog.
- **Dashboard View transaction** — lifecycle via `ENG-010`; rendering via `ENG-022`; numbering via `ENG-017`; audit via `ENG-004`.
- **Drill-down navigation** — declarative drill-down targets preserving tenant/permission scope.
- **`DashboardShared` publication** — via `ENG-024`.
- **Audit** — every state change on a Dashboard, Dashboard Group, Visualization Configuration, or Dashboard View transaction audited via `ENG-004` per `ADR-014`.

### 1.3 Out of Scope

- Data Mart master, Analytics Foundation configuration, refresh cadence, retention, ingestion contracts, numbering series registration, module-wide search-index baseline — allocated to `SPR-MOD-017-001`.
- KPI master, KPI Categories, KPI Classifications, KPI Versioning, KPI Metric Catalog authority, KPI Framework events (`KPIDefined`, `KPIUpdated`, `KPIVersioned`, `KPIActivated`, `KPIDeactivated`) — allocated to `SPR-MOD-017-002`.
- Distribution List master, Report Run transaction, scheduled distribution execution, distribution channel configuration, bulk exports, `ReportPublished` publication — allocated to `SPR-MOD-017-004`.
- Model Run transaction, Anomaly Highlights, cross-module event consumption as mart inputs, compliance/retention audit-readiness reporting, `ModelRunCompleted` publication, read-only surface to MOD-018 — allocated to `SPR-MOD-017-005`.
- Analytical models. Predictive analytics. Cross-module analytics.
- Any redefinition of ERP Core Engine behavior.
- Physical schema, code, routes, migrations, and UI.
- Module Baseline and Module Publication.
- Governance evolution.

---

## 2. Sprint Deliverables

| # | Deliverable | Kind | Notes |
| --- | --- | --- | --- |
| 1 | Dashboard master authority | Master Data | Definition, metadata, uniqueness, lifecycle. |
| 2 | Dashboard Layout master | Master Data | Layout composition per Dashboard definition. |
| 3 | Dashboard Group master | Master Data | Executive Overview / Domain groupings. |
| 4 | Dashboard Visibility rule set | Master Data attribute | Per `ADR-032`; enforced by `ENG-002` / `ENG-003`. |
| 5 | Dashboard filtering definitions | Master Data attribute | Declarative filter definitions per Dashboard. |
| 6 | Dashboard ownership metadata | Master Data attribute | Role/team via MOD-001 read-only. |
| 7 | Dashboard freshness declaration | Business Rule | Declared per Dashboard; resolved deterministically via `ENG-012`. |
| 8 | Dashboard searchability | Integration | Dashboard master registered under `ENG-020`. |
| 9 | Dashboard validation | Rule surface | Declarative structural and rule validation at capture time. |
| 10 | Visualization Configuration | Master Data | Business-level configuration of visualization blocks within a Dashboard. |
| 11 | Visualization validation | Rule surface | Declarative validation vs Dashboard definition and KPI Metric Catalog. |
| 12 | Dashboard View transaction | Transaction | Lifecycle via `ENG-010`; render via `ENG-022`; numbering via `ENG-017`; audit via `ENG-004`. |
| 13 | Drill-down navigation | Business capability | Declarative drill-down targets; preserves tenant/permission scope via `ENG-002`. |
| 14 | Dashboard events published | Events | `DashboardCreated`, `DashboardUpdated`, `DashboardActivated`, `DashboardDeactivated`, `DashboardShared`. |
| 15 | Ownership boundaries recapitulation | Documentation | §1.1.3 — no reassignment. |

---

## 3. Traceability to Module PRD

Bidirectional traceability from the [MOD-017 Analytics Module PRD](../../../20-module-prds/analytics/MODULE_PRD.md) and the approved [MOD-017 Sprint Plan](../MOD-017_SPRINT_PLAN.md) to this Sprint PRD.

### 3.1 Forward Map — Module PRD → Sprint 003

| Module PRD Item | Module PRD § | Sprint Plan Allocation | Realized In This Sprint PRD |
| --- | --- | --- | --- |
| Dashboards and drill-downs | §2 Capabilities | SPR-MOD-017-003 (origin) | §1, §2, §4 |
| Submodule: Dashboards | §2 Submodules | SPR-MOD-017-003 (origin) | §1, §2 |
| Dashboard (Master Data) | §5 Master Data | SPR-MOD-017-003 (origin) | §4.1 Dashboard |
| Dashboard authoring process | §4 Business Processes | SPR-MOD-017-003 (origin) | §4.1 lifecycle; §5 rules; §6 events |
| Dashboard View (Transaction) | §6 Transactions | SPR-MOD-017-003 (origin) | §4.3 Dashboard View |
| Dashboards must declare data-freshness expectation | §7 Business Rules | SPR-MOD-017-003 (origin) | §5 Rule 6 |
| `DashboardShared` — published | §8 Integration Points | SPR-MOD-017-003 (origin) | §6.1 |
| Executive Overview; Domain-specific dashboards | §9 Reports & Analytics | SPR-MOD-017-003 (origin) | §4.1 Dashboard Group |

### 3.2 Reverse Map — Sprint 003 → Module PRD / Sprint Plan

| Sprint 003 Item | Traces To Module PRD | Traces To Sprint Plan |
| --- | --- | --- |
| Dashboard Authority | §2 Capabilities; §4 Business Processes; §5 Master Data; §6 Transactions; §7 Business Rules; §9 Reports & Analytics | §2 SPR-MOD-017-003 Objective / Boundaries |
| Visualization Authority | §2 Capabilities (Dashboards and drill-downs); §5 Master Data; §7 Business Rules | §2 SPR-MOD-017-003 Boundaries |
| Dashboard master | §5 Master Data (Dashboard) | §4.3 Master Data Forward Map (Dashboard → SPR-MOD-017-003) |
| Dashboard Layout / Group / Visibility / Filtering / Ownership metadata | §5 Master Data; §7 Business Rules | §2 SPR-MOD-017-003 Boundaries |
| Dashboard freshness declaration | §7 Business Rules | §2 SPR-MOD-017-003 Exit Criteria (freshness resolved deterministically via ENG-012) |
| Dashboard validation | §5 Validation Rules; §7 Business Rules | §2 SPR-MOD-017-003 Exit Criteria |
| Dashboard searchability | §12 ENG-020 Search | §2 SPR-MOD-017-003 Engines Consumed |
| Visualization Configuration / validation | §2 Capabilities (Dashboards and drill-downs); §5 Master Data | §2 SPR-MOD-017-003 Boundaries |
| Dashboard View transaction | §6 Transactions (Dashboard View) | §2 SPR-MOD-017-003 Exit Criteria (Dashboard View via ENG-010; render via ENG-022) |
| Drill-down navigation | §2 Capabilities; §9 Reports & Analytics | §2 SPR-MOD-017-003 Exit Criteria (drill-downs preserve tenant/permission scope) |
| DashboardCreated / DashboardUpdated / DashboardActivated / DashboardDeactivated / DashboardShared | §8 Integration Points (`DashboardShared` — published); event surface derived from §2 and §4 | §2 SPR-MOD-017-003 Exit Criteria (`DashboardShared` publishes via `ENG-024`) |

### 3.3 Bidirectional Completeness

Every deliverable in §2 traces to at least one Module PRD section and to the approved Sprint Plan's SPR-MOD-017-003 allocation. Every Module PRD item allocated to SPR-MOD-017-003 by the approved Sprint Plan is realized by exactly one deliverable in §2. No orphan requirement. No scope expansion. Analytics remains read-model-only against source-module transactional truth.

---

## 4. Data Model Impact

### 4.1 Master Data

**Dashboard (business entity — MOD-017 authority).**

- **Purpose.** Represents a single business Dashboard under a tenant/company; referenced by Dashboard View transactions and shared with recipients per `ADR-032`.
- **Attributes (business level).**
  - Identifier (business-level; numbering series registered under `SPR-MOD-017-001`).
  - Name (locale-sensitive via `ENG-006`).
  - Description (locale-sensitive via `ENG-006`).
  - Group (references Dashboard Group master).
  - Owner (business role/team; resolved via MOD-001 read-only).
  - Layout (references Dashboard Layout master).
  - Filter definitions (declarative business-level filter set).
  - Freshness declaration (data-freshness expectation resolvable via `ENG-012`).
  - Visibility classification (drives visibility per `ADR-032`).
  - Lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`. Only **Active** Dashboards may be published or shared.
- **Uniqueness.** Dashboard definitions are unique within a tenant/company on `(group, name)`; enforced declaratively at capture time.
- **Validation.** Declarative structural and rule validation at capture time.
- **Audit.** All state changes audited via `ENG-004` per `ADR-014`.
- **Search.** Registered under `ENG-020`.

**Dashboard Layout (business entity — MOD-017 authority).**

- **Purpose.** Declarative layout composition of a Dashboard (regions, visualization placement).
- **Attributes.** Regions; visualization placement per region; ordering; business-level layout metadata.
- **Lifecycle.** `Draft → Active → Inactive → Archived`.
- **Audit.** State changes audited via `ENG-004`.

**Dashboard Group (business entity — MOD-017 authority).**

- **Purpose.** Business grouping used to organize Dashboards (Executive Overview, Domain-specific groupings).
- **Uniqueness.** Group name unique within a tenant/company.
- **Lifecycle.** `Draft → Active → Inactive → Archived`.
- **Audit.** State changes audited via `ENG-004`.

**Dashboard Visibility (attribute of Dashboard).**

- **Purpose.** Sensitivity/visibility hint driving enforcement per `ADR-032` via `ENG-002` + `ENG-003`.

**Visualization Configuration (business entity — MOD-017 authority).**

- **Purpose.** Business-level configuration of a visualization block within a Dashboard definition.
- **Attributes.** Visualization type; bound KPI reference (references KPI Metric Catalog established in Sprint 002, read-only); filter binding; display options.
- **Uniqueness.** Unique per `(dashboard, region, ordinal)` within a tenant/company.
- **Lifecycle.** Bound to host Dashboard lifecycle.
- **Validation.** Configuration MUST reference only Active KPI definitions in the KPI Metric Catalog; MUST comply with host Dashboard layout.
- **Audit.** State changes audited via `ENG-004`.

### 4.2 Configuration

This sprint introduces **no new** Analytics Foundation configuration keys. Keys established under `SPR-MOD-017-001` are consumed read-only through `ENG-005`. Dashboard freshness declarations are resolved deterministically via `ENG-012` from Module-PRD-scoped rule inputs.

### 4.3 Transactions

**Dashboard View (business transaction — MOD-017 authority).**

- **Purpose.** The run-time act of a caller rendering a Dashboard; captures the caller, the resolved visibility scope, the selected filter binding, and the rendered snapshot reference.
- **Lifecycle.** `Requested → Rendered | Rejected` (rejected on visibility or validation failure).
- **Execution.** Executed via `ENG-010` Workflow; rendered via `ENG-022` Dashboard Engine; numbered via `ENG-017`; audited via `ENG-004`.
- **Read-model-only invariant.** A Dashboard View transaction reads from mart projections (established in Sprint 001) and the KPI Metric Catalog (established in Sprint 002); it MUST NOT mutate any source-module master or transactional data.
- **Drill-down.** Drill-down navigation from a Dashboard View preserves the caller's tenant/permission scope via `ENG-002`; drill-down targets are declared on the Visualization Configuration.

No other transactional authority is introduced in this sprint. The Report Run and Model Run transactions declared in the Module PRD §6 are allocated to `SPR-MOD-017-004` and `SPR-MOD-017-005` respectively.

---

## 5. Business Rules

Module- and sprint-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

1. **Unique identifiability.** Every Dashboard definition shall be uniquely identifiable within a tenant/company (uniqueness on `(group, name)`).
2. **Visibility enforcement.** Dashboard visibility shall follow authorization policies per `ADR-032`, enforced via `ENG-002` and `ENG-003`; row-level access shall be respected on every read; drill-down navigation shall preserve tenant/permission scope.
3. **Metadata auditability.** Every state-changing operation on a Dashboard, Dashboard Layout, Dashboard Group, Visualization Configuration, or Dashboard View transaction shall be auditable via `ENG-004` per `ADR-014`.
4. **Publication requires Active.** Only Active Dashboards may be published or shared; publication or sharing of a non-Active Dashboard shall be rejected at capture time.
5. **Visualization compliance.** Every Visualization Configuration shall comply with its host Dashboard definition and shall reference only Active KPI definitions from the KPI Metric Catalog established in Sprint 002; violations shall be rejected at capture time.
6. **Freshness declaration.** Every Dashboard shall declare a data-freshness expectation, resolved deterministically via `ENG-012`; a Dashboard without a freshness declaration shall not enter Active state.
7. **Read-model-only.** Analytics remains read-model-only. No Sprint 003 operation shall mutate source-module master or transactional data.
8. **Lifecycle enforcement.** Dashboard, Dashboard Layout, and Dashboard Group lifecycle transitions (`Draft → Active → Inactive → Archived`) shall be enforced declaratively; transitions that would violate this ordering shall be rejected at capture time.
9. **Dashboard View integrity.** A Dashboard View transaction shall render only Active Dashboards; visibility, filter binding, and freshness shall be resolved at execution time; failures shall transition the transaction to `Rejected` with an audit trail.

---

## 6. Events

### 6.1 Events Published (Sprint 003 Dashboard events)

| Event | Emitted On | Purpose |
| --- | --- | --- |
| `DashboardCreated` | A Dashboard record is created (Draft) | Signals to downstream consumers that a new Dashboard definition exists. |
| `DashboardUpdated` | A Dashboard's metadata, layout, filter definitions, ownership, group, or visibility changes | Signals to downstream consumers that the Dashboard's business definition changed. |
| `DashboardActivated` | A Dashboard transitions to `Active` (from `Draft` or `Inactive`) | Signals eligibility for publication and sharing. |
| `DashboardDeactivated` | A Dashboard transitions to `Inactive` or `Archived` | Signals ineligibility for further publication or sharing. |
| `DashboardShared` | A Dashboard is shared with a caller/audience under visibility rules | Signals downstream distribution consumers per Module PRD §8. |

Events are emitted via `ENG-024` and traced to their originating audit record in `ENG-004`.

### 6.2 Events Consumed

Only upstream platform events explicitly allocated. In Sprint 003 the Dashboard and Visualization authorities are consumers of:

- **Data Mart master and Analytics Foundation configuration** established under `SPR-MOD-017-001` — read-only.
- **KPI Metric Catalog and KPI Framework events** established under `SPR-MOD-017-002` — read-only (Visualization Configurations reference Active KPI definitions).

No source-module transactional event is consumed here; source-module event consumption at scale is allocated to `SPR-MOD-017-005`. No new event contract is defined outside the Sprint Plan and Module PRD allocation.

---

## 7. Integrations

MOD-017 Analytics **consumes** the following platform services in this sprint. None are redefined; ownership remains with the engine owner.

| Engine | Role in Sprint 003 |
| --- | --- |
| `ENG-002` Authorization | Authorize Dashboard authoring and enforce Dashboard visibility per `ADR-032`; preserve tenant/permission scope on drill-down. |
| `ENG-004` Audit | Persist audit records for every state change per `ADR-014`. |
| `ENG-005` Configuration | Read-only consumption of Analytics module configuration established under `SPR-MOD-017-001`. |
| `ENG-006` Localization | Resolve locale-sensitive Dashboard attributes (name, description). |
| `ENG-010` Workflow | Execute the Dashboard View transaction lifecycle. |
| `ENG-012` Rules | Resolve the Dashboard data-freshness declaration deterministically. |
| `ENG-017` Numbering | Allocate identifiers for Dashboard View transactions (series registered under `SPR-MOD-017-001`). |
| `ENG-020` Search | Register the Dashboard master for read discoverability. |
| `ENG-022` Dashboard Engine | Render Dashboard content within a Dashboard View transaction. |
| `ENG-024` Event | Publish `DashboardCreated`, `DashboardUpdated`, `DashboardActivated`, `DashboardDeactivated`, `DashboardShared`. |

No engine ownership is established by this sprint.

---

## 8. Dependencies

### 8.1 Upstream Dependencies

- **Governance Framework v1.0** — Released.
- **GT-003 v1.0** — Active.
- **FROZEN Execution Wrapper v1.0** — FROZEN.
- **Module PRD** — [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../../20-module-prds/analytics/MODULE_PRD.md) — Approved.
- **Sprint Plan** — [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../MOD-017_SPRINT_PLAN.md) — Approved.
- **Upstream Sprint PRDs** —
  - [`SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md`](./SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md) — Draft (Data Mart master and Analytics Foundation configuration consumed read-only).
  - [`SPR-MOD-017-002_KPI_FRAMEWORK_AND_METRIC_CATALOG.md`](./SPR-MOD-017-002_KPI_FRAMEWORK_AND_METRIC_CATALOG.md) — Draft (KPI Metric Catalog consumed read-only).
- **Prior repository audit** — `REPOSITORY_AUDIT_20260717T170000Z` — Repository READY.

### 8.2 Engine and ADR Dependencies

- **Engines required (Sprint 003):** `ENG-002`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-010`, `ENG-012`, `ENG-017`, `ENG-020`, `ENG-022`, `ENG-024`.
- **ADRs consumed:** `ADR-011` Multi-Tenant Isolation, `ADR-032` RBAC + ABAC, `ADR-081` Visualization/Dashboard Rendering Contract (per Module PRD reference).

### 8.3 Sprint Dependencies

- **Upstream sprint dependencies.** `SPR-MOD-017-001`, `SPR-MOD-017-002`.
- **Downstream sprints.** `SPR-MOD-017-004`, `SPR-MOD-017-005` depend on this sprint per the approved Sprint Plan §3 dependency graph.

---

## 9. Acceptance Criteria

Each acceptance criterion binds to one or more functional requirements from §2 / §4 or one business rule from §5. Numbering is stable within this document.

1. **AC-001 — Dashboard creation.** A caller with appropriate `ENG-002` / `ENG-003` grants can create a Dashboard record under a tenant/company; the record persists with all required attributes; `DashboardCreated` is emitted via `ENG-024`; an `ENG-004` audit record is written. (Deliverable 1; Rule 3.)
2. **AC-002 — Dashboard unique identifiability.** Attempting to create a Dashboard whose `(group, name)` collides with an existing record under the same tenant/company is rejected at capture time. (Deliverable 1; Rule 1.)
3. **AC-003 — Dashboard metadata update.** A caller with appropriate grants can edit a Dashboard's metadata (name, description, group, owner, freshness declaration, filter definitions, visibility, layout reference); `DashboardUpdated` is emitted via `ENG-024`; an `ENG-004` audit record is written. (Deliverables 1, 5, 6; Rule 3.)
4. **AC-004 — Dashboard lifecycle.** A Dashboard follows the `Draft → Active → Inactive → Archived` lifecycle; transitions that would violate this ordering are rejected at capture time; every transition is audited; `DashboardActivated` / `DashboardDeactivated` are emitted via `ENG-024`. (Deliverable 1; Rule 3, 8.)
5. **AC-005 — Dashboard Layout lifecycle.** Dashboard Layout records follow `Draft → Active → Inactive → Archived`; violations rejected at capture time; state changes audited. (Deliverable 2; Rule 3, 8.)
6. **AC-006 — Dashboard Group lifecycle.** Dashboard Group records follow `Draft → Active → Inactive → Archived`; violations rejected at capture time; state changes audited. (Deliverable 3; Rule 3, 8.)
7. **AC-007 — Sensitive Dashboard visibility.** Sensitive Dashboards are visible only to callers whose `ENG-002` / `ENG-003` grants satisfy `ADR-032`; row-level access is enforced on every read; drill-down navigation preserves the caller's tenant/permission scope. (Deliverables 4, 13; Rule 2.)
8. **AC-008 — Dashboard filtering.** Declarative filter definitions on a Dashboard are validated at capture time and applied at Dashboard View execution time. (Deliverable 5; Rule 9.)
9. **AC-009 — Dashboard ownership metadata.** Dashboard ownership references a MOD-001-resolved role/team and is not redefined by MOD-017; ownership edits are audited. (Deliverable 6; Rule 3.)
10. **AC-010 — Dashboard freshness declaration.** A Dashboard shall not enter Active state without a freshness declaration; the declared freshness is resolved deterministically via `ENG-012` at execution time. (Deliverable 7; Rule 6.)
11. **AC-011 — Dashboard searchability.** The Dashboard master is registered under `ENG-020` and Active Dashboards are discoverable via read-only search subject to visibility. (Deliverable 8; Rule 2.)
12. **AC-012 — Dashboard validation at capture time.** Dashboards, Dashboard Layouts, Dashboard Groups, and Visualization Configurations are validated declaratively at capture time; invalid inputs are rejected before persistence. (Deliverables 9, 11; Rules 1, 5, 8.)
13. **AC-013 — Visualization configuration.** A Visualization Configuration is uniquely addressable within its host Dashboard on `(dashboard, region, ordinal)` and complies with the host Dashboard layout. (Deliverable 10; Rule 5.)
14. **AC-014 — Visualization KPI binding.** A Visualization Configuration bound to a KPI shall reference only Active KPI definitions from the KPI Metric Catalog established in Sprint 002; violations rejected at capture time. (Deliverable 11; Rule 5.)
15. **AC-015 — Dashboard View transaction lifecycle.** A Dashboard View transaction executes via `ENG-010`, renders via `ENG-022`, receives a document number via `ENG-017`, and is audited via `ENG-004`; the transaction resolves visibility, filter binding, and freshness at execution time. (Deliverable 12; Rules 2, 6, 9.)
16. **AC-016 — Publication requires Active.** Sharing or publishing a non-Active Dashboard is rejected at capture time. (Deliverable 1; Rule 4.)
17. **AC-017 — Drill-down scope preservation.** Drill-down navigation from a Dashboard View preserves the caller's tenant/permission scope via `ENG-002`. (Deliverable 13; Rule 2.)
18. **AC-018 — Dashboard sharing signal.** Sharing an Active Dashboard emits `DashboardShared` via `ENG-024` with a corresponding `ENG-004` audit record. (Deliverable 14; Rules 3, 4.)
19. **AC-019 — Read-model-only.** No Sprint 003 operation writes to a source module's master or transactional data. (Deliverable 15; Rule 7.)
20. **AC-020 — Audit trail.** Every state-changing operation in §2 (Dashboard, Dashboard Layout, Dashboard Group, Visualization Configuration create/edit/lifecycle; Dashboard View transaction lifecycle; DashboardShared) emits an `ENG-004` audit record per `ADR-014`. (Deliverables 1–3, 10, 12, 14; Rule 3.)
21. **AC-021 — Ownership boundaries preserved.** No MOD-001 / MOD-002 / source-module authority is redefined; MOD-017 does not claim ownership of any platform engine; KPI authority (Sprint 002) and Data Mart authority (Sprint 001) remain unchanged. (Deliverable 15.)

---

## 10. Ownership Boundaries

Recapitulated from §1.1.3 (not evolved):

- **MOD-017 Analytics** owns the Dashboard and Visualization authorities established in this sprint, and continues to own KPI Framework and KPI Metric Catalog authorities (Sprint 002) and Data Mart and Analytics Foundation configuration (Sprint 001).
- **Source modules** continue to own all transactional and master data; MOD-017 consumes strictly read-only.
- **Platform modules and engines** retain ownership of Identity (`ENG-001` / MOD-001), Authorization (`ENG-002` / MOD-001), Permission (`ENG-003` / MOD-001), Configuration (`ENG-005`), Audit (`ENG-004`), Workflow (`ENG-010`), Rules (`ENG-012`), Search (`ENG-020`), Dashboard Engine (`ENG-022`), Event infrastructure (`ENG-024`), Numbering (`ENG-017`), and Localization (`ENG-006`).
- **Analytics remains a read-model-only consumer** of operational data.

**No ownership reassignment. No new authority beyond the Sprint Plan allocation.**

---

## 11. Non-Goals

- No Data Mart master, Analytics Foundation configuration, refresh cadence, retention, ingestion contracts, numbering series registration, or module-wide search-index baseline (allocated to `SPR-MOD-017-001`).
- No KPI master, KPI Category, KPI Classification, KPI Version, KPI Metric Catalog authority, or KPI Framework events (allocated to `SPR-MOD-017-002`).
- No Distribution List master, Report Run transaction, scheduled distribution, distribution channels configuration, bulk exports, or `ReportPublished` publication (allocated to `SPR-MOD-017-004`).
- No scheduled reporting; no export surfaces.
- No Model Run transaction, Anomaly Highlights, cross-module event consumption as mart inputs, compliance/retention audit-readiness reporting, `ModelRunCompleted` publication, or read-only surface provided to MOD-018 (allocated to `SPR-MOD-017-005`).
- No analytical models. No predictive analytics. No cross-module analytics.
- No Module Baseline. No Module Publication.
- No modification of source-module master or transactional data.
- No redefinition of any ERP Core Engine or ADR.
- No Module PRD modification. No Sprint Plan modification.
- No implementation activity (schema, code, routes, migrations, UI).
- No governance evolution. No GT template evolution. No Wrapper evolution.

---

## 12. References

- [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../../20-module-prds/analytics/MODULE_PRD.md) — Parent Module PRD (authoritative).
- [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../MOD-017_SPRINT_PLAN.md) — Parent Sprint Plan (Stage 1).
- [`docs/30-sprint-prds/analytics/README.md`](../README.md) — Sprint container.
- [`docs/30-sprint-prds/analytics/sprints/SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md`](./SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md) — Upstream Sprint PRD.
- [`docs/30-sprint-prds/analytics/sprints/SPR-MOD-017-002_KPI_FRAMEWORK_AND_METRIC_CATALOG.md`](./SPR-MOD-017-002_KPI_FRAMEWORK_AND_METRIC_CATALOG.md) — Upstream Sprint PRD.
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md) — Module lifecycle workflow.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring rules.
- [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) — Sprint catalog projection.
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md) — ERP Core Engines (authoritative).
- [`docs/11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md) — Accepted ADRs.
- [`docs/50-audit-reports/REPOSITORY_AUDIT_20260717T170000Z.md`](../../../50-audit-reports/REPOSITORY_AUDIT_20260717T170000Z.md) — Preceding audit (Repository READY).
