# MOD-008 Payroll — Publication + Solution Design Suite

Documentation-only. Follows the canonical MOD-006 / MOD-007 workflow, Publication → Baseline → PRD precedence, and Repository Navigation Standard v2.0. All content derived exclusively from the Publication; no invented screens, endpoints, events, or requirements.

## Inputs (Read-Only)

- `docs/40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md`
- `docs/20-module-prds/payroll/MODULE_PRD.md`
- Approved Publication template (MOD-002 / MOD-003 / MOD-007)
- Approved SD templates: WEB-006, MOB-006, API-006
- Approved audit templates: CPC-006, VR-006
- `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md` (v2.0)

## Stage 0 — MOD-008 Publication (Completeness Gate)

Author `docs/45-module-publications/payroll/MOD-008_MODULE_PUBLICATION.md` from Baseline + PRD using the approved Publication template. Every clause cites the originating Baseline §/PRD §. No new business requirements.

**Gate:** If Baseline/PRD cannot support a complete Publication, author `docs/50-audit-reports/MOD008_PUBLICATION_GAP_REPORT_<UTC>.md`, stop the workflow, set state `MOD008_PUBLICATION_BLOCKED`, and do not proceed to Stages 1–6.

## Stage 1 — WEB-008 Web Solution Design

Author `docs/60-solution-design/web/payroll/WEB-008_SOLUTION_DESIGN.md` using the approved 28-section Web SD template. IA, navigation, roles, screen inventory & specs, forms, validation, business rules, search/filters/tables, dashboards, reports, notifications, error/loading/empty states, accessibility, responsive, security, performance, audit logging, acceptance criteria, and Traceability Matrix — all derived exclusively from the Publication with per-item citations.

## Stage 2 — MOB-008 Mobile Solution Design

Author `docs/60-solution-design/mobile/payroll/MOB-008_SOLUTION_DESIGN.md` using the approved Mobile SD template. Offline, sync, push, camera, GPS, biometrics, attachments, background processing included only if authorized by the Publication; unsupported capabilities marked `N/A` with Publication citation. All workflows trace to the Publication.

## Stage 3 — API-008 API Solution Design

Author `docs/60-solution-design/api/payroll/API-008_SOLUTION_DESIGN.md` covering the full approved structure (scope, authn/authz, endpoint catalogue, request/response models, validation, error handling, pagination/filter/sort, webhooks, event catalogue, audit, versioning, security, performance, acceptance criteria, Traceability Matrix). Endpoints, models, webhooks, and events derived exclusively from Publication master data, transactions, workflows, and events. Consume only Publication-referenced platform services.

## Stage 4 — CPC-008 Cross-Platform Certification

Author `docs/50-audit-reports/MOD008_CROSS_PLATFORM_CERTIFICATION_<UTC>.md` validating Publication ↔ WEB-008 ↔ MOB-008 ↔ API-008 across functional parity, business rules, validation, security, permissions, error handling, notifications, accessibility, performance, audit, and traceability. Emit Compliance Matrix, Deviations, Risks, Required Corrections, and Certification Result (Pass / Pass with Conditions / Fail).

## Stage 5 — VR-008 Verification

Author `docs/50-audit-reports/MOD008_WAVE_VERIFICATION_<UTC>.md` executing Track A (Repository Integrity) and Track B (Documentation Quality). Emit Verification Checklist, Findings, Defects, Recommendations, and Final Status (Verified / Verified with Observations / Failed).

## Stage 6 — Sidebar Registration

Update `docs/_meta.json` MOD-008 group in the mandatory contract order:

```text
Overview → Baseline → Publication → WEB-008 → MOB-008 → API-008 → CPC-008 → VR-008
```

Register only artifacts that exist. Apply Navigation Standard v2.0: label deduplication, no placeholders, no dead links, no duplicate paths. Validate with the standard navigation script.

## Constraints

No modification of Baseline, PRD, or governance docs. No new business requirements. No invented screens/workflows/APIs/endpoints/events. No code, DB scripts, or mockups. Every SD requirement cites a Publication section.

## Exit Criteria

**Success:** Publication + WEB-008 + MOB-008 + API-008 + CPC-008 + VR-008 authored; full Publication traceability; CPC result issued; VR final status issued; `_meta.json` updated per v2.0; navigation validation passes (0 dead links, correct order, no duplicate paths). State → `MOD008_WAVE_READY`.

**Early Termination:** Gate fails → only Gap Report authored; no SD/audit files; no `_meta.json` changes. State → `MOD008_PUBLICATION_BLOCKED`.
