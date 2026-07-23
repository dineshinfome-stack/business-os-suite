/**
 * Sprint 0.9 — RegistryProvider
 *
 * Scores in-memory matches against the navigation registry (routes users can
 * navigate to) and the active search registry entries (module landing pages).
 * Zero DB round-trips.
 */
import { NAV_REGISTRY } from "@/lib/navigation/registry";
import { listActiveSearchEntries } from "@/lib/search/registry";
import type {
  SearchProvider,
  SearchProviderContext,
  SearchQuery,
  SearchResult,
} from "@/lib/search/types";

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function scoreMatch(haystackTitle: string, haystackKeywords: string[], q: string): number {
  const title = normalize(haystackTitle);
  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (haystackKeywords.some((k) => normalize(k).includes(q))) return 40;
  return 0;
}

export const registryProvider: SearchProvider = {
  key: "registry",
  priority: 10,
  async search(query: SearchQuery, ctx: SearchProviderContext): Promise<SearchResult[]> {
    const q = normalize(query.query);
    if (!q) return [];
    const results: SearchResult[] = [];

    // Navigation items — treat as "page" hits.
    for (const item of NAV_REGISTRY) {
      if (item.id_status !== "active" || !item.visible || !item.route) continue;
      if (item.permission && !ctx.permissions.has(item.permission)) continue;
      const score = scoreMatch(item.title, item.keywords ?? [], q);
      if (score <= 0) continue;
      if (query.resourceTypes && !query.resourceTypes.includes("page")) continue;
      results.push({
        id: item.id,
        resource_type: "page",
        organization_id: query.organizationId,
        title: item.title,
        subtitle: item.module,
        route: item.route,
        permission: item.permission,
        score,
      });
    }

    // Active search-registry entries — surface module landing pages.
    for (const entry of listActiveSearchEntries()) {
      if (query.resourceTypes && !query.resourceTypes.includes(entry.resourceType)) continue;
      if (entry.permission && !ctx.permissions.has(entry.permission)) continue;
      const score = scoreMatch(entry.displayName, [...entry.keywords], q);
      if (score <= 0) continue;
      results.push({
        id: entry.resourceType,
        resource_type: entry.resourceType,
        organization_id: query.organizationId,
        title: entry.displayName,
        subtitle: "Module",
        route: entry.routeBuilder
          ? entry.routeBuilder({
              id: entry.resourceType,
              resource_type: entry.resourceType,
              organization_id: query.organizationId,
              title: entry.displayName,
              route: "",
              score,
            })
          : `/${entry.resourceType}`,
        permission: entry.permission,
        score: Math.max(score - 5, 1), // tie-break under exact nav matches
      });
    }

    return results;
  },
};
