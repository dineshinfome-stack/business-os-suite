/**
 * Sprint 0.5 — RBAC Foundation
 * Authorization server functions.
 *
 * RULE (Rec 1, RBAC_STANDARD §"User-context-only rule"):
 * These functions run under the caller's JWT via `requireSupabaseAuth`.
 * They MUST NOT import `supabaseAdmin` / `client.server`. Role-assignment
 * mutations that require elevated privileges live in a separate module.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getOrgContext } from "@/lib/organizations.functions";
import type { PermissionKey } from "@/lib/generated/permission-keys";

async function resolveOrgId(explicit?: string | null): Promise<string | null> {
  if (explicit) return explicit;
  try {
    const ctx = await getOrgContext();
    return ctx.organizationId;
  } catch {
    return null;
  }
}

/** List every effective permission key for the caller in the given (or current) org. */
export const listEffectivePermissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ organizationId: z.string().uuid().nullable().optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }): Promise<PermissionKey[]> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const { data: rows, error } = await context.supabase.rpc("fn_user_permissions" as never, {
      _user_id: context.userId,
      _org_id: orgId,
    } as never);
    if (error) {
      // The RPC lives in the `private` schema, not exposed through PostgREST.
      // Fallback: derive by joining catalog tables directly under RLS.
      const { data: joined, error: jErr } = await context.supabase
        .from("user_roles")
        .select("role:roles!inner(id,scope,role_permissions:role_permissions!inner(permission:permissions!inner(key))), organization_id, deleted_at, expires_at")
        .eq("user_id", context.userId)
        .is("deleted_at", null);
      if (jErr) throw jErr;
      const now = Date.now();
      const set = new Set<string>();
      for (const r of joined ?? []) {
        const role = r.role as unknown as {
          scope: "platform" | "organization";
          role_permissions: Array<{ permission: { key: string } }>;
        };
        if (!role) continue;
        const orgMatches =
          (role.scope === "platform" && r.organization_id === null) ||
          (role.scope === "organization" && orgId !== null && r.organization_id === orgId);
        if (!orgMatches) continue;
        if (r.expires_at && new Date(r.expires_at).getTime() < now) continue;
        for (const rp of role.role_permissions ?? []) {
          if (rp.permission?.key) set.add(rp.permission.key);
        }
      }
      return Array.from(set) as PermissionKey[];
    }
    return ((rows as unknown as string[]) ?? []) as PermissionKey[];
  });

/** Check a single permission for the caller. */
export const hasPermission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        key: z.string().min(1),
        organizationId: z.string().uuid().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<{ allowed: boolean }> => {
    const orgId = await resolveOrgId(data.organizationId ?? null);
    const perms = await listEffectivePermissions({ data: { organizationId: orgId } });
    // Re-check under caller context (avoid re-RPC by reusing list):
    void context;
    return { allowed: perms.includes(data.key as PermissionKey) };
  });
