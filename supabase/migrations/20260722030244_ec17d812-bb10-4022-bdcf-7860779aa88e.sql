-- Move SECURITY DEFINER functions out of the exposed public schema.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

-- Drop policies that depend on public.fn_has_role so we can drop the function.
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
DROP POLICY IF EXISTS "audit_logs_admin_select_all" ON public.audit_logs;

-- Drop trigger + function that auto-creates a profile on new auth user.
DROP TRIGGER IF EXISTS trg_auth_users_new_user ON auth.users;
DROP FUNCTION IF EXISTS public.fn_handle_new_auth_user();
DROP FUNCTION IF EXISTS public.fn_has_role(uuid, public.app_role);

-- Recreate fn_has_role in the private schema.
CREATE OR REPLACE FUNCTION private.fn_has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND deleted_at IS NULL
  );
$$;
REVOKE ALL ON FUNCTION private.fn_has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- Recreate fn_handle_new_auth_user in the private schema and re-attach the auth trigger.
CREATE OR REPLACE FUNCTION private.fn_handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, created_by, updated_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.id,
    NEW.id
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.fn_handle_new_auth_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_auth_users_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.fn_handle_new_auth_user();

-- Recreate policies referencing the private-schema function.
CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.fn_has_role(auth.uid(), 'admin'))
  WITH CHECK (private.fn_has_role(auth.uid(), 'admin'));

CREATE POLICY "audit_logs_admin_select_all" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (private.fn_has_role(auth.uid(), 'admin'));