---
document: IMP Module Sequence Matrix
version: 1.0.0
owner: Program Delivery
---

# Module Sequence Matrix

| Order | Module | Wave | Depends On | Can Run In Parallel With | Blocking Modules | Priority | Status | PRD | SD (Web/Mobile/API) | Sprint Plan |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | MOD-001 Platform | A | — | — | ALL | P0 | In Progress | `docs/20-module-prds/platform/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*001*` | `docs/30-sprint-prds/platform/` |
| 2 | MOD-005 Inventory | B | MOD-001 | MOD-006, MOD-007 | MOD-003, MOD-004, MOD-015, MOD-019, MOD-009, MOD-013 | P1 | Not Started | `docs/20-module-prds/inventory/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*005*` | `docs/30-sprint-prds/inventory/` |
| 3 | MOD-006 CRM | B | MOD-001 | MOD-005, MOD-007 | MOD-003 | P1 | Not Started | `docs/20-module-prds/crm/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*006*` | `docs/30-sprint-prds/crm/` |
| 4 | MOD-007 HRMS | B | MOD-001 | MOD-005, MOD-006 | MOD-008, MOD-010 | P1 | Not Started | `docs/20-module-prds/hrms/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*007*` | `docs/30-sprint-prds/hrms/` |
| 5 | MOD-003 Sales | C | MOD-005, MOD-006 | MOD-004, MOD-015 | MOD-002, MOD-010, MOD-011 | P1 | Not Started | `docs/20-module-prds/sales/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*003*` | `docs/30-sprint-prds/sales/` |
| 6 | MOD-004 Purchase | C | MOD-005 | MOD-003, MOD-015 | MOD-002 | P1 | Not Started | `docs/20-module-prds/purchase/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*004*` | `docs/30-sprint-prds/purchase/` |
| 7 | MOD-015 POS | C | MOD-005 | MOD-003, MOD-004 | MOD-002 | P2 | Not Started | `docs/20-module-prds/pos/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*015*` | `docs/30-sprint-prds/pos/` |
| 8 | MOD-002 Accounting | D | MOD-003, MOD-004, MOD-015 | MOD-008 | MOD-008, MOD-017 | P1 | Not Started | `docs/20-module-prds/accounting/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*002*` | `docs/30-sprint-prds/accounting/` |
| 9 | MOD-008 Payroll | D | MOD-007, MOD-002 | MOD-002 | — | P2 | Not Started | `docs/20-module-prds/payroll/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*008*` | `docs/30-sprint-prds/payroll/` |
| 10 | MOD-019 Warehouse | E | MOD-005 | MOD-009, MOD-010 | — | P2 | Not Started | `docs/20-module-prds/warehouse/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*019*` | `docs/30-sprint-prds/warehouse/` |
| 11 | MOD-009 Manufacturing | E | MOD-005 | MOD-019, MOD-010 | — | P2 | Not Started | `docs/20-module-prds/manufacturing/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*009*` | `docs/30-sprint-prds/manufacturing/` |
| 12 | MOD-010 Projects | E | MOD-003, MOD-007 | MOD-019, MOD-009 | — | P2 | Not Started | `docs/20-module-prds/projects/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*010*` | `docs/30-sprint-prds/projects/` |
| 13 | MOD-011 AMC | F | MOD-003 | MOD-012, MOD-016 | MOD-012 | P3 | Not Started | `docs/20-module-prds/amc/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*011*` | `docs/30-sprint-prds/amc/` |
| 14 | MOD-012 Field Service | F | MOD-011 | MOD-016 | — | P3 | Not Started | `docs/20-module-prds/field-service/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*012*` | `docs/30-sprint-prds/field-service/` |
| 15 | MOD-016 Service Desk | F | MOD-001 | MOD-011, MOD-012 | — | P3 | Not Started | `docs/20-module-prds/service-desk/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*016*` | `docs/30-sprint-prds/service-desk/` |
| 16 | MOD-013 Assets | G | MOD-005 | MOD-014 | MOD-014 | P3 | Not Started | `docs/20-module-prds/assets/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*013*` | `docs/30-sprint-prds/assets/` |
| 17 | MOD-014 Fleet | G | MOD-013 | — | — | P3 | Not Started | `docs/20-module-prds/fleet/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*014*` | `docs/30-sprint-prds/fleet/` |
| 18 | MOD-017 Analytics | H | Waves A–G Beta | MOD-018 | MOD-018 | P3 | Not Started | `docs/20-module-prds/analytics/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*017*` | `docs/30-sprint-prds/analytics/` |
| 19 | MOD-018 AI Workspace | H | MOD-017 | — | — | P4 | Not Started | `docs/20-module-prds/ai/MODULE_PRD.md` | `docs/60-solution-design/{web,mobile,api}/*018*` | `docs/30-sprint-prds/ai/` |
