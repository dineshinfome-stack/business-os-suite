# MOD-010 Projects — Publication + Solution Design Suite

Documentation-only. Follows the canonical MOD-006/007/008/009 workflow, Publication → Baseline → PRD precedence, and Repository Navigation Standard v2.0.

## Inputs (Read-Only)
- `docs/40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md`
- `docs/20-module-prds/projects/MODULE_PRD.md`
- Approved templates: MOD-007 Publication, WEB-006, MOB-006, API-006, CPC-006, VR-006
- `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md` (v2.0)

## Source Authority
- **Normative**: MOD-010 Module Publication (Stage 0 output)
- **Reference (Informative)**: MOD-010 Baseline, MOD-010 PRD, approved templates, Navigation Standard v2.0
- Precedence on conflict: Publication ↑ Baseline ↑ PRD

## Stage 0 — Publication (Completeness Gate)
Author `docs/45-module-publications/projects/MOD-010_MODULE_PUBLICATION.md` from Baseline + PRD using the approved Module Publication template. Every clause cites Baseline/PRD section. No new business requirements.

**Gate**: If Baseline/PRD cannot support a complete Publication, author `docs/50-audit-reports/MOD010_PUBLICATION_GAP_REPORT_<UTC>.md`, stop the workflow, set state `MOD010_PUBLICATION_BLOCKED`, and skip Stages 1–6.

## Stage 1 — WEB-010
Author `docs/60-solution-design/web/projects/WEB-010_SOLUTION_DESIGN.md` using the approved 28-section template. Covers IA, navigation, roles, screen inventory & specs, forms, validation, business rules, search/filters/tables, dashboards, reports, notifications, error/loading/empty states, accessibility, responsive, security, performance, audit, acceptance criteria, and Traceability Matrix. Every screen/rule cites its Publication section.

## Stage 2 — MOB-010
Author `docs/60-solution-design/mobile/projects/MOB-010_SOLUTION_DESIGN.md` using the approved Mobile SD template. Include offline, sync, push, camera, GPS, biometric, attachments, background — only if authorized by the Publication; otherwise mark `N/A` with Publication citation. All workflows trace to the Publication.

## Stage 3 — API-010
Author `docs/60-solution-design/api/projects/API-010_SOLUTION_DESIGN.md` covering scope, authN/authZ, endpoint catalogue, request/response models, validation, error handling, pagination, filtering, sorting, webhooks, event catalogue, audit, versioning, security, performance, acceptance criteria, and Traceability Matrix.

**Explicit derivation rule**: Endpoints, request/response models, webhooks, and events shall be derived exclusively from the Publication. Consume only platform services referenced by the Publication. Do not introduce additional APIs, endpoints, or events.

## Stage 4 — CPC-010
Author `docs/50-audit-reports/MOD010_CROSS_PLATFORM_CERTIFICATION_<UTC>.md` validating Publication ↔ WEB-010 ↔ MOB-010 ↔ API-010 across functional parity, business rules, validation, security, permissions, error handling, notifications, accessibility, performance, audit, and traceability. Produce Compliance Matrix, Deviations, Risks, Required Corrections, Certification Result (Pass / Pass with Conditions / Fail).

## Stage 5 — VR-010
Author `docs/50-audit-reports/MOD010_WAVE_VERIFICATION_<UTC>.md` executing Track A (Repository Integrity) and Track B (Documentation Quality). Produce Verification Checklist, Findings, Defects, Recommendations, and Final Verification Status (Verified / Verified with Observations / Failed).

## Stage 6 — Sidebar Registration
Update the MOD-010 Projects group in `docs/_meta.json` (only after Stages 0–5 succeed). Register only existing documents in contract order:

```text
Overview
Baseline
Publication
WEB-010
MOB-010
API-010
CPC-010
VR-010
```

Apply Navigation Standard v2.0 (label dedup, no placeholders, no dead links, no duplicate paths). Validate via the standard navigation script. Skip this stage if the Publication Gate failed.

## Constraints
No changes to Baseline, PRD, or governance. No invented screens/workflows/APIs/endpoints/events. No new business requirements. No code, DB scripts, or mockups. Every SD requirement cites its Publication section.

## Exit Criteria
- Publication + WEB/MOB/API/CPC/VR authored and fully Publication-traceable
- CPC-010 and VR-010 issued with results
- `_meta.json` updated per Navigation Standard v2.0 with 0 dead links, correct contract order, no duplicate paths
- Repository state: **`MOD010_WAVE_READY`**
- On Gate failure: only the Gap Report is produced; state **`MOD010_PUBLICATION_BLOCKED`**
