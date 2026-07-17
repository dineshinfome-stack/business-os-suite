---
title: "SPR-MOD-016-004 — Knowledge Base, Macros & CSAT"
summary: "Sprint PRD for the Knowledge capture and CSAT loop slices of MOD-016: Knowledge Article master with review-before-publish rule and Internal/Customer-visible visibility, Macro authority applying approved templates to Service Tickets without mutating history, CSAT Survey and Response transactions with single-response enforcement, and publication of KnowledgeArticlePublished / MacroExecuted / CSATSurveySent / CSATResponseReceived. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Service"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-016-004"
parent_module: "MOD-016"
parent_sprint_plan: "MOD-016_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "18.0.4"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-020", "ENG-024", "ENG-025", "ENG-028"]
related_adrs: ["ADR-011", "ADR-032"]
tags: ["sprint", "prd", "service-desk", "mod-016", "knowledge-base", "macros", "csat", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD016-004-20260717T100000Z-001"
parent_result_id: "GT003-MOD016-003-20260717T090000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-016-004 — Knowledge Base, Macros & CSAT

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-016 Service Desk** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-016-004` (permanent) |
| Parent Module | `MOD-016` — Service Desk |
| Parent Sprint Plan | [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md) |
| Upstream Sprints | [`SPR-MOD-016-001`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md), [`SPR-MOD-016-002`](./SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md), [`SPR-MOD-016-003`](./SPR-MOD-016-003_SLA_ENFORCEMENT_AND_ESCALATIONS.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Baselines | [`MOD001_PLATFORM_BASELINE_v1`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen), [`MOD006_CRM_BASELINE_v1`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) |
| Downstream Sprints | `SPR-MOD-016-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the **Knowledge capture** and **CSAT loop** capability substrates for BusinessOS Service Desk: the **Knowledge Article** master with categorization, versioning, Internal vs Customer-visible visibility, and the **review-before-publish** lifecycle (Draft → Review → Published → Archived) enforced via `ENG-011` and `ENG-012`; the **Macro** authority that applies approved templates to Service Tickets deterministically via `ENG-012` and records execution via `ENG-004` **without mutating historical ticket state**; the **CSAT Survey** transaction dispatched via `ENG-025` after eligible Service Ticket closure per configuration resolved via `ENG-005`; the **CSAT Response** transaction whose lifecycle is governed by `ENG-010`, numbered via `ENG-017` from the series registered in `SPR-MOD-016-001`, and constrained to **exactly one response per survey** via `ENG-012`; KB-related and CSAT-related audit trail via `ENG-004`; and publication of `KnowledgeArticlePublished`, `MacroExecuted`, `CSATSurveySent`, and `CSATResponseReceived` via `ENG-024`. Ticket capture and lifecycle, SLA enforcement and escalation, foundation configuration, and analytics are explicitly **not** in scope — they belong to `SPR-MOD-016-002`, `SPR-MOD-016-003`, `SPR-MOD-016-001`, and `SPR-MOD-016-005` respectively.

> **Service Desk Ownership Convention (recapitulated).** The Service Desk module owns the business semantics of the **Knowledge Article** master, the **Macro** authority and its execution record, the **CSAT Survey** transaction, and the **CSAT Response** transaction. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, workflow, approval, rules, document, attachment, numbering, search, event, notification, AI Copilot) but **MUST NOT** redefine Service Desk business rules. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Customer master data remains exclusive to **MOD-006 CRM** and is consumed read-only. Cross-module KPI definitions remain exclusive to **MOD-017 Analytics**. Ledger effects (if any) remain exclusive to **MOD-002 Accounting** via `ENG-015` / `ENG-016`.

#### 1.1.1 Knowledge Article Authority

The **Knowledge Article** master is authoritatively owned by MOD-016 Service Desk in this sprint. Its schema, categorization (aligned with Ticket Category taxonomy from `SPR-MOD-016-001`), version chain, visibility (Internal vs Customer-visible), and lifecycle (Draft → Review → Published → Archived) are defined here and executed via `ENG-010`. Publication requires a completed review approval routed via `ENG-011`; the review-before-publish rule (Module PRD §7) is enforced via `ENG-012`. Only Published Articles whose visibility is Customer-visible MAY be exposed to external readers; Internal Articles are restricted to authorized agents via `ENG-002`. No other module MAY create, edit, publish, or archive Knowledge Articles, nor maintain a parallel Knowledge Article master.

#### 1.1.2 Macro Authority

The **Macro** definition and execution are authoritatively owned by MOD-016 Service Desk in this sprint. A Macro is a named, tenant-scoped template describing a set of standardized actions applied to a Service Ticket (for example, canned replies via `ENG-007` / `ENG-025`, category updates, or workflow transitions consumed from `SPR-MOD-016-002`). Macro execution is deterministic via `ENG-012`, produces a **Macro Execution** audit record via `ENG-004`, and publishes `MacroExecuted` via `ENG-024`. Macro execution **MUST NOT mutate historical ticket state**: the Service Ticket lifecycle established by `SPR-MOD-016-002` is the sole authority for lifecycle transitions, and any transitions performed as a Macro effect are recorded as new lifecycle events under that authority — never as retroactive amendments to prior ticket history. No other module MAY define or execute Service-Desk Macros.

#### 1.1.3 CSAT Survey / Response Transaction Authority

The **CSAT Survey** transaction and the **CSAT Response** transaction are authoritatively owned by MOD-016 Service Desk in this sprint. A CSAT Survey issues **only after** an eligible Service Ticket closure event (`ServiceTicketClosed` from `SPR-MOD-016-002`) per eligibility rules resolved via `ENG-005`, is dispatched via `ENG-025`, and is numbered via `ENG-017` from the series registered in `SPR-MOD-016-001`. The CSAT Response captures score and free-text feedback; **exactly one CSAT Response per Survey** is enforced via `ENG-012` deduplication. `CSATSurveySent` and `CSATResponseReceived` publish via `ENG-024`. No other module MAY create, edit, or independently maintain parallel CSAT Survey or CSAT Response transactions.

#### 1.1.4 Service Desk ↔ Platform, CRM, Field Service, Accounting, and Analytics Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. Service Desk consumes these read-only via `ENG-001` (transitively through `ENG-002`), `ENG-002`, `ENG-003`.
- **MOD-006 CRM** owns Customer master data. Service Desk consumes it read-only through CRM APIs when resolving survey recipients and Customer-visible article audiences; no Customer master is authored here.
- **MOD-012 Field Service** interaction remains scoped to the surface declared in `SPR-MOD-016-002`; this sprint neither publishes to nor consumes from Field Service beyond that boundary.
- **MOD-002 Accounting** owns financial postings via `ENG-015` Voucher and `ENG-016` Posting engines. MOD-016 declares no direct posting responsibilities in this sprint.
- **MOD-017 Analytics** owns cross-module KPI definitions. CSAT trend and KB effectiveness KPIs are surfaced by `SPR-MOD-016-005` and consumed from MOD-017; cross-module KPIs are never redefined by MOD-016.

Ownership boundaries SHALL NOT be redefined in downstream Service Desk Sprint PRDs.

### 1.2 In Scope

- **Knowledge Article master** — tenant-scoped Knowledge Article records with title, body (via `ENG-007`), attachments (via `ENG-008`), categorization aligned to Ticket Category from `SPR-MOD-016-001`, locale (`ENG-006`), version chain, and visibility (Internal / Customer-visible).
- **Knowledge Article lifecycle** — Draft → Review → Published → Archived, executed via `ENG-010`. Transitions authorized via `ENG-002`; audited via `ENG-004`.
- **Review-before-publish rule (Module PRD §7)** — enforced via `ENG-011` (routing the review approval) and `ENG-012` (rejecting publish requests on unreviewed articles).
- **Versioning** — each publish creates an immutable version; superseded versions are retained under the same Article identity for audit and rollback.
- **Visibility enforcement** — only Published + Customer-visible Articles are exposed to external readers; Internal Articles restricted to authorized agents via `ENG-002`.
- **Article search** — full-text search over Published Articles via `ENG-020`, scoped to the caller's tenant and visibility permissions.
- **AI-assisted authoring / suggestions (where configured)** — consumed via `ENG-028` without redefining engine behavior; suggestions never bypass the review approval.
- **Macro Authority** — named, tenant-scoped templates describing standardized actions applied to a Service Ticket; execution is deterministic via `ENG-012`.
- **Macro execution audit** — each macro execution records actor, timestamp, macro identifier, ticket reference, and applied effects via `ENG-004`.
- **Immutable ticket history** — Macro execution MUST NOT retroactively mutate Service Ticket lifecycle history established by `SPR-MOD-016-002`; any lifecycle transitions arising from a macro are recorded as new events under Sprint 002's authority.
- **CSAT Survey issuance** — after consumption of `ServiceTicketClosed` from `SPR-MOD-016-002` for eligible tickets (eligibility resolved via `ENG-005`), issue a CSAT Survey via `ENG-010`, number it via `ENG-017`, dispatch it via `ENG-025`, and publish `CSATSurveySent` via `ENG-024`.
- **CSAT Response capture** — capture score and free-text feedback via `ENG-010`; enforce **exactly one CSAT Response per Survey** via `ENG-012` deduplication; publish `CSATResponseReceived` via `ENG-024`.
- **SLA-breached ticket eligibility signal** — where the tenant's configuration (resolved via `ENG-005`) makes CSAT eligibility depend on SLA state, `SLABreached` (published by `SPR-MOD-016-003`) is consumed via `ENG-024` as an eligibility input; this sprint neither evaluates SLA state itself nor redefines any SLA semantics.
- **Authorization** on every KB, Macro, and CSAT action via `ENG-002`; permissions consumed against grants registered by `ENG-003` under the RBAC + ABAC model per `ADR-032`.
- **Audit** on every article state change, macro execution, survey issuance, and response capture via `ENG-004`.
- **Events published** via `ENG-024`: `KnowledgeArticlePublished`, `MacroExecuted`, `CSATSurveySent`, `CSATResponseReceived`. Any event name not present in the authoritative event catalog at authoring time is recorded as a deferred `R-EV-*` risk in §14; the event catalog is not modified by this sprint.
- **Events consumed** via `ENG-024`: `ServiceTicketClosed` (from `SPR-MOD-016-002`) drives CSAT Survey issuance; `SLABreached` (from `SPR-MOD-016-003`) drives configured CSAT eligibility only.

### 1.3 Out of Scope

- Foundation masters (Ticket Category, SLA Policy), routing rules, escalation matrices, business hours per region, and numbering-series registration — `SPR-MOD-016-001`.
- Service Ticket transaction, multi-channel capture, ticket lifecycle, parent/child relations, close-with-open-child rule, and `ServiceTicketCreated` / `ServiceTicketUpdated` / `ServiceTicketClosed` publication — `SPR-MOD-016-002`.
- SLA clock lifecycle, SLA timer calculation, SLA Breach Event transaction, Escalation-Matrix execution, and publication of `SLAPaused` / `SLAResumed` / `SLABreached` / `EscalationTriggered` — `SPR-MOD-016-003`.
- Operational reports (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity); dashboards; bulk exports; consumption of MOD-017 KPI definitions; module read model — `SPR-MOD-016-005`.
- Customer master authoring — owned by MOD-006 CRM.
- Identity, authentication, and permission grants — owned by MOD-001 Platform.
- Financial postings (if any) — owned by MOD-002 Accounting via `ENG-015` Voucher and `ENG-016` Posting.
- Cross-module KPI definitions — owned by MOD-017 Analytics.
- Modifications to Ticket Category taxonomy or numbering series — owned by `SPR-MOD-016-001`.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria.*

Upon successful completion of `SPR-MOD-016-004`, the following will exist:

- **Business capabilities.**
  - Knowledge Articles can be authored, versioned, reviewed, and published under a deterministic Draft → Review → Published → Archived lifecycle.
  - Only reviewed articles publish; only Published + Customer-visible articles are exposed externally; Internal articles are restricted to authorized agents.
  - Article search runs over Published Articles within the caller's tenant and visibility scope.
  - Macros are defined and applied to Service Tickets deterministically, producing an audited execution record without mutating historical ticket state.
  - CSAT Surveys issue after eligible Service Ticket closure, dispatch via configured channels, and are numbered by a Service-Desk-issued document number.
  - Exactly one CSAT Response per Survey is enforced; scores and free-text feedback are captured and audited.
  - `KnowledgeArticlePublished`, `MacroExecuted`, `CSATSurveySent`, and `CSATResponseReceived` are published; `ServiceTicketClosed` and (where configured) `SLABreached` are consumed.
  - Every article state change, macro execution, survey issuance, and response capture is audited.
- **Governance surface.**
  - This Sprint PRD.
  - Registration entries in `docs/30-sprint-prds/service-desk/README.md`, `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, and `docs/_meta.json`.
  - Repository audit report for Pass 18.0.4.
- **Explicit non-deliverables.** No implementation code, migrations, physical schema, API contracts, UI, or infrastructure. No changes to ERP Core Engines, ADRs, event catalog, Sprint Plan, Sprint 001 PRD, Sprint 002 PRD, Sprint 003 PRD, Module PRD, governance templates, or the Wrapper.

---

## 3. Traceability to Module PRD

| Module PRD Reference | Coverage in this sprint |
| --- | --- |
| §1 Module Overview | Recapitulated (this sprint delivers Knowledge capture and CSAT loop, two of the Module Business Objectives). |
| §2 Business Scope — Knowledge base and macros; Customer satisfaction surveys; submodules Knowledge Base, CSAT | Fully covered by §1.2 In Scope. |
| §3 Personas (Support Agent, Support Manager, Customer, Employee) | Support Agent authors Articles and applies Macros; Support Manager reviews Articles and monitors CSAT; Customer/Employee receive Customer-visible Articles and CSAT Surveys. |
| §4 Business Processes — Knowledge capture; CSAT loop | Fully covered — Article lifecycle constitutes Knowledge capture; Survey issuance + Response capture constitute the CSAT loop. |
| §5 Master Data — Knowledge Article | Owned here (§1.1.1). |
| §6 Transactions — CSAT Response (and its Survey twin) | Owned here (§1.1.3); lifecycle via `ENG-010`; numbered via `ENG-017`. |
| §7 Business Rules — knowledge-articles-must-be-reviewed-before-publish | Enforced via `ENG-011` + `ENG-012` (§1.2, §5.3). |
| §8 Integration Points — `KnowledgeArticlePublished` (published) | Published via `ENG-024` (§11.1). `MacroExecuted`, `CSATSurveySent`, and `CSATResponseReceived` are additional Service-Desk-owned events required by the Knowledge capture and CSAT loop processes, subject to the deferred event-catalog registration risk in §14. |
| §12 ERP Core Engine Consumption | Only subsets of the Module PRD engine union are consumed (see §8). |
| §13 Dependencies | Only declared dependencies are consumed (see §7). |

No capability, submodule, transaction, business rule, event, engine, or ADR outside the Module PRD is introduced. No Sprint 005 scope is absorbed.

---

## 4. Functional Requirements

FR identifiers are local to this sprint. Every requirement is traceable to Module PRD §§2, 4, 5, 6, 7, 8, 12, 13, and to `SPR-MOD-016-001` / `SPR-MOD-016-002` / `SPR-MOD-016-003` outputs.

- **FR-001 — Knowledge Article authoring.** Create Knowledge Article records under a tenant/company with title, body (via `ENG-007`), attachments (via `ENG-008`), category (aligned with `SPR-MOD-016-001` Ticket Category taxonomy), locale (via `ENG-006`), and visibility (Internal / Customer-visible). Authorization via `ENG-002`; audit via `ENG-004`.
- **FR-002 — Knowledge Article lifecycle.** Draft → Review → Published → Archived transitions execute via `ENG-010`; every transition is audited via `ENG-004`.
- **FR-003 — Review-before-publish enforcement (Module PRD §7).** Publish is rejected via `ENG-012` unless a review approval on the current version has been completed via `ENG-011`. No article publishes without a review approval.
- **FR-004 — Knowledge Article versioning.** Each publish creates an immutable version bound to the Article identity; superseded versions are retained for audit and rollback.
- **FR-005 — Visibility enforcement.** Only Published + Customer-visible Articles are exposed to external readers; Internal Articles are restricted to authorized agents via `ENG-002` under `ADR-032`. Visibility is evaluated on every read.
- **FR-006 — Article search.** Published Articles are searchable via `ENG-020`, scoped to the caller's tenant and visibility permissions. Draft, Review, and Archived Articles are excluded from external search results.
- **FR-007 — AI-assisted suggestions (optional).** Where tenant configuration enables it, `ENG-028` provides authoring suggestions; suggestions never bypass FR-003.
- **FR-008 — `KnowledgeArticlePublished` publication.** On each Published transition, publish `KnowledgeArticlePublished` via `ENG-024` exactly once per (tenant, company, article, version) via `ENG-012` deduplication.
- **FR-009 — Macro definition.** Define named, tenant-scoped Macros describing standardized actions applied to a Service Ticket. Authorization via `ENG-002`; audit via `ENG-004`.
- **FR-010 — Macro execution.** Apply a Macro to a Service Ticket deterministically via `ENG-012`. Any lifecycle transition arising from a Macro is recorded through Sprint 002's ticket lifecycle authority — never as a retroactive amendment to prior history.
- **FR-011 — Macro immutability of history.** Macro execution MUST NOT mutate Service Ticket lifecycle records established by `SPR-MOD-016-002`; enforced via `ENG-012` guardrails.
- **FR-012 — `MacroExecuted` publication.** On each Macro execution, publish `MacroExecuted` via `ENG-024` with the ticket, macro, actor, and timestamp; the execution is audited via `ENG-004`.
- **FR-013 — CSAT eligibility resolution.** On consumption of `ServiceTicketClosed` from `SPR-MOD-016-002` (and, where the tenant configuration requires, `SLABreached` from `SPR-MOD-016-003`), evaluate CSAT-Survey eligibility deterministically via `ENG-012` against configuration resolved via `ENG-005`.
- **FR-014 — CSAT Survey issuance.** For eligible ticket closures, create a CSAT Survey via `ENG-010`, number it via `ENG-017` from the series registered in `SPR-MOD-016-001`, and dispatch it via `ENG-025` under the tenant's configured channels.
- **FR-015 — `CSATSurveySent` publication.** On each CSAT Survey issuance, publish `CSATSurveySent` via `ENG-024` exactly once per (tenant, company, ticket, survey) via `ENG-012` deduplication.
- **FR-016 — CSAT Response capture.** Capture a CSAT Response via `ENG-010` bound to a specific CSAT Survey; carry score and optional free-text feedback.
- **FR-017 — Single-response rule.** Exactly one CSAT Response per CSAT Survey is enforced via `ENG-012` deduplication on (tenant, company, survey). Additional response submissions are rejected.
- **FR-018 — `CSATResponseReceived` publication.** On each CSAT Response commit, publish `CSATResponseReceived` via `ENG-024` exactly once per (tenant, company, survey) via `ENG-012` deduplication.
- **FR-019 — Configuration read-only.** SLA Policy, Ticket Category, Business Hours, and Escalation-Matrix configuration are read-only in this sprint; changes are made through `SPR-MOD-016-001`, not here.
- **FR-020 — Event publication idempotence.** `KnowledgeArticlePublished`, `MacroExecuted`, `CSATSurveySent`, and `CSATResponseReceived` are published exactly once per corresponding transition via `ENG-024` (idempotent by construction of the deduplication keys in FR-008, FR-012, FR-015, FR-018).
- **FR-021 — Event consumption.** `ServiceTicketClosed` (Sprint 002) and, where configured, `SLABreached` (Sprint 003) are consumed via `ENG-024` to drive FR-013 – FR-015.
- **FR-022 — Audit emission.** Every Article state change, Macro execution, CSAT Survey issuance, and CSAT Response capture is audited via `ENG-004`.
- **FR-023 — Authorization.** Every KB, Macro, and CSAT action is authorized via `ENG-002` against grants registered by `ENG-003` under the RBAC + ABAC model per `ADR-032`.
- **FR-024 — Tenant isolation.** All reads and writes are restricted to the caller's tenant scope per `ADR-011`.

---

## 5. Acceptance Criteria (Given / When / Then)

Acceptance is observable and testable at the business surface. Concrete APIs, tables, UI, and error codes are implementation activities and are out of scope.

### 5.1 Knowledge Article authoring (US-001)

- **Given** an authorized agent under a tenant/company,
  **when** they create a Knowledge Article with title, body, category, locale, and visibility,
  **then** the Article is persisted in the `Draft` state under the caller's tenant scope, and the creation is audited via `ENG-004`.

### 5.2 Knowledge Article lifecycle transitions (US-002)

- **Given** a Knowledge Article in `Draft`,
  **when** an authorized agent submits it for review,
  **then** the Article transitions to `Review` via `ENG-010` and the transition is audited via `ENG-004`.

### 5.3 Review-before-publish rule (US-003; Module PRD §7)

- **Given** a Knowledge Article in `Review` without a completed review approval,
  **when** a publish transition is attempted,
  **then** the transition is rejected via `ENG-012`; no `KnowledgeArticlePublished` is emitted; and the rejection is audited via `ENG-004`.
- **Given** a Knowledge Article in `Review` with a review approval completed via `ENG-011`,
  **when** the publish transition is executed,
  **then** the Article transitions to `Published` via `ENG-010`, an immutable version is bound to the Article identity, and `KnowledgeArticlePublished` publishes via `ENG-024` exactly once per (tenant, company, article, version).

### 5.4 Article versioning (US-004)

- **Given** a previously Published Article that is re-published after edit,
  **when** the new version is published,
  **then** a new immutable version is created bound to the same Article identity; superseded versions remain retrievable for audit and rollback.

### 5.5 Visibility enforcement (US-005)

- **Given** an external (non-agent) reader,
  **when** they query Knowledge Articles,
  **then** only Published + Customer-visible Articles are returned; Internal Articles are never disclosed to non-agents; authorization runs via `ENG-002` under `ADR-032`.

### 5.6 Article search (US-006)

- **Given** a tenant with Published Articles indexed via `ENG-020`,
  **when** an authorized reader searches by term,
  **then** only Articles matching the reader's tenant and visibility permissions are returned; Draft, Review, and Archived Articles are excluded from external results.

### 5.7 Article archival (US-007)

- **Given** a Published Article,
  **when** an authorized agent archives it,
  **then** the Article transitions to `Archived` via `ENG-010`; existing versions remain retrievable for audit; the Article is excluded from Customer-visible surfaces; the transition is audited via `ENG-004`.

### 5.8 Macro definition (US-008)

- **Given** an authorized agent under a tenant,
  **when** they define a Macro with a name and standardized actions,
  **then** the Macro is persisted under the caller's tenant scope and the definition is audited via `ENG-004`.

### 5.9 Macro execution (US-009)

- **Given** a Service Ticket and an authorized agent,
  **when** the agent applies a defined Macro to the ticket,
  **then** the Macro's actions execute deterministically via `ENG-012`; `MacroExecuted` publishes via `ENG-024`; the execution is audited via `ENG-004`; and no historical Service Ticket lifecycle record established by `SPR-MOD-016-002` is retroactively mutated.

### 5.10 CSAT eligibility & Survey issuance (US-010)

- **Given** consumption of `ServiceTicketClosed` for a ticket that satisfies CSAT eligibility resolved via `ENG-005`,
  **when** eligibility evaluates true via `ENG-012`,
  **then** a CSAT Survey is created via `ENG-010`, numbered via `ENG-017` from the `SPR-MOD-016-001` series, and dispatched via `ENG-025`; `CSATSurveySent` publishes via `ENG-024` exactly once per (tenant, company, ticket, survey).

### 5.11 CSAT Survey suppression when ineligible (US-011)

- **Given** consumption of `ServiceTicketClosed` for a ticket that does not satisfy CSAT eligibility,
  **when** eligibility evaluates false via `ENG-012`,
  **then** no CSAT Survey is issued and no `CSATSurveySent` is published; the suppression decision is audited via `ENG-004`.

### 5.12 CSAT Response single-response rule (US-012)

- **Given** an issued CSAT Survey,
  **when** a first response is submitted,
  **then** a CSAT Response transaction is created via `ENG-010` carrying score and optional free-text feedback; `CSATResponseReceived` publishes via `ENG-024` exactly once per (tenant, company, survey).
- **Given** an issued CSAT Survey with an existing CSAT Response,
  **when** an additional response is submitted,
  **then** the submission is rejected via `ENG-012` and no additional `CSATResponseReceived` is published; the rejection is audited via `ENG-004`.

### 5.13 Configured SLA-eligibility signal consumption (US-013)

- **Given** a tenant whose CSAT eligibility depends on SLA state and where `SLABreached` (from `SPR-MOD-016-003`) has been observed for a ticket,
  **when** the eligibility rule is evaluated on ticket closure,
  **then** the eligibility outcome reflects the configured SLA signal without redefining any SLA semantics; the evaluation is audited via `ENG-004`.

### 5.14 Event publication (US-014)

- **Given** any Knowledge Article publish, Macro execution, CSAT Survey issuance, or CSAT Response commit,
  **when** the corresponding transition commits,
  **then** `KnowledgeArticlePublished`, `MacroExecuted`, `CSATSurveySent`, or `CSATResponseReceived` (respectively) is published via `ENG-024` exactly once per corresponding transition, using the authoritative envelope and payload contract governed by the event catalog.

### 5.15 Event consumption (US-015)

- **Given** any `ServiceTicketClosed` (Sprint 002) or, where configured, `SLABreached` (Sprint 003) delivered to MOD-016,
  **when** it is consumed via `ENG-024`,
  **then** CSAT eligibility and Survey issuance behave per FR-013 – FR-015 and the consumption is audited via `ENG-004`.

### 5.16 Audit integration (US-016)

- **Given** any Article state change, Macro execution, CSAT Survey issuance, or CSAT Response capture,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant/company scope, subject identifier, change type, and timestamp.

### 5.17 Isolation & authorization invariants (US-017; `ADR-011`, `ADR-032`)

- **Given** any KB, Macro, or CSAT read or write,
  **when** it executes,
  **then** it is restricted to the caller's tenant scope per `ADR-011`, and authorized via `ENG-002` against permissions registered by `ENG-003` under the RBAC + ABAC model per `ADR-032`; unauthorized or cross-tenant actions are rejected before any state change.

### 5.18 Ownership consumption invariants

- **Given** any Service Desk code path that requires SLA Policy, Ticket Category, Business Hours, Escalation Matrix, or numbering-series data,
  **when** it needs that configuration,
  **then** it consumes it read-only from `SPR-MOD-016-001` outputs via `ENG-005` / `ENG-017`; the configuration is not redefined here.
- **Given** any Service Desk code path that requires Service Ticket state,
  **when** it needs that state,
  **then** it consumes it exclusively through the Sprint 002 event surface and Service-Desk-owned read APIs; the Service Ticket lifecycle is not redefined here, and Macro execution never retroactively mutates lifecycle history.
- **Given** any Service Desk code path that requires SLA clock or Escalation state,
  **when** it needs that state,
  **then** it consumes it exclusively through the Sprint 003 event surface; SLA semantics are not redefined here.
- **Given** any Service Desk code path,
  **when** it needs Customer master data,
  **then** it consumes it read-only from MOD-006 CRM; Customer master is not authored here.
- **Given** any KB / Macro / CSAT processing with potential ledger effects,
  **when** postings are required,
  **then** MOD-002 Accounting is triggered exclusively through Service-Desk-published events (in this or later sprints); no Service Desk code path writes journal entries or invokes `ENG-015` / `ENG-016` directly.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-016` — Service Desk.
- **Module PRD:** [`docs/20-module-prds/service-desk/MODULE_PRD.md`](../../../20-module-prds/service-desk/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md).
- **Upstream Sprints:** [`SPR-MOD-016-001`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md), [`SPR-MOD-016-002`](./SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md), [`SPR-MOD-016-003`](./SPR-MOD-016-003_SLA_ENFORCEMENT_AND_ESCALATIONS.md).
- **Module PRD sections fulfilled:** §1, §2 (Knowledge base and macros; Customer satisfaction surveys; submodules Knowledge Base, CSAT), §4 (Knowledge capture; CSAT loop), §5 (Knowledge Article), §6 (CSAT Response), §7 (knowledge-articles-must-be-reviewed-before-publish), §8 (`KnowledgeArticlePublished` — published), §12, §13. See §3.

---

## 7. Dependencies

- **Parent:** `MOD-016` MODULE_PRD.
- **Upstream sprint dependencies:**
  - [`SPR-MOD-016-001`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md) — provides Ticket Category taxonomy, Business Hours, and numbering-series registration (including the CSAT-Survey/Response series). Consumed read-only.
  - [`SPR-MOD-016-002`](./SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md) — provides the Service Ticket transaction, its lifecycle, and the `ServiceTicketClosed` event surface. Consumed read-only through events and read APIs.
  - [`SPR-MOD-016-003`](./SPR-MOD-016-003_SLA_ENFORCEMENT_AND_ESCALATIONS.md) — provides the `SLABreached` event surface consumed by CSAT eligibility where configured. Consumed read-only.
- **Upstream module baselines:**
  - [`MOD001_PLATFORM_BASELINE_v1`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) (frozen) — tenancy, company/branch hierarchy, users/roles/permissions, configuration hierarchy, audit review.
  - [`MOD006_CRM_BASELINE_v1`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) (frozen) — Customer master (read-only association context for surveys and Customer-visible articles).
- **Downstream sprints:** `SPR-MOD-016-005` (Service Analytics & Compliance) — per [`MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md).

### 7.1 Governance Template Dependencies (per GT-003 §10 VAL-013A)

| Template | Version Range | Resolved State | Result |
| --- | --- | --- | --- |
| GT-003 Sprint Authoring | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-002 Stage 1 Authoring (transitive) | `>=1.0,<2.0` | v1.0 Active | PASS |
| GT-001 Legacy Reconciliation (transitive) | `>=1.0,<2.0` | v1.1 Active | PASS |

Capabilities Registry `>=1.1,<2.0` satisfied at Active.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined** (see the Service Desk Ownership Convention in §1.1). Each engine is a subset of the Module PRD engine union per Module PRD §12 and of the Sprint Plan §5 allocation for `SPR-MOD-016-004`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-002` Authorization | Enforces authorization on every KB, Macro, and CSAT action (RBAC + ABAC per `ADR-032`). |
| `ENG-004` Audit | Records every Article state change, Macro execution, CSAT Survey issuance, and CSAT Response capture. |
| `ENG-005` Configuration | Resolves CSAT eligibility rules, dispatch channels, Ticket Category alignment, and locale defaults under the tenant → company → context hierarchy (read-only). |
| `ENG-006` Localization | Resolves Article locale metadata and CSAT Survey locale for dispatch. |
| `ENG-007` Document | Manages Article body content. |
| `ENG-008` Attachment | Manages Article attachments. |
| `ENG-010` Workflow | Executes the Knowledge Article lifecycle, the CSAT Survey lifecycle, and the CSAT Response lifecycle. |
| `ENG-011` Approval | Routes the review approval that gates Knowledge Article publish. |
| `ENG-012` Rules | Evaluates review-before-publish, single-CSAT-response-per-survey, macro-immutability-of-history guardrail, CSAT eligibility, and deduplication of publish/execution/dispatch/response events. |
| `ENG-017` Numbering | Allocates CSAT Survey / CSAT Response document numbers using the series registered in `SPR-MOD-016-001`. |
| `ENG-020` Search | Indexes and retrieves Published Articles under the caller's tenant and visibility scope. |
| `ENG-024` Event | Publishes `KnowledgeArticlePublished`, `MacroExecuted`, `CSATSurveySent`, `CSATResponseReceived`; consumes `ServiceTicketClosed` and `SLABreached`. |
| `ENG-025` Notification | Dispatches CSAT Surveys under the tenant's configured channels. |
| `ENG-028` AI Copilot | Provides Article authoring suggestions where tenant configuration enables it; never bypasses the review approval. |

Service Desk business semantics (Knowledge Article authority, Macro authority, CSAT Survey/Response transactions, review-before-publish rule, single-response rule, immutable-ticket-history rule) are owned by this module and are not delegated to any engine.

Identity (`ENG-001`), Permission Management (`ENG-003`), Workflow-adjacent Rules-only engines already covered above, Integration (`ENG-023`), Reporting (`ENG-021`), Dashboard (`ENG-022`), Export (`ENG-027`), Automation (`ENG-013`) are declared in the Module PRD engine union but are **not** consumed by this sprint per Sprint Plan §5 (`SPR-MOD-016-004`): identity is transitively consumed through `ENG-002`; permissions are consumed for permission-check evaluation via `ENG-002` without new registrations here; and the remaining engines are consumed by earlier or later Service Desk sprints per their allocated scope.

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon. Each ADR is a subset of the Module PRD ADR union per Module PRD frontmatter.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced on every KB, Macro, and CSAT read and write. |
| `ADR-032` RBAC + ABAC | Authoritative authorization model applied to every KB, Macro, and CSAT action, and to visibility enforcement on Article reads. |

Event envelope, naming, and delivery guarantees are governed by the authoritative event catalog (`docs/02-architecture/event-catalog.md`) and `ENG-024` Event. Audit contract is governed by `ENG-004` per the Module PRD §12.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Knowledge Article | MOD-016 (this sprint) | Tenant-scoped Knowledge Article identity carrying title, body, attachments, category, locale, visibility, current-version pointer, and lifecycle state (`Draft` / `Review` / `Published` / `Archived`). |
| Knowledge Article Version | MOD-016 (this sprint) | Immutable version snapshot bound to a Knowledge Article identity; produced on each publish; retained under the same Article identity for audit and rollback. |
| Macro | MOD-016 (this sprint) | Tenant-scoped named template describing standardized actions applied to a Service Ticket. Owned by MOD-016; consumed by authorized agents. |
| Macro Execution | MOD-016 (this sprint) | Audit-scoped record of a Macro applied to a Service Ticket; carries actor, timestamp, macro identifier, ticket reference, and applied effects. Never mutates historical Service Ticket lifecycle records. |
| CSAT Survey | MOD-016 (this sprint) | Tenant-scoped transaction representing a survey issued for a specific closed Service Ticket. Numbered via `ENG-017`; dispatched via `ENG-025`. |
| CSAT Response | MOD-016 (this sprint) | Tenant-scoped transaction bound to exactly one CSAT Survey; carries score and optional free-text feedback. |

### 10.2 Relationships

- A **Knowledge Article** has one or more **Knowledge Article Versions**; exactly one version is the currently `Published` version at any time (or none, if the Article is Draft/Review/Archived).
- A **Knowledge Article** references a **Ticket Category** (owned by `SPR-MOD-016-001`) read-only for taxonomy alignment.
- A **Macro** is tenant-scoped and independent of any specific Service Ticket; a **Macro Execution** references exactly one **Macro** and exactly one **Service Ticket** (owned by `SPR-MOD-016-002`).
- A **CSAT Survey** references exactly one **Service Ticket** (owned by `SPR-MOD-016-002`); at most one **CSAT Response** exists per **CSAT Survey**.
- **CSAT Survey** eligibility may reference the SLA state signal from `SPR-MOD-016-003` (via `SLABreached`) purely as a read-only input; no SLA entity is authored here.

### 10.3 Ownership Boundaries

- All entities listed here are owned by `MOD-016` per the Service Desk Ownership Convention (§1.1). ERP Core Engines do not redefine them.
- **Ticket Category**, **SLA Policy**, **Business Hours**, and numbering-series configuration are owned by `SPR-MOD-016-001` and are consumed read-only here.
- **Service Ticket** is owned by `SPR-MOD-016-002` and is consumed here through its event surface and read APIs; Macro Execution never retroactively mutates Service Ticket lifecycle history.
- **SLA Clock**, **SLA Breach Event**, and **Escalation Firing** are owned by `SPR-MOD-016-003` and are consumed here strictly through the `SLABreached` event surface where configured.
- The **Customer** entity is owned by MOD-006 CRM and is consumed read-only.
- The **Identity** entity is owned by MOD-001 Platform and is consumed read-only.
- Financial-posting entities (vouchers, GL entries) are owned by MOD-002 Accounting; they are not represented as Service-Desk-owned entities.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published and Consumed

Referenced authoritatively in [`../../../02-architecture/event-catalog.md`](../../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by the authoritative event catalog and `ENG-024` Event.

### 11.1 Published

- **`KnowledgeArticlePublished`** — published via `ENG-024` on each Knowledge Article publish transition. Origin sprint per Sprint Plan §4.4.
- **`MacroExecuted`** — published via `ENG-024` on each Macro execution. Origin sprint: `SPR-MOD-016-004`.
- **`CSATSurveySent`** — published via `ENG-024` on each CSAT Survey issuance. Origin sprint: `SPR-MOD-016-004`.
- **`CSATResponseReceived`** — published via `ENG-024` on each CSAT Response commit. Origin sprint: `SPR-MOD-016-004`.

### 11.2 Consumed

- **`ServiceTicketClosed`** — consumed from `SPR-MOD-016-002` via `ENG-024`; drives CSAT Survey eligibility evaluation and issuance (FR-013 – FR-015).
- **`SLABreached`** — consumed from `SPR-MOD-016-003` via `ENG-024` where tenant configuration makes CSAT eligibility depend on SLA state; used strictly as a read-only input.

No event outside the Module PRD event union is published or consumed. `MacroExecuted`, `CSATSurveySent`, and `CSATResponseReceived` are Service-Desk-owned lifecycle events required by the Knowledge capture and CSAT loop processes; any event name not present in the authoritative event catalog at authoring time is a deferred registration item recorded as `R-EV-01` in §14.

---

## 12. Non-functional Considerations

Non-functional targets inherit from `docs/02-architecture/quality-attributes.md` and the Module PRD §11. This sprint introduces no bespoke non-functional targets. Concrete performance envelopes for Article search, Macro execution, and CSAT dispatch are implementation concerns and are out of scope for this PRD.

- Interactive Article reads and search run inside the platform latency envelope; batch CSAT dispatch and survey aging run inside the platform batch envelope.
- Data classification and retention rules follow the Data Constitution as consumed by MOD-016 Module PRD §11.
- Accessibility of any surfaced KB / Macro / CSAT UI is enforced by the platform design system (ADR-081), not by this Sprint PRD.

---

## 13. Acceptance & Exit Criteria

Sprint Plan §2 for `SPR-MOD-016-004` defines the objective exit criteria. Reproduced verbatim:

- Knowledge Articles can be authored, reviewed, and published; the review-before-publish rule is enforced via `ENG-011`/`ENG-012` — no article publishes without a review approval.
- Macros are defined and applied to tickets deterministically via `ENG-012` and audited via `ENG-004`.
- CSAT Response transactions run via `ENG-010`; surveys dispatch via `ENG-025` and capture responses under `ENG-004` audit.
- Knowledge Article search and retrieval run via `ENG-020`; AI-assisted suggestions (where configured) run via `ENG-028` without redefining engine behavior.
- `KnowledgeArticlePublished` events publish via `ENG-024`.

Each acceptance criterion in §5 is testable at the business surface and observable through the events, notifications, audit records, and read views declared above.

---

## 14. Risks & Assumptions

- **Risk ID:** R-01
  - **Description:** MOD-016 depends on `SPR-MOD-016-001` outputs (Ticket Category taxonomy, Business Hours per region, CSAT-Survey/Response numbering series) being present and complete.
  - **Impact:** Missing foundation configuration would prevent deterministic Article categorization and correct CSAT Survey/Response numbering.
  - **Mitigation:** Consume `SPR-MOD-016-001` outputs read-only; treat any drift as a foundation defect and re-plan.
  - **Status:** Open

- **Risk ID:** R-02
  - **Description:** MOD-016 depends on `SPR-MOD-016-002` outputs (Service Ticket transaction, its lifecycle, and the `ServiceTicketClosed` event surface).
  - **Impact:** Regressions in the Sprint 002 event surface or lifecycle would break CSAT Survey issuance and Macro execution referencing.
  - **Mitigation:** Consume Sprint 002 outputs read-only through the event surface and Service-Desk-owned read APIs; escalate any change as a Sprint 002 defect.
  - **Status:** Open

- **Risk ID:** R-03
  - **Description:** Configured CSAT eligibility that depends on SLA state relies on the `SLABreached` surface from `SPR-MOD-016-003`.
  - **Impact:** Regressions in the Sprint 003 SLA surface would misclassify CSAT eligibility for tenants that opt into that rule.
  - **Mitigation:** Consume `SLABreached` read-only; escalate any change as a Sprint 003 defect.
  - **Status:** Open

- **Risk ID:** R-04
  - **Description:** MOD-016 depends on `MOD001_PLATFORM_BASELINE_v1` (tenancy, users/roles/permissions, configuration hierarchy, audit review) being frozen and stable.
  - **Impact:** Regressions in the Platform baseline would break tenant isolation, authorization, or configuration resolution for KB/Macro/CSAT processing.
  - **Mitigation:** Consume the Platform baseline per its frozen contract; escalate any change as a baseline defect.
  - **Status:** Open

- **Risk ID:** R-05
  - **Description:** Later Service Desk sprint (`SPR-MOD-016-005`) is deferred; scope-creep of analytics, dashboards, reports, or exports back into this sprint would dilute the Knowledge / Macros / CSAT scope.
  - **Impact:** Silent absorption of downstream scope would violate sprint boundaries and Sprint Plan §4 allocations.
  - **Mitigation:** Enforce the §1.3 out-of-scope list; reject additions that belong to `SPR-MOD-016-005`.
  - **Status:** Open

- **Risk ID:** R-06
  - **Description:** All referenced ADRs (`ADR-011`, `ADR-032`) are Accepted at authoring time; no Proposed / Draft / Superseded ADR is relied upon.
  - **Impact:** If any becomes non-Accepted, this sprint's contract is invalidated.
  - **Mitigation:** Re-plan this sprint if the acceptance status of any referenced ADR changes.
  - **Status:** Open

- **Risk ID:** R-07
  - **Description:** Service-Desk-owned entities (Knowledge Article, Knowledge Article Version, Macro, Macro Execution, CSAT Survey, CSAT Response) MUST NOT be redefined by downstream modules; MOD-006-owned Customer, MOD-001-owned Identity, and MOD-002 financial postings MUST NOT be authored here; `SPR-MOD-016-001`-owned Ticket Category / Business Hours / numbering series MUST NOT be redefined here; `SPR-MOD-016-002`-owned Service Ticket lifecycle records MUST NOT be retroactively mutated by Macro execution; `SPR-MOD-016-003`-owned SLA semantics MUST NOT be redefined here.
  - **Impact:** Blurring these ownership boundaries would fragment master data and break traceability.
  - **Mitigation:** Enforce the Knowledge Article Authority (§1.1.1), the Macro Authority (§1.1.2), the CSAT Survey / Response Transaction Authority (§1.1.3), and the cross-module boundary (§1.1.4) at every downstream module gate.
  - **Status:** Accepted

- **Risk ID:** R-EV-01
  - **Description:** This sprint publishes `KnowledgeArticlePublished`, `MacroExecuted`, `CSATSurveySent`, and `CSATResponseReceived`, and consumes `ServiceTicketClosed` and `SLABreached`. Any of these event names not present in the authoritative event catalog at authoring time is a deferred event-catalog registration item.
  - **Impact:** If not registered before this sprint enters `In Progress`, publishers cannot emit and consumers cannot subscribe.
  - **Mitigation:** Register each event in the authoritative event catalog through the governance path before this sprint enters `In Progress`. This sprint does not modify the event catalog.
  - **Status:** Open

---

## 15. References

- Parent Module PRD — [`../../../20-module-prds/service-desk/MODULE_PRD.md`](../../../20-module-prds/service-desk/MODULE_PRD.md)
- Module Sprint Plan (Stage 1) — [`../MOD-016_SPRINT_PLAN.md`](../MOD-016_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md`](./SPR-MOD-016-001_SERVICE_DESK_FOUNDATION.md), [`./SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md`](./SPR-MOD-016-002_TICKET_CAPTURE_AND_LIFECYCLE.md), [`./SPR-MOD-016-003_SLA_ENFORCEMENT_AND_ESCALATIONS.md`](./SPR-MOD-016-003_SLA_ENFORCEMENT_AND_ESCALATIONS.md)
- Sprint Framework — [`../../../SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md), [`../../../SPRINT_ROADMAP.md`](../../../SPRINT_ROADMAP.md), [`../../../SPRINT_ESTIMATION_GUIDE.md`](../../../SPRINT_ESTIMATION_GUIDE.md), [`../../../SPRINT_DEPENDENCY_MATRIX.md`](../../../SPRINT_DEPENDENCY_MATRIX.md), [`../../../SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md)
- ERP Core Engines — [`../../../10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md)
- ADR Index — [`../../../11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md)
- Event Catalog — [`../../../02-architecture/event-catalog.md`](../../../02-architecture/event-catalog.md)
- Upstream Baselines — [`../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](../../../40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md), [`../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../../40-module-baselines/MOD006_CRM_BASELINE_v1.md)
- Module Implementation Workflow — [`../../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md)
