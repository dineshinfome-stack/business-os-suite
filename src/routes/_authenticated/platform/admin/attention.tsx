/**
 * Gate 3.7 · Attention queue — deterministic, server-ranked operator worklist.
 */
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttentionTable } from "@/modules/platform/administration/components/AttentionTable";
import {
  useAdministrationCommands,
  useAttentionQueue,
  type AttentionQuery,
} from "@/modules/platform/administration/hooks/useAdministration";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";

export const Route = createFileRoute("/_authenticated/platform/admin/attention")({
  head: () => ({
    meta: [
      { title: "Attention Queue — Business OS Platform" },
      {
        name: "description",
        content:
          "Items across tenants and provisioning that need operator action, ranked by severity.",
      },
    ],
  }),
  component: AttentionPage,
});

function AttentionPage() {
  const [query, setQuery] = React.useState<AttentionQuery>({
    severity: "all",
    status: "open",
    pageSize: 50,
  });
  const attention = useAttentionQueue(query);
  const { acknowledge } = useAdministrationCommands();

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Attention queue</h1>
        <p className="text-sm text-muted-foreground">
          Ranking is computed server-side; acknowledging an item records an audit
          entry but never changes the underlying tenant or job state.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Select
          value={query.severity ?? "all"}
          onValueChange={(value) =>
            setQuery((q) => ({ ...q, severity: value as AttentionQuery["severity"] }))
          }
        >
          <SelectTrigger className="w-44" aria-label="Filter by severity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["all", "critical", "high", "medium", "low", "info"].map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All severities" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={query.status ?? "all"}
          onValueChange={(value) =>
            setQuery((q) => ({ ...q, status: value as AttentionQuery["status"] }))
          }
        >
          <SelectTrigger className="w-44" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {attention.isPending ? (
        <LoadingState label="Loading attention queue" />
      ) : attention.error ? (
        <ErrorState error={attention.error} />
      ) : (
        <AttentionTable
          items={attention.data?.items ?? []}
          acknowledging={acknowledge.isPending ? acknowledge.variables?.itemId : null}
          onAcknowledge={(item) =>
            acknowledge.mutate(
              { itemId: item.id },
              {
                onSuccess: () => toast.success("Attention item acknowledged"),
                onError: (error) =>
                  toast.error(
                    error instanceof Error ? error.message : "Acknowledgement failed",
                  ),
              },
            )
          }
        />
      )}
    </div>
  );
}
