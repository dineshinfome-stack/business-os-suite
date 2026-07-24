import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Star, Clock } from "lucide-react";
import { useFavorites } from "@/hooks/navigation/useFavorites";
import { useRecentPages } from "@/hooks/navigation/useRecentPages";
import { getNavItem } from "@/lib/navigation/registry";

interface Props {
  variant: "favorites" | "history" | "workspaces";
  onNavigate: () => void;
}

/** Small dark popover anchored under a top-bar tab. */
export function PlatformSimplePopover({ variant, onNavigate }: Props) {
  return (
    <div
      role="menu"
      className="absolute left-0 top-full z-40 mt-1 w-80 overflow-hidden rounded-md shadow-2xl"
      style={{
        background: "var(--sn-navy-800)",
        color: "var(--sn-text-onnavy)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {variant === "favorites" && <FavoritesList onNavigate={onNavigate} />}
      {variant === "history" && <HistoryList onNavigate={onNavigate} />}
      {variant === "workspaces" && (
        <EmptyState icon={<Star className="h-6 w-6 opacity-50" />} title="No workspaces" body="Workspaces will appear here." />
      )}
    </div>
  );
}

function FavoritesList({ onNavigate }: { onNavigate: () => void }) {
  const { favorites, isLoading } = useFavorites();
  if (isLoading) return <div className="p-4 text-sm text-white/60">Loading…</div>;
  if (!favorites.length) {
    return <EmptyState icon={<Star className="h-6 w-6 opacity-50" />} title="No favorites yet" body="Star pages from the All menu to pin them here." />;
  }
  return (
    <ul className="max-h-80 overflow-y-auto py-1">
      {favorites.map((f) => (
        <li key={f.nav_id}>
          <Link
            to={f.route ?? "/"}
            onClick={onNavigate}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5"
          >
            <Star className="h-3.5 w-3.5" style={{ color: "var(--sn-accent-yellow)" }} />
            <span className="truncate">{f.title ?? f.nav_id}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function HistoryList({ onNavigate }: { onNavigate: () => void }) {
  const { recent, isLoading } = useRecentPages();
  if (isLoading) return <div className="p-4 text-sm text-white/60">Loading…</div>;
  if (!recent.length) {
    return <EmptyState icon={<Clock className="h-6 w-6 opacity-50" />} title="No history yet" body="Recently visited pages will show up here." />;
  }
  return (
    <ul className="max-h-80 overflow-y-auto py-1">
      {recent.slice(0, 12).map((r, i) => (
        <li key={`${r.route}-${i}`}>
          <Link
            to={r.route}
            onClick={onNavigate}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5"
          >
            <Clock className="h-3.5 w-3.5 opacity-60" />
            <span className="flex-1 truncate">{r.title ?? r.route}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
      {icon}
      <div className="text-sm font-medium">{title}</div>
      <div className="text-xs" style={{ color: "var(--sn-text-onnavy-muted)" }}>{body}</div>
    </div>
  );
}
