import * as React from "react";
import { NAV_REGISTRY } from "@/lib/navigation/registry";
import {
  buildNavigationSearchIndex,
  filterNavigationTree,
  type NavigationSearchIndex,
} from "@/lib/navigation/search-index";
import type { NavNode } from "@/lib/navigation/tree";

/**
 * Board Rec 2 — memoized NavigationSearchIndex hook.
 *
 * Returns the cached index (built once per registry identity) plus a memoized
 * `filter(tree, query)` callback so consumers don't rebuild per keystroke.
 */
export function useNavigationSearchIndex() {
  const index: NavigationSearchIndex = React.useMemo(
    () => buildNavigationSearchIndex(NAV_REGISTRY),
    [],
  );
  const filter = React.useCallback(
    (tree: NavNode[], query: string) => filterNavigationTree(tree, query),
    [],
  );
  return { index, filter };
}
