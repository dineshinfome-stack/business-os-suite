---
title: "MOD-011 Module Publication — AMC"
summary: "GT-005 Module Publication for MOD-011 AMC. Terminal governance artifact derived exclusively from MOD011_AMC_BASELINE_v1 and MOD-011 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-011_MODULE_PUBLICATION"
publication_id: "MOD-011_MODULE_PUBLICATION"
module_id: "MOD-011"
module_name: "AMC"
version: "1.0"
status: "Published"
owner: "Service"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/amc/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD011_AMC_BASELINE_v1.md"
source_module: "MOD-011"
source_sprints: ["SPR-MOD-011-001", "SPR-MOD-011-002", "SPR-MOD-011-003", "SPR-MOD-011-004"]
layer: "delivery"
updated: "2026-07-20"
tags: ["publication", "module", "MOD-011", "amc", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD011-20260720T120000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-015", "ENG-017", "ENG-020", "ENG-021", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
related_modules: ["MOD-001", "MOD-006", "MOD-002", "MOD-012", "MOD-016", "MOD-017"]
---

# MOD-011 Module Publication — AMC

> **Reference publication only.** Faithful representation of [`MOD011_AMC_BASELINE_v1`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) and the [`MOD-011 Module PRD`](../../20-module-prds/amc/MODULE_PRD.md). Introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-011
- **Module Name:** AMC (Annual Maintenance Contracts)
- **Owner:** Service
- **Publication ID:** MOD-011_MODULE_PUBLICATION
- **Source Baseline:** `MOD011_AMC_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md`](../../30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-011-001` … `SPR-MOD-011-004`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

AMC is the authoritative bounded context for Annual Maintenance Contracts (Baseline §1; PRD §1). It owns Contract, Entitlement, Coverage, and Renewal Terms master lifecycles and AMC configuration (SLA definitions, escalation policies, notice periods, auto-renewal rules, numbering series); Contract, Visit Schedule, Renewal, and Contract Invoice transaction lifecycles; automated preventive-visit scheduling and coverage-window enforcement; contract billing (upfront and periodic) via `ENG-015`; renewals and terminations with multi-step approval; and the AMC operational read model for reports, dashboards, exports, and audit readiness (Baseline §2; PRD §2). Identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration; the Customer master remains owned by MOD-006 CRM; ledger posting for Contract Invoices and contract-billing events is produced by MOD-002 Accounting via `ENG-015` and `ENG-016`; field-visit execution remains owned by MOD-012 Field Service; service-desk closures remain owned by MOD-016 Service Desk; cross-module KPI definitions remain owned by MOD-017 Analytics (Baseline §2, §9; PRD §2, §13).

## 3. Approved Scope

Restates the scope consolidated in `MOD011_AMC_BASELINE_v1` §2 and the Module PRD §2. AMC owns:

- Contract creation and management — Contract master lifecycle and Contract transaction lifecycle (Baseline §2; PRD §2, §5, §6).
- Entitlement tracking — Entitlement and Coverage master lifecycles; entitlement consumption from field visits and service-ticket closures (Baseline §2; PRD §2, §5).
- Preventive visit scheduling — Visit Schedule transaction lifecycle and automated preventive schedule generation (Baseline §2; PRD §2, §6).
- Contract billing (upfront/periodic) — Contract Invoice transaction lifecycle via `ENG-015` Voucher; ledger effects owned by MOD-002 (Baseline §2; PRD §2, §6).
- Renewals and terminations — Renewal Terms master and Renewal transaction lifecycle; termination handling and auto-renewal rules (Baseline §2; PRD §2, §5, §6, §10).
- Service level tracking — Coverage-window enforcement and SLA tracking against entitlements (Baseline §2; PRD §2, §7, §10).
- AMC Analytics & Compliance — read-model operational reports (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability), dashboards, exports, and audit-readiness surface (Baseline §2; PRD §9, §11).

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Inherited verbatim from `MOD011_AMC_BASELINE_v1` §7.

### 4.1 SPR-MOD-011-001 — AMC Foundation (Contracts & Entitlements)

- **AMC Ownership Convention Authority** — MOD-011 AMC owns the business semantics of Contract, Entitlement, and Coverage masters and the Contract transaction lifecycle, along with AMC configuration (SLA definitions, escalation policies, numbering series). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, attachments, workflow, approval, rules, eventing, notification) but MUST NOT redefine AMC business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-006 (customer master), MOD-002 (ledger posting), MOD-012 (field-visit execution), MOD-016 (service-desk closures), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD. `ContractSigned` events are published via `ENG-024`.

### 4.2 SPR-MOD-011-002 — Preventive Visit Scheduling

- **Scheduling Ownership Authority** — MOD-011 owns the Visit Schedule transaction lifecycle and automated preventive schedule generation via `ENG-013` Automation and `ENG-014` Scheduler. The coverage-window rule ("a visit cannot be booked outside the contract's coverage window") is enforced via `ENG-012`. `VisitScheduled` events are published via `ENG-024`; `FieldVisitCompleted` (from MOD-012) and `ServiceTicketClosed` (from MOD-016) events are consumed read-only to update entitlement consumption. Field-visit execution remains owned by MOD-012.

### 4.3 SPR-MOD-011-003 — Contract Billing & Renewals

- **Billing & Renewals Ownership Authority** — MOD-011 owns the Renewal Terms master, the Contract Invoice transaction lifecycle (upfront and periodic) via `ENG-015` Voucher, and the Renewal transaction lifecycle with multi-step approval via `ENG-011`. The notice-period rule ("renewal proposals must be issued before the notice period ends") and the post-termination entitlement-block rule ("terminated contracts cannot accept new entitlements") are enforced via `ENG-012`. Contract expiry is triggered on schedule via `ENG-014`. `ContractRenewed` and `ContractExpired` events are published via `ENG-024`; `SalesInvoiceIssued` (from MOD-002) is consumed. Ledger effects remain owned by MOD-002.

### 4.4 SPR-MOD-011-004 — AMC Analytics & Compliance

- **AMC Read Model & Report Authority** — MOD-011 owns operational AMC reports (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability), dashboards, exports, and the AMC audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read-Model-Only Boundary Convention Authority** — Dashboards, filters, drill-down, search (`ENG-020`), reports (`ENG-021`), integration (`ENG-023`), and export (`ENG-027`) operate over the AMC read model; no new master data, transactions, workflows, or published events are introduced by Sprint 4.
- **Audit Readiness Boundary Convention Authority** — Audit readiness exposes prior-sprint AMC events (`ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired`) through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-011-001` … `SPR-MOD-011-004`) as consolidated in `MOD011_AMC_BASELINE_v1`. This publication introduces no new requirements.

## 6. Business Rules

Verbatim from Module PRD §7 and Baseline §7:

- A visit cannot be booked outside the contract's coverage window (PRD §7).
- Renewal proposals must be issued before the notice period ends (PRD §7).
- Terminated contracts cannot accept new entitlements (PRD §7).
- AMC master and transaction lifecycles are AMC-owned; no other module mutates AMC state (Baseline §7).
- The Customer master is owned by MOD-006 CRM; AMC consumes it read-only (PRD §13; Baseline §9).
- AMC does not implement double-entry posting; ledger effects of Contract Invoices and contract-billing events are produced by MOD-002 Accounting via `ENG-015` and `ENG-016` (PRD §2, §6; Baseline §5, §9).
- Analytics surfaces are read-only projections over the AMC read model (Baseline §7).

## 7. Master Data Authorities

Verbatim from Module PRD §5 and Baseline §4:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Contract | SPR-MOD-011-001 |
| Entitlement | SPR-MOD-011-001 |
| Coverage | SPR-MOD-011-001 |
| Renewal Terms | SPR-MOD-011-003 |

## 8. Transaction Authorities

Verbatim from Module PRD §6 and Baseline §4:

| Transaction | Originating Sprint |
| --- | --- |
| Contract | SPR-MOD-011-001 |
| Visit Schedule | SPR-MOD-011-002 |
| Renewal | SPR-MOD-011-003 |
| Contract Invoice | SPR-MOD-011-003 |

## 9. Published Events

Emitted via `ENG-024` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by AMC; delivery infrastructure owned by Platform. Verbatim from Baseline §8 and Module PRD §8:

- `ContractSigned` — SPR-MOD-011-001
- `VisitScheduled` — SPR-MOD-011-002
- `ContractRenewed` — SPR-MOD-011-003
- `ContractExpired` — SPR-MOD-011-003

## 10. Consumed Events

Consumed via `ENG-024`. Consumption is read-only. Verbatim from Baseline §8 and Module PRD §8:

- `FieldVisitCompleted` (from MOD-012 Field Service) — SPR-MOD-011-002
- `ServiceTicketClosed` (from MOD-016 Service Desk) — SPR-MOD-011-002
- `SalesInvoiceIssued` (from MOD-002 Accounting) — SPR-MOD-011-003

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-011 via their Capability Interfaces. Engine set inherited verbatim from `MOD011_AMC_BASELINE_v1` §5:

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

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-032` (RBAC + ABAC). `ENG-016` Posting is **not** consumed by any AMC sprint — ledger effects are owned by MOD-002 via posting-rule bindings triggered by AMC-published events and Contract Invoices issued through `ENG-015`, per the governance boundary in the Module PRD and Baseline §5, §7.

## 12. Dependencies

Verbatim from `MOD011_AMC_BASELINE_v1` §9 and Module PRD §13.

**Upstream contracts consumed by AMC:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- `MOD006_CRM_BASELINE_v1` — Customer master (read-only) for contract counterparties.
- `MOD002_ACCOUNTING_BASELINE_v1` — ledger effects of Contract Invoices and contract-billing events; `SalesInvoiceIssued` event.
- `MOD012_FIELD_SERVICE_BASELINE_v1` — `FieldVisitCompleted` event for entitlement consumption tracking.
- `MOD016_SERVICE_DESK_BASELINE_v1` — `ServiceTicketClosed` event for entitlement consumption tracking.

**Downstream consumers of AMC:**

- `MOD-012 Field Service` — consumes `ContractSigned` and `VisitScheduled` for field-visit execution linkage.
- `MOD-002 Accounting` — consumes AMC-published Contract Invoice signals for ledger effects.
- `MOD-017 Analytics` — consumes AMC operational read models and lifecycle events; owns cross-module KPI definitions.

## 13. Ownership Boundaries

Verbatim from Baseline §7 and §9 and PRD §2:

- MOD-011 owns **only** the authorities enumerated in §4.
- Downstream modules MUST NOT own AMC master data, redefine the Contract / Visit Schedule / Renewal / Contract Invoice lifecycles, or redefine AMC analytics ownership.
- The Customer master remains owned by MOD-006 CRM; AMC consumes it read-only.
- Ledger posting for Contract Invoices and contract-billing events is produced by MOD-002 via `ENG-015` and `ENG-016`; AMC emits events and does not write journal entries directly.
- Identity, authentication, roles, and permissions remain owned by MOD-001 Platform Administration.
- Field-visit execution remains owned by MOD-012 Field Service; service-desk closures remain owned by MOD-016 Service Desk. AMC consumes their events read-only.
- `ENG-004` remains authoritative for audit collection; AMC owns only the business-level audit-readiness surface.
- `ENG-024` remains authoritative for event delivery infrastructure; AMC owns the semantics of the events it emits.
- Cross-module KPI definitions remain exclusive to MOD-017 Analytics.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md`](../../30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | `SPR-MOD-011-001` … `SPR-MOD-011-004` |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD011_AMC_BASELINE_v1.md`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |

## 15. Non-Goals

Inherited verbatim from Baseline §11 and Module PRD §14 (as future items):

- Usage-based contracts (Module PRD §14 Future Enhancements).
- Contract profitability dashboards beyond the operational read-model report (Module PRD §14; cross-module KPI definitions remain owned by MOD-017).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and the MOD-006 … MOD-010 reference pattern, Phase 3 Solution Design proceeds in the sequence:

`WEB-011 → MOB-011 → API-011 → CPC-011 → VR-011`

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority in §4 is inherited verbatim from `MOD011_AMC_BASELINE_v1`.
2. Engine and ADR sets in §11 match Baseline §5–§6 exactly.
3. Dependency set in §12 matches Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD011-20260720T120000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD011_PUBLICATION_COMPLETE` → ready for `WEB-011 AMC Solution Design`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD011_AMC_BASELINE_v2`).

## 19. Repository State Transition

`MOD011_BASELINE_FROZEN` → **`MOD011_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD011_AMC_BASELINE_v1.md`](../../40-module-baselines/MOD011_AMC_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md)
- [`docs/30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md`](../../30-sprint-prds/amc/MOD-011_SPRINT_PLAN.md)
- [`docs/45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md`](../projects/MOD-010_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
