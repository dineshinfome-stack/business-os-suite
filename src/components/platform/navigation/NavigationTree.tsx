import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { NavNode } from "@/lib/navigation/tree";
import { NavigationItem } from "./NavigationItem";
import { useNavPreferences } from "@/hooks/navigation/useNavPreferences";
import type { NavBadgeMap } from "@/hooks/navigation/useNavBadges";

interface Props {
  tree: NavNode[];
  pinnedIds: Set<string>;
  onTogglePin: (id: string) => void;
  badges: NavBadgeMap;
  pathname: string;
  onNavigate?: () => void;
  /** When true, all groups render expanded (used during active search). */
  forceExpanded?: boolean;
}

export function NavigationTree({
  tree,
  pinnedIds,
  onTogglePin,
  badges,
  pathname,
  onNavigate,
  forceExpanded = false,
}: Props) {
  const prefs = useNavPreferences();
  const expandedSet = React.useMemo(
    () => new Set(prefs.preferences.expanded_groups ?? []),
    [prefs.preferences.expanded_groups],
  );

  const isActive = React.useCallback(
    (route: string | null) => {
      if (!route) return false;
      return pathname === route || pathname === route + "/" || pathname.startsWith(route + "/");
    },
    [pathname],
  );

  const groupHasActive = React.useCallback(
    (node: NavNode): boolean => {
      if (isActive(node.route)) return true;
      return node.children.some((c) => groupHasActive(c));
    },
    [isActive],
  );

  return (
    <div role="tree" aria-label="Modules" className="px-2 py-2">
      {tree.map((node) => {
        const hasChildren = node.children.length > 0;
        if (!hasChildren) {
          return (
            <NavigationItem
              key={node.id}
              node={node}
              active={isActive(node.route)}
              pinned={pinnedIds.has(node.id)}
              onTogglePin={onTogglePin}
              badge={badges.get(node.id)}
              onNavigate={onNavigate}
            />
          );
        }
        const containsActive = groupHasActive(node);
        const expanded = forceExpanded || containsActive || expandedSet.has(node.id);
        return (
          <NavigationGroup
            key={node.id}
            node={node}
            expanded={expanded}
            onToggle={() => prefs.toggleGroup(node.id)}
            pinnedIds={pinnedIds}
            onTogglePin={onTogglePin}
            badges={badges}
            isActive={isActive}
            onNavigate={onNavigate}
          />
        );
      })}
    </div>
  );
}

function NavigationGroup({
  node,
  expanded,
  onToggle,
  pinnedIds,
  onTogglePin,
  badges,
  isActive,
  onNavigate,
}: {
  node: NavNode;
  expanded: boolean;
  onToggle: () => void;
  pinnedIds: Set<string>;
  onTogglePin: (id: string) => void;
  badges: NavBadgeMap;
  isActive: (route: string | null) => boolean;
  onNavigate?: () => void;
}) {
  const Icon = node.icon;
  return (
    <div role="group" className="mt-1 first:mt-0">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wider text-white/60 hover:bg-white/5"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span className="flex-1 truncate">{node.title}</span>
      </button>
      {expanded && (
        <div className="mt-0.5">
          {node.children.map((child) =>
            child.children.length > 0 ? (
              <div key={child.id} className="pl-3">
                <NavigationGroup
                  node={child}
                  expanded
                  onToggle={() => {}}
                  pinnedIds={pinnedIds}
                  onTogglePin={onTogglePin}
                  badges={badges}
                  isActive={isActive}
                  onNavigate={onNavigate}
                />
              </div>
            ) : (
              <NavigationItem
                key={child.id}
                node={child}
                depth={1}
                active={isActive(child.route)}
                pinned={pinnedIds.has(child.id)}
                onTogglePin={onTogglePin}
                badge={badges.get(child.id)}
                onNavigate={onNavigate}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
