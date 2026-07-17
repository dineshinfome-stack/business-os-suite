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
| MOD004_PURCHASE_BASELINE_v1 | MOD-004 Purchase | 1.0 | Baseline | `docs/20-module-prds/purchase/MODULE_PRD.md` | SPR-MOD-004-001 … SPR-MOD-004-006 | [`40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md`](40-module-baselines/MOD004_PURCHASE_BASELINE_v1.md) |
| MOD005_INVENTORY_BASELINE_v1 | MOD-005 Inventory | 1.0 | Baseline | `docs/20-module-prds/inventory/MODULE_PRD.md` | SPR-MOD-005-001 … SPR-MOD-005-006 | [`40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md`](40-module-baselines/MOD005_INVENTORY_BASELINE_v1.md) |
| MOD006_CRM_BASELINE_v1 | MOD-006 CRM | 1.0 | Baseline | `docs/20-module-prds/crm/MODULE_PRD.md` | SPR-MOD-006-001 … SPR-MOD-006-006 | [`40-module-baselines/MOD006_CRM_BASELINE_v1.md`](40-module-baselines/MOD006_CRM_BASELINE_v1.md) |
| MOD007_HRMS_BASELINE_v1 | MOD-007 HRMS | 1.0 | Baseline | `docs/20-module-prds/hrms/MODULE_PRD.md` | SPR-MOD-007-001 … SPR-MOD-007-006 | [`40-module-baselines/MOD007_HRMS_BASELINE_v1.md`](40-module-baselines/MOD007_HRMS_BASELINE_v1.md) |
| MOD008_PAYROLL_BASELINE_v1 | MOD-008 Payroll | 1.0 | Baseline | `docs/20-module-prds/payroll/MODULE_PRD.md` | SPR-MOD-008-001 … SPR-MOD-008-006 | [`40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md`](40-module-baselines/MOD008_PAYROLL_BASELINE_v1.md) |
| MOD009_MANUFACTURING_BASELINE_v1 | MOD-009 Manufacturing | 1.0 | Baseline | `docs/20-module-prds/manufacturing/MODULE_PRD.md` | SPR-MOD-009-001 … SPR-MOD-009-006 | [`40-module-baselines/MOD009_MANUFACTURING_BASELINE_v1.md`](40-module-baselines/MOD009_MANUFACTURING_BASELINE_v1.md) |
| MOD010_PROJECTS_BASELINE_v1 | MOD-010 Projects | 1.0 | Baseline | `docs/20-module-prds/projects/MODULE_PRD.md` | SPR-MOD-010-001 … SPR-MOD-010-005 | [`40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md`](40-module-baselines/MOD010_PROJECTS_BASELINE_v1.md) |
| MOD011_AMC_BASELINE_v1 | MOD-011 AMC | 1.0 | Baseline | `docs/20-module-prds/amc/MODULE_PRD.md` | SPR-MOD-011-001 … SPR-MOD-011-004 | [`40-module-baselines/MOD011_AMC_BASELINE_v1.md`](40-module-baselines/MOD011_AMC_BASELINE_v1.md) |
| MOD012_FIELD_SERVICE_BASELINE_v1 | MOD-012 Field Service | 1.0 | Baseline | `docs/20-module-prds/field-service/MODULE_PRD.md` | SPR-MOD-012-001 … SPR-MOD-012-005 | [`40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md`](40-module-baselines/MOD012_FIELD_SERVICE_BASELINE_v1.md) |
| MOD013_ASSETS_BASELINE_v1 | MOD-013 Assets | 1.0 | Baseline | `docs/20-module-prds/assets/MODULE_PRD.md` | SPR-MOD-013-001 … SPR-MOD-013-004 | [`40-module-baselines/MOD013_ASSETS_BASELINE_v1.md`](40-module-baselines/MOD013_ASSETS_BASELINE_v1.md) |
| MOD014_FLEET_BASELINE_v1 | MOD-014 Fleet | 1.0 | Baseline | `docs/20-module-prds/fleet/MODULE_PRD.md` | SPR-MOD-014-001 … SPR-MOD-014-004 | [`40-module-baselines/MOD014_FLEET_BASELINE_v1.md`](40-module-baselines/MOD014_FLEET_BASELINE_v1.md) |
| MOD015_POS_BASELINE_v1 | MOD-015 POS | 1.0 | Baseline | `docs/20-module-prds/pos/MODULE_PRD.md` | SPR-MOD-015-001 … SPR-MOD-015-005 | [`40-module-baselines/MOD015_POS_BASELINE_v1.md`](40-module-baselines/MOD015_POS_BASELINE_v1.md) |

## References

- `docs/40-module-baselines/README.md`
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`
- `docs/MODULE_CATALOG.md`
- `docs/SPRINT_CATALOG.md`
