---
title: "SPR-MOD-017-004 — Scheduled Distribution, Reporting & Export"
summary: "Sprint PRD for the Distribution, Reporting, and Export authorities of MOD-017 Analytics: Distribution List master (definition, metadata, membership, lifecycle, visibility), Report Definition master, Distribution Channel and Delivery Configuration, Export Configuration, Report Run transaction lifecycle, scheduled report distribution, bulk exports in standard formats, and `ReportPublished` publication. Consumes ERP Core Engines and Accepted ADRs; never redefines them. Analytics remains read-model-only relative to source-module transactional truth."
layer: "delivery"
owner: "Insights"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-017-004"
parent_module: "MOD-017"
parent_sprint_plan: "MOD-017_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "21.0.4"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-011", "ENG-014", "ENG-017", "ENG-021", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "analytics", "mod-017", "distribution", "reporting", "export", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD017-004-20260717T190000Z-001"
parent_result_id: "GT003-MOD017-003-20260717T180000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-017-004 — Scheduled Distribution, Reporting & Export

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-017 Analytics** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Analytics is **read-model-only** relative to source-module transactional truth. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-017-004` (permanent) |
| Parent Module | `MOD-017` — Analytics |
| Parent Sprint Plan | [`MOD-017_SPRINT_PLAN.md`](../MOD-017_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint Dependencies | `SPR-MOD-017-001`, `SPR-MOD-017-002`, `SPR-MOD-017-003` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Scheduled-distribution, Reporting, and Export** capability for MOD-017 Analytics by establishing the three authorities allocated to Sprint 004 by the approved Sprint Plan:

- **Distribution Authority** — the business authority over Distribution List master (definition, metadata, membership, visibility, lifecycle), Distribution Channel configuration, Delivery Configuration, and the scheduled-distribution business process.
- **Reporting Authority** — the business authority over Report Definition master, Report Output Configuration, Report Retention Configuration, and the Report Run transaction lifecycle.
- **Export Authority** — the business authority over Export Configuration (format, structure, delivery binding) and Export execution as an outcome of a Report Run, consumed via `ENG-027`.

> **Analytics Ownership Convention (recapitulated).** MOD-017 Analytics owns Distribution, Reporting, and Export business semantics allocated to Sprint 004. ERP Core Engines provide shared infrastructure. MOD-017 **MUST NOT** redefine engine behavior. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Source-module master and transactional data remain exclusive to their owning modules and are consumed **read-only**. Ledger effects remain exclusive to **MOD-002 Accounting**.

#### 1.1.1 Distribution Authority

The **Distribution List** business entity and the surrounding distribution configuration surface are authoritatively owned by MOD-017 Analytics under this sprint. This sprint establishes:

- **Distribution List definition** — authoring Distribution List records under a tenant/company with all required business metadata.
- **Distribution List metadata** — descriptive attributes (name, description, owner, category tags).
- **Distribution List membership** — declarative membership (roles/teams/named recipients) resolved read-only through MOD-001 identity/permission surfaces; MOD-017 does not manage user identity.
- **Distribution List visibility** — enforced via `ENG-002` and `ENG-003` per `ADR-032`; row-level access on every read.
- **Distribution List lifecycle** — the standard `Draft → Active → Inactive → Archived` lifecycle; only **Active** Distribution Lists may be scheduled or bound to a Report Run.
- **Distribution scheduling** — scheduled dispatch declared at the Report Run / schedule binding level; scheduled execution runs via `ENG-014` where a schedule is declared.
- **Distribution Channel configuration** — business-level configuration of channels (email, in-app, external integration binding) provided through `ENG-005` per Module PRD §10 (Distribution channels).
- **Delivery Configuration** — the binding of a Report Run's output to one or more delivery destinations, subject to authorization policies enforced via `ENG-002` / `ENG-003`.
- **Distribution validation** — declarative structural and rule validation of Distribution List records, scheduling declarations, and delivery bindings at capture time.

No other module MAY create, edit, activate, deactivate, archive, or independently maintain a parallel Distribution List master. Downstream MOD-017 sprints and downstream modules consume Distribution Lists strictly through Analytics-owned read surfaces.

#### 1.1.2 Reporting Authority

The **Report Definition** business entity and the surrounding reporting configuration surface are authoritatively owned by MOD-017 Analytics under this sprint. This sprint establishes:

- **Report Definition management** — authoring Report Definition records under a tenant/company with all required business metadata (name, description, category, owner, referenced KPI Metric Catalog entries and/or Data Mart references).
- **Report Output Configuration** — the business-level configuration of a Report Definition's output (structure, presentation options, filter binding).
- **Report Retention Configuration** — the retention expectation for Report Run outputs, resolved via `ENG-005` in the tenant → company → context hierarchy.
- **Report Definition lifecycle** — the standard `Draft → Active → Inactive → Archived` lifecycle; only **Active** Report Definitions may be executed by a Report Run or bound to a schedule.
- **Report Run transaction** — the run-time act of executing a Report Definition; lifecycle `Requested → Running → Completed | Failed`; executed via `ENG-010`; rendered via `ENG-021`; numbered via `ENG-017`; approved (where configured) via `ENG-011`; audited via `ENG-004`.
- **Report execution validation** — declarative validation that a Report Run references an Active Report Definition, uses approved output configuration, resolves visibility, and honors retention.
- **Reporting integrity** — read-model-only invariant preserved: Report Runs read from mart projections (Sprint 001) and the KPI Metric Catalog (Sprint 002); Dashboards (Sprint 003) are consumed read-only where a Report Definition is bound to a Dashboard surface.

#### 1.1.3 Export Authority

The **Export Configuration** and Export execution surface are authoritatively owned by MOD-017 Analytics under this sprint. This sprint establishes:

- **Export Configuration** — business-level configuration of the export format (standard formats provided by `ENG-027`), structure, and delivery binding declared on a Report Definition or a Report Run.
- **Export execution** — the outcome of a Report Run where an Export Configuration is bound; export production is performed by `ENG-027` Export Engine consumed read-only by MOD-017.
- **Export validation** — declarative validation that Export Configurations conform to approved formats and to the Report Definition's output configuration.
- **External BI delivery category** — the "External BI (via export)" integration category declared by the Module PRD §8 is realized here through Export Configurations bound to Delivery Configurations; no external system contract is redefined by MOD-017.

#### 1.1.4 Analytics ↔ Platform, Source Modules, and Downstream Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management. Analytics consumes these read-only.
- **Source modules** own master and transactional data. Analytics consumes source data strictly read-only through mart projections established in `SPR-MOD-017-001`.
- **KPI master and KPI Metric Catalog** remain owned by MOD-017 Analytics under `SPR-MOD-017-002` and are consumed here read-only.
- **Dashboard master and Dashboard View transaction** remain owned by MOD-017 Analytics under `SPR-MOD-017-003` and are consumed here read-only (a Report Definition may reference a Dashboard surface).
- **Analytical models and cross-module analytics** are allocated to `SPR-MOD-017-005` and are **out of scope** here.

Ownership boundaries SHALL NOT be redefined in downstream MOD-017 Sprint PRDs.

### 1.2 In Scope

- **Distribution List master** — create, edit, activate, deactivate, archive under a tenant/company; locale-sensitive attributes via localization surfaces consumed read-only.
- **Distribution List metadata** — name, description, category tags, owner, membership declaration.
- **Distribution List visibility** — sensitive-list visibility per `ADR-032`, row-level access on read.
- **Distribution List lifecycle** — `Draft → Active → Inactive → Archived`.
- **Distribution scheduling** — declarative schedule bindings resolved via `ENG-014` (optional per Module PRD §12).
- **Distribution Channel configuration** — business-level channel configuration via `ENG-005` (Module PRD §10 Distribution channels).
- **Delivery Configuration** — binding of Report Run outputs to delivery destinations; authorization enforced via `ENG-002` / `ENG-003`.
- **Distribution validation** — declarative structural and rule validation at capture time.
- **Report Definition master** — create, edit, activate, deactivate, archive; metadata; ownership.
- **Report Output Configuration** — declarative output structure and presentation options bound to a Report Definition.
- **Report Retention Configuration** — retention expectation per Report Definition resolvable via `ENG-005`.
- **Report Run transaction** — lifecycle via `ENG-010`; rendering via `ENG-021`; numbering via `ENG-017`; approvals via `ENG-011` where configured; scheduled execution via `ENG-014` where configured.
- **Report execution validation** — declarative validation at capture and execution time.
- **Export Configuration** — format (standard formats via `ENG-027`), structure, delivery binding.
- **Export execution** — export production via `ENG-027` bound to a Report Run outcome.
- **Export validation** — declarative validation vs approved formats and Report Output Configuration.
- **`ReportPublished` publication** — via `ENG-024` on Report Run completion where a Delivery Configuration is bound.
- **Notifications** — optional notification dispatch via `ENG-025` where configured (Module PRD §12 optional engine).
- **Audit** — every state change on a Distribution List, Report Definition, Distribution Channel configuration, Delivery Configuration, Export Configuration, or Report Run transaction audited via `ENG-004` per `ADR-014`.

### 1.3 Out of Scope

- Data Mart master, Analytics Foundation configuration, refresh cadence, retention (per-mart), ingestion contracts, numbering series registration, module-wide search-index baseline — allocated to `SPR-MOD-017-001`.
- KPI master, KPI Categories, KPI Classifications, KPI Versioning, KPI Metric Catalog authority, KPI Framework events (`KPIDefined`, `KPIUpdated`, `KPIVersioned`, `KPIActivated`, `KPIDeactivated`) — allocated to `SPR-MOD-017-002`.
- Dashboard master, Dashboard Layout, Dashboard Group, Visualization Configuration, Dashboard View transaction, drill-down navigation, `DashboardShared` publication — allocated to `SPR-MOD-017-003`.
- Model Run transaction, Anomaly Highlights, cross-module event consumption as mart inputs, compliance/retention audit-readiness reporting, `ModelRunCompleted` publication, read-only surface to MOD-018 — allocated to `SPR-MOD-017-005`.
- Analytical models. Predictive analytics. Anomaly detection. Executive analytics. Cross-module analytics.
- Any redefinition of ERP Core Engine behavior, including `ENG-021` Reporting, `ENG-027` Export, `ENG-014` Scheduler, `ENG-023` Integration, `ENG-025` Notification.
- Physical schema, code, routes, migrations, and UI.
- Module Baseline and Module Publication.
- Governance evolution.

---

## 2. Sprint Deliverables

| # | Deliverable | Kind | Notes |
| --- | --- | --- | --- |
| 1 | Distribution List master authority | Master Data | Definition, metadata, membership, uniqueness, lifecycle. |
| 2 | Distribution List visibility rule set | Master Data attribute | Per `ADR-032`; enforced via `ENG-002` / `ENG-003`. |
| 3 | Distribution scheduling declaration | Business capability | Declarative schedule binding; runs via `ENG-014` where configured. |
| 4 | Distribution Channel configuration | Configuration | Business-level channel configuration via `ENG-005` (Module PRD §10). |
| 5 | Delivery Configuration | Master Data | Binding of Report Run output to delivery destinations. |
| 6 | Distribution validation | Rule surface | Declarative validation at capture time. |
| 7 | Report Definition master authority | Master Data | Definition, metadata, uniqueness, lifecycle. |
| 8 | Report Output Configuration | Master Data attribute | Declarative output structure and presentation options. |
| 9 | Report Retention Configuration | Configuration | Retention expectation per Report Definition via `ENG-005`. |
| 10 | Report Run transaction | Transaction | Lifecycle via `ENG-010`; render via `ENG-021`; numbering via `ENG-017`; approvals via `ENG-011`; schedule via `ENG-014`; audit via `ENG-004`. |
| 11 | Report execution validation | Rule surface | Declarative validation at capture and execution time. |
| 12 | Export Configuration | Master Data | Format, structure, delivery binding. |
| 13 | Export execution | Business capability | Export production via `ENG-027` bound to a Report Run outcome. |
| 14 | Export validation | Rule surface | Declarative validation vs approved formats and Report Output Configuration. |
| 15 | Reporting/Distribution events published | Events | `ReportRunStarted`, `ReportRunCompleted`, `ReportPublished`, `ExportCompleted`. |
| 16 | Ownership boundaries recapitulation | Documentation | §1.1.4 — no reassignment. |

---

## 3. Traceability to Module PRD

Bidirectional traceability from the [MOD-017 Analytics Module PRD](../../../20-module-prds/analytics/MODULE_PRD.md) and the approved [MOD-017 Sprint Plan](../MOD-017_SPRINT_PLAN.md) to this Sprint PRD.

### 3.1 Forward Map — Module PRD → Sprint 004

| Module PRD Item | Module PRD § | Sprint Plan Allocation | Realized In This Sprint PRD |
| --- | --- | --- | --- |
| Scheduled report distribution | §2 Capabilities / §4 Business Processes | SPR-MOD-017-004 (origin) | §1, §2, §4, §5 |
| Data exports | §2 Capabilities | SPR-MOD-017-004 (origin) | §1.1.3, §2 (Deliverables 12–14) |
| Submodule: Distribution | §2 Submodules | SPR-MOD-017-004 (origin) | §1, §2 |
| Distribution List (Master Data) | §5 Master Data | SPR-MOD-017-004 (origin) | §4.1 Distribution List |
| Scheduled distribution process | §4 Business Processes | SPR-MOD-017-004 (origin) | §4.1, §4.3 Report Run |
| Report Run (Transaction) | §6 Transactions | SPR-MOD-017-004 (origin) | §4.3 Report Run |
| `ReportPublished` — published | §8 Integration Points | SPR-MOD-017-004 (origin) | §6.1 |
| External BI (via export) | §8 Integration Points | SPR-MOD-017-004 (origin) | §1.1.3, §4.1 Export Configuration |
| Exports via `ENG-027` | §9 Reports & Analytics | SPR-MOD-017-004 (origin) | §1.1.3, §7 |
| Distribution channels (Configuration) | §10 Configuration | SPR-MOD-017-004 (origin) | §4.2 Configuration |

### 3.2 Reverse Map — Sprint 004 → Module PRD / Sprint Plan

| Sprint 004 Item | Traces To Module PRD | Traces To Sprint Plan |
| --- | --- | --- |
| Distribution Authority | §2 Capabilities; §4 Business Processes; §5 Master Data (Distribution List); §10 Configuration (Distribution channels) | §2 SPR-MOD-017-004 Objective / Boundaries |
| Reporting Authority | §2 Capabilities; §4 Business Processes; §6 Transactions (Report Run); §9 Reports & Analytics | §2 SPR-MOD-017-004 Objective / Boundaries |
| Export Authority | §2 Capabilities (Data exports); §8 Integration Points (External BI); §9 Reports & Analytics (Exports via ENG-027) | §2 SPR-MOD-017-004 Objective / Boundaries |
| Distribution List master | §5 Master Data (Distribution List) | §2 SPR-MOD-017-004 Boundaries |
| Distribution scheduling / Distribution Channel / Delivery Configuration | §4 Business Processes; §10 Configuration (Distribution channels) | §2 SPR-MOD-017-004 Boundaries / Exit Criteria |
| Report Definition / Output / Retention Configuration | §6 Transactions (Report Run); §7 Business Rules; §10 Configuration | §2 SPR-MOD-017-004 Boundaries |
| Report Run transaction | §6 Transactions (Report Run) | §2 SPR-MOD-017-004 Exit Criteria (Report Run via ENG-010; render via ENG-021; schedule via ENG-014; approvals via ENG-011) |
| Export Configuration / Export execution / validation | §9 Reports & Analytics (Exports via ENG-027); §8 Integration Points (External BI) | §2 SPR-MOD-017-004 Exit Criteria (bulk exports via ENG-027) |
| ReportRunStarted / ReportRunCompleted / ReportPublished / ExportCompleted | §8 Integration Points (`ReportPublished` — published); event surface derived from §2 and §4 | §2 SPR-MOD-017-004 Exit Criteria (`ReportPublished` publishes via `ENG-024`) |

### 3.3 Bidirectional Completeness

Every deliverable in §2 traces to at least one Module PRD section and to the approved Sprint Plan's SPR-MOD-017-004 allocation. Every Module PRD item allocated to SPR-MOD-017-004 by the approved Sprint Plan is realized by exactly one deliverable in §2. No orphan requirement. No scope expansion. Analytics remains read-model-only against source-module transactional truth.

---

## 4. Data Model Impact

### 4.1 Master Data

**Distribution List (business entity — MOD-017 authority).**

- **Purpose.** Represents a business audience for scheduled or on-demand report distribution under a tenant/company.
- **Attributes (business level).**
  - Identifier (business-level; numbering series registered under `SPR-MOD-017-001`).
  - Name (locale-sensitive where applicable).
  - Description.
  - Owner (business role/team resolved via MOD-001 read-only).
  - Membership declaration (roles/teams/named recipients; MOD-001 read-only resolution).
  - Visibility classification (drives visibility per `ADR-032`).
  - Category tags.
  - Lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`. Only **Active** Distribution Lists may be scheduled or bound to a Report Run.
- **Uniqueness.** Distribution List name is unique within a tenant/company.
- **Validation.** Declarative structural and rule validation at capture time.
- **Audit.** All state changes audited via `ENG-004` per `ADR-014`.

**Report Definition (business entity — MOD-017 authority).**

- **Purpose.** Business definition of an executable report referenced by Report Run transactions.
- **Attributes.** Identifier; name; description; category tags; owner; references to KPI Metric Catalog entries (Sprint 002, read-only) and/or Data Mart projections (Sprint 001, read-only) and/or Dashboard surfaces (Sprint 003, read-only); Report Output Configuration; Report Retention Configuration; visibility classification.
- **Lifecycle.** `Draft → Active → Inactive → Archived`. Only **Active** Report Definitions may be executed or scheduled.
- **Uniqueness.** Report Definition name is unique within a tenant/company.
- **Validation.** Declarative validation at capture time; validation at execution time ensures referenced KPI Metric Catalog entries and Data Mart projections are Active.
- **Audit.** State changes audited via `ENG-004`.

**Report Output Configuration (attribute of Report Definition — MOD-017 authority).**

- **Purpose.** Declarative output structure and presentation options for a Report Definition.
- **Attributes.** Output structure; presentation options; filter binding; visibility inheritance.

**Delivery Configuration (business entity — MOD-017 authority).**

- **Purpose.** Binding of a Report Run's output to one or more delivery destinations (Distribution Lists and/or channels).
- **Attributes.** Report Definition reference (Active); Distribution List reference(s) (Active); channel reference(s); optional export binding (Export Configuration reference); optional notification hint (via `ENG-025`).
- **Lifecycle.** Bound to host Report Definition lifecycle.
- **Validation.** Referenced Distribution Lists and Export Configurations must be Active at capture time and at execution time.
- **Audit.** State changes audited via `ENG-004`.

**Export Configuration (business entity — MOD-017 authority).**

- **Purpose.** Business-level configuration of an export produced from a Report Run via `ENG-027`.
- **Attributes.** Format (standard format supported by `ENG-027`); structure; delivery binding (Distribution List / channel).
- **Uniqueness.** Export Configuration name is unique within a tenant/company.
- **Lifecycle.** `Draft → Active → Inactive → Archived`.
- **Validation.** Format MUST be a standard format supported by `ENG-027`; structure MUST comply with the referenced Report Definition's Report Output Configuration.
- **Audit.** State changes audited via `ENG-004`.

### 4.2 Configuration

Business configuration is delivered via `ENG-005` Configuration Engine in the tenant → company → context hierarchy (Module PRD §10). Keys established or consumed by this sprint:

- **Distribution channels** (Module PRD §10) — business-level channel configuration (email, in-app, external integration binding).
- **Report retention per Report Definition** — retention expectation resolved via `ENG-005`.
- **Refresh cadence** and **Data retention per mart** — established under `SPR-MOD-017-001` and consumed read-only.

No configuration is hard-coded. This sprint does not redefine `ENG-005`.

### 4.3 Transactions

**Report Run (business transaction — MOD-017 authority).**

- **Purpose.** The run-time act of executing a Report Definition; produces a report output that may be delivered per a bound Delivery Configuration and/or exported per a bound Export Configuration.
- **Lifecycle.** `Requested → Running → Completed | Failed`.
- **Execution.** Executed via `ENG-010` Workflow; rendered via `ENG-021` Reporting; numbered via `ENG-017`; approved via `ENG-011` where configured; scheduled via `ENG-014` where a schedule is declared; audited via `ENG-004`.
- **Read-model-only invariant.** A Report Run reads from mart projections (Sprint 001), the KPI Metric Catalog (Sprint 002), and Dashboard surfaces (Sprint 003) read-only; it MUST NOT mutate any source-module master or transactional data.
- **Delivery.** When a Delivery Configuration is bound, the Report Run publishes `ReportPublished` via `ENG-024` on Completion; notifications, where configured, dispatch via `ENG-025`.
- **Export.** When an Export Configuration is bound, `ENG-027` produces the export as an outcome of the Report Run; `ExportCompleted` is emitted via `ENG-024` on export completion.

No other transactional authority is introduced in this sprint. The Model Run transaction declared in the Module PRD §6 is allocated to `SPR-MOD-017-005`.

---

## 5. Business Rules

Module- and sprint-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

1. **Unique identifiability.** Every Distribution List, Report Definition, Delivery Configuration, and Export Configuration shall be uniquely identifiable within a tenant/company.
2. **Active-only scheduling.** Only Active Distribution Lists may be bound to a schedule or to a Delivery Configuration; only Active Report Definitions may be executed by a Report Run or bound to a schedule.
3. **Approved definitions.** Report execution shall use approved Report Definitions; Report Runs referencing non-Active Report Definitions shall be rejected at capture time.
4. **Approved export formats.** Export Configurations shall conform to formats supported by `ENG-027`; violations shall be rejected at capture time.
5. **Authorized delivery destinations.** Distribution destinations shall follow authorization policies enforced via `ENG-002` / `ENG-003` per `ADR-032`; row-level access is respected on every read.
6. **Auditability.** Every state-changing operation on a Distribution List, Report Definition, Delivery Configuration, Export Configuration, Distribution Channel configuration, or Report Run transaction shall be auditable via `ENG-004` per `ADR-014`.
7. **Read-model-only.** Analytics remains read-model-only. No Sprint 004 operation shall mutate source-module master or transactional data.
8. **Lifecycle enforcement.** Distribution List, Report Definition, Delivery Configuration, and Export Configuration lifecycle transitions (`Draft → Active → Inactive → Archived`) shall be enforced declaratively; transitions that would violate this ordering shall be rejected at capture time.
9. **Report Run integrity.** A Report Run shall reference an Active Report Definition and, where bound, Active Distribution Lists and Active Export Configurations; visibility, output configuration, and retention shall be resolved at execution time; failures shall transition the transaction to `Failed` with an audit trail.
10. **Retention resolution.** Report Retention Configuration shall be resolved deterministically via `ENG-005` in the tenant → company → context hierarchy; Report Run outputs shall be retained per the resolved retention expectation.

---

## 6. Events

### 6.1 Events Published (Sprint 004 Distribution / Reporting / Export events)

| Event | Emitted On | Purpose |
| --- | --- | --- |
| `ReportRunStarted` | A Report Run transitions to `Running` | Signals commencement of report execution to downstream consumers. |
| `ReportRunCompleted` | A Report Run transitions to `Completed` or `Failed` | Signals terminal state of a Report Run; carries success/failure classification. |
| `ReportPublished` | A completed Report Run has a bound Delivery Configuration and its output is published to that destination | Signals distribution consumers per Module PRD §8 Integration Points. |
| `ExportCompleted` | An export produced under `ENG-027` for a Report Run completes | Signals downstream consumers and external BI integrations per Module PRD §8. |

Events are emitted via `ENG-024` and traced to their originating audit record in `ENG-004`.

### 6.2 Events Consumed

Only upstream platform events explicitly allocated. In Sprint 004 the Distribution, Reporting, and Export authorities are consumers of:

- **Data Mart master and Analytics Foundation configuration** established under `SPR-MOD-017-001` — read-only.
- **KPI Metric Catalog and KPI Framework events** established under `SPR-MOD-017-002` — read-only.
- **Dashboard master and Dashboard Framework events** (`DashboardCreated`, `DashboardUpdated`, `DashboardActivated`, `DashboardDeactivated`, `DashboardShared`) established under `SPR-MOD-017-003` — read-only, where a Report Definition references a Dashboard surface.

No source-module transactional event is consumed here; source-module event consumption at scale is allocated to `SPR-MOD-017-005`. No new event contract is defined outside the Sprint Plan and Module PRD allocation.

---

## 7. Integrations

MOD-017 Analytics **consumes** the following platform services in this sprint. None are redefined; ownership remains with the engine owner.

| Engine | Role in Sprint 004 |
| --- | --- |
| `ENG-002` Authorization | Authorize Distribution List / Report Definition / Delivery / Export authoring; enforce delivery destination authorization per `ADR-032`. |
| `ENG-004` Audit | Persist audit records for every state change per `ADR-014`. |
| `ENG-005` Configuration | Read-only consumption of Analytics module configuration (Distribution channels, Report retention) established at tenant → company → context. |
| `ENG-010` Workflow | Execute the Report Run transaction lifecycle. |
| `ENG-011` Approval | Execute approvals where configured on Report Definitions or Delivery Configurations. |
| `ENG-014` Scheduler (optional per Module PRD §12) | Execute scheduled Report Runs where a schedule is declared. |
| `ENG-017` Numbering | Allocate identifiers for Report Run transactions (series registered under `SPR-MOD-017-001`). |
| `ENG-021` Reporting | Render Report Run content within the Report Run lifecycle. |
| `ENG-023` Integration (optional per Module PRD §12) | Deliver reports via external integration channels where configured. |
| `ENG-024` Event | Publish `ReportRunStarted`, `ReportRunCompleted`, `ReportPublished`, `ExportCompleted`. |
| `ENG-025` Notification (optional per Module PRD §12) | Dispatch notifications on distribution / export outcomes where configured. |
| `ENG-027` Export | Produce bulk exports in standard formats bound to a Report Run outcome. |

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
  - [`SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md`](./SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md) — Draft (Dashboard master consumed read-only where a Report Definition references a Dashboard).
- **Prior repository audit** — `REPOSITORY_AUDIT_20260717T180000Z` — Repository READY.

### 8.2 Engine and ADR Dependencies

- **Engines required (Sprint 004):** `ENG-002`, `ENG-004`, `ENG-005`, `ENG-010`, `ENG-011`, `ENG-017`, `ENG-021`, `ENG-024`, `ENG-027`.
- **Engines optional (Sprint 004; per Module PRD §12):** `ENG-014` Scheduler, `ENG-023` Integration, `ENG-025` Notification.
- **ADRs consumed:** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.

### 8.3 Sprint Dependencies

- **Upstream sprint dependencies.** `SPR-MOD-017-001`, `SPR-MOD-017-002`, `SPR-MOD-017-003`.
- **Downstream sprints.** `SPR-MOD-017-005` depends on this sprint per the approved Sprint Plan §3 dependency graph.

---

## 9. Acceptance Criteria

Each acceptance criterion binds to one or more functional requirements from §2 / §4 or one business rule from §5. Numbering is stable within this document.

1. **AC-001 — Distribution List creation.** A caller with appropriate `ENG-002` / `ENG-003` grants can create a Distribution List record under a tenant/company; the record persists with all required attributes; an `ENG-004` audit record is written. (Deliverable 1; Rule 6.)
2. **AC-002 — Distribution List unique identifiability.** Attempting to create a Distribution List whose name collides with an existing record under the same tenant/company is rejected at capture time. (Deliverable 1; Rule 1.)
3. **AC-003 — Distribution List lifecycle.** A Distribution List follows the `Draft → Active → Inactive → Archived` lifecycle; transitions that would violate this ordering are rejected at capture time; every transition is audited. (Deliverable 1; Rules 6, 8.)
4. **AC-004 — Distribution List visibility.** Sensitive Distribution Lists are visible only to callers whose `ENG-002` / `ENG-003` grants satisfy `ADR-032`; row-level access is enforced on every read. (Deliverable 2; Rule 5.)
5. **AC-005 — Distribution scheduling.** A schedule declaration bound to an Active Distribution List and an Active Report Definition executes via `ENG-014` where configured; scheduling a non-Active Distribution List or non-Active Report Definition is rejected at capture time. (Deliverable 3; Rules 2, 3, 8.)
6. **AC-006 — Distribution Channel configuration.** Business-level Distribution Channel configuration is resolvable via `ENG-005` in the tenant → company → context hierarchy; changes are audited. (Deliverable 4; Rule 6.)
7. **AC-007 — Delivery Configuration integrity.** A Delivery Configuration shall reference an Active Report Definition and Active Distribution List(s); referenced Export Configuration (where bound) shall be Active; violations rejected at capture and at execution time. (Deliverable 5; Rules 1, 2, 8, 9.)
8. **AC-008 — Distribution validation.** Distribution Lists, schedule declarations, and Delivery Configurations are validated declaratively at capture time; invalid inputs are rejected before persistence. (Deliverable 6; Rules 1, 8.)
9. **AC-009 — Report Definition creation.** A caller with appropriate grants can create a Report Definition record; the record persists with metadata, references to KPI/Data Mart/Dashboard surfaces (read-only), Report Output Configuration, and Report Retention Configuration; an `ENG-004` audit record is written. (Deliverable 7; Rule 6.)
10. **AC-010 — Report Definition unique identifiability.** Attempting to create a Report Definition whose name collides with an existing record under the same tenant/company is rejected at capture time. (Deliverable 7; Rule 1.)
11. **AC-011 — Report Definition lifecycle.** A Report Definition follows the `Draft → Active → Inactive → Archived` lifecycle; violations rejected at capture time; every transition is audited. (Deliverable 7; Rules 6, 8.)
12. **AC-012 — Report Output Configuration.** Report Output Configuration is validated declaratively against the Report Definition at capture time and re-validated at Report Run execution time. (Deliverable 8; Rule 9.)
13. **AC-013 — Report Retention Configuration.** Report Retention Configuration is resolvable via `ENG-005` in the tenant → company → context hierarchy; Report Run outputs are retained per the resolved expectation. (Deliverable 9; Rule 10.)
14. **AC-014 — Report Run transaction lifecycle.** A Report Run executes via `ENG-010`, renders via `ENG-021`, receives a document number via `ENG-017`, and is audited via `ENG-004`; approvals, where configured, run via `ENG-011`; scheduled execution, where configured, runs via `ENG-014`. `ReportRunStarted` and `ReportRunCompleted` are emitted via `ENG-024`. (Deliverable 10; Rules 3, 6, 9.)
15. **AC-015 — Report execution validation.** A Report Run referencing a non-Active Report Definition, or a Delivery Configuration referencing a non-Active Distribution List or Export Configuration, is rejected; the transaction transitions to `Failed` with an audit trail. (Deliverable 11; Rules 2, 3, 9.)
16. **AC-016 — Export Configuration creation.** A caller with appropriate grants can create an Export Configuration bound to a Report Definition; formats conform to `ENG-027`-supported standard formats; state changes are audited. (Deliverable 12; Rules 4, 6.)
17. **AC-017 — Export execution.** When a Report Run has a bound Export Configuration, `ENG-027` produces the export; `ExportCompleted` is emitted via `ENG-024` on completion with a corresponding `ENG-004` audit record. (Deliverable 13; Rules 4, 6.)
18. **AC-018 — Export validation.** Export Configurations are validated declaratively vs approved formats and Report Output Configuration; violations rejected at capture time. (Deliverable 14; Rules 4, 8.)
19. **AC-019 — ReportPublished signal.** A completed Report Run bound to a Delivery Configuration emits `ReportPublished` via `ENG-024` with a corresponding `ENG-004` audit record. (Deliverable 15; Rules 5, 6.)
20. **AC-020 — Authorized delivery.** Distribution destinations are authorized via `ENG-002` / `ENG-003` per `ADR-032`; unauthorized destinations rejected at capture and at execution time. (Deliverables 4, 5; Rule 5.)
21. **AC-021 — Read-model-only.** No Sprint 004 operation writes to a source module's master or transactional data. (Deliverable 16; Rule 7.)
22. **AC-022 — Audit trail.** Every state-changing operation in §2 (Distribution List, Distribution Channel configuration, Delivery Configuration, Report Definition, Report Output Configuration, Report Retention Configuration, Export Configuration, and Report Run transaction lifecycle) emits an `ENG-004` audit record per `ADR-014`. (Deliverables 1–14; Rule 6.)
23. **AC-023 — Ownership boundaries preserved.** No MOD-001 / MOD-002 / source-module authority is redefined; MOD-017 does not claim ownership of any platform engine; KPI (Sprint 002), Dashboard (Sprint 003), and Data Mart (Sprint 001) authorities remain unchanged. (Deliverable 16.)

---

## 10. Ownership Boundaries

Recapitulated from §1.1.4 (not evolved):

- **MOD-017 Analytics** owns the Distribution, Reporting, and Export authorities established in this sprint, and continues to own Dashboard and Visualization authorities (Sprint 003), KPI Framework and KPI Metric Catalog authorities (Sprint 002), and Data Mart and Analytics Foundation configuration (Sprint 001).
- **Source modules** continue to own all transactional and master data; MOD-017 consumes strictly read-only.
- **Platform modules and engines** retain ownership of Identity (`ENG-001` / MOD-001), Authorization (`ENG-002` / MOD-001), Permission (`ENG-003` / MOD-001), Configuration (`ENG-005`), Audit (`ENG-004`), Workflow (`ENG-010`), Approval (`ENG-011`), Scheduler (`ENG-014`), Numbering (`ENG-017`), Reporting (`ENG-021`), Integration (`ENG-023`), Event infrastructure (`ENG-024`), Notification (`ENG-025`), and Export (`ENG-027`).
- **Analytics remains a read-model-only consumer** of operational data.

**No ownership reassignment. No new authority beyond the Sprint Plan allocation.**

---

## 11. Non-Goals

- No Data Mart master, Analytics Foundation configuration, refresh cadence, retention (per-mart), ingestion contracts, numbering series registration, or module-wide search-index baseline (allocated to `SPR-MOD-017-001`).
- No KPI master, KPI Category, KPI Classification, KPI Version, KPI Metric Catalog authority, or KPI Framework events (allocated to `SPR-MOD-017-002`).
- No Dashboard master, Dashboard Layout, Dashboard Group, Visualization Configuration, Dashboard View transaction, drill-down navigation, or `DashboardShared` publication (allocated to `SPR-MOD-017-003`).
- No Model Run transaction, Anomaly Highlights, cross-module event consumption as mart inputs, compliance/retention audit-readiness reporting, `ModelRunCompleted` publication, or read-only surface provided to MOD-018 (allocated to `SPR-MOD-017-005`).
- No analytical models. No predictive analytics. No anomaly detection. No executive analytics. No cross-module analytics.
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
- [`docs/30-sprint-prds/analytics/sprints/SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md`](./SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md) — Upstream Sprint PRD.
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md) — Module lifecycle workflow.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring rules.
- [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) — Sprint catalog projection.
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md) — ERP Core Engines (authoritative).
- [`docs/11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md) — Accepted ADRs.
- [`docs/50-audit-reports/REPOSITORY_AUDIT_20260717T180000Z.md`](../../../50-audit-reports/REPOSITORY_AUDIT_20260717T180000Z.md) — Preceding audit (Repository READY).
