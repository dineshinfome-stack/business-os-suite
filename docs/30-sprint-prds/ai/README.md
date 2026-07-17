---
title: "MOD-018 — AI Workspace — Sprints"
summary: "Sprint PRDs for AI Workspace (MOD-018). Sprint identifiers are prefixed SPR-MOD-018-NNN."
layer: "delivery"
owner: "AI Platform"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-018"
sprint_prefix: "SPR-MOD-018-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-018 — AI Workspace — Sprints

> **Sprint container for AI Workspace.** Sprint PRDs in this folder implement slices of the [MOD-018 Module PRD](../../20-module-prds/ai/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-018`
- **Module Name:** AI Workspace
- **Module README:** [`../../20-module-prds/ai/README.md`](../../20-module-prds/ai/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-018-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-018-001`, `SPR-MOD-018-002`, …). Identifiers are permanent and never reused.

## Sprint Plan (Stage 1)

The authoritative sprint sequence for MOD-018 is defined by [`MOD-018_SPRINT_PLAN.md`](./MOD-018_SPRINT_PLAN.md) (Stage 1 — GT-002).

## Planned Sprints

> Each row represents a planning reservation from the approved Sprint Plan. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| SPR-MOD-018-001 | Sprint 1 | Prompt Library & AI Workspace Foundation | Draft | — |
| SPR-MOD-018-002 | Sprint 2 | Retrieval Workspaces (RAG) | Draft | SPR-MOD-018-001 |
| SPR-MOD-018-003 | Sprint 3 | Tool Calling on Module Capabilities | Draft | SPR-MOD-018-001, SPR-MOD-018-002 |
| SPR-MOD-018-004 | Sprint 4 | Copilot Surfaces & Conversations | Draft | SPR-MOD-018-001, SPR-MOD-018-002, SPR-MOD-018-003 |
| SPR-MOD-018-005 | Sprint 5 | Governance: Human-Approval Gates, Cost & Safety | Planned | SPR-MOD-018-001, SPR-MOD-018-002, SPR-MOD-018-003, SPR-MOD-018-004 |

The `Estimated Sprint Count` for this module in `docs/SPRINT_ROADMAP.md` is **5** and is preserved by the Sprint Plan.

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
- [`../../20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
