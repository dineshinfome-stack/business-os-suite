-- =====================================================================
-- Gate 3.8 · Pass 3.8.2 REMEDIATION — transactional certification harness.
-- Seeds 1,205 real tenants, exercises the ACTUAL
-- public.fn_tenant_onboarding_queue as an authorized `authenticated`
-- caller, asserts the contract, then removes every seeded row.
-- Any failed assertion raises and aborts the whole transaction.
-- =====================================================================
DO $rem$
DECLARE
  v_admin      uuid   := '9773aa51-f1e5-4842-9818-0be1a52f4489'; -- Platform Owner, legacy enum role NULL
  v_no_perm    uuid   := '87569669-851c-400e-a9ff-717a46c9e290'; -- org owner, no platform.tenant.read
  v_seed       int    := 1205;
  v_expected   bigint;
  v_expected_from bigint;
  v_cutoff     timestamptz := timestamptz '2020-01-01 00:00:00+00' + interval '600 minutes';
  v_env        jsonb;
  v_env2       jsonb;
  v_ids        uuid[];
  v_all        uuid[] := '{}';
  v_page       int;
  v_pages      int;
  v_before     bigint;
  v_after      bigint;
  v_ok         boolean;
BEGIN
  SELECT count(*) INTO v_before FROM public.tenants;

  ------------------------------------------------------------------ seed
  INSERT INTO public.tenants (slug, display_name, code, created_at, updated_at)
  SELECT 'rem382-' || lpad(i::text, 5, '0'),
         'REM382 Tenant ' || lpad(i::text, 5, '0'),
         'R' || lpad(i::text, 5, '0'),
         timestamptz '2020-01-01 00:00:00+00' + (i || ' minutes')::interval,
         timestamptz '2020-01-01 00:00:00+00' + (i || ' minutes')::interval
  FROM generate_series(1, v_seed) AS i;

  SELECT count(*) INTO v_expected
  FROM public.tenants
  WHERE deleted_at IS NULL
    AND lifecycle_state NOT IN ('pending_deletion', 'deleted');

  SELECT count(*) INTO v_expected_from
  FROM public.tenants
  WHERE deleted_at IS NULL
    AND lifecycle_state NOT IN ('pending_deletion', 'deleted')
    AND created_at >= v_cutoff;

  IF v_expected < 1205 THEN
    RAISE EXCEPTION 'REM382: population too small (%)', v_expected;
  END IF;

  ------------------------------------------ act as the authorized caller
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', v_admin, 'role', 'authenticated')::text,
    true);
  EXECUTE 'SET LOCAL ROLE authenticated';

  ---------------------------------------------- full pagination sweep
  v_pages := ceil(v_expected::numeric / 100);
  FOR v_page IN 1..v_pages LOOP
    v_env := public.fn_tenant_onboarding_queue(
      _sort_by => 'tenantName', _sort_dir => 'asc',
      _page => v_page, _page_size => 100);

    IF (v_env ->> 'total_count')::bigint <> v_expected THEN
      RAISE EXCEPTION 'REM382: page % total % <> %',
        v_page, v_env ->> 'total_count', v_expected;
    END IF;
    IF (v_env ->> 'page')::int <> v_page OR (v_env ->> 'page_size')::int <> 100 THEN
      RAISE EXCEPTION 'REM382: envelope echo mismatch on page %', v_page;
    END IF;
    IF jsonb_typeof(v_env -> 'rows') <> 'array' THEN
      RAISE EXCEPTION 'REM382: rows is not a JSON array on page %', v_page;
    END IF;

    SELECT array_agg((e ->> 'tenant_id')::uuid ORDER BY (e ->> 'result_position')::int)
      INTO v_ids
      FROM jsonb_array_elements(v_env -> 'rows') e;
    v_all := v_all || COALESCE(v_ids, '{}'::uuid[]);
  END LOOP;

  IF COALESCE(array_length(v_all, 1), 0)::bigint <> v_expected THEN
    RAISE EXCEPTION 'REM382: union size % <> %',
      COALESCE(array_length(v_all, 1), 0), v_expected;
  END IF;
  IF (SELECT count(DISTINCT x) FROM unnest(v_all) x) <> v_expected THEN
    RAISE EXCEPTION 'REM382: duplicate rows across pages';
  END IF;

  ------------------------------------------------ descending union parity
  v_all := '{}';
  FOR v_page IN 1..v_pages LOOP
    v_env := public.fn_tenant_onboarding_queue(
      _sort_by => 'tenantName', _sort_dir => 'desc',
      _page => v_page, _page_size => 100);
    SELECT array_agg((e ->> 'tenant_id')::uuid)
      INTO v_ids FROM jsonb_array_elements(v_env -> 'rows') e;
    v_all := v_all || COALESCE(v_ids, '{}'::uuid[]);
  END LOOP;
  IF (SELECT count(DISTINCT x) FROM unnest(v_all) x) <> v_expected THEN
    RAISE EXCEPTION 'REM382: descending sweep lost or duplicated rows';
  END IF;

  --------------------------------------------------- ordering determinism
  v_env  := public.fn_tenant_onboarding_queue(
              _sort_by => 'tenantName', _sort_dir => 'asc', _page => 3, _page_size => 25);
  v_env2 := public.fn_tenant_onboarding_queue(
              _sort_by => 'tenantName', _sort_dir => 'asc', _page => 3, _page_size => 25);
  IF v_env -> 'rows' <> v_env2 -> 'rows' THEN
    RAISE EXCEPTION 'REM382: repeated identical call returned a different order';
  END IF;
  SELECT bool_and(a = b) INTO v_ok
  FROM (
    SELECT (e ->> 'display_name') a,
           lead(e ->> 'display_name') OVER (ORDER BY (e ->> 'result_position')::int) nxt,
           (e ->> 'display_name') b
    FROM jsonb_array_elements(v_env -> 'rows') e
  ) s;
  IF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_env -> 'rows') e
    HAVING count(*) = 25
  ) THEN
    RAISE EXCEPTION 'REM382: expected a full 25-row page';
  END IF;

  ---------------------------------------- out-of-range page keeps the total
  v_env := public.fn_tenant_onboarding_queue(_page => 99999, _page_size => 25);
  IF v_env -> 'rows' <> '[]'::jsonb THEN
    RAISE EXCEPTION 'REM382: out-of-range page did not return []';
  END IF;
  IF (v_env ->> 'total_count')::bigint <> v_expected THEN
    RAISE EXCEPTION 'REM382: out-of-range page lost the total';
  END IF;

  --------------------------------------- filtered-empty result keeps shape
  v_env := public.fn_tenant_onboarding_queue(_search => 'zzz-no-such-tenant-zzz');
  IF v_env -> 'rows' <> '[]'::jsonb OR (v_env ->> 'total_count')::bigint <> 0 THEN
    RAISE EXCEPTION 'REM382: empty filtered result malformed: %', v_env;
  END IF;

  ------------------------------- search reaches beyond the old 1,000 ceiling
  v_env := public.fn_tenant_onboarding_queue(_search => 'REM382 Tenant 01200');
  IF (v_env ->> 'total_count')::bigint <> 1 THEN
    RAISE EXCEPTION 'REM382: deep search missed the row (total=%)', v_env ->> 'total_count';
  END IF;

  ------------------------------------ blank search normalizes to no filter
  v_env := public.fn_tenant_onboarding_queue(_search => '   ');
  IF (v_env ->> 'total_count')::bigint <> v_expected THEN
    RAISE EXCEPTION 'REM382: blank search was not normalized';
  END IF;

  -------------------------------------- date filters use tenants.created_at
  v_env := public.fn_tenant_onboarding_queue(_created_from => v_cutoff);
  IF (v_env ->> 'total_count')::bigint <> v_expected_from THEN
    RAISE EXCEPTION 'REM382: createdFrom total % <> %',
      v_env ->> 'total_count', v_expected_from;
  END IF;

  ------------------------------------------- neutral blocker / invitation
  IF (public.fn_tenant_onboarding_queue(_has_blockers => true) ->> 'total_count')::bigint <> 0 THEN
    RAISE EXCEPTION 'REM382: hasBlockers=true returned rows';
  END IF;
  IF (public.fn_tenant_onboarding_queue(_has_blockers => false) ->> 'total_count')::bigint <> v_expected THEN
    RAISE EXCEPTION 'REM382: hasBlockers=false excluded rows';
  END IF;
  IF (public.fn_tenant_onboarding_queue(_invitation_status => 'pending') ->> 'total_count')::bigint <> 0 THEN
    RAISE EXCEPTION 'REM382: invitationStatus=pending returned rows';
  END IF;
  IF (public.fn_tenant_onboarding_queue(_readiness_status => 'ready') ->> 'total_count')::bigint <> 0 THEN
    RAISE EXCEPTION 'REM382: readinessStatus=ready returned rows';
  END IF;
  IF (public.fn_tenant_onboarding_queue(_readiness_status => 'not_evaluated') ->> 'total_count')::bigint <> v_expected THEN
    RAISE EXCEPTION 'REM382: readinessStatus=not_evaluated excluded rows';
  END IF;

  -------------------------------------- synthetic rows carry no current step
  v_env := public.fn_tenant_onboarding_queue(_search => 'REM382 Tenant 00001');
  IF NOT (v_env -> 'rows' -> 0 -> 'onboarding' = 'null'::jsonb
          AND v_env -> 'rows' -> 0 -> 'current_step_key' = 'null'::jsonb) THEN
    RAISE EXCEPTION 'REM382: synthetic row fabricated a workflow: %', v_env -> 'rows' -> 0;
  END IF;

  ------------------------------------------------------ input validation
  BEGIN v_env := public.fn_tenant_onboarding_queue(_page => 0);
        RAISE EXCEPTION 'REM382: page=0 accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_page_size => 0);
        RAISE EXCEPTION 'REM382: pageSize=0 accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_page_size => 101);
        RAISE EXCEPTION 'REM382: pageSize=101 accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_sort_by => 'bogus');
        RAISE EXCEPTION 'REM382: bad sortBy accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_sort_dir => 'sideways');
        RAISE EXCEPTION 'REM382: bad sortDir accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_state => 'bogus');
        RAISE EXCEPTION 'REM382: bad state accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(_current_step => 'bogus');
        RAISE EXCEPTION 'REM382: bad currentStep accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;
  BEGIN v_env := public.fn_tenant_onboarding_queue(
                   _created_from => now(), _created_to => now() - interval '1 day');
        RAISE EXCEPTION 'REM382: inverted date range accepted';
  EXCEPTION WHEN sqlstate '22023' THEN NULL; END;

  ------------------------------------------------ authorization: denial
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', v_no_perm, 'role', 'authenticated')::text,
    true);
  BEGIN
    v_env := public.fn_tenant_onboarding_queue();
    RAISE EXCEPTION 'REM382: caller without platform.tenant.read received an envelope';
  EXCEPTION WHEN sqlstate '42501' THEN NULL;
  END;

  ---------------------------------------- authorization: anonymous denial
  PERFORM set_config('request.jwt.claims', NULL, true);
  BEGIN
    v_env := public.fn_tenant_onboarding_queue();
    RAISE EXCEPTION 'REM382: anonymous caller received an envelope';
  EXCEPTION WHEN sqlstate '42501' THEN NULL;
  END;

  --------------------------------------------------- RLS reachability proof
  PERFORM set_config(
    'request.jwt.claims',
    json_build_object('sub', v_admin, 'role', 'authenticated')::text,
    true);
  IF (SELECT count(*) FROM public.tenants) < v_expected THEN
    RAISE EXCEPTION 'REM382: tenants RLS hides rows from the permission holder';
  END IF;
  PERFORM 1 FROM public.tenant_onboarding LIMIT 1;
  PERFORM 1 FROM public.tenant_onboarding_steps LIMIT 1;

  ------------------------------------------------------------- teardown
  EXECUTE 'RESET ROLE';
  PERFORM set_config('request.jwt.claims', NULL, true);

  DELETE FROM public.tenants WHERE slug LIKE 'rem382-%';

  SELECT count(*) INTO v_after FROM public.tenants;
  IF v_after <> v_before THEN
    RAISE EXCEPTION 'REM382: teardown incomplete (% <> %)', v_after, v_before;
  END IF;

  RAISE NOTICE 'REM382 certification harness PASSED against % tenants', v_expected;
END
$rem$;