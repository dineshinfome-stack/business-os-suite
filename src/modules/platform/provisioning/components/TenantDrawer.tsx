/**
 * Gate 3.4 · Tenant provisioning drawer.
 * Quick-look detail for a selected row without leaving the list view.
 */
import { Link } from "@tanstack/react-router";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useProvisioningJob } from "../hooks/useProvisioningDashboard";
import { ProgressBar } from "./ProgressBar";
import { ProvisioningTimeline } from "./ProvisioningTimeline";
import { StatusBadge } from "./StatusBadge";
import { ErrorState, LoadingState } from "./States";

export function TenantDrawer({
  jobId,
  onOpenChange,
}: {
  jobId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={jobId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {jobId ? <DrawerBody jobId={jobId} /> : null}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({ jobId }: { jobId: string }) {
  const job = useProvisioningJob(jobId, { poll: true });

  if (job.isLoading) return <LoadingState label="Loading provisioning job" />;
  if (job.error) return <ErrorState error={job.error} />;
  if (!job.data) return null;

  const detail = job.data;

  return (
    <div className="space-y-6 p-1">
      <SheetHeader className="p-0">
        <SheetTitle>{detail.tenantName}</SheetTitle>
        <SheetDescription>
          {detail.tenantSlug} · {detail.providerKey} · {detail.region}
        </SheetDescription>
      </SheetHeader>

      <div className="flex items-center gap-2">
        <StatusBadge status={detail.status} state={detail.state} />
        <span className="text-xs text-muted-foreground">
          Attempt {detail.attemptCount}
        </span>
      </div>

      <ProgressBar
        percent={detail.progressPercent}
        label={`${detail.completedSteps} of ${detail.totalSteps} steps complete`}
      />

      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent activity
        </h3>
        <ProvisioningTimeline entries={detail.timeline.slice(0, 6)} />
      </section>

      <Button asChild className="w-full">
        <Link to="/platform/provisioning/$jobId" params={{ jobId }}>
          Open full job detail
        </Link>
      </Button>
    </div>
  );
}
