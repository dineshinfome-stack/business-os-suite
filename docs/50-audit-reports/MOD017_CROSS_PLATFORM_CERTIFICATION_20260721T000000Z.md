---
title: "MOD-017 Analytics — Cross-Platform Certification (CPC-017)"
summary: "Cross-Platform Certification verifying consistency across MOD-017 Publication, WEB-017, MOB-017, and API-017. Documentation-only certification."
report_id: "MOD017_CROSS_PLATFORM_CERTIFICATION_20260721T000000Z"
spec_id: "CPC-017"
module_id: "MOD-017"
module_name: "Analytics"
version: "1.0"
status: "Pass"
owner: "Insights"
layer: "audit"
updated: "2026-07-21"
tags: ["certification", "cross-platform", "MOD-017", "analytics", "CPC-017"]
document_type: "Cross-Platform Certification"
source_publication: "docs/45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md"
inputs:
  - "docs/60-solution-design/web/WEB-017_ANALYTICS.md"
  - "docs/60-solution-design/mobile/MOB-017_ANALYTICS.md"
  - "docs/60-solution-design/api/API-017_ANALYTICS.md"
---

# MOD-017 Analytics — Cross-Platform Certification (CPC-017)

Certifies consistency of WEB-017, MOB-017, and API-017 against the [`MOD-017 Publication`](../45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md). Documentation-only audit; introduces no new business requirements, workflows, screens, APIs, validation rules, or permissions.

## 1. Inputs

- Publication: `docs/45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md`
- Baseline (reference): `docs/40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md`
- Module PRD (reference): `docs/20-module-prds/analytics/MODULE_PRD.md`
- WEB: `docs/60-solution-design/web/WEB-017_ANALYTICS.md`
- MOB: `docs/60-solution-design/mobile/MOB-017_ANALYTICS.md`
- API: `docs/60-solution-design/api/API-017_ANALYTICS.md`

Precedence: Publication → Baseline → PRD.

## 2. Executive Summary

WEB-017, MOB-017, and API-017 are cross-platform consistent and faithful to the MOD-017 Publication. All five authority groups (Analytics Foundations, KPI Framework, Dashboards & Visualization, Scheduled Distribution/Reporting/Export, Analytical Models & Cross-Module Analytics) are represented on every applicable surface; intentional mobile exclusions (authoring surfaces, configuration, audit-readiness deep views) are declared and traced. Published events (`DashboardShared`, `ReportPublished`, `ModelRunCompleted`, plus Sprint-declared refinements) appear verbatim in the API surface. No deviations, no required corrections.

## 3. Compliance Matrix

| # | Dimension | Publication Anchor | WEB-017 | MOB-017 | API-017 | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Functional parity — Analytics Foundations & Data Marts | §3, §4.1, §7 | §E.22, §E.23, §F.1, §F.2, §C.5, §C.6 | Excluded (MOB §A.2) | §C.1 | PASS |
| 2 | Functional parity — KPI Framework & Metric Catalog | §3, §4.2, §7 | §E.5–§E.8, §F.3, §C.2, §C.3 | §E (KPI consumption), §C.2 | §C.2 | PASS |
| 3 | Functional parity — Dashboards & Visualization | §3, §4.3, §7 | §E.2–§E.4, §F.4, §C.1, §C.4, §G | §C.1, §D, §E (mobile dashboards) | §C.3 | PASS |
| 4 | Functional parity — Scheduled Distribution, Reporting & Export | §3, §4.4, §7, §8 | §E.9–§E.16, §F.5–§F.8, §C.7–§C.9 | §C.3, §C.4 (subscriptions & downloads) | §C.4 | PASS |
| 5 | Functional parity — Analytical Models & Cross-Module Analytics | §3, §4.5, §7, §8 | §E.17–§E.21, §F.9–§F.10, §C.10, §C.11 | §C.6 (Anomaly & cross-module views) | §C.5 | PASS |
| 6 | Feature completeness — All 5 authority groups represented | §4.1–§4.5 | All present | 4/5 (authoring intentionally excluded) | All present | PASS |
| 7 | Workflow — KPI lifecycle `Draft → Active → Inactive → Archived`, single-Active | §6 | §C.3, §E.8 | Server-authoritative; no authoring on mobile | §C.2, §D | PASS |
| 8 | Workflow — Analytical Model lifecycle & single-Active execution | §6 | §C.10, §E.18 | Server-authoritative; §C.5 approval notifications | §C.5, §D | PASS |
| 9 | Business rule — Sensitive-KPI classification & row-level access | §6 | §J.2 (redaction), §E.5–§E.7 | Inherited (server-enforced) | §F, §C.2 | PASS |
| 10 | Business rule — Dashboard freshness declaration via ENG-012 | §6 | §E.3, §G | §C.1 (freshness surfaced) | §C.3, §G | PASS |
| 11 | Business rule — Analytics never mutates source-module transactions | §2, §13 | §J.6 (Read-Only Boundary) | §A.2 (consumption scope) | §A, §E (read-model only) | PASS |
| 12 | Business rule — Read-model-only ingestion via ENG-024 / ENG-026 | §6, §11 | §E.23, §J.6 | Inherited | §E.1, §E.3 | PASS |
| 13 | Validation rule consistency | §6 | §F.1–§F.10 | Mirrors server (no offline-write authority) | §G (validation failures surfaced) | PASS |
| 14 | Role & permission consistency | §11 (ADR-032); PRD §3 | §B.1–§B.6, §J.2 | §B.1–§B.6 | §F (ENG-002/003 enforced) | PASS |
| 15 | Security alignment — RBAC + ABAC, tenant isolation | §11 (ADR-011, ADR-032) | §J.2, §J.5 | Inherited; server-authoritative | §F | PASS |
| 16 | Error handling consistency | §11 (platform) | §J.3 (session), form validation across §F | Native platform surfacing | §G | PASS |
| 17 | Notification consistency — ENG-025 for distributions | §11 (ENG-025), §4.4 | §E.11–§E.14 | §C.4, §C.5 (approval & subscription notifications) | §C.4, §E.4 | PASS |
| 18 | Accessibility consistency | §11 (ADR-081) | §I | §B, §D (mobile a11y inherited) | N/A (API) | PASS |
| 19 | Performance requirements | PRD §11 (Module PRD referenced by Publication §12) | §H (responsive envelopes) | Native | §H | PASS |
| 20 | Audit requirements | §11 (ENG-004, ADR-014) | §J.4, §E.24 | Inherited (server-authoritative) | §F | PASS |
| 21 | GPS scope | Publication §7/§8/§11 authorize none | N/A on web | N/A on mobile (explicit) | N/A | PASS |
| 22 | Offline-write scope | Publication §4 declares no offline-write authority | N/A on web | N/A on mobile (consumption/read-only cache) | N/A | PASS |
| 23 | Events published — set and naming | §9 | §E.3, §E.4 (`DashboardShared`); §E.13, §E.14 (`ReportPublished`); §E.19 (`ModelRunCompleted`) | §C.4, §C.5 (event-driven notifications) | §E.3 verbatim: `DashboardShared`, `ReportPublished`, `ModelRunCompleted`, plus Sprint-declared refinements | PASS |
| 24 | Events consumed — all module domain events read-only via ENG-024 | §10 | §J.6 | §A.2 | §E.1, §E.3 | PASS |
| 25 | MOD-018 read-only surface preserved | §4.5, §12, §13 | Not exposed (WEB scope) | Not exposed (MOB scope) | §A, §C.5, §E | PASS |
| 26 | Traceability matrix present | (governance) | §K | §K | §K | PASS |
| 27 | No invented features / events / rules / permissions | §13, §15 | §K closure statement | §A.2 exclusions declared | §C.5, §E.3 verbatim from Publication §9 | PASS |
| 28 | Publication traceability — every SD claim maps to a Publication section | (governance) | §K (matrix) | §K (matrix) | §K (matrix) | PASS |

## 4. Traceability Review

Every WEB-017 §E and §F entry, every MOB-017 §C and §E entry, and every API-017 §C and §E entry is anchored to Publication §3 (Approved Scope), §4 (Consolidated Authorities), §6 (Business Rules), §7 (Master Data Authorities), §8 (Transaction Authorities), §9 (Published Events), or §11 (Platform Engine Usage). No SD element cites a source outside the Publication or its declared references (Baseline, PRD, Sprint PRDs).

## 5. Deviations

None. Intentional platform exclusions (mobile excluded from authoring surfaces for Data Marts, Analytics Foundation Configuration, KPI Master, Dashboard, Report Definition, Distribution List, Analytical Model, and Model Execution Configuration; API exposes no consumer-facing webhooks beyond declared events) are traced to Publication §4/§13, WEB-017 §A.2 / §J.6, MOB-017 §A.2, and API-017 §E.3 and are not deviations. GPS and offline-write are `N/A` on mobile per Publication §4 / §7 / §11 (no authorizing authority, master data, transaction, or engine).

## 6. Risks

- **R-1 (Low):** Read-model freshness depends on prompt ENG-024 delivery of upstream domain events; declared-freshness outcome (Publication §6) is the mitigation surface across WEB-017 §G, MOB-017 §C.1, and API-017 §C.3.
- **R-2 (Low):** Scheduled distribution timeliness depends on ENG-014 and ENG-023 platform SLAs (Publication §11); Report Run lifecycle exposes explicit states (API-017 §G) rather than synchronous failure.
- **R-3 (Low):** Analytical Model execution correctness depends on the single-Active invariant (Publication §6); WEB-017 §C.10 and API-017 §C.5 both enforce lifecycle constraints server-authoritatively.

## 7. Required Corrections

None.

## 8. Outstanding Issues

None. Sidebar registration for CPC-017 and VR-017 is deferred to a downstream navigation update per the audit constraint (this certification does not modify `docs/_meta.json`); see VR-017 §3.

## 9. Certification Result

**PASS** — WEB-017, MOB-017, and API-017 are cross-platform consistent and faithful to `MOD-017_MODULE_PUBLICATION`.

## 10. Handoff

Repository state: `MOD017_CROSS_PLATFORM_CERTIFIED`. Next artifact: VR-017 Wave Verification.
