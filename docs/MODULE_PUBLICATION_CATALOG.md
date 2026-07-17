---
title: "Module Publication Catalog"
summary: "Catalog of every Module Publication (GT-005 terminal artifact): publication identifier, module, source baseline, status, and path. Populated as modules complete GT-005."
layer: "platform"
owner: "Governance"
status: "approved"
updated: "2026-07-17"
tags: ["publication", "module", "catalog", "index", "GT-005"]
document_type: "Governance Guide"
---

# Module Publication Catalog

> **Derived document.** Projection of `docs/45-module-publications/`. Authoritative publication content lives in each `MOD-<NNN>_MODULE_PUBLICATION.md`. On any conflict, the publication file wins and this catalog is corrected in the same change.

## Purpose

The **Module Publication Catalog** enumerates every Module Publication (GT-005 terminal artifact of [`MODULE_IMPLEMENTATION_WORKFLOW.md`](./MODULE_IMPLEMENTATION_WORKFLOW.md)), keyed by its publication identifier. Rows link to the authoritative publication file.

## How to Read

- **Publication ID** — `MOD-<NNN>_MODULE_PUBLICATION`.
- **Module** — parent `MOD-NNN`.
- **Source Baseline** — the `MOD<NNN>_<MODULE>_BASELINE_v<version>` from which the publication was derived.
- **Status** — `Published` \| `Superseded`.
- **Path** — repository-relative path.

## Maintenance Note

This catalog SHOULD be updated whenever a Module Publication is authored or superseded. It MUST NOT become an independent source of truth.

## Catalog

| Publication ID | Module | Source Baseline | Status | Path |
| --- | --- | --- | --- | --- |
| MOD-017_MODULE_PUBLICATION | MOD-017 Analytics | MOD017_ANALYTICS_BASELINE_v1 | Published | [`45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md`](45-module-publications/analytics/MOD-017_MODULE_PUBLICATION.md) |
| MOD-018_MODULE_PUBLICATION | MOD-018 AI Workspace | MOD018_AI_WORKSPACE_BASELINE_v1 | Published | [`45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md`](45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md) |

## References

- [`docs/45-module-publications/README.md`](45-module-publications/README.md)
- [`docs/MODULE_BASELINE_CATALOG.md`](./MODULE_BASELINE_CATALOG.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](./MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md`](15-governance/templates/GT-005_REPOSITORY_AUDIT.md)
