---
title: "Architecture Review Gate Standard"
summary: "Recurring architecture review gate held every 2–3 sprints. Defines the fixed checklist and finding lifecycle."
document_type: "Governance Standard"
layer: "governance"
owner: "Architecture Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["governance", "architecture", "review-gate"]
---

# Architecture Review Gate Standard

## Purpose

Prevent architectural drift by holding a **recurring review gate every 2–3 sprints**. The gate does not block feature work; it produces findings that are triaged against `FINDING_SEVERITY_STANDARD.md`.

## Cadence

- One gate every 2–3 sprints, aligned to sprint completion.
- Ad-hoc gates MAY be called by the Architecture Council when a major shared-service change lands.

## Fixed Checklist

Every gate runs the same checklist:

1. **Data-model cleanliness** — no orphan tables, no unused columns, foreign keys consistent, naming per `DATABASE_STANDARD.md`.
2. **Duplicated logic** — no two modules re-implementing the same capability that belongs in a cross-cutting service.
3. **Shared-service promotion** — any logic used by ≥ 2 modules that is not yet in `CROSS_CUTTING_SERVICES_CATALOG.md` is flagged for promotion.
4. **Tech-debt logging** — every known compromise recorded, owned, and dated.
5. **Naming consistency** — module, table, column, permission, role, and route naming follow their respective standards.
6. **Docs-code alignment** — governance standards, ADRs, and code do not contradict each other.
7. **Governance freshness** — no `Approved` standard is more than 30 days past its `next_review`.

## Outputs

Each gate produces one report under `docs/50-audit-reports/ARCHITECTURE_REVIEW_GATE_<yyyymmdd>.md` containing:

- Check / Result / Action table.
- Findings, each classified by `FINDING_SEVERITY_STANDARD.md`.
- Follow-up owners and dates.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
