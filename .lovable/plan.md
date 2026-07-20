## MOD-016 Service Desk — Publication + Solution Design Suite

Documentation-only wave following the canonical MOD-006 → MOD-015 workflow. All artifacts derive exclusively from the Stage 0 Publication.

### Source Authority
- Normative: `docs/45-module-publications/service-desk/MOD-016_MODULE_PUBLICATION.md` (Stage 0 output)
- Reference: `docs/40-module-baselines/MOD016_*_BASELINE_v1.md` (if present), `docs/20-module-prds/service-desk/MODULE_PRD.md`, MOD-015 templates, Navigation Standard v2.0
- Precedence: Publication → Baseline → PRD

### Stage 0 — Publication (gated)
Read Baseline + PRD, then author `docs/45-module-publications/service-desk/MOD-016_MODULE_PUBLICATION.md` using the approved template. Every clause cites Baseline/PRD section. No new business requirements.

Gate: if Baseline/PRD cannot support a complete Publication, author `docs/50-audit-reports/MOD016_PUBLICATION_GAP_REPORT_<UTC>.md`, set state `MOD016_PUBLICATION_BLOCKED`, stop, and leave `_meta.json` unchanged.

### Stage 1 — WEB-016
Author `docs/60-solution-design/web/service-desk/WEB-016_SOLUTION_DESIGN.md` using the 28-section web template. Coverage limited to Publication-defined screens, workflows, rules, capabilities. Every requirement cites its Publication section. No invented screens/workflows/rules.

### Stage 2 — MOB-016
Author `docs/60-solution-design/mobile/service-desk/MOB-016_SOLUTION_DESIGN.md`. Include only Publication-authorized capabilities (Offline, Sync, Push, Camera, GPS, Biometric, Attachments, Background); unauthorized ones marked `N/A` with Publication citation. Every workflow traces to a Publication section.

### Stage 3 — API-016
Author `docs/60-solution-design/api/service-desk/API-016_SOLUTION_DESIGN.md`. Endpoints, request/response models, webhooks, and events derived exclusively from the Publication. Event names exactly as defined in the Publication — none invented. Consume only Publication-referenced platform services.

### Stage 4 — CPC-016
Author `docs/50-audit-reports/MOD016_CROSS_PLATFORM_CERTIFICATION_<UTC>.md`. Validate parity across Publication ↔ WEB/MOB/API (functional, rules, validation, security, permissions, errors, notifications, a11y, performance, audit, traceability). Emit Compliance Matrix, Deviations, Risks, Corrections, and Certification Result (Pass / Pass with Conditions / Fail).

### Stage 5 — VR-016
Author `docs/50-audit-reports/MOD016_WAVE_VERIFICATION_<UTC>.md` with Track A (Repository Integrity) + Track B (Documentation Quality). Emit checklist, findings, defects, recommendations, and Final Verification Status.

### Stage 6 — Sidebar Registration
Only after Stages 0–5 pass. Update the MOD-016 Service Desk group in `docs/_meta.json` in contract order:

```text
Overview → Baseline → Publication → WEB-016 → MOB-016 → API-016 → CPC-016 → VR-016
```

Apply Navigation Standard v2.0: dedupe labels, no placeholders, no dead links, no duplicate paths. Skip Stage 6 entirely if the Publication Gate failed.

### Constraints
No edits to Baseline, PRD, or governance docs. No invented screens/workflows/rules/APIs/endpoints/events/webhooks. No code, DB scripts, or UI mockups. Every SD requirement cites its Publication section.

### Exit Criteria
- Success: Publication + WEB/MOB/API/CPC/VR authored with full Publication traceability; `_meta.json` updated; nav validation clean → state `MOD016_WAVE_READY`.
- Early termination: only Gap Report authored; `_meta.json` unchanged → state `MOD016_PUBLICATION_BLOCKED`.
