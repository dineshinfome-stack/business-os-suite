
# BusinessOS ERP — Documentation Suite Bootstrap (v4, approved)

## Goal

Establish the **single source of truth** for BusinessOS ERP as:
1. **Markdown files in the repo** under `/docs/` — canonical, AI-friendly, Lovable-readable.
2. **A browsable docs site inside the app** at `/docs/*` — navigable, searchable, styled, SSR-safe.

**Delivery is staged.** This pass (Pass 1) ships the **documentation skeleton + the docs site**, not full content. Subsequent passes fill content section-by-section so each pass is small enough to review, correct, and keep consistent with the Canon.

---

## Pass 1 — Skeleton + Docs Site (what ships now)

### A. Full folder + file skeleton under `/docs/`

Every file listed below is created with:
- **Frontmatter** (`title`, `summary`, `layer`, `owner`, `status: draft`, `updated`, `tags`, `depends_on`).
- **Empty section headings** matching the canonical template for that document type.
- **Cross-link stubs** to related docs (Canon, ADRs, engines, events, etc.), so navigation works from day one.
- No prose beyond a one-line summary per section.

### B. Docs site inside the app

New routes:

```text
src/routes/
  docs.tsx         ← layout: sidebar nav + <Outlet />, TOC, search
  docs.index.tsx   ← /docs landing
  docs.$.tsx       ← splat: renders any /docs/<path> markdown or .mmd file
```

- Markdown compiled at build time via `import.meta.glob('/docs/**/*.md', { as: 'raw', eager: true })` — SSR/prerender-safe.
- `.mmd` (Mermaid ERDs) globbed the same way; rendered as Mermaid diagrams.
- Frontmatter parsed with `gray-matter`.
- Renderer: `react-markdown` + `remark-gfm` + `remark-frontmatter` + `rehype-slug` + `rehype-autolink-headings` + `rehype-pretty-code` (shiki).
- Mermaid: client-only dynamic import (SSR-safe).
- Sidebar generated from `docs/_meta.json` (grouped 00–14).
- Search: `fuse.js` over a compile-time index of headings + summary + first paragraph.
- Each `/docs/<path>` route derives `head()` `title`/`description` from frontmatter for shareable SEO.
- Relative markdown links between docs rewritten to router links.

Landing page (`src/routes/index.tsx`) replaces the blank-app placeholder with a real BusinessOS ERP intro that links into `/docs`, `/docs/canon`, and the roadmap.

### C. Skeleton file tree

```text
docs/
  README.md
  _meta.json
  canon.md
  glossary.md
  governance.md
  performance.md
  migration-strategy.md
  module-dependency-matrix.md
  decision-register.md                   ← ADR index (Number · Decision · Status · Date · Superseded By)
  quality-attributes.md                  ← Availability · Scalability · Reliability · Security · Maintainability · Performance · Observability · Extensibility

  00-vision/
    vision.md

  01-master/
    prd.md
    frs.md
    srs.md
    roadmap.md                           ← capability-layer phasing

  02-architecture/
    master-architecture.md
    database-architecture.md
    database-standards.md
    data-dictionary.md
    domain-driven-design.md
    domain-map.md
    multi-tenant-architecture.md
    security-architecture.md
    api-architecture.md
    event-catalog.md
    ai-architecture.md
    deployment-architecture.md
    devops-architecture.md
    testing-strategy.md

  03-design/
    ui-ux-design-system.md
    ux-standards.md
    coding-standards.md

  04-domains/
    foundation/
      authentication.md
      organization.md
      company.md
      branch.md
      financial-year.md
      users.md
      roles-permissions.md
      audit.md
      notifications.md
      workflow.md
      documents.md
    accounting/           (skeleton only, empty index.md)
    inventory/            (skeleton only)
    sales/                (skeleton only)
    purchase/             (skeleton only)
    crm/                  (skeleton only)
    manufacturing/        (skeleton only)
    projects/             (skeleton only)
    field-service/        (skeleton only)
    amc/                  (skeleton only)
    hr/                   (skeleton only)
    payroll/              (skeleton only)
    assets/               (skeleton only)
    fleet/                (skeleton only)
    pos/                  (skeleton only)
    service-desk/         (skeleton only)
    analytics/            (skeleton only)

  05-adr/
    ADR-0000-template.md
    ADR-0001-tech-stack.md
    ADR-0002-multi-tenant-strategy.md
    ADR-0003-event-bus.md
    ADR-0004-database-postgres.md
    ADR-0005-cqrs-scope.md
    ADR-0006-clean-architecture-ddd.md
    ADR-0007-api-style-rest-first.md
    ADR-0008-ai-copilot-pattern.md
    ADR-0009-offline-strategy.md
    ADR-0010-plugin-framework.md
    ADR-0011-capability-layer-roadmap.md

  06-integrations/
    gst-gstn.md · e-invoice-irn.md · e-way-bill.md
    payments-razorpay.md · payments-phonepe.md · payments-stripe.md
    whatsapp.md · sms.md · email.md
    google-workspace.md · microsoft-365.md
    bank-apis.md · barcode-qr.md · ocr.md · ai-providers.md

  07-reports/
    accounting-reports.md · inventory-reports.md · gst-reports.md
    payroll-reports.md · projects-reports.md · crm-reports.md · dashboards.md

  08-business-rules/
    accounting-rules.md · inventory-rules.md · tax-rules.md
    approval-rules.md · numbering-rules.md · workflow-rules.md · posting-rules.md

  09-ai/
    ai-copilot.md · prompt-library.md · rag.md · tool-calling.md
    document-ai.md · forecasting.md · business-advisor.md · ai-guardrails.md

  10-erp-core/                           ← 21 engines
    voucher-engine.md · posting-engine.md · workflow-engine.md · approval-engine.md
    numbering-engine.md · notification-engine.md · document-engine.md · audit-engine.md
    permission-engine.md · currency-engine.md · tax-engine.md · localization-engine.md
    search-engine.md · reporting-engine.md · dashboard-engine.md
    import-engine.md · export-engine.md · attachment-engine.md
    scheduler-engine.md · automation-engine.md · rules-engine.md

  11-erd/
    foundation.mmd
    _template.mmd

  12-ui-components/
    data-grid.md · voucher-grid.md · master-form.md · lookup-dialog.md
    filter-panel.md · dashboard-cards.md · approval-timeline.md · activity-feed.md

  13-workflows/
    voucher-posting.md · approval-workflow.md · purchase-workflow.md · sales-workflow.md
    inventory-workflow.md · payroll-workflow.md · amc-workflow.md · field-visit-workflow.md

  14-localization/
    india.md · uae.md · saudi-arabia.md · qatar.md
    oman.md · kuwait.md · bahrain.md · global.md

  99-templates/
    module-prd-template.md · sprint-prd-template.md · api-spec-template.md
    db-schema-template.md · adr-template.md · integration-template.md
    report-template.md · event-template.md · workflow-template.md
    ui-component-template.md · locale-template.md · erd-template.mmd
```

### D. Frontmatter schema (enforced by convention, documented in Canon)

```yaml
---
title: "Voucher Engine"
summary: "Core engine that validates, posts, and audits all financial vouchers."
layer: "platform | financial | operations | business | people | intelligence"
owner: "Platform / Accounting"
status: "draft | review | approved"
updated: "2026-07-05"
tags: [engine, accounting, core]
depends_on: [audit-engine, permission-engine, numbering-engine]
---
```

### E. Baked-in identity (referenced by Canon and all Level 1 docs)

- **Product**: BusinessOS ERP (working name)
- **Geography**: India → GCC (UAE, KSA, Qatar, Oman, Kuwait, Bahrain) → Global
- **ICPs**: SMEs in Manufacturing, Trading & Distribution, Retail, Services, Construction, Field Service, Healthcare, Education, multi-branch orgs
- **Non-negotiables**: cloud-native SaaS, multi-tenant, multi-company/branch/currency/language/FY, double-entry accounting, GST + e-Invoice + e-Way Bill + TDS/TCS, audit trail, RBAC, workflow + approval + notification engines, DMS, API-first, mobile-first, offline for field, AI Copilot per module, plugin/extension framework, event-driven, PostgreSQL, Clean Architecture + DDD, CQRS where appropriate

### F. Capability-layer roadmap (baked into `roadmap.md` and `ADR-0011`)

```text
1. Platform            — Foundation, Auth, Users, Roles, Workflow, Notifications, Audit, Documents
2. Financial Platform  — Accounting Engine, Voucher Engine, Tax Engine, GST/TDS/TCS, Statements
3. Operations Platform — Inventory, Sales, Purchase, Manufacturing
4. Business Platform   — CRM, Projects, AMC, Field Service
5. People Platform     — HRMS, Payroll, Assets, Fleet
6. Intelligence Platform — Analytics, AI Copilot, Automation
```

### G. Technical details

- **Packages installed**: `react-markdown`, `remark-gfm`, `remark-frontmatter`, `gray-matter`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`, `shiki`, `mermaid`, `fuse.js`.
- **SSR safety**: Mermaid dynamic-imported client-side inside `useEffect`; frontmatter parsed via a Vite virtual module.
- **No server functions** — pure static content compiled into the bundle.
- **Templates in `99-templates/`** define the exact section headings every document type must contain, so subsequent content passes are deterministic.

### H. Explicit non-goals for Pass 1

- **No prose content beyond a one-line section summary.** No filled-in Canon, no filled-in PRDs, no filled-in engines.
- No Level 3 deep DB / API / wireframe files.
- No Level 4 Lovable sprint prompts.
- No ERP module code.
- No DOCX/PDF export.

---

## Staged content roadmap (subsequent passes)

Each pass is small enough to review end-to-end. Nothing is written until the previous pass is approved.

1. **Pass 2 — Canon** (`canon.md`) — the constitution.
2. **Pass 3 — Vision + Master PRD + Roadmap** (`00-vision/vision.md`, `01-master/prd.md`, `01-master/roadmap.md`).
3. **Pass 4 — Level 1 Architecture set** (`02-architecture/*`) + `03-design/*` + `governance.md` + `performance.md` + `quality-attributes.md` + `migration-strategy.md` + `module-dependency-matrix.md`.
4. **Pass 5 — ADRs** (`05-adr/ADR-0001..ADR-0011`) + `decision-register.md`.
5. **Pass 6 — ERP Core Engines** (all 21 files in `10-erp-core/`).
6. **Pass 7 — Cross-cutting catalogs**: `06-integrations/`, `07-reports/`, `08-business-rules/`, `09-ai/`, `12-ui-components/`, `13-workflows/`, `14-localization/`.
7. **Pass 8 — Platform layer domain PRDs** (`04-domains/foundation/*`) + `11-erd/foundation.mmd`.
8. **Pass 9 — Financial Platform** (Accounting domain, Tally-parity) + India + GCC localization deep-dives + accounting ERDs.
9. **Pass 10 — Operations Platform** (Inventory, Purchase, Sales, Manufacturing).
10. **Pass 11 — Business Platform** (CRM, Projects, AMC, Field Service).
11. **Pass 12 — People Platform** (HRMS, Payroll, Assets, Fleet).
12. **Pass 13 — Intelligence Platform** (Analytics, AI Copilot deep-dives, Automation).
13. **Pass 14+** — Level 3 technical deep-dives and Level 4 Lovable sprint prompts, one focused feature per prompt.

Approve to ship Pass 1 (skeleton + docs site).
