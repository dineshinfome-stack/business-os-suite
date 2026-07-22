## Sprint 0.2 — Database Foundation Verification & Rebuild Closeout

### Current state (verified before planning)

The consolidated Sprint 0.2 migration has been applied on the newly connected Supabase project, and the private-schema hardening is in place:

- Tables `public.profiles`, `public.user_roles`, `public.audit_logs` exist with full audit/soft-delete columns, RLS enabled, and policies scoped through `private.fn_has_role`.
- Enum `public.app_role` exists (`admin`, `member`).
- Functions: `private.fn_has_role`, `private.fn_handle_new_auth_user`, `public.fn_set_updated_at`.
- Triggers cover `updated_at` on all three tables plus `auth.users` new-user handling.
- `src/integrations/supabase/types.ts` already exposes `profiles`, `user_roles`, `audit_logs`, and `app_role`.

Sprint 0.2 implementation is complete. Remaining work is verification, not rebuilding.

### Plan

1. **Read-only verification sweep** against the live database and repo:
   - **Schema**: tables, columns, PKs, indexes, constraints, defaults.
   - **Enums**: `app_role` values.
   - **Functions**: schema placement, `SECURITY DEFINER`, volatility, `search_path`.
   - **Triggers**: presence, target tables, ordering.
   - **RLS**: `relrowsecurity = true`; every policy references `private.fn_has_role`.
   - **Grants**: `anon` / `authenticated` / `service_role` on each table and function; `EXECUTE` on `private.*` revoked from `anon` and `authenticated`.
   - **Types**: `types.ts` exposes the four names.
   - **Stale references**: `rg` for `public.fn_has_role` and `rpc('fn_has_role')` across `src/`, `docs/`, `supabase/` (excluding historical migrations and historical audit reports).
   - **Migration Integrity**: consolidated Sprint 0.2 migration present; ordering consistent; migration history matches current schema; no duplicate tables/functions/policies from earlier rebuild attempts; no orphaned artifacts.
   - **Toolchain**: typecheck, build, lint.

2. **If any check fails**, apply the minimal fix via a new remediation migration (never edit historical ones). Otherwise no schema changes.

3. **Author deliverable** `docs/50-audit-reports/SPRINT_0_2_DATABASE_FOUNDATION_REBUILD_REPORT.md` using the Verification Reporting Standard (Check → Evidence → Result). Sections, in order: Schema, Tables, Functions, Triggers, RLS, Grants, Types, Security, Migration Integrity, Toolchain, Readiness Assessment, **Verification Verdict**.

   **Verification Verdict** structure:
   - Overall Verification: **PASS** / **FAIL**
   - Blocking Findings (list; empty if none)
   - Observations (non-blocking)
   - Ready for Sprint 0.3: **READY** / **READY WITH OBSERVATIONS** / **NOT READY**
   - Reviewer Conclusion (one paragraph)
   - **Repository Baseline** (new subsection — snapshot of the exact verified environment):
     - Supabase Project ID
     - Database Migration Baseline (latest applied migration filename / timestamp)
     - Generated Types Revision (`types.ts` PostgrestVersion + last-modified stamp)
     - Verification Date (UTC)
     - Sprint Status

   If the verdict is not `READY`, every blocking finding must be enumerated.

### Out of scope

- Sprint 0.3 auth implementation, tenancy, business modules.
- Edits to historical migrations or historical audit reports.
- Governance document changes.

### Deliverables

- `docs/50-audit-reports/SPRINT_0_2_DATABASE_FOUNDATION_REBUILD_REPORT.md`
- (Only if a gap is found) one new remediation migration under `supabase/migrations/`.
