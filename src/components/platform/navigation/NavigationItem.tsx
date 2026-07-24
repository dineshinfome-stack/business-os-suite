import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Star, MoreVertical, ExternalLink, Link2, Bookmark } from "lucide-react";
import type { NavNode } from "@/lib/navigation/tree";
import { toast } from "sonner";

interface Props {
  node: NavNode;
  active: boolean;
  depth?: number;
  badge?: number;
  pinned: boolean;
  onTogglePin: (id: string) => void;
  onNavigate?: () => void;
}

export function NavigationItem({
  node,
  active,
  depth = 0,
  badge,
  pinned,
  onTogglePin,
  onNavigate,
}: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const Icon = node.icon;
  const paddingLeft = 12 + depth * 14;

  const inner = (
    <>
      {active && (
        <span
          aria-hidden
          className="absolute inset-y-1 left-0 w-[3px] rounded-r"
          style={{ background: "var(--brand-red)" }}
        />
      )}
      {Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
      )}
      <span className="flex-1 truncate text-sm">{node.title}</span>
      {typeof badge === "number" && badge > 0 && (
        <span
          className="inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white"
          style={{ background: "var(--brand-red)" }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </>
  );

  const rowStyle: React.CSSProperties = {
    background: active ? "rgba(255,255,255,0.06)" : "transparent",
    color: active ? "#fff" : "rgba(255,255,255,0.82)",
    paddingLeft,
  };

  return (
    <div
      role="treeitem"
      aria-selected={active}
      className="group relative flex items-center pr-1"
    >
      {node.route ? (
        <Link
          to={node.route}
          onClick={onNavigate}
          className="relative flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 pr-1 transition-colors hover:bg-white/5"
          style={rowStyle}
        >
          {inner}
        </Link>
      ) : (
        <div
          className="relative flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 pr-1"
          style={rowStyle}
        >
          {inner}
        </div>
      )}

      {/* Right-side actions (star + more) */}
      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 data-[open=true]:opacity-100" data-open={menuOpen}>
        <button
          type="button"
          aria-label={pinned ? "Unpin" : "Pin"}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(node.id);
          }}
          className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-white/10"
        >
          <Star
            className="h-3.5 w-3.5"
            style={{ color: pinned ? "var(--sn-accent-yellow, #ffb703)" : "rgba(255,255,255,0.55)" }}
            fill={pinned ? "currentColor" : "none"}
          />
        </button>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="More actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-white/10"
          >
            <MoreVertical className="h-3.5 w-3.5 text-white/70" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-md shadow-2xl"
              style={{
                background: "var(--platform-sidebar-bg)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            >
              {node.route && (
                <>
                  <MenuAction
                    label="Open"
                    icon={<ExternalLink className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setMenuOpen(false);
                      onNavigate?.();
                    }}
                    asLink={node.route}
                  />
                  <MenuAction
                    label="Open in new tab"
                    icon={<ExternalLink className="h-3.5 w-3.5" />}
                    onClick={() => {
                      window.open(node.route!, "_blank", "noopener");
                      setMenuOpen(false);
                    }}
                  />
                  <MenuAction
                    label="Copy link"
                    icon={<Link2 className="h-3.5 w-3.5" />}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.origin + node.route!);
                        toast.success("Link copied");
                      } catch {
                        toast.error("Could not copy link");
                      }
                      setMenuOpen(false);
                    }}
                  />
                </>
              )}
              <MenuAction
                label={pinned ? "Unpin" : "Pin"}
                icon={<Bookmark className="h-3.5 w-3.5" />}
                onClick={() => {
                  onTogglePin(node.id);
                  setMenuOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuAction({
  label,
  icon,
  onClick,
  asLink,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  asLink?: string;
}) {
  const cls =
    "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-white/85 hover:bg-white/5";
  if (asLink) {
    return (
      <Link to={asLink} onClick={onClick} className={cls} role="menuitem">
        {icon}
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls} role="menuitem">
      {icon}
      {label}
    </button>
  );
}
