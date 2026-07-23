/**
 * Shared TanStack Query key factory.
 *
 * Keys are scoped by organization where relevant so that switching orgs
 * transparently invalidates cached reads (see `OrgProvider`).
 */
export const queryKeys = {
  settings: {
    all: (orgId: string | null) => ["settings", orgId] as const,
    definitions: () => ["settings", "definitions"] as const,
    resolved: (orgId: string | null, keys?: readonly string[]) =>
      ["settings", orgId, "resolved", keys ?? "all"] as const,
    one: (orgId: string | null, key: string) =>
      ["settings", orgId, "one", key] as const,
  },
  featureFlags: {
    all: (orgId: string | null) => ["feature-flags", orgId] as const,
  },
} as const;
