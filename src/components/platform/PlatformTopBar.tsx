import * as React from "react";
import { Bell, HelpCircle, MessageSquare, Globe, Search, Star, ChevronDown } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import { PlatformSimplePopover } from "./PlatformSimplePopover";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";
import type { PlatformTab } from "@/hooks/platform/usePlatformNavState";

interface PlatformTopBarProps {
  title: string;
  activeTab: PlatformTab;
  onTabClick: (tab: PlatformTab) => void;
}

const TABS: { id: Exclude<PlatformTab, null>; label: string }[] = [
  { id: "all", label: "All" },
  { id: "favorites", label: "Favorites" },
  { id: "history", label: "History" },
  { id: "workspaces", label: "Workspaces" },
  { id: "admin", label: "Admin" },
];

export function PlatformTopBar({ title, activeTab, onTabClick }: PlatformTopBarProps) {
  const palette = useCommandPalette();

  const IconBtn = ({
    label,
    onClick,
    children,
  }: {
    label: string;
    onClick?: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 px-4"
      style={{ background: "var(--sn-navy-800)", color: "var(--sn-text-onnavy)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 pr-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold"
          style={{ background: "var(--sn-navy-900)", color: "#fff" }}
          aria-hidden
        >
          B
        </div>
        <div className="hidden items-baseline gap-1 text-[15px] font-semibold tracking-tight md:flex">
          <span>business</span>
          <span style={{ color: "var(--sn-accent-green)" }}>os</span>
        </div>
      </div>

      {/* Tabs */}
      <nav aria-label="Primary" className="flex items-center">
        {TABS.map((t) => {
          const active = activeTab === t.id || (t.id === "admin" && activeTab === null);
          return (
            <div key={t.id} className="relative">
              <button
                type="button"
                onClick={() => onTabClick(t.id)}
                aria-expanded={activeTab === t.id}
                className="relative h-14 px-4 text-sm font-medium transition-colors"
                style={{
                  color: active ? "#fff" : "rgba(255,255,255,0.75)",
                }}
              >
                {t.label}
                {active && (
                  <span
                    className="absolute inset-x-3 bottom-0 h-0.5 rounded-t-sm"
                    style={{ background: "#fff" }}
                    aria-hidden
                  />
                )}
              </button>
              {activeTab === t.id && (t.id === "favorites" || t.id === "history" || t.id === "workspaces") && (
                <PlatformSimplePopover variant={t.id} onNavigate={() => onTabClick(null)} />
              )}
            </div>
          );
        })}
      </nav>

      {/* Center pill */}
      <div className="mx-auto flex items-center">
        <div
          className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow-sm"
          style={{ color: "var(--sn-text)" }}
        >
          <span className="truncate max-w-[16rem]">{title}</span>
          <Star className="h-4 w-4" style={{ color: "var(--sn-accent-yellow)" }} />
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </div>
      </div>

      {/* Right utility */}
      <div className="ml-auto flex items-center gap-0.5">
        <IconBtn label="Search" onClick={() => palette.setOpen(true)}>
          <Search className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Language"><Globe className="h-4 w-4" /></IconBtn>
        <IconBtn label="Messages"><MessageSquare className="h-4 w-4" /></IconBtn>
        <IconBtn label="Help"><HelpCircle className="h-4 w-4" /></IconBtn>
        <div className="relative">
          <IconBtn label="Notifications"><Bell className="h-4 w-4" /></IconBtn>
          <span
            className="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ background: "var(--sn-accent-pink)" }}
          />
        </div>
        <div className="ml-1">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
