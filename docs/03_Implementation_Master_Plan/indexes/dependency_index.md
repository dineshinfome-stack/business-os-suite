---
document: IMP Dependency Index
version: 1.0.0
owner: Architecture
---

# Dependency Index

## Module → Dependencies

| Module | Depends On | Blocks |
|---|---|---|
| MOD-001 Platform | — | ALL |
| MOD-005 Inventory | MOD-001 | MOD-003, MOD-004, MOD-015, MOD-019, MOD-009, MOD-013 |
| MOD-006 CRM | MOD-001 | MOD-003 |
| MOD-007 HRMS | MOD-001 | MOD-008, MOD-010 |
| MOD-003 Sales | MOD-005, MOD-006 | MOD-002, MOD-010, MOD-011 |
| MOD-004 Purchase | MOD-005 | MOD-002 |
| MOD-015 POS | MOD-005 | MOD-002 |
| MOD-002 Accounting | MOD-003, MOD-004, MOD-015 | MOD-008, MOD-017 |
| MOD-008 Payroll | MOD-007, MOD-002 | — |
| MOD-019 Warehouse | MOD-005 | — |
| MOD-009 Manufacturing | MOD-005 | — |
| MOD-010 Projects | MOD-003, MOD-007 | — |
| MOD-011 AMC | MOD-003 | MOD-012 |
| MOD-012 Field Service | MOD-011 | — |
| MOD-016 Service Desk | MOD-001 | — |
| MOD-013 Assets | MOD-005 | MOD-014 |
| MOD-014 Fleet | MOD-013 | — |
| MOD-017 Analytics | Waves A–G at Beta | MOD-018 |
| MOD-018 AI Workspace | MOD-017 | — |

## Critical Path
`MOD-001 → MOD-005 → MOD-003 → MOD-002 → MOD-017 → MOD-018`

## References
- `docs/03_Implementation_Master_Plan/04_Dependency_Architecture.md`
- ADR-007
