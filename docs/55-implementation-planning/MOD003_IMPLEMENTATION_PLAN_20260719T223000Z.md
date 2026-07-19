---
plan_id: "MOD003_IMPLEMENTATION_PLAN_20260719T223000Z"
pass_id: "39.0.0"
module_id: "MOD-003"
plan_type: "Implementation Plan"
repository_state_in: "MOD003_IMPLEMENTATION_READY"
repository_state_out: "MOD003_IMPLEMENTATION_PLANNED"
source_publication: "GT-005 (MOD-003_MODULE_PUBLICATION)"
source_web_design: "WEB-003"
source_mobile_design: "MOB-003"
source_api_design: "API-003"
source_certification: "MOD003_CROSS_PLATFORM_CERTIFICATION_20260719T210000Z"
source_readiness_review: "MOD003_IMPLEMENTATION_READINESS_REVIEW_20260719T220000Z"
owner: "Delivery"
created: "2026-07-19"
status: "Approved"
tags: ["implementation-planning", "MOD-003", "sales", "delivery"]
document_type: "Implementation Plan"
---

# MOD-003 — Implementation Plan

> Executable engineering delivery plan for MOD-003 (Sales). Translates the certified specification set (GT-005, WEB-003, MOB-003, API-003) into workstreams, epics, delivery waves, and milestones without introducing new functional scope.

## Authorization Semantics

```text
CROSS_PLATFORM_CERTIFIED
        ↓  (governance approves the module for implementation)
IMPLEMENTATION_READY
        ↓  (planning translates certified specs into an executable plan)
IMPLEMENTATION_PLANNED
        ↓
ENGINEERING EXECUTION
```

Governance-level authorization to implement was granted at `MOD003_IMPLEMENTATION_READY` (per `MOD003_IMPLEMENTATION_READINESS_REVIEW_20260719T220000Z`). This plan is the execution baseline; it does not re-authorize implementation.

## 1. Planning Identity

| Field | Value |
| --- | --- |
| Plan ID | `MOD003_IMPLEMENTATION_PLAN_20260719T223000Z` |
| Pass ID | `39.0.0` |
| Module | MOD-003 Sales |
| Owner | Delivery |
| Lifecycle State In | `MOD003_IMPLEMENTATION_READY` |
| Lifecycle State Out | `MOD003_IMPLEMENTATION_PLANNED` |
| Timestamp | `2026-07-19T22:30:00Z` |
| Status | Approved |

## 2. Source Artifacts

| # | Artifact | Path |
| :-: | --- | --- |
| 1 | GT-005 Module Publication | `docs/45-module-publications/sales/MOD-003_MODULE_PUBLICATION.md` |
| 2 | WEB-003 Solution Design | `docs/46-solution-design/web/sales/WEB-003_SOLUTION_DESIGN.md` |
| 3 | MOB-003 Solution Design | `docs/46-solution-design/mobile/sales/MOB-003_SOLUTION_DESIGN.md` |
| 4 | API-003 Solution Design | `docs/46-solution-design/api/sales/API-003_SOLUTION_DESIGN.md` |
| 5 | Cross-Platform Certification | `docs/50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_20260719T210000Z.md` |
| 6 | Cross-Platform Certification Verification | `docs/50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_VERIFICATION_20260719T210500Z.md` |
| 7 | Implementation Readiness Review | `docs/50-audit-reports/MOD003_IMPLEMENTATION_READINESS_REVIEW_20260719T220000Z.md` |
| 8 | Implementation Readiness Verification | `docs/50-audit-reports/MOD003_IMPLEMENTATION_READINESS_VERIFICATION_20260719T220500Z.md` |

All source artifacts are certified and read-only under this pass.

## 3. Implementation Objectives

- Deliver every GT-005 certified capability faithfully across WEB, MOB, and API surfaces.
- Introduce **no new functional scope**; every work item traces to a certified requirement.
- Consume platform engines (`ENG-001..028`) via the Capability Interfaces already declared by GT-005 §12; do not redefine engine behavior.
- Preserve the certified event catalog (published and consumed events per GT-005 §8).
- Meet the non-functional targets inherited from `docs/02-architecture/quality-attributes.md`.

## 4. Workstream Breakdown

| Code | Workstream | Focus |
| :-: | --- | --- |
| WS-1 | Shared Domain | Domain model, invariants, shared types, event contracts |
| WS-2 | Backend / API | Implementation of API-003 endpoints, service layer, integrations with ENG-004/010/011/015/016/017/019/024 |
| WS-3 | Web | Implementation of WEB-003 screens, forms, workflows |
| WS-4 | Mobile | Implementation of MOB-003 screens, offline UX, sync |
| WS-5 | Integrations | E-invoice gateway, payment gateway, logistics providers |
| WS-6 | Data Migration | Master data (Customer, Price List, Salesperson), open transactions |
| WS-7 | Testing | Unit, integration, contract, E2E, cross-platform parity, performance |
| WS-8 | Documentation | Runbooks, operator guides, release notes, API changelog |
| WS-9 | Deployment / Release | Environments, feature toggles, rollout, observability |

## 5. Epic & Work Package Decomposition

Every epic traces to one or more GT-005 capabilities.

| Epic | Capability (GT-005) | Representative Work Packages |
| :-: | --- | --- |
| E1 | Quotations | WP1.1 Quotation domain; WP1.2 API-003 quotation endpoints; WP1.3 WEB-003 quotation screens; WP1.4 MOB-003 quotation screens; WP1.5 QuotationIssued event |
| E2 | Sales Orders | WP2.1 Order domain + state machine; WP2.2 API endpoints; WP2.3 WEB screens; WP2.4 MOB screens; WP2.5 SalesOrderConfirmed event; WP2.6 Credit-limit approval flow (ENG-011) |
| E3 | Deliveries | WP3.1 Delivery Note domain; WP3.2 Inventory reservation/dispatch integration (MOD-005); WP3.3 API/WEB/MOB surfaces; WP3.4 DeliveryDispatched event |
| E4 | Invoicing (incl. e-invoice) | WP4.1 Invoice domain; WP4.2 Posting integration (ENG-016 via MOD-002); WP4.3 E-invoice gateway integration; WP4.4 API/WEB/MOB surfaces; WP4.5 SalesInvoiceIssued event |
| E5 | Returns & Credit Notes | WP5.1 Return + Credit Note domain; WP5.2 Return window rule; WP5.3 API/WEB/MOB surfaces; WP5.4 CreditNoteIssued event |
| E6 | Pricing / Discounts / Schemes | WP6.1 Price list + discount scheme domain; WP6.2 Rule integration (ENG-012); WP6.3 API/WEB/MOB surfaces |
| E7 | Cross-Cutting | WP7.1 Audit (ENG-004); WP7.2 Numbering (ENG-017); WP7.3 Authorization (ENG-002/003); WP7.4 Notifications (ENG-025); WP7.5 Event Engine wiring (ENG-024); WP7.6 Analytics/AI touchpoints (MOD-017/018) |

Work packages are sized to fit sprint execution and remain the subject of Sprint PRDs (existing Sprints 001–006 under `docs/30-sprint-prds/sales/`).

## 6. Delivery Sequence

| Wave | Contents | Parallelizable |
| :-: | --- | --- |
| W1 | WS-1 Shared Domain baseline; E7 cross-cutting foundations (audit, numbering, authorization, event bus) | Foundation ↔ CI/CD setup (WS-9) |
| W2 | E1 Quotations → E2 Sales Orders | WEB and MOB surface work parallel per epic |
| W3 | E3 Deliveries → E4 Invoicing (incl. e-invoice integration) | Integrations (WS-5) parallel to WEB/MOB |
| W4 | E5 Returns & Credit Notes; E6 Pricing/Discounts/Schemes | Both epics can run in parallel |
| W5 | Analytics + AI touchpoints; hardening; performance; documentation; release | Testing, docs, release prep converge |

Dependencies: W2 requires W1; W3 requires W2 (order → delivery → invoice); W4 requires W2 (returns reference invoices) and W3 (credit notes reference posted invoices); W5 requires W2–W4.

## 7. Dependency Matrix

| Kind | Dependency | Nature |
| --- | --- | --- |
| Cross-module | MOD-001 Platform Administration | Identity (ENG-001), Authorization (ENG-002/003), Configuration (ENG-005), Notifications (ENG-025) |
| Cross-module | MOD-002 Accounting | Posting (ENG-016), ledger events, tax finalization |
| Cross-module | MOD-005 Inventory | Reservation, dispatch, InventoryReserved event |
| Cross-module | MOD-006 CRM | Customer master (read-only) |
| Cross-module | MOD-017 Analytics | KPI catalog, dashboards |
| Cross-module | MOD-018 AI Workspace | Copilot surfaces, guided actions |
| Platform engines | ENG-004/010/011/015/017/019/024 | Audit, workflow, approval, voucher, numbering, tax, events |
| External | E-invoice gateway | Country-specific IRN/e-invoice submission |
| External | Payment gateway | Payment capture, reconciliation events |
| External | Logistics providers | Dispatch handoff, tracking |

## 8. Milestones

| # | Milestone | Description |
| :-: | --- | --- |
| M0 | Kickoff | Team assembled; environments provisioned; plan approved |
| M1 | Shared Domain Ready | WS-1 complete; cross-cutting foundations wired |
| M2 | Quotations + Orders GA-candidate | E1 + E2 feature-complete across WEB/MOB/API |
| M3 | Deliveries + Invoicing GA-candidate | E3 + E4 feature-complete; e-invoice integrated in target locales |
| M4 | Returns + Pricing Complete | E5 + E6 feature-complete |
| M5 | Cross-Platform Hardening | Parity validation, performance, security review |
| M6 | Production Readiness Review | Ops sign-off, runbooks, observability, rollback plan |
| M7 | Production Release | Rollout under feature toggles; post-release stabilization |

## 9. Acceptance Traceability

Bidirectional traceability rule: **no work package without a certified source; no certified capability without at least one work package.**

| Work Package | GT-005 Capability | WEB-003 | MOB-003 | API-003 |
| --- | --- | --- | --- | --- |
| WP1.1–1.5 | Quotations | Quotation screens | Quotation screens | Quotation endpoints |
| WP2.1–2.6 | Sales Orders | Order screens + credit-limit flow | Order screens | Order endpoints + approval hook |
| WP3.1–3.4 | Deliveries | Delivery screens | Delivery screens (offline) | Delivery endpoints + events |
| WP4.1–4.5 | Invoicing (incl. e-invoice) | Invoice screens | Invoice screens | Invoice endpoints + posting hook |
| WP5.1–5.4 | Returns & Credit Notes | Return + Credit Note screens | Return + Credit Note screens | Return + Credit Note endpoints |
| WP6.1–6.3 | Pricing / Discounts / Schemes | Pricing UI | Pricing UI | Pricing endpoints |
| WP7.1–7.6 | Cross-cutting | Applies to all surfaces | Applies to all surfaces | Applies to all surfaces |

Every GT-005 capability is covered; every work package has a certified source.

## 10. Risks & Assumptions

**Risks and mitigations.**

| # | Risk | Mitigation |
| :-: | --- | --- |
| R1 | E-invoice gateway variance across locales | Isolate integration behind ENG-023 adapters; per-locale test suite; feature toggle per country |
| R2 | Payment reconciliation timing / duplicate events | Idempotent handlers, correlation IDs, replay-safe consumers |
| R3 | Offline mobile sync conflicts | Deterministic conflict resolution rules, server-side authoritative state, background reconciliation |
| R4 | Cross-module event ordering (Sales ↔ Inventory ↔ Accounting) | ENG-024 event contract tests; sagas where multi-step commits are required |
| R5 | Regulatory change during delivery | Locale packs via ENG-006; hot-swappable config via ENG-005 |
| R6 | Scope creep against certified spec | Governance gate: any new capability requires a new lifecycle pass; not admissible in this plan |

**Assumptions.**

- Certified specifications (GT-005, WEB-003, MOB-003, API-003) remain stable for the duration of implementation.
- Platform engines (ENG-001..028) are available in target environments.
- Cross-module dependencies (MOD-001/002/005/006/017/018) meet their published contracts.
- Delivery, staging, and production environments are provisioned per DevOps standards.

## 11. Implementation Planning Authorization

Governance-level authorization to implement MOD-003 was granted at `MOD003_IMPLEMENTATION_READY` (per `MOD003_IMPLEMENTATION_READINESS_REVIEW_20260719T220000Z`). This pass records the completion of implementation planning and establishes this document as the execution baseline.

> **MOD-003 implementation planning is complete. Engineering execution may proceed in accordance with the approved Implementation Plan and certified specifications.**

Lifecycle advances from `MOD003_IMPLEMENTATION_READY` to `MOD003_IMPLEMENTATION_PLANNED`. Any deviation from certified specifications requires a new governance pass and MUST NOT be absorbed by this plan.

## References

- `docs/45-module-publications/sales/MOD-003_MODULE_PUBLICATION.md`
- `docs/46-solution-design/web/sales/WEB-003_SOLUTION_DESIGN.md`
- `docs/46-solution-design/mobile/sales/MOB-003_SOLUTION_DESIGN.md`
- `docs/46-solution-design/api/sales/API-003_SOLUTION_DESIGN.md`
- `docs/50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_20260719T210000Z.md`
- `docs/50-audit-reports/MOD003_IMPLEMENTATION_READINESS_REVIEW_20260719T220000Z.md`
- `docs/SOLUTION_STATUS.md`
- `docs/15-governance/FINDING_SEVERITY_STANDARD.md`
