---
title: "SPR-MOD-006-002 — Leads"
summary: "Sprint PRD for the Leads submodule of MOD-006 CRM: lead master, lead scoring evaluation, assignment rule execution, and single-shot lead-to-opportunity conversion. Consumes the CRM Foundation established in SPR-MOD-006-001; never redefines Accounts, Contacts, CRM operations configuration, or the commercial Customer master."
layer: "delivery"
owner: "Revenue"
status: "Draft"
updated: "2026-07-13"
sprint_id: "SPR-MOD-006-002"
parent_module: "MOD-006"
parent_sprint_plan: "MOD-006_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "9.1.1"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-010", "ENG-012", "ENG-013", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
depends_on: ["SPR-MOD-006-001"]
tags: ["sprint", "prd", "crm", "mod-006", "leads", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD006-002-20260713-001"
parent_execution_id: "GT003-MOD006-001-20260713-001"
---

# SPR-MOD-006-002 — Leads

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-006 CRM** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0). Consumes ERP Core Engines, Accepted ADRs, and the CRM Foundation from `SPR-MOD-006-001`; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-006-002` (permanent) |
| Parent Module | `MOD-006` — CRM |
| Parent Sprint Plan | [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint | [`SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md) |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-006-003` (Opportunities) — consumes lead-conversion handoff |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver **Lead capture and qualification** for BusinessOS CRM: the lead master and its lifecycle, lead scoring evaluation using the model registered by `SPR-MOD-006-001`, assignment rule execution resolving to exactly one owner, and single-shot lead-to-opportunity conversion producing the process handoff consumed by `SPR-MOD-006-003 Opportunities`.

> **CRM Ownership Convention (inherited from `SPR-MOD-006-001` §1.1).** CRM owns the business semantics of the Lead master and its lifecycle. ERP Core Engines provide shared infrastructure (authorization, audit, workflow, rules, automation, eventing, notification) but **MUST NOT** redefine CRM business rules. Accounts, Contacts, and CRM operations configuration remain authoritatively owned by `SPR-MOD-006-001` and are **consumed** here without redefinition. The commercial Customer master remains authoritatively owned by MOD-003 Sales.

#### 1.1.1 Lead Master Authority

The **Lead** master is authoritatively owned by MOD-006 CRM and originates in this sprint. No other module MAY create, edit, archive, or maintain a parallel Lead master. Downstream modules and downstream CRM sprints consume Lead master data via published events (`LeadCreated`) and read APIs; they MUST NOT redefine the Lead entity, its lifecycle, its scoring model, or its assignment rules.

#### 1.1.2 CRM Sprint Boundaries (Leads vs. Accounts/Contacts vs. Opportunities)

Ownership boundaries at this Sprint layer:

- **This sprint (`SPR-MOD-006-002`) owns** the Lead master, its lifecycle, lead scoring evaluation, assignment rule execution, and the lead-conversion action.
- **`SPR-MOD-006-001` owns** the Account and Contact masters and the CRM operations configuration namespace (pipeline stages, lead scoring model, assignment rules, communication templates). This sprint **consumes** those configuration entries and **MUST NOT** redefine them.
- **`SPR-MOD-006-003` owns** the Opportunity master and pipeline stage transitions. Lead conversion in this sprint produces the process handoff (a converted-lead record referenced by the downstream Opportunity creation flow); this sprint **MUST NOT** author an Opportunity entity, its lifecycle, its pipeline transitions, or its win/loss classification.
- **MOD-003 Sales owns** the commercial Customer master. Lead conversion in this sprint does **not** create a Customer record; any post-opportunity customer conversion is a downstream concern owned by `SPR-MOD-006-003` and MOD-003 Sales.
- **MOD-002 Accounting owns** financial standing; CRM does not represent financial standing here.

Ownership boundaries SHALL NOT be redefined in downstream CRM Sprint PRDs.

#### 1.1.3 CRM Configuration Consumption

Lead scoring model, assignment rules, and communication templates are resolved via `ENG-005` under the tenant/company hierarchy using the entries **registered by `SPR-MOD-006-001`**. This sprint **executes** those configurations — scores a lead against the model, resolves an owner via assignment rules, references communication templates from notifications — and MUST NOT register, redefine, or extend the configuration namespace.

#### 1.1.4 Single-Conversion Invariant

Per Module PRD §7 Business Rules, **a lead may be converted only once**. This sprint enforces the single-conversion invariant as a declarative rule via `ENG-012` on the conversion action; subsequent conversion attempts on a converted lead are rejected deterministically and audited.

#### 1.1.5 Single-Owner Assignment Invariant

Per Module PRD §7 Business Rules, **assignment rules must resolve to exactly one owner**. This sprint enforces the single-owner invariant as a declarative rule via `ENG-012` on assignment execution; a rule-set that resolves to zero or more-than-one owners is rejected deterministically and the failure is audited.

### 1.2 In Scope

- Lead master: capture, editing, qualification, disqualification, and archival under a tenant/company.
- Lead identifiers, lead classification (source, channel — as declared by CRM configuration), and lead ownership.
- Lead status lifecycle transitions: `New → Working → Qualified → Converted` and `New → Working → Disqualified`, plus archival from a terminal state.
- Lead scoring **evaluation** against the scoring model registered by `SPR-MOD-006-001` via `ENG-012` Rules, producing a deterministic score at capture time and on relevant updates.
- Assignment **execution** against the assignment rules registered by `SPR-MOD-006-001` via `ENG-012` Rules, resolving exactly one owner per lead.
- Lead-to-opportunity conversion action: enforces the single-conversion invariant, produces the converted-lead process handoff consumed by `SPR-MOD-006-003`, and emits the conversion audit event.
- Reassignment workflow via `ENG-010` where a lead is reassigned during its working lifecycle.
- Automated actions on lead capture (initial scoring, initial assignment, notification-to-owner via `ENG-025`) orchestrated by `ENG-013` Automation.
- Audit integration for every lead lifecycle transition via `ENG-004`.
- Events published (see §11): `LeadCreated` — delivered via `ENG-024`.
- Consumption of `account.created` / `account.updated` / `contact.created` / `contact.updated` (published by `SPR-MOD-006-001`) so leads captured against an existing account/contact stay reconciled.

### 1.3 Out of Scope

Reserved for other CRM sprints and other modules (see [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md)):

- Account, Contact, and CRM operations configuration authoring — owned by `SPR-MOD-006-001` (consumed here, not redefined).
- Opportunity master, opportunity lifecycle, pipeline stage transitions, win/loss classification, `OpportunityWon` / `OpportunityLost` events — owned by `SPR-MOD-006-003`.
- Activity, Meeting, and `ActivityLogged` events — owned by `SPR-MOD-006-004`.
- Campaign master, Segment master, Campaign Send transaction, `CampaignSent` events — owned by `SPR-MOD-006-005`.
- Customer 360 read model, CRM reports, dashboards, exports — owned by `SPR-MOD-006-006`.
- Customer master, sales quotations, sales orders, sales invoicing — owned by MOD-003 Sales.
- Accounting posting — owned by MOD-002 Accounting.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-006-002`, the following will exist:

- **Business capabilities.**
  - A CRM user can capture, edit, qualify, disqualify, and archive leads under a tenant/company.
  - Every captured lead is scored deterministically against the lead scoring model registered by `SPR-MOD-006-001`.
  - Every captured lead is assigned to exactly one owner via the assignment rules registered by `SPR-MOD-006-001`.
  - A qualified lead can be converted **once**, producing the converted-lead process handoff consumed by `SPR-MOD-006-003 Opportunities`.
  - Reassignment during the working lifecycle is supported via `ENG-010`.
- **Published events.** One CRM lead event contract (see §11) registered in the event catalog and emitted by the lead capture transition.
- **Configuration artifacts.** *None registered by this sprint.* All configuration (lead scoring model, assignment rules, communication templates, pipeline stages) is consumed from the namespace registered by `SPR-MOD-006-001` via `ENG-005`.
- **Audit artifacts.** An audit record exists for every lead lifecycle transition (create, update, score change, assignment change, qualify, disqualify, convert, archive), produced via `ENG-004`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-006-002`.
  - `LeadCreated` entry in the event catalog referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-006 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — Leads primitive on the revenue pipeline | Lead master and single-shot conversion handoff |
| §2 Business Scope — Lead capture and qualification; submodule Leads | Lead master lifecycle, scoring evaluation, assignment execution |
| §3 Personas — Sales Representative, Sales Manager, Marketing Manager | User stories (§4) |
| §4 Business Processes — Lead-to-opportunity | Conversion action producing the Opportunity handoff |
| §5 Master Data — Lead | Lead master and its lifecycle |
| §7 Business Rules — "A lead may be converted only once"; "Assignment rules must resolve to exactly one owner" | Single-conversion invariant (§1.1.4) and single-owner invariant (§1.1.5) |
| §8 Integration Points — `LeadCreated` (published) | Event contract (§11) |
| §10 Configuration — Lead scoring model, Assignment rules, Communication templates (registered by `SPR-MOD-006-001`) | Consumption via `ENG-005` at evaluation time |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved CRM Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Lead capture and qualification (§2) | `SPR-MOD-006-002` |

This allocation is unique (VAL-002, VAL-003); no other CRM sprint claims "Lead capture and qualification" as an originating capability. The **Leads** submodule is originating-allocated to this sprint per §4.2 of the Sprint Plan.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Lead capture and qualification* and submodule *Leads* → this Sprint PRD → deliverables in §2 (Lead master, lead scoring evaluation, assignment execution, conversion handoff, `LeadCreated` event, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.
- **Upstream sprint link:** every configuration consumed here (`Lead scoring model`, `Assignment rules`, `Communication templates`) traces to its registration in `SPR-MOD-006-001` §5.3.
- **Downstream sprint link:** the conversion handoff produced by §5.5 traces to `SPR-MOD-006-003` opportunity creation from a converted lead.

---

## 4. User Stories

- **US-001.** *As a Sales Representative, I want to capture a lead against an existing account and contact, so that follow-up activity is anchored to CRM master data.*
- **US-002.** *As a Sales Representative, I want the lead to be scored deterministically at capture and after significant updates, so that prioritization is repeatable.*
- **US-003.** *As a Sales Manager, I want each captured lead to resolve to exactly one owner via the assignment rules, so that accountability is unambiguous.*
- **US-004.** *As a Sales Representative, I want to qualify or disqualify a lead I own, so that only qualified leads progress toward conversion.*
- **US-005.** *As a Sales Manager, I want to convert a qualified lead into an opportunity handoff exactly once, so that downstream Opportunity creation is idempotent and the single-conversion rule holds.*
- **US-006.** *As a Sales Manager, I want to reassign a lead during its working lifecycle, so that ownership stays current when territories or workloads change.*
- **US-007.** *As the CRM module (system persona), I want to publish `LeadCreated` on capture, so that downstream sprints and modules can react in a decoupled way.*
- **US-008.** *As a security reviewer, I want every lead lifecycle transition to be audited via `ENG-004`, so that I can reconstruct lead history from an authoritative log.*
- **US-009.** *As the Leads submodule (system persona), I want to consume `account.*` / `contact.*` events from `SPR-MOD-006-001`, so that leads captured against an existing account/contact stay reconciled when that master data changes.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Lead capture (US-001, US-007)

- **Given** an active account and (optionally) an active contact under a tenant/company,
  **when** a Sales Representative submits a valid lead capture request,
  **then** the lead is persisted with a stable identifier, uniquely identified within the company, referenced to the account/contact, and `LeadCreated` is published via `ENG-024`.
- **Given** a lead capture request that references an archived account or archived contact,
  **when** it is submitted,
  **then** the request is rejected deterministically and no `LeadCreated` event is published.

### 5.2 Lead scoring evaluation (US-002)

- **Given** a valid lead capture request and a lead scoring model registered by `SPR-MOD-006-001` for the target (tenant, company),
  **when** the lead is captured,
  **then** a deterministic score is computed via `ENG-012` from the resolved model and persisted with the lead.
- **Given** a persisted lead whose scoring-relevant attributes change,
  **when** the update is applied,
  **then** the score is recomputed deterministically from the same resolved model and the score change is audited via `ENG-004`.
- **Given** no lead scoring model registered for the target (tenant, company),
  **when** a lead is captured,
  **then** the capture is rejected deterministically with an error attributing the missing configuration to `SPR-MOD-006-001` (this sprint MUST NOT invent a default model).

### 5.3 Single-owner assignment execution (US-003)

- **Given** a valid lead capture request and assignment rules registered by `SPR-MOD-006-001` for the target (tenant, company),
  **when** the lead is captured,
  **then** the assignment rules execute via `ENG-012` and resolve **exactly one** owner; the assignment is persisted and audited.
- **Given** an assignment rule-set that resolves to zero owners or more than one owner for a given lead,
  **when** assignment is attempted,
  **then** the capture is rejected deterministically, `LeadCreated` is not published, and the failure is audited (US-008 covers audit coverage).

### 5.4 Qualification (US-004)

- **Given** a lead in `Working` state owned by the requesting user,
  **when** a qualification decision is submitted,
  **then** the lead transitions to `Qualified` or `Disqualified` deterministically and the transition is audited via `ENG-004`.
- **Given** a lead not owned by the requesting user,
  **when** a qualification decision is submitted,
  **then** the request is rejected per authorization rules established by `ADR-032` and enforced by `ENG-002`.

### 5.5 Single-shot conversion (US-005)

- **Given** a lead in state `Qualified`,
  **when** a conversion action is submitted,
  **then** the lead transitions to `Converted`, a converted-lead process handoff record is produced (consumed by `SPR-MOD-006-003` for opportunity creation), and the conversion is audited via `ENG-004`.
- **Given** a lead already in state `Converted`,
  **when** any subsequent conversion action is submitted,
  **then** the request is rejected deterministically by the single-conversion invariant enforced via `ENG-012` (Module PRD §7), no second handoff is produced, and the rejection is audited.
- **Given** a lead in a non-`Qualified` state,
  **when** a conversion action is submitted,
  **then** the request is rejected deterministically per the lead lifecycle rules.

### 5.6 Reassignment (US-006)

- **Given** a lead in `New` or `Working` state,
  **when** a Sales Manager submits a reassignment request that resolves to exactly one new owner via the assignment rules (or by explicit override permitted by authorization policy),
  **then** ownership is updated deterministically, the transition is orchestrated via `ENG-010`, and the change is audited.
- **Given** a lead in `Qualified`, `Converted`, `Disqualified`, or `Archived` state,
  **when** a reassignment is attempted,
  **then** the request is rejected deterministically per the lead lifecycle rules.

### 5.7 Automation on capture (US-002, US-003, US-007)

- **Given** successful lead capture (§5.1),
  **when** the capture completes,
  **then** `ENG-013` Automation orchestrates initial scoring (§5.2), initial assignment (§5.3), and owner notification via `ENG-025` referencing a communication template registered by `SPR-MOD-006-001` (never redefined here).

### 5.8 Events published (US-007)

- **Given** a successful lead capture,
  **when** the capture transition completes,
  **then** `LeadCreated` is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog (§11) are used.

### 5.9 Account / Contact reconciliation consumption (US-009)

- **Given** an `account.updated` or `contact.updated` event published by `SPR-MOD-006-001` for a tenant/company visible to CRM,
  **when** the event is received,
  **then** any lead referencing the affected account/contact remains a valid reference, and reconciliation is audited via `ENG-004`.
- **Given** an `account.deactivated` event for an account with open leads,
  **when** the event is received,
  **then** deterministic handling per the lead lifecycle rules is applied (documented in §16) and audited; this sprint does not modify the Account entity.

### 5.10 Audit integration (US-008)

- **Given** any lead lifecycle transition (create, update, score change, assignment change, qualify, disqualify, convert, disallowed-second-convert, reassign, archive),
  **when** it completes or is rejected,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, decision, and timestamp.

### 5.11 Isolation invariants (`ADR-011`)

- **Given** any lead read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.12 Ownership consumption invariants

- **Given** any downstream module requiring lead data,
  **when** it reads or reacts to lead lifecycle,
  **then** it does so exclusively through CRM-owned events and read APIs. No downstream module creates an independent lead master.
- **Given** any code path in this sprint that requires Account, Contact, or CRM operations configuration,
  **when** it needs those entities or configuration values,
  **then** it consumes them from `SPR-MOD-006-001` via events and `ENG-005`; those entities and configuration entries are not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-006` — CRM.
- **Module PRD:** [`docs/20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md).
- **Upstream Sprint (mandatory):** [`SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md).
- **Module PRD sections fulfilled:** §1, §2 (Lead capture and qualification; submodule Leads), §3 (personas), §4 (Lead-to-opportunity), §5 (Lead), §7 (single-conversion rule; single-owner assignment rule), §8 (`LeadCreated` — published), §10 (Lead scoring model, Assignment rules, Communication templates — consumed), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-006` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
- **Upstream sprint dependencies (per Sprint Plan §2):** `SPR-MOD-006-001 CRM Foundation` — Account/Contact masters, CRM operations configuration namespace (lead scoring model, assignment rules, communication templates), `account.*`/`contact.*` events.
- **Cross-module consumption (events only):** none introduced by this sprint. Sales, Accounting, and Analytics remain downstream consumers via `LeadCreated`.
- **Downstream sprints:** `SPR-MOD-006-003` (Opportunities) — consumes the converted-lead process handoff produced by §5.5. `SPR-MOD-006-004` … `SPR-MOD-006-006` — consume Lead master via events and read APIs.

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at v1.1 (Active).

### 7.2 Upstream Sprint Dependency Status (per Pass 9.1.1 plan Precondition 6)

| Item | Value | Result |
| --- | --- | --- |
| File presence at registered path | [`SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md) | PASS |
| `lifecycle_state` | Authored (frontmatter `status: Draft`, registration `Authored`) | PASS |
| GT-003 validation (Pass 9.1.0) | 15/15 PASS — execution_id `GT003-MOD006-001-20260713-001` | PASS |
| Open corrective pass / unresolved audit finding | None | PASS |

Upstream dependency is fully satisfied — existence alone is not relied upon.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the CRM Ownership Convention inherited from `SPR-MOD-006-001` §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and is aligned with the Sprint Plan §SPR-MOD-006-002 Engines Consumed list.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every lead action per `ADR-032`. |
| `ENG-004` Audit | Records every lead lifecycle transition (accepted or rejected). |
| `ENG-010` Workflow | Orchestrates reassignment and qualification flows where a longer-running interaction is required. |
| `ENG-012` Rules | Evaluates lead scoring, executes assignment rules, and enforces the single-conversion and single-owner invariants declaratively. |
| `ENG-013` Automation | Orchestrates automated actions on lead capture (score → assign → notify) without redefining any of the underlying engines. |
| `ENG-024` Eventing | Publishes `LeadCreated` and consumes `account.*` / `contact.*` events published by `SPR-MOD-006-001`. |
| `ENG-025` Notification | Sends owner notifications on lead capture and reassignment using communication templates registered by `SPR-MOD-006-001`. |

CRM business semantics (lead master, lifecycle, scoring/assignment execution) are owned by this module and are not delegated to any engine. Configuration authoring (models, rules, templates) is not performed here — it is inherited from `SPR-MOD-006-001` via `ENG-005`.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15 and matches the Sprint Plan §SPR-MOD-006-002 ADR list.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every lead read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to lead capture, qualification, conversion, and reassignment. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Lead | MOD-006 (this sprint) | Prospective engagement captured against an account/contact, scored, assigned, qualified, and possibly converted. |
| Lead Score | MOD-006 (this sprint) | Deterministic scalar computed via `ENG-012` from the lead scoring model registered by `SPR-MOD-006-001`. |
| Lead Assignment | MOD-006 (this sprint) | Ownership binding of a lead to exactly one user resolved via `ENG-012` from the assignment rules registered by `SPR-MOD-006-001`. |
| Converted Lead Handoff | MOD-006 (this sprint, transient handoff) | Process-level record produced by the conversion action, consumed by `SPR-MOD-006-003` to create the Opportunity. Not a re-declaration of the Opportunity entity. |

### 10.2 Relationships

- A **company** owns zero or more **leads**.
- A **lead** references exactly one **account** (owned by `SPR-MOD-006-001`) and zero or one **contact** (owned by `SPR-MOD-006-001`).
- A **lead** has exactly one current **owner** (user, owned by MOD-001) resolved via lead assignment.
- A **lead** has at most one **converted lead handoff** (single-conversion invariant, §1.1.4).
- A **converted lead handoff** is consumed by **exactly one** Opportunity created in `SPR-MOD-006-003`; the Opportunity entity itself is not owned by this sprint.

### 10.3 Ownership Boundaries

- The Lead master, Lead Score, Lead Assignment, and Converted Lead Handoff are owned by `MOD-006` originating in this sprint per the CRM Ownership Convention.
- The Account and Contact entities remain owned by `SPR-MOD-006-001`; they are **referenced**, not redefined.
- The Opportunity entity remains owned by `SPR-MOD-006-003`; it is **handed off to**, not authored here.
- The commercial **Customer** entity is owned by MOD-003 Sales and is not touched by this sprint.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing. The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

### 11.1 Published

Event names are quoted **verbatim** from the CRM Module PRD §8 event union. No event name is invented by this execution pass.

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `LeadCreated` | MOD-006 | SPR-MOD-006-002 | MOD-006 (self, downstream sprints), MOD-003 (Sales), MOD-017 (Analytics) | At-least-once, ordered per tenant |

### 11.2 Consumed

| Event Name | Producing Module | Producing Sprint | Consumption Purpose |
| --- | --- | --- | --- |
| `account.created` | MOD-006 | `SPR-MOD-006-001` | Confirm account visibility before capturing a lead against it. |
| `account.updated` | MOD-006 | `SPR-MOD-006-001` | Keep lead references to the account consistent. |
| `account.deactivated` | MOD-006 | `SPR-MOD-006-001` | Apply deterministic lead-lifecycle handling for open leads on the account (§5.9). |
| `contact.created` | MOD-006 | `SPR-MOD-006-001` | Confirm contact visibility before capturing a lead against it. |
| `contact.updated` | MOD-006 | `SPR-MOD-006-001` | Keep lead references to the contact consistent. |

### 11.3 Not Emitted By This Sprint

The CRM Module PRD §8 event union additionally declares `OpportunityWon`, `OpportunityLost`, `CampaignSent`, and `ActivityLogged` as published events. **None** of these are emitted by this sprint; each is authored by its originating sprint per the Sprint Plan §4 forward map. The lead-to-opportunity handoff (§5.5) is a **process handoff record**, not an event; the Module PRD does not register a distinct lead-conversion event and no event is fabricated here.

Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

Event names in §11 are a subset of the Module PRD event union declared in [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md) §8 (`LeadCreated` published; `account.*`/`contact.*` consumed from `SPR-MOD-006-001`). Where authoring-time event names differ from the catalog registration, the catalog registration is authoritative; this Sprint MUST NOT redefine catalog names.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] `LeadCreated` is registered in the event catalog with its contract and is emitted on lead capture.
- [ ] Lead scoring evaluation resolves the model registered by `SPR-MOD-006-001` deterministically for every (tenant, company).
- [ ] Assignment execution resolves exactly one owner deterministically for every lead capture, or is rejected with a single-owner-invariant violation.
- [ ] Single-conversion invariant holds under concurrent conversion attempts on the same lead (verified via contract/integration tests).
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every lead read and write.
- [ ] Every lead lifecycle transition (accepted or rejected) produces an audit record via `ENG-004`.
- [ ] Consumption of `account.*` / `contact.*` events keeps lead references consistent (§5.9).
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-006_SPRINT_PLAN.md` §2 (`SPR-MOD-006-002`):

- Leads can be captured, scored, assigned, qualified, and converted (once).
- Assignment rules resolve to exactly one owner via `ENG-012`.
- `LeadCreated` events are published via `ENG-024`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** `SPR-MOD-006-001 CRM Foundation` MUST have registered the lead scoring model, assignment rules, and communication templates for the target (tenant, company) before this sprint can execute end-to-end.
  - **Impact:** Absent configuration produces deterministic rejections (§5.2, §5.3, §5.7) but blocks positive-path exercise of DoD.
  - **Mitigation:** Sequence delivery after `SPR-MOD-006-001` in the target environment; treat any configuration gap as an upstream defect for the Foundation sprint rather than a workaround in this sprint.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** The Module PRD §8 event union does not register a distinct lead-conversion event; the lead-to-opportunity link is a process handoff record consumed by `SPR-MOD-006-003`.
  - **Impact:** Downstream Opportunity creation depends on a stable handoff contract rather than a broadcast event.
  - **Mitigation:** Publish the handoff-record contract in this sprint and reference it from `SPR-MOD-006-003`; do not fabricate a lead-conversion event.
  - **Status:** Accepted

- **Risk ID:** R-03
  - **Description:** Concurrent conversion attempts on the same lead could race the single-conversion invariant if `ENG-012` enforcement is bypassed or duplicated in application code.
  - **Impact:** Two Opportunity handoffs from a single lead would violate Module PRD §7.
  - **Mitigation:** Enforce the invariant declaratively in `ENG-012` at the conversion action boundary; add contract/integration tests exercising concurrent conversion attempts.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** Assignment rules registered upstream may resolve to zero or more-than-one owner for edge-case leads.
  - **Impact:** Lead capture is rejected deterministically per §5.3, but repeated rejections would block real capture.
  - **Mitigation:** Surface single-owner-invariant failures with actionable audit context (US-008) so the upstream configuration can be corrected in `SPR-MOD-006-001`; do not soften the invariant here.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** `LeadCreated` relies on `ENG-024` delivery guarantees governed by the authoritative event catalog.
  - **Impact:** Weakened delivery guarantees at the engine or catalog level would break consumer contracts.
  - **Mitigation:** Consume `ENG-024` per the authoritative event catalog without redefining delivery semantics; escalate any weakening as an engine / catalog defect.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** `LeadCreated` — declared by Module PRD §8 — may not yet be registered in the authoritative event catalog at authoring time.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register via the event catalog governance process before this sprint enters `In Progress`; do not fabricate an alternate name.
  - **Status:** Deferred

- **Risk ID:** R-07
  - **Description:** Lead master ownership is exclusive to CRM originating in this sprint; the commercial Customer master remains exclusive to MOD-003 Sales.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Lead Master Authority convention (§1.1.1) and the CRM ↔ Sales Boundary inherited from `SPR-MOD-006-001` at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-08
  - **Description:** CRM operations configuration is registered upstream (`SPR-MOD-006-001`); a temptation exists to register additional configuration keys here (e.g., lead lifecycle transitions, notification cadences).
  - **Impact:** Configuration duplication or drift between sprints would break the CRM Configuration Authority convention.
  - **Mitigation:** Consume `ENG-005` for configuration values registered upstream; escalate genuinely new configuration needs to `SPR-MOD-006-001` as an upstream amendment rather than authoring here.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — lead validation, lifecycle transition rules, scoring evaluation determinism, single-conversion invariant, single-owner-invariant guard.
- **Integration** — audit emission via `ENG-004`, rules evaluation via `ENG-012`, workflow orchestration via `ENG-010`, automation orchestration via `ENG-013`, notifications via `ENG-025`, event publication via `ENG-024`, `account.*`/`contact.*` consumption reconciliation.
- **Contract** — `LeadCreated` contract against the event catalog; `account.*`/`contact.*` consumer contracts against the event catalog; converted-lead handoff record contract against `SPR-MOD-006-003`'s consumer expectations.
- **End-to-end (smoke)** — capture → score → assign → notify → qualify → convert (once) end-to-end under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation and the single-conversion invariant under concurrent load.

Sprint-specific fixtures: a lead-scoring-model fixture and an assignment-rules fixture reused from `SPR-MOD-006-001` (produced there, consumed here without redefinition).

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling the lead lifecycle as a small state machine so audit emission (§5.10) and event publication (§5.8) are trivially satisfiable at every accepted transition and rejected attempt.
- Consider enforcing the single-conversion invariant at the persistence boundary (e.g., a uniqueness guard on the converted-lead handoff record) so `ENG-012` and the storage layer agree.
- Consider co-locating capture-time automation (score → assign → notify) inside a single `ENG-013` orchestration so partial success (scored but unassigned) is impossible.
- On `account.deactivated`, consider a policy that transitions open leads on the account to `Disqualified` with a system-generated reason, and audits the transition; the exact policy is a business decision to be confirmed with product ownership before implementation.
- Consider a small idempotency ledger keyed by (tenant, company, external_lead_reference) for inbound lead captures from campaigns and integrations, so re-plays are safe.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-006-002`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver Lead capture and qualification — lead master, scoring evaluation, assignment execution, and single-shot conversion handoff (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-006 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the CRM Ownership Convention (inherited from `SPR-MOD-006-001`) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates Accounts/Contacts/configuration (owned by `SPR-MOD-006-001`), Opportunities, Activities, Campaigns, Customer 360, and cross-module Sales/Accounting scope, each linked to its owning sprint or upstream module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-006-003`) begin immediately after this one completes?**
   Yes. `SPR-MOD-006-003 Opportunities` is the immediate successor per [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) §2 and depends on both `SPR-MOD-006-001` and this sprint.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md)
- Upstream Sprint (mandatory) — [`./SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Downstream Sprint (consumer of §5.5 handoff) — `SPR-MOD-006-003` (Opportunities, planned)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Governance Framework Release — [`../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md`](../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- Authoring Template — [`../../15-governance/templates/GT-003_SPRINT_AUTHORING.md`](../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
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
| Target Artifact | `docs/30-sprint-prds/crm/SPR-MOD-006-002-leads.md` |
| Verification Pass | 9.1.1 (GT-003 execution for SPR-MOD-006-002) |
| Verification Date | 2026-07-13 |
| Verifier | Lovable (Governance Framework v1.0) |
| Authoritative Sources Checked | GT-003 v1.0, GT-005 v1.0, Governance Template Dependency Matrix v1.0.2, Capabilities Registry v1.1, CRM Module PRD, `MOD-006_SPRINT_PLAN.md`, `SPR-MOD-006-001-crm-foundation.md` |
| Execution ID | `GT003-MOD006-002-20260713-001` |
| Parent Execution ID | `GT003-MOD006-001-20260713-001` |

### Validation Table

| ID | Check | Result | Action |
|---|---|---|---|
| VAL-001 | Sprint ID `SPR-MOD-006-002` unique across repository. | PASS | — |
| VAL-002 | Originating capability "Lead capture and qualification" exists in Module PRD Capability Allocation Matrix (Sprint Plan §4.1). | PASS | — |
| VAL-003 | Capability allocated to exactly one sprint (`SPR-MOD-006-002`); exclusivity holds. | PASS | — |
| VAL-004 | Engines `ENG-002, 004, 010, 012, 013, 024, 025` ⊆ Module PRD engine union (§12) and match Sprint Plan §SPR-MOD-006-002 Engines Consumed. | PASS | — |
| VAL-005 | ADRs `ADR-011, ADR-014, ADR-032` ⊆ Module PRD ADR union and match Sprint Plan §SPR-MOD-006-002 ADRs Consumed. | PASS | — |
| VAL-006 | Events (published `LeadCreated`; consumed `account.*`/`contact.*`) ⊆ Module PRD event union (§8) or authoritative CRM event surface published by `SPR-MOD-006-001`. Every event name resolved verbatim; none invented. | PASS | — |
| VAL-007 | Acceptance criteria complete (non-empty, testable). | PASS | — |
| VAL-008 | Deliverables complete (§2). | PASS | — |
| VAL-009 | Registration surfaces updated (README, Sprint Catalog, `DOCUMENT_INDEX`, `_meta.json`). | PASS | — |
| VAL-010 | Bidirectional traceability holds (capability ↔ sprint ↔ deliverable; upstream link to `SPR-MOD-006-001`; downstream link to `SPR-MOD-006-003`) — see §3.2. | PASS | — |
| VAL-011 | No unresolved placeholders (`<...>` occurrence count = 0 in body). | PASS | — |
| VAL-012 | Frontmatter metadata valid (all required keys present; `depends_on: [SPR-MOD-006-001]` recorded). | PASS | — |
| VAL-013A | Template dependencies satisfied — GT-003 v1.0 Active; GT-002/GT-001 Active; Capabilities Registry v1.1 Active. | PASS | — |
| VAL-013B | Upstream sprint dependency fully satisfied — `SPR-MOD-006-001` present, `lifecycle_state = Authored`, GT-003 validation PASS in Pass 9.1.0, no open corrective pass. See §7.2. | PASS | — |
| VAL-014 | Repository consistency — path matches `docs/30-sprint-prds/crm/SPR-MOD-006-002-leads.md`. | PASS | — |

### Verification Summary

| Field | Value |
| --- | --- |
| Checklist Items | 15 |
| Passed | 15 |
| Remediated | 0 |
| Failed | 0 |
| Outstanding Risks | R-01, R-02, R-03, R-04, R-05, R-06, R-07, R-08, R-EV-01 (all recorded in §14; none blocking) |
| Repository Status | READY |
| Next Pass | 9.1.2 — Execute GT-003 for `SPR-MOD-006-003` (Opportunities) via the reusable Execution Wrapper |

**Result:** 15/15 PASS. Repository status: READY. Confidence: MEDIUM (D3 waiver — no repository revision identifier available in sandboxed environment; inherited from Pass 9.1.0).

**GT-005 Repository Audit (audit_profiles = governance, repository, registration, traceability, integrity):** PASS. Governance assets unchanged; all four registration surfaces updated in this pass (README, `SPRINT_CATALOG.md`, `DOCUMENT_INDEX.md`, `_meta.json`); bidirectional traceability holds; no orphan references introduced; upstream dependency status verified beyond mere existence per Pass 9.1.1 v2 plan Precondition 6.
