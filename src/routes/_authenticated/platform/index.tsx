/**
 * SPR-PLT-0001 — Phase A: Platform Shell & Navigation
 *
 * Landing surface for the Super Admin experience. Static placeholder that
 * enumerates future phases (Dashboard, Tenant Provisioning, Licensing,
 * Audit, User Management). No queries, no server functions, no metrics.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  KeyRound,
  ScrollText,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import { Can } from "@/components/auth/Can";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/platform/")({
  component: PlatformAdministrationPage,
  head: () => ({
    meta: [
      { title: "Platform Administration — Super Admin" },
      {
        name: "description",
        content:
          "Super Admin landing surface for platform-wide administration of the Business OS.",
      },
      { property: "og:title", content: "Platform Administration — Super Admin" },
      {
        property: "og:description",
        content:
          "Super Admin landing surface for platform-wide administration of the Business OS.",
      },
    ],
  }),
});

type PhaseCard = {
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
  status: "available" | "planned";
  to?: "/platform/tenants";
};

const PHASES: readonly PhaseCard[] = [
  {
    title: "Tenants",
    description:
      "Provision, activate, suspend, and archive platform tenants.",
    icon: Building2,
    status: "available",
    to: "/platform/tenants",
  },
  {
    title: "Super Admin Dashboard",
    description:
      "Platform-wide KPIs, tenant health, and operational signals.",
    icon: LayoutDashboard,
    status: "planned",
  },
  {
    title: "Tenant Provisioning",
    description:
      "Guided workflow for onboarding new tenants with defaults and seeds.",
    icon: Building2,
    status: "planned",
  },
  {
    title: "Licensing",
    description:
      "Subscription plans, seat allocation, and entitlement management.",
    icon: KeyRound,
    status: "planned",
  },
  {
    title: "Audit",
    description:
      "Cross-tenant audit trail and compliance-grade activity browser.",
    icon: ScrollText,
    status: "planned",
  },
  {
    title: "User Management",
    description:
      "Platform-level identity, role assignment, and access reviews.",
    icon: Users,
    status: "planned",
  },
];

function PlatformAdministrationPage() {
  return (
    <Can
      permission="platform.settings.manage"
      fallback={
        <div className="p-8">
          <h1 className="text-2xl font-semibold">Not authorized</h1>
          <p className="text-muted-foreground mt-2">
            You do not have permission to access Platform Administration.
          </p>
        </div>
      }
    >
      <div className="p-6 md:p-8 space-y-6 max-w-6xl">
        <header className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 text-primary p-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Platform Administration
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Super Admin control surface for the Business OS. This landing
              page consolidates platform-wide capabilities delivered across
              upcoming implementation phases.
            </p>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            const body = (
              <Card
                className={
                  phase.status === "available"
                    ? "h-full transition-colors hover:border-primary/40"
                    : "h-full opacity-80"
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="rounded-md bg-muted p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    {phase.status === "available" ? (
                      <Badge variant="secondary">Available</Badge>
                    ) : (
                      <Badge variant="outline">Planned</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3 text-lg">{phase.title}</CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                {phase.status === "available" && phase.to ? (
                  <CardContent>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                ) : null}
              </Card>
            );

            return phase.status === "available" && phase.to ? (
              <Link key={phase.title} to={phase.to} className="block">
                {body}
              </Link>
            ) : (
              <div key={phase.title}>{body}</div>
            );
          })}
        </div>
      </div>
    </Can>
  );
}
