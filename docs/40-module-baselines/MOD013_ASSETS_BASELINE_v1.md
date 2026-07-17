---
title: "MOD013_ASSETS_BASELINE_v1 — Assets Module Baseline"
summary: "Stage 3 Module Baseline for MOD-013 Assets. Freezes the module after successful completion of Sprint PRDs SPR-MOD-013-001..004. Reference consolidation only — introduces no new requirements, engines, ADRs, events, or Sprint PRDs."
baseline_id: "MOD013_ASSETS_BASELINE_v1"
module_id: "MOD-013"
module_name: "Assets"
version: "1.0"
status: "Frozen"
owner: "Operations"
workflow_stage: "Stage 3"
parent_module_prd: "docs/20-module-prds/assets/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-013-001", "SPR-MOD-013-002", "SPR-MOD-013-003", "SPR-MOD-013-004"]
layer: "delivery"
updated: "2026-07-16"
tags: ["baseline", "module", "MOD-013", "assets", "stage-3", "freeze"]
document_type: "Module Baseline"
governance_specification: "v1.0"
authored_via_template: "GT-004"
authored_via_template_version: "v1.0"
execution_id: "GT004-MOD013-20260716T024000Z-001"
parent_execution_id: "GT003-MOD013-004-20260716T023000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-026", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
---

# MOD013_ASSETS_BASELINE_v1 — Assets Module Baseline

> **Reference consolidation only.** This baseline restates existing content and freezes MOD-013. It introduces no new requirements, engines, ADRs, events, or Sprint PRDs. Future changes to Assets scope, capabilities, or governance conventions MUST occur through a subsequent versioned baseline revision (e.g. `MOD013_ASSETS_BASELINE_v2`) rather than by modifying this baseline in place.

## 1. Purpose

`MOD013_ASSETS_BASELINE_v1` is the Stage 3 artifact of [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) for the Assets module (`MOD-013`). It certifies that:

- Every Sprint PRD reserved in [`MOD-013_SPRINT_PLAN.md`](../30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md) (`SPR-MOD-013-001` … `SPR-MOD-013-004`) is authored and complete.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Baseline Authority.** This Module Baseline supersedes the Sprint PRDs as the primary repository reference for MOD-013. Sprint PRDs remain normative only for Sprint-level traceability and implementation history. Downstream modules SHOULD reference this baseline instead of individual Sprint PRDs except where sprint-level traceability is explicitly required. `MOD013_ASSETS_BASELINE_v1` is the authoritative repository-wide Assets contract and supersedes Sprint PRDs for cross-module consumption while preserving Sprint-level traceability.

## 2. Module Scope

Restates capabilities from the [MOD-013 Assets Module PRD](../20-module-prds/assets/MODULE_PRD.md); reference only. Assets owns:

- Asset register and hierarchy — Asset, Asset Class, and Location master data; register/hierarchy management.
- Capitalization and componentization — Capitalization transaction lifecycle (draft → submitted → approved → capitalized → reversed); componentization rules.
- Depreciation methods and schedules — Depreciation method configuration; deterministic depreciation schedules; the Depreciation Run transaction; scheduled periodic runs.
- Maintenance and calibration — Maintenance Order transaction lifecycle; calibration cadence and state tracking.
- Transfer and disposal — Asset Transfer (identity-preserving location change); Disposal transaction lifecycle with disposed-asset immutability.
- Insurance and warranty — Insurance Policy master; coverage linkage; insurance defaults.
- Assets Analytics & Compliance — Read-model operational reports (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary), dashboards, exports, and audit-readiness surface.

Authoritative scope definitions remain in the Module PRD; this section is a summary, not a redefinition. Ownership boundaries (identity/permissions, ledger posting, and cross-module KPI definitions) are established in the Module PRD §13 and preserved verbatim across the Sprint PRD family; this baseline does not restate them.

## 3. Implemented Sprint Summary

Each row records the sprint's title, status, and primary capability delivered — reflecting the Sprint Catalog transition performed by this Pass.

| Sprint ID | Title | Status | Primary Capability Delivered |
| --- | --- | --- | --- |
| [SPR-MOD-013-001](../30-sprint-prds/assets/SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md) | Asset Foundation (Register, Capitalization & Insurance) | Done | Asset, Asset Class, Location, and Insurance Policy master data; Capitalization transaction lifecycle; register/hierarchy management; componentization rules; module configuration (numbering series, componentization rules, insurance defaults); publication of `AssetCapitalized`; consumption of `PurchaseInvoiceReceived`. |
| [SPR-MOD-013-002](../30-sprint-prds/assets/SPR-MOD-013-002-depreciation-methods-and-runs.md) | Depreciation (Methods & Runs) | Done | Depreciation method configuration; deterministic depreciation schedules; Depreciation Run transaction lifecycle; scheduled periodic runs via `ENG-014`; post-run capitalization-lock rule via `ENG-012`; publication of `DepreciationPosted`. |
| [SPR-MOD-013-003](../30-sprint-prds/assets/SPR-MOD-013-003-maintenance-transfer-and-disposal.md) | Maintenance, Transfer & Disposal | Done | Maintenance Order transaction lifecycle; calibration tracking; Asset Transfer; Disposal transaction lifecycle with disposed-asset immutability; publication of `AssetTransferred` and `AssetDisposed`; consumption of `MaintenanceCompleted`. |
| [SPR-MOD-013-004](../30-sprint-prds/assets/SPR-MOD-013-004-assets-analytics-and-compliance.md) | Assets Analytics & Compliance | Done | Assets read model; operational reports (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary); dashboards, exports, and audit-readiness surface. |

## 4. Capability Coverage

Every capability defined by the Assets Module PRD SHALL map to exactly one originating Sprint allocation and one or more Sprint PRDs. No orphans; no unallocated capabilities. No capability appears in this baseline that is absent from both the Assets Module PRD and the Sprint PRD family. No capability has been **added, removed, renamed, merged, split, or ownership-transferred** by this consolidation.

### 4.1 Forward Map — Module PRD Capability → Originating Sprint

| MOD-013 Capability (Module PRD §2) | Originating Sprint |
| --- | --- |
| Asset register and hierarchy | SPR-MOD-013-001 |
| Capitalization and componentization | SPR-MOD-013-001 |
| Depreciation methods and schedules | SPR-MOD-013-002 |
| Maintenance and calibration | SPR-MOD-013-003 |
| Transfer and disposal | SPR-MOD-013-003 |
| Insurance and warranty | SPR-MOD-013-001 |
| Assets reports, dashboards, exports, audit readiness (Module PRD §9, §11) | SPR-MOD-013-004 |
| Assets governance conventions (summarized in §7) | Established across SPR-MOD-013-001 … SPR-MOD-013-004 |

### 4.2 Reverse Map — Originating Sprint → Module PRD Capability

| Sprint | Module PRD Capability |
| --- | --- |
| SPR-MOD-013-001 | Asset register and hierarchy; Capitalization and componentization; Insurance and warranty |
| SPR-MOD-013-002 | Depreciation methods and schedules |
| SPR-MOD-013-003 | Maintenance and calibration; Transfer and disposal |
| SPR-MOD-013-004 | Assets reports, dashboards, exports, audit readiness (§9, §11) |

No Assets capability sits outside the baseline; no orphans; no duplicate originating allocations; no baseline-introduced capability.

## 5. ERP Core Engine Consumption

**Derived from the union of `related_engines` frontmatter and body citations across `SPR-MOD-013-001` through `SPR-MOD-013-004`, and reconciled with the Sprint Plan §5 Engine Consumption Map.** This baseline MUST faithfully reflect the Sprint PRDs; it MUST NOT introduce additional engines or omit any engine consumed by the sprint family. Consumption is reference-only — no engine behavior is redefined. Identifiers match [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md) and [`docs/ENGINE_USAGE_MATRIX.md`](../ENGINE_USAGE_MATRIX.md) verbatim, and canonical ordering from `ENGINE_CATALOG.md` is preserved.

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-013-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-013-001, 002, 003, 004 |
| ENG-003 (Permission Management Engine) | SPR-MOD-013-001 |
| ENG-004 (Audit Engine) | SPR-MOD-013-001, 002, 003, 004 |
| ENG-005 (Configuration Engine) | SPR-MOD-013-001, 002, 003 |
| ENG-006 (Localization Engine) | SPR-MOD-013-001 |
| ENG-007 (Document Engine) | SPR-MOD-013-001, 003 |
| ENG-008 (Attachment Engine) | SPR-MOD-013-001, 003 |
| ENG-010 (Workflow Engine) | SPR-MOD-013-001, 002, 003 |
| ENG-011 (Approval Engine) | SPR-MOD-013-001, 002, 003 |
| ENG-012 (Rules Engine) | SPR-MOD-013-001, 002, 003 |
| ENG-014 (Scheduler Engine) | SPR-MOD-013-002, 003 |
| ENG-017 (Numbering Engine) | SPR-MOD-013-001, 003 |
| ENG-020 (Search Engine) | SPR-MOD-013-004 |
| ENG-021 (Reporting Engine) | SPR-MOD-013-004 |
| ENG-022 (Dashboard Engine) | SPR-MOD-013-004 |
| ENG-023 (Integration Engine) | SPR-MOD-013-004 |
| ENG-024 (Event Engine) | SPR-MOD-013-001, 002, 003, 004 |
| ENG-025 (Notification Engine) | SPR-MOD-013-001, 002, 003, 004 |
| ENG-026 (Import Engine) | SPR-MOD-013-003 |
| ENG-027 (Export Engine) | SPR-MOD-013-004 |

No Assets sprint redefines engine behavior; all engines are consumed via their Capability Interfaces. `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any Assets sprint — all ledger effects of capitalization, depreciation, and disposal are owned by MOD-002 Accounting via posting-rule bindings triggered by Assets-published events, per the governance boundary declared in the Module PRD and Sprint Plan §5.

## 6. ADR Consumption

**Derived from the union of `related_adrs` frontmatter and body citations across `SPR-MOD-013-001` through `SPR-MOD-013-004`.** All ADRs listed are `Accepted`. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family. Identifiers match [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md) verbatim; canonical ordering from `ADR_INDEX.md` is preserved.

| ADR | Consumed By |
| --- | --- |
| ADR-011 (Multi-Tenant Isolation) | SPR-MOD-013-001, 002, 003, 004 |
| ADR-032 (RBAC + ABAC) | SPR-MOD-013-001, 002, 003, 004 |

## 7. Governance Conventions Established

Every governance convention established across Assets Sprint PRDs 001–004 is summarized below. Ownership remains with the originating Sprint PRDs; this section is a summary, not a redefinition. The list is resolved from the source Sprint PRDs at authoring time — no numeric count is hardcoded, so future v2 additions do not invalidate this section.

**From SPR-MOD-013-001 — Asset Foundation (Register, Capitalization & Insurance)**

- **Asset, Asset Class, Location, and Insurance Policy Master Authority** — MOD-013 Assets owns the business semantics of Asset, Asset Class, Location, and Insurance Policy masters, along with Assets configuration (numbering series, componentization rules, insurance defaults). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, attachments, workflow, rules, eventing, notification) but MUST NOT redefine Assets business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-002 (ledger posting), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD.
- **Capitalization Transaction Authority** — MOD-013 owns the Capitalization transaction and its lifecycle (`draft → submitted → approved → capitalized → reversed`) enforced via `ENG-010`/`ENG-011`. `AssetCapitalized` events are published via `ENG-024`; `PurchaseInvoiceReceived` events (from MOD-004 Purchase) are consumed read-only to seed capitalization candidates. Ledger effects are produced by MOD-002 via posting-rule bindings triggered by the published event.

**From SPR-MOD-013-002 — Depreciation (Methods & Runs)**

- **Depreciation Run Transaction Authority** — MOD-013 owns the Depreciation Run transaction and its lifecycle enforced via `ENG-010`/`ENG-011`; scheduled periodic runs execute via `ENG-014`. `DepreciationPosted` events are published via `ENG-024` to trigger MOD-002 posting bindings.
- **Depreciation Schedule Authority** — Depreciation schedules are generated deterministically per asset and remain immutable once locked.
- **Depreciation Method Evaluation Authority** — Depreciation methods and rates are registered via `ENG-005` and evaluated via `ENG-012`.
- **Capitalization Immutability Rule** — Once a Depreciation Run has been posted, Capitalization amount cannot be altered (rule enforced via `ENG-012`).
- **Active-Asset-Only Rule** — Depreciation Runs complete only for active assets (enforced via `ENG-012`).

**From SPR-MOD-013-003 — Maintenance, Transfer & Disposal**

- **Maintenance Order Transaction Authority** — MOD-013 owns the Maintenance Order transaction lifecycle; orders are scheduled via `ENG-014`, approved via `ENG-011`, and completed against active assets. `MaintenanceCompleted` events (from external maintenance providers) are consumed to close open maintenance orders.
- **Disposal Transaction Authority** — MOD-013 owns the Disposal transaction lifecycle; `AssetDisposed` events publish via `ENG-024`. Ledger effects of disposal are produced by MOD-002 via posting-rule bindings triggered by the published event.
- **Asset Transfer Authority** — MOD-013 owns Asset Transfer between locations; transfers preserve identity and audit trail via `ENG-004`; only Location changes. `AssetTransferred` events publish via `ENG-024`.
- **Calibration Tracking Authority** — Calibration cadence and completion state are tracked deterministically via `ENG-005`/`ENG-012`.
- **Disposed-Asset Immutability Rule** — Disposed assets cannot be edited except via reversal (rule enforced via `ENG-012`).

**From SPR-MOD-013-004 — Assets Analytics & Compliance**

- **Assets Read Model & Report Authority** — MOD-013 owns operational Assets reports (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary), dashboards, exports, and the Assets audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read-Model-Only Boundary Convention** — Dashboards (`ENG-022`), filters, drill-down, search (`ENG-020`), reports (`ENG-021`), integration (`ENG-023`), and export (`ENG-027`) operate over the Assets read model; no new master data, transactions, workflows, or published events are introduced by Sprint 4.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint Assets events (`AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed`) through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

**Governance Complement.** All conventions above complement — and do not replace — the Platform, Accounting, Sales, Purchase, Inventory, CRM, HRMS, Payroll, Manufacturing, Projects, AMC, Field Service, and Warehouse governance conventions established in prior Module Baselines.

**Freeze.** Governance conventions summarized herein are frozen for `MOD013_ASSETS_BASELINE_v1` and SHALL NOT be redefined except through a future baseline revision.

## 8. Event Consumption

**Derived from the events referenced across `SPR-MOD-013-001` through `SPR-MOD-013-004`.** Every referenced event resolves verbatim from [`docs/20-module-prds/assets/MODULE_PRD.md`](../20-module-prds/assets/MODULE_PRD.md) §8 or the authoritative [`docs/02-architecture/event-catalog.md`](../02-architecture/event-catalog.md). **No new event names SHALL be introduced by the Module Baseline.**

**Events Published by Assets** (verbatim from Assets Module PRD §8):

- `AssetCapitalized` — SPR-MOD-013-001
- `DepreciationPosted` — SPR-MOD-013-002
- `AssetTransferred` — SPR-MOD-013-003
- `AssetDisposed` — SPR-MOD-013-003

**Events Consumed by Assets** (verbatim from Assets Module PRD §8):

- `PurchaseInvoiceReceived` (from MOD-004 Purchase) — SPR-MOD-013-001
- `MaintenanceCompleted` (from external maintenance providers) — SPR-MOD-013-003
- `AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed` (Assets-published; consumed by the read model) — SPR-MOD-013-004

Deferred event surfaces are inherited as `R-EV-*` risks from the originating Sprints and remain governed by those Sprint PRDs.

## 9. Cross-Module Contracts

The following modules consume `MOD013_ASSETS_BASELINE_v1` as an upstream contract or are consumed as upstream contracts by Assets. All module identifiers and names are resolved verbatim from [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) at authoring time; the Module Catalog is the authoritative source for cross-module IDs.

**Assets SHALL consume Platform, Purchase, Accounting, and Analytics services through approved repository contracts and SHALL NOT redefine ownership established by those modules.**

**Upstream contracts consumed by Assets:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-004 Purchase** — `PurchaseInvoiceReceived` event consumed read-only to seed capitalization candidates.
- **MOD-002 Accounting** — ledger effects of capitalization, depreciation, and disposal are owned by MOD-002 via `ENG-015` Voucher and `ENG-016` Posting bindings; MOD-013 does not invoke the voucher or posting engines directly.

**Downstream consumers of the Assets baseline** (per Assets Module PRD §13 *Provides To Modules*):

- **MOD-002 Accounting** — consumes `AssetCapitalized`, `DepreciationPosted`, and `AssetDisposed` for ledger-effect bindings.
- **MOD-017 Analytics** — consumes Assets operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

Downstream modules MUST NOT own Assets master data, redefine the Asset / Capitalization / Depreciation Run / Maintenance Order / Disposal lifecycles, or redefine Assets analytics ownership. No downstream module owns Assets records.

## 10. Module Completion & Freeze Statement

All four planned Assets Sprint PRDs (`SPR-MOD-013-001` … `SPR-MOD-013-004`) exist, the [Sprint Plan](../30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md) is executed, and repository verification has been completed under GT-004. Downstream modules SHOULD consume this baseline rather than individual Sprint PRDs unless sprint-level traceability is explicitly required.

> **Freeze.** MOD-013 Assets is now frozen for downstream consumption. Future changes to `MOD013_ASSETS_BASELINE_v1` SHALL be introduced only through a new baseline revision (e.g., `MOD013_ASSETS_BASELINE_v2`) and SHALL preserve backward traceability to this baseline. This baseline is versioned governance, analogous to a published API or database schema version.

## 11. Deferred Items

The following capabilities are intentionally **out of scope** for `MOD013_ASSETS_BASELINE_v1`. They MAY be addressed in a future baseline revision, in a separate module, or by an external system, subject to a future Module PRD amendment.

- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Ledger effects of capitalization, depreciation, and disposal (owned by MOD-002 Accounting).
- Future Enhancements enumerated in the Assets Module PRD §14 (Digital twin integration; Predictive maintenance).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 12. References

- [`docs/20-module-prds/assets/MODULE_PRD.md`](../20-module-prds/assets/MODULE_PRD.md) — MOD-013 Module PRD (authoritative).
- [`docs/30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md`](../30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md) — Stage 1 Sprint Plan.
- [`docs/30-sprint-prds/assets/SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md`](../30-sprint-prds/assets/SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md)
- [`docs/30-sprint-prds/assets/SPR-MOD-013-002-depreciation-methods-and-runs.md`](../30-sprint-prds/assets/SPR-MOD-013-002-depreciation-methods-and-runs.md)
- [`docs/30-sprint-prds/assets/SPR-MOD-013-003-maintenance-transfer-and-disposal.md`](../30-sprint-prds/assets/SPR-MOD-013-003-maintenance-transfer-and-disposal.md)
- [`docs/30-sprint-prds/assets/SPR-MOD-013-004-assets-analytics-and-compliance.md`](../30-sprint-prds/assets/SPR-MOD-013-004-assets-analytics-and-compliance.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — three-stage cadence.
- [`docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`](../15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md) — authoring template.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — cross-repository catalog.
- [`docs/MODULE_CATALOG.md`](../MODULE_CATALOG.md) — authoritative source for cross-module identifiers.
- [`docs/40-module-baselines/README.md`](./README.md) — layer README.
- [`docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](./MOD001_PLATFORM_BASELINE_v1.md) — upstream Platform baseline.
- [`docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](./MOD002_ACCOUNTING_BASELINE_v1.md) — upstream Accounting baseline.
- [`docs/40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](./MOD004_PURCHASE_BASELINE_v1.md) — upstream Purchase baseline.
- ERP Core Engines — see [`docs/10-erp-core/ENGINE_CATALOG.md`](../10-erp-core/ENGINE_CATALOG.md).
- ADRs — see [`docs/11-adrs/ADR_INDEX.md`](../11-adrs/ADR_INDEX.md).
