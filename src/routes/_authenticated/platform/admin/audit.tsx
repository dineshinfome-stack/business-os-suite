/**
 * Gate 3.7 · Global audit explorer with redacted CSV export.
 */
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuditTable } from "@/modules/platform/administration/components/AuditTable";
import {
  useAuditExplorer,
  useAuditExport,
  type AuditExplorerQuery,
} from "@/modules/platform/administration/hooks/useAdministration";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";

export const Route = createFileRoute("/_authenticated/platform/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit Explorer — Business OS Platform" },
      {
        name: "description",
        content:
          "Search platform audit history across tenants, provisioning and settings changes.",
      },
    ],
  }),
  component: AuditPage;
});

function AuditPage() {
  const [query, setQuery] = React.useState<AuditExplorerQuery>({ pageSize: 50 });
  const audit = useAuditExplorer(query);
  const exportCsv = useAuditExport();

  function downloadCsv() {
    exportCsv.mutate(query, {
      onSuccess: (csv) => {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `platform-audit-${new Date().toISOString().slice(0, 10)}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Export failed"),
    });
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Audit explorer</h1>
          <p className="text-sm text-muted-foreground">
            Exports use the same redaction as this table — secret values never leave
            the server.
          </p>
        </div>
        <Button variant="outline" disabled={exportCsv.isPending} onClick={downloadCsv}>
          {exportCsv.isPending ? "Preparing…" : "Export CSV"}
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        <Input
          className="w-64"
          placeholder="Search action, entity or reason"
          aria-label="Search audit entries"
          value={query.search ?? ""}
          onChange={(event) =>
            setQuery((q) => ({ ...q, search: event.target.value, page: 1 }))
          }
        />
        <Input
          type="date"
          className="w-44"
          aria-label="From date"
          value={query.from?.slice(0, 10) ?? ""}
          onChange={(event) =>
            setQuery((q) => ({ ...q, from: event.target.value || undefined, page: 1 }))
          }
        />
        <Input
          type="date"
          className="w-44"
          aria-label="To date"
          value={query.to?.slice(0, 10) ?? ""}
          onChange={(event) =>
            setQuery((q) => ({ ...q, to: event.target.value || undefined, page: 1 }))
          }
        />
      </div>

      {audit.isPending ? (
        <LoadingState label="Loading audit history" />
      ) : audit.error ? (
        <ErrorState error={audit.error} />
      ) : (
        <>
          <AuditTable entries={audit.data?.entries ?? []} />
          <p className="text-xs text-muted-foreground">
            Showing {audit.data?.entries.length ?? 0} of {audit.data?.total ?? 0} entries.
          </p>
        </>
      )}
    </div>
  );
}
