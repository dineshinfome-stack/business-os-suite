---
title: "SPR-MOD-008-004 — Reimbursements & Advances"
summary: "Sprint PRD for the Reimbursements & Advances slice of MOD-008 Payroll: Reimbursement and Advance transaction lifecycles, approvals routing, document attachments for supporting receipts, and adjustment against subsequent payroll runs. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-008-004"
parent_module: "MOD-008"
parent_sprint_plan: "MOD-008_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "10.0.4"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-018", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "payroll", "mod-008", "reimbursements", "advances", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD008-004-20260715T000100Z-001"
parent_result_id: "GT003-MOD008-003-20260715T000000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-008-004 — Reimbursements & Advances

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-008 Payroll** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-008-004` (permanent) |
| Parent Module | `MOD-008` — Payroll |
| Parent Sprint Plan | [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-008-001`](./SPR-MOD-008-001-payroll-foundation-and-salary-structures.md) (Draft), [`SPR-MOD-008-002`](./SPR-MOD-008-002-payroll-cycles-and-runs.md) (Draft) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) |
| Downstream Sprints | `SPR-MOD-008-005`, `SPR-MOD-008-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Reimbursement** and **Advance** transaction lifecycles for MOD-008 Payroll: create, capture supporting documents via `ENG-007`, route for approval via `ENG-011`, orchestrate lifecycle via `ENG-010`, allocate transaction identifiers via `ENG-017`, denominate amounts via `ENG-018`, and — once approved — surface these transactions for consumption by subsequent Payroll Runs (owned by Sprint 2). Adjustment against a subsequent Payroll Run is defined here as the read-only availability of an approved Reimbursement or Advance to Sprint 2's run input reconciliation surface; the Payroll Run lifecycle itself is not modified.

> **Payroll Ownership Convention (recapitulated).** The Payroll module owns the business semantics of Reimbursement and Advance transactions, their approval routing, and their read-only availability to Payroll Runs. ERP Core Engines provide shared infrastructure (authorization, audit, document, workflow, approval, rules, numbering, currency, eventing, notification) but **MUST NOT** redefine Payroll business rules. Employee master remains exclusive to **MOD-007 HRMS** and is consumed read-only. Payslip issuance, disbursement, ledger posting, and analytics remain reserved for later Payroll sprints.

#### 1.1.1 Reimbursement & Advance Authority

The **Reimbursement** and **Advance** transactions are authoritatively owned by MOD-008 Payroll. No other module MAY create, edit, approve, or reverse a Reimbursement or Advance. Downstream sprints (Payslips & Disbursement, Analytics & Compliance) consume these transactions through Payroll-owned read surfaces authored in later sprints; they MUST NOT redefine the lifecycle.

#### 1.1.2 Payroll ↔ HRMS Boundary

- **MOD-007 HRMS** owns the Employee master; Reimbursement and Advance transactions reference an Employee read-only via the HRMS baseline read surface. Payroll does not re-author Employee attributes.

#### 1.1.3 Adjustment-Against-Run Boundary

- Adjustment of an approved Reimbursement or Advance against a subsequent Payroll Run is delivered here as the **availability contract** only: an approved Reimbursement or Advance is visible to Sprint 2's run input reconciliation surface, scoped by (tenant, company, employee, period).
- The Payroll Run lifecycle authored in Sprint 2 is **not modified** by this sprint. Downstream consumption during gross computation is exercised by the Payroll Run lifecycle in Sprint 2 and is validated end-to-end in `SPR-MOD-008-005` when payslips are issued.

### 1.2 In Scope

- **Reimbursement** transaction lifecycle: create, capture supporting documents via `ENG-007`, route for approval via `ENG-011` orchestrated by `ENG-010`, approve or reject, reverse via a new reversing entry.
- **Advance** transaction lifecycle: create, route for approval, approve or reject, mark for recovery against subsequent Payroll Runs.
- Numbering-series allocation for Reimbursement and Advance identifiers via `ENG-017` at transaction time, using series registered in Sprint 1.
- Denomination and rounding of amounts via `ENG-018` under the Sprint-1 rounding policy.
- Rule enforcement via `ENG-012` — duplicate-attachment prevention within a Reimbursement, non-negativity of amounts, Advance recovery-plan validity, and reversal preconditions.
- Audit emission via `ENG-004` for every Reimbursement and Advance lifecycle transition per `ADR-014`.
- Authorization via `ENG-002` under `ADR-032` for all Reimbursement- and Advance-related actions.
- Notification emission via `ENG-025` for approval requests, approvals, rejections, and reversals.
- `ENG-024` Eventing is exercised only for internal orchestration; **no new domain events are published by this sprint** (payroll-lifecycle events remain originating-allocated to `SPR-MOD-008-005`).

### 1.3 Out of Scope

- Salary Structure, Component, Bank Mandate, Payroll operations configuration — `SPR-MOD-008-001`.
- Payroll Run transaction lifecycle, input reconciliation, gross computation, approval routing, reversal — `SPR-MOD-008-002`.
- Statutory Setup, per-locale statutory evaluation, Module PRD §7 finalization gate — `SPR-MOD-008-003`.
- Payslip transaction lifecycle, payslip issuance, disbursement file generation, invocation of `ENG-015` Voucher and `ENG-016` Posting, integration transport to bank — `SPR-MOD-008-005`.
- Payroll read model, reports, dashboards, exports, audit-readiness surface — `SPR-MOD-008-006`.
- Employee master, attendance, and leave — owned by MOD-007.
- Financial postings for reimbursement or advance obligations — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-008-004`, the following will exist:

- **Business capabilities.**
  - An employee (via delegate) can raise a Reimbursement transaction for a (tenant, company, employee) scope, with supporting documents captured via `ENG-007` and the identifier allocated via `ENG-017`.
  - A Payroll administrator can raise an Advance transaction for a (tenant, company, employee) scope, with a recovery-plan validity rule enforced by `ENG-012` and the identifier allocated via `ENG-017`.
  - Both transactions route through `ENG-011` under `ENG-010` orchestration; approvers can approve or reject deterministically.
  - Approved Reimbursement and Advance transactions become available, read-only and scoped by (tenant, company, employee, period), to Sprint 2's run input reconciliation surface. Consumption inside a Payroll Run is exercised by Sprint 2's lifecycle and end-to-end in Sprint 5; it is not re-implemented here.
  - Reversal (Reimbursement) and cancellation (Advance) are supported via new reversing entries, with reversal preconditions enforced via `ENG-012`.
  - Notifications for approval requests, approvals, rejections, and reversals are emitted via `ENG-025`.
- **Configuration artifacts.** No new configuration namespace is introduced; this sprint consumes the Payroll configuration namespace registered by Sprint 1 (numbering series, rounding policy) via `ENG-005` and `ENG-017`.
- **Audit artifacts.** An audit record exists for every Reimbursement and Advance lifecycle transition (create, attach document, submit-for-approval, approve, reject, reverse/cancel, availability), produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-008-004`.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

Sprint 4 publishes **no new domain events** (per Sprint Plan §2 — Payroll-lifecycle domain events are originating-allocated to `SPR-MOD-008-005`). This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-008 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Reimbursements and advances | Reimbursement and Advance transaction lifecycles |
| §3 Personas — Employee, Payroll Officer, HR, Finance, Auditor | User stories (§4) |
| §6 Transactions — Reimbursement, Advance; approvals; audit clause | Reimbursement and Advance lifecycles with approvals and audit |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Payroll Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Reimbursements and advances (§2) | `SPR-MOD-008-004` |

This allocation is unique; no other Payroll sprint claims "Reimbursements and advances" as an originating capability. The Reimbursement and Advance transactions (§6) are originating-allocated to this sprint per Sprint Plan §4.3.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Reimbursements and advances*, §6 transactions *Reimbursement* and *Advance* → this Sprint PRD → deliverables in §2 (Reimbursement and Advance lifecycles, approval routing, document attachments, adjustment availability, reversal, audit).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an employee (via delegate), I want to raise a Reimbursement with supporting documents attached via `ENG-007`, so that a reviewable claim exists under my (tenant, company) scope.*
- **US-002.** *As a Payroll administrator, I want to raise an Advance for an employee with a recovery plan, so that a governed advance is available to Payroll Runs for recovery in subsequent periods.*
- **US-003.** *As an Approver, I want to review, approve, or reject Reimbursement and Advance transactions through `ENG-011` under `ADR-032`, so that governance is enforced before availability to Payroll Runs.*
- **US-004.** *As a Payroll administrator, I want an approved Reimbursement or Advance to be visible read-only to Sprint 2's Payroll Run input reconciliation surface, scoped by (tenant, company, employee, period), so that Payroll Runs can consume it without redefining the transaction here.*
- **US-005.** *As a Payroll administrator, I want to reverse a Reimbursement or cancel an Advance via a new reversing entry, so that corrections are made without mutating a finalized transaction.*
- **US-006.** *As a Payroll administrator, I want notifications for approval requests, approvals, rejections, and reversals via `ENG-025`, so that participants act on the current state.*
- **US-007.** *As an Auditor, I want every Reimbursement and Advance lifecycle transition to be audited via `ENG-004`, so that transaction history is fully reconstructible.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Reimbursement creation and document attachment (US-001)

- **Given** a valid Reimbursement creation request for a (tenant, company, employee) tuple where the employee is bound read-only to HRMS,
  **when** the requester submits it,
  **then** the Reimbursement is persisted with an identifier allocated via `ENG-017`, its amount is denominated and rounded via `ENG-018` under the Sprint-1 rounding policy, and the transition is audited via `ENG-004`.
- **Given** a Reimbursement in a pre-approval state,
  **when** a supporting document is attached via `ENG-007`,
  **then** the attachment is stored per the `ENG-007` contract; duplicate attachments identified by content digest are rejected deterministically by `ENG-012`.

### 5.2 Advance creation with recovery plan (US-002)

- **Given** a valid Advance creation request for a (tenant, company, employee) tuple with a recovery plan spanning one or more future pay-cycle periods,
  **when** a Payroll admin submits it,
  **then** the Advance is persisted with an identifier allocated via `ENG-017`, the recovery-plan validity rule is enforced by `ENG-012`, and the transition is audited via `ENG-004`.
- **Given** an Advance creation request with an invalid recovery plan (negative recovery amount; recovery periods outside a valid pay cycle registered in Sprint 1),
  **when** submission is attempted,
  **then** the request is rejected deterministically.

### 5.3 Approval routing (US-003)

- **Given** a Reimbursement or Advance in a pre-approval state,
  **when** a Payroll admin submits it for approval,
  **then** it is routed through `ENG-011` under `ADR-032`, orchestrated by `ENG-010`, and every transition is audited.
- **Given** an Approver rejects a routed Reimbursement or Advance,
  **when** the rejection is recorded,
  **then** the transaction returns to a pre-approval state and cannot be made available to Payroll Runs.

### 5.4 Availability to Payroll Runs (US-004)

- **Given** an approved Reimbursement or Advance scoped to a (tenant, company, employee),
  **when** a Payroll Run for the same (tenant, company) tuple executes its Sprint-2 input reconciliation surface for a period aligned with the transaction's applicability,
  **then** the transaction is visible read-only to that surface, scoped by (tenant, company, employee, period). Availability is audited via `ENG-004`.
- **Given** a Reimbursement or Advance not yet approved,
  **when** any Payroll Run's input reconciliation surface reads,
  **then** the transaction is not visible.

### 5.5 Reversal and cancellation (US-005)

- **Given** a finalized Reimbursement or Advance,
  **when** a Payroll admin initiates reversal (for a Reimbursement) or cancellation (for an Advance),
  **then** a new reversing entry is created that references the original transaction; the original remains immutable; the reversal precondition is enforced by `ENG-012` and audited.
- **Given** a non-finalized Reimbursement or Advance,
  **when** reversal or cancellation is attempted,
  **then** the request is rejected deterministically.

### 5.6 Notifications (US-006)

- **Given** a Reimbursement or Advance transitioning through submit-for-approval, approve, reject, or reverse/cancel,
  **when** the transition completes,
  **then** the appropriate participants receive notifications via `ENG-025`.

### 5.7 Audit integration (US-007)

- **Given** any Reimbursement or Advance lifecycle transition (create, attach document, submit-for-approval, approve, reject, reverse/cancel, availability),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, transaction identifier, transition type, referenced document/reversed-entry identifiers where applicable, and timestamp.

### 5.8 Isolation invariants (`ADR-011`)

- **Given** any Reimbursement or Advance read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed. Availability to Payroll Runs is only within the same (tenant, company) scope.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-008` — Payroll.
- **Module PRD:** [`docs/20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Reimbursements and advances), §3 (Employee, Payroll Officer, HR, Finance, Auditor), §6 (Reimbursement; Advance; approvals; audit clause), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-008` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD007_HRMS_BASELINE_v1`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md) (published) — Employee master consumed read-only.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-008-001` (Payroll Foundation & Salary Structures) — provides numbering series and rounding policy; `SPR-MOD-008-002` (Payroll Cycles & Runs) — provides the Payroll Run input reconciliation surface to which approved Reimbursements and Advances are made available.
- **Downstream sprints:** `SPR-MOD-008-005` (Payslip Generation & Disbursement), `SPR-MOD-008-006` (Payroll Analytics & Compliance) — per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md).

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
| `ENG-002` Authorization | Enforces authorization on Reimbursement and Advance actions per `ADR-032`. |
| `ENG-004` Audit | Records every Reimbursement and Advance lifecycle transition per `ADR-014`. |
| `ENG-007` Document | Captures supporting-document attachments for Reimbursement claims. |
| `ENG-010` Workflow | Orchestrates the long-running Reimbursement and Advance lifecycles. |
| `ENG-011` Approval | Routes Reimbursement and Advance through the tenant-configured approval chain. |
| `ENG-012` Rules | Enforces duplicate-attachment prevention, non-negativity, recovery-plan validity, and reversal preconditions. |
| `ENG-017` Numbering | Allocates Reimbursement and Advance identifiers at transaction time using series registered in Sprint 1. |
| `ENG-018` Currency | Denomination and rounding contract for Reimbursement and Advance amounts under the Sprint-1 rounding policy. |
| `ENG-024` Eventing | Exercised for internal orchestration; no new domain events are published by this sprint. |
| `ENG-025` Notification | Delivers notifications for approval requests, approvals, rejections, and reversals. |

Payroll business semantics (Reimbursement lifecycle, Advance lifecycle, approval routing, adjustment availability, reversal) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Reimbursement and Advance read/write and on availability to Payroll Runs. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for every transaction lifecycle transition. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Reimbursement and Advance actions and to `ENG-011` approval routing. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Reimbursement | MOD-008 (this sprint) | Transaction representing an employee expense claim within a (tenant, company, employee) scope. |
| Reimbursement Attachment | MOD-008 (this sprint, backed by `ENG-007`) | Association of a supporting document with a Reimbursement. |
| Advance | MOD-008 (this sprint) | Transaction representing an employee advance with a recovery plan spanning future pay-cycle periods. |
| Advance Recovery Plan | MOD-008 (this sprint) | Ordered set of recovery entries scheduled against future pay-cycle periods for a given Advance. |
| Reimbursement/Advance Approval | MOD-008 (this sprint, orchestrated by `ENG-011`) | Approval state and transitions for a Reimbursement or Advance. |
| Reimbursement/Advance Reversal Link | MOD-008 (this sprint) | Association between a finalized Reimbursement or Advance and its later reversing entry. |

### 10.2 Relationships

- A **Reimbursement** references an in-scope **Employee** (HRMS read-only) and is scoped to a (tenant, company); it aggregates zero or more **Reimbursement Attachments** captured via `ENG-007`.
- An **Advance** references an in-scope **Employee** (HRMS read-only) and is scoped to a (tenant, company); it owns exactly one **Advance Recovery Plan** valid against pay cycles registered in Sprint 1.
- A **Reimbursement** or **Advance** MAY have a **Reversal Link** to a later reversing entry; an entry MUST NOT be self-referential.
- An approved **Reimbursement** or **Advance** is visible read-only to the Sprint-2 Payroll Run input reconciliation surface for the same (tenant, company, employee) scope.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-008` per the Payroll Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The **Employee** entity is owned by MOD-007 HRMS and is consumed read-only.
- The **Payroll Run** entity is owned by MOD-008 Payroll and originated in Sprint 2; it is not redefined here.
- Financial-posting entities (vouchers, GL entries) remain owned by MOD-002 Accounting and are not represented here.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

### 11.1 Published

Sprint 4 publishes **no new domain events**. Per Sprint Plan §2, Payroll-lifecycle domain events (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`) are originating-allocated to `SPR-MOD-008-005`. This sprint exercises `ENG-024` only for internal orchestration.

### 11.2 Consumed

Sprint 4 consumes no additional cross-module domain events beyond those already consumed by Sprint 2 for run inputs. Any event name required by the event catalog contract at execution time that is not present is recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Reimbursement and Advance read/write and on availability to Payroll Runs.
- [ ] Every Reimbursement and Advance lifecycle transition produces an audit record via `ENG-004`.
- [ ] Document attachments for Reimbursements are exercised end-to-end via `ENG-007`.
- [ ] Approval routing is exercised end-to-end via `ENG-011` under `ADR-032`, orchestrated by `ENG-010`.
- [ ] Recovery-plan validity, duplicate-attachment prevention, non-negativity, and reversal preconditions are enforced end-to-end via `ENG-012`.
- [ ] Numbering-series allocation for Reimbursement and Advance identifiers is exercised end-to-end via `ENG-017` using series registered in Sprint 1.
- [ ] Denomination and rounding via `ENG-018` uses the Sprint-1 rounding policy.
- [ ] Availability of approved transactions to Sprint 2's input reconciliation surface is exercised end-to-end.
- [ ] Notifications for approval requests, approvals, rejections, and reversals are delivered via `ENG-025`.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-008_SPRINT_PLAN.md` §2 (`SPR-MOD-008-004`):

- Reimbursement and Advance transactions can be raised, approved, and reflected in subsequent payroll runs.
- Document attachments (receipts) are managed via `ENG-007`.
- Approval routing is enforced via `ENG-011`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** Sprint 4 depends on `SPR-MOD-008-001` for numbering series and rounding policy and on `SPR-MOD-008-002` for the Payroll Run input reconciliation surface.
  - **Impact:** Any regression against Sprint 1 or Sprint 2 blocks Sprint 4 availability semantics.
  - **Mitigation:** Treat any regression as a Sprint 1/Sprint 2 defect and re-plan; do not restate Sprint 1 or Sprint 2 semantics here.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Adjustment against a Payroll Run is delivered as an availability contract only; end-to-end consumption during gross computation is exercised by Sprint 2's lifecycle and validated end-to-end at payslip issuance in Sprint 5.
  - **Impact:** Redefining Payroll Run consumption semantics in Sprint 4 would blur ownership boundaries.
  - **Mitigation:** Confine this sprint to the availability contract (§5.4); do not modify Sprint 2 lifecycle.
  - **Status:** Accepted

- **Risk ID:** R-03
  - **Description:** Reimbursement/Advance-owned entities MUST NOT be redefined by downstream modules; HRMS employee/attendance/leave (MOD-007) and financial postings (MOD-002) MUST NOT be authored here.
  - **Impact:** Blurring these ownership boundaries would fragment transaction data and break traceability.
  - **Mitigation:** Enforce the Reimbursement & Advance Authority convention (§1.1.1) and the Payroll ↔ HRMS boundary (§1.1.2) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Sprint 4 publishes no new domain events. If future scope requires an event surface for Reimbursement/Advance approval, it MUST be added through event catalog governance rather than authored here.
  - **Impact:** Publishing an event outside catalog governance would violate the FROZEN Wrapper.
  - **Mitigation:** Defer any new event to a governance pass; keep `ENG-024` usage internal-orchestration only.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Reimbursement/Advance creation invariants; duplicate-attachment prevention; recovery-plan validity; non-negativity; reversal preconditions.
- **Integration** — `ENG-002` authorization; `ENG-004` audit emission on every transition; `ENG-007` document capture; `ENG-010` workflow orchestration; `ENG-011` approval routing; `ENG-012` rules enforcement; `ENG-017` numbering allocation; `ENG-018` currency denomination; `ENG-025` notification delivery.
- **Contract** — Availability contract exposing approved Reimbursement/Advance to Sprint 2's Payroll Run input reconciliation surface, scoped by (tenant, company, employee, period); HRMS baseline read surface for Employee.
- **End-to-end (smoke)** — Reimbursement raise → attach → approve → availability; Advance raise → recovery-plan validate → approve → availability, under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, a document-attachment fixture for `ENG-007`, and an approval-chain fixture for `ENG-011`.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling each Reimbursement and Advance as an explicit state machine (Draft → AwaitingApproval → Approved → Reversed/Cancelled) so audit emission (§5.7) is trivially satisfiable at every transition.
- Consider keying availability projections by `(tenant_id, company_id, employee_id, period)` so Sprint 2's input reconciliation resolves consumption by lookup rather than by scan.
- Consider representing the Advance Recovery Plan as an ordered append-only sequence so recovery accounting remains reproducible under replay.
- Consider content-digest deduplication for Reimbursement Attachments via `ENG-007` so duplicate uploads collapse without failing the parent transaction.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-008-004`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Reimbursement and Advance transaction lifecycles with approval routing, document attachments, availability to Sprint-2 Payroll Runs, and reversal/cancellation (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-008 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the Payroll Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates foundation (Sprint 1), cycles & runs (Sprint 2), statutory (Sprint 3), payslips/disbursement (Sprint 5), analytics (Sprint 6), HRMS-owned entities, financial postings, and identity/permissions — each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-008-005`) begin immediately after this one completes?**
   Yes. `SPR-MOD-008-005` Payslip Generation & Disbursement is the immediate successor per [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) §2 and depends on `SPR-MOD-008-002`, `SPR-MOD-008-003`, and `SPR-MOD-008-004`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-008-001-payroll-foundation-and-salary-structures.md`](./SPR-MOD-008-001-payroll-foundation-and-salary-structures.md), [`./SPR-MOD-008-002-payroll-cycles-and-runs.md`](./SPR-MOD-008-002-payroll-cycles-and-runs.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](../../40-module-baselines/MOD007_HRMS_BASELINE_v1.md)
- Authoritative Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
