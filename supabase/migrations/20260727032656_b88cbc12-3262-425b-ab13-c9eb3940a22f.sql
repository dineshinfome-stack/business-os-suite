-- Pass 3.8.4 — tenant administrator invitation / membership / role assignment
-- Platform operators are not members of the tenant organization, so the
-- member-scoped RLS on organization_invitations cannot serve these commands.
-- These SECURITY DEFINER routines re-check the operator permission themselves.

CREATE OR REPLACE FUNCTION public.fn_onboarding_admin_role_key(_invited_role text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'pg_catalog', 'public'
AS $$
  SELECT CASE _invited_role
           WHEN 'owner' THEN 'org_owner'
           WHEN 'admin' THEN 'administrator'
           ELSE NULL
         END;
$$;

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
BEGIN
  IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.update') THEN
    RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
  END IF;

  SELECT o.id INTO v_org
    FROM public.organizations o
   WHERE o.tenant_id = _tenant_id
     AND o.deleted_at IS NULL
   ORDER BY o.is_default DESC, o.created_at ASC
   LIMIT 1;

  IF v_org IS NULL THEN
    RETURN jsonb_build_object('organization_id', NULL, 'invitation', NULL,
                              'membership', NULL, 'role_granted', false);
  END IF;

  SELECT * INTO v_inv
    FROM public.organization_invitations i
   WHERE i.organization_id = v_org
     AND i.role::text IN ('owner', 'admin')
     AND (_email IS NULL OR lower(i.email::text) = lower(_email))
   ORDER BY (i.status = 'accepted') DESC,
            (i.status = 'pending' AND i.expires_at > now()) DESC,
            i.created_at DESC
   LIMIT 1;

  IF FOUND AND v_inv.status = 'pending' AND v_inv.expires_at <= now() THEN
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

CREATE OR REPLACE FUNCTION public.fn_onboarding_invite_first_admin(
  _tenant_id uuid,
  _organization_id uuid,
  _email text,
  _invited_role text,
  _token_hash text,
  _expires_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $$
DECLARE
  v_org uuid;
  v_id  uuid;
BEGIN
  IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.update') THEN
    RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
  END IF;

  IF public.fn_onboarding_admin_role_key(_invited_role) IS NULL THEN
    RAISE EXCEPTION 'invited role is not administrative: %', _invited_role
      USING ERRCODE = '22023';
  END IF;

  SELECT o.id INTO v_org
    FROM public.organizations o
   WHERE o.id = _organization_id
     AND o.tenant_id = _tenant_id
     AND o.deleted_at IS NULL;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Organization does not belong to tenant' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.organization_invitations
    (organization_id, email, role, invited_by, token_hash, expires_at, status)
  VALUES
    (v_org, lower(_email), _invited_role::public.org_role, auth.uid(),
     _token_hash, _expires_at, 'pending')
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('invitation_id', v_id, 'organization_id', v_org);
END;
$$;

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
  v_status text;
BEGIN
  IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.update') THEN
    RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
  END IF;

  SELECT i.status INTO v_status
    FROM public.organization_invitations i
    JOIN public.organizations o ON o.id = i.organization_id
   WHERE i.id = _invitation_id
     AND o.tenant_id = _tenant_id
     AND o.deleted_at IS NULL
   FOR UPDATE OF i;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Invitation not found for tenant' USING ERRCODE = 'P0002';
  END IF;
  IF v_status = 'accepted' THEN
    RAISE EXCEPTION 'Accepted invitation cannot be revoked' USING ERRCODE = '22023';
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
  v_inv      public.organization_invitations%ROWTYPE;
  v_org      public.organizations%ROWTYPE;
  v_mem      public.organization_members%ROWTYPE;
  v_role_key text;
  v_role_id  uuid;
  v_existing uuid;
BEGIN
  IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.update') THEN
    RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
  END IF;

  SELECT i.* INTO v_inv
    FROM public.organization_invitations i
   WHERE i.id = _invitation_id;
  IF v_inv.id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT o.* INTO v_org
    FROM public.organizations o
   WHERE o.id = v_inv.organization_id
     AND o.tenant_id = _tenant_id
     AND o.deleted_at IS NULL;
  IF v_org.id IS NULL THEN
    RAISE EXCEPTION 'Organization does not belong to tenant' USING ERRCODE = 'P0002';
  END IF;

  IF v_inv.status <> 'accepted' OR v_inv.accepted_by IS NULL THEN
    RAISE EXCEPTION 'Invitation has not been accepted' USING ERRCODE = '22023';
  END IF;

  SELECT m.* INTO v_mem
    FROM public.organization_members m
   WHERE m.organization_id = v_org.id
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
     AND ur.organization_id = v_org.id
     AND ur.deleted_at IS NULL;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('user_id', v_inv.accepted_by, 'organization_id', v_org.id,
                              'role_key', v_role_key, 'user_role_id', v_existing,
                              'created', false);
  END IF;

  INSERT INTO public.user_roles
    (user_id, role_id, organization_id, granted_by, granted_at, created_by, updated_by)
  VALUES
    (v_inv.accepted_by, v_role_id, v_org.id, auth.uid(), now(), auth.uid(), auth.uid())
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_existing;

  IF v_existing IS NULL THEN
    SELECT ur.id INTO v_existing
      FROM public.user_roles ur
     WHERE ur.user_id = v_inv.accepted_by
       AND ur.role_id = v_role_id
       AND ur.organization_id = v_org.id
       AND ur.deleted_at IS NULL;
    RETURN jsonb_build_object('user_id', v_inv.accepted_by, 'organization_id', v_org.id,
                              'role_key', v_role_key, 'user_role_id', v_existing,
                              'created', false);
  END IF;

  RETURN jsonb_build_object('user_id', v_inv.accepted_by, 'organization_id', v_org.id,
                            'role_key', v_role_key, 'user_role_id', v_existing,
                            'created', true);
END;
$$;

REVOKE ALL ON FUNCTION public.fn_onboarding_resolve_first_admin(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_onboarding_invite_first_admin(uuid, uuid, text, text, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_onboarding_revoke_invitation(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_onboarding_assign_admin_role(uuid, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.fn_onboarding_admin_role_key(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_onboarding_resolve_first_admin(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_onboarding_invite_first_admin(uuid, uuid, text, text, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_onboarding_revoke_invitation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_onboarding_assign_admin_role(uuid, uuid) TO authenticated;