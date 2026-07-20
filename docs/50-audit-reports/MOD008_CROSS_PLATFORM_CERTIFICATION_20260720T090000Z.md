---
title: "MOD-008 Payroll — Cross-Platform Certification (CPC-008)"
summary: "Cross-Platform Certification verifying consistency across MOD-008 Publication, WEB-008, MOB-008, and API-008. Documentation-only certification."
report_id: "MOD008_CROSS_PLATFORM_CERTIFICATION_20260720T090000Z"
spec_id: "CPC-008"
module_id: "MOD-008"
module_name: "Payroll"
version: "1.0"
status: "Pass"
owner: "People"
layer: "audit"
updated: "2026-07-20"
tags: ["certification", "cross-platform", "MOD-008", "payroll", "CPC-008"]
document_type: "Cross-Platform Certification"
source_publication: "docs/45-module-publications/payroll/MOD-008_MODULE_PUBLICATION.md"
inputs:
  - "docs/60-solution-design/web/payroll/WEB-008_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/mobile/payroll/MOB-008_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/api/payroll/API-008_SOLUTION_DESIGN.md"
---

# MOD-008 Payroll — Cross-Platform Certification (CPC-008)

Certifies consistency of WEB-008, MOB-008, and API-008 against the [`MOD-008 Publication`](../45-module-publications/payroll/MOD-008_MODULE_PUBLICATION.md).

## 1. Inputs

- Publication: `docs/45-module-publications/payroll/MOD-008_MODULE_PUBLICATION.md`
- WEB: `docs/60-solution-design/web/payroll/WEB-008_SOLUTION_DESIGN.md`
- MOB: `docs/60-solution-design/mobile/payroll/MOB-008_SOLUTION_DESIGN.md`
- API: `docs/60-solution-design/api/payroll/API-008_SOLUTION_DESIGN.md`

## 2. Compliance Matrix

| Dimension | Publication Anchor | WEB-008 | MOB-008 | API-008 | Result |
| --- | --- | --- | --- | --- | --- |
| Functional parity (Salary Structure) | §7 Salary Structure | §8 #2–4 | Not authoring on mobile (MOB §1) | §6.1 | PASS (mobile exclusion explicit) |
| Functional parity (Component) | §7 Component | §8 #5–6 | Not authoring on mobile | §6.2 | PASS |
| Functional parity (Bank Mandate) | §7 Bank Mandate | §8 #7–8 | Not authoring on mobile | §6.3 | PASS |
| Functional parity (Statutory Setup) | §7 Statutory Setup, §4.3 | §8 #9–10 | Not authoring on mobile | §6.4 | PASS |
| Functional parity (Payroll Run) | §8 Payroll Run, §4.2 | §8 #11–19 | §5 #10 (approver inbox) | §6.5 | PASS |
| Functional parity (Reimbursement) | §8 Reimbursement, §4.4 | §8 #20–22 | §5 #4–6, #11 | §6.6 | PASS |
| Functional parity (Advance) | §8 Advance, §4.4 | §8 #23–25 | §5 #7–9, #12 | §6.7 | PASS |
| Functional parity (Payslip) | §8 Payslip, §4.5 | §8 #26–27 | §5 #2–3 | §6.8 | PASS |
| Disbursement (file generation, delivery) | §4.5, §11 ENG-023 | §8 #28–29 | Notification only (§9) | §6.9 | PASS |
| Posting invocation (ENG-015/016) | §4.5, §11 | §8 #30 | (server-side; N/A on mobile) | §6.10 | PASS |
| Reports & Audit Readiness | §3, §4.6 | §8 #31–35 | Not on mobile (MOB §1) | §6.11 | PASS (mobile exclusion explicit) |
| Payroll Configuration | §3 | §8 #36–38 | Not on mobile (MOB §1) | §6.12 | PASS |
| Business rule — statutory-complete before finalize | §6 | §12, §13 | §7 (server-authoritative) | §9, §10 (`STATUTORY_INCOMPLETE`) | PASS |
| Business rule — reversal creates reversing run | §6 | §13 | §7 (server-authoritative) | §9, §10 (`RUN_REVERSAL_REQUIRED`, `RUN_ALREADY_FINALIZED`) | PASS |
| Business rule — disbursement immutable | §6 | §13 | §9 (notification only) | §9, §10 (`DISBURSEMENT_IMMUTABLE`) | PASS |
| Business rule — HRMS signals read-only | §10, §13 | §12, §13 | (server-side) | §9, §10 (`HRMS_SIGNAL_READ_ONLY`) | PASS |
| Business rule — no ledger posting owned by Payroll | §13 | §13 (invocation only) | §1 (out of scope) | §6.10 (invocation via ENG-015/016) | PASS |
| Validation surface | §6 | §12 | §6 (mirrors) | §9 | PASS |
| Security — tenant isolation, RBAC/ABAC | §11, §13 | §25 | §15 | §3, §4, §18 | PASS |
| Permissions — business roles | PRD §3 (via §11) | §7 | (inherited) | §4 | PASS |
| Error handling | (platform) | §20 | (native platform) | §10 | PASS |
| Notifications | §9, §11 ENG-025 | §19 | §9 | §15 | PASS |
| Accessibility | PRD §11 (ADR-081) | §23 | §17 | N/A (API) | PASS |
| Audit | §11 ENG-004, ADR-014 | §27 | §15 | §16 | PASS |
| Performance | PRD §11 | §26 | §16 | §19 | PASS |
| Events published — count and set | §9 (4 events) | §19 references | §9 (push subset) | §15 (4 events) | PASS |
| Events consumed | §10 (4 events) | §12, §13 | (server-side) | §15 | PASS |
| Traceability matrix present | (governance) | §28 | §18 | §20 | PASS |
| No invented features | §13, §15 | §28 (no open items) | §11 (GPS N/A) | §14 (webhooks N/A) | PASS |

## 3. Deviations

None. Intentional platform exclusions (mobile master authoring, mobile Payroll Run computation workspace, mobile disbursement/posting, mobile reports/audit, mobile Payroll Configuration, mobile GPS, API webhooks) are traced to Publication §13/§15 or MOB §1 scope and are not deviations.

## 4. Risks

- **R-1 (Low):** Batch gross/statutory computations on very large payrolls may approach the platform batch envelope. Mitigation: covered by Publication §11 ENG-014 (Scheduler) and PRD §11 batch envelope.
- **R-2 (Low):** Disbursement delivery to external Bank systems depends on ENG-023 availability. Mitigation: retry/backoff owned by ENG-023 per Publication §11.

## 5. Required Corrections

None.

## 6. Certification Result

**PASS** — WEB-008, MOB-008, and API-008 are cross-platform consistent and faithful to the MOD-008 Publication.

## 7. Handoff

Repository state: `MOD008_CROSS_PLATFORM_CERTIFIED`. Next artifact: VR-008 Verification.
