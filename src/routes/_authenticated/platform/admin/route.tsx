/**
 * Gate 3.7 · Platform administration subtree layout.
 *
 * Owns the shared guard for every `/platform/admin/*` view. Presentation only.
 */
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { usePermissions } from "@/contexts/permissions-context";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import { LoadingState } from "@/modules/platform/provisioning/components/States";
import { ADMINISTRATION_SUBNAV } from "@/modules/platform/administration/components/subnav";

export const Route = createFileRoute("/_authenticated/platform/admin")({
  component: AdministrationLayout,
});

function AdministrationLayout() {
  const { ready, has } = usePermissions();

  if (!ready) return <LoadingState label="Checking administration access" />;

  if (!has(PERMISSIONS.PLATFORM_DASHBOARD_VIEW)) {
    return (
      <div
        role="alert"
        className="m-6 flex flex-col items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-10 text-center"
      >
        <ShieldAlert className="h-6 w-6 text-destructive" aria-hidden />
        <p className="text-sm font-medium text-destructive">
          You do not have permission to view platform administration.
        </p>
        <p className="text-xs text-muted-foreground">
          Ask a platform administrator to grant {PERMISSIONS.PLATFORM_DASHBOARD_VIEW}.
        </p>
      </div>
    );
  }

  return (
    <div>
      <nav
        aria-label="Administration sections"
        className="sticky top-0 z-10 flex flex-wrap gap-1 border-b bg-background px-6 py-2"
      >
        {ADMINISTRATION_SUBNAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact }}
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted data-[status=active]:bg-muted data-[status=active]:font-medium data-[status=active]:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
