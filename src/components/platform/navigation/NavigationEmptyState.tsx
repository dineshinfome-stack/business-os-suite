import { SearchX, Command, Globe, LifeBuoy } from "lucide-react";
import { useCommandPalette } from "@/hooks/navigation/useCommandPalette";

interface Props {
  query: string;
}

export function NavigationEmptyState({ query }: Props) {
  const palette = useCommandPalette();
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <SearchX className="h-5 w-5" style={{ color: "var(--platform-sidebar-muted)" }} />
      </div>
      <div>
        <div className="text-sm font-medium text-white">No pages found</div>
        <div className="mt-0.5 text-xs" style={{ color: "var(--platform-sidebar-muted)" }}>
          {query ? `Nothing matches “${query}”.` : "Try a different term."}
        </div>
      </div>
      <div className="mt-1 flex flex-col gap-1 text-xs">
        <button
          type="button"
          onClick={() => palette.setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-white/85 hover:bg-white/5"
        >
          <Command className="h-3.5 w-3.5" /> Open command palette
        </button>
        <button
          type="button"
          onClick={() => palette.setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-white/85 hover:bg-white/5"
        >
          <Globe className="h-3.5 w-3.5" /> Search globally
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-white/85 hover:bg-white/5"
        >
          <LifeBuoy className="h-3.5 w-3.5" /> Help
        </button>
      </div>
    </div>
  );
}
