import { createMiddleware } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "./auth-middleware";
import { CURRENT_ORG_COOKIE } from "@/lib/organizations.functions";

/**
 * Middleware that requires an authenticated caller AND an active organization
 * membership. Resolves `context.organizationId` + `context.orgRole` from the
 * `current_org_id` cookie, falling back to the caller's first active membership.
 *
 * Throws when the caller has no active memberships or when the cookie points to
 * an organization the caller no longer belongs to.
 */
export const requireOrgContext = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const cookieOrgId = getCookie(CURRENT_ORG_COOKIE) ?? null;

    const { data: memberships, error } = await context.supabase
      .from("organization_members")
      .select("organization_id, role, joined_at")
      .eq("user_id", context.userId)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("joined_at", { ascending: true, nullsFirst: false });
    if (error) throw error;

    const active = memberships ?? [];
    if (active.length === 0) {
      throw new Error("Forbidden: caller has no active organization memberships");
    }

    const chosen = active.find((m) => m.organization_id === cookieOrgId) ?? active[0];

    return next({
      context: {
        organizationId: chosen.organization_id as string,
        orgRole: chosen.role as "owner" | "admin" | "member",
      },
    });
  });
