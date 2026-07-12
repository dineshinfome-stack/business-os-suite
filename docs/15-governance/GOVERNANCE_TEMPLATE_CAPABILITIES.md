---
title: "Governance Template Capabilities Registry"
summary: "Authoritative registry of canonical capability identifiers referenced by governance templates."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "templates", "capabilities", "registry"]
document_type: "Governance Registry"
governance_specification: v1.0
template_standard: v1.3
registry_version: v1.0
lifecycle_state: Active
---

# Governance Template Capabilities Registry

Authoritative source of canonical capability identifiers used by governance templates. Templates SHALL reference capabilities by `slug`; automation SHALL resolve `slug → capability_id` through this registry.

## §1 Schema

Each row is a capability record with the following fields:

| Field | Description |
|---|---|
| `capability_id` | Immutable primary key of the form `CAP-NNN`. Monotonic; never reused. |
| `slug` | Stable human-readable identifier used in template `capabilities` blocks. |
| `name` | Human-readable name. |
| `description` | Single-sentence definition. |
| `since` | Registry version in which the capability first appeared. |
| `aliases` | Prior slugs preserved for backward compatibility (patch-level slug refinements). |
| `depends_on` | Optional list of `capability_id` values this capability requires. |
| `supersedes` | Optional list of `capability_id` values this capability replaces. |
| `related_to` | Optional list of `capability_id` values loosely associated for traceability. |
| `status` | `Active` \| `Deprecated` \| `Archived`. |

## §2 Relationship Semantics

Relationship kinds are defined once; individual rows SHALL NOT override these semantics. Adding a new relationship kind is a **Minor** registry bump. Changing the semantics of an existing kind is a **Major** registry bump (breaking for automation contracts).

```yaml
relationship_semantics:
  depends_on:
    execution: required               # target capability MUST be satisfiable within the current execution graph
    validation: blocking              # unsatisfied dependency => VAL-014 FAIL (exit_code 20, DEPENDENCY-FAIL)
    traceability: recorded            # edge appears in traceability reports
    version_scope: any                # may span Major registry versions
  supersedes:
    execution: none                   # does not trigger execution of the target
    lifecycle: deprecates_target      # target row transitions to status: Deprecated at commit time
    validation: blocking-on-commit    # commit rejected if target does not exist or is already superseded
    traceability: recorded
    version_scope: major-only         # supersedes edges MAY be declared only across Major registry versions
  related_to:
    execution: none
    validation: informational         # emits an INFO finding; never blocking
    traceability: recorded            # supports discovery / affinity queries
    directionality: non-directional
    version_scope: any
```

Interpretation rules:

- `depends_on` satisfaction is evaluated against (a) the invoking template's own declared `capabilities` set and (b) capabilities declared by templates listed in its template-level `depends_on`. If either satisfies the graph, `VAL-014` PASSes.
- In registry `v1.0` no relationship edges are declared; therefore relationship validation is guaranteed PASS.
- `supersedes` MAY be declared in a registry version only if paired with a Major registry bump.
- `related_to` never blocks execution or commit; findings surface under severity `INFO`.

## §3 Registry Rules

- `capability_id` values are immutable, monotonic, and MUST NOT be reused after retirement.
- Editing a `description` = **Patch** registry bump (no version increment required for typo fixes; documented in Change Control).
- Adding a new capability row, adding a new relationship kind, or refining a `slug` (recording the prior slug under `aliases`) = **Minor** registry bump.
- Retiring a capability, changing an existing `capability_id`, changing the semantics of an existing relationship kind, or declaring `supersedes` edges = **Major** registry bump.
- The union graph of `depends_on ∪ supersedes` MUST be acyclic. Cycles are rejected at commit time.
- All relationship targets MUST resolve to an existing `capability_id` at time of commit.
- Slug refinements MUST preserve the prior slug in `aliases`; template authors MAY reference either the current slug or an alias, and automation MUST resolve both.

## §4 Capabilities Table (v1.0)

| capability_id | slug | name | description | since | aliases | depends_on | supersedes | related_to | status |
|---|---|---|---|---|---|---|---|---|---|
| CAP-001 | `stage1-authoring` | Stage 1 Authoring | Module PRD + Sprint Plan authoring for Stage 1. | v1.0 | — | — | — | — | Active |
| CAP-002 | `module-prd` | Module PRD Authoring | Produces a Stage 1 Module PRD conforming to Governance Specification v1.0. | v1.0 | — | — | — | — | Active |
| CAP-003 | `sprint-plan` | Sprint Plan Authoring | Produces a Stage 1 Sprint Plan enumerating sprints for a module. | v1.0 | — | — | — | — | Active |
| CAP-004 | `sprint-authoring` | Sprint PRD Authoring | Stage 2 Sprint PRD authoring under the canonical 18-section template. | v1.0 | — | — | — | — | Active |
| CAP-005 | `baseline-consolidation` | Baseline Consolidation | Stage 3 Module Baseline authoring; consolidation-only. | v1.0 | — | — | — | — | Active |
| CAP-006 | `legacy-reconciliation` | Legacy Reconciliation | Normalizes pre-Governance-v1.0 artifacts into canonical form. | v1.0 | — | — | — | — | Active |
| CAP-007 | `registration` | Registration | Registers artifacts across governance surfaces (Registry, Index, Catalogs, `_meta.json`). | v1.0 | — | — | — | — | Active |
| CAP-008 | `repository-audit` | Repository Audit | Repository-wide Spec v1.0 audit evaluation with evidence rows. | v1.0 | — | — | — | — | Active |
| CAP-009 | `verification` | Verification | Standardized post-implementation verification per the Verification Reporting Standard. | v1.0 | — | — | — | — | Active |
| CAP-010 | `drift-report` | Drift Report | Legacy governance drift reporting with `UNCHANGED \| NORMALIZED \| CORRECTED \| FLAGGED` classification. | v1.0 | — | — | — | — | Active |

## Change Control

| Version | Change Summary | Governance Version | Lifecycle State |
|---|---|---|---|
| v1.0 | Initial registry: `CAP-001..CAP-010` with optional relationship schema and formal Relationship Semantics block (R23 + R24). | v1.0 | Active |
