---
title: "MOD006_CRM_BASELINE_v1 — CRM Module Baseline"
summary: "Stage 3 Module Baseline for MOD-006 CRM. Freezes the module after successful completion of Sprint PRDs SPR-MOD-006-001..006. Reference consolidation only — introduces no new requirements, engines, ADRs, events, or Sprint PRDs."
baseline_id: "MOD006_CRM_BASELINE_v1"
module_id: "MOD-006"
module_name: "CRM"
version: "1.0"
status: "Frozen"
owner: "Revenue"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/crm/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-006-001", "SPR-MOD-006-002", "SPR-MOD-006-003", "SPR-MOD-006-004", "SPR-MOD-006-005", "SPR-MOD-006-006"]
layer: "delivery"
updated: "2026-07-14"
tags: ["baseline", "module", "MOD-006", "crm", "stage-3", "freeze"]
document_type: "Module Baseline"
governance_specification: "v1.0"
authored_via_template: "GT-004"
authored_via_template_version: "v1.0"
execution_id: "GT004-MOD006-20260714-001"
parent_execution_id: "GT003-MOD006-006-20260714-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
---

# MOD006_CRM_BASELINE_v1 — CRM Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-006. It introduces no new requirements, engines, ADRs, events, or Sprint PRDs. Future changes to CRM scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD006_CRM_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD006_CRM_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the CRM module (`MOD-006`). It certifies that:

- Every Sprint PRD reserved in [`MOD-006_SPRINT_PLAN.md`](../30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md) (`SPR-MOD-006-001` … `SPR-MOD-006-006`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-006. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD006_CRM_BASELINE_v1` is the authoritative repository-wide CRM contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-006 CRM Module PRD](../20-module-prds/crm/MODULE_PRD.md); reference only. CRM owns:

- CRM Foundation — Account master, Contact master, CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates), and the Accounts & Contacts submodule surface under a tenant/company.
- Leads — Lead master, lead scoring evaluation, assignment rule execution, and single-shot lead-to-opportunity conversion.
- Opportunities — Opportunity master, pipeline stage transitions, and win/loss classification.
- Activities & Communications — Activity and Meeting transaction lifecycles and activity logging against accounts, contacts, leads, and opportunities.
- Campaigns — Campaign master, Segment master, and Campaign Send transactions with marketing-consent enforcement.
- Customer 360 & Analytics — Customer 360 read model, CRM operational reports (Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360), dashboards, exports, and audit readiness.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition. The commercial Customer master remains owned by MOD-003 Sales and is consumed by CRM.

## 3. Implemented Sprint Summary

Each row records the sprint's title, status, and primary capability delivered — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-006-001](../30-sprint-prds/crm/SPR-MOD-006-001-crm-foundation.md) | CRM Foundation | Done | Account master, Contact master, CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates), Accounts & Contacts submodule surface, foundation events, and the CRM Ownership Convention and Account/Contact Authority Convention. |
| [SPR-MOD-006-002](../30-sprint-prds/crm/SPR-MOD-006-002-leads.md) | Leads | Done | Lead master lifecycle, lead scoring evaluation, assignment rule execution, single-shot lead-to-opportunity conversion, `LeadCreated` event, and the Lead Ownership Convention. |
| [SPR-MOD-006-003](../30-sprint-prds/crm/SPR-MOD-006-003-opportunities.md) | Opportunities | Done | Opportunity master, pipeline stage transitions, win/loss classification, `OpportunityWon`/`OpportunityLost` events, and the Opportunity Ownership Convention. |
| [SPR-MOD-006-004](../30-sprint-prds/crm/SPR-MOD-006-004-activities-communications.md) | Activities & Communications | Done | Activity/Meeting lifecycles, activity logging against Accounts, Contacts, Leads, and Opportunities, `ActivityLogged` event, and the Activity Ownership Convention. |
| [SPR-MOD-006-005](../30-sprint-prds/crm/SPR-MOD-006-005-campaigns.md) | Campaigns | Done | Campaign master, Segment master, Campaign Send lifecycle with marketing-consent enforcement, `CampaignSent` event, and the Campaign Ownership Convention and Marketing Consent Convention. |
| [SPR-MOD-006-006](../30-sprint-prds/crm/SPR-MOD-006-006-customer-360-analytics.md) | Customer 360 & Analytics | Done | Customer 360 read model, CRM operational reports (Pipeline, Win/Loss, Activity, Campaign Effectiveness, Customer 360), dashboards, exports, audit readiness, and the CRM Analytics Ownership Convention, Read Model Boundary Convention, and Operational Control Boundary Convention. |

## 4. Capability Coverage

Every capability defined by the CRM Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the CRM Module PRD and the Sprint PRD family. No capability has been **added, removed, renamed, merged, split, or ownership-transferred** by this consolidation.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-006 Capability Area | Originating Sprint |
| --- | --- |
| Account and contact management | SPR-MOD-006-001 |
| CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates) | SPR-MOD-006-001 |
| Lead capture and qualification | SPR-MOD-006-002 |
| Opportunity pipeline | SPR-MOD-006-003 |
| Activity, task, and meeting tracking | SPR-MOD-006-004 |
| Campaigns and segmentation | SPR-MOD-006-005 |
| Customer 360 view; CRM reports, dashboards, exports, audit readiness | SPR-MOD-006-006 |
| CRM governance conventions (all summarized in §7) | Established across SPR-MOD-006-001 … SPR-MOD-006-006 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-006-001 | Account and contact management; CRM operations configuration |
| SPR-MOD-006-002 | Lead capture and qualification |
| SPR-MOD-006-003 | Opportunity pipeline |
| SPR-MOD-006-004 | Activity, task, and meeting tracking |
| SPR-MOD-006-005 | Campaigns and segmentation |
| SPR-MOD-006-006 | Customer 360 view; CRM reports and analytics |

No CRM capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-006-001` through `SPR-MOD-006-006`.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim, and canonical ordering from `ENGINE_CATALOG.md` is preserved.

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

No CRM sprint redefines engine behavior; all engines are consumed via their Capability Interfaces.

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-006-001` through `SPR-MOD-006-006`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim; canonical ordering from `ADR_INDEX.md` is preserved.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-006-001, 002, 003, 004, 005, 006 |
| ADR-014 (Audit Strategy) | SPR-MOD-006-001, 002, 003, 004, 005, 006 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-006-001, 002, 003, 004, 005, 006 |

## 7. Governance Conventions Established

Every governance convention established across CRM Sprint PRDs 001–006 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-006-001 — CRM Foundation**

- **CRM Ownership Convention** — CRM owns the business semantics of Account master, Contact master, and CRM operations configuration (pipeline stages, lead scoring model, assignment rules, communication templates) under a tenant/company. ERP Core Engines provide shared infrastructure but MUST NOT redefine CRM business rules. Downstream modules consume Account/Contact master data and CRM services and never introduce independent account or contact masters.
- **Account/Contact Authority Convention** — Account and Contact master data lifecycle (create, edit, archive) is owned by CRM as the single enterprise source; other modules reference accounts/contacts by stable identifier and never mutate master state. The commercial Customer master remains owned by MOD-003 Sales.

**From SPR-MOD-006-002 — Leads**

- **Lead Ownership Convention** — CRM owns the Lead master lifecycle, lead scoring evaluation, assignment rule execution, and single-shot lead-to-opportunity conversion. Downstream modules consume `LeadCreated` events and read APIs and never introduce independent lead lifecycles.

**From SPR-MOD-006-003 — Opportunities**

- **Opportunity Ownership Convention** — CRM owns the Opportunity master lifecycle, pipeline stage transitions, and win/loss classification. Downstream modules consume `OpportunityWon`/`OpportunityLost` events and read APIs and never introduce independent opportunity lifecycles. Sales Order / Quotation / Invoice / Voucher / GL surfaces remain owned by MOD-003 Sales and MOD-002 Accounting.

**From SPR-MOD-006-004 — Activities & Communications**

- **Activity Ownership Convention** — CRM owns the Activity and Meeting transaction lifecycles and Communication Log, and activity logging against Accounts, Contacts, Leads, and Opportunities. Downstream modules consume `ActivityLogged` events and read APIs and never introduce independent activity lifecycles.

**From SPR-MOD-006-005 — Campaigns**

- **Campaign Ownership Convention** — CRM owns the Campaign master, Segment master, and Campaign Send transaction. Downstream modules consume `CampaignSent` events and read APIs and never introduce independent campaign lifecycles.
- **Marketing Consent Convention** — Campaign Sends SHALL enforce marketing-consent invariants on the target audience; recipients lacking recorded consent are excluded at send time. Consent capture remains an Account/Contact attribute owned by CRM Foundation.

**From SPR-MOD-006-006 — Customer 360 & Analytics**

- **CRM Analytics Ownership Convention** — CRM analytics consume operational data from prior CRM sprints and cross-module events (`SalesInvoiceIssued`, `ServiceTicketClosed`); analytics SHALL NOT redefine operational ownership.
- **Read Model Boundary Convention** — Dashboards, filters, drill-down, and export operate over the CRM read model; no transactional side effects and no new domain events published.
- **Operational Control Boundary Convention** — Operational controls are observation-only surfaces over prior-sprint state; controls never redefine operational ownership.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint events through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform, Accounting, Sales, Purchase, Inventory, and Warehouse governance conventions established in prior Module Baselines.

**Freeze.** Governance conventions summarized herein are frozen for `MOD006_CRM_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-006-001` through `SPR-MOD-006-006`.** Every referenced event resolves verbatim from [`docs/20-module-prds/crm/MODULE_PRD.md`](../20-module-prds/crm/MODULE_PRD.md) §8 or the authoritative [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md). **No new event names SHALL be introduced by the Module Baseline.**

**Events Published by CRM** (verbatim from CRM Module PRD §8):

- `LeadCreated` — SPR-MOD-006-002
- `OpportunityWon` — SPR-MOD-006-003
- `OpportunityLost` — SPR-MOD-006-003
- `ActivityLogged` — SPR-MOD-006-004
- `CampaignSent` — SPR-MOD-006-005

**Events Consumed by CRM** (verbatim from CRM Module PRD §8 and upstream module PRDs):

- `CustomerCreated` (from MOD-003 Sales) — SPR-MOD-006-001
- `SalesInvoiceIssued` (from MOD-003 Sales) — SPR-MOD-006-006
- `ServiceTicketClosed` (from MOD-016 Service Desk) — SPR-MOD-006-006
- `account.*` / `contact.*` (from SPR-MOD-006-001) — consumed by SPR-MOD-006-002, 003, 004, 005, 006

Deferred event surfaces are inherited as `R-EV-*` risks from the originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD006_CRM_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by CRM. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**CRM SHALL consume Platform, Sales, Service Desk, Communications, and Analytics services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by CRM:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-003 Sales** — `CustomerCreated` and `SalesInvoiceIssued` events; commercial Customer master ownership.
- **MOD-016 Service Desk** — `ServiceTicketClosed` event for Customer 360 aggregation.

**Downstream consumers of the CRM baseline:**

- **MOD-003 Sales** — consumes Account/Contact master data, Lead conversion handoff, and Opportunity win events for quotation/order seeding.
- **MOD-012 Communications** — consumes CRM communication templates and Campaign Send contracts (as applicable).
- **MOD-016 Service Desk** — consumes Account/Contact master data and Activity linkage.
- **MOD-017 Analytics** — consumes CRM operational read models for portfolio KPIs; owns cross-module KPI definitions.

Downstream modules MUST NOT own CRM master data, redefine the Lead / Opportunity / Activity / Campaign lifecycles, or redefine CRM analytics ownership. No downstream module owns CRM assets.

## 10. Module Completion & Freeze Statement

All six planned CRM Sprint PRDs (`SPR-MOD-006-001` … `SPR-MOD-006-006`) exist, the [Sprint Plan](../30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md) is executed, and repository verification has been completed under GT-004. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-006 CRM is now frozen for downstream consumption. Future changes to `MOD006_CRM_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD006_CRM_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD006_CRM_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Advanced marketing automation beyond Campaign Send (multi-step journeys, drip nurture).
- AI-driven lead scoring and next-best-action recommendations (owned by MOD-018 AI Workspace when introduced).
- External social listening and social CRM integrations.
- Advanced dashboard authoring beyond the read-model surface delivered in SPR-MOD-006-006.
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/crm/MODULE_PRD.md`](../20-module-prds/crm/MODULE_PRD.md) — MOD-006 Module PRD (authoritative).
- [`docs/30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md`](../30-sprint-prds/crm/MOD-006_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/crm/SPR-MOD-006-001-crm-foundation.md`](../30-sprint-prds/crm/SPR-MOD-006-001-crm-foundation.md)
- [`docs/30-sprint-prds/crm/SPR-MOD-006-002-leads.md`](../30-sprint-prds/crm/SPR-MOD-006-002-leads.md)
- [`docs/30-sprint-prds/crm/SPR-MOD-006-003-opportunities.md`](../30-sprint-prds/crm/SPR-MOD-006-003-opportunities.md)
- [`docs/30-sprint-prds/crm/SPR-MOD-006-004-activities-communications.md`](../30-sprint-prds/crm/SPR-MOD-006-004-activities-communications.md)
- [`docs/30-sprint-prds/crm/SPR-MOD-006-005-campaigns.md`](../30-sprint-prds/crm/SPR-MOD-006-005-campaigns.md)
- [`docs/30-sprint-prds/crm/SPR-MOD-006-006-customer-360-analytics.md`](../30-sprint-prds/crm/SPR-MOD-006-006-customer-360-analytics.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`](../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md) — authoring template.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md`](./MOD003_SALES_BASELINE_v1.md) — upstream Sales baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
