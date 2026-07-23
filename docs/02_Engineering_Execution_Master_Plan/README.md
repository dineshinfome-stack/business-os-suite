---
document: Engineering Execution Master Plan
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Engineering Execution Master Plan (EEMP)

> The EEMP is the **implementation playbook** for the Business OS engineering organization. It governs execution by orchestrating existing standards, architecture, and delivery artifacts, but it is **not** itself the source of technical authority.

The EEMP is documentation-only. It does not modify source code, migrations, dependencies, CI, or infrastructure. It references existing standards and never duplicates them.

## Documentation Hierarchy

```
Master Architecture
  → Governance Standards          (docs/15-governance/)
  → ADRs                          (docs/11-adrs/)
  → EEMP                          (this handbook)
  → Module Publications           (docs/45-module-publications/)
  → Solution Designs (WEB/MOB/API)(docs/46-solution-design/, docs/60-solution-design/)
  → Sprint PRDs                   (docs/30-sprint-prds/)
  → Developer Documentation
```

On conflict, higher tier wins. The EEMP records the discrepancy in `20_Appendix.md` under **Detected Conflicts**.

## Chapter Index

| # | Chapter | Status |
|---|---------|--------|
| 01 | [Vision](01_Vision.md) | Draft |
| 02 | [Repository Governance](02_Repository_Governance.md) | Draft |
| 03 | [Development Workflow](03_Development_Workflow.md) | Draft |
| 04 | [Coding Standards](04_Coding_Standards.md) | Draft |
| 05 | [UI/UX Standards](05_UI_UX_Standards.md) | Draft |
| 06 | [Backend Standards](06_Backend_Standards.md) | Draft |
| 07 | [Database Standards](07_Database_Standards.md) | Draft |
| 08 | [Security Standards](08_Security_Standards.md) | Draft |
| 09 | [Module Development Framework](09_Module_Development_Framework.md) | Draft |
| 10 | [Module Dependency Matrix](10_Module_Dependency_Matrix.md) | Draft |
| 11 | Sprint Execution | Pending (Phase 3) |
| 12 | AI Development Playbook | Pending (Phase 3) |
| 13 | AI Prompt Standards | Pending (Phase 3) |
| 14 | AI Quality Gates | Pending (Phase 3) |
| 15 | Testing Strategy | Pending (Phase 3) |
| 16 | DevOps and Release | Pending (Phase 4) |
| 17 | Documentation Standards | Pending (Phase 4) |
| 18 | Project Governance | Pending (Phase 4) |
| 19 | Go-Live Checklist | Pending (Phase 4) |
| 20 | [Appendix](20_Appendix.md) | Draft (skeleton) |

## Repository Layout

```
docs/02_Engineering_Execution_Master_Plan/
  README.md
  01_Vision.md … 20_Appendix.md
  indexes/     chapter_index · template_index · checklist_index · diagram_index · module_index · glossary · acronym_index
  templates/   PR · ADR · sprint report · module publication · prompt library
  checklists/  DoR · DoD · review · security · perf · a11y · release · rollback · go-live
  examples/    module · workflow · prompt · review · testing
```

## Execution Mode

- One phase per turn.
- Stop → generate audit report under `docs/50-audit-reports/EEMP_PHASE_<n>_REPORT.md`.
- Summarize files created/modified, Discovery Inventory, cross-references, outstanding questions.
- Wait for approval before advancing.

## Governing Rules (summary — full text in Ch. 02 and Ch. 18)

1. **Document Authority** — Orchestration only. Reference · summarize · link · never duplicate.
2. **Non-Goals** — Never create architecture, invent standards, or alter published PRD/SD/module/sprint scope.
3. **Read Before Write** — Every chapter requires a Discovery Inventory before authoring.
4. **Evidence-Based Writing** — Every major section carries `Evidence { Source, Authority, Reference, Applicable Modules, Confidence: High|Medium|Low }`.
5. **Repository Protection** — No renames, no moves, no writes outside the EEMP folder and its audit reports.
6. **Approval Workflow** — Levels: Draft · Under Review · Approved · Deprecated · Archived. Roles: Technical Lead · Architecture Board · Product Owner · Security Review · QA Lead.
7. **Lifecycle** — Draft → Review → Approved → Published → Superseded → Archived.
8. **Change Management** — Update incrementally. No wholesale rewrite without explicit instruction and an ADR link.
9. **Repository Health** — No duplicate documents, templates, or checklists. Reuse first.
10. **Success Metrics** — Coverage, Broken Links, Duplicate Standards, Missing References, Health Score, Cross-Reference Density, Readiness Score, Documentation Coverage, Template Utilization.

## Versioning

Handbook uses SemVer. Chapters carry their own version, `last_reviewed`, and `next_review` (default +6 months). Bumps recorded in the chapter's Revision History.

## Path Portability

The EEMP cites governance paths only if verified present at author-time. Missing paths are located through Repository Discovery and cited at their actual location — never hard-coded.

## Cross References

- Governance root: `docs/15-governance/`
- ADR root: `docs/11-adrs/`
- Module Publications: `docs/45-module-publications/`
- Solution Designs: `docs/46-solution-design/`, `docs/60-solution-design/`
- Sprint PRDs: `docs/30-sprint-prds/`
- Audit Reports: `docs/50-audit-reports/`
- Frontmatter standard: `docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`
- Repository Navigation: `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial handbook scaffold and Phase 1 chapters. |
