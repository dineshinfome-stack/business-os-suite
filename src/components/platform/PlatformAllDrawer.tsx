import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Filter, Pin, PinOff, RefreshCw, Star, ChevronRight } from "lucide-react";
import { PLATFORM_NAV } from "./nav-items";

interface Props {
  pinned: boolean;
  onTogglePin: () => void;
  onNavigate: () => void;
}

export function PlatformAllDrawer({ pinned, onTogglePin, onNavigate }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [filter, setFilter] = React.useState("");

  const items = PLATFORM_NAV.filter((i) =>
    i.label.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <aside
      role={pinned ? "complementary" : "dialog"}
      aria-label="Platform navigation"
      className="fixed left-0 top-14 z-30 flex h-[calc(100vh-3.5rem)] w-72 flex-col shadow-2xl"
      style={{ background: "var(--sn-navy-800)", color: "var(--sn-text-onnavy)" }}
    >
      {/* Filter + refresh + pin */}
      <div className="flex items-center gap-2 px-3 py-3">
        <div
          className="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5"
          style={{ background: "var(--sn-navy-900)" }}
        >
          <Filter className="h-3.5 w-3.5" style={{ color: "var(--sn-text-onnavy-muted)" }} />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter"
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/40"
          />
        </div>
        <button
          type="button"
          aria-label="Refresh"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={pinned ? "Unpin menu" : "Pin menu"}
          onClick={onTogglePin}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
          style={{ color: pinned ? "var(--sn-accent-pink)" : "rgba(255,255,255,0.7)" }}
        >
          {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav list */}
      <nav className="flex-1 overflow-y-auto py-1" aria-label="All modules">
        <ul>
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.to || pathname === item.to + "/"
              : pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.id}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className="group relative flex items-center gap-2 py-2.5 pl-4 pr-3 text-sm transition-colors"
                  style={{
                    background: active ? "var(--sn-navy-700)" : "transparent",
                    color: active ? "#fff" : "var(--sn-text-onnavy-muted)",
                  }}
                >
                  {active && (
                    <span
                      className="absolute inset-y-0 left-0 w-0.5"
                      style={{ background: "var(--sn-accent-pink)" }}
                      aria-hidden
                    />
                  )}
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: "var(--sn-accent-pink)" }}
                  />
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <Star
                    className="h-3.5 w-3.5 opacity-0 group-hover:opacity-70"
                    style={{ color: "var(--sn-accent-yellow)" }}
                  />
                </Link>
              </li>
            );
          })}
          {items.length === 0 && (
            <li className="px-4 py-6 text-center text-xs" style={{ color: "var(--sn-text-onnavy-muted)" }}>
              No results
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
