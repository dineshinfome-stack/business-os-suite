# MOD-006 CRM — Publication + Solution Design Suite (v2, Reusable Template)

Documentation-only. No code, no repo restructuring. Follows Repository Navigation Standard v2.0 and Publication → Baseline → PRD precedence. Designed to be reused verbatim for MOD-007 through MOD-019.

## Stage 0 — Author MOD-006 Publication
Create `docs/45-module-publications/crm/MOD-006_MODULE_PUBLICATION.md` derived exclusively from `MOD006_CRM_BASELINE_v1` and `docs/20-module-prds/crm/MODULE_PRD.md`.

- Follow the approved Module Publication template as demonstrated by MOD-002 and MOD-003 (the template governs, not those specific documents).
- Every clause cites Baseline §/PRD §. No new business requirements.
- This becomes the sole Source of Truth for Stages 1–5.

## Stage 1 — WEB-006 Web Solution Design
`docs/60-solution-design/web/crm/WEB-006_SOLUTION_DESIGN.md` — full 28-section structure from the source prompt (Purpose … Traceability Matrix).

- Screen inventory, navigation, forms, dashboards, and reports SHALL be derived from the entities, workflows, business rules, and reporting capabilities defined in the Publication. Every screen and rule cites `Publication §N`. No invented screens.

## Stage 2 — MOB-006 Mobile Solution Design
`docs/60-solution-design/mobile/crm/MOB-006_SOLUTION_DESIGN.md` — full mobile structure from the source prompt.

- Mobile scope SHALL be derived from the Publication. Capabilities such as offline, sync, camera, GPS, and attachments are included only if the Publication authorizes them; otherwise marked N/A with citation.

## Stage 3 — API-006 API Solution Design
`docs/60-solution-design/api/crm/API-006_SOLUTION_DESIGN.md` — full API structure from the source prompt.

- Endpoint catalogue, request/response models, event catalogue, and webhooks SHALL be derived exclusively from the master data, transactions, and events defined in the Publication. No additional endpoints or events may be introduced. Auth/authz/audit consume the engines declared by the Publication.

## Stage 4 — CPC-006 Cross-Platform Certification
`docs/50-audit-reports/MOD006_CROSS_PLATFORM_CERTIFICATION_<UTC>.md` (timestamped — audit evidence convention).

- Compliance matrix across Publication / WEB-006 / MOB-006 / API-006 covering functional parity, business rules, validation, security, permissions, error handling, notifications, accessibility, audit, performance.
- Emit deviations, risks, required corrections, certification result (Pass / Pass with Conditions / Fail).

## Stage 5 — VR-006 Verification
`docs/50-audit-reports/MOD006_WAVE_VERIFICATION_<UTC>.md` (timestamped — audit evidence convention).

- Repository-standard 16-check verification (Track A repository integrity + Track B document quality), findings, defects, recommendations, final status (Verified / Verified with Observations / Failed).

## Stage 6 — Sidebar registration (Navigation Standard v2.0)
Update MOD-006 group in `docs/_meta.json` in contract order, listing only items that exist on disk after Stages 0–5:
`Overview → Baseline → Publication → WEB-006 → MOB-006 → API-006 → CPC-006 → VR-006`.
Apply the label-deduplication rule.

## Constraints
- Do not modify Baseline or PRD.
- No invented workflows, features, endpoints, or screens.
- No code, DB scripts, or UI mockups.
- Every requirement in every SD cites a Publication section.

## Exit criteria
1. Publication and all five SD documents authored.
2. Every SD requirement traceable to the Publication.
3. CPC-006 issued with a certification result.
4. VR-006 completed with a final status.
5. Sidebar updated per Navigation Standard v2.0.
6. Repository navigation validation passes: 0 dead links, correct contract ordering, no duplicate paths across module groups, traceability complete.

Repository state target: `MOD006_WAVE_READY`.
