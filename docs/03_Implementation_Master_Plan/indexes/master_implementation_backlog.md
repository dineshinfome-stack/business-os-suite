---
document: IMP Master Implementation Backlog
version: 1.0.0
owner: Program Delivery
---

# Master Implementation Backlog

Consolidated operational backlog. Rows reference existing sprint files under `docs/30-sprint-prds/`. Creates **no new work**.

Legend — Priority: P0 highest → P4. Status: `Not Started | In Progress | In Review | Done | Blocked`. Acceptance Gate: `indexes/milestone_exit_checklist.md`.

| Module | Wave | Sprint | Priority | Dependencies | Status | PRD | Solution Design (root) | Sprint Plan | Acceptance Gate |
|---|---|---|---|---|---|---|---|---|---|
| MOD-001 Platform | A | (see `docs/30-sprint-prds/platform/` — 8 sprints) | P0 | — | In Progress | `docs/20-module-prds/platform/MODULE_PRD.md` | `docs/60-solution-design/*/*001*` | `docs/30-sprint-prds/platform/` | Milestone Exit Checklist |
| MOD-005 Inventory | B | (8 sprints under `docs/30-sprint-prds/inventory/`) | P1 | MOD-001 | Not Started | `docs/20-module-prds/inventory/MODULE_PRD.md` | `docs/60-solution-design/*/*005*` | `docs/30-sprint-prds/inventory/` | Milestone Exit Checklist |
| MOD-006 CRM | B | (8 sprints under `docs/30-sprint-prds/crm/`) | P1 | MOD-001 | Not Started | `docs/20-module-prds/crm/MODULE_PRD.md` | `docs/60-solution-design/*/*006*` | `docs/30-sprint-prds/crm/` | Milestone Exit Checklist |
| MOD-007 HRMS | B | (8 sprints under `docs/30-sprint-prds/hrms/`) | P1 | MOD-001 | Not Started | `docs/20-module-prds/hrms/MODULE_PRD.md` | `docs/60-solution-design/*/*007*` | `docs/30-sprint-prds/hrms/` | Milestone Exit Checklist |
| MOD-003 Sales | C | (8 sprints under `docs/30-sprint-prds/sales/`) | P1 | MOD-005, MOD-006 | Not Started | `docs/20-module-prds/sales/MODULE_PRD.md` | `docs/60-solution-design/*/*003*` | `docs/30-sprint-prds/sales/` | Milestone Exit Checklist |
| MOD-004 Purchase | C | (8 sprints under `docs/30-sprint-prds/purchase/`) | P1 | MOD-005 | Not Started | `docs/20-module-prds/purchase/MODULE_PRD.md` | `docs/60-solution-design/*/*004*` | `docs/30-sprint-prds/purchase/` | Milestone Exit Checklist |
| MOD-015 POS | C | (7 sprints under `docs/30-sprint-prds/pos/`) | P2 | MOD-005 | Not Started | `docs/20-module-prds/pos/MODULE_PRD.md` | `docs/60-solution-design/*/*015*` | `docs/30-sprint-prds/pos/` | Milestone Exit Checklist |
| MOD-002 Accounting | D | (8 sprints under `docs/30-sprint-prds/accounting/`) | P1 | MOD-003, MOD-004, MOD-015 | Not Started | `docs/20-module-prds/accounting/MODULE_PRD.md` | `docs/60-solution-design/*/*002*` | `docs/30-sprint-prds/accounting/` | Milestone Exit Checklist |
| MOD-008 Payroll | D | (8 sprints under `docs/30-sprint-prds/payroll/`) | P2 | MOD-007, MOD-002 | Not Started | `docs/20-module-prds/payroll/MODULE_PRD.md` | `docs/60-solution-design/*/*008*` | `docs/30-sprint-prds/payroll/` | Milestone Exit Checklist |
| MOD-019 Warehouse | E | (8 sprints under `docs/30-sprint-prds/warehouse/`) | P2 | MOD-005 | Not Started | `docs/20-module-prds/warehouse/MODULE_PRD.md` | `docs/60-solution-design/*/*019*` | `docs/30-sprint-prds/warehouse/` | Milestone Exit Checklist |
| MOD-009 Manufacturing | E | (8 sprints under `docs/30-sprint-prds/manufacturing/`) | P2 | MOD-005 | Not Started | `docs/20-module-prds/manufacturing/MODULE_PRD.md` | `docs/60-solution-design/*/*009*` | `docs/30-sprint-prds/manufacturing/` | Milestone Exit Checklist |
| MOD-010 Projects | E | (7 sprints under `docs/30-sprint-prds/projects/`) | P2 | MOD-003, MOD-007 | Not Started | `docs/20-module-prds/projects/MODULE_PRD.md` | `docs/60-solution-design/*/*010*` | `docs/30-sprint-prds/projects/` | Milestone Exit Checklist |
| MOD-011 AMC | F | (6 sprints under `docs/30-sprint-prds/amc/`) | P3 | MOD-003 | Not Started | `docs/20-module-prds/amc/MODULE_PRD.md` | `docs/60-solution-design/*/*011*` | `docs/30-sprint-prds/amc/` | Milestone Exit Checklist |
| MOD-012 Field Service | F | (7 sprints under `docs/30-sprint-prds/field-service/`) | P3 | MOD-011 | Not Started | `docs/20-module-prds/field-service/MODULE_PRD.md` | `docs/60-solution-design/*/*012*` | `docs/30-sprint-prds/field-service/` | Milestone Exit Checklist |
| MOD-016 Service Desk | F | (3 sprints under `docs/30-sprint-prds/service-desk/`) | P3 | MOD-001 | Not Started | `docs/20-module-prds/service-desk/MODULE_PRD.md` | `docs/60-solution-design/*/*016*` | `docs/30-sprint-prds/service-desk/` | Milestone Exit Checklist |
| MOD-013 Assets | G | (6 sprints under `docs/30-sprint-prds/assets/`) | P3 | MOD-005 | Not Started | `docs/20-module-prds/assets/MODULE_PRD.md` | `docs/60-solution-design/*/*013*` | `docs/30-sprint-prds/assets/` | Milestone Exit Checklist |
| MOD-014 Fleet | G | (6 sprints under `docs/30-sprint-prds/fleet/`) | P3 | MOD-013 | Not Started | `docs/20-module-prds/fleet/MODULE_PRD.md` | `docs/60-solution-design/*/*014*` | `docs/30-sprint-prds/fleet/` | Milestone Exit Checklist |
| MOD-017 Analytics | H | (3 sprints under `docs/30-sprint-prds/analytics/`) | P3 | Waves A–G Beta | Not Started | `docs/20-module-prds/analytics/MODULE_PRD.md` | `docs/60-solution-design/*/*017*` | `docs/30-sprint-prds/analytics/` | Milestone Exit Checklist |
| MOD-018 AI Workspace | H | (3 sprints under `docs/30-sprint-prds/ai/`) | P4 | MOD-017 | Not Started | `docs/20-module-prds/ai/MODULE_PRD.md` | `docs/60-solution-design/*/*018*` | `docs/30-sprint-prds/ai/` | Milestone Exit Checklist |

**Totals**: 19 modules · 102 sprint specs (see `SPR-*.md` counts in each sprint folder).
