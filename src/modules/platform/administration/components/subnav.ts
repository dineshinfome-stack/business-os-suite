/**
 * Gate 3.7 · Administration section sub-navigation (presentation constant).
 */
export type AdministrationSubNavItem = {
  label: string;
  to:
    | "/platform/admin"
    | "/platform/admin/attention"
    | "/platform/admin/tenants"
    | "/platform/admin/providers"
    | "/platform/admin/settings"
    | "/platform/admin/features"
    | "/platform/admin/audit"
    | "/platform/admin/notifications";
  exact?: boolean;
};

export const ADMINISTRATION_SUBNAV: AdministrationSubNavItem[] = [
  { label: "Operations", to: "/platform/admin", exact: true },
  { label: "Attention", to: "/platform/admin/attention" },
  { label: "Tenant operations", to: "/platform/admin/tenants" },
  { label: "Providers & regions", to: "/platform/admin/providers" },
  { label: "Settings", to: "/platform/admin/settings" },
  { label: "Feature controls", to: "/platform/admin/features" },
  { label: "Audit explorer", to: "/platform/admin/audit" },
  { label: "Notifications", to: "/platform/admin/notifications" },
];
