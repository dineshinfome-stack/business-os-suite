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
        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 ring-1 ring-white/5 focus-within:ring-white/15"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--platform-sidebar-muted)" }} />
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
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("")}
            className="text-white/60 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd
            className="hidden rounded px-1.5 py-0.5 text-[10px] font-medium text-white/60 sm:inline-block"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  );
}
