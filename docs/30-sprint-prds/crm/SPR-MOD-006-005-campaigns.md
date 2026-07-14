---
title: "SPR-MOD-006-005 — Campaigns"
summary: "Sprint PRD for the Campaigns submodule of MOD-006 CRM: Campaign master, Segment master, and the Campaign Send transaction with marketing consent enforcement, and publication of the `CampaignSent` event registered in CRM Module PRD §8. Consumes the CRM Foundation established in SPR-MOD-006-001; never redefines Accounts, Contacts, CRM operations configuration, Leads, Opportunities, Activities/Meetings, the commercial Customer master, or the Sales Order / Quotation / Invoice / Voucher / GL surfaces."
layer: "delivery"
owner: "Revenue"
status: "Draft"
updated: "2026-07-14"
sprint_id: "SPR-MOD-006-005"
parent_module: "MOD-006"
parent_sprint_plan: "MOD-006_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "9.1.4"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-023", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
depends_on: ["SPR-MOD-006-001"]
tags: ["sprint", "prd", "crm", "mod-006", "campaigns", "segmentation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD006-005-20260714-001"
parent_execution_id: "GT003-MOD006-004-20260714-001"
---

# SPR-MOD-006-005 — Campaigns

> **Stage 2 deliverable.** Fifth authored Sprint PRD for **MOD-006 CRM** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0). Consumes ERP Core Engines, Accepted ADRs, and the CRM Foundation from `SPR-MOD-006-001`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-006-005` (permanent) |
| Parent Module | `MOD-006` — CRM |
| Parent Sprint Plan | [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | [`SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md) (mandatory per Sprint Plan §SPR-MOD-006-005) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-006-006` (Customer 360 & Analytics) — consumes campaign effectiveness metrics and `CampaignSent` for KPI surfacing |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Campaigns** capability for BusinessOS CRM: the **Campaign** master, the **Segment** master, the **Campaign Send** transaction with marketing-consent enforcement, and publication of the `CampaignSent` event registered in CRM Module PRD §8. Campaigns target contacts and accounts owned by `SPR-MOD-006-001` and MAY optionally reference leads owned by `SPR-MOD-006-002`; no upstream entity is redefined here.

> **CRM Ownership Convention (inherited from `SPR-MOD-006-001` §1.1).** CRM owns the business semantics of the Campaign and Segment masters and the Campaign Send transaction. ERP Core Engines provide shared infrastructure (authorization, audit, document, workflow, approval, rules, automation, integration, eventing, notification) but **MUST NOT** redefine CRM business rules. Accounts, Contacts, and CRM operations configuration remain authoritatively owned by `SPR-MOD-006-001` and are **consumed** here without redefinition. The Lead master remains authoritatively owned by `SPR-MOD-006-002`; the Opportunity master remains authoritatively owned by `SPR-MOD-006-003`; the Activity and Meeting masters remain authoritatively owned by `SPR-MOD-006-004`. All are **referenced** where required and MUST NOT be redefined. The commercial Customer master and downstream sales documents remain authoritatively owned by MOD-003 Sales.

#### 1.1.1 Campaign, Segment & Campaign Send Authority

The **Campaign** master, the **Segment** master, and the **Campaign Send** transaction are authoritatively owned by MOD-006 CRM and originate in this sprint. No other module or CRM sprint MAY create, edit, or maintain a parallel Campaign, Segment, or Campaign Send master. Downstream modules and downstream CRM sprints consume campaign data via the `CampaignSent` event registered in CRM Module PRD §8 and read APIs; they MUST NOT redefine the Campaign, Segment, or Campaign Send entities or their lifecycles.

#### 1.1.2 CRM Sprint Boundaries (Campaigns vs. Foundation vs. Leads vs. Opportunities vs. Activities vs. Customer 360 vs. Sales documents)

Ownership boundaries at this Sprint layer:

- **This sprint (`SPR-MOD-006-005`) owns** the Campaign master and its lifecycle, the Segment master and its lifecycle, the Segment Membership evaluation semantics, the Campaign Send transaction and its lifecycle, marketing-consent enforcement at Send time, external-system dispatch orchestration via `ENG-023`, and publication of `CampaignSent`.
- **`SPR-MOD-006-001` owns** the Account and Contact masters, the marketing-consent attribute recorded on contacts, and the CRM operations configuration namespace (communication templates). This sprint **consumes** those entities and configuration entries via the CRM Module PRD Engine Allocation and **MUST NOT** redefine them.
- **`SPR-MOD-006-002` owns** the Lead master and its lifecycle. Campaigns that reference leads **consume** the Lead entity; this sprint **MUST NOT** author a Lead entity or its scoring/assignment rules.
- **`SPR-MOD-006-003` owns** the Opportunity master and its lifecycle; not authored or referenced by this sprint.
- **`SPR-MOD-006-004` owns** the Activity and Meeting masters and `ActivityLogged`; **Campaign Send is not an Activity** and MUST NOT be represented as one.
- **`SPR-MOD-006-006` owns** the Customer 360 read model, CRM reports (including Campaign Effectiveness), dashboards, and exports; none are authored here.
- **MOD-003 Sales owns** the commercial Customer master, Quotation, Sales Order, and Sales Invoice; none are authored here.
- **MOD-002 Accounting owns** vouchers and GL entries. This sprint has no ledger effect and MUST NOT emit vouchers or GL entries.

Ownership boundaries SHALL NOT be redefined in downstream CRM Sprint PRDs.

#### 1.1.3 CRM Configuration Consumption

**Communication templates** used by campaign-related notifications and Campaign Send dispatch SHALL be resolved from the Engine Allocation defined by the CRM Module PRD (§12 lists the authorised engine set) using the entries **registered by `SPR-MOD-006-001`**. This sprint **executes** those configurations — it does not register, redefine, or extend the CRM configuration namespace.

#### 1.1.4 Marketing-Consent Invariant

Every Campaign Send SHALL execute against **only** those contacts whose marketing consent (owned by `SPR-MOD-006-001`) is recorded and currently valid at the moment of Send. Any contact within the resolved segment membership whose marketing consent is absent, withdrawn, or expired MUST be deterministically excluded from the Send, and the exclusion MUST be audited via `ENG-004`. Enforced declaratively via `ENG-012` at the Send action boundary. This invariant realizes CRM Module PRD §7 ("Marketing consent must be recorded before campaign inclusion").

#### 1.1.5 Segment Determinism Invariant

Segment membership at the moment of a Campaign Send SHALL be a deterministic function of (segment definition, tenant/company scope, upstream master data snapshot at evaluation time). The same inputs MUST produce the same membership; the resolved membership set of a Send MUST be captured (or reconstructible) for audit purposes. Segment authoring MUST NOT introduce ad-hoc, non-reproducible selection criteria.

#### 1.1.6 Single-Emission Invariant (per Campaign Send)

Each Campaign Send transaction publishes **at most one** `CampaignSent` event per successful terminal transition (§5.5). Retries and idempotent re-plays MUST NOT publish additional `CampaignSent` events for the same Send. Enforced by `ENG-024` semantics plus an idempotency key on the Send.

#### 1.1.7 No-Delivery-Redefinition Invariant

External email / SMS / WhatsApp / marketing-platform delivery internals are consumer systems reached via `ENG-023` (Integration) and, where applicable, `ENG-025` (Notification). This sprint MUST NOT redefine delivery protocols, provider abstractions, or retry/DLQ semantics — those remain governed by their owning engines and ADRs.

### 1.2 In Scope

- **Campaign master** lifecycle (`Draft → Scheduled → Sending → Sent → Closed` with `Cancelled` as an alternate terminal, precise mapping documented in §16), including campaign metadata, channel, and template linkage to communication templates registered by `SPR-MOD-006-001`.
- **Segment master** lifecycle (Draft → Active → Inactive → Archived), including deterministic segment definition and the ability to resolve segment membership over accounts and contacts owned by `SPR-MOD-006-001` and, where declared, leads owned by `SPR-MOD-006-002`.
- **Campaign Send** transaction lifecycle (create → schedule → execute → complete / fail / cancel), with marketing-consent enforcement (§1.1.4) at the Send action boundary and deterministic segment membership resolution (§1.1.5).
- Marketing-consent enforcement at Send time, deterministic exclusion of non-consented contacts, and audit of every exclusion via `ENG-004`.
- Approval on Campaign Send where declared as multi-step per CRM operations configuration, via `ENG-011`.
- External-system dispatch orchestration via `ENG-023` (Integration) — Email / WhatsApp / SMS / marketing platforms are consumed, not authored, here.
- Notifications on Campaign Send lifecycle transitions (scheduled, executed, completed, cancelled) via `ENG-025`, using communication templates registered by `SPR-MOD-006-001`.
- Automation of scheduled Campaign Sends via `ENG-013` (Automation) where declared as scheduled.
- Rules evaluation for Campaign/Segment/Send legality via `ENG-012`.
- Audit integration for every Campaign, Segment, and Campaign Send lifecycle transition via `ENG-004`.
- Documents attached to a Campaign (creative assets, references) via `ENG-007`; this sprint links, does not redefine the document engine.
- Events published (see §11): `CampaignSent`, quoted verbatim from CRM Module PRD §8, delivered via `ENG-024`.
- Consumption of `account.*` / `contact.*` events published by `SPR-MOD-006-001` so segment membership stays reconciled to underlying master data.

### 1.3 Out of Scope

Reserved for other CRM sprints and other modules (see [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md)):

- Account, Contact, marketing-consent attribute authoring, and CRM operations configuration authoring — owned by `SPR-MOD-006-001` (consumed here, not redefined).
- Lead master, lead scoring, assignment rules, and `LeadCreated` events — owned by `SPR-MOD-006-002` (referenced only where a segment targets leads; not redefined).
- Opportunity master, pipeline stages, forecast, win/loss classification, and `OpportunityWon`/`OpportunityLost` events — owned by `SPR-MOD-006-003`.
- Activity and Meeting masters, activity linkage, and `ActivityLogged` events — owned by `SPR-MOD-006-004`. **Campaign Send is not an Activity.**
- Customer 360 read model, Campaign Effectiveness report, other CRM reports, dashboards, and exports — owned by `SPR-MOD-006-006`.
- Customer master, Quotation, Sales Order, Sales Invoice — owned by MOD-003 Sales.
- Voucher creation, GL entries, accounting posting — owned by MOD-002 Accounting.
- External email / SMS / WhatsApp / marketing-platform delivery internals — consumer systems reached via `ENG-023` and `ENG-025` (§1.1.7); not authored here.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-006-005`, the following will exist:

- **Business capabilities.**
  - A Campaign Manager can author a Campaign master, link it to a communication template registered by `SPR-MOD-006-001`, and progress it through its lifecycle up to a terminal state at most once per instance.
  - A Campaign Manager can author a Segment master with a deterministic definition (§1.1.5) resolving to accounts/contacts owned by `SPR-MOD-006-001` (and leads owned by `SPR-MOD-006-002` where declared).
  - A Campaign Manager can create and execute a Campaign Send transaction whose executed audience is the resolved segment membership **intersected** with the set of contacts holding valid marketing consent at Send time (§1.1.4).
  - Every contact-level exclusion from a Send (missing/withdrawn/expired consent, out-of-scope, archived) is recorded and audited via `ENG-004`.
  - Approvals, where declared, are orchestrated via `ENG-011`; scheduled Sends are orchestrated via `ENG-013`.
- **Published events.** The campaign event registered in CRM Module PRD §8 (see §11) — `CampaignSent` — emitted at the point specified by the event catalog (see §11), at most once per successful Send terminal transition (§1.1.6).
- **Configuration artifacts.** *None registered by this sprint.* All configuration (communication templates) is consumed from the namespace registered by `SPR-MOD-006-001` via the Module PRD Engine Allocation.
- **Audit artifacts.** An audit record exists for every Campaign, Segment, and Campaign Send lifecycle transition (create, update, schedule, execute, complete, fail, cancel, consent-exclusion, out-of-scope-exclusion), produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-006-005`.
  - `CampaignSent` event entry in the event catalog referenced from §11 (verbatim from Module PRD §8).
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-006 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Campaigns supporting the revenue pipeline | Campaign, Segment, and Campaign Send delivery; `CampaignSent` publication |
| §2 Business Scope — Campaigns and segmentation; submodule Campaigns | Campaign, Segment, Campaign Send lifecycles |
| §3 Personas — Marketing Manager (Campaign Manager), Sales Manager | User stories (§4) |
| §4 Business Processes — Campaign-to-lead | Campaign Send publishes `CampaignSent`; downstream lead-generation flow observable via audit and event catalog |
| §5 Master Data — Campaign, Segment | Campaign and Segment entities |
| §6 Transactions — Campaign Send | Campaign Send transaction lifecycle |
| §7 Business Rules — Marketing consent must be recorded before campaign inclusion | Marketing-Consent Invariant (§1.1.4), enforced declaratively via `ENG-012` |
| §8 Integration Points — `CampaignSent` (published); Email/WhatsApp/SMS/Marketing platforms (external) | Event contract (§11) — verbatim from §8; external dispatch via `ENG-023` |
| §10 Configuration — Communication templates | Consumption via Module PRD Engine Allocation at Send time |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved CRM Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Campaigns and segmentation (§2) | `SPR-MOD-006-005` |

This allocation is unique (VAL-002, VAL-003); no other CRM sprint claims "Campaigns and segmentation" as an originating capability. The **Campaigns** submodule is originating-allocated to this sprint per §4.2 of the Sprint Plan.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Campaigns and segmentation* and submodule *Campaigns* → this Sprint PRD → deliverables in §2 (Campaign/Segment masters, Campaign Send transaction, consent-enforced audience resolution, `CampaignSent` event, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.
- **Upstream sprint links:** every configuration consumed here (communication templates) traces to its registration in `SPR-MOD-006-001` §5.3; the marketing-consent attribute traces to the Contact master owned by `SPR-MOD-006-001`; segment references to leads trace to the Lead master owned by `SPR-MOD-006-002`.
- **Downstream sprint links:** `CampaignSent` and campaign effectiveness metrics are consumed by `SPR-MOD-006-006 Customer 360 & Analytics` and by MOD-017 Analytics.

---

## 4. User Stories

- **US-001.** *As a Campaign Manager, I want to author a Campaign master (channel, communication template linkage, schedule window), so that campaigns are represented authoritatively in CRM.*
- **US-002.** *As a Campaign Manager, I want to author a Segment master with a deterministic definition, so that the same definition always resolves to the same membership under identical inputs.*
- **US-003.** *As a Campaign Manager, I want to attach a Segment to a Campaign and create a Campaign Send, so that the campaign's audience is bound to a reproducible segment.*
- **US-004.** *As a Campaign Manager, I want the Campaign Send to execute only against contacts whose marketing consent is recorded and currently valid, so that consent obligations owned by `SPR-MOD-006-001` are honored.*
- **US-005.** *As a Campaign Manager, I want the Campaign Send lifecycle to reach at most one terminal outcome per instance (`Sent`, `Failed`, or `Cancelled`) with `CampaignSent` published only on the successful terminal transition, so that downstream analytics counts are consistent.*
- **US-006.** *As a Campaign Manager, I want scheduled Campaign Sends to execute automatically at the scheduled time via `ENG-013`, so that campaigns run reliably without manual dispatch.*
- **US-007.** *As a Compliance Officer, I want every consent-based exclusion from a Campaign Send to be audited via `ENG-004`, so that consent enforcement is reconstructable.*
- **US-008.** *As a Campaign Manager, I want approvals on high-impact Campaign Sends, where declared, orchestrated via `ENG-011`, so that governance holds.*
- **US-009.** *As a Sales Manager, I want notifications on Campaign Send lifecycle transitions via `ENG-025`, so that stakeholders are aware.*
- **US-010.** *As the CRM module (system persona), I want to publish `CampaignSent` at the point specified by the authoritative event catalog, so that `SPR-MOD-006-006` and MOD-017 Analytics can react in a decoupled way.*
- **US-011.** *As a security reviewer, I want every Campaign / Segment / Campaign Send lifecycle transition to be audited via `ENG-004`, so that I can reconstruct campaign history from an authoritative log.*
- **US-012.** *As the Campaigns submodule (system persona), I want to consume `account.*` / `contact.*` events from `SPR-MOD-006-001`, so that segment membership stays reconciled when the underlying master data changes.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Campaign master authoring (US-001)

- **Given** an active communication-template configuration registered by `SPR-MOD-006-001` visible to the caller's tenant/company scope,
  **when** a Campaign Manager submits a Campaign creation request referencing that template,
  **then** the Campaign is persisted with a stable identifier, its state is `Draft`, an audit record is produced via `ENG-004`, and no external dispatch occurs.
- **Given** a Campaign creation request referencing a non-existent or out-of-scope communication template,
  **when** it is submitted,
  **then** the request is rejected deterministically and the rejection is audited.

### 5.2 Segment master authoring (US-002)

- **Given** a Segment definition that references only account/contact attributes owned by `SPR-MOD-006-001` (and, where declared, lead attributes owned by `SPR-MOD-006-002`),
  **when** a Campaign Manager submits it,
  **then** the Segment is persisted, and any two evaluations of the definition against the same master-data snapshot produce identical membership sets (Segment Determinism Invariant §1.1.5).
- **Given** a Segment definition that references attributes outside the permitted upstream masters,
  **when** it is submitted,
  **then** the request is rejected deterministically and the rejection is audited.

### 5.3 Campaign Send creation & scheduling (US-003, US-006)

- **Given** an authored Campaign in a pre-terminal state and an active Segment,
  **when** a Campaign Manager creates a Campaign Send binding the Campaign to the Segment with a target execution time,
  **then** the Send is persisted, its state is `Scheduled`, orchestration is registered via `ENG-013` for scheduled dispatch, an audit record is produced, and no `CampaignSent` is published yet.

### 5.4 Consent-enforced execution (US-004, US-007)

- **Given** a Campaign Send whose scheduled time has arrived (or which is triggered on demand),
  **when** it enters execution,
  **then** its executed audience is computed as (resolved segment membership at evaluation time) **intersected** with (contacts holding valid marketing consent per `SPR-MOD-006-001` at that moment); every excluded contact (missing/withdrawn/expired consent or out-of-scope) is recorded and audited via `ENG-004` (Marketing-Consent Invariant §1.1.4).
- **Given** a Campaign Send whose executed audience is empty after consent intersection,
  **when** execution completes,
  **then** the Send reaches a documented terminal state (see §16), no external dispatch occurs, `CampaignSent` MAY still be published per the authoritative event catalog contract, and the empty-audience outcome is audited.

### 5.5 Single terminal outcome and event emission (US-005, US-010)

- **Given** a Campaign Send in an active state,
  **when** execution reaches a terminal transition (`Sent`, `Failed`, or `Cancelled`),
  **then** the Send transitions to the corresponding terminal state at most once per instance, the transition is audited, and `CampaignSent` is published via `ENG-024` where the authoritative event catalog specifies emission on the successful terminal transition (Single-Emission Invariant §1.1.6).
- **Given** a Campaign Send already in a terminal state,
  **when** any subsequent terminal-outcome request or retry is submitted,
  **then** the request is rejected deterministically, no second `CampaignSent` is published, and the rejection is audited.

### 5.6 External dispatch orchestration (US-004, US-006)

- **Given** a Campaign Send in execution whose channel resolves to Email / WhatsApp / SMS / marketing platform,
  **when** dispatch is required,
  **then** dispatch is orchestrated via `ENG-023` using the communication template resolved from `SPR-MOD-006-001`; retry, delivery, and provider-abstraction semantics are governed by `ENG-023` and MUST NOT be redefined here (§1.1.7).

### 5.7 Approval on declared Campaign Sends (US-008)

- **Given** a Campaign Send declared by CRM operations configuration as requiring multi-step approval,
  **when** it is scheduled,
  **then** an approval flow is orchestrated via `ENG-011`; execution proceeds only after all required approvals per `ADR-032` are recorded; refusals are audited via `ENG-004`.

### 5.8 Notifications on lifecycle transitions (US-009)

- **Given** a Campaign Send whose lifecycle has just transitioned (`Scheduled`, `Sending`, `Sent`, `Failed`, or `Cancelled`),
  **when** the transition completes,
  **then** a notification is dispatched via `ENG-025` using the communication template resolved from the CRM operations configuration registered by `SPR-MOD-006-001`; where no template is registered, the transition still completes and the notification gap is captured deterministically per §5.11 audit rules (this sprint MUST NOT invent a default template).

### 5.9 Events published (US-010)

- **Given** a successful Campaign Send terminal transition that the authoritative event catalog specifies for `CampaignSent` emission,
  **when** the transition completes,
  **then** `CampaignSent` is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog (§11) and registered in CRM Module PRD §8 are used.

### 5.10 Account / Contact reconciliation consumption (US-012)

- **Given** an `account.updated` or `contact.updated` event published by `SPR-MOD-006-001` for a tenant/company visible to CRM,
  **when** the event is received,
  **then** any active Segment whose membership depends on affected accounts/contacts is re-evaluable deterministically at the next Send execution, and reconciliation is audited via `ENG-004`.
- **Given** an `account.deactivated` or `contact.deactivated` event affecting a contact within a scheduled Send's resolved membership,
  **when** the Send executes,
  **then** the affected contact is deterministically excluded from the executed audience (out-of-scope exclusion) and the exclusion is audited; this sprint does not modify the Account or Contact entity.

### 5.11 Audit integration (US-011)

- **Given** any Campaign, Segment, or Campaign Send lifecycle transition (create, update, schedule, execute, complete, fail, cancel) or any per-recipient exclusion (consent, out-of-scope, archived),
  **when** it completes or is rejected,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition or exclusion type, decision, and timestamp.

### 5.12 Isolation invariants (`ADR-011`)

- **Given** any Campaign, Segment, or Campaign Send read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed. Segment membership never resolves across tenant boundaries.

### 5.13 Ownership consumption invariants

- **Given** any downstream module or CRM sprint requiring campaign data,
  **when** it reads or reacts to campaign lifecycle,
  **then** it does so exclusively through CRM-owned events (currently `CampaignSent`) and read APIs. No downstream module creates an independent Campaign, Segment, or Campaign Send master.
- **Given** any code path in this sprint that requires Account, Contact, marketing-consent, CRM operations configuration, or the Lead master,
  **when** it needs those entities or configuration values,
  **then** it consumes them from `SPR-MOD-006-001` / `SPR-MOD-006-002` via events, the Module PRD Engine Allocation, and read APIs; those entities and configuration entries are not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-006` — CRM.
- **Module PRD:** [`docs/20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md).
- **Upstream Sprint (mandatory per Sprint Plan §SPR-MOD-006-005):** [`SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md).
- **Module PRD sections fulfilled:** §1, §2 (Campaigns and segmentation; submodule Campaigns), §3 (personas), §4 (Campaign-to-lead), §5 (Campaign, Segment), §6 (Campaign Send), §7 (Marketing consent rule), §8 (`CampaignSent` — published; Email/WhatsApp/SMS/Marketing platforms — external), §10 (Communication templates — consumed), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-006` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
- **Upstream sprint dependencies (per Sprint Plan §SPR-MOD-006-005):**
  - `SPR-MOD-006-001 CRM Foundation` — Account/Contact masters, marketing-consent attribute, CRM operations configuration namespace (communication templates), `account.*`/`contact.*` events.
- **Upstream sprint dependencies (optional, referenced only where a segment targets leads):**
  - `SPR-MOD-006-002 Leads` — Lead master consumed for segment definitions that reference leads.
- **Cross-module consumption (events only):** none introduced by this sprint. MOD-017 Analytics remains a downstream consumer via `CampaignSent`.
- **Downstream sprints:** `SPR-MOD-006-006` (Customer 360 & Analytics) — projects campaign effectiveness metrics. **Downstream modules:** MOD-017 Analytics consumes `CampaignSent` for KPI surfacing.

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
| `SPR-MOD-006-001` `lifecycle_state` | Authored | PASS |
| `SPR-MOD-006-001` GT-003 validation (Pass 9.1.0) | PASS — execution_id `GT003-MOD006-001-20260713-001` | PASS |
| `SPR-MOD-006-002` file at registered path | [`SPR-MOD-006-002-leads.md`](./SPR-MOD-006-002-leads.md) | PASS |
| `SPR-MOD-006-002` GT-003 validation (Pass 9.1.1) | PASS — execution_id `GT003-MOD006-002-20260713-001` | PASS |
| `SPR-MOD-006-003` file at registered path | [`SPR-MOD-006-003-opportunities.md`](./SPR-MOD-006-003-opportunities.md) | PASS |
| `SPR-MOD-006-003` GT-003 validation (Pass 9.1.2) | PASS — execution_id `GT003-MOD006-003-20260713-001` | PASS |
| `SPR-MOD-006-004` file at registered path | [`SPR-MOD-006-004-activities-communications.md`](./SPR-MOD-006-004-activities-communications.md) | PASS |
| `SPR-MOD-006-004` GT-003 validation (Pass 9.1.3) | PASS — execution_id `GT003-MOD006-004-20260714-001` | PASS |
| `SPR-MOD-006-004` GT-005 audit (Pass 9.1.3) | PASS — `REPOSITORY_AUDIT_20260714T000000Z` | PASS |
| Any upstream sprint has open corrective pass / unresolved audit finding | None | PASS |

Upstream dependency chain is fully satisfied — existence alone is not relied upon.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the CRM Ownership Convention inherited from `SPR-MOD-006-001` §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and is aligned verbatim with the Sprint Plan §SPR-MOD-006-005 Engines Consumed list.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every Campaign, Segment, and Campaign Send action per `ADR-032` (create/update, schedule, execute, cancel, approve, link/unlink documents). |
| `ENG-004` Audit | Records every Campaign, Segment, and Campaign Send lifecycle transition and every per-recipient exclusion (accepted or rejected). |
| `ENG-007` Document | Surfaces documents attached to a Campaign (creative assets, references); document engine behavior is consumed, not redefined. |
| `ENG-010` Workflow | Orchestrates longer-running Campaign Send flows (e.g., scheduled dispatch coordination) where required. |
| `ENG-011` Approval | Orchestrates multi-step approvals on Campaign Sends where declared by CRM operations configuration. |
| `ENG-012` Rules | Evaluates Campaign / Segment / Send legality; enforces the Marketing-Consent Invariant (§1.1.4) and Segment Determinism Invariant (§1.1.5) declaratively at the Send action boundary. |
| `ENG-013` Automation | Executes scheduled Campaign Sends at their target time and triggers idempotent retries under `ENG-024` guarantees. |
| `ENG-023` Integration | Orchestrates external-system dispatch (Email / WhatsApp / SMS / marketing platforms) declared in Module PRD §8; delivery internals are not redefined here (§1.1.7). |
| `ENG-024` Eventing | Publishes `CampaignSent` at the point specified by the authoritative event catalog and consumes `account.*` / `contact.*` events from `SPR-MOD-006-001`. |
| `ENG-025` Notification | Sends notifications on Campaign Send lifecycle transitions using communication templates registered by `SPR-MOD-006-001`. |

CRM business semantics (Campaign / Segment / Campaign Send lifecycle, consent-enforced audience resolution, segment determinism, single terminal outcome, single event emission) are owned by this module and are not delegated to any engine. Configuration authoring (communication templates) is not performed here — it is inherited from `SPR-MOD-006-001` via the Module PRD Engine Allocation.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15 and matches the Sprint Plan §SPR-MOD-006-005 ADR list.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every Campaign / Segment / Campaign Send read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for lifecycle transitions and per-recipient exclusions. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to Campaign / Segment / Campaign Send create, update, schedule, execute, cancel, approve, link/unlink. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Campaign | MOD-006 (this sprint) | Business-owned campaign master (channel, template linkage, schedule window). |
| Segment | MOD-006 (this sprint) | Deterministic definition of a targetable audience over accounts/contacts (and optionally leads). |
| Segment Membership Snapshot | MOD-006 (this sprint) | The resolved membership set for a specific Campaign Send at evaluation time; supports audit reconstruction (§1.1.5). |
| Campaign Send | MOD-006 (this sprint) | Transactional execution of a Campaign against a Segment, with at most one terminal outcome per instance. |
| Send Exclusion Record | MOD-006 (this sprint) | Per-recipient exclusion (consent, out-of-scope, archived) recorded for a specific Send; realized via audit records. |

### 10.2 Relationships

- A **company** owns zero or more **campaigns**, zero or more **segments**, and zero or more **campaign sends**.
- A **campaign** references exactly one **communication template** (owned by `SPR-MOD-006-001` configuration namespace).
- A **campaign send** references exactly one **campaign** and exactly one **segment**.
- A **segment** membership resolves to zero or more **contacts** (owned by `SPR-MOD-006-001`) and, where declared, **leads** (owned by `SPR-MOD-006-002`); resolution is deterministic (§1.1.5).
- A **campaign send** has at most one **terminal outcome** per instance (§1.1.6) and produces zero or more **send exclusion records**.
- A **campaign** has zero or more attached **documents** (owned by `ENG-007`); these are linked, not authored here.

### 10.3 Ownership Boundaries

- The Campaign, Segment, Segment Membership Snapshot, Campaign Send, and Send Exclusion Record are owned by `MOD-006` originating in this sprint per the CRM Ownership Convention.
- The Account, Contact, and marketing-consent attribute remain owned by `SPR-MOD-006-001`; they are **referenced**, not redefined.
- The Lead entity remains owned by `SPR-MOD-006-002`; it is **referenced** where segment definitions target leads, not redefined.
- The Opportunity entity remains owned by `SPR-MOD-006-003`; not referenced here.
- The Activity and Meeting entities remain owned by `SPR-MOD-006-004`; **Campaign Send is not an Activity**.
- Documents (`ENG-007`) remain owned by that engine; they are **linked**, not authored here.
- The commercial **Customer** entity, **Quotation**, **Sales Order**, **Sales Invoice**, vouchers, and GL entries remain owned by MOD-003 Sales and MOD-002 Accounting and are not touched by this sprint.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing. The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

### 11.1 Published

Event names are quoted **verbatim** from the CRM Module PRD §8 event union. No event name is invented by this execution pass.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `CampaignSent` | MOD-006 | SPR-MOD-006-005 | MOD-006 (self, `SPR-MOD-006-006`), MOD-017 (Analytics) | At-least-once, ordered per tenant |

### 11.2 Consumed

| Event Name | Producing Module / Sprint | Consumption Purpose |
| --- | --- | --- |
| `account.created` | MOD-006 / `SPR-MOD-006-001` | Reconcile segment membership evaluation with newly created accounts. |
| `account.updated` | MOD-006 / `SPR-MOD-006-001` | Keep segment membership consistent with account attribute changes. |
| `account.deactivated` | MOD-006 / `SPR-MOD-006-001` | Ensure deactivated accounts are deterministically excluded at Send execution (§5.10). |
| `contact.created` | MOD-006 / `SPR-MOD-006-001` | Reconcile segment membership evaluation with newly created contacts. |
| `contact.updated` | MOD-006 / `SPR-MOD-006-001` | Keep segment membership and marketing-consent projection consistent with contact attribute changes. |

### 11.3 Not Emitted By This Sprint

The CRM Module PRD §8 event union additionally declares `LeadCreated`, `OpportunityWon`, `OpportunityLost`, and `ActivityLogged` as published events. **None** of these are emitted by this sprint; each is authored by its originating sprint per the Sprint Plan §4 forward map. This sprint publishes only `CampaignSent`; no additional campaign lifecycle event (created, scheduled, cancelled) is fabricated — those lifecycle changes are captured via `ENG-004` audit records.

Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

Event names in §11 are a subset of the Module PRD event union declared in [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md) §8 (`CampaignSent` — published; `account.*`/`contact.*` consumed from `SPR-MOD-006-001`). Where authoring-time event names differ from the catalog registration, the catalog registration is authoritative; this Sprint MUST NOT redefine catalog names.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] `CampaignSent` is registered in the event catalog with its contract and is emitted at the point specified by the authoritative event catalog.
- [ ] Marketing-Consent Invariant (§1.1.4) prevents any Send from executing against a contact without valid marketing consent at Send time.
- [ ] Segment Determinism Invariant (§1.1.5) holds — identical inputs produce identical membership sets (verified via contract/integration tests).
- [ ] Single-Emission Invariant (§1.1.6) holds under concurrent terminal-outcome attempts and retries on the same Send (verified via contract/integration tests).
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every Campaign / Segment / Campaign Send read and write.
- [ ] Every Campaign / Segment / Campaign Send lifecycle transition and every per-recipient exclusion (accepted or rejected) produces an audit record via `ENG-004`.
- [ ] Consumption of `account.*` / `contact.*` events keeps segment membership consistent (§5.10).
- [ ] No Customer, Quotation, Sales Order, Sales Invoice, Voucher, GL entry, Activity, or Meeting is created by this sprint (ownership boundary preserved).
- [ ] No parallel Campaign, Segment, or Campaign Send master is created outside CRM (ownership boundary preserved).
- [ ] External dispatch is orchestrated via `ENG-023` without redefining delivery internals (§1.1.7).
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-006_SPRINT_PLAN.md` §2 (`SPR-MOD-006-005`):

- Campaigns and segments can be created and managed.
- Campaign Send transaction executes only against contacts with recorded marketing consent.
- `CampaignSent` events are published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** `SPR-MOD-006-001 CRM Foundation` MUST have registered the communication templates (and marketing-consent capture) for the target (tenant, company) before this sprint can execute end-to-end.
  - **Impact:** Absent configuration or consent capture produces deterministic exclusions at Send time (§5.4) but does not block Campaign / Segment persistence.
  - **Mitigation:** Sequence delivery after `SPR-MOD-006-001` in the target environment; treat any configuration gap as an upstream defect for the Foundation sprint rather than a workaround in this sprint.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** Concurrent terminal-outcome attempts and retries on the same Campaign Send could race the Single-Emission Invariant if `ENG-024` idempotency and `ENG-012` guards are bypassed.
  - **Impact:** Multiple `CampaignSent` for a single Send would corrupt downstream analytics counts.
  - **Mitigation:** Enforce the invariant declaratively via `ENG-012` at the terminal action boundary and by binding `ENG-024` publication to an idempotency key on the Send.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Segment definitions could evolve to reference attributes outside the permitted upstream masters (§5.2), risking non-determinism and ownership violations.
  - **Impact:** Non-reproducible membership; ownership drift into other sprints.
  - **Mitigation:** Enforce the Segment Determinism Invariant declaratively via `ENG-012` at segment authoring time.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** External dispatch failures via `ENG-023` (Email/SMS/WhatsApp/marketing platform) could interact ambiguously with terminal-outcome classification.
  - **Impact:** Ambiguous `Sent` vs. `Failed` classification would corrupt Campaign Effectiveness surfaces in `SPR-MOD-006-006`.
  - **Mitigation:** Terminal-outcome classification is governed by CRM business rules over `ENG-023` results; do not redefine `ENG-023` semantics; document mapping in §16.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** The exact emission point of `CampaignSent` (per-Send terminal transition vs. per-recipient) is governed by the authoritative event catalog and MUST NOT be reinvented in this Sprint.
  - **Impact:** Divergence between code and event catalog would corrupt downstream analytics.
  - **Mitigation:** Bind emission point to the event catalog registration; treat the catalog as authoritative and this Sprint PRD as consuming.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** `CampaignSent` relies on `ENG-024` delivery guarantees governed by the authoritative event catalog.
  - **Impact:** Weakened delivery guarantees at the engine or catalog level would break downstream `SPR-MOD-006-006` and MOD-017 Analytics contracts.
  - **Mitigation:** Consume `ENG-024` per the authoritative event catalog without redefining delivery semantics; escalate any weakening as an engine / catalog defect.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** `CampaignSent` — declared by Module PRD §8 — may not yet be registered in the authoritative event catalog at authoring time.
  - **Impact:** If not registered before implementation, publishers cannot emit and downstream consumers cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before this sprint enters `In Progress`; do not fabricate alternate names.
  - **Status:** Deferred

- **Risk ID:** R-08
  - **Description:** Campaign / Segment / Campaign Send ownership is exclusive to CRM originating in this sprint; no other module or CRM sprint may create a parallel master.
  - **Impact:** Blurring these ownership boundaries would fragment marketing engagement history and break analytics.
  - **Mitigation:** Enforce the Campaign, Segment & Campaign Send Authority convention (§1.1.1) at every downstream gate; `CampaignSent` is a broadcast signal, not an authorization for a downstream module to author its own Campaign master.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — Campaign / Segment / Campaign Send validation, lifecycle transition rules, Marketing-Consent Invariant guard, Segment Determinism Invariant guard, Single-Emission Invariant guard, consent-based exclusion determinism.
- **Integration** — audit emission via `ENG-004`, rules evaluation via `ENG-012`, workflow orchestration via `ENG-010`, approval orchestration via `ENG-011`, automation of scheduled Sends via `ENG-013`, external dispatch orchestration via `ENG-023`, event publication via `ENG-024`, notifications via `ENG-025`, `account.*` / `contact.*` consumption reconciliation.
- **Contract** — `CampaignSent` contract against the event catalog; downstream consumer contract against `SPR-MOD-006-006` and MOD-017 Analytics.
- **End-to-end (smoke)** — Campaign create → Segment attach → Campaign Send schedule → execute → terminal outcome under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation, the Marketing-Consent Invariant, the Segment Determinism Invariant, and the Single-Emission Invariant.

Sprint-specific fixtures: a communication-template fixture reused from `SPR-MOD-006-001` (produced there, consumed here without redefinition), contacts with mixed marketing-consent states, and a lead fixture reused from `SPR-MOD-006-002` for lead-targeted segments.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the Campaign Send lifecycle as a small state machine (`Scheduled → Sending → {Sent, Failed, Cancelled}`) so audit emission (§5.11), event publication (§5.5, §5.9), and per-recipient exclusion recording (§5.4) are trivially satisfiable at every accepted transition and rejected attempt.
- Consider enforcing the Single-Emission Invariant at the eventing boundary via a deduplication key derived from `(tenant, company, campaign_send_id)`; combine with `ENG-024`'s idempotency to prevent duplicate `CampaignSent` emissions on retry.
- Consider persisting the Segment Membership Snapshot at Send evaluation time (or making it deterministically reconstructible from an immutable input snapshot) so §5.4 exclusions and §5.11 audits are reconstructable indefinitely.
- Consider mapping `ENG-023` external dispatch results into terminal-outcome classification via an explicit, unit-tested mapping table so R-04 does not manifest at runtime.
- Consider projecting an "empty-audience" outcome as a `Sent` state with recorded exclusions rather than `Failed`, subject to product confirmation; document the choice explicitly.
- Consider a small idempotency ledger keyed by (tenant, company, campaign_id, external correlation id) for automation-driven Sends so `ENG-013` re-plays are safe.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-006-005`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver Campaigns — Campaign master, Segment master, and Campaign Send transaction with marketing-consent enforcement, and publication of `CampaignSent` (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-006 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the CRM Ownership Convention (inherited from `SPR-MOD-006-001`) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates Accounts/Contacts/configuration/consent (`SPR-MOD-006-001`), Leads (`SPR-MOD-006-002`), Opportunities (`SPR-MOD-006-003`), Activities/Meetings (`SPR-MOD-006-004`), Customer 360 (`SPR-MOD-006-006`), MOD-003 Sales, and MOD-002 Accounting scope, each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-006-006`) begin immediately after this one completes?**
   Yes. `SPR-MOD-006-006 Customer 360 & Analytics` is the immediate successor per [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) §2.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md)
- Upstream Sprint (mandatory) — [`./SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md)
- Upstream Sprint (optional linkage) — [`./SPR-MOD-006-002-leads.md`](./SPR-MOD-006-002-leads.md)
- Sibling CRM Sprints (context) — [`./SPR-MOD-006-003-opportunities.md`](./SPR-MOD-006-003-opportunities.md), [`./SPR-MOD-006-004-activities-communications.md`](./SPR-MOD-006-004-activities-communications.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Downstream Sprint (analytics projection) — `SPR-MOD-006-006` (Customer 360 & Analytics, planned)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- Prior Sprint Audit — [`../../50-audit-reports/REPOSITORY_AUDIT_20260714T000000Z.md`](../../50-audit-reports/REPOSITORY_AUDIT_20260714T000000Z.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)

---

## GT-003 Validation Summary

### Verification Metadata

| Field | Value |
| --- | --- |
| Target Artifact | `docs/30-sprint-prds/crm/SPR-MOD-006-005-campaigns.md` |
| Verification Pass | 9.1.4 (GT-003 execution for SPR-MOD-006-005) |
| Verification Date | 2026-07-14 |
| Verifier | Lovable (Governance Framework v1.0) |
| Authoritative Sources Checked | GT-003 v1.0, GT-005 v1.0, Governance Template Dependency Matrix v1.0.2, Capabilities Registry v1.1, CRM Module PRD, `MOD-006_SPRINT_PLAN.md`, `SPR-MOD-006-001..004` |
| Execution ID | `GT003-MOD006-005-20260714-001` |
| Parent Execution ID | `GT003-MOD006-004-20260714-001` |
| Validation Binding | Complete validation rule set declared by released GT-003 v1.0 (executed dynamically; no fixed count asserted by this pass) |

### Validation Table

| ID | Check | Result | Action |
|---|---|---|---|
| VAL-001 | Sprint ID `SPR-MOD-006-005` unique across repository. | PASS | — |
| VAL-002 | Originating capability "Campaigns and segmentation" exists in Module PRD Capability Allocation Matrix (Sprint Plan §4.1). | PASS | — |
| VAL-003 | Capability allocated to exactly one sprint (`SPR-MOD-006-005`); exclusivity holds. | PASS | — |
| VAL-004 | Engines `ENG-002, 004, 007, 010, 011, 012, 013, 023, 024, 025` ⊆ Module PRD engine union (§12) and match Sprint Plan §SPR-MOD-006-005 Engines Consumed verbatim. | PASS | — |
| VAL-005 | ADRs `ADR-011, ADR-014, ADR-032` ⊆ Module PRD ADR union and match Sprint Plan §SPR-MOD-006-005 ADRs Consumed verbatim. | PASS | — |
| VAL-006 | Events (published `CampaignSent`; consumed `account.*`/`contact.*`) ⊆ Module PRD event union (§8) or authoritative CRM upstream surface. Every event name resolved verbatim; none invented. | PASS | — |
| VAL-007 | Acceptance criteria complete (non-empty, testable). | PASS | — |
| VAL-008 | Deliverables complete (§2). | PASS | — |
| VAL-009 | Registration surfaces updated (README, Sprint Catalog, `DOCUMENT_INDEX`, `_meta.json`). | PASS | — |
| VAL-010 | Bidirectional traceability holds (capability ↔ sprint ↔ deliverable; upstream links to `SPR-MOD-006-001` and optional `SPR-MOD-006-002`; downstream link to `SPR-MOD-006-006` and MOD-017 Analytics) — see §3.2. | PASS | — |
| VAL-011 | No unresolved placeholders (`<...>` occurrence count = 0 in body). | PASS | — |
| VAL-012 | Frontmatter metadata valid (all required keys present; `depends_on: [SPR-MOD-006-001]` per Sprint Plan §SPR-MOD-006-005 mandatory upstream dependency). | PASS | — |
| VAL-013A | Template dependencies satisfied — GT-003 v1.0 Active; GT-002/GT-001 Active; Capabilities Registry v1.1 Active. | PASS | — |
| VAL-013B | Upstream sprint dependencies fully satisfied — `SPR-MOD-006-001` present and Authored; sibling upstreams `SPR-MOD-006-002..004` present and Authored; all prior GT-003 validations PASS and GT-005 audits PASS; no open corrective pass. See §7.2. | PASS | — |
| VAL-014 | Repository consistency — path matches `docs/30-sprint-prds/crm/SPR-MOD-006-005-campaigns.md`. | PASS | — |

### Verification Summary

| Field | Value |
| --- | --- |
| Checklist Items | Every rule declared by released GT-003 v1.0 |
| Passed | All declared rules PASS |
| Remediated | 0 |
| Failed | 0 |
| Outstanding Risks | R-01, R-02, R-03, R-04, R-05, R-06, R-07, R-08, R-EV-01 (all recorded in §14; none blocking) |
| Repository Status | READY |
| Next Pass | 9.1.5 — Execute GT-003 for `SPR-MOD-006-006` using the objective reserved in the CRM Sprint Plan, via the reusable Execution Wrapper |

**Result:** All declared GT-003 v1.0 validation rules PASS. Repository status: READY. Confidence: MEDIUM (D3 waiver — no repository revision identifier available in sandboxed environment; inherited from Pass 9.1.0).

**GT-005 Repository Audit (audit_profiles = governance, repository, registration, traceability, integrity):** PASS. Governance assets unchanged; all four applicable registration surfaces updated in this pass (README, `SPRINT_CATALOG.md`, `DOCUMENT_INDEX.md`, `_meta.json`); `docs/DOCUMENT_TRACEABILITY.md` present but N/A (governance-level guide, no per-sprint rows by design; consistent with Passes 9.1.0–9.1.3); bidirectional traceability holds; no orphan references introduced; upstream dependency chain verified beyond mere existence.

### Handoff Contract

```yaml
execution_status: READY_FOR_NEXT_SPRINT
next_template: GT-003
next_target: SPR-MOD-006-006
handoff_state: READY

handoff_contract:
  upstream_execution: GT003-MOD006-005-20260714-001
  downstream_requires:
    - Sprint PRD registered
    - GT-003 validation PASS
    - GT-005 audit PASS
    - Repository READY
```
