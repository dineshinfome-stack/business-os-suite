---
title: "Module Publications"
summary: "Layer README for GT-005 Module Publication artifacts. Each publication is a faithful representation of an approved Module Baseline, published as the terminal governance stage."
layer: "platform"
owner: "Governance"
status: "approved"
updated: "2026-07-17"
tags: ["publication", "module", "GT-005", "lifecycle"]
document_type: "Layer README"
---

# Module Publications

> **Layer scope.** `docs/45-module-publications/` holds the terminal governance artifact for every module that has completed its Stage 1 (Module PRD), Stage 2 (Sprint Plan and Sprint PRDs), and Stage 3 (Module Baseline) sequence. Publication is authored via [`GT-005`](../15-governance/templates/GT-005_REPOSITORY_AUDIT.md) and derives exclusively from the approved Module Baseline. Publications introduce no new requirements, authorities, ownership, scope, or governance evolution.

## Purpose

Provide a single, stable, cross-repository reference for each module's published governance surface. The publication is the artifact downstream systems, integrations, and cross-module consumers cite once a module reaches its terminal lifecycle state.

## Authoring Rules

- One publication per module at a given baseline version: `MOD-<NNN>_MODULE_PUBLICATION.md`.
- Publications live under a per-module directory: `docs/45-module-publications/<domain>/`.
- Publications derive exclusively from the approved Module Baseline; on any conflict the Baseline wins and the publication is corrected in the same change.
- Publications MUST NOT introduce new authorities, requirements, ownership, or scope.

## Current Publications

| Publication ID | Module | Baseline | Path |
| --- | --- | --- | --- |
| MOD-017_MODULE_PUBLICATION | MOD-017 Analytics | `MOD017_ANALYTICS_BASELINE_v1` | [`analytics/MOD-017_MODULE_PUBLICATION.md`](analytics/MOD-017_MODULE_PUBLICATION.md) |

## References

- [`docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md`](../15-governance/templates/GT-005_REPOSITORY_AUDIT.md)
- [`docs/MODULE_PUBLICATION_CATALOG.md`](../MODULE_PUBLICATION_CATALOG.md)
- [`docs/40-module-baselines/README.md`](../40-module-baselines/README.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md)
