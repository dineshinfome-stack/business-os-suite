---
title: "SPR-MOD-017-001 — Analytics Foundation & Data Marts"
summary: "Sprint PRD for the foundational Analytics layer of MOD-017: Data Mart master data (definition, metadata, source registration, refresh cadence, retention, active/inactive lifecycle) and the Analytics Foundation Configuration authority (analytics configuration, refresh scheduling, environment-level analytics settings, configuration validation). Consumes ERP Core Engines and Accepted ADRs; never redefines them. Analytics remains read-model-only relative to source-module transactional truth."
layer: "delivery"
owner: "Insights"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-017-001"
parent_module: "MOD-017"
parent_sprint_plan: "MOD-017_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "21.0.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-017", "ENG-020", "ENG-024", "ENG-026"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032", "ADR-081"]
tags: ["sprint", "prd", "analytics", "mod-017", "foundation", "data-marts", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD017-001-20260717T151727Z-001"
parent_result_id: "GT002-MOD017-20260717T140000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-017-001 — Analytics Foundation & Data Marts

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-017 Analytics** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Analytics is **read-model-only** relative to source-module transactional truth. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-017-001` (permanent) |
| Parent Module | `MOD-017` — Analytics |
| Parent Sprint Plan | [`MOD-017_SPRINT_PLAN.md`](../MOD-017_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint Dependencies | None (first sprint) |
| Downstream Sprints | `SPR-MOD-017-002` … `SPR-MOD-017-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Analytics Foundation** for BusinessOS: the **Data Mart master** (per-domain curated marts with metadata, source registration, refresh cadence, retention, and the standard active/inactive lifecycle) and the **Analytics Foundation Configuration** authority (analytics configuration, refresh scheduling, environment-level analytics settings, and configuration validation). This foundation is the substrate on which every subsequent Analytics sprint — KPI Framework & Metric Catalog, Dashboards & Visualization, Scheduled Distribution/Reporting & Export, and Analytical Models & Cross-Module Analytics — depends.

> **Analytics Ownership Convention.** MOD-017 Analytics owns the business semantics of the Data Mart master and the Analytics Foundation configuration. ERP Core Engines provide shared infrastructure (identity, authorization, permissions, audit, configuration, localization, numbering, search, eventing, import). MOD-017 **MUST NOT** redefine engine behavior. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Source-module master and transactional data remain exclusive to their owning modules and are consumed **read-only**. Ledger effects (if any) remain exclusive to **MOD-002 Accounting** via `ENG-015` / `ENG-016`. Cross-module KPI definitions are established in a later MOD-017 sprint (`SPR-MOD-017-002`) and are out of scope here.

#### 1.1.1 Data Mart Master Authority

The **Data Mart** master is authoritatively owned by MOD-017 Analytics. This sprint establishes:

- **Data Mart definition** — the business entity representing a per-domain curated mart under a tenant/company.
- **Data Mart metadata** — descriptive attributes (name, domain, description, owner, classification hint) consumed downstream by KPIs, Dashboards, Reports, and Models.
- **Data source registration** — the read-only linkage from a Data Mart to its authoritative source module(s) via approved events and read-only APIs; the source module continues to own the underlying transactional and master data.
- **Refresh cadence configuration** — the per-mart cadence key resolved via `ENG-005` in the tenant → company → context hierarchy.
- **Retention configuration** — the per-mart retention key resolved via `ENG-005` per the Data Constitution.
- **Active/Inactive lifecycle** — the standard `Draft → Active → Inactive → Archived` lifecycle for Data Marts, with only active Data Marts eligible for refresh processing.

No other module MAY create, edit, archive, or independently maintain a parallel Data Mart master. Downstream MOD-017 sprints and downstream modules consume the Data Mart master through Analytics-owned read APIs authored in later sprints; they MUST NOT redefine that entity or its lifecycle.

#### 1.1.2 Analytics Foundation Configuration Authority

**Analytics Foundation configuration** — **analytics configuration**, **refresh scheduling configuration**, **environment-level analytics settings**, and **configuration validation** — is authoritatively owned by MOD-017 Analytics, in this sprint. These keys are registered under a tenant/company through this sprint and resolve deterministically via `ENG-005` in the tenant → company → context hierarchy. Downstream Analytics sprints (KPI Framework; Dashboards; Distribution/Reporting/Export; Models & Cross-Module Analytics) consume this configuration read-only.

Configuration validation is expressed declaratively and evaluated at capture time via the platform's rules surface; no engine behavior is redefined. Every configuration change is audited via `ENG-004` per `ADR-014`.

#### 1.1.3 Analytics ↔ Platform, Source Modules, and Downstream Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Analytics consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **Source modules** (MOD-002 … MOD-016, MOD-019) own their master and transactional data. Analytics consumes source-module data strictly **read-only** via approved read-model mechanisms (published events consumed via `ENG-024`; approved read APIs; optional bulk `ENG-026` import where a Module PRD-allocated capability requires it). No source-module transaction is mutated by Analytics.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. MOD-017 declares no direct posting responsibilities.
- **Cross-module KPI definitions** originate exclusively in MOD-017 Analytics in `SPR-MOD-017-002`, not here.
- **MOD-018 AI Workspace** consumes MOD-017 outputs strictly read-only, through Analytics-owned surfaces authored in `SPR-MOD-017-005`. No MOD-018 surface is redefined by this sprint.

Ownership boundaries SHALL NOT be redefined in downstream MOD-017 Sprint PRDs.

#### 1.1.4 Foundation Master Lifecycle Boundary

MOD-017 Analytics owns the lifecycle of the Data Mart master and the Analytics Foundation configuration lifecycle. Downstream MOD-017 sprints (KPI Framework; Dashboards; Distribution/Reporting/Export; Models & Cross-Module Analytics) consume these entities and states without redefining their lifecycles.

### 1.2 In Scope

- **Data Mart master** — create, edit, activate, deactivate, archive under a tenant/company; per-Data-Mart attributes (name, domain, description, owner, classification hint) resolved via `ENG-006` where locale-sensitive.
- **Data Mart metadata** — attributes attached to the master (freshness declaration is out of scope here — belongs to `SPR-MOD-017-003`; KPI linkage is out of scope here — belongs to `SPR-MOD-017-002`).
- **Data source registration** — declarative read-only linkage from a Data Mart to its source module(s) via `ENG-024` (events consumed) and, where required by a Module PRD capability, `ENG-026` (bulk import). Source module ownership of transactional truth is preserved.
- **Refresh cadence configuration** — per-mart cadence key registered under `ENG-005` in the tenant → company → context hierarchy.
- **Retention configuration** — per-mart retention key registered under `ENG-005` per the Data Constitution.
- **Analytics configuration** — module-level analytics configuration registered under `ENG-005` (tenant → company → context).
- **Refresh scheduling configuration** — declarative scheduling configuration registered under `ENG-005` (the executable scheduling engine, `ENG-014`, and the Report Run / Model Run transactions that consume it are out of scope here and belong to `SPR-MOD-017-004` / `SPR-MOD-017-005`).
- **Environment-level analytics settings** — platform-level analytics defaults exposed for tenant/company overrides via `ENG-005`.
- **Configuration validation** — declarative validation of Data Mart records and Analytics Foundation configuration keys at capture time via the platform rules surface.
- **Numbering series for Analytics documents** — registration of numbering series under `ENG-005` for allocation via `ENG-017` at document issuance in downstream sprints.
- **Module-wide search-index baseline** — registration of the Data Mart master under `ENG-020` for read discoverability.
- **Audit** — every state change on a Data Mart record or an Analytics Foundation configuration key is audited via `ENG-004` per `ADR-014`.

### 1.3 Out of Scope

- KPI master, KPI catalog versioning, KPI Trends reporting, and sensitive-KPI classification — belong to `SPR-MOD-017-002`.
- Dashboard master, Dashboard View transaction, freshness-declaration rule, drill-downs, `DashboardShared` publication — belong to `SPR-MOD-017-003`.
- Distribution List master, Report Run transaction, scheduled distribution execution, distribution channels configuration, bulk exports, `ReportPublished` publication — belong to `SPR-MOD-017-004`.
- Model Run transaction, Anomaly Highlights, cross-module event consumption as mart inputs, compliance/retention audit-readiness reporting, `ModelRunCompleted` publication, read-only surface provided to MOD-018 — belong to `SPR-MOD-017-005`.
- Identity, authentication, permissions — owned by MOD-001 via `ENG-001`, `ENG-002`, `ENG-003`.
- Any redefinition of ERP Core Engine behavior.
- Physical schema, code, routes, migrations, and UI.

---

## 2. Sprint Deliverables

| # | Deliverable | Kind | Notes |
| --- | --- | --- | --- |
| 1 | Data Mart master authority | Master Data | Definition, metadata, active/inactive lifecycle, uniqueness. |
| 2 | Data source registration | Master Data attribute | Read-only linkage to source modules via `ENG-024` / optional `ENG-026`. |
| 3 | Refresh cadence configuration key | Configuration | Registered under `ENG-005`; per-mart. |
| 4 | Retention configuration key | Configuration | Registered under `ENG-005`; per-mart; aligned with Data Constitution. |
| 5 | Analytics module configuration | Configuration | Registered under `ENG-005`; module-level. |
| 6 | Refresh scheduling configuration | Configuration | Declarative scheduling configuration; execution engines out of scope. |
| 7 | Environment-level analytics settings | Configuration | Platform-level defaults with tenant/company overrides via `ENG-005`. |
| 8 | Configuration validation | Rule surface | Declarative validation at capture time. |
| 9 | Numbering series registration | Configuration | Analytics document series registered under `ENG-005` for allocation via `ENG-017` in downstream sprints. |
| 10 | Search-index baseline | Integration | Data Mart master registered under `ENG-020`. |
| 11 | Foundation-layer events published | Events | `DataMartCreated`, `DataMartUpdated`, `DataMartRefreshConfigured`. |
| 12 | Ownership boundaries recapitulation | Documentation | §1.1.3 — no reassignment. |

---

## 3. Traceability to Module PRD

Bidirectional traceability from the [MOD-017 Analytics Module PRD](../../../20-module-prds/analytics/MODULE_PRD.md) and the approved [MOD-017 Sprint Plan](../MOD-017_SPRINT_PLAN.md) to this Sprint PRD.

### 3.1 Forward Map — Module PRD → Sprint 001

| Module PRD Item | Module PRD § | Sprint Plan Allocation | Realized In This Sprint PRD |
| --- | --- | --- | --- |
| Curated data marts (per domain) | §2 Capabilities | SPR-MOD-017-001 (origin) | §1, §2, §4 (Data Mart master) |
| Submodule: Marts | §2 Submodules | SPR-MOD-017-001 (origin) | §1, §2 |
| Data Mart | §5 Master Data | SPR-MOD-017-001 (origin) | §4.1 Data Mart |
| Data retention per mart | §10 Configuration | SPR-MOD-017-001 (origin) | §4.2 Retention configuration |
| Refresh cadence | §10 Configuration | SPR-MOD-017-001 (origin) | §4.2 Refresh cadence configuration |
| Platform latency budget / batch envelope | §11 Non-functional | SPR-MOD-017-001 (origin, foundation scaffolding) | §4.2 Environment-level analytics settings |
| Consumed events (all module domain events, as mart inputs — foundation scaffolding) | §8 Events Consumed | SPR-MOD-017-001 (foundation scaffolding) | §6.2 Consumed events |
| Depends On Modules — read-only consumption | §13 Dependencies | SPR-MOD-017-001 (foundation scaffolding) | §1.1.3 Boundary |

### 3.2 Reverse Map — Sprint 001 → Module PRD / Sprint Plan

| Sprint 001 Item | Traces To Module PRD | Traces To Sprint Plan |
| --- | --- | --- |
| Data Mart Master Authority | §2 Capabilities; §5 Master Data | §2 SPR-MOD-017-001 Objective; §4.3 Master Data Forward Map |
| Data source registration | §8 Events Consumed; §13 Dependencies | §2 SPR-MOD-017-001 Boundaries (ingestion contracts) |
| Refresh cadence configuration | §10 Configuration | §2 SPR-MOD-017-001 Objective / Boundaries |
| Retention configuration | §10 Configuration; §11 Compliance | §2 SPR-MOD-017-001 Objective / Boundaries |
| Analytics module configuration | §10 Configuration | §2 SPR-MOD-017-001 Boundaries |
| Refresh scheduling configuration | §10 Configuration | §2 SPR-MOD-017-001 Boundaries |
| Environment-level analytics settings | §10 Configuration; §11 Non-functional | §2 SPR-MOD-017-001 Objective |
| Configuration validation | §5 Validation Rules; §7 Business Rules | §2 SPR-MOD-017-001 Exit Criteria (structural validation) |
| Numbering series registration | §6 Numbering | §2 SPR-MOD-017-001 Objective / Exit Criteria |
| Search-index baseline | §12 ENG-020 Search | §2 SPR-MOD-017-001 Engines Consumed |
| DataMartCreated / DataMartUpdated / DataMartRefreshConfigured | §8 Events Published (foundation events derived from §2 curated data marts capability and §5 Data Mart master lifecycle) | §2 SPR-MOD-017-001 Exit Criteria (auditability + event surface) |

### 3.3 Bidirectional Completeness

Every deliverable in §2 traces to at least one Module PRD section and to the approved Sprint Plan's SPR-MOD-017-001 allocation. Every Module PRD item allocated to SPR-MOD-017-001 by the approved Sprint Plan is realized by exactly one deliverable in §2. No orphan requirement. No scope expansion. Analytics remains read-model-only against source-module transactional truth.

---

## 4. Data Model Impact

### 4.1 Master Data

**Data Mart (business entity — MOD-017 authority).**

- **Purpose.** Represents a per-domain curated mart under a tenant/company. Consumed downstream by KPIs, Dashboards, Reports, and Models.
- **Attributes (business level).**
  - Identifier (allocated via `ENG-017` in downstream document contexts; the master identifier is business-level here).
  - Name (locale-sensitive via `ENG-006`).
  - Domain (business classification hint — the domain the mart curates, e.g. Sales, Purchase, Inventory).
  - Description (locale-sensitive via `ENG-006`).
  - Owner (business role or team reference — resolved via MOD-001 identities read-only).
  - Data source registration (declarative read-only linkage to one or more source modules).
  - Refresh cadence configuration reference (resolved via `ENG-005`).
  - Retention configuration reference (resolved via `ENG-005`).
  - Lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`. Only **Active** Data Marts participate in refresh processing (see §5 Business Rules).
- **Uniqueness.** Data Mart definitions are unique within a tenant/company on `(domain, name)`; the platform rules surface enforces this at capture time.
- **Validation.** Structural validation (required fields, referential integrity, uniqueness) is declarative and evaluated at capture time via the platform rules surface.
- **Audit.** All state changes audited via `ENG-004` per `ADR-014`.
- **Search.** Registered under `ENG-020` for read discoverability.

### 4.2 Configuration Keys (registered under `ENG-005`)

| Key (business scope) | Scope | Resolves Via | Consumed By |
| --- | --- | --- | --- |
| Refresh cadence per Data Mart | Per Data Mart | `ENG-005` tenant → company → context | Downstream refresh processing (execution engines out of scope here). |
| Retention per Data Mart | Per Data Mart | `ENG-005` tenant → company → context | Downstream retention enforcement per Data Constitution. |
| Analytics module configuration | Module level | `ENG-005` tenant → company → context | All downstream MOD-017 sprints. |
| Refresh scheduling configuration | Module level | `ENG-005` tenant → company → context | `SPR-MOD-017-004` / `SPR-MOD-017-005` execution surfaces. |
| Environment-level analytics settings | Platform defaults with tenant/company overrides | `ENG-005` | All downstream MOD-017 sprints. |
| Numbering series for Analytics documents | Per Analytics document type | `ENG-005` registration; `ENG-017` allocation at issuance | Downstream MOD-017 transactions. |

Configuration validation is declarative and evaluated at capture time.

### 4.3 Transactions

**None in this sprint.** MOD-017 is read-model-only against source-module transactional truth. The MOD-017 transactions declared in the Module PRD §6 (Report Run, Dashboard View, Model Run) are allocated to `SPR-MOD-017-004`, `SPR-MOD-017-003`, and `SPR-MOD-017-005` respectively by the approved Sprint Plan.

---

## 5. Business Rules

Module- and sprint-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

1. **Uniqueness.** Every Data Mart shall have a unique definition within a tenant/company (uniqueness on `(domain, name)`).
2. **Refresh cadence configurability.** Refresh cadence shall be configurable per Data Mart via `ENG-005` in the tenant → company → context hierarchy.
3. **Retention configurability.** Retention policies shall be configurable per Data Mart via `ENG-005`, subject to the Data Constitution.
4. **Refresh eligibility.** Only Data Marts in state **Active** shall participate in refresh processing. Data Marts in `Draft`, `Inactive`, or `Archived` states shall not be scheduled for refresh.
5. **Auditability.** Every configuration change to a Data Mart or to an Analytics Foundation configuration key shall be auditable via `ENG-004` per `ADR-014`.
6. **Read-model-only.** Analytics remains read-model-only. No Data Mart operation shall mutate source-module master or transactional data.
7. **Source data immutability.** Source transactional data owned by other modules is never modified by MOD-017 — neither directly, nor via event handlers, nor via configuration.
8. **Configuration validation at capture time.** Analytics Foundation configuration keys and Data Mart records shall be validated declaratively at capture time via the platform rules surface.
9. **Lifecycle enforcement.** Data Mart lifecycle transitions (`Draft → Active → Inactive → Archived`) shall be enforced declaratively; transitions that would violate this ordering shall be rejected at capture time.

---

## 6. Events

### 6.1 Events Published (Sprint 001 foundation events)

| Event | Emitted On | Purpose |
| --- | --- | --- |
| `DataMartCreated` | Data Mart record enters `Active` for the first time (or `Draft → Active` transition, per lifecycle) | Signals to downstream MOD-017 sprints and search/index consumers that a new Data Mart is available. |
| `DataMartUpdated` | Data Mart metadata, source registration, or lifecycle state changes (excluding refresh-configuration changes) | Signals to downstream consumers that a Data Mart's definition changed. |
| `DataMartRefreshConfigured` | Refresh cadence configuration for a Data Mart is registered or changed | Signals to downstream scheduling and refresh consumers (execution engines out of scope for this sprint). |

Events are emitted via `ENG-024` and traced to their originating audit record in `ENG-004`.

### 6.2 Events Consumed

Only upstream platform events explicitly allocated by the Module PRD's §13 read-only consumption boundary and by §8 "All module domain events (as inputs to marts)". In Sprint 001, the ingestion surface is scaffolding only — the actual consumption of source-module domain events as mart inputs is exercised at scale in `SPR-MOD-017-005`; here we register the read-only linkage from a Data Mart to its source module(s) without invoking source-module business logic.

No new event contract is defined outside the Sprint Plan and Module PRD allocation.

---

## 7. Integrations

MOD-017 Analytics **consumes** the following platform services in this sprint. None are redefined; ownership remains with the engine owner.

| Engine | Role in Sprint 001 |
| --- | --- |
| `ENG-001` Identity | Resolve caller identity for Data Mart authoring and configuration edits (read-only). |
| `ENG-002` Authorization | Authorize Data Mart authoring and configuration edits per `ADR-032`. |
| `ENG-003` Permission Management | Resolve role and permission grants for Analytics authoring. |
| `ENG-004` Audit | Persist audit records for every state change per `ADR-014`. |
| `ENG-005` Configuration | Register and resolve refresh cadence, retention, module configuration, refresh scheduling, environment-level settings, and numbering series. |
| `ENG-006` Localization | Resolve locale-sensitive Data Mart attributes (name, description). |
| `ENG-017` Numbering | Allocate numbering for Analytics documents (issued in downstream sprints; series registered here). |
| `ENG-020` Search | Register the Data Mart master for read discoverability. |
| `ENG-024` Event | Publish `DataMartCreated`, `DataMartUpdated`, `DataMartRefreshConfigured`; scaffold read-only consumption of upstream module events. |
| `ENG-026` Import (optional) | Bulk import of Data Mart definitions where a Module PRD-allocated capability requires it. |

No engine ownership is established by this sprint.

---

## 8. Dependencies

### 8.1 Upstream Dependencies

- **Governance Framework v1.0** — Released.
- **GT-003 v1.0** — Active.
- **FROZEN Execution Wrapper v1.0** — FROZEN.
- **Module PRD** — [`docs/20-module-prds/analytics/MODULE_PRD.md`](../../../20-module-prds/analytics/MODULE_PRD.md) — Approved.
- **Sprint Plan** — [`docs/30-sprint-prds/analytics/MOD-017_SPRINT_PLAN.md`](../MOD-017_SPRINT_PLAN.md) — Approved.
- **Prior repository audit** — `REPOSITORY_AUDIT_20260717T140000Z` — Repository READY.

### 8.2 Engine and ADR Dependencies

- **Engines required (Sprint 001):** `ENG-001`, `ENG-002`, `ENG-003`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-017`, `ENG-020`, `ENG-024`.
- **Engines optional (Sprint 001):** `ENG-026`.
- **ADRs consumed:** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC, `ADR-081` Accessibility Standard.

### 8.3 Sprint Dependencies

- **Upstream sprint dependencies.** None (first MOD-017 sprint).
- **Downstream sprints.** `SPR-MOD-017-002` … `SPR-MOD-017-005` depend on this sprint per the approved Sprint Plan §3 dependency graph.

---

## 9. Acceptance Criteria

Each acceptance criterion binds to one or more functional requirements from §2 / §4 or one business rule from §5. Numbering is stable within this document.

1. **AC-001 — Data Mart creation.** A caller with appropriate `ENG-002` / `ENG-003` grants can create a Data Mart record under a tenant/company; the record persists with all required attributes; `DataMartCreated` is emitted via `ENG-024`; an `ENG-004` audit record is written. (Deliverable 1; Rule 1, 5.)
2. **AC-002 — Data Mart uniqueness.** Attempting to create a Data Mart whose `(domain, name)` collides with an existing record under the same tenant/company is rejected at capture time by the platform rules surface. (Deliverable 1; Rule 1.)
3. **AC-003 — Data Mart edit and metadata update.** A caller with appropriate grants can edit a Data Mart's metadata (name, description, domain, owner, source registration); `DataMartUpdated` is emitted via `ENG-024`; an `ENG-004` audit record is written. (Deliverable 1, 2; Rule 5.)
4. **AC-004 — Data Mart lifecycle.** A Data Mart record follows the `Draft → Active → Inactive → Archived` lifecycle; transitions that would violate this ordering are rejected at capture time; every transition is audited. (Deliverable 1; Rule 9, 5.)
5. **AC-005 — Refresh eligibility.** Only Data Marts in state **Active** are eligible for refresh processing; Data Marts in `Draft`, `Inactive`, or `Archived` states cannot be scheduled for refresh. (Deliverable 1; Rule 4.)
6. **AC-006 — Refresh cadence configuration.** Refresh cadence per Data Mart is registered under `ENG-005` and resolves deterministically in the tenant → company → context hierarchy; `DataMartRefreshConfigured` is emitted via `ENG-024`; every change is audited. (Deliverable 3; Rule 2, 5.)
7. **AC-007 — Retention configuration.** Retention per Data Mart is registered under `ENG-005` and resolves deterministically in the tenant → company → context hierarchy; every change is audited. (Deliverable 4; Rule 3, 5.)
8. **AC-008 — Analytics module configuration.** Analytics module configuration is registered under `ENG-005` and resolves deterministically. (Deliverable 5; Rule 5.)
9. **AC-009 — Refresh scheduling configuration.** Refresh scheduling configuration is registered under `ENG-005` and resolves deterministically. Execution engines (`ENG-014`) and Report/Model Run transactions are explicitly out of scope for this sprint. (Deliverable 6; Rule 5.)
10. **AC-010 — Environment-level analytics settings.** Platform-level analytics defaults are exposed for tenant/company overrides via `ENG-005`. (Deliverable 7; Rule 5.)
11. **AC-011 — Configuration validation.** Analytics Foundation configuration keys and Data Mart records are validated declaratively at capture time; invalid inputs are rejected before persistence. (Deliverable 8; Rule 8, 9.)
12. **AC-012 — Numbering series registration.** Numbering series for Analytics document types are registered under `ENG-005` for allocation via `ENG-017` at document issuance in downstream sprints. (Deliverable 9.)
13. **AC-013 — Search-index baseline.** The Data Mart master is registered under `ENG-020` and is discoverable via read-only search. (Deliverable 10.)
14. **AC-014 — Read-model-only.** No Sprint 001 operation writes to a source module's master or transactional data. Automated evidence: no Sprint 001 authority extends outside MOD-017-owned entities and configuration keys. (Deliverable 12; Rule 6, 7.)
15. **AC-015 — Source data immutability.** Source-module transactional data referenced through data source registration is treated read-only; the registration record captures the linkage without invoking source-module business logic. (Deliverable 2; Rule 7.)
16. **AC-016 — Audit trail.** Every state-changing operation in §2 (Data Mart create/edit/lifecycle; every configuration key change) emits an `ENG-004` audit record per `ADR-014`. (Deliverables 1–8; Rule 5.)
17. **AC-017 — Ownership boundaries preserved.** No MOD-001 / MOD-002 / source-module authority is redefined; MOD-017 does not claim ownership of any platform engine. (Deliverable 12.)

---

## 10. Ownership Boundaries

Recapitulated from §1.1.3 (not evolved):

- **MOD-017 Analytics** owns Data Mart definitions and Analytics Foundation configuration authority (this sprint).
- **Source modules** continue to own all transactional and master data; MOD-017 consumes strictly read-only through approved read-model mechanisms.
- **Platform modules and engines** retain ownership of Identity (`ENG-001` / MOD-001), Authorization (`ENG-002` / MOD-001), Permission (`ENG-003` / MOD-001), Configuration (`ENG-005`), Audit (`ENG-004`), Search (`ENG-020`), Event infrastructure (`ENG-024`), Numbering (`ENG-017`), Localization (`ENG-006`), and optional Import (`ENG-026`).
- **Cross-module KPI definitions** are owned by MOD-017 Analytics but originate in `SPR-MOD-017-002`, not here.
- **MOD-018 AI Workspace** consumes MOD-017 outputs read-only through surfaces authored in `SPR-MOD-017-005`.

**No ownership reassignment. No transactional authority introduced.**

---

## 11. Non-Goals

- No KPI master, KPI catalog, KPI Trends, or sensitive-KPI classification (allocated to `SPR-MOD-017-002`).
- No Dashboard master, Dashboard View transaction, freshness-declaration rule, drill-downs, or `DashboardShared` publication (allocated to `SPR-MOD-017-003`).
- No Distribution List master, Report Run transaction, scheduled distribution execution, bulk exports, or `ReportPublished` publication (allocated to `SPR-MOD-017-004`).
- No Model Run transaction, Anomaly Highlights, cross-module analytical models, compliance/retention reporting surface, `ModelRunCompleted` publication, or read-only surface provided to MOD-018 (allocated to `SPR-MOD-017-005`).
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
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md) — Module lifecycle workflow.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring rules.
- [`docs/SPRINT_ESTIMATION_GUIDE.md`](../../../SPRINT_ESTIMATION_GUIDE.md) — Sprint sizing.
- [`docs/SPRINT_DEPENDENCY_MATRIX.md`](../../../SPRINT_DEPENDENCY_MATRIX.md) — Sprint dependency rules.
- [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) — Sprint catalog projection.
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md) — ERP Core Engines (authoritative).
- [`docs/11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md) — Accepted ADRs.
- [`docs/50-audit-reports/REPOSITORY_AUDIT_20260717T140000Z.md`](../../../50-audit-reports/REPOSITORY_AUDIT_20260717T140000Z.md) — Preceding audit (Repository READY).
