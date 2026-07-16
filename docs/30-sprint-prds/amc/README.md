---
title: "MOD-011 — AMC — Sprints"
summary: "Sprint PRDs for AMC (MOD-011). Sprint identifiers are prefixed SPR-MOD-011-NNN."
layer: "delivery"
owner: "Service"
status: "approved"
updated: "2026-07-16"
module_id: "MOD-011"
sprint_prefix: "SPR-MOD-011-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-011 — AMC — Sprints

> **Sprint container for AMC.** Sprint PRDs in this folder implement slices of the [MOD-011 Module PRD](../../20-module-prds/amc/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-011`
- **Module Name:** AMC
- **Module README:** [`../../20-module-prds/amc/README.md`](../../20-module-prds/amc/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-011-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-011-001`, `SPR-MOD-011-002`, …). Identifiers are permanent and never reused.

## Stage 1 Sprint Plan

The authoritative sprint sequence for MOD-011 is defined in the Stage 1 Sprint Plan: [`MOD-011_SPRINT_PLAN.md`](./MOD-011_SPRINT_PLAN.md).

## Reserved Sprint Identifiers

> Sprint identifiers below are **reservations** from the approved Stage 1 Sprint Plan. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| SPR-MOD-011-001 | Sprint 1 | AMC Foundation (Contracts & Entitlements) | Reserved | — |
| SPR-MOD-011-002 | Sprint 2 | Preventive Visit Scheduling | Reserved | SPR-MOD-011-001 |
| SPR-MOD-011-003 | Sprint 3 | Contract Billing & Renewals | Reserved | SPR-MOD-011-001 |
| SPR-MOD-011-004 | Sprint 4 | AMC Analytics & Compliance | Reserved | SPR-MOD-011-001 … 003 |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **4**. Goals above are the Stage 1 planning baseline; refinements permitted during Stage 2 MUST update `MOD-011_SPRINT_PLAN.md` first.

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
- [`../../20-module-prds/amc/MODULE_PRD.md`](../../20-module-prds/amc/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
