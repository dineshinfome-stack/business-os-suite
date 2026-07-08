---
title: "MOD-003 — Sales — Sprints"
summary: "Sprint PRDs for Sales (MOD-003). Sprint identifiers are prefixed SPR-MOD-003-NNN."
layer: "delivery"
owner: "Revenue"
status: "approved"
updated: "2026-07-07"
module_id: "MOD-003"
sprint_prefix: "SPR-MOD-003-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-003 — Sales — Sprints

> **Sprint container for Sales.** Sprint PRDs in this folder implement slices of the [MOD-003 Module PRD](../../20-module-prds/sales/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-003`
- **Module Name:** Sales
- **Module README:** [`../../20-module-prds/sales/README.md`](../../20-module-prds/sales/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md)

## Stage 1 — Sprint Planning

The Stage 1 Sprint Plan for MOD-003 Sales is [`MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md). It reserves six Sprint identifiers and defines the sequence, engine/ADR consumption, dependencies, and exit criteria that will govern Stage 2 authoring. Stage 2 authoring is under way with [`SPR-MOD-003-001`](./SPR-MOD-003-001-sales-foundation.md) (Sales Foundation, Draft), [`SPR-MOD-003-002`](./SPR-MOD-003-002-quotations-sales-orders.md) (Quotations & Sales Orders, Draft), and [`SPR-MOD-003-003`](./SPR-MOD-003-003-delivery-fulfillment.md) (Delivery & Fulfillment, Draft).

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-003-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-003-001`, `SPR-MOD-003-002`, …). Identifiers are permanent and never reused.

## Planning Placeholders

> Each row represents a planned sprint placeholder for roadmap purposes only. The existence of a row does not constitute creation or approval of a Sprint PRD. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| [SPR-MOD-003-001](./SPR-MOD-003-001-sales-foundation.md) | Sprint 1 | Sales Foundation | Draft | `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1` |
| [SPR-MOD-003-002](./SPR-MOD-003-002-quotations-sales-orders.md) | Sprint 2 | Quotations & Sales Orders | Draft | `SPR-MOD-003-001` |
| SPR-MOD-003-003 | Sprint 3 | Delivery & Fulfillment | Planned | `SPR-MOD-003-002` |
| SPR-MOD-003-004 | Sprint 4 | Sales Invoicing | Planned | `SPR-MOD-003-003` |
| SPR-MOD-003-005 | Sprint 5 | Returns & Customer Adjustments | Planned | `SPR-MOD-003-002`, `SPR-MOD-003-004` |
| SPR-MOD-003-006 | Sprint 6 | Sales Analytics & Controls | Planned | `SPR-MOD-003-001` … `SPR-MOD-003-005` |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **6**. Row counts and goals here are initial planning estimates and will be refined when each Sprint PRD is authored in the corresponding Pass 8.x phase.

## Authoring Rules

- Follow [`docs/SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md) — including the Sprint Traceability Rule and the Sprint Completion Rule.
- Size sprints against [`docs/SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md).
- Sequence sprints per [`docs/SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).
- Use [`docs/99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md).
- Do not add business requirements that are not first captured in the parent Module PRD.
- Reference upstream layers by stable identifier (`ENG-NNN`, `ADR-NNN`, `MOD-NNN`).
- All accounting behavior is consumed through `MOD002_ACCOUNTING_BASELINE_v1`; Sales owns commercial document lifecycle, Accounting owns accounting lifecycle.

## References

- [`../README.md`](../README.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../20-module-prds/sales/MODULE_PRD.md`](../../20-module-prds/sales/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- [`./MOD-003_SPRINT_PLAN.md`](./MOD-003_SPRINT_PLAN.md)
