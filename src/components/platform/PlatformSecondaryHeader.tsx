import * as React from "react";
import { LayoutGrid, Star, Clock } from "lucide-react";
import { useSecondaryNavTab, type SecondaryNavTab } from "@/hooks/platform/useSecondaryNavTab";
import { useSidebarPopup } from "@/hooks/platform/useSidebarPopup";

export type SecondaryHeaderTab = SecondaryNavTab;

/**
 * Platform secondary header — renders below the topbar with the
 * All / Favorites / Recent triggers. Drives the sidebar's active tab
 * via SecondaryNavTabProvider. Theme-aware:
 *  • Light theme → light grey background
 *  • Dark theme  → navy blue background
 */
export function PlatformSecondaryHeader() {
  const { tab, setTab } = useSecondaryNavTab();
  const popup = useSidebarPopup();

  const activate = (t: SecondaryNavTab, el: HTMLElement) => {
    setTab(t);
    if (popup.isPopupMode) popup.openFromAnchor(el);
  };

  return (
    <div
      className="fixed inset-x-0 top-14 z-30 flex h-10 items-center gap-1 px-3"
      style={{
        background: "var(--platform-secondary-header-bg)",
        borderBottom: "1px solid var(--platform-secondary-header-border)",
      }}
    >
      <TabButton
        label="All"
        icon={LayoutGrid}
        active={tab === "all"}
        onClick={(e) => activate("all", e.currentTarget)}
      />
      <TabButton
        label="Favorites"
        icon={Star}
        active={tab === "favorites"}
        onClick={(e) => activate("favorites", e.currentTarget)}
      />
      <TabButton
        label="Recent"
        icon={Clock}
        active={tab === "recent"}
        onClick={(e) => activate("recent", e.currentTarget)}
      />
    </div>
  );
}

function TabButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors"
      style={
        active
          ? { background: "var(--brand-red)", color: "#ffffff" }
          : {
              background: "transparent",
              color: "var(--platform-sidebar-fg)",
            }
      }
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}
