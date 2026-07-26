-- =====================================================================
-- SPR-MOD-001-003 · Gate 3.8 · Pass 3.8.2
-- Mandatory fresh-session residue postcheck for the queue certification
-- harness (pass_3_8_2_queue_certification.sql).
--
-- MUST be run in a NEW psql session after every harness run — success,
-- failure, or forced failure — because a rollback is only credible if an
-- independent session can still see nothing.
--
-- This file is read-only. It creates nothing, deletes nothing, and lives
-- outside supabase/migrations, so the migration tooling never sees it.
--
-- Usage:
--   psql "$DB" -f supabase/tests/pass_3_8_2_queue_certification_postcheck.sql
-- =====================================================================

\set ON_ERROR_STOP on

DO $post$
DECLARE
  c_user_ok    uuid := 'a5170000-0000-4000-8000-000000000001';
  c_user_deny  uuid := 'a5170000-0000-4000-8000-000000000002';
  c_email_ok   text := 'pass382.cert.authorized@certification.invalid';
  c_email_deny text := 'pass382.cert.denied@certification.invalid';
  c_slug_pfx   text := 'cert3820-';
  c_name_pfx   text := 'CERT3820 Tenant ';
  c_uuid_pfx   text := 'ce773820-0000-4000-8000-';
  v_n          bigint;
BEGIN
  IF current_setting('transaction_isolation', true) IS NULL THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: no live session';
  END IF;

  -- 1. Synthetic identities
  SELECT count(*) INTO v_n FROM auth.users
   WHERE id IN (c_user_ok, c_user_deny) OR email IN (c_email_ok, c_email_deny);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: % synthetic auth.users row(s) survived', v_n;
  END IF;

  -- 2. Role grants
  SELECT count(*) INTO v_n FROM public.user_roles WHERE user_id IN (c_user_ok, c_user_deny);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: % synthetic user_roles row(s) survived', v_n;
  END IF;

  -- 3. Profiles / organizations possibly produced by platform triggers
  SELECT count(*) INTO v_n FROM public.profiles WHERE id IN (c_user_ok, c_user_deny);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: % synthetic profile row(s) survived', v_n;
  END IF;
  SELECT count(*) INTO v_n FROM public.organizations
   WHERE created_by IN (c_user_ok, c_user_deny) OR updated_by IN (c_user_ok, c_user_deny);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: % synthetic organization row(s) survived', v_n;
  END IF;

  -- 4. Tenant fixtures
  SELECT count(*) INTO v_n FROM public.tenants
   WHERE id::text LIKE c_uuid_pfx || '%'
      OR slug::text LIKE c_slug_pfx || '%'
      OR display_name LIKE c_name_pfx || '%'
      OR code LIKE 'C382%';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: % certification tenant row(s) survived', v_n;
  END IF;

  -- 5. Onboarding workflow rows for certification tenants
  SELECT count(*) INTO v_n FROM public.tenant_onboarding
   WHERE tenant_id::text LIKE c_uuid_pfx || '%';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: % certification onboarding row(s) survived', v_n;
  END IF;
  SELECT count(*) INTO v_n FROM public.tenant_onboarding_steps
   WHERE tenant_id::text LIKE c_uuid_pfx || '%';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: % certification onboarding step row(s) survived', v_n;
  END IF;

  -- 6. RBAC catalog is intact and was never duplicated by the harness
  SELECT count(*) INTO v_n FROM public.permissions WHERE key = 'platform.tenant.read';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: platform.tenant.read permission count is % (expected 1)', v_n;
  END IF;
  SELECT count(*) INTO v_n FROM public.roles WHERE key = 'platform_owner' AND scope = 'platform';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: platform_owner role count is % (expected 1)', v_n;
  END IF;

  -- 7. Migration history was not touched by the harness
  SELECT count(*) INTO v_n FROM supabase_migrations.schema_migrations
   WHERE name ILIKE '%certification%' OR name ILIKE '%pass_3_8_2%';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: % certification row(s) present in migration history', v_n;
  END IF;

  -- 8. Session-level replication role is normal (no leaked suppression)
  IF current_setting('session_replication_role') <> 'origin' THEN
    RAISE EXCEPTION 'PASS382-POSTCHECK: session_replication_role is %',
      current_setting('session_replication_role');
  END IF;

  RAISE NOTICE 'PASS382-POSTCHECK-RESIDUE PASS';
END
$post$;
