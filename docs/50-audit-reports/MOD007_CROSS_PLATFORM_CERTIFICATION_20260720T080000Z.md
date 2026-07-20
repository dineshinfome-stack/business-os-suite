---
title: "MOD-007 HRMS — Cross-Platform Certification (CPC-007)"
summary: "Cross-Platform Certification verifying consistency across MOD-007 Publication, WEB-007, MOB-007, and API-007. Documentation-only certification."
report_id: "MOD007_CROSS_PLATFORM_CERTIFICATION_20260720T080000Z"
spec_id: "CPC-007"
module_id: "MOD-007"
module_name: "HRMS"
version: "1.0"
status: "Pass"
owner: "People"
layer: "audit"
updated: "2026-07-20"
tags: ["certification", "cross-platform", "MOD-007", "hrms", "CPC-007"]
document_type: "Cross-Platform Certification"
source_publication: "docs/45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md"
inputs:
  - "docs/60-solution-design/web/hrms/WEB-007_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/mobile/hrms/MOB-007_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/api/hrms/API-007_SOLUTION_DESIGN.md"
---

# MOD-007 HRMS — Cross-Platform Certification (CPC-007)

Certifies consistency of WEB-007, MOB-007, and API-007 against the [`MOD-007 Publication`](../45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md).

## 1. Inputs

- Publication: `docs/45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md`
- WEB: `docs/60-solution-design/web/hrms/WEB-007_SOLUTION_DESIGN.md`
- MOB: `docs/60-solution-design/mobile/hrms/MOB-007_SOLUTION_DESIGN.md`
- API: `docs/60-solution-design/api/hrms/API-007_SOLUTION_DESIGN.md`

## 2. Compliance Matrix

| Dimension | Publication Anchor | WEB-007 | MOB-007 | API-007 | Result |
| --- | --- | --- | --- | --- | --- |
| Functional parity (Employee) | §7 Employee | §8 #2–5 | §5 #2–3 | §6.1 | PASS |
| Functional parity (Position/Department/Grade/Shift) | §7 | §8 #6–13 | Not authoring on mobile (MOB §1) | §6.2–§6.5 | PASS (mobile exclusion explicit) |
| Functional parity (Leave Type) | §7 | §8 #14–15 | Not authoring on mobile | §6.6 | PASS |
| Functional parity (Onboarding Task) | §8, §4.2 | §8 #16–17 | §5 #12 (inbox action) | §6.7 | PASS |
| Functional parity (Exit Clearance) | §8, §4.2 | §8 #18–19 | Notification only | §6.8 | PASS |
| Functional parity (Attendance + biometric) | §8, §4.3 | §8 #20–22 | §5 #5–6 | §6.9 | PASS |
| Functional parity (Leave Request) | §8, §6 | §8 #23–26 | §5 #7–11 | §6.10 | PASS |
| Functional parity (Appraisal) | §8, §4.4 | §8 #27–28 | §5 #13 | §6.11 | PASS |
| L&D Consumption | §4.5, §10 | §8 #29 | (server-side; read on demand) | §6.13 | PASS |
| Self-Service | §3, §4.5 | §8 #30–33 | §5 #4, #7, #14 | §6.12 | PASS |
| Reports & Audit Readiness | §3, §4.6 | §8 #34–39 | Not on mobile (MOB §1) | §6.14 | PASS (mobile exclusion explicit) |
| HR Configuration | §3 | §8 #40–43 | Not on mobile (MOB §1) | §6.15 | PASS |
| Business rule — self-approval forbidden | §6 | §12, §13 | §4 (server enforced), §5 #11 | §9, §10 (`LEAVE_SELF_APPROVAL_FORBIDDEN`) | PASS |
| Business rule — leave balance non-negative | §6 | §12, §13 | §7 (server reconciles) | §9, §10 (`LEAVE_BALANCE_NEGATIVE_FORBIDDEN`) | PASS |
| Business rule — data-classification enforcement | §6 | §11, §12, §25 | §15 | §9, §10 (`DATA_CLASSIFICATION_DENIED`), §18 | PASS |
| Business rule — no ledger/payroll from HRMS | §6, §13 | §13 (UI never triggers) | §1 (out of scope) | §2 (out of scope) | PASS |
| Validation surface | §6 | §12 | §6 | §9 | PASS |
| Security — tenant isolation, RBAC/ABAC | §11, §13 | §25 | §15 | §3, §4, §18 | PASS |
| Permissions — business roles | PRD §3 (via §11) | §7 | (inherited) | §4 | PASS |
| Error handling | (platform) | §20 | (native platform) | §10 | PASS |
| Notifications | §9, §11 ENG-025 | §19 | §9 | §15 | PASS |
| Accessibility | PRD §11 (ADR-081) | §23 | §17 | N/A (API) | PASS |
| Audit | §11 ENG-004, ADR-014 | §27 | §15 | §16 | PASS |
| Performance | PRD §11 | §26 | §16 | §19 | PASS |
| Events published — count and set | §9 (5 events) | §19 references | §9 (push subset) | §15 (5 events) | PASS |
| Events consumed | §10 | §19 references | (server) | §15 | PASS |
| Traceability matrix present | (governance) | §28 | §18 | §20 | PASS |
| No invented features | §13, §15 | §28 (no open items) | §11 (GPS N/A) | §14 (webhooks N/A) | PASS |

## 3. Deviations

None. Intentional platform exclusions (mobile HR Configuration authoring, mobile master authoring, mobile reports/audit, mobile GPS, API webhooks) are traced to Publication §13/§15 or MOB §1 scope and are not deviations.

## 4. Risks

- **R-1 (Low):** Divergent field ordering between WEB and MOB Self-Service forms may create user friction. Mitigation: form catalogue reviewed during implementation planning.
- **R-2 (Low):** Biometric ingestion (§6.9) throughput may exceed target under peak load. Mitigation: covered by Publication §11 ENG-023 responsibilities and platform batch envelope (PRD §11).

## 5. Required Corrections

None.

## 6. Certification Result

**PASS** — WEB-007, MOB-007, and API-007 are cross-platform consistent and faithful to the MOD-007 Publication.

## 7. Handoff

Repository state: `MOD007_CROSS_PLATFORM_CERTIFIED`. Next artifact: VR-007 Verification.
