## Context

Verified: the app has **no** `supabase.rpc('fn_has_role', ...)` call anywhere in `src/`. Authorization is exercised only inside RLS policies (e.g. `user_roles_admin_all`, `audit_logs_admin_select_all`), which call `private.fn_has_role(auth.uid(), 'admin'::app_role)` server-side. This is **Design A** — moving the helper to `private` with `EXECUTE` revoked from `anon`/`authenticated` is correct and does not break anything.

Only documentation drifts from reality. This plan realigns the specs — no source or database changes.

## Changes

1. **`docs/15-governance/DATABASE_STANDARD.md`**
   - Update the two `fn_has_role` references to `private.fn_has_role` and add a short note: role-check helpers live in the non-exposed `private` schema, are invoked from RLS policies only, and are not RPC-callable.

2. **`.lovable/plan.md` (Sprint 0.3 spec)**
   - Replace any "server-side helper calls `fn_has_role` via RPC" wording with: "authorization is enforced by RLS policies invoking `private.fn_has_role(auth.uid(), role)`; no client- or RPC-accessible role helper is exposed."
   - Update the Sprint 0.2 schema-presence check list to look for `private.fn_has_role` (and `private.fn_handle_new_auth_user`) instead of the `public` variants.

3. **New: `docs/50-audit-reports/SPRINT_0_3_SPEC_ALIGNMENT_NOTE.md`** — contains two sections:

   **a) Alignment record**
   - Finding IDs fixed: `SUPA_anon_security_definer_function_executable`, `SUPA_authenticated_security_definer_function_executable`.
   - Design A confirmation (grep evidence: 0 `rpc(` calls, 0 `fn_has_role` usages in `src/`).
   - Doc edits above.

   **b) Architecture Decision Record (embedded ADR)**
   - **Decision:** Internal authorization helpers are not part of the application API surface. `fn_has_role` and `fn_handle_new_auth_user` live in the `private` schema; `EXECUTE` is revoked from `anon` and `authenticated`; they are invoked exclusively by RLS policies and auth triggers.
   - **Context:** New Supabase project reconnect surfaced two security-definer-executable findings on the previous `public.fn_has_role` / `public.fn_handle_new_auth_user`.
   - **Rationale:** Authorization is enforced exclusively by PostgreSQL RLS. Restricting helper functions to `private` with revoked EXECUTE minimizes the exposed database API, reduces attack surface, prevents accidental client invocation, and keeps the security boundary owned by the database rather than the client.
   - **Security Impact:** The exposed SQL API surface is reduced by removing publicly executable authorization helpers. Authorization decisions remain entirely within PostgreSQL RLS, reducing the risk of accidental or unauthorized invocation and simplifying the application's trust boundary. PostgREST cannot enumerate or invoke `private.*` functions, so the role-check helper is unreachable from any client credential (anon or authenticated).
   - **Consequences:** No client- or RPC-accessible role helper exists. Any future need for a client-visible role check must be introduced deliberately as a new, narrowly-scoped `public.*` function — not by relaxing `private.fn_has_role`.
   - **Alternatives considered:** Keep `public.fn_has_role` with `EXECUTE` to `authenticated` (standard Supabase pattern) — rejected because no caller needs it and it enlarges the API surface unnecessarily.
   - **Status:** Accepted. Supersedes the Sprint 0.3 assumption of an RPC-accessible helper.

## Out of scope

- No changes to `src/`, migrations, RLS policies, or grants.
- No new migrations. The current `private.fn_has_role` + revoked EXECUTE stands.

## Verification

- `rg "fn_has_role" src/` → 0 hits (already confirmed).
- `rg "public\.fn_has_role|rpc\(['\"]fn_has_role" docs/ src/ supabase/` → 0 hits after edits (expanded to include `supabase/` for migrations and SQL files).
- Build/typecheck unchanged (no code touched).
