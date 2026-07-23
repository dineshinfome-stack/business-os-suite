/**
 * Sprint 0.7 — Favorites server functions.
 * Keyed by `nav_id` (identity). Retired ids are filtered on read and pruned.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrgContext } from "@/integrations/supabase/org-middleware";
import { NAV_ID_REGEX, isActiveNavId } from "./registry";
import { partitionByActive, pruneRetiredNavIds } from "./retired";

export interface FavoriteRow {
  nav_id: string;
  display_order: number;
}

export const listFavoritesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .handler(async ({ context }): Promise<FavoriteRow[]> => {
    const orgId = (context as { organizationId: string }).organizationId;
    const { data, error } = await context.supabase
      .from("nav_favorites")
      .select("nav_id, display_order")
      .eq("organization_id", orgId)
      .order("display_order", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as FavoriteRow[];
    const { kept, stale } = partitionByActive(rows.map((r) => r.nav_id));
    if (stale.length > 0) {
      void pruneRetiredNavIds(
        context.supabase as never,
        "nav_favorites",
        context.userId,
        orgId,
        stale,
      );
    }
    return rows.filter((r) => kept.includes(r.nav_id));
  });

export const addFavoriteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) =>
    z.object({ navId: z.string().regex(NAV_ID_REGEX) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    if (!isActiveNavId(data.navId)) {
      throw new Error(`Unknown or retired nav_id: ${data.navId}`);
    }
    const orgId = (context as { organizationId: string }).organizationId;
    // display_order = current max + 10
    const { data: existing } = await context.supabase
      .from("nav_favorites")
      .select("display_order")
      .eq("organization_id", orgId)
      .order("display_order", { ascending: false })
      .limit(1);
    const nextOrder = ((existing?.[0]?.display_order as number | undefined) ?? 0) + 10;
    const { error } = await context.supabase.from("nav_favorites").upsert(
      {
        user_id: context.userId,
        organization_id: orgId,
        nav_id: data.navId,
        display_order: nextOrder,
      },
      { onConflict: "user_id,organization_id,nav_id" },
    );
    if (error) throw error;
    return { ok: true };
  });

export const removeFavoriteFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) => z.object({ navId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const orgId = (context as { organizationId: string }).organizationId;
    const { error } = await context.supabase
      .from("nav_favorites")
      .delete()
      .eq("organization_id", orgId)
      .eq("nav_id", data.navId);
    if (error) throw error;
    return { ok: true };
  });

export const reorderFavoritesFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) =>
    z.object({ orderedNavIds: z.array(z.string()).max(200) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const orgId = (context as { organizationId: string }).organizationId;
    // Rewrite display_order in bulk.
    let idx = 10;
    for (const navId of data.orderedNavIds) {
      await context.supabase
        .from("nav_favorites")
        .update({ display_order: idx })
        .eq("organization_id", orgId)
        .eq("nav_id", navId);
      idx += 10;
    }
    return { ok: true };
  });
