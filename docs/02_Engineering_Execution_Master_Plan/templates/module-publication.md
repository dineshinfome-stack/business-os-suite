---
document: EEMP Template — Module Publication Wrapper
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Module Publication Template (EEMP Wrapper)

Author every new module publication in the pattern already established under `docs/45-module-publications/**`. This wrapper does not redefine that pattern; it only lists the sections required by the EEMP for release readiness.

## Required Sections
1. Purpose and Scope
2. Domain Boundaries (per `DOMAIN_MODEL_STANDARD.md` and ADR-007 where applicable)
3. Capabilities and Screens (per `SCREEN_IDENTIFIER_STANDARD.md`)
4. RBAC and Permissions (per `RBAC_STANDARD.md`, `PERMISSION_CATALOG.md`)
5. Observability and Runbooks (per Ch. 16)
6. Testing Strategy (per Ch. 15)
7. Release Readiness Linkage (per Ch. 19)
8. Traceability Matrix

## Traceability
- Governing EEMP chapter: **Ch. 09 Module Development Framework**, **Ch. 19 Go-Live and Release**.
- Referenced standards: DOMAIN_MODEL_STANDARD, SCREEN_IDENTIFIER_STANDARD, RBAC_STANDARD, PERMISSION_CATALOG, PLATFORM_OBSERVABILITY_STANDARD.
