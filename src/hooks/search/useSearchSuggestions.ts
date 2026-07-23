/**
 * Sprint 0.9 — Instant registry-only suggestions (no DB call).
 * Used for the empty-input state and inline autocomplete.
 */
import { useMemo } from "react";
import { NAV_REGISTRY } from "@/lib/navigation/registry";
import { listActiveSearchEntries } from "@/lib/search/registry";
import { usePermissions } from "@/contexts/permissions-context";

export interface SuggestionRow {
  id: string;
  title: string;
  route: string | null;
  kind: "page" | "module";
}

export function useSearchSuggestions(query: string, limit = 5): SuggestionRow[] {
  const { permissions } = usePermissions();
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: SuggestionRow[] = [];
    for (const item of NAV_REGISTRY) {
      if (item.id_status !== "active" || !item.route || !item.visible) continue;
      if (item.permission && !permissions.has(item.permission)) continue;
      if (item.title.toLowerCase().includes(q)) {
        results.push({ id: item.id, title: item.title, route: item.route, kind: "page" });
      }
    }
    for (const entry of listActiveSearchEntries()) {
      if (entry.permission && !permissions.has(entry.permission)) continue;
      if (entry.displayName.toLowerCase().includes(q)) {
        results.push({
          id: entry.resourceType,
          title: entry.displayName,
          route: `/${entry.resourceType}`,
          kind: "module",
        });
      }
    }
    return results.slice(0, limit);
  }, [query, permissions, limit]);
}
