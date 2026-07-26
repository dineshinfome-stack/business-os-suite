-- =====================================================================
-- SPR-MOD-001-003 · Gate 3.8 · Pass 3.8.2 — REMEDIATION CLOSURE
-- Forward-only corrective migration. Prior migrations remain untouched.
--   REM-382-001  service_role reduced to SELECT on onboarding tables
--   REM-382-004  RLS moved from legacy enum role to canonical permission
--   REM-382-002  exact server-side pagination RPC (replaces 1,000-row scan)
--   REM-382-003  step sequence stays registry-owned (non-persisted mirror)
-- =====================================================================

-- ---------------------------------------------------------------- grants
REVOKE ALL ON public.tenant_onboarding FROM anon, authenticated, service_role;
REVOKE ALL ON public.tenant_onboarding_steps FROM anon, authenticated, service_role;

GRANT SELECT ON public.tenant_onboarding TO authenticated;
GRANT SELECT ON public.tenant_onboarding TO service_role;
GRANT SELECT ON public.tenant_onboarding_steps TO authenticated;
GRANT SELECT ON public.tenant_onboarding_steps TO service_role;

-- ------------------------------------------------- onboarding RLS (Res. B)
DROP POLICY IF EXISTS tenant_onboarding_select_platform_admin ON public.tenant_onboarding;
DROP POLICY IF EXISTS tenant_onboarding_steps_select_platform_admin ON public.tenant_onboarding_steps;

CREATE POLICY tenant_onboarding_select_platform_permission
  ON public.tenant_onboarding
  FOR SELECT TO authenticated
  USING (private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.read'));

CREATE POLICY tenant_onboarding_steps_select_platform_permission
  ON public.tenant_onboarding_steps
  FOR SELECT TO authenticated
  USING (private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.read'));

-- --------------------------------- additive tenants SELECT policy (approved)
-- Permissive policies OR together: member access OR legacy platform-admin OR
-- the canonical permission. Nothing existing is removed or weakened.
DROP POLICY IF EXISTS tenants_select_platform_permission ON public.tenants;
CREATE POLICY tenants_select_platform_permission
  ON public.tenants
  FOR SELECT TO authenticated
  USING (private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.read'));

-- ------------------------------------------------------------- queue RPC
DROP FUNCTION IF EXISTS public.fn_tenant_onboarding_queue(
  text, text, text, boolean, text, text,
  timestamptz, timestamptz, text, text, integer, integer);

CREATE FUNCTION public.fn_tenant_onboarding_queue(
  _search             text        DEFAULT NULL,
  _state              text        DEFAULT NULL,
  _current_step       text        DEFAULT NULL,
  _has_blockers       boolean     DEFAULT NULL,
  _invitation_status  text        DEFAULT NULL,
  _readiness_status   text        DEFAULT NULL,
  _created_from       timestamptz DEFAULT NULL,
  _created_to         timestamptz DEFAULT NULL,
  _sort_by            text        DEFAULT NULL,
  _sort_dir           text        DEFAULT NULL,
  _page               integer     DEFAULT NULL,
  _page_size          integer     DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, private
AS $fn$
DECLARE
  v_page   integer := COALESCE(_page, 1);
  v_size   integer := COALESCE(_page_size, 25);
  v_sort   text    := COALESCE(NULLIF(btrim(COALESCE(_sort_by, '')), ''), 'updatedAt');
  v_dir    text    := COALESCE(NULLIF(btrim(COALESCE(_sort_dir, '')), ''), 'desc');
  v_search text    := NULLIF(btrim(COALESCE(_search, '')), '');
  v_state  text    := NULLIF(_state, 'all');
  v_step   text    := NULLIF(_current_step, 'all');
  v_inv    text    := NULLIF(_invitation_status, 'all');
  v_ready  text    := NULLIF(_readiness_status, 'all');
  v_offset integer;
  v_total  bigint;
  v_rows   jsonb;
BEGIN
  -- Authorization: procedural denial. An unauthorized caller NEVER receives
  -- an envelope, so "denied" and "empty result" are never confusable.
  IF NOT private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.read') THEN
    RAISE EXCEPTION 'Insufficient permission' USING ERRCODE = '42501';
  END IF;

  -- Input validation mirroring the application Zod contract. Rejections
  -- raise; nothing is silently clamped.
  IF v_page < 1 THEN
    RAISE EXCEPTION 'page must be >= 1' USING ERRCODE = '22023';
  END IF;
  IF v_size < 1 OR v_size > 100 THEN
    RAISE EXCEPTION 'pageSize must be between 1 and 100' USING ERRCODE = '22023';
  END IF;
  IF v_sort NOT IN ('updatedAt', 'startedAt', 'tenantName', 'state') THEN
    RAISE EXCEPTION 'invalid sortBy: %', v_sort USING ERRCODE = '22023';
  END IF;
  IF v_dir NOT IN ('asc', 'desc') THEN
    RAISE EXCEPTION 'invalid sortDir: %', v_dir USING ERRCODE = '22023';
  END IF;
  IF v_state IS NOT NULL AND v_state NOT IN
     ('not_started','in_progress','blocked','ready_for_activation','activated','cancelled') THEN
    RAISE EXCEPTION 'invalid state: %', v_state USING ERRCODE = '22023';
  END IF;
  IF v_step IS NOT NULL AND v_step NOT IN
     ('provisioning_verified','organization_profile','primary_branch',
      'tenant_admin_invitation','tenant_admin_membership','roles_assigned',
      'required_settings','financial_year','readiness_validation','activation') THEN
    RAISE EXCEPTION 'invalid currentStep: %', v_step USING ERRCODE = '22023';
  END IF;
  IF v_inv IS NOT NULL AND v_inv NOT IN ('pending','accepted','revoked','expired','none') THEN
    RAISE EXCEPTION 'invalid invitationStatus: %', v_inv USING ERRCODE = '22023';
  END IF;
  IF v_ready IS NOT NULL AND v_ready NOT IN
     ('not_ready','ready_with_warnings','ready','not_evaluated') THEN
    RAISE EXCEPTION 'invalid readinessStatus: %', v_ready USING ERRCODE = '22023';
  END IF;
  IF _created_from IS NOT NULL AND _created_to IS NOT NULL AND _created_from > _created_to THEN
    RAISE EXCEPTION 'createdFrom must be on or before createdTo' USING ERRCODE = '22023';
  END IF;

  v_offset := (v_page - 1) * v_size;

  -- ONE statement, ONE filtered snapshot: the exact total and the page rows
  -- are derived from the same `filtered` CTE so concurrent tenant changes
  -- cannot yield a total and a row set from different snapshots.
  WITH canonical_steps(step_key, seq) AS (
    -- Non-persisted, parity-tested mirror of the TypeScript ONBOARDING_STEPS
    -- registry. Used only to compute/filter the current step. The registry
    -- remains the single source of truth.
    VALUES ('provisioning_verified', 1), ('organization_profile', 2),
           ('primary_branch', 3), ('tenant_admin_invitation', 4),
           ('tenant_admin_membership', 5), ('roles_assigned', 6),
           ('required_settings', 7), ('financial_year', 8),
           ('readiness_validation', 9), ('activation', 10)
  ),
  base AS (
    SELECT
      t.id                                 AS tenant_id,
      t.display_name                       AS display_name,
      t.slug::text                         AS slug,
      t.code                               AS code,
      t.created_at                         AS tenant_created_at,
      t.updated_at                         AS tenant_updated_at,
      o.id                                 AS onboarding_id,
      o.state                              AS onboarding_state,
      o.version                            AS version,
      o.started_at                         AS started_at,
      o.ready_at                           AS ready_at,
      o.activated_at                       AS activated_at,
      o.cancelled_at                       AS cancelled_at,
      o.blocked_at                         AS blocked_at,
      o.blocked_reason_code                AS blocked_reason_code,
      o.blocked_reason_summary             AS blocked_reason_summary,
      o.last_readiness_checked_at          AS last_readiness_checked_at,
      o.last_correlation_id                AS last_correlation_id,
      o.created_at                         AS onboarding_created_at,
      o.updated_at                         AS onboarding_updated_at
    FROM public.tenants t
    LEFT JOIN public.tenant_onboarding o ON o.tenant_id = t.id
    WHERE t.deleted_at IS NULL
      AND t.lifecycle_state NOT IN ('pending_deletion', 'deleted')
  ),
  step_projection AS (
    SELECT
      b.tenant_id,
      (
        SELECT cs.step_key
        FROM canonical_steps cs
        LEFT JOIN public.tenant_onboarding_steps s
               ON s.tenant_id = b.tenant_id AND s.step_key = cs.step_key
        WHERE COALESCE(s.status, 'not_started') NOT IN ('completed', 'skipped')
        ORDER BY cs.seq
        LIMIT 1
      ) AS current_step_key
    FROM base b
  ),
  projected AS (
    SELECT
      b.*,
      COALESCE(b.onboarding_state, 'not_started') AS eff_state,
      CASE
        WHEN COALESCE(b.onboarding_state, 'not_started') = 'not_started' THEN NULL
        ELSE sp.current_step_key
      END AS current_step_key,
      COALESCE(b.onboarding_updated_at, b.tenant_updated_at) AS eff_updated_at
    FROM base b
    JOIN step_projection sp ON sp.tenant_id = b.tenant_id
  ),
  filtered AS MATERIALIZED (
    SELECT p.*
    FROM projected p
    WHERE (v_search IS NULL
           OR p.display_name ILIKE '%' || v_search || '%'
           OR p.slug ILIKE '%' || v_search || '%'
           OR COALESCE(p.code, '') ILIKE '%' || v_search || '%')
      AND (v_state IS NULL OR p.eff_state = v_state)
      AND (v_step  IS NULL OR p.current_step_key = v_step)
      -- Blocker evaluation is owned by Pass 3.8.5: blockerCount is always 0.
      AND (_has_blockers IS NULL OR _has_blockers = false)
      -- invitationStatus is the constant 'none' in this pass.
      AND (v_inv IS NULL OR v_inv = 'none')
      -- readinessStatus is the constant 'not_evaluated' in this pass.
      AND (v_ready IS NULL OR v_ready = 'not_evaluated')
      -- Date filters apply to tenants.created_at, as their names imply.
      AND (_created_from IS NULL OR p.tenant_created_at >= _created_from)
      AND (_created_to   IS NULL OR p.tenant_created_at <= _created_to)
  ),
  ranked AS (
    SELECT
      f.*,
      row_number() OVER (
        ORDER BY
          CASE WHEN v_sort = 'tenantName' AND v_dir = 'asc'  THEN f.display_name    END ASC  NULLS LAST,
          CASE WHEN v_sort = 'tenantName' AND v_dir = 'desc' THEN f.display_name    END DESC NULLS LAST,
          CASE WHEN v_sort = 'state'      AND v_dir = 'asc'  THEN f.eff_state       END ASC  NULLS LAST,
          CASE WHEN v_sort = 'state'      AND v_dir = 'desc' THEN f.eff_state       END DESC NULLS LAST,
          CASE WHEN v_sort = 'startedAt'  AND v_dir = 'asc'  THEN f.started_at      END ASC  NULLS LAST,
          CASE WHEN v_sort = 'startedAt'  AND v_dir = 'desc' THEN f.started_at      END DESC NULLS LAST,
          CASE WHEN v_sort = 'updatedAt'  AND v_dir = 'asc'  THEN f.eff_updated_at  END ASC  NULLS LAST,
          CASE WHEN v_sort = 'updatedAt'  AND v_dir = 'desc' THEN f.eff_updated_at  END DESC NULLS LAST,
          f.tenant_id ASC
      ) AS result_position
    FROM filtered f
  ),
  page_rows AS (
    SELECT
      r.result_position,
      r.tenant_id,
      r.display_name,
      r.slug,
      r.code,
      r.tenant_created_at,
      r.tenant_updated_at,
      r.current_step_key,
      CASE WHEN r.onboarding_id IS NULL THEN NULL ELSE jsonb_build_object(
        'id',                        r.onboarding_id,
        'tenant_id',                 r.tenant_id,
        'state',                     r.onboarding_state,
        'version',                   r.version,
        'started_at',                r.started_at,
        'ready_at',                  r.ready_at,
        'activated_at',              r.activated_at,
        'cancelled_at',              r.cancelled_at,
        'blocked_at',                r.blocked_at,
        'blocked_reason_code',       r.blocked_reason_code,
        'blocked_reason_summary',    r.blocked_reason_summary,
        'last_readiness_checked_at', r.last_readiness_checked_at,
        'last_correlation_id',       r.last_correlation_id,
        'created_at',                r.onboarding_created_at,
        'updated_at',                r.onboarding_updated_at
      ) END AS onboarding
    FROM ranked r
    WHERE r.result_position > v_offset
      AND r.result_position <= v_offset + v_size
  )
  SELECT
    (SELECT count(*) FROM filtered),
    -- jsonb_agg yields NULL over zero rows; the envelope contract demands [].
    COALESCE(
      (SELECT jsonb_agg(to_jsonb(pr) ORDER BY pr.result_position) FROM page_rows pr),
      '[]'::jsonb
    )
  INTO v_total, v_rows;

  RETURN jsonb_build_object(
    'total_count', v_total,
    'rows',        v_rows,
    'page',        v_page,
    'page_size',   v_size
  );
END;
$fn$;

-- ------------------------------------------- function ACL (full signature)
REVOKE EXECUTE ON FUNCTION public.fn_tenant_onboarding_queue(
  text, text, text, boolean, text, text,
  timestamptz, timestamptz, text, text, integer, integer
) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_tenant_onboarding_queue(
  text, text, text, boolean, text, text,
  timestamptz, timestamptz, text, text, integer, integer
) FROM anon;
REVOKE EXECUTE ON FUNCTION public.fn_tenant_onboarding_queue(
  text, text, text, boolean, text, text,
  timestamptz, timestamptz, text, text, integer, integer
) FROM service_role;
GRANT EXECUTE ON FUNCTION public.fn_tenant_onboarding_queue(
  text, text, text, boolean, text, text,
  timestamptz, timestamptz, text, text, integer, integer
) TO authenticated;

COMMENT ON FUNCTION public.fn_tenant_onboarding_queue(
  text, text, text, boolean, text, text,
  timestamptz, timestamptz, text, text, integer, integer
) IS 'Gate 3.8 Pass 3.8.2 remediation: exact server-side pagination for the tenant onboarding queue. SECURITY INVOKER; raises SQLSTATE 42501 without platform.tenant.read. Returns a single envelope {total_count, rows, page, page_size} with rows always a JSON array.';

-- --------------------------------------------------- supporting index
CREATE INDEX IF NOT EXISTS idx_tenant_onboarding_steps_tenant_step
  ON public.tenant_onboarding_steps (tenant_id, step_key);