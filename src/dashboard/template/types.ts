/**
 * SPR-MOD-001-003 — Enterprise Dashboard Template
 *
 * Single template consumed by Platform, Tenant, Company, Branch, and
 * future module dashboards. Composition and visibility are driven by
 * configuration + permissions, not by per-page code.
 */
import type { ComponentType, ReactNode } from "react";
import type { PermissionKey } from "@/lib/generated/permission-keys";

export type DashboardContext =
  | "platform"
  | "tenant"
  | "company"
  | "branch"
  | "module";

export interface QuickAction {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick?: () => void;
  to?: string;
  permission?: PermissionKey;
  disabled?: boolean;
}

export interface WidgetRegistryEntry {
  id: string;
  title?: string;
  component: ComponentType;
  permission?: PermissionKey;
}

export type WidgetRegistry = Record<string, WidgetRegistryEntry>;

export interface DashboardConfig {
  /** Page title shown in the header. */
  title: string;
  /** Optional supporting copy under the title. */
  description?: string;
  /** Extra node rendered next to the title (chips, badges, buttons). */
  headerActions?: ReactNode;
  /** Enable/disable the Quick Actions section. */
  quickActions?: boolean | { items: QuickAction[] };
  /** Enable/disable the Recent Activity section. */
  recentActivity?: boolean;
  /** Enable/disable the Notifications summary section. */
  notifications?: boolean;
  /**
   * IDs from the widget registry to render in the widgets grid.
   * Items the caller lacks permission for are silently filtered.
   */
  widgets?: string[];
  /** Optional custom slot rendered under the widgets grid. */
  footer?: ReactNode;
}

export interface DashboardTemplateProps {
  context: DashboardContext;
  config: DashboardConfig;
  /**
   * Widget registry to resolve `config.widgets` against. When omitted the
   * default registry (built from all registered adapters) is used.
   */
  registry?: WidgetRegistry;
}
