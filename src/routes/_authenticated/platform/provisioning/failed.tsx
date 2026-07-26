import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import { ProvisioningTable } from "@/modules/platform/provisioning/components/ProvisioningTable";
import { TenantDrawer } from "@/modules/platform/provisioning/components/TenantDrawer";
import {
  FailureDetailsDialog,
  RetryDialog,
  RollbackDialog,
} from "@/modules/platform/provisioning/components/Dialogs";
import {
  useFailedProvisioning,
  useProvisioningCommands,
} from "@/modules/platform/provisioning/hooks/useProvisioningDashboard";
import type { ProvisioningFailureDTO } from "@/modules/platform/provisioning/types";

export const Route = createFileRoute("/_authenticated/platform/provisioning/failed")({
  component: ProvisioningFailuresPage,
  head: () => ({
    meta: [
      { title: "Provisioning Failures — Platform Administration" },
      {
        name: "description",
        content:
          "Triage failed tenant provisioning jobs: inspect the failing step, retry, or roll back released resources.",
      },
      { property: "og:title", content: "Provisioning Failures — Platform Administration" },
      {
        property: "og:description",
        content: "Failure triage for tenant provisioning with retry and rollback recovery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProvisioningFailuresPage() {
  const failed = useFailedProvisioning();
  const { retry, rollback } = useProvisioningCommands();
  const [selected, setSelected] = React.useState<ProvisioningFailureDTO | null>(null);
  const [drawerJobId, setDrawerJobId] = React.useState<string | null>(null);
  const [dialog, setDialog] = React.useState<null | "retry" | "rollback" | "details">(
    null,
  );

  const close = () => setDialog(null);

  async function run(kind: "retry" | "rollback") {
    if (!selected) return;
    const result =
      kind === "retry"
        ? await retry.mutateAsync(selected.jobId)
        : await rollback.mutateAsync(selected.jobId);
    close();
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Failure triage</h1>
        <p className="text-sm text-muted-foreground">
          Provisioning jobs that ended in a failed state, with recovery actions.
        </p>
      </header>

      <ProvisioningTable
        rows={failed.data ?? []}
        isLoading={failed.isLoading}
        error={failed.error}
        emptyMessage="No failed provisioning jobs."
        onSelect={(row) => setDrawerJobId(row.jobId)}
      />

      {(failed.data ?? []).length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {(failed.data ?? []).map((row) => (
            <li
              key={row.jobId}
              className="flex flex-wrap items-center justify-between gap-3 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{row.tenantName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.failedStepKey ?? "unknown step"} · rollback {row.rollbackState}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelected(row);
                    setDialog("details");
                  }}
                >
                  Details
                </Button>
                <Can permission={PERMISSIONS.PLATFORM_TENANT_UPDATE}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!row.retryable || retry.isPending}
                    onClick={() => {
                      setSelected(row);
                      setDialog("retry");
                    }}
                  >
                    Retry
                  </Button>
                </Can>
                <Can permission={PERMISSIONS.PLATFORM_TENANT_ARCHIVE}>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={rollback.isPending}
                    onClick={() => {
                      setSelected(row);
                      setDialog("rollback");
                    }}
                  >
                    Rollback
                  </Button>
                </Can>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <RetryDialog
        open={dialog === "retry"}
        onOpenChange={(open) => !open && close()}
        pending={retry.isPending}
        correlationId={selected?.correlationId ?? "—"}
        onConfirm={() => run("retry")}
      />
      <RollbackDialog
        open={dialog === "rollback"}
        onOpenChange={(open) => !open && close()}
        pending={rollback.isPending}
        correlationId={selected?.correlationId ?? "—"}
        onConfirm={() => run("rollback")}
      />
      <FailureDetailsDialog
        open={dialog === "details"}
        onOpenChange={(open) => !open && close()}
        error={selected?.error ?? null}
        stepKey={selected?.failedStepKey ?? null}
      />
      <TenantDrawer
        jobId={drawerJobId}
        onOpenChange={(open) => !open && setDrawerJobId(null)}
      />
    </div>
  );
}
