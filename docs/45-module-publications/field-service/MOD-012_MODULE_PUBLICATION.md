---
title: "MOD-012 Module Publication — Field Service"
summary: "GT-005 Module Publication for MOD-012 Field Service. Terminal governance artifact derived exclusively from MOD012_FIELD_SERVICE_BASELINE_v1 and the MOD-012 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-012_MODULE_PUBLICATION"
publication_id: "MOD-012_MODULE_PUBLICATION"
module_id: "MOD-012"
module_name: "Field Service"
version: "1.0"
status: "Published"
owner: "Service"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/field-service/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md"
source_module: "MOD-012"
source_sprints: ["SPR-MOD-012-001", "SPR-MOD-012-002", "SPR-MOD-012-003", "SPR-MOD-012-004", "SPR-MOD-012-005"]
layer: "delivery"
updated: "2026-07-20"
tags: ["publication", "module", "MOD-012", "field-service", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD012-20260720T130000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
related_modules: ["MOD-001", "MOD-005", "MOD-011", "MOD-016", "MOD-002", "MOD-017"]
---

# MOD-012 Module Publication — Field Service

> **Reference publication only.** Faithful representation of [`MOD012_FIELD_SERVICE_BASELINE_v1`](../../40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md) and the [`MOD-012 Module PRD`](../../20-module-prds/field-service/MODULE_PRD.md). Introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-012
- **Module Name:** Field Service
- **Owner:** Service
- **Publication ID:** MOD-012_MODULE_PUBLICATION
- **Source Baseline:** `MOD012_FIELD_SERVICE_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md`](../../30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-012-001` … `SPR-MOD-012-005`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

Field Service is the authoritative bounded context for field tickets, dispatch, visit execution, spare consumption, and mobile workforce management (Baseline §1; PRD §1). It owns Technician, Skill, Territory, Ticket Type, and SLA Policy master lifecycles and Field Service configuration (numbering series, ticket-type policies, dispatch strategies, SLA policies, territory rules, mobile app settings); Field Ticket, Visit, Spare Consumption, and Closure Report transaction lifecycles; dispatch-strategy resolution, scheduled and automated dispatch; on-site visit execution, signature/checklist capture, and closure; SLA clock tracking and rule-driven escalation; and the Field Service operational read model for reports, dashboards, exports, and audit readiness (Baseline §2; PRD §2). Identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration; the Item master and stock remain owned by MOD-005 Inventory; AMC contract/entitlement authority and preventive-visit scheduling authority remain owned by MOD-011 AMC; the service-desk ticket master remains owned by MOD-016 Service Desk; ledger effects of billable field work are produced by MOD-002 Accounting via `ENG-015` and `ENG-016`; cross-module KPI definitions remain owned by MOD-017 Analytics (Baseline §2, §9; PRD §2, §13).

## 3. Approved Scope

Restates the scope consolidated in `MOD012_FIELD_SERVICE_BASELINE_v1` §2 and the Module PRD §2. Field Service owns:

- Ticket capture and triage — Ticket Type master and Field Ticket transaction lifecycle (`open → triaged → dispatched → in progress → closed → cancelled`) (Baseline §2; PRD §2, §5, §6).
- Dispatch and scheduling — Visit transaction dispatch phase (`assigned → en route → on site`); dispatch-strategy resolution (skill × territory × availability); scheduled and automated dispatch (Baseline §2; PRD §2, §6).
- Mobile visit execution — Visit completion (`on site → completed`); on-site execution (Baseline §2; PRD §2, §6).
- Spare parts and consumption — Spare Consumption transaction and van-stock decrement via published `SpareConsumed` (Baseline §2; PRD §2, §6, §8).
- Signature capture and closure — Signature/checklist capture gating visit completion; Closure Report authoring (Baseline §2; PRD §2, §6, §7).
- SLA and escalation tracking — SLA Policy master; SLA clocks against Field Ticket/Visit lifecycles; rule-driven escalation workflows (Baseline §2; PRD §2, §7).
- Field Service Analytics & Compliance — read-model operational reports (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), dashboards, exports, and audit-readiness surface (Baseline §2; PRD §9, §11).

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Inherited verbatim from `MOD012_FIELD_SERVICE_BASELINE_v1` §7.

### 4.1 SPR-MOD-012-001 — Field Service Foundation (Tickets & Field Workforce)

- **Field Service Ownership Convention Authority** — MOD-012 Field Service owns the business semantics of Technician, Skill, Territory, and Ticket Type masters and the Field Ticket transaction lifecycle, along with Field Service configuration (numbering series, ticket-type policies). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, attachments, workflow, rules, eventing, notification) but MUST NOT redefine Field Service business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-005 (item master and stock), MOD-011 (contract/entitlement authority), MOD-016 (service-desk ticket master), MOD-002 (ledger posting), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD. `FieldTicketCreated` events are published via `ENG-024`; `ContractSigned` events are consumed read-only for optional AMC linkage.

### 4.2 SPR-MOD-012-002 — Dispatch & Scheduling

- **Visit Transaction Authority** — MOD-012 owns the Visit transaction and its dispatch-phase lifecycle (`assigned → en route → on site`) enforced via `ENG-010`.
- **Dispatch Strategy Authority** — Dispatch strategies and territory rules are registered via `ENG-005` and evaluated via `ENG-012`; scheduled dispatch runs via `ENG-014` and automated re-dispatch via `ENG-013`. `VisitAssigned` events are published via `ENG-024`; `VisitScheduled` events (from MOD-011 AMC) are consumed read-only to materialize AMC-driven visits. AMC preventive-visit scheduling authority remains with MOD-011.

### 4.3 SPR-MOD-012-003 — Mobile Visit Execution (Spares, Signatures, Closure)

- **Visit Completion Authority** — MOD-012 owns Visit completion (`on site → completed`). Required signatures/checklists gate the transition via `ENG-012`.
- **Spare Consumption Transaction Authority** — MOD-012 owns the Spare Consumption transaction; numbering issues via `ENG-017`; state changes are audited via `ENG-004`. Van-stock decrement is effected by the published `SpareConsumed` event; MOD-005 Inventory consumes this event for stock adjustment. Item master and stock authority remain with MOD-005. Closure Reports are attached via `ENG-008` and rendered via `ENG-007`. `FieldVisitCompleted` and `SpareConsumed` events are published via `ENG-024`; `ServiceTicketClosed` events (from MOD-016 Service Desk) are consumed to reconcile ticket closure with visit completion.

### 4.4 SPR-MOD-012-004 — SLA & Escalation

- **SLA Policy Master Authority** — MOD-012 owns the SLA Policy master; policies are registered per company and resolved deterministically per ticket type/territory/entitlement via `ENG-005`.
- **SLA Clock and Escalation Workflow Authority** — SLA clocks start/pause/resume/stop from Field Ticket and Visit lifecycle events (owned by MOD-012). Breach rules evaluate via `ENG-012`; escalations run via `ENG-010`/`ENG-011`. Scheduled SLA checks run via `ENG-014` and automated escalations via `ENG-013`. Breach notifications dispatch via `ENG-025`. AMC entitlements (owned by MOD-011) are consumed read-only as SLA-resolution context.

### 4.5 SPR-MOD-012-005 — Field Service Analytics & Compliance

- **Field Service Read Model & Report Authority** — MOD-012 owns operational Field Service reports (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), dashboards, exports, and the Field Service audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read-Model-Only Boundary Convention Authority** — Dashboards (`ENG-022`), filters, drill-down, search (`ENG-020`), reports (`ENG-021`), integration (`ENG-023`), and export (`ENG-027`) operate over the Field Service read model; no new master data, transactions, workflows, or published events are introduced by Sprint 5.
- **Audit Readiness Boundary Convention Authority** — Audit readiness exposes prior-sprint Field Service events (`FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed`) through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-012-001` … `SPR-MOD-012-005`) as consolidated in `MOD012_FIELD_SERVICE_BASELINE_v1`. This publication introduces no new requirements.

## 6. Business Rules

Verbatim from Module PRD §7 and Baseline §7:

- A visit cannot be closed without required signatures/checklists (PRD §7).
- Spare consumption reduces the technician's van stock (PRD §7; effected via published `SpareConsumed` consumed by MOD-005).
- SLA breaches trigger escalation per policy (PRD §7).
- Field Service master and transaction lifecycles are Field Service-owned; no other module mutates Field Service state (Baseline §7).
- The Item master and stock are owned by MOD-005 Inventory; Field Service consumes them read-only and effects van-stock decrement only by publishing `SpareConsumed` (PRD §13; Baseline §7, §9).
- AMC contract/entitlement authority and preventive-visit scheduling authority remain with MOD-011; Field Service consumes `ContractSigned` and `VisitScheduled` read-only (PRD §13; Baseline §7, §9).
- The service-desk ticket master is owned by MOD-016; Field Service consumes `ServiceTicketClosed` read-only (PRD §13; Baseline §7, §9).
- Field Service does not implement double-entry posting; ledger effects of billable field work are produced by MOD-002 Accounting via `ENG-015` and `ENG-016` (PRD §2, §6; Baseline §5, §7, §9).
- Analytics surfaces are read-only projections over the Field Service read model (Baseline §7).

## 7. Master Data Authorities

Verbatim from Module PRD §5 and Baseline §4, §7:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Technician | SPR-MOD-012-001 |
| Skill | SPR-MOD-012-001 |
| Territory | SPR-MOD-012-001 |
| Ticket Type | SPR-MOD-012-001 |
| SLA Policy | SPR-MOD-012-004 |

## 8. Transaction Authorities

Verbatim from Module PRD §6 and Baseline §4, §7:

| Transaction | Originating Sprint |
| --- | --- |
| Field Ticket | SPR-MOD-012-001 |
| Visit | SPR-MOD-012-002 (dispatch phase); SPR-MOD-012-003 (completion) |
| Spare Consumption | SPR-MOD-012-003 |
| Closure Report | SPR-MOD-012-003 |

## 9. Published Events

Emitted via `ENG-024` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by Field Service; delivery infrastructure owned by Platform. Verbatim from Baseline §8 and Module PRD §8:

- `FieldTicketCreated` — SPR-MOD-012-001
- `VisitAssigned` — SPR-MOD-012-002
- `FieldVisitCompleted` — SPR-MOD-012-003
- `SpareConsumed` — SPR-MOD-012-003

## 10. Consumed Events

Consumed via `ENG-024`. Consumption is read-only. Verbatim from Baseline §8 and Module PRD §8:

- `ContractSigned` (from MOD-011 AMC) — SPR-MOD-012-001
- `VisitScheduled` (from MOD-011 AMC) — SPR-MOD-012-002
- `ServiceTicketClosed` (from MOD-016 Service Desk) — SPR-MOD-012-003
- `FieldTicketCreated`, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed` (Field Service-published; consumed by the read model) — SPR-MOD-012-005

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-012 via their Capability Interfaces. Engine set inherited verbatim from `MOD012_FIELD_SERVICE_BASELINE_v1` §5:

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

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-032` (RBAC + ABAC). `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any Field Service sprint — ledger effects of billable field work are owned by MOD-002 via posting-rule bindings triggered by Field Service-published events, per the governance boundary in the Module PRD and Baseline §5, §7.

## 12. Dependencies

Verbatim from `MOD012_FIELD_SERVICE_BASELINE_v1` §9 and Module PRD §13.

**Upstream contracts consumed by Field Service:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- `MOD005_INVENTORY_BASELINE_v1` — Item master (read-only); van-stock adjustment via consumption of the `SpareConsumed` event published by Field Service.
- `MOD011_AMC_BASELINE_v1` — `ContractSigned` and `VisitScheduled` events consumed read-only for ticket linkage and materialization of AMC-driven visits.
- `MOD016_SERVICE_DESK_BASELINE_v1` — `ServiceTicketClosed` event consumed read-only for closure reconciliation.
- `MOD002_ACCOUNTING_BASELINE_v1` — ledger effects of any billable field work are owned by MOD-002 via `ENG-015` and `ENG-016` bindings.

**Downstream consumers of Field Service:**

- `MOD-011 AMC` — consumes `FieldVisitCompleted` for entitlement consumption tracking.
- `MOD-005 Inventory` — consumes `SpareConsumed` for van-stock adjustment.
- `MOD-002 Accounting` — consumes Field Service-published events for ledger-effect bindings on billable field work.
- `MOD-017 Analytics` — consumes Field Service operational read models and lifecycle events; owns cross-module KPI definitions.

## 13. Ownership Boundaries

Verbatim from Baseline §7 and §9 and PRD §2, §13:

- MOD-012 owns **only** the authorities enumerated in §4.
- Downstream modules MUST NOT own Field Service master data, redefine the Field Ticket / Visit / Spare Consumption / Closure Report lifecycles, or redefine Field Service analytics ownership.
- Identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration.
- The Item master and stock remain owned by MOD-005 Inventory; Field Service consumes Item read-only and never mutates stock directly (van-stock decrement is effected only by MOD-005 consuming the `SpareConsumed` event).
- AMC contract/entitlement authority and preventive-visit scheduling authority remain with MOD-011; Field Service consumes `ContractSigned` and `VisitScheduled` read-only.
- The service-desk ticket master is owned by MOD-016; Field Service consumes `ServiceTicketClosed` read-only.
- Ledger posting for billable field work is produced by MOD-002 via `ENG-015` and `ENG-016`; Field Service emits events and does not write journal entries directly.
- `ENG-004` remains authoritative for audit collection; Field Service owns only the business-level audit-readiness surface.
- `ENG-024` remains authoritative for event delivery infrastructure; Field Service owns the semantics of the events it emits.
- Cross-module KPI definitions remain exclusive to MOD-017 Analytics.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md`](../../30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | `SPR-MOD-012-001` … `SPR-MOD-012-005` |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md`](../../40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |

## 15. Non-Goals

Inherited verbatim from Baseline §11 and Module PRD §14 (as future items):

- Offline-first mobile beyond the platform baseline (PRD §14 Future Enhancements).
- AI dispatch optimization (PRD §14).
- Predictive maintenance (PRD §14).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Ledger effects of billable field work (owned by MOD-002 Accounting).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and the MOD-006 … MOD-011 reference pattern, Phase 3 Solution Design proceeds in the sequence:

`WEB-012 → MOB-012 → API-012 → CPC-012 → VR-012`

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority in §4 is inherited verbatim from `MOD012_FIELD_SERVICE_BASELINE_v1`.
2. Engine and ADR sets in §11 match Baseline §5–§6 exactly.
3. Dependency set in §12 matches Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD012-20260720T130000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD012_PUBLICATION_COMPLETE` → ready for `WEB-012 Field Service Solution Design`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD012_FIELD_SERVICE_BASELINE_v2`).

## 19. Repository State Transition

`MOD012_BASELINE_FROZEN` → **`MOD012_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md`](../../40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)
- [`docs/30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md`](../../30-sprint-prds/field-service/MOD-012_SPRINT_PLAN.md)
- [`docs/45-module-publications/amc/MOD-011_MODULE_PUBLICATION.md`](../amc/MOD-011_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
