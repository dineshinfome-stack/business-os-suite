---
title: "MOD-012 — Field Service — Sprints"
summary: "Sprint PRDs for Field Service (MOD-012). Sprint identifiers are prefixed SPR-MOD-012-NNN."
layer: "delivery"
owner: "Service"
status: "approved"
updated: "2026-07-16"
module_id: "MOD-012"
sprint_prefix: "SPR-MOD-012-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-012 — Field Service — Sprints

> **Sprint container for Field Service.** Sprint PRDs in this folder implement slices of the [MOD-012 Module PRD](../../20-module-prds/field-service/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-012`
- **Module Name:** Field Service
- **Module README:** [`../../20-module-prds/field-service/README.md`](../../20-module-prds/field-service/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-012-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-012-001`, `SPR-MOD-012-002`, …). Identifiers are permanent and never reused.

## Stage 1 Sprint Plan

The authoritative Stage 1 planning artifact for MOD-012 Field Service is [`MOD-012_SPRINT_PLAN.md`](./MOD-012_SPRINT_PLAN.md). It defines the sprint sequence, engine/ADR consumption, cross-module boundaries, and exit criteria that govern Stage 2 Sprint PRD authoring.

## Sprint Sequence (Reserved)

> Each row is a **planning reservation** authored by the Stage 1 Sprint Plan. Rows become active Sprint PRDs only when the corresponding file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| SPR-MOD-012-001 | Sprint 1 | Field Service Foundation (Tickets & Field Workforce) | Reserved | Frozen `MOD001_PLATFORM_BASELINE_v1`, `MOD005_INVENTORY_BASELINE_v1`, `MOD011_AMC_BASELINE_v1` |
| SPR-MOD-012-002 | Sprint 2 | Dispatch & Scheduling | Reserved | SPR-MOD-012-001 |
| SPR-MOD-012-003 | Sprint 3 | Mobile Visit Execution (Spares, Signatures, Closure) | Reserved | SPR-MOD-012-002 |
| SPR-MOD-012-004 | Sprint 4 | SLA & Escalation | Reserved | SPR-MOD-012-001, SPR-MOD-012-003 |
| SPR-MOD-012-005 | Sprint 5 | Field Service Analytics & Compliance | Reserved | SPR-MOD-012-001 … SPR-MOD-012-004 |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **5**; the Sprint Plan aligns to **5**.

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
- [`../../20-module-prds/field-service/MODULE_PRD.md`](../../20-module-prds/field-service/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
