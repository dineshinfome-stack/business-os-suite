import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  settings: "Settings",
};

function toLabel(segment: string): string {
  return LABELS[segment] ?? segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumb() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground">
        Home
      </Link>
      {parts.map((part, idx) => {
        const href = "/" + parts.slice(0, idx + 1).join("/");
        const isLast = idx === parts.length - 1;
        return (
          <span key={href} className="flex items-center">
            <ChevronRight className="mx-1 h-3.5 w-3.5" aria-hidden />
            {isLast ? (
              <span className="text-foreground">{toLabel(part)}</span>
            ) : (
              <span>{toLabel(part)}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
