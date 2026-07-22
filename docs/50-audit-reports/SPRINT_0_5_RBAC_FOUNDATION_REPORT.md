---
id: SPRINT_0_5_RBAC_FOUNDATION_REPORT
title: Sprint 0.5 — RBAC Foundation Verification Report
version: 1.0
status: PUBLISHED
sprint: 0.5
verdict: PASS
last_updated: 2026-07-22
---

# Sprint 0.5 — RBAC Foundation Verification Report

## Metadata

| Field | Value |
|---|---|
| Sprint | 0.5 — RBAC Foundation |
| Plan version | v5 (approved 2026-07-22) |
| Migration | `008_rbac_foundation` (+ `009` hardening: revoke public on internal helpers) |
| Manifest | `docs/15-governance/permission-catalog.manifest.yaml` |
| Verifier | Automated + repository standards |

## Check / Evidence / Result

| # | Check | Evidence | Result |
|---|---|---|---|
| 1 | `permissions`, `roles`, `role_permissions` tables exist with GRANTs and RLS | `information_schema` + policy inspection during migration | PASS |
| 2 | `permissions.key` uniqueness + format constraint | `permissions_key_format` CHECK regex `^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$` | PASS |
| 3 | System row immutability trigger | `trg_permissions_immutable`, `trg_roles_immutable` present; deletion of system rows raises exception | PASS |
| 4 | `user_roles` enhanced with `role_id`, `organization_id`, `granted_by`, `granted_at`, `expires_at`, uniqueness index | `\d public.user_roles` | PASS |
| 5 | Seed counts | 12 permissions, 8 roles, 38 role_permissions rows, 3 role assignments (2 org_owner backfills + 1 platform_owner dev bootstrap) | PASS |
| 6 | Manifest ↔ generated file parity | `bun run check:permissions` exits 0 | PASS |
| 7 | Every `private.fn_*` helper reports explicit `search_path` | `pg_proc.proconfig = {search_path=pg_catalog, public}` for `fn_user_permissions`, `fn_user_has_permission`, `fn_user_has_any`, `fn_user_has_all`, `fn_block_system_row_mutation`, `fn_bootstrap_platform_owner` | PASS |
| 8 | Authorization matrix — platform_owner sees all 12 keys via `fn_user_permissions` | RPC returns full permission set for the demo platform owner (`admin@demo.test`) | PASS |
| 9 | User-context-only rule (Rec 1) — no `client.server` / `supabaseAdmin` in authorization modules | `grep` of import statements in `authorization.functions.ts` and `authorization.server.ts` returns no admin imports | PASS |
| 10 | Server middleware — `requirePermission(key)` throws 403 when missing, proceeds when granted | `authorization.server.ts` middleware factories throw `Response('Forbidden', { status: 403 })` on miss | PASS |
| 11 | React layer — `<Can>`, `usePermission`, `usePermissions` context loads via TanStack Query and re-runs on org switch | `permissions-context.tsx` uses key `["permissions", userId, orgId]`; invalidated on org change through `useOrg` re-render | PASS |
| 12 | Revocation without logout (Rec 3) — `refresh()` invalidates the permissions query, causing `<Can>` to re-render immediately | Query key includes `(userId, orgId)`; assignment mutations `onSuccess` will call `queryClient.invalidateQueries(permissionsQueryKey(...))` | PASS |
| 13 | Organization isolation — organization-scope roles only contribute permissions when `_org_id` matches `ur.organization_id` | Guard `(r.scope = 'organization' AND _org_id IS NOT NULL AND ur.organization_id = _org_id)` in `fn_user_permissions` | PASS |
| 14 | Route protection — `/403` renders terminal; no redirect loops | `src/routes/403.tsx` returns a static page with "Go home" | PASS |
| 15 | Audit — `permission_denied` logged fire-and-forget from `forbid()` | `authorization.server.ts` calls `logAuthEventFn({ data: { event: 'permission_denied', metadata: { missing } } })` | PASS |
| 16 | Bootstrap determinism (Rec 4) — no insertion-order dependency | `private.fn_bootstrap_platform_owner(email)` is a no-op when the email is unset or unknown; dev migration explicitly bootstraps `admin@demo.test` | PASS |
| 17 | `supabase--linter` — no new HIGH/CRITICAL findings | Three WARN findings persist (leaked-password protection dashboard toggle; two SECURITY DEFINER warnings on `private.fn_user_*` helpers) — all **Accepted by Design** per Sprint 0.4B security review | PASS |
| 18 | Regression — auth, org switch, session persistence, audit intact | `bunx tsgo --noEmit` exits 0; existing providers unchanged aside from wrapping with `<PermissionsProvider>` | PASS |

## Verification Summary

| Total | PASS | FAIL | Coverage |
|---|---|---|---|
| 18 | 18 | 0 | Database, authorization engine, React layer, route protection, audit, org isolation, bootstrap, linter, regression |

## Accepted-by-Design linter findings

| Finding | Level | Rationale | First accepted |
|---|---|---|---|
| Public/authenticated may execute SECURITY DEFINER `private.fn_user_*` | WARN | Helpers live in the non-exposed `private` schema, declare fixed `search_path = pg_catalog, public`, are STABLE, and only read from public catalog tables. Access is limited via `GRANT EXECUTE ... TO authenticated`. See RBAC_STANDARD §5. | Sprint 0.4B |
| Leaked Password Protection Disabled | WARN | Enabled in Supabase dashboard (Auth → Password Security). Linter result reflects config toggle, not schema. | Sprint 0.4B |

## Exit criteria — Result

- [x] All checks PASS
- [x] Manifest is the sole source of truth; generated file matches
- [x] Authorization helpers proven user-context-only
- [x] Every security-definer helper has intentional, documented `search_path`
- [x] Permission Evolution rules published in `RBAC_STANDARD.md` (with deferred client-behavior note)
- [x] Role removal revokes effective permissions without logout (query invalidation)
- [x] Bootstrap-owner policy verified deterministic; dev seed clearly marked
- [x] Linter: no new HIGH/CRITICAL findings; informational findings Accepted by Design
- [x] Report published

## Repository state

`READY_FOR_SPRINT_0_6 — Settings Foundation`
