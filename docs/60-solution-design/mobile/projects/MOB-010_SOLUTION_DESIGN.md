---
title: "MOB-010 — Projects Mobile Solution Design"
summary: "Mobile Solution Design for MOD-010 Projects. Derives all mobile screens, flows, and behaviors exclusively from MOD-010 Module Publication."
spec_id: "MOB-010_SOLUTION_DESIGN"
module_id: "MOD-010"
module_name: "Projects"
platform: "mobile"
version: "1.0"
status: "Design Complete"
owner: "Delivery"
source_publication: "docs/45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/projects/MODULE_PRD.md", "docs/40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "mobile", "MOD-010", "projects", "MOB-010"]
document_type: "Mobile Solution Design"
---

# MOB-010 — Projects Mobile Solution Design

> **Source of Truth:** [`MOD-010 Module Publication`](../../../45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md). Every screen and behavior derives from the Publication.

## 1. Mobile Scope

Consultant-and-approver-optimized subset of MOD-010 for smartphone use. Derived from Publication §3–§9:

- Timesheet capture and submission on the go (Publication §8 Timesheet, §4.3).
- Milestone Completion capture (Publication §8 Milestone Completion, §4.2).
- Change Request capture (Publication §8 Change Request, §4.2).
- Approval action inbox for Timesheet, Milestone Completion, Change Request, and Project Invoice (Publication §8, §11 ENG-011).
- Project view (read-only overview, tasks, milestones, my timesheets) (Publication §7, §8).
- Notifications inbox (ENG-025) for Publication §9 events (`ProjectCreated`, `MilestoneCompleted`, `TimesheetApproved`, `ProjectInvoiceIssued`).

Not included on mobile: master authoring for Project / Task / Milestone / Resource / Rate Card, project budgets and cost roll-up, Project Invoice authoring and issuance, reports and dashboards, audit-readiness surface, and Projects Configuration authoring (available on web only).

## 2. Supported Platforms

iOS 16+ and Android 12+ smartphones. Tablet layouts fall back to WEB-010.

## 3. Navigation

Bottom tab bar: **Home**, **Timesheets**, **Projects**, **Inbox**, **Notifications**. Approver-scoped approvals surface in the Inbox tab.

## 4. Mobile User Flows

- **Capture Timesheet.** Home → Timesheets → New Timesheet → Effort entry → Submit (Publication §8, §4.3).
- **Capacity-justification.** When capacity exceeded, justification is required before submit (Publication §6).
- **Capture Milestone Completion.** Projects → Project → Milestones → Milestone → Complete → Submit (Publication §8, §4.2).
- **Capture Change Request.** Projects → Project → Change Requests → New → Submit (Publication §8, §4.2).
- **Approve (Approver).** Inbox → item → Approve / Reject (Publication §8, §11 ENG-011).

## 5. Mobile Screens

| # | Screen | Publication Ref |
| --- | --- | --- |
| 1 | Home / Today | §3, §4.3, §4.5 |
| 2 | Timesheets (my list) | §8 Timesheet, §4.3 |
| 3 | Timesheet Detail | §8, §4.3 |
| 4 | New Timesheet | §8, §4.3 |
| 5 | Timesheet Capacity-Justification | §6, §4.3 |
| 6 | Projects (my list) | §7 Project |
| 7 | Project Detail — Overview | §7 Project |
| 8 | Project Detail — Tasks | §7 Task |
| 9 | Project Detail — Milestones | §7 Milestone, §8 |
| 10 | Milestone Completion Capture | §8 Milestone Completion, §4.2 |
| 11 | Change Requests (my list) | §8 Change Request, §4.2 |
| 12 | New Change Request | §8, §4.2 |
| 13 | Approver Inbox — Timesheets | §8, §4.3, §11 ENG-011 |
| 14 | Approver Inbox — Milestone Completions | §8, §4.2 |
| 15 | Approver Inbox — Change Requests | §8, §4.2 |
| 16 | Approver Inbox — Project Invoices | §8, §4.4 |
| 17 | Notifications Inbox | §9, §11 ENG-025 |

## 6. Forms

Mobile forms mirror the field set authorized by the Publication for each transaction. Field density is reduced for one-thumb use; no new fields are introduced. Attachment capture uses ENG-007 / ENG-008 per Publication §11.

## 7. Offline Behaviour

Read-only cache for the user's assigned projects, tasks, milestones, recent timesheets, change requests, and notifications. Offline write is limited to:

- New Timesheet (deferred; reconciled on reconnect).
- Milestone Completion capture (deferred).
- Change Request capture (deferred, with attachments).
- Notifications acknowledgement (deferred).

Approval actions (Timesheet, Milestone Completion, Change Request, Project Invoice) require online connectivity to guarantee server-authoritative rule evaluation (Publication §6, §11 ENG-011, ENG-012). Deferred writes are queued and reconciled on reconnect; conflicts fall back to server state.

## 8. Synchronization

Delta-sync on app foreground and pull-to-refresh. Server timestamps drive last-write reconciliation. Sync scope is bounded to entities the user is authorized to see (ENG-002 per Publication §11).

## 9. Push Notifications

Emitted by ENG-025 (Publication §11) in response to Publication events (§9): `ProjectCreated` (assigned projects), `MilestoneCompleted` (own milestone or project), `TimesheetApproved` (own timesheet), `ProjectInvoiceIssued` (own project). Approver notifications for pending Timesheet / Milestone Completion / Change Request / Project Invoice approvals are emitted per Publication §11 (ENG-025) in response to workflow events (ENG-010, ENG-011).

## 10. Camera Support

Attachment capture (photo evidence for Timesheet supporting docs and Change Request documents) via ENG-007 / ENG-008 (Publication §11). Document scan is a design-system convention; no new Publication capability is introduced.

## 11. GPS Support

Not authorized by the Publication for Projects in §7, §8, or §11. **N/A** — MOB-010 does not use GPS. If a future Publication revision authorizes it, MOB-010 will be amended.

## 12. Biometric Authentication

Device biometrics unlock the session; server-side auth remains delegated to ENG-001 (Publication §11).

## 13. Attachment Handling

Attachments upload via ENG-007 / ENG-008 (Publication §11) and follow the platform attachment policy. Uploads resume on reconnect.

## 14. Background Processing

Limited to deferred-write queue reconciliation and push notification handling. No long-running background tasks beyond platform sync (Publication §11).

## 15. Mobile Security

- Device biometrics unlock the session; server-side auth via ENG-001 (Publication §11).
- Tenant isolation and RBAC/ABAC via ENG-002/003 (Publication §11), ADR-011/032.
- Local cache encrypted at rest; wiped on sign-out or remote revocation.
- Cost-sensitive fields (rate cards, budgets, invoice amounts) redacted or gated per role.

## 16. Performance

Cold start ≤ 3s on target devices; list scroll 60fps; offline reads return immediately from cache.

## 17. Accessibility

Meets platform accessibility baseline: dynamic type, VoiceOver/TalkBack for every interactive element, high-contrast support, tap targets ≥ 44pt/48dp.

## 18. Acceptance Criteria & Publication Traceability Matrix

MOB-010 is Accepted when every screen in §5 maps to a Publication anchor, offline queue reconciles without data loss, push events are limited to Publication §9, GPS is N/A while biometrics gate the session, and accessibility/security baselines pass.

| Publication § | MOB-010 Section |
| --- | --- |
| §2 Purpose | §1 |
| §3 Scope | §1, §5 |
| §6 Business Rules | §4, §5, §7 (server-authoritative) |
| §7 Master Data | (not authored on mobile; §1 exclusion) |
| §8 Transactions | §5, §6 |
| §9 Published Events | §9 |
| §10 Consumed Events | (server-side; N/A on mobile) |
| §11 Engines | §7–§15 |
| §13 Boundaries | §1 (excluded surfaces) |
| §15 Non-Goals | §11 (no GPS), §1 (no master authoring / budgets / invoice authoring / reports / config on mobile) |
