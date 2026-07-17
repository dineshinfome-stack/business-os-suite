---
title: "MOD-015 — POS — Sprints"
summary: "Sprint PRDs for POS (MOD-015). Sprint identifiers are prefixed SPR-MOD-015-NNN."
layer: "delivery"
owner: "Revenue"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-015"
sprint_prefix: "SPR-MOD-015-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-015 — POS — Sprints

> **Sprint container for POS.** Sprint PRDs in this folder implement slices of the [MOD-015 Module PRD](../../20-module-prds/pos/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-015`
- **Module Name:** POS
- **Module README:** [`../../20-module-prds/pos/README.md`](../../20-module-prds/pos/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-015-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-015-001`, `SPR-MOD-015-002`, …). Identifiers are permanent and never reused.

## Stage 1 Sprint Plan

The authoritative Stage 1 Sprint Plan for this module is [`MOD-015_SPRINT_PLAN.md`](./MOD-015_SPRINT_PLAN.md). Rows below are reservations aligned to that plan; a Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| SPR-MOD-015-001 | Sprint 1 | [POS Foundation (Stores, Counters & Configuration)](./SPR-MOD-015-001-pos-foundation-stores-counters-and-configuration.md) | Draft | — |
| SPR-MOD-015-002 | Sprint 2 | Cart, Pricing, Discounts & Offline Sale | Reserved | SPR-MOD-015-001 |
| SPR-MOD-015-003 | Sprint 3 | Multi-Tender Payments & Receipts | Reserved | SPR-MOD-015-001, SPR-MOD-015-002 |
| SPR-MOD-015-004 | Sprint 4 | Offers, Loyalty & Returns | Reserved | SPR-MOD-015-001..003 |
| SPR-MOD-015-005 | Sprint 5 | Day Close, Analytics & Compliance | Reserved | SPR-MOD-015-001..004 |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **5**. Row counts and goals here are initial planning estimates and will be refined when each Sprint PRD is authored in the corresponding Pass 8.x phase.

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
- [`../../20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
