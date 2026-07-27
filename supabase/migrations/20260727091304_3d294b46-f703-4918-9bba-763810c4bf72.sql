ALTER FUNCTION private.fn_normalize_slug(text) SET search_path TO 'public', 'extensions';
ALTER FUNCTION private.fn_create_company(uuid, text, text, text, text, text, text) SET search_path TO 'public', 'extensions';
ALTER FUNCTION public.fn_create_company(uuid, text, text, text, text, text, text) SET search_path TO 'private', 'public', 'extensions';