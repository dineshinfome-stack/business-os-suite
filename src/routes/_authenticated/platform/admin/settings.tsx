/**
 * Gate 3.7 · Platform settings & operational policies.
 */
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  PolicyTable,
  SettingsTable,
} from "@/modules/platform/administration/components/SettingsPanel";
import { usePermissions } from "@/contexts/permissions-context";
import { PERMISSIONS } from "@/lib/generated/permission-keys";
import {
  useAdministrationCommands,
  usePlatformPolicies,
  usePlatformSettings,
} from "@/modules/platform/administration/hooks/useAdministration";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";

export const Route = createFileRoute("/_authenticated/platform/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform Settings — Business OS Platform" },
      {
        name: "description",
        content:
          "Platform-scoped settings and operational policies with explicit ownership and mutability.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { has } = usePermissions();
  const canManage = has(PERMISSIONS.PLATFORM_SETTINGS_MANAGE);
  const settings = usePlatformSettings();
  const policies = usePlatformPolicies();
  const { updateSetting } = useAdministrationCommands();

  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="text-xl font-semibold">Platform settings</h1>
        <p className="text-sm text-muted-foreground">
          Only settings owned by the platform surface are editable here. Everything
          else is shown read-only with its source of truth. All changes are audited.
        </p>
      </header>

      {settings.isPending ? (
        <LoadingState label="Loading settings" />
      ) : settings.error ? (
        <ErrorState error={settings.error} />
      ) : (
        <SettingsTable
          settings={settings.data ?? []}
          canManage={canManage}
          saving={updateSetting.isPending}
          onSave={(key, value) =>
            updateSetting.mutate(
              { key, value },
              {
                onSuccess: (result) => toast.success(result.message),
                onError: (error) =>
                  toast.error(
                    error instanceof Error ? error.message : "Update rejected",
                  ),
              },
            )
          }
        />
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Operational policies
        </h2>
        {policies.isPending ? (
          <LoadingState label="Loading policies" />
        ) : policies.error ? (
          <ErrorState error={policies.error} />
        ) : (
          <PolicyTable policies={policies.data ?? []} />
        )}
      </section>
    </div>
  );
}
