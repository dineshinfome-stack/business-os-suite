-- Gate 3.6 · Multi-Tenant Lifecycle Management (additive only)

-- 1. Lifecycle states -------------------------------------------------------
ALTER TYPE public.tenant_lifecycle_state ADD VALUE IF NOT EXISTS 'maintenance';
ALTER TYPE public.tenant_lifecycle_state ADD VALUE IF NOT EXISTS 'pending_deletion';
ALTER TYPE public.tenant_lifecycle_state ADD VALUE IF NOT EXISTS 'deleted';

-- 2. Lifecycle metadata columns --------------------------------------------
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS maintenance_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS maintenance_reason text,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_scheduled_by uuid,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text,
  ADD COLUMN IF NOT EXISTS purge_after timestamptz;

CREATE INDEX IF NOT EXISTS idx_tenants_purge_after
  ON public.tenants(purge_after)
  WHERE purge_after IS NOT NULL;

-- 3. Permissions ------------------------------------------------------------
INSERT INTO public.permissions(key, module, resource, action, name, description, system_permission)
VALUES
  ('platform.tenant.maintenance',    'platform', 'tenant', 'maintenance',    'Tenant maintenance',      'Enter or exit tenant maintenance mode',      true),
  ('platform.tenant.restore',        'platform', 'tenant', 'restore',        'Restore tenant',          'Restore an archived tenant to active',       true),
  ('platform.tenant.delete_schedule','platform', 'tenant', 'delete_schedule','Schedule tenant deletion','Schedule or cancel tenant deletion',         true),
  ('platform.tenant.delete',         'platform', 'tenant', 'delete',         'Delete tenant',           'Soft-delete a tenant pending deletion',      true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN (
  'platform.tenant.maintenance','platform.tenant.restore',
  'platform.tenant.delete_schedule','platform.tenant.delete'
)
WHERE r.key IN ('platform_admin','platform_owner')
ON CONFLICT DO NOTHING;
