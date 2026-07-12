---
title: "GT-004 — Baseline Consolidation Template"
summary: "Authoritative governance template for Stage 3 Module Baseline consolidation."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "template", "stage3", "baseline-consolidation", "GT-004"]
document_type: "Governance Template"
governance_specification: v1.0
template_standard: v1.4
lifecycle_state: Active
---

# GT-004 — Baseline Consolidation Template

> **SHA scope rule.** `template_sha256` is computed over all sections not marked `retainable: false`. §15 Example carries `retainable: false` and is the sole excluded section.

## §1 Identity

```yaml
template_id: GT-004
template_uuid: b856a96c-db7f-4b06-b90b-0bcdbb830ca6
template_name: Baseline Consolidation
template_version: v1.0
governance_specification: v1.0
template_standard: v1.4
compatible_governance: ">=1.0,<2.0"
compatible_template_standard: ">=1.4,<2.0"
compatible_capabilities_registry: ">=1.1,<2.0"
schema_version: 1
lifecycle_state: Active
owner: Architecture Office
classification: Governance Template
sha_scope_rule: "exclude sections marked retainable: false"
template_sha256: sha256:GT-004-v1.0:computed-at-commit
capabilities:
  - { id: CAP-005, slug: baseline-consolidation }
  - { id: CAP-009, slug: verification }
  - { id: CAP-008, slug: repository-audit }
  - { id: CAP-007, slug: registration }
depends_on_templates:
  - { id: GT-003, minimum_version: ">=1.0,<2.0" }
```

Capabilities resolve verbatim against Capabilities Registry v1.1. **No runtime fallback.** Any absent `CAP-NNN` at Preflight yields `CAPABILITY-NOT-REGISTERED` (exit_code 20). Introducing a new capability requires a separate Capabilities Registry pass.

## §2 Purpose

Standardize deterministic authoring of every Stage 3 Module Baseline so future invocations reduce to *"Execute GT-004 for MOD-NNN"* without embedding Stage 3 governance in prompts.

GT-004 governs:

- Consolidation of completed Sprint PRDs into a Module Baseline.
- Cross-sprint validation (capabilities, engines, ADRs, events).
- Establishment of the Baseline as the authoritative implementation document.
- Registration of the Baseline across governance surfaces.

## §3 Scope

**In scope:** consuming Stage 1 (Module PRD + Sprint Plan) and Stage 2 (Sprint PRDs) outputs; producing a single Module Baseline; updating four registration surfaces.

**Out of scope:** authoring or modifying Module PRDs, Sprint Plans, Sprint PRDs, prior Baselines, governance assets, or Governance Specification v1.0.

## §4 Inputs

| Input | Source | Class |
|---|---|---|
| Module PRD | `docs/20-module-prds/<module>/MOD-NNN.md` | Primary |
| Sprint Plan | `docs/30-sprint-prds/<module>/MOD-NNN_SPRINT_PLAN.md` | Primary |
| Sprint PRDs (all) | `docs/30-sprint-prds/<module>/SPR-MOD-NNN-XXX-*.md` | Primary |
| Module Catalog | `docs/MODULE_CATALOG.md` | Primary |
| Engine Usage Matrix | `docs/ENGINE_USAGE_MATRIX.md` | Primary |
| ADR Impact Matrix | `docs/ADR_IMPACT_MATRIX.md` | Primary |
| Event Catalog | `docs/02-architecture/event-catalog.md` | Primary |
| Dependency Matrix | `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` | Primary |
| Capabilities Registry | `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` | Primary |
| Previous Baseline (optional) | `docs/40-module-baselines/MOD<NNN>_<NAME>_BASELINE_v<prev>.md` | Secondary |

## §5 Outputs & Excluded Outputs

**Creates:**

- `docs/40-module-baselines/MOD<NNN>_<NAME>_BASELINE_v1.md`

**Updates:**

- `docs/40-module-baselines/README.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/MODULE_BASELINE_CATALOG.md`
- `docs/_meta.json`

**Never modifies:** Module PRD, Sprint Plan, Sprint PRDs, Governance Templates, Governance Specification, Template Standard, Capabilities Registry, Dependency Matrix, historical execution logs.

## §6 Preconditions

- Stage 1 frozen for the target module.
- Stage 2 complete: every sprint in the frozen Sprint Plan authored and verified.
- Dependency Matrix `EDGE-003` (`GT-004 → GT-003`) is `Active`.
- No open FAIL findings on upstream artifacts.
- Capabilities Registry ≥ v1.1.

## §7 Execution Workflow

Nine deterministic, idempotent steps:

1. **Preflight** — validate all §4 inputs exist and resolve; validate capability identifiers against Capabilities Registry.
2. **Dependency Resolution** — resolve `depends_on_templates` via Dependency Matrix (R25); confirm GT-003 `Active` with matching SemVer range.
3. **Sprint Collection** — enumerate Sprint PRDs from the frozen Sprint Plan; assert 1:1 correspondence with Sprint Plan rows.
4. **Cross-Sprint Validation** — run VAL-001..VAL-016 (§10).
5. **Baseline Assembly** — deterministically compose the Baseline body from Stage 1 + Stage 2 inputs.
6. **Registration** — update the four surfaces in §5.
7. **Verification** — run the Verification Reporting Standard checklist for the Baseline.
8. **Repository Audit** — Post-Implementation Repository Audit (Spec v1.0).
9. **Completion** — record execution instance ID, sequence, timestamp, environment, repository revision (when available).

## §8 Execution State Machine

```
preflight → resolving → collecting → validating → assembling →
  registering → verifying → auditing → complete | failed
```

Failure at any state transitions to `failed` and triggers §9 rollback.

## §9 Failure Object Schema + Runtime Rollback Rule

Findings use the standard schema `Finding ID | Severity | Evidence | Resolution | Status` (severity `INFO|MINOR|MAJOR|CRITICAL`; status `Open|Resolved|Waived`).

**Runtime Rollback Rule** (future GT-004 executions): if Verification (Step 7) or Repository Audit (Step 8) fails after Registration (Step 6), the created Baseline and the four registration surfaces SHALL be reverted in reverse order before Repository Status is evaluated:

1. `_meta.json`
2. `MODULE_BASELINE_CATALOG.md`
3. `DOCUMENT_INDEX.md`
4. `docs/40-module-baselines/README.md`
5. Delete the created Baseline file.

Rollback is deterministic. Repository Status is evaluated only after rollback completes.

## §10 Baseline Template Validation Rules (VAL-001..VAL-016)

| ID | Check | Blocking |
|---|---|---|
| VAL-001 | Sprint completeness: every sprint in the Sprint Plan has an authored, verified Sprint PRD. | FAIL |
| VAL-002 | Capability coverage: every capability declared in the Sprint Plan appears in at least one Sprint PRD and in the Baseline. | FAIL |
| VAL-003 | Engine reconciliation: every engine consumed by any Sprint PRD is present in `ENGINE_USAGE_MATRIX.md`. | FAIL |
| VAL-004 | ADR reconciliation: every ADR cited by any Sprint PRD is present in `ADR_IMPACT_MATRIX.md`. | FAIL |
| VAL-005 | Event reconciliation: every event emitted or consumed by any Sprint PRD is present in `docs/02-architecture/event-catalog.md`. | FAIL |
| VAL-006 | Cross-reference integrity: all internal links resolve. | FAIL |
| VAL-007 | No duplicated requirements across sprints (requirement IDs unique). | FAIL |
| VAL-008 | No orphan capabilities (every capability traces to a Sprint PRD row). | FAIL |
| VAL-009 | Registration completeness: all four registration surfaces updated. | FAIL |
| VAL-010 | Traceability preserved: Module PRD → Sprint Plan → Sprint PRDs → Baseline chain intact. | FAIL |
| VAL-011 | Metadata validity: Baseline frontmatter conforms to Governance Specification v1.0. | FAIL |
| VAL-012 | Baseline structural conformance: 16-section shape. | FAIL |
| VAL-013 | Dependency resolution via Dependency Matrix (R25) for every referenced governance asset. | FAIL |
| VAL-014 | Placeholder discipline: no `TBD`, `TODO`, or template scaffolding remains. | FAIL |
| VAL-015 | Repository consistency: no unintended modifications outside §5 Outputs. | FAIL |
| VAL-016 | Baseline determinism: rerunning against identical inputs produces identical Baseline (excluding execution metadata). | FAIL |

## §11 Automation Exit Codes

| Code | Meaning |
|---|---|
| 0 | OK |
| 10 | R26 conflict (Dependency Matrix vs §1 Identity) |
| 20 | DEPENDENCY-FAIL or CAPABILITY-NOT-REGISTERED |
| 30 | VAL-fail (any VAL-001..VAL-016) |
| 40 | audit-fail (Repository Audit Spec v1.0) |

## §12 Execution Manifest

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

## §13 Machine-Readable Metadata

```yaml
execution_type: Stage3
validation_checks: 16
audit_required: true
baseline_required: true
next_templates: [GT-005]
```

## §14 Compatibility Matrix

| template_version | governance_version | template_standard | capabilities_registry | result |
|---|---|---|---|---|
| v1.0 | v1.0 | v1.4 | ≥ v1.1 | PASS |

Result enum: `PASS | FAIL | WAIVED`.

## §15 Example — `retainable: false`

> Non-retainable. Excluded from `template_sha256`.

Example invocation:

```
Execute GT-004 for MOD-003
```

Expected sequence: Preflight → Dependency Resolution → Sprint Collection (SPR-MOD-003-001..006) → VAL-001..016 → Baseline Assembly → Registration → Verification → Repository Audit → Completion. Output: `docs/40-module-baselines/MOD003_SALES_BASELINE_v1.md` (already exists for MOD-003; this example is illustrative only).

## §16 Change Control

| Version | Change Summary | Governance | Standard | Lifecycle |
|---|---|---|---|---|
| v1.0 | Initial release. Stage 3 Baseline consolidation template with 16 validation rules and deterministic activation via Pass 8.12.3. | v1.0 | v1.4 | Active |
