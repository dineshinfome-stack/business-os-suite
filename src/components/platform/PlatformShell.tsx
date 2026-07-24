import * as React from "react";
import type { ReactNode } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { PlatformTopBar } from "./PlatformTopBar";
import { PlatformAllDrawer } from "./PlatformAllDrawer";
import { PLATFORM_NAV } from "./nav-items";
import { usePlatformNavState } from "@/hooks/platform/usePlatformNavState";

function resolveTitle(pathname: string): string {
  const match = [...PLATFORM_NAV]
    .sort((a, b) => b.to.length - a.to.length)
    .find((n) => pathname === n.to || pathname.startsWith(n.to + "/"));
  if (match?.id === "dashboard" || pathname === "/platform" || pathname === "/platform/") {
    return "Shared admin dashboard";
  }
  return match?.label ?? "Platform";
}

export function PlatformShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = resolveTitle(pathname);
  const { pinned, togglePinned, activeTab, openTab, closeMenus } = usePlatformNavState();

  // Close menus on route change (but keep pinned drawer open).
  React.useEffect(() => {
    closeMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape closes any open menu/drawer overlay.
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenus();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [closeMenus]);

  const drawerOpen = activeTab === "all" || pinned;
  const contentShift = pinned ? "pl-72" : "";

  return (
    <div className="platform-theme min-h-screen" style={{ background: "var(--sn-canvas)" }}>
      <PlatformTopBar title={title} activeTab={activeTab} onTabClick={openTab} />

      {/* Overlay when drawer is open but not pinned */}
      {drawerOpen && !pinned && (
        <div
          className="fixed inset-0 top-14 z-20 bg-black/20"
          onClick={() => openTab(null)}
          aria-hidden
        />
      )}

      {drawerOpen && (
        <PlatformAllDrawer
          pinned={pinned}
          onTogglePin={togglePinned}
          onNavigate={() => (pinned ? undefined : openTab(null))}
        />
      )}

      <div className={`pt-14 ${contentShift}`}>
        <main id="main" role="main">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
