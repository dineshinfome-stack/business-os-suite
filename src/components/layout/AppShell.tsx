import type { ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { Breadcrumb } from "@/components/navigation/Breadcrumb";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { PlatformSidebarV2 } from "@/components/platform/navigation/PlatformSidebarV2";
import { CommandPaletteProvider } from "@/hooks/navigation/useCommandPalette";
import { usePlatformNavState } from "@/hooks/platform/usePlatformNavState";
import { StatusBar } from "@/components/platform";
import { HeaderProvider } from "@/contexts/header-context";
import { HeaderSlots } from "@/components/layout/HeaderSlots";
import { useHeaderShortcuts } from "@/hooks/header/useHeaderShortcuts";
// Side-effect import: registers the standard tenant-header slots exactly once.
import "@/components/layout/header-slots.registration";

function ShellHeader() {
  useHeaderShortcuts();
  return (
    <header
      role="banner"
      className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <HeaderSlots area="start" className="flex min-w-0 items-center gap-3" />
      <HeaderSlots area="end" className="ml-auto flex items-center gap-1" />
    </header>
  );
}

export function AppShell({ children }: { children?: ReactNode }) {
  const sidebarState = usePlatformNavState("tenant");
  const { pinned, togglePinned, collapsed, toggleCollapsed, open, closeOpen } = sidebarState;

  const visible = pinned || open;
  const sidebarWidth = collapsed ? "pl-16" : "pl-72";
  const contentShift = pinned ? sidebarWidth : "pl-0";

  return (
    <CommandPaletteProvider>
      <HeaderProvider sidebar={sidebarState}>
        <div className="min-h-screen bg-background">
          <ShellHeader />

          {open && !pinned && (
            <div
              className="fixed inset-0 top-14 z-20 bg-black/30"
              aria-hidden
              onClick={closeOpen}
            />
          )}

          {visible && (
            <PlatformSidebarV2
              variant="tenant"
              pinned={pinned}
              onTogglePin={togglePinned}
              collapsed={collapsed}
              onToggleCollapsed={toggleCollapsed}
            />
          )}

          <div className={`pt-14 transition-[padding] duration-200 ${contentShift}`}>
            <main id="main" role="main" className="p-6">
              <div className="mx-auto w-full max-w-7xl">{children ?? <Outlet />}</div>
            </main>
            <StatusBar />
          </div>
        </div>
        <CommandPalette />
      </HeaderProvider>
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
