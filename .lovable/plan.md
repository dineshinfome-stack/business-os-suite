# Pass 8.9.1-G — Governance Cleanup (Approved, Freeze-Ready)

**Status:** validated 10/10 by reviewer. Ready to execute and freeze.

**Scope:** documentation-only. Modifies **only**:
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
- `.lovable/plan.md` (execution record)

No Sprint PRD, Module PRD, Baseline, catalog, or registration file is touched.

---

## Findings

1. Section-count ambiguity → conformance by **canonical template**, not numeric count.
2. Confidence enum drift → close to `HIGH | MEDIUM | LOW`.
3. Git-centric revision evidence → engine-agnostic wording + narrow portability clause.
4. `REPOSITORY_MAP.md` mutability → derived registration metadata only.
5. Normative source precedence must include repository-wide governance documents above module-specific documents.
6. Audit Mandatory Read Set must be **bootstrap-aware** for the canonical template.
7. Governance freeze after this pass.

## Decisions

### D1 — Canonical Stage 1 Module PRD template (stable selection)

> A Stage 1 Module PRD SHALL conform exactly to the **canonical Stage 1 Module PRD template** designated in `docs/99-templates/module-prd-template.md`. Conformance is structural (sections, ordering, headings, required subsections) — not a numeric count.
>
> **Template selection is stable, not time-dependent.** If `docs/99-templates/module-prd-template.md` does not yet exist, the repository maintainer SHALL **explicitly designate** one existing approved Stage 1 Module PRD as the canonical template by recording that designation in `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` (module id + version + date). The "most recently approved Stage 1 Module PRD" rule is permitted **only during initial repository bootstrap** and MUST be replaced by an explicit designation before the next Stage 1 pass. Once designated, the template is immutable until superseded by an explicit governance pass.

Sprint PRD template remains **18 sections** (unchanged).

### D2 — Confidence enum (closed)

Repository Audit `Confidence` SHALL be exactly one of `HIGH | MEDIUM | LOW`. Compound values are prohibited. Spec v1.0 rubric remains authoritative.

### D3 — Environmental waiver (narrow)

Portability clause applies **only** when the environment cannot expose a repository revision identifier through any supported mechanism. When invoked: `Revision: Unavailable (reason)`, Confidence capped at `MEDIUM`, reason recorded verbatim.

### D4 — Engine-agnostic revision evidence

"A repository revision identifier produced by the active source-control or content-tracking system (e.g., Git commit SHA, Mercurial changeset, content-addressed digest of the working tree). The auditor SHALL quote the exact command invoked and its verbatim output."

### D5 — `REPOSITORY_MAP.md` mutability

Permitted edits during module registration are limited to **derived registration metadata**: module counts, folder counts, registry rows/ranges. Structural sections (layer definitions, ownership, precedence) are immutable during registration passes.

### D6 — Normative source precedence (repository-wide)

**Tier A — Repository-wide governance (highest)**
1. `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
2. `docs/MODULE_CATALOG.md`
3. `docs/10-erp-core/ENGINE_CATALOG.md`
4. `docs/11-adrs/ADR_INDEX.md`
5. `docs/02-architecture/event-catalog.md`

**Tier B — Module-specific authority**
6. `docs/20-module-prds/<module>/MODULE_PRD.md`
7. Capability Allocation Matrix
8. `docs/30-sprint-prds/<module>/MOD-<NNN>_SPRINT_PLAN.md`
9. Sprint PRDs (`SPR-MOD-<NNN>-<NNN>`)
10. Module Baselines

**Tier C — Derived registration metadata (lowest)**
11. `docs/ENGINE_USAGE_MATRIX.md` (derived; may be promoted to Tier B in a future governance pass if it becomes normative)
12. READMEs, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json`, `docs/REPOSITORY_MAP.md` registration metadata

Conflict rule: higher-precedence source wins; lower-precedence artifact SHALL be corrected in the same pass whenever practical, otherwise recorded as a follow-up remediation with a tracked identifier. This precedence governs authoring and verification only; it does not alter ownership defined in `docs/DOCUMENT_OWNERSHIP_MATRIX.md`.

### D7 — Governance freeze

After approval, `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` is **frozen**. Further changes require an explicit governance-exception pass triggered by a real inconsistency. Routine refinements deferred to a future `Governance Specification v2.0`.

### D8 — Bootstrap-aware Repository Audit Mandatory Read Set

> Read `docs/99-templates/module-prd-template.md` **if it exists**; otherwise read the **explicitly designated canonical Stage 1 Module PRD** referenced in `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`. The Access Guard Clause SHALL NOT terminate the audit solely because `docs/99-templates/module-prd-template.md` is absent, provided a valid designation exists in the workflow. If neither exists, the Access Guard fires as usual.

## Deliverables

1. Update `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`:
   - **Canonical Stage 1 Module PRD Template** subsection (D1).
   - **Confidence Enum** wording (D2).
   - **Portability Clause** (D3, D4).
   - **Registration-Mutable Files** subsection (D5).
   - **Normative Source Precedence** subsection with Tiers A/B/C (D6).
   - **Bootstrap-Aware Mandatory Read Set** clause in Audit section (D8).
   - **Governance Freeze** clause (D7) at end of document.
2. Update `.lovable/plan.md` execution record with verification and audit artifacts.

## Verification (Pass 8.9.1-G-V)

Six-item governance-cleanup checklist (Check / Result / Action):

1. Scope limited to the two permitted files.
2. D1 wording present; no residual "exactly N sections" phrasing for Module PRDs; stable-selection + bootstrap-only fallback both present.
3. D2 confidence enum closed; no compound values remain.
4. D3+D4 portability clause is engine-agnostic; waiver conditions explicit.
5. D5 + D6 (Tier A/B/C) + D7 present, correctly scoped, internally consistent; Tier A includes `MODULE_IMPLEMENTATION_WORKFLOW.md`, `MODULE_CATALOG.md`, `ENGINE_CATALOG.md`, `ADR_INDEX.md`, `event-catalog.md`.
6. D8 bootstrap-aware Mandatory Read Set clause present; Access Guard behavior aligned with D1 designation mechanism.

Emit the three standard artifacts: Verification Metadata header, Check/Result/Action table, Verification Summary block.

## Repository Audit (Spec v1.0)

Mandatory Read Set: `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`, `.lovable/plan.md`, canonical template per D8, `docs/DOCUMENT_OWNERSHIP_MATRIX.md`, `docs/REPOSITORY_MAP.md`.

Standard Check Set restricted to governance-relevant items: Authoritative Source Integrity, Metadata Consistency, Repository Consistency, Frontmatter, `.lovable/plan.md` updated.

Confidence rubric per Spec v1.0. If revision identifier is unavailable, invoke D3 waiver, cap Confidence at `MEDIUM`, record reason.

## Post-freeze next step

Pass **8.9.2 — SPR-MOD-019-001 Warehouse Foundation** (Stage 2 authoring). No further governance refinements unless a real inconsistency is discovered.
