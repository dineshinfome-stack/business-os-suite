---
title: "MOD-004 — Purchase — Sprints"
summary: "Sprint PRDs for Purchase (MOD-004). Sprint identifiers are prefixed SPR-MOD-004-NNN."
layer: "delivery"
owner: "Procurement"
status: "approved"
updated: "2026-07-10"
module_id: "MOD-004"
sprint_prefix: "SPR-MOD-004-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-004 — Purchase — Sprints

> **Sprint container for Purchase.** Sprint PRDs in this folder implement slices of the [MOD-004 Module PRD](../../20-module-prds/purchase/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-004`
- **Module Name:** Purchase
- **Module README:** [`../../20-module-prds/purchase/README.md`](../../20-module-prds/purchase/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)

## Stage 1 — Sprint Planning

The Stage 1 Sprint Plan for MOD-004 Purchase is [`MOD-004_SPRINT_PLAN.md`](./MOD-004_SPRINT_PLAN.md). It reserves six Sprint identifiers and defines the sequence, engine/ADR consumption, dependencies, and exit criteria that will govern Stage 2 authoring. Stage 2 authoring has not started; each Sprint PRD below is a **planning placeholder** and will become active documentation only when the corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-004-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-004-001`, `SPR-MOD-004-002`, …). Identifiers are permanent and never reused.

## Planning Placeholders

> Each row represents a planned sprint placeholder for roadmap purposes only. The existence of a row does not constitute creation or approval of a Sprint PRD. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| SPR-MOD-004-001 | Sprint 1 | Purchase Foundation | Draft — [`SPR-MOD-004-001-purchase-foundation.md`](./SPR-MOD-004-001-purchase-foundation.md) | `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `MOD003_SALES_BASELINE_v1` |
| SPR-MOD-004-002 | Sprint 2 | Requisitions, RFQs & Purchase Orders | Draft — [`SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md`](./SPR-MOD-004-002-requisitions-rfqs-purchase-orders.md) | `SPR-MOD-004-001` |
| SPR-MOD-004-003 | Sprint 3 | Goods Receipt & Inspection | Draft — [`SPR-MOD-004-003-goods-receipt-inspection.md`](./SPR-MOD-004-003-goods-receipt-inspection.md) | `SPR-MOD-004-002` |
| SPR-MOD-004-004 | Sprint 4 | Vendor Billing & Commercial 3-Way Match | Draft — [`SPR-MOD-004-004-vendor-billing-3-way-match.md`](./SPR-MOD-004-004-vendor-billing-3-way-match.md) | `SPR-MOD-004-003` |
| SPR-MOD-004-005 | Sprint 5 | Purchase Returns & Debit Notes | Planned | `SPR-MOD-004-003`, `SPR-MOD-004-004` |
| SPR-MOD-004-006 | Sprint 6 | Purchase Analytics & Controls | Planned | `SPR-MOD-004-001` … `SPR-MOD-004-005` |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **5**; the authoritative Sprint Plan (`MOD-004_SPRINT_PLAN.md`) reconciles this to **6**. Row counts and goals here follow the Sprint Plan and will be refined when each Sprint PRD is authored in the corresponding Pass 8.x phase.

## Authoring Rules

- Follow [`docs/SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md) — including the Sprint Traceability Rule and the Sprint Completion Rule.
- Size sprints against [`docs/SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md).
- Sequence sprints per [`docs/SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).
- Use [`docs/99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md).
- Do not add business requirements that are not first captured in the parent Module PRD.
- Reference upstream layers by stable identifier (`ENG-NNN`, `ADR-NNN`, `MOD-NNN`).
- All accounting behavior is consumed through `MOD002_ACCOUNTING_BASELINE_v1`; Purchase owns commercial document lifecycle, Accounting owns accounting lifecycle. Inventory behavior is consumed from MOD-005 Inventory; Purchase does not redefine inventory ownership.

## References

- [`../README.md`](../README.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../20-module-prds/purchase/MODULE_PRD.md`](../../20-module-prds/purchase/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
