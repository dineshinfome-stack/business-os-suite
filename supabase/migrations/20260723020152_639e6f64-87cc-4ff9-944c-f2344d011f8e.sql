-- =============================================================================
-- Migration:     009_settings_foundation
-- Sprint:        0.6 — Settings Foundation
-- =============================================================================

-- 1. Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'setting_data_type') THEN
    CREATE TYPE public.setting_data_type
      AS ENUM ('string','integer','decimal','boolean','enum','json');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'setting_scope') THEN
    CREATE TYPE public.setting_scope AS ENUM ('platform','organization');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feature_flag_stage') THEN
    CREATE TYPE public.feature_flag_stage AS ENUM ('off','internal','beta','ga');
  END IF;
END $$;

-- 2. setting_definitions
CREATE TABLE IF NOT EXISTS public.setting_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE
    CHECK (key ~ '^[a-z0-9]+(\.[a-z0-9_]+)+$'),
  category text NOT NULL,
  scope public.setting_scope NOT NULL,
  data_type public.setting_data_type NOT NULL,
  default_value jsonb,
  validation_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  is_sensitive boolean NOT NULL DEFAULT false,
  deprecated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.setting_definitions TO authenticated;
GRANT ALL    ON public.setting_definitions TO service_role;

ALTER TABLE public.setting_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS setting_definitions_select_all ON public.setting_definitions;
CREATE POLICY setting_definitions_select_all ON public.setting_definitions
  FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION private.fn_block_setting_definition_identity_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public
AS $$
BEGIN
  IF NEW.key IS DISTINCT FROM OLD.key
     OR NEW.scope IS DISTINCT FROM OLD.scope
     OR NEW.data_type IS DISTINCT FROM OLD.data_type
     OR NEW.is_system IS DISTINCT FROM OLD.is_system THEN
    RAISE EXCEPTION 'setting_definitions identity fields are immutable (key, scope, data_type, is_system)'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION private.fn_block_setting_definition_identity_change() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_setting_definitions_identity ON public.setting_definitions;
CREATE TRIGGER trg_setting_definitions_identity
  BEFORE UPDATE ON public.setting_definitions
  FOR EACH ROW EXECUTE FUNCTION private.fn_block_setting_definition_identity_change();

DROP TRIGGER IF EXISTS trg_setting_definitions_updated_at ON public.setting_definitions;
CREATE TRIGGER trg_setting_definitions_updated_at
  BEFORE UPDATE ON public.setting_definitions
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 3. Helper: configurable check
CREATE OR REPLACE FUNCTION private.fn_setting_is_configurable(_definition_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public
AS $$
  SELECT NOT COALESCE(is_system, false)
  FROM public.setting_definitions
  WHERE id = _definition_id;
$$;

REVOKE ALL ON FUNCTION private.fn_setting_is_configurable(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.fn_setting_is_configurable(uuid) TO authenticated;

-- 4. setting_values
CREATE TABLE IF NOT EXISTS public.setting_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id uuid NOT NULL REFERENCES public.setting_definitions(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS setting_values_definition_org_uidx
  ON public.setting_values (
    definition_id,
    COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );
CREATE INDEX IF NOT EXISTS setting_values_org_idx
  ON public.setting_values (organization_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.setting_values TO authenticated;
GRANT ALL ON public.setting_values TO service_role;

ALTER TABLE public.setting_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS setting_values_select ON public.setting_values;
CREATE POLICY setting_values_select ON public.setting_values
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL
    OR private.fn_is_org_member(auth.uid(), organization_id)
  );

DROP POLICY IF EXISTS setting_values_insert ON public.setting_values;
CREATE POLICY setting_values_insert ON public.setting_values
  FOR INSERT TO authenticated
  WITH CHECK (
    private.fn_setting_is_configurable(definition_id)
    AND (
      (organization_id IS NULL
        AND private.fn_user_has_permission(auth.uid(), NULL, 'platform.settings.manage'))
      OR (organization_id IS NOT NULL
        AND private.fn_is_org_member(auth.uid(), organization_id)
        AND private.fn_user_has_any(auth.uid(), organization_id,
              ARRAY['settings.general.update','settings.security.manage','platform.settings.manage']))
    )
  );

DROP POLICY IF EXISTS setting_values_update ON public.setting_values;
CREATE POLICY setting_values_update ON public.setting_values
  FOR UPDATE TO authenticated
  USING (
    private.fn_setting_is_configurable(definition_id)
    AND (
      (organization_id IS NULL
        AND private.fn_user_has_permission(auth.uid(), NULL, 'platform.settings.manage'))
      OR (organization_id IS NOT NULL
        AND private.fn_is_org_member(auth.uid(), organization_id)
        AND private.fn_user_has_any(auth.uid(), organization_id,
              ARRAY['settings.general.update','settings.security.manage','platform.settings.manage']))
    )
  )
  WITH CHECK (
    private.fn_setting_is_configurable(definition_id)
    AND (
      (organization_id IS NULL
        AND private.fn_user_has_permission(auth.uid(), NULL, 'platform.settings.manage'))
      OR (organization_id IS NOT NULL
        AND private.fn_is_org_member(auth.uid(), organization_id)
        AND private.fn_user_has_any(auth.uid(), organization_id,
              ARRAY['settings.general.update','settings.security.manage','platform.settings.manage']))
    )
  );

DROP POLICY IF EXISTS setting_values_delete ON public.setting_values;
CREATE POLICY setting_values_delete ON public.setting_values
  FOR DELETE TO authenticated
  USING (
    private.fn_setting_is_configurable(definition_id)
    AND (
      (organization_id IS NULL
        AND private.fn_user_has_permission(auth.uid(), NULL, 'platform.settings.manage'))
      OR (organization_id IS NOT NULL
        AND private.fn_is_org_member(auth.uid(), organization_id)
        AND private.fn_user_has_any(auth.uid(), organization_id,
              ARRAY['settings.general.update','settings.security.manage','platform.settings.manage']))
    )
  );

DROP TRIGGER IF EXISTS trg_setting_values_updated_at ON public.setting_values;
CREATE TRIGGER trg_setting_values_updated_at
  BEFORE UPDATE ON public.setting_values
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 5. feature_flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL
    CHECK (key ~ '^[a-z0-9]+(\.[a-z0-9_]+)+$'),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  rollout_stage public.feature_flag_stage NOT NULL DEFAULT 'off',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS feature_flags_key_org_uidx
  ON public.feature_flags (
    key,
    COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );
CREATE INDEX IF NOT EXISTS feature_flags_org_idx
  ON public.feature_flags (organization_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS feature_flags_select ON public.feature_flags;
CREATE POLICY feature_flags_select ON public.feature_flags
  FOR SELECT TO authenticated
  USING (
    organization_id IS NULL
    OR private.fn_is_org_member(auth.uid(), organization_id)
  );

DROP POLICY IF EXISTS feature_flags_write ON public.feature_flags;
CREATE POLICY feature_flags_write ON public.feature_flags
  FOR ALL TO authenticated
  USING (
    (organization_id IS NULL
      AND private.fn_user_has_permission(auth.uid(), NULL, 'platform.settings.manage'))
    OR (organization_id IS NOT NULL
      AND private.fn_is_org_member(auth.uid(), organization_id)
      AND private.fn_user_has_any(auth.uid(), organization_id,
            ARRAY['settings.general.update','platform.settings.manage']))
  )
  WITH CHECK (
    (organization_id IS NULL
      AND private.fn_user_has_permission(auth.uid(), NULL, 'platform.settings.manage'))
    OR (organization_id IS NOT NULL
      AND private.fn_is_org_member(auth.uid(), organization_id)
      AND private.fn_user_has_any(auth.uid(), organization_id,
            ARRAY['settings.general.update','platform.settings.manage']))
  );

DROP TRIGGER IF EXISTS trg_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER trg_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 6. Seed: new permissions (reuse existing settings.general.view/update)
INSERT INTO public.permissions (key, module, resource, action, name, description, system_permission)
VALUES
  ('settings.security.manage', 'settings', 'security', 'manage', 'Manage sensitive settings', 'Reveal or rotate sensitive setting values',             true),
  ('platform.settings.manage', 'platform', 'settings', 'manage', 'Manage platform settings',  'Mutate platform-scope settings or cross-tenant values', true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.key = 'platform_owner'
  AND p.key IN ('settings.general.view','settings.general.update','settings.security.manage','platform.settings.manage')
ON CONFLICT DO NOTHING;

-- 7. Seed: setting_definitions
INSERT INTO public.setting_definitions
  (key, category, scope, data_type, default_value, validation_schema, description, is_system, is_sensitive)
VALUES
  ('platform.framework.schema_version',          'framework', 'platform',     'string',  '"1.0.0"'::jsonb, '{}'::jsonb,
    'Internal platform schema version. Read-only through the settings API.', true, false),
  ('platform.framework.audit_redaction_enabled', 'framework', 'platform',     'boolean', 'true'::jsonb, '{}'::jsonb,
    'Whether sensitive setting values are redacted from the audit log.', true, false),

  ('platform.branding.product_name',  'branding', 'organization', 'string', '"Business OS"'::jsonb,
    '{"required":true,"min":1,"max":80}'::jsonb, 'Product name shown in the header.', false, false),
  ('platform.branding.logo_url',      'branding', 'organization', 'string', '""'::jsonb,
    '{"max":2048}'::jsonb, 'Absolute URL of the product logo.', false, false),
  ('platform.branding.support_email', 'branding', 'organization', 'string', '""'::jsonb,
    '{"regex":"^$|^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$","max":255}'::jsonb, 'Support email address.', false, false),

  ('platform.locale.default_language', 'locale', 'organization', 'enum', '"en"'::jsonb,
    '{"enum":["en","es","fr","de","pt"]}'::jsonb, 'Default UI language for the organization.', false, false),
  ('platform.locale.default_timezone', 'locale', 'organization', 'string', '"UTC"'::jsonb,
    '{"required":true,"max":64}'::jsonb, 'IANA timezone identifier.', false, false),

  ('platform.security.session_timeout_minutes', 'security', 'organization', 'integer', '60'::jsonb,
    '{"min":5,"max":1440}'::jsonb, 'Session timeout in minutes.', false, false),
  ('platform.security.smtp_password',           'security', 'organization', 'string',  '""'::jsonb,
    '{"max":512}'::jsonb, 'SMTP password (sensitive).', false, true),

  ('platform.ai.provider_token', 'ai', 'organization', 'string', '""'::jsonb,
    '{"max":512}'::jsonb, 'AI provider API token (sensitive).', false, true)
ON CONFLICT (key) DO NOTHING;

-- 8. Seed: feature_flags
INSERT INTO public.feature_flags (key, organization_id, enabled, description, rollout_stage)
VALUES
  ('platform.ui.command_palette_enabled', NULL, false, 'Global command palette (⌘K).', 'off')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.setting_definitions IS
  'Sprint 0.6 — canonical registry. is_system=true rows are framework-owned and cannot be edited via setSetting.';
COMMENT ON TABLE public.setting_values IS
  'Sprint 0.6 — configured overrides. Precedence: default -> platform (org_id NULL) -> organization.';
COMMENT ON TABLE public.feature_flags IS
  'Sprint 0.6 — feature flag registry. Consumed by useFeatureFlag().';