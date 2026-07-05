---
title: "Sprint Catalog"
summary: "Catalog of every Sprint PRD (SPR-MOD-NNN-NNN): stable identifier, iteration label, parent module, status, PRD path, and owner. Ships empty; populated iteratively in Pass 8.x."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["sprint", "catalog", "index"]
document_type: "Governance Guide"
---

# Sprint Catalog

> **Derived document.** Projection of `docs/30-sprint-prds/`. Authoritative sprint scope lives in each `SPR-MOD-NNN-NNN.md`. On any conflict, the Sprint PRD wins and this catalog is corrected in the same change.

## Purpose

The **Sprint Catalog** enumerates every Sprint PRD, keyed by its permanent `SPR-MOD-NNN-NNN` identifier. Rows link to the authoritative Sprint PRD file.

## How to Read

- **Sprint ID** — permanent identifier `SPR-MOD-NNN-NNN`. Never reassigned or reused.
- **Iteration** — human-readable schedule label (e.g. `Sprint 1`, `2026-Q3-S1`). MAY change without touching the Sprint ID.
- **Parent Module** — `MOD-NNN` — <module name>.
- **Status** — `Draft` \| `Planned` \| `In Progress` \| `Done` \| `Superseded`.
- **PRD** — link to the Sprint PRD file.
- **Owner** — sprint-owning team.

## Maintenance Note

This catalog SHOULD be regenerated or reviewed whenever a Sprint PRD is added, renamed, superseded, or transitions status. It MUST NOT become an independent source of truth.

## Catalog

| Sprint ID | Iteration | Parent Module | Status | PRD | Owner |
| --- | --- | --- | --- | --- | --- |
| _(none yet)_ | — | — | — | — | — |

Sprint PRDs are authored iteratively in Pass 8.x. Each new sprint MUST be registered here and in its module subfolder README under `docs/30-sprint-prds/<module>/README.md`.

## References

- `docs/30-sprint-prds/README.md`
- `docs/MODULE_CATALOG.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/99-templates/sprint-prd-template.md`
