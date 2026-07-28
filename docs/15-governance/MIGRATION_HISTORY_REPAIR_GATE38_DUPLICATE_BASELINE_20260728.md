---
document: Migration History Repair — Gate 3.8 Duplicate Baseline
migration_id: MIG-20260728-GATE38-DUPLICATE-BASELINE-HISTORY-REPAIR
version: 1.0.0
date: 2026-07-28
owner: Platform Architecture
approval_status: Approved (explicit repository-owner approval, recorded below)
status: IMPLEMENTED — CLEAN REPLAY CERTIFICATION PENDING
---

# MIG-20260728-GATE38-DUPLICATE-BASELINE-HISTORY-REPAIR

## 1. Explicit approval

The repository owner and approver explicitly approved this controlled multi-file
historical migration exception under the identifier
`MIG-20260728-GATE38-DUPLICATE-BASELINE-HISTORY-REPAIR`.

Approved scope: conversion of the six dependency-coupled, pre-consolidation
`20260721` migration files into comment-only historical tombstones.

The approval is based on the verified connected-development migration ledger:

- the six `20260721` migration names are **absent** from the ledger;
- the consolidated `20260722030037` migration name is **present exactly once**;
- staging and production were **NOT INSPECTED — STATUS UNKNOWN**;
- **no existing database is modified** by this repository-only repair.

Historical fresh-replay semantics are changed intentionally; the intended final
schema must be proven equivalent through clean replay and database-catalog
comparison.

## 2. Baseline

- Starting repository HEAD: `d44c836e266e10406d2edfe2f313ccdbcfeeb99a`
- Protected generated file: `src/routeTree.gen.ts`, blob `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06` (unchanged)
- Preparation gate: `git status --porcelain=v1` returned empty (clean tree)

## 3. Environment verification

| Environment | Method | Result |
| --- | --- | --- |
| Connected development | Read-only migration-ledger name query (prior turn) | Six `20260721` names absent; `20260722030037` present exactly once |
| Staging | Not inspected | **NOT INSPECTED — STATUS UNKNOWN** |
| Production | Not inspected | **NOT INSPECTED — STATUS UNKNOWN** |

No database was accessed during this repair turn.

## 4. Defect

A clean replay of `supabase/migrations` from an empty database fails at
`20260722030037_9db62b70-9aaa-437e-b861-e28fb6f08319.sql` with:

```
SQLSTATE 42P07 — relation "profiles" already exists
```

## 5. Why the collision spans four object families

`20260722030037` is a **consolidated baseline** that unconditionally creates the
entire 001–005 object chain. The `20260721` block creates the same objects
first. The collision therefore is not confined to `profiles`:

| Object | Created by orphan block | Created by consolidated baseline |
| --- | --- | --- |
| `public.profiles` | `20260721163958` (003_profiles) | `20260722030037` |
| `public.app_role` | `20260721164105` (004_roles) | `20260722030037` |
| `public.user_roles` | `20260721164105` (004_roles) | `20260722030037` |
| `public.audit_logs` | `20260721164222` (005_audit_logs) | `20260722030037` |

Neutralizing only `profiles` would move the replay failure forward to
`app_role`, then `user_roles`, then `audit_logs`.

## 6. Why all six files must be neutralized

The three creation migrations are inseparable from three dependent
grant/revoke migrations that reference objects and functions the creation
migrations define:

| # | File | Original purpose | Dependency |
| --- | --- | --- | --- |
| 1 | `20260721163958_0dcf4abf-…` | 003_profiles | creates `public.profiles` |
| 2 | `20260721164025_fa9fb614-…` | 003a_lock_fn_handle_new_auth_user | REVOKEs on the function created by #1 |
| 3 | `20260721164105_a2d6fca5-…` | 004_roles | creates `app_role`, `user_roles`, `fn_has_role` |
| 4 | `20260721164143_3b5c5d5e-…` | 004a_revoke_fn_has_role_from_anon | REVOKE on the function created by #3 |
| 5 | `20260721164222_8c4c1388-…` | 005_audit_logs | creates `public.audit_logs` |
| 6 | `20260721164347_105ef743-…` | 006_revoke_anon_platform_grants | REVOKEs across #1, #3, #5 |

Retaining any dependent grant/revoke file while tombstoning its creator would
fail replay with `42883`/`42P01` (undefined function/relation). The block is
dependency-coupled and must be neutralized as a unit.

## 7. Why the two earlier migrations remain untouched

`20260721163907…` (001_extensions) and `20260721163929…` (002_shared_helpers)
are written idempotently (`CREATE EXTENSION IF NOT EXISTS`,
`CREATE OR REPLACE FUNCTION`) and do not collide with the consolidated
baseline. They are left byte-identical.

## 8. Canonical migration

Canonical object creation begins at:

```
supabase/migrations/20260722030037_9db62b70-9aaa-437e-b861-e28fb6f08319.sql
```

This file is unchanged and remains byte-identical to the starting HEAD.

## 9. Authorized paths

1. `supabase/migrations/20260721163958_0dcf4abf-e6db-4b96-a6d8-df7d27f95a1b.sql`
2. `supabase/migrations/20260721164025_fa9fb614-6563-4737-9843-0adae61dc636.sql`
3. `supabase/migrations/20260721164105_a2d6fca5-cda1-4964-b383-2a95fb666339.sql`
4. `supabase/migrations/20260721164143_3b5c5d5e-f813-416a-99b3-c4998e21f3d1.sql`
5. `supabase/migrations/20260721164222_8c4c1388-e4c4-4d28-afbc-31b3cc3ecc58.sql`
6. `supabase/migrations/20260721164347_105ef743-9451-4870-b0c7-fd2d9863d9d9.sql`
7. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_20260728.md`
8. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_MANIFEST.json`
9. `docs/15-governance/MIGRATION_REGISTRY.md`
10. `docs/50-audit-reports/MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_AUDIT_20260728.md`

## 10. Evidence requirements

**Before** (per subject file): repository path, Git blob SHA, SHA-256, byte
count, newline count, executable-line count, `git log --follow` commits,
original purpose, dependency relationship, canonical replacement.

**After** (per subject file): Git blob SHA, SHA-256, byte count, newline count,
executable-line count (must be `0`).

All values are recorded in
`MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_MANIFEST.json`.

Original executable content remains recoverable from Git history at
`d44c836e266e10406d2edfe2f313ccdbcfeeb99a`. It was not copied into any other
active migration.

## 11. Existing-environment safety analysis

- Supabase applies migrations by recorded name. The six names are absent from
  the connected-development ledger, so no already-applied migration is altered.
- Tombstoned files contain no executable SQL; if a runner records them, it
  records a no-op.
- Object state in any already-provisioned database is unchanged — this repair
  touches repository files only.
- Staging and production were not inspected. Before replaying against either,
  their ledgers must be checked for the six names; if present, this exception
  must be re-evaluated for that environment.

## 12. Fresh-replay validation requirement

Static verification alone is insufficient. Closure requires:

1. Clean replay of all 50 migrations against an empty disposable database with
   zero errors.
2. Database-catalog comparison proving the replayed schema is equivalent to the
   intended final schema (tables, columns, types, constraints, indexes,
   policies, grants, functions and volatility).

Historical fresh-replay semantics are changed intentionally; the intended final
schema must be proven equivalent through clean replay and database-catalog
comparison.

## 13. Standing statuses

| Item | Status |
| --- | --- |
| This exception | **IMPLEMENTED — CLEAN REPLAY CERTIFICATION PENDING** (not closed) |
| Clean replay | **NOT RUN — CERT_DB_URL INTENTIONALLY ABSENT** |
| Gate 3.8 certification | **CERTIFICATION FAILED** |
| Tenant activation | **BLOCKED** |
| `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` | **OPEN** |

## 14. Revision history

| Version | Date | Author | Change |
| --- | --- | --- | --- |
| 1.0.0 | 2026-07-28 | Platform Architecture | Initial issue — controlled six-file historical tombstone repair. |
