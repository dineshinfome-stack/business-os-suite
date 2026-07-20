---
title: "MOD-013 Assets — Cross-Platform Certification (CPC-013)"
summary: "Cross-Platform Certification verifying consistency across MOD-013 Publication, WEB-013, MOB-013, and API-013. Documentation-only certification."
report_id: "MOD013_CROSS_PLATFORM_CERTIFICATION_20260720T140000Z"
spec_id: "CPC-013"
module_id: "MOD-013"
module_name: "Assets"
version: "1.0"
status: "Pass"
owner: "Operations"
layer: "audit"
updated: "2026-07-20"
tags: ["certification", "cross-platform", "MOD-013", "assets", "CPC-013"]
document_type: "Cross-Platform Certification"
source_publication: "docs/45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md"
inputs:
  - "docs/60-solution-design/web/assets/WEB-013_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/mobile/assets/MOB-013_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/api/assets/API-013_SOLUTION_DESIGN.md"
---

# MOD-013 Assets — Cross-Platform Certification (CPC-013)

Certifies consistency of WEB-013, MOB-013, and API-013 against the [`MOD-013 Publication`](../45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md).

## 1. Inputs

- Publication: `docs/45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md`
- WEB: `docs/60-solution-design/web/assets/WEB-013_SOLUTION_DESIGN.md`
- MOB: `docs/60-solution-design/mobile/assets/MOB-013_SOLUTION_DESIGN.md`
- API: `docs/60-solution-design/api/assets/API-013_SOLUTION_DESIGN.md`

## 2. Compliance Matrix

| Dimension | Publication Anchor | WEB-013 | MOB-013 | API-013 | Result |
| --- | --- | --- | --- | --- | --- |
| Functional parity (Asset) | §7 Asset | §8 #2–14 | §5 #2–7 (read-only) | §6.1 | PASS |
| Functional parity (Asset Class) | §7 Asset Class | §8 #15–16 | Not on mobile (MOB §1) | §6.2 | PASS |
| Functional parity (Location) | §7 Location | §8 #17–18 | Not on mobile (MOB §1) | §6.3 | PASS |
| Functional parity (Insurance Policy) | §7 Insurance Policy | §8 #19–20 | §5 #5 (read-only) | §6.4 | PASS |
| Functional parity (Capitalization) | §8 Capitalization, §4.1 | §8 #21–30 | Not on mobile (MOB §1) | §6.5 | PASS |
| Functional parity (Depreciation Method) | §3, §4.2 | §8 #31–32 | Not on mobile (MOB §1) | §6.6 | PASS |
| Functional parity (Depreciation Run) | §8 Depreciation Run, §4.2 | §8 #33–40 | Not on mobile (MOB §1) | §6.7 | PASS |
| Functional parity (Maintenance Order) | §8 Maintenance Order, §4.3 | §8 #41–46 | §5 #8–10 | §6.8 | PASS |
| Functional parity (Calibration) | §4.3 | §8 #47 | §5 #11 (read-only) | §6.9 | PASS |
| Functional parity (Asset Transfer) | §8 Asset Transfer, §4.3 | §8 #48–50 | §5 #12–13 | §6.10 | PASS |
| Functional parity (Disposal) | §8 Disposal, §4.3 | §8 #51–56 | Not on mobile (MOB §1) | §6.11 | PASS |
| Reports & Audit Readiness | §3, §4.4 | §8 #57–61 | Not on mobile (MOB §1) | §6.12 | PASS (mobile exclusion explicit) |
| Assets Configuration | §3 | §8 #62–65 | Not on mobile (MOB §1) | §6.13 | PASS |
| Import | §11 ENG-026 | §8 #66 | Not on mobile (MOB §1) | §6.14 | PASS |
| Business rule — depreciation posted only for active assets | §6 | §12, §13 | §5 #6 (read-only view) | §9, §10 (`DEPRECIATION_ASSET_NOT_ACTIVE`) | PASS |
| Business rule — disposed asset immutable except via reversal | §6 | §12, §13 | §5 #3–7 (read-only) | §9, §10 (`DISPOSED_ASSET_IMMUTABLE`) | PASS |
| Business rule — capitalization amount locked after depreciation | §6 | §12, §13 | (out of scope; MOB §1) | §9, §10 (`CAPITALIZATION_LOCKED`) | PASS |
| Business rule — Asset Transfer changes only Location | §4.3 | §12 | §4 (flow) | §9, §10 (`TRANSFER_ONLY_LOCATION_CHANGES`) | PASS |
| Business rule — ledger posting owned by MOD-002 | §13 | §13 | §1 (out of scope) | §10 (`LEDGER_OWNED_BY_ACCOUNTING`) | PASS |
| Business rule — `PurchaseInvoiceReceived` consumed read-only | §10, §13 | §12, §13 | (server-side) | §10 (`PURCHASE_EVENT_READ_ONLY`) | PASS |
| Business rule — `MaintenanceCompleted` consumed read-only | §10, §13 | §12, §13 | (server-side) | §10 (`MAINTENANCE_EVENT_READ_ONLY`) | PASS |
| Business rule — cross-module KPI ownership at MOD-017 | §13 | §17 | (out of scope) | §10 (`KPI_OWNED_BY_MOD017`) | PASS |
| Validation surface | §6 | §12 | §6 (mirrors) | §9 | PASS |
| Security — tenant isolation, RBAC/ABAC | §11, §13 | §25 | §15 | §3, §4, §18 | PASS |
| Permissions — business roles | PRD §3 (via §11) | §7 | (inherited) | §4 | PASS |
| Error handling | (platform) | §20 | (native platform) | §10 | PASS |
| Notifications | §9, §11 ENG-025, §3, §4.2, §4.3 (scheduled) | §19 | §9 | §15 | PASS |
| Accessibility | PRD §11 (ADR-081) | §23 | §17 | N/A (API) | PASS |
| Audit | §11 ENG-004, ADR-014 | §27 | §15 | §16 | PASS |
| Performance | PRD §11 | §26 | §16 | §19 | PASS |
| GPS scope | (not authorized by Publication) | N/A on web | §11 (N/A — Publication does not authorize) | (server-side) | PASS |
| Events published — count and set | §9 (4 events) | §19 references | §9 (push subset) | §15 (4 events) | PASS |
| Events consumed | §10 | §12, §13 | (server-side) | §15 | PASS |
| Traceability matrix present | (governance) | §28 | §18 | §20 | PASS |
| No invented features / events | §13, §15 | §28 (no open items) | §11 (GPS excluded because Publication does not authorize) | §14 (webhooks N/A); §15 (events verbatim from §9) | PASS |

## 3. Deviations

None. Intentional platform exclusions (mobile excluded from Asset Class / Location master authoring, Capitalization / Depreciation / Disposal authoring, reports and audit surface, Assets Configuration, and imports; API webhooks) are traced to Publication §13 / §15 or MOB §1 scope and are not deviations. GPS is excluded on mobile because the Publication (§3, §4, §7, §8) does not authorize GPS or geo capture for Assets and PRD §8 External Systems does not list Maps / geo services.

## 4. Risks

- **R-1 (Low):** On-site Asset Transfer capture may accumulate deferred-write queues in low-connectivity environments. Mitigation: MOB-013 §7 offline queue reconciliation and §8 delta-sync.
- **R-2 (Low):** Ledger-effect timeliness depends on prompt MOD-002 consumption of `AssetCapitalized`, `DepreciationPosted`, and `AssetDisposed`. Mitigation: platform Event Engine (`ENG-024`) delivery guarantees per Publication §11.
- **R-3 (Low):** Depreciation Schedule correctness depends on deterministic evaluation via ENG-005/012 (Publication §4.2, §11). Mitigation: schedules are immutable once locked (Publication §4.2).

## 5. Required Corrections

None.

## 6. Certification Result

**PASS** — WEB-013, MOB-013, and API-013 are cross-platform consistent and faithful to the MOD-013 Publication.

## 7. Handoff

Repository state: `MOD013_CROSS_PLATFORM_CERTIFIED`. Next artifact: VR-013 Verification.
