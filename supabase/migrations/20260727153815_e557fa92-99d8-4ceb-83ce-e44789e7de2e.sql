-- SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.5C (append-only corrective migration)
-- 1. private.fn_setting_value_invalid_reason: real value validation in SQL.
-- 2. Evaluator repair: provisioning authority, active default organization,
--    validated required settings, pre/post-acceptance admin role authority.
-- No earlier migration is edited; this migration supersedes 3.8.5 / 3.8.5B.

/* ------------------------------------------- setting value validator ----- */

CREATE OR REPLACE FUNCTION private.fn_setting_value_invalid_reason(
  _data_type text,
  _schema    jsonb,
  _value     jsonb
) RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'pg_catalog', 'public'
AS $$
DECLARE
  v_schema   jsonb := COALESCE(_schema, '{}'::jsonb);
  v_required boolean := COALESCE((v_schema->>'required')::boolean, false);
  v_text     text;
  v_num      numeric;
  v_min      numeric := NULLIF(v_schema->>'min', '')::numeric;
  v_max      numeric := NULLIF(v_schema->>'max', '')::numeric;
  v_regex    text := NULLIF(v_schema->>'regex', '');
BEGIN
  IF _value IS NULL OR jsonb_typeof(_value) = 'null' THEN
    RETURN 'missing';
  END IF;

  IF _data_type IN ('string', 'enum') THEN
    IF jsonb_typeof(_value) <> 'string' THEN
      RETURN 'type_mismatch';
    END IF;
    v_text := _value #>> '{}';
    IF v_required AND length(btrim(v_text)) = 0 THEN
      RETURN 'missing';
    END IF;
    IF v_min IS NOT NULL AND length(v_text) < v_min THEN
      RETURN 'out_of_range';
    END IF;
    IF v_max IS NOT NULL AND length(v_text) > v_max THEN
      RETURN 'out_of_range';
    END IF;
    IF v_schema ? 'enum' THEN
      IF NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(v_schema->'enum') e
         WHERE e = v_text
      ) THEN
        RETURN 'enum_violation';
      END IF;
    ELSIF _data_type = 'enum' THEN
      RETURN 'enum_violation';
    END IF;
    IF v_regex IS NOT NULL THEN
      BEGIN
        IF v_text !~ v_regex THEN
          RETURN 'regex_violation';
        END IF;
      EXCEPTION WHEN others THEN
        RETURN NULL; -- unsupported pattern: never fabricate a blocker
      END;
    END IF;
    RETURN NULL;
  END IF;

  IF _data_type IN ('integer', 'decimal') THEN
    IF jsonb_typeof(_value) <> 'number' THEN
      RETURN 'type_mismatch';
    END IF;
    v_num := (_value #>> '{}')::numeric;
    IF _data_type = 'integer' AND v_num <> trunc(v_num) THEN
      RETURN 'type_mismatch';
    END IF;
    IF v_min IS NOT NULL AND v_num < v_min THEN RETURN 'out_of_range'; END IF;
    IF v_max IS NOT NULL AND v_num > v_max THEN RETURN 'out_of_range'; END IF;
    RETURN NULL;
  END IF;

  IF _data_type = 'boolean' THEN
    IF jsonb_typeof(_value) <> 'boolean' THEN
      RETURN 'type_mismatch';
    END IF;
    RETURN NULL;
  END IF;

  IF _data_type = 'json' THEN
    IF v_required AND jsonb_typeof(_value) NOT IN ('object', 'array') THEN
      RETURN 'type_mismatch';
    END IF;
    RETURN NULL;
  END IF;

  RETURN NULL;
END $$;

REVOKE ALL ON FUNCTION private.fn_setting_value_invalid_reason(text, jsonb, jsonb)
  FROM PUBLIC, anon;

/* --------------------------------- corrected readiness evaluator (3.8.5C) */

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
  v_org_active_any integer := 0;
  v_org_any        integer := 0;
  v_branch_default integer := 0;
  v_branch_any     integer := 0;
  v_job            public.provisioning_jobs%ROWTYPE;
  v_job_state      text;
  v_rollback_open  boolean := false;
  v_prov_status    text;
  v_inv            public.organization_invitations%ROWTYPE;
  v_inv_pending_ok boolean := false;
  v_inv_accepted   boolean := false;
  v_mem            public.organization_members%ROWTYPE;
  v_role_key       text;
  v_role_granted   boolean := false;
  v_bad_keys       text[] := ARRAY[]::text[];
  v_bad_reason     text;
  v_warn_keys      text[] := ARRAY[]::text[];
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
  v_prov_status := COALESCE(v_tenant.provisioning_status::text, 'unknown');

  SELECT * INTO v_onb FROM public.tenant_onboarding WHERE tenant_id = _tenant_id;

  /* ------------------------------------------------ organizations ------- */
  SELECT
    count(*),
    count(*) FILTER (WHERE lifecycle_state::text = 'active')
    INTO v_org_any, v_org_active_any
    FROM public.organizations
   WHERE tenant_id = _tenant_id AND deleted_at IS NULL;

  SELECT * INTO v_org FROM public.organizations
   WHERE tenant_id = _tenant_id
     AND is_default
     AND deleted_at IS NULL
     AND lifecycle_state::text = 'active'
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

    v_inv_accepted   := v_inv.id IS NOT NULL AND v_inv.status = 'accepted';
    v_inv_pending_ok := v_inv.id IS NOT NULL AND v_inv.status = 'pending'
                        AND v_inv.expires_at > v_now;

    IF v_inv_accepted AND v_inv.accepted_by IS NOT NULL THEN
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
           AND (ur.expires_at IS NULL OR ur.expires_at > v_now)
           AND r.key = v_role_key
      ) INTO v_role_granted;
    END IF;

    /* ------------------------- required settings: presence AND validity - */
    SELECT
      COALESCE(array_agg(t.key ORDER BY t.key)
               FILTER (WHERE t.impact = 'block'  AND t.reason IS NOT NULL),
               ARRAY[]::text[]),
      COALESCE(array_agg(t.key ORDER BY t.key)
               FILTER (WHERE t.impact = 'warning' AND t.reason IS NOT NULL),
               ARRAY[]::text[]),
      (array_agg(t.reason ORDER BY t.key)
       FILTER (WHERE t.impact = 'block' AND t.reason IS NOT NULL))[1]
      INTO v_bad_keys, v_warn_keys, v_bad_reason
      FROM (
        SELECT d.key,
               d.readiness_impact AS impact,
               private.fn_setting_value_invalid_reason(
                 d.data_type::text,
                 d.validation_schema,
                 COALESCE(
                   (SELECT sv.value FROM public.setting_values sv
                     WHERE sv.definition_id = d.id
                       AND sv.organization_id = v_org.id
                     LIMIT 1),
                   (SELECT sv.value FROM public.setting_values sv
                     WHERE sv.definition_id = d.id
                       AND sv.organization_id IS NULL
                     LIMIT 1),
                   d.default_value
                 )
               ) AS reason
          FROM public.setting_definitions d
         WHERE d.readiness_impact IN ('block', 'warning')
           AND d.deprecated_at IS NULL
      ) t;
  END IF;

  /* ------------------------------------------------ provisioning -------- */
  SELECT * INTO v_job
    FROM public.provisioning_jobs j
   WHERE j.tenant_id = _tenant_id
   ORDER BY j.created_at DESC
   LIMIT 1;
  v_job_state := v_job.state::text;

  IF v_job.id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.provisioning_steps s
       WHERE s.job_id = v_job.id
         AND s.status::text = 'rolled_back'
    ) INTO v_rollback_open;
  END IF;

  SELECT s.step_key, s.status INTO v_bad_step_key, v_bad_step_stat
    FROM public.tenant_onboarding_steps s
   WHERE s.tenant_id = _tenant_id
     AND s.status IN ('failed', 'blocked')
   ORDER BY s.updated_at DESC
   LIMIT 1;

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

  v_checks := jsonb_build_array(
    private.fn_onboarding_readiness_check(
      'tenant_exists', 'The tenant record exists and is readable', 'mandatory',
      'pass', 'platform/tenants', NULL, 'tenant_exists',
      jsonb_build_object('tenantId', _tenant_id::text), v_now, '/platform/tenants'),

    /* Authority: latest provisioning job. The tenant-level flag can never
       override a failed, cancelled or rolled-back latest job. */
    private.fn_onboarding_readiness_check(
      'provisioning_completed', 'Provisioning finished successfully', 'mandatory',
      CASE
        WHEN v_job.id IS NULL THEN 'blocked'
        WHEN v_job_state IN ('failed', 'rolled_back', 'cancelled') THEN 'blocked'
        WHEN v_job_state = 'completed' AND v_rollback_open THEN 'blocked'
        WHEN v_job_state = 'completed' AND v_prov_status <> 'failed' THEN 'pass'
        WHEN v_job_state IN ('pending','validating','queued',
                             'provisioning_infrastructure','running_migrations',
                             'seeding','creating_admin','verifying','retrying')
             THEN 'warning'
        ELSE 'blocked'
      END,
      'platform/provisioning', 'provisioning_verified',
      CASE
        WHEN v_job.id IS NOT NULL AND v_job_state = 'completed'
             AND NOT v_rollback_open AND v_prov_status <> 'failed'
          THEN 'provisioning_completed'
        ELSE 'provisioning_incomplete'
      END,
      jsonb_build_object('jobState', COALESCE(v_job_state, 'none'),
                         'rollbackOpen', v_rollback_open,
                         'provisioningStatus', v_prov_status),
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

    /* Only an ACTIVE, non-deleted, default organization passes. */
    private.fn_onboarding_readiness_check(
      'organization_exists', 'An active default organization (company) exists', 'mandatory',
      CASE
        WHEN v_org.id IS NOT NULL THEN 'pass'
        WHEN v_org_active_any > 0 THEN 'warning'
        ELSE 'blocked'
      END,
      'platform/organizations', 'organization_profile',
      CASE WHEN v_org.id IS NOT NULL THEN 'organization_exists' ELSE 'organization_missing' END,
      jsonb_build_object('organizationCount', v_org_any,
                         'activeOrganizationCount', v_org_active_any), v_now,
      '/platform/companies'),

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
        WHEN v_inv_accepted THEN 'pass'
        WHEN v_inv.status = 'pending' AND v_inv.expires_at > v_now + interval '48 hours' THEN 'pass'
        WHEN v_inv_pending_ok THEN 'warning'
        ELSE 'blocked'
      END,
      'platform/invitations', 'tenant_admin_invitation',
      CASE
        WHEN v_inv.id IS NULL THEN 'invitation_missing'
        WHEN v_inv_accepted OR v_inv_pending_ok THEN 'admin_invitation_valid'
        ELSE 'invitation_missing'
      END,
      jsonb_build_object('invitationStatus', COALESCE(v_inv.status, 'none')), v_now,
      v_deep_tenant),

    private.fn_onboarding_readiness_check(
      'admin_invitation_accepted', 'The administrator accepted the invitation', 'warning',
      /* G38-POL-003: acceptance never blocks. */
      CASE WHEN v_inv_accepted THEN 'pass' ELSE 'warning' END,
      'platform/invitations', 'tenant_admin_invitation',
      CASE WHEN v_inv_accepted
           THEN 'admin_invitation_accepted' ELSE 'invitation_pending_acceptance' END,
      jsonb_build_object('expiresAt', COALESCE(v_inv.expires_at::text, 'none')), v_now,
      v_deep_tenant),

    private.fn_onboarding_readiness_check(
      'admin_membership_exists', 'An active membership exists for the administrator', 'conditional',
      CASE
        WHEN NOT v_inv_accepted THEN 'not_applicable'
        WHEN v_mem.id IS NOT NULL AND v_mem.status::text = 'active' THEN 'pass'
        WHEN v_mem.id IS NOT NULL THEN 'warning'
        ELSE 'blocked'
      END,
      'platform/memberships', 'tenant_admin_membership',
      CASE
        WHEN NOT v_inv_accepted THEN 'invitation_pending_acceptance'
        WHEN v_mem.id IS NOT NULL AND v_mem.status::text = 'active' THEN 'admin_membership_exists'
        ELSE 'membership_missing_after_acceptance'
      END,
      jsonb_build_object('organizationId', COALESCE(v_org.id::text, 'none')), v_now,
      v_deep_tenant),

    /* Pre-acceptance: the invited role is authoritative.
       Post-acceptance: the active user_roles grant is authoritative. */
    private.fn_onboarding_readiness_check(
      'admin_role_assigned', 'An administrative role is selected or granted', 'conditional',
      CASE
        WHEN v_inv_accepted AND v_role_granted THEN 'pass'
        WHEN v_inv_accepted THEN 'blocked'
        WHEN v_inv_pending_ok THEN 'pass'
        ELSE 'blocked'
      END,
      'platform/rbac', 'roles_assigned',
      CASE
        WHEN v_inv_accepted AND v_role_granted THEN 'admin_role_assigned'
        WHEN v_inv_pending_ok THEN 'admin_role_assigned'
        ELSE 'admin_role_missing'
      END,
      jsonb_build_object('invitedRole', COALESCE(v_inv.role::text, 'none'),
                         'roleKey', COALESCE(v_role_key, 'none'),
                         'authority', CASE WHEN v_inv_accepted THEN 'grant' ELSE 'invitation' END),
      v_now, '/platform/admin'),

    /* Missing AND invalid values block. Warning-impact definitions aggregate
       into the same check without widening the response contract. */
    private.fn_onboarding_readiness_check(
      'required_settings_valid', 'Every blocking required setting has a valid value', 'mandatory',
      CASE
        WHEN v_org.id IS NULL THEN 'blocked'
        WHEN array_length(v_bad_keys, 1) IS NOT NULL THEN 'blocked'
        WHEN array_length(v_warn_keys, 1) IS NOT NULL THEN 'warning'
        ELSE 'pass'
      END,
      'platform/settings', 'required_settings',
      CASE
        WHEN v_org.id IS NULL THEN 'organization_missing'
        WHEN v_bad_reason = 'missing' THEN 'required_setting_missing'
        WHEN array_length(v_bad_keys, 1) IS NOT NULL THEN 'required_setting_invalid'
        WHEN array_length(v_warn_keys, 1) IS NOT NULL THEN 'required_setting_invalid'
        ELSE 'required_settings_valid'
      END,
      jsonb_build_object('settingKey', COALESCE(v_bad_keys[1], v_warn_keys[1], 'none'),
                         'invalidReason', COALESCE(v_bad_reason, 'none'),
                         'missingCount', COALESCE(array_length(v_bad_keys, 1), 0),
                         'warningCount', COALESCE(array_length(v_warn_keys, 1), 0)),
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

  /* not_applicable is excluded from every arithmetic aggregate. */
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

REVOKE ALL ON FUNCTION private.fn_onboarding_evaluate_readiness_json(uuid, text)
  FROM PUBLIC, anon;