/**
 * Gate 3.7 · Notification operations (registry + operator inbox).
 */
import { createFileRoute } from "@tanstack/react-router";

import { NotificationsPanel } from "@/modules/platform/administration/components/NotificationsPanel";
import { useNotificationOperations } from "@/modules/platform/administration/hooks/useAdministration";
import {
  ErrorState,
  LoadingState,
} from "@/modules/platform/provisioning/components/States";

export const Route = createFileRoute("/_authenticated/platform/admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Operations — Business OS Platform" },
      {
        name: "description",
        content:
          "Platform notification type registry and recent operator notifications.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const notifications = useNotificationOperations();

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-semibold">Notification operations</h1>
        <p className="text-sm text-muted-foreground">
          The registry is code-owned; this console does not create, route or resend
          notifications.
        </p>
      </header>

      {notifications.isPending ? (
        <LoadingState label="Loading notification operations" />
      ) : notifications.error ? (
        <ErrorState error={notifications.error} />
      ) : notifications.data ? (
        <NotificationsPanel data={notifications.data} />
      ) : null}
    </div>
  );
}
