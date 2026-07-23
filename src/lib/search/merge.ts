/**
 * Sprint 0.9 — Merge, dedupe, RBAC-filter and rank search results.
 * Extracted so unit tests can exercise the merge without a DB.
 */
import type { PermissionKey } from "@/lib/generated/permission-keys";
import type { SearchResult } from "./types";

export interface MergeOptions {
  permissions: ReadonlySet<PermissionKey>;
  limit: number;
}

export function mergeSearchResults(
  chunks: readonly SearchResult[][],
  opts: MergeOptions,
): SearchResult[] {
  const seen = new Map<string, SearchResult>();
  for (const chunk of chunks) {
    for (const r of chunk) {
      if (r.permission && !opts.permissions.has(r.permission)) continue;
      const key = `${r.resource_type}:${r.id}`;
      const prev = seen.get(key);
      if (!prev || r.score > prev.score) seen.set(key, r);
    }
  }
  return Array.from(seen.values())
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, opts.limit);
}
