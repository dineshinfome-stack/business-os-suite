---
title: "MOB-011 — AMC Mobile Solution Design"
summary: "Mobile Solution Design for MOD-011 AMC. Derives all mobile screens, flows, and behaviors exclusively from MOD-011 Module Publication."
spec_id: "MOB-011_SOLUTION_DESIGN"
module_id: "MOD-011"
module_name: "AMC"
platform: "mobile"
version: "1.0"
status: "Design Complete"
owner: "Service"
source_publication: "docs/45-module-publications/amc/MOD-011_MODULE_PUBLICATION.md"
reference_documents: ["docs/20-module-prds/amc/MODULE_PRD.md", "docs/40-module-baselines/MOD011_AMC_BASELINE_v1.md"]
layer: "solution-design"
updated: "2026-07-20"
tags: ["solution-design", "mobile", "MOD-011", "amc", "MOB-011"]
document_type: "Mobile Solution Design"
---

# MOB-011 — AMC Mobile Solution Design

> **Source of Truth:** [`MOD-011 Module Publication`](../../../45-module-publications/amc/MOD-011_MODULE_PUBLICATION.md). Every screen and behavior derives from the Publication.

## 1. Mobile Scope

Field-coordinator-and-approver-optimized subset of MOD-011 for smartphone use. Derived from Publication §3–§9:

- Visit Schedule browse, reschedule, and cancel on the go (Publication §8 Visit Schedule, §4.2).
- Contract read-only lookup with Entitlement and Coverage view (Publication §7).
- Renewal approval action inbox (Publication §8 Renewal, §11 ENG-011).
- Contract Invoice read-only lookup for on-site verification (Publication §8, §4.3).
- Notifications inbox (ENG-025) for Publication §9 events (`ContractSigned`, `VisitScheduled`, `ContractRenewed`, `ContractExpired`) and SLA/escalation alerts authorized by Publication §3.

Not included on mobile: master authoring for Contract / Entitlement / Coverage / Renewal Terms, Contract sign flow, Contract Invoice authoring and issuance, preventive schedule generation, reports and dashboards, audit-readiness surface, and AMC Configuration authoring (available on web only).

## 2. Supported Platforms

iOS 16+ and Android 12+ smartphones. Tablet layouts fall back to WEB-011.

## 3. Navigation

Bottom tab bar: **Home**, **Visits**, **Contracts**, **Inbox**, **Notifications**. Approver-scoped Renewal approvals surface in the Inbox tab.

## 4. Mobile User Flows

- **Browse & reschedule visit.** Home → Visits → Visit → Reschedule (server enforces coverage-window rule per Publication §6).
- **Cancel visit.** Visits → Visit → Cancel.
- **Lookup contract.** Contracts → search → Contract → Overview / Entitlements / Coverage / Visit Schedules / Invoices (read-only).
- **Approve renewal.** Inbox → Renewal → Approve / Reject (notice-period rule server-enforced per Publication §6).

## 5. Mobile Screens

| # | Screen | Publication Ref |
| --- | --- | --- |
| 1 | Home / Today | §3, §4.2, §4.4 |
| 2 | Visits (my list) | §8 Visit Schedule, §4.2 |
| 3 | Visit Detail | §8, §4.2 |
| 4 | Visit Reschedule | §8, §6 |
| 5 | Visit Cancel | §8, §4.2 |
| 6 | Contracts (search / recent) | §7 Contract |
| 7 | Contract Detail — Overview | §7 Contract |
| 8 | Contract Detail — Entitlements | §7 Entitlement |
| 9 | Contract Detail — Coverage | §7 Coverage |
| 10 | Contract Detail — Visit Schedules | §8 Visit Schedule |
| 11 | Contract Detail — Invoices | §8 Contract Invoice, §4.3 |
| 12 | Approver Inbox — Renewals | §8, §4.3, §11 ENG-011 |
| 13 | Renewal Detail (Approver) | §8, §4.3 |
| 14 | Notifications Inbox | §9, §11 ENG-025 |

## 6. Forms

Mobile forms mirror the field set authorized by the Publication for the two mobile transactions (Visit Reschedule / Cancel; Renewal Approve / Reject). Field density is reduced for one-thumb use; no new fields are introduced. Attachment capture uses ENG-007 / ENG-008 per Publication §11 on Visit Reschedule (evidence photos) and Renewal Approval (supporting notes).

## 7. Offline Behaviour

Read-only cache for the user's assigned visits, contracts, entitlements, coverage, invoices, and notifications. Offline write is limited to:

- Visit Reschedule / Cancel (deferred; reconciled on reconnect; coverage-window rule re-evaluated server-side).
- Notifications acknowledgement (deferred).

Renewal approval actions require online connectivity to guarantee server-authoritative rule evaluation (Publication §6 notice-period rule, §11 ENG-011, ENG-012). Deferred writes are queued and reconciled on reconnect; conflicts fall back to server state.

## 8. Synchronization

Delta-sync on app foreground and pull-to-refresh. Server timestamps drive last-write reconciliation. Sync scope is bounded to entities the user is authorized to see (ENG-002 per Publication §11).

## 9. Push Notifications

Emitted by ENG-025 (Publication §11) in response to Publication events (§9): `ContractSigned` (Field Coordinators of assigned contracts), `VisitScheduled` (assigned visit owners), `ContractRenewed` (contract owners), `ContractExpired` (contract owners). Approver notifications for pending Renewal approvals are emitted per Publication §11 (ENG-025) in response to workflow events (ENG-010, ENG-011). SLA/escalation notifications are emitted per Publication §3 (SLA definitions, escalation policies).

## 10. Camera Support

Attachment capture (photo evidence for Visit Reschedule and Renewal Approval notes) via ENG-007 / ENG-008 (Publication §11). Document scan is a design-system convention; no new Publication capability is introduced.

## 11. GPS Support

Not authorized by the Publication for AMC in §7, §8, or §11 — field-visit execution (with GPS) is owned by MOD-012 Field Service (Publication §13). **N/A** — MOB-011 does not use GPS. If a future Publication revision authorizes it, MOB-011 will be amended.

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
- Cost-sensitive fields (contract values, invoice amounts) redacted or gated per role.

## 16. Performance

Cold start ≤ 3s on target devices; list scroll 60fps; offline reads return immediately from cache.

## 17. Accessibility

Meets platform accessibility baseline: dynamic type, VoiceOver/TalkBack for every interactive element, high-contrast support, tap targets ≥ 44pt/48dp.

## 18. Acceptance Criteria & Publication Traceability Matrix

MOB-011 is Accepted when every screen in §5 maps to a Publication anchor, offline queue reconciles without data loss, push events are limited to Publication §9 plus Publication §3 SLA/escalation notifications, GPS is N/A while biometrics gate the session, and accessibility/security baselines pass.

| Publication § | MOB-011 Section |
| --- | --- |
| §2 Purpose | §1 |
| §3 Scope | §1, §5 |
| §6 Business Rules | §4, §5, §7 (server-authoritative) |
| §7 Master Data | §5 (read-only); authoring excluded per §1 |
| §8 Transactions | §5, §6 |
| §9 Published Events | §9 |
| §10 Consumed Events | (server-side; N/A on mobile) |
| §11 Engines | §7–§15 |
| §13 Boundaries | §1 (excluded surfaces), §11 (GPS owned by MOD-012) |
| §15 Non-Goals | §11 (no GPS), §1 (no master authoring / invoice authoring / preventive generation / reports / config on mobile) |
