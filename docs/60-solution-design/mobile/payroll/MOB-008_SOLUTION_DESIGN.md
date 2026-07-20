---
title: "MOB-008 — Payroll Mobile Solution Design"
summary: "Mobile Solution Design for MOD-008 Payroll. Derives all mobile screens, flows, and behaviors exclusively from MOD-008 Module Publication."
spec_id: "MOB-008_SOLUTION_DESIGN"
module_id: "MOD-008"
module_name: "Payroll"
platform: "mobile"
version: "1.0"
status: "Design Complete"
owner: "People"
source_publication: "docs/45-module-publications/payroll/MOD-008_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/payroll/MODULE_PRD.md", "docs/40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "mobile", "MOD-008", "payroll", "MOB-008"]
document_type: "Mobile Solution Design"
---

# MOB-008 — Payroll Mobile Solution Design

> **Source of Truth:** [`MOD-008 Module Publication`](../../../45-module-publications/payroll/MOD-008_MODULE_PUBLICATION.md). Every screen and behavior derives from the Publication.

## 1. Mobile Scope

Employee-and-approver-optimized subset of MOD-008 for smartphone use. Derived from Publication §3–§9:

- Payslip read for the current employee (Publication §8 Payslip, §4.5).
- Reimbursement Request capture, view, and approval (for approvers) — Publication §8 Reimbursement, §4.4.
- Advance Request capture, view, and approval (for approvers) — Publication §8 Advance, §4.4.
- Payroll Run approval action inbox (for approvers) — Publication §8 Payroll Run, §4.2, §11 ENG-011.
- Notifications inbox (ENG-025) for Publication §9 events (`PayrollProcessed`, `PayrollPosted`, `PayslipIssued`, `DisbursementInitiated`).

Not included on mobile: master authoring (Salary Structure, Component, Bank Mandate, Statutory Setup), Payroll Run configuration and gross/statutory computation workspace, disbursement file generation, posting workspace, reports and dashboards, audit-readiness surface, Payroll Configuration authoring (available on web only).

## 2. Supported Platforms

iOS 16+ and Android 12+ smartphones. Tablet layouts fall back to WEB-008.

## 3. Navigation

Bottom tab bar: **Home**, **Payslips**, **Reimbursements**, **Advances**, **Inbox**. Approver-scoped approvals (Payroll Run, Reimbursement, Advance) surface in the Inbox tab.

## 4. Mobile User Flows

- **View Payslip.** Home → Payslips → Payslip Detail (Publication §8 Payslip, §4.5).
- **Submit Reimbursement.** Home → Reimbursements → New → attach receipt → Submit (Publication §8, §4.4, §11 ENG-007 for attachments).
- **Approve Reimbursement (Approver).** Inbox → Reimbursement → Approve / Reject (Publication §8, §4.4, §11 ENG-011).
- **Submit Advance.** Home → Advances → New → Submit (Publication §8, §4.4).
- **Approve Advance (Approver).** Inbox → Advance → Approve / Reject (Publication §8, §4.4).
- **Approve Payroll Run (Approver).** Inbox → Payroll Run → Approve / Reject (Publication §8, §4.2, §11 ENG-011).

## 5. Mobile Screens

| # | Screen | Publication Ref |
| --- | --- | --- |
| 1 | Home / Today | §3, §4.5, §4.6 |
| 2 | My Payslips (list) | §8 Payslip, §4.5 |
| 3 | Payslip Detail | §8 Payslip, §4.5 |
| 4 | My Reimbursements (list) | §8 Reimbursement, §4.4 |
| 5 | Reimbursement Detail | §8, §4.4 |
| 6 | New Reimbursement | §8, §4.4 |
| 7 | My Advances (list) | §8 Advance, §4.4 |
| 8 | Advance Detail | §8, §4.4 |
| 9 | New Advance | §8, §4.4 |
| 10 | Approver Inbox — Payroll Run Approvals | §8 Payroll Run, §4.2 |
| 11 | Approver Inbox — Reimbursement Approvals | §8 Reimbursement, §4.4 |
| 12 | Approver Inbox — Advance Approvals | §8 Advance, §4.4 |
| 13 | Notifications Inbox | §9, §11 ENG-025 |

## 6. Forms

Mobile forms mirror the field set authorized by the Publication for each transaction. Field density is reduced for one-thumb use; no new fields are introduced. Attachment capture uses ENG-007 / ENG-008 per Publication §11.

## 7. Offline Behaviour

Read-only cache for the current user's recent payslips, reimbursements, advances, and notifications. Offline write is limited to:

- New Reimbursement Request (deferred, with attached receipt).
- New Advance Request (deferred).
- Notifications acknowledgement (deferred).

Approval actions (Payroll Run, Reimbursement, Advance) require online connectivity to guarantee server-authoritative rule evaluation (Publication §6, §11 ENG-011, ENG-012). Deferred writes are queued and reconciled on reconnect; conflicts fall back to server state.

## 8. Synchronization

Delta-sync on app foreground and pull-to-refresh. Server timestamps drive last-write reconciliation. Sync scope is bounded to entities the user is authorized to see (ENG-002 per Publication §11).

## 9. Push Notifications

Emitted by ENG-025 (Publication §11) in response to Publication events (§9): `PayrollProcessed` (own payroll cycle), `PayrollPosted` (own payroll cycle), `PayslipIssued` (own payslip), `DisbursementInitiated` (own disbursement). Approver notifications for pending Payroll Run / Reimbursement / Advance approvals are emitted per Publication §11 (ENG-025) in response to workflow events (ENG-010, ENG-011).

## 10. Camera Support

Attachment capture (photo of receipt) for Reimbursement Requests via ENG-007 (Publication §11). No OCR or advanced processing (not in Publication).

## 11. GPS Support

Not authorized by the Publication for Payroll in §7, §8, or §11. **N/A** — MOB-008 does not use GPS. If a future Publication revision authorizes it, MOB-008 will be amended.

## 12. Biometric Authentication

Device biometrics unlock the session; server-side auth remains delegated to ENG-001 (Publication §11). Payslip access is additionally biometric-gated on the device given the sensitivity of compensation data (design-system convention, not a new Publication rule).

## 13. Attachment Handling

Attachments upload via ENG-007 (Publication §11) and follow the platform attachment policy. Uploads resume on reconnect. Payslip documents are read-only on mobile (rendered via ENG-007).

## 14. Background Processing

Limited to deferred-write queue reconciliation and push notification handling. No long-running background tasks beyond platform sync (Publication §11).

## 15. Mobile Security

- Device biometrics unlock the session; server-side auth via ENG-001 (Publication §11).
- Tenant isolation and RBAC/ABAC via ENG-002/003 (Publication §11), ADR-011/032.
- Local cache encrypted at rest; wiped on sign-out or remote revocation.
- Compensation fields (gross, net, statutory deductions, bank mandate details) redacted or gated per role.

## 16. Performance

Cold start ≤ 3s on target devices; list scroll 60fps; offline reads return immediately from cache.

## 17. Accessibility

Meets platform accessibility baseline: dynamic type, VoiceOver/TalkBack for every interactive element, high-contrast support, tap targets ≥ 44pt/48dp.

## 18. Acceptance Criteria & Publication Traceability Matrix

MOB-008 is Accepted when every screen in §5 maps to a Publication anchor, offline queue reconciles without data loss, push events are limited to Publication §9, GPS is N/A while biometrics gate the session, and accessibility/security baselines pass.

| Publication § | MOB-008 Section |
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
| §15 Non-Goals | §11 (no GPS), §1 (no config/reports/master authoring on mobile) |
