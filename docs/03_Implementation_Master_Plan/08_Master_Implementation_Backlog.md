---
document: IMP Chapter 08 — Master Implementation Backlog
version: 1.0.0
owner: Program Delivery
approval_status: Draft
---

# 08 — Master Implementation Backlog

## Purpose
Consolidate every existing sprint into a single prioritized, traceable, wave-assigned operational backlog. Creates **no new work**; every row references authoritative documents.

## Backlog
The authoritative machine-readable backlog lives in `indexes/master_implementation_backlog.md`. Columns:

`Module | Wave | Sprint | Priority | Dependencies | Status | PRD | Solution Design | Sprint Plan | Acceptance Gate`

## How to Use
- Program Delivery draws work from this backlog only.
- Rows are added or updated **only** when a new sprint file exists in `docs/30-sprint-prds/`. The backlog never invents work.
- Priority reflects wave order (A > B > … > H) and, within a wave, dependency order.
- Status values: `Not Started | In Progress | In Review | Done | Blocked`.

## Traceability
Every backlog row cross-references the module PRD, the three Solution Designs (Web, Mobile, API), and the Sprint PRD. Acceptance Gate references the Milestone Exit Checklist.

## References
- `indexes/master_implementation_backlog.md`
- EEMP Ch. 11 Sprint Execution
- `docs/30-sprint-prds/` (source of truth)
