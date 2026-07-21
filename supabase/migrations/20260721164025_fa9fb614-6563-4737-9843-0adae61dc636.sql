-- =============================================================================
-- Migration:     003a_lock_fn_handle_new_auth_user
-- Sprint:        0.2
-- Purpose:       Restrict EXECUTE on internal trigger function to the trigger only.
-- Dependencies:  003_profiles
-- Rollback:      GRANT EXECUTE ON FUNCTION public.fn_handle_new_auth_user() TO PUBLIC;
-- Author:        platform
-- Date:          2026-07-21
-- =============================================================================

REVOKE ALL ON FUNCTION public.fn_handle_new_auth_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_handle_new_auth_user() FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.fn_handle_new_auth_user() TO service_role;
-- The trigger on auth.users runs with the definer's rights; no EXECUTE grant needed for it.