import { createFileRoute } from "@tanstack/react-router";
import { DashboardTemplate } from "@/dashboard/template";
import { useAuth } from "@/contexts/auth-context";
import { APP_NAME } from "@/constants/app";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: `Dashboard — ${APP_NAME}` },
      { name: "description", content: `${APP_NAME} tenant dashboard.` },
    ],
  }),
  component: TenantDashboardPage,
});

function TenantDashboardPage() {
  const { profile } = useAuth();
  const displayName = profile?.displayName?.trim();

  return (
    <DashboardTemplate
      context="tenant"
      config={{
        title: displayName ? `Welcome, ${displayName}` : "Welcome to Business OS",
        description: "Your tenant is ready.",
        quickActions: true,
        recentActivity: true,
        notifications: true,
        widgets: [],
      }}
    />
  );
}
