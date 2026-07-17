---
title: "MOD-016 Service Desk — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-016 Service Desk. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Service"
status: "Approved"
updated: "2026-07-17"
module_id: "MOD-016"
module_name: "Service Desk"
sprint_prefix: "SPR-MOD-016-"
stage: "1"
pass: "18.0.0"
parent_module_prd: "docs/20-module-prds/service-desk/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
governance_specification: "v1.0"
template_standard: "v1.3"
authored_by_template: "GT-002"
execution_id: "GT002-MOD016-20260717T060000Z-001"
tags: ["sprint", "planning", "service-desk", "mod-016", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-016 Service Desk — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-016 Service Desk** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## Normative Source Precedence

On any conflict, the following order wins:

1. `docs/20-module-prds/service-desk/MODULE_PRD.md` (Module PRD)
2. This Capability Allocation Matrix (§4)
3. The sprint sections in §2 of this Sprint Plan
4. Any derived artifact

## 1. Purpose & Scope

Plan the implementation of MOD-016 Service Desk by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD.

This plan introduces no new business requirements beyond the approved [MOD-016 Service Desk Module PRD](../../20-module-prds/service-desk/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Governance Boundaries (recapitulated).** Per the Module PRD §13:

- **Identity, authentication, and permissions** are owned by **MOD-001 Platform Administration** via `ENG-001`, `ENG-002`, `ENG-003`.
- **Customer master data** is consumed read-only from **MOD-006 CRM**.
- **Field visit handoff** to **MOD-012 Field Service** occurs strictly through published events; MOD-016 does not redefine field-service transactions.
- **Cross-module KPI definitions** are owned by **MOD-017 Analytics**. Operational Service Desk reports are surfaced within MOD-016.
- **Ledger effects (if any)** remain owned by **MOD-002 Accounting** via `ENG-015`/`ENG-016`; MOD-016 declares no direct posting responsibilities.

**Traceability:**

- Parent Module README — [`../../20-module-prds/service-desk/README.md`](../../20-module-prds/service-desk/README.md)
- Parent Module PRD — [`../../20-module-prds/service-desk/MODULE_PRD.md`](../../20-module-prds/service-desk/MODULE_PRD.md)
- Upstream module baselines — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-016 in `SPRINT_ROADMAP.md` is **4**; this plan refines the estimate to **5** for cohesion (see §2 last paragraph — such refinement is explicitly permitted where every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation).

## 2. Proposed Sprint Sequence

### SPR-MOD-016-001 — Service Desk Foundation (Categories, SLA Policies, Business Hours & Routing)

- **Objective.** Establish Service Desk foundations under a tenant/company: Ticket Category and SLA Policy master data; routing rules; escalation matrices; business hours per region; numbering series for Service Desk documents.
- **Boundaries.**
  - In: Ticket Category master; SLA Policy master; routing rules; escalation matrices; business hours per region; numbering series.
  - Out: ticket capture and lifecycle (SPR-MOD-016-002); SLA enforcement and escalation execution (SPR-MOD-016-003); Knowledge Base, macros and CSAT (SPR-MOD-016-004); analytics and compliance (SPR-MOD-016-005); identity/permissions (owned by MOD-001).
- **Estimated size.** Small.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Categorization and routing; SLA and escalation policies — configuration surface), §3 Personas, §5 Master Data (Ticket Category, SLA Policy), §10 Configuration (SLA policies, Routing rules, Escalation matrices, Business hours per region).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-012` Rules, `ENG-017` Numbering, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (MOD-016 sprint 1). Depends on frozen `MOD001_PLATFORM_BASELINE_v1` and `MOD006_CRM_BASELINE_v1`.
- **Sprint Exit Criteria.**
  - Ticket Category and SLA Policy records can be created, edited, and archived under a tenant/company.
  - Routing rules, escalation matrices, and business hours per region are resolvable via `ENG-005` in the tenant → company → context hierarchy.
  - Structural validation and hierarchy enforcement run deterministically via `ENG-012`.
  - Document numbers for Service Desk transactions issue through `ENG-017`.
  - All state changes are audited via `ENG-004`.

### SPR-MOD-016-002 — Ticket Capture & Lifecycle

- **Objective.** Deliver the Ticket-to-resolution process: multi-channel ticket capture (email, chat, WhatsApp, voice), Service Ticket transaction lifecycle, categorization and routing execution, close-with-open-child-task rule, and publication of `ServiceTicketCreated` and `ServiceTicketClosed`.
- **Boundaries.**
  - In: multi-channel ticket capture; Service Ticket transaction lifecycle; categorization/routing execution; close-with-open-child-task rule; consumption of `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon`; publication of `ServiceTicketCreated` and `ServiceTicketClosed`.
  - Out: foundation masters and configuration (SPR-MOD-016-001); SLA breach detection and escalation execution (SPR-MOD-016-003); Knowledge Base, macros and CSAT (SPR-MOD-016-004); analytics (SPR-MOD-016-005); ledger posting (owned by MOD-002 if any).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Multi-channel ticket capture; submodule Tickets), §4 Business Processes (Ticket-to-resolution), §6 Transactions (Service Ticket), §7 (close-with-open-child-task rule), §8 Integration Points (`ServiceTicketCreated`, `ServiceTicketClosed` — published; `FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon` — consumed; External Systems — Email, Chat, WhatsApp, Voice).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-012` Rules, `ENG-017` Numbering, `ENG-020` Search, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-016-001`.
- **Sprint Exit Criteria.**
  - Tickets can be captured across Email, Chat, WhatsApp, and Voice channels via `ENG-023`; attachments are handled via `ENG-008`; documents via `ENG-007`.
  - Service Ticket lifecycle is enforced via `ENG-010`; categorization/routing decisions run deterministically via `ENG-012` against Ticket Category and routing rules from sprint 001.
  - A ticket cannot be closed while it has open child tasks (rule enforced via `ENG-012`).
  - `ServiceTicketCreated` and `ServiceTicketClosed` publish via `ENG-024`; `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon` are consumed and reconciled to tickets.
  - Ticket search and retrieval are supported via `ENG-020`.
  - Document numbers issue through `ENG-017`; all state changes are audited via `ENG-004`.

### SPR-MOD-016-003 — SLA Enforcement & Escalations

- **Objective.** Deliver the Escalation process: SLA clock evaluation against SLA Policies and business hours, pause-on-customer-waiting rule, SLA Breach Event transaction, deterministic escalation execution, and publication of `SLABreached`.
- **Boundaries.**
  - In: SLA clock evaluation; pause-on-customer-waiting rule; SLA Breach Event transaction lifecycle; escalation execution; `SLABreached` publication; automated escalation notifications.
  - Out: foundation masters (SPR-MOD-016-001); ticket capture and lifecycle (SPR-MOD-016-002); Knowledge Base, macros and CSAT (SPR-MOD-016-004); analytics (SPR-MOD-016-005).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (SLA and escalation policies — enforcement; submodules SLAs, Escalations), §4 Business Processes (Escalation), §6 Transactions (SLA Breach Event), §7 (SLA-pause-during-customer-waiting rule), §8 Integration Points (`SLABreached` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-013` Automation, `ENG-017` Numbering, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-016-001`, `SPR-MOD-016-002`.
- **Sprint Exit Criteria.**
  - SLA clocks evaluate against SLA Policies (sprint 001) and Service Ticket state (sprint 002); pause-on-customer-waiting is enforced deterministically via `ENG-012` per configured customer-waiting states.
  - SLA Breach Event lifecycle is enforced via `ENG-010`; approval-gated escalations, where configured, run via `ENG-011`.
  - Automated escalation execution runs via `ENG-013`; notifications dispatch via `ENG-025`.
  - `SLABreached` events publish via `ENG-024`.
  - All state changes are audited via `ENG-004`.

### SPR-MOD-016-004 — Knowledge Base, Macros & CSAT

- **Objective.** Deliver the Knowledge capture and CSAT loop processes: Knowledge Article master with review-before-publish rule, macros for agent productivity, CSAT Response transaction, survey dispatch and capture, and publication of `KnowledgeArticlePublished`.
- **Boundaries.**
  - In: Knowledge Article master; review-before-publish rule; macros; CSAT Response transaction lifecycle; CSAT survey dispatch and capture; `KnowledgeArticlePublished` publication.
  - Out: foundation masters (SPR-MOD-016-001); ticket capture (SPR-MOD-016-002); SLA enforcement (SPR-MOD-016-003); reports/dashboards/exports (SPR-MOD-016-005).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Knowledge base and macros; Customer satisfaction surveys; submodules Knowledge Base, CSAT), §4 Business Processes (Knowledge capture; CSAT loop), §5 Master Data (Knowledge Article), §6 Transactions (CSAT Response), §7 (knowledge-articles-must-be-reviewed-before-publish rule), §8 Integration Points (`KnowledgeArticlePublished` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-017` Numbering, `ENG-020` Search, `ENG-024` Event, `ENG-025` Notification, `ENG-028` AI Copilot.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-016-001`, `SPR-MOD-016-002`.
- **Sprint Exit Criteria.**
  - Knowledge Articles can be authored, reviewed, and published; the review-before-publish rule is enforced via `ENG-011`/`ENG-012` — no article publishes without a review approval.
  - Macros are defined and applied to tickets deterministically via `ENG-012` and audited via `ENG-004`.
  - CSAT Response transactions run via `ENG-010`; surveys dispatch via `ENG-025` and capture responses under `ENG-004` audit.
  - Knowledge Article search and retrieval run via `ENG-020`; AI-assisted suggestions (where configured) run via `ENG-028` without redefining engine behavior.
  - `KnowledgeArticlePublished` events publish via `ENG-024`.

### SPR-MOD-016-005 — Service Analytics & Compliance

- **Objective.** Deliver the Service Desk operational reporting surface: Ticket Volume, SLA Adherence, CSAT Trend, and Agent Productivity reports; dashboards; bulk exports; consumption of cross-module KPI definitions from MOD-017; and the module audit-readiness surface.
- **Boundaries.**
  - In: operational reports (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity); dashboards; bulk exports; consumption of MOD-017 KPI definitions; audit-readiness surface; module read model.
  - Out: master and transaction authoring for tickets, SLA, KB, macros, CSAT (SPR-MOD-016-001..004); cross-module KPI definitions (owned by MOD-017); ledger posting (owned by MOD-002 if any).
- **Estimated size.** Small.
- **Module PRD sections covered.** §2 Business Scope (Reporting on service performance), §9 Reports & Analytics (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity; Dashboards; KPIs; Exports), §11 Non-functional Considerations (compliance/audit readiness), §13 Dependencies (Provides To MOD-017).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-023` Integration (KPI catalog consumption), `ENG-024` Event, `ENG-027` Export.
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-016-001`, `SPR-MOD-016-002`, `SPR-MOD-016-003`, `SPR-MOD-016-004`.
- **Sprint Exit Criteria.**
  - Ticket Volume, SLA Adherence, CSAT Trend, and Agent Productivity reports render via `ENG-021`.
  - Dashboards surface Service Desk read-model projections via `ENG-022`; KPI definitions are consumed read-only from MOD-017 via `ENG-023`.
  - Bulk exports of operational reports are produced via `ENG-027`.
  - Audit-readiness surface is complete: every state-changing transaction traces to an `ENG-004` audit event.

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-016-001 (Service Desk Foundation)
         │
         ▼
SPR-MOD-016-002 (Ticket Capture & Lifecycle)
         │
         ├─────────────┐
         ▼             ▼
SPR-MOD-016-003   SPR-MOD-016-004
(SLA Enforcement  (Knowledge Base,
 & Escalations)    Macros & CSAT)
         │             │
         └──────┬──────┘
                ▼
SPR-MOD-016-005 (Service Analytics & Compliance)
```

Sprint 002 depends on 001. Sprints 003 and 004 both depend on 001 and 002 and are independent of each other. Sprint 005 consumes output from all four predecessors.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-016 Service Desk Module PRD](../../20-module-prds/service-desk/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint.

### 4.1 Capability Allocation Matrix (Forward Map)

| # | Module PRD Capability (§2) | Origin Sprint | PRD Section | Exact Quote | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Multi-channel ticket capture | SPR-MOD-016-002 | §2 | "Multi-channel ticket capture" | PASS |
| 2 | Categorization and routing | SPR-MOD-016-001 | §2 | "Categorization and routing" | PASS |
| 3 | SLA and escalation policies | SPR-MOD-016-001 | §2 | "SLA and escalation policies" | PASS |
| 4 | Knowledge base and macros | SPR-MOD-016-004 | §2 | "Knowledge base and macros" | PASS |
| 5 | Customer satisfaction surveys | SPR-MOD-016-004 | §2 | "Customer satisfaction surveys" | PASS |
| 6 | Reporting on service performance | SPR-MOD-016-005 | §2 | "Reporting on service performance" | PASS |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Tickets | SPR-MOD-016-002 |
| SLAs | SPR-MOD-016-001 (policy master) / SPR-MOD-016-003 (enforcement) |
| Knowledge Base | SPR-MOD-016-004 |
| Escalations | SPR-MOD-016-003 |
| CSAT | SPR-MOD-016-004 |

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Ticket Category | Master Data (§5) | SPR-MOD-016-001 |
| SLA Policy | Master Data (§5) | SPR-MOD-016-001 |
| Knowledge Article | Master Data (§5) | SPR-MOD-016-004 |
| Service Ticket | Transaction (§6) | SPR-MOD-016-002 |
| SLA Breach Event | Transaction (§6) | SPR-MOD-016-003 |
| CSAT Response | Transaction (§6) | SPR-MOD-016-004 |

### 4.4 Forward Map — Events → Originating Sprint

| Event | Direction | Originating Sprint |
| --- | --- | --- |
| ServiceTicketCreated | Published (§8) | SPR-MOD-016-002 |
| ServiceTicketClosed | Published (§8) | SPR-MOD-016-002 |
| SLABreached | Published (§8) | SPR-MOD-016-003 |
| KnowledgeArticlePublished | Published (§8) | SPR-MOD-016-004 |
| FieldVisitCompleted | Consumed (§8) | SPR-MOD-016-002 |
| CustomerCreated | Consumed (§8) | SPR-MOD-016-002 |
| OpportunityWon | Consumed (§8) | SPR-MOD-016-002 |

### 4.5 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-016-001 | §1, §2 (Categorization and routing; SLA and escalation policies — configuration surface), §3, §5 (Ticket Category, SLA Policy), §10 (SLA policies, Routing rules, Escalation matrices, Business hours per region) |
| SPR-MOD-016-002 | §2 (Multi-channel ticket capture; submodule Tickets), §4 (Ticket-to-resolution), §6 (Service Ticket), §7 (close-with-open-child-task rule), §8 (`ServiceTicketCreated`, `ServiceTicketClosed` — published; `FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon` — consumed; External Systems — Email, Chat, WhatsApp, Voice) |
| SPR-MOD-016-003 | §2 (SLA and escalation policies — enforcement; submodules SLAs, Escalations), §4 (Escalation), §6 (SLA Breach Event), §7 (SLA-pause-during-customer-waiting rule), §8 (`SLABreached` — published) |
| SPR-MOD-016-004 | §2 (Knowledge base and macros; Customer satisfaction surveys; submodules Knowledge Base, CSAT), §4 (Knowledge capture; CSAT loop), §5 (Knowledge Article), §6 (CSAT Response), §7 (review-before-publish rule), §8 (`KnowledgeArticlePublished` — published) |
| SPR-MOD-016-005 | §2 (Reporting on service performance), §9 (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity; Dashboards; KPIs; Exports), §11 (audit readiness), §13 (Provides To MOD-017) |

No Module PRD capability, submodule, master-data entity, transaction, or event sits outside the five sprints above. No capability appears as the originating allocation in more than one sprint. Every capability appears in exactly one originating sprint and in at least one sprint.

## 5. Engine Consumption Map

Derived from Service Desk Module PRD §12. No engine behavior is redefined. Engine identifiers resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md`.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-008 | ENG-010 | ENG-011 | ENG-012 | ENG-013 | ENG-017 | ENG-020 | ENG-021 | ENG-022 | ENG-023 | ENG-024 | ENG-025 | ENG-027 | ENG-028 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-016-001 | ● | ● | ● | ● | ● | ● |   |   |   |   | ● |   | ● |   |   |   |   | ● | ● |   |   |
| SPR-MOD-016-002 |   | ● |   | ● | ● | ● | ● | ● | ● |   | ● |   | ● | ● |   |   | ● | ● | ● |   |   |
| SPR-MOD-016-003 |   | ● |   | ● | ● |   |   |   | ● | ● | ● | ● | ● |   |   |   |   | ● | ● |   |   |
| SPR-MOD-016-004 |   | ● |   | ● | ● | ● | ● | ● | ● | ● | ● |   | ● | ● |   |   |   | ● | ● |   | ● |
| SPR-MOD-016-005 |   | ● |   | ● | ● |   |   |   |   |   |   |   |   |   | ● | ● | ● | ● |   | ● |   |

Optional engines from Module PRD §12 (`ENG-023` Integration, `ENG-027` Export, `ENG-028` AI Copilot) are scheduled only where their consumption is required to fulfil a capability in §2. `ENG-023` is required by sprints 002 and 005 for external-channel and KPI-catalog integration; `ENG-027` is required by sprint 005; `ENG-028` is required by sprint 004 for AI-assisted knowledge suggestions.

## 6. ADR Consumption Map

Accepted ADRs only, per Service Desk Module PRD (`ADR-011`, `ADR-032`).

| Sprint | ADR-011 | ADR-032 |
| --- | :-: | :-: |
| SPR-MOD-016-001 | ● | ● |
| SPR-MOD-016-002 | ● | ● |
| SPR-MOD-016-003 | ● | ● |
| SPR-MOD-016-004 | ● | ● |
| SPR-MOD-016-005 | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Platform Dependency.** MOD-016 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Tenant, company, branch, and user master are consumed read-only from MOD-001.
>
> **CRM Dependency.** MOD-016 assumes `MOD006_CRM_BASELINE_v1` is frozen. Customer master is consumed read-only; `CustomerCreated` and `OpportunityWon` events are consumed.
>
> **Field Service Boundary.** `FieldVisitCompleted` is consumed from **MOD-012 Field Service** as an inbound event. MOD-016 provides tickets to MOD-012 through published events; MOD-016 does not redefine field-service transactions.
>
> **Analytics Boundary.** Cross-module KPI definitions are owned by **MOD-017 Analytics**. MOD-016 surfaces its own operational reports (§9) but consumes cross-module KPI definitions from MOD-017.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Ticket Category / SLA Policy Master | SPR-MOD-016-001 | 002, 003, 004, 005 | Foundational; every later sprint assumes this master data. |
| Business hours / Routing / Escalation configuration | SPR-MOD-016-001 | 002, 003, 004 | Resolved via `ENG-005`. |
| Service Ticket Transaction | SPR-MOD-016-002 | 003, 004, 005 | Ticket is the anchor for SLA clocks, CSAT loops, and analytics. |
| SLA Breach Event | SPR-MOD-016-003 | 005 | Feeds SLA Adherence and Escalation reporting. |
| Knowledge Article Master | SPR-MOD-016-004 | 002 (agent-side lookup), 005 | Consumed at ticket capture for knowledge-assisted resolution. |
| CSAT Response | SPR-MOD-016-004 | 005 | Feeds CSAT Trend reporting. |
| Tenant / Company / Branch / User Master | External (MOD-001) | 001–005 | Consumed via read-only APIs; never redefined. |
| Customer Master | External (MOD-006) | 002, 004, 005 | Consumed via read-only APIs from CRM. |
| `FieldVisitCompleted` (consumed event) | External (MOD-012) | SPR-MOD-016-002 | Reconciles field visits to originating tickets. |
| `CustomerCreated` (consumed event) | External (MOD-006) | SPR-MOD-016-002 | Enables ticket capture for newly created customers. |
| `OpportunityWon` (consumed event) | External (MOD-006) | SPR-MOD-016-002 | Enables onboarding tickets on opportunity conversion. |
| `ServiceTicketCreated` / `ServiceTicketClosed` events | SPR-MOD-016-002 | MOD-012, MOD-017 | Feeds field-service dispatch and analytics. |
| `SLABreached` event | SPR-MOD-016-003 | MOD-017 | Feeds SLA Adherence analytics. |
| `KnowledgeArticlePublished` event | SPR-MOD-016-004 | MOD-017 | Feeds knowledge-lifecycle analytics. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-016 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Any regression against that baseline blocks Stage 2 authoring.
- **R2 — CRM baseline dependency.** MOD-016 assumes `MOD006_CRM_BASELINE_v1` is frozen. Customer master and CRM events are consumed read-only.
- **R3 — Field Service boundary.** MOD-016 does not redefine field-service transactions; interaction occurs strictly through published/consumed events.
- **R4 — Identity boundary.** Identity and permissions remain owned by MOD-001. MOD-016 consumes identity read-only.
- **R5 — Analytics boundary.** Cross-module KPI definitions remain owned by MOD-017. Operational Service Desk reports are surfaced within MOD-016.
- **R6 — Optional-engine scope creep.** Optional engines (`ENG-023`, `ENG-027`, `ENG-028`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R7 — Roadmap refinement.** `SPRINT_ROADMAP.md` estimates 4 sprints for MOD-016; this plan refines to 5 for cohesion (splitting SLA enforcement from Knowledge/CSAT to preserve single-authority allocation of §7 rules). No PRD capability is added, orphaned, or duplicated.
- **R8 — Future-enhancement scope.** Any capability not enumerated in Module PRD §2 is deferred and NOT allocated to any sprint in this plan.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-016 is baseline-ready when all of the following are objectively true:

1. Every reserved Service Desk Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD016_SERVICE_DESK_BASELINE_v1` is authored under `docs/40-module-baselines/`.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no Service Desk capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md` beyond additive registration.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/service-desk/MODULE_PRD.md`](../../20-module-prds/service-desk/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`../../15-governance/templates/GT-002_STAGE1_AUTHORING.md`](../../15-governance/templates/GT-002_STAGE1_AUTHORING.md)
