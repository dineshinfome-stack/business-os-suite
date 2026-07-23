
-- Migration C: Tenant permissions (SIP-017 gate)
INSERT INTO public.permissions(key, module, resource, action, name, description, system_permission)
VALUES
  ('platform.tenant.read',     'platform', 'tenant', 'read',     'Read tenants',      'View tenants in Platform Admin', true),
  ('platform.tenant.create',   'platform', 'tenant', 'create',   'Create tenant',     'Create a new tenant',            true),
  ('platform.tenant.activate', 'platform', 'tenant', 'activate', 'Activate tenant',   'Transition a tenant to active',  true),
  ('platform.tenant.suspend',  'platform', 'tenant', 'suspend',  'Suspend tenant',    'Suspend an active tenant',       true),
  ('platform.tenant.archive',  'platform', 'tenant', 'archive',  'Archive tenant',    'Archive a tenant',               true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN (
  'platform.tenant.read','platform.tenant.create','platform.tenant.activate',
  'platform.tenant.suspend','platform.tenant.archive'
)
WHERE r.key IN ('platform_admin','platform_owner')
ON CONFLICT DO NOTHING;
