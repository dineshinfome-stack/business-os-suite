/**
 * Simple in-memory navigation search. Excludes retired items.
 */
import { NAV_REGISTRY, type NavItem } from "./registry";
import type { PermissionKey } from "@/lib/generated/permission-keys";

export interface SearchOptions {
  permissions: Set<PermissionKey>;
  featureFlags: Set<string>;
  limit?: number;
}

export interface SearchResult {
  item: NavItem;
  score: number;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export function searchNavigation(query: string, opts: SearchOptions): SearchResult[] {
  const q = normalize(query);
  if (!q) return [];
  const results: SearchResult[] = [];
  for (const item of NAV_REGISTRY) {
    if (item.id_status !== "active" || !item.visible || !item.route) continue;
    if (item.permission && !opts.permissions.has(item.permission)) continue;
    if (item.feature_flag && !opts.featureFlags.has(item.feature_flag)) continue;

    const title = normalize(item.title);
    const module = normalize(item.module);
    const kw = (item.keywords ?? []).map(normalize);

    let score = 0;
    if (title === q) score = 100;
    else if (title.startsWith(q)) score = 80;
    else if (title.includes(q)) score = 60;
    else if (module.includes(q)) score = 40;
    else if (kw.some((k) => k.includes(q))) score = 30;
    if (score > 0) results.push({ item, score });
  }
  results.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
  return results.slice(0, opts.limit ?? 20);
}
