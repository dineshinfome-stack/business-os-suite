---
title: "WEB-013 — Assets Web Solution Design"
summary: "Web Solution Design for MOD-013 Assets. Derives all screens, forms, rules, and behaviors exclusively from MOD-013 Module Publication. Introduces no new capabilities."
spec_id: "WEB-013_SOLUTION_DESIGN"
module_id: "MOD-013"
module_name: "Assets"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "Operations"
source_publication: "docs/45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/assets/MODULE_PRD.md", "docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-013", "assets", "WEB-013"]
document_type: "Web Solution Design"
---

# WEB-013 — Assets Web Solution Design

> **Source of Truth:** [`MOD-013 Module Publication`](../../../45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-013 Assets for Asset Managers, Finance users, Maintenance planners, and Auditors on desktop and tablet browsers: maintain Asset / Asset Class / Location / Insurance Policy masters and Assets configuration, execute the Acquire-to-capitalize, Capitalize-to-depreciate, Maintain, and Transfer/Dispose processes, capture Capitalization / Depreciation Run / Maintenance Order / Asset Transfer / Disposal transactions, and observe the Assets operational read model through reports, dashboards, exports, and the audit-readiness surface — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §7, §8, §9):**

- Web UI for every master data entity in Publication §7 (Asset, Asset Class, Location, Insurance Policy).
- Web UI for every transaction in Publication §8 (Capitalization, Depreciation Run, Maintenance Order, Asset Transfer, Disposal).
- Assets configuration surfaces authorized by Publication §3 (numbering series, componentization rules, insurance defaults, depreciation methods per class).
- Depreciation method registration and evaluation (Publication §4.2).
- Calibration cadence tracking (Publication §4.3).
- Assets operational reports enumerated in Publication §3 (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary), dashboards, exports, and audit-readiness surface (Publication §4.4).
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** digital twin integration, predictive maintenance, cross-module KPI authoring, ledger effects of capitalization / depreciation / disposal, and deferred Event Catalog items. Coverage shall include only the screens, workflows, and business capabilities defined in the Publication.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities, transactions, and read models in Publication §3, §7, §8, §9:

- **Assets Home** — landing dashboard (Publication §3, §4.4).
- **Asset Register** — Asset master and hierarchy workspace (Publication §7, §4.1).
- **Capitalizations** — Capitalization transaction workspace (Publication §8, §4.1).
- **Depreciation** — Depreciation Method configuration + Depreciation Run workspace + Schedules (Publication §8, §4.2).
- **Maintenance** — Maintenance Order + Calibration workspace (Publication §8, §4.3).
- **Transfers** — Asset Transfer workspace (Publication §8, §4.3).
- **Disposals** — Disposal transaction workspace (Publication §8, §4.3).
- **Insurance** — Insurance Policy master workspace (Publication §7).
- **Reports & Dashboards** — reports enumerated in Publication §3, §4.4.
- **Assets Configuration** — numbering series, componentization rules, insurance defaults, depreciation methods per class (Publication §3, PRD §10).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Asset detail (Overview, Components, Capitalization, Depreciation Schedule, Maintenance, Transfers, Insurance, History) and Capitalization detail (Overview, Components, Approvals, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 Asset | Asset list, hierarchy, detail, create, edit |
| §7 Asset Class | Asset Class list, detail, create, edit |
| §7 Location | Location list, detail, create, edit |
| §7 Insurance Policy | Insurance Policy list, detail, create, edit |
| §8 Capitalization / §4.1 | Capitalization lifecycle; emits `AssetCapitalized` (§9) |
| §8 Depreciation Run / §4.2 | Depreciation Run lifecycle; scheduled runs via ENG-014; emits `DepreciationPosted` (§9) |
| §8 Maintenance Order / §4.3 | Maintenance Order lifecycle; calibration cadence |
| §8 Asset Transfer / §4.3 | Asset Transfer; emits `AssetTransferred` (§9) |
| §8 Disposal / §4.3 | Disposal lifecycle; emits `AssetDisposed` (§9) |
| §3 / §4.4 Reports | Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary |
| §3 Assets Configuration | Numbering, componentization, insurance defaults, depreciation methods |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- Asset Manager (primary)
- Finance (primary)
- Maintenance (primary)
- Auditor (secondary; read-only surfaces)
- Insurer (external actor; scoped read where authorized)
- Vendor (external actor; scoped read where authorized)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | Assets Home / Landing Dashboard | §3, §4.4 | Read-only |
| 2 | Asset Register — List | §7 Asset | Search, filter, export |
| 3 | Asset Register — Hierarchy Tree | §7 Asset, §4.1 | Componentization view |
| 4 | Asset Detail — Overview | §7 Asset | |
| 5 | Asset Detail — Components | §7 Asset, §4.1 | Componentization rules |
| 6 | Asset Detail — Capitalization | §8 Capitalization | |
| 7 | Asset Detail — Depreciation Schedule | §8, §4.2 | Immutable once locked |
| 8 | Asset Detail — Maintenance | §8 Maintenance Order | |
| 9 | Asset Detail — Transfers | §8 Asset Transfer | |
| 10 | Asset Detail — Insurance | §7 Insurance Policy | Coverage linkage |
| 11 | Asset Detail — History | §11 ENG-004 | Audit trail |
| 12 | Asset Create | §7 Asset | |
| 13 | Asset Edit | §7 Asset | |
| 14 | Asset Archive Action | §7 Asset | Lifecycle |
| 15 | Asset Classes — List | §7 Asset Class | |
| 16 | Asset Class — Detail / Create / Edit | §7 Asset Class | Componentization rules; depreciation methods per class |
| 17 | Locations — List | §7 Location | |
| 18 | Location — Detail / Create / Edit | §7 Location | |
| 19 | Insurance Policies — List | §7 Insurance Policy | |
| 20 | Insurance Policy — Detail / Create / Edit | §7 Insurance Policy | |
| 21 | Capitalizations — List | §8 Capitalization | |
| 22 | Capitalization Detail — Overview | §8, §4.1 | |
| 23 | Capitalization Create | §8, §4.1 | Seeded from `PurchaseInvoiceReceived` (§10) |
| 24 | Capitalization Submit Action | §8, §4.1 | `draft → submitted` |
| 25 | Capitalization Approve Action | §8, §4.1 | `submitted → approved` via ENG-011 |
| 26 | Capitalization Post / Capitalize Action | §8, §4.1 | `approved → capitalized`; emits `AssetCapitalized` (§9) |
| 27 | Capitalization Reverse Action | §8, §4.1 | `capitalized → reversed` |
| 28 | Capitalization Detail — Components | §4.1 | Componentization |
| 29 | Capitalization Detail — Approvals | §11 ENG-010/011 | |
| 30 | Capitalization Detail — History | §11 ENG-004 | |
| 31 | Depreciation Methods — List | §3, §4.2 | Per class; via ENG-005 |
| 32 | Depreciation Method — Detail / Create / Edit | §3, §4.2 | Evaluated via ENG-012 |
| 33 | Depreciation Runs — List | §8, §4.2 | |
| 34 | Depreciation Run Detail — Overview | §8, §4.2 | |
| 35 | Depreciation Run Create | §8, §4.2 | |
| 36 | Depreciation Run Submit / Approve Actions | §8, §4.2 | Via ENG-010/011 |
| 37 | Depreciation Run Post Action | §8, §4.2 | Emits `DepreciationPosted` (§9) |
| 38 | Depreciation Schedule Viewer | §4.2 | Deterministic; immutable once locked |
| 39 | Scheduled Depreciation Workspace | §4.2, §11 ENG-014 | |
| 40 | Depreciation Run Detail — History | §11 ENG-004 | |
| 41 | Maintenance Orders — List | §8 Maintenance Order | |
| 42 | Maintenance Order Detail — Overview | §8, §4.3 | |
| 43 | Maintenance Order Create | §8, §4.3 | |
| 44 | Maintenance Order Approve Action | §8, §4.3 | Via ENG-011 |
| 45 | Maintenance Order Complete Action | §8, §4.3 | Closed via consumed `MaintenanceCompleted` (§10) |
| 46 | Scheduled Maintenance Workspace | §4.3, §11 ENG-014 | |
| 47 | Calibration Tracker | §4.3 | Cadence via ENG-005/012 |
| 48 | Asset Transfers — List | §8 Asset Transfer | |
| 49 | Asset Transfer Detail — Overview | §8, §4.3 | Identity-preserving |
| 50 | Asset Transfer Create | §8, §4.3 | Only Location changes; emits `AssetTransferred` (§9) |
| 51 | Disposals — List | §8 Disposal | |
| 52 | Disposal Detail — Overview | §8, §4.3 | Disposed-asset immutability |
| 53 | Disposal Create | §8, §4.3 | |
| 54 | Disposal Approve Action | §8, §4.3 | Via ENG-011 |
| 55 | Disposal Post Action | §8, §4.3 | Emits `AssetDisposed` (§9) |
| 56 | Disposal Reverse Action | §8, §4.3 | Only path to edit a disposed asset (§6) |
| 57 | Reports — Asset Register | §3, §4.4 | |
| 58 | Reports — Depreciation Schedule | §3, §4.4 | |
| 59 | Reports — Maintenance History | §3, §4.4 | |
| 60 | Reports — Disposal Summary | §3, §4.4 | |
| 61 | Audit-Readiness Surface | §4.4 | Read-only over prior-sprint events |
| 62 | Configuration — Numbering Series | §3, §11 ENG-017 | |
| 63 | Configuration — Componentization Rules | §3 | |
| 64 | Configuration — Insurance Defaults | §3 | |
| 65 | Configuration — Depreciation Methods per Class | §3, §4.2 | Via ENG-005/012 |
| 66 | Import Workspace | §11 ENG-026 | Bounded to Publication entities |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard or tree), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §11–§12) with server-side authoritative validation via ENG-012 (Publication §11).
- Multi-step approval flows (Capitalization, Depreciation Run, Maintenance Order, Disposal) are driven by ENG-010 / ENG-011 (Publication §11).
- Capitalization Post emits `AssetCapitalized` (Publication §9); ledger effects are produced by MOD-002 (Publication §13).
- Depreciation Run Post emits `DepreciationPosted` (Publication §9).
- Asset Transfer save emits `AssetTransferred` (Publication §9); only Location may change (Publication §4.3).
- Disposal Post emits `AssetDisposed` (Publication §9); post-disposal edits are blocked except via Reverse (Publication §6).
- Depreciation Schedule is deterministic and immutable once locked (Publication §4.2).

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, hierarchy tree, approval-timeline, capitalization-status badge, depreciation-run-status badge, disposal-status badge, schedule-viewer, calibration-cadence indicator, attachment tile. All components meet the Accessibility Standard (§23).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012 (Publication §11).
- Attachment fields via ENG-007 / ENG-008 (Publication §11) on Asset (documents), Capitalization (evidence), Maintenance Order (work reports), and Disposal (evidence).
- Numbering series bindings via ENG-017 (Publication §11) on Capitalization, Depreciation Run, Maintenance Order, Asset Transfer, Disposal.
- Localization via ENG-006 (Publication §11).

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (Asset → Asset Class + Location; Capitalization → Asset; Depreciation Run → Asset; Maintenance Order → Asset; Asset Transfer → Asset + Location; Disposal → Asset; Insurance Policy → Asset).
- Uniqueness for Capitalization, Depreciation Run, Maintenance Order, Asset Transfer, and Disposal numbers per ENG-017 numbering series (Publication §3, §11).
- Capitalization immutability rule: Capitalization amount rejected after any Depreciation Run has been posted for the asset (Publication §6).
- Active-Asset-Only rule: Depreciation Run completion rejected for non-active assets (Publication §6).
- Disposed-Asset immutability rule: edits to a disposed asset rejected except via Disposal Reverse (Publication §6).
- Asset Transfer rule: only Location may change; identity is preserved (Publication §4.3).
- Consumed events (`PurchaseInvoiceReceived`, `MaintenanceCompleted`) treated as read-only inputs (Publication §10, §13).

## 13. Business Rules

Rules restated from Publication §6:

- Depreciation is posted only for active assets.
- A disposed asset cannot be edited except via reversal.
- Capitalization amount cannot be changed once a depreciation run has occurred.
- Assets master and transaction lifecycles are Assets-owned; UI never permits mutation of externally-owned data.
- Assets consumes upstream events read-only.
- Assets never renders or performs ledger posting; posting is owned by MOD-002 (Publication §11, §13).

## 14. Search

Global search bar and per-list search operate over Publication-declared entity attributes (Asset code, Asset name, Asset Class code, Location code, Capitalization number, Depreciation Run number, Maintenance Order number, Asset Transfer number, Disposal number, Insurance Policy number). Search is delivered via `ENG-020` (Publication §11).

## 15. Filters

Filter panel derives its facets from entity/transaction fields declared in the Publication (asset, asset class, location, status, capitalization state, depreciation period, maintenance state, transfer period, disposal state, insurance state). Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002 (Publication §11).

## 17. Dashboards

Dashboards render read-model KPIs from the Assets Analytics & Compliance surface (§4.4). No dashboard writes state. Cross-module KPI definitions remain owned by MOD-017 Analytics (Publication §13).

## 18. Reports

Reports enumerated in Publication §3 (Asset Register, Depreciation Schedule, Maintenance History, Disposal Summary) are rendered via ENG-021 with export via ENG-027 (Publication §11). No report is introduced beyond the Publication set.

## 19. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events) and scheduled Depreciation / Maintenance / Calibration thresholds authorized by Publication §3, §4.2, §4.3. The UI surfaces notifications; it does not define new event semantics.

## 20. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-013).

## 21. Loading States

Skeleton loaders for lists, hierarchy trees, schedules, and detail pages. Read-model refresh and scheduled depreciation runs are long-running; progress is surfaced with polling.

## 22. Empty States

Every list/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 23. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes (capitalization post, depreciation post, maintenance complete, transfer save, disposal post).

## 24. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). Mobile portrait is served by MOB-013.

## 25. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and cost-sensitive fields (capitalization amount, depreciation basis, disposal proceeds) redacted for unauthorized roles.

## 26. Performance

Interactive operations complete within the platform latency budget (PRD §11). Scheduled depreciation and scheduled maintenance, and read-model refresh run within the platform batch envelope (PRD §11).

## 27. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history.

## 28. Acceptance Criteria & Traceability Matrix

WEB-013 is Accepted when every screen in §8 resolves to a Publication anchor, every validation in §12 traces to a Publication rule or entity attribute, every rule in §13 is enforced server-side and surfaced on the relevant screen, and accessibility/security/audit checks in §23, §25, §27 pass the platform baseline. No screen introduces functionality absent from the Publication.

| Publication § | Anchor | WEB-013 Section |
| --- | --- | --- |
| §2 Purpose | Assets purpose | §1 |
| §3 Scope | Full scope | §2, §4, §6 |
| §4 Authorities | Ownership | §7, §13 |
| §5 Requirements | Sprint refs | §8, §11–§13 |
| §6 Business Rules | Rules | §12, §13 |
| §7 Master Data | Entities | §8, §11 |
| §8 Transactions | Transactions | §8, §11 |
| §9 Published Events | Events | §19 |
| §10 Consumed Events | Events (read-only inputs) | §12, §13 |
| §11 Engines | Engine consumption | §14–§19, §25, §27 |
| §12 Dependencies | Upstream/downstream | §7 (roles), §25 |
| §13 Boundaries | Ownership | §13 |
| §15 Non-Goals | Exclusions | §2 (out of scope) |
