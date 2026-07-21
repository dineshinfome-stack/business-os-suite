-- =============================================================================
-- Migration:     002_shared_helpers
-- Sprint:        0.2
-- Purpose:       Shared trigger function that maintains updated_at on every table.
-- Dependencies:  001_extensions
-- Rollback:      See ROLLBACK block at bottom (review-only; not auto-executed).
-- Author:        platform
-- Date:          2026-07-21
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_set_updated_at() IS
  'Trigger function. Sets NEW.updated_at = now() before UPDATE. Attach as trg_<table>_updated_at on every table that carries the standard updated_at column.';

-- ROLLBACK ---------------------------------------------------------------------
-- DROP FUNCTION IF EXISTS public.fn_set_updated_at();
-- ----------------------------------------------------------------------------