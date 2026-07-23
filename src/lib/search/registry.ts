/**
 * Sprint 0.9 — Search Registry
 *
 * STABILITY CONTRACT — see docs/15-governance/SEARCH_REGISTRY_STANDARD.md
 * Once a resourceType ships with `status: "active"` it is IMMUTABLE. Retire
 * to add a replacement.
 */
import {
  Settings as SettingsIcon,
  BarChart3,
  Users,
  Building2,
  Briefcase,
  FileText,
  Package,
  Wrench,
  ClipboardList,
  Receipt,
} from "lucide-react";
import type { SearchRegistryEntry } from "./types";

export const RESOURCE_TYPE_REGEX = /^[a-z][a-z0-9_]*$/;

export const SEARCH_REGISTRY: readonly SearchRegistryEntry[] = Object.freeze([
  // ── Active (backed by routes that exist today) ──────────────────────────
  {
    resourceType: "setting",
    displayName: "Settings",
    icon: SettingsIcon,
    permission: "settings.general.view",
    keywords: ["preferences", "configuration", "options"],
    providerKey: "registry",
    status: "active",
  },
  {
    resourceType: "report",
    displayName: "Reports",
    icon: BarChart3,
    keywords: ["analytics", "insights", "dashboard"],
    providerKey: "registry",
    status: "active",
  },

  // ── Reserved (contract published; provider wired in future sprints) ─────
  { resourceType: "customer", displayName: "Customers", icon: Users,
    keywords: ["client", "contact"], providerKey: "database", status: "reserved" },
  { resourceType: "vendor", displayName: "Vendors", icon: Building2,
    keywords: ["supplier", "partner"], providerKey: "database", status: "reserved" },
  { resourceType: "employee", displayName: "Employees", icon: Users,
    keywords: ["staff", "team"], providerKey: "database", status: "reserved" },
  { resourceType: "task", displayName: "Tasks", icon: ClipboardList,
    keywords: ["todo", "activity"], providerKey: "database", status: "reserved" },
  { resourceType: "project", displayName: "Projects", icon: Briefcase,
    keywords: ["engagement", "workstream"], providerKey: "database", status: "reserved" },
  { resourceType: "invoice", displayName: "Invoices", icon: Receipt,
    keywords: ["bill", "ar"], providerKey: "database", status: "reserved" },
  { resourceType: "quotation", displayName: "Quotations", icon: FileText,
    keywords: ["quote", "estimate", "proposal"], providerKey: "database", status: "reserved" },
  { resourceType: "asset", displayName: "Assets", icon: Wrench,
    keywords: ["equipment", "inventory"], providerKey: "database", status: "reserved" },
  { resourceType: "product", displayName: "Products", icon: Package,
    keywords: ["item", "sku"], providerKey: "database", status: "reserved" },
] satisfies SearchRegistryEntry[]);

const byType = new Map<string, SearchRegistryEntry>(
  SEARCH_REGISTRY.map((e) => [e.resourceType, e]),
);

export function getSearchEntry(resourceType: string): SearchRegistryEntry | undefined {
  return byType.get(resourceType);
}

export function listActiveSearchEntries(): SearchRegistryEntry[] {
  return SEARCH_REGISTRY.filter((e) => e.status === "active");
}

export function listReservedSearchEntries(): SearchRegistryEntry[] {
  return SEARCH_REGISTRY.filter((e) => e.status === "reserved");
}

// Dev-only integrity checks.
if (import.meta.env.DEV) {
  const seen = new Set<string>();
  for (const e of SEARCH_REGISTRY) {
    if (seen.has(e.resourceType)) {
      // eslint-disable-next-line no-console
      console.error(`[search] Duplicate resourceType: ${e.resourceType}`);
    }
    seen.add(e.resourceType);
    if (!RESOURCE_TYPE_REGEX.test(e.resourceType)) {
      // eslint-disable-next-line no-console
      console.error(`[search] Invalid resourceType format: ${e.resourceType}`);
    }
  }
}
