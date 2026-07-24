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
  children: React.ReactNode;
}

/**
 * Board Rec 4 — generic header popover used by Favorites, Recent, and future
 * Notifications/Tasks/AI slots. Single-open behavior via HeaderProvider.
 */
export function HeaderPopover({
  id,
  label,
  icon: Icon,
  badge,
  align = "end",
  contentClassName,
  children,
}: Props) {
  const header = useHeader();
  const open = header.isOpen(id);

  return (
    <Popover open={open} onOpenChange={(next) => header.setOpen(id, next)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
          data-state={open ? "open" : "closed"}
        >
          <Icon className="h-4 w-4" />
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
