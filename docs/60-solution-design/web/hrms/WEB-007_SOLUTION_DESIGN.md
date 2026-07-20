---
title: "WEB-007 — HRMS Web Solution Design"
summary: "Web Solution Design for MOD-007 HRMS. Derives all screens, forms, rules, and behaviors exclusively from MOD-007 Module Publication. Introduces no new capabilities."
spec_id: "WEB-007_SOLUTION_DESIGN"
module_id: "MOD-007"
module_name: "HRMS"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "People"
source_publication: "docs/45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/hrms/MODULE_PRD.md", "docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-007", "hrms", "WEB-007"]
document_type: "Web Solution Design"
---

# WEB-007 — HRMS Web Solution Design

> **Source of Truth:** [`MOD-007 Module Publication`](../../../45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-007 HRMS for HR Business Partners, HR Managers, Managers, and Employees on desktop and tablet browsers: maintain the Employee master and org structure, run Onboarding and Exit lifecycles, capture Attendance and process Leave, run Appraisals, surface L&D consumption and Employee Self-Service, and observe the workforce through HR operational reports and dashboards — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §7, §8, §9):**

- Web UI for every master data entity in Publication §7 (Employee, Position, Department, Grade, Shift, Leave Type).
- Web UI for every transaction in Publication §8 (Onboarding Task, Exit Clearance, Attendance, Leave Request, Appraisal).
- HR operations configuration surfaces defined in Publication §3 (approval hierarchies, shift patterns, notice periods, leave policies).
- HR operational reports and dashboards enumerated in Publication §3 (Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution) and audit-readiness surface (Publication §4.6).
- Employee Self-Service surfaces (profile view, leave initiation, attendance summary, HR document access) authorized by Publication §3, §4.5.
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** payroll processing/pay runs, ledger posting, statutory filing, skill graph, continuous performance, AI attrition risk, and learning content authoring.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities, transactions, and read models in Publication §3, §7, §8, §9:

- **HR Home** — landing dashboard (Publication §3 HR Analytics & Compliance, §4.6).
- **Employees** — list, detail, org tree (Publication §7 Employee).
- **Org Structure** — Positions, Departments, Grades, Shifts (Publication §7).
- **Onboarding** — Onboarding Task workspace (Publication §8, §4.2).
- **Offboarding** — Exit Clearance workspace (Publication §8, §4.2).
- **Attendance** — Attendance list, biometric ingestion status (Publication §8 Attendance, §4.3).
- **Leave** — Leave Request workspace, Leave Type master, balances (Publication §7 Leave Type, §8, §4.3).
- **Performance** — Appraisal workspace (Publication §8, §4.4).
- **Learning & Development** — L&D consumption record view (Publication §4.5, §10 TrainingCompleted).
- **Self-Service** — Employee-scoped surfaces (Publication §3, §4.5).
- **Reports & Dashboards** — reports enumerated in Publication §3 §4.6.
- **HR Configuration** — approval hierarchies, shift patterns, notice periods, leave policies (Publication §3, §10 of PRD).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Employee detail (Overview, Employment, Attendance, Leave, Appraisals, Attachments, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 Employee | Employee list, detail, create, edit, archive, org tree |
| §7 Position / Department / Grade / Shift | Master list, detail, create, edit, archive |
| §7 Leave Type | Leave Type master list, detail, create, edit |
| §8 Onboarding Task | Onboarding workspace with task lifecycle & letters |
| §8 Exit Clearance | Exit Clearance workspace with clearance lifecycle & letters |
| §8 Attendance | Attendance capture list, biometric ingestion review |
| §8 Leave Request | Leave Request lifecycle, balance view, approvals |
| §8 Appraisal | Appraisal lifecycle workspace, ratings capture |
| §4.5 L&D Consumption | Employee L&D history read view |
| §3 / §4.5 Self-Service | Employee profile view, leave initiation, attendance summary, HR documents |
| §3 / §4.6 Reports | Headcount, Attendance Summary, Leave Balance, Attrition, Performance Distribution |
| §3 HR Configuration | Approval hierarchies, shift patterns, notice periods, leave policies |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- HR Business Partner
- HR Manager
- Manager
- Employee
- Finance (secondary read)
- Payroll (secondary read)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | HR Home / Landing Dashboard | §3, §4.6 | Read-only dashboard |
| 2 | Employees List | §7 Employee | Search, filter, export |
| 3 | Employee Detail | §7 Employee | Tabs: Overview, Employment, Attendance, Leave, Appraisals, Attachments, History |
| 4 | Employee Create/Edit | §7, §6 | Data-classification-aware fields |
| 5 | Org Tree View | §7, §4.1 | Reporting structure |
| 6 | Positions List | §7 Position | |
| 7 | Position Detail / Edit | §7 Position | |
| 8 | Departments List | §7 Department | |
| 9 | Department Detail / Edit | §7 Department | |
| 10 | Grades List | §7 Grade | |
| 11 | Grade Detail / Edit | §7 Grade | |
| 12 | Shifts List | §7 Shift | |
| 13 | Shift Detail / Edit | §7 Shift | |
| 14 | Leave Types List | §7 Leave Type | |
| 15 | Leave Type Detail / Edit | §7 Leave Type, §6 | Negative-balance flag per §6 |
| 16 | Onboarding Workspace (list) | §8 Onboarding Task, §4.2 | |
| 17 | Onboarding Task Detail | §8, §4.2 | Approvals routing, letters, attachments |
| 18 | Exit Clearance Workspace (list) | §8 Exit Clearance, §4.2 | |
| 19 | Exit Clearance Detail | §8, §4.2 | Clearance routing, letters, attachments |
| 20 | Attendance List | §8 Attendance, §4.3 | |
| 21 | Attendance Detail / Edit | §8 Attendance | |
| 22 | Biometric Ingestion Review | §4.3, §11 ENG-023 | Read/reconciliation surface |
| 23 | Leave Requests List | §8 Leave Request | |
| 24 | Leave Request Detail | §8, §6 | Self-approval blocked (§6) |
| 25 | Leave Request Create | §8, §6 | |
| 26 | Leave Balance View | §4.3 | |
| 27 | Appraisal Workspace (list) | §8 Appraisal, §4.4 | |
| 28 | Appraisal Detail | §8, §4.4 | Appraiser routing, ratings, completion |
| 29 | L&D History (per Employee) | §4.5, §10 | Read-only |
| 30 | Self-Service — My Profile | §3, §4.5 | |
| 31 | Self-Service — My Leave | §4.5, §8 Leave Request | |
| 32 | Self-Service — My Attendance | §4.5, §8 Attendance | |
| 33 | Self-Service — My HR Documents | §4.5, §11 ENG-007 | |
| 34 | Reports — Headcount | §3, §4.6 | |
| 35 | Reports — Attendance Summary | §3, §4.6 | |
| 36 | Reports — Leave Balance | §3, §4.6 | |
| 37 | Reports — Attrition | §3, §4.6 | |
| 38 | Reports — Performance Distribution | §3, §4.6 | |
| 39 | Audit-Readiness Surface | §4.6 | Read-only over prior-sprint events |
| 40 | Configuration — Approval Hierarchies | §3 | |
| 41 | Configuration — Shift Patterns | §3 | |
| 42 | Configuration — Notice Periods | §3 | |
| 43 | Configuration — Leave Policies | §3, §4.3 | |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-020, ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §11–§12) with server-side authoritative validation via ENG-012 (Publication §11).
- Multi-step approval flows (Onboarding, Exit, Leave, Appraisal) are driven by ENG-010 / ENG-011 (Publication §11).

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (from Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, org-tree, calendar grid, approval-timeline. All components meet the Accessibility Standard (§22).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012.
- Data-classification-aware field visibility for sensitive employee data (Publication §6).
- Attachment fields via ENG-008 (Publication §11) on Employee, Onboarding Task, Exit Clearance forms.
- HR letter attachment via ENG-007 (Publication §11) on Onboarding and Exit surfaces.

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (Employee → Position/Department/Grade/Shift stable identifiers).
- Uniqueness where the Publication implies enterprise-single (employee code within tenant).
- Leave balance non-negative unless the Leave Type permits negative (Publication §6).
- Self-approval prevention on Leave Request (Publication §6).
- Data-classification enforcement for sensitive employee fields (Publication §6).

## 13. Business Rules

Rules restated from Publication §6:

- Leave balance cannot go negative unless the Leave Type permits it.
- An employee cannot approve their own leave.
- Sensitive employee data respects data-classification rules.
- Employee master lifecycle is HRMS-owned; UI never permits mutation of externally-owned masters.
- Employment status transitions follow the authorized lifecycle (§4.1, §4.2).
- HRMS UI never triggers ledger posting or payroll computation.

## 14. Search

Global search bar and per-list search delegate to ENG-020 (Publication §11). Scope: Employees, Positions, Departments, Leave Requests, Appraisals, Onboarding Tasks, Exit Clearances.

## 15. Filters

Filter panel derives its facets from entity fields declared in the Publication (department, grade, shift, employment status, date ranges). Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002.

## 17. Dashboards

Dashboards render read-model KPIs via ENG-022 (Publication §11) from the HR Analytics & Compliance surface (§4.6). No dashboard writes state. Cross-module KPI definitions remain owned by MOD-017 Analytics (Publication §13).

## 18. Reports

Reports enumerated in Publication §3 are rendered via ENG-021 with export via ENG-027 (Publication §11). No report is introduced beyond the Publication set.

## 19. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events). The UI surfaces notifications; it does not define new event semantics.

## 20. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-007).

## 21. Loading States

Skeleton loaders for lists, boards, and detail pages. Optimistic UI is used only for reversible operations and reconciles on server response.

## 22. Empty States

Every list/board/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 23. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes.

## 24. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). Mobile portrait is served by MOB-007.

## 25. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and PII / data-classification redaction on sensitive employee fields.

## 26. Performance

Interactive operations complete within the platform latency budget (PRD §11). Lists page at ≤50 rows by default; org-tree virtualizes nodes beyond configured depth.

## 27. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history.

## 28. Acceptance Criteria & Traceability Matrix

WEB-007 is Accepted when every screen in §8 resolves to a Publication anchor, every validation in §12 traces to a Publication rule or entity attribute, every rule in §13 is enforced server-side and surfaced on the relevant screen, and accessibility/security/audit checks in §23, §25, §27 pass the platform baseline. No screen introduces functionality absent from the Publication.

| Publication § | Anchor | WEB-007 Section |
| --- | --- | --- |
| §2 Purpose | HRMS purpose | §1 |
| §3 Scope | Full scope | §2, §4, §6 |
| §4 Authorities | Ownership | §7, §13 |
| §5 Requirements | Sprint refs | §8, §11–§13 |
| §6 Business Rules | Rules | §12, §13 |
| §7 Master Data | Entities | §8, §11 |
| §8 Transactions | Transactions | §8, §11 |
| §9 Published Events | Events | §19 |
| §10 Consumed Events | Events | §17, §19 |
| §11 Engines | Engine consumption | §14–§19, §25, §27 |
| §12 Dependencies | Upstream/downstream | §7 (roles), §25 |
| §13 Boundaries | Ownership | §13 |
| §15 Non-Goals | Exclusions | §2 (out of scope) |
