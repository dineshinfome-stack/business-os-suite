---
title: "Assumptions Register"
document_type: "Assumptions Register"
summary: "Every assumption BusinessOS is built on, its category, its impact if invalidated, and its owner. Assumptions that become decisions are promoted to ADRs."
layer: "platform"
owner: "Platform / Architecture Council"
status: "approved"
version: "1.0.0"
created: "2026-07-05"
updated: "2026-07-05"
depends_on: ["canon", "00-vision/vision", "01-master/prd", "01-master/scope"]
referenced_by: ["01-master/prd", "01-master/roadmap", "05-adr"]
tags: ["assumptions", "governance", "traceability", "business-blueprint"]
---

# Assumptions Register

## Conforms to Canon

- **P.3** — Authority Hierarchy. An assumption is not a decision; when an assumption becomes binding, it MUST be promoted to an ADR (Canon A.2).
- **Chapter 13** — Definition of Done requires open assumptions to be resolved or explicitly deferred before layer exit.

Assumptions in this register **may be wrong**. This document tracks them precisely so we can invalidate them cleanly, not so we can rely on them silently.

---

## 1. Purpose

An **assumption** is a statement we treat as true for planning purposes without full evidence. Assumptions live here (not in the PRD or Roadmap) so that:

1. They are individually visible, traceable, and reviewable.
2. Their impact if invalidated is explicit.
3. Their promotion path to ADR is explicit.

## 2. Lifecycle

```text
active  →  promoted-to-ADR   (assumption became a design decision)
active  →  invalidated       (evidence contradicts it; documents must be updated)
active  →  retired           (no longer material)
```

Any downstream document (PRD, ADR, architecture doc) that relies on an assumption MUST cite its `A-###` id.

## 3. Register

The register uses fixed columns: `ID`, `Assumption`, `Category`, `Rationale`, `Impact if invalidated`, `Owner`, `Status`, `Review cadence`.

Categories: `technical`, `product`, `regulatory`, `commercial`, `operational`.

| ID | Assumption | Category | Rationale | Impact if invalidated | Owner | Status | Review cadence |
|---|---|---|---|---|---|---|---|
| **A-001** | PostgreSQL is the system of record for all authoritative business data. | technical | Canon 3.R1; mature ecosystem; strong transactional guarantees; broad operator familiarity. | Substantial architecture rework across every module; possible split of authoritative stores by domain. | Architecture Council | active | quarterly |
| **A-002** | India is the first shipping jurisdiction; GCC is the next. | regulatory / commercial | Founding-team domain expertise; largest addressable SME market for this product shape. | Reprioritize statutory calendars and localization catalogs; delay of one or more roadmap layer exits. | Product Council | active | quarterly |
| **A-003** | Field workflows require offline-first capability at 2G-tier reliability. | operational / product | Field service, sales, delivery, and warehouse tasks routinely happen under intermittent connectivity in target markets. | If wrong, offline complexity is a large sunk cost; but Canon 2.R4 remains binding. Downgrading is unlikely. | Mobile Platform | active | half-yearly |
| **A-004** | The AI model provider is swappable behind a gateway; no single provider is a hard dependency. | technical / commercial | Canon 9; commercial resilience; pricing and policy volatility across providers. | If wrong, we face vendor lock-in risk and pricing exposure. Mitigation: multi-provider fallback in the AI Gateway. | AI Platform | active | quarterly |
| **A-005** | Deployment is cloud-first; on-prem is not a Phase-1 requirement. | operational / commercial | Faster iteration, better telemetry, lower support cost, target-market willingness. | If wrong, we must add on-prem packaging, upgrade tooling, and support tier redesign. Substantial ops rework. | Platform Council | active | quarterly |
| **A-006** | A modular monolith is sufficient through the first four roadmap layers. | technical | Canon 3.3; measurable operational benefit is unlikely at the scale of the first four layers. | If wrong, we would incur an unplanned service extraction with the constraints of Canon 3.3 (ADR-gated). | Architecture Council | active | half-yearly |
| **A-007** | Statutory calendars in India and GCC are stable enough that ship dates hold; disruptive rule changes are exceptions. | regulatory | Observed historical cadence of GSTN, IRP, e-Way Bill, VAT authorities. | If wrong, a specific layer's exit may slip; risk R-002 tracks the mitigation. | Financial Platform owner | active | quarterly |
| **A-008** | Configuration-as-data (workflows, approvals, numbering, tax rates, statement formats) is sufficient to serve target-market variability without per-tenant code branches. | product / technical | Canon 2.R2, 2.R7. If a tenant needs a code change, the answer is the Plugin Framework, not a fork. | If wrong, we would face pressure to ship per-tenant code branches, which is prohibited. Alternative: extend the Plugin Framework surface. | Product Council + Architecture Council | active | quarterly |
| **A-009** | The Plugin Framework can safely isolate third-party plugins without breaking core invariants. | technical / commercial | Canon 2.R7; supported by sandboxing, scoped permissions via the Permission Engine, and versioned APIs. | If wrong, marketplace strategy stalls; partner-sourced revenue targets slip. | Architecture Council | active | half-yearly |
| **A-010** | Baseline AI usage per seat is affordable at target price points given metered overage for heavy use. | commercial | Observed unit economics of current AI providers; conservative baseline. | If wrong, edition economics and AI meter thresholds require revision. | Finance + AI Platform | active | quarterly |
| **A-011** | Communications channels (email, SMS, WhatsApp Business, push) are commercially available in every target jurisdiction. | operational / commercial | Current provider coverage in India and GCC. | If wrong, we ship without a channel in a jurisdiction; fallback via partner plugin. | Notification Engine owner | active | half-yearly |
| **A-012** | Certified partners can absorb implementation workload; BusinessOS does not need to run a services business. | commercial | Vision non-goal; healthy partner ecosystem observed in analogous markets. | If wrong, revenue depends on services we do not want to sell. Alternative: elevate onboarding automation and self-serve. | Partner Program | active | quarterly |
| **A-013** | Data residency in target jurisdictions is satisfiable via managed cloud regions available today. | regulatory / operational | Current cloud provider region maps; contract requirements observed to date. | If wrong, we would need alternative hosting arrangements per jurisdiction. | Platform Council | active | half-yearly |
| **A-014** | Mobile parity for field-user primary tasks is achievable on the same codebase (progressive) rather than requiring separate native apps for all surfaces. | technical / product | Canon 1.R3 speaks to capability parity, not implementation parity. | If wrong, native apps become required for some workflows; cost and calendar impact. | Mobile Platform | active | half-yearly |
| **A-015** | Statutory features can be delivered as first-class in every target jurisdiction without gating (Canon 1.R4). | commercial | Verified against target-market pricing; assumption A-010 supports this economically. | If wrong, Canon amendment would be required — prohibited without an approved ADR (Canon A.2). | Product Council | active | annual |

## 4. Promotion path

When an assumption becomes a *decision* (i.e., we choose to bind future work to it), it MUST be promoted to an ADR:

1. Draft an ADR referencing the assumption's `A-###` id.
2. The ADR MUST cite the Canon chapters it conforms to.
3. Once approved, update this register's row to `Status: promoted-to-ADR` with the ADR id.
4. Cite the ADR — not the assumption — from downstream documents thereafter.

## 5. Invalidation

If evidence contradicts an assumption:

1. Mark `Status: invalidated` with a dated note.
2. Update every downstream document that cited it.
3. Raise an ADR if the invalidation forces a new binding decision.
4. Consider whether the Risk Register (`01-master/risk-register.md`) should absorb a residual risk.

## 6. Review cadence

- **Quarterly:** every `active` assumption in categories `product`, `commercial`, `regulatory`.
- **Half-yearly:** every `active` assumption in categories `technical`, `operational`.
- **Annual:** every `active` assumption in the "non-negotiable" band (e.g., A-015).

Review is owned by the Product Council (`governance.md`). Missed reviews are a governance defect, not a product defect.

## 7. References

- Canon (`canon.md`)
- Governance (`governance.md`)
- Decision Register (`decision-register.md`)
- Risk Register (`01-master/risk-register.md`)
- ADR directory (`05-adr/**`)
