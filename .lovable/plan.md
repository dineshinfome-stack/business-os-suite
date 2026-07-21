## MOD-017 Analytics — CPC + VR Audit Wave (Documentation-Only)

Audit-only wave. No source documents modified. Follows the canonical MOD-006 → MOD-016 workflow, restricted to Stages 4–5 (CPC + VR).

### Source Authority (read-only)

Normative:
- `docs/45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md`
- `docs/60-solution-design/web/analytics/WEB-017_SOLUTION_DESIGN.md`
- `docs/60-solution-design/mobile/analytics/MOB-017_SOLUTION_DESIGN.md`
- `docs/60-solution-design/api/analytics/API-017_SOLUTION_DESIGN.md`

Reference:
- `docs/40-module-baselines/MOD017_ANALYTICS_BASELINE_v1.md`
- `docs/20-module-prds/analytics/MODULE_PRD.md`
- MOD-016 CPC + VR reports (template reference)
- `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md` v2.0

Precedence: Publication → Baseline → PRD.

### Pre-Flight Gate

Confirm all four normative artifacts exist and are readable. If any are missing, halt and report `MOD017_PREFLIGHT_FAILED` — do not author CPC/VR against absent sources.

### Stage 1 — CPC-017 Cross-Platform Certification

Create `docs/50-audit-reports/MOD017_CROSS_PLATFORM_CERTIFICATION_<UTC>.md` using the approved CPC template (mirroring MOD-016 CPC).

Sections:
1. Executive Summary
2. Certification Scope (Publication, WEB-017, MOB-017, API-017)
3. Compliance Matrix — 13 dimensions: Functional parity, Feature completeness, Workflow, Business rules, Validation rules, Roles/permissions, Security, Error handling, Notifications, Accessibility, Performance, Audit, Publication traceability
4. Traceability Review (Publication authorities → WEB/MOB/API coverage)
5. Deviations
6. Risks
7. Required Corrections
8. Outstanding Issues
9. Certification Result — Pass | Pass with Conditions | Fail

Every observation cites Publication + affected SD section. No new requirements, screens, APIs, rules, or permissions introduced.

### Stage 2 — VR-017 Wave Verification

Create `docs/50-audit-reports/MOD017_WAVE_VERIFICATION_<UTC>.md` using the approved Verification template (mirroring MOD-016 VR, 16-check format).

**Track A — Repository Integrity**: structure, required docs present, naming, file locations, Navigation Standard v2.0 compliance, no duplicate paths, no dead links, no placeholder registrations, correct hierarchy.

**Track B — Documentation Quality**: Publication traceability, completeness, internal consistency, cross-document consistency, section completeness, template compliance, citations, acceptance criteria, auditability, readability.

**Sidebar Registration Validation** (read-only) — inspect `docs/_meta.json` MOD-017 group; assert contract order: Overview → Baseline → Publication → WEB-017 → MOB-017 → API-017 → CPC-017 → VR-017. Verify label deduplication, no placeholders, no dead links, no duplicate paths. Any deviation logged as a VR finding; `_meta.json` is NOT modified in this wave.

Outputs: Verification Checklist, Findings, Defects, Recommendations, Required Corrections, Final Status (Verified | Verified with Observations | Failed).

### Constraints

No modifications to Baseline, PRD, Publication, Solution Designs, governance docs, or `_meta.json`. No new business content, screens, workflows, rules, APIs, endpoints, events, or webhooks. No code, DB scripts, or mockups.

### Exit Criteria

- **Success**: CPC-017 + VR-017 authored; compliance, traceability, integrity, quality, navigation all validated → `MOD017_WAVE_READY`.
- **Failure**: Blocking findings documented, no source modifications → `MOD017_REMEDIATION_REQUIRED`.

### Deliverables

1. `docs/50-audit-reports/MOD017_CROSS_PLATFORM_CERTIFICATION_<UTC>.md`
2. `docs/50-audit-reports/MOD017_WAVE_VERIFICATION_<UTC>.md`
