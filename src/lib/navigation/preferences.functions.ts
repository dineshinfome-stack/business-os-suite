/**
 * Sprint 0.7 — User Navigation Preferences (per user + org).
 * Stored as a jsonb blob on `nav_user_preferences`.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrgContext } from "@/integrations/supabase/org-middleware";
import { partitionByActive } from "./retired";

export const NavPreferencesSchema = z.object({
  sidebar_collapsed: z.boolean().optional(),
  expanded_groups: z.array(z.string()).max(200).optional(),
  module_launcher_view: z.enum(["grid", "list"]).optional(),
});
export type NavPreferences = z.infer<typeof NavPreferencesSchema>;

export const DEFAULT_PREFS: Required<NavPreferences> = {
  sidebar_collapsed: false,
  expanded_groups: [],
  module_launcher_view: "grid",
};

export const getNavPreferencesFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .handler(async ({ context }): Promise<Required<NavPreferences>> => {
    const orgId = (context as { organizationId: string }).organizationId;
    const { data, error } = await context.supabase
      .from("nav_user_preferences")
      .select("preferences")
      .eq("organization_id", orgId)
      .maybeSingle();
    if (error) throw error;
    const raw = (data?.preferences ?? {}) as Record<string, unknown>;
    const parsed = NavPreferencesSchema.safeParse(raw);
    const merged: Required<NavPreferences> = {
      ...DEFAULT_PREFS,
      ...(parsed.success ? parsed.data : {}),
    };
    // Reconcile expanded_groups: drop retired/unknown ids.
    const { kept } = partitionByActive(merged.expanded_groups);
    if (kept.length !== merged.expanded_groups.length) {
      merged.expanded_groups = kept;
      // Persist cleaned set once.
      await context.supabase
        .from("nav_user_preferences")
        .upsert(
          {
            user_id: context.userId,
            organization_id: orgId,
            preferences: merged,
          },
          { onConflict: "user_id,organization_id" },
        );
    }
    return merged;
  });

export const setNavPreferencesFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) =>
    z.object({ preferences: NavPreferencesSchema }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const orgId = (context as { organizationId: string }).organizationId;
    const { data: existing } = await context.supabase
      .from("nav_user_preferences")
      .select("preferences")
      .eq("organization_id", orgId)
      .maybeSingle();
    const current = (existing?.preferences ?? {}) as Record<string, unknown>;
    const merged = { ...current, ...data.preferences };
    const { error } = await context.supabase.from("nav_user_preferences").upsert(
      {
        user_id: context.userId,
        organization_id: orgId,
        preferences: merged,
      },
      { onConflict: "user_id,organization_id" },
    );
    if (error) throw error;
    return { ok: true, preferences: merged };
  });
