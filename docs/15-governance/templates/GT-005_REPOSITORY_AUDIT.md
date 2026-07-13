---
title: "GT-005 — Repository Audit Template"
summary: "Authoritative governance template for repository-wide governance audits."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "template", "repository-audit", "GT-005"]
document_type: "Governance Template"
governance_specification: v1.0
template_standard: v1.4
lifecycle_state: Active
---

# GT-005 — Repository Audit Template

> **SHA scope rule.** `template_sha256` is computed over all sections not marked `retainable: false`. §15 Example carries `retainable: false` and is the sole excluded section.

## §1 Identity

```yaml
template_id: GT-005
template_uuid: 5b8a1a11-4a31-4231-8b07-f78a52d9a71a
template_name: Repository Audit
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
template_sha256: sha256:<computed-at-commit>
capabilities:
  - { id: CAP-008, slug: repository-audit }
  - { id: CAP-009, slug: verification }
  - { id: CAP-007, slug: registration }
depends_on_templates:
  - { id: GT-001, minimum_version: ">=1.1,<2.0" }
  - { id: GT-002, minimum_version: ">=1.0,<2.0" }
  - { id: GT-003, minimum_version: ">=1.0,<2.0" }
  - { id: GT-004, minimum_version: ">=1.0,<2.0" }
```

Capabilities resolve verbatim against Capabilities Registry v1.1. **No runtime fallback.** Any absent `CAP-NNN` at Preflight yields `CAPABILITY-NOT-REGISTERED` (exit_code 20). A Matrix vs §1 Identity mismatch yields R26 FAIL (exit_code 10). Introducing a new capability requires a separate Capabilities Registry pass.

## §2 Purpose

Standardize deterministic execution of every repository-wide governance audit so future invocations reduce to *"Execute GT-005"* without embedding audit governance in prompts. GT-005 is the terminal template of the Governance Template Framework and the final Active template before Pass 8.12.5 — Governance Framework v1.0 Freeze.

## §3 Scope

**In scope (audit categories):**

- Governance validation (specification, standard, capabilities registry, dependency matrix).
- Repository validation (path resolution, completeness, catalog consistency).
- Registration validation (all governance and module registration surfaces).
- Traceability validation (Module PRD → Sprint Plan → Sprint PRDs → Baseline).
- Dependency validation (Dependency Matrix R25/R26, SemVer resolution).
- Catalog and metadata consistency.
- Version and SHA integrity.
- Governance drift detection (no unauthorized mutation of frozen assets).

**Out of scope:** authoring or modifying any governance asset, module artifact, or registration surface. GT-005 is a read-only audit contract at runtime.

## §4 Inputs

| Input | Source | Class |
|---|---|---|
| Repository tree | `docs/**` | Primary |
| Governance surfaces | `docs/15-governance/**` | Primary |
| Portal sidebar | `docs/_meta.json` | Primary |
| Event Catalog | `docs/02-architecture/event-catalog.md` | Primary |
| Dependency Matrix | `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` | Primary |
| Capabilities Registry | `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` | Primary |

## §5 Outputs & Excluded Outputs

**Creates:**

- `docs/50-audit-reports/REPOSITORY_AUDIT_<YYYYMMDDTHHMMSSZ>.md`

**Updates:**

- Execution logs only.

**Never modifies:** Governance Specification, Template Standard, Capabilities Registry, Dependency Matrix, Governance Templates, Module PRDs, Sprint Plans, Sprint PRDs, Baselines, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`, `GOVERNANCE_TEMPLATE_REGISTRY.md`, `GOVERNANCE_TEMPLATE_INDEX.md`.

### R2 — Report Filename Convention (deterministic)

```
docs/50-audit-reports/REPOSITORY_AUDIT_<YYYYMMDDTHHMMSSZ>.md
```

Timestamp is UTC ISO-8601 basic form. On second-granularity collision a tenant/instance suffix (`_<suffix>`) is appended.

### R3 — Audit Report Schema

`audit_report_schema: 1` — versioned independently of `template_version`. Consumers key their contracts off this field.

### R4 + R8 + R9 — Report Front-Matter (mandatory)

```yaml
repository_snapshot:                # R4
  revision: <git-sha-or-repo-revision>
  generated_at: <UTC-ISO-8601>
  governance_version: v1.0
  template_standard: v1.4
  capabilities_registry: v1.1
  dependency_matrix: v1.0.2
  audit_report_schema: 1
audit_scope:                        # R8
  framework: GT-005
  framework_version: v1.0
  repository: full                  # enum: full | governance | module:<MOD-NNN> | profile:<name>
  profiles: [governance, repository, registration, traceability, integrity]
report_sha256: sha256:<computed-at-emission>   # R9 — over report body excluding this field
```

### R7 — Audit Severity Summary (mandatory, machine-readable)

```yaml
audit_summary:
  info: <int>
  minor: <int>
  major: <int>
  critical: <int>
  total: <int>       # = info + minor + major + critical
  result: PASS | FAIL | WAIVED
waivers: [ ... ]     # list of waived findings
```

`result = FAIL` when `critical > 0`, or `major > 0` with any unwaived MAJOR finding; otherwise `PASS`. `WAIVED` is used only when every MAJOR/CRITICAL finding is covered by an active waiver. Waived findings are counted in their severity bucket **and** enumerated in `waivers:`.

## §6 Preconditions

- Governance framework at declared versions: Governance Specification v1.0, Template Standard v1.4, Capabilities Registry v1.1.
- Dependency Matrix v1.0.2 with GT-005 `Active` and EDGE-005..EDGE-008 `Active`.
- `docs/50-audit-reports/` exists or is creatable.
- No open FAIL findings block Preflight.

## §7 Execution Workflow

Eight deterministic, idempotent steps:

1. **Preflight** — validate §4 inputs; verify Capabilities Registry contains CAP-007, CAP-008, CAP-009; fail with `CAPABILITY-NOT-REGISTERED` (exit 20) otherwise.
2. **Dependency Resolution** — resolve `depends_on_templates` via Dependency Matrix (R25); confirm GT-001..GT-004 `Active` with matching SemVer ranges.
3. **Repository Scan** — enumerate all governance and module artifacts.
4. **Validation** — run VAL-001..VAL-018 (§10).
5. **Report Assembly** — compose report body deterministically; assemble `repository_snapshot`, `audit_scope`, `audit_summary`, findings.
6. **Report Emission** — write to `docs/50-audit-reports/REPOSITORY_AUDIT_<YYYYMMDDTHHMMSSZ>.md`; compute and record `report_sha256`.
7. **Verification** — self-check emitted report against VAL-018 (reproducibility) and VAL-010 (SHA integrity).
8. **Completion** — record execution instance ID, sequence, timestamp, environment, repository revision.

## §8 Execution State Machine

```
preflight → resolving → scanning → validating →
  assembling → emitting → verifying → complete | failed
```

Failure at any state transitions to `failed` and triggers §9 runtime rollback.

## §9 Failure Object Schema + Runtime Rollback Rule

Findings use the standard schema:

```
Finding ID | Severity (INFO | MINOR | MAJOR | CRITICAL) | Evidence | Resolution | Status (Open | Resolved | Waived)
```

Severity vocabulary is **normative** and feeds `audit_summary` buckets (R7).

**Runtime Rollback Rule** (future GT-005 executions): GT-005 creates no governance mutations, so rollback applies only to interim audit-report artifacts. On failure between Steps 5 and 7, any partially-emitted report file SHALL be deleted before Repository Status is evaluated. Report emission is idempotent: identical inputs + snapshot produce identical report body except `generated_at` and `report_sha256`.

## §10 Validation Rules (VAL-001..VAL-018)

> **R5 — Identifier Immutability Rule.** Validation identifiers `VAL-001..VAL-018` and template-verification identifiers `TVAL-001..TVAL-014` are **immutable and append-only** across future GT-005 versions. Retired IDs SHALL be marked `Deprecated` but never re-numbered or reused. New checks SHALL be appended with the next unused numeric suffix. This rule preserves audit reproducibility across template revisions.

| ID | Check | Blocking |
|---|---|---|
| VAL-001 | Template registration completeness (every template in Registry, Index, DOCUMENT_INDEX, sidebar). | FAIL |
| VAL-002 | Catalog consistency (`MODULE_CATALOG`, `MODULE_BASELINE_CATALOG`, `SPRINT_CATALOG`). | FAIL |
| VAL-003 | `DOCUMENT_INDEX.md` consistency. | FAIL |
| VAL-004 | `_meta.json` sidebar consistency; valid JSON. | FAIL |
| VAL-005 | Dependency Matrix consistency (markdown ↔ YAML parity, R27). | FAIL |
| VAL-006 | Capabilities Registry consistency. | FAIL |
| VAL-007 | Governance Template Registry consistency. | FAIL |
| VAL-008 | Governance Template Index consistency. | FAIL |
| VAL-009 | Lifecycle-state consistency across all surfaces. | FAIL |
| VAL-010 | SHA integrity (`template_sha256`, `asset_sha256`, `report_sha256`). | FAIL |
| VAL-011 | YAML derivation parity (R27); no surplus fields in YAML. | FAIL |
| VAL-012 | Placeholder discipline (no `TBD`, `TODO`, scaffolding). | FAIL |
| VAL-013 | Version compatibility (SemVer resolution across all edges). | FAIL |
| VAL-014 | UUID uniqueness across all templates. | FAIL |
| VAL-015 | Repository completeness (every referenced document resolves). | FAIL |
| VAL-016 | Governance drift detection: no unauthorized mutation of frozen assets. | FAIL |
| VAL-017 | Deterministic execution: identical repo state produces identical report body modulo `generated_at` and `report_sha256`. | FAIL |
| VAL-018 | Audit reproducibility: report contains `repository_snapshot` + `audit_scope`. | FAIL |

## §11 Automation Exit Codes

| Code | Meaning |
|---|---|
| 0 | OK |
| 10 | R26 conflict (Dependency Matrix vs §1 Identity) |
| 20 | DEPENDENCY-FAIL or CAPABILITY-NOT-REGISTERED |
| 30 | VAL-fail (any VAL-001..VAL-018) |
| 40 | audit-fail (Repository Audit Spec v1.0 self-check) |

## §12 Execution Manifest

```yaml
# The Execution Manifest is NORMATIVE for future "Execute GT-005" invocations
# and INFORMATIVE for this authoring pass (Pass 8.12.4), which authors the
# template only and emits no audit report.
reads:
  - docs/**
  - docs/15-governance/**
  - docs/_meta.json
  - docs/02-architecture/event-catalog.md
creates:
  - docs/50-audit-reports/REPOSITORY_AUDIT_<YYYYMMDDTHHMMSSZ>.md
updates:
  - execution logs only
never_modifies:
  - docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md
  - docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md
  - docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md
  - docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.yaml
  - docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md
  - docs/15-governance/GOVERNANCE_TEMPLATE_INDEX.md
  - docs/15-governance/templates/**
  - docs/20-module-prds/**
  - docs/30-sprint-prds/**
  - docs/40-module-baselines/**
  - docs/MODULE_IMPLEMENTATION_WORKFLOW.md
  - docs/DOCUMENT_INDEX.md
  - docs/_meta.json
```

## §13 Machine-Readable Metadata

> **R10 — Audit Profile Vocabulary Rule.** The `audit_profiles` vocabulary (`governance`, `repository`, `registration`, `traceability`, `integrity`) is **frozen and append-only**. Existing profile names SHALL NOT be removed, renamed, or repurposed. New profiles SHALL be appended in future template revisions with a rationale entry in §16.

```yaml
execution_type: RepositoryAudit
validation_checks: 18
audit_required: true
baseline_required: false
next_templates: []                       # GT-005 is terminal
audit_report_schema: 1                   # R3
report_sha256_required: true             # R9
audit_profiles:                          # R1 + R10 (frozen, append-only)
  - governance
  - repository
  - registration
  - traceability
  - integrity
framework_status:                        # R6
  gt001: Active
  gt002: Active
  gt003: Active
  gt004: Active
  gt005: Active
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
Execute GT-005
```

Expected sequence: Preflight → Dependency Resolution → Repository Scan → VAL-001..018 → Report Assembly → Report Emission → Verification → Completion. Output: `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-timestamp>.md` with `repository_snapshot`, `audit_scope`, `audit_summary`, findings, and `report_sha256`.

## §16 Change Control

| Version | Change Summary | Governance | Standard | Lifecycle |
|---|---|---|---|---|
| v1.0 | Initial release. Repository Audit template with 18 validation rules and deterministic activation via Pass 8.12.4. R2 filename convention, R3 audit_report_schema, R4 repository_snapshot, R7 audit_summary, R8 audit_scope, R9 report_sha256, R10 frozen audit_profiles vocabulary. Terminal template of the Governance Template Framework. | v1.0 | v1.4 | Active |
