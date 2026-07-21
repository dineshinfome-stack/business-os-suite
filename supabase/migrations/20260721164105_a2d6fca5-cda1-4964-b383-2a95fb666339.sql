-- =============================================================================
-- Migration:     004_roles
-- Sprint:        0.2
-- Purpose:       app_role enum, user_roles table, fn_has_role security-definer helper.
-- Dependencies:  001, 002, 003
-- Rollback:      See ROLLBACK block at bottom (review-only; not auto-executed).
-- Author:        platform
-- Date:          2026-07-21
-- =============================================================================

-- 1. ENUM --------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

COMMENT ON TYPE public.app_role IS
  'Platform-level user roles. Deliberately minimal for Wave 0. Business/module-specific roles are added in later sprints. May migrate to a data-driven roles table if dynamic roles are required (see DATABASE_STANDARD § Forward notes).';

-- 2. TABLE -------------------------------------------------------------------
CREATE TABLE public.user_roles (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         public.app_role NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid                 REFERENCES auth.users(id),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid                 REFERENCES auth.users(id),
  deleted_at   timestamptz,
  deleted_by   uuid                 REFERENCES auth.users(id),
  CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

-- 3. GRANT -------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- 4. RLS ---------------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. SECURITY DEFINER HELPER -------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role    = _role
      AND deleted_at IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.fn_has_role(uuid, public.app_role) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.fn_has_role(uuid, public.app_role) TO authenticated, service_role;

COMMENT ON FUNCTION public.fn_has_role(uuid, public.app_role) IS
  'Returns TRUE when the given user holds the given role. STABLE SECURITY DEFINER with search_path = public — safe to call from RLS policies without recursive checks. Callable by authenticated and service_role only.';

-- 6. POLICIES ----------------------------------------------------------------
CREATE POLICY user_roles_owner_select
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY user_roles_admin_select
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.fn_has_role(auth.uid(), 'admin'));

CREATE POLICY user_roles_admin_insert
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.fn_has_role(auth.uid(), 'admin'));

CREATE POLICY user_roles_admin_update
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.fn_has_role(auth.uid(), 'admin'))
  WITH CHECK (public.fn_has_role(auth.uid(), 'admin'));

CREATE POLICY user_roles_admin_delete
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.fn_has_role(auth.uid(), 'admin'));

-- 7. INDEXES -----------------------------------------------------------------
CREATE INDEX idx_user_roles_user_id ON public.user_roles (user_id);
-- (user_id, role) unique constraint already provides its own index.

-- 8. TRIGGERS ----------------------------------------------------------------
CREATE TRIGGER trg_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 9. COMMENTS ----------------------------------------------------------------
COMMENT ON TABLE public.user_roles IS
  'Assignment of platform roles to users. Roles are NEVER stored on profiles. Tenant scoping (org_id) will be added in a later RBAC sprint.';

COMMENT ON COLUMN public.user_roles.user_id IS 'FK to auth.users(id). Cascade-deleted with the user.';
COMMENT ON COLUMN public.user_roles.role    IS 'One of public.app_role. Combined with user_id to form a unique assignment.';

-- ROLLBACK ---------------------------------------------------------------------
-- DROP TRIGGER  IF EXISTS trg_user_roles_updated_at ON public.user_roles;
-- DROP POLICY   IF EXISTS user_roles_admin_delete   ON public.user_roles;
-- DROP POLICY   IF EXISTS user_roles_admin_update   ON public.user_roles;
-- DROP POLICY   IF EXISTS user_roles_admin_insert   ON public.user_roles;
-- DROP POLICY   IF EXISTS user_roles_admin_select   ON public.user_roles;
-- DROP POLICY   IF EXISTS user_roles_owner_select   ON public.user_roles;
-- DROP FUNCTION IF EXISTS public.fn_has_role(uuid, public.app_role);
-- DROP TABLE    IF EXISTS public.user_roles;
-- DROP TYPE     IF EXISTS public.app_role;
-- ----------------------------------------------------------------------------