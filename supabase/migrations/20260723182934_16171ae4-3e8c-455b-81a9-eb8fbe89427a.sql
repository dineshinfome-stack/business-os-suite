
CREATE OR REPLACE FUNCTION private.fn_log_lifecycle_event(
  _actor uuid, _entity_type text, _entity_id uuid, _action text, _payload jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  BEGIN
    INSERT INTO public.audit_logs(action, entity_type, entity_id, actor_id, new_values, occurred_at)
    VALUES (_action, _entity_type, _entity_id, _actor, coalesce(_payload, '{}'::jsonb), now());
  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_notify('audit_fallback',
      jsonb_build_object('actor', _actor, 'entity_type', _entity_type,
                         'entity_id', _entity_id, 'action', _action, 'payload', _payload)::text);
  END;
END $$;
REVOKE ALL ON FUNCTION private.fn_log_lifecycle_event(uuid, text, uuid, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_log_lifecycle_event(uuid, text, uuid, text, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_assert_company_lifecycle_transition(
  _from public.company_lifecycle_state, _to public.company_lifecycle_state
) RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
BEGIN
  IF _from = _to THEN RAISE EXCEPTION 'company lifecycle: no-op transition (% -> %)', _from, _to USING ERRCODE='check_violation'; END IF;
  IF (_from='created' AND _to='active') OR (_from='active' AND _to='inactive')
  OR (_from='inactive' AND _to='active') OR (_from='active' AND _to='archived')
  OR (_from='inactive' AND _to='archived') THEN RETURN; END IF;
  RAISE EXCEPTION 'company lifecycle: illegal transition (% -> %)', _from, _to USING ERRCODE='check_violation';
END $$;

CREATE OR REPLACE FUNCTION private.fn_assert_branch_lifecycle_transition(
  _from public.branch_lifecycle_state, _to public.branch_lifecycle_state
) RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
BEGIN
  IF _from = _to THEN RAISE EXCEPTION 'branch lifecycle: no-op transition (% -> %)', _from, _to USING ERRCODE='check_violation'; END IF;
  IF (_from='active' AND _to='archived') THEN RETURN; END IF;
  RAISE EXCEPTION 'branch lifecycle: illegal transition (% -> %)', _from, _to USING ERRCODE='check_violation';
END $$;

CREATE OR REPLACE FUNCTION private.fn_assert_financial_year_lifecycle_transition(
  _from public.financial_year_lifecycle_state, _to public.financial_year_lifecycle_state
) RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
BEGIN
  IF _from = _to THEN RAISE EXCEPTION 'financial_year lifecycle: no-op transition (% -> %)', _from, _to USING ERRCODE='check_violation'; END IF;
  IF (_from='created' AND _to='open') OR (_from='open' AND _to='closed') OR (_from='closed' AND _to='archived') THEN RETURN; END IF;
  RAISE EXCEPTION 'financial_year lifecycle: illegal transition (% -> %)', _from, _to USING ERRCODE='check_violation';
END $$;

CREATE OR REPLACE FUNCTION private.fn_create_company(
  _tenant_id uuid, _slug text, _display_name text,
  _region text DEFAULT 'global', _default_locale text DEFAULT 'en',
  _timezone text DEFAULT 'UTC', _legal_name text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_slug text; v_id uuid; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  IF _tenant_id IS NULL THEN RAISE EXCEPTION 'tenant_id required' USING ERRCODE='null_value_not_allowed'; END IF;
  v_slug := private.fn_normalize_slug(_slug)::text;
  IF v_slug IS NULL OR length(v_slug)=0 THEN RAISE EXCEPTION 'slug required' USING ERRCODE='invalid_parameter_value'; END IF;
  INSERT INTO public.organizations(name, slug, tenant_id, lifecycle_state,
      region, default_locale, timezone, legal_name, created_by, updated_by)
  VALUES (_display_name, v_slug, _tenant_id, 'created',
      _region, _default_locale, _timezone, _legal_name, v_actor, v_actor)
  RETURNING id INTO v_id;
  PERFORM private.fn_log_lifecycle_event(v_actor, 'company', v_id, 'company.created',
    jsonb_build_object('tenant_id', _tenant_id, 'slug', v_slug, 'display_name', _display_name));
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION private.fn_create_company(uuid, text, text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_create_company(uuid, text, text, text, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_activate_company(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO c FROM public.organizations WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'company % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF c.lifecycle_state='active' THEN RETURN jsonb_build_object('id',_id,'already_active',true,'from_state',c.lifecycle_state); END IF;
  PERFORM private.fn_assert_company_lifecycle_transition(c.lifecycle_state,'active');
  UPDATE public.organizations SET lifecycle_state='active', activated_at=coalesce(activated_at,now()), updated_by=v_actor WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'company',_id,'company.activated', jsonb_build_object('from_state',c.lifecycle_state));
  RETURN jsonb_build_object('id',_id,'already_active',false,'from_state',c.lifecycle_state);
END $$;
REVOKE ALL ON FUNCTION private.fn_activate_company(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_activate_company(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_deactivate_company(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO c FROM public.organizations WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'company % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF c.lifecycle_state='inactive' THEN RETURN jsonb_build_object('id',_id,'already_inactive',true,'from_state',c.lifecycle_state); END IF;
  PERFORM private.fn_assert_company_lifecycle_transition(c.lifecycle_state,'inactive');
  UPDATE public.organizations SET lifecycle_state='inactive', deactivated_at=now(), updated_by=v_actor WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'company',_id,'company.deactivated', jsonb_build_object('from_state',c.lifecycle_state));
  RETURN jsonb_build_object('id',_id,'already_inactive',false,'from_state',c.lifecycle_state);
END $$;
REVOKE ALL ON FUNCTION private.fn_deactivate_company(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_deactivate_company(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_archive_company(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record; v_actor uuid := auth.uid(); v_open int;
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO c FROM public.organizations WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'company % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF c.lifecycle_state='archived' THEN RETURN jsonb_build_object('id',_id,'already_archived',true,'from_state',c.lifecycle_state); END IF;
  SELECT count(*) INTO v_open FROM public.financial_years WHERE organization_id=_id AND lifecycle_state IN ('created','open');
  IF v_open>0 THEN
    PERFORM private.fn_log_lifecycle_event(v_actor,'company',_id,'company.archive_denied',
      jsonb_build_object('reason','open_financial_years','count',v_open));
    RAISE EXCEPTION 'cannot archive company % with % open financial year(s)', _id, v_open USING ERRCODE='check_violation';
  END IF;
  PERFORM private.fn_assert_company_lifecycle_transition(c.lifecycle_state,'archived');
  UPDATE public.organizations SET lifecycle_state='archived', archived_at=now(), updated_by=v_actor WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'company',_id,'company.archived', jsonb_build_object('from_state',c.lifecycle_state));
  RETURN jsonb_build_object('id',_id,'already_archived',false,'from_state',c.lifecycle_state);
END $$;
REVOKE ALL ON FUNCTION private.fn_archive_company(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_archive_company(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_set_default_company(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO c FROM public.organizations WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'company % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF c.lifecycle_state <> 'active' THEN RAISE EXCEPTION 'only active companies may be marked default' USING ERRCODE='check_violation'; END IF;
  IF c.is_default THEN RETURN jsonb_build_object('id',_id,'already_default',true); END IF;
  UPDATE public.organizations SET is_default=false, updated_by=v_actor WHERE tenant_id=c.tenant_id AND is_default AND id<>_id;
  UPDATE public.organizations SET is_default=true, updated_by=v_actor WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'company',_id,'company.set_default', jsonb_build_object('tenant_id',c.tenant_id));
  RETURN jsonb_build_object('id',_id,'already_default',false);
END $$;
REVOKE ALL ON FUNCTION private.fn_set_default_company(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_set_default_company(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_create_branch(
  _organization_id uuid, _code text, _name text,
  _address jsonb DEFAULT '{}'::jsonb, _timezone text DEFAULT 'UTC', _is_default boolean DEFAULT false
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org record; v_id uuid; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO v_org FROM public.organizations WHERE id=_organization_id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'company % not found', _organization_id USING ERRCODE='no_data_found'; END IF;
  IF v_org.lifecycle_state <> 'active' THEN
    RAISE EXCEPTION 'parent company % is not active (state=%)', _organization_id, v_org.lifecycle_state USING ERRCODE='check_violation';
  END IF;
  IF _is_default THEN UPDATE public.branches SET is_default=false WHERE organization_id=_organization_id AND is_default; END IF;
  INSERT INTO public.branches(tenant_id, organization_id, code, name, is_default, lifecycle_state, address, timezone)
  VALUES (v_org.tenant_id, _organization_id, _code, _name, coalesce(_is_default,false), 'active', coalesce(_address,'{}'::jsonb), _timezone)
  RETURNING id INTO v_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'branch',v_id,'branch.created',
    jsonb_build_object('organization_id',_organization_id,'code',_code,'is_default',_is_default));
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION private.fn_create_branch(uuid, text, text, jsonb, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_create_branch(uuid, text, text, jsonb, text, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_update_branch(
  _id uuid, _name text DEFAULT NULL, _address jsonb DEFAULT NULL, _timezone text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b record; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO b FROM public.branches WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'branch % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF b.lifecycle_state <> 'active' THEN RAISE EXCEPTION 'branch % is not active', _id USING ERRCODE='check_violation'; END IF;
  UPDATE public.branches SET name=coalesce(_name,name), address=coalesce(_address,address), timezone=coalesce(_timezone,timezone) WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'branch',_id,'branch.updated', jsonb_build_object('name',_name,'timezone',_timezone));
  RETURN jsonb_build_object('id',_id);
END $$;
REVOKE ALL ON FUNCTION private.fn_update_branch(uuid, text, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_update_branch(uuid, text, jsonb, text) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_archive_branch(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b record; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO b FROM public.branches WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'branch % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF b.lifecycle_state='archived' THEN RETURN jsonb_build_object('id',_id,'already_archived',true); END IF;
  IF b.is_default THEN RAISE EXCEPTION 'cannot archive default branch %; set another default first', _id USING ERRCODE='check_violation'; END IF;
  PERFORM private.fn_assert_branch_lifecycle_transition(b.lifecycle_state,'archived');
  UPDATE public.branches SET lifecycle_state='archived', archived_at=now() WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'branch',_id,'branch.archived', jsonb_build_object('from_state',b.lifecycle_state));
  RETURN jsonb_build_object('id',_id,'already_archived',false);
END $$;
REVOKE ALL ON FUNCTION private.fn_archive_branch(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_archive_branch(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_set_default_branch(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b record; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO b FROM public.branches WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'branch % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF b.lifecycle_state <> 'active' THEN RAISE EXCEPTION 'only active branches may be marked default' USING ERRCODE='check_violation'; END IF;
  IF b.is_default THEN RETURN jsonb_build_object('id',_id,'already_default',true); END IF;
  UPDATE public.branches SET is_default=false WHERE organization_id=b.organization_id AND is_default AND id<>_id;
  UPDATE public.branches SET is_default=true WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'branch',_id,'branch.set_default', jsonb_build_object('organization_id',b.organization_id));
  RETURN jsonb_build_object('id',_id,'already_default',false);
END $$;
REVOKE ALL ON FUNCTION private.fn_set_default_branch(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_set_default_branch(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_create_financial_year(
  _organization_id uuid, _code text, _start_date date, _end_date date, _is_default boolean DEFAULT false
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org record; v_id uuid; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  IF _end_date <= _start_date THEN RAISE EXCEPTION 'end_date must be greater than start_date' USING ERRCODE='check_violation'; END IF;
  SELECT * INTO v_org FROM public.organizations WHERE id=_organization_id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'company % not found', _organization_id USING ERRCODE='no_data_found'; END IF;
  IF v_org.lifecycle_state NOT IN ('created','active') THEN
    RAISE EXCEPTION 'company % must be created or active (state=%)', _organization_id, v_org.lifecycle_state USING ERRCODE='check_violation';
  END IF;
  IF _is_default THEN UPDATE public.financial_years SET is_default=false WHERE organization_id=_organization_id AND is_default; END IF;
  INSERT INTO public.financial_years(tenant_id, organization_id, code, start_date, end_date, is_placeholder, is_default, lifecycle_state)
  VALUES (v_org.tenant_id, _organization_id, _code, _start_date, _end_date, false, coalesce(_is_default,false), 'created')
  RETURNING id INTO v_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'financial_year',v_id,'financialyear.created',
    jsonb_build_object('organization_id',_organization_id,'code',_code,'start_date',_start_date,'end_date',_end_date));
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION private.fn_create_financial_year(uuid, text, date, date, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_create_financial_year(uuid, text, date, date, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_open_financial_year(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f record; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO f FROM public.financial_years WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'financial_year % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF f.lifecycle_state='open' THEN RETURN jsonb_build_object('id',_id,'already_open',true); END IF;
  PERFORM private.fn_assert_financial_year_lifecycle_transition(f.lifecycle_state,'open');
  UPDATE public.financial_years SET lifecycle_state='open', opened_at=coalesce(opened_at,now()) WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'financial_year',_id,'financialyear.opened', jsonb_build_object('from_state',f.lifecycle_state));
  RETURN jsonb_build_object('id',_id,'already_open',false);
END $$;
REVOKE ALL ON FUNCTION private.fn_open_financial_year(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_open_financial_year(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_close_financial_year(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f record; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO f FROM public.financial_years WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'financial_year % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF f.lifecycle_state='closed' THEN RETURN jsonb_build_object('id',_id,'already_closed',true); END IF;
  PERFORM private.fn_assert_financial_year_lifecycle_transition(f.lifecycle_state,'closed');
  UPDATE public.financial_years SET lifecycle_state='closed', closed_at=now() WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'financial_year',_id,'financialyear.closed', jsonb_build_object('from_state',f.lifecycle_state));
  RETURN jsonb_build_object('id',_id,'already_closed',false);
END $$;
REVOKE ALL ON FUNCTION private.fn_close_financial_year(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_close_financial_year(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_archive_financial_year(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f record; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO f FROM public.financial_years WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'financial_year % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF f.lifecycle_state='archived' THEN RETURN jsonb_build_object('id',_id,'already_archived',true); END IF;
  PERFORM private.fn_assert_financial_year_lifecycle_transition(f.lifecycle_state,'archived');
  UPDATE public.financial_years SET lifecycle_state='archived', archived_at=now() WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'financial_year',_id,'financialyear.archived', jsonb_build_object('from_state',f.lifecycle_state));
  RETURN jsonb_build_object('id',_id,'already_archived',false);
END $$;
REVOKE ALL ON FUNCTION private.fn_archive_financial_year(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_archive_financial_year(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.fn_set_default_financial_year(_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f record; v_actor uuid := auth.uid();
BEGIN
  IF NOT private.fn_is_platform_admin() THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='insufficient_privilege'; END IF;
  SELECT * INTO f FROM public.financial_years WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'financial_year % not found', _id USING ERRCODE='no_data_found'; END IF;
  IF f.lifecycle_state NOT IN ('created','open') THEN
    RAISE EXCEPTION 'only created/open financial years may be marked default' USING ERRCODE='check_violation';
  END IF;
  IF f.is_default THEN RETURN jsonb_build_object('id',_id,'already_default',true); END IF;
  UPDATE public.financial_years SET is_default=false WHERE organization_id=f.organization_id AND is_default AND id<>_id;
  UPDATE public.financial_years SET is_default=true WHERE id=_id;
  PERFORM private.fn_log_lifecycle_event(v_actor,'financial_year',_id,'financialyear.set_default', jsonb_build_object('organization_id',f.organization_id));
  RETURN jsonb_build_object('id',_id,'already_default',false);
END $$;
REVOKE ALL ON FUNCTION private.fn_set_default_financial_year(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_set_default_financial_year(uuid) TO authenticated;
