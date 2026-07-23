/**
 * Sprint 0.8 — Notifications Framework
 *
 * Provider interface + in-app provider.
 * Future channels (email, sms, push) implement the same `NotificationProvider`
 * contract without touching call sites.
 */
import type { NotificationChannel, NotificationSeverity } from "@/lib/notifications/constants";
import { createSelfNotification } from "@/lib/notifications/service.functions";

export interface NotificationDeliveryInput {
  type: string;
  title: string;
  message?: string;
  severity?: NotificationSeverity;
  actionUrl?: string;
  actionLabel?: string;
  organizationId?: string | null;
}

export interface NotificationProvider {
  readonly channel: NotificationChannel;
  deliver(input: NotificationDeliveryInput): Promise<void>;
}

/**
 * In-app provider — persists a notification row for the current user.
 * Cross-user delivery is out of scope for this provider and belongs to a
 * service_role fan-out worker.
 */
export const inAppProvider: NotificationProvider = {
  channel: "in_app",
  async deliver(input) {
    await createSelfNotification({
      data: {
        type: input.type,
        title: input.title,
        message: input.message,
        severity: input.severity,
        actionUrl: input.actionUrl,
        actionLabel: input.actionLabel,
        organizationId: input.organizationId ?? null,
      },
    });
  },
};
