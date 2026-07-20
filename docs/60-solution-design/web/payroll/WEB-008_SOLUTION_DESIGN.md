---
title: "WEB-008 — Payroll Web Solution Design"
summary: "Web Solution Design for MOD-008 Payroll. Derives all screens, forms, rules, and behaviors exclusively from MOD-008 Module Publication. Introduces no new capabilities."
spec_id: "WEB-008_SOLUTION_DESIGN"
module_id: "MOD-008"
module_name: "Payroll"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "People"
source_publication: "docs/45-module-publications/payroll/MOD-008_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/payroll/MODULE_PRD.md", "docs/40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-008", "payroll", "WEB-008"]
document_type: "Web Solution Design"
---

# WEB-008 — Payroll Web Solution Design

> **Source of Truth:** [`MOD-008 Module Publication`](../../../45-module-publications/payroll/MOD-008_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-008 Payroll for Payroll Officers, HR, Finance, and Auditors on desktop and tablet browsers: maintain the Salary Structure / Component / Bank Mandate / Statutory Setup masters, run Payroll Runs end-to-end (inputs → gross → statutory → approval → payslip → disbursement → posting), process Reimbursements and Advances, and observe the Payroll operational read model through reports, dashboards, and the audit-readiness surface — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §7, §8, §9):**

- Web UI for every master data entity in Publication §7 (Salary Structure, Component, Bank Mandate, Statutory Setup).
- Web UI for every transaction in Publication §8 (Payroll Run, Reimbursement, Advance, Payslip).
- Payroll operations configuration surfaces authorized by Publication §3 (pay cycles, rounding policy, numbering series, statutory settings per locale).
- Payroll operational reports enumerated in Publication §3 (Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home), dashboards, exports, and audit-readiness surface (Publication §4.6).
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** multi-country payroll harmonization, AI anomaly detection on inputs, cross-module KPI authoring, and locales not yet activated.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities, transactions, and read models in Publication §3, §7, §8, §9:

- **Payroll Home** — landing dashboard (Publication §3 Payroll Analytics & Compliance, §4.6).
- **Salary Structures** — Salary Structure and Component masters (Publication §7).
- **Bank Mandates** — Bank Mandate master (Publication §7).
- **Statutory Setup** — Statutory Setup master (Publication §7, §4.3).
- **Payroll Runs** — Payroll Run workspace (list, detail, inputs, gross, statutory, approvals, reversal) (Publication §8, §4.2).
- **Reimbursements** — Reimbursement workspace (Publication §8, §4.4).
- **Advances** — Advance workspace (Publication §8, §4.4).
- **Payslips** — Payslip list and detail (Publication §8, §4.5).
- **Disbursement** — Disbursement file generation and delivery status (Publication §4.5, §11 ENG-023).
- **Reports & Dashboards** — reports enumerated in Publication §3, §4.6.
- **Payroll Configuration** — pay cycles, rounding policy, numbering series (Publication §3, PRD §10).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Payroll Run detail (Overview, Inputs, Gross, Statutory, Reimbursements & Advances, Approvals, Payslips, Disbursement, Posting, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 Salary Structure | Salary Structure list, detail, create, edit, archive |
| §7 Component | Component list, detail, create, edit, archive |
| §7 Bank Mandate | Bank Mandate list, detail, create, edit, archive |
| §7 Statutory Setup | Statutory Setup master list, detail, create, edit (per locale) |
| §8 Payroll Run | Payroll Run workspace: inputs, gross, statutory, approvals, reversal |
| §8 Reimbursement | Reimbursement lifecycle, approvals, receipt attachments |
| §8 Advance | Advance lifecycle, approvals, adjustment against future runs |
| §8 Payslip | Payslip list, detail, issuance for every completed run |
| §4.5 Disbursement | Disbursement file generation (immutable), delivery status |
| §3 / §4.6 Reports | Payroll Register, Statutory Reports, Reimbursement Summary, CTC vs Take-home |
| §3 Payroll Configuration | Pay cycles, rounding policy, numbering series |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- Payroll Officer
- HR
- Finance
- Employee (secondary — payslip self-view via HRMS Self-Service surface per Publication §12)
- Auditor (secondary read)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | Payroll Home / Landing Dashboard | §3, §4.6 | Read-only dashboard |
| 2 | Salary Structures List | §7 Salary Structure | Search, filter, export |
| 3 | Salary Structure Detail | §7 Salary Structure | Component composition |
| 4 | Salary Structure Create / Edit | §7, §6 | |
| 5 | Components List | §7 Component | |
| 6 | Component Detail / Edit | §7 Component | Earnings/deductions/statutory type |
| 7 | Bank Mandates List | §7 Bank Mandate | |
| 8 | Bank Mandate Detail / Edit | §7 Bank Mandate | Employee-linked (read from MOD-007) |
| 9 | Statutory Setup List (per locale) | §7 Statutory Setup, §4.3 | |
| 10 | Statutory Setup Detail / Edit | §7 Statutory Setup, §4.3 | Locale pack read from ENG-006 |
| 11 | Payroll Runs List | §8 Payroll Run, §4.2 | |
| 12 | Payroll Run — Overview | §8, §4.2 | Cycle, period, status |
| 13 | Payroll Run — Inputs | §8, §4.2 | HRMS signals consumed read-only (§10) |
| 14 | Payroll Run — Gross Computation | §8, §4.2 | |
| 15 | Payroll Run — Statutory Computation | §8, §4.3, §6 | Finalization gated on completion (§6) |
| 16 | Payroll Run — Reimbursements & Advances | §8, §4.4 | Adjustments against run |
| 17 | Payroll Run — Approvals | §8, §11 ENG-011 | |
| 18 | Payroll Run — Reversal | §8, §6 | Creates a new reversing run (§6) |
| 19 | Payroll Run — History | §11 ENG-004 | Audit trail |
| 20 | Reimbursements List | §8 Reimbursement, §4.4 | |
| 21 | Reimbursement Detail | §8, §4.4 | Approvals, receipt attachments (§11 ENG-007) |
| 22 | Reimbursement Create | §8, §4.4 | |
| 23 | Advances List | §8 Advance, §4.4 | |
| 24 | Advance Detail | §8, §4.4 | Approvals, adjustment schedule |
| 25 | Advance Create | §8, §4.4 | |
| 26 | Payslips List | §8 Payslip, §4.5 | |
| 27 | Payslip Detail | §8, §4.5 | Issued per completed run |
| 28 | Disbursement Workspace | §4.5, §11 ENG-023 | File generation (immutable), delivery status |
| 29 | Disbursement File Detail | §6, §4.5 | Immutable once generated (§6) |
| 30 | Posting Status | §4.5, §11 ENG-015 / ENG-016 | Invocation of Voucher / Posting engines |
| 31 | Reports — Payroll Register | §3, §4.6 | |
| 32 | Reports — Statutory Reports (per locale) | §3, §4.3, §4.6 | |
| 33 | Reports — Reimbursement Summary | §3, §4.6 | |
| 34 | Reports — CTC vs Take-home | §3, §4.6 | |
| 35 | Audit-Readiness Surface | §4.6 | Read-only over prior-sprint events |
| 36 | Configuration — Pay Cycles | §3 | |
| 37 | Configuration — Rounding Policy | §3 | |
| 38 | Configuration — Numbering Series | §3, §11 ENG-017 | |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §11–§12) with server-side authoritative validation via ENG-012 (Publication §11).
- Multi-step approval flows (Payroll Run, Reimbursement, Advance) are driven by ENG-010 / ENG-011 (Publication §11).
- Payroll Run finalization is server-gated on statutory completion (Publication §6).
- Disbursement files are surfaced read-only after generation (Publication §6 immutability).

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (from Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, approval-timeline, currency input, period-picker, payslip renderer, disbursement-status badge. All components meet the Accessibility Standard (§23).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012 (Publication §11).
- Currency formatting via ENG-018 (Publication §11).
- Attachment fields via ENG-007 (Publication §11) on Reimbursement (receipts) and Payslip (letter/document) surfaces.
- Numbering series bindings via ENG-017 (Publication §11) on Payroll Run, Payslip, Reimbursement, Advance.

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (Component → Salary Structure; Bank Mandate → Employee identifier read from MOD-007).
- Uniqueness where the Publication implies enterprise-single (component code within tenant; numbering series per PRD §10).
- Payroll Run finalization blocked until all statutory computations complete (Publication §6).
- Reversal of a finalized run creates a new reversing run rather than mutating the original (Publication §6).
- Disbursement files rejected for mutation once generated (Publication §6 immutability).
- HRMS signals (`AttendanceMarked`, `LeaveApproved`, `EmployeeHired`, `EmployeeExited`) treated as read-only inputs (Publication §10, §13).

## 13. Business Rules

Rules restated from Publication §6:

- A payroll run cannot be finalized until all statutory computations complete.
- Reversal of a finalized payroll run creates a new, reversing run.
- Disbursement files are immutable once generated.
- Payroll master and transaction lifecycles are Payroll-owned; UI never permits mutation of externally-owned masters (Employee master, org structure).
- Payroll consumes HRMS signals read-only.
- Payroll never renders or performs ledger posting; posting is invoked via `ENG-015` / `ENG-016` and remains owned by MOD-002 Accounting (Publication §11, §13).

## 14. Search

Global search bar and per-list search operate over Publication-declared entity attributes (Salary Structure code, Component code, Payroll Run number, Payslip number, Reimbursement number, Advance number).

## 15. Filters

Filter panel derives its facets from entity/transaction fields declared in the Publication (pay cycle, period, status, locale, employee reference, date ranges). Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002 (Publication §11).

## 17. Dashboards

Dashboards render read-model KPIs via ENG-022 (Publication §11) from the Payroll Analytics & Compliance surface (§4.6). No dashboard writes state. Cross-module KPI definitions remain owned by MOD-017 Analytics (Publication §13).

## 18. Reports

Reports enumerated in Publication §3 are rendered via ENG-021 with export via ENG-027 (Publication §11). No report is introduced beyond the Publication set.

## 19. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events). The UI surfaces notifications; it does not define new event semantics.

## 20. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-008).

## 21. Loading States

Skeleton loaders for lists, boards, and detail pages. Payroll Run gross and statutory computations are long-running; progress is surfaced with polling and cancellation is not offered (runs are transactional per Publication §8).

## 22. Empty States

Every list/board/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 23. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes (payroll run computation, disbursement delivery).

## 24. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). Mobile portrait is served by MOB-008.

## 25. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and payroll-sensitive fields (compensation, bank mandate details) redacted for unauthorized roles.

## 26. Performance

Interactive operations complete within the platform latency budget (PRD §11). Payroll Run gross and statutory computations run within the platform batch envelope (PRD §11).

## 27. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history.

## 28. Acceptance Criteria & Traceability Matrix

WEB-008 is Accepted when every screen in §8 resolves to a Publication anchor, every validation in §12 traces to a Publication rule or entity attribute, every rule in §13 is enforced server-side and surfaced on the relevant screen, and accessibility/security/audit checks in §23, §25, §27 pass the platform baseline. No screen introduces functionality absent from the Publication.

| Publication § | Anchor | WEB-008 Section |
| --- | --- | --- |
| §2 Purpose | Payroll purpose | §1 |
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
