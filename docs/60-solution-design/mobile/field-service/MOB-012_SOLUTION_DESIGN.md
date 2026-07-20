---
title: "MOB-012 — Field Service Mobile Solution Design"
summary: "Mobile Solution Design for MOD-012 Field Service. Derives all mobile screens, flows, and behaviors exclusively from MOD-012 Module Publication."
spec_id: "MOB-012_SOLUTION_DESIGN"
module_id: "MOD-012"
module_name: "Field Service"
platform: "mobile"
version: "1.0"
status: "Design Complete"
owner: "Service"
source_publication: "docs/45-module-publications/field-service/MOD-012_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/field-service/MODULE_PRD.md", "docs/40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "mobile", "MOD-012", "field-service", "MOB-012"]
document_type: "Mobile Solution Design"
---

# MOB-012 — Field Service Mobile Solution Design

> **Source of Truth:** [`MOD-012 Module Publication`](../../../45-module-publications/field-service/MOD-012_MODULE_PUBLICATION.md). Every screen and behavior derives from the Publication.

## 1. Mobile Scope

Field-technician-optimized surface of MOD-012 for smartphone use. Derived from Publication §3–§9:

- Assigned Visits list and detail (Publication §8 Visit, §4.2, §4.3).
- Visit execution: dispatch-phase transitions (`assigned → en route → on site`) and completion (`on site → completed`) gated by the signature/checklist rule (Publication §6, §4.2, §4.3).
- Spare Consumption capture (Publication §8, §4.3); emits `SpareConsumed` (Publication §9); Item read-only via MOD-005 (Publication §13).
- Closure Report authoring with signature capture and attachments (Publication §8, §4.3; ENG-007 / ENG-008 per §11).
- Field Ticket lookup (read-only reference) for the technician's assigned tickets (Publication §8 Field Ticket).
- Notifications inbox (ENG-025) for Publication §9 events (`FieldTicketCreated` where relevant, `VisitAssigned`, `FieldVisitCompleted`, `SpareConsumed`) and SLA/escalation alerts authorized by Publication §3, §4.4.

Not included on mobile: master authoring for Technician / Skill / Territory / Ticket Type / SLA Policy, Dispatch Board back-office authoring, scheduled dispatch configuration, reports and dashboards, audit-readiness surface, and Field Service Configuration authoring (available on web only).

## 2. Supported Platforms

iOS 16+ and Android 12+ smartphones. Tablet layouts fall back to WEB-012.

## 3. Navigation

Bottom tab bar: **Home**, **Visits**, **Tickets**, **Spares**, **Notifications**.

## 4. Mobile User Flows

- **Start assigned visit.** Home → Visits → Visit → Start (`assigned → en route`) → Arrive (`en route → on site`); server enforces dispatch-phase transitions via ENG-010 (Publication §11).
- **Consume spare during visit.** Visit → Spares → Add → select Item (read-only from MOD-005) → save; emits `SpareConsumed` (Publication §9).
- **Complete visit.** Visit → Signatures/Checklist → Closure Report → Complete; server enforces the signature/checklist rule per Publication §6, emits `FieldVisitCompleted` (Publication §9).
- **Lookup ticket.** Tickets → search → Ticket → Overview / Visits / Spares / Closure (read-only).
- **View SLA / escalation.** Visit or Ticket → SLA tab (read-only surface of the SLA clock and escalation state, Publication §3, §4.4).

## 5. Mobile Screens

| # | Screen | Publication Ref |
| --- | --- | --- |
| 1 | Home / Today | §3, §4.2, §4.5 |
| 2 | Visits (my list) | §8 Visit, §4.2 |
| 3 | Visit Detail — Overview | §8, §4.2, §4.3 |
| 4 | Visit Detail — Dispatch (Start / Arrive) | §8, §4.2 |
| 5 | Visit Detail — Execution | §8, §4.3 |
| 6 | Visit Detail — Spares | §8 Spare Consumption, §4.3 |
| 7 | Visit Detail — Signatures/Checklist | §6, §4.3 |
| 8 | Visit Detail — Closure Report | §8 Closure Report, §4.3 |
| 9 | Visit Complete Action | §6, §8, §4.3 |
| 10 | Spare Consumption Create | §8, §4.3 |
| 11 | Spare Consumption Detail | §8, §4.3 |
| 12 | Tickets (assigned; search) | §8 Field Ticket |
| 13 | Ticket Detail — Overview | §8 |
| 14 | Ticket Detail — Visits (read-only) | §8 Visit |
| 15 | Ticket Detail — SLA (read-only) | §3, §4.4 |
| 16 | Notifications Inbox | §9, §11 ENG-025 |

## 6. Forms

Mobile forms mirror the field set authorized by the Publication for the mobile transactions (Visit Start / Arrive / Complete; Spare Consumption Create; Closure Report Author). Field density is reduced for one-thumb use; no new fields are introduced. Attachment capture uses ENG-007 / ENG-008 per Publication §11 on Visit Execution (evidence photos), Spare Consumption (photos), and Closure Report (signature/photo).

## 7. Offline Behaviour

Read-only cache for the technician's assigned visits, tickets, item lookup subset (from MOD-005), and notifications. Offline write is limited to:

- Visit dispatch-phase transitions (Start / Arrive) — deferred; reconciled on reconnect.
- Spare Consumption create — deferred; reconciled on reconnect; `SpareConsumed` emitted server-side on reconciliation (Publication §9).
- Closure Report authoring (draft) — deferred; final complete requires online connectivity to guarantee server-authoritative rule evaluation (Publication §6 signature/checklist rule, §11 ENG-010/ENG-012).
- Notifications acknowledgement — deferred.

Deferred writes are queued and reconciled on reconnect; conflicts fall back to server state.

## 8. Synchronization

Delta-sync on app foreground, pull-to-refresh, and after any deferred-write reconciliation. Server timestamps drive last-write reconciliation. Sync scope is bounded to entities the user is authorized to see (ENG-002 per Publication §11).

## 9. Push Notifications

Emitted by ENG-025 (Publication §11) in response to Publication events (§9): `VisitAssigned` (assigned technician), `FieldVisitCompleted` (assigned technician and dispatcher of record), `SpareConsumed` (assigned technician), and, where the user is a Ticket owner/assignee, `FieldTicketCreated`. SLA/escalation notifications are emitted per Publication §3, §4.4 (SLA policies, escalation workflows). No push event is introduced beyond Publication §9 / §3.

## 10. Camera Support

Attachment capture (evidence photos on Visit Execution and Spare Consumption; signature/photo on Closure Report) via ENG-007 / ENG-008 (Publication §11). Barcode/QR scan for spare-item lookup is a design-system convention that resolves against the MOD-005 Item read-model (Publication §13); no new Publication capability is introduced.

## 11. GPS Support

Authorized by the Publication for Field Service — MOD-012 owns the Visit dispatch and completion lifecycles and mobile visit execution (Publication §3, §4.2, §4.3), and PRD §8 lists Maps / geo services under External Systems. Used for: assigned-visit map view, `en route → on site` arrival capture (advisory), and optional geo-tag on Visit Execution / Spare Consumption / Closure Report attachments. Location processing is on-device; the mobile app never bypasses server-authoritative validation of Publication §6 rules.

## 12. Biometric Authentication

Device biometrics unlock the session and gate Closure Report signature actions; server-side auth remains delegated to ENG-001 (Publication §11).

## 13. Attachment Handling

Attachments upload via ENG-007 / ENG-008 (Publication §11) and follow the platform attachment policy. Uploads resume on reconnect.

## 14. Background Processing

Limited to deferred-write queue reconciliation, delta-sync of assigned visits/tickets, and push notification handling. No long-running background tasks beyond platform sync (Publication §11).

## 15. Mobile Security

- Device biometrics unlock the session; server-side auth via ENG-001 (Publication §11).
- Tenant isolation and RBAC/ABAC via ENG-002/003 (Publication §11), ADR-011/032.
- Local cache encrypted at rest; wiped on sign-out or remote revocation.
- Cost-sensitive fields (labour rate, spare unit cost) redacted or gated per role.

## 16. Performance

Cold start ≤ 3s on target devices; list scroll 60fps; offline reads return immediately from cache.

## 17. Accessibility

Meets platform accessibility baseline: dynamic type, VoiceOver/TalkBack for every interactive element, high-contrast support, tap targets ≥ 44pt/48dp.

## 18. Acceptance Criteria & Publication Traceability Matrix

MOB-012 is Accepted when every screen in §5 maps to a Publication anchor, offline queue reconciles without data loss, push events are limited to Publication §9 plus Publication §3/§4.4 SLA/escalation notifications, GPS is used only for Publication-authorized visit execution surfaces, biometrics gate the session and Closure Report signature, and accessibility/security baselines pass.

| Publication § | MOB-012 Section |
| --- | --- |
| §2 Purpose | §1 |
| §3 Scope | §1, §5 |
| §6 Business Rules | §4, §5, §7 (server-authoritative) |
| §7 Master Data | §5 (Item read-only via MOD-005; other masters excluded per §1) |
| §8 Transactions | §5, §6 |
| §9 Published Events | §9 |
| §10 Consumed Events | (server-side; N/A on mobile) |
| §11 Engines | §7–§15 |
| §13 Boundaries | §1 (excluded surfaces), §10 (Item read-only), §11 (GPS bounded to Publication authorization) |
| §15 Non-Goals | §1 (no master authoring / reports / audit surface / config on mobile); offline-first beyond platform baseline excluded per Publication §15 |
