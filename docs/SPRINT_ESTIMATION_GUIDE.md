---
title: "Sprint Estimation Guide"
summary: "Non-numeric sizing framework for Sprint PRDs — Small / Medium / Large, based on business capability breadth, implementation complexity, engine integrations, cross-module impact, and ADR touch surface. Story points are explicitly out of scope."
layer: "delivery"
owner: "Engineering"
status: "approved"
updated: "2026-07-05"
tags: ["sprint", "estimation", "sizing", "governance"]
document_type: "Sprint Layer Guide"
---

# Sprint Estimation Guide

> **Sizing framework, not commitment.** Sprint sizes are qualitative categories that help authors decide when to split a Sprint PRD. They do not replace planning discussions, and they do not encode delivery commitments.

## Story Points Are Out of Scope

Sprint PRDs MUST NOT contain story points, hour estimates, or team-velocity numbers. Team-specific delivery planning happens outside the Sprint PRD.

## Sizing Dimensions

Every Sprint PRD SHOULD be sized against five dimensions:

1. **Business capability breadth** — how many end-to-end capabilities the sprint delivers.
2. **Implementation complexity** — data model changes, algorithmic work, integration surface.
3. **Engine integrations** — number of ERP Core Engines (`ENG-NNN`) consumed.
4. **Cross-module impact** — number of other modules affected via events, shared master data, or approved APIs.
5. **ADR touch surface** — number of ADRs (`ADR-NNN`) whose constraints materially shape the sprint.

## Size Categories

### Small

- 1 complete, narrowly scoped capability.
- Low implementation complexity; minimal or no schema change.
- 0–1 engine integrations.
- Cross-module impact: none, or read-only via a single published event.
- ADR touch surface: 0–1.

**Worked example.** *MOD-001 Platform Administration — "Organization settings view/edit"* — a settings page that reads and writes existing organization fields; consumes the audit engine only; no new schema; no cross-module events; touches at most the audit-trail ADR.

### Medium

- 1–2 complete capabilities within one module.
- Moderate implementation complexity; new tables or non-trivial schema evolution.
- 2–3 engine integrations.
- Cross-module impact: publishes 1–2 events consumed by other modules, or reads shared master data.
- ADR touch surface: 2–3.

**Worked example.** *MOD-002 Accounting — "Chart of Accounts management"* — CRUD over the chart of accounts with hierarchy, activation rules, audit events; consumes identity, audit, and validation engines; publishes `chart-of-accounts.updated`; touches ADRs on multi-tenant isolation and audit strategy.

### Large

- Multiple related capabilities forming a coherent slice within one module.
- High implementation complexity; multiple new tables, RLS design, migration coordination.
- 4+ engine integrations.
- Cross-module impact: bidirectional events or new shared contracts.
- ADR touch surface: 4+.

**Worked example.** *MOD-005 Inventory — "Stock ledger and movements"* — introduces the stock ledger tables, ingress/egress transactions, valuation hooks; consumes identity, audit, workflow, validation, and event engines; publishes stock movement events consumed by Accounting and Sales; touches ADRs on ledger immutability, event ordering, and multi-warehouse partitioning.

A sprint that satisfies **Large** criteria across multiple dimensions is a strong signal to split it into two vertical slices (per `SPRINT_AUTHORING_GUIDE.md` §2).

## Governance

- Size is recorded in the Sprint PRD (Sprint PRD template, "Objective and Scope" section).
- If mid-sprint the size clearly no longer matches the sprint's actual scope, the Sprint PRD is either revised (before `In Progress`) or split into a new sprint.

## References

- `docs/SPRINT_AUTHORING_GUIDE.md`
- `docs/SPRINT_ROADMAP.md`
- `docs/SPRINT_DEPENDENCY_MATRIX.md`
- `docs/99-templates/sprint-prd-template.md`
