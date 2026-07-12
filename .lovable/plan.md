# Pass 8.12.3 — GT-004 Baseline Consolidation Template (Governance Asset) — v3

Author GT-004 Baseline Consolidation as an `Active` governance template so all future Stage 3 invocations reduce to *"Execute GT-004 for MOD-NNN"*. Governance-only pass: no Module Baseline is authored or modified.

> **v3 changes:** explicit activation sequence; full-scope rollback order covering Dependency Matrix, Registry, and Governance Index; §14 result enum `PASS | FAIL | WAIVED`; documented `v1.0 → v1.0.1` patch-level rationale; stable **TVAL-001..TVAL-012** verification identifiers; execution-manifest normativity note; event-catalog path consistency assertion.

## Non-Goals (hard guardrails)

SHALL NOT: execute GT-004 for any module; modify GT-001/GT-002/GT-003 bodies; modify Governance Specification v1.0; modify Template Standard v1.4; modify Capabilities Registry v1.1; modify Module PRDs, Sprint Plans, Sprint PRDs, or existing Baselines; modify historical execution logs; introduce, remove, or redirect edges in the Dependency Matrix (only lifecycle-state transitions on `Planned` entries).

## Deterministic Pass Sequence

The pass proceeds in this exact order; each step is a barrier for the next.

1. **Author** `docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md` with `lifecycle_state: Draft` and compute `template_sha256`.
2. **Template Validation** — run the 12 TVAL checks (§Deliverable 4).
3. **Repository Audit** — Post-Implementation Repository Audit (Spec v1.0).
4. **Activate** — flip GT-004 to `lifecycle_state: Active` in the template body **and** transition GT-004 node + EDGE-003/EDGE-004 to `Active` in the Dependency Matrix; regenerate matrix `asset_sha256`; regenerate YAML export.
5. **Register** — update Registry, Index, `DOCUMENT_INDEX.md`, `_meta.json`.
6. **Record Execution** — audit trail entry in §16 of GT-004 and §15 of the Dependency Matrix.

Steps 4–6 SHALL execute only if Steps 2 and 3 return PASS. Failure at any step triggers §Rollback.

## Deliverable 1 — GT-004 Template

Path: `docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`

Structure: canonical **16-section** governance template (mirrors GT-003; conforms to Template Standard v1.4).

### §1 Identity

```yaml
template_id: GT-004
template_uuid: <generated at build>
template_name: Baseline Consolidation
template_version: v1.0
governance_specification: v1.0
template_standard: v1.4
compatible_governance: ">=1.0,<2.0"
compatible_template_standard: ">=1.4,<2.0"
compatible_capabilities_registry: ">=1.1,<2.0"
schema_version: 1
lifecycle_state: Active     # set at Step 4 of the deterministic sequence
owner: Architecture Office
classification: Governance Template
sha_scope_rule: "exclude sections marked retainable: false"
template_sha256: sha256:<computed-at-commit>
capabilities:
  - { id: CAP-005, slug: baseline-consolidation }
  - { id: CAP-009, slug: verification }
  - { id: CAP-008, slug: repository-audit }
  - { id: CAP-007, slug: registration }
depends_on_templates:
  - { id: GT-003, minimum_version: ">=1.0,<2.0" }
```

Capabilities resolve verbatim against Capabilities Registry v1.1 (CAP-005..CAP-009 present). **No runtime fallback**: any absent `CAP-NNN` at Preflight yields `CAPABILITY-NOT-REGISTERED` (exit_code 20). Introducing a new capability requires a separate registry pass.

### §2–§16

- §2 Purpose — Stage 3 consolidation contract.
- §3 Scope — consolidate completed Sprint PRDs into a Module Baseline; validate cross-sprint consistency; establish Baseline as authoritative implementation document.
- §4 Inputs — Module PRD, Sprint Plan, Sprint PRDs, `docs/MODULE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`, `docs/ADR_IMPACT_MATRIX.md`, `docs/02-architecture/event-catalog.md` (canonical), Dependency Matrix, Capabilities Registry; optional: previous Baseline.
- §5 Outputs & Excluded Outputs —
  - **Creates:** `docs/40-module-baselines/MOD<NNN>_<NAME>_BASELINE_v1.md`.
  - **Updates:** `docs/40-module-baselines/README.md`, `docs/DOCUMENT_INDEX.md`, `docs/MODULE_BASELINE_CATALOG.md`, `docs/_meta.json`.
  - **Never modifies:** Module PRD, Sprint Plan, Sprint PRDs, Governance Templates, Governance Specification, Template Standard, Capabilities Registry, Dependency Matrix.
- §6 Preconditions — Stage 1 frozen; Stage 2 complete; Dependency Matrix EDGE-003 Active; no open FAIL findings on upstream artifacts.
- §7 Execution Workflow — 9 deterministic idempotent steps: Preflight → Dependency Resolution → Sprint Collection → Cross-Sprint Validation → Baseline Assembly → Registration → Verification → Repository Audit → Completion.
- §8 Execution State Machine — `preflight → resolving → collecting → validating → assembling → registering → verifying → auditing → complete | failed`; explicit rollback on failure.
- §9 Failure Object Schema + Runtime Rollback Rule — standard `Finding ID | Severity | Evidence | Resolution | Status`. **Runtime rollback (future GT-004 executions):** if Verification (Step 7) or Repository Audit (Step 8) fails after Registration (Step 6), the created Baseline and the four registration surfaces (`_meta.json` → `MODULE_BASELINE_CATALOG.md` → `DOCUMENT_INDEX.md` → `README.md`) SHALL be reverted in reverse order before Repository Status is evaluated.
- §10 Baseline Template Validation Rules — **VAL-001..VAL-016** (16): sprint completeness; capability coverage vs Sprint Plan; engine reconciliation vs Engine Usage Matrix; ADR reconciliation vs ADR Impact Matrix; event reconciliation vs `docs/02-architecture/event-catalog.md`; cross-reference integrity; no duplicated requirements; no orphan capabilities; registration completeness; traceability preservation; metadata validity; Baseline 16-section structural conformance; dependency resolution via Dependency Matrix (R25); placeholder discipline; repository consistency; Baseline determinism.
- §11 Automation Exit Codes — `0` OK, `10` R26 conflict, `20` DEPENDENCY-FAIL / CAPABILITY-NOT-REGISTERED, `30` VAL-fail, `40` audit-fail.
- §12 Execution Manifest —
  ```yaml
  # The Execution Manifest is NORMATIVE for future Stage 3 executions
  # (any "Execute GT-004 for MOD-NNN") and INFORMATIVE for this governance
  # pass (Pass 8.12.3), which authors the template only and creates no Baseline.
  reads:
    - docs/20-module-prds/**
    - docs/30-sprint-prds/**
    - docs/MODULE_CATALOG.md
    - docs/ENGINE_USAGE_MATRIX.md
    - docs/ADR_IMPACT_MATRIX.md
    - docs/02-architecture/event-catalog.md
    - docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md
    - docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md
  creates:
    - docs/40-module-baselines/MOD<NNN>_<NAME>_BASELINE_v1.md
  updates:
    - docs/40-module-baselines/README.md
    - docs/DOCUMENT_INDEX.md
    - docs/MODULE_BASELINE_CATALOG.md
    - docs/_meta.json
  never_modifies:
    - docs/20-module-prds/**
    - docs/30-sprint-prds/**
    - docs/15-governance/**
    - docs/MODULE_IMPLEMENTATION_WORKFLOW.md
  ```
- §13 Machine-Readable Metadata — `execution_type: Stage3`; `validation_checks: 16`; `audit_required: true`; `baseline_required: true`; `next_templates: [GT-005]`.
- §14 Compatibility Matrix — one v1.0 row using enum **`result: PASS | FAIL | WAIVED`**; recorded value: `PASS` (governance v1.0, standard v1.4, capabilities ≥ v1.1).
- §15 Example — `retainable: false` (excluded from `template_sha256`).
- §16 Change Control — Audit Trail: v1.0, Pass 8.12.3, Active.

## Deliverable 2 — Dependency Matrix Transition

Edit `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` at Step 4:

- **§5 Node Table**: GT-004 `Planned → Active`; `current_version: v1.0`.
- **§6 Edge Table**: `EDGE-003` and `EDGE-004` `Planned → Active`. EDGE-005..EDGE-008 remain `Planned`.
- **§9 Reverse Dependency Index**: no structural change.
- **§15 Change Control**: append row `v1.0 → v1.0.1` — **patch-level (SemVer)**: lifecycle state changed on existing nodes/edges; structural schema unchanged; graph topology unchanged.
- **§16 Audit Metadata**: append Pass 8.12.3 note.
- Recompute `asset_sha256`.

**Dependency Matrix Invariant (this pass):** activation SHALL NOT introduce, remove, or redirect any edge; only lifecycle-state transitions on existing `Planned` entries are permitted.

- `graph_version` remains `1` (topology unchanged).
- `schema_version` remains `1` (structural schema unchanged).
- Document `version` bumps **v1.0 → v1.0.1 (patch)** because only lifecycle state changed.

Regenerate `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.yaml` from the updated markdown (R27, one-way). **YAML derivation constraint:** the YAML SHALL contain no fields absent from the markdown source; any surplus field is a divergence and fails R27.

## Deliverable 3 — Registration Surface Updates (Step 5)

- `GOVERNANCE_TEMPLATE_REGISTRY.md` — GT-004 record: `Current Version: v1.0`, `Status: Active`, `Compatible Template Standard: v1.4`, `Compatible Capabilities Registry: v1.1`, path, UUID, SHA reference, First/Latest Release `v1.0 — Pass 8.12.3`, Notes.
- `GOVERNANCE_TEMPLATE_INDEX.md` — GT-004 row: `v1.0 | Active`.
- `docs/DOCUMENT_INDEX.md` — add `GT-004 — Baseline Consolidation Template`.
- `docs/_meta.json` — add `GT-004 Baseline Consolidation` under `15 Governance`.

## Rollback (this pass)

If Template Validation (Step 2) or Repository Audit (Step 3) fails, **Steps 4–6 are never executed** — nothing to roll back beyond removing the Draft GT-004 file.

If any later failure surfaces (e.g. YAML regeneration error at Step 4, registration write error at Step 5, or a post-registration audit re-check), rollback proceeds in **reverse order of the deterministic sequence**:

1. Revert `_meta.json`.
2. Revert `DOCUMENT_INDEX.md`.
3. Revert `GOVERNANCE_TEMPLATE_INDEX.md`.
4. Revert `GOVERNANCE_TEMPLATE_REGISTRY.md`.
5. Revert `GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.yaml`.
6. Revert `GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` (node/edge status, `asset_sha256`, §15/§16 rows).
7. Flip GT-004 body `lifecycle_state: Active → Draft` (or delete file if Step 1 failed).

Registry, Governance Index, and Dependency Matrix are explicitly in-scope for rollback because Step 4 mutates them.

## Deliverable 4 — Verification (Pass 8.12.3-V, TVAL-001..TVAL-012)

Verification Metadata header + 12 stable-ID checks:

| ID | Check |
|---|---|
| TVAL-001 | Template Standard v1.4 conformance (16 sections present and ordered). |
| TVAL-002 | Identity completeness (frontmatter keys, UUID, SHA excludes `retainable: false`). |
| TVAL-003 | Validation Rules enumerate 16 checks with PASS/FAIL semantics. |
| TVAL-004 | Compatibility Matrix row present for v1.0 with `result: PASS`. |
| TVAL-005 | Dependency Matrix sync: GT-004 Active; EDGE-003/EDGE-004 Active; MVAL-006 PASS; matrix invariant PASS (`graph_version=1`, `schema_version=1`; no edge changes). |
| TVAL-006 | `template_sha256` computed and recorded. |
| TVAL-007 | Registration surfaces updated (Registry, Index, `DOCUMENT_INDEX`, `_meta.json`). |
| TVAL-008 | YAML export regenerated; R27 divergence PASS; derivation-constraint PASS (no surplus fields). |
| TVAL-009 | No governance drift (Standard v1.4, Spec v1.0, Capabilities Registry v1.1 unchanged). |
| TVAL-010 | No module artifacts modified (`20-module-prds/**`, `30-sprint-prds/**`, `40-module-baselines/**` untouched). |
| TVAL-011 | Post-Implementation Repository Audit (Spec v1.0) → READY. |
| TVAL-012 | READY status preserved; confidence MEDIUM (D3 waiver only). |

### Verification Summary
Checklist Items / Passed / Remediated / Failed / Outstanding Risks / Repository Status / Next Pass.

## Event Catalog Path Consistency

`docs/02-architecture/event-catalog.md` is the canonical event catalog path repository-wide. GT-004 uses this path in §4, §10, and §12. Any future template (GT-005+) or matrix update referencing the event catalog SHALL use the same path. No cross-template edits are made in this pass; consistency is asserted, not retrofitted.

## Files touched

**Created:** `docs/15-governance/templates/GT-004_BASELINE_CONSOLIDATION.md`

**Updated:** `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md`, `.yaml`, `GOVERNANCE_TEMPLATE_REGISTRY.md`, `GOVERNANCE_TEMPLATE_INDEX.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`.

**Never modified:** GT-001/002/003 bodies, Template Standard v1.4, Governance Specification v1.0, Capabilities Registry v1.1, Module PRDs, Sprint Plans, Sprint PRDs, Module Baselines, `MODULE_IMPLEMENTATION_WORKFLOW.md`.

## Success Criteria

- GT-004 is `Active` (post-verification, per deterministic sequence).
- Dependency Matrix: GT-004 Active; EDGE-003 & EDGE-004 Active; GT-005 rows remain `Planned`; `graph_version` & `schema_version` unchanged; document `version: v1.0.1` (patch).
- YAML regenerated (R27 + derivation-constraint PASS).
- TVAL-001..TVAL-012 all PASS; Repository Audit PASS.
- No Module PRDs, Sprint Plans, Sprint PRDs, or Baselines modified.
- Future Stage 3 executions invokable as *"Execute GT-004 for MOD-NNN"*.

## Roadmap

1. **Pass 8.12.4** — GT-005 Repository Audit Template (activates EDGE-005..EDGE-008).
2. **Governance Framework v1.0 Freeze** — lock GT-001..GT-005, Template Standard v1.4, Capabilities Registry v1.1, Dependency Matrix.
3. Resume module implementation via GT-002 / GT-003 / GT-004 / GT-005.
