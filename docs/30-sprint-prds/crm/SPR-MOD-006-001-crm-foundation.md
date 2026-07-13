---
title: "SPR-MOD-006-001 — CRM Foundation"
summary: "Sprint PRD for the foundational CRM layer of MOD-006 CRM: account master, contact master, CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates), and the Accounts & Contacts submodule surface. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Revenue"
status: "Draft"
updated: "2026-07-13"
sprint_id: "SPR-MOD-006-001"
parent_module: "MOD-006"
parent_sprint_plan: "MOD-006_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "9.1.0"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-012", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "crm", "mod-006", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD006-001-20260713-001"
---

# SPR-MOD-006-001 — CRM Foundation

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-006 CRM** under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-006-001` (permanent) |
| Parent Module | `MOD-006` — CRM |
| Parent Sprint Plan | [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-006-002` … `SPR-MOD-006-006` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **CRM Foundation** for BusinessOS: the account master and its lifecycle, the contact master and its lifecycle, account/contact classification, CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates), and audit integration for CRM-foundation lifecycle events. This foundation is the substrate on which every subsequent CRM sprint — Leads, Opportunities, Activities, Campaigns, and Customer 360 & Analytics — depends.

> **CRM Ownership Convention.** The CRM module owns the business semantics of the Account master, the Contact master, account/contact classification, and CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, rules, document, attachment, eventing) but **MUST NOT** redefine CRM business rules. This complements — and does not redefine — the governance conventions established in `MOD001_PLATFORM_BASELINE_v1`, and the Sales ownership conventions established in `MOD003_SALES_BASELINE_v1` for the commercial Customer master.

#### 1.1.1 Account and Contact Master Authority

The **Account** and **Contact** masters are authoritatively owned by MOD-006 CRM. No other module MAY create, edit, archive, or independently maintain a parallel Account or Contact master. Downstream modules consume Account/Contact master data via published events and read APIs; they MUST NOT redefine those entities, their lifecycles, or their classifications.

#### 1.1.2 CRM ↔ Sales Boundary (Account vs. Customer)

Ownership boundaries at the CRM Foundation layer:

- **CRM owns** the pre-conversion commercial relationship surface: the **Account** (a prospective or existing commercial party for engagement, engagement history, and opportunity progression) and its **Contacts**.
- **Sales (MOD-003) owns** the commercial **Customer** master (the party to whom quotations, orders, invoices, and receivables belong).
- An Account MAY reference a Sales-owned Customer once a commercial relationship exists; the Customer entity itself is **not** redefined in this sprint. Consumption of `CustomerCreated` (published by MOD-003) is the mechanism by which CRM records seed or reconcile Account records; ownership of the Customer entity remains with MOD-003.
- **Accounting (MOD-002) owns** financial standing (receivables, credit exposure, dunning). CRM does not represent financial standing as a CRM-owned entity.

Ownership boundaries SHALL NOT be redefined in downstream CRM Sprint PRDs.

#### 1.1.3 CRM Configuration Authority

CRM operations configuration — pipeline stages, lead scoring model, assignment rules, and communication templates — is resolved via `ENG-005` under the tenant/company hierarchy established by the Platform baseline. No module-specific configuration keys are registered outside CRM's own ownership boundary. Configuration **consumption** by downstream CRM sprints (Leads, Opportunities, Campaigns) uses these registrations without redefining them.

#### 1.1.4 Account and Contact Lifecycle Boundary

CRM owns the account lifecycle (create, activate, deactivate, archive) and contact lifecycle (create, activate, deactivate, archive), plus the classification taxonomies applied to them. Downstream sprints (Leads, Opportunities, Activities, Campaigns) consume these entities without redefining their lifecycle.

### 1.2 In Scope

- Account master: creation, editing, archival; account identifiers; account classification (industry, segment, tier as declared by CRM configuration).
- Account hierarchy: parent/child account relationships within a company (acyclic).
- Contact master: creation, editing, archival against an account; contact identifiers; contact classification.
- Account status and Contact status lifecycle transitions: `Draft → Active → Inactive → Archived`.
- CRM operations configuration resolved via `ENG-005`:
  - Pipeline stages (referenced by `SPR-MOD-006-003 Opportunities`).
  - Lead scoring model (referenced by `SPR-MOD-006-002 Leads`).
  - Assignment rules (referenced by `SPR-MOD-006-002 Leads` and later CRM sprints).
  - Communication templates (referenced by `SPR-MOD-006-004 Activities` and `SPR-MOD-006-005 Campaigns`).
- Account and Contact validation invariants (uniqueness, referential integrity, tenancy).
- Account-attached documents and attachments surface via `ENG-007` and `ENG-008` (business categories only; document types are declared by later CRM sprints where they add semantics).
- Audit integration for every CRM-foundation lifecycle transition via `ENG-004`.
- Events published (see §11): `account.created`, `account.updated`, `account.activated`, `account.deactivated`, `contact.created`, `contact.updated` — delivered via `ENG-024`.
- Consumption of `CustomerCreated` (published by MOD-003 Sales) to seed or reconcile Account records against Sales-owned Customer master data.

### 1.3 Out of Scope

Reserved for later CRM sprints (see [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md)):

- Lead master, lead capture and qualification, lead scoring **evaluation**, lead-to-opportunity conversion — `SPR-MOD-006-002`.
- Opportunity master, pipeline stage transitions, win/loss classification — `SPR-MOD-006-003`.
- Activity and Meeting transactions, activity assignment, activity logging surface — `SPR-MOD-006-004`.
- Campaign master, Segment master, Campaign Send transaction, consent enforcement — `SPR-MOD-006-005`.
- Customer 360 read model, CRM reports, dashboards, exports, audit-readiness surface, AI copilot integration — `SPR-MOD-006-006`.
- Customer master and any accounting posting — owned by MOD-003 Sales and MOD-002 Accounting respectively; consumed via events and read APIs.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-006-001`, the following will exist:

- **Business capabilities.**
  - A CRM administrator can create, edit, and archive accounts under a tenant/company, with a coherent account hierarchy and classification.
  - Contacts can be created, edited, and archived against an active account.
  - CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates) is registered and resolves deterministically per company through `ENG-005`.
  - `CustomerCreated` events are consumed to seed / reconcile account records against Sales-owned Customer master data.
- **Published events.** Six CRM-foundation event contracts (see §11) registered in the event catalog and emitted by the corresponding lifecycle transitions.
- **Configuration artifacts.** CRM configuration namespace initialized for each company via `ENG-005`. No module-specific keys are registered outside CRM's own ownership boundary.
- **Audit artifacts.** An audit record exists for every CRM-foundation lifecycle transition, produced via `ENG-004`, consumable by the Platform audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-006-001`.
  - CRM-foundation event entries in the event catalog referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-006 MODULE_PRD Section | Delivered By |
| --- | --- |
| §1 Overview — CRM primitives and personas | Account/Contact master and CRM Ownership Convention |
| §2 Business Scope — Account and contact management; submodule Accounts & Contacts | Account master, account hierarchy, contact master |
| §3 Personas — Sales Representative, Sales Manager, Marketing Manager | User stories (§4) |
| §5 Master Data — Account, Contact | Account, account hierarchy, contact, classification |
| §7 Business Rules — CRM foundation invariants | Enforceable classification, tenancy, and lifecycle invariants |
| §8 Integration Points — `CustomerCreated` (consumed) | Consumption contract via `ENG-024` |
| §10 Configuration — Pipeline stages, Lead scoring model, Assignment rules, Communication templates | CRM configuration namespace via `ENG-005` |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |
| §13 Dependencies | Dependencies (§7) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here. **No capability introduced in this Sprint PRD is outside the approved CRM Module PRD.**

### 3.1 Capability Allocation Compliance

The Module PRD Capability Allocation Matrix in [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) §4.1 allocates the following capability to this sprint as its originating sprint:

| Capability | Origin Sprint |
| --- | --- |
| Account and contact management (§2) | `SPR-MOD-006-001` |

This allocation is unique (VAL-002, VAL-003); no other CRM sprint claims "Account and contact management" as an originating capability.

### 3.2 Bidirectional Traceability

- **Forward:** Module PRD §2 capability *Account and contact management* and submodule *Accounts & Contacts* → this Sprint PRD → deliverables in §2 (Account master, Contact master, CRM configuration namespace, six foundation events, audit records).
- **Reverse:** every deliverable in §2 traces back to a Module PRD section listed in §3, and every acceptance criterion in §5 traces to a user story in §4 and a Module PRD section in §3.

---

## 4. User Stories

- **US-001.** *As a CRM administrator, I want to create, edit, and archive accounts under a company, so that a coherent account master exists before any lead or opportunity is created.*
- **US-002.** *As a CRM administrator, I want to classify accounts (industry, segment, tier) and organize them into a parent/child hierarchy, so that downstream CRM sprints can rely on deterministic classifications.*
- **US-003.** *As a CRM administrator, I want to create, edit, and archive contacts against an active account, so that engagement is anchored on named people.*
- **US-004.** *As a CRM administrator, I want to register CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates) per company, so that later CRM sprints resolve their configuration deterministically.*
- **US-005.** *As a downstream sprint (system persona), I want to receive `account.*` and `contact.*` events, so that I can react to CRM-foundation transitions in a decoupled way.*
- **US-006.** *As the CRM module (system persona), I want to consume `CustomerCreated` events from MOD-003 Sales, so that I can seed or reconcile account records against the Sales-owned Customer master without redefining that entity.*
- **US-007.** *As a security reviewer, I want every CRM-foundation lifecycle transition to be audited via `ENG-004`, so that I can reconstruct account and contact history from an authoritative log.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Account master (US-001, US-002)

- **Given** a valid account creation request under a tenant/company,
  **when** a CRM admin submits it,
  **then** the account is persisted with a stable identifier and its identifiers are unique within the company.
- **Given** a valid account update that maintains referential integrity,
  **when** a CRM admin submits it,
  **then** the update is persisted and audited.
- **Given** a valid parent/child account relationship within the same company,
  **when** a CRM admin submits it,
  **then** the hierarchy is persisted deterministically without creating cycles.
- **Given** an account with dependent CRM references (created in later sprints),
  **when** archival is attempted,
  **then** archival is either permitted with a clean lifecycle transition or rejected deterministically per the account lifecycle rules established here.

### 5.2 Contact master (US-003)

- **Given** a valid contact creation request against an active account,
  **when** a CRM admin submits it,
  **then** the contact is persisted, uniquely identified within the account, and audited.
- **Given** an attempt to attach a contact to an archived account,
  **when** the request is submitted,
  **then** the request is rejected deterministically.

### 5.3 CRM operations configuration (US-004)

- **Given** a company under an active tenant,
  **when** pipeline stages, a lead scoring model, assignment rules, and communication templates are registered,
  **then** each resolves deterministically for that company through `ENG-005` under the configuration hierarchy established by the Platform baseline.
- **Given** a downstream sprint querying a configuration key registered by this sprint,
  **when** it queries the key by identifier,
  **then** it receives the deterministic value resolved for its (tenant, company) scope; **evaluation semantics** (scoring, assignment) remain out of scope here and are delivered by later CRM sprints.

### 5.4 Events published (US-005)

- **Given** a CRM-foundation lifecycle transition listed in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to the contract in the event catalog. Only event names present in the authoritative event catalog are used.

### 5.5 `CustomerCreated` consumption (US-006)

- **Given** a `CustomerCreated` event published by MOD-003 Sales for a tenant/company visible to CRM,
  **when** it is received,
  **then** CRM seeds or reconciles the corresponding account record without redefining the Customer entity, and the reconciliation is audited via `ENG-004`.

### 5.6 Audit integration (US-007)

- **Given** any CRM-foundation lifecycle transition (account / contact / configuration create, update, activate, deactivate, archive),
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, entity identifier, transition type, and timestamp.

### 5.7 Isolation invariants (`ADR-011`)

- **Given** any CRM-foundation read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope; no cross-tenant read or write can succeed.

### 5.8 Ownership consumption invariants

- **Given** any downstream module requiring account or contact data,
  **when** it reads or reacts to account/contact lifecycle,
  **then** it does so exclusively through CRM-owned events and read APIs. No downstream module creates an independent account or contact master.
- **Given** any CRM code path that requires Customer data,
  **when** it needs the commercial Customer,
  **then** it consumes it from MOD-003 Sales via events and read APIs; the Customer entity is not redefined here.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-006` — CRM.
- **Module PRD:** [`docs/20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §1, §2 (Account and contact management; submodule Accounts & Contacts), §3 (Sales Representative, Sales Manager, Marketing Manager), §5 (Account, Contact), §7 (foundation invariants), §8 (`CustomerCreated` — consumed), §10 (Pipeline stages, Lead scoring model, Assignment rules, Communication templates), §12 (Engine consumption), §13 (Dependencies). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-006` MODULE_PRD.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, audit review.
- **Upstream sprint dependencies (per Sprint Plan §2):** None (CRM sprint 1). Depends on the frozen `MOD001_PLATFORM_BASELINE_v1`.
- **Cross-module consumption (events only):** `CustomerCreated` published by MOD-003 Sales via `SPR-MOD-003-001 Sales Foundation`. No direct code coupling; consumption occurs through `ENG-024` per the authoritative event catalog.
- **Downstream sprints:** `SPR-MOD-006-002` (Leads), `SPR-MOD-006-003` (Opportunities), `SPR-MOD-006-004` (Activities), `SPR-MOD-006-005` (Campaigns), `SPR-MOD-006-006` (Customer 360 & Analytics) — per [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at v1.1 (Active).

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the CRM Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the CRM-administrator identity used for foundation lifecycle actions. |
| `ENG-002` Authorization | Enforces authorization on CRM-foundation actions. |
| `ENG-003` Permission Management | Registers CRM-foundation permissions for RBAC + ABAC evaluation. |
| `ENG-004` Audit | Records every CRM-foundation lifecycle transition. |
| `ENG-005` Configuration | Resolves CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates) under the tenant/company hierarchy established by the Platform baseline. |
| `ENG-006` Localization | Resolves locale-scoped labels for account, contact, and communication template content where applicable. |
| `ENG-007` Document | Backs account/contact documents surface where applicable. |
| `ENG-008` Attachment | Backs account/contact attachments surface where applicable. |
| `ENG-012` Rules | Registers structural validation rules for account, contact, hierarchy, and configuration; **evaluation** semantics for scoring and assignment are consumed by later CRM sprints. |
| `ENG-024` Eventing | Publishes CRM-foundation events with the contracts declared in §11 and consumes `CustomerCreated`. |

CRM business semantics (account master, hierarchy, classification, contact master, CRM configuration namespace) are owned by this module and are not delegated to any engine.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD §14/§15.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every CRM-foundation read and write. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to CRM-foundation actions. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Eventing.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Account | MOD-006 (this sprint) | Prospective or existing commercial party managed by CRM. |
| Account Classification | MOD-006 (this sprint) | Taxonomy (industry, segment, tier) applied to accounts. |
| Contact | MOD-006 (this sprint) | Named contact person on an account. |
| CRM Configuration | MOD-006 (this sprint, configuration-scoped) | CRM operations configuration namespace per company resolved via `ENG-005` (pipeline stages, lead scoring model, assignment rules, communication templates). |

### 10.2 Relationships

- A **company** (owned by MOD-001 per baseline) owns zero or more **accounts** and one **CRM configuration** namespace.
- An **account** MAY have a parent account within the same company (acyclic hierarchy) and belongs to zero or one **account classification** per classification axis.
- An **account** owns zero or more **contacts**.
- A **CRM configuration** belongs to exactly one company.
- An **account** MAY reference a Sales-owned Customer once a commercial relationship exists; the Customer entity is not represented as a CRM-owned entity here.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-006` per the CRM Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- The commercial **Customer** entity is owned by MOD-003 Sales and is consumed via events; it is not a CRM-owned entity.
- Financial standing of an account is consumed from Accounting; it is not represented as a CRM-owned entity.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Eventing. The Event Ownership Convention established by MOD-001 applies: each event is owned by the module that first publishes it, and consumer lists reflect known consumers at authoring time.

### 11.1 Published

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `account.created` | MOD-006 | SPR-MOD-006-001 | MOD-006 (self), MOD-003 (Sales), MOD-017 (Analytics) | At-least-once, ordered per tenant |
| `account.updated` | MOD-006 | SPR-MOD-006-001 | MOD-006 (self), MOD-003, MOD-017 | At-least-once, ordered per tenant |
| `account.activated` | MOD-006 | SPR-MOD-006-001 | MOD-006 (self), MOD-003, MOD-017 | At-least-once, ordered per tenant |
| `account.deactivated` | MOD-006 | SPR-MOD-006-001 | MOD-006 (self), MOD-003, MOD-017 | At-least-once, ordered per tenant |
| `contact.created` | MOD-006 | SPR-MOD-006-001 | MOD-006 (self), MOD-003, MOD-017 | At-least-once, ordered per tenant |
| `contact.updated` | MOD-006 | SPR-MOD-006-001 | MOD-006 (self), MOD-003, MOD-017 | At-least-once, ordered per tenant |

### 11.2 Consumed

| Event Name | Producing Module | Producing Sprint | Consumption Purpose |
| --- | --- | --- | --- |
| `CustomerCreated` | MOD-003 Sales | `SPR-MOD-003-001` | Seed or reconcile CRM account records against the Sales-owned Customer master. |

Payload contracts are described in the event catalog; this PRD does not redefine them. Any event name not present in the authoritative event catalog at authoring time is mapped to an authoritative equivalent or recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.

Event names in §11 are a subset of the Module PRD event union declared in [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md) §8 (`CustomerCreated` consumed; `account.*`/`contact.*` originate from this Sprint's foundation surface, which the Module PRD frames as the Accounts & Contacts submodule under §2 / §5). Where authoring-time event names differ from the catalog registration, the catalog registration is authoritative; this Sprint MUST NOT redefine catalog names.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] CRM-foundation events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] `CustomerCreated` consumption path is exercised end-to-end (produce → consume → reconcile → audit).
- [ ] Tenant isolation invariants (`ADR-011`) are enforced on every CRM-foundation read and write.
- [ ] Every CRM-foundation lifecycle transition produces an audit record via `ENG-004`.
- [ ] CRM configuration namespace is initialized per company via `ENG-005` (pipeline stages, lead scoring model, assignment rules, communication templates).
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-006_SPRINT_PLAN.md` §2 (`SPR-MOD-006-001`):

- Accounts and contacts can be created, edited, and archived under a tenant/company.
- CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates) resolves deterministically through `ENG-005`.
- `CustomerCreated` events are consumed to seed account/contact records.
- All structural changes are audited via `ENG-004`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

Each risk uses the reusable five-field shape: **Risk ID**, **Description**, **Impact**, **Mitigation**, **Status**.

- **Risk ID:** R-01
  - **Description:** MOD-006 depends on `MOD001_PLATFORM_BASELINE_v1` being frozen and available for tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, localization, and audit review.
  - **Impact:** Any regression against the Platform baseline blocks this sprint.
  - **Mitigation:** Rely on the frozen `MOD001_PLATFORM_BASELINE_v1` contract; treat any regression as a baseline defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** `CustomerCreated` is published by MOD-003 Sales. If Sales has not yet delivered `SPR-MOD-003-001` in the target environment, consumption cannot be exercised end-to-end.
  - **Impact:** DoD item covering `CustomerCreated` consumption cannot be satisfied.
  - **Mitigation:** Sequence delivery of `SPR-MOD-006-001` after `SPR-MOD-003-001` where possible; otherwise stand up a contract-level fixture emitting the authoritative event contract until Sales delivery lands.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Later CRM sprints (`SPR-MOD-006-002` … `SPR-MOD-006-006`) are deferred; scope-creep back into this sprint would dilute the Foundation.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to downstream sprints.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-014`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** CRM-foundation events rely on `ENG-024` delivery guarantees governed by the authoritative event catalog.
  - **Impact:** Weakened delivery guarantees at the engine or catalog level would break consumer contracts.
  - **Mitigation:** Consume `ENG-024` per the authoritative event catalog without redefining delivery semantics; escalate any weakening as an engine / catalog defect.
  - **Status:** Open

- **Risk ID:** R-EV-01
  - **Description:** Any event name declared in §11 that is not yet present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before implementation, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Map to an authoritative equivalent where one exists; otherwise register via the event catalog governance process before `SPR-MOD-006-002` (Leads) begins.
  - **Status:** Deferred

- **Risk ID:** R-06
  - **Description:** Account and Contact master ownership is exclusive to CRM; the commercial Customer master remains exclusive to MOD-003 Sales.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Account/Contact Master Authority convention (§1.1.1) and the CRM ↔ Sales Boundary (§1.1.2) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-07
  - **Description:** CRM configuration registration in scope here; **evaluation** semantics (lead scoring evaluation, assignment execution, communication template rendering) are in scope of downstream CRM sprints.
  - **Impact:** Loose registration semantics would leak evaluation responsibilities into this sprint.
  - **Mitigation:** Register configuration deterministically via `ENG-005`; do not expose evaluation paths in this sprint.
  - **Status:** Accepted

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — account, account hierarchy, contact validation; classification invariants; CRM configuration resolution rules.
- **Integration** — audit emission via `ENG-004`, configuration resolution via `ENG-005`, event publication via `ENG-024`, `CustomerCreated` consumption reconciliation.
- **Contract** — CRM-foundation event contracts (`account.*`, `contact.*`) and `CustomerCreated` consumer contract against the event catalog.
- **End-to-end (smoke)** — account creation, hierarchy assignment, contact creation, and configuration resolution under a two-tenant / two-company smoke fixture to verify `ADR-011` isolation.

Sprint-specific fixtures: a two-company smoke fixture and a `CustomerCreated` producer fixture (until MOD-003 `SPR-MOD-003-001` lands in the target environment).

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling account lifecycle as a small state machine so audit emission (§5.6) and event publication (§5.4) are trivially satisfiable at every transition.
- Consider validating hierarchy-acyclicity and tenancy at the earliest boundary (input validation layer) so downstream sprints inherit the guarantee without additional code.
- Consider co-locating CRM configuration initialization with company activation events emitted by MOD-001 so the CRM configuration namespace is ready before the first account action.
- Consider registering pipeline stages, lead scoring model, assignment rules, and communication templates upfront in this sprint (even though only downstream sprints consume them) so configuration readiness is deterministic.
- Consider a small `CustomerCreated` reconciliation ledger keyed by (tenant, company, customer_id) so downstream re-plays are idempotent.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

Reusable self-validation block applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-006-001`.

1. **Does the sprint have exactly one objective?**
   Yes. Establish the CRM Foundation — account master, contact master, CRM operations configuration, audit and events (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix and §3.2 bidirectional traceability; every feature is tied to a MOD-006 MODULE_PRD section. No orphan requirements.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly under the CRM Ownership Convention (§1.1) with "consumed, not redefined" language.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates leads, opportunities, activities, campaigns, Customer 360, and cross-module Sales/Accounting scope, each linked to its owning sprint or upstream baseline.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables), §12 (DoD), and §13 (Exit Criteria) are distinct.
7. **Does the next reserved sprint (`SPR-MOD-006-002`) begin immediately after this one completes?**
   Yes. `SPR-MOD-006-002 Leads` is the immediate successor per [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md) §2 and depends only on `SPR-MOD-006-001`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md)
- Upstream Module Baseline — [`../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md)
- Cross-module Producer Sprint — [`../sales/SPR-MOD-003-001-sales-foundation.md`](../sales/SPR-MOD-003-001-sales-foundation.md) (`CustomerCreated`)
- Precedent Foundation Sprint PRDs — [`../sales/SPR-MOD-003-001-sales-foundation.md`](../sales/SPR-MOD-003-001-sales-foundation.md), [`../purchase/SPR-MOD-004-001-purchase-foundation.md`](../purchase/SPR-MOD-004-001-purchase-foundation.md)
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

| ID | Check | Result |
|---|---|---|
| VAL-001 | Sprint ID `SPR-MOD-006-001` unique across repository. | PASS |
| VAL-002 | Originating capability "Account and contact management" exists in Module PRD Capability Allocation Matrix (Sprint Plan §4.1). | PASS |
| VAL-003 | Capability allocated to exactly one sprint (`SPR-MOD-006-001`); exclusivity holds. | PASS |
| VAL-004 | Engines `ENG-001, 002, 003, 004, 005, 006, 007, 008, 012, 024` ⊆ Module PRD engine union (§12). | PASS |
| VAL-005 | ADRs `ADR-011, ADR-014, ADR-032` ⊆ Module PRD ADR union. | PASS |
| VAL-006 | Events (published `account.*`/`contact.*`, consumed `CustomerCreated`) ⊆ Module PRD event union (§8) or authoritative event catalog. | PASS |
| VAL-007 | Acceptance criteria complete (non-empty, testable). | PASS |
| VAL-008 | Deliverables complete (§2). | PASS |
| VAL-009 | Registration surfaces updated (README, Sprint Catalog, `DOCUMENT_INDEX`, `_meta.json`). | PASS |
| VAL-010 | Bidirectional traceability holds (capability ↔ sprint ↔ deliverable) — see §3.2. | PASS |
| VAL-011 | No unresolved placeholders (`<...>` occurrence count = 0). | PASS |
| VAL-012 | Frontmatter metadata valid (all required keys present; types correct). | PASS |
| VAL-013A | Template dependencies satisfied — GT-003 v1.0 Active; GT-002/GT-001 Active. | PASS |
| VAL-013B | Upstream sprint dependencies satisfied — none required (CRM Sprint 1). | PASS |
| VAL-014 | Repository consistency — path matches `docs/30-sprint-prds/crm/SPR-MOD-006-001-crm-foundation.md`. | PASS |

**Result:** 15/15 PASS. Repository status: READY. Confidence: MEDIUM (D3 waiver — no repository revision identifier available in sandboxed environment).

**GT-005 Repository Audit (audit_profiles = registration, traceability):** PASS. All four registration surfaces updated in this pass; bidirectional traceability holds; no orphan references introduced.
