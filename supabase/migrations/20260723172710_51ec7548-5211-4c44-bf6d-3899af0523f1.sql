
-- Migration B: Tenancy helpers + lifecycle RPCs
-- Sprint: SPR-MOD-001-001 (SIP-003, 004, 005, 006, 008, 010, 011)

-- 1. Slug normalization ----------------------------------------------------
CREATE OR REPLACE FUNCTION private.fn_normalize_slug(_input text)
RETURNS citext LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE s text;
BEGIN
  s := lower(coalesce(_input, ''));
  s := regexp_replace(s, '[^a-z0-9]+', '-', 'g');
  s := regexp_replace(s, '-{2,}', '-', 'g');
  s := regexp_replace(s, '^-+|-+$', '', 'g');
  RETURN s::citext;
END $$;
REVOKE ALL ON FUNCTION private.fn_normalize_slug(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_normalize_slug(text) TO authenticated;

-- 2. current_tenant_id -----------------------------------------------------
-- Returns the tenant_id for the caller's first active organization membership.
-- Returns NULL when the caller has no active membership (deny-by-default in RLS).
CREATE OR REPLACE FUNCTION private.fn_current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.tenant_id
  FROM public.organization_members m
  JOIN public.organizations o ON o.id = m.organization_id
  WHERE m.user_id = auth.uid()
    AND m.deleted_at IS NULL
    AND m.status = 'active'
  ORDER BY m.joined_at NULLS LAST, m.created_at
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION private.fn_current_tenant_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_current_tenant_id() TO authenticated;

-- 3. is_platform_admin -----------------------------------------------------
CREATE OR REPLACE FUNCTION private.fn_is_platform_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.fn_has_role(auth.uid(), 'admin')
$$;
REVOKE ALL ON FUNCTION private.fn_is_platform_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_is_platform_admin() TO authenticated;

-- 4. Lifecycle transition matrix ------------------------------------------
CREATE OR REPLACE FUNCTION private.fn_assert_lifecycle_transition(
  _from public.tenant_lifecycle_state,
  _to   public.tenant_lifecycle_state
) RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
BEGIN
  IF _from = _to THEN
    RAISE EXCEPTION 'tenant lifecycle: no-op transition (% -> %)', _from, _to
      USING ERRCODE = 'check_violation';
  END IF;
  IF (_from = 'created'   AND _to = 'active')
  OR (_from = 'active'    AND _to = 'suspended')
  OR (_from = 'suspended' AND _to = 'active')
  OR (_from = 'active'    AND _to = 'archived')
  OR (_from = 'suspended' AND _to = 'archived')
  THEN RETURN;
  END IF;
  RAISE EXCEPTION 'tenant lifecycle: illegal transition (% -> %)', _from, _to
    USING ERRCODE = 'check_violation';
END $$;

-- 5. Cross-tenant denial logger (resilient) -------------------------------
CREATE OR REPLACE FUNCTION private.fn_log_cross_tenant_denial(
  _actor uuid, _attempted_tenant uuid, _entity text, _reason text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  BEGIN
    INSERT INTO public.audit_logs(action, entity_type, entity_id, actor_id, new_values, occurred_at)
    VALUES ('tenant.access_denied', 'tenant', _attempted_tenant, _actor,
            jsonb_build_object('reason', _reason, 'entity', _entity), now());
  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_notify('audit_fallback',
      jsonb_build_object('actor', _actor, 'tenant', _attempted_tenant, 'entity', _entity, 'reason', _reason)::text);
  END;
END $$;
REVOKE ALL ON FUNCTION private.fn_log_cross_tenant_denial(uuid, uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_log_cross_tenant_denial(uuid, uuid, text, text) TO authenticated;

-- 6. activate_tenant (idempotent, atomic bootstrap) -----------------------
CREATE OR REPLACE FUNCTION private.fn_activate_tenant(_tenant uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t record;
  v_org_id uuid;
  v_branch_id uuid;
  v_fy_id uuid;
  v_already boolean := false;
BEGIN
  IF NOT private.fn_is_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO t FROM public.tenants WHERE id = _tenant FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'tenant % not found', _tenant USING ERRCODE = 'no_data_found';
  END IF;

  IF t.lifecycle_state = 'active' THEN
    v_already := true;
  ELSE
    PERFORM private.fn_assert_lifecycle_transition(t.lifecycle_state, 'active');
    UPDATE public.tenants
      SET lifecycle_state = 'active', activated_at = coalesce(activated_at, now())
      WHERE id = _tenant;
  END IF;

  -- Seed organization (idempotent by natural key: tenant_id + slug)
  SELECT id INTO v_org_id FROM public.organizations
    WHERE tenant_id = _tenant AND slug = t.slug::text LIMIT 1;
  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations(name, slug, tenant_id)
    VALUES (t.display_name, t.slug::text, _tenant)
    RETURNING id INTO v_org_id;
  END IF;

  -- Seed default branch
  SELECT id INTO v_branch_id FROM public.branches
    WHERE organization_id = v_org_id AND is_default LIMIT 1;
  IF v_branch_id IS NULL THEN
    INSERT INTO public.branches(tenant_id, organization_id, code, name, is_default)
    VALUES (_tenant, v_org_id, 'HQ', 'Headquarters', true)
    RETURNING id INTO v_branch_id;
  END IF;

  -- Seed placeholder financial year (calendar year of activation)
  SELECT id INTO v_fy_id FROM public.financial_years
    WHERE organization_id = v_org_id AND is_placeholder LIMIT 1;
  IF v_fy_id IS NULL THEN
    INSERT INTO public.financial_years(tenant_id, organization_id, code, start_date, end_date, is_placeholder)
    VALUES (_tenant, v_org_id,
            'FY-' || to_char(now(),'YYYY'),
            date_trunc('year', now())::date,
            (date_trunc('year', now()) + interval '1 year - 1 day')::date,
            true)
    RETURNING id INTO v_fy_id;
  END IF;

  RETURN jsonb_build_object(
    'tenant_id', _tenant,
    'organization_id', v_org_id,
    'branch_id', v_branch_id,
    'financial_year_id', v_fy_id,
    'already_active', v_already
  );
END $$;
REVOKE ALL ON FUNCTION private.fn_activate_tenant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_activate_tenant(uuid) TO authenticated;

-- 7. suspend_tenant --------------------------------------------------------
CREATE OR REPLACE FUNCTION private.fn_suspend_tenant(_tenant uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record;
BEGIN
  IF NOT private.fn_is_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT * INTO t FROM public.tenants WHERE id = _tenant FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'tenant % not found', _tenant USING ERRCODE='no_data_found'; END IF;
  IF t.lifecycle_state = 'suspended' THEN
    RETURN jsonb_build_object('tenant_id',_tenant,'already_suspended', true, 'from_state', t.lifecycle_state);
  END IF;
  PERFORM private.fn_assert_lifecycle_transition(t.lifecycle_state, 'suspended');
  UPDATE public.tenants SET lifecycle_state='suspended', suspended_at=now() WHERE id=_tenant;
  RETURN jsonb_build_object('tenant_id',_tenant,'already_suspended', false, 'from_state', t.lifecycle_state);
END $$;
REVOKE ALL ON FUNCTION private.fn_suspend_tenant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_suspend_tenant(uuid) TO authenticated;

-- 8. archive_tenant --------------------------------------------------------
CREATE OR REPLACE FUNCTION private.fn_archive_tenant(_tenant uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record;
BEGIN
  IF NOT private.fn_is_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT * INTO t FROM public.tenants WHERE id = _tenant FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'tenant % not found', _tenant USING ERRCODE='no_data_found'; END IF;
  IF t.lifecycle_state = 'archived' THEN
    RETURN jsonb_build_object('tenant_id',_tenant,'already_archived', true, 'from_state', t.lifecycle_state);
  END IF;
  PERFORM private.fn_assert_lifecycle_transition(t.lifecycle_state, 'archived');
  UPDATE public.tenants SET lifecycle_state='archived', archived_at=now() WHERE id=_tenant;
  RETURN jsonb_build_object('tenant_id',_tenant,'already_archived', false, 'from_state', t.lifecycle_state);
END $$;
REVOKE ALL ON FUNCTION private.fn_archive_tenant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_archive_tenant(uuid) TO authenticated;
