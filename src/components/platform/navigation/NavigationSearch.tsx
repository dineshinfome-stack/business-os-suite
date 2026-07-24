import * as React from "react";
import { Search, X } from "lucide-react";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";

interface Props {
  value: string;
  onChange: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function NavigationSearch({ value, onChange, inputRef }: Props) {
  const palette = useCommandPalette();
  return (
    <div className="px-3 pt-3">
      <div
        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 ring-1 focus-within:ring-2"
        style={{
          background: "var(--nav-input-bg)",
          boxShadow: "inset 0 0 0 1px var(--nav-border)",
        }}
      >
        <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--nav-fg-muted)" }} />
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
          placeholder="Search menus…"
          aria-label="Search navigation"
          className="w-full bg-transparent text-sm outline-none placeholder:opacity-60"
          style={{ color: "var(--nav-fg-strong)" }}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("")}
            className="opacity-70 hover:opacity-100"
            style={{ color: "var(--nav-fg)" }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd
            className="hidden rounded px-1.5 py-0.5 text-[10px] font-medium sm:inline-block"
            style={{ background: "var(--nav-hover)", color: "var(--nav-fg-muted)" }}
          >
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  );
}
