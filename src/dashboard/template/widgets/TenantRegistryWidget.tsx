/**
 * Phase 2 Gate 4 — Tenant Registry dashboard widget.
 *
 * Presentation only. Reads platform-wide tenant registry statistics from the
 * existing `getTenantRegistryStats` server function and renders them inside
 * the shared dashboard `WidgetCard`. No mutations, no provisioning, no
 * lifecycle actions, no polling / realtime.
 */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RotateCw } from "lucide-react";

import { WidgetCard } from "@/components/dashboard/WidgetCard";
import { Alert, AlertDescription, AlertTitle, Button, CardSkeleton, NoData } from "@/components/common";
import { registerDashboardWidget } from "@/dashboard/template/registry";
import { getTenantRegistryStats } from "@/lib/tenants/tenants.functions";

export const TENANT_REGISTRY_WIDGET_ID = "platform.tenant.registry";

const numberFormatter = new Intl.NumberFormat();

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className="mt-1 text-2xl font-semibold tabular-nums text-foreground"
        aria-label={`${label}: ${value}`}
      >
        {numberFormatter.format(value)}
      </dd>
    </div>
  );
}

export function TenantRegistryWidget() {
  const statsFn = useServerFn(getTenantRegistryStats);

  const query = useQuery({
    queryKey: ["platform", "tenant-registry", "stats"],
    queryFn: () => statsFn(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  return (
    <WidgetCard
      title="Tenant Registry"
      description="Platform-wide tenant overview"
      className="sm:col-span-2 lg:col-span-4"
    >
      {query.isPending ? (
        <CardSkeleton />
      ) : query.isError ? (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Unable to load tenant statistics.</AlertTitle>
          <AlertDescription className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
            >
              <RotateCw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : !query.data || query.data.total === 0 ? (
        <NoData
          title="No tenant statistics available."
          description="Tenants registered on this platform will appear here."
        />
      ) : (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total tenants" value={query.data.total} />
          <StatTile label="Active" value={query.data.byLifecycle.active ?? 0} />
          <StatTile label="Draft" value={query.data.byLifecycle.created ?? 0} />
          <StatTile label="Suspended" value={query.data.byLifecycle.suspended ?? 0} />
          <StatTile label="Archived" value={query.data.byLifecycle.archived ?? 0} />
          <StatTile label="Provisioned" value={query.data.byProvisioning.provisioned ?? 0} />
          <StatTile label="Pending provisioning" value={query.data.byProvisioning.in_progress ?? 0} />
          <StatTile label="Failed provisioning" value={query.data.byProvisioning.failed ?? 0} />
        </dl>
      )}
    </WidgetCard>
  );
}

registerDashboardWidget({
  id: TENANT_REGISTRY_WIDGET_ID,
  title: "Tenant Registry",
  component: TenantRegistryWidget,
  permission: "platform.dashboard.view",
});
