-- Gate 3.8 · Pass 3.8.2 — tenant onboarding workflow persistence (read-only pass)

CREATE TABLE public.tenant_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'not_started',
  version integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  started_by uuid,
  blocked_at timestamptz,
  blocked_reason_code text,
  blocked_reason_summary text,
  ready_at timestamptz,
  activated_at timestamptz,
  activated_by uuid,
  cancelled_at timestamptz,
  cancelled_by uuid,
  cancellation_reason text,
  last_readiness_checked_at timestamptz,
  last_correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tenant_onboarding_tenant_unique UNIQUE (tenant_id),
  CONSTRAINT tenant_onboarding_parent_key UNIQUE (id, tenant_id),
  CONSTRAINT tenant_onboarding_state_check CHECK (
    state IN ('not_started','in_progress','blocked','ready_for_activation','activated','cancelled')
  ),
  CONSTRAINT tenant_onboarding_activated_consistency CHECK (
    (activated_at IS NULL) OR (state = 'activated')
  ),
  CONSTRAINT tenant_onboarding_cancelled_consistency CHECK (
    (cancelled_at IS NULL) OR (state = 'cancelled')
  ),
  CONSTRAINT tenant_onboarding_reason_len CHECK (
    (cancellation_reason IS NULL OR char_length(cancellation_reason) <= 500)
    AND (blocked_reason_summary IS NULL OR char_length(blocked_reason_summary) <= 500)
  )
);

CREATE INDEX tenant_onboarding_state_idx ON public.tenant_onboarding (state);
CREATE INDEX tenant_onboarding_updated_at_idx ON public.tenant_onboarding (updated_at DESC);

GRANT SELECT ON public.tenant_onboarding TO authenticated;
GRANT ALL ON public.tenant_onboarding TO service_role;

ALTER TABLE public.tenant_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_onboarding_select_platform_admin
  ON public.tenant_onboarding FOR SELECT TO authenticated
  USING (private.fn_has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER tenant_onboarding_set_updated_at
  BEFORE UPDATE ON public.tenant_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


CREATE TABLE public.tenant_onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_onboarding_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  step_key text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  attempt_count integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  blocked_at timestamptz,
  failure_code text,
  failure_summary text,
  correlation_id text,
  updated_by uuid,
  version integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tenant_onboarding_steps_parent_fk
    FOREIGN KEY (tenant_onboarding_id, tenant_id)
    REFERENCES public.tenant_onboarding (id, tenant_id) ON DELETE CASCADE,
  CONSTRAINT tenant_onboarding_steps_unique UNIQUE (tenant_id, step_key),
  CONSTRAINT tenant_onboarding_steps_key_check CHECK (
    step_key IN (
      'provisioning_verified','organization_profile','primary_branch',
      'tenant_admin_invitation','tenant_admin_membership','roles_assigned',
      'required_settings','financial_year','readiness_validation','activation'
    )
  ),
  CONSTRAINT tenant_onboarding_steps_status_check CHECK (
    status IN ('not_started','in_progress','completed','blocked','failed','skipped')
  ),
  CONSTRAINT tenant_onboarding_steps_summary_len CHECK (
    failure_summary IS NULL OR char_length(failure_summary) <= 500
  )
);

CREATE INDEX tenant_onboarding_steps_parent_idx
  ON public.tenant_onboarding_steps (tenant_onboarding_id);
CREATE INDEX tenant_onboarding_steps_status_idx
  ON public.tenant_onboarding_steps (status);

GRANT SELECT ON public.tenant_onboarding_steps TO authenticated;
GRANT ALL ON public.tenant_onboarding_steps TO service_role;

ALTER TABLE public.tenant_onboarding_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_onboarding_steps_select_platform_admin
  ON public.tenant_onboarding_steps FOR SELECT TO authenticated
  USING (private.fn_has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER tenant_onboarding_steps_set_updated_at
  BEFORE UPDATE ON public.tenant_onboarding_steps
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();