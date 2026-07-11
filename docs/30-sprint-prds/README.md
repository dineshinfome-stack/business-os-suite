---
title: "30 Sprint PRDs — Overview"
summary: "Sprint PRDs bridge Module PRDs to implementation. Each Sprint PRD is an implementation-ready slice of a Module PRD; sprints consume Foundation, Architecture, ERP Core Engines, and Accepted ADRs — they never redefine them."
layer: "delivery"
owner: "Engineering"
status: "approved"
updated: "2026-07-05"
tags: ["sprint", "prd", "overview"]
document_type: "Sprint Layer Guide"
---

# 30 Sprint PRDs — Overview

> **Authoritative for the sprint scope.** Each Sprint PRD is authoritative for the scope it delivers. It **consumes** upstream layers — Foundation, Architecture (`docs/02-architecture/`), ERP Core Engines (`ENG-NNN`), Accepted ADRs (`ADR-NNN`), and its parent Module PRD (`MOD-NNN`) — and never redefines them. On any conflict with an upstream authoritative document, the upstream wins.

## Purpose

A Sprint PRD is an **implementation-ready slice** of a Module PRD. It answers: *what are we building this sprint, how do we know it's done, and how does it trace back to the module?* It does not answer architectural or platform questions — those live upstream.

## Delivery Hierarchy

```text
Module PRD (MOD-NNN)
        ↓
Sprint PRDs (SPR-MOD-NNN-NNN)
        ↓
Implementation Tasks
        ↓
Source Code
```

Nothing bypasses a Module PRD. A Sprint PRD MUST NOT introduce business requirements that are not already captured in its parent Module PRD.

## Stable Sprint Identifiers

Every Sprint PRD has a permanent identifier of the form `SPR-MOD-<NNN>-<NNN>`, where the first `<NNN>` is the parent module and the second is the zero-padded sprint sequence within that module.

- Example: `SPR-MOD-002-001` = Accounting (MOD-002), Sprint 1.
- Identifiers are **stable**: never reassigned or reused, even if a sprint is renamed, split, merged, or retired.
- The `iteration` frontmatter field carries the human-readable schedule label (e.g. `Sprint 1`, `2026-Q3-S1`) and MAY change without touching `sprint_id`.

## Folder Convention

One subfolder per module, matching the Module PRD folder name:

```text
docs/30-sprint-prds/
├── README.md                       (this file)
├── platform/README.md              MOD-001
├── accounting/README.md            MOD-002
├── sales/README.md                 MOD-003
├── … 15 more …
├── ai/README.md                    MOD-018
└── warehouse/README.md             MOD-019
```

Sprint PRD files live inside their module's subfolder using the sprint identifier as the filename, e.g. `docs/30-sprint-prds/accounting/SPR-MOD-002-001.md`.

## Sprint PRD Lifecycle

`Draft → Planned → In Progress → Done → Superseded`

- `Draft` — being written; not yet ready to plan against.
- `Planned` — committed to a future iteration.
- `In Progress` — actively being implemented.
- `Done` — delivered and verified against its Definition of Done.
- `Superseded` — replaced by another Sprint PRD (recorded with a `superseded_by` link).

## Dependency Rules

Sprint PRDs **may** depend on:

- their parent Module PRD (`MOD-NNN`),
- ERP Core Engines (`ENG-NNN`) declared by that module,
- Accepted ADRs (`ADR-NNN`) — Proposed ADRs may only be referenced when explicitly flagged as an awaited dependency,
- Foundation (`docs/FOUNDATION_FREEZE_v1.md`) and Architecture (`docs/02-architecture/`).

Sprint PRDs **MUST NOT**:

- redefine ERP Core Engines, ADRs, Architecture, Canon, or Module PRDs,
- add new business requirements outside the parent Module PRD,
- introduce cross-module coupling except through published events, approved APIs, or shared master data as governed by the Module Dependency Rules.

## Identifier Cross-Reference Convention

Whenever an ERP Core Engine, ADR, Module, or Sprint is referenced in documentation, its stable identifier (`ENG-NNN`, `ADR-NNN`, `MOD-NNN`, `SPR-MOD-NNN-NNN`) SHOULD accompany the human-readable name on first reference within a document. Subsequent references may use either the identifier or the name where context is unambiguous.

## Authoring a Sprint PRD

1. Copy `docs/99-templates/sprint-prd-template.md` into the correct module subfolder.
2. Rename the file to the sprint identifier (`SPR-MOD-NNN-NNN.md`).
3. Fill in the frontmatter — `sprint_id`, `parent_module`, `iteration`, `related_engines`, `related_adrs`, `status`, `owner`, `updated`.
4. Complete the 13 body sections in order.
5. Register the sprint in `docs/SPRINT_CATALOG.md`.
6. Add the sprint to the module subfolder's `README.md` sprint table.

## References

- `docs/20-module-prds/README.md`
- `docs/MODULE_CATALOG.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/99-templates/sprint-prd-template.md`
- `docs/SPRINT_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
- `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md`
