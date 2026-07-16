---
title: "MOD-013 — Assets — Sprints"
summary: "Sprint PRDs for Assets (MOD-013). Sprint identifiers are prefixed SPR-MOD-013-NNN."
layer: "delivery"
owner: "Operations"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-013"
sprint_prefix: "SPR-MOD-013-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-013 — Assets — Sprints

> **Sprint container for Assets.** Sprint PRDs in this folder implement slices of the [MOD-013 Module PRD](../../20-module-prds/assets/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-013`
- **Module Name:** Assets
- **Module README:** [`../../20-module-prds/assets/README.md`](../../20-module-prds/assets/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-013-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-013-001`, `SPR-MOD-013-002`, …). Identifiers are permanent and never reused.

## Stage 1 Sprint Plan

The Stage 1 Sprint Plan for MOD-013 is authored at [`MOD-013_SPRINT_PLAN.md`](./MOD-013_SPRINT_PLAN.md) under the released GT-002 v1.0 template.

## Sprint Reservations

> Sprint identifiers below are **reservations** produced by the Stage 1 Sprint Plan. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| [SPR-MOD-013-001](./SPR-MOD-013-001-asset-foundation-register-capitalization-and-insurance.md) | Sprint 1 | Asset Foundation (Register, Capitalization & Insurance) | Draft | Frozen `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1` |
| [SPR-MOD-013-002](./SPR-MOD-013-002-depreciation-methods-and-runs.md) | Sprint 2 | Depreciation (Methods & Runs) | Draft | `SPR-MOD-013-001` |
| [SPR-MOD-013-003](./SPR-MOD-013-003-maintenance-transfer-and-disposal.md) | Sprint 3 | Maintenance, Transfer & Disposal | Draft | `SPR-MOD-013-001`, `SPR-MOD-013-002` |
| [SPR-MOD-013-004](./SPR-MOD-013-004-assets-analytics-and-compliance.md) | Sprint 4 | Assets Analytics & Compliance | Draft | `SPR-MOD-013-001`, `SPR-MOD-013-002`, `SPR-MOD-013-003` |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **4**; this plan aligns to **4**.


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
- [`../../20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
