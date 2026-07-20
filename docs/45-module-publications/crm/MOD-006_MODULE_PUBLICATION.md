---
title: "MOD-006 Module Publication — CRM"
summary: "GT-005 Module Publication for MOD-006 CRM. Terminal governance artifact derived exclusively from MOD006_CRM_BASELINE_v1 and MOD-006 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-006_MODULE_PUBLICATION"
publication_id: "MOD-006_MODULE_PUBLICATION"
module_id: "MOD-006"
module_name: "CRM"
version: "1.0"
status: "Published"
owner: "Revenue"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/crm/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD006_CRM_BASELINE_v1.md"
source_module: "MOD-006"
source_sprints: ["SPR-MOD-006-001", "SPR-MOD-006-002", "SPR-MOD-006-003", "SPR-MOD-006-004", "SPR-MOD-006-005", "SPR-MOD-006-006"]
layer: "delivery"
updated: "2026-07-20"
tags: ["publication", "module", "MOD-006", "crm", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD006-20260720T070000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
related_modules: ["MOD-001", "MOD-003", "MOD-012", "MOD-016", "MOD-017"]
---

# MOD-006 Module Publication — CRM

> **Reference publication only.** This publication is a faithful representation of [`MOD006_CRM_BASELINE_v1`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) and the [`MOD-006 Module PRD`](../../20-module-prds/crm/MODULE_PRD.md). It introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-006
- **Module Name:** CRM
- **Owner:** Revenue
- **Publication ID:** MOD-006_MODULE_PUBLICATION
- **Source Baseline:** `MOD006_CRM_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md`](../../30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-006-001` … `SPR-MOD-006-006`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

CRM is the authoritative bounded context for the Customer Relationship domain. It owns the enterprise Account and Contact master, Lead capture and qualification, Opportunity pipeline management, Activity/Meeting logging, Campaign and Segment execution with marketing-consent enforcement, and the Customer 360 read model together with CRM operational reports. Downstream modules consume CRM state and never redefine it. The commercial Customer master remains owned by MOD-003 Sales and is consumed by CRM.

## 3. Approved Scope

Restates the scope consolidated in `MOD006_CRM_BASELINE_v1` §2 and the Module PRD §2. CRM owns:

- Account master, Contact master, and CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates).
- Lead master lifecycle, lead scoring evaluation, assignment rule execution, and single-shot lead-to-opportunity conversion.
- Opportunity master, pipeline stage transitions, and win/loss classification.
- Activity and Meeting transaction lifecycles and activity logging against Accounts, Contacts, Leads, and Opportunities.
- Campaign master, Segment master, and Campaign Send transactions with marketing-consent enforcement.
- Customer 360 read model, CRM operational reports (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360), dashboards, exports, and audit readiness.

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Every authority is inherited verbatim from `MOD006_CRM_BASELINE_v1` §7. This publication restates them for consumer convenience; the Module Baseline remains authoritative.

### 4.1 SPR-MOD-006-001 — CRM Foundation

- **CRM Ownership Convention Authority** — CRM owns the business semantics of Account master, Contact master, and CRM operations configuration under a tenant/company. ERP Core Engines provide shared infrastructure but MUST NOT redefine CRM business rules.
- **Account/Contact Authority Convention Authority** — Account and Contact master data lifecycle (create, edit, archive) is owned by CRM as the single enterprise source; other modules reference accounts/contacts by stable identifier and never mutate master state. The commercial Customer master remains owned by MOD-003 Sales.

### 4.2 SPR-MOD-006-002 — Leads

- **Lead Ownership Convention Authority** — CRM owns the Lead master lifecycle, lead scoring evaluation, assignment rule execution, and single-shot lead-to-opportunity conversion. Downstream modules consume `LeadCreated` events and read APIs and never introduce independent lead lifecycles.

### 4.3 SPR-MOD-006-003 — Opportunities

- **Opportunity Ownership Convention Authority** — CRM owns the Opportunity master lifecycle, pipeline stage transitions, and win/loss classification. Downstream modules consume `OpportunityWon`/`OpportunityLost` events and never introduce independent opportunity lifecycles. Sales Order / Quotation / Invoice / Voucher / GL surfaces remain owned by MOD-003 Sales and MOD-002 Accounting.

### 4.4 SPR-MOD-006-004 — Activities & Communications

- **Activity Ownership Convention Authority** — CRM owns the Activity and Meeting transaction lifecycles and Communication Log, and activity logging against Accounts, Contacts, Leads, and Opportunities. Downstream modules consume `ActivityLogged` events and read APIs and never introduce independent activity lifecycles.

### 4.5 SPR-MOD-006-005 — Campaigns

- **Campaign Ownership Convention Authority** — CRM owns the Campaign master, Segment master, and Campaign Send transaction. Downstream modules consume `CampaignSent` events and never introduce independent campaign lifecycles.
- **Marketing Consent Convention Authority** — Campaign Sends SHALL enforce marketing-consent invariants on the target audience; recipients lacking recorded consent are excluded at send time. Consent capture is an Account/Contact attribute owned by CRM Foundation.

### 4.6 SPR-MOD-006-006 — Customer 360 & Analytics

- **CRM Analytics Ownership Convention Authority** — CRM analytics consume operational data from prior CRM sprints and cross-module events (`SalesInvoiceIssued`, `ServiceTicketClosed`); analytics SHALL NOT redefine operational ownership.
- **Read Model Boundary Convention Authority** — Dashboards, filters, drill-down, and export operate over the CRM read model; no transactional side effects and no new domain events published.
- **Operational Control Boundary Convention Authority** — Operational controls are observation-only surfaces over prior-sprint state; controls never redefine operational ownership.
- **Audit Readiness Boundary Convention Authority** — Audit readiness exposes prior-sprint events through the read model; audit collection remains owned by Platform (`ENG-004`).

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-006-001` … `SPR-MOD-006-006`) as consolidated in `MOD006_CRM_BASELINE_v1`. This publication introduces no new requirements. See the source Sprint PRDs for requirement-level detail.

## 6. Business Rules

Business rules are inherited verbatim from the Module PRD §7 and the Sprint PRD family:

- A lead may be converted only once (single-shot conversion).
- Assignment rules must resolve to exactly one owner.
- Marketing consent must be recorded on the target Account/Contact before campaign inclusion; non-consenting recipients are excluded at send time.
- Account and Contact master lifecycle (create, edit, archive) is CRM-owned; no other module mutates master state.
- Opportunity win/loss classification is terminal within CRM; downstream commercial documents are created by MOD-003 Sales.
- CRM transactions have no ledger effect; posting is out of scope (owned by MOD-002 Accounting).
- Analytics surfaces are read-only projections over the CRM read model.

## 7. Master Data Authorities

Inherited verbatim from Module PRD §5 and Baseline §4:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Account | SPR-MOD-006-001 |
| Contact | SPR-MOD-006-001 |
| Lead | SPR-MOD-006-002 |
| Opportunity | SPR-MOD-006-003 |
| Campaign | SPR-MOD-006-005 |
| Segment | SPR-MOD-006-005 |

## 8. Transaction Authorities

Inherited verbatim from Module PRD §6 and Baseline §4:

| Transaction | Originating Sprint |
| --- | --- |
| Activity | SPR-MOD-006-004 |
| Meeting | SPR-MOD-006-004 |
| Campaign Send | SPR-MOD-006-005 |

## 9. Published Events

Emitted via `ENG-024` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by CRM; delivery infrastructure owned by Platform. Verbatim from Baseline §8 and Module PRD §8:

- `LeadCreated` — SPR-MOD-006-002
- `OpportunityWon` — SPR-MOD-006-003
- `OpportunityLost` — SPR-MOD-006-003
- `ActivityLogged` — SPR-MOD-006-004
- `CampaignSent` — SPR-MOD-006-005

## 10. Consumed Events

Consumed from upstream business modules via `ENG-024`. Consumption is read-only; CRM does not own the semantics of these events. Verbatim from Baseline §8:

- `CustomerCreated` (MOD-003 Sales) — SPR-MOD-006-001
- `SalesInvoiceIssued` (MOD-003 Sales) — SPR-MOD-006-006
- `ServiceTicketClosed` (MOD-016 Service Desk) — SPR-MOD-006-006

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-006 via their Capability Interfaces. Engine set is inherited verbatim from `MOD006_CRM_BASELINE_v1` §5:

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-006-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-006-001, 002, 003, 004, 005, 006 |
| ENG-003 (Permission Management Engine) | SPR-MOD-006-001 |
| ENG-004 (Audit Engine) | SPR-MOD-006-001, 002, 003, 004, 005, 006 |
| ENG-005 (Configuration Engine) | SPR-MOD-006-001, 003 |
| ENG-006 (Localization Engine) | SPR-MOD-006-001 |
| ENG-007 (Document Engine) | SPR-MOD-006-001, 004, 005 |
| ENG-008 (Attachment Engine) | SPR-MOD-006-001, 004 |
| ENG-010 (Workflow Engine) | SPR-MOD-006-002, 003, 004, 005 |
| ENG-011 (Approval Engine) | SPR-MOD-006-003, 005 |
| ENG-012 (Rules Engine) | SPR-MOD-006-001, 002, 003, 004, 005 |
| ENG-013 (Automation Engine) | SPR-MOD-006-002, 005 |
| ENG-020 (Search Engine) | SPR-MOD-006-006 |
| ENG-021 (Reporting Engine) | SPR-MOD-006-006 |
| ENG-022 (Dashboard Engine) | SPR-MOD-006-006 |
| ENG-023 (Messaging Engine) | SPR-MOD-006-005 |
| ENG-024 (Event Engine) | SPR-MOD-006-001, 002, 003, 004, 005, 006 |
| ENG-025 (Notification Engine) | SPR-MOD-006-002, 003, 004, 005, 006 |
| ENG-027 (Export Engine) | SPR-MOD-006-006 |
| ENG-028 (Analytics Read-Model Engine) | SPR-MOD-006-006 |

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-014` (Audit Strategy), `ADR-032` (RBAC + ABAC).

## 12. Dependencies

Inherited verbatim from `MOD006_CRM_BASELINE_v1` §9 and Module PRD §13:

**Upstream contracts consumed by CRM:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- `MOD-003 Sales` — `CustomerCreated`, `SalesInvoiceIssued`; commercial Customer master ownership.
- `MOD-016 Service Desk` — `ServiceTicketClosed` for Customer 360 aggregation.

**Downstream consumers of CRM:**

- `MOD-003 Sales`, `MOD-012 Field Service`, `MOD-016 Service Desk`, `MOD-017 Analytics`.

## 13. Ownership Boundaries

Inherited verbatim from Baseline §7 and §9:

- MOD-006 owns **only** the authorities enumerated in §4.
- Downstream modules MUST NOT own CRM master data, redefine Lead/Opportunity/Activity/Campaign lifecycles, or redefine CRM analytics ownership.
- The commercial Customer master remains owned by MOD-003 Sales; CRM consumes it.
- `ENG-004` remains authoritative for audit collection; CRM owns only the business-level audit-readiness surface.
- `ENG-024` remains authoritative for event delivery infrastructure; CRM owns the semantics of the events it emits.
- CRM transactions have no ledger effect; ledger posting remains owned by MOD-002 Accounting.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md`](../../30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | `SPR-MOD-006-001` … `SPR-MOD-006-006` |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |

## 15. Non-Goals

Inherited verbatim from Baseline §11 and Module PRD §14 (as future items):

- Advanced marketing automation beyond Campaign Send (multi-step journeys, drip nurture).
- AI-driven lead scoring and next-best-action recommendations (owned by MOD-018 AI Workspace when introduced).
- External social listening and social CRM integrations.
- Ledger posting or financial voucher creation (owned by MOD-002 Accounting).
- Statutory filing or regulatory reporting.

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and the MOD-001/002/003 reference pattern, Phase 3 Solution Design proceeds in the sequence:

`WEB-006 → MOB-006 → API-006 → CPC-006 → VR-006`

- Next executable pass: **WEB-006 CRM Solution Design**.
- Subsequent passes: MOB-006, API-006, CPC-006, VR-006.

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority enumerated in §4 is inherited verbatim from `MOD006_CRM_BASELINE_v1`.
2. Engine and ADR sets in §11 match the Module Baseline §5–§6 exactly.
3. Downstream dependency set in §12 matches the Module Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD006-20260720T070000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD006_PUBLICATION_COMPLETE` → ready for `WEB-006 CRM Solution Design`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD006_CRM_BASELINE_v2`).

## 19. Repository State Transition

`MOD006_BASELINE_FROZEN` → **`MOD006_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD006_CRM_BASELINE_v1.md`](../../40-module-baselines/MOD006_CRM_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)
- [`docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md`](../../30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md)
- [`docs/45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md`](../accounting/MOD-002_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
