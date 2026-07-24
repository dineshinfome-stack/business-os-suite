import { List, Star, Clock } from "lucide-react";

export type NavTab = "all" | "favorites" | "recent";

interface Props {
  active: NavTab;
  onChange: (t: NavTab) => void;
}

const TABS: { id: NavTab; label: string; icon: typeof List }[] = [
  { id: "all", label: "All", icon: List },
  { id: "favorites", label: "Favorites", icon: Star },
  { id: "recent", label: "Recent", icon: Clock },
];

export function NavigationTabs({ active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Navigation view"
      className="mx-3 mt-3 grid grid-cols-3 gap-1 rounded-md p-1"
      style={{ background: "var(--nav-input-bg)" }}
    >
      {TABS.map((t) => {
        const Icon = t.icon;
        const selected = active === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={selected}
            type="button"
            onClick={() => onChange(t.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: selected ? "var(--nav-tab-active-bg)" : "transparent",
              color: selected ? "var(--nav-tab-active-fg)" : "var(--nav-fg-muted)",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
