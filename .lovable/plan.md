## Pass 7 — Domain / Module PRDs (completed)

Documentation-only. Created the `docs/20-module-prds/` layer with 18 modules (`MOD-001` … `MOD-018`), each containing a `README.md` and a 17-section `MODULE_PRD.md`. Refreshed the derived indexes and registered the new group in the docs sidebar. No changes to code, routes, packages, or any Passes 1–6.5 authoritative document.

### Added

- `docs/20-module-prds/README.md` — layer overview with Module Dependency Rules, Module Identifier Registry, and Identifier Cross-Reference Convention.
- 18 module folders (`platform`, `accounting`, `sales`, `purchase`, `inventory`, `crm`, `hrms`, `payroll`, `manufacturing`, `projects`, `amc`, `field-service`, `assets`, `fleet`, `pos`, `service-desk`, `analytics`, `ai`), each containing:
  - `README.md` — lightweight guide with capabilities, consumed engines, related modules, related ADRs.
  - `MODULE_PRD.md` — authoritative business PRD in the standard 17-section structure, with `module_id: MOD-NNN` frontmatter.

### Updated

- `docs/_meta.json` — new sidebar group `20 Module PRDs` (README + 18 modules, in specified order).
- `docs/MODULE_CATALOG.md` — flipped from `Planned` to `Authored`, keyed by `MOD-NNN`, linked to each PRD.
- `docs/ENGINE_USAGE_MATRIX.md` — module identifier legend (`MOD-001` … `MOD-018`) so module names in the matrix map cleanly to stable IDs.
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md` — Module PRDs family flipped to `docs/20-module-prds/` (`MOD-001` … `MOD-018`).
- `docs/DOCUMENT_INDEX.md` — new Module PRDs section listing all 37 files with authority.
- `docs/REPOSITORY_MAP.md` — new `20-module-prds/` layer entry and updated layer detail.

### Governance rules established

- **Stable Module Identifiers** — `MOD-NNN` is permanent; folders and labels may evolve.
- **Identifier Cross-Reference Rule** — on first mention in a document, use `Name (ENG-NNN)`, `Name (ADR-NNN)`, or `Name (MOD-NNN)`; subsequent mentions may use either.
- **Module Dependency Rules** — modules may consume Foundation / Architecture / ERP Core Engines / Accepted ADRs; MUST NOT redefine any of them; cross-module communication only via published events, approved APIs, or shared master data; no cyclic dependencies.

### Verification

- `docs/_meta.json` parses; new group has 19 items (README + 18 modules).
- All 37 module files exist under `docs/20-module-prds/`.
- No Passes 1–6.5 authoritative document was modified.
