# Pass 8.1 — Sprint Authoring Methodology & Execution Plan (v4)

Documentation-only. Establishes the repeatable methodology, sizing, sequencing, and governance that every Pass 8.x Sprint PRD will follow. No Sprint PRDs are authored. No changes to Canon, Architecture, ERP Core Engines, ADRs, Module PRDs, or the Pass 8 scaffolding template — only the authoring framework layered on top.

## Objectives

Create the execution framework so that all future Sprint PRDs (Pass 8.2 onward) are consistent, traceable, dependency-ordered, and deliver complete verifiable increments — before any actual sprints are written.

## Deliverables

### 1. Sprint Authoring Guide

New file: `docs/SPRINT_AUTHORING_GUIDE.md`

Authoritative "how to author a Sprint PRD" document. Sections:

1. Purpose
2. Sprint decomposition philosophy (Module PRD → vertical slices)
3. Vertical slice principles (UI + engine + data + tests per slice)
4. Sprint sizing guidelines (references `SPRINT_ESTIMATION_GUIDE.md`)
5. Dependency handling (upstream module + engine + ADR)
6. Engine consumption rules (`ENG-NNN` — consume, never redefine)
7. ADR reference rules (Accepted only, except explicitly awaited)
8. Module traceability rules (every sprint traces to `MOD-NNN` sections)
9. **Sprint Traceability Rule** — Every Sprint PRD SHOULD trace each feature back to exactly one parent Module PRD section. A sprint MAY implement multiple related requirements from the same Module PRD but SHOULD avoid spanning unrelated module capabilities. If a sprint must satisfy requirements from multiple modules, the dependency MUST already exist in the Module Dependency Graph.
10. Acceptance Criteria writing standards (Given/When/Then, observable)
11. Definition of Done guidance (references authoritative testing + observability standards)
12. **Sprint Completion Rule** — A Sprint PRD SHOULD implement one or more complete business capabilities within its declared scope. A sprint MAY leave future enhancements for subsequent sprints, but it SHOULD NOT intentionally leave partially implemented functionality that cannot be exercised or validated independently. If unavoidable due to external dependencies, the incomplete capability MUST be explicitly documented under "Risks and Assumptions" and traced to the planned follow-up Sprint PRD.
13. Sprint sequencing rules (dependency order; see `SPRINT_DEPENDENCY_MATRIX.md`)
14. References

### 2. Sprint Roadmap

New file: `docs/SPRINT_ROADMAP.md`

Single planning table. Columns: Phase, Module, Module ID, **Estimated Sprint Count**, Priority, Depends On. The column heading `Estimated Sprint Count` (updated from `Planned Sprint Count`) reflects that values are initial planning estimates and not implementation commitments; an explanatory note above the table restates this. Phases seeded in dependency order (Platform → Accounting → Purchase → Inventory → Sales → CRM → remaining modules).

### 3. Module Sprint Planning Tables (roadmap placeholders only)

Update every `docs/30-sprint-prds/<module>/README.md` (18 files). Replace the current empty "Sprints" table with a **planning placeholder** table:

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |

Each row seeded with `Status = Planned` and uses the module's permanent `SPR-MOD-NNN-NNN` prefix. Row counts align with `SPRINT_ROADMAP.md`.

**Placeholder disclaimer** — every module README MUST include this statement above the planning table:

> Each row represents a planned sprint placeholder for roadmap purposes only. The existence of a row does not constitute creation or approval of a Sprint PRD. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

`SPRINT_CATALOG.md` is NOT modified in this pass — it continues to list only authored Sprint PRDs (currently none).

### 4. Sprint Estimation Guide

New file: `docs/SPRINT_ESTIMATION_GUIDE.md`

Defines Small / Medium / Large sprint sizes based on:

- Business capability breadth
- Implementation complexity
- Number of engine integrations (`ENG-NNN`)
- Cross-module impact
- ADR touch surface

Explicitly excludes story points. Provides one worked example per size band.

### 5. Sprint Dependency Matrix

New file: `docs/SPRINT_DEPENDENCY_MATRIX.md`

Derived governance document. Shows the allowable implementation order across modules:

```text
Platform (MOD-001)
   ↓
Accounting (MOD-002)
   ↓
Purchase (MOD-004)
   ↓
Inventory (MOD-005)
   ↓
Sales (MOD-003)
   ↓
CRM (MOD-006)
   ↓
... remaining modules
```

Includes a matrix table (rows = modules, columns = modules they depend on). Cross-references `docs/module-dependency-matrix.md` — does not redefine it.

### 6. Derived governance refresh

Update, without changing upstream layers:

- `docs/_meta.json` — register the four new documents.
- `docs/REPOSITORY_MAP.md` — add the four new files to the tree overview.
- `docs/DOCUMENT_INDEX.md` — add the four new files.
- `docs/DOCUMENT_TRACEABILITY.md` — reference the authoring guide as the process bridge between Module PRDs and Sprint PRDs.
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md` — add the four new files under Documentation Traceability & Indexes / Sprint PRDs rows.
- `docs/FOUNDATION_FREEZE_v1.md` — mark Pass 8.1 complete under Next Milestones; identify Pass 8.2 (MOD-001 Platform sprints) as the next planned implementation-planning phase.
- `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md` — extend the cross-reference map with the sprint authoring framework.
- `.lovable/plan.md` — append a Pass 8.1 entry.

## Files touched

- **Create**: `docs/SPRINT_AUTHORING_GUIDE.md`, `docs/SPRINT_ROADMAP.md`, `docs/SPRINT_ESTIMATION_GUIDE.md`, `docs/SPRINT_DEPENDENCY_MATRIX.md`
- **Edit**: 18 × `docs/30-sprint-prds/<module>/README.md`, `docs/_meta.json`, `docs/REPOSITORY_MAP.md`, `docs/DOCUMENT_INDEX.md`, `docs/DOCUMENT_TRACEABILITY.md`, `docs/DOCUMENT_OWNERSHIP_MATRIX.md`, `docs/FOUNDATION_FREEZE_v1.md`, `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md`, `.lovable/plan.md`

## Non-goals

- No Sprint PRDs authored.
- No implementation artifacts.
- No architecture, engine, ADR, or Module PRD changes.
- No changes to the Sprint PRD template (frozen in Pass 8).
- No changes to `SPRINT_CATALOG.md` — it lists only authored Sprint PRDs.

## Acceptance Criteria

- Sprint Authoring Guide includes both the Sprint Traceability Rule and the Sprint Completion Rule (the latter placed immediately after Definition of Done).
- Sprint Roadmap uses `Estimated Sprint Count` as the column heading and includes a note framing values as initial planning estimates.
- Sprint Estimation Guide and Sprint Dependency Matrix exist and are linked from the derived indexes.
- Every module sprint README contains a populated planning placeholder table with `Status = Planned` rows and the placeholder disclaimer above it.
- Sidebar renders the four new governance documents.
- `FOUNDATION_FREEZE_v1.md` marks Pass 8.1 complete and identifies Pass 8.2 as the next planned implementation-planning phase.
- No new Sprint PRD file exists under `docs/30-sprint-prds/<module>/SPR-MOD-*.md`.
- `SPRINT_CATALOG.md` remains empty of authored sprints.

## What comes next (informational only)

- Pass 8.2 — Platform Administration (MOD-001) Sprint PRDs
- Pass 8.3 — Accounting (MOD-002)
- Pass 8.4 — Purchase (MOD-004) + Inventory (MOD-005)
- Pass 8.5 — Sales (MOD-003) + CRM (MOD-006)
- Continuing module-by-module in dependency order.

---

## Pass 8.1 — Execution Log

Pass 8.1 (v4) implemented on 2026-07-05. Documentation-only. No code, schema, or upstream architectural changes.

Created:
- `docs/SPRINT_AUTHORING_GUIDE.md` — methodology including Sprint Traceability Rule and Sprint Completion Rule.
- `docs/SPRINT_ROADMAP.md` — cross-module roadmap using `Estimated Sprint Count` column with initial-planning-estimate framing.
- `docs/SPRINT_ESTIMATION_GUIDE.md` — Small / Medium / Large sizing framework with worked examples; no story points.
- `docs/SPRINT_DEPENDENCY_MATRIX.md` — derived allowable implementation order across modules.

Edited:
- 18 × `docs/30-sprint-prds/<module>/README.md` — populated planning placeholder tables (`Status = Planned`) with the placeholder disclaimer; no Sprint PRDs authored.
- `docs/_meta.json` — sidebar entries for the four new documents.
- `docs/REPOSITORY_MAP.md` — added the four new files to the tree overview.
- `docs/DOCUMENT_INDEX.md` — added the four new files.
- `docs/DOCUMENT_TRACEABILITY.md` — referenced the sprint authoring framework as the bridge between Module PRDs and Sprint PRDs.
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md` — added a Sprint Authoring Framework row and updated the derived-indexes row.
- `docs/FOUNDATION_FREEZE_v1.md` — Pass 8.1 marked complete; Pass 8.2 (MOD-001 sprints) identified as the next planned implementation-planning phase.
- `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md` — extended the cross-reference map and refreshed the Next Milestone table.

Not changed: Canon, Architecture, ERP Core Engines, ADRs, Module PRDs, Sprint PRD template, `SPRINT_CATALOG.md`.
