/**
 * SPR-PLT-0005 — Super Admin Dashboard
 *
 * Presentation-only dashboard that composes the reusable Dashboard,
 * WidgetCard, StatCard, ActivityFeed, Progress, and Table widgets.
 * All numeric values are sample data (marked `Sample`) and will be
 * replaced by live signals in a subsequent data sprint.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  KeyRound,
  ScrollText,
  Users,
  ShieldCheck,
  ArrowRight,
  Activity,
  Server,
  Gauge,
  UserPlus,
} from "lucide-react";

import { Can } from "@/components/auth/Can";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dashboard,
  DashboardRow,
  DashboardSection,
  StatCard,
  ActivityFeedWidget,
  ProgressWidget,
  TableWidget,
} from "@/components/dashboard";

export const Route = createFileRoute("/_authenticated/platform/")({
  component: PlatformAdministrationPage,
  head: () => ({
    meta: [
      { title: "Platform Administration — Super Admin" },
      {
        name: "description",
        content:
          "Super Admin control center for the Business OS platform: tenants, licensing, audit, and health.",
      },
      { property: "og:title", content: "Platform Administration — Super Admin" },
      {
        property: "og:description",
        content:
          "Super Admin control center for the Business OS platform: tenants, licensing, audit, and health.",
      },
    ],
  }),
});

const QUICK_LINKS = [
  {
    title: "Tenants",
    description: "Provision, activate, suspend, archive.",
    icon: Building2,
    to: "/platform/tenants" as const,
    available: true,
  },
  {
    title: "Licensing",
    description: "Plans, seats, and entitlements.",
    icon: KeyRound,
    available: false,
  },
  {
    title: "Audit",
    description: "Cross-tenant activity trail.",
    icon: ScrollText,
    available: false,
  },
  {
    title: "Users",
    description: "Platform identities and roles.",
    icon: Users,
    available: false,
  },
] as const;

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
      <div className="space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Super Admin
              </p>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Platform Control Center
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Cross-tenant health, licensing, and administration for the Business OS.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/platform/tenants">
              <Building2 className="h-4 w-4" /> Manage tenants
            </Link>
          </Button>
        </header>

        <DashboardSection title="Overview" description="Platform-wide operational signals.">
          <Dashboard>
            <StatCard
              label="Active tenants"
              value="—"
              delta={{ value: "+0", direction: "flat" }}
              icon={Building2}
              hint="last 30d"
              sample
            />
            <StatCard
              label="Active users"
              value="—"
              delta={{ value: "+0", direction: "flat" }}
              icon={Users}
              hint="last 30d"
              sample
            />
            <StatCard
              label="Uptime"
              value="99.9%"
              delta={{ value: "stable", direction: "flat" }}
              icon={Gauge}
              hint="30-day SLA"
              sample
            />
            <StatCard
              label="Incidents"
              value="0"
              delta={{ value: "0", direction: "flat" }}
              icon={Activity}
              hint="open"
              sample
            />
          </Dashboard>
        </DashboardSection>

        <DashboardRow>
          <div className="lg:col-span-2">
            <TableWidget
              title="Recent tenants (sample)"
              rows={[
                { id: "t-001", name: "Acme Trading", status: "Active", created: "2 days ago" },
                { id: "t-002", name: "Northwind Ltd", status: "Trial", created: "5 days ago" },
                { id: "t-003", name: "Contoso GmbH", status: "Active", created: "1 week ago" },
              ]}
              columns={[
                { key: "name", header: "Tenant", render: (r) => r.name },
                {
                  key: "status",
                  header: "Status",
                  render: (r) => <Badge variant="secondary">{r.status}</Badge>,
                },
                {
                  key: "created",
                  header: "Created",
                  align: "right",
                  render: (r) => (
                    <span className="text-muted-foreground">{r.created}</span>
                  ),
                },
              ]}
            />
          </div>
          <ActivityFeedWidget
            title="Platform activity"
            items={[
              {
                id: "a1",
                icon: <UserPlus className="h-4 w-4" />,
                title: "Super admin signed in",
                meta: "Session established",
                timestamp: "just now",
              },
              {
                id: "a2",
                icon: <Server className="h-4 w-4" />,
                title: "Migrations verified",
                meta: "0 drift",
                timestamp: "today",
              },
            ]}
          />
        </DashboardRow>

        <DashboardRow>
          <ProgressWidget
            title="Capacity (sample)"
            rows={[
              { label: "Database", value: 24, right: "24%" },
              { label: "Storage", value: 12, right: "12%" },
              { label: "AI credits", value: 8, right: "8%" },
            ]}
          />
          <div className="lg:col-span-2">
            <DashboardSection title="Quick actions">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {QUICK_LINKS.map((q) => {
                  const Icon = q.icon;
                  const body = (
                    <Card
                      className={
                        q.available
                          ? "h-full transition-colors hover:border-primary/40"
                          : "h-full opacity-70"
                      }
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="rounded-md bg-surface-3 p-2">
                            <Icon className="h-4 w-4" />
                          </div>
                          <Badge variant={q.available ? "secondary" : "outline"}>
                            {q.available ? "Available" : "Planned"}
                          </Badge>
                        </div>
                        <CardTitle className="mt-3 text-base">{q.title}</CardTitle>
                        <CardDescription>{q.description}</CardDescription>
                      </CardHeader>
                      {q.available && "to" in q && q.to ? (
                        <CardContent>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                            Open <ArrowRight className="h-4 w-4" />
                          </span>
                        </CardContent>
                      ) : null}
                    </Card>
                  );
                  return q.available && "to" in q && q.to ? (
                    <Link key={q.title} to={q.to} className="block">
                      {body}
                    </Link>
                  ) : (
                    <div key={q.title}>{body}</div>
                  );
                })}
              </div>
            </DashboardSection>
          </div>
        </DashboardRow>
      </div>
    </Can>
  );
}
