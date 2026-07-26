/**
 * Gate 3.4 · Provisioning section sub-navigation (presentation constant).
 */
export type ProvisioningSubNavItem = {
  label: string;
  to:
    | "/platform/provisioning"
    | "/platform/provisioning/history"
    | "/platform/provisioning/queue"
    | "/platform/provisioning/failed"
    | "/platform/provisioning/health";
  exact?: boolean;
};

export const PROVISIONING_SUBNAV: ProvisioningSubNavItem[] = [
  { label: "Overview", to: "/platform/provisioning", exact: true },
  { label: "History", to: "/platform/provisioning/history" },
  { label: "Live queue", to: "/platform/provisioning/queue" },
  { label: "Failures", to: "/platform/provisioning/failed" },
  { label: "Provider health", to: "/platform/provisioning/health" },
];
