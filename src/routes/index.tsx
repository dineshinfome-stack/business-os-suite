import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BusinessOS ERP — Cloud-Native AI-Powered Business Operating System" },
      {
        name: "description",
        content:
          "BusinessOS ERP is a cloud-native, multi-tenant, AI-powered Business Operating System combining accounting, inventory, CRM, projects, HRMS, payroll, and field service — India-first, GCC-ready, global-scale.",
      },
      {
        property: "og:title",
        content: "BusinessOS ERP — Cloud-Native AI-Powered ERP",
      },
      {
        property: "og:description",
        content:
          "Modern cloud ERP with double-entry accounting, GST/e-Invoice/e-Way Bill, inventory, CRM, HRMS, payroll, field service, and an AI Copilot in every module.",
      },
    ],
  }),
  component: Index,
});

const PILLARS = [
  {
    title: "Cloud-Native SaaS",
    body: "Multi-tenant, multi-company, multi-branch, multi-currency, multi-language, multi-financial-year.",
  },
  {
    title: "Complete Accounting",
    body: "Double-entry ledger, voucher engine, GST + e-Invoice + e-Way Bill, TDS/TCS, statements, audit trail.",
  },
  {
    title: "AI Copilot Everywhere",
    body: "AI Accountant, GST Assistant, Invoice Reader, Forecasting, Business Advisor — one Copilot per module.",
  },
  {
    title: "API-First & Event-Driven",
    body: "Clean Architecture, DDD, PostgreSQL, event bus, plugin framework, mobile-first with offline field support.",
  },
];

const LAYERS = [
  { n: 1, name: "Platform", body: "Auth, Users, Roles, Workflow, Notifications, Audit, Documents" },
  { n: 2, name: "Financial", body: "Accounting, Voucher, Tax, GST/TDS/TCS, Statements" },
  { n: 3, name: "Operations", body: "Inventory, Sales, Purchase, Manufacturing" },
  { n: 4, name: "Business", body: "CRM, Projects, AMC, Field Service" },
  { n: 5, name: "People", body: "HRMS, Payroll, Assets, Fleet" },
  { n: 6, name: "Intelligence", body: "Analytics, AI Copilot, Automation" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary" />
            <span className="text-sm font-semibold tracking-tight">BusinessOS ERP</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/docs" className="text-muted-foreground hover:text-foreground">
              Docs
            </Link>
            <Link
              to="/docs/$"
              params={{ _splat: "canon" }}
              className="text-muted-foreground hover:text-foreground"
            >
              Canon
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Business Operating System
        </p>
        <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight">
          One cloud ERP for accounting, operations, people, and AI-driven intelligence.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          BusinessOS ERP combines the strengths of Tally Prime, Odoo, Zoho One, Dynamics 365, SAP
          Business One, and Lystloc — simple enough for SMEs, scalable to the enterprise.
          India-first, GCC-ready, global-scale.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/docs"
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse the Docs Suite
          </Link>
          <Link
            to="/docs/$"
            params={{ _splat: "canon" }}
            className="inline-flex items-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Read the Canon
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Product pillars</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-lg border border-border bg-card p-5">
                <div className="font-medium">{p.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">{p.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Capability-layer roadmap</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Implementation is organized by architectural capability, not raw module lists.
        </p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LAYERS.map((l) => (
            <li key={l.n} className="flex gap-3 rounded-lg border border-border bg-card p-4">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {l.n}
              </span>
              <div>
                <div className="font-medium">{l.name}</div>
                <div className="text-sm text-muted-foreground">{l.body}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground">
          <span>BusinessOS ERP — Documentation Suite (Pass 1: Skeleton)</span>
          <Link to="/docs" className="hover:text-foreground">
            Docs →
          </Link>
        </div>
      </footer>
    </div>
  );
}
