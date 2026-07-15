---
title: "SPR-MOD-009-004 — Sub-contracting"
summary: "Sprint PRD for the Sub-contract dispatch and return process of MOD-009 Manufacturing: Sub-contract Challan transaction lifecycle, dispatch, return reconciliation, and enforcement of the sub-contract return-window rule. Publishes SubContractDispatched and invokes external sub-contractor integrations via ENG-023 where configured."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-15"
sprint_id: "SPR-MOD-009-004"
parent_module: "MOD-009"
parent_sprint_plan: "MOD-009_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "11.0.4"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-023", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "manufacturing", "mod-009", "sub-contracting", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD009-004-20260715T001000Z-001"
parent_result_id: "GT003-MOD009-003-20260715T000900Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-009-004 — Sub-contracting

> **Stage 2 deliverable.** Fourth Sprint PRD for **MOD-009 Manufacturing** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines, Accepted ADRs, and the Manufacturing Foundation authored in `SPR-MOD-009-001`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-009-004` (permanent) |
| Parent Module | `MOD-009` — Manufacturing |
| Parent Sprint Plan | [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-009-001`](./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-009-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Sub-contract dispatch and return** business process for BusinessOS: allow a Production Planner or Sub-contracting Coordinator to raise a Sub-contract Challan against a Sub-contractor, dispatch materials, receive returns, reconcile the dispatch/return quantities, and enforce the sub-contract return-window rule ("Sub-contract material must return within the configured window or is flagged" — Module PRD §7) via `ENG-012`. Publish `SubContractDispatched` via `ENG-024` on dispatch and invoke external Sub-contractor integrations via `ENG-023` where configured.

> **Manufacturing Ownership Convention (re-stated).** The Manufacturing module owns the business semantics of the Sub-contract Challan transaction, the sub-contract lifecycle state machine, ageing checks, and the emission of `SubContractDispatched`. ERP Core Engines provide shared infrastructure (authorization, audit, document, attachment, workflow, approval, rules, automation, integration, eventing, notification) but **MUST NOT** redefine Manufacturing business rules. Stock ledgers and stock movements remain exclusive to **MOD-005 Inventory**. Financial posting remains exclusive to **MOD-002 Accounting** via `ENG-015` and `ENG-016`. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**.

#### 1.1.1 Sub-contract Challan Authority

The **Sub-contract Challan** transaction is authoritatively owned by MOD-009 Manufacturing and originates in this sprint. No other module MAY create, edit, close, or independently maintain parallel Sub-contract Challan records. Downstream sprints and modules consume Sub-contract Challan data through Manufacturing-owned read APIs and the Manufacturing-owned `SubContractDispatched` event; they MUST NOT redefine the entity or its lifecycle.

#### 1.1.2 Manufacturing ↔ Inventory Boundary (Stock Movements)

- **MOD-005 Inventory** owns the stock ledger and inventory movements. Stock movements arising from sub-contract dispatch and return are posted by MOD-005 in response to Manufacturing-emitted events; this sprint does not write to the stock ledger.
- **MOD-009 Manufacturing** records on the Sub-contract Challan the Manufacturing-owned facts (dispatched quantities, returned quantities, return-window state) and emits `SubContractDispatched` on dispatch for MOD-005 to consume.

#### 1.1.3 Manufacturing ↔ Accounting and Platform Boundary

- **MOD-002 Accounting** owns financial postings via `ENG-015` and `ENG-016`. This sprint writes no journal entries and invokes no posting engine.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Manufacturing consumes these read-only via `ENG-002`.

#### 1.1.4 Sub-contractor Integration Authority

Where the tenant/company configuration registers an external Sub-contractor endpoint (per Module PRD §8 "Sub-contractor — external"), Manufacturing invokes the endpoint via `ENG-023` at configured invocation points. The Sub-contractor is an external actor and is not owned by Manufacturing.

Ownership boundaries authored in `SPR-MOD-009-001` §1.1, `SPR-MOD-009-002` §1.1, and `SPR-MOD-009-003` §1.1 SHALL NOT be redefined here.

### 1.2 In Scope

- **Sub-contract Challan transaction lifecycle:** create, edit, submit, approve, dispatch, receive return, reconcile, close, cancel, and archive Sub-contract Challans under a tenant/company. Each Challan references a Sub-contractor (external) and one or more BOM composition items authored in `SPR-MOD-009-001`.
- **Dispatch and return capture:** record dispatched quantities on the Challan and record returned quantities against the Challan; reconcile the pair per the Manufacturing-owned reconciliation state machine.
- **Ageing checks and return-window enforcement:** `ENG-012` Rules enforces the sub-contract return-window rule; ageing checks surface Challans that exceed the configured return window and flag them.
- **Event emission:** `SubContractDispatched` — published via `ENG-024` on dispatch, per the authoritative event catalog.
- **Sub-contractor integration via `ENG-023`** where configured on the (tenant, company) scope; opaque to Manufacturing business semantics.
- **Workflow and approval:** Sub-contract Challan approval and lifecycle transitions run through `ENG-010` Workflow and `ENG-011` Approval per Manufacturing configuration authored in `SPR-MOD-009-001`.
- **Automation triggers:** consumption-driven automation via `ENG-013` for ageing-flag transitions and follow-up notifications.
- **Document and attachment surfaces:** Sub-contract Challan documents (via `ENG-007`) and attachments (via `ENG-008`).
- **Audit:** every Sub-contract Challan lifecycle transition and every return-window flag event is audited via `ENG-004` per `ADR-014`.
- **Notifications:** coordinator, planner, and approver notifications via `ENG-025` at configured lifecycle transitions and on return-window flag events.

### 1.3 Out of Scope

- Work Order and Production Entry transactions and shopfloor execution — `SPR-MOD-009-003`.
- Quality Inspection, quality-rejection handling, and yield/scrap — `SPR-MOD-009-005`.
- Manufacturing analytics, dashboards, exports, audit-readiness surface — `SPR-MOD-009-006`.
- Item master, stock ledger, inventory movements, reservations — owned by MOD-005 Inventory.
- Financial postings for sub-contract dispatch or receipt — owned by MOD-002 Accounting.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Sub-contractor master authoring — treated as an external actor per Module PRD §8; if a Sub-contractor master exists in a partner module, it is consumed read-only and is not redefined here.
- Cross-module KPI definitions — owned by MOD-017 Analytics.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-009-004`:

- **Business capabilities.**
  - A Sub-contracting Coordinator can raise, edit, submit, approve, dispatch, receive, reconcile, close, cancel, and archive Sub-contract Challans under a tenant/company.
  - Dispatched and returned quantities are captured on the Challan and reconciled per the Manufacturing-owned reconciliation state.
  - `SubContractDispatched` events are published via `ENG-024` on dispatch.
  - Sub-contractor integrations are invoked via `ENG-023` where configured on the (tenant, company) scope.
  - The sub-contract return-window rule is enforced via `ENG-012`; Challans exceeding the window are flagged and surfaced.
- **Workflow and approval.** Sub-contract Challan approval and lifecycle flows registered via `ENG-010` and `ENG-011`, keyed to Manufacturing configuration authored in `SPR-MOD-009-001`.
- **Event registration.** Publisher-side registration for `SubContractDispatched` declared and wired against `ENG-024` per the authoritative event catalog.
- **Audit artifacts.** An audit record exists for every Sub-contract Challan lifecycle transition and every return-window flag event via `ENG-004`.
- **Notification artifacts.** Coordinator, planner, and approver notifications wired via `ENG-025` at configured lifecycle transitions and on return-window flag events.
- **Document and attachment artifacts.** Sub-contract Challan documents rendered via `ENG-007`; attachments surfaced via `ENG-008`.
- **Documentation updates.** This Sprint PRD; sprint catalog entry for `SPR-MOD-009-004`.
- **Migration artifacts.** *N/A at PRD authoring time.*

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-009 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Sub-contracting; submodule Sub-contracting | Sub-contract Challan transaction lifecycle, dispatch/return reconciliation, ageing checks |
| §3 Personas — Sub-contracting Coordinator (primary), Production Planner (secondary), Approver (secondary) | User stories (§4) |
| §4 Business Processes — Sub-contract dispatch and return | End-to-end raise → dispatch → return → reconcile → close flow |
| §6 Transactions — Sub-contract Challan | Transaction lifecycle authored here |
| §7 Business Rules — "Sub-contract material must return within the configured window or is flagged" | Rule enforced via `ENG-012` |
| §8 Integration Points — `SubContractDispatched` (published); Sub-contractor (external) | Event emission via `ENG-024`; external integration via `ENG-023` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved Manufacturing Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Sub-contracting (§2) | `SPR-MOD-009-004` |

This allocation is unique; no other Manufacturing sprint claims "Sub-contracting" as an originating capability. The **Sub-contracting** submodule (Sprint Plan §4.2) is originating-allocated exclusively to `SPR-MOD-009-004`.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Sub-contracting* and submodule *Sub-contracting* → this Sprint PRD → deliverables in §2.
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3; every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a Sub-contracting Coordinator, I want to raise a Sub-contract Challan against a Sub-contractor referencing BOM composition items, so that sub-contract intent is captured with an authoritative record.*
- **US-002.** *As a Sub-contracting Coordinator, I want to progress the Challan through its lifecycle (draft → submitted → approved → dispatched → returned → reconciled → closed), so that sub-contract state remains deterministic and auditable.*
- **US-003.** *As a Sub-contracting Coordinator, I want dispatched and returned quantities recorded on the Challan and reconciled, so that Manufacturing-owned facts are accurate and downstream stock movements can be posted by MOD-005.*
- **US-004.** *As a Sub-contracting Coordinator, I want the sub-contract return-window rule enforced via `ENG-012`, and Challans exceeding the window flagged and surfaced, so that ageing is visible and actionable.*
- **US-005.** *As a downstream module (MOD-005 Inventory, MOD-009 Sprint 6, MOD-017 Analytics), I want `SubContractDispatched` published via `ENG-024`, so that downstream state transitions can occur without redefining Manufacturing semantics.*
- **US-006.** *As a tenant/company with a configured Sub-contractor endpoint, I want the sub-contract surface to invoke the endpoint via `ENG-023`, so that external systems remain synchronized without cross-cutting Manufacturing business rules.*
- **US-007.** *As a Sub-contracting Coordinator or approver, I want approval to run through `ENG-010` Workflow and `ENG-011` Approval keyed to Manufacturing configuration authored in Sprint 1.*
- **US-008.** *As a Coordinator, I want Sub-contract Challan documents rendered via `ENG-007` and attachments surfaced via `ENG-008`.*
- **US-009.** *As a security reviewer, I want every Sub-contract Challan lifecycle transition and return-window flag audited via `ENG-004`.*

---

## 5. Acceptance Criteria

Given / When / Then. Objective and testable.

### 5.1 Sub-contract Challan intake and lifecycle (US-001, US-002)

- **Given** a valid Sub-contract Challan creation request under a tenant/company that references a Sub-contractor and BOM composition items whose parent BOM is active in the same company,
  **when** a Coordinator submits it,
  **then** the Challan is persisted with a stable identifier unique within the company and creation is audited.
- **Given** a Challan request that references BOM composition items in a different company, an archived parent BOM, or an unknown Sub-contractor,
  **when** submitted,
  **then** the request is rejected deterministically.
- **Given** a Sub-contract Challan in any lifecycle state,
  **when** the Coordinator transitions it (submit, approve, dispatch, receive return, reconcile, close, cancel, archive),
  **then** the transition is validated against the Manufacturing-owned lifecycle state machine, persisted deterministically, and audited.

### 5.2 Dispatch and return reconciliation (US-003)

- **Given** an approved Sub-contract Challan,
  **when** the Coordinator dispatches material,
  **then** dispatched quantities are persisted on the Challan, the Challan transitions to dispatched, and `SubContractDispatched` is published via `ENG-024`.
- **Given** a dispatched Sub-contract Challan,
  **when** the Coordinator records a return,
  **then** returned quantities are persisted, the reconciliation state advances deterministically, and the reconciliation event is audited.
- **Given** a Challan whose returned quantities cannot be reconciled against dispatched quantities per the Manufacturing-owned reconciliation state,
  **when** reconciliation is attempted,
  **then** the reconciliation is rejected deterministically and the outcome is audited.

### 5.3 Ageing and return-window rule (US-004)

- **Given** the sub-contract return-window configuration authored in `SPR-MOD-009-001` resolved for the Challan's (tenant, company) scope via `ENG-005`,
  **when** a dispatched Sub-contract Challan exceeds the configured window without full return,
  **then** `ENG-012` Rules flags the Challan; the flag state is persisted on the Challan and audited; a notification is emitted via `ENG-025`.
- **Given** a flagged Challan,
  **when** the outstanding quantity is fully returned within a corrective transition,
  **then** the flag is cleared deterministically and the change is audited.

### 5.4 Event emission (US-005)

- **Given** a Sub-contract Challan dispatch,
  **when** it completes,
  **then** exactly one `SubContractDispatched` event is published via `ENG-024` per the authoritative event catalog envelope and delivery guarantee.

### 5.5 Sub-contractor integration (US-006)

- **Given** a tenant/company with a configured Sub-contractor endpoint,
  **when** a Sub-contract Challan lifecycle transition occurs at a configured invocation point,
  **then** `ENG-023` invokes the endpoint deterministically and the outcome is audited via `ENG-004`.
- **Given** a tenant/company with no configured endpoint,
  **when** the transition occurs,
  **then** no invocation is attempted and Manufacturing state advances normally.

### 5.6 Workflow and approval (US-007)

- **Given** the Manufacturing approval-threshold configuration authored in `SPR-MOD-009-001` resolved via `ENG-005`,
  **when** a Sub-contract Challan is submitted for approval,
  **then** `ENG-010` Workflow drives the appropriate approval steps and `ENG-011` records approver decisions; every state transition is audited.

### 5.7 Document and attachment (US-008)

- **Given** a Sub-contract Challan,
  **when** the corresponding document is requested,
  **then** it is rendered via `ENG-007` bound to the authoritative Challan record.
- **Given** a Sub-contract Challan,
  **when** an attachment is added or removed,
  **then** the attachment is persisted via `ENG-008` and the operation is audited.

### 5.8 Audit (US-009)

- **Given** any Sub-contract Challan lifecycle transition or return-window flag event,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, Challan identifier, transition/flag type, and timestamp.

### 5.9 Isolation invariants (`ADR-011`)

- **Given** any Sub-contract Challan read, write, or event publication,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant operation can succeed.

### 5.10 Ownership consumption invariants

- **Given** any Manufacturing code path that consumes or returns stock material via sub-contract,
  **when** stock state must reflect the transition,
  **then** the Manufacturing event (`SubContractDispatched`) is emitted for MOD-005 to consume; the stock ledger is not written by this sprint.
- **Given** any sub-contract event with financial consequence,
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
- **Module PRD sections fulfilled:** §2 (Sub-contracting; submodule Sub-contracting), §3 (personas), §4 (Sub-contract dispatch and return), §6 (Sub-contract Challan), §7 (sub-contract return-window rule), §8 (`SubContractDispatched` published; Sub-contractor external), §12 (Engine consumption), §13 (Dependencies).

---

## 7. Dependencies

- **Parent:** `MOD-009` MODULE_PRD.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-009-001` — Manufacturing Foundation (BOM & Routing).
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, hierarchy, users/roles/permissions, audit review.
  - [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen) — consumer of `SubContractDispatched` for stock movements.
- **Downstream sprints:** `SPR-MOD-009-006` consumes Sub-contract Challan data and Sub-contract Ageing reports.
- **Peer relationship:** `SPR-MOD-009-004` and `SPR-MOD-009-003` are independent per Sprint Plan §7; sub-contract is not a prerequisite for Work Order execution and vice versa.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined**. Each engine is a subset of the Module PRD engine union per Module PRD §12 and matches Sprint Plan §5 (Engine Consumption Map) for `SPR-MOD-009-004`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on Sub-contract Challan actions. |
| `ENG-004` Audit | Records every Sub-contract Challan lifecycle transition and return-window flag event. |
| `ENG-007` Document | Renders Sub-contract Challan documents. |
| `ENG-008` Attachment | Persists attachments against Sub-contract Challans. |
| `ENG-010` Workflow | Drives the Sub-contract Challan lifecycle deterministically. |
| `ENG-011` Approval | Records approver decisions per Manufacturing approval-threshold configuration. |
| `ENG-012` Rules | Evaluates structural validations and enforces the sub-contract return-window rule. |
| `ENG-013` Automation | Automates ageing-flag transitions and follow-up notifications. |
| `ENG-023` Integration | Invokes configured external Sub-contractor endpoints at the configured invocation points. |
| `ENG-024` Eventing | Publishes `SubContractDispatched` per the authoritative event catalog. |
| `ENG-025` Notification | Emits notifications at configured lifecycle transitions and on return-window flag events. |

Manufacturing business semantics (Sub-contract Challan lifecycle, reconciliation state, return-window enforcement, event emission triggers) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model enforced on every Sub-contract Challan, integration invocation, and event publication. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Sub-contract Challan actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Sub-contract Challan | MOD-009 (this sprint) | Authoritative sub-contract transaction record referencing a Sub-contractor and BOM composition items. |
| Sub-contract Dispatch Line | MOD-009 (this sprint) | Manufacturing-owned line recording dispatched quantities against a Challan. |
| Sub-contract Return Line | MOD-009 (this sprint) | Manufacturing-owned line recording returned quantities against a Challan. |
| Sub-contract Reconciliation State | MOD-009 (this sprint) | Manufacturing-owned reconciliation state across dispatch and return lines. |
| Sub-contract Ageing Flag | MOD-009 (this sprint) | Manufacturing-owned flag state produced by `ENG-012` when a dispatched Challan exceeds the configured return window. |
| Sub-contract Challan Document / Attachment | MOD-009 (this sprint, via `ENG-007` / `ENG-008`) | Rendered document and supporting attachments bound to the Challan. |
| Sub-contractor Integration Invocation Record | MOD-009 (this sprint) | Manufacturing-owned record of `ENG-023` invocation outcomes at Sub-contract invocation points. |

### 10.2 Relationships

- A **company** (owned by MOD-001) owns zero or more **Sub-contract Challans**.
- A **Sub-contract Challan** MUST reference exactly one **Sub-contractor** (external actor per Module PRD §8) and one or more BOM composition items owned by a Sprint-1 BOM in the same company.
- A **Sub-contract Challan** MAY have zero or more **Dispatch Lines** and zero or more **Return Lines**; the reconciliation state is derived from both.
- A **Sub-contract Challan** MAY have at most one active **Ageing Flag** at a time; the flag is cleared by corrective transitions.
- A **Sub-contract Challan** MAY have zero or more attachments and exactly one rendered document per rendered request.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-009` per the Manufacturing Ownership Convention (§1.1).
- The **BOM** and its composition items are owned by `SPR-MOD-009-001` and consumed read-only here.
- The **Item** entity and stock-ledger state are owned by MOD-005 Inventory and consumed read-only; not Manufacturing-owned.
- The **Sub-contractor** is an external actor per Module PRD §8; not Manufacturing-owned.
- Financial-posting entities are owned by MOD-002 Accounting; not Manufacturing-owned.

Physical schema is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md).

### 11.1 Published

| Event | Trigger | Consumed By (per authoritative catalog) |
| --- | --- | --- |
| `SubContractDispatched` | A Sub-contract Challan transitions to dispatched. | MOD-005 Inventory (stock movements for dispatched material), MOD-009 Sprint 6, MOD-017 Analytics. |

### 11.2 Consumed

Sprint 4 consumes **no new domain events**. Transitions are driven by Manufacturing-owned actions on the Sub-contract Challan; automation via `ENG-013` operates over Manufacturing-owned state, not over external events consumed here.

Payload contracts remain owned by the authoritative event catalog. Any event name not present in the authoritative event catalog at authoring time is mapped to its authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

---

## 12. Definition of Done

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Sub-contract Challan, integration invocation, and event publication.
- [ ] Every Sub-contract Challan lifecycle transition and return-window flag event produces an audit record via `ENG-004`.
- [ ] `SubContractDispatched` is published via `ENG-024` per the authoritative event catalog envelope and delivery guarantee.
- [ ] The sub-contract return-window rule is enforced via `ENG-012`, demonstrated to flag over-window Challans and clear flags on corrective transition.
- [ ] Sub-contractor integrations are invoked via `ENG-023` where configured and audited.
- [ ] Manufacturing configuration authored in `SPR-MOD-009-001` is consumed via `ENG-005`; no new configuration keys are registered here.
- [ ] Automated tests exist and pass per the authoritative testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-009_SPRINT_PLAN.md` §2 (`SPR-MOD-009-004`):

- Sub-contract Challans can be dispatched, returned, and reconciled.
- The sub-contract return-window rule is enforced via `ENG-012`.
- `SubContractDispatched` events are published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **Risk ID:** R-01
  - **Description:** MOD-009 depends on `SPR-MOD-009-001` BOM composition and Manufacturing configuration (including the return-window key) being stable.
  - **Impact:** Regressions against Sprint 1 corrupt Challan composition and ageing enforcement.
  - **Mitigation:** Treat Sprint 1 outputs as an internal contract; escalate drift as a Sprint 1 defect.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Downstream MOD-005 stock movements depend on the `SubContractDispatched` event contract being stable per the authoritative event catalog.
  - **Impact:** Envelope drift would corrupt stock movements.
  - **Mitigation:** Publish only per the authoritative event catalog; escalate envelope changes through event-catalog governance.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Sub-contractor endpoints are external systems outside Manufacturing ownership.
  - **Impact:** External failures could stall sub-contract state advancement if not correctly surfaced.
  - **Mitigation:** Encapsulate all external calls behind `ENG-023`; surface failures via `ENG-004` audit and `ENG-025` notifications; decouple Manufacturing state advancement from external success where tenants have not opted in.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** The Sub-contractor master is treated as an external actor per Module PRD §8; a partner-module Sub-contractor entity, if present, is consumed read-only.
  - **Impact:** Silent redefinition of the Sub-contractor entity inside Manufacturing would violate ownership boundaries.
  - **Mitigation:** Enforce the Manufacturing ↔ external Sub-contractor boundary; do not author a Manufacturing-owned Sub-contractor master.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Scope-creep from downstream sprints (`SPR-MOD-009-005` quality, `SPR-MOD-009-006` analytics) into this sprint.
  - **Impact:** Silent absorption of downstream scope would dilute the sub-contract surface.
  - **Mitigation:** Enforce the §1.3 out-of-scope list.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Manufacturing MUST NOT maintain its own stock ledger or write journal entries.
  - **Impact:** Blurring these boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Manufacturing ↔ Inventory (§1.1.2) and Manufacturing ↔ Accounting (§1.1.3) boundaries.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** Published event `SubContractDispatched` MUST be registered in the authoritative event catalog before this sprint enters `In Progress`.
  - **Impact:** Missing or drifted registration would break stock-movement paths in MOD-005.
  - **Mitigation:** Register/verify via event-catalog governance before the sprint begins; do not modify the event catalog inside this sprint.
  - **Status:** Deferred

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md).

- **Unit** — Sub-contract Challan state-machine transitions; dispatch/return line validations; reconciliation invariants; return-window rule evaluation via `ENG-012`; approval routing per threshold configuration.
- **Integration** — audit via `ENG-004`, configuration via `ENG-005`, document via `ENG-007`, attachment via `ENG-008`, workflow via `ENG-010`, approval via `ENG-011`, rules via `ENG-012`, automation via `ENG-013`, external invocation via `ENG-023`, event publication via `ENG-024`, notification via `ENG-025`.
- **Contract** — `SubContractDispatched` event envelope per the authoritative event catalog; Sub-contractor invocation surface exposed by `ENG-023`.
- **End-to-end (smoke)** — Raise-to-close smoke across a two-tenant / two-company fixture to verify `ADR-011` isolation; over-window ageing smoke to verify `ENG-012` flag emission and `ENG-025` notification.

Sprint-specific fixtures: a BOM composition fixture from Sprint 1, a Sub-contractor endpoint stub for `ENG-023`, a two-company smoke fixture, and a time-advance harness for return-window ageing.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing.*

- Consider modeling the Sub-contract Challan lifecycle and the reconciliation state as two orthogonal FSMs so audit and event emission compose cleanly.
- Consider evaluating the return-window rule as a pure `ENG-012` predicate over Challan age and outstanding-return quantity so the flag is observable and idempotent.
- Consider tying `SubContractDispatched` emission to the durable dispatch commit so envelope drift is impossible without a corresponding lifecycle regression.
- Consider encapsulating external Sub-contractor invocation behind a single `ENG-023`-facing seam so failures are localized.
- Consider co-locating ageing-flag notifications with the flag transition so `ENG-025` fires deterministically with the `ENG-004` audit record.

These notes are **non-authoritative**.

---

## 17. Review Gate

1. **Does the sprint have exactly one objective?** Yes. Deliver the Sub-contract dispatch and return process (§1.1).
2. **Does every feature trace to a specific Module PRD section?** Yes. See §3 and §3.2.
3. **Are engines and ADRs consumed rather than redefined?** Yes. §8 and §9.
4. **Are out-of-scope items enumerated and linked to their owning sprints?** Yes. §1.3.
5. **Are acceptance criteria objective and testable?** Yes. §5.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?** Yes. §2, §12, §13 distinct.
7. **Does the next reserved sprint (`SPR-MOD-009-005`) begin immediately after this one completes?** Yes. Quality, Yield & Scrap is the immediate successor per Sprint Plan §2.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-009_SPRINT_PLAN.md`](./MOD-009_SPRINT_PLAN.md)
- Predecessor Sprints — [`./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md`](./SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md), [`./SPR-MOD-009-002-production-planning-and-scheduling.md`](./SPR-MOD-009-002-production-planning-and-scheduling.md), [`./SPR-MOD-009-003-work-orders-and-shopfloor-execution.md`](./SPR-MOD-009-003-work-orders-and-shopfloor-execution.md)
- Upstream Module Baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
