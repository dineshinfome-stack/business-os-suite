/**
 * Filter the nav tree for the caller's permissions + feature flags.
 * Retired items are also dropped.
 */
import type { NavNode } from "./tree";
import type { PermissionKey } from "@/lib/generated/permission-keys";

export interface FilterCtx {
  permissions: Set<PermissionKey>;
  featureFlags: Set<string>;
}

export function filterNavForUser(tree: NavNode[], ctx: FilterCtx): NavNode[] {
  const walk = (nodes: NavNode[]): NavNode[] => {
    const out: NavNode[] = [];
    for (const n of nodes) {
      if (n.id_status !== "active") continue;
      if (!n.visible) continue;
      if (n.permission && !ctx.permissions.has(n.permission)) continue;
      if (n.feature_flag && !ctx.featureFlags.has(n.feature_flag)) continue;
      const children = walk(n.children);
      // Parent module with no route and no visible children is hidden.
      if (!n.route && children.length === 0 && n.parent === null) continue;
      out.push({ ...n, children });
    }
    return out;
  };
  return walk(tree);
}
