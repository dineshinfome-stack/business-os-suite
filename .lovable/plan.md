# Pass 8.12.2-E — Governance Template Dependency Matrix (v3.1)

> **Note.** The reviewer's six recommendations (stable edge IDs, `schema_version`, waiver schema, Planned semantics, formal relationship registry, MVAL-011/012) were already incorporated in v3. v3.1 keeps the v3 design intact and adds only the two extra columns the reviewer's relationship-registry table calls for (`blocking`, `versioned`) so §4 is a formal registry rather than a plain cardinality table. No other changes.

## Scope

**In scope**
- New asset: `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` (`version: v1.0`, `schema_version: 1`, `graph_version: 1`, Active).
- Derived companion: `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.yaml` (generated-from-markdown; markdown normative).
- Template Standard v1.3 → v1.4: R25 (Matrix Authority), R26 (Conflict = FAIL), R27 (YAML Generation Policy).
- Backfill rows: GT-001 v1.1, GT-002 v1.0, GT-003 v1.0; `Planned` rows for GT-004, GT-005.
- Registration in Registry, Index, `DOCUMENT_INDEX`, `_meta.json`.
- Verification (10-item) + Repository Audit.

**Out of scope**
- GT-004 authoring (Pass 8.12.3).
- Edits to GT-001/002/003 bodies.
- Capabilities Registry v1.1 changes.
- Governance Specification v1.0 changes.

## Deliverable 1 — Dependency Matrix Asset

Path: `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md`

### §1 Identity
```yaml
asset_id: GOV-DEP-MATRIX
version: v1.0              # document format
schema_version: 1          # structural schema
graph_version: 1           # topology
governance_specification: v1.0
template_standard: v1.4
lifecycle_state: Active
sha_scope_rule: "exclude sections marked retainable: false"
asset_sha256: sha256:...:computed-at-commit
```

Three independent version axes: `version`, `schema_version`, `graph_version`.

### §2 Purpose & Authority Precedence
Matrix authoritative for **the graph**; each template's `§1 Identity` authoritative for **its own** metadata. Conflicts = FAIL (R26).

### §3 Root Template Declaration
```yaml
root_templates: [GT-001]
```

### §4 Relationship Registry (formal)

| Relationship | Direction | Cardinality | Blocking | Versioned | Notes |
|---|---|---|---|---|---|
| `depends_on` | directed | many → many | yes | yes | Execution dependency. |
| `successor_of` | directed | one → many | no | no | Sequencing hint. |
| `replaces` | directed | one → one | yes | yes | Lifecycle transition; deprecates target. |
| `audits` | directed | many → many | no | no | Audit scope assertion. |
| `optional_with` | non-directed | many → many | no | no | Optional co-use. |
| `mutually_exclusive` | non-directed | many → many | yes | no | May not co-execute. |
| `compatible_with` | non-directed | many → many | no | no | Advisory compatibility. |

Semantic axes (execution / validation / traceability / version_scope) reuse Capabilities Registry §2.

### §5 Node Table
Per template: `template_id`, `current_version`, `lifecycle_state`, `compatible_governance`, `compatible_template_standard`, `compatible_capabilities_registry`. Backfilled verbatim from each template's §1 Identity.

### §6 Edge Table with Stable Edge IDs

`edge_id` is monotonic, append-only, immutable; retired edges keep their ID with `status: Retired`. Waivers and audit trails reference `edge_id`.

| edge_id | source | relationship | target | constraint | status | notes |
|---|---|---|---|---|---|---|
| EDGE-001 | GT-002 | `depends_on` | GT-001 | `>=1.1,<2.0` | Active | Stage 1 requires framework |
| EDGE-002 | GT-003 | `depends_on` | GT-002 | `>=1.0,<2.0` | Active | Stage 2 requires Stage 1 |
| EDGE-003 | GT-004 | `depends_on` | GT-003 | `>=1.0,<2.0` | Planned | |
| EDGE-004 | GT-004 | `successor_of` | GT-003 | — | Planned | |
| EDGE-005 | GT-005 | `depends_on` | GT-001 | `>=1.1,<2.0` | Planned | |
| EDGE-006 | GT-005 | `audits` | GT-002 | — | Planned | |
| EDGE-007 | GT-005 | `audits` | GT-003 | — | Planned | |
| EDGE-008 | GT-005 | `audits` | GT-004 | — | Planned | |

### §7 Planned Node Semantics
- `Planned` nodes MAY appear as edge targets.
- `Planned` nodes MUST NOT satisfy runtime execution prerequisites.
- Only `Active` (or `Deprecated` per §14 fallback) satisfies execution dependencies.
- Edge with a `Planned` target emits `INFO`, not FAIL.

### §8 Successor Sets
`successor_templates: [...]` per source; supports branching.

### §9 Reverse Dependency Index
Auto-derived `depended_on_by[T]`. Rendered in markdown and YAML. MVAL-009 enforces forward/reverse consistency.

### §10 Graph Invariants
Acyclicity across `depends_on ∪ replaces ∪ successor_of`; targets resolve; SemVer ranges parse and are satisfiable or target is `Planned`; every Active template reachable from a root.

### §11 Validation Rules (MVAL-001..MVAL-012)

| ID | Check |
|---|---|
| MVAL-001 | Rows unique by `edge_id`. |
| MVAL-002 | Referenced `template_id` values registered. |
| MVAL-003 | SemVer ranges parse. |
| MVAL-004 | Graph acyclic across `depends_on ∪ replaces ∪ successor_of`. |
| MVAL-005 | Successor targets registered or `Planned`. |
| MVAL-006 | Node metadata matches template §1 Identity — conflict = FAIL (R26). |
| MVAL-007 | No orphan Active templates (roots exempt). |
| MVAL-008 | `root_templates` resolves; roots have no inbound `depends_on`. |
| MVAL-009 | Reverse index consistent with forward edges. |
| MVAL-010 | Every Active template reachable from a root. |
| MVAL-011 | Every relationship kind used is declared in §4 Relationship Registry. |
| MVAL-012 | No duplicate semantic edges: same `(source,relationship,target)` with overlapping constraints. |

Non-waivable: MVAL-002, MVAL-003, MVAL-004.

### §12 Waiver Schema

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

### §13 Machine-Readable Export & Generation Policy

- **Direction:** Markdown → YAML only.
- **Overwrite:** wholesale regeneration on every commit touching the markdown.
- **Manual edits prohibited;** YAML/markdown divergence = FAIL.
- **Validation frequency:** at commit and at every governance verification pass.
- Codified as **R27** in the Standard.

### §14 Version Resolution
Highest `Active` version satisfying the range; SemVer 2.0 precedence for ties; `Deprecated` eligible only if no `Active` qualifies (emit WARN); `Archived`/`Planned` never satisfy execution prerequisites.

### §15 Change Control & §16 Audit Metadata
Standard shape. v1.0 initial release; `schema_version: 1`, `graph_version: 1`.

Mermaid DAG marked `retainable: false`, excluded from `asset_sha256`.

## Deliverable 2 — Template Standard v1.3 → v1.4

Edits to `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md`:

- Bump `template_standard: v1.4`.
- **R25 — Matrix Authority.** Automation resolving inter-template relationships SHALL consult `GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX` first; template-local declarations are advisory and cross-checked by MVAL-006.
- **R26 — Conflict = FAIL.** Mismatch between template §1 Identity and the matrix is FAIL (`exit_code 10`), waivable only via §12 waiver.
- **R27 — YAML Generation Policy.** Markdown normative; YAML one-way; manual edits prohibited; divergence = FAIL.
- Promote the version-resolution rule (previously GT-003 §14 S2) to Standard-level.
- Change Control: v1.3 → v1.4 (additive; existing template bodies unchanged).

## Deliverable 3 — Registration Surface Updates

- `GOVERNANCE_TEMPLATE_REGISTRY.md` — Companion Assets row for Dependency Matrix v1.0 / `schema_version: 1` / `graph_version: 1`; bump Standard reference to v1.4.
- `GOVERNANCE_TEMPLATE_INDEX.md` — Dependency Matrix under Companion Registries.
- `docs/DOCUMENT_INDEX.md` — register asset (and YAML export).
- `docs/_meta.json` — sidebar entry under Governance.
- `REPOSITORY_MAP.md` — verify existing coverage; expected no modification.

## Deliverable 4 — Verification (Pass 8.12.2-E-V)

Verification Metadata header + 10-item checklist:

1. Asset frontmatter valid (Standard v1.4 keys; `version`, `schema_version`, `graph_version` all present).
2. `asset_sha256` computed excluding `retainable: false`; YAML export structurally equal to markdown-derived structure (R27).
3. Node table matches GT-001/GT-002/GT-003 §1 Identity verbatim (MVAL-006).
4. Edge table: `edge_id` unique/append-only; every relationship kind in §4 (MVAL-011); no duplicate semantic edges (MVAL-012); every target resolves (MVAL-002).
5. Graph acyclic; roots resolve; every Active template reachable (MVAL-004/007/008/010).
6. Reverse index consistent (MVAL-009).
7. SemVer ranges parse and are satisfiable (MVAL-003).
8. Registration surfaces updated (Registry, Index, DOCUMENT_INDEX, `_meta.json`).
9. Template Standard v1.4 published; R25/R26/R27 present; Change Control appended.
10. No conflicts between any template §1 Identity and the matrix (else FAIL — R26); waiver appendix present (may be empty).

Then **Post-Implementation Repository Audit (Spec v1.0)** — expected `READY`.

### Verification Summary shape
Checklist Items / Passed / Remediated / Failed / Outstanding Risks / Repository Status / Next Pass.

## Files touched

Created:
- `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md`
- `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.yaml`

Updated:
- `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md` (v1.3 → v1.4; R25, R26, R27; promoted version-resolution rule)
- `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md`
- `docs/15-governance/GOVERNANCE_TEMPLATE_INDEX.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/_meta.json`

Never modified:
- GT-001, GT-002, GT-003 bodies
- Capabilities Registry v1.1
- Governance Specification v1.0
- Module PRDs, Sprint PRDs, Baselines

## Next Pass

**Pass 8.12.3 — GT-004 Baseline Consolidation Template**, authored against the matrix: EDGE-003 / EDGE-004 targets transition from `Planned` to `Active` at commit; GT-005 rows remain `Planned` until 8.12.4.
