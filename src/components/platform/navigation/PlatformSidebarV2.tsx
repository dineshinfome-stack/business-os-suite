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
import { APP_NAME } from "@/constants/app";
import { NavigationSearch } from "./NavigationSearch";
import { NavigationTabs, type NavTab } from "./NavigationTabs";
import { NavigationTree } from "./NavigationTree";
import { NavigationItem } from "./NavigationItem";
import { NavigationEmptyState } from "./NavigationEmptyState";

export type SidebarVariant = "platform" | "tenant";

interface Props {
  pinned: boolean;
  onTogglePin: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Theme variant. Platform = dark navy, tenant = light shadcn sidebar. */
  variant?: SidebarVariant;
  /** Vertical offset from top of viewport (matches header height). */
  topOffset?: string;
  /** Optional subtitle under the display name. */
  subtitle?: string;
  /** Hide the identity/pin/collapse header block (when rendered elsewhere). */
  hideHeader?: boolean;
}

/**
 * Business OS Enterprise Navigation v2 — data-driven, searchable sidebar.
 * Shared between the Platform (Super Admin) shell and the Tenant AppShell.
 * All items come from NAV_REGISTRY via useNavigation() (permission-aware).
 */
export function PlatformSidebarV2({
  pinned,
  onTogglePin,
  collapsed,
  onToggleCollapsed,
  variant = "platform",
  topOffset = "3.5rem",
  subtitle,
  hideHeader = false,
}: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, user } = useAuth();
  const displayName =
    profile?.displayName ?? user?.email ?? (variant === "platform" ? "Super Admin" : APP_NAME);
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

  const width = collapsed ? "w-16" : "w-72";
  const resolvedSubtitle = subtitle ?? (variant === "platform" ? "Super Admin" : "Tenant");

  return (
    <aside
      aria-label="Application navigation"
      data-variant={variant}
      className={`enterprise-sidebar fixed left-0 z-30 flex flex-col transition-[width] duration-200 ${width}`}
      style={{
        top: topOffset,
        height: `calc(100vh - ${topOffset})`,
        background: "var(--nav-bg)",
        color: "var(--nav-fg)",
        borderRight: "1px solid var(--nav-border)",
        boxShadow: "var(--nav-elevation)",
      }}
    >
      {!hideHeader && (
        <div
          className="flex items-center gap-2 px-3 py-2.5"
          style={{ borderBottom: "1px solid var(--nav-border)" }}
        >
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div
                className="truncate text-xs font-medium"
                style={{ color: "var(--nav-fg-strong)" }}
              >
                {displayName}
              </div>
              <div
                className="flex items-center gap-1.5 text-[10px]"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--brand-success)" }}
                />
                <span className="truncate">{resolvedSubtitle}</span>
              </div>
            </div>
          )}
          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
              onClick={onTogglePin}
              className="inline-flex h-7 w-7 items-center justify-center rounded"
              style={{ color: pinned ? "var(--nav-active-bar)" : "var(--nav-fg-muted)" }}
            >
              {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={onToggleCollapsed}
              className="inline-flex h-7 w-7 items-center justify-center rounded"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              {collapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

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

            {tab === "recent" && <RecentPane recent={recent} pathname={pathname} />}
          </div>

          <div
            className="px-4 py-2 text-[10px]"
            style={{
              color: "var(--nav-fg-muted)",
              borderTop: "1px solid var(--nav-border)",
            }}
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
          style={{ background: "var(--nav-hover)" }}
        >
          <Pin className="h-5 w-5" style={{ color: "var(--nav-fg-muted)" }} />
        </div>
        <div className="text-sm font-medium" style={{ color: "var(--nav-fg-strong)" }}>
          No pinned pages yet
        </div>
        <div className="text-xs" style={{ color: "var(--nav-fg-muted)" }}>
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
          style={{ background: "var(--nav-hover)" }}
        >
          <Clock className="h-5 w-5" style={{ color: "var(--nav-fg-muted)" }} />
        </div>
        <div className="text-sm font-medium" style={{ color: "var(--nav-fg-strong)" }}>
          No recent pages
        </div>
        <div className="text-xs" style={{ color: "var(--nav-fg-muted)" }}>
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
              className="relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
              style={{
                background: active ? "var(--nav-active-bg)" : "transparent",
                color: active ? "var(--nav-fg-strong)" : "var(--nav-fg)",
              }}
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
  const items = tree.map((n) => {
    const target = n.route ? n : n.children.find((c) => c.route) ?? n;
    return { id: n.id, title: n.title, icon: n.icon, route: target.route };
  });
  const isActive = (r: string | null) =>
    !!r && (pathname === r || pathname.startsWith(r + "/"));
  return (
    <nav
      aria-label="Modules"
      className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-2"
    >
      {items.map((it) => {
        const Icon = it.icon;
        const active = isActive(it.route);
        const content = (
          <span
            title={it.title}
            className="relative flex h-10 w-10 items-center justify-center rounded-md"
            style={{
              background: active ? "var(--nav-active-bg)" : "transparent",
              color: active ? "var(--nav-fg-strong)" : "var(--nav-fg)",
            }}
          >
            {active && (
              <span
                aria-hidden
                className="absolute inset-y-1.5 left-0 w-[3px] rounded-r"
                style={{ background: "var(--nav-active-bar)" }}
              />
            )}
            {Icon ? (
              <Icon className="h-4 w-4" />
            ) : (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--nav-fg-muted)" }}
              />
            )}
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
