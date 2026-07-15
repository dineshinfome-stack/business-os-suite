---
title: "MOD-009 Manufacturing — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-009 Manufacturing. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Operations"
status: "Approved"
updated: "2026-07-15"
module_id: "MOD-009"
module_name: "Manufacturing"
sprint_prefix: "SPR-MOD-009-"
stage: "1"
pass: "11.0.0"
parent_module_prd: "docs/20-module-prds/manufacturing/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
governance_specification: "v1.0"
template_standard: "v1.3"
authored_by_template: "GT-002"
execution_id: "GT002-MOD009-20260715T000600Z-001"
tags: ["sprint", "planning", "manufacturing", "mod-009", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-009 Manufacturing — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-009 Manufacturing** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## Normative Source Precedence

On any conflict, the following order wins:

1. `docs/20-module-prds/manufacturing/MODULE_PRD.md` (Module PRD)
2. This Capability Allocation Matrix (§4)
3. The sprint sections in §2 of this Sprint Plan
4. Any derived artifact

## 1. Purpose & Scope

Plan the implementation of MOD-009 Manufacturing by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD.

This plan introduces no new business requirements beyond the approved [MOD-009 Manufacturing Module PRD](../../20-module-prds/manufacturing/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Governance Boundaries (recapitulated).** Per the Module PRD §2:

- **Inventory movements and stock ledgers** are owned by **MOD-005 Inventory**. Manufacturing consumes material availability and emits production events; it does not maintain the stock ledger.
- **Financial postings** for HR-originating obligations are owned by **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. No sprint below writes journal entries.
- **Identity, authentication, and permissions** remain owned by **MOD-001 Platform Administration** via `ENG-001`, `ENG-002`, `ENG-003`.
- **Cross-module KPI definitions** remain owned by **MOD-017 Analytics**. Operational manufacturing reports are surfaced within MOD-009.

**Traceability:**

- Parent Module README — [`../../20-module-prds/manufacturing/README.md`](../../20-module-prds/manufacturing/README.md)
- Parent Module PRD — [`../../20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md)
- Upstream module baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-009 in `SPRINT_ROADMAP.md` is **6**; this plan aligns to **6**.

## 2. Proposed Sprint Sequence

### SPR-MOD-009-001 — Manufacturing Foundation (BOM & Routing)

- **Objective.** Establish Manufacturing foundations under a tenant/company: BOM, Routing, Work Center, Machine, and Operation master data, along with manufacturing configuration (default routing choice, scrap tolerance, approval thresholds, numbering series).
- **Boundaries.**
  - In: BOM master, Routing master, Work Center, Machine, Operation master; manufacturing configuration.
  - Out: production planning, work-order execution, sub-contracting, quality, analytics; stock ledger (owned by MOD-005); identity/permissions (owned by MOD-001); ledger posting (owned by MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Bills of material and routings; submodules BOM, Routing), §3 Personas, §5 Master Data (BOM, Routing, Work Center, Machine, Operation), §10 Configuration (Default routing choice, Scrap tolerance, Approval thresholds, Numbering series).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-007` Document, `ENG-008` Attachment, `ENG-012` Rules, `ENG-017` Numbering, `ENG-024` Event.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (Manufacturing sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1` and `MOD005_INVENTORY_BASELINE_v1`.
- **Sprint Exit Criteria.**
  - BOM, Routing, Work Center, Machine, and Operation records can be created, edited, and archived under a tenant/company.
  - Manufacturing configuration (default routing, scrap tolerance, approval thresholds, numbering series) resolves deterministically through `ENG-005`.
  - Document numbers issue through `ENG-017`.
  - All structural changes are audited via `ENG-004`.

### SPR-MOD-009-002 — Production Planning & Scheduling

- **Objective.** Deliver the Plan-to-work-order process: production plan intake, material availability confirmation, and scheduling onto work centers using the Scheduler Engine.
- **Boundaries.**
  - In: Production planning intake, scheduling, material availability confirmation.
  - Out: work-order release and execution (SPR-MOD-009-003); sub-contracting; quality; analytics; stock reservations posted by MOD-005; ledger posting (MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Production planning and scheduling; submodule Planning), §4 Business Processes (Plan-to-work-order), §7 Business Rules ("A work order cannot start without material availability confirmation"), §8 Integration Points (`SalesOrderConfirmed`, `InventoryLowStock` — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-013` Automation, `ENG-014` Scheduler, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-009-001`.
- **Sprint Exit Criteria.**
  - Production plans can be created, material availability can be confirmed, and operations can be scheduled onto work centers via `ENG-014`.
  - The material-availability rule is enforced via `ENG-012` before work-order release.
  - `SalesOrderConfirmed` and `InventoryLowStock` events are consumed and reflected in planning.

### SPR-MOD-009-003 — Work Orders & Shopfloor Execution

- **Objective.** Deliver the Work-order-to-completion process: Work Order transaction lifecycle, Production Entry capture, and shopfloor execution.
- **Boundaries.**
  - In: Work Order transaction lifecycle, Production Entry transaction, shopfloor execution surface.
  - Out: sub-contracting (SPR-MOD-009-004); quality inspection (SPR-MOD-009-005); analytics; stock movements posted by MOD-005; ledger posting (MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Work orders and shopfloor execution; submodule Work Orders), §4 Business Processes (Work-order-to-completion), §6 Transactions (Work Order, Production Entry), §8 Integration Points (`WorkOrderReleased`, `ProductionCompleted` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-013` Automation, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-009-002`.
- **Sprint Exit Criteria.**
  - Work Orders can be released, executed on the shopfloor, and completed.
  - `WorkOrderReleased` and `ProductionCompleted` events are published via `ENG-024`.
  - MES / SCADA / IoT integrations are invoked via `ENG-023` where configured.

### SPR-MOD-009-004 — Sub-contracting

- **Objective.** Deliver the Sub-contract dispatch and return process: Sub-contract Challan transaction lifecycle, dispatch, and return reconciliation.
- **Boundaries.**
  - In: Sub-contract Challan transaction lifecycle, sub-contractor dispatch and return, ageing checks.
  - Out: quality inspection (SPR-MOD-009-005); analytics; stock movements posted by MOD-005; ledger posting (MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Sub-contracting; submodule Sub-contracting), §4 Business Processes (Sub-contract dispatch and return), §6 Transactions (Sub-contract Challan), §7 Business Rules ("Sub-contract material must return within the configured window or is flagged"), §8 Integration Points (`SubContractDispatched` — published; Sub-contractor — external).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-013` Automation, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-009-001`.
- **Sprint Exit Criteria.**
  - Sub-contract Challans can be dispatched, returned, and reconciled.
  - The sub-contract return-window rule is enforced via `ENG-012`.
  - `SubContractDispatched` events are published via `ENG-024`.

### SPR-MOD-009-005 — Quality, Yield & Scrap

- **Objective.** Deliver the In-process quality process: Quality Inspection transaction lifecycle, quality-rejection handling, and yield/scrap tracking against work orders.
- **Boundaries.**
  - In: Quality Inspection transaction lifecycle, quality-rejection handling, yield/scrap capture against work orders.
  - Out: analytics (SPR-MOD-009-006); rejected-material stock disposition posted by MOD-005; ledger posting (MOD-002).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Quality checks; Yield and scrap tracking; submodule Quality), §4 Business Processes (In-process quality), §6 Transactions (Quality Inspection), §7 Business Rules ("Quality-rejected output cannot be issued to finished-goods stock"), §8 Integration Points (`QualityRejected` — published; `MaintenanceCompleted` — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-009-003`.
- **Sprint Exit Criteria.**
  - Quality Inspections can be raised against work orders and completed with pass/reject dispositions.
  - The quality-rejection issuance rule is enforced via `ENG-012`.
  - Yield and scrap are recorded against the originating work order.
  - `QualityRejected` events are published via `ENG-024`; `MaintenanceCompleted` events are consumed.

### SPR-MOD-009-006 — Manufacturing Analytics & Compliance

- **Objective.** Deliver Manufacturing reports (Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate), dashboards, exports, and audit readiness. Read-model only.
- **Boundaries.**
  - In: Manufacturing read model, operational reports and dashboards, KPI surfacing, audit readiness, exports.
  - Out: cross-module KPI definitions (owned by MOD-017 Analytics); transactional functionality of earlier sprints.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (all analytics-facing capabilities as read model), §9 Reports & Analytics (Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate), §11 Non-functional (Audit readiness).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-020` Search, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-024` Event, `ENG-025` Notification, `ENG-026` Import, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-009-001` … `SPR-MOD-009-005`.
- **Sprint Exit Criteria.**
  - Reports and dashboards render from data produced by prior sprints and consumed cross-module events.
  - Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
  - Audit readiness surface exposes every Manufacturing event emitted during the sprint sequence.

### Planning Flexibility

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-009-001 (Foundation: BOM & Routing)
         │
         ├──────────────────────────────┬──────────────┐
         ▼                              ▼              ▼
SPR-MOD-009-002               SPR-MOD-009-004         (…)
(Planning & Scheduling)       (Sub-contracting)
         │
         ▼
SPR-MOD-009-003 (Work Orders & Shopfloor)
         │
         ▼
SPR-MOD-009-005 (Quality, Yield & Scrap)
         │
         ▼
SPR-MOD-009-006 (Manufacturing Analytics & Compliance)
         ▲
         │
   consumes output from 001 … 005
```

Sprints 002 and 004 depend directly on 001 (Foundation). Sprint 003 depends on 002. Sprint 005 depends on 003. Sprint 006 consumes output from all five predecessors.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-009 Manufacturing Module PRD](../../20-module-prds/manufacturing/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint.

### 4.1 Capability Allocation Matrix (Forward Map)

| # | Module PRD Capability (§2) | Origin Sprint | PRD Section | Exact Quote | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Bills of material and routings | SPR-MOD-009-001 | §2 | "Bills of material and routings" | PASS |
| 2 | Production planning and scheduling | SPR-MOD-009-002 | §2 | "Production planning and scheduling" | PASS |
| 3 | Work orders and shopfloor execution | SPR-MOD-009-003 | §2 | "Work orders and shopfloor execution" | PASS |
| 4 | Sub-contracting | SPR-MOD-009-004 | §2 | "Sub-contracting" | PASS |
| 5 | Quality checks | SPR-MOD-009-005 | §2 | "Quality checks" | PASS |
| 6 | Yield and scrap tracking | SPR-MOD-009-005 | §2 | "Yield and scrap tracking" | PASS |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| BOM | SPR-MOD-009-001 |
| Routing | SPR-MOD-009-001 |
| Planning | SPR-MOD-009-002 |
| Work Orders | SPR-MOD-009-003 |
| Sub-contracting | SPR-MOD-009-004 |
| Quality | SPR-MOD-009-005 |

> Manufacturing Analytics is a read-model surface originating-allocated to `SPR-MOD-009-006` per §9.

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| BOM | Master Data (§5) | SPR-MOD-009-001 |
| Routing | Master Data (§5) | SPR-MOD-009-001 |
| Work Center | Master Data (§5) | SPR-MOD-009-001 |
| Machine | Master Data (§5) | SPR-MOD-009-001 |
| Operation | Master Data (§5) | SPR-MOD-009-001 |
| Work Order | Transaction (§6) | SPR-MOD-009-003 |
| Production Entry | Transaction (§6) | SPR-MOD-009-003 |
| Sub-contract Challan | Transaction (§6) | SPR-MOD-009-004 |
| Quality Inspection | Transaction (§6) | SPR-MOD-009-005 |

### 4.4 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-009-001 | §1, §2 (Bills of material and routings; submodules BOM, Routing), §3 (personas), §5 (BOM, Routing, Work Center, Machine, Operation), §10 (Default routing choice, Scrap tolerance, Approval thresholds, Numbering series) |
| SPR-MOD-009-002 | §2 (Production planning and scheduling; submodule Planning), §4 (Plan-to-work-order), §7 (material-availability rule), §8 (`SalesOrderConfirmed`, `InventoryLowStock` — consumed) |
| SPR-MOD-009-003 | §2 (Work orders and shopfloor execution; submodule Work Orders), §4 (Work-order-to-completion), §6 (Work Order, Production Entry), §8 (`WorkOrderReleased`, `ProductionCompleted` — published; MES/SCADA/IoT — external) |
| SPR-MOD-009-004 | §2 (Sub-contracting; submodule Sub-contracting), §4 (Sub-contract dispatch and return), §6 (Sub-contract Challan), §7 (return-window rule), §8 (`SubContractDispatched` — published; Sub-contractor — external) |
| SPR-MOD-009-005 | §2 (Quality checks; Yield and scrap tracking; submodule Quality), §4 (In-process quality), §6 (Quality Inspection), §7 (quality-rejection issuance rule), §8 (`QualityRejected` — published; `MaintenanceCompleted` — consumed) |
| SPR-MOD-009-006 | §9 (Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate), §11 (Audit readiness) |

No Module PRD capability, submodule, master-data entity, or transaction sits outside the six sprints above. No capability appears as the originating allocation in more than one sprint. Every capability appears in exactly one originating sprint and in at least one sprint.

## 5. Engine Consumption Map

Derived from Manufacturing Module PRD §12. No engine behavior is redefined. Engine identifiers resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md`.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-008 | ENG-010 | ENG-011 | ENG-012 | ENG-013 | ENG-014 | ENG-017 | ENG-020 | ENG-021 | ENG-022 | ENG-023 | ENG-024 | ENG-025 | ENG-026 | ENG-027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-009-001 | ● | ● | ● | ● | ● | ● | ● | ● |   |   | ● |   |   | ● |   |   |   |   | ● |   |   |   |
| SPR-MOD-009-002 |   | ● |   | ● | ● |   |   |   | ● | ● | ● | ● | ● |   |   |   |   |   | ● | ● |   |   |
| SPR-MOD-009-003 |   | ● |   | ● |   |   | ● | ● | ● | ● | ● | ● |   |   |   |   |   | ● | ● | ● |   |   |
| SPR-MOD-009-004 |   | ● |   | ● |   |   | ● | ● | ● | ● | ● | ● |   |   |   |   |   | ● | ● | ● |   |   |
| SPR-MOD-009-005 |   | ● |   | ● |   |   |   |   | ● | ● | ● |   |   |   |   |   |   |   | ● | ● |   |   |
| SPR-MOD-009-006 |   | ● |   | ● |   |   |   |   |   |   |   |   |   |   | ● | ● | ● |   | ● | ● | ● | ● |

`ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any Manufacturing sprint — all ledger effects are produced by MOD-002 Accounting per the governance boundary. `ENG-015` remains declared in the Module PRD frontmatter for boundary documentation.

## 6. ADR Consumption Map

Accepted ADRs only, per Manufacturing Module PRD (`ADR-011`, `ADR-014`, `ADR-032`).

| Sprint | ADR-011 | ADR-014 | ADR-032 |
| --- | :-: | :-: | :-: |
| SPR-MOD-009-001 | ● | ● | ● |
| SPR-MOD-009-002 | ● | ● | ● |
| SPR-MOD-009-003 | ● | ● | ● |
| SPR-MOD-009-004 | ● | ● | ● |
| SPR-MOD-009-005 | ● | ● | ● |
| SPR-MOD-009-006 | ● | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Platform Dependency.** MOD-009 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Tenant, company, branch, and user master are consumed read-only from MOD-001.
>
> **Inventory Boundary.** MOD-009 consumes item and material availability from **MOD-005 Inventory**; stock movements resulting from production, sub-contract, and quality events are owned by MOD-005 via consumed events.
>
> **Accounting Boundary.** All ledger effects of manufacturing transactions are owned by **MOD-002 Accounting** via `ENG-015` and `ENG-016`. MOD-009 does not invoke the posting engine.
>
> **Analytics Boundary.** Cross-module KPI definitions are owned by **MOD-017 Analytics**. MOD-009 surfaces its own operational reports (§9) but consumes cross-module KPI definitions from MOD-017.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| BOM / Routing / Work Center / Machine / Operation Master | SPR-MOD-009-001 | 002, 003, 004, 005, 006 | Foundational; every later sprint assumes this master data. |
| Manufacturing Configuration (default routing, scrap tolerance, approval thresholds, numbering series) | SPR-MOD-009-001 | 002, 003, 004, 005 | Resolved via `ENG-005`. |
| Production Plan | SPR-MOD-009-002 | 003, 006 | Feeds work-order release and analytics. |
| Work Order / Production Entry | SPR-MOD-009-003 | 005, 006 | Quality inspects against work orders; analytics consumes execution data. |
| Sub-contract Challan | SPR-MOD-009-004 | 006 | Feeds sub-contract ageing analytics. |
| Quality / Yield / Scrap | SPR-MOD-009-005 | 006 | Feeds quality and yield analytics. |
| Tenant / Company / Branch / User Master | External (MOD-001) | 001–006 | Consumed via read-only APIs; never redefined. |
| Item / Material Availability | External (MOD-005) | 002, 003, 004, 005 | Consumed via read-only APIs; stock movements owned by MOD-005. |
| `SalesOrderConfirmed` (consumed event) | External (MOD-003 Sales) | SPR-MOD-009-002 | Triggers make-to-order planning. |
| `InventoryLowStock` (consumed event) | External (MOD-005) | SPR-MOD-009-002 | Signals replenishment planning. |
| `MaintenanceCompleted` (consumed event) | External (MOD-018 or equivalent) | SPR-MOD-009-005 | Signals machine availability. |
| `WorkOrderReleased` event | SPR-MOD-009-003 | MOD-005, MOD-002, MOD-017 | Notifies inventory, accounting, analytics. |
| `ProductionCompleted` event | SPR-MOD-009-003 | MOD-005, MOD-002, MOD-017 | Feeds stock updates and analytics. |
| `SubContractDispatched` event | SPR-MOD-009-004 | MOD-005, MOD-002, MOD-017 | Feeds stock updates and analytics. |
| `QualityRejected` event | SPR-MOD-009-005 | MOD-005, MOD-002, MOD-017 | Feeds stock disposition and analytics. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-009 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Any regression against that baseline blocks Stage 2 authoring.
- **R2 — Inventory boundary.** Stock movements remain owned by MOD-005. MOD-009 MUST NOT maintain its own stock ledger; it emits events and consumes availability read-only.
- **R3 — Accounting boundary.** All ledger effects remain owned by MOD-002. MOD-009 MUST NOT invoke `ENG-015` or `ENG-016` directly. Manufacturing-originating obligations flow to Accounting via events.
- **R4 — Identity boundary.** Identity and permissions remain owned by MOD-001. MOD-009 consumes identity read-only.
- **R5 — Analytics boundary.** Cross-module KPI definitions remain owned by MOD-017. Operational manufacturing reports are surfaced within MOD-009.
- **R6 — Optional-engine scope creep.** Optional engines (`ENG-023`, `ENG-026`, `ENG-027`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R7 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md`, no horizontal-only sprints are required for MOD-009; all sprints are vertical slices.
- **R8 — Future-enhancement scope.** Finite scheduling, AI-based yield prediction, and real-time OEE are deferred to Module PRD §14 Future Enhancements and are NOT allocated to any sprint in this plan.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-009 is baseline-ready when all of the following are objectively true:

1. Every reserved Manufacturing Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD009_MANUFACTURING_BASELINE_v1` is authored under `docs/40-module-baselines/`.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no Manufacturing capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md` beyond additive registration.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/manufacturing/MODULE_PRD.md`](../../20-module-prds/manufacturing/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`../../15-governance/templates/GT-002_STAGE1_AUTHORING.md`](../../15-governance/templates/GT-002_STAGE1_AUTHORING.md)
