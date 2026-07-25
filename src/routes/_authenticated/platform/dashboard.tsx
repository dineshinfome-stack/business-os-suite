/**
 * SPR-MOD-001-003 — Platform Dashboard (shared template).
 *
 * Rendered through the Enterprise Dashboard Template so the Platform,
 * Tenant, and future module dashboards share layout, permission gating,
 * and widget composition.
 */
import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Users } from "lucide-react";
import { Can } from "@/components/auth/Can";
import { DashboardTemplate, registerDashboardWidget } from "@/dashboard/template";
import { PlatformFoundationWidget } from "@/dashboard/template/widgets/PlatformFoundationWidget";
import { APP_NAME } from "@/constants/app";

// Phase 1 — Platform Foundation: register the placeholder widget so the
// dashboard clearly indicates Phase 2 (Tenant Registry) is pending.
registerDashboardWidget({
  id: "platform.foundation.placeholder",
  title: "Tenant Registry",
  component: PlatformFoundationWidget,
  permission: "platform.dashboard.view",
});

export const Route = createFileRoute("/_authenticated/platform/dashboard")({
  head: () => ({
    meta: [
      { title: `Platform Dashboard — ${APP_NAME}` },
      { name: "description", content: `${APP_NAME} platform control center.` },
    ],
  }),
  component: PlatformDashboardPage,
});

function PlatformDashboardPage() {
  return (
    <Can
      permission="platform.dashboard.view"
      fallback={
        <div className="p-8">
          <h1 className="text-2xl font-semibold">Not authorized</h1>
          <p className="mt-2 text-muted-foreground">
            You do not have permission to view the Platform Dashboard.
          </p>
        </div>
      }
    >
      <DashboardTemplate
        context="platform"
        config={{
          title: "Platform Dashboard",
          description: "Operate tenants, identity, and platform-wide health.",
          headerActions: null,
          quickActions: {
            items: [
              {
                id: "invite-user",
                label: "Invite user",
                icon: UserPlus,
                permission: "platform.users.invite",
                disabled: true,
              },
              {
                id: "view-users",
                label: "Users",
                icon: Users,
                permission: "platform.users.view",
                disabled: true,
              },
            ],
          },
          recentActivity: true,
          notifications: true,
          widgets: ["platform.foundation.placeholder"],
        }}
      />
    </Can>
  );
}
