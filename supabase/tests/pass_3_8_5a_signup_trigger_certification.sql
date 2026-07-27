-- =====================================================================
-- Pass 3.8.5A — Signup Trigger Certification Harness
-- FINDING-AUTH-SIGNUP-TENANT-FK-20260726
--
-- Certifies that private.fn_handle_new_auth_user() is a profile-only,
-- idempotent, hardened SECURITY DEFINER trigger function, and that a real
-- auth.users INSERT creates exactly one profile and NOTHING else.
--
-- Usage:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--        -f supabase/tests/pass_3_8_5a_signup_trigger_certification.sql
--
-- Safety:
--   * Every assertion is fixture-scoped. Global row counts are never used
--     as evidence of absence, because a shared staging database may receive
--     unrelated concurrent writes.
--   * All fixtures are created and destroyed inside a single transaction
--     that is ROLLED BACK at the end. Nothing is persisted.
-- =====================================================================

\set ON_ERROR_STOP on
\timing off

BEGIN;

-- Fixture identity, unique per run.
CREATE TEMP TABLE _p385a_ctx ON COMMIT DROP AS
SELECT fixture_user_id,
       fixture_user_id_nometa,
       fixture_user_id_nullemail,
       -- E.164-safe synthetic phone derived from the fixture uuid so parallel
       -- runs cannot collide on auth.users.phone uniqueness.
       '+1999' || substr(
         translate(replace(fixture_user_id_nullemail::text, '-', ''), 'abcdef', '012345'),
         1, 10) AS fixture_phone_nullemail
  FROM (
    SELECT gen_random_uuid() AS fixture_user_id,
           gen_random_uuid() AS fixture_user_id_nometa,
           gen_random_uuid() AS fixture_user_id_nullemail
  ) s;

CREATE TEMP TABLE _p385a_results (
  seq        int  GENERATED ALWAYS AS IDENTITY,
  assertion  text NOT NULL,
  passed     boolean NOT NULL,
  detail     text
) ON COMMIT DROP;

CREATE OR REPLACE FUNCTION pg_temp.assert(_name text, _passed boolean, _detail text DEFAULT NULL)
RETURNS void LANGUAGE sql AS $$
  INSERT INTO _p385a_results (assertion, passed, detail) VALUES (_name, _passed, _detail);
$$;

-- ---------------------------------------------------------------------
-- SECTION A — Definition, ownership, hardening and privileges
-- Function is resolved by namespace + name + zero-argument identity.
-- ---------------------------------------------------------------------
DO $cert$
DECLARE
  v_oid        oid;
  v_count      int;
  v_def        text;
  v_owner      text;
  v_secdef     boolean;
  v_config     text[];
  v_norm       text;
  v_public_ex  boolean;
BEGIN
  SELECT count(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'private'
     AND p.proname = 'fn_handle_new_auth_user'
     AND p.pronargs = 0;
  PERFORM pg_temp.assert('A0 exactly one zero-arg private.fn_handle_new_auth_user',
                         v_count = 1, format('found %s', v_count));
  IF v_count <> 1 THEN
    RETURN;
  END IF;

  SELECT p.oid, pg_get_functiondef(p.oid), pg_get_userbyid(p.proowner),
         p.prosecdef, p.proconfig
    INTO v_oid, v_def, v_owner, v_secdef, v_config
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'private'
     AND p.proname = 'fn_handle_new_auth_user'
     AND p.pronargs = 0;

  -- A1 exactly one enabled AFTER INSERT row trigger on auth.users bound to it
  SELECT count(*) INTO v_count
    FROM pg_trigger t
   WHERE t.tgrelid = 'auth.users'::regclass
     AND t.tgfoid  = v_oid
     AND NOT t.tgisinternal
     AND t.tgenabled <> 'D'
     AND (t.tgtype & 1) = 1    -- FOR EACH ROW
     AND (t.tgtype & 2) = 0    -- AFTER (not BEFORE)
     AND (t.tgtype & 4) = 4;   -- INSERT
  PERFORM pg_temp.assert('A1 exactly one enabled AFTER INSERT ROW trigger on auth.users',
                         v_count = 1, format('found %s', v_count));

  -- A2 owner
  PERFORM pg_temp.assert('A2 function owner is postgres', v_owner = 'postgres', v_owner);

  -- A3 SECURITY DEFINER
  PERFORM pg_temp.assert('A3 function is SECURITY DEFINER', v_secdef, v_secdef::text);

  -- A4 normalized search_path == pg_catalog, public
  SELECT lower(regexp_replace(regexp_replace(c, '^search_path\s*=\s*', ''), '["\s]', '', 'g'))
    INTO v_norm
    FROM unnest(COALESCE(v_config, ARRAY[]::text[])) AS c
   WHERE c ILIKE 'search_path=%'
   LIMIT 1;
  PERFORM pg_temp.assert('A4 search_path normalizes to pg_catalog,public',
                         v_norm = 'pg_catalog,public', COALESCE(v_norm, '<unset>'));

  -- A5a anon / authenticated hold no EXECUTE
  PERFORM pg_temp.assert('A5a anon cannot EXECUTE',
                         NOT has_function_privilege('anon', v_oid, 'EXECUTE'));
  PERFORM pg_temp.assert('A5b authenticated cannot EXECUTE',
                         NOT has_function_privilege('authenticated', v_oid, 'EXECUTE'));

  -- A5c PUBLIC is an ACL pseudo-role (grantee OID 0); inspect proacl directly.
  --     has_function_privilege('public', ...) is NOT a valid PUBLIC check.
  SELECT EXISTS (
    SELECT 1
      FROM pg_proc p, aclexplode(p.proacl) a
     WHERE p.oid = v_oid
       AND a.grantee = 0
       AND a.privilege_type = 'EXECUTE'
  ) INTO v_public_ex;
  PERFORM pg_temp.assert('A5c PUBLIC holds no EXECUTE grant (proacl/aclexplode)',
                         NOT v_public_ex,
                         (SELECT COALESCE(p.proacl::text, '<null acl>') FROM pg_proc p WHERE p.oid = v_oid));

  -- A6 body carries the approved conflict policy and writes nothing else
  PERFORM pg_temp.assert('A6a body uses ON CONFLICT (id) DO NOTHING on profiles',
                         v_def ~* 'ON\s+CONFLICT\s*\(\s*id\s*\)\s*DO\s+NOTHING');
  PERFORM pg_temp.assert('A6b body writes no tenants',
                         v_def !~* '(insert|update|delete)[^;]*\mpublic\.tenants\M');
  PERFORM pg_temp.assert('A6c body writes no organizations',
                         v_def !~* '(insert|update|delete)[^;]*\mpublic\.organizations\M');
  PERFORM pg_temp.assert('A6d body writes no organization_members',
                         v_def !~* '(insert|update|delete)[^;]*\mpublic\.organization_members\M');
  PERFORM pg_temp.assert('A6e body writes no user_roles',
                         v_def !~* '(insert|update|delete)[^;]*\mpublic\.user_roles\M');
END
$cert$;

-- ---------------------------------------------------------------------
-- SECTION B — Behaviour of a real auth.users INSERT (fixture-scoped)
-- ---------------------------------------------------------------------
DO $cert$
DECLARE
  v_uid     uuid;
  v_uid2    uuid;
  v_count   int;
  v_display text;
BEGIN
  SELECT fixture_user_id, fixture_user_id_nometa INTO v_uid, v_uid2 FROM _p385a_ctx;

  -- B1 hostile metadata must be ignored entirely
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password,
                          email_confirmed_at, created_at, updated_at,
                          raw_app_meta_data, raw_user_meta_data)
  VALUES (v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          'p385a+' || replace(v_uid::text, '-', '') || '@certification.invalid',
          crypt('p385a-disposable', gen_salt('bf')), now(), now(), now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          jsonb_build_object(
            'full_name',      'Pass385A Fixture',
            'avatar_url',     'https://example.invalid/a.png',
            'tenant_id',      gen_random_uuid()::text,
            'organization_id', gen_random_uuid()::text,
            'role',           'owner',
            'platform_role',  'platform_owner',
            'is_admin',       true));

  SELECT count(*) INTO v_count FROM public.profiles WHERE id = v_uid;
  PERFORM pg_temp.assert('B1 signup creates exactly one profile for the fixture user',
                         v_count = 1, format('%s profile row(s)', v_count));

  SELECT display_name INTO v_display FROM public.profiles WHERE id = v_uid;
  PERFORM pg_temp.assert('B2 display name resolved from metadata',
                         v_display = 'Pass385A Fixture', COALESCE(v_display, '<null>'));

  -- B3 optional metadata absent (no full_name / name / avatar_url) must not fail
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password,
                          email_confirmed_at, created_at, updated_at,
                          raw_app_meta_data, raw_user_meta_data)
  VALUES (v_uid2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          'p385b+' || replace(v_uid2::text, '-', '') || '@certification.invalid',
          crypt('p385a-disposable', gen_salt('bf')), now(), now(), now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{}'::jsonb);

  SELECT count(*) INTO v_count FROM public.profiles WHERE id = v_uid2;
  PERFORM pg_temp.assert('B3 signup with no optional metadata still creates one profile',
                         v_count = 1, format('%s profile row(s)', v_count));
END
$cert$;

-- ---------------------------------------------------------------------
-- SECTION C — Fixture-scoped absence assertions
-- Never derived from unrestricted global before/after row counts.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION pg_temp.assert_no_side_effects(_label text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_uid uuid; v_uid2 uuid; v_n int;
BEGIN
  SELECT fixture_user_id, fixture_user_id_nometa INTO v_uid, v_uid2 FROM _p385a_ctx;

  SELECT count(*) INTO v_n FROM public.tenants WHERE created_by IN (v_uid, v_uid2);
  PERFORM pg_temp.assert(_label || ' no tenant created by the fixture user', v_n = 0, v_n::text);

  SELECT count(*) INTO v_n FROM public.organizations WHERE created_by IN (v_uid, v_uid2);
  PERFORM pg_temp.assert(_label || ' no organization created by the fixture user', v_n = 0, v_n::text);

  SELECT count(*) INTO v_n FROM public.organization_members WHERE user_id IN (v_uid, v_uid2);
  PERFORM pg_temp.assert(_label || ' no organization membership for the fixture user', v_n = 0, v_n::text);

  SELECT count(*) INTO v_n FROM public.user_roles WHERE user_id IN (v_uid, v_uid2);
  PERFORM pg_temp.assert(_label || ' no user role for the fixture user', v_n = 0, v_n::text);
END
$$;

SELECT pg_temp.assert_no_side_effects('C1');

-- C2 supplementary integrity preflight only — never a substitute for C1.
DO $cert$
DECLARE v_n int;
BEGIN
  SELECT count(*) INTO v_n FROM public.organizations WHERE tenant_id IS NULL;
  PERFORM pg_temp.assert('C2 integrity preflight: no tenant-less organization exists',
                         v_n = 0, v_n::text);
END
$cert$;

-- ---------------------------------------------------------------------
-- SECTION D — Conflict / idempotency via a disposable trigger harness
--
-- A second INSERT ... ON CONFLICT DO NOTHING against auth.users does NOT
-- re-fire the trigger, so it proves nothing. Repeated invocation is proved
-- by binding the same function to a disposable table with a compatible NEW
-- shape and firing it twice for an existing auth-user id.
-- ---------------------------------------------------------------------
CREATE TABLE pg_temp._p385a_trigger_harness (
  id                 uuid,   -- deliberately NOT a primary key: duplicates required
  email              text,
  raw_user_meta_data jsonb
);

CREATE TRIGGER trg_p385a_harness
AFTER INSERT ON pg_temp._p385a_trigger_harness
FOR EACH ROW EXECUTE FUNCTION private.fn_handle_new_auth_user();

DO $cert$
DECLARE
  v_uid uuid; v_n int; v_dn text; v_av text;
BEGIN
  SELECT fixture_user_id INTO v_uid FROM _p385a_ctx;

  -- Sentinel user-edited values on the profile created by the REAL trigger.
  UPDATE public.profiles
     SET display_name = 'SENTINEL user edited name',
         avatar_url   = 'https://example.invalid/sentinel.png'
   WHERE id = v_uid;

  -- Fire the function twice with the same auth-user id.
  INSERT INTO pg_temp._p385a_trigger_harness (id, email, raw_user_meta_data)
  VALUES (v_uid, 'replay-1@certification.invalid',
          '{"full_name":"OVERWRITE ATTEMPT 1","avatar_url":"https://example.invalid/bad1.png"}'::jsonb);

  INSERT INTO pg_temp._p385a_trigger_harness (id, email, raw_user_meta_data)
  VALUES (v_uid, 'replay-2@certification.invalid',
          '{"full_name":"OVERWRITE ATTEMPT 2","avatar_url":"https://example.invalid/bad2.png"}'::jsonb);

  SELECT count(*) INTO v_n FROM public.profiles WHERE id = v_uid;
  PERFORM pg_temp.assert('D1 repeated invocation leaves exactly one profile',
                         v_n = 1, format('%s profile row(s)', v_n));

  SELECT display_name, avatar_url INTO v_dn, v_av FROM public.profiles WHERE id = v_uid;
  PERFORM pg_temp.assert('D2 sentinel display_name preserved (no overwrite)',
                         v_dn = 'SENTINEL user edited name', COALESCE(v_dn, '<null>'));
  PERFORM pg_temp.assert('D3 sentinel avatar_url preserved (no overwrite)',
                         v_av = 'https://example.invalid/sentinel.png', COALESCE(v_av, '<null>'));
END
$cert$;

-- D4 side effects still absent after repeated invocation.
SELECT pg_temp.assert_no_side_effects('D4');

DROP TRIGGER trg_p385a_harness ON pg_temp._p385a_trigger_harness;
DROP TABLE pg_temp._p385a_trigger_harness;

-- ---------------------------------------------------------------------
-- Report and verdict
-- ---------------------------------------------------------------------
\echo '=== Pass 3.8.5A — signup trigger certification ==='
SELECT seq,
       CASE WHEN passed THEN 'PASS' ELSE 'FAIL' END AS result,
       assertion,
       detail
  FROM _p385a_results
 ORDER BY seq;

DO $cert$
DECLARE v_fail int; v_total int;
BEGIN
  SELECT count(*) FILTER (WHERE NOT passed), count(*) INTO v_fail, v_total FROM _p385a_results;
  RAISE NOTICE 'Pass 3.8.5A certification: % / % assertions passed', v_total - v_fail, v_total;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'Pass 3.8.5A certification FAILED: % assertion(s) failed', v_fail;
  END IF;
END
$cert$;

-- All fixtures (auth.users rows, profiles, temp objects) are discarded here.
ROLLBACK;
