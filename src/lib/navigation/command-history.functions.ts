/**
 * Sprint 0.7 — Command Palette History (navigation actions only).
 * Never stores search query text.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrgContext } from "@/integrations/supabase/org-middleware";
import { NAV_ID_REGEX, isActiveNavId } from "./registry";
import { partitionByActive, pruneRetiredNavIds } from "./retired";

export const COMMAND_HISTORY_LIMIT = 8;

export interface CommandHistoryRow {
  nav_id: string;
  invoked_at: string;
}

export const listCommandHistoryFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .handler(async ({ context }): Promise<CommandHistoryRow[]> => {
    const orgId = (context as { organizationId: string }).organizationId;
    const { data, error } = await context.supabase
      .from("nav_command_history")
      .select("nav_id, invoked_at")
      .eq("organization_id", orgId)
      .order("invoked_at", { ascending: false })
      .limit(COMMAND_HISTORY_LIMIT);
    if (error) throw error;
    const rows = (data ?? []) as CommandHistoryRow[];
    const { kept, stale } = partitionByActive(rows.map((r) => r.nav_id));
    if (stale.length > 0) {
      void pruneRetiredNavIds(
        context.supabase as never,
        "nav_command_history",
        context.userId,
        orgId,
        stale,
      );
    }
    return rows.filter((r) => kept.includes(r.nav_id));
  });

export const recordCommandHistoryFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) =>
    z.object({ navId: z.string().regex(NAV_ID_REGEX) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    if (!isActiveNavId(data.navId)) {
      throw new Error(`Unknown or retired nav_id: ${data.navId}`);
    }
    const orgId = (context as { organizationId: string }).organizationId;
    const { error } = await context.supabase.from("nav_command_history").upsert(
      {
        user_id: context.userId,
        organization_id: orgId,
        nav_id: data.navId,
        invoked_at: new Date().toISOString(),
      },
      { onConflict: "user_id,organization_id,nav_id" },
    );
    if (error) throw error;

    // Prune beyond limit
    const { data: rows } = await context.supabase
      .from("nav_command_history")
      .select("id, invoked_at")
      .eq("organization_id", orgId)
      .order("invoked_at", { ascending: false });
    if (rows && rows.length > COMMAND_HISTORY_LIMIT) {
      const excess = rows.slice(COMMAND_HISTORY_LIMIT).map((r) => (r as { id: string }).id);
      if (excess.length > 0) {
        await context.supabase.from("nav_command_history").delete().in("id", excess);
      }
    }
    return { ok: true };
  });
