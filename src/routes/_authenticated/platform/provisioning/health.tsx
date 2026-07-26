import { createFileRoute } from "@tanstack/react-router";

import { ProviderHealthCard } from "@/modules/platform/provisioning/components/ProviderHealthCard";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";
import { useProviderHealth } from "@/modules/platform/provisioning/hooks/useProvisioningDashboard";

export const Route = createFileRoute("/_authenticated/platform/provisioning/health")({
  component: ProviderHealthPage,
  head: () => ({
    meta: [
      { title: "Provider Health — Platform Administration" },
      {
        name: "description",
        content:
          "Configuration status, capabilities, and historical success rates for every registered provisioning provider.",
      },
      { property: "og:title", content: "Provider Health — Platform Administration" },
      {
        property: "og:description",
        content: "Capabilities and historical success rates per provisioning provider.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ProviderHealthPage() {
  const health = useProviderHealth();

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Provider health</h1>
        <p className="text-sm text-muted-foreground">
          Configuration and historical outcomes for each registered provisioning provider.
        </p>
      </header>

      {health.isLoading ? (
        <LoadingState label="Loading provider health" />
      ) : health.error ? (
        <ErrorState error={health.error} />
      ) : (health.data?.length ?? 0) === 0 ? (
        <EmptyState message="No providers are registered." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {health.data?.map((provider) => (
            <ProviderHealthCard key={provider.providerKey} health={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
