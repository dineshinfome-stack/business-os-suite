---
title: "MOD-002 — Accounting — Sprints"
summary: "Sprint PRDs for Accounting (MOD-002). Sprint identifiers are prefixed SPR-MOD-002-NNN."
layer: "delivery"
owner: "Finance"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-002"
sprint_prefix: "SPR-MOD-002-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-002 — Accounting — Sprints

> **Sprint container for Accounting.** Sprint PRDs in this folder implement slices of the [MOD-002 Module PRD](../../20-module-prds/accounting/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-002`
- **Module Name:** Accounting
- **Module README:** [`../../20-module-prds/accounting/README.md`](../../20-module-prds/accounting/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-002-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-002-001`, `SPR-MOD-002-002`, …). Identifiers are permanent and never reused.

## Stage 1 — Sprint Planning

The Stage 1 (Sprint Planning) artifact for MOD-002 under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md) is:

- [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) — proposed sprint sequence, engines and ADRs consumed, cross-sprint dependencies, sprint exit criteria, and baseline-terminated module completion criteria.

The Stage 1 plan **reserves** the sprint identifiers listed below. Reservations are not authored Sprint PRDs and are not registered in `docs/SPRINT_CATALOG.md`.

## Planning Placeholders (Reconciled with Stage 1 Plan)

> Each row is a **planning reservation** made by the Stage 1 plan. The existence of a row does not constitute creation or approval of a Sprint PRD. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder in Stage 2 and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal (from Stage 1 plan) | Estimated Size | Status | Dependencies |
| --- | --- | --- | --- | --- | --- |
| SPR-MOD-002-001 | Sprint 1 | [Accounting Foundation](./SPR-MOD-002-001-accounting-foundation.md) | Medium | Draft | — |
| SPR-MOD-002-002 | Sprint 2 | [Voucher Framework](./SPR-MOD-002-002-voucher-framework.md) | Large | Draft | SPR-MOD-002-001 |
| SPR-MOD-002-003 | Sprint 3 | [Journal & Ledger Posting](./SPR-MOD-002-003-journal-ledger-posting.md) | Large | Draft | SPR-MOD-002-002 |
| SPR-MOD-002-004 | Sprint 4 | Financial Statements | Large | Planned | SPR-MOD-002-003 |
| SPR-MOD-002-005 | Sprint 5 | Taxation & Compliance Foundation | Medium | Planned | SPR-MOD-002-003 |
| SPR-MOD-002-006 | Sprint 6 | Period Close & Audit | Medium | Planned | SPR-MOD-002-004, SPR-MOD-002-005 |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` will be reconciled with the six-sprint Stage 1 reservation. Row counts, sizes, and goals here remain initial planning estimates from the Stage 1 plan and will be refined per the Planning Flexibility clause when each Sprint PRD is authored in Stage 2. See [`MOD-002_SPRINT_PLAN.md`](./MOD-002_SPRINT_PLAN.md) for full sprint boundaries, exit criteria, engine/ADR consumption, and risks.

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
- [`../../20-module-prds/accounting/MODULE_PRD.md`](../../20-module-prds/accounting/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
