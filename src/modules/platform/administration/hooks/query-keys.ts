/**
 * Gate 3.7 · Administration query keys + cache invalidation.
 */
import type { QueryClient } from "@tanstack/react-query";

export const administrationKeys = {
  all: ["platform-admin"] as const,
  summary: () => [...administrationKeys.all, "summary"] as const,
  health: () => [...administrationKeys.all, "health"] as const,
  attention: (query: unknown) => [...administrationKeys.all, "attention", query] as const,
  tenants: (query: unknown) => [...administrationKeys.all, "tenants", query] as const,
  providers: () => [...administrationKeys.all, "providers"] as const,
  settings: () => [...administrationKeys.all, "settings"] as const,
  policies: () => [...administrationKeys.all, "policies"] as const,
  features: () => [...administrationKeys.all, "features"] as const,
  audit: (query: unknown) => [...administrationKeys.all, "audit", query] as const,
  notifications: () => [...administrationKeys.all, "notifications"] as const,
};

export function invalidateAdministration(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: administrationKeys.all });
}
