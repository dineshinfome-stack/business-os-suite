---
title: "MOB-007 — HRMS Mobile Solution Design"
summary: "Mobile Solution Design for MOD-007 HRMS. Derives all mobile screens, flows, and behaviors exclusively from MOD-007 Module Publication."
spec_id: "MOB-007_SOLUTION_DESIGN"
module_id: "MOD-007"
module_name: "HRMS"
platform: "mobile"
version: "1.0"
status: "Design Complete"
owner: "People"
source_publication: "docs/45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/hrms/MODULE_PRD.md", "docs/40-module-baselines/MOD007_HRMS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "mobile", "MOD-007", "hrms", "MOB-007"]
document_type: "Mobile Solution Design"
---

# MOB-007 — HRMS Mobile Solution Design

> **Source of Truth:** [`MOD-007 Module Publication`](../../../45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md). Every screen and behavior derives from the Publication.

## 1. Mobile Scope

Employee-and-manager-optimized subset of MOD-007 for smartphone use. Derived from Publication §3–§9:

- Employee directory lookup and profile read (Publication §7 Employee, §4.5 Self-Service).
- Employee Self-Service: My Profile, My Leave (initiate + status), My Attendance summary, My HR Documents (Publication §4.5).
- Attendance capture (check-in / check-out) authorized by Publication §8 Attendance / §4.3.
- Leave Request capture, view, and approval (for Managers) — Publication §8 Leave Request, §6 self-approval prevention.
- Onboarding Task action inbox for assigned actions (Publication §8, §4.2).
- Appraisal participation surfaces (Publication §8, §4.4) — read + rating capture as authorized.
- Notifications inbox (ENG-025) for Publication §9 events.

Not included on mobile: HR Configuration authoring, org-structure master authoring, biometric ingestion review, reports and dashboards, audit-readiness surface (available on web).

## 2. Supported Platforms

iOS 16+ and Android 12+ smartphones. Tablet layouts fall back to WEB-007.

## 3. Navigation

Bottom tab bar: **Home**, **Attendance**, **Leave**, **Inbox**, **Directory**. Manager-scoped approvals surface in the Inbox tab.

## 4. Mobile User Flows

- **Check In / Check Out.** Home → Attendance → Check In / Check Out (Publication §8 Attendance).
- **Request Leave.** Home → Leave → New Request → Submit (Publication §8, §6 self-approval blocked at server).
- **Approve Leave (Manager).** Inbox → Leave Request → Approve / Reject (Publication §6, §8).
- **View Payslip / HR Document.** Home → Self-Service → HR Documents (Publication §4.5, §11 ENG-007).
- **Act on Onboarding Task.** Inbox → Onboarding Task → Complete step (Publication §8, §4.2).
- **Participate in Appraisal.** Inbox → Appraisal → Complete rating (Publication §8, §4.4).

## 5. Mobile Screens

| # | Screen | Publication Ref |
| --- | --- | --- |
| 1 | Home / Today | §3, §4.5 |
| 2 | Employee Directory (list) | §7 Employee |
| 3 | Employee Profile (read) | §7 Employee |
| 4 | My Profile | §4.5 |
| 5 | My Attendance Summary | §4.5, §8 Attendance |
| 6 | Attendance Check-In / Check-Out | §8 Attendance, §4.3 |
| 7 | My Leave (list) | §4.5, §8 Leave Request |
| 8 | Leave Request Detail | §8, §6 |
| 9 | New Leave Request | §8, §6 |
| 10 | My Leave Balance | §4.3 |
| 11 | Manager Inbox — Leave Approvals | §8, §6 |
| 12 | Manager Inbox — Onboarding Tasks | §8 Onboarding Task |
| 13 | Manager Inbox — Appraisal Actions | §8 Appraisal |
| 14 | My HR Documents | §4.5, §11 ENG-007 |
| 15 | Notifications Inbox | §9, §11 ENG-025 |

## 6. Forms

Mobile forms mirror the field set authorized by the Publication for each entity. Field density is reduced for one-thumb use; no new fields are introduced.

## 7. Offline Behaviour

Read-only cache for the current user's profile, leave balance, recent attendance, HR documents, and directory search results. Offline write is limited to:

- Attendance Check-In / Check-Out (deferred).
- New Leave Request (deferred).
- Notifications acknowledgement (deferred).

Deferred writes are queued and reconciled on reconnect. Conflicts fall back to server state; the user is notified. Server-side rules (§6) remain authoritative on reconciliation.

## 8. Synchronization

Delta-sync on app foreground and pull-to-refresh. Server timestamps drive last-write reconciliation. Sync scope is bounded to entities the user is authorized to see (ENG-002 per Publication §11).

## 9. Push Notifications

Emitted by ENG-025 (Publication §11) in response to Publication events (§9): `EmployeeHired` (own onboarding), `EmployeeExited` (own exit clearance), `AttendanceMarked` (own actions), `LeaveApproved` (own requests / assigned approvals), `AppraisalCompleted` (own appraisal).

## 10. Camera Support

Attachment capture (photo) for Onboarding Task documents and Leave Request supporting evidence via ENG-008 (Publication §11). No OCR or advanced processing (not in Publication).

## 11. GPS Support

Not explicitly authorized by the Publication for HRMS Attendance in §8 or §4.3. **N/A** — MOB-007 does not use GPS geofencing. If a future Publication revision authorizes it, MOB-007 will be amended.

## 12. Biometric Authentication

Device biometrics unlock the session; server-side auth remains delegated to ENG-001 (Publication §11). Device biometric ≠ biometric attendance ingestion (which is a server-side ENG-023 concern per Publication §4.3).

## 13. Attachment Handling

Attachments upload via ENG-008 and follow the platform attachment policy. Uploads resume on reconnect. HR letters are read-only on mobile (rendered via ENG-007).

## 14. Background Processing

Limited to deferred-write queue reconciliation and push notification handling. No long-running background tasks beyond platform sync (Publication §11).

## 15. Mobile Security

- Device biometrics unlock the session; server-side auth via ENG-001 (Publication §11).
- Tenant isolation and RBAC/ABAC via ENG-002/003 (Publication §11), ADR-011/032.
- Local cache encrypted at rest; wiped on sign-out or remote revocation.
- Sensitive employee fields (data-classification) are redacted or gated per role.

## 16. Performance

Cold start ≤ 3s on target devices; list scroll 60fps; offline reads return immediately from cache.

## 17. Accessibility

Meets platform accessibility baseline: dynamic type, VoiceOver/TalkBack for every interactive element, high-contrast support, tap targets ≥ 44pt/48dp.

## 18. Acceptance Criteria & Publication Traceability Matrix

MOB-007 is Accepted when every screen in §5 maps to a Publication anchor, offline queue reconciles without data loss, push events are limited to Publication §9, GPS is N/A while biometrics gate the session, and accessibility/security baselines pass.

| Publication § | MOB-007 Section |
| --- | --- |
| §2 Purpose | §1 |
| §3 Scope | §1, §5 |
| §6 Business Rules | §4, §5, §7 |
| §7 Master Data | §5, §6 |
| §8 Transactions | §5, §6 |
| §9 Published Events | §9 |
| §10 Consumed Events | (server-side; N/A on mobile) |
| §11 Engines | §7–§15 |
| §13 Boundaries | §1 (excluded surfaces) |
| §15 Non-Goals | §11 (no GPS), §1 (no config/reports authoring on mobile) |
