# Pass 8.2.Y + 8.2.Z — Baseline Location Alignment, then MOD001_PLATFORM_BASELINE_v1

Documentation-only. Two sequential passes. Pass 8.2.Y reconciles governance so `docs/40-module-baselines/` becomes the repository-standard Stage 3 location and clarifies sprint lifecycle semantics before any baseline is authored. Pass 8.2.Z then authors the first baseline (MOD-001) against the updated governance. No code, schema, ADRs, ERP Core Engines, Module PRDs, or Sprint PRDs are modified in either pass.

---

## Pass 8.2.Y — Governance Alignment: Baseline Location + Sprint Lifecycle

**Goal.** Make governance the single source of truth for (a) the Stage 3 baseline location, and (b) the meaning of each Sprint lifecycle state. Adopt `docs/40-module-baselines/` as the repository standard for all Module Baselines (MOD-001 … MOD-018). No baseline is created in this pass.

> **Principle:** governance changes first, artifacts second. **No baseline catalog is created in this pass because no Module Baselines exist yet.** The catalog (`MODULE_BASELINE_CATALOG.md`) is introduced in Pass 8.2.Z when the first baseline is authored.

### Edits

1. `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
   - Stage 3 section: replace the current baseline path `docs/20-module-prds/<module>/MOD<NNN>_<MODULE>_BASELINE_v1.md` with `docs/40-module-baselines/MOD<NNN>_<MODULE>_BASELINE_v<version>.md`.
   - Update prose referencing the old location or examples.
   - Preserve all other Stage 3 rules (purpose, exit criteria, versioning semantics).
   - **Sprint Lifecycle Clarification (new subsection under Stage 2).** State the canonical meaning of each sprint status used across `SPRINT_CATALOG.md`, module READMEs, and Sprint PRD frontmatter:
     - `Draft` — Sprint PRD authored, not yet reviewed.
     - `Planned` — Sprint PRD reviewed and accepted for execution; not yet in flight. (Optional intermediate state; may be skipped for documentation-only sprints.)
     - `In Progress` — Sprint PRD is actively being executed.
     - `Done` — Sprint PRD is included in an approved Module Baseline (Stage 3). Transition to `Done` is performed **only** by the Stage 3 pass authoring the baseline.
     - `Superseded` — Sprint PRD replaced by a later Sprint PRD.
   - Cross-link this clarification from `SPRINT_AUTHORING_GUIDE.md` §status-lifecycle if such an anchor exists; otherwise add a one-line pointer.

2. `docs/REPOSITORY_MAP.md`
   - Register `docs/40-module-baselines/` as a new category with a one-line description ("Frozen Module Baselines produced at Stage 3 of the module implementation workflow").
   - Remove any prior mention of baselines living under `docs/20-module-prds/<module>/`.

3. `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md`
   - Add `40-module-baselines/` to the documented layer catalog, positioned after Sprint PRDs and before templates.

4. `docs/DOCUMENT_INDEX.md`
   - Add a new category header for Module Baselines pointing at `docs/40-module-baselines/`. No baseline entries yet.

5. `docs/_meta.json`
   - Reserve the sidebar section header for `40-module-baselines/`. Leaf entries (README and baseline) are added in Pass 8.2.Z when those files exist.

6. `docs/DOCUMENT_OWNERSHIP_MATRIX.md` (only if it enumerates layers by path)
   - Add ownership row: Module Baselines → owning module's domain lead, with Architecture review.

7. `docs/DOCUMENT_TRACEABILITY.md` (only if it enumerates upstream/downstream flows by path)
   - Insert Module Baselines as a downstream node of Module PRDs + Sprint PRDs.

8. `docs/SPRINT_AUTHORING_GUIDE.md` (only if a status-lifecycle section already exists)
   - Align the status definitions with the authoritative list above by pointer or short restatement. Do not duplicate the canonical text.

9. `.lovable/plan.md`
   - Append Pass 8.2.Y execution record: what changed, why, and that no baseline was created.

### Not changed in 8.2.Y

Module PRDs, Sprint PRDs (no status transitions performed here), ADRs, ERP Core Engines, architecture docs, sprint methodology beyond the lifecycle clarification, code, schema.

### Verification for 8.2.Y

- Every doc naming a baseline path now points at `docs/40-module-baselines/`.
- `rg` for the old baseline path returns zero live references (only historical mentions inside `.lovable/plan.md` allowed).
- `DOCUMENT_INDEX.md` shows the new category header exactly once.
- Sidebar has the new section header exactly once, with no leaf entries yet.
- `MODULE_IMPLEMENTATION_WORKFLOW.md` Stage 2 contains a single canonical Sprint Lifecycle definition, and any other doc that formerly duplicated it now either points at that definition or matches it verbatim.

---

## Pass 8.2.Z — MOD001_PLATFORM_BASELINE_v1

Executed only after 8.2.Y is applied. Freezes MOD-001 after Sprints 001–006 and establishes the first Module Baseline in the repository.

### 1. Create baseline document

**Path:** `docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md` (governance-sanctioned per 8.2.Y).

**Frontmatter:** `baseline_id: MOD001_PLATFORM_BASELINE_v1`, `module_id: MOD-001`, `version: 1.0`, `status: Baseline`, `owner: Platform`, `source_module_prd: MOD-001`, `source_sprint_plan: MOD-001_SPRINT_PLAN.md`, `source_sprints: SPR-MOD-001-001..006`, `updated: 2026-07-06`.

**Sections (reference-only — no new requirements):**

1. **Purpose** — freezes MOD-001 after successful completion of all six Platform Sprint PRDs.
2. **Module Scope** — restates capabilities from the MOD-001 Module PRD, reference only.
3. **Implemented Sprint Summary** — table of Sprints 001–006 with Sprint ID, Title, Status (Done), primary capability delivered.
4. **Capability Coverage** — matrix mapping each MOD-001 Module PRD capability to Sprint PRDs (tenancy → 001; org structure → 002; users/roles/permissions → 003; configuration hierarchy → 004; localization packs → 005; audit review + platform administration → 006). No orphans.
5. **ERP Core Engine Consumption** — **Consolidates all ERP Core Engines referenced by SPR-MOD-001-001 through SPR-MOD-001-006 as reference-only consumption. The baseline MUST faithfully reflect the Sprint PRDs and MUST NOT introduce additional engines or omit any engine consumed by the sprint family.** Derived at authoring time from each Sprint PRD's `related_engines` frontmatter and body citations; no fixed list embedded in this plan.
6. **ADR Consumption** — **Consolidates all Accepted ADRs referenced by SPR-MOD-001-001 through SPR-MOD-001-006. The baseline is a reference consolidation only and MUST NOT introduce additional ADRs or omit any ADR consumed by the sprint family.** Derived at authoring time from Sprint PRD `related_adrs` frontmatter and body citations.
7. **Governance Conventions Established** — references the Platform conventions authored across the sprint family (Event Ownership, Effective Configuration, Configuration Ownership, Localization Ownership, Audit Ownership). Reference only; no new convention is introduced here.
8. **Module Completion & Freeze Statement** — objective statement that all six planned Platform Sprint PRDs exist, the Sprint Plan is executed, repository verification is complete, and the module is ready for downstream consumption. Adds explicit freeze semantics:

   > MOD-001 is now frozen for downstream consumption. Future changes to Platform scope, capabilities, or governance conventions MUST occur through a subsequent documented baseline revision (e.g., `MOD001_PLATFORM_BASELINE_v2`) rather than by modifying this baseline in place. This baseline is versioned governance, analogous to a published API or database schema version.

9. **Deferred Items** — Authentication, Identity Federation, SIEM, External Monitoring, BI, Infrastructure Observability, plus any additional explicit out-of-scope items called out in Sprints 001–006.
10. **Downstream Dependencies** — MOD-002 Accounting, MOD-003 Sales, MOD-004 Purchase, MOD-005 Inventory, MOD-006 CRM, MOD-007 HRMS, MOD-008 Payroll, MOD-009 Manufacturing, MOD-010 Projects, MOD-013 Assets, MOD-014 Fleet, MOD-015 POS, MOD-016 Service Desk, MOD-017 Analytics, MOD-018 AI Workspace. Downstream modules consume Platform but do not redefine Platform responsibilities.
11. **References** — MOD-001 Module PRD, MOD-001 Sprint Plan, Sprint PRDs 001–006, cited Accepted ADRs, cited ERP Core Engines.

### 2. Governance registrations (derived documents only)

- `docs/40-module-baselines/README.md` — **create**. Registers the category and links `MOD001_PLATFORM_BASELINE_v1`.
- `docs/MODULE_BASELINE_CATALOG.md` — **create** (first baseline in repo). Row for `MOD001_PLATFORM_BASELINE_v1`: module, version, status Baseline, source PRD, sprint range, updated. (Optional `Stage` column — Planning / Authoring / Baseline — deferred until several modules exist; schema is extensible without rework.)
- `docs/SPRINT_CATALOG.md` — transition all six Platform sprint rows from `Draft` to `Done`, consistent with the Sprint Lifecycle Clarification introduced in 8.2.Y (Done = included in an approved Module Baseline). This is the first and only pass authorized to make this transition for MOD-001.
- `docs/DOCUMENT_INDEX.md` — one new entry for `MOD001_PLATFORM_BASELINE_v1` under the Module Baselines category created in 8.2.Y.
- `docs/_meta.json` — sidebar leaf entries for `MOD001_PLATFORM_BASELINE_v1.md` and `40-module-baselines/README.md` (each exactly once) under the section header reserved in 8.2.Y.
- `.lovable/plan.md` — append Pass 8.2.Z execution record.

No changes to Module PRDs, Sprint PRDs, ADRs, ERP Core Engines, architecture, or workflow docs (workflow was already updated in 8.2.Y).

### 3. Verification for 8.2.Z

1. Baseline appears exactly once in `DOCUMENT_INDEX.md`, under the Module Baselines category.
2. Sidebar has exactly one entry each for the baseline and the category README.
3. `40-module-baselines/README.md` references `MOD001_PLATFORM_BASELINE_v1`.
4. All six Platform Sprint PRDs are referenced by the baseline's §3 and §4.
5. Every MOD-001 Module PRD capability traces to at least one Sprint PRD in §4.
6. No Platform capability sits outside the baseline.
7. **Derivation check (Engines):** the set of engines listed in §5 equals the union of `related_engines` and body citations across SPR-MOD-001-001..006 — no additions, no omissions.
8. **Derivation check (ADRs):** the set of ADRs listed in §6 equals the union of `related_adrs` and body citations across SPR-MOD-001-001..006 — no additions, no omissions.
9. `SPRINT_CATALOG.md` shows all six Platform sprints as `Done`; no other module rows touched. The transition is consistent with the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
10. Baseline path matches the location prescribed by `MODULE_IMPLEMENTATION_WORKFLOW.md` (post-8.2.Y).

---

## Not changed (either pass)

No code, SQL, schema, APIs, UI, architecture, ERP Core Engines, ADRs, Module PRDs, Sprint PRDs.

## Deferred (noted, not executed here)

- Once MOD-002 and MOD-003 baselines exist, consider introducing `docs/MODULE_BASELINE_INDEX.md` (or `MODULE_RELEASE_MATRIX.md`) with a per-module baseline/version/status/depends-on table. Out of scope.
- Optional `Stage` column (Planning / Authoring / Baseline) on `MODULE_BASELINE_CATALOG.md` once several modules are represented.

## Outcome

Pass 8.2.Y makes `docs/40-module-baselines/` the governance-sanctioned Stage 3 location repository-wide and codifies the canonical Sprint lifecycle (Draft → Planned → In Progress → Done → Superseded, with `Done` bound to Stage 3 baseline inclusion). Pass 8.2.Z then authors `MOD001_PLATFORM_BASELINE_v1` under that location — the first authoritative Module Baseline — derives its Engine and ADR consumption sections directly from the Sprint PRDs (no hard-coded lists), certifies MOD-001 completion with explicit freeze-and-version semantics, and unblocks **Pass 8.3.0 — MOD-002 Accounting Sprint Planning**.
