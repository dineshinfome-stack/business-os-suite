/**
 * SPR-MOD-001-001 — Read-only mobile/web hook for current tenant.
 * Resolves the caller's tenant via listTenants + the active org membership.
 */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listTenants } from "@/lib/tenants/tenants.functions";
import { useAuth } from "@/contexts/auth-context";

export function useCurrentTenant(options: { enabled?: boolean } = {}) {
  const { status } = useAuth();
  const list = useServerFn(listTenants);
  const enabled = (options.enabled ?? true) && status === "authenticated";

  return useQuery({
    queryKey: ["tenants", "current"],
    queryFn: async () => {
      const rows = await list();
      // In this sprint an authenticated user sees exactly the tenants they
      // are a member of via tenants_select_member RLS. First row is "current".
      return rows[0] ?? null;
    },
    enabled,
    staleTime: 60_000,
  });
}
