---
title: "Governance Template Framework"
summary: "Authoritative home of reusable governance templates: registry, standard, lifecycle, and index."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "templates", "framework"]
document_type: "Governance Guide"
---

# Governance Template Framework

Reusable, versioned governance templates that execute repository passes (reconciliation, authoring, consolidation, audit). Templates live here; execution history lives in `.lovable/plan.md` and pass-specific logs.

## Purpose

- Treat governance templates as **first-class assets**, separate from execution logs.
- Provide a single **Registry**, **Standard**, **Lifecycle**, and **Index** for every template.
- Enable safe evolution (additive Minor bumps, breaking Major bumps) without touching historical executions.

## Folder Layout

```text
docs/15-governance/
├── README.md                            This document
├── GOVERNANCE_TEMPLATE_STANDARD.md      Canonical 16-section template spec
├── GOVERNANCE_TEMPLATE_LIFECYCLE.md     Draft → Review → Active → Deprecated → Archived + SemVer
├── GOVERNANCE_TEMPLATE_REGISTRY.md      Per-template records (13 fields)
└── GOVERNANCE_TEMPLATE_INDEX.md         Tabular summary
```

## Lifecycle (summary)

`Draft → Review → Active → Deprecated → Archived`. Only **Active** templates may be executed. **Deprecated** remains valid for historical executions. **Archived** is immutable. See `GOVERNANCE_TEMPLATE_LIFECYCLE.md`.

## Versioning (summary)

Semantic Versioning `Major.Minor`. Minor = additive-only; Major = breaking (requires new `compatible_governance`). See `GOVERNANCE_TEMPLATE_LIFECYCLE.md`.

## Registration Process

1. Draft the template following `GOVERNANCE_TEMPLATE_STANDARD.md`.
2. Add a **Planned** row to `GOVERNANCE_TEMPLATE_INDEX.md` and stub record in `GOVERNANCE_TEMPLATE_REGISTRY.md`.
3. Review → promote to Active; record `template_sha256`, first release, owner.
4. Register the file paths in `docs/DOCUMENT_INDEX.md`, `docs/REPOSITORY_MAP.md`, and `docs/_meta.json`.
5. Any consuming pass cites the template ID and version in its execution log.

## How to Add a New Template

- Create the template document following the 16 sections of the Standard.
- Set `template_id`, `template_version`, `compatible_governance`, `schema_version`, `template_sha256` (computed over Sections 1–14 and 16, excluding Section 15 and example instantiations).
- Enter **Draft** lifecycle state, add Registry row with Status: Planned.
- After Review, promote to **Active** and update Registry + Index.

## Cross-References

- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` — Governance Specification v1.0 (normative parent).
- `.lovable/plan.md` — execution logs and current in-flight pass state.
- `docs/DOCUMENT_INDEX.md`, `docs/REPOSITORY_MAP.md`, `docs/_meta.json` — registration surfaces.
