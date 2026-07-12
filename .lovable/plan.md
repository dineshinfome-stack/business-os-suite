# Pass 8.12.2 — GT-003 Sprint Authoring Template (Governance Asset) — v3

## Objective

Author **GT-003 Sprint Authoring** as an Active governance template so future Stage 2 Sprint PRD executions can be invoked by reference (`"Execute GT-003 for SPR-MOD-NNN-XXX"`) instead of embedding Sprint PRD governance in every prompt.

**Strict scope**: Template asset creation + minimal additive Capabilities-registry edit to record `CAP-004` relationships. No Sprint PRD, Module PRD, or Baseline is authored or modified. Governance Specification v1.0 unchanged. GT-001 / GT-002 bodies unchanged.

## Changes from v2 (Additive Refinements S1–S7)

- **S1 — Canonical Capability Identifiers.** The template `capabilities` block SHALL carry both the stable `capability_id` and its resolved `slug` so slug refinements never invalidate the template:
  ```yaml
  capabilities:
    - id: CAP-004
      slug: sprint-authoring     # primary
    - id: CAP-007
      slug: registration
    - id: CAP-009
      slug: verification
    - id: CAP-008
      slug: repository-audit
  ```
  Automation resolves by `id`; `slug` is informational and MUST match the registry entry at the pinned `compatible_capabilities_registry` range.
- **S2 — Deterministic Version Resolution Rule.** Add to §14 Compatibility Matrix a normative rule: *"When multiple registered versions satisfy a compatibility range, automation SHALL select the highest non-deprecated `Active` version. Ties resolve by SemVer 2.0 precedence. `Deprecated` and `Archived` versions are eligible only if no `Active` version satisfies the range, in which case the invocation MUST emit a `WARN` finding."*
- **S3 — VAL-013 split.** Replace the single VAL-013 with two sibling checks reported under the same finding class but distinguishable in diagnostics:
  - **VAL-013A** — Template dependencies satisfied (every `depends_on_templates` entry resolves to an `Active` registered template within its `minimum_version` range).
  - **VAL-013B** — Upstream sprint dependencies satisfied (any sprint listed as an upstream in the Sprint Plan exists in the repository and is `Active`).
  - Total Sprint Template Validation checks now = **15** (`VAL-001..VAL-012, VAL-013A, VAL-013B, VAL-014`). Framework Validation count remains **13**.
- **S4 — SHA scope formalization.** Add a normative rule (top of §1 / repeated in §16 Change Control):
  *"`template_sha256` is computed over all sections not marked `retainable: false`. Sections marked non-retainable (illustrative examples, ephemeral diagnostics) are excluded. This rule generalizes across all governance templates and MUST NOT be redefined per-template."*
  For GT-003, §15 Example carries `retainable: false` and is the only excluded section.
- **S5 — Machine-readable Execution Prerequisites.** Add to §13:
  ```yaml
  execution_prerequisites:
    requires_stage1: true
    requires_module_prd: true
    requires_sprint_plan: true
    requires_capabilities_registry_min: ">=1.1,<2.0"
  ```
- **S6 — Success Criterion — dependency resolution.** Add: *"All `depends_on_templates` entries resolve to `Active` template versions satisfying declared version constraints at authoring time and at every future GT-003 invocation."* Complements VAL-013A.
- **S7 — Registry-bump rationale documented.** In §14 Compatibility Matrix and in the Capabilities Registry Change Control row for v1.1, explicitly state: *"GT-003 requires Capabilities Registry v1.1 because it introduces the first `depends_on` edges (CAP-004 → CAP-001/CAP-002/CAP-003). Registries at v1.0 lack those edges and cannot satisfy VAL-013A."*

Retained from v2: R1 (dual validation surfaces), R2 (abstracted registration surface), R3 (deterministic REPOSITORY_MAP action), R4 (SemVer-versioned template deps), R5 (`reads` in Execution Manifest), R6 (Audit Metadata block), R7 (`dependency_semantics`), R8 (`next_templates` successor set).

## Non-Goals (Hard Guardrails)

- SHALL NOT execute GT-003 for any sprint.
- SHALL NOT modify GT-001, GT-002, or the Governance Specification.
- SHALL NOT modify the 16-section structure of `GOVERNANCE_TEMPLATE_STANDARD.md`.
- SHALL NOT author or modify any Module PRD, Sprint PRD, Sprint Plan, or Baseline.
- SHALL NOT retire, renumber, or re-slug any existing `CAP-NNN`.
- SHALL NOT introduce `supersedes` edges.
- SHALL NOT introduce relationship cycles.
- SHALL NOT bump Standard v1.3 (no new rules introduced; S4's SHA rule is a *clarification* of existing behavior, recorded in GT-003 and cross-referenced from the Standard's next Minor bump if desired — not required this pass).

## Deliverables

### Created
1. `docs/15-governance/templates/GT-003_SPRINT_AUTHORING.md` (v1.0, Active).

### Updated
2. `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` — Minor bump `v1.0 → v1.1`:
   - Add `depends_on: [CAP-001, CAP-002, CAP-003]` on `CAP-004`.
   - Append Change Control row for v1.1 with S7 rationale text.
   - Reconfirm `depends_on ∪ supersedes` acyclicity.
3. `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` — GT-003 `Planned → Active`; Capabilities row → v1.1.
4. `docs/15-governance/GOVERNANCE_TEMPLATE_INDEX.md` — GT-003 `v1.0 / Active`; Capabilities `v1.1`.
5. `docs/15-governance/GOVERNANCE_TEMPLATE_LIFECYCLE.md` — informational note.

### Registration
6. `docs/DOCUMENT_INDEX.md` — register GT-003.
7. `docs/_meta.json` — sidebar entry for GT-003.
8. `docs/REPOSITORY_MAP.md` — action per R3 (verify; no modification expected).

## Template Identity (Header §1)

```yaml
template_id: GT-003
template_uuid: <UUIDv4 generated at authoring time>
template_name: Sprint Authoring
template_version: v1.0
governance_specification: v1.0
template_standard: v1.3
compatible_governance: ">=1.0,<2.0"
compatible_template_standard: ">=1.3,<2.0"
compatible_capabilities_registry: ">=1.1,<2.0"   # per S7: v1.1 required for CAP-004.depends_on
schema_version: 1
lifecycle_state: Active
owner: Architecture Office
classification: Governance Template
sha_scope_rule: "exclude sections marked retainable: false"   # S4
template_sha256: <computed per sha_scope_rule>
capabilities:                                                 # S1
  - id: CAP-004
    slug: sprint-authoring
  - id: CAP-007
    slug: registration
  - id: CAP-009
    slug: verification
  - id: CAP-008
    slug: repository-audit
depends_on_templates:
  - id: GT-002
    minimum_version: ">=1.0,<2.0"
```

## GT-003 Document Structure (16 sections, per Standard v1.3)

§1 Identity · §2 Purpose · §3 Scope · §4 Inputs · §5 Outputs & Excluded Outputs · §6 Preconditions · §7 Execution Workflow · §8 Execution State Machine · §9 Failure Object Schema · §10 Sprint Template Validation Rules (VAL-001..VAL-012, VAL-013A, VAL-013B, VAL-014 — **15** checks per S3) · §11 Automation Exit Codes · §12 Execution Manifest (`reads`/`creates`/`updates`/`never_modifies`/`repository_map`) · §13 Machine-Readable Metadata (incl. `execution_prerequisites`, `dependency_semantics`, `next_templates`) · §14 Compatibility Matrix (incl. version-resolution rule per S2 and S7 rationale) · §15 Example (`retainable: false`; excluded from SHA per S4) · §16 Change Control + Audit Metadata block (per R6).

### §10 Sprint Template Validation Rules (15, stable IDs)

| ID | Check |
|---|---|
| VAL-001 | Sprint ID (`SPR-MOD-NNN-XXX`) unique across repository |
| VAL-002 | Originating capability exists in Module PRD Capability Allocation Matrix |
| VAL-003 | Capability allocated to exactly one sprint |
| VAL-004 | Engines subset of Module PRD engine union |
| VAL-005 | ADRs subset of Module PRD ADR union |
| VAL-006 | Events subset of Module PRD event union |
| VAL-007 | Acceptance criteria complete (non-empty, testable) |
| VAL-008 | Deliverables complete |
| VAL-009 | Registration surfaces updated |
| VAL-010 | Bidirectional traceability (capability ↔ sprint ↔ deliverable) |
| VAL-011 | No unresolved placeholders (`<...>` = 0) |
| VAL-012 | Frontmatter metadata valid |
| **VAL-013A** | Template dependencies satisfied (each `depends_on_templates` resolves to `Active` registered template within its `minimum_version` range) |
| **VAL-013B** | Upstream sprint dependencies satisfied (upstream sprints declared in Sprint Plan exist and are `Active`) |
| VAL-014 | Repository consistency (path conventions; no orphan refs) |

### §11 Automation Exit Codes

`0` OK · `10` Validation failure · `20` Dependency failure · `30` Audit failure · `40` Registration failure · `50` Preflight failure.

### §12 Execution Manifest

```yaml
reads:
  - docs/20-module-prds/<module-slug>/MODULE_PRD.md
  - docs/30-sprint-prds/<module-slug>/MOD-<NNN>_SPRINT_PLAN.md
  - docs/MODULE_CATALOG.md
  - docs/10-erp-core/ENGINE_CATALOG.md
  - docs/11-adrs/ADR_INDEX.md
  - docs/02-architecture/event-catalog.md
  - docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md
creates:
  - docs/30-sprint-prds/<module-slug>/SPR-MOD-<NNN>-<XXX>-<sprint-slug>.md
updates:
  - docs/30-sprint-prds/<module-slug>/README.md
  - <sprint-registration-surface>       # Sprint Catalog if present; else authoritative equivalent
  - docs/DOCUMENT_INDEX.md
  - docs/_meta.json
never_modifies:
  - docs/20-module-prds/**
  - docs/40-module-baselines/**
  - docs/15-governance/**
  - docs/MODULE_IMPLEMENTATION_WORKFLOW.md
repository_map:
  action: verify
  expected_modification: none
  verification: "existing registration covers docs/15-governance/templates/"
```

### §13 Machine-Readable Metadata

```yaml
execution_type: Stage2
validation_checks: 15                # Sprint Template Validation (S3: VAL-013 split)
framework_validation_checks: 13      # Template (asset) Validation
audit_required: true
baseline_required: false
execution_prerequisites:             # S5
  requires_stage1: true
  requires_module_prd: true
  requires_sprint_plan: true
  requires_capabilities_registry_min: ">=1.1,<2.0"
next_templates:
  - id: GT-004
    role: baseline-consolidation
  - id: GT-005
    role: repository-audit
dependency_semantics:
  depends_on_templates:
    kind: execution-dependency
    validation: blocking
  depends_on_capabilities:
    kind: validation-dependency
    validation: blocking
version_resolution:                  # S2
  rule: "highest Active version satisfying range; SemVer 2.0 precedence"
  fallback: "Deprecated/Archived eligible only if no Active version qualifies; emit WARN"
```

### §14 Compatibility Matrix

`v1.0 | governance v1.0 | template_standard v1.3 | capabilities_registry v1.1 | matrix_entry-001 | PASS`.

Includes S2 version-resolution rule and S7 rationale: *"GT-003 requires Capabilities Registry v1.1 because it introduces the first `depends_on` edges (CAP-004 → CAP-001/CAP-002/CAP-003). Registries at v1.0 lack those edges and cannot satisfy VAL-013A."*

## Capabilities Registry v1.0 → v1.1 (Minor)

Single-row edit on `CAP-004`; graph acyclic. Change Control row per S7:

| Version | Change | Governance | Lifecycle |
|---|---|---|---|
| v1.1 | Add `depends_on` edges on CAP-004 (→ CAP-001, CAP-002, CAP-003) to support GT-003 Sprint Authoring. GT-003 requires v1.1 because v1.0 lacks these edges and cannot satisfy VAL-013A. | v1.0 | Active |

## Execution Workflow (this pass)

1. **Preflight** — GT-001 Active (v1.1); GT-002 Active (v1.0); Standard v1.3; Capabilities registry v1.0; GT-003 row `Planned`; no `docs/30-sprint-prds/` touched.
2. **Amend Capabilities Registry** v1.0 → v1.1 (CAP-004 edit + Change Control row with S7 rationale).
3. **Author** `docs/15-governance/templates/GT-003_SPRINT_AUTHORING.md`; generate `template_uuid`; mark §15 with `retainable: false`.
4. **Compute** `template_sha256` per `sha_scope_rule` (S4) — over all sections not marked `retainable: false` (excludes §15 only).
5. **Update** REGISTRY, INDEX, LIFECYCLE, DOCUMENT_INDEX, `_meta.json`; **verify** REPOSITORY_MAP per R3.
6. **Template Validation (Framework, 13 checks)**:
   (a) 16 sections present & ordered · (b) Header complete incl. `template_uuid`, `capabilities` with `id`+`slug` pairs (S1), spec/standard/registry compat, versioned `depends_on_templates` · (c) every capability `id` resolves to an `Active` registry row and its `slug` matches at the pinned registry range · (d) VAL-001..VAL-012, VAL-013A, VAL-013B, VAL-014 enumerated (15 total) with stable IDs · (e) Compatibility Matrix cites Standard v1.3, Governance v1.0, Capabilities Registry v1.1; version-resolution rule (S2) and S7 rationale present · (f) Audit Metadata block present per R6 · (g) §15 marked `retainable: false`; SHA scope rule (S4) declared and honored · (h) SemVer ranges parseable; exit codes + full Execution Manifest present · (i) `governance_specification` & `template_standard` concrete · (j) No Standard bump attempted · (k) `CAP-004.depends_on` targets resolve to Active rows · (l) `depends_on ∪ supersedes` acyclic · (m) `execution_prerequisites`, `dependency_semantics`, `next_templates`, `version_resolution` present and well-formed.
7. **Repository Audit (Spec v1.0)** — evidence rows: Governance Spec v1.0 unchanged; GT-001/GT-002 bodies unchanged; Standard v1.3 unchanged; Capabilities Registry v1.0 → v1.1 Minor additive-only with S7 rationale; GT-003 `Active`; no module/sprint/baseline touched; historical logs unchanged; `_meta.json` valid JSON; REPOSITORY_MAP unchanged. Expected: `READY`, Confidence `MEDIUM` (D3 waiver).
8. **Append** execution record to `.lovable/plan.md`.

## Verification Summary (target)

| Checklist Items | Passed | Remediated | Failed | Outstanding Risks | Repository Status | Confidence | Next Pass |
|---|---|---|---|---|---|---|---|
| 13 Framework Validation + audit evidence rows | 13 | 0 | 0 | None | READY | MEDIUM (D3 waiver) | Pass 8.12.3 — GT-004 Baseline Consolidation |

Sprint Template Validation (15 checks) is the runtime contract; not executed this pass.

## Success Criteria

- `GT-003_SPRINT_AUTHORING.md` at `v1.0`, `Active`, conforms to Standard v1.3.
- Framework Validation (13) and Sprint Template Validation (15, per S3) are exposed as distinct surfaces without conflation.
- `capabilities` block uses canonical `id`+`slug` pairs (S1); every `id` resolves to an `Active` row.
- SHA scope rule (S4) declared once and honored; §15 is the only non-retainable section in v1.0.
- `execution_prerequisites` (S5), `version_resolution` (S2), `dependency_semantics` (R7), and `next_templates` (R8) all present in §13.
- **All `depends_on_templates` resolve to `Active` template versions satisfying declared version constraints** (S6) — verified at authoring and mandated at every future invocation via VAL-013A.
- Capabilities Registry at `v1.1` with `CAP-004.depends_on = [CAP-001, CAP-002, CAP-003]`; Change Control row carries S7 rationale; graph acyclic.
- Execution Manifest carries `reads` (R5), abstracted registration surface (R2), and deterministic REPOSITORY_MAP action (R3).
- GT-001, GT-002, Standard v1.3, Governance Specification v1.0 unchanged.
- No Sprint PRD, Module PRD, or Baseline authored or modified.
- Future Stage 2 prompts reduce to: *"Execute GT-003 for SPR-MOD-NNN-XXX"*.
- Framework roadmap: **GT-004** (Baseline Consolidation) → **GT-005** (Repository Audit).

---

## Execution Record — Pass 8.12.2 v3 (2026-07-12)

**Template**: GT-003 Sprint Authoring · **UUID**: `2d335f1a-2070-4ed1-95ab-6f56e6e7345e` · **Version**: v1.0 · **Instance**: `GT-003-v1.0-BOOTSTRAP-001`

### Deliverables
- Created `docs/15-governance/templates/GT-003_SPRINT_AUTHORING.md` (v1.0, Active) with 16 sections, dual validation surfaces (13 framework + 15 runtime), `id`+`slug` capability refs (S1), version-resolution rule (S2), VAL-013 split into 013A/013B (S3), SHA-scope rule (S4), machine-readable `execution_prerequisites` (S5), and `next_templates` successor set (R8).
- Amended `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` `v1.0 → v1.1` (Minor): added `depends_on: [CAP-001, CAP-002, CAP-003]` on CAP-004; Change Control row records S7 rationale.
- Updated `GOVERNANCE_TEMPLATE_REGISTRY.md` (GT-003 Active; Capabilities row → v1.1), `GOVERNANCE_TEMPLATE_INDEX.md` (GT-003 v1.0 Active; Capabilities v1.1), `DOCUMENT_INDEX.md`, `_meta.json` (JSON valid).
- `GOVERNANCE_TEMPLATE_LIFECYCLE.md` unchanged this pass — existing "Companion Registries" note already covers Capabilities registry lifecycle without version-specific edits.
- `REPOSITORY_MAP.md` unchanged — existing `15-governance/` tree line covers `templates/`.

### Template Validation — Framework (13/13 PASS)
(a) 16 sections present & ordered ✓  (b) Header complete incl. `template_uuid`, `capabilities` with `id`+`slug` pairs, spec/standard/registry compat, versioned `depends_on_templates` ✓  (c) every capability `id` resolves to an Active registry row; slugs match ✓  (d) VAL-001..VAL-012, VAL-013A, VAL-013B, VAL-014 enumerated (15 total) ✓  (e) Compatibility Matrix cites Standard v1.3, Governance v1.0, Capabilities Registry v1.1; version-resolution rule (S2) + S7 rationale present ✓  (f) Audit Metadata block present (R6) ✓  (g) §15 marked `retainable: false`; SHA scope rule declared (S4) ✓  (h) SemVer ranges parseable; exit codes + full Execution Manifest (reads/creates/updates/never_modifies/repository_map) present ✓  (i) `governance_specification` v1.0 & `template_standard` v1.3 concrete ✓  (j) No Standard bump attempted ✓  (k) `CAP-004.depends_on` targets (CAP-001/002/003) resolve to Active rows ✓  (l) `depends_on ∪ supersedes` acyclic ✓  (m) `execution_prerequisites`, `dependency_semantics`, `next_templates`, `version_resolution` present and well-formed ✓.

### Repository Audit (Spec v1.0)
| Check | Evidence | Result |
|---|---|---|
| Governance Spec v1.0 unchanged | `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` not modified this pass | PASS |
| GT-001 body unchanged | GT-001 template asset untouched | PASS |
| GT-002 body unchanged | `docs/15-governance/templates/GT-002_STAGE1_AUTHORING.md` untouched | PASS |
| Standard v1.3 unchanged | `GOVERNANCE_TEMPLATE_STANDARD.md` not modified this pass | PASS |
| Capabilities Registry v1.0 → v1.1 (Minor, additive) | CAP-004 depends_on added; Change Control row appended | PASS |
| GT-003 Active in Registry | `GOVERNANCE_TEMPLATE_REGISTRY.md` updated | PASS |
| No module/PRD/Sprint/Baseline touched | Only `15-governance/`, `DOCUMENT_INDEX.md`, `_meta.json` modified | PASS |
| Historical logs unchanged | Prior `.lovable/plan.md` records preserved; append-only | PASS |
| `_meta.json` valid | `json.load(...)` = OK | PASS |
| REPOSITORY_MAP unchanged | verification only; existing tree covers `templates/` | PASS |

**Verification Summary**

| Checklist Items | Passed | Remediated | Failed | Outstanding Risks | Repository Status | Confidence | Next Pass |
|---|---|---|---|---|---|---|---|
| 13 Framework Validation + 10 audit evidence rows | 23 | 0 | 0 | None | READY | MEDIUM (D3 waiver — repository revision identifier unavailable) | Pass 8.12.3 — GT-004 Baseline Consolidation |

Sprint Template Validation (15 checks) is the runtime contract; exercised on every future GT-003 invocation, not this pass.
