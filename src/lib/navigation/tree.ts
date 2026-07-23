/**
 * Sprint 0.7 — Navigation tree helpers (pure, memoized).
 */
import { NAV_REGISTRY, type NavItem } from "./registry";

export interface NavNode extends NavItem {
  children: NavNode[];
}

let _treeCache: NavNode[] | null = null;

/** Build a hierarchical tree of ACTIVE items sorted by display_order. */
export function buildTree(items: readonly NavItem[] = NAV_REGISTRY): NavNode[] {
  if (items === NAV_REGISTRY && _treeCache) return _treeCache;

  const active = items.filter((i) => i.id_status === "active");
  const map = new Map<string, NavNode>();
  for (const i of active) map.set(i.id, { ...i, children: [] });

  const roots: NavNode[] = [];
  for (const node of map.values()) {
    if (node.parent && map.has(node.parent)) {
      map.get(node.parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sort = (nodes: NavNode[]) => {
    nodes.sort((a, b) => a.display_order - b.display_order);
    for (const n of nodes) sort(n.children);
  };
  sort(roots);

  if (items === NAV_REGISTRY) _treeCache = roots;
  return roots;
}

/** Flatten tree into an ordered list. */
export function flatten(tree: NavNode[]): NavNode[] {
  const out: NavNode[] = [];
  const walk = (nodes: NavNode[]) => {
    for (const n of nodes) {
      out.push(n);
      walk(n.children);
    }
  };
  walk(tree);
  return out;
}

/**
 * Match a runtime pathname against a registry route pattern.
 * Supports TanStack `$param` segments (e.g. /users/$id).
 */
export function matchRoute(pattern: string, pathname: string): boolean {
  if (pattern === pathname) return true;
  const pSeg = pattern.split("/").filter(Boolean);
  const aSeg = pathname.split("/").filter(Boolean);
  if (pSeg.length !== aSeg.length) return false;
  return pSeg.every((seg, i) => seg.startsWith("$") || seg === aSeg[i]);
}

/** Find a nav item whose `route` matches the pathname (active only). */
export function findByRoute(pathname: string): NavItem | undefined {
  return NAV_REGISTRY.find(
    (n) => n.id_status === "active" && n.route != null && matchRoute(n.route, pathname),
  );
}

/** Reset the tree cache (test-only). */
export function __resetTreeCache() {
  _treeCache = null;
}
