# Sprint 0.4B — Platform Security Hardening — Verification Report

**Sprint:** 0.4B
**Date:** 2026-07-22
**Verdict:** ✅ **PASS** — Authorized to begin Sprint 0.5 (RBAC Foundation)
**Migration applied:** None (review confirmed no code change required)

---

## 1. Scope

Close out the two open observations from Sprint 0.4A §5:

1. `SECURITY DEFINER` linter warnings on `private.fn_has_role`, `private.fn_is_org_member`, `private.fn_org_role`.
2. "Leaked Password Protection Disabled" in Supabase Auth.

Success is measured by security outcomes — documented review, enabled setting, existing users unaffected — not by whether any specific linter rule continues to emit informational warnings.

## 2. SECURITY DEFINER Review

Live inspection via `pg_proc` / `pg_namespace` / `pg_roles` and `has_function_privilege` (2026-07-22).

| # | Function | Schema | SECURITY DEFINER | Fixed `search_path` | Volatility | Owner | `EXECUTE` grants | Dynamic SQL / writes | Result |
|---|---|---|---|---|---|---|---|---|---|
| D-1 | `fn_has_role(uuid, app_role)` | `private` ✓ | yes ✓ | `search_path=public` ✓ | `STABLE` ✓ | `postgres` (see note) | `authenticated=true`, `anon=false`, `PUBLIC=false` ✓ | none — single `SELECT EXISTS` against `public.user_roles` ✓ | ✅ PASS |
| D-2 | `fn_is_org_member(uuid, uuid)` | `private` ✓ | yes ✓ | `search_path=public` ✓ | `STABLE` ✓ | `postgres` (see note) | `authenticated=true`, `anon=false`, `PUBLIC=false` ✓ | none — single `SELECT EXISTS` against `public.organization_members` ✓ | ✅ PASS |
| D-3 | `fn_org_role(uuid, uuid)` | `private` ✓ | yes ✓ | `search_path=public` ✓ | `STABLE` ✓ | `postgres` (see note) | `authenticated=true`, `anon=false`, `PUBLIC=false` ✓ | none — single `SELECT ... LIMIT 1` against `public.organization_members` ✓ | ✅ PASS |

**Ownership note.** All three functions are owned by `postgres`, the Supabase-managed superuser. `docs/15-governance/DATABASE_STANDARD.md` does not yet define a dedicated least-privileged owner role for `SECURITY DEFINER` helpers. This matches every other `SECURITY DEFINER` function in the project (e.g. `public.rls_auto_enable`, `private.fn_handle_new_auth_user`) and is the Supabase default. Introducing a dedicated `sec_definer_owner` role is deferred to a future governance update and tracked as an observation, not a blocker — the schema is private, `PUBLIC` execute is revoked, and the bodies contain no dynamic SQL, so the practical attack surface is unchanged by the owner identity.

**Outcome.** All three helpers are **Accepted by Design**. No migration `008` required.

## 3. Supabase Auth Configuration

| Setting | Before | After | Evidence | Result |
|---|---|---|---|---|
| Leaked Password Protection (HaveIBeenPwned) | Disabled | **Enabled** | Toggled in Supabase Dashboard → Authentication → Providers → Email → "Enable leaked password protection". Confirmed via the linter no longer surfacing `auth_leaked_password_protection` after the change. | ✅ PASS |

Implications documented for future users and support:
- New sign-ups and password changes are rejected when the chosen password appears in the HaveIBeenPwned corpus.
- Existing users are **not** force-reset; their current passwords remain valid until they choose to change them.
- Supabase returns the rejection through the standard `weak_password` error surface, already mapped in `src/lib/auth-errors.ts` to "Password too weak — Choose a stronger password (at least 8 characters). (weak_password)". No code change required.

## 4. Regression Checks

| # | Check | Evidence | Result |
|---|---|---|---|
| R-1 | Existing demo user `admin@demo.test` continues to authenticate with prior password `DemoPass123!` after enabling leaked password protection | Sign-in succeeds; session established; dashboard loads with org context. | ✅ PASS |
| R-2 | Existing demo user `member@demo.test` continues to authenticate with prior password `DemoPass123!` | Sign-in succeeds; session established. | ✅ PASS |
| R-3 | New sign-up with a strong non-breached password succeeds | Supabase `signUp` returns a user; profile + personal org auto-provisioned by trigger `fn_handle_new_auth_user`. | ✅ PASS |
| R-4 | New sign-up with a known-breached password (e.g. `password123`) is rejected with a `weak_password`-mapped toast | Supabase Auth returns weak-password error; `mapSupabaseAuthError` classifies as `weak_password`; toast reads "Password too weak … (weak_password)". | ✅ PASS |
| R-5 | Password reset flow (`/forgot-password` → email link → `/reset-password`) succeeds with a strong new password | `resetPasswordForEmail` → `updateUser({ password })` → redirect to `/login`; unchanged from Sprint 0.4A. | ✅ PASS |
| R-6 | Password reset with a breached password is rejected with the same `weak_password` mapping | `updateUser` returns weak-password error; UI shows mapped toast. | ✅ PASS |

## 5. Verification Summary

- **Total checks:** 10 (3 SECURITY DEFINER + 1 auth setting + 6 regression)
- **PASS:** 10
- **FAIL:** 0
- **Migrations applied this sprint:** 0
- **Code changes this sprint:** 0 (existing `weak_password` mapping already covers the new rejection path)

## 6. Exit Criteria

- [x] All three helper functions verified against the checklist and **Accepted by Design** with documented rationale.
- [x] Leaked Password Protection enabled in Supabase Auth.
- [x] Existing demo users continue to authenticate successfully after the setting change.
- [x] Sprint 0.4A observations are documented as **Accepted by Design** with supporting evidence; no new HIGH/CRITICAL findings introduced.
- [x] Verification report authored with all checks PASS.
- [x] Sprint 0.5 authorization recorded (§7).

## 7. Sprint 0.5 Authorization

All checks PASS. The `SECURITY DEFINER` helpers are reviewed and accepted; leaked-password protection is enabled; existing accounts are unaffected. **Sprint 0.5 — RBAC Foundation is authorized to begin.**
