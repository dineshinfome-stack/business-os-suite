-- Pass 3.8.5A — Signup trigger release-blocker repair
-- FINDING-AUTH-SIGNUP-TENANT-FK-20260726
--
-- Defect: the effective body of private.fn_handle_new_auth_user() (set by
-- migration 20260722154850) inserted into public.organizations WITHOUT a
-- tenant_id. Later migrations made public.organizations.tenant_id NOT NULL
-- with a foreign key to public.tenants(id), and replaced global slug
-- uniqueness with (tenant_id, slug). Every auth.users INSERT therefore
-- aborted (23502 first, 23503 secondary), blocking all signup.
--
-- Canonical ownership (ADR-017, operator-run Gate 3.8, tenant self-service
-- deferred): the auth trigger creates the application PROFILE ONLY. Tenants
-- and default organizations are platform-provisioned; membership and
-- administrative roles belong to invitation acceptance and
-- public.fn_onboarding_assign_admin_role.
--
-- Recovery: recovery requires a new append-only migration restoring a
-- known-safe, profile-only trigger implementation. Never restore the
-- tenant-less organization auto-provisioning body from migration
-- 20260722154850. Historical migrations remain immutable.
--
-- Append-only: this migration replaces the function body only. The existing
-- trigger binding trg_auth_users_new_user on auth.users is preserved.

CREATE OR REPLACE FUNCTION private.fn_handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_display_name text;
BEGIN
  -- Deterministic fallback chain. May legitimately resolve to NULL:
  -- public.profiles.display_name is nullable.
  v_display_name := COALESCE(
    NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
    NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'name', '')), ''),
    NULLIF(btrim(split_part(COALESCE(NEW.email, ''), '@', 1)), '')
  );

  -- Profile only. Idempotent create; never overwrite an existing profile so
  -- a trigger replay cannot clobber a user-edited display name or avatar.
  -- No tenant, organization, membership or role authority is ever read from
  -- user metadata, and no such row is ever written here.
  INSERT INTO public.profiles (id, display_name, avatar_url, created_by, updated_by)
  VALUES (
    NEW.id,
    v_display_name,
    NULLIF(btrim(COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')), ''),
    NEW.id,
    NEW.id
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;

ALTER FUNCTION private.fn_handle_new_auth_user() OWNER TO postgres;

REVOKE ALL ON FUNCTION private.fn_handle_new_auth_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.fn_handle_new_auth_user() FROM anon;
REVOKE ALL ON FUNCTION private.fn_handle_new_auth_user() FROM authenticated;