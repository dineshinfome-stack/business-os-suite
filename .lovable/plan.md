# Pass 8.2.0 — Platform Sprint Planning (MOD-001, Stage 1) + Repository-Wide Module Implementation Workflow

Documentation-only. Introduces a **repository-wide** three-stage module implementation workflow (applies to MOD-001 through MOD-018), then executes **Stage 1 (Planning)** for MOD-001 Platform Administration as the first worked example. No Sprint PRDs are authored in this pass — Stage 2 begins only after this planning document is approved.

## Objectives

1. Formalize the **repository-wide** three-stage per-module workflow (Stage 1 Planning → Stage 2 Sprint PRDs → Stage 3 Module Baseline) as a governance artifact that governs every module from MOD-001 through MOD-018.
2. Produce the **Platform Sprint Planning** document — the architecture-of-the-module deliverable for MOD-001 — serving as the first worked example of Stage 1.
3. Refresh derived governance so the new workflow and Stage 1 artifact are discoverable and traceable.

## Deliverables

### 1. New repository-wide governance guide — `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`

Authoritative, **repository-wide** definition of the three-stage workflow. Explicitly scoped as: *"This workflow is repository-wide and applies to every module from MOD-001 through MOD-018. Pass 8.2.0 introduces the workflow and applies it to Platform Administration as the first implementation example."*

Contents:

- **Scope statement** — repository-wide; not module-specific.
- **Stage 1 — Module Sprint Planning**: produces `MOD-<NNN>_SPRINT_PLAN.md` inside the module's sprint folder. Entry criteria: parent Module PRD is `approved`. Exit criteria: planning document approved.
- **Stage 2 — Sprint PRD Authoring**: iterative loop (author → review → approve → next), one Sprint PRD at a time, registered in `SPRINT_CATALOG.md` as each is authored. Follows `SPRINT_AUTHORING_GUIDE.md`.
- **Stage 3 — Module Baseline**: produces `MOD<NNN>_<MODULE>_BASELINE_v1.md` once every Sprint PRD in the module is `Done`; freezes the module for downstream consumption.
- **Cross-references** to Pass 8 (Sprint framework) and Pass 8.1 (Sprint methodology).
- **Non-goals per stage**: no code, no ADR changes, no engine changes, no Module PRD changes within a stage.
- **Standard pass numbering convention**: `Pass 8.<M>.0` = Stage 1 for module M; `Pass 8.<M>.<N>` = Stage 2 authoring of sprint N; `Pass 8.<M>.Z` = Stage 3 baseline.

### 2. New Stage 1 planning document — `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md`

First worked example of Stage 1. Sections:

- **Purpose & Scope** — traces to `docs/20-module-prds/platform/README.md` and `MODULE_PRD.md`.
- **Sprint Sequence** — proposed ordered list of sprints (reserving identifiers `SPR-MOD-001-001` … as planning reservations, not authored documents). Per sprint:
  - Objective (one paragraph)
  - Boundaries (in / out)
  - Estimated size (Small/Medium/Large per `SPRINT_ESTIMATION_GUIDE.md`)
  - Parent Module PRD sections covered
  - Engines consumed (`ENG-NNN`)
  - ADRs consumed (`ADR-NNN`)
  - Upstream sprint dependencies (within MOD-001)
  - **Sprint Exit Criteria** — objective, testable conditions that must be true before the next sprint starts (e.g., "tenant creation works", "audit engine wired", "feature flags initialized"). Distinct from Module Completion Criteria.
- **Sprint Dependency Graph** — ASCII diagram of intra-module ordering.
- **Engine Consumption Map** — matrix (sprint × ENG-NNN).
- **ADR Consumption Map** — matrix (sprint × ADR-NNN).
- **Cross-Sprint Dependency Matrix** — shared migrations, feature flags, events.
- **Risks & Assumptions** — including any horizontal-only prerequisite sprints (per authoring guide §3).
- **Module Completion Criteria** — objective conditions that make MOD-001 ready for downstream modules (input to Stage 3 baseline).
- **Non-Goals** — no Sprint PRDs authored; no engine/ADR changes proposed; counts remain estimates.

Starting hypothesis (aligned with the roadmap's 6-sprint estimate; final ordering/slicing is the output of authoring the plan): Tenancy → Organization Structure → Users & Roles → Configuration → Localization Packs → Audit Review.

### 3. Update `docs/30-sprint-prds/platform/README.md`

- Add a "Stage 1 — Sprint Planning" section linking to `MOD-001_SPRINT_PLAN.md`.
- Note that the existing planning placeholder table will be reconciled with the sprint plan's proposed sequence once approved (still not authored Sprint PRDs).

### 4. Refresh derived governance

- `docs/_meta.json` — register new documents.
- `docs/REPOSITORY_MAP.md` — add entries for the workflow guide and Stage 1 plan.
- `docs/DOCUMENT_INDEX.md` — index both new files.
- `docs/DOCUMENT_TRACEABILITY.md` — link Stage 1 plan → Module PRD → engines → ADRs; workflow guide → Sprint framework/methodology.
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md` — workflow guide owned by Engineering (repository-wide); MOD-001 plan owned by Platform team.
- `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md` — record the three-stage workflow as the standard repository-wide cadence from Pass 8.2 onward.
- `.lovable/plan.md` — append Pass 8.2.0 execution log.

## Non-Goals

- No Sprint PRDs authored. Stage 2 begins in a subsequent pass, one sprint at a time.
- No changes to Module PRDs, ADRs, ERP Core Engines, Sprint PRD template, `SPRINT_AUTHORING_GUIDE.md`, `SPRINT_ESTIMATION_GUIDE.md`, `SPRINT_DEPENDENCY_MATRIX.md`, or `SPRINT_ROADMAP.md`.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- `SPRINT_CATALOG.md` remains unchanged.
- No baseline document is created; `MOD001_PLATFORM_BASELINE_v1.md` is a Stage 3 artifact.

## Sequencing After This Pass

- **Pass 8.2.1+** — Stage 2 for MOD-001: iterative Sprint PRD authoring (`SPR-MOD-001-001`, then `-002`, …), each reviewed and approved before the next.
- **Pass 8.2.Z** — Stage 3 for MOD-001: `MOD001_PLATFORM_BASELINE_v1.md`.
- **Pass 8.3.0** — Stage 1 for MOD-002 Accounting, reusing the repository-wide workflow.
