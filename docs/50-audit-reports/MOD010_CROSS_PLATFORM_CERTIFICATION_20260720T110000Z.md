---
title: "MOD-010 Projects — Cross-Platform Certification (CPC-010)"
summary: "Cross-Platform Certification verifying consistency across MOD-010 Publication, WEB-010, MOB-010, and API-010. Documentation-only certification."
report_id: "MOD010_CROSS_PLATFORM_CERTIFICATION_20260720T110000Z"
spec_id: "CPC-010"
module_id: "MOD-010"
module_name: "Projects"
version: "1.0"
status: "Pass"
owner: "Delivery"
layer: "audit"
updated: "2026-07-20"
tags: ["certification", "cross-platform", "MOD-010", "projects", "CPC-010"]
document_type: "Cross-Platform Certification"
source_publication: "docs/45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md"
inputs:
  - "docs/60-solution-design/web/projects/WEB-010_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/mobile/projects/MOB-010_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/api/projects/API-010_SOLUTION_DESIGN.md"
---

# MOD-010 Projects — Cross-Platform Certification (CPC-010)

Certifies consistency of WEB-010, MOB-010, and API-010 against the [`MOD-010 Publication`](../45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md).

## 1. Inputs

- Publication: `docs/45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md`
- WEB: `docs/60-solution-design/web/projects/WEB-010_SOLUTION_DESIGN.md`
- MOB: `docs/60-solution-design/mobile/projects/MOB-010_SOLUTION_DESIGN.md`
- API: `docs/60-solution-design/api/projects/API-010_SOLUTION_DESIGN.md`

## 2. Compliance Matrix

| Dimension | Publication Anchor | WEB-010 | MOB-010 | API-010 | Result |
| --- | --- | --- | --- | --- | --- |
| Functional parity (Project) | §7 Project | §8 #2–4 | §5 #6–7 (read-only) | §6.1 | PASS |
| Functional parity (Task) | §7 Task | §8 #14–16 | §5 #8 (read-only) | §6.2 | PASS |
| Functional parity (Milestone) | §7 Milestone | §8 #17–18 | §5 #9 (read-only) | §6.3 | PASS |
| Functional parity (Resource) | §7 Resource | §8 #36–37 | Not on mobile (MOB §1) | §6.4 | PASS |
| Functional parity (Rate Card) | §7 Rate Card | §8 #38–39 | Not on mobile (MOB §1) | §6.5 | PASS |
| Functional parity (Milestone Completion) | §8 Milestone Completion, §4.2 | §8 #19 | §5 #10, #14 | §6.6 | PASS |
| Functional parity (Change Request) | §8 Change Request, §4.2 | §8 #20–22 | §5 #11–12, #15 | §6.7 | PASS |
| Functional parity (Timesheet) | §8 Timesheet, §4.3 | §8 #23–27 | §5 #2–5, #13 | §6.8 | PASS |
| Budgets & Cost Roll-up | §3, §4.4 | §8 #28–30 | Not on mobile (MOB §1) | §6.9 | PASS (mobile exclusion explicit) |
| Functional parity (Project Invoice) | §8 Project Invoice, §4.4 | §8 #31–35 | §5 #16 (approve only) | §6.10 | PASS |
| Reports & Audit Readiness | §3, §4.5 | §8 #40–45 | Not on mobile (MOB §1) | §6.11 | PASS (mobile exclusion explicit) |
| Projects Configuration | §3 | §8 #46–49 | Not on mobile (MOB §1) | §6.12 | PASS |
| Business rule — capacity justification | §6 | §12, §13 | §4, §5 #5 (server-authoritative) | §9, §10 (`CAPACITY_JUSTIFICATION_REQUIRED`) | PASS |
| Business rule — milestone invoiceable only after completion + approval | §6 | §12, §13 | §7 (server-authoritative) | §9, §10 (`MILESTONE_NOT_INVOICEABLE`) | PASS |
| Business rule — fixed-price decoupled from timesheet | §6 | §12, §13 | §7 (server-authoritative) | §9, §10 (`FIXED_PRICE_TIMESHEET_COUPLED`) | PASS |
| Business rule — Employee master owned by MOD-007 | §13 | §13 | §1 (no master authoring) | §10 (`EMPLOYEE_OWNED_BY_HRMS`) | PASS |
| Business rule — ledger posting owned by MOD-002 | §13 | §13 | §1 (out of scope) | §10 (`LEDGER_OWNED_BY_ACCOUNTING`) | PASS |
| Consumed events read-only | §10, §13 | §12, §13 | (server-side) | §9, §10 (`CONSUMED_EVENT_READ_ONLY`) | PASS |
| Validation surface | §6 | §12 | §6 (mirrors) | §9 | PASS |
| Security — tenant isolation, RBAC/ABAC | §11, §13 | §25 | §15 | §3, §4, §18 | PASS |
| Permissions — business roles | PRD §3 (via §11) | §7 | (inherited) | §4 | PASS |
| Error handling | (platform) | §20 | (native platform) | §10 | PASS |
| Notifications | §9, §11 ENG-025 | §19 | §9 | §15 | PASS |
| Accessibility | PRD §11 (ADR-081) | §23 | §17 | N/A (API) | PASS |
| Audit | §11 ENG-004, ADR-014 | §27 | §15 | §16 | PASS |
| Performance | PRD §11 | §26 | §16 | §19 | PASS |
| Events published — count and set | §9 (4 events) | §19 references | §9 (push subset) | §15 (4 events) | PASS |
| Events consumed | §10 (3 events) | §12, §13 | (server-side) | §15 | PASS |
| Traceability matrix present | (governance) | §28 | §18 | §20 | PASS |
| No invented features | §13, §15 | §28 (no open items) | §11 (GPS N/A) | §14 (webhooks N/A) | PASS |

## 3. Deviations

None. Intentional platform exclusions (mobile Resource / Rate Card authoring, mobile Budgets & Cost Roll-up, mobile Project Invoice authoring, mobile reports and audit surface, mobile Projects Configuration, mobile GPS, API webhooks) are traced to Publication §13 / §15 or MOB §1 scope and are not deviations.

## 4. Risks

- **R-1 (Low):** Consultant mobile capture may accumulate deferred-write queues in low-connectivity environments (client sites, travel). Mitigation: MOB-010 §7 offline queue reconciliation and §8 delta-sync.
- **R-2 (Low):** Cost roll-up depends on timely arrival of `PayrollProcessed` from MOD-008. Mitigation: platform Event Engine (`ENG-024`) delivery guarantees per Publication §11.

## 5. Required Corrections

None.

## 6. Certification Result

**PASS** — WEB-010, MOB-010, and API-010 are cross-platform consistent and faithful to the MOD-010 Publication.

## 7. Handoff

Repository state: `MOD010_CROSS_PLATFORM_CERTIFIED`. Next artifact: VR-010 Verification.
