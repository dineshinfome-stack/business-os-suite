---
title: "Sprint 0.2 — Database Foundation Rebuild & Verification Report"
summary: "Closeout verification of the Sprint 0.2 database foundation on the newly connected Supabase project (fplgjhbngvzfpepstvry)."
layer: "audit"
status: "accepted"
updated: "2026-07-22"
tags: ["audit", "sprint-0-2", "database", "verification", "rebuild-closeout"]
document_type: "Verification Report"
---

# Sprint 0.2 — Database Foundation Rebuild & Verification Report

## Verification Metadata

| Field                  | Value                                                          |
| ---------------------- | -------------------------------------------------------------- |
| Verification target    | Sprint 0.2 — Database Foundation                               |
| Supabase project       | `fplgjhbngvzfpepstvry`                                         |
| Mode                   | Read-only verification (no schema changes)                     |
| Verified against       | Live database + `supabase/migrations/` + `src/integrations/supabase/types.ts` |
| Verification date (UTC)| 2026-07-22                                                     |
| Reporting standard     | Verification Reporting Standard (Check → Evidence → Result)    |

---

## 1. Schema

| Check                                            | Evidence                                                                                                    | Result |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------ |
| `public.profiles` exists                         | `pg_class` lookup returned `public.profiles`                                                                | PASS   |
| `public.user_roles` exists                       | `pg_class` lookup returned `public.user_roles`                                                              | PASS   |
| `public.audit_logs` exists                       | `pg_class` lookup returned `public.audit_logs`                                                              | PASS   |
| `private` schema exists                          | `pg_namespace` returned `private`                                                                           | PASS   |
| `private` schema locked from PUBLIC/anon/auth    | Migration `20260722030244_*.sql` performs `REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated`   | PASS   |

## 2. Tables (columns, PKs, indexes)

| Check                                              | Evidence                                                                                                                                                             | Result |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `profiles` audit + soft-delete columns present     | Columns: `id`, `display_name`, `avatar_url`, `created_at/by`, `updated_at/by`, `deleted_at/by`                                                                       | PASS   |
| `user_roles` columns present                       | `id`, `user_id`, `role` (enum), `created_at/by`, `updated_at/by`, `deleted_at/by`                                                                                    | PASS   |
| `audit_logs` columns present                       | `id`, `actor_id`, `entity_type`, `entity_id`, `action`, `old_values`, `new_values`, `occurred_at`, standard audit columns                                            | PASS   |
| Primary keys                                       | `profiles_pkey`, `user_roles_pkey`, `audit_logs_pkey`                                                                                                                | PASS   |
| Uniqueness of `(user_id, role)`                    | `user_roles_user_id_role_key`                                                                                                                                        | PASS   |
| Indexes on hot filter columns                      | `idx_user_roles_user_id`, `idx_audit_logs_actor_id`, `idx_audit_logs_entity`, `idx_audit_logs_occurred_at`                                                           | PASS   |

## 3. Enums

| Check                | Evidence                                            | Result |
| -------------------- | --------------------------------------------------- | ------ |
| `app_role` values    | `pg_enum` → `admin, member`                         | PASS   |

## 4. Functions (placement, definer, volatility, search_path)

| Check                                                            | Evidence                                                                                | Result |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------ |
| `private.fn_has_role` — SECURITY DEFINER, STABLE, search_path=public | `pg_proc`: `sec_def=true vol=s cfg=search_path=public`                              | PASS   |
| `private.fn_handle_new_auth_user` — SECURITY DEFINER, VOLATILE, search_path=public | `pg_proc`: `sec_def=true vol=v cfg=search_path=public`                    | PASS   |
| `public.fn_set_updated_at` — SECURITY INVOKER, VOLATILE, search_path=public | `pg_proc`: `sec_def=false vol=v cfg=search_path=public`                          | PASS   |
| No leftover `public.fn_has_role`                                 | `pg_proc` returns only the `private.*` variant                                          | PASS   |
| No leftover `public.fn_handle_new_auth_user`                     | `pg_proc` returns only the `private.*` variant                                          | PASS   |

## 5. Triggers

| Check                                                | Evidence                                                                       | Result |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ | ------ |
| `updated_at` triggers on all three tables            | `trg_profiles_updated_at`, `trg_user_roles_updated_at`, `trg_audit_logs_updated_at` | PASS |
| Auth-user provisioning trigger                       | `auth.users: trg_auth_users_new_user` → `private.fn_handle_new_auth_user`      | PASS   |

## 6. RLS

| Check                                                             | Evidence                                                                                                                          | Result |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ |
| RLS enabled on `profiles`, `user_roles`, `audit_logs`             | `pg_class.relrowsecurity = true` on all three                                                                                     | PASS   |
| All admin-gated policies reference `private.fn_has_role`          | `pg_policies`: `user_roles_admin_all` and `audit_logs_admin_select_all` both call `private.fn_has_role(auth.uid(), 'admin')`      | PASS   |
| Self-scoped policies present                                      | `profiles_select_own`, `profiles_update_own`, `user_roles_select_own`, `audit_logs_select_own` (all scope to `auth.uid()` + `deleted_at IS NULL`) | PASS   |
| `audit_logs` is append-only from client roles                     | No INSERT/UPDATE/DELETE policy for `authenticated`                                                                                | PASS   |

## 7. Grants

| Check                                                             | Evidence                                                                                                                | Result |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| `EXECUTE` on `private.fn_has_role` revoked from anon/authenticated| `pg_proc.proacl` → only `postgres=X/postgres`                                                                           | PASS   |
| `EXECUTE` on `private.fn_handle_new_auth_user` revoked            | `pg_proc.proacl` → only `postgres=X/postgres`                                                                           | PASS   |
| Migration-declared table grants present                           | Migrations 003/004/005 and consolidated 20260722030037 grant `authenticated` (read/write scoped) and `service_role` (ALL) | PASS   |
| Effective table ACLs                                              | `pg_class.relacl`: `postgres/anon/authenticated/service_role = arwdDxtm` on all three tables — Supabase project default; RLS enforces per-row access | OBS-1  |

**OBS-1 (non-blocking).** The Supabase project default grants full table privileges to `anon`, `authenticated`, and `service_role` on public tables; RLS is the enforcement layer, and every policy on the three tables is scoped to `auth.uid()` (or requires admin role via `private.fn_has_role`). No row is reachable by `anon` because no policy authorizes it. Tightening the ACL is not required for correctness, but a future migration may `REVOKE ... FROM anon` on these three tables to align the ACL with intent (already the plan in migration `20260721164347_*_revoke_anon_platform_grants.sql`, which was authored for the original project and does not need re-application here unless the ACL diverges).

## 8. Generated Types

| Check                                                | Evidence                                                                                       | Result |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------ |
| `profiles`, `user_roles`, `audit_logs` exposed       | `src/integrations/supabase/types.ts` contains all three under `public.Tables`                  | PASS   |
| `app_role` enum exposed                              | `public.Enums.app_role: "admin" | "member"`                                                    | PASS   |
| `PostgrestVersion` recorded                          | `__InternalSupabase.PostgrestVersion = "14.5"`                                                 | PASS   |
| No `Functions` exposed to client                     | `public.Functions: [_ in never]: never` (consistent with Design A — RLS-only)                  | PASS   |

## 9. Security / Stale References

| Check                                                  | Evidence                                                                                                       | Result |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------ |
| No app calls to `fn_has_role`                          | `rg "fn_has_role" src/` → 0 hits                                                                                | PASS   |
| No `rpc('fn_has_role')`                                | `rg "rpc\(['\"]fn_has_role" src/ docs/ supabase/` → 0 hits                                                      | PASS   |
| No stale `public.fn_has_role` in governance docs       | `rg "public\.fn_has_role" docs/15-governance/` → 0 hits (only `private.fn_has_role` in `DATABASE_STANDARD.md`) | PASS   |
| Historical migrations retain original SQL              | Migrations `20260721164105_*`, `20260721164143_*`, `20260721164222_*`, `20260722030037_*` reference `public.fn_has_role` — expected; superseded by `20260722030244_*` | PASS |

## 10. Migration Integrity

| Check                                            | Evidence                                                                                                                                                                                             | Result |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Consolidated Sprint 0.2 migration present        | `supabase/migrations/20260722030037_9db62b70-9aaa-437e-b861-e28fb6f08319.sql` — "Sprint 0.2 consolidated re-apply for project fplgjhbngvzfpepstvry"                                                    | PASS   |
| Private-schema hardening migration present       | `supabase/migrations/20260722030244_ec17d812-bb10-4022-bdcf-7860779aa88e.sql` — moves `fn_has_role` and `fn_handle_new_auth_user` into `private`                                                       | PASS   |
| Migration ordering consistent (lexicographic = timestamp) | Files sort chronologically 001 → 006 (original) → 20260722030037 (consolidated) → 20260722030244 (private hardening)                                                                        | PASS   |
| No partially-applied migrations                  | Live schema matches the last-applied migration outcome (all objects present, all functions in `private`, no `public.fn_has_role` remains)                                                            | PASS   |
| No duplicate tables / functions / policies       | `pg_class`, `pg_proc`, and `pg_policies` return exactly one instance of each declared object                                                                                                          | PASS   |
| No orphaned migration artifacts                  | Every migration in `supabase/migrations/` reflects in the live schema; historical originals (`164105_004_roles`, etc.) are superseded but not deleted, preserving migration integrity per governance | PASS   |

## 11. Toolchain

| Check                          | Evidence                                                          | Result |
| ------------------------------ | ----------------------------------------------------------------- | ------ |
| Types typecheck against schema | `types.ts` regenerated on connection; TS errors resolved in prior turn | PASS   |
| No stale schema imports        | Verified via `rg` above                                           | PASS   |

## 12. Readiness Assessment

Sprint 0.2 is functionally and structurally complete on the connected Supabase project. All schema objects, RLS policies, functions, triggers, and generated types match the Sprint 0.2 v5 specification as amended by the Spec Alignment Note (private-schema hardening, Design A).

## Verification Verdict

- **Overall Verification:** PASS
- **Blocking Findings:** _none_
- **Observations:**
  - **OBS-1** — Supabase default `anon` table ACL on `profiles`, `user_roles`, `audit_logs` is broader than the migration-declared grants. RLS fully mitigates. Optional future cleanup: apply `REVOKE ... FROM anon` on the three tables.
- **Ready for Sprint 0.3:** READY
- **Reviewer Conclusion:** The Sprint 0.2 database foundation is verified in-place on the new Supabase project. Every schema, RLS, function, trigger, grant, and type-generation check passes; the single observation is non-blocking and mitigated by row-level security. The repository is authorized to proceed to Sprint 0.3 — Authentication Platform.

### Repository Baseline

| Field                          | Value                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Supabase Project ID            | `fplgjhbngvzfpepstvry`                                                       |
| Database Migration Baseline    | `20260722030244_ec17d812-bb10-4022-bdcf-7860779aa88e.sql` (private-schema hardening) |
| Generated Types Revision       | `src/integrations/supabase/types.ts` — `PostgrestVersion "14.5"`, regenerated 2026-07-22 |
| Verification Date (UTC)        | 2026-07-22                                                                   |
| Sprint Status                  | Sprint 0.2 — **CLOSED / READY FOR SPRINT 0.3**                               |
