---
title: "WEB-012 — Field Service Web Solution Design"
summary: "Web Solution Design for MOD-012 Field Service. Derives all screens, forms, rules, and behaviors exclusively from MOD-012 Module Publication. Introduces no new capabilities."
spec_id: "WEB-012_SOLUTION_DESIGN"
module_id: "MOD-012"
module_name: "Field Service"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "Service"
source_publication: "docs/45-module-publications/field-service/MOD-012_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/field-service/MODULE_PRD.md", "docs/40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-012", "field-service", "WEB-012"]
document_type: "Web Solution Design"
---

# WEB-012 — Field Service Web Solution Design

> **Source of Truth:** [`MOD-012 Module Publication`](../../../45-module-publications/field-service/MOD-012_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-012 Field Service for Dispatchers, Service Managers, Field Technicians (back-office), Inventory coordinators, and AMC coordinators on desktop and tablet browsers: maintain Technician / Skill / Territory / Ticket Type / SLA Policy masters and Field Service configuration, execute the Ticket-to-dispatch, Visit-to-closure, Escalation, and Spare Consumption processes, capture Field Ticket / Visit / Spare Consumption / Closure Report transactions, and observe the Field Service operational read model through reports, dashboards, exports, and the audit-readiness surface — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §7, §8, §9):**

- Web UI for every master data entity in Publication §7 (Technician, Skill, Territory, Ticket Type, SLA Policy).
- Web UI for every transaction in Publication §8 (Field Ticket, Visit, Spare Consumption, Closure Report).
- Field Service configuration surfaces authorized by Publication §3 (numbering series, ticket-type policies, dispatch strategies, SLA policies, territory rules, mobile app settings).
- Dispatch-strategy resolution, scheduled dispatch, and automated re-dispatch (Publication §3, §4.2).
- Signature/checklist capture gating visit completion; Closure Report authoring (Publication §3, §4.3).
- SLA clock tracking and rule-driven escalation (Publication §3, §4.4).
- Field Service operational reports enumerated in Publication §3 (Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence), dashboards, exports, and audit-readiness surface (Publication §4.5).
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** offline-first mobile beyond the platform baseline, AI dispatch optimization, predictive maintenance, cross-module KPI authoring, ledger effects of billable field work, and deferred Event Catalog items. Coverage shall include only the screens, workflows, and business capabilities defined in the Publication.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities, transactions, and read models in Publication §3, §7, §8, §9:

- **Field Service Home** — landing dashboard (Publication §3, §4.5).
- **Tickets** — Field Ticket transaction workspace (Publication §8, §4.1).
- **Dispatch Board** — Visit dispatch workspace (Publication §8, §4.2).
- **Visits** — Visit transaction workspace (Publication §8, §4.2, §4.3).
- **Spare Consumption** — Spare Consumption transaction workspace (Publication §8, §4.3).
- **Closure Reports** — Closure Report workspace (Publication §8, §4.3).
- **SLA & Escalations** — SLA clock and escalation workspace (Publication §3, §4.4).
- **Technicians & Territories** — Technician, Skill, and Territory master workspaces (Publication §7).
- **Reports & Dashboards** — reports enumerated in Publication §3, §4.5.
- **Field Service Configuration** — numbering series, ticket-type policies, dispatch strategies, SLA policies, territory rules, mobile app settings (Publication §3, PRD §10).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Field Ticket detail (Overview, Visits, Spares, Closure, SLA, History) and Visit detail (Overview, Dispatch, Execution, Spares, Signatures, Closure, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 Technician | Technician list, detail, create, edit |
| §7 Skill | Skill list, detail, create, edit |
| §7 Territory | Territory list, detail, create, edit |
| §7 Ticket Type | Ticket Type list, detail, create, edit |
| §7 SLA Policy | SLA Policy list, detail, create, edit |
| §8 Field Ticket / §4.1 | Field Ticket lifecycle; emits `FieldTicketCreated` (§9) |
| §8 Visit / §4.2 | Visit dispatch; emits `VisitAssigned` (§9) |
| §8 Visit / §4.3 | Visit completion; emits `FieldVisitCompleted` (§9) |
| §8 Spare Consumption / §4.3 | Spare Consumption capture; emits `SpareConsumed` (§9) |
| §8 Closure Report / §4.3 | Closure Report authoring |
| §3 / §4.4 SLA & Escalation | SLA clock; escalation workflows |
| §3 / §4.5 Reports | Ticket Ageing, First-Time-Fix Rate, Technician Utilization, SLA Adherence |
| §3 Field Service Configuration | Numbering, ticket types, dispatch, SLA, territory, mobile settings |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- Field Technician (primary)
- Dispatcher (primary)
- Service Manager (primary)
- Inventory (secondary)
- AMC Coordinator (secondary)
- Customer (external actor; scoped read where authorized)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | Field Service Home / Landing Dashboard | §3, §4.5 | Read-only |
| 2 | Tickets List | §8 Field Ticket | Search, filter, export |
| 3 | Ticket Detail — Overview | §8, §4.1 | |
| 4 | Ticket Create | §8, §4.1 | Emits `FieldTicketCreated` (§9) |
| 5 | Ticket Triage Action | §8, §4.1 | `open → triaged` |
| 6 | Ticket Detail — Visits | §8 Visit, §4.2 | |
| 7 | Ticket Detail — Spares | §8 Spare Consumption, §4.3 | |
| 8 | Ticket Detail — Closure | §8 Closure Report, §4.3 | |
| 9 | Ticket Detail — SLA | §3, §4.4 | SLA clock, escalation state |
| 10 | Ticket Detail — History | §11 ENG-004 | Audit trail |
| 11 | Ticket Cancel Action | §8, §4.1 | |
| 12 | Dispatch Board | §8, §4.2 | Skill × territory × availability resolution (§4.2) |
| 13 | Visit Assign Action | §8, §4.2 | Emits `VisitAssigned` (§9) |
| 14 | Visit Reassign Action | §8, §4.2 | Via ENG-013 automated re-dispatch |
| 15 | Scheduled Dispatch Workspace | §3, §4.2 | Uses `ENG-014` |
| 16 | Visits List | §8, §4.2, §4.3 | |
| 17 | Visit Detail — Overview | §8, §4.2, §4.3 | |
| 18 | Visit Detail — Dispatch | §8, §4.2 | `assigned → en route → on site` |
| 19 | Visit Detail — Execution | §8, §4.3 | Back-office review of on-site progress |
| 20 | Visit Detail — Spares | §8 Spare Consumption, §4.3 | |
| 21 | Visit Detail — Signatures/Checklist | §6, §4.3 | Signature/checklist gate for completion |
| 22 | Visit Detail — Closure | §8 Closure Report, §4.3 | Emits `FieldVisitCompleted` (§9) |
| 23 | Visit Detail — History | §11 ENG-004 | |
| 24 | Spare Consumption List | §8, §4.3 | |
| 25 | Spare Consumption Detail | §8, §4.3 | |
| 26 | Spare Consumption Create | §8, §4.3 | Emits `SpareConsumed` (§9); Item master read-only via MOD-005 (§13) |
| 27 | Closure Report List | §8, §4.3 | |
| 28 | Closure Report Detail | §8, §4.3 | Rendered via ENG-007 (§11) |
| 29 | Closure Report Author | §8, §4.3 | Attachments via ENG-008 (§11) |
| 30 | SLA Board | §3, §4.4 | Active clocks, breach state |
| 31 | Escalation Inbox | §3, §4.4, §11 ENG-011 | |
| 32 | Escalation Detail / Action | §3, §4.4 | Via ENG-010 / ENG-011 |
| 33 | Technicians List | §7 Technician | |
| 34 | Technician Detail / Edit | §7 | Skills, territory assignment |
| 35 | Technician Create | §7 | |
| 36 | Skills List | §7 Skill | |
| 37 | Skill Detail / Edit / Create | §7 | |
| 38 | Territories List | §7 Territory | |
| 39 | Territory Detail / Edit / Create | §7 | |
| 40 | Ticket Types List | §7 Ticket Type | |
| 41 | Ticket Type Detail / Edit / Create | §7 | |
| 42 | SLA Policies List | §7 SLA Policy | |
| 43 | SLA Policy Detail / Edit / Create | §7, §3 | |
| 44 | Reports — Ticket Ageing | §3, §4.5 | |
| 45 | Reports — First-Time-Fix Rate | §3, §4.5 | |
| 46 | Reports — Technician Utilization | §3, §4.5 | |
| 47 | Reports — SLA Adherence | §3, §4.5 | |
| 48 | Audit-Readiness Surface | §4.5 | Read-only over prior-sprint events |
| 49 | Configuration — Numbering Series | §3, §11 ENG-017 | |
| 50 | Configuration — Ticket-Type Policies | §3 | |
| 51 | Configuration — Dispatch Strategies | §3, §4.2 | Via ENG-005/ENG-012 |
| 52 | Configuration — Territory Rules | §3 | |
| 53 | Configuration — Mobile App Settings | §3 | |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard or board), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §11–§12) with server-side authoritative validation via ENG-012 (Publication §11).
- Multi-step escalation flows are driven by ENG-010 / ENG-011 (Publication §11).
- Visit completion is server-gated on the signature/checklist rule (Publication §6).
- Spare Consumption emits `SpareConsumed` (Publication §9) on save; van-stock decrement is effected by MOD-005 consuming that event (Publication §13).
- Dispatch Board actions resolve strategy via ENG-005/ENG-012 and schedule via ENG-014 (Publication §11).

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, approval-timeline, dispatch-board card, sla-timer badge, ticket-status badge, visit-status badge, signature-capture (back-office review), checklist-item, and map hint (non-authoritative; primary map/GPS surface lives on mobile per Publication §11 boundaries). All components meet the Accessibility Standard (§23).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012 (Publication §11).
- Attachment fields via ENG-007 / ENG-008 (Publication §11) on Field Ticket (evidence), Visit (execution attachments), Spare Consumption (photos), and Closure Report (signed report).
- Numbering series bindings via ENG-017 (Publication §11) on Field Ticket, Spare Consumption.
- Localization via ENG-006 (Publication §11).

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (Visit → Field Ticket; Spare Consumption → Visit + Item [read-only from MOD-005]; Closure Report → Visit; SLA Policy → Ticket Type / Territory).
- Uniqueness for Field Ticket number and Spare Consumption number per ENG-017 numbering series (Publication §3, §11).
- Signature/checklist rule: Visit completion (`on site → completed`) rejected when required signatures/checklists are missing (Publication §6).
- Van-stock rule: Spare Consumption save emits `SpareConsumed`; stock adjustment is effected by MOD-005 (Publication §6, §13).
- SLA breach rule: SLA breach detection triggers escalation per policy (Publication §6).
- Dispatch-strategy rule: assignment respects skill × territory × availability resolved via ENG-005/ENG-012 (Publication §4.2).
- Consumed events (`ContractSigned`, `VisitScheduled`, `ServiceTicketClosed`) treated as read-only inputs (Publication §10, §13).

## 13. Business Rules

Rules restated from Publication §6:

- A visit cannot be closed without required signatures/checklists.
- Spare consumption reduces the technician's van stock (via `SpareConsumed` consumed by MOD-005).
- SLA breaches trigger escalation per policy.
- Field Service master and transaction lifecycles are Field Service-owned; UI never permits mutation of externally-owned masters (Item, AMC contract, service-desk ticket).
- Field Service consumes upstream events read-only.
- Field Service never renders or performs ledger posting; posting is owned by MOD-002 (Publication §11, §13).

## 14. Search

Global search bar and per-list search operate over Publication-declared entity attributes (Field Ticket number, Visit number, Spare Consumption number, Technician code, Skill code, Territory code, Ticket Type code, SLA Policy code). Search is delivered via `ENG-020` (Publication §11).

## 15. Filters

Filter panel derives its facets from entity/transaction fields declared in the Publication (ticket, ticket type, technician, territory, status, SLA state, escalation state, visit period, consumption period). Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002 (Publication §11).

## 17. Dashboards

Dashboards render read-model KPIs from the Field Service Analytics & Compliance surface (§4.5). No dashboard writes state. Cross-module KPI definitions remain owned by MOD-017 Analytics (Publication §13).

## 18. Reports

Reports enumerated in Publication §3 are rendered via ENG-021 with export via ENG-027 (Publication §11). No report is introduced beyond the Publication set.

## 19. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events) and SLA/escalation thresholds authorized by Publication §3, §4.4. The UI surfaces notifications; it does not define new event semantics.

## 20. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-012).

## 21. Loading States

Skeleton loaders for lists, boards, and detail pages. Read-model refresh and dispatch strategy resolution are long-running; progress is surfaced with polling.

## 22. Empty States

Every list/board/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 23. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes (ticket create, visit assign, visit complete, spare save, closure sign).

## 24. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). Mobile portrait is served by MOB-012.

## 25. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and cost-sensitive fields (labour rate, spare unit cost) redacted for unauthorized roles.

## 26. Performance

Interactive operations complete within the platform latency budget (PRD §11). Dispatch strategy resolution, scheduled dispatch, and read-model refresh run within the platform batch envelope (PRD §11).

## 27. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history.

## 28. Acceptance Criteria & Traceability Matrix

WEB-012 is Accepted when every screen in §8 resolves to a Publication anchor, every validation in §12 traces to a Publication rule or entity attribute, every rule in §13 is enforced server-side and surfaced on the relevant screen, and accessibility/security/audit checks in §23, §25, §27 pass the platform baseline. No screen introduces functionality absent from the Publication.

| Publication § | Anchor | WEB-012 Section |
| --- | --- | --- |
| §2 Purpose | Field Service purpose | §1 |
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
