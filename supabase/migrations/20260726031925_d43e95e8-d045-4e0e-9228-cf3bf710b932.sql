-- SPR-MOD-001-002 · Phase 3 Gate 3.1 — Provisioning Domain Foundation
-- Platform database only. No tenant-database objects.

-- 1. Job state enum (mirrors src/lib/provisioning/lifecycle.ts)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provisioning_job_state') THEN
    CREATE TYPE public.provisioning_job_state AS ENUM (
      'pending',
      'validating',
      'queued',
      'provisioning_infrastructure',
      'running_migrations',
      'seeding',
      'creating_admin',
      'verifying',
      'completed',
      'failed',
      'retrying',
      'rolled_back',
      'cancelled'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provisioning_step_status') THEN
    CREATE TYPE public.provisioning_step_status AS ENUM (
      'pending',
      'running',
      'succeeded',
      'failed',
      'skipped',
      'rolled_back'
    );
  END IF;
END
$$;

-- 2. provisioning_jobs
CREATE TABLE IF NOT EXISTS public.provisioning_jobs (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  state                       public.provisioning_job_state NOT NULL DEFAULT 'pending',
  current_step_key            text,
  attempt_count               integer NOT NULL DEFAULT 0,
  correlation_id              text NOT NULL,
  provider_key                text NOT NULL DEFAULT 'unassigned',
  provider_resource_reference jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_error                  jsonb,
  started_at                  timestamptz,
  last_transition_at          timestamptz NOT NULL DEFAULT now(),
  completed_at                timestamptz,
  created_by                  uuid,
  updated_by                  uuid,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.provisioning_jobs TO authenticated;
GRANT ALL ON public.provisioning_jobs TO service_role;

ALTER TABLE public.provisioning_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS provisioning_jobs_select_platform_admin ON public.provisioning_jobs;
CREATE POLICY provisioning_jobs_select_platform_admin
  ON public.provisioning_jobs FOR SELECT TO authenticated
  USING (private.fn_has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS provisioning_jobs_insert_platform_admin ON public.provisioning_jobs;
CREATE POLICY provisioning_jobs_insert_platform_admin
  ON public.provisioning_jobs FOR INSERT TO authenticated
  WITH CHECK (private.fn_has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS provisioning_jobs_update_platform_admin ON public.provisioning_jobs;
CREATE POLICY provisioning_jobs_update_platform_admin
  ON public.provisioning_jobs FOR UPDATE TO authenticated
  USING (private.fn_has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.fn_has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS provisioning_jobs_state_idx          ON public.provisioning_jobs (state);
CREATE INDEX IF NOT EXISTS provisioning_jobs_tenant_id_idx      ON public.provisioning_jobs (tenant_id);
CREATE INDEX IF NOT EXISTS provisioning_jobs_correlation_id_idx ON public.provisioning_jobs (correlation_id);

-- At most one non-terminal job per tenant
CREATE UNIQUE INDEX IF NOT EXISTS provisioning_jobs_one_active_per_tenant_idx
  ON public.provisioning_jobs (tenant_id)
  WHERE state NOT IN ('completed', 'failed', 'rolled_back', 'cancelled');

DROP TRIGGER IF EXISTS trg_provisioning_jobs_updated_at ON public.provisioning_jobs;
CREATE TRIGGER trg_provisioning_jobs_updated_at
  BEFORE UPDATE ON public.provisioning_jobs
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 3. provisioning_steps
CREATE TABLE IF NOT EXISTS public.provisioning_steps (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id         uuid NOT NULL REFERENCES public.provisioning_jobs(id) ON DELETE CASCADE,
  step_key       text NOT NULL,
  sequence       integer NOT NULL,
  status         public.provisioning_step_status NOT NULL DEFAULT 'pending',
  attempt_count  integer NOT NULL DEFAULT 0,
  correlation_id text NOT NULL,
  error          jsonb,
  started_at     timestamptz,
  completed_at   timestamptz,
  duration_ms    integer,
  created_by     uuid,
  updated_by     uuid,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, step_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.provisioning_steps TO authenticated;
GRANT ALL ON public.provisioning_steps TO service_role;

ALTER TABLE public.provisioning_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS provisioning_steps_select_platform_admin ON public.provisioning_steps;
CREATE POLICY provisioning_steps_select_platform_admin
  ON public.provisioning_steps FOR SELECT TO authenticated
  USING (private.fn_has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS provisioning_steps_insert_platform_admin ON public.provisioning_steps;
CREATE POLICY provisioning_steps_insert_platform_admin
  ON public.provisioning_steps FOR INSERT TO authenticated
  WITH CHECK (private.fn_has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS provisioning_steps_update_platform_admin ON public.provisioning_steps;
CREATE POLICY provisioning_steps_update_platform_admin
  ON public.provisioning_steps FOR UPDATE TO authenticated
  USING (private.fn_has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.fn_has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS provisioning_steps_job_id_idx         ON public.provisioning_steps (job_id);
CREATE INDEX IF NOT EXISTS provisioning_steps_status_idx         ON public.provisioning_steps (status);
CREATE INDEX IF NOT EXISTS provisioning_steps_correlation_id_idx ON public.provisioning_steps (correlation_id);

DROP TRIGGER IF EXISTS trg_provisioning_steps_updated_at ON public.provisioning_steps;
CREATE TRIGGER trg_provisioning_steps_updated_at
  BEFORE UPDATE ON public.provisioning_steps
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- Auto-compute duration_ms on completion
CREATE OR REPLACE FUNCTION private.fn_provisioning_step_duration()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_ms := GREATEST(0, (EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000)::integer);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_provisioning_steps_duration ON public.provisioning_steps;
CREATE TRIGGER trg_provisioning_steps_duration
  BEFORE INSERT OR UPDATE ON public.provisioning_steps
  FOR EACH ROW EXECUTE FUNCTION private.fn_provisioning_step_duration();

-- 4. D1 mitigation — tenants.provisioning_status is DERIVED from the job, never written by app code.
CREATE OR REPLACE FUNCTION private.fn_derive_tenant_provisioning_status(_state public.provisioning_job_state)
RETURNS public.tenant_provisioning_status
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _state
    WHEN 'completed'   THEN 'provisioned'::public.tenant_provisioning_status
    WHEN 'failed'      THEN 'failed'::public.tenant_provisioning_status
    WHEN 'rolled_back' THEN 'failed'::public.tenant_provisioning_status
    WHEN 'cancelled'   THEN 'not_started'::public.tenant_provisioning_status
    WHEN 'pending'     THEN 'not_started'::public.tenant_provisioning_status
    ELSE 'in_progress'::public.tenant_provisioning_status
  END;
$$;

CREATE OR REPLACE FUNCTION private.fn_sync_tenant_provisioning_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.state IS DISTINCT FROM OLD.state THEN
    NEW.last_transition_at := now();
  END IF;

  UPDATE public.tenants
     SET provisioning_status = private.fn_derive_tenant_provisioning_status(NEW.state)
   WHERE id = NEW.tenant_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_provisioning_jobs_sync_tenant_status ON public.provisioning_jobs;
CREATE TRIGGER trg_provisioning_jobs_sync_tenant_status
  BEFORE INSERT OR UPDATE OF state ON public.provisioning_jobs
  FOR EACH ROW EXECUTE FUNCTION private.fn_sync_tenant_provisioning_status();

COMMENT ON COLUMN public.tenants.provisioning_status IS
  'DERIVED COLUMN (ADR-018 / risk D1). Maintained exclusively by trg_provisioning_jobs_sync_tenant_status from public.provisioning_jobs.state. Application code MUST NOT write this column directly.';

COMMENT ON TABLE public.provisioning_jobs IS
  'SPR-MOD-001-002 · Phase 3 Gate 3.1. Single source of truth for tenant provisioning state (ADR-018). Domain foundation only — no execution engine in this gate.';

COMMENT ON TABLE public.provisioning_steps IS
  'SPR-MOD-001-002 · Phase 3 Gate 3.1. Per-step ledger for a provisioning job (ADR-018).';
