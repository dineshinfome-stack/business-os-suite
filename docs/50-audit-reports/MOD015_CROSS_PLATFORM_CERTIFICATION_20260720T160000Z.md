---
title: "MOD-015 POS — Cross-Platform Certification (CPC-015)"
summary: "Cross-Platform Certification verifying consistency across MOD-015 Publication, WEB-015, MOB-015, and API-015. Documentation-only certification."
report_id: "MOD015_CROSS_PLATFORM_CERTIFICATION_20260720T160000Z"
spec_id: "CPC-015"
module_id: "MOD-015"
module_name: "POS"
version: "1.0"
status: "Pass"
owner: "Revenue"
layer: "audit"
updated: "2026-07-20"
tags: ["certification", "cross-platform", "MOD-015", "pos", "CPC-015"]
document_type: "Cross-Platform Certification"
source_publication: "docs/45-module-publications/pos/MOD-015_MODULE_PUBLICATION.md"
inputs:
  - "docs/60-solution-design/web/pos/WEB-015_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/mobile/pos/MOB-015_SOLUTION_DESIGN.md"
  - "docs/60-solution-design/api/pos/API-015_SOLUTION_DESIGN.md"
---

# MOD-015 POS — Cross-Platform Certification (CPC-015)

Certifies consistency of WEB-015, MOB-015, and API-015 against the [`MOD-015 Publication`](../45-module-publications/pos/MOD-015_MODULE_PUBLICATION.md).

## 1. Inputs

- Publication: `docs/45-module-publications/pos/MOD-015_MODULE_PUBLICATION.md`
- WEB: `docs/60-solution-design/web/pos/WEB-015_SOLUTION_DESIGN.md`
- MOB: `docs/60-solution-design/mobile/pos/MOB-015_SOLUTION_DESIGN.md`
- API: `docs/60-solution-design/api/pos/API-015_SOLUTION_DESIGN.md`

## 2. Compliance Matrix

| Dimension | Publication Anchor | WEB-015 | MOB-015 | API-015 | Result |
| --- | --- | --- | --- | --- | --- |
| Functional parity (Store) | §7 Store | §8 #5–11 | Not on mobile (MOB §1); §5 #22 read-only | §6.1 | PASS |
| Functional parity (Counter) | §7 Counter | §8 #12–17 | §5 #22 read-only | §6.2 | PASS |
| Functional parity (Offer) | §7 Offer | §8 #18–20 | §5 #23 read-only | §6.3 | PASS |
| Functional parity (Loyalty Program / Gift Cards) | §7 Loyalty Program, §4.4 | §8 #21–24 | §5 #4, #23 | §6.4 | PASS |
| Functional parity (POS Sale) | §8 POS Sale, §4.2, §4.3 | §8 #25–42 | §5 #1–12 | §6.5 | PASS |
| Functional parity (POS Return) | §8 POS Return, §4.4 | §8 #43–48 | §5 #13–16 | §6.6 | PASS |
| Functional parity (Cash Deposit) | §8 Cash Deposit, §4.5 | §8 #49–52 | §5 #17–18 | §6.7 | PASS |
| Functional parity (Day Close) | §8 Day Close, §4.5 | §8 #53–60 | §5 #19–21 | §6.8 | PASS |
| Reports & Audit Readiness | §3, §4.5 | §8 #61–66 | Not on mobile (MOB §1) | §6.9 | PASS (mobile exclusion explicit) |
| POS Configuration | §3 | §8 #67–71 | Not on mobile (MOB §1) | §6.10 | PASS |
| Business rule — supervisor override for beyond-threshold discount | §6 | §12, §13 | §5 #3 (server-enforced) | §9, §10 (`POS.DISCOUNT_APPROVAL_REQUIRED`) | PASS |
| Business rule — return within window | §6 | §12, §13 | §5 #14 (server-enforced) | §9, §10 (`POS.RETURN_WINDOW_EXPIRED`) | PASS |
| Business rule — mismatched cash requires approval on day close | §6 | §12, §13 | §5 #20 (server-enforced) | §9, §10 (`POS.DAY_CLOSE_MISMATCH_APPROVAL_REQUIRED`) | PASS |
| Business rule — tender totals equal sale total | §4.3 | §12 | §5 #7–8 (server-enforced) | §9, §10 (`POS.TENDER_TOTAL_MISMATCH`) | PASS |
| Business rule — offline sale deterministic reconciliation | §4.2 | §8 #41–42, §21 | §7 | §6.5 (`:offline-capture`, `:offline-reconcile`), §10 (`POS.OFFLINE_RECONCILIATION_CONFLICT`) | PASS |
| Business rule — ledger posting owned by MOD-002 | §13 | §13 | §1 (out of scope) | §10 (`POS.LEDGER_OWNED_BY_ACCOUNTING`) | PASS |
| Business rule — `OfferPublished` consumed read-only | §10, §13 | §12, §13, §19 | §5 #4 | §10 (`POS.OFFER_EVENT_READ_ONLY`) | PASS |
| Business rule — `InventoryLowStock` consumed read-only | §10, §13 | §8 #65, §19 | §9 | §10 (`POS.INVENTORY_LOW_STOCK_EVENT_READ_ONLY`) | PASS |
| Business rule — Item / price / stock owned by MOD-005 | §13 | §14 | §5 #2 (Inventory lookups) | §10 (`POS.INVENTORY_ITEM_READ_ONLY`) | PASS |
| Business rule — cross-module KPI ownership at MOD-017 | §13 | §17 | (out of scope) | §10 (`POS.KPI_OWNED_BY_MOD017`) | PASS |
| Validation surface | §6 | §12 | §6 (mirrors) | §9 | PASS |
| Security — tenant isolation, RBAC/ABAC | §11, §13 | §25 | §15 | §3, §4, §18 | PASS |
| Payment card data handling | §4.3, §11 ENG-023 | §25 (never persisted client-side beyond txn window) | §15 (never on device) | §7, §18 (PAN never in POS payloads) | PASS |
| Permissions — business roles | PRD §3 (via §11) | §7 | (inherited) | §4 | PASS |
| Error handling | (platform) | §20 | (native platform) | §10 | PASS |
| Notifications | §9, §11 ENG-025, §4.3 (receipts), §10 (`InventoryLowStock`) | §19 | §9 | §15 | PASS |
| Accessibility | PRD §11 (ADR-081) | §23 | §17 | N/A (API) | PASS |
| Audit | §11 ENG-004, ADR-014 (incl. reprints, overrides, mismatch approvals) | §27 | §15 | §16 | PASS |
| Performance | PRD §11 | §26 | §16 | §19 | PASS |
| GPS scope | Publication §7/§8/§11 authorize none | N/A on web | §11 N/A (explicit) | (server-side; N/A) | PASS |
| Events published — count and set | §9 (3 events) | §19 references | §9 (push subset) | §15 (3 events) | PASS |
| Events consumed | §10 | §12, §13, §19 | §9 | §15 | PASS |
| Traceability matrix present | (governance) | §28 | §18 | §20 | PASS |
| No invented features / events | §13, §15 | §28 (no open items) | §11 (GPS N/A per Publication) | §14 (webhooks N/A); §15 (events verbatim from §9) | PASS |

## 3. Deviations

None. Intentional platform exclusions (mobile excluded from Store / Counter / Offer / Loyalty master authoring, POS Configuration authoring, reports and audit surface, and offline reconciliation workspace; API webhooks) are traced to Publication §13 / §15, WEB-015 §8, and MOB-015 §1 scope and are not deviations. GPS is `N/A` on mobile per Publication authorization (no GPS-dependent master data, transaction, or engine).

## 4. Risks

- **R-1 (Low):** Offline sale queues may accumulate on mobile in low-connectivity retail environments. Mitigation: MOB-015 §7 offline queue reconciliation and §8 delta-sync; server enforces business rules on reconcile per Publication §6.
- **R-2 (Low):** Ledger-effect timeliness depends on prompt MOD-002 consumption of `POSSaleCompleted`, `POSReturnProcessed`, and `POSDayClosed`. Mitigation: platform Event Engine (`ENG-024`) delivery guarantees per Publication §11.
- **R-3 (Low):** Payment-terminal availability affects card/digital tenders; cash tender remains available. Mitigation: ENG-023 error surfacing per WEB-015 §20 and MOB-015 §5 #6.

## 5. Required Corrections

None.

## 6. Certification Result

**PASS** — WEB-015, MOB-015, and API-015 are cross-platform consistent and faithful to the MOD-015 Publication.

## 7. Handoff

Repository state: `MOD015_CROSS_PLATFORM_CERTIFIED`. Next artifact: VR-015 Verification.
