---
id: RBAC_STANDARD
title: RBAC Standard
version: 1.0
status: PUBLISHED
sprint: 0.5
last_updated: 2026-07-22
---

# RBAC Standard

Authoritative reference for role-based access control across Business OS.

## 1. Model

- **Permission** — atomic capability, keyed `module.resource.action` (e.g. `platform.users.view`). Immutable once published.
- **Role** — named bundle of permissions. Scope is `platform` (grants apply anywhere) or `organization` (grants apply only within the specified org).
- **Role → Permission** — many-to-many binding in `role_permissions`. Effective permissions are strictly the union of these rows for the roles a user holds. **No implicit inheritance from `rank`.**
- **User → Role** — assignments in `user_roles`, keyed by `(user_id, organization_id, role_id)`. `organization_id = NULL` denotes a platform-scope grant. Expired or soft-deleted rows do not contribute.

## 2. Identity vs. name

Every role and permission has an immutable UUID `id` and a stable human-readable `key`. The `id` is the internal reference used by bindings. The `key` is what humans read and what code imports through the generated union. Future custom-role work will bind by `id`.

## 3. Rank semantics

`roles.rank` is used for **presentation ordering and conflict tie-breaking only**. It does not confer additional permissions. Two users with distinct roles receive exactly the permissions bound to those roles — nothing more.

## 4. User-context-only authorization rule

All authorization *checks* run under the caller's JWT:

- `hasPermission`, `listEffectivePermissions`, and every `requirePermission*` middleware use `requireSupabaseAuth` and query `private.fn_user_*` under the caller's context.
- **`supabaseAdmin` / `client.server` is forbidden inside `src/lib/authorization.functions.ts` and `src/lib/authorization.server.ts`.**
- The service role is reserved for administrative *mutations* (role assignment/revocation) that cannot be safely expressed under user RLS. Those mutations verify the caller's `platform.roles.assign` permission *before* loading the admin client.

## 5. Security-definer helper `search_path` policy

Every `private.fn_*` helper declares an explicit `search_path`. This is not incidental — it defends against object-name hijacking:

- **Default:** `SET search_path = pg_catalog, public`
  - `pg_catalog` first ensures built-in operators (`=`, `ANY`, `unnest`, `now()`, …) always resolve to system objects.
  - `public` follows because helpers reference `public.permissions`, `public.roles`, `public.role_permissions`, `public.user_roles`.
- **Helpers touching only private objects:** `SET search_path = pg_catalog, private`.
- The policy is repeated as a header comment on each function.

## 6. Bootstrap platform owner

Insertion order is not authoritative. The initial `platform_owner` is granted deterministically:

1. Deployment sets `PLATFORM_OWNER_EMAIL` (or an equivalent bootstrap setting) before running migration `008`.
2. `private.fn_bootstrap_platform_owner(email)` grants `platform_owner` to the matching `auth.users.email`. It is a no-op if the email is absent or unset.
3. Development convenience: the migration invokes the bootstrap function for `admin@demo.test`, so the seeded demo account is a platform owner in dev environments. This dev call is clearly marked in the migration and must not be relied on in production.

Production deployments call the bootstrap function themselves after seeding the intended owner account.

## 7. Permission evolution

- New permissions are added **only through append-only migrations**, and only after the manifest at `docs/15-governance/permission-catalog.manifest.yaml` is updated.
- Existing permission keys are **never repurposed or redefined**. A key means one thing forever.
- Deprecated permissions remain in the catalog with a non-null `deprecated_at`. They are removed only through a documented retirement process (to be defined in a later sprint).
- **Future work (deferred):** client behavior for deprecated permissions will be specified separately. The expected default is *treat as valid until retirement completes, with a warning surface*; that behavior is not implemented in Sprint 0.5.

## 8. Single source of truth

The manifest at `docs/15-governance/permission-catalog.manifest.yaml` is the single source of truth. It drives:

- `src/lib/generated/permission-keys.ts` (regenerate with `bun run gen:permissions`; `bun run check:permissions` fails CI on drift).
- The SQL seed values in migration `008_rbac_foundation` (rendered inline for append-only immutability, but mirroring the manifest).

Hand-editing `permission-keys.ts` is prohibited.

## 9. Route protection hierarchy

`public → authenticated → organization → permission → platform-admin`. Failed permission checks throw HTTP 403 and route the user to `/403` — no redirect loops.

## 10. Audit

Permission changes and denials generate audit rows via the existing fire-and-forget pattern:

- `permission_denied` — logged when a `requirePermission*` middleware rejects a call.
- `role_assigned` / `role_removed` — logged from the assignment functions.
- `permission_checked` — sampled for hot-path checks (opt-in).

No sensitive information is included in audit metadata.
