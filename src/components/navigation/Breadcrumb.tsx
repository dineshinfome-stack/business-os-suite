import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { useBreadcrumbs } from "@/hooks/navigation/useBreadcrumbs";

export function Breadcrumb() {
  const crumbs = useBreadcrumbs();
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
      <Link to="/dashboard" className="flex items-center hover:text-foreground" aria-label="Home">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((c, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={c.id} className="flex items-center">
            <ChevronRight className="mx-1 h-3.5 w-3.5" aria-hidden />
            {isLast || !c.route ? (
              <span className={isLast ? "text-foreground" : undefined}>{c.title}</span>
            ) : (
              <Link to={c.route} className="hover:text-foreground">
                {c.title}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
