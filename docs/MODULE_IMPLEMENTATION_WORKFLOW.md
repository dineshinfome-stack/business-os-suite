---
title: "Module Implementation Workflow"
summary: "Repository-wide three-stage cadence for taking every module (MOD-001 … MOD-018) from Module PRD to Module Baseline: Stage 1 Planning → Stage 2 Sprint PRD Authoring → Stage 3 Module Baseline."
layer: "delivery"
owner: "Engineering"
status: "approved"
updated: "2026-07-06"
tags: ["workflow", "governance", "sprint", "module", "process"]
document_type: "Governance Guide"
---

# Module Implementation Workflow

> **Repository-wide governance.** This workflow is repository-wide and applies to every module from **MOD-001 through MOD-018**. Pass 8.2.0 introduces the workflow and applies it to **Platform Administration (MOD-001)** as the first implementation example. All subsequent module implementations follow the same three stages without deviation.

## Purpose

Every module implementation follows the same **three-stage cadence**:

1. **Stage 1 — Module Sprint Planning** (architecture of the module).
2. **Stage 2 — Sprint PRD Authoring** (iterative, one sprint at a time).
3. **Stage 3 — Module Baseline** (freeze the module for downstream consumption).

The workflow ensures that Sprint PRDs are consistent across modules, that every sprint traces to Module PRD content and to Accepted upstream architecture (ERP Core Engines, ADRs), and that a module is only considered "done" when it has an objective, versioned baseline.

## Applicability

- **Scope:** repository-wide, `MOD-001` … `MOD-018`.
- **Precedes:** any Sprint PRD authoring in `docs/30-sprint-prds/<module>/`.
- **Consumes:** the frozen upstream (Foundation, Canon, Architecture, ERP Core Engines, ADRs), the parent Module PRD, and the Sprint framework (`SPRINT_AUTHORING_GUIDE.md`, `SPRINT_ROADMAP.md`, `SPRINT_ESTIMATION_GUIDE.md`, `SPRINT_DEPENDENCY_MATRIX.md`).
- **Does not modify:** any upstream layer. Each stage is documentation-only unless a downstream implementation pass explicitly follows a completed baseline.

## Pass Numbering Convention

Passes for module implementation planning are numbered so the stage is unambiguous from the pass identifier:

| Pass identifier | Meaning |
| --- | --- |
| `Pass 8.<M>.0` | **Stage 1** — Sprint Planning for module `M`. |
| `Pass 8.<M>.<N>` | **Stage 2** — authoring of sprint `N` for module `M` (`N ≥ 1`). |
| `Pass 8.<M>.Z` | **Stage 3** — Module Baseline for module `M`. |

Here `M` is the numeric position of the module in dependency order, not the module identifier: `Pass 8.2` is MOD-001 (Platform Administration), `Pass 8.3` is MOD-002 (Accounting), and so on, mirroring the sequencing in `SPRINT_ROADMAP.md`.

## Stages

### Stage 1 — Module Sprint Planning

**Deliverable:** `docs/30-sprint-prds/<module>/MOD-<NNN>_SPRINT_PLAN.md`.

**Entry criteria:**

- The parent Module PRD (`docs/20-module-prds/<module>/MODULE_PRD.md`) is `approved`.
- The module's sprint folder README exists with the correct `sprint_prefix`.
- All ERP Core Engines and ADRs the module consumes are `Accepted` or explicitly documented as `Proposed` in the Module PRD's decisions register.

**Required content:**

- Purpose & Scope (traceable to Module PRD sections).
- Sprint Sequence — proposed ordered list of sprints, each with:
  - Objective, boundaries (in / out).
  - Estimated size (Small / Medium / Large, per `SPRINT_ESTIMATION_GUIDE.md`).
  - Parent Module PRD sections covered.
  - Engines consumed (`ENG-NNN`), ADRs consumed (`ADR-NNN`).
  - Intra-module dependencies (upstream sprints in the same module).
  - **Sprint Exit Criteria** — objective, testable conditions that must hold before the next sprint may begin. Distinct from Module Completion Criteria.
- Sprint Dependency Graph (ASCII).
- Engine Consumption Map (sprint × `ENG-NNN`).
- ADR Consumption Map (sprint × `ADR-NNN`).
- Cross-Sprint Dependency Matrix (shared migrations, feature flags, events).
- Risks & Assumptions.
- Module Completion Criteria — objective conditions for Stage 3 baseline.
- Non-Goals — no Sprint PRDs authored, no engine/ADR changes proposed.

**Sprint identifier reservations.** The Stage 1 plan may reserve sprint identifiers (`SPR-MOD-<NNN>-001`, `-002`, …) as **planning reservations**. Reserved identifiers are **not** authored Sprint PRDs, are **not** listed in `SPRINT_CATALOG.md`, and confer no commitment beyond ordering.

**Exit criteria:**

- Planning document approved (status `approved`).
- All reserved sprint IDs are contiguous starting from `-001`.
- Every reserved sprint traces to at least one Module PRD section.
- No orphan engine or ADR references.

**Governance:** owned by Engineering; reviewed by Engineering + Architecture.

### Stage 2 — Sprint PRD Authoring

**Deliverables:** `docs/30-sprint-prds/<module>/SPR-MOD-<NNN>-<sprint>.md`, authored one at a time.

**Iterative loop.** For each sprint reserved in Stage 1, in the order defined by the plan:

1. **Author** the Sprint PRD using `docs/99-templates/sprint-prd-template.md` and `SPRINT_AUTHORING_GUIDE.md` (including the Sprint Traceability Rule and the Sprint Completion Rule).
2. **Review** for consistency with the Stage 1 plan (scope, engines, ADRs, dependencies, exit criteria).
3. **Approve** — lifecycle transitions per the Sprint Lifecycle Clarification below and `docs/DOCUMENT_OWNERSHIP_MATRIX.md`.
4. **Register** in `docs/SPRINT_CATALOG.md` at the moment the Sprint PRD is authored (not before).
5. **Advance** to the next sprint only when the current sprint's exit criteria are objectively met.

**Rules:**

- One Sprint PRD per pass (`Pass 8.<M>.<N>`); no batching.
- No new engines, ADRs, or Module PRD changes may be introduced from within a Sprint PRD. If discovered as necessary, they must first be raised through their own governance process before Stage 2 continues.
- The Stage 1 plan MAY be amended between sprints if new information invalidates it; amendments are explicit and versioned.

**Exit criteria for the stage:** every sprint reserved in the current Stage 1 plan has status `Done`.

**Governance:** owned by Engineering; each Sprint PRD is reviewed by Engineering.

#### Sprint Lifecycle Clarification (canonical)

This is the single canonical definition of each Sprint PRD status used across `SPRINT_CATALOG.md`, module subfolder READMEs, and Sprint PRD frontmatter. Any other document that references these statuses MUST either point at this section or use identical language.

- **`Draft`** — Sprint PRD authored, not yet reviewed.
- **`Planned`** — Sprint PRD reviewed and accepted for execution; not yet in flight. Optional intermediate state; MAY be skipped for documentation-only sprints.
- **`In Progress`** — Sprint PRD is actively being executed.
- **`Done`** — Sprint PRD is included in an approved Module Baseline (Stage 3). Transition to `Done` is performed **only** by the Stage 3 pass authoring the baseline.
- **`Superseded`** — Sprint PRD replaced by a later Sprint PRD.

### Stage 3 — Module Baseline

**Deliverable:** `docs/40-module-baselines/MOD<NNN>_<MODULE>_BASELINE_v<version>.md` (a milestone document, versioned; version increments as `v1`, `v2`, …). Module Baselines live in the top-level `docs/40-module-baselines/` layer — not inside individual module subfolders — so every baseline is discoverable in one place.

**Entry criteria:**

- Every Sprint PRD reserved in the Stage 1 plan has status `Done`.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Purpose.** Freeze the module for downstream consumption. The baseline restates, without redefining:

- The Module PRD version at the time of baseline.
- The full list of Sprint PRDs delivered (identifiers, sizes, exit criteria met).
- Engines and ADRs consumed.
- Known limitations and deferred enhancements (routed to future Sprint PRDs or future Module PRD revisions).

**Exit criteria:** baseline document approved; downstream modules may now depend on this module's capabilities.

**Governance:** owned by Engineering; approved by Engineering + Architecture + Product.

## Stage Boundaries

Stages do not overlap. No Sprint PRD may be authored before Stage 1 approval; no Module Baseline may be issued before Stage 2 completes. If work-in-flight reveals a defect in a completed stage, that stage is amended explicitly before the current stage continues.

## Non-Goals

- This workflow does not change Module PRDs, ADRs, ERP Core Engines, or the Sprint framework artifacts.
- It does not introduce a new Sprint PRD template or new sprint sizing scheme.
- It does not authorize code, schema, or API changes.

## References

- [`docs/SPRINT_AUTHORING_GUIDE.md`](./SPRINT_AUTHORING_GUIDE.md)
- [`docs/SPRINT_ROADMAP.md`](./SPRINT_ROADMAP.md)
- [`docs/SPRINT_ESTIMATION_GUIDE.md`](./SPRINT_ESTIMATION_GUIDE.md)
- [`docs/SPRINT_DEPENDENCY_MATRIX.md`](./SPRINT_DEPENDENCY_MATRIX.md)
- [`docs/SPRINT_CATALOG.md`](./SPRINT_CATALOG.md)
- [`docs/DOCUMENT_OWNERSHIP_MATRIX.md`](./DOCUMENT_OWNERSHIP_MATRIX.md)
- [`docs/DOCUMENT_TRACEABILITY.md`](./DOCUMENT_TRACEABILITY.md)
- [`docs/20-module-prds/README.md`](./20-module-prds/README.md)
- [`docs/30-sprint-prds/README.md`](./30-sprint-prds/README.md)
