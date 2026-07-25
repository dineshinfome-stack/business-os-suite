-- SPR-MOD-001-003 — Identity & Access Foundation (permission seed)
INSERT INTO public.permissions (key, module, resource, action, name, description) VALUES
  ('platform.dashboard.view',          'platform', 'dashboard',          'view',          'View platform dashboard',      'Access the super-admin platform dashboard'),
  ('platform.identity_dashboard.view', 'platform', 'identity_dashboard', 'view',          'View identity dashboard',      'Access the Identity & Access module dashboard'),
  ('platform.users.suspend',           'platform', 'users',              'suspend',       'Suspend users',                'Suspend a user account'),
  ('platform.users.activate',          'platform', 'users',              'activate',      'Activate users',               'Activate a suspended user account'),
  ('platform.users.archive',           'platform', 'users',              'archive',       'Archive users',                'Archive a user account (soft delete)'),
  ('platform.users.restore',           'platform', 'users',              'restore',       'Restore users',                'Restore an archived user account'),
  ('platform.users.reset_password',    'platform', 'users',              'reset_password','Reset user password',          'Send a password reset link to a user'),
  ('platform.users.force_reset',       'platform', 'users',              'force_reset',   'Force password reset',         'Require a user to reset their password on next sign-in'),
  ('platform.users.lock',              'platform', 'users',              'lock',          'Lock user account',            'Lock a user account against sign-in'),
  ('platform.users.unlock',            'platform', 'users',              'unlock',        'Unlock user account',          'Unlock a locked user account'),
  ('platform.users.invite',            'platform', 'users',              'invite',        'Invite users',                 'Send platform user invitations'),
  ('platform.roles.create',            'platform', 'roles',              'create',        'Create roles',                 'Create custom roles'),
  ('platform.roles.update',            'platform', 'roles',              'update',        'Update roles',                 'Update a role definition or its permissions'),
  ('platform.roles.clone',             'platform', 'roles',              'clone',         'Clone roles',                  'Duplicate an existing role'),
  ('platform.roles.archive',           'platform', 'roles',              'archive',       'Archive roles',                'Archive an unused role'),
  ('platform.roles.delete',            'platform', 'roles',              'delete',        'Delete roles',                 'Permanently delete an unused custom role'),
  ('platform.permissions.view',        'platform', 'permissions',        'view',          'Browse permissions',           'Browse the platform permission catalog'),
  ('platform.memberships.manage',      'platform', 'memberships',        'manage',        'Manage memberships',           'Manage tenant, company, and branch memberships'),
  ('platform.policies.view',           'platform', 'policies',           'view',          'View authorization policies',  'View role scope and policy assignments'),
  ('platform.policies.manage',         'platform', 'policies',           'manage',        'Manage authorization policies','Assign or update role scopes and policies'),
  ('platform.invitations.view',        'platform', 'invitations',        'view',          'View platform invitations',    'View platform-scope invitations'),
  ('platform.invitations.manage',      'platform', 'invitations',        'manage',        'Manage platform invitations',  'Send, resend, or cancel platform invitations')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.key IN ('platform_owner', 'platform_admin')
  AND p.key IN (
    'platform.dashboard.view','platform.identity_dashboard.view',
    'platform.users.suspend','platform.users.activate','platform.users.archive','platform.users.restore',
    'platform.users.reset_password','platform.users.force_reset','platform.users.lock','platform.users.unlock','platform.users.invite',
    'platform.roles.create','platform.roles.update','platform.roles.clone','platform.roles.archive','platform.roles.delete',
    'platform.permissions.view','platform.memberships.manage',
    'platform.policies.view','platform.policies.manage',
    'platform.invitations.view','platform.invitations.manage'
  )
ON CONFLICT DO NOTHING;
