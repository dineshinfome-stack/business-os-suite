---
document: IMP Chapter 19 — Resource Planning
version: 1.0.0
owner: Engineering Management
approval_status: Draft
---

# 19 — Resource Planning

## Suggested Engineering Teams (Workstreams)

| Workstream | Primary Modules | Scope |
|---|---|---|
| Platform | MOD-001 | Shared services, infra, auth, RBAC |
| Master Data | MOD-005, MOD-006, MOD-007 | Item/Customer/Employee masters |
| Commercial | MOD-003, MOD-004, MOD-015 | Sales, Purchase, POS |
| Finance | MOD-002, MOD-008 | Accounting, Payroll |
| Operations | MOD-019, MOD-009, MOD-010 | Warehouse, MFG, Projects |
| Service | MOD-011, MOD-012, MOD-016 | AMC, FS, Service Desk |
| Assets & Fleet | MOD-013, MOD-014 | Asset lifecycle, fleet ops |
| Intelligence | MOD-017, MOD-018 | Analytics, AI Workspace |

## Parallel Execution Map

| Wave | Concurrent Workstreams |
|---|---|
| A | Platform (solo) |
| B | Master Data (Inventory ∥ CRM ∥ HRMS) |
| C | Sales ∥ Purchase ∥ POS |
| D | Accounting ∥ Payroll (Payroll starts after HRMS Beta) |
| E | Warehouse ∥ Manufacturing ∥ Projects |
| F | AMC → Field Service ∥ Service Desk |
| G | Assets → Fleet |
| H | Analytics → AI Workspace |

## Ownership
Each workstream has: an Engineering Lead, a Product Owner, a QA Lead, a Docs Reviewer.

## Review Responsibilities
- Architecture Board — ADR reviews and boundary drift.
- Program Delivery — backlog and wave gates.
- QA Lead — Milestone Exit Checklist sign-off.

## References
- EEMP Ch. 18 Project Governance
- Ch. 07 Module Implementation Sequence
