/**
 * Board Rec 3 — NavigationIndex facade. Wraps the existing string search and
 * exposes a tree filter used by the sidebar. Kept separate from the tree
 * consumer so future surfaces (AI Search, command palette, mobile) reuse it.
 */
import type { NavNode } from "./tree";

export { searchNavigation } from "./search";
export type { SearchOptions, SearchResult } from "./search";

/** Recursively keep nodes whose title/module/keywords match `query`. */
export function filterNavigationTree(tree: NavNode[], query: string): NavNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return tree;

  const walk = (nodes: NavNode[]): NavNode[] => {
    const out: NavNode[] = [];
    for (const n of nodes) {
      const hay =
        n.title.toLowerCase() +
        " " +
        n.module.toLowerCase() +
        " " +
        (n.keywords ?? []).join(" ").toLowerCase();
      const children = walk(n.children);
      if (hay.includes(q) || children.length > 0) {
        out.push({ ...n, children });
      }
    }
    return out;
  };
  return walk(tree);
}
