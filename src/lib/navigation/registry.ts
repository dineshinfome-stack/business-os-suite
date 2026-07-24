/**
 * Sprint 0.7 — Navigation Framework
 * Immutable navigation registry.
 *
 * ────────────────────────────────────────────────────────────────
 * STABLE nav_id CONTRACT
 * ────────────────────────────────────────────────────────────────
 * `nav_id` is a PERMANENT identifier and part of the platform's
 * persisted data contract (favorites, command history, expanded groups,
 * future pinned modules & dashboards).
 *
 *   1. Once shipped, a `nav_id` MUST NOT be renamed.
 *   2. Route changes update the `route` field only — not the id.
 *   3. Removed items are marked `id_status: 'retired'` — NEVER reassigned.
 *   4. Splits produce new ids; the original is retired.
 *
 * IDENTITY vs ROUTING (see README.md §1.2)
 *   `nav_id` → persisted identity (favorites, history, prefs)
 *   `route`  → runtime routing & URL matching (TanStack Router, breadcrumbs)
 *   Never use `nav_id` as a routing key. Never key persisted nav references by `route`.
 *
 * Id format: `^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$`
 * ────────────────────────────────────────────────────────────────
 */
import {
  LayoutDashboard,
  Settings,
  Shield,
  Cog,
  Building2,
  Users,
  Mail,
  Landmark,
} from "lucide-react";

import type { ComponentType } from "react";
import type { PermissionKey } from "@/lib/generated/permission-keys";

export type NavIdStatus = "active" | "retired";

export interface NavItem {
  /** Permanent stable identifier — see contract at top of file. */
  id: string;
  id_status: NavIdStatus;
  module: string;
  title: string;
  icon?: ComponentType<{ className?: string }>;
  /** URL route (may include $params). Independent from `id`. */
  route: string | null;
  /** Parent nav_id, or null for top-level module. */
  parent: string | null;
  display_order: number;
  /** Optional required permission. */
  permission?: PermissionKey;
  /** Optional feature flag gate. */
  feature_flag?: string;
  visible: boolean;
  enabled: boolean;
  /** Free-text search keywords beyond title/module. */
  keywords?: string[];
}

export const NAV_ID_REGEX = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/;

/** Registry health thresholds (v7 §14.2 — warn-only). */
export const MAX_CHILDREN_PER_MODULE = 25;
export const MAX_TOTAL_ITEMS = 400;

/** Persisted tables that reference `nav_id` (identity, not route). */
export const PERSISTED_NAV_TABLES = [
  "nav_favorites",
  "nav_command_history",
] as const;

/**
 * Core registry. Additive-only: never rename ids; retire instead.
 */
export const NAV_REGISTRY: readonly NavItem[] = Object.freeze([
  // ── Main / Workspace ────────────────────────────────────────────
  {
    id: "workspace",
    id_status: "active",
    module: "workspace",
    title: "Workspace",
    route: null,
    parent: null,
    display_order: 10,
    visible: true,
    enabled: true,
  },
  {
    id: "workspace.dashboard",
    id_status: "active",
    module: "workspace",
    title: "Dashboard",
    icon: LayoutDashboard,
    route: "/dashboard",
    parent: "workspace",
    display_order: 10,
    visible: true,
    enabled: true,
    keywords: ["home", "overview"],
  },
  {
    id: "workspace.hub",
    id_status: "active",
    module: "workspace",
    title: "Workspace",
    icon: Building2,
    route: "/workspace",
    parent: "workspace",
    display_order: 20,
    permission: "workspace.workspace.read",
    visible: true,
    enabled: true,
    keywords: ["organization", "profile", "branding", "team", "invitations"],
  },
  {
    id: "workspace.team",
    id_status: "active",
    module: "workspace",
    title: "Team",
    icon: Users,
    route: "/workspace",
    parent: "workspace",
    display_order: 30,
    permission: "workspace.member.read",
    visible: true,
    enabled: true,
    keywords: ["members", "directory"],
  },
  {
    id: "workspace.invitations",
    id_status: "active",
    module: "workspace",
    title: "Invitations",
    icon: Mail,
    route: "/workspace",
    parent: "workspace",
    display_order: 40,
    permission: "workspace.invitation.read",
    visible: true,
    enabled: true,
    keywords: ["invite", "join"],
  },

  // ── Administration ──────────────────────────────────────────────
  {

    id: "administration",
    id_status: "active",
    module: "administration",
    title: "Administration",
    icon: Shield,
    route: null,
    parent: null,
    display_order: 90,
    visible: true,
    enabled: true,
  },
  {
    id: "administration.settings",
    id_status: "active",
    module: "administration",
    title: "Settings",
    icon: Settings,
    route: "/settings",
    parent: "administration",
    display_order: 10,
    visible: true,
    enabled: true,
    keywords: ["preferences", "configuration"],
  },
  {
    id: "administration.settings.platform",
    id_status: "active",
    module: "administration",
    title: "Platform Settings",
    icon: Cog,
    route: "/settings/platform",
    parent: "administration.settings",
    display_order: 10,
    permission: "settings.security.manage",
    visible: true,
    enabled: true,
    keywords: ["platform", "security"],
  },
  {
    id: "administration.platform.tenants",
    id_status: "active",
    module: "administration",
    title: "Tenants",
    icon: Landmark,
    route: "/platform/tenants",
    parent: "administration",
    display_order: 20,
    permission: "platform.tenant.read",
    visible: true,
    enabled: true,
    keywords: ["tenant", "organization", "isolation", "platform admin"],
  },
  // ── SPR-MOD-001-002 — Organization Structure (SIP-017) ────────────────
  // Companies, branches, and financial years are tenant/company-scoped; nav
  // deep-links to the tenant list where the Companies tab lives, per the
  // Phase 3 nav directive (no fabricated list routes for scoped reads).
  {
    id: "administration.platform.companies",
    id_status: "active",
    module: "administration",
    title: "Companies",
    icon: Building2,
    route: "/platform/tenants",
    parent: "administration",
    display_order: 30,
    permission: "platform.company.read",
    visible: true,
    enabled: true,
    keywords: ["company", "organization", "org", "subsidiary"],
  },
  {
    id: "administration.platform.branches",
    id_status: "active",
    module: "administration",
    title: "Branches",
    icon: Building2,
    route: "/platform/tenants",
    parent: "administration",
    display_order: 31,
    permission: "platform.branch.read",
    visible: true,
    enabled: true,
    keywords: ["branch", "location", "site", "office"],
  },
  {
    id: "administration.platform.financial_years",
    id_status: "active",
    module: "administration",
    title: "Financial Years",
    icon: Landmark,
    route: "/platform/tenants",
    parent: "administration",
    display_order: 32,
    permission: "platform.financial_year.read",
    visible: true,
    enabled: true,
    keywords: ["financial year", "fiscal year", "fy", "accounting period"],
  },
] satisfies NavItem[]);

// Dev-only integrity checks — cheap and skipped in production builds.
if (import.meta.env.DEV) {
  const seen = new Set<string>();
  for (const item of NAV_REGISTRY) {
    if (seen.has(item.id)) {
      // eslint-disable-next-line no-console
      console.error(`[nav] Duplicate nav_id: ${item.id}`);
    }
    seen.add(item.id);
    if (!NAV_ID_REGEX.test(item.id)) {
      // eslint-disable-next-line no-console
      console.error(`[nav] Invalid nav_id format: ${item.id}`);
    }
  }
}

/** Returns true if the given nav_id is active in the registry. */
export function isActiveNavId(id: string): boolean {
  return NAV_REGISTRY.some((n) => n.id === id && n.id_status === "active");
}

/** Returns true if the id exists AND is retired. */
export function isRetiredNavId(id: string): boolean {
  return NAV_REGISTRY.some((n) => n.id === id && n.id_status === "retired");
}

/** Returns the active nav item by id, or undefined. */
export function getNavItem(id: string): NavItem | undefined {
  return NAV_REGISTRY.find((n) => n.id === id && n.id_status === "active");
}
