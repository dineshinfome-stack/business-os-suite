
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  recipient_user_id uuid NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  message text,
  severity text NOT NULL CHECK (severity IN ('info','success','warning','error')),
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','archived')),
  action_url text,
  action_label text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  archived_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_recipient_status_created_idx
  ON public.notifications (organization_id, recipient_user_id, status, created_at DESC);
CREATE INDEX notifications_recipient_status_idx
  ON public.notifications (recipient_user_id, status);
CREATE INDEX notifications_org_type_idx
  ON public.notifications (organization_id, type);

GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT TO authenticated
  USING (
    recipient_user_id = auth.uid()
    AND private.fn_is_org_member(auth.uid(), organization_id)
  );

CREATE POLICY notifications_insert_org_member ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    private.fn_is_org_member(auth.uid(), organization_id)
    AND created_by = auth.uid()
  );

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE TO authenticated
  USING (recipient_user_id = auth.uid())
  WITH CHECK (recipient_user_id = auth.uid());

CREATE TRIGGER notifications_set_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  channel text NOT NULL CHECK (channel IN ('in_app','email','sms','push')),
  category text,
  enabled boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX notification_preferences_unique_scope
  ON public.notification_preferences (organization_id, user_id, channel, COALESCE(category, ''));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_prefs_select_own ON public.notification_preferences
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    AND private.fn_is_org_member(auth.uid(), organization_id)
  );

CREATE POLICY notification_prefs_insert_own ON public.notification_preferences
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND private.fn_is_org_member(auth.uid(), organization_id)
  );

CREATE POLICY notification_prefs_update_own ON public.notification_preferences
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notification_prefs_delete_own ON public.notification_preferences
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER notification_preferences_set_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

INSERT INTO public.permissions (key, module, resource, action, name, description, system_permission)
VALUES
  ('notifications.inbox.read',   'notifications', 'inbox', 'read',   'Read own notifications', 'Read notifications addressed to the current user', true),
  ('notifications.inbox.create', 'notifications', 'inbox', 'create', 'Create notifications',   'Create notifications for platform events', true),
  ('notifications.inbox.manage', 'notifications', 'inbox', 'manage', 'Manage notifications',   'Administer notifications across the organization', true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE p.key = 'notifications.inbox.read'
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.key IN ('notifications.inbox.create','notifications.inbox.manage')
WHERE r.key IN ('platform_owner','platform_admin','org_owner','administrator')
ON CONFLICT DO NOTHING;
