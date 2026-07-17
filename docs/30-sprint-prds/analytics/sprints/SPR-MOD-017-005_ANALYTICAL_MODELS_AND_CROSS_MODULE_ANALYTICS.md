---
title: "SPR-MOD-017-005 — Analytical Models & Cross-Module Analytics"
summary: "Sprint PRD for the Analytical Models and Cross-Module Analytics authorities of MOD-017 Analytics: Analytical Model master (definition, metadata, versioning, ownership, lifecycle, validation), Model Execution Configuration, Model Run transaction lifecycle, cross-module analytical views (Anomaly Highlights and trend/comparative surfaces), cross-module aggregation definitions consuming all module domain events read-only, compliance/retention audit-readiness surface, `ModelRunCompleted` publication, and the read-only surface provided to MOD-018 AI Workspace. Consumes ERP Core Engines and Accepted ADRs; never redefines them. Analytics remains read-model-only relative to source-module transactional truth."
layer: "delivery"
owner: "Insights"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-017-005"
parent_module: "MOD-017"
parent_sprint_plan: "MOD-017_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "21.0.5"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-014", "ENG-017", "ENG-021", "ENG-023", "ENG-024", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "analytics", "mod-017", "models", "cross-module-analytics", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD017-005-20260717T200000Z-001"
parent_result_id: "GT003-MOD017-004-20260717T190000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-017-005 — Analytical Models & Cross-Module Analytics

> **Stage 2 deliverable.** Fifth authored Sprint PRD for **MOD-017 Analytics** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Analytics is **read-model-only** relative to source-module transactional truth. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-017-005` (permanent) |
| Parent Module | `MOD-017` — Analytics |
| Parent Sprint Plan | [`MOD-017_SPRINT_PLAN.md`](../MOD-017_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint Dependencies | `SPR-MOD-017-001`, `SPR-MOD-017-002`, `SPR-MOD-017-003`, `SPR-MOD-017-004` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Analytical Models & Cross-Module Analytics** capability for MOD-017 Analytics by establishing the two authorities allocated to Sprint 005 by the approved Sprint Plan:

- **Analytical Models Authority** — the business authority over the Analytical Model master (definition, metadata, ownership, versioning, lifecycle, validation), Model Execution Configuration, and the Model Run transaction lifecycle as the run-time act of executing an Analytical Model.
- **Cross-Module Analytics Authority** — the business authority over cross-module analytical views (including Anomaly Highlights and trend/comparative analytical surfaces), cross-module aggregation definitions consuming all module domain events read-only, and the compliance/retention audit-readiness surface exposed as a read-only projection for MOD-018 AI Workspace and other downstream consumers.

> **Analytics Ownership Convention (recapitulated).** MOD-017 Analytics owns the Analytical Models and Cross-Module Analytics business semantics allocated to Sprint 005. ERP Core Engines provide shared infrastructure. MOD-017 **MUST NOT** redefine engine behavior. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Source-module master and transactional data remain exclusive to their owning modules and are consumed **read-only**. Ledger effects remain exclusive to **MOD-002 Accounting**.

#### 1.1.1 Analytical Models Authority

The **Analytical Model** business entity and its surrounding execution surface are authoritatively owned by MOD-017 Analytics under this sprint. This sprint establishes:

- **Analytical Model definition** — authoring Analytical Model records under a tenant/company with all required business metadata.
- **Analytical Model metadata** — descriptive attributes (name, description, owner, category tags, referenced Data Mart projections (Sprint 001, read-only) and/or KPI Metric Catalog entries (Sprint 002, read-only)).
- **Analytical Model ownership** — the business owner (role/team) resolved read-only through MOD-001 identity/permission surfaces; MOD-017 does not manage user identity.
- **Analytical Model versioning** — monotonic version identifiers; each published version is immutable; only one version is Active at a time within a tenant/company for a given Analytical Model.
- **Analytical Model lifecycle** — the standard `Draft → Active → Inactive → Archived` lifecycle; only **Active** Analytical Models may be executed by a Model Run or bound to a schedule.
- **Model Execution Configuration** — business-level configuration of a Model Run (input binding to Data Mart projections and KPI Metric Catalog entries, output binding to cross-module analytical views, optional AI-Copilot-assisted forecasting invocation via `ENG-028` as allowed by Module PRD §12).
- **Model Run transaction** — the run-time act of executing an Analytical Model; lifecycle `Requested → Running → Completed | Failed`; executed via `ENG-010`; scheduled via `ENG-014` where a schedule is declared; rendered via `ENG-021` where a reporting surface is bound; numbered via `ENG-017`; audited via `ENG-004`.
- **Analytical Model validation** — declarative structural and rule validation of Analytical Model records, version transitions, and Model Execution Configurations at capture time and at Model Run execution time.

No other module MAY create, edit, activate, deactivate, archive, version, or independently maintain a parallel Analytical Model master. Downstream MOD-017 baselines and downstream modules consume Analytical Models strictly through Analytics-owned read surfaces.

#### 1.1.2 Cross-Module Analytics Authority

The **Cross-Module Analytics** surface is authoritatively owned by MOD-017 Analytics under this sprint. This sprint establishes:

- **Analytical View definitions** — the business-level definition of cross-module analytical views, including Anomaly Highlights, trend analysis views, and comparative analysis views, as read-only projections over mart data and the KPI Metric Catalog.
- **Cross-module aggregation definitions** — the business-level definition of aggregations that combine data across two or more source modules; aggregation definitions preserve source-module ownership by consuming source-module domain events read-only via `ENG-024`.
- **Trend analysis definitions** — the business-level definition of time-series projections over KPI Metric Catalog entries and Data Mart projections.
- **Comparative analytics definitions** — the business-level definition of comparative projections across dimensions (period-over-period, segment-over-segment).
- **Compliance / retention audit-readiness surface** — a read-only projection consolidating data-classification and retention state derived from `ENG-005` configuration (retention per mart under Sprint 001; retention per Report Definition under Sprint 004) and the audit trail under `ENG-004` per `ADR-014`.
- **Read-only surface provided to MOD-018 AI Workspace** — the read-only projection over Analytical Views, cross-module aggregations, and the compliance/retention audit-readiness surface; MOD-018 consumes this read-only; no MOD-018 surface is redefined here.
- **`ModelRunCompleted` publication** — via `ENG-024` on Model Run completion, per Module PRD §8 Integration Points.

#### 1.1.3 Analytics ↔ Platform, Source Modules, and Downstream Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management. Analytics consumes these read-only.
- **Source modules** own master and transactional data. Analytics consumes source data strictly read-only through mart projections established in `SPR-MOD-017-001` and through source-module domain events via `ENG-024`.
- **KPI master and KPI Metric Catalog** remain owned by MOD-017 Analytics under `SPR-MOD-017-002` and are consumed here read-only.
- **Dashboard master and Dashboard View transaction** remain owned by MOD-017 Analytics under `SPR-MOD-017-003` and are consumed here read-only where an Analytical View is bound to a Dashboard surface.
- **Distribution, Reporting, and Export authorities** remain owned by MOD-017 Analytics under `SPR-MOD-017-004` and are consumed here read-only where a Model Run's output is bound to a Report Definition.
- **MOD-018 AI Workspace** consumes the read-only surface exposed here; MOD-018 surfaces are not redefined by MOD-017.

Ownership boundaries SHALL NOT be redefined in downstream MOD-017 artifacts.

### 1.2 In Scope

- **Analytical Model master** — create, edit, activate, deactivate, archive under a tenant/company; locale-sensitive attributes via localization surfaces consumed read-only.
- **Analytical Model metadata** — name, description, category tags, owner, referenced Data Mart projections and/or KPI Metric Catalog entries.
- **Analytical Model ownership** — business owner (role/team) resolved read-only through MOD-001.
- **Analytical Model versioning** — monotonic version identifiers; immutable published versions; single-Active-version invariant per tenant/company.
- **Analytical Model lifecycle** — `Draft → Active → Inactive → Archived`.
- **Model Execution Configuration** — declarative execution configuration (input binding, output binding, optional AI-Copilot invocation).
- **Model Run transaction** — lifecycle via `ENG-010`; scheduled execution via `ENG-014` where configured; render via `ENG-021` where a reporting surface is bound; numbering via `ENG-017`; audit via `ENG-004`.
- **Analytical Model validation** — declarative validation at capture and at Model Run execution time.
- **Cross-module analytical views** — Analytical View definitions including Anomaly Highlights, trend analysis, and comparative analysis views (read-only projections).
- **Cross-module aggregation definitions** — declarative definitions consuming all module domain events read-only via `ENG-024`.
- **Compliance / retention audit-readiness surface** — read-only projection over `ENG-005` retention configuration and `ENG-004` audit records per `ADR-014`.
- **Read-only surface to MOD-018 AI Workspace** — Analytics-owned read projection; no MOD-018 authoring here.
- **`ModelRunCompleted` publication** — via `ENG-024` on Model Run completion where allocated by Module PRD §8.
- **Audit** — every state change on an Analytical Model, Model Execution Configuration, Analytical View definition, or Model Run transaction audited via `ENG-004` per `ADR-014`.

### 1.3 Out of Scope

- Data Mart master, Analytics Foundation configuration, refresh cadence, retention (per-mart), ingestion contracts, numbering series registration, or module-wide search-index baseline — allocated to `SPR-MOD-017-001`.
- KPI master, KPI Categories, KPI Classifications, KPI Versioning, KPI Metric Catalog authority, or KPI Framework events (`KPIDefined`, `KPIUpdated`, `KPIVersioned`, `KPIActivated`, `KPIDeactivated`) — allocated to `SPR-MOD-017-002`.
- Dashboard master, Dashboard Layout, Dashboard Group, Visualization Configuration, Dashboard View transaction, drill-down navigation, or `DashboardShared` publication — allocated to `SPR-MOD-017-003`.
- Distribution List master, Report Definition master, Report Output/Retention Configuration, Report Run transaction, Delivery Configuration, Distribution Channel configuration, Export Configuration, `ReportPublished` / `ReportRunStarted` / `ReportRunCompleted` / `ExportCompleted` publication — allocated to `SPR-MOD-017-004`.
- Machine Learning training pipelines. Artificial Intelligence model authoring. Predictive AI model implementation. Generative AI content authoring. Autonomous decision-making. Workflow orchestration outside `ENG-010`.
- New operational transactions in source modules. Any mutation of source-module master or transactional data.
- Any redefinition of ERP Core Engine behavior, including `ENG-010` Workflow, `ENG-014` Scheduler, `ENG-021` Reporting, `ENG-023` Integration, `ENG-024` Event, `ENG-028` AI Copilot.
- Physical schema, code, routes, migrations, and UI.
- Module Baseline and Module Publication.
- Governance evolution.

---

## 2. Sprint Deliverables

| # | Deliverable | Kind | Notes |
| --- | --- | --- | --- |
| 1 | Analytical Model master authority | Master Data | Definition, metadata, ownership, uniqueness, lifecycle. |
| 2 | Analytical Model versioning | Master Data attribute | Monotonic version identifiers; immutable published versions; single-Active-version invariant per tenant/company. |
| 3 | Analytical Model visibility rule set | Master Data attribute | Per `ADR-032`; enforced via `ENG-002` / `ENG-003`. |
| 4 | Model Execution Configuration | Master Data attribute | Declarative execution configuration (input binding, output binding, optional AI-Copilot invocation via `ENG-028`). |
| 5 | Model Run transaction | Transaction | Lifecycle via `ENG-010`; schedule via `ENG-014`; render via `ENG-021` where bound; numbering via `ENG-017`; audit via `ENG-004`. |
| 6 | Analytical Model validation | Rule surface | Declarative validation at capture and at Model Run execution time. |
| 7 | Analytical View definitions (Cross-Module Analytics) | Master Data | Anomaly Highlights, trend analysis, comparative analysis (read-only projections). |
| 8 | Cross-module aggregation definitions | Master Data | Declarative aggregations consuming source-module domain events read-only via `ENG-024`. |
| 9 | Compliance / retention audit-readiness surface | Read-only projection | Consolidated view over `ENG-005` retention configuration and `ENG-004` audit records per `ADR-014`. |
| 10 | Read-only surface to MOD-018 AI Workspace | Read-only projection | Analytics-owned; MOD-018 consumes read-only. |
| 11 | Analytical Models & Cross-Module Analytics events published | Events | `AnalyticalModelDefined`, `AnalyticalModelUpdated`, `AnalyticalModelVersioned`, `AnalyticalModelActivated`, `AnalyticalModelDeactivated`, `ModelRunStarted`, `ModelRunCompleted`, `CrossModuleAnalyticsGenerated`. |
| 12 | Ownership boundaries recapitulation | Documentation | §1.1.3 — no reassignment. |

---

## 3. Traceability to Module PRD

Bidirectional traceability from the [MOD-017 Analytics Module PRD](../../../20-module-prds/analytics/MODULE_PRD.md) and the approved [MOD-017 Sprint Plan](../MOD-017_SPRINT_PLAN.md) to this Sprint PRD.

### 3.1 Forward Map — Module PRD → Sprint 005

| Module PRD Item | Module PRD § | Sprint Plan Allocation | Realized In This Sprint PRD |
| --- | --- | --- | --- |
| Analytical models and forecasts | §2 Capabilities | SPR-MOD-017-005 (origin) | §1, §2, §4 |
| Submodule: Models | §2 Submodules | SPR-MOD-017-005 (origin) | §1, §2 |
| Model refresh (business process) | §4 Business Processes | SPR-MOD-017-005 (origin) | §1.1.1, §4.3 Model Run |
| Model Run (Transaction) | §6 Transactions | SPR-MOD-017-005 (origin) | §4.3 Model Run |
| `ModelRunCompleted` — published | §8 Integration Points | SPR-MOD-017-005 (origin) | §6.1 |
| All module domain events — consumed | §8 Integration Points | SPR-MOD-017-005 (origin) | §6.2, §4.1 Cross-module aggregation definitions |
| Anomaly Highlights | §9 Reports & Analytics | SPR-MOD-017-005 (origin) | §4.1 Analytical View definitions |
| Compliance — data-classification and retention rules | §11 Non-functional Considerations | SPR-MOD-017-005 (origin) | §4.1 Compliance / retention audit-readiness surface |
| Provides To — MOD-018 AI Workspace | §13 Dependencies | SPR-MOD-017-005 (origin) | §1.1.2, §2 Deliverable 10 |

### 3.2 Reverse Map — Sprint 005 → Module PRD / Sprint Plan

| Sprint 005 Item | Traces To Module PRD | Traces To Sprint Plan |
| --- | --- | --- |
| Analytical Models Authority | §2 Capabilities (Analytical models and forecasts); §4 Business Processes (Model refresh); §5 Master Data (implied by §6 Model Run authorship); §6 Transactions (Model Run) | §2 SPR-MOD-017-005 Objective / Boundaries |
| Cross-Module Analytics Authority | §2 Capabilities (Analytical models and forecasts); §8 Integration Points (all module domain events consumed); §9 Reports & Analytics (Anomaly Highlights); §11 Non-functional Considerations (Compliance) | §2 SPR-MOD-017-005 Objective / Boundaries |
| Analytical Model master + versioning | §2 Submodules (Models); §6 Transactions (Model Run) | §2 SPR-MOD-017-005 Boundaries |
| Model Execution Configuration | §4 Business Processes (Model refresh); §10 Configuration (resolved read-only via `ENG-005`) | §2 SPR-MOD-017-005 Boundaries / Exit Criteria |
| Model Run transaction | §6 Transactions (Model Run) | §2 SPR-MOD-017-005 Exit Criteria (Model Run via `ENG-010`; schedule via `ENG-014`; render via `ENG-021`) |
| Analytical View definitions (Anomaly Highlights, trend, comparative) | §9 Reports & Analytics (Anomaly Highlights) | §2 SPR-MOD-017-005 Boundaries |
| Cross-module aggregation definitions | §8 Integration Points (all module domain events consumed) | §2 SPR-MOD-017-005 Boundaries |
| Compliance / retention audit-readiness surface | §11 Non-functional Considerations | §2 SPR-MOD-017-005 Exit Criteria (compliance/retention rules resolvable via `ENG-005`; audit via `ENG-004` per `ADR-014`) |
| Read-only surface to MOD-018 AI Workspace | §13 Dependencies (Provides To) | §2 SPR-MOD-017-005 Exit Criteria (read-only APIs exposed for MOD-018) |
| `ModelRunCompleted` publication + related events | §8 Integration Points (`ModelRunCompleted` — published) | §2 SPR-MOD-017-005 Exit Criteria (`ModelRunCompleted` publishes via `ENG-024`) |

### 3.3 Bidirectional Completeness

Every deliverable in §2 traces to at least one Module PRD section and to the approved Sprint Plan's SPR-MOD-017-005 allocation. Every Module PRD item allocated to SPR-MOD-017-005 by the approved Sprint Plan is realized by exactly one deliverable in §2. No orphan requirement. No scope expansion. Analytics remains read-model-only against source-module transactional truth.

---

## 4. Data Model Impact

### 4.1 Master Data

**Analytical Model (business entity — MOD-017 authority).**

- **Purpose.** Represents a business-level definition of an analytical model under a tenant/company, executed via a Model Run to produce cross-module analytical output.
- **Attributes (business level).**
  - Identifier (business-level; numbering series registered under `SPR-MOD-017-001`).
  - Name (locale-sensitive where applicable).
  - Description.
  - Owner (business role/team resolved via MOD-001 read-only).
  - Category tags.
  - Referenced Data Mart projections (Sprint 001, read-only).
  - Referenced KPI Metric Catalog entries (Sprint 002, read-only).
  - Version identifier (monotonic).
  - Visibility classification (drives visibility per `ADR-032`).
  - Model Execution Configuration (see below).
  - Lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`. Only **Active** Analytical Models may be executed or scheduled. Version identifiers are monotonic; a published version is immutable; only one version is Active at a time per tenant/company for a given Analytical Model.
- **Uniqueness.** The `(name, tenant, company)` tuple is unique for an Analytical Model. The `(Analytical Model identifier, version identifier)` tuple is unique.
- **Validation.** Declarative structural and rule validation at capture time and at Model Run execution time.
- **Audit.** All state changes audited via `ENG-004` per `ADR-014`.

**Model Execution Configuration (attribute of Analytical Model — MOD-017 authority).**

- **Purpose.** Declarative business-level configuration of how an Analytical Model executes under a Model Run.
- **Attributes.** Input binding (Data Mart projections and/or KPI Metric Catalog entries); output binding (Analytical View definitions and/or Report Definition under Sprint 004 read-only); optional AI-Copilot-assisted forecasting invocation via `ENG-028` (Module PRD §12 optional engine); visibility inheritance.
- **Validation.** Referenced Data Mart projections and KPI Metric Catalog entries MUST be Active; referenced Analytical View definitions MUST be Active; referenced Report Definition (where bound) MUST be Active.

**Analytical View (business entity — MOD-017 authority).**

- **Purpose.** Business-level definition of a cross-module analytical projection. Categories established here: **Anomaly Highlights**, **Trend Analysis**, **Comparative Analysis**.
- **Attributes.** Identifier; name; description; category (Anomaly Highlights / Trend Analysis / Comparative Analysis); referenced Analytical Model(s), Data Mart projection(s), and/or KPI Metric Catalog entries; visibility classification; lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`.
- **Uniqueness.** Analytical View name is unique within a tenant/company.
- **Validation.** Declarative validation at capture time; validation at Model Run execution time.
- **Audit.** State changes audited via `ENG-004`.

**Cross-Module Aggregation Definition (business entity — MOD-017 authority).**

- **Purpose.** Business-level declaration of an aggregation that combines source-module domain events read-only across two or more source modules, published via `ENG-024`. Preserves source-module ownership — MOD-017 does not mutate source-module data.
- **Attributes.** Identifier; name; description; source-module event bindings; aggregation semantic (business-level); output projection binding; visibility classification; lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`.
- **Uniqueness.** Aggregation Definition name is unique within a tenant/company.
- **Validation.** All bound source-module events MUST be published events in their respective owning modules; visibility is enforced per `ADR-032`.
- **Audit.** State changes audited via `ENG-004`.

**Compliance / Retention Audit-Readiness Surface (read-only projection — MOD-017 authority).**

- **Purpose.** A read-only consolidation of retention configuration (per mart under Sprint 001; per Report Definition under Sprint 004) and audit records under `ENG-004` per `ADR-014`, presented as a cross-module compliance surface. Consumed by MOD-018 AI Workspace read-only.
- **Attributes.** Retention state per subject (mart / Report Definition); audit-record availability per subject; visibility classification (inherited from subject).
- **Validation.** Consumes upstream state read-only; MOD-017 does not redefine retention behavior in `ENG-005` or audit behavior in `ENG-004`.

### 4.2 Configuration

Business configuration is delivered via `ENG-005` Configuration Engine in the tenant → company → context hierarchy (Module PRD §10). Configuration consumed by this sprint:

- **Data retention per mart** — established under `SPR-MOD-017-001`; consumed read-only.
- **Report retention per Report Definition** — established under `SPR-MOD-017-004`; consumed read-only.
- **Refresh cadence** — established under `SPR-MOD-017-001`; consumed read-only.

No new configuration key is defined by this sprint outside what the Module PRD allocates. No configuration is hard-coded. This sprint does not redefine `ENG-005`.

### 4.3 Transactions

**Model Run (business transaction — MOD-017 authority).**

- **Purpose.** The run-time act of executing an Analytical Model; produces cross-module analytical output projected through Analytical Views and, where bound, through Report Definitions.
- **Lifecycle.** `Requested → Running → Completed | Failed`.
- **Execution.** Executed via `ENG-010` Workflow; scheduled via `ENG-014` where a schedule is declared; rendered via `ENG-021` where a reporting surface is bound; numbered via `ENG-017`; audited via `ENG-004`. Optional AI-Copilot-assisted forecasting via `ENG-028` executes without redefining engine behavior.
- **Read-model-only invariant.** A Model Run reads from mart projections (Sprint 001), the KPI Metric Catalog (Sprint 002), Dashboard surfaces (Sprint 003) read-only, Report Definitions (Sprint 004) read-only, and source-module domain events via `ENG-024` read-only; it MUST NOT mutate any source-module master or transactional data.
- **Publication.** On Completion, `ModelRunCompleted` is emitted via `ENG-024`. `ModelRunStarted` is emitted on transition to `Running`. Where a Cross-Module Aggregation Definition is executed as part of the Model Run, `CrossModuleAnalyticsGenerated` is emitted via `ENG-024`.

No other transactional authority is introduced in this sprint.

---

## 5. Business Rules

Module- and sprint-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

1. **Unique identifiability.** Every Analytical Model, Analytical View, and Cross-Module Aggregation Definition shall be uniquely identifiable within a tenant/company.
2. **Version traceability.** Analytical Model versions shall be monotonic; each published version shall be immutable; each Model Run shall reference the exact `(Analytical Model, version)` executed and shall preserve that reference in the audit trail.
3. **Single-Active-version invariant.** For a given Analytical Model within a tenant/company, at most one version shall be Active at any time.
4. **Active-only execution.** Only Active Analytical Models may be executed by a Model Run or bound to a schedule; only Active Analytical Views and Cross-Module Aggregation Definitions may be referenced by an Active Model Execution Configuration.
5. **Read-model-only consumption.** Cross-module analytics shall consume approved source-domain data strictly read-only through mart projections and source-module domain events (`ENG-024`); no Sprint 005 operation shall mutate source-module master or transactional data.
6. **Aggregation source ownership.** Cross-module aggregation definitions shall preserve source-module ownership; no Cross-Module Aggregation Definition shall redefine or duplicate source-module authority over its own master or transactional data.
7. **Auditability.** Every state-changing operation on an Analytical Model, Model Execution Configuration, Analytical View, Cross-Module Aggregation Definition, or Model Run transaction shall be auditable via `ENG-004` per `ADR-014`. Analytical outputs shall remain auditable through the linkage `Model Run ↔ (Analytical Model, version) ↔ referenced projections`.
8. **Authorization compliance.** Model Execution and all read surfaces (Analytical Views, cross-module aggregations, compliance/retention audit-readiness surface, MOD-018 read-only surface) shall enforce authorization via `ENG-002` / `ENG-003` per `ADR-032`; row-level access is respected on every read.
9. **Lifecycle enforcement.** Analytical Model, Analytical View, and Cross-Module Aggregation Definition lifecycle transitions (`Draft → Active → Inactive → Archived`) shall be enforced declaratively; transitions that would violate this ordering shall be rejected at capture time.
10. **Model Run integrity.** A Model Run shall reference an Active Analytical Model and an Active Model Execution Configuration; referenced projections (Data Marts, KPI Metric Catalog, Analytical Views, Cross-Module Aggregation Definitions, Report Definitions where bound) shall be Active at execution time; violations shall transition the transaction to `Failed` with an audit trail.
11. **Retention resolution.** The compliance / retention audit-readiness surface shall resolve retention state deterministically via `ENG-005` in the tenant → company → context hierarchy and shall link every subject to its `ENG-004` audit records per `ADR-014`.
12. **MOD-018 boundary.** The read-only surface provided to MOD-018 AI Workspace shall not carry write semantics; MOD-018 authoring surfaces are not established here.

---

## 6. Events

### 6.1 Events Published (Sprint 005 Analytical Models & Cross-Module Analytics events)

| Event | Emitted On | Purpose |
| --- | --- | --- |
| `AnalyticalModelDefined` | An Analytical Model record transitions from Draft to Active for the first time | Signals downstream consumers that a new Analytical Model version is available. |
| `AnalyticalModelUpdated` | An Active Analytical Model's metadata is updated (excluding version-producing edits) | Signals downstream consumers of metadata change. |
| `AnalyticalModelVersioned` | A new version of an Analytical Model is published | Signals downstream consumers of a new version; carries the monotonic version identifier. |
| `AnalyticalModelActivated` | An Analytical Model transitions to Active | Signals downstream consumers of activation. |
| `AnalyticalModelDeactivated` | An Analytical Model transitions to Inactive or Archived | Signals downstream consumers of deactivation/archival. |
| `ModelRunStarted` | A Model Run transitions to `Running` | Signals commencement of Model Run execution. |
| `ModelRunCompleted` | A Model Run transitions to `Completed` or `Failed` | Signals terminal state of a Model Run; carries success/failure classification. Aligns with Module PRD §8 Integration Points. |
| `CrossModuleAnalyticsGenerated` | A Cross-Module Aggregation Definition produces output as part of a completed Model Run | Signals downstream consumers (including MOD-018 read-only surface) of new cross-module analytical output. |

Events are emitted via `ENG-024` and traced to their originating audit record in `ENG-004`.

### 6.2 Events Consumed

Only upstream platform events explicitly allocated. In Sprint 005 the Analytical Models and Cross-Module Analytics authorities are consumers of:

- **Data Mart master and Analytics Foundation configuration** established under `SPR-MOD-017-001` — read-only.
- **KPI Metric Catalog and KPI Framework events** (`KPIDefined`, `KPIUpdated`, `KPIVersioned`, `KPIActivated`, `KPIDeactivated`) established under `SPR-MOD-017-002` — read-only.
- **Dashboard Framework events** (`DashboardCreated`, `DashboardUpdated`, `DashboardActivated`, `DashboardDeactivated`, `DashboardShared`) established under `SPR-MOD-017-003` — read-only, where an Analytical View references a Dashboard surface.
- **Distribution / Reporting / Export events** (`ReportRunStarted`, `ReportRunCompleted`, `ReportPublished`, `ExportCompleted`) established under `SPR-MOD-017-004` — read-only, where a Model Run's output is bound to a Report Definition.
- **All module domain events** — consumed strictly read-only via `ENG-024` per Module PRD §8 Integration Points; MOD-017 remains read-model-only against source-module transactional truth.

No new event contract is defined outside the Sprint Plan and Module PRD allocation.

---

## 7. Integrations

MOD-017 Analytics **consumes** the following platform services in this sprint. None are redefined; ownership remains with the engine owner.

| Engine | Role in Sprint 005 |
| --- | --- |
| `ENG-002` Authorization | Authorize Analytical Model / Analytical View / Cross-Module Aggregation Definition authoring and read surfaces per `ADR-032`. |
| `ENG-004` Audit | Persist audit records for every state change per `ADR-014`; link Model Runs to their `(Analytical Model, version)` reference. |
| `ENG-005` Configuration | Read-only consumption of Analytics module configuration (retention per mart under Sprint 001; retention per Report Definition under Sprint 004; refresh cadence) established at tenant → company → context. |
| `ENG-010` Workflow | Execute the Model Run transaction lifecycle. |
| `ENG-014` Scheduler (optional per Module PRD §12) | Execute scheduled Model Runs where a schedule is declared. |
| `ENG-017` Numbering | Allocate identifiers for Model Run transactions (series registered under `SPR-MOD-017-001`). |
| `ENG-021` Reporting | Render Model Run content where a reporting surface is bound (e.g., Anomaly Highlights). |
| `ENG-023` Integration (optional per Module PRD §12) | Deliver cross-module analytical output via external integration channels where configured. |
| `ENG-024` Event | Publish `AnalyticalModelDefined`, `AnalyticalModelUpdated`, `AnalyticalModelVersioned`, `AnalyticalModelActivated`, `AnalyticalModelDeactivated`, `ModelRunStarted`, `ModelRunCompleted`, `CrossModuleAnalyticsGenerated`; consume upstream and all module domain events read-only. |
| `ENG-028` AI Copilot (optional per Module PRD §12) | Execute AI-Copilot-assisted forecasting where configured on a Model Execution Configuration. |

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
  - [`SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md`](./SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md) — Draft (Dashboard master consumed read-only where an Analytical View references a Dashboard).
  - [`SPR-MOD-017-004_SCHEDULED_DISTRIBUTION_REPORTING_AND_EXPORT.md`](./SPR-MOD-017-004_SCHEDULED_DISTRIBUTION_REPORTING_AND_EXPORT.md) — Draft (Report Definition consumed read-only where a Model Run's output is bound to a Report Definition).
- **Prior repository audit** — `REPOSITORY_AUDIT_20260717T190000Z` — Repository READY.

### 8.2 Engine and ADR Dependencies

- **Engines required (Sprint 005):** `ENG-002`, `ENG-004`, `ENG-005`, `ENG-010`, `ENG-017`, `ENG-021`, `ENG-024`.
- **Engines optional (Sprint 005; per Module PRD §12):** `ENG-014` Scheduler, `ENG-023` Integration, `ENG-028` AI Copilot.
- **ADRs consumed:** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.

### 8.3 Sprint Dependencies

- **Upstream sprint dependencies.** `SPR-MOD-017-001`, `SPR-MOD-017-002`, `SPR-MOD-017-003`, `SPR-MOD-017-004`.
- **Downstream sprints.** None within MOD-017. Sprint 005 is the terminal sprint per the approved Sprint Plan §3 dependency graph.

---

## 9. Acceptance Criteria

Each acceptance criterion binds to one or more functional requirements from §2 / §4 or one business rule from §5. Numbering is stable within this document.

1. **AC-001 — Analytical Model creation.** A caller with appropriate `ENG-002` / `ENG-003` grants can create an Analytical Model record under a tenant/company; the record persists with all required attributes; an `ENG-004` audit record is written. (Deliverable 1; Rule 7.)
2. **AC-002 — Analytical Model unique identifiability.** Attempting to create an Analytical Model whose name collides with an existing record under the same tenant/company is rejected at capture time. (Deliverable 1; Rule 1.)
3. **AC-003 — Analytical Model lifecycle.** An Analytical Model follows the `Draft → Active → Inactive → Archived` lifecycle; transitions that would violate this ordering are rejected at capture time; every transition is audited. (Deliverable 1; Rules 7, 9.)
4. **AC-004 — Analytical Model versioning.** Publishing a new Analytical Model version allocates a monotonic version identifier; the previously published version becomes immutable; the `(Analytical Model, version)` tuple is unique. (Deliverable 2; Rule 2.)
5. **AC-005 — Single Active version.** At most one version of a given Analytical Model is Active per tenant/company at any time; attempts to activate a second version are rejected. (Deliverable 2; Rule 3.)
6. **AC-006 — Analytical Model visibility.** Analytical Model records enforce visibility per `ADR-032` via `ENG-002` / `ENG-003`; row-level access is enforced on every read. (Deliverable 3; Rule 8.)
7. **AC-007 — Model Execution Configuration integrity.** A Model Execution Configuration is validated declaratively at capture time; referenced Data Mart projections, KPI Metric Catalog entries, Analytical Views, and Report Definition (where bound) MUST be Active at execution time. (Deliverable 4; Rules 4, 10.)
8. **AC-008 — Model Run transaction lifecycle.** A Model Run executes via `ENG-010`, receives a document number via `ENG-017`, and is audited via `ENG-004`; where a reporting surface is bound, rendering runs via `ENG-021`; scheduled execution, where configured, runs via `ENG-014`. `ModelRunStarted` and `ModelRunCompleted` are emitted via `ENG-024`. (Deliverable 5; Rules 7, 10.)
9. **AC-009 — Analytical Model validation.** A Model Run referencing a non-Active Analytical Model, or a Model Execution Configuration referencing non-Active projections, is rejected; the transaction transitions to `Failed` with an audit trail. (Deliverable 6; Rules 4, 10.)
10. **AC-010 — Analytical View creation.** A caller with appropriate grants can create an Analytical View (Anomaly Highlights / Trend Analysis / Comparative Analysis) under a tenant/company; the record persists with all required attributes; an `ENG-004` audit record is written. (Deliverable 7; Rules 1, 7.)
11. **AC-011 — Analytical View lifecycle.** An Analytical View follows the `Draft → Active → Inactive → Archived` lifecycle; violations rejected at capture time; every transition is audited. (Deliverable 7; Rules 7, 9.)
12. **AC-012 — Cross-Module Aggregation Definition creation.** A caller with appropriate grants can create a Cross-Module Aggregation Definition bound to source-module domain events published via `ENG-024`; the record persists with all required attributes; an `ENG-004` audit record is written. (Deliverable 8; Rules 1, 6, 7.)
13. **AC-013 — Aggregation source ownership preservation.** A Cross-Module Aggregation Definition consumes source-module domain events strictly read-only; no source-module master or transactional data is mutated. (Deliverable 8; Rules 5, 6.)
14. **AC-014 — Compliance / retention audit-readiness surface.** The compliance / retention audit-readiness surface resolves retention state via `ENG-005` in the tenant → company → context hierarchy and links every subject to its `ENG-004` audit records per `ADR-014`. (Deliverable 9; Rule 11.)
15. **AC-015 — MOD-018 read-only surface.** The read-only surface provided to MOD-018 AI Workspace exposes Analytical Views, cross-module aggregation outputs, and the compliance / retention audit-readiness surface without write semantics; visibility is enforced per `ADR-032`. (Deliverable 10; Rules 8, 12.)
16. **AC-016 — Analytical Models & Cross-Module Analytics events.** `AnalyticalModelDefined`, `AnalyticalModelUpdated`, `AnalyticalModelVersioned`, `AnalyticalModelActivated`, `AnalyticalModelDeactivated`, `ModelRunStarted`, `ModelRunCompleted`, and `CrossModuleAnalyticsGenerated` are emitted via `ENG-024` with corresponding `ENG-004` audit records. (Deliverable 11; Rules 2, 7.)
17. **AC-017 — Authorization compliance.** All Sprint 005 authoring and read surfaces enforce authorization via `ENG-002` / `ENG-003` per `ADR-032`; unauthorized operations are rejected at capture and read time. (Deliverables 1, 4, 5, 7, 8, 9, 10; Rule 8.)
18. **AC-018 — Read-model-only.** No Sprint 005 operation writes to a source module's master or transactional data. (Deliverable 12; Rules 5, 6.)
19. **AC-019 — Audit trail.** Every state-changing operation in §2 (Analytical Model, Model Execution Configuration, Analytical View, Cross-Module Aggregation Definition, and Model Run transaction lifecycle) emits an `ENG-004` audit record per `ADR-014`; Model Runs preserve the `(Analytical Model, version)` reference in the audit trail. (Deliverables 1–11; Rules 2, 7.)
20. **AC-020 — Ownership boundaries preserved.** No MOD-001 / MOD-002 / source-module authority is redefined; MOD-017 does not claim ownership of any platform engine; Data Mart (Sprint 001), KPI (Sprint 002), Dashboard (Sprint 003), and Distribution/Reporting/Export (Sprint 004) authorities remain unchanged. (Deliverable 12.)

---

## 10. Ownership Boundaries

Recapitulated from §1.1.3 (not evolved):

- **MOD-017 Analytics** owns the Analytical Models and Cross-Module Analytics authorities established in this sprint, and continues to own Distribution / Reporting / Export authorities (Sprint 004), Dashboard and Visualization authorities (Sprint 003), KPI Framework and KPI Metric Catalog authorities (Sprint 002), and Data Mart and Analytics Foundation configuration (Sprint 001).
- **Source modules** continue to own all transactional and master data; MOD-017 consumes strictly read-only.
- **Platform modules and engines** retain ownership of Identity (`ENG-001` / MOD-001), Authorization (`ENG-002` / MOD-001), Permission (`ENG-003` / MOD-001), Configuration (`ENG-005`), Audit (`ENG-004`), Workflow (`ENG-010`), Scheduler (`ENG-014`), Numbering (`ENG-017`), Reporting (`ENG-021`), Integration (`ENG-023`), Event infrastructure (`ENG-024`), and AI Copilot (`ENG-028`).
- **MOD-018 AI Workspace** consumes the read-only surface exposed here; MOD-018 authoring surfaces are not established by MOD-017.
- **Analytics remains a read-model-only consumer** of operational data.

**No ownership reassignment. No new authority beyond the Sprint Plan allocation.**

---

## 11. Non-Goals

- No Data Mart master, Analytics Foundation configuration, refresh cadence, retention (per-mart), ingestion contracts, numbering series registration, or module-wide search-index baseline (allocated to `SPR-MOD-017-001`).
- No KPI master, KPI Category, KPI Classification, KPI Version, KPI Metric Catalog authority, or KPI Framework events (allocated to `SPR-MOD-017-002`).
- No Dashboard master, Dashboard Layout, Dashboard Group, Visualization Configuration, Dashboard View transaction, drill-down navigation, or `DashboardShared` publication (allocated to `SPR-MOD-017-003`).
- No Distribution List master, Report Definition master, Report Output/Retention Configuration, Report Run transaction, Delivery Configuration, Distribution Channel configuration, Export Configuration, or Distribution/Reporting/Export events (allocated to `SPR-MOD-017-004`).
- No Machine Learning training pipelines. No Artificial Intelligence model authoring. No Predictive AI model implementation. No Generative AI content authoring. No autonomous decision-making. No workflow orchestration outside `ENG-010`.
- No new operational transactions in source modules. No modification of source-module master or transactional data.
- No redefinition of any ERP Core Engine or ADR.
- No Module Baseline. No Module Publication.
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
- [`docs/30-sprint-prds/analytics/sprints/SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md`](./SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md) — Upstream Sprint PRD.
- [`docs/30-sprint-prds/analytics/sprints/SPR-MOD-017-004_SCHEDULED_DISTRIBUTION_REPORTING_AND_EXPORT.md`](./SPR-MOD-017-004_SCHEDULED_DISTRIBUTION_REPORTING_AND_EXPORT.md) — Upstream Sprint PRD.
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md) — Module lifecycle workflow.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring rules.
- [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) — Sprint catalog projection.
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md) — ERP Core Engines (authoritative).
