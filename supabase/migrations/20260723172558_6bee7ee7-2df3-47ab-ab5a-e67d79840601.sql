
-- Migration A: Tenancy Foundation - tenants, branches, financial_years, organizations.tenant_id
-- Sprint: SPR-MOD-001-001 (SIP-001, 002, 004, 007)

CREATE EXTENSION IF NOT EXISTS citext;

-- 1. Enum ------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.tenant_lifecycle_state AS ENUM ('created','active','suspended','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. tenants ---------------------------------------------------------------
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug citext NOT NULL UNIQUE,
  display_name text NOT NULL,
  region text NOT NULL DEFAULT 'global',
  default_locale text NOT NULL DEFAULT 'en',
  timezone text NOT NULL DEFAULT 'UTC',
  plan_tier text NOT NULL DEFAULT 'standard',
  lifecycle_state public.tenant_lifecycle_state NOT NULL DEFAULT 'created',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  suspended_at timestamptz,
  archived_at timestamptz,
  CONSTRAINT tenants_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$')
);

GRANT SELECT, INSERT, UPDATE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- Immutable id + slug guard
CREATE OR REPLACE FUNCTION private.fn_tenants_guard_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'tenants.id is immutable';
  END IF;
  IF NEW.slug <> OLD.slug THEN
    RAISE EXCEPTION 'tenants.slug is immutable';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_tenants_immutable
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION private.fn_tenants_guard_immutable();

CREATE INDEX idx_tenants_lifecycle ON public.tenants(lifecycle_state);

-- 3. organizations.tenant_id ----------------------------------------------
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS tenant_id uuid;

-- Back-fill: one synthetic active tenant per existing org
DO $$
DECLARE
  o record;
  new_slug text;
  new_tenant uuid;
BEGIN
  FOR o IN SELECT id, name, slug FROM public.organizations WHERE tenant_id IS NULL LOOP
    new_slug := lower(regexp_replace(coalesce(o.slug, o.name, o.id::text), '[^a-z0-9]+', '-', 'g'));
    new_slug := regexp_replace(new_slug, '^-+|-+$', '', 'g');
    IF length(new_slug) < 3 THEN new_slug := 'tenant-' || replace(o.id::text, '-', ''); END IF;
    IF length(new_slug) > 64 THEN new_slug := substring(new_slug, 1, 64); END IF;
    -- collision suffix
    WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = new_slug::citext) LOOP
      new_slug := substring(new_slug, 1, 56) || '-' || substring(replace(gen_random_uuid()::text,'-',''),1,6);
    END LOOP;
    INSERT INTO public.tenants(slug, display_name, lifecycle_state, activated_at)
    VALUES (new_slug, coalesce(o.name, new_slug), 'active', now())
    RETURNING id INTO new_tenant;
    UPDATE public.organizations SET tenant_id = new_tenant WHERE id = o.id;
  END LOOP;
END $$;

ALTER TABLE public.organizations
  ALTER COLUMN tenant_id SET NOT NULL,
  ADD CONSTRAINT organizations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

CREATE INDEX idx_organizations_tenant ON public.organizations(tenant_id);

-- 4. branches --------------------------------------------------------------
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  code text NOT NULL,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code)
);
CREATE UNIQUE INDEX idx_branches_org_default ON public.branches(organization_id) WHERE is_default;
CREATE INDEX idx_branches_tenant ON public.branches(tenant_id);

GRANT SELECT, INSERT, UPDATE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 5. financial_years -------------------------------------------------------
CREATE TABLE public.financial_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  code text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_placeholder boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, code),
  CHECK (end_date > start_date)
);
CREATE INDEX idx_fy_tenant ON public.financial_years(tenant_id);

GRANT SELECT, INSERT, UPDATE ON public.financial_years TO authenticated;
GRANT ALL ON public.financial_years TO service_role;
ALTER TABLE public.financial_years ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_fy_updated_at
  BEFORE UPDATE ON public.financial_years
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 6. Policies (initial - refined in Migration B once helpers exist) --------
-- tenants: platform admins see all; members see their own tenant.
CREATE POLICY tenants_select_platform_admin ON public.tenants
  FOR SELECT TO authenticated
  USING (private.fn_has_role(auth.uid(), 'admin'));

CREATE POLICY tenants_select_member ON public.tenants
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.organizations o
    JOIN public.organization_members m ON m.organization_id = o.id
    WHERE o.tenant_id = tenants.id AND m.user_id = auth.uid() AND m.deleted_at IS NULL
  ));

CREATE POLICY tenants_insert_platform_admin ON public.tenants
  FOR INSERT TO authenticated
  WITH CHECK (private.fn_has_role(auth.uid(), 'admin'));

CREATE POLICY tenants_update_platform_admin ON public.tenants
  FOR UPDATE TO authenticated
  USING (private.fn_has_role(auth.uid(), 'admin'))
  WITH CHECK (private.fn_has_role(auth.uid(), 'admin'));

-- branches / financial_years: members of an org in the tenant may read; platform admins may manage.
CREATE POLICY branches_select_member ON public.branches
  FOR SELECT TO authenticated
  USING (private.fn_is_org_member(auth.uid(), organization_id) OR private.fn_has_role(auth.uid(),'admin'));

CREATE POLICY branches_write_admin ON public.branches
  FOR ALL TO authenticated
  USING (private.fn_has_role(auth.uid(),'admin'))
  WITH CHECK (private.fn_has_role(auth.uid(),'admin'));

CREATE POLICY fy_select_member ON public.financial_years
  FOR SELECT TO authenticated
  USING (private.fn_is_org_member(auth.uid(), organization_id) OR private.fn_has_role(auth.uid(),'admin'));

CREATE POLICY fy_write_admin ON public.financial_years
  FOR ALL TO authenticated
  USING (private.fn_has_role(auth.uid(),'admin'))
  WITH CHECK (private.fn_has_role(auth.uid(),'admin'));
