
-- Legacy column made nullable; role_id is the canonical column going forward.
ALTER TABLE public.user_roles ALTER COLUMN role DROP NOT NULL;

-- =============================================================================
-- Sprint 0.5 — RBAC Foundation (retry)
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE public.role_scope AS ENUM ('platform', 'organization');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  module text NOT NULL,
  resource text NOT NULL,
  action text NOT NULL,
  name text NOT NULL,
  description text,
  system_permission boolean NOT NULL DEFAULT true,
  deprecated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT permissions_key_format CHECK (key ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$')
);
CREATE INDEX IF NOT EXISTS permissions_module_idx ON public.permissions(module);
GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissions_select_authenticated ON public.permissions;
CREATE POLICY permissions_select_authenticated ON public.permissions FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  scope public.role_scope NOT NULL,
  system_role boolean NOT NULL DEFAULT true,
  rank integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS roles_select_authenticated ON public.roles;
CREATE POLICY roles_select_authenticated ON public.roles FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, permission_id)
);
CREATE INDEX IF NOT EXISTS role_permissions_permission_idx ON public.role_permissions(permission_id);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS role_permissions_select_authenticated ON public.role_permissions;
CREATE POLICY role_permissions_select_authenticated ON public.role_permissions FOR SELECT TO authenticated USING (true);

ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS granted_by uuid REFERENCES auth.users(id);
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS granted_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS expires_at timestamptz;
CREATE INDEX IF NOT EXISTS user_roles_user_org_idx ON public.user_roles(user_id, organization_id);
CREATE INDEX IF NOT EXISTS user_roles_role_id_idx ON public.user_roles(role_id);
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_org_role_uniq
  ON public.user_roles(user_id, COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), role_id)
  WHERE role_id IS NOT NULL;

CREATE OR REPLACE FUNCTION private.fn_block_system_row_mutation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF (TG_TABLE_NAME = 'permissions' AND OLD.system_permission IS TRUE)
       OR (TG_TABLE_NAME = 'roles' AND OLD.system_role IS TRUE) THEN
      RAISE EXCEPTION 'System catalog rows are immutable (%.%)', TG_TABLE_SCHEMA, TG_TABLE_NAME;
    END IF;
    RETURN OLD;
  ELSE
    IF TG_TABLE_NAME = 'permissions' AND OLD.system_permission IS TRUE THEN
      IF NEW.key = OLD.key AND NEW.module = OLD.module AND NEW.resource = OLD.resource
         AND NEW.action = OLD.action AND NEW.system_permission = OLD.system_permission THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'System permission rows are immutable';
    END IF;
    IF TG_TABLE_NAME = 'roles' AND OLD.system_role IS TRUE THEN
      IF NEW.key = OLD.key AND NEW.scope = OLD.scope AND NEW.system_role = OLD.system_role THEN
        RETURN NEW;
      END IF;
      RAISE EXCEPTION 'System role rows are immutable';
    END IF;
    RETURN NEW;
  END IF;
END $$;

DROP TRIGGER IF EXISTS trg_permissions_immutable ON public.permissions;
CREATE TRIGGER trg_permissions_immutable BEFORE UPDATE OR DELETE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION private.fn_block_system_row_mutation();
DROP TRIGGER IF EXISTS trg_roles_immutable ON public.roles;
CREATE TRIGGER trg_roles_immutable BEFORE UPDATE OR DELETE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION private.fn_block_system_row_mutation();

DROP TRIGGER IF EXISTS trg_permissions_updated_at ON public.permissions;
CREATE TRIGGER trg_permissions_updated_at BEFORE UPDATE ON public.permissions
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
DROP TRIGGER IF EXISTS trg_roles_updated_at ON public.roles;
CREATE TRIGGER trg_roles_updated_at BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE OR REPLACE FUNCTION private.fn_user_permissions(_user_id uuid, _org_id uuid)
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public
AS $$
  SELECT DISTINCT p.key
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  JOIN public.role_permissions rp ON rp.role_id = r.id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = _user_id
    AND ur.deleted_at IS NULL
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
    AND (
      (r.scope = 'platform' AND ur.organization_id IS NULL)
      OR (r.scope = 'organization' AND _org_id IS NOT NULL AND ur.organization_id = _org_id)
    );
$$;

CREATE OR REPLACE FUNCTION private.fn_user_has_permission(_user_id uuid, _org_id uuid, _key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public
AS $$ SELECT EXISTS (SELECT 1 FROM private.fn_user_permissions(_user_id, _org_id) k WHERE k = _key); $$;

CREATE OR REPLACE FUNCTION private.fn_user_has_any(_user_id uuid, _org_id uuid, _keys text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public
AS $$ SELECT EXISTS (SELECT 1 FROM private.fn_user_permissions(_user_id, _org_id) k WHERE k = ANY(_keys)); $$;

CREATE OR REPLACE FUNCTION private.fn_user_has_all(_user_id uuid, _org_id uuid, _keys text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public
AS $$
  SELECT NOT EXISTS (
    SELECT unnest(_keys) EXCEPT
    SELECT k FROM private.fn_user_permissions(_user_id, _org_id) k
  );
$$;

GRANT EXECUTE ON FUNCTION private.fn_user_permissions(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.fn_user_has_permission(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.fn_user_has_any(uuid, uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION private.fn_user_has_all(uuid, uuid, text[]) TO authenticated;

DROP POLICY IF EXISTS user_roles_select_own_or_org_admin ON public.user_roles;
CREATE POLICY user_roles_select_own_or_org_admin ON public.user_roles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      organization_id IS NOT NULL
      AND private.fn_user_has_permission(auth.uid(), organization_id, 'platform.roles.view')
    )
  );

INSERT INTO public.permissions (id, key, module, resource, action, name, description, system_permission) VALUES
  (('00000000-0000-0000-0000-' || substr(md5('platform.users.view'),1,12))::uuid,           'platform.users.view',           'platform', 'users',         'view',   'View platform users',        'View the list of users across the platform',        true),
  (('00000000-0000-0000-0000-' || substr(md5('platform.users.create'),1,12))::uuid,         'platform.users.create',         'platform', 'users',         'create', 'Create platform users',      'Create new user accounts',                          true),
  (('00000000-0000-0000-0000-' || substr(md5('platform.users.update'),1,12))::uuid,         'platform.users.update',         'platform', 'users',         'update', 'Update platform users',      'Update user account details',                       true),
  (('00000000-0000-0000-0000-' || substr(md5('platform.users.delete'),1,12))::uuid,         'platform.users.delete',         'platform', 'users',         'delete', 'Delete platform users',      'Delete user accounts',                              true),
  (('00000000-0000-0000-0000-' || substr(md5('platform.organizations.view'),1,12))::uuid,   'platform.organizations.view',   'platform', 'organizations', 'view',   'View organizations',         'View all organizations on the platform',            true),
  (('00000000-0000-0000-0000-' || substr(md5('platform.organizations.manage'),1,12))::uuid, 'platform.organizations.manage', 'platform', 'organizations', 'manage', 'Manage organizations',       'Create, update, or archive organizations',          true),
  (('00000000-0000-0000-0000-' || substr(md5('platform.roles.view'),1,12))::uuid,           'platform.roles.view',           'platform', 'roles',         'view',   'View role assignments',      'View role assignments within an organization',      true),
  (('00000000-0000-0000-0000-' || substr(md5('platform.roles.assign'),1,12))::uuid,         'platform.roles.assign',         'platform', 'roles',         'assign', 'Assign roles',               'Grant or revoke roles for users in an organization', true),
  (('00000000-0000-0000-0000-' || substr(md5('platform.audit.view'),1,12))::uuid,           'platform.audit.view',           'platform', 'audit',         'view',   'View platform audit log',    'View the platform-wide audit log',                  true),
  (('00000000-0000-0000-0000-' || substr(md5('settings.general.view'),1,12))::uuid,         'settings.general.view',         'settings', 'general',       'view',   'View settings',              'View organization settings',                        true),
  (('00000000-0000-0000-0000-' || substr(md5('settings.general.update'),1,12))::uuid,       'settings.general.update',       'settings', 'general',       'update', 'Update settings',            'Update organization settings',                      true),
  (('00000000-0000-0000-0000-' || substr(md5('audit.logs.view'),1,12))::uuid,               'audit.logs.view',               'audit',    'logs',          'view',   'View audit logs',            'View audit log entries within the current org',     true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.roles (id, key, name, description, scope, system_role, rank) VALUES
  (('00000000-0000-0000-0000-' || substr(md5('role:platform_owner'),1,12))::uuid, 'platform_owner', 'Platform Owner', 'Full platform administrative access',       'platform',     true, 10),
  (('00000000-0000-0000-0000-' || substr(md5('role:platform_admin'),1,12))::uuid, 'platform_admin', 'Platform Admin', 'Platform administration except destructive user actions', 'platform', true, 20),
  (('00000000-0000-0000-0000-' || substr(md5('role:org_owner'),1,12))::uuid,      'org_owner',      'Organization Owner', 'Full control of a single organization', 'organization', true, 30),
  (('00000000-0000-0000-0000-' || substr(md5('role:administrator'),1,12))::uuid,  'administrator',  'Administrator',  'Administers an organization',               'organization', true, 40),
  (('00000000-0000-0000-0000-' || substr(md5('role:manager'),1,12))::uuid,        'manager',        'Manager',        'Manages teams within an organization',      'organization', true, 50),
  (('00000000-0000-0000-0000-' || substr(md5('role:supervisor'),1,12))::uuid,     'supervisor',     'Supervisor',     'Supervises operational activity',           'organization', true, 60),
  (('00000000-0000-0000-0000-' || substr(md5('role:employee'),1,12))::uuid,       'employee',       'Employee',       'Standard employee access',                  'organization', true, 70),
  (('00000000-0000-0000-0000-' || substr(md5('role:read_only'),1,12))::uuid,      'read_only',      'Read Only',      'Read-only access to organization data',     'organization', true, 80)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.key = 'platform_owner' ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.key = 'platform_admin' AND p.key <> 'platform.users.delete' ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.key IN ('org_owner','administrator')
  AND p.key IN ('platform.roles.view','platform.roles.assign','settings.general.view','settings.general.update','audit.logs.view')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.key = 'manager' AND p.key IN ('settings.general.view','audit.logs.view')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM public.roles r CROSS JOIN public.permissions p
WHERE r.key IN ('supervisor','employee','read_only') AND p.key = 'settings.general.view'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id, granted_at)
SELECT DISTINCT om.user_id, r.id, om.organization_id, now()
FROM public.organization_members om
CROSS JOIN public.roles r
WHERE r.key = 'org_owner'
  AND om.role = 'owner'
  AND om.status = 'active'
  AND om.deleted_at IS NULL
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION private.fn_bootstrap_platform_owner(_email text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public
AS $$
DECLARE v_user_id uuid; v_role_id uuid;
BEGIN
  IF _email IS NULL OR length(trim(_email)) = 0 THEN RETURN; END IF;
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
  IF v_user_id IS NULL THEN RETURN; END IF;
  SELECT id INTO v_role_id FROM public.roles WHERE key = 'platform_owner';
  INSERT INTO public.user_roles (user_id, role_id, organization_id, granted_at)
  VALUES (v_user_id, v_role_id, NULL, now())
  ON CONFLICT DO NOTHING;
END $$;

SELECT private.fn_bootstrap_platform_owner('admin@demo.test');
