# Pass 8 — Sprint PRD Framework (Scaffolding)

Documentation-only. Pass 8 establishes the **Sprint PRD layer** as the bridge from Module PRDs (MOD-NNN) to implementation. This scaffolding pass introduces the framework, template, and layer README — but does **not** author individual sprints yet. Actual sprint authoring happens per-module, sprint-by-sprint, in Pass 8.x.

No architecture, engines, ADRs, or Module PRDs are modified. No code, routes, packages, schemas, or APIs are introduced.

## What will be built

### 1. Sprint PRD layer

New folder: `docs/30-sprint-prds/`

- `README.md` — layer overview establishing:
  - Sprint PRD purpose (implementation-ready slice of a Module PRD).
  - Delivery hierarchy: **Module PRD → Sprint PRDs → Implementation Tasks → Source Code**.
  - Stable identifier scheme: `SPR-MOD-<NNN>-<NNN>` (e.g. `SPR-MOD-002-001` = Accounting Sprint 1). Identifiers are permanent and never reused, even if a sprint is renamed, split, merged, or retired.
  - Dependency rules — Sprint PRDs **may** consume ERP Core Engines (`ENG-NNN`), Accepted ADRs (`ADR-NNN`), Foundation, Architecture, and their parent Module PRD (`MOD-NNN`). They **MUST NOT** redefine any upstream layer or introduce business requirements not first captured in a Module PRD.
  - Folder convention — one subfolder per module (`docs/30-sprint-prds/<module-folder>/`), containing that module's Sprint PRD files.
  - Sprint PRD lifecycle: `Draft → Planned → In Progress → Done → Superseded`.
  - Identifier Cross-Reference Convention carried forward from Pass 7.

### 2. Authoritative Sprint PRD template

Replace the existing stub at `docs/99-templates/sprint-prd-template.md` with the authoritative Sprint PRD template. The template uses a **standard 13-section structure** (References is section 13, matching every other authoritative document in this repository):

Frontmatter fields:
- `sprint_id` — permanent `SPR-MOD-NNN-NNN`
- `parent_module` — `MOD-NNN`
- `iteration` — human-readable schedule label (e.g. `Sprint 1` or `2026-Q3-S1`). Renumberable without touching `sprint_id`.
- `related_engines` — array of `ENG-NNN`
- `related_adrs` — array of `ADR-NNN` (Accepted only, except explicitly awaited)
- `status` — `Draft | Planned | In Progress | Done | Superseded`
- `owner`
- `updated`

Body sections (13):

1. Sprint Objective and Scope
2. Features Included
3. User Stories
4. Acceptance Criteria
5. ERP Core Engine Dependencies (`ENG-NNN`)
6. Accepted ADR References (`ADR-NNN`)
7. Parent Module Reference (`MOD-NNN`)
8. Out-of-Scope
9. Risks and Assumptions
10. Definition of Done
11. Traceability to Module PRD (which Module PRD sections this sprint fulfils)
12. Test Strategy Summary (references authoritative testing standards; does not redefine)
13. References

The template states explicitly that Sprint PRDs consume the existing architecture and never redefine it, and that `sprint_id` is permanent while `iteration` may change.

### 3. Sprint Catalog (derived index)

New file: `docs/SPRINT_CATALOG.md`

Derived governance index in the same family as `MODULE_CATALOG.md`. Columns: Sprint ID, Iteration, Parent Module, Status, PRD Path, Owner. Ships empty (header + empty catalog table) until the first sprints are authored in Pass 8.x.

### 4. Per-module sprint subfolders (scaffolding only)

Create `docs/30-sprint-prds/<module-folder>/README.md` for each of the 18 modules (`MOD-001` … `MOD-018`). Each README:

- Links to the parent `MODULE_PRD.md`.
- States the sprint identifier prefix for that module (e.g. `SPR-MOD-002-NNN`).
- Contains an empty "Sprints" table that will grow as sprint files are added.

No actual Sprint PRDs are authored in this pass.

### 5. Derived governance refresh

- `docs/_meta.json` — register the new "30 Sprint PRDs" sidebar group (layer README + 18 module sub-READMEs, in `MOD-001…MOD-018` order).
- `docs/REPOSITORY_MAP.md` — add `30-sprint-prds/` to the tree overview and to the "Sprint PRDs (Pass 8+)" layer detail (flip status from *to be introduced* to *scaffolded*).
- `docs/DOCUMENT_INDEX.md` — add the new layer README, the replaced Sprint PRD template, `SPRINT_CATALOG.md`, and each module sprint subfolder README.
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md` — flip the "Sprint PRDs" row's Authoritative Documents from *to be introduced* to `docs/30-sprint-prds/`, and add `SPRINT_CATALOG.md` to the Documentation Traceability & Indexes row.
- `docs/DOCUMENT_TRACEABILITY.md` — reference Sprint PRDs as the downstream layer consuming Module PRDs.

### 6. Foundation Freeze / Baseline update

- `docs/FOUNDATION_FREEZE_v1.md` — update Next Milestones to mark Pass 8 as *In Progress — Scaffolding Complete*.
- `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md` — extend the Cross-Reference Map to include the new Sprint PRD layer and `SPRINT_CATALOG.md`. No governance change.

### 7. Internal plan record

`.lovable/plan.md` — append a Pass 8 scaffolding entry.

## Files touched

- **Create**:
  - `docs/30-sprint-prds/README.md`
  - `docs/30-sprint-prds/<module>/README.md` × 18
  - `docs/SPRINT_CATALOG.md`
- **Replace the existing stub**: `docs/99-templates/sprint-prd-template.md`
- **Edit**: `docs/_meta.json`, `docs/REPOSITORY_MAP.md`, `docs/DOCUMENT_INDEX.md`, `docs/DOCUMENT_OWNERSHIP_MATRIX.md`, `docs/DOCUMENT_TRACEABILITY.md`, `docs/FOUNDATION_FREEZE_v1.md`, `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md`, `.lovable/plan.md`

## What this pass explicitly does NOT do

- Does not author any actual Sprint PRDs. Sprint authoring is per-module and iterative in Pass 8.x.
- Does not modify Canon, Architecture, ERP Core Engines, ADRs, or Module PRDs.
- Does not introduce code, routes, packages, schemas, or APIs.

## Verification

- Sidebar renders the new "30 Sprint PRDs" group with 19 items (layer README + 18 modules).
- Every module subfolder has a README linked to its parent `MOD-NNN` MODULE_PRD and states its `SPR-MOD-NNN-NNN` prefix.
- Sprint PRD template lists all 13 sections, includes `iteration` in frontmatter, and forbids upstream redefinition.
- Derived indexes still parse and cross-reference the new layer.