import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { HeaderPopover } from "./HeaderPopover";
import { useRecentPages } from "@/hooks/navigation/useRecentPages";
import { useHeader } from "@/contexts/header-context";

export function RecentPopover() {
  const { recent } = useRecentPages();
  const header = useHeader();
  const items = recent.slice(0, 10);

  return (
    <HeaderPopover id="recent" label="History" icon={Clock} variant="text" align="start">
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium text-foreground">No recent pages</div>
          <div className="text-xs text-muted-foreground">
            Pages you visit will appear here.
          </div>
        </div>
      ) : (
        <ul className="max-h-96 overflow-y-auto p-1">
          {items.map((r, i) => (
            <li key={`${r.route}-${i}`}>
              <Link
                to={r.route}
                onClick={() => header.close()}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent"
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{r.title ?? r.route}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </HeaderPopover>
  );
}
