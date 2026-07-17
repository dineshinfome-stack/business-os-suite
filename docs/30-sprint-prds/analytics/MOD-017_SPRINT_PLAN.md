---
title: "MOD-017 Analytics — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-017 Analytics. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Insights"
status: "Approved"
updated: "2026-07-17"
module_id: "MOD-017"
module_name: "Analytics"
sprint_prefix: "SPR-MOD-017-"
stage: "1"
pass: "21.0"
parent_module_prd: "docs/20-module-prds/analytics/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
governance_specification: "v1.0"
template_standard: "v1.3"
authored_by_template: "GT-002"
authored_by_template_version: "v1.0"
execution_id: "GT002-MOD017-20260717T140000Z-001"
tags: ["sprint", "planning", "analytics", "mod-017", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-017 Analytics — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-017 Analytics** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## Normative Source Precedence

On any conflict, the following order wins:

1. `docs/20-module-prds/analytics/MODULE_PRD.md` (Module PRD)
2. This Capability Allocation Matrix (§4)
3. The sprint sections in §2 of this Sprint Plan
4. Any derived artifact

## 1. Purpose & Scope

Plan the implementation of MOD-017 Analytics by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD.

This plan introduces no new business requirements beyond the approved [MOD-017 Analytics Module PRD](../../20-module-prds/analytics/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Governance Boundaries (recapitulated).** Per the Module PRD §13:

- **Identity, authentication, and permissions** are owned by **MOD-001 Platform Administration** via `ENG-001`, `ENG-002`, `ENG-003`.
- **Domain master data** (Customer, Supplier, Employee, Item, Asset, etc.) is consumed **read-only** from its owning module — MOD-017 never redefines source masters.
- **Domain transactional truth** remains owned by the emitting module; MOD-017 is **read-model-only** relative to source-module transactions.
- **Ledger effects (if any)** remain owned by **MOD-002 Accounting** via `ENG-015`/`ENG-016`; MOD-017 declares no direct posting responsibilities.
- **Cross-module KPI definitions** originate in **MOD-017 Analytics** (this module) — downstream modules consume KPI definitions from here read-only.
- **AI Workspace surfacing** is provided to **MOD-018 AI Workspace** through published events and read-only APIs (§13 Provides To).

**Traceability:**

- Parent Module README — [`../../20-module-prds/analytics/README.md`](../../20-module-prds/analytics/README.md)
- Parent Module PRD — [`../../20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md)
- Upstream module baselines — Analytics consumes read-only from every published module baseline (per Module PRD §13). No individual upstream baseline is a hard blocker for authoring; consumption is via events and read-only APIs.
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-017 in `SPRINT_ROADMAP.md` is **5**; this plan preserves that estimate.

## 2. Proposed Sprint Sequence

### SPR-MOD-017-001 — Analytics Foundation & Data Marts

- **Objective.** Establish Analytics foundations under a tenant/company: Data Mart master data (per-domain curated marts); retention-per-mart, refresh-cadence, and platform-latency/batch envelope configuration; ingestion contracts for cross-module event and API consumption; numbering series for Analytics documents.
- **Boundaries.**
  - In: Data Mart master; per-mart data retention configuration; refresh-cadence configuration; ingestion contracts for cross-module read-only consumption; numbering series for Analytics transactions; module-wide search-index baseline.
  - Out: KPI catalog and definitions (SPR-MOD-017-002); Dashboard master and dashboard authoring (SPR-MOD-017-003); Distribution List master, Report Run transaction, exports (SPR-MOD-017-004); Model Run transaction and cross-module analytical surfaces (SPR-MOD-017-005); identity/permissions (owned by MOD-001).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Curated data marts — submodule Marts), §3 Personas, §5 Master Data (Data Mart), §10 Configuration (Data retention per mart, Refresh cadence), §11 Non-functional Considerations (platform latency budget, batch envelope), §13 Dependencies (read-only consumption from MOD-001..MOD-016, MOD-019).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-017` Numbering, `ENG-020` Search, `ENG-024` Event, `ENG-026` Import (optional; per Module PRD §12).
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC, `ADR-081` Accessibility Standard.
- **Upstream sprint dependencies.** None (MOD-017 sprint 1).
- **Sprint Exit Criteria.**
  - Data Mart records can be created, edited, and archived under a tenant/company with the standard `Draft → Active → Inactive → Archived` lifecycle.
  - Retention-per-mart and refresh-cadence are resolvable via `ENG-005` in the tenant → company → context hierarchy.
  - Structural validation and hierarchy enforcement run deterministically via the platform's declarative rules surface at capture time.
  - Document numbers for Analytics transactions issue through `ENG-017`.
  - Read-only ingestion from source modules is wired via `ENG-024` (events) and, where required, `ENG-026` (import); no source-module transaction is mutated.
  - All state changes are audited via `ENG-004` per `ADR-014`.

### SPR-MOD-017-002 — KPI Framework & Metric Catalog

- **Objective.** Deliver the KPI-definition-to-publish process: KPI master with a single, versioned catalog; sensitive-KPI classification and row-level access rule; KPI Trends reporting surface; publication of KPI catalog versions to downstream consumers.
- **Boundaries.**
  - In: KPI master (single versioned catalog); KPI lifecycle `Draft → Active → Inactive → Archived`; sensitive-KPI classification and row-level access enforcement; KPI Trends operational report; KPI-catalog read-only surface consumed by all other MOD-017 sprints and by downstream modules.
  - Out: Data Mart master and ingestion (SPR-MOD-017-001); Dashboard master and Dashboard View transaction (SPR-MOD-017-003); scheduled distribution, Report Run, exports (SPR-MOD-017-004); Model Run and cross-module analytical models (SPR-MOD-017-005).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (KPI catalog and definitions; submodule KPIs), §4 Business Processes (KPI definition-to-publish), §5 Master Data (KPI), §7 Business Rules (single versioned catalog; sensitive KPIs respect data classification and row-level access), §9 Reports & Analytics (KPI Trends; KPIs — cross-module KPIs defined once here).
- **Engines consumed.** `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-010` Workflow, `ENG-011` Approval, `ENG-017` Numbering, `ENG-020` Search, `ENG-024` Event.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-017-001`.
- **Sprint Exit Criteria.**
  - KPI records are authored, reviewed, and published under a versioned catalog; only one active version of a KPI is exposed at a time.
  - Sensitive-KPI classification is enforced via `ENG-002` and `ENG-003` per `ADR-032`; row-level access is respected on every read.
  - KPI Trends reports render under `ENG-021` scaffolding consumed later by SPR-MOD-017-004 (report authoring occurs here; scheduled distribution occurs in sprint 004).
  - KPI catalog changes emit change signals via `ENG-024` for downstream consumers.
  - All state changes are audited via `ENG-004`.

### SPR-MOD-017-003 — Dashboards & Visualization

- **Objective.** Deliver the Dashboard-authoring process: Dashboard master; Dashboard View transaction; the freshness-declaration rule; drill-downs and Executive/Domain-specific dashboards; publication of `DashboardShared`.
- **Boundaries.**
  - In: Dashboard master; Dashboard View transaction lifecycle; freshness-declaration rule; drill-down navigation; Executive Overview and Domain-specific dashboard scaffolding; `DashboardShared` publication.
  - Out: Data Mart master (SPR-MOD-017-001); KPI master and catalog (SPR-MOD-017-002); scheduled distribution, Report Run, Distribution List, exports (SPR-MOD-017-004); Model Run and Anomaly Highlights (SPR-MOD-017-005).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Dashboards and drill-downs; submodule Dashboards), §4 Business Processes (Dashboard authoring), §5 Master Data (Dashboard), §6 Transactions (Dashboard View), §7 Business Rules (Dashboards must declare their data-freshness expectation), §8 Integration Points (`DashboardShared` — published), §9 Reports & Analytics (Executive Overview; Domain-specific dashboards).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-010` Workflow, `ENG-012` Rules, `ENG-017` Numbering, `ENG-020` Search, `ENG-022` Dashboard, `ENG-024` Event.
- **ADRs consumed.** `ADR-011`, `ADR-032`, `ADR-081`.
- **Upstream sprint dependencies.** `SPR-MOD-017-001`, `SPR-MOD-017-002`.
- **Sprint Exit Criteria.**
  - Dashboards can be authored, published, and shared; each dashboard declares a data-freshness expectation resolved deterministically via `ENG-012`.
  - Dashboard View transactions run via `ENG-010` and render via `ENG-022`; drill-downs preserve tenant/permission scope via `ENG-002`.
  - `DashboardShared` events publish via `ENG-024`.
  - Document numbers for Dashboard View transactions issue through `ENG-017`; state changes are audited via `ENG-004`.

### SPR-MOD-017-004 — Scheduled Distribution, Reporting & Export

- **Objective.** Deliver the Scheduled-distribution process: Distribution List master; Report Run transaction; scheduled report distribution across configured channels; bulk exports in standard formats; publication of `ReportPublished`.
- **Boundaries.**
  - In: Distribution List master; Report Run transaction lifecycle; scheduled report distribution; distribution-channels configuration; bulk exports; `ReportPublished` publication.
  - Out: Data Mart master (SPR-MOD-017-001); KPI master (SPR-MOD-017-002); Dashboard master and Dashboard View (SPR-MOD-017-003); Model Run and cross-module analytical models (SPR-MOD-017-005); cross-module KPI definitions (owned within MOD-017 by sprint 002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Scheduled report distribution; Data exports; submodule Distribution), §4 Business Processes (Scheduled distribution), §5 Master Data (Distribution List), §6 Transactions (Report Run), §8 Integration Points (`ReportPublished` — published; External Systems — External BI via export), §9 Reports & Analytics (Exports via ENG-027), §10 Configuration (Distribution channels).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-010` Workflow, `ENG-011` Approval, `ENG-014` Scheduler (optional), `ENG-017` Numbering, `ENG-021` Reporting, `ENG-023` Integration (optional), `ENG-024` Event, `ENG-025` Notification (optional), `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-017-001`, `SPR-MOD-017-002`, `SPR-MOD-017-003`.
- **Sprint Exit Criteria.**
  - Distribution Lists can be authored, updated, and archived per tenant/company.
  - Report Run transactions execute via `ENG-010`; scheduled execution runs via `ENG-014`; approvals, where configured, run via `ENG-011`.
  - Report content renders via `ENG-021`; bulk exports produce standard formats via `ENG-027`.
  - `ReportPublished` events publish via `ENG-024`; notifications, where configured, dispatch via `ENG-025`.
  - Document numbers for Report Run transactions issue through `ENG-017`; state changes are audited via `ENG-004`.

### SPR-MOD-017-005 — Analytical Models, Cross-Module Analytics & Compliance

- **Objective.** Deliver the Model-refresh process and the cross-module analytical surface: Model Run transaction; Anomaly Highlights reporting; consumption of all module domain events as inputs to marts; audit-readiness and compliance/retention surface; publication of `ModelRunCompleted`; read-only APIs provided to MOD-018.
- **Boundaries.**
  - In: Model Run transaction lifecycle; Anomaly Highlights reports; cross-module event consumption (all module domain events) as mart inputs; compliance/retention audit-readiness; AI Copilot-assisted forecasting (optional); read-only surface provided to MOD-018 AI Workspace; `ModelRunCompleted` publication.
  - Out: masters and transactions for Data Marts / KPIs / Dashboards / Distribution Lists / Report Run (SPR-MOD-017-001..004); cross-module KPI definitions (owned by SPR-MOD-017-002); domain-specific master data (owned by source modules).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Analytical models and forecasts; submodule Models), §4 Business Processes (Model refresh), §6 Transactions (Model Run), §8 Integration Points (`ModelRunCompleted` — published; all module domain events — consumed), §9 Reports & Analytics (Anomaly Highlights), §11 Non-functional Considerations (Compliance — data-classification and retention rules), §13 Dependencies (Provides To MOD-018 AI Workspace), §14 Future Enhancements (scope-managed, not allocated as capability here).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-010` Workflow, `ENG-014` Scheduler (optional), `ENG-017` Numbering, `ENG-021` Reporting, `ENG-023` Integration (optional), `ENG-024` Event, `ENG-028` AI Copilot (optional).
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-017-001`, `SPR-MOD-017-002`, `SPR-MOD-017-003`, `SPR-MOD-017-004`.
- **Sprint Exit Criteria.**
  - Model Run transactions execute via `ENG-010`; scheduled model refresh runs via `ENG-014`.
  - Anomaly Highlights render via `ENG-021`; AI-assisted forecasting, where configured, runs via `ENG-028` without redefining engine behavior.
  - `ModelRunCompleted` events publish via `ENG-024`; all module domain events (per source-module baselines) are consumable as mart inputs — MOD-017 remains read-model-only against source-module transactional truth.
  - Compliance/retention rules are resolvable via `ENG-005` per mart and per report; every state-changing transaction traces to an `ENG-004` audit event per `ADR-014`.
  - Read-only APIs are exposed for MOD-018 AI Workspace consumption; no MOD-018 surface is redefined here.

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-017-001 (Analytics Foundation & Data Marts)
         │
         ▼
SPR-MOD-017-002 (KPI Framework & Metric Catalog)
         │
         ▼
SPR-MOD-017-003 (Dashboards & Visualization)
         │
         ▼
SPR-MOD-017-004 (Scheduled Distribution, Reporting & Export)
         │
         ▼
SPR-MOD-017-005 (Analytical Models, Cross-Module Analytics & Compliance)
```

Each sprint depends on all preceding sprints in the sequence: Data Marts anchor ingestion, the KPI catalog is required before dashboards and reports reference it, dashboards precede scheduled distribution surfaces that share them, and analytical models consume outputs of all four predecessors.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-017 Analytics Module PRD](../../20-module-prds/analytics/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint.

### 4.1 Capability Allocation Matrix (Forward Map)

| # | Module PRD Capability (§2) | Origin Sprint | PRD Section | Exact Quote | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | KPI catalog and definitions | SPR-MOD-017-002 | §2 | "KPI catalog and definitions" | PASS |
| 2 | Curated data marts (per domain) | SPR-MOD-017-001 | §2 | "Curated data marts (per domain)" | PASS |
| 3 | Dashboards and drill-downs | SPR-MOD-017-003 | §2 | "Dashboards and drill-downs" | PASS |
| 4 | Scheduled report distribution | SPR-MOD-017-004 | §2 | "Scheduled report distribution" | PASS |
| 5 | Data exports | SPR-MOD-017-004 | §2 | "Data exports" | PASS |
| 6 | Analytical models and forecasts | SPR-MOD-017-005 | §2 | "Analytical models and forecasts" | PASS |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Marts | SPR-MOD-017-001 |
| KPIs | SPR-MOD-017-002 |
| Dashboards | SPR-MOD-017-003 |
| Distribution | SPR-MOD-017-004 |
| Models | SPR-MOD-017-005 |

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Data Mart | Master Data (§5) | SPR-MOD-017-001 |
| KPI | Master Data (§5) | SPR-MOD-017-002 |
| Dashboard | Master Data (§5) | SPR-MOD-017-003 |
| Distribution List | Master Data (§5) | SPR-MOD-017-004 |
| Dashboard View | Transaction (§6) | SPR-MOD-017-003 |
| Report Run | Transaction (§6) | SPR-MOD-017-004 |
| Model Run | Transaction (§6) | SPR-MOD-017-005 |

### 4.4 Forward Map — Events → Originating Sprint

| Event | Direction | Originating Sprint |
| --- | --- | --- |
| DashboardShared | Published (§8) | SPR-MOD-017-003 |
| ReportPublished | Published (§8) | SPR-MOD-017-004 |
| ModelRunCompleted | Published (§8) | SPR-MOD-017-005 |
| All module domain events | Consumed (§8) | SPR-MOD-017-005 (with per-mart ingestion scaffolding in SPR-MOD-017-001) |

### 4.5 Forward Map — Business Rules (§7) → Originating Sprint

| Business Rule | Originating Sprint |
| --- | --- |
| KPI definitions must be published from a single, versioned KPI catalog | SPR-MOD-017-002 |
| Sensitive KPIs respect data classification and row-level access | SPR-MOD-017-002 |
| Dashboards must declare their data-freshness expectation | SPR-MOD-017-003 |

### 4.6 Forward Map — Business Processes (§4) → Originating Sprint

| Business Process | Originating Sprint |
| --- | --- |
| KPI definition-to-publish | SPR-MOD-017-002 |
| Dashboard authoring | SPR-MOD-017-003 |
| Scheduled distribution | SPR-MOD-017-004 |
| Model refresh | SPR-MOD-017-005 |

### 4.7 Forward Map — Configuration Keys (§10) → Originating Sprint

| Configuration Key | Originating Sprint |
| --- | --- |
| Data retention per mart | SPR-MOD-017-001 |
| Refresh cadence | SPR-MOD-017-001 |
| Distribution channels | SPR-MOD-017-004 |

### 4.8 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-017-001 | §1, §2 (Curated data marts; submodule Marts), §3, §5 (Data Mart), §10 (Data retention per mart, Refresh cadence), §11 (platform latency budget, batch envelope), §13 (read-only consumption from all upstream modules) |
| SPR-MOD-017-002 | §2 (KPI catalog and definitions; submodule KPIs), §4 (KPI definition-to-publish), §5 (KPI), §7 (single versioned catalog; sensitive-KPI classification), §9 (KPI Trends; KPIs) |
| SPR-MOD-017-003 | §2 (Dashboards and drill-downs; submodule Dashboards), §4 (Dashboard authoring), §5 (Dashboard), §6 (Dashboard View), §7 (freshness declaration), §8 (`DashboardShared` — published), §9 (Executive Overview; Domain-specific dashboards) |
| SPR-MOD-017-004 | §2 (Scheduled report distribution; Data exports; submodule Distribution), §4 (Scheduled distribution), §5 (Distribution List), §6 (Report Run), §8 (`ReportPublished` — published; External BI via export), §9 (Exports), §10 (Distribution channels) |
| SPR-MOD-017-005 | §2 (Analytical models and forecasts; submodule Models), §4 (Model refresh), §6 (Model Run), §8 (`ModelRunCompleted` — published; all module domain events — consumed), §9 (Anomaly Highlights), §11 (Compliance — data classification and retention), §13 (Provides To MOD-018 AI Workspace) |

No Module PRD capability, submodule, master-data entity, transaction, event, business rule, business process, or configuration key sits outside the five sprints above. No capability appears as the originating allocation in more than one sprint. Every capability appears in exactly one originating sprint and in at least one sprint.

## 5. Engine Consumption Map

Derived from Analytics Module PRD §12. No engine behavior is redefined. Engine identifiers resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md`.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-010 | ENG-011 | ENG-012 | ENG-014 | ENG-017 | ENG-020 | ENG-021 | ENG-022 | ENG-023 | ENG-024 | ENG-025 | ENG-026 | ENG-027 | ENG-028 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-017-001 | ● | ● | ● | ● | ● | ● |   |   |   |   | ● | ● |   |   |   | ● |   | ● |   |   |
| SPR-MOD-017-002 |   | ● | ● | ● | ● | ● | ● | ● |   |   | ● | ● |   |   |   | ● |   |   |   |   |
| SPR-MOD-017-003 |   | ● |   | ● | ● | ● | ● |   | ● |   | ● | ● |   | ● |   | ● |   |   |   |   |
| SPR-MOD-017-004 |   | ● |   | ● | ● |   | ● | ● |   | ● | ● |   | ● |   | ● | ● | ● |   | ● |   |
| SPR-MOD-017-005 |   | ● |   | ● | ● |   | ● |   |   | ● | ● |   | ● |   | ● | ● |   |   |   | ● |

Required engines per Module PRD §12 (`ENG-001`, `ENG-002`, `ENG-003`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-020`, `ENG-021`, `ENG-022`, `ENG-024`, `ENG-027`) are each scheduled to at least one sprint. Optional engines (`ENG-014`, `ENG-023`, `ENG-025`, `ENG-026`, `ENG-028`) are scheduled only where their consumption is required to fulfil a capability in §2.

## 6. ADR Consumption Map

Accepted ADRs consumed by MOD-017 planning: `ADR-011` (Multi-Tenant Isolation), `ADR-014` (Audit Strategy), `ADR-032` (RBAC + ABAC), `ADR-081` (Accessibility Standard).

| Sprint | ADR-011 | ADR-014 | ADR-032 | ADR-081 |
| --- | :-: | :-: | :-: | :-: |
| SPR-MOD-017-001 | ● | ● | ● | ● |
| SPR-MOD-017-002 | ● | ● | ● |   |
| SPR-MOD-017-003 | ● | ● | ● | ● |
| SPR-MOD-017-004 | ● | ● | ● |   |
| SPR-MOD-017-005 | ● | ● | ● |   |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Platform Dependency.** MOD-017 consumes Tenant, Company, Branch, and User master read-only from MOD-001 Platform Administration.
>
> **Cross-Module Consumption.** MOD-017 consumes domain masters and domain events read-only from every published module baseline (per Module PRD §13). Analytics never mutates a source-module transaction.
>
> **Analytics Boundary (this module).** Cross-module KPI definitions are owned by MOD-017 (SPR-MOD-017-002) and consumed downstream. Operational reports internal to each source module remain owned by that source module.
>
> **AI Workspace Handoff.** MOD-017 provides read-only APIs and published events to MOD-018 AI Workspace; MOD-018 does not mutate MOD-017 masters or transactions.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Data Mart Master | SPR-MOD-017-001 | 002, 003, 004, 005 | Foundational; every later sprint reads from marts. |
| Retention / Refresh-cadence configuration | SPR-MOD-017-001 | 002, 003, 004, 005 | Resolved via `ENG-005`. |
| KPI Catalog (versioned) | SPR-MOD-017-002 | 003, 004, 005 | Dashboards, reports, and models reference published KPI versions. |
| Dashboard Master / Dashboard View | SPR-MOD-017-003 | 004 (shareable via distribution), 005 (embedded surfaces) | Dashboards feed scheduled shares. |
| Distribution List / Report Run | SPR-MOD-017-004 | 005 | Model refresh outputs may re-use distribution channels. |
| Model Run / Anomaly Highlights | SPR-MOD-017-005 | Downstream (MOD-018) | Feeds AI Workspace read-only. |
| Tenant / Company / Branch / User Master | External (MOD-001) | 001–005 | Consumed via read-only APIs; never redefined. |
| Domain masters (Customer, Supplier, Employee, Item, Asset, etc.) | External (source modules) | 001–005 | Consumed via read-only APIs from owning modules. |
| All module domain events | External (source modules) | SPR-MOD-017-001 (ingestion), SPR-MOD-017-005 (analytical consumption) | Read-only consumption; MOD-017 remains a read model. |
| `DashboardShared` event | SPR-MOD-017-003 | MOD-018 | Feeds AI Workspace and audit trails. |
| `ReportPublished` event | SPR-MOD-017-004 | MOD-018 | Feeds AI Workspace and downstream distribution. |
| `ModelRunCompleted` event | SPR-MOD-017-005 | MOD-018 | Feeds AI Workspace analytical surfaces. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-017 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Any regression against that baseline blocks Stage 2 authoring.
- **R2 — Read-only cross-module consumption.** MOD-017 never mutates a source-module transaction. Any observed mutation is a defect against this plan.
- **R3 — KPI-catalog single-authority.** Cross-module KPI definitions are owned exclusively in SPR-MOD-017-002. Any downstream KPI redefinition is out of scope.
- **R4 — Sensitive-KPI classification.** Sensitive-KPI access enforcement depends on `ENG-002`/`ENG-003` per `ADR-032`; no alternative path is permitted.
- **R5 — Optional-engine scope creep.** Optional engines (`ENG-014`, `ENG-023`, `ENG-025`, `ENG-026`, `ENG-028`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R6 — Roadmap alignment.** `SPRINT_ROADMAP.md` estimates 5 sprints for MOD-017; this plan preserves that estimate. No PRD capability is added, orphaned, or duplicated.
- **R7 — Future-enhancement scope.** §14 items (self-service analytics, NL KPI queries, anomaly detection) are deferred and NOT allocated to any sprint in this plan. Anomaly-highlight reporting in SPR-MOD-017-005 uses the current model surface, not future NL/self-service surfaces.
- **R8 — AI Workspace boundary.** MOD-018 consumes MOD-017 read-only. Any MOD-018 requirement that would mutate MOD-017 masters is out of scope and MUST be raised via a Module PRD amendment.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-017 is baseline-ready when all of the following are objectively true:

1. Every reserved Analytics Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD017_ANALYTICS_BASELINE_v1` is authored under `docs/40-module-baselines/`.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no Analytics capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md` beyond additive registration.
- No cross-module ownership reassignment; no redefinition of source-module masters or transactions.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`../../15-governance/templates/GT-002_STAGE1_AUTHORING.md`](../../15-governance/templates/GT-002_STAGE1_AUTHORING.md)
