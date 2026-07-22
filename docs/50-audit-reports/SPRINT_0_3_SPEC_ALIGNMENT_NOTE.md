---
title: "Sprint 0.3 — Spec Alignment Note (private.fn_has_role)"
summary: "Aligns Sprint 0.3 authorization spec with the implemented Design A (RLS-only, private schema helpers). Records the embedded ADR."
layer: "audit"
status: "accepted"
updated: "2026-07-22"
tags: ["audit", "sprint-0-3", "authorization", "adr", "security"]
document_type: "Spec Alignment Note"
---

# Sprint 0.3 — Spec Alignment Note

## a) Alignment record

**Security findings resolved**

- `SUPA_anon_security_definer_function_executable`
- `SUPA_authenticated_security_definer_function_executable`

Both were resolved by moving `fn_has_role` and `fn_handle_new_auth_user` into the non-exposed `private` schema and revoking `EXECUTE` from `anon` and `authenticated`. RLS policies (`user_roles_admin_all`, `audit_logs_admin_select_all`, etc.) now reference `private.fn_has_role(auth.uid(), ...)` directly.

**Design A confirmation (evidence)**

- `rg "fn_has_role" src/` → 0 hits.
- `rg "rpc\(" src/` → 0 hits invoking `fn_has_role`.
- No application code path depends on a client- or RPC-accessible role helper.

**Documentation edits**

- `docs/15-governance/DATABASE_STANDARD.md` — updated the two `fn_has_role` references to `private.fn_has_role` and added a security note stating role-check helpers live in `private`, are RLS-only, and are not RPC-callable.
- Any prior Sprint 0.3 wording implying "server-side helper calls `fn_has_role` via RPC" is superseded by: *authorization is enforced by RLS policies invoking `private.fn_has_role(auth.uid(), role)`; no client- or RPC-accessible role helper is exposed*. Sprint 0.2 schema-presence checks look for `private.fn_has_role` and `private.fn_handle_new_auth_user`.

## b) Architecture Decision Record (embedded)

**Decision.** Internal authorization helpers are not part of the application API surface. `fn_has_role` and `fn_handle_new_auth_user` live in the `private` schema; `EXECUTE` is revoked from `anon` and `authenticated`; they are invoked exclusively by RLS policies and auth triggers.

**Context.** The new Supabase project reconnect surfaced two security-definer-executable findings against the previous `public.fn_has_role` / `public.fn_handle_new_auth_user`. Sprint 0.3's original wording assumed an RPC-accessible helper, but no such call exists in `src/`.

**Rationale.** Authorization is enforced exclusively by PostgreSQL RLS. Restricting helper functions to `private` with revoked `EXECUTE` minimizes the exposed database API, reduces attack surface, prevents accidental client invocation, and keeps the security boundary owned by the database rather than the client.

**Security Impact.** The exposed SQL API surface is reduced by removing publicly executable authorization helpers. Authorization decisions remain entirely within PostgreSQL RLS, reducing the risk of accidental or unauthorized invocation and simplifying the application's trust boundary. In the current repository architecture, the application's PostgREST API does not expose the `private` schema, and `EXECUTE` privileges on `private.fn_has_role` and `private.fn_handle_new_auth_user` are revoked from the `anon` and `authenticated` roles. As implemented, these helper functions are not invocable through client credentials or the application's public Data API. Any future decision to expose authorization functionality must be implemented explicitly through a new, narrowly scoped `public.*` function with its own security review; it must not be achieved by relaxing the visibility or privileges of the internal helpers.

**Consequences.** No client- or RPC-accessible role helper exists. Any future need for a client-visible role check must be introduced deliberately as a new, narrowly-scoped `public.*` function — not by relaxing `private.fn_has_role`.

**Alternatives considered.** Keep `public.fn_has_role` with `EXECUTE` to `authenticated` (a common Supabase pattern). Rejected: no caller needs it, and it enlarges the API surface unnecessarily.

**Status.** Accepted. Supersedes the Sprint 0.3 assumption of an RPC-accessible helper.
