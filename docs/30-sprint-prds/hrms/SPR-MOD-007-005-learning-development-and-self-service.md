---
title: "SPR-MOD-007-005 — Learning & Development and Self-Service"
summary: "Sprint PRD for HRMS Learning & Development and Employee Self-Service: consumes TrainingCompleted from external learning platforms and delivers self-service surfaces (profile, leave initiation, attendance view, HR documents) scoped to the acting employee."
layer: "delivery"
owner: "People"
status: "Draft"
updated: "2026-07-14"
sprint_id: "SPR-MOD-007-005"
parent_module: "MOD-007"
parent_sprint_plan: "MOD-007_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "9.3.4"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-013", "ENG-023", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "hrms", "mod-007", "learning-and-development", "self-service", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_wrapper_version: "1.0"
execution_wrapper_compatibility: ">=1.0,<2.0"
execution_id: "GT003-MOD007-005-20260714T000800Z-001"
parent_execution_id: "GT003-MOD007-004-20260714T000700Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per Wrapper v1.0 Snapshot Freeze>"
---

# SPR-MOD-007-005 — Learning & Development and Self-Service

> **Stage 2 deliverable.** Fifth authored Sprint PRD for **MOD-007 HRMS** under the [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the FROZEN GT-003 Execution Wrapper v1.0. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-007-005` (permanent) |
| Parent Module | `MOD-007` — HRMS |
| Parent Sprint Plan | [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-007-001`](./SPR-MOD-007-001-hrms-foundation-employee-master.md), [`SPR-MOD-007-003`](./SPR-MOD-007-003-attendance-and-leave.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | [`SPR-MOD-007-006`](./MOD-007_SPRINT_PLAN.md) (HR analytics consumes L&D and self-service surfaces read-only). |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |
| Execution Wrapper | v1.0 (FROZEN) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver **Learning & Development (L&D) consumption** and **Employee Self-Service** for MOD-007 HRMS: consume `TrainingCompleted` domain events from external learning platforms and record them against the employee master, and expose employee-facing HR surfaces (profile, leave request initiation, attendance summary view, HR document access) scoped to the acting employee. Consumes — but does not redefine — the Employee master, org-structure masters, HRMS configuration, Attendance transactions, and Leave Request transactions authored in `SPR-MOD-007-001` and `SPR-MOD-007-003`.

> **HRMS Ownership Convention (inherited from `SPR-MOD-007-001` §1.1).** MOD-007 HRMS owns the business semantics of L&D consumption records and self-service surfaces. ERP Core Engines provide shared infrastructure but MUST NOT redefine HRMS business rules. **Learning content authoring and hosting** remain exclusive to **external learning platforms** (integration only, via `ENG-023`); **identity, authentication, and permissions** remain exclusive to **MOD-001 Platform**; **HR analytics** remains exclusive to **`SPR-MOD-007-006`**.

#### 1.1.1 L&D Consumption Authority

The L&D consumption record (the persistent linkage between an Employee and a completed training event) is authoritatively owned by MOD-007 HRMS. No other module MAY create, edit, or independently maintain parallel L&D consumption records. External learning platforms remain the system of record for course catalog, enrollment, and completion evidence; MOD-007 records only the fact of completion against the employee master.

#### 1.1.2 HRMS ↔ External Learning Platform Boundary

- **Learning content authoring, hosting, enrollment, and completion determination** are owned by external learning platforms and integrated via `ENG-023`.
- This sprint **consumes** `TrainingCompleted` events emitted by (or ingested from) those platforms. It does **not** author courses, enroll employees, or determine completion policy.

#### 1.1.3 HRMS ↔ Analytics Boundary

- **Reports, dashboards, exports, and audit-readiness surfaces** for L&D and self-service data are owned by `SPR-MOD-007-006`.
- This sprint delivers transactional consumption and self-service surfaces; it does **not** author analytics.

#### 1.1.4 HRMS ↔ Platform Boundary (Identity)

- **Identity, authentication, roles, and permissions** remain owned by MOD-001 Platform via `ENG-001` / `ENG-002` / `ENG-003`.
- Self-service surfaces authenticate through platform identity and authorize via `ENG-002`; this sprint does not mint credentials or grant application permissions.

### 1.2 In Scope

- **L&D consumption:** subscribe to and process `TrainingCompleted` events via `ENG-024`, persisting completion records against the referenced Employee scoped to tenant/company.
- **Integration:** external learning platform ingress via `ENG-023` (integration engine); payload envelope, transport, and delivery guarantees are governed by the authoritative event catalog and `ENG-023` / `ENG-024`.
- **Employee Self-Service surfaces (business capabilities):**
  - **Profile view.** Employee views their own Employee master record scoped by `ENG-002`.
  - **Leave request initiation.** Employee initiates a Leave Request transaction that is owned and processed by `SPR-MOD-007-003`; this sprint provides only the initiation surface and does not redefine the Leave Request lifecycle.
  - **Attendance summary view.** Employee views their own attendance data produced by `SPR-MOD-007-003` — read-only.
  - **HR document access.** Employee views HR documents (letters, contracts, attachments) authored by other HRMS sprints and stored via `ENG-007` / `ENG-008`, scoped to the acting employee.
- **Automation** via `ENG-013` for routine self-service triggers (e.g. document delivery on completion of a lifecycle step) — automation invocation only; business rules remain owned by their authoring sprint.
- **Notification** via `ENG-025` for L&D completion acknowledgements and self-service confirmations.
- **Audit integration** via `ENG-004` for every self-service access to sensitive data and every L&D consumption record write.

### 1.3 Out of Scope

Reserved for later HRMS sprints or other modules:

- Course catalog authoring, enrollment management, completion determination — external learning platforms.
- Attendance and Leave Request **transaction lifecycles** — owned by `SPR-MOD-007-003`. This sprint initiates the Leave Request from self-service but does not redefine its lifecycle.
- Employee, Position, Department, Grade, Shift masters and HRMS configuration — owned by `SPR-MOD-007-001`.
- Onboarding Task and Exit Clearance transactions — `SPR-MOD-007-002`.
- Appraisal transactions — `SPR-MOD-007-004`.
- HR read model, HR reports, dashboards, exports, audit-readiness surface — `SPR-MOD-007-006`.
- **Payroll processing, earnings/deductions, payslip issuance** — owned by **MOD-008 Payroll**.
- **Financial postings** — owned by **MOD-002 Accounting** via `ENG-015` / `ENG-016`.
- **Identity provisioning / deprovisioning and permissions** — owned by **MOD-001 Platform**.
- Physical schema, API routes, UI mockups, and source code.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-007-005`, the following will exist:

- **Business capabilities.**
  - `TrainingCompleted` events emitted by external learning platforms are consumed via `ENG-024` and recorded against the referenced Employee.
  - Employees can view their own profile via a self-service surface, scoped by `ENG-002`.
  - Employees can initiate a Leave Request from self-service; the request is handed off to the Leave Request lifecycle owned by `SPR-MOD-007-003`.
  - Employees can view their own attendance summary (read-only) from self-service.
  - Employees can view HR documents scoped to themselves via `ENG-007` / `ENG-008`.
- **Event contracts.** `TrainingCompleted` is consumed via `ENG-024` per the authoritative event catalog. Payload shape, envelope, and delivery guarantees are governed by [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).
- **Integration contracts.** External learning platform ingress via `ENG-023` per the Module PRD §8 integration category (Learning platforms).
- **Audit artifacts.** Every L&D consumption record write and every self-service access to sensitive data produces an audit record via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-007-005`.
- **Migration artifacts.** *N/A at PRD authoring time.*

---

## 3. Traceability to Module PRD

| MOD-007 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Learning and development; Employee self-service | L&D consumption + self-service surfaces |
| §2 Submodules — L&D, Self-Service | Submodule realization in this sprint |
| §3 Personas — Employee, Manager, HR Business Partner, HR Manager | User stories (§4) |
| §8 Integration Points — `TrainingCompleted` (consumed) | Event consumption via `ENG-024` |
| §8 External Systems — Learning platforms | Integration via `ENG-023` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. **No capability introduced in this Sprint PRD is outside the approved HRMS Module PRD.**

### 3.1 Capability Allocation Compliance

Per [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md) §4.1:

| Capability | Origin Sprint |
| --- | --- |
| Learning and development (§2) | `SPR-MOD-007-005` |
| Employee self-service (§2) | `SPR-MOD-007-005` |

The L&D consumption record and the self-service surfaces are originating-allocated to this sprint per Sprint Plan §2 and §4. `TrainingCompleted` is originating-consumed by this sprint per Sprint Plan §8.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Learning and development* and *Employee self-service* → this Sprint PRD → deliverables in §2 (L&D consumption via `TrainingCompleted`; self-service profile/leave initiation/attendance view/HR document access surfaces).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As an external learning platform integration, I want to emit `TrainingCompleted` and have HRMS record it against the referenced Employee, so that the employee master reflects the completion.*
- **US-002.** *As an HR administrator, I want L&D consumption records to be audited via `ENG-004`, so that completion is provable.*
- **US-003.** *As an Employee, I want to view my own profile (Employee master fields authored in `SPR-MOD-007-001`), so that I can verify my HR record.*
- **US-004.** *As an Employee, I want to initiate a Leave Request from self-service, so that the request enters the Leave Request lifecycle owned by `SPR-MOD-007-003`.*
- **US-005.** *As an Employee, I want to view my own attendance summary (read-only), so that I can verify attendance data.*
- **US-006.** *As an Employee, I want to view HR documents scoped to me (via `ENG-007` / `ENG-008`), so that letters and contracts are accessible.*
- **US-007.** *As a security reviewer, I want every self-service read of sensitive data to be authorized by `ENG-002` and audited by `ENG-004`.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 L&D consumption (US-001)

- **Given** a `TrainingCompleted` event referencing an active Employee within a tenant/company,
  **when** it is delivered via `ENG-024`,
  **then** an L&D consumption record is persisted against the Employee under the same tenant/company, uniquely identified, and the transition is audited.

### 5.2 L&D consumption audit (US-002)

- **Given** any L&D consumption record write,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor (integration principal), tenant/company scope, entity identifier (Employee), event reference, and timestamp.

### 5.3 Self-service profile view (US-003)

- **Given** an authenticated Employee within a tenant/company,
  **when** the employee opens the self-service profile surface,
  **then** the Employee master record for that employee is returned, scoped by `ENG-002` to the acting employee, and the access is audited via `ENG-004`.

### 5.4 Self-service leave initiation (US-004)

- **Given** an authenticated Employee,
  **when** the employee initiates a Leave Request from self-service,
  **then** the request is handed off to the Leave Request lifecycle owned by `SPR-MOD-007-003`; this sprint MUST NOT redefine the Leave Request state machine, approvals, or rules.

### 5.5 Self-service attendance view (US-005)

- **Given** an authenticated Employee,
  **when** the employee opens the attendance summary surface,
  **then** the acting employee's attendance data produced by `SPR-MOD-007-003` is returned read-only, scoped by `ENG-002`, and the access is audited via `ENG-004`.

### 5.6 Self-service HR document access (US-006)

- **Given** an authenticated Employee and an HR document (via `ENG-007`) with attachments (via `ENG-008`) scoped to that employee,
  **when** the employee opens the document,
  **then** the document is returned scoped by `ENG-002` to the acting employee, and the access is audited via `ENG-004`.

### 5.7 Authorization and audit invariants (US-007)

- **Given** any self-service read of sensitive data,
  **when** it executes,
  **then** authorization is enforced by `ENG-002` per `ADR-032`, and the access is audited via `ENG-004` per `ADR-014`.

### 5.8 Isolation invariants (`ADR-011`)

- **Given** any L&D consumption record or self-service read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.9 Ownership consumption invariants

- **Given** any L&D consumption record,
  **when** it references an Employee,
  **then** it consumes the Employee master read-only from `SPR-MOD-007-001`; no re-definition occurs.
- **Given** any Leave Request initiated from self-service,
  **when** it is created,
  **then** the transaction lifecycle is handed to `SPR-MOD-007-003`; this sprint MUST NOT compute leave balances, approvals, or state transitions.
- **Given** any attendance surface,
  **when** it renders,
  **then** it consumes Attendance data owned by `SPR-MOD-007-003` read-only.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-007` — HRMS.
- **Module PRD:** [`docs/20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md).
- **Upstream Sprints (Stage 2):** [`SPR-MOD-007-001`](./SPR-MOD-007-001-hrms-foundation-employee-master.md), [`SPR-MOD-007-003`](./SPR-MOD-007-003-attendance-and-leave.md).
- **Module PRD sections fulfilled:** §2 (Learning and development; Employee self-service; submodules L&D, Self-Service), §3 (personas), §8 (`TrainingCompleted` consumed; Learning platforms external), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-007` MODULE_PRD.
- **Upstream module baselines:** [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen).
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-007-001` (Employee/org-structure masters, HRMS configuration), `SPR-MOD-007-003` (Attendance and Leave Request transactions consumed by self-service surfaces).
- **Cross-module consumption (events only):** `TrainingCompleted` from external learning platforms (integration category per Module PRD §8).
- **Downstream sprints:** `SPR-MOD-007-006` (HR analytics consumes L&D and self-service surfaces read-only).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at v1.1 (Active). Execution Wrapper v1.0 (FROZEN) applies, compatibility `>=1.0,<2.0`.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (§1.1). Each engine matches Sprint Plan §SPR-MOD-007-005 verbatim.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on all self-service reads and L&D consumption writes. |
| `ENG-004` Audit | Records every self-service access to sensitive data and every L&D consumption record write. |
| `ENG-007` Document | Serves HR documents (letters, contracts) via self-service. |
| `ENG-008` Attachment | Serves attachments associated with HR documents scoped to the acting employee. |
| `ENG-013` Automation | Triggers routine self-service automations (e.g. document delivery on lifecycle events). |
| `ENG-023` Integration | Ingresses `TrainingCompleted` from external learning platforms. |
| `ENG-024` Eventing | Consumes `TrainingCompleted` per the authoritative event catalog. |
| `ENG-025` Notification | Notifies employees on L&D completion acknowledgements and self-service confirmations. |

HRMS business semantics (L&D consumption record, self-service scoping) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every L&D consumption record and every self-service read. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to self-service reads and L&D consumption writes. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing. Integration envelope and transport guarantees are governed by `ENG-023`.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| L&D Consumption Record | MOD-007 (this sprint) | Persistent linkage between an Employee and a completed training event ingested from an external learning platform. |

### 10.2 Relationships

- An **L&D Consumption Record** references exactly one **Employee** within the same company.
- Self-service surfaces reference existing entities read-only: **Employee** (owned by `SPR-MOD-007-001`), **Attendance** and **Leave Request** (owned by `SPR-MOD-007-003`), and HR documents/attachments (owned by their authoring sprints, served via `ENG-007` / `ENG-008`).

### 10.3 Ownership Boundaries

- The L&D Consumption Record is owned by `MOD-007` per §1.1.
- Employee, org-structure masters, and HRMS configuration remain owned by `SPR-MOD-007-001`; this sprint does not redefine them.
- Attendance and Leave Request transactions remain owned by `SPR-MOD-007-003`; self-service consumes them read-only or hands off initiation.
- Course catalog and completion determination remain owned by external learning platforms.
- Analytics read models remain owned by `SPR-MOD-007-006`.

Physical schema is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).

### 11.1 Published

Sprint 5 publishes **no new cross-module domain events**. L&D completion is authoritatively determined by external learning platforms; this sprint records the resulting `TrainingCompleted` event against the employee master and does not re-emit domain events.

### 11.2 Consumed

- **`TrainingCompleted`** — consumed from external learning platforms via `ENG-023` and `ENG-024`. Origin: external (Learning platforms per Module PRD §8 and Sprint Plan §8). Purpose: record the completion against the employee master.

### 11.3 Event-Catalog Registration

`TrainingCompleted` is declared in Module PRD §8 and Sprint Plan §2 / §8 as consumed by this sprint. If the name is not yet present in the authoritative event catalog at authoring time, the shortfall is recorded as a deferred `R-EV-*` risk in §14 per Wrapper v1.0 event-resolution policy; the event catalog is not modified by this Sprint PRD.

---

## 12. Definition of Done

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every L&D consumption record and every self-service read.
- [ ] Every L&D consumption record write and every self-service access to sensitive data produces an audit record via `ENG-004`.
- [ ] `TrainingCompleted` is consumed via `ENG-024` per the authoritative event catalog.
- [ ] External learning platform ingress operates via `ENG-023`.
- [ ] Self-service reads are authorized by `ENG-002` per `ADR-032`.
- [ ] Leave initiation from self-service hands off to the `SPR-MOD-007-003` Leave Request lifecycle without redefining it.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-007_SPRINT_PLAN.md` §2 (`SPR-MOD-007-005`):

- `TrainingCompleted` events are consumed and recorded against the employee master.
- Self-service surfaces render employee profile, leave request initiation, attendance summary, and HR documents scoped to the acting employee.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **Risk ID:** R-01
  - **Description:** This sprint depends on `SPR-MOD-007-001` masters and `SPR-MOD-007-003` attendance/leave transactions.
  - **Impact:** Any Sprint 1 or Sprint 3 regression blocks execution.
  - **Mitigation:** Consume prior sprint outputs read-only; treat regressions as defects.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Analytics and payroll surfaces are out of scope; scope-creep would violate HRMS ↔ Analytics / Payroll boundaries.
  - **Impact:** Duplicated ownership and traceability loss.
  - **Mitigation:** Enforce §1.1.2, §1.1.3, and §1.3.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time.
  - **Impact:** Non-Accepted status would invalidate this sprint's contract.
  - **Mitigation:** Re-plan if acceptance status changes.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** External learning platforms may vary in their completion-event payload shapes.
  - **Impact:** Ingress transformation may be required at `ENG-023`.
  - **Mitigation:** Normalize at the integration boundary; do not leak platform-specific shapes into the L&D consumption record.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** `TrainingCompleted` is declared authoritatively in Module PRD §8 and Sprint Plan §2 / §8. The event-catalog file is a repository stub at authoring time and does not yet enumerate this event name.
  - **Impact:** Publishers (external platforms) and this consumer cannot bind until catalog registration occurs.
  - **Mitigation:** Recorded as a **Deferred Repository Risk (Events)** per Wrapper v1.0 event-resolution policy. Register via the event-catalog governance process before implementation begins.
  - **Status:** Deferred

- **Risk ID:** R-EV-02
  - **Description:** Multiple external learning platforms may need distinct integration bindings via `ENG-023`.
  - **Impact:** Late binding delays L&D consumption for specific platforms.
  - **Mitigation:** Consumption contract in HRMS is uniform post-normalization; per-platform bindings are additive and non-blocking.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

- **Unit** — L&D consumption record validation; self-service scoping rules.
- **Integration** — `TrainingCompleted` consumption via `ENG-024`; external ingress via `ENG-023`; audit emission via `ENG-004`; document/attachment retrieval via `ENG-007` / `ENG-008`.
- **Contract** — `TrainingCompleted` payload contract against the authoritative event catalog (once registered).
- **End-to-end (smoke)** — self-service happy paths (profile view; leave initiation handoff to `SPR-MOD-007-003`; attendance view; HR document access) under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture and an event-recorder for `ENG-024` assertions on `TrainingCompleted` ingestion.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance. They MUST NOT introduce new business requirements, ADRs, or engine behavior.*

- Consider a per-platform ingress adapter at `ENG-023` that normalizes `TrainingCompleted` payloads to a canonical HRMS consumption shape before persistence.
- Consider deterministic idempotency keys on L&D consumption writes to prevent duplicate records from platform retries.
- Consider a small envelope validator for `TrainingCompleted` so contract regressions are caught locally.

Non-authoritative.

---

## 17. Review Gate

1. **Does the sprint have exactly one objective?** Yes. Deliver L&D consumption and Employee Self-Service surfaces.
2. **Does every feature trace to a specific Module PRD section?** Yes. §3 and §3.2.
3. **Are engines and ADRs consumed rather than redefined?** Yes. §8 / §9.
4. **Are out-of-scope items enumerated and linked to their owning sprints?** Yes. §1.3.
5. **Are acceptance criteria objective and testable?** Yes. §5 uses Given/When/Then.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?** Yes. §2, §12, §13.
7. **Does the next reserved sprint (`SPR-MOD-007-006`) begin immediately after this one completes?** Yes. Sprint 6 depends on `SPR-MOD-007-001` … `SPR-MOD-007-005` per Sprint Plan §3.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- Parent Module Sprint Plan — [`./MOD-007_SPRINT_PLAN.md`](./MOD-007_SPRINT_PLAN.md)
- Upstream Sprint PRD (masters) — [`./SPR-MOD-007-001-hrms-foundation-employee-master.md`](./SPR-MOD-007-001-hrms-foundation-employee-master.md)
- Upstream Sprint PRD (attendance & leave) — [`./SPR-MOD-007-003-attendance-and-leave.md`](./SPR-MOD-007-003-attendance-and-leave.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Event Catalog (authoritative) — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
