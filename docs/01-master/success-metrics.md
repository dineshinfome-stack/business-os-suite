---
title: "Success Metrics"
document_type: "Success Metrics"
summary: "Measurable, instrumented product, technical, and business metrics that determine whether BusinessOS is succeeding."
layer: "platform"
owner: "Platform / Product Council"
status: "approved"
version: "1.0.0"
created: "2026-07-05"
updated: "2026-07-05"
depends_on: ["canon", "00-vision/vision", "01-master/prd", "01-master/roadmap", "performance.md", "quality-attributes.md"]
referenced_by: ["01-master/prd", "01-master/roadmap"]
tags: ["metrics", "kpi", "measurement", "business-blueprint"]
---

# Success Metrics

## Conforms to Canon

- **Chapter 1** — Product Philosophy (time-to-first-transaction ≤ 1 business day; multi-everything from day one).
- **Chapter 13** — Definition of Done (metrics must be instrumented before a layer exits).
- **All performance-touching chapters** — targets are anchored to `performance.md` and `quality-attributes.md`; not duplicated here.

Every metric below MUST be **instrumented** — the number MUST be computable from production telemetry before its owning roadmap layer exits. Aspirational metrics without an owner or a measurement method are prohibited.

---

## 1. Metric shape

Every entry declares five fields:

- **Definition** — precise, unambiguous.
- **Target** — the value we commit to.
- **Measurement method** — how the number is produced (event, log, telemetry query, survey).
- **Owner** — the accountable role or council.
- **Cadence** — how often the metric is reviewed.

---

## 2. Product metrics

Focused on onboarding, adoption, and depth of use.

### 2.1 Time-to-first-company-setup

- **Definition:** median wall-clock minutes from tenant creation to the first company record saved with country, financial year, and seed masters applied.
- **Target:** ≤ 15 minutes (P50); ≤ 30 minutes (P90).
- **Measurement:** onboarding funnel events (`tenant.created`, `company.saved.first`).
- **Owner:** Product — Onboarding.
- **Cadence:** weekly.

### 2.2 Time-to-first-invoice

- **Definition:** median wall-clock time from tenant creation to first posted sales invoice for that tenant.
- **Target:** ≤ 1 business day (Canon 1.R6); P50 ≤ 4 hours.
- **Measurement:** funnel events (`tenant.created`, `sales_invoice.posted.first`).
- **Owner:** Product — Onboarding + Finance.
- **Cadence:** weekly.

### 2.3 Time-to-first-voucher

- **Definition:** median wall-clock time from tenant creation to any first posted voucher (any type).
- **Target:** ≤ 2 hours (P50).
- **Measurement:** funnel events.
- **Owner:** Product — Onboarding.
- **Cadence:** weekly.

### 2.4 Module activation rate

- **Definition:** share of tenants that have used at least one state-changing action in a given module within 30 days of tenant creation.
- **Target:** per module, defined at layer exit; global goal ≥ 60% for at least three modules by day 30.
- **Measurement:** per-module activity events.
- **Owner:** Product per module.
- **Cadence:** monthly.

### 2.5 Feature adoption

- **Definition:** share of active tenants that use a named feature at least once in a rolling 30 days.
- **Target:** per feature, defined in the domain PRD before ship.
- **Measurement:** feature-instrumentation events; SHOULD be declared in the feature's PRD before code merge.
- **Owner:** Product per module.
- **Cadence:** monthly.

### 2.6 Onboarding completion rate

- **Definition:** share of new tenants that complete the guided onboarding checklist within 7 days.
- **Target:** ≥ 70%.
- **Measurement:** onboarding checklist events.
- **Owner:** Product — Onboarding.
- **Cadence:** weekly.

### 2.7 Mobile daily active users (field roles)

- **Definition:** DAU/MAU ratio for users whose primary role is a field role (sales rep, technician, delivery agent).
- **Target:** ≥ 55%.
- **Measurement:** mobile session events tagged by role.
- **Owner:** Product — Mobile.
- **Cadence:** monthly.

## 3. Technical metrics

Anchored to `performance.md` and `quality-attributes.md`. Definitions and targets are canonical there; this section indexes them.

### 3.1 Dashboard first paint

- **Definition and Target:** per `performance.md`.
- **Measurement:** Real User Monitoring (RUM) LCP-equivalent.
- **Owner:** Platform Engineering.
- **Cadence:** daily.

### 3.2 API p95 latency

- **Definition and Target:** per `performance.md` (per-endpoint targets).
- **Measurement:** gateway telemetry.
- **Owner:** Platform Engineering.
- **Cadence:** daily.

### 3.3 List / search latency

- **Definition and Target:** per `performance.md`.
- **Measurement:** RUM + server-side timings.
- **Owner:** Platform Engineering.
- **Cadence:** daily.

### 3.4 Report generation time

- **Definition:** wall-clock time from report request to first byte of the generated artifact, per report type.
- **Target:** per `performance.md`.
- **Measurement:** Reporting Engine job telemetry.
- **Owner:** Reporting Engine owner.
- **Cadence:** weekly.

### 3.5 Mobile sync round-trip

- **Definition:** median seconds from offline change to server-confirmed reconciliation once network is available.
- **Target:** per `performance.md`.
- **Measurement:** sync job telemetry.
- **Owner:** Mobile Platform.
- **Cadence:** weekly.

### 3.6 Uptime

- **Definition:** availability of the production tenant surface per calendar month, computed per `quality-attributes.md`.
- **Target:** per `quality-attributes.md`.
- **Measurement:** synthetic + real-user probes.
- **Owner:** SRE / Platform.
- **Cadence:** monthly.

### 3.7 Error budgets

- **Definition:** burn rate against the error budgets defined in `quality-attributes.md`.
- **Target:** MUST NOT exceed budget; a breach triggers the governance-defined response.
- **Measurement:** SLO burn-rate alerting.
- **Owner:** SRE / Platform.
- **Cadence:** continuous.

### 3.8 Audit completeness

- **Definition:** share of state-changing actions with a matching audit event.
- **Target:** 100% (Canon Ch. 12 is normative; any gap is a bug).
- **Measurement:** reconciliation of state-change events to audit events.
- **Owner:** Audit Engine owner.
- **Cadence:** daily automated check.

### 3.9 AI action approval compliance

- **Definition:** share of AI-initiated state-changing actions with a recorded human approval.
- **Target:** 100% (Canon 9 is normative).
- **Measurement:** AI action log join against approval events.
- **Owner:** AI Platform owner.
- **Cadence:** daily automated check.

## 4. Business metrics

### 4.1 Net revenue retention (NRR)

- **Definition:** rolling 12-month NRR per standard SaaS definition (expansion + upsell − churn − contraction).
- **Target:** ≥ 115%.
- **Measurement:** billing system.
- **Owner:** Finance + Revenue.
- **Cadence:** monthly.

### 4.2 Gross revenue retention (GRR)

- **Definition:** rolling 12-month GRR.
- **Target:** ≥ 92%.
- **Measurement:** billing system.
- **Owner:** Finance + Revenue.
- **Cadence:** monthly.

### 4.3 Net Promoter Score (NPS)

- **Definition:** relationship NPS across tenant admins.
- **Target:** ≥ 40.
- **Measurement:** quarterly in-product survey.
- **Owner:** Product.
- **Cadence:** quarterly.

### 4.4 Expansion revenue

- **Definition:** share of quarterly new ARR from existing tenants (seat expansion, edition upgrade, add-on modules, capacity meters).
- **Target:** ≥ 30% of new ARR.
- **Measurement:** billing system.
- **Owner:** Revenue.
- **Cadence:** quarterly.

### 4.5 AI adoption

- **Definition:** share of active tenants where at least one user completes at least one AI-assisted workflow per week.
- **Target:** ≥ 60% by end of Layer 6.
- **Measurement:** AI action telemetry.
- **Owner:** AI Platform + Product.
- **Cadence:** monthly.

### 4.6 Marketplace adoption

- **Definition:** share of active tenants with at least one installed plugin.
- **Target:** ≥ 20% within 12 months of marketplace launch.
- **Measurement:** plugin installation events.
- **Owner:** Marketplace Product owner.
- **Cadence:** monthly.

### 4.7 Partner-sourced revenue

- **Definition:** share of new ARR sourced through certified partners.
- **Target:** ≥ 25% by end of Layer 4.
- **Measurement:** deal-attribution in CRM.
- **Owner:** Partner Program.
- **Cadence:** quarterly.

### 4.8 Statutory filing success rate

- **Definition:** share of tenant-initiated statutory filings (GSTR-1, GSTR-3B, VAT return, TDS, etc.) that succeed on first submission.
- **Target:** ≥ 98%.
- **Measurement:** filing outcome events.
- **Owner:** Financial Platform owner.
- **Cadence:** monthly (aligned to filing calendars).

## 5. Guardrail metrics (things that MUST NOT get worse)

- **P0 incident count** — MUST trend flat or down.
- **Data-integrity incidents** — MUST be zero at steady state.
- **AI state-change without approval** — MUST be zero (§3.9).
- **Compliance features gated by edition in target jurisdictions** — MUST be zero (Canon 1.R4).

## 6. Instrumentation policy

- Every metric here MUST have a named event source, a query definition, and a dashboard tile before its owning roadmap layer exits.
- Any metric here that cannot be instrumented in production is either (a) redefined until it can, or (b) removed via §7. Aspirational metrics are prohibited.
- The Success Metrics dashboard is a first-class artifact and its owner is the Product Council chair.

## 7. Change control

Metric changes follow `governance.md`. Removing a metric requires a written rationale and an update to every document that references it.

## 8. References

- Canon (`canon.md`)
- Vision (`00-vision/vision.md`)
- Master PRD (`01-master/prd.md`)
- Roadmap (`01-master/roadmap.md`)
- Performance (`performance.md`)
- Quality Attributes (`quality-attributes.md`)
- Governance (`governance.md`)
