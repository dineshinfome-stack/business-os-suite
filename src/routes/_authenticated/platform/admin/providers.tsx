/**
 * Gate 3.7 · Providers & regions (read-only infrastructure visibility).
 */
import { createFileRoute } from "@tanstack/react-router";

import {
  ProviderCards,
  RegionTable,
} from "@/modules/platform/administration/components/ProvidersPanel";
import { usePlatformProviders } from "@/modules/platform/administration/hooks/useAdministration";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";

export const Route = createFileRoute("/_authenticated/platform/admin/providers")({
  head: () => ({
    meta: [
      { title: "Providers & Regions — Business OS Platform" },
      {
        name: "description",
        content:
          "Provisioning provider configuration state, historical reliability and region distribution.",
      },
    ],
  }),
  component: ProvidersPage,
});

function ProvidersPage() {
  const providers = usePlatformProviders();

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Providers &amp; regions</h1>
        <p className="text-sm text-muted-foreground">
          Provider credentials are environment-owned and cannot be edited here.
          Statistics are derived from historical provisioning jobs, not live probes.
        </p>
      </header>

      {providers.isPending ? (
        <LoadingState label="Loading providers" />
      ) : providers.error ? (
        <ErrorState error={providers.error} />
      ) : (
        <>
          <ProviderCards providers={providers.data?.providers ?? []} />
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Regions
            </h2>
            <RegionTable regions={providers.data?.regions ?? []} />
          </section>
        </>
      )}
    </div>
  );
}
