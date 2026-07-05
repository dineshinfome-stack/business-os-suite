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

## Sprints

| Sprint ID | Iteration | Title | Status | Owner | PRD |
| --- | --- | --- | --- | --- | --- |
| _(none yet)_ | — | — | — | — | — |

Sprints are added iteratively in Pass 8.x. Each new sprint MUST also be registered in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md).

## Authoring Rules

- Use [`docs/99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md).
- Do not add business requirements that are not first captured in the parent Module PRD.
- Reference upstream layers by stable identifier (`ENG-NNN`, `ADR-NNN`, `MOD-NNN`).

## References

- [`../README.md`](../README.md)
- [`../../20-module-prds/assets/MODULE_PRD.md`](../../20-module-prds/assets/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
