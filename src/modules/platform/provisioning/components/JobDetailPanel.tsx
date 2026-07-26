import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import type { ProvisioningJobDetailDTO } from "../types";
import { useProvisioningCommands } from "../hooks/useProvisioningDashboard";
import { ProgressBar } from "./ProgressBar";
import { ProvisioningTimeline } from "./ProvisioningTimeline";
import { StatusBadge } from "./StatusBadge";

export function JobDetailPanel({
  job,
  liveStatus,
}: {
  job: ProvisioningJobDetailDTO;
  liveStatus: string;
}) {
  const { retry, advance, cancel, rollback } = useProvisioningCommands();
  const [confirm, setConfirm] = React.useState<null | "retry" | "rollback" | "cancel">(
    null,
  );
  const [reason, setReason] = React.useState("Cancelled by platform administrator");

  const run = async (action: "retry" | "rollback" | "cancel") => {
    const result =
      action === "retry"
        ? await retry.mutateAsync(job.jobId)
        : action === "rollback"
          ? await rollback.mutateAsync(job.jobId)
          : await cancel.mutateAsync({ jobId: job.jobId, reason });
    setConfirm(null);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{job.tenantName}</h2>
          <p className="text-sm text-muted-foreground">
            {job.tenantSlug} · {job.providerKey} · {job.region}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {liveStatus === "live" ? "Live updates" : `Updates: ${liveStatus}`}
          </Badge>
          <StatusBadge status={job.status} state={job.state} />
        </div>
      </div>

      <ProgressBar
        percent={job.progressPercent}
        label={`${job.completedSteps} of ${job.totalSteps} steps complete`}
      />

      <dl className="grid gap-4 rounded-lg border p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Correlation ID</dt>
          <dd className="break-all font-mono text-xs">{job.correlationId}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Attempts</dt>
          <dd className="tabular-nums">{job.attemptCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Rollback</dt>
          <dd className="capitalize">{job.rollbackState}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Current step</dt>
          <dd>{job.currentStepKey ?? "—"}</dd>
        </div>
      </dl>

      {job.error ? (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            {job.error.code} — {job.error.message}
          </p>
          <p className="text-xs text-muted-foreground">
            {job.error.retryable ? "This failure is retryable." : "This failure is not retryable."}
          </p>
        </div>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Steps
        </h3>
        <ul className="divide-y rounded-lg border">
          {job.steps.map((step) => (
            <li key={step.stepKey} className="flex items-center justify-between gap-4 p-3">
              <div>
                <p className="text-sm font-medium">{step.label}</p>
                {step.error ? (
                  <p className="text-xs text-destructive">{step.error.message}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {step.durationMs !== null ? <span>{Math.round(step.durationMs / 1000)}s</span> : null}
                <Badge variant="outline" className="capitalize">
                  {step.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Activity timeline
        </h3>
        <ProvisioningTimeline entries={job.timeline} />
      </section>

      <div className="flex flex-wrap gap-2">
        <Can permission={PERMISSIONS.PLATFORM_TENANT_UPDATE}>
          <Button
            variant="outline"
            disabled={!job.retryable || retry.isPending}
            onClick={() => setConfirm("retry")}
          >
            Retry
          </Button>
          <Button
            variant="outline"
            disabled={job.terminal || advance.isPending}
            onClick={() => advance.mutateAsync(job.jobId)}
          >
            Run next step
          </Button>
          <Button
            variant="outline"
            disabled={job.terminal || cancel.isPending}
            onClick={() => setConfirm("cancel")}
          >
            Cancel
          </Button>
        </Can>
        <Can permission={PERMISSIONS.PLATFORM_TENANT_ARCHIVE}>
          <Button
            variant="destructive"
            disabled={rollback.isPending}
            onClick={() => setConfirm("rollback")}
          >
            Rollback
          </Button>
        </Can>
      </div>

      <Dialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{confirm} provisioning job</DialogTitle>
            <DialogDescription>
              This action is executed by the provisioning orchestrator and is recorded
              against correlation {job.correlationId}.
            </DialogDescription>
          </DialogHeader>
          {confirm === "cancel" ? (
            <Textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              aria-label="Cancellation reason"
            />
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Keep as is
            </Button>
            <Button onClick={() => confirm && run(confirm)}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
