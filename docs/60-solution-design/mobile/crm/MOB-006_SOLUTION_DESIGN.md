---
title: "MOB-006 — CRM Mobile Solution Design"
summary: "Mobile Solution Design for MOD-006 CRM. Derives all mobile screens, flows, and behaviors exclusively from MOD-006 Module Publication."
spec_id: "MOB-006_SOLUTION_DESIGN"
module_id: "MOD-006"
module_name: "CRM"
platform: "mobile"
version: "1.0"
status: "Design Complete"
owner: "Revenue"
source_publication: "docs/45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/crm/MODULE_PRD.md", "docs/40-module-baselines/MOD006_CRM_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "mobile", "MOD-006", "crm", "MOB-006"]
document_type: "Mobile Solution Design"
---

# MOB-006 — CRM Mobile Solution Design

> **Source of Truth:** [`MOD-006 Module Publication`](../../../45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md). Every screen and behavior derives from the Publication.

## 1. Mobile Scope

Field-optimized subset of MOD-006 for smartphone use by sales reps and marketing users. Derived from Publication §2–§8:

- Account/Contact/Lead/Opportunity lookup and read.
- Lead capture and edit.
- Opportunity stage update (single-tap advance / win-loss).
- Activity and Meeting logging against Accounts/Contacts/Leads/Opportunities.
- Campaign roster read; Campaign Send status view (no authoring on mobile).
- Notifications inbox (ENG-025) and Customer 360 read view.

Not included on mobile: CRM Configuration authoring, campaign authoring, reports/dashboards (available on web).

## 2. Supported Platforms

iOS 16+ and Android 12+ smartphones. Tablet layouts fall back to WEB-006.

## 3. Navigation

Bottom tab bar: **Home**, **Accounts**, **Leads**, **Opportunities**, **Activities**. Secondary access to Campaigns and Customer 360 via Account detail.

## 4. Mobile User Flows

- **Capture Lead in the field.** Home → Add Lead → Save (assignment rule resolves owner per Publication §6).
- **Log Activity/Meeting.** Account/Contact/Lead/Opportunity detail → Log Activity or Log Meeting.
- **Advance Opportunity.** Opportunities → Detail → Move Stage / Mark Won / Mark Lost (Publication §7, §6 terminal win/loss).
- **Review Customer 360.** Account detail → 360 tab (Publication §3, §4.6).
- **Convert Lead.** Lead detail → Convert (single-shot; disabled once converted per Publication §6).

## 5. Mobile Screens

| # | Screen | Publication Ref |
| --- | --- | --- |
| 1 | Home / Today | §3, §4.6 |
| 2 | Accounts List | §7 Account |
| 3 | Account Detail (tabs: Overview, Contacts, Activities, 360) | §7, §3 |
| 4 | Contact Detail | §7 Contact |
| 5 | Leads List | §7 Lead |
| 6 | Lead Detail | §7 Lead |
| 7 | Lead Create/Edit | §7, §6 |
| 8 | Lead Convert | §6 single-shot |
| 9 | Opportunities List | §7 Opportunity |
| 10 | Opportunity Detail (stage advance, win/loss) | §7, §6 |
| 11 | Activities Feed | §8 Activity |
| 12 | Log Activity | §8 Activity |
| 13 | Meeting Detail | §8 Meeting |
| 14 | Log Meeting | §8 Meeting |
| 15 | Campaign Roster (read) | §7 Campaign |
| 16 | Notifications Inbox | §9, §11 ENG-025 |

## 6. Forms

Mobile forms mirror the field set authorized by the Publication for each entity. Field density is reduced for one-thumb use; no new fields are introduced.

## 7. Offline Behaviour

Read-only cache for Accounts, Contacts, Leads assigned to the current user, and their recent Activities/Meetings. Offline write is limited to:

- New Activity, new Meeting (deferred).
- Lead capture (deferred).

Deferred writes are queued and reconciled on reconnect. Conflicts fall back to server state; the user is notified.

## 8. Synchronization

Delta-sync on app foreground and pull-to-refresh. Server timestamps drive last-write reconciliation. Sync scope is bounded to entities the user is authorized to see (ENG-002 per Publication §11).

## 9. Push Notifications

Emitted by ENG-025 (Publication §11) in response to Publication events (§9): `LeadCreated` (own assignment), `OpportunityWon`, `OpportunityLost`, `ActivityLogged`, `CampaignSent`.

## 10. Camera Support

Attachment capture (photo) for Activities via ENG-008 (Publication §11). No OCR or advanced processing (not in Publication).

## 11. GPS Support

Not authorized by the Publication for CRM. **N/A** — MOB-006 does not use GPS. If a future Publication revision authorizes it, MOB-006 will be amended.

## 12. Attachment Handling

Attachments upload via ENG-008 and follow the platform attachment policy. Uploads resume on reconnect.

## 13. Mobile Security

- Device biometrics unlock the session; server-side auth via ENG-001 (Publication §11).
- Tenant isolation and RBAC/ABAC via ENG-002/003 (Publication §11), ADR-011/032.
- Local cache encrypted at rest; wiped on sign-out or remote revocation.
- No PII field is displayed for consent-restricted contacts.

## 14. Performance

Cold start ≤ 3s on target devices; list scroll 60fps; offline reads return immediately from cache.

## 15. Accessibility

Meets platform accessibility baseline: dynamic type, VoiceOver/TalkBack for every interactive element, high-contrast support, tap targets ≥ 44pt/48dp.

## 16. Acceptance Criteria

MOB-006 is Accepted when:

1. Every screen in §5 maps to a Publication anchor.
2. Offline queue reconciles without data loss.
3. Push events are limited to Publication §9.
4. GPS is N/A and biometrics gate the session.
5. Accessibility and security baselines pass.

## 17. Publication Traceability Matrix

| Publication § | MOB-006 Section |
| --- | --- |
| §2 Purpose | §1 |
| §3 Scope | §1, §5 |
| §6 Business Rules | §4, §5, §6 |
| §7 Master Data | §5, §6 |
| §8 Transactions | §5, §6 |
| §9 Published Events | §9 |
| §11 Engines | §7–§13 |
| §13 Boundaries | §1 (excluded surfaces) |
| §15 Non-Goals | §11 (no GPS), §1 (no reports/config authoring on mobile) |
