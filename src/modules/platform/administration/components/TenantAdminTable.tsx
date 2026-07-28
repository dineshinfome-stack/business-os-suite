/**
 * Platform Tenant Administration Dashboard — unified tenant table.
 *
 * Renders exactly the page returned by the backend directory read model.
 * No client-side filtering, sorting or pagination.
 */
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

export type TenantAdminSortBy =
  | "displayName"
  | "createdAt"
  | "updatedAt"
  | "lifecycleState"
  | "onboardingProgress"
  | "readinessBlockers";

const label = (value: string) => value.replace(/_/g, " ");

function lifecycleVariant(state: string) {
  if (state === "active") return "default";
  if (state === "suspended") return "secondary";
  return "outline";
}

function provisioningVariant(status: string) {
  if (status === "provisioned") return "default";
  if (status === "failed") return "destructive";
  return "outline";
}

function readinessVariant(status: string) {
  if (status === "ready") return "default";
  if (status === "blocked") return "destructive";
  return "secondary";
}

function SortHeader({
  children,
  column,
  sortBy,
  sortDir,
  onSort,
}: {
  children: React.ReactNode;
  column: TenantAdminSortBy;
  sortBy: TenantAdminSortBy;
  sortDir: "asc" | "desc";
  onSort: (column: TenantAdminSortBy) => void;
}) {
  const active = sortBy === column;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 px-2"
      onClick={() => onSort(column)}
      aria-label={`Sort by ${column}`}
    >
      {children}
      {active &&
        (sortDir === "asc" ? (
          <ArrowUp className="ml-1 h-3 w-3" aria-hidden />
        ) : (
          <ArrowDown className="ml-1 h-3 w-3" aria-hidden />
        ))}
    </Button>
  );
}

export function TenantAdminTable({
  rows,
  sortBy,
  sortDir,
  onSort,
}: {
  rows: PlatformTenantOperationsRowDTO[];
  sortBy: TenantAdminSortBy;
  sortDir: "asc" | "desc";
  onSort: (column: TenantAdminSortBy) => void;
}) {
  if (rows.length === 0) {
    return <EmptyState message="No tenants match the current filters." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table data-testid="tenant-admin-table">
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortHeader
                column="displayName"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              >
                Tenant
              </SortHeader>
            </TableHead>
            <TableHead>
              <SortHeader
                column="lifecycleState"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              >
                Lifecycle
              </SortHeader>
            </TableHead>
            <TableHead>Provisioning</TableHead>
            <TableHead>Onboarding</TableHead>
            <TableHead className="w-40">
              <SortHeader
                column="onboardingProgress"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              >
                Progress
              </SortHeader>
            </TableHead>
            <TableHead>Readiness</TableHead>
            <TableHead>
              <SortHeader
                column="readinessBlockers"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              >
                Blockers
              </SortHeader>
            </TableHead>
            <TableHead>Invitation</TableHead>
            <TableHead className="whitespace-nowrap">Org / Branch</TableHead>
            <TableHead>
              <SortHeader
                column="createdAt"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={onSort}
              >
                Created
              </SortHeader>
            </TableHead>
            <TableHead className="text-right">Open</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} data-tenant-id={row.id}>
              <TableCell>
                <Link
                  to="/platform/tenants/$tenantId"
                  params={{ tenantId: row.id }}
                  className="font-medium text-primary hover:underline"
                >
                  {row.displayName}
                </Link>
                <p className="font-mono text-xs text-muted-foreground">{row.slug}</p>
              </TableCell>
              <TableCell>
                <Badge variant={lifecycleVariant(row.lifecycleState) as never}>
                  {label(row.lifecycleState)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={provisioningVariant(row.provisioningStatus) as never}>
                  {label(row.provisioningStatus)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{label(row.onboardingState)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={row.onboardingProgressPercent} className="h-2 w-20" />
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {row.onboardingProgressPercent}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={readinessVariant(row.readinessStatus) as never}>
                  {label(row.readinessStatus)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm tabular-nums">
                {row.readinessBlockingCount > 0 ? (
                  <span className="font-medium text-destructive">
                    {row.readinessBlockingCount}
                  </span>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
                {row.readinessWarningCount > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({row.readinessWarningCount} warn)
                  </span>
                )}
              </TableCell>
              <TableCell className="text-sm">{label(row.invitationStatus)}</TableCell>
              <TableCell className="text-sm tabular-nums">
                {row.organizationCount} / {row.branchCount}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {new Date(row.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/platform/tenants/$tenantId" params={{ tenantId: row.id }}>
                    Open
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
