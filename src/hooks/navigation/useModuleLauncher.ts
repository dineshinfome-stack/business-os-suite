import { useMemo } from "react";
import { useNavigation } from "./useNavigation";
import type { NavNode } from "@/lib/navigation/tree";

/**
 * Returns top-level "module" nodes for the Module Launcher grid.
 * A module is any root-level nav node with at least one visible child
 * or a route of its own.
 */
export function useModuleLauncher(): NavNode[] {
  const tree = useNavigation();
  return useMemo(
    () => tree.filter((n) => n.children.length > 0 || Boolean(n.route)),
    [tree],
  );
}
