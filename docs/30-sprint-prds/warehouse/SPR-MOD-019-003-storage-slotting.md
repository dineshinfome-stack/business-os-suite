---
title: "SPR-MOD-019-003 — Storage & Slotting"
summary: "Sprint PRD for the storage and slotting layer of MOD-019 Warehouse: bin allocation strategy configuration per zone, slotting rule master, slotting change order lifecycle with approval, and internal replenishment task lifecycle driven by `InventoryLowStock` (MOD-005). Consumes ERP Core Engines and Accepted ADRs; never redefines them. Does not own item master, warehouse master, bin master, stock ledger, reorder policy, or valuation (owned by MOD-005 Inventory)."
layer: "delivery"
owner: "Operations"
status: "Draft"
updated: "2026-07-11"
sprint_id: "SPR-MOD-019-003"
parent_module: "MOD-019"
parent_sprint_plan: "MOD-019_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "8.9.4"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-017", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
related_events: ["SlottingChangeApplied", "InternalReplenishmentCompleted", "InventoryLowStock"]
tags: ["sprint", "prd", "warehouse", "storage", "slotting", "mod-019"]
document_type: "Sprint PRD"
---

# SPR-MOD-019-003 — Storage & Slotting

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-019 Warehouse** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-019-003` (permanent) |
| Parent Module | `MOD-019` — Warehouse |
| Parent Sprint Plan | [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Owner | Operations (inherited verbatim from parent Module PRD `docs/20-module-prds/warehouse/MODULE_PRD.md`) |
| Upstream Sprints | [`SPR-MOD-019-001`](./SPR-MOD-019-001-warehouse-foundation.md) (Warehouse Foundation), [`SPR-MOD-019-002`](./SPR-MOD-019-002-inbound-execution.md) (Inbound Execution) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`MOD005_INVENTORY_BASELINE_v1`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (all frozen) |
| Downstream Sprints | `SPR-MOD-019-004` … `SPR-MOD-019-006` |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Storage & Slotting** layer of BusinessOS Warehouse operations: bin allocation strategy configuration per warehouse zone (registered by Sprint 001), the slotting rule master, slotting change order lifecycle with configurable-threshold approval, and the internal replenishment task lifecycle driven by the `InventoryLowStock` event owned by MOD-005 Inventory. Storage & Slotting overlays the Inventory-owned warehouse/bin master and never redefines it. All state-changing operations are emitted as domain events; the corresponding stock ledger effect of any physical movement remains owned by MOD-005 Inventory.

> **Storage & Slotting Ownership Convention.** MOD-019 Warehouse owns the operational lifecycle of bin allocation strategy configuration (per zone), the slotting rule master, the slotting change order lifecycle with its approval, and the internal replenishment task lifecycle. Warehouse emits storage and slotting domain events and consumes read-only warehouse/bin master, item master, and stock balance surfaces from MOD-005 Inventory, plus the `InventoryLowStock` event. Warehouse does **not** own the stock ledger, reorder policy, valuation, item master, warehouse master, or bin master. This complements — and does not redefine — the ownership boundaries established by `MOD001_PLATFORM_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, `SPR-MOD-019-001`, and `SPR-MOD-019-002`.

#### 1.1.1 Inventory Ledger Boundary

**Architectural invariant.** Inventory transactions SHALL occur only through approved Inventory (`MOD-005`) module integration contracts. This Sprint SHALL NOT directly mutate inventory balances or valuation, and SHALL NOT write to the stock ledger. Internal replenishment task completion emits `InternalReplenishmentCompleted` via `ENG-024` Event Engine; MOD-005 Inventory owns the corresponding stock movement effect on the ledger. Warehouse never writes to the ledger and never derives valuation.

#### 1.1.2 Master Data Consumption Boundary

Item master, unit-of-measure master, warehouse master, bin/location master, and stock balance are owned by MOD-005 Inventory per `MOD005_INVENTORY_BASELINE_v1`. This sprint MUST NOT create, edit, archive, or independently maintain any of these entities. Bin allocation strategies resolve against the MOD-005 bin master via read-only APIs; slotting change orders reference — but do not modify — bin master records. No parallel copy of Inventory master data is created here.

#### 1.1.3 Reorder Policy Boundary

Reorder policy, replenishment policy, and item-level stock triggers are owned by MOD-005 Inventory. This sprint MUST NOT define, edit, or shadow reorder policies. The `InventoryLowStock` event is consumed as an external driver; the Warehouse-internal replenishment task lifecycle is a physical-movement lifecycle, not a reorder policy.

#### 1.1.4 Foundation Consumption Boundary

Warehouse zone master, warehouse area master, dock door master, equipment master, labor resource master, task type registry, warehouse operations configuration namespace, and warehouse numbering series registrations are owned by `SPR-MOD-019-001`. This sprint consumes those foundations and MUST NOT redefine them. Bin allocation strategy configuration is scoped per zone (registered by Sprint 001) through the configuration namespace established by Sprint 001.

#### 1.1.5 Inbound Execution Boundary

Inbound dock appointment, unloading task, inbound quality inspection hold, putaway task, and the emission of `InboundAppointmentScheduled`, `UnloadingCompleted`, and `PutawayCompleted` are owned by `SPR-MOD-019-002`. This sprint MUST NOT redefine inbound execution. Putaway target-bin resolution logic is not re-implemented here; bin allocation strategy configuration is consumed by putaway (Sprint 002) at runtime but authored here.

#### 1.1.6 Accounting Boundary

Accounting (`MOD-002`) owns accounting vouchers, journal posting, ledger posting, and financial reporting. Storage & Slotting MUST NOT create accounting journals, ledger entries, or accounting voucher lifecycles. Warehouse events may be consumed by MOD-002 downstream; that consumption is not owned here.

#### 1.1.7 Governance Complement

This Sprint complements — and does not redefine — `MOD001_PLATFORM_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, `SPR-MOD-019-001`, and `SPR-MOD-019-002`. Ownership established by those artifacts is consumed and preserved; it is not overridden here. No ownership boundary is redefined by this sprint.

### 1.2 In Scope

- **Bin Allocation Strategy Configuration.** Authoring, editing, activating, and archiving bin allocation strategies (directed, discretionary, fixed) scoped per warehouse zone (from Sprint 001), resolved via `ENG-005` Configuration Engine under the namespace registered by Sprint 001.
- **Slotting Rule Master.** Creation, edit, activation, and archival of slotting rules (item-class-to-zone affinity, velocity, size class, hazardous-material class) as the authored ruleset consumed by slotting change orders and by putaway (Sprint 002) at runtime.
- **Slotting Change Order Lifecycle.** Draft, submission, threshold-based approval routing via `ENG-011`, approved application, and archival of slotting change orders. Slotting changes above the configured impact threshold require approval; below-threshold changes SHALL follow the streamlined path defined by `ENG-010` workflow.
- **Slotting Approval.** Multi-step approval on slotting change orders exceeding the impact threshold, evaluated through `ENG-011` Approval Engine per `ADR-032`.
- **Internal Replenishment Task Lifecycle.** Task seeding driven by consumption of `InventoryLowStock` (from MOD-005), task assignment to labor and equipment resources (from Sprint 001), execution recording, exception capture, and closure. Task completion emits `InternalReplenishmentCompleted`; MOD-005 owns the ledger effect of the corresponding physical movement.
- **Slotting Change Application.** On approved application, emit `SlottingChangeApplied` via `ENG-024`.
- **Slotting & Replenishment Exception Handling.** Recording and resolving slotting change conflicts (bin unavailable, capacity exceeded) and replenishment exceptions (source bin empty, target bin full) via `ENG-010` workflow.
- **Audit integration.** Every state-changing operation on the entities above is audited via `ENG-004` per `ADR-014`.
- **Authorization.** All operations are authorized via `ENG-002` under `ENG-003` permission definitions per `ADR-032`.
- **Numbering.** Concrete numbers for slotting change orders and internal replenishment tasks are issued via `ENG-017` from the series registered by Sprint 001.
- **Automation.** Threshold-triggered replenishment task seeding on `InventoryLowStock` consumption uses `ENG-013` Automation Engine.
- **Notification.** Operational notifications (slotting change submitted, slotting change approved, replenishment task assigned, replenishment exception raised) are emitted via `ENG-025`.

### 1.3 Out of Scope

- Warehouse zone master, area master, dock door master, equipment master, labor resource master, task type registry, dock appointment calendar, warehouse operations configuration namespace, warehouse numbering series **registration** — owned by `SPR-MOD-019-001`.
- Item master, unit-of-measure master, warehouse master, bin/location master, stock balance, stock ledger, reorder policy, valuation — owned by **MOD-005 Inventory**. This sprint consumes those read-only.
- Inbound execution (dock appointment, unloading, inspection hold, putaway task) — owned by `SPR-MOD-019-002`.
- Outbound execution (wave/batch/order pick plan, pick task, pack task, outbound quality check) — owned by `SPR-MOD-019-004`.
- Yard, dock, and load-out execution (outbound dock appointment, loading task, dispatch handover) — owned by `SPR-MOD-019-005`.
- Warehouse labor assignment execution reporting, labor productivity, equipment utilization, KPIs, dashboards, audit-readiness surface — owned by `SPR-MOD-019-006`.
- Purchase, sales, and manufacturing document ownership — owned by MOD-004, MOD-003, MOD-009 respectively.
- Accounting vouchers, journal posting, ledger posting — owned by **MOD-002 Accounting**.
- Concrete database schema, API contracts, UI mockups, source code, migrations, RLS policies.
- Numbering algorithms, authorization enforcement logic, audit persistence, event dispatch machinery, workflow state machines, approval routing machinery, automation-rule dispatch — implemented by the respective engines.

## 2. Sprint Scope

### 2.1 In-Scope Business Capabilities

Aligned verbatim with the authoritative Capability Allocation Matrix in [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md) §4.1 for `SPR-MOD-019-003`:

- Storage and slotting (bin allocation strategies, slotting optimization, internal replenishment tasks).

Master data entity allocated to this sprint (Sprint Plan §4.3):

- Slotting Rule.

Transactional entities allocated to this sprint (Sprint Plan §4.3):

- Slotting Change Order, Internal Replenishment Task.

Business processes allocated to this sprint (Sprint Plan §4.4 / Module PRD §4):

- Internal replenishment, Slotting optimization.

### 2.2 Out-of-Scope Business Capabilities

Every capability originating in a sibling sprint is excluded here:

- Warehouse operations configuration and foundation masters — owned by `SPR-MOD-019-001`.
- Inbound execution — owned by `SPR-MOD-019-002`.
- Outbound execution — owned by `SPR-MOD-019-004`.
- Yard, dock, and load-out — owned by `SPR-MOD-019-005`.
- Warehouse labor, equipment, and analytics — owned by `SPR-MOD-019-006`.

No capability allocated to `SPR-MOD-019-001`, `SPR-MOD-019-002`, or `SPR-MOD-019-004` … `SPR-MOD-019-006` is implemented in this Sprint PRD.

## 3. Business Capabilities

Each capability is traceable to the parent [MOD-019 Warehouse Module PRD](../../20-module-prds/warehouse/MODULE_PRD.md).

- **BC-001 — Bin Allocation Strategy Configuration.** Author and activate bin allocation strategies per zone via `ENG-005`. Parent Module PRD §2, §10.
- **BC-002 — Slotting Rule Master Lifecycle.** Create, edit, activate, and archive slotting rules. Parent Module PRD §2, §5.
- **BC-003 — Slotting Change Order Lifecycle.** Draft, submit, approve above threshold, apply, and archive slotting change orders. Parent Module PRD §2, §6, §7.
- **BC-004 — Slotting Approval.** Threshold-based multi-step approval on slotting change orders. Parent Module PRD §7, §11.
- **BC-005 — Internal Replenishment Task Lifecycle.** Seed, assign, execute, and close internal replenishment tasks driven by `InventoryLowStock`. Parent Module PRD §2, §4, §6.
- **BC-006 — Slotting & Replenishment Exception Handling.** Record and resolve slotting conflicts and replenishment exceptions. Parent Module PRD §4, §7.
- **BC-007 — Slotting & Replenishment Event Emission.** Emit `SlottingChangeApplied` and `InternalReplenishmentCompleted` via `ENG-024`. Parent Module PRD §8.

## 4. Functional Requirements

### 4.1 Bin Allocation Strategy Configuration

- FR-001: The system SHALL allow authorized configurators to author bin allocation strategies (directed, discretionary, fixed) scoped per zone registered by `SPR-MOD-019-001`.
- FR-002: The system SHALL resolve the effective bin allocation strategy for any (tenant, company, warehouse, zone) tuple via `ENG-005` Configuration Engine under the namespace registered by Sprint 001.
- FR-003: The system SHALL audit every strategy authoring, edit, activation, and archival event via `ENG-004` per `ADR-014`.

### 4.2 Slotting Rule Master

- FR-004: The system SHALL allow authorized configurators to create, edit, activate, and archive slotting rules that map item classes, velocity, size class, and hazardous-material class to eligible zones.
- FR-005: The system SHALL validate slotting rule structure (required fields, referential integrity to zone, mutually exclusive classes) via `ENG-012` Rules Engine at capture time.
- FR-006: The system SHALL audit every slotting rule lifecycle event via `ENG-004`.

### 4.3 Slotting Change Order Lifecycle

- FR-007: The system SHALL allow authorized operators to draft, submit, and archive slotting change orders that reference existing slotting rules and target bins (read-only from MOD-005).
- FR-008: The system SHALL issue the slotting change order number via `ENG-017` from the series registered by Sprint 001.
- FR-009: The system SHALL evaluate the configured slotting impact threshold via `ENG-012` on submission; slotting change orders exceeding the threshold SHALL route to `ENG-011` Approval Engine for multi-step approval per `ADR-032`; below-threshold changes SHALL follow the streamlined `ENG-010` workflow path.
- FR-010: The system SHALL publish `SlottingChangeApplied` via `ENG-024` on approved application of a slotting change order.
- FR-011: The system SHALL reject application of a slotting change order whose target bin cannot be resolved through the MOD-005 read API or whose capacity constraint is violated per `ENG-012` rules.

### 4.4 Internal Replenishment Task Lifecycle

- FR-012: The system SHALL consume `InventoryLowStock` (from MOD-005 Inventory) as an external driver for seeding internal replenishment tasks.
- FR-013: The system SHALL seed replenishment tasks via `ENG-013` Automation Engine, bound to source and target bins (resolved via MOD-005 read APIs), assigned labor, and assigned equipment (from Sprint 001).
- FR-014: The system SHALL issue the internal replenishment task number via `ENG-017` from the series registered by Sprint 001.
- FR-015: The system SHALL record replenishment execution progress (quantity moved, exceptions, timestamps) and transition the task through its lifecycle states via `ENG-010` workflow.
- FR-016: The system SHALL publish `InternalReplenishmentCompleted` via `ENG-024` on task closure. The corresponding stock movement effect on the ledger is owned by MOD-005 Inventory.

### 4.5 Slotting & Replenishment Exception Handling

- FR-017: The system SHALL record slotting change conflicts (bin unavailable, capacity exceeded, class mismatch) and replenishment exceptions (source bin empty, target bin full, insufficient labor) against the appropriate lifecycle stage.
- FR-018: The system SHALL route exception resolutions via `ENG-010` workflow; resolution outcomes SHALL be audited via `ENG-004`.

### 4.6 Notifications and Automation

- FR-019: The system SHALL emit operational notifications (slotting change submitted, slotting change approved, replenishment task assigned, exception raised, replenishment task completed) via `ENG-025` Notification Engine.
- FR-020: The system SHALL use `ENG-013` Automation Engine to fan out replenishment task seeding upon `InventoryLowStock` consumption, per rules resolved via `ENG-005`.

### 4.7 Consumed Events

- FR-021: The system SHALL consume `InventoryLowStock` (from MOD-005 Inventory) as the trigger for internal replenishment task seeding; the event owner remains MOD-005.

### 4.8 Audit, Authorization, Configuration

- FR-022: Every state-changing operation on §4.1–§4.7 SHALL emit an audit record via `ENG-004` per `ADR-014`.
- FR-023: Every operation SHALL be authorized via `ENG-002` under `ENG-003` permission definitions per `ADR-032`.
- FR-024: The slotting impact threshold, the replenishment automation rule, and the bin allocation strategy per zone SHALL all resolve via `ENG-005` Configuration Engine under the namespace registered by Sprint 001; no configuration is hard-coded.

## 5. Business Processes

Execution processes only; no master-data authoring outside this sprint's declared ownership.

- **BP-001 — Bin Allocation Strategy Authoring.** The Warehouse Configurator authors a bin allocation strategy per zone; the strategy is activated and resolved via `ENG-005` for downstream putaway (consumed by Sprint 002 at runtime).
- **BP-002 — Slotting Rule Authoring.** The Warehouse Planner authors slotting rules mapping item classes, velocity, size, and hazardous-material class to eligible zones; rules are validated by `ENG-012` and activated.
- **BP-003 — Slotting Optimization (Change Order Path).** The Warehouse Planner drafts a slotting change order; on submission, `ENG-012` evaluates the configured impact threshold; above-threshold orders route to `ENG-011` for approval, below-threshold follow the streamlined `ENG-010` path; on approved application, `SlottingChangeApplied` is published.
- **BP-004 — Internal Replenishment Seeding.** On consumption of `InventoryLowStock` (MOD-005), `ENG-013` seeds internal replenishment tasks bound to source and target bins and assigned resources.
- **BP-005 — Internal Replenishment Execution.** The Warehouse Operator executes the replenishment task, records progress, closes it, and `InternalReplenishmentCompleted` is published; MOD-005 owns the ledger effect.
- **BP-006 — Slotting & Replenishment Exception Resolution.** Exceptions raised at any lifecycle stage are routed via `ENG-010` workflow; resolutions are audited via `ENG-004`.

## 6. Governance

- **Tenant/Company/Warehouse/Zone hierarchy** per `ADR-011` Multi-Tenant Isolation. All entities in §4 are scoped under this hierarchy.
- **Authorization** per `ADR-032` (RBAC + ABAC) enforced by `ENG-002` and `ENG-003`.
- **Audit** per `ADR-014` enforced by `ENG-004`.
- **Workflow lifecycles** for slotting change orders and internal replenishment tasks are declared to `ENG-010`; no lifecycle state machine is reimplemented here.
- **Approval routing** for above-threshold slotting change orders is declared to `ENG-011`; no approval state machine is reimplemented here.
- **Configuration** for bin allocation strategy per zone, slotting impact threshold, and replenishment automation rule resolves via `ENG-005` under the namespace registered by `SPR-MOD-019-001`.
- **Governance registrations** for this Sprint PRD are maintained in `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`, and `docs/30-sprint-prds/warehouse/README.md`. No upstream authoritative document (`MODULE_CATALOG.md`, `ENGINE_CATALOG.md`, `ADR_INDEX.md`, `event-catalog.md`, `ENGINE_USAGE_MATRIX.md`, `MODULE_PRD.md`, `MOD-019_SPRINT_PLAN.md`, `MODULE_IMPLEMENTATION_WORKFLOW.md`) is modified by this sprint.

## 7. Ownership Boundaries

- **Owned by MOD-019 Warehouse (this sprint).** Slotting Rule (master), Slotting Change Order (transactional), Internal Replenishment Task (transactional), Bin Allocation Strategy configuration, Slotting & Replenishment Exception Records, emission of `SlottingChangeApplied` and `InternalReplenishmentCompleted`.
- **Consumed read-only from `SPR-MOD-019-001`.** Warehouse zone/area master, dock door master, equipment master, labor resource master, task type registry, warehouse operations configuration namespace, warehouse numbering series registrations.
- **Consumed read-only from `SPR-MOD-019-002`.** Inbound execution surface — no inbound entity is modified here; this sprint's bin allocation strategy configuration is consumed by putaway at runtime, not authored there.
- **Consumed read-only from MOD-005 Inventory.** Item master, unit-of-measure master, warehouse master, bin/location master, stock balance.
- **Consumed read-only from MOD-001 Platform Administration.** Tenant, Company, Branch, User, Role Registry.
- **Consumed as upstream event.** `InventoryLowStock` (owned by MOD-005 Inventory).
- **Not owned here.** Item master, warehouse master, bin master, stock balance, stock ledger, valuation, reorder policy (MOD-005); purchase, sales, and manufacturing documents; accounting posting (MOD-002); inbound execution (SPR-MOD-019-002); outbound execution (SPR-MOD-019-004); yard, dock, and load-out (SPR-MOD-019-005); warehouse analytics (SPR-MOD-019-006).
- **Architectural invariant.** Inventory transactions SHALL occur only through approved Inventory module integration contracts. This Sprint SHALL NOT directly mutate inventory balances or valuation. Warehouse emits events; MOD-005 owns all ledger writes.
- **Prohibited.** Writes to the Inventory stock ledger. Creation of item, warehouse, or bin master records. Authoring or shadowing of reorder policy. Accounting voucher creation. Redefinition of purchase, production, delivery, or inbound-execution document ownership. Numbering algorithm implementation. Approval routing state-machine implementation.

## 8. Dependencies

- **Parent Module PRD.** [`docs/20-module-prds/warehouse/MODULE_PRD.md`](../../20-module-prds/warehouse/MODULE_PRD.md).
- **Parent Sprint Plan.** [`MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md).
- **Preceding Sprint PRDs.** `SPR-MOD-019-001` — Warehouse Foundation; `SPR-MOD-019-002` — Inbound Execution.
- **Upstream frozen module baselines.** `MOD001_PLATFORM_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`.
- **Cross-module dependencies.** MOD-001 (tenant/company/branch/user), MOD-005 (warehouse/bin master read APIs, `InventoryLowStock` event). All resolve via `docs/MODULE_CATALOG.md`.

## 9. ERP Core Engine Consumption

Resolved verbatim from `MOD-019_SPRINT_PLAN.md` §2.003 for `SPR-MOD-019-003`. No engine behavior is redefined.

- **ENG-002 Authorization Engine.** Enforces role- and attribute-based authorization on every state-changing operation per `ADR-032`.
- **ENG-004 Audit Engine.** Emits an audit record for every state-changing operation on storage and slotting entities per `ADR-014`.
- **ENG-005 Configuration Engine.** Resolves bin allocation strategy per zone, slotting impact threshold, and replenishment automation rule under the namespace registered by Sprint 001.
- **ENG-010 Workflow Engine.** Owns state transitions for slotting change orders, internal replenishment tasks, and exception lifecycles.
- **ENG-011 Approval Engine.** Routes multi-step approval for slotting change orders whose impact exceeds the configured threshold.
- **ENG-012 Rules Engine.** Enforces slotting rule structure validation, slotting impact threshold evaluation, capacity constraint evaluation, and exception categorisation.
- **ENG-013 Automation Engine.** Fans out internal replenishment task seeding on consumption of `InventoryLowStock`.
- **ENG-017 Numbering Engine.** Issues concrete numbers for slotting change orders and internal replenishment tasks from series registered by Sprint 001.
- **ENG-024 Event Engine.** Publishes `SlottingChangeApplied` and `InternalReplenishmentCompleted`; consumes `InventoryLowStock`.
- **ENG-025 Notification Engine.** Delivers operational notifications for slotting change submission, approval, replenishment task assignment, exception, and task completion.

## 10. ADR Consumption

Resolved verbatim from `MOD-019_SPRINT_PLAN.md` §2.003. Only Accepted ADRs are referenced.

- **ADR-011 Multi-Tenant Isolation.** All storage and slotting entities are tenant-scoped; cross-tenant reads and writes are prohibited.
- **ADR-014 Audit Strategy.** Every state-changing operation on storage and slotting entities produces an audit record via `ENG-004`; audit fields, retention, and immutability follow the ADR.
- **ADR-032 RBAC + ABAC.** Authorization on every operation, including approval-routing decisions, combines role-based and attribute-based policies enforced by `ENG-002` under permission definitions from `ENG-003`.

## 11. Data Model

Business entities only; no schema is defined here.

- **Slotting Rule (master)** — rule identifier, item-class binding, velocity class, size class, hazardous-material class, eligible zone references (from Sprint 001), lifecycle status (Draft → Active → Inactive → Archived), tenancy binding.
- **Bin Allocation Strategy (configuration)** — strategy identifier, strategy type (directed, discretionary, fixed), zone binding (from Sprint 001), resolution scope (tenant, company, warehouse, zone), lifecycle status, tenancy binding.
- **Slotting Change Order** — order identifier, affected slotting rule(s), affected bin references (read-only from MOD-005), impact metric, approval state (via `ENG-011`), application status, tenancy binding.
- **Internal Replenishment Task** — task identifier, source bin (read-only from MOD-005), target bin (read-only from MOD-005), triggering `InventoryLowStock` reference, assigned labor, assigned equipment, execution progress, task status, tenancy binding.
- **Slotting & Replenishment Exception Record** — exception identifier, exception category, parent lifecycle entity (slotting change order or replenishment task), resolution outcome, resolution audit, tenancy binding.

Concrete schemas, indexes, RLS policies, and physical persistence choices are implementation activities and are explicitly out of scope for this PRD.

## 12. Events

Event identifiers are resolved verbatim from the parent Module PRD §8 and `MOD-019_SPRINT_PLAN.md` §2.003. No event identifier is invented by this Sprint PRD. Formal registration in `docs/02-architecture/event-catalog.md` is a downstream governance activity outside this sprint's ownership; where an identifier is not yet catalogued, this PRD references the Sprint-Plan-allocated name verbatim and does not introduce a substitute.

**Published (owned by this sprint):**

- `SlottingChangeApplied` — emitted on approved application of a slotting change order.
- `InternalReplenishmentCompleted` — emitted on closure of an internal replenishment task.

**Consumed (owned by upstream modules):**

- `InventoryLowStock` — from MOD-005 Inventory; drives internal replenishment task seeding.

## 13. Integration Contracts

- **MOD-005 Inventory read APIs (read-only).** Warehouse master, bin/location master, item master, and stock-balance resolution consumed via approved MOD-005 read APIs. No writes to Inventory-owned entities are permitted. No local caching that could diverge from MOD-005.
- **MOD-005 Inventory event consumption.** `InventoryLowStock` consumed via the platform event bus as the trigger for internal replenishment task seeding; the event owner remains MOD-005.
- **MOD-001 Platform Administration read APIs (read-only).** Tenant, company, branch, and user resolution consumed via approved MOD-001 read APIs.
- **Warehouse foundation configuration (from Sprint 001).** Zone, area, dock, equipment, labor, task-type, and configuration-namespace resolution via the read surface established by Sprint 001.
- **ERP Core Engine contracts.** Consumed as published by their respective engine documents; never restated here.
- **Concrete request/response shapes.** Defined during implementation, not in this PRD.

## 14. Security

- All storage and slotting entities are tenant-scoped per `ADR-011`.
- Cross-tenant reads and writes are prohibited and MUST be denied by `ENG-002`.
- Security-hardening standards (transport, secrets, encryption at rest) inherit from the platform baseline and are not restated here.

## 15. Authorization

- Authorization is enforced by `ENG-002` under permission definitions from `ENG-003` per `ADR-032`.
- Business-level roles referenced by this sprint (Warehouse Configurator, Warehouse Planner, Warehouse Operations Manager, Warehouse Operator, Auditor) are named for scoping purposes only; concrete grants and policies live in `ENG-003`.
- Approval-routing authorization for above-threshold slotting change orders is enforced by `ENG-011` under the same RBAC + ABAC framework.
- No authorization model is redefined in this Sprint PRD.

## 16. Operational Constraints

Inherited verbatim from Module PRD §11 and `docs/02-architecture/quality-attributes.md`:

- Interactive latency budget applies to slotting rule authoring, slotting change order submission, and replenishment task execution CRUD paths.
- Availability of MOD-005 read APIs gates all storage and slotting operations; slotting reads MUST degrade gracefully when MOD-005 is delayed.
- Compliance follows the Data Constitution and platform data-classification rules.
- Accessibility meets the platform baseline; enforcement lives in the design system, not this PRD.

## 17. Implementation Readiness

Sprint Exit Criteria — verbatim from `MOD-019_SPRINT_PLAN.md` §2.003:

- Bin allocation strategies resolve per zone via `ENG-005`.
- Slotting change orders route through `ENG-011` when impact threshold exceeded.
- Internal replenishment tasks execute against MOD-005 warehouse/bin master.
- `SlottingChangeApplied` and `InternalReplenishmentCompleted` events are published via `ENG-024`.

Sprint completion additionally requires:

- Every acceptance-testable functional requirement in §4 has at least one observable test covering it (Given/When/Then per `SPRINT_AUTHORING_GUIDE.md` §10).
- All governance registrations in §6 are recorded exactly once.
- Repository verification (Pass 8.9.4-V) reports 15/15 Passed.
- Post-Implementation Repository Audit (Spec v1.0) reports `Repository Status: READY`.

## 18. References

- [`docs/20-module-prds/warehouse/MODULE_PRD.md`](../../20-module-prds/warehouse/MODULE_PRD.md)
- [`docs/30-sprint-prds/warehouse/MOD-019_SPRINT_PLAN.md`](./MOD-019_SPRINT_PLAN.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-001-warehouse-foundation.md`](./SPR-MOD-019-001-warehouse-foundation.md)
- [`docs/30-sprint-prds/warehouse/SPR-MOD-019-002-inbound-execution.md`](./SPR-MOD-019-002-inbound-execution.md)
- [`docs/30-sprint-prds/warehouse/README.md`](./README.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- [`docs/MODULE_CATALOG.md`](../../MODULE_CATALOG.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
