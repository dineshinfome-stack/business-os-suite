---
document: IMP Chapter 10 — Platform Foundation
version: 1.0.0
owner: Platform
approval_status: Draft
---

# 10 — Platform Foundation

## Why First
Every business module consumes shared platform services. Building business features before platform stability multiplies rework and creates cross-module coupling anti-patterns.

## Platform Capabilities (MOD-001)
- Authentication & Session Management
- Organizations & Multi-Tenancy
- Workspace (Business profile, branding, team directory)
- RBAC & Permission Catalog
- Audit Logging
- Notifications Framework
- Settings Framework
- Search & Command Framework
- Documents Framework
- Workflow Engine
- Reporting Framework

## Anchor Sprints (already delivered or in flight)
Sprints 0.1 through 0.13 (see `docs/50-audit-reports/SPRINT_0_*_REPORT.md`) implement the majority of these capabilities. Remaining foundation sprints are enumerated in `docs/30-sprint-prds/platform/`.

## Exit Criteria for Wave A
- All 11 capabilities documented in Module Publication MOD-001.
- Cross-Platform Certification passed.
- Milestone Exit Checklist signed.

## References
- `docs/20-module-prds/platform/MODULE_PRD.md`
- `docs/45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md`
- `docs/30-sprint-prds/platform/`
- EEMP Ch. 09 Module Development Framework
