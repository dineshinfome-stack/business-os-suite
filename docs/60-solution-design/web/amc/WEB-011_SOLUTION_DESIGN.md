---
title: "WEB-011 — AMC Web Solution Design"
summary: "Web Solution Design for MOD-011 AMC. Derives all screens, forms, rules, and behaviors exclusively from MOD-011 Module Publication. Introduces no new capabilities."
spec_id: "WEB-011_SOLUTION_DESIGN"
module_id: "MOD-011"
module_name: "AMC"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "Service"
source_publication: "docs/45-module-publications/amc/MOD-011_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/amc/MODULE_PRD.md", "docs/40-module-baselines/MOD011_AMC_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-011", "amc", "WEB-011"]
document_type: "Web Solution Design"
---

# WEB-011 — AMC Web Solution Design

> **Source of Truth:** [`MOD-011 Module Publication`](../../../45-module-publications/amc/MOD-011_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-011 AMC for Service Managers, Contracts Officers, Field Coordinators, Sales, and Finance on desktop and tablet browsers: maintain Contract / Entitlement / Coverage / Renewal Terms masters and AMC configuration, execute the Contract-to-schedule, Visit-to-consumption, Renewal cycle, and Termination processes, capture Contract / Visit Schedule / Renewal / Contract Invoice transactions, and observe the AMC operational read model through reports, dashboards, exports, and the audit-readiness surface — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §7, §8, §9):**

- Web UI for every master data entity in Publication §7 (Contract, Entitlement, Coverage, Renewal Terms).
- Web UI for every transaction in Publication §8 (Contract, Visit Schedule, Renewal, Contract Invoice).
- AMC configuration surfaces authorized by Publication §3 (SLA definitions, escalation policies, notice periods, auto-renewal rules, numbering series).
- Preventive schedule generation and coverage-window enforcement (Publication §3, §4.2).
- Contract billing (upfront/periodic) via `ENG-015` (Publication §3, §4.3).
- AMC operational reports enumerated in Publication §3 (Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability), dashboards, exports, and audit-readiness surface (Publication §4.4).
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** usage-based contracts, cross-module KPI authoring, and deferred Event Catalog items.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities, transactions, and read models in Publication §3, §7, §8, §9:

- **AMC Home** — landing dashboard (Publication §3, §4.4).
- **Contracts** — Contract master and transaction workspace (Publication §7, §8).
- **Entitlements** — Entitlement master and consumption view (Publication §7, §4.2).
- **Coverage** — Coverage master workspace (Publication §7).
- **Visit Schedules** — Visit Schedule transaction workspace (Publication §8, §4.2).
- **Billing** — Contract Invoice workspace (Publication §8, §4.3).
- **Renewals** — Renewal Terms master and Renewal transaction workspace (Publication §7, §8, §4.3).
- **Reports & Dashboards** — reports enumerated in Publication §3, §4.4.
- **AMC Configuration** — SLA definitions, escalation policies, notice periods, auto-renewal rules, numbering series (Publication §3, PRD §10).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Contract detail (Overview, Entitlements, Coverage, Visit Schedules, Invoices, Renewals, Approvals, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 Contract | Contract list, detail, create, edit, terminate; configuration binding |
| §7 Entitlement | Entitlement list, detail, create, edit; consumption view |
| §7 Coverage | Coverage list, detail, create, edit |
| §7 Renewal Terms | Renewal Terms list, detail, create, edit |
| §8 Contract / §4.1 | Contract transaction lifecycle; emits `ContractSigned` (§9) |
| §8 Visit Schedule / §4.2 | Visit scheduling; coverage-window rule (§6); emits `VisitScheduled` (§9) |
| §8 Renewal / §4.3 | Renewal lifecycle with multi-step approval; notice-period rule (§6) |
| §8 Contract Invoice / §4.3 | Upfront / periodic billing via `ENG-015` |
| §3 / §4.4 Reports | Active Contracts, Renewal Pipeline, Visit Compliance, Contract Profitability |
| §3 AMC Configuration | SLA, escalation, notice periods, auto-renewal, numbering |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- Service Manager (primary)
- Contracts Officer (primary)
- Field Coordinator (primary)
- Sales (secondary)
- Finance (secondary)
- Customer (external actor; scoped read where authorized)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | AMC Home / Landing Dashboard | §3, §4.4 | Read-only dashboard |
| 2 | Contracts List | §7 Contract | Search, filter, export |
| 3 | Contract Detail — Overview | §7 Contract | Configuration summary |
| 4 | Contract Create / Edit | §7, §8, §6 | Emits `ContractSigned` (§9) on sign |
| 5 | Contract Detail — Entitlements | §7 Entitlement, §4.2 | |
| 6 | Contract Detail — Coverage | §7 Coverage | |
| 7 | Contract Detail — Visit Schedules | §8 Visit Schedule, §4.2 | |
| 8 | Contract Detail — Invoices | §8 Contract Invoice, §4.3 | |
| 9 | Contract Detail — Renewals | §8 Renewal, §4.3 | |
| 10 | Contract Detail — Approvals | §11 ENG-011 | |
| 11 | Contract Detail — History | §11 ENG-004 | Audit trail |
| 12 | Contract Terminate Action | §6, §4.3 | Post-termination entitlement-block rule (§6) |
| 13 | Entitlements List | §7 Entitlement | |
| 14 | Entitlement Detail / Edit | §7 Entitlement | Consumption view |
| 15 | Entitlement Create | §7 | |
| 16 | Coverage List | §7 Coverage | |
| 17 | Coverage Detail / Edit | §7 Coverage | |
| 18 | Coverage Create | §7 | |
| 19 | Visit Schedules List | §8, §4.2 | |
| 20 | Visit Schedule Detail | §8, §4.2 | |
| 21 | Visit Schedule Create (Manual) | §8, §4.2 | Coverage-window rule (§6) |
| 22 | Preventive Schedule Generation Workspace | §3, §4.2 | Uses `ENG-013`, `ENG-014` |
| 23 | Visit Schedule Reschedule / Cancel | §8, §4.2 | |
| 24 | Renewal Terms List | §7 Renewal Terms | |
| 25 | Renewal Terms Detail / Edit | §7 Renewal Terms | |
| 26 | Renewals List | §8 Renewal, §4.3 | |
| 27 | Renewal Detail | §8, §4.3 | Notice-period rule (§6) |
| 28 | Renewal Create / Propose | §8, §4.3 | |
| 29 | Renewal Approval Inbox | §8, §4.3, §11 ENG-011 | |
| 30 | Renewal Approval Action | §8, §4.3 | Emits `ContractRenewed` (§9) |
| 31 | Contract Invoices List | §8, §4.3 | |
| 32 | Contract Invoice Detail | §8, §4.3 | |
| 33 | Contract Invoice Create (Upfront) | §8, §4.3 | Via `ENG-015` |
| 34 | Contract Invoice Create (Periodic) | §8, §4.3 | Via `ENG-014` schedule |
| 35 | Contract Invoice Issue Action | §8, §4.3, §11 ENG-015 | |
| 36 | Reports — Active Contracts | §3, §4.4 | |
| 37 | Reports — Renewal Pipeline | §3, §4.4 | |
| 38 | Reports — Visit Compliance | §3, §4.4 | |
| 39 | Reports — Contract Profitability | §3, §4.4 | |
| 40 | Audit-Readiness Surface | §4.4 | Read-only over prior-sprint events |
| 41 | Configuration — SLA Definitions | §3 | |
| 42 | Configuration — Escalation Policies | §3 | |
| 43 | Configuration — Notice Periods | §3 | |
| 44 | Configuration — Auto-Renewal Rules | §3 | |
| 45 | Configuration — Numbering Series | §3, §11 ENG-017 | |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §11–§12) with server-side authoritative validation via ENG-012 (Publication §11).
- Multi-step approval flows (Renewal) are driven by ENG-010 / ENG-011 (Publication §11).
- Visit scheduling is server-gated on the coverage-window rule (Publication §6).
- Renewal proposals are server-gated on the notice-period rule (Publication §6).
- Contract Terminate action blocks subsequent Entitlement create per the post-termination rule (Publication §6).

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, approval-timeline, calendar picker, coverage-window indicator, sla-timer badge, contract-status badge, invoice-status badge. All components meet the Accessibility Standard (§23).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012 (Publication §11).
- Attachment fields via ENG-007 / ENG-008 (Publication §11) on Contract (signed contract PDF), Contract Invoice (supporting docs), and Renewal (proposal documents).
- Numbering series bindings via ENG-017 (Publication §11) on Contract, Contract Invoice.
- Localization via ENG-006 (Publication §11).

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (Entitlement → Contract; Coverage → Contract; Visit Schedule → Contract + Coverage; Renewal → Contract + Renewal Terms; Contract Invoice → Contract).
- Uniqueness for Contract number, Contract Invoice number, and Renewal number per ENG-017 numbering series (Publication §3, §11).
- Coverage-window rule: Visit Schedule create/reschedule rejected if outside the Contract's coverage window (Publication §6).
- Notice-period rule: Renewal proposal rejected after the notice period has ended (Publication §6).
- Post-termination rule: Entitlement create rejected on a terminated Contract (Publication §6).
- Consumed events (`FieldVisitCompleted`, `ServiceTicketClosed`, `SalesInvoiceIssued`) treated as read-only inputs (Publication §10, §13).

## 13. Business Rules

Rules restated from Publication §6:

- A visit cannot be booked outside the contract's coverage window.
- Renewal proposals must be issued before the notice period ends.
- Terminated contracts cannot accept new entitlements.
- AMC master and transaction lifecycles are AMC-owned; UI never permits mutation of externally-owned masters (Customer).
- AMC consumes upstream events read-only.
- AMC never renders or performs ledger posting; posting is owned by MOD-002 (Publication §11, §13).
- The Customer master is owned by MOD-006; UI never mutates it (Publication §13).

## 14. Search

Global search bar and per-list search operate over Publication-declared entity attributes (Contract number, Entitlement code, Coverage code, Renewal Terms code, Visit Schedule number, Contract Invoice number, Renewal number). Search is delivered via `ENG-020` (Publication §11).

## 15. Filters

Filter panel derives its facets from entity/transaction fields declared in the Publication (contract, customer, status, coverage window, visit period, invoice period, renewal window, SLA status, escalation state). Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002 (Publication §11).

## 17. Dashboards

Dashboards render read-model KPIs from the AMC Analytics & Compliance surface (§4.4). No dashboard writes state. Cross-module KPI definitions remain owned by MOD-017 Analytics (Publication §13).

## 18. Reports

Reports enumerated in Publication §3 are rendered via ENG-021 with export via ENG-027 (Publication §11). No report is introduced beyond the Publication set.

## 19. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events) and SLA/escalation thresholds authorized by Publication §3. The UI surfaces notifications; it does not define new event semantics.

## 20. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-011).

## 21. Loading States

Skeleton loaders for lists, boards, and detail pages. Read-model refresh and preventive schedule generation are long-running; progress is surfaced with polling.

## 22. Empty States

Every list/board/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 23. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes (contract sign, visit schedule, renewal approval, invoice issuance).

## 24. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). Mobile portrait is served by MOB-011.

## 25. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and cost-sensitive fields (contract values, invoice amounts) redacted for unauthorized roles.

## 26. Performance

Interactive operations complete within the platform latency budget (PRD §11). Preventive schedule generation and read-model refresh run within the platform batch envelope (PRD §11).

## 27. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history.

## 28. Acceptance Criteria & Traceability Matrix

WEB-011 is Accepted when every screen in §8 resolves to a Publication anchor, every validation in §12 traces to a Publication rule or entity attribute, every rule in §13 is enforced server-side and surfaced on the relevant screen, and accessibility/security/audit checks in §23, §25, §27 pass the platform baseline. No screen introduces functionality absent from the Publication.

| Publication § | Anchor | WEB-011 Section |
| --- | --- | --- |
| §2 Purpose | AMC purpose | §1 |
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
