# Publication Remediation Wave — MOD-004, MOD-005, MOD-019

Documentation-only backfill of the three missing Module Publications identified by findings F-PRR-001/002/003 in the Phase 1–4 Readiness Review.

## Scope

Author exactly three new Publication documents. No other repository artifacts are modified.

## Precedence

```text
Baseline  ↑  authoritative source
PRD       ↑  authoritative source
Publication  = derived, authoritative downstream
WEB / MOB / API SD  = corroborating (informational only for this wave)
CPC report        = corroborating evidence of prior cross-platform parity only
```

The Publication, once authored, is the sole normative artifact produced by this remediation. WEB/MOB/API/CPC documents are read-only inputs to the consistency scan; they never override the Publication.

## Stage 0 — Pre-Flight (read-only)

Verify normative sources exist for each module:

- MOD-004: `docs/40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md` + `docs/20-module-prds/purchase/MODULE_PRD.md`
- MOD-005: `docs/40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md` + `docs/20-module-prds/inventory/MODULE_PRD.md`
- MOD-019: `docs/40-module-baselines/MOD019_*` Baseline + `docs/20-module-prds/warehouse/MODULE_PRD.md`

If any Baseline or PRD is missing, halt that module and emit `MODXXX_PUBLICATION_GAP_REPORT_<UTC>.md` under `docs/50-audit-reports/`.

## Stage 1 — Author Publications

Create three files following the MOD-006 → MOD-016 Publication template already in use:

1. `docs/45-module-publications/purchase/MOD-004_MODULE_PUBLICATION.md`
2. `docs/45-module-publications/inventory/MOD-005_MODULE_PUBLICATION.md`
3. `docs/45-module-publications/warehouse/MOD-019_MODULE_PUBLICATION.md`

Each contains the 18 canonical sections: Executive Summary, Module Scope, Business Objectives, Functional Requirements, Business Capabilities, Actors, User Roles, Workflows, Business Rules, Validation Rules, Security Requirements, Audit Requirements, Notifications, Reports, Integration Requirements, AI Requirements, Acceptance Criteria, Traceability Matrix.

Frontmatter per Governance Frontmatter Standard (title, summary, layer, owner, status=approved, updated, module_id, document_type=Module Publication, depends_on referencing Baseline + PRD).

## Stage 2 — Completeness & Traceability

For each Publication verify: every Baseline and PRD requirement appears; every Traceability Matrix row cites its Baseline §/PRD §; no orphan, undocumented, or conflicting requirements; no new screens, APIs, events, endpoints, permissions, workflows, or implementation detail introduced.

If any gap surfaces, emit the corresponding `MODXXX_PUBLICATION_GAP_REPORT_<UTC>.md` and do not publish that module.

## Stage 2.5 — Publication ↔ Existing Solution Design Consistency Check (Read-Only)

Because WEB, Mobile, API, and CPC artifacts already exist for MOD-004, MOD-005, and MOD-019, run a downstream consistency scan after each Publication is authored. Read-only: never mutates existing SD/CPC documents.

Role of inputs:

- Publication (just authored) — authoritative
- WEB-0XX / MOB-0XX / API-0XX SDs — corroborating, informational
- CPC report — corroborating evidence of previously certified cross-platform parity **only**; it shall not override the Publication

Consistency dimensions:

1. Actors / User Roles — SD personas ⊆ Publication actors
2. Workflows — every SD workflow traces to a Publication workflow
3. Business & Validation Rules — no SD rule contradicts the Publication
4. Reports — SD reports ⊆ Publication report catalog
5. Notifications — SD notifications ⊆ Publication notifications
6. Events / Integration surface — API-0XX events ⊆ Publication integration/event set
7. Security & Audit posture — SD assertions consistent with Publication requirements
8. AI capabilities (where present) — SD AI features ⊆ Publication AI Requirements

Deliverable per module: `docs/50-audit-reports/MOD0XX_PUBLICATION_SD_CONSISTENCY_<UTC>.md` containing:

- Check / Result / Action table (per dimension above)
- **Traceability Coverage Metric** summary:

  ```text
  | Metric                     | Value |
  |----------------------------|-------|
  | Publication requirements   | n     |
  | Traced to WEB              | n     |
  | Traced to Mobile           | n     |
  | Traced to API              | n     |
  | Corroborated by CPC        | n     |
  | Coverage                   | %     |
  ```

- Overall verdict: `Consistent` | `Consistent with Observations` | `Inconsistent`

Discrepancies are recorded as findings only. Inconsistent verdicts stage a follow-up SD reconciliation wave; they do not block Publication release, because the Publication is authoritative.

## Prohibited

No modification of: governance, Master PRD, Foundation, Baselines, existing Publications, WEB/MOB/API SDs, CPC/VR reports, `docs/_meta.json`. No code, SQL, schemas, or UI mockups.

Sidebar registration for the three new Publications is out of scope for this wave; a follow-up navigation registration task can be raised separately.

## Deliverables

Success path — three Publications plus three consistency reports:

```text
docs/45-module-publications/purchase/MOD-004_MODULE_PUBLICATION.md
docs/45-module-publications/inventory/MOD-005_MODULE_PUBLICATION.md
docs/45-module-publications/warehouse/MOD-019_MODULE_PUBLICATION.md
docs/50-audit-reports/MOD004_PUBLICATION_SD_CONSISTENCY_<UTC>.md
docs/50-audit-reports/MOD005_PUBLICATION_SD_CONSISTENCY_<UTC>.md
docs/50-audit-reports/MOD019_PUBLICATION_SD_CONSISTENCY_<UTC>.md
```

Blocked path — one `MODXXX_PUBLICATION_GAP_REPORT_<UTC>.md` per blocked module under `docs/50-audit-reports/`.

## Exit State

- All three Publications authored, no gaps → `PUBLICATION_REMEDIATION_COMPLETE`. Non-blocking consistency observations feed a follow-up SD reconciliation wave. Next remediation task: MOD-002 Wave Verification.
- Any module blocked by missing/conflicting source → `PUBLICATION_REMEDIATION_BLOCKED` with gap reports.
