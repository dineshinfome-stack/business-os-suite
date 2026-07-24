/**
 * Board Rec 2/3/6 — NavigationSearchIndex.
 *
 * A cached, normalized index over NAV_REGISTRY plus a tree filter used by the
 * sidebar. Built once per registry identity and reused across renders.
 *
 * Match precedence — see docs/03-design/navigation-search-standard.md
 *   1. Exact title
 *   2. Alias      (schema deferred; typed extension point)
 *   3. Keyword
 *   4. Module
 *   5. Description (future; typed extension point)
 */
import { NAV_REGISTRY, type NavItem } from "./registry";
import type { NavNode } from "./tree";

export interface IndexedNavEntry {
  item: NavItem;
  title: string;
  module: string;
  keywords: string[];
  /** Alias tokens. Empty until the registry ships an `aliases` field. */
  aliases: string[];
  /** Description tokens. Empty until the registry ships a `description` field. */
  description: string;
  /** Concatenated haystack for cheap substring filtering. */
  haystack: string;
}

export interface NavigationSearchIndex {
  entries: IndexedNavEntry[];
  byId: Map<string, IndexedNavEntry>;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

function buildIndex(registry: readonly NavItem[]): NavigationSearchIndex {
  const entries: IndexedNavEntry[] = [];
  const byId = new Map<string, IndexedNavEntry>();
  for (const item of registry) {
    if (item.id_status !== "active" || !item.visible) continue;
    const title = normalize(item.title);
    const module = normalize(item.module);
    const keywords = (item.keywords ?? []).map(normalize);
    // Extension points — populated when NAV_REGISTRY grows these fields.
    const aliases: string[] = [];
    const description = "";
    const haystack = [title, module, ...keywords, ...aliases, description].join(" ");
    const entry: IndexedNavEntry = {
      item,
      title,
      module,
      keywords,
      aliases,
      description,
      haystack,
    };
    entries.push(entry);
    byId.set(item.id, entry);
  }
  return { entries, byId };
}

// Weak-cached per registry identity so HMR / test swaps invalidate cleanly.
const cache = new WeakMap<readonly NavItem[], NavigationSearchIndex>();

/**
 * Return the memoized NavigationSearchIndex for a registry. Callers must pass
 * the same registry reference between calls to hit the cache — that's exactly
 * the contract we want for the singleton NAV_REGISTRY.
 */
export function buildNavigationSearchIndex(
  registry: readonly NavItem[] = NAV_REGISTRY,
): NavigationSearchIndex {
  const hit = cache.get(registry);
  if (hit) return hit;
  const idx = buildIndex(registry);
  cache.set(registry, idx);
  return idx;
}

/**
 * Score an entry for a query using the documented precedence.
 * Returns 0 when there is no match.
 */
export function scoreEntry(entry: IndexedNavEntry, query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  if (entry.title === q) return 100;
  if (entry.title.startsWith(q)) return 90;
  if (entry.aliases.includes(q)) return 85;
  if (entry.aliases.some((a) => a.includes(q))) return 75;
  if (entry.title.includes(q)) return 70;
  if (entry.keywords.some((k) => k.includes(q))) return 50;
  if (entry.module.includes(q)) return 40;
  if (entry.description.includes(q)) return 20;
  return 0;
}

/**
 * Filter a nav tree by query. Uses the cached haystack for cheap matching and
 * preserves parent branches whose descendants match.
 */
export function filterNavigationTree(tree: NavNode[], query: string): NavNode[] {
  const q = normalize(query);
  if (!q) return tree;
  const index = buildNavigationSearchIndex();

  const walk = (nodes: NavNode[]): NavNode[] => {
    const out: NavNode[] = [];
    for (const n of nodes) {
      const entry = index.byId.get(n.id);
      const hay = entry?.haystack ?? `${normalize(n.title)} ${normalize(n.module)}`;
      const children = walk(n.children);
      if (hay.includes(q) || children.length > 0) {
        out.push({ ...n, children });
      }
    }
    return out;
  };
  return walk(tree);
}

// Re-export existing string search for backwards compatibility.
export { searchNavigation } from "./search";
export type { SearchOptions, SearchResult } from "./search";
