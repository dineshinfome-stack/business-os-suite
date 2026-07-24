import { PanelLeft, PanelLeftClose } from "lucide-react";

interface Props {
  variant: "platform" | "tenant";
  contextLabel: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/**
 * Board Rec 5 — sidebar header shows brand + current context. In multi-company
 * futures, contextLabel switches with the active tenant/company.
 */
export function SidebarHeader({ variant, contextLabel, collapsed, onToggleCollapsed }: Props) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5"
      style={{ borderBottom: "1px solid var(--nav-border)" }}
    >
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <div
            className="flex items-center gap-1 text-xs font-semibold tracking-tight"
            style={{ color: "var(--nav-fg-strong)" }}
          >
            <span>business</span>
            <span style={{ color: "var(--brand-red)" }}>os</span>
          </div>
          <div
            className="mt-0.5 flex items-center gap-1.5 text-[10px]"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--brand-success)" }}
            />
            <span className="truncate">{contextLabel}</span>
          </div>
        </div>
      )}
      <button
        type="button"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onToggleCollapsed}
        className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded"
        style={{ color: "var(--nav-fg-muted)" }}
        data-variant={variant}
      >
        {collapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
