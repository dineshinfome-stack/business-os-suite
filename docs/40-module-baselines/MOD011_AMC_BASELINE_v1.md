---
title: "MOD011_AMC_BASELINE_v1 — AMC Module Baseline"
summary: "Stage 3 Module Baseline for MOD-011 AMC. Freezes the module after successful completion of Sprint PRDs SPR-MOD-011-001..004. Reference consolidation only — introduces no new requirements, engines, ADRs, events, or Sprint PRDs."
baseline_id: "MOD011_AMC_BASELINE_v1"
module_id: "MOD-011"
module_name: "AMC"
version: "1.0"
status: "Frozen"
owner: "Service"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/amc/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-011-001", "SPR-MOD-011-002", "SPR-MOD-011-003", "SPR-MOD-011-004"]
layer: "delivery"
updated: "2026-07-16"
tags: ["baseline", "module", "MOD-011", "amc", "stage-3", "freeze"]
document_type: "Module Baseline"
governance_specification: "v1.0"
authored_via_template: "GT-004"
authored_via_template_version: "v1.0"
execution_id: "GT004-MOD011-20260716T005000Z-001"
parent_execution_id: "GT003-MOD011-004-20260716T004000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-015", "ENG-017", "ENG-020", "ENG-021", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
---

# MOD011_AMC_BASELINE_v1 — AMC Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-011. It introduces no new requirements, engines, ADRs, events, or Sprint PRDs. Future changes to AMC scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD011_AMC_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD011_AMC_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the AMC module (`MOD-011`). It certifies that:

- Every Sprint PRD reserved in [`MOD-011_SPRINT_PLAN.md`](../30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md) (`SPR-MOD-011-001` … `SPR-MOD-011-004`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-011. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD011_AMC_BASELINE_v1` is the authoritative repository-wide AMC contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-011 AMC Module PRD](../20-module-prds/amc/MODULE_PRD.md); reference only. AMC owns:

- Contract creation and management — Contract master lifecycle and Contract transaction lifecycle.
- Entitlement tracking — Entitlement and Coverage master lifecycles; entitlement consumption from field visits and service-ticket closures.
- Preventive visit scheduling — Visit Schedule transaction lifecycle and automated preventive schedule generation.
- Contract billing (upfront/periodic) — Contract Invoice transaction lifecycle via `ENG-015` Voucher; ledger effects owned by MOD-002 Accounting.
- Renewals and terminations — Renewal Terms master and Renewal transaction lifecycle; termination handling and auto-renewal rules.
- Service level tracking — Coverage-window enforcement and SLA tracking against entitlements.
- AMC Analytics & Compliance — Read-model operational reports (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability), dashboards, exports, and audit-readiness surface.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition. Ownership boundaries (identity/permissions, customer master, ledger posting, field-visit execution, service-desk closures, and cross-module KPI definitions) are established in the Module PRD §13 and preserved verbatim across the Sprint PRD family; this baseline does not restate them.

## 3. Implemented Sprint Summary

Each row records the sprint's title, status, and primary capability delivered — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-011-001](../30-sprint-prds/amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md) | AMC Foundation (Contracts & Entitlements) | Done | Contract, Entitlement, and Coverage master data; Contract transaction lifecycle; AMC configuration (SLA definitions, escalation policies, numbering series); AMC Ownership Convention; publication of `ContractSigned`. |
| [SPR-MOD-011-002](../30-sprint-prds/amc/SPR-MOD-011-002-preventive-visit-scheduling.md) | Preventive Visit Scheduling | Done | Visit Schedule transaction lifecycle; automated preventive schedule generation via `ENG-013` and `ENG-014`; coverage-window rule enforcement via `ENG-012`; publication of `VisitScheduled`; consumption of `FieldVisitCompleted` and `ServiceTicketClosed`. |
| [SPR-MOD-011-003](../30-sprint-prds/amc/SPR-MOD-011-003-contract-billing-and-renewals.md) | Contract Billing & Renewals | Done | Renewal Terms master; Contract Invoice transaction (upfront and periodic) via `ENG-015`; Renewal transaction lifecycle via `ENG-011`; notice-period and post-termination entitlement-block rules via `ENG-012`; publication of `ContractRenewed` and `ContractExpired`; consumption of `SalesInvoiceIssued`. |
| [SPR-MOD-011-004](../30-sprint-prds/amc/SPR-MOD-011-004-amc-analytics-and-compliance.md) | AMC Analytics & Compliance | Done | AMC read model; operational reports (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability); dashboards, exports, and audit-readiness surface. |

## 4. Capability Coverage

Every capability defined by the AMC Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the AMC Module PRD and the Sprint PRD family. No capability has been **added, removed, renamed, merged, split, or ownership-transferred** by this consolidation.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-011 Capability (Module PRD §2) | Originating Sprint |
| --- | --- |
| Contract creation and management | SPR-MOD-011-001 |
| Entitlement tracking | SPR-MOD-011-001 |
| Preventive visit scheduling | SPR-MOD-011-002 |
| Service level tracking | SPR-MOD-011-002 |
| Contract billing (upfront/periodic) | SPR-MOD-011-003 |
| Renewals and terminations | SPR-MOD-011-003 |
| AMC reports, dashboards, exports, audit readiness (Module PRD §9, §11) | SPR-MOD-011-004 |
| AMC governance conventions (summarized in §7) | Established across SPR-MOD-011-001 … SPR-MOD-011-004 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-011-001 | Contract creation and management; Entitlement tracking |
| SPR-MOD-011-002 | Preventive visit scheduling; Service level tracking |
| SPR-MOD-011-003 | Contract billing (upfront/periodic); Renewals and terminations |
| SPR-MOD-011-004 | AMC reports, dashboards, exports, audit readiness (§9, §11) |

No AMC capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-011-001` through `SPR-MOD-011-004`, and reconciled with the Sprint Plan §5 Engine Consumption Map.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim, and canonical ordering from `ENGINE_CATALOG.md` is preserved.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-011-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-011-001, 002, 003, 004 |
| ENG-003 (Permission Management Engine) | SPR-MOD-011-001 |
| ENG-004 (Audit Engine) | SPR-MOD-011-001, 002, 003, 004 |
| ENG-005 (Configuration Engine) | SPR-MOD-011-001, 002, 003 |
| ENG-006 (Localization Engine) | SPR-MOD-011-001 |
| ENG-007 (Document Engine) | SPR-MOD-011-001, 003 |
| ENG-008 (Attachment Engine) | SPR-MOD-011-001 |
| ENG-010 (Workflow Engine) | SPR-MOD-011-001, 002, 003 |
| ENG-011 (Approval Engine) | SPR-MOD-011-001, 003 |
| ENG-012 (Rules Engine) | SPR-MOD-011-001, 002, 003 |
| ENG-013 (Automation Engine) | SPR-MOD-011-002 |
| ENG-014 (Scheduler Engine) | SPR-MOD-011-002, 003 |
| ENG-015 (Voucher Engine) | SPR-MOD-011-003 |
| ENG-017 (Numbering Engine) | SPR-MOD-011-001, 003 |
| ENG-020 (Search Engine) | SPR-MOD-011-004 |
| ENG-021 (Reporting Engine) | SPR-MOD-011-004 |
| ENG-023 (Integration Engine) | SPR-MOD-011-004 |
| ENG-024 (Event Engine) | SPR-MOD-011-001, 002, 003, 004 |
| ENG-025 (Notification Engine) | SPR-MOD-011-001, 002, 003, 004 |
| ENG-027 (Export Engine) | SPR-MOD-011-004 |

No AMC sprint redefines engine behavior; all engines are consumed via their Capability Interfaces. `ENG-016` Posting is **not** consumed by any AMC sprint — all ledger effects are owned by MOD-002 Accounting via posting-rule bindings triggered by AMC-published events and Contract Invoices issued through `ENG-015` Voucher, per the governance boundary declared in the Module PRD and Sprint Plan §5.

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-011-001` through `SPR-MOD-011-004`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim; canonical ordering from `ADR_INDEX.md` is preserved.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-011-001, 002, 003, 004 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-011-001, 002, 003, 004 |

## 7. Governance Conventions Established

Every governance convention established across AMC Sprint PRDs 001–004 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-011-001 — AMC Foundation (Contracts & Entitlements)**

- **AMC Ownership Convention** — MOD-011 AMC owns the business semantics of Contract, Entitlement, and Coverage masters and the Contract transaction lifecycle, along with AMC configuration (SLA definitions, escalation policies, numbering series). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, attachments, workflow, approval, rules, eventing, notification) but MUST NOT redefine AMC business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-006 (customer master), MOD-002 (ledger posting), MOD-012 (field-visit execution), MOD-016 (service-desk closures), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD. `ContractSigned` events are published via `ENG-024`.

**From SPR-MOD-011-002 — Preventive Visit Scheduling**

- **Scheduling Ownership** — MOD-011 owns the Visit Schedule transaction lifecycle and automated preventive schedule generation via `ENG-013` Automation and `ENG-014` Scheduler. The coverage-window rule ("a visit cannot be booked outside the contract's coverage window") is enforced via `ENG-012`. `VisitScheduled` events are published via `ENG-024`; `FieldVisitCompleted` (from MOD-012 Field Service) and `ServiceTicketClosed` (from MOD-016 Service Desk) events are consumed read-only to update entitlement consumption. Field-visit execution remains owned by MOD-012 Field Service.

**From SPR-MOD-011-003 — Contract Billing & Renewals**

- **Billing & Renewals Ownership** — MOD-011 owns the Renewal Terms master, the Contract Invoice transaction lifecycle (upfront and periodic) via `ENG-015` Voucher, and the Renewal transaction lifecycle with multi-step approval via `ENG-011`. The notice-period rule ("renewal proposals must be issued before the notice period ends") and the post-termination entitlement-block rule ("terminated contracts cannot accept new entitlements") are enforced via `ENG-012`. Contract expiry is triggered on schedule via `ENG-014`. `ContractRenewed` and `ContractExpired` events are published via `ENG-024`; `SalesInvoiceIssued` (from MOD-002 Accounting) is consumed. Ledger effects remain owned by MOD-002 Accounting.

**From SPR-MOD-011-004 — AMC Analytics & Compliance**

- **AMC Read Model & Report Authority** — MOD-011 owns operational AMC reports (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability), dashboards, exports, and the AMC audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read-Model-Only Boundary Convention** — Dashboards, filters, drill-down, search (`ENG-020`), reports (`ENG-021`), integration (`ENG-023`), and export (`ENG-027`) operate over the AMC read model; no new master data, transactions, workflows, or published events are introduced by Sprint 4.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint AMC events (`ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired`) through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform, Accounting, Sales, Purchase, Inventory, CRM, HRMS, Payroll, Manufacturing, Projects, and Warehouse governance conventions established in prior Module Baselines.

**Freeze.** Governance conventions summarized herein are frozen for `MOD011_AMC_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-011-001` through `SPR-MOD-011-004`.** Every referenced event resolves verbatim from [`docs/20-module-prds/amc/MODULE_PRD.md`](../20-module-prds/amc/MODULE_PRD.md) §8 or the authoritative [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md). **No new event names SHALL be introduced by the Module Baseline.**

**Events Published by AMC** (verbatim from AMC Module PRD §8):

- `ContractSigned` — SPR-MOD-011-001
- `VisitScheduled` — SPR-MOD-011-002
- `ContractRenewed` — SPR-MOD-011-003
- `ContractExpired` — SPR-MOD-011-003

**Events Consumed by AMC** (verbatim from AMC Module PRD §8):

- `FieldVisitCompleted` (from MOD-012 Field Service) — SPR-MOD-011-002
- `ServiceTicketClosed` (from MOD-016 Service Desk) — SPR-MOD-011-002
- `SalesInvoiceIssued` (from MOD-002 Accounting) — SPR-MOD-011-003
- `ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired` (AMC-published; consumed by the read model) — SPR-MOD-011-004

Deferred event surfaces are inherited as `R-EV-*` risks from the originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD011_AMC_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by AMC. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**AMC SHALL consume Platform, CRM, Accounting, Field Service, Service Desk, and Analytics services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by AMC:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-006 CRM** — Customer master (read-only) for contract counterparties.
- **MOD-002 Accounting** — ledger effects of Contract Invoices and contract-billing events are owned by MOD-002 via `ENG-015` Voucher and `ENG-016` Posting bindings; MOD-011 does not invoke the posting engine directly. `SalesInvoiceIssued` event is consumed.
- **MOD-012 Field Service** — `FieldVisitCompleted` event for entitlement consumption tracking.
- **MOD-016 Service Desk** — `ServiceTicketClosed` event for entitlement consumption tracking.

**Downstream consumers of the AMC baseline** (per AMC Module PRD §13 *Provides To Modules*):

- **MOD-012 Field Service** — consumes `ContractSigned` and `VisitScheduled` for field-visit execution linkage.
- **MOD-002 Accounting** — consumes AMC-published Contract Invoice signals for ledger effects.
- **MOD-017 Analytics** — consumes AMC operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

Downstream modules MUST NOT own AMC master data, redefine the Contract / Visit Schedule / Renewal / Contract Invoice lifecycles, or redefine AMC analytics ownership. No downstream module owns AMC assets.

## 10. Module Completion & Freeze Statement

All four planned AMC Sprint PRDs (`SPR-MOD-011-001` … `SPR-MOD-011-004`) exist, the [Sprint Plan](../30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md) is executed, and repository verification has been completed under GT-004. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-011 AMC is now frozen for downstream consumption. Future changes to `MOD011_AMC_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD011_AMC_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD011_AMC_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Usage-based contracts (Module PRD §14 Future Enhancements).
- Contract profitability dashboards beyond the read-model report surfaced in Sprint 4 (Module PRD §14).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/amc/MODULE_PRD.md`](../20-module-prds/amc/MODULE_PRD.md) — MOD-011 Module PRD (authoritative).
- [`docs/30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md`](../30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md`](../30-sprint-prds/amc/SPR-MOD-011-001-amc-foundation-contracts-and-entitlements.md)
- [`docs/30-sprint-prds/amc/SPR-MOD-011-002-preventive-visit-scheduling.md`](../30-sprint-prds/amc/SPR-MOD-011-002-preventive-visit-scheduling.md)
- [`docs/30-sprint-prds/amc/SPR-MOD-011-003-contract-billing-and-renewals.md`](../30-sprint-prds/amc/SPR-MOD-011-003-contract-billing-and-renewals.md)
- [`docs/30-sprint-prds/amc/SPR-MOD-011-004-amc-analytics-and-compliance.md`](../30-sprint-prds/amc/SPR-MOD-011-004-amc-analytics-and-compliance.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`](../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md) — authoring template.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD006_CRM_BASELINE_v1.md`](./MOD006_CRM_BASELINE_v1.md) — upstream CRM baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
