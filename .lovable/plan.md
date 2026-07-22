# Sprint 0.5 — RBAC Foundation (v5)

Establishes the reusable authorization layer every Business OS module will consume. No module-specific business logic, no custom-role management UI. Incorporates review recommendations 1–8.

## 1. Database (Migration `008_rbac_foundation`)

New tables (all `public`, RLS enabled, GRANTs to `authenticated` + `service_role`, `anon` denied):

- `permissions` — `id uuid` (immutable internal id), `key` unique (`module.resource.action`), `module`, `resource`, `action`, `name`, `description`, `system_permission bool default true`; trigger blocks `UPDATE`/`DELETE` when system
- `roles` — `id uuid`, `key` unique, `name`, `description`, `scope` enum (`platform` | `organization`), `system_role bool default true`, `rank int` (presentation/tiebreak only — no implicit inheritance)
- `role_permissions` — many-to-many, unique `(role_id, permission_id)`
- Enhance `user_roles`: add `role_id`, `organization_id nullable` (null = platform), `granted_by`, `granted_at`, `expires_at nullable`; unique `(user_id, organization_id, role_id)`; append-only; keep legacy column until Sprint 0.6

### Helper functions in `private` schema — search_path policy (Rec 5)

Every helper declares `SECURITY DEFINER`, `STABLE`, `EXECUTE` to `authenticated`, and an **intentional, documented** `search_path`:

- Default: `SET search_path = pg_catalog, public` — `pg_catalog` first guarantees system operators/casts resolve to built-ins; `public` included because helpers reference `public.permissions`, `public.roles`, `public.role_permissions`, `public.user_roles`
- Helpers touching only `private` objects: `SET search_path = pg_catalog, private`
- Rationale recorded as header comment on each function and in `RBAC_STANDARD.md` §"Security-definer search_path policy"

Functions:

- `private.fn_user_permissions(_user_id, _org_id)` → `setof text`
- `private.fn_user_has_permission` / `fn_user_has_any` / `fn_user_has_all`

RLS:

- `permissions`, `roles`, `role_permissions` — SELECT to `authenticated`; no client writes
- `user_roles` — SELECT own or org-admin; writes via server fns only

### Seed determinism (Rec 4)

- Wave 0 permissions, 8 system roles, and role→permission bindings seeded with fixed keys — no insertion-order dependency
- **Platform-owner bootstrap policy** (in `RBAC_STANDARD.md`):
  1. If `PLATFORM_OWNER_EMAIL` matches an existing `auth.users.email`, grant that user `platform_owner`
  2. Otherwise no user is granted `platform_owner` by this migration
  3. Dev-only convenience: separate, clearly-marked dev seed grants `platform_owner` to `admin@demo.test`
- `org_owner` backfill deterministic (`organizations.owner_user_id` → `org_owner`)

### Future consideration (documented, not implemented)

`id` (uuid) is immutable internal reference; `key` is stable human-readable name. Future custom-role work uses `id` for bindings so `key` renames don't break references.

## 2. Single Source of Truth — Permission Catalog Manifest (Rec 2)

- `docs/15-governance/permission-catalog.manifest.yaml` drives SQL seed and TypeScript union
- `scripts/generate-permissions.ts` writes `src/lib/generated/permission-keys.ts` (typed `PermissionKey` union + `PERMISSIONS` record)
- Wired into `bun run build`; `bun run gen:permissions`; CI parity check fails on drift
- Hand-maintained constants rejected

## 3. Shared Server — Authorization Engine (Rec 1)

Authorization is **user-context-only**. `service_role` is forbidden in `hasPermission`, `requirePermission*`, `listUserPermissions`, `listEffectivePermissions`. It appears only in role-assignment mutations. Enforced by keeping `client.server` out of `authorization.functions.ts` / `authorization.server.ts` (grep check in verification).

- `authorization.functions.ts`: `hasPermission`, `listUserPermissions`, `listEffectivePermissions` — `createServerFn` + `requireSupabaseAuth` + `requireOrgContext`, resolved via `private.fn_user_*` under caller JWT
- `authorization.server.ts`: `requirePermission(key)` / `requireAnyPermission(keys)` / `requireAllPermissions(keys)` middleware factories on top of `requireOrgContext`, throwing `Response('Forbidden', { status: 403 })`
- Per-request memoization
- `assignRole` / `revokeRole` guarded by `requirePermission('platform.roles.assign')`; only these dynamically import `supabaseAdmin`
- Audit (fire-and-forget): `permission_denied`, `role_assigned`, `role_removed`, sampled `permission_checked`

## 4. Shared Client — React Authorization Layer

- `src/contexts/permissions-context.tsx` — TanStack Query fetch of effective permissions per (user, org); invalidated on org switch and on role mutation `onSuccess`
- Hooks: `usePermission`, `usePermissions`, `useAnyPermission`, `useAllPermissions`
- Components: `<Can>`, `<CanAny>`, `<CanAll>` with optional `fallback`
- Uses generated `PermissionKey` union → zero magic strings

## 5. Route & UI Protection

- Permission gating in `beforeLoad` via `hasPermission`; failure → `/403` (terminal, no loops)
- Hierarchy: public → authenticated → organization → permission → platform-admin
- `AppShell` sidebar/menus filter through `usePermission`
- `/403` shows attempted key (non-sensitive) + placeholder "Request access" CTA

## 6. Documentation

- `RBAC_STANDARD.md` — model, scopes, precedence, user-context-only rule, rank-no-inheritance, bootstrap-owner policy, immutable-id future note, security-definer search_path policy, **Permission Evolution section (Rec 6)**:
  - New permissions added only through append-only migrations
  - Existing permission keys never repurposed or redefined
  - Deprecated permissions remain in the catalog with a `deprecated_at` marker until a documented retirement process removes them
  - **Future work note (Rec 8)**: a later sprint will specify client behavior for deprecated permissions (expected default: treat as valid until retirement completes, with a warning surface); not implemented in Sprint 0.5
- `PERMISSION_CATALOG.md` — rendered from the manifest, with reserved per-module namespaces
- `ROLE_MODEL.md` — roles, rank semantics, default bindings
- `MIGRATION_REGISTRY.md` updated with `008_rbac_foundation`

## 7. Verification — `SPRINT_0_5_RBAC_FOUNDATION_REPORT.md`

Check → Evidence → Result rows covering:

- DB: tables, constraints, indexes, seed counts
- Manifest → generated → seed parity
- Every `private.fn_*` helper reports the expected `search_path` via `pg_proc.proconfig`
- Authorization matrix per system role via `private.fn_user_permissions`
- Server: `requirePermission` returns 403/200 as expected
- React: `<Can>` renders/hides; `usePermission` updates after role change, including revocation immediately dropping access without re-login
- Org isolation: admin in Org X → zero permissions in Org Y
- Route protection: unauth → `/auth`, auth-no-perm → `/403`, auth-with-perm → 200
- Audit rows for `permission_denied`, `role_assigned`, `role_removed`
- Performance: one permission query per page
- Grep: no `supabaseAdmin` / `client.server` in authorization modules
- Bootstrap determinism: unset env → no `platform_owner`; set env → exactly one grant
- **`supabase--linter` re-run (Rec 7)**: no new HIGH/CRITICAL findings introduced; any existing informational findings are either resolved or explicitly recorded as **Accepted by Design** with rationale, consistent with Sprint 0.4B
- Regression: auth, org switch, session persistence, audit intact
- Verification Summary table per repository standard

## Exit criteria

- All checks PASS
- Manifest is sole source of truth; generated file matches
- Authorization helpers proven user-context-only
- Every security-definer helper has intentional, documented `search_path`
- Permission Evolution rules published in `RBAC_STANDARD.md` (with deferred client-behavior note)
- Role removal revokes effective permissions without logout
- Bootstrap-owner policy verified deterministic in prod path; dev seed clearly marked
- Linter: no new HIGH/CRITICAL findings; informational findings resolved or Accepted by Design
- Report published; repository state → `READY_FOR_SPRINT_0_6`

## Constraints

Append-only migrations; no changes to Wave 0 infra unless critical defect; no custom-role UI; no field/record-level ACLs beyond org isolation.
