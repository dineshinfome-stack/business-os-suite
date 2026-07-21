import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/common/EmptyState";
import { APP_NAME } from "@/constants/app";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: `Settings — ${APP_NAME}` },
      { name: "description", content: `${APP_NAME} workspace settings.` },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <PageContainer title="Settings" description="Configure your workspace preferences.">
      <ComingSoon description="Workspace settings will land here in an upcoming sprint." />
    </PageContainer>
  );
}
