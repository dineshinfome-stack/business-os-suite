/**
 * Platform Tenant Administration Dashboard — summary band.
 *
 * All counters come from the backend composition (`summary` on the tenant
 * directory page DTO). No client-side derivation over a partial page.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlatformTenantDirectorySummaryDTO } from "@/modules/platform/administration/types";

const TILES: { key: keyof PlatformTenantDirectorySummaryDTO; label: string }[] = [
  { key: "total", label: "Total tenants" },
  { key: "active", label: "Active" },
  { key: "onboarding", label: "Onboarding" },
  { key: "activationReady", label: "Activation ready" },
  { key: "blocked", label: "Blocked" },
  { key: "suspended", label: "Suspended" },
  { key: "provisioningFailures", label: "Provisioning failures" },
];

export function TenantAdminSummarySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {TILES.map((t) => (
        <Skeleton key={t.key} className="h-20 w-full" />
      ))}
    </div>
  );
}

export function TenantAdminSummary({
  summary,
}: {
  summary: PlatformTenantDirectorySummaryDTO;
}) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
      data-testid="tenant-admin-summary"
    >
      {TILES.map((tile) => (
        <Card key={tile.key}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{tile.label}</p>
            <p
              className="mt-1 text-2xl font-semibold tabular-nums"
              data-summary-key={tile.key}
            >
              {summary[tile.key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
