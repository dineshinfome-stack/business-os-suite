import {
  Gauge,
  LayoutDashboard,
  Package,
  Building2,
  ServerCog,
  Receipt,
  HelpCircle,
  ShieldCheck,
  FileClock,
  LifeBuoy,
  Palette,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type PlatformNavChild = {
  id: string;
  label: string;
  to: string;
  exact?: boolean;
};

export type PlatformNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: string;
  exact?: boolean;
  children?: PlatformNavChild[];
};


/**
 * Worksuite-inspired Platform Admin navigation.
 * Only "Dashboard" and "Companies" (Tenants) are wired to existing routes;
 * the rest resolve to a shared "Coming soon" placeholder.
 */
export const PLATFORM_NAV: PlatformNavItem[] = [
  {
    id: "platform-dashboard",
    label: "Platform Dashboard",
    icon: Gauge,
    to: "/platform/dashboard",
    exact: true,
  },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/platform", exact: true },
  { id: "packages", label: "Packages", icon: Package, to: "/platform/packages" },
  { id: "companies", label: "Companies", icon: Building2, to: "/platform/tenants" },
  {
    id: "provisioning",
    label: "Provisioning",
    icon: ServerCog,
    to: "/platform/provisioning",
    children: [
      {
        id: "provisioning-overview",
        label: "Overview",
        to: "/platform/provisioning",
        exact: true,
      },
      { id: "provisioning-history", label: "History", to: "/platform/provisioning/history" },
      { id: "provisioning-queue", label: "Live queue", to: "/platform/provisioning/queue" },
      { id: "provisioning-failed", label: "Failures", to: "/platform/provisioning/failed" },
      { id: "provisioning-health", label: "Provider health", to: "/platform/provisioning/health" },
    ],
  },

  { id: "billing", label: "Billing", icon: Receipt, to: "/platform/billing" },
  { id: "faq", label: "Admin FAQ", icon: HelpCircle, to: "/platform/faq" },
  { id: "super-admin", label: "Platform Admin", icon: ShieldCheck, to: "/platform/super-admin" },
  { id: "offline", label: "Offline Request", icon: FileClock, to: "/platform/offline-requests" },
  { id: "support", label: "Support Ticket", icon: LifeBuoy, to: "/platform/support" },
  { id: "front", label: "Front Settings", icon: Palette, to: "/platform/front-settings" },
  { id: "settings", label: "Settings", icon: Settings, to: "/platform/settings" },
];
