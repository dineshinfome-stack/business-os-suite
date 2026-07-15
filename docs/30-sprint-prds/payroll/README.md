---
title: "MOD-008 — Payroll — Sprints"
summary: "Sprint PRDs for Payroll (MOD-008). Sprint identifiers are prefixed SPR-MOD-008-NNN."
layer: "delivery"
owner: "People"
status: "approved"
updated: "2026-07-05"
module_id: "MOD-008"
sprint_prefix: "SPR-MOD-008-"
tags: ["sprint", "prd", "readme"]
document_type: "Sprint Module Guide"
---

# MOD-008 — Payroll — Sprints

> **Sprint container for Payroll.** Sprint PRDs in this folder implement slices of the [MOD-008 Module PRD](../../20-module-prds/payroll/MODULE_PRD.md). They consume ERP Core Engines and Accepted ADRs; they never redefine them.

## Parent Module

- **Module ID:** `MOD-008`
- **Module Name:** Payroll
- **Module README:** [`../../20-module-prds/payroll/README.md`](../../20-module-prds/payroll/README.md)
- **Module PRD (authoritative):** [`../../20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)

## Sprint Identifier Prefix

All Sprint PRDs in this folder use the prefix **`SPR-MOD-008-NNN`**, where `NNN` is a zero-padded sequential number within the module (e.g. `SPR-MOD-008-001`, `SPR-MOD-008-002`, …). Identifiers are permanent and never reused.

## Sprint Plan (Stage 1)

The Stage 1 Sprint Plan for MOD-008 is authored at [`MOD-008_SPRINT_PLAN.md`](./MOD-008_SPRINT_PLAN.md) under GT-002 (Governance Framework v1.0, Pass 10.0.0). It reconciles the sprint count for this module to **6** and is the authoritative source for sprint decomposition, capability allocation, and dependency sequencing.

## Planning Placeholders

> Each row represents a planned sprint placeholder for roadmap purposes only. The existence of a row does not constitute creation or approval of a Sprint PRD. A Sprint ID becomes active documentation only when a corresponding Sprint PRD file is authored under this folder and registered in `docs/SPRINT_CATALOG.md`.

| Sprint ID | Iteration | Goal | Status | Dependencies |
| --- | --- | --- | --- | --- |
| [SPR-MOD-008-001](./SPR-MOD-008-001-payroll-foundation-and-salary-structures.md) | Sprint 1 | Payroll Foundation & Salary Structures | Draft | `MOD001_PLATFORM_BASELINE_v1`, `MOD007_HRMS_BASELINE_v1` |
| [SPR-MOD-008-002](./SPR-MOD-008-002-payroll-cycles-and-runs.md) | Sprint 2 | Payroll Cycles & Runs | Draft | SPR-MOD-008-001 |
| [SPR-MOD-008-003](./SPR-MOD-008-003-statutory-computations.md) | Sprint 3 | Statutory Computations | Draft | SPR-MOD-008-002 |
| SPR-MOD-008-004 | Sprint 4 | Reimbursements & Advances | Planned | SPR-MOD-008-001, SPR-MOD-008-002 |
| SPR-MOD-008-005 | Sprint 5 | Payslip Generation & Disbursement | Planned | SPR-MOD-008-002, SPR-MOD-008-003, SPR-MOD-008-004 |
| SPR-MOD-008-006 | Sprint 6 | Payroll Analytics & Compliance | Planned | SPR-MOD-008-001 … SPR-MOD-008-005 |

The `Estimated Sprint Count` for this module is reconciled to **6** by the Stage 1 Sprint Plan (upward from the 4 recorded in `docs/SPRINT_ROADMAP.md`). Row goals and dependencies above trace to `MOD-008_SPRINT_PLAN.md` §2 and §4.

## Authoring Rules

- Follow [`docs/SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md) — including the Sprint Traceability Rule and the Sprint Completion Rule.
- Size sprints against [`docs/SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md).
- Sequence sprints per [`docs/SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).
- Use [`docs/99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md).
- Do not add business requirements that are not first captured in the parent Module PRD.
- Reference upstream layers by stable identifier (`ENG-NNN`, `ADR-NNN`, `MOD-NNN`).

## References

- [`../README.md`](../README.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../20-module-prds/payroll/MODULE_PRD.md`](../../20-module-prds/payroll/MODULE_PRD.md)
- [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
- [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
