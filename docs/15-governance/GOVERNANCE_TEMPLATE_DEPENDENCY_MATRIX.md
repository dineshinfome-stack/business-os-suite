---
title: "Governance Template Dependency Matrix"
summary: "Authoritative graph of relationships between governance templates. Central source of truth for inter-template dependencies."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "templates", "dependency", "graph"]
document_type: "Governance Registry"
asset_id: GOV-DEP-MATRIX
version: v1.0.1
schema_version: 1
graph_version: 1
governance_specification: v1.0
template_standard: v1.4
lifecycle_state: Active
---

# Governance Template Dependency Matrix

## §1 Identity

```yaml
asset_id: GOV-DEP-MATRIX
version: v1.0.1            # document format (patch: lifecycle-state transitions only)
schema_version: 1          # structural schema
graph_version: 1           # topology
governance_specification: v1.0
template_standard: v1.4
lifecycle_state: Active
sha_scope_rule: "exclude sections marked retainable: false"
asset_sha256: sha256:cdbccbd841cdf0b7412289dde2ab10f283e5680d2569617ede5ddc27ad2f8806
```

Three independent version axes evolve independently:

- `version` — document format / editorial revision.
- `schema_version` — structural schema of node/edge tables and frontmatter.
- `graph_version` — topology (node set + edge set).

## §2 Purpose & Authority Precedence

This matrix is the **single source of truth for relationships between governance templates**. Individual templates own their identity metadata; the matrix owns the graph.

Authority precedence:

1. **Matrix authoritative for the graph** — all inter-template relationships (execution dependencies, successors, replacements, audits, compatibility) SHALL be resolved from this matrix (R25).
2. **Template §1 Identity authoritative for the template** — a template's own identity fields (`template_id`, `current_version`, `lifecycle_state`, compatibility declarations) remain owned by the template body.
3. **Conflict = FAIL** — mismatch between a template's §1 Identity and this matrix is FAIL (R26), waivable only via §12.

## §3 Root Template Declaration

```yaml
root_templates: [GT-001]
```

A root template has no inbound `depends_on` edge and is the graph entry point for reachability analysis (MVAL-008, MVAL-010).

## §4 Relationship Registry

Formal declaration of every relationship kind permitted in this graph. All edges in §6 MUST use a relationship declared here (MVAL-011).

| Relationship | Direction | Cardinality | Blocking | Versioned | Notes |
|---|---|---|---|---|---|
| `depends_on` | directed | many → many | yes | yes | Execution dependency; target must be Active at runtime (§7). |
| `successor_of` | directed | one → many | no | no | Sequencing hint; supports branching successor sets. |
| `replaces` | directed | one → one | yes | yes | Lifecycle transition; source deprecates target at commit. |
| `audits` | directed | many → many | no | no | Audit scope assertion; non-blocking. |
| `optional_with` | non-directed | many → many | no | no | Optional co-use; informational. |
| `mutually_exclusive` | non-directed | many → many | yes | no | May not co-execute in the same pass. |
| `compatible_with` | non-directed | many → many | no | no | Advisory compatibility. |

**Semantic axes** (execution / validation / traceability / version_scope) are inherited verbatim from `GOVERNANCE_TEMPLATE_CAPABILITIES.md §Relationship Semantics`; the same operational meanings apply here at the template level.

## §5 Node Table

Each row is backfilled verbatim from the corresponding template's §1 Identity. MVAL-006 enforces equality.

| template_id | current_version | lifecycle_state | compatible_governance | compatible_template_standard | compatible_capabilities_registry |
|---|---|---|---|---|---|
| GT-001 | v1.1 | Active | v1.0 | v1.3 | — |
| GT-002 | v1.0 | Active | v1.0 | v1.3 | v1.0 |
| GT-003 | v1.0 | Active | v1.0 | v1.3 | v1.1 |
| GT-004 | v1.0 | Active | v1.0 | v1.4 | v1.1 |
| GT-005 | — | Planned | v1.0 | v1.4 | v1.1 |

Notes:
- GT-001 predates the Capabilities Registry; `compatible_capabilities_registry` is `—`.
- Planned nodes have no `current_version` until authored (§7).

## §6 Edge Table

`edge_id` is monotonic, append-only, and immutable. Retired edges retain their `edge_id` with `status: Retired`. Waivers (§12) and audit trails reference `edge_id`.

| edge_id | source | relationship | target | constraint | status | notes |
|---|---|---|---|---|---|---|
| EDGE-001 | GT-002 | `depends_on` | GT-001 | `>=1.1,<2.0` | Active | Stage 1 requires legacy reconciliation framework. |
| EDGE-002 | GT-003 | `depends_on` | GT-002 | `>=1.0,<2.0` | Active | Stage 2 requires Stage 1 outputs. |
| EDGE-003 | GT-004 | `depends_on` | GT-003 | `>=1.0,<2.0` | Active | Stage 3 requires Stage 2 sprint set. Activated by Pass 8.12.3. |
| EDGE-004 | GT-004 | `successor_of` | GT-003 | — | Active | Sequencing hint. Activated by Pass 8.12.3. |
| EDGE-005 | GT-005 | `depends_on` | GT-001 | `>=1.1,<2.0` | Planned | Audit framework base. |
| EDGE-006 | GT-005 | `audits` | GT-002 | — | Planned | Repository audit scope. |
| EDGE-007 | GT-005 | `audits` | GT-003 | — | Planned | Repository audit scope. |
| EDGE-008 | GT-005 | `audits` | GT-004 | — | Planned | Repository audit scope. |

## §7 Planned Node Semantics

- `Planned` nodes MAY appear as edge targets.
- `Planned` nodes MUST NOT satisfy runtime execution prerequisites.
- Only `Active` nodes (or `Deprecated` per §14 fallback) satisfy execution dependencies.
- An edge whose target is `Planned` emits severity `INFO` at validation time, not FAIL.

## §8 Successor Sets

Derived from `successor_of` edges. Supports branching (a template may declare multiple successors).

```yaml
successor_templates:
  GT-003: [GT-004]
```

## §9 Reverse Dependency Index

Auto-derived from the forward edge table; MVAL-009 enforces bidirectional consistency.

```yaml
depended_on_by:
  GT-001: [GT-002, GT-005]        # via EDGE-001, EDGE-005
  GT-002: [GT-003]                # via EDGE-002; audits (GT-005) tracked separately
  GT-003: [GT-004]                # via EDGE-003; successor_of/audits tracked separately
audited_by:
  GT-002: [GT-005]
  GT-003: [GT-005]
  GT-004: [GT-005]
```

## §10 Graph Invariants

- Acyclicity across the union `depends_on ∪ replaces ∪ successor_of`.
- Every edge target resolves to a node in §5.
- Every SemVer range parses and is satisfiable — or the target is `Planned`.
- Every `Active` template is reachable from at least one `root_templates` entry via `depends_on` traversal.

## §11 Validation Rules (MVAL-001..MVAL-012)

| ID | Check | Waivable |
|---|---|---|
| MVAL-001 | Rows in §6 unique by `edge_id`. | Yes |
| MVAL-002 | Referenced `template_id` values registered in §5. | **No** |
| MVAL-003 | Every SemVer range parses. | **No** |
| MVAL-004 | Graph acyclic across `depends_on ∪ replaces ∪ successor_of`. | **No** |
| MVAL-005 | `successor_of` targets registered in §5 (may be `Planned`). | Yes |
| MVAL-006 | Node metadata (§5) matches template §1 Identity — conflict = FAIL (R26). | Yes |
| MVAL-007 | No orphan `Active` templates (roots exempt). | Yes |
| MVAL-008 | `root_templates` resolves; each root has no inbound `depends_on`. | Yes |
| MVAL-009 | Reverse index (§9) consistent with forward edges (§6). | Yes |
| MVAL-010 | Every `Active` template reachable from at least one root. | Yes |
| MVAL-011 | Every relationship kind used in §6 declared in §4 Relationship Registry. | Yes |
| MVAL-012 | No duplicate semantic edges: same `(source, relationship, target)` with overlapping constraints. | Yes |

## §12 Waiver Schema

```yaml
waiver_id: WVR-NNN            # append-only, monotonic
edge_id: EDGE-NNN             # references §6
rule_id: MVAL-NNN | R26
reason: <string>
approved_by: <owner>
approval_date: YYYY-MM-DD
expires: YYYY-MM-DD | null    # null = permanent (must be explicit)
status: Active | Expired | Revoked
```

**Active waivers:** _(none)_

## §13 Machine-Readable Export & Generation Policy

Codified as **R27** in the Template Standard.

- **Direction:** Markdown → YAML only. Markdown is normative.
- **Overwrite:** wholesale regeneration on every commit that touches this markdown.
- **Manual edits to the YAML export are prohibited.** Divergence between markdown and YAML = FAIL.
- **Validation frequency:** at commit and at every governance verification pass.
- **Export path:** `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.yaml`.

## §14 Version Resolution

Given a `depends_on` constraint (SemVer range):

1. Select the **highest `Active` version** of the target template that satisfies the range.
2. On ties, apply SemVer 2.0 precedence rules.
3. If no `Active` version qualifies, fall back to the highest qualifying `Deprecated` version and emit `WARN`.
4. `Archived` and `Planned` versions NEVER satisfy execution prerequisites.

This rule is promoted to Standard-level in Template Standard v1.4 (previously local to GT-003 §14 S2).

## §15 Change Control

| Version | Change Summary | Governance | Standard | Lifecycle |
|---|---|---|---|---|
| v1.0 | Initial release. `schema_version: 1`, `graph_version: 1`. Backfills GT-001, GT-002, GT-003 as `Active` nodes; GT-004, GT-005 as `Planned`. Establishes edges EDGE-001..EDGE-008. | v1.0 | v1.4 | Active |
| v1.0.1 | Patch (SemVer): lifecycle-state transitions only. GT-004 node `Planned → Active` (`current_version: v1.0`); EDGE-003 and EDGE-004 `Planned → Active`. Structural schema unchanged (`schema_version: 1`); graph topology unchanged (`graph_version: 1`). | v1.0 | v1.4 | Active |

## §16 Audit Metadata

- **Originating pass:** 8.12.2-E v3.1
- **Verification:** Pass 8.12.2-E-V (10-item checklist) + Post-Implementation Repository Audit (Spec v1.0)
- **Confidence:** MEDIUM — D3 waiver in effect for missing repository revision identifiers (inherited from Pass 8.11.1-C).
- **Non-retainable content:** none in v1.0. Any future Mermaid diagrams SHALL be marked `retainable: false` and excluded from `asset_sha256`.
- **Update — Pass 8.12.3 (v1.0.1):** GT-004 activated; EDGE-003 and EDGE-004 transitioned to Active. Matrix invariant honored — no edge introduced, removed, or redirected. `graph_version` and `schema_version` unchanged.
