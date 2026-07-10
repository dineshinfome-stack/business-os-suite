---
title: "Module Baseline Catalog"
summary: "Catalog of every Module Baseline (Stage 3 artifact): baseline identifier, module, version, status, source PRD, sprint range, and path. Populated as modules complete Stage 3."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-06"
tags: ["baseline", "module", "catalog", "index"]
document_type: "Governance Guide"
---

# Module Baseline Catalog

> **Derived document.** Projection of `docs/40-module-baselines/`. Authoritative baseline content lives in each `MOD<NNN>_<MODULE>_BASELINE_v<version>.md`. On any conflict, the baseline file wins and this catalog is corrected in the same change.

## Purpose

The **Module Baseline Catalog** enumerates every Module Baseline (Stage 3 artifact of [`MODULE_IMPLEMENTATION_WORKFLOW.md`](./MODULE_IMPLEMENTATION_WORKFLOW.md)), keyed by its permanent baseline identifier. Rows link to the authoritative baseline file.

## How to Read

- **Baseline ID** — `MOD<NNN>_<MODULE>_BASELINE_v<version>`.
- **Module** — parent `MOD-NNN`.
- **Version** — integer version (`1`, `2`, …). A new version supersedes the previous one; older versions are retained as historical record.
- **Status** — `Baseline` \| `Superseded`.
- **Source Module PRD** — the `MODULE_PRD.md` version at baseline.
- **Sprint Range** — the Sprint PRD range delivered under the Stage 1 plan.
- **Path** — repository-relative path.

## Maintenance Note

This catalog SHOULD be updated whenever a Module Baseline is authored or superseded. It MUST NOT become an independent source of truth.

A future `Stage` column (Planning / Authoring / Baseline) MAY be introduced once multiple modules are represented; the schema is extensible without rework.

## Catalog

| Baseline ID | Module | Version | Status | Source Module PRD | Sprint Range | Path |
| --- | --- | --- | --- | --- | --- | --- |
| MOD001_PLATFORM_BASELINE_v1 | MOD-001 Platform Administration | 1.0 | Baseline | `docs/20-module-prds/platform/MODULE_PRD.md` | SPR-MOD-001-001 … SPR-MOD-001-006 | [`40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md`](40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md) |
| MOD002_ACCOUNTING_BASELINE_v1 | MOD-002 Accounting | 1.0 | Baseline | `docs/20-module-prds/accounting/MODULE_PRD.md` | SPR-MOD-002-001 … SPR-MOD-002-006 | [`40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`](40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md) |
| MOD003_SALES_BASELINE_v1 | MOD-003 Sales | 1.0 | Baseline | `docs/20-module-prds/sales/MODULE_PRD.md` | SPR-MOD-003-001 … SPR-MOD-003-006 | [`40-module-baselines/MOD003_SALES_BASELINE_v1.md`](40-module-baselines/MOD003_SALES_BASELINE_v1.md) |

## References

- `docs/40-module-baselines/README.md`
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
- `docs/MODULE_CATALOG.md`
- `docs/SPRINT_CATALOG.md`
