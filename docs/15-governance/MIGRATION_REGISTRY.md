---
title: "Repository Migration Registry"
doc_id: "MIGRATION_REGISTRY"
version: "1.0"
status: "Active"
type: "governance-registry"
owner: "Architecture Office"
last_updated: "2026-07-18"
tags: ["governance", "migration", "registry"]
---

# Repository Migration Registry

Authoritative index of controlled, repository-wide identifier or structural migrations. Each entry MUST reference (a) a human-readable migration document and (b) a machine-readable manifest.

## Purpose

Provide a single point of discovery for every migration executed against the repository, so future readers can (i) reconcile historical identifiers referenced in immutable audit reports and execution records, and (ii) confirm that mutable surfaces have been fully aligned.

## Governance

- Migrations are additive. Historical rows MUST NOT be edited except to correct clerical errors.
- Every migration MUST preserve immutable surfaces (prior audit reports, `.lovable/plan.md` entries, historical execution records) unchanged.
- Every migration MUST update all mutable surfaces referenced in its manifest in a single pass and emit a terminal repository audit.

## Registered Migrations

| Migration ID | Date (UTC) | Scope | Document | Manifest | Terminal Audit |
| --- | --- | --- | --- | --- | --- |
| MIG-20260718-SD-IDENTIFIER-ALIGNMENT | 2026-07-18 | Solution Design WEB/MOB/API identifier alignment with parent Module IDs | [`SOLUTION_DESIGN_IDENTIFIER_MIGRATION_20260718.md`](./SOLUTION_DESIGN_IDENTIFIER_MIGRATION_20260718.md) | [`MIGRATION_MANIFEST_20260718.json`](./MIGRATION_MANIFEST_20260718.json) | `REPOSITORY_AUDIT_20260718T160000Z` |
| 008_rbac_foundation | 2026-07-22 | Sprint 0.5 — permissions/roles/role_permissions/user_roles enhancements + private.fn_user_* helpers + Wave 0 seed | [`RBAC_STANDARD.md`](./RBAC_STANDARD.md) | [`permission-catalog.manifest.yaml`](./permission-catalog.manifest.yaml) | `SPRINT_0_5_RBAC_FOUNDATION_REPORT` |

## References

- [`GOVERNANCE_FRONTMATTER_STANDARD.md`](./GOVERNANCE_FRONTMATTER_STANDARD.md)
- [`GOVERNANCE_TEMPLATE_REGISTRY.md`](./GOVERNANCE_TEMPLATE_REGISTRY.md)
