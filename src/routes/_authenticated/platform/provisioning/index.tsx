import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/lib/generated/permission-keys";

import { SummaryCards } from "@/modules/platform/provisioning/components/SummaryCards";
import { FilterPanel } from "@/modules/platform/provisioning/components/FilterPanel";
import { ProvisioningTable } from "@/modules/platform/provisioning/components/ProvisioningTable";
import { ProviderHealthCard } from "@/modules/platform/provisioning/components/ProviderHealthCard";
import { ProvisioningWizard } from "@/modules/platform/provisioning/components/ProvisioningWizard";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";
import {
  useFailedProvisioning,
  useProviderHealth,
  useProvisioningExport,
  useProvisioningFilters,
  useProvisioningJobs,
  useProvisioningQueue,
  useProvisioningSummary,
} from "@/modules/platform/provisioning/hooks/useProvisioningDashboard";

export const Route = createFileRoute("/_authenticated/platform/provisioning/")({
  component: ProvisioningDashboardPage,
  head: () => ({
    meta: [
      { title: "Tenant Provisioning — Platform Administration" },
      {
        name: "description",
        content:
          "Monitor, retry, and roll back tenant provisioning jobs across every registered provider.",
      },
      { property: "og:title", content: "Tenant Provisioning — Platform Administration" },
      {
        property: "og:description",
        content:
          "Live provisioning queue, failure triage, and provider health for the Business OS platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProvisioningDashboardPage() {
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = React.useState(false);

  const { filters, patch, searchInput, setSearchInput } = useProvisioningFilters();
  const summary = useProvisioningSummary();
  const jobs = useProvisioningJobs(filters);
  const queue = useProvisioningQueue();
  const failed = useFailedProvisioning();
  const health = useProviderHealth();
  const exporter = useProvisioningExport();

  const openJob = (jobId: string) =>
    navigate({ to: "/platform/provisioning/$jobId", params: { jobId } });

  async function handleExport() {
    const result = await exporter.mutateAsync(filters);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.filename;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(result.message);
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tenant Provisioning</h1>
          <p className="text-sm text-muted-foreground">
            Operate the provisioning orchestrator: track live jobs, triage failures, and
            review provider health.
          </p>
        </div>
        <Can permission={PERMISSIONS.PLATFORM_TENANT_CREATE}>
          <Button onClick={() => setWizardOpen(true)}>Provision tenant</Button>
        </Can>
      </header>

      {summary.isLoading ? (
        <LoadingState label="Loading provisioning summary" />
      ) : summary.error ? (
        <ErrorState error={summary.error} />
      ) : summary.data ? (
        <SummaryCards summary={summary.data} />
      ) : null}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All jobs</TabsTrigger>
          <TabsTrigger value="queue">Live queue</TabsTrigger>
          <TabsTrigger value="failed">Failures</TabsTrigger>
          <TabsTrigger value="health">Provider health</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <FilterPanel
            filters={filters}
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            onChange={patch}
            onExport={handleExport}
            exporting={exporter.isPending}
          />
          <ProvisioningTable
            rows={jobs.data?.items ?? []}
            isLoading={jobs.isLoading}
            error={jobs.error}
            onSelect={(row) => openJob(row.jobId)}
          />
          {jobs.data ? (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {jobs.data.page} · {jobs.data.total} jobs
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={jobs.data.page <= 1}
                  onClick={() => patch({ page: jobs.data.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!jobs.data.hasMore}
                  onClick={() => patch({ page: jobs.data.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="queue">
          <ProvisioningTable
            rows={queue.data?.items ?? []}
            isLoading={queue.isLoading}
            error={queue.error}
            emptyMessage="No provisioning jobs are currently running."
            onSelect={(row) => openJob(row.jobId)}
          />
        </TabsContent>

        <TabsContent value="failed">
          <ProvisioningTable
            rows={failed.data?.items ?? []}
            isLoading={failed.isLoading}
            error={failed.error}
            emptyMessage="No failed provisioning jobs. "
            onSelect={(row) => openJob(row.jobId)}
          />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          {health.isLoading ? (
            <LoadingState label="Loading provider health" />
          ) : health.error ? (
            <ErrorState error={health.error} />
          ) : (health.data?.providers.length ?? 0) === 0 ? (
            <EmptyState message="No providers are registered." />
          ) : (
            health.data?.providers.map((provider) => (
              <ProviderHealthCard key={provider.providerKey} health={provider} />
            ))
          )}
        </TabsContent>
      </Tabs>

      <ProvisioningWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
