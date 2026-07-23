/**
 * Sprint 0.9 — Search & Global Command Framework
 * Core types shared by providers, service, hooks, and components.
 */
import type { ComponentType } from "react";
import type { PermissionKey } from "@/lib/generated/permission-keys";

/** Immutable identifier for a searchable resource domain. */
export type ResourceType = string;

export type ProviderKey = "registry" | "database";

export interface SearchResult {
  /** Provider-local id; combined with resource_type for global identity. */
  id: string;
  resource_type: ResourceType;
  organization_id: string | null;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  route: string;
  permission?: PermissionKey;
  metadata?: Record<string, string | number | boolean | null>;
  /** 0-100. Higher = better match. */
  score: number;
  created_at?: string;
  updated_at?: string;
}

export interface SearchQuery {
  query: string;
  organizationId: string;
  userId: string;
  resourceTypes?: ResourceType[];
  limit?: number;
}

export interface SearchProviderContext {
  /** Permission keys the caller currently holds. */
  permissions: ReadonlySet<PermissionKey>;
}

export interface SearchProvider {
  key: ProviderKey;
  /** Priority when merging — lower runs first, results deduped by (resource_type, id). */
  priority: number;
  search: (query: SearchQuery, ctx: SearchProviderContext) => Promise<SearchResult[]>;
}

export interface SearchRegistryEntry {
  readonly resourceType: ResourceType;
  readonly displayName: string;
  readonly icon?: ComponentType<{ className?: string }>;
  readonly permission?: PermissionKey;
  readonly keywords: readonly string[];
  readonly providerKey: ProviderKey;
  readonly status: "active" | "reserved" | "retired";
  /**
   * Builds a UI route for a resolved result. Providers that produce
   * `SearchResult.route` directly may ignore this.
   */
  readonly routeBuilder?: (result: SearchResult) => string;
}
