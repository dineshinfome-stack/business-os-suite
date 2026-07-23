
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL CHECK (char_length(query) BETWEEN 1 AND 500),
  resource_type TEXT NULL,
  selected_result_id TEXT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX search_history_user_org_time_idx
  ON public.search_history (user_id, organization_id, searched_at DESC);
GRANT SELECT, INSERT, DELETE ON public.search_history TO authenticated;
GRANT ALL ON public.search_history TO service_role;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY search_history_select_own ON public.search_history FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY search_history_insert_own ON public.search_history FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY search_history_delete_own ON public.search_history FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND private.fn_is_org_member(auth.uid(), organization_id));

CREATE OR REPLACE FUNCTION private.fn_prune_search_history()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  DELETE FROM public.search_history sh
  WHERE sh.user_id = NEW.user_id
    AND sh.organization_id = NEW.organization_id
    AND sh.id NOT IN (
      SELECT id FROM public.search_history
      WHERE user_id = NEW.user_id AND organization_id = NEW.organization_id
      ORDER BY searched_at DESC LIMIT 20
    );
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION private.fn_prune_search_history() FROM PUBLIC;
CREATE TRIGGER search_history_prune_after_insert
  AFTER INSERT ON public.search_history
  FOR EACH ROW EXECUTE FUNCTION private.fn_prune_search_history();

CREATE TABLE public.search_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enable_recent_searches BOOLEAN NOT NULL DEFAULT true,
  enable_suggestions BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.search_preferences TO authenticated;
GRANT ALL ON public.search_preferences TO service_role;
ALTER TABLE public.search_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY search_preferences_select_own ON public.search_preferences FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY search_preferences_insert_own ON public.search_preferences FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY search_preferences_update_own ON public.search_preferences FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND private.fn_is_org_member(auth.uid(), organization_id))
  WITH CHECK (user_id = auth.uid() AND private.fn_is_org_member(auth.uid(), organization_id));
CREATE POLICY search_preferences_delete_own ON public.search_preferences FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND private.fn_is_org_member(auth.uid(), organization_id));
CREATE TRIGGER search_preferences_set_updated_at
  BEFORE UPDATE ON public.search_preferences
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

ALTER TABLE public.nav_user_preferences
  ADD COLUMN IF NOT EXISTS command_palette_tab TEXT NOT NULL DEFAULT 'commands'
    CHECK (command_palette_tab IN ('commands', 'search'));

INSERT INTO public.permissions (key, module, resource, action, name, description) VALUES
  ('search.global.use', 'search', 'global', 'use', 'Use global search',
   'Invoke the global search & command palette search tab'),
  ('search.history.manage', 'search', 'history', 'manage', 'Manage own search history',
   'Clear the caller''s personal search history')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r CROSS JOIN public.permissions p
WHERE p.key IN ('search.global.use', 'search.history.manage')
  AND r.key IN ('platform_owner','platform_admin','org_owner','administrator','manager','supervisor','employee','read_only')
ON CONFLICT DO NOTHING;
