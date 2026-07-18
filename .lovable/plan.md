## Pass 33.0.-1 → 33.0.0 — Frontmatter Standard + Template Registry extension + MOD-001 Publication

### Publication-state confirmation

- `docs/MODULE_PUBLICATION_CATALOG.md` lists only MOD-017 and MOD-018 as `Published`.
- `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md` exists (baseline approved).
- Therefore GT-005 for MOD-001 is required before SD-008.
- **Pre-existing fact:** `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` already exists and already lists GT-001..GT-005 records. It does **not** yet cover the SD-001 family (WEB / MOB / API). Recommendation 1 is therefore an **extension**, not a new document.

Recommendations 3, 4, 5 (Lifecycle Standard, richer execution-metadata block, DOC-001 schema) are explicitly deferred per the reviewer's own guidance ("evolutionary rather than corrective").

---

### Pass 33.0.-1 — Repository Governance Standards (two artifacts, one pass)

Positioned as first-class permanent governance standards, versioned identically to other governance documents. Authored FIRST so GT-005 and every SD-00N pass adopt canonical values from the start.

#### 33.0.-1.A — Author `docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md` (v1.0, `status: approved`)

Sections:

1. **Purpose & Authority** — the single repository-wide reference for `spec_id`, `template`, `template_version` frontmatter fields; referenced by every governance template (GT-002…GT-005) and every Solution Design template (SD-001 WEB/MOB/API).
2. **spec_id conventions** — canonical identifiers per artifact family:
   - Module PRDs → `MOD-NNN`
   - Baselines → `MODNNN_<MODULE>_BASELINE_v<version>`
   - Publications → `MOD-NNN_MODULE_PUBLICATION`
   - Sprint PRDs → `SPR-MOD-NNN-NNN`
   - WEB / MOB / API specs → `WEB-NNN` / `MOB-NNN` / `API-NNN`
   - Audit reports → `REPOSITORY_AUDIT_<UTC-timestamp>`
3. **template conventions** — stable human-readable template names decoupled from pass numbers:
   - `GT-002_STAGE1_AUTHORING`
   - `GT-003_SPRINT_AUTHORING`
   - `GT-004_BASELINE_CONSOLIDATION`
   - `GT-005_MODULE_PUBLICATION`
   - `SD-001_WEB_SPEC` / `SD-001_MOB_SPEC` / `SD-001_API_SPEC`
4. **template_version** — semantic `v<major>.<minor>`; current baseline `v1.0` for all above.
5. **Mandatory Frontmatter Validation Checklist** (Recommendation 2) — the canonical checklist every downstream audit references verbatim:
   - `spec_id` exists
   - `template` exists (drawn from §3 vocabulary)
   - `template_version` exists (matches §4 rule)
   - `source_module` exists (when the artifact is module-scoped)
   - `source_publication` exists (when the artifact derives from a Published Module)
   - `owner` exists
   - `status` exists
   - `updated` exists (ISO date)
   - `document_type` exists
   - `tags` exists (non-empty list)
   Audits record a single line: **Frontmatter Validation Checklist = PASS/FAIL** and only enumerate field-level failures on FAIL.
6. **Grandfathering** — pre-existing artifacts (WEB-001/002, MOB-001/002, API-001/002, all prior baselines/publications/sprint PRDs, all prior audits) are grandfathered as-is; historical identifiers remain valid; frontmatter is not rewritten. A **projection table** maps historical `template` values (`SD-002`, `SD-003`, `SD-004`, `SD-005`, `SD-006`, `SD-007`) → canonical (`SD-001_WEB_SPEC`, `SD-001_MOB_SPEC`, `SD-001_API_SPEC`).
7. **Conformance rule** — all new artifacts from Pass 33.0.0 onward MUST conform; conformance is mandatory on every downstream audit checklist (as one line via §5).
8. **Amendment procedure** — additions/changes require a dedicated governance pass that bumps `template_version`; no per-pass overrides.
9. **Cross-references** — `GOVERNANCE_FRAMEWORK_MANIFEST.json`, `GOVERNANCE_TEMPLATE_REGISTRY.md`, `GOVERNANCE_TEMPLATE_STANDARD.md`.

#### 33.0.-1.B — Extend the existing `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` (Recommendation 1)

The registry already exists and already records GT-001..GT-005 with rich per-template fields. Extend rather than replace:

- Add three new records for the SD-001 family, using the same record schema already in force:
  - `SD-001_WEB_SPEC` — v1.0, Active, Owner: Architecture Office, applies to Web Solution Design specifications, Compatible Governance Version v1.0, First Release Pass 26.0.1, Latest Revision Pass 26.0.1, Used By: WEB-001, WEB-002.
  - `SD-001_MOB_SPEC` — v1.0, Active, applies to Mobile Solution Design specifications, First Release Pass 26.0.1, Used By: MOB-001, MOB-002.
  - `SD-001_API_SPEC` — v1.0, Active, applies to API Solution Design specifications, First Release Pass 26.0.1, Used By: API-001, API-002.
- Add a short §**"Applies To" Summary Table** at the top of the registry (the compact matrix requested in Recommendation 1) — one row per template, columns: Template, Version, Applies To, Owning Governance Document, Lifecycle. This gives the "canonical reference" view without duplicating the detailed records.
- Add a cross-reference line to `GOVERNANCE_FRONTMATTER_STANDARD.md` under Framework Status references.

No edits to existing GT-00N records beyond adding the "Applies To" column into the new summary table.

#### Registration (four surfaces, both artifacts)

1. `docs/15-governance/README.md` — add row for `GOVERNANCE_FRONTMATTER_STANDARD.md`; note that `GOVERNANCE_TEMPLATE_REGISTRY.md` now covers SD-001 family (existing row unchanged if it already links).
2. `docs/DOCUMENT_INDEX.md` — add `GOVERNANCE_FRONTMATTER_STANDARD` entry.
3. `docs/_meta.json` — add under "15 Governance"; validate JSON.
4. `docs/15-governance/GOVERNANCE_FRAMEWORK_MANIFEST.json` — reference the new standard alongside existing governance artifacts; validate JSON.

#### Audit

Emit `docs/50-audit-reports/REPOSITORY_AUDIT_20260718T133000Z.md` using the repository-wide Verification Reporting Standard (Metadata → Check/Result/Action → Summary). Checklist:

- Frontmatter Standard authored with all nine sections including Mandatory Validation Checklist.
- Template Registry extended with three SD-001-family records and "Applies To" summary table.
- Grandfathering clause explicit with projection table.
- No rewrites of existing artifacts or existing GT-00N registry records.
- Four-surface registration complete.
- JSON validity of both `_meta.json` and `GOVERNANCE_FRAMEWORK_MANIFEST.json`.
- No framework evolution beyond adding this standard and extending the registry.
- **Frontmatter Validation Checklist = PASS** applied to the two authored/modified governance artifacts.
- READY only when Failed = 0 and Outstanding Risks = 0.

#### Execution record — append to `.lovable/plan.md`

```
execution_status: COMPLETE
phase: Governance
template: GT-002_STAGE1_AUTHORING
template_version: v1.0
specification: GOVERNANCE_FRONTMATTER_STANDARD + GOVERNANCE_TEMPLATE_REGISTRY (extension)
stage: Repository Governance Standard
parent_execution_id: SD007-API002-20260718T130000Z-001
handoff_state: READY_FOR_MOD001_PUBLICATION
```

---

### Pass 33.0.0 — GT-005 Module Publication: MOD-001 Platform Administration

Mirrors Pass 22.0.2 (MOD-017) and Pass 25.0.1 (MOD-018). First artifact authored under the new Frontmatter Standard.

- **Preflight** — confirm MOD-001 still absent from `MODULE_PUBLICATION_CATALOG.md`; read `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md` in full; consult MOD-017/MOD-018 publications for structural precedent.
- **Author** `docs/45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md`, derived exclusively from the baseline. Frontmatter uses canonical values from the new standard: `spec_id: MOD-001_MODULE_PUBLICATION`, `template: GT-005_MODULE_PUBLICATION`, `template_version: v1.0`. Same section layout as MOD-017/MOD-018 publications. Zero new business content.
- **Register on four surfaces**:
  1. `docs/MODULE_PUBLICATION_CATALOG.md` — add MOD-001 row (Status: Published).
  2. `docs/45-module-publications/README.md` — add MOD-001 entry.
  3. `docs/DOCUMENT_INDEX.md` — add publication entry.
  4. `docs/_meta.json` — add under "45 Module Publications"; validate JSON.
- **Audit** — emit `docs/50-audit-reports/REPOSITORY_AUDIT_20260718T140000Z.md`. Checklist includes: baseline authority, no new business content, engine/ADR reconciliation vs baseline, four-surface registration, `_meta.json` validity, **Frontmatter Validation Checklist = PASS**, guardrails. READY only when Failed = 0 and Outstanding Risks = 0.
- **Execution record** — `template: GT-005_MODULE_PUBLICATION v1.0`, `specification: MOD-001_MODULE_PUBLICATION`, `parent_execution_id` = Pass 33.0.-1 execution id, `handoff_state: READY_FOR_PHASE_3_PLATFORM_ADMINISTRATION`.

---

### Subsequent (unchanged)

- **Pass 33.0.1 — SD-008: WEB-003 Platform Administration** — `template: SD-001_WEB_SPEC v1.0`; precedent WEB-001/002; audit `REPOSITORY_AUDIT_20260718T150000Z.md`; handoff `READY_FOR_MOBILE`.
- **Pass 34.0.1 — SD-009: MOB-003** — `template: SD-001_MOB_SPEC v1.0`; audit `…T160000Z`; handoff `READY_FOR_API`.
- **Pass 35.0.1 — SD-010: API-003** — `template: SD-001_API_SPEC v1.0`; audit `…T170000Z`; handoff `PLATFORM_ADMINISTRATION_PLATFORM_COMPLETE`.

Subsequent Published Modules follow the same GT-005 → WEB → MOB → API lifecycle, all governed by the new Frontmatter Standard and the extended Template Registry.

---

### Deferred (per reviewer's own guidance)

- **Rec 3** — dedicated `GOVERNANCE_LIFECYCLE_STANDARD.md` (Baseline → Publication → WEB → MOB → API → Platform Complete). Deferred; the lifecycle is already implicit in the existing governance documents.
- **Rec 4** — richer `execution_metadata` block (before/after repository state, timestamps). Deferred; will be introduced as a governance pass when execution-record automation is prioritized.
- **Rec 5** — repository-wide `DOC-001` Document Schema Standard. Deferred until ~30–40 modules per reviewer's guidance.

---

### Lifecycle diagram

```text
GOVERNANCE_FRONTMATTER_STANDARD  +  TEMPLATE_REGISTRY (extension)
        │
        ▼
GT-005 Publication (MOD-001)
        │
        ▼
WEB-003
        │
        ▼
MOB-003
        │
        ▼
API-003
        │
        ▼
PLATFORM_ADMINISTRATION_PLATFORM_COMPLETE
```

### Guardrails

Zero governance framework evolution beyond adding the new standard and extending the existing registry. Zero edits to existing GT-00N registry records, Baselines, Sprint PRDs, Module PRDs, or previously-Published artifacts. Zero rewrites of existing frontmatter (grandfathered). Zero endpoints, protocols, payload schemas, code, infrastructure, framework decisions, UI, or new business rules.

### Approval scope

On approval I execute **Pass 33.0.-1 (Frontmatter Standard + Template Registry extension) and Pass 33.0.0 (GT-005 MOD-001 Publication)** in a single turn, then stop for review before Pass 33.0.1. Reply "chain" to continue straight through SD-008 → SD-009 → SD-010.
