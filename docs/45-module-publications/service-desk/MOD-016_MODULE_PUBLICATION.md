---
title: "MOD-016 Module Publication — Service Desk"
summary: "GT-005 Module Publication for MOD-016 Service Desk. Terminal governance artifact derived exclusively from MOD016_SERVICE_DESK_BASELINE_v1 and the MOD-016 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-016_MODULE_PUBLICATION"
publication_id: "MOD-016_MODULE_PUBLICATION"
module_id: "MOD-016"
module_name: "Service Desk"
version: "1.0"
status: "Published"
owner: "Service"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/service-desk/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/service-desk/MOD-016_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD016_SERVICE_DESK_BASELINE_v1.md"
source_module: "MOD-016"
source_sprints: ["SPR-MOD-016-001", "SPR-MOD-016-002", "SPR-MOD-016-003", "SPR-MOD-016-004", "SPR-MOD-016-005"]
layer: "delivery"
updated: "2026-07-20"
tags: ["publication", "module", "MOD-016", "service-desk", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD016-20260720T170000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-032"]
related_modules: ["MOD-001", "MOD-006", "MOD-012", "MOD-017"]
---

# MOD-016 Module Publication — Service Desk

> **Reference publication only.** Faithful representation of [`MOD016_SERVICE_DESK_BASELINE_v1`](../../40-module-baselines/MOD016_SERVICE_DESK_BASELINE_v1.md) and the [`MOD-016 Module PRD`](../../20-module-prds/service-desk/MODULE_PRD.md). Introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-016
- **Module Name:** Service Desk
- **Owner:** Service
- **Publication ID:** MOD-016_MODULE_PUBLICATION
- **Source Baseline:** `MOD016_SERVICE_DESK_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/service-desk/MODULE_PRD.md`](../../20-module-prds/service-desk/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/service-desk/MOD-016_SPRINT_PLAN.md`](../../30-sprint-prds/service-desk/MOD-016_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-016-001` … `SPR-MOD-016-005`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

Service Desk is the authoritative bounded context for Customer and Internal Support (Baseline §1; PRD §1). It owns Ticket Category, SLA Policy, and Knowledge Article master lifecycles and the Service Desk configuration surface (routing rules, escalation matrices, business hours per region, numbering series for Service Desk documents); multi-channel Service Ticket capture (Email, Chat, WhatsApp, Voice) and the Service Ticket transaction lifecycle including categorization/routing execution, parent/child ticket relations, and close-with-open-child-task enforcement; the SLA Clock lifecycle over Service Tickets with pause-on-customer-waiting and automatic resume, the SLA Breach Event transaction, and deterministic Escalation-Matrix execution; the Knowledge Article master with review-before-publish enforcement and Internal / Customer-visible visibility, Macro authority applying approved templates without mutating ticket history, and CSAT Survey and Response transactions with single-response enforcement; and the Service Desk operational read model for reports, dashboards, exports, and audit readiness (Baseline §2; PRD §2). Identity, authentication, roles, permissions, configuration hierarchy, localization, and audit collection remain owned by MOD-001 Platform Administration; Customer master data and `CustomerCreated` / `OpportunityWon` events are consumed read-only from MOD-006 CRM; `FieldVisitCompleted` events are consumed read-only from MOD-012 Field Service; cross-module KPI definitions remain owned by MOD-017 Analytics and are consumed read-only via `ENG-023` (Baseline §2, §5, §7, §9; PRD §2, §13).

## 3. Approved Scope

Restates the scope consolidated in `MOD016_SERVICE_DESK_BASELINE_v1` §2 and the Module PRD §2. Service Desk owns:

- Service Desk foundations — Ticket Category and SLA Policy master data; routing rules; escalation matrices; business hours per region; numbering series for Service Desk documents (Baseline §2; PRD §2, §5, §10).
- Ticket capture and lifecycle — Multi-channel Service Ticket capture (Email, Chat, WhatsApp, Voice); Service Ticket transaction lifecycle; categorization and routing execution; parent/child ticket relations; close-with-open-child-task rule; initial assignment invocation; attachment registration (Baseline §2; PRD §2, §6, §7, §8).
- SLA enforcement and escalations — SLA Clock lifecycle over Service Tickets against SLA Policies and Business Hours; pause-on-customer-waiting rule and automatic resume; SLA Breach Event transaction; deterministic Escalation-Matrix execution (Baseline §2; PRD §2, §6, §7, §8).
- Knowledge Base, Macros, and CSAT — Knowledge Article master with review-before-publish rule and Internal / Customer-visible visibility; Macro authority applying approved templates to Service Tickets without mutating history; CSAT Survey and Response transactions with single-response enforcement (Baseline §2; PRD §2, §5, §6, §7, §8).
- Service Analytics & Compliance — Read-model operational reports (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity), dashboards, bulk exports, read-only consumption of MOD-017 cross-module KPI definitions, and audit-readiness surface (Baseline §2; PRD §9, §11).

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Inherited verbatim from `MOD016_SERVICE_DESK_BASELINE_v1` §7.

### 4.1 SPR-MOD-016-001 — Service Desk Foundation (Categories, SLA Policies, Business Hours & Routing)

- **Ticket Category & SLA Policy Master Authority** — MOD-016 owns the business semantics of Ticket Category and SLA Policy master data. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, rules, eventing, notification) but MUST NOT redefine Service Desk business rules.
- **Service Desk Configuration Authority** — MOD-016 owns the Service Desk configuration surface (routing rules, escalation matrices, business hours per region) delivered via `ENG-005` in the tenant → company → context hierarchy; numbering series for Service Desk documents are configured via `ENG-017`.
- **Foundation Lifecycle Boundary** — Ticket capture, lifecycle, SLA enforcement, KB/Macro/CSAT, and analytics authoring are explicitly deferred to SPR-MOD-016-002..005.

### 4.2 SPR-MOD-016-002 — Ticket Capture & Lifecycle

- **Service Ticket Transaction Authority** — MOD-016 owns the Service Ticket transaction lifecycle enforced via `ENG-010`. Tickets can be captured across Email, Chat, WhatsApp, and Voice channels via `ENG-023`; attachments via `ENG-008`; documents via `ENG-007`; search via `ENG-020`. `ServiceTicketCreated` and `ServiceTicketClosed` events publish via `ENG-024`.
- **Categorization & Routing Execution Authority** — Categorization and routing decisions run deterministically via `ENG-012` against Ticket Category master and routing rules from Sprint 001.
- **Close-with-Open-Child-Task Rule Authority** — A ticket cannot be closed while it has open child tasks; the rule is enforced via `ENG-012`.
- **Inbound Event Consumption Boundary** — `FieldVisitCompleted` (MOD-012), `CustomerCreated` (MOD-006), and `OpportunityWon` (MOD-006) are consumed and reconciled to tickets; MOD-016 does not redefine field-service or CRM transactions.

### 4.3 SPR-MOD-016-003 — SLA Enforcement & Escalations

- **SLA Clock Authority** — MOD-016 owns the SLA Clock lifecycle over Service Tickets. Clocks evaluate against SLA Policies and Business Hours (both from Sprint 001) via `ENG-005` and `ENG-012`.
- **Pause-on-Customer-Waiting Rule Authority** — SLA countdowns pause deterministically during configured customer-waiting states and resume automatically via `ENG-012`; `SLAPaused` and `SLAResumed` events publish via `ENG-024`.
- **SLA Breach Event Transaction Authority** — MOD-016 owns the SLA Breach Event transaction lifecycle enforced via `ENG-010`; approval-gated escalations, where configured, run via `ENG-011`.
- **Escalation Execution Authority** — Deterministic Escalation-Matrix execution runs via `ENG-013`; escalation notifications dispatch via `ENG-025`. `SLABreached` and `EscalationTriggered` events publish via `ENG-024`.

### 4.4 SPR-MOD-016-004 — Knowledge Base, Macros & CSAT

- **Knowledge Article Authority** — MOD-016 owns the Knowledge Article master lifecycle (Draft → Review → Published → Archived) enforced via `ENG-010`/`ENG-011`; the review-before-publish rule is enforced via `ENG-011`/`ENG-012` — no article publishes without a review approval. Internal vs Customer-visible visibility is enforced via `ENG-012`. Article search runs via `ENG-020`; AI-assisted suggestions (where configured) run via `ENG-028` without redefining engine behavior. `KnowledgeArticlePublished` events publish via `ENG-024`.
- **Macro Authority** — MOD-016 owns Macro definition and execution; macros apply approved templates to Service Tickets without mutating ticket history and are audited via `ENG-004`. Execution runs deterministically via `ENG-012`; `MacroExecuted` events publish via `ENG-024`.
- **CSAT Survey/Response Transaction Authority** — MOD-016 owns CSAT Survey issuance and CSAT Response transactions enforced via `ENG-010`; surveys dispatch via `ENG-025` only after eligible ticket closure; single-response enforcement runs via `ENG-012`. `CSATSurveySent` and `CSATResponseReceived` events publish via `ENG-024`.

### 4.5 SPR-MOD-016-005 — Service Analytics & Compliance

- **Service Analytics Authority** — MOD-016 owns operational Service Desk reports (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity) rendered via `ENG-021`, dashboards via `ENG-022`, and bulk exports via `ENG-027`, all operating over the Service Desk read model. Cross-module KPI definitions remain exclusive to MOD-017 Analytics and are consumed read-only via `ENG-023`.
- **Compliance Reporting Authority** — Compliance reports are generated from `ENG-004` audit sources; historical metric integrity is preserved. `AnalyticsSnapshotGenerated` and `ComplianceReportGenerated` events publish via `ENG-024`.
- **Dashboard Read-Model & Analytics Aggregation Authority** — Dashboards and aggregations expose read models only; deterministic KPI computation is derived from authoritative transactional sources without mutating them.
- **Read-Model-Only Boundary Convention** — Dashboards, reports, integration, and export operate over the Service Desk read model; no new master data, transactions, workflows, or transactional mutations are introduced by Sprint 5.
- **Audit-Readiness Surface Authority** — Every state-changing Service Desk transaction traces to an `ENG-004` audit event; the Service Desk module read model exposes prior-sprint events through the read model. Audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-016-001` … `SPR-MOD-016-005`) as consolidated in `MOD016_SERVICE_DESK_BASELINE_v1`. This publication introduces no new requirements.

## 6. Business Rules

Verbatim from Module PRD §7 and Baseline §7:

- A ticket cannot be closed while it has open child tasks (PRD §7; Baseline §7 Close-with-Open-Child-Task Rule).
- SLA countdowns pause during customer-waiting states as configured and resume automatically (PRD §7; Baseline §7 Pause-on-Customer-Waiting Rule).
- Knowledge articles must be reviewed before publish (PRD §7; Baseline §7 Knowledge Article Authority — review-before-publish).
- CSAT enforces a single response per survey issuance (Baseline §7 CSAT Survey/Response Transaction Authority).
- Macros apply approved templates to Service Tickets without mutating ticket history (Baseline §7 Macro Authority).
- Service Desk master and transaction lifecycles are Service-Desk-owned; no other module mutates Service Desk state (Baseline §7, §9).
- MOD-016 does not implement double-entry posting; Service Desk declares no ledger effects (Baseline §5, §11).
- `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon` are consumed read-only (Baseline §7, §8).
- Analytics surfaces are read-only projections over the Service Desk read model (Baseline §7).

## 7. Master Data Authorities

Verbatim from Module PRD §5 and Baseline §4, §7:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Ticket Category | SPR-MOD-016-001 |
| SLA Policy | SPR-MOD-016-001 |
| Knowledge Article | SPR-MOD-016-004 |

## 8. Transaction Authorities

Verbatim from Module PRD §6 and Baseline §4, §7:

| Transaction | Originating Sprint |
| --- | --- |
| Service Ticket | SPR-MOD-016-002 |
| SLA Breach Event | SPR-MOD-016-003 |
| CSAT Response | SPR-MOD-016-004 |

## 9. Published Events

Emitted via `ENG-024` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by Service Desk; delivery infrastructure owned by Platform. Verbatim from Baseline §8 and Module PRD §8:

- `ServiceTicketCreated` — SPR-MOD-016-002
- `ServiceTicketClosed` — SPR-MOD-016-002
- `SLAPaused` — SPR-MOD-016-003
- `SLAResumed` — SPR-MOD-016-003
- `SLABreached` — SPR-MOD-016-003
- `EscalationTriggered` — SPR-MOD-016-003
- `KnowledgeArticlePublished` — SPR-MOD-016-004
- `MacroExecuted` — SPR-MOD-016-004
- `CSATSurveySent` — SPR-MOD-016-004
- `CSATResponseReceived` — SPR-MOD-016-004
- `AnalyticsSnapshotGenerated` — SPR-MOD-016-005
- `ComplianceReportGenerated` — SPR-MOD-016-005

## 10. Consumed Events

Consumed via `ENG-024`. Consumption is read-only. Verbatim from Baseline §8 and Module PRD §8:

- `FieldVisitCompleted` (from MOD-012 Field Service) — SPR-MOD-016-002
- `CustomerCreated` (from MOD-006 CRM) — SPR-MOD-016-002
- `OpportunityWon` (from MOD-006 CRM) — SPR-MOD-016-002
- `ServiceTicketCreated`, `ServiceTicketClosed` (Service-Desk-published; consumed by the read model) — SPR-MOD-016-005
- `SLABreached`, `EscalationTriggered` (Service-Desk-published; consumed by the read model) — SPR-MOD-016-005
- `KnowledgeArticlePublished`, `MacroExecuted`, `CSATResponseReceived` (Service-Desk-published; consumed by the read model) — SPR-MOD-016-005

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-016 via their Capability Interfaces. Engine set inherited verbatim from `MOD016_SERVICE_DESK_BASELINE_v1` §5:

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-016-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-016-001, 002, 003, 004, 005 |
| ENG-003 (Permission Management Engine) | SPR-MOD-016-001 |
| ENG-004 (Audit Engine) | SPR-MOD-016-001, 002, 003, 004, 005 |
| ENG-005 (Configuration Engine) | SPR-MOD-016-001, 002, 003, 004, 005 |
| ENG-006 (Localization Engine) | SPR-MOD-016-001, 002, 004 |
| ENG-007 (Document Engine) | SPR-MOD-016-002, 004 |
| ENG-008 (Attachment Engine) | SPR-MOD-016-002, 004 |
| ENG-010 (Workflow Engine) | SPR-MOD-016-002, 003, 004 |
| ENG-011 (Approval Engine) | SPR-MOD-016-003, 004 |
| ENG-012 (Rules Engine) | SPR-MOD-016-001, 002, 003, 004 |
| ENG-013 (Automation Engine) | SPR-MOD-016-003 |
| ENG-017 (Numbering Engine) | SPR-MOD-016-001, 002, 003, 004 |
| ENG-020 (Search Engine) | SPR-MOD-016-002, 004 |
| ENG-021 (Reporting Engine) | SPR-MOD-016-005 |
| ENG-022 (Dashboard Engine) | SPR-MOD-016-005 |
| ENG-023 (Integration Engine) | SPR-MOD-016-002, 005 |
| ENG-024 (Event Engine) | SPR-MOD-016-001, 002, 003, 004, 005 |
| ENG-025 (Notification Engine) | SPR-MOD-016-001, 002, 003, 004 |
| ENG-027 (Export Engine) | SPR-MOD-016-005 |
| ENG-028 (AI Copilot Engine) | SPR-MOD-016-004 |

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-032` (RBAC + ABAC). `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any Service Desk sprint — MOD-016 declares no direct posting responsibilities; any ledger effects, if ever required, would remain owned by MOD-002 Accounting per the governance boundary declared in the Module PRD §13 and Baseline §5, §7.

## 12. Dependencies

Verbatim from `MOD016_SERVICE_DESK_BASELINE_v1` §9 and Module PRD §13.

**Upstream contracts consumed by Service Desk:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- `MOD006_CRM_BASELINE_v1` — Customer master data consumed read-only; `CustomerCreated` and `OpportunityWon` events consumed to reconcile tickets to customers/opportunities.
- `MOD012_FIELD_SERVICE_BASELINE_v1` — `FieldVisitCompleted` events consumed to reconcile field visits to originating tickets. MOD-016 does not redefine field-service transactions.
- `MOD017_ANALYTICS_BASELINE_v1` — cross-module KPI catalog consumed read-only via `ENG-023`.

**Downstream consumers of Service Desk:**

- `MOD-012 Field Service` — consumes `ServiceTicketCreated` and `ServiceTicketClosed` for field-service dispatch and closure reconciliation.
- `MOD-017 Analytics` — consumes Service Desk operational read models and lifecycle events (`ServiceTicketCreated`, `ServiceTicketClosed`, `SLABreached`, `EscalationTriggered`, `KnowledgeArticlePublished`, `CSATResponseReceived`, `AnalyticsSnapshotGenerated`, `ComplianceReportGenerated`) for cross-module KPIs; owns cross-module KPI definitions.

## 13. Ownership Boundaries

Verbatim from Baseline §7 and §9 and PRD §2, §13:

- MOD-016 owns **only** the authorities enumerated in §4.
- Downstream modules MUST NOT own Service Desk master data, redefine the Ticket Category / SLA Policy / Knowledge Article / Service Ticket / SLA Breach Event / CSAT Response lifecycles, or redefine Service Desk analytics ownership.
- Identity, authentication, roles, permissions, configuration hierarchy, localization, and audit collection remain owned by MOD-001 Platform Administration.
- Customer master data is owned by MOD-006 CRM; Service Desk consumes it read-only. `CustomerCreated` and `OpportunityWon` are consumed read-only.
- Field-service transactions are owned by MOD-012 Field Service; `FieldVisitCompleted` is consumed read-only.
- Ledger effects, if any ever arise, are produced by MOD-002 Accounting via `ENG-015` / `ENG-016`; MOD-016 emits no ledger writes.
- `ENG-004` remains authoritative for audit collection; Service Desk owns only the business-level audit-readiness surface.
- `ENG-024` remains authoritative for event delivery infrastructure; Service Desk owns the semantics of the events it emits.
- Cross-module KPI definitions remain exclusive to MOD-017 Analytics.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/service-desk/MODULE_PRD.md`](../../20-module-prds/service-desk/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/service-desk/MOD-016_SPRINT_PLAN.md`](../../30-sprint-prds/service-desk/MOD-016_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | `SPR-MOD-016-001` … `SPR-MOD-016-005` |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD016_SERVICE_DESK_BASELINE_v1.md`](../../40-module-baselines/MOD016_SERVICE_DESK_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |

## 15. Non-Goals

Inherited verbatim from Baseline §11 and Module PRD §14 (as future items):

- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Ledger effects, if any (owned by MOD-002 Accounting via `ENG-015`/`ENG-016`).
- AI triage and suggested responses (PRD §14 Future Enhancements).
- Community forums (PRD §14 Future Enhancements).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and the MOD-006 … MOD-015 reference pattern, Phase 3 Solution Design proceeds in the sequence:

`WEB-016 → MOB-016 → API-016 → CPC-016 → VR-016`

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority in §4 is inherited verbatim from `MOD016_SERVICE_DESK_BASELINE_v1`.
2. Engine and ADR sets in §11 match Baseline §5–§6 exactly.
3. Dependency set in §12 matches Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD016-20260720T170000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD016_PUBLICATION_COMPLETE` → ready for `WEB-016 Service Desk Solution Design`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD016_SERVICE_DESK_BASELINE_v2`).

## 19. Repository State Transition

`MOD016_BASELINE_FROZEN` → **`MOD016_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD016_SERVICE_DESK_BASELINE_v1.md`](../../40-module-baselines/MOD016_SERVICE_DESK_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/service-desk/MODULE_PRD.md`](../../20-module-prds/service-desk/MODULE_PRD.md)
- [`docs/30-sprint-prds/service-desk/MOD-016_SPRINT_PLAN.md`](../../30-sprint-prds/service-desk/MOD-016_SPRINT_PLAN.md)
- [`docs/45-module-publications/pos/MOD-015_MODULE_PUBLICATION.md`](../pos/MOD-015_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
