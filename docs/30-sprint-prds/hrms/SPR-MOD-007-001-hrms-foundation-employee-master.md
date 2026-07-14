---
title: "SPR-MOD-007-001 — HRMS Foundation & Employee Master"
summary: "Sprint PRD for the foundational HRMS layer of MOD-007 HRMS: employee master, org structure masters (Position, Department, Grade, Shift), organization assignment, and HR operations configuration (approval hierarchies, shift patterns, notice periods). Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-14"
sprint_id: "SPR-MOD-007-001"
parent_module: "MOD-007"
parent_sprint_plan: "MOD-007_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "9.3.0"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-012", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "hrms", "mod-007", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD007-001-20260714T000400Z-001"
parent_result_id: "GT002-MOD007-20260713-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per plan Step 1A>"
---

# SPR-MOD-007-001 — HRMS Foundation & Employee Master

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-007 HRMS** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-007-001` (permanent) |
| Parent Module | `MOD-007` — HRMS |
| Parent Sprint Plan | [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-007-002` … `SPR-MOD-007-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **HRMS Foundation** for BusinessOS: the employee master and its lifecycle, the organization-structure masters (Position, Department, Grade, Shift), organization assignment (employee ↔ position/department/grade/shift + reporting structure), and HR operations configuration (approval hierarchies, shift patterns, notice periods) resolved through `ENG-005`. This foundation is the substrate on which every subsequent HRMS sprint — Employment Lifecycle, Attendance & Leave, Performance, L&D and Self-Service, and HR Analytics — depends.

> **HRMS Ownership Convention.** The HRMS module owns the business semantics of the Employee master, the org-structure masters (Position, Department, Grade, Shift), organization assignment, employment status transitions, the reporting structure, and HR operations configuration. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, rules, document, attachment, eventing) but **MUST NOT** redefine HRMS business rules. Payroll processing (earnings, deductions, pay runs, statutory filings, payslip issuance) remains exclusive to **MOD-008 Payroll**; financial postings for HR-originating obligations remain exclusive to **MOD-002 Accounting**; identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**.

#### 1.1.1 Employee and Org-Structure Master Authority

The **Employee**, **Position**, **Department**, **Grade**, and **Shift** masters are authoritatively owned by MOD-007 HRMS. No other module MAY create, edit, archive, or independently maintain a parallel Employee or org-structure master. Downstream modules consume these masters via published events and read APIs; they MUST NOT redefine those entities, their lifecycles, or their classifications.

#### 1.1.2 HRMS ↔ Platform Boundary (Identity vs. Employee)

- **MOD-001 Platform** owns Identity (user records, authentication credentials, sessions), Authorization, Permission Management, and the tenant / company / branch hierarchy.
- **MOD-007 HRMS** owns the **Employee** entity (the person-of-record in an employment relationship) and its link to a Platform-owned Identity. HRMS does not mint credentials.
- An Employee MAY reference a Platform Identity once one is provisioned; the Identity entity itself is **not** redefined in this sprint.

#### 1.1.3 HRMS ↔ Payroll and Accounting Boundary

- **MOD-008 Payroll** owns payroll processing. HRMS supplies employee master, org assignments, and lifecycle events; HRMS does not compute earnings, deductions, or issue payslips.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No HRMS sprint writes journal entries.

Ownership boundaries SHALL NOT be redefined in downstream HRMS Sprint PRDs.

#### 1.1.4 HRMS Configuration Authority

HRMS operations configuration — approval hierarchies, shift patterns, and notice periods — is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline. No module-specific configuration keys are registered outside HRMS's own ownership boundary. Configuration **consumption** by downstream HRMS sprints (Employment Lifecycle, Attendance & Leave, Performance) uses these registrations without redefining them.

#### 1.1.5 Employee and Org-Structure Lifecycle Boundary

HRMS owns the employee lifecycle (create, activate, deactivate, archive) and the lifecycle of every org-structure master (Position, Department, Grade, Shift). Downstream sprints (Employment Lifecycle, Attendance & Leave, Performance, L&D & Self-Service, HR Analytics) consume these entities without redefining their lifecycles.

### 1.2 In Scope

- Employee master: creation, editing, archival; employee identifiers; employment profile (personal data, employment classification, contact points).
- Position master, Department master, Grade master, Shift master: creation, editing, archival.
- Department hierarchy: parent/child department relationships within a company (acyclic).
- Reporting structure: employee ↔ manager relationship (acyclic).
- Organization assignment: assign an employee to a Position, Department, Grade, and Shift under a tenant/company.
- Employment status lifecycle transitions: `Draft → Active → Inactive → Archived` for the employee record; Draft→Active→Archived for org-structure masters.
- HR operations configuration resolved via `ENG-005`:
  - Approval hierarchies (referenced by `SPR-MOD-007-002` Employment Lifecycle, `SPR-MOD-007-003` Attendance & Leave, `SPR-MOD-007-004` Performance).
  - Shift patterns (referenced by `SPR-MOD-007-003` Attendance & Leave).
  - Notice periods (referenced by `SPR-MOD-007-002` Employment Lifecycle).
- Employee and org-structure validation invariants (uniqueness, referential integrity, tenancy).
- Employee-attached documents and attachments surface via `ENG-007` and `ENG-008` (business categories only; document types with additional semantics are declared by later HRMS sprints).
- Audit integration for every HRMS-foundation lifecycle transition via `ENG-004`.
- Identity linkage: consume Platform Identity (`ENG-001`) read-only to bind an Employee to a Platform user; no credentials are minted.

### 1.3 Out of Scope

Reserved for later HRMS sprints (see [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md)):

- Onboarding Task and Exit Clearance transactions, hire/exit approvals, background verification — `SPR-MOD-007-002`.
- Attendance transaction, Leave Type master, Leave Request transaction, leave balances, biometric ingestion — `SPR-MOD-007-003`.
- Appraisal transaction lifecycle, appraiser routing, ratings capture — `SPR-MOD-007-004`.
- Learning & development integration, employee self-service surfaces — `SPR-MOD-007-005`.
- HR read model, HR reports, dashboards, exports, audit-readiness surface, AI copilot integration — `SPR-MOD-007-006`.
- Payroll processing — owned by MOD-008.
- Financial postings for HR-originating obligations — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-007-001`, the following will exist:

- **Business capabilities.**
  - An HR administrator can create, edit, and archive employees under a tenant/company.
  - An HR administrator can create, edit, and archive Position, Department, Grade, and Shift records under a tenant/company.
  - An HR administrator can assign an employee to a Position, Department, Grade, and Shift, and can establish reporting relationships.
  - HR operations configuration (approval hierarchies, shift patterns, notice periods) is registered and resolves deterministically per company through `ENG-005`.
  - Identity linkage to Employee records is consumed read-only from `ENG-001` — no credentials are minted.
- **Configuration artifacts.** HRMS configuration namespace initialized for each company via `ENG-005`. No module-specific keys are registered outside HRMS's own ownership boundary.
- **Audit artifacts.** An audit record exists for every HRMS-foundation lifecycle transition, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-007-001`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

Sprint 1 publishes **no new domain events** (per Sprint Plan §2 — Sprint 1 declares engine consumption of `ENG-024` for downstream readiness but reserves employment-lifecycle events `EmployeeHired` / `EmployeeExited` to `SPR-MOD-007-002`). This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-007 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — HRMS primitives and personas | Employee/Org-structure masters and HRMS Ownership Convention |
| §2 Business Scope — Employee master and org structure; submodule Employee Master | Employee master, org-structure masters, org assignment |
| §3 Personas — HR Business Partner, HR Manager, Employee, Manager | User stories (§4) |
| §5 Master Data — Employee, Position, Department, Grade, Shift | All five masters delivered in this sprint |
| §7 Business Rules — HRMS foundation invariants | Enforceable classification, tenancy, and lifecycle invariants |
| §10 Configuration — Shift patterns, Approval hierarchies, Notice periods | HRMS configuration namespace via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved HRMS Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Employee master and org structure (§2) | `SPR-MOD-007-001` |

This allocation is unique; no other HRMS sprint claims "Employee master and org structure" as an originating capability. Master-data entities Employee, Position, Department, Grade, and Shift are each originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Employee master and org structure* and submodule *Employee Master* → this Sprint PRD → deliverables in §2 (Employee master, org-structure masters, org assignment, HRMS configuration namespace, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an HR administrator, I want to create, edit, and archive employees under a company, so that a coherent employee master exists before any onboarding, attendance, or performance activity begins.*
- **US-002.** *As an HR administrator, I want to create, edit, and archive Position, Department, Grade, and Shift records under a company, so that an org-structure foundation exists.*
- **US-003.** *As an HR administrator, I want to organize departments into a parent/child hierarchy and to establish employee ↔ manager reporting relationships, so that downstream HRMS sprints inherit a deterministic reporting structure.*
- **US-004.** *As an HR administrator, I want to assign an employee to a Position, Department, Grade, and Shift, so that later HR business processes (attendance, leave, performance, payroll consumers) can resolve the employee's org context deterministically.*
- **US-005.** *As an HR administrator, I want to register HR operations configuration (approval hierarchies, shift patterns, notice periods) per company, so that later HRMS sprints resolve their configuration deterministically.*
- **US-006.** *As an HR administrator, I want to link an Employee record to a Platform-owned Identity read-only, so that identity, authentication, and permissions remain owned by MOD-001 while the Employee record captures the employment relationship.*
- **US-007.** *As a security reviewer, I want every HRMS-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct employee and org-structure history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Employee master (US-001)

- **Given** a valid employee creation request under a tenant/company,
  **when** an HR admin submits it,
  **then** the employee is persisted with a stable identifier and its identifiers are unique within the company.
- **Given** a valid employee update that maintains referential integrity,
  **when** an HR admin submits it,
  **then** the update is persisted and audited.
- **Given** an employee with dependent HRMS references (created in later sprints),
  **when** archival is attempted,
  **then** archival is either permitted with a clean lifecycle transition or rejected deterministically per the employee lifecycle rules established here.

### 5.2 Org-structure masters (US-002, US-003)

- **Given** valid Position, Department, Grade, or Shift creation requests under a tenant/company,
  **when** an HR admin submits them,
  **then** each is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** a valid parent/child department relationship within the same company,
  **when** an HR admin submits it,
  **then** the hierarchy is persisted deterministically without creating cycles.
- **Given** a valid employee ↔ manager reporting relationship within the same company,
  **when** an HR admin submits it,
  **then** the reporting link is persisted deterministically without creating cycles.

### 5.3 Organization assignment (US-004)

- **Given** an active employee and active Position, Department, Grade, and Shift records under the same company,
  **when** an HR admin assigns the employee to those org-structure entries,
  **then** the assignment is persisted, uniquely resolvable per employee, and audited.
- **Given** an attempt to assign an employee to an archived Position, Department, Grade, or Shift, or to an entity in a different company,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.4 HR operations configuration (US-005)

- **Given** a company under an active tenant,
  **when** approval hierarchies, shift patterns, and notice periods are registered,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a downstream sprint querying a configuration key registered by this sprint,
  **when** it queries the key by identifier,
  **then** it receives the deterministic value resolved for its (tenant, company) scope; **evaluation semantics** (approval routing execution, shift roster computation, notice-period enforcement in exit transactions) remain out of scope here and are delivered by later HRMS sprints.

### 5.5 Identity linkage (US-006)

- **Given** a valid Platform Identity provisioned by MOD-001,
  **when** an HR admin links an Employee record to that Identity,
  **then** the link is persisted read-only against `ENG-001` and audited; no credentials are minted by HRMS.

### 5.6 Audit integration (US-007)

- **Given** any HRMS-foundation lifecycle transition (employee / position / department / grade / shift / configuration / assignment create, update, activate, deactivate, archive),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.7 Isolation invariants (`ADR-011`)

- **Given** any HRMS-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.8 Ownership consumption invariants

- **Given** any downstream module requiring employee or org-structure data,
  **when** it reads or reacts to employee/org-structure lifecycle,
  **then** it does so exclusively through HRMS-owned events (published by later HRMS sprints) and read APIs. No downstream module creates an independent Employee, Position, Department, Grade, or Shift master.
- **Given** any HRMS code path that requires Identity data,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-007` — HRMS.
- **Module PRD:** [`docs/20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Employee master and org structure; submodule Employee Master), §3 (HR Business Partner, HR Manager, Employee, Manager), §5 (Employee, Position, Department, Grade, Shift), §7 (foundation invariants), §10 (Approval hierarchies, Shift patterns, Notice periods), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-007` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
- **Upstream sprint dependencies (per Sprint Plan §2):** None (HRMS sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1`.
- **Cross-module consumption (events only):** None in this sprint. Consumption of `PayrollProcessed` (published by MOD-008 Payroll) is scoped to `SPR-MOD-007-006` HR Analytics & Compliance.
- **Downstream sprints:** `SPR-MOD-007-002` (Employment Lifecycle), `SPR-MOD-007-003` (Attendance & Leave), `SPR-MOD-007-004` (Performance & Appraisal), `SPR-MOD-007-005` (L&D and Self-Service), `SPR-MOD-007-006` (HR Analytics & Compliance) — per [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at v1.1 (Active).

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the HRMS Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the HR-administrator identity used for foundation lifecycle actions and read-only binding of Employee records to Platform users. |
| `ENG-002` Authorization | Enforces authorization on HRMS-foundation actions. |
| `ENG-003` Permission Management | Registers HRMS-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every HRMS-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves HR operations configuration (approval hierarchies, shift patterns, notice periods) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for employee, position, department, grade, and shift content where applicable. |
| `ENG-007` Document | Backs employee documents surface where applicable. |
| `ENG-008` Attachment | Backs employee attachments surface where applicable. |
| `ENG-012` Rules | Registers structural validation rules for employee, org-structure masters, hierarchy, reporting, org assignment, and configuration; **evaluation** semantics for approval routing, shift rostering, and leave/attendance policies are consumed by later HRMS sprints. |
| `ENG-024` Eventing | Reserved for downstream HRMS sprints (`EmployeeHired`/`EmployeeExited` in Sprint 2, `AttendanceMarked`/`LeaveApproved` in Sprint 3, `AppraisalCompleted` in Sprint 4). Sprint 1 publishes no new domain events; the engine is available but not exercised for new event contracts here. |

HRMS business semantics (employee master, org-structure masters, department hierarchy, reporting structure, org assignment, HRMS configuration namespace) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every HRMS-foundation read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to HRMS-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Employee | MOD-007 (this sprint) | Person-of-record in an employment relationship, scoped to a tenant/company. |
| Position | MOD-007 (this sprint) | Named role within the org structure. |
| Department | MOD-007 (this sprint) | Organizational unit; supports parent/child hierarchy within a company. |
| Grade | MOD-007 (this sprint) | Compensation/seniority band assigned to positions and employees. |
| Shift | MOD-007 (this sprint) | Named working-time pattern (structural definition only; roster execution is downstream). |
| Organization Assignment | MOD-007 (this sprint) | Association between an employee and their Position, Department, Grade, and Shift. |
| Reporting Relationship | MOD-007 (this sprint) | Employee ↔ manager link, acyclic within a company. |
| HRMS Configuration | MOD-007 (this sprint, configuration-scoped) | HR operations configuration namespace per company resolved via `ENG-005` (approval hierarchies, shift patterns, notice periods). |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **employees**, zero or more **Position/Department/Grade/Shift** records, and one **HRMS configuration** namespace.
- A **department** MAY have a parent department within the same company (acyclic hierarchy).
- An **employee** MAY reference a manager Employee within the same company (acyclic reporting).
- An **employee** MAY have zero or one active **Organization Assignment** referencing Position, Department, Grade, and Shift within the same company.
- An **employee** MAY reference a Platform-owned Identity once one is provisioned; the Identity entity is not represented as an HRMS-owned entity here.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-007` per the HRMS Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not an HRMS-owned entity.
- Payroll-owned entities (pay runs, payslips, statutory computations) are owned by MOD-008; they are not represented as HRMS-owned entities.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as HRMS-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

Sprint 1 publishes **no new domain events**. Per Sprint Plan §2 (`SPR-MOD-007-001`), no event contract is originated by this sprint. Employment-lifecycle events (`EmployeeHired`, `EmployeeExited`) are originated by `SPR-MOD-007-002`; attendance/leave events by `SPR-MOD-007-003`; appraisal events by `SPR-MOD-007-004`.

### 11.2 Consumed

Sprint 1 consumes **no cross-module domain events**. It consumes Platform Identity (`ENG-001`) read-only, which is engine-level consumption rather than a domain event subscription.

Payload contracts for downstream HRMS events are declared in the event catalog when those sprints author them; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every HRMS-foundation read and write.
- [ ] Every HRMS-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] HRMS configuration namespace is initialized per company via `ENG-005` (approval hierarchies, shift patterns, notice periods).
- [ ] Employee ↔ Platform Identity linkage is exercised end-to-end read-only against `ENG-001`; no credentials are minted by HRMS.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-007_SPRINT_PLAN.md` §2 (`SPR-MOD-007-001`):

- Employee, Position, Department, Grade, and Shift records can be created, edited, and archived under a tenant/company.
- HR operations configuration (approval hierarchies, shift patterns, notice periods) resolves deterministically through `ENG-005`.
- Identity linkage to Employee records is consumed read-only from `ENG-001` — no credentials are minted.
- All structural changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-007 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Later HRMS sprints (`SPR-MOD-007-002` … `SPR-MOD-007-006`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Employee ↔ Identity linkage is read-only against `ENG-001`. Any drift in the Platform Identity contract could break linkage.
  - **Impact:** Employee-to-Identity resolution would degrade.
  - **Mitigation:** Consume `ENG-001` per its authoritative contract; escalate any change as a Platform defect. HRMS never mints credentials.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** HRMS-owned entities (Employee, Position, Department, Grade, Shift, org assignment, reporting relationship, HRMS configuration) MUST NOT be redefined by downstream modules; payroll processing (MOD-008) and financial postings (MOD-002) MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Employee / Org-Structure Master Authority convention (§1.1.1) and the HRMS ↔ Payroll / Accounting boundary (§1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-06
  - **Description:** HR operations configuration registration is in scope here; **evaluation** semantics (approval routing execution, shift roster computation, notice-period enforcement in exit transactions) are in scope of downstream HRMS sprints.
  - **Impact:** Loose registration semantics would leak evaluation responsibilities into this sprint.
  - **Mitigation:** Register configuration deterministically via `ENG-005`; do not expose evaluation paths in this sprint.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 1 publishes no new domain events. Downstream HRMS sprints declare events (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`, `AppraisalCompleted`, `TrainingCompleted` consumed, `PayrollProcessed` consumed). Any event name not yet present in the authoritative event catalog at their authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint that publishes/consumes them, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Handle in each downstream sprint's own §14; not a Sprint 1 obligation. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — employee, position, department, grade, shift validation; department hierarchy and reporting acyclicity; org-assignment invariants; HRMS configuration resolution rules.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, Employee ↔ Identity linkage via `ENG-001`.
- **Contract** — Employee ↔ Identity linkage contract against `ENG-001`.
- **End-to-end (smoke)** — employee creation, org-structure creation, org assignment, and configuration resolution under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture and a Platform-Identity read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling employee lifecycle as a small state machine so audit emission (§5.6) is trivially satisfiable at every transition.
- Consider validating hierarchy-acyclicity (department parent/child and employee ↔ manager) and tenancy at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating HRMS configuration initialization with company activation events emitted by MOD-001 so the HRMS configuration namespace is ready before the first employee record.
- Consider registering approval hierarchies, shift patterns, and notice periods upfront in this sprint (even though only downstream sprints consume them) so configuration readiness is deterministic.
- Consider a small Employee ↔ Identity reconciliation ledger keyed by (tenant, company, identity_id) so downstream link changes are idempotent.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-007-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the HRMS Foundation — employee master, org-structure masters, org assignment, reporting structure, HR operations configuration, identity linkage, and audit (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-007 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the HRMS Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates employment-lifecycle transactions, attendance and leave, performance, L&D and self-service, HR analytics, payroll, financial postings, and identity/permissions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-007-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-007-002` Employment Lifecycle is the immediate successor per [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-007-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Precedent Foundation Sprint PRDs — [`../crm/SPR-MOD-006-001-crm-foundation.md`](../crm/SPR-MOD-006-001-crm-foundation.md), [`../sales/SPR-MOD-003-001-sales-foundation.md`](../sales/SPR-MOD-003-001-sales-foundation.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
