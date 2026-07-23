---
title: "Risk Register"
document_type: "Risk Register"
summary: "Every material risk to BusinessOS ERP, categorized, sized, mitigated, and owned. Reviewed on cadence."
layer: "platform"
owner: "Platform / Product Council"
status: "approved"
version: "1.0.0"
created: "2026-07-05"
updated: "2026-07-05"
depends_on: ["canon", "00-vision/vision", "01-master/prd", "01-master/scope", "01-master/business-model", "01-master/assumptions"]
referenced_by: ["01-master/prd", "01-master/roadmap"]
tags: ["risk", "governance", "traceability", "business-blueprint"]
---

# Risk Register

## Conforms to Canon

- **P.3** — Authority Hierarchy. Risks may inform ADRs; they never override the Canon.
- **Chapter 13** — Definition of Done requires material open risks to be either mitigated, accepted with an owner, or explicitly deferred before layer exit.

Risks in this register are known, sized, and owned. Unknown-unknowns are outside its scope; the mitigation for those is the governance process (`governance.md`) and reviews.

---

## 1. Purpose

A **risk** is a future condition that, if it materializes, would prevent BusinessOS from meeting its Canon, Vision, PRD, Roadmap, Business Model, or Success Metrics commitments.

Risks live here (not in the PRD) so they are:

1. Individually traceable with a stable ID.
2. Sized on the same impact/probability grid across categories.
3. Assigned to an accountable owner.
4. Reviewed on a defined cadence — not "when someone remembers."

## 2. Categories

- `technical` — architecture, scaling, data integrity, resilience.
- `regulatory` — statutory, compliance, data residency, licensing.
- `product` — scope, adoption, UX, feature depth.
- `adoption` — market fit, migration friction, customer acquisition.
- `AI` — model quality, provider dependency, cost, safety, provenance.
- `marketplace` — plugin ecosystem, partner behavior, revenue share disputes.
- `operational` — support, incident response, SRE capacity, on-call, tooling.
- `security` — threats, vulnerabilities, breach exposure, privacy.

## 3. Impact and probability scale

Uniform scale across categories.

- **Impact:** `Low` (recoverable within a sprint) / `Medium` (recoverable within a quarter) / `High` (multi-quarter recovery or reputational damage) / `Critical` (existential to the product).
- **Probability:** `Low` (< 10% over the review window) / `Medium` (10–33%) / `High` (33–67%) / `Very High` (> 67%).

The **priority** of a risk is the product of impact × probability, judged qualitatively by the Product Council.

## 4. Register

Columns: `ID`, `Risk`, `Category`, `Description`, `Impact`, `Probability`, `Mitigation`, `Contingency`, `Owner`, `Status`, `Review cadence`.

Statuses: `open`, `mitigating`, `accepted`, `materialized`, `closed`.

### 4.1 Technical

| ID | Risk | Impact | Probability | Mitigation | Contingency | Owner | Status | Cadence |
|---|---|---|---|---|---|---|---|---|
| **R-001** | Multi-tenant data isolation defect leaks tenant data across tenants. | Critical | Low | Enforced tenancy at data-model layer (Canon 3.R6, 3.R7); row-level policies; automated cross-tenant fuzz tests in CI. | Immediate P0 incident response; forced session invalidation; regulator disclosure per jurisdiction; post-mortem via governance. | Architecture Council | mitigating | quarterly |
| **R-002** | Statutory rule change (GST, VAT, TDS, e-Invoice) shifts scope mid-phase. | High | High | Statutory watch owned by Financial Platform; ship rules as configuration (Canon 2.R2). | Point release with updated rule pack; publish tenant advisory; extend layer exit if needed. | Financial Platform owner | open | quarterly |
| **R-003** | Modular monolith reaches a scaling ceiling before Layer 6 completes. | High | Low | Modular boundaries strict from day one (Canon 3.R2, 3.R3); load model reviewed per layer. | ADR-gated service extraction per Canon 3.3. | Architecture Council | open | half-yearly |
| **R-004** | Inventory valuation invariants (FIFO/Weighted) break under concurrency. | High | Medium | Locked policy per company; property-based tests; conflict-detection tests at load. | Rollback of concurrent-safe path; per-tenant lock elevation; forensic reconstruction from event log. | Inventory owner | open | quarterly |
| **R-005** | Offline sync conflicts cause data divergence for field users. | High | Medium | Deterministic conflict resolution rules per aggregate; conflict UX for humans; server-authoritative reconciliation. | Reconciliation replay tool; tenant-visible conflict inbox. | Mobile Platform | open | quarterly |
| **R-006** | Backup / restore RPO/RTO commitments are unmet under regional outage. | Critical | Low | Automated backup, cross-region replicas, quarterly restore drills. | Regional failover per `quality-attributes.md`. | SRE | open | quarterly |
| **R-007** | Cloud region unavailable when a jurisdiction requires it (residency). | High | Low | Region map maintained per `01-master/business-model.md`. | Partner-hosted region; contractual delay clause with the tenant. | Platform Council | open | half-yearly |

### 4.2 Regulatory

| ID | Risk | Impact | Probability | Mitigation | Contingency | Owner | Status | Cadence |
|---|---|---|---|---|---|---|---|---|
| **R-010** | Statutory filing portal (GSTN, e-Invoice IRP, e-Way Bill, VAT) is unavailable during a filing window. | High | Medium | Idempotent retry; local persistence of filing packets; tenant advisory. | Alternate submission mode where the authority allows; extended deadline coordination via industry channel. | Financial Platform owner | open | quarterly |
| **R-011** | Data residency requirement in a target jurisdiction cannot be met by the current cloud footprint. | High | Low | Region audit before entering a market. | Delay market entry; partner-hosted region. | Platform Council | open | half-yearly |
| **R-012** | Privacy request (subject access, portability, erasure) cannot be honored end-to-end for a tenant. | High | Low | Platform-level privacy tooling; retention policies configurable. | Manual workflow with legal review while the platform tooling closes the gap. | Legal + Platform | open | half-yearly |

### 4.3 Product

| ID | Risk | Impact | Probability | Mitigation | Contingency | Owner | Status | Cadence |
|---|---|---|---|---|---|---|---|---|
| **R-020** | Scope creep pushes a roadmap layer's depth past SME scale (e.g., Manufacturing beyond SME depth). | Medium | High | Scope document is normative (`01-master/scope.md`); scope change procedure (§5). | Defer excess depth to partner plugins or a later scope change. | Product Council | open | quarterly |
| **R-021** | Feature adoption below the Success Metrics target for a shipped module. | Medium | Medium | Adoption instrumentation before ship; onboarding checklist tie-in. | Feature revision or re-scoping; adoption campaign; if fundamentally wrong, retire via governance. | Product per module | open | monthly |
| **R-022** | Mobile parity gap for a field-user primary task discovered post-ship. | High | Medium | Mobile parity checklist in Canon Ch. 13 DoD; layer exit gate. | Point release; interim degraded-mode UX with clear tenant advisory. | Mobile Platform | open | quarterly |

### 4.4 Adoption

| ID | Risk | Impact | Probability | Mitigation | Contingency | Owner | Status | Cadence |
|---|---|---|---|---|---|---|---|---|
| **R-030** | Migration friction from legacy ERP and accounting systems (including Tally, Zoho, Odoo, spreadsheets, and custom solutions) blocks tenant conversion. | High | High | Import Engine with source-specific templates; opinionated data-mapping wizards; partner-led assisted migration; migration-friendly onboarding metrics tracked (`01-master/success-metrics.md`). | Assisted-migration service via certified partners; concierge onboarding for higher-value tenants. | Product — Onboarding + Partner Program | open | quarterly |
| **R-031** | Buyers perceive BusinessOS as unfamiliar and default to incumbents. | Medium | Medium | Positioning per Vision §6; industry-specific proof points; partner-driven trust. | Category-education content; targeted case studies. | Marketing | open | quarterly |
| **R-032** | Enterprise-scale customer requires capability not yet delivered in the roadmap. | Medium | Medium | Explicit Roadmap conversation with prospects; deferrable-scope catalog. | Partner plugin or a jointly-committed roadmap acceleration through governance. | Product Council | open | quarterly |

### 4.5 AI

| ID | Risk | Impact | Probability | Mitigation | Contingency | Owner | Status | Cadence |
|---|---|---|---|---|---|---|---|---|
| **R-040** | Model provider disruption (pricing, availability, policy) impairs the AI fabric. | High | Medium | AI Gateway abstraction with multi-provider fallback (Assumption A-004). | Route traffic to fallback provider; degrade to non-AI paths where necessary. | AI Platform | open | quarterly |
| **R-041** | Hallucination in advisory outputs causes a business decision defect. | High | Medium | Canon 9 mandates human approval on state changes; provenance and citations required. | Post-mortem via governance; guardrail update; user-visible advisory. | AI Platform | open | quarterly |
| **R-042** | Tenant data leakage across AI contexts. | Critical | Low | Per-tenant retrieval scoping; strict prompt/response isolation; automated cross-tenant leakage tests. | Immediate P0 response; provider notice; regulator disclosure if warranted. | AI Platform + Security | mitigating | quarterly |
| **R-043** | Unbounded AI usage produces unexpected cost. | High | Medium | Meters with soft/hard caps configurable per tenant (`01-master/business-model.md` §3). | Automatic throttle at hard cap; tenant-visible advisory. | Finance + AI Platform | open | monthly |

### 4.6 Marketplace

| ID | Risk | Impact | Probability | Mitigation | Contingency | Owner | Status | Cadence |
|---|---|---|---|---|---|---|---|---|
| **R-050** | Malicious or poorly-built plugin breaks a tenant. | High | Medium | Plugin sandbox; scoped permissions; certification tiers per `01-master/business-model.md` §6. | Emergency plugin recall; tenant advisory; forensic replay. | Marketplace Product owner | open | quarterly |
| **R-051** | Revenue-share dispute or partner defection damages ecosystem trust. | Medium | Medium | Written revenue-share and certification policy; predictable enforcement. | Governance-driven mediation; policy revision. | Partner Program | open | half-yearly |
| **R-052** | Plugin surface-area drift makes core changes back-incompatible. | High | Medium | Versioned public APIs; deprecation policy; extended overlap windows. | Compatibility shim; partner-communicated migration window. | Architecture Council | open | quarterly |

### 4.7 Operational

| ID | Risk | Impact | Probability | Mitigation | Contingency | Owner | Status | Cadence |
|---|---|---|---|---|---|---|---|---|
| **R-060** | Incident response capacity is insufficient during a P0. | High | Medium | On-call rotation; runbooks; tabletop exercises. | Escalation to leadership; vendor support engagement. | SRE | open | quarterly |
| **R-061** | Onboarding burden per tenant grows and cannot be absorbed by partners. | Medium | Medium | Self-serve onboarding; guided checklists; automation. | Concierge tier for high-value tenants; expand partner network. | Product — Onboarding | open | quarterly |
| **R-062** | Support-tier commitments are unmet for enterprise tenants. | Medium | Medium | Tiered support model documented per `01-master/business-model.md` §11. | Emergency dedicated support engagement; contractual credit. | Support | open | quarterly |

### 4.8 Security

| ID | Risk | Impact | Probability | Mitigation | Contingency | Owner | Status | Cadence |
|---|---|---|---|---|---|---|---|---|
| **R-070** | Credential compromise leads to unauthorized tenant access. | Critical | Medium | MFA available and enforceable; anomaly detection on session; token rotation. | Immediate session invalidation; tenant advisory; forensic replay from audit trail. | Security | mitigating | quarterly |
| **R-071** | Supply-chain compromise via a dependency or a plugin. | Critical | Low | Dependency scanning; SBOM; plugin sandboxing (R-050); signature verification. | Emergency dependency pin; plugin recall; SRE-driven mitigation. | Security + Architecture Council | open | quarterly |
| **R-072** | Insider threat exfiltrates tenant data. | Critical | Low | Least-privilege access; audit on privileged operations; separation of duties. | Immediate access revocation; forensic investigation; regulator engagement per jurisdiction. | Security | open | quarterly |
| **R-073** | Cryptographic weakness in a shipped algorithm/library. | High | Low | Algorithm inventory; scheduled cryptographic review; upgrade path pre-planned. | Emergency library upgrade; re-encryption plan; tenant advisory. | Security | open | annual |
| **R-074** | Reuse of weak or previously-breached passwords by end users (Supabase HaveIBeenPwned leaked-password protection intentionally disabled at this time). | Medium | Medium | Existing password policy (minimum length + Supabase weak-password rejection surfaced via `mapSupabaseAuthError`); MFA available per R-070; account-level anomaly detection. | Enable Supabase Leaked Password Protection in a future Security Hardening Sprint; forced password rotation for affected accounts if a breach correlation is identified. | Project Architecture | accepted | quarterly |

## 5. Review cadence

- **Monthly:** every `open` and `mitigating` risk in categories `product`, `AI` where cost/adoption is the concern, `operational`.
- **Quarterly:** every other `open` and `mitigating` risk.
- **Annual:** every `accepted` risk to reconfirm acceptance.

Review is owned by the Product Council. Missed reviews are a governance defect.

## 6. Change control

Risk register changes follow `governance.md`. A materialized risk MUST trigger a post-mortem via governance and MAY produce ADRs.

## 7. References

- Canon (`canon.md`)
- Vision (`00-vision/vision.md`)
- Master PRD (`01-master/prd.md`)
- Product Scope (`01-master/scope.md`)
- Business Model (`01-master/business-model.md`)
- Success Metrics (`01-master/success-metrics.md`)
- Assumptions Register (`01-master/assumptions.md`)
- Governance (`governance.md`)
- Quality Attributes (`quality-attributes.md`)
