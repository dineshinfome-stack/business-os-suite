import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { PLATFORM_NAV } from "./nav-items";

export function PlatformSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { profile, user } = useAuth();
  const displayName = profile?.displayName ?? user?.email ?? "Platform Admin";

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col"
      style={{
        background: "var(--platform-sidebar-bg)",
        color: "var(--platform-sidebar-fg)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md text-lg font-bold text-white"
          style={{ background: "var(--brand-red)" }}
          aria-hidden
        >
          B
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">Business OS</div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--platform-sidebar-muted)" }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: "var(--brand-success)" }} />
            <span className="truncate">{displayName}</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Platform Admin">
        <ul className="space-y-0.5">
          {PLATFORM_NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.to || pathname === item.to + "/"
              : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className="relative flex h-11 items-center gap-3 px-4 text-sm transition-colors"
                  style={{
                    background: active ? "var(--platform-sidebar-active-bg)" : "transparent",
                    color: active ? "#fff" : "var(--platform-sidebar-fg)",
                    borderLeft: active
                      ? `3px solid var(--platform-sidebar-active-bar)`
                      : "3px solid transparent",
                    paddingLeft: active ? "calc(1rem - 3px + 3px)" : "1rem",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "var(--platform-sidebar-hover-bg)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
                {active && item.children ? (
                  <ul className="space-y-0.5 pb-1">
                    {item.children.map((child) => {
                      const childActive = child.exact
                        ? pathname === child.to || pathname === child.to + "/"
                        : pathname === child.to || pathname.startsWith(child.to + "/");
                      return (
                        <li key={child.id}>
                          <Link
                            to={child.to}
                            className="flex h-9 items-center pl-11 pr-4 text-xs transition-colors"
                            style={{
                              color: childActive
                                ? "#fff"
                                : "var(--platform-sidebar-muted)",
                              background: childActive
                                ? "var(--platform-sidebar-hover-bg)"
                                : "transparent",
                            }}
                          >
                            <span className="truncate">{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>

            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t px-4 py-3 text-xs" style={{ borderColor: "rgba(255,255,255,0.06)", color: "var(--platform-sidebar-muted)" }}>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded bg-white/5 px-2 py-1 text-white/80">
            Mobile App
          </span>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
