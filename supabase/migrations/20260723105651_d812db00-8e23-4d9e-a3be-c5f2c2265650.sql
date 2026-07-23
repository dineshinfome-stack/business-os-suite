
CREATE EXTENSION IF NOT EXISTS citext;

-- organization_profiles ----------------------------------------------------
CREATE TABLE public.organization_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  legal_name text, display_name text, business_type text, industry text,
  tax_id text, registration_number text,
  email text, phone text, website text,
  address_line1 text, address_line2 text, city text, state text, postal_code text, country text,
  currency text NOT NULL DEFAULT 'USD',
  timezone text NOT NULL DEFAULT 'UTC',
  language text NOT NULL DEFAULT 'en',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_profiles TO authenticated;
GRANT ALL ON public.organization_profiles TO service_role;
ALTER TABLE public.organization_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_profiles_select ON public.organization_profiles FOR SELECT TO authenticated
  USING (private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY org_profiles_insert ON public.organization_profiles FOR INSERT TO authenticated
  WITH CHECK (private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY org_profiles_update ON public.organization_profiles FOR UPDATE TO authenticated
  USING (private.fn_is_org_member(auth.uid(), organization_id))
  WITH CHECK (private.fn_is_org_member(auth.uid(), organization_id));
CREATE TRIGGER trg_organization_profiles_updated_at BEFORE UPDATE ON public.organization_profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- organization_branding ----------------------------------------------------
CREATE TABLE public.organization_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  logo_url text, favicon_url text,
  primary_color text, secondary_color text,
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('light','dark','system')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, updated_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_branding TO authenticated;
GRANT ALL ON public.organization_branding TO service_role;
ALTER TABLE public.organization_branding ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_branding_select ON public.organization_branding FOR SELECT TO authenticated
  USING (private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY org_branding_insert ON public.organization_branding FOR INSERT TO authenticated
  WITH CHECK (private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY org_branding_update ON public.organization_branding FOR UPDATE TO authenticated
  USING (private.fn_is_org_member(auth.uid(), organization_id))
  WITH CHECK (private.fn_is_org_member(auth.uid(), organization_id));
CREATE TRIGGER trg_organization_branding_updated_at BEFORE UPDATE ON public.organization_branding
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- user_profiles ------------------------------------------------------------
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text, job_title text, department text,
  avatar_url text, phone text, timezone text, language text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_profiles_select ON public.user_profiles FOR SELECT TO authenticated
  USING (private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY user_profiles_insert_own ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY user_profiles_update_own ON public.user_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- organization_invitations -------------------------------------------------
CREATE TABLE public.organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email citext NOT NULL,
  role public.org_role NOT NULL DEFAULT 'member',
  invited_by uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired','revoked')),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz, accepted_by uuid,
  revoked_at timestamptz, revoked_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX organization_invitations_unique_pending_email
  ON public.organization_invitations (organization_id, lower(email::text)) WHERE status = 'pending';
CREATE INDEX organization_invitations_org_status_idx
  ON public.organization_invitations (organization_id, status);
CREATE INDEX organization_invitations_email_status_idx
  ON public.organization_invitations (lower(email::text), status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_invitations TO authenticated;
GRANT ALL ON public.organization_invitations TO service_role;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_invitations_select ON public.organization_invitations FOR SELECT TO authenticated
  USING (
    private.fn_is_org_member(auth.uid(), organization_id)
    OR (status = 'pending' AND lower(email::text) = lower(coalesce(auth.jwt() ->> 'email', '')))
  );
CREATE POLICY org_invitations_insert ON public.organization_invitations FOR INSERT TO authenticated
  WITH CHECK (private.fn_is_org_member(auth.uid(), organization_id) AND invited_by = auth.uid());
CREATE POLICY org_invitations_update ON public.organization_invitations FOR UPDATE TO authenticated
  USING (
    private.fn_is_org_member(auth.uid(), organization_id)
    OR lower(email::text) = lower(coalesce(auth.jwt() ->> 'email', ''))
  ) WITH CHECK (true);
CREATE TRIGGER trg_organization_invitations_updated_at BEFORE UPDATE ON public.organization_invitations
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- RBAC: permission keys (module.resource.action) ---------------------------
INSERT INTO public.permissions (key, module, resource, action, name, description, system_permission) VALUES
  ('workspace.organization.read',   'workspace', 'organization', 'read',   'View organization',      'View organization profile', true),
  ('workspace.organization.update', 'workspace', 'organization', 'update', 'Update organization',    'Update organization profile', true),
  ('workspace.branding.read',       'workspace', 'branding',     'read',   'View branding',          'View organization branding', true),
  ('workspace.branding.update',     'workspace', 'branding',     'update', 'Update branding',        'Update organization branding', true),
  ('workspace.profile.read',        'workspace', 'profile',      'read',   'View profile',           'View user profile', true),
  ('workspace.profile.update',      'workspace', 'profile',      'update', 'Update profile',         'Update own user profile', true),
  ('workspace.member.read',         'workspace', 'member',       'read',   'View members',           'View organization members', true),
  ('workspace.member.invite',       'workspace', 'member',       'invite', 'Invite members',         'Invite new members', true),
  ('workspace.member.remove',       'workspace', 'member',       'remove', 'Remove members',         'Remove members', true),
  ('workspace.invitation.read',     'workspace', 'invitation',   'read',   'View invitations',       'View pending invitations', true),
  ('workspace.invitation.revoke',   'workspace', 'invitation',   'revoke', 'Revoke invitations',     'Revoke pending invitations', true),
  ('workspace.workspace.read',      'workspace', 'workspace',    'read',   'View workspace',         'View the workspace dashboard', true),
  ('workspace.workspace.manage',    'workspace', 'workspace',    'manage', 'Manage workspace',       'Manage workspace-level settings', true)
ON CONFLICT (key) DO NOTHING;

-- All roles: basic reads + own profile update
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE p.key IN (
  'workspace.organization.read','workspace.branding.read','workspace.profile.read',
  'workspace.profile.update','workspace.member.read','workspace.invitation.read',
  'workspace.workspace.read'
)
ON CONFLICT DO NOTHING;

-- Elevated roles
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN (
  'workspace.organization.update','workspace.branding.update',
  'workspace.member.invite','workspace.invitation.revoke','workspace.workspace.manage'
)
WHERE r.key IN ('platform_owner','org_owner','administrator')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key = 'workspace.member.remove'
WHERE r.key IN ('platform_owner','org_owner','administrator')
ON CONFLICT DO NOTHING;

-- Setting definitions ------------------------------------------------------
INSERT INTO public.setting_definitions (key, category, scope, data_type, default_value, description, is_system) VALUES
  ('workspace.default_landing',        'workspace', 'organization', 'string',  '"/workspace"'::jsonb, 'Default landing route after sign-in', true),
  ('workspace.show_pending_invites',   'workspace', 'organization', 'boolean', 'true'::jsonb,         'Show pending invitations count on workspace dashboard', true),
  ('workspace.default_timezone',       'workspace', 'organization', 'string',  '"UTC"'::jsonb,        'Default timezone applied to new user profiles', true),
  ('workspace.allow_custom_theme',     'workspace', 'organization', 'boolean', 'true'::jsonb,         'Allow members to see the organization''s custom theme', true)
ON CONFLICT (key) DO NOTHING;
