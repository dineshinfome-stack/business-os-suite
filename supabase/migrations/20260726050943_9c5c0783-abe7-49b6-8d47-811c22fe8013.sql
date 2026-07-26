-- Public API wrappers for the private company lifecycle functions.
-- PostgREST can only reach the public schema; the logic stays in `private`.

CREATE OR REPLACE FUNCTION public.fn_create_company(
  _tenant_id uuid,
  _slug text,
  _display_name text,
  _region text,
  _default_locale text,
  _timezone text,
  _legal_name text DEFAULT NULL
) RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = private, public
AS $$
  SELECT private.fn_create_company(_tenant_id, _slug, _display_name, _region, _default_locale, _timezone, _legal_name);
$$;

CREATE OR REPLACE FUNCTION public.fn_activate_company(_id uuid) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = private, public
AS $$ SELECT private.fn_activate_company(_id); $$;

CREATE OR REPLACE FUNCTION public.fn_deactivate_company(_id uuid) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = private, public
AS $$ SELECT private.fn_deactivate_company(_id); $$;

CREATE OR REPLACE FUNCTION public.fn_archive_company(_id uuid) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = private, public
AS $$ SELECT private.fn_archive_company(_id); $$;

CREATE OR REPLACE FUNCTION public.fn_set_default_company(_id uuid) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = private, public
AS $$ SELECT private.fn_set_default_company(_id); $$;

REVOKE ALL ON FUNCTION public.fn_create_company(uuid, text, text, text, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_activate_company(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_deactivate_company(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_archive_company(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_set_default_company(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.fn_create_company(uuid, text, text, text, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_activate_company(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_deactivate_company(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_archive_company(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_set_default_company(uuid) TO authenticated, service_role;