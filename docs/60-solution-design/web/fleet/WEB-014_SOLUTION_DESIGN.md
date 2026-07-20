---
title: "WEB-014 — Fleet Web Solution Design"
summary: "Web Solution Design for MOD-014 Fleet. Derives all screens, forms, rules, and behaviors exclusively from MOD-014 Module Publication. Introduces no new capabilities."
spec_id: "WEB-014_SOLUTION_DESIGN"
module_id: "MOD-014"
module_name: "Fleet"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "Operations"
source_publication: "docs/45-module-publications/fleet/MOD-014_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/fleet/MODULE_PRD.md", "docs/40-module-baselines/MOD014_FLEET_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-014", "fleet", "WEB-014"]
document_type: "Web Solution Design"
---

# WEB-014 — Fleet Web Solution Design

> **Source of Truth:** [`MOD-014 Module Publication`](../../../45-module-publications/fleet/MOD-014_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-014 Fleet for Fleet Managers, Dispatchers, Finance, Maintenance staff, and Auditors on desktop and tablet browsers: maintain Vehicle / Driver / License / Route / Fuel Station masters plus compliance and insurance records and Fleet configuration; plan, execute, and close Trip Sheets; capture Fuel Entries with telematics reconciliation; plan and complete Maintenance Orders; and observe the Fleet operational read model through reports, dashboards, exports, and the audit-readiness surface — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §7, §8, §9):**

- Web UI for every master data entity in Publication §7 (Vehicle, Driver, License, Route, Fuel Station) plus compliance and insurance records (Publication §3, §4.1).
- Web UI for every transaction in Publication §8 (Trip Sheet, Fuel Entry, Maintenance Order).
- Fleet configuration surfaces authorized by Publication §3 (numbering series, compliance reminder windows, fuel norms per vehicle, maintenance intervals defaults).
- Scheduled preventive maintenance and scheduled compliance reminders (Publication §4.1, §4.3).
- Fleet operational reports enumerated in Publication §3 (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar), dashboards, exports, and audit-readiness surface (Publication §4.4).
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** telematics-driven scoring, AI route optimization, cross-module KPI authoring, ledger effects of fuel/maintenance/disposal, and deferred Event Catalog items. Coverage includes only screens, workflows, and business capabilities defined in the Publication.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities, transactions, and read models in Publication §3, §7, §8, §9:

- **Fleet Home** — landing dashboard (Publication §3, §4.4).
- **Vehicles** — Vehicle master + hierarchy workspace (Publication §7, §4.1).
- **Drivers & Licenses** — Driver / License master workspace (Publication §7, §4.1).
- **Compliance & Insurance** — Compliance and insurance registration workspace (Publication §3, §4.1).
- **Routes** — Route master workspace (Publication §7, §4.2).
- **Trip Sheets** — Trip Sheet transaction workspace (Publication §8, §4.2).
- **Fuel Stations** — Fuel Station master workspace (Publication §7, §4.3).
- **Fuel Entries** — Fuel Entry transaction workspace (Publication §8, §4.3).
- **Maintenance** — Maintenance Order workspace + scheduled preventive maintenance (Publication §8, §4.3).
- **Reports & Dashboards** — reports enumerated in Publication §3, §4.4.
- **Fleet Configuration** — numbering series, compliance reminder windows, fuel norms, maintenance intervals (Publication §3, PRD §10).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Vehicle detail (Overview, Compliance, Insurance, Trips, Fuel, Maintenance, History), Driver detail (Overview, Licenses, Trips, History), and Trip Sheet detail (Overview, Assignment, Odometer, Approvals, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 Vehicle | Vehicle list, hierarchy, detail, create, edit |
| §7 Driver | Driver list, detail, create, edit; driver–license linkage |
| §7 License | License list, detail, create, edit; renewal reminders |
| §7 Route | Route list, detail, create, edit |
| §7 Fuel Station | Fuel Station list, detail, create, edit |
| §3, §4.1 Compliance & Insurance | Compliance/insurance registration; coverage windows; expiry alerts; emits `ComplianceExpiring` (§9) |
| §8 Trip Sheet / §4.2 | Trip Sheet lifecycle; emits `TripClosed` (§9); seeded from consumed `DeliveryDispatched` and `FieldTicketCreated` (§10) |
| §8 Fuel Entry / §4.3 | Fuel Entry lifecycle; telematics reconciliation; emits `FuelRecorded` (§9) |
| §8 Maintenance Order / §4.3 | Maintenance Order lifecycle; scheduled via ENG-014; emits `MaintenanceCompleted` (§9) |
| §3 / §4.4 Reports | Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar |
| §3 Fleet Configuration | Numbering, compliance reminder windows, fuel norms, maintenance intervals |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- Fleet Manager (primary)
- Dispatcher (primary)
- Driver (primary; scoped read/self-actions)
- Finance (secondary)
- Maintenance (secondary)
- Auditor (secondary; read-only surfaces)
- Regulator (external actor; scoped read where authorized)
- Insurer (external actor; scoped read where authorized)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | Fleet Home / Landing Dashboard | §3, §4.4 | Read-only |
| 2 | Vehicles — List | §7 Vehicle | Search, filter, export |
| 3 | Vehicles — Hierarchy Tree | §7 Vehicle | |
| 4 | Vehicle Detail — Overview | §7 Vehicle | |
| 5 | Vehicle Detail — Compliance | §3, §4.1 | Coverage windows |
| 6 | Vehicle Detail — Insurance | §3, §4.1 | Coverage windows |
| 7 | Vehicle Detail — Trips | §8 Trip Sheet | Read-only rollup |
| 8 | Vehicle Detail — Fuel | §8 Fuel Entry | Read-only rollup |
| 9 | Vehicle Detail — Maintenance | §8 Maintenance Order | Read-only rollup |
| 10 | Vehicle Detail — History | §11 ENG-004 | Audit trail |
| 11 | Vehicle Create | §7 Vehicle | |
| 12 | Vehicle Edit | §7 Vehicle | |
| 13 | Vehicle Archive Action | §7 Vehicle | Lifecycle |
| 14 | Drivers — List | §7 Driver | |
| 15 | Driver Detail — Overview | §7 Driver | |
| 16 | Driver Detail — Licenses | §7 Driver + §7 License | Driver–license linkage |
| 17 | Driver Detail — Trips | §8 Trip Sheet | Read-only rollup |
| 18 | Driver Detail — History | §11 ENG-004 | |
| 19 | Driver Create / Edit | §7 Driver | |
| 20 | Licenses — List | §7 License | |
| 21 | License Detail | §7 License | Renewal reminders |
| 22 | License Create / Edit | §7 License | |
| 23 | Compliance & Insurance — List | §3, §4.1 | Expiry-window filters |
| 24 | Compliance Registration Create / Edit | §3, §4.1 | Emits `ComplianceExpiring` (§9) |
| 25 | Insurance Registration Create / Edit | §3, §4.1 | Coverage window |
| 26 | Compliance Calendar Workspace | §3, §4.1, §4.4 | Scheduled via ENG-014 |
| 27 | Routes — List | §7 Route | |
| 28 | Route Detail | §7 Route | |
| 29 | Route Create / Edit | §7 Route | Via ENG-010/011 |
| 30 | Trip Sheets — List | §8 Trip Sheet | |
| 31 | Trip Sheet Detail — Overview | §8, §4.2 | |
| 32 | Trip Sheet Detail — Assignment | §8, §4.2 | Driver + Vehicle |
| 33 | Trip Sheet Detail — Odometer | §8, §4.2 | Open + close readings |
| 34 | Trip Sheet Detail — Approvals | §11 ENG-010/011 | |
| 35 | Trip Sheet Detail — History | §11 ENG-004 | |
| 36 | Trip Sheet Create | §8, §4.2 | Seeded from consumed `DeliveryDispatched` / `FieldTicketCreated` (§10) |
| 37 | Trip Sheet Plan Action | §8, §4.2 | `draft → planned` |
| 38 | Trip Sheet Start Action | §8, §4.2 | `planned → in-progress`; blocked if vehicle compliance expired (§6) |
| 39 | Trip Sheet Close Action | §8, §4.2 | `in-progress → closed`; requires odometer readings (§6); emits `TripClosed` (§9) |
| 40 | Trip Sheet Reverse Action | §8, §4.2 | `closed → reversed` |
| 41 | Trip Candidates Inbox | §4.2, §10 | Read from consumed events (§10) |
| 42 | Fuel Stations — List | §7 Fuel Station | |
| 43 | Fuel Station Detail | §7 Fuel Station | |
| 44 | Fuel Station Create / Edit | §7 Fuel Station | |
| 45 | Fuel Entries — List | §8 Fuel Entry | |
| 46 | Fuel Entry Detail — Overview | §8, §4.3 | Telematics reconciliation |
| 47 | Fuel Entry Create | §8, §4.3 | |
| 48 | Fuel Entry Submit / Approve Actions | §8, §4.3 | Via ENG-010/011 |
| 49 | Fuel Entry Post Action | §8, §4.3 | Emits `FuelRecorded` (§9) |
| 50 | Fuel Entry Reverse Action | §8, §4.3 | |
| 51 | Telematics Reconciliation Workspace | §4.3, §6 | Documents fallback where telematics absent |
| 52 | Maintenance Orders — List | §8 Maintenance Order | |
| 53 | Maintenance Order Detail — Overview | §8, §4.3 | |
| 54 | Maintenance Order Create | §8, §4.3 | |
| 55 | Maintenance Order Approve Action | §8, §4.3 | Via ENG-011 |
| 56 | Maintenance Order Complete Action | §8, §4.3 | Emits `MaintenanceCompleted` (§9) |
| 57 | Scheduled Preventive Maintenance Workspace | §4.3, §11 ENG-014 | Intervals via ENG-005 |
| 58 | Reports — Trip Sheet | §3, §4.4 | |
| 59 | Reports — Fuel Efficiency | §3, §4.4 | |
| 60 | Reports — Maintenance Cost | §3, §4.4 | |
| 61 | Reports — Compliance Calendar | §3, §4.4 | |
| 62 | Audit-Readiness Surface | §4.4 | Read-only over prior-sprint events |
| 63 | Configuration — Numbering Series | §3, §11 ENG-017 | |
| 64 | Configuration — Compliance Reminder Windows | §3, §4.1 | |
| 65 | Configuration — Fuel Norms per Vehicle | §3, §4.3 | |
| 66 | Configuration — Maintenance Intervals Defaults | §3, §4.3 | |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard or tree), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §11–§12) with server-side authoritative validation via ENG-012 (Publication §11).
- Multi-step approval flows (Route, Trip Sheet, Fuel Entry, Maintenance Order) are driven by ENG-010 / ENG-011 (Publication §11).
- Trip Sheet Start blocks assignment when critical compliance is expired for the vehicle (Publication §6).
- Trip Sheet Close requires captured opening and closing odometer with `closing ≥ opening` (Publication §6); emits `TripClosed` (Publication §9).
- Fuel Entry Post emits `FuelRecorded` (Publication §9); telematics reconciliation status displayed on detail; fallback documented when telematics absent (Publication §6).
- Maintenance Order Complete emits `MaintenanceCompleted` (Publication §9); ledger effects produced by MOD-002 (Publication §13).
- Compliance Registration save/update emits `ComplianceExpiring` at scheduled reminder thresholds (Publication §9, §4.1).

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, hierarchy tree, approval-timeline, trip-status badge, fuel-entry-status badge, maintenance-status badge, compliance-status badge, odometer-capture field, telematics-reconciliation indicator, calendar view, attachment tile. All components meet the Accessibility Standard (§23).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012 (Publication §11).
- Attachment fields via ENG-007 / ENG-008 (Publication §11) on Vehicle (documents), Driver (documents), Trip Sheet (proof), Fuel Entry (fuel slips), and Maintenance Order (work reports).
- Numbering series bindings via ENG-017 (Publication §11) on Trip Sheet, Fuel Entry, Maintenance Order.
- Localization via ENG-006 (Publication §11).

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (Vehicle → hierarchy parent; Driver → License; Trip Sheet → Vehicle + Driver + Route; Fuel Entry → Vehicle + Fuel Station; Maintenance Order → Vehicle; Compliance/Insurance → Vehicle).
- Uniqueness for Trip Sheet, Fuel Entry, and Maintenance Order numbers per ENG-017 numbering series (Publication §3, §11).
- Odometer Capture Rule: Trip Sheet close rejected without opening + closing readings or if `closing < opening` (Publication §6).
- Compliance-Blocks-Assignment Rule: Trip Sheet start rejected when the vehicle has expired critical compliance (Publication §6).
- Telematics Reconciliation Rule: Fuel Entry post checks telematics where available; absence of telematics data is captured as a documented fallback (Publication §6).
- Consumed events (`DeliveryDispatched`, `FieldTicketCreated`) treated as read-only inputs (Publication §10, §13).

## 13. Business Rules

Rules restated from Publication §6:

- A trip cannot be closed without odometer readings; closing must be ≥ opening.
- Vehicles with expired critical compliance cannot be assigned to trips.
- Fuel entries reconcile against telematics where available; documented fallback otherwise.
- Fleet master and transaction lifecycles are Fleet-owned; UI never permits mutation of externally-owned data.
- Fleet consumes upstream events read-only.
- Fleet never renders or performs ledger posting; posting is owned by MOD-002 (Publication §11, §13).

## 14. Search

Global search bar and per-list search operate over Publication-declared entity attributes (Vehicle code, Vehicle registration, Driver code, License number, Route code, Fuel Station code, Trip Sheet number, Fuel Entry number, Maintenance Order number). Search is delivered via `ENG-020` (Publication §11).

## 15. Filters

Filter panel derives its facets from entity/transaction fields declared in the Publication (vehicle, driver, route, fuel station, compliance state, insurance state, trip state, fuel-entry state, maintenance state, period). Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002 (Publication §11).

## 17. Dashboards

Dashboards render read-model KPIs from the Fleet Analytics & Compliance surface (§4.4). No dashboard writes state. Cross-module KPI definitions remain owned by MOD-017 Analytics (Publication §13).

## 18. Reports

Reports enumerated in Publication §3 (Trip Sheet, Fuel Efficiency, Maintenance Cost, Compliance Calendar) are rendered via ENG-021 with export via ENG-027 (Publication §11). No report is introduced beyond the Publication set.

## 19. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events) and scheduled Compliance / Maintenance thresholds authorized by Publication §3, §4.1, §4.3. The UI surfaces notifications; it does not define new event semantics.

## 20. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-014).

## 21. Loading States

Skeleton loaders for lists, hierarchy trees, calendars, and detail pages. Read-model refresh and scheduled maintenance/compliance runs are long-running; progress is surfaced with polling.

## 22. Empty States

Every list/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 23. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes (trip close, fuel post, maintenance complete, compliance registration).

## 24. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). Mobile portrait is served by MOB-014.

## 25. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and cost-sensitive fields (fuel cost, maintenance cost) redacted for unauthorized roles.

## 26. Performance

Interactive operations complete within the platform latency budget (PRD §11). Scheduled preventive maintenance, scheduled compliance reminders, and read-model refresh run within the platform batch envelope (PRD §11).

## 27. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history.

## 28. Acceptance Criteria & Traceability Matrix

WEB-014 is Accepted when every screen in §8 resolves to a Publication anchor, every validation in §12 traces to a Publication rule or entity attribute, every rule in §13 is enforced server-side and surfaced on the relevant screen, and accessibility/security/audit checks in §23, §25, §27 pass the platform baseline. No screen introduces functionality absent from the Publication.

| Publication § | Anchor | WEB-014 Section |
| --- | --- | --- |
| §2 Purpose | Fleet purpose | §1 |
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
