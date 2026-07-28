---
title: "Repository Migration Registry"
doc_id: "MIGRATION_REGISTRY"
version: "1.0"
status: "Active"
type: "governance-registry"
owner: "Architecture Office"
last_updated: "2026-07-27"
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
| MIG-20260726-GATE38-PASS382-HISTORY-REPAIR | 2026-07-26 | Gate 3.8 / Pass 3.8.2 — migration-history repair: environment-dependent certification harness migration replaced by an approved comment-only tombstone; deterministic out-of-migration certification harness added | [`MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md`](./MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md) | [`MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json`](./MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json) | [`MIGRATION_HISTORY_REPAIR_GATE38_PASS382_AUDIT_20260726`](../50-audit-reports/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_AUDIT_20260726.md) — **PASS** |
| MIG-20260728-GATE38-DUPLICATE-BASELINE-HISTORY-REPAIR | 2026-07-28 | Gate 3.8 — duplicate-baseline history repair: six dependency-coupled pre-consolidation `20260721` migrations converted to comment-only tombstones (no executable SQL); canonical object creation retained solely in `20260722030037`. Status: **IMPLEMENTED — CLEAN REPLAY CERTIFICATION PENDING** | [`MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_20260728.md`](./MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_20260728.md) | [`MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_MANIFEST.json`](./MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_MANIFEST.json) | [`MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_AUDIT_20260728`](../50-audit-reports/MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_AUDIT_20260728.md) — **STATIC REPAIR PASS — LIVE CLEAN REPLAY REQUIRED** |

## References

- [`GOVERNANCE_FRONTMATTER_STANDARD.md`](./GOVERNANCE_FRONTMATTER_STANDARD.md)
- [`GOVERNANCE_TEMPLATE_REGISTRY.md`](./GOVERNANCE_TEMPLATE_REGISTRY.md)

## Closure Notes

- `MIG-20260718-SD-IDENTIFIER-ALIGNMENT` — closed under its terminal audit.
- `008_rbac_foundation` — closed under `SPRINT_0_5_RBAC_FOUNDATION_REPORT`.
- `MIG-20260726-GATE38-PASS382-HISTORY-REPAIR` — **CLOSED**. Commit A (technical repair), Commit B (verified closure candidate, SHA pinned) and Commit C (terminal governance) are complete. Pass 3.8.2 is CLOSED. The separate signup-trigger finding `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` remains **OPEN — SEPARATE_TRIAGE_REQUIRED** and is tracked outside this migration.
