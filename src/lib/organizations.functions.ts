import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const CURRENT_ORG_COOKIE = "current_org_id";

export interface OrgMembershipRow {
  organizationId: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "member";
  status: "active" | "invited" | "suspended";
}

/** List all organizations the caller belongs to (RLS-scoped). */
export const listMyOrganizations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OrgMembershipRow[]> => {
    const { data, error } = await context.supabase
      .from("organization_members")
      .select("role, status, organization:organizations(id, name, slug)")
      .eq("user_id", context.userId)
      .is("deleted_at", null);
    if (error) throw error;
    return (data ?? [])
      .filter((r) => r.organization)
      .map((r) => {
        const org = r.organization as unknown as { id: string; name: string; slug: string };
        return {
          organizationId: org.id,
          name: org.name,
          slug: org.slug,
          role: r.role as OrgMembershipRow["role"],
          status: r.status as OrgMembershipRow["status"],
        };
      });
  });

/**
 * Resolve the caller's current organization context.
 *
 * Precedence:
 *   1. `current_org_id` cookie (if the caller is still an active member).
 *   2. First active membership (deterministic by joined_at).
 *   3. null (caller has no organizations — should not happen post-signup).
 */
export const getOrgContext = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const cookieOrgId = getCookie(CURRENT_ORG_COOKIE) ?? null;

    const { data: memberships, error } = await context.supabase
      .from("organization_members")
      .select("organization_id, role, status, joined_at, organization:organizations(id, name, slug)")
      .eq("user_id", context.userId)
      .eq("status", "active")
      .is("deleted_at", null)
      .order("joined_at", { ascending: true, nullsFirst: false });
    if (error) throw error;

    const active = (memberships ?? []).filter((m) => m.organization);
    if (active.length === 0) {
      return { organizationId: null as string | null, role: null, name: null, slug: null };
    }

    const chosen =
      active.find((m) => m.organization_id === cookieOrgId) ?? active[0];

    const org = chosen.organization as unknown as { id: string; name: string; slug: string };
    return {
      organizationId: org.id,
      name: org.name,
      slug: org.slug,
      role: chosen.role as OrgMembershipRow["role"],
    };
  });

/** Switch the caller's current organization. Verifies active membership before setting the cookie. */
export const setCurrentOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ organizationId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", context.userId)
      .eq("organization_id", data.organizationId)
      .eq("status", "active")
      .is("deleted_at", null)
      .maybeSingle();
    if (error) throw error;
    if (!row) throw new Error("Not a member of that organization");

    setCookie(CURRENT_ORG_COOKIE, data.organizationId, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return { ok: true as const, organizationId: data.organizationId };
  });
