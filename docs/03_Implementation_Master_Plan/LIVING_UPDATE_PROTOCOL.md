---
document: IMP Living Update Protocol
version: 1.0.0
owner: Project Architecture
approver: Architecture Board
lifecycle_state: Living
authority: Governance
---

# IMP Living Update Protocol

Defines **what** to update, **when**, **by whom**, and **with what evidence** when the Implementation Master Plan is revised. Complements the Living Document Protocol section in `README.md`.

## Principles

1. **IMP is living; EEMP is frozen.** All execution drift is absorbed by the IMP.
2. **Reference, do not duplicate.** Cite authoritative sources (Architecture, ADRs, PRDs, Solution Designs, Sprint Plans, EEMP).
3. **Minimum surface area.** Touch only chapters/indexes listed for the trigger.
4. **Every revision is auditable.** Update `CHANGELOG.md`, preserve Evidence blocks.

## Trigger → Update Matrix

| Trigger | Chapters to Update | Indexes to Update | Required Evidence |
|---|---|---|---|
| Wave start | Ch 07 Module Sequence, Ch 09 Sprint Roadmap, Ch 21 Readiness | `module_sequence_matrix.md`, `master_implementation_backlog.md` | Wave kickoff approval; ADR references |
| Wave complete | Ch 06 Milestone Plan, Ch 09 Sprint Roadmap, Ch 21 Readiness | `milestone_matrix.md`, `milestone_exit_checklist.md`, `master_implementation_backlog.md` | Wave exit report in `docs/04_Program_Status/reports/` |
| Milestone reached | Ch 06 Milestone Plan | `milestone_matrix.md`, `milestone_exit_checklist.md` | Milestone evidence artifact |
| Release cut | Ch 05 Release Strategy, Ch 06 Milestone Plan | `release_matrix.md`, `milestone_matrix.md` | Release manifest |
| ADR change | Ch 04 Dependency Architecture, Ch 07 Module Sequence (as applicable) | `dependency_index.md`, `module_sequence_matrix.md` | New/amended ADR path |
| Risk state change | Ch 18 Risk Register | — | Reference to `docs/01-master/risk-register.md` |

## Revision Workflow

1. **Identify trigger** and confirm scope from the matrix above.
2. **Propose edits** on the smallest set of files.
3. **Update `CHANGELOG.md`** with version bump (`1.x` minor for scope change, `1.x.y` patch for editorial fix).
4. **Preserve Evidence blocks**: Source, Path, Authority, Reference, Confidence.
5. **Publish** and notify Architecture Board.

## What NOT to Do

- Do not rewrite EEMP chapters — they are frozen.
- Do not duplicate PRD, SD, or Sprint Plan content — reference paths only.
- Do not add new modules, standards, or requirements via the IMP.
- Do not touch chapters outside the trigger's row unless justified in the changelog entry.
