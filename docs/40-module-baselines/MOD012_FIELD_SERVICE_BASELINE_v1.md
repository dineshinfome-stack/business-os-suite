---
title: "MOD012_FIELD_SERVICE_BASELINE_v1 — Field Service Module Baseline"
summary: "Stage 3 Module Baseline for MOD-012 Field Service. Freezes the module after successful completion of Sprint PRDs SPR-MOD-012-001..005. Reference consolidation only — introduces no new requirements, engines, ADRs, events, or Sprint PRDs."
baseline_id: "MOD012_FIELD_SERVICE_BASELINE_v1"
module_id: "MOD-012"
module_name: "Field Service"
version: "1.0"
status: "Frozen"
owner: "Service"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/field-service/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-012-001", "SPR-MOD-012-002", "SPR-MOD-012-003", "SPR-MOD-012-004", "SPR-MOD-012-005"]
layer: "delivery"
updated: "2026-07-16"
tags: ["baseline", "module", "MOD-012", "field-service", "stage-3", "freeze"]
document_type: "Module Baseline"
governance_specification: "v1.0"
authored_via_template: "GT-004"
authored_via_template_version: "v1.0"
execution_id: "GT004-MOD012-20260716T017000Z-001"
parent_execution_id: "GT003-MOD012-005-20260716T016000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
---

# MOD012_FIELD_SERVICE_BASELINE_v1 — Field Service Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-012. It introduces no new requirements, engines, ADRs, events, or Sprint PRDs. Future changes to Field Service scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD012_FIELD_SERVICE_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD012_FIELD_SERVICE_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the Field Service module (`MOD-012`). It certifies that:

- Every Sprint PRD reserved in [`MOD-012_SPRINT_PLAN.md`](../30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md) (`SPR-MOD-012-001` … `SPR-MOD-012-005`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-012. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD012_FIELD_SERVICE_BASELINE_v1` is the authoritative repository-wide Field Service contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-012 Field Service Module PRD](../20-module-prds/field-service/MODULE_PRD.md); reference only. Field Service owns:

- Ticket capture and triage — Ticket Type master and Field Ticket transaction lifecycle (open → triaged → dispatched → in progress → closed → cancelled).
- Dispatch and scheduling — Visit transaction dispatch phase (assigned → en route → on site); dispatch-strategy resolution (skill × territory × availability); scheduled and automated dispatch.
- Mobile visit execution — Visit completion (on site → completed); on-site execution.
- Spare parts and consumption — Spare Consumption transaction and van-stock decrement via published `SpareConsumed`.
- Signature capture and closure — Signature/checklist capture gating visit completion; Closure Report authoring.
- SLA and escalation tracking — SLA Policy master; SLA clocks against Field Ticket/Visit lifecycles; rule-driven escalation workflows.
- Field Service Analytics & Compliance — Read-model operational reports (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), dashboards, exports, and audit-readiness surface.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition. Ownership boundaries (identity/permissions, item master and stock, AMC contract/entitlement authority, service-desk ticket master, ledger posting, and cross-module KPI definitions) are established in the Module PRD §13 and preserved verbatim across the Sprint PRD family; this baseline does not restate them.

## 3. Implemented Sprint Summary

Each row records the sprint's title, status, and primary capability delivered — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-012-001](../30-sprint-prds/field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md) | Field Service Foundation (Tickets & Field Workforce) | Done | Technician, Skill, Territory, and Ticket Type master data; Field Ticket transaction lifecycle; Field Service configuration (numbering series, ticket-type policies); Field Service Ownership Convention; publication of `FieldTicketCreated`; consumption of `ContractSigned`. |
| [SPR-MOD-012-002](../30-sprint-prds/field-service/SPR-MOD-012-002-dispatch-and-scheduling.md) | Dispatch & Scheduling | Done | Visit transaction dispatch-phase lifecycle; dispatch-strategy resolution via `ENG-005` and `ENG-012`; scheduled dispatch via `ENG-014`; automated re-dispatch via `ENG-013`; publication of `VisitAssigned`; consumption of `VisitScheduled`. |
| [SPR-MOD-012-003](../30-sprint-prds/field-service/SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md) | Mobile Visit Execution (Spares, Signatures, Closure) | Done | Visit completion; Spare Consumption transaction; signature/checklist capture; Closure Report authoring via `ENG-007`/`ENG-008`; publication of `FieldVisitCompleted` and `SpareConsumed`; consumption of `ServiceTicketClosed`. |
| [SPR-MOD-012-004](../30-sprint-prds/field-service/SPR-MOD-012-004-sla-and-escalation.md) | SLA & Escalation | Done | SLA Policy master; SLA clock tracking against Field Ticket/Visit lifecycles; rule-driven escalation via `ENG-010`/`ENG-011`; scheduled SLA checks via `ENG-014`; automated escalations via `ENG-013`; breach notifications via `ENG-025`. |
| [SPR-MOD-012-005](../30-sprint-prds/field-service/SPR-MOD-012-005-field-service-analytics-and-compliance.md) | Field Service Analytics & Compliance | Done | Field Service read model; operational reports (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence); dashboards, exports, and audit-readiness surface. |

## 4. Capability Coverage

Every capability defined by the Field Service Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the Field Service Module PRD and the Sprint PRD family. No capability has been **added, removed, renamed, merged, split, or ownership-transferred** by this consolidation.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-012 Capability (Module PRD §2) | Originating Sprint |
| --- | --- |
| Ticket capture and triage | SPR-MOD-012-001 |
| Dispatch and scheduling | SPR-MOD-012-002 |
| Mobile visit execution | SPR-MOD-012-003 |
| Spare parts and consumption | SPR-MOD-012-003 |
| Signature capture and closure | SPR-MOD-012-003 |
| SLA and escalation tracking | SPR-MOD-012-004 |
| Field Service reports, dashboards, exports, audit readiness (Module PRD §9, §11) | SPR-MOD-012-005 |
| Field Service governance conventions (summarized in §7) | Established across SPR-MOD-012-001 … SPR-MOD-012-005 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-012-001 | Ticket capture and triage |
| SPR-MOD-012-002 | Dispatch and scheduling |
| SPR-MOD-012-003 | Mobile visit execution; Spare parts and consumption; Signature capture and closure |
| SPR-MOD-012-004 | SLA and escalation tracking |
| SPR-MOD-012-005 | Field Service reports, dashboards, exports, audit readiness (§9, §11) |

No Field Service capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-012-001` through `SPR-MOD-012-005`, and reconciled with the Sprint Plan §5 Engine Consumption Map.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim, and canonical ordering from `ENGINE_CATALOG.md` is preserved.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-012-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-012-001, 002, 003, 004, 005 |
| ENG-003 (Permission Management Engine) | SPR-MOD-012-001 |
| ENG-004 (Audit Engine) | SPR-MOD-012-001, 002, 003, 004, 005 |
| ENG-005 (Configuration Engine) | SPR-MOD-012-001, 002, 003, 004 |
| ENG-006 (Localization Engine) | SPR-MOD-012-001 |
| ENG-007 (Document Engine) | SPR-MOD-012-001, 003 |
| ENG-008 (Attachment Engine) | SPR-MOD-012-001, 003 |
| ENG-010 (Workflow Engine) | SPR-MOD-012-001, 002, 003, 004 |
| ENG-011 (Approval Engine) | SPR-MOD-012-004 |
| ENG-012 (Rules Engine) | SPR-MOD-012-001, 002, 003, 004 |
| ENG-013 (Automation Engine) | SPR-MOD-012-002, 004 |
| ENG-014 (Scheduler Engine) | SPR-MOD-012-002, 004 |
| ENG-017 (Numbering Engine) | SPR-MOD-012-001, 003 |
| ENG-020 (Search Engine) | SPR-MOD-012-005 |
| ENG-021 (Reporting Engine) | SPR-MOD-012-005 |
| ENG-022 (Dashboard Engine) | SPR-MOD-012-005 |
| ENG-023 (Integration Engine) | SPR-MOD-012-005 |
| ENG-024 (Event Engine) | SPR-MOD-012-001, 002, 003, 004, 005 |
| ENG-025 (Notification Engine) | SPR-MOD-012-001, 002, 003, 004, 005 |
| ENG-027 (Export Engine) | SPR-MOD-012-005 |

No Field Service sprint redefines engine behavior; all engines are consumed via their Capability Interfaces. `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any Field Service sprint — all ledger effects of billable field work are owned by MOD-002 Accounting via posting-rule bindings triggered by Field Service-published events, per the governance boundary declared in the Module PRD and Sprint Plan §5.

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-012-001` through `SPR-MOD-012-005`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim; canonical ordering from `ADR_INDEX.md` is preserved.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-012-001, 002, 003, 004, 005 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-012-001, 002, 003, 004, 005 |

## 7. Governance Conventions Established

Every governance convention established across Field Service Sprint PRDs 001–005 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-012-001 — Field Service Foundation (Tickets & Field Workforce)**

- **Field Service Ownership Convention** — MOD-012 Field Service owns the business semantics of Technician, Skill, Territory, and Ticket Type masters and the Field Ticket transaction lifecycle, along with Field Service configuration (numbering series, ticket-type policies). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, attachments, workflow, rules, eventing, notification) but MUST NOT redefine Field Service business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-005 (item master and stock), MOD-011 (contract/entitlement authority), MOD-016 (service-desk ticket master), MOD-002 (ledger posting), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD. `FieldTicketCreated` events are published via `ENG-024`; `ContractSigned` events are consumed read-only for optional AMC linkage.

**From SPR-MOD-012-002 — Dispatch & Scheduling**

- **Visit Transaction Authority** — MOD-012 owns the Visit transaction and its dispatch-phase lifecycle (`assigned → en route → on site`) enforced via `ENG-010`.
- **Dispatch Strategy Authority** — Dispatch strategies and territory rules are registered via `ENG-005` and evaluated via `ENG-012`; scheduled dispatch runs via `ENG-014` and automated re-dispatch via `ENG-013`. `VisitAssigned` events are published via `ENG-024`; `VisitScheduled` events (from MOD-011 AMC) are consumed read-only to materialize AMC-driven visits. AMC preventive-visit scheduling authority remains with MOD-011.

**From SPR-MOD-012-003 — Mobile Visit Execution (Spares, Signatures, Closure)**

- **Visit Completion Authority** — MOD-012 owns Visit completion (`on site → completed`). Required signatures/checklists gate the transition via `ENG-012`.
- **Spare Consumption Transaction Authority** — MOD-012 owns the Spare Consumption transaction; numbering issues via `ENG-017`; state changes are audited via `ENG-004`. Van-stock decrement is effected by the published `SpareConsumed` event; MOD-005 Inventory consumes this event for stock adjustment. Item master and stock authority remain with MOD-005. Closure Reports are attached via `ENG-008` and rendered via `ENG-007`. `FieldVisitCompleted` and `SpareConsumed` events are published via `ENG-024`; `ServiceTicketClosed` events (from MOD-016 Service Desk) are consumed to reconcile ticket closure with visit completion.

**From SPR-MOD-012-004 — SLA & Escalation**

- **SLA Policy Master Authority** — MOD-012 owns the SLA Policy master; policies are registered per company and resolved deterministically per ticket type/territory/entitlement via `ENG-005`.
- **SLA Clock and Escalation Workflow Authority** — SLA clocks start/pause/resume/stop from Field Ticket and Visit lifecycle events (owned by MOD-012). Breach rules evaluate via `ENG-012`; escalations run via `ENG-010`/`ENG-011`. Scheduled SLA checks run via `ENG-014` and automated escalations via `ENG-013`. Breach notifications dispatch via `ENG-025`. AMC entitlements (owned by MOD-011) are consumed read-only as SLA-resolution context.

**From SPR-MOD-012-005 — Field Service Analytics & Compliance**

- **Field Service Read Model & Report Authority** — MOD-012 owns operational Field Service reports (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), dashboards, exports, and the Field Service audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read-Model-Only Boundary Convention** — Dashboards (`ENG-022`), filters, drill-down, search (`ENG-020`), reports (`ENG-021`), integration (`ENG-023`), and export (`ENG-027`) operate over the Field Service read model; no new master data, transactions, workflows, or published events are introduced by Sprint 5.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint Field Service events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed`) through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform, Accounting, Sales, Purchase, Inventory, CRM, HRMS, Payroll, Manufacturing, Projects, AMC, and Warehouse governance conventions established in prior Module Baselines.

**Freeze.** Governance conventions summarized herein are frozen for `MOD012_FIELD_SERVICE_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-012-001` through `SPR-MOD-012-005`.** Every referenced event resolves verbatim from [`docs/20-module-prds/field-service/MODULE_PRD.md`](../20-module-prds/field-service/MODULE_PRD.md) §8 or the authoritative [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md). **No new event names SHALL be introduced by the Module Baseline.**

**Events Published by Field Service** (verbatim from Field Service Module PRD §8):

- `FieldTicketCreated` — SPR-MOD-012-001
- `VisitAssigned` — SPR-MOD-012-002
- `FieldVisitCompleted` — SPR-MOD-012-003
- `SpareConsumed` — SPR-MOD-012-003

**Events Consumed by Field Service** (verbatim from Field Service Module PRD §8):

- `ContractSigned` (from MOD-011 AMC) — SPR-MOD-012-001
- `VisitScheduled` (from MOD-011 AMC) — SPR-MOD-012-002
- `ServiceTicketClosed` (from MOD-016 Service Desk) — SPR-MOD-012-003
- `FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed` (Field Service-published; consumed by the read model) — SPR-MOD-012-005

Deferred event surfaces are inherited as `R-EV-*` risks from the originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD012_FIELD_SERVICE_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by Field Service. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**Field Service SHALL consume Platform, Inventory, AMC, Service Desk, Accounting, and Analytics services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by Field Service:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-005 Inventory** — Item master (read-only); van-stock adjustment via consumption of the `SpareConsumed` event published by Field Service.
- **MOD-011 AMC** — `ContractSigned` and `VisitScheduled` events consumed read-only for ticket linkage and materialization of AMC-driven visits; contract/entitlement/scheduling authority remains with MOD-011.
- **MOD-016 Service Desk** — `ServiceTicketClosed` event consumed read-only for closure reconciliation.
- **MOD-002 Accounting** — ledger effects of any billable field work are owned by MOD-002 via `ENG-015` Voucher and `ENG-016` Posting bindings; MOD-012 does not invoke the voucher or posting engines directly.

**Downstream consumers of the Field Service baseline** (per Field Service Module PRD §13 *Provides To Modules*):

- **MOD-011 AMC** — consumes `FieldVisitCompleted` for entitlement consumption tracking.
- **MOD-005 Inventory** — consumes `SpareConsumed` for van-stock adjustment.
- **MOD-002 Accounting** — consumes Field Service-published events for ledger-effect bindings on billable field work.
- **MOD-017 Analytics** — consumes Field Service operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

Downstream modules MUST NOT own Field Service master data, redefine the Field Ticket / Visit / Spare Consumption / Closure Report lifecycles, or redefine Field Service analytics ownership. No downstream module owns Field Service assets.

## 10. Module Completion & Freeze Statement

All five planned Field Service Sprint PRDs (`SPR-MOD-012-001` … `SPR-MOD-012-005`) exist, the [Sprint Plan](../30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md) is executed, and repository verification has been completed under GT-004. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-012 Field Service is now frozen for downstream consumption. Future changes to `MOD012_FIELD_SERVICE_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD012_FIELD_SERVICE_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD012_FIELD_SERVICE_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Ledger effects of billable field work (owned by MOD-002 Accounting).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/field-service/MODULE_PRD.md`](../20-module-prds/field-service/MODULE_PRD.md) — MOD-012 Module PRD (authoritative).
- [`docs/30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md`](../30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md`](../30-sprint-prds/field-service/SPR-MOD-012-001-field-service-foundation-tickets-and-field-workforce.md)
- [`docs/30-sprint-prds/field-service/SPR-MOD-012-002-dispatch-and-scheduling.md`](../30-sprint-prds/field-service/SPR-MOD-012-002-dispatch-and-scheduling.md)
- [`docs/30-sprint-prds/field-service/SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md`](../30-sprint-prds/field-service/SPR-MOD-012-003-mobile-visit-execution-spares-signatures-closure.md)
- [`docs/30-sprint-prds/field-service/SPR-MOD-012-004-sla-and-escalation.md`](../30-sprint-prds/field-service/SPR-MOD-012-004-sla-and-escalation.md)
- [`docs/30-sprint-prds/field-service/SPR-MOD-012-005-field-service-analytics-and-compliance.md`](../30-sprint-prds/field-service/SPR-MOD-012-005-field-service-analytics-and-compliance.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`](../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md) — authoring template.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](./MOD005_INVENTORY_BASELINE_v1.md) — upstream Inventory baseline.
- [`docs/40-module-baselines/MOD011_AMC_BASELINE_v1.md`](./MOD011_AMC_BASELINE_v1.md) — upstream AMC baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
