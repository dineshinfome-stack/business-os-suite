-- =============================================================================
-- Migration:     001_extensions
-- Sprint:        0.2
-- Purpose:       Enable pgcrypto for gen_random_uuid() as the repository UUID default.
-- Dependencies:  none
-- Rollback:      See ROLLBACK block at bottom (review-only; not auto-executed).
-- Author:        platform
-- Date:          2026-07-21
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- ROLLBACK ---------------------------------------------------------------------
-- DROP EXTENSION IF EXISTS pgcrypto;
-- ----------------------------------------------------------------------------