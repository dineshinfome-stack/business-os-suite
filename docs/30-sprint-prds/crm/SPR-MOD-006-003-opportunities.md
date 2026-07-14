---
title: "SPR-MOD-006-003 — Opportunities"
summary: "Sprint PRD for the Opportunities submodule of MOD-006 CRM: opportunity master, pipeline stage transitions resolved via CRM Module PRD engine allocation, and win/loss classification. Consumes the CRM Foundation established in SPR-MOD-006-001 and the Lead conversion handoff produced by SPR-MOD-006-002; never redefines Accounts, Contacts, CRM operations configuration, the Lead master, the commercial Customer master, or the Sales Order / Quotation / Invoice / Voucher / GL surfaces."
layer: "delivery"
owner: "Revenue"
status: "Draft"
updated: "2026-07-13"
sprint_id: "SPR-MOD-006-003"
parent_module: "MOD-006"
parent_sprint_plan: "MOD-006_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "9.1.2"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-010", "ENG-011", "ENG-012", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
depends_on: ["SPR-MOD-006-001", "SPR-MOD-006-002"]
tags: ["sprint", "prd", "crm", "mod-006", "opportunities", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD006-003-20260713-001"
parent_execution_id: "GT003-MOD006-002-20260713-001"
---

# SPR-MOD-006-003 — Opportunities

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-006 CRM** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0). Consumes ERP Core Engines, Accepted ADRs, the CRM Foundation from `SPR-MOD-006-001`, and the Lead conversion handoff produced by `SPR-MOD-006-002`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-006-003` (permanent) |
| Parent Module | `MOD-006` — CRM |
| Parent Sprint Plan | [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md), [`SPR-MOD-006-002-leads.md`](./SPR-MOD-006-002-leads.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-006-004` (Activities) — links activities to opportunities; `SPR-MOD-006-006` (Customer 360 & Analytics) — consumes opportunity pipeline read model |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Opportunity pipeline** for BusinessOS CRM: the Opportunity master and its lifecycle, pipeline stage transitions resolved from the CRM Module PRD Engine Allocation (currently including `ENG-005` where applicable), win/loss classification with deterministic terminal semantics, and publication of the opportunity outcome events registered in CRM Module PRD §8. Opportunities are created from a converted-lead process handoff produced by `SPR-MOD-006-002 Leads`.

> **CRM Ownership Convention (inherited from `SPR-MOD-006-001` §1.1).** CRM owns the business semantics of the Opportunity master and its lifecycle. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, workflow, approval, rules, eventing, notification) but **MUST NOT** redefine CRM business rules. Accounts, Contacts, and CRM operations configuration remain authoritatively owned by `SPR-MOD-006-001` and are **consumed** here without redefinition. The Lead master remains authoritatively owned by `SPR-MOD-006-002` and is **consumed** here via the converted-lead process handoff without redefinition. The commercial Customer master and downstream sales documents (Quotation, Sales Order, Invoice) remain authoritatively owned by MOD-003 Sales.

#### 1.1.1 Opportunity Master Authority

The **Opportunity** master, together with its **Pipeline**, **Pipeline Stage** membership, and **Forecast** projection, is authoritatively owned by MOD-006 CRM and originates in this sprint. No other module MAY create, edit, close, or maintain a parallel Opportunity master. Downstream modules and downstream CRM sprints consume Opportunity master data via the outcome events registered in CRM Module PRD §8 (currently `OpportunityWon` and `OpportunityLost`) and read APIs; they MUST NOT redefine the Opportunity entity, its lifecycle, its pipeline model, or its win/loss classification.

#### 1.1.2 CRM Sprint Boundaries (Opportunities vs. Leads vs. Accounts/Contacts vs. Sales documents)

Ownership boundaries at this Sprint layer:

- **This sprint (`SPR-MOD-006-003`) owns** the Opportunity master, the Opportunity Pipeline structure, pipeline stage transitions, opportunity forecast values, opportunity probability, opportunity ownership and collaboration, opportunity activity linkage (the *link* to activities; the Activity transaction itself remains owned by `SPR-MOD-006-004`), and win/loss classification.
- **`SPR-MOD-006-001` owns** the Account and Contact masters and the CRM operations configuration namespace (pipeline stages, lead scoring model, assignment rules, communication templates). This sprint **consumes** those configuration entries via the CRM Module PRD Engine Allocation and **MUST NOT** redefine them.
- **`SPR-MOD-006-002` owns** the Lead master and its lifecycle. Opportunity creation in this sprint **consumes** the converted-lead process handoff produced by `SPR-MOD-006-002 §5.5`; this sprint **MUST NOT** author a Lead entity, its scoring, or its assignment rules.
- **`SPR-MOD-006-004` owns** the Activity and Meeting transactions and the `ActivityLogged` event. Opportunity activity linkage in this sprint records that an activity relates to an opportunity; the Activity transaction itself is not authored here.
- **`SPR-MOD-006-005` owns** the Campaign master, Segment master, Campaign Send transaction, and the `CampaignSent` event; none are authored here.
- **`SPR-MOD-006-006` owns** the Customer 360 read model, CRM reports, dashboards, and exports; none are authored here.
- **MOD-003 Sales owns** the commercial Customer master, Quotation, Sales Order, and Sales Invoice. This sprint **MUST NOT** create Customer, Quotation, Sales Order, or Sales Invoice records; any post-`OpportunityWon` customer / order creation is a downstream MOD-003 concern.
- **MOD-002 Accounting owns** vouchers and GL entries. This sprint has no ledger effect and MUST NOT emit vouchers or GL entries.

Ownership boundaries SHALL NOT be redefined in downstream CRM Sprint PRDs.

#### 1.1.3 CRM Configuration Consumption

**Pipeline stage behavior SHALL be resolved from the Engine Allocation defined by the CRM Module PRD** (Module PRD §12 lists the authorised engine set; currently including `ENG-005` Configuration where applicable) using the pipeline-stage entries **registered by `SPR-MOD-006-001`**. This sprint **executes** those configurations — resolves the ordered stage set for a (tenant, company), enforces allowed transitions, resolves communication templates for outcome notifications — and MUST NOT register, redefine, or extend the configuration namespace.

#### 1.1.4 Single-Outcome Invariant

An opportunity reaches at most **one** terminal outcome. Once an opportunity is classified `Won`, it MUST NOT be later reclassified `Lost`, and vice versa; a reopen action (if permitted by authorization policy) returns the opportunity to an active pipeline stage and is treated as a fresh cycle whose outcome is again bounded to at most one. Enforced declaratively via `ENG-012` on the win/loss action.

#### 1.1.5 Deterministic Stage Transition Invariant

Pipeline stage transitions MUST be deterministic against the ordered stage set resolved for the (tenant, company). A transition to a stage not present in the resolved set, or to a stage forbidden by the configured transition graph, is rejected deterministically and audited.

#### 1.1.6 Created-From-Converted-Lead Traceability

Every Opportunity created via the lead-to-opportunity path MUST reference the converted-lead process handoff record produced by `SPR-MOD-006-002 §5.5`, preserving upstream traceability. Opportunities created directly (i.e., not via lead conversion, where authorization policy permits) MUST NOT synthesize a fictitious lead reference.

### 1.2 In Scope

- Opportunity master: creation from a converted-lead handoff or (where authorization policy permits) direct creation against an existing account/contact, editing, ownership assignment, collaboration participants, and archival from a terminal state.
- Opportunity identifiers, opportunity classification (source, pipeline — as declared by CRM configuration), opportunity ownership, and opportunity collaboration participants.
- Opportunity pipeline structure: ordered stage set and stage transition graph resolved from `SPR-MOD-006-001` registrations via the Module PRD Engine Allocation.
- Opportunity lifecycle transitions across the resolved pipeline stages: `Open → <configured intermediate stages> → Won` and `Open → <configured intermediate stages> → Lost`, plus archival from a terminal state.
- Opportunity forecast values: expected close date, forecast amount, and opportunity probability associated with the current pipeline stage.
- Win/loss classification: single-outcome win/loss action producing the corresponding outcome event registered in Module PRD §8.
- Opportunity activity linkage: recording that an activity or meeting relates to an opportunity (the Activity transaction itself is owned by `SPR-MOD-006-004`).
- Opportunity documents and notes linkage (attachments / notes are surfaced via `ENG-007` / `ENG-008` at the engine layer per the Module PRD engine union; this sprint links, does not redefine the document/attachment engines).
- Opportunity timeline: audit-derived, read-oriented projection of all opportunity lifecycle events (create, stage change, forecast update, ownership change, collaboration change, win/loss, reopen, archive) produced from `ENG-004` records — the timeline is a **projection**, not a new event stream.
- Multi-step approval on the win/loss decision via `ENG-011` where the authorization policy requires it.
- Reassignment and collaboration changes during the opportunity lifecycle via `ENG-010`.
- Audit integration for every opportunity lifecycle transition via `ENG-004`.
- Events published (see §11): opportunity outcome events registered in CRM Module PRD §8, currently `OpportunityWon` and `OpportunityLost` — delivered via `ENG-024`.
- Consumption of the converted-lead process handoff produced by `SPR-MOD-006-002` and of `account.*` / `contact.*` events published by `SPR-MOD-006-001` so opportunities stay reconciled to underlying master data.

### 1.3 Out of Scope

Reserved for other CRM sprints and other modules (see [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md)):

- Account, Contact, and CRM operations configuration authoring — owned by `SPR-MOD-006-001` (consumed here, not redefined).
- Lead master, lead scoring, assignment rules, and `LeadCreated` events — owned by `SPR-MOD-006-002` (converted-lead handoff consumed here, not redefined).
- Activity transaction, Meeting transaction, and `ActivityLogged` events — owned by `SPR-MOD-006-004`.
- Campaign master, Segment master, Campaign Send transaction, `CampaignSent` events — owned by `SPR-MOD-006-005`.
- Customer 360 read model, CRM reports, dashboards, exports — owned by `SPR-MOD-006-006`.
- Customer master, Quotation, Sales Order, Sales Invoice — owned by MOD-003 Sales; NO Customer record is created on `OpportunityWon` by this sprint.
- Voucher creation, GL entries, accounting posting — owned by MOD-002 Accounting.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-006-003`, the following will exist:

- **Business capabilities.**
  - A CRM user can create an opportunity from a converted-lead handoff (or, where authorization policy permits, directly against an existing account/contact) and progress it through the pipeline stages resolved by CRM configuration.
  - Every pipeline stage transition is deterministic against the resolved stage set and its transition graph.
  - Every opportunity carries an expected close date, forecast amount, and stage-derived probability, all updatable during the active lifecycle.
  - A single-outcome win/loss action classifies the opportunity `Won` or `Lost` at most once per cycle and publishes the corresponding outcome event registered in Module PRD §8.
  - Opportunity ownership and collaboration participants can be assigned and reassigned during the active lifecycle.
  - The opportunity timeline exposes a chronological projection of all lifecycle events derived from `ENG-004` audit records.
- **Published events.** The opportunity outcome event contracts registered in CRM Module PRD §8 (see §11) — currently `OpportunityWon` and `OpportunityLost` — emitted by the win/loss transitions.
- **Configuration artifacts.** *None registered by this sprint.* All configuration (pipeline stages, communication templates) is consumed from the namespace registered by `SPR-MOD-006-001` via the Module PRD Engine Allocation.
- **Audit artifacts.** An audit record exists for every opportunity lifecycle transition (create, stage change, forecast update, ownership change, collaboration change, win, loss, disallowed-second-outcome, reopen, archive), produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-006-003`.
  - Opportunity outcome event entries in the event catalog referenced from §11 (verbatim from Module PRD §8).
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-006 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Opportunities primitive on the revenue pipeline | Opportunity master, pipeline transitions, and outcome events |
| §2 Business Scope — Opportunity pipeline; submodule Opportunities | Opportunity master lifecycle, pipeline stage transitions, forecast values |
| §3 Personas — Sales Representative, Sales Manager, Marketing Manager | User stories (§4) |
| §4 Business Processes — Opportunity-to-order | Win/loss classification producing the outcome event consumed by MOD-003 Sales |
| §5 Master Data — Opportunity | Opportunity master and its lifecycle |
| §7 Business Rules — deterministic transitions; single-outcome | Deterministic Stage Transition Invariant (§1.1.5); Single-Outcome Invariant (§1.1.4) |
| §8 Integration Points — `OpportunityWon`, `OpportunityLost` (published) | Event contracts (§11) — verbatim from §8 |
| §10 Configuration — Pipeline stages (registered by `SPR-MOD-006-001`), Communication templates | Consumption via Module PRD Engine Allocation at transition time |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved CRM Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Opportunity pipeline (§2) | `SPR-MOD-006-003` |

This allocation is unique (VAL-002, VAL-003); no other CRM sprint claims "Opportunity pipeline" as an originating capability. The **Opportunities** submodule is originating-allocated to this sprint per §4.2 of the Sprint Plan.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Opportunity pipeline* and submodule *Opportunities* → this Sprint PRD → deliverables in §2 (Opportunity master, pipeline stage transitions, forecast values, win/loss classification, outcome events, audit records, opportunity timeline).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.
- **Upstream sprint links:** every configuration consumed here (pipeline stages, communication templates) traces to its registration in `SPR-MOD-006-001` §5.3; every opportunity created via lead conversion traces to a converted-lead process handoff produced by `SPR-MOD-006-002` §5.5.
- **Downstream sprint links:** `OpportunityWon` / `OpportunityLost` outcome events are consumed by MOD-003 Sales for customer / order creation; opportunity activity linkage anchors activities authored in `SPR-MOD-006-004`; the pipeline read model is projected by `SPR-MOD-006-006 Customer 360 & Analytics`.

---

## 4. User Stories

- **US-001.** *As a Sales Representative, I want to create an opportunity from a converted-lead handoff, so that pipeline entry is traceable to the originating lead.*
- **US-002.** *As a Sales Representative, I want to record an expected close date, forecast amount, and opportunity probability, so that pipeline forecasts are meaningful.*
- **US-003.** *As a Sales Representative, I want to progress an opportunity through the configured pipeline stages deterministically, so that stage integrity is guaranteed.*
- **US-004.** *As a Sales Manager, I want to mark an opportunity `Won` or `Lost` at most once per cycle, so that the single-outcome invariant holds and the correct outcome event is published.*
- **US-005.** *As a Sales Manager, I want to reassign ownership or add collaborators on an active opportunity, so that the account team remains accurate.*
- **US-006.** *As a Sales Representative, I want to link activities and meetings to an opportunity, so that the account team can see the engagement history against the opportunity.*
- **US-007.** *As a Sales Manager, I want a chronological timeline of every opportunity lifecycle event, so that I can review the deal without relying on ad-hoc reports.*
- **US-008.** *As the CRM module (system persona), I want to publish `OpportunityWon` and `OpportunityLost` on the corresponding transitions, so that MOD-003 Sales and downstream sprints can react in a decoupled way.*
- **US-009.** *As a security reviewer, I want every opportunity lifecycle transition to be audited via `ENG-004`, so that I can reconstruct opportunity history from an authoritative log.*
- **US-010.** *As the Opportunities submodule (system persona), I want to consume `account.*` / `contact.*` events from `SPR-MOD-006-001`, so that opportunities stay reconciled when the underlying account/contact master data changes.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Opportunity creation from converted lead (US-001, US-008)

- **Given** a converted-lead process handoff produced by `SPR-MOD-006-002 §5.5` for an active account (and, where applicable, active contact),
  **when** a Sales Representative submits an opportunity creation request referencing that handoff,
  **then** the opportunity is persisted with a stable identifier, is uniquely identified within the company, references the account/contact and the source handoff, is placed in the first stage of the resolved pipeline, and no outcome event is published on creation.
- **Given** an opportunity creation request that references a converted-lead handoff already consumed by an existing opportunity,
  **when** it is submitted,
  **then** the request is rejected deterministically per the Created-From-Converted-Lead Traceability rule (§1.1.6), no second opportunity is created, and the rejection is audited.
- **Given** an opportunity creation request against an archived account or archived contact,
  **when** it is submitted,
  **then** the request is rejected deterministically and no opportunity is created.

### 5.2 Direct opportunity creation (US-001)

- **Given** authorization policy that permits direct opportunity creation without a converted-lead handoff and an active account/contact,
  **when** a Sales Representative submits a direct opportunity creation request,
  **then** the opportunity is persisted without a converted-lead handoff reference, no fictitious lead reference is synthesized, and creation is audited.
- **Given** an authorization policy that does NOT permit direct opportunity creation,
  **when** a direct creation request is submitted,
  **then** the request is rejected per authorization rules established by `ADR-032` and enforced by `ENG-002`.

### 5.3 Forecast values (US-002)

- **Given** an opportunity in an active (non-terminal) stage,
  **when** a Sales Representative updates the expected close date, forecast amount, or opportunity probability,
  **then** the values are persisted, the change is audited via `ENG-004`, and the resolved probability remains consistent with the stage-derived probability policy for the opportunity's current stage.
- **Given** an opportunity in a terminal state (`Won`, `Lost`, or `Archived`),
  **when** a forecast update is attempted,
  **then** the request is rejected deterministically per the lifecycle rules.

### 5.4 Deterministic pipeline stage transitions (US-003, US-008)

- **Given** an opportunity in an active pipeline stage and a target stage present in the ordered stage set resolved for the (tenant, company) via the Module PRD Engine Allocation and permitted by the configured transition graph,
  **when** a stage transition is submitted,
  **then** the opportunity transitions to the target stage deterministically, the transition is audited, and no outcome event is published.
- **Given** a stage transition request whose target stage is not present in the resolved stage set or not permitted by the transition graph,
  **when** it is submitted,
  **then** the request is rejected deterministically per the Deterministic Stage Transition Invariant (§1.1.5) and the rejection is audited.
- **Given** no pipeline configuration registered for the target (tenant, company),
  **when** a stage transition is attempted,
  **then** the request is rejected deterministically with an error attributing the missing configuration to `SPR-MOD-006-001` (this sprint MUST NOT invent a default pipeline).

### 5.5 Single-outcome win/loss classification (US-004, US-008)

- **Given** an opportunity in an active pipeline stage that permits a terminal `Won` transition,
  **when** a Sales Manager submits a win classification (subject to any `ENG-011` approval required by policy),
  **then** the opportunity transitions to `Won`, the `Won` transition is audited, and `OpportunityWon` (as registered in CRM Module PRD §8) is published via `ENG-024`.
- **Given** an opportunity in an active pipeline stage that permits a terminal `Lost` transition,
  **when** a Sales Manager submits a loss classification (subject to any `ENG-011` approval required by policy),
  **then** the opportunity transitions to `Lost`, the `Lost` transition is audited, and `OpportunityLost` (as registered in CRM Module PRD §8) is published via `ENG-024`.
- **Given** an opportunity already in a terminal outcome state (`Won` or `Lost`),
  **when** any subsequent win-or-loss classification is submitted,
  **then** the request is rejected deterministically by the Single-Outcome Invariant (§1.1.4), no second outcome event is published, and the rejection is audited.
- **Given** an opportunity in a non-active state (`Archived`),
  **when** a win-or-loss classification is submitted,
  **then** the request is rejected deterministically per the lifecycle rules.

### 5.6 Ownership and collaboration changes (US-005)

- **Given** an opportunity in an active pipeline stage,
  **when** a Sales Manager submits an ownership reassignment or a collaboration participant change,
  **then** the change is persisted, orchestrated via `ENG-010` where a longer-running interaction is required, and audited via `ENG-004`.
- **Given** an opportunity in a terminal state,
  **when** an ownership or collaboration change is attempted,
  **then** the request is rejected deterministically per the lifecycle rules.

### 5.7 Opportunity activity linkage (US-006)

- **Given** an existing opportunity and an activity/meeting produced by `SPR-MOD-006-004`,
  **when** the activity is linked to the opportunity,
  **then** the linkage is persisted and audited; the Activity transaction itself is not authored or redefined by this sprint.
- **Given** a link request that references a non-existent opportunity,
  **when** it is submitted,
  **then** the request is rejected deterministically.

### 5.8 Opportunity timeline projection (US-007)

- **Given** any opportunity with recorded lifecycle transitions,
  **when** a Sales Manager reads the opportunity timeline,
  **then** the timeline returns a chronological projection derived from `ENG-004` audit records covering create, stage change, forecast update, ownership change, collaboration change, win, loss, disallowed-second-outcome rejection, reopen (where permitted), archive; the timeline does not introduce a new event stream.

### 5.9 Events published (US-008)

- **Given** a successful `Won` transition,
  **when** the transition completes,
  **then** `OpportunityWon` is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog (§11) and registered in CRM Module PRD §8 are used.
- **Given** a successful `Lost` transition,
  **when** the transition completes,
  **then** `OpportunityLost` is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog (§11) and registered in CRM Module PRD §8 are used.

### 5.10 Account / Contact reconciliation consumption (US-010)

- **Given** an `account.updated` or `contact.updated` event published by `SPR-MOD-006-001` for a tenant/company visible to CRM,
  **when** the event is received,
  **then** any opportunity referencing the affected account/contact remains a valid reference, and reconciliation is audited via `ENG-004`.
- **Given** an `account.deactivated` event for an account with open opportunities,
  **when** the event is received,
  **then** deterministic handling per the opportunity lifecycle rules is applied (documented in §16) and audited; this sprint does not modify the Account entity.

### 5.11 Audit integration (US-009)

- **Given** any opportunity lifecycle transition (create, direct-create, stage change, forecast update, ownership change, collaboration change, activity link, win, loss, disallowed-second-outcome, reopen where permitted, archive),
  **when** it completes or is rejected,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, decision, and timestamp.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any opportunity read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.13 Ownership consumption invariants

- **Given** any downstream module requiring opportunity data,
  **when** it reads or reacts to opportunity lifecycle,
  **then** it does so exclusively through CRM-owned events (currently `OpportunityWon`, `OpportunityLost`) and read APIs. No downstream module creates an independent opportunity master.
- **Given** any code path in this sprint that requires Account, Contact, CRM operations configuration, the Lead master, or a converted-lead handoff,
  **when** it needs those entities or configuration values,
  **then** it consumes them from `SPR-MOD-006-001` / `SPR-MOD-006-002` via events, the Module PRD Engine Allocation, and the converted-lead handoff record; those entities and configuration entries are not redefined here.
- **Given** the win-outcome path,
  **when** `OpportunityWon` is published,
  **then** this sprint MUST NOT create a Customer, Quotation, Sales Order, or Sales Invoice record; those are downstream MOD-003 Sales concerns.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-006` — CRM.
- **Module PRD:** [`docs/20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md).
- **Upstream Sprints (mandatory):** [`SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md), [`SPR-MOD-006-002-leads.md`](./SPR-MOD-006-002-leads.md).
- **Module PRD sections fulfilled:** §1, §2 (Opportunity pipeline; submodule Opportunities), §3 (personas), §4 (Opportunity-to-order), §5 (Opportunity), §7 (deterministic transitions; single-outcome), §8 (`OpportunityWon`, `OpportunityLost` — published), §10 (Pipeline stages, Communication templates — consumed), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-006` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
- **Upstream sprint dependencies (per Sprint Plan §2):**
  - `SPR-MOD-006-001 CRM Foundation` — Account/Contact masters, CRM operations configuration namespace (pipeline stages, communication templates), `account.*`/`contact.*` events.
  - `SPR-MOD-006-002 Leads` — converted-lead process handoff record consumed at opportunity creation.
- **Cross-module consumption (events only):** none introduced by this sprint. MOD-003 Sales, MOD-002 Accounting, and MOD-017 Analytics remain downstream consumers via `OpportunityWon` and `OpportunityLost`.
- **Downstream sprints:** `SPR-MOD-006-004` (Activities) — links activities/meetings to opportunities. `SPR-MOD-006-005` (Campaigns) — may reference opportunities in analytics. `SPR-MOD-006-006` (Customer 360 & Analytics) — projects the opportunity pipeline read model. **Downstream modules:** MOD-003 Sales consumes `OpportunityWon` / `OpportunityLost` to drive customer / order creation.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at v1.1 (Active).

### 7.2 Upstream Sprint Dependency Status (per Pass 9.1.1 v2 plan Precondition 6, inherited)

| Item | Value | Result |
| --- | --- | --- |
| `SPR-MOD-006-001` file at registered path | [`SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md) | PASS |
| `SPR-MOD-006-001` `lifecycle_state` | Authored (frontmatter `status: Draft`, registration `Authored`) | PASS |
| `SPR-MOD-006-001` GT-003 validation (Pass 9.1.0) | 15/15 PASS — execution_id `GT003-MOD006-001-20260713-001` | PASS |
| `SPR-MOD-006-001` open corrective pass / unresolved audit finding | None | PASS |
| `SPR-MOD-006-002` file at registered path | [`SPR-MOD-006-002-leads.md`](./SPR-MOD-006-002-leads.md) | PASS |
| `SPR-MOD-006-002` `lifecycle_state` | Authored (frontmatter `status: Draft`, registration `Authored`) | PASS |
| `SPR-MOD-006-002` GT-003 validation (Pass 9.1.1) | 15/15 PASS — execution_id `GT003-MOD006-002-20260713-001` | PASS |
| `SPR-MOD-006-002` GT-005 audit (Pass 9.1.1) | 18/18 PASS — `REPOSITORY_AUDIT_20260713T000100Z` | PASS |
| `SPR-MOD-006-002` open corrective pass / unresolved audit finding | None | PASS |

Upstream dependency chain is fully satisfied — existence alone is not relied upon.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the CRM Ownership Convention inherited from `SPR-MOD-006-001` §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and is aligned verbatim with the Sprint Plan §SPR-MOD-006-003 Engines Consumed list.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every opportunity action per `ADR-032` (create, transition, forecast update, ownership/collaboration change, win/loss, activity link, archive). |
| `ENG-004` Audit | Records every opportunity lifecycle transition (accepted or rejected); the opportunity timeline (§5.8) projects this record set. |
| `ENG-005` Configuration | Resolves the pipeline stage set, transition graph, and communication templates for the (tenant, company) as registered by `SPR-MOD-006-001`. |
| `ENG-010` Workflow | Orchestrates ownership/collaboration change flows and multi-step transitions where a longer-running interaction is required. |
| `ENG-011` Approval | Enforces multi-step approval on the win/loss decision where authorization policy requires it. |
| `ENG-012` Rules | Evaluates pipeline-stage transition legality, enforces the Deterministic Stage Transition Invariant (§1.1.5), the Single-Outcome Invariant (§1.1.4), and the Created-From-Converted-Lead Traceability rule (§1.1.6) declaratively. |
| `ENG-024` Eventing | Publishes the opportunity outcome events registered in Module PRD §8 (currently `OpportunityWon`, `OpportunityLost`) and consumes `account.*` / `contact.*` events from `SPR-MOD-006-001`. |
| `ENG-025` Notification | Sends notifications on ownership/collaboration change, forecast update, and terminal outcome using communication templates registered by `SPR-MOD-006-001`. |

CRM business semantics (opportunity master, lifecycle, pipeline transition legality, forecast and probability behavior, win/loss classification) are owned by this module and are not delegated to any engine. Configuration authoring (pipeline stages, communication templates) is not performed here — it is inherited from `SPR-MOD-006-001` via the Module PRD Engine Allocation.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15 and matches the Sprint Plan §SPR-MOD-006-003 ADR list.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every opportunity read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration and by the opportunity timeline projection. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to opportunity creation (converted-lead and direct), stage transition, forecast update, ownership/collaboration change, win/loss classification, activity link, archive. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Opportunity | MOD-006 (this sprint) | Prospective deal against an account/contact, progressed through configured pipeline stages, classified at most once as `Won` or `Lost`. |
| Opportunity Pipeline | MOD-006 (this sprint) | Named ordered stage set with a transition graph, resolved from `SPR-MOD-006-001` registrations. |
| Opportunity Stage Membership | MOD-006 (this sprint) | Current stage of an opportunity within its resolved pipeline. |
| Opportunity Forecast | MOD-006 (this sprint) | Expected close date, forecast amount, and stage-derived probability for the opportunity. |
| Opportunity Collaboration Participant | MOD-006 (this sprint) | Non-owner user contributing to the opportunity. |
| Opportunity Activity Link | MOD-006 (this sprint) | Association between an Activity/Meeting (owned by `SPR-MOD-006-004`) and an Opportunity. |
| Opportunity Timeline Projection | MOD-006 (this sprint, read-only) | Chronological read-only view over `ENG-004` audit records for a single opportunity. Not a new event stream. |

### 10.2 Relationships

- A **company** owns zero or more **opportunities**.
- An **opportunity** references exactly one **account** (owned by `SPR-MOD-006-001`) and zero or one **contact** (owned by `SPR-MOD-006-001`).
- An **opportunity** created via lead conversion references exactly one **converted-lead handoff** (owned by `SPR-MOD-006-002`); a converted-lead handoff is referenced by at most one **opportunity** (§5.1).
- An **opportunity** has exactly one current **owner** (user, owned by MOD-001) and zero or more **collaboration participants** (users).
- An **opportunity** belongs to exactly one **pipeline** at any time and occupies exactly one **stage** within that pipeline.
- An **opportunity** has at most one **terminal outcome** per cycle (single-outcome invariant, §1.1.4).
- An **opportunity** has zero or more **opportunity activity links** to activities/meetings owned by `SPR-MOD-006-004`.
- The **opportunity timeline projection** derives from **audit records** owned by `ENG-004`; no independent event or record type is introduced.

### 10.3 Ownership Boundaries

- The Opportunity master, Pipeline, Stage Membership, Forecast, Collaboration Participant, Activity Link, and Timeline Projection are owned by `MOD-006` originating in this sprint per the CRM Ownership Convention.
- The Account and Contact entities remain owned by `SPR-MOD-006-001`; they are **referenced**, not redefined.
- The Lead entity and the converted-lead handoff remain owned by `SPR-MOD-006-002`; the handoff is **consumed**, not redefined.
- The Activity and Meeting entities remain owned by `SPR-MOD-006-004`; they are **linked**, not authored here.
- The commercial **Customer** entity, **Quotation**, **Sales Order**, and **Sales Invoice** are owned by MOD-003 Sales and are not touched by this sprint. Voucher and GL entries remain owned by MOD-002 Accounting and are not touched here.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing. The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

### 11.1 Published

Event names are quoted **verbatim** from the CRM Module PRD §8 event union. No event name is invented by this execution pass. The Sprint PRD publishes the opportunity outcome events registered in CRM Module PRD §8 (currently `OpportunityWon` and `OpportunityLost`).

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `OpportunityWon` | MOD-006 | SPR-MOD-006-003 | MOD-006 (self, downstream sprints), MOD-003 (Sales — drives customer/order creation), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `OpportunityLost` | MOD-006 | SPR-MOD-006-003 | MOD-006 (self, downstream sprints), MOD-017 (Analytics) | At-least-once, ordered per tenant |

### 11.2 Consumed

| Event Name / Handoff | Producing Module / Sprint | Consumption Purpose |
| --- | --- | --- |
| `account.created` | MOD-006 / `SPR-MOD-006-001` | Confirm account visibility before creating an opportunity against it. |
| `account.updated` | MOD-006 / `SPR-MOD-006-001` | Keep opportunity references to the account consistent. |
| `account.deactivated` | MOD-006 / `SPR-MOD-006-001` | Apply deterministic opportunity-lifecycle handling for open opportunities on the account (§5.10). |
| `contact.created` | MOD-006 / `SPR-MOD-006-001` | Confirm contact visibility before creating an opportunity against it. |
| `contact.updated` | MOD-006 / `SPR-MOD-006-001` | Keep opportunity references to the contact consistent. |
| Converted-lead process handoff record | MOD-006 / `SPR-MOD-006-002 §5.5` | Anchor a new opportunity to its originating converted lead (§5.1, §1.1.6). Consumed once per handoff. |

### 11.3 Not Emitted By This Sprint

The CRM Module PRD §8 event union additionally declares `LeadCreated`, `CampaignSent`, and `ActivityLogged` as published events. **None** of these are emitted by this sprint; each is authored by its originating sprint per the Sprint Plan §4 forward map. This sprint publishes only the opportunity outcome events registered in §8; no additional opportunity-specific event (probability change, forecast change, ownership change, activity link, timeline entry) is fabricated — those lifecycle changes are captured via `ENG-004` audit records and surfaced through the opportunity timeline projection (§5.8), which is not a new event stream.

Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

Event names in §11 are a subset of the Module PRD event union declared in [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md) §8 (`OpportunityWon`, `OpportunityLost` — published; `account.*`/`contact.*` consumed from `SPR-MOD-006-001`; converted-lead handoff consumed from `SPR-MOD-006-002`). Where authoring-time event names differ from the catalog registration, the catalog registration is authoritative; this Sprint MUST NOT redefine catalog names.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] `OpportunityWon` and `OpportunityLost` are registered in the event catalog with their contracts and are emitted on the corresponding terminal transitions.
- [ ] Pipeline stage transitions resolve the ordered stage set and transition graph registered by `SPR-MOD-006-001` deterministically for every (tenant, company) via the Module PRD Engine Allocation.
- [ ] Forecast values (expected close date, forecast amount, probability) update deterministically under active-stage rules and are rejected in terminal states.
- [ ] Single-Outcome Invariant (§1.1.4) holds under concurrent win/loss attempts on the same opportunity (verified via contract/integration tests).
- [ ] Created-From-Converted-Lead Traceability rule (§1.1.6) prevents double consumption of the same converted-lead handoff.
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every opportunity read and write.
- [ ] Every opportunity lifecycle transition (accepted or rejected) produces an audit record via `ENG-004`, and the opportunity timeline projects those records.
- [ ] Consumption of `account.*` / `contact.*` events keeps opportunity references consistent (§5.10).
- [ ] `OpportunityWon` does not cause a Customer, Quotation, Sales Order, or Sales Invoice record to be created by this sprint (ownership boundary preserved).
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-006_SPRINT_PLAN.md` §2 (`SPR-MOD-006-003`):

- Opportunities can be created from a converted lead, progressed through configured pipeline stages, and marked won or lost.
- Pipeline stages resolve via `ENG-005` configuration.
- `OpportunityWon` and `OpportunityLost` events are published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** `SPR-MOD-006-001 CRM Foundation` MUST have registered the pipeline stages and communication templates for the target (tenant, company) before this sprint can execute end-to-end.
  - **Impact:** Absent configuration produces deterministic rejections (§5.4) but blocks positive-path exercise of DoD.
  - **Mitigation:** Sequence delivery after `SPR-MOD-006-001` in the target environment; treat any configuration gap as an upstream defect for the Foundation sprint rather than a workaround in this sprint.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** `SPR-MOD-006-002 Leads` MUST produce the converted-lead process handoff record contract before opportunity creation via lead conversion can be exercised end-to-end.
  - **Impact:** Absent handoff contract blocks §5.1 positive-path exercise; direct creation (§5.2) remains available where authorization policy permits.
  - **Mitigation:** Sequence delivery after `SPR-MOD-006-002`; consume the handoff contract as published, do not redefine it.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Concurrent win/loss classifications on the same opportunity could race the Single-Outcome Invariant if `ENG-012` enforcement is bypassed or duplicated in application code.
  - **Impact:** Two outcome events from a single opportunity would violate Module PRD §7.
  - **Mitigation:** Enforce the invariant declaratively in `ENG-012` at the win/loss action boundary; add contract/integration tests exercising concurrent win/loss attempts.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Concurrent opportunity creation requests referencing the same converted-lead handoff could race the Created-From-Converted-Lead Traceability rule.
  - **Impact:** Two opportunities from a single handoff would break upstream traceability.
  - **Mitigation:** Enforce the "at most one opportunity per handoff" constraint declaratively at the persistence boundary; add contract/integration tests exercising concurrent creation.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Pipeline configuration registered upstream may resolve to a stage set or transition graph inconsistent with a business scenario (e.g., a required intermediate stage missing).
  - **Impact:** Stage transitions are rejected deterministically per §5.4, but repeated rejections would block real pipeline movement.
  - **Mitigation:** Surface transition-invariant failures with actionable audit context (US-009) so the upstream configuration can be corrected in `SPR-MOD-006-001`; do not soften the invariant here.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** `OpportunityWon` and `OpportunityLost` rely on `ENG-024` delivery guarantees governed by the authoritative event catalog.
  - **Impact:** Weakened delivery guarantees at the engine or catalog level would break downstream MOD-003 Sales and MOD-017 Analytics contracts.
  - **Mitigation:** Consume `ENG-024` per the authoritative event catalog without redefining delivery semantics; escalate any weakening as an engine / catalog defect.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** `OpportunityWon` and `OpportunityLost` — declared by Module PRD §8 — may not yet be registered in the authoritative event catalog at authoring time.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers (MOD-003 Sales) cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before this sprint enters `In Progress`; do not fabricate alternate names.
  - **Status:** Deferred

- **Risk ID:** R-08
  - **Description:** Opportunity master ownership is exclusive to CRM originating in this sprint; downstream Customer / Sales Order / Invoice / Voucher creation on `OpportunityWon` remains exclusive to MOD-003 Sales and MOD-002 Accounting.
  - **Impact:** Blurring these ownership boundaries would fragment the sales cycle and break traceability.
  - **Mitigation:** Enforce the Opportunity Master Authority convention (§1.1.1) and the CRM ↔ Sales / Accounting boundary at every downstream module gate; `OpportunityWon` is a trigger, not a customer/order/invoice authoring event.
  - **Status:** Accepted

- **Risk ID:** R-09
  - **Description:** No distinct probability-change or forecast-change event is registered in Module PRD §8; these changes are captured via `ENG-004` audit records and projected in the opportunity timeline (§5.8).
  - **Impact:** Downstream analytics that expect a broadcast probability/forecast event would need to consume audit-derived projections rather than events.
  - **Mitigation:** Do not fabricate probability/forecast events; project the audit record set via §5.8 and refer any genuine broadcast requirement upstream to a Module PRD amendment.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — opportunity validation, lifecycle transition rules, forecast value determinism, pipeline transition graph determinism, Single-Outcome Invariant guard, Created-From-Converted-Lead Traceability guard.
- **Integration** — audit emission via `ENG-004`, rules evaluation via `ENG-012`, configuration resolution via `ENG-005`, workflow orchestration via `ENG-010`, approval orchestration via `ENG-011`, event publication via `ENG-024`, notifications via `ENG-025`, `account.*`/`contact.*` consumption reconciliation, converted-lead handoff consumption.
- **Contract** — `OpportunityWon` and `OpportunityLost` contracts against the event catalog; converted-lead handoff consumer contract against `SPR-MOD-006-002`; downstream consumer contract against MOD-003 Sales for outcome consumption.
- **End-to-end (smoke)** — converted-lead → opportunity create → progress through configured stages → forecast updates → win (or loss) → outcome event published end-to-end under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation and the Single-Outcome Invariant under concurrent load.

Sprint-specific fixtures: a pipeline-stage fixture reused from `SPR-MOD-006-001` (produced there, consumed here without redefinition) and a converted-lead handoff fixture reused from `SPR-MOD-006-002` (produced there, consumed here without redefinition).

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the opportunity lifecycle as a small state machine parameterised by the resolved pipeline stage set so audit emission (§5.11), event publication (§5.9), and the timeline projection (§5.8) are trivially satisfiable at every accepted transition and rejected attempt.
- Consider enforcing the Single-Outcome Invariant at the persistence boundary (e.g., a uniqueness guard on the terminal-outcome record) so `ENG-012` and the storage layer agree.
- Consider enforcing the "at most one opportunity per converted-lead handoff" constraint at the persistence boundary so §5.1 and `ENG-012` agree under concurrency.
- On `account.deactivated`, consider a policy that transitions open opportunities on the account to a documented terminal state (e.g., `Lost` with a system-generated reason) and audits the transition; the exact policy is a business decision to be confirmed with product ownership before implementation.
- Consider a stage-derived probability policy that keeps user-editable probability within a tolerance around the stage-configured probability, so §5.3 remains meaningful without preventing legitimate business overrides.
- Consider a small idempotency ledger keyed by (tenant, company, converted-lead-handoff-id or external opportunity reference) for inbound opportunity creations, so re-plays are safe.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-006-003`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the Opportunity pipeline — opportunity master, pipeline stage transitions, forecast values, and win/loss classification producing the outcome events registered in Module PRD §8 (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-006 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the CRM Ownership Convention (inherited from `SPR-MOD-006-001`) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates Accounts/Contacts/configuration (owned by `SPR-MOD-006-001`), Leads (owned by `SPR-MOD-006-002`), Activities, Campaigns, Customer 360, and cross-module Customer/Quotation/Sales Order/Invoice (MOD-003) and Voucher/GL (MOD-002) scope, each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-006-004`) begin immediately after this one completes?**
   Yes. `SPR-MOD-006-004 Activities` is the immediate successor per [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) §2 and links its activities/meetings back to opportunities authored here.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md)
- Upstream Sprint (mandatory) — [`./SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md)
- Upstream Sprint (mandatory) — [`./SPR-MOD-006-002-leads.md`](./SPR-MOD-006-002-leads.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Downstream Sprint (activity linkage) — `SPR-MOD-006-004` (Activities, planned)
- Downstream Sprint (analytics projection) — `SPR-MOD-006-006` (Customer 360 & Analytics, planned)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Prior Sprint Audit — [`../../50-audit-reports/REPOSITORY_AUDIT_20260713T000100Z.md`](../../50-audit-reports/REPOSITORY_AUDIT_20260713T000100Z.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)

---

## GT-003 Validation Summary (VAL-001…VAL-014)

### Verification Metadata

| Field | Value |
| --- | --- |
| Target Artifact | `docs/30-sprint-prds/crm/SPR-MOD-006-003-opportunities.md` |
| Verification Pass | 9.1.2 (GT-003 execution for SPR-MOD-006-003) |
| Verification Date | 2026-07-13 |
| Verifier | Lovable (Governance Framework v1.0) |
| Authoritative Sources Checked | GT-003 v1.0, GT-005 v1.0, Governance Template Dependency Matrix v1.0.2, Capabilities Registry v1.1, CRM Module PRD, `MOD-006_SPRINT_PLAN.md`, `SPR-MOD-006-001-crm-foundation.md`, `SPR-MOD-006-002-leads.md` |
| Execution ID | `GT003-MOD006-003-20260713-001` |
| Parent Execution ID | `GT003-MOD006-002-20260713-001` |

### Validation Table

| ID | Check | Result | Action |
|---|---|---|---|
| VAL-001 | Sprint ID `SPR-MOD-006-003` unique across repository. | PASS | — |
| VAL-002 | Originating capability "Opportunity pipeline" exists in Module PRD Capability Allocation Matrix (Sprint Plan §4.1). | PASS | — |
| VAL-003 | Capability allocated to exactly one sprint (`SPR-MOD-006-003`); exclusivity holds. | PASS | — |
| VAL-004 | Engines `ENG-002, 004, 005, 010, 011, 012, 024, 025` ⊆ Module PRD engine union (§12) and match Sprint Plan §SPR-MOD-006-003 Engines Consumed verbatim. | PASS | — |
| VAL-005 | ADRs `ADR-011, ADR-014, ADR-032` ⊆ Module PRD ADR union and match Sprint Plan §SPR-MOD-006-003 ADRs Consumed verbatim. | PASS | — |
| VAL-006 | Events (published `OpportunityWon`, `OpportunityLost`; consumed `account.*`/`contact.*` and converted-lead handoff) ⊆ Module PRD event union (§8) or authoritative CRM upstream surface. Every event name resolved verbatim; none invented. | PASS | — |
| VAL-007 | Acceptance criteria complete (non-empty, testable). | PASS | — |
| VAL-008 | Deliverables complete (§2). | PASS | — |
| VAL-009 | Registration surfaces updated (README, Sprint Catalog, `DOCUMENT_INDEX`, `_meta.json`). | PASS | — |
| VAL-010 | Bidirectional traceability holds (capability ↔ sprint ↔ deliverable; upstream links to `SPR-MOD-006-001` and `SPR-MOD-006-002`; downstream links to `SPR-MOD-006-004`, `SPR-MOD-006-006`, and MOD-003 Sales) — see §3.2. | PASS | — |
| VAL-011 | No unresolved placeholders (`<...>` occurrence count = 0 in body). | PASS | — |
| VAL-012 | Frontmatter metadata valid (all required keys present; `depends_on: [SPR-MOD-006-001, SPR-MOD-006-002]` recorded). | PASS | — |
| VAL-013A | Template dependencies satisfied — GT-003 v1.0 Active; GT-002/GT-001 Active; Capabilities Registry v1.1 Active. | PASS | — |
| VAL-013B | Upstream sprint dependencies fully satisfied — both `SPR-MOD-006-001` and `SPR-MOD-006-002` present with `lifecycle_state = Authored`, GT-003 validation PASS in Passes 9.1.0 and 9.1.1 respectively, GT-005 audit PASS in Pass 9.1.1, no open corrective pass. See §7.2. | PASS | — |
| VAL-014 | Repository consistency — path matches `docs/30-sprint-prds/crm/SPR-MOD-006-003-opportunities.md`. | PASS | — |

### Verification Summary

| Field | Value |
| --- | --- |
| Checklist Items | 15 |
| Passed | 15 |
| Remediated | 0 |
| Failed | 0 |
| Outstanding Risks | R-01, R-02, R-03, R-04, R-05, R-06, R-07, R-08, R-09, R-EV-01 (all recorded in §14; none blocking) |
| Repository Status | READY |
| Next Pass | 9.1.3 — Execute GT-003 for `SPR-MOD-006-004` (Activities) via the reusable Execution Wrapper |

**Result:** 15/15 PASS. Repository status: READY. Confidence: MEDIUM (D3 waiver — no repository revision identifier available in sandboxed environment; inherited from Pass 9.1.0).

**GT-005 Repository Audit (audit_profiles = governance, repository, registration, traceability, integrity):** PASS. Governance assets unchanged; all four applicable registration surfaces updated in this pass (README, `SPRINT_CATALOG.md`, `DOCUMENT_INDEX.md`, `_meta.json`); `docs/DOCUMENT_TRACEABILITY.md` present but N/A (governance-level guide, no per-sprint rows by design; consistent with Passes 9.1.0 and 9.1.1); bidirectional traceability holds; no orphan references introduced; upstream dependency chain verified beyond mere existence.
