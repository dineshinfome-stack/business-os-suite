-- =====================================================================
-- SPR-MOD-001-003 · Gate 3.8 · Pass 3.8.2
-- Deterministic queue certification harness (OUT OF THE MIGRATION CHAIN).
--
-- Authority document ... MIG-20260726-GATE38-PASS382-HISTORY-REPAIR
-- Approval SHA ......... 303d2f7bc2158b04e88811ad5a3fcda39262b92d
--
-- This file lives outside supabase/migrations and is therefore never
-- discovered, applied or recorded by the migration tooling. It certifies the
-- behaviour of public.fn_tenant_onboarding_queue, which is owned solely by
-- supabase/migrations/20260726113455_f79b36fd-9178-4def-91a8-cbc298d95e21.sql.
--
-- Contract:
--   * one explicit transaction, always ended by an explicit ROLLBACK;
--   * deterministic synthetic identities only — never a live user;
--   * the RBAC catalog (permissions / roles / role_permissions) is read only;
--   * any failed assertion raises and aborts the whole transaction;
--   * the fresh-session residue postcheck
--     (pass_3_8_2_queue_certification_postcheck.sql) MUST be run afterwards,
--     whether this harness succeeded or failed.
--
-- Usage:
--   psql "$DB" -f supabase/tests/pass_3_8_2_queue_certification.sql
--   PGOPTIONS="-c pass382.force_failure=on" psql "$DB" -f <this file>
--
-- See supabase/tests/README.md for the full execution sequence.
-- =====================================================================

\set ON_ERROR_STOP on

BEGIN;

DO $cert$
DECLARE
  -- ------------------------------------------------ synthetic constants
  c_user_ok    uuid := 'a5170000-0000-4000-8000-000000000001';
  c_user_deny  uuid := 'a5170000-0000-4000-8000-000000000002';
  c_email_ok   text := 'pass382.cert.authorized@certification.invalid';
  c_email_deny text := 'pass382.cert.denied@certification.invalid';
  c_slug_pfx   text := 'cert3820-';
  c_name_pfx   text := 'CERT3820 Tenant ';
  c_uuid_pfx   text := 'ce773820-0000-4000-8000-';
  c_seed       int  := 1205;
  c_base       timestamptz := timestamptz '2020-03-01 00:00:00+00';
  c_cutoff     timestamptz := timestamptz '2020-03-01 00:00:00+00' + interval '600 minutes';
  c_sig        text := 'public.fn_tenant_onboarding_queue(text,text,text,boolean,text,text,'
                       || 'timestamp with time zone,timestamp with time zone,text,text,integer,integer)';

  v_role_ok    uuid;
  v_perm_id    uuid;
  v_n          bigint;
  v_before     bigint;
  v_expected   bigint;
  v_expect_dt  bigint;
  v_pages      int;
  v_page       int;
  v_env        jsonb;
  v_env2       jsonb;
  v_ids        uuid[];
  v_all        uuid[] := '{}';
  v_force      text := lower(coalesce(current_setting('pass382.force_failure', true), 'off'));
BEGIN
  -- ==================================================================
  -- RBAC catalog preconditions — SELECT only, never repaired or seeded
  -- ==================================================================
  SELECT count(*) INTO v_n
  FROM public.permissions
  WHERE key = 'platform.tenant.read' AND deprecated_at IS NULL;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: expected exactly 1 active platform.tenant.read permission, found %', v_n;
  END IF;
  SELECT id INTO v_perm_id FROM public.permissions WHERE key = 'platform.tenant.read';

  SELECT count(*) INTO v_n
  FROM public.roles r
  WHERE r.key = 'platform_owner' AND r.scope = 'platform';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: expected exactly 1 platform_owner platform role, found %', v_n;
  END IF;
  SELECT r.id INTO v_role_ok
  FROM public.roles r WHERE r.key = 'platform_owner' AND r.scope = 'platform';

  IF NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    WHERE rp.role_id = v_role_ok AND rp.permission_id = v_perm_id
  ) THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: platform_owner is not linked to platform.tenant.read';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'private' AND p.proname = 'fn_user_has_permission'
  ) THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: private.fn_user_has_permission is missing';
  END IF;

  SELECT count(*) INTO v_n
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'fn_tenant_onboarding_queue'
    AND array_to_string(p.proargtypes::regtype[], ',') =
        'text,text,text,boolean,text,text,timestamp with time zone,'
        || 'timestamp with time zone,text,text,integer,integer';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: approved queue signature not found exactly once (%)', v_n;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'fn_tenant_onboarding_queue' AND p.prosecdef
  ) THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: queue routine is not SECURITY INVOKER';
  END IF;

  IF NOT has_function_privilege('authenticated', c_sig, 'EXECUTE') THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: authenticated lacks EXECUTE on the queue routine';
  END IF;
  IF has_function_privilege('anon', c_sig, 'EXECUTE')
     OR has_function_privilege('service_role', c_sig, 'EXECUTE') THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: anon or service_role holds EXECUTE on the queue routine';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace,
         LATERAL aclexplode(p.proacl) a
    WHERE n.nspname = 'public' AND p.proname = 'fn_tenant_onboarding_queue'
      AND a.grantee = 0
  ) THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: PUBLIC holds a privilege on the queue routine';
  END IF;

  -- ==================================================================
  -- Synthetic-identity collision guard
  -- ==================================================================
  IF EXISTS (SELECT 1 FROM auth.users WHERE id IN (c_user_ok, c_user_deny))
     OR EXISTS (SELECT 1 FROM auth.users WHERE email IN (c_email_ok, c_email_deny)) THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: synthetic certification identities already exist';
  END IF;
  IF EXISTS (SELECT 1 FROM public.tenants WHERE slug::text LIKE c_slug_pfx || '%')
     OR EXISTS (SELECT 1 FROM public.tenants WHERE id::text LIKE c_uuid_pfx || '%') THEN
    RAISE EXCEPTION 'PASS382-CERT precondition: certification tenant fixtures already exist';
  END IF;

  -- ==================================================================
  -- Fixtures (transaction-local, always rolled back)
  -- ==================================================================
  -- The platform's new-auth-user trigger provisions a workspace organization,
  -- which is neither wanted nor valid for a synthetic certification identity.
  -- Triggers are suppressed for this single INSERT and immediately restored;
  -- both settings are transaction-local and vanish with the ROLLBACK.
  SET LOCAL session_replication_role = replica;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', c_user_ok, 'authenticated', 'authenticated',
     c_email_ok, now(), '{"provider":"synthetic","providers":["synthetic"]}'::jsonb,
     '{"full_name":"PASS382 Certification Authorized"}'::jsonb, now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', c_user_deny, 'authenticated', 'authenticated',
     c_email_deny, now(), '{"provider":"synthetic","providers":["synthetic"]}'::jsonb,
     '{"full_name":"PASS382 Certification Denied"}'::jsonb, now(), now(), '', '', '', '');

  SET LOCAL session_replication_role = origin;

  -- Canonical permission path only: role_id set, organization_id NULL,
  -- legacy enum role NULL. The denied identity receives no role at all.
  INSERT INTO public.user_roles (user_id, role, role_id, organization_id)
  VALUES (c_user_ok, NULL, v_role_ok, NULL);

  SELECT count(*) INTO v_before
  FROM public.tenants
  WHERE deleted_at IS NULL
    AND lifecycle_state NOT IN ('pending_deletion', 'deleted');

  INSERT INTO public.tenants (id, slug, display_name, code, created_at, updated_at)
  SELECT (c_uuid_pfx || lpad(i::text, 12, '0'))::uuid,
         c_slug_pfx || lpad(i::text, 5, '0'),
         c_name_pfx || lpad(i::text, 5, '0'),
         'C382' || lpad(i::text, 5, '0'),
         c_base + (i || ' minutes')::interval,
         c_base + (i || ' minutes')::interval
  FROM generate_series(1, c_seed) AS i;

  v_expected := v_before + c_seed;

  SELECT count(*) INTO v_n
  FROM public.tenants
  WHERE deleted_at IS NULL
    AND lifecycle_state NOT IN ('pending_deletion', 'deleted');
  IF v_n <> v_expected THEN
    RAISE EXCEPTION 'PASS382-CERT: eligible population % <> expected %', v_n, v_expected;
  END IF;

  SELECT count(*) INTO v_expect_dt
  FROM public.tenants
  WHERE deleted_at IS NULL
    AND lifecycle_state NOT IN ('pending_deletion', 'deleted')
    AND created_at >= c_cutoff;

  -- ------------------------------------------------ forced-failure control
  IF v_force = 'on' THEN
    RAISE EXCEPTION 'PASS382-CERT: forced failure requested (pass382.force_failure=on) after fixture creation';
  END IF;

  -- ==================================================================
  -- Act as the synthetic authorized caller
  -- ==================================================================
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', c_user_ok, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ---------------------------------------------------------- CERT-001
  v_pages := ceil(v_expected::numeric / 100);
  FOR v_page IN 1..v_pages LOOP
    v_env := public.fn_tenant_onboarding_queue(
      _sort_by => 'tenantName', _sort_dir => 'asc',
      _page => v_page, _page_size => 100);
    IF (v_env ->> 'total_count')::bigint <> v_expected THEN
      RAISE EXCEPTION 'PASS382-CERT-001: page % total % <> %', v_page, v_env ->> 'total_count', v_expected;
    END IF;
    IF (v_env ->> 'page')::int <> v_page OR (v_env ->> 'page_size')::int <> 100 THEN
      RAISE EXCEPTION 'PASS382-CERT-001: envelope echo mismatch on page %', v_page;
    END IF;
    IF jsonb_typeof(v_env -> 'rows') <> 'array' THEN
      RAISE EXCEPTION 'PASS382-CERT-001: rows is not a JSON array on page %', v_page;
    END IF;
    SELECT array_agg((e ->> 'tenant_id')::uuid ORDER BY (e ->> 'result_position')::int)
      INTO v_ids FROM jsonb_array_elements(v_env -> 'rows') e;
    v_all := v_all || COALESCE(v_ids, '{}'::uuid[]);
  END LOOP;
  RAISE NOTICE 'PASS382-CERT-001 PASS';

  -- ---------------------------------------------------------- CERT-002
  IF COALESCE(array_length(v_all, 1), 0)::bigint <> v_expected THEN
    RAISE EXCEPTION 'PASS382-CERT-002: ascending union size % <> %',
      COALESCE(array_length(v_all, 1), 0), v_expected;
  END IF;
  IF (SELECT count(DISTINCT x) FROM unnest(v_all) x) <> v_expected THEN
    RAISE EXCEPTION 'PASS382-CERT-002: ascending sweep duplicated or omitted rows';
  END IF;
  RAISE NOTICE 'PASS382-CERT-002 PASS';

  -- ---------------------------------------------------------- CERT-003
  v_all := '{}';
  FOR v_page IN 1..v_pages LOOP
    v_env := public.fn_tenant_onboarding_queue(
      _sort_by => 'tenantName', _sort_dir => 'desc',
      _page => v_page, _page_size => 100);
    SELECT array_agg((e ->> 'tenant_id')::uuid) INTO v_ids
      FROM jsonb_array_elements(v_env -> 'rows') e;
    v_all := v_all || COALESCE(v_ids, '{}'::uuid[]);
  END LOOP;
  IF COALESCE(array_length(v_all, 1), 0)::bigint <> v_expected THEN
    RAISE EXCEPTION 'PASS382-CERT-003: descending union size % <> %',
      COALESCE(array_length(v_all, 1), 0), v_expected;
  END IF;
  IF (SELECT count(DISTINCT x) FROM unnest(v_all) x) <> v_expected THEN
    RAISE EXCEPTION 'PASS382-CERT-003: descending sweep duplicated or omitted rows';
  END IF;
  RAISE NOTICE 'PASS382-CERT-003 PASS';

  -- ---------------------------------------------------------- CERT-004
  v_env  := public.fn_tenant_onboarding_queue(
              _sort_by => 'tenantName', _sort_dir => 'asc', _page => 3, _page_size => 25);
  v_env2 := public.fn_tenant_onboarding_queue(
              _sort_by => 'tenantName', _sort_dir => 'asc', _page => 3, _page_size => 25);
  IF (v_env -> 'rows')::text <> (v_env2 -> 'rows')::text THEN
    RAISE EXCEPTION 'PASS382-CERT-004: repeated identical call returned different rows';
  END IF;
  IF jsonb_array_length(v_env -> 'rows') <> 25 THEN
    RAISE EXCEPTION 'PASS382-CERT-004: expected a full 25-row page, got %',
      jsonb_array_length(v_env -> 'rows');
  END IF;
  RAISE NOTICE 'PASS382-CERT-004 PASS';

  -- ---------------------------------------------------------- CERT-005
  v_env := public.fn_tenant_onboarding_queue(_page => 99999, _page_size => 25);
  IF v_env -> 'rows' <> '[]'::jsonb THEN
    RAISE EXCEPTION 'PASS382-CERT-005: out-of-range page did not return []';
  END IF;
  IF (v_env ->> 'total_count')::bigint <> v_expected THEN
    RAISE EXCEPTION 'PASS382-CERT-005: out-of-range page lost the exact total';
  END IF;
  RAISE NOTICE 'PASS382-CERT-005 PASS';

  -- ---------------------------------------------------------- CERT-006
  v_env := public.fn_tenant_onboarding_queue(_search => 'zzz-no-such-tenant-zzz');
  IF v_env -> 'rows' <> '[]'::jsonb OR (v_env ->> 'total_count')::bigint <> 0 THEN
    RAISE EXCEPTION 'PASS382-CERT-006: filtered-empty envelope malformed: %', v_env;
  END IF;
  RAISE NOTICE 'PASS382-CERT-006 PASS';

  -- ---------------------------------------------------------- CERT-007
  v_env := public.fn_tenant_onboarding_queue(_search => c_name_pfx || '01200');
  IF (v_env ->> 'total_count')::bigint <> 1 THEN
    RAISE EXCEPTION 'PASS382-CERT-007: deep search beyond ordinal 1000 returned total %',
      v_env ->> 'total_count';
  END IF;
  RAISE NOTICE 'PASS382-CERT-007 PASS';

  -- ---------------------------------------------------------- CERT-008
  v_env := public.fn_tenant_onboarding_queue(_search => '   ');
  IF (v_env ->> 'total_count')::bigint <> v_expected THEN
    RAISE EXCEPTION 'PASS382-CERT-008: whitespace-only search was not normalized';
  END IF;
  RAISE NOTICE 'PASS382-CERT-008 PASS';

  -- ---------------------------------------------------------- CERT-009
  v_env := public.fn_tenant_onboarding_queue(_created_from => c_cutoff);
  IF (v_env ->> 'total_count')::bigint <> v_expect_dt THEN
    RAISE EXCEPTION 'PASS382-CERT-009: createdFrom total % <> independently computed %',
      v_env ->> 'total_count', v_expect_dt;
  END IF;
  RAISE NOTICE 'PASS382-CERT-009 PASS';

  -- ---------------------------------------------------------- CERT-010
  IF (public.fn_tenant_onboarding_queue(_has_blockers => true) ->> 'total_count')::bigint <> 0 THEN
    RAISE EXCEPTION 'PASS382-CERT-010: hasBlockers=true returned rows';
  END IF;
  IF (public.fn_tenant_onboarding_queue(_has_blockers => false) ->> 'total_count')::bigint <> v_expected THEN
    RAISE EXCEPTION 'PASS382-CERT-010: hasBlockers=false excluded rows';
  END IF;
  IF (public.fn_tenant_onboarding_queue(_invitation_status => 'pending') ->> 'total_count')::bigint <> 0 THEN
    RAISE EXCEPTION 'PASS382-CERT-010: invitationStatus=pending returned rows';
  END IF;
  IF (public.fn_tenant_onboarding_queue(_readiness_status => 'ready') ->> 'total_count')::bigint <> 0 THEN
    RAISE EXCEPTION 'PASS382-CERT-010: readinessStatus=ready returned rows';
  END IF;
  IF (public.fn_tenant_onboarding_queue(_readiness_status => 'not_evaluated') ->> 'total_count')::bigint <> v_expected THEN
    RAISE EXCEPTION 'PASS382-CERT-010: readinessStatus=not_evaluated excluded rows';
  END IF;
  RAISE NOTICE 'PASS382-CERT-010 PASS';

  -- ---------------------------------------------------------- CERT-011
  v_env := public.fn_tenant_onboarding_queue(_search => c_name_pfx || '00001');
  IF NOT (v_env -> 'rows' -> 0 -> 'onboarding' = 'null'::jsonb
          AND v_env -> 'rows' -> 0 -> 'current_step_key' = 'null'::jsonb) THEN
    RAISE EXCEPTION 'PASS382-CERT-011: synthetic row fabricated a workflow: %', v_env -> 'rows' -> 0;
  END IF;
  RAISE NOTICE 'PASS382-CERT-011 PASS';

  -- ---------------------------------------------------------- CERT-012
  BEGIN v_env := public.fn_tenant_onboarding_queue(_page => 0);
        RAISE EXCEPTION 'PASS382-CERT-012: page=0 accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_page_size => 0);
        RAISE EXCEPTION 'PASS382-CERT-012: pageSize=0 accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_page_size => 101);
        RAISE EXCEPTION 'PASS382-CERT-012: pageSize=101 accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_sort_by => 'bogus');
        RAISE EXCEPTION 'PASS382-CERT-012: invalid sortBy accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_sort_dir => 'sideways');
        RAISE EXCEPTION 'PASS382-CERT-012: invalid sortDir accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_state => 'bogus');
        RAISE EXCEPTION 'PASS382-CERT-012: invalid state accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_current_step => 'bogus');
        RAISE EXCEPTION 'PASS382-CERT-012: invalid currentStep accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(
                   _created_from => now(), _created_to => now() - interval '1 day');
        RAISE EXCEPTION 'PASS382-CERT-012: inverted date range accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  RAISE NOTICE 'PASS382-CERT-012 PASS';

  -- ---------------------------------------------------------- CERT-013
  IF NOT private.fn_user_has_permission(c_user_ok, NULL, 'platform.tenant.read') THEN
    RAISE EXCEPTION 'PASS382-CERT-013: synthetic authorized identity lacks platform.tenant.read';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = c_user_ok AND role IS NOT NULL) THEN
    RAISE EXCEPTION 'PASS382-CERT-013: synthetic authorized identity carries a legacy enum role';
  END IF;
  v_env := public.fn_tenant_onboarding_queue(_page => 1, _page_size => 10);
  IF (v_env ->> 'total_count')::bigint <> v_expected
     OR jsonb_array_length(v_env -> 'rows') <> 10 THEN
    RAISE EXCEPTION 'PASS382-CERT-013: canonical permission holder received a malformed envelope';
  END IF;
  RAISE NOTICE 'PASS382-CERT-013 PASS';

  -- ---------------------------------------------------------- CERT-016
  -- (evaluated while the authorized synthetic claims are still active)
  SELECT count(*) INTO v_n FROM public.tenants WHERE id::text LIKE c_uuid_pfx || '%';
  IF v_n <> c_seed THEN
    RAISE EXCEPTION 'PASS382-CERT-016: RLS hid certification tenants from the permission holder (% of %)',
      v_n, c_seed;
  END IF;
  PERFORM count(*) FROM public.tenant_onboarding;
  PERFORM count(*) FROM public.tenant_onboarding_steps;
  RAISE NOTICE 'PASS382-CERT-016 PASS';

  -- ---------------------------------------------------------- CERT-014
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', c_user_deny, 'role', 'authenticated')::text, true);
  IF private.fn_user_has_permission(c_user_deny, NULL, 'platform.tenant.read') THEN
    RAISE EXCEPTION 'PASS382-CERT-014: synthetic denied identity unexpectedly holds platform.tenant.read';
  END IF;
  BEGIN
    v_env := public.fn_tenant_onboarding_queue(_page => 1, _page_size => 10);
    RAISE EXCEPTION 'PASS382-CERT-014: denied identity received an envelope: %', v_env;
  EXCEPTION WHEN sqlstate '42501' THEN NULL; END;
  RAISE NOTICE 'PASS382-CERT-014 PASS';

  -- ---------------------------------------------------------- CERT-015
  PERFORM set_config('request.jwt.claims', '', true);
  BEGIN
    v_env := public.fn_tenant_onboarding_queue(_page => 1, _page_size => 10);
    RAISE EXCEPTION 'PASS382-CERT-015: anonymous caller received an envelope: %', v_env;
  EXCEPTION WHEN sqlstate '42501' THEN NULL; END;
  RAISE NOTICE 'PASS382-CERT-015 PASS';

  -- ------------------------------- supplemental ACL check (not numbered)
  EXECUTE 'SET LOCAL ROLE NONE';
  IF has_function_privilege('anon', c_sig, 'EXECUTE') THEN
    RAISE EXCEPTION 'PASS382-CERT supplemental ACL: anon can invoke the queue routine';
  END IF;

  -- --------------------------------------------------------- teardown
  PERFORM set_config('request.jwt.claims', '', true);
END
$cert$;

-- Fixtures are never committed. This harness always ends here.
ROLLBACK;
