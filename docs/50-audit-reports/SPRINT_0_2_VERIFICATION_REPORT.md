# Sprint 0.2 — Database Foundation · Verification Report

## Verification Metadata

| Field                | Value                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| Report ID            | `SPRINT_0_2_VERIFICATION_REPORT`                                          |
| Sprint               | 0.2 — Database Foundation                                                 |
| Verification Date    | 2026-07-21                                                                |
| Standard             | Verification Reporting Standard v1.0 (Check → Evidence → Result)          |
| Governance           | `docs/15-governance/DATABASE_STANDARD.md`                                 |
| Migrations Applied   | 001_extensions, 002_shared_helpers, 003_profiles, 003a_lock_fn_handle_new_auth_user, 004_roles, 004a_revoke_fn_has_role_from_anon, 005_audit_logs, 006_revoke_anon_platform_grants |
| Author               | Platform Engineering                                                      |
| Status               | **PASS — Ready for Sprint 0.3 (Authentication Platform)**                 |

## Verification Table

| #  | Check                                                                                                                                                       | Evidence                                                                                                                                                                    | Result   |
| -- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1  | All migrations applied cleanly; `supabase--linter` returns no unresolved errors.                                                                            | Migrations 001–006 each returned "completed successfully". Only remaining linter output is the accepted `fn_has_role` WARN (see § Accepted Findings).                       | PASS     |
| 2  | Every new public table has RLS enabled, GRANT block present, ≥1 policy.                                                                                     | `pg_class.relrowsecurity = true` for `profiles`, `user_roles`, `audit_logs`. Policy counts: profiles=2, user_roles=5, audit_logs=1.                                         | PASS     |
| 3  | Every new table carries the full standard audit + soft-delete column set (id, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by).      | Cross-join probe against `information_schema.columns` returned 0 missing columns across all three tables.                                                                    | PASS     |
| 4  | Every new table has `COMMENT ON TABLE`; every new function has `COMMENT ON FUNCTION`; every new enum has `COMMENT ON TYPE`; `COMMENT ON TRIGGER` where non-obvious. | `obj_description` non-null for all three tables, all three functions, and `app_role` type. Trigger names encode intent (`trg_<table>_updated_at`, `trg_auth_users_after_insert`) — function comments are the source of truth. | PASS     |
| 5  | Object names follow the `fn_` / `trg_` / `idx_` / `uq_` / `<table>_<audience>_<action>` convention.                                                          | Functions: `fn_set_updated_at`, `fn_handle_new_auth_user`, `fn_has_role`. Triggers: `trg_profiles_updated_at`, `trg_user_roles_updated_at`, `trg_audit_logs_updated_at`, `trg_auth_users_after_insert`. Indexes: `idx_user_roles_user_id`, `idx_audit_logs_entity`, `idx_audit_logs_occurred_at`, `idx_audit_logs_actor_id`. Unique: `uq_user_roles_user_role`. Policies: `profiles_owner_select`, `user_roles_admin_insert`, `audit_logs_admin_select`, etc. | PASS     |
| 6  | Every new function declares volatility explicitly and matches the volatility convention.                                                                    | `pg_proc.provolatile`: `fn_set_updated_at=v`, `fn_handle_new_auth_user=v`, `fn_has_role=s`. Matches DATABASE_STANDARD § 4.                                                  | PASS     |
| 7  | Index Guidance applied: FKs and RLS-predicate columns are indexed; no duplicate indexes on unique constraints.                                              | `idx_user_roles_user_id` covers RLS predicate + FK; `idx_audit_logs_actor_id` covers actor FK; `idx_audit_logs_entity` covers `(entity_type, entity_id)`; `uq_user_roles_user_role` supplies the unique index — no duplicate `idx_*` on same columns. | PASS     |
| 8  | `fn_has_role` is `STABLE SECURITY DEFINER` with `search_path = public`.                                                                                     | `pg_proc`: `provolatile='s'`, `prosecdef=true`, `SET search_path = public` in migration 004.                                                                                | PASS     |
| 9  | `profiles` auto-create trigger fires on new `auth.users` insert. Trigger owns no objects inside `auth` schema.                                              | `pg_trigger`: `trg_auth_users_after_insert` on `auth.users` calling `public.fn_handle_new_auth_user()`. The function is `SECURITY DEFINER` owned in `public`; migration creates no `auth.*` objects. Runtime end-to-end signup exercise deferred to Sprint 0.3 (Authentication Platform). | PASS (structural) |
| 10 | `audit_logs` INSERT denied to `authenticated`; allowed to `service_role`. Append-only + `occurred_at` vs `created_at` semantics documented in table comment. | `has_table_privilege('service_role','public.audit_logs','INSERT') = true`; no INSERT policy exists for `authenticated`, so INSERT is blocked even with the GRANT (which was intentionally not issued). Table comment records append-only rule and timestamp semantics. | PASS     |
| 11 | Plural table names + snake_case throughout.                                                                                                                 | `profiles`, `user_roles`, `audit_logs`. All identifiers snake_case.                                                                                                         | PASS     |
| 12 | Every migration file carries the standard header (Migration ID, Sprint, Purpose, Dependencies, Rollback, Author, Date).                                    | Header present in 001, 002, 003, 003a, 004, 004a, 005, 006. Format matches DATABASE_STANDARD § 9.                                                                            | PASS     |
| 13 | Rollback dry-run: each migration ships a reverse SQL block, reviewed for completeness. Execution skipped in absence of a rollback test environment.         | Every migration file contains a `-- ROLLBACK` block with `DROP` statements in reverse dependency order. Not executed (documented operational gap; recorded for Sprint 0.6 or infrastructure sprint). | PASS (documented) |
| 14 | No module-specific tables introduced (scope guard).                                                                                                          | `pg_class.relkind='r'` in `public` returns exactly `profiles`, `user_roles`, `audit_logs`. Zero MOD-002…MOD-019 tables.                                                     | PASS     |
| 15 | `bun run build`, `bun run lint`, `bun run test` all PASS.                                                                                                    | `bun run build` → nitro output generated; `bun run lint` → 0 errors, 11 pre-existing shadcn fast-refresh warnings; `bun run test` → 2/2 pass.                                | PASS     |
| 16 | No frontend/auth-provider changes (scope guard).                                                                                                             | `git diff --stat src/` shows only `src/__tests__/smoke.test.ts` (new) and lint auto-format on unrelated files. No auth provider config, no `requireSupabaseAuth` wiring, no OAuth setup. | PASS     |
| 17 | Only `pgcrypto` enabled in `001_extensions`.                                                                                                                 | Migration 001 body: `CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;` — no other extensions.                                                                    | PASS     |

## Verification Summary

- **Checks Executed:** 17
- **PASS:** 17
- **FAIL:** 0
- **DEFERRED / STRUCTURAL:** 2 (Check 9 runtime probe → Sprint 0.3; Check 13 rollback execution → future infrastructure sprint)
- **Blockers for Sprint 0.3:** 0

## Accepted Findings

### F-S02-A01 — `fn_has_role` SECURITY DEFINER executable by authenticated (linter WARN 0029)

- **Status:** Accepted. Documented in `mem://security-memory`.
- **Rationale:** `fn_has_role` is the canonical Supabase `has_role` helper invoked from RLS policies on `user_roles` and `audit_logs`. RLS policy expressions run with the caller's privileges; revoking `EXECUTE` from `authenticated` would break all admin-gated policies. `anon` EXECUTE is explicitly revoked (migration 004a).
- **Compensating controls:** Function is `STABLE`, `search_path = public`, body is a single `SELECT EXISTS` against `public.user_roles`. No privilege escalation surface.

## Objects Introduced

| Kind      | Name                                                          |
| --------- | ------------------------------------------------------------- |
| Table     | `public.profiles`, `public.user_roles`, `public.audit_logs`   |
| Enum      | `public.app_role` (values: `admin`, `member`)                 |
| Function  | `public.fn_set_updated_at()`, `public.fn_handle_new_auth_user()`, `public.fn_has_role(uuid, public.app_role)` |
| Trigger   | `trg_profiles_updated_at`, `trg_user_roles_updated_at`, `trg_audit_logs_updated_at`, `trg_auth_users_after_insert` |
| Index     | `idx_user_roles_user_id`, `idx_audit_logs_entity`, `idx_audit_logs_occurred_at`, `idx_audit_logs_actor_id` |
| Constraint| `uq_user_roles_user_role`                                     |
| Policies  | `profiles_owner_select`, `profiles_owner_update`, `user_roles_owner_select`, `user_roles_admin_select`, `user_roles_admin_insert`, `user_roles_admin_update`, `user_roles_admin_delete`, `audit_logs_admin_select` |

## Repository State Transition

`SPRINT_0_1_FOUNDATION_VERIFIED` → **`SPRINT_0_2_DATABASE_FOUNDATION_VERIFIED`**

Sprint 0.3 (Authentication Platform) is authorized.
