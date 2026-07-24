import type { ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { PanelLeft, PanelLeftClose, Pin, PinOff } from "lucide-react";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { PlatformSidebarV2 } from "@/components/platform/navigation/PlatformSidebarV2";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CommandPaletteProvider } from "@/hooks/navigation/useCommandPalette";
import { usePlatformNavState } from "@/hooks/platform/usePlatformNavState";
import { useAuth } from "@/contexts/auth-context";
import { ProfileMenu, HelpMenu, SearchTrigger, StatusBar } from "@/components/platform";

export function AppShell({ children }: { children?: ReactNode }) {
  const { pinned, togglePinned, collapsed, toggleCollapsed } = usePlatformNavState("tenant");
  const { profile, user } = useAuth();
  const displayName = profile?.displayName ?? user?.email ?? "Tenant";

  const sidebarWidth = collapsed ? "pl-16" : "pl-72";
  const contentShift = pinned ? sidebarWidth : "pl-0";

  return (
    <CommandPaletteProvider>
      <div className="min-h-screen bg-background">
        <header
          role="banner"
          className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-foreground">{displayName}</div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-success)]" />
                <span className="truncate">Tenant</span>
              </div>
            </div>
            <div className="ml-1 flex items-center gap-0.5">
              <button
                type="button"
                aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
                onClick={togglePinned}
                className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                {pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={toggleCollapsed}
                className="inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                {collapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <SearchTrigger />
            <NotificationBell />
            <HelpMenu />
            <ProfileMenu />
          </div>
        </header>

        {!pinned && (
          <div
            className="fixed inset-0 top-14 z-20 bg-black/20 lg:hidden"
            aria-hidden
            onClick={togglePinned}
          />
        )}

        <PlatformSidebarV2
          variant="tenant"
          pinned={pinned}
          onTogglePin={togglePinned}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          hideHeader
        />

        <div className={`pt-14 transition-[padding] duration-200 ${contentShift}`}>
          <main id="main" role="main" className="p-6">
            <div className="mx-auto w-full max-w-7xl">{children ?? <Outlet />}</div>
          </main>
          <StatusBar />
        </div>
      </div>
      <CommandPalette />
    </CommandPaletteProvider>
  );
}

export function PageContainer({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Breadcrumb />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}
