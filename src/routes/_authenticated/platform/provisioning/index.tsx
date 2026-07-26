import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/lib/generated/permission-keys";

import { SummaryCards } from "@/modules/platform/provisioning/components/SummaryCards";
import { ProvisioningTable } from "@/modules/platform/provisioning/components/ProvisioningTable";
import { ProvisioningWizard } from "@/modules/platform/provisioning/components/ProvisioningWizard";
import { TenantDrawer } from "@/modules/platform/provisioning/components/TenantDrawer";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";
import {
  DEFAULT_LIST_QUERY,
  useFailedProvisioning,
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

const RECENT_QUERY = { ...DEFAULT_LIST_QUERY, pageSize: 10 };

function ProvisioningDashboardPage() {
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [drawerJobId, setDrawerJobId] = React.useState<string | null>(null);

  const summary = useProvisioningSummary();
  const recent = useProvisioningJobs(RECENT_QUERY);
  const queue = useProvisioningQueue();
  const failed = useFailedProvisioning();

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

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Running now ({queue.data?.runningCount ?? 0})
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/platform/provisioning/queue">View live queue</Link>
          </Button>
        </div>
        <ProvisioningTable
          rows={(queue.data?.rows ?? []).slice(0, 5)}
          isLoading={queue.isLoading}
          error={queue.error}
          emptyMessage="No provisioning jobs are currently running."
          onSelect={(row) => setDrawerJobId(row.jobId)}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Needs attention ({failed.data?.length ?? 0})
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/platform/provisioning/failed">Open failure triage</Link>
          </Button>
        </div>
        <ProvisioningTable
          rows={(failed.data ?? []).slice(0, 5)}
          isLoading={failed.isLoading}
          error={failed.error}
          emptyMessage="No failed provisioning jobs."
          onSelect={(row) => setDrawerJobId(row.jobId)}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent jobs
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/platform/provisioning/history">View full history</Link>
          </Button>
        </div>
        <ProvisioningTable
          rows={recent.data?.rows ?? []}
          isLoading={recent.isLoading}
          error={recent.error}
          onSelect={(row) => setDrawerJobId(row.jobId)}
        />
      </section>

      <ProvisioningWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      <TenantDrawer
        jobId={drawerJobId}
        onOpenChange={(open) => !open && setDrawerJobId(null)}
      />
    </div>
  );
}
