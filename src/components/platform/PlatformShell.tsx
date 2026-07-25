import * as React from "react";
import type { ReactNode } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { PlatformTopBar } from "./PlatformTopBar";
import { PlatformSecondaryHeader } from "./PlatformSecondaryHeader";
import { PlatformSidebarV2 } from "./navigation/PlatformSidebarV2";
import { CommandPalette } from "@/components/navigation/CommandPalette";
import { CommandPaletteProvider } from "@/hooks/navigation/useCommandPalette";
import { NAV_REGISTRY } from "@/lib/navigation/registry";
import { usePlatformNavState } from "@/hooks/platform/usePlatformNavState";

function resolveTitle(pathname: string): string {
  const match = [...NAV_REGISTRY]
    .filter((n) => n.route)
    .sort((a, b) => (b.route!.length - a.route!.length))
    .find((n) => pathname === n.route || pathname.startsWith(n.route + "/"));
  if (pathname === "/platform" || pathname === "/platform/") return "Shared admin dashboard";
  return match?.title ?? "Platform";
}

export function PlatformShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = resolveTitle(pathname);
  const { pinned, togglePinned, collapsed, toggleCollapsed } = usePlatformNavState();

  const sidebarWidth = collapsed ? "pl-16" : "pl-72";
  // Non-pinned still renders but as overlay (no content shift).
  const contentShift = pinned ? sidebarWidth : "pl-0";

  return (
    <CommandPaletteProvider>
      <div className="platform-theme min-h-screen" style={{ background: "var(--platform-content-bg)" }}>
        <PlatformTopBar title={title} />
        <PlatformSecondaryHeader />

        {!pinned && (
          <div
            className="fixed inset-0 top-[6rem] z-20 bg-black/20 lg:hidden"
            aria-hidden
            onClick={togglePinned}
          />
        )}

        <PlatformSidebarV2
          variant="platform"
          pinned={pinned}
          onTogglePin={togglePinned}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          topOffset="6rem"
        />

        <div className={`pt-24 transition-[padding] duration-200 ${contentShift}`}>
          <main id="main" role="main">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
      <CommandPalette />
    </CommandPaletteProvider>
  );
}
