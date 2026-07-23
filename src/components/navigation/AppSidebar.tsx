import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Star, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/app";
import { useNavigation } from "@/hooks/navigation/useNavigation";
import { useFavorites } from "@/hooks/navigation/useFavorites";
import { useRecentPages } from "@/hooks/navigation/useRecentPages";
import { useNavPreferences } from "@/hooks/navigation/useNavPreferences";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";
import { getNavItem } from "@/lib/navigation/registry";
import { matchRoute } from "@/lib/navigation/tree";
import type { NavNode } from "@/lib/navigation/tree";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tree = useNavigation();
  const { favorites } = useFavorites();
  const { recent } = useRecentPages();
  const { preferences, toggleGroup } = useNavPreferences();
  const palette = useCommandPalette();

  const expanded = useMemo(() => new Set(preferences.expanded_groups), [preferences.expanded_groups]);
  const isActive = (route: string | null) => (route ? matchRoute(route, pathname) : false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-6 w-6 shrink-0 rounded bg-primary" />
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight">{APP_NAME}</span>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={() => palette.setOpen(true)}
            className="relative mx-2 flex items-center rounded-md border border-input bg-background px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent"
            aria-label="Open command palette"
          >
            <Search className="mr-2 h-3.5 w-3.5" />
            <span className="flex-1">Search…</span>
            <kbd className="ml-2 rounded bg-muted px-1 py-0.5 text-[10px]">⌘K</kbd>
          </button>
        )}
      </SidebarHeader>

      <SidebarContent>
        {tree.map((module) => (
          <ModuleGroup
            key={module.id}
            node={module}
            expanded={expanded.has(module.id)}
            onToggle={() => toggleGroup(module.id)}
            isActive={isActive}
            collapsed={collapsed}
          />
        ))}

        {!collapsed && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>
                <Star className="mr-1 h-3 w-3" /> Favorites
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {favorites.length === 0 ? (
                  <p className="px-3 py-1 text-xs text-muted-foreground">No favorites yet.</p>
                ) : (
                  <SidebarMenu>
                    {favorites.map((f) => {
                      const item = getNavItem(f.nav_id);
                      if (!item?.route) return null;
                      return (
                        <SidebarMenuItem key={f.nav_id}>
                          <SidebarMenuButton asChild isActive={isActive(item.route)}>
                            <Link to={item.route} className="flex items-center gap-2">
                              {item.icon && <item.icon className="h-4 w-4" />}
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                )}
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>
                <Clock className="mr-1 h-3 w-3" /> Recent
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {recent.length === 0 ? (
                  <p className="px-3 py-1 text-xs text-muted-foreground">No recent pages.</p>
                ) : (
                  <SidebarMenu>
                    {recent.slice(0, 5).map((r) => (
                      <SidebarMenuItem key={r.route}>
                        <SidebarMenuButton asChild isActive={isActive(r.route)}>
                          <Link to={r.route} className="flex items-center gap-2">
                            <span className="truncate">{r.title ?? r.route}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function ModuleGroup({
  node,
  expanded,
  onToggle,
  isActive,
  collapsed,
}: {
  node: NavNode;
  expanded: boolean;
  onToggle: () => void;
  isActive: (route: string | null) => boolean;
  collapsed: boolean;
}) {
  const hasChildren = node.children.length > 0;
  const label = (
    <span className="flex items-center gap-1">
      {hasChildren && !collapsed && (
        expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
      )}
      {node.title}
    </span>
  );

  return (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel asChild>
          <button
            type="button"
            onClick={hasChildren ? onToggle : undefined}
            className="w-full text-left"
          >
            {label}
          </button>
        </SidebarGroupLabel>
      )}
      {(collapsed || expanded || !hasChildren) && (
        <SidebarGroupContent>
          <SidebarMenu>
            {node.route && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(node.route)} tooltip={node.title}>
                  <Link to={node.route} className="flex items-center gap-2">
                    {node.icon && <node.icon className="h-4 w-4" />}
                    {!collapsed && <span>{node.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {node.children.map((child) =>
              child.children.length === 0 ? (
                <SidebarMenuItem key={child.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(child.route)}
                    tooltip={child.title}
                  >
                    <Link to={child.route ?? "#"} className="flex items-center gap-2">
                      {child.icon && <child.icon className="h-4 w-4" />}
                      {!collapsed && <span>{child.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem key={child.id}>
                  {!collapsed && (
                    <>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(child.route)}
                        tooltip={child.title}
                      >
                        <Link to={child.route ?? "#"} className="flex items-center gap-2">
                          {child.icon && <child.icon className="h-4 w-4" />}
                          <span>{child.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {child.children.map((leaf) => (
                          <SidebarMenuSubItem key={leaf.id}>
                            <SidebarMenuSubButton asChild isActive={isActive(leaf.route)}>
                              <Link to={leaf.route ?? "#"}>{leaf.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </>
                  )}
                </SidebarMenuItem>
              ),
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}

// keep Button import referenced (for future action UI); silence unused warning
void Button;
