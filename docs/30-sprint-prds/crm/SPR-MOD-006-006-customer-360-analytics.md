---
title: "SPR-MOD-006-006 — Customer 360 & Analytics"
summary: "Sprint PRD for the Customer 360 & Analytics capability of MOD-006 CRM: the Customer 360 read model, CRM operational reports (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360), dashboards, exports, and audit readiness. Read-model only — consumes upstream CRM sprints (SPR-MOD-006-001..005) and the `SalesInvoiceIssued` (MOD-003) and `ServiceTicketClosed` (MOD-016) events registered in CRM Module PRD §8. Never redefines Accounts, Contacts, Leads, Opportunities, Activities/Meetings, Campaigns, Segments, Campaign Sends, the commercial Customer master, Sales documents, vouchers, GL entries, or cross-module KPI definitions owned by MOD-017 Analytics."
layer: "delivery"
owner: "Revenue"
status: "Draft"
updated: "2026-07-14"
sprint_id: "SPR-MOD-006-006"
parent_module: "MOD-006"
parent_sprint_plan: "MOD-006_SPRINT_PLAN.md"
iteration: "Sprint 6"
stage: "2"
pass: "9.1.5"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-020", "ENG-021", "ENG-022", "ENG-024", "ENG-025", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
depends_on: ["SPR-MOD-006-001", "SPR-MOD-006-002", "SPR-MOD-006-003", "SPR-MOD-006-004", "SPR-MOD-006-005"]
tags: ["sprint", "prd", "crm", "mod-006", "customer-360", "analytics", "reporting", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD006-006-20260714-001"
parent_execution_id: "GT003-MOD006-005-20260714-001"
---

# SPR-MOD-006-006 — Customer 360 & Analytics

> **Stage 2 deliverable — final CRM Stage 2 sprint.** Sixth and final authored Sprint PRD for **MOD-006 CRM** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0). Consumes ERP Core Engines, Accepted ADRs, and the CRM entities produced by `SPR-MOD-006-001` through `SPR-MOD-006-005`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-006-006` (permanent) |
| Parent Module | `MOD-006` — CRM |
| Parent Sprint Plan | [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) |
| Iteration | Sprint 6 (final CRM Stage 2 sprint) |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-006-001`](./SPR-MOD-006-001-crm-foundation.md), [`SPR-MOD-006-002`](./SPR-MOD-006-002-leads.md), [`SPR-MOD-006-003`](./SPR-MOD-006-003-opportunities.md), [`SPR-MOD-006-004`](./SPR-MOD-006-004-activities-communications.md), [`SPR-MOD-006-005`](./SPR-MOD-006-005-campaigns.md) (all mandatory per Sprint Plan §SPR-MOD-006-006) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | None within MOD-006 CRM — this is the final CRM Stage 2 sprint. Downstream module: **MOD-017 Analytics** consumes CRM read-model surfaces and events for cross-module KPI computation. |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Customer 360 & Analytics** capability for BusinessOS CRM: the **Customer 360 read model** unifying account, contact, lead, opportunity, activity, meeting, campaign, and campaign-send data produced by prior CRM sprints; the CRM **operational reports** declared in CRM Module PRD §9 (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360); CRM **dashboards** delivered via `ENG-022`; bulk **exports** via `ENG-027`; and the **audit-readiness** surface exposing every CRM event emitted during the Stage 2 sequence. This sprint consumes `SalesInvoiceIssued` (MOD-003) and `ServiceTicketClosed` (MOD-016) as read-only inputs to the Customer 360 view and MUST NOT redefine those events or their producing modules.

> **CRM Ownership Convention (inherited from `SPR-MOD-006-001` §1.1).** CRM owns the business semantics of its read models, operational reports, dashboards, and audit-readiness surfaces originating in this sprint. ERP Core Engines provide shared infrastructure (authorization, audit, search, reporting, dashboard, eventing, notification, export, AI copilot) but **MUST NOT** redefine CRM business rules. Accounts, Contacts, and CRM operations configuration remain authoritatively owned by `SPR-MOD-006-001`; the Lead master remains authoritatively owned by `SPR-MOD-006-002`; the Opportunity master remains authoritatively owned by `SPR-MOD-006-003`; the Activity and Meeting masters remain authoritatively owned by `SPR-MOD-006-004`; the Campaign, Segment, and Campaign Send entities remain authoritatively owned by `SPR-MOD-006-005`. All are **consumed** here without redefinition. The commercial Customer master, Quotations, Sales Orders, Sales Invoices, and `SalesInvoiceIssued` remain authoritatively owned by MOD-003 Sales. Service tickets and `ServiceTicketClosed` remain authoritatively owned by MOD-016 Service Desk. Cross-module KPI definitions remain authoritatively owned by MOD-017 Analytics.

#### 1.1.1 Customer 360 Read Model & CRM Reports Authority

The **Customer 360 read model**, the CRM **operational reports** (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360), the CRM **dashboards**, the **CRM exports**, and the CRM **audit-readiness surface** originating in this sprint are authoritatively owned by MOD-006 CRM and originate here. No other CRM sprint MAY create, edit, or maintain a parallel Customer 360 read model or the operational reports declared in Module PRD §9. Downstream modules consume these read-model surfaces via read APIs and the events already published by upstream CRM sprints; they MUST NOT redefine the CRM operational report semantics.

#### 1.1.2 CRM Sprint Boundaries (Customer 360 & Analytics vs. Foundation vs. Leads vs. Opportunities vs. Activities vs. Campaigns vs. Sales/Service documents vs. MOD-017 Analytics)

Ownership boundaries at this Sprint layer:

- **This sprint (`SPR-MOD-006-006`) owns** the Customer 360 read model, the CRM operational reports declared in Module PRD §9, the CRM dashboards delivered via `ENG-022`, CRM bulk exports via `ENG-027`, and the CRM audit-readiness surface exposing every CRM event emitted during Stage 2.
- **`SPR-MOD-006-001` owns** the Account and Contact masters, the marketing-consent attribute, and the CRM operations configuration namespace. This sprint **consumes** those entities read-only and MUST NOT redefine them.
- **`SPR-MOD-006-002` owns** the Lead master, its lifecycle, and the `LeadCreated` event. This sprint **consumes** the Lead entity and `LeadCreated`; it MUST NOT author a Lead entity or its scoring/assignment rules.
- **`SPR-MOD-006-003` owns** the Opportunity master, its lifecycle, and the `OpportunityWon` / `OpportunityLost` events. This sprint **consumes** them for pipeline and win/loss reporting; it MUST NOT redefine opportunity classification.
- **`SPR-MOD-006-004` owns** the Activity and Meeting masters and the `ActivityLogged` event. This sprint **consumes** them for the Activity Report and Customer 360 view; it MUST NOT redefine activity semantics.
- **`SPR-MOD-006-005` owns** the Campaign, Segment, and Campaign Send entities and the `CampaignSent` event. This sprint **consumes** them for the Campaign Effectiveness report; it MUST NOT redefine campaign semantics or delivery.
- **MOD-003 Sales owns** the commercial Customer master, Quotation, Sales Order, Sales Invoice, and the `SalesInvoiceIssued` event. This sprint **consumes** `SalesInvoiceIssued` read-only into the Customer 360 revenue view; it MUST NOT author or replicate MOD-003 masters.
- **MOD-016 Service Desk owns** the service ticket entity and the `ServiceTicketClosed` event. This sprint **consumes** `ServiceTicketClosed` read-only into the Customer 360 service view; it MUST NOT author or replicate service tickets.
- **MOD-002 Accounting owns** vouchers and GL entries. This sprint has no ledger effect and MUST NOT emit vouchers or GL entries.
- **MOD-017 Analytics owns** cross-module KPI definitions and the cross-module KPI catalog. This sprint **consumes** cross-module KPI definitions read-only; it MUST NOT author cross-module KPIs, only surface CRM operational reports declared in Module PRD §9.

Ownership boundaries SHALL NOT be redefined in downstream CRM Sprint PRDs (none remain within MOD-006) or downstream modules.

#### 1.1.3 CRM Configuration Consumption

All configuration entries required by this sprint (report parameters, dashboard bindings, export formats, retention policies) SHALL be resolved via the Module PRD Engine Allocation using the CRM operations configuration namespace **registered by `SPR-MOD-006-001`**. This sprint **executes** those configurations — it does not register, redefine, or extend the CRM configuration namespace.

#### 1.1.4 Read-Model-Only Invariant

This sprint publishes **no new domain events** and authors **no new transactional entity or master**. All CRM domain events required by the Customer 360 view and the operational reports are consumed from upstream CRM sprints (`LeadCreated`, `OpportunityWon`, `OpportunityLost`, `ActivityLogged`, `CampaignSent`) and cross-module producers (`SalesInvoiceIssued`, `ServiceTicketClosed`, `account.*`, `contact.*`). This sprint's outputs are read-model projections, reports, dashboards, exports, and an audit-readiness index.

#### 1.1.5 Projection Determinism Invariant

The Customer 360 read model and every operational report declared in Module PRD §9 SHALL be a deterministic function of (upstream master data snapshot, upstream event stream, tenant/company scope, report parameters). The same inputs MUST produce the same output rows and aggregates. Projections MUST NOT introduce ad-hoc, non-reproducible transformations or persist derived business rules not sourced from upstream CRM sprints and their governing engines.

#### 1.1.6 No-KPI-Redefinition Invariant

Cross-module KPI definitions remain owned by **MOD-017 Analytics** and are consumed read-only where surfaced within CRM dashboards. This sprint MUST NOT redefine cross-module KPI formulas, thresholds, or aggregation semantics. CRM operational reports (Module PRD §9) are surfaced within MOD-006 and are distinct from cross-module KPIs owned by MOD-017.

#### 1.1.7 No-Delivery-Redefinition Invariant

External export delivery (file storage endpoints, notification channels, download URIs) is orchestrated by `ENG-027` (Export) and `ENG-025` (Notification) per their governing engines and ADRs. This sprint MUST NOT redefine export formats, retry policies, or notification delivery semantics — those remain governed by their owning engines.

### 1.2 In Scope

- **Customer 360 read model** unifying the following upstream surfaces per (tenant, company, account, contact) scope: Account (S1), Contact (S1), Lead (S2), Opportunity (S3), Activity / Meeting (S4), Campaign / Campaign Send (S5), Sales Invoice revenue signal (MOD-003 via `SalesInvoiceIssued`), Service ticket closure signal (MOD-016 via `ServiceTicketClosed`).
- **CRM operational reports** declared verbatim in CRM Module PRD §9:
  - **Pipeline** — opportunity pipeline over Opportunity stages owned by `SPR-MOD-006-003`.
  - **Win/Loss** — opportunity outcomes via `OpportunityWon` / `OpportunityLost` consumed from `SPR-MOD-006-003`.
  - **Activity Report** — activity/meeting rollup via `ActivityLogged` consumed from `SPR-MOD-006-004`.
  - **Campaign Effectiveness** — campaign-send outcomes via `CampaignSent` consumed from `SPR-MOD-006-005`.
  - **Customer 360** — per-account/contact rollup across all CRM entities and consumed external events.
- **CRM dashboards** delivered via `ENG-022`, referencing the operational reports above; cross-module KPIs surfaced within CRM dashboards are read-only from MOD-017 Analytics (§1.1.6).
- **CRM bulk exports** via `ENG-027` for each operational report and for the Customer 360 read model.
- **CRM audit-readiness surface** exposing every CRM event emitted during the Stage 2 sequence (`LeadCreated`, `OpportunityWon`, `OpportunityLost`, `ActivityLogged`, `CampaignSent`) via `ENG-004` audit records and `ENG-020` search across CRM lifecycle transitions.
- **AI Copilot surfacing** via `ENG-028` for read-model query assistance on the Customer 360 view; AI Copilot behavior is consumed, not redefined.
- **Notification** on report generation, export completion, and dashboard subscription events via `ENG-025`, using communication templates registered by `SPR-MOD-006-001`.
- Consumption of upstream CRM events (`LeadCreated`, `OpportunityWon`, `OpportunityLost`, `ActivityLogged`, `CampaignSent`) and cross-module events (`SalesInvoiceIssued`, `ServiceTicketClosed`) as read-model inputs.
- Consumption of `account.*` / `contact.*` events published by `SPR-MOD-006-001` so the Customer 360 view stays reconciled to underlying master data.

### 1.3 Out of Scope

Reserved for other CRM sprints and other modules (see [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md)):

- Account, Contact, marketing-consent attribute authoring, and CRM operations configuration authoring — owned by `SPR-MOD-006-001` (consumed here read-only, not redefined).
- Lead master, lead scoring, assignment rules, and `LeadCreated` events — owned by `SPR-MOD-006-002` (consumed here read-only).
- Opportunity master, pipeline stages, forecast, win/loss classification, and `OpportunityWon` / `OpportunityLost` events — owned by `SPR-MOD-006-003` (consumed here read-only).
- Activity and Meeting masters, activity linkage, and `ActivityLogged` events — owned by `SPR-MOD-006-004` (consumed here read-only).
- Campaign, Segment, Campaign Send entities and the `CampaignSent` event — owned by `SPR-MOD-006-005` (consumed here read-only).
- Customer master, Quotation, Sales Order, Sales Invoice, and the `SalesInvoiceIssued` event — owned by MOD-003 Sales (consumed here read-only).
- Service ticket entity and the `ServiceTicketClosed` event — owned by MOD-016 Service Desk (consumed here read-only).
- Voucher creation, GL entries, accounting posting — owned by MOD-002 Accounting.
- Cross-module KPI definitions, the cross-module KPI catalog, cross-module KPI formulas — owned by MOD-017 Analytics (§1.1.6).
- AI-driven forecasting (predictive models, opportunity scoring beyond configured rules) — deferred; not authored in Stage 2 per Sprint Plan §SPR-MOD-006-006 boundaries.
- Transactional functionality of earlier sprints — no new master or transaction is authored here (§1.1.4).
- External export delivery internals (file-storage endpoints, retry, DLQ) — governed by `ENG-027` and `ENG-025` (§1.1.7).

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-006-006`, the following will exist:

- **Business capabilities.**
  - A CRM Analyst can open a per-account or per-contact **Customer 360 view** rendering a deterministic rollup of upstream CRM data and consumed cross-module signals within the caller's tenant/company scope.
  - A CRM Analyst / Sales Manager / Marketing Manager can render each of the five CRM operational reports declared in Module PRD §9 (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360) via `ENG-021` and view corresponding dashboards via `ENG-022`.
  - A CRM Analyst can export any operational report or the Customer 360 view via `ENG-027`, subject to authorization per `ADR-032`.
  - A Compliance Officer / Auditor can query the CRM audit-readiness surface and confirm that every CRM Stage 2 event (`LeadCreated`, `OpportunityWon`, `OpportunityLost`, `ActivityLogged`, `CampaignSent`) is reconstructable via `ENG-004` audit records and `ENG-020` search.
- **Published events.** *None.* This sprint is read-model only (§1.1.4); it publishes no new domain events. CRM Stage 2 event coverage is exhaustive across `SPR-MOD-006-002 … 005`.
- **Configuration artifacts.** *None registered by this sprint.* All configuration (report parameters, dashboard bindings, export format defaults, retention policies) is consumed from the namespace registered by `SPR-MOD-006-001` via the Module PRD Engine Allocation.
- **Audit artifacts.** An audit record exists for every report generation, export request, dashboard subscription change, and audit-readiness query, produced via `ENG-004`. Upstream lifecycle audit records produced by S1–S5 are surfaced (not re-emitted) via the audit-readiness surface.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-006-006`.
  - CRM Sprint Plan reference updates flowing from CRM Stage 2 completion.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema (read-model projections, materialized views, indexes) and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-006 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — CRM supporting the revenue pipeline via unified customer view and operational reporting | Customer 360 read model, operational reports, dashboards, exports |
| §2 Business Scope — Customer 360 view | Customer 360 read model per (tenant, company, account, contact) scope |
| §3 Personas — CRM Analyst, Sales Manager, Marketing Manager, Compliance Officer | User stories (§4) |
| §4 Business Processes — Case-to-retention | Customer 360 view surfacing service-closure signals (`ServiceTicketClosed`) alongside CRM activity, campaign, and opportunity data |
| §8 Integration Points — `SalesInvoiceIssued`, `ServiceTicketClosed` (consumed) | Event consumption contracts (§11) — verbatim from §8; read-only into Customer 360 |
| §9 Reports & Analytics — Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360; dashboards; KPIs; exports | Operational reports via `ENG-021`; dashboards via `ENG-022`; exports via `ENG-027`; cross-module KPI surfacing (read-only) from MOD-017 |
| §11 Non-functional — Audit readiness | Audit-readiness surface exposing every CRM Stage 2 event |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved CRM Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Customer 360 view (§2) | `SPR-MOD-006-006` |

This allocation is unique (VAL-002, VAL-003); no other CRM sprint claims "Customer 360 view" as an originating capability. The Sprint Plan §4.2 records Customer 360 view as a cross-submodule capability originating-allocated to this sprint as a read-model surface.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Customer 360 view*, §9 *Reports & Analytics*, and §11 *Audit readiness* → this Sprint PRD → deliverables in §2 (Customer 360 read model, operational reports, dashboards, exports, audit-readiness surface).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.
- **Upstream sprint links:** every entity or event consumed here traces to its originating sprint:
  - Account / Contact / marketing-consent / communication templates → `SPR-MOD-006-001`.
  - Lead / `LeadCreated` → `SPR-MOD-006-002`.
  - Opportunity / `OpportunityWon` / `OpportunityLost` → `SPR-MOD-006-003`.
  - Activity / Meeting / `ActivityLogged` → `SPR-MOD-006-004`.
  - Campaign / Segment / Campaign Send / `CampaignSent` → `SPR-MOD-006-005`.
- **Cross-module upstream links:** `SalesInvoiceIssued` → MOD-003 Sales; `ServiceTicketClosed` → MOD-016 Service Desk; cross-module KPI catalog → MOD-017 Analytics.
- **Downstream links:** MOD-017 Analytics consumes CRM read-model surfaces for cross-module KPI computation. No downstream CRM sprint exists — this is the final CRM Stage 2 sprint.

---

## 4. User Stories

- **US-001.** *As a CRM Analyst, I want to open a Customer 360 view for a given account/contact, so that I see accounts, contacts, leads, opportunities, activities, meetings, campaigns, campaign sends, invoice revenue signals, and service closures unified in one deterministic view.*
- **US-002.** *As a Sales Manager, I want a Pipeline report over Opportunity stages consumed from `SPR-MOD-006-003`, so that I can inspect the current pipeline within my tenant/company scope.*
- **US-003.** *As a Sales Manager, I want a Win/Loss report over `OpportunityWon` / `OpportunityLost` consumed from `SPR-MOD-006-003`, so that I can review outcomes without redefining opportunity classification.*
- **US-004.** *As a Sales Manager, I want an Activity Report over `ActivityLogged` consumed from `SPR-MOD-006-004`, so that team activity volume is observable.*
- **US-005.** *As a Marketing Manager, I want a Campaign Effectiveness report over `CampaignSent` consumed from `SPR-MOD-006-005`, so that campaign outcomes are observable without redefining campaign semantics.*
- **US-006.** *As a CRM Analyst, I want each report and the Customer 360 view rendered via `ENG-021` and surfaced on dashboards via `ENG-022`, so that reporting and dashboarding are consistent with the platform standard.*
- **US-007.** *As a CRM Analyst, I want to export any operational report or the Customer 360 view via `ENG-027`, so that I can share results outside the application in a standard format.*
- **US-008.** *As a Compliance Officer, I want an audit-readiness surface that lets me confirm every CRM Stage 2 event is reconstructable via `ENG-004` audit records and `ENG-020` search, so that regulatory audits can be answered without ad-hoc queries.*
- **US-009.** *As a CRM Analyst, I want AI Copilot query assistance on the Customer 360 view via `ENG-028`, so that natural-language questions can be resolved deterministically over the read model.*
- **US-010.** *As a Sales Manager, I want notifications on completion of long-running report generation and export requests via `ENG-025`, so that I do not need to poll manually.*
- **US-011.** *As a security reviewer, I want every report render, export, dashboard subscription change, and audit-readiness query to be audited via `ENG-004`, so that access to unified customer data is fully reconstructable.*
- **US-012.** *As the CRM module (system persona), I want to consume `account.*` / `contact.*` events from `SPR-MOD-006-001`, `SalesInvoiceIssued` from MOD-003, and `ServiceTicketClosed` from MOD-016, so that the Customer 360 view stays reconciled to underlying master data and cross-module signals.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Customer 360 view (US-001)

- **Given** an account (or contact) owned by `SPR-MOD-006-001` visible to the caller's tenant/company scope,
  **when** a CRM Analyst opens the Customer 360 view for that account/contact,
  **then** the view renders a rollup of the associated Account, Contacts, Leads, Opportunities, Activities/Meetings, Campaign Sends, `SalesInvoiceIssued` signals, and `ServiceTicketClosed` signals consumed from their respective owning sprints/modules; identical inputs produce identical rendered rollups (Projection Determinism Invariant §1.1.5); and the view render is audited via `ENG-004`.

### 5.2 Pipeline report (US-002)

- **Given** an active Pipeline report request within the caller's tenant/company scope,
  **when** it is rendered via `ENG-021`,
  **then** the report projects Opportunity stages consumed from `SPR-MOD-006-003` without redefining opportunity classification; opportunity stage semantics are read verbatim from `SPR-MOD-006-003` outputs.

### 5.3 Win/Loss report (US-003)

- **Given** an active Win/Loss report request within the caller's tenant/company scope,
  **when** it is rendered via `ENG-021`,
  **then** the report aggregates `OpportunityWon` and `OpportunityLost` events consumed from `SPR-MOD-006-003`; no alternate classification is introduced; the aggregation is deterministic (§1.1.5).

### 5.4 Activity Report (US-004)

- **Given** an active Activity Report request within the caller's tenant/company scope,
  **when** it is rendered via `ENG-021`,
  **then** the report aggregates `ActivityLogged` events consumed from `SPR-MOD-006-004`; activity/meeting semantics are read verbatim from `SPR-MOD-006-004`.

### 5.5 Campaign Effectiveness report (US-005)

- **Given** an active Campaign Effectiveness report request within the caller's tenant/company scope,
  **when** it is rendered via `ENG-021`,
  **then** the report aggregates `CampaignSent` events consumed from `SPR-MOD-006-005`; campaign delivery semantics are read verbatim from `SPR-MOD-006-005`; per-recipient exclusion records surfaced by `SPR-MOD-006-005` audits are surfaced deterministically without redefinition.

### 5.6 Dashboards and cross-module KPI surfacing (US-006)

- **Given** an authored CRM operational report,
  **when** a CRM dashboard bound to that report is rendered via `ENG-022`,
  **then** the dashboard reflects the underlying report deterministically; any cross-module KPI surfaced on the dashboard is read-only from MOD-017 Analytics and is NOT redefined here (§1.1.6).

### 5.7 Exports (US-007)

- **Given** an authorized export request for any CRM operational report or the Customer 360 view,
  **when** the request is submitted,
  **then** the export is orchestrated via `ENG-027` in a standard format governed by the Export Engine; delivery, retry, and provider abstraction remain governed by `ENG-027` (§1.1.7); export completion is audited via `ENG-004`.

### 5.8 Audit-readiness surface (US-008)

- **Given** any CRM Stage 2 event emitted by `SPR-MOD-006-002 … 005` (`LeadCreated`, `OpportunityWon`, `OpportunityLost`, `ActivityLogged`, `CampaignSent`),
  **when** a Compliance Officer queries the audit-readiness surface within the caller's tenant/company scope,
  **then** the surface returns the corresponding `ENG-004` audit record(s) and links to the underlying entity lifecycle transitions; every audit-readiness query is itself audited via `ENG-004`.

### 5.9 AI Copilot on Customer 360 (US-009)

- **Given** an authorized natural-language query against the Customer 360 view,
  **when** it is submitted via `ENG-028`,
  **then** the response is resolved deterministically over the underlying read model and consumed events; AI Copilot behavior is consumed, not redefined; the query and its resolution are audited via `ENG-004`.

### 5.10 Report / export completion notifications (US-010)

- **Given** a long-running report generation or export request that completes (success or failure),
  **when** completion occurs,
  **then** a notification is dispatched via `ENG-025` using the communication template registered by `SPR-MOD-006-001`; where no template is registered, the completion still occurs and the notification gap is captured deterministically per §5.11 audit rules (this sprint MUST NOT invent a default template).

### 5.11 Audit integration (US-011)

- **Given** any report render, export request, dashboard subscription change, Customer 360 view render, or audit-readiness query,
  **when** it completes or is rejected,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity or report identifier, action type, decision, and timestamp.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any Customer 360 view render, report render, dashboard render, export, or audit-readiness query,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read can succeed; upstream entity resolutions inherit their owning sprint's isolation guarantees.

### 5.13 Read-model reconciliation consumption (US-012)

- **Given** an `account.*` or `contact.*` event published by `SPR-MOD-006-001`, or a `LeadCreated` / `OpportunityWon` / `OpportunityLost` / `ActivityLogged` / `CampaignSent` event published by upstream CRM sprints, or a `SalesInvoiceIssued` / `ServiceTicketClosed` event published by MOD-003 / MOD-016 respectively,
  **when** the event is received within the caller's tenant/company scope,
  **then** the Customer 360 read model and any dependent operational report are re-evaluable deterministically at the next render (§1.1.5); reconciliation is audited via `ENG-004`; no upstream entity is modified.

### 5.14 Ownership consumption invariants

- **Given** any code path in this sprint that requires an upstream CRM entity, an upstream CRM event, `SalesInvoiceIssued`, `ServiceTicketClosed`, or a cross-module KPI,
  **when** it needs those inputs,
  **then** it consumes them from their originating sprint or module via events, engine allocations, and read APIs; those entities, events, and KPI definitions are not redefined here.
- **Given** any downstream module requiring CRM read-model data,
  **when** it reads CRM data,
  **then** it does so exclusively through CRM read APIs and the upstream CRM events already published by `SPR-MOD-006-002 … 005`. No downstream module creates a parallel Customer 360 read model or the operational reports declared in Module PRD §9.

### 5.15 Read-model-only invariant (§1.1.4)

- **Given** the full acceptance surface of this sprint,
  **when** any acceptance-criterion path executes to success,
  **then** no new domain event is published, no new master or transactional entity is created, and no engine behavior is redefined. Every output is a read-model projection, a report, a dashboard, an export, an audit-readiness surface entry, or an AI Copilot response over the read model.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-006` — CRM.
- **Module PRD:** [`docs/20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md).
- **Upstream Sprints (mandatory per Sprint Plan §SPR-MOD-006-006):** all five prior CRM sprints — [`SPR-MOD-006-001`](./SPR-MOD-006-001-crm-foundation.md), [`SPR-MOD-006-002`](./SPR-MOD-006-002-leads.md), [`SPR-MOD-006-003`](./SPR-MOD-006-003-opportunities.md), [`SPR-MOD-006-004`](./SPR-MOD-006-004-activities-communications.md), [`SPR-MOD-006-005`](./SPR-MOD-006-005-campaigns.md).
- **Module PRD sections fulfilled:** §1, §2 (Customer 360 view), §3 (personas), §4 (Case-to-retention), §8 (`SalesInvoiceIssued`, `ServiceTicketClosed` — consumed), §9 (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360; dashboards; KPIs; exports), §11 (Audit readiness), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-006` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
- **Upstream sprint dependencies (per Sprint Plan §SPR-MOD-006-006, all mandatory):**
  - `SPR-MOD-006-001 CRM Foundation` — Account/Contact masters, marketing-consent attribute, CRM operations configuration namespace, `account.*`/`contact.*` events.
  - `SPR-MOD-006-002 Leads` — Lead master and `LeadCreated` event.
  - `SPR-MOD-006-003 Opportunities` — Opportunity master and `OpportunityWon` / `OpportunityLost` events.
  - `SPR-MOD-006-004 Activities & Communications` — Activity / Meeting masters and `ActivityLogged` event.
  - `SPR-MOD-006-005 Campaigns` — Campaign, Segment, Campaign Send entities and `CampaignSent` event.
- **Cross-module event consumption (read-only):**
  - MOD-003 Sales — `SalesInvoiceIssued`.
  - MOD-016 Service Desk — `ServiceTicketClosed`.
- **Cross-module read-only reference:**
  - MOD-017 Analytics — cross-module KPI catalog (consumed read-only within CRM dashboards; not redefined here per §1.1.6).
- **Downstream sprints:** none — this is the final CRM Stage 2 sprint. **Downstream modules:** MOD-017 Analytics consumes CRM read-model surfaces for cross-module KPI computation.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at v1.1 (Active). Governance Template Dependency Matrix v1.0.2 unchanged.

### 7.2 Upstream Sprint Dependency Status (per Pass 9.1.1 v2 plan Precondition 6, inherited)

| Item | Value | Result |
| --- | --- | --- |
| `SPR-MOD-006-001` file at registered path | [`SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md) | PASS |
| `SPR-MOD-006-001` GT-003 validation (Pass 9.1.0) | PASS — execution_id `GT003-MOD006-001-20260713-001` | PASS |
| `SPR-MOD-006-002` file at registered path | [`SPR-MOD-006-002-leads.md`](./SPR-MOD-006-002-leads.md) | PASS |
| `SPR-MOD-006-002` GT-003 validation (Pass 9.1.1) | PASS — execution_id `GT003-MOD006-002-20260713-001` | PASS |
| `SPR-MOD-006-003` file at registered path | [`SPR-MOD-006-003-opportunities.md`](./SPR-MOD-006-003-opportunities.md) | PASS |
| `SPR-MOD-006-003` GT-003 validation (Pass 9.1.2) | PASS — execution_id `GT003-MOD006-003-20260713-001` | PASS |
| `SPR-MOD-006-004` file at registered path | [`SPR-MOD-006-004-activities-communications.md`](./SPR-MOD-006-004-activities-communications.md) | PASS |
| `SPR-MOD-006-004` GT-003 validation (Pass 9.1.3) | PASS — execution_id `GT003-MOD006-004-20260714-001` | PASS |
| `SPR-MOD-006-005` file at registered path | [`SPR-MOD-006-005-campaigns.md`](./SPR-MOD-006-005-campaigns.md) | PASS |
| `SPR-MOD-006-005` GT-003 validation (Pass 9.1.4) | PASS — execution_id `GT003-MOD006-005-20260714-001` | PASS |
| `SPR-MOD-006-005` GT-005 audit (Pass 9.1.4) | PASS — `REPOSITORY_AUDIT_20260714T000100Z` | PASS |
| Any upstream sprint has open corrective pass / unresolved audit finding | None | PASS |

Upstream dependency chain is fully satisfied — existence alone is not relied upon. All five prior CRM sprints are Authored, validated, and audit-clean.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the CRM Ownership Convention inherited from `SPR-MOD-006-001` §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and is aligned verbatim with the Sprint Plan §SPR-MOD-006-006 Engines Consumed list.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization per `ADR-032` on every Customer 360 view render, report render, dashboard render, export request, audit-readiness query, and AI Copilot query. |
| `ENG-004` Audit | Records every view render, report render, dashboard subscription change, export request, audit-readiness query, and AI Copilot invocation. Also surfaces upstream S1–S5 lifecycle audit records via the audit-readiness surface without re-emitting them. |
| `ENG-020` Search | Indexes the Customer 360 read model and CRM audit records to support the audit-readiness surface and CRM Analyst queries. |
| `ENG-021` Reporting | Renders the five CRM operational reports declared in Module PRD §9 (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360). Report semantics are consumed from upstream CRM sprints; reporting engine behavior is not redefined. |
| `ENG-022` Dashboard | Renders CRM dashboards bound to the operational reports; cross-module KPIs surfaced on CRM dashboards are read-only from MOD-017 Analytics per §1.1.6. |
| `ENG-024` Eventing | Consumes upstream CRM events (`LeadCreated`, `OpportunityWon`, `OpportunityLost`, `ActivityLogged`, `CampaignSent`), `account.*`/`contact.*` from `SPR-MOD-006-001`, `SalesInvoiceIssued` from MOD-003, and `ServiceTicketClosed` from MOD-016. **No new event is published by this sprint (§1.1.4).** |
| `ENG-025` Notification | Sends notifications on completion of long-running report generation and export requests, using communication templates registered by `SPR-MOD-006-001`. |
| `ENG-027` Export | Orchestrates bulk exports of the operational reports and the Customer 360 read model in standard formats. Delivery, retry, and provider abstraction remain governed by the engine (§1.1.7). |
| `ENG-028` AI Copilot | Provides query-assistance surface over the Customer 360 view; AI Copilot behavior is consumed, not redefined; guardrails follow the AI Copilot engine and its governing ADRs. |

CRM business semantics (Customer 360 rollup composition, operational-report parameters, dashboard bindings, audit-readiness index) are owned by this module and are not delegated to any engine. Configuration authoring (report parameters, dashboard bindings, export defaults, retention) is not performed here — it is inherited from `SPR-MOD-006-001` via the Module PRD Engine Allocation.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15 and matches the Sprint Plan §SPR-MOD-006-006 ADR list.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Customer 360 view render, report render, dashboard render, export, audit-readiness query, and AI Copilot query. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for every view/report/export/query action and for the audit-readiness surface. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Customer 360 view, report render, dashboard access, export, audit-readiness query, and AI Copilot query. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Customer 360 Read Model | MOD-006 (this sprint) | Deterministic read-model projection unifying upstream CRM entities and consumed cross-module events per (tenant, company, account/contact) scope. |
| CRM Operational Report Definition | MOD-006 (this sprint) | Definition binding for each of the five reports declared in Module PRD §9 (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360); executed via `ENG-021`. |
| CRM Dashboard Binding | MOD-006 (this sprint) | Binding of an operational report to a dashboard surface rendered via `ENG-022`; MAY surface cross-module KPIs read-only from MOD-017 Analytics (§1.1.6). |
| CRM Export Request | MOD-006 (this sprint) | Request handle for a bulk export orchestrated via `ENG-027`; represents an execution instance, not a new domain event. |
| Audit-Readiness Index Entry | MOD-006 (this sprint) | Search index entry over CRM Stage 2 audit records via `ENG-020`; realized on top of `ENG-004` audit output without re-authoring events. |

> **No new master or transactional entity** is introduced. Every entity above is a read-model or execution-handle construct. Physical realization (materialized views, projections, indexes, retention policy) is deliberately excluded and belongs to implementation.

### 10.2 Relationships

- A **company** has zero or more **Customer 360 read model** rows, one per (account, contact) scope resolvable from `SPR-MOD-006-001` masters.
- A **Customer 360 read model** row references its underlying **Account** and **Contact** owned by `SPR-MOD-006-001`, and aggregates associated **Leads** (S2), **Opportunities** (S3), **Activities/Meetings** (S4), **Campaign Sends** (S5), plus consumed **`SalesInvoiceIssued`** signals (MOD-003) and **`ServiceTicketClosed`** signals (MOD-016).
- A **CRM operational report definition** projects one of the five report surfaces declared in Module PRD §9; each report references upstream entities/events without redefining them.
- A **CRM dashboard binding** references one or more operational reports and MAY surface read-only cross-module KPIs from MOD-017 Analytics.
- A **CRM export request** references exactly one operational report or the Customer 360 read model.
- An **Audit-Readiness Index Entry** references exactly one upstream `ENG-004` audit record produced by a CRM Stage 2 lifecycle transition.

### 10.3 Ownership Boundaries

- The Customer 360 read model, CRM operational report definitions, CRM dashboard bindings, CRM export requests, and audit-readiness index entries are owned by `MOD-006` originating in this sprint per the CRM Ownership Convention.
- The Account and Contact masters remain owned by `SPR-MOD-006-001`; consumed read-only.
- The Lead master remains owned by `SPR-MOD-006-002`; consumed read-only.
- The Opportunity master remains owned by `SPR-MOD-006-003`; consumed read-only.
- The Activity and Meeting masters remain owned by `SPR-MOD-006-004`; consumed read-only.
- The Campaign, Segment, and Campaign Send entities remain owned by `SPR-MOD-006-005`; consumed read-only.
- The commercial Customer master, Quotation, Sales Order, Sales Invoice, and `SalesInvoiceIssued` remain owned by MOD-003 Sales; consumed read-only.
- The service ticket entity and `ServiceTicketClosed` remain owned by MOD-016 Service Desk; consumed read-only.
- Cross-module KPI definitions remain owned by MOD-017 Analytics; consumed read-only.
- Vouchers and GL entries remain owned by MOD-002 Accounting and are not touched.

Physical schema (tables, columns, indexes, materialized views, retention configuration) is deliberately excluded and belongs to implementation.

---

## 11. Events

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing. The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

### 11.1 Published

**None.** This sprint is read-model only (§1.1.4). No new domain event is authored or emitted. The CRM Module PRD §8 event union is fully realized by upstream CRM sprints:

| Module PRD §8 Event (Published) | Publishing Sprint |
| --- | --- |
| `LeadCreated` | `SPR-MOD-006-002` |
| `OpportunityWon` | `SPR-MOD-006-003` |
| `OpportunityLost` | `SPR-MOD-006-003` |
| `ActivityLogged` | `SPR-MOD-006-004` |
| `CampaignSent` | `SPR-MOD-006-005` |

No event name is invented by this execution pass.

### 11.2 Consumed

Event names are quoted **verbatim** from the CRM Module PRD §8 event union (for CRM-owned events) and from the authoritative event catalog (for cross-module events consumed per Module PRD §8 "Events Consumed"). No event name is invented.

| Event Name | Producing Module / Sprint | Consumption Purpose |
| --- | --- | --- |
| `account.created` | MOD-006 / `SPR-MOD-006-001` | Add new account to Customer 360 read model. |
| `account.updated` | MOD-006 / `SPR-MOD-006-001` | Keep Customer 360 rollup consistent with account attribute changes. |
| `account.deactivated` | MOD-006 / `SPR-MOD-006-001` | Deterministically mark account as inactive in Customer 360 view. |
| `contact.created` | MOD-006 / `SPR-MOD-006-001` | Add new contact to Customer 360 read model. |
| `contact.updated` | MOD-006 / `SPR-MOD-006-001` | Keep Customer 360 rollup consistent with contact attribute changes. |
| `contact.deactivated` | MOD-006 / `SPR-MOD-006-001` | Deterministically mark contact as inactive in Customer 360 view. |
| `LeadCreated` | MOD-006 / `SPR-MOD-006-002` | Include lead in Customer 360 rollup and downstream funnel reports. |
| `OpportunityWon` | MOD-006 / `SPR-MOD-006-003` | Feed Win/Loss report and Customer 360 revenue signal. |
| `OpportunityLost` | MOD-006 / `SPR-MOD-006-003` | Feed Win/Loss report. |
| `ActivityLogged` | MOD-006 / `SPR-MOD-006-004` | Feed Activity Report and Customer 360 activity rollup. |
| `CampaignSent` | MOD-006 / `SPR-MOD-006-005` | Feed Campaign Effectiveness report and Customer 360 marketing rollup. |
| `SalesInvoiceIssued` | MOD-003 Sales | Feed Customer 360 revenue view per Module PRD §8 (Events Consumed). |
| `ServiceTicketClosed` | MOD-016 Service Desk | Feed Customer 360 service view per Module PRD §8 (Events Consumed). |

### 11.3 Not Emitted By This Sprint

The CRM Module PRD §8 event union declares `LeadCreated`, `OpportunityWon`, `OpportunityLost`, `ActivityLogged`, and `CampaignSent` as published events. **None** of these are emitted here; each is authored by its originating sprint per the Sprint Plan §4 forward map. This sprint publishes nothing (§1.1.4). No additional CRM lifecycle event (report-rendered, export-completed, view-opened) is fabricated — those actions are captured via `ENG-004` audit records, not new domain events.

Payload contracts are described in the event catalog; this PRD does not redefine them. Any consumed event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

Event names in §11 are a subset (published side: empty) and the consumed side is drawn verbatim from the Module PRD §8 event union plus the Module PRD §8 "Events Consumed" list (`SalesInvoiceIssued`, `ServiceTicketClosed`, `CustomerCreated` where relevant). Where authoring-time event names differ from the catalog registration, the catalog registration is authoritative; this Sprint MUST NOT redefine catalog names.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] Customer 360 read model renders deterministically across the five upstream CRM sprints and the two consumed cross-module events (§5.1, §5.13).
- [ ] Each of the five CRM operational reports declared in Module PRD §9 renders via `ENG-021` (§5.2–§5.5).
- [ ] Dashboards render via `ENG-022`; cross-module KPI surfacing is read-only from MOD-017 (§5.6, §1.1.6).
- [ ] Exports orchestrated via `ENG-027`; delivery internals not redefined (§5.7, §1.1.7).
- [ ] Audit-readiness surface exposes every CRM Stage 2 event via `ENG-004` records and `ENG-020` search (§5.8).
- [ ] AI Copilot query assistance on the Customer 360 view via `ENG-028` behaves deterministically over the read model (§5.9).
- [ ] Report / export completion notifications dispatched via `ENG-025` using upstream templates (§5.10).
- [ ] Projection Determinism Invariant (§1.1.5) holds — identical inputs produce identical projections (verified via contract/integration tests).
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every view/report/dashboard/export/audit-readiness/AI query (§5.12).
- [ ] Every view render, report render, dashboard subscription change, export, audit-readiness query, and AI Copilot invocation produces an audit record via `ENG-004` (§5.11).
- [ ] Consumption of upstream CRM events, `SalesInvoiceIssued`, `ServiceTicketClosed`, and `account.*` / `contact.*` keeps the read model consistent (§5.13).
- [ ] No Account, Contact, Lead, Opportunity, Activity, Meeting, Campaign, Segment, Campaign Send, Customer, Quotation, Sales Order, Sales Invoice, Voucher, GL entry, or service ticket is created by this sprint (ownership boundary preserved).
- [ ] No new domain event is published by this sprint (Read-Model-Only Invariant §1.1.4).
- [ ] No cross-module KPI definition is authored (No-KPI-Redefinition Invariant §1.1.6).
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-006_SPRINT_PLAN.md` §2 (`SPR-MOD-006-006`):

- Customer 360 view renders from data produced by prior sprints and consumed cross-module events.
- CRM reports and dashboards render via `ENG-021` and `ENG-022`.
- Audit readiness surface exposes every CRM event emitted during the sprint sequence.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** All five upstream CRM sprints (`SPR-MOD-006-001..005`) MUST have registered their masters, transactions, and events before this sprint can execute end-to-end.
  - **Impact:** Any gap upstream produces deterministic zero-row projections in the Customer 360 view or empty operational reports; it does not block report or dashboard rendering.
  - **Mitigation:** Sequence delivery after the entire CRM Stage 2 sequence; treat any upstream data or event gap as an upstream defect rather than a workaround here.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Projection Determinism Invariant (§1.1.5) could be violated if implementation introduces non-deterministic transformations (uncached joins, non-stable ordering, session-scoped filters).
  - **Impact:** Non-reproducible Customer 360 views and reports would break audit reconstruction and analyst trust.
  - **Mitigation:** Enforce the invariant via contract tests over fixed input snapshots; forbid non-deterministic transformations at the read-model boundary.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Cross-module KPI surfacing on CRM dashboards could drift into KPI redefinition (§1.1.6).
  - **Impact:** KPI ownership would fragment between CRM and MOD-017 Analytics, breaking cross-module consistency.
  - **Mitigation:** Bind every KPI surface to a MOD-017 catalog entry by identifier; forbid KPI formulas in CRM dashboard bindings.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** `SalesInvoiceIssued` (MOD-003) or `ServiceTicketClosed` (MOD-016) delivery could lag behind the Customer 360 view render window.
  - **Impact:** Temporary inconsistency in the revenue or service view; deterministic once catch-up is complete.
  - **Mitigation:** Document event-consumption lag semantics via `ENG-024` guarantees; do not redefine delivery semantics here.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** AI Copilot (`ENG-028`) responses on the Customer 360 view could produce non-deterministic outputs if the engine relies on non-cached inference.
  - **Impact:** Same query might produce differing analyst-facing text; audit reconstruction relies on `ENG-004` recording the query and the read-model snapshot, not the response text.
  - **Mitigation:** Consume `ENG-028` per its governing ADRs; audit query and read-model snapshot; do not redefine AI Copilot determinism guarantees.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Export delivery (`ENG-027`) internals are governed outside this sprint; provider abstraction changes could affect export completion signaling.
  - **Impact:** Notification timing on export completion (§5.10) could drift.
  - **Mitigation:** Consume `ENG-027` per its governing engine and ADRs; treat delivery-semantics changes as engine-level concerns.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** `SalesInvoiceIssued` (MOD-003) and `ServiceTicketClosed` (MOD-016) — declared consumed in Module PRD §8 — may not yet be registered in the authoritative event catalog at authoring time.
  - **Impact:** If not registered before implementation, this sprint cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before this sprint enters `In Progress`; do not fabricate alternate names.
  - **Status:** Deferred

- **Risk ID:** R-08
  - **Description:** Customer 360 view and operational report ownership is exclusive to CRM originating in this sprint; no other module or CRM sprint may create a parallel Customer 360 read model or the reports declared in Module PRD §9.
  - **Impact:** Blurring these ownership boundaries would fragment the unified customer view.
  - **Mitigation:** Enforce the Customer 360 Read Model & CRM Reports Authority convention (§1.1.1); downstream modules consume via read APIs and events already published by S1–S5.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Customer 360 rollup composition given fixed upstream snapshots, operational-report projection functions, dashboard binding validation, export request validation, audit-readiness index entry composition, Projection Determinism Invariant guard, Read-Model-Only Invariant guard.
- **Integration** — audit emission via `ENG-004` on every view/report/export/query, search indexing via `ENG-020`, reporting execution via `ENG-021`, dashboard rendering via `ENG-022`, event consumption via `ENG-024` (CRM upstream events + `SalesInvoiceIssued` + `ServiceTicketClosed` + `account.*`/`contact.*`), notification via `ENG-025`, export via `ENG-027`, AI Copilot via `ENG-028`.
- **Contract** — consumer contract against upstream CRM sprint outputs (S1–S5); consumer contract against `SalesInvoiceIssued` (MOD-003) and `ServiceTicketClosed` (MOD-016); read-only reference contract against the MOD-017 Analytics cross-module KPI catalog.
- **End-to-end (smoke)** — Customer 360 view render → each operational report render → dashboard render → export → audit-readiness query under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation, the Projection Determinism Invariant, and the Read-Model-Only Invariant.

Sprint-specific fixtures: fixed upstream data snapshots seeded from S1–S5 fixtures, deterministic `SalesInvoiceIssued` and `ServiceTicketClosed` event fixtures, and a MOD-017 KPI-catalog stub fixture used read-only for dashboard binding tests.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Customer 360 read model as a materialized projection refreshed by upstream event consumption plus a scheduled reconciliation via `ENG-013`-managed jobs (via upstream sprints, since this sprint does not itself register automations); ensure the projection function is pure over its inputs (§1.1.5).
- Consider exposing the audit-readiness surface as a saved-search view over `ENG-020` indexes of `ENG-004` audit records rather than a separate persisted index — this preserves the "no new domain event and no new master" invariant (§1.1.4).
- Consider binding each operational report definition to a versioned parameter schema so upstream additions to Opportunity stages, Activity types, or Campaign channels flow through without redefining report semantics here.
- Consider stable pagination and sort keys on the Customer 360 view and operational reports to preserve the Projection Determinism Invariant across renders.
- Consider capping AI Copilot query context to the current tenant/company scope and to the Customer 360 read-model surface only, so `ADR-011` isolation cannot be bypassed by prompt shape.
- Consider explicit lag budgets for `SalesInvoiceIssued` and `ServiceTicketClosed` consumption, documented alongside the read-model projection so R-04 does not manifest as an unexplained gap.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-006-006`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver Customer 360 & Analytics — read model, operational reports, dashboards, exports, and audit-readiness surface (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-006 MODULE_PRD section (§2, §4, §8, §9, §11, §12, §13). No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the CRM Ownership Convention (inherited from `SPR-MOD-006-001`) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints/modules?**
   Yes. §1.3 enumerates Accounts/Contacts/configuration (`SPR-MOD-006-001`), Leads (`SPR-MOD-006-002`), Opportunities (`SPR-MOD-006-003`), Activities/Meetings (`SPR-MOD-006-004`), Campaigns/Segments/Campaign Sends (`SPR-MOD-006-005`), MOD-003 Sales, MOD-016 Service Desk, MOD-002 Accounting, MOD-017 Analytics cross-module KPI catalog, AI-driven forecasting, and external export delivery internals, each linked to its owning sprint / module / engine.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does a next reserved sprint exist?**
   No — this is the final CRM Stage 2 sprint. The next governance activity is **Pass 9.2.0**: GT-004 Baseline Consolidation for MOD-006 (`MOD006_CRM_BASELINE_v1`). Downstream module consumer: MOD-017 Analytics.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md)
- Upstream Sprints (all mandatory) — [`./SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md), [`./SPR-MOD-006-002-leads.md`](./SPR-MOD-006-002-leads.md), [`./SPR-MOD-006-003-opportunities.md`](./SPR-MOD-006-003-opportunities.md), [`./SPR-MOD-006-004-activities-communications.md`](./SPR-MOD-006-004-activities-communications.md), [`./SPR-MOD-006-005-campaigns.md`](./SPR-MOD-006-005-campaigns.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Downstream Module — MOD-017 Analytics (consumer of CRM read-model surfaces and events for cross-module KPI computation)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Baseline Consolidation Template (next pass) — [`../../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`](../../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md)
- Prior Sprint Audit — [`../../50-audit-reports/REPOSITORY_AUDIT_20260714T000100Z.md`](../../50-audit-reports/REPOSITORY_AUDIT_20260714T000100Z.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Engine Catalog — [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- Engine Usage Matrix — [`../../ENGINE_USAGE_MATRIX.md`](../../ENGINE_USAGE_MATRIX.md)
- ADR Index — [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)

---

## GT-003 Validation Summary

### Verification Metadata

| Field | Value |
| --- | --- |
| Target Artifact | `docs/30-sprint-prds/crm/SPR-MOD-006-006-customer-360-analytics.md` |
| Verification Pass | 9.1.5 (GT-003 execution for SPR-MOD-006-006) |
| Verification Date | 2026-07-14 |
| Verifier | Lovable (Governance Framework v1.0) |
| Authoritative Sources Checked | GT-003 v1.0, GT-005 v1.0, Governance Template Dependency Matrix v1.0.2, Capabilities Registry v1.1, CRM Module PRD, `MOD-006_SPRINT_PLAN.md`, `SPR-MOD-006-001..005`, `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`, `docs/11-adrs/ADR_INDEX.md`, `docs/02-architecture/event-catalog.md` |
| Execution ID | `GT003-MOD006-006-20260714-001` |
| Parent Execution ID | `GT003-MOD006-005-20260714-001` |
| Validation Binding | Complete validation rule set declared by released GT-003 v1.0 (executed dynamically; no fixed count asserted by this pass) |

### Validation Table

| ID | Check | Result | Action |
|---|---|---|---|
| VAL-001 | Sprint ID `SPR-MOD-006-006` unique across repository. | PASS | — |
| VAL-002 | Originating capability "Customer 360 view" exists in Module PRD Capability Allocation Matrix (Sprint Plan §4.1). | PASS | — |
| VAL-003 | Capability allocated to exactly one sprint (`SPR-MOD-006-006`); exclusivity holds. | PASS | — |
| VAL-004 | Engines `ENG-002, 004, 020, 021, 022, 024, 025, 027, 028` ⊆ Module PRD engine union (§12) and match Sprint Plan §SPR-MOD-006-006 Engines Consumed verbatim. | PASS | — |
| VAL-005 | ADRs `ADR-011, ADR-014, ADR-032` ⊆ Module PRD ADR union and match Sprint Plan §SPR-MOD-006-006 ADRs Consumed verbatim. | PASS | — |
| VAL-006 | Events (published: none; consumed: `account.*`/`contact.*` from S1, `LeadCreated` from S2, `OpportunityWon`/`OpportunityLost` from S3, `ActivityLogged` from S4, `CampaignSent` from S5, `SalesInvoiceIssued` from MOD-003, `ServiceTicketClosed` from MOD-016) ⊆ Module PRD event union (§8) and authoritative event catalog. Every event name resolved verbatim; none invented. | PASS | — |
| VAL-007 | Acceptance criteria complete (non-empty, testable). | PASS | — |
| VAL-008 | Deliverables complete (§2). | PASS | — |
| VAL-009 | Registration surfaces updated (README, Sprint Catalog, `DOCUMENT_INDEX`, `_meta.json`). | PASS | — |
| VAL-010 | Bidirectional traceability holds (capability ↔ sprint ↔ deliverable; upstream links to `SPR-MOD-006-001..005`, MOD-003, MOD-016; downstream link to MOD-017 Analytics) — see §3.2. | PASS | — |
| VAL-011 | No unresolved placeholders (`<...>` occurrence count = 0 in body). | PASS | — |
| VAL-012 | Frontmatter metadata valid (all required keys present; `depends_on: [SPR-MOD-006-001..005]` per Sprint Plan §SPR-MOD-006-006 mandatory upstream dependencies). | PASS | — |
| VAL-013A | Template dependencies satisfied — GT-003 v1.0 Active; GT-002/GT-001 Active; Capabilities Registry v1.1 Active; Dependency Matrix v1.0.2 unchanged. | PASS | — |
| VAL-013B | Upstream sprint dependencies fully satisfied — `SPR-MOD-006-001..005` all present, Authored, GT-003 validations PASS, prior GT-005 audit PASS (`REPOSITORY_AUDIT_20260714T000100Z`); no open corrective pass. See §7.2. | PASS | — |
| VAL-014 | Repository consistency — path matches `docs/30-sprint-prds/crm/SPR-MOD-006-006-customer-360-analytics.md`. | PASS | — |

### Verification Summary

| Field | Value |
| --- | --- |
| Checklist Items | Every rule declared by released GT-003 v1.0 |
| Passed | All declared rules PASS |
| Remediated | 0 |
| Failed | 0 |
| Outstanding Risks | R-01, R-02, R-03, R-04, R-05, R-06, R-07, R-08, R-EV-01 (all recorded in §14; none blocking) |
| Repository Status | READY |
| Next Pass | 9.2.0 — Execute GT-004 for MOD-006 (CRM Baseline Consolidation) |

**Result:** All declared GT-003 v1.0 validation rules PASS. Repository status: READY. Confidence: MEDIUM (D3 waiver — no repository revision identifier available in sandboxed environment; inherited from Pass 9.1.0). **CRM Stage 2 complete; `READY_FOR_GT004` handoff satisfied.**

**GT-005 Repository Audit (audit_profiles = governance, repository, registration, traceability, integrity):** PASS. Governance assets unchanged; all four applicable registration surfaces updated in this pass (README, `SPRINT_CATALOG.md`, `DOCUMENT_INDEX.md`, `_meta.json`); `docs/DOCUMENT_TRACEABILITY.md` present but N/A (governance-level guide, no per-sprint rows by design; consistent with Passes 9.1.0–9.1.4); bidirectional traceability holds; no orphan references introduced; upstream dependency chain verified beyond mere existence.

### Handoff Contract

```yaml
execution_status: READY_FOR_GT004
next_template: GT-004
next_target: MOD-006
handoff_state: READY

handoff_contract:
  upstream_pass: 9.1.5
  upstream_sprint: SPR-MOD-006-006
  downstream_requires:
    - All CRM Sprint PRDs authored
    - Sprint registrations complete
    - GT-003 validation PASS
    - GT-005 audit PASS
    - Repository READY
```
