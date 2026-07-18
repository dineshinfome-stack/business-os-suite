---
title: "Governance Frontmatter Standard"
summary: "Repository-wide canonical standard for spec_id, template, template_version, and mandatory frontmatter validation across every governance and Solution Design artifact."
spec_id: "GOVERNANCE_FRONTMATTER_STANDARD"
template: "GOVERNANCE_STANDARD"
template_version: "v1.0"
version: "v1.0"
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-18"
tags: ["governance", "frontmatter", "standard", "metadata", "conformance"]
document_type: "Governance Standard"
governance_specification: "v1.0"
---

# Governance Frontmatter Standard (v1.0)

> **Repository-wide governance standard.** Single authoritative reference for the `spec_id`, `template`, `template_version` frontmatter fields and the Mandatory Frontmatter Validation Checklist referenced by every downstream audit. Applies to every artifact authored from Pass 33.0.-1 onward. Pre-existing artifacts are grandfathered (§6).

## 1. Purpose & Authority

This standard is the **single repository-wide reference** for the canonical values of the `spec_id`, `template`, and `template_version` frontmatter fields and for the Mandatory Frontmatter Validation Checklist that every repository audit consumes verbatim.

It is referenced by:

- Every governance template — `GT-002_STAGE1_AUTHORING`, `GT-003_SPRINT_AUTHORING`, `GT-004_BASELINE_CONSOLIDATION`, `GT-005` (Repository Audit / Module Publication terminal contract).
- Every Solution Design template of the SD-001 family — `SD-001_WEB_SPEC`, `SD-001_MOB_SPEC`, `SD-001_API_SPEC`.
- Every repository audit report — via the single-line **Frontmatter Validation Checklist** result (§5).

This standard introduces no new artifact type, no new authority, and no new lifecycle. It formalizes conventions already used across the repository so that future artifacts do not require per-pass reconciliation.

## 2. `spec_id` Conventions

Canonical identifier per artifact family. `spec_id` MUST match the family's canonical shape.

| Artifact Family | Canonical `spec_id` Shape |
| --- | --- |
| Module PRD | `MOD-NNN` |
| Module Sprint Plan | `MOD-NNN_SPRINT_PLAN` |
| Sprint PRD | `SPR-MOD-NNN-NNN` |
| Module Baseline | `MODNNN_<MODULE>_BASELINE_v<version>` |
| Module Publication | `MOD-NNN_MODULE_PUBLICATION` |
| Web Solution Design Specification | `WEB-NNN` |
| Mobile Solution Design Specification | `MOB-NNN` |
| API Solution Design Specification | `API-NNN` |
| Repository Audit Report | `REPOSITORY_AUDIT_<UTC-timestamp>` (e.g. `REPOSITORY_AUDIT_20260718T133000Z`) |
| Governance Standard / Registry | The document's own canonical name (e.g. `GOVERNANCE_FRONTMATTER_STANDARD`) |

`NNN` is a zero-padded three-digit integer scoped to the family.

## 3. `template` Conventions

Stable, human-readable template names, decoupled from pass numbers. The current canonical vocabulary is:

| Canonical `template` Value | Applies To |
| --- | --- |
| `GT-002_STAGE1_AUTHORING` | Module PRDs and Module Sprint Plans (Stage 1) |
| `GT-003_SPRINT_AUTHORING` | Sprint PRDs (Stage 2) |
| `GT-004_BASELINE_CONSOLIDATION` | Module Baselines (Stage 3) |
| `GT-005_MODULE_PUBLICATION` | Module Publications (terminal governance stage) |
| `GT-005_REPOSITORY_AUDIT` | Repository Audit Reports |
| `SD-001_WEB_SPEC` | Web Solution Design Specifications |
| `SD-001_MOB_SPEC` | Mobile Solution Design Specifications |
| `SD-001_API_SPEC` | API Solution Design Specifications |
| `GOVERNANCE_STANDARD` | Repository-wide governance standards (this document, `GOVERNANCE_FRAMEWORK_MANIFEST`, and equivalent standards) |

> **Dual capacity of `GT-005`.** `GT-005` operates in two capacities inherited from Governance Framework v1.0: (a) the terminal Module Publication contract, and (b) the Repository Audit contract. To keep frontmatter unambiguous, this standard splits the `template` value into `GT-005_MODULE_PUBLICATION` and `GT-005_REPOSITORY_AUDIT`. Both share the same underlying template file (`docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md`) and the same `v1.0` release; neither introduces a new template.

New `template` values MAY only be added through the amendment procedure (§8).

## 4. `template_version` Conventions

- Semantic Versioning as `Major.Minor` prefixed with `v` — for example `v1.0`, `v1.1`, `v2.0`.
- Current baseline version for every value in §3 is **`v1.0`**.
- A `Minor` increment MAY be introduced additively without breaking historical artifacts.
- A `Major` increment requires a dedicated governance pass and MUST be reflected in `GOVERNANCE_TEMPLATE_REGISTRY.md`, `GOVERNANCE_TEMPLATE_INDEX.md`, and `GOVERNANCE_FRAMEWORK_MANIFEST.json`.

## 5. Mandatory Frontmatter Validation Checklist

Every repository audit MUST evaluate the following checklist against the artifacts it inspects and report the result as a single line:

> **Frontmatter Validation Checklist = PASS** _(or)_ **Frontmatter Validation Checklist = FAIL**

On `FAIL`, and only on `FAIL`, the audit enumerates the failing fields.

### 5.1 Checklist

| # | Field | Presence Rule |
| --- | --- | --- |
| 1 | `spec_id` | MUST exist; MUST match §2 shape for the artifact family. |
| 2 | `template` | MUST exist; MUST be drawn from the §3 vocabulary. |
| 3 | `template_version` | MUST exist; MUST match §4 rule. |
| 4 | `source_module` (or `module_id`) | MUST exist when the artifact is module-scoped (Module PRDs, Sprint PRDs, Baselines, Publications, WEB/MOB/API specs). |
| 5 | `source_publication` | MUST exist when the artifact derives from a Published Module (WEB / MOB / API specs). |
| 6 | `owner` | MUST exist. |
| 7 | `status` | MUST exist. |
| 8 | `updated` | MUST exist as an ISO date (`YYYY-MM-DD`). |
| 9 | `document_type` | MUST exist. |
| 10 | `tags` | MUST exist as a non-empty list. |

The checklist is closed. Additional per-family fields (for example `related_engines`, `related_adrs`, `execution_id`, `parent_execution_id`) remain governed by their respective templates and are validated by the family's own audit rules, not by this checklist.

## 6. Grandfathering

Pre-existing artifacts authored before Pass 33.0.-1 are **grandfathered as-is**. Historical identifiers remain valid. Historical frontmatter is not rewritten under this standard.

### 6.1 Historical → Canonical Projection

For audit convenience only. Historical `template` values found in the repository project to their canonical §3 equivalents as follows:

| Historical `template` Value | Canonical `template` Value |
| --- | --- |
| `SD-002` | `SD-001_WEB_SPEC` |
| `SD-003` | `SD-001_MOB_SPEC` |
| `SD-004` | `SD-001_API_SPEC` |
| `SD-005` | `SD-001_WEB_SPEC` |
| `SD-006` | `SD-001_MOB_SPEC` |
| `SD-007` | `SD-001_API_SPEC` |
| `GT-005` (used on Module Publications) | `GT-005_MODULE_PUBLICATION` |
| `GT-005` (used on Repository Audits) | `GT-005_REPOSITORY_AUDIT` |

Projection is one-way and read-only. It MUST NOT be used to retroactively edit any pre-existing artifact.

## 7. Conformance Rule

All artifacts authored from **Pass 33.0.-1 onward** MUST conform to this standard. Conformance is asserted by every downstream repository audit through the single-line result in §5.

## 8. Amendment Procedure

Additions to §3 (new `template` value), §4 (new `template_version` policy), or §5 (checklist changes) require a dedicated governance pass that:

1. Increments this document's `template_version` (`v1.0` → `v1.1` for additive changes; `v2.0` for breaking changes).
2. Updates `GOVERNANCE_TEMPLATE_REGISTRY.md`, `GOVERNANCE_TEMPLATE_INDEX.md`, and `GOVERNANCE_FRAMEWORK_MANIFEST.json`.
3. Emits a Repository Audit under the extended checklist.

No per-pass overrides are permitted.

## 9. Cross-References

- `docs/15-governance/GOVERNANCE_FRAMEWORK_MANIFEST.json` — framework release manifest that references this standard.
- `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` — records the SD-001 family templates that adopt this standard.
- `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md` — canonical 16-section template specification.
- `docs/15-governance/GOVERNANCE_TEMPLATE_LIFECYCLE.md` — template lifecycle and SemVer rules.
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` — governance specification v1.0 (normative parent).
