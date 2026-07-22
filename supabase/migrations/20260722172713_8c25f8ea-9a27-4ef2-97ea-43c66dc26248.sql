-- =============================================================================
-- Migration:     007_auth_stabilization
-- Sprint:        0.4A
-- Purpose:       Grant authenticated USAGE/EXECUTE on private schema helpers,
--                add own-actor audit_logs insert policy, and backfill missing
--                profiles + personal organizations for historical users.
-- Idempotent:    Yes. Safe to re-apply.
-- =============================================================================

BEGIN;

-- 1. Schema + function grants -------------------------------------------------
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.fn_has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.fn_is_org_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.fn_org_role(uuid, uuid) TO authenticated;

-- 2. Own-actor audit insert policy -------------------------------------------
DROP POLICY IF EXISTS audit_logs_insert_own ON public.audit_logs;
CREATE POLICY audit_logs_insert_own ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- 3. Profile backfill (idempotent) -------------------------------------------
INSERT INTO public.profiles (id, display_name, avatar_url, created_by, updated_by)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1),
    u.email
  ),
  u.raw_user_meta_data->>'avatar_url',
  u.id,
  u.id
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 4. Personal organization + membership backfill (idempotent) ----------------
DO $$
DECLARE
  r RECORD;
  v_display_name text;
  v_base_slug    text;
  v_slug         text;
  v_suffix       int;
  v_org_id       uuid;
BEGIN
  FOR r IN
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1 FROM public.organization_members m WHERE m.user_id = u.id
    )
  LOOP
    v_display_name := COALESCE(
      r.raw_user_meta_data->>'full_name',
      r.raw_user_meta_data->>'name',
      split_part(r.email, '@', 1)
    );

    v_base_slug := regexp_replace(lower(COALESCE(v_display_name, 'user')), '[^a-z0-9]+', '-', 'g');
    v_base_slug := trim(both '-' from v_base_slug);
    IF v_base_slug = '' THEN v_base_slug := 'user'; END IF;
    v_slug := v_base_slug || '-' || substr(r.id::text, 1, 8);
    v_suffix := 0;
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE slug = v_slug) LOOP
      v_suffix := v_suffix + 1;
      v_slug := v_base_slug || '-' || substr(r.id::text, 1, 8) || '-' || v_suffix::text;
    END LOOP;

    INSERT INTO public.organizations (name, slug, created_by, updated_by)
    VALUES (COALESCE(v_display_name, 'My') || '''s Workspace', v_slug, r.id, r.id)
    RETURNING id INTO v_org_id;

    INSERT INTO public.organization_members
      (organization_id, user_id, role, status, joined_at, created_by, updated_by)
    VALUES (v_org_id, r.id, 'owner', 'active', now(), r.id, r.id);
  END LOOP;
END $$;

COMMIT;