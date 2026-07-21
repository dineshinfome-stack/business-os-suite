import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Settings, Shield, Star, Clock, Search } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/constants/app";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MAIN: NavItem[] = [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }];

const ADMIN: NavItem[] = [
  { title: "Administration", url: "/settings", icon: Shield },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => pathname === url;

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
          <div className="relative px-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="h-8 pl-7 text-xs" aria-label="Global search" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Main" items={MAIN} isActive={isActive} collapsed={collapsed} />
        <NavGroup label="Admin" items={ADMIN} isActive={isActive} collapsed={collapsed} />
        {!collapsed && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>
                <Star className="mr-1 h-3 w-3" /> Favorites
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <p className="px-3 py-1 text-xs text-muted-foreground">No favorites yet.</p>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>
                <Clock className="mr-1 h-3 w-3" /> Recent
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <p className="px-3 py-1 text-xs text-muted-foreground">No recent pages.</p>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

function NavGroup({
  label,
  items,
  isActive,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  isActive: (u: string) => boolean;
  collapsed: boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <Link to={item.url} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
