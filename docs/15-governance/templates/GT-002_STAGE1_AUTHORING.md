---
title: "GT-002 — Stage 1 Authoring Template"
summary: "Governance template for Stage 1 authoring: Module PRD + Sprint Plan (greenfield and legacy reconciliation)."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "template", "stage-1", "authoring", "GT-002"]
document_type: "Governance Template"
governance_specification: v1.0
template_standard: v1.3
lifecycle_state: Active
---

# GT-002 — Stage 1 Authoring

## §1 Header — Template Identity

```yaml
template_id: GT-002
template_uuid: 6b9c83b6-abbb-45a9-b52e-7f92762e25c6
template_name: Stage 1 Authoring
template_version: v1.0
governance_specification: v1.0
template_standard: v1.3
compatible_governance: ">=1.0,<2.0"
compatible_template_standard: ">=1.3,<2.0"
compatible_capabilities_registry: ">=1.0,<2.0"
schema_version: 1
lifecycle_state: Active
owner: Architecture Office
classification: Governance Template
template_sha256: 7a1a4f43a3ecfa8e63b0f5f19b28dfbf0fd6a4b0f5e1c1cff2c15d1b6b7dcae2
capabilities:
  - stage1-authoring         # CAP-001
  - module-prd               # CAP-002
  - sprint-plan              # CAP-003
  - legacy-reconciliation    # CAP-006
  - registration             # CAP-007
  - repository-audit         # CAP-008
depends_on: []
supersedes: []
related_to: []
```

## §2 Purpose

Produce a canonical **Stage 1 Module PRD** and a **Stage 1 Sprint Plan** for a target module (`MOD-NNN`) under Governance Specification v1.0. Applicable to both greenfield authoring and reconciliation of pre-v1.0 legacy artifacts.

## §3 Scope

- In scope: Module PRD authoring, Sprint Plan authoring, registration across governance surfaces, Stage 1 verification, and repository audit.
- Out of scope: Sprint PRD (Stage 2) authoring, Baseline (Stage 3) authoring, engine or ADR authoring, database or code changes.

## §4 Applicability

- Any module `MOD-NNN` declared in `docs/MODULE_CATALOG.md` and not yet Stage 1 complete.
- Legacy modules with pre-v1.0 PRDs missing a canonical Sprint Plan (delegates to GT-001 for reconciliation of the legacy PRD; GT-002 authors the missing Sprint Plan and normalizes the reconciled PRD).

## §5 Preconditions

- Governance Specification v1.0 is frozen.
- `GOVERNANCE_TEMPLATE_STANDARD.md` at `v1.3` or higher.
- `GOVERNANCE_TEMPLATE_CAPABILITIES.md` at `v1.0` or higher; all declared `capabilities` slugs resolve to Active `CAP-NNN` rows.
- Target `MOD-NNN` is registered in `docs/MODULE_CATALOG.md`.
- No open corrective pass against the target module.

## §6 Inputs

| Input | Source | Class | requires |
|---|---|---|---|
| Governance Specification | `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` | Primary | `>=1.0,<2.0` |
| Template Standard | `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md` | Primary | `>=1.3,<2.0` |
| Capabilities Registry | `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` | Primary | `>=1.0,<2.0` |
| Module Catalog | `docs/MODULE_CATALOG.md` | Primary | n/a |
| Engines Catalog | `docs/10-erp-core/ENGINES_CATALOG.md` (or equivalent) | Primary | n/a |
| ADR Repository | `docs/11-adrs/` | Primary | n/a |
| Legacy Module PRD (if reconciling) | `docs/20-module-prds/<module-slug>/MODULE_PRD.md` | Secondary | n/a |

## §7 Outputs

```yaml
outputs:
  - path: docs/20-module-prds/<module-slug>/MODULE_PRD.md
    kind: module-prd
    action: create-or-reconcile
  - path: docs/30-sprint-prds/<module-slug>/MOD-NNN_SPRINT_PLAN.md
    kind: sprint-plan
    action: create
excluded_outputs:
  - docs/30-sprint-prds/<module-slug>/SPR-*.md   # Stage 2 artifacts, out of scope
  - docs/40-module-baselines/*                    # Stage 3 artifacts, out of scope
required_registration_surfaces:
  - docs/DOCUMENT_INDEX.md
  - docs/_meta.json
  - docs/20-module-prds/README.md (or module-scoped README)
  - docs/30-sprint-prds/<module-slug>/README.md
optional_registration_surfaces:
  - docs/SPRINT_CATALOG.md
  - docs/DOCUMENT_TRACEABILITY.md
  - docs/DOCUMENT_OWNERSHIP_MATRIX.md
```

## §8 Authoritative Sources

| Source | Class |
|---|---|
| `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` (Governance Spec v1.0) | Primary |
| `docs/MODULE_CATALOG.md` | Primary |
| `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md` | Primary |
| `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` | Primary |
| Engines Catalog + `docs/11-adrs/` | Primary |
| Prior Stage 1 baselines (MOD-003, MOD-004, MOD-005, MOD-019) | Secondary |
| Legacy Module PRD (if present) | Secondary |
| Prior execution logs in `.lovable/plan.md` | Informational |

## §9 Execution Workflow

1. **Preflight** — verify all §5 preconditions; abort with `PRECONDITION-FAIL` (`exit_code 20`) on any miss.
2. **Allocation Gate** — enumerate the target module's declared capabilities from the Module Catalog; validate each maps to at least one planned sprint scope. FAIL ⇒ `ALLOC-FAIL` (`exit_code 20`).
3. **Author Module PRD** — greenfield: apply the canonical 17-section structure; legacy: invoke GT-001 for reconciliation, then normalize.
4. **Author Sprint Plan** — enumerate sprints with capability allocations; ensure bidirectional traceability with the Module PRD.
5. **Register** — update required registration surfaces (§7); update optional surfaces when present in the repository.
6. **Verify** — execute the 13-check Stage 1 Verification (see §10).
7. **Audit** — execute Repository Audit Spec v1.0 with evidence rows.
8. **Record** — append execution record to `.lovable/plan.md` with `template_id`, `template_uuid`, `template_version`, execution instance ID.

## §10 Validation Rules

| ID | Check | Result Semantics |
|---|---|---|
| VAL-001 | Module PRD present at canonical path | PASS/FAIL |
| VAL-002 | Module PRD contains all 17 canonical sections in order | PASS/FAIL |
| VAL-003 | Sprint Plan present at canonical path | PASS/FAIL |
| VAL-004 | Sprint Plan enumerates sprints with capability allocations | PASS/FAIL |
| VAL-005 | Every Module PRD capability maps to ≥1 sprint (bidirectional) | PASS/FAIL |
| VAL-006 | Every sprint maps to ≥1 Module PRD capability (bidirectional) | PASS/FAIL |
| VAL-007 | All required registration surfaces updated | PASS/FAIL |
| VAL-008 | Frontmatter cites `governance_specification: v1.0` and `template_standard: v1.3` (or compatible) | PASS/FAIL |
| VAL-009 | Owner, engines, ADRs, and events resolve verbatim from Primary sources | PASS/FAIL |
| VAL-010 | No leakage of unrelated module identifiers | PASS/FAIL |
| VAL-011 | Legacy provenance preserved (if reconciling) via `legacy_updated` | PASS/FAIL |
| VAL-012 | Verification Summary present with mathematically consistent counts | PASS/FAIL |
| VAL-013 | Repository Audit Spec v1.0 completed with evidence rows | PASS/FAIL |
| VAL-014 | Capability resolution + dependency satisfaction under R24 semantics: every `capabilities` slug resolves to an Active `CAP-NNN`; `depends_on` satisfied ⇒ PASS, unsatisfied ⇒ FAIL (`DEPENDENCY-FAIL`, `exit_code 20`); `related_to` unresolved ⇒ `INFO` (non-blocking); `supersedes` misuse ⇒ blocking at registry-commit gate | PASS/FAIL/INFO |

## §11 Failure Handling

On any blocking FAIL, emit a Failure Object:

```yaml
finding_id: <FIND-NNN>
severity: <INFO|MINOR|MAJOR|CRITICAL>
code: <PRECONDITION-FAIL|ALLOC-FAIL|VERIFY-FAIL|AUDIT-FAIL|DEPENDENCY-FAIL>
exit_code: <0|10|20|30>
evidence: <path + quote>
resolution: <required action>
status: Open
```

Draft rollback: any partially authored Module PRD or Sprint Plan created during a failed execution SHALL be reverted or marked `lifecycle_state: Draft` until remediation completes.

Automation exit codes: `0` Success · `10` Validation failure · `20` Dependency/precondition failure · `30` Audit failure.

## §12 Completion Criteria

- All VAL-001..VAL-014 PASS (INFO findings allowed for VAL-014 related_to).
- All required registration surfaces updated.
- Repository Audit Spec v1.0 = READY.
- Execution record appended to `.lovable/plan.md`.

## §13 Versioning

- SemVer `Major.Minor` per `GOVERNANCE_TEMPLATE_LIFECYCLE.md`.
- Version comparison SHALL follow Semantic Versioning 2.0 precedence rules.

## §14 Compatibility

| template_version | governance_specification | template_standard | capabilities_registry | matrix_entry | result |
|---|---|---|---|---|---|
| v1.0 | v1.0 | v1.3 | v1.0 | matrix_entry-001 | PASS |

Execution Manifest fields required at invocation: `template_id`, `template_uuid`, `template_version`, `execution_instance_id`, `target_module`, `mode` (`greenfield` \| `legacy-reconciliation`), `timestamp`, `repository_revision` (when available).

## §15 Audit Metadata

This template does not alter any prior verification, audit, or execution counts. Historical execution records, invariant counts (e.g., MOD-003 13/13, MOD-004 13/13, MOD-005 12/12, MOD-019 18/18), and semantic-invariant tallies remain unchanged. GT-002 v1.0 is additive; its introduction affects only future Stage 1 executions.

*This section is excluded from `template_sha256`.*

## §16 Change Control

| Version | Change Summary | Governance Version | Lifecycle State |
|---|---|---|---|
| v1.0 | Initial release. Extracts Stage 1 authoring rules into a reusable governance asset. Compatible with Governance Specification v1.0 and Template Standard v1.3. Uses Capabilities Registry v1.0 with formal capability-relationship semantics (execution / validation / traceability / version_scope axes). | v1.0 | Active |

---

## Example Instantiation (Non-Retainable)

*Non-normative. Excluded from `template_sha256`. Provided for illustration only; SHALL NOT be reused verbatim in future executions.*

Invocation: `Execute GT-002 for MOD-007 HRMS.`

- Preflight passes; MOD-007 is registered in `docs/MODULE_CATALOG.md` and has no prior Stage 1 artifact.
- Allocation Gate maps HRMS capabilities to planned sprints.
- Module PRD authored at `docs/20-module-prds/hrms/MODULE_PRD.md`.
- Sprint Plan authored at `docs/30-sprint-prds/hrms/MOD-007_SPRINT_PLAN.md`.
- Registration, Verification (13/13 PASS), Audit (READY, MEDIUM).
