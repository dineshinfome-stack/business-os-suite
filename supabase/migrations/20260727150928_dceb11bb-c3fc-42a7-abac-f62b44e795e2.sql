-- SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.5B (append-only corrective migration)
-- 1. Canonical readiness check keys / reason codes / deep links (matrix parity).
-- 2. Mandatory _expected_version on the guarded activation writer.
-- The Pass 3.8.5 migration is NOT edited; this migration supersedes it.

/* ---------------------------------------- check row builder (+ deepLink) - */

CREATE OR REPLACE FUNCTION private.fn_onboarding_readiness_check(
  _key text, _label text, _classification text, _status text,
  _owning_module text, _step_key text, _reason_code text,
  _reason_params jsonb, _evaluated_at timestamptz, _deep_link text
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
    'deepLink',       _deep_link,
    'evaluatedAt',    _evaluated_at
  );
$$;

REVOKE ALL ON FUNCTION private.fn_onboarding_readiness_check(
  text, text, text, text, text, text, text, jsonb, timestamptz, text) FROM PUBLIC, anon;

/* ------------------------- canonical readiness evaluator (matrix parity) - */

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
  v_org_any        integer := 0;
  v_branch_default integer := 0;
  v_branch_any     integer := 0;
  v_prov_state     text;
  v_inv            public.organization_invitations%ROWTYPE;
  v_mem            public.organization_members%ROWTYPE;
  v_role_key       text;
  v_role_granted   boolean := false;
  v_missing_keys   text[] := ARRAY[]::text[];
  v_bad_step_key   text;
  v_bad_step_stat  text;
  v_mismatch       text;
  v_lock_free      boolean;
  v_deep_tenant    text;
  v_checks         jsonb;
  v_blocking       integer := 0;
  v_warning        integer := 0;
  v_applicable     integer := 0;
  v_overall        text;
  v_fingerprint    text;
  v_payload        text;
BEGIN
  v_deep_tenant := '/platform/admin/onboarding/' || _tenant_id::text;

  SELECT * INTO v_tenant FROM public.tenants
   WHERE id = _tenant_id AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_onb FROM public.tenant_onboarding WHERE tenant_id = _tenant_id;

  SELECT count(*) INTO v_org_any
    FROM public.organizations
   WHERE tenant_id = _tenant_id AND deleted_at IS NULL;

  SELECT * INTO v_org FROM public.organizations
   WHERE tenant_id = _tenant_id AND is_default AND deleted_at IS NULL
   ORDER BY created_at ASC LIMIT 1;

  IF v_org.id IS NOT NULL THEN
    SELECT count(*) FILTER (WHERE is_default), count(*)
      INTO v_branch_default, v_branch_any
      FROM public.branches
     WHERE tenant_id = _tenant_id
       AND organization_id = v_org.id
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

  SELECT s.step_key, s.status INTO v_bad_step_key, v_bad_step_stat
    FROM public.tenant_onboarding_steps s
   WHERE s.tenant_id = _tenant_id
     AND s.status IN ('failed', 'blocked')
   ORDER BY s.updated_at DESC
   LIMIT 1;

  -- cross-table tenant reference agreement
  IF v_org.id IS NOT NULL AND v_org.tenant_id <> _tenant_id THEN
    v_mismatch := 'organization';
  ELSIF v_org.id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.branches b
       WHERE b.organization_id = v_org.id AND b.tenant_id <> _tenant_id) THEN
    v_mismatch := 'branch';
  ELSIF v_onb.id IS NOT NULL AND v_onb.tenant_id <> _tenant_id THEN
    v_mismatch := 'onboarding';
  ELSIF v_onb.id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.tenant_onboarding_steps s
       WHERE s.tenant_onboarding_id = v_onb.id AND s.tenant_id <> _tenant_id) THEN
    v_mismatch := 'onboarding_step';
  END IF;

  v_lock_free := pg_try_advisory_xact_lock(hashtextextended(_tenant_id::text, 0));

  /* ---------------------------- 14 canonical checks (readiness matrix) -- */
  v_checks := jsonb_build_array(
    private.fn_onboarding_readiness_check(
      'tenant_exists', 'The tenant record exists and is readable', 'mandatory',
      'pass', 'platform/tenants', NULL, 'tenant_exists',
      jsonb_build_object('tenantId', _tenant_id::text), v_now, '/platform/tenants'),

    private.fn_onboarding_readiness_check(
      'provisioning_completed', 'Provisioning finished successfully', 'mandatory',
      CASE
        WHEN v_tenant.provisioning_status::text = 'provisioned' THEN 'pass'
        WHEN v_tenant.provisioning_status::text = 'in_progress' THEN 'warning'
        ELSE 'blocked'
      END,
      'platform/provisioning', 'provisioning_verified',
      CASE WHEN v_tenant.provisioning_status::text = 'provisioned'
           THEN 'provisioning_completed' ELSE 'provisioning_incomplete' END,
      jsonb_build_object('jobState', COALESCE(v_prov_state, 'none'),
                         'provisioningStatus', COALESCE(v_tenant.provisioning_status::text, 'unknown')),
      v_now, '/platform/provisioning'),

    private.fn_onboarding_readiness_check(
      'lifecycle_permits_onboarding', 'Tenant lifecycle state allows onboarding/activation', 'mandatory',
      CASE
        WHEN v_tenant.deletion_scheduled_at IS NOT NULL THEN 'blocked'
        WHEN v_tenant.lifecycle_state::text IN ('created', 'active') THEN 'pass'
        WHEN v_tenant.lifecycle_state::text = 'maintenance' THEN 'warning'
        ELSE 'blocked'
      END,
      'platform/tenant-lifecycle', NULL,
      CASE
        WHEN v_tenant.deletion_scheduled_at IS NOT NULL THEN 'lifecycle_state_blocks'
        WHEN v_tenant.lifecycle_state::text IN ('created', 'active') THEN 'lifecycle_permits_onboarding'
        ELSE 'lifecycle_state_blocks'
      END,
      jsonb_build_object('lifecycleState', v_tenant.lifecycle_state::text), v_now,
      '/platform/tenants'),

    private.fn_onboarding_readiness_check(
      'organization_exists', 'A default organization (company) exists', 'mandatory',
      CASE
        WHEN v_org.id IS NOT NULL THEN 'pass'
        WHEN v_org_any > 0 THEN 'warning'
        ELSE 'blocked'
      END,
      'platform/organizations', 'organization_profile',
      CASE WHEN v_org.id IS NOT NULL THEN 'organization_exists' ELSE 'organization_missing' END,
      jsonb_build_object('organizationCount', v_org_any), v_now, '/platform/companies'),

    private.fn_onboarding_readiness_check(
      'primary_branch_exists', 'A default branch exists for the organization', 'mandatory',
      CASE
        WHEN v_branch_default > 0 THEN 'pass'
        WHEN v_branch_any > 0 THEN 'warning'
        ELSE 'blocked'
      END,
      'platform/branches', 'primary_branch',
      CASE WHEN v_branch_default > 0 THEN 'primary_branch_exists' ELSE 'branch_missing' END,
      jsonb_build_object('organizationId', COALESCE(v_org.id::text, 'none'),
                         'branchCount', v_branch_default), v_now, '/platform/companies'),

    private.fn_onboarding_readiness_check(
      'admin_invitation_valid', 'A valid or accepted administrator invitation exists', 'mandatory',
      CASE
        WHEN v_inv.id IS NULL THEN 'blocked'
        WHEN v_inv.status = 'accepted' THEN 'pass'
        WHEN v_inv.status = 'pending' AND v_inv.expires_at > v_now + interval '48 hours' THEN 'pass'
        WHEN v_inv.status = 'pending' AND v_inv.expires_at > v_now THEN 'warning'
        ELSE 'blocked'
      END,
      'platform/invitations', 'tenant_admin_invitation',
      CASE
        WHEN v_inv.id IS NULL THEN 'invitation_missing'
        WHEN v_inv.status = 'accepted' THEN 'admin_invitation_valid'
        WHEN v_inv.status = 'pending' AND v_inv.expires_at > v_now THEN 'admin_invitation_valid'
        ELSE 'invitation_missing'
      END,
      jsonb_build_object('invitationStatus', COALESCE(v_inv.status, 'none')), v_now,
      v_deep_tenant),

    private.fn_onboarding_readiness_check(
      'admin_invitation_accepted', 'The administrator accepted the invitation', 'warning',
      CASE WHEN v_inv.id IS NOT NULL AND v_inv.status = 'accepted' THEN 'pass' ELSE 'warning' END,
      'platform/invitations', 'tenant_admin_invitation',
      CASE WHEN v_inv.id IS NOT NULL AND v_inv.status = 'accepted'
           THEN 'admin_invitation_accepted' ELSE 'invitation_pending_acceptance' END,
      jsonb_build_object('expiresAt', COALESCE(v_inv.expires_at::text, 'none')), v_now,
      v_deep_tenant),

    private.fn_onboarding_readiness_check(
      'admin_membership_exists', 'An active membership exists for the administrator', 'conditional',
      CASE
        WHEN v_inv.id IS NULL OR v_inv.status <> 'accepted' THEN 'not_applicable'
        WHEN v_mem.id IS NOT NULL AND v_mem.status::text = 'active' THEN 'pass'
        WHEN v_mem.id IS NOT NULL THEN 'warning'
        ELSE 'blocked'
      END,
      'platform/memberships', 'tenant_admin_membership',
      CASE
        WHEN v_inv.id IS NULL OR v_inv.status <> 'accepted' THEN 'invitation_pending_acceptance'
        WHEN v_mem.id IS NOT NULL AND v_mem.status::text = 'active' THEN 'admin_membership_exists'
        ELSE 'membership_missing_after_acceptance'
      END,
      jsonb_build_object('organizationId', COALESCE(v_org.id::text, 'none')), v_now,
      v_deep_tenant),

    private.fn_onboarding_readiness_check(
      'admin_role_assigned', 'An administrative role is selected or granted', 'conditional',
      CASE
        WHEN v_inv.id IS NULL OR v_inv.status <> 'accepted' THEN 'not_applicable'
        WHEN v_role_granted THEN 'pass'
        ELSE 'blocked'
      END,
      'platform/rbac', 'roles_assigned',
      CASE
        WHEN v_inv.id IS NULL OR v_inv.status <> 'accepted' THEN 'invitation_pending_acceptance'
        WHEN v_role_granted THEN 'admin_role_assigned'
        ELSE 'admin_role_missing'
      END,
      jsonb_build_object('invitedRole', COALESCE(v_inv.role::text, 'none'),
                         'roleKey', COALESCE(v_role_key, 'none')), v_now, '/platform/admin'),

    private.fn_onboarding_readiness_check(
      'required_settings_valid', 'Every blocking required setting has a valid value', 'mandatory',
      CASE
        WHEN v_org.id IS NULL THEN 'blocked'
        WHEN array_length(v_missing_keys, 1) IS NULL THEN 'pass'
        ELSE 'blocked'
      END,
      'platform/settings', 'required_settings',
      CASE
        WHEN v_org.id IS NULL THEN 'organization_missing'
        WHEN array_length(v_missing_keys, 1) IS NULL THEN 'required_settings_valid'
        ELSE 'required_setting_missing'
      END,
      jsonb_build_object('settingKey', COALESCE(v_missing_keys[1], 'none'),
                         'missingCount', COALESCE(array_length(v_missing_keys, 1), 0)),
      v_now, '/platform/admin/settings'),

    private.fn_onboarding_readiness_check(
      'financial_year_present', 'A financial year exists where required', 'conditional',
      'not_applicable', 'platform/financial-years', 'financial_year',
      'financial_year_not_required',
      jsonb_build_object('triggerSource', 'none'), v_now, '/platform/companies'),

    private.fn_onboarding_readiness_check(
      'no_failed_or_blocked_step', 'No onboarding step is failed or blocked', 'mandatory',
      CASE WHEN v_bad_step_key IS NULL THEN 'pass' ELSE 'blocked' END,
      'platform/tenant-onboarding', NULL,
      CASE WHEN v_bad_step_key IS NULL THEN 'no_failed_or_blocked_step' ELSE 'step_not_clear' END,
      jsonb_build_object('stepKey', COALESCE(v_bad_step_key, 'none'),
                         'status', COALESCE(v_bad_step_stat, 'none')), v_now, v_deep_tenant),

    private.fn_onboarding_readiness_check(
      'no_concurrent_activation', 'No other activation is in flight', 'mandatory',
      CASE WHEN v_lock_free THEN 'pass' ELSE 'blocked' END,
      'platform/tenant-onboarding', 'activation',
      CASE WHEN v_lock_free THEN 'no_concurrent_activation' ELSE 'activation_in_flight' END,
      jsonb_build_object('correlationId', COALESCE(_correlation_id, 'none')), v_now, v_deep_tenant),

    private.fn_onboarding_readiness_check(
      'no_data_integrity_conflict', 'All onboarding data references the same tenant', 'mandatory',
      CASE WHEN v_mismatch IS NULL THEN 'pass' ELSE 'blocked' END,
      'platform/tenant-onboarding', NULL,
      CASE WHEN v_mismatch IS NULL THEN 'no_data_integrity_conflict' ELSE 'tenant_reference_mismatch' END,
      jsonb_build_object('entity', COALESCE(v_mismatch, 'none')), v_now, v_deep_tenant)
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

-- the 9-argument builder is superseded and no longer referenced
DROP FUNCTION IF EXISTS private.fn_onboarding_readiness_check(
  text, text, text, text, text, text, text, jsonb, timestamptz);

/* ------------------- guarded activation: mandatory expected version ------ */

DROP FUNCTION IF EXISTS public.fn_onboarding_activate_tenant(uuid, integer, boolean, text);

CREATE FUNCTION public.fn_onboarding_activate_tenant(
  _tenant_id uuid,
  _expected_version integer,
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

  -- expectedVersion is MANDATORY: refuse before acquiring any activation
  -- authority, before evaluation and before any write.
  IF _expected_version IS NULL THEN
    RAISE EXCEPTION 'expectedVersion is required for activation'
      USING ERRCODE = '40001';
  END IF;
  IF _expected_version < 0 THEN
    RAISE EXCEPTION 'expectedVersion must be a non-negative integer'
      USING ERRCODE = '22023';
  END IF;

  IF _correlation_id IS NOT NULL AND length(_correlation_id) > 128 THEN
    RAISE EXCEPTION 'correlationId too long' USING ERRCODE = '22023';
  END IF;

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

  IF v_onb.version <> _expected_version THEN
    RAISE EXCEPTION 'version conflict on tenant onboarding' USING ERRCODE = '40001';
  END IF;

  IF v_tenant.lifecycle_state::text NOT IN ('created', 'active') THEN
    RAISE EXCEPTION 'tenant lifecycle state blocks activation' USING ERRCODE = 'P384B';
  END IF;

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
    PERFORM private.fn_assert_lifecycle_transition(
      v_tenant.lifecycle_state, 'active'::public.tenant_lifecycle_state);
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