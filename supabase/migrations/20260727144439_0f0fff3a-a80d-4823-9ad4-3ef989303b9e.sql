-- SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.5
-- Tenant readiness evaluator + guarded activation (canonical activation writer).

/* ------------------------------------------------------------------ D1-A --
   Database-owned authority for required-settings readiness impact.
   `required-settings.registry.ts` no longer owns this rule.                */

ALTER TABLE public.setting_definitions
  ADD COLUMN IF NOT EXISTS readiness_impact text NOT NULL DEFAULT 'none';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'setting_definitions_readiness_impact_check'
  ) THEN
    ALTER TABLE public.setting_definitions
      ADD CONSTRAINT setting_definitions_readiness_impact_check
      CHECK (readiness_impact IN ('block', 'warning', 'none'));
  END IF;
END $$;

UPDATE public.setting_definitions
   SET readiness_impact = 'block'
 WHERE key IN (
   'platform.locale.default_timezone',
   'platform.locale.default_language',
   'platform.branding.product_name'
 )
   AND readiness_impact <> 'block';

/* ------------------------------------------- readiness snapshot columns -- */

ALTER TABLE public.tenant_onboarding
  ADD COLUMN IF NOT EXISTS readiness_snapshot            jsonb,
  ADD COLUMN IF NOT EXISTS readiness_status              text,
  ADD COLUMN IF NOT EXISTS readiness_blocking_count      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS readiness_warning_count       integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS readiness_applicable_count    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS readiness_workflow_version    integer,
  ADD COLUMN IF NOT EXISTS readiness_contract_version    text,
  ADD COLUMN IF NOT EXISTS readiness_evaluated_by        uuid,
  ADD COLUMN IF NOT EXISTS readiness_fingerprint         text,
  ADD COLUMN IF NOT EXISTS warnings_acknowledged_at      timestamptz,
  ADD COLUMN IF NOT EXISTS warnings_acknowledged_by      uuid;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenant_onboarding_readiness_status_check') THEN
    ALTER TABLE public.tenant_onboarding
      ADD CONSTRAINT tenant_onboarding_readiness_status_check
      CHECK (readiness_status IS NULL OR readiness_status IN ('not_ready','ready_with_warnings','ready'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tenant_onboarding_readiness_counts_check') THEN
    ALTER TABLE public.tenant_onboarding
      ADD CONSTRAINT tenant_onboarding_readiness_counts_check
      CHECK (readiness_blocking_count >= 0
             AND readiness_warning_count >= 0
             AND readiness_applicable_count >= 0);
  END IF;
END $$;

/* ------------------------------------------------- read-only evaluator --- */

CREATE OR REPLACE FUNCTION private.fn_onboarding_evaluate_readiness_json(
  _tenant_id uuid,
  _correlation_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_now            timestamptz := now();
  v_tenant         public.tenants%ROWTYPE;
  v_onb            public.tenant_onboarding%ROWTYPE;
  v_org            public.organizations%ROWTYPE;
  v_profile        public.organization_profiles%ROWTYPE;
  v_branch_count   integer := 0;
  v_prov_state     text;
  v_inv            public.organization_invitations%ROWTYPE;
  v_mem            public.organization_members%ROWTYPE;
  v_role_key       text;
  v_role_granted   boolean := false;
  v_missing_keys   text[] := ARRAY[]::text[];
  v_open_steps     integer := 0;
  v_lock_free      boolean;
  v_checks         jsonb := '[]'::jsonb;
  v_blocking       integer := 0;
  v_warning        integer := 0;
  v_applicable     integer := 0;
  v_overall        text;
  v_fingerprint    text;
  v_payload        text;

  -- appends one check to the accumulator
  PROCEDURE_placeholder boolean;
BEGIN
  SELECT * INTO v_tenant FROM public.tenants
   WHERE id = _tenant_id AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_onb FROM public.tenant_onboarding WHERE tenant_id = _tenant_id;

  SELECT * INTO v_org FROM public.organizations
   WHERE tenant_id = _tenant_id AND is_default AND deleted_at IS NULL
   ORDER BY created_at ASC LIMIT 1;

  IF v_org.id IS NOT NULL THEN
    SELECT * INTO v_profile FROM public.organization_profiles
     WHERE organization_id = v_org.id LIMIT 1;

    SELECT count(*) INTO v_branch_count FROM public.branches
     WHERE tenant_id = _tenant_id
       AND organization_id = v_org.id
       AND is_default
       AND lifecycle_state = 'active';

    SELECT * INTO v_inv FROM public.organization_invitations i
     WHERE i.organization_id = v_org.id
       AND i.role::text IN ('owner','admin')
     ORDER BY (i.status = 'accepted') DESC,
              (i.status = 'pending' AND i.expires_at > v_now) DESC,
              i.created_at DESC
     LIMIT 1;

    IF v_inv.id IS NOT NULL AND v_inv.accepted_by IS NOT NULL THEN
      SELECT * INTO v_mem FROM public.organization_members m
       WHERE m.organization_id = v_org.id
         AND m.user_id = v_inv.accepted_by
         AND m.deleted_at IS NULL
       LIMIT 1;

      v_role_key := public.fn_onboarding_admin_role_key(v_inv.role::text);
      SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
          JOIN public.roles r ON r.id = ur.role_id
         WHERE ur.user_id = v_inv.accepted_by
           AND ur.organization_id = v_org.id
           AND ur.deleted_at IS NULL
           AND r.key = v_role_key
      ) INTO v_role_granted;
    END IF;

    SELECT COALESCE(array_agg(d.key ORDER BY d.key), ARRAY[]::text[])
      INTO v_missing_keys
      FROM public.setting_definitions d
     WHERE d.readiness_impact = 'block'
       AND d.deprecated_at IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM public.setting_values sv
          WHERE sv.definition_id = d.id
            AND sv.organization_id = v_org.id
            AND sv.value IS NOT NULL
            AND sv.value <> 'null'::jsonb
       );
  END IF;

  SELECT j.state::text INTO v_prov_state
    FROM public.provisioning_jobs j
   WHERE j.tenant_id = _tenant_id
   ORDER BY j.created_at DESC
   LIMIT 1;

  SELECT count(*) INTO v_open_steps
    FROM public.tenant_onboarding_steps s
   WHERE s.tenant_id = _tenant_id
     AND s.step_key NOT IN ('readiness_validation', 'activation')
     AND s.status NOT IN ('completed', 'skipped');

  v_lock_free := pg_try_advisory_xact_lock(hashtextextended(_tenant_id::text, 0));

  /* --------------------------------------------------------- 14 checks -- */
  v_checks := jsonb_build_array(
    private.fn_onboarding_readiness_check(
      'provisioning_completed', 'Provisioning completed', 'mandatory',
      CASE WHEN v_tenant.provisioning_status::text = 'provisioned' THEN 'pass' ELSE 'blocked' END,
      'platform/provisioning', 'provisioning_verified',
      CASE WHEN v_tenant.provisioning_status::text = 'provisioned' THEN 'provisioning_verified'
           ELSE 'provisioning_incomplete' END,
      jsonb_build_object('provisioningStatus', COALESCE(v_tenant.provisioning_status::text, 'unknown'),
                         'jobState', COALESCE(v_prov_state, 'none')),
      v_now),

    private.fn_onboarding_readiness_check(
      'tenant_lifecycle_eligible', 'Tenant lifecycle allows activation', 'mandatory',
      CASE WHEN v_tenant.lifecycle_state::text IN ('created', 'active') THEN 'pass' ELSE 'blocked' END,
      'platform/tenants', NULL,
      CASE WHEN v_tenant.lifecycle_state::text IN ('created', 'active') THEN 'lifecycle_eligible'
           ELSE 'lifecycle_state_blocks' END,
      jsonb_build_object('lifecycleState', v_tenant.lifecycle_state::text),
      v_now),

    private.fn_onboarding_readiness_check(
      'no_pending_deletion', 'No deletion scheduled', 'mandatory',
      CASE WHEN v_tenant.deletion_scheduled_at IS NULL THEN 'pass' ELSE 'blocked' END,
      'platform/tenants', NULL,
      CASE WHEN v_tenant.deletion_scheduled_at IS NULL THEN 'no_deletion_scheduled'
           ELSE 'deletion_scheduled' END,
      '{}'::jsonb, v_now),

    private.fn_onboarding_readiness_check(
      'default_organization_present', 'Default organization exists', 'mandatory',
      CASE WHEN v_org.id IS NOT NULL THEN 'pass' ELSE 'blocked' END,
      'platform/organizations', 'organization_profile',
      CASE WHEN v_org.id IS NOT NULL THEN 'default_organization_present'
           ELSE 'default_organization_missing' END,
      '{}'::jsonb, v_now),

    private.fn_onboarding_readiness_check(
      'organization_profile_complete', 'Organization profile complete', 'mandatory',
      CASE
        WHEN v_org.id IS NULL THEN 'blocked'
        WHEN v_profile.id IS NOT NULL
             AND COALESCE(btrim(v_profile.legal_name), '') <> ''
             AND COALESCE(btrim(v_profile.country), '') <> '' THEN 'pass'
        ELSE 'blocked'
      END,
      'platform/organizations', 'organization_profile',
      CASE
        WHEN v_org.id IS NULL THEN 'default_organization_missing'
        WHEN v_profile.id IS NULL THEN 'organization_profile_missing'
        WHEN COALESCE(btrim(v_profile.legal_name), '') = '' THEN 'organization_profile_incomplete'
        WHEN COALESCE(btrim(v_profile.country), '') = '' THEN 'organization_profile_incomplete'
        ELSE 'organization_profile_complete'
      END,
      '{}'::jsonb, v_now),

    private.fn_onboarding_readiness_check(
      'primary_branch_present', 'Primary branch exists', 'mandatory',
      CASE WHEN v_branch_count > 0 THEN 'pass' ELSE 'blocked' END,
      'platform/branches', 'primary_branch',
      CASE WHEN v_branch_count > 0 THEN 'primary_branch_present' ELSE 'primary_branch_missing' END,
      jsonb_build_object('branchCount', v_branch_count), v_now),

    private.fn_onboarding_readiness_check(
      'admin_invitation_present', 'Administrator invitation issued', 'mandatory',
      CASE
        WHEN v_inv.id IS NULL THEN 'blocked'
        WHEN v_inv.status = 'accepted' THEN 'pass'
        WHEN v_inv.status = 'pending' AND v_inv.expires_at > v_now THEN 'pass'
        ELSE 'blocked'
      END,
      'platform/invitations', 'tenant_admin_invitation',
      CASE
        WHEN v_inv.id IS NULL THEN 'invitation_missing'
        WHEN v_inv.status = 'accepted' THEN 'invitation_accepted'
        WHEN v_inv.status = 'pending' AND v_inv.expires_at > v_now THEN 'invitation_pending'
        WHEN v_inv.status = 'pending' THEN 'invitation_expired'
        ELSE 'invitation_' || v_inv.status
      END,
      jsonb_build_object('invitationStatus', COALESCE(v_inv.status, 'none')), v_now),

    private.fn_onboarding_readiness_check(
      'admin_invitation_accepted', 'Administrator invitation accepted', 'warning',
      CASE
        WHEN v_inv.id IS NOT NULL AND v_inv.status = 'accepted' THEN 'pass'
        ELSE 'warning'
      END,
      'platform/invitations', 'tenant_admin_invitation',
      CASE
        WHEN v_inv.id IS NOT NULL AND v_inv.status = 'accepted' THEN 'invitation_accepted'
        ELSE 'invitation_not_accepted'
      END,
      jsonb_build_object('invitationStatus', COALESCE(v_inv.status, 'none')), v_now),

    private.fn_onboarding_readiness_check(
      'admin_membership_active', 'Administrator membership active', 'conditional',
      CASE
        WHEN v_inv.id IS NULL OR v_inv.status <> 'accepted' THEN 'not_applicable'
        WHEN v_mem.id IS NOT NULL AND v_mem.status::text = 'active' THEN 'pass'
        ELSE 'blocked'
      END,
      'platform/memberships', 'tenant_admin_membership',
      CASE
        WHEN v_inv.id IS NULL OR v_inv.status <> 'accepted' THEN 'invitation_not_accepted'
        WHEN v_mem.id IS NULL THEN 'membership_missing'
        WHEN v_mem.status::text <> 'active' THEN 'membership_inactive'
        ELSE 'membership_active'
      END,
      '{}'::jsonb, v_now),

    private.fn_onboarding_readiness_check(
      'admin_role_assigned', 'Administrator role granted', 'conditional',
      CASE
        WHEN v_inv.id IS NULL OR v_inv.status <> 'accepted' THEN 'not_applicable'
        WHEN v_role_granted THEN 'pass'
        ELSE 'blocked'
      END,
      'platform/roles', 'roles_assigned',
      CASE
        WHEN v_inv.id IS NULL OR v_inv.status <> 'accepted' THEN 'invitation_not_accepted'
        WHEN v_role_granted THEN 'admin_role_assigned'
        ELSE 'admin_role_missing'
      END,
      jsonb_build_object('roleKey', COALESCE(v_role_key, 'none')), v_now),

    private.fn_onboarding_readiness_check(
      'required_settings_valid', 'Required settings configured', 'mandatory',
      CASE
        WHEN v_org.id IS NULL THEN 'blocked'
        WHEN array_length(v_missing_keys, 1) IS NULL THEN 'pass'
        ELSE 'blocked'
      END,
      'platform/settings', 'required_settings',
      CASE
        WHEN v_org.id IS NULL THEN 'default_organization_missing'
        WHEN array_length(v_missing_keys, 1) IS NULL THEN 'required_settings_valid'
        ELSE 'required_settings_missing'
      END,
      jsonb_build_object('missingCount', COALESCE(array_length(v_missing_keys, 1), 0)), v_now),

    private.fn_onboarding_readiness_check(
      'financial_year_present', 'Financial year configured', 'conditional',
      'not_applicable',
      'platform/financial-years', 'financial_year',
      'no_authoritative_trigger',
      '{}'::jsonb, v_now),

    private.fn_onboarding_readiness_check(
      'onboarding_steps_complete', 'All onboarding steps complete', 'mandatory',
      CASE WHEN v_onb.id IS NULL THEN 'blocked'
           WHEN v_open_steps = 0 THEN 'pass' ELSE 'blocked' END,
      'platform/onboarding', NULL,
      CASE WHEN v_onb.id IS NULL THEN 'workflow_not_started'
           WHEN v_open_steps = 0 THEN 'steps_complete' ELSE 'steps_incomplete' END,
      jsonb_build_object('openStepCount', v_open_steps), v_now),

    private.fn_onboarding_readiness_check(
      'no_concurrent_activation', 'No activation in flight', 'mandatory',
      CASE WHEN v_lock_free THEN 'pass' ELSE 'blocked' END,
      'platform/onboarding', 'activation',
      CASE WHEN v_lock_free THEN 'no_activation_in_flight' ELSE 'activation_in_flight' END,
      '{}'::jsonb, v_now)
  );

  SELECT
    count(*) FILTER (WHERE c->>'status' = 'blocked'),
    count(*) FILTER (WHERE c->>'status' = 'warning'),
    count(*) FILTER (WHERE c->>'status' <> 'not_applicable')
  INTO v_blocking, v_warning, v_applicable
  FROM jsonb_array_elements(v_checks) AS c;

  v_overall := CASE
    WHEN v_blocking > 0 THEN 'not_ready'
    WHEN v_warning  > 0 THEN 'ready_with_warnings'
    ELSE 'ready' END;

  SELECT COALESCE(
           string_agg((c->>'checkKey') || ':' || (c->>'status') || ':' || (c->>'reasonCode'),
                      '|' ORDER BY c->>'checkKey'),
           '')
    INTO v_payload
    FROM jsonb_array_elements(v_checks) AS c
   WHERE c->>'status' = 'warning';

  v_fingerprint := CASE
    WHEN v_payload = '' THEN NULL
    ELSE encode(sha256(convert_to(v_payload, 'UTF8')), 'hex') END;

  RETURN jsonb_build_object(
    'tenant_id',                 _tenant_id,
    'evaluated_at',              v_now,
    'overall_status',            v_overall,
    'contract_version',          '3.8.5',
    'observed_workflow_version', v_onb.version,
    'checks',                    v_checks,
    'blocking_count',            v_blocking,
    'warning_count',             v_warning,
    'applicable_count',          v_applicable,
    'warning_fingerprint',       v_fingerprint,
    'correlation_id',            _correlation_id
  );
END $$;

REVOKE ALL ON FUNCTION private.fn_onboarding_evaluate_readiness_json(uuid, text) FROM PUBLIC, anon;

/* -------------------------------------------------- check row builder ---- */

CREATE OR REPLACE FUNCTION private.fn_onboarding_readiness_check(
  _key text, _label text, _classification text, _status text,
  _owning_module text, _step_key text, _reason_code text,
  _reason_params jsonb, _evaluated_at timestamptz
) RETURNS jsonb
LANGUAGE sql IMMUTABLE
SET search_path TO 'pg_catalog', 'public'
AS $$
  SELECT jsonb_build_object(
    'checkKey',       _key,
    'label',          _label,
    'classification', _classification,
    'status',         _status,
    'owningModule',   _owning_module,
    'stepKey',        _step_key,
    'reasonCode',     _reason_code,
    'reasonParams',   COALESCE(_reason_params, '{}'::jsonb),
    'explanation',    _label,
    'deepLink',       NULL,
    'evaluatedAt',    _evaluated_at
  );
$$;

REVOKE ALL ON FUNCTION private.fn_onboarding_readiness_check(
  text, text, text, text, text, text, text, jsonb, timestamptz) FROM PUBLIC, anon;

/* ------------------------------------------------ public read-only RPC --- */

CREATE OR REPLACE FUNCTION public.fn_onboarding_evaluate_readiness(
  _tenant_id uuid,
  _correlation_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
BEGIN
  IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.read') THEN
    RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
  END IF;
  -- READ-ONLY: no snapshot persistence, no audit write.
  RETURN private.fn_onboarding_evaluate_readiness_json(_tenant_id, _correlation_id);
END $$;

REVOKE ALL ON FUNCTION public.fn_onboarding_evaluate_readiness(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_onboarding_evaluate_readiness(uuid, text) TO authenticated;

/* ------------------------------------------- explicit persist command ---- */

CREATE OR REPLACE FUNCTION public.fn_onboarding_persist_readiness(
  _tenant_id uuid,
  _correlation_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.update') THEN
    RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
  END IF;

  v_result := private.fn_onboarding_evaluate_readiness_json(_tenant_id, _correlation_id);

  UPDATE public.tenant_onboarding
     SET readiness_snapshot         = v_result,
         readiness_status           = v_result->>'overall_status',
         readiness_blocking_count   = (v_result->>'blocking_count')::integer,
         readiness_warning_count    = (v_result->>'warning_count')::integer,
         readiness_applicable_count = (v_result->>'applicable_count')::integer,
         readiness_workflow_version = version,
         readiness_contract_version = v_result->>'contract_version',
         readiness_evaluated_by     = auth.uid(),
         readiness_fingerprint      = v_result->>'warning_fingerprint',
         ready_at                   = CASE WHEN v_result->>'overall_status' <> 'not_ready'
                                           THEN COALESCE(ready_at, now()) ELSE NULL END,
         last_readiness_checked_at  = now(),
         last_correlation_id        = COALESCE(_correlation_id, last_correlation_id)
   WHERE tenant_id = _tenant_id;

  BEGIN
    INSERT INTO public.audit_logs(action, entity_type, entity_id, actor_id, new_values, occurred_at)
    VALUES ('tenant_onboarding.readiness_evaluated', 'tenant_onboarding', _tenant_id, auth.uid(),
            jsonb_build_object(
              'overall_status',  v_result->>'overall_status',
              'blocking_count',  v_result->>'blocking_count',
              'warning_count',   v_result->>'warning_count',
              'correlation_id',  _correlation_id),
            now());
  EXCEPTION WHEN OTHERS THEN
    NULL; -- audit is observational
  END;

  RETURN v_result;
END $$;

REVOKE ALL ON FUNCTION public.fn_onboarding_persist_readiness(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_onboarding_persist_readiness(uuid, text) TO authenticated;

/* ------------------------------- canonical guarded activation writer ----- */

CREATE OR REPLACE FUNCTION public.fn_onboarding_activate_tenant(
  _tenant_id uuid,
  _expected_version integer DEFAULT NULL,
  _acknowledge_warnings boolean DEFAULT false,
  _correlation_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_onb        public.tenant_onboarding%ROWTYPE;
  v_tenant     public.tenants%ROWTYPE;
  v_result     jsonb;
  v_blocking   integer;
  v_warning    integer;
  v_finger     text;
  v_applied    boolean := false;
  v_version    integer;
BEGIN
  IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.activate') THEN
    RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
  END IF;

  IF _correlation_id IS NOT NULL AND length(_correlation_id) > 128 THEN
    RAISE EXCEPTION 'correlationId too long' USING ERRCODE = '22023';
  END IF;

  -- Serialize activation attempts for this tenant. Re-entrant within the
  -- transaction, so the evaluator's try-lock probe still succeeds here.
  PERFORM pg_advisory_xact_lock(hashtextextended(_tenant_id::text, 0));

  SELECT * INTO v_tenant FROM public.tenants
   WHERE id = _tenant_id AND deleted_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_onb FROM public.tenant_onboarding
   WHERE tenant_id = _tenant_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Onboarding workflow not started' USING ERRCODE = 'P0002';
  END IF;

  -- Idempotent replay: no writes, no version bump.
  IF v_onb.state = 'activated' THEN
    RETURN jsonb_build_object(
      'tenant_id', _tenant_id, 'state', v_onb.state,
      'activated_at', v_onb.activated_at, 'version', v_onb.version,
      'lifecycle_transition_applied', false, 'idempotent_replay', true,
      'blocking_count', v_onb.readiness_blocking_count,
      'warning_count', v_onb.readiness_warning_count,
      'warning_fingerprint', v_onb.readiness_fingerprint,
      'warnings_acknowledged', v_onb.warnings_acknowledged_at IS NOT NULL,
      'correlation_id', _correlation_id);
  END IF;

  IF _expected_version IS NOT NULL AND v_onb.version <> _expected_version THEN
    RAISE EXCEPTION 'version conflict on tenant onboarding' USING ERRCODE = '40001';
  END IF;

  IF v_tenant.lifecycle_state::text NOT IN ('created', 'active') THEN
    RAISE EXCEPTION 'tenant lifecycle state blocks activation' USING ERRCODE = 'P384B';
  END IF;

  -- Fresh, in-transaction re-evaluation. Never trusted from the client.
  v_result   := private.fn_onboarding_evaluate_readiness_json(_tenant_id, _correlation_id);
  v_blocking := (v_result->>'blocking_count')::integer;
  v_warning  := (v_result->>'warning_count')::integer;
  v_finger   := v_result->>'warning_fingerprint';

  IF v_blocking > 0 THEN
    RAISE EXCEPTION 'tenant is not ready for activation' USING ERRCODE = 'P3848';
  END IF;

  IF v_warning > 0 AND NOT COALESCE(_acknowledge_warnings, false) THEN
    RAISE EXCEPTION 'warning acknowledgement required' USING ERRCODE = 'P3849';
  END IF;

  IF v_tenant.lifecycle_state::text = 'created' THEN
    PERFORM private.fn_assert_lifecycle_transition(v_tenant.lifecycle_state, 'active'::public.tenant_lifecycle_state);
    UPDATE public.tenants
       SET lifecycle_state = 'active',
           activated_at    = COALESCE(activated_at, now())
     WHERE id = _tenant_id;
    v_applied := true;
  END IF;

  INSERT INTO public.tenant_onboarding_steps AS s
    (tenant_onboarding_id, tenant_id, step_key, status, attempt_count,
     started_at, completed_at, correlation_id, updated_by, version)
  VALUES
    (v_onb.id, _tenant_id, 'activation', 'completed', 1,
     now(), now(), _correlation_id, auth.uid(), 1)
  ON CONFLICT (tenant_id, step_key) DO UPDATE
     SET status        = 'completed',
         attempt_count = s.attempt_count + 1,
         started_at    = COALESCE(s.started_at, now()),
         completed_at  = now(),
         failure_code  = NULL,
         failure_summary = NULL,
         correlation_id = COALESCE(EXCLUDED.correlation_id, s.correlation_id),
         updated_by    = auth.uid(),
         version       = s.version + 1;

  UPDATE public.tenant_onboarding
     SET state                      = 'activated',
         version                    = version + 1,
         ready_at                   = COALESCE(ready_at, now()),
         activated_at               = now(),
         activated_by               = auth.uid(),
         readiness_snapshot         = v_result,
         readiness_status           = v_result->>'overall_status',
         readiness_blocking_count   = v_blocking,
         readiness_warning_count    = v_warning,
         readiness_applicable_count = (v_result->>'applicable_count')::integer,
         readiness_workflow_version = version,
         readiness_contract_version = v_result->>'contract_version',
         readiness_evaluated_by     = auth.uid(),
         readiness_fingerprint      = v_finger,
         warnings_acknowledged_at   = CASE WHEN v_warning > 0 THEN now() ELSE NULL END,
         warnings_acknowledged_by   = CASE WHEN v_warning > 0 THEN auth.uid() ELSE NULL END,
         last_readiness_checked_at  = now(),
         last_correlation_id        = COALESCE(_correlation_id, last_correlation_id)
   WHERE tenant_id = _tenant_id
  RETURNING version INTO v_version;

  BEGIN
    INSERT INTO public.audit_logs(action, entity_type, entity_id, actor_id, new_values, occurred_at)
    VALUES ('tenant_onboarding.activated', 'tenant_onboarding', _tenant_id, auth.uid(),
            jsonb_build_object(
              'overall_status',      v_result->>'overall_status',
              'warning_count',       v_warning,
              'warning_fingerprint', v_finger,
              'lifecycle_transition_applied', v_applied,
              'correlation_id',      _correlation_id),
            now());
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN jsonb_build_object(
    'tenant_id', _tenant_id, 'state', 'activated',
    'activated_at', now(), 'version', v_version,
    'lifecycle_transition_applied', v_applied, 'idempotent_replay', false,
    'blocking_count', v_blocking, 'warning_count', v_warning,
    'warning_fingerprint', v_finger,
    'warnings_acknowledged', v_warning > 0,
    'correlation_id', _correlation_id);
END $$;

REVOKE ALL ON FUNCTION public.fn_onboarding_activate_tenant(uuid, integer, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_onboarding_activate_tenant(uuid, integer, boolean, text) TO authenticated;