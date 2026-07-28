-- =====================================================================
-- SPR-MOD-001-003 · Gate 3.8 · Pass 3.8.5B
-- Tenant readiness evaluator + guarded activation certification harness.
--
-- Certifies, against the LIVE database:
--   A. required-settings readiness authority lives in setting_definitions
--   B. the evaluator emits exactly the 14 canonical matrix check keys
--   C. public.fn_onboarding_evaluate_readiness performs NO writes
--   D. public.fn_onboarding_persist_readiness persists the snapshot
--   E. public.fn_onboarding_activate_tenant is guarded:
--        blocking checks        -> P3848
--        unacknowledged warning -> P3849
--        stale expected version -> 40001
--        ineligible lifecycle   -> P384B
--      and is the canonical lifecycle writer + idempotent on replay.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--        -f supabase/tests/pass_3_8_5_readiness_certification.sql
--
-- Safety:
--   * Every assertion is fixture-scoped; global row counts are never used
--     as evidence of absence.
--   * All fixtures live inside ONE transaction that is ROLLED BACK.
--     Nothing is persisted, including the synthetic caller and its grants.
-- =====================================================================

\set ON_ERROR_STOP on
\timing off

BEGIN;

CREATE TEMP TABLE _p385_results (
  seq       int  GENERATED ALWAYS AS IDENTITY,
  assertion text NOT NULL,
  passed    boolean NOT NULL,
  detail    text
) ON COMMIT DROP;

CREATE OR REPLACE FUNCTION pg_temp.assert(_name text, _passed boolean, _detail text DEFAULT NULL)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO _p385_results(assertion, passed, detail) VALUES (_name, _passed, _detail);
$$;

-- The 14 canonical keys from docs/60-engineering/PHASE3_GATE38_READINESS_MATRIX.md.
CREATE TEMP TABLE _p385_expected_keys(check_key text PRIMARY KEY, seq int) ON COMMIT DROP;
INSERT INTO _p385_expected_keys(check_key, seq) VALUES
  ('tenant_exists', 1),
  ('provisioning_completed', 2),
  ('lifecycle_permits_onboarding', 3),
  ('organization_exists', 4),
  ('primary_branch_exists', 5),
  ('admin_invitation_valid', 6),
  ('admin_invitation_accepted', 7),
  ('admin_membership_exists', 8),
  ('admin_role_assigned', 9),
  ('required_settings_valid', 10),
  ('financial_year_present', 11),
  ('no_failed_or_blocked_step', 12),
  ('no_concurrent_activation', 13),
  ('no_data_integrity_conflict', 14);

CREATE TEMP TABLE _p385_ctx ON COMMIT DROP AS
SELECT gen_random_uuid() AS tenant_id,
       gen_random_uuid() AS caller_id,
       'p385-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 10) AS slug;

-- ---------------------------------------------------------------------
-- A. Required-settings readiness authority (D1-A)
-- ---------------------------------------------------------------------
DO $cert$
DECLARE v_n int;
BEGIN
  SELECT count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name  = 'setting_definitions'
     AND column_name = 'readiness_impact';
  PERFORM pg_temp.assert('A1 setting_definitions.readiness_impact exists',
                         v_n = 1, format('%s column(s)', v_n));

  SELECT count(*) INTO v_n
    FROM public.setting_definitions
   WHERE readiness_impact NOT IN ('block', 'warning', 'none');
  PERFORM pg_temp.assert('A2 every definition carries a legal readiness impact',
                         v_n = 0, format('%s illegal value(s)', v_n));

  SELECT count(*) INTO v_n
    FROM public.setting_definitions
   WHERE readiness_impact = 'block';
  PERFORM pg_temp.assert('A3 at least one blocking required setting is registered',
                         v_n > 0, format('%s blocking key(s)', v_n));

  -- A4 (3.8.5D) the blocking set is EXACTLY the three registered keys.
  SELECT count(*) INTO v_n
    FROM public.setting_definitions
   WHERE readiness_impact = 'block'
     AND key NOT IN ('platform.locale.default_timezone',
                     'platform.locale.default_language',
                     'platform.branding.product_name');
  PERFORM pg_temp.assert('A4a no unexpected blocking setting definition',
                         v_n = 0, format('%s unexpected key(s)', v_n));

  SELECT count(*) INTO v_n
    FROM (VALUES ('platform.locale.default_timezone'),
                 ('platform.locale.default_language'),
                 ('platform.branding.product_name')) AS x(key)
   WHERE NOT EXISTS (
     SELECT 1 FROM public.setting_definitions d
      WHERE d.key = x.key AND d.readiness_impact = 'block');
  PERFORM pg_temp.assert('A4b every expected blocking setting is registered',
                         v_n = 0, format('%s missing key(s)', v_n));
END
$cert$;


-- ---------------------------------------------------------------------
-- Fixture: caller with platform permissions + a tenant mid-onboarding
-- ---------------------------------------------------------------------
DO $cert$
DECLARE
  v_caller uuid;
  v_tenant uuid;
  v_slug   text;
BEGIN
  SELECT caller_id, tenant_id, slug INTO v_caller, v_tenant, v_slug FROM _p385_ctx;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_caller, 'authenticated', 'authenticated',
    v_slug || '@certification.invalid', crypt('x', gen_salt('bf')),
    now(), now(), now(), '', '', '', ''
  );

  INSERT INTO public.user_roles (user_id, role_id, organization_id, granted_by, granted_at)
  SELECT v_caller, r.id, NULL, v_caller, now()
    FROM public.roles r
   WHERE r.scope = 'platform'
   ORDER BY r.rank
   LIMIT 1;

  INSERT INTO public.tenants (id, slug, display_name, region, default_locale, timezone,
                              plan_tier, lifecycle_state, provisioning_status, created_by)
  VALUES (v_tenant, v_slug, 'Pass 3.8.5 certification tenant', 'IN', 'en', 'UTC',
          'standard', 'created', 'not_started', v_caller);
END
$cert$;

-- Harness-local temp objects are owned by the privileged executor; the
-- synthetic caller runs as `authenticated` and needs explicit access to them.
-- This grants nothing on application schemas — it only opens this session's
-- private pg_temp schema so bookkeeping tables remain writable after the role
-- transition. Production privileges are unaffected.
DO $grants$
DECLARE v_ns text := (SELECT nspname FROM pg_namespace WHERE oid = pg_my_temp_schema());
BEGIN
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO authenticated', v_ns);
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA %I TO authenticated', v_ns);
  EXECUTE format('GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA %I TO authenticated', v_ns);
  EXECUTE format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA %I TO authenticated', v_ns);
END
$grants$;

-- Act as the synthetic caller for every permission-gated call below.
SET LOCAL role = authenticated;
SELECT set_config('request.jwt.claims',
                  json_build_object('sub', (SELECT caller_id FROM _p385_ctx),
                                    'role', 'authenticated')::text,
                  true);

-- ---------------------------------------------------------------------
-- B/C. Read-only evaluation and canonical check set
-- ---------------------------------------------------------------------
DO $cert$
DECLARE
  v_tenant  uuid;
  v_json    jsonb;
  v_before  timestamptz;
  v_after   timestamptz;
  v_missing text;
  v_extra   text;
  v_n       int;
BEGIN
  SELECT tenant_id INTO v_tenant FROM _p385_ctx;
  PERFORM public.fn_onboarding_start(v_tenant, 'p385-cert');

  SELECT last_readiness_checked_at INTO v_before
    FROM public.tenant_onboarding WHERE tenant_id = v_tenant;

  v_json := public.fn_onboarding_evaluate_readiness(v_tenant, 'p385-cert');

  SELECT string_agg(e.check_key, ', ' ORDER BY e.seq) INTO v_missing
    FROM _p385_expected_keys e
   WHERE NOT EXISTS (
     SELECT 1 FROM jsonb_array_elements(v_json->'checks') c
      WHERE c->>'checkKey' = e.check_key);
  PERFORM pg_temp.assert('B1 every canonical matrix key is emitted',
                         v_missing IS NULL, COALESCE(v_missing, 'none missing'));

  SELECT string_agg(DISTINCT c.value->>'checkKey', ', ') INTO v_extra
    FROM jsonb_array_elements(v_json->'checks') c
   WHERE NOT EXISTS (
     SELECT 1 FROM _p385_expected_keys e WHERE e.check_key = c.value->>'checkKey');
  PERFORM pg_temp.assert('B2 no key outside the frozen matrix is emitted',
                         v_extra IS NULL, COALESCE(v_extra, 'none extra'));

  SELECT jsonb_array_length(v_json->'checks') INTO v_n;
  PERFORM pg_temp.assert('B3 exactly 14 checks are returned',
                         v_n = 14, format('%s check(s)', v_n));

  SELECT count(*) INTO v_n
    FROM jsonb_array_elements(v_json->'checks') c
   WHERE c->>'status' NOT IN
         ('not_evaluated','pass','warning','blocked','not_applicable');
  PERFORM pg_temp.assert('B4 no status outside the frozen v1 literals',
                         v_n = 0, format('%s widened status(es)', v_n));

  SELECT count(*) INTO v_n
    FROM jsonb_array_elements(v_json->'checks') c
   WHERE c->>'classification' NOT IN ('mandatory','conditional','warning');
  PERFORM pg_temp.assert('B5 no classification outside the frozen v1 literals',
                         v_n = 0, format('%s widened classification(s)', v_n));

  PERFORM pg_temp.assert('B6 overall status is a frozen v1 literal',
                         v_json->>'overall_status' IN
                         ('not_ready','ready_with_warnings','ready'),
                         v_json->>'overall_status');

  PERFORM pg_temp.assert('B7 an incomplete tenant is not_ready with blockers',
                         v_json->>'overall_status' = 'not_ready'
                         AND (v_json->>'blocking_count')::int > 0,
                         format('status=%s blocking=%s',
                                v_json->>'overall_status', v_json->>'blocking_count'));

  PERFORM pg_temp.assert('B8 the observed workflow version is an integer',
                         jsonb_typeof(v_json->'observed_workflow_version') = 'number',
                         jsonb_typeof(v_json->'observed_workflow_version'));

  -- C. read path writes nothing.
  SELECT last_readiness_checked_at INTO v_after
    FROM public.tenant_onboarding WHERE tenant_id = v_tenant;
  PERFORM pg_temp.assert('C1 evaluation does not stamp last_readiness_checked_at',
                         v_after IS NOT DISTINCT FROM v_before, 'read-only');

  SELECT count(*) INTO v_n FROM public.tenant_onboarding
   WHERE tenant_id = v_tenant AND readiness_snapshot IS NOT NULL;
  PERFORM pg_temp.assert('C2 evaluation persists no snapshot', v_n = 0,
                         format('%s snapshot(s)', v_n));

  SELECT count(*) INTO v_n FROM public.audit_logs
   WHERE entity_id = v_tenant AND action = 'tenant_onboarding.readiness_evaluated';
  PERFORM pg_temp.assert('C3 evaluation writes no audit entry', v_n = 0,
                         format('%s audit row(s)', v_n));
END
$cert$;

-- ---------------------------------------------------------------------
-- D. Explicit persistence
-- ---------------------------------------------------------------------
DO $cert$
DECLARE
  v_tenant uuid;
  v_json   jsonb;
  v_row    public.tenant_onboarding%ROWTYPE;
  v_n      int;
BEGIN
  SELECT tenant_id INTO v_tenant FROM _p385_ctx;
  v_json := public.fn_onboarding_persist_readiness(v_tenant, 'p385-cert');

  SELECT * INTO v_row FROM public.tenant_onboarding WHERE tenant_id = v_tenant;
  PERFORM pg_temp.assert('D1 snapshot persisted', v_row.readiness_snapshot IS NOT NULL, NULL);
  PERFORM pg_temp.assert('D2 persisted status matches the returned envelope',
                         v_row.readiness_status = v_json->>'overall_status',
                         format('%s vs %s', v_row.readiness_status, v_json->>'overall_status'));
  PERFORM pg_temp.assert('D3 persisted counts match the returned envelope',
                         v_row.readiness_blocking_count = (v_json->>'blocking_count')::int
                     AND v_row.readiness_warning_count  = (v_json->>'warning_count')::int,
                         format('%s/%s', v_row.readiness_blocking_count,
                                         v_row.readiness_warning_count));
  PERFORM pg_temp.assert('D4 last_readiness_checked_at stamped',
                         v_row.last_readiness_checked_at IS NOT NULL, NULL);
  PERFORM pg_temp.assert('D5 ready_at stays null while blocked',
                         v_row.ready_at IS NULL, NULL);

  SELECT count(*) INTO v_n FROM public.audit_logs
   WHERE entity_id = v_tenant AND action = 'tenant_onboarding.readiness_evaluated';
  PERFORM pg_temp.assert('D6 persistence writes exactly one audit entry',
                         v_n = 1, format('%s audit row(s)', v_n));

  -- The fingerprint is database-owned; no client value can reach it.
  PERFORM pg_temp.assert('D7 fingerprint is null when there are no warnings',
                         (v_json->>'warning_count')::int > 0
                          OR v_json->>'warning_fingerprint' IS NULL,
                         COALESCE(v_json->>'warning_fingerprint', '<null>'));
END
$cert$;

-- ---------------------------------------------------------------------
-- E. Guarded activation
-- ---------------------------------------------------------------------
DO $cert$
DECLARE
  v_tenant  uuid;
  v_version int;
  v_state   text;
  v_sqlstate text;
BEGIN
  SELECT tenant_id INTO v_tenant FROM _p385_ctx;
  SELECT version INTO v_version FROM public.tenant_onboarding WHERE tenant_id = v_tenant;

  -- E1 blocking checks reject activation with P3848.
  BEGIN
    PERFORM public.fn_onboarding_activate_tenant(v_tenant, v_version, false, 'p385-cert');
    v_sqlstate := 'NO ERROR';
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
  END;
  PERFORM pg_temp.assert('E1 blocked readiness raises P3848',
                         v_sqlstate = 'P3848', v_sqlstate);

  -- E2 a stale expected version is rejected before anything else mutates.
  BEGIN
    PERFORM public.fn_onboarding_activate_tenant(v_tenant, v_version - 1, true, 'p385-cert');
    v_sqlstate := 'NO ERROR';
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
  END;
  PERFORM pg_temp.assert('E2 stale expected version raises 40001',
                         v_sqlstate = '40001', v_sqlstate);

  -- E3 expectedVersion is mandatory: NULL is not silently accepted.
  BEGIN
    PERFORM public.fn_onboarding_activate_tenant(v_tenant, NULL, false, 'p385-cert');
    v_sqlstate := 'NO ERROR';
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
  END;
  PERFORM pg_temp.assert('E3 null expected version raises exactly 40001',
                         v_sqlstate = '40001', v_sqlstate);

  -- E4 a failed activation leaves lifecycle and workflow untouched.
  SELECT lifecycle_state::text INTO v_state FROM public.tenants WHERE id = v_tenant;
  PERFORM pg_temp.assert('E4a tenant lifecycle unchanged after rejection',
                         v_state = 'created', v_state);
  SELECT state INTO v_state FROM public.tenant_onboarding WHERE tenant_id = v_tenant;
  PERFORM pg_temp.assert('E4b onboarding not activated after rejection',
                         v_state <> 'activated', v_state);

  -- E5 an ineligible tenant lifecycle is refused with P384B.
  UPDATE public.tenants SET lifecycle_state = 'suspended', suspended_at = now()
   WHERE id = v_tenant;
  SELECT version INTO v_version FROM public.tenant_onboarding WHERE tenant_id = v_tenant;
  BEGIN
    PERFORM public.fn_onboarding_activate_tenant(v_tenant, v_version, true, 'p385-cert');
    v_sqlstate := 'NO ERROR';
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
  END;
  PERFORM pg_temp.assert('E5 ineligible lifecycle raises P384B',
                         v_sqlstate = 'P384B', v_sqlstate);
  UPDATE public.tenants SET lifecycle_state = 'created', suspended_at = NULL
   WHERE id = v_tenant;
END
$cert$;

-- =====================================================================
-- F. Pass 3.8.5C corrected evaluator semantics
--    Fixture construction needs owner rights; the permission-gated public
--    wrappers were already certified in sections B–E. Section F drives the
--    evaluator itself so each scenario is asserted in isolation.
-- =====================================================================
RESET role;

CREATE OR REPLACE FUNCTION pg_temp.ev() RETURNS jsonb LANGUAGE sql AS $$
  SELECT private.fn_onboarding_evaluate_readiness_json(
           (SELECT tenant_id FROM _p385_ctx), 'p385c-cert');
$$;

CREATE OR REPLACE FUNCTION pg_temp.st(_json jsonb, _key text)
RETURNS text LANGUAGE sql AS $$
  SELECT c->>'status' FROM jsonb_array_elements(_json->'checks') c
   WHERE c->>'checkKey' = _key;
$$;

CREATE OR REPLACE FUNCTION pg_temp.rc(_json jsonb, _key text)
RETURNS text LANGUAGE sql AS $$
  SELECT c->>'reasonCode' FROM jsonb_array_elements(_json->'checks') c
   WHERE c->>'checkKey' = _key;
$$;

CREATE OR REPLACE FUNCTION pg_temp.rp(_json jsonb, _key text, _param text)
RETURNS text LANGUAGE sql AS $$
  SELECT c->'reasonParams'->>_param FROM jsonb_array_elements(_json->'checks') c
   WHERE c->>'checkKey' = _key;
$$;

CREATE TEMP TABLE _p385_fx ON COMMIT DROP AS
SELECT gen_random_uuid() AS admin_id,
       gen_random_uuid() AS org_id,
       gen_random_uuid() AS branch_id,
       gen_random_uuid() AS job_id,
       gen_random_uuid() AS inv_id;

-- F.1 provisioning authority ------------------------------------------
DO $cert$
DECLARE
  v_t uuid; v_job uuid; v_j jsonb;
BEGIN
  SELECT tenant_id INTO v_t FROM _p385_ctx;
  SELECT job_id INTO v_job FROM _p385_fx;

  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F1a no provisioning job blocks',
                         pg_temp.st(v_j, 'provisioning_completed') = 'blocked',
                         pg_temp.st(v_j, 'provisioning_completed'));

  INSERT INTO public.provisioning_jobs
    (id, tenant_id, state, correlation_id, provider_key)
  VALUES (v_job, v_t, 'running_migrations', 'p385c', 'supabase');

  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F1b an in-flight job warns, never passes',
                         pg_temp.st(v_j, 'provisioning_completed') = 'warning',
                         pg_temp.st(v_j, 'provisioning_completed'));

  UPDATE public.provisioning_jobs SET state = 'failed' WHERE id = v_job;
  UPDATE public.tenants SET provisioning_status = 'provisioned' WHERE id = v_t;
  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F1c a provisioned tenant flag cannot mask a failed job',
                         pg_temp.st(v_j, 'provisioning_completed') = 'blocked',
                         pg_temp.st(v_j, 'provisioning_completed'));

  UPDATE public.provisioning_jobs SET state = 'completed' WHERE id = v_job;
  INSERT INTO public.provisioning_steps
    (job_id, step_key, sequence, status, correlation_id)
  VALUES (v_job, 'create_project', 1, 'rolled_back', 'p385c');
  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F1d an unresolved rollback blocks a completed job',
                         pg_temp.st(v_j, 'provisioning_completed') = 'blocked',
                         pg_temp.st(v_j, 'provisioning_completed'));

  UPDATE public.provisioning_steps SET status = 'succeeded'
   WHERE job_id = v_job;
  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F1e a clean completed job passes',
                         pg_temp.st(v_j, 'provisioning_completed') = 'pass',
                         pg_temp.st(v_j, 'provisioning_completed'));
END
$cert$;

-- F.2 an ACTIVE default organization is required ------------------------
DO $cert$
DECLARE
  v_t uuid; v_org uuid; v_br uuid; v_slug text; v_j jsonb;
BEGIN
  SELECT tenant_id, slug INTO v_t, v_slug FROM _p385_ctx;
  SELECT org_id, branch_id INTO v_org, v_br FROM _p385_fx;

  INSERT INTO public.organizations
    (id, tenant_id, name, slug, is_default, lifecycle_state,
     region, default_locale, timezone)
  VALUES (v_org, v_t, 'Cert Co', v_slug || '-co', true, 'created',
          'IN', 'en', 'UTC');

  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F2a a non-active default organization blocks',
                         pg_temp.st(v_j, 'organization_exists') = 'blocked',
                         pg_temp.st(v_j, 'organization_exists'));
  PERFORM pg_temp.assert('F2b settings cannot be evaluated without an organization',
                         pg_temp.st(v_j, 'required_settings_valid') = 'blocked',
                         pg_temp.rc(v_j, 'required_settings_valid'));

  UPDATE public.organizations SET lifecycle_state = 'active' WHERE id = v_org;
  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F2c an active default organization passes',
                         pg_temp.st(v_j, 'organization_exists') = 'pass',
                         pg_temp.st(v_j, 'organization_exists'));
  PERFORM pg_temp.assert('F2d no default branch blocks',
                         pg_temp.st(v_j, 'primary_branch_exists') = 'blocked',
                         pg_temp.st(v_j, 'primary_branch_exists'));

  INSERT INTO public.branches
    (id, tenant_id, organization_id, code, name, is_default,
     lifecycle_state, address, timezone)
  VALUES (v_br, v_t, v_org, 'HQ', 'Head office', true, 'active', '{}'::jsonb, 'UTC');

  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F2e a default branch passes',
                         pg_temp.st(v_j, 'primary_branch_exists') = 'pass',
                         pg_temp.st(v_j, 'primary_branch_exists'));
END
$cert$;

-- F.3 required settings are VALIDATED, not merely present ---------------
DO $cert$
DECLARE
  v_org uuid; v_def uuid; v_j jsonb;
BEGIN
  SELECT org_id INTO v_org FROM _p385_fx;

  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F3a valid defaults satisfy the blocking settings',
                         pg_temp.st(v_j, 'required_settings_valid') = 'pass',
                         pg_temp.rc(v_j, 'required_settings_valid'));

  SELECT id INTO v_def FROM public.setting_definitions
   WHERE key = 'platform.branding.product_name';

  -- empty string for a required string: rejected as missing.
  INSERT INTO public.setting_values (definition_id, organization_id, value)
  VALUES (v_def, v_org, '""'::jsonb);
  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F3b an empty required string blocks as missing',
                         pg_temp.st(v_j, 'required_settings_valid') = 'blocked'
                     AND pg_temp.rc(v_j, 'required_settings_valid') = 'required_setting_missing',
                         pg_temp.rc(v_j, 'required_settings_valid'));

  -- wrong JSON type for a string setting.
  UPDATE public.setting_values SET value = '42'::jsonb
   WHERE definition_id = v_def AND organization_id = v_org;
  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F3c a type mismatch blocks as invalid',
                         pg_temp.st(v_j, 'required_settings_valid') = 'blocked'
                     AND pg_temp.rp(v_j, 'required_settings_valid', 'invalidReason')
                         = 'type_mismatch',
                         pg_temp.rp(v_j, 'required_settings_valid', 'invalidReason'));

  -- string longer than the declared maximum.
  UPDATE public.setting_values SET value = to_jsonb(repeat('x', 400))
   WHERE definition_id = v_def AND organization_id = v_org;
  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F3d an out-of-range value blocks',
                         pg_temp.st(v_j, 'required_settings_valid') = 'blocked'
                     AND pg_temp.rp(v_j, 'required_settings_valid', 'invalidReason')
                         = 'out_of_range',
                         pg_temp.rp(v_j, 'required_settings_valid', 'invalidReason'));

  -- an enum setting outside its allowed values.
  UPDATE public.setting_values SET value = '"Cert Co"'::jsonb
   WHERE definition_id = v_def AND organization_id = v_org;
  SELECT id INTO v_def FROM public.setting_definitions
   WHERE key = 'platform.locale.default_language';
  INSERT INTO public.setting_values (definition_id, organization_id, value)
  VALUES (v_def, v_org, '"zz"'::jsonb);
  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F3e an enum violation blocks',
                         pg_temp.st(v_j, 'required_settings_valid') = 'blocked'
                     AND pg_temp.rp(v_j, 'required_settings_valid', 'invalidReason')
                         = 'enum_violation',
                         pg_temp.rp(v_j, 'required_settings_valid', 'invalidReason'));

  UPDATE public.setting_values SET value = '"en"'::jsonb
   WHERE definition_id = v_def AND organization_id = v_org;
  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F3f valid organization values pass',
                         pg_temp.st(v_j, 'required_settings_valid') = 'pass',
                         pg_temp.rc(v_j, 'required_settings_valid'));
END
$cert$;

-- F.4 administrator role authority before and after acceptance ----------
DO $cert$
DECLARE
  v_t uuid; v_org uuid; v_inv uuid; v_admin uuid; v_slug text;
  v_role uuid; v_j jsonb;
BEGIN
  SELECT tenant_id, slug INTO v_t, v_slug FROM _p385_ctx;
  SELECT org_id, inv_id, admin_id INTO v_org, v_inv, v_admin FROM _p385_fx;

  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F4a no invitation blocks the role check',
                         pg_temp.st(v_j, 'admin_role_assigned') = 'blocked',
                         pg_temp.rc(v_j, 'admin_role_assigned'));

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_admin, 'authenticated', 'authenticated',
    v_slug || '-admin@certification.invalid', crypt('x', gen_salt('bf')),
    now(), now(), now(), '', '', '', ''
  );

  INSERT INTO public.organization_invitations
    (id, organization_id, email, role, invited_by, token_hash, expires_at, status)
  VALUES (v_inv, v_org, v_slug || '-admin@certification.invalid', 'admin',
          (SELECT caller_id FROM _p385_ctx),
          encode(sha256(convert_to(v_slug || '-t1', 'UTF8')), 'hex'),
          now() + interval '7 days', 'pending');

  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F4b a valid pending admin invitation satisfies the role check',
                         pg_temp.st(v_j, 'admin_role_assigned') = 'pass'
                     AND pg_temp.rp(v_j, 'admin_role_assigned', 'authority') = 'invitation',
                         pg_temp.rp(v_j, 'admin_role_assigned', 'authority'));
  PERFORM pg_temp.assert('F4c membership is not applicable before acceptance',
                         pg_temp.st(v_j, 'admin_membership_exists') = 'not_applicable',
                         pg_temp.st(v_j, 'admin_membership_exists'));
  PERFORM pg_temp.assert('F4d acceptance is a warning, never a blocker',
                         pg_temp.st(v_j, 'admin_invitation_accepted') = 'warning',
                         pg_temp.st(v_j, 'admin_invitation_accepted'));

  UPDATE public.organization_invitations
     SET status = 'accepted', accepted_at = now(), accepted_by = v_admin
   WHERE id = v_inv;
  INSERT INTO public.organization_members
    (organization_id, user_id, role, status, joined_at)
  VALUES (v_org, v_admin, 'admin', 'active', now());

  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F4e after acceptance the invitation no longer confers the role',
                         pg_temp.st(v_j, 'admin_role_assigned') = 'blocked'
                     AND pg_temp.rp(v_j, 'admin_role_assigned', 'authority') = 'grant',
                         pg_temp.rc(v_j, 'admin_role_assigned'));
  PERFORM pg_temp.assert('F4f an active membership passes after acceptance',
                         pg_temp.st(v_j, 'admin_membership_exists') = 'pass',
                         pg_temp.st(v_j, 'admin_membership_exists'));

  SELECT id INTO v_role FROM public.roles WHERE key = 'administrator';
  INSERT INTO public.user_roles
    (user_id, role_id, organization_id, granted_by, granted_at)
  VALUES (v_admin, v_role, v_org, (SELECT caller_id FROM _p385_ctx), now());

  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F4g an active grant satisfies the role check after acceptance',
                         pg_temp.st(v_j, 'admin_role_assigned') = 'pass',
                         pg_temp.st(v_j, 'admin_role_assigned'));

  UPDATE public.user_roles SET expires_at = now() - interval '1 day'
   WHERE user_id = v_admin AND organization_id = v_org;
  v_j := pg_temp.ev();
  PERFORM pg_temp.assert('F4h an expired grant does not satisfy the role check',
                         pg_temp.st(v_j, 'admin_role_assigned') = 'blocked',
                         pg_temp.st(v_j, 'admin_role_assigned'));
  UPDATE public.user_roles SET expires_at = NULL
   WHERE user_id = v_admin AND organization_id = v_org;
END
$cert$;

-- F.5 the completed fixture reaches an unambiguous ready verdict --------
DO $cert$
DECLARE
  v_t uuid; v_j jsonb; v_bad text;
BEGIN
  SELECT tenant_id INTO v_t FROM _p385_ctx;
  UPDATE public.tenant_onboarding_steps
     SET status = 'completed', completed_at = now()
   WHERE tenant_id = v_t AND step_key <> 'activation';

  v_j := pg_temp.ev();
  SELECT string_agg(c->>'checkKey' || '=' || (c->>'status'), ', ')
    INTO v_bad
    FROM jsonb_array_elements(v_j->'checks') c
   WHERE c->>'status' NOT IN ('pass', 'not_applicable');

  PERFORM pg_temp.assert('F5a a fully bootstrapped tenant evaluates as ready',
                         v_j->>'overall_status' = 'ready',
                         COALESCE(v_bad, 'all checks pass'));
  PERFORM pg_temp.assert('F5b a ready verdict carries no blockers and no warnings',
                         (v_j->>'blocking_count')::int = 0
                     AND (v_j->>'warning_count')::int = 0,
                         format('%s/%s', v_j->>'blocking_count', v_j->>'warning_count'));
  PERFORM pg_temp.assert('F5c not_applicable checks are excluded from applicable_count',
                         (v_j->>'applicable_count')::int
                         = 14 - (SELECT count(*) FROM jsonb_array_elements(v_j->'checks') c
                                  WHERE c->>'status' = 'not_applicable'),
                         v_j->>'applicable_count');
  PERFORM pg_temp.assert('F5d a warning-free verdict has no fingerprint',
                         v_j->>'warning_fingerprint' IS NULL,
                         COALESCE(v_j->>'warning_fingerprint', '<null>'));
END
$cert$;

-- E7 an unacknowledged warning refuses activation (P3849).
UPDATE public.organization_invitations
   SET status = 'pending', accepted_at = NULL
 WHERE id = (SELECT inv_id FROM _p385_fx);

SET LOCAL role = authenticated;
SELECT set_config('request.jwt.claims',
                  json_build_object('sub', (SELECT caller_id FROM _p385_ctx),
                                    'role', 'authenticated')::text,
                  true);

DO $cert$
DECLARE
  v_t uuid; v_version int; v_sqlstate text;
BEGIN
  SELECT tenant_id INTO v_t FROM _p385_ctx;
  SELECT version INTO v_version FROM public.tenant_onboarding WHERE tenant_id = v_t;
  BEGIN
    PERFORM public.fn_onboarding_activate_tenant(v_t, v_version, false, 'p385-cert');
    v_sqlstate := 'NO ERROR';
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
  END;
  PERFORM pg_temp.assert('E7 unacknowledged warning raises P3849',
                         v_sqlstate = 'P3849', v_sqlstate);
END
$cert$;

RESET role;
UPDATE public.organization_invitations
   SET status = 'accepted', accepted_at = now(),
       accepted_by = (SELECT admin_id FROM _p385_fx)
 WHERE id = (SELECT inv_id FROM _p385_fx);

-- Back to the permission-gated caller for the activation assertions.
SET LOCAL role = authenticated;
SELECT set_config('request.jwt.claims',
                  json_build_object('sub', (SELECT caller_id FROM _p385_ctx),
                                    'role', 'authenticated')::text,
                  true);

-- E6 activation is the canonical lifecycle writer, idempotent on replay.
DO $cert$
DECLARE
  v_tenant   uuid;
  v_version  int;
  v_first    jsonb;
  v_replay   jsonb;
  v_state    text;
  v_state2   text;
  v_n        int;
  v_audit    int;
  v_audit2   int;
  v_steps2   int;
  v_dbver    int;
BEGIN
  SELECT tenant_id INTO v_tenant FROM _p385_ctx;

  SELECT version INTO v_version FROM public.tenant_onboarding WHERE tenant_id = v_tenant;
  v_first := public.fn_onboarding_activate_tenant(v_tenant, v_version, false, 'p385-cert');

  SELECT lifecycle_state::text INTO v_state FROM public.tenants WHERE id = v_tenant;
  PERFORM pg_temp.assert('E6a lifecycle transitioned to active by the RPC',
                         v_state = 'active', v_state);
  PERFORM pg_temp.assert('E6b activation reports the transition',
                         (v_first->>'lifecycle_transition_applied')::boolean, NULL);

  SELECT count(*) INTO v_n FROM public.tenant_onboarding_steps
   WHERE tenant_id = v_tenant AND step_key = 'activation' AND status = 'completed';
  PERFORM pg_temp.assert('E6c activation step recorded exactly once',
                         v_n = 1, format('%s row(s)', v_n));

  -- E6g (3.8.5D) the workflow version advances by exactly one.
  SELECT version INTO v_dbver FROM public.tenant_onboarding WHERE tenant_id = v_tenant;
  PERFORM pg_temp.assert('E6g activation advances the workflow version N -> N+1',
                         v_dbver = v_version + 1
                         AND (v_first->>'version')::int = v_version + 1,
                         format('%s -> %s (reported %s)',
                                v_version, v_dbver, v_first->>'version'));

  -- E6h (3.8.5D) exactly one activation audit record is written.
  SELECT count(*) INTO v_audit FROM public.audit_logs
   WHERE entity_type = 'tenant_onboarding'
     AND entity_id   = v_tenant
     AND action      = 'tenant_onboarding.activated';
  PERFORM pg_temp.assert('E6h activation writes exactly one audit record',
                         v_audit = 1, format('%s row(s)', v_audit));

  v_replay := public.fn_onboarding_activate_tenant(
                v_tenant, (v_first->>'version')::int, true, 'p385-cert');
  PERFORM pg_temp.assert('E6d replay is idempotent',
                         (v_replay->>'idempotent_replay')::boolean, NULL);
  PERFORM pg_temp.assert('E6e replay applies no second transition',
                         NOT (v_replay->>'lifecycle_transition_applied')::boolean, NULL);
  PERFORM pg_temp.assert('E6f replay does not bump the workflow version',
                         (v_replay->>'version')::int = (v_first->>'version')::int,
                         format('%s vs %s', v_replay->>'version', v_first->>'version'));

  -- E6i (3.8.5D) replay changes NO persisted state at all.
  SELECT version INTO v_dbver FROM public.tenant_onboarding WHERE tenant_id = v_tenant;
  SELECT lifecycle_state::text INTO v_state2 FROM public.tenants WHERE id = v_tenant;
  SELECT count(*) INTO v_steps2 FROM public.tenant_onboarding_steps
   WHERE tenant_id = v_tenant AND step_key = 'activation' AND status = 'completed';
  SELECT count(*) INTO v_audit2 FROM public.audit_logs
   WHERE entity_type = 'tenant_onboarding'
     AND entity_id   = v_tenant
     AND action      = 'tenant_onboarding.activated';
  PERFORM pg_temp.assert(
    'E6i replay changes no version, step count, audit count or lifecycle state',
    v_dbver = v_version + 1 AND v_state2 = 'active'
    AND v_steps2 = v_n AND v_audit2 = v_audit,
    format('version=%s lifecycle=%s steps=%s audits=%s',
           v_dbver, v_state2, v_steps2, v_audit2));
END
$cert$;

RESET role;

-- =====================================================================
-- G. Pass 3.8.5D — missing-tenant readiness contract
--    A tenant that does not exist (or is soft-deleted) must still yield the
--    canonical envelope. No raise, no writes, no sensitive detail.
-- =====================================================================
DO $cert$
DECLARE
  v_absent uuid := gen_random_uuid();
  v_res    jsonb;
  v_n      int;
  v_before int;
  v_after  int;
BEGIN
  SELECT count(*) INTO v_before FROM public.tenant_onboarding;

  BEGIN
    v_res := private.fn_onboarding_evaluate_readiness_json(v_absent, 'p385d-cert');
  EXCEPTION WHEN OTHERS THEN
    v_res := NULL;
  END;

  PERFORM pg_temp.assert('G1 missing tenant returns an envelope instead of raising',
                         v_res IS NOT NULL, NULL);

  SELECT jsonb_array_length(v_res->'checks') INTO v_n;
  PERFORM pg_temp.assert('G2 missing tenant returns the 14-check envelope',
                         v_n = 14, format('%s check(s)', v_n));

  PERFORM pg_temp.assert('G3 tenant_exists is blocked',
    (SELECT c->>'status' FROM jsonb_array_elements(v_res->'checks') c
      WHERE c->>'checkKey' = 'tenant_exists') = 'blocked',
    (SELECT c->>'status' FROM jsonb_array_elements(v_res->'checks') c
      WHERE c->>'checkKey' = 'tenant_exists'));

  PERFORM pg_temp.assert('G4 tenant_exists reason code is tenant_missing',
    (SELECT c->>'reasonCode' FROM jsonb_array_elements(v_res->'checks') c
      WHERE c->>'checkKey' = 'tenant_exists') = 'tenant_missing',
    (SELECT c->>'reasonCode' FROM jsonb_array_elements(v_res->'checks') c
      WHERE c->>'checkKey' = 'tenant_exists'));

  PERFORM pg_temp.assert('G5 overall status is not_ready',
                         v_res->>'overall_status' = 'not_ready',
                         v_res->>'overall_status');

  SELECT count(*) INTO v_n
    FROM jsonb_array_elements(v_res->'checks') c
   WHERE c->>'checkKey' <> 'tenant_exists'
     AND c->>'status' NOT IN ('blocked', 'not_applicable');
  PERFORM pg_temp.assert('G6 dependent checks are deterministically blocked/not_applicable',
                         v_n = 0, format('%s deviant check(s)', v_n));

  SELECT count(*) INTO v_after FROM public.tenant_onboarding;
  PERFORM pg_temp.assert('G7 missing-tenant evaluation performs no writes',
                         v_after = v_before, format('%s vs %s', v_before, v_after));
END
$cert$;

-- =====================================================================
-- H. Pass 3.8.5D — fail-closed setting metadata validation
--    Malformed database-owned validation metadata must never be treated as
--    valid; it yields the bounded reason 'invalid_schema' and blocks.
-- =====================================================================
DO $cert$
DECLARE
  v_reason text;
BEGIN
  v_reason := private.fn_setting_value_invalid_reason(
                'string', '{"regex": "([unclosed"}'::jsonb, '"anything"'::jsonb);
  PERFORM pg_temp.assert('H1 malformed regex metadata yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'integer', '{"min": "abc", "max": 10}'::jsonb, '5'::jsonb);
  PERFORM pg_temp.assert('H2 nonnumeric min metadata yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'integer', '{"min": 1, "max": "ten"}'::jsonb, '5'::jsonb);
  PERFORM pg_temp.assert('H3 nonnumeric max metadata yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'string', '{"required": "yes-please"}'::jsonb, '"x"'::jsonb);
  PERFORM pg_temp.assert('H4 invalid required boolean yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'enum', '{"enum": {"a": 1}}'::jsonb, '"a"'::jsonb);
  PERFORM pg_temp.assert('H5 malformed enum metadata yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'timestamp', '{}'::jsonb, '"2026-01-01"'::jsonb);
  PERFORM pg_temp.assert('H6 unknown data type yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  -- Well-formed metadata is still evaluated normally.
  v_reason := private.fn_setting_value_invalid_reason(
                'string', '{"required": true, "max": 64}'::jsonb, '"UTC"'::jsonb);
  PERFORM pg_temp.assert('H7 well-formed metadata still validates the value',
                         v_reason IS NULL, COALESCE(v_reason, 'NULL'));
END
$cert$;

-- H8/H9: a blocking definition whose metadata is malformed BLOCKS readiness.
DO $cert$
DECLARE
  v_tenant uuid;
  v_res    jsonb;
  v_check  jsonb;
  v_def    uuid;
  v_saved  jsonb;
BEGIN
  SELECT tenant_id INTO v_tenant FROM _p385_ctx;

  SELECT id, validation_schema INTO v_def, v_saved
    FROM public.setting_definitions
   WHERE key = 'platform.branding.product_name' AND readiness_impact = 'block'
   LIMIT 1;

  IF v_def IS NULL THEN
    PERFORM pg_temp.assert('H8 blocking definition available for metadata test',
                           false, 'definition not found');
    RETURN;
  END IF;

  UPDATE public.setting_definitions
     SET validation_schema = '{"regex": "([unclosed"}'::jsonb
   WHERE id = v_def;

  v_res := private.fn_onboarding_evaluate_readiness_json(v_tenant, 'p385d-cert');
  SELECT c INTO v_check FROM jsonb_array_elements(v_res->'checks') c
   WHERE c->>'checkKey' = 'required_settings_valid';

  PERFORM pg_temp.assert('H8 malformed blocking metadata blocks required_settings_valid',
                         v_check->>'status' = 'blocked', v_check->>'status');
  PERFORM pg_temp.assert('H9 the invalid reason is the bounded invalid_schema token',
                         v_check->'reasonParams'->>'invalidReason' = 'invalid_schema',
                         v_check->'reasonParams'->>'invalidReason');

  UPDATE public.setting_definitions SET validation_schema = v_saved WHERE id = v_def;
END
$cert$;


-- =====================================================================
-- I. Pass 3.8.5E — evaluator volatility, strict metadata typing and the
--    PUBLIC missing-tenant readiness contract.
-- =====================================================================
DO $cert$
DECLARE
  v_vol "char";
BEGIN
  SELECT p.provolatile INTO v_vol
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'private'
     AND p.proname = 'fn_onboarding_evaluate_readiness_json'
     AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'uuid, text';
  PERFORM pg_temp.assert('I1 fn_onboarding_evaluate_readiness_json is VOLATILE',
                         v_vol = 'v', COALESCE(v_vol::text, 'NOT FOUND'));

  SELECT p.provolatile INTO v_vol
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'private'
     AND p.proname = 'fn_onboarding_evaluate_readiness_present_json'
     AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'uuid, text';
  PERFORM pg_temp.assert('I2 fn_onboarding_evaluate_readiness_present_json is VOLATILE',
                         v_vol = 'v', COALESCE(v_vol::text, 'NOT FOUND'));
END
$cert$;

-- I3-I9: strict JSON typing of validation metadata. No coercions are accepted.
DO $cert$
DECLARE
  v_reason text;
BEGIN
  v_reason := private.fn_setting_value_invalid_reason(
                'string', '{"required": "true"}'::jsonb, '"x"'::jsonb);
  PERFORM pg_temp.assert('I3 required as JSON string yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'string', '{"required": 1}'::jsonb, '"x"'::jsonb);
  PERFORM pg_temp.assert('I4 required as JSON number yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'integer', '{"min": "5"}'::jsonb, '7'::jsonb);
  PERFORM pg_temp.assert('I5 min as JSON string yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'integer', '{"max": "100"}'::jsonb, '7'::jsonb);
  PERFORM pg_temp.assert('I6 max as JSON string yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'string', '{"regex": "([unclosed"}'::jsonb, '"x"'::jsonb);
  PERFORM pg_temp.assert('I7 malformed regex yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'enum', '{"enum": []}'::jsonb, '"a"'::jsonb);
  PERFORM pg_temp.assert('I8 malformed enum yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));

  v_reason := private.fn_setting_value_invalid_reason(
                'uuid', '{}'::jsonb, '"x"'::jsonb);
  PERFORM pg_temp.assert('I9 unknown data type yields invalid_schema',
                         v_reason = 'invalid_schema', COALESCE(v_reason, 'NULL'));
END
$cert$;

-- I10-I15: the PUBLIC RPC honours the missing-tenant contract for an
-- authorized caller.
SET LOCAL role = authenticated;
SELECT set_config('request.jwt.claims',
                  json_build_object('sub', (SELECT caller_id FROM _p385_ctx),
                                    'role', 'authenticated')::text,
                  true);

DO $cert$
DECLARE
  v_absent uuid := gen_random_uuid();
  v_res    jsonb;
  v_n      int;
BEGIN
  v_res := public.fn_onboarding_evaluate_readiness(v_absent, 'p385e-cert');

  SELECT jsonb_array_length(v_res->'checks') INTO v_n;
  PERFORM pg_temp.assert('I10 public RPC returns exactly 14 checks',
                         v_n = 14, format('%s check(s)', v_n));

  PERFORM pg_temp.assert('I11 public RPC reports tenant_exists as blocked',
    (SELECT c->>'status' FROM jsonb_array_elements(v_res->'checks') c
      WHERE c->>'checkKey' = 'tenant_exists') = 'blocked',
    (SELECT c->>'status' FROM jsonb_array_elements(v_res->'checks') c
      WHERE c->>'checkKey' = 'tenant_exists'));

  PERFORM pg_temp.assert('I12 public RPC reason code is tenant_missing',
    (SELECT c->>'reasonCode' FROM jsonb_array_elements(v_res->'checks') c
      WHERE c->>'checkKey' = 'tenant_exists') = 'tenant_missing',
    (SELECT c->>'reasonCode' FROM jsonb_array_elements(v_res->'checks') c
      WHERE c->>'checkKey' = 'tenant_exists'));

  PERFORM pg_temp.assert('I13 public RPC overall status is not_ready',
                         v_res->>'overall_status' = 'not_ready',
                         v_res->>'overall_status');

  PERFORM pg_temp.assert('I14 public RPC blocking_count is 1',
                         (v_res->>'blocking_count')::int = 1,
                         v_res->>'blocking_count');

  PERFORM pg_temp.assert('I15 public RPC applicable_count is 1',
                         (v_res->>'applicable_count')::int = 1,
                         v_res->>'applicable_count');
END
$cert$;

RESET role;

-- ---------------------------------------------------------------------
-- Report and verdict
-- ---------------------------------------------------------------------
\echo '=== Pass 3.8.5B — readiness + activation certification ==='
SELECT seq,
       CASE WHEN passed THEN 'PASS' ELSE 'FAIL' END AS result,
       assertion,
       detail
  FROM _p385_results
 ORDER BY seq;

DO $cert$
DECLARE v_fail int; v_total int;
BEGIN
  SELECT count(*) FILTER (WHERE NOT passed), count(*) INTO v_fail, v_total FROM _p385_results;
  RAISE NOTICE 'Pass 3.8.5B certification: % / % assertions passed', v_total - v_fail, v_total;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'Pass 3.8.5B certification FAILED: % assertion(s) failed', v_fail;
  END IF;
END
$cert$;

-- Every fixture (auth user, role grant, tenant, onboarding rows) is discarded.
ROLLBACK;
