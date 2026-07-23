---
document: EEMP Chapter 02 — Repository Governance
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 02 — Repository Governance

## Purpose

Codify the rules that protect repository structure, document authority, and evidence integrity throughout EEMP execution.

## Scope

All contributors and AI collaborators modifying anything under `docs/02_Engineering_Execution_Master_Plan/` or authoring associated audit reports.

## Audience

Engineers · Reviewers · AI collaborators · Auditors.

## Responsibilities

- Contributors: comply with every rule below or record an exception.
- Reviewers: enforce rules and reject non-compliant changes.
- Chapter owners: keep Evidence blocks current on every edit.

## Rules

### R-01 Document Authority
Reference · summarize · link. Never duplicate authoritative standards. Conflicts logged in `20_Appendix.md` → *Detected Conflicts*.

### R-02 Non-Goals
No architecture creation, no new standards, no changes to PRD, SD, module, or sprint scope.

### R-03 Documentation Hierarchy
Master Architecture → Governance → ADRs → EEMP → Module Publications → Solution Designs → Sprint PRDs → Developer Docs. Higher tier wins.

### R-04 Read Before Write
Every chapter requires a **Discovery Inventory** captured in its Evidence section before authoring begins. Discovery order:

1. Master Architecture → 2. Governance → 3. ADRs → 4. Module Publications → 5. PRDs → 6. Solution Designs → 7. Sprint PRDs → 8. Existing EEMP.

### R-05 Evidence-Based Writing with Confidence
Every major section carries:

```
Evidence
  Source:             <verified file path>
  Authority:          <hierarchy tier>
  Reference:          <section / heading>
  Applicable Modules: <MOD-IDs>
  Confidence:         High | Medium | Low
```

- **High:** direct citation of an approved standard/PRD/SD.
- **Medium:** synthesized from ≥2 approved sources at the same tier.
- **Low:** best-effort; requires reviewer sign-off.

Missing evidence → `TBD` or `Reference not found — verify with owner`. Never fabricate.

### R-06 Repository Protection
- No renames or moves of any folder, file, module, sprint, ADR, standard, publication, API, schema, or document.
- Allowed writes: new files under `docs/02_Engineering_Execution_Master_Plan/` and appended reports under `docs/50-audit-reports/EEMP_*`.
- Forbidden: `src/**`, `supabase/migrations/**`, `package.json`, `bun.lockb`, `vite.config.ts`, `.github/**`, `.env*`, every existing doc outside the EEMP folder (read-only reference).

### R-07 Documentation Quality Gate
Required sections in every chapter: Purpose · Scope · Audience · Responsibilities · Inputs · Outputs · Dependencies · Related Documents · Revision History · Cross References · Open Questions · Approval Status · Evidence (with Confidence).

**Cross-Reference block** required in every chapter: Related Documents · Referenced Standards · Referenced ADRs · Referenced Modules · Referenced Sprint PRDs · Referenced Solution Designs.

Frontmatter fields: `version`, `last_reviewed`, `next_review`, `owner`, `approval_status`, `lifecycle_state`, `supersedes`.

### R-08 Approval Workflow
Levels: Draft · Under Review · Approved · Deprecated · Archived.
Roles: Technical Lead · Architecture Board · Product Owner · Security Review · QA Lead.
Chapter frontmatter records current level and the role that last approved.

### R-09 Lifecycle
Draft → Review → Approved → Published → Superseded → Archived.

### R-10 Mermaid Standards
Allowed: `flowchart`, `sequenceDiagram`, `classDiagram`, `erDiagram`, `journey`, `stateDiagram`, `gitGraph`. No mixing within a single document. No emojis in syntax.

### R-11 Versioning
Handbook SemVer in `README.md`. Chapters carry own version; bumps update `last_reviewed` and set `next_review` (default +6 months).

### R-12 Change Management
- Never replace a chapter wholesale.
- Preserve history.
- Update incrementally; log every change in Revision History.
- Structural rewrites only when explicitly instructed, and only with an accompanying ADR link.

### R-13 Large-Document Handling
If a chapter exceeds a practical read limit, split into a sibling folder (`09_Module_Development_Framework/part_1.md`, `part_2.md`, …) with cross-links. Never omit or summarize mandatory standards.

### R-14 Repository Health
No duplicate documents, templates, or checklists. Reuse existing assets first. Consolidations logged in the Engineering Review.

### R-15 Execution Mode
One phase per turn. Stop → audit report → wait for approval.

### R-16 Commit Rules
- One commit per phase.
- Message: `docs(eemp): complete phase <n> — <phase title>`.
- No squashing, no unrelated file changes, no repo-wide formatting edits, no whitespace-only changes outside the EEMP folder.
- Never amend history · never force push · never rewrite commits · never rebase protected branches.

### R-17 Phase Completion Criteria
All checks green: required files exist · frontmatter validates · Discovery Inventory recorded · internal links resolve · Mermaid parses · templates & checklists referenced · no duplicated standards · cross-reference matrix updated · Evidence + Confidence populated · audit report generated.

### R-18 Repository Discovery Enhancement
Before authoring any chapter, perform Repository Discovery in this exact order:
Master Architecture → Governance Standards → Architecture Documents → Design Documents → ADRs → Module Publications → PRDs → Solution Designs → Sprint PRDs → Existing EEMP.
If an authoritative document already exists for the topic: reference it, summarize only what execution requires, link back, and record the citation in both the Evidence block and the Discovery Inventory. Never duplicate, rewrite, or compete with it. Conflicts are logged in `20_Appendix.md → Detected Conflicts`, never resolved inside the EEMP.

### R-19 Lowest Duplication Wins
When multiple documents define the same subject, reference the **highest-authority, most reusable, least-duplicated** source. Do not aggregate rules across duplicates.

### R-20 No Derived Standards
If an authoritative standard exists, do not derive, reinterpret, or expand it. Reference it and describe only how engineers consume it during implementation.

### R-21 Evidence Confidence Definitions
Confidence values in the Evidence block are defined objectively:
- **High** — single approved authoritative document.
- **Medium** — two or more authoritative documents at the same tier agree.
- **Low** — requires manual verification by the chapter owner.
- **Unknown** — reference unavailable at author time; record as `Reference not found — verify with owner`.

### R-22 Section Classification (Normative vs Informative)
Every major section in every chapter carries an explicit classification:
- **Normative** — mandatory engineering rule; violations blocked at review.
- **Informative** — explanatory guidance; not enforceable as policy.
Prevents explanatory text from being interpreted as governance.

### R-23 Traceability
Every chapter carries a **Traceability Matrix** with columns:
Chapter → Referenced Standards → Referenced ADRs → Referenced PRDs → Referenced Solution Designs → Applicable Modules → Applicable Sprints.
Enables impact analysis when any upstream standard changes.

## Dependencies

- Frontmatter Standard (`docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`)
- Governance Template Standard (`docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md`)
- Repository Navigation Standard (`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`)

## Related Documents

- [README](README.md), [01_Vision](01_Vision.md), [03_Development_Workflow](03_Development_Workflow.md), [17_Documentation_Standards](17_Documentation_Standards.md) *(Phase 4)*, [18_Project_Governance](18_Project_Governance.md) *(Phase 4)*

## Cross References

- **Related Documents:** README, 01_Vision, 03_Development_Workflow
- **Referenced Standards:** GOVERNANCE_FRONTMATTER_STANDARD, GOVERNANCE_TEMPLATE_STANDARD, REPOSITORY_NAVIGATION_STANDARD, DOCUMENTATION_AS_ARTIFACT_STANDARD
- **Referenced ADRs:** ADR Index (`docs/11-adrs/ADR_INDEX.md`)
- **Referenced Modules:** All
- **Referenced Sprint PRDs:** All (governance applies universally)
- **Referenced Solution Designs:** All

## Open Questions

- None at initial draft.

## Approval Status

Draft — pending Architecture Board sign-off.

## Evidence

```
Source:             docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md
Authority:          Governance Standards
Reference:          Frontmatter fields and required sections
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md
Authority:          Governance Standards
Reference:          Navigation and document location rules
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Referenced files: `docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`, `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md`, `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`, `docs/15-governance/DOCUMENTATION_AS_ARTIFACT_STANDARD.md`, `docs/11-adrs/ADR_INDEX.md`.
- Referenced standards: Frontmatter, Template, Navigation, Documentation-as-Artifact.
- Referenced ADRs: ADR Index and ADR-007.
- Referenced PRDs: Applies to all.
- Referenced Solution Designs: Applies to all.
- Referenced Module Publications: Applies to all.
- Referenced Sprint Plans: Applies to all.

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — codifies 17 rules R-01…R-17. |
