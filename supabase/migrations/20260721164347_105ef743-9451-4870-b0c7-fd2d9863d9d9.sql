-- =============================================================================
-- Migration:     006_revoke_anon_platform_grants
-- Sprint:        0.2
-- Purpose:       Enforce Repository Table Standard: no anon grants on tables
--                without an anon-scoped policy. RLS already blocks these paths.
-- Dependencies:  003, 004, 005
-- Rollback:      GRANT SELECT,INSERT,UPDATE,DELETE ON <table> TO anon;
-- Author:        platform
-- Date:          2026-07-21
-- =============================================================================

REVOKE ALL ON public.profiles    FROM anon;
REVOKE ALL ON public.user_roles  FROM anon;
REVOKE ALL ON public.audit_logs  FROM anon;