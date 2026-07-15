---
title: "SPR-MOD-010-001 — Projects Foundation (Project & Resource Setup)"
summary: "Sprint PRD for the foundational Projects layer of MOD-010 Projects: Project, Resource, and Rate Card master data, plus Projects operations configuration (rate cards, approval hierarchy, billing type per project, numbering series). Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Delivery"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-010-001"
parent_module: "MOD-010"
parent_sprint_plan: "MOD-010_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "12.0.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-012", "ENG-017", "ENG-024"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "projects", "mod-010", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD010-001-20260715T001600Z-001"
parent_result_id: "GT002-MOD010-20260715T001500Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-010-001 — Projects Foundation (Project & Resource Setup)

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-010 Projects** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-010-001` (permanent) |
| Parent Module | `MOD-010` — Projects |
| Parent Sprint Plan | [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-010-002` … `SPR-MOD-010-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Projects Foundation** for BusinessOS: the Project, Resource, and Rate Card master data, plus the Projects operations configuration (rate cards, approval hierarchy, billing type per project, numbering series) resolved through `ENG-005`. This foundation is the substrate on which every subsequent Projects sprint — Tasks/Milestones/Change Requests, Timesheets & Effort, Budgets/Costs/Billing, and Projects Analytics & Compliance — depends.

> **Projects Ownership Convention.** The Projects module owns the business semantics of the Project, Resource, and Rate Card masters, and the Projects operations configuration. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, document, attachment, rules, numbering, eventing) but **MUST NOT** redefine Projects business rules. Financial posting of project-invoice and cost-accrual effects remains exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Employee master and HR-originating obligations remain exclusive to **MOD-007 HRMS**; Projects consumes employee identity read-only for resourcing.

#### 1.1.1 Project, Resource, and Rate Card Master Authority

The **Project**, **Resource**, and **Rate Card** masters are authoritatively owned by MOD-010 Projects. No other module MAY create, edit, archive, or independently maintain a parallel Project, Resource, or Rate Card master. Downstream sprints and modules consume these masters through Projects-owned events and read APIs authored in later sprints; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 Projects ↔ HRMS Boundary (Resource vs. Employee)

- **MOD-007 HRMS** owns the Employee master and the HR-originating lifecycle (hire, exit, employment status).
- **MOD-010 Projects** owns the Resource master, which references an HRMS-owned Employee read-only when a Resource is bound to an internal employee; the Employee master itself is **not** redefined in this sprint. Resource semantics (project allocation, availability, project-scoped role) belong to Projects.
- Cross-module event flow (`EmployeeHired`, `PayrollProcessed`, `SalesOrderConfirmed` — consumed by later Projects sprints; `ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued` — published by later Projects sprints) is scoped to later Projects sprints and is **not** exercised for new contracts in Sprint 1.

#### 1.1.3 Projects ↔ Accounting and Platform Boundary

- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Projects sprint writes journal entries; downstream sprints emit events that Accounting consumes, but never redefine posting logic.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Projects consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.

Ownership boundaries SHALL NOT be redefined in downstream Projects Sprint PRDs.

#### 1.1.4 Projects Configuration Authority

Projects operations configuration — rate cards, approval hierarchy, billing type per project, and numbering series — is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline; numbering-series resolution executes through `ENG-017` at transaction time in later sprints. No module-specific configuration keys are registered outside Projects's own ownership boundary. Configuration **consumption** by downstream Projects sprints (Tasks/Milestones/CRs, Timesheets, Budgets/Billing, Analytics) uses these registrations without redefining them.

#### 1.1.5 Foundation Master Lifecycle Boundary

Projects owns the lifecycle of every foundation master (Project, Resource, Rate Card). Downstream sprints (Tasks/Milestones/CRs, Timesheets, Budgets/Billing, Analytics) consume these entities without redefining their lifecycles.

### 1.2 In Scope

- Project master: create, edit, activate, deactivate, archive under a tenant/company; per-project attributes include billing type (T&M or fixed-price) and numbering-series selection.
- Resource master: create, edit, activate, deactivate, archive under a tenant/company; optional read-only reference to an MOD-007-owned Employee.
- Rate Card master: create, edit, activate, deactivate, archive under a tenant/company; used by Projects and Resources for downstream billing computation.
- Projects operations configuration namespace initialized per company via `ENG-005`: rate cards, approval hierarchy, billing type per project, numbering series.
- Read-only consumption of Platform Identity (`ENG-001`) for the actor identity used in foundation lifecycle actions.
- Read-only consumption of MOD-007-owned Employee master for Resource ↔ Employee binding; Employee master itself is not redefined here.
- Audit emission via `ENG-004` for every foundation lifecycle transition.
- Attachment support for Projects and Rate Cards via `ENG-008` (statements of work, rate schedules) where applicable.
- Document classification for foundation entities via `ENG-007` where applicable.
- Locale-scoped labels on foundation entities via `ENG-006` where applicable.
- Structural validation (required fields, referential integrity, uniqueness, same-company invariants) via `ENG-012` at capture time.
- `ENG-024` engine consumption is reserved for downstream sprints; Sprint 1 publishes no new domain events (per Sprint Plan §2).

### 1.3 Out of Scope

- Task and Milestone masters, Milestone Completion transaction lifecycle, Change Request handling — `SPR-MOD-010-002`.
- Timesheet transaction lifecycle, effort capture, capacity-justification rule, approval workflow — `SPR-MOD-010-003`.
- Project Budgets, project-cost roll-up, T&M and fixed-price billing, Project Invoice transaction lifecycle — `SPR-MOD-010-004`.
- Projects read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-010-005`.
- Employee master and HR-originating lifecycle — owned by MOD-007 HRMS.
- Financial postings for project-invoice and cost-accrual events — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-010-001`, the following will exist:

- **Business capabilities.**
  - A Project Manager can create, edit, activate, deactivate, and archive Project records under a tenant/company, including per-project billing type and numbering-series selection.
  - A Project Manager (or Team Lead) can create, edit, activate, deactivate, and archive Resource records under a tenant/company and optionally bind a Resource to an MOD-007-owned Employee read-only.
  - A Project Manager can create, edit, activate, deactivate, and archive Rate Card records under a tenant/company.
  - Projects operations configuration (rate cards, approval hierarchy, billing type per project, numbering series) is registered and resolves deterministically per company through `ENG-005`.
  - Identity linkage for actor actions is consumed read-only from `ENG-001` — no credentials are minted.
  - Employee references for Resource binding are consumed read-only from MOD-007 — no Employee master is re-authored.
- **Configuration artifacts.** Projects configuration namespace initialized for each company via `ENG-005`. No module-specific keys are registered outside Projects's own ownership boundary.
- **Audit artifacts.** An audit record exists for every Projects-foundation lifecycle transition, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-010-001`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

Sprint 1 publishes **no new domain events** (per Sprint Plan §2 — Sprint 1 declares engine consumption of `ENG-024` for downstream readiness but reserves Projects-lifecycle events `ProjectCreated` / `MilestoneCompleted` / `TimesheetApproved` / `ProjectInvoiceIssued` to later Projects sprints). This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-010 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Projects primitives and personas | Project / Resource / Rate Card masters and Projects Ownership Convention |
| §2 Business Scope — Project setup and structure; Resource planning; submodules Projects, Resources | Project, Resource, and Rate Card masters |
| §3 Personas — Project Manager, Consultant, Team Lead, Finance, HR, Client | User stories (§4) |
| §5 Master Data — Project, Resource, Rate Card | All three masters delivered in this sprint |
| §7 Business Rules — foundation invariants (tenancy, referential integrity, same-company composition) | Enforceable classification, tenancy, and lifecycle invariants |
| §10 Configuration — Rate cards, Approval hierarchy, Billing types per project, Numbering series | Projects configuration namespace via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Projects Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as their originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Project setup and structure (§2) | `SPR-MOD-010-001` |
| Resource planning (§2) | `SPR-MOD-010-001` |

These allocations are unique; no other Projects sprint claims "Project setup and structure" or "Resource planning" as originating capabilities. Master-data entities Project, Resource, and Rate Card are each originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Project setup and structure* and *Resource planning*, and submodules *Projects* and *Resources* → this Sprint PRD → deliverables in §2 (Project, Resource, Rate Card masters, Projects configuration namespace, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Project Manager, I want to create, edit, activate, deactivate, and archive Projects under a company, including per-project billing type and numbering-series selection, so that a coherent project catalog exists before any task, timesheet, or invoice.*
- **US-002.** *As a Project Manager or Team Lead, I want to create, edit, activate, deactivate, and archive Resources under a company, so that resource planning is grounded in an authoritative resource catalog.*
- **US-003.** *As a Project Manager, I want to bind a Resource read-only to an MOD-007-owned Employee, so that internal resources resolve to authoritative Employees without redefining the Employee master.*
- **US-004.** *As a Project Manager, I want to create, edit, activate, deactivate, and archive Rate Cards under a company, so that later T&M and fixed-price billing sprints resolve rates deterministically.*
- **US-005.** *As a Project Manager, I want to register Projects operations configuration (rate cards, approval hierarchy, billing type per project, numbering series) per company, so that later Projects sprints resolve their configuration deterministically.*
- **US-006.** *As a Project Manager, I want the actor identity used for foundation lifecycle actions to be consumed read-only from `ENG-001`, so that identity, authentication, and permissions remain owned by MOD-001 while Projects captures the master relationships.*
- **US-007.** *As a security reviewer, I want every Projects-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct Project, Resource, and Rate Card history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Project master (US-001)

- **Given** a valid Project creation request under a tenant/company,
  **when** a Project Manager submits it,
  **then** the Project is persisted with a stable identifier and its identifier is unique within the company.
- **Given** a Project record whose billing type is set to T&M or fixed-price and whose numbering series is selected from an active series registered for the company,
  **when** the request is submitted,
  **then** the Project is persisted deterministically and audited.
- **Given** a Project with dependent Projects references (created in later sprints),
  **when** archival is attempted,
  **then** archival is either permitted with a clean lifecycle transition or rejected deterministically per the Project lifecycle rules established here.

### 5.2 Resource master (US-002, US-003)

- **Given** a valid Resource creation request under a tenant/company,
  **when** a Project Manager or Team Lead submits it,
  **then** the Resource is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** a Resource bound to an active MOD-007-owned Employee in the same company,
  **when** the binding is submitted,
  **then** the binding is persisted deterministically and audited; the Employee master is not redefined.
- **Given** an attempt to bind a Resource to an archived Employee, an Employee in a different company, or a non-existent Employee,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.3 Rate Card master (US-004)

- **Given** a valid Rate Card creation request under a tenant/company,
  **when** a Project Manager submits it,
  **then** the Rate Card is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an attempt to activate a Rate Card whose scope references a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.4 Projects operations configuration (US-005)

- **Given** a company under an active tenant,
  **when** rate cards, approval hierarchy, billing type per project, and numbering series are registered,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a downstream sprint querying a configuration key registered by this sprint,
  **when** it queries the key by identifier,
  **then** it receives the deterministic value resolved for its (tenant, company) scope; **evaluation semantics** (rate-card selection at billing time, approval-hierarchy evaluation at run time, billing-type evaluation at invoice time, numbering-series allocation at transaction time via `ENG-017`) remain out of scope here and are delivered by later Projects sprints.

### 5.5 Identity consumption (US-006)

- **Given** any Projects-foundation lifecycle action,
  **when** it executes,
  **then** the actor identity is resolved read-only via `ENG-001`; no credentials are minted by Projects.

### 5.6 Audit integration (US-007)

- **Given** any Projects-foundation lifecycle transition (Project / Resource / Rate Card / configuration / Resource ↔ Employee binding create, update, activate, deactivate, archive),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.7 Isolation invariants (`ADR-011`)

- **Given** any Projects-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.8 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Project, Resource, or Rate Card data,
  **when** it reads or reacts to these masters,
  **then** it does so exclusively through Projects-owned events (published by later Projects sprints) and read APIs. No downstream module creates an independent Project, Resource, or Rate Card master.
- **Given** any Projects code path that requires Employee data,
  **when** it needs the MOD-007 Employee,
  **then** it consumes it read-only from MOD-007; the Employee entity is not redefined here.
- **Given** any Projects code path that requires Identity data,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-010` — Projects.
- **Module PRD:** [`docs/20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Project setup and structure; Resource planning; submodules Projects, Resources), §3 (Project Manager, Consultant, Team Lead, Finance, HR, Client), §5 (Project, Resource, Rate Card), §7 (foundation invariants), §10 (Rate cards, Approval hierarchy, Billing types per project, Numbering series), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-010` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (frozen) — Employee master consumed read-only for Resource ↔ Employee binding.
- **Upstream sprint dependencies (per Sprint Plan §2):** None (Projects sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` and the frozen `MOD007_HRMS_BASELINE_v1`.
- **Cross-module consumption (events only):** None in this sprint. Consumption of HRMS-published events (`EmployeeHired`), Payroll-published events (`PayrollProcessed`), and Sales-published events (`SalesOrderConfirmed`) is scoped to `SPR-MOD-010-003` and `SPR-MOD-010-004`.
- **Downstream sprints:** `SPR-MOD-010-002` (Tasks, Milestones & Change Requests), `SPR-MOD-010-003` (Timesheets & Effort), `SPR-MOD-010-004` (Budgets, Costs & Project Billing), `SPR-MOD-010-005` (Projects Analytics & Compliance) — per [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Projects Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the Project-Manager / Team-Lead identity used for foundation lifecycle actions and read-only binding to Platform users. |
| `ENG-002` Authorization | Enforces authorization on Projects-foundation actions. |
| `ENG-003` Permission Management | Registers Projects-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every Projects-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves Projects operations configuration (rate cards, approval hierarchy, billing type per project, numbering series) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for Project, Resource, and Rate Card content where applicable. |
| `ENG-007` Document | Provides document classification for Project and Rate Card artifacts where applicable. |
| `ENG-008` Attachment | Provides attachment binding for Project statements of work and Rate Card schedules where applicable. |
| `ENG-012` Rules | Evaluates structural validations (required fields, referential integrity, uniqueness, same-company composition) at capture time. |
| `ENG-017` Numbering | Registered as the numbering-series producer for later Projects transactions; **allocation** semantics execute at transaction time in downstream sprints. |
| `ENG-024` Eventing | Reserved for downstream Projects sprints (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`). Sprint 1 publishes no new domain events; the engine is available but not exercised for new event contracts here. |

Projects business semantics (Project, Resource, Rate Card, Projects configuration namespace, Resource ↔ Employee read-only binding) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Projects-foundation read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Projects-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Project | MOD-010 (this sprint) | Named project scoped to a tenant/company, carrying billing type and numbering-series selection. |
| Resource | MOD-010 (this sprint) | Named resource scoped to a tenant/company, optionally bound read-only to an MOD-007-owned Employee. |
| Rate Card | MOD-010 (this sprint) | Named rate schedule scoped to a tenant/company, referenced by downstream billing sprints. |
| Resource ↔ Employee Binding | MOD-010 (this sprint) | Read-only reference from a Resource to an MOD-007-owned Employee within the same company. |
| Projects Configuration | MOD-010 (this sprint, configuration-scoped) | Projects operations configuration namespace per company resolved via `ENG-005` (rate cards, approval hierarchy, billing type per project, numbering series). |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Projects**, zero or more **Resources**, zero or more **Rate Cards**, and one **Projects configuration** namespace.
- A **Resource** MAY reference at most one MOD-007-owned **Employee** within the same company; the Employee entity is not represented as a Projects-owned entity here.
- A **Project** carries exactly one billing-type value (T&M or fixed-price) and exactly one selected numbering series active within the same company.
- A **Rate Card** is scoped to exactly one company.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-010` per the Projects Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Employee** entity is owned by MOD-007 HRMS and is consumed read-only; it is not a Projects-owned entity.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Projects-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Projects-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

Sprint 1 publishes **no new domain events**. Per Sprint Plan §2 (`SPR-MOD-010-001`), no event contract is originated by this sprint. Projects-lifecycle events (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`) are originated by later Projects sprints per Module PRD §8.

### 11.2 Consumed

Sprint 1 consumes **no cross-module domain events**. It consumes Platform Identity (`ENG-001`) read-only and MOD-007-owned Employee master read-only (for Resource ↔ Employee binding), which is engine-level and API-level consumption rather than a domain event subscription. Consumption of upstream domain events (`EmployeeHired`, `PayrollProcessed`, `SalesOrderConfirmed`) is scoped to `SPR-MOD-010-003` and `SPR-MOD-010-004`.

Payload contracts for downstream Projects events are declared in the event catalog when those sprints author them; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Projects-foundation read and write.
- [ ] Every Projects-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] Projects configuration namespace is initialized per company via `ENG-005` (rate cards, approval hierarchy, billing type per project, numbering series).
- [ ] Actor identity for foundation lifecycle actions is exercised end-to-end read-only against `ENG-001`; no credentials are minted by Projects.
- [ ] Resource ↔ Employee read-only reference is exercised end-to-end against the MOD-007 Employee read API; no Employee master is re-authored.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-010_SPRINT_PLAN.md` §2 (`SPR-MOD-010-001`):

- Project, Resource, and Rate Card records can be created, edited, and archived under a tenant/company.
- Project configuration (rate cards, approval hierarchy, billing type, numbering series) resolves deterministically through `ENG-005`.
- Document numbers issue through `ENG-017`.
- All structural changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-010 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-010 depends on `MOD007_HRMS_BASELINE_v1` being frozen and stable for read-only Employee consumption in Resource ↔ Employee binding.
  - **Impact:** Any drift in the HRMS Employee read API would break Resource binding.
  - **Mitigation:** Consume the HRMS Employee read API per its authoritative contract; escalate any change as an HRMS defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Later Projects sprints (`SPR-MOD-010-002` … `SPR-MOD-010-005`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Projects-owned entities (Project, Resource, Rate Card, Resource ↔ Employee binding, Projects configuration) MUST NOT be redefined by downstream modules; HRMS Employee master (MOD-007) and financial postings (MOD-002) MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Project / Resource / Rate Card Master Authority convention (§1.1.1) and the Projects ↔ HRMS / Accounting / Platform boundary (§1.1.2, §1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-06
  - **Description:** Projects operations configuration registration is in scope here; **evaluation** semantics (rate-card selection at billing time, approval-hierarchy evaluation at run time, billing-type evaluation at invoice time, numbering-series allocation at transaction time via `ENG-017`) are in scope of downstream Projects sprints.
  - **Impact:** Loose registration semantics would leak evaluation responsibilities into this sprint.
  - **Mitigation:** Register configuration deterministically via `ENG-005`; do not expose evaluation paths in this sprint.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 1 publishes no new domain events. Downstream Projects sprints declare events (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`) and consume cross-module events (`EmployeeHired`, `PayrollProcessed`, `SalesOrderConfirmed`). Any event name not yet present in the authoritative event catalog at their authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint that publishes/consumes them, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Handle in each downstream sprint's own §14; not a Sprint 1 obligation. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Project, Resource, and Rate Card validation; Resource ↔ Employee binding invariants; Projects configuration resolution rules; billing-type and numbering-series selection invariants.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, actor identity resolution via `ENG-001`, HRMS Employee read via MOD-007 read API, structural validation via `ENG-012`, attachment binding via `ENG-008`.
- **Contract** — HRMS Employee read API contract used by Resource binding.
- **End-to-end (smoke)** — Project creation with billing-type and numbering-series selection, Resource creation with an Employee binding, Rate Card creation, and configuration resolution under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an HRMS-Employee read-only fixture, and a Platform-Identity read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Project, Resource, and Rate Card lifecycles as small state machines so audit emission (§5.6) is trivially satisfiable at every transition.
- Consider validating tenancy and same-company invariants (Resource ↔ Employee binding, Rate Card scope, Project numbering-series selection) at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating Projects configuration initialization with company activation events emitted by MOD-001 so the Projects configuration namespace is ready before the first Project record.
- Consider registering rate cards, approval hierarchy, billing type per project, and numbering series upfront in this sprint (even though only downstream sprints consume them) so configuration readiness is deterministic.
- Consider a small Resource-Employee reconciliation surface keyed by (tenant, company, employee_id) so downstream HRMS Employee lifecycle changes propagate observably into Resource state without silent drift.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-010-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Projects Foundation — Project, Resource, and Rate Card masters, Projects operations configuration, identity consumption, Employee consumption, and audit (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-010 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Projects Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates tasks/milestones/CRs, timesheets, budgets/billing, analytics, MOD-007-owned entities, financial postings, identity/permissions, and cross-module KPI definitions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-010-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-010-002` Tasks, Milestones & Change Requests is the immediate successor per [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-010-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- Precedent Foundation Sprint PRDs — [`../manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md`](../manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md), [`../payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md`](../payroll/SPR-MOD-008-001-payroll-foundation-and-salary-structures.md), [`../hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md`](../hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
