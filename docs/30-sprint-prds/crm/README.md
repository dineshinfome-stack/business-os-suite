---
title: "MOD-006 — CRM — Sprints"
summary: "Sprint PRDs for CRM (MOD-006). Sprint identifiers are prefixed SPR-MOD-006-NNN."
layer: "delivery"
owner: "Revenue"
status: "approved"
updated: "2026-07-12"
legacy_updated: "2026-07-05"
module_id: "MOD-006"
sprint_prefix: "SPR-MOD-006-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-006 — CRM — Sprints

> **Sprint container for CRM.** Sprint PRDs in this folder implement slices of the [MOD-006 Module PRD](../../20-module-prds/crm/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-006`
- **Module Name:** CRM
- **Module README:** [`../../20-module-prds/crm/README.md`](../../20-module-prds/crm/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-006-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-006-001`, `SPR-MOD-006-002`, …). Identifiers are permanent and never reused.

## Sprint Plan (Stage 1)

The authoritative Stage 1 Sprint Plan for MOD-006 is [`MOD-006_SPRINT_PLAN.md`](./MOD-006_SPRINT_PLAN.md). It defines the sprint sequence, capability allocation, engine and ADR consumption, cross-module dependencies, and exit criteria. Sprint identifiers below are reserved by that plan.

## Reserved Sprints

> Rows are **planning reservations** from the Stage 1 Sprint Plan. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| SPR-MOD-006-001 | Sprint 1 | CRM Foundation (accounts, contacts, CRM configuration) | Authored (Draft) — [`SPR-MOD-006-001-crm-foundation.md`](./SPR-MOD-006-001-crm-foundation.md) | `MOD001_PLATFORM_BASELINE_v1` |
| SPR-MOD-006-002 | Sprint 2 | Leads (capture, qualification, conversion) | Authored (Draft) — [`SPR-MOD-006-002-leads.md`](./SPR-MOD-006-002-leads.md) | SPR-MOD-006-001 |
| SPR-MOD-006-003 | Sprint 3 | Opportunities (pipeline, win/loss) | Authored (Draft) — [`SPR-MOD-006-003-opportunities.md`](./SPR-MOD-006-003-opportunities.md) | SPR-MOD-006-001, SPR-MOD-006-002 |
| SPR-MOD-006-004 | Sprint 4 | Activities (activity, task, meeting tracking) | Planned | SPR-MOD-006-001 |
| SPR-MOD-006-005 | Sprint 5 | Campaigns (campaigns, segmentation, sends) | Planned | SPR-MOD-006-001 |
| SPR-MOD-006-006 | Sprint 6 | Customer 360 & Analytics (read model, reports, dashboards) | Planned | SPR-MOD-006-001 … SPR-MOD-006-005 |

The `Estimated Sprint Count` for this module is reconciled to **6** by the Stage 1 Sprint Plan. Goals and dependencies above mirror the plan and will be refined only through amendments to the plan itself.


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
- [`../../20-module-prds/crm/MODULE_PRD.md`](../../20-module-prds/crm/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
