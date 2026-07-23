/**
 * Sprint 0.9 — Search & Global Command Framework: server functions.
 *
 * All functions run under `requireSupabaseAuth` and derive `organization_id`
 * from server context. Cross-organization queries are structurally impossible.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireOrgContext } from "@/integrations/supabase/org-middleware";
import { listEffectivePermissions } from "@/lib/authorization.functions";
import type { PermissionKey } from "@/lib/generated/permission-keys";
import { SEARCH_PROVIDERS } from "@/lib/search/providers";
import { mergeSearchResults } from "@/lib/search/merge";
import type { SearchResult } from "@/lib/search/types";

const SEARCH_LIMIT = 20;

function orgIdOf(context: unknown): string {
  return (context as { organizationId: string }).organizationId;
}

async function insertAudit(
  supabase: { from: (t: string) => { insert: (v: unknown) => Promise<{ error: unknown }> } },
  userId: string,
  action: "search_executed" | "search_result_selected" | "search_history_cleared",
  metadata: Record<string, unknown>,
): Promise<void> {
  try {
    await supabase.from("audit_logs").insert({
      action,
      entity_type: "search",
      entity_id: userId,
      actor_id: userId,
      created_by: userId,
      updated_by: userId,
      new_values: metadata,
    });
  } catch {
    // Audit failures never block user-visible search.
  }
}

// ── searchGlobal ──────────────────────────────────────────────────────────
const SearchInput = z.object({
  query: z.string().min(1).max(200),
  resourceTypes: z.array(z.string().min(1)).optional(),
  limit: z.number().int().min(1).max(SEARCH_LIMIT).optional(),
});

export interface SearchResponse {
  results: SearchResult[];
  query: string;
}

export const searchGlobal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) => SearchInput.parse(data))
  .handler(async ({ data, context }): Promise<SearchResponse> => {
    const orgId = orgIdOf(context);
    const permsList = await listEffectivePermissions({ data: { organizationId: orgId } });
    const permissions = new Set<PermissionKey>(permsList);
    if (!permissions.has("search.global.use" as PermissionKey)) {
      throw new Response("Forbidden", { status: 403 });
    }
    const providerCtx = { permissions };
    const chunks = await Promise.all(
      SEARCH_PROVIDERS.map((p) =>
        p
          .search(
            {
              query: data.query,
              organizationId: orgId,
              userId: context.userId,
              resourceTypes: data.resourceTypes,
              limit: data.limit ?? SEARCH_LIMIT,
            },
            providerCtx,
          )
          .catch(() => [] as SearchResult[]),
      ),
    );
    const results = mergeSearchResults(chunks, {
      permissions,
      limit: data.limit ?? SEARCH_LIMIT,
    });

    void insertAudit(context.supabase as never, context.userId, "search_executed", {
      org_id: orgId,
      providers: SEARCH_PROVIDERS.map((p) => p.key),
      result_count: results.length,
      resource_types: data.resourceTypes ?? null,
    });

    return { results, query: data.query };
  });

// ── recordSearchSelection ─────────────────────────────────────────────────
const SelectionInput = z.object({
  query: z.string().min(1).max(500),
  resourceType: z.string().min(1).max(64).nullable().optional(),
  resultId: z.string().min(1).max(200).nullable().optional(),
});

export const recordSearchSelection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) => SelectionInput.parse(data))
  .handler(async ({ data, context }) => {
    const orgId = orgIdOf(context);
    const { error } = await context.supabase.from("search_history").insert({
      organization_id: orgId,
      user_id: context.userId,
      query: data.query,
      resource_type: data.resourceType ?? null,
      selected_result_id: data.resultId ?? null,
    });
    if (error) throw error;
    void insertAudit(context.supabase as never, context.userId, "search_result_selected", {
      org_id: orgId,
      resource_type: data.resourceType ?? null,
    });
    return { ok: true as const };
  });

// ── listRecentSearches ────────────────────────────────────────────────────
export interface RecentSearchRow {
  id: string;
  query: string;
  resourceType: string | null;
  searchedAt: string;
}

export const listRecentSearches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) =>
    z.object({ limit: z.number().int().min(1).max(20).optional() }).parse(data ?? {}),
  )
  .handler(async ({ data, context }): Promise<RecentSearchRow[]> => {
    const orgId = orgIdOf(context);

    // Respect the user's preference toggle.
    const { data: prefRow } = await context.supabase
      .from("search_preferences")
      .select("enable_recent_searches")
      .eq("organization_id", orgId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (prefRow && !prefRow.enable_recent_searches) return [];

    const { data: rows, error } = await context.supabase
      .from("search_history")
      .select("id, query, resource_type, searched_at")
      .eq("organization_id", orgId)
      .eq("user_id", context.userId)
      .order("searched_at", { ascending: false })
      .limit(data.limit ?? 10);
    if (error) throw error;
    return (rows ?? []).map((r) => ({
      id: r.id as string,
      query: r.query as string,
      resourceType: (r.resource_type as string | null) ?? null,
      searchedAt: r.searched_at as string,
    }));
  });

// ── clearSearchHistory ────────────────────────────────────────────────────
export const clearSearchHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .handler(async ({ context }) => {
    const orgId = orgIdOf(context);
    const permsList = await listEffectivePermissions({ data: { organizationId: orgId } });
    if (!permsList.includes("search.history.manage" as PermissionKey)) {
      throw new Response("Forbidden", { status: 403 });
    }
    const { error } = await context.supabase
      .from("search_history")
      .delete()
      .eq("organization_id", orgId)
      .eq("user_id", context.userId);
    if (error) throw error;
    void insertAudit(context.supabase as never, context.userId, "search_history_cleared", {
      org_id: orgId,
    });
    return { ok: true as const };
  });

// ── Preferences ───────────────────────────────────────────────────────────
export interface SearchPreferencesRow {
  enableRecentSearches: boolean;
  enableSuggestions: boolean;
}

const DEFAULT_PREFS: SearchPreferencesRow = {
  enableRecentSearches: true,
  enableSuggestions: true,
};

export const getSearchPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .handler(async ({ context }): Promise<SearchPreferencesRow> => {
    const orgId = orgIdOf(context);
    const { data: row, error } = await context.supabase
      .from("search_preferences")
      .select("enable_recent_searches, enable_suggestions")
      .eq("organization_id", orgId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!row) return DEFAULT_PREFS;
    return {
      enableRecentSearches: row.enable_recent_searches as boolean,
      enableSuggestions: row.enable_suggestions as boolean,
    };
  });

const UpdatePrefInput = z.object({
  enableRecentSearches: z.boolean().optional(),
  enableSuggestions: z.boolean().optional(),
});

export const updateSearchPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, requireOrgContext])
  .inputValidator((data: unknown) => UpdatePrefInput.parse(data))
  .handler(async ({ data, context }): Promise<SearchPreferencesRow> => {
    const orgId = orgIdOf(context);
    const { data: existing } = await context.supabase
      .from("search_preferences")
      .select("id, enable_recent_searches, enable_suggestions")
      .eq("organization_id", orgId)
      .eq("user_id", context.userId)
      .maybeSingle();
    const merged = {
      enable_recent_searches:
        data.enableRecentSearches ??
        (existing?.enable_recent_searches as boolean | undefined) ??
        true,
      enable_suggestions:
        data.enableSuggestions ??
        (existing?.enable_suggestions as boolean | undefined) ??
        true,
    };
    if (existing?.id) {
      const { error } = await context.supabase
        .from("search_preferences")
        .update(merged)
        .eq("id", existing.id as string);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("search_preferences").insert({
        organization_id: orgId,
        user_id: context.userId,
        ...merged,
      });
      if (error) throw error;
    }
    return {
      enableRecentSearches: merged.enable_recent_searches,
      enableSuggestions: merged.enable_suggestions,
    };
  });
