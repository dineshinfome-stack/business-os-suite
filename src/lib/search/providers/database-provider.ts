/**
 * Sprint 0.9 — DatabaseProvider scaffold.
 *
 * Iterates the search registry's active entries and delegates to a per-type
 * `dbLookup`. Ships with no lookups wired (no business tables exist yet);
 * demonstrates the RLS-scoped query shape and extension point for future
 * modules. Always returns [] today.
 */
import type {
  SearchProvider,
  SearchProviderContext,
  SearchQuery,
  SearchResult,
} from "@/lib/search/types";

export type DbLookup = (
  query: SearchQuery,
  ctx: SearchProviderContext,
) => Promise<SearchResult[]>;

const lookups = new Map<string, DbLookup>();

/** Register a per-resource-type lookup. Future sprints call this on module init. */
export function registerDbLookup(resourceType: string, fn: DbLookup): void {
  lookups.set(resourceType, fn);
}

export const databaseProvider: SearchProvider = {
  key: "database",
  priority: 20,
  async search(query: SearchQuery, ctx: SearchProviderContext): Promise<SearchResult[]> {
    if (lookups.size === 0) return [];
    const types = query.resourceTypes ?? Array.from(lookups.keys());
    const active = types.filter((t) => lookups.has(t));
    if (active.length === 0) return [];
    const chunks = await Promise.all(
      active.map((t) => (lookups.get(t) as DbLookup)(query, ctx).catch(() => [])),
    );
    return chunks.flat();
  },
};
