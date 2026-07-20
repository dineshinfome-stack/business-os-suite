---
title: "WEB-006 — CRM Web Solution Design"
summary: "Web Solution Design for MOD-006 CRM. Derives all screens, forms, rules, and behaviors exclusively from MOD-006 Module Publication. Introduces no new capabilities."
spec_id: "WEB-006_SOLUTION_DESIGN"
module_id: "MOD-006"
module_name: "CRM"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "Revenue"
source_publication: "docs/45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/crm/MODULE_PRD.md", "docs/40-module-baselines/MOD006_CRM_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-006", "crm", "WEB-006"]
document_type: "Web Solution Design"
---

# WEB-006 — CRM Web Solution Design

> **Source of Truth:** [`MOD-006 Module Publication`](../../../45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-006 CRM for desktop and tablet browsers: capture and qualify leads, manage the opportunity pipeline, maintain the Account and Contact master, log activities and meetings, execute consent-aware campaigns, and observe the customer through the Customer 360 read model — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §9):**

- Web UI for every master data entity in Publication §7 (Account, Contact, Lead, Opportunity, Campaign, Segment).
- Web UI for every transaction in Publication §8 (Activity, Meeting, Campaign Send).
- CRM operations configuration surfaces defined in Publication §3 (pipeline stages, lead scoring model, assignment rules, communication templates).
- Customer 360 read model and CRM operational reports enumerated in Publication §3 (Pipeline, Win/Loss, Activity, Campaign Effectiveness, Customer 360).
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** advanced marketing automation, AI scoring/NBA, social listening, ledger posting, statutory filing.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities and read models in Publication §3, §7, §9:

- **CRM Home** — landing dashboard (Publication §3 Customer 360 & Analytics).
- **Accounts** — list, detail, related objects (Publication §7 Account).
- **Contacts** — list, detail (Publication §7 Contact).
- **Leads** — list, detail, conversion (Publication §7 Lead, §5 SPR-MOD-006-002).
- **Opportunities** — pipeline board and list (Publication §7 Opportunity, §5 SPR-MOD-006-003).
- **Activities** — activity feed, meeting calendar (Publication §8 Activity, Meeting).
- **Campaigns** — campaign list, segment list, campaign send workspace (Publication §7 Campaign/Segment, §8 Campaign Send).
- **Customer 360** — 360 view per Account (Publication §3, §4.6).
- **Reports & Dashboards** — reports enumerated in Publication §3 §4.6.
- **CRM Configuration** — pipeline stages, lead scoring model, assignment rules, communication templates (Publication §3).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Account/Contact/Lead/Opportunity detail (Overview, Activities, Attachments, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 Account | Account list, detail, create, edit, archive |
| §7 Contact | Contact list, detail, create, edit, archive |
| §7 Lead | Lead list, detail, create, edit, single-shot convert |
| §7 Opportunity | Opportunity list, pipeline board, detail, stage transitions, win/loss |
| §7 Campaign / Segment | Campaign list, detail; Segment list, detail |
| §8 Activity | Activity feed, create/edit activity |
| §8 Meeting | Meeting calendar, create/edit meeting |
| §8 Campaign Send | Campaign send workspace with consent filter |
| §3 Customer 360 | Customer 360 view |
| §3 Reports | Pipeline, Win/Loss, Activity Report, Campaign Effectiveness, Customer 360 report |
| §3 CRM Configuration | Pipeline stages, lead scoring model, assignment rules, communication templates surfaces |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- Sales Representative
- Sales Manager
- Marketing Manager
- Service Desk (secondary read)
- Field Service (secondary read)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | CRM Home / Landing Dashboard | §3, §4.6 | Read-only dashboard |
| 2 | Accounts List | §7 Account | Search, filter, export |
| 3 | Account Detail | §7 Account | Tabs: Overview, Contacts, Activities, Opportunities, History |
| 4 | Account Create/Edit | §7 Account, §6 rules | Consent capture on contact objects |
| 5 | Contacts List | §7 Contact | |
| 6 | Contact Detail | §7 Contact | Marketing consent attribute |
| 7 | Contact Create/Edit | §7 Contact, §6 | |
| 8 | Leads List | §7 Lead | |
| 9 | Lead Detail | §7 Lead, §5 SPR-006-002 | Score, assigned owner |
| 10 | Lead Create/Edit | §7 Lead | |
| 11 | Lead Convert (single-shot) | §6 rule (single conversion), §5 SPR-006-002 | Enforced once per Lead |
| 12 | Opportunities List | §7 Opportunity | |
| 13 | Opportunity Pipeline Board | §7, §4.3 | Stage columns from Configuration |
| 14 | Opportunity Detail | §7, §5 SPR-006-003 | Stage transitions, win/loss |
| 15 | Opportunity Create/Edit | §7 | |
| 16 | Activity Feed | §8 Activity | Per Account/Contact/Lead/Opportunity |
| 17 | Activity Create/Edit | §8 Activity | |
| 18 | Meeting Calendar | §8 Meeting | |
| 19 | Meeting Create/Edit | §8 Meeting | |
| 20 | Campaigns List | §7 Campaign | |
| 21 | Campaign Detail | §7 Campaign, §5 SPR-006-005 | |
| 22 | Segments List | §7 Segment | |
| 23 | Segment Detail | §7 Segment | |
| 24 | Campaign Send Workspace | §8 Campaign Send, §6 consent rule | Consent-based exclusion visible |
| 25 | Customer 360 View | §3, §4.6 | Read-only aggregate |
| 26 | Reports — Pipeline | §3, §4.6 | |
| 27 | Reports — Win/Loss | §3, §4.6 | |
| 28 | Reports — Activity | §3, §4.6 | |
| 29 | Reports — Campaign Effectiveness | §3, §4.6 | |
| 30 | Reports — Customer 360 | §3, §4.6 | |
| 31 | Configuration — Pipeline Stages | §3 | |
| 32 | Configuration — Lead Scoring Model | §3 | |
| 33 | Configuration — Assignment Rules | §3 | |
| 34 | Configuration — Communication Templates | §3 | |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-020, ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §12) with server-side authoritative validation via ENG-012 (Publication §11).
- Board screens (Opportunity Pipeline) support drag-and-drop stage transitions, gated by ENG-002 permissions and workflow (ENG-010).

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (from Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, kanban column, calendar grid. All components meet the Accessibility Standard (§22).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012.
- Consent capture on Contact forms (Publication §6 marketing consent rule).
- Attachment fields via ENG-008 (Publication §11) on Account/Activity forms.

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (Account/Contact stable identifiers).
- Uniqueness where the Publication implies enterprise-single (Account name within tenant, single-shot Lead conversion).
- Consent gating for campaign membership (Publication §6).
- Assignment resolution returns exactly one owner (Publication §6).

## 13. Business Rules

Rules restated from Publication §6:

- A Lead may be converted only once.
- Assignment rules resolve to exactly one owner.
- Marketing consent must be recorded before campaign inclusion; excluded recipients are visible in the send workspace.
- Master data lifecycle is CRM-owned; UI never permits mutation of externally-owned masters.
- Opportunity win/loss is terminal; commercial documents are handled outside CRM.
- CRM UI never triggers ledger posting.

## 14. Search

Global search bar and per-list search delegate to ENG-020 (Publication §11). Scope: Accounts, Contacts, Leads, Opportunities, Campaigns.

## 15. Filters

Filter panel derives its facets from entity fields declared in the Publication. Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002.

## 17. Dashboards

Dashboards render read-model KPIs via ENG-022 (Publication §11) from the Customer 360 & Analytics surface (§4.6). No dashboard writes state.

## 18. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events). The UI surfaces notifications; it does not define new event semantics.

## 19. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-006).

## 20. Loading States

Skeleton loaders for lists, boards, and detail pages. Optimistic UI is used only for reversible operations (e.g., stage drag) and reconciles on server response.

## 21. Empty States

Every list/board/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 22. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes.

## 23. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). Mobile portrait is served by MOB-006.

## 24. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and PII redaction for consent-restricted fields.

## 25. Performance

Interactive operations complete within the platform latency budget (PRD §11). Lists page at ≤50 rows by default; boards virtualize columns exceeding 100 cards.

## 26. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history.

## 27. Acceptance Criteria

WEB-006 is Accepted when:

1. Every screen in §8 resolves to a Publication anchor.
2. Every form validation in §12 traces to a Publication rule or entity attribute.
3. Every rule in §13 is enforced server-side and visibly surfaced on the relevant screen.
4. Accessibility, security, and audit checks in §22, §24, §26 pass the platform baseline.
5. No screen introduces functionality absent from the Publication.

## 28. Open Issues

None at author time. Any future clarification requires an amended Publication (Baseline v2) before this document changes.

## 29. Traceability Matrix

| Publication § | Anchor | WEB-006 Section |
| --- | --- | --- |
| §2 Purpose | CRM purpose | §1 |
| §3 Scope | Full scope | §2, §4, §6 |
| §4 Authorities | Ownership | §7, §13 |
| §5 Requirements | Sprint refs | §8, §11–§13 |
| §6 Business Rules | Rules | §12, §13 |
| §7 Master Data | Entities | §8, §11 |
| §8 Transactions | Transactions | §8, §11 |
| §9 Published Events | Events | §18 |
| §10 Consumed Events | Events | §17, §18 |
| §11 Engines | Engine consumption | §14–§18, §24, §26 |
| §12 Dependencies | Upstream/downstream | §7 (roles), §24 |
| §13 Boundaries | Ownership | §13 |
| §15 Non-Goals | Exclusions | §2 (out of scope) |
