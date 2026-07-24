import type { ReactNode } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { PlatformSidebar } from "./PlatformSidebar";
import { PlatformTopBar } from "./PlatformTopBar";
import { PLATFORM_NAV } from "./nav-items";

function resolveTitle(pathname: string): { title: string; breadcrumb: string } {
  // Longest-prefix match against nav items.
  const match = [...PLATFORM_NAV]
    .sort((a, b) => b.to.length - a.to.length)
    .find((n) => pathname === n.to || pathname.startsWith(n.to + "/"));
  if (match?.id === "dashboard" || pathname === "/platform" || pathname === "/platform/") {
    return { title: "Super Admin Dashboard", breadcrumb: "Super Admin Dashboard" };
  }
  const label = match?.label ?? "Platform";
  return { title: label, breadcrumb: label };
}

export function PlatformShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { title, breadcrumb } = resolveTitle(pathname);

  return (
    <div className="min-h-screen" style={{ background: "var(--platform-content-bg)" }}>
      <PlatformSidebar />
      <div className="pl-60">
        <PlatformTopBar title={title} breadcrumb={breadcrumb} />
        <main id="main" role="main" className="p-6">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
