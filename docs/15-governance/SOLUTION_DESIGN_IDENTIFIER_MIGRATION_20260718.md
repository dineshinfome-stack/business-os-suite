---
title: "Solution Design Identifier Alignment — Migration 20260718"
doc_id: "SOLUTION_DESIGN_IDENTIFIER_MIGRATION_20260718"
migration_id: "MIG-20260718-SD-IDENTIFIER-ALIGNMENT"
version: "1.0"
status: "Executed"
type: "migration-record"
owner: "Architecture Office"
last_updated: "2026-07-18"
tags: ["governance", "migration", "solution-design", "identifiers"]
---

# Solution Design Identifier Alignment — 2026-07-18

## 1. Purpose

Align Solution Design specification identifiers with the numeric identifier of their parent Published Module. After migration, MOD-`NNN`, WEB-`NNN`, MOB-`NNN`, and API-`NNN` share a common ordinal so that cross-surface lookup is deterministic and readers can trace a module to its surfaces without a lookup table.

## 2. Scope

- **In scope:** identifier renaming and cross-reference updates for Solution Design specifications under `docs/60-solution-design/{web,mobile,api}/`, plus every mutable registration surface.
- **Out of scope:** any change to business content of the specifications; any change to Module Publications, Module Baselines, Sprint PRDs, or governance frameworks.

## 3. Identifier Projection

| Family | Legacy ID | Canonical ID | Parent Module |
| --- | --- | --- | --- |
| WEB | WEB-001 | WEB-017 | MOD-017 Analytics |
| WEB | WEB-002 | WEB-018 | MOD-018 AI Workspace |
| WEB | WEB-003 | WEB-001 | MOD-001 Platform Administration |
| MOB | MOB-001 | MOB-017 | MOD-017 Analytics |
| MOB | MOB-002 | MOB-018 | MOD-018 AI Workspace |
| API | API-001 | API-017 | MOD-017 Analytics |
| API | API-002 | API-018 | MOD-018 AI Workspace |

Legacy identifiers remain valid in immutable surfaces (historical audit reports and execution records) and MUST be interpreted through this projection.

## 4. Method

Collision-safe two-phase rename to avoid the WEB-001 collision (WEB-001 was reassigned from Analytics to Platform Administration):

1. **Phase A — file rename to temporary tokens**, then to canonical filenames.
2. **Phase B — content substitution** applied to mutable surfaces via two-pass sed: legacy → temporary token → canonical. This prevents any intermediate state where two artifacts share an identifier.

## 5. Surfaces Updated (mutable)

- Specification bodies and frontmatter under `docs/60-solution-design/{web,mobile,api}/`.
- `docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md` (rows re-sorted by module ordinal).
- Per-family READMEs under `docs/60-solution-design/{web,mobile,api}/README.md`.
- `docs/60-solution-design/README.md`.
- `docs/DOCUMENT_INDEX.md`.
- `docs/_meta.json` (labels and paths).
- `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` ("Used By" annotations).

## 6. Surfaces Preserved (immutable)

- All prior repository audit reports under `docs/50-audit-reports/`.
- `.lovable/plan.md` historical entries.

Any legacy identifier appearing in those files is an accurate historical record and MUST NOT be edited.

## 7. Validation

- No legacy Solution Design identifier remains in any mutable surface (verified by `rg`).
- Every canonical filename resolves and is referenced by the catalog, per-family README, DOCUMENT_INDEX, and `_meta.json`.
- `docs/_meta.json` parses as valid JSON.
- Catalog and per-family READMEs are sorted by module ordinal.

## 8. Terminal Audit

`REPOSITORY_AUDIT_20260718T160000Z` — Pass 33.1.0 Terminal Repository Audit.

## 9. References

- [`MIGRATION_REGISTRY.md`](./MIGRATION_REGISTRY.md)
- [`MIGRATION_MANIFEST_20260718.json`](./MIGRATION_MANIFEST_20260718.json)
- [`GOVERNANCE_FRONTMATTER_STANDARD.md`](./GOVERNANCE_FRONTMATTER_STANDARD.md)
