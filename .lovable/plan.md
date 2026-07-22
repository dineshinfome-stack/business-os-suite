## Sprint 0.4A — Authentication Stabilization (v5)

### Root causes found

The "Something went wrong" error and org-context failures trace to two concrete bugs, not a broad auth regression:

1. **RLS helpers moved to `private` schema were never granted to `authenticated`.**
   `private.fn_has_role`, `private.fn_is_org_member`, `private.fn_org_role` are `SECURITY DEFINER`, but callers still need `USAGE` on the schema and `EXECUTE` on the functions. Every policy that calls them returns `42501 permission denied for function ...`. Observed in the network log on `user_roles` (403) and on `getOrgContext` / `listMyOrganizations` (org context never resolves, sidebar shows "No organization").

2. **`logAuthEventFn` uses `supabaseAdmin` but `SUPABASE_SERVICE_ROLE_KEY` is not set on this self-managed project.**
   Every `user_logged_in` / `user_logged_out` audit call throws `Missing Supabase environment variable(s): SUPABASE_SERVICE_ROLE_KEY`. Fire-and-forget swallows the throw, but it produces noise and drops the audit trail. Fix by writing through the user's own RLS-scoped client with a self-insert policy — no service role needed for own-actor audit rows.

Email/password login, password reset, session persistence, protected redirects, and the signup trigger themselves are structurally correct; they just look broken because org bootstrap can't read `organization_members`.

Google OAuth is out of scope; the button stays, no work is done on it.

---

### Changes

**Migration `007_auth_stabilization`** — fully idempotent so it is safe to re-apply against an already-correct database:
- `GRANT USAGE ON SCHEMA private TO authenticated` (idempotent).
- `GRANT EXECUTE` on `private.fn_has_role`, `private.fn_is_org_member`, `private.fn_org_role` to `authenticated` (idempotent).
- `DROP POLICY IF EXISTS audit_logs_insert_own ON public.audit_logs` then `CREATE POLICY audit_logs_insert_own FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id)`.
- **Idempotent backfill** for historical users:
  - `INSERT INTO public.profiles ... FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE p.id IS NULL` (never touches existing profile rows).
  - For each `auth.users` row that has zero `organization_members` records, insert exactly one personal organization + one `('owner','active')` membership. Skip users who already have any membership so re-runs never create duplicate orgs. Slug generation reuses the trigger's collision-safe pattern.
- Wrapped in a single transaction; safe to re-run after a database reset or on an already-correct database — no duplicate orgs, memberships, profiles, or policies are produced.

**Code — `src/lib/auth.functions.ts`**
- Rewrite `logAuthEventFn` to insert via `context.supabase` (RLS as user), removing the `supabaseAdmin` dynamic import. Actor / created_by / updated_by all set from `context.userId`.

**Code — `src/lib/auth-errors.ts` + `src/lib/auth-audit.ts`**
- Replace the generic "Something went wrong" fallback with specific, actionable messages per known Supabase auth error code (invalid credentials, email not confirmed, rate limited, network, unknown). Include a short error-code suffix in the toast description for support.
- Log the underlying error via `logger.error` with correlation id so failures are diagnosable even when the toast is generic.
- **Audit failure policy (explicit):** authentication succeeds even if audit logging fails. Audit failures are logged with correlation id for investigation but never block login, logout, or password flows. Codified as a comment in `auth-audit.ts` and restated in the verification report.

**Code — `src/contexts/org-context.tsx`**
- On `refresh()` failure, surface a one-time toast ("Couldn't load your workspace") rather than silently landing on `no-organizations`. Retry once on transient network errors.
- On `SIGNED_OUT` from the auth listener, clear `current`, `organizations`, and reset status to `loading` so a re-login starts from a clean org context instead of stale state.

**No changes** to login / reset / forgot routes, `_authenticated` gate, `AuthContext` session lifecycle, or migrations 001–006.

---

### Verification

Manual pass through the checklist against the running preview, capturing evidence for each in Check → Evidence → Result format:

Core auth flow:
- Sign up new user → profile + personal org + owner membership auto-created; lands on `/dashboard` with org name in header.
- Login with `admin@demo.test` / `member@demo.test` → no 403 on `user_roles`, org header populates, no console errors.
- Logout → toast "Signed out", redirected to `/login`, session cleared.
- Forgot password → reset email requested (or clear error if SMTP not configured).
- Reset password page updates password and redirects to login.
- Refresh browser on `/dashboard` → session persists, no flash to login.
- Visit `/dashboard` while signed out → redirected to `/login?redirect=/dashboard`; login returns to `/dashboard`.
- Trigger a bad password → specific "Invalid email or password" toast (not "Something went wrong").
- Audit rows appear in `public.audit_logs` for login/logout with correct `actor_id`.
- Simulated audit failure (temporarily revoke insert) → login/logout still succeed; failure logged with correlation id.

Multi-organization (Sprint 0.4 regression guard):
- Provision a second organization + membership for the admin demo user via a verification-only insert.
- Org switcher lists both orgs; selecting the second updates `current_org_id` cookie and re-renders header.
- Refreshing the page preserves the selected org (cookie precedence over first-membership fallback).
- Attempting to switch to a random UUID the user does not belong to is rejected by `setCurrentOrganization` (server-side membership check).

Session expiration:
- Force-expire the session (`supabase.auth.signOut({ scope: 'local' })` from devtools, or clear the session storage entry) while on `/dashboard`.
- Next protected fetch triggers redirect to `/login?redirect=/dashboard`; no infinite redirect loop; no stale org header remains after redirect.
- Re-login restores org context to the previously selected organization (cookie persistence path).
- Simulate an expired JWT by editing the stored `expires_at` to a past timestamp and reloading; app treats it as signed-out (via `onAuthStateChange` or the gate's `getSession`), redirects cleanly, and clears org context.

Concurrent sessions:
- Sign in as the same admin account in two browser windows, both landing on `/dashboard` with the same initial organization.
- Switch to the second organization in window A; confirm the `current_org_id` cookie updates and window A's header reflects the change.
- Reload window B and verify it picks up the new organization from the shared cookie — documenting the intended design: **org selection is cookie-scoped and shared across tabs of the same browser; independent across different browsers/devices.**
- Confirm no auth errors, no forced sign-out in window B, and no infinite refresh loop.

Rollback / recovery (new in v5):
- Re-apply migration `007` a second time against the already-correct database and confirm: no policy duplication error, no new organizations or memberships created, no new profile rows created (compare row counts before and after).
- Reset the database, re-run migrations 001–007 in order, and confirm the demo users end up with exactly one profile, one personal organization, and one owner membership each — same terminal state as an incremental application.

Report written to `docs/50-audit-reports/SPRINT_0_4A_AUTHENTICATION_STABILIZATION_REPORT.md` using the Check → Evidence → Result table format, plus a Verification Summary with the audit-failure policy, concurrent-session design note, and migration idempotency confirmation restated. Sprint 0.5 (RBAC) starts only after all rows PASS.
