/**
 * Platform Admin Dashboard — ServiceNow Next Experience inspired.
 * Presentation-only; all values are sample data.
 */
import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal, Info, RefreshCw, Pencil, ChevronDown } from "lucide-react";

import { Can } from "@/components/auth/Can";
import { Badge } from "@/components/ui/badge";
import { EmptyIllustration } from "@/components/dashboard/EmptyIllustration";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/_authenticated/platform/")({
  component: PlatformAdministrationPage,
  head: () => ({
    meta: [
      { title: "Platform Admin Dashboard — Business OS" },
      {
        name: "description",
        content: "Platform Admin control center: monitor incidents, requests, changes, and platform health.",
      },
      { property: "og:title", content: "Platform Admin Dashboard — Business OS" },
      {
        property: "og:description",
        content: "Platform Admin control center: monitor incidents, requests, changes, and platform health.",
      },
    ],
  }),
});

function Sparkline({ trend = "down" }: { trend?: "down" | "up" | "flat" }) {
  const path =
    trend === "down"
      ? "M2 6 L20 8 L40 12 L60 18 L80 26 L98 34"
      : trend === "up"
        ? "M2 34 L20 28 L40 22 L60 16 L80 10 L98 6"
        : "M2 20 L98 20";
  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full" aria-hidden>
      <path d={path} stroke="var(--sn-accent-cyan)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function KpiCard({
  label,
  value,
  empty = false,
  trend,
  showInfo = false,
}: {
  label: string;
  value?: string;
  empty?: boolean;
  trend?: "down" | "up" | "flat";
  showInfo?: boolean;
}) {
  return (
    <div
      className="group flex min-h-[180px] flex-col rounded-md border bg-white p-4"
      style={{ borderColor: "var(--sn-border)" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium" style={{ color: "var(--sn-text)" }}>
            {label}
          </span>
          {showInfo && <Info className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[9px] font-normal">Sample</Badge>
          <button
            type="button"
            aria-label="More"
            className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <EmptyIllustration className="h-14 w-20" />
          <div className="text-sm font-medium" style={{ color: "var(--sn-text)" }}>
            No data available.
          </div>
          <div className="text-xs" style={{ color: "var(--sn-text-muted)" }}>
            There is no data available for the selected criteria.
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center">
          <div className="text-5xl font-light tracking-tight" style={{ color: "var(--sn-text)" }}>
            {value}
          </div>
          {trend && (
            <div className="mt-2">
              <Sparkline trend={trend} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompactKpi({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col rounded-md border bg-white p-4"
      style={{ borderColor: "var(--sn-border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: "var(--sn-accent-green)" }}
            aria-hidden
          />
          <span style={{ color: "var(--sn-text)" }}>{label}</span>
        </div>
        <button aria-label="More" className="rounded p-1 text-muted-foreground hover:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-6 text-5xl font-light" style={{ color: "var(--sn-text)" }}>
        {value}
      </div>
    </div>
  );
}

function PlatformAdministrationPage() {
  const { profile, user } = useAuth();
  const name = profile?.displayName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "System";

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
      <div>
        {/* Hero band */}
        <section className="sn-hero-band px-8 py-10">
          <div className="sn-hero-dots" aria-hidden />
          <div className="relative">
            <h1
              className="text-3xl font-semibold tracking-tight"
              style={{ color: "var(--sn-hero-fg)" }}
            >
              Welcome to Admin Home, {name}!
            </h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--sn-hero-fg-muted)" }}>
              Manage, monitor, and discover all your day-to-day administrative actions and tools
              across the platform.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-semibold" style={{ color: "var(--sn-text)" }}>
            Track what's important to you
          </h2>

          {/* Dashboard title row */}
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-2xl font-semibold"
              style={{ color: "var(--sn-text)" }}
            >
              Shared admin dashboard
              <ChevronDown className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1">
              <button aria-label="Refresh" className="rounded p-2 text-muted-foreground hover:bg-muted">
                <RefreshCw className="h-4 w-4" />
              </button>
              <button aria-label="Info" className="rounded p-2 text-muted-foreground hover:bg-muted">
                <Info className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
                style={{ borderColor: "var(--sn-border)", color: "var(--sn-text)" }}
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button aria-label="More" className="rounded p-2 text-muted-foreground hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* KPI grid — row 1 */}
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Open incidents" empty showInfo />
            <KpiCard label="Open request items" empty showInfo />
            <KpiCard label="Problems" value="14" />
            <KpiCard label="Hardening compliance score" value="88%" trend="down" />
          </div>

          {/* KPI grid — row 2 */}
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <CompactKpi label="Open P1 incidents" value="0" />
            <CompactKpi label="Aging incidents over 24 hrs" value="0" />
            <CompactKpi label="Request items over 24 hrs" value="0" />
            <CompactKpi label="Request items awaiting approval" value="0" />
            <CompactKpi label="Changes" value="5" />
            <CompactKpi label="Customer Actions" value="2" />
          </div>

          {/* Info panel */}
          <div
            className="mt-8 rounded-md border bg-white p-6"
            style={{ borderColor: "var(--sn-border)" }}
          >
            <h3 className="text-lg font-semibold" style={{ color: "var(--sn-text)" }}>
              Get information about your instance
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--sn-text-muted)" }}>
              Instance details, health, and version information will appear here.
            </p>
          </div>
        </div>
      </div>
    </Can>
  );
}
