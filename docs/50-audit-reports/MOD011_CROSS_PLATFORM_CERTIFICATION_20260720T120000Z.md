---
title: "MOD-011 AMC — Cross-Platform Certification (CPC-011)"
summary: "Cross-Platform Certification verifying consistency across MOD-011 Publication, WEB-011, MOB-011, and API-011. Documentation-only certification."
report_id: "MOD011_CROSS_PLATFORM_CERTIFICATION_20260720T120000Z"
spec_id: "CPC-011"
module_id: "MOD-011"
module_name: "AMC"
version: "1.0"
status: "Pass"
owner: "Service"
layer: "audit"
updated: "2026-07-20"
tags: ["certification", "cross-platform", "MOD-011", "amc", "CPC-011"]
document_type: "Cross-Platform Certification"
source_publication: "docs/45-module-publications/amc/MOD-011_MODULE_PUBLICATION.md"
inputs:
  - "docs/60-solution-design/web/amc/WEB-011_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/mobile/amc/MOB-011_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/api/amc/API-011_SOLUTION_DESIGN.md"
---

# MOD-011 AMC — Cross-Platform Certification (CPC-011)

Certifies consistency of WEB-011, MOB-011, and API-011 against the [`MOD-011 Publication`](../45-module-publications/amc/MOD-011_MODULE_PUBLICATION.md).

## 1. Inputs

- Publication: `docs/45-module-publications/amc/MOD-011_MODULE_PUBLICATION.md`
- WEB: `docs/60-solution-design/web/amc/WEB-011_SOLUTION_DESIGN.md`
- MOB: `docs/60-solution-design/mobile/amc/MOB-011_SOLUTION_DESIGN.md`
- API: `docs/60-solution-design/api/amc/API-011_SOLUTION_DESIGN.md`

## 2. Compliance Matrix

| Dimension | Publication Anchor | WEB-011 | MOB-011 | API-011 | Result |
| --- | --- | --- | --- | --- | --- |
| Functional parity (Contract) | §7 Contract, §8 Contract | §8 #2–4, #12 | §5 #6–7 (read-only) | §6.1 | PASS |
| Functional parity (Entitlement) | §7 Entitlement | §8 #13–15 | §5 #8 (read-only) | §6.2 | PASS |
| Functional parity (Coverage) | §7 Coverage | §8 #16–18 | §5 #9 (read-only) | §6.3 | PASS |
| Functional parity (Renewal Terms) | §7 Renewal Terms | §8 #24–25 | Not on mobile (MOB §1) | §6.4 | PASS |
| Functional parity (Visit Schedule) | §8 Visit Schedule, §4.2 | §8 #19–23 | §5 #2–5, #10 | §6.5 | PASS |
| Functional parity (Renewal) | §8 Renewal, §4.3 | §8 #26–30 | §5 #12–13 | §6.6 | PASS |
| Functional parity (Contract Invoice) | §8 Contract Invoice, §4.3 | §8 #31–35 | §5 #11 (read-only) | §6.7 | PASS (mobile authoring excluded per MOB §1) |
| Reports & Audit Readiness | §3, §4.4 | §8 #36–40 | Not on mobile (MOB §1) | §6.8 | PASS (mobile exclusion explicit) |
| AMC Configuration | §3 | §8 #41–45 | Not on mobile (MOB §1) | §6.9 | PASS |
| Business rule — visit outside coverage window | §6 | §12, §13 | §4, §5 #4 (server-authoritative) | §9, §10 (`VISIT_OUTSIDE_COVERAGE`) | PASS |
| Business rule — renewal notice-period | §6 | §12, §13 | §4, §7 (server-authoritative) | §9, §10 (`RENEWAL_NOTICE_PERIOD_EXPIRED`) | PASS |
| Business rule — post-termination entitlement block | §6 | §12, §13 | §5 #8 (read-only) | §9, §10 (`CONTRACT_TERMINATED_ENTITLEMENT_BLOCKED`) | PASS |
| Business rule — Customer master owned by MOD-006 | §13 | §13 | §1 (no master authoring) | §10 (`CUSTOMER_OWNED_BY_CRM`) | PASS |
| Business rule — ledger posting owned by MOD-002 | §13 | §13 | §1 (out of scope) | §10 (`LEDGER_OWNED_BY_ACCOUNTING`) | PASS |
| Consumed events read-only | §10, §13 | §12, §13 | (server-side) | §9, §10 (`CONSUMED_EVENT_READ_ONLY`) | PASS |
| Validation surface | §6 | §12 | §6 (mirrors) | §9 | PASS |
| Security — tenant isolation, RBAC/ABAC | §11, §13 | §25 | §15 | §3, §4, §18 | PASS |
| Permissions — business roles | PRD §3 (via §11) | §7 | (inherited) | §4 | PASS |
| Error handling | (platform) | §20 | (native platform) | §10 | PASS |
| Notifications | §9, §11 ENG-025, §3 (SLA/escalation) | §19 | §9 | §15 | PASS |
| Accessibility | PRD §11 (ADR-081) | §23 | §17 | N/A (API) | PASS |
| Audit | §11 ENG-004, ADR-014 | §27 | §15 | §16 | PASS |
| Performance | PRD §11 | §26 | §16 | §19 | PASS |
| Events published — count and set | §9 (4 events) | §19 references | §9 (push subset) | §15 (4 events) | PASS |
| Events consumed | §10 (3 events) | §12, §13 | (server-side) | §15 | PASS |
| Traceability matrix present | (governance) | §28 | §18 | §20 | PASS |
| No invented features | §13, §15 | §28 (no open items) | §11 (GPS N/A) | §14 (webhooks N/A) | PASS |

## 3. Deviations

None. Intentional platform exclusions (mobile Renewal Terms authoring, mobile Contract Invoice authoring, mobile preventive schedule generation, mobile reports and audit surface, mobile AMC Configuration, mobile GPS — owned by MOD-012 per Publication §13, API webhooks) are traced to Publication §13 / §15 or MOB §1 scope and are not deviations.

## 4. Risks

- **R-1 (Low):** Field Coordinator mobile capture may accumulate deferred-write queues in low-connectivity environments (customer sites). Mitigation: MOB-011 §7 offline queue reconciliation and §8 delta-sync.
- **R-2 (Low):** Entitlement consumption timeliness depends on prompt arrival of `FieldVisitCompleted` (MOD-012) and `ServiceTicketClosed` (MOD-016). Mitigation: platform Event Engine (`ENG-024`) delivery guarantees per Publication §11.

## 5. Required Corrections

None.

## 6. Certification Result

**PASS** — WEB-011, MOB-011, and API-011 are cross-platform consistent and faithful to the MOD-011 Publication.

## 7. Handoff

Repository state: `MOD011_CROSS_PLATFORM_CERTIFIED`. Next artifact: VR-011 Verification.
