-- =====================================================================
-- SPR-MOD-001-003 · Gate 3.8 · Pass 3.8.4
-- Administrator-invitation RPC certification harness
-- (OUT OF THE MIGRATION CHAIN — never discovered or applied by tooling).
--
-- Certifies the transactional first-administrator routines:
--   public.fn_onboarding_invite_first_admin_atomic
--   public.fn_onboarding_resend_first_admin_atomic
--   public.fn_onboarding_revoke_invitation
--   public.fn_onboarding_assign_admin_role
--   public.fn_onboarding_resolve_first_admin
--
-- Contract:
--   * one explicit transaction, always ended by an explicit ROLLBACK;
--   * deterministic synthetic identities only — never a live user;
--   * the RBAC catalog is read only, never seeded or repaired;
--   * any failed assertion raises and aborts the whole transaction.
--
-- Scope note: single-session determinism ONLY. A transaction-wrapped file
-- cannot prove serialization between concurrent sessions; the org-scoped
-- advisory lock and the P3847 race are certified separately by
-- supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh, which MUST also be run.
--
-- Usage:
--   psql "$DB" -f supabase/tests/pass_3_8_4_admin_rpc_certification.sql
-- =====================================================================

\set ON_ERROR_STOP on

BEGIN;

DO $cert$
DECLARE
  c_user_ok    uuid := 'a5384000-0000-4000-8000-000000000001';
  c_user_deny  uuid := 'a5384000-0000-4000-8000-000000000002';
  c_email_ok   text := 'pass384.cert.authorized@certification.invalid';
  c_email_deny text := 'pass384.cert.denied@certification.invalid';
  c_tenant     uuid := 'ce773840-0000-4000-8000-000000000001';
  c_org_def    uuid := 'ce773840-0000-4000-8000-000000000010';
  c_org_other  uuid := 'ce773840-0000-4000-8000-000000000011';
  c_admin_mail text := 'pass384.first.admin@certification.invalid';
  c_other_mail text := 'pass384.other.admin@certification.invalid';
  c_hash_a     text := repeat('a', 64);
  c_hash_b     text := repeat('b', 64);
  c_hash_c     text := repeat('c', 64);
  c_exp        timestamptz := now() + interval '72 hours';
  c_atomic_sig text := 'public.fn_onboarding_invite_first_admin_atomic(uuid,text,text,text,'
                       || 'timestamp with time zone,text,integer)';
  c_legacy_sig text := 'public.fn_onboarding_invite_first_admin(uuid,uuid,text,text,text,'
                       || 'timestamp with time zone)';

  v_role_ok  uuid;
  v_perm     uuid;
  v_n        bigint;
  v_r        jsonb;
  v_r2       jsonb;
  v_inv      uuid;
  v_inv2     uuid;
  v_other    uuid;
  v_ver      int;
  v_state    text;
  v_code     text;

  -- CERT-002 before/after invitation state (privileged reads only)
  v_hash_before   text;
  v_hash_after    text;
  v_email_before  text;
  v_email_after   text;
  v_role_before   text;
  v_role_after    text;
  v_status_before text;
  v_status_after  text;
  v_exp_before    timestamptz;
  v_exp_after     timestamptz;
BEGIN
  -- ==================================================================
  -- Preconditions — catalog reads only
  -- ==================================================================
  SELECT id INTO v_perm FROM public.permissions
   WHERE key = 'platform.tenant.update' AND deprecated_at IS NULL;
  IF v_perm IS NULL THEN
    RAISE EXCEPTION 'PASS384-CERT precondition: platform.tenant.update permission missing';
  END IF;

  SELECT r.id INTO v_role_ok FROM public.roles r
   WHERE r.key = 'platform_owner' AND r.scope = 'platform';
  IF v_role_ok IS NULL THEN
    RAISE EXCEPTION 'PASS384-CERT precondition: platform_owner role missing';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.role_permissions rp
                  WHERE rp.role_id = v_role_ok AND rp.permission_id = v_perm) THEN
    RAISE EXCEPTION 'PASS384-CERT precondition: platform_owner lacks platform.tenant.update';
  END IF;

  -- CERT-000-A · the atomic routine exists exactly once and takes NO
  -- organization argument: the caller can never steer the organization.
  SELECT count(*) INTO v_n
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname = 'fn_onboarding_invite_first_admin_atomic';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS384-CERT-000A: atomic invite routine not found exactly once (%)', v_n;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'fn_onboarding_invite_first_admin_atomic'
      AND 'organization' = ANY (
        SELECT trim(both from replace(a, '_', ''))
        FROM unnest(p.proargnames) a)
  ) THEN
    RAISE EXCEPTION 'PASS384-CERT-000A: atomic invite exposes an organization argument';
  END IF;
  IF NOT has_function_privilege('authenticated', c_atomic_sig, 'EXECUTE') THEN
    RAISE EXCEPTION 'PASS384-CERT-000A: authenticated lacks EXECUTE on the atomic routine';
  END IF;

  -- CERT-000-B · the legacy six-argument routine is retired for callers.
  IF has_function_privilege('authenticated', c_legacy_sig, 'EXECUTE')
     OR has_function_privilege('anon', c_legacy_sig, 'EXECUTE') THEN
    RAISE EXCEPTION 'PASS384-CERT-000B: legacy invite routine is still executable by callers';
  END IF;

  -- ==================================================================
  -- Fixtures (transaction-local, always rolled back)
  -- ==================================================================
  IF EXISTS (SELECT 1 FROM auth.users WHERE id IN (c_user_ok, c_user_deny))
     OR EXISTS (SELECT 1 FROM public.tenants WHERE id = c_tenant) THEN
    RAISE EXCEPTION 'PASS384-CERT precondition: synthetic fixtures already exist';
  END IF;

  SET LOCAL session_replication_role = replica;
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', c_user_ok, 'authenticated', 'authenticated',
     c_email_ok, now(), '{"provider":"synthetic","providers":["synthetic"]}'::jsonb,
     '{"full_name":"PASS384 Authorized"}'::jsonb, now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', c_user_deny, 'authenticated', 'authenticated',
     c_email_deny, now(), '{"provider":"synthetic","providers":["synthetic"]}'::jsonb,
     '{"full_name":"PASS384 Denied"}'::jsonb, now(), now(), '', '', '', '');
  SET LOCAL session_replication_role = origin;

  INSERT INTO public.user_roles (user_id, role, role_id, organization_id)
  VALUES (c_user_ok, NULL, v_role_ok, NULL);

  INSERT INTO public.tenants (id, slug, display_name, code)
  VALUES (c_tenant, 'cert3840-tenant', 'CERT3840 Tenant', 'C3840001');

  -- Two organizations: exactly one default. The non-default one exists to
  -- prove that default-organization enforcement is authoritative.
  INSERT INTO public.organizations (id, tenant_id, name, slug, is_default)
  VALUES (c_org_def,   c_tenant, 'CERT3840 Default',   'cert3840-default',   true),
         (c_org_other, c_tenant, 'CERT3840 Secondary', 'cert3840-secondary', false);

  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', c_user_ok, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ==================================================================
  -- CERT-001 · create resolves the default organization internally
  -- ==================================================================
  v_r := public.fn_onboarding_invite_first_admin_atomic(
    c_tenant, c_admin_mail, 'admin', c_hash_a, c_exp, 'cert-384-001', NULL);

  IF (v_r ->> 'organization_id')::uuid <> c_org_def THEN
    RAISE EXCEPTION 'PASS384-CERT-001: invitation not bound to the default organization';
  END IF;
  IF (v_r ->> 'created')::boolean IS NOT TRUE OR (v_r ->> 'replayed')::boolean IS NOT FALSE THEN
    RAISE EXCEPTION 'PASS384-CERT-001: first call did not report a creation';
  END IF;
  v_inv := (v_r ->> 'invitation_id')::uuid;
  v_ver := (v_r ->> 'step_version')::int;

  -- The invitation step is recorded by the routine itself, exactly once.
  -- Direct reads of RLS-protected tables run as the privileged executor.
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_n FROM public.tenant_onboarding_steps
   WHERE tenant_id = c_tenant AND step_key = 'tenant_admin_invitation';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS384-CERT-001: expected exactly 1 invitation step row, found %', v_n;
  END IF;

  -- ==================================================================
  -- CERT-002 · replay equivalence: same email + same role
  --
  -- Role-transition design: production RPCs execute as the synthetic
  -- `authenticated` caller; direct fixture DML and internal state
  -- assertions execute as the privileged certification executor,
  -- because the platform operator is neither an organization member
  -- nor the invitation recipient and is therefore RLS-blind to the row.
  -- ==================================================================
  SELECT count(*) INTO v_n FROM public.organization_invitations oi
   WHERE oi.id = v_inv;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS384-CERT-002: invitation missing after creation';
  END IF;

  SELECT oi.token_hash, oi.email, oi.role, oi.status, oi.expires_at
    INTO v_hash_before, v_email_before, v_role_before, v_status_before, v_exp_before
    FROM public.organization_invitations oi
   WHERE oi.id = v_inv;

  IF v_hash_before IS DISTINCT FROM c_hash_a THEN
    RAISE EXCEPTION 'PASS384-CERT-002: unexpected initial token hash';
  END IF;

  EXECUTE 'SET LOCAL ROLE authenticated';
  v_r2 := public.fn_onboarding_invite_first_admin_atomic(
    c_tenant, upper(c_admin_mail), 'admin', c_hash_b, c_exp, 'cert-384-002', NULL);

  IF (v_r2 ->> 'invitation_id')::uuid <> v_inv THEN
    RAISE EXCEPTION 'PASS384-CERT-002: replay returned a different invitation';
  END IF;
  IF (v_r2 ->> 'created')::boolean IS NOT FALSE OR (v_r2 ->> 'replayed')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'PASS384-CERT-002: equivalent call was not reported as a replay';
  END IF;

  -- Positive RLS assertion: the operator must see zero invitation rows.
  SELECT count(*) INTO v_n FROM public.organization_invitations oi
   WHERE oi.id = v_inv;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PASS384-CERT-002: platform operator unexpectedly saw the invitation row through RLS';
  END IF;

  EXECUTE 'RESET ROLE';
  SELECT oi.token_hash, oi.email, oi.role, oi.status, oi.expires_at
    INTO v_hash_after, v_email_after, v_role_after, v_status_after, v_exp_after
    FROM public.organization_invitations oi
   WHERE oi.id = v_inv;

  IF v_hash_after IS NULL THEN
    RAISE EXCEPTION 'PASS384-CERT-002: invitation missing after replay';
  END IF;
  IF v_hash_after IS DISTINCT FROM v_hash_before THEN
    RAISE EXCEPTION 'PASS384-CERT-002: replay changed the stored token hash';
  END IF;
  IF v_email_after  IS DISTINCT FROM v_email_before
     OR v_role_after   IS DISTINCT FROM v_role_before
     OR v_status_after IS DISTINCT FROM v_status_before
     OR v_exp_after    IS DISTINCT FROM v_exp_before THEN
    RAISE EXCEPTION 'PASS384-CERT-002: replay changed invitation metadata';
  END IF;

  SELECT count(*) INTO v_n FROM public.tenant_onboarding_steps
   WHERE tenant_id = c_tenant AND step_key = 'tenant_admin_invitation';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS384-CERT-002: replay created a second invitation step row';
  END IF;

  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ==================================================================
  -- CERT-003 · a different email is a conflict, not a second invitation
  -- ==================================================================
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_other_mail, 'admin', c_hash_c, c_exp, 'cert-384-003', NULL);
    RAISE EXCEPTION 'PASS384-CERT-003: conflicting email was accepted';
  EXCEPTION WHEN SQLSTATE 'P3847' THEN
    NULL;
  END;

  -- ==================================================================
  -- CERT-004 · a different administrative role is a role conflict
  -- ==================================================================
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, 'owner', c_hash_c, c_exp, 'cert-384-004', NULL);
    RAISE EXCEPTION 'PASS384-CERT-004: conflicting role was accepted';
  EXCEPTION WHEN SQLSTATE 'P3843' THEN
    NULL;
  END;

  -- ==================================================================
  -- CERT-005 · database-side input validation
  -- ==================================================================
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, 'not-an-email', 'admin', c_hash_a, c_exp, 'cert-384-005', NULL);
    RAISE EXCEPTION 'PASS384-CERT-005: malformed email was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, 'admin', 'short-hash', c_exp, 'cert-384-005', NULL);
    RAISE EXCEPTION 'PASS384-CERT-005: malformed token hash was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, 'admin', c_hash_a, now() - interval '1 hour',
      'cert-384-005', NULL);
    RAISE EXCEPTION 'PASS384-CERT-005: past expiry was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, 'member', c_hash_a, c_exp, 'cert-384-005', NULL);
    RAISE EXCEPTION 'PASS384-CERT-005: a non-administrative role was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- ==================================================================
  -- CERT-006 · resend is one transaction: revoke + reissue + step
  -- ==================================================================
  v_r := public.fn_onboarding_resend_first_admin_atomic(
    c_tenant, v_inv, c_hash_c, c_exp, 'cert-384-006', NULL);
  v_inv2 := (v_r ->> 'invitation_id')::uuid;

  IF v_inv2 = v_inv THEN
    RAISE EXCEPTION 'PASS384-CERT-006: resend did not issue a replacement invitation';
  END IF;
  EXECUTE 'RESET ROLE';
  SELECT oi.status INTO v_state FROM public.organization_invitations oi WHERE oi.id = v_inv;
  IF v_state <> 'revoked' THEN
    RAISE EXCEPTION 'PASS384-CERT-006: superseded invitation is % rather than revoked', v_state;
  END IF;
  SELECT oi.status INTO v_state FROM public.organization_invitations oi WHERE oi.id = v_inv2;
  IF v_state <> 'pending' THEN
    RAISE EXCEPTION 'PASS384-CERT-006: replacement invitation is % rather than pending', v_state;
  END IF;
  SELECT count(*) INTO v_n FROM public.tenant_onboarding_steps
   WHERE tenant_id = c_tenant AND step_key = 'tenant_admin_invitation';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS384-CERT-006: resend created a duplicate invitation step row';
  END IF;
  -- Exactly one pending administrator invitation survives a resend.
  SELECT count(*) INTO v_n FROM public.organization_invitations oi
   WHERE oi.organization_id = c_org_def AND oi.status = 'pending';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PASS384-CERT-006: % pending invitations after resend', v_n;
  END IF;
  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ==================================================================
  -- CERT-007 · non-default organization is rejected (P3842)
  -- ==================================================================
  EXECUTE 'RESET ROLE';
  INSERT INTO public.organization_invitations
    (id, organization_id, email, role, invited_by, token_hash, expires_at, status)
  VALUES (gen_random_uuid(), c_org_other, c_other_mail, 'admin', c_user_ok,
          c_hash_b, c_exp, 'pending')
  RETURNING id INTO v_other;
  EXECUTE 'SET LOCAL ROLE authenticated';

  BEGIN
    PERFORM public.fn_onboarding_resend_first_admin_atomic(
      c_tenant, v_other, c_hash_a, c_exp, 'cert-384-007', NULL);
    RAISE EXCEPTION 'PASS384-CERT-007: resend accepted a non-default organization invitation';
  EXCEPTION WHEN SQLSTATE 'P3842' THEN NULL;
  END;

  BEGIN
    PERFORM public.fn_onboarding_revoke_invitation(c_tenant, v_other);
    RAISE EXCEPTION 'PASS384-CERT-007: revoke accepted a non-default organization invitation';
  EXCEPTION WHEN SQLSTATE 'P3842' THEN NULL;
  END;

  BEGIN
    PERFORM public.fn_onboarding_assign_admin_role(c_tenant, v_other);
    RAISE EXCEPTION 'PASS384-CERT-007: role assignment accepted a non-default organization';
  EXCEPTION WHEN SQLSTATE 'P3842' THEN NULL;
  END;

  -- ==================================================================
  -- CERT-008 · accepted invitations cannot be resent or revoked (P3846)
  -- ==================================================================
  EXECUTE 'RESET ROLE';
  UPDATE public.organization_invitations
     SET status = 'accepted', accepted_at = now(), accepted_by = c_user_deny
   WHERE id = v_inv2;
  EXECUTE 'SET LOCAL ROLE authenticated';

  BEGIN
    PERFORM public.fn_onboarding_resend_first_admin_atomic(
      c_tenant, v_inv2, c_hash_a, c_exp, 'cert-384-008', NULL);
    RAISE EXCEPTION 'PASS384-CERT-008: an accepted invitation was resent';
  EXCEPTION WHEN SQLSTATE 'P3846' THEN NULL;
  END;

  -- ==================================================================
  -- CERT-009 · role assignment refuses without an active membership
  -- ==================================================================
  BEGIN
    PERFORM public.fn_onboarding_assign_admin_role(c_tenant, v_inv2);
    RAISE EXCEPTION 'PASS384-CERT-009: role granted without an active membership';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- ==================================================================
  -- CERT-010 · a tenant with no default organization raises P3841
  -- ==================================================================
  EXECUTE 'RESET ROLE';
  UPDATE public.organizations SET is_default = false WHERE id = c_org_def;
  EXECUTE 'SET LOCAL ROLE authenticated';
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, 'admin', c_hash_a, c_exp, 'cert-384-010', NULL);
    RAISE EXCEPTION 'PASS384-CERT-010: invite succeeded without a default organization';
  EXCEPTION WHEN SQLSTATE 'P3841' THEN NULL;
  END;
  EXECUTE 'RESET ROLE';
  UPDATE public.organizations SET is_default = true WHERE id = c_org_def;
  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ==================================================================
  -- CERT-011 · an unauthorized caller is denied by every routine
  -- ==================================================================
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', c_user_deny, 'role', 'authenticated')::text, true);

  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, 'admin', c_hash_a, c_exp, 'cert-384-011', NULL);
    RAISE EXCEPTION 'PASS384-CERT-011: unauthorized caller created an invitation';
  EXCEPTION WHEN SQLSTATE '42501' THEN NULL;
  END;
  BEGIN
    PERFORM public.fn_onboarding_resend_first_admin_atomic(
      c_tenant, v_inv2, c_hash_a, c_exp, 'cert-384-011', NULL);
    RAISE EXCEPTION 'PASS384-CERT-011: unauthorized caller resent an invitation';
  EXCEPTION WHEN SQLSTATE '42501' THEN NULL;
  END;
  BEGIN
    PERFORM public.fn_onboarding_revoke_invitation(c_tenant, v_inv2);
    RAISE EXCEPTION 'PASS384-CERT-011: unauthorized caller revoked an invitation';
  EXCEPTION WHEN SQLSTATE '42501' THEN NULL;
  END;
  BEGIN
    PERFORM public.fn_onboarding_assign_admin_role(c_tenant, v_inv2);
    RAISE EXCEPTION 'PASS384-CERT-011: unauthorized caller assigned a role';
  EXCEPTION WHEN SQLSTATE '42501' THEN NULL;
  END;
  BEGIN
    PERFORM public.fn_onboarding_resolve_first_admin(c_tenant, NULL);
    RAISE EXCEPTION 'PASS384-CERT-011: unauthorized caller read the administrator projection';
  EXCEPTION WHEN SQLSTATE '42501' THEN NULL;
  END;

  -- ==================================================================
  -- CERT-012 · direct-RPC input validation (authorized caller)
  -- Every rejection is raised BEFORE any row is written.
  -- ==================================================================
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', c_user_ok, 'role', 'authenticated')::text, true);

  -- NULL email
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, NULL, 'admin', c_hash_a, c_exp, 'cert-384-012', NULL);
    RAISE EXCEPTION 'PASS384-CERT-012: NULL email accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- Blank / whitespace-only email
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, '   ', 'admin', c_hash_a, c_exp, 'cert-384-012', NULL);
    RAISE EXCEPTION 'PASS384-CERT-012: blank email accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- NULL invited role
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, NULL, c_hash_a, c_exp, 'cert-384-012', NULL);
    RAISE EXCEPTION 'PASS384-CERT-012: NULL invited role accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- Non-administrative invited role
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, 'member', c_hash_a, c_exp, 'cert-384-012', NULL);
    RAISE EXCEPTION 'PASS384-CERT-012: non-administrative role accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- Malformed token hash
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, 'admin', 'NOT-A-HASH', c_exp, 'cert-384-012', NULL);
    RAISE EXCEPTION 'PASS384-CERT-012: malformed token hash accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- Invalid expiry (past, and beyond the seven-day ceiling)
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, 'admin', c_hash_a, now() - interval '1 minute',
      'cert-384-012', NULL);
    RAISE EXCEPTION 'PASS384-CERT-012: past expiry accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;
  BEGIN
    PERFORM public.fn_onboarding_invite_first_admin_atomic(
      c_tenant, c_admin_mail, 'admin', c_hash_a, now() + interval '30 days',
      'cert-384-012', NULL);
    RAISE EXCEPTION 'PASS384-CERT-012: expiry beyond seven days accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- Resend must still validate token/expiry WITHOUT email or role.
  BEGIN
    PERFORM public.fn_onboarding_resend_first_admin_atomic(
      c_tenant, v_inv2, 'NOT-A-HASH', c_exp, 'cert-384-012', NULL);
    RAISE EXCEPTION 'PASS384-CERT-012: resend accepted a malformed token hash';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL;
  END;

  -- ==================================================================
  -- CERT-013 · the validator must never be IMMUTABLE (it reads now())
  -- ==================================================================
  IF EXISTS (
    SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'private'
       AND p.proname IN ('fn_onboarding_validate_invite_inputs',
                         'fn_onboarding_validate_invite_identity')
       AND p.provolatile = 'i'
  ) THEN
    RAISE EXCEPTION 'PASS384-CERT-013: a now()-dependent validator is IMMUTABLE';
  END IF;

  RAISE NOTICE 'PASS384-CERT: all assertions passed (single-session scope).';

END
$cert$;

ROLLBACK;
