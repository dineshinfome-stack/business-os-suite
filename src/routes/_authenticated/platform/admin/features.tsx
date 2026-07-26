/**
 * Gate 3.7 · Platform feature controls.
 */
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { FeatureControlsTable } from "@/modules/platform/administration/components/FeatureControlsTable";
import { usePermissions } from "@/contexts/permissions-context";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import {
  useAdministrationCommands,
  useFeatureControls,
} from "@/modules/platform/administration/hooks/useAdministration";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";

export const Route = createFileRoute("/_authenticated/platform/admin/features")({
  head: () => ({
    meta: [
      { title: "Feature Controls — Business OS Platform" },
      {
        name: "description",
        content:
          "Platform-scoped feature flags with rollout stage, source and audited toggles.",
      },
    ],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const { has } = usePermissions();
  const canManage = has(PERMISSIONS.PLATFORM_SETTINGS_MANAGE);
  const features = useFeatureControls();
  const { setFeature } = useAdministrationCommands();

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Feature controls</h1>
        <p className="text-sm text-muted-foreground">
          Platform-scope flags only. Tenant-scoped overrides remain with the owning
          tenant surface. Every toggle writes an audit entry.
        </p>
      </header>

      {features.isPending ? (
        <LoadingState label="Loading feature controls" />
      ) : features.error ? (
        <ErrorState error={features.error} />
      ) : (
        <FeatureControlsTable
          features={features.data ?? []}
          canManage={canManage}
          saving={setFeature.isPending}
          onToggle={(key, enabled) =>
            setFeature.mutate(
              { key, enabled },
              {
                onSuccess: (result) => toast.success(result.message),
                onError: (error) =>
                  toast.error(
                    error instanceof Error ? error.message : "Toggle rejected",
                  ),
              },
            )
          }
        />
      )}
    </div>
  );
}
