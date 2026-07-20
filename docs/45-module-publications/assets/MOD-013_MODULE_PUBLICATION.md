---
title: "MOD-013 Module Publication — Assets"
summary: "GT-005 Module Publication for MOD-013 Assets. Terminal governance artifact derived exclusively from MOD013_ASSETS_BASELINE_v1 and the MOD-013 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-013_MODULE_PUBLICATION"
publication_id: "MOD-013_MODULE_PUBLICATION"
module_id: "MOD-013"
module_name: "Assets"
version: "1.0"
status: "Published"
owner: "Operations"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/assets/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md"
source_module: "MOD-013"
source_sprints: ["SPR-MOD-013-001", "SPR-MOD-013-002", "SPR-MOD-013-003", "SPR-MOD-013-004"]
layer: "delivery"
updated: "2026-07-20"
tags: ["publication", "module", "MOD-013", "assets", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD013-20260720T140000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-010", "ENG-011", "ENG-012", "ENG-014", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-026", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
related_modules: ["MOD-001", "MOD-002", "MOD-004", "MOD-017"]
---

# MOD-013 Module Publication — Assets

> **Reference publication only.** Faithful representation of [`MOD013_ASSETS_BASELINE_v1`](../../40-module-baselines/MOD013_ASSETS_BASELINE_v1.md) and the [`MOD-013 Module PRD`](../../20-module-prds/assets/MODULE_PRD.md). Introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-013
- **Module Name:** Assets
- **Owner:** Operations
- **Publication ID:** MOD-013_MODULE_PUBLICATION
- **Source Baseline:** `MOD013_ASSETS_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md`](../../30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-013-001` … `SPR-MOD-013-004`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

Assets is the authoritative bounded context for Fixed Asset Management (Baseline §1; PRD §1). It owns Asset, Asset Class, Location, and Insurance Policy master lifecycles and Assets configuration (numbering series, componentization rules, insurance defaults); the Capitalization transaction lifecycle (`draft → submitted → approved → capitalized → reversed`); deterministic depreciation methods and schedules and the Depreciation Run transaction; Maintenance Order and calibration tracking; Asset Transfer (identity-preserving location change); the Disposal transaction lifecycle with disposed-asset immutability; and the Assets operational read model for reports, dashboards, exports, and audit readiness (Baseline §2; PRD §2). Identity, authentication, roles, permissions, configuration hierarchy, localization, and audit collection remain owned by MOD-001 Platform Administration; ledger effects of capitalization, depreciation, and disposal are produced by MOD-002 Accounting via `ENG-015` and `ENG-016` bindings triggered by Assets-published events; `PurchaseInvoiceReceived` (from MOD-004 Purchase) is consumed read-only to seed capitalization candidates; cross-module KPI definitions remain owned by MOD-017 Analytics (Baseline §2, §5, §9; PRD §2, §13).

## 3. Approved Scope

Restates the scope consolidated in `MOD013_ASSETS_BASELINE_v1` §2 and the Module PRD §2. Assets owns:

- Asset register and hierarchy — Asset, Asset Class, and Location master data; register/hierarchy management (Baseline §2; PRD §2, §5).
- Capitalization and componentization — Capitalization transaction lifecycle (`draft → submitted → approved → capitalized → reversed`); componentization rules (Baseline §2; PRD §2, §6).
- Depreciation methods and schedules — depreciation method configuration; deterministic depreciation schedules; the Depreciation Run transaction; scheduled periodic runs (Baseline §2; PRD §2, §6).
- Maintenance and calibration — Maintenance Order transaction lifecycle; calibration cadence and state tracking (Baseline §2; PRD §2, §6).
- Transfer and disposal — Asset Transfer (identity-preserving location change); Disposal transaction lifecycle with disposed-asset immutability (Baseline §2, §7; PRD §2, §6).
- Insurance and warranty — Insurance Policy master; coverage linkage; insurance defaults (Baseline §2; PRD §2, §5, §10).
- Assets Analytics & Compliance — read-model operational reports (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary), dashboards, exports, and audit-readiness surface (Baseline §2; PRD §9, §11).

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Inherited verbatim from `MOD013_ASSETS_BASELINE_v1` §7.

### 4.1 SPR-MOD-013-001 — Asset Foundation (Register, Capitalization & Insurance)

- **Asset, Asset Class, Location, and Insurance Policy Master Authority** — MOD-013 Assets owns the business semantics of Asset, Asset Class, Location, and Insurance Policy masters, along with Assets configuration (numbering series, componentization rules, insurance defaults). ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, attachments, workflow, rules, eventing, notification) but MUST NOT redefine Assets business rules. Ownership boundaries with MOD-001 (identity/permissions), MOD-002 (ledger posting), and MOD-017 (cross-module KPI definitions) are consumed verbatim from the Module PRD.
- **Capitalization Transaction Authority** — MOD-013 owns the Capitalization transaction and its lifecycle (`draft → submitted → approved → capitalized → reversed`) enforced via `ENG-010`/`ENG-011`. `AssetCapitalized` events are published via `ENG-024`; `PurchaseInvoiceReceived` events (from MOD-004 Purchase) are consumed read-only to seed capitalization candidates. Ledger effects are produced by MOD-002 via posting-rule bindings triggered by the published event.

### 4.2 SPR-MOD-013-002 — Depreciation (Methods & Runs)

- **Depreciation Run Transaction Authority** — MOD-013 owns the Depreciation Run transaction and its lifecycle enforced via `ENG-010`/`ENG-011`; scheduled periodic runs execute via `ENG-014`. `DepreciationPosted` events are published via `ENG-024` to trigger MOD-002 posting bindings.
- **Depreciation Schedule Authority** — Depreciation schedules are generated deterministically per asset and remain immutable once locked.
- **Depreciation Method Evaluation Authority** — Depreciation methods and rates are registered via `ENG-005` and evaluated via `ENG-012`.
- **Capitalization Immutability Rule** — Once a Depreciation Run has been posted, Capitalization amount cannot be altered (rule enforced via `ENG-012`).
- **Active-Asset-Only Rule** — Depreciation Runs complete only for active assets (enforced via `ENG-012`).

### 4.3 SPR-MOD-013-003 — Maintenance, Transfer & Disposal

- **Maintenance Order Transaction Authority** — MOD-013 owns the Maintenance Order transaction lifecycle; orders are scheduled via `ENG-014`, approved via `ENG-011`, and completed against active assets. `MaintenanceCompleted` events (from external maintenance providers) are consumed to close open maintenance orders.
- **Disposal Transaction Authority** — MOD-013 owns the Disposal transaction lifecycle; `AssetDisposed` events publish via `ENG-024`. Ledger effects of disposal are produced by MOD-002 via posting-rule bindings triggered by the published event.
- **Asset Transfer Authority** — MOD-013 owns Asset Transfer between locations; transfers preserve identity and audit trail via `ENG-004`; only Location changes. `AssetTransferred` events publish via `ENG-024`.
- **Calibration Tracking Authority** — Calibration cadence and completion state are tracked deterministically via `ENG-005`/`ENG-012`.
- **Disposed-Asset Immutability Rule** — Disposed assets cannot be edited except via reversal (rule enforced via `ENG-012`).

### 4.4 SPR-MOD-013-004 — Assets Analytics & Compliance

- **Assets Read Model & Report Authority** — MOD-013 owns operational Assets reports (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary), dashboards, exports, and the Assets audit-readiness surface as a read-model consumption of prior-sprint data and consumed events. Cross-module KPI definitions remain exclusive to MOD-017 Analytics.
- **Read-Model-Only Boundary Convention** — Dashboards (`ENG-022`), filters, drill-down, search (`ENG-020`), reports (`ENG-021`), integration (`ENG-023`), and export (`ENG-027`) operate over the Assets read model; no new master data, transactions, workflows, or published events are introduced by Sprint 4.
- **Audit Readiness Boundary Convention** — Audit readiness exposes prior-sprint Assets events (`AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed`) through the read model; audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-013-001` … `SPR-MOD-013-004`) as consolidated in `MOD013_ASSETS_BASELINE_v1`. This publication introduces no new requirements.

## 6. Business Rules

Verbatim from Module PRD §7 and Baseline §7:

- Depreciation is posted only for active assets (PRD §7; Baseline §7 Active-Asset-Only Rule).
- A disposed asset cannot be edited except via reversal (PRD §7; Baseline §7 Disposed-Asset Immutability Rule).
- Capitalization amount cannot be changed once a depreciation run has occurred (PRD §7; Baseline §7 Capitalization Immutability Rule).
- Assets master and transaction lifecycles are Assets-owned; no other module mutates Assets state (Baseline §7).
- Assets does not implement double-entry posting; ledger effects of capitalization, depreciation, and disposal are produced by MOD-002 Accounting via `ENG-015` and `ENG-016` bindings triggered by Assets-published events (PRD §2, §6; Baseline §5, §7, §9).
- `PurchaseInvoiceReceived` is consumed read-only to seed capitalization candidates (Baseline §7, §8).
- Analytics surfaces are read-only projections over the Assets read model (Baseline §7).

## 7. Master Data Authorities

Verbatim from Module PRD §5 and Baseline §4, §7:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Asset | SPR-MOD-013-001 |
| Asset Class | SPR-MOD-013-001 |
| Location | SPR-MOD-013-001 |
| Insurance Policy | SPR-MOD-013-001 |

## 8. Transaction Authorities

Verbatim from Module PRD §6 and Baseline §4, §7:

| Transaction | Originating Sprint |
| --- | --- |
| Capitalization | SPR-MOD-013-001 |
| Depreciation Run | SPR-MOD-013-002 |
| Maintenance Order | SPR-MOD-013-003 |
| Asset Transfer | SPR-MOD-013-003 |
| Disposal | SPR-MOD-013-003 |

## 9. Published Events

Emitted via `ENG-024` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by Assets; delivery infrastructure owned by Platform. Verbatim from Baseline §8 and Module PRD §8:

- `AssetCapitalized` — SPR-MOD-013-001
- `DepreciationPosted` — SPR-MOD-013-002
- `AssetTransferred` — SPR-MOD-013-003
- `AssetDisposed` — SPR-MOD-013-003

## 10. Consumed Events

Consumed via `ENG-024`. Consumption is read-only. Verbatim from Baseline §8 and Module PRD §8:

- `PurchaseInvoiceReceived` (from MOD-004 Purchase) — SPR-MOD-013-001
- `MaintenanceCompleted` (from external maintenance providers) — SPR-MOD-013-003
- `AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed` (Assets-published; consumed by the read model) — SPR-MOD-013-004

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-013 via their Capability Interfaces. Engine set inherited verbatim from `MOD013_ASSETS_BASELINE_v1` §5:

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

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-032` (RBAC + ABAC). `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any Assets sprint — ledger effects of capitalization, depreciation, and disposal are owned by MOD-002 via posting-rule bindings triggered by Assets-published events, per the governance boundary in the Module PRD and Baseline §5, §7.

## 12. Dependencies

Verbatim from `MOD013_ASSETS_BASELINE_v1` §9 and Module PRD §13.

**Upstream contracts consumed by Assets:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- `MOD004_PURCHASE_BASELINE_v1` — `PurchaseInvoiceReceived` event consumed read-only to seed capitalization candidates.
- `MOD002_ACCOUNTING_BASELINE_v1` — ledger effects of capitalization, depreciation, and disposal are owned by MOD-002 via `ENG-015` and `ENG-016` bindings; MOD-013 does not invoke the voucher or posting engines directly.

**Downstream consumers of Assets:**

- `MOD-002 Accounting` — consumes `AssetCapitalized`, `DepreciationPosted`, and `AssetDisposed` for ledger-effect bindings.
- `MOD-017 Analytics` — consumes Assets operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

## 13. Ownership Boundaries

Verbatim from Baseline §7 and §9 and PRD §2, §13:

- MOD-013 owns **only** the authorities enumerated in §4.
- Downstream modules MUST NOT own Assets master data, redefine the Asset / Capitalization / Depreciation Run / Maintenance Order / Asset Transfer / Disposal lifecycles, or redefine Assets analytics ownership.
- Identity, authentication, roles, permissions, configuration hierarchy, localization, and audit collection remain owned by MOD-001 Platform Administration.
- Ledger posting for capitalization, depreciation, and disposal is produced by MOD-002 via `ENG-015` and `ENG-016`; Assets emits events and does not write journal entries directly.
- `PurchaseInvoiceReceived` is owned by MOD-004 Purchase; Assets consumes it read-only.
- `ENG-004` remains authoritative for audit collection; Assets owns only the business-level audit-readiness surface.
- `ENG-024` remains authoritative for event delivery infrastructure; Assets owns the semantics of the events it emits.
- Cross-module KPI definitions remain exclusive to MOD-017 Analytics.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md`](../../30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | `SPR-MOD-013-001` … `SPR-MOD-013-004` |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md`](../../40-module-baselines/MOD013_ASSETS_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |

## 15. Non-Goals

Inherited verbatim from Baseline §11 and Module PRD §14 (as future items):

- Digital twin integration (PRD §14 Future Enhancements).
- Predictive maintenance (PRD §14).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Ledger effects of capitalization, depreciation, and disposal (owned by MOD-002 Accounting).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and the MOD-006 … MOD-012 reference pattern, Phase 3 Solution Design proceeds in the sequence:

`WEB-013 → MOB-013 → API-013 → CPC-013 → VR-013`

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority in §4 is inherited verbatim from `MOD013_ASSETS_BASELINE_v1`.
2. Engine and ADR sets in §11 match Baseline §5–§6 exactly.
3. Dependency set in §12 matches Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD013-20260720T140000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD013_PUBLICATION_COMPLETE` → ready for `WEB-013 Assets Solution Design`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD013_ASSETS_BASELINE_v2`).

## 19. Repository State Transition

`MOD013_BASELINE_FROZEN` → **`MOD013_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md`](../../40-module-baselines/MOD013_ASSETS_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md)
- [`docs/30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md`](../../30-sprint-prds/assets/MOD-013_SPRINT_PLAN.md)
- [`docs/45-module-publications/field-service/MOD-012_MODULE_PUBLICATION.md`](../field-service/MOD-012_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
