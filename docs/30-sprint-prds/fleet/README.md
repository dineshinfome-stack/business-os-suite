---
title: "MOD-014 — Fleet — Sprints"
summary: "Sprint PRDs for Fleet (MOD-014). Sprint identifiers are prefixed SPR-MOD-014-NNN."
layer: "delivery"
owner: "Operations"
status: "approved"
updated: "2026-07-16"
module_id: "MOD-014"
sprint_prefix: "SPR-MOD-014-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-014 — Fleet — Sprints

> **Sprint container for Fleet.** Sprint PRDs in this folder implement slices of the [MOD-014 Module PRD](../../20-module-prds/fleet/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-014`
- **Module Name:** Fleet
- **Module README:** [`../../20-module-prds/fleet/README.md`](../../20-module-prds/fleet/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-014-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-014-001`, `SPR-MOD-014-002`, …). Identifiers are permanent and never reused.

## Stage 1 Sprint Plan

The Stage 1 Sprint Plan for MOD-014 Fleet is authored at [`MOD-014_SPRINT_PLAN.md`](./MOD-014_SPRINT_PLAN.md). It is the authoritative source for sprint reservations, capability allocation, and exit criteria for this module.

## Sprint Reservations

> Each row is a reservation from the Stage 1 Sprint Plan. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| SPR-MOD-014-001 | Sprint 1 | Fleet Foundation (Vehicles, Drivers, Compliance & Insurance) | Reserved | MOD-001, MOD-002 baselines |
| SPR-MOD-014-002 | Sprint 2 | Trip Planning & Execution | Reserved | SPR-MOD-014-001 |
| SPR-MOD-014-003 | Sprint 3 | Fuel & Maintenance | Reserved | SPR-MOD-014-001, SPR-MOD-014-002 |
| SPR-MOD-014-004 | Sprint 4 | Fleet Analytics & Compliance | Reserved | SPR-MOD-014-001, SPR-MOD-014-002, SPR-MOD-014-003 |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **4**; this reservation set aligns to **4**.

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
- [`../../20-module-prds/fleet/MODULE_PRD.md`](../../20-module-prds/fleet/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
