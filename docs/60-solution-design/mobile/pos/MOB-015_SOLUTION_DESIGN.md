---
title: "MOB-015 — POS Mobile Solution Design"
summary: "Mobile Solution Design for MOD-015 POS. Derives all mobile screens, flows, and behaviors exclusively from MOD-015 Module Publication."
spec_id: "MOB-015_SOLUTION_DESIGN"
module_id: "MOD-015"
module_name: "POS"
platform: "mobile"
version: "1.0"
status: "Design Complete"
owner: "Revenue"
source_publication: "docs/45-module-publications/pos/MOD-015_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/pos/MODULE_PRD.md", "docs/40-module-baselines/MOD015_POS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "mobile", "MOD-015", "pos", "MOB-015"]
document_type: "Mobile Solution Design"
---

# MOB-015 — POS Mobile Solution Design

> **Source of Truth:** [`MOD-015 Module Publication`](../../../45-module-publications/pos/MOD-015_MODULE_PUBLICATION.md). Every screen and behavior derives from the Publication.

## 1. Mobile Scope

Handheld surface of MOD-015 POS for smartphone use by Cashiers and Store Managers performing on-floor cart composition, sale completion, returns, and shift/day-close actions. Derived from Publication §3–§9:

- Counter workspace with cart composition, discount capture, and multi-tender payment (Publication §4.2, §4.3); POS Sale Complete emits `POSSaleCompleted` (§9).
- POS Return create referencing an original POS Sale within the configured return window; approve/complete progression emits `POSReturnProcessed` (§9) per §4.4, §6.
- Cash Deposit capture and Day Close submit/post; mismatched-cash approval routed to a supervisor via ENG-011 (§4.5, §6); Day Close post emits `POSDayClosed` (§9).
- Offer / Loyalty / Gift-Card application on the active cart from Publication-authorized offers (§4.4, §10 `OfferPublished`).
- Store / Counter / Offer / Loyalty Program read-only detail for on-floor lookup (Publication §7).
- Receipt preview, digital receipt notification via ENG-025 (§4.3, §11), and receipt reprint request.
- Notifications inbox (ENG-025) for Publication §9 events (`POSSaleCompleted`, `POSReturnProcessed`, `POSDayClosed`) and consumed `InventoryLowStock` alerts on cart items (§10).

Not included on mobile: Store / Counter / Offer / Loyalty Program master authoring (edit surfaces), POS Configuration authoring, reports and dashboards, audit-readiness surface, and offline sale reconciliation workspace (available on web only, per Publication §3 / §4.1 / §4.5).

## 2. Supported Platforms

iOS 16+ and Android 12+ smartphones. Tablet layouts fall back to WEB-015 Counter Workspace.

## 3. Navigation

Bottom tab bar: **Counter**, **Sales**, **Returns**, **Day Close**, **Notifications**.

## 4. Mobile User Flows

- **Complete a sale.** Counter → add items → apply offer/loyalty/gift-card → capture payment (cash/card/digital/mixed) → Complete; supervisor override captured inline when a discount beyond threshold is applied (Publication §6); server emits `POSSaleCompleted` (§9).
- **Reprint / resend receipt.** Sales → sale → Receipt → Reprint or Send (via ENG-025); reprint audited (Publication §4.3, §11).
- **Process a return.** Returns → Create → reference original POS Sale (server enforces Return-Window Rule §6) → Approve → Complete; server emits `POSReturnProcessed` (§9).
- **Capture cash deposit.** Day Close → Cash Deposit → Create → Submit; supervisor approval routed if required (§4.5).
- **Close day.** Day Close → Submit → capture cash counts; mismatch beyond tolerance triggers supervisor approval (§6); Post emits `POSDayClosed` (§9).
- **Read low-stock alert.** Notifications → tap `InventoryLowStock` alert → view affected item on the active cart (§10, §4.5).

## 5. Mobile Screens

| # | Screen | Publication Ref |
| --- | --- | --- |
| 1 | Counter — Active Cart | §4.2, §4.3, §4.4 |
| 2 | Cart — Add Line (item lookup) | §4.2; §12 (Inventory read-only) |
| 3 | Cart — Apply Discount | §4.2, §6 (supervisor-override) |
| 4 | Cart — Apply Offer / Loyalty / Gift Card | §4.4, §10 |
| 5 | Payment Capture — Cash | §4.3 |
| 6 | Payment Capture — Card / Digital | §4.3, §11 ENG-023 |
| 7 | Payment Capture — Mixed / Split | §4.3 |
| 8 | POS Sale Complete Action | §8, §4.2, §4.3; emits `POSSaleCompleted` (§9) |
| 9 | Receipt Preview | §4.3 |
| 10 | Receipt Reprint / Resend Action | §4.3, §11 ENG-025 |
| 11 | Sales — My List | §8 POS Sale |
| 12 | POS Sale Detail (read-only) | §8, §4.2, §4.3 |
| 13 | Returns — List | §8 POS Return |
| 14 | POS Return Create (reference original sale) | §8, §4.4, §6 |
| 15 | POS Return Approve Action | §8, §4.4, §11 ENG-011 |
| 16 | POS Return Complete Action | §8, §4.4; emits `POSReturnProcessed` (§9) |
| 17 | Cash Deposits — My List | §8 Cash Deposit |
| 18 | Cash Deposit Create / Submit | §8, §4.5 |
| 19 | Day Close — Today | §8 Day Close |
| 20 | Day Close Submit — Cash Reconciliation | §8, §4.5, §6 |
| 21 | Day Close Post Action | §8, §4.5; emits `POSDayClosed` (§9) |
| 22 | Store / Counter Detail (read-only) | §7 |
| 23 | Offer / Loyalty Program Detail (read-only) | §7 |
| 24 | Notifications Inbox | §9, §10, §11 ENG-025 |

## 6. Forms

Mobile forms mirror the field set authorized by the Publication for the mobile transactions (cart lines, discount, offer/loyalty/gift-card, tender capture, sale complete, return create/approve/complete, cash deposit, day close). Field density is reduced for one-thumb use; no new fields are introduced. Attachment capture uses ENG-007 per Publication §11 on POS Sale (receipt artifact), POS Return (proof photo), and Day Close (deposit slip).

## 7. Offline Behaviour

Publication §4.2 authorizes Offline Sale Capture under the configured offline mode policy with deterministic reconciliation on reconnect. On mobile:

- POS Sale — captured offline per policy; server reconciles deterministically on reconnect (Publication §4.2); `POSSaleCompleted` emitted server-side on reconciliation (Publication §9).
- Discount, offer/loyalty/gift-card application — captured with the offline sale; supervisor-override enforcement re-evaluated server-side on reconnect (Publication §6).
- POS Return — deferred; return-window rule evaluated server-side on reconnect (Publication §6); `POSReturnProcessed` emitted server-side on complete.
- Cash Deposit and Day Close — deferred; mismatched-cash approval evaluated server-side on reconnect (Publication §6); `POSDayClosed` emitted server-side on post.
- Notifications acknowledgement — deferred.

Deferred writes are queued and reconciled on reconnect; conflicts fall back to server state. The web Offline Sale Reconciliation Workspace (WEB-015 §8 #42) remains the authoritative reconciliation surface.

## 8. Synchronization

Delta-sync on app foreground, pull-to-refresh, and after any deferred-write reconciliation. Server timestamps drive last-write reconciliation. Sync scope is bounded to entities the user is authorized to see (ENG-002 per Publication §11), including the cashier's own sales/returns/deposits and the counter's configuration.

## 9. Push Notifications

Emitted by ENG-025 (Publication §11) in response to Publication events (§9): `POSSaleCompleted`, `POSReturnProcessed`, `POSDayClosed` (as receipt/state alerts to the cashier and to store manager approvers), plus receipt notifications authorized by Publication §4.3 and `InventoryLowStock` alerts consumed from Publication §10. No push event is introduced beyond Publication §9 / §10 / §4.3.

## 10. Camera Support

Attachment capture (receipt artifact, return proof photo, deposit slip photo) via ENG-007 (Publication §11). Barcode/QR scan for item lookup on the cart and for gift-card / loyalty code entry is a design-system convention that resolves against Publication-defined codes (§7) and against MOD-005 Inventory read-only (Publication §12); no new Publication capability is introduced.

## 11. GPS Support

**N/A.** Publication §7 authorizes no GPS-dependent master data or transaction. Publication §11 does not consume a GPS/telematics engine. Publication §12–§13 record no GPS-derived boundary. Mobile therefore does not capture or transmit GPS.

## 12. Biometric Authentication

Device biometrics unlock the session and gate approval / mutation actions (POS Sale Complete when supervisor override is captured, POS Return Approve, Day Close Post, Receipt Reprint); server-side auth remains delegated to ENG-001 (Publication §11).

## 13. Attachment Handling

Attachments upload via ENG-007 (Publication §11) and follow the platform attachment policy. Uploads resume on reconnect.

## 14. Background Processing

Limited to deferred-write queue reconciliation, delta-sync of the cashier's assigned counter subset, receipt-notification dispatch (via ENG-025), and push notification handling. No long-running background tasks beyond platform sync (Publication §11).

## 15. Mobile Security

- Device biometrics unlock the session; server-side auth via ENG-001 (Publication §11).
- Tenant isolation and RBAC/ABAC via ENG-002/003 (Publication §11), ADR-011/032.
- Local cache encrypted at rest; wiped on sign-out, shift-close, or remote revocation.
- Payment card data (PAN, CVV) is never persisted on device; capture is routed exclusively through the payment terminal integration (ENG-023) per Publication §4.3.
- Cash-denomination and deposit fields gated per role.

## 16. Performance

Cold start ≤ 3s on target devices; cart line-add renders sub-second; list scroll 60fps; offline reads return immediately from cache; offline sale queue drains within the platform batch envelope on reconnect.

## 17. Accessibility

Meets platform accessibility baseline: dynamic type, VoiceOver/TalkBack for every interactive element, high-contrast support, tap targets ≥ 44pt/48dp, and screen-reader announcements on sale complete, return complete, day-close post, and receipt reprint.

## 18. Acceptance Criteria & Publication Traceability Matrix

MOB-015 is Accepted when every screen in §5 maps to a Publication anchor, offline queue reconciles without data loss and re-evaluates business rules server-side per §6, push events are limited to Publication §9 / §10 plus Publication §4.3 receipt notifications, biometrics gate the session and mutation actions, GPS is `N/A` per §11, and accessibility/security baselines pass.

| Publication § | MOB-015 Section |
| --- | --- |
| §2 Purpose | §1 |
| §3 Scope | §1, §5 |
| §6 Business Rules | §4, §5, §7 (server-authoritative) |
| §7 Master Data | §5 #22–23 (read-only; edit excluded per §1) |
| §8 Transactions | §5, §7 (POS Sale, POS Return, Cash Deposit, Day Close) |
| §9 Published Events | §9 |
| §10 Consumed Events | §9 (`InventoryLowStock`), §5 #4 (`OfferPublished`) |
| §11 Engines | §7–§15 |
| §13 Boundaries | §1 (excluded surfaces), §15 (posting excluded); §15 (KPI ownership at MOD-017) |
| §15 Non-Goals | §1 (no master authoring on mobile; no reports / audit surface / config); omni-channel receipts and AI upsell prompts excluded per Publication §15 |
