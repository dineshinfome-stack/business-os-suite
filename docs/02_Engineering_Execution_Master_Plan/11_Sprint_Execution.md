---
document: EEMP Chapter 11 — Sprint Execution
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 11 — Sprint Execution

> Orchestration only. Sprint governance lives in the Sprint guides and `docs/30-sprint-prds/`; this chapter does not derive or restate them (R-19, R-20).

## Purpose *(Normative)*

Direct engineers to the authoritative sprint authoring, estimation, sequencing, and gating sources, and describe how they are consumed to execute a sprint from Definition of Ready to Definition of Done.

## Scope *(Normative)*

Every sprint recorded in `docs/30-sprint-prds/**` and every future sprint added under `docs/SPRINT_ROADMAP.md`.

## Audience *(Informative)*

Sprint leads · Module owners · Engineers · Reviewers · AI collaborators · QA.

## Responsibilities *(Normative)*

- Sprint leads follow the authoring, estimation, and dependency guides verbatim.
- Reviewers enforce entry (DoR) and exit (DoD) gates.
- Chapter owner keeps the Traceability Matrix and Evidence current.

## Inputs *(Informative)*

Verified during Repository Discovery:

- `docs/SPRINT_AUTHORING_GUIDE.md`
- `docs/SPRINT_ESTIMATION_GUIDE.md`
- `docs/SPRINT_ROADMAP.md`
- `docs/SPRINT_DEPENDENCY_MATRIX.md`
- `docs/30-sprint-prds/**` (141 files)
- `docs/15-governance/ARCHITECTURE_REVIEW_GATE_STANDARD.md`
- `docs/15-governance/DOCUMENTATION_AS_ARTIFACT_STANDARD.md`
- `docs/99-templates/sprint-prd-template.md`
- EEMP Ch. 03, 09, 10

## Outputs *(Informative)*

- Single pointer surface for sprint execution.
- Traceability from sprints to modules, ADRs, and Solution Designs.

## Consumption Guidance *(Normative)*

| Concern | Source of Truth | How Engineers Consume |
|---|---|---|
| Sprint authoring | `SPRINT_AUTHORING_GUIDE.md` + `docs/99-templates/sprint-prd-template.md` | Author every sprint PRD from the template; no ad-hoc formats. |
| Estimation | `SPRINT_ESTIMATION_GUIDE.md` | Estimate before Sprint 0 review; record in the PRD. |
| Sequencing | `SPRINT_ROADMAP.md`, `SPRINT_DEPENDENCY_MATRIX.md`, ADR-007, ADR-0011 | Never start a sprint whose upstream sprint is not Done. |
| Definition of Ready | Ch. 03 (Development Workflow) + Sprint PRD template | Sprint enters implementation only after DoR is met. |
| Definition of Done | Ch. 03 + `PLATFORM_TESTING_STANDARD.md` | Sprint ships only when DoD is met and audit report exists. |
| Architecture Review Gate | `ARCHITECTURE_REVIEW_GATE_STANDARD.md` | Sprints touching cross-cutting concerns require gate approval. |
| Audit trail | `docs/50-audit-reports/` naming convention | Every sprint produces a numbered report on completion. |

## Dependencies *(Informative)*

- Chapters 02, 03, 09, 10.

## Related Documents *(Informative)*

- [03_Development_Workflow](03_Development_Workflow.md), [09_Module_Development_Framework](09_Module_Development_Framework.md), [10_Module_Dependency_Matrix](10_Module_Dependency_Matrix.md)

## Cross References *(Informative)*

- **Referenced Standards:** ARCHITECTURE_REVIEW_GATE_STANDARD, DOCUMENTATION_AS_ARTIFACT_STANDARD, PLATFORM_TESTING_STANDARD
- **Referenced ADRs:** ADR-007, ADR-0011
- **Referenced Modules:** All
- **Referenced Sprint PRDs:** All entries under `docs/30-sprint-prds/`
- **Referenced Solution Designs:** All WEB/MOB/API-###

## Open Questions

- None at initial draft.

## Approval Status

Draft — pending Architecture Board sign-off.

## Evidence

```
Source:             docs/SPRINT_AUTHORING_GUIDE.md, docs/SPRINT_ESTIMATION_GUIDE.md
Authority:          Sprint governance
Reference:          Authoring and estimation
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/SPRINT_ROADMAP.md, docs/SPRINT_DEPENDENCY_MATRIX.md
Authority:          Roadmap governance
Reference:          Sequencing and dependencies
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/15-governance/ARCHITECTURE_REVIEW_GATE_STANDARD.md
Authority:          Governance Standards
Reference:          Gate approval
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Discovery order followed as required by R-18.
- 141 sprint PRDs enumerated; individual files aggregated as "All" in the Traceability Matrix (per R-19).
- No duplicate standards detected in this scope.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---|---|---|---|---|---|---|
| 11 Sprint Execution | ARCHITECTURE_REVIEW_GATE, DOCUMENTATION_AS_ARTIFACT, PLATFORM_TESTING | ADR-007, ADR-0011 | All module PRDs | All WEB/MOB/API-### | MOD-001 … MOD-019 | All (141) |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — orchestration surface for sprint execution. |
