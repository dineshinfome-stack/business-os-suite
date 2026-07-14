---
title: "SPR-MOD-007-003 — Attendance & Leave"
summary: "Sprint PRD for HRMS Attendance & Leave: Leave Type master, Attendance transaction, Leave Request transaction, leave balances, biometric ingestion, leave policy configuration, and publication of AttendanceMarked / LeaveApproved events."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-14"
sprint_id: "SPR-MOD-007-003"
parent_module: "MOD-007"
parent_sprint_plan: "MOD-007_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "9.3.2"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-023", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "hrms", "mod-007", "attendance", "leave", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_wrapper_version: "1.0"
execution_wrapper_compatibility: ">=1.0,<2.0"
execution_id: "GT003-MOD007-003-20260714T000600Z-001"
parent_execution_id: "GT003-MOD007-002-20260714T000500Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per Wrapper v1.0 Snapshot Freeze>"
---

# SPR-MOD-007-003 — Attendance & Leave

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-007 HRMS** under the [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the FROZEN GT-003 Execution Wrapper v1.0. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-007-003` (permanent) |
| Parent Module | `MOD-007` — HRMS |
| Parent Sprint Plan | [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-007-001`](./SPR-MOD-007-001-hrms-foundation-employee-master.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-007-005` (self-service consumes attendance/leave surfaces), `SPR-MOD-007-006` (analytics) |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |
| Execution Wrapper | v1.0 (FROZEN) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Timesheet-to-attendance** and **Leave request-to-approval** business processes for MOD-007 HRMS: the **Leave Type** master lifecycle, the **Attendance** and **Leave Request** transaction lifecycles, leave balance computation, biometric device ingestion via `ENG-023`, and publication of the `AttendanceMarked` and `LeaveApproved` domain events on `ENG-024`. Leave policy configuration is resolved via `ENG-005`. Consumes — but does not redefine — the Employee master, org-structure masters, and HRMS configuration authored in `SPR-MOD-007-001`.

> **HRMS Ownership Convention (inherited from `SPR-MOD-007-001` §1.1).** MOD-007 HRMS owns the business semantics of the Leave Type master, Attendance and Leave Request transactions, leave balance computation, and leave policy configuration. ERP Core Engines provide shared infrastructure but MUST NOT redefine HRMS business rules. Payroll processing (including leave-encashment earnings/deductions) remains exclusive to **MOD-008 Payroll**; financial postings for leave-encashment settlement remain exclusive to **MOD-002 Accounting**; identity, authentication, and permissions remain exclusive to **MOD-001 Platform**.

#### 1.1.1 Attendance & Leave Authority

The **Leave Type** master, the **Attendance** transaction, and the **Leave Request** transaction are authoritatively owned by MOD-007 HRMS. No other module MAY create, edit, complete, or independently maintain parallel Attendance or Leave Request transactions. Downstream modules consume these lifecycles via `AttendanceMarked` / `LeaveApproved` events and read APIs; they MUST NOT redefine those transactions, their approvals, or their state machines.

#### 1.1.2 HRMS ↔ Payroll and Accounting Boundary (Leave Encashment)

- **Leave-encashment financial computation** is owned by MOD-008 Payroll (earnings/deductions) and **leave-encashment settlement posting** by MOD-002 Accounting (via `ENG-015` / `ENG-016`).
- This sprint publishes `LeaveApproved` and computes leave balances on the HRMS side; it does **not** compute encashment earnings/deductions or write journal entries. Downstream MOD-008 / MOD-002 sprints react to `LeaveApproved` to perform settlement when applicable.

#### 1.1.3 HRMS ↔ Biometric Boundary

Biometric devices are **external** systems consumed via `ENG-023` Integration; they are not modeled as HRMS-owned entities. This sprint receives biometric events and converts them into Attendance transactions via `ENG-023` / `ENG-013`.

### 1.2 In Scope

- **Leave Type master lifecycle:** create, edit, archive; per-type policy attributes including whether a negative leave balance is permitted.
- **Attendance transaction lifecycle:** manual capture and biometric ingestion via `ENG-023`; state machine executed via `ENG-010`; audit via `ENG-004`.
- **Leave Request transaction lifecycle:** create Draft → route via `ENG-010` / `ENG-011` → Approved / Rejected; on Approved, adjust leave balance; audited via `ENG-004`.
- **Leave balance computation:** derived from Leave Type configuration and prior Leave Requests; enforced by `ENG-012` (balance cannot go negative unless the Leave Type permits it).
- **Self-approval prohibition:** an employee cannot approve their own Leave Request; enforced by `ENG-012`.
- **Leave policy configuration** via `ENG-005` (referenced by Leave Request approvals and balance rules).
- **Biometric device ingestion** via `ENG-023` — inbound events converted to Attendance transactions with idempotent handling.
- **Scheduling** via `ENG-014` for periodic accrual and cutoff-driven computations.
- **Automation** via `ENG-013` for deterministic follow-on actions (e.g. auto-create Attendance from biometric event, balance adjustment on approval).
- **Notification** via `ENG-025` for approver assignment, leave decisions, and biometric-ingestion failures.
- **Domain events published** via `ENG-024`:
  - `AttendanceMarked` — emitted on Attendance transaction persistence per policy.
  - `LeaveApproved` — emitted on Leave Request Approved.
- **Audit integration** via `ENG-004` for every Leave Type / Attendance / Leave Request / balance-adjustment lifecycle transition.

### 1.3 Out of Scope

Reserved for later HRMS sprints or other modules:

- Onboarding Task and Exit Clearance transactions — `SPR-MOD-007-002`.
- Appraisal transaction lifecycle — `SPR-MOD-007-004`.
- Learning & Development, Employee Self-Service surfaces — `SPR-MOD-007-005` (self-service reads attendance/leave surfaces delivered here).
- HR read model, HR reports, dashboards, exports, audit-readiness surface — `SPR-MOD-007-006`.
- **Payroll processing**, including leave-encashment earnings/deductions and payslip issuance — owned by **MOD-008 Payroll**.
- **Financial postings**, including leave-encashment settlement journal entries — owned by **MOD-002 Accounting** via `ENG-015` / `ENG-016`.
- **Identity provisioning / deprovisioning and permissions** — owned by **MOD-001 Platform**.
- Editing or redefining any master authored in `SPR-MOD-007-001` (Employee, Position, Department, Grade, Shift, HRMS configuration).

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-007-003`, the following will exist:

- **Business capabilities.**
  - An HR administrator can create, edit, and archive Leave Types under a tenant/company.
  - Attendance can be captured manually and ingested from biometric devices via `ENG-023`, producing Attendance transactions and (per policy) `AttendanceMarked` events.
  - An employee can raise a Leave Request; approvers route it through the approval hierarchy; on approval, the leave balance is adjusted and `LeaveApproved` is published.
  - Leave balances cannot go negative unless the Leave Type permits it (`ENG-012`).
  - Employees cannot approve their own Leave Requests (`ENG-012`).
  - Leave policy configuration resolves deterministically per company through `ENG-005`.
- **Event contracts.** `AttendanceMarked` and `LeaveApproved` are published via `ENG-024` per the authoritative event catalog. Payload shape, envelope, and delivery guarantees are governed by [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).
- **Audit artifacts.** Every Leave Type / Attendance / Leave Request / balance-adjustment lifecycle transition produces an audit record via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-007-003`.
- **Migration artifacts.** *N/A at PRD authoring time.*

---

## 3. Traceability to Module PRD

| MOD-007 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Attendance and leave; submodules Attendance, Leave | Leave Type master, Attendance and Leave Request transactions, balances |
| §3 Personas — HR Business Partner, HR Manager, Employee, Manager | User stories (§4) |
| §4 Business Processes — Timesheet-to-attendance, Leave request-to-approval | State machines and approvals |
| §5 Master Data — Leave Type | Leave Type master lifecycle |
| §6 Transactions — Attendance, Leave Request | Both transactions authored here |
| §7 Business Rules — Leave balance non-negative unless permitted; self-approval prohibited | Rules registered via `ENG-012` |
| §8 Integration Points — `AttendanceMarked`, `LeaveApproved` (published); Biometric (external) | Events via `ENG-024`; biometric via `ENG-023` |
| §10 Configuration — Leave policies | Leave policy configuration via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. **No capability introduced in this Sprint PRD is outside the approved HRMS Module PRD.**

### 3.1 Capability Allocation Compliance

Per [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) §4.1:

| Capability | Origin Sprint |
| --- | --- |
| Attendance and leave (§2) | `SPR-MOD-007-003` |

Leave Type master, Attendance transaction, and Leave Request transaction are each originating-allocated to this sprint per Sprint Plan §4.3. `AttendanceMarked` and `LeaveApproved` are originating-allocated event contracts per Sprint Plan §4 / §8.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Attendance and leave* → this Sprint PRD → deliverables in §2 (Leave Type master, Attendance transaction, Leave Request transaction, leave balance computation, biometric ingestion, `AttendanceMarked` / `LeaveApproved` events, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an HR administrator, I want to create, edit, and archive Leave Types (including a per-type flag permitting negative balances), so that leave policies are configurable per company.*
- **US-002.** *As an HR administrator or manager, I want to capture attendance manually and ingest biometric events, so that daily attendance is deterministic and auditable.*
- **US-003.** *As an employee, I want to raise a Leave Request against an existing Leave Type, so that my absences are approved and reflected in my leave balance.*
- **US-004.** *As an approver, I want to route Leave Requests through the configured approval hierarchy, so that decisions align with company policy.*
- **US-005.** *As an approver identical to the requesting employee, I want to be blocked from approving my own Leave Request, so that segregation of duties is preserved.*
- **US-006.** *As an HR administrator, I want leave balances to be prevented from going negative unless the Leave Type permits it, so that policy is enforced deterministically.*
- **US-007.** *As an HR administrator, I want leave policy configuration to resolve deterministically per company through `ENG-005`, so that downstream approvals and balances behave consistently.*
- **US-008.** *As a security reviewer, I want every Leave Type / Attendance / Leave Request / balance-adjustment lifecycle transition to be audited via `ENG-004`.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Leave Type master (US-001)

- **Given** a valid Leave Type creation request under a tenant/company (including the negative-balance-permitted flag),
  **when** an HR admin submits it,
  **then** the Leave Type is persisted with a stable identifier, uniquely identified within the company, and audited.
- **Given** an active Leave Type with dependent Leave Requests,
  **when** archival is attempted,
  **then** archival is either permitted with a clean lifecycle transition or rejected deterministically.

### 5.2 Attendance capture and biometric ingestion (US-002)

- **Given** an active Employee within a tenant/company,
  **when** an HR admin or manager captures attendance manually,
  **then** an Attendance transaction is persisted, `AttendanceMarked` is published per policy via `ENG-024`, and the transition is audited.
- **Given** a biometric event received via `ENG-023`,
  **when** it is ingested,
  **then** an Attendance transaction is created idempotently, `AttendanceMarked` is published per policy, and the transition is audited.

### 5.3 Leave Request lifecycle (US-003, US-004)

- **Given** an active Employee and an active Leave Type under the same company,
  **when** the employee creates a Leave Request,
  **then** the transaction is persisted in `Draft`, routed through the configured approval hierarchy via `ENG-010` / `ENG-011`, and audited.
- **Given** a Leave Request in the approved terminal state,
  **when** approval completes,
  **then** the leave balance is adjusted, `LeaveApproved` is published via `ENG-024` per the authoritative event catalog, and the transition is audited.

### 5.4 Self-approval prohibition (US-005)

- **Given** an approver identical to the Employee referenced by a Leave Request,
  **when** an approval action is attempted,
  **then** the action is rejected deterministically via `ENG-012` and audited as a rejected attempt.

### 5.5 Leave balance rule (US-006)

- **Given** a Leave Request whose approval would drive the leave balance negative,
  **when** approval is attempted and the referenced Leave Type does **not** permit negative balances,
  **then** the approval is rejected deterministically via `ENG-012` and audited.
- **Given** a Leave Request whose approval would drive the leave balance negative and the referenced Leave Type **does** permit negative balances,
  **when** approval completes,
  **then** the balance is adjusted (potentially negative) and the transition is audited.

### 5.6 Leave policy configuration (US-007)

- **Given** a company under an active tenant,
  **when** leave policy configuration is registered,
  **then** it resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.

### 5.7 Audit integration (US-008)

- **Given** any Leave Type / Attendance / Leave Request / balance-adjustment lifecycle transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.8 Isolation invariants (`ADR-011`)

- **Given** any Attendance / Leave Request read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.9 Ownership consumption invariants

- **Given** any Attendance or Leave Request transaction,
  **when** it references an Employee, Position, Department, Grade, or Shift,
  **then** it consumes those masters read-only from `SPR-MOD-007-001`; no re-definition occurs.
- **Given** completion of a Leave Request that triggers leave-encashment settlement,
  **when** `LeaveApproved` is emitted,
  **then** encashment financial computation and posting remain the responsibility of MOD-008 / MOD-002 respectively; this sprint MUST NOT compute earnings/deductions or write journal entries.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-007` — HRMS.
- **Module PRD:** [`docs/20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md).
- **Upstream Sprint (Stage 2):** [`SPR-MOD-007-001`](./SPR-MOD-007-001-hrms-foundation-employee-master.md).
- **Module PRD sections fulfilled:** §2 (Attendance and leave), §3 (personas), §4 (Timesheet-to-attendance, Leave request-to-approval), §5 (Leave Type), §6 (Attendance, Leave Request), §7 (leave balance rule; self-approval prohibition), §8 (`AttendanceMarked`, `LeaveApproved` published; Biometric external), §10 (Leave policies), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-007` MODULE_PRD.
- **Upstream module baselines:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen).
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-007-001` (Employee/Position/Department/Grade/Shift masters, approval hierarchies, shift patterns).
- **Cross-module consumption (events only):** None. Biometric is an *external* integration via `ENG-023`, not a cross-module event.
- **Downstream sprints:** `SPR-MOD-007-005` (self-service consumes attendance/leave surfaces), `SPR-MOD-007-006` (HR analytics consumes attendance and leave data).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at v1.1 (Active). Execution Wrapper v1.0 (FROZEN) applies, compatibility `>=1.0,<2.0`.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (§1.1). Each engine matches Sprint Plan §SPR-MOD-007-003 verbatim.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Leave Type / Attendance / Leave Request actions. |
| `ENG-004` Audit | Records every Leave Type / Attendance / Leave Request / balance-adjustment lifecycle transition. |
| `ENG-005` Configuration | Resolves leave policy configuration under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-010` Workflow | Executes the Leave Request state machine (Draft → Approved / Rejected). |
| `ENG-011` Approval | Routes Leave Requests through approval hierarchies authored in `SPR-MOD-007-001`. |
| `ENG-012` Rules | Enforces the leave-balance-non-negative rule (unless the Leave Type permits) and the self-approval prohibition. |
| `ENG-013` Automation | Executes deterministic follow-on actions (e.g. balance adjustment on approval; auto-create Attendance from biometric events). |
| `ENG-014` Scheduler | Executes periodic accrual and cutoff-driven leave-balance computations. |
| `ENG-023` Integration | Ingests biometric device events. |
| `ENG-024` Eventing | Publishes `AttendanceMarked` and `LeaveApproved` per the authoritative event catalog. |
| `ENG-025` Notification | Notifies approvers, initiators, and downstream systems of transaction transitions. |

HRMS business semantics (Leave Type, Attendance, Leave Request, balance computation) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Attendance / Leave Request read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to attendance/leave actions and approver routing. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Leave Type | MOD-007 (this sprint) | Named leave category with policy attributes (including negative-balance-permitted flag). |
| Attendance | MOD-007 (this sprint) | Attendance transaction scoped to an Employee and a date/window. |
| Leave Request | MOD-007 (this sprint) | Employee-initiated leave transaction routed through approvals. |
| Leave Balance | MOD-007 (this sprint) | Derived balance per (Employee, Leave Type), maintained by approvals and scheduler runs. |

### 10.2 Relationships

- A **Leave Type** is scoped to a company.
- An **Attendance** transaction references exactly one **Employee** within the same company.
- A **Leave Request** references exactly one **Employee** and exactly one **Leave Type** within the same company.
- A **Leave Balance** is derived per (Employee, Leave Type) from Leave Type configuration and prior Leave Requests.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-007` per §1.1.
- Employee and org-structure masters remain owned by `SPR-MOD-007-001`; this sprint does not redefine them.
- Payroll and posting entities are owned by MOD-008 and MOD-002 respectively.

Physical schema is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).

### 11.1 Published

- **`AttendanceMarked`** — emitted on Attendance transaction persistence per policy. Origin sprint: `SPR-MOD-007-003` per Sprint Plan §2 / §8.
- **`LeaveApproved`** — emitted on Leave Request Approved. Origin sprint: `SPR-MOD-007-003` per Sprint Plan §2 / §8. Downstream consumers include MOD-008 (leave-encashment trigger when applicable), MOD-017 (analytics), and `SPR-MOD-007-006`.

Payload contract, envelope, versioning, and delivery guarantees are governed by the authoritative event catalog. This sprint does not redefine them.

### 11.2 Consumed

Sprint 3 consumes **no cross-module domain events**. Biometric ingestion is an *external* integration via `ENG-023`, not a cross-module event subscription.

### 11.3 Event-Catalog Registration

`AttendanceMarked` and `LeaveApproved` are declared in Module PRD §8 and Sprint Plan §2 / §8 as originating from this sprint. If a name is not yet present in the authoritative event catalog at authoring time, the shortfall is recorded as a deferred `R-EV-*` risk in §14 per Wrapper v1.0 event-resolution policy; the event catalog is not modified by this Sprint PRD.

---

## 12. Definition of Done

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every attendance/leave read and write.
- [ ] Every lifecycle transition produces an audit record via `ENG-004`.
- [ ] `AttendanceMarked` and `LeaveApproved` are emitted via `ENG-024` per the authoritative event catalog.
- [ ] Self-approval prohibition and leave-balance-non-negative rule are enforced via `ENG-012` and audited on rejection.
- [ ] Leave policy configuration resolves deterministically via `ENG-005`.
- [ ] Biometric events are ingested idempotently via `ENG-023`.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-007_SPRINT_PLAN.md` §2 (`SPR-MOD-007-003`):

- Attendance can be captured (manual and via biometric ingestion) and Leave Requests can be raised, approved, and reflected in leave balances.
- Leave balance rule and self-approval rule are enforced via `ENG-012`.
- `AttendanceMarked` and `LeaveApproved` events are published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **Risk ID:** R-01
  - **Description:** This sprint depends on `SPR-MOD-007-001` masters and HRMS configuration (approval hierarchies, shift patterns).
  - **Impact:** Any Sprint 1 regression blocks execution.
  - **Mitigation:** Consume Sprint 1 outputs read-only; treat regressions as defects.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Leave-encashment computation and posting are out of scope; scope-creep would violate HRMS ↔ Payroll / Accounting boundaries.
  - **Impact:** Duplicated ownership and traceability loss.
  - **Mitigation:** Enforce §1.1.2.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time.
  - **Impact:** Non-Accepted status would invalidate this sprint's contract.
  - **Mitigation:** Re-plan if acceptance status changes.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Biometric providers vary in protocol and delivery guarantees.
  - **Impact:** Duplicate or missing Attendance events.
  - **Mitigation:** Idempotent ingestion via `ENG-023`; deterministic dedup keyed by (Employee, timestamp, device).
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Leave balance semantics MAY drift with policy edits mid-cycle.
  - **Impact:** Ambiguous balances at cutoff.
  - **Mitigation:** Balance derivation via `ENG-013` / `ENG-014` bound to the Leave Type version referenced at approval time.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** `AttendanceMarked` and `LeaveApproved` are declared authoritatively in Module PRD §8 and Sprint Plan §2 / §8. The event-catalog file is a repository stub at authoring time and does not yet enumerate these event names.
  - **Impact:** Publishers cannot emit and consumers cannot subscribe until catalog registration occurs.
  - **Mitigation:** Recorded as a **Deferred Repository Risk (Events)** per Wrapper v1.0 event-resolution policy. Register via the event-catalog governance process before implementation begins.
  - **Status:** Deferred

- **Risk ID:** R-EV-02
  - **Description:** Cross-module reactions to `LeaveApproved` (MOD-008 leave-encashment, MOD-017 analytics) depend on downstream sprint subscription.
  - **Impact:** Late subscription would delay settlement and analytics.
  - **Mitigation:** Publication is complete once this sprint delivers; subscription is scoped to each consumer sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

- **Unit** — Leave Type validation; leave-balance-non-negative rule; self-approval rule; Attendance idempotent ingestion.
- **Integration** — approvals routing via `ENG-010` / `ENG-011`; audit emission via `ENG-004`; configuration resolution via `ENG-005`; event emission via `ENG-024`; biometric ingestion via `ENG-023`; scheduled accrual via `ENG-014`.
- **Contract** — `AttendanceMarked` / `LeaveApproved` payload contract against the authoritative event catalog (once registered).
- **End-to-end (smoke)** — attendance capture (manual + biometric) and leave-request approval happy-paths under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture, a biometric-stub for `ENG-023`, and an event-recorder for `ENG-024` assertions.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance. They MUST NOT introduce new business requirements, ADRs, or engine behavior.*

- Consider deterministic dedup keys `(employee_id, timestamp, device_id)` for biometric ingestion.
- Consider a materialized leave-balance view refreshed by `ENG-013` on approval and by `ENG-014` at cutoff.
- Consider binding balance computation to the Leave Type version referenced at approval time so mid-cycle policy edits do not retroactively change decided balances.
- Consider a small envelope validator for `AttendanceMarked` / `LeaveApproved` so contract regressions are caught locally.

Non-authoritative.

---

## 17. Review Gate

1. **Does the sprint have exactly one objective?** Yes. Deliver Attendance & Leave lifecycles and publish `AttendanceMarked` / `LeaveApproved`.
2. **Does every feature trace to a specific Module PRD section?** Yes. §3 and §3.2.
3. **Are engines and ADRs consumed rather than redefined?** Yes. §8 / §9.
4. **Are out-of-scope items enumerated and linked to their owning sprints?** Yes. §1.3.
5. **Are acceptance criteria objective and testable?** Yes. §5 uses Given/When/Then.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?** Yes. §2, §12, §13.
7. **Does the next reserved sprint (`SPR-MOD-007-004`) begin immediately after this one completes?** Yes. Sprint 4 depends only on `SPR-MOD-007-001` and MAY run in parallel with or after Sprints 2/3 per Sprint Plan §3.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- Parent Module Sprint Plan — [`./MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-007-001-hrms-foundation-employee-master.md`](./SPR-MOD-007-001-hrms-foundation-employee-master.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Event Catalog (authoritative) — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
