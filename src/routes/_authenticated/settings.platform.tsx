import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/AppShell";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { SettingField } from "@/components/settings/SettingField";
import { CardSkeleton } from "@/components/common/Skeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSettingDefinitions, useSettings } from "@/hooks/settings/useSettings";
import { APP_NAME } from "@/constants/app";

export const Route = createFileRoute("/_authenticated/settings/platform")({
  head: () => ({
    meta: [
      { title: `Platform settings — ${APP_NAME}` },
      {
        name: "description",
        content:
          "Framework demonstration surface for the Settings Foundation. Not a production administration console.",
      },
    ],
  }),
  component: PlatformSettingsPage,
});

function PlatformSettingsPage() {
  const defsQ = useSettingDefinitions();
  const valsQ = useSettings();

  const definitions = defsQ.data ?? [];
  const resolved = valsQ.data ?? [];
  const byKey = new Map(resolved.map((r) => [r.key, r]));

  const categories = Array.from(
    definitions.reduce((set, d) => set.add(d.category), new Set<string>()),
  );

  return (
    <PageContainer
      title="Platform settings"
      description="Sprint 0.6 framework demonstration surface — not a production administration console."
    >
      <Alert className="mb-6">
        <AlertTitle>Demonstration surface</AlertTitle>
        <AlertDescription>
          This page exercises the shared Settings Foundation (resolution engine,
          validation, sensitive redaction, and audit). Module-specific
          administration UIs will consume the same hooks in later sprints.
        </AlertDescription>
      </Alert>

      {defsQ.isLoading || valsQ.isLoading ? (
        <div className="grid gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        categories.map((category) => (
          <SettingsSection key={category} title={category} description={`${category} settings`}>
            {definitions
              .filter((d) => d.category === category)
              .map((d) => (
                <SettingField
                  key={d.key}
                  definition={d}
                  resolved={byKey.get(d.key)}
                  scope={d.scope === "platform" ? "platform" : "organization"}
                />
              ))}
          </SettingsSection>
        ))
      )}
    </PageContainer>
  );
}
