---
title: "Sprint Roadmap"
summary: "Cross-module sprint planning roadmap: phases, modules, estimated sprint counts, priorities, and dependencies. Values are initial planning estimates, not implementation commitments."
layer: "delivery"
owner: "Engineering"
status: "approved"
updated: "2026-07-05"
tags: ["sprint", "roadmap", "planning", "governance"]
document_type: "Sprint Layer Guide"
---

# Sprint Roadmap

> **Planning document.** This roadmap sequences Sprint PRD authoring across all 18 modules in dependency order. It is authoritative for *ordering* but not for *content*: each Sprint PRD, once authored, is authoritative for its own scope. On any conflict with an authored Sprint PRD, the Sprint PRD wins and this roadmap is corrected in the same change.

## How to Read

- **Phase** — Pass 8.x phase in which this module's Sprint PRDs are authored.
- **Module** — human-readable name.
- **Module ID** — permanent `MOD-NNN` identifier from the Module Catalog.
- **Estimated Sprint Count** — an **initial planning estimate** of how many Sprint PRDs the module is expected to require. This is not an implementation commitment; the actual number is fixed only when each Sprint PRD is authored and registered in `docs/SPRINT_CATALOG.md`.
- **Priority** — relative authoring priority within Pass 8.x (`P0`, `P1`, `P2`).
- **Depends On** — modules whose Sprint PRDs SHOULD be authored first because their engines / events / master data are consumed here.

Estimated sprint counts reflect the initial planning baseline. They will be refined as each phase is authored and MUST NOT be treated as delivery commitments.

## Roadmap

| Phase | Module | Module ID | Estimated Sprint Count | Priority | Depends On |
| --- | --- | --- | --- | --- | --- |
| Pass 8.2 | Platform Administration | MOD-001 | 6 | P0 | — |
| Pass 8.3 | Accounting | MOD-002 | 8 | P0 | MOD-001 |
| Pass 8.4 | Purchase | MOD-004 | 5 | P0 | MOD-001, MOD-002 |
| Pass 8.4 | Inventory | MOD-005 | 6 | P0 | MOD-001, MOD-002, MOD-004 |
| Pass 8.5 | Sales | MOD-003 | 6 | P0 | MOD-001, MOD-002, MOD-005 |
| Pass 8.5 | CRM | MOD-006 | 5 | P1 | MOD-001, MOD-003 |
| Pass 8.6 | HRMS | MOD-007 | 5 | P1 | MOD-001 |
| Pass 8.6 | Payroll | MOD-008 | 4 | P1 | MOD-001, MOD-002, MOD-007 |
| Pass 8.7 | Manufacturing | MOD-009 | 6 | P1 | MOD-001, MOD-004, MOD-005 |
| Pass 8.7 | Projects | MOD-010 | 5 | P1 | MOD-001, MOD-002, MOD-003 |
| Pass 8.8 | AMC | MOD-011 | 4 | P2 | MOD-001, MOD-003, MOD-005 |
| Pass 8.8 | Field Service | MOD-012 | 5 | P2 | MOD-001, MOD-005, MOD-011 |
| Pass 8.9 | Assets | MOD-013 | 4 | P2 | MOD-001, MOD-002 |
| Pass 8.9 | Fleet | MOD-014 | 4 | P2 | MOD-001, MOD-013 |
| Pass 8.10 | POS | MOD-015 | 5 | P2 | MOD-001, MOD-002, MOD-003, MOD-005 |
| Pass 8.10 | Service Desk | MOD-016 | 4 | P2 | MOD-001, MOD-006 |
| Pass 8.11 | Analytics | MOD-017 | 5 | P2 | MOD-001, MOD-002, MOD-003, MOD-005 |
| Pass 8.11 | AI Workspace | MOD-018 | 5 | P2 | MOD-001, MOD-017 |

## Governance

- Reordering a module across phases MUST update this file, `docs/SPRINT_DEPENDENCY_MATRIX.md`, and any affected module `README.md` in `docs/30-sprint-prds/`.
- Sprint counts refined during authoring update the affected module row and the affected module `README.md` planning placeholder table in the same change.
- This roadmap does not create Sprint PRDs; Sprint PRDs are authored per phase in Pass 8.2 onward.

## References

- `docs/SPRINT_AUTHORING_GUIDE.md`
- `docs/SPRINT_ESTIMATION_GUIDE.md`
- `docs/SPRINT_DEPENDENCY_MATRIX.md`
- `docs/SPRINT_CATALOG.md`
- `docs/MODULE_CATALOG.md`
- `docs/module-dependency-matrix.md`
- `docs/FOUNDATION_FREEZE_v1.md`
