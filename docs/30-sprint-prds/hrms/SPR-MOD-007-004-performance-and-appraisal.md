---
title: "SPR-MOD-007-004 — Performance & Appraisal"
summary: "Sprint PRD for HRMS Performance & Appraisal: Appraisal transaction lifecycle, appraiser routing, ratings capture, appraisal completion, and publication of the AppraisalCompleted event."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-14"
sprint_id: "SPR-MOD-007-004"
parent_module: "MOD-007"
parent_sprint_plan: "MOD-007_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "9.3.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-010", "ENG-011", "ENG-012", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "hrms", "mod-007", "performance", "appraisal", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_wrapper_version: "1.0"
execution_wrapper_compatibility: ">=1.0,<2.0"
execution_id: "GT003-MOD007-004-20260714T000700Z-001"
parent_execution_id: "GT003-MOD007-003-20260714T000600Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per Wrapper v1.0 Snapshot Freeze>"
---

# SPR-MOD-007-004 — Performance & Appraisal

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-007 HRMS** under the [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the FROZEN GT-003 Execution Wrapper v1.0. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-007-004` (permanent) |
| Parent Module | `MOD-007` — HRMS |
| Parent Sprint Plan | [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-007-001`](./SPR-MOD-007-001-hrms-foundation-employee-master.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-007-006` (HR analytics consumes performance distribution); MOD-008 Payroll and MOD-017 Analytics react to `AppraisalCompleted`. |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |
| Execution Wrapper | v1.0 (FROZEN) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Appraisal cycle** business process for MOD-007 HRMS: the **Appraisal** transaction lifecycle (initiation, appraiser routing, ratings capture, completion) and publication of the `AppraisalCompleted` domain event on `ENG-024`. Consumes — but does not redefine — the Employee master, org-structure masters, and HRMS configuration authored in `SPR-MOD-007-001`.

> **HRMS Ownership Convention (inherited from `SPR-MOD-007-001` §1.1).** MOD-007 HRMS owns the business semantics of the Appraisal transaction and its state machine. ERP Core Engines provide shared infrastructure but MUST NOT redefine HRMS business rules. **Compensation revision** (including any pay change triggered by an appraisal outcome) remains exclusive to **MOD-008 Payroll**; **HR analytics** (including performance distribution reporting) remains exclusive to **`SPR-MOD-007-006`**; **identity, authentication, and permissions** remain exclusive to **MOD-001 Platform**.

#### 1.1.1 Appraisal Authority

The **Appraisal** transaction is authoritatively owned by MOD-007 HRMS. No other module MAY create, edit, complete, or independently maintain parallel Appraisal transactions. Downstream modules consume Appraisal outcomes via `AppraisalCompleted` events and read APIs; they MUST NOT redefine the Appraisal lifecycle, its approvals, or its state machine.

#### 1.1.2 HRMS ↔ Payroll Boundary (Compensation Revision)

- **Compensation revision** driven by an appraisal outcome is owned by MOD-008 Payroll.
- This sprint publishes `AppraisalCompleted` on completion; it does **not** compute salary revisions, issue pay changes, or write journal entries. Downstream MOD-008 sprints react to `AppraisalCompleted` to perform compensation revision when applicable.

#### 1.1.3 HRMS ↔ Analytics Boundary

- **Performance distribution reporting** and other analytics readouts are owned by `SPR-MOD-007-006`.
- This sprint publishes Appraisal lifecycle events and exposes read APIs consistent with `ADR-011`; it does not author analytics dashboards, exports, or read models.

### 1.2 In Scope

- **Appraisal transaction lifecycle:** create Draft → route via `ENG-010` / `ENG-011` through the configured appraiser chain → capture ratings → Completed / Rejected; audited via `ENG-004`.
- **Appraiser routing:** approval hierarchy resolved through the routing configuration authored in `SPR-MOD-007-001`.
- **Ratings capture:** structured ratings recorded as part of the Appraisal transaction; retained under `ADR-014` audit contract.
- **Appraisal self-approval prohibition:** an employee cannot appraise (approve) their own Appraisal; enforced by `ENG-012`.
- **Notification** via `ENG-025` for appraiser assignment, review reminders, and outcome communication.
- **Domain event published** via `ENG-024`:
  - `AppraisalCompleted` — emitted on Appraisal transaction completion per policy.
- **Audit integration** via `ENG-004` for every Appraisal lifecycle transition (initiate, route, rating capture, complete, reject).

### 1.3 Out of Scope

Reserved for later HRMS sprints or other modules:

- Onboarding Task and Exit Clearance transactions — `SPR-MOD-007-002`.
- Attendance and Leave transactions — `SPR-MOD-007-003`.
- Learning & Development, Employee Self-Service surfaces — `SPR-MOD-007-005`.
- HR read model, HR reports (including Performance Distribution), dashboards, exports, audit-readiness surface — `SPR-MOD-007-006`.
- **Compensation revision** driven by appraisal outcome — owned by **MOD-008 Payroll**.
- **Financial postings** — owned by **MOD-002 Accounting** via `ENG-015` / `ENG-016`.
- **Identity provisioning / deprovisioning and permissions** — owned by **MOD-001 Platform**.
- Editing or redefining any master authored in `SPR-MOD-007-001` (Employee, Position, Department, Grade, Shift, HRMS configuration).

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-007-004`, the following will exist:

- **Business capabilities.**
  - An HR administrator or manager can initiate an Appraisal transaction for an employee.
  - Appraisals are routed through the configured appraiser chain via `ENG-010` / `ENG-011`.
  - Appraisers can capture ratings and complete the appraisal, driving the state machine to `Completed`.
  - Appraisal self-approval is prevented via `ENG-012`.
  - On completion, `AppraisalCompleted` is published via `ENG-024`.
- **Event contracts.** `AppraisalCompleted` is published via `ENG-024` per the authoritative event catalog. Payload shape, envelope, and delivery guarantees are governed by [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).
- **Audit artifacts.** Every Appraisal lifecycle transition produces an audit record via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-007-004`.
- **Migration artifacts.** *N/A at PRD authoring time.*

---

## 3. Traceability to Module PRD

| MOD-007 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Performance and appraisal; submodule Performance | Appraisal transaction lifecycle |
| §3 Personas — HR Business Partner, HR Manager, Employee, Manager | User stories (§4) |
| §4 Business Processes — Appraisal cycle | State machine and appraiser routing |
| §6 Transactions — Appraisal | Appraisal transaction authored here |
| §7 Business Rules — Appraisal self-approval prohibited | Rule registered via `ENG-012` |
| §8 Integration Points — `AppraisalCompleted` (published) | Event via `ENG-024` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. **No capability introduced in this Sprint PRD is outside the approved HRMS Module PRD.**

### 3.1 Capability Allocation Compliance

Per [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) §4.1:

| Capability | Origin Sprint |
| --- | --- |
| Performance and appraisal (§2) | `SPR-MOD-007-004` |

The Appraisal transaction is originating-allocated to this sprint per Sprint Plan §4.3. `AppraisalCompleted` is an originating-allocated event contract per Sprint Plan §4 / §8.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Performance and appraisal* → this Sprint PRD → deliverables in §2 (Appraisal transaction lifecycle, appraiser routing, ratings capture, `AppraisalCompleted` event, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an HR administrator or manager, I want to initiate an Appraisal transaction for an employee, so that the appraisal cycle begins deterministically under the configured routing.*
- **US-002.** *As an approver in the appraiser chain, I want the Appraisal routed to me via `ENG-010` / `ENG-011`, so that decisions align with company policy.*
- **US-003.** *As an appraiser, I want to capture structured ratings as part of the Appraisal transaction, so that outcomes are recorded and auditable.*
- **US-004.** *As an appraiser identical to the employee under appraisal, I want to be blocked from approving my own Appraisal, so that segregation of duties is preserved.*
- **US-005.** *As an HR administrator, I want completed Appraisals to publish `AppraisalCompleted` via `ENG-024`, so that downstream consumers (compensation revision, analytics) can react.*
- **US-006.** *As a security reviewer, I want every Appraisal lifecycle transition to be audited via `ENG-004`.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Appraisal initiation (US-001)

- **Given** an active Employee within a tenant/company,
  **when** an HR admin or manager initiates an Appraisal transaction,
  **then** the transaction is persisted in `Draft` under the acting tenant/company, uniquely identified, and audited.

### 5.2 Appraiser routing (US-002)

- **Given** an Appraisal in `Draft`,
  **when** it is submitted for routing,
  **then** it is routed through the configured appraiser chain via `ENG-010` / `ENG-011`, and every transition is audited.

### 5.3 Ratings capture (US-003)

- **Given** an Appraisal awaiting an appraiser's action,
  **when** the appraiser captures ratings and submits,
  **then** the ratings are persisted with the Appraisal, the state advances per the configured routing, and the transition is audited.

### 5.4 Self-approval prohibition (US-004)

- **Given** an appraiser identical to the Employee referenced by an Appraisal,
  **when** an approval / completion action is attempted,
  **then** the action is rejected deterministically via `ENG-012` and audited as a rejected attempt.

### 5.5 Appraisal completion and event publication (US-005)

- **Given** an Appraisal in the completed terminal state,
  **when** completion finalizes,
  **then** `AppraisalCompleted` is published via `ENG-024` per the authoritative event catalog, and the transition is audited.

### 5.6 Audit integration (US-006)

- **Given** any Appraisal lifecycle transition (initiate, route, rating capture, complete, reject),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.7 Isolation invariants (`ADR-011`)

- **Given** any Appraisal read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.8 Ownership consumption invariants

- **Given** any Appraisal transaction,
  **when** it references an Employee, Position, Department, Grade, or approver hierarchy,
  **then** it consumes those masters read-only from `SPR-MOD-007-001`; no re-definition occurs.
- **Given** completion of an Appraisal that would drive a compensation revision,
  **when** `AppraisalCompleted` is emitted,
  **then** compensation revision remains the responsibility of MOD-008 Payroll; this sprint MUST NOT compute pay changes or write journal entries.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-007` — HRMS.
- **Module PRD:** [`docs/20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md).
- **Upstream Sprint (Stage 2):** [`SPR-MOD-007-001`](./SPR-MOD-007-001-hrms-foundation-employee-master.md).
- **Module PRD sections fulfilled:** §2 (Performance and appraisal; submodule Performance), §3 (personas), §4 (Appraisal cycle), §6 (Appraisal), §7 (Appraisal self-approval prohibited), §8 (`AppraisalCompleted` published), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-007` MODULE_PRD.
- **Upstream module baselines:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen).
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-007-001` (Employee/Position/Department/Grade masters, approval hierarchies).
- **Cross-module consumption (events only):** None.
- **Downstream sprints:** `SPR-MOD-007-006` (HR analytics consumes performance distribution). Cross-module consumers of `AppraisalCompleted`: MOD-008 Payroll (compensation revision), MOD-017 Analytics.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at v1.1 (Active). Execution Wrapper v1.0 (FROZEN) applies, compatibility `>=1.0,<2.0`.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (§1.1). Each engine matches Sprint Plan §SPR-MOD-007-004 verbatim.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Appraisal actions and appraiser routing. |
| `ENG-004` Audit | Records every Appraisal lifecycle transition. |
| `ENG-010` Workflow | Executes the Appraisal state machine (Draft → Completed / Rejected). |
| `ENG-011` Approval | Routes Appraisals through the configured appraiser chain authored in `SPR-MOD-007-001`. |
| `ENG-012` Rules | Enforces the Appraisal self-approval prohibition. |
| `ENG-024` Eventing | Publishes `AppraisalCompleted` per the authoritative event catalog. |
| `ENG-025` Notification | Notifies appraisers, initiators, and downstream systems of Appraisal transitions. |

HRMS business semantics (Appraisal transaction, ratings capture, appraiser routing) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Appraisal read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Appraisal actions and appraiser routing. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Appraisal | MOD-007 (this sprint) | Appraisal transaction scoped to an Employee, routed through appraisers, retaining structured ratings. |

### 10.2 Relationships

- An **Appraisal** transaction references exactly one **Employee** within the same company.
- An **Appraisal** references appraisers resolved through the routing configuration authored in `SPR-MOD-007-001`.

### 10.3 Ownership Boundaries

- The Appraisal transaction is owned by `MOD-007` per §1.1.
- Employee and org-structure masters remain owned by `SPR-MOD-007-001`; this sprint does not redefine them.
- Compensation-revision entities are owned by MOD-008 Payroll.
- Analytics read models are owned by `SPR-MOD-007-006`.

Physical schema is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).

### 11.1 Published

- **`AppraisalCompleted`** — emitted on Appraisal transaction completion per policy. Origin sprint: `SPR-MOD-007-004` per Sprint Plan §2 / §8. Downstream consumers include MOD-008 (compensation revision), MOD-017 (analytics), and `SPR-MOD-007-006`.

Payload contract, envelope, versioning, and delivery guarantees are governed by the authoritative event catalog. This sprint does not redefine them.

### 11.2 Consumed

Sprint 4 consumes **no cross-module domain events**.

### 11.3 Event-Catalog Registration

`AppraisalCompleted` is declared in Module PRD §8 and Sprint Plan §2 / §8 as originating from this sprint. If the name is not yet present in the authoritative event catalog at authoring time, the shortfall is recorded as a deferred `R-EV-*` risk in §14 per Wrapper v1.0 event-resolution policy; the event catalog is not modified by this Sprint PRD.

---

## 12. Definition of Done

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Appraisal read and write.
- [ ] Every lifecycle transition produces an audit record via `ENG-004`.
- [ ] `AppraisalCompleted` is emitted via `ENG-024` per the authoritative event catalog.
- [ ] Self-approval prohibition is enforced via `ENG-012` and audited on rejection.
- [ ] Appraiser routing resolves deterministically via `ENG-010` / `ENG-011`.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-007_SPRINT_PLAN.md` §2 (`SPR-MOD-007-004`):

- Appraisal transactions can be initiated, routed through appraisers, and completed.
- Appraisal self-approval is prevented via `ENG-012`.
- `AppraisalCompleted` events are published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **Risk ID:** R-01
  - **Description:** This sprint depends on `SPR-MOD-007-001` masters and HRMS configuration (approval hierarchies).
  - **Impact:** Any Sprint 1 regression blocks execution.
  - **Mitigation:** Consume Sprint 1 outputs read-only; treat regressions as defects.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Compensation revision and analytics are out of scope; scope-creep would violate HRMS ↔ Payroll / Analytics boundaries.
  - **Impact:** Duplicated ownership and traceability loss.
  - **Mitigation:** Enforce §1.1.2 and §1.1.3.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time.
  - **Impact:** Non-Accepted status would invalidate this sprint's contract.
  - **Mitigation:** Re-plan if acceptance status changes.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Appraiser chain configurations MAY drift mid-cycle.
  - **Impact:** Ambiguous routing at completion.
  - **Mitigation:** Bind routing resolution to the appraiser configuration version referenced at Appraisal initiation.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** `AppraisalCompleted` is declared authoritatively in Module PRD §8 and Sprint Plan §2 / §8. The event-catalog file is a repository stub at authoring time and does not yet enumerate this event name.
  - **Impact:** Publishers cannot emit and consumers cannot subscribe until catalog registration occurs.
  - **Mitigation:** Recorded as a **Deferred Repository Risk (Events)** per Wrapper v1.0 event-resolution policy. Register via the event-catalog governance process before implementation begins.
  - **Status:** Deferred

- **Risk ID:** R-EV-02
  - **Description:** Cross-module reactions to `AppraisalCompleted` (MOD-008 compensation revision, MOD-017 analytics) depend on downstream sprint subscription.
  - **Impact:** Late subscription would delay revision and analytics.
  - **Mitigation:** Publication is complete once this sprint delivers; subscription is scoped to each consumer sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

- **Unit** — Appraisal validation; self-approval rule; ratings-capture invariants.
- **Integration** — appraiser routing via `ENG-010` / `ENG-011`; audit emission via `ENG-004`; event emission via `ENG-024`.
- **Contract** — `AppraisalCompleted` payload contract against the authoritative event catalog (once registered).
- **End-to-end (smoke)** — Appraisal happy-path (initiate → route → rate → complete) under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture and an event-recorder for `ENG-024` assertions.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance. They MUST NOT introduce new business requirements, ADRs, or engine behavior.*

- Consider binding appraiser routing resolution to the configuration version captured at Appraisal initiation so mid-cycle policy edits do not retroactively change decided routings.
- Consider a small envelope validator for `AppraisalCompleted` so contract regressions are caught locally.
- Consider deterministic idempotency keys on appraiser action submissions to prevent duplicate rating writes.

Non-authoritative.

---

## 17. Review Gate

1. **Does the sprint have exactly one objective?** Yes. Deliver the Appraisal lifecycle and publish `AppraisalCompleted`.
2. **Does every feature trace to a specific Module PRD section?** Yes. §3 and §3.2.
3. **Are engines and ADRs consumed rather than redefined?** Yes. §8 / §9.
4. **Are out-of-scope items enumerated and linked to their owning sprints?** Yes. §1.3.
5. **Are acceptance criteria objective and testable?** Yes. §5 uses Given/When/Then.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?** Yes. §2, §12, §13.
7. **Does the next reserved sprint (`SPR-MOD-007-005`) begin immediately after this one completes?** Yes. Sprint 5 depends on `SPR-MOD-007-001` and `SPR-MOD-007-003` per Sprint Plan §3.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- Parent Module Sprint Plan — [`./MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md)
- Upstream Sprint PRD — [`./SPR-MOD-007-001-hrms-foundation-employee-master.md`](./SPR-MOD-007-001-hrms-foundation-employee-master.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Event Catalog (authoritative) — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
