---
title: "MOD-016 — Service Desk — Sprints"
summary: "Sprint PRDs for Service Desk (MOD-016). Sprint identifiers are prefixed SPR-MOD-016-NNN."
layer: "delivery"
owner: "Service"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-016"
sprint_prefix: "SPR-MOD-016-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-016 — Service Desk — Sprints

> **Sprint container for Service Desk.** Sprint PRDs in this folder implement slices of the [MOD-016 Module PRD](../../20-module-prds/service-desk/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-016`
- **Module Name:** Service Desk
- **Module README:** [`../../20-module-prds/service-desk/README.md`](../../20-module-prds/service-desk/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/service-desk/MODULE_PRD.md`](../../20-module-prds/service-desk/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-016-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-016-001`, `SPR-MOD-016-002`, …). Identifiers are permanent and never reused.

## Planning Placeholders

> Each row represents a planned sprint placeholder for roadmap purposes only. The existence of a row does not constitute creation or approval of a Sprint PRD. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| SPR-MOD-016-001 | Sprint 1 | _(to be defined in Pass 8.x — parent MOD-016)_ | Planned | _(to be defined)_ |
| SPR-MOD-016-002 | Sprint 2 | _(to be defined in Pass 8.x — parent MOD-016)_ | Planned | _(to be defined)_ |
| SPR-MOD-016-003 | Sprint 3 | _(to be defined in Pass 8.x — parent MOD-016)_ | Planned | _(to be defined)_ |
| SPR-MOD-016-004 | Sprint 4 | _(to be defined in Pass 8.x — parent MOD-016)_ | Planned | _(to be defined)_ |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **4**. Row counts and goals here are initial planning estimates and will be refined when each Sprint PRD is authored in the corresponding Pass 8.x phase.

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
- [`../../20-module-prds/service-desk/MODULE_PRD.md`](../../20-module-prds/service-desk/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
