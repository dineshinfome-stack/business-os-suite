---
title: "SPR-MOD-009-005 — Quality, Yield & Scrap"
summary: "Sprint PRD for the In-process quality process of MOD-009 Manufacturing: Quality Inspection transaction lifecycle, quality-rejection handling, and yield/scrap tracking against Work Orders. Publishes QualityRejected and consumes MaintenanceCompleted; enforces the quality-rejection issuance rule via ENG-012."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-009-005"
parent_module: "MOD-009"
parent_sprint_plan: "MOD-009_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "11.0.5"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-010", "ENG-011", "ENG-012", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "manufacturing", "mod-009", "quality", "yield", "scrap", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD009-005-20260715T001100Z-001"
parent_result_id: "GT003-MOD009-004-20260715T001000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-009-005 — Quality, Yield & Scrap

> **Stage 2 deliverable.** Fifth Sprint PRD for **MOD-009 Manufacturing** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines, Accepted ADRs, and the Work-order surface authored in `SPR-MOD-009-003`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-009-005` (permanent) |
| Parent Module | `MOD-009` — Manufacturing |
| Parent Sprint Plan | [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-009-003`](./SPR-MOD-009-003-work-orders-and-shopfloor-execution.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-009-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **In-process quality** business process for BusinessOS: allow a Quality Inspector to raise a Quality Inspection against a Work Order, capture pass/reject dispositions, record yield and scrap quantities against the originating Work Order, and enforce the quality-rejection issuance rule ("Quality-rejected output cannot be issued to finished-goods stock" — Module PRD §7) via `ENG-012`. Publish `QualityRejected` via `ENG-024` on rejection and consume `MaintenanceCompleted` per Module PRD §8.

> **Manufacturing Ownership Convention (re-stated).** The Manufacturing module owns the business semantics of the Quality Inspection transaction, the pass/reject disposition lifecycle, yield/scrap recording against Work Orders, and emission of `QualityRejected`. ERP Core Engines provide shared infrastructure (authorization, audit, workflow, approval, rules, eventing, notification) but **MUST NOT** redefine Manufacturing business rules. Stock disposition of rejected material remains exclusive to **MOD-005 Inventory**. Financial posting remains exclusive to **MOD-002 Accounting** via `ENG-015` and `ENG-016`. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**.

#### 1.1.1 Quality Inspection Authority

The **Quality Inspection** transaction is authoritatively owned by MOD-009 Manufacturing and originates in this sprint. No other module MAY create, edit, close, or independently maintain parallel Quality Inspection records. Downstream sprints and modules consume Quality Inspection data through Manufacturing-owned read APIs and the Manufacturing-owned `QualityRejected` event; they MUST NOT redefine the entity or its lifecycle.

#### 1.1.2 Manufacturing ↔ Inventory Boundary (Rejected Stock Disposition)

- **MOD-005 Inventory** owns stock disposition of rejected material and any resulting stock ledger movements. This sprint does not write to the stock ledger and does not perform stock disposition.
- **MOD-009 Manufacturing** records on the Quality Inspection the Manufacturing-owned facts (pass/reject disposition, yield quantity, scrap quantity) against the originating Work Order and emits `QualityRejected` on rejection for MOD-005 to consume.

#### 1.1.3 Manufacturing ↔ Accounting and Platform Boundary

- **MOD-002 Accounting** owns financial postings via `ENG-015` and `ENG-016`. This sprint writes no journal entries and invokes no posting engine.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Manufacturing consumes these read-only via `ENG-002`.

#### 1.1.4 Consumed Event Boundary — `MaintenanceCompleted`

`MaintenanceCompleted` (Module PRD §8) is consumed as an input signal that may affect Work-Order availability for quality disposition (e.g. equipment returned to service). Consumption is opaque to the emitting module and is scoped to Manufacturing-owned state transitions on the Quality Inspection surface. The event contract is owned by the authoritative event catalog and is not redefined here.

Ownership boundaries authored in `SPR-MOD-009-001` §1.1, `SPR-MOD-009-002` §1.1, `SPR-MOD-009-003` §1.1, and `SPR-MOD-009-004` §1.1 SHALL NOT be redefined here.

### 1.2 In Scope

- **Quality Inspection transaction lifecycle:** create, edit, submit, approve, execute, complete, cancel, and archive Quality Inspections under a tenant/company. Each Inspection references exactly one Work Order authored in `SPR-MOD-009-003`.
- **Pass/reject disposition capture:** record pass and reject dispositions on the Inspection; reject dispositions carry rejected quantity that becomes the trigger for `QualityRejected`.
- **Yield and scrap tracking:** record yield and scrap quantities on the Inspection against the originating Work Order per Module PRD §2 ("Yield and scrap tracking").
- **Quality-rejection issuance enforcement:** `ENG-012` Rules enforces the rule "Quality-rejected output cannot be issued to finished-goods stock" (Module PRD §7).
- **Event emission:** `QualityRejected` — published via `ENG-024` on completion of a rejection disposition, per the authoritative event catalog.
- **Event consumption:** `MaintenanceCompleted` — consumed via `ENG-024` where it affects Work-Order availability for quality disposition, per Module PRD §8.
- **Workflow and approval:** Quality Inspection approval and lifecycle transitions run through `ENG-010` Workflow and `ENG-011` Approval per Manufacturing configuration authored in `SPR-MOD-009-001`.
- **Audit:** every Quality Inspection lifecycle transition and every rejection disposition is audited via `ENG-004` per `ADR-014`.
- **Notifications:** inspector, planner, and approver notifications via `ENG-025` at configured lifecycle transitions and on rejection events.

### 1.3 Out of Scope

- Work Order and Production Entry lifecycle — `SPR-MOD-009-003`.
- Sub-contract Challan lifecycle and sub-contract return-window enforcement — `SPR-MOD-009-004`.
- Manufacturing analytics, dashboards, exports, audit-readiness surface — `SPR-MOD-009-006`.
- Item master, stock ledger, inventory movements, disposition of rejected stock — owned by MOD-005 Inventory.
- Financial postings for scrap or rejected material — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- External maintenance authoring; `MaintenanceCompleted` is consumed only.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-009-005`:

- **Business capabilities.**
  - A Quality Inspector can raise, edit, submit, approve, execute, complete, cancel, and archive Quality Inspections against Work Orders under a tenant/company.
  - Pass and reject dispositions are captured on the Inspection.
  - Yield and scrap quantities are recorded against the originating Work Order.
  - `QualityRejected` events are published via `ENG-024` on rejection.
  - `MaintenanceCompleted` events are consumed via `ENG-024` where they affect Work-Order availability for quality disposition.
  - The quality-rejection issuance rule is enforced via `ENG-012`.
- **Workflow and approval.** Quality Inspection approval and lifecycle flows registered via `ENG-010` and `ENG-011`, keyed to Manufacturing configuration authored in `SPR-MOD-009-001`.
- **Event registration.** Publisher-side registration for `QualityRejected` and consumer-side registration for `MaintenanceCompleted` declared and wired against `ENG-024` per the authoritative event catalog.
- **Audit artifacts.** An audit record exists for every Quality Inspection lifecycle transition and every rejection disposition via `ENG-004`.
- **Notification artifacts.** Inspector, planner, and approver notifications wired via `ENG-025` at configured lifecycle transitions and on rejection events.
- **Documentation updates.** This Sprint PRD; sprint catalog entry for `SPR-MOD-009-005`.
- **Migration artifacts.** *N/A at PRD authoring time.*

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-009 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Quality checks; Yield and scrap tracking; submodule Quality | Quality Inspection transaction lifecycle, pass/reject dispositions, yield/scrap recording |
| §3 Personas — Quality Inspector (primary), Production Planner (secondary), Approver (secondary) | User stories (§4) |
| §4 Business Processes — In-process quality | End-to-end raise → execute → disposition → complete flow |
| §6 Transactions — Quality Inspection | Transaction lifecycle authored here |
| §7 Business Rules — "Quality-rejected output cannot be issued to finished-goods stock" | Rule enforced via `ENG-012` |
| §8 Integration Points — `QualityRejected` (published); `MaintenanceCompleted` (consumed) | Event emission via `ENG-024`; event consumption via `ENG-024` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Manufacturing Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) §4.1 allocates the following capabilities to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Quality checks (§2) | `SPR-MOD-009-005` |
| Yield and scrap tracking (§2) | `SPR-MOD-009-005` |

These allocations are unique; no other Manufacturing sprint claims "Quality checks" or "Yield and scrap tracking" as originating capabilities. The **Quality** submodule (Sprint Plan §4.2) is originating-allocated exclusively to `SPR-MOD-009-005`.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capabilities *Quality checks* and *Yield and scrap tracking* and submodule *Quality* → this Sprint PRD → deliverables in §2.
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3; every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Quality Inspector, I want to raise a Quality Inspection against a Work Order, so that quality intent is captured with an authoritative record.*
- **US-002.** *As a Quality Inspector, I want to progress the Inspection through its lifecycle (draft → submitted → approved → executed → completed → closed), so that quality state remains deterministic and auditable.*
- **US-003.** *As a Quality Inspector, I want to record pass and reject dispositions on the Inspection, so that quality outcomes are captured against the originating Work Order.*
- **US-004.** *As a Quality Inspector, I want to record yield and scrap quantities against the originating Work Order, so that Manufacturing yield and scrap are visible per Module PRD §2.*
- **US-005.** *As a Quality Inspector, I want the quality-rejection issuance rule enforced via `ENG-012`, so that quality-rejected output cannot be issued to finished-goods stock.*
- **US-006.** *As a downstream module (MOD-005 Inventory for rejected-stock disposition, MOD-009 Sprint 6 analytics, MOD-017 Analytics), I want `QualityRejected` published via `ENG-024`, so that downstream state transitions can occur without redefining Manufacturing semantics.*
- **US-007.** *As the Quality Inspection surface, I want `MaintenanceCompleted` consumed via `ENG-024` where it affects Work-Order availability for quality disposition.*
- **US-008.** *As a Quality Inspector or approver, I want approval to run through `ENG-010` Workflow and `ENG-011` Approval keyed to Manufacturing configuration authored in Sprint 1.*
- **US-009.** *As a security reviewer, I want every Quality Inspection lifecycle transition and rejection disposition audited via `ENG-004`.*

---

## 5. Acceptance Criteria

Given / When / Then. Objective and testable.

### 5.1 Quality Inspection intake and lifecycle (US-001, US-002)

- **Given** a valid Quality Inspection creation request under a tenant/company that references a Work Order in the same company,
  **when** a Quality Inspector submits it,
  **then** the Inspection is persisted with a stable identifier unique within the company and creation is audited.
- **Given** an Inspection request that references a Work Order in a different company, an archived Work Order, or a non-existent Work Order,
  **when** submitted,
  **then** the request is rejected deterministically.
- **Given** a Quality Inspection in any lifecycle state,
  **when** the Inspector transitions it (submit, approve, execute, complete, cancel, archive),
  **then** the transition is validated against the Manufacturing-owned lifecycle state machine, persisted deterministically, and audited.

### 5.2 Pass/reject disposition (US-003)

- **Given** an executed Quality Inspection,
  **when** the Inspector records a pass disposition,
  **then** the pass disposition is persisted on the Inspection, the Inspection transitions to completed, and the outcome is audited.
- **Given** an executed Quality Inspection,
  **when** the Inspector records a reject disposition with rejected quantity,
  **then** the reject disposition and rejected quantity are persisted, the Inspection transitions to completed, `QualityRejected` is published via `ENG-024`, and the outcome is audited.

### 5.3 Yield and scrap recording (US-004)

- **Given** a Quality Inspection tied to a Work Order,
  **when** the Inspector records yield and scrap quantities on the Inspection,
  **then** the quantities are persisted on the Inspection against the originating Work Order and are auditable through `ENG-004`.

### 5.4 Quality-rejection issuance rule (US-005)

- **Given** a Quality Inspection with a completed reject disposition,
  **when** any Manufacturing surface attempts to issue the rejected output to finished-goods stock within Manufacturing-owned code paths,
  **then** `ENG-012` Rules blocks the attempt deterministically and the block is audited.

### 5.5 Event emission (US-006)

- **Given** a Quality Inspection completing with a reject disposition,
  **when** completion commits,
  **then** exactly one `QualityRejected` event is published via `ENG-024` per the authoritative event catalog envelope and delivery guarantee.

### 5.6 Event consumption (US-007)

- **Given** a `MaintenanceCompleted` event delivered via `ENG-024` per the authoritative event catalog,
  **when** it is consumed,
  **then** Manufacturing-owned Work-Order-availability state on the Quality Inspection surface advances deterministically and the consumption is audited.

### 5.7 Workflow and approval (US-008)

- **Given** the Manufacturing approval-threshold configuration authored in `SPR-MOD-009-001` resolved via `ENG-005`,
  **when** a Quality Inspection is submitted for approval,
  **then** `ENG-010` Workflow drives the appropriate approval steps and `ENG-011` records approver decisions; every state transition is audited.

### 5.8 Audit (US-009)

- **Given** any Quality Inspection lifecycle transition or rejection disposition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, Inspection identifier, Work-Order identifier, transition/disposition type, and timestamp.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any Quality Inspection read, write, or event publication,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant operation can succeed.

### 5.10 Ownership consumption invariants

- **Given** any Manufacturing code path that requires disposition of rejected stock,
  **when** the disposition must reflect the transition,
  **then** the Manufacturing event (`QualityRejected`) is emitted for MOD-005 to consume; the stock ledger is not written by this sprint.
- **Given** any quality event with financial consequence,
  **when** it materializes,
  **then** it is emitted for MOD-002 Accounting to post; no journal entry is written by this sprint.
- **Given** any Manufacturing code path that requires identity,
  **when** it needs the actor,
  **then** it consumes it read-only via `ENG-002`; Identity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-009` — Manufacturing.
- **Module PRD:** [`docs/20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Quality checks; Yield and scrap tracking; submodule Quality), §3 (personas), §4 (In-process quality), §6 (Quality Inspection), §7 (quality-rejection issuance rule), §8 (`QualityRejected` published; `MaintenanceCompleted` consumed), §12 (Engine consumption), §13 (Dependencies).

---

## 7. Dependencies

- **Parent:** `MOD-009` MODULE_PRD.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-009-003` — Work Orders & Shopfloor Execution.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, hierarchy, users/roles/permissions, audit review.
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — consumer of `QualityRejected` for rejected-stock disposition.
- **Downstream sprints:** `SPR-MOD-009-006` consumes Quality Inspection data and yield/scrap facts.
- **Peer relationship:** `SPR-MOD-009-005` and `SPR-MOD-009-004` are independent per Sprint Plan §7; quality is not a prerequisite for sub-contract dispatch and vice versa.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined**. Each engine is a subset of the Module PRD engine union per Module PRD §12 and matches Sprint Plan §5 (Engine Consumption Map) for `SPR-MOD-009-005`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Quality Inspection actions. |
| `ENG-004` Audit | Records every Quality Inspection lifecycle transition and rejection disposition. |
| `ENG-010` Workflow | Drives the Quality Inspection lifecycle deterministically. |
| `ENG-011` Approval | Records approver decisions per Manufacturing approval-threshold configuration. |
| `ENG-012` Rules | Evaluates structural validations and enforces the quality-rejection issuance rule. |
| `ENG-024` Eventing | Publishes `QualityRejected` and consumes `MaintenanceCompleted` per the authoritative event catalog. |
| `ENG-025` Notification | Emits notifications at configured lifecycle transitions and on rejection events. |

Manufacturing business semantics (Quality Inspection lifecycle, pass/reject disposition, yield/scrap recording, quality-rejection issuance enforcement, event emission triggers) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model enforced on every Quality Inspection and event publication/consumption. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Quality Inspection actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Quality Inspection | MOD-009 (this sprint) | Authoritative quality transaction record referencing exactly one Work Order. |
| Quality Disposition | MOD-009 (this sprint) | Manufacturing-owned pass/reject disposition captured on the Inspection, with rejected quantity where applicable. |
| Yield Record | MOD-009 (this sprint) | Manufacturing-owned yield quantity captured on the Inspection against the originating Work Order. |
| Scrap Record | MOD-009 (this sprint) | Manufacturing-owned scrap quantity captured on the Inspection against the originating Work Order. |

### 10.2 Relationships

- A **company** (owned by MOD-001) owns zero or more **Quality Inspections**.
- A **Quality Inspection** MUST reference exactly one **Work Order** owned by `SPR-MOD-009-003` in the same company.
- A **Quality Inspection** carries exactly one terminal **Quality Disposition** (pass or reject) upon completion.
- A **Quality Inspection** MAY carry zero or one **Yield Record** and zero or one **Scrap Record** against the originating Work Order.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-009` per the Manufacturing Ownership Convention (§1.1).
- The **Work Order** entity is owned by `SPR-MOD-009-003` and consumed read-only here.
- The **Item** entity and stock-ledger state (including disposition of rejected stock) are owned by MOD-005 Inventory and consumed read-only; not Manufacturing-owned.
- Financial-posting entities are owned by MOD-002 Accounting; not Manufacturing-owned.

Physical schema is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).

### 11.1 Published

| Event | Trigger | Consumed By (per authoritative catalog) |
| --- | --- | --- |
| `QualityRejected` | A Quality Inspection completes with a reject disposition. | MOD-005 Inventory (rejected-stock disposition), MOD-009 Sprint 6, MOD-017 Analytics. |

### 11.2 Consumed

| Event | Handled As | Emitted By (per authoritative catalog) |
| --- | --- | --- |
| `MaintenanceCompleted` | Advances Manufacturing-owned Work-Order-availability state on the Quality Inspection surface where relevant. | External maintenance capability per Module PRD §8. |

Payload contracts remain owned by the authoritative event catalog. Any event name not present in the authoritative event catalog at authoring time is mapped to its authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Quality Inspection and event publication/consumption.
- [ ] Every Quality Inspection lifecycle transition and rejection disposition produces an audit record via `ENG-004`.
- [ ] `QualityRejected` is published via `ENG-024` per the authoritative event catalog envelope and delivery guarantee.
- [ ] `MaintenanceCompleted` is consumed via `ENG-024` where it affects Work-Order-availability state.
- [ ] The quality-rejection issuance rule is enforced via `ENG-012`, demonstrated to block issuance of quality-rejected output to finished-goods stock within Manufacturing-owned code paths.
- [ ] Yield and scrap are recorded against the originating Work Order via `ENG-004`-audited transitions.
- [ ] Manufacturing configuration authored in `SPR-MOD-009-001` is consumed via `ENG-005`; no new configuration keys are registered here.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-009_SPRINT_PLAN.md` §2 (`SPR-MOD-009-005`):

- Quality Inspections can be raised against work orders and completed with pass/reject dispositions.
- The quality-rejection issuance rule is enforced via `ENG-012`.
- Yield and scrap are recorded against the originating work order.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **Risk ID:** R-01
  - **Description:** MOD-009 depends on `SPR-MOD-009-003` Work Order state and Manufacturing configuration being stable.
  - **Impact:** Regressions against Sprint 3 corrupt Inspection-to-Work-Order references and disposition state.
  - **Mitigation:** Treat Sprint 3 outputs as an internal contract; escalate drift as a Sprint 3 defect.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Downstream MOD-005 rejected-stock disposition depends on the `QualityRejected` event contract being stable per the authoritative event catalog.
  - **Impact:** Envelope drift would corrupt rejected-stock disposition.
  - **Mitigation:** Publish only per the authoritative event catalog; escalate envelope changes through event-catalog governance.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** `MaintenanceCompleted` is consumed from an external emitting capability; envelope changes are outside Manufacturing ownership.
  - **Impact:** Envelope drift would corrupt Work-Order-availability state updates on the quality surface.
  - **Mitigation:** Consume only per the authoritative event catalog; surface envelope failures via `ENG-004` audit; escalate through event-catalog governance.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Scope-creep from downstream Sprint 6 (analytics) or upstream Sprint 4 (sub-contract) into this sprint.
  - **Impact:** Silent absorption of adjacent scope would dilute the quality surface.
  - **Mitigation:** Enforce the §1.3 out-of-scope list.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** Manufacturing MUST NOT dispose of rejected stock, write to the stock ledger, or write journal entries.
  - **Impact:** Blurring these boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Manufacturing ↔ Inventory (§1.1.2) and Manufacturing ↔ Accounting (§1.1.3) boundaries.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Published event `QualityRejected` and consumed event `MaintenanceCompleted` MUST be registered in the authoritative event catalog before this sprint enters `In Progress`.
  - **Impact:** Missing or drifted registration would break rejected-stock disposition in MOD-005 and Work-Order-availability updates here.
  - **Mitigation:** Register/verify via event-catalog governance before the sprint begins; do not modify the event catalog inside this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md).

- **Unit** — Quality Inspection state-machine transitions; pass/reject disposition validation; yield/scrap capture invariants; quality-rejection issuance rule evaluation via `ENG-012`; approval routing per threshold configuration.
- **Integration** — audit via `ENG-004`, configuration via `ENG-005`, workflow via `ENG-010`, approval via `ENG-011`, rules via `ENG-012`, event publication/consumption via `ENG-024`, notification via `ENG-025`.
- **Contract** — `QualityRejected` and `MaintenanceCompleted` event envelopes per the authoritative event catalog.
- **End-to-end (smoke)** — Raise-to-close smoke across a two-tenant / two-company fixture to verify `ADR-011` isolation; reject-disposition smoke to verify `ENG-012` blocking of quality-rejected issuance and `QualityRejected` emission via `ENG-024`.

Sprint-specific fixtures: a Work-Order fixture from Sprint 3, a two-company smoke fixture, and a `MaintenanceCompleted` event fixture for consumption tests.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing.*

- Consider modeling the Quality Inspection lifecycle and the disposition capture as two orthogonal FSMs so audit and event emission compose cleanly.
- Consider evaluating the quality-rejection issuance rule as a pure `ENG-012` predicate over Inspection disposition and target stock class so blocks are observable and idempotent.
- Consider tying `QualityRejected` emission to the durable disposition commit so envelope drift is impossible without a corresponding lifecycle regression.
- Consider co-locating rejection notifications with the disposition transition so `ENG-025` fires deterministically with the `ENG-004` audit record.
- Consider treating `MaintenanceCompleted` consumption as an idempotent state-advance so replays cannot corrupt Work-Order-availability state.

These notes are **non-authoritative**.

---

## 17. Review Gate

1. **Does the sprint have exactly one objective?** Yes. Deliver the In-process quality process (§1.1).
2. **Does every feature trace to a specific Module PRD section?** Yes. See §3 and §3.2.
3. **Are engines and ADRs consumed rather than redefined?** Yes. §8 and §9.
4. **Are out-of-scope items enumerated and linked to their owning sprints?** Yes. §1.3.
5. **Are acceptance criteria objective and testable?** Yes. §5.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?** Yes. §2, §12, §13 distinct.
7. **Does the next reserved sprint (`SPR-MOD-009-006`) begin immediately after this one completes?** Yes. Manufacturing Analytics & Compliance is the immediate successor per Sprint Plan §2.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md)
- Predecessor Sprints — [`./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md`](./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md), [`./SPR-MOD-009-002-production-planning-and-scheduling.md`](./SPR-MOD-009-002-production-planning-and-scheduling.md), [`./SPR-MOD-009-003-work-orders-and-shopfloor-execution.md`](./SPR-MOD-009-003-work-orders-and-shopfloor-execution.md), [`./SPR-MOD-009-004-sub-contracting.md`](./SPR-MOD-009-004-sub-contracting.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
