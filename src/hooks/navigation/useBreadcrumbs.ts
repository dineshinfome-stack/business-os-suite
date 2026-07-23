import { useMemo } from "react";
import { useRouterState } from "@tanstack/react-router";
import { NAV_REGISTRY, type NavItem } from "@/lib/navigation/registry";
import { matchRoute } from "@/lib/navigation/tree";

export const MAX_BREADCRUMB_DEPTH = 20;

export interface Crumb {
  id: string;
  title: string;
  route: string | null;
}

/**
 * Build breadcrumbs for the current route by walking `parent` up the
 * registry. Enforces MAX_BREADCRUMB_DEPTH and detects cycles.
 */
export function useBreadcrumbs(): Crumb[] {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return useMemo(() => {
    const current = NAV_REGISTRY.find(
      (n) => n.id_status === "active" && n.route != null && matchRoute(n.route, pathname),
    );
    if (!current) return [];
    const byId = new Map<string, NavItem>();
    for (const n of NAV_REGISTRY) if (n.id_status === "active") byId.set(n.id, n);

    const chain: NavItem[] = [];
    const seen = new Set<string>();
    let node: NavItem | undefined = current;
    while (node && chain.length < MAX_BREADCRUMB_DEPTH) {
      if (seen.has(node.id)) break; // cycle guard
      seen.add(node.id);
      chain.unshift(node);
      node = node.parent ? byId.get(node.parent) : undefined;
    }
    return chain.map((n) => ({ id: n.id, title: n.title, route: n.route }));
  }, [pathname]);
}
