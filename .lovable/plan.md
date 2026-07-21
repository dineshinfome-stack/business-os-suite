# Sprint 0.2 — Database Foundation (v5, Final)

Adds four optional refinements: function volatility convention, index guidance, migration header template, and Check → Evidence → Result verification format.

## Wave 0 Sprint Sequence

```text
0.1 Project Foundation           (complete, verified)
0.2 Database Foundation          (this sprint)
0.3 Authentication Platform
0.4 Organization / Tenant Mgmt
0.5 RBAC
0.6 Shared Platform Services
```

## Sprint 0.2.0 — Opening Tasks (close Sprint 0.1 findings)

1. **F-S01-002 — ESLint resolver.** Install `eslint-import-resolver-typescript`; register under `settings['import/resolver'].typescript` in `eslint.config.js`. Verify `bun run lint` completes.
2. **F-S01-001 — Smoke test.** Add `src/__tests__/smoke.test.ts` (trivial assertion + one alias import). Verify `bun run test` exits 0.
3. **Baseline re-verification.** Run `bun run build`, `bun run lint`, `bun run test`; capture outputs.

Deferred: Administration vs. Settings sidebar duplication → Sprint 0.4.

## Repository Database Standards

Deliverable: `docs/15-governance/DATABASE_STANDARD.md` (authored before any migration).

### Naming
- `snake_case` identifiers.
- **Plural** table names (`profiles`, `user_roles`, `audit_logs`).
- **Singular** enum type names (`app_role`).
- Object naming:
  - Functions: `fn_<purpose>`.
  - Triggers: `trg_<table>_<event>`.
  - Policies: `<table>_<audience>_<action>`.
  - Indexes: `idx_<table>_<columns>`; unique: `uq_<table>_<columns>`.

### Repository Table Standard (all application tables)

```text
id           uuid        PK, DEFAULT gen_random_uuid()
created_at   timestamptz NOT NULL DEFAULT now()
created_by   uuid        NULL  REFERENCES auth.users(id)
updated_at   timestamptz NOT NULL DEFAULT now()
updated_by   uuid        NULL  REFERENCES auth.users(id)
deleted_at   timestamptz NULL
deleted_by   uuid        NULL  REFERENCES auth.users(id)
```
- `gen_random_uuid()` directly (no wrapper helper).
- `updated_at` maintained by shared `fn_set_updated_at()` trigger.
- Soft-delete columns present now; per-module filtering enforced later.
- **`audit_logs` exception:** append-only. Soft-delete columns MUST NOT be written during normal operation. Purging is governed by the future retention/archival strategy.

### Function Volatility Convention (new)

Documented in `DATABASE_STANDARD.md`:

| Volatility  | Use for                                                                    |
| ----------- | -------------------------------------------------------------------------- |
| `IMMUTABLE` | Pure functions of their arguments (no DB reads, no `now()`, no `random`).  |
| `STABLE`    | Read-only lookup helpers within a single statement (e.g. `fn_has_role`).   |
| `VOLATILE`  | Only when the function mutates state, calls `now()` outside `DEFAULT`, or depends on session state. |

- Every new function MUST declare volatility explicitly (no reliance on the `VOLATILE` default).
- Trigger functions returning `NEW` (e.g. `fn_set_updated_at`, `fn_handle_new_auth_user`) are `VOLATILE` (required for triggers that mutate rows).
- `fn_has_role` is `STABLE`.

### Index Guidance (new)

Documented in `DATABASE_STANDARD.md`:

- **Foreign keys** SHOULD be indexed unless there is a documented reason not to (join performance, cascade delete cost).
- **Columns used in RLS predicates** MUST be reviewed at migration time; if the predicate filters a non-PK column (e.g. `user_id`, `org_id`), add a supporting index.
- **Unique constraints** rely on Postgres's automatic supporting index — do not add a duplicate `idx_*` on the same columns.
- **JSONB audit columns** (`old_values`, `new_values`) are not indexed by default; add GIN indexes only when a concrete query need appears.

Sprint 0.2 concrete indexes:
- `uq_user_roles_user_role` on `(user_id, role)` (from `UNIQUE`).
- `idx_user_roles_user_id` (RLS predicate + FK).
- `idx_audit_logs_entity` on `(entity_type, entity_id)`.
- `idx_audit_logs_occurred_at` for chronological queries.
- `idx_audit_logs_actor_id` (FK to `auth.users`).

### Documentation (required)
- `COMMENT ON TABLE`, `COMMENT ON FUNCTION`, `COMMENT ON TYPE` (including enums).
- `COMMENT ON TRIGGER` where the trigger's purpose isn't obvious from its function name.
- `COMMENT ON COLUMN` for non-obvious columns.

### Timestamp semantics
- `created_at` — when the DB row itself was inserted.
- `occurred_at` (audit only) — when the audited real-world event happened.

### Security
- RLS enabled on every `public` table.
- GRANT block immediately after every `CREATE TABLE`.
- authenticated + service_role by default; `anon` only when a matching anon-scoped policy exists.
- Roles never on `profiles` — always `user_roles` + `fn_has_role()`.

### Audit rows
- `old_values jsonb`, `new_values jsonb` (no computed `diff`).

## Migration Header Template (new)

Every migration file begins with a standardized header comment (lightweight for Sprint 0.2; canonical from now on):

```sql
-- =============================================================================
-- Migration:     <NNN>_<slug>
-- Sprint:        <e.g. 0.2>
-- Purpose:       <one-line description>
-- Dependencies:  <previous migration IDs, or "none">
-- Rollback:      <inline reverse SQL, or reference to a rollback block below>
-- Author:        <name/handle>
-- Date:          <YYYY-MM-DD>
-- =============================================================================
```

Full reverse SQL block appears at the bottom of the file inside a `-- ROLLBACK` comment section (not executed automatically).

## Migration Strategy

Six ordered migrations, each with the header template above:

```text
001_extensions          pgcrypto only
002_shared_helpers      fn_set_updated_at()
003_profiles            profiles + trg_auth_users_after_insert
004_roles               app_role enum, user_roles, fn_has_role, policies
005_audit_logs          audit_logs + policies + indexes
006_standards_probe     read-only assertions (see Verification)
```

Each migration self-contained: `CREATE → GRANT → ALTER ENABLE RLS → CREATE POLICY → INDEX → COMMENT`s.

Extension policy: only `pgcrypto`. `citext` deferred.

## Objects Introduced

### `public.profiles`
- `id uuid PK REFERENCES auth.users(id) ON DELETE CASCADE`.
- `display_name text`, `avatar_url text`.
- Standard audit + soft-delete columns.
- Trigger `trg_auth_users_after_insert` on `auth.users` calls `fn_handle_new_auth_user()` → inserts profile row.
- **Auth-schema boundary:** the trigger references `auth.users` but creates/owns no objects in `auth`. All owned objects live in `public`.
- Policies: `profiles_owner_select`, `profiles_owner_update`; service_role full.

### `public.app_role` enum
- Values: `admin`, `member`. `COMMENT ON TYPE` required.

### `public.user_roles`
- `(user_id uuid, role app_role)` UNIQUE; standard audit columns; supporting indexes as listed above.
- Policies: user SELECTs own; only `admin` (via `fn_has_role`) writes; service_role full.
- Forward note: tenant scoping (`org_id`) will be added in Sprint 0.4/0.5.

### `public.fn_has_role(_user_id uuid, _role app_role) returns boolean`
- `LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public`.

### `public.audit_logs`
- Standard audit columns + `actor_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `occurred_at`.
- Append-only; supporting indexes per Index Guidance.
- SELECT policy: `fn_has_role(auth.uid(),'admin')`.
- Retention/partitioning deferred; `TODO` recorded in `COMMENT ON TABLE`.

### `public.fn_set_updated_at()`
- `VOLATILE` trigger function; sets `NEW.updated_at = now()`; attached as `trg_<table>_updated_at`.

## Out of Scope (Sprint 0.3+)

Google OAuth, `requireSupabaseAuth`, bearer middleware verification, frontend integration, storage buckets, module-specific tables, `citext`, audit retention/partitioning, data-driven role model, tenant-scoped role assignments.

## Verification (Sprint 0.2 exit criteria)

Deliverable: `docs/50-audit-reports/SPRINT_0_2_VERIFICATION_REPORT.md`.

**Format upgrade:** the verification table uses **Check → Evidence → Result** columns. `Evidence` cites the specific migration file, object name, or command output that satisfies the check (e.g. `005_audit_logs.sql § CREATE POLICY audit_logs_admin_select`).

Checks:

1. All 6 migrations applied cleanly; `supabase--linter` returns no errors.
2. Every new public table has RLS enabled, GRANT block present, ≥1 policy.
3. Every new table carries the full standard audit + soft-delete column set.
4. Every new table has `COMMENT ON TABLE`; every new function has `COMMENT ON FUNCTION`; every new enum has `COMMENT ON TYPE`. `COMMENT ON TRIGGER` present where non-obvious.
5. Object names follow the `fn_` / `trg_` / `idx_` / `uq_` / `<table>_<audience>_<action>` convention.
6. Every new function declares volatility explicitly and matches the volatility convention.
7. Index Guidance applied: FKs and RLS-predicate columns are indexed; no duplicate indexes on unique constraints.
8. `fn_has_role` is `STABLE SECURITY DEFINER` with `search_path = public`.
9. `profiles` auto-create trigger fires on new `auth.users` insert (probe). Trigger owns no objects inside the `auth` schema.
10. `audit_logs` INSERT denied to `authenticated`; allowed to `service_role`. Append-only + `occurred_at` vs `created_at` semantics documented in table comment.
11. Plural table names + snake_case throughout.
12. Every migration file carries the standard header (Migration ID, Sprint, Purpose, Dependencies, Rollback, Author, Date).
13. **Rollback dry-run:** each migration ships a documented reverse SQL block, reviewed for completeness. Actual execution is skipped unless a dedicated rollback test environment exists (recorded as a future operational task).
14. No module-specific tables introduced.
15. `bun run build`, `bun run lint`, `bun run test` all PASS.
16. No frontend/auth-provider changes.
17. Only `pgcrypto` enabled in `001_extensions`.

## Technical Details

- `pgcrypto` supplies `gen_random_uuid()`.
- `fn_set_updated_at()` sets `NEW.updated_at = now()`, returns `NEW`, `SET search_path = public`, `VOLATILE`.
- `fn_handle_new_auth_user()` is `SECURITY DEFINER VOLATILE`, `SET search_path = public`, inserts `(id) VALUES (NEW.id)` into `profiles`.
- `created_by` / `updated_by` nullable — populated by the app layer from Sprint 0.3 onward.
- Soft-delete filtering is a per-module concern in later sprints.
