## Sprint 0.3.V — Supabase Project Connection Verification (Read-Only)

Read-only verification of the newly connected Supabase project. No code, DB, auth, or config changes. Single deliverable: an audit report with Check → Evidence → Result tables and Sprint 0.2 / Sprint 0.3 readiness verdicts.

### Critical issue to resolve first
Two different Supabase project refs are visible:
- `.env` + `supabase/config.toml` → `bnntgsjyumxxgaxapzhe`
- Lovable's active backend binding (per tool context) → `fplgjhbngvzfpepstvry`

Treated as a **BLOCKER** unless verification proves they resolve to the same backend. A mismatch means the app builds against one project while auth, RLS, and migrations are managed on another.

### Verification sections (each row: Check | Evidence | Result)

1. **Environment variables** — inspect `.env`, `.env.local`, `.env.example`. Verify `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, plus server-side `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`. Record presence, placeholders, project ref pointed at, and any service-role leakage into `VITE_*`.
2. **Client initialization** — inspect `src/integrations/supabase/client.ts`, `client.server.ts`, `auth-middleware.ts`, `auth-attacher.ts`. Verify env plumbing, no hardcoded credentials, no stale refs, client/server separation intact.
3. **Active backend binding** — compare `.env` ref, `supabase/config.toml` ref, and Lovable-reported active ref. Record match/mismatch and blocker status.
4. **Auth configuration** — read-only probe of `auth.*` where possible: email auth enabled, signups enabled, email confirmation, password reset, anonymous disabled. Settings not queryable read-only recorded as `MANUAL-VERIFY` with the exact dashboard path.
5. **Google OAuth** — inspect `src/routes/login.tsx` and `src/integrations/lovable/index.ts`. Record whether Google is wired in code; provider-side config marked `CONFIGURED` / `NOT CONFIGURED (acceptable)` / `MANUAL-VERIFY`. Note that redirect URIs must match scheme + domain + path + trailing slash exactly.
6. **Redirect URLs** — enumerate callback routes (`/auth/callback`, reset flows). Record expected Site URL + redirect allowlist entries; provider-side allowlist marked `MANUAL-VERIFY` where not observable.
7. **Schema presence** — read-only queries for `profiles`, `user_roles`, `audit_logs`, `app_role`, `fn_has_role`, `fn_set_updated_at`, `fn_handle_new_auth_user`. Missing objects flip Sprint 0.2 readiness to `NOT READY`.
8. **Connectivity probe** — anon-key path reaches the backend without writes.
9. **Repository scan** — `rg` for `lovable`, `lovable.dev`, old project refs, old backend refs. Distinguish framework refs (`@lovable.dev/cloud-auth-js`, `lovable-error-reporting.ts`) from stale backend refs.
10. **Security** — service-role key server-only; no `VITE_*SERVICE_ROLE*`; no client-reachable import of `client.server`; `.env` gitignored; no secrets committed.
11. **Readiness verdicts** — separate verdicts for Sprint 0.2 and Sprint 0.3, each `READY` / `READY WITH OBSERVATIONS` / `NOT READY` with reasons; blocker status stated if project-ref mismatch remains.

### Constraints
Read-only. No migrations, no auth setting changes, no code edits, no governance changes. Any item not observable read-only is recorded as `MANUAL-VERIFY` with the exact dashboard path, not skipped.

### Definition of Done
- Report at `docs/50-audit-reports/SUPABASE_PROJECT_CONNECTION_VERIFICATION_REPORT.md` with completed Check → Evidence → Result tables for every section.
- Project-ref discrepancy explicitly resolved or flagged as a blocker.
- Sprint 0.2 and Sprint 0.3 readiness verdicts stated with justification.
- Copy placed at `/mnt/documents/` for download.