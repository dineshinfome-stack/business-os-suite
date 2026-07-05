---
title: "BusinessOS ERP Canon"
document_type: "Constitution"
summary: "The highest-authority document in the repository. All PRDs, ADRs, and code must conform."
layer: "platform"
owner: "Platform / Architecture Council"
status: "approved"
version: "1.0.0"
created: "2026-07-05"
updated: "2026-07-05"
depends_on: []
referenced_by: []
tags: ["canon", "constitution", "laws", "principles"]
---

# BusinessOS ERP Canon

*The constitution of BusinessOS ERP.*

This document is the highest-authority artifact in the repository. Every future PRD, architecture document, ADR, engine specification, module specification, sprint prompt, and generated implementation MUST conform to it. Where any other document appears to disagree with the Canon, the Canon wins until an ADR explicitly amends it.

---

## Preamble

### P.1 Normative vs Informative

> **Normative vs Informative.** Sections and clauses containing **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT** are **normative** and binding on every implementation and every downstream document. Rationale, examples, and explanatory prose are **informative** and never override normative requirements. Where the two appear to conflict, the normative text wins.

### P.2 RFC 2119 Keywords

The keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted per RFC 2119:

- **MUST / REQUIRED / SHALL** — an absolute requirement.
- **MUST NOT / SHALL NOT** — an absolute prohibition.
- **SHOULD / RECOMMENDED** — a strong recommendation. Deviation requires a written rationale (ideally an ADR).
- **SHOULD NOT / NOT RECOMMENDED** — a strong discouragement. Same rule as SHOULD.
- **MAY / OPTIONAL** — permissible; implementations MAY choose either way.

### P.3 Authority Hierarchy

```text
Canon
  ↓
ADRs (Architecture Decision Records)
  ↓
Architecture Documents (02-architecture/*)
  ↓
Master PRD (01-master/prd.md)
  ↓
Module / Domain PRDs (04-domains/**)
  ↓
Sprint PRDs (Lovable sprint prompts)
  ↓
Implementation (source code)
  ↓
Tests
```

**Rules (normative):**

- **A.1** The Canon overrides all other documents until amended by an approved ADR.
- **A.2** An ADR MUST NOT contradict the Canon; it MAY *propose* a Canon amendment. Only after the Canon is amended does the new rule take effect.
- **A.3** A PRD MUST NOT override an Architecture document.
- **A.4** An Architecture document MUST NOT override an ADR.
- **A.5** Generated code MUST NOT override documentation. Where code and docs conflict, the docs win and the code is corrected.
- **A.6** Tests MUST reflect the specification, not the current implementation. A passing test against out-of-spec behavior is a bug.
- **A.7** Every downstream document (PRD, ADR, architecture doc, sprint prompt) MUST include a "Canon References" block naming the chapters it conforms to.

### P.4 Scope

The Canon applies to every capability layer of BusinessOS ERP:

1. **Platform** — Foundation, Auth, Users, Roles, Workflow, Notifications, Audit, Documents.
2. **Financial Platform** — Accounting Engine, Voucher Engine, Tax Engine, GST/TDS/TCS, Statements.
3. **Operations Platform** — Inventory, Sales, Purchase, Manufacturing.
4. **Business Platform** — CRM, Projects, AMC, Field Service.
5. **People Platform** — HRMS, Payroll, Assets, Fleet.
6. **Intelligence Platform** — Analytics, AI Copilot, Automation.

### P.5 Chapter Shape

Every chapter uses the same internal shape:

1. **Intent** — what the chapter governs, in one paragraph.
2. **Principles** — numbered, informative statements of belief.
3. **Rules** — normative MUST / SHOULD / MUST NOT clauses.
4. **Rationale** — why the rules exist.
5. **Examples** — informative, illustrative only.
6. **Non-goals** — what this chapter does *not* attempt to cover.
7. **Cross-references** — ADRs, engines, standards, and catalogs that elaborate the chapter.

---

## Chapter 1 — Product Philosophy

### 1.1 Intent

Define what BusinessOS ERP *is*, what it is *not*, its long-term vision, and its target customers. Every product decision downstream must be traceable to this chapter.

### 1.2 Principles

1. **Business Operating System, not a suite of apps.** BusinessOS is one coherent product with one data model, one identity, one audit trail, and one AI Copilot fabric — not a collection of loosely integrated tools.
2. **Simple for SMEs, scalable for the enterprise.** A single tenant with three users and a single tenant with three thousand users run the same product.
3. **India-first, GCC-ready, global-scale.** Statutory compliance is a first-class product feature, not an afterthought.
4. **Complete, not "integrable."** Core operational needs — accounting, inventory, sales, purchase, HRMS, payroll, field service, CRM, projects — live inside the product, not behind partner marketplaces.
5. **AI as a co-worker, not a gimmick.** AI participates in every workflow with clear provenance and human approval on state changes.
6. **Time to value in days, not quarters.** A new tenant transacts on day one; deep configuration comes progressively.

### 1.3 Rules

- **1.R1** BusinessOS ERP MUST present one product identity to the user, regardless of module boundaries internal to the codebase.
- **1.R2** Every module MUST work multi-tenant, multi-company, multi-branch, multi-currency, multi-language, and multi-financial-year from day one. Single-tenant-only or single-company-only modules are prohibited.
- **1.R3** Every user-facing surface MUST be usable on a mobile viewport at parity of function for the primary field-user tasks of that module.
- **1.R4** Statutory features (GST, e-Invoice, e-Way Bill, TDS, TCS, VAT for GCC) MUST NOT be treated as opt-in add-ons; they are first-class features of the relevant modules.
- **1.R5** No module MAY require third-party paid marketplaces to deliver its core operational capability.
- **1.R6** Time-to-first-transaction for a new tenant MUST be ≤ 1 business day with default configuration.

### 1.4 Rationale

Enterprise ERP has historically fragmented into modules that only integrate loosely. This creates duplicated masters, drift between records, and a fractured user experience. BusinessOS treats the operating system metaphor literally: shared kernel, shared services, shared UI grammar, shared AI.

### 1.5 Examples (informative)

- A customer created in CRM is the same customer visible in Sales, Accounting, and Field Service. Not a copy — the same aggregate.
- A GST-registered tenant transacts on day one with a preseeded chart of accounts, HSN library, and tax rate table.
- A field technician on a 2G connection completes a service visit offline; the app syncs when connectivity returns.

### 1.6 Non-goals

- Being an accounting-only product (Tally Prime's positioning).
- Being a horizontal marketplace of third-party modules (Zoho One's positioning).
- Serving as generic low-code (Odoo Studio's positioning) — configuration exists, but the product ships opinionated for ERP workflows.

### 1.7 Cross-references

- Vision (`00-vision/vision.md`)
- Master PRD (`01-master/prd.md`)
- Roadmap (`01-master/roadmap.md`)

---

## Chapter 2 — Product Principles

### 2.1 Intent

Fix the product-level values that guide every trade-off. When a design decision is unclear, these principles decide.

### 2.2 Principles

1. **Simplicity over complexity.** A simpler solution that meets the requirement wins.
2. **Configuration over customization.** Business variability is expressed as data, not code.
3. **Automation over manual work.** If a step can be triggered automatically with an approval gate, it MUST be.
4. **AI-first.** Every module has an AI surface designed *with* the module, not retrofitted.
5. **Mobile-first.** Layouts assume small screens first and enhance upward.
6. **API-first.** Every capability is expressible via API before it ships in a UI.
7. **Offline-first for field users.** Field workflows survive an unreliable network.
8. **Multi-tenant by default.** Tenancy is a property of the data model, not the deployment.
9. **Localizable by default.** No string, currency, or date format is hard-coded to a locale.

### 2.3 Rules

- **2.R1** Every user-facing capability MUST have a matching versioned API endpoint at `/v1` before it is considered "shipped."
- **2.R2** Business variability (workflows, approval rules, numbering, tax rates, exchange rates, statement formats) MUST be represented as tenant-owned data, not code branches.
- **2.R3** Every screen MUST support a keyboard-only path for its primary happy-path task.
- **2.R4** Every field-user workflow MUST work offline for its state-changing actions and reconcile on reconnect. See L11 for the state-change rule.
- **2.R5** Every user-visible string MUST be sourced from a localization catalog. Inline literals are prohibited except in developer tooling.
- **2.R6** New modules MUST NOT introduce their own auth, tenancy, audit, notification, permission, workflow, or numbering mechanisms. They MUST consume the shared engines (Chapter 3, §3.R6).
- **2.R7** A "customization" that would require a code change to any module in a specific tenant is prohibited. If the need is real, the module SHOULD be extended via the Plugin/Extension framework.

### 2.4 Rationale

Every ERP that ships one-off customizations to core code eventually becomes unmaintainable. BusinessOS enforces the discipline at the product-principle level.

### 2.5 Examples (informative)

- Approval workflows are configured via the Workflow Engine, not hard-coded.
- Localization files ship with the product and are extended per tenant when needed, not by editing UI code.
- A new field on the Customer master is added via a plugin, not by patching the Customer domain module.

### 2.6 Non-goals

- Building a generic low-code platform.
- Supporting arbitrary schemas per tenant.

### 2.7 Cross-references

- `03-design/ui-ux-design-system.md`
- `03-design/ux-standards.md`
- `10-erp-core/workflow-engine.md`
- `10-erp-core/localization-engine.md`
- ADR-0010 (Plugin Framework)

---

## Chapter 3 — Architecture Principles

### 3.1 Intent

Fix the architectural style of BusinessOS ERP. Every service boundary, deployment topology, and data-flow choice must be consistent with this chapter.

### 3.2 Principles

1. **Cloud-native SaaS** — designed for horizontally scalable, immutable-infrastructure deployment on managed platforms.
2. **Multi-tenant** — a single logical deployment serves many tenants with strict isolation.
3. **Domain-Driven Design** — bounded contexts, aggregates, ubiquitous language per domain.
4. **Clean Architecture** — domain at the center, application services around it, infrastructure at the edge.
5. **Event-driven** — modules communicate across bounded contexts via domain events and integration events.
6. **CQRS where justified** — separated read models for high-read domains (reports, dashboards, lists), not by default.
7. **Plugin / extension framework** — the codebase supports first-party and third-party extensions without core modification.
8. **PostgreSQL as system of record.** All authoritative business data lives in PostgreSQL.

### 3.3 The Modular-Monolith Rule (normative)

> **Default architecture is a modular monolith. A transition to microservices REQUIRES an approved ADR demonstrating measurable operational or scalability benefits — concrete SLOs, throughput, blast-radius reduction, team topology, or deployment independence. Preference-based or aspirational service splits are prohibited.**

### 3.4 Rules

- **3.R1** All authoritative business data MUST reside in PostgreSQL. Denormalized read stores (search, analytics) are permitted but never authoritative.
- **3.R2** Every module MUST be a bounded context with its own aggregates, repositories, and application services.
- **3.R3** Cross-context references MUST use identifiers, not shared entity classes.
- **3.R4** Cross-context communication at write time MUST use domain events; synchronous cross-context queries SHOULD go through published read models or explicit API contracts.
- **3.R5** New services MUST NOT be extracted from the monolith without an approved ADR meeting §3.3.
- **3.R6** Shared responsibilities MUST use the ERP Core Engines (Voucher, Posting, Workflow, Approval, Numbering, Notification, Document, Audit, Permission, Currency, Tax, Localization, Search, Reporting, Dashboard, Import, Export, Attachment, Scheduler, Automation, Rules). Modules MUST NOT re-implement these.
- **3.R7** Every module MUST expose its public capabilities through an `application` layer; UI, jobs, and integrations MUST NOT reach into a module's domain layer directly.
- **3.R8** Event schemas MUST be versioned. Backwards-incompatible event changes MUST introduce a new event name.
- **3.R9** No module may hold long-running in-memory state that is not recoverable from PostgreSQL and the event log.

### 3.5 Rationale

A modular monolith gives us most of the benefits of microservices (module boundaries, separate teams, testability) without the operational tax (distributed transactions, cross-service versioning, deployment fan-out) until scale requires it. Splitting prematurely is one of the most common ways ERP projects become unmaintainable.

### 3.6 Examples (informative)

- A Sales Order posting emits `SalesOrder.Confirmed` on the event bus. Inventory consumes it and reserves stock. Neither module holds a reference to the other's classes.
- A dashboard reads a materialized view refreshed from `Voucher.Posted` events — the dashboard is a read model.
- A tenant with 5,000 concurrent users runs on a horizontally scaled monolith; the accounting module has not been extracted.

### 3.7 Non-goals

- Achieving polyglot persistence.
- Distributed transactions across services.
- Runtime dynamic loading of arbitrary modules.

### 3.8 Cross-references

- `02-architecture/master-architecture.md`
- `02-architecture/domain-driven-design.md`
- `02-architecture/domain-map.md`
- `02-architecture/multi-tenant-architecture.md`
- `02-architecture/event-catalog.md`
- ADR-0001 (Tech Stack), ADR-0002 (Multi-Tenant), ADR-0003 (Event Bus), ADR-0005 (CQRS Scope), ADR-0006 (Clean Architecture + DDD)

---

## Chapter 4 — Accounting Principles (The Accounting Constitution)

### 4.1 Intent

Fix the invariants of the accounting subsystem. This chapter is the accounting constitution of BusinessOS ERP. Every module that produces financial effect (Sales, Purchase, Payroll, Manufacturing, Assets, etc.) MUST comply.

### 4.2 Principles

1. **Double-entry integrity.** Every financial transaction produces balanced debit and credit entries.
2. **Immutable postings.** A posted voucher is a historical fact; it is not edited.
3. **Voucher-driven.** All financial effect flows through vouchers, not ad-hoc journal writes.
4. **Financial-year discipline.** Postings are bound to a financial year, which can be locked.
5. **Complete audit trail.** Every posting is attributable to a user, timestamp, source, and reason.
6. **Deterministic numbering.** Every voucher carries a stable, unique number within its scope.
7. **Statutory-aware.** Tax, TDS, TCS, e-Invoice, and e-Way Bill are integral to the voucher lifecycle, not bolted on.
8. **Multi-currency correctness.** Amounts are stored with explicit currency and exchange treatment.

### 4.3 Voucher Lifecycle (normative)

```text
Draft  →  Validated  →  Posted  →  (Cancelled by Reversal)
```

- **Draft** — mutable; not visible in financial statements; can be deleted.
- **Validated** — passes all business rules; still mutable but is a committed intent (used for e-Invoice pre-issue, for example).
- **Posted** — immutable; written to the ledger; visible in statements.
- **Cancelled by Reversal** — the original posting stands; a reversing voucher is posted with a link back and a mandatory reason.

### 4.4 Rules

- **4.R1** Every posted financial transaction MUST produce balanced journal entries: sum of debits = sum of credits per posting.
- **4.R2** A posted voucher MUST NOT be edited, deleted, or renumbered. Corrections MUST use a reversal + re-post, both linked to the original.
- **4.R3** Every voucher MUST have a voucher type, number, date, financial year, company, branch, and posting user.
- **4.R4** Voucher numbers MUST be unique per (tenant, company, financial year, voucher type). Number generation MUST use the Numbering Engine.
- **4.R5** A financial year MAY be locked. Once locked, no new postings — including reversals — MAY affect that year. Reversals of prior-year vouchers MUST be posted in the current open year using the appropriate opening-adjustment mechanism.
- **4.R6** Every voucher MUST record the user, timestamp, and source (UI, API, integration, AI-proposed) via the Audit Engine.
- **4.R7** Tax computation on a voucher MUST use the Tax Engine and the applicable locale rules from `14-localization/`. Manual overrides MUST be captured with a reason.
- **4.R8** Multi-currency amounts MUST be stored with `currency`, `amount`, `base_currency`, `base_amount`, and `exchange_rate_snapshot` on the posting line.
- **4.R9** Every module producing financial effect MUST route through the Voucher Engine and Posting Engine. Direct ledger writes are prohibited.
- **4.R10** Cost centers and cost categories, where used, MUST be attached to posting lines and propagate to statements.
- **4.R11** A posted voucher MUST NOT be reused as a template implicitly; duplicates require explicit user action.
- **4.R12** e-Invoice, e-Way Bill, and equivalent statutory artefacts (India / GCC) MUST be part of the voucher's state machine — not a separate lifecycle. See `06-integrations/e-invoice-irn.md`, `06-integrations/e-way-bill.md`, `06-integrations/gst-gstn.md`.
- **4.R13** AI MUST NOT post a voucher without explicit human approval (see Chapter 9 and L11).

### 4.5 Rationale

Loss of accounting invariants is the most catastrophic failure mode of an ERP. The rules above are the *minimum* discipline needed to be auditable and statutorily compliant. They are non-negotiable.

### 4.6 Examples (informative)

- A sales invoice posts: Debit Debtor 118, Credit Sales 100, Credit CGST 9, Credit SGST 9. All in the same voucher, in one transaction.
- A user "cancels" a posted invoice: the system creates a reversal voucher with mirrored debits/credits and a mandatory reason. Both are visible in the ledger and linked.
- A cash sale in USD by an INR-base tenant records `amount=100 USD`, `base_amount=8320 INR`, `exchange_rate_snapshot=83.20`.

### 4.7 Non-goals

- Deviating from double-entry for any use case.
- Supporting in-place edits of posted vouchers under any circumstance.

### 4.8 Cross-references

- `04-domains/accounting/` (later pass)
- `10-erp-core/voucher-engine.md`, `posting-engine.md`, `tax-engine.md`, `numbering-engine.md`, `audit-engine.md`, `currency-engine.md`
- `08-business-rules/accounting-rules.md`, `posting-rules.md`, `numbering-rules.md`, `tax-rules.md`
- `14-localization/india.md`, `14-localization/uae.md`, ... (all locales)

---

## Chapter 5 — Database Principles

### 5.1 Intent

Fix the database conventions every module must follow. See also `02-architecture/database-standards.md` for the fully expanded rules.

### 5.2 Principles

1. **PostgreSQL as system of record.**
2. **UUID primary keys** everywhere.
3. **Soft delete** for tenant-facing entities; hard delete only for ephemeral or session data.
4. **Standard audit columns** on every table.
5. **Consistent naming.**
6. **Explicit foreign keys.**
7. **Aggregate writes in transactions.**
8. **Optimistic locking via `row_version`.**
9. **Row-Level Security on tenant-scoped tables.**

### 5.3 Rules

- **5.R1** Every business table MUST use a UUID primary key column named `id`.
- **5.R2** Every tenant-scoped table MUST include a `tenant_id UUID NOT NULL` column with a foreign key to `tenants(id)`, and MUST enable Row-Level Security scoping every operation by `tenant_id`.
- **5.R3** Every table MUST include the audit columns: `created_at timestamptz NOT NULL`, `created_by uuid NOT NULL`, `updated_at timestamptz NOT NULL`, `updated_by uuid NOT NULL`.
- **5.R4** Tenant-facing tables MUST support soft delete via `deleted_at timestamptz NULL` and `deleted_by uuid NULL`. Queries MUST filter `deleted_at IS NULL` by default; hard delete requires an explicit administrative operation.
- **5.R5** Every mutable business table MUST include `row_version int NOT NULL DEFAULT 0` for optimistic locking; updates MUST assert the version.
- **5.R6** Every foreign key relationship MUST be declared with a FK constraint. Orphan-tolerant designs are prohibited except with an ADR.
- **5.R7** Table names MUST be plural snake_case (`sales_invoices`), column names MUST be snake_case, boolean columns MUST use `is_` or `has_` prefixes.
- **5.R8** Money columns MUST store `numeric(20,4)` and MUST be paired with a `currency_code char(3)` and, when relevant, `base_amount numeric(20,4)` and `base_currency_code char(3)`. Bare `numeric` or `float` for money is prohibited (see L9).
- **5.R9** Timestamps MUST be `timestamptz` and stored in UTC (see L10).
- **5.R10** Enumerated statuses MUST be stored as short text codes with a lookup table, not language-specific strings.
- **5.R11** Aggregate writes (a voucher and its lines, an order and its items) MUST occur inside a single transaction.
- **5.R12** Migrations MUST be forward-only and additive by default; destructive migrations require an ADR and a rollback plan (see `migration-strategy.md`).
- **5.R13** No table may be dropped in a running production system without a supersession plan documented in `migration-strategy.md`.

### 5.4 Rationale

Consistency at the schema layer is the difference between an ERP that stays maintainable at 500 tables and one that collapses at 200.

### 5.5 Examples (informative)

- `sales_invoices(id, tenant_id, company_id, branch_id, number, invoice_date, customer_id, currency_code, subtotal, tax_total, grand_total, base_currency_code, base_subtotal, base_tax_total, base_grand_total, status, row_version, created_at, created_by, updated_at, updated_by, deleted_at, deleted_by)`
- Every SELECT executed against `sales_invoices` in application code carries an implicit `tenant_id = current_tenant() AND deleted_at IS NULL` via RLS.

### 5.6 Non-goals

- Supporting non-UUID primary keys.
- Storing money in `float`, `real`, or `double precision`.

### 5.7 Cross-references

- `02-architecture/database-architecture.md`
- `02-architecture/database-standards.md`
- `02-architecture/data-dictionary.md`
- `10-erp-core/audit-engine.md`
- ADR-0004 (PostgreSQL)

---

## Chapter 6 — API Principles

### 6.1 Intent

Fix the shape of every API surface BusinessOS ERP exposes — internal or external.

### 6.2 Principles

1. **REST-first.** JSON-over-HTTP with resource-oriented URLs is the default.
2. **Versioned.** Every public API is versioned.
3. **Standard error envelope.**
4. **Cursor pagination by default.**
5. **Filtering DSL.**
6. **Idempotency on writes.**
7. **Bearer authentication.**
8. **Rate limits enforced.**
9. **Signed webhooks.**

### 6.3 Rules

- **6.R1** Every public endpoint MUST be namespaced under `/v1` (or higher). Breaking changes MUST introduce a new major version; additive changes MAY ship within the current major.
- **6.R2** Every error response MUST use the standard envelope:
  ```json
  {
    "error": {
      "code": "SALES_INVOICE_ALREADY_POSTED",
      "message": "Sales invoice is already posted and cannot be edited.",
      "details": [ { "field": "status", "message": "posted" } ],
      "request_id": "01J...",
      "docs_url": "/docs/04-domains/accounting/sales-invoice"
    }
  }
  ```
- **6.R3** List endpoints MUST support cursor pagination (`?cursor=...&limit=...`), MUST NOT support offset pagination for large collections, and MUST return `next_cursor` when more data exists.
- **6.R4** List endpoints MUST support filtering, sorting, and sparse fieldsets via the documented DSL.
- **6.R5** Every write endpoint MUST accept an `Idempotency-Key` header and MUST guarantee that repeated requests with the same key produce the same effect exactly once for at least 24 hours.
- **6.R6** Authentication MUST use bearer tokens issued by the Auth service. Cookies MUST NOT carry API credentials for the public API.
- **6.R7** Every API surface MUST enforce rate limits and MUST return `429` with a `Retry-After` header when exceeded.
- **6.R8** Webhook deliveries MUST be signed (HMAC-SHA256) and MUST include a monotonically increasing delivery id.
- **6.R9** Every endpoint MUST have a machine-readable schema (OpenAPI 3.1) and MUST be documented in the module PRD.
- **6.R10** Public endpoints MUST NOT expose internal identifiers unless documented; where necessary, tenant-visible slugs or numbers are preferred.
- **6.R11** No endpoint MAY perform silent auto-fixes on client data. Server-side normalization MUST be visible in the response.

### 6.4 Rationale

The API is the contract with third parties, mobile clients, and future modules. Deviations create integration debt that lives forever.

### 6.5 Examples (informative)

- `POST /v1/sales-invoices` with `Idempotency-Key: 01JABCD...` — retrying the same request produces the same invoice.
- `GET /v1/customers?filter=state.eq:MH&limit=50&cursor=eyJ...` returns cursor-paginated results.

### 6.6 Non-goals

- Supporting SOAP or XML surfaces at the primary API layer.
- Publishing GraphQL as the primary write API. GraphQL MAY be added as a read overlay via an ADR.

### 6.7 Cross-references

- `02-architecture/api-architecture.md`
- ADR-0007 (REST-First API)

---

## Chapter 7 — UX Principles

### 7.1 Intent

Fix the user-experience grammar of BusinessOS ERP. Every screen, whether desktop back-office or mobile field app, must obey this chapter.

### 7.2 Principles

1. **Keyboard-first for back office.**
2. **Responsive by default.**
3. **Fast data entry.**
4. **Accessibility (WCAG 2.1 AA).**
5. **Consistent navigation.**
6. **Standard data grids.**
7. **Standard lookup dialogs.**
8. **Standard filter panels.**
9. **Mobile field UX — offline-first, low-bandwidth.**

### 7.3 Rules

- **7.R1** Every back-office screen MUST have a keyboard-only path for its primary happy-path task, including all form entry, lookups, saves, and posting actions.
- **7.R2** Every screen MUST work responsively down to a 375px viewport for its critical read paths.
- **7.R3** Data grids MUST use the standard `DataGrid` component (`12-ui-components/data-grid.md`). Ad-hoc table implementations are prohibited in module UI.
- **7.R4** Master lookups MUST use the standard `LookupDialog` component. Freeform selects for large master data are prohibited.
- **7.R5** Filter UIs MUST use the standard `FilterPanel` component and MUST persist filter state per user per screen.
- **7.R6** Every interactive element MUST meet WCAG 2.1 AA contrast, focus visibility, and target-size guidelines.
- **7.R7** Field-user screens MUST function offline for their state-changing actions and reconcile on reconnect (see 2.R4).
- **7.R8** Bulk actions MUST be available on every list view where the action makes sense; they MUST confirm before execution and MUST report per-item success/failure.
- **7.R9** Loading, empty, and error states MUST be explicitly designed for every screen; a spinner alone is insufficient.
- **7.R10** Voucher-entry screens MUST support one-hand keyboard workflow (tab order, quick date entry, quick ledger lookup, quick save + next).
- **7.R11** No screen MAY silently save destructive changes without an undoable or reversible affordance.

### 7.4 Rationale

Back-office ERP users spend hours per day in the product. Even small UX taxes compound. Field users work in adverse conditions where offline and keyboard/hardware constraints are the norm.

### 7.5 Examples (informative)

- On the Sales Invoice screen, `Alt+N` starts a new invoice, `F2` opens the ledger lookup, `Ctrl+S` saves, `Ctrl+P` posts, `Ctrl+Shift+N` opens the next.
- A technician marks a visit complete with photos while offline in a basement; the app queues and syncs when back online.

### 7.6 Non-goals

- Mimicking any specific existing ERP's UI verbatim.
- Supporting IE11 or other legacy browsers.

### 7.7 Cross-references

- `03-design/ui-ux-design-system.md`
- `03-design/ux-standards.md`
- `12-ui-components/*.md`

---

## Chapter 8 — Security Principles

### 8.1 Intent

Fix the security posture of BusinessOS ERP.

### 8.2 Principles

1. **RBAC with deny-by-default.**
2. **Least privilege.**
3. **Strict tenant isolation.**
4. **Encryption in transit and at rest.**
5. **Secret management.**
6. **OWASP ASVS baseline.**
7. **Audit of all privileged actions.**

### 8.3 Rules

- **8.R1** Permissions MUST be deny-by-default. A user has access to nothing until a role grants it (see L5).
- **8.R2** Every tenant-scoped query MUST filter by `tenant_id` via RLS (see L8). Application-level filtering alone is insufficient.
- **8.R3** All HTTP traffic MUST use TLS 1.2+ end-to-end. Plain HTTP is prohibited on any environment except localhost development.
- **8.R4** Data at rest MUST be encrypted at the storage layer. Sensitive fields (PII, secrets) MUST additionally be encrypted at the application layer with tenant-partitioned keys.
- **8.R5** Secrets MUST NOT be stored in source, environment files committed to git, or user-visible logs. Access to secrets MUST be audited.
- **8.R6** The product MUST meet OWASP ASVS Level 2 as its baseline; Level 3 for the accounting and identity subsystems.
- **8.R7** Every privileged action (user creation, role grant, permission change, tenant admin action, data export, financial-year lock/unlock) MUST be audited via the Audit Engine.
- **8.R8** Passwords MUST be hashed with a memory-hard KDF (argon2id or scrypt). MD5/SHA-1 are prohibited.
- **8.R9** Authentication endpoints MUST enforce rate limits and lockouts.
- **8.R10** Role definitions MUST be data, not code; role changes are auditable events.
- **8.R11** No module MAY implement its own authentication or authorization; the Permission Engine and Auth service are canonical.

### 8.4 Rationale

Tenant data leakage is an existential risk for a multi-tenant SaaS ERP. RLS and deny-by-default at the data layer are the last-line-of-defense against application bugs.

### 8.5 Examples (informative)

- A misconfigured application query that forgets `tenant_id` returns zero rows because RLS enforces it.
- A role change to a user is captured in the audit stream with actor, target, before/after, and reason.

### 8.6 Non-goals

- Achieving specific certifications *before* the product is ready to be audited. Certifications follow.

### 8.7 Cross-references

- `02-architecture/security-architecture.md`
- `10-erp-core/permission-engine.md`, `audit-engine.md`
- `04-domains/foundation/authentication.md`, `roles-permissions.md`

---

## Chapter 9 — AI Principles

### 9.1 Intent

Fix how AI participates in BusinessOS ERP.

### 9.2 Principles

1. **AI assists users; AI never silently changes state.**
2. **Human-in-the-loop for state-changing actions.**
3. **RAG-grounded answers preferred over free generation.**
4. **Explainability required.**
5. **Guardrails documented per surface.**
6. **One shared Copilot contract across modules.**

### 9.3 Rules

- **9.R1** AI MUST NOT silently post financial transactions, submit statutory filings, send external communications on behalf of the tenant, or change tenant configuration. All such actions require explicit human approval (see L11).
- **9.R2** Every AI action MUST be represented as a *proposal* the user can accept, edit, or reject. The proposal MUST be auditable.
- **9.R3** AI answers about tenant data MUST be grounded in retrieved tenant data (RAG). Freeform generation about tenant data is prohibited.
- **9.R4** Every AI surface MUST cite its sources when producing a factual answer over tenant data.
- **9.R5** Every AI surface MUST document its guardrails: allowed tools, allowed data scopes, disallowed prompts, and fallback behavior.
- **9.R6** All AI surfaces MUST implement the shared Copilot contract (proposal → review → apply, tool-calling schema, telemetry). Per-module Copilots are variants of this contract, not one-off implementations.
- **9.R7** AI MUST NOT bypass the Permission Engine, Audit Engine, or Voucher/Posting Engines. AI calls the same application services a human user would.
- **9.R8** AI-generated content MUST be labelled as such to the end user until accepted.
- **9.R9** Prompts, tool schemas, and evaluation sets MUST live under `09-ai/` and be versioned.

### 9.4 Rationale

Autonomous AI over financial records is unacceptable. The value of AI in ERP is speed and correctness with a human accountable for every state change.

### 9.5 Examples (informative)

- The AI Accountant proposes journal entries from a bank statement. The user reviews and approves. Only then does the Voucher Engine post.
- The AI GST Assistant answers "What is my ITC eligibility for July?" by retrieving the actual purchase register and citing the vouchers.

### 9.6 Non-goals

- Building a general-purpose chatbot detached from ERP data.
- Allowing AI to auto-approve its own proposals.

### 9.7 Cross-references

- `02-architecture/ai-architecture.md`
- `09-ai/ai-copilot.md`, `ai-guardrails.md`, `rag.md`, `tool-calling.md`, `prompt-library.md`
- ADR-0008 (AI Copilot Pattern)

---

## Chapter 10 — Performance Principles

### 10.1 Intent

Fix the performance envelope of BusinessOS ERP. The concrete numeric targets live in `performance.md` and evolve with measurement.

### 10.2 Principles

1. **Interactive latency budgets are user-visible SLOs, not internal aspirations.**
2. **Voucher posting is on the hot path; it MUST feel instant.**
3. **Reports MUST respect a bounded time budget and stream when they exceed it.**
4. **Search MUST return primary results in under one second for typical tenants.**
5. **Mobile sync MUST complete on 2G/3G within documented bounds.**

### 10.3 Rules (SLO targets — informative baselines, superseded by `performance.md`)

- **10.R1** Dashboard first paint p95 ≤ 2.0 s on the reference network profile.
- **10.R2** Voucher posting round-trip p95 ≤ 500 ms server-time; ≤ 1.0 s client-observed.
- **10.R3** List/search p95 ≤ 500 ms for tenant sizes up to 5M rows in the searched table.
- **10.R4** Report generation for standard financial statements p95 ≤ 5 s for one year; ≤ 30 s for full-history reports; longer reports MUST stream.
- **10.R5** Mobile field-app cold start p95 ≤ 3 s on the reference low-end device profile.
- **10.R6** Every write path MUST have an explicit latency budget documented in its module PRD.

### 10.4 Rationale

Performance rules kept as "the app should be fast" get ignored. Concrete numbers make them enforceable.

### 10.5 Non-goals

- Meeting a target by disabling features under load. Degradation modes are explicit and documented.

### 10.6 Cross-references

- `performance.md`
- `quality-attributes.md`

---

## Chapter 11 — Coding Principles

### 11.1 Intent

Fix the coding discipline of BusinessOS ERP.

### 11.2 Principles

1. **Strict TypeScript.**
2. **SOLID.**
3. **Clean Code.**
4. **Testability.**
5. **Documentation-with-code.**
6. **No dead code.**
7. **Small modules.**
8. **Enforced module boundaries.**

### 11.3 Rules

- **11.R1** TypeScript `strict: true` is REQUIRED across the project. `any` requires a written justification.
- **11.R2** Public functions and exported types MUST be documented with TSDoc where their meaning is not self-evident.
- **11.R3** Module boundaries MUST be enforced by lint rules; reaching into another module's `internal/` is prohibited.
- **11.R4** Every domain service MUST be unit-testable without a live database.
- **11.R5** Dead code MUST be removed, not commented out. Feature flags cover the "keep it around" case.
- **11.R6** Functions SHOULD stay under ~50 lines and files under ~400 lines. Deviations require a rationale.
- **11.R7** Public APIs MUST have contract tests (schema + example fixtures).
- **11.R8** Every PR that changes a public API MUST update the OpenAPI schema in the same PR.
- **11.R9** Logging MUST use the shared structured logger; `console.log` is prohibited in production code paths.
- **11.R10** Every state-changing operation MUST be idempotent at the application layer or MUST document why not.

### 11.4 Rationale

The Canon's other rules only survive if the code that implements them is disciplined.

### 11.5 Cross-references

- `03-design/coding-standards.md`
- `02-architecture/testing-strategy.md`

---

## Chapter 12 — Documentation Principles

### 12.1 Intent

Fix how documentation is authored, governed, and kept consistent as the project grows.

### 12.2 Principles

1. **Every module has a PRD.**
2. **Every API is documented.**
3. **Every architectural change requires an ADR.**
4. **The Canon overrides all other documents until an ADR amends it.**
5. **Every document carries the standard metadata block.**
6. **Every downstream document cites the Canon chapters it conforms to.**

### 12.3 Rules

- **12.R1** Every module MUST have a domain PRD under `04-domains/<domain>/` before implementation begins.
- **12.R2** Every ADR MUST use `99-templates/adr-template.md` and MUST be registered in `decision-register.md`.
- **12.R3** Every document MUST carry the standard frontmatter (`title`, `document_type`, `summary`, `layer`, `owner`, `status`, `version`, `created`, `updated`, `depends_on`, `referenced_by`, `tags`).
- **12.R4** Every PRD, ADR, and architecture document MUST include a "Canon References" section identifying the chapters it conforms to.
- **12.R5** When the Canon is amended, the affected downstream documents MUST be reviewed and updated in the same change set or within one follow-up sprint.
- **12.R6** Public-facing text (in-app and docs) MUST NOT contradict the Canon.
- **12.R7** No document may claim "final" status without an owner recorded in its frontmatter.

### 12.4 Rationale

Documentation drift is how "single source of truth" becomes "seven contradictory sources of truth."

### 12.5 Cross-references

- `governance.md`
- `decision-register.md`
- `99-templates/*.md`

---

## Chapter 13 — Definition of Done

### 13.1 Intent

Fix the minimum bar every feature must clear before it is considered "done."

### 13.2 Rules

A feature is **Done** only when all of the following are true:

- **13.R1** **Tests.** Unit tests cover the domain logic. Integration tests cover the application service and repository layer. Contract tests cover any public API changes.
- **13.R2** **Documentation.** The relevant module PRD reflects the shipped behavior. API docs and OpenAPI schema are updated. If the change is architectural, an ADR is written.
- **13.R3** **Permissions.** Every new endpoint, screen, action, and report has a permission entry in the Permission Engine and a documented permissions matrix in the module PRD.
- **13.R4** **Audit.** Every state-changing action writes an audit record via the Audit Engine.
- **13.R5** **Localization.** Every user-visible string is sourced from the localization catalog; no inline literals.
- **13.R6** **Accessibility.** The change meets WCAG 2.1 AA on affected surfaces.
- **13.R7** **Performance.** The change meets the latency budget in its module PRD.
- **13.R8** **Security review.** The security checklist (`governance.md`) is completed.
- **13.R9** **Migration.** Any schema change follows `migration-strategy.md` (forward-only, additive by default; destructive changes require an ADR).
- **13.R10** **Canon alignment.** The feature's PRD lists the Canon chapters it conforms to. Any deviation is captured as a pending ADR.

### 13.3 Cross-references

- `governance.md`
- `02-architecture/testing-strategy.md`
- `migration-strategy.md`

---

## Chapter 14 — The Laws of BusinessOS

The Laws are the short, non-negotiable core. They exist so that a developer or reviewer can hold every change against a handful of rules. They are normative; they cannot be waived by any downstream document.

- **L1.** Every financial transaction creates balanced journal entries.
- **L2.** Posted vouchers are immutable; corrections happen via reversal + re-post.
- **L3.** Every record belongs to exactly one tenant.
- **L4.** Every user action is auditable.
- **L5.** Permissions are deny-by-default.
- **L6.** Every API is versioned.
- **L7.** Every module is extensible without modifying core code.
- **L8.** Every tenant-scoped query is filtered by `tenant_id`.
- **L9.** Money is stored with explicit currency and precision — never as a bare number.
- **L10.** Time is stored in UTC; presented in tenant time zone.
- **L11.** AI never silently changes state; every AI action is proposed, then approved.
- **L12.** The Canon overrides all other documents until an ADR amends it.

---

## Amendment Procedure

The Canon is a living document, but it is not casually edited. The procedure below is normative.

1. **Propose.** Author an ADR under `05-adr/` describing the proposed change, its motivation, its impact on existing rules, and any downstream document updates required. The ADR MUST name the Canon chapter(s) it affects.
2. **Review.** The Architecture Council (as defined in `governance.md`) reviews the ADR. Reviewers MUST consider L1–L12 as inviolate unless the ADR explicitly targets a Law.
3. **Approve or Reject.** An approved ADR is marked `status: accepted` and gains an id in `decision-register.md`.
4. **Amend the Canon.** Update the affected chapter in this document to reflect the new rule. Include a note under the chapter's cross-references linking back to the ADR.
5. **Bump the version.** Increment the Canon's `version` in the frontmatter following semver (major = an incompatible change to a normative rule, minor = an additive normative rule, patch = clarification only).
6. **Record.** Add an entry to the Change Log below.
7. **Cascade.** Update or open follow-up tasks for the downstream documents affected within the current or next sprint.

Until steps 1–5 are complete, the *existing* Canon text is authoritative. No ADR, PRD, or code change may act on a proposed-but-not-yet-approved amendment.

---

## Change Log

| Version | Date       | Change                              | ADR    |
|--------:|------------|-------------------------------------|--------|
| 1.0.0   | 2026-07-05 | Initial ratification of the Canon.  | —      |

---

## How to Use This Document

- **When writing a PRD:** open the Canon, name the chapters your PRD conforms to, and include those references in your PRD's "Canon References" section.
- **When writing an ADR:** identify which Canon chapter or Law is affected. If none, the change is not architectural.
- **When reviewing code:** the Laws (Chapter 14) are the quick checklist. If a change appears to touch L1–L12, it needs explicit review against this document.
- **When AI generates a sprint:** the sprint prompt template already carries a "Canon Compliance" checklist. Every AI-generated implementation MUST tick every applicable Canon rule.

*End of Canon v1.0.0.*
