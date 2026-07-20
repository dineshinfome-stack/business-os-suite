## MOD-012 Field Service — Publication + Solution Design Suite

Documentation-only wave following the canonical MOD-006 → MOD-011 workflow. All Solution Design artifacts derive exclusively from the Stage 0 Publication.

### Source Authority
- **Normative:** MOD-012 Publication (Stage 0 output)
- **Reference:** `docs/40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md`, `docs/20-module-prds/field-service/MODULE_PRD.md`, approved templates (MOD-011 suite), Repository Navigation Standard v2.0
- **Precedence:** Publication → Baseline → PRD

### Stage 0 — Publication (Completeness Gate)
Author `docs/45-module-publications/field-service/MOD-012_MODULE_PUBLICATION.md` from Baseline + PRD only. Every clause cites its source section. No new business requirements.

**Gate:** If Baseline/PRD cannot support a complete Publication → author `docs/50-audit-reports/MOD012_PUBLICATION_GAP_REPORT_<UTC>.md`, set state `MOD012_PUBLICATION_BLOCKED`, stop. Skip Stages 1–6. Leave `_meta.json` unchanged.

### Stage 1 — WEB-012
Author `docs/60-solution-design/web/field-service/WEB-012_SOLUTION_DESIGN.md` using the approved 28-section template (IA, Navigation, Roles, Screen Inventory & Specs, Forms, Validation, Business Rules, Search, Filters, Tables, Dashboards, Reports, Notifications, Error/Loading/Empty states, Accessibility, Responsive, Security, Performance, Audit, Acceptance Criteria, Traceability Matrix).

**Coverage rule:** Coverage shall include only the screens, workflows, and business capabilities defined in the Publication. Every requirement cites its Publication section. No invented screens or functionality.

### Stage 2 — MOB-012
Author `docs/60-solution-design/mobile/field-service/MOB-012_SOLUTION_DESIGN.md`. Include only Publication-authorized capabilities (Offline, Sync, Push, Camera, GPS, Biometric, Attachments, Background). Mark any unauthorized capability `N/A` with Publication citation. Every workflow traces back to a Publication section.

### Stage 3 — API-012
Author `docs/60-solution-design/api/field-service/API-012_SOLUTION_DESIGN.md` per approved template (Scope, AuthN, AuthZ, Endpoint Catalogue, Request/Response Models, Validation, Errors, Pagination, Filtering, Sorting, Webhooks, Event Catalogue, Audit, Versioning, Security, Performance, Acceptance, Traceability).

**Explicit derivation rule:** Endpoints, request/response models, webhooks, and events shall derive exclusively from the Publication. Consume only Publication-referenced platform services. No invented APIs/endpoints/events/webhooks.

**Event naming rule:** Event names shall be exactly those defined in the Stage 0 Publication. No event may be created unless explicitly present in the Publication.

### Stage 4 — CPC-012
Author `docs/50-audit-reports/MOD012_CROSS_PLATFORM_CERTIFICATION_<UTC>.md`. Validate Publication ↔ WEB ↔ MOB ↔ API across functional parity, business rules, validation, security, permissions, errors, notifications, accessibility, performance, audit, traceability. Produce Compliance Matrix, Deviations, Risks, Corrections, Result (Pass / Pass with Conditions / Fail).

### Stage 5 — VR-012
Author `docs/50-audit-reports/MOD012_WAVE_VERIFICATION_<UTC>.md`. Track A Repository Integrity + Track B Documentation Quality. Produce Verification Checklist, Findings, Defects, Recommendations, Final Status (Verified / Verified with Observations / Failed).

### Stage 6 — Sidebar Registration
Only after Stages 0–5 succeed. Update MOD-012 Field Service group in `docs/_meta.json` in mandatory contract order:
```text
Overview → Baseline → Publication → WEB-012 → MOB-012 → API-012 → CPC-012 → VR-012
```
Apply Navigation Standard v2.0 (dedup, no placeholders, no dead links, no duplicate paths). Validate via standard navigation script.

### Constraints
No modification of Baseline, PRD, or governance docs. No new business requirements, invented screens/workflows/APIs/endpoints/events/webhooks. No code, DB scripts, or UI mockups. Every SD requirement cites its Publication section.

### Exit Criteria
**Success:** All 6 artifacts authored with full Publication traceability, CPC-012 and VR-012 issued with results, `_meta.json` updated, navigation validates (0 dead links, correct order, no dupes). State: `MOD012_WAVE_READY`.

**Early Termination:** If Gate fails, only Gap Report authored; state: `MOD012_PUBLICATION_BLOCKED`.
