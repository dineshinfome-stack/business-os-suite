---
title: "MOD-007 — HRMS — Sprints"
summary: "Sprint PRDs for HRMS (MOD-007). Sprint identifiers are prefixed SPR-MOD-007-NNN."
layer: "delivery"
owner: "People"
status: "approved"
updated: "2026-07-13"
module_id: "MOD-007"
sprint_prefix: "SPR-MOD-007-"
sprint_plan: "MOD-007_SPRINT_PLAN.md"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-007 — HRMS — Sprints

> **Sprint container for HRMS.** Sprint PRDs in this folder implement slices of the [MOD-007 Module PRD](../../20-module-prds/hrms/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-007`
- **Module Name:** HRMS
- **Module README:** [`../../20-module-prds/hrms/README.md`](../../20-module-prds/hrms/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-007-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-007-001`, `SPR-MOD-007-002`, …). Identifiers are permanent and never reused.

## Sprint Reservations

> Reservations below correspond to the approved [MOD-007 Sprint Plan (Stage 1)](./MOD-007_SPRINT_PLAN.md). Each row is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| [SPR-MOD-007-001](./SPR-MOD-007-001-hrms-foundation-employee-master.md) | Sprint 1 | HRMS Foundation & Employee Master | Draft | `MOD001_PLATFORM_BASELINE_v1` |
| [SPR-MOD-007-002](./SPR-MOD-007-002-employment-lifecycle-hire-and-exit.md) | Sprint 2 | Employment Lifecycle (Hire & Exit) | Draft | SPR-MOD-007-001 |
| [SPR-MOD-007-003](./SPR-MOD-007-003-attendance-and-leave.md) | Sprint 3 | Attendance & Leave | Draft | SPR-MOD-007-001 |
| [SPR-MOD-007-004](./SPR-MOD-007-004-performance-and-appraisal.md) | Sprint 4 | Performance & Appraisal | Draft | SPR-MOD-007-001 |
| [SPR-MOD-007-005](./SPR-MOD-007-005-learning-development-and-self-service.md) | Sprint 5 | Learning & Development and Self-Service | Draft | SPR-MOD-007-001, SPR-MOD-007-003 |
| SPR-MOD-007-006 | Sprint 6 | HR Analytics & Compliance | Reserved | SPR-MOD-007-001 … SPR-MOD-007-005 |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is reconciled to **6** by the MOD-007 Sprint Plan (up from the prior `5`).

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
- [`../../20-module-prds/hrms/MODULE_PRD.md`](../../20-module-prds/hrms/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
