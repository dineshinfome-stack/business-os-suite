---
title: "WEB-001 — Analytics Web Solution Design Specification"
summary: "Phase 3 Web Solution Design specification for MOD-017 Analytics. Derived exclusively from the Analytics Module Publication. Defines user journeys, navigation, screen inventory, forms, dashboards, responsive behaviour, accessibility, and user-facing security expectations. Introduces no new business requirements."
spec_id: "WEB-001"
family: "WEB"
source_module: "MOD-017"
source_module_name: "Analytics"
source_publication: "MOD-017_MODULE_PUBLICATION"
source_baseline: "MOD017_ANALYTICS_BASELINE_v1"
source_module_prd: "docs/20-module-prds/analytics/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-017-001", "SPR-MOD-017-002", "SPR-MOD-017-003", "SPR-MOD-017-004", "SPR-MOD-017-005"]
version: "1.0"
status: "Active"
lifecycle_state: "Active"
owner: "Insights"
layer: "platform"
updated: "2026-07-18"
tags: ["solution-design", "web", "phase-3", "WEB-001", "MOD-017", "analytics", "SD-002"]
document_type: "Web Solution Design Specification"
template: "SD-002"
template_version: "v1.0"
governance_specification: "v1.0"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-026", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032", "ADR-081"]
---

# WEB-001 — Analytics Web Solution Design Specification

> **Reference derivation only.** WEB-001 is a Web-surface projection of the Analytics Module Publication [`MOD-017_MODULE_PUBLICATION`](../../45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md). It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. On any conflict with the Module Publication or its parent Module Baseline, the upstream artifact wins and WEB-001 is corrected in the same change.

## A. Overview

### A.1 Purpose

Define the Web-surface user experience through which authorized business users consume the Analytics capabilities published in `MOD-017_MODULE_PUBLICATION` — curated data marts, KPI catalog, dashboards, scheduled report distribution, bulk exports, and analytical models — over the Analytics read model, without mutating any source-module transaction.

### A.2 Scope

Web (desktop, tablet, mobile-browser responsive) surface covering:

- Analytics Foundation configuration surfaces (Data Marts, Foundation Configuration).
- KPI Master lifecycle and Metric Catalog browsing surfaces.
- Dashboard authoring, viewing, sharing, and drill-down.
- Report Definition, Distribution List, Scheduled Distribution, and Bulk Export surfaces.
- Analytical Model lifecycle, execution, and Anomaly Highlights / trend / comparative views.
- Compliance & retention audit-readiness surface.

Out of scope for WEB-001: Mobile-native surfaces (belongs to MOB-001), API contracts (belongs to API-001), UI mockups, framework decisions, and any business-rule authoring.

### A.3 Source Published Module

- **Module ID / Name:** MOD-017 Analytics
- **Publication:** [`MOD-017_MODULE_PUBLICATION`](../../45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md)
- **Baseline:** [`MOD017_ANALYTICS_BASELINE_v1`](../../40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md)
- **Module PRD:** [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md)
- **Sprint Plan:** [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../../30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md)
- **Sprint PRDs:** `SPR-MOD-017-001` … `SPR-MOD-017-005`

### A.4 Version

- **Specification Version:** 1.0
- **Aligned to Publication Version:** MOD-017 v1.0

### A.5 Traceability References

See §K for the complete feature-to-capability-to-sprint traceability matrix. Frontmatter records the full chain (Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → Module Publication → WEB-001).

## B. User Personas

Personas are inherited from the Module PRD §3 and Sprint PRD family; WEB-001 introduces no new roles. Concrete grants remain enforced by `ENG-002` / `ENG-003` per `ADR-032` (RBAC + ABAC).

### B.1 Business User (all modules)

- **Responsibilities:** Consume dashboards, KPIs, and operational reports relevant to their business scope; subscribe to distributions; export permitted views.
- **Permissions (business-level):** Read access to non-sensitive dashboards, KPIs, and reports within their tenant, company, and row-scoped visibility. Sensitive-KPI access is governed by the Sensitive-KPI Classification Authority.
- **Primary Workflows:** View Dashboard, Drill-down, Subscribe to Report, Export Report.

### B.2 Analyst

- **Responsibilities:** Author and version KPIs, dashboards, report definitions, and analytical models over the Analytics read model.
- **Permissions (business-level):** Draft/edit rights on Analytics master data (Data Mart, KPI, Dashboard, Distribution List, Analytical Model) within scope; submit for approval; view runs.
- **Primary Workflows:** Define KPI, Author Dashboard, Author Report Definition, Register Data Mart, Define Analytical Model, Configure Distribution.

### B.3 Data Steward

- **Responsibilities:** Curate the Analytics Foundation — Data Mart registration, refresh cadence, retention, ingestion contract oversight, and Analytics Foundation Configuration.
- **Permissions (business-level):** Manage Data Mart master and Analytics Foundation Configuration; observe read-only ingestion streams; classify sensitive KPIs.
- **Primary Workflows:** Register Data Mart, Configure Refresh Cadence, Classify Sensitive KPI, Review Ingestion Health.

### B.4 Executive

- **Responsibilities:** Consume Executive Overview and Domain-specific dashboards for decision-making; monitor cross-module trends and Anomaly Highlights.
- **Permissions (business-level):** Read access to Executive Overview dashboards and cross-module analytical views within tenant scope.
- **Primary Workflows:** View Executive Overview, View Anomaly Highlights, Drill-down into KPIs.

### B.5 Auditor

- **Responsibilities:** Verify compliance/retention audit-readiness; inspect KPI catalog version history, dashboard freshness declarations, distribution history, and model run history.
- **Permissions (business-level):** Read access to audit-readiness surface and audit-visible history within scope; no mutation rights.
- **Primary Workflows:** Inspect Audit-Readiness Surface, Review Version History, Review Run History.

### B.6 System Administrator

- **Responsibilities:** Approve KPI and Report lifecycle transitions where configured; oversee distribution channel and delivery configuration; oversee tenant-level Analytics configuration.
- **Permissions (business-level):** Approve KPI activation, report publication, model activation via `ENG-011` where the approval policy requires it.
- **Primary Workflows:** Approve KPI Activation, Approve Report Publication, Configure Distribution Channel.

## C. User Journeys

Every journey is derived from a capability in the Module Publication §3 and the transaction lifecycles in Module Publication §8. WEB-001 defines Web-surface flows only; business rules, state legality, and authorization are owned by the Module Publication and enforced by platform engines.

### C.1 Journey — View Dashboard and Drill-down

- **Entry Points:** Global Analytics area entry; direct link to a specific dashboard; embedded card on a persona home surface.
- **Primary Flow:** User opens Dashboards catalog → selects dashboard → dashboard renders with declared freshness indicator → user filters / groups → user drills down from a widget to the underlying KPI or Analytical View.
- **Alternate Flows:** Shared-link entry (via `DashboardShared`); switch between Executive Overview and Domain-specific dashboards; save personalised filter selection where the dashboard permits.
- **Exception Flows:** Insufficient permission → access-denied state; freshness expectation not met → stale-data indicator; sensitive-KPI redaction where row-level access is not granted.

### C.2 Journey — Browse KPI Catalog

- **Entry Points:** Analytics area → KPI Catalog; KPI reference from a dashboard widget; cross-module KPI reference from another module surface.
- **Primary Flow:** User opens KPI Catalog → searches / filters by classification, ownership, or lifecycle state → opens a KPI Master entry → views definition, version history (single Active version indicated), sensitive classification, and current value.
- **Alternate Flows:** View KPI Trends operational report from KPI detail; navigate to the dashboards that reference the KPI.
- **Exception Flows:** Sensitive-KPI classification hides value pending row-level access; archived / inactive versions are read-only; access-denied where policy prohibits.

### C.3 Journey — Author a KPI

- **Entry Points:** KPI Catalog → New KPI; edit action on an existing Draft KPI.
- **Primary Flow:** Analyst captures KPI Master fields → saves as Draft → submits for approval → approver acts via `ENG-011` where required → activation transitions state to Active (only one Active version exposed at a time) → publication signal emits via `ENG-024`.
- **Alternate Flows:** Save Draft without submission; withdraw submission; deactivate an Active version (`Active → Inactive`); archive (`Inactive → Archived`).
- **Exception Flows:** Validation failure at capture; approval rejected → state returns to Draft with reviewer notes; concurrent version conflict.

### C.4 Journey — Author a Dashboard

- **Entry Points:** Dashboards catalog → New Dashboard; edit action on an existing dashboard.
- **Primary Flow:** Analyst assembles widgets bound to the Analytics read model → configures layout, filters, groupings, drill-down navigation → declares data-freshness expectation → saves lifecycle-managed dashboard → publishes for consumption.
- **Alternate Flows:** Duplicate an existing dashboard; scope to Executive Overview or a Domain-specific dashboard family; share dashboard (emits `DashboardShared`).
- **Exception Flows:** Freshness declaration cannot be satisfied by the bound data mart; visualization binds to a sensitive KPI without approved audience; permission denied on drill-down target.

### C.5 Journey — Register a Data Mart

- **Entry Points:** Analytics Foundation → Data Marts → New Data Mart.
- **Primary Flow:** Data Steward registers Data Mart master fields (definition, metadata, source registration, refresh cadence, retention) → validates configuration → activates lifecycle state.
- **Alternate Flows:** Import ingestion configuration where the ingestion contract supports it; deactivate a mart; archive a mart.
- **Exception Flows:** Source registration validation failure; refresh cadence conflicts with retention; ingestion contract not honoured.

### C.6 Journey — Configure Analytics Foundation

- **Entry Points:** Analytics Foundation → Configuration.
- **Primary Flow:** Data Steward selects tenant / company / context scope → edits analytics configuration surface (refresh scheduling, environment-level settings) → validates → publishes configuration.
- **Alternate Flows:** Inherit from parent scope; override at lower scope.
- **Exception Flows:** Validation failure; scope conflict with parent configuration.

### C.7 Journey — Author a Report Definition and Distribution

- **Entry Points:** Reports → Report Definitions → New Report Definition; Distribution Lists → New Distribution List.
- **Primary Flow:** Analyst defines Report Definition → attaches Distribution List and Distribution Channel / Delivery Configuration → configures schedule via `ENG-014` → submits for approval where policy requires → activation exposes report for scheduled runs.
- **Alternate Flows:** Ad-hoc run; multiple channels per distribution list.
- **Exception Flows:** Channel not configured; approval rejected; schedule collision.

### C.8 Journey — Run and Distribute a Scheduled Report

- **Entry Points:** Scheduled run trigger; on-demand Run Report action on a Report Definition detail surface.
- **Primary Flow:** Report Run transaction opens → renders via `ENG-021` → distributes via configured channels via `ENG-023` → notifications dispatch via `ENG-025` where configured → `ReportPublished` emits via `ENG-024`.
- **Alternate Flows:** Retry on delivery failure per configuration; download the produced artifact from the Run detail.
- **Exception Flows:** Render failure → Run transaction reflects failure state; delivery failure → distribution reflects failure state; permission denied on data.

### C.9 Journey — Export in Bulk

- **Entry Points:** Report Definition detail → Export; Dashboard widget → Export; Analytical View → Export.
- **Primary Flow:** User selects a permitted export configuration → export produces a standard format via `ENG-027` → user downloads the artifact.
- **Alternate Flows:** Queue export for large payloads; deliver via configured channel where permitted.
- **Exception Flows:** Export configuration not permitted for the user's scope; sensitive-KPI redaction applies to exported payload.

### C.10 Journey — Author, Version, and Execute an Analytical Model

- **Entry Points:** Analytics → Analytical Models → New / Edit.
- **Primary Flow:** Analyst captures Analytical Model master → configures Model Execution Configuration → submits for approval where required → activation exposes the model (single Active version at a time) → scheduled run via `ENG-014` produces a Model Run transaction → `ModelRunCompleted` emits via `ENG-024`.
- **Alternate Flows:** On-demand run against the Active version; deactivate; archive; view run history.
- **Exception Flows:** Execution attempted against a non-Active version → rejected; validation failure at capture; execution failure recorded on the Model Run.

### C.11 Journey — View Anomaly Highlights and Cross-Module Analytical Views

- **Entry Points:** Analytics → Cross-Module Views → Anomaly Highlights / Trend / Comparative.
- **Primary Flow:** User opens the view → freshness indicator displays → user filters cross-module aggregations → drills down to the source module reference where the source module surface is authorized.
- **Alternate Flows:** Save filter selection; share view (subject to permission).
- **Exception Flows:** Source-module drill-down denied; freshness expectation not met.

### C.12 Journey — Compliance and Retention Audit-Readiness

- **Entry Points:** Analytics → Audit-Readiness (audit persona only).
- **Primary Flow:** Auditor opens the audit-readiness surface → inspects KPI catalog version history, dashboard freshness declarations, distribution/report run history, model run history — read-only.
- **Alternate Flows:** Filter by time range, entity, or actor within tenant scope.
- **Exception Flows:** Records outside retention window are surfaced as archived; access denied where policy prohibits.

## D. Navigation Structure

Derived from Publication §3 (Approved Scope) capability grouping and §7–§8 (Master Data / Transaction Authorities).

### D.1 Application Areas

- **Analytics Home** — persona-appropriate landing surface with Executive Overview or Domain-specific dashboards.
- **Dashboards** — catalog and viewer for Dashboard master; drill-down surfaces.
- **KPI Catalog** — KPI Master, Metric Catalog, KPI Trends.
- **Reports & Distribution** — Report Definitions, Distribution Lists, Distribution Channels, Report Runs.
- **Exports** — Export Configurations and export history.
- **Analytical Models** — Analytical Model master, Model Execution Configuration, Model Runs, Anomaly Highlights, cross-module analytical views.
- **Analytics Foundation** — Data Marts and Analytics Foundation Configuration.
- **Audit-Readiness** — compliance/retention read-only surface.

### D.2 Menu Hierarchy

```text
Analytics
├── Home
├── Dashboards
│   ├── Executive Overview
│   ├── Domain Dashboards
│   └── Shared with Me
├── KPI Catalog
│   ├── Browse
│   ├── KPI Trends
│   └── Sensitive KPIs
├── Reports & Distribution
│   ├── Report Definitions
│   ├── Distribution Lists
│   ├── Distribution Channels
│   └── Report Runs
├── Exports
│   ├── Export Configurations
│   └── Export History
├── Analytical Models
│   ├── Models
│   ├── Model Runs
│   ├── Anomaly Highlights
│   └── Trend & Comparative Views
├── Analytics Foundation
│   ├── Data Marts
│   └── Configuration
└── Audit-Readiness
```

### D.3 Breadcrumbs

Breadcrumbs mirror the menu hierarchy and always root at "Analytics". Entity detail surfaces append the entity's business name (e.g. `Analytics / Dashboards / Executive Overview / Revenue Snapshot`).

### D.4 Cross-Module Navigation

Drill-down targets that leave the Analytics area (e.g. into a source-module transaction) are surfaced as outbound navigation and remain subject to the target module's own authorization. Analytics does not mutate source-module transactions.

## E. Screen Inventory

Each row: purpose, primary actions, displayed business data, navigation relationships. Derived from the capabilities, master data, and transactions declared in the Module Publication. Visual mockups are out of scope.

### E.1 Analytics Home

- **Purpose:** Persona-appropriate landing surface.
- **Primary Actions:** Open dashboard, open KPI catalog, open recent report run.
- **Displayed Business Data:** Persona-appropriate dashboards, most-viewed KPIs, recent shared items.
- **Relationships:** Entry point to Dashboards, KPI Catalog, Reports & Distribution.

### E.2 Dashboards Catalog

- **Purpose:** Browse and open Dashboard master entries.
- **Primary Actions:** Open, share, create, duplicate, deactivate, archive.
- **Displayed Business Data:** Dashboard name, ownership, lifecycle state, freshness declaration, last-shared indicator.
- **Relationships:** Opens Dashboard Viewer; New Dashboard opens Dashboard Authoring.

### E.3 Dashboard Viewer

- **Purpose:** Render a Dashboard View transaction and enable drill-down.
- **Primary Actions:** Filter, group, drill-down, share, export, save personalisation (where permitted).
- **Displayed Business Data:** Widget content bound to the Analytics read model; freshness indicator; sensitive-KPI redaction where applicable.
- **Relationships:** Drill-down to KPI Detail, Analytical Views, or source-module surfaces.

### E.4 Dashboard Authoring

- **Purpose:** Author and version a Dashboard master entry.
- **Primary Actions:** Add / remove / reorder widgets, configure filters, declare data-freshness expectation, submit lifecycle transitions.
- **Displayed Business Data:** Widget bindings, layout, filter definitions, drill-down mapping, freshness declaration.
- **Relationships:** Preview opens Dashboard Viewer.

### E.5 KPI Catalog Browse

- **Purpose:** Browse KPI Master entries and the Metric Catalog.
- **Primary Actions:** Search, filter, open KPI Detail.
- **Displayed Business Data:** KPI identifier, definition summary, classification, ownership, lifecycle state, sensitive flag.
- **Relationships:** Opens KPI Detail; opens KPI Trends.

### E.6 KPI Detail

- **Purpose:** Inspect a single KPI Master and its versions.
- **Primary Actions:** View current value, view version history, submit lifecycle transitions (where authorized).
- **Displayed Business Data:** Definition, metadata, classification, ownership, version history, Active version indicator.
- **Relationships:** Navigate to dashboards referencing this KPI; open KPI Trends.

### E.7 KPI Trends

- **Purpose:** Operational report of KPI trend over time.
- **Primary Actions:** Filter by time range, entity, and scope.
- **Displayed Business Data:** KPI value series; sensitive-KPI redaction applies.
- **Relationships:** Back-link to KPI Detail.

### E.8 KPI Authoring

- **Purpose:** Capture / edit a KPI Master.
- **Primary Actions:** Save Draft, submit for approval, withdraw, transition lifecycle.
- **Displayed Business Data:** KPI Master fields, classification, ownership, validation feedback.
- **Relationships:** Approval surfaces open where policy requires.

### E.9 Report Definitions

- **Purpose:** Browse / manage Report Definition master.
- **Primary Actions:** Open, create, edit, submit lifecycle transitions, run ad-hoc.
- **Displayed Business Data:** Report identifier, ownership, lifecycle state, active distributions.
- **Relationships:** Opens Report Definition Detail; opens Report Run Detail.

### E.10 Report Definition Detail

- **Purpose:** Inspect a single Report Definition.
- **Primary Actions:** Edit, attach distribution, run now, export, submit lifecycle transitions.
- **Displayed Business Data:** Definition fields, attached distribution lists, schedule summary, recent Report Runs.
- **Relationships:** Opens Distribution Lists, Report Runs, Exports.

### E.11 Distribution Lists

- **Purpose:** Manage Distribution List master.
- **Primary Actions:** Create, edit, activate, deactivate, archive.
- **Displayed Business Data:** Recipients, delivery configuration, channel bindings.
- **Relationships:** Referenced from Report Definitions.

### E.12 Distribution Channels

- **Purpose:** Configure Distribution Channel and Delivery Configuration.
- **Primary Actions:** Configure, validate, activate.
- **Displayed Business Data:** Channel type, delivery configuration, integration status.
- **Relationships:** Referenced from Distribution Lists.

### E.13 Report Runs

- **Purpose:** List and inspect Report Run transactions.
- **Primary Actions:** Open Run Detail, retry (where configured), download artifact.
- **Displayed Business Data:** Run identifier (numbered via `ENG-017`), state, timestamps, distribution outcome.
- **Relationships:** Opens Report Run Detail.

### E.14 Report Run Detail

- **Purpose:** Inspect a single Report Run.
- **Primary Actions:** Download artifact, view delivery outcomes, view audit-visible history.
- **Displayed Business Data:** Run identifier, lifecycle state, distribution results, artifact reference.
- **Relationships:** Back-link to Report Definition.

### E.15 Export Configurations

- **Purpose:** Manage Export Configurations.
- **Primary Actions:** Create, edit, activate, deactivate.
- **Displayed Business Data:** Export format, scope binding, permissions.
- **Relationships:** Referenced from Dashboards, Reports, Analytical Views.

### E.16 Export History

- **Purpose:** Audit-visible list of exports produced.
- **Primary Actions:** Download recent artifacts, filter.
- **Displayed Business Data:** Export identifier, scope, requester, timestamp.
- **Relationships:** Back-links to source surface.

### E.17 Analytical Models

- **Purpose:** Manage Analytical Model master.
- **Primary Actions:** Create, edit, submit lifecycle transitions, run.
- **Displayed Business Data:** Model identifier, ownership, versions with Active indicator, execution configuration summary.
- **Relationships:** Opens Analytical Model Detail; opens Model Runs.

### E.18 Analytical Model Detail

- **Purpose:** Inspect a single Analytical Model.
- **Primary Actions:** Edit, version, activate, deactivate, run.
- **Displayed Business Data:** Definition, metadata, version history, execution configuration.
- **Relationships:** Opens Model Runs.

### E.19 Model Runs

- **Purpose:** List and inspect Model Run transactions.
- **Primary Actions:** Open Run Detail.
- **Displayed Business Data:** Run identifier (numbered via `ENG-017`), state, timestamps, model version reference.
- **Relationships:** Opens Model Run Detail.

### E.20 Anomaly Highlights

- **Purpose:** Cross-module anomaly view.
- **Primary Actions:** Filter, drill-down.
- **Displayed Business Data:** Highlighted anomalies over the Analytics read model.
- **Relationships:** Drill-down into source-module surfaces (subject to target authorization).

### E.21 Trend and Comparative Views

- **Purpose:** Cross-module trend / comparative analytical views.
- **Primary Actions:** Filter, drill-down, export.
- **Displayed Business Data:** Aggregated trend / comparative content.
- **Relationships:** Drill-down into source-module surfaces or KPI Detail.

### E.22 Data Marts

- **Purpose:** Manage Data Mart master.
- **Primary Actions:** Create, edit, activate, deactivate, archive.
- **Displayed Business Data:** Mart identifier, source registration, refresh cadence, retention, lifecycle state.
- **Relationships:** Bindings referenced from Dashboards, Reports, Models.

### E.23 Analytics Foundation Configuration

- **Purpose:** Manage Analytics Foundation Configuration surface.
- **Primary Actions:** Edit, validate, publish scope-level configuration.
- **Displayed Business Data:** Configuration values by tenant / company / context.
- **Relationships:** Reflected in ingestion, distribution, and model execution.

### E.24 Audit-Readiness

- **Purpose:** Read-only compliance / retention audit-readiness surface.
- **Primary Actions:** Filter, inspect history.
- **Displayed Business Data:** KPI catalog version history, dashboard freshness declarations, distribution / report run / model run history within retention window.
- **Relationships:** Back-links into originating entity details.

## F. Forms

Every form derives its fields from the Master Data and Transaction Authorities declared in Module Publication §7–§8. Validation is business-level (declarative rules resolved via `ENG-012`); technical validation is out of scope.

### F.1 Data Mart Form

- **Purpose:** Register / maintain a Data Mart.
- **Fields:** Business identifier, name, description, source registration, refresh cadence, retention window, lifecycle state.
- **Validation Rules (business-level):** Required identifier; refresh cadence must be consistent with retention; source registration must reference a permitted ingestion contract.
- **User Actions:** Save Draft, Validate, Activate, Deactivate, Archive.
- **Success Outcome:** Data Mart persisted; ingestion contract engaged read-only.
- **Failure Outcome:** Validation feedback surfaced; state unchanged.

### F.2 Analytics Foundation Configuration Form

- **Purpose:** Configure analytics settings per tenant / company / context.
- **Fields:** Scope selector, refresh scheduling, environment-level settings, configuration validity flag.
- **Validation Rules (business-level):** Scope must exist; child scope may not conflict with parent unless override permitted.
- **User Actions:** Edit, Validate, Publish.
- **Success Outcome:** Configuration published for scope.
- **Failure Outcome:** Validation feedback surfaced.

### F.3 KPI Form

- **Purpose:** Author / edit a KPI Master.
- **Fields:** Identifier, name, definition, metadata, classification, ownership, sensitive flag, lifecycle state, version reference.
- **Validation Rules (business-level):** Required identifier; single Active version invariant enforced; sensitive KPI classification triggers row-level access requirement.
- **User Actions:** Save Draft, Submit for Approval, Withdraw, Activate, Deactivate, Archive.
- **Success Outcome:** KPI persisted / transitioned; catalog change signal emits via `ENG-024`.
- **Failure Outcome:** Validation feedback surfaced; approval rejection returns to Draft with reviewer notes.

### F.4 Dashboard Form

- **Purpose:** Author / edit a Dashboard master.
- **Fields:** Identifier, name, description, layout, widget bindings, filters, grouping, drill-down mapping, freshness declaration, ownership, lifecycle state, visibility.
- **Validation Rules (business-level):** Freshness declaration must be resolvable against bound data marts; visualization binding to a sensitive KPI requires an approved audience; required identifier.
- **User Actions:** Save Draft, Preview, Publish, Deactivate, Archive, Share.
- **Success Outcome:** Dashboard persisted; `DashboardShared` emits on share via `ENG-024`.
- **Failure Outcome:** Validation feedback surfaced.

### F.5 Report Definition Form

- **Purpose:** Author / edit a Report Definition.
- **Fields:** Identifier, definition body, distribution list references, delivery configuration references, export configuration references, schedule, ownership, lifecycle state.
- **Validation Rules (business-level):** Required identifier; schedule must be non-conflicting; distribution list must reference a valid channel.
- **User Actions:** Save Draft, Submit for Approval, Activate, Run Now, Deactivate, Archive.
- **Success Outcome:** Report Definition persisted; Report Runs may be issued.
- **Failure Outcome:** Validation feedback surfaced; approval rejection returns to Draft.

### F.6 Distribution List Form

- **Purpose:** Author / edit a Distribution List master.
- **Fields:** Identifier, recipients, delivery configuration, channel bindings, ownership, lifecycle state.
- **Validation Rules (business-level):** Required identifier; recipients must be within permitted scope; channel must be Active.
- **User Actions:** Save, Activate, Deactivate, Archive.
- **Success Outcome:** Distribution List persisted.
- **Failure Outcome:** Validation feedback surfaced.

### F.7 Distribution Channel Form

- **Purpose:** Configure Distribution Channel and Delivery Configuration.
- **Fields:** Channel type, delivery configuration, activation flag.
- **Validation Rules (business-level):** Channel type must be permitted for the tenant; delivery configuration must be complete before activation.
- **User Actions:** Configure, Validate, Activate, Deactivate.
- **Success Outcome:** Channel available for Distribution Lists.
- **Failure Outcome:** Validation feedback surfaced.

### F.8 Export Configuration Form

- **Purpose:** Configure a bulk export.
- **Fields:** Format, scope binding, permitted audience, delivery option.
- **Validation Rules (business-level):** Scope binding must respect tenant/company/context authorization; permitted audience must be within business scope.
- **User Actions:** Save, Activate, Deactivate.
- **Success Outcome:** Export Configuration available on bound surfaces.
- **Failure Outcome:** Validation feedback surfaced.

### F.9 Analytical Model Form

- **Purpose:** Author / edit an Analytical Model master.
- **Fields:** Identifier, definition, metadata, version reference, execution configuration reference, ownership, lifecycle state.
- **Validation Rules (business-level):** Required identifier; single Active version invariant enforced; execution is limited to Active versions.
- **User Actions:** Save Draft, Submit for Approval, Activate, Deactivate, Archive, Run.
- **Success Outcome:** Analytical Model persisted / transitioned.
- **Failure Outcome:** Validation feedback surfaced; execution against non-Active versions rejected.

### F.10 Model Execution Configuration Form

- **Purpose:** Configure model execution parameters.
- **Fields:** Schedule, parameter bindings, resource envelope, notification bindings.
- **Validation Rules (business-level):** Schedule must be non-conflicting; parameter bindings must reference permitted Data Marts.
- **User Actions:** Save, Activate, Deactivate.
- **Success Outcome:** Execution Configuration bound to model.
- **Failure Outcome:** Validation feedback surfaced.

## G. Dashboards

Dashboards are a first-class business capability of MOD-017; WEB-001 defines the Web-surface expectations only.

### G.1 Executive Overview Dashboard

- **Purpose:** Cross-module executive summary over the Analytics read model.
- **Widgets:** Cross-module KPI tiles, trend widgets, Anomaly Highlights summary.
- **KPIs / Summaries:** Sourced from the KPI Master; sensitive-KPI redaction applies per audience.
- **Drill-Down Navigation:** Widget → KPI Detail; widget → Trend / Comparative Views; widget → source module surface (subject to target authorization).

### G.2 Domain-Specific Dashboards

- **Purpose:** Domain-scoped dashboards (per source module or business domain) over the Analytics read model.
- **Widgets:** Domain-specific KPI tiles, trend widgets, operational summaries.
- **KPIs / Summaries:** Sourced from the KPI Master.
- **Drill-Down Navigation:** Widget → KPI Detail; widget → Report Definitions bound to the domain; widget → source module surface.

### G.3 KPI Trends Report Surface

- **Purpose:** Operational report of KPI trend over time.
- **Widgets:** Trend line, breakdown facets.
- **KPIs / Summaries:** Single KPI in focus.
- **Drill-Down Navigation:** Back-link to KPI Detail.

### G.4 Anomaly Highlights View

- **Purpose:** Cross-module anomaly surfacing over the Analytics read model.
- **Widgets:** Anomaly list, contextual metadata.
- **KPIs / Summaries:** Anomaly signals derived from Analytical Models.
- **Drill-Down Navigation:** Anomaly → source-module surface (subject to target authorization).

### G.5 Trend and Comparative Views

- **Purpose:** Cross-module trend and comparative analytics.
- **Widgets:** Trend chart, comparative table, filter facets.
- **KPIs / Summaries:** Aggregated cross-module measures.
- **Drill-Down Navigation:** KPI Detail; source-module surfaces.

Every dashboard displays its declared freshness expectation. A dashboard whose freshness expectation is not satisfied displays a stale-data indicator.

## H. Responsive Behaviour

Web-surface responsive expectations only. No implementation guidance.

### H.1 Desktop

- Full navigation hierarchy visible.
- Multi-column dashboard layouts preserved.
- Long tables (Report Runs, Model Runs) render with column-level actions.

### H.2 Tablet

- Navigation collapses to a primary rail; the current area remains visible.
- Dashboard layouts reflow to preserve widget legibility; drill-down remains one action from any widget.
- Forms present grouped sections without loss of field context.

### H.3 Mobile Browser

- Read-first mode: dashboards, KPI Catalog, and Report Runs are the primary surfaces.
- Authoring surfaces (KPI, Dashboard, Report Definition, Analytical Model) remain reachable but present a compact single-column layout; complex authoring may be deferred to desktop/tablet.
- Freshness and sensitive-KPI indicators remain prominent.

Mobile-native experiences (offline, push, camera, device capabilities) are out of scope for WEB-001 and belong to MOB-001.

## I. Accessibility

Aligned to `ADR-081` (Accessibility Standard). No implementation guidance; objectives only.

- **Keyboard Navigation:** Every action reachable via keyboard alone. Escape returns focus predictably.
- **Focus Order:** Follows visual reading order; focus indicators are always visible.
- **Semantic Structure:** Headings, landmarks, and list semantics used consistently; tables use table semantics with row/column headers.
- **Screen Reader Compatibility:** All interactive elements have accessible names; state changes (approval submission, run started, share) are announced.
- **Color-Independent Communication:** Freshness state, sensitive-KPI redaction, lifecycle state, and error states are communicated by more than color alone (icon + text label).
- **Localization:** All labels resolvable via `ENG-006`; layout tolerates text expansion.

## J. Security Considerations

User-facing security expectations derived from Module Publication §4 authorities, §11 ADR consumption, and the Sensitive-KPI Classification Authority. No implementation mechanisms.

### J.1 Authentication Entry Points

- Access to Analytics requires authenticated identity per `ENG-001`. Unauthenticated navigation is redirected to the platform-level sign-in surface owned by MOD-001; WEB-001 does not define authentication mechanics.

### J.2 Authorization Visibility

- Menus, actions, and detail fields are gated by `ENG-002` / `ENG-003` per `ADR-032` (RBAC + ABAC). Users see only entities within their tenant, company, and row-level scope.
- Sensitive-KPI values are redacted where the user lacks the classification-permitted access; presence of the KPI may still be visible when the catalog policy permits.

### J.3 Session Awareness

- The Web surface communicates authenticated identity, active tenant / company / context, and configuration scope in a persistent surface element.
- Session expiration is communicated before it interferes with an in-progress form.

### J.4 Audit Visibility

- Lifecycle transitions (KPI, Dashboard, Report Definition, Analytical Model), distribution runs, model runs, and shares are audit-visible per `ADR-014`.
- Audit-visible history is exposed on the Audit-Readiness surface (§E.24) for authorized personas.

### J.5 Multi-Tenant Isolation

- Every surface honours tenant isolation per `ADR-011`. Cross-tenant navigation is not offered; sharing operates only within tenant scope.

### J.6 Read-Only Boundary

- The Web surface never offers actions that mutate source-module transactions. Drill-down into a source module surrenders control to that module's own surface and its own authorization.

## K. Traceability Matrix

Every WEB-001 feature maps to a Module Publication capability and one or more originating Sprints. Capability rows are derived from `MOD-017_MODULE_PUBLICATION` §3, §7, §8, §9.

| WEB-001 Feature | Business Capability (Publication §) | Originating Sprint(s) |
| --- | --- | --- |
| Analytics Home (§E.1) | Analytics foundations; Dashboards (§3) | SPR-MOD-017-001, 003 |
| Dashboards Catalog / Viewer / Authoring (§E.2–§E.4); Dashboards journey (§C.1, §C.4) | Dashboards and visualization; `DashboardShared` (§3, §4.3, §9) | SPR-MOD-017-003 |
| KPI Catalog Browse / Detail / Trends / Authoring (§E.5–§E.8); KPI journeys (§C.2, §C.3) | KPI framework and metric catalog; Sensitive-KPI classification (§3, §4.2) | SPR-MOD-017-002 |
| Report Definitions & Detail (§E.9–§E.10); Report Definition journey (§C.7) | Reporting Authority; Scheduled distribution (§3, §4.4) | SPR-MOD-017-004 |
| Distribution Lists / Channels (§E.11–§E.12) | Distribution Authority (§3, §4.4) | SPR-MOD-017-004 |
| Report Runs / Run Detail (§E.13–§E.14); Run & Distribute journey (§C.8) | Report Run transaction; `ReportPublished` (§8, §9) | SPR-MOD-017-004 |
| Export Configurations / History (§E.15–§E.16); Bulk Export journey (§C.9) | Export Authority (§3, §4.4) | SPR-MOD-017-004 |
| Analytical Models / Detail / Runs (§E.17–§E.19); Model journey (§C.10) | Analytical Models Authority; Model Run transaction; `ModelRunCompleted` (§3, §4.5, §8, §9) | SPR-MOD-017-005 |
| Anomaly Highlights (§E.20); Anomaly journey (§C.11) | Cross-Module Analytics Authority (§3, §4.5) | SPR-MOD-017-005 |
| Trend & Comparative Views (§E.21) | Cross-Module Analytics Authority (§3, §4.5) | SPR-MOD-017-005 |
| Data Marts (§E.22); Data Mart journey (§C.5) | Data Mart Master Authority (§3, §4.1) | SPR-MOD-017-001 |
| Analytics Foundation Configuration (§E.23); Configuration journey (§C.6) | Analytics Foundation Configuration Authority (§3, §4.1) | SPR-MOD-017-001 |
| Audit-Readiness (§E.24); Audit journey (§C.12) | Compliance & Retention Audit-Readiness Authority (§4.5) | SPR-MOD-017-005 |
| Responsive Behaviour (§H); Accessibility (§I) | ADR-081 Accessibility Standard (§11) | SPR-MOD-017-001, 003 |
| Security Considerations (§J) | ADR-011, ADR-014, ADR-032 (§11); Sensitive-KPI Classification (§4.2) | SPR-MOD-017-001, 002, 003, 004, 005 |

No WEB-001 feature is absent from the traceability matrix. No feature in the matrix lacks an originating Sprint. WEB-001 introduces no capability, master data entity, transaction, event, engine, or ADR beyond those declared by `MOD-017_MODULE_PUBLICATION`.

## References

- [`docs/45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md`](../../45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md)
- [`docs/40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md`](../../40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md)
- [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md)
- [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../../30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md)
- [`docs/60-solution-design/README.md`](../README.md)
- [`docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`](../SOLUTION_DESIGN_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
