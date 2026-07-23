/**
 * Sprint 0.8 — Notifications Framework
 * Single source of truth for shared notification enums.
 * These must match the CHECK constraints on public.notifications and
 * public.notification_preferences.
 */
import { z } from "zod";

export const NotificationSeverity = z.enum(["info", "success", "warning", "error"]);
export type NotificationSeverity = z.infer<typeof NotificationSeverity>;

export const NotificationStatus = z.enum(["unread", "read", "archived"]);
export type NotificationStatus = z.infer<typeof NotificationStatus>;

export const NotificationChannel = z.enum(["in_app", "email", "sms", "push"]);
export type NotificationChannel = z.infer<typeof NotificationChannel>;
