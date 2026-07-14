---
title: "SPR-MOD-008-001 — Payroll Foundation & Salary Structures"
summary: "Sprint PRD for the foundational Payroll layer of MOD-008 Payroll: Salary Structure and Component master, Bank Mandate master, and payroll operations configuration (pay cycles, rounding policy, numbering series). Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-14"
sprint_id: "SPR-MOD-008-001"
parent_module: "MOD-008"
parent_sprint_plan: "MOD-008_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "10.0.1"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-017", "ENG-018", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "payroll", "mod-008", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD008-001-20260714T001300Z-001"
parent_result_id: "GT002-MOD008-20260714-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-008-001 — Payroll Foundation & Salary Structures

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-008 Payroll** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-008-001` (permanent) |
| Parent Module | `MOD-008` — Payroll |
| Parent Sprint Plan | [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) |
| Downstream Sprints | `SPR-MOD-008-002` … `SPR-MOD-008-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Payroll Foundation** for BusinessOS: the Salary Structure and Component master, the Bank Mandate master, and the payroll operations configuration (pay cycles, rounding policy, numbering series) resolved through `ENG-005`. This foundation is the substrate on which every subsequent Payroll sprint — Cycles & Runs, Statutory Computations, Reimbursements & Advances, Payslips & Disbursement, and Payroll Analytics & Compliance — depends.

> **Payroll Ownership Convention.** The Payroll module owns the business semantics of the Salary Structure, Component, and Bank Mandate masters, and the payroll operations configuration. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, currency, eventing) but **MUST NOT** redefine Payroll business rules. Employee master, org structure, attendance, and leave remain exclusive to **MOD-007 HRMS** and are consumed read-only via published events and read APIs. Financial posting of payroll obligations remains exclusive to **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**.

#### 1.1.1 Salary Structure, Component, and Bank Mandate Master Authority

The **Salary Structure**, **Component**, and **Bank Mandate** masters are authoritatively owned by MOD-008 Payroll. No other module MAY create, edit, archive, or independently maintain a parallel Salary Structure, Component, or Bank Mandate master. Downstream sprints and modules consume these masters through Payroll-owned events and read APIs authored in later sprints; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 Payroll ↔ HRMS Boundary (Employee vs. Salary Structure)

- **MOD-007 HRMS** owns the Employee master, the org-structure masters (Position, Department, Grade, Shift), organization assignment, employment status transitions, and the reporting structure.
- **MOD-008 Payroll** owns the compensation-shape masters (Salary Structure, Component) and the disbursement-instruction master (Bank Mandate). Payroll references an HRMS-owned Employee read-only when a Salary Structure or Bank Mandate is bound to an employee; the Employee entity itself is **not** redefined in this sprint.
- Employee-status signals (`EmployeeHired`, `EmployeeExited`) and attendance/leave signals (`AttendanceMarked`, `LeaveApproved`) are HRMS-published and are **not** consumed in Sprint 1; they are reserved for `SPR-MOD-008-002`.

#### 1.1.3 Payroll ↔ Accounting and Platform Boundary

- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. No Payroll sprint writes journal entries; Sprint 5 invokes those engines but does not redefine posting logic.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Payroll consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.

Ownership boundaries SHALL NOT be redefined in downstream Payroll Sprint PRDs.

#### 1.1.4 Payroll Configuration Authority

Payroll operations configuration — pay cycles, rounding policy, and numbering series — is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline; numbering-series resolution executes through `ENG-017` at transaction time in later sprints. No module-specific configuration keys are registered outside Payroll's own ownership boundary. Configuration **consumption** by downstream Payroll sprints (Cycles & Runs, Statutory, Reimbursements & Advances, Payslips & Disbursement) uses these registrations without redefining them.

#### 1.1.5 Salary Structure and Bank Mandate Lifecycle Boundary

Payroll owns the lifecycle of every foundation master (Salary Structure, Component, Bank Mandate). Downstream sprints (Cycles & Runs, Statutory, Reimbursements & Advances, Payslips & Disbursement, Payroll Analytics & Compliance) consume these entities without redefining their lifecycles.

### 1.2 In Scope

- Salary Structure master: create, edit, activate, deactivate, archive under a tenant/company.
- Component master: create, edit, activate, deactivate, archive under a tenant/company; association with Salary Structures.
- Bank Mandate master: create, edit, activate, deactivate, archive under a tenant/company; read-only reference to an HRMS-owned Employee where applicable.
- Payroll operations configuration namespace initialized per company via `ENG-005`: pay cycles, rounding policy, numbering series.
- Read-only consumption of Platform Identity (`ENG-001`) for the actor identity used in foundation lifecycle actions.
- Read-only consumption of HRMS-owned Employee for Bank Mandate binding; Employee master itself is not redefined here.
- Audit emission via `ENG-004` for every foundation lifecycle transition per `ADR-014`.
- Currency handling for Component amounts via `ENG-018` (denomination and rounding contract only; posting is out of scope).
- Locale-scoped labels on foundation entities via `ENG-006` where applicable.
- `ENG-024` engine consumption is reserved for downstream sprints; Sprint 1 publishes no new domain events (per Sprint Plan §2).

### 1.3 Out of Scope

- Payroll Run transaction lifecycle, run inputs from HRMS events, gross computation, approval routing, run reversal — `SPR-MOD-008-002`.
- Statutory Setup master, statutory computations per locale, statutory reports — `SPR-MOD-008-003`.
- Reimbursement and Advance transaction lifecycles and their consumption within payroll runs — `SPR-MOD-008-004`.
- Payslip transaction lifecycle, payslip issuance, disbursement file generation, invocation of `ENG-015` Voucher and `ENG-016` Posting — `SPR-MOD-008-005`.
- Payroll read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-008-006`.
- Employee master, org structure, attendance, and leave — owned by MOD-007.
- Financial postings for payroll obligations — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-008-001`, the following will exist:

- **Business capabilities.**
  - A Payroll administrator can create, edit, activate, deactivate, and archive Salary Structure records under a tenant/company.
  - A Payroll administrator can create, edit, activate, deactivate, and archive Component records under a tenant/company and associate Components with Salary Structures.
  - A Payroll administrator can create, edit, activate, deactivate, and archive Bank Mandate records under a tenant/company, and can bind a Bank Mandate to an HRMS-owned Employee read-only.
  - Payroll operations configuration (pay cycles, rounding policy, numbering series) is registered and resolves deterministically per company through `ENG-005`.
  - Identity linkage for actor actions is consumed read-only from `ENG-001` — no credentials are minted.
  - Employee references for Bank Mandate binding are consumed read-only from MOD-007 — no Employee master is re-authored.
- **Configuration artifacts.** Payroll configuration namespace initialized for each company via `ENG-005`. No module-specific keys are registered outside Payroll's own ownership boundary.
- **Audit artifacts.** An audit record exists for every Payroll-foundation lifecycle transition, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-008-001`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

Sprint 1 publishes **no new domain events** (per Sprint Plan §2 — Sprint 1 declares engine consumption of `ENG-024` for downstream readiness but reserves payroll-lifecycle events `PayrollProcessed` / `PayrollPosted` / `PayslipIssued` / `DisbursementInitiated` to later Payroll sprints). This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-008 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Payroll primitives and personas | Salary Structure / Component / Bank Mandate masters and Payroll Ownership Convention |
| §2 Business Scope — Salary structures and components; submodule Structures | Salary Structure and Component master, Bank Mandate master |
| §3 Personas — Payroll Officer, HR, Finance, Employee, Auditor | User stories (§4) |
| §5 Master Data — Salary Structure, Component, Bank Mandate | All three masters delivered in this sprint |
| §7 Business Rules — Payroll foundation invariants | Enforceable classification, tenancy, and lifecycle invariants |
| §10 Configuration — Pay cycles, Rounding policy, Numbering series | Payroll configuration namespace via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Payroll Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Salary structures and components (§2) | `SPR-MOD-008-001` |

This allocation is unique; no other Payroll sprint claims "Salary structures and components" as an originating capability. Master-data entities Salary Structure, Component, and Bank Mandate are each originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Salary structures and components* and submodule *Structures* → this Sprint PRD → deliverables in §2 (Salary Structure, Component, Bank Mandate masters, Payroll configuration namespace, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Payroll administrator, I want to create, edit, activate, deactivate, and archive Salary Structures under a company, so that a coherent compensation-shape catalog exists before any payroll run occurs.*
- **US-002.** *As a Payroll administrator, I want to create, edit, activate, deactivate, and archive Components under a company and associate them with Salary Structures, so that Structures can be composed deterministically from re-usable Components.*
- **US-003.** *As a Payroll administrator, I want to create, edit, activate, deactivate, and archive Bank Mandates under a company and bind them read-only to HRMS-owned Employees, so that disbursement instructions can later be resolved for each employee without redefining the Employee master.*
- **US-004.** *As a Payroll administrator, I want to register Payroll operations configuration (pay cycles, rounding policy, numbering series) per company, so that later Payroll sprints resolve their configuration deterministically.*
- **US-005.** *As a Payroll administrator, I want the actor identity used for foundation lifecycle actions to be consumed read-only from `ENG-001`, so that identity, authentication, and permissions remain owned by MOD-001 while Payroll captures the compensation-shape relationship.*
- **US-006.** *As a security reviewer, I want every Payroll-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct Salary Structure, Component, and Bank Mandate history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Salary Structure master (US-001)

- **Given** a valid Salary Structure creation request under a tenant/company,
  **when** a Payroll admin submits it,
  **then** the Salary Structure is persisted with a stable identifier and its identifiers are unique within the company.
- **Given** a valid Salary Structure update that maintains referential integrity,
  **when** a Payroll admin submits it,
  **then** the update is persisted and audited.
- **Given** a Salary Structure with dependent Payroll references (created in later sprints),
  **when** archival is attempted,
  **then** archival is either permitted with a clean lifecycle transition or rejected deterministically per the Salary Structure lifecycle rules established here.

### 5.2 Component master (US-002)

- **Given** a valid Component creation request under a tenant/company,
  **when** a Payroll admin submits it,
  **then** the Component is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an active Component and an active Salary Structure under the same company,
  **when** a Payroll admin associates the Component with the Salary Structure,
  **then** the association is persisted deterministically and audited.
- **Given** an attempt to associate a Component with an archived Salary Structure, or to associate entities in different companies,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.3 Bank Mandate master (US-003)

- **Given** a valid Bank Mandate creation request under a tenant/company,
  **when** a Payroll admin submits it,
  **then** the Bank Mandate is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an HRMS-owned Employee and an active Bank Mandate under the same company,
  **when** a Payroll admin binds the Bank Mandate to the Employee,
  **then** the binding is persisted read-only against the HRMS Employee reference and audited; the Employee master is not redefined.
- **Given** an attempt to bind a Bank Mandate to an Employee in a different company or to an archived Bank Mandate,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.4 Payroll operations configuration (US-004)

- **Given** a company under an active tenant,
  **when** pay cycles, rounding policy, and numbering series are registered,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a downstream sprint querying a configuration key registered by this sprint,
  **when** it queries the key by identifier,
  **then** it receives the deterministic value resolved for its (tenant, company) scope; **evaluation semantics** (pay-cycle scheduling, rounding at run time, numbering-series allocation at transaction time via `ENG-017`) remain out of scope here and are delivered by later Payroll sprints.

### 5.5 Identity consumption (US-005)

- **Given** any Payroll-foundation lifecycle action,
  **when** it executes,
  **then** the actor identity is resolved read-only via `ENG-001`; no credentials are minted by Payroll.

### 5.6 Audit integration (US-006)

- **Given** any Payroll-foundation lifecycle transition (Salary Structure / Component / Bank Mandate / configuration / association / binding create, update, activate, deactivate, archive),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.7 Isolation invariants (`ADR-011`)

- **Given** any Payroll-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.8 Ownership consumption invariants

- **Given** any downstream module or sprint requiring Salary Structure, Component, or Bank Mandate data,
  **when** it reads or reacts to these masters,
  **then** it does so exclusively through Payroll-owned events (published by later Payroll sprints) and read APIs. No downstream module creates an independent Salary Structure, Component, or Bank Mandate master.
- **Given** any Payroll code path that requires Employee data,
  **when** it needs the HRMS Employee,
  **then** it consumes it read-only from MOD-007; the Employee entity is not redefined here.
- **Given** any Payroll code path that requires Identity data,
  **when** it needs the Platform Identity,
  **then** it consumes it read-only via `ENG-001`; the Identity entity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-008` — Payroll.
- **Module PRD:** [`docs/20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Salary structures and components; submodule Structures), §3 (Payroll Officer, HR, Finance, Employee, Auditor), §5 (Salary Structure, Component, Bank Mandate), §7 (foundation invariants), §10 (Pay cycles, Rounding policy, Numbering series), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-008` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) — Employee master consumed read-only for Bank Mandate binding.
- **Upstream sprint dependencies (per Sprint Plan §2):** None (Payroll sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` and the published `MOD007_HRMS_BASELINE_v1`.
- **Cross-module consumption (events only):** None in this sprint. Consumption of HRMS-published events (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`) is scoped to `SPR-MOD-008-002`.
- **Downstream sprints:** `SPR-MOD-008-002` (Cycles & Runs), `SPR-MOD-008-003` (Statutory), `SPR-MOD-008-004` (Reimbursements & Advances), `SPR-MOD-008-005` (Payslips & Disbursement), `SPR-MOD-008-006` (Payroll Analytics & Compliance) — per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.0,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Payroll Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the Payroll-administrator identity used for foundation lifecycle actions and read-only binding to Platform users. |
| `ENG-002` Authorization | Enforces authorization on Payroll-foundation actions. |
| `ENG-003` Permission Management | Registers Payroll-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every Payroll-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves Payroll operations configuration (pay cycles, rounding policy, numbering series) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for Salary Structure, Component, and Bank Mandate content where applicable. |
| `ENG-017` Numbering | Registered as the numbering-series producer for later Payroll transactions; **allocation** semantics execute at transaction time in downstream sprints. |
| `ENG-018` Currency | Denomination and rounding contract for Component amounts; posting semantics remain owned by `ENG-016` and are out of scope here. |
| `ENG-024` Eventing | Reserved for downstream Payroll sprints (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`). Sprint 1 publishes no new domain events; the engine is available but not exercised for new event contracts here. |

Payroll business semantics (Salary Structure, Component, Bank Mandate, Payroll configuration namespace, Component ↔ Structure associations, Bank Mandate ↔ Employee bindings) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Payroll-foundation read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Payroll-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Salary Structure | MOD-008 (this sprint) | Named compensation shape composed of Components, scoped to a tenant/company. |
| Component | MOD-008 (this sprint) | Reusable earnings/deductions unit with a currency denomination and rounding contract. |
| Bank Mandate | MOD-008 (this sprint) | Disbursement-instruction record scoped to a tenant/company; bound read-only to an HRMS Employee where applicable. |
| Structure ↔ Component Association | MOD-008 (this sprint) | Composition of Components within a Salary Structure. |
| Payroll Configuration | MOD-008 (this sprint, configuration-scoped) | Payroll operations configuration namespace per company resolved via `ENG-005` (pay cycles, rounding policy, numbering series). |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **Salary Structures**, zero or more **Components**, zero or more **Bank Mandates**, and one **Payroll configuration** namespace.
- A **Salary Structure** MAY compose zero or more **Components** within the same company.
- A **Bank Mandate** MAY reference an HRMS-owned **Employee** within the same company; the Employee entity is not represented as a Payroll-owned entity here.
- A **Component** carries a currency denomination and rounding contract resolved through `ENG-018`.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-008` per the Payroll Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Employee** entity is owned by MOD-007 HRMS and is consumed read-only; it is not a Payroll-owned entity.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only; it is not a Payroll-owned entity.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Payroll-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

Sprint 1 publishes **no new domain events**. Per Sprint Plan §2 (`SPR-MOD-008-001`), no event contract is originated by this sprint. Payroll-lifecycle events (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`) are originated by later Payroll sprints per Module PRD §8.

### 11.2 Consumed

Sprint 1 consumes **no cross-module domain events**. It consumes Platform Identity (`ENG-001`) read-only and HRMS Employee master read-only (for Bank Mandate binding), which is engine-level and API-level consumption rather than a domain event subscription. Consumption of HRMS-published events (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`) is scoped to `SPR-MOD-008-002`.

Payload contracts for downstream Payroll events are declared in the event catalog when those sprints author them; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Payroll-foundation read and write.
- [ ] Every Payroll-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] Payroll configuration namespace is initialized per company via `ENG-005` (pay cycles, rounding policy, numbering series).
- [ ] Actor identity for foundation lifecycle actions is exercised end-to-end read-only against `ENG-001`; no credentials are minted by Payroll.
- [ ] Bank Mandate ↔ Employee binding is exercised end-to-end read-only against the HRMS Employee read API; no Employee master is re-authored.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-008_SPRINT_PLAN.md` §2 (`SPR-MOD-008-001`):

- Salary Structure, Component, and Bank Mandate records can be created, edited, and archived under a tenant/company.
- Payroll operations configuration (pay cycles, rounding policy, numbering series) resolves deterministically through `ENG-005`.
- Employee master linkage is consumed read-only from MOD-007 — no employee master is re-authored.
- All structural changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-008 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-008 depends on `MOD007_HRMS_BASELINE_v1` being published and stable for read-only Employee consumption in Bank Mandate binding.
  - **Impact:** Any drift in the HRMS Employee read API would break Bank Mandate binding.
  - **Mitigation:** Consume the HRMS Employee read API per its authoritative contract; escalate any change as an HRMS defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Later Payroll sprints (`SPR-MOD-008-002` … `SPR-MOD-008-006`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Payroll-owned entities (Salary Structure, Component, Bank Mandate, Structure ↔ Component association, Bank Mandate ↔ Employee binding, Payroll configuration) MUST NOT be redefined by downstream modules; HRMS employee master (MOD-007) and financial postings (MOD-002) MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Salary Structure / Component / Bank Mandate Master Authority convention (§1.1.1) and the Payroll ↔ HRMS / Accounting boundary (§1.1.2, §1.1.3) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-06
  - **Description:** Payroll operations configuration registration is in scope here; **evaluation** semantics (pay-cycle scheduling, rounding at run time, numbering-series allocation at transaction time via `ENG-017`) are in scope of downstream Payroll sprints.
  - **Impact:** Loose registration semantics would leak evaluation responsibilities into this sprint.
  - **Mitigation:** Register configuration deterministically via `ENG-005`; do not expose evaluation paths in this sprint.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 1 publishes no new domain events. Downstream Payroll sprints declare events (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`) and consume HRMS-published events (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`). Any event name not yet present in the authoritative event catalog at their authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before the sprint that publishes/consumes them, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Handle in each downstream sprint's own §14; not a Sprint 1 obligation. Register via the event catalog governance process before the owning sprint begins.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Salary Structure, Component, Bank Mandate validation; Structure ↔ Component association invariants; Bank Mandate ↔ Employee binding invariants; Payroll configuration resolution rules.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, actor identity resolution via `ENG-001`, HRMS Employee read via MOD-007 read API, currency denomination via `ENG-018`.
- **Contract** — HRMS Employee read API contract used by Bank Mandate binding.
- **End-to-end (smoke)** — Salary Structure creation, Component creation and association, Bank Mandate creation and Employee binding, and configuration resolution under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an HRMS-Employee read-only fixture, and a Platform-Identity read-only fixture.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling Salary Structure, Component, and Bank Mandate lifecycles as small state machines so audit emission (§5.6) is trivially satisfiable at every transition.
- Consider validating tenancy and same-company invariants (Structure ↔ Component association, Bank Mandate ↔ Employee binding) at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating Payroll configuration initialization with company activation events emitted by MOD-001 so the Payroll configuration namespace is ready before the first Salary Structure record.
- Consider registering pay cycles, rounding policy, and numbering series upfront in this sprint (even though only downstream sprints consume them) so configuration readiness is deterministic.
- Consider a small Bank-Mandate ↔ Employee reconciliation ledger keyed by (tenant, company, employee_id) so downstream binding changes are idempotent.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-008-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the Payroll Foundation — Salary Structure, Component, and Bank Mandate masters, Payroll operations configuration, identity consumption, HRMS Employee consumption, and audit (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-008 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Payroll Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates cycles/runs, statutory, reimbursements/advances, payslips/disbursement, analytics, HRMS-owned entities, financial postings, and identity/permissions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-008-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-008-002` Payroll Cycles & Runs is the immediate successor per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-008-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- Precedent Foundation Sprint PRDs — [`../hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md`](../hrms/SPR-MOD-007-001-hrms-foundation-employee-master.md), [`../crm/SPR-MOD-006-001-crm-foundation.md`](../crm/SPR-MOD-006-001-crm-foundation.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
