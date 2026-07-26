-- Gate 3.6 · Lifecycle transition matrix + operational RPCs

-- 1. Transition matrix (superset of the pre-3.6 rules) ----------------------
CREATE OR REPLACE FUNCTION private.fn_assert_lifecycle_transition(
  _from public.tenant_lifecycle_state,
  _to   public.tenant_lifecycle_state
) RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
BEGIN
  IF _from = _to THEN
    RAISE EXCEPTION 'tenant lifecycle: no-op transition (% -> %)', _from, _to
      USING ERRCODE = 'check_violation';
  END IF;
  IF (_from = 'created'          AND _to = 'active')
  OR (_from = 'active'           AND _to = 'suspended')
  OR (_from = 'suspended'        AND _to = 'active')
  OR (_from = 'active'           AND _to = 'archived')
  OR (_from = 'suspended'        AND _to = 'archived')
  OR (_from = 'active'           AND _to = 'maintenance')
  OR (_from = 'maintenance'      AND _to = 'active')
  OR (_from = 'maintenance'      AND _to = 'suspended')
  OR (_from = 'maintenance'      AND _to = 'archived')
  OR (_from = 'archived'         AND _to = 'active')
  OR (_from = 'archived'         AND _to = 'pending_deletion')
  OR (_from = 'pending_deletion' AND _to = 'archived')
  OR (_from = 'pending_deletion' AND _to = 'deleted')
  THEN RETURN;
  END IF;
  RAISE EXCEPTION 'tenant lifecycle: illegal transition (% -> %)', _from, _to
    USING ERRCODE = 'check_violation';
END $$;

-- 2. enter_maintenance ------------------------------------------------------
CREATE OR REPLACE FUNCTION private.fn_enter_maintenance(_tenant uuid, _reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record;
BEGIN
  IF NOT private.fn_is_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF _reason IS NULL OR btrim(_reason) = '' THEN
    RAISE EXCEPTION 'maintenance requires a reason' USING ERRCODE = 'check_violation';
  END IF;
  SELECT * INTO t FROM public.tenants WHERE id = _tenant FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'tenant % not found', _tenant USING ERRCODE='no_data_found'; END IF;
  IF t.lifecycle_state = 'maintenance' THEN
    RETURN jsonb_build_object('tenant_id',_tenant,'already_in_maintenance',true,'from_state',t.lifecycle_state);
  END IF;
  PERFORM private.fn_assert_lifecycle_transition(t.lifecycle_state, 'maintenance');
  UPDATE public.tenants
     SET lifecycle_state='maintenance', maintenance_started_at=now(), maintenance_reason=btrim(_reason)
   WHERE id=_tenant;
  RETURN jsonb_build_object('tenant_id',_tenant,'already_in_maintenance',false,'from_state',t.lifecycle_state);
END $$;
REVOKE ALL ON FUNCTION private.fn_enter_maintenance(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_enter_maintenance(uuid, text) TO authenticated;

-- 3. exit_maintenance -------------------------------------------------------
CREATE OR REPLACE FUNCTION private.fn_exit_maintenance(_tenant uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record;
BEGIN
  IF NOT private.fn_is_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT * INTO t FROM public.tenants WHERE id = _tenant FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'tenant % not found', _tenant USING ERRCODE='no_data_found'; END IF;
  IF t.lifecycle_state <> 'maintenance' THEN
    RETURN jsonb_build_object('tenant_id',_tenant,'already_active',true,'from_state',t.lifecycle_state);
  END IF;
  PERFORM private.fn_assert_lifecycle_transition('maintenance', 'active');
  UPDATE public.tenants
     SET lifecycle_state='active', maintenance_started_at=NULL, maintenance_reason=NULL
   WHERE id=_tenant;
  RETURN jsonb_build_object('tenant_id',_tenant,'already_active',false,'from_state',t.lifecycle_state);
END $$;
REVOKE ALL ON FUNCTION private.fn_exit_maintenance(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_exit_maintenance(uuid) TO authenticated;

-- 4. restore_tenant ---------------------------------------------------------
CREATE OR REPLACE FUNCTION private.fn_restore_tenant(_tenant uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record;
BEGIN
  IF NOT private.fn_is_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;
  SELECT * INTO t FROM public.tenants WHERE id = _tenant FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'tenant % not found', _tenant USING ERRCODE='no_data_found'; END IF;
  IF t.lifecycle_state = 'active' THEN
    RETURN jsonb_build_object('tenant_id',_tenant,'already_active',true,'from_state',t.lifecycle_state);
  END IF;
  PERFORM private.fn_assert_lifecycle_transition(t.lifecycle_state, 'active');
  UPDATE public.tenants
     SET lifecycle_state='active', archived_at=NULL, activated_at=coalesce(activated_at, now())
   WHERE id=_tenant;
  RETURN jsonb_build_object('tenant_id',_tenant,'already_active',false,'from_state',t.lifecycle_state);
END $$;
REVOKE ALL ON FUNCTION private.fn_restore_tenant(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_restore_tenant(uuid) TO authenticated;

-- 5. schedule_tenant_deletion ----------------------------------------------
CREATE OR REPLACE FUNCTION private.fn_schedule_tenant_deletion(
  _tenant uuid, _reason text, _retention_days integer DEFAULT 90
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record;
BEGIN
  IF NOT private.fn_is_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF _reason IS NULL OR btrim(_reason) = '' THEN
    RAISE EXCEPTION 'deletion scheduling requires a reason' USING ERRCODE = 'check_violation';
  END IF;
  IF _retention_days IS NULL OR _retention_days < 1 OR _retention_days > 3650 THEN
    RAISE EXCEPTION 'retention days must be between 1 and 3650' USING ERRCODE = 'check_violation';
  END IF;
  SELECT * INTO t FROM public.tenants WHERE id = _tenant FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'tenant % not found', _tenant USING ERRCODE='no_data_found'; END IF;
  IF t.lifecycle_state = 'pending_deletion' THEN
    RETURN jsonb_build_object('tenant_id',_tenant,'already_scheduled',true,'from_state',t.lifecycle_state,
                              'purge_after', t.purge_after);
  END IF;
  PERFORM private.fn_assert_lifecycle_transition(t.lifecycle_state, 'pending_deletion');
  UPDATE public.tenants
     SET lifecycle_state='pending_deletion',
         deletion_scheduled_at=now(),
         deletion_scheduled_by=auth.uid(),
         deletion_reason=btrim(_reason),
         purge_after=now() + make_interval(days => _retention_days)
   WHERE id=_tenant;
  RETURN jsonb_build_object('tenant_id',_tenant,'already_scheduled',false,'from_state',t.lifecycle_state,
                            'purge_after', now() + make_interval(days => _retention_days));
END $$;
REVOKE ALL ON FUNCTION private.fn_schedule_tenant_deletion(uuid, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_schedule_tenant_deletion(uuid, text, integer) TO authenticated;

-- 6. cancel_tenant_deletion -------------------------------------------------
CREATE OR REPLACE FUNCTION private.fn_cancel_tenant_deletion(_tenant uuid, _reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record;
BEGIN
  IF NOT private.fn_is_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF _reason IS NULL OR btrim(_reason) = '' THEN
    RAISE EXCEPTION 'cancelling deletion requires a reason' USING ERRCODE = 'check_violation';
  END IF;
  SELECT * INTO t FROM public.tenants WHERE id = _tenant FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'tenant % not found', _tenant USING ERRCODE='no_data_found'; END IF;
  IF t.lifecycle_state <> 'pending_deletion' THEN
    RETURN jsonb_build_object('tenant_id',_tenant,'already_cancelled',true,'from_state',t.lifecycle_state);
  END IF;
  PERFORM private.fn_assert_lifecycle_transition('pending_deletion', 'archived');
  UPDATE public.tenants
     SET lifecycle_state='archived',
         deletion_scheduled_at=NULL,
         deletion_scheduled_by=NULL,
         purge_after=NULL,
         deletion_reason=btrim(_reason),
         archived_at=coalesce(archived_at, now())
   WHERE id=_tenant;
  RETURN jsonb_build_object('tenant_id',_tenant,'already_cancelled',false,'from_state',t.lifecycle_state);
END $$;
REVOKE ALL ON FUNCTION private.fn_cancel_tenant_deletion(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_cancel_tenant_deletion(uuid, text) TO authenticated;

-- 7. delete_tenant (soft delete + purge marker) -----------------------------
CREATE OR REPLACE FUNCTION private.fn_delete_tenant(_tenant uuid, _reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  t record;
  v_active_users integer;
  v_running_jobs integer;
BEGIN
  IF NOT private.fn_is_platform_admin() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF _reason IS NULL OR btrim(_reason) = '' THEN
    RAISE EXCEPTION 'deletion requires a reason' USING ERRCODE = 'check_violation';
  END IF;
  SELECT * INTO t FROM public.tenants WHERE id = _tenant FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'tenant % not found', _tenant USING ERRCODE='no_data_found'; END IF;
  IF t.lifecycle_state = 'deleted' THEN
    RETURN jsonb_build_object('tenant_id',_tenant,'already_deleted',true,'from_state',t.lifecycle_state);
  END IF;

  SELECT count(*) INTO v_active_users
    FROM public.organization_members m
    JOIN public.organizations o ON o.id = m.organization_id
   WHERE o.tenant_id = _tenant AND coalesce(m.status,'active') = 'active';
  IF v_active_users > 0 THEN
    RAISE EXCEPTION 'tenant has % active member(s)', v_active_users USING ERRCODE = 'check_violation';
  END IF;

  SELECT count(*) INTO v_running_jobs
    FROM public.provisioning_jobs j
   WHERE j.tenant_id = _tenant
     AND j.state NOT IN ('completed','failed','cancelled','rolled_back');
  IF v_running_jobs > 0 THEN
    RAISE EXCEPTION 'tenant has % provisioning job(s) in flight', v_running_jobs USING ERRCODE = 'check_violation';
  END IF;

  PERFORM private.fn_assert_lifecycle_transition(t.lifecycle_state, 'deleted');
  UPDATE public.tenants
     SET lifecycle_state='deleted',
         deleted_at=now(),
         deleted_by=auth.uid(),
         deletion_reason=btrim(_reason),
         purge_after=coalesce(purge_after, now() + interval '90 days')
   WHERE id=_tenant;
  RETURN jsonb_build_object('tenant_id',_tenant,'already_deleted',false,'from_state',t.lifecycle_state);
END $$;
REVOKE ALL ON FUNCTION private.fn_delete_tenant(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.fn_delete_tenant(uuid, text) TO authenticated;

-- 8. Public SECURITY DEFINER wrappers (PostgREST-callable) -------------------
CREATE OR REPLACE FUNCTION public.fn_enter_maintenance(_tenant uuid, _reason text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = 'private','public'
AS $$ SELECT private.fn_enter_maintenance(_tenant, _reason); $$;

CREATE OR REPLACE FUNCTION public.fn_exit_maintenance(_tenant uuid)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = 'private','public'
AS $$ SELECT private.fn_exit_maintenance(_tenant); $$;

CREATE OR REPLACE FUNCTION public.fn_restore_tenant(_tenant uuid)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = 'private','public'
AS $$ SELECT private.fn_restore_tenant(_tenant); $$;

CREATE OR REPLACE FUNCTION public.fn_schedule_tenant_deletion(_tenant uuid, _reason text, _retention_days integer DEFAULT 90)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = 'private','public'
AS $$ SELECT private.fn_schedule_tenant_deletion(_tenant, _reason, _retention_days); $$;

CREATE OR REPLACE FUNCTION public.fn_cancel_tenant_deletion(_tenant uuid, _reason text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = 'private','public'
AS $$ SELECT private.fn_cancel_tenant_deletion(_tenant, _reason); $$;

CREATE OR REPLACE FUNCTION public.fn_delete_tenant(_tenant uuid, _reason text)
RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path = 'private','public'
AS $$ SELECT private.fn_delete_tenant(_tenant, _reason); $$;

REVOKE ALL ON FUNCTION public.fn_enter_maintenance(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_exit_maintenance(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_restore_tenant(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_schedule_tenant_deletion(uuid, text, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_cancel_tenant_deletion(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_delete_tenant(uuid, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.fn_enter_maintenance(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_exit_maintenance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_restore_tenant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_schedule_tenant_deletion(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_cancel_tenant_deletion(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_delete_tenant(uuid, text) TO authenticated;
