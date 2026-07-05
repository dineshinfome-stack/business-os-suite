# Pass 3 (v3, final — approved) — Business Blueprint

Approved as written. No structural changes. Recording the follow-up guidance so it is not lost between passes.

## Charter

Pass 2 authored **how** BusinessOS must be built (the Canon). Pass 3 authors **what** BusinessOS is — the complete business blueprint. All eight documents ship together as one coherent strategic layer, before any architecture or module work begins.

Every document in this pass:

- Conforms to the Canon (RFC 2119 language where normative).
- Opens with a **"Conforms to Canon"** block citing the Canon chapters it must align with.
- Uses the extended metadata block supported by `src/lib/docs.ts` (`document_type`, `version`, `created`, `updated`, `depends_on`, `referenced_by`, `owner`, `status`, `tags`).

## Deliverables — eight documents

### 1. Vision — `docs/00-vision/vision.md`

Why BusinessOS exists; problems solved; market positioning; 10-year vision; target industries; target customers; **competitive positioning** contrasting philosophy, UX, architectural approach, and target market vs Tally, Odoo, Zoho, SAP Business One, and Dynamics 365 (not a feature checklist); business philosophy (AI-first, mobile-first, configuration-over-customization, localization-first, unified data model); non-goals. `document_type: "Vision"`.

### 2. Master PRD — `docs/01-master/prd.md`

Single largest document. Table of contents for the entire ERP. Executive Summary; Personas; User Journeys; Modules (cross-linked to `04-domains/**`); Functional Scope (by capability layer); Non-functional Requirements (anchored to `performance.md`, `quality-attributes.md`); Business Rules (`08-business-rules/**`); Constraints; Integrations (`06-integrations/**`); Reporting (`07-reports/**`); AI Surfaces (`09-ai/**`); Mobile; Security & Compliance; product-level Acceptance Criteria; Dependencies; Open Questions. Assumptions and risks live in their own registers (§7, §8). `document_type: "Master PRD"`.

### 3. Product Roadmap — `docs/01-master/roadmap.md`

Organized strictly by **capability layers**:

```text
Platform → Financial → Operations → Business → People → Intelligence
```

Each layer: Goals, Deliverables, Dependencies, Exit Criteria (measurable — reference `performance.md` and Canon Ch. 13 DoD), Risks (summaries; full entries in Risk Register). Plus overall milestones, phasing, and a cross-layer dependency graph (Mermaid, inline). `document_type: "Roadmap"`.

### 4. Business Model — `docs/01-master/business-model.md` (new)

SaaS licensing; Editions (indicative); Pricing philosophy (per-user / per-company / per-module / capacity-based; regional pricing India vs GCC vs global); Marketplace; Plugin ecosystem (revenue share, certification); AI usage model (included vs metered, guardrails per Canon Ch. 9); API monetization; architectural implications (metering, entitlement, plan-gated features — flags future ADRs, does not decide them). `document_type: "Business Model"`.

### 5. Product Scope — `docs/01-master/scope.md` (new)

- **In Scope:** Accounting, Inventory, CRM, HRMS, Payroll, Projects, AMC, Field Service, Manufacturing, POS, Sales, Purchase, Assets, Fleet, Analytics, AI Copilot.
- **Out of Scope initially:** CAD/PLM, implementation consulting services, general-purpose e-commerce storefront, social networking, generic no-code app builder, custom industry verticals beyond stated targets.
- **Deferred:** advanced MES, treasury, multi-legal-entity consolidation beyond baseline.
- **Scope Change Procedure:** ties into `governance.md` and Canon amendment procedure.

`document_type: "Product Scope"`.

### 6. Success Metrics — `docs/01-master/success-metrics.md` (new)

- **Product:** time to first company setup, first invoice, first voucher; module activation rate; feature adoption.
- **Technical:** dashboard first paint; API p95; list/search latency; report generation; mobile sync round-trip; uptime; error budgets (anchored to `performance.md`, `quality-attributes.md`).
- **Business:** retention, NPS, expansion revenue, AI adoption, marketplace adoption, partner-sourced revenue.

Every metric declared with definition, target, measurement method, owner. `document_type: "Success Metrics"`.

### 7. Assumptions Register — `docs/01-master/assumptions.md` (new)

Table: `ID`, `Assumption`, `Category` (technical / product / regulatory / commercial / operational), `Rationale`, `Impact if invalidated`, `Owner`, `Status` (active / promoted-to-ADR / invalidated), `Review cadence`. Seed entries: PostgreSQL as system of record; India-first, GCC-next; offline-first mobile; swappable AI provider; cloud-first (on-prem not Phase-1). `document_type: "Assumptions Register"`.

### 8. Risk Register — `docs/01-master/risk-register.md` (new)

Table: `ID`, `Risk`, `Category`, `Description`, `Impact`, `Probability`, `Mitigation`, `Contingency`, `Owner`, `Status`, `Review cadence`. Categories: technical, regulatory, product, adoption, AI, marketplace, operational, security. Adoption risks include **migration friction from legacy ERP and accounting systems (including Tally, Zoho, Odoo, spreadsheets, and custom solutions)**. `document_type: "Risk Register"`.

## Cross-document integrity

- Every document opens with a **Conforms to Canon** section listing specific chapter numbers.
- Every document ends with **References** linking related documents (Vision ↔ PRD ↔ Roadmap ↔ Business Model ↔ Scope ↔ Metrics ↔ Assumptions ↔ Risks, plus Canon).
- `depends_on` / `referenced_by` frontmatter populated so the portal reverse-index renders correctly.

## Portal updates

- `src/routes/docs.index.tsx` — new "Business Blueprint" quick-link group directly after the Canon.
- `docs/_meta.json` — register the five new files under `01-master` in intended order: Master PRD, Roadmap, Business Model, Product Scope, Success Metrics, Assumptions Register, Risk Register.
- No routing, component, or package changes.

## Files touched

- Author (new): `docs/01-master/business-model.md`, `scope.md`, `success-metrics.md`, `assumptions.md`, `risk-register.md`.
- Author (replace stubs): `docs/00-vision/vision.md`, `docs/01-master/prd.md`, `docs/01-master/roadmap.md`.
- Edit: `docs/_meta.json`, `src/routes/docs.index.tsx`.

## Explicit non-goals for Pass 3

- No architecture, engine, ADR, or module content.
- No new npm packages, routes, or components.
- No back-fill of metadata into unrelated skeleton docs.
- **Deferred to later stand-alone passes:** `docs/01-master/stakeholders.md` (Stakeholder Register) and `docs/glossary-governance.md` (Terminology Policy). Recorded so they are not forgotten; **not** authored in Pass 3.

## Post-Pass-3 review checklist (before starting Pass 4)

Applied by the user (and re-checked by the agent when Pass 4A begins) against the generated content:

- No duplicated concepts between Vision and Master PRD.
- No contradictions between Business Model and Product Scope.
- Roadmap phases match the capability layers exactly.
- Success metrics are measurable, not aspirational (each has target + measurement method + owner).
- Any "assumption" that is actually a design decision is flagged for promotion to an ADR in Pass 6.

## Pass 4 will be split (recorded, approved individually later)

```text
Pass 4A  Master Architecture, Domain-Driven Design, Domain Map
Pass 4B  Database Architecture, Multi-Tenant Architecture, Database Standards, Data Dictionary
Pass 4C  API Architecture, Security Architecture, AI Architecture
Pass 4D  Deployment, DevOps, Testing Strategy, UI/UX Design System, UX Standards, Coding Standards
```

Then: Pass 5 ERP Core Engines → Pass 6 ADRs → Pass 7+ Domain / Module PRDs.

Approve to author the Business Blueprint.