-- =====================================================================
-- SPR-MOD-001-003 · Gate 3.8 · Pass 3.8.3 — bootstrap write surface
-- Onboarding tables remain SELECT-only for `authenticated`; every write
-- happens through these permission-gated SECURITY DEFINER routines.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.fn_onboarding_start(
  _tenant_id      uuid,
  _correlation_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $function$
DECLARE
  v_id       uuid;
  v_state    text;
  v_version  integer;
  v_created  boolean := false;
BEGIN
  IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.update') THEN
    RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
  END IF;

  PERFORM 1 FROM public.tenants
   WHERE id = _tenant_id AND deleted_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT id, state, version
    INTO v_id, v_state, v_version
    FROM public.tenant_onboarding
   WHERE tenant_id = _tenant_id
   FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.tenant_onboarding
      (tenant_id, state, version, started_at, started_by, last_correlation_id)
    VALUES
      (_tenant_id, 'in_progress', 1, now(), auth.uid(), _correlation_id)
    RETURNING id, state, version INTO v_id, v_state, v_version;
    v_created := true;

  ELSIF v_state = 'activated' THEN
    RAISE EXCEPTION 'Onboarding already activated' USING ERRCODE = '22023';

  ELSIF v_state IN ('not_started', 'cancelled') THEN
    UPDATE public.tenant_onboarding
       SET state               = 'in_progress',
           version             = version + 1,
           started_at          = COALESCE(started_at, now()),
           started_by          = COALESCE(started_by, auth.uid()),
           cancelled_at        = NULL,
           cancelled_by        = NULL,
           cancellation_reason = NULL,
           last_correlation_id = COALESCE(_correlation_id, last_correlation_id)
     WHERE id = v_id
    RETURNING state, version INTO v_state, v_version;
  END IF;

  INSERT INTO public.tenant_onboarding_steps
    (tenant_onboarding_id, tenant_id, step_key)
  SELECT v_id, _tenant_id, k
    FROM unnest(ARRAY[
      'provisioning_verified','organization_profile','primary_branch',
      'tenant_admin_invitation','tenant_admin_membership','roles_assigned',
      'required_settings','financial_year','readiness_validation','activation'
    ]) AS k
  ON CONFLICT (tenant_id, step_key) DO NOTHING;

  RETURN jsonb_build_object(
    'tenant_id',     _tenant_id,
    'onboarding_id', v_id,
    'state',         v_state,
    'version',       v_version,
    'created',       v_created
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.fn_onboarding_start(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_onboarding_start(uuid, text) TO authenticated;


CREATE OR REPLACE FUNCTION public.fn_onboarding_record_step(
  _tenant_id        uuid,
  _step_key         text,
  _status           text,
  _failure_code     text    DEFAULT NULL,
  _failure_summary  text    DEFAULT NULL,
  _correlation_id   text    DEFAULT NULL,
  _expected_version integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'private'
AS $function$
DECLARE
  v_id           uuid;
  v_state        text;
  v_step_version integer;
  v_row          public.tenant_onboarding_steps%ROWTYPE;
BEGIN
  IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.update') THEN
    RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
  END IF;

  IF _step_key NOT IN (
      'provisioning_verified','organization_profile','primary_branch',
      'tenant_admin_invitation','tenant_admin_membership','roles_assigned',
      'required_settings','financial_year','readiness_validation','activation') THEN
    RAISE EXCEPTION 'invalid step_key: %', _step_key USING ERRCODE = '22023';
  END IF;

  IF _status NOT IN
     ('not_started','in_progress','completed','blocked','failed','skipped') THEN
    RAISE EXCEPTION 'invalid status: %', _status USING ERRCODE = '22023';
  END IF;

  SELECT id, state INTO v_id, v_state
    FROM public.tenant_onboarding
   WHERE tenant_id = _tenant_id
   FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.fn_onboarding_start(_tenant_id, _correlation_id);
    SELECT id, state INTO v_id, v_state
      FROM public.tenant_onboarding
     WHERE tenant_id = _tenant_id
     FOR UPDATE;
  END IF;

  IF v_state = 'activated' THEN
    RAISE EXCEPTION 'Onboarding already activated' USING ERRCODE = '22023';
  END IF;

  SELECT version INTO v_step_version
    FROM public.tenant_onboarding_steps
   WHERE tenant_id = _tenant_id AND step_key = _step_key
   FOR UPDATE;

  IF FOUND AND _expected_version IS NOT NULL AND v_step_version <> _expected_version THEN
    RAISE EXCEPTION 'version conflict on step %', _step_key USING ERRCODE = '40001';
  END IF;

  INSERT INTO public.tenant_onboarding_steps AS s
    (tenant_onboarding_id, tenant_id, step_key, status, attempt_count,
     started_at, completed_at, blocked_at, failure_code, failure_summary,
     correlation_id, updated_by, version)
  VALUES
    (v_id, _tenant_id, _step_key, _status,
     CASE WHEN _status = 'not_started' THEN 0 ELSE 1 END,
     CASE WHEN _status = 'not_started' THEN NULL ELSE now() END,
     CASE WHEN _status = 'completed' THEN now() ELSE NULL END,
     CASE WHEN _status = 'blocked' THEN now() ELSE NULL END,
     _failure_code, left(_failure_summary, 500), _correlation_id, auth.uid(), 1)
  ON CONFLICT (tenant_id, step_key) DO UPDATE
     SET status          = EXCLUDED.status,
         attempt_count   = s.attempt_count
                           + CASE WHEN EXCLUDED.status IN ('completed','failed','blocked','in_progress')
                                  THEN 1 ELSE 0 END,
         started_at      = COALESCE(s.started_at, EXCLUDED.started_at),
         completed_at    = CASE WHEN EXCLUDED.status = 'completed' THEN now() ELSE NULL END,
         blocked_at      = CASE WHEN EXCLUDED.status = 'blocked' THEN now() ELSE NULL END,
         failure_code    = EXCLUDED.failure_code,
         failure_summary = EXCLUDED.failure_summary,
         correlation_id  = COALESCE(EXCLUDED.correlation_id, s.correlation_id),
         updated_by      = EXCLUDED.updated_by,
         version         = s.version + 1
  RETURNING * INTO v_row;

  UPDATE public.tenant_onboarding
     SET state               = CASE WHEN state = 'not_started' THEN 'in_progress' ELSE state END,
         version             = version + 1,
         started_at          = COALESCE(started_at, now()),
         last_correlation_id = COALESCE(_correlation_id, last_correlation_id)
   WHERE id = v_id
  RETURNING state INTO v_state;

  RETURN jsonb_build_object(
    'tenant_id',    _tenant_id,
    'step_key',     v_row.step_key,
    'status',       v_row.status,
    'version',      v_row.version,
    'attempt_count', v_row.attempt_count,
    'state',        v_state
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.fn_onboarding_record_step(uuid, text, text, text, text, text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_onboarding_record_step(uuid, text, text, text, text, text, integer) TO authenticated;