---
document: EEMP Chapter 17 — Documentation Standards
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 17 — Documentation Standards

## Purpose *(Normative)*

Orchestrate the documentation rules that govern every artifact produced under the EEMP: frontmatter, templates, navigation, and documentation-as-artifact enforcement. This chapter references authoritative documentation standards and never restates them (R-19, R-20).

## Scope *(Normative)*

All documentation authored anywhere in `docs/**`, including the EEMP itself, module publications, ADRs, solution designs, sprint PRDs, and audit reports.

## Audience *(Informative)*

Contributors · Reviewers · Auditors · AI collaborators.

## Responsibilities *(Normative)*

- Authors: comply with frontmatter, template, and navigation standards.
- Reviewers: block documents missing frontmatter or cross-references.
- Chapter owners: keep EEMP references current when governance evolves.

## Authoritative Sources *(Normative — orchestration only)*

| Concern | Authoritative source |
|---------|----------------------|
| Frontmatter fields and validation | `docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md` |
| Template structure and required sections | `docs/15-governance/GOVERNANCE_TEMPLATE_STANDARD.md` |
| Navigation, `_meta.json`, and label conventions | `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md` |
| Documentation-as-artifact enforcement | `docs/15-governance/DOCUMENTATION_AS_ARTIFACT_STANDARD.md` |
| Standards lifecycle | `docs/15-governance/STANDARDS_LIFECYCLE_STANDARD.md` |
| Template registry | `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` |

## EEMP Application *(Normative)*

- Every EEMP chapter, template, checklist, and example inherits the frontmatter contract from `GOVERNANCE_FRONTMATTER_STANDARD.md`.
- Templates under `templates/` and checklists under `checklists/` must carry the sections mandated by R-24, R-26, and R-27 (see Ch. 02).
- Examples under `examples/` must carry the R-25 non-authority banner.

## Related Documents *(Informative)*

[02_Repository_Governance](02_Repository_Governance.md), [18_Project_Governance](18_Project_Governance.md), [20_Appendix](20_Appendix.md).

## Cross References

- **Referenced Standards:** GOVERNANCE_FRONTMATTER_STANDARD, GOVERNANCE_TEMPLATE_STANDARD, REPOSITORY_NAVIGATION_STANDARD, DOCUMENTATION_AS_ARTIFACT_STANDARD, STANDARDS_LIFECYCLE_STANDARD, GOVERNANCE_TEMPLATE_REGISTRY.
- **Referenced ADRs:** ADR Index.
- **Referenced Modules:** All.

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
Source:             docs/15-governance/DOCUMENTATION_AS_ARTIFACT_STANDARD.md
Authority:          Governance Standards
Reference:          Documentation-as-artifact enforcement
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Scanned: `docs/15-governance/**`, `docs/99-templates/**`, `docs/_meta.json`.
- Referenced: six standards listed above.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---------|---------------------|-----------------|-----------------|-----------------------------|--------------------|--------------------|
| 17 | Frontmatter, Template, Navigation, Doc-as-Artifact, Lifecycle, Template Registry | ADR Index | All | All | All | All |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — Phase 4. |
