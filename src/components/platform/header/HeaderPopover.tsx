import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useHeader } from "@/contexts/header-context";

interface Props {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  align?: "start" | "center" | "end";
  contentClassName?: string;
  variant?: "icon" | "text";
  children: React.ReactNode;
}

/**
 * Board Rec 4 — generic header popover used by Favorites, Recent, and future
 * Notifications/Tasks/AI slots. Single-open behavior via HeaderProvider.
 * `variant="text"` renders a ServiceNow-style labeled trigger (used in the
 * start area next to All); `variant="icon"` is the compact end-area form.
 */
export function HeaderPopover({
  id,
  label,
  icon: Icon,
  badge,
  align = "end",
  contentClassName,
  variant = "icon",
  children,
}: Props) {
  const header = useHeader();
  const open = header.isOpen(id);
  const isText = variant === "text";

  return (
    <Popover open={open} onOpenChange={(next) => header.setOpen(id, next)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          className={
            isText
              ? "relative inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent data-[state=open]:bg-accent"
              : "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
          }
          data-state={open ? "open" : "closed"}
        >
          <Icon className={isText ? "h-3.5 w-3.5" : "h-4 w-4"} />
          {isText && <span>{label}</span>}
          {typeof badge === "number" && badge > 0 && (
            <span
              className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white"
              style={{ background: "var(--brand-red)" }}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={8}
        className={contentClassName ?? "w-80 p-0"}
      >
        <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        {children}
      </PopoverContent>
    </Popover>
  );
}
