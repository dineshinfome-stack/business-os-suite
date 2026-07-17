---
title: "MOD014_FLEET_BASELINE_v1 — Fleet Module Baseline"
summary: "Stage 3 Module Baseline for MOD-014 Fleet. Freezes the module after successful completion of Sprint PRDs SPR-MOD-014-001..004. Reference consolidation only — introduces no new requirements, engines, ADRs, events, or Sprint PRDs."
baseline_id: "MOD014_FLEET_BASELINE_v1"
module_id: "MOD-014"
module_name: "Fleet"
version: "1.0"
status: "Frozen"
owner: "Operations"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/fleet/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-014-001", "SPR-MOD-014-002", "SPR-MOD-014-003", "SPR-MOD-014-004"]
layer: "delivery"
updated: "2026-07-16"
tags: ["baseline", "module", "MOD-014", "fleet", "stage-3", "freeze"]
document_type: "Module Baseline"
governance_specification: "v1.0"
authored_via_template: "GT-004"
authored_via_template_version: "v1.0"
execution_id: "GT004-MOD014-20260716T031000Z-001"
parent_execution_id: "GT003-MOD014-004-20260716T030000Z-001"
previous_audit_report_id: "REPOSITORY_AUDIT_20260716T030000Z"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
---

# MOD014_FLEET_BASELINE_v1 — Fleet Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-014. It introduces no new requirements, engines, ADRs, events, or Sprint PRDs. Future changes to Fleet scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD014_FLEET_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD014_FLEET_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the Fleet module (`MOD-014`). It certifies that:

- Every Sprint PRD reserved in [`MOD-014_SPRINT_PLAN.md`](../30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md) (`SPR-MOD-014-001` … `SPR-MOD-014-004`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-014. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD014_FLEET_BASELINE_v1` is the authoritative repository-wide Fleet contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-014 Fleet Module PRD](../20-module-prds/fleet/MODULE_PRD.md); reference only. Fleet owns:

- Vehicle master and hierarchy — Vehicle master data and vehicle hierarchy management.
- Driver and license management — Driver and License master data; driver–license linkage; license renewal reminders.
- Compliance and insurance — Compliance and insurance registration; coverage windows; expiry-window alerts.
- Trip planning and tracking — Route master; Trip Sheet transaction lifecycle; driver/vehicle assignment; odometer capture at open and close.
- Fuel and consumables — Fuel Station master; Fuel Entry transaction lifecycle; telematics reconciliation where available.
- Maintenance and service — Maintenance Order transaction lifecycle; scheduled preventive maintenance.
- Fleet Analytics & Compliance — Read-model operational reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar), dashboards, exports, and audit-readiness surface.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition. Ownership boundaries (identity/permissions, ledger posting, and cross-module KPI definitions) are established in the Module PRD §13 and preserved verbatim across the Sprint PRD family; this baseline does not restate them.

## 3. Implemented Sprint Summary

Each row records the sprint's title, status, and primary capability delivered — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-014-001](../30-sprint-prds/fleet/SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md) | Fleet Foundation (Vehicles, Drivers, Compliance & Insurance) | Done | Vehicle, Driver, and License master data; compliance and insurance registration; vehicle hierarchy; driver–license linkage; license renewal reminders; module configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals defaults); publication of `ComplianceExpiring`. |
| [SPR-MOD-014-002](../30-sprint-prds/fleet/SPR-MOD-014-002-trip-planning-and-execution.md) | Trip Planning & Execution | Done | Route master; Trip Sheet transaction lifecycle; driver/vehicle assignment; odometer capture at open and close; publication of `TripClosed`; consumption of `DeliveryDispatched` and `FieldTicketCreated` to seed trip candidates. |
| [SPR-MOD-014-003](../30-sprint-prds/fleet/SPR-MOD-014-003-fuel-and-maintenance.md) | Fuel & Maintenance | Done | Fuel Station master; Fuel Entry transaction lifecycle with telematics reconciliation; Maintenance Order transaction lifecycle; scheduled preventive maintenance via `ENG-014`; publication of `FuelRecorded` and `MaintenanceCompleted`. |
| [SPR-MOD-014-004](../30-sprint-prds/fleet/SPR-MOD-014-004-fleet-analytics-and-compliance.md) | Fleet Analytics & Compliance | Done | Fleet read model; operational reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar); dashboards, exports, and audit-readiness surface. |

## 4. Capability Coverage

Every capability defined by the Fleet Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the Fleet Module PRD and the Sprint PRD family. No capability has been **added, removed, renamed, merged, split, or ownership-transferred** by this consolidation.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-014 Capability (Module PRD §2) | Originating Sprint |
| --- | --- |
| Vehicle master and hierarchy | SPR-MOD-014-001 |
| Driver and license management | SPR-MOD-014-001 |
| Trip planning and tracking | SPR-MOD-014-002 |
| Fuel and consumables | SPR-MOD-014-003 |
| Maintenance and service | SPR-MOD-014-003 |
| Compliance and insurance | SPR-MOD-014-001 |
| Fleet reports, dashboards, exports, audit readiness (Module PRD §9, §11) | SPR-MOD-014-004 |
| Fleet governance conventions (summarized in §7) | Established across SPR-MOD-014-001 … SPR-MOD-014-004 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-014-001 | Vehicle master and hierarchy; Driver and license management; Compliance and insurance |
| SPR-MOD-014-002 | Trip planning and tracking |
| SPR-MOD-014-003 | Fuel and consumables; Maintenance and service |
| SPR-MOD-014-004 | Fleet reports, dashboards, exports, audit readiness (§9, §11) |

No Fleet capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-014-001` through `SPR-MOD-014-004`, and reconciled with the Sprint Plan §5 Engine Consumption Map.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim, and canonical ordering from `ENGINE_CATALOG.md` is preserved.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-014-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-014-001, 002, 003, 004 |
| ENG-003 (Permission Management Engine) | SPR-MOD-014-001 |
| ENG-004 (Audit Engine) | SPR-MOD-014-001, 002, 003, 004 |
| ENG-005 (Configuration Engine) | SPR-MOD-014-001, 002, 003 |
| ENG-006 (Localization Engine) | SPR-MOD-014-001 |
| ENG-007 (Document Engine) | SPR-MOD-014-001, 002, 003 |
| ENG-008 (Attachment Engine) | SPR-MOD-014-001, 002, 003 |
| ENG-010 (Workflow Engine) | SPR-MOD-014-001, 002, 003 |
| ENG-011 (Approval Engine) | SPR-MOD-014-001, 002, 003 |
| ENG-012 (Rules Engine) | SPR-MOD-014-001, 002, 003 |
| ENG-013 (Automation Engine) | SPR-MOD-014-003 |
| ENG-014 (Scheduler Engine) | SPR-MOD-014-001, 002, 003 |
| ENG-017 (Numbering Engine) | SPR-MOD-014-001, 002, 003 |
| ENG-020 (Search Engine) | SPR-MOD-014-004 |
| ENG-021 (Reporting Engine) | SPR-MOD-014-004 |
| ENG-022 (Dashboard Engine) | SPR-MOD-014-004 |
| ENG-023 (Integration Engine) | SPR-MOD-014-004 |
| ENG-024 (Event Engine) | SPR-MOD-014-001, 002, 003, 004 |
| ENG-025 (Notification Engine) | SPR-MOD-014-001, 002, 003, 004 |
| ENG-027 (Export Engine) | SPR-MOD-014-004 |

No Fleet sprint redefines engine behavior; all engines are consumed via their Capability Interfaces. `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any Fleet sprint — all ledger effects of fuel, maintenance, and disposal are owned by MOD-002 Accounting via posting-rule bindings triggered by Fleet-published events, per the governance boundary declared in the Module PRD and Sprint Plan §5.

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-014-001` through `SPR-MOD-014-004`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim; canonical ordering from `ADR_INDEX.md` is preserved.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-014-001, 002, 003, 004 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-014-001, 002, 003, 004 |

## 7. Governance Conventions Established

Every governance convention established across Fleet Sprint PRDs 001–004 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-014-001 — Fleet Foundation (Vehicles, Drivers, Compliance & Insurance)**

- **Vehicle, Driver, and License Master Authority** — MOD-014 Fleet owns the business semantics of Vehicle, Driver, and License masters, along with Fleet configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals defaults). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, attachments, workflow, rules, scheduling, eventing, notification) but MUST NOT redefine Fleet business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-002 (ledger posting), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD.
- **Compliance & Insurance Authority** — MOD-014 owns compliance and insurance registration, coverage windows, and reminder cadences configured via `ENG-005` and evaluated via `ENG-012`; scheduled reminders execute via `ENG-014`. `ComplianceExpiring` events are published via `ENG-024` within the configured window.

**From SPR-MOD-014-002 — Trip Planning & Execution**

- **Route Master Authority** — MOD-014 owns the Route master lifecycle enforced via `ENG-010`/`ENG-011`.
- **Trip Sheet Transaction Authority** — MOD-014 owns the Trip Sheet transaction and its lifecycle (`draft → planned → in-progress → closed → reversed`) enforced via `ENG-010`/`ENG-011`. `TripClosed` events are published via `ENG-024`; `DeliveryDispatched` (from MOD-003 Sales) and `FieldTicketCreated` (from MOD-012 Field Service) events are consumed read-only to seed trip candidates idempotently. Ledger effects are produced by MOD-002 via posting-rule bindings triggered by the published event.
- **Odometer Capture Rule** — Trip closure requires captured odometer readings; closing odometer must be greater than or equal to opening odometer (enforced via `ENG-012`).
- **Compliance-Blocks-Assignment Rule** — Vehicles with expired critical compliance cannot be assigned to trips (enforced via `ENG-012`).

**From SPR-MOD-014-003 — Fuel & Maintenance**

- **Fuel Station Master Authority** — MOD-014 owns the Fuel Station master lifecycle enforced via `ENG-010`/`ENG-011`.
- **Fuel Entry Transaction Authority** — MOD-014 owns the Fuel Entry transaction lifecycle enforced via `ENG-010`/`ENG-011`. `FuelRecorded` events publish via `ENG-024` to trigger MOD-002 posting bindings.
- **Maintenance Order Transaction Authority** — MOD-014 owns the Maintenance Order transaction lifecycle enforced via `ENG-010`/`ENG-011`; scheduled preventive maintenance is generated by `ENG-014` from intervals configured via `ENG-005` in the Fleet namespace. `MaintenanceCompleted` events publish via `ENG-024`.
- **Telematics Reconciliation Rule** — Fuel entries reconcile against telematics where available (evaluated via `ENG-012`); absence of telematics data is recorded as a documented fallback.

**From SPR-MOD-014-004 — Fleet Analytics & Compliance**

- **Fleet Read Model & Report Authority** — MOD-014 owns operational Fleet reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar), dashboards, exports, and the Fleet audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics and are consumed read-only via `ENG-023`.
- **Read-Model-Only Boundary Convention** — Dashboards (`ENG-022`), filters, drill-down, search (`ENG-020`), reports (`ENG-021`), integration (`ENG-023`), and export (`ENG-027`) operate over the Fleet read model; no new master data, transactions, workflows, or published events are introduced by Sprint 4.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint Fleet events (`ComplianceExpiring`, `TripClosed`, `FuelRecorded`, `MaintenanceCompleted`) through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform, Accounting, Sales, Purchase, Inventory, CRM, HRMS, Payroll, Manufacturing, Projects, AMC, Field Service, Assets, and Warehouse governance conventions established in prior Module Baselines.

**Freeze.** Governance conventions summarized herein are frozen for `MOD014_FLEET_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-014-001` through `SPR-MOD-014-004`.** Every referenced event resolves verbatim from [`docs/20-module-prds/fleet/MODULE_PRD.md`](../20-module-prds/fleet/MODULE_PRD.md) §8 or the authoritative [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md). **No new event names SHALL be introduced by the Module Baseline.**

**Events Published by Fleet** (verbatim from Fleet Module PRD §8):

- `TripClosed` — SPR-MOD-014-002
- `FuelRecorded` — SPR-MOD-014-003
- `MaintenanceCompleted` — SPR-MOD-014-003
- `ComplianceExpiring` — SPR-MOD-014-001

**Events Consumed by Fleet** (verbatim from Fleet Module PRD §8):

- `DeliveryDispatched` (from MOD-003 Sales) — SPR-MOD-014-002
- `FieldTicketCreated` (from MOD-012 Field Service) — SPR-MOD-014-002
- `TripClosed`, `FuelRecorded`, `MaintenanceCompleted`, `ComplianceExpiring` (Fleet-published; consumed by the read model) — SPR-MOD-014-004

Deferred event surfaces are inherited as `R-EV-*` risks from the originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD014_FLEET_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by Fleet. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**Fleet SHALL consume Platform, Sales, Field Service, Accounting, and Analytics services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by Fleet:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-003 Sales** — `DeliveryDispatched` event consumed read-only to seed trip candidates.
- **MOD-012 Field Service** — `FieldTicketCreated` event consumed read-only to seed trip candidates.
- **MOD-002 Accounting** — ledger effects of fuel, maintenance, and disposal transactions are owned by MOD-002 via `ENG-015` Voucher and `ENG-016` Posting bindings; MOD-014 does not invoke the voucher or posting engines directly.

**Downstream consumers of the Fleet baseline** (per Fleet Module PRD §13 *Provides To Modules*):

- **MOD-002 Accounting** — consumes `TripClosed`, `FuelRecorded`, and `MaintenanceCompleted` for ledger-effect bindings.
- **MOD-012 Field Service** — consumes Fleet trip and vehicle read models as needed for dispatch context.
- **MOD-017 Analytics** — consumes Fleet operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

Downstream modules MUST NOT own Fleet master data, redefine the Vehicle / Driver / License / Route / Fuel Station / Trip Sheet / Fuel Entry / Maintenance Order lifecycles, or redefine Fleet analytics ownership. No downstream module owns Fleet records.

## 10. Module Completion & Freeze Statement

All four planned Fleet Sprint PRDs (`SPR-MOD-014-001` … `SPR-MOD-014-004`) exist, the [Sprint Plan](../30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md) is executed, and repository verification has been completed under GT-004. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-014 Fleet is now frozen for downstream consumption. Future changes to `MOD014_FLEET_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD014_FLEET_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD014_FLEET_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Ledger effects of fuel, maintenance, and disposal transactions (owned by MOD-002 Accounting).
- Future Enhancements enumerated in the Fleet Module PRD §14 (Telematics-driven scoring; AI route optimization).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/fleet/MODULE_PRD.md`](../20-module-prds/fleet/MODULE_PRD.md) — MOD-014 Module PRD (authoritative).
- [`docs/30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md`](../30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/fleet/SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md`](../30-sprint-prds/fleet/SPR-MOD-014-001-fleet-foundation-vehicles-drivers-compliance-and-insurance.md)
- [`docs/30-sprint-prds/fleet/SPR-MOD-014-002-trip-planning-and-execution.md`](../30-sprint-prds/fleet/SPR-MOD-014-002-trip-planning-and-execution.md)
- [`docs/30-sprint-prds/fleet/SPR-MOD-014-003-fuel-and-maintenance.md`](../30-sprint-prds/fleet/SPR-MOD-014-003-fuel-and-maintenance.md)
- [`docs/30-sprint-prds/fleet/SPR-MOD-014-004-fleet-analytics-and-compliance.md`](../30-sprint-prds/fleet/SPR-MOD-014-004-fleet-analytics-and-compliance.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`](../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md) — authoring template.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](./MOD002_ACCOUNTING_BASELINE_v1.md) — upstream Accounting baseline.
- [`docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md`](./MOD003_SALES_BASELINE_v1.md) — upstream Sales baseline.
- [`docs/40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md`](./MOD012_FIELD_SERVICE_BASELINE_v1.md) — upstream Field Service baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
