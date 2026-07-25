import * as React from "react";
import { LayoutGrid, Star, Clock } from "lucide-react";

export type SecondaryHeaderTab = "all" | "favorites" | "recent";

interface Props {
  active?: SecondaryHeaderTab | null;
  onSelect?: (tab: SecondaryHeaderTab) => void;
}

/**
 * Platform secondary header — renders below the topbar with the
 * All / Favorites / Recent triggers. Theme-aware:
 *  • Light theme → light grey background
 *  • Dark theme  → navy blue background
 */
export function PlatformSecondaryHeader({ active = null, onSelect }: Props) {
  const [internal, setInternal] = React.useState<SecondaryHeaderTab | null>(active);
  const current = onSelect ? active : internal;

  const handle = (tab: SecondaryHeaderTab) => {
    if (onSelect) onSelect(tab);
    else setInternal((prev) => (prev === tab ? null : tab));
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
        active={current === "all"}
        onClick={() => handle("all")}
      />
      <TabButton
        label="Favorites"
        icon={Star}
        active={current === "favorites"}
        onClick={() => handle("favorites")}
      />
      <TabButton
        label="Recent"
        icon={Clock}
        active={current === "recent"}
        onClick={() => handle("recent")}
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
  onClick: () => void;
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
