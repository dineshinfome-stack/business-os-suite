---
title: "WEB-009 — Manufacturing Web Solution Design"
summary: "Web Solution Design for MOD-009 Manufacturing. Derives all screens, forms, rules, and behaviors exclusively from MOD-009 Module Publication. Introduces no new capabilities."
spec_id: "WEB-009_SOLUTION_DESIGN"
module_id: "MOD-009"
module_name: "Manufacturing"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "Operations"
source_publication: "docs/45-module-publications/manufacturing/MOD-009_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/manufacturing/MODULE_PRD.md", "docs/40-module-baselines/MOD009_MANUFACTURING_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-009", "manufacturing", "WEB-009"]
document_type: "Web Solution Design"
---

# WEB-009 — Manufacturing Web Solution Design

> **Source of Truth:** [`MOD-009 Module Publication`](../../../45-module-publications/manufacturing/MOD-009_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-009 Manufacturing for Production Planners, Shopfloor Supervisors, Quality Inspectors, Inventory Controllers, and Accountants on desktop and tablet browsers: maintain the BOM / Routing / Work Center / Machine / Operation masters, execute the Plan-to-work-order and Work-order-to-completion processes, capture Sub-contract Challan and Quality Inspection transactions, and observe the Manufacturing operational read model through reports, dashboards, exports, and the audit-readiness surface — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §7, §8, §9):**

- Web UI for every master data entity in Publication §7 (BOM, Routing, Work Center, Machine, Operation).
- Web UI for every transaction in Publication §8 (Work Order, Production Entry, Sub-contract Challan, Quality Inspection).
- Manufacturing operations configuration surfaces authorized by Publication §3 (default routing, scrap tolerance, approval thresholds, numbering series).
- Production planning workspace including material-availability confirmation and scheduling onto work centers (Publication §3, §4.2).
- Manufacturing operational reports enumerated in Publication §3 (Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate), dashboards, exports, and audit-readiness surface (Publication §4.6).
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** finite scheduling, AI-based yield prediction, real-time OEE, cross-module KPI authoring, and deferred Event Catalog items.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities, transactions, and read models in Publication §3, §7, §8, §9:

- **Manufacturing Home** — landing dashboard (Publication §3 Manufacturing Analytics & Compliance, §4.6).
- **BOMs** — Bill of Material master (Publication §7).
- **Routings** — Routing master (Publication §7).
- **Work Centers** — Work Center and Machine masters (Publication §7).
- **Operations** — Operation master (Publication §7).
- **Production Planning** — Production plan intake, material-availability confirmation, scheduling (Publication §3, §4.2).
- **Work Orders** — Work Order workspace (list, detail, execution, Production Entry capture) (Publication §8, §4.3).
- **Sub-contracting** — Sub-contract Challan workspace (Publication §8, §4.4).
- **Quality** — Quality Inspection workspace and yield/scrap capture (Publication §8, §4.5).
- **Reports & Dashboards** — reports enumerated in Publication §3, §4.6.
- **Manufacturing Configuration** — default routing, scrap tolerance, approval thresholds, numbering series (Publication §3, PRD §10).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Work Order detail (Overview, Materials, Operations, Production Entries, Sub-contract Legs, Quality Inspections, Approvals, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 BOM | BOM list, detail, create, edit, archive; component composition |
| §7 Routing | Routing list, detail, create, edit, archive; operation sequence |
| §7 Work Center | Work Center list, detail, create, edit, archive |
| §7 Machine | Machine list, detail, create, edit, archive (linked to Work Center) |
| §7 Operation | Operation master list, detail, create, edit, archive |
| §4.2 Production Planning | Plan intake, material-availability confirmation, scheduling onto work centers |
| §8 Work Order / §4.3 | Work Order workspace: release, execution, Production Entry capture |
| §8 Sub-contract Challan / §4.4 | Sub-contract dispatch and return reconciliation; return-window alerts |
| §8 Quality Inspection / §4.5 | Quality inspection capture; yield/scrap against work orders |
| §3 / §4.6 Reports | Work Order Status, OEE, Yield & Scrap, Sub-contract Ageing, Quality Reject Rate |
| §3 Manufacturing Configuration | Default routing, scrap tolerance, approval thresholds, numbering series |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- Production Planner
- Shopfloor Supervisor
- Quality Inspector
- Inventory Controller (secondary read)
- Accountant (secondary read)
- Sub-contractor (external actor)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | Manufacturing Home / Landing Dashboard | §3, §4.6 | Read-only dashboard |
| 2 | BOMs List | §7 BOM | Search, filter, export |
| 3 | BOM Detail | §7 BOM | Component composition |
| 4 | BOM Create / Edit | §7, §6 | |
| 5 | Routings List | §7 Routing | |
| 6 | Routing Detail | §7 Routing | Operation sequence |
| 7 | Routing Create / Edit | §7 | |
| 8 | Work Centers List | §7 Work Center | |
| 9 | Work Center Detail / Edit | §7 Work Center | Capacity, calendar |
| 10 | Machines List | §7 Machine | |
| 11 | Machine Detail / Edit | §7 Machine | Linked to Work Center |
| 12 | Operations List | §7 Operation | |
| 13 | Operation Detail / Edit | §7 Operation | |
| 14 | Production Plans List | §4.2 | |
| 15 | Production Plan Detail | §4.2 | Consumes `SalesOrderConfirmed`, `InventoryLowStock` (§10) |
| 16 | Material-Availability Confirmation | §6, §4.2 | Rule enforced via ENG-012 (§11) |
| 17 | Scheduling Board | §4.2, §11 ENG-014 | Assign to work centers |
| 18 | Work Orders List | §8 Work Order, §4.3 | |
| 19 | Work Order — Overview | §8, §4.3 | |
| 20 | Work Order — Materials | §8, §4.3 | Read from MOD-005 (§12) |
| 21 | Work Order — Operations | §8, §4.3 | |
| 22 | Work Order — Release Action | §8, §6 | Blocks if material unavailable (§6) |
| 23 | Work Order — Production Entries | §8 Production Entry, §4.3 | Shopfloor capture |
| 24 | Work Order — Approvals | §8, §11 ENG-011 | |
| 25 | Work Order — History | §11 ENG-004 | Audit trail |
| 26 | Sub-contract Challans List | §8 Sub-contract Challan, §4.4 | |
| 27 | Sub-contract Challan Detail | §8, §4.4 | Dispatch/return reconciliation |
| 28 | Sub-contract Challan Create | §8, §4.4 | Return-window per §6 |
| 29 | Sub-contract Ageing Workspace | §4.4, §4.6 | Ageing alerts (§6) |
| 30 | Quality Inspections List | §8 Quality Inspection, §4.5 | |
| 31 | Quality Inspection Detail | §8, §4.5 | Disposition, yield/scrap |
| 32 | Quality Inspection Create | §8, §4.5 | Against Work Order |
| 33 | Yield & Scrap Capture | §4.5 | Bound to Work Order |
| 34 | Reports — Work Order Status | §3, §4.6 | |
| 35 | Reports — OEE | §3, §4.6 | |
| 36 | Reports — Yield & Scrap | §3, §4.6 | |
| 37 | Reports — Sub-contract Ageing | §3, §4.6 | |
| 38 | Reports — Quality Reject Rate | §3, §4.6 | |
| 39 | Audit-Readiness Surface | §4.6 | Read-only over prior-sprint events |
| 40 | Configuration — Default Routing | §3 | |
| 41 | Configuration — Scrap Tolerance | §3 | |
| 42 | Configuration — Approval Thresholds | §3 | |
| 43 | Configuration — Numbering Series | §3, §11 ENG-017 | |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §11–§12) with server-side authoritative validation via ENG-012 (Publication §11).
- Multi-step approval flows (Work Order release, Sub-contract Challan, Quality Inspection) are driven by ENG-010 / ENG-011 (Publication §11).
- Work Order release is server-gated on material-availability confirmation (Publication §6).
- Sub-contract return-window alerts and Quality-rejected disposition are surfaced read-only and enforced server-side (Publication §6).

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (from Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, approval-timeline, quantity input, unit-of-measure selector, scheduling gantt, ageing badge, quality-disposition badge. All components meet the Accessibility Standard (§23).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012 (Publication §11).
- Attachment fields via ENG-007 / ENG-008 (Publication §11) on BOM (drawings), Work Order (shopfloor documents), and Sub-contract Challan (documents).
- Numbering series bindings via ENG-017 (Publication §11) on Work Order, Production Entry, Sub-contract Challan, Quality Inspection.

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (BOM component → Item read from MOD-005; Routing operation → Operation master; Machine → Work Center).
- Uniqueness where the Publication implies enterprise-single (BOM code, Routing code, Work Center code, Machine code, Operation code per PRD §5).
- Work Order release blocked until material availability is confirmed (Publication §6).
- Quality-rejected output cannot be issued to finished-goods stock (Publication §6).
- Sub-contract Challan return required within configured window; ageing flag raised otherwise (Publication §6).
- Consumed events (`SalesOrderConfirmed`, `InventoryLowStock`, `MaintenanceCompleted`) treated as read-only inputs (Publication §10, §13).

## 13. Business Rules

Rules restated from Publication §6:

- A work order cannot start without material availability confirmation.
- Quality-rejected output cannot be issued to finished-goods stock.
- Sub-contract material must return within the configured window or is flagged.
- Manufacturing master and transaction lifecycles are Manufacturing-owned; UI never permits mutation of externally-owned masters (Item, Employee, org structure).
- Manufacturing consumes upstream events read-only.
- Manufacturing never renders or performs ledger posting; posting is owned by MOD-002 Accounting (Publication §11, §13).
- Stock movements resulting from Manufacturing events are owned by MOD-005; the UI never mutates the stock ledger (Publication §13).

## 14. Search

Global search bar and per-list search operate over Publication-declared entity attributes (BOM code, Routing code, Work Center code, Machine code, Operation code, Work Order number, Production Entry number, Sub-contract Challan number, Quality Inspection number).

## 15. Filters

Filter panel derives its facets from entity/transaction fields declared in the Publication (item, work center, machine, operation, status, period, sub-contractor, quality disposition, ageing bucket). Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002 (Publication §11).

## 17. Dashboards

Dashboards render read-model KPIs via ENG-022 (Publication §11) from the Manufacturing Analytics & Compliance surface (§4.6). No dashboard writes state. Cross-module KPI definitions remain owned by MOD-017 Analytics (Publication §13).

## 18. Reports

Reports enumerated in Publication §3 are rendered via ENG-021 with export via ENG-027 (Publication §11). No report is introduced beyond the Publication set.

## 19. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events). The UI surfaces notifications; it does not define new event semantics.

## 20. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-009).

## 21. Loading States

Skeleton loaders for lists, boards, and detail pages. Scheduling operations are long-running; progress is surfaced with polling.

## 22. Empty States

Every list/board/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 23. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes (scheduling, work-order release, production-entry capture).

## 24. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). Mobile portrait is served by MOB-009.

## 25. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and cost-sensitive fields (yield/scrap valuation) redacted for unauthorized roles.

## 26. Performance

Interactive operations complete within the platform latency budget (PRD §11). Scheduling and read-model refresh run within the platform batch envelope (PRD §11).

## 27. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history.

## 28. Acceptance Criteria & Traceability Matrix

WEB-009 is Accepted when every screen in §8 resolves to a Publication anchor, every validation in §12 traces to a Publication rule or entity attribute, every rule in §13 is enforced server-side and surfaced on the relevant screen, and accessibility/security/audit checks in §23, §25, §27 pass the platform baseline. No screen introduces functionality absent from the Publication.

| Publication § | Anchor | WEB-009 Section |
| --- | --- | --- |
| §2 Purpose | Manufacturing purpose | §1 |
| §3 Scope | Full scope | §2, §4, §6 |
| §4 Authorities | Ownership | §7, §13 |
| §5 Requirements | Sprint refs | §8, §11–§13 |
| §6 Business Rules | Rules | §12, §13 |
| §7 Master Data | Entities | §8, §11 |
| §8 Transactions | Transactions | §8, §11 |
| §9 Published Events | Events | §19 |
| §10 Consumed Events | Events (read-only inputs) | §12, §13, §17 |
| §11 Engines | Engine consumption | §14–§19, §25, §27 |
| §12 Dependencies | Upstream/downstream | §7 (roles), §25 |
| §13 Boundaries | Ownership | §13 |
| §15 Non-Goals | Exclusions | §2 (out of scope) |
