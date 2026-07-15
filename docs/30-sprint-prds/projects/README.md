---
title: "MOD-010 — Projects — Sprints"
summary: "Sprint PRDs for Projects (MOD-010). Sprint identifiers are prefixed SPR-MOD-010-NNN."
layer: "delivery"
owner: "Delivery"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-010"
sprint_prefix: "SPR-MOD-010-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-010 — Projects — Sprints

> **Sprint container for Projects.** Sprint PRDs in this folder implement slices of the [MOD-010 Module PRD](../../20-module-prds/projects/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-010`
- **Module Name:** Projects
- **Module README:** [`../../20-module-prds/projects/README.md`](../../20-module-prds/projects/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-010-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-010-001`, `SPR-MOD-010-002`, …). Identifiers are permanent and never reused.

## Stage 1 Sprint Plan

The authoritative sprint sequence for MOD-010 is defined in the Stage 1 Sprint Plan: [`MOD-010_SPRINT_PLAN.md`](./MOD-010_SPRINT_PLAN.md).

## Reserved Sprint Identifiers

> Sprint identifiers below are **reservations** from the approved Stage 1 Sprint Plan. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| SPR-MOD-010-001 | Sprint 1 | Projects Foundation (Project & Resource Setup) | Draft (authored: [`SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md`](./SPR-MOD-010-001-projects-foundation-project-and-resource-setup.md)) | — |
| SPR-MOD-010-002 | Sprint 2 | Tasks, Milestones & Change Requests | Draft (authored: [`SPR-MOD-010-002-tasks-milestones-and-change-requests.md`](./SPR-MOD-010-002-tasks-milestones-and-change-requests.md)) | SPR-MOD-010-001 |
| SPR-MOD-010-003 | Sprint 3 | Timesheets & Effort | Draft (authored: [`SPR-MOD-010-003-timesheets-and-effort.md`](./SPR-MOD-010-003-timesheets-and-effort.md)) | SPR-MOD-010-001 |
| SPR-MOD-010-004 | Sprint 4 | Budgets, Costs & Project Billing | Draft (authored: [`SPR-MOD-010-004-budgets-costs-and-project-billing.md`](./SPR-MOD-010-004-budgets-costs-and-project-billing.md)) | SPR-MOD-010-002, SPR-MOD-010-003 |
| SPR-MOD-010-005 | Sprint 5 | Projects Analytics & Compliance | Draft (authored: [`SPR-MOD-010-005-projects-analytics-and-compliance.md`](./SPR-MOD-010-005-projects-analytics-and-compliance.md)) | SPR-MOD-010-001 … 004 |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **5**. Goals above are the Stage 1 planning baseline; refinements permitted during Stage 2 MUST update `MOD-010_SPRINT_PLAN.md` first.

## Authoring Rules

- Follow [`docs/SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md) — including the Sprint Traceability Rule and the Sprint Completion Rule.
- Size sprints against [`docs/SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md).
- Sequence sprints per [`docs/SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).
- Use [`docs/99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md).
- Do not add business requirements that are not first captured in the parent Module PRD.
- Reference upstream layers by stable identifier (`ENG-NNN`, `ADR-NNN`, `MOD-NNN`).

## References

- [`../README.md`](../README.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../20-module-prds/projects/MODULE_PRD.md`](../../20-module-prds/projects/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
