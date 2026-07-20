---
title: "MOD-006 CRM — Cross-Platform Certification (CPC-006)"
summary: "Cross-Platform Certification verifying consistency across MOD-006 Publication, WEB-006, MOB-006, and API-006. Documentation-only certification."
report_id: "MOD006_CROSS_PLATFORM_CERTIFICATION_20260720T070000Z"
spec_id: "CPC-006"
module_id: "MOD-006"
module_name: "CRM"
version: "1.0"
status: "Pass"
owner: "Revenue"
layer: "audit"
updated: "2026-07-20"
tags: ["certification", "cross-platform", "MOD-006", "crm", "CPC-006"]
document_type: "Cross-Platform Certification"
source_publication: "docs/45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md"
inputs:
  - "docs/60-solution-design/web/crm/WEB-006_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/mobile/crm/MOB-006_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/api/crm/API-006_SOLUTION_DESIGN.md"
---

# MOD-006 CRM — Cross-Platform Certification (CPC-006)

Certifies consistency of WEB-006, MOB-006, and API-006 against the [`MOD-006 Publication`](../45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md).

## 1. Inputs

- Publication: `docs/45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md`
- WEB: `docs/60-solution-design/web/crm/WEB-006_SOLUTION_DESIGN.md`
- MOB: `docs/60-solution-design/mobile/crm/MOB-006_SOLUTION_DESIGN.md`
- API: `docs/60-solution-design/api/crm/API-006_SOLUTION_DESIGN.md`

## 2. Compliance Matrix

| Dimension | Publication Anchor | WEB-006 | MOB-006 | API-006 | Result |
| --- | --- | --- | --- | --- | --- |
| Functional parity (Account) | §7 Account | §8 #2–4 | §5 #2–4 | §6.1 | PASS |
| Functional parity (Contact) | §7 Contact | §8 #5–7 | §5 #4 | §6.2 | PASS |
| Functional parity (Lead + convert) | §7, §6 | §8 #8–11 | §5 #5–8, §4 | §6.3 | PASS |
| Functional parity (Opportunity + win/loss) | §7, §6 | §8 #12–15 | §5 #9–10, §4 | §6.4 | PASS |
| Functional parity (Campaign/Segment) | §7 | §8 #20–23 | §5 #15 (read) | §6.5 | PASS (mobile authoring intentionally excluded per MOB §1) |
| Functional parity (Activity/Meeting) | §8 | §8 #16–19 | §5 #11–14 | §6.6 | PASS |
| Functional parity (Campaign Send + consent) | §8, §6 | §8 #24 | §5 #15 (read status) | §6.7 | PASS |
| Customer 360 & Reports | §3, §4.6 | §8 #25–30 | §5 #3 (360 read) | §6.8 | PASS |
| CRM Configuration | §3 | §8 #31–34 | Not on mobile (MOB §1) | §6.9 | PASS (mobile exclusion explicit) |
| Business rule — single-shot conversion | §6 | §13 | §4, §5 #8 | §9, §10 (`LEAD_ALREADY_CONVERTED`) | PASS |
| Business rule — assignment resolves to one owner | §6 | §12, §13 | §4 | §9, §10 (`ASSIGNMENT_UNRESOLVED`) | PASS |
| Business rule — marketing consent | §6 | §12, §13 (visible exclusion) | §5 #15 (read only) | §9, §10 (`CONSENT_MISSING`) | PASS |
| Business rule — opportunity terminal win/loss | §6 | §13 | §4, §5 #10 | §10 (`OPPORTUNITY_TERMINAL`) | PASS |
| Validation surface | §6 | §12 | §6 | §9 | PASS |
| Security — tenant isolation, RBAC/ABAC | §11, §13 | §24 | §13 | §3, §4, §17 | PASS |
| Permissions — business roles | PRD §3 (via §11) | §7 | (inherited) | §4 | PASS |
| Error handling | (platform) | §19 | (native platform) | §10 | PASS |
| Notifications | §9, §11 ENG-025 | §18 | §9 | §15 | PASS |
| Accessibility | PRD §11 (ADR-081) | §22 | §15 | N/A (API) | PASS |
| Audit | §11 ENG-004, ADR-014 | §26 | §13 | §16 | PASS |
| Performance | PRD §11 | §25 | §14 | §18 | PASS |
| Events published — count and set | §9 (5 events) | §18 references | §9 (push subset) | §15 (5 events) | PASS |
| Events consumed | §10 | §17 references | (server) | §15 | PASS |
| Traceability matrix present | (governance) | §29 | §17 | §21 | PASS |
| No invented features | §13, §15 | §28 open items = none | §11 (GPS N/A) | §14 (webhooks N/A) | PASS |

## 3. Deviations

None. Intentional platform exclusions (mobile CRM Configuration authoring, mobile campaign authoring, API webhooks, mobile GPS) are traced to Publication §13/§15 or MOB §1 scope and are not deviations.

## 4. Risks

- **R-1 (Low):** Divergent field ordering between WEB and MOB forms may create user friction. Mitigation: form catalogue reviewed during implementation planning.
- **R-2 (Low):** Read-model latency for Customer 360 may exceed target under peak load. Mitigation: covered by Publication §11 ENG-028 read-model responsibilities.

## 5. Required Corrections

None.

## 6. Certification Result

**PASS** — WEB-006, MOB-006, and API-006 are cross-platform consistent and faithful to the MOD-006 Publication.

## 7. Handoff

Repository state: `MOD006_CROSS_PLATFORM_CERTIFIED`. Next artifact: VR-006 Verification.
