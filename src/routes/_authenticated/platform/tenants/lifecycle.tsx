import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";

import {
  listLifecycleTenants,
  getTenantTimeline,
  enterMaintenance,
  exitMaintenance,
  restoreTenant,
  scheduleTenantDeletion,
  cancelTenantDeletion,
  deleteTenant,
} from "@/lib/tenant-lifecycle/lifecycle.functions";
import {
  STATE_LABELS,
  STATE_TONES,
  TENANT_LIFECYCLE_STATES,
  type LifecycleOperation,
  type TenantLifecycleState,
} from "@/lib/tenant-lifecycle/lifecycle";
import {
  LifecycleActions,
  type LifecycleActionPayload,
} from "@/modules/platform/tenant-lifecycle/components/LifecycleActions";
import { LifecycleTimeline } from "@/modules/platform/tenant-lifecycle/components/LifecycleTimeline";

export const Route = createFileRoute("/_authenticated/platform/tenants/lifecycle")({
  component: TenantLifecyclePage,
  head: () => ({
    meta: [
      { title: "Tenant Lifecycle — Platform Administration" },
      {
        name: "description",
        content:
          "Operate the tenant lifecycle: maintenance, restore, deletion scheduling and soft deletion.",
      },
      { property: "og:title", content: "Tenant Lifecycle — Platform Administration" },
      {
        property: "og:description",
        content: "Multi-tenant operational lifecycle console for platform administrators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  positive: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/15 text-destructive",
};

function TenantLifecyclePage() {
  const auth = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(listLifecycleTenants);
  const timeline = useServerFn(getTenantTimeline);

  const [search, setSearch] = React.useState("");
  const [state, setState] = React.useState<TenantLifecycleState | "all">("all");
  const [selected, setSelected] = React.useState<string | null>(null);

  const tenantsQuery = useQuery({
    queryKey: ["platform", "tenant-lifecycle", "list", state, search],
    queryFn: () =>
      list({
        data: {
          search: search || undefined,
          state: state === "all" ? undefined : state,
          includeDeleted: state === "deleted",
        },
      }),
    enabled: auth.status === "authenticated",
  });

  const timelineQuery = useQuery({
    queryKey: ["platform", "tenant-lifecycle", "timeline", selected],
    queryFn: () => timeline({ data: { tenantId: selected! } }),
    enabled: auth.status === "authenticated" && !!selected,
  });

  const ops = {
    enter_maintenance: useServerFn(enterMaintenance),
    exit_maintenance: useServerFn(exitMaintenance),
    restore: useServerFn(restoreTenant),
    schedule_deletion: useServerFn(scheduleTenantDeletion),
    cancel_deletion: useServerFn(cancelTenantDeletion),
    delete: useServerFn(deleteTenant),
  };

  const runOp = useMutation({
    mutationFn: async ({
      tenantId,
      payload,
    }: {
      tenantId: string;
      payload: LifecycleActionPayload;
    }) => {
      const { operation, reason, retentionDays } = payload;
      switch (operation) {
        case "enter_maintenance":
          return ops.enter_maintenance({ data: { tenantId, reason } });
        case "exit_maintenance":
          return ops.exit_maintenance({ data: { tenantId } });
        case "restore":
          return ops.restore({ data: { tenantId } });
        case "schedule_deletion":
          return ops.schedule_deletion({ data: { tenantId, reason, retentionDays } });
        case "cancel_deletion":
          return ops.cancel_deletion({ data: { tenantId, reason } });
        case "delete":
          return ops.delete({ data: { tenantId, reason } });
        default: {
          const never: never = operation satisfies LifecycleOperation;
          throw new Error(`Unsupported operation: ${String(never)}`);
        }
      }
    },
    onSuccess: (result) => {
      toast.success(
        result.alreadyApplied
          ? "Already in the requested state"
          : `Tenant moved to ${result.toState}`,
      );
      qc.invalidateQueries({ queryKey: ["platform", "tenant-lifecycle"] });
      qc.invalidateQueries({ queryKey: ["platform", "tenants"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const rows = tenantsQuery.data ?? [];
  const current = rows.find((r) => r.id === selected) ?? null;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tenant lifecycle</h1>
        <p className="text-sm text-muted-foreground">
          Operate provisioned tenants: maintenance windows, restore, deletion
          scheduling and soft deletion.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Tenants</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search name or slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56"
            />
            <Select
              value={state}
              onValueChange={(v) => setState(v as TenantLifecycleState | "all")}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All states" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {TENANT_LIFECYCLE_STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATE_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {tenantsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading tenants…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tenants match the filter.</p>
          ) : (
            <div className="divide-y">
              {rows.map((row) => {
                const s = row.lifecycle_state as TenantLifecycleState;
                return (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{row.display_name}</span>
                        <Badge variant="outline" className="font-mono">
                          {row.slug}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {row.region} · {row.plan_tier}
                        {row.purge_after
                          ? ` · purge after ${new Date(row.purge_after).toLocaleDateString()}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${TONE_CLASS[STATE_TONES[s]]}`}
                      >
                        {STATE_LABELS[s]}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(row.id)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{current?.display_name ?? "Tenant"}</SheetTitle>
          </SheetHeader>
          {current && (
            <div className="space-y-6 py-4">
              <section className="space-y-3">
                <h2 className="text-sm font-semibold">Lifecycle operations</h2>
                <LifecycleActions
                  state={current.lifecycle_state as TenantLifecycleState}
                  pending={runOp.isPending}
                  onRun={(payload) =>
                    runOp.mutate({ tenantId: current.id, payload })
                  }
                />
                {current.maintenance_reason && (
                  <p className="text-xs text-muted-foreground">
                    Maintenance reason: {current.maintenance_reason}
                  </p>
                )}
                {current.deletion_reason && (
                  <p className="text-xs text-muted-foreground">
                    Deletion reason: {current.deletion_reason}
                  </p>
                )}
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-semibold">History</h2>
                <LifecycleTimeline
                  entries={timelineQuery.data ?? []}
                  isLoading={timelineQuery.isLoading}
                />
              </section>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
