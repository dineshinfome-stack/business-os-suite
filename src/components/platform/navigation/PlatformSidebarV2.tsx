import * as React from "react";
import { useRouterState, Link } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeft, Pin, PinOff, Clock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useNavigation } from "@/hooks/navigation/useNavigation";
import { flatten, type NavNode } from "@/lib/navigation/tree";
import { getNavItem } from "@/lib/navigation/registry";
import { usePinnedNav } from "@/hooks/navigation/usePinnedNav";
import { useRecentPages } from "@/hooks/navigation/useRecentPages";
import { useNavBadges } from "@/hooks/navigation/useNavBadges";
import { NavigationSearch } from "./NavigationSearch";
import { NavigationTabs, type NavTab } from "./NavigationTabs";
import { NavigationTree } from "./NavigationTree";
import { NavigationItem } from "./NavigationItem";
import { NavigationEmptyState } from "./NavigationEmptyState";

interface Props {
  pinned: boolean;
  onTogglePin: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/**
 * Business OS Enterprise Navigation v2 — data-driven, searchable sidebar.
 * All items come from NAV_REGISTRY via useNavigation() (permission-aware).
 */
export function PlatformSidebarV2({ pinned, onTogglePin, collapsed, onToggleCollapsed }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, user } = useAuth();
  const displayName = profile?.displayName ?? user?.email ?? "Super Admin";
  const tree = useNavigation();
  const badges = useNavBadges();
  const { pinnedIds, togglePin } = usePinnedNav();
  const { recent } = useRecentPages();

  const [tab, setTab] = React.useState<NavTab>("all");
  const [query, setQuery] = React.useState("");
  const searchRef = React.useRef<HTMLInputElement | null>(null);

  // Keyboard shortcuts: `/` focuses search, `Esc` clears.
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key === "/" && !inField) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const filteredTree = React.useMemo(() => filterTree(tree, query), [tree, query]);
  const flatCount = React.useMemo(() => flatten(filteredTree).length, [filteredTree]);

  // Sidebar width driven by collapsed state. Mini shows only icons.
  const width = collapsed ? "w-16" : "w-72";

  return (
    <aside
      aria-label="Platform navigation"
      className={`fixed left-0 top-14 z-30 flex h-[calc(100vh-3.5rem)] flex-col shadow-2xl transition-[width] duration-200 ${width}`}
      style={{
        background: "var(--platform-sidebar-bg)",
        color: "var(--platform-sidebar-fg)",
      }}
    >
      {/* Header: identity + pin + collapse */}
      <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2.5">
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-white/85">{displayName}</div>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--platform-sidebar-muted)" }}>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--brand-success)" }} />
              <span className="truncate">Super Admin</span>
            </div>
          </div>
        )}
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
            onClick={onTogglePin}
            className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-white/10"
            style={{ color: pinned ? "var(--brand-red)" : "rgba(255,255,255,0.65)" }}
          >
            {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleCollapsed}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-white/65 hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {collapsed ? (
        <MiniRail tree={tree} pathname={pathname} />
      ) : (
        <>
          <NavigationSearch value={query} onChange={setQuery} inputRef={searchRef} />
          <NavigationTabs active={tab} onChange={setTab} />

          <div className="mt-1 flex-1 overflow-y-auto">
            {tab === "all" &&
              (flatCount === 0 ? (
                <NavigationEmptyState query={query} />
              ) : (
                <NavigationTree
                  tree={filteredTree}
                  pinnedIds={pinnedIds}
                  onTogglePin={togglePin}
                  badges={badges}
                  pathname={pathname}
                  forceExpanded={Boolean(query.trim())}
                />
              ))}

            {tab === "favorites" && (
              <FavoritesPane pinnedIds={pinnedIds} onTogglePin={togglePin} pathname={pathname} badges={badges} />
            )}

            {tab === "recent" && (
              <RecentPane recent={recent} pathname={pathname} />
            )}
          </div>

          <div
            className="border-t border-white/5 px-4 py-2 text-[10px]"
            style={{ color: "var(--platform-sidebar-muted)" }}
          >
            Business OS · v1.0
          </div>
        </>
      )}
    </aside>
  );
}

/* ────────────────────────────────────────────────────────────── */

function filterTree(tree: NavNode[], q: string): NavNode[] {
  const qq = q.trim().toLowerCase();
  if (!qq) return tree;
  const walk = (nodes: NavNode[]): NavNode[] => {
    const out: NavNode[] = [];
    for (const n of nodes) {
      const hay =
        n.title.toLowerCase() +
        " " +
        n.module.toLowerCase() +
        " " +
        (n.keywords ?? []).join(" ").toLowerCase();
      const matches = hay.includes(qq);
      const children = walk(n.children);
      if (matches || children.length > 0) {
        out.push({ ...n, children });
      }
    }
    return out;
  };
  return walk(tree);
}

function FavoritesPane({
  pinnedIds,
  onTogglePin,
  pathname,
  badges,
}: {
  pinnedIds: Set<string>;
  onTogglePin: (id: string) => void;
  pathname: string;
  badges: ReturnType<typeof useNavBadges>;
}) {
  const items = Array.from(pinnedIds)
    .map((id) => getNavItem(id))
    .filter((n): n is NonNullable<ReturnType<typeof getNavItem>> => Boolean(n));
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <Pin className="h-5 w-5" style={{ color: "var(--platform-sidebar-muted)" }} />
        </div>
        <div className="text-sm font-medium text-white">No pinned pages yet</div>
        <div className="text-xs" style={{ color: "var(--platform-sidebar-muted)" }}>
          Star any item in the All tab to pin it here.
        </div>
      </div>
    );
  }
  const isActive = (r: string | null) =>
    !!r && (pathname === r || pathname.startsWith(r + "/"));
  return (
    <div role="tree" aria-label="Favorites" className="px-2 py-2">
      {items.map((it) => (
        <NavigationItem
          key={it.id}
          node={{ ...it, children: [] } as NavNode}
          active={isActive(it.route)}
          pinned
          onTogglePin={onTogglePin}
          badge={badges.get(it.id)}
        />
      ))}
    </div>
  );
}

function RecentPane({
  recent,
  pathname,
}: {
  recent: { route: string; title: string | null }[];
  pathname: string;
}) {
  if (!recent.length) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <Clock className="h-5 w-5" style={{ color: "var(--platform-sidebar-muted)" }} />
        </div>
        <div className="text-sm font-medium text-white">No recent pages</div>
        <div className="text-xs" style={{ color: "var(--platform-sidebar-muted)" }}>
          Pages you visit will appear here.
        </div>
      </div>
    );
  }
  return (
    <ul className="px-2 py-2">
      {recent.slice(0, 20).map((r, i) => {
        const active = pathname === r.route;
        return (
          <li key={`${r.route}-${i}`}>
            <Link
              to={r.route}
              className="relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white/80 hover:bg-white/5"
              style={{ background: active ? "rgba(255,255,255,0.06)" : "transparent", color: active ? "#fff" : undefined }}
            >
              <Clock className="h-3.5 w-3.5 opacity-60" />
              <span className="truncate">{r.title ?? r.route}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function MiniRail({ tree, pathname }: { tree: NavNode[]; pathname: string }) {
  // Flatten to top-level module rows only; use route where present, otherwise first child.
  const items = tree.map((n) => {
    const target = n.route ? n : n.children.find((c) => c.route) ?? n;
    return { id: n.id, title: n.title, icon: n.icon, route: target.route };
  });
  const isActive = (r: string | null) =>
    !!r && (pathname === r || pathname.startsWith(r + "/"));
  return (
    <nav aria-label="Modules" className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-2">
      {items.map((it) => {
        const Icon = it.icon;
        const active = isActive(it.route);
        const content = (
          <span
            title={it.title}
            className="relative flex h-10 w-10 items-center justify-center rounded-md text-white/80 hover:bg-white/5"
            style={{ background: active ? "rgba(255,255,255,0.08)" : "transparent", color: active ? "#fff" : undefined }}
          >
            {active && (
              <span
                aria-hidden
                className="absolute inset-y-1.5 left-0 w-[3px] rounded-r"
                style={{ background: "var(--brand-red)" }}
              />
            )}
            {Icon ? <Icon className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/40" />}
          </span>
        );
        return it.route ? (
          <Link key={it.id} to={it.route}>
            {content}
          </Link>
        ) : (
          <span key={it.id}>{content}</span>
        );
      })}
    </nav>
  );
}
