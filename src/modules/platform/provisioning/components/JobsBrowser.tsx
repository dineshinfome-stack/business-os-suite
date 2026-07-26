/**
 * Gate 3.4 · Shared jobs browser (filters + table + pagination + export).
 * Presentation only — reads DTOs through the dashboard hooks.
 */
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ProvisioningJobListItemDTO } from "../types";
import {
  useProvisioningExport,
  useProvisioningFilters,
  useProvisioningJobs,
} from "../hooks/useProvisioningDashboard";
import { FilterPanel } from "./FilterPanel";
import { ProvisioningTable } from "./ProvisioningTable";

export function JobsBrowser({
  onSelect,
}: {
  onSelect?: (row: ProvisioningJobListItemDTO) => void;
}) {
  const { filters, patch, searchInput, setSearchInput } = useProvisioningFilters();
  const jobs = useProvisioningJobs(filters);
  const exporter = useProvisioningExport();

  const handleExport = React.useCallback(async () => {
    const result = await exporter.mutateAsync(filters);
    if (!result.ok || !result.csv) {
      toast.error(result.message ?? "Export failed.");
      return;
    }
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `provisioning-jobs-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${result.rowCount} jobs.`);
  }, [exporter, filters]);

  return (
    <div className="space-y-4">
      <FilterPanel
        filters={filters}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onChange={patch}
        onExport={handleExport}
        exporting={exporter.isPending}
      />
      <ProvisioningTable
        rows={jobs.data?.rows ?? []}
        isLoading={jobs.isLoading}
        error={jobs.error}
        onSelect={onSelect}
      />
      {jobs.data ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {jobs.data.page} of {Math.max(jobs.data.pageCount, 1)} · {jobs.data.total}{" "}
            jobs
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={jobs.data.page <= 1}
              onClick={() => patch({ page: jobs.data!.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={jobs.data.page >= jobs.data.pageCount}
              onClick={() => patch({ page: jobs.data!.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
