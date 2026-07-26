import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { ProvisioningTable } from "@/modules/platform/provisioning/components/ProvisioningTable";
import { TenantDrawer } from "@/modules/platform/provisioning/components/TenantDrawer";
import { useProvisioningQueue } from "@/modules/platform/provisioning/hooks/useProvisioningDashboard";

export const Route = createFileRoute("/_authenticated/platform/provisioning/queue")({
  component: ProvisioningQueuePage,
  head: () => ({
    meta: [
      { title: "Provisioning Queue — Platform Administration" },
      {
        name: "description",
        content:
          "Live view of queued and running tenant provisioning jobs, refreshed on the backend-declared cadence.",
      },
      { property: "og:title", content: "Provisioning Queue — Platform Administration" },
      {
        property: "og:description",
        content: "Queued and running tenant provisioning jobs in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProvisioningQueuePage() {
  const [jobId, setJobId] = React.useState<string | null>(null);
  const queue = useProvisioningQueue();

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Live queue</h1>
          <p className="text-sm text-muted-foreground">
            Jobs the orchestrator is currently working through.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">Queued {queue.data?.queuedCount ?? 0}</Badge>
          <Badge variant="secondary">Running {queue.data?.runningCount ?? 0}</Badge>
        </div>
      </header>

      <ProvisioningTable
        rows={queue.data?.rows ?? []}
        isLoading={queue.isLoading}
        error={queue.error}
        emptyMessage="No provisioning jobs are currently running."
        onSelect={(row) => setJobId(row.jobId)}
      />
      <TenantDrawer jobId={jobId} onOpenChange={(open) => !open && setJobId(null)} />
    </div>
  );
}
