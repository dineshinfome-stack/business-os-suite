---
document: EEMP Checklist — Code Review
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Code Review Checklist

## Required Inputs
- Open PR meeting DoR
- Linked sprint PRD and applicable standards

## Checks
- [ ] Complies with Ch. 04 Coding Standards
- [ ] Complies with Ch. 06 Backend / Ch. 07 Database / Ch. 08 Security as applicable
- [ ] Tests present and meaningful (Ch. 15)
- [ ] Observability preserved or improved (Ch. 16)
- [ ] Documentation updated (Ch. 17)
- [ ] No duplicated standards or forbidden edits (R-06, R-14)

## Exit Criteria
Review is COMPLETE when every check passes and at least one reviewer of the required discipline has approved.

## Evidence Required
- Review comments resolved
- CI green

## Owner
Reviewer

## Approval Role
Technical Lead (final approval)

## Related Standards
- EEMP Ch. 04, Ch. 06, Ch. 07, Ch. 08, Ch. 15
- `docs/15-governance/FINDING_SEVERITY_STANDARD.md`
