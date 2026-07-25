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
import { SecondaryNavTabProvider } from "@/hooks/platform/useSecondaryNavTab";

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

  const [popupOpen, setPopupOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = React.useCallback(() => {
    clearClose();
    closeTimer.current = setTimeout(() => setPopupOpen(false), 180);
  }, []);
  const openNow = React.useCallback(() => {
    clearClose();
    setPopupOpen(true);
  }, []);

  // Close popup on route change or Escape.
  React.useEffect(() => {
    setPopupOpen(false);
  }, [pathname]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopupOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const contentShift = pinned ? "pl-72" : "pl-0";

  return (
    <CommandPaletteProvider>
      <SecondaryNavTabProvider>
        <div className="platform-theme min-h-screen" style={{ background: "var(--platform-content-bg)" }}>
          <PlatformTopBar title={title} />
          <PlatformSecondaryHeader />

          {/* Edge hover trigger — only when unpinned */}
          {!pinned && (
            <div
              aria-hidden
              onMouseEnter={openNow}
              onClick={openNow}
              className="fixed left-0 z-20"
              style={{ top: "6rem", height: "calc(100vh - 6rem)", width: "8px" }}
            />
          )}

          <PlatformSidebarV2
            variant="platform"
            pinned={pinned}
            onTogglePin={() => {
              togglePinned();
              setPopupOpen(false);
            }}
            collapsed={collapsed}
            onToggleCollapsed={toggleCollapsed}
            topOffset="6rem"
            mode={pinned ? "pinned" : "popup"}
            open={pinned || popupOpen}
            onMouseEnter={openNow}
            onMouseLeave={scheduleClose}
          />

          <div className={`pt-24 transition-[padding] duration-200 ${contentShift}`}>
            <main id="main" role="main">
              {children ?? <Outlet />}
            </main>
          </div>
        </div>
        <CommandPalette />
      </SecondaryNavTabProvider>
    </CommandPaletteProvider>
  );
}
