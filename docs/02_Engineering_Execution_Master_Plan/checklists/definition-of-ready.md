---
document: EEMP Checklist — Definition of Ready
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Definition of Ready (DoR)

## Required Inputs
- Approved sprint PRD under `docs/30-sprint-prds/`
- Referenced module publication under `docs/45-module-publications/`
- Applicable solution design (WEB / MOB / API)
- RBAC entries in `permission-catalog.manifest.yaml` (if new permissions)

## Checks
- [ ] Scope, acceptance criteria, and non-goals are explicit
- [ ] Dependencies and blocking sprints identified
- [ ] Test approach outlined against Ch. 15
- [ ] Observability plan sketched against Ch. 16
- [ ] Security implications assessed against Ch. 08

## Exit Criteria
Sprint is READY when every check above passes and dependencies are unblocked.

## Evidence Required
- Link to sprint PRD, module publication, and solution design
- Test approach note (may be a paragraph in the PRD)

## Owner
Sprint Owner

## Approval Role
Technical Lead

## Related Standards
- `docs/15-governance/ARCHITECTURE_REVIEW_GATE_STANDARD.md`
- `docs/15-governance/PLATFORM_TESTING_STANDARD.md`
- EEMP Ch. 03, Ch. 11
