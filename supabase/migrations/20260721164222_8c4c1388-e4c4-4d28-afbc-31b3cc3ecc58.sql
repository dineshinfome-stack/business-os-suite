-- =============================================================================
-- Migration:     005_audit_logs
-- Sprint:        0.2
-- Purpose:       Platform audit_logs table with old_values/new_values snapshots.
-- Dependencies:  001..004
-- Rollback:      See ROLLBACK block at bottom (review-only; not auto-executed).
-- Author:        platform
-- Date:          2026-07-21
-- =============================================================================

-- 1. CREATE TABLE ------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     uuid                 REFERENCES auth.users(id),
  action       text        NOT NULL,
  entity_type  text        NOT NULL,
  entity_id    uuid,
  old_values   jsonb,
  new_values   jsonb,
  occurred_at  timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  created_by   uuid                 REFERENCES auth.users(id),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  updated_by   uuid                 REFERENCES auth.users(id),
  deleted_at   timestamptz,
  deleted_by   uuid                 REFERENCES auth.users(id)
);

-- 2. GRANT -------------------------------------------------------------------
-- No INSERT/UPDATE/DELETE to authenticated: audit_logs is append-only by service_role.
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL    ON public.audit_logs TO service_role;

-- 3. RLS ---------------------------------------------------------------------
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES ----------------------------------------------------------------
CREATE POLICY audit_logs_admin_select
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.fn_has_role(auth.uid(), 'admin'));

-- 5. INDEXES -----------------------------------------------------------------
CREATE INDEX idx_audit_logs_entity       ON public.audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_occurred_at  ON public.audit_logs (occurred_at DESC);
CREATE INDEX idx_audit_logs_actor_id     ON public.audit_logs (actor_id);

-- 6. TRIGGERS ----------------------------------------------------------------
CREATE TRIGGER trg_audit_logs_updated_at
  BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- 7. COMMENTS ----------------------------------------------------------------
COMMENT ON TABLE public.audit_logs IS
  $c$Platform-wide audit trail. APPEND-ONLY: no INSERT/UPDATE/DELETE policy for authenticated; only service_role may write via GRANT. deleted_at/deleted_by columns exist for schema consistency but MUST NOT be used during normal operation — purging is governed by the future retention/archival strategy (TODO: retention strategy, see DATABASE_STANDARD § Forward notes). Timestamp semantics: occurred_at = when the audited event happened; created_at = when the audit row itself was inserted (may coincide but are semantically distinct).$c$;

COMMENT ON COLUMN public.audit_logs.actor_id    IS 'User who performed the action. NULL for system-generated events.';
COMMENT ON COLUMN public.audit_logs.action      IS 'Domain verb (e.g. "user.role_granted", "invoice.posted").';
COMMENT ON COLUMN public.audit_logs.entity_type IS 'Fully-qualified target entity kind (e.g. "public.user_roles").';
COMMENT ON COLUMN public.audit_logs.entity_id   IS 'Target row primary key. NULL when the event does not target a specific row.';
COMMENT ON COLUMN public.audit_logs.old_values  IS 'JSON snapshot of the entity BEFORE the action. NULL on insert events.';
COMMENT ON COLUMN public.audit_logs.new_values  IS 'JSON snapshot of the entity AFTER the action. NULL on delete events.';
COMMENT ON COLUMN public.audit_logs.occurred_at IS 'When the audited real-world event happened. Use for event chronology, NOT created_at.';

-- ROLLBACK ---------------------------------------------------------------------
-- DROP TRIGGER IF EXISTS trg_audit_logs_updated_at ON public.audit_logs;
-- DROP INDEX   IF EXISTS public.idx_audit_logs_actor_id;
-- DROP INDEX   IF EXISTS public.idx_audit_logs_occurred_at;
-- DROP INDEX   IF EXISTS public.idx_audit_logs_entity;
-- DROP POLICY  IF EXISTS audit_logs_admin_select ON public.audit_logs;
-- DROP TABLE   IF EXISTS public.audit_logs;
-- ----------------------------------------------------------------------------