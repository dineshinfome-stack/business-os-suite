---
title: "GT-003 — Sprint Authoring Template"
summary: "Authoritative governance template for Stage 2 Sprint PRD authoring."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "template", "stage2", "sprint-authoring", "GT-003"]
document_type: "Governance Template"
governance_specification: v1.0
template_standard: v1.3
lifecycle_state: Active
---

# GT-003 — Sprint Authoring Template

> **SHA scope rule (S4).** `template_sha256` is computed over all sections not marked `retainable: false`. This rule generalizes across all governance templates and MUST NOT be redefined per-template. In this template, §15 Example carries `retainable: false` and is the sole excluded section.

## §1 Identity

```yaml
template_id: GT-003
template_uuid: 2d335f1a-2070-4ed1-95ab-6f56e6e7345e
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
sha_scope_rule: "exclude sections marked retainable: false"
template_sha256: sha256:GT-003-v1.0:computed-at-commit
capabilities:
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

## §2 Purpose

Standardize deterministic authoring of every Stage 2 Sprint PRD so future invocations reduce to `"Execute GT-003 for SPR-MOD-NNN-XXX"` without embedding Sprint PRD governance in prompts.

GT-003 governs:

- Sprint PRD authoring under the canonical Stage 2 18-section structure.
- Sprint sequencing within the frozen Sprint Plan.
- Sprint capability allocation (originating capability resolution + exclusivity).
- Sprint dependency validation (template and upstream sprint).
- Sprint acceptance criteria and deliverables.
- Sprint bidirectional traceability (capability ↔ sprint ↔ deliverable).

GT-003 explicitly excludes:

- Module PRD authoring (delegated to GT-002).
- Baseline consolidation (delegated to GT-004).
- Repository-wide audit (delegated to GT-005).

## §3 Scope

- **In scope:** exactly one Sprint PRD per invocation; associated Sprint-README, Sprint registration surface, `DOCUMENT_INDEX`, and `_meta.json` updates.
- **Out of scope:** Module PRDs, Sprint Plans, Baselines, Governance Specification amendments, Governance Template modifications.

## §4 Inputs

**Mandatory**

- Sprint Plan for the target module.
- Module PRD (Stage 1 output of GT-002).
- `docs/MODULE_CATALOG.md`.
- `docs/10-erp-core/ENGINE_CATALOG.md`.
- `docs/11-adrs/ADR_INDEX.md`.
- `docs/02-architecture/event-catalog.md`.
- `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` at `>=1.1,<2.0`.

**Optional**

- Previously authored Sprint PRDs for the same module (for continuity and traceability cross-reference).

## §5 Outputs & Excluded Outputs

**Produces**

- Exactly one Sprint PRD file: `docs/30-sprint-prds/<module-slug>/SPR-MOD-<NNN>-<XXX>-<sprint-slug>.md`.

**Updates**

- `docs/30-sprint-prds/<module-slug>/README.md`.
- Sprint registration surface (Sprint Catalog if present; else the repository's authoritative Sprint registration artifact).
- `docs/DOCUMENT_INDEX.md`.
- `docs/_meta.json`.

**Explicitly excludes**

- Module PRDs, Sprint Plans, Baselines, Governance templates, Governance Specification.

## §6 Preconditions

- GT-001 Active; GT-002 Active at a version satisfying `>=1.0,<2.0`.
- Target module has a Stage 1 Module PRD and Sprint Plan (produced by GT-002).
- Target Sprint ID exists in the frozen Sprint Plan and is unclaimed.
- Capabilities Registry at `>=1.1,<2.0`.
- No `docs/15-governance/**` modifications planned this invocation.

## §7 Execution Workflow

1. **Preflight** — validate all Preconditions; resolve `<module-slug>`, `<NNN>`, `<XXX>`, `<sprint-slug>` from Sprint Plan.
2. **Allocation Gate** — resolve originating capability from Module PRD Capability Allocation Matrix; verify exclusivity (allocated to exactly one sprint).
3. **Dependency Validation** — evaluate `depends_on_templates` (VAL-013A) and upstream sprint dependencies (VAL-013B).
4. **Author Sprint PRD** — populate the canonical 18-section Stage 2 structure with verbatim engine/ADR/event unions derived from the Module PRD.
5. **Register Sprint PRD** — update the four registration surfaces listed in §5.
6. **Sprint Template Validation** — run VAL-001…VAL-014 (15 checks total per S3).
7. **Repository Audit** — invoke the Repository Audit contract (CAP-008); expected `READY`.
8. **Completion** — emit success finding; append execution record.

## §8 Execution State Machine

```text
Idle → Preflight → AllocationGate → DependencyValidation
     → Authoring → Registration → Validation → Audit → Complete
Any state → Failed  (on non-recoverable finding, per §9)
```

## §9 Failure Object Schema

```yaml
failure:
  code: <FAILURE-CLASS>          # e.g. DEPENDENCY-FAIL, VALIDATION-FAIL, AUDIT-FAIL
  exit_code: <int>               # per §11
  severity: CRITICAL | ERROR | WARN | INFO
  rule_id: <VAL-NNN | framework-check-id | audit-rule>
  message: <string>
  evidence:
    - path: <repo-relative>
      quote: <verbatim excerpt>
  remediation: <string>
```

## §10 Sprint Template Validation Rules (15)

| ID | Check |
|---|---|
| VAL-001 | Sprint ID (`SPR-MOD-NNN-XXX`) unique across repository. |
| VAL-002 | Originating capability exists in the Module PRD Capability Allocation Matrix. |
| VAL-003 | Capability allocated to exactly one sprint (exclusivity). |
| VAL-004 | Engines are a subset of the Module PRD engine union. |
| VAL-005 | ADRs are a subset of the Module PRD ADR union. |
| VAL-006 | Events are a subset of the Module PRD event union. |
| VAL-007 | Acceptance criteria complete (non-empty, testable). |
| VAL-008 | Deliverables complete (all §-required artifacts present). |
| VAL-009 | Registration surfaces updated (README, Sprint registration surface, `DOCUMENT_INDEX`, `_meta.json`). |
| VAL-010 | Bidirectional traceability holds (capability ↔ sprint ↔ deliverable). |
| VAL-011 | No unresolved placeholders (`<...>` occurrence count = 0). |
| VAL-012 | Frontmatter metadata valid (all required keys present; types correct). |
| **VAL-013A** | Template dependencies satisfied — every `depends_on_templates` entry resolves to an `Active` registered template within its `minimum_version` range. |
| **VAL-013B** | Upstream sprint dependencies satisfied — upstream sprints declared in the Sprint Plan exist and are `Active`. |
| VAL-014 | Repository consistency (Sprint PRD path matches conventions; no orphan references). |

## §11 Automation Exit Codes

| Code | Meaning |
|---|---|
| 0 | OK |
| 10 | Validation failure (any VAL-NNN) |
| 20 | Dependency failure (VAL-013A / VAL-013B / capability graph) |
| 30 | Audit failure |
| 40 | Registration failure |
| 50 | Preflight failure |

## §12 Execution Manifest

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
  - <sprint-registration-surface>    # Sprint Catalog if present; else authoritative equivalent
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
  verification: "existing registration covers docs/30-sprint-prds/<module-slug>/"
```

## §13 Machine-Readable Metadata

```yaml
execution_type: Stage2
validation_checks: 15                  # Sprint Template Validation (VAL-001..VAL-012, VAL-013A, VAL-013B, VAL-014)
framework_validation_checks: 13        # Template (asset) Validation, checks (a)..(m)
audit_required: true
baseline_required: false
execution_prerequisites:
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
version_resolution:
  rule: "highest Active version satisfying range; SemVer 2.0 precedence"
  fallback: "Deprecated/Archived eligible only if no Active version qualifies; emit WARN"
```

## §14 Compatibility Matrix

| template_version | governance_version | template_standard | capabilities_registry | matrix_entry | result |
|---|---|---|---|---|---|
| v1.0 | v1.0 | v1.3 | v1.1 | matrix_entry-001 | PASS |

**Version-resolution rule (S2).** When multiple registered versions satisfy a compatibility range, automation SHALL select the highest non-deprecated `Active` version. Ties resolve by SemVer 2.0 precedence. `Deprecated` and `Archived` versions are eligible only if no `Active` version satisfies the range, in which case the invocation MUST emit a `WARN` finding.

**Registry-bump rationale (S7).** GT-003 requires Capabilities Registry `v1.1` because it introduces the first `depends_on` edges (`CAP-004 → CAP-001/CAP-002/CAP-003`). Registries at `v1.0` lack those edges and cannot satisfy `VAL-013A`.

## §15 Example — `retainable: false`

> **Non-retainable.** This section is illustrative only and is excluded from `template_sha256` per §1 `sha_scope_rule` (S4). Contents MAY be replaced or removed without a version bump.

*Example instantiation (illustrative):* `Execute GT-003 for SPR-MOD-007-001` — resolves to Sprint 001 of the next available module. The instantiated Sprint PRD would be authored at `docs/30-sprint-prds/<module-slug>/SPR-MOD-007-001-<sprint-slug>.md` with engines/ADRs/events verbatim from the Module PRD and originating capability resolved from the Capability Allocation Matrix.

## §16 Change Control

| Version | Change Summary | Governance | Template Standard | Capabilities Registry | Lifecycle |
|---|---|---|---|---|---|
| v1.0 | Initial release. Establishes Sprint Authoring template with dual validation surfaces (13 framework + 15 runtime), canonical `id`+`slug` capability references, SemVer-versioned template dependencies, `reads`/`creates`/`updates`/`never_modifies` execution manifest, deterministic REPOSITORY_MAP action, machine-readable execution prerequisites, dependency-semantics annotation, and successor set `next_templates`. | v1.0 | v1.3 | v1.1 | Active |

### Audit Metadata (mandatory per R6)

```yaml
audit_metadata:
  execution_instance: GT-003-v1.0-BOOTSTRAP-001
  target_artifact: docs/15-governance/templates/GT-003_SPRINT_AUTHORING.md
  verifier: Architecture Office
  verification_date: 2026-07-12
  authoritative_sources_checked:
    - docs/MODULE_IMPLEMENTATION_WORKFLOW.md
    - docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md   # v1.3
    - docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md  # v1.1
    - docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md
    - docs/15-governance/templates/GT-002_STAGE1_AUTHORING.md
  d_waivers:
    - id: D3
      rationale: "Repository revision identifier unavailable in sandboxed environment; confidence MEDIUM."
  invariant_preservation:
    governance_specification: unchanged
    template_standard: unchanged
    gt_001_body: unchanged
    gt_002_body: unchanged
    historical_records: append_only
```
