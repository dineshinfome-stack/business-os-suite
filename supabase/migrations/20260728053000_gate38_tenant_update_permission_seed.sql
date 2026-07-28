-- ============================================================================
-- Gate 3.8 — FINDING-G38-TENANT-UPDATE-PERMISSION-SEED
-- Append-only roll-forward correction: seed `platform.tenant.update`.
-- ============================================================================
--
-- Context
-- -------
-- * The governance permission manifest
--   (docs/15-governance/permission-catalog.manifest.yaml) ALREADY contains the
--   permission key `platform.tenant.update`.
-- * The generated TypeScript catalog
--   (src/lib/generated/permission-keys.ts) ALREADY contains
--   `PLATFORM_TENANT_UPDATE: "platform.tenant.update"`.
-- * The historical migration `20260723172755` seeded the tenant permission
--   rows but OMITTED the database seed for `platform.tenant.update`.
-- * Pass 3.8.4 (Administrator RPC live certification) FAILED its precondition
--   on a clean replayed database because the permission row was missing, so no
--   principal could hold the key that the onboarding command facades and the
--   `private.fn_user_has_permission(...)` guards authorize against.
-- * This migration is an APPEND-ONLY roll-forward correction. Historical
--   migrations remain unchanged; nothing is edited, renamed or renumbered.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Permission row
-- ---------------------------------------------------------------------------
INSERT INTO public.permissions (
  key,
  module,
  resource,
  action,
  name,
  description,
  system_permission
)
VALUES (
  'platform.tenant.update',
  'platform',
  'tenant',
  'update',
  'Update tenant',
  'Update tenant registry metadata (non-lifecycle)',
  true
)
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. Required platform-role grants (idempotent)
--    Only `platform_owner` and `platform_admin`. No organization-scoped or
--    custom role receives this permission automatically.
-- ---------------------------------------------------------------------------
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p
  ON p.key = 'platform.tenant.update'
WHERE r.key IN ('platform_owner', 'platform_admin')
  AND r.scope = 'platform'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Deterministic validation
--    Counts ONLY the two required platform-role bindings so that future
--    custom-role grants do not cause a false failure.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_permission_count integer;
  v_role_count       integer;
  v_binding_count    integer;
  v_shape_ok         boolean;
BEGIN
  SELECT count(*) INTO v_permission_count
  FROM public.permissions
  WHERE key = 'platform.tenant.update';

  IF v_permission_count <> 1 THEN
    RAISE EXCEPTION
      'G38-TENANT-UPDATE-SEED: expected exactly 1 permission row for platform.tenant.update, found %',
      v_permission_count;
  END IF;

  SELECT count(*) INTO v_role_count
  FROM public.roles
  WHERE key IN ('platform_owner', 'platform_admin')
    AND scope = 'platform';

  IF v_role_count <> 2 THEN
    RAISE EXCEPTION
      'G38-TENANT-UPDATE-SEED: expected exactly 2 required platform roles (platform_owner, platform_admin), found %',
      v_role_count;
  END IF;

  SELECT count(*) INTO v_binding_count
  FROM public.role_permissions rp
  JOIN public.roles r       ON r.id = rp.role_id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE p.key = 'platform.tenant.update'
    AND r.scope = 'platform'
    AND r.key IN ('platform_owner', 'platform_admin');

  IF v_binding_count <> 2 THEN
    RAISE EXCEPTION
      'G38-TENANT-UPDATE-SEED: expected exactly 2 required platform-role bindings for platform.tenant.update, found %',
      v_binding_count;
  END IF;

  SELECT (module = 'platform'
      AND resource = 'tenant'
      AND action = 'update'
      AND system_permission IS TRUE)
    INTO v_shape_ok
  FROM public.permissions
  WHERE key = 'platform.tenant.update';

  IF NOT COALESCE(v_shape_ok, false) THEN
    RAISE EXCEPTION
      'G38-TENANT-UPDATE-SEED: permission row shape invalid for platform.tenant.update (expected module=platform, resource=tenant, action=update, system_permission=true)';
  END IF;
END
$$;
