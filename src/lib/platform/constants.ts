/**
 * Phase 1 — Platform Foundation constants.
 *
 * Central pointers to existing Platform routes, nav ids, permission keys,
 * and feature-flag keys. Reuses `PERMISSIONS` from the generated catalog
 * and `nav_id` values from the navigation registry — no duplicates.
 */
import { PERMISSIONS } from "@/lib/generated/permission-keys";

/** Existing Platform routes registered under `src/routes/_authenticated/platform/`. */
export const PLATFORM_ROUTES = {
  ROOT: "/platform",
  DASHBOARD: "/platform/dashboard",
  TENANTS: "/platform/tenants",
  COMPANIES: "/platform/companies",
} as const;

export type PlatformRoute = (typeof PLATFORM_ROUTES)[keyof typeof PLATFORM_ROUTES];

/** Stable `nav_id`s already registered in `src/lib/navigation/registry.ts`. */
export const PLATFORM_NAV_IDS = {
  TENANTS: "administration.platform.tenants",
  COMPANIES: "administration.platform.companies",
  BRANCHES: "administration.platform.branches",
  FINANCIAL_YEARS: "administration.platform.financial_years",
} as const;

/** Platform permission keys — re-exported so consumers import from one place. */
export const PLATFORM_PERMISSIONS = {
  DASHBOARD_VIEW: PERMISSIONS.PLATFORM_DASHBOARD_VIEW,
  SETTINGS_MANAGE: PERMISSIONS.PLATFORM_SETTINGS_MANAGE,
  TENANT_READ: PERMISSIONS.PLATFORM_TENANT_READ,
  COMPANY_READ: PERMISSIONS.PLATFORM_COMPANY_READ,
  BRANCH_READ: PERMISSIONS.PLATFORM_BRANCH_READ,
  FINANCIAL_YEAR_READ: PERMISSIONS.PLATFORM_FINANCIAL_YEAR_READ,
} as const;

/** Feature-flag keys the Platform foundation reserves for future phases. */
export const PLATFORM_FEATURE_FLAGS = {
  /** Enables Tenant Registry surfaces once Phase 2 ships. */
  TENANT_REGISTRY: "platform_tenant_registry",
  /** Enables the Tenant Provisioning engine once Phase 3 ships. */
  TENANT_PROVISIONING: "platform_tenant_provisioning",
  /** Enables Tenant Lifecycle transitions once Phase 4 ships. */
  TENANT_LIFECYCLE: "platform_tenant_lifecycle",
} as const;

export type PlatformFeatureFlag =
  (typeof PLATFORM_FEATURE_FLAGS)[keyof typeof PLATFORM_FEATURE_FLAGS];
