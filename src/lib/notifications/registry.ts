/**
 * Sprint 0.8 — Notification Type Registry
 *
 * STABILITY CONTRACT
 * Each `type` identifier is an immutable contract. Never rename or repurpose
 * a type once shipped; deprecate and add a new one. `category` is the
 * user-facing grouping used by preferences (`notification_preferences.category`).
 *
 * NAMESPACE CONVENTION
 * `<domain>.<event>` — lowercase, dot-separated. Domains group by module
 * (e.g. `task.*`, `security.*`, `system.*`).
 */
import type { NotificationSeverity } from "./constants";

export interface NotificationTypeDef {
  /** Immutable identifier. */
  readonly type: string;
  /** User-facing category — powers preference toggles. */
  readonly category: string;
  /** Default severity when the caller does not override. */
  readonly defaultSeverity: NotificationSeverity;
  /** Human-readable label for the preferences UI. */
  readonly label: string;
  /** Short description shown in the preferences UI. */
  readonly description: string;
}

const defs = [
  {
    type: "system.announcement",
    category: "system",
    defaultSeverity: "info",
    label: "System announcements",
    description: "Platform-wide announcements and maintenance notices.",
  },
  {
    type: "security.alert",
    category: "security",
    defaultSeverity: "warning",
    label: "Security alerts",
    description: "Account and workspace security events.",
  },
  {
    type: "task.assigned",
    category: "task",
    defaultSeverity: "info",
    label: "Task assignments",
    description: "You have been assigned a new task.",
  },
  {
    type: "task.mentioned",
    category: "task",
    defaultSeverity: "info",
    label: "Task mentions",
    description: "You were mentioned in a task or comment.",
  },
] as const satisfies readonly NotificationTypeDef[];

export const notificationRegistry: readonly NotificationTypeDef[] = defs;

export type NotificationType = (typeof defs)[number]["type"];

const byType = new Map(defs.map((d) => [d.type, d]));

export function getNotificationType(type: string): NotificationTypeDef | undefined {
  return byType.get(type);
}

export function listNotificationCategories(): string[] {
  return Array.from(new Set(defs.map((d) => d.category)));
}
