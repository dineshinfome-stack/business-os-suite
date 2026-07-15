---
title: "SPR-MOD-008-002 — Payroll Cycles & Runs"
summary: "Sprint PRD for the Payroll Cycles & Runs slice of MOD-008 Payroll: Payroll Run transaction lifecycle, input consumption from HRMS-published events, gross computation, approval routing, and run reversal. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-14"
sprint_id: "SPR-MOD-008-002"
parent_module: "MOD-008"
parent_sprint_plan: "MOD-008_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "10.0.2"
size: "Large"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-017", "ENG-018", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "payroll", "mod-008", "cycles", "runs", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD008-002-20260714T001400Z-001"
parent_result_id: "GT003-MOD008-001-20260714T001300Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-008-002 — Payroll Cycles & Runs

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-008 Payroll** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-008-002` (permanent) |
| Parent Module | `MOD-008` — Payroll |
| Parent Sprint Plan | [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Large |
| Upstream Sprint | [`SPR-MOD-008-001`](./SPR-MOD-008-001-payroll-foundation-and-salary-structures.md) (Draft) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) |
| Downstream Sprints | `SPR-MOD-008-003` … `SPR-MOD-008-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Inputs-to-run** and **Run-to-approval** business processes for MOD-008 Payroll: the **Payroll Run** transaction lifecycle, deterministic consumption of HRMS-published signals (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`), gross computation over Sprint 1's Salary Structure and Component masters, approval routing via `ENG-011`, and run reversal via a new reversing run per Module PRD §7.

> **Payroll Ownership Convention (recapitulated).** The Payroll module owns the business semantics of the Payroll Run transaction lifecycle, run inputs, gross computation, approval routing, and reversal. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, workflow, approval, rules, scheduler, numbering, currency, eventing, notification) but **MUST NOT** redefine Payroll business rules. Employee master, org structure, attendance, and leave remain exclusive to **MOD-007 HRMS** and are consumed read-only via published events and read APIs. Statutory computations, reimbursements/advances, payslip issuance, disbursement, and posting are reserved for later Payroll sprints.

#### 1.1.1 Payroll Run Authority

The **Payroll Run** transaction is authoritatively owned by MOD-008 Payroll. No other module MAY create, edit, approve, finalize, or reverse a Payroll Run. Downstream sprints (Statutory, Reimbursements & Advances, Payslips & Disbursement, Analytics & Compliance) consume the Payroll Run through Payroll-owned read surfaces authored in later sprints; they MUST NOT redefine the run lifecycle.

#### 1.1.2 Payroll ↔ HRMS Boundary (Run Inputs)

- **MOD-007 HRMS** owns the Employee master, org-structure masters, attendance capture, and leave lifecycles.
- **MOD-008 Payroll** consumes the four HRMS-published domain events (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`) read-only, at their event catalog contract, to drive Payroll Run inputs. Payroll does **not** re-capture attendance, re-approve leave, or re-author employment status transitions.

#### 1.1.3 Reversal Rule (Module PRD §7)

Per Module PRD §7 business rule: *"Reversal of a finalized run creates a new, reversing run."* This sprint enforces that rule via `ENG-012` Rules; a finalized Payroll Run is immutable and can only be corrected by a new reversing Payroll Run that references the reversed run.

#### 1.1.4 Finalization Gating Reservation

Module PRD §7 also states: *"A payroll run cannot be finalized until all statutory computations complete."* Statutory computation delivery is originating-allocated to `SPR-MOD-008-003`. This sprint delivers the run lifecycle up to the finalization gate; the statutory-completion precondition is wired in `SPR-MOD-008-003` without modifying the run lifecycle authored here.

### 1.2 In Scope

- **Payroll Run** transaction lifecycle: create, populate inputs, compute gross, route for approval, finalize (subject to the statutory gate wired in Sprint 3), reverse via a new reversing run.
- Read-only consumption of the four HRMS-published events (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`) as run inputs; deterministic reconciliation of inputs to a specific Payroll Run and pay cycle.
- Gross computation over Sprint 1's Salary Structure ↔ Component composition, using `ENG-018` Currency for denomination and rounding per the rounding policy registered in Sprint 1.
- Approval routing via `ENG-011` Approval and long-running orchestration via `ENG-010` Workflow.
- Rule enforcement (reversal rule; input-completeness rule; period-uniqueness rule) via `ENG-012` Rules.
- Scheduled pay-cycle windows via `ENG-014` Scheduler using pay cycles registered in Sprint 1 via `ENG-005`.
- Numbering-series allocation for Payroll Run identifiers via `ENG-017` at transaction time, using series registered in Sprint 1.
- Audit emission via `ENG-004` for every Payroll Run lifecycle transition per `ADR-014`.
- Notification emission via `ENG-025` for approval requests, approvals, rejections, and reversals.
- `ENG-024` Eventing is exercised only for internal orchestration; **no new domain events are published by this sprint** (payroll-lifecycle events `PayrollProcessed` / `PayrollPosted` / `PayslipIssued` / `DisbursementInitiated` remain originating-allocated to `SPR-MOD-008-005` per Module PRD §8 and Sprint Plan §2).

### 1.3 Out of Scope

- Salary Structure, Component, Bank Mandate, Payroll operations configuration — delivered by `SPR-MOD-008-001`.
- Statutory Setup master, per-locale statutory computation within a run, statutory reports — `SPR-MOD-008-003`.
- Reimbursement and Advance transaction lifecycles and their consumption within payroll runs — `SPR-MOD-008-004`.
- Payslip transaction lifecycle, payslip issuance, disbursement file generation, invocation of `ENG-015` Voucher and `ENG-016` Posting — `SPR-MOD-008-005`.
- Payroll read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-008-006`.
- Employee master, org structure, attendance capture, and leave lifecycles — owned by MOD-007.
- Financial postings for payroll obligations — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-008-002`, the following will exist:

- **Business capabilities.**
  - A Payroll administrator can create a Payroll Run for a (tenant, company, pay cycle, period) tuple; the identifier is allocated via `ENG-017`.
  - The Payroll Run consumes HRMS-published signals (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`) as inputs, deterministically reconciled to the run's pay-cycle period.
  - Gross computation resolves each in-scope employee's compensation shape from the Salary Structure ↔ Component composition delivered by Sprint 1, using `ENG-018` for denomination and rounding per the Sprint-1 rounding policy.
  - The Payroll Run is routed for approval via `ENG-011` and orchestrated by `ENG-010`, using `ENG-014` to open the pay-cycle window.
  - The Payroll Run can be reversed by creating a new reversing Payroll Run that references the reversed run; the reversal rule is enforced by `ENG-012`.
  - Notifications for approval requests, approvals, rejections, and reversals are emitted via `ENG-025`.
- **Configuration artifacts.** No new configuration namespace is introduced; this sprint consumes the Payroll configuration namespace registered by Sprint 1 (pay cycles, rounding policy, numbering series) via `ENG-005` and `ENG-017`.
- **Audit artifacts.** An audit record exists for every Payroll Run lifecycle transition (create, input reconciliation, compute, submit-for-approval, approve, reject, finalize-request, reverse), produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-008-002`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

Sprint 2 publishes **no new domain events** (per Sprint Plan §2 — Payroll-lifecycle domain events are originating-allocated to `SPR-MOD-008-005`). Consumed events (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`) are HRMS-published and referenced by the authoritative [`event-catalog.md`](../../02-architecture/event-catalog.md). This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-008 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Payroll cycles and runs; submodule Cycles | Payroll Run transaction lifecycle and pay-cycle orchestration |
| §3 Personas — Payroll Officer, HR, Finance, Auditor | User stories (§4) |
| §4 Business Processes — Inputs-to-run, Run-to-approval | Run input reconciliation and approval routing |
| §6 Transactions — Payroll Run; approvals; audit clause | Payroll Run lifecycle with approvals and audit |
| §7 Business Rules — Reversal of a finalized run creates a new, reversing run | Reversal semantics enforced via `ENG-012` |
| §8 Integration Points — `EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved` (consumed) | HRMS-published event consumption |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Payroll Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Payroll cycles and runs (§2) | `SPR-MOD-008-002` |

This allocation is unique; no other Payroll sprint claims "Payroll cycles and runs" as an originating capability. The Payroll Run transaction (§6) is originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Payroll cycles and runs* and submodule *Cycles*, §4 processes *Inputs-to-run* and *Run-to-approval*, §6 transaction *Payroll Run*, §7 reversal rule, §8 consumed HRMS events → this Sprint PRD → deliverables in §2 (Payroll Run lifecycle, input reconciliation, gross computation, approval routing, reversal, audit).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Payroll administrator, I want to create a Payroll Run for a (tenant, company, pay cycle, period), so that a deterministic run object exists to consume HRMS inputs and produce gross compensation.*
- **US-002.** *As a Payroll administrator, I want the Payroll Run to consume `AttendanceMarked` and `LeaveApproved` events reconciled to the run's pay-cycle period, so that attendance and leave drive run inputs without re-capture in Payroll.*
- **US-003.** *As a Payroll administrator, I want the Payroll Run to react to `EmployeeHired` and `EmployeeExited` events, so that mid-cycle joiners and leavers are handled deterministically.*
- **US-004.** *As a Payroll administrator, I want gross computation to resolve each in-scope employee's compensation shape from Sprint 1's Salary Structure ↔ Component composition and to apply the Sprint-1 rounding policy via `ENG-018`, so that computation is deterministic and reproducible.*
- **US-005.** *As an Approver, I want to review and approve, or reject, a Payroll Run through `ENG-011`, so that governance over compensation obligations is enforced before any downstream disbursement or posting.*
- **US-006.** *As a Payroll administrator, I want to reverse a finalized Payroll Run by creating a new reversing run that references the reversed run, so that Module PRD §7 (reversal rule) is enforced without mutating the finalized run.*
- **US-007.** *As a Payroll administrator, I want approval requests, approvals, rejections, and reversals to trigger notifications via `ENG-025`, so that the run's participants act on the current state.*
- **US-008.** *As a security reviewer, I want every Payroll Run lifecycle transition to be audited via `ENG-004`, so that I can reconstruct the run's history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Payroll Run creation (US-001)

- **Given** a valid Payroll Run creation request for a (tenant, company, pay cycle, period) tuple where the pay cycle and numbering series are registered in Sprint 1,
  **when** a Payroll admin submits it,
  **then** the Payroll Run is persisted with a stable identifier allocated via `ENG-017` and its identifier is unique within the company.
- **Given** an attempt to create a second Payroll Run for the same (tenant, company, pay cycle, period) tuple while a prior run for that tuple is not yet reversed,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.2 Attendance and leave input reconciliation (US-002)

- **Given** an active Payroll Run and one or more HRMS-published `AttendanceMarked` and `LeaveApproved` events falling within the run's pay-cycle period,
  **when** the run's input reconciliation step executes,
  **then** those events are consumed read-only and deterministically associated with the run, and the reconciliation is audited.
- **Given** an `AttendanceMarked` or `LeaveApproved` event outside the run's pay-cycle period,
  **when** reconciliation executes,
  **then** the event is not associated with the run.

### 5.3 Joiner/leaver handling (US-003)

- **Given** an `EmployeeHired` event with a hire date falling within the run's pay-cycle period,
  **when** the run computes gross,
  **then** the employee is included pro-rata per the Sprint-1 Salary Structure ↔ Component composition and rounding policy.
- **Given** an `EmployeeExited` event with an exit date falling within the run's pay-cycle period,
  **when** the run computes gross,
  **then** the employee is included pro-rata up to and including the exit date and excluded thereafter.

### 5.4 Gross computation (US-004)

- **Given** an active Payroll Run with reconciled inputs and an in-scope employee bound (via HRMS read-only) to a Sprint-1 Salary Structure,
  **when** gross computation executes,
  **then** each Component amount is resolved deterministically, denominated and rounded through `ENG-018` under the Sprint-1 rounding policy, and the resulting per-employee gross is persisted and audited.
- **Given** a Salary Structure or Component in an archived state,
  **when** gross computation encounters it,
  **then** the run rejects the computation deterministically without producing partial gross.

### 5.5 Approval routing (US-005)

- **Given** a Payroll Run with completed gross computation,
  **when** a Payroll admin submits it for approval,
  **then** it is routed through `ENG-011` under the authorization model defined by `ADR-032`, orchestrated by `ENG-010`, and every transition is audited.
- **Given** an Approver rejects a routed Payroll Run,
  **when** the rejection is recorded,
  **then** the run returns to a pre-approval state and cannot be finalized in that state.

### 5.6 Reversal rule (US-006, Module PRD §7)

- **Given** a finalized Payroll Run,
  **when** a Payroll admin initiates reversal,
  **then** a new reversing Payroll Run is created that references the reversed run; the reversed run remains immutable; the reversal is enforced by `ENG-012` and audited.
- **Given** a non-finalized Payroll Run,
  **when** reversal is attempted,
  **then** the request is rejected deterministically.

### 5.7 Notifications (US-007)

- **Given** a Payroll Run transitioning through submit-for-approval, approve, reject, or reverse,
  **when** the transition completes,
  **then** the appropriate participants receive notifications via `ENG-025`.

### 5.8 Audit integration (US-008)

- **Given** any Payroll Run lifecycle transition (create, input reconciliation, compute, submit-for-approval, approve, reject, finalize-request, reverse),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, run identifier, transition type, referenced input/reversed-run identifiers where applicable, and timestamp.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any Payroll Run read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed. Consumed HRMS events are only associated with runs in the same (tenant, company) scope.

### 5.10 Finalization gate reservation

- **Given** a Payroll Run that has passed approval,
  **when** finalization is requested in this sprint's scope,
  **then** the finalization request is recorded in an "awaiting statutory completion" state per Module PRD §7; the actual finalization gate is wired in `SPR-MOD-008-003` and is not exercised by this sprint's acceptance surface.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-008` — Payroll.
- **Module PRD:** [`docs/20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Payroll cycles and runs; submodule Cycles), §3 (Payroll Officer, HR, Finance, Auditor), §4 (Inputs-to-run, Run-to-approval), §6 (Payroll Run; approvals; audit clause), §7 (Reversal rule), §8 (consumed HRMS events), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-008` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) — Employee master and the four HRMS-published domain events consumed read-only.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-008-001` (Payroll Foundation & Salary Structures) — provides Salary Structure, Component, Bank Mandate, and Payroll operations configuration.
- **Cross-module consumption (events only):** `EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved` (HRMS-published, per Module PRD §8).
- **Downstream sprints:** `SPR-MOD-008-003` (Statutory Computations), `SPR-MOD-008-004` (Reimbursements & Advances), `SPR-MOD-008-005` (Payslip Generation & Disbursement), `SPR-MOD-008-006` (Payroll Analytics & Compliance) — per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).

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
| `ENG-002` Authorization | Enforces authorization on Payroll Run actions per `ADR-032`. |
| `ENG-004` Audit | Records every Payroll Run lifecycle transition per `ADR-014`. |
| `ENG-005` Configuration | Resolves Payroll operations configuration (pay cycles, rounding policy, numbering series) registered in Sprint 1. |
| `ENG-010` Workflow | Orchestrates the long-running Payroll Run lifecycle (Inputs-to-run and Run-to-approval processes). |
| `ENG-011` Approval | Routes the Payroll Run through the tenant-configured approval chain. |
| `ENG-012` Rules | Enforces the reversal rule (Module PRD §7), the pay-cycle period-uniqueness rule, and input-completeness rules. |
| `ENG-014` Scheduler | Opens the pay-cycle window against the pay cycles registered in Sprint 1. |
| `ENG-017` Numbering | Allocates Payroll Run identifiers at transaction time using series registered in Sprint 1. |
| `ENG-018` Currency | Denomination and rounding contract for gross computation under the Sprint-1 rounding policy. |
| `ENG-024` Eventing | Exercised for internal orchestration; no new domain events are published by this sprint. |
| `ENG-025` Notification | Delivers notifications for approval requests, approvals, rejections, and reversals. |

Payroll business semantics (Payroll Run lifecycle, run inputs, gross computation, approval routing, reversal) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Payroll Run read and write, including reconciliation of consumed HRMS events. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for every run lifecycle transition. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Payroll Run actions and to `ENG-011` approval routing. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Payroll Run | MOD-008 (this sprint) | Transaction representing a payroll computation for a (tenant, company, pay cycle, period) tuple. |
| Payroll Run Input Reconciliation | MOD-008 (this sprint) | Association of consumed HRMS event instances (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`) with a specific Payroll Run for a specific period. |
| Payroll Run Employee Line | MOD-008 (this sprint) | Per-employee gross-computation result within a Payroll Run, resolved from Sprint-1 Salary Structure ↔ Component composition. |
| Payroll Run Approval | MOD-008 (this sprint, orchestrated by `ENG-011`) | Approval state and transitions for a Payroll Run. |
| Payroll Run Reversal Link | MOD-008 (this sprint) | Association between a finalized Payroll Run and its later reversing Payroll Run. |

### 10.2 Relationships

- A **Payroll Run** references a **pay cycle** and a **numbering series** registered in Sprint 1 and is scoped to a (tenant, company, period).
- A **Payroll Run** aggregates zero or more **input reconciliations** for HRMS events that fall within its period.
- A **Payroll Run** aggregates zero or more **employee lines**, each of which references an HRMS-owned Employee read-only and resolves compensation from a Sprint-1 Salary Structure ↔ Component composition.
- A **Payroll Run Reversal Link** MAY exist between a finalized Payroll Run and a later Payroll Run that reverses it; a run MUST NOT be self-referential.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-008` per the Payroll Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Employee** entity is owned by MOD-007 HRMS and is consumed read-only.
- The **Salary Structure**, **Component**, and **Bank Mandate** masters are owned by MOD-008 Payroll and originated in Sprint 1; they are not redefined here.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Payroll-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

Sprint 2 publishes **no new domain events**. Per Sprint Plan §2, Payroll-lifecycle domain events (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`) are originating-allocated to `SPR-MOD-008-005`. This sprint exercises `ENG-024` only for internal orchestration.

### 11.2 Consumed

Per Module PRD §8 (Events Consumed) and Sprint Plan §2, this sprint consumes the four HRMS-published domain events read-only:

| Event | Publisher | Consumption Role |
| --- | --- | --- |
| `EmployeeHired` | MOD-007 HRMS | Triggers pro-rata inclusion of mid-cycle joiners in the run's period. |
| `EmployeeExited` | MOD-007 HRMS | Triggers pro-rata exclusion after the exit date within the run's period. |
| `AttendanceMarked` | MOD-007 HRMS | Feeds the run's attendance input reconciliation. |
| `LeaveApproved` | MOD-007 HRMS | Feeds the run's leave input reconciliation. |

Payload contracts for these events are the HRMS-published contracts recorded in the authoritative event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Payroll Run read and write, and on reconciliation of consumed HRMS events.
- [ ] Every Payroll Run lifecycle transition produces an audit record via `ENG-004`.
- [ ] Consumption of the four HRMS-published events is exercised end-to-end read-only against the HRMS baseline contracts; no HRMS entity is re-authored.
- [ ] Gross computation is exercised end-to-end using Sprint-1 Salary Structure ↔ Component composition and the Sprint-1 rounding policy via `ENG-018`.
- [ ] Approval routing is exercised end-to-end via `ENG-011` under `ADR-032`, orchestrated by `ENG-010`.
- [ ] Reversal rule (Module PRD §7) is exercised end-to-end via `ENG-012`.
- [ ] Numbering-series allocation for Payroll Run identifiers is exercised end-to-end via `ENG-017` using series registered in Sprint 1.
- [ ] Notifications for approval requests, approvals, rejections, and reversals are delivered via `ENG-025`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-008_SPRINT_PLAN.md` §2 (`SPR-MOD-008-002`):

- Payroll Run transactions can be created, populated from HRMS signals, routed through approval, and reversed via a new reversing run.
- Run reversal rule is enforced via `ENG-012`.
- Consumed HRMS events (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`) drive run inputs deterministically.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 2 depends on `SPR-MOD-008-001` reaching at least an implementable state so Salary Structure, Component, Bank Mandate, and Payroll operations configuration are available.
  - **Impact:** Any regression against Sprint 1 blocks Sprint 2.
  - **Mitigation:** Treat any regression as a Sprint 1 defect and re-plan; do not restate Sprint 1 semantics here.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Sprint 2 depends on `MOD007_HRMS_BASELINE_v1` remaining published and stable for the four consumed events.
  - **Impact:** Any drift in the HRMS event contracts would break run input reconciliation and joiner/leaver handling.
  - **Mitigation:** Consume events at their authoritative contracts; escalate any change as an HRMS defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Module PRD §7 requires that a payroll run cannot be finalized until all statutory computations complete; statutory computation is originating-allocated to `SPR-MOD-008-003`.
  - **Impact:** Finalization semantics would leak into Sprint 2 if the statutory gate were exercised here.
  - **Mitigation:** Deliver the run lifecycle up to an "awaiting statutory completion" finalization-request state (§5.10); wire the actual gate in Sprint 3 without modifying this sprint's lifecycle.
  - **Status:** Accepted

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Payroll-owned entities (Payroll Run, Run Input Reconciliation, Run Employee Line, Run Reversal Link) MUST NOT be redefined by downstream modules; HRMS employee/attendance/leave (MOD-007) and financial postings (MOD-002) MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment master/transaction data and break traceability.
  - **Mitigation:** Enforce the Payroll Run Authority convention (§1.1.1) and the Payroll ↔ HRMS / Accounting boundary (§1.1.2, §1.1.3 of Sprint 1) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Sprint 2 publishes no new domain events; the four consumed events (`EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved`) are HRMS-published and MUST be present in the authoritative event catalog at execution time.
  - **Impact:** If any consumed event is missing from the event catalog at execution time, run input reconciliation and joiner/leaver handling cannot be exercised end-to-end.
  - **Mitigation:** Verify the four consumed events at execution time; register via the event catalog governance process before this sprint moves to `In Progress` if any are missing. Do not modify the event catalog in this sprint's authoring pass.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Payroll Run creation invariants; pay-cycle period-uniqueness rule; input-reconciliation predicates; joiner/leaver pro-rata rules; reversal-rule enforcement.
- **Integration** — `ENG-004` audit emission on every transition; `ENG-005` configuration resolution for pay cycles, rounding, numbering series; `ENG-010` workflow orchestration; `ENG-011` approval routing; `ENG-012` rules enforcement; `ENG-014` scheduler window; `ENG-017` numbering allocation; `ENG-018` currency denomination and rounding; `ENG-025` notification delivery.
- **Contract** — HRMS event contracts for `EmployeeHired`, `EmployeeExited`, `AttendanceMarked`, `LeaveApproved` at the authoritative event catalog.
- **End-to-end (smoke)** — Payroll Run creation → input reconciliation → gross computation → approval → reversal, under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, an HRMS-event replay fixture for the four consumed events, and a Salary-Structure ↔ Component composition fixture derived from Sprint 1.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Payroll Run as an explicit state machine (Draft → InputsReconciled → GrossComputed → AwaitingApproval → Approved → AwaitingStatutoryCompletion → Reversed) so audit emission (§5.8) is trivially satisfiable at every transition.
- Consider making input reconciliation idempotent keyed by `(run_id, event_id)` so replays of HRMS events do not double-count.
- Consider projecting per-employee gross lines lazily so that late-arriving `EmployeeHired` / `EmployeeExited` events within the period can be reconciled without recomputing already-finalized lines.
- Consider co-locating the reversal linkage in a small append-only table so `ENG-012` rule evaluation for the reversal rule is a single lookup.
- Consider scheduling the pay-cycle window open via `ENG-014` a fixed lead time before the period start so `AttendanceMarked` / `LeaveApproved` events landing at the boundary are reconciled deterministically.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-008-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Payroll Run transaction lifecycle covering Inputs-to-run and Run-to-approval, with reversal per Module PRD §7 (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-008 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Payroll Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation (Sprint 1), statutory (Sprint 3), reimbursements/advances (Sprint 4), payslips/disbursement (Sprint 5), analytics (Sprint 6), HRMS-owned entities, financial postings, and identity/permissions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-008-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-008-003` Statutory Computations is the immediate successor per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-008-002`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-008-001-payroll-foundation-and-salary-structures.md`](./SPR-MOD-008-001-payroll-foundation-and-salary-structures.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- Authoritative Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
