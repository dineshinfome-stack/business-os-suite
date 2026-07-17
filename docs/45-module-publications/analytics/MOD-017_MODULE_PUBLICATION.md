---
title: "MOD-017 Module Publication — Analytics"
summary: "GT-005 Module Publication for MOD-017 Analytics. Terminal governance artifact derived exclusively from MOD017_ANALYTICS_BASELINE_v1. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
publication_id: "MOD-017_MODULE_PUBLICATION"
module_id: "MOD-017"
module_name: "Analytics"
version: "1.0"
status: "Published"
owner: "Insights"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
parent_module_prd: "docs/20-module-prds/analytics/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md"
source_sprints: ["SPR-MOD-017-001", "SPR-MOD-017-002", "SPR-MOD-017-003", "SPR-MOD-017-004", "SPR-MOD-017-005"]
layer: "delivery"
updated: "2026-07-17"
tags: ["publication", "module", "MOD-017", "analytics", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD017-20260717T220000Z-001"
parent_execution_id: "GT004-MOD017-20260717T210000Z-001"
previous_audit_report_id: "REPOSITORY_AUDIT_20260717T210000Z"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-026", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032", "ADR-081"]
---

# MOD-017 Module Publication — Analytics

> **Reference publication only.** This publication is a faithful representation of [`MOD017_ANALYTICS_BASELINE_v1`](../../40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md). It introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-017
- **Module Name:** Analytics
- **Owner:** Insights
- **Publication ID:** MOD-017_MODULE_PUBLICATION
- **Source Baseline:** `MOD017_ANALYTICS_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../../30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-017-001` … `SPR-MOD-017-005`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

Curated data marts, KPIs, dashboards, and scheduled analytics across the enterprise. Analytics operates as a **read-model-only consumer** of source-module master and transactional data; it owns no source-domain records and mutates no source-module transactions.

## 3. Approved Scope

Restates the scope consolidated in `MOD017_ANALYTICS_BASELINE_v1` §2. Analytics owns:

- **Analytics foundations** — Data Mart master data and Analytics Foundation Configuration authority; read-only ingestion contracts; numbering series for Analytics documents.
- **KPI framework and metric catalog** — Single versioned KPI Master and KPI Metric Catalog authorities; sensitive-KPI classification and row-level access enforcement; KPI Trends reporting surface; cross-module KPI single-authority.
- **Dashboards and visualization** — Dashboard master; Visualization authority; Dashboard View transaction lifecycle; freshness-declaration rule; drill-downs; Executive Overview and Domain-specific dashboard scaffolding; publication of `DashboardShared`.
- **Scheduled distribution, reporting, and export** — Distribution List master; Report Definition master; Distribution Channel and Delivery Configuration; Export Configuration; Report Run transaction lifecycle; publication of `ReportPublished`.
- **Analytical models and cross-module analytics** — Analytical Model master; Model Execution Configuration; Model Run transaction lifecycle; cross-module analytical views (Anomaly Highlights, trend/comparative); compliance/retention audit-readiness surface; publication of `ModelRunCompleted`; read-only surface for MOD-018 AI Workspace.

## 4. Consolidated Authorities

Every authority is inherited verbatim from the Module Baseline §7. This publication restates them for consumer convenience; the Module Baseline remains authoritative.

### 4.1 SPR-MOD-017-001 — Analytics Foundation & Data Marts

- **Data Mart Master Authority**
- **Analytics Foundation Configuration Authority**
- **Read-Model-Only Ingestion Boundary**
- **Foundation Lifecycle Boundary**

### 4.2 SPR-MOD-017-002 — KPI Framework & Metric Catalog

- **KPI Framework Authority** (lifecycle `Draft → Active → Inactive → Archived`; single Active version at a time)
- **KPI Metric Catalog Authority**
- **Sensitive-KPI Classification Authority**
- **KPI Publication Signal Authority**

### 4.3 SPR-MOD-017-003 — Dashboards & Visualization

- **Dashboard Authority**
- **Visualization Authority**
- **Freshness-Declaration Rule Authority**
- **Dashboard Shared Event Authority** (publishes `DashboardShared`)

### 4.4 SPR-MOD-017-004 — Scheduled Distribution, Reporting & Export

- **Distribution Authority**
- **Reporting Authority**
- **Export Authority**
- **Report Published Event Authority** (publishes `ReportPublished`)

### 4.5 SPR-MOD-017-005 — Analytical Models & Cross-Module Analytics

- **Analytical Models Authority** (single Active version at a time; execution limited to Active versions)
- **Cross-Module Analytics Authority**
- **Compliance & Retention Audit-Readiness Authority**
- **MOD-018 Read-Only Surface Authority** (publishes `ModelRunCompleted`)
- **Read-Model-Only Boundary Convention**

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-017-001` … `SPR-MOD-017-005`) as consolidated in `MOD017_ANALYTICS_BASELINE_v1`. This publication introduces no new requirements. See the source Sprint PRDs for requirement-level detail.

## 6. Business Rules

Business rules are inherited verbatim from the Sprint PRD family as consolidated in `MOD017_ANALYTICS_BASELINE_v1` §7 (Governance Conventions Established). Key rule invariants:

- Only one Active version of a KPI is exposed at a time.
- Only one Active version of an Analytical Model is exposed at a time; execution is limited to Active versions.
- Sensitive-KPI access enforcement runs via `ENG-002`/`ENG-003` per `ADR-032`; row-level access is respected on every read.
- Each dashboard declares a data-freshness expectation resolved deterministically via `ENG-012`.
- Analytics never mutates a source-module transaction; ingestion is read-only via `ENG-024` and, where required, `ENG-026`.

## 7. Master Data Authorities

Inherited verbatim from `MOD017_ANALYTICS_BASELINE_v1` §4.3:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Data Mart | SPR-MOD-017-001 |
| KPI | SPR-MOD-017-002 |
| Dashboard | SPR-MOD-017-003 |
| Distribution List | SPR-MOD-017-004 |
| Analytical Model | SPR-MOD-017-005 |

Source-domain master ownership (Customer, Supplier, Employee, Item, Asset, Vehicle, etc.) remains with the originating modules and is consumed by Analytics read-only.

## 8. Transaction Authorities

Inherited verbatim from `MOD017_ANALYTICS_BASELINE_v1` §4.3:

| Transaction | Originating Sprint |
| --- | --- |
| Dashboard View | SPR-MOD-017-003 |
| Report Run | SPR-MOD-017-004 |
| Model Run | SPR-MOD-017-005 |

Analytics declares no ledger effects. Any ledger effects remain owned by MOD-002 Accounting.

## 9. Published Events

Inherited verbatim from `MOD017_ANALYTICS_BASELINE_v1` §8:

- `DashboardShared` — SPR-MOD-017-003
- `ReportPublished` — SPR-MOD-017-004
- `ModelRunCompleted` — SPR-MOD-017-005
- Sprint-declared refinements (inheriting `R-EV-*` risks from originating Sprints): KPI catalog change signals (SPR-MOD-017-002); `ModelRunStarted`, `AnalyticalModelDefined`, `AnalyticalModelUpdated`, `AnalyticalModelVersioned`, `AnalyticalModelActivated`, `AnalyticalModelDeactivated`, `CrossModuleAnalyticsGenerated` (SPR-MOD-017-005).

## 10. Consumed Events

Inherited verbatim from `MOD017_ANALYTICS_BASELINE_v1` §8:

- All module domain events (from every upstream module baseline) — consumed read-only as inputs to marts and cross-module aggregations. MOD-017 never mutates a source-module transaction.

## 11. Platform Engine Usage

Platform engines remain platform-owned and are consumed by Analytics via their Capability Interfaces. Engine set is inherited verbatim from `MOD017_ANALYTICS_BASELINE_v1` §5:

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-017-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-017-001, 002, 003, 004, 005 |
| ENG-003 (Permission Management Engine) | SPR-MOD-017-001, 002 |
| ENG-004 (Audit Engine) | SPR-MOD-017-001, 002, 003, 004, 005 |
| ENG-005 (Configuration Engine) | SPR-MOD-017-001, 002, 003, 004, 005 |
| ENG-006 (Localization Engine) | SPR-MOD-017-001, 002, 003 |
| ENG-010 (Workflow Engine) | SPR-MOD-017-002, 003, 004, 005 |
| ENG-011 (Approval Engine) | SPR-MOD-017-002, 004 |
| ENG-012 (Rules Engine) | SPR-MOD-017-003 |
| ENG-014 (Scheduler Engine) | SPR-MOD-017-004, 005 |
| ENG-017 (Numbering Engine) | SPR-MOD-017-001, 002, 003, 004, 005 |
| ENG-020 (Search Engine) | SPR-MOD-017-001, 002, 003 |
| ENG-021 (Reporting Engine) | SPR-MOD-017-004, 005 |
| ENG-022 (Dashboard Engine) | SPR-MOD-017-003 |
| ENG-023 (Integration Engine) | SPR-MOD-017-004, 005 |
| ENG-024 (Event Engine) | SPR-MOD-017-001, 002, 003, 004, 005 |
| ENG-025 (Notification Engine) | SPR-MOD-017-004 |
| ENG-026 (Import Engine) | SPR-MOD-017-001 |
| ENG-027 (Export Engine) | SPR-MOD-017-004 |
| ENG-028 (AI Copilot Engine) | SPR-MOD-017-005 |

`ENG-015` Voucher and `ENG-016` Posting are not consumed by any Analytics sprint.

Related ADRs (all `Accepted`, inherited from `MOD017_ANALYTICS_BASELINE_v1` §6): `ADR-011` (Multi-Tenant Isolation), `ADR-014` (Audit Strategy), `ADR-032` (RBAC + ABAC), `ADR-081` (Accessibility Standard).

## 12. Dependencies

Inherited verbatim from `MOD017_ANALYTICS_BASELINE_v1` §9:

**Upstream contracts consumed by Analytics:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-002 … MOD-016 and MOD-019** — domain masters (Customer, Supplier, Employee, Item, Asset, Vehicle, etc.) consumed read-only; all module domain events consumed read-only via `ENG-024`.

**Downstream consumers of Analytics:**

- **MOD-018 AI Workspace** — consumes MOD-017 read-only APIs and published events. MOD-018 does not own MOD-017 masters or transactions and does not mutate Analytics state.
- **All other modules** — consume the cross-module KPI catalog read-only.

## 13. Ownership Boundaries

Inherited verbatim from `MOD017_ANALYTICS_BASELINE_v1` §2 and §9:

- MOD-017 owns **only** the authorities enumerated in §4 of this publication.
- Source-domain master ownership remains with originating modules.
- Platform engines remain platform-owned.
- Analytics operates as a **read-model-only** consumer.
- Read-only surface to MOD-018 AI Workspace is preserved unchanged.
- No downstream module owns Analytics master data, redefines Analytics transactions, or redefines cross-module KPI definitions.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../../30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | [`SPR-MOD-017-001`](../../30-sprint-prds/analytics/sprints/SPR-MOD-017-001_ANALYTICS_FOUNDATION_AND_DATA_MARTS.md) · [`002`](../../30-sprint-prds/analytics/sprints/SPR-MOD-017-002_KPI_FRAMEWORK_AND_METRIC_CATALOG.md) · [`003`](../../30-sprint-prds/analytics/sprints/SPR-MOD-017-003_DASHBOARDS_AND_VISUALIZATION.md) · [`004`](../../30-sprint-prds/analytics/sprints/SPR-MOD-017-004_SCHEDULED_DISTRIBUTION_REPORTING_AND_EXPORT.md) · [`005`](../../30-sprint-prds/analytics/sprints/SPR-MOD-017-005_ANALYTICAL_MODELS_AND_CROSS_MODULE_ANALYTICS.md) |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md`](../../40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |
| Preceding Audit | [`REPOSITORY_AUDIT_20260717T210000Z`](../../50-audit-reports/REPOSITORY_AUDIT_20260717T210000Z.md) |

## 15. Non-Goals

Inherited verbatim from `MOD017_ANALYTICS_BASELINE_v1` §11:

- Self-service analytics, natural-language KPI queries, and anomaly detection beyond the current Anomaly Highlights view.
- Ledger effects (owned by MOD-002 Accounting via `ENG-015`/`ENG-016`).
- AI-Copilot authoring surfaces (owned by MOD-018 AI Workspace).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 16. Publication Metadata

- **Publication Template:** `GT-005` v1.0
- **Governance Specification:** v1.0
- **Execution Wrapper:** FROZEN v1.0
- **Execution ID:** `GT005-MOD017-20260717T220000Z-001`
- **Parent Execution ID:** `GT004-MOD017-20260717T210000Z-001`
- **Previous Audit Report:** `REPOSITORY_AUDIT_20260717T210000Z`
- **Emitted Audit Report:** `REPOSITORY_AUDIT_20260717T220000Z`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** COMPLETE
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD017_ANALYTICS_BASELINE_v2`), through a separately approved governance process.

## 17. References

- [`docs/40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md`](../../40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md)
- [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../../30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md)
- [`docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md`](../../15-governance/templates/GT-005_REPOSITORY_AUDIT.md)
- [`docs/MODULE_PUBLICATION_CATALOG.md`](../../MODULE_PUBLICATION_CATALOG.md)
- [`docs/MODULE_BASELINE_CATALOG.md`](../../MODULE_BASELINE_CATALOG.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
