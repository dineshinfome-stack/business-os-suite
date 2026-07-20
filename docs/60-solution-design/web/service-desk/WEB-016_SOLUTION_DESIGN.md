---
title: "WEB-016 — Service Desk Web Solution Design"
summary: "Web Solution Design for MOD-016 Service Desk. Derives all screens, forms, rules, and behaviors exclusively from MOD-016 Module Publication. Introduces no new capabilities."
spec_id: "WEB-016_SOLUTION_DESIGN"
module_id: "MOD-016"
module_name: "Service Desk"
platform: "web"
version: "1.0"
status: "Design Complete"
owner: "Service"
source_publication: "docs/45-module-publications/service-desk/MOD-016_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/service-desk/MODULE_PRD.md", "docs/40-module-baselines/MOD016_SERVICE_DESK_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "web", "MOD-016", "service-desk", "WEB-016"]
document_type: "Web Solution Design"
---

# WEB-016 — Service Desk Web Solution Design

> **Source of Truth:** [`MOD-016 Module Publication`](../../../45-module-publications/service-desk/MOD-016_MODULE_PUBLICATION.md). Every screen, rule, and behavior in this document derives from a Publication section. Reference Documents (PRD, Baseline) are informative only and MUST NOT override the Publication.

## 1. Purpose

Deliver the web surface of MOD-016 Service Desk for Support Agents, Support Managers, and secondary Field-Service and CRM users on desktop, laptop, and tablet browsers: maintain Ticket Category, SLA Policy, and Knowledge Article masters and the Service Desk configuration surface; capture multi-channel Service Tickets and manage their lifecycle including categorization/routing execution, parent/child relations, and close-with-open-child-task enforcement; observe SLA Clocks with pause-on-customer-waiting and automatic resume, act on SLA Breach Events, and execute the Escalation-Matrix; author and publish Knowledge Articles under review-before-publish; author and apply Macros; issue CSAT Surveys and consume CSAT Responses; and observe the Service Desk operational read model through reports, dashboards, exports, and the audit-readiness surface — bounded strictly by Publication §2–§13.

## 2. Scope

**In scope (derived from Publication §3, §5, §6, §7, §8, §9):**

- Web UI for every master data entity in Publication §7 (Ticket Category, SLA Policy, Knowledge Article).
- Web UI for every transaction in Publication §8 (Service Ticket, SLA Breach Event, CSAT Response) plus CSAT Survey issuance and Macro execution per Publication §4.4.
- Multi-channel Service Ticket capture (Email, Chat, WhatsApp, Voice) and lifecycle actions per Publication §4.2, including categorization/routing execution, parent/child relations, and close-with-open-child-task enforcement (§6).
- SLA Clock observation with pause/resume, SLA Breach Event workspace, and Escalation-Matrix execution per Publication §4.3.
- Knowledge Article authoring with review-before-publish (§6) and Internal / Customer-visible visibility per Publication §4.4.
- Macro authoring and application per Publication §4.4.
- CSAT Survey issuance and CSAT Response observation with single-response enforcement per Publication §6, §4.4.
- Service Desk configuration surfaces authorized by Publication §3 (routing rules, escalation matrices, business hours per region, numbering series for Service Desk documents).
- Service Desk operational reports enumerated in Publication §3 (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity), dashboards, exports, and audit-readiness surface (Publication §4.5).
- Consumption of engine capabilities enumerated in Publication §11.

**Out of scope (Publication §15):** AI triage and suggested responses, community forums, cross-module KPI authoring, ledger effects, and deferred Event Catalog items. Coverage includes only screens, workflows, and business capabilities defined in the Publication.

## 3. Traceability to Publication

Every downstream section cites Publication § references. A complete forward map appears in §28 Traceability Matrix.

## 4. Information Architecture

Top-level web IA is derived from the entities, transactions, and read models in Publication §3, §7, §8, §9:

- **Service Desk Home** — landing dashboard (Publication §3, §4.5).
- **Tickets** — Service Ticket workspace (Publication §8, §4.2).
- **SLA** — SLA Clock observation, SLA Breach Events, and Escalation-Matrix execution (Publication §4.3, §8).
- **Knowledge Base** — Knowledge Article master workspace with review-before-publish (Publication §7, §4.4, §6).
- **Macros** — Macro authoring and application (Publication §4.4).
- **CSAT** — CSAT Survey issuance and CSAT Response observation (Publication §8, §4.4).
- **Reports & Dashboards** — reports enumerated in Publication §3, §4.5.
- **Service Desk Configuration** — Ticket Category and SLA Policy masters; routing rules; escalation matrices; business hours per region; numbering series (Publication §3, §7, §4.1, PRD §10).

## 5. Navigation Structure

Primary sidebar order mirrors §4. Contextual sub-navigation is provided by tabs on Service Ticket detail (Overview, Conversation, SLA, Child Tickets, Approvals, Attachments, History), SLA Breach Event detail (Overview, Escalation, Approvals, History), Knowledge Article detail (Overview, Content, Review, History), CSAT Survey detail (Overview, Response, History), and Ticket Category detail (Overview, Routing, History). No navigation is introduced that lacks a Publication entity, transaction, or read model.

## 6. Feature Mapping

| Publication Reference | Web Feature |
| --- | --- |
| §7 Ticket Category | Ticket Category list, detail, create, edit |
| §7 SLA Policy | SLA Policy list, detail, create, edit |
| §7 Knowledge Article | Knowledge Article list, detail, create, edit; review-before-publish (§6) |
| §8 Service Ticket / §4.2 | Multi-channel capture (Email, Chat, WhatsApp, Voice); lifecycle; categorization/routing; parent/child; close-with-open-child-task (§6); emits `ServiceTicketCreated` and `ServiceTicketClosed` (§9) |
| §8 SLA Breach Event / §4.3 | SLA Clock observation; pause-on-customer-waiting (§6); Escalation-Matrix execution; emits `SLAPaused`, `SLAResumed`, `SLABreached`, `EscalationTriggered` (§9) |
| §4.4 Macros | Macro authoring; Macro application on Service Ticket; emits `MacroExecuted` (§9) |
| §8 CSAT Response / §4.4 | CSAT Survey issuance; CSAT Response observation; single-response enforcement (§6); emits `CSATSurveySent`, `CSATResponseReceived` (§9) |
| §7 Knowledge Article publish | Publish action emits `KnowledgeArticlePublished` (§9) |
| §3 / §4.5 Reports | Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity; emits `AnalyticsSnapshotGenerated`, `ComplianceReportGenerated` (§9) |
| §3 Service Desk Configuration | Routing rules, escalation matrices, business hours, numbering series |

## 7. User Roles

Business-level roles inherited from PRD §3 and enforced via ENG-002/ENG-003 (Publication §11):

- Support Agent (primary)
- Support Manager (primary; approver for Knowledge Article review, escalation approvals where configured)
- Field Service (secondary; PRD §3)
- CRM (secondary; PRD §3)
- Customer (external actor; scoped CSAT response and customer-visible article surfaces)
- Employee (external actor; internal support requester)

Concrete grants are defined by ENG-003 policies; this document does not redefine authorization.

## 8. Screen Inventory

Screens are derived deterministically from Publication entities/transactions/read-models. Each row cites its Publication anchor.

| # | Screen | Publication Ref | Notes |
| --- | --- | --- | --- |
| 1 | Service Desk Home / Landing Dashboard | §3, §4.5 | Read-only |
| 2 | Tickets — List | §8 Service Ticket | Multi-channel filter (§4.2) |
| 3 | Ticket Detail — Overview | §8, §4.2 | |
| 4 | Ticket Detail — Conversation | §4.2, §11 ENG-023 | Multi-channel thread |
| 5 | Ticket Detail — SLA | §4.3 | Live clock; pause/resume states |
| 6 | Ticket Detail — Child Tickets | §4.2, §6 | Blocks close if any open (§6) |
| 7 | Ticket Detail — Approvals | §11 ENG-010/011 | |
| 8 | Ticket Detail — Attachments | §11 ENG-007/008 | |
| 9 | Ticket Detail — History | §11 ENG-004 | |
| 10 | Ticket Create (Email intake) | §4.2 | Emits `ServiceTicketCreated` (§9) |
| 11 | Ticket Create (Chat intake) | §4.2 | Emits `ServiceTicketCreated` (§9) |
| 12 | Ticket Create (WhatsApp intake) | §4.2, §11 ENG-023 | Emits `ServiceTicketCreated` (§9) |
| 13 | Ticket Create (Voice intake) | §4.2, §11 ENG-023 | Emits `ServiceTicketCreated` (§9) |
| 14 | Ticket Create (Manual / Agent) | §4.2 | Emits `ServiceTicketCreated` (§9) |
| 15 | Ticket Categorize / Route Action | §4.2, §11 ENG-012 | Deterministic routing |
| 16 | Ticket Assign Action | §4.2 | Initial or reassignment |
| 17 | Ticket Reply / Reassign Action | §4.2 | |
| 18 | Ticket Apply Macro Action | §4.4 | Emits `MacroExecuted` (§9) |
| 19 | Ticket Attach Knowledge Article | §4.4, §7 | Customer-visible check (§4.4) |
| 20 | Ticket Link Parent / Add Child | §4.2 | |
| 21 | Ticket Close Action | §8, §4.2, §6 | Blocked if open child tasks (§6); emits `ServiceTicketClosed` (§9) |
| 22 | Ticket Reopen Action | §8, §4.2 | |
| 23 | Tickets — From `CustomerCreated` Inbox | §10 | Read-only inbound reconciliation |
| 24 | Tickets — From `OpportunityWon` Inbox | §10 | Read-only inbound reconciliation |
| 25 | Tickets — From `FieldVisitCompleted` Inbox | §10 | Read-only inbound reconciliation |
| 26 | SLA Clocks — Live Board | §4.3 | Reads pause/resume state |
| 27 | SLA Breach Events — List | §8 SLA Breach Event | |
| 28 | SLA Breach Event Detail — Overview | §8, §4.3 | |
| 29 | SLA Breach Event Detail — Escalation | §4.3, §11 ENG-013 | Deterministic Escalation-Matrix |
| 30 | SLA Breach Event Detail — Approvals | §11 ENG-011 | Approval-gated escalations (§4.3) |
| 31 | SLA Breach Event Detail — History | §11 ENG-004 | |
| 32 | SLA Pause / Resume Actions (server-driven) | §4.3, §6 | Emits `SLAPaused` / `SLAResumed` (§9) |
| 33 | SLA Breach Recorded Action (server-driven) | §4.3 | Emits `SLABreached` (§9) |
| 34 | Escalation Trigger Action | §4.3 | Emits `EscalationTriggered` (§9) |
| 35 | Knowledge Articles — List | §7 Knowledge Article | |
| 36 | Knowledge Article Detail — Overview | §7 | Internal / Customer-visible flag (§4.4) |
| 37 | Knowledge Article Detail — Content | §7 | |
| 38 | Knowledge Article Detail — Review | §4.4, §6, §11 ENG-011 | Review-before-publish (§6) |
| 39 | Knowledge Article Detail — History | §11 ENG-004 | |
| 40 | Knowledge Article Create / Edit | §7 | |
| 41 | Knowledge Article Submit for Review Action | §4.4 | |
| 42 | Knowledge Article Approve / Reject Action | §4.4, §11 ENG-011 | Reviewer path |
| 43 | Knowledge Article Publish Action | §4.4, §6 | Emits `KnowledgeArticlePublished` (§9) |
| 44 | Knowledge Article Archive Action | §7 | |
| 45 | Macros — List | §4.4 | |
| 46 | Macro Detail | §4.4 | |
| 47 | Macro Create / Edit | §4.4 | |
| 48 | CSAT Surveys — List | §4.4 | |
| 49 | CSAT Survey Detail | §4.4 | Emits `CSATSurveySent` (§9) on dispatch |
| 50 | CSAT Responses — List | §8 CSAT Response | |
| 51 | CSAT Response Detail | §8, §4.4 | Emits `CSATResponseReceived` (§9) on receipt |
| 52 | Reports — Ticket Volume | §3, §4.5 | |
| 53 | Reports — SLA Adherence | §3, §4.5 | |
| 54 | Reports — CSAT Trend | §3, §4.5 | |
| 55 | Reports — Agent Productivity | §3, §4.5 | |
| 56 | Analytics Snapshot Action | §4.5 | Emits `AnalyticsSnapshotGenerated` (§9) |
| 57 | Compliance Report Action | §4.5 | Emits `ComplianceReportGenerated` (§9) |
| 58 | Audit-Readiness Surface | §4.5 | Read-only over prior-sprint events |
| 59 | Ticket Categories — List | §7 Ticket Category | |
| 60 | Ticket Category Detail | §7 | |
| 61 | Ticket Category Create / Edit | §7 | |
| 62 | SLA Policies — List | §7 SLA Policy | |
| 63 | SLA Policy Detail | §7 | |
| 64 | SLA Policy Create / Edit | §7 | |
| 65 | Configuration — Routing Rules | §3, §4.1 | Via ENG-005 |
| 66 | Configuration — Escalation Matrices | §3, §4.1 | Via ENG-005 |
| 67 | Configuration — Business Hours per Region | §3, §4.1 | Via ENG-005 |
| 68 | Configuration — Numbering Series | §3, §4.1, §11 ENG-017 | |

## 9. Screen Specifications

Every screen follows a standard layout: page header (breadcrumb, title, primary action), body region (form or list or dashboard or tree), and side region (context or filters). Interactions:

- List screens support search, filter panel, column selection, pagination, and export (Publication §11 ENG-027).
- Detail screens use tabs; the History tab surfaces audit entries via ENG-004 (Publication §11).
- Create/Edit uses validated forms (see §11–§12) with server-side authoritative validation via ENG-012 (Publication §11).
- Multi-step approval flows (Knowledge Article review, escalation approvals where configured, and any other approval-gated Service Desk transitions) are driven by ENG-010 / ENG-011 (Publication §11).
- Categorization and routing on Service Ticket run deterministically via ENG-012 against Ticket Category master and routing rules (Publication §4.2, §11).
- Ticket Close is blocked when any child task remains open (Publication §6); server emits `ServiceTicketClosed` on successful close (§9).
- SLA Clocks read pause/resume state from server evaluations; pause-on-customer-waiting and automatic resume are enforced server-side (Publication §6, §4.3); `SLAPaused` / `SLAResumed` events emit server-side (§9).
- SLA Breach detection emits `SLABreached` (§9); Escalation-Matrix execution runs via ENG-013 and emits `EscalationTriggered` (§9); escalation notifications dispatch via ENG-025 (Publication §11).
- Knowledge Article Publish is blocked without a captured review approval (Publication §6); Publish emits `KnowledgeArticlePublished` (§9). Internal / Customer-visible visibility is enforced via ENG-012 (Publication §4.4).
- Macro Apply on a Service Ticket runs deterministically via ENG-012 and does not mutate ticket history (Publication §4.4); Apply emits `MacroExecuted` (§9).
- CSAT Survey issuance dispatches via ENG-025 only after eligible ticket closure (Publication §4.4); single-response enforcement runs via ENG-012 (§6); Dispatch emits `CSATSurveySent` (§9); receipt emits `CSATResponseReceived` (§9).
- Analytics Snapshot and Compliance Report actions read the Service Desk read model and emit `AnalyticsSnapshotGenerated` / `ComplianceReportGenerated` (§9).
- Cross-module inbound reconciliation (Publication §10) surfaces `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon` as read-only inbound feeds that link into tickets; MOD-016 does not mutate source data.

No screen introduces logic beyond capabilities in the Publication.

## 10. Component Specifications

Reused components (Business OS design system): data table, filter panel, form field, tag, avatar, empty state, error state, notification toast, dialog, tabs, breadcrumbs, hierarchy tree, approval-timeline, conversation-thread, channel-badge (Email / Chat / WhatsApp / Voice), sla-clock badge, sla-status pill, escalation-timeline, ticket-status badge, child-task list, macro-picker, knowledge-article picker, review-diff panel, csat-star rating, attachment tile. All components meet the Accessibility Standard (§23).

## 11. Forms

Form catalogue matches entity/transaction fields declared in the Publication. Fields not authorized by the Publication are excluded. Every form uses:

- Structural validation (required, format, uniqueness) enforced by ENG-012 (Publication §11).
- Attachment fields via ENG-008 (Publication §11) on Service Ticket (evidence, screenshots) and Knowledge Article (illustrations).
- Document fields via ENG-007 (Publication §11) on Service Ticket (generated correspondence) and Knowledge Article (rendered content).
- Numbering series bindings via ENG-017 (Publication §11) on Service Ticket, SLA Breach Event, and CSAT Response.
- Localization via ENG-006 (Publication §11).

## 12. Data Validation

Validation categories (all enforced server-side; client mirrors are advisory):

- Required-field validation for every Publication-declared attribute marked mandatory.
- Referential validation (Service Ticket → Ticket Category + SLA Policy + Customer (from MOD-006); Child Ticket → Parent Ticket; SLA Breach Event → Service Ticket + SLA Policy; CSAT Response → CSAT Survey → Service Ticket; Knowledge Article → owning Ticket Category).
- Uniqueness for Service Ticket, SLA Breach Event, and CSAT Response numbers per ENG-017 numbering series (Publication §3, §11).
- Close-with-Open-Child-Task Rule: Service Ticket close rejected when any linked child task remains open (Publication §6).
- Review-Before-Publish Rule: Knowledge Article publish rejected without a captured review approval (Publication §6).
- Single-Response Rule: CSAT Response create rejected when a response for the referenced CSAT Survey already exists (Publication §6).
- Pause-on-Customer-Waiting Rule: SLA Clock evaluation deterministically pauses / resumes based on configured customer-waiting state; UI reflects server-authoritative state only (Publication §6, §4.3).
- Consumed events (`FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon`) treated as read-only inputs (Publication §10, §13).

## 13. Business Rules

Rules restated from Publication §6:

- A ticket cannot be closed while it has open child tasks.
- SLA countdowns pause during customer-waiting states as configured and resume automatically.
- Knowledge articles must be reviewed before publish.
- CSAT enforces a single response per survey issuance.
- Macros apply approved templates to Service Tickets without mutating ticket history.
- Service Desk master and transaction lifecycles are Service-Desk-owned; UI never permits mutation of externally-owned data.
- Service Desk consumes `FieldVisitCompleted`, `CustomerCreated`, and `OpportunityWon` read-only.
- Service Desk never renders or performs ledger posting; MOD-016 declares no ledger effects (Publication §11, §13).

## 14. Search

Global search bar and per-list search operate over Publication-declared entity attributes (Ticket Category code, SLA Policy code, Knowledge Article code/title, Service Ticket number, SLA Breach Event number, CSAT Response number). Knowledge Article search runs via ENG-020 (Publication §4.4, §11). Customer lookups on Service Tickets consume MOD-006 CRM read-only (Publication §12, §13).

## 15. Filters

Filter panel derives its facets from entity/transaction fields declared in the Publication (channel, category, SLA policy, priority, assignee, queue, state, breach status, article visibility, period). Persistent per-user views may be saved (design-system feature; no new business capability).

## 16. Tables

Data tables use server-side pagination, sorting, and column configuration. Row actions map to entity-level operations authorized by ENG-002 (Publication §11).

## 17. Dashboards

Dashboards render read-model KPIs from the Service Analytics & Compliance surface (§4.5). No dashboard writes state. Cross-module KPI definitions remain owned by MOD-017 Analytics (Publication §13).

## 18. Reports

Reports enumerated in Publication §3 (Ticket Volume, SLA Adherence, CSAT Trend, Agent Productivity) are rendered via ENG-021 with export via ENG-027 (Publication §11). No report is introduced beyond the Publication set.

## 19. Notifications

In-app and cross-channel notifications are emitted by ENG-025 (Publication §11) in response to Publication events (§9 Published Events), CSAT Survey dispatch (§4.4), escalation dispatch (§4.3), and read-only inbound reconciliations from consumed events (§10). The UI surfaces notifications; it does not define new event semantics.

## 20. Error Handling

Standard patterns: inline field errors, form-level banner, non-blocking toasts for transient errors, and a full-page error state with retry for infrastructure failures. All server errors carry a stable code consumed from the API (see API-016). Multi-channel integration errors (Email / Chat / WhatsApp / Voice) surface with actionable retry paths bounded by ENG-023 (Publication §4.2).

## 21. Loading States

Skeleton loaders for lists, hierarchy trees, and detail pages. Ticket categorization, SLA clock refresh, escalation execution, and read-model refresh show inline progress. Snapshot/report runs are long-running; progress is surfaced with polling.

## 22. Empty States

Every list/report defines an empty state with the primary create action when the user is authorized. Empty states never invent onboarding capabilities not present in the Publication.

## 23. Accessibility

Meets the Business OS accessibility baseline (ADR-081 as referenced by PRD §11): WCAG 2.1 AA color contrast, keyboard-only operation for every interactive element, ARIA landmarks and labels, and screen-reader announcements for async state changes (ticket create, ticket close, SLA breach, escalation trigger, knowledge article publish, CSAT response received).

## 24. Responsive Behaviour

Layouts adapt for desktop (≥1280px), laptop (≥1024px), and tablet landscape (≥900px). The Tickets and SLA workspaces are the primary agent surfaces. Mobile portrait is served by MOB-016.

## 25. Security

Enforced via ENG-001/002/003 (Publication §11) and ADR-011/032 (Publication §11): tenant isolation on every read/write, RBAC + ABAC on every mutation, CSRF and XSS protections at the shell, and PII-aware redaction on customer-facing fields where the caller's role does not carry the reveal grant.

## 26. Performance

Interactive operations complete within the platform latency budget (PRD §11). Ticket capture, categorization, and SLA clock refresh target sub-second server round-trip. Snapshot/report runs and read-model refresh execute within the platform batch envelope (PRD §11).

## 27. Audit Logging

Every state-changing action is emitted to ENG-004 (Publication §11) per ADR-014 (Audit Strategy). The UI never bypasses audit and never renders un-audited history. Macro execution, knowledge-article publish, escalation triggers, and CSAT dispatch/receipt are audited.

## 28. Acceptance Criteria & Traceability Matrix

WEB-016 is Accepted when every screen in §8 maps to a Publication anchor, every business rule in §13 restates Publication §6 verbatim, every event referenced in §19 maps exactly to Publication §9 / §10, and no screen, form, rule, report, or notification exists outside the Publication surface.

| Publication § | Anchor | WEB-016 Section |
| --- | --- | --- |
| §2 Purpose | Purpose | §1 |
| §3 Scope | Scope | §2, §4, §8 |
| §4.1 Foundation Authorities | Authorities | §8 #59–68 |
| §4.2 Ticket Capture & Lifecycle Authorities | Authorities | §8 #2–25 |
| §4.3 SLA & Escalation Authorities | Authorities | §8 #5, §8 #26–34 |
| §4.4 KB / Macros / CSAT Authorities | Authorities | §8 #18–19, §8 #35–51 |
| §4.5 Analytics & Compliance Authorities | Authorities | §8 #1, §8 #52–58 |
| §6 Business Rules | Rules | §12, §13 |
| §7 Master Data | Entities | §8 #35–44, §8 #59–64 |
| §8 Transactions | Transactions | §8 #2–34, §8 #48–51 |
| §9 Published Events | Events | §9, §19 |
| §10 Consumed Events | Events | §12, §13, §19, §8 #23–25 |
| §11 Engines | Engine consumption | §9, §11, §12, §14, §16, §18, §19, §25, §27 |
| §12 Dependencies | Cross-module | §14 (CRM lookups), §17 (KPI ownership), §19 (inbound feeds) |
| §13 Boundaries | Ownership | §13, §17 |
| §15 Non-Goals | Exclusions | §2 |
