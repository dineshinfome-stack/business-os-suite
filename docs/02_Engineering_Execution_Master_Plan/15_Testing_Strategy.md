---
document: EEMP Chapter 15 — Testing Strategy
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 15 — Testing Strategy

> Orchestration only. Testing rules live in Governance and Architecture; this chapter references and sequences them (R-19, R-20). Implementation artifacts (`playwright.config.ts`, `vitest.config.ts`, `src/__tests__/**`, `e2e/**`) are **informative** references — not normative standards.

## Purpose *(Normative)*

Direct engineers to the authoritative testing sources across seven dimensions and describe how they are consumed during sprint execution and release readiness.

## Scope *(Normative)*

All test authoring, test-suite operation, and coverage reporting across web, mobile, and API surfaces for MOD-001 … MOD-019.

## Audience *(Informative)*

Engineers · QA · Security · Accessibility reviewers · AI collaborators.

## Responsibilities *(Normative)*

- Engineers apply the authoritative testing standard verbatim.
- QA verifies coverage bands before Definition of Done.
- Reviewers reject sprints missing evidence for the applicable testing dimensions.

## Authority Boundary *(Normative)*

Implementation artifacts — test suites and test config files under `src/**`, `e2e/**`, `playwright.config.ts`, `vitest.config.ts` — may be inspected to understand current practice. They are **not** normative sources of the EEMP; when they diverge from Governance/Architecture, Governance/Architecture wins.

## Testing Dimensions *(Normative)*

The seven dimensions and their authoritative sources. The EEMP does not redefine any of them.

| # | Dimension | Source of Truth | How Engineers Consume |
|---|---|---|---|
| 1 | **Unit** | `PLATFORM_TESTING_STANDARD.md`, `docs/02-architecture/testing-strategy.md` | Follow the coverage band for the module tier. |
| 2 | **Integration** | `PLATFORM_TESTING_STANDARD.md`, module Solution Designs | Test cross-module contracts; mock only true external boundaries. |
| 3 | **End-to-End** | `PLATFORM_TESTING_STANDARD.md`, module SDs | Cover critical user journeys defined in the module PRD. |
| 4 | **Performance** | `PERFORMANCE_BUDGETS_STANDARD.md` | Verify budgets in DoD; fail sprint on regression. |
| 5 | **Security** | Ch. 08, `FINDING_SEVERITY_STANDARD.md`, `TENANCY_STANDARD.md`, `RBAC_STANDARD.md` | Include RLS, permission, and tenancy tests for every write path. |
| 6 | **Accessibility** | `docs/20-design/ACCESSIBILITY_STANDARD.md` (WCAG 2.1 AA) | Verify a11y checks pass before merge on UI-affecting sprints. |
| 7 | **AI Evaluation** *(where applicable)* | Ch. 12, Ch. 14, `docs/09-ai/ai-guardrails.md` | Evaluate prompts and outputs against the six AI quality gates. |

## Consumption Guidance *(Normative)*

- Sprint PRDs enumerate which dimensions apply and cite the source of truth per dimension.
- The audit report for each sprint records pass/fail per applicable dimension.
- Missing coverage requires an explicit exception logged against `FINDING_SEVERITY_STANDARD.md`.

## Dependencies *(Informative)*

- Chapters 02, 06, 08, 11, 14.

## Related Documents *(Informative)*

- [08_Security_Standards](08_Security_Standards.md), [11_Sprint_Execution](11_Sprint_Execution.md), [14_AI_Quality_Gates](14_AI_Quality_Gates.md)

## Cross References *(Informative)*

- **Referenced Standards:** PLATFORM_TESTING_STANDARD, PERFORMANCE_BUDGETS_STANDARD, TENANCY_STANDARD, RBAC_STANDARD, FINDING_SEVERITY_STANDARD, ACCESSIBILITY_STANDARD (`docs/20-design/ACCESSIBILITY_STANDARD.md`)
- **Referenced ADRs:** ADR-0001, ADR-0002
- **Referenced Modules:** All
- **Referenced Sprint PRDs:** All test-emitting sprints
- **Referenced Solution Designs:** All WEB/MOB/API-###

## Open Questions

- Whether an EEMP-owned AI-evaluation appendix is required (Ch. 14 currently covers gates).

## Approval Status

Draft — pending Architecture Board + QA Lead sign-off.

## Evidence

```
Source:             docs/15-governance/PLATFORM_TESTING_STANDARD.md
Authority:          Governance Standards
Reference:          Coverage bands and gate criteria
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/02-architecture/testing-strategy.md
Authority:          Master Architecture
Reference:          Testing pyramid and boundaries
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/15-governance/PERFORMANCE_BUDGETS_STANDARD.md, docs/20-design/ACCESSIBILITY_STANDARD.md
Authority:          Governance / Design Standards
Reference:          Performance and accessibility gates
Applicable Modules: All UI-shipping modules
Confidence:         High
```

## Discovery Inventory

- Discovery order followed as required by R-18.
- Implementation artifacts inspected but classified informative per the Authority Boundary.
- No duplicate standards detected in this scope.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---|---|---|---|---|---|---|
| 15 Testing Strategy | PLATFORM_TESTING, PERFORMANCE_BUDGETS, TENANCY, RBAC, FINDING_SEVERITY, ACCESSIBILITY | ADR-0001, ADR-0002 | All | All WEB/MOB/API-### | MOD-001 … MOD-019 | All test-emitting sprints |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — orchestration surface for seven testing dimensions. |
