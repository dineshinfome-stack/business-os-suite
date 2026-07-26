/**
 * Gate 3.7 · Operations overview — aggregate posture across platform surfaces.
 */
import { createFileRoute } from "@tanstack/react-router";

import {
  OperationsSummaryCards,
  PlatformHealthMatrix,
} from "@/modules/platform/administration/components/OperationsOverview";
import { AttentionTable } from "@/modules/platform/administration/components/AttentionTable";
import {
  useAttentionQueue,
  useHealthSections,
  useOperationsSummary,
} from "@/modules/platform/administration/hooks/useAdministration";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";

export const Route = createFileRoute("/_authenticated/platform/admin/")({
  head: () => ({
    meta: [
      { title: "Platform Operations — Business OS" },
      {
        name: "description",
        content:
          "Aggregate platform posture: tenants, provisioning, providers and items needing attention.",
      },
    ],
  }),
  component: OperationsPage,
});

function OperationsPage() {
  const summary = useOperationsSummary();
  const health = useHealthSections();
  const attention = useAttentionQueue({ status: "open", pageSize: 5 });

  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="text-xl font-semibold">Platform operations</h1>
        <p className="text-sm text-muted-foreground">
          A read-only aggregation of tenant registry, provisioning, settings, audit
          and notification surfaces. Actions link back to their owning module.
        </p>
      </header>

      {summary.isPending ? (
        <LoadingState label="Loading operations summary" />
      ) : summary.error ? (
        <ErrorState error={summary.error} />
      ) : summary.data ? (
        <OperationsSummaryCards summary={summary.data} />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Platform health
        </h2>
        {health.isPending ? (
          <LoadingState label="Loading platform health" />
        ) : health.error ? (
          <ErrorState error={health.error} />
        ) : (
          <PlatformHealthMatrix sections={health.data ?? []} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Top attention items
        </h2>
        {attention.isPending ? (
          <LoadingState label="Loading attention queue" />
        ) : attention.error ? (
          <ErrorState error={attention.error} />
        ) : (
          <AttentionTable items={attention.data?.items ?? []} />
        )}
      </section>
    </div>
  );
}
