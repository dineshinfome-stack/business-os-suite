import * as React from "react";
import { Filter, X } from "lucide-react";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";

interface Props {
  value: string;
  onChange: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** Optional icon buttons rendered to the right of the filter input. */
  actions?: React.ReactNode;
  placeholder?: string;
}

export function NavigationSearch({
  value,
  onChange,
  inputRef,
  actions,
  placeholder = "Filter",
}: Props) {
  const palette = useCommandPalette();
  return (
    <div className="px-3 pt-3">
      <div className="flex items-center gap-1.5">
        <div
          className="flex flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5 focus-within:ring-2"
          style={{
            background: "var(--nav-input-bg)",
            borderColor: "color-mix(in srgb, var(--nav-border) 40%, transparent)",
          }}
        >
          <Filter className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--nav-fg-muted)" }} />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                palette.setOpen(true);
              }
            }}
            placeholder={placeholder}
            aria-label="Filter navigation"
            className="w-full bg-transparent text-sm outline-none placeholder:opacity-60"
            style={{ color: "var(--nav-fg-strong)" }}
          />
          {value ? (
            <button
              type="button"
              aria-label="Clear filter"
              onClick={() => onChange("")}
              className="opacity-70 hover:opacity-100"
              style={{ color: "var(--nav-fg)" }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        {actions}
      </div>
    </div>
  );
}
