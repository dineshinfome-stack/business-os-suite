-- =============================================================================
-- Migration:     004a_revoke_fn_has_role_from_anon
-- Sprint:        0.2
-- Purpose:       Remove anon EXECUTE on fn_has_role (Supabase default grant).
-- Dependencies:  004_roles
-- Rollback:      GRANT EXECUTE ON FUNCTION public.fn_has_role(uuid, public.app_role) TO anon;
-- Author:        platform
-- Date:          2026-07-21
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.fn_has_role(uuid, public.app_role) FROM anon;