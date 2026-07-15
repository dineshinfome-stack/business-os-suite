---
title: "MOD009_MANUFACTURING_BASELINE_v1 — Manufacturing Module Baseline"
summary: "Stage 3 Module Baseline for MOD-009 Manufacturing. Freezes the module after successful completion of Sprint PRDs SPR-MOD-009-001..006. Reference consolidation only — introduces no new requirements, engines, ADRs, events, or Sprint PRDs."
baseline_id: "MOD009_MANUFACTURING_BASELINE_v1"
module_id: "MOD-009"
module_name: "Manufacturing"
version: "1.0"
status: "Frozen"
owner: "Operations"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/manufacturing/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/manufacturing/MOD-009_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-009-001", "SPR-MOD-009-002", "SPR-MOD-009-003", "SPR-MOD-009-004", "SPR-MOD-009-005", "SPR-MOD-009-006"]
layer: "delivery"
updated: "2026-07-15"
tags: ["baseline", "module", "MOD-009", "manufacturing", "stage-3", "freeze"]
document_type: "Module Baseline"
governance_specification: "v1.0"
authored_via_template: "GT-004"
authored_via_template_version: "v1.0"
execution_id: "GT004-MOD009-20260715-001"
parent_execution_id: "GT003-MOD009-006-20260715T001200Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-026", "ENG-027"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
---

# MOD009_MANUFACTURING_BASELINE_v1 — Manufacturing Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-009. It introduces no new requirements, engines, ADRs, events, or Sprint PRDs. Future changes to Manufacturing scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD009_MANUFACTURING_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD009_MANUFACTURING_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the Manufacturing module (`MOD-009`). It certifies that:

- Every Sprint PRD reserved in [`MOD-009_SPRINT_PLAN.md`](../30-sprint-prds/manufacturing/MOD-009_SPRINT_PLAN.md) (`SPR-MOD-009-001` … `SPR-MOD-009-006`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-009. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD009_MANUFACTURING_BASELINE_v1` is the authoritative repository-wide Manufacturing contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-009 Manufacturing Module PRD](../20-module-prds/manufacturing/MODULE_PRD.md); reference only. Manufacturing owns:

- Bills of material and routings — BOM, Routing, Work Center, Machine, and Operation master lifecycles, plus manufacturing operations configuration (default routing choice, scrap tolerance, approval thresholds, numbering series).
- Production planning and scheduling — Production plan intake, material availability confirmation, and scheduling onto work centers via the Scheduler Engine.
- Work orders and shopfloor execution — Work Order and Production Entry transaction lifecycles and shopfloor execution surface.
- Sub-contracting — Sub-contract Challan transaction lifecycle, sub-contractor dispatch and return, and ageing checks.
- Quality, yield and scrap — Quality Inspection transaction lifecycle, quality-rejection handling, and yield/scrap capture against work orders.
- Manufacturing Analytics & Compliance — Read-model operational reports (Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate), dashboards, exports, and audit-readiness surface.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition. Ownership boundaries (Inventory ledger, ledger posting, identity/permissions, and cross-module KPI definitions) are established in the Module PRD §2 and preserved verbatim across the Sprint PRD family; this baseline does not restate them.

## 3. Implemented Sprint Summary

Each row records the sprint's title, status, and primary capability delivered — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-009-001](../30-sprint-prds/manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md) | Manufacturing Foundation (BOM & Routing) | Done | BOM, Routing, Work Center, Machine, and Operation masters; manufacturing configuration (default routing choice, scrap tolerance, approval thresholds, numbering series); Manufacturing Ownership Convention. |
| [SPR-MOD-009-002](../30-sprint-prds/manufacturing/SPR-MOD-009-002-production-planning-and-scheduling.md) | Production Planning & Scheduling | Done | Production plan intake, material-availability confirmation, scheduling via `ENG-014`, and consumption of `SalesOrderConfirmed` / `InventoryLowStock` signals. |
| [SPR-MOD-009-003](../30-sprint-prds/manufacturing/SPR-MOD-009-003-work-orders-and-shopfloor-execution.md) | Work Orders & Shopfloor Execution | Done | Work Order and Production Entry transaction lifecycles, shopfloor execution, publication of `WorkOrderReleased` and `ProductionCompleted`, and MES / SCADA / IoT invocation via `ENG-023`. |
| [SPR-MOD-009-004](../30-sprint-prds/manufacturing/SPR-MOD-009-004-sub-contracting.md) | Sub-contracting | Done | Sub-contract Challan transaction lifecycle, dispatch and return reconciliation, return-window rule enforcement via `ENG-012`, and publication of `SubContractDispatched`. |
| [SPR-MOD-009-005](../30-sprint-prds/manufacturing/SPR-MOD-009-005-quality-yield-and-scrap.md) | Quality, Yield & Scrap | Done | Quality Inspection transaction lifecycle, quality-rejection rule enforcement via `ENG-012`, yield / scrap capture against work orders, publication of `QualityRejected`, and consumption of `MaintenanceCompleted`. |
| [SPR-MOD-009-006](../30-sprint-prds/manufacturing/SPR-MOD-009-006-manufacturing-analytics-and-compliance.md) | Manufacturing Analytics & Compliance | Done | Manufacturing read model, operational reports (Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate), dashboards, exports, and audit-readiness surface. |

## 4. Capability Coverage

Every capability defined by the Manufacturing Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the Manufacturing Module PRD and the Sprint PRD family. No capability has been **added, removed, renamed, merged, split, or ownership-transferred** by this consolidation.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-009 Capability (Module PRD §2) | Originating Sprint |
| --- | --- |
| Bills of material and routings | SPR-MOD-009-001 |
| Production planning and scheduling | SPR-MOD-009-002 |
| Work orders and shopfloor execution | SPR-MOD-009-003 |
| Sub-contracting | SPR-MOD-009-004 |
| Quality checks | SPR-MOD-009-005 |
| Yield and scrap tracking | SPR-MOD-009-005 |
| Manufacturing reports, dashboards, exports, audit readiness (Module PRD §9, §11) | SPR-MOD-009-006 |
| Manufacturing governance conventions (summarized in §7) | Established across SPR-MOD-009-001 … SPR-MOD-009-006 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-009-001 | Bills of material and routings |
| SPR-MOD-009-002 | Production planning and scheduling |
| SPR-MOD-009-003 | Work orders and shopfloor execution |
| SPR-MOD-009-004 | Sub-contracting |
| SPR-MOD-009-005 | Quality checks; Yield and scrap tracking |
| SPR-MOD-009-006 | Manufacturing reports, dashboards, exports, audit readiness (§9, §11) |

No Manufacturing capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-009-001` through `SPR-MOD-009-006`, and reconciled with the Sprint Plan §5 Engine Consumption Map.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim, and canonical ordering from `ENGINE_CATALOG.md` is preserved.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-009-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-009-001, 002, 003, 004, 005, 006 |
| ENG-003 (Permission Management Engine) | SPR-MOD-009-001 |
| ENG-004 (Audit Engine) | SPR-MOD-009-001, 002, 003, 004, 005, 006 |
| ENG-005 (Configuration Engine) | SPR-MOD-009-001, 002 |
| ENG-006 (Localization Engine) | SPR-MOD-009-001 |
| ENG-007 (Document Engine) | SPR-MOD-009-001, 003, 004 |
| ENG-008 (Attachment Engine) | SPR-MOD-009-001, 003, 004 |
| ENG-010 (Workflow Engine) | SPR-MOD-009-002, 003, 004, 005 |
| ENG-011 (Approval Engine) | SPR-MOD-009-002, 003, 004, 005 |
| ENG-012 (Rules Engine) | SPR-MOD-009-001, 002, 003, 004, 005 |
| ENG-013 (Automation Engine) | SPR-MOD-009-002, 003, 004 |
| ENG-014 (Scheduler Engine) | SPR-MOD-009-002 |
| ENG-017 (Numbering Engine) | SPR-MOD-009-001 |
| ENG-020 (Search Engine) | SPR-MOD-009-006 |
| ENG-021 (Reporting Engine) | SPR-MOD-009-006 |
| ENG-022 (Dashboard Engine) | SPR-MOD-009-006 |
| ENG-023 (Integration Engine) | SPR-MOD-009-003, 004 |
| ENG-024 (Event Engine) | SPR-MOD-009-001, 002, 003, 004, 005, 006 |
| ENG-025 (Notification Engine) | SPR-MOD-009-002, 003, 004, 005, 006 |
| ENG-026 (Import Engine) | SPR-MOD-009-006 |
| ENG-027 (Export Engine) | SPR-MOD-009-006 |

No Manufacturing sprint redefines engine behavior; all engines are consumed via their Capability Interfaces. `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any Manufacturing sprint — all ledger effects are owned by MOD-002 Accounting per the governance boundary declared in the Module PRD and Sprint Plan §5.

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-009-001` through `SPR-MOD-009-006`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim; canonical ordering from `ADR_INDEX.md` is preserved.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-009-001, 002, 003, 004, 005, 006 |
| ADR-014 (Audit Strategy) | SPR-MOD-009-001, 002, 003, 004, 005, 006 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-009-001, 002, 003, 004, 005, 006 |

## 7. Governance Conventions Established

Every governance convention established across Manufacturing Sprint PRDs 001–006 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-009-001 — Manufacturing Foundation (BOM & Routing)**

- **Manufacturing Ownership Convention** — MOD-009 Manufacturing owns the business semantics of BOM, Routing, Work Center, Machine, and Operation masters, and manufacturing operations configuration (default routing, scrap tolerance, approval thresholds, numbering series). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, attachments, eventing) but MUST NOT redefine Manufacturing business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-002 (ledger posting), MOD-005 (stock ledger), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD.

**From SPR-MOD-009-002 — Production Planning & Scheduling**

- **Planning Ownership** — MOD-009 owns the Plan-to-work-order process, material-availability confirmation, and scheduling onto work centers via `ENG-014`. The material-availability rule is enforced via `ENG-012` prior to work-order release. `SalesOrderConfirmed` and `InventoryLowStock` events are consumed read-only; the originating modules' transaction lifecycles are not redefined.

**From SPR-MOD-009-003 — Work Orders & Shopfloor Execution**

- **Work Order Ownership** — MOD-009 owns the Work Order and Production Entry transaction lifecycles and the shopfloor execution surface. `WorkOrderReleased` and `ProductionCompleted` are published via `ENG-024`. MES / SCADA / IoT integrations are invoked (never redefined) via `ENG-023`.

**From SPR-MOD-009-004 — Sub-contracting**

- **Sub-contract Ownership** — MOD-009 owns the Sub-contract Challan transaction lifecycle and sub-contractor dispatch / return reconciliation. The return-window rule is enforced via `ENG-012`. `SubContractDispatched` events are published via `ENG-024`.

**From SPR-MOD-009-005 — Quality, Yield & Scrap**

- **Quality & Yield/Scrap Ownership** — MOD-009 owns the Quality Inspection transaction lifecycle, quality-rejection dispositions, and yield/scrap capture against work orders, gated by the Module PRD §7 rule that quality-rejected output cannot be issued to finished-goods stock. `QualityRejected` events are published via `ENG-024`; `MaintenanceCompleted` events are consumed.

**From SPR-MOD-009-006 — Manufacturing Analytics & Compliance**

- **Manufacturing Analytics Ownership** — MOD-009 owns operational Manufacturing reports, dashboards, exports, and the Manufacturing audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read Model Boundary Convention** — Dashboards, filters, drill-down, and export operate over the Manufacturing read model; no transactional side effects and no new domain events published by Sprint 6.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint Manufacturing events through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform, Accounting, Sales, Purchase, Inventory, CRM, HRMS, Payroll, and Warehouse governance conventions established in prior Module Baselines.

**Freeze.** Governance conventions summarized herein are frozen for `MOD009_MANUFACTURING_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-009-001` through `SPR-MOD-009-006`.** Every referenced event resolves verbatim from [`docs/20-module-prds/manufacturing/MODULE_PRD.md`](../20-module-prds/manufacturing/MODULE_PRD.md) §8 or the authoritative [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md). **No new event names SHALL be introduced by the Module Baseline.**

**Events Published by Manufacturing** (verbatim from Manufacturing Module PRD §8):

- `WorkOrderReleased` — SPR-MOD-009-003
- `ProductionCompleted` — SPR-MOD-009-003
- `QualityRejected` — SPR-MOD-009-005
- `SubContractDispatched` — SPR-MOD-009-004

**Events Consumed by Manufacturing** (verbatim from Manufacturing Module PRD §8):

- `SalesOrderConfirmed` (from MOD-003 Sales) — SPR-MOD-009-002
- `InventoryLowStock` (from MOD-005 Inventory) — SPR-MOD-009-002
- `MaintenanceCompleted` (external) — SPR-MOD-009-005

Deferred event surfaces are inherited as `R-EV-*` risks from the originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD009_MANUFACTURING_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by Manufacturing. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**Manufacturing SHALL consume Platform, Inventory, Sales, Accounting, and Analytics services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by Manufacturing:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-005 Inventory** — Item master and material availability (read-only); `InventoryLowStock` event. Stock movements resulting from Manufacturing events remain owned by MOD-005.
- **MOD-003 Sales** — `SalesOrderConfirmed` event for make-to-order planning inputs.
- **MOD-002 Accounting** — ledger effects of Manufacturing transactions are owned by MOD-002 via `ENG-015` and `ENG-016`; MOD-009 does not invoke the posting engine directly.
- **External systems** — MES / SCADA / IoT integrations invoked via `ENG-023`; `MaintenanceCompleted` consumed from an external / adjacent module.

**Downstream consumers of the Manufacturing baseline** (per Manufacturing Module PRD §13 *Provides To Modules*):

- **MOD-005 Inventory** — consumes `WorkOrderReleased`, `ProductionCompleted`, `SubContractDispatched`, and `QualityRejected` for stock updates and disposition.
- **MOD-002 Accounting** — consumes production, sub-contract, yield/scrap, and quality-rejection events for ledger effects.
- **MOD-017 Analytics** — consumes Manufacturing operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

Downstream modules MUST NOT own Manufacturing master data, redefine the Work Order / Production Entry / Sub-contract Challan / Quality Inspection lifecycles, or redefine Manufacturing analytics ownership. No downstream module owns Manufacturing assets.

## 10. Module Completion & Freeze Statement

All six planned Manufacturing Sprint PRDs (`SPR-MOD-009-001` … `SPR-MOD-009-006`) exist, the [Sprint Plan](../30-sprint-prds/manufacturing/MOD-009_SPRINT_PLAN.md) is executed, and repository verification has been completed under GT-004. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-009 Manufacturing is now frozen for downstream consumption. Future changes to `MOD009_MANUFACTURING_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD009_MANUFACTURING_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD009_MANUFACTURING_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Finite scheduling (Module PRD §14 Future Enhancements).
- AI-based yield prediction (Module PRD §14).
- Real-time OEE (Module PRD §14).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/manufacturing/MODULE_PRD.md`](../20-module-prds/manufacturing/MODULE_PRD.md) — MOD-009 Module PRD (authoritative).
- [`docs/30-sprint-prds/manufacturing/MOD-009_SPRINT_PLAN.md`](../30-sprint-prds/manufacturing/MOD-009_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md`](../30-sprint-prds/manufacturing/SPR-MOD-009-001-manufacturing-foundation-bom-and-routing.md)
- [`docs/30-sprint-prds/manufacturing/SPR-MOD-009-002-production-planning-and-scheduling.md`](../30-sprint-prds/manufacturing/SPR-MOD-009-002-production-planning-and-scheduling.md)
- [`docs/30-sprint-prds/manufacturing/SPR-MOD-009-003-work-orders-and-shopfloor-execution.md`](../30-sprint-prds/manufacturing/SPR-MOD-009-003-work-orders-and-shopfloor-execution.md)
- [`docs/30-sprint-prds/manufacturing/SPR-MOD-009-004-sub-contracting.md`](../30-sprint-prds/manufacturing/SPR-MOD-009-004-sub-contracting.md)
- [`docs/30-sprint-prds/manufacturing/SPR-MOD-009-005-quality-yield-and-scrap.md`](../30-sprint-prds/manufacturing/SPR-MOD-009-005-quality-yield-and-scrap.md)
- [`docs/30-sprint-prds/manufacturing/SPR-MOD-009-006-manufacturing-analytics-and-compliance.md`](../30-sprint-prds/manufacturing/SPR-MOD-009-006-manufacturing-analytics-and-compliance.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`](../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md) — authoring template.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](./MOD005_INVENTORY_BASELINE_v1.md) — upstream Inventory baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
