# Sprint 0.3 — Authentication Platform (v8)

**Prerequisite:** Sprint 0.2 verified. Consumes `profiles`, `user_roles`, `fn_has_role`, and audit primitives. No tenant management, no business modules, no schema changes.

## Opening Tasks

1. Confirm Sprint 0.2 baseline green: `bun run build`, `bunx tsgo --noEmit`, `bun test`, `bun run lint`.
2. Re-read current auth surface: `src/routes/{login,forgot-password,reset-password,_authenticated,auth,__root}.tsx`, `src/integrations/supabase/{client,auth-middleware,auth-attacher}.ts`, `src/start.ts`, `src/components/layout/AppShell.tsx`.
3. **New governance artifact this sprint:** author `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md` (see §14) so later sprints inherit — rather than redefine — audit naming, correlation-id precedence, and verification-report structure.

## Scope

### 1. Provider Configuration
- `supabase--configure_auth`: email confirmation on, password reset on, anonymous off, HIBP on, signups enabled.
- `supabase--configure_social_auth` with `providers: ["google"]`; keep email enabled.

### 2. Session Management
- Single source of truth: `supabase.auth`.
- Google sign-in via `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth/callback" })`.
- JWT refresh **owned entirely by Supabase** (`autoRefreshToken: true`). Context never calls `refreshSession()`.
- Public `/auth/callback` waits for session hydration then navigates to sanitized `next`.

### 3. AuthProvider & Context (`src/contexts/auth-context.tsx`)
Mounted in `__root.tsx`. Exposes:
- State: `user`, `session`, `profile`, `roles: AppRole[]`, `loading`, `isAuthenticated`
- Authz: `hasRole(role)`, `hasAnyRole(...roles)`, `hasAllRoles(...roles)`
- Actions: `signInWithPassword`, `signInWithGoogle`, `signOut`, `refresh()`

**`refresh()` semantics:**
- Re-reads `profiles` + `user_roles`. Does not touch tokens.
- Concurrency deduplicated via module-scoped `inFlightRefresh: Promise | null`.
- Cancellation via `AbortController`, aborted on `SIGNED_OUT` / provider unmount; late results discarded when current user id no longer matches start-time user id.
- Failure preserves session and last-known-good `profile`/`roles`; `notify.error` only for user-initiated refreshes; sign-out only on Supabase-reported session-invalid errors.

**Role cache lifetime:** cached for session lifetime; refreshed on `SIGNED_IN`, `USER_UPDATED` (fingerprint change), or explicit `refresh()`. Admin role changes not guaranteed to surface until re-sign-in or `refresh()`.

Bootstrap:
- `supabase.auth.getSession()` → subscribe to `onAuthStateChange`.
- Handled events: `SIGNED_IN`, `SIGNED_OUT`, `USER_UPDATED`, `TOKEN_REFRESHED`.
- **Claims fingerprint (v1, extensible) — `src/lib/auth-fingerprint.ts`:**
  ```ts
  export function fingerprintClaims(session): string {
    const u = session?.user ?? {};
    const parts = [
      u.id ?? "",
      u.updated_at ?? "",
      JSON.stringify(u.app_metadata?.role ?? u.app_metadata?.roles ?? null),
    ];
    return parts.join("|");
  }
  ```
  - Plain string, PII-free, strict-equality comparison.
  - Future versions MAY append pipe-separated parts; never remove or reorder.
  - **Fingerprint source authority:** `app_metadata` role is a change-detection hint only. Authorization decisions read `user_roles` today and the Sprint-0.5 authorization endpoint tomorrow.
- **`TOKEN_REFRESHED` policy:** refetch profile/roles only when fingerprint changes.
- **Subscription cleanup:** `useEffect` returns cleanup calling `subscription.unsubscribe()`.
- On `SIGNED_OUT`: run sign-out sequence in §13.
- Single subscriber (consolidates existing root listener).

### 4. Route Protection
- `_authenticated.tsx` reads from AuthProvider once hydrated.
- `/login`, `/forgot-password`, `/reset-password` redirect to `/dashboard` when authenticated.
- AppShell renders session-aware sign-out via context.

### 5. Profile Synchronization
- DB trigger inserts empty `profiles` row on signup. On first `SIGNED_IN` after OAuth, if `display_name` or `avatar_url` is null, populate from `user.user_metadata`.
- Metadata mapping tolerant — try keys in order, skip missing/empty, never treat missing as error.
  - display_name: `full_name` → `name` → `preferred_username` → `email` local-part
  - avatar_url: `avatar_url` → `picture`
- Never overwrite non-null values.

### 6. Authentication Middleware
- Platform middleware = existing `requireSupabaseAuth`. Verify `src/start.ts` registers `attachSupabaseAuth`.
- Probe server fn `src/lib/auth.functions.ts` → `getAuthContext()`.

### 7. Authorization Integration
- Context reads `user_roles` under RLS (authoritative source for Sprint 0.3).
- Server-side helper calls `fn_has_role(auth.uid(), role)` via RPC.
- Forward-looking (Sprint 0.5): centralized server-side authorization endpoint replaces direct table reads.

### 8. Redirect Safety
`sanitizeNextPath(input): string` — accept only strings starting with `/` and NOT `//` or `/\\`; reject values containing `:` or cross-origin; default `/dashboard`.

### 9. Authentication Constants (`src/constants/auth.ts`)
Central home for **all** auth-related timing and thresholds (documented in file header):
- `AUTH_CALLBACK_HYDRATION_TIMEOUT_MS = 10_000`.

`/auth/callback` behavior:
- Wait for `SIGNED_IN` or hydrated `getSession()`.
- Timeout → redirect to `/login?error=oauth_timeout&next=<sanitized>` with mapped `notify.error`.
- Short-circuit on provider-returned `error` / `error_description` query params.

### 10. Audit Integration
- `src/lib/auth-audit.ts` → `logAuthEvent(action, { correlationId })` calling server fn `logAuthEventFn`.
- **Naming standard (past-tense, defined once in the governance doc, applied here):** `user_logged_in`, `user_logged_out`, `password_reset_requested`, `password_reset_completed`.
- Never store tokens or credentials.
- **Correlation IDs — `src/lib/correlation.ts` → `newCorrelationId(): string`, `getOrCreateCorrelationId(source?): string`:**
  - Generation: `crypto.randomUUID()` (RFC 4122 v4); monotonic-random-hex fallback where unavailable.
  - **Precedence (documented in the governance doc so all future services follow the same order):**
    1. **Inbound HTTP request id** — if a server request context exposes `x-request-id`, use it verbatim.
    2. **Ambient request-scoped store** — if a server-side async-local correlation id is already set for the current call chain, reuse it.
    3. **Caller-provided id** — if the invoking flow already generated one (e.g. the client passed it as an argument), reuse it.
    4. **Newly generated id** — call `newCorrelationId()` at the flow entry point.
  - Every `logger.warn` / `logger.error` emitted within an auth flow includes the flow's correlation id.
- Failure policy: fire-and-forget; caught rejection logged via `logger.warn` with correlation id. Auth flows never fail because audit failed.

### 11. Error Handling
- `src/lib/auth-errors.ts` maps Supabase error codes → user-facing messages via `notify.error`. Includes `oauth_timeout`, `signout_partial`.

### 12. UI
Additions only:
- Google button on `/login`.
- Email-verification-required notice on `/login`.
- New `/auth/callback` with spinner, awaited session, timeout, then `navigate({ to: sanitizeNextPath(next) })`.

### 13. Sign-Out Sequence (Cache Hygiene + Failure Semantics)

**Order (each step awaited):**
1. `await queryClient.cancelQueries()`
2. `queryClient.clear()`
3. `try { await supabase.auth.signOut() } catch { … }` — see failure policy
4. Clear local AuthProvider state; abort in-flight refresh
5. `navigate({ to: "/login", replace: true })` — history REPLACE

**Sign-out failure policy:** local cleanup always executes; `logger.warn` records failure with correlation id; `notify.error` surfaces `signout_partial`; no retry.

Module-scope memoized protected data must key by `user.id`.

### 14. Governance Artifact — `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md` (new)

Codifies conventions this sprint introduces so future sprints inherit them:

1. **Audit action naming convention.**
   - Past-tense verb form. Regex allow-list: `/^[a-z]+(?:_[a-z]+)*_(in|out|requested|completed|created|updated|deleted|failed|granted|revoked)$/`.
   - Baseline set from this sprint: `user_logged_in`, `user_logged_out`, `password_reset_requested`, `password_reset_completed`.
   - New actions in later sprints extend this set; **do not redefine** the convention.

2. **Correlation ID precedence** (mirrors §10 exactly).
   - Inbound `x-request-id` → ambient store → caller-provided → newly generated.

3. **Verification-report structure — canonical category taxonomy.** All future sprint verification reports use these category names in this order:
   - **A. Authentication** — provider/flow correctness for the sprint's domain.
   - **B. Session Lifecycle** — session, tokens, cache, cross-tab.
   - **C. Route Protection & Middleware** — gating, guards, server middleware.
   - **D. Authorization** — role and permission checks.
   - **E. Security** — secrets, redirects, linter, sanitizers.
   - **F. Audit** — event emission, correlation, non-blocking behavior.
   - **G. UX & Resilience** — timeouts, error surfacing, recovery paths.
   - **H. Toolchain & Scope Guard** — build/lint/tests, scope leakage `rg` scans.

   Sprints may omit categories that do not apply, but MUST NOT rename them or introduce parallel names. Checks within a category are numbered `<Letter><n>` (e.g. `A1`, `B3`) to stay comparable across sprints.

4. **Verification-report format.** `Check → Evidence → Result` table per category, plus a `Definition of Done` block referencing the sprint's category counts.

## Migrations
None.

## Out of Scope
Organizations, companies, branches, tenants, permission engine, business modules, storage, AI, invites, MFA, API keys, SSO beyond Google.

## Verification

`docs/50-audit-reports/SPRINT_0_3_VERIFICATION_REPORT.md` in the canonical structure above.

**A. Authentication** — 5 checks
- A1. Email/password sign-in works.
- A2. Google OAuth sign-in works.
- A3. Email verification flow works; unconfirmed users cannot reach `/dashboard`.
- A4. Password reset request + completion works.
- A5. OAuth metadata mapping tolerates missing fields.

**B. Session Lifecycle** — 6 checks
- B1. Session persists across full browser reload.
- B2. Silent JWT refresh owned by Supabase; context never calls `refreshSession()`.
- B3. `TOKEN_REFRESHED` no-op when fingerprint unchanged.
- B4. Multi-tab consistency for sign-in and sign-out.
- B5. Concurrent `refresh()` calls resolve from a single in-flight request.
- B6. Refresh cancellation on sign-out — late results not written.

**C. Route Protection & Middleware** — 4 checks
- C1. Unauthenticated access to protected routes redirects to `/login`.
- C2. Authenticated users cannot reach `/login`, `/forgot-password`, `/reset-password`.
- C3. `requireSupabaseAuth` validates JWT and populates context.
- C4. Back-button after logout does not expose protected content.

**D. Authorization** — 3 checks
- D1. Context loads current `profile` and `roles`.
- D2. `hasRole`, `hasAnyRole`, `hasAllRoles` correct.
- D3. `fn_has_role` integrates via RPC.

**E. Security** — 5 checks
- E1. No service-role credentials in client bundle (`rg` scan).
- E2. `sanitizeNextPath` rejects `//evil.com`, `https://evil.com`, `/\\evil.com`; accepts `/dashboard`, `/settings`.
- E3. Fingerprint source: `app_metadata` role used only for change detection; no auth decision reads it.
- E4. Fingerprint determinism + append-only extensibility unit test.
- E5. Supabase linter clean (or only accepted `fn_has_role` WARN).

**F. Audit** — 3 checks
- F1. Past-tense action names match the governance regex allow-list.
- F2. Audit-write failure does not break sign-in / sign-out.
- F3. Correlation id follows precedence order and appears on every audit event and warn/error log within a flow.

**G. UX & Resilience** — 4 checks
- G1. `/auth/callback` timeout → `/login?error=oauth_timeout` within ~10 s.
- G2. Refresh failure preserves session and last-known-good `profile`/`roles`.
- G3. Sign-out failure — local cleanup + `signout_partial`, no retry.
- G4. Subscription cleanup calls `unsubscribe()` exactly once on unmount/HMR.

**H. Toolchain & Scope Guard** — 4 checks
- H1. `bun run build` green.
- H2. `bunx tsgo --noEmit` green.
- H3. `bun run lint` green.
- H4. `bun test` green; scope guard `rg` for tenant/organization/company in `src/` → 0 hits.

Total: **34 checks across 8 canonical categories** (identical to v7; naming now anchored in the governance doc so later sprints reuse the same taxonomy verbatim).

## Deliverables
- New app files: `src/contexts/auth-context.tsx`, `src/routes/auth.callback.tsx`, `src/lib/auth.functions.ts`, `src/lib/auth-audit.ts`, `src/lib/auth-errors.ts`, `src/lib/sanitize-next-path.ts`, `src/lib/auth-fingerprint.ts`, `src/lib/correlation.ts`, `src/constants/auth.ts`.
- Edits: `src/routes/__root.tsx`, `src/routes/_authenticated.tsx`, `src/routes/login.tsx`, `src/routes/forgot-password.tsx`, `src/routes/reset-password.tsx`, `src/components/layout/AppShell.tsx`.
- Config: `supabase--configure_auth`, `supabase--configure_social_auth`.
- New governance: `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md`.
- `docs/50-audit-reports/SPRINT_0_3_VERIFICATION_REPORT.md`.

## Definition of Done
Auth operational end-to-end; all 34 checks (A1–H4) pass; build/lint/tests green; no scope violations; governance doc ratified; repository status advances to **`SPRINT_0_3_AUTHENTICATION_PLATFORM_VERIFIED`**.
