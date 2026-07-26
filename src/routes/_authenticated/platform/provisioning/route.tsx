/**
 * Gate 3.4 · Provisioning subtree layout.
 *
 * Owns the shared route guard for every `/platform/provisioning/*` view and
 * renders the section sub-navigation. Presentation only — no domain imports.
 */
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { usePermissions } from "@/contexts/permissions-context";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import { LoadingState } from "@/modules/platform/provisioning/components/States";
import { PROVISIONING_SUBNAV } from "@/modules/platform/provisioning/components/subnav";

export const Route = createFileRoute("/_authenticated/platform/provisioning")({
  component: ProvisioningLayout,
});

function ProvisioningLayout() {
  const { ready, has } = usePermissions();

  if (!ready) return <LoadingState label="Checking provisioning access" />;

  if (!has(PERMISSIONS.PLATFORM_TENANT_READ)) {
    return (
      <div
        role="alert"
        className="m-6 flex flex-col items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-10 text-center"
      >
        <ShieldAlert className="h-6 w-6 text-destructive" aria-hidden />
        <p className="text-sm font-medium text-destructive">
          You do not have permission to view tenant provisioning.
        </p>
        <p className="text-xs text-muted-foreground">
          Ask a platform administrator to grant {PERMISSIONS.PLATFORM_TENANT_READ}.
        </p>
      </div>
    );
  }

  return (
    <div>
      <nav
        aria-label="Provisioning sections"
        className="sticky top-0 z-10 flex flex-wrap gap-1 border-b bg-background px-6 py-2"
      >
        {PROVISIONING_SUBNAV.map((item) => (
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
