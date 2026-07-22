-- ============================================================================
-- Sprint 0.4 — Multi-Tenancy Foundation (Migration 006)
-- ============================================================================

-- Enums --------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.org_member_status AS ENUM ('active', 'invited', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- organizations ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slug         text NOT NULL UNIQUE,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid,
  deleted_at   timestamptz,
  deleted_by   uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug) WHERE deleted_at IS NULL;

-- organization_members -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organization_members (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL,
  role            public.org_role NOT NULL DEFAULT 'member',
  status          public.org_member_status NOT NULL DEFAULT 'active',
  invited_by      uuid,
  invited_at      timestamptz,
  joined_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  updated_by      uuid,
  deleted_at      timestamptz,
  deleted_by      uuid,
  UNIQUE (organization_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_org_members_user     ON public.organization_members(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_org      ON public.organization_members(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_org_role ON public.organization_members(organization_id, role) WHERE deleted_at IS NULL AND status = 'active';

-- Security-definer helpers (private schema, revoked from PUBLIC/anon/authenticated)
CREATE OR REPLACE FUNCTION private.fn_is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND status = 'active'
      AND deleted_at IS NULL
  );
$$;
REVOKE ALL ON FUNCTION private.fn_is_org_member(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.fn_org_role(_user_id uuid, _org_id uuid)
RETURNS public.org_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = _user_id
    AND organization_id = _org_id
    AND status = 'active'
    AND deleted_at IS NULL
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION private.fn_org_role(uuid, uuid) FROM PUBLIC, anon, authenticated;

-- Policies: organizations --------------------------------------------------
CREATE POLICY organizations_select_members ON public.organizations
  FOR SELECT TO authenticated
  USING (private.fn_is_org_member(auth.uid(), id) AND deleted_at IS NULL);

CREATE POLICY organizations_update_admins ON public.organizations
  FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND private.fn_org_role(auth.uid(), id) IN ('owner','admin')
  )
  WITH CHECK (
    private.fn_org_role(auth.uid(), id) IN ('owner','admin')
  );

-- Policies: organization_members -------------------------------------------
CREATE POLICY org_members_select_own ON public.organization_members
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY org_members_select_same_org ON public.organization_members
  FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND private.fn_is_org_member(auth.uid(), organization_id)
  );

CREATE POLICY org_members_admin_manage ON public.organization_members
  FOR ALL TO authenticated
  USING (private.fn_org_role(auth.uid(), organization_id) IN ('owner','admin'))
  WITH CHECK (private.fn_org_role(auth.uid(), organization_id) IN ('owner','admin'));

-- Extend the new-auth-user trigger to auto-provision a personal organization.
CREATE OR REPLACE FUNCTION private.fn_handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name text;
  v_org_id       uuid;
  v_base_slug    text;
  v_slug         text;
  v_suffix       int := 0;
BEGIN
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Profile ---------------------------------------------------------------
  INSERT INTO public.profiles (id, display_name, avatar_url, created_by, updated_by)
  VALUES (
    NEW.id,
    COALESCE(v_display_name, NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.id,
    NEW.id
  )
  ON CONFLICT (id) DO NOTHING;

  -- Personal organization -------------------------------------------------
  v_base_slug := regexp_replace(lower(COALESCE(v_display_name, 'user')), '[^a-z0-9]+', '-', 'g');
  v_base_slug := trim(both '-' from v_base_slug);
  IF v_base_slug = '' THEN v_base_slug := 'user'; END IF;
  v_slug := v_base_slug || '-' || substr(NEW.id::text, 1, 8);

  -- Ensure uniqueness on collision
  WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = v_slug) LOOP
    v_suffix := v_suffix + 1;
    v_slug := v_base_slug || '-' || substr(NEW.id::text, 1, 8) || '-' || v_suffix::text;
  END LOOP;

  INSERT INTO public.organizations (name, slug, created_by, updated_by)
  VALUES (COALESCE(v_display_name, 'My') || '''s Workspace', v_slug, NEW.id, NEW.id)
  RETURNING id INTO v_org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role, status, joined_at, created_by, updated_by)
  VALUES (v_org_id, NEW.id, 'owner', 'active', now(), NEW.id, NEW.id);

  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fn_handle_new_auth_user() FROM PUBLIC, anon, authenticated;
