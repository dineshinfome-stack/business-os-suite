---
title: "MOB-014 — Fleet Mobile Solution Design"
summary: "Mobile Solution Design for MOD-014 Fleet. Derives all mobile screens, flows, and behaviors exclusively from MOD-014 Module Publication."
spec_id: "MOB-014_SOLUTION_DESIGN"
module_id: "MOD-014"
module_name: "Fleet"
platform: "mobile"
version: "1.0"
status: "Design Complete"
owner: "Operations"
source_publication: "docs/45-module-publications/fleet/MOD-014_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/fleet/MODULE_PRD.md", "docs/40-module-baselines/MOD014_FLEET_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "mobile", "MOD-014", "fleet", "MOB-014"]
document_type: "Mobile Solution Design"
---

# MOB-014 — Fleet Mobile Solution Design

> **Source of Truth:** [`MOD-014 Module Publication`](../../../45-module-publications/fleet/MOD-014_MODULE_PUBLICATION.md). Every screen and behavior derives from the Publication.

## 1. Mobile Scope

Field-optimized surface of MOD-014 for smartphone use by Drivers, Dispatchers, and Maintenance staff performing on-the-road trip execution, fuel capture, and maintenance actions. Derived from Publication §3–§9:

- Vehicle and Driver lookup and read-only detail (Publication §7).
- Trip Sheet list (my trips), detail, and lifecycle actions Start / Close (Publication §8, §4.2); Trip Sheet close emits `TripClosed` (§9) after odometer capture per §6.
- Fuel Entry capture (create / submit) at the fuel station (Publication §8, §4.3); server posts and emits `FuelRecorded` (§9); telematics reconciliation evaluated server-side per §6.
- Maintenance Order list and detail; approve / complete progression (Publication §8, §4.3); complete emits `MaintenanceCompleted` (§9).
- Compliance & Insurance read-only view for the assigned vehicle (Publication §3, §4.1).
- Notifications inbox (ENG-025) for Publication §9 events (`TripClosed`, `FuelRecorded`, `MaintenanceCompleted`, `ComplianceExpiring`) and scheduled Compliance / Maintenance alerts authorized by Publication §3, §4.1, §4.3.

Not included on mobile: master authoring for Vehicle / Driver / License / Route / Fuel Station (edit surfaces), compliance/insurance registration authoring, Fuel Entry reversal, reports and dashboards, audit-readiness surface, and Fleet Configuration authoring (available on web only, per Publication §3 / §4.1 / §4.3 / §4.4).

## 2. Supported Platforms

iOS 16+ and Android 12+ smartphones. Tablet layouts fall back to WEB-014.

## 3. Navigation

Bottom tab bar: **Home**, **Trips**, **Fuel**, **Maintenance**, **Notifications**.

## 4. Mobile User Flows

- **Start a trip.** Home → Trips → assigned trip → Start; server blocks if vehicle has expired critical compliance (Publication §6).
- **Close a trip.** Trips → in-progress trip → capture closing odometer → Close; server enforces `closing ≥ opening` (Publication §6) and emits `TripClosed` (§9).
- **Capture fuel entry.** Fuel → Create → select Vehicle + Fuel Station, enter quantity/amount, attach fuel slip → Submit; server posts and emits `FuelRecorded` (§9); telematics reconciliation runs server-side (§6).
- **Approve / complete maintenance.** Notifications or Maintenance → Order → Approve → Complete; complete emits `MaintenanceCompleted` (§9).
- **View compliance status.** Trips → Vehicle → Compliance (read-only); alerts arrive via Notifications (§9 `ComplianceExpiring`).

## 5. Mobile Screens

| # | Screen | Publication Ref |
| --- | --- | --- |
| 1 | Home / Today | §3, §4.4 (dashboard subset) |
| 2 | Trips (my list) | §8 Trip Sheet |
| 3 | Trip Sheet Detail — Overview | §8, §4.2 |
| 4 | Trip Sheet Detail — Assignment (read-only) | §8, §4.2 |
| 5 | Trip Sheet Start Action | §8, §4.2, §6 (compliance gate) |
| 6 | Trip Sheet Close Action (odometer capture) | §8, §4.2, §6 (odometer rule) |
| 7 | Fuel Entries (my list) | §8 Fuel Entry |
| 8 | Fuel Entry Create | §8, §4.3 |
| 9 | Fuel Entry Detail (read-only) | §8, §4.3 |
| 10 | Maintenance Orders (my list) | §8 Maintenance Order |
| 11 | Maintenance Order Detail | §8, §4.3 |
| 12 | Maintenance Order Approve Action | §8, §4.3, §11 ENG-011 |
| 13 | Maintenance Order Complete Action | §8, §4.3; emits `MaintenanceCompleted` (§9) |
| 14 | Vehicle Detail — Overview (read-only) | §7 Vehicle |
| 15 | Vehicle Detail — Compliance (read-only) | §3, §4.1 |
| 16 | Notifications Inbox | §9, §11 ENG-025 |

## 6. Forms

Mobile forms mirror the field set authorized by the Publication for the mobile transactions (Trip Sheet Close odometer capture; Fuel Entry Create; Maintenance Order Approve / Complete). Field density is reduced for one-thumb use; no new fields are introduced. Attachment capture uses ENG-007 / ENG-008 per Publication §11 on Trip Sheet (proof), Fuel Entry (fuel slip), and Maintenance Order (work report).

## 7. Offline Behaviour

Read-only cache for the user's assigned trip / fuel / maintenance subset, vehicle compliance summary, and notifications. Offline write is limited to:

- Trip Sheet Start / Close — deferred; reconciled on reconnect; compliance and odometer rules evaluated server-side (Publication §6); `TripClosed` emitted server-side on reconciliation (Publication §9).
- Fuel Entry create/submit — deferred; reconciled on reconnect; `FuelRecorded` emitted server-side on post (Publication §9).
- Maintenance Order Approve / Complete — deferred; reconciled on reconnect; ENG-011 approval evaluated server-side (Publication §11); `MaintenanceCompleted` emitted server-side on complete (Publication §9).
- Notifications acknowledgement — deferred.

Deferred writes are queued and reconciled on reconnect; conflicts fall back to server state.

## 8. Synchronization

Delta-sync on app foreground, pull-to-refresh, and after any deferred-write reconciliation. Server timestamps drive last-write reconciliation. Sync scope is bounded to entities the user is authorized to see (ENG-002 per Publication §11).

## 9. Push Notifications

Emitted by ENG-025 (Publication §11) in response to Publication events (§9): `TripClosed`, `FuelRecorded`, `MaintenanceCompleted`, `ComplianceExpiring` where the user is a subscriber for the vehicle / driver / route. Scheduled Compliance and Maintenance alerts are emitted per Publication §3, §4.1, §4.3. No push event is introduced beyond Publication §9 / §3.

## 10. Camera Support

Attachment capture (odometer photo on Trip Sheet close; fuel slip on Fuel Entry; evidence photos on Maintenance Order) via ENG-007 / ENG-008 (Publication §11). Barcode/QR scan for Vehicle and Fuel Station lookup is a design-system convention that resolves against Publication-defined codes (§7); no new Publication capability is introduced.

## 11. GPS Support

Publication §8 authorizes GPS/telematics as an external system category (PRD §8). Mobile GPS support is scoped exclusively to Trip Sheet execution (Publication §8, §4.2): the device captures location samples for the in-progress trip, which the server surfaces to the Telematics Reconciliation workspace (Publication §4.3, §6). GPS capture is not used to redefine Publication master data or transactions; it does not introduce new events. GPS is disabled outside a trip's in-progress window.

## 12. Biometric Authentication

Device biometrics unlock the session and gate approval and post actions (Trip Sheet Close, Fuel Entry Submit, Maintenance Order Approve / Complete); server-side auth remains delegated to ENG-001 (Publication §11).

## 13. Attachment Handling

Attachments upload via ENG-007 / ENG-008 (Publication §11) and follow the platform attachment policy. Uploads resume on reconnect.

## 14. Background Processing

Limited to deferred-write queue reconciliation, delta-sync of assigned trip / fuel / maintenance subset, GPS sampling during an in-progress Trip Sheet (Publication §4.2), and push notification handling. No long-running background tasks beyond platform sync (Publication §11).

## 15. Mobile Security

- Device biometrics unlock the session; server-side auth via ENG-001 (Publication §11).
- Tenant isolation and RBAC/ABAC via ENG-002/003 (Publication §11), ADR-011/032.
- Local cache encrypted at rest; wiped on sign-out or remote revocation.
- Cost-sensitive fields (fuel cost, maintenance cost) redacted or gated per role.
- GPS samples are transmitted only while a trip is in-progress and are bounded to the assigned Vehicle/Driver context.

## 16. Performance

Cold start ≤ 3s on target devices; list scroll 60fps; offline reads return immediately from cache.

## 17. Accessibility

Meets platform accessibility baseline: dynamic type, VoiceOver/TalkBack for every interactive element, high-contrast support, tap targets ≥ 44pt/48dp.

## 18. Acceptance Criteria & Publication Traceability Matrix

MOB-014 is Accepted when every screen in §5 maps to a Publication anchor, offline queue reconciles without data loss, push events are limited to Publication §9 plus Publication §3/§4.1/§4.3 scheduled alerts, GPS is bounded to in-progress Trip Sheet execution authorized by Publication §8/§4.2/§4.3, biometrics gate the session and mutation actions, and accessibility/security baselines pass.

| Publication § | MOB-014 Section |
| --- | --- |
| §2 Purpose | §1 |
| §3 Scope | §1, §5 |
| §6 Business Rules | §4, §5, §7 (server-authoritative) |
| §7 Master Data | §5 (read-only detail; edit excluded per §1) |
| §8 Transactions | §5, §6 (Trip Sheet Start/Close; Fuel Entry Create; Maintenance Order Approve/Complete) |
| §9 Published Events | §9 |
| §10 Consumed Events | (server-side; N/A on mobile) |
| §11 Engines | §7–§15 |
| §13 Boundaries | §1 (excluded surfaces), §13 (posting excluded); §15 (KPI ownership at MOD-017) |
| §15 Non-Goals | §1 (no master authoring on mobile; no reports / audit surface / config); telematics-driven scoring and AI route optimization excluded per Publication §15 |
