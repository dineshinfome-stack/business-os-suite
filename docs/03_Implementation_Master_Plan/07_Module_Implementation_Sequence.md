---
document: IMP Chapter 07 — Module Implementation Sequence
version: 1.0.0
owner: Program Delivery
approval_status: Draft
---

# 07 — Module Implementation Sequence

## Sequence Table
See `indexes/module_sequence_matrix.md` for the full machine-readable matrix with columns: `Module | Wave | Depends On | Can Run In Parallel With | Blocking Modules | Priority | Status | PRD | SD | Sprint Plan`.

## Modules (ordered)

| # | Module | Wave | Depends On | Can Run In Parallel With | Complexity | Sprint Count |
|---|---|---|---|---|---|---|
| 1 | MOD-001 Platform | A | — | — | XL | 8 |
| 2 | MOD-005 Inventory | B | MOD-001 | MOD-006, MOD-007 | XL | 8 |
| 3 | MOD-006 CRM | B | MOD-001 | MOD-005, MOD-007 | L | 8 |
| 4 | MOD-007 HRMS | B | MOD-001 | MOD-005, MOD-006 | L | 8 |
| 5 | MOD-003 Sales | C | MOD-005, MOD-006 | MOD-004, MOD-015 | XL | 8 |
| 6 | MOD-004 Purchase | C | MOD-005 | MOD-003, MOD-015 | L | 8 |
| 7 | MOD-015 POS | C | MOD-005 | MOD-003, MOD-004 | M | 7 |
| 8 | MOD-002 Accounting | D | MOD-003, MOD-004, MOD-015 | MOD-008 | XL | 8 |
| 9 | MOD-008 Payroll | D | MOD-007, MOD-002 | MOD-002 | L | 8 |
| 10 | MOD-019 Warehouse | E | MOD-005 | MOD-009, MOD-010 | L | 8 |
| 11 | MOD-009 Manufacturing | E | MOD-005 | MOD-019, MOD-010 | XL | 8 |
| 12 | MOD-010 Projects | E | MOD-003, MOD-007 | MOD-019, MOD-009 | L | 7 |
| 13 | MOD-011 AMC | F | MOD-003 | MOD-012, MOD-016 | M | 6 |
| 14 | MOD-012 Field Service | F | MOD-011 | MOD-016 | M | 7 |
| 15 | MOD-016 Service Desk | F | MOD-001 | MOD-011, MOD-012 | M | 3 |
| 16 | MOD-013 Assets | G | MOD-005 | MOD-014 | M | 6 |
| 17 | MOD-014 Fleet | G | MOD-013 | — | M | 6 |
| 18 | MOD-017 Analytics | H | Waves A–G Beta | MOD-018 | L | 3 |
| 19 | MOD-018 AI Workspace | H | MOD-017 | — | L | 3 |

## Completion Criteria (per module)
1. All sprints in `docs/30-sprint-prds/<slug>/` merged and green.
2. Web + Mobile + API surfaces implemented per `docs/60-solution-design/{web,mobile,api}/`.
3. Module Publication updated in `docs/45-module-publications/<slug>/`.
4. Milestone Exit Checklist signed.

## References
- Module PRDs `docs/20-module-prds/*/MODULE_PRD.md`
- Solution Designs `docs/60-solution-design/{web,mobile,api}/`
- Sprint Plans `docs/30-sprint-prds/*/`
- ADR-007
