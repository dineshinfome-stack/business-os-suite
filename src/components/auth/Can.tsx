/**
 * Sprint 0.5 — Declarative permission gates.
 * Renders `children` only when the caller has the required permissions.
 */
import type { ReactNode } from "react";
import { usePermissions } from "@/contexts/permissions-context";
import type { PermissionKey } from "@/lib/generated/permission-keys";

interface BaseProps {
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ permission, ...rest }: BaseProps & { permission: PermissionKey }) {
  const { has } = usePermissions();
  return has(permission) ? <>{rest.children}</> : <>{rest.fallback ?? null}</>;
}

export function CanAny({ permissions, ...rest }: BaseProps & { permissions: PermissionKey[] }) {
  const { hasAny } = usePermissions();
  return hasAny(permissions) ? <>{rest.children}</> : <>{rest.fallback ?? null}</>;
}

export function CanAll({ permissions, ...rest }: BaseProps & { permissions: PermissionKey[] }) {
  const { hasAll } = usePermissions();
  return hasAll(permissions) ? <>{rest.children}</> : <>{rest.fallback ?? null}</>;
}
