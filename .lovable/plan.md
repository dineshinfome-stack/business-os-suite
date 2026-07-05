## Add ERP Core Engine Catalog (Revised)

Create a single, lightweight master-index document that summarizes every ERP Core Engine in one table, with stable Engine IDs and an explicit "derived index" rule. Purely additive.

### New file: `docs/10-erp-core/ENGINE_CATALOG.md`

Frontmatter:
- `title: "ERP Core Engine Catalog"`
- `summary: "Master index of all ERP Core Engines: stable ID, category, version, status, stability, consumers, and dependencies."`
- `layer: platform`, `owner: Platform`, `status: approved`, `updated: 2026-07-05`
- `tags: [erp-core, catalog, index]`
- `document_type: "ERP Core Guide"`

Sections:

1. **Purpose** — single source of truth for the engine ecosystem; supports architecture reviews, dependency analysis, AI-assisted generation, impact analysis, and onboarding. Not a spec — normative content lives in each engine document and in `README.md` (Dependency Rules, Matrix, Versioning Policy).

2. **How to Read This Catalog** — column definitions. Note that `Used By` is intentionally coarse (module families / "All modules" / "Most modules" / "TBD Pass 7+") since business modules are not yet authored; `Depends On` lists direct engine dependencies only (event-only edges live in the Matrix in `README.md`).

3. **Engine ID Scheme** — permanent identifiers of the form `ENG-NNN` (zero-padded, 3 digits, monotonically assigned).
   - IDs are **stable**: never reassigned or reused, even if an engine is renamed, moved, or deprecated.
   - Deprecated/removed engines keep their ID with `status: deprecated` or `removed`; the ID row is retained for historical traceability.
   - ADRs, Module PRDs, Sprint PRDs, and AI prompts SHOULD reference engines by `ENG-NNN` to survive renames.
   - Initial allocation follows the reading order in `README.md` (Foundation → Document → Workflow → Financial → Intelligence → Integration → Data Exchange → AI), producing `ENG-001` … `ENG-028`.

4. **Engine Catalog Table** — one row per engine (28 engines). Columns: **ID · Engine · Category · Version · Status · Stability · Used By · Depends On**. Each engine name links to its spec. Values sourced from each engine's frontmatter (`version`, `status`, `stability`, `engine_category`) and from the Dependency Matrix in `README.md`.

5. **Maintenance Rules** — normative:
   - The catalog is a **derived index** and MUST NOT introduce information that is not present in the corresponding engine specification or the ERP Core README. On any conflict, the engine spec and the Dependency Matrix win; the catalog is corrected.
   - Any new engine, rename, version bump, status change, stability change, or dependency edge change MUST update this catalog in the same change.
   - New engines receive the next unused `ENG-NNN`. IDs are never reused.
   - `Depends On` MUST stay consistent with the Engine Dependency Matrix in `docs/10-erp-core/README.md`.
   - `Used By` is updated as Module PRDs (Pass 7+) declare engine consumption.

6. **Documentation Hierarchy** — short note clarifying the derivation chain:
   `FOUNDATION_FREEZE_v1` → `ERP Core README` (rules, matrix, versioning) → `ENGINE_CATALOG` (derived index) → 28 engine specifications.

7. **References** — `docs/10-erp-core/README.md`, `docs/FOUNDATION_FREEZE_v1.md`, `docs/canon.md`.

### `docs/_meta.json`

Register `10-erp-core/ENGINE_CATALOG` in the ERP Core Engines group immediately after the `10-erp-core/README` entry, so it appears as the second sidebar item in that section.

### `docs/10-erp-core/README.md`

Add one sentence in the intro / Reading Order area pointing readers to `ENGINE_CATALOG.md` as the master index and noting it is a derived view. No structural changes; Dependency Graph, Rules, Matrix, and Versioning Policy stay in `README.md`.

### Non-goals

- No changes to any engine specification.
- No new dependency, versioning, or governance rules beyond the derivation rule and the ID scheme.
- No implementation, ADRs, or vendor decisions.

### Acceptance criteria

- `docs/10-erp-core/ENGINE_CATALOG.md` exists with all 28 engines listed and linked, grouped or ordered by the 8 categories, each assigned `ENG-001` … `ENG-028`.
- Each row's Version/Status/Stability matches the corresponding engine's frontmatter; each row's Depends On is consistent with the Engine Dependency Matrix in `README.md`.
- The catalog contains explicit "derived index" and "stable ID" maintenance rules.
- `_meta.json` shows the catalog directly under the ERP Core README in the sidebar.
- `README.md` links to the catalog from its intro/reading-order area.
- Architecture layer and all engine specs untouched.
