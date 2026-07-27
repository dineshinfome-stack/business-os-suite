-- Pass 3.8.4 final correction — append-only validation repair.
-- The prior validator was IMMUTABLE while evaluating now(), and treated NULL
-- email/role as "not supplied" for the atomic invite path. Validation is split:
-- a common (STABLE) validator for token/expiry/correlation/version, plus an
-- invite-specific validator that requires a non-blank email and an
-- administrative role.

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
STABLE
SET search_path TO 'pg_catalog', 'public'
AS $$
DECLARE
  v_email text := lower(btrim(COALESCE(_email, '')));
BEGIN
  -- Common validation (used by both invite and resend).
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

  -- Email/role are validated only when supplied; the invite path enforces
  -- their presence through fn_onboarding_validate_invite_identity below.
  IF _email IS NOT NULL THEN
    IF v_email = '' OR length(v_email) > 320
       OR v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
      RAISE EXCEPTION 'invalid email' USING ERRCODE = '22023';
    END IF;
  END IF;

  IF _invited_role IS NOT NULL AND _invited_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'invited role is not administrative: %', _invited_role
      USING ERRCODE = '22023';
  END IF;

  RETURN NULLIF(v_email, '');
END;
$$;

-- Invite-specific validator: email and role are MANDATORY here.
CREATE OR REPLACE FUNCTION private.fn_onboarding_validate_invite_identity(
  _email text,
  _invited_role text,
  _token_hash text,
  _expires_at timestamptz,
  _correlation_id text,
  _expected_version integer
)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_email text;
BEGIN
  IF _email IS NULL OR btrim(_email) = '' THEN
    RAISE EXCEPTION 'email is required' USING ERRCODE = '22023';
  END IF;
  IF _invited_role IS NULL THEN
    RAISE EXCEPTION 'invited role is required' USING ERRCODE = '22023';
  END IF;
  IF _invited_role NOT IN ('owner', 'admin') THEN
    RAISE EXCEPTION 'invited role is not administrative: %', _invited_role
      USING ERRCODE = '22023';
  END IF;

  v_email := private.fn_onboarding_validate_invite_inputs(
    _email, _invited_role, _token_hash, _expires_at, _correlation_id, _expected_version);

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'email is required' USING ERRCODE = '22023';
  END IF;

  RETURN v_email;
END;
$$;

REVOKE ALL ON FUNCTION private.fn_onboarding_validate_invite_identity(
  text, text, text, timestamptz, text, integer) FROM PUBLIC;

-- Point the atomic invite at the stricter validator. Only the validation call
-- changes; every other statement is byte-identical to the committed routine.
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

  v_email := private.fn_onboarding_validate_invite_identity(
    _email, _invited_role, _token_hash, _expires_at, _correlation_id, _expected_version);

  v_org := private.fn_onboarding_default_org(_tenant_id);

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