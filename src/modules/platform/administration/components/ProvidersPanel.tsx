/**
 * Gate 3.7 · Provider & region visibility (read-only, environment-backed).
 */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  PlatformProviderSummaryDTO,
  PlatformRegionSummaryDTO,
} from "@/modules/platform/administration/types";

export function ProviderCards({
  providers,
}: {
  providers: PlatformProviderSummaryDTO[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {providers.map((p) => (
        <Card key={p.providerKey}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{p.displayName}</CardTitle>
            <Badge variant={p.configured ? "secondary" : "destructive"}>
              {p.configured ? "configured" : "not configured"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">{p.message}</p>
            <dl className="grid grid-cols-2 gap-1 text-xs">
              <dt className="text-muted-foreground">Jobs</dt>
              <dd className="tabular-nums">{p.totalJobs}</dd>
              <dt className="text-muted-foreground">Succeeded</dt>
              <dd className="tabular-nums">{p.successCount}</dd>
              <dt className="text-muted-foreground">Failed</dt>
              <dd className="tabular-nums">{p.failureCount}</dd>
              <dt className="text-muted-foreground">Success rate</dt>
              <dd className="tabular-nums">
                {p.successRate == null ? "—" : `${Math.round(p.successRate * 100)}%`}
              </dd>
              <dt className="text-muted-foreground">Avg duration</dt>
              <dd className="tabular-nums">
                {p.averageDurationMs == null
                  ? "—"
                  : `${Math.round(p.averageDurationMs / 1000)}s`}
              </dd>
              <dt className="text-muted-foreground">Default region</dt>
              <dd>{p.defaultRegion ?? "—"}</dd>
            </dl>
            <div className="flex flex-wrap gap-1">
              {p.capabilities.map((c) => (
                <Badge key={c} variant="outline">
                  {c}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Configuration source: {p.configurationSource} · read-only in this console.
              Statistics are historical; no live probe exists.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RegionTable({ regions }: { regions: PlatformRegionSummaryDTO[] }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Region</TableHead>
            <TableHead>Tenants</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Failed provisioning</TableHead>
            <TableHead>Default</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regions.map((r) => (
            <TableRow key={r.region}>
              <TableCell className="font-medium">{r.region}</TableCell>
              <TableCell className="tabular-nums">{r.tenantCount}</TableCell>
              <TableCell className="tabular-nums">{r.activeTenantCount}</TableCell>
              <TableCell className="tabular-nums">{r.failedProvisioningCount}</TableCell>
              <TableCell>{r.isDefault ? <Badge>default</Badge> : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
