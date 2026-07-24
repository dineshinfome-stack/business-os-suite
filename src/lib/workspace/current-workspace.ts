/**
 * ADR-008 — Logical Workspace accessor.
 *
 * Workspace is a **logical construct derived from the Tenant context and
 * associated configuration**. It has no table, no independent identifier,
 * and no independent configuration store.
 *
 * Contract:
 *   - `workspaceKey` is an alias of the Tenant identifier for compatibility
 *     only. It MUST NEVER be stored independently, used as a foreign key,
 *     or referenced in a schema column.
 *   - This accessor is a pure read over the existing tenant context. It
 *     MUST NOT introduce caching, persistence, network requests, or an
 *     alternate context-resolution path. It relies exclusively on the same
 *     tenant source that `useCurrentTenant` already consumes.
 *
 * See `docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md`.
 */
import { useMemo } from "react";

import { useCurrentTenant } from "@/hooks/tenants/useCurrentTenant";

export interface CurrentWorkspace {
  /** The Tenant identifier that owns this logical Workspace. */
  tenantId: string;
  /**
   * Alias of `tenantId` for compatibility. NEVER persist, NEVER use as an FK,
   * NEVER add as a column. Introduced only so callers can express the logical
   * Workspace concept without inventing a new identifier.
   */
  workspaceKey: string;
  /** Display name (derived from the Tenant). */
  name: string;
}

/**
 * Pure accessor — returns the current logical Workspace derived from the
 * caller's Tenant context, or `null` when no tenant is resolved.
 */
export function useCurrentWorkspace(): {
  data: CurrentWorkspace | null;
  isLoading: boolean;
} {
  const { data: tenant, isLoading } = useCurrentTenant();
  const workspace = useMemo<CurrentWorkspace | null>(() => {
    if (!tenant) return null;
    return {
      tenantId: tenant.id,
      workspaceKey: tenant.id,
      name: tenant.display_name,
    };
  }, [tenant]);
  return { data: workspace, isLoading };
}

/**
 * Pure derivation from an already-resolved tenant record. Prefer this in
 * non-hook contexts (server functions, utilities) where the caller has
 * already loaded the tenant via existing mechanisms.
 */
export function getCurrentWorkspace(
  tenant: { id: string; display_name: string } | null | undefined,
): CurrentWorkspace | null {
  if (!tenant) return null;
  return {
    tenantId: tenant.id,
    workspaceKey: tenant.id,
    name: tenant.display_name,
  };
}
