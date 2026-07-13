# Pass 8.12.4 — GT-005 Repository Audit Template (Governance Asset) — v3

Governance-only pass completing the Governance Template Framework (GT-001 → GT-005). No module artifacts, Governance Specification, Template Standard, or Capabilities Registry are modified. No Dependency Matrix topology change — status transitions only.

> **v3 refinements (adds R7–R10 on top of v2):**
> - **R7** Audit Severity Summary block in every audit report.
> - **R8** Explicit `audit_scope` identifier in report metadata.
> - **R9** `report_sha256` for generated audit reports (independent of `template_sha256`).
> - **R10** Frozen, append-only `audit_profiles` vocabulary.
> - Framework-release manifest fields (`framework_release.version/released/frozen`) are **deferred to Pass 8.12.5** by design; GT-005 remains freeze-agnostic.

## Non-Goals (hard guardrails)

SHALL NOT: execute an actual repository audit beyond validating the template itself; modify GT-001..GT-004 bodies; modify Governance Specification v1.0; modify Template Standard v1.4; modify Capabilities Registry v1.1; modify Module PRDs, Sprint Plans, Sprint PRDs, or Baselines; modify historical execution logs; introduce, remove, or redirect Dependency Matrix edges (only lifecycle-state transitions on `Planned` entries); introduce `framework_release` manifest fields (owned by Pass 8.12.5).

## Runtime vs Authoring Scope Split

- **GT-005 runtime contract** (future *"Execute GT-005"* invocations): reads governance & repository surfaces; **creates** audit reports under `docs/50-audit-reports/`; **updates** execution logs only; **never modifies** governance specification, templates, module artifacts, baselines, registries, indices, matrix, or `_meta.json`.
- **This authoring pass (Pass 8.12.4)**: updates the four registration surfaces (Registry, Index, `DOCUMENT_INDEX.md`, `_meta.json`), the Dependency Matrix, and its YAML export — as with GT-002/GT-003/GT-004 activation.

## Deterministic Pass Sequence

Author → Validate → Audit → Activate → Register → Record. Steps 4–6 execute only if Steps 2 and 3 return PASS. Failure at any step triggers §Rollback.

## Deliverable 1 — GT-005 Template

Path: `docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md` — canonical 16-section governance template conforming to Template Standard v1.4.

### §1 Identity

```yaml
template_id: GT-005
template_uuid: <generated UUIDv4>
template_name: Repository Audit
template_version: v1.0
governance_specification: v1.0
template_standard: v1.4
compatible_governance: ">=1.0,<2.0"
compatible_template_standard: ">=1.4,<2.0"
compatible_capabilities_registry: ">=1.1,<2.0"
schema_version: 1
lifecycle_state: Active     # set at Step 4
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

No runtime capability fallback: absent CAP at Preflight yields `CAPABILITY-NOT-REGISTERED` (exit 20). Matrix mismatch = R26 FAIL (exit 10).

### §2–§16 (highlights)

- §2 Purpose — repository-wide governance audit contract.
- §3 Scope — governance validation, repository validation, registration validation, traceability validation, dependency validation, catalog consistency, metadata consistency, version consistency, SHA validation, governance drift detection.
- §4 Inputs — `docs/**`, `docs/15-governance/**`, `docs/_meta.json`, `docs/02-architecture/event-catalog.md`, Dependency Matrix, Capabilities Registry.
- §5 Outputs & Excluded Outputs —
  - **Creates:** audit report(s) under `docs/50-audit-reports/`.
  - **Updates:** execution logs only.
  - **Never modifies:** Governance Specification, Template Standard, Capabilities Registry, Dependency Matrix, Governance Templates, Module PRDs, Sprint Plans, Sprint PRDs, Baselines, registries/indices, `_meta.json`.

  **R2 — Report filename convention (deterministic):**
  ```
  docs/50-audit-reports/REPOSITORY_AUDIT_<YYYYMMDDTHHMMSSZ>.md
  ```
  UTC ISO-8601 basic form; second-granularity + tenant/instance suffix on collision.

  **R3 — Audit Report Schema:** `audit_report_schema: 1` — versioned independently of `template_version`.

  **R4 + R8 + R9 — Report front-matter (mandatory):**
  ```yaml
  repository_snapshot:
    revision: <git-sha-or-repo-revision>
    generated_at: <UTC-ISO-8601>
    governance_version: v1.0
    template_standard: v1.4
    capabilities_registry: v1.1
    dependency_matrix: v1.0.2
    audit_report_schema: 1
  audit_scope:                       # R8
    framework: GT-005
    framework_version: v1.0
    repository: full                 # enum: full | governance | module:<MOD-NNN> | profile:<name>
    profiles: [governance, repository, registration, traceability, integrity]
  report_sha256: sha256:<computed-at-emission>   # R9 — over report body excluding this field
  ```

  **R7 — Audit Severity Summary (mandatory, machine-readable):**
  ```yaml
  audit_summary:
    info: <int>
    minor: <int>
    major: <int>
    critical: <int>
    total: <int>       # = info + minor + major + critical
    result: PASS | FAIL | WAIVED
  ```
  `result = FAIL` if `critical > 0` or `major > 0` and unwaived; otherwise `PASS`. Waived findings are counted in their severity bucket **and** listed in a `waivers:` array.

- §6 Preconditions — governance framework at declared versions; Dependency Matrix v1.0.2 with GT-005/EDGE-005..008 Active.
- §7 Execution Workflow — 8 deterministic idempotent steps: Preflight → Dependency Resolution → Repository Scan → Validation → Report Assembly → Report Emission → Verification → Completion.
- §8 Execution State Machine — `preflight → resolving → scanning → validating → assembling → emitting → verifying → complete | failed`.
- §9 Failure Object Schema + Runtime Rollback — standard `Finding ID | Severity (INFO|MINOR|MAJOR|CRITICAL) | Evidence | Resolution | Status (Open|Resolved|Waived)`. Severity vocabulary is normative and feeds `audit_summary` buckets. Runtime rollback: GT-005 creates no governance mutations; rollback applies only to interim report artifacts. Report emission is idempotent (same inputs + snapshot → identical body except `generated_at` and `report_sha256`).
- §10 Validation Rules — **VAL-001..VAL-018**:

  | ID | Check |
  |---|---|
  | VAL-001 | Template registration completeness |
  | VAL-002 | Catalog consistency |
  | VAL-003 | `DOCUMENT_INDEX.md` consistency |
  | VAL-004 | `_meta.json` sidebar consistency |
  | VAL-005 | Dependency Matrix consistency (markdown ↔ YAML parity) |
  | VAL-006 | Capabilities Registry consistency |
  | VAL-007 | Governance Template Registry consistency |
  | VAL-008 | Governance Template Index consistency |
  | VAL-009 | Lifecycle-state consistency across surfaces |
  | VAL-010 | SHA integrity (`template_sha256`, `asset_sha256`, `report_sha256`) |
  | VAL-011 | YAML derivation parity (R27) |
  | VAL-012 | Placeholder discipline (no TBD/TODO) |
  | VAL-013 | Version compatibility (SemVer resolution across edges) |
  | VAL-014 | UUID uniqueness across templates |
  | VAL-015 | Repository completeness (every referenced doc resolves) |
  | VAL-016 | Governance drift detection (no unauthorized mutation of frozen assets) |
  | VAL-017 | Deterministic execution (identical repo state → identical report body modulo `generated_at`/`report_sha256`) |
  | VAL-018 | Audit reproducibility (report contains `repository_snapshot` + `audit_scope`) |

- §11 Automation Exit Codes — `0` OK · `10` R26 conflict · `20` DEPENDENCY-FAIL / CAPABILITY-NOT-REGISTERED · `30` VAL-fail · `40` audit-fail.

- §12 Execution Manifest —
  ```yaml
  # Normative for future "Execute GT-005"; informative for Pass 8.12.4.
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

- §13 Machine-Readable Metadata —
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

- §14 Compatibility Matrix — one v1.0 row using enum `result: PASS | FAIL | WAIVED`; recorded value `PASS`.
- §15 Example — `retainable: false` (excluded from `template_sha256`).
- §16 Change Control — Audit Trail: v1.0, Pass 8.12.4, Active.

### R5 — Identifier Immutability Rule (§10 preamble)

> Validation identifiers `VAL-001..VAL-018` and template-verification identifiers `TVAL-001..TVAL-014` are **immutable and append-only** across future GT-005 versions. Retired IDs SHALL be marked `Deprecated` but never re-numbered or reused. New checks SHALL be appended with the next unused numeric suffix.

### R10 — Audit Profile Vocabulary Rule (§13 preamble)

> The `audit_profiles` vocabulary (`governance`, `repository`, `registration`, `traceability`, `integrity`) is **frozen and append-only**. Existing profile names SHALL NOT be removed, renamed, or repurposed. New profiles SHALL be appended in future template revisions with a rationale entry in §16.

## Deliverable 2 — Dependency Matrix patch v1.0.1 → v1.0.2

Edit `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md`:

- **§5 Nodes:** GT-005 `Planned → Active`; `current_version: — → v1.0`.
- **§6 Edges:** EDGE-005, EDGE-006, EDGE-007, EDGE-008 `Planned → Active`.
- **§15 Change Control:** append `v1.0.1 → v1.0.2` — lifecycle-state transitions only.
- **§16 Audit Metadata:** append Pass 8.12.4 note.
- Recompute `asset_sha256`.

**Matrix invariant (this pass):** no edge additions/removals/redirects. `graph_version = 1` unchanged; `schema_version = 1` unchanged; document `version: v1.0.1 → v1.0.2` (SemVer patch).

Regenerate `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.yaml` from markdown (R27, one-way). YAML SHALL contain no fields absent from the markdown source.

## Deliverable 3 — Registration Surface Updates

- `GOVERNANCE_TEMPLATE_REGISTRY.md` — GT-005 v1.0, Active, Compatible Governance v1.0, Template Standard v1.4, Capabilities Registry v1.1, path, UUID, SHA, First/Latest Release `v1.0 — Pass 8.12.4`.
- `GOVERNANCE_TEMPLATE_INDEX.md` — GT-005 row `v1.0 | Active`; Matrix row `v1.0.2`.
- `docs/DOCUMENT_INDEX.md` — add `GT-005 — Repository Audit Template`.
- `docs/_meta.json` — append `GT-005 Repository Audit` under `15 Governance`; JSON validated.

## Rollback (this pass)

If Step 2 (TVAL) or Step 3 (Repository Audit) fails, Steps 4–6 are never executed — remove the Draft GT-005 file only.

Post-registration failure reverts in reverse-sequence order: `_meta.json` → `DOCUMENT_INDEX.md` → `GOVERNANCE_TEMPLATE_INDEX.md` → `GOVERNANCE_TEMPLATE_REGISTRY.md` → matrix YAML → matrix markdown (node/edge status, asset_sha256, §15/§16 rows) → GT-005 body `Active → Draft` (or delete).

## Deliverable 4 — Verification (Pass 8.12.4-V, TVAL-001..TVAL-014)

| ID | Check |
|---|---|
| TVAL-001 | Template Standard v1.4 conformance (16 sections, ordered). |
| TVAL-002 | Identity completeness (frontmatter, UUID, SHA scope). |
| TVAL-003 | UUID validity and uniqueness across template registry. |
| TVAL-004 | `template_sha256` computed and recorded (excludes retainable:false). |
| TVAL-005 | 16 sections present; report contract complete (filename R2, schema R3, snapshot R4, scope R8, `report_sha256` R9, `audit_summary` R7). |
| TVAL-006 | Validation Rules enumerate VAL-001..VAL-018 with PASS/FAIL semantics; R5 (VAL/TVAL) and R10 (`audit_profiles`) immutability clauses present. |
| TVAL-007 | Dependency Matrix sync: GT-005 Active; EDGE-005..008 Active; MVAL-006 PASS; invariant PASS (`graph_version=1`, `schema_version=1`); no `framework_release` fields introduced. |
| TVAL-008 | `GOVERNANCE_TEMPLATE_REGISTRY.md` updated. |
| TVAL-009 | `GOVERNANCE_TEMPLATE_INDEX.md` updated. |
| TVAL-010 | `DOCUMENT_INDEX.md` updated. |
| TVAL-011 | `_meta.json` valid JSON and sidebar entry present. |
| TVAL-012 | YAML parity (R27); derivation-constraint PASS. |
| TVAL-013 | Repository READY; no governance drift (Standard v1.4, Spec v1.0, Capabilities Registry v1.1 unchanged). |
| TVAL-014 | Audit metadata block present (§16); execution logged for Pass 8.12.4. |

### Verification Summary
Checklist Items: 14 / Passed: 14 / Remediated: 0 / Failed: 0 / Outstanding Risks: D3 (MEDIUM, inherited) / Repository Status: READY / Next Pass: **8.12.5 — Governance Framework v1.0 Freeze**.

## Deliverable 5 — Post-Implementation Repository Audit (Spec v1.0)

Expected: READY, Confidence MEDIUM (D3 waiver inherited).

## Deferred to Pass 8.12.5 (explicit non-scope)

- `framework_release: { version, released, frozen }` manifest — introduced by the Freeze pass, not by GT-005.
- Immutability locks on GT-001..GT-005, Template Standard v1.4, Capabilities Registry v1.1, Dependency Matrix v1.0.2.
- Governance Framework Release Manifest publication.

## Files touched

**Created:** `docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md`

**Updated:** `docs/15-governance/GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md`, `.yaml`, `GOVERNANCE_TEMPLATE_REGISTRY.md`, `GOVERNANCE_TEMPLATE_INDEX.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`.

**Never modified:** GT-001..GT-004 bodies, Template Standard v1.4, Governance Specification v1.0, Capabilities Registry v1.1, Module PRDs, Sprint Plans, Sprint PRDs, Module Baselines, `MODULE_IMPLEMENTATION_WORKFLOW.md`.

## Success Criteria

- GT-005 `Active` post-verification.
- Matrix v1.0.2: GT-005 + EDGE-005..008 Active; `graph_version` and `schema_version` unchanged.
- YAML regenerated (R27 + derivation-constraint PASS).
- Report contract complete: R2 filename, R3 schema, R4 snapshot, R7 severity summary, R8 scope, R9 checksum.
- `audit_profiles` frozen/append-only per R10; `VAL`/`TVAL` frozen/append-only per R5.
- All 14 TVAL PASS; Repository Audit PASS.
- Future audits invokable as *"Execute GT-005"*.

## Roadmap

**Next: Pass 8.12.5 — Governance Framework v1.0 Freeze** — freeze GT-001..GT-005, Template Standard v1.4, Capabilities Registry v1.1, Dependency Matrix v1.0.2; introduce `framework_release` manifest fields; publish Governance Framework Release Manifest; resume module implementation via `Execute GT-NNN for MOD-NNN`.
