-- Phase 2 Gate 1 — Tenant Registry Metadata (backward-compatible, idempotent)

-- Provisioning status enum (registry stores the opaque status only; the
-- Provisioning Engine (Phase 3) owns transitions and infrastructure work).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tenant_provisioning_status') THEN
    CREATE TYPE public.tenant_provisioning_status AS ENUM (
      'not_started',
      'in_progress',
      'provisioned',
      'failed'
    );
  END IF;
END $$;

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS code                     text,
  ADD COLUMN IF NOT EXISTS primary_contact_name     text,
  ADD COLUMN IF NOT EXISTS primary_contact_email    text,
  ADD COLUMN IF NOT EXISTS primary_contact_phone    text,
  ADD COLUMN IF NOT EXISTS billing_email            text,
  ADD COLUMN IF NOT EXISTS primary_domain           text,
  ADD COLUMN IF NOT EXISTS notes                    text,
  ADD COLUMN IF NOT EXISTS provisioning_status      public.tenant_provisioning_status NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS dedicated_database_ref   text,
  ADD COLUMN IF NOT EXISTS subscription_ref         text;

-- Case-insensitive uniqueness on code (only when supplied).
CREATE UNIQUE INDEX IF NOT EXISTS tenants_code_unique_ci
  ON public.tenants (lower(code))
  WHERE code IS NOT NULL;

-- Case-insensitive uniqueness on primary_domain (only when supplied).
CREATE UNIQUE INDEX IF NOT EXISTS tenants_primary_domain_unique_ci
  ON public.tenants (lower(primary_domain))
  WHERE primary_domain IS NOT NULL;

-- Search + filter + stats indexes.
CREATE INDEX IF NOT EXISTS tenants_display_name_lower_idx
  ON public.tenants (lower(display_name));
CREATE INDEX IF NOT EXISTS tenants_lifecycle_state_idx
  ON public.tenants (lifecycle_state);
CREATE INDEX IF NOT EXISTS tenants_provisioning_status_idx
  ON public.tenants (provisioning_status);
CREATE INDEX IF NOT EXISTS tenants_created_at_id_idx
  ON public.tenants (created_at DESC, id DESC);

-- Preserve grants (re-issue, do not widen). authenticated already has
-- SELECT/INSERT/UPDATE via existing policies; keep them explicit here.
GRANT SELECT, INSERT, UPDATE ON public.tenants TO authenticated;
GRANT ALL ON public.tenants TO service_role;

COMMENT ON COLUMN public.tenants.code IS
  'Short business code (case-insensitive unique). Registry metadata only.';
COMMENT ON COLUMN public.tenants.provisioning_status IS
  'Opaque status surfaced by the Provisioning Engine (Phase 3). Registry does not orchestrate.';
COMMENT ON COLUMN public.tenants.dedicated_database_ref IS
  'Opaque handle owned by the Provisioning Engine (Phase 3). Registry stores only.';
COMMENT ON COLUMN public.tenants.subscription_ref IS
  'Opaque handle owned by Billing/Subscriptions. Registry stores only.';