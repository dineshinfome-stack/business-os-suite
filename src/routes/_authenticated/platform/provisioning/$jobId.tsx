import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { JobDetailPanel } from "@/modules/platform/provisioning/components/JobDetailPanel";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";
import { useProvisioningJob } from "@/modules/platform/provisioning/hooks/useProvisioningDashboard";
import { useProvisioningEvents } from "@/modules/platform/provisioning/hooks/useProvisioningEvents";

export const Route = createFileRoute("/_authenticated/platform/provisioning/$jobId")({
  component: ProvisioningJobPage,
  head: () => ({
    meta: [
      { title: "Provisioning Job — Platform Administration" },
      {
        name: "description",
        content:
          "Inspect provisioning step progress, activity timeline, and recovery actions for a tenant provisioning job.",
      },
      { property: "og:title", content: "Provisioning Job — Platform Administration" },
      {
        property: "og:description",
        content: "Step-by-step provisioning progress and recovery actions for a tenant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProvisioningJobPage() {
  const { jobId } = Route.useParams();
  const { status: liveStatus } = useProvisioningEvents(jobId, true);
  const job = useProvisioningJob(jobId, { poll: liveStatus !== "live" });

  return (
    <div className="space-y-6 p-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/platform/provisioning">← Back to provisioning</Link>
      </Button>

      {job.isLoading ? (
        <LoadingState label="Loading provisioning job" />
      ) : job.error ? (
        <ErrorState error={job.error} />
      ) : job.data ? (
        <JobDetailPanel job={job.data} liveStatus={liveStatus} />
      ) : null}
    </div>
  );
}
