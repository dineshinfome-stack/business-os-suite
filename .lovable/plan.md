
# Pass 8.12.1 — GT-002 Stage 1 Authoring Template (Governance Asset) — v10

## Objective

Author **GT-002 Stage 1 Authoring** as an Active governance template so future Stage 1 executions (greenfield + legacy reconciliation) can be invoked by reference (`"Execute GT-002 for MOD-NNN"`) instead of embedding Stage 1 governance in every prompt.

**Strict scope**: Template asset creation + additive governance-framework refinements. No module, PRD, Sprint Plan, or Baseline is authored or modified.

## Changes from v9 (Additive, Non-Breaking)

- **R24 — Capability Relationship Semantics.** The Capabilities registry defines the *schema* of `depends_on / supersedes / related_to` (R23). v10 defines their *operational meaning* so automation is unambiguous. Semantics are declared once in `GOVERNANCE_TEMPLATE_CAPABILITIES.md` under a new **§Relationship Semantics** block (schema unchanged; interpretation formalized):

  ```yaml
  relationship_semantics:
    depends_on:
      execution: required               # target capability MUST be satisfiable within the current execution graph
      validation: blocking              # unsatisfied dependency ⇒ VAL-014 FAIL (exit_code 20, DEPENDENCY-FAIL)
      traceability: recorded            # edge appears in traceability reports
      version_scope: any                # may span Major versions
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

  Rules:
  - Semantics are declared **once** per relationship kind; individual rows do not override.
  - Adding a new relationship kind = **Minor**. Changing the semantics of an existing kind = **Major** (breaking for automation contracts).
  - `depends_on` satisfaction for GT-002 v1.0 is evaluated against (a) the template's own `capabilities` set and (b) capabilities declared by templates listed in its `depends_on` (template-level). If either satisfies the graph, VAL-014 PASSes. Because the v1.0 registry declares no edges, VAL-014 is guaranteed PASS in this pass.
  - `supersedes` MAY appear in registry v1.0 only if paired with a Major registry bump; therefore v1.0 declares none.
  - `related_to` never blocks completion; findings surface under severity `INFO`.

Retained from prior versions: `template_uuid` (R6), Execution State Machine (R7), Failure Object Schema (R8), `outputs`/`excluded_outputs` (R9), `VAL-014` (R10), Required vs Optional registration surfaces (R11), Capability Descriptor (R12), Input Version Constraints (R13), Execution Manifest (R14), Unified Severity Vocabulary (R15), Automation Exit Codes (R16), Canonical Capability Vocabulary rule (R17), SemVer 2.0 Precedence (R18), explicit `governance_specification` + `template_standard` identity (R19), Standard Versioning Thresholds (R20), Externalized Capabilities Registry (R21), Stable `CAP-NNN` IDs (R22), Capability Relationship metadata schema (R23).

## Non-Goals (Hard Guardrails)

- SHALL NOT modify the 16-section structure of `GOVERNANCE_TEMPLATE_STANDARD.md`.
- SHALL NOT author or modify any Module PRD, Sprint Plan, or Baseline.
- SHALL NOT execute Stage 1 for any module.
- SHALL NOT modify GT-001 or Governance Specification v1.0.
- SHALL NOT modify any historical execution log or audit record.
- SHALL NOT introduce new severity or capability values beyond the registered vocabularies.
- SHALL NOT reuse a retired `capability_id`.
- SHALL NOT introduce relationship cycles.
- SHALL NOT re-interpret an existing relationship kind without a Major registry bump.

## Deliverables

### Created
1. `docs/15-governance/templates/GT-002_STAGE1_AUTHORING.md`.
2. `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` — authoritative registry with `CAP-NNN` primary keys, optional relationship metadata schema (R23), and formal Relationship Semantics block (R24).

### Updated
3. `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md` — Minor amendment `v1.2 → v1.3`:
   - Add **§Rules → Versioning Thresholds** (R20).
   - Replace inline capability list with citation of `GOVERNANCE_TEMPLATE_CAPABILITIES.md` (R21).
   - Add **§Rules → Capability Identity** (R22).
   - Add **§Rules → Capability Relationships** (R23).
   - Add **§Rules → Capability Relationship Semantics** (R24) — declares the four axes (`execution`, `validation`, `traceability`, `version_scope`) and cites the Capabilities registry as authoritative.
4. `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` — GT-002 → `Active`; add row for the Capabilities registry.
5. `docs/15-governance/GOVERNANCE_TEMPLATE_INDEX.md` — GT-002 → `v1.0` / `Active`; add Capabilities registry.
6. `docs/15-governance/GOVERNANCE_TEMPLATE_LIFECYCLE.md` — informational note that the Capabilities registry follows the same lifecycle.
7. `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`, `docs/REPOSITORY_MAP.md` — register the two new files.

## New File — `GOVERNANCE_TEMPLATE_CAPABILITIES.md`

Frontmatter:

```yaml
title: "Governance Template Capabilities Registry"
document_type: "Governance Registry"
governance_specification: v1.0
template_standard: v1.3
registry_version: v1.0
lifecycle_state: Active
owner: Architecture Office
```

Sections:

- **§1 Schema** — row shape: `capability_id | slug | name | description | since | aliases | depends_on | supersedes | related_to | status`.
- **§2 Relationship Semantics** — the `relationship_semantics` block from R24 verbatim.
- **§3 Registry Rules** — `capability_id` immutable/monotonic/non-reused; version-bump thresholds (Patch/Minor/Major) for edits; acyclicity across `depends_on ∪ supersedes`; `supersedes` restricted to `version_scope: major-only`; slug refinements are Patch and must record prior slug under `aliases`.
- **§4 Capabilities Table** (v1.0, `CAP-001..CAP-010`, relationship columns empty):

  | capability_id | slug | name | description | since | aliases | depends_on | supersedes | related_to | status |
  |---|---|---|---|---|---|---|---|---|---|
  | CAP-001 | `stage1-authoring` | Stage 1 Authoring | Module PRD + Sprint Plan authoring | v1.0 | — | — | — | — | Active |
  | CAP-002 | `module-prd` | Module PRD Authoring | Produces a Stage 1 Module PRD | v1.0 | — | — | — | — | Active |
  | CAP-003 | `sprint-plan` | Sprint Plan Authoring | Produces a Stage 1 Sprint Plan | v1.0 | — | — | — | — | Active |
  | CAP-004 | `sprint-authoring` | Sprint PRD Authoring | Stage 2 Sprint PRD authoring | v1.0 | — | — | — | — | Active |
  | CAP-005 | `baseline-consolidation` | Baseline Consolidation | Stage 3 Module Baseline authoring | v1.0 | — | — | — | — | Active |
  | CAP-006 | `legacy-reconciliation` | Legacy Reconciliation | Pre-Governance-v1.0 artifact normalization | v1.0 | — | — | — | — | Active |
  | CAP-007 | `registration` | Registration | Governance-surface registration | v1.0 | — | — | — | — | Active |
  | CAP-008 | `repository-audit` | Repository Audit | Repository-wide Spec v1.0 audit | v1.0 | — | — | — | — | Active |
  | CAP-009 | `verification` | Verification | Standardized post-implementation verification | v1.0 | — | — | — | — | Active |
  | CAP-010 | `drift-report` | Drift Report | Legacy governance drift reporting | v1.0 | — | — | — | — | Active |

## Template Identity (Header §1)

```yaml
template_id: GT-002
template_uuid: <UUIDv4 generated at authoring time>
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
template_sha256: <computed over §1–14 + §16, excluding §15 and Example>
capabilities:                                  # slugs resolve to CAP-NNN in registry
  - stage1-authoring     # CAP-001
  - module-prd           # CAP-002
  - sprint-plan          # CAP-003
  - legacy-reconciliation # CAP-006
  - registration         # CAP-007
  - repository-audit     # CAP-008
```

## GT-002 Document Structure

Identical to v9 except:

- **§10 Validation Rules** — VAL-014 sub-rules now evaluate relationships under R24 semantics:
  - `depends_on` unresolved / unsatisfied ⇒ **blocking** FAIL (`DEPENDENCY-FAIL`, exit_code 20).
  - `related_to` unresolved ⇒ **informational** finding (`INFO`), non-blocking.
  - `supersedes` misuse (target missing, cyclic, or declared outside a Major registry bump) ⇒ **blocking** at registry-commit gate, not at template execution.
- **§14 Compatibility Matrix**: `v1.0 | governance v1.0 | template_standard v1.3 | capabilities_registry v1.0 | matrix_entry-001 | PASS`.
- **§16 Change Control** appends: *"…adds formal capability-relationship semantics (execution / validation / traceability / version_scope axes)."*

## Standard Amendment (v1.2 → v1.3) — Details

Additive changes to `GOVERNANCE_TEMPLATE_STANDARD.md`:

- **§Rules → Versioning Thresholds** (R20).
- **§Rules → Canonical Capability Vocabulary** — cites `GOVERNANCE_TEMPLATE_CAPABILITIES.md` (R21).
- **§Rules → Capability Identity** (R22).
- **§Rules → Capability Relationships** — schema (R23).
- **§Rules → Capability Relationship Semantics** — declares the four axes and cites the registry as authoritative (R24).

No structural change. No prior template invalidated. Standard SHA recomputed. Governance Specification compatibility unchanged (`v1.0`).

## Execution Workflow (this pass)

1. **Preflight** — GT-001 Active (v1.1); Standard at `v1.2`; `docs/15-governance/templates/` absent; GT-002 row `Planned`; `GOVERNANCE_TEMPLATE_CAPABILITIES.md` absent.
2. **Author Capabilities Registry** at `registry_version: v1.0`: §1 Schema, §2 Relationship Semantics (R24), §3 Registry Rules, §4 Capabilities Table with `CAP-001..CAP-010` and empty relationship columns.
3. **Amend Standard** `v1.2 → v1.3` (R20 + R21 + R22 + R23 + R24 additions); recompute Standard SHA.
4. **Author** `docs/15-governance/templates/GT-002_STAGE1_AUTHORING.md`; generate `template_uuid`; populate Header.
5. **Compute** `template_sha256` over §1–14 + §16 (excluding §15 and Example).
6. **Update** REGISTRY, INDEX, LIFECYCLE (informational note), DOCUMENT_INDEX, _meta.json, REPOSITORY_MAP.
7. **Template Validation** (13 checks):
   (a) 16 sections present & in order;
   (b) Header complete (incl. `template_uuid`, `capabilities`, `governance_specification`, `template_standard`, `compatible_capabilities_registry`);
   (c) every `capabilities` slug resolves to a `capability_id` at `status: Active`;
   (d) VAL-001..VAL-014 enumerated;
   (e) Compatibility Matrix cites Standard v1.3, Governance v1.0, Capabilities Registry v1.0;
   (f) Audit Metadata verbatim;
   (g) Example labeled non-retainable, excluded from SHA;
   (h) Dependency `requires:` ranges parseable under SemVer 2.0; Automation Exit Codes and Execution Manifest present;
   (i) `governance_specification` and `template_standard` resolve to concrete versions;
   (j) Standard Versioning Thresholds section present; this pass correctly categorized as Minor;
   (k) Capabilities registry rows carry unique, monotonic, non-reused `capability_id` values;
   (l) `depends_on / supersedes / related_to` schema present; all present edges (none in v1.0) resolve; `depends_on ∪ supersedes` graph acyclic;
   (m) `relationship_semantics` block present with all four axes defined for all three kinds; no `supersedes` edge declared outside a Major registry bump.
8. **Repository Audit (Spec v1.0)** — evidence rows: Governance Spec v1.0 unchanged; GT-001 body unchanged; Standard bumped `v1.2 → v1.3` additive-only; Capabilities Registry authored at `v1.0` with `CAP-NNN` keys, relationship schema, and formal semantics; GT-002 registered; no module/PRD/baseline touched; historical logs unchanged. Expected: `READY`, Confidence `MEDIUM` (D3 waiver).
9. **Append** execution record to `.lovable/plan.md`.

## Verification Summary (target)

| Checklist Items | Passed | Remediated | Failed | Outstanding Risks | Repository Status | Next Pass |
|---|---|---|---|---|---|---|
| 13 Template Validation + audit evidence rows | all | 0 | 0 | None | READY | Pass 8.12.2 — GT-003 Sprint Authoring (or begin module execution invoking GT-002) |

## Success Criteria

- `GOVERNANCE_TEMPLATE_STANDARD.md` at `v1.3` with Versioning Thresholds, Capabilities citation, Capability Identity, Capability Relationships, and Capability Relationship Semantics rules.
- `GOVERNANCE_TEMPLATE_CAPABILITIES.md` at `v1.0`, Active, with immutable `CAP-001..CAP-010`, optional relationship schema, and formal `relationship_semantics` block.
- GT-002 `Active`; every slug resolves to a `capability_id`; relationship graph acyclic; automation contract for relationship enforcement is unambiguous.
- Registry gains a row for the Capabilities registry; GT-001 body unaffected.
- Template conforms to Standard v1.3; 16-section structure preserved.
- Failure Objects carry `exit_code`; unified severity and capability vocabularies in effect via registry authority.
- No module artifact changed; no prior execution invalidated.
- Future Stage 1 prompts reduce to: *"Execute GT-002 for MOD-NNN"*.

---

## Execution Record — Pass 8.12.1 v10 (2026-07-12)

**Template**: GT-002 Stage 1 Authoring · **UUID**: `6b9c83b6-abbb-45a9-b52e-7f92762e25c6` · **Version**: v1.0 · **Instance**: `GT-002-v1.0-BOOTSTRAP-001`

### Deliverables
- Created `docs/15-governance/templates/GT-002_STAGE1_AUTHORING.md` (v1.0, Active).
- Created `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` (registry v1.0) — `CAP-001..CAP-010`, §2 formal Relationship Semantics (R24), §3 Registry Rules.
- Amended `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md` `v1.2 → v1.3` (additive: R20, R21, R22, R23, R24).
- Updated REGISTRY (GT-002 Active + Capabilities registry row), INDEX (Companion Registries), LIFECYCLE (companion note), DOCUMENT_INDEX, `_meta.json` (JSON validated), REPOSITORY_MAP untouched (unchanged tree line already covers `15-governance/`).

### Template Validation (13/13 PASS)
(a) 16 sections ✓  (b) Header incl. `template_uuid`, `capabilities`, spec/standard/registry compat ✓  (c) all slugs resolve to Active `CAP-NNN` ✓  (d) VAL-001..VAL-014 enumerated ✓  (e) Compatibility Matrix cites Standard v1.3 / Gov v1.0 / Cap Registry v1.0 ✓  (f) Audit Metadata verbatim ✓  (g) Example labeled non-retainable, excluded from SHA ✓  (h) `requires:` SemVer-parseable; exit codes + Execution Manifest present ✓  (i) `governance_specification` & `template_standard` concrete ✓  (j) Versioning Thresholds present; this pass = Minor (Standard) + Bootstrap (Capabilities v1.0) ✓  (k) `CAP-NNN` unique/monotonic/non-reused ✓  (l) relationship schema present; v1.0 declares no edges; `depends_on ∪ supersedes` acyclic (empty) ✓  (m) `relationship_semantics` block declares all four axes for all three kinds; no `supersedes` outside Major bump ✓.

### Repository Audit (Spec v1.0)
| Check | Evidence | Result |
|---|---|---|
| Governance Spec v1.0 unchanged | `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` not modified this pass | PASS |
| GT-001 body unchanged | `docs/15-governance/` GT-001 asset untouched | PASS |
| Standard bumped v1.2 → v1.3 (additive) | `standard_version: v1.3` frontmatter; rules R20–R24 appended | PASS |
| Capabilities Registry authored v1.0 | `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` created | PASS |
| GT-002 Active in Registry | `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` updated | PASS |
| No module/PRD/Baseline touched | Only `15-governance/`, DOCUMENT_INDEX, _meta.json modified | PASS |
| Historical logs unchanged | Prior `.lovable/plan.md` records preserved; append-only | PASS |
| `_meta.json` valid | `python3 -c "json.load(...)"` = OK | PASS |

**Verification Summary**

| Checklist Items | Passed | Remediated | Failed | Outstanding Risks | Repository Status | Confidence | Next Pass |
|---|---|---|---|---|---|---|---|
| 13 | 13 | 0 | 0 | None | READY | MEDIUM (D3 waiver — repository revision identifier unavailable) | Pass 8.12.2 — GT-003 Sprint Authoring, or invoke GT-002 for MOD-007 |

