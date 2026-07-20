# MOD-007 HRMS — Publication + Solution Design Suite

Reuses the canonical MOD-006 workflow. Documentation-only. Publication → Baseline → PRD precedence. All Solution Design content derived exclusively from the Publication; no invented screens, endpoints, or events.

## Inputs (read-only)

- `MOD007_HRMS_BASELINE_v1` (baseline)
- `docs/20-module-prds/hrms/MODULE_PRD.md`
- Publication template as demonstrated by MOD-002 / MOD-003 Publications
- `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md` (v2.0)
- Reference structure: WEB-006 / MOB-006 / API-006 and CPC-006 / VR-006

## Stage 0 — MOD-007 Publication (Completeness Gate)

Create `docs/45-module-publications/hrms/MOD-007_MODULE_PUBLICATION.md` from the Baseline + PRD, following the approved Publication template. Every clause cites Baseline § and/or PRD §. No new requirements. Conflicts resolved by Publication ↑ Baseline ↑ PRD.

Gate: if the Baseline/PRD cannot support a complete Publication, stop and emit a gap report under `docs/50-audit-reports/MOD007_PUBLICATION_GAP_REPORT_<UTC>.md`. Stages 1–6 do not proceed until the Publication is complete.

## Stage 1 — WEB-007

Create `docs/60-solution-design/web/hrms/WEB-007_SOLUTION_DESIGN.md` using the approved 28-section template (Purpose … Traceability Matrix). Screen inventory, navigation, forms, dashboards, reports, and workflows derived exclusively from the Publication. Every screen / validation / business rule cites a Publication section.

## Stage 2 — MOB-007

Create `docs/60-solution-design/mobile/hrms/MOB-007_SOLUTION_DESIGN.md` using the approved template. Mobile scope, offline, sync, notifications, camera, GPS, biometrics, attachments, and background processing included only if authorized by the Publication; unsupported capabilities marked N/A with citations.

## Stage 3 — API-007

Create `docs/60-solution-design/api/hrms/API-007_SOLUTION_DESIGN.md` covering the full section list (Scope, AuthN, AuthZ, Endpoint Catalogue, Request/Response Models, Validation, Errors, Pagination, Filtering, Sorting, Webhooks, Event Catalogue, Audit, Versioning, Security, Performance, Acceptance Criteria, Traceability Matrix). Endpoints/events derived exclusively from Publication master data, transactions, workflows, and events. Consumes only platform services the Publication references.

## Stage 4 — CPC-007

Create `docs/50-audit-reports/MOD007_CROSS_PLATFORM_CERTIFICATION_<UTC>.md` validating Publication ↔ WEB ↔ MOB ↔ API across functional parity, business rules, validation, security, permissions, error handling, notifications, accessibility, performance, audit, traceability. Output: Compliance Matrix, Deviations, Risks, Required Corrections, Result (Pass / Pass with Conditions / Fail).

## Stage 5 — VR-007

Create `docs/50-audit-reports/MOD007_WAVE_VERIFICATION_<UTC>.md` running Track A (Repository Integrity) and Track B (Documentation Quality). Output: Checklist, Findings, Defects, Recommendations, Final Status (Verified / Verified with Observations / Failed).

## Stage 6 — Sidebar Registration

Update the MOD-007 HRMS group in `docs/_meta.json` in contract order, registering only artifacts that exist:

```text
Overview
Baseline
Publication
WEB-007
MOB-007
API-007
CPC-007
VR-007
```

Apply label-deduplication rule. No placeholders, no dead links, no duplicate paths across module groups. Validate with the navigation script used for MOD-006.

## Constraints

Do not modify Baseline, PRD, or governance documents. No new business requirements. No invented screens, workflows, APIs, or events. No code, DB scripts, or UI mockups. Every SD requirement cites a Publication section.

## Exit Criteria

- Publication authored (or gap report emitted and workflow halted)
- WEB-007, MOB-007, API-007, CPC-007, VR-007 authored
- Full Publication traceability across SD docs
- CPC-007 result issued; VR-007 final status issued
- `_meta.json` updated per Navigation Standard v2.0
- Navigation validation: 0 dead links, correct contract order, no duplicate paths
- Repository state: `MOD007_WAVE_READY`
