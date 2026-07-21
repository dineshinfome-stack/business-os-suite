import type { Session } from "@supabase/supabase-js";

/**
 * Compute a stable, PII-free fingerprint over the identity claims we care
 * about for change detection. Used to decide whether TOKEN_REFRESHED (or any
 * other event that surfaces a session) should trigger a profile/roles reload.
 *
 * IMPORTANT — fingerprint source authority:
 *   The `app_metadata.role[s]` portion is a CHANGE-DETECTION HINT ONLY. It
 *   MUST NOT be consulted by any authorization decision. Authoritative roles
 *   come from the `user_roles` table (Sprint 0.3) and, going forward, from
 *   the centralized authorization endpoint introduced in Sprint 0.5.
 *
 * Extensibility:
 *   Future platform versions MAY APPEND new pipe-separated parts (e.g. tenant
 *   id in Sprint 0.4). Never remove or reorder existing parts — that would
 *   silently invalidate every cached fingerprint. Comparison semantics are
 *   strict equality regardless of length.
 */
export function fingerprintClaims(session: Session | null | undefined): string {
  const u = session?.user;
  if (!u) return "";
  const meta = (u.app_metadata ?? {}) as Record<string, unknown>;
  const roleHint = meta.role ?? meta.roles ?? null;
  return [u.id ?? "", u.updated_at ?? "", JSON.stringify(roleHint)].join("|");
}
