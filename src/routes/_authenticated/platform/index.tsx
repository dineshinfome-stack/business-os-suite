/**
 * SPR-PLT-0005 — Super Admin Dashboard (Worksuite-inspired)
 *
 * Presentation-only KPI + reports layout. All values are sample data
 * (marked `Sample`) and will be wired to live signals in a later sprint.
 */
import { createFileRoute } from "@tanstack/react-router";
import {
  Store,
  CheckCircle2,
  Ban,
  StoreIcon,
  Package,
  type LucideIcon,
} from "lucide-react";

import { Can } from "@/components/auth/Can";
import { Badge } from "@/components/ui/badge";
import { ReportPanel, EmptyPanel } from "@/components/dashboard/ReportPanel";

export const Route = createFileRoute("/_authenticated/platform/")({
  component: PlatformAdministrationPage,
  head: () => ({
    meta: [
      { title: "Super Admin Dashboard — Business OS" },
      {
        name: "description",
        content: "Super Admin control center: companies, packages, billing, and platform KPIs.",
      },
      { property: "og:title", content: "Super Admin Dashboard — Business OS" },
      {
        property: "og:description",
        content: "Super Admin control center: companies, packages, billing, and platform KPIs.",
      },
    ],
  }),
});

function Kpi({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div
      className="relative flex items-start justify-between rounded-md border bg-card p-5"
      style={{ borderColor: "var(--brand-border)", boxShadow: "var(--elevation-1)" }}
    >
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div
          className="mt-3 text-2xl font-semibold"
          style={{ color: "var(--kpi-value)" }}
        >
          {value}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Icon className="h-6 w-6 text-muted-foreground/50" />
        <Badge variant="outline" className="text-[10px]">Sample</Badge>
      </div>
    </div>
  );
}

function PlatformAdministrationPage() {
  return (
    <Can
      permission="platform.settings.manage"
      fallback={
        <div className="p-8">
          <h1 className="text-2xl font-semibold">Not authorized</h1>
          <p className="mt-2 text-muted-foreground">
            You do not have permission to access Platform Administration.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI row 1 */}
        <div className="grid gap-5 md:grid-cols-3">
          <Kpi label="Total Companies" value="6" icon={Store} />
          <Kpi label="Active Companies" value="6" icon={CheckCircle2} />
          <Kpi label="License Expired" value="0" icon={Ban} />
        </div>
        {/* KPI row 2 */}
        <div className="grid gap-5 md:grid-cols-3">
          <Kpi label="Inactive Companies" value="0" icon={StoreIcon} />
          <Kpi label="Total Packages" value="4" icon={Package} />
          <div className="hidden md:block" />
        </div>

        {/* Reports */}
        <div className="grid gap-5 lg:grid-cols-2">
          <ReportPanel
            title="Earning Reports"
            right="Total"
            sample
            totals={[
              { label: "Total Earnings", value: "$0.00" },
              { label: "This Year", value: "$0.00" },
              { label: "This Month", value: "$0.00" },
            ]}
            rowsHeader={["Month", "Income"]}
            rows={[
              { label: "July 2026", value: "$0.00" },
              { label: "June 2026", value: "$0.00" },
              { label: "May 2026", value: "$0.00" },
              { label: "April 2026", value: "$0.00" },
              { label: "March 2026", value: "$0.00" },
            ]}
          />
          <ReportPanel
            title="Subscription Overview"
            sample
            totals={[
              { label: "Active Subscriptions", value: "6" },
              { label: "New This Month", value: "0" },
            ]}
            rowsHeader={["Month", "Subscriptions"]}
            rows={[
              { label: "July 2026", value: "0" },
              { label: "June 2026", value: "0" },
              { label: "May 2026", value: "0" },
              { label: "April 2026", value: "0" },
              { label: "March 2026", value: "0" },
            ]}
          />
        </div>

        {/* Bottom row */}
        <div className="grid gap-5 lg:grid-cols-2">
          <EmptyPanel title="Top Paying Companies" columns={["Name", "Amount"]} sample />
          <EmptyPanel title="Payment Gateway Breakdown" columns={["Payment Gateway", "Amount"]} sample />
        </div>
      </div>
    </Can>
  );
}
