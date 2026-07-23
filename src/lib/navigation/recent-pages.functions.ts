/**
 * Sprint 0.7 — Recent Pages server functions.
 * Route-keyed per §1.2. Drops routes that no longer resolve.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrgContext } from "@/integrations/supabase/org-middleware";
import { findByRoute } from "./tree";

export const RECENT_PAGES_LIMIT = 10;

export interface RecentPageRow {
  route: string;
  title: string | null;
  visited_at: string;
}

export const listRecentPagesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .handler(async ({ context }): Promise<RecentPageRow[]> => {
    const orgId = (context as { organizationId: string }).organizationId;
    const { data, error } = await context.supabase
      .from("nav_recent_pages")
      .select("route, title, visited_at")
      .eq("organization_id", orgId)
      .order("visited_at", { ascending: false })
      .limit(RECENT_PAGES_LIMIT);
    if (error) throw error;
    const rows = (data ?? []) as RecentPageRow[];
    // Drop routes that no longer resolve to any active registry entry.
    const kept: RecentPageRow[] = [];
    const stale: string[] = [];
    for (const r of rows) {
      if (findByRoute(r.route)) kept.push(r);
      else stale.push(r.route);
    }
    if (stale.length > 0) {
      try {
        await context.supabase
          .from("nav_recent_pages")
          .delete()
          .eq("organization_id", orgId)
          .in("route", stale);
      } catch {
        /* opportunistic */
      }
    }
    return kept;
  });

export const recordRecentPageFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) =>
    z.object({ route: z.string().min(1).max(500), title: z.string().max(200).nullable().optional() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const orgId = (context as { organizationId: string }).organizationId;
    // Skip if route doesn't resolve — never records unknown routes.
    if (!findByRoute(data.route)) return { ok: false, reason: "unknown-route" as const };

    const { error } = await context.supabase.from("nav_recent_pages").upsert(
      {
        user_id: context.userId,
        organization_id: orgId,
        route: data.route,
        title: data.title ?? null,
        visited_at: new Date().toISOString(),
      },
      { onConflict: "user_id,organization_id,route" },
    );
    if (error) throw error;

    // Prune beyond limit
    const { data: rows } = await context.supabase
      .from("nav_recent_pages")
      .select("id, visited_at")
      .eq("organization_id", orgId)
      .order("visited_at", { ascending: false });
    if (rows && rows.length > RECENT_PAGES_LIMIT) {
      const excess = rows.slice(RECENT_PAGES_LIMIT).map((r) => (r as { id: string }).id);
      if (excess.length > 0) {
        await context.supabase.from("nav_recent_pages").delete().in("id", excess);
      }
    }
    return { ok: true };
  });
