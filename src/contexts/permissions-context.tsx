/**
 * Sprint 0.5 — React Authorization Layer
 *
 * Loads the caller's effective permission set for the current organization
 * via TanStack Query. Invalidated on org switch and after role mutations.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listEffectivePermissions } from "@/lib/authorization.functions";
import { useAuth } from "@/contexts/auth-context";
import { useOrg } from "@/contexts/org-context";
import type { PermissionKey } from "@/lib/generated/permission-keys";

interface PermissionsContextValue {
  ready: boolean;
  permissions: Set<PermissionKey>;
  has: (key: PermissionKey) => boolean;
  hasAny: (keys: PermissionKey[]) => boolean;
  hasAll: (keys: PermissionKey[]) => boolean;
  refresh: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function permissionsQueryKey(userId: string | null, orgId: string | null) {
  return ["permissions", userId, orgId] as const;
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const org = useOrg();
  const listFn = useServerFn(listEffectivePermissions);
  const queryClient = useQueryClient();

  const userId = auth.user?.id ?? null;
  const orgId = org.current?.organizationId ?? null;
  const enabled = auth.status === "authenticated";

  const query = useQuery({
    queryKey: permissionsQueryKey(userId, orgId),
    queryFn: () => listFn({ data: { organizationId: orgId } }),
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const value = useMemo<PermissionsContextValue>(() => {
    const set = new Set<PermissionKey>((query.data ?? []) as PermissionKey[]);
    return {
      ready: !enabled ? true : query.isSuccess,
      permissions: set,
      has: (k) => set.has(k),
      hasAny: (keys) => keys.some((k) => set.has(k)),
      hasAll: (keys) => keys.every((k) => set.has(k)),
      refresh: async () => {
        await queryClient.invalidateQueries({ queryKey: permissionsQueryKey(userId, orgId) });
      },
    };
  }, [query.data, query.isSuccess, enabled, queryClient, userId, orgId]);

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error("usePermissions must be used inside <PermissionsProvider>");
  return ctx;
}

export function usePermission(key: PermissionKey): boolean {
  return usePermissions().has(key);
}

export function useAnyPermission(keys: PermissionKey[]): boolean {
  return usePermissions().hasAny(keys);
}

export function useAllPermissions(keys: PermissionKey[]): boolean {
  return usePermissions().hasAll(keys);
}
