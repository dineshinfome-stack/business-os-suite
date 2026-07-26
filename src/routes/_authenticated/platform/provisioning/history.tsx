import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";

import { JobsBrowser } from "@/modules/platform/provisioning/components/JobsBrowser";
import { TenantDrawer } from "@/modules/platform/provisioning/components/TenantDrawer";

export const Route = createFileRoute("/_authenticated/platform/provisioning/history")({
  component: ProvisioningHistoryPage,
  head: () => ({
    meta: [
      { title: "Provisioning History — Platform Administration" },
      {
        name: "description",
        content:
          "Search, filter, and export the full history of tenant provisioning jobs across every provider.",
      },
      { property: "og:title", content: "Provisioning History — Platform Administration" },
      {
        property: "og:description",
        content: "Full searchable history of tenant provisioning jobs with CSV export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProvisioningHistoryPage() {
  const [jobId, setJobId] = React.useState<string | null>(null);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Provisioning history</h1>
        <p className="text-sm text-muted-foreground">
          Every provisioning job ever recorded, with filters and CSV export.
        </p>
      </header>
      <JobsBrowser onSelect={(row) => setJobId(row.jobId)} />
      <TenantDrawer jobId={jobId} onOpenChange={(open) => !open && setJobId(null)} />
    </div>
  );
}
