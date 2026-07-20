---
title: "MOB-013 — Assets Mobile Solution Design"
summary: "Mobile Solution Design for MOD-013 Assets. Derives all mobile screens, flows, and behaviors exclusively from MOD-013 Module Publication."
spec_id: "MOB-013_SOLUTION_DESIGN"
module_id: "MOD-013"
module_name: "Assets"
platform: "mobile"
version: "1.0"
status: "Design Complete"
owner: "Operations"
source_publication: "docs/45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/assets/MODULE_PRD.md", "docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "mobile", "MOD-013", "assets", "MOB-013"]
document_type: "Mobile Solution Design"
---

# MOB-013 — Assets Mobile Solution Design

> **Source of Truth:** [`MOD-013 Module Publication`](../../../45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md). Every screen and behavior derives from the Publication.

## 1. Mobile Scope

Field-optimized surface of MOD-013 for smartphone use by Asset Managers and Maintenance staff performing on-site verifications, maintenance actions, and transfer captures. Derived from Publication §3–§9:

- Asset lookup and detail (read-only) for Asset, Asset Class, Location, Insurance Policy (Publication §7).
- Maintenance Order list and detail; approve / complete progression (Publication §8, §4.3); Publication `MaintenanceCompleted` remains an externally-sourced consumed event (§10) — mobile does not synthesize it, only reflects order closure.
- Asset Transfer capture (Publication §8, §4.3); emits `AssetTransferred` (Publication §9); only Location changes.
- Calibration cadence review (Publication §4.3).
- Notifications inbox (ENG-025) for Publication §9 events (`AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed`) and scheduled Depreciation / Maintenance / Calibration alerts authorized by Publication §3, §4.2, §4.3.

Not included on mobile: master authoring for Asset / Asset Class / Location / Insurance Policy (edit surfaces), Capitalization authoring and approvals, Depreciation Run authoring / approval / posting, Disposal authoring / approval / posting, reports and dashboards, audit-readiness surface, and Assets Configuration authoring (available on web only, per Publication §3 / §4.1 / §4.2 / §4.4).

## 2. Supported Platforms

iOS 16+ and Android 12+ smartphones. Tablet layouts fall back to WEB-013.

## 3. Navigation

Bottom tab bar: **Home**, **Assets**, **Maintenance**, **Transfers**, **Notifications**.

## 4. Mobile User Flows

- **Verify asset.** Home → Assets → search / scan → Asset Detail (read-only) — tabs Overview / Components / Insurance / Maintenance / History.
- **Approve maintenance order.** Notifications or Maintenance → Order → Approve; server enforces the approval step via ENG-011 (Publication §11).
- **Capture asset transfer.** Assets → Asset → Transfer → select new Location → save; emits `AssetTransferred` (Publication §9); only Location may change (Publication §4.3).
- **Review calibration cadence.** Maintenance → Calibration → asset → review; read-only (Publication §4.3).
- **View lifecycle notifications.** Notifications → item (`AssetCapitalized` / `DepreciationPosted` / `AssetTransferred` / `AssetDisposed` / scheduled Depreciation / Maintenance / Calibration).

## 5. Mobile Screens

| # | Screen | Publication Ref |
| --- | --- | --- |
| 1 | Home / Today | §3, §4.4 (dashboard subset) |
| 2 | Assets (search / scan) | §7 Asset |
| 3 | Asset Detail — Overview | §7 Asset |
| 4 | Asset Detail — Components | §7 Asset, §4.1 |
| 5 | Asset Detail — Insurance (read-only) | §7 Insurance Policy |
| 6 | Asset Detail — Maintenance (read-only) | §8 Maintenance Order |
| 7 | Asset Detail — History (read-only) | §11 ENG-004 |
| 8 | Maintenance Orders (my list) | §8 Maintenance Order |
| 9 | Maintenance Order Detail — Overview | §8, §4.3 |
| 10 | Maintenance Order Approve Action | §8, §4.3, §11 ENG-011 |
| 11 | Calibration Tracker (read-only) | §4.3 |
| 12 | Asset Transfer Create | §8 Asset Transfer, §4.3 |
| 13 | Asset Transfer Detail (read-only) | §8 Asset Transfer |
| 14 | Notifications Inbox | §9, §11 ENG-025 |

## 6. Forms

Mobile forms mirror the field set authorized by the Publication for the mobile transactions (Maintenance Order Approve; Asset Transfer Create). Field density is reduced for one-thumb use; no new fields are introduced. Attachment capture uses ENG-007 / ENG-008 per Publication §11 on Asset (documents) and Maintenance Order (work reports).

## 7. Offline Behaviour

Read-only cache for the user's asset subset, assigned maintenance orders, insurance lookup, calibration cadence subset, and notifications. Offline write is limited to:

- Asset Transfer create — deferred; reconciled on reconnect; `AssetTransferred` emitted server-side on reconciliation (Publication §9).
- Maintenance Order Approve — deferred; reconciled on reconnect; ENG-011 approval evaluated server-side (Publication §11).
- Notifications acknowledgement — deferred.

Deferred writes are queued and reconciled on reconnect; conflicts fall back to server state.

## 8. Synchronization

Delta-sync on app foreground, pull-to-refresh, and after any deferred-write reconciliation. Server timestamps drive last-write reconciliation. Sync scope is bounded to entities the user is authorized to see (ENG-002 per Publication §11).

## 9. Push Notifications

Emitted by ENG-025 (Publication §11) in response to Publication events (§9): `AssetCapitalized`, `DepreciationPosted`, `AssetTransferred`, `AssetDisposed` where the user is a subscriber for the asset / class / location. Scheduled Depreciation / Maintenance / Calibration alerts are emitted per Publication §3, §4.2, §4.3. No push event is introduced beyond Publication §9 / §3.

## 10. Camera Support

Attachment capture (evidence photos on Maintenance Order) via ENG-007 / ENG-008 (Publication §11). Barcode/QR scan for Asset lookup is a design-system convention that resolves against the Publication-defined Asset code (§7); no new Publication capability is introduced.

## 11. GPS Support

**N/A** — Publication §3, §4, §7, §8 do not authorize GPS or geo capture for Assets; PRD §8 External Systems does not list Maps / geo services. Asset Transfer changes Location only by reference to a Publication §7 Location master, not by geo coordinates.

## 12. Biometric Authentication

Device biometrics unlock the session and gate approval actions (Maintenance Order Approve); server-side auth remains delegated to ENG-001 (Publication §11).

## 13. Attachment Handling

Attachments upload via ENG-007 / ENG-008 (Publication §11) and follow the platform attachment policy. Uploads resume on reconnect.

## 14. Background Processing

Limited to deferred-write queue reconciliation, delta-sync of assigned asset / maintenance subset, and push notification handling. No long-running background tasks beyond platform sync (Publication §11).

## 15. Mobile Security

- Device biometrics unlock the session; server-side auth via ENG-001 (Publication §11).
- Tenant isolation and RBAC/ABAC via ENG-002/003 (Publication §11), ADR-011/032.
- Local cache encrypted at rest; wiped on sign-out or remote revocation.
- Cost-sensitive fields (capitalization amount, depreciation basis, disposal proceeds) redacted or gated per role.

## 16. Performance

Cold start ≤ 3s on target devices; list scroll 60fps; offline reads return immediately from cache.

## 17. Accessibility

Meets platform accessibility baseline: dynamic type, VoiceOver/TalkBack for every interactive element, high-contrast support, tap targets ≥ 44pt/48dp.

## 18. Acceptance Criteria & Publication Traceability Matrix

MOB-013 is Accepted when every screen in §5 maps to a Publication anchor, offline queue reconciles without data loss, push events are limited to Publication §9 plus Publication §3/§4.2/§4.3 scheduled alerts, GPS is excluded (§11) because the Publication does not authorize it, biometrics gate the session and approval actions, and accessibility/security baselines pass.

| Publication § | MOB-013 Section |
| --- | --- |
| §2 Purpose | §1 |
| §3 Scope | §1, §5 |
| §6 Business Rules | §4, §5, §7 (server-authoritative) |
| §7 Master Data | §5 (read-only detail; edit excluded per §1) |
| §8 Transactions | §5, §6 (Maintenance Order approve; Asset Transfer create) |
| §9 Published Events | §9 |
| §10 Consumed Events | (server-side; N/A on mobile) |
| §11 Engines | §7–§15 |
| §13 Boundaries | §1 (excluded surfaces), §11 (GPS N/A because Publication does not authorize), §13 (posting excluded) |
| §15 Non-Goals | §1 (no Capitalization / Depreciation / Disposal authoring on mobile; no reports / audit surface / config); digital twin and predictive maintenance excluded per Publication §15 |
