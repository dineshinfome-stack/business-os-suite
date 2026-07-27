-- Pass 3.8.4 — Focused functional and security repair.
-- Atomic first-administrator invitation create/replay and resend, authoritative
-- default-organization enforcement, full in-RPC permission checks, database-side
-- input validation and deterministic SQLSTATEs P3841..P3847.

/* ------------------------------------------------------------- helpers */

CREATE OR REPLACE FUNCTION private.fn_onboarding_require_perms(_perms text[])
RETURNS void
LANGUAGE plpgsql
STABLE
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  p text;
BEGIN
  FOREACH p IN ARRAY _perms LOOP
    IF NOT private.fn_user_has_permission(auth.uid(), NULL, p) THEN
      RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
    END IF;
  END LOOP;
END;
$$;

-- Authoritative default organization. There is exactly one non-deleted
-- `is_default` organization per tenant; no oldest-organization fallback.
CREATE OR REPLACE FUNCTION private.fn_onboarding_default_org(_tenant_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_org uuid;
BEGIN
  SELECT o.id INTO v_org
    FROM public.organizations o
   WHERE o.tenant_id = _tenant_id
     AND o.deleted_at IS NULL
     AND o.is_default IS TRUE
   ORDER BY o.created_at ASC
   LIMIT 1;

  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Tenant has no default organization' USING ERRCODE = 'P3841';
  END IF;

  RETURN v_org;
END;
$$;

CREATE OR REPLACE FUNCTION private.fn_onboarding_validate_invite_inputs(
  _email text,
  _invited_role text,
  _token_hash text,
  _expires_at timestamptz,
  _correlation_id text,
  _expected_version integer
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'pg_catalog', 'public'
AS $$
DECLARE
  v_email text := lower(btrim(COALESCE(_email, '')));
BEGIN
  IF _email IS NOT NULL THEN
    IF v_email = '' OR length(v_email) > 320 OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
      RAISE EXCEPTION 'invalid email' USING ERRCODE = '22023';
    END IF;
  END IF;

  IF _invited_role IS NOT NULL AND _invited_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'invited role is not administrative: %', _invited_role
      USING ERRCODE = '22023';
  END IF;

  IF _token_hash IS NULL OR _token_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid token hash' USING ERRCODE = '22023';
  END IF;

  IF _expires_at IS NULL
     OR _expires_at <= now()
     OR _expires_at > now() + interval '7 days' THEN
    RAISE EXCEPTION 'invalid expiry' USING ERRCODE = '22023';
  END IF;

  IF _correlation_id IS NOT NULL AND length(_correlation_id) > 128 THEN
    RAISE EXCEPTION 'invalid correlation id' USING ERRCODE = '22023';
  END IF;

  IF _expected_version IS NOT NULL AND _expected_version < 0 THEN
    RAISE EXCEPTION 'invalid expected version' USING ERRCODE = '22023';
  END IF;

  RETURN v_email;
END;
$$;

/* ------------------------------------------------- resolver (corrected) */

CREATE OR REPLACE FUNCTION public.fn_onboarding_resolve_first_admin(
  _tenant_id uuid,
  _email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_org      uuid;
  v_inv      public.organization_invitations%ROWTYPE;
  v_mem      public.organization_members%ROWTYPE;
  v_role_key text;
  v_role_id  uuid;
  v_granted  boolean := false;
  v_email    text := lower(btrim(COALESCE(_email, '')));
BEGIN
  PERFORM private.fn_onboarding_require_perms(
    ARRAY['platform.tenant.update', 'platform.invitations.view']);

  v_org := private.fn_onboarding_default_org(_tenant_id);

  -- Accepted administrative invitations are authoritative and are resolved
  -- INDEPENDENTLY of the submitted email.
  SELECT * INTO v_inv
    FROM public.organization_invitations i
   WHERE i.organization_id = v_org
     AND i.role::text IN ('owner', 'admin')
     AND i.status = 'accepted'
   ORDER BY i.accepted_at ASC NULLS LAST, i.created_at ASC
   LIMIT 1;

  IF v_inv.id IS NULL THEN
    SELECT * INTO v_inv
      FROM public.organization_invitations i
     WHERE i.organization_id = v_org
       AND i.role::text IN ('owner', 'admin')
       AND (v_email = '' OR lower(i.email::text) = v_email)
     ORDER BY (i.status = 'pending' AND i.expires_at > now()) DESC,
              i.created_at DESC
     LIMIT 1;
  END IF;

  IF v_inv.id IS NOT NULL AND v_inv.status = 'pending' AND v_inv.expires_at <= now() THEN
    v_inv.status := 'expired';
  END IF;

  IF v_inv.id IS NOT NULL AND v_inv.accepted_by IS NOT NULL THEN
    SELECT * INTO v_mem
      FROM public.organization_members m
     WHERE m.organization_id = v_org
       AND m.user_id = v_inv.accepted_by
       AND m.deleted_at IS NULL
     LIMIT 1;

    v_role_key := public.fn_onboarding_admin_role_key(v_inv.role::text);
    SELECT r.id INTO v_role_id FROM public.roles r WHERE r.key = v_role_key;
    IF v_role_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
         WHERE ur.user_id = v_inv.accepted_by
           AND ur.role_id = v_role_id
           AND ur.organization_id = v_org
           AND ur.deleted_at IS NULL
      ) INTO v_granted;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'organization_id', v_org,
    'invitation', CASE WHEN v_inv.id IS NULL THEN NULL ELSE jsonb_build_object(
      'id', v_inv.id,
      'organization_id', v_inv.organization_id,
      'email', v_inv.email,
      'role', v_inv.role,
      'status', v_inv.status,
      'expires_at', v_inv.expires_at,
      'accepted_at', v_inv.accepted_at,
      'accepted_by', v_inv.accepted_by,
      'revoked_at', v_inv.revoked_at,
      'created_at', v_inv.created_at
    ) END,
    'membership', CASE WHEN v_mem.id IS NULL THEN NULL ELSE jsonb_build_object(
      'id', v_mem.id,
      'organization_id', v_mem.organization_id,
      'user_id', v_mem.user_id,
      'role', v_mem.role,
      'status', v_mem.status,
      'joined_at', v_mem.joined_at
    ) END,
    'role_granted', v_granted
  );
END;
$$;

/* ------------------------------------------- atomic invite (create/replay) */

CREATE OR REPLACE FUNCTION public.fn_onboarding_invite_first_admin_atomic(
  _tenant_id uuid,
  _email text,
  _invited_role text,
  _token_hash text,
  _expires_at timestamptz,
  _correlation_id text,
  _expected_version integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_org        uuid;
  v_email      text;
  v_inv        public.organization_invitations%ROWTYPE;
  v_mem        public.organization_members%ROWTYPE;
  v_id         uuid;
  v_created    boolean := false;
  v_replayed   boolean := false;
  v_status     text;
  v_mem_status text := 'pending_acceptance';
  v_granted    boolean := false;
  v_role_key   text;
  v_role_id    uuid;
  v_step       jsonb;
BEGIN
  PERFORM private.fn_onboarding_require_perms(
    ARRAY['platform.tenant.update', 'platform.invitations.manage']);

  v_email := private.fn_onboarding_validate_invite_inputs(
    _email, _invited_role, _token_hash, _expires_at, _correlation_id, _expected_version);

  v_org := private.fn_onboarding_default_org(_tenant_id);

  -- Organization-scoped serialization: concurrent first-admin invitations for
  -- the same organization are resolved deterministically.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_org::text, 0));

  SELECT * INTO v_inv
    FROM public.organization_invitations i
   WHERE i.organization_id = v_org
     AND i.role::text IN ('owner', 'admin')
     AND i.status = 'accepted'
   ORDER BY i.accepted_at ASC NULLS LAST, i.created_at ASC
   LIMIT 1;

  IF v_inv.id IS NOT NULL THEN
    v_replayed := true;
    v_status   := 'accepted';
    v_id       := v_inv.id;
  ELSE
    SELECT * INTO v_inv
      FROM public.organization_invitations i
     WHERE i.organization_id = v_org
       AND i.role::text IN ('owner', 'admin')
       AND i.status = 'pending'
       AND i.expires_at > now()
     ORDER BY i.created_at DESC
     LIMIT 1
     FOR UPDATE;

    IF v_inv.id IS NOT NULL THEN
      IF lower(v_inv.email::text) <> v_email THEN
        RAISE EXCEPTION 'A different first administrator invitation is already pending'
          USING ERRCODE = 'P3847';
      END IF;
      IF v_inv.role::text <> _invited_role THEN
        RAISE EXCEPTION 'The pending invitation carries a different administrative role'
          USING ERRCODE = 'P3843';
      END IF;
      v_replayed := true;
      v_status   := 'pending';
      v_id       := v_inv.id;
    ELSE
      BEGIN
        INSERT INTO public.organization_invitations
          (organization_id, email, role, invited_by, token_hash, expires_at, status)
        VALUES
          (v_org, v_email, _invited_role::public.org_role, auth.uid(),
           _token_hash, _expires_at, 'pending')
        RETURNING id INTO v_id;
        v_created := true;
        v_status  := 'pending';
      EXCEPTION WHEN unique_violation THEN
        SELECT * INTO v_inv
          FROM public.organization_invitations i
         WHERE i.organization_id = v_org
           AND i.status = 'pending'
           AND lower(i.email::text) = v_email
         LIMIT 1;
        IF v_inv.id IS NULL THEN
          RAISE;
        END IF;
        IF v_inv.role::text <> _invited_role THEN
          RAISE EXCEPTION 'The pending invitation carries a different administrative role'
            USING ERRCODE = 'P3843';
        END IF;
        v_replayed := true;
        v_status   := 'pending';
        v_id       := v_inv.id;
      END;
    END IF;
  END IF;

  IF v_status = 'accepted' AND v_inv.accepted_by IS NOT NULL THEN
    SELECT * INTO v_mem
      FROM public.organization_members m
     WHERE m.organization_id = v_org
       AND m.user_id = v_inv.accepted_by
       AND m.deleted_at IS NULL
     LIMIT 1;
    v_mem_status := CASE
      WHEN v_mem.id IS NULL THEN 'missing_after_acceptance'
      WHEN v_mem.status::text = 'active' THEN 'active'
      ELSE 'inactive' END;

    v_role_key := public.fn_onboarding_admin_role_key(v_inv.role::text);
    SELECT r.id INTO v_role_id FROM public.roles r WHERE r.key = v_role_key;
    IF v_role_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM public.user_roles ur
         WHERE ur.user_id = v_inv.accepted_by
           AND ur.role_id = v_role_id
           AND ur.organization_id = v_org
           AND ur.deleted_at IS NULL
      ) INTO v_granted;
    END IF;
  END IF;

  -- Exactly once, in BOTH the create and the replay path, inside this txn.
  v_step := public.fn_onboarding_record_step(
    _tenant_id, 'tenant_admin_invitation', 'completed',
    NULL, NULL, _correlation_id, _expected_version);

  RETURN jsonb_build_object(
    'organization_id',    v_org,
    'invitation_id',      v_id,
    'invitation_status',  v_status,
    'created',            v_created,
    'replayed',           v_replayed,
    'membership_status',  v_mem_status,
    'role_granted',       v_granted,
    'state',              v_step->>'state',
    'step_status',        v_step->>'status',
    'step_version',       (v_step->>'version')::integer
  );
END;
$$;

/* ------------------------------------------------------- atomic resend */

CREATE OR REPLACE FUNCTION public.fn_onboarding_resend_first_admin_atomic(
  _tenant_id uuid,
  _invitation_id uuid,
  _token_hash text,
  _expires_at timestamptz,
  _correlation_id text,
  _expected_version integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_org  uuid;
  v_inv  public.organization_invitations%ROWTYPE;
  v_id   uuid;
  v_step jsonb;
BEGIN
  PERFORM private.fn_onboarding_require_perms(
    ARRAY['platform.tenant.update', 'platform.invitations.manage']);

  PERFORM private.fn_onboarding_validate_invite_inputs(
    NULL, NULL, _token_hash, _expires_at, _correlation_id, _expected_version);

  v_org := private.fn_onboarding_default_org(_tenant_id);
  PERFORM pg_advisory_xact_lock(hashtextextended(v_org::text, 0));

  SELECT i.* INTO v_inv
    FROM public.organization_invitations i
    JOIN public.organizations o ON o.id = i.organization_id
   WHERE i.id = _invitation_id
     AND o.tenant_id = _tenant_id
     AND o.deleted_at IS NULL
   FOR UPDATE OF i;

  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found for tenant' USING ERRCODE = 'P3844';
  END IF;
  IF v_inv.organization_id <> v_org THEN
    RAISE EXCEPTION 'Invitation does not belong to the default organization'
      USING ERRCODE = 'P3842';
  END IF;
  IF v_inv.status = 'accepted' THEN
    RAISE EXCEPTION 'An accepted invitation cannot be resent' USING ERRCODE = 'P3846';
  END IF;
  IF v_inv.role::text NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'invited role is not administrative' USING ERRCODE = '22023';
  END IF;

  UPDATE public.organization_invitations
     SET status = 'revoked', revoked_at = now(), revoked_by = auth.uid()
   WHERE id = v_inv.id
     AND status = 'pending';

  INSERT INTO public.organization_invitations
    (organization_id, email, role, invited_by, token_hash, expires_at, status)
  VALUES
    (v_org, lower(v_inv.email::text), v_inv.role, auth.uid(),
     _token_hash, _expires_at, 'pending')
  RETURNING id INTO v_id;

  v_step := public.fn_onboarding_record_step(
    _tenant_id, 'tenant_admin_invitation', 'completed',
    NULL, NULL, _correlation_id, _expected_version);

  RETURN jsonb_build_object(
    'organization_id',          v_org,
    'invitation_id',            v_id,
    'previous_invitation_id',   v_inv.id,
    'invitation_status',        'pending',
    'created',                  true,
    'replayed',                 false,
    'membership_status',        'pending_acceptance',
    'role_granted',             false,
    'state',                    v_step->>'state',
    'step_status',              v_step->>'status',
    'step_version',             (v_step->>'version')::integer
  );
END;
$$;

/* ------------------------------- revoke / assign: default-org enforcement */

CREATE OR REPLACE FUNCTION public.fn_onboarding_revoke_invitation(
  _tenant_id uuid,
  _invitation_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_org uuid;
  v_inv public.organization_invitations%ROWTYPE;
BEGIN
  PERFORM private.fn_onboarding_require_perms(
    ARRAY['platform.tenant.update', 'platform.invitations.manage']);

  v_org := private.fn_onboarding_default_org(_tenant_id);

  SELECT i.* INTO v_inv
    FROM public.organization_invitations i
    JOIN public.organizations o ON o.id = i.organization_id
   WHERE i.id = _invitation_id
     AND o.tenant_id = _tenant_id
     AND o.deleted_at IS NULL
   FOR UPDATE OF i;

  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found for tenant' USING ERRCODE = 'P3844';
  END IF;
  IF v_inv.organization_id <> v_org THEN
    RAISE EXCEPTION 'Invitation does not belong to the default organization'
      USING ERRCODE = 'P3842';
  END IF;
  IF v_inv.status = 'accepted' THEN
    RAISE EXCEPTION 'Accepted invitation cannot be revoked' USING ERRCODE = 'P3846';
  END IF;

  UPDATE public.organization_invitations
     SET status = 'revoked', revoked_at = now(), revoked_by = auth.uid()
   WHERE id = _invitation_id AND status = 'pending';

  RETURN jsonb_build_object('invitation_id', _invitation_id, 'status', 'revoked');
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_onboarding_assign_admin_role(
  _tenant_id uuid,
  _invitation_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_org      uuid;
  v_inv      public.organization_invitations%ROWTYPE;
  v_mem      public.organization_members%ROWTYPE;
  v_role_key text;
  v_role_id  uuid;
  v_existing uuid;
BEGIN
  PERFORM private.fn_onboarding_require_perms(ARRAY[
    'platform.tenant.update',
    'platform.invitations.view',
    'platform.memberships.manage',
    'platform.roles.assign']);

  v_org := private.fn_onboarding_default_org(_tenant_id);

  SELECT i.* INTO v_inv
    FROM public.organization_invitations i
    JOIN public.organizations o ON o.id = i.organization_id
   WHERE i.id = _invitation_id
     AND o.tenant_id = _tenant_id
     AND o.deleted_at IS NULL;

  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found for tenant' USING ERRCODE = 'P3844';
  END IF;
  IF v_inv.organization_id <> v_org THEN
    RAISE EXCEPTION 'Invitation does not belong to the default organization'
      USING ERRCODE = 'P3842';
  END IF;
  IF v_inv.status <> 'accepted' OR v_inv.accepted_by IS NULL THEN
    RAISE EXCEPTION 'Invitation has not been accepted' USING ERRCODE = '22023';
  END IF;

  SELECT m.* INTO v_mem
    FROM public.organization_members m
   WHERE m.organization_id = v_org
     AND m.user_id = v_inv.accepted_by
     AND m.deleted_at IS NULL;
  IF v_mem.id IS NULL OR v_mem.status::text <> 'active' THEN
    RAISE EXCEPTION 'Active membership required before role assignment'
      USING ERRCODE = '22023';
  END IF;

  v_role_key := public.fn_onboarding_admin_role_key(v_inv.role::text);
  IF v_role_key IS NULL THEN
    RAISE EXCEPTION 'invited role is not administrative' USING ERRCODE = '22023';
  END IF;

  SELECT r.id INTO v_role_id
    FROM public.roles r
   WHERE r.key = v_role_key AND r.scope::text = 'organization';
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Seeded organization role missing: %', v_role_key
      USING ERRCODE = 'P0002';
  END IF;

  SELECT ur.id INTO v_existing
    FROM public.user_roles ur
   WHERE ur.user_id = v_inv.accepted_by
     AND ur.role_id = v_role_id
     AND ur.organization_id = v_org
     AND ur.deleted_at IS NULL;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('user_id', v_inv.accepted_by, 'organization_id', v_org,
                              'role_key', v_role_key, 'user_role_id', v_existing,
                              'created', false);
  END IF;

  INSERT INTO public.user_roles
    (user_id, role_id, organization_id, granted_by, granted_at, created_by, updated_by)
  VALUES
    (v_inv.accepted_by, v_role_id, v_org, auth.uid(), now(), auth.uid(), auth.uid())
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_existing;

  IF v_existing IS NULL THEN
    SELECT ur.id INTO v_existing
      FROM public.user_roles ur
     WHERE ur.user_id = v_inv.accepted_by
       AND ur.role_id = v_role_id
       AND ur.organization_id = v_org
       AND ur.deleted_at IS NULL;
    RETURN jsonb_build_object('user_id', v_inv.accepted_by, 'organization_id', v_org,
                              'role_key', v_role_key, 'user_role_id', v_existing,
                              'created', false);
  END IF;

  RETURN jsonb_build_object('user_id', v_inv.accepted_by, 'organization_id', v_org,
                            'role_key', v_role_key, 'user_role_id', v_existing,
                            'created', true);
END;
$$;

/* -------------------------------------------- retire the legacy surface */

REVOKE ALL ON FUNCTION public.fn_onboarding_invite_first_admin(
  uuid, uuid, text, text, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_onboarding_invite_first_admin(
  uuid, uuid, text, text, text, timestamptz) FROM anon;
REVOKE ALL ON FUNCTION public.fn_onboarding_invite_first_admin(
  uuid, uuid, text, text, text, timestamptz) FROM authenticated;

/* ---------------------------------------------------------- privileges */

REVOKE ALL ON FUNCTION private.fn_onboarding_require_perms(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.fn_onboarding_default_org(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.fn_onboarding_validate_invite_inputs(
  text, text, text, timestamptz, text, integer) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.fn_onboarding_invite_first_admin_atomic(
  uuid, text, text, text, timestamptz, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_onboarding_resend_first_admin_atomic(
  uuid, uuid, text, timestamptz, text, integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.fn_onboarding_invite_first_admin_atomic(
  uuid, text, text, text, timestamptz, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_onboarding_resend_first_admin_atomic(
  uuid, uuid, text, timestamptz, text, integer) TO authenticated;