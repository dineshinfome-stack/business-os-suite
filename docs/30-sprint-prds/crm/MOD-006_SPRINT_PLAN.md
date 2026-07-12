---
title: "MOD-006 CRM — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-006 CRM. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "Revenue"
status: "Approved"
updated: "2026-07-12"
module_id: "MOD-006"
module_name: "CRM"
sprint_prefix: "SPR-MOD-006-"
stage: "1"
pass: "8.11.1"
parent_module_prd: "docs/20-module-prds/crm/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
tags: ["sprint", "planning", "crm", "mod-006", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-006 CRM — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-006 CRM** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## Normative Source Precedence

On any conflict, the following order wins:

1. `docs/20-module-prds/crm/MODULE_PRD.md` (Module PRD)
2. This Capability Allocation Matrix (§4)
3. The sprint sections in §2 of this Sprint Plan
4. Any derived artifact

## 1. Purpose & Scope

Plan the implementation of MOD-006 CRM by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD.

This plan introduces no new business requirements beyond the approved [MOD-006 CRM Module PRD](../../20-module-prds/crm/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Traceability:**

- Parent Module README — [`../../20-module-prds/crm/README.md`](../../20-module-prds/crm/README.md)
- Parent Module PRD — [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)
- Upstream module baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-006 is reconciled to **6** by this plan.

## 2. Proposed Sprint Sequence

### SPR-MOD-006-001 — CRM Foundation

- **Objective.** Establish CRM foundations under a tenant/company: account master, contact master, CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates), and the Accounts & Contacts submodule surface.
- **Boundaries.**
  - In: Account master, Contact master, CRM operations configuration, communication templates, assignment rule registration.
  - Out: lead capture, opportunity pipeline, activities, campaigns, Customer 360 analytics; customer master (owned by MOD-003 Sales); ledger posting (owned by MOD-002 Accounting).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Account and contact management; submodule Accounts & Contacts), §3 Personas, §5 Master Data (Account, Contact), §10 Configuration (Pipeline stages, Lead scoring model, Assignment rules, Communication templates), §8 Integration Points (`CustomerCreated` — consumed).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-007` Document, `ENG-008` Attachment, `ENG-012` Rules, `ENG-024` Event.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (CRM sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1`.
- **Sprint Exit Criteria.**
  - Accounts and contacts can be created, edited, and archived under a tenant/company.
  - CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates) resolves deterministically through `ENG-005`.
  - `CustomerCreated` events are consumed to seed account/contact records.
  - All structural changes are audited via `ENG-004`.

### SPR-MOD-006-002 — Leads

- **Objective.** Deliver lead capture and qualification: lead master, lead scoring, assignment rule execution, and lead-to-opportunity conversion.
- **Boundaries.**
  - In: Lead master lifecycle, lead scoring evaluation, assignment rule execution, lead conversion (produces an opportunity handoff — opportunity lifecycle owned by Sprint 003).
  - Out: opportunity pipeline management, activities, campaigns, Customer 360; sales quotations and orders (owned by MOD-003 Sales).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Lead capture and qualification; submodule Leads), §4 Business Processes (Lead-to-opportunity), §5 Master Data (Lead), §7 Business Rules (A lead may be converted only once; Assignment rules must resolve to exactly one owner), §8 Integration Points (`LeadCreated` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-010` Workflow, `ENG-012` Rules, `ENG-013` Automation, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-006-001`.
- **Sprint Exit Criteria.**
  - Leads can be captured, scored, assigned, qualified, and converted (once).
  - Assignment rules resolve to exactly one owner via `ENG-012`.
  - `LeadCreated` events are published via `ENG-024`.

### SPR-MOD-006-003 — Opportunities

- **Objective.** Deliver the opportunity pipeline: opportunity master, pipeline stage transitions, and opportunity win/loss lifecycle.
- **Boundaries.**
  - In: Opportunity master lifecycle, pipeline stage transitions, win/loss classification.
  - Out: leads, activities, campaigns, Customer 360; sales quotation/order documents (owned by MOD-003 Sales); accounting posting.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Opportunity pipeline; submodule Opportunities), §4 Business Processes (Opportunity-to-order), §5 Master Data (Opportunity), §8 Integration Points (`OpportunityWon`, `OpportunityLost` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-006-001`, `SPR-MOD-006-002`.
- **Sprint Exit Criteria.**
  - Opportunities can be created from a converted lead, progressed through configured pipeline stages, and marked won or lost.
  - Pipeline stages resolve via `ENG-005` configuration.
  - `OpportunityWon` and `OpportunityLost` events are published via `ENG-024`.

### SPR-MOD-006-004 — Activities

- **Objective.** Deliver activity, task, and meeting tracking against accounts, contacts, leads, and opportunities: Activity transaction, Meeting transaction, activity logging.
- **Boundaries.**
  - In: Activity transaction lifecycle, Meeting transaction lifecycle, activity assignment, activity logging surface.
  - Out: campaign sends, Customer 360 analytics, cross-module activity aggregation.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Activity, task, and meeting tracking; submodule Activities), §6 Transactions (Activity, Meeting), §8 Integration Points (`ActivityLogged` — published).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-008` Attachment, `ENG-010` Workflow, `ENG-012` Rules, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-006-001`.
- **Sprint Exit Criteria.**
  - Activities and meetings can be created, executed, and closed against accounts, contacts, leads, and opportunities.
  - `ActivityLogged` events are published via `ENG-024`.

### SPR-MOD-006-005 — Campaigns

- **Objective.** Deliver campaigns and segmentation: campaign master, segment master, and the Campaign Send transaction with consent enforcement.
- **Boundaries.**
  - In: Campaign master lifecycle, Segment master lifecycle, Campaign Send transaction lifecycle, marketing consent enforcement.
  - Out: activities, Customer 360; email/WhatsApp/SMS delivery internals (external systems consumed via `ENG-023`).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Campaigns and segmentation; submodule Campaigns), §4 Business Processes (Campaign-to-lead), §5 Master Data (Campaign, Segment), §6 Transactions (Campaign Send), §7 Business Rules (Marketing consent must be recorded before campaign inclusion), §8 Integration Points (`CampaignSent` — published; Email/WhatsApp/SMS/Marketing platforms — external).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-007` Document, `ENG-010` Workflow, `ENG-011` Approval, `ENG-012` Rules, `ENG-013` Automation, `ENG-023` Integration, `ENG-024` Event, `ENG-025` Notification.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-006-001`.
- **Sprint Exit Criteria.**
  - Campaigns and segments can be created and managed.
  - Campaign Send transaction executes only against contacts with recorded marketing consent.
  - `CampaignSent` events are published via `ENG-024`.

### SPR-MOD-006-006 — Customer 360 & Analytics

- **Objective.** Deliver the Customer 360 view, CRM reports (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360), dashboards, exports, and audit readiness. Consumes upstream `SalesInvoiceIssued` (MOD-003) and `ServiceTicketClosed` (MOD-016) events. Read-model only.
- **Boundaries.**
  - In: Customer 360 read model, CRM operational reports and dashboards, KPI surfacing, audit readiness, exports.
  - Out: cross-module KPI definitions (owned by MOD-017 Analytics), transactional functionality of earlier sprints, AI-driven forecasting.
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Customer 360 view), §4 Business Processes (Case-to-retention), §9 Reports & Analytics (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360), §11 Non-functional (Audit readiness), §8 Integration Points (`SalesInvoiceIssued`, `ServiceTicketClosed` — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-020` Search, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-024` Event, `ENG-025` Notification, `ENG-027` Export, `ENG-028` AI Copilot.
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-006-001` … `SPR-MOD-006-005` (consumes data and events produced by all prior sprints).
- **Sprint Exit Criteria.**
  - Customer 360 view renders from data produced by prior sprints and consumed cross-module events.
  - CRM reports and dashboards render via `ENG-021` and `ENG-022`.
  - Audit readiness surface exposes every CRM event emitted during the sprint sequence.

### Planning Flexibility

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-006-001 (CRM Foundation)
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
SPR-MOD-006-002   SPR-MOD-006-004   SPR-MOD-006-005   (…)
(Leads)           (Activities)      (Campaigns)
         │
         ▼
SPR-MOD-006-003 (Opportunities)
         │
         └───────────────► SPR-MOD-006-006 (Customer 360 & Analytics)
                                     ▲
                                     │
         ┌───────────────────────────┴────────────────────┐
   SPR-MOD-006-002   SPR-MOD-006-004   SPR-MOD-006-005
```

Sprints 002, 004, and 005 depend directly on 001 (Foundation). Sprint 003 depends on 001 and 002 (lead conversion feeds opportunity creation). Sprint 006 consumes output from all five predecessors.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-006 CRM Module PRD](../../20-module-prds/crm/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint.

### 4.1 Capability Allocation Matrix (Forward Map)

| # | Module PRD Capability (§2) | Origin Sprint | PRD Section | Exact Quote | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Lead capture and qualification | SPR-MOD-006-002 | §2 | "Lead capture and qualification" | PASS |
| 2 | Opportunity pipeline | SPR-MOD-006-003 | §2 | "Opportunity pipeline" | PASS |
| 3 | Account and contact management | SPR-MOD-006-001 | §2 | "Account and contact management" | PASS |
| 4 | Activity, task, and meeting tracking | SPR-MOD-006-004 | §2 | "Activity, task, and meeting tracking" | PASS |
| 5 | Campaigns and segmentation | SPR-MOD-006-005 | §2 | "Campaigns and segmentation" | PASS |
| 6 | Customer 360 view | SPR-MOD-006-006 | §2 | "Customer 360 view" | PASS |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Accounts & Contacts | SPR-MOD-006-001 |
| Leads | SPR-MOD-006-002 |
| Opportunities | SPR-MOD-006-003 |
| Activities | SPR-MOD-006-004 |
| Campaigns | SPR-MOD-006-005 |

> **Customer 360 view** is a cross-submodule capability (§2). It has no dedicated submodule in the Module PRD and is originating-allocated to `SPR-MOD-006-006` as a read-model surface.

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Account | Master Data (§5) | SPR-MOD-006-001 |
| Contact | Master Data (§5) | SPR-MOD-006-001 |
| Lead | Master Data (§5) | SPR-MOD-006-002 |
| Opportunity | Master Data (§5) | SPR-MOD-006-003 |
| Campaign | Master Data (§5) | SPR-MOD-006-005 |
| Segment | Master Data (§5) | SPR-MOD-006-005 |
| Activity | Transaction (§6) | SPR-MOD-006-004 |
| Meeting | Transaction (§6) | SPR-MOD-006-004 |
| Campaign Send | Transaction (§6) | SPR-MOD-006-005 |

### 4.4 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-006-001 | §1, §2 (Account and contact management; submodule Accounts & Contacts), §3 (personas), §5 (Account, Contact), §10 (Pipeline stages, Lead scoring model, Assignment rules, Communication templates), §8 (`CustomerCreated` — consumed) |
| SPR-MOD-006-002 | §2 (Lead capture and qualification; submodule Leads), §4 (Lead-to-opportunity), §5 (Lead), §7 (single-conversion rule; single-owner assignment), §8 (`LeadCreated` — published) |
| SPR-MOD-006-003 | §2 (Opportunity pipeline; submodule Opportunities), §4 (Opportunity-to-order), §5 (Opportunity), §8 (`OpportunityWon`, `OpportunityLost` — published) |
| SPR-MOD-006-004 | §2 (Activity, task, and meeting tracking; submodule Activities), §6 (Activity, Meeting), §8 (`ActivityLogged` — published) |
| SPR-MOD-006-005 | §2 (Campaigns and segmentation; submodule Campaigns), §4 (Campaign-to-lead), §5 (Campaign, Segment), §6 (Campaign Send), §7 (marketing consent rule), §8 (`CampaignSent` — published; Email/WhatsApp/SMS/Marketing platforms — external) |
| SPR-MOD-006-006 | §2 (Customer 360 view), §4 (Case-to-retention), §9 (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360), §11 (Audit readiness), §8 (`SalesInvoiceIssued`, `ServiceTicketClosed` — consumed) |

No Module PRD capability, submodule, master-data entity, or transaction sits outside the six sprints above. No capability appears as the originating allocation in more than one sprint. Every capability appears in exactly one originating sprint and in at least one sprint.

## 5. Engine Consumption Map

Derived from CRM Module PRD §12 (Required: `ENG-001`, `ENG-002`, `ENG-003`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-007`, `ENG-008`, `ENG-012`, `ENG-013`, `ENG-020`, `ENG-021`, `ENG-022`, `ENG-024`, `ENG-025`; Optional: `ENG-010`, `ENG-011`, `ENG-023`, `ENG-026`, `ENG-027`, `ENG-028`). No engine behavior is redefined. Engine identifiers resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md`.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-008 | ENG-010 | ENG-011 | ENG-012 | ENG-013 | ENG-020 | ENG-021 | ENG-022 | ENG-023 | ENG-024 | ENG-025 | ENG-027 | ENG-028 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-006-001 | ● | ● | ● | ● | ● | ● | ● | ● |   |   | ● |   |   |   |   |   | ● |   |   |   |
| SPR-MOD-006-002 |   | ● |   | ● |   |   |   |   | ● |   | ● | ● |   |   |   |   | ● | ● |   |   |
| SPR-MOD-006-003 |   | ● |   | ● | ● |   |   |   | ● | ● | ● |   |   |   |   |   | ● | ● |   |   |
| SPR-MOD-006-004 |   | ● |   | ● |   |   | ● | ● | ● |   | ● |   |   |   |   |   | ● | ● |   |   |
| SPR-MOD-006-005 |   | ● |   | ● |   |   | ● |   | ● | ● | ● | ● |   |   |   | ● | ● | ● |   |   |
| SPR-MOD-006-006 |   | ● |   | ● |   |   |   |   |   |   |   |   | ● | ● | ● |   | ● | ● | ● | ● |

Optional engine `ENG-026` Import MAY be consumed during Stage 2 authoring for master data seeding (accounts, contacts, leads); it is not tabulated as required consumption in this plan.

## 6. ADR Consumption Map

Accepted ADRs only, per CRM Module PRD (`ADR-011`, `ADR-014`, `ADR-032`).

| Sprint | ADR-011 | ADR-014 | ADR-032 |
| --- | :-: | :-: | :-: |
| SPR-MOD-006-001 | ● | ● | ● |
| SPR-MOD-006-002 | ● | ● | ● |
| SPR-MOD-006-003 | ● | ● | ● |
| SPR-MOD-006-004 | ● | ● | ● |
| SPR-MOD-006-005 | ● | ● | ● |
| SPR-MOD-006-006 | ● | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Platform Dependency.** MOD-006 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Tenant, company, branch, and user master are consumed read-only from MOD-001.
>
> **Sales Boundary.** MOD-006 consumes `SalesInvoiceIssued` (MOD-003) into the Customer 360 read model and hands opportunity outcomes to MOD-003 via `OpportunityWon` / `OpportunityLost`. Sales quotations, orders, and invoices remain owned by MOD-003.
>
> **Service Desk Boundary.** MOD-006 consumes `ServiceTicketClosed` (MOD-016) into the Customer 360 read model. Service tickets remain owned by MOD-016.
>
> **Analytics Boundary.** Cross-module KPI definitions are owned by **MOD-017 Analytics**. CRM surfaces its own operational reports (§9) but consumes cross-module KPI definitions from MOD-017.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Account / Contact Master | SPR-MOD-006-001 | 002, 003, 004, 005, 006 | Foundational; every later sprint assumes this master data. |
| CRM Configuration (pipeline stages, scoring, assignment rules, templates) | SPR-MOD-006-001 | 002, 003, 004, 005 | Resolved via `ENG-005`. |
| Lead Surface | SPR-MOD-006-002 | 003, 006 | Lead conversion feeds Opportunity creation; analytics consumes lead metrics. |
| Opportunity Surface | SPR-MOD-006-003 | 006 | Analytics consumes pipeline and win/loss metrics. |
| Activity Surface | SPR-MOD-006-004 | 006 | Analytics consumes activity metrics. |
| Campaign Surface | SPR-MOD-006-005 | 006 | Analytics consumes campaign effectiveness metrics. |
| Tenant / Company / Branch / User Master | External (MOD-001) | 001–006 | Consumed via read-only APIs; never redefined. |
| `CustomerCreated` (consumed event) | External (MOD-003) | SPR-MOD-006-001 | Seeds account/contact records. |
| `SalesInvoiceIssued` (consumed event) | External (MOD-003) | SPR-MOD-006-006 | Feeds Customer 360 revenue view. |
| `ServiceTicketClosed` (consumed event) | External (MOD-016) | SPR-MOD-006-006 | Feeds Customer 360 service view. |
| `LeadCreated` event | SPR-MOD-006-002 | 006, MOD-017 | Surfaced in analytics. |
| `OpportunityWon` event | SPR-MOD-006-003 | 006, MOD-003, MOD-017 | Notifies sales counter-party; surfaced in analytics. |
| `OpportunityLost` event | SPR-MOD-006-003 | 006, MOD-017 | Surfaced in analytics. |
| `ActivityLogged` event | SPR-MOD-006-004 | 006, MOD-017 | Surfaced in analytics. |
| `CampaignSent` event | SPR-MOD-006-005 | 006, MOD-017 | Surfaced in analytics. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-006 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Any regression against that baseline blocks Stage 2 authoring.
- **R2 — Sales boundary.** Sales quotations, orders, invoices, and the authoritative Customer master remain owned by MOD-003. MOD-006 MUST NOT redefine them.
- **R3 — Service Desk boundary.** Service tickets remain owned by MOD-016. MOD-006 consumes `ServiceTicketClosed` only for the Customer 360 view.
- **R4 — Analytics boundary.** Cross-module KPI definitions remain owned by MOD-017. CRM operational reports are surfaced within MOD-006; cross-module CRM KPIs are consumed from MOD-017.
- **R5 — Optional-engine scope creep.** Optional engines (`ENG-010`, `ENG-011`, `ENG-023`, `ENG-026`, `ENG-027`, `ENG-028`) MUST NOT introduce capabilities not present in the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R6 — No ledger effect.** CRM transactions produce no accounting ledger effect. Any future need for CRM-driven posting MUST originate from MOD-002 Accounting via a Module PRD amendment; MOD-006 MUST NOT invoke the posting engine directly.
- **R7 — Horizontal-only prerequisite sprints.** Per `SPRINT_AUTHORING_GUIDE.md`, no horizontal-only sprints are required for MOD-006; all sprints are vertical slices.
- **R8 — Future-enhancement scope.** AI next-best-action, predictive scoring, and social listening are Module PRD §14 Future Enhancements and are NOT allocated to any sprint in this plan.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-006 is baseline-ready when all of the following are objectively true:

1. Every reserved CRM Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD006_CRM_BASELINE_v1` is authored under `docs/40-module-baselines/`.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no CRM capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md`.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)
- [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
