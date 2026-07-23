---
document: EEMP Chapter 19 — Go-Live and Release
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 19 — Go-Live and Release

## Purpose *(Normative)*

Orchestrate the gates that carry a module from engineering completion to production and post-release verification. Chapter 19 references authoritative release artifacts and never restates them (R-19, R-20).

## Scope *(Normative)*

Every module and platform release, including sprint-level increments that ship to production.

## Audience *(Informative)*

Release Manager · Technical Lead · Product Owner · QA Lead · Security · SRE.

## Responsibilities *(Normative)*

- Release Manager: assemble release readiness report and coordinate cutover.
- Technical Lead: sign engineering completion.
- QA Lead: sign system verification and UAT reports.
- Security: sign security review for the release.
- SRE / On-call: sign observability and runbook readiness (Ch. 16).

## Release Gate Model *(Normative — orchestration only)*

| Gate | Authoritative artifacts | Owner |
|------|--------------------------|-------|
| Engineering Completion | `docs/57-engineering-completion/**` | Technical Lead |
| System Verification | `docs/58-system-verification/**` | QA Lead |
| User Acceptance | `docs/59-user-acceptance/**` | Product Owner |
| Release Readiness | `docs/60-release-readiness/**` | Release Manager |
| Production Release | `docs/61-production-release/**` | Release Manager |
| Post-Release Verification | `docs/62-post-release-verification/**` | QA Lead + SRE |

Each gate requires the artifact set defined by its folder pattern. Missing artifacts block the next gate.

## Runbook and Observability Preconditions *(Normative)*

Before Release Readiness sign-off the module must satisfy the runbook discipline of Ch. 16 and the observability baseline in `PLATFORM_OBSERVABILITY_STANDARD.md`.

## Rollback *(Normative)*

Every production release must reference a documented rollback procedure. Rollback plans live inside the release readiness report and reference the module runbook.

## Related Documents *(Informative)*

[11_Sprint_Execution](11_Sprint_Execution.md), [15_Testing_Strategy](15_Testing_Strategy.md), [16_Operations_And_Runbooks](16_Operations_And_Runbooks.md), [18_Project_Governance](18_Project_Governance.md).

## Cross References

- **Referenced Standards:** PLATFORM_OBSERVABILITY_STANDARD, PLATFORM_TESTING_STANDARD, ARCHITECTURE_REVIEW_GATE_STANDARD, FINDING_SEVERITY_STANDARD.
- **Referenced ADRs:** ADR Index.
- **Referenced Modules:** All released modules.
- **Referenced Sprint PRDs:** All release-bearing sprints.
- **Referenced Solution Designs:** All (release verification).

## Open Questions

- None at initial draft.

## Approval Status

Draft — pending Architecture Board sign-off.

## Evidence

```
Source:             docs/60-release-readiness/MOD003_RELEASE_READINESS_REPORT_20260720T001500Z.md
Authority:          Release Artifacts
Reference:          Release readiness gate pattern
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/62-post-release-verification/MOD003_POST_RELEASE_VERIFICATION_REPORT_20260720T010000Z.md
Authority:          Release Artifacts
Reference:          Post-release verification gate pattern
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Scanned: `docs/57-engineering-completion/**`, `docs/58-system-verification/**`, `docs/59-user-acceptance/**`, `docs/60-release-readiness/**`, `docs/61-production-release/**`, `docs/62-post-release-verification/**`.
- Referenced: MOD-003 lifecycle artifacts as canonical exemplars of each gate.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---------|---------------------|-----------------|-----------------|-----------------------------|--------------------|--------------------|
| 19 | Observability, Testing, Architecture Review Gate, Finding Severity | ADR Index | All release-bearing PRDs | All | All released | All release-bearing |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — Phase 4. |
