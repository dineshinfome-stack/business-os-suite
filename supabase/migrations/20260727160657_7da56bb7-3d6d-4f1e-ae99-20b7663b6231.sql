-- SPR-MOD-001-003 · Gate 3.8 — Pass 3.8.5D (append-only corrective migration)
-- 1. Missing-tenant readiness contract: the evaluator returns the canonical
--    14-check envelope with tenant_exists = blocked / tenant_missing instead
--    of raising P0002 before a result exists.
-- 2. Fail-closed setting metadata validation: malformed database-owned
--    validation metadata yields a bounded 'invalid_schema' reason.
-- No earlier migration is edited; this migration supersedes 3.8.5C.

/* ------------------------- 1. fail-closed setting value validator -------- */

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
  v_required boolean := false;
  v_min      numeric;
  v_max      numeric;
  v_regex    text;
  v_text     text;
  v_num      numeric;
  v_probe    boolean;
BEGIN
  /* -- metadata is validated FIRST and fails closed ---------------------- */

  IF jsonb_typeof(v_schema) <> 'object' THEN
    RETURN 'invalid_schema';
  END IF;

  IF _data_type IS NULL
     OR _data_type NOT IN ('string', 'enum', 'integer', 'decimal', 'boolean', 'json') THEN
    RETURN 'invalid_schema';
  END IF;

  IF v_schema ? 'required' AND jsonb_typeof(v_schema->'required') <> 'null' THEN
    BEGIN
      v_required := (v_schema->>'required')::boolean;
    EXCEPTION WHEN others THEN
      RETURN 'invalid_schema';
    END;
    IF v_required IS NULL THEN
      RETURN 'invalid_schema';
    END IF;
  END IF;

  IF v_schema ? 'min' AND jsonb_typeof(v_schema->'min') <> 'null' THEN
    BEGIN
      v_min := (v_schema->>'min')::numeric;
    EXCEPTION WHEN others THEN
      RETURN 'invalid_schema';
    END;
    IF v_min IS NULL THEN
      RETURN 'invalid_schema';
    END IF;
  END IF;

  IF v_schema ? 'max' AND jsonb_typeof(v_schema->'max') <> 'null' THEN
    BEGIN
      v_max := (v_schema->>'max')::numeric;
    EXCEPTION WHEN others THEN
      RETURN 'invalid_schema';
    END;
    IF v_max IS NULL THEN
      RETURN 'invalid_schema';
    END IF;
  END IF;

  IF v_min IS NOT NULL AND v_max IS NOT NULL AND v_min > v_max THEN
    RETURN 'invalid_schema';
  END IF;

  IF v_schema ? 'enum' AND jsonb_typeof(v_schema->'enum') <> 'null' THEN
    IF jsonb_typeof(v_schema->'enum') <> 'array'
       OR jsonb_array_length(v_schema->'enum') = 0
       OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(v_schema->'enum') e
             WHERE jsonb_typeof(e) <> 'string') THEN
      RETURN 'invalid_schema';
    END IF;
  END IF;

  IF v_schema ? 'regex' AND jsonb_typeof(v_schema->'regex') <> 'null' THEN
    IF jsonb_typeof(v_schema->'regex') <> 'string' THEN
      RETURN 'invalid_schema';
    END IF;
    v_regex := NULLIF(v_schema->>'regex', '');
    IF v_regex IS NOT NULL THEN
      BEGIN
        v_probe := ('' ~ v_regex);
      EXCEPTION WHEN others THEN
        -- Malformed or unsupported pattern. Never leak the raw exception.
        RETURN 'invalid_schema';
      END;
    END IF;
  END IF;

  /* -- value validation -------------------------------------------------- */

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
    IF v_schema ? 'enum' AND jsonb_typeof(v_schema->'enum') = 'array' THEN
      IF NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(v_schema->'enum') e
         WHERE e = v_text
      ) THEN
        RETURN 'enum_violation';
      END IF;
    ELSIF _data_type = 'enum' THEN
      -- An enum definition without a usable option list is malformed.
      RETURN 'invalid_schema';
    END IF;
    IF v_regex IS NOT NULL AND v_text !~ v_regex THEN
      RETURN 'regex_violation';
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

  -- json
  IF v_required AND jsonb_typeof(_value) NOT IN ('object', 'array') THEN
    RETURN 'type_mismatch';
  END IF;
  RETURN NULL;
END $$;

REVOKE ALL ON FUNCTION private.fn_setting_value_invalid_reason(text, jsonb, jsonb)
  FROM PUBLIC, anon;

/* ------------------- 2. missing-tenant readiness contract ---------------- */

-- The 3.8.5C body is retained verbatim as the PRESENT-tenant evaluator; the
-- contract entry point below owns tenant existence. Renaming (rather than
-- re-emitting) guarantees the present-tenant semantics certified in 3.8.5C
-- are carried forward byte-for-byte.
ALTER FUNCTION private.fn_onboarding_evaluate_readiness_json(uuid, text)
  RENAME TO fn_onboarding_evaluate_readiness_present_json;

REVOKE ALL ON FUNCTION
  private.fn_onboarding_evaluate_readiness_present_json(uuid, text)
  FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION private.fn_onboarding_evaluate_readiness_json(
  _tenant_id uuid,
  _correlation_id text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_now      timestamptz := now();
  v_exists   boolean;
  v_checks   jsonb;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.tenants t
     WHERE t.id = _tenant_id AND t.deleted_at IS NULL
  ) INTO v_exists;

  IF v_exists THEN
    RETURN private.fn_onboarding_evaluate_readiness_present_json(
             _tenant_id, _correlation_id);
  END IF;

  /* Missing or deleted tenant: NO writes, NO raise, NO sensitive detail.
     The canonical 14-check envelope is returned with tenant_exists blocked
     and every dependent check deterministically not_applicable. */
  v_checks := jsonb_build_array(
    private.fn_onboarding_readiness_check(
      'tenant_exists', 'The tenant record exists and is readable', 'mandatory',
      'blocked', 'platform/tenants', NULL, 'tenant_missing',
      '{}'::jsonb, v_now, '/platform/tenants'),
    private.fn_onboarding_readiness_check(
      'provisioning_completed', 'Provisioning finished successfully', 'mandatory',
      'not_applicable', 'platform/provisioning', 'provisioning_verified',
      'tenant_missing', '{}'::jsonb, v_now, '/platform/provisioning'),
    private.fn_onboarding_readiness_check(
      'lifecycle_permits_onboarding', 'Tenant lifecycle state allows onboarding/activation', 'mandatory',
      'not_applicable', 'platform/tenant-lifecycle', NULL,
      'tenant_missing', '{}'::jsonb, v_now, '/platform/tenants'),
    private.fn_onboarding_readiness_check(
      'organization_exists', 'An active default organization (company) exists', 'mandatory',
      'not_applicable', 'platform/organizations', 'organization_profile',
      'tenant_missing', '{}'::jsonb, v_now, '/platform/companies'),
    private.fn_onboarding_readiness_check(
      'primary_branch_exists', 'A default branch exists for the organization', 'mandatory',
      'not_applicable', 'platform/branches', 'primary_branch',
      'tenant_missing', '{}'::jsonb, v_now, '/platform/companies'),
    private.fn_onboarding_readiness_check(
      'admin_invitation_valid', 'A valid or accepted administrator invitation exists', 'mandatory',
      'not_applicable', 'platform/invitations', 'tenant_admin_invitation',
      'tenant_missing', '{}'::jsonb, v_now, NULL),
    private.fn_onboarding_readiness_check(
      'admin_invitation_accepted', 'The administrator accepted the invitation', 'warning',
      'not_applicable', 'platform/invitations', 'tenant_admin_invitation',
      'tenant_missing', '{}'::jsonb, v_now, NULL),
    private.fn_onboarding_readiness_check(
      'admin_membership_exists', 'An active membership exists for the administrator', 'conditional',
      'not_applicable', 'platform/memberships', 'tenant_admin_membership',
      'tenant_missing', '{}'::jsonb, v_now, NULL),
    private.fn_onboarding_readiness_check(
      'admin_role_assigned', 'An administrative role is selected or granted', 'conditional',
      'not_applicable', 'platform/rbac', 'roles_assigned',
      'tenant_missing', '{}'::jsonb, v_now, '/platform/admin'),
    private.fn_onboarding_readiness_check(
      'required_settings_valid', 'Every blocking required setting has a valid value', 'mandatory',
      'not_applicable', 'platform/settings', 'required_settings',
      'tenant_missing', '{}'::jsonb, v_now, '/platform/admin/settings'),
    private.fn_onboarding_readiness_check(
      'financial_year_present', 'A financial year exists where required', 'conditional',
      'not_applicable', 'platform/financial-years', 'financial_year',
      'tenant_missing', '{}'::jsonb, v_now, '/platform/companies'),
    private.fn_onboarding_readiness_check(
      'no_failed_or_blocked_step', 'No onboarding step is failed or blocked', 'mandatory',
      'not_applicable', 'platform/tenant-onboarding', NULL,
      'tenant_missing', '{}'::jsonb, v_now, NULL),
    private.fn_onboarding_readiness_check(
      'no_concurrent_activation', 'No other activation is in flight', 'mandatory',
      'not_applicable', 'platform/tenant-onboarding', 'activation',
      'tenant_missing', '{}'::jsonb, v_now, NULL),
    private.fn_onboarding_readiness_check(
      'no_data_integrity_conflict', 'All onboarding data references the same tenant', 'mandatory',
      'not_applicable', 'platform/tenant-onboarding', NULL,
      'tenant_missing', '{}'::jsonb, v_now, NULL)
  );

  RETURN jsonb_build_object(
    'tenant_id',                 _tenant_id,
    'evaluated_at',              v_now,
    'overall_status',            'not_ready',
    'contract_version',          '3.8.5',
    'observed_workflow_version', NULL,
    'checks',                    v_checks,
    'blocking_count',            1,
    'warning_count',             0,
    'applicable_count',          1,
    'warning_fingerprint',       NULL,
    'correlation_id',            _correlation_id
  );
END $$;

REVOKE ALL ON FUNCTION private.fn_onboarding_evaluate_readiness_json(uuid, text)
  FROM PUBLIC, anon;
