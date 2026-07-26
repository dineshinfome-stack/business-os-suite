import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ProvisioningJobListItemDTO } from "../types";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "./States";

export function ProvisioningTable({
  rows,
  isLoading,
  error,
  emptyMessage = "No provisioning jobs match the current filters.",
  onSelect,
}: {
  rows: ProvisioningJobListItemDTO[];
  isLoading?: boolean;
  error?: unknown;
  emptyMessage?: string;
  onSelect?: (row: ProvisioningJobListItemDTO) => void;
}) {
  if (isLoading) return <LoadingState label="Loading provisioning jobs" />;
  if (error) return <ErrorState error={error} />;
  if (rows.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="hidden md:table-cell">Progress</TableHead>
            <TableHead className="hidden lg:table-cell">Provider</TableHead>
            <TableHead className="hidden lg:table-cell">Attempts</TableHead>
            <TableHead className="hidden xl:table-cell">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.jobId}>
              <TableCell>
                <div className="font-medium">{row.tenantName}</div>
                <div className="text-xs text-muted-foreground">{row.tenantSlug}</div>
              </TableCell>
              <TableCell>
                <StatusBadge status={row.status} state={row.state} />
                {row.error ? (
                  <div className="mt-1 max-w-[22rem] truncate text-xs text-destructive">
                    {row.error.message}
                  </div>
                ) : null}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <ProgressBar
                  percent={row.progressPercent}
                  label={`${row.completedSteps}/${row.totalSteps} steps`}
                />
              </TableCell>
              <TableCell className="hidden lg:table-cell">{row.providerKey}</TableCell>
              <TableCell className="hidden lg:table-cell tabular-nums">
                {row.attemptCount}
              </TableCell>
              <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                {new Date(row.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {onSelect ? (
                  <Button variant="ghost" size="sm" onClick={() => onSelect(row)}>
                    Details
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      to="/platform/provisioning/$jobId"
                      params={{ jobId: row.jobId }}
                    >
                      Details
                    </Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
