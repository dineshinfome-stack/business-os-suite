---
title: "Business Model"
document_type: "Business Model"
summary: "How BusinessOS is licensed, packaged, priced, and monetized — and the architectural implications this creates for metering, entitlement, and plan-gating."
layer: "platform"
owner: "Platform / Product Council"
status: "approved"
version: "1.0.0"
created: "2026-07-05"
updated: "2026-07-05"
depends_on: ["canon", "00-vision/vision", "01-master/prd", "01-master/scope"]
referenced_by: ["01-master/prd", "01-master/roadmap", "05-adr"]
tags: ["business-model", "pricing", "editions", "marketplace", "monetization"]
---

# Business Model

## Conforms to Canon

- **Chapter 1** — Product Philosophy (one product; no core capability behind third-party marketplaces — Canon 1.R5).
- **Chapter 2** — Product Principles (configuration-over-customization; plugin framework as the extension surface, not core patches — Canon 2.R7).
- **Chapter 9** — AI (usage model must respect guardrails and provenance).
- **Chapter 14** — Localization (pricing and packaging honor jurisdictional realities without fragmenting the product).

This document **influences** future ADRs (metering, entitlement, plan-gating). It does **not** decide architecture. Any binding architectural rule flowing from this document MUST be captured as an ADR.

---

## 1. Model summary

BusinessOS is delivered as **SaaS**, licensed per tenant, with the following orthogonal dimensions:

- **Edition** — the bundle of modules included (Starter, Growth, Business, Enterprise).
- **Seats** — priced per active user.
- **Company count** — priced per additional company beyond the edition's included count.
- **Modules** — a small number of premium modules are add-ons across editions.
- **Capacity meters** — usage-based charges for capacity-intensive resources (AI usage, e-invoice submissions, storage, API calls beyond a fair-use ceiling).
- **Marketplace** — third-party plugins with revenue share.
- **API monetization** — paid API tiers for high-volume programmatic access.

The primary revenue stream is subscription. Marketplace, API tiers, and metered capacity are secondary.

## 2. Editions (indicative, non-binding)

Edition names, exact contents, and prices are decided by Product Marketing. This document fixes the *shape*, not the numbers.

| Edition | Target | Typical modules |
|---|---|---|
| **Starter** | Solo / micro-SME | Accounting, Tax, Basic Inventory, Basic Sales/Purchase, one company, small seat cap. |
| **Growth** | Small SME | Starter + full Inventory + full Sales/Purchase + CRM + basic AI Copilot + limited AMC/Projects. |
| **Business** | Mid SME | Growth + HRMS + Payroll + Field Service + Projects + Manufacturing + advanced AI Copilot. |
| **Enterprise** | Mid-market → lower enterprise | Business + Multi-company depth + Advanced analytics + SLA + priority support + dedicated infra tier. |

Every edition MUST honor Canon 1.R2 (multi-everything from day one). "Multi-tenant" is not an upsell — the architectural property is baseline. What editions gate is *capacity* (number of companies, seats, meters), not architectural capability.

## 3. Pricing philosophy

The following are philosophical commitments, not price points:

1. **Predictable base + usage on top.** Subscription covers the bulk; capacity meters cover the volatile.
2. **No surprise bills.** Meters MUST have soft and hard caps configurable by the tenant (Canon 2.R2 — configuration as data).
3. **Regional realism.** Pricing in India, GCC, and rest-of-world reflect local purchasing power and competitive reality. Same product; not the same list price.
4. **No compliance paywall.** Statutory features (GST, e-Invoice, e-Way Bill, TDS, TCS, VAT) are included in every edition where the jurisdiction is a target market. Canon 1.R4 forbids gating them.
5. **AI is not free at unlimited scale.** A generous default AI allowance is included per seat; heavy AI users pay a meter (Canon 9 guardrails apply).
6. **No per-tenant custom pricing baked into code.** Pricing is configuration, not code.

## 4. What is included in every edition (non-negotiable)

Regardless of edition:

- Multi-tenant, multi-company, multi-branch, multi-currency, multi-language, multi-financial-year (Canon 1.R2).
- Statutory features for the tenant's jurisdiction (Canon 1.R4).
- Mobile parity for field-user primary tasks (Canon 1.R3).
- Full audit trail (Canon Ch. 12).
- API v1 access at a fair-use ceiling (Canon 2.R1).
- Baseline AI Copilot allowance per seat (Canon Ch. 9).
- Plugin installation from the marketplace.

## 5. What editions may gate

Editions MAY gate:

- Number of companies beyond an included count.
- Number of active seats.
- Advanced module capability (e.g., Manufacturing beyond BOM depth; advanced forecasting).
- AI usage meters beyond baseline.
- Support tier (community / standard / priority / dedicated).
- Data retention beyond a baseline (with clear archival semantics).

Editions MUST NOT gate:

- Compliance features in target jurisdictions.
- Audit trail depth.
- Mobile parity.
- API existence (fair-use ceiling is acceptable).

## 6. Marketplace and plugins

A first-party marketplace lists partner plugins built on the Plugin Framework (Canon 2.R7). Structure:

- **Certification tiers** — Community, Certified, Verified.
- **Revenue share** — decided by Product Marketing; documented per tier.
- **Isolation guarantees** — plugins MUST run inside the Plugin Framework's sandbox; they MUST NOT patch core code (Canon 2.R7).
- **Data access** — plugins request scoped permissions via the Permission Engine.
- **Withdrawal** — Certified/Verified certification can be revoked for policy violations without breaking the customer's tenant catastrophically.

Marketplace revenue is a share of plugin sales. BusinessOS operates the payment rail, distribution, and dispute resolution.

## 7. Plugin ecosystem

The plugin ecosystem is the primary *extension* surface. It replaces "customization consulting" as the answer to "we need X specific to our business." Partner categories:

- **Vertical extensions** — industry-specific modules (education, healthcare-lite, F&B, contracting).
- **Regional extensions** — jurisdiction-specific statutory formats not in target markets.
- **Integrations** — connectors to specific banks, POS hardware, marketplaces, communication providers.
- **AI extensions** — task-specific agents built on the AI Gateway (with mandatory approval flows per Canon 9).
- **Report packs** — versioned report bundles.

## 8. AI usage model

BusinessOS ships AI as a **fabric**, not a paywalled add-on.

- **Baseline allowance:** every seat receives an AI usage allowance sufficient for typical daily work.
- **Metered overage:** heavy usage is metered per tenant with soft and hard caps.
- **Provider swappable:** the model provider is abstracted behind the AI Gateway; the tenant does not pay per provider.
- **Guardrails:** state-changing AI actions ALWAYS require human approval (Canon 9), regardless of edition.
- **Cost transparency:** the tenant admin sees AI usage in real time per user, module, and workflow.

## 9. API monetization

- The API exists in every edition (Canon 2.R1).
- Fair-use ceiling on request volume and payload size is included by edition.
- Beyond the ceiling, a paid API tier applies (metered).
- Programmatic access to bulk imports/exports is separately metered.

## 10. Localization and pricing

- Pricing in INR for India, in AED/SAR/QAR/etc. for GCC, in USD/EUR for rest-of-world.
- Statutory features included per target jurisdiction as defined in §4.
- Compliance features for non-target jurisdictions ship via partner plugins (§7).
- Currency of billing MAY differ from tenant's operating currency; both are supported by the Currency Engine (Canon Ch. 6 — currency correctness).

## 11. Support tiers

Support tier is edition-gated. All tiers include:

- Access to documentation and community.
- Escalation for incidents affecting availability or data integrity (regardless of tier).
- Compliance-critical fixes on the shipped statutory calendar.

Higher tiers add named contacts, response SLAs, priority for feature requests routed through the ADR/governance process, and dedicated infrastructure options at the top tier.

## 12. Architectural implications (informative — decide via ADR)

The following are *implications* of this business model that MUST be resolved via ADRs (not by this document):

- Metering subsystem for AI, e-invoice, storage, API — where does it live? (ADR TBD in Pass 6.)
- Entitlement subsystem — how is edition + add-on state enforced across engines? (ADR TBD.)
- Plan-gating strategy — feature flags vs data-driven capability? (ADR TBD.)
- Marketplace payment rail and revenue share settlement. (ADR TBD.)
- Pricing engine — internal service vs external billing platform. (ADR TBD.)

Nothing in this section is binding on architecture; it flags the questions the architecture pass MUST answer.

## 13. Change control

Business model changes are proposed via `governance.md`. Changes that require Canon changes (e.g., gating a compliance feature) are prohibited without a Canon amendment (Canon P.3, A.2).

## 14. References

- Canon (`canon.md`)
- Vision (`00-vision/vision.md`)
- Master PRD (`01-master/prd.md`)
- Product Scope (`01-master/scope.md`)
- Success Metrics (`01-master/success-metrics.md`)
- Assumptions Register (`01-master/assumptions.md`)
- Risk Register (`01-master/risk-register.md`)
- Governance (`governance.md`)
