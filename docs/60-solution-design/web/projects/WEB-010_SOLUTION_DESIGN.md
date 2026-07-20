---
title: "WEB-010 — Projects Web Solution Design"
summary: "Web Solution Design for MOD-010 Projects. Derives all screens, forms, rules, and behaviors exclusively from MOD-010 Module Publication. Introduces no new capabilities."
spec_id: "WEB-010_SOLUTION_DESIGN"
module_id: "MOD-010"
module_name: "Projects"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "Delivery"
source_publication: "docs/45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/projects/MODULE_PRD.md", "docs/40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-010", "projects", "WEB-010"]
document_type: "Web Solution Design"
---

# WEB-010 — Projects Web Solution Design

> **Source of Truth:** [`MOD-010 Module Publication`](../../../45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-010 Projects for Project Managers, Consultants, Team Leads, Finance, and HR on desktop and tablet browsers: maintain the Project / Task / Milestone / Resource / Rate Card masters and project configuration, execute the Setup-to-execution, Timesheet-to-approval, Milestone-to-invoice, and Change Request processes, capture Timesheet / Milestone Completion / Change Request / Project Invoice transactions, manage project budgets and project-cost roll-up, and observe the Projects operational read model through reports, dashboards, exports, and the audit-readiness surface — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §7, §8, §9):**

- Web UI for every master data entity in Publication §7 (Project, Resource, Rate Card, Task, Milestone).
- Web UI for every transaction in Publication §8 (Timesheet, Milestone Completion, Change Request, Project Invoice).
- Project configuration surfaces authorized by Publication §3 (rate cards, approval hierarchy, billing type per project, numbering series).
- Project budgets and project-cost roll-up across T&M and fixed-price billing paths (Publication §3, §4.4).
- Projects operational reports enumerated in Publication §3 (Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis), dashboards, exports, and audit-readiness surface (Publication §4.5).
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** portfolio management, AI resource matching, predictive overrun alerts, cross-module KPI authoring, and deferred Event Catalog items.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities, transactions, and read models in Publication §3, §7, §8, §9:

- **Projects Home** — landing dashboard (Publication §3 Projects Analytics & Compliance, §4.5).
- **Projects** — Project master workspace (Publication §7).
- **Tasks** — Task master workspace (Publication §7).
- **Milestones** — Milestone master and Milestone Completion (Publication §7, §8, §4.2).
- **Change Requests** — Change Request workspace (Publication §8, §4.2).
- **Timesheets** — Timesheet capture and approval (Publication §8, §4.3).
- **Budgets & Costs** — Project Budget definition and project-cost roll-up (Publication §3, §4.4).
- **Billing** — Project Invoice workspace (T&M and fixed-price) (Publication §8, §4.4).
- **Resources** — Resource and Rate Card masters (Publication §7).
- **Reports & Dashboards** — reports enumerated in Publication §3, §4.5.
- **Projects Configuration** — rate cards, approval hierarchy, billing type per project, numbering series (Publication §3, PRD §10).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Project detail (Overview, Tasks, Milestones, Timesheets, Budget & Costs, Invoices, Change Requests, Resources, Approvals, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 Project | Project list, detail, create, edit, archive; configuration binding |
| §7 Task | Task list, detail, create, edit, archive; parent-project binding |
| §7 Milestone | Milestone list, detail, create, edit, archive |
| §7 Resource | Resource list, detail, create, edit, archive; Employee-linked read |
| §7 Rate Card | Rate Card list, detail, create, edit, archive |
| §8 Milestone Completion / §4.2 | Milestone completion capture and approval |
| §8 Change Request / §4.2 | Change Request lifecycle |
| §8 Timesheet / §4.3 | Timesheet capture, effort entry, multi-step approval |
| §3 / §4.4 Budgets & Costs | Project Budget definition; project-cost roll-up |
| §8 Project Invoice / §4.4 | Project Invoice lifecycle (T&M and fixed-price); milestone-invoiceable gate |
| §3 / §4.5 Reports | Project P&L, Utilization, Burn Down, Milestone Status, Overrun Analysis |
| §3 Projects Configuration | Rate cards, approval hierarchy, billing type per project, numbering series |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- Project Manager (primary)
- Consultant (primary)
- Team Lead (primary)
- Finance (secondary read/approve)
- HR (secondary read)
- Client (external actor; scoped read where authorized)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | Projects Home / Landing Dashboard | §3, §4.5 | Read-only dashboard |
| 2 | Projects List | §7 Project | Search, filter, export |
| 3 | Project Detail — Overview | §7 Project | Configuration summary |
| 4 | Project Create / Edit | §7, §6 | Emits `ProjectCreated` (§9) |
| 5 | Project Detail — Tasks | §7 Task, §8 | |
| 6 | Project Detail — Milestones | §7 Milestone, §8 | |
| 7 | Project Detail — Timesheets | §8 Timesheet, §4.3 | Read + drill |
| 8 | Project Detail — Budget & Costs | §3, §4.4 | Roll-up view |
| 9 | Project Detail — Invoices | §8 Project Invoice, §4.4 | Read + drill |
| 10 | Project Detail — Change Requests | §8 Change Request, §4.2 | |
| 11 | Project Detail — Resources | §7 Resource, §7 Rate Card | |
| 12 | Project Detail — Approvals | §11 ENG-011 | |
| 13 | Project Detail — History | §11 ENG-004 | Audit trail |
| 14 | Tasks List | §7 Task | |
| 15 | Task Detail / Edit | §7 Task | |
| 16 | Task Create | §7, §6 | |
| 17 | Milestones List | §7 Milestone | |
| 18 | Milestone Detail / Edit | §7 Milestone | |
| 19 | Milestone Completion Capture | §8 Milestone Completion, §4.2 | Emits `MilestoneCompleted` (§9) |
| 20 | Change Requests List | §8 Change Request, §4.2 | |
| 21 | Change Request Detail | §8, §4.2 | Approvals via ENG-011 (§11) |
| 22 | Change Request Create | §8, §4.2 | |
| 23 | Timesheets List | §8 Timesheet, §4.3 | |
| 24 | Timesheet Detail | §8, §4.3 | |
| 25 | Timesheet Create / Edit | §8, §4.3 | Capacity-justification per §6 |
| 26 | Timesheet Approval Inbox | §8, §4.3, §11 ENG-011 | |
| 27 | Timesheet Approval Action | §8, §4.3 | Emits `TimesheetApproved` (§9) |
| 28 | Budgets List | §3, §4.4 | |
| 29 | Budget Detail / Edit | §3, §4.4 | |
| 30 | Cost Roll-up Workspace | §3, §4.4 | Consumes `PayrollProcessed` (§10) |
| 31 | Project Invoices List | §8 Project Invoice, §4.4 | |
| 32 | Project Invoice Detail | §8, §4.4 | |
| 33 | Project Invoice Create (T&M) | §8, §4.4 | Rule: milestone-invoiceable (§6) |
| 34 | Project Invoice Create (Fixed-price) | §8, §4.4 | Rule: fixed-price decoupled (§6) |
| 35 | Project Invoice Issue Action | §8, §4.4, §11 ENG-015 | Emits `ProjectInvoiceIssued` (§9) |
| 36 | Resources List | §7 Resource | |
| 37 | Resource Detail / Edit | §7 Resource | Employee read from MOD-007 (§12) |
| 38 | Rate Cards List | §7 Rate Card | |
| 39 | Rate Card Detail / Edit | §7 Rate Card | |
| 40 | Reports — Project P&L | §3, §4.5 | |
| 41 | Reports — Utilization | §3, §4.5 | |
| 42 | Reports — Burn Down | §3, §4.5 | |
| 43 | Reports — Milestone Status | §3, §4.5 | |
| 44 | Reports — Overrun Analysis | §3, §4.5 | |
| 45 | Audit-Readiness Surface | §4.5 | Read-only over prior-sprint events |
| 46 | Configuration — Rate Cards | §3 | |
| 47 | Configuration — Approval Hierarchy | §3, §11 ENG-011 | |
| 48 | Configuration — Billing Type per Project | §3 | |
| 49 | Configuration — Numbering Series | §3, §11 ENG-017 | |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §11–§12) with server-side authoritative validation via ENG-012 (Publication §11).
- Multi-step approval flows (Timesheet, Milestone Completion, Change Request, Project Invoice) are driven by ENG-010 / ENG-011 (Publication §11).
- Timesheet submission is server-gated on capacity-justification (Publication §6).
- Milestone-invoiceable and fixed-price decoupling gates are enforced server-side and surfaced on the Project Invoice create screens (Publication §6).

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (from Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, approval-timeline, effort input, currency input, milestone-status badge, invoice-status badge. All components meet the Accessibility Standard (§23).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012 (Publication §11).
- Attachment fields via ENG-007 / ENG-008 (Publication §11) on Project (contracts), Timesheet (supporting docs), and Change Request (documents).
- Numbering series bindings via ENG-017 (Publication §11) on Project, Project Invoice.
- Currency handling via ENG-018 (Publication §11) on Rate Card, Project Budget, Project Invoice.

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (Task → Project; Milestone → Project; Timesheet → Project + Task + Resource; Resource → Employee read from MOD-007; Rate Card → currency).
- Uniqueness where the Publication implies enterprise-single (Project code, Task code within project, Milestone code within project, Resource code, Rate Card code per PRD §5).
- Timesheet capacity-justification required and approved when capacity is exceeded (Publication §6).
- Milestone invoiceable only after completion + approval (Publication §6).
- Fixed-price billing decoupled from timesheet totals (Publication §6).
- Consumed events (`EmployeeHired`, `PayrollProcessed`, `SalesOrderConfirmed`) treated as read-only inputs (Publication §10, §13).

## 13. Business Rules

Rules restated from Publication §6:

- Timesheets exceeding capacity require justification and approval.
- A milestone can be invoiced only after it is marked completed and approved.
- Fixed-price billing is decoupled from timesheet totals.
- Projects master and transaction lifecycles are Projects-owned; UI never permits mutation of externally-owned masters (Employee, org structure).
- Projects consumes upstream events read-only.
- Projects never renders or performs ledger posting; posting is owned by MOD-002 Accounting (Publication §11, §13).
- The Employee master is owned by MOD-007 HRMS; UI never mutates it (Publication §13).

## 14. Search

Global search bar and per-list search operate over Publication-declared entity attributes (Project code, Task code, Milestone code, Resource code, Rate Card code, Timesheet number, Project Invoice number, Change Request number).

## 15. Filters

Filter panel derives its facets from entity/transaction fields declared in the Publication (project, task, milestone, resource, status, period, billing type, approval state, currency). Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002 (Publication §11).

## 17. Dashboards

Dashboards render read-model KPIs via ENG-022 (Publication §11) from the Projects Analytics & Compliance surface (§4.5). No dashboard writes state. Cross-module KPI definitions remain owned by MOD-017 Analytics (Publication §13).

## 18. Reports

Reports enumerated in Publication §3 are rendered via ENG-021 with export via ENG-027 (Publication §11). No report is introduced beyond the Publication set.

## 19. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events). The UI surfaces notifications; it does not define new event semantics.

## 20. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-010).

## 21. Loading States

Skeleton loaders for lists, boards, and detail pages. Cost roll-up and read-model refresh are long-running; progress is surfaced with polling.

## 22. Empty States

Every list/board/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 23. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes (timesheet submission, milestone completion, invoice issuance).

## 24. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). Mobile portrait is served by MOB-010.

## 25. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and cost-sensitive fields (rate cards, budgets, invoice amounts) redacted for unauthorized roles.

## 26. Performance

Interactive operations complete within the platform latency budget (PRD §11). Cost roll-up and read-model refresh run within the platform batch envelope (PRD §11).

## 27. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history.

## 28. Acceptance Criteria & Traceability Matrix

WEB-010 is Accepted when every screen in §8 resolves to a Publication anchor, every validation in §12 traces to a Publication rule or entity attribute, every rule in §13 is enforced server-side and surfaced on the relevant screen, and accessibility/security/audit checks in §23, §25, §27 pass the platform baseline. No screen introduces functionality absent from the Publication.

| Publication § | Anchor | WEB-010 Section |
| --- | --- | --- |
| §2 Purpose | Projects purpose | §1 |
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
