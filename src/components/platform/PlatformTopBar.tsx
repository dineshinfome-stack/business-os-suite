import * as React from "react";
import { Bell, HelpCircle, MessageSquare, Globe, Search } from "lucide-react";
import { ProfileMenu } from "./ProfileMenu";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";

interface PlatformTopBarProps {
  title: string;
}

export function PlatformTopBar({ title }: PlatformTopBarProps) {
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[color:var(--platform-sidebar-muted)] transition-colors hover:bg-[color:var(--platform-sidebar-hover-bg)] hover:text-[color:var(--platform-sidebar-fg)]"
    >
      {children}
    </button>
  );

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 px-4"
      style={{ background: "var(--platform-topbar-bg)", color: "var(--platform-sidebar-fg)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 pr-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold text-white"
          style={{ background: "var(--brand-red)" }}
          aria-hidden
        >
          B
        </div>
        <div className="hidden items-baseline gap-1 text-[15px] font-semibold tracking-tight md:flex">
          <span>business</span>
          <span style={{ color: "var(--brand-red)" }}>os</span>
        </div>
      </div>

      {/* Current page title */}
      <div className="hidden min-w-0 items-center gap-2 md:flex">
        <span className="text-[color:var(--platform-sidebar-muted)]">/</span>
        <span className="truncate text-sm font-medium text-[color:var(--platform-sidebar-fg)]">{title}</span>
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
            style={{ background: "var(--brand-red)" }}
          />
        </div>
        <div className="ml-1">
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
