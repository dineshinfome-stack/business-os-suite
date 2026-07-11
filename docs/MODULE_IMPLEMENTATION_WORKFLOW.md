---
title: "Module Implementation Workflow"
summary: "Repository-wide three-stage cadence for taking every module (MOD-001 … MOD-018) from Module PRD to Module Baseline: Stage 1 Planning → Stage 2 Sprint PRD Authoring → Stage 3 Module Baseline."
layer: "delivery"
owner: "Engineering"
status: "approved"
updated: "2026-07-07"
tags: ["workflow", "governance", "sprint", "module", "process"]
document_type: "Governance Guide"
---

# Module Implementation Workflow

> **Repository-wide governance.** This workflow is repository-wide and applies to every module from **MOD-001 through MOD-018**. Pass 8.2.0 introduces the workflow and applies it to **Platform Administration (MOD-001)** as the first implementation example. All subsequent module implementations follow the same three stages without deviation.

## Purpose

Every module implementation follows the same **three-stage cadence**:

1. **Stage 1 — Module Sprint Planning** (architecture of the module).
2. **Stage 2 — Sprint PRD Authoring** (iterative, one sprint at a time).
3. **Stage 3 — Module Baseline** (freeze the module for downstream consumption).

The workflow ensures that Sprint PRDs are consistent across modules, that every sprint traces to Module PRD content and to Accepted upstream architecture (ERP Core Engines, ADRs), and that a module is only considered "done" when it has an objective, versioned baseline.

## Applicability

- **Scope:** repository-wide, `MOD-001` … `MOD-018`.
- **Precedes:** any Sprint PRD authoring in `docs/30-sprint-prds/<module>/`.
- **Consumes:** the frozen upstream (Foundation, Canon, Architecture, ERP Core Engines, ADRs), the parent Module PRD, and the Sprint framework (`SPRINT_AUTHORING_GUIDE.md`, `SPRINT_ROADMAP.md`, `SPRINT_ESTIMATION_GUIDE.md`, `SPRINT_DEPENDENCY_MATRIX.md`).
- **Does not modify:** any upstream layer. Each stage is documentation-only unless a downstream implementation pass explicitly follows a completed baseline.

## Pass Numbering Convention

Passes for module implementation planning are numbered so the stage is unambiguous from the pass identifier:

| Pass identifier | Meaning |
| --- | --- |
| `Pass 8.<M>.0` | **Stage 1** — Sprint Planning for module `M`. |
| `Pass 8.<M>.<N>` | **Stage 2** — authoring of sprint `N` for module `M` (`N ≥ 1`). |
| `Pass 8.<M>.Z` | **Stage 3** — Module Baseline for module `M`. |

Here `M` is the numeric position of the module in dependency order, not the module identifier: `Pass 8.2` is MOD-001 (Platform Administration), `Pass 8.3` is MOD-002 (Accounting), and so on, mirroring the sequencing in `SPRINT_ROADMAP.md`.

## Stages

### Stage 1 — Module Sprint Planning

**Deliverable:** `docs/30-sprint-prds/<module>/MOD-<NNN>_SPRINT_PLAN.md`.

**Entry criteria:**

- The parent Module PRD (`docs/20-module-prds/<module>/MODULE_PRD.md`) is `approved`.
- The module's sprint folder README exists with the correct `sprint_prefix`.
- All ERP Core Engines and ADRs the module consumes are `Accepted` or explicitly documented as `Proposed` in the Module PRD's decisions register.

**Required content:**

- Purpose & Scope (traceable to Module PRD sections).
- Sprint Sequence — proposed ordered list of sprints, each with:
  - Objective, boundaries (in / out).
  - Estimated size (Small / Medium / Large, per `SPRINT_ESTIMATION_GUIDE.md`).
  - Parent Module PRD sections covered.
  - Engines consumed (`ENG-NNN`), ADRs consumed (`ADR-NNN`).
  - Intra-module dependencies (upstream sprints in the same module).
  - **Sprint Exit Criteria** — objective, testable conditions that must hold before the next sprint may begin. Distinct from Module Completion Criteria.
- Sprint Dependency Graph (ASCII).
- Engine Consumption Map (sprint × `ENG-NNN`).
- ADR Consumption Map (sprint × `ADR-NNN`).
- Cross-Sprint Dependency Matrix (shared migrations, feature flags, events).
- Risks & Assumptions.
- Module Completion Criteria — objective conditions for Stage 3 baseline.
- Non-Goals — no Sprint PRDs authored, no engine/ADR changes proposed.

**Sprint identifier reservations.** The Stage 1 plan may reserve sprint identifiers (`SPR-MOD-<NNN>-001`, `-002`, …) as **planning reservations**. Reserved identifiers are **not** authored Sprint PRDs, are **not** listed in `SPRINT_CATALOG.md`, and confer no commitment beyond ordering.

**Exit criteria:**

- Planning document approved (status `approved`).
- All reserved sprint IDs are contiguous starting from `-001`.
- Every reserved sprint traces to at least one Module PRD section.
- No orphan engine or ADR references.

**Governance:** owned by Engineering; reviewed by Engineering + Architecture.

### Stage 2 — Sprint PRD Authoring

**Deliverables:** `docs/30-sprint-prds/<module>/SPR-MOD-<NNN>-<sprint>.md`, authored one at a time.

**Iterative loop.** For each sprint reserved in Stage 1, in the order defined by the plan:

1. **Author** the Sprint PRD using `docs/99-templates/sprint-prd-template.md` and `SPRINT_AUTHORING_GUIDE.md` (including the Sprint Traceability Rule and the Sprint Completion Rule).
2. **Review** for consistency with the Stage 1 plan (scope, engines, ADRs, dependencies, exit criteria).
3. **Approve** — lifecycle transitions per the Sprint Lifecycle Clarification below and `docs/DOCUMENT_OWNERSHIP_MATRIX.md`.
4. **Register** in `docs/SPRINT_CATALOG.md` at the moment the Sprint PRD is authored (not before).
5. **Advance** to the next sprint only when the current sprint's exit criteria are objectively met.

**Rules:**

- One Sprint PRD per pass (`Pass 8.<M>.<N>`); no batching.
- No new engines, ADRs, or Module PRD changes may be introduced from within a Sprint PRD. If discovered as necessary, they must first be raised through their own governance process before Stage 2 continues.
- The Stage 1 plan MAY be amended between sprints if new information invalidates it; amendments are explicit and versioned.

**Exit criteria for the stage:** every sprint reserved in the current Stage 1 plan has status `Done`.

**Governance:** owned by Engineering; each Sprint PRD is reviewed by Engineering.

#### Sprint Lifecycle Clarification (canonical)

This is the single canonical definition of each Sprint PRD status used across `SPRINT_CATALOG.md`, module subfolder READMEs, and Sprint PRD frontmatter. Any other document that references these statuses MUST either point at this section or use identical language.

- **`Draft`** — Sprint PRD authored, not yet reviewed.
- **`Planned`** — Sprint PRD reviewed and accepted for execution; not yet in flight. Optional intermediate state; MAY be skipped for documentation-only sprints.
- **`In Progress`** — Sprint PRD is actively being executed.
- **`Done`** — Sprint PRD is included in an approved Module Baseline (Stage 3). Transition to `Done` is performed **only** by the Stage 3 pass authoring the baseline.
- **`Superseded`** — Sprint PRD replaced by a later Sprint PRD.

### Stage 3 — Module Baseline

**Deliverable:** `docs/40-module-baselines/MOD<NNN>_<MODULE>_BASELINE_v<version>.md` (a milestone document, versioned; version increments as `v1`, `v2`, …). Module Baselines live in the top-level `docs/40-module-baselines/` layer — not inside individual module subfolders — so every baseline is discoverable in one place.

**Entry criteria:**

- Every Sprint PRD reserved in the Stage 1 plan has status `Done`.
- Every Module Completion Criterion in the Stage 1 plan is objectively satisfied.
- No sprint has ended with unresolved architectural exceptions.

**Purpose.** Freeze the module for downstream consumption. The baseline restates, without redefining:

- The Module PRD version at the time of baseline.
- The full list of Sprint PRDs delivered (identifiers, sizes, exit criteria met).
- Engines and ADRs consumed.
- Known limitations and deferred enhancements (routed to future Sprint PRDs or future Module PRD revisions).

**Exit criteria:** baseline document approved; downstream modules may now depend on this module's capabilities.

**Governance:** owned by Engineering; approved by Engineering + Architecture + Product.

## Verification Reporting Standard

**Scope — repository-wide.** This reporting standard applies to *every* repository verification pass, not only Sprint PRD verification. It governs, without limitation:

- Sprint PRD verification (`Pass N-V`).
- Module Baseline verification.
- Architecture verification.
- ADR verification.
- Governance / repository-wide audit passes.
- Any future pass whose primary purpose is verification against an authoritative source.

Every such pass MUST close with **three** artifacts, in the following order. The checklist length is pass-specific; the reporting shape is universal.

### Repository-standard verification checklist (10 mandatory items)

Effective with **Pass 8.4.3**, the repository-standard verification checklist for Sprint PRD verification is **10 mandatory items**. Prior passes used a 9-item checklist; the standard is promoted to 10 items by adding **Cross-module ownership validation** as the final mandatory check. All future Sprint PRD authoring and verification passes (Sprint 4 / 5 / 6 of every module, and every subsequent module — Purchase, Inventory, CRM, Projects, Payroll, POS, and beyond) inherit this 10-item standard from this document.

The 10 mandatory checks are:

1. Frontmatter completeness and correctness.
2. Structural conformance to the Sprint PRD template.
3. Engine allocation matches `ENGINE_USAGE_MATRIX.md` and the parent Sprint Plan verbatim.
4. ADR references are Accepted-only and present in `ADR_INDEX.md`.
5. Events reference only authoritative names in the event catalog, or are deferred via a documented `R-EV-*` risk.
6. Bidirectional traceability to the parent Module PRD — no orphan deliverables and no unallocated chartered capabilities.
7. Dependencies resolve consumer module identifiers verbatim from `MODULE_CATALOG.md` (no hardcoded IDs).
8. Governance registrations present exactly once each in the standard set (`SPRINT_CATALOG.md`, module subfolder `README.md`, `DOCUMENT_INDEX.md`, `_meta.json`, `.lovable/plan.md`).
9. Scope exclusions and upstream ownership boundaries (Platform, Accounting, and any consumed module baselines) are preserved.
10. **Cross-module ownership validation** — no capability in the Sprint PRD redefines ownership already established by any upstream module baseline or any previously authored Sprint PRD within the same module or a consumed module.

Individual verification passes MAY add pass-specific checks on top of the 10 mandatory items; they MUST NOT drop or reorder them.

### (a) Verification Metadata header

Fixed shape (auditability):

```
Verification Metadata
Target Artifact: <file path or artifact ID>
Verification Pass: <pass id, e.g. 8.4.3-V>
Verification Date: <YYYY-MM-DD>
Verifier: <role or agent, e.g. "Lovable agent">
Authoritative Sources Checked:
  - <path 1>
  - <path 2>
  - …
```

### (b) Check / Result / Action table

One row per checklist item. Columns are fixed:

- **Check** — the checklist item being verified.
- **Result** — one of `Pass`, `Fail`, `Remediated`.
- **Action** — edit summary or `"no action"`.

### (c) Verification Summary block

Fixed, implementation-agnostic shape (works for any checklist length):

```
Verification Summary
Checklist Items: <n>
Passed: <n>
Remediated: <n>
Failed: <n>
Outstanding Risks: <R-IDs or "none">
Repository Status: PASS | BLOCKED
Next Pass: <pass id or "n/a">
```

For a Sprint PRD verification pass following the repository-standard checklist, `Checklist Items` is `10` and the invariant example resolves to `Passed + Remediated + Failed = 10`.

**Invariants.**

- `Passed + Remediated + Failed = Checklist Items`.
- `Repository Status: PASS` requires `Failed = 0`.
- Any `Failed ≥ 1` is `BLOCKED` and `Next Pass = n/a` until remediation clears the failure via a full re-check.

### Placement

All three artifacts are written into `.lovable/plan.md` under the pass's Execution Record **and** mirrored in the pass's final chat reply.

### Post-Implementation Repository Audit (Mandatory Final Gate) — v1.0

**Audit Specification Version: 1.0.** The Repository Audit is a repository-wide, evidence-based final gate that runs *after* the pass-specific verification checklist and *after* the three verification artifacts above. It is a superset gate: existing 10-item / 13-item verification remains the internal verification step; the audit is the external evidence-based confirmation.

1. **Trigger.** Runs after every Stage-2 Sprint PRD pass, every Stage-3 Baseline pass, and any pass that mutates authoritative documents. The pass is not complete until the audit reports `Repository Status: READY` at `Confidence: HIGH`.

2. **Specification versioning.** Every audit record SHALL declare `Audit Specification Version: <MAJOR.MINOR>` (initial value `1.0`). Backward-incompatible changes to the Standard Check Set, Confidence rubric, or Gate rule require a MAJOR bump; additive refinements require a MINOR bump. Older audit records remain valid under the version they were written against; the current version applies to new passes.

3. **Governance stance (strict).**
   - `Repository Status: READY` means no evidence-based failures were found.
   - `Confidence: HIGH` additionally requires verified authoritative source integrity via a change-tracking mechanism.
   - The gate to proceed to the next pass requires **both** `READY` and `HIGH`. An environment without change tracking cannot pass the gate, even if every document is otherwise perfect.

4. **Audit rules.**
   - Read every modified file directly; do not rely on the implementation summary, memory, or logs.
   - Every PASS SHALL cite the repository location (file path **plus line range or uniquely identifiable section heading**) together with the **exact matching text**.
   - Missing evidence ⇒ FAIL.
   - Never assume a document exists because it was reported as created.
   - **Access guard clause.** If any file in the Mandatory Read Set cannot be opened or read, the audit SHALL terminate immediately with `Repository Status: NOT READY` and `Confidence: LOW`, listing the inaccessible files. No PASS/FAIL is inferred for unread files.

5. **Audit reproducibility (mandatory metadata).** Every audit record SHALL include, at minimum:
   - `Audit Specification Version` (e.g. `1.0`).
   - Audit timestamp (ISO-8601 UTC).
   - **Repository revision identifier** (commit SHA, version ID, or equivalent). SHALL be cited as evidence — the auditor SHALL quote the exact command and its verbatim output (e.g. `git rev-parse HEAD` → `<sha>`). Missing revision identifier caps Confidence at `MEDIUM`.
   - **Optional artifact hashes.** For each file in the declared Files Modified list, the auditor MAY additionally record a SHA-256 checksum (or equivalent) of the post-pass contents, captured with the command used (e.g. `sha256sum <path>` → `<digest>  <path>`). Recommended for environments where only exported documents will be reviewed.
   - Tool / version used for verification (auditor identity and tooling versions).
   - Change-tracking mechanism used, or explicit statement that none was available.
   - Mandatory read set actually opened, with line ranges consulted.
   - Declared Files Modified list and the actual observed change set.

6. **Mandatory Read Set** (per pass; expand as authoritative sources evolve): the newly created / modified artifact(s); parent Module PRD; parent Sprint Plan (Stage 2 passes); `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, module sprint `README.md`, `docs/_meta.json`, `.lovable/plan.md`; `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`; `docs/11-adrs/ADR_INDEX.md`; `docs/MODULE_CATALOG.md`; `docs/02-architecture/event-catalog.md`; `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`.

7. **Evidence Table Schema** — five columns: `Check | PASS/FAIL | Severity | Repository Evidence | Required Fix`. PASS rows without file-path + line-range/heading + exact quote are invalid.

8. **Severity classification.** Every finding SHALL be tagged with one severity level. Severity is orthogonal to PASS/FAIL: it classifies the *type* of finding, and for FAIL rows it drives remediation priority. PASS rows use `Informational` unless reviewer interpretation was required (use `Minor`).
   - **Critical** — violates authoritative-source integrity, governance boundary, engine/ADR/event authority, or capability bidirectionality; blocks the gate unconditionally.
   - **Major** — violates repository consistency, metadata consistency, structural conformance (18 sections, frontmatter, `size` binding), or governance registration exactness; blocks the gate.
   - **Minor** — cosmetic drift, evidence quality reduced to reviewer interpretation, non-normative reordering; does not block the gate but downgrades Confidence to `MEDIUM`.
   - **Informational** — evidence citation for a passing check; no action required.

   Gate impact: any `Critical` or `Major` FAIL ⇒ `Repository Status: NOT READY`; any unresolved `Minor` FAIL ⇒ Confidence capped at `MEDIUM`; only `Informational` findings ⇒ gate can be `READY / HIGH`.

9. **Standard Check Set** (superset; suggested default severity in parentheses):
   - Sprint PRD file exists at declared path. *(Critical)*
   - Frontmatter matches specification (including `size` bound to Sprint Plan). *(Major)*
   - Exactly 18 sections; numbering matches template. *(Major)*
   - Sprint scope exactly matches Sprint Plan allocation. *(Critical)*
   - **Capability bidirectionality** — every Sprint capability originates from exactly one Module PRD capability; every allocated Module capability appears exactly once; no additional capability. *(Critical)*
   - **Engine set identity** — identical across Sprint PRD, Sprint Plan, `ENGINE_USAGE_MATRIX`, `ENGINE_CATALOG`; no missing, additional, reordered (where normative), deprecated, or undefined identifiers. *(Critical)*
   - ADR IDs match `ADR_INDEX` (Accepted only). *(Critical)*
   - Event names resolve verbatim in `event-catalog.md` OR are deferred as `R-EV-*`; no invented IDs. *(Critical)*
   - Governance wording preserves ownership boundaries; no prohibited ownership transfer. *(Critical)*
   - Dependencies resolve verbatim from `MODULE_CATALOG.md`. *(Major)*
   - Five governance registrations exist exactly once; no duplicates. *(Major)*
   - **Repository consistency** — cross-references resolve; no broken internal links; no duplicate Sprint IDs, Module IDs, or document identifiers. *(Major)*
   - **Metadata consistency** — agrees across frontmatter, module `README`, `SPRINT_CATALOG`, `DOCUMENT_INDEX`, `_meta.json`. *(Major)*
   - **Authoritative source integrity** — every modified file appears in declared list; no additional authoritative document changed; verified via `git diff` / `git status` **or an equivalent repository change-tracking mechanism available in the execution environment**. Immutable examples: `MODULE_PRD.md`, `ENGINE_CATALOG.md`, `ADR_INDEX.md`, `MODULE_CATALOG.md`, prior Sprint PRDs, `event-catalog.md`, `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md`. If no change-tracking mechanism is available, treat as **unverified** and cap Confidence at `MEDIUM`; under the strict-governance stance the pass cannot proceed. *(Critical)*
   - `.lovable/plan.md` updated with verification metadata + summary. *(Major)*

10. **Failure policy.** On any FAIL: report exact section, quote evidence, tag severity, recommend minimum edit; do not auto-modify authoritative sources; re-run audit after correction.

11. **Final Report Format.**

    ```
    Repository Audit
    Audit Specification Version: 1.0
    Checks:
    Passed:
    Remediated:
    Failed:
      Critical:
      Major:
      Minor:
    Repository Status: READY | NOT READY
    Confidence:        HIGH  | MEDIUM    | LOW
    Revision:          <commit SHA / version ID>   (evidence: <command + quoted output>)
    Artifact Hashes:   <optional SHA-256 lines, one per modified file>
    ```

    Invariants:
    - `Passed + Remediated + Failed = Checks`.
    - `Failed = Critical + Major + Minor` (Informational never contributes to Failed).
    - `Repository Status = READY ⇔ Failed(Critical) = 0 ∧ Failed(Major) = 0`.
    - **Confidence rubric.**
      - `HIGH` — every PASS supported by repository evidence, authoritative source integrity verified, revision identifier cited, no unresolved `Minor` findings.
      - `MEDIUM` — evidence exists but reviewer interpretation was required, OR integrity / revision unverifiable, OR unresolved `Minor` findings.
      - `LOW` — assumptions / unread files / access guard fired.
    - **Gate rule (strict).** Proceed to next pass ⇔ `Repository Status = READY` ∧ `Confidence = HIGH`.

12. **Relationship to the 10-item / 13-item verification.** The audit is a superset gate; the checklists remain the internal verification step and the audit is the external evidence-based confirmation.


## Governance Specification v1.0 (Pass 8.9.1-G)

This section supplements the workflow with repository-wide governance rules. Where it modifies earlier language, this section takes precedence. After approval of Pass 8.9.1-G, this section is **frozen** — see **Governance Freeze** below.

### Canonical Stage 1 Module PRD Template

A Stage 1 Module PRD SHALL conform exactly to the **canonical Stage 1 Module PRD template** designated in `docs/99-templates/module-prd-template.md`. Conformance is structural — sections, ordering, headings, and required subsections — not a numeric count. Prior references to "17 sections" or "23 sections" are superseded by this rule.

**Template selection is stable, not time-dependent.** If `docs/99-templates/module-prd-template.md` does not yet exist, the repository maintainer SHALL **explicitly designate** one existing approved Stage 1 Module PRD as the canonical template by recording that designation in this document (module id + version + date). The "most recently approved Stage 1 Module PRD" fallback is permitted **only during initial repository bootstrap** and MUST be replaced by an explicit designation before the next Stage 1 pass. Once designated, the template is immutable until superseded by an explicit governance pass.

**Current designation.** No explicit designation is recorded yet. Until `docs/99-templates/module-prd-template.md` is authored or a designation is added here, the bootstrap fallback applies. Sprint PRD template remains the 18-section template referenced elsewhere in this document and is unchanged.

### Confidence Enum (closed)

Repository Audit `Confidence` SHALL be exactly one of `HIGH | MEDIUM | LOW`. Compound values (e.g. `MEDIUM-HIGH`) are prohibited in all audit records. The rubric under **Post-Implementation Repository Audit — Final Report Format** remains authoritative.

### Portability Clause — Revision Evidence

Revision evidence is engine-agnostic: it SHALL be **a repository revision identifier produced by the active source-control or content-tracking system** (e.g., Git commit SHA, Mercurial changeset, content-addressed digest of the working tree). The auditor SHALL quote the exact command invoked and its verbatim output.

**Environmental waiver (narrow).** The portability clause applies **only** when the execution environment cannot expose a repository revision identifier through any supported mechanism. When invoked, the audit record SHALL contain `Revision: Unavailable (reason)`, cap Confidence at `MEDIUM`, and record the waiver reason verbatim. The waiver does not permit skipping any other audit obligation.

### Registration-Mutable Files

Permitted edits to `docs/REPOSITORY_MAP.md` during a module registration pass are limited to **derived registration metadata**: module counts, folder counts, and module registry rows/ranges. Structural sections (layer definitions, ownership, precedence) are **immutable** during registration passes and require an explicit governance pass to change. The same principle extends by analogy to other derived registry artifacts.

### Normative Source Precedence

For any Stage 1 or Stage 2 authoring or verification conflict, precedence is:

**Tier A — Repository-wide governance (highest)**
1. `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
2. `docs/MODULE_CATALOG.md`
3. `docs/10-erp-core/ENGINE_CATALOG.md`
4. `docs/11-adrs/ADR_INDEX.md`
5. `docs/02-architecture/event-catalog.md`

**Tier B — Module-specific authority**
6. `docs/20-module-prds/<module>/MODULE_PRD.md`
7. Capability Allocation Matrix (in the module's Sprint Plan)
8. `docs/30-sprint-prds/<module>/MOD-<NNN>_SPRINT_PLAN.md`
9. Sprint PRDs (`SPR-MOD-<NNN>-<NNN>`)
10. Module Baselines (`MOD<NNN>_<MODULE>_BASELINE_v<version>.md`)

**Tier C — Derived registration metadata (lowest)**
11. `docs/ENGINE_USAGE_MATRIX.md` (derived; MAY be promoted to Tier B in a future governance pass if it becomes normative)
12. READMEs, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`, and `docs/REPOSITORY_MAP.md` registration metadata

**Conflict rule.** The higher-precedence source wins; the lower-precedence artifact SHALL be corrected in the same pass whenever practical, otherwise recorded as a follow-up remediation with a tracked identifier. This precedence governs authoring and verification only; it does not alter document ownership defined in `docs/DOCUMENT_OWNERSHIP_MATRIX.md`.

### Bootstrap-Aware Mandatory Read Set (Repository Audit)

Supplementing the Repository Audit's Mandatory Read Set: for the canonical Stage 1 Module PRD template, the auditor SHALL read `docs/99-templates/module-prd-template.md` **if it exists**; otherwise the auditor SHALL read the **explicitly designated canonical Stage 1 Module PRD** referenced in this document. The Access Guard Clause SHALL NOT terminate the audit solely because `docs/99-templates/module-prd-template.md` is absent, provided a valid designation (or the bootstrap fallback) is available. If neither a template file nor a designation nor a bootstrap fallback source exists, the Access Guard fires as usual.

### Governance Freeze

After approval of Pass 8.9.1-G, this document (`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`) is **frozen**. Further changes require an explicit governance-exception pass triggered by a real inconsistency discovered during implementation. Routine refinements are deferred to a future `Governance Specification v2.0`. Registration passes that add modules, sprints, or baselines remain permitted — they do not modify this document.


## Stage Boundaries

Stages do not overlap. No Sprint PRD may be authored before Stage 1 approval; no Module Baseline may be issued before Stage 2 completes. If work-in-flight reveals a defect in a completed stage, that stage is amended explicitly before the current stage continues.

## Non-Goals

- This workflow does not change Module PRDs, ADRs, ERP Core Engines, or the Sprint framework artifacts.
- It does not introduce a new Sprint PRD template or new sprint sizing scheme.
- It does not authorize code, schema, or API changes.

## References

- [`docs/SPRINT_AUTHORING_GUIDE.md`](./SPRINT_AUTHORING_GUIDE.md)
- [`docs/SPRINT_ROADMAP.md`](./SPRINT_ROADMAP.md)
- [`docs/SPRINT_ESTIMATION_GUIDE.md`](./SPRINT_ESTIMATION_GUIDE.md)
- [`docs/SPRINT_DEPENDENCY_MATRIX.md`](./SPRINT_DEPENDENCY_MATRIX.md)
- [`docs/SPRINT_CATALOG.md`](./SPRINT_CATALOG.md)
- [`docs/DOCUMENT_OWNERSHIP_MATRIX.md`](./DOCUMENT_OWNERSHIP_MATRIX.md)
- [`docs/DOCUMENT_TRACEABILITY.md`](./DOCUMENT_TRACEABILITY.md)
- [`docs/20-module-prds/README.md`](./20-module-prds/README.md)
- [`docs/30-sprint-prds/README.md`](./30-sprint-prds/README.md)
