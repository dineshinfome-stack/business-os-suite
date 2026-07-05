import { createFileRoute, Link } from "@tanstack/react-router";
import { getDoc } from "../lib/docs";
import { MarkdownDoc } from "../components/MarkdownDoc";

export const Route = createFileRoute("/docs/")({
  head: () => ({
    meta: [
      { title: "BusinessOS ERP — Documentation Suite" },
      {
        name: "description",
        content:
          "Enterprise documentation suite for BusinessOS ERP: Canon, Vision, Architecture, ADRs, Engines, Domains, and more.",
      },
    ],
  }),
  component: DocsIndex,
});

const CAPABILITY_LAYERS = [
  { name: "Platform", detail: "Foundation, Auth, Users, Roles, Workflow, Notifications, Audit, Documents" },
  { name: "Financial Platform", detail: "Accounting Engine, Voucher Engine, Tax Engine, GST/TDS/TCS, Statements" },
  { name: "Operations Platform", detail: "Inventory, Sales, Purchase, Manufacturing" },
  { name: "Business Platform", detail: "CRM, Projects, AMC, Field Service" },
  { name: "People Platform", detail: "HRMS, Payroll, Assets, Fleet" },
  { name: "Intelligence Platform", detail: "Analytics, AI Copilot, Automation" },
];

const QUICK_LINKS = [
  { title: "Canon", path: "canon", desc: "The constitution — principles every PRD must cite." },
  { title: "Vision", path: "00-vision/vision", desc: "Product vision and North Star." },
  { title: "Master PRD", path: "01-master/prd", desc: "Master Product Requirement Document." },
  { title: "Roadmap", path: "01-master/roadmap", desc: "Capability-layer phasing." },
  { title: "Master Architecture", path: "02-architecture/master-architecture", desc: "Top-level architecture." },
  { title: "Domain Map", path: "02-architecture/domain-map", desc: "Bounded contexts and their relationships." },
  { title: "Decision Register", path: "decision-register", desc: "Index of Architecture Decision Records." },
  { title: "Quality Attributes", path: "quality-attributes", desc: "System-wide quality goals." },
];

function DocsIndex() {
  const readme = getDoc("README");
  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pass 1 — Skeleton
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          BusinessOS ERP — Documentation Suite
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          The single source of truth for BusinessOS ERP. This suite is delivered in staged passes:
          the current pass ships the full skeleton, navigation, search, and diagram support.
          Content is filled in section by section, starting with the Canon.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.path}
              to="/docs/$"
              params={{ _splat: q.path }}
              className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <div className="font-medium">{q.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{q.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Capability-layer roadmap</h2>
        <ol className="space-y-2">
          {CAPABILITY_LAYERS.map((l, i) => (
            <li key={l.name} className="flex gap-3 rounded-md border border-border bg-card p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <div className="font-medium">{l.name}</div>
                <div className="text-sm text-muted-foreground">{l.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {readme && (
        <section className="border-t border-border pt-8">
          <MarkdownDoc body={readme.body} />
        </section>
      )}
    </div>
  );
}
