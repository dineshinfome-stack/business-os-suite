# Sprint 0.3.V — Supabase Project Connection Verification Report

- **Date (UTC):** 2026-07-22
- **Mode:** Read-only. No code, database, auth, or config changes.
- **Connected Supabase project ref:** `fplgjhbngvzfpepstvry`
- **Prior (pre-reconnect) project ref, per earlier session context:** `bnntgsjyumxxgaxapzhe`
- **Report path:** `docs/50-audit-reports/SUPABASE_PROJECT_CONNECTION_VERIFICATION_REPORT.md`

---

## 0. Executive Summary

The project-ref mismatch flagged in the plan is **RESOLVED** — on inspection, `.env`, `supabase/config.toml`, and the regenerated Supabase client all point to `fplgjhbngvzfpepstvry`. The earlier context reference to `bnntgsjyumxxgaxapzhe` was stale (pre-reconnect).

However, the reconnect introduced two independent issues:

1. **BLOCKER — Sprint 0.2 schema is absent on the new project.** The `public` schema contains only the auto-generated `rls_auto_enable` event trigger. `profiles`, `user_roles`, `audit_logs`, the `app_role` enum, and all Sprint 0.2 helper functions do not exist. The app will fail at auth (profile/role load) and audit writes until Sprint 0.2 migrations are re-applied.
2. **MAJOR — `src/integrations/supabase/client.ts` was regenerated to a legacy template** that hardcodes URL + anon key, drops the env-var read path, drops the `sb_publishable_*`/`sb_secret_*` opaque-key fetch handler, and drops the SSR fallback. It still functions with a JWT-format anon key (which this project uses), so it is not a runtime break today, but it is a regression from the Sprint 0.1 client and inconsistent with `client.server.ts` and `auth-middleware.ts`, which retain the new-key handling.

Additional **MINOR** finding: `.env` is not listed in `.gitignore` (only `*.local` is). The current `.env` holds the anon key (safe to commit) and does **not** hold the service-role key, so this is not a leak today, but the pattern will leak the moment a service-role or other secret is placed in `.env`.

**Sprint 0.2 readiness:** `NOT READY` — schema absent.
**Sprint 0.3 readiness:** `NOT READY` — depends on Sprint 0.2 tables (`profiles`, `user_roles`, `audit_logs`); auth-context and audit paths will error at first login.

---

## 1. Environment Variables

| Check | Evidence | Result |
|---|---|---|
| `.env` exists | `ls .env` → present (685 B) | PASS |
| `.env.local` / `.env.example` present | `ls -la .env*` shows only `.env` | N/A (single file used) |
| `VITE_SUPABASE_URL` set to connected project | `VITE_SUPABASE_URL="https://fplgjhbngvzfpepstvry.supabase.co"` | PASS |
| `VITE_SUPABASE_PUBLISHABLE_KEY` set | JWT anon key with `"ref":"fplgjhbngvzfpepstvry"` payload | PASS |
| `VITE_SUPABASE_PROJECT_ID` set | `"fplgjhbngvzfpepstvry"` | PASS |
| Server-side `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` set | Both present in `.env`, both point at `fplgjhbngvzfpepstvry` | PASS |
| `SUPABASE_SERVICE_ROLE_KEY` present in `.env` | Not in `.env`. Injected at runtime via secrets store (see §10) | PASS |
| No placeholder values | All values are real project URLs/keys | PASS |
| No service-role key exposed via `VITE_*` | `rg "VITE_.*SERVICE_ROLE" src/` → 0 matches; `.env` has no such var | PASS |
| No duplicate/deprecated variable names | Only the six expected vars present | PASS |

---

## 2. Client Initialization

| Check | Evidence | Result |
|---|---|---|
| Browser client file exists | `src/integrations/supabase/client.ts` present | PASS |
| Browser client uses env plumbing | `client.ts` **hardcodes** URL and anon key as string literals; does not read `import.meta.env.VITE_*` | **FAIL (regression)** |
| Browser client supports opaque `sb_publishable_*` keys | `client.ts` no longer contains `createSupabaseFetch` / `isNewSupabaseApiKey`; ships bare `createClient` | **FAIL (regression)** — safe today because the connected project issued a JWT anon key, not an opaque `sb_publishable_*` key |
| Server admin client (`client.server.ts`) | Reads `process.env.SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; retains opaque-key `Authorization`-strip fetch; lazy Proxy init | PASS |
| Auth middleware (`auth-middleware.ts`) | Reads `process.env.SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY`; validates Bearer JWT via `auth.getClaims`; per-request client | PASS |
| Auth attacher (`auth-attacher.ts`) | Client middleware attaches `Authorization: Bearer <access_token>` from `supabase.auth.getSession()` | PASS |
| Client/server separation intact | `client.server.ts` only imported through `await import(...)` inside handlers (`src/lib/auth.functions.ts` line 49); no client-reachable static import | PASS |
| No hardcoded credentials in application source (outside the generated `client.ts`) | `rg "eyJ|sb_(publishable\|secret)_" src/` — matches only in `src/integrations/supabase/client.ts` (the regenerated file) | OBSERVATION — anon key is public by design; still, hardcoding blocks env-based rotation |

**Note:** the regressed `client.ts` diverges from the Sprint 0.1 version documented in the codebase context. If the project later switches to an opaque `sb_publishable_*` anon key, PostgREST will reject requests with `Expected 3 parts in JWT; got 1` until the file is regenerated with the new-key fetch handler.

---

## 3. Active Backend Binding

| Check | Evidence | Result |
|---|---|---|
| `.env` project ref | `SUPABASE_PROJECT_ID="fplgjhbngvzfpepstvry"` | — |
| `supabase/config.toml` project ref | `project_id = "fplgjhbngvzfpepstvry"` | — |
| Lovable-reported active binding | Read-only DB tool (`supabase--read_query`) reached a Postgres 17.6 instance and executed a `current_database()` probe; the tool is bound to `fplgjhbngvzfpepstvry` in this session | — |
| Hardcoded URL in `client.ts` project ref | `"https://fplgjhbngvzfpepstvry.supabase.co"` | — |
| Refs consistent | All four sources agree on `fplgjhbngvzfpepstvry` | **PASS — mismatch RESOLVED, no blocker** |
| No stale reference to prior ref `bnntgsjyumxxgaxapzhe` | `rg "bnntgsjyumxxgaxapzhe"` → 0 matches | PASS |

---

## 4. Auth Configuration

`auth.config` and provider toggles are not fully readable via SQL. Where a value is observable it is recorded; where it is not, it is marked `MANUAL-VERIFY` with the exact dashboard path.

| Check | Evidence | Result |
|---|---|---|
| Email provider enabled | Not queryable read-only | MANUAL-VERIFY → Supabase Dashboard → Authentication → Providers → Email |
| Signups enabled | Not queryable read-only | MANUAL-VERIFY → Authentication → Providers → Email → "Enable Sign-ups" |
| Email confirmation required | Not queryable read-only | MANUAL-VERIFY → Authentication → Providers → Email → "Confirm email" |
| Password reset flow available | Application wires `supabase.auth.resetPasswordForEmail` in `src/routes/forgot-password.tsx`; provider-side template active | MANUAL-VERIFY → Authentication → Email Templates → "Reset Password" |
| Anonymous auth disabled | Not queryable read-only | MANUAL-VERIFY → Authentication → Providers → Anonymous Sign-Ins |
| Existing `auth.users` count | `SELECT count(*) FROM auth.users` → **0** | OBSERVATION — no users on the new project |
| Existing identity providers linked to users | `SELECT DISTINCT provider FROM auth.identities` → NULL (no rows) | OBSERVATION — clean slate |

---

## 5. Google OAuth

| Check | Evidence | Result |
|---|---|---|
| Google sign-in wired in code | `src/routes/login.tsx` line 82 renders "Continue with Google" and calls `lovable.auth.signInWithOAuth("google", { redirect_uri })` | PASS |
| OAuth broker present | `src/integrations/lovable/index.ts` wraps `@lovable.dev/cloud-auth-js` → `supabase.auth.setSession(result.tokens)` | PASS |
| `redirect_uri` construction is same-origin | `` `${window.location.origin}/auth/callback?next=${...}` `` — public route, not gated | PASS |
| Provider-side Google client configured | Not observable read-only | MANUAL-VERIFY → Authentication → Providers → Google (Client ID + Client Secret). Acceptable to remain `NOT CONFIGURED` if Google sign-in is deferred; the button will error until configured. |
| Google authorized redirect URIs include Supabase callback | Google Cloud console — not observable from repo | MANUAL-VERIFY → `https://fplgjhbngvzfpepstvry.supabase.co/auth/v1/callback` must be listed in the Google OAuth client's "Authorized redirect URIs" (scheme + domain + path exact match) |

---

## 6. Redirect URLs

Application-observable callback routes:

- `/auth/callback` — OAuth landing (`src/routes/auth.callback.tsx`)
- `/reset-password` — password-reset landing (`src/routes/reset-password.tsx`)
- `/forgot-password` — password-reset request (`src/routes/forgot-password.tsx`)
- `/login` — post-auth destination when signed-in user hits `/login` (via `beforeLoad`)

| Check | Evidence | Result |
|---|---|---|
| Application callback routes present | `ls src/routes/` shows `auth.callback.tsx`, `forgot-password.tsx`, `reset-password.tsx` | PASS |
| `Site URL` configured on the Supabase project | Not observable read-only | MANUAL-VERIFY → Authentication → URL Configuration → "Site URL" set to the published Lovable URL (e.g. `https://id-preview--4a3d10fa-b503-47e6-b169-42e0c586ca99.lovable.app` for preview, plus the published domain when live) |
| Redirect URL allowlist entries | Not observable read-only | MANUAL-VERIFY → Authentication → URL Configuration → "Redirect URLs" must include, at minimum: `http://localhost:8080/**`, `https://id-preview--4a3d10fa-b503-47e6-b169-42e0c586ca99.lovable.app/**`, and the published domain `/**`. Scheme + domain + path + trailing-slash must match exactly. |
| Password-reset redirect target valid | `forgot-password.tsx` uses `redirectTo: ${origin}/reset-password` (per Sprint 0.3 spec) | PASS (code); MANUAL-VERIFY that `/reset-password` origin is on the Supabase allowlist |

---

## 7. Schema Presence (Sprint 0.2 Objects)

Read-only query:

```sql
SELECT (SELECT string_agg(table_name, ',') FROM information_schema.tables WHERE table_schema='public') AS public_tables,
       (SELECT string_agg(routine_name, ',') FROM information_schema.routines WHERE routine_schema='public') AS public_routines,
       (SELECT string_agg(typname, ',') FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND typtype='e') AS public_enums;
```

Result:

```
public_tables   = NULL
public_routines = rls_auto_enable
public_enums    = NULL
```

| Check | Evidence | Result |
|---|---|---|
| Table `public.profiles` exists | Not in `information_schema.tables` | **FAIL** |
| Table `public.user_roles` exists | Not in `information_schema.tables` | **FAIL** |
| Table `public.audit_logs` exists | Not in `information_schema.tables` | **FAIL** |
| Enum `public.app_role` exists | Not in `pg_type` | **FAIL** |
| Function `public.fn_has_role` exists | Not in `information_schema.routines` | **FAIL** |
| Function `public.fn_set_updated_at` exists | Not in `information_schema.routines` | **FAIL** |
| Function `public.fn_handle_new_auth_user` exists | Not in `information_schema.routines` | **FAIL** |
| Only object present | `public.rls_auto_enable` (project-level RLS-auto-enable event trigger, unrelated to Sprint 0.2) | OBSERVATION |

**Conclusion:** the Sprint 0.2 migration set (`001_extensions` through `005_audit_logs`) has not been applied to the newly connected project. This is expected on a fresh Supabase project but must be resolved before Sprint 0.2 or Sprint 0.3 can be marked complete.

---

## 8. Connectivity Probe

| Check | Evidence | Result |
|---|---|---|
| PostgREST/DB reachable | `supabase--read_query` returned Postgres 17.6 + `current_database=postgres` | PASS |
| No writes performed | Only `SELECT` statements executed | PASS |
| Anon-key path exercised end-to-end | Not exercised (would require a public `TO anon` policy on a table; no public tables exist yet) | DEFERRED — retry after Sprint 0.2 migrations land |

---

## 9. Repository Scan

Search: `rg -n "bnntgsjyumxxgaxapzhe|fplgjhbngvzfpepstvry" . -g '!node_modules' -g '!*.gen.ts'`

| Check | Evidence | Result |
|---|---|---|
| References to prior project ref `bnntgsjyumxxgaxapzhe` | 0 matches | PASS |
| References to new project ref `fplgjhbngvzfpepstvry` | `supabase/config.toml:1`, `src/integrations/supabase/client.ts:5` (both expected) | PASS |
| Framework `lovable` references distinguished from backend refs | `@lovable.dev/cloud-auth-js` import in `src/integrations/lovable/index.ts`; `src/lib/lovable-error-reporting.ts`; `import.meta.env.VITE_APP_NAME` fallback "Business OS"; TanStack Vite config `@lovable.dev/vite-tanstack-config` — all framework, not backend | PASS |

---

## 10. Security

| Check | Evidence | Result |
|---|---|---|
| Service-role key not in browser bundle | No `VITE_*SERVICE_ROLE*` in `.env`; only `client.server.ts` reads `SUPABASE_SERVICE_ROLE_KEY` from `process.env`; not present in `.env` (injected at runtime via Lovable secrets store per session context) | PASS |
| No client-reachable static import of `client.server` | `rg "from ['\"].*/supabase/client.server"` — only `src/lib/auth.functions.ts:49` uses `await import(...)` inside a `.handler()`; `src/integrations/supabase/client.server.ts` is the only definition | PASS |
| `.env` gitignored | `.gitignore` does **not** list `.env` (only `*.local`) | **FAIL — MINOR** — no leak today (only anon key present), but any future secret placed in `.env` will be committed |
| No hardcoded secret credentials committed | `client.ts` hardcodes the anon JWT (public by design); no service-role or third-party secret found in source | PASS |
| Redirect helper prevents open-redirect abuse | `src/lib/sanitize-next-path.ts` present and used by `login.tsx` | PASS |

**Recommended remediation for the `.env` gitignore gap** (out of scope for this read-only pass): add `.env` to `.gitignore` and rely on `.env.example` for shape. Anon-key `.env` files are conventionally committed on Lovable projects because the anon key is a public identifier — proceed only if that is the team's explicit policy.

---

## 11. Readiness Verdicts

### Sprint 0.2 — Database Foundation
**Verdict: `NOT READY`**

- §7 confirms the entire Sprint 0.2 schema is absent on the connected project. Migrations `001_extensions`, `002_shared_helpers`, `003_profiles`, `003a`, `004_roles`, `004a`, and `005_audit_logs` must be re-applied.
- Additional prerequisites once schema lands: re-verify Sprint 0.2 checks 1–17 against the new project.

### Sprint 0.3 — Authentication Platform
**Verdict: `NOT READY` (blocked by Sprint 0.2)**

- Auth code (`src/contexts/auth-context.tsx`, `src/lib/auth.functions.ts`) reads from `public.profiles` and `public.user_roles` and writes to `public.audit_logs`. With those tables absent (§7), the first successful sign-in will surface Postgres "relation does not exist" errors on the profile/role load path and the audit insert.
- Provider-side items (Google OAuth, Site URL, redirect allowlist) remain `MANUAL-VERIFY` per §4–§6.
- The `src/integrations/supabase/client.ts` regression (§2) is a code-quality issue, not a blocker for JWT-format anon keys, but should be re-generated to the Sprint 0.1 shape before Sprint 0.3 is re-verified so the client is future-proof against opaque `sb_publishable_*` rotations.

---

## 12. Verification Summary

| Category | PASS | FAIL | MANUAL-VERIFY | DEFERRED | Total |
|---|---|---|---|---|---|
| 1. Environment Variables | 10 | 0 | 0 | 0 | 10 |
| 2. Client Initialization | 5 | 2 | 0 | 0 | 8 (+1 OBSERVATION) |
| 3. Active Backend Binding | 6 | 0 | 0 | 0 | 6 |
| 4. Auth Configuration | 0 | 0 | 5 | 0 | 5 (+2 OBSERVATIONS) |
| 5. Google OAuth | 3 | 0 | 2 | 0 | 5 |
| 6. Redirect URLs | 2 | 0 | 2 | 0 | 4 |
| 7. Schema Presence | 0 | 7 | 0 | 0 | 7 (+1 OBSERVATION) |
| 8. Connectivity Probe | 2 | 0 | 0 | 1 | 3 |
| 9. Repository Scan | 3 | 0 | 0 | 0 | 3 |
| 10. Security | 4 | 1 | 0 | 0 | 5 |
| **Totals** | **35** | **10** | **9** | **1** | **55** |

**Blockers:** 7 (all in §7, schema absent) + 2 code regressions in §2 (client hardcoded, opaque-key handler dropped) + 1 gitignore gap in §10 = **10 items requiring action before Sprint 0.2/0.3 re-verification passes.**

**Project-ref mismatch flagged in the plan:** RESOLVED (no blocker).

---

## 13. Recommended Next Actions (advisory, not executed in this read-only pass)

1. Re-apply Sprint 0.2 migrations to `fplgjhbngvzfpepstvry` in order: `001` → `002` → `003` → `003a` → `004` → `004a` → `005`.
2. Regenerate `src/integrations/supabase/client.ts` to the Sprint 0.1 shape (env-based, `createSupabaseFetch`, `isNewSupabaseApiKey` handling, lazy Proxy init) — matches `client.server.ts` and future-proofs against `sb_publishable_*` rotation.
3. Add `.env` to `.gitignore` (or explicitly document the anon-key-only commit policy) and add `.env.example` with placeholder values.
4. Configure Supabase URL configuration: Site URL + Redirect URLs allowlist per §6.
5. If Google sign-in is not deferred: configure Google provider (Client ID + Secret) and register `https://fplgjhbngvzfpepstvry.supabase.co/auth/v1/callback` on the Google OAuth client.
6. Re-run Sprint 0.2 verification (17/17 checks) and Sprint 0.3 verification (34-check suite from Sprint 0.3 v8) after the above land.

---

**End of report.**
