-- =============================================================================
-- Migration:     003_profiles
-- Sprint:        0.2
-- Purpose:       Public profile row per auth user, auto-created on signup.
-- Dependencies:  001_extensions, 002_shared_helpers
-- Rollback:      See ROLLBACK block at bottom (review-only; not auto-executed).
-- Author:        platform
-- Date:          2026-07-21
-- =============================================================================

-- 1. CREATE TABLE ------------------------------------------------------------
CREATE TABLE public.profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid                 REFERENCES auth.users(id),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid                 REFERENCES auth.users(id),
  deleted_at   timestamptz,
  deleted_by   uuid                 REFERENCES auth.users(id)
);

-- 2. GRANT -------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 3. RLS ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES ----------------------------------------------------------------
CREATE POLICY profiles_owner_select
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_owner_update
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. INDEXES -----------------------------------------------------------------
-- id is PK; no additional indexes required at this time.

-- 6. TRIGGERS ----------------------------------------------------------------
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE OR REPLACE FUNCTION public.fn_handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_handle_new_auth_user() IS
  'AFTER INSERT trigger function on auth.users. Inserts a matching public.profiles row. SECURITY DEFINER because the caller (Supabase Auth) does not have INSERT on public.profiles under RLS. Creates no objects inside the auth schema.';

CREATE TRIGGER trg_auth_users_after_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_auth_user();

-- 7. COMMENTS ----------------------------------------------------------------
COMMENT ON TABLE public.profiles IS
  'Public profile row per authenticated user. 1:1 with auth.users. Auto-created by trg_auth_users_after_insert on signup. Owner can select and update their own row via RLS.';

COMMENT ON COLUMN public.profiles.id           IS 'FK to auth.users(id). Cascade-deleted when the auth user is deleted.';
COMMENT ON COLUMN public.profiles.display_name IS 'Human-facing display name. Populated by the application, not the auto-create trigger.';
COMMENT ON COLUMN public.profiles.avatar_url   IS 'URL to the user avatar image.';

-- ROLLBACK ---------------------------------------------------------------------
-- DROP TRIGGER  IF EXISTS trg_auth_users_after_insert ON auth.users;
-- DROP FUNCTION IF EXISTS public.fn_handle_new_auth_user();
-- DROP TRIGGER  IF EXISTS trg_profiles_updated_at ON public.profiles;
-- DROP TABLE    IF EXISTS public.profiles;
-- ----------------------------------------------------------------------------