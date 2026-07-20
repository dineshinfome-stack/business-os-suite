---
title: "MOD-014 Module Publication — Fleet"
summary: "GT-005 Module Publication for MOD-014 Fleet. Terminal governance artifact derived exclusively from MOD014_FLEET_BASELINE_v1 and the MOD-014 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-014_MODULE_PUBLICATION"
publication_id: "MOD-014_MODULE_PUBLICATION"
module_id: "MOD-014"
module_name: "Fleet"
version: "1.0"
status: "Published"
owner: "Operations"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/fleet/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD014_FLEET_BASELINE_v1.md"
source_module: "MOD-014"
source_sprints: ["SPR-MOD-014-001", "SPR-MOD-014-002", "SPR-MOD-014-003", "SPR-MOD-014-004"]
layer: "delivery"
updated: "2026-07-20"
tags: ["publication", "module", "MOD-014", "fleet", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD014-20260720T150000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-013", "ENG-014", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
related_modules: ["MOD-001", "MOD-002", "MOD-003", "MOD-012", "MOD-017"]
---

# MOD-014 Module Publication — Fleet

> **Reference publication only.** Faithful representation of [`MOD014_FLEET_BASELINE_v1`](../../40-module-baselines/MOD014_FLEET_BASELINE_v1.md) and the [`MOD-014 Module PRD`](../../20-module-prds/fleet/MODULE_PRD.md). Introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-014
- **Module Name:** Fleet
- **Owner:** Operations
- **Publication ID:** MOD-014_MODULE_PUBLICATION
- **Source Baseline:** `MOD014_FLEET_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md`](../../30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-014-001` … `SPR-MOD-014-004`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

Fleet is the authoritative bounded context for Fleet and Vehicle Management (Baseline §1; PRD §1). It owns Vehicle, Driver, License, Route, and Fuel Station master lifecycles and Fleet configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals defaults); compliance and insurance registration with coverage windows and expiry-window alerts; the Trip Sheet transaction lifecycle (`draft → planned → in-progress → closed → reversed`) with driver/vehicle assignment and odometer capture at open and close; the Fuel Entry transaction lifecycle with telematics reconciliation; the Maintenance Order transaction lifecycle with scheduled preventive maintenance; and the Fleet operational read model for reports, dashboards, exports, and audit readiness (Baseline §2; PRD §2). Identity, authentication, roles, permissions, configuration hierarchy, localization, and audit collection remain owned by MOD-001 Platform Administration; ledger effects of fuel, maintenance, and disposal are produced by MOD-002 Accounting via `ENG-015` and `ENG-016` bindings triggered by Fleet-published events; `DeliveryDispatched` (from MOD-003 Sales) and `FieldTicketCreated` (from MOD-012 Field Service) are consumed read-only to seed trip candidates; cross-module KPI definitions remain owned by MOD-017 Analytics (Baseline §2, §5, §9; PRD §2, §13).

## 3. Approved Scope

Restates the scope consolidated in `MOD014_FLEET_BASELINE_v1` §2 and the Module PRD §2. Fleet owns:

- Vehicle master and hierarchy — Vehicle master data and vehicle hierarchy management (Baseline §2; PRD §2, §5).
- Driver and license management — Driver and License master data; driver–license linkage; license renewal reminders (Baseline §2; PRD §2, §5).
- Compliance and insurance — Compliance and insurance registration; coverage windows; expiry-window alerts (Baseline §2; PRD §2, §5, §10).
- Trip planning and tracking — Route master; Trip Sheet transaction lifecycle (`draft → planned → in-progress → closed → reversed`); driver/vehicle assignment; odometer capture at open and close (Baseline §2; PRD §2, §6).
- Fuel and consumables — Fuel Station master; Fuel Entry transaction lifecycle; telematics reconciliation where available (Baseline §2; PRD §2, §6).
- Maintenance and service — Maintenance Order transaction lifecycle; scheduled preventive maintenance (Baseline §2; PRD §2, §6).
- Fleet Analytics & Compliance — read-model operational reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar), dashboards, exports, and audit-readiness surface (Baseline §2; PRD §9, §11).

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Inherited verbatim from `MOD014_FLEET_BASELINE_v1` §7.

### 4.1 SPR-MOD-014-001 — Fleet Foundation (Vehicles, Drivers, Compliance & Insurance)

- **Vehicle, Driver, and License Master Authority** — MOD-014 Fleet owns the business semantics of Vehicle, Driver, and License masters, along with Fleet configuration (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals defaults). ERP Core Engines provide shared infrastructure but MUST NOT redefine Fleet business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-002 (ledger posting), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD.
- **Compliance & Insurance Authority** — MOD-014 owns compliance and insurance registration, coverage windows, and reminder cadences configured via `ENG-005` and evaluated via `ENG-012`; scheduled reminders execute via `ENG-014`. `ComplianceExpiring` events are published via `ENG-024` within the configured window.

### 4.2 SPR-MOD-014-002 — Trip Planning & Execution

- **Route Master Authority** — MOD-014 owns the Route master lifecycle enforced via `ENG-010`/`ENG-011`.
- **Trip Sheet Transaction Authority** — MOD-014 owns the Trip Sheet transaction and its lifecycle (`draft → planned → in-progress → closed → reversed`) enforced via `ENG-010`/`ENG-011`. `TripClosed` events are published via `ENG-024`; `DeliveryDispatched` (from MOD-003 Sales) and `FieldTicketCreated` (from MOD-012 Field Service) events are consumed read-only to seed trip candidates idempotently. Ledger effects are produced by MOD-002 via posting-rule bindings triggered by the published event.
- **Odometer Capture Rule** — Trip closure requires captured odometer readings; closing odometer must be greater than or equal to opening odometer (enforced via `ENG-012`).
- **Compliance-Blocks-Assignment Rule** — Vehicles with expired critical compliance cannot be assigned to trips (enforced via `ENG-012`).

### 4.3 SPR-MOD-014-003 — Fuel & Maintenance

- **Fuel Station Master Authority** — MOD-014 owns the Fuel Station master lifecycle enforced via `ENG-010`/`ENG-011`.
- **Fuel Entry Transaction Authority** — MOD-014 owns the Fuel Entry transaction lifecycle enforced via `ENG-010`/`ENG-011`. `FuelRecorded` events publish via `ENG-024` to trigger MOD-002 posting bindings.
- **Maintenance Order Transaction Authority** — MOD-014 owns the Maintenance Order transaction lifecycle enforced via `ENG-010`/`ENG-011`; scheduled preventive maintenance is generated by `ENG-014` from intervals configured via `ENG-005` in the Fleet namespace. `MaintenanceCompleted` events publish via `ENG-024`.
- **Telematics Reconciliation Rule** — Fuel entries reconcile against telematics where available (evaluated via `ENG-012`); absence of telematics data is recorded as a documented fallback.

### 4.4 SPR-MOD-014-004 — Fleet Analytics & Compliance

- **Fleet Read Model & Report Authority** — MOD-014 owns operational Fleet reports (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar), dashboards, exports, and the Fleet audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics and are consumed read-only via `ENG-023`.
- **Read-Model-Only Boundary Convention** — Dashboards (`ENG-022`), filters, drill-down, search (`ENG-020`), reports (`ENG-021`), integration (`ENG-023`), and export (`ENG-027`) operate over the Fleet read model; no new master data, transactions, workflows, or published events are introduced by Sprint 4.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint Fleet events (`ComplianceExpiring`, `TripClosed`, `FuelRecorded`, `MaintenanceCompleted`) through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-014-001` … `SPR-MOD-014-004`) as consolidated in `MOD014_FLEET_BASELINE_v1`. This publication introduces no new requirements.

## 6. Business Rules

Verbatim from Module PRD §7 and Baseline §7:

- A trip cannot be closed without odometer readings; closing odometer must be greater than or equal to opening odometer (PRD §7; Baseline §7 Odometer Capture Rule).
- Vehicles with expired critical compliance cannot be assigned to trips (PRD §7; Baseline §7 Compliance-Blocks-Assignment Rule).
- Fuel entries reconcile against telematics where available; absence of telematics data is recorded as a documented fallback (PRD §7; Baseline §7 Telematics Reconciliation Rule).
- Fleet master and transaction lifecycles are Fleet-owned; no other module mutates Fleet state (Baseline §7).
- Fleet does not implement double-entry posting; ledger effects of fuel, maintenance, and disposal are produced by MOD-002 Accounting via `ENG-015` and `ENG-016` bindings triggered by Fleet-published events (PRD §2, §6; Baseline §5, §7, §9).
- `DeliveryDispatched` and `FieldTicketCreated` are consumed read-only to seed trip candidates (Baseline §7, §8).
- Analytics surfaces are read-only projections over the Fleet read model (Baseline §7).

## 7. Master Data Authorities

Verbatim from Module PRD §5 and Baseline §4, §7:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Vehicle | SPR-MOD-014-001 |
| Driver | SPR-MOD-014-001 |
| License | SPR-MOD-014-001 |
| Route | SPR-MOD-014-002 |
| Fuel Station | SPR-MOD-014-003 |

## 8. Transaction Authorities

Verbatim from Module PRD §6 and Baseline §4, §7:

| Transaction | Originating Sprint |
| --- | --- |
| Trip Sheet | SPR-MOD-014-002 |
| Fuel Entry | SPR-MOD-014-003 |
| Maintenance Order | SPR-MOD-014-003 |

## 9. Published Events

Emitted via `ENG-024` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by Fleet; delivery infrastructure owned by Platform. Verbatim from Baseline §8 and Module PRD §8:

- `TripClosed` — SPR-MOD-014-002
- `FuelRecorded` — SPR-MOD-014-003
- `MaintenanceCompleted` — SPR-MOD-014-003
- `ComplianceExpiring` — SPR-MOD-014-001

## 10. Consumed Events

Consumed via `ENG-024`. Consumption is read-only. Verbatim from Baseline §8 and Module PRD §8:

- `DeliveryDispatched` (from MOD-003 Sales) — SPR-MOD-014-002
- `FieldTicketCreated` (from MOD-012 Field Service) — SPR-MOD-014-002
- `TripClosed`, `FuelRecorded`, `MaintenanceCompleted`, `ComplianceExpiring` (Fleet-published; consumed by the read model) — SPR-MOD-014-004

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-014 via their Capability Interfaces. Engine set inherited verbatim from `MOD014_FLEET_BASELINE_v1` §5:

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

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-032` (RBAC + ABAC). `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any Fleet sprint — ledger effects of fuel, maintenance, and disposal are owned by MOD-002 via posting-rule bindings triggered by Fleet-published events, per the governance boundary in the Module PRD and Baseline §5, §7.

## 12. Dependencies

Verbatim from `MOD014_FLEET_BASELINE_v1` §9 and Module PRD §13.

**Upstream contracts consumed by Fleet:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- `MOD003_SALES_BASELINE_v1` — `DeliveryDispatched` event consumed read-only to seed trip candidates.
- `MOD012_FIELD_SERVICE_BASELINE_v1` — `FieldTicketCreated` event consumed read-only to seed trip candidates.
- `MOD002_ACCOUNTING_BASELINE_v1` — ledger effects of fuel, maintenance, and disposal are owned by MOD-002 via `ENG-015` and `ENG-016` bindings; MOD-014 does not invoke the voucher or posting engines directly.

**Downstream consumers of Fleet:**

- `MOD-002 Accounting` — consumes `TripClosed`, `FuelRecorded`, and `MaintenanceCompleted` for ledger-effect bindings.
- `MOD-012 Field Service` — consumes Fleet trip and vehicle read models as needed for dispatch context.
- `MOD-017 Analytics` — consumes Fleet operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

## 13. Ownership Boundaries

Verbatim from Baseline §7 and §9 and PRD §2, §13:

- MOD-014 owns **only** the authorities enumerated in §4.
- Downstream modules MUST NOT own Fleet master data, redefine the Vehicle / Driver / License / Route / Fuel Station / Trip Sheet / Fuel Entry / Maintenance Order lifecycles, or redefine Fleet analytics ownership.
- Identity, authentication, roles, permissions, configuration hierarchy, localization, and audit collection remain owned by MOD-001 Platform Administration.
- Ledger posting for fuel, maintenance, and disposal is produced by MOD-002 via `ENG-015` and `ENG-016`; Fleet emits events and does not write journal entries directly.
- `DeliveryDispatched` is owned by MOD-003 Sales; `FieldTicketCreated` is owned by MOD-012 Field Service; Fleet consumes both read-only.
- `ENG-004` remains authoritative for audit collection; Fleet owns only the business-level audit-readiness surface.
- `ENG-024` remains authoritative for event delivery infrastructure; Fleet owns the semantics of the events it emits.
- Cross-module KPI definitions remain exclusive to MOD-017 Analytics.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md`](../../30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | `SPR-MOD-014-001` … `SPR-MOD-014-004` |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD014_FLEET_BASELINE_v1.md`](../../40-module-baselines/MOD014_FLEET_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |

## 15. Non-Goals

Inherited verbatim from Baseline §11 and Module PRD §14 (as future items):

- Telematics-driven scoring (PRD §14 Future Enhancements).
- AI route optimization (PRD §14).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Ledger effects of fuel, maintenance, and disposal (owned by MOD-002 Accounting).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and the MOD-006 … MOD-013 reference pattern, Phase 3 Solution Design proceeds in the sequence:

`WEB-014 → MOB-014 → API-014 → CPC-014 → VR-014`

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority in §4 is inherited verbatim from `MOD014_FLEET_BASELINE_v1`.
2. Engine and ADR sets in §11 match Baseline §5–§6 exactly.
3. Dependency set in §12 matches Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD014-20260720T150000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD014_PUBLICATION_COMPLETE` → ready for `WEB-014 Fleet Solution Design`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD014_FLEET_BASELINE_v2`).

## 19. Repository State Transition

`MOD014_BASELINE_FROZEN` → **`MOD014_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD014_FLEET_BASELINE_v1.md`](../../40-module-baselines/MOD014_FLEET_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md)
- [`docs/30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md`](../../30-sprint-prds/fleet/MOD-014_SPRINT_PLAN.md)
- [`docs/45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md`](../assets/MOD-013_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
