-- Harden SECURITY DEFINER functions: revoke unnecessary EXECUTE grants and normalize search_path.

-- 1. public.rls_auto_enable is an environment-provided DDL event-trigger
--    function. It is not created by this migration chain and may be absent on a
--    fresh Supabase project. When present, revoke all client-facing EXECUTE
--    grants; when absent, perform no action and create no object.
DO $rls_auto_enable_hardening$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM service_role';
  END IF;
END;
$rls_auto_enable_hardening$;

-- 2. private.fn_* — revoke PUBLIC grants (least privilege). authenticated + service_role retained where applicable.
REVOKE EXECUTE ON FUNCTION private.fn_user_has_permission(uuid, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.fn_user_has_any(uuid, uuid, text[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.fn_user_has_all(uuid, uuid, text[]) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.fn_user_permissions(uuid, uuid) FROM PUBLIC;

-- 3. Normalize search_path on RLS helpers currently set to bare 'public'.
ALTER FUNCTION private.fn_has_role(uuid, app_role) SET search_path = pg_catalog, public;
ALTER FUNCTION private.fn_is_org_member(uuid, uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION private.fn_org_role(uuid, uuid) SET search_path = pg_catalog, public;
ALTER FUNCTION private.fn_handle_new_auth_user() SET search_path = pg_catalog, public;