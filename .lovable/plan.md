# Security Hardening — Resolve SECURITY DEFINER Linter Warnings

Scope: database only. No changes to business logic, RBAC model, tenancy, UI, or API contracts. Leaked Password Protection remains a separately-tracked Accepted Risk (R-074) and is out of scope.

## Phase 1 — Inventory (already gathered)

13 SECURITY DEFINER functions exist. All hardened helpers already live in `private` (not exposed via PostgREST). Only one lives in `public`:

| Schema | Function | Purpose | search_path | Notes |
|---|---|---|---|---|
| public | `rls_auto_enable()` returns event_trigger | Auto-enables RLS on newly created public tables via DDL event trigger | `pg_catalog` | Event triggers are fired by Postgres, never invoked by clients. EXECUTE granted to PUBLIC, anon, authenticated, service_role — source of both linter warnings. |
| private | `fn_handle_new_auth_user` | Auth signup trigger → profile | `public` | Trigger only. |
| private | `fn_block_setting_definition_identity_change` | Trigger guard | `pg_catalog, public` | Trigger only. |
| private | `fn_block_system_row_mutation` | Trigger guard | `pg_catalog, public` | Trigger only. |
| private | `fn_bootstrap_platform_owner(text)` | One-time seed | `pg_catalog, public` | Granted to service_role. |
| private | `fn_has_role`, `fn_is_org_member`, `fn_org_role` | RLS helpers (tenancy/RBAC) | `public` | Called from RLS policies; MUST stay SECURITY DEFINER to avoid RLS recursion. |
| private | `fn_user_has_permission`, `fn_user_has_any`, `fn_user_has_all`, `fn_user_permissions` | RBAC lookups | `pg_catalog, public` | Same rationale. |
| private | `fn_setting_is_configurable` | Settings RLS helper | `pg_catalog, public` | Same rationale. |

## Phase 2 — Classification

- **Group A (remove/downgrade elevation):** none. Every remaining SECURITY DEFINER is either a trigger function (only fires as trigger; SECURITY DEFINER controls trigger execution privileges) or an RLS-recursion-safe helper.
- **Group B (retain, harden):** all 13.
- **Group C (obsolete):** none identified.

## Phase 3 — Remediation Migration (single migration)

1. **`public.rls_auto_enable`** — root cause of both linter warnings.
   - `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated, service_role;` (event trigger fires without EXECUTE grants).
   - Add `SET search_path = pg_catalog` (already present) and confirm owner `postgres`.
2. **`private.fn_*`** — tighten grants:
   - `REVOKE EXECUTE ... FROM PUBLIC` on every private SECURITY DEFINER function (currently granted to PUBLIC for `fn_user_has_permission`, `fn_user_has_any`, `fn_user_has_all`, `fn_user_permissions`).
   - Keep EXECUTE for `authenticated` only where the app/RLS needs it (RBAC + tenancy helpers). Keep `service_role` on `fn_bootstrap_platform_owner`.
   - Normalize `search_path` on RLS helpers currently set to bare `public` → `pg_catalog, public` (defensive; matches other helpers).
3. Re-confirm all functions are `OWNER = postgres` and fully-qualify objects (spot-fix any bare references found during authoring).

No schema, policy, or application code changes.

## Phase 4 — Verification

- `supabase--linter` → warnings 0028 & 0029 resolved (Leaked Password remains Accepted Risk).
- `supabase--read_query` re-inventory of `pg_proc.proacl` to confirm PUBLIC/anon revoked.
- `bunx tsgo --noEmit` and `bunx vitest run` — expect PASS (no code touched).
- Smoke: sign-in as `admin@demo.test` / `member@demo.test`, load sidebar (RBAC helpers), org switcher (tenancy helpers), settings page (setting helper) — confirm no regressions.

## Phase 5 — Deliverables

- Migration `011_security_definer_hardening.sql`.
- `docs/50-audit-reports/SPRINT_0_7A_SECURITY_DEFINER_HARDENING_REPORT.md` containing the inventory table above, per-function action/result, before/after linter output, and regression evidence.
- Update `docs/50-audit-reports/SPRINT_0_4B_SECURITY_HARDENING_REPORT.md` cross-reference to point at the new report.
- No changes to risk register (R-074 unaffected).

## Exit Criteria

- Linter warnings 0028 and 0029 cleared.
- Every retained SECURITY DEFINER function has explicit `search_path`, `postgres` owner, and least-privilege EXECUTE grants.
- Test suite + typecheck PASS; manual smoke of auth/RBAC/tenancy/settings PASS.
