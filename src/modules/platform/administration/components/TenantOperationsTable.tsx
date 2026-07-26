/**
 * Gate 3.7 · Tenant operations directory (composition over the tenant registry).
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/modules/platform/provisioning/components/States";
import type { PlatformTenantOperationsRowDTO } from "@/modules/platform/administration/types";

export function TenantOperationsTable({
  rows,
}: {
  rows: PlatformTenantOperationsRowDTO[];
}) {
  if (rows.length === 0) {
    return <EmptyState message="No tenants match the current filters." />;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Lifecycle</TableHead>
            <TableHead>Provisioning</TableHead>
            <TableHead>Attention</TableHead>
            <TableHead>Last activity</TableHead>
            <TableHead className="text-right">Open</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <p className="font-medium">{row.displayName}</p>
                <p className="text-xs text-muted-foreground">{row.slug}</p>
              </TableCell>
              <TableCell className="text-sm">{row.region}</TableCell>
              <TableCell>
                <Badge variant="secondary">{row.lifecycleState}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{row.provisioningStatus}</Badge>
              </TableCell>
              <TableCell>
                {row.attentionCount > 0 ? (
                  <Badge variant="destructive">
                    {row.attentionCount} · {row.highestSeverity}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">clear</span>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {row.lastActivityAt
                  ? new Date(row.lastActivityAt).toLocaleString()
                  : "—"}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/platform/tenants/$tenantId" params={{ tenantId: row.id }}>
                    Tenant record
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
