-- Sprint 0.7 — Navigation Framework
CREATE TABLE public.nav_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  nav_id text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id, nav_id)
);
CREATE INDEX idx_nav_favorites_user_org ON public.nav_favorites (user_id, organization_id, display_order);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_favorites TO authenticated;
GRANT ALL ON public.nav_favorites TO service_role;
ALTER TABLE public.nav_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites read" ON public.nav_favorites FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own favorites insert" ON public.nav_favorites FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own favorites update" ON public.nav_favorites FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own favorites delete" ON public.nav_favorites FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.nav_recent_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  route text NOT NULL,
  title text,
  visited_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id, route)
);
CREATE INDEX idx_nav_recent_pages_user_org_visited ON public.nav_recent_pages (user_id, organization_id, visited_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_recent_pages TO authenticated;
GRANT ALL ON public.nav_recent_pages TO service_role;
ALTER TABLE public.nav_recent_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recent read" ON public.nav_recent_pages FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own recent insert" ON public.nav_recent_pages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own recent update" ON public.nav_recent_pages FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own recent delete" ON public.nav_recent_pages FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.nav_user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_user_preferences TO authenticated;
GRANT ALL ON public.nav_user_preferences TO service_role;
ALTER TABLE public.nav_user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs read" ON public.nav_user_preferences FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own prefs insert" ON public.nav_user_preferences FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own prefs update" ON public.nav_user_preferences FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own prefs delete" ON public.nav_user_preferences FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.nav_command_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  nav_id text NOT NULL,
  invoked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id, nav_id)
);
CREATE INDEX idx_nav_command_history_user_org_invoked ON public.nav_command_history (user_id, organization_id, invoked_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_command_history TO authenticated;
GRANT ALL ON public.nav_command_history TO service_role;
ALTER TABLE public.nav_command_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cmd read" ON public.nav_command_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own cmd insert" ON public.nav_command_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own cmd update" ON public.nav_command_history FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own cmd delete" ON public.nav_command_history FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER trg_nav_favorites_touch BEFORE UPDATE ON public.nav_favorites
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
CREATE TRIGGER trg_nav_user_preferences_touch BEFORE UPDATE ON public.nav_user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();