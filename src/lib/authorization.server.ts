/**
 * Sprint 0.5 — RBAC Foundation
 * Server-side authorization middleware factories.
 *
 * RULE (Rec 1): NO import of `supabaseAdmin` / `client.server` in this file.
 * All checks run under the caller's JWT.
 */
import { createMiddleware } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { listEffectivePermissions } from "@/lib/authorization.functions";
import { logAuthEventFn } from "@/lib/auth.functions";
import type { PermissionKey } from "@/lib/generated/permission-keys";

async function fetchPerms(): Promise<Set<string>> {
  const perms = await listEffectivePermissions({ data: {} });
  return new Set(perms as unknown as string[]);
}

function forbid(missing: string[]): never {
  // Fire-and-forget audit event
  void logAuthEventFn({
    data: { event: "permission_denied", metadata: { missing } },
  }).catch(() => undefined);
  throw new Response("Forbidden", { status: 403 });
}

/** Require a single permission. */
export function requirePermission(key: PermissionKey) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next }) => {
      const perms = await fetchPerms();
      if (!perms.has(key)) forbid([key]);
      return next({ context: { permissions: perms } });
    });
}

/** Require any of the given permissions. */
export function requireAnyPermission(keys: PermissionKey[]) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next }) => {
      const perms = await fetchPerms();
      if (!keys.some((k) => perms.has(k))) forbid(keys);
      return next({ context: { permissions: perms } });
    });
}

/** Require all of the given permissions. */
export function requireAllPermissions(keys: PermissionKey[]) {
  return createMiddleware({ type: "function" })
    .middleware([requireSupabaseAuth])
    .server(async ({ next }) => {
      const perms = await fetchPerms();
      const missing = keys.filter((k) => !perms.has(k));
      if (missing.length) forbid(missing);
      return next({ context: { permissions: perms } });
    });
}
