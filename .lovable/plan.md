# Phase 4 — Operations, Documentation Standards, Project Governance, Go-Live, Templates, Checklists, Examples

Phase 3 accepted. C-001/C-002 remain observations only. Phase 4 completes the EEMP body (Ch. 16–19), finalizes the Appendix (Ch. 20), and populates `templates/`, `checklists/`, and `examples/` scaffolds established in Phase 1.

## Scope

Author under `docs/02_Engineering_Execution_Master_Plan/`:

**Chapters (only if not already present):**
- `16_Operations_And_Runbooks.md` — orchestrates observability, incident response, on-call, runbooks; references `PLATFORM_OBSERVABILITY_STANDARD.md` and existing ops docs.
- `17_Documentation_Standards.md` — orchestrates `GOVERNANCE_FRONTMATTER_STANDARD`, `GOVERNANCE_TEMPLATE_STANDARD`, `REPOSITORY_NAVIGATION_STANDARD`, `DOCUMENTATION_AS_ARTIFACT_STANDARD`.
- `18_Project_Governance.md` — orchestrates approval workflows, RACI, ADR lifecycle, exception handling; references `docs/governance.md`, `docs/decision-register.md`, ADR Index.
- `19_Go_Live_And_Release.md` — orchestrates release readiness, cutover, post-release verification; references `docs/60-release-readiness/**`, `docs/61-production-release/**`, `docs/62-post-release-verification/**`.

**Appendix finalization:**
- `20_Appendix.md` — populate Glossary Additions and Acronyms only where Phase 4 discovery surfaces terms not already in `docs/glossary.md` / `docs/GLOSSARY_INDEX.md` (reference, don't duplicate). Preserve existing Detected Conflicts (C-001, C-002) untouched.

**Templates** under `templates/` (only for real gaps vs. `docs/99-templates/` and `docs/15-governance/`):
- `templates/pull-request.md`
- `templates/adr.md` — thin wrapper referencing `docs/99-templates/adr-template.md` and `docs/05-adr/ADR-0000-template.md`.
- `templates/sprint-report.md`
- `templates/module-publication.md` — references `docs/45-module-publications/**` pattern.
- `templates/prompts/` — engineering prompt templates governed by Ch. 13 (structure prompt, review prompt, evidence prompt).

**Checklists** under `checklists/` (only for real gaps):
- `checklists/definition-of-ready.md`
- `checklists/definition-of-done.md`
- `checklists/code-review.md`
- `checklists/release-readiness.md`
- `checklists/ai-prompt-review.md`

**Examples** under `examples/` (illustrative, non-authoritative):
- `examples/module/README.md` + `mod-001-worked-example.md` (references MOD-001 publication).
- `examples/workflow/README.md` + `sprint-walkthrough.md`.
- `examples/prompt/README.md` + `engineering-prompt-example.md`.
- `examples/review/README.md` + `code-review-example.md`.
- `examples/testing/README.md` + `test-plan-example.md`.

**Index updates (only where transitions change):**
- `README.md` chapter index — status 16–19 → Draft; Appendix updated.
- `indexes/chapter_index.md` — same.
- `indexes/template_index.md` — replace Pending entries with actual paths.
- New `indexes/checklist_index.md` and `indexes/example_index.md`.

**Audit report:** `docs/50-audit-reports/EEMP_PHASE_4_REPORT.md`.

## Governance Rules Applied in Phase 4

Adds four Phase-4-specific rules on top of R-01…R-23:

- **R-24 Asset Governance Parity** — every template, checklist, and example follows the EEMP documentation structure (frontmatter + required sections adapted to asset type) and the same authority/evidence model.
- **R-25 Example Non-Authority** — every example carries an explicit banner: *"Illustrative only. Not an authoritative engineering standard. Cites the standard it demonstrates."*
- **R-26 Checklist Contract** — every checklist includes: Required Inputs · Exit Criteria · Evidence Required · Owner · Approval Role · Related Standards.
- **R-27 Template Traceability** — every reusable template includes a Traceability section naming the governing EEMP chapter and referenced standards.

R-24…R-27 are appended to `02_Repository_Governance.md` as part of Phase 4 (incremental amendment; Revision History bumped).

## Expected Deliverables

Create or update only files required to complete Phase 4. No writes outside `docs/02_Engineering_Execution_Master_Plan/` and `docs/50-audit-reports/`. No edits to `src/**`, migrations, or config. Discovery may read anywhere.

## Execution Order (single turn)

1. **Repository Discovery (read-only, R-18 order)** with actual counts distinguishing **Documents Scanned** vs **Documents Referenced**. Approximations flagged `(approx.)`.

   Candidate authoritative sources (verified during discovery, never assumed):
   - Operations: `PLATFORM_OBSERVABILITY_STANDARD.md`, `docs/performance.md`, existing runbooks under `docs/10-erp-core/**` and `docs/16-*` if present.
   - Documentation Standards: `GOVERNANCE_FRONTMATTER_STANDARD`, `GOVERNANCE_TEMPLATE_STANDARD`, `REPOSITORY_NAVIGATION_STANDARD`, `DOCUMENTATION_AS_ARTIFACT_STANDARD`, `docs/99-templates/**`.
   - Project Governance: `docs/governance.md`, `docs/decision-register.md`, `docs/DOCUMENT_OWNERSHIP_MATRIX.md`, `docs/11-adrs/ADR_INDEX.md`, `ARCHITECTURE_REVIEW_GATE_STANDARD.md`, `FINDING_SEVERITY_STANDARD.md`.
   - Go-Live: `docs/60-release-readiness/**`, `docs/61-production-release/**`, `docs/62-post-release-verification/**`, `docs/58-system-verification/**`, `docs/59-user-acceptance/**`.

2. **Amend `02_Repository_Governance.md`** — append R-24…R-27; bump Revision History.

3. **Author Chapters 16–19** using the standard template (Purpose · Scope · Audience · Responsibilities · Inputs · Outputs · Dependencies · Related Documents · Revision History · Cross References · Open Questions · Approval Status · Evidence · Discovery Inventory · Traceability Matrix). Each section marked Normative or Informative (R-22). Evidence with Confidence per R-21. References only — no restatement (R-19, R-20).

4. **Populate templates, checklists, examples** honoring R-24…R-27. Skip any asset whose gap-free equivalent already exists in `docs/99-templates/` or `docs/15-governance/` and instead link to it from the EEMP index.

5. **Finalize `20_Appendix.md`** — glossary additions and acronyms only where discovery finds terms not already indexed. Detected Conflicts table preserved verbatim.

6. **Update indexes** (`README.md`, `chapter_index.md`, `template_index.md`, new `checklist_index.md`, new `example_index.md`) only where transitions change.

7. **Author `docs/50-audit-reports/EEMP_PHASE_4_REPORT.md`** in the fixed 13-section order (Discovery Summary · Files · Cross References · Repository Health · Duplicate Standards · Missing References · Broken Links · Conflicts · Metrics · Compliance Verification · Checklist R-17 · Outstanding Questions · Approval). Compliance Verification adds Phase-4-specific checks:
   - Every new asset complies with R-24…R-27.
   - Every checklist contains the six-field contract.
   - Every example carries the non-authority banner.
   - Every template carries a Traceability section.

8. **Stop.** Do not begin Phase 5. Do not anticipate future work.

## Non-Goals

- No new architecture, standards, or scope changes.
- No resolution of C-001/C-002.
- No modification of authoritative or implementation documents (findings reported, not fixed).
- No writes outside `docs/02_Engineering_Execution_Master_Plan/` and `docs/50-audit-reports/`.
- No new runbook or release procedure invented in Ch. 16/19 — those chapters orchestrate existing artifacts only.

## Closing Directive

Execute Phase 4 in a single turn. At completion, stop, generate the audit report, request approval, and wait for explicit authorization before beginning Phase 5.
