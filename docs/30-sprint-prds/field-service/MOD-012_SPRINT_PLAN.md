---
title: "MOD-012 Field Service — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-012 Field Service. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Service"
status: "Approved"
updated: "2026-07-16"
module_id: "MOD-012"
module_name: "Field Service"
sprint_prefix: "SPR-MOD-012-"
stage: "1"
pass: "14.0.0"
parent_module_prd: "docs/20-module-prds/field-service/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
governance_specification: "v1.0"
template_standard: "v1.3"
authored_by_template: "GT-002"
execution_id: "GT002-MOD012-20260716T011000Z-001"
tags: ["sprint", "planning", "field-service", "mod-012", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-012 Field Service — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-012 Field Service** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## Normative Source Precedence

On any conflict, the following order wins:

1. `docs/20-module-prds/field-service/MODULE_PRD.md` (Module PRD)
2. This Capability Allocation Matrix (§4)
3. The sprint sections in §2 of this Sprint Plan
4. Any derived artifact

## 1. Purpose & Scope

Plan the implementation of MOD-012 Field Service by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD.

This plan introduces no new business requirements beyond the approved [MOD-012 Field Service Module PRD](../../20-module-prds/field-service/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Governance Boundaries (recapitulated).** Per the Module PRD §13:

- **Identity, authentication, and permissions** are owned by **MOD-001 Platform Administration** via `ENG-001`, `ENG-002`, `ENG-003`.
- **Item master and stock movements** are owned by **MOD-005 Inventory**; Field Service consumes Item read-only and emits `SpareConsumed` for inventory adjustment.
- **AMC contract, entitlement, and preventive-visit scheduling authority** is owned by **MOD-011 AMC**; Field Service consumes `ContractSigned` and `VisitScheduled` events and reports back through `FieldVisitCompleted`.
- **Service-desk ticket master** is owned by **MOD-016 Service Desk**; Field Service consumes `ServiceTicketClosed` for closure reconciliation.
- **Ledger effects** of any billable field work are owned by **MOD-002 Accounting** via `ENG-015` Voucher and `ENG-016` Posting engines. No sprint below writes journal entries directly.
- **Cross-module KPI definitions** are owned by **MOD-017 Analytics**. Operational Field Service reports are surfaced within MOD-012.

**Traceability:**

- Parent Module README — [`../../20-module-prds/field-service/README.md`](../../20-module-prds/field-service/README.md)
- Parent Module PRD — [`../../20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)
- Upstream module baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md), [`../../40-module-baselines/MOD011_AMC_BASELINE_v1.md`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-012 in `SPRINT_ROADMAP.md` is **5**; this plan aligns to **5**.

## 2. Proposed Sprint Sequence

### SPR-MOD-012-001 — Field Service Foundation (Tickets & Field Workforce)

- **Objective.** Establish Field Service foundations under a tenant/company: Technician, Skill, Territory, and Ticket Type master data, along with the Field Ticket transaction lifecycle and ticket triage.
- **Boundaries.**
  - In: Technician, Skill, Territory, Ticket Type masters; Field Ticket transaction lifecycle; ticket capture and triage; field service configuration (numbering series, ticket type policies).
  - Out: dispatch and scheduling (SPR-MOD-012-002); visit execution (SPR-MOD-012-003); SLA and escalation (SPR-MOD-012-004); analytics (SPR-MOD-012-005); identity/permissions (owned by MOD-001); item master (owned by MOD-005); contract/entitlement (owned by MOD-011).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Ticket capture and triage; submodule Tickets), §3 Personas, §5 Master Data (Technician, Skill, Territory, Ticket Type), §6 Transactions (Field Ticket), §8 Integration Points (`FieldTicketCreated` — published; `ContractSigned` — consumed), §10 Configuration (numbering series).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-012` Rules, `ENG-017` Numbering, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (MOD-012 sprint 1). Depends on frozen `MOD001_PLATFORM_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, and `MOD011_AMC_BASELINE_v1`.
- **Sprint Exit Criteria.**
  - Technician, Skill, Territory, and Ticket Type records can be created, edited, and archived under a tenant/company.
  - Field Ticket transaction lifecycle (open → triaged → dispatched → in progress → closed → cancelled) is enforced via `ENG-010`.
  - Ticket-type policies resolve deterministically through `ENG-005`.
  - Document numbers issue through `ENG-017`.
  - `FieldTicketCreated` events are published via `ENG-024`; `ContractSigned` events are consumed to link tickets to active AMC contracts.
  - All state changes are audited via `ENG-004`.

### SPR-MOD-012-002 — Dispatch & Scheduling

- **Objective.** Deliver the Ticket-to-dispatch process: Visit transaction lifecycle, dispatch rules (skill × territory × availability), and technician assignment.
- **Boundaries.**
  - In: Visit transaction lifecycle (assigned → en route → on site); dispatch strategy resolution; skill/territory routing; technician assignment.
  - Out: mobile visit execution and spare consumption (SPR-MOD-012-003); SLA and escalation policy enforcement (SPR-MOD-012-004); analytics (SPR-MOD-012-005); field-visit execution results (SPR-MOD-012-003).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Dispatch and scheduling; submodule Dispatch), §4 Business Processes (Ticket-to-dispatch), §6 Transactions (Visit), §8 Integration Points (`VisitAssigned` — published; `VisitScheduled` — consumed), §10 Configuration (Dispatch strategy, Territory rules).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-010` Workflow, `ENG-012` Rules, `ENG-013` Automation, `ENG-014` Scheduler, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-012-001`.
- **Sprint Exit Criteria.**
  - Visits can be created and assigned against an open Field Ticket or an AMC-scheduled visit.
  - Dispatch strategy resolves per configured skill/territory/availability rules via `ENG-005` and `ENG-012`.
  - Scheduled dispatch runs via `ENG-014`; automated re-dispatch on decline via `ENG-013`.
  - `VisitAssigned` events are published via `ENG-024`; `VisitScheduled` events are consumed to materialize AMC-driven visits.

### SPR-MOD-012-003 — Mobile Visit Execution (Spares, Signatures, Closure)

- **Objective.** Deliver the Visit-to-closure and Spare consumption processes: on-site Visit execution, Spare Consumption transaction, signature capture, and Closure Report authoring.
- **Boundaries.**
  - In: Visit execution (on site → completed); Spare Consumption transaction; Closure Report; signature/checklist capture; van-stock decrement via `SpareConsumed`.
  - Out: dispatch and routing (SPR-MOD-012-002); SLA and escalation (SPR-MOD-012-004); analytics (SPR-MOD-012-005); ledger posting (owned by MOD-002); item master (owned by MOD-005).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Mobile visit execution; Spare parts and consumption; Signature capture and closure; submodules Visits, Spares, Closure), §4 Business Processes (Visit-to-closure, Spare consumption), §6 Transactions (Visit, Spare Consumption, Closure Report), §7 Business Rules ("A visit cannot be closed without required signatures/checklists"; "Spare consumption reduces the technician's van stock"), §8 Integration Points (`FieldVisitCompleted`, `SpareConsumed` — published; `ServiceTicketClosed` — consumed), §10 Configuration (Mobile app settings).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-012` Rules, `ENG-017` Numbering, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-012-002`.
- **Sprint Exit Criteria.**
  - Visits complete only when required signatures/checklists are captured — enforced via `ENG-012`.
  - Spare Consumption transactions issue via `ENG-017` numbering and are audited via `ENG-004`.
  - Closure Reports are attached via `ENG-008` and rendered via `ENG-007`.
  - `FieldVisitCompleted` and `SpareConsumed` events are published via `ENG-024`; `ServiceTicketClosed` events are consumed to reconcile ticket closure with visit completion.

### SPR-MOD-012-004 — SLA & Escalation

- **Objective.** Deliver the Escalation process: SLA policy definition, SLA tracking against ticket and visit lifecycles, and rule-driven escalation.
- **Boundaries.**
  - In: SLA policy master (per ticket type / territory / contract entitlement); SLA clock tracking; escalation workflows; escalation notifications.
  - Out: analytics dashboards (SPR-MOD-012-005); AMC entitlement mechanics (owned by MOD-011).
- **Estimated size.** Small.
- **Module PRD sections covered.** §2 Business Scope (SLA and escalation tracking), §4 Business Processes (Escalation), §7 Business Rules ("SLA breaches trigger escalation per policy"), §10 Configuration (SLA policies).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-013` Automation, `ENG-014` Scheduler, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-012-001`, `SPR-MOD-012-003`.
- **Sprint Exit Criteria.**
  - SLA policies resolve deterministically per ticket/visit context via `ENG-005`.
  - SLA breach rules evaluate via `ENG-012`; escalations run via `ENG-010`/`ENG-011`.
  - Scheduled SLA checks run via `ENG-014`; automated escalations run via `ENG-013`.
  - Notifications on breach are dispatched via `ENG-025`.

### SPR-MOD-012-005 — Field Service Analytics & Compliance

- **Objective.** Deliver Field Service reports (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), dashboards, exports, and audit readiness. Read-model only.
- **Boundaries.**
  - In: Field Service read model, operational reports and dashboards, KPI surfacing, audit readiness, exports.
  - Out: cross-module KPI definitions (owned by MOD-017 Analytics); transactional functionality of earlier sprints.
- **Estimated size.** Small.
- **Module PRD sections covered.** §2 Business Scope (all analytics-facing capabilities as read model), §9 Reports & Analytics (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), §11 Non-functional (Audit readiness).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-020` Search, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-012-001` … `SPR-MOD-012-004`.
- **Sprint Exit Criteria.**
  - Reports and dashboards render from data produced by prior sprints and consumed cross-module events.
  - Reports render via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`.
  - Audit-readiness surface exposes every Field Service event emitted during the sprint sequence.

### Planning Flexibility

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-012-001 (Field Service Foundation: Tickets & Field Workforce)
         │
         ▼
SPR-MOD-012-002 (Dispatch & Scheduling)
         │
         ▼
SPR-MOD-012-003 (Mobile Visit Execution: Spares, Signatures, Closure)
         │
         ├──────────────────────────────┐
         ▼                              │
SPR-MOD-012-004 (SLA & Escalation)      │
         │                              │
         └──────────────┬───────────────┘
                        ▼
            SPR-MOD-012-005 (Field Service Analytics & Compliance)
                        ▲
                        │
                consumes output from 001 … 004
```

Sprint 002 depends on 001. Sprint 003 depends on 002. Sprint 004 depends on 001 and 003. Sprint 005 consumes output from all four predecessors.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-012 Field Service Module PRD](../../20-module-prds/field-service/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint.

### 4.1 Capability Allocation Matrix (Forward Map)

| # | Module PRD Capability (§2) | Origin Sprint | PRD Section | Exact Quote | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Ticket capture and triage | SPR-MOD-012-001 | §2 | "Ticket capture and triage" | PASS |
| 2 | Dispatch and scheduling | SPR-MOD-012-002 | §2 | "Dispatch and scheduling" | PASS |
| 3 | Mobile visit execution | SPR-MOD-012-003 | §2 | "Mobile visit execution" | PASS |
| 4 | Spare parts and consumption | SPR-MOD-012-003 | §2 | "Spare parts and consumption" | PASS |
| 5 | Signature capture and closure | SPR-MOD-012-003 | §2 | "Signature capture and closure" | PASS |
| 6 | SLA and escalation tracking | SPR-MOD-012-004 | §2 | "SLA and escalation tracking" | PASS |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Tickets | SPR-MOD-012-001 |
| Dispatch | SPR-MOD-012-002 |
| Visits | SPR-MOD-012-003 |
| Spares | SPR-MOD-012-003 |
| Closure | SPR-MOD-012-003 |

> Field Service Analytics is a read-model surface originating-allocated to `SPR-MOD-012-005` per §9.

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Technician | Master Data (§5) | SPR-MOD-012-001 |
| Skill | Master Data (§5) | SPR-MOD-012-001 |
| Territory | Master Data (§5) | SPR-MOD-012-001 |
| Ticket Type | Master Data (§5) | SPR-MOD-012-001 |
| Field Ticket | Transaction (§6) | SPR-MOD-012-001 |
| Visit | Transaction (§6) | SPR-MOD-012-002 |
| Spare Consumption | Transaction (§6) | SPR-MOD-012-003 |
| Closure Report | Transaction (§6) | SPR-MOD-012-003 |

### 4.4 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-012-001 | §1, §2 (Ticket capture and triage; submodule Tickets), §3 (personas), §5 (Technician, Skill, Territory, Ticket Type), §6 (Field Ticket transaction), §8 (`FieldTicketCreated` — published; `ContractSigned` — consumed), §10 (numbering series) |
| SPR-MOD-012-002 | §2 (Dispatch and scheduling; submodule Dispatch), §4 (Ticket-to-dispatch), §6 (Visit), §8 (`VisitAssigned` — published; `VisitScheduled` — consumed), §10 (Dispatch strategy, Territory rules) |
| SPR-MOD-012-003 | §2 (Mobile visit execution; Spare parts and consumption; Signature capture and closure; submodules Visits, Spares, Closure), §4 (Visit-to-closure, Spare consumption), §6 (Visit, Spare Consumption, Closure Report), §7 (signature/checklist rule, van-stock rule), §8 (`FieldVisitCompleted`, `SpareConsumed` — published; `ServiceTicketClosed` — consumed), §10 (Mobile app settings) |
| SPR-MOD-012-004 | §2 (SLA and escalation tracking), §4 (Escalation), §7 (SLA breach rule), §10 (SLA policies) |
| SPR-MOD-012-005 | §9 (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), §11 (Audit readiness) |

No Module PRD capability, submodule, master-data entity, or transaction sits outside the five sprints above. No capability appears as the originating allocation in more than one sprint. Every capability appears in exactly one originating sprint and in at least one sprint.

## 5. Engine Consumption Map

Derived from Field Service Module PRD §12. No engine behavior is redefined. Engine identifiers resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md`.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-008 | ENG-010 | ENG-011 | ENG-012 | ENG-013 | ENG-014 | ENG-017 | ENG-020 | ENG-021 | ENG-022 | ENG-023 | ENG-024 | ENG-025 | ENG-027 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-012-001 | ● | ● | ● | ● | ● | ● | ● | ● | ● |   | ● |   |   | ● |   |   |   |   | ● | ● |   |
| SPR-MOD-012-002 |   | ● |   | ● | ● |   |   |   | ● |   | ● | ● | ● |   |   |   |   |   | ● | ● |   |
| SPR-MOD-012-003 |   | ● |   | ● | ● |   | ● | ● | ● |   | ● |   |   | ● |   |   |   |   | ● | ● |   |
| SPR-MOD-012-004 |   | ● |   | ● | ● |   |   |   | ● | ● | ● | ● | ● |   |   |   |   |   | ● | ● |   |
| SPR-MOD-012-005 |   | ● |   | ● |   |   |   |   |   |   |   |   |   |   | ● | ● | ● | ● | ● | ● | ● |

`ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any Field Service sprint — all ledger effects are produced by MOD-002 Accounting via posting-rule bindings triggered by Field Service-published events. Optional engines from Module PRD §12 that are not required by any sprint are not declared.

## 6. ADR Consumption Map

Accepted ADRs only, per Field Service Module PRD (`ADR-011`, `ADR-032`).

| Sprint | ADR-011 | ADR-032 |
| --- | :-: | :-: |
| SPR-MOD-012-001 | ● | ● |
| SPR-MOD-012-002 | ● | ● |
| SPR-MOD-012-003 | ● | ● |
| SPR-MOD-012-004 | ● | ● |
| SPR-MOD-012-005 | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Platform Dependency.** MOD-012 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Tenant, company, branch, and user master are consumed read-only from MOD-001.
>
> **Inventory Dependency.** MOD-012 assumes `MOD005_INVENTORY_BASELINE_v1` is frozen. Item master is consumed read-only from **MOD-005 Inventory**; spare consumption effects on stock are produced by MOD-005 via `SpareConsumed` event bindings.
>
> **AMC Dependency.** MOD-012 assumes `MOD011_AMC_BASELINE_v1` is frozen. Contract, entitlement, and preventive-visit schedule authority remain owned by **MOD-011 AMC**; MOD-012 consumes `ContractSigned` and `VisitScheduled` events and reports back through `FieldVisitCompleted`.
>
> **Service Desk Boundary.** Service-desk ticket master remains owned by **MOD-016 Service Desk**; MOD-012 consumes `ServiceTicketClosed` for closure reconciliation.
>
> **Accounting Boundary.** All ledger effects of billable field work are owned by **MOD-002 Accounting** via `ENG-015` and `ENG-016`. MOD-012 does not invoke posting directly.
>
> **Analytics Boundary.** Cross-module KPI definitions are owned by **MOD-017 Analytics**. MOD-012 surfaces its own operational reports (§9) but consumes cross-module KPI definitions from MOD-017.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Technician / Skill / Territory / Ticket Type Master | SPR-MOD-012-001 | 002, 003, 004, 005 | Foundational; every later sprint assumes this master data. |
| Field Service Configuration (numbering, ticket-type policies, dispatch strategy, SLA policies, mobile app settings) | SPR-MOD-012-001, 002, 003, 004 | 002, 003, 004, 005 | Resolved via `ENG-005`. |
| Field Ticket Transaction | SPR-MOD-012-001 | 002, 003, 004, 005 | Later sprints operate against open tickets. |
| Visit Transaction | SPR-MOD-012-002 | 003, 004, 005 | On-site execution and analytics operate on assigned visits. |
| Spare Consumption / Closure Report | SPR-MOD-012-003 | 005 | Feeds First-Time-Fix and Technician Utilization analytics. |
| SLA Policy / Escalation | SPR-MOD-012-004 | 005 | Feeds SLA Adherence analytics. |
| Tenant / Company / Branch / User Master | External (MOD-001) | 001–005 | Consumed via read-only APIs; never redefined. |
| Item Master | External (MOD-005) | 003 | Consumed via read-only APIs; owned by MOD-005. |
| `ContractSigned` (consumed event) | External (MOD-011 AMC) | SPR-MOD-012-001 | Links tickets to active AMC contracts. |
| `VisitScheduled` (consumed event) | External (MOD-011 AMC) | SPR-MOD-012-002 | Materializes AMC-driven visits into the dispatch queue. |
| `ServiceTicketClosed` (consumed event) | External (MOD-016 Service Desk) | SPR-MOD-012-003 | Reconciles service-desk closure with field visit completion. |
| `FieldTicketCreated` event | SPR-MOD-012-001 | MOD-016, MOD-017 | Notifies service desk and analytics. |
| `VisitAssigned` event | SPR-MOD-012-002 | MOD-011, MOD-017 | Feeds AMC and analytics. |
| `FieldVisitCompleted` event | SPR-MOD-012-003 | MOD-011, MOD-002, MOD-017 | Feeds AMC entitlement consumption, accounting, and analytics. |
| `SpareConsumed` event | SPR-MOD-012-003 | MOD-005, MOD-002, MOD-017 | Feeds inventory stock movement, accounting, and analytics. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-012 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Any regression against that baseline blocks Stage 2 authoring.
- **R2 — Inventory baseline dependency.** MOD-012 assumes `MOD005_INVENTORY_BASELINE_v1` is frozen. Item master is consumed read-only; MOD-012 MUST NOT redefine item identity.
- **R3 — AMC baseline dependency.** MOD-012 assumes `MOD011_AMC_BASELINE_v1` is frozen. Contract/entitlement/preventive-visit authority remains with MOD-011.
- **R4 — Identity boundary.** Identity and permissions remain owned by MOD-001. MOD-012 consumes identity read-only.
- **R5 — Accounting boundary.** All ledger effects remain owned by MOD-002. MOD-012 emits `FieldVisitCompleted` and `SpareConsumed`; posting occurs through MOD-002 rule bindings.
- **R6 — Service Desk boundary.** Service-desk ticket master remains owned by MOD-016. MOD-012 consumes `ServiceTicketClosed` read-only.
- **R7 — Analytics boundary.** Cross-module KPI definitions remain owned by MOD-017. Operational Field Service reports are surfaced within MOD-012.
- **R8 — Optional-engine scope creep.** Optional engines (`ENG-011`, `ENG-020`, `ENG-022`, `ENG-027`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R9 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md`, no horizontal-only sprints are required for MOD-012; all sprints are vertical slices.
- **R10 — Future-enhancement scope.** Offline-first mobile, AI dispatch optimization, and predictive maintenance are deferred to Module PRD §14 Future Enhancements and are NOT allocated to any sprint in this plan.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-012 is baseline-ready when all of the following are objectively true:

1. Every reserved Field Service Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD012_FIELD_SERVICE_BASELINE_v1` is authored under `docs/40-module-baselines/`.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no Field Service capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md` beyond additive registration.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](../../40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md)
- [`../../40-module-baselines/MOD011_AMC_BASELINE_v1.md`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`../../15-governance/templates/GT-002_STAGE1_AUTHORING.md`](../../15-governance/templates/GT-002_STAGE1_AUTHORING.md)
