
-- SPR-MOD-001-002 Migration 001: Schema Evolution
-- Sprint: SPR-MOD-001-002 (SIP-001, SIP-002, SIP-003)
-- Purpose: Add lifecycle columns, defaults, and constraints for
--          organizations (Company), branches, and financial_years.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1. Enums ------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.company_lifecycle_state AS ENUM ('created','active','inactive','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.branch_lifecycle_state AS ENUM ('active','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.financial_year_lifecycle_state AS ENUM ('created','open','closed','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. organizations (Company) -----------------------------------------------
-- Convert slug to citext for consistency with tenants.slug.
ALTER TABLE public.organizations
  ALTER COLUMN slug TYPE citext USING slug::citext;

-- Add lifecycle + metadata columns
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS lifecycle_state public.company_lifecycle_state NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS region text NOT NULL DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS default_locale text NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS legal_name text,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Back-fill activated_at for existing active rows
UPDATE public.organizations
  SET activated_at = coalesce(activated_at, created_at)
  WHERE lifecycle_state = 'active' AND activated_at IS NULL;

-- Replace global slug uniqueness with per-tenant uniqueness
ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_slug_key;
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_tenant_slug_key UNIQUE (tenant_id, slug);

-- At most one default company per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_tenant_default
  ON public.organizations(tenant_id) WHERE is_default;

CREATE INDEX IF NOT EXISTS idx_organizations_lifecycle
  ON public.organizations(lifecycle_state);

-- Slug format check (aligned with tenants.slug format)
DO $$ BEGIN
  ALTER TABLE public.organizations
    ADD CONSTRAINT organizations_slug_format
    CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Immutable-column guard (id, tenant_id, slug) — matches SPR-001 tenants pattern
CREATE OR REPLACE FUNCTION private.fn_organizations_guard_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'organizations.id is immutable';
  END IF;
  IF NEW.tenant_id <> OLD.tenant_id THEN
    RAISE EXCEPTION 'organizations.tenant_id is immutable';
  END IF;
  IF NEW.slug <> OLD.slug THEN
    RAISE EXCEPTION 'organizations.slug is immutable';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_organizations_immutable ON public.organizations;
CREATE TRIGGER trg_organizations_immutable
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION private.fn_organizations_guard_immutable();

-- 3. branches --------------------------------------------------------------
ALTER TABLE public.branches
  ADD COLUMN IF NOT EXISTS lifecycle_state public.branch_lifecycle_state NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS address jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_branches_lifecycle
  ON public.branches(lifecycle_state);

CREATE OR REPLACE FUNCTION private.fn_branches_guard_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'branches.id is immutable';
  END IF;
  IF NEW.tenant_id <> OLD.tenant_id THEN
    RAISE EXCEPTION 'branches.tenant_id is immutable';
  END IF;
  IF NEW.organization_id <> OLD.organization_id THEN
    RAISE EXCEPTION 'branches.organization_id is immutable';
  END IF;
  IF NEW.code <> OLD.code THEN
    RAISE EXCEPTION 'branches.code is immutable';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_branches_immutable ON public.branches;
CREATE TRIGGER trg_branches_immutable
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION private.fn_branches_guard_immutable();

-- 4. financial_years -------------------------------------------------------
ALTER TABLE public.financial_years
  ADD COLUMN IF NOT EXISTS lifecycle_state public.financial_year_lifecycle_state NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS is_default boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Back-fill: singleton placeholders become the org default and are opened
UPDATE public.financial_years
  SET is_default = true, opened_at = coalesce(opened_at, created_at)
  WHERE is_placeholder AND lifecycle_state = 'open';

-- At most one default FY per organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_fy_org_default
  ON public.financial_years(organization_id) WHERE is_default;

CREATE INDEX IF NOT EXISTS idx_fy_lifecycle
  ON public.financial_years(lifecycle_state);

-- Non-overlapping FY period ranges per organization for created/open FYs.
-- Uses inclusive-inclusive daterange so end_date participates in overlap tests.
ALTER TABLE public.financial_years
  DROP CONSTRAINT IF EXISTS financial_years_no_overlap;
ALTER TABLE public.financial_years
  ADD CONSTRAINT financial_years_no_overlap
  EXCLUDE USING gist (
    organization_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  ) WHERE (lifecycle_state IN ('created','open'));

CREATE OR REPLACE FUNCTION private.fn_financial_years_guard_immutable()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'financial_years.id is immutable';
  END IF;
  IF NEW.tenant_id <> OLD.tenant_id THEN
    RAISE EXCEPTION 'financial_years.tenant_id is immutable';
  END IF;
  IF NEW.organization_id <> OLD.organization_id THEN
    RAISE EXCEPTION 'financial_years.organization_id is immutable';
  END IF;
  IF NEW.code <> OLD.code THEN
    RAISE EXCEPTION 'financial_years.code is immutable';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_fy_immutable ON public.financial_years;
CREATE TRIGGER trg_fy_immutable
  BEFORE UPDATE ON public.financial_years
  FOR EACH ROW EXECUTE FUNCTION private.fn_financial_years_guard_immutable();
