---
title: "MOD-017 — Analytics — Sprints"
summary: "Sprint PRDs for Analytics (MOD-017). Sprint identifiers are prefixed SPR-MOD-017-NNN."
layer: "delivery"
owner: "Insights"
status: "approved"
updated: "2026-07-17"
module_id: "MOD-017"
sprint_prefix: "SPR-MOD-017-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-017 — Analytics — Sprints

> **Sprint container for Analytics.** Sprint PRDs in this folder implement slices of the [MOD-017 Module PRD](../../20-module-prds/analytics/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-017`
- **Module Name:** Analytics
- **Module README:** [`../../20-module-prds/analytics/README.md`](../../20-module-prds/analytics/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-017-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-017-001`, `SPR-MOD-017-002`, …). Identifiers are permanent and never reused.

## Sprint Plan (Stage 1)

Approved Stage 1 planning artifact: [`MOD-017_SPRINT_PLAN.md`](./MOD-017_SPRINT_PLAN.md). It defines sprint boundaries, dependencies, capability allocation, and engine/ADR consumption for MOD-017.

## Sprint Roster

> Each row reserves a Sprint identifier per the approved Sprint Plan. A Sprint ID becomes active Sprint PRD documentation only when a corresponding file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| SPR-MOD-017-001 | Sprint 1 | Analytics Foundation & Data Marts | Reserved | — |
| SPR-MOD-017-002 | Sprint 2 | KPI Framework & Metric Catalog | Reserved | SPR-MOD-017-001 |
| SPR-MOD-017-003 | Sprint 3 | Dashboards & Visualization | Reserved | SPR-MOD-017-001, SPR-MOD-017-002 |
| SPR-MOD-017-004 | Sprint 4 | Scheduled Distribution, Reporting & Export | Reserved | SPR-MOD-017-001..003 |
| SPR-MOD-017-005 | Sprint 5 | Analytical Models, Cross-Module Analytics & Compliance | Reserved | SPR-MOD-017-001..004 |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **5**, matching the approved Sprint Plan.

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
- [`../../20-module-prds/analytics/MODULE_PRD.md`](../../20-module-prds/analytics/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
