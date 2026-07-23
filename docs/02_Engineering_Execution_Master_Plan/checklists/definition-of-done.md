---
document: EEMP Checklist — Definition of Done
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Definition of Done (DoD)

## Required Inputs
- Passing sprint against DoR
- Implementation branch and PR
- Test artifacts

## Checks
- [ ] All acceptance criteria verified
- [ ] Unit / integration / e2e tests updated and passing
- [ ] Performance, security, and accessibility gates per Ch. 15
- [ ] Observability updated per Ch. 16
- [ ] Documentation updated per Ch. 17
- [ ] Runbook updated where behavior or failure mode changed
- [ ] RBAC and permission catalog updated if applicable
- [ ] Sprint report authored using `../templates/sprint-report.md`

## Exit Criteria
Sprint is DONE when every check above passes and the sprint report is filed.

## Evidence Required
- PR link, test run link, sprint report file path, observability change link

## Owner
Sprint Owner

## Approval Role
Technical Lead (engineering); QA Lead (test conformance)

## Related Standards
- EEMP Ch. 11, Ch. 15, Ch. 16, Ch. 17
- `docs/15-governance/PLATFORM_TESTING_STANDARD.md`
- `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md`
