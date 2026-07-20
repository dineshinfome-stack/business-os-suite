---
title: "MOB-016 — Service Desk Mobile Solution Design"
summary: "Mobile Solution Design for MOD-016 Service Desk. Derives all mobile screens, flows, and behaviors exclusively from MOD-016 Module Publication."
spec_id: "MOB-016_SOLUTION_DESIGN"
module_id: "MOD-016"
module_name: "Service Desk"
platform: "mobile"
version: "1.0"
status: "Design Complete"
owner: "Service"
source_publication: "docs/45-module-publications/service-desk/MOD-016_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/service-desk/MODULE_PRD.md", "docs/40-module-baselines/MOD016_SERVICE_DESK_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "mobile", "MOD-016", "service-desk", "MOB-016"]
document_type: "Mobile Solution Design"
---

# MOB-016 — Service Desk Mobile Solution Design

> **Source of Truth:** [`MOD-016 Module Publication`](../../../45-module-publications/service-desk/MOD-016_MODULE_PUBLICATION.md). Every screen and behavior derives from the Publication.

## 1. Mobile Scope

Handheld surface of MOD-016 Service Desk for smartphone use by Support Agents and Support Managers performing on-the-go ticket triage, response, macro application, approvals, and observation. Derived from Publication §3–§9:

- Ticket queue and detail with reply, reassign, categorize/route action, macro apply, and close (Publication §4.2, §6); Close is blocked with open child tasks (§6); server emits `ServiceTicketCreated` / `ServiceTicketClosed` (§9).
- Ticket create (manual / agent-initiated) with multi-channel context read-only (Publication §4.2, §11 ENG-023); intake screens for Email / Chat / WhatsApp / Voice remain server-driven captures.
- SLA Clock read on ticket detail; SLA Breach Event queue and detail; escalation approve action where configured via ENG-011 (Publication §4.3, §11).
- Knowledge Article read-only for on-call lookup; submit-for-review and approve/reject actions where configured via ENG-011 (Publication §4.4, §6).
- CSAT Survey status and CSAT Response read-only per Publication §4.4.
- Notifications inbox (ENG-025) for Publication §9 events and read-only inbound reconciliations from consumed events (§10).

Not included on mobile: Ticket Category / SLA Policy / Knowledge Article master authoring beyond review actions, Macro authoring, Service Desk configuration (routing rules, escalation matrices, business hours, numbering), reports and dashboards, and audit-readiness surface (available on web only, per Publication §3 / §4.1 / §4.5).

## 2. Supported Platforms

iOS 16+ and Android 12+ smartphones. Tablet layouts fall back to WEB-016.

## 3. Navigation

Bottom tab bar: **Tickets**, **SLA**, **Knowledge**, **CSAT**, **Notifications**.

## 4. Mobile User Flows

- **Triage and reply to a ticket.** Tickets → ticket → reply → categorize/route → assign (Publication §4.2); server emits state changes.
- **Apply a macro.** Ticket detail → Apply Macro → pick from Publication-defined macros; server emits `MacroExecuted` (§9); ticket history unchanged (Publication §4.4).
- **Close a ticket.** Ticket detail → Close; server blocks if open child tasks (§6); on success emits `ServiceTicketClosed` (§9).
- **Approve an escalation.** SLA → SLA Breach Event → Approve (via ENG-011 where configured); server emits `EscalationTriggered` (§9) on trigger.
- **Approve a knowledge article.** Knowledge → article → Approve or Reject (Publication §4.4, §6); server publishes only after review approval; Publish emits `KnowledgeArticlePublished` (§9).
- **Observe SLA state.** Ticket → SLA tab; UI reflects server-authoritative pause/resume state; server emits `SLAPaused` / `SLAResumed` / `SLABreached` (§9).
- **Read CSAT response.** CSAT → survey → response; server-emitted `CSATSurveySent` / `CSATResponseReceived` (§9).
- **Read inbound feed.** Notifications → tap `FieldVisitCompleted` / `CustomerCreated` / `OpportunityWon` alert → linked ticket (§10, §4.2).

## 5. Mobile Screens

| # | Screen | Publication Ref |
| --- | --- | --- |
| 1 | Tickets — My Queue | §8 Service Ticket |
| 2 | Ticket Detail — Overview | §8, §4.2 |
| 3 | Ticket Detail — Conversation | §4.2, §11 ENG-023 |
| 4 | Ticket Detail — SLA | §4.3 |
| 5 | Ticket Detail — Child Tickets | §4.2, §6 |
| 6 | Ticket Reply / Reassign | §4.2 |
| 7 | Ticket Categorize / Route Action | §4.2, §11 ENG-012 |
| 8 | Ticket Apply Macro Action | §4.4; emits `MacroExecuted` (§9) |
| 9 | Ticket Attach Knowledge Article | §4.4 |
| 10 | Ticket Create (Manual / Agent) | §4.2; emits `ServiceTicketCreated` (§9) |
| 11 | Ticket Close Action | §8, §4.2, §6; emits `ServiceTicketClosed` (§9) |
| 12 | SLA Breach Events — List | §8 SLA Breach Event |
| 13 | SLA Breach Event Detail | §8, §4.3 |
| 14 | Escalation Approve Action | §4.3, §11 ENG-011; emits `EscalationTriggered` (§9) |
| 15 | Knowledge Articles — Search / Read | §7, §4.4, §11 ENG-020 |
| 16 | Knowledge Article Approve / Reject Action | §4.4, §6, §11 ENG-011 |
| 17 | Knowledge Article Publish Action | §4.4, §6; emits `KnowledgeArticlePublished` (§9) |
| 18 | CSAT Surveys — List (read-only) | §4.4 |
| 19 | CSAT Response Detail (read-only) | §8, §4.4 |
| 20 | Notifications Inbox | §9, §10, §11 ENG-025 |

## 6. Forms

Mobile forms mirror the field set authorized by the Publication for the mobile transactions (reply body, reassignment target, category, route, macro selection, close reason, escalation approve/reject, article review approve/reject, and manual ticket create). Field density is reduced for one-thumb use; no new fields are introduced. Attachment capture uses ENG-008 per Publication §11 on Service Ticket (evidence / screenshot).

## 7. Offline Behaviour

Publication §11 does not authorize an offline Service Desk operation surface (no Offline Sale-style authority appears in Publication §4). On mobile, the app supports read-only cached views of the agent's queue and ticket details on last-sync; write actions (reply, categorize, route, assign, macro apply, close, approvals, publish) require connectivity. Deferred writes are not supported. **Offline operation beyond read-only caching:** N/A per Publication §4 (no offline-write authority declared).

## 8. Synchronization

Delta-sync on app foreground, pull-to-refresh, and after any authorized write. Server timestamps drive last-write reconciliation. Sync scope is bounded to entities the user is authorized to see (ENG-002 per Publication §11), including the agent's own tickets, queues, and articles.

## 9. Push Notifications

Emitted by ENG-025 (Publication §11) in response to Publication events (§9): `ServiceTicketCreated`, `ServiceTicketClosed`, `SLAPaused`, `SLAResumed`, `SLABreached`, `EscalationTriggered`, `KnowledgeArticlePublished`, `MacroExecuted`, `CSATSurveySent`, `CSATResponseReceived`, `AnalyticsSnapshotGenerated`, `ComplianceReportGenerated`. Inbound-feed alerts from consumed events (`FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon`) surface as notifications per Publication §10. No push event is introduced beyond Publication §9 / §10.

## 10. Camera Support

Attachment capture (evidence / screenshot on Service Ticket) via ENG-008 (Publication §11). Barcode/QR scan is a design-system convention that resolves against Publication-defined codes (§7); no new Publication capability is introduced.

## 11. GPS Support

**N/A.** Publication §7 authorizes no GPS-dependent master data or transaction. Publication §11 does not consume a GPS/telematics engine. Publication §12–§13 record no GPS-derived boundary. Mobile therefore does not capture or transmit GPS.

## 12. Biometric Authentication

Device biometrics unlock the session and gate approval / mutation actions (Ticket Close, Escalation Approve, Knowledge Article Approve/Reject/Publish, Macro Apply); server-side auth remains delegated to ENG-001 (Publication §11).

## 13. Attachment Handling

Attachments upload via ENG-008 (Publication §11) and follow the platform attachment policy. Uploads require connectivity (no offline queue — see §7).

## 14. Background Processing

Limited to delta-sync of the agent's assigned queue subset, notification handling, and push notification dispatch. No long-running background tasks beyond platform sync (Publication §11).

## 15. Mobile Security

- Device biometrics unlock the session; server-side auth via ENG-001 (Publication §11).
- Tenant isolation and RBAC/ABAC via ENG-002/003 (Publication §11), ADR-011/032.
- Local cache encrypted at rest; wiped on sign-out or remote revocation.
- PII-aware redaction on customer-visible fields where the caller's role does not carry the reveal grant.

## 16. Performance

Cold start ≤ 3s on target devices; ticket list scroll 60fps; reply/apply-macro/close target sub-second server round-trip when online.

## 17. Accessibility

Meets platform accessibility baseline: dynamic type, VoiceOver/TalkBack for every interactive element, high-contrast support, tap targets ≥ 44pt/48dp, and screen-reader announcements on ticket close, SLA breach, escalation trigger, knowledge article publish, and CSAT response received.

## 18. Acceptance Criteria & Publication Traceability Matrix

MOB-016 is Accepted when every screen in §5 maps to a Publication anchor, offline write is `N/A` per Publication §4, push events are limited to Publication §9 / §10, biometrics gate the session and mutation actions, GPS is `N/A` per §11, and accessibility/security baselines pass.

| Publication § | MOB-016 Section |
| --- | --- |
| §2 Purpose | §1 |
| §3 Scope | §1, §5 |
| §6 Business Rules | §4, §5, §7 (server-authoritative) |
| §7 Master Data | §5 #15 (Knowledge Article read/review); Category / Policy authoring excluded per §1 |
| §8 Transactions | §5, §4 (Service Ticket, SLA Breach Event, CSAT Response) |
| §9 Published Events | §9 |
| §10 Consumed Events | §9 (`FieldVisitCompleted`, `CustomerCreated`, `OpportunityWon`); §4 (inbound-feed alerts) |
| §11 Engines | §7–§15 |
| §13 Boundaries | §1 (excluded surfaces); §15 (no posting); §15 (KPI ownership at MOD-017) |
| §15 Non-Goals | §1 (no config, no reports, no audit surface); AI triage and community forums excluded per Publication §15 |
