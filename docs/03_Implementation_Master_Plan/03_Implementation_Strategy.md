---
document: IMP Chapter 03 — Implementation Strategy
version: 1.0.0
owner: Program Delivery
approval_status: Draft
---

# 03 — Implementation Strategy

## Principles (from IMP charter)
1. **Platform First** — MOD-001 and shared services before any business module.
2. **Dependency First** — a module ships only after every module it depends on is at least Alpha.
3. **Shared Services Before Business Modules** — Auth, Org, RBAC, Audit, Notifications, Settings, Search, Documents, Workflow, Reporting.
4. **Vertical Slice Delivery** — each sprint produces UI + API + DB + tests for a coherent user story.
5. **Testable Increment Delivery** — every increment satisfies EEMP Ch. 15 gates.
6. **API First** — endpoints stable before mobile depends on them.
7. **Mobile Follows Stable APIs** — mobile waves begin only after API-<n> reaches Beta.
8. **AI After Core Workflows** — MOD-018 rollout waits for stable workflow surface.
9. **References Over Restatement** — the IMP never restates PRD/SD/EEMP content.

## Master-Data-First Sequencing (Waves A → H)
| Wave | Theme | Modules |
|---|---|---|
| A | Platform Foundation | MOD-001 |
| B | Master Data | MOD-005, MOD-006, MOD-007 |
| C | Commercial | MOD-003, MOD-004, MOD-015 |
| D | Finance | MOD-002, MOD-008 |
| E | Operations | MOD-019, MOD-009, MOD-010 |
| F | Service | MOD-011, MOD-012, MOD-016 |
| G | Assets & Fleet | MOD-013, MOD-014 |
| H | Intelligence | MOD-017, MOD-018 |

## Risk Reduction Approach
- Freeze Domain Model before each phase (per EEMP Ch. 09).
- Ship Platform Foundation to Beta before any business wave begins.
- Enforce Milestone Exit Checklist (`indexes/milestone_exit_checklist.md`) between waves.

## References
- EEMP Ch. 09 Module Development Framework
- EEMP Ch. 11 Sprint Execution
- ADR-007 Core ERP Module Boundaries
