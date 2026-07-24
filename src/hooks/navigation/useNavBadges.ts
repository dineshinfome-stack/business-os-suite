/**
 * Navigation badges — per-nav_id numeric counts (Approvals, Notifications, Tasks).
 * Stub implementation returns an empty map. Wire real sources in follow-up sprints.
 */
import { useMemo } from "react";

export type NavBadgeMap = Map<string, number>;

export function useNavBadges(): NavBadgeMap {
  return useMemo(() => new Map<string, number>(), []);
}
