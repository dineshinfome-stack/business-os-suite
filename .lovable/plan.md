# MOD-013 Assets — Publication + Solution Design Suite

Documentation-only wave following the canonical MOD-006 → MOD-012 workflow. All artifacts derive exclusively from the Stage 0 Publication.

## Source Authority

- **Normative**: `docs/45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md` (Stage 0 output)
- **Reference**: `docs/40-module-baselines/MOD013_ASSETS_BASELINE_v1.md`, `docs/20-module-prds/assets/MODULE_PRD.md`, MOD-011 approved templates, Navigation Standard v2.0
- **Precedence**: Publication → Baseline → PRD

## Stage 0 — Publication (Completeness Gate)

Read Baseline and PRD. Author `docs/45-module-publications/assets/MOD-013_MODULE_PUBLICATION.md` using the approved Module Publication template. Every clause cites originating Baseline/PRD section. No new business requirements.

**Gate**: If Baseline/PRD cannot support a complete Publication, author `docs/50-audit-reports/MOD013_PUBLICATION_GAP_REPORT_<UTC>.md`, set state `MOD013_PUBLICATION_BLOCKED`, skip Stages 1–6, leave `_meta.json` unchanged.

## Stage 1 — WEB-013

Author `docs/60-solution-design/web/assets/WEB-013_SOLUTION_DESIGN.md` using the approved 28-section Web SD template (IA, Navigation, Roles, Screen Inventory/Specs, Forms, Validation, Business Rules, Search, Filters, Tables, Dashboards, Reports, Notifications, Error/Loading/Empty States, Accessibility, Responsive, Security, Performance, Audit, Acceptance Criteria, Traceability Matrix).

Coverage shall include only screens, workflows, validation rules, and business capabilities defined in the Publication. Every requirement cites its Publication section. No invented screens, workflows, business rules, or functionality.

## Stage 2 — MOB-013

Author `docs/60-solution-design/mobile/assets/MOB-013_SOLUTION_DESIGN.md` using the approved Mobile SD template. Include only Publication-authorized capabilities (offline, sync, push, camera, GPS, biometric, attachments, background processing). Capabilities not authorized by the Publication marked `N/A` with citation. Every workflow traces to a Publication section.

## Stage 3 — API-013

Author `docs/60-solution-design/api/assets/API-013_SOLUTION_DESIGN.md` using the approved API SD template (Scope, AuthN, AuthZ, Endpoint Catalogue, Request/Response Models, Validation, Errors, Pagination, Filtering, Sorting, Webhooks, Event Catalogue, Audit, Versioning, Security, Performance, Acceptance Criteria, Traceability Matrix).

**Explicit Derivation Rule**: Endpoints, request/response models, webhooks, and events derive exclusively from the Publication. Consume only platform services referenced by the Publication. No invented APIs, endpoints, events, or webhooks.

**Event Naming Rule**: Event names shall be exactly those defined in the Stage 0 Publication. No event may be created unless explicitly present in the Publication.

## Stage 4 — CPC-013

Author `docs/50-audit-reports/MOD013_CROSS_PLATFORM_CERTIFICATION_<UTC>.md`. Validate consistency across Publication, WEB-013, MOB-013, API-013. Scope: functional parity, business rules, validation, security, permissions, error handling, notifications, accessibility, performance, audit, traceability. Produce Compliance Matrix, Deviations, Risks, Required Corrections, Certification Result (Pass / Pass with Conditions / Fail).

## Stage 5 — VR-013

Author `docs/50-audit-reports/MOD013_WAVE_VERIFICATION_<UTC>.md`. Execute repository-standard verification — Track A (Repository Integrity), Track B (Documentation Quality). Produce Verification Checklist, Findings, Defects, Recommendations, Final Verification Status (Verified / Verified with Observations / Failed).

## Stage 6 — Sidebar Registration

Only after Stages 0–5 succeed. Update MOD-013 Assets group in `docs/_meta.json` registering only existing documents in mandatory contract order:

```text
Overview → Baseline → Publication → WEB-013 → MOB-013 → API-013 → CPC-013 → VR-013
```

Apply Navigation Standard v2.0 (label deduplication, no placeholders, no dead links, no duplicate paths). Validate with standard navigation script. If Publication Gate failed, Stage 6 SHALL NOT execute.

## Constraints

Do NOT modify Baseline, PRD, or governance docs. Do NOT introduce new business requirements. Do NOT invent screens, workflows, business rules, APIs, endpoints, events, or webhooks. Do NOT generate code, DB scripts, or UI mockups. Every SD requirement cites its Publication section.

## Exit Criteria

**Success**: Publication + WEB/MOB/API/CPC/VR-013 authored with full traceability; CPC result issued; VR final status issued; `_meta.json` updated; navigation validates (0 dead links, correct contract order, no duplicate paths). Repository state: **`MOD013_WAVE_READY`**.

**Early termination**: On Publication Gate failure, only the Gap Report is authored; `_meta.json` unchanged; state **`MOD013_PUBLICATION_BLOCKED`**.
