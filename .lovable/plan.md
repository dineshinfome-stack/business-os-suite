# Engineering Execution Master Plan (EEMP) v4 — Documentation-Only Authoring

Master engineering handbook for Business OS. **Documentation only** — no source, migrations, dependencies, CI, or infra edits.

> **The EEMP is the implementation playbook for the Business OS engineering organization. It governs execution by orchestrating existing standards, architecture, and delivery artifacts, but it is not itself the source of technical authority.**

---

## Folder Location — Resolved

The existing repository uses `docs/15-governance/`, `docs/11-adrs/`, `docs/30-sprint-prds/`, `docs/45-module-publications/`, `docs/50-audit-reports/`. There is **no** `docs/03-engineering/` today. Per the "no new top-level taxonomy just for the EEMP" rule, the EEMP lives at:

```
docs/02_Engineering_Execution_Master_Plan/
```

All paths below use this location. No further location debate.

---

## Path Portability Rule

Governance paths referenced by the EEMP (`docs/15-governance/`, `docs/11-adrs/`, `docs/45-module-publications/`, `docs/30-sprint-prds/`, `docs/50-audit-reports/`) are used **only if they exist at author-time**. Otherwise: locate the equivalent document through Repository Discovery and cite its **actual** repository path. Never hard-code a path that has not been verified in the current turn.

---

## Governing Rules

### 1. Document Authority
Orchestration document. Existing standard → reference · summarize · link · never duplicate. Conflicts logged in `20_Appendix.md` under "Detected Conflicts"; owning standard resolves.

### 2. Non-Goals
Must not create architecture, invent standards, replace governance, introduce technology decisions, or modify any published PRD / Solution Design / module scope / sprint scope / acceptance criteria.

### 3. Documentation Hierarchy
```
Master Architecture
  → Governance Standards
  → ADRs
  → EEMP
  → Module Publications
  → Solution Designs (WEB/MOB/API)
  → Sprint PRDs
  → Developer Documentation
```
Higher tier wins on conflict; EEMP records the discrepancy.

### 4. Read Before Write — Repository Discovery + Inventory
Before authoring each chapter, produce and store a **Discovery Inventory** in that chapter's Evidence section listing:

- Referenced files · Referenced standards · Referenced ADRs · Referenced PRDs · Referenced Solution Designs · Referenced Module Publications · Referenced Sprint Plans

Discovery follows this fixed **Repository Discovery Order**:

1. Master Architecture 2. Governance 3. ADRs 4. Module Publications 5. PRDs 6. Solution Designs 7. Sprint PRDs 8. Existing EEMP

**Only after the inventory is complete may authoring begin.** The inventory is copied into the phase audit report.

### 5. No Guessing — Evidence-Based Writing with Confidence
Never infer module dependencies, database schema, workflow, API behavior, or security rules from filenames. Only documented evidence. Every major section carries an **Evidence** block:

```
Evidence
  Source:             <verified file path>
  Authority:          <hierarchy tier>
  Reference:          <section / heading>
  Applicable Modules: <MOD-IDs>
  Confidence:         High | Medium | Low
```

- **High** — direct citation of an approved standard/PRD/SD.
- **Medium** — synthesized from ≥2 approved sources of the same tier.
- **Low** — best-effort; requires reviewer sign-off. Missing evidence → `TBD` or `Reference not found — verify with owner`. Never fabricate.

### 6. Repository Protection — Forbidden Operations
Never rename or move folders, files, modules, sprints, ADRs, standards, publications, APIs, schemas, or documents anywhere in the repo without explicit instruction. Allowed writes: **create new files** under `docs/02_Engineering_Execution_Master_Plan/` and append reports under `docs/50-audit-reports/EEMP_*` (or the discovered equivalent audit folder).

Forbidden paths: `src/**`, `supabase/migrations/**`, `package.json`, `bun.lockb`, `vite.config.ts`, `.github/**`, `.env*`, every existing doc outside the EEMP folder (read-only reference).

### 7. Documentation Quality Gate (per document)
Required sections: Purpose · Scope · Audience · Responsibilities · Inputs · Outputs · Dependencies · Related Documents · Revision History · Cross References · Open Questions · Approval Status · **Evidence (w/ Confidence)**.

**Cross-Reference block** (required in every chapter): Related Documents · Referenced Standards · Referenced ADRs · Referenced Modules · Referenced Sprint PRDs · Referenced Solution Designs.

Frontmatter: `version`, `last_reviewed`, `next_review`, `owner`, `approval_status`, `lifecycle_state`, `supersedes`.

### 8. Approval Workflow
**Approval Levels:** Draft · Under Review · Approved · Deprecated · Archived.
**Approval Roles:** Technical Lead · Architecture Board · Product Owner · Security Review · QA Lead.
Chapter frontmatter records current level and the role that last approved.

### 9. EEMP Lifecycle
Every chapter and the handbook overall progress through: **Draft → Review → Approved → Published → Superseded → Archived.** Recorded in `lifecycle_state`.

### 10. Mermaid Standards
Allowed: `flowchart`, `sequenceDiagram`, `classDiagram`, `erDiagram`, `journey`, `stateDiagram`, `gitGraph`. No mixing within one document. No emojis in syntax.

### 11. Versioning
Handbook SemVer (`v<major>.<minor>.<patch>`) in `README.md`. Each chapter carries its own version; bumps update `last_reviewed` and set `next_review` (default +6 months).

### 12. Change Management (future revisions)
- Do not replace a chapter wholesale.
- Preserve history.
- Update incrementally; record every change in Revision History; bump chapter and handbook versions with rationale.
- **Structural rewrites only when explicitly instructed** (with an accompanying ADR link).

### 13. Large-Document Handling
If a chapter exceeds a practical read limit, split into logical sections in a sibling folder (`09_Module_Development_Framework/part_1.md`, `part_2.md`, …) with cross-links. Never omit required content; never summarize mandatory standards.

### 14. Repository Health
- Never create duplicate documents, templates, or checklists.
- Reuse existing assets first (via Discovery).
- Consolidate when duplicates surface; log consolidations in the Engineering Review.

### 15. Execution Mode
One phase per turn. Stop → generate audit report → summarize files created/modified, discovery inventory, cross-references, outstanding questions → **wait for approval**.

### 16. Commit Rules
- One commit per phase.
- Message: `docs(eemp): complete phase <n> — <phase title>`.
- No squashing, no unrelated file changes, no repo-wide formatting edits, no whitespace-only changes outside the EEMP folder.
- Never amend history · never force push · never rewrite commits · never rebase protected branches.

### 17. Phase Completion Criteria
Every ✓: required files exist · frontmatter validates · discovery inventory recorded · internal links resolve · Mermaid parses · templates & checklists referenced · no duplicated standards · cross-reference matrix updated · Evidence + Confidence populated · audit report generated.

### 18. Definition of Complete (whole EEMP)
- ✓ 20 chapters exist
- ✓ All indexes generated
- ✓ All templates generated
- ✓ All checklists generated
- ✓ Examples generated (all five categories, §Structure)
- ✓ Internal links valid
- ✓ Cross-references valid
- ✓ No duplicated governance
- ✓ Phase audit reports complete
- ✓ Engineering Review complete
- ✓ Final Report complete
- ✓ Success Metrics reported

### 19. Success Metrics (Final Report)
Coverage % · Broken Links · Duplicate Standards · Missing References · Documentation Health Score · Cross-Reference Density · Readiness Score · **Documentation Coverage** (chapters approved ÷ 20) · **Template Utilization** (templates referenced ≥ once ÷ templates authored).

---

## Structure

```
docs/02_Engineering_Execution_Master_Plan/
  README.md
  01_Vision.md … 20_Appendix.md
  indexes/
    chapter_index.md · template_index.md · checklist_index.md ·
    diagram_index.md · module_index.md · glossary.md · acronym_index.md
  templates/          # PR, ADR, sprint report, module publication, prompt library
  checklists/         # DoR, DoD, review, security, perf, a11y, release, rollback, go-live
  examples/
    module/           # worked EEMP application to MOD-001 Workspace
    workflow/         # end-to-end sprint walkthrough
    prompt/           # exemplar AI prompts
    review/           # exemplar code/security/perf reviews
    testing/          # exemplar test plans and results
```

---

## Phased Authoring (5 phases · one per turn · stop-and-approve)

Each phase writes `docs/50-audit-reports/EEMP_PHASE_<n>_REPORT.md` (or discovered equivalent) capturing: files created, Discovery Inventory, cross-refs added, unresolved evidence, Success Metrics snapshot.

### Phase 1 — Foundations (Ch. 1–5 + README + scaffolding)
README (publishes indexes, hierarchy, execution mode) · `01_Vision` · `02_Repository_Governance` · `03_Development_Workflow` · `04_Coding_Standards` · `05_UI_UX_Standards`. Scaffold `indexes/`, `templates/`, `checklists/`, `examples/{module,workflow,prompt,review,testing}/`.

### Phase 2 — Platform Standards (Ch. 6–10)
`06_Backend_Standards` · `07_Database_Standards` · `08_Security_Standards` · `09_Module_Development_Framework` · `10_Module_Dependency_Matrix` (Mermaid `flowchart`).

### Phase 3 — Delivery & AI (Ch. 11–15 + prompt templates)
`11_Sprint_Execution` · `12_AI_Development_Playbook` · `13_AI_Prompt_Standards` (`templates/prompts/`) · `14_AI_Quality_Gates` · `15_Testing_Strategy`.

### Phase 4 — Ops, Docs, Governance, Go-Live (Ch. 16–20 + populated assets)
`16_DevOps_and_Release` · `17_Documentation_Standards` · `18_Project_Governance` · `19_Go_Live_Checklist` · `20_Appendix` (glossary + Detected Conflicts + revision history). Populate `templates/`, `checklists/`, and all five `examples/` subfolders.

### Phase 5 — Cross-Link, Indexes, Engineering Review, Commit
Populate all `indexes/*` · bidirectional cross-links · consistency sweep · `Engineering_Review_Summary.md` (missing refs, broken links, duplicate governance, conflicts, improvements, risk level, readiness score) · `EEMP_FINAL_REPORT.md` (file inventory, 20-chapter coverage matrix, Success Metrics).

---

## Deliverable Summary

| Phase | Files | Focus |
|---|---|---|
| 1 | README + Ch. 1–5 + scaffolding | Foundations, governing rules, principles |
| 2 | Ch. 6–10 | Backend, DB, Security, Module framework, Dependency matrix |
| 3 | Ch. 11–15 + prompt templates | Sprints, AI playbook, prompts, quality gates, testing |
| 4 | Ch. 16–20 + templates + checklists + examples ×5 | DevOps, docs, governance, go-live, reusable assets |
| 5 | Indexes + cross-links + Engineering Review + Final Report | Consistency, coverage, metrics, docs-only commit |

## Confirm before Phase 1

1. **Owner** — default `owner` value in chapter frontmatter (proposed: `Project Architecture`)?
2. **Default Approval Role** — which role signs Draft → Approved for foundational chapters (proposed: `Architecture Board`)?
3. **Cadence** — one phase per turn with stop-and-approve gate (recommended), confirmed?

Location and all other rules are resolved. On approval, I begin Phase 1.
