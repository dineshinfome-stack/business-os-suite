---
title: "Sprint Dependency Matrix"
summary: "Allowable implementation order across modules for Sprint PRD authoring and execution. Derived from the Module Dependency Matrix; does not redefine it."
layer: "delivery"
owner: "Engineering"
status: "approved"
updated: "2026-07-05"
tags: ["sprint", "dependencies", "sequencing", "governance"]
document_type: "Sprint Layer Guide"
---

# Sprint Dependency Matrix

> **Derived document.** Cross-references `docs/module-dependency-matrix.md`. On any conflict with the Module Dependency Matrix, the upstream Module Dependency Matrix wins and this document is corrected in the same change.

## Purpose

Defines the allowable order in which Sprint PRDs are authored (Pass 8.x) and executed. A Sprint PRD in a downstream module MUST NOT enter `In Progress` before the required Sprint PRDs in its upstream modules are `Done`.

## Implementation Order (Primary Chain)

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
HRMS (MOD-007) → Payroll (MOD-008)
   ↓
Manufacturing (MOD-009), Projects (MOD-010)
   ↓
AMC (MOD-011) → Field Service (MOD-012)
   ↓
Assets (MOD-013) → Fleet (MOD-014)
   ↓
POS (MOD-015), Service Desk (MOD-016)
   ↓
Analytics (MOD-017) → AI Workspace (MOD-018)
```

## Dependency Matrix

Rows are dependent modules. Columns list modules whose Sprint PRDs SHOULD be `Done` first. `—` means no upstream dependency.

| Module | Module ID | Depends On |
| --- | --- | --- |
| Platform Administration | MOD-001 | — |
| Accounting | MOD-002 | MOD-001 |
| Purchase | MOD-004 | MOD-001, MOD-002 |
| Inventory | MOD-005 | MOD-001, MOD-002, MOD-004 |
| Sales | MOD-003 | MOD-001, MOD-002, MOD-005 |
| CRM | MOD-006 | MOD-001, MOD-003 |
| HRMS | MOD-007 | MOD-001 |
| Payroll | MOD-008 | MOD-001, MOD-002, MOD-007 |
| Manufacturing | MOD-009 | MOD-001, MOD-004, MOD-005 |
| Projects | MOD-010 | MOD-001, MOD-002, MOD-003 |
| AMC | MOD-011 | MOD-001, MOD-003, MOD-005 |
| Field Service | MOD-012 | MOD-001, MOD-005, MOD-011 |
| Assets | MOD-013 | MOD-001, MOD-002 |
| Fleet | MOD-014 | MOD-001, MOD-013 |
| POS | MOD-015 | MOD-001, MOD-002, MOD-003, MOD-005 |
| Service Desk | MOD-016 | MOD-001, MOD-006 |
| Analytics | MOD-017 | MOD-001, MOD-002, MOD-003, MOD-005 |
| AI Workspace | MOD-018 | MOD-001, MOD-017 |

## Parallelism Rules

- Modules with disjoint upstream sets MAY be authored in parallel within a single Pass 8.x phase (see `docs/SPRINT_ROADMAP.md`).
- Within a module, Sprint PRDs execute in `SPR-MOD-NNN-NNN` order unless the Sprint PRDs themselves declare compatible parallelism (no shared migrations, no shared feature flags).
- Cross-module parallelism requires that no cross-module event / API contract be introduced by the parallel sprints — such contracts belong upstream (Architecture, ADR, Module PRD), not in a sprint.

## Governance

- Sequencing changes here are driven by upstream changes in `docs/module-dependency-matrix.md`. Do not modify sequencing in isolation.
- Adding or removing a module updates this matrix, `SPRINT_ROADMAP.md`, and the affected `docs/30-sprint-prds/<module>/README.md` in the same change.

## References

- `docs/module-dependency-matrix.md`
- `docs/SPRINT_ROADMAP.md`
- `docs/SPRINT_AUTHORING_GUIDE.md`
- `docs/SPRINT_ESTIMATION_GUIDE.md`
- `docs/SPRINT_CATALOG.md`
- `docs/MODULE_CATALOG.md`
