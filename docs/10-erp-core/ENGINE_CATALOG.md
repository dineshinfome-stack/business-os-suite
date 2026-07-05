---
title: "ERP Core Engine Catalog"
summary: "Master index of all ERP Core Engines: stable ID, category, version, status, stability, consumers, and direct dependencies."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["erp-core", "catalog", "index"]
document_type: "ERP Core Guide"
---

# ERP Core Engine Catalog

## Purpose

The **Engine Catalog** is the single tabular index of every ERP Core Engine in BusinessOS. It exists to support:

- architecture reviews,
- dependency and impact analysis,
- AI-assisted code generation and retrieval,
- onboarding of new engineers,
- traceability from ADRs, Module PRDs, and Sprint PRDs back to specific engines.

The catalog is **not** an engine specification. Normative content lives in each engine's document and in [`README.md`](./README.md) (Dependency Rules, Engine Dependency Matrix, Engine Versioning Policy). The catalog is a projection of those sources.

---

## How to Read This Catalog

| Column | Meaning |
|---|---|
| **ID** | Permanent engine identifier of the form `ENG-NNN`. Never reassigned. |
| **Engine** | Human-readable name, linked to the engine specification. |
| **Category** | One of the 8 ERP Core categories. |
| **Version** | Current SemVer of the engine's Capability Interface (from the engine's frontmatter). |
| **Status** | `draft` · `stable` · `deprecated` · `removed`. |
| **Stability** | `core` · `preview` · `experimental`. |
| **Used By** | Consumers of the engine. Coarse today (module families or `All modules` / `Most modules` / `TBD Pass 7+`) because business modules are authored in Pass 7+. |
| **Depends On** | **Direct** engine dependencies only. Event-only edges (`▲` in the Matrix) are excluded here; see the Engine Dependency Matrix in `README.md` for the complete edge set. |

---

## Engine ID Scheme

Every engine is assigned a permanent identifier of the form `ENG-NNN` (zero-padded, three digits, monotonically assigned).

- IDs are **stable**: never reassigned or reused, even if the engine is renamed, moved between folders, or deprecated.
- Deprecated or removed engines keep their ID and remain in the catalog with `status: deprecated` or `status: removed` for historical traceability.
- ADRs, Module PRDs, Sprint PRDs, and AI prompts **should reference engines by `ENG-NNN`** so references survive renames and folder moves.
- Initial allocation follows the reading order in [`README.md`](./README.md#reading-order): Foundation → Document → Workflow → Financial → Intelligence → Integration → Data Exchange → AI, producing `ENG-001` … `ENG-028`.
- New engines receive the next unused `ENG-NNN`.

---

## Engine Catalog Table

### Foundation

| ID | Engine | Category | Version | Status | Stability | Used By | Depends On |
|---|---|---|---|---|---|---|---|
| ENG-001 | [Identity Engine](./foundation/identity-engine.md) | Foundation | 1.0.0 | draft | core | All modules | — |
| ENG-002 | [Authorization Engine](./foundation/authorization-engine.md) | Foundation | 1.0.0 | draft | core | All modules | Identity |
| ENG-003 | [Permission Management Engine](./foundation/permission-management-engine.md) | Foundation | 1.0.0 | draft | core | All modules | Identity, Authorization |
| ENG-004 | [Audit Engine](./foundation/audit-engine.md) | Foundation | 1.0.0 | draft | core | All modules | Identity |
| ENG-005 | [Configuration Engine](./foundation/configuration-engine.md) | Foundation | 1.0.0 | draft | core | All modules | Identity, Authorization, Audit |
| ENG-006 | [Localization Engine](./foundation/localization-engine.md) | Foundation | 1.0.0 | draft | core | All modules | Identity, Configuration |

### Document

| ID | Engine | Category | Version | Status | Stability | Used By | Depends On |
|---|---|---|---|---|---|---|---|
| ENG-007 | [Document Engine](./document/document-engine.md) | Document | 1.0.0 | draft | core | Most modules | Foundation |
| ENG-008 | [Attachment Engine](./document/attachment-engine.md) | Document | 1.0.0 | draft | core | Most modules | Foundation, Document |
| ENG-009 | [File Storage Engine](./document/file-storage-engine.md) | Document | 1.0.0 | draft | core | Most modules | Foundation |

### Workflow

| ID | Engine | Category | Version | Status | Stability | Used By | Depends On |
|---|---|---|---|---|---|---|---|
| ENG-010 | [Workflow Engine](./workflow/workflow-engine.md) | Workflow | 1.0.0 | draft | core | Most modules | Foundation |
| ENG-011 | [Approval Engine](./workflow/approval-engine.md) | Workflow | 1.0.0 | draft | core | Most modules | Foundation, Workflow |
| ENG-012 | [Rules Engine](./workflow/rules-engine.md) | Workflow | 1.0.0 | draft | core | Most modules | Foundation |
| ENG-013 | [Automation Engine](./workflow/automation-engine.md) | Workflow | 1.0.0 | draft | core | Most modules | Foundation, Workflow, Rules |
| ENG-014 | [Scheduler Engine](./workflow/scheduler-engine.md) | Workflow | 1.0.0 | draft | core | Most modules | Foundation |

### Financial

| ID | Engine | Category | Version | Status | Stability | Used By | Depends On |
|---|---|---|---|---|---|---|---|
| ENG-015 | [Voucher Engine](./financial/voucher-engine.md) | Financial | 1.0.0 | draft | core | Accounting, Sales, Purchase, Inventory, Payroll | Foundation, Workflow, Numbering, Posting |
| ENG-016 | [Posting Engine](./financial/posting-engine.md) | Financial | 1.0.0 | draft | core | Accounting, Voucher | Foundation, Audit |
| ENG-017 | [Numbering Engine](./financial/numbering-engine.md) | Financial | 1.0.0 | draft | core | All voucher-producing modules | Foundation |
| ENG-018 | [Currency Engine](./financial/currency-engine.md) | Financial | 1.0.0 | draft | core | Accounting, Sales, Purchase, Payroll | Foundation |
| ENG-019 | [Tax Engine](./financial/tax-engine.md) | Financial | 1.0.0 | draft | core | Accounting, Sales, Purchase, POS | Foundation |

### Intelligence

| ID | Engine | Category | Version | Status | Stability | Used By | Depends On |
|---|---|---|---|---|---|---|---|
| ENG-020 | [Search Engine](./intelligence/search-engine.md) | Intelligence | 1.0.0 | draft | core | All modules | Foundation, Document |
| ENG-021 | [Reporting Engine](./intelligence/reporting-engine.md) | Intelligence | 1.0.0 | draft | core | All modules | Foundation, Document, Financial |
| ENG-022 | [Dashboard Engine](./intelligence/dashboard-engine.md) | Intelligence | 1.0.0 | draft | core | All modules | Foundation, Reporting |

### Integration

| ID | Engine | Category | Version | Status | Stability | Used By | Depends On |
|---|---|---|---|---|---|---|---|
| ENG-023 | [Integration Engine](./integration/integration-engine.md) | Integration | 1.0.0 | draft | core | All modules | Foundation |
| ENG-024 | [Event Engine](./integration/event-engine.md) | Integration | 1.0.0 | draft | core | All modules | Foundation |
| ENG-025 | [Notification Engine](./integration/notification-engine.md) | Integration | 1.0.0 | draft | core | Most modules | Foundation, Event |

### Data Exchange

| ID | Engine | Category | Version | Status | Stability | Used By | Depends On |
|---|---|---|---|---|---|---|---|
| ENG-026 | [Import Engine](./data-exchange/import-engine.md) | Data Exchange | 1.0.0 | draft | core | Most modules | Foundation, Document |
| ENG-027 | [Export Engine](./data-exchange/export-engine.md) | Data Exchange | 1.0.0 | draft | core | Most modules | Foundation, Document |

### AI

| ID | Engine | Category | Version | Status | Stability | Used By | Depends On |
|---|---|---|---|---|---|---|---|
| ENG-028 | [AI Copilot Engine](./ai/ai-copilot-engine.md) | AI | 1.0.0 | draft | core | TBD Pass 7+ | Foundation, Workflow, Document, Financial, Intelligence, Integration |

---

## Maintenance Rules

1. The catalog is a **derived index**. It MUST NOT introduce information that is not present in the corresponding engine specification or in [`README.md`](./README.md) (Dependency Rules, Engine Dependency Matrix, Engine Versioning Policy). On any conflict, the engine spec and the Matrix win; the catalog is corrected.
2. Any new engine, rename, version bump, status change, stability change, or dependency-edge change MUST update this catalog in the same change.
3. New engines receive the next unused `ENG-NNN`. **IDs are never reused** and never reassigned.
4. Deprecated or removed engines remain in the catalog with their `status` updated. Their row and ID are preserved for historical traceability.
5. `Depends On` MUST stay consistent with the Engine Dependency Matrix in [`README.md`](./README.md#engine-dependency-matrix). Event-only edges (`▲`) are intentionally omitted from this column and are only visible in the Matrix.
6. `Used By` is updated as Module PRDs (Pass 7+) declare engine consumption. Coarse values (`All modules`, `Most modules`, `TBD Pass 7+`) are acceptable placeholders until module PRDs land.

---

## Documentation Hierarchy

```text
FOUNDATION_FREEZE_v1
        │
        ▼
ERP Core README   (Dependency Rules · Dependency Matrix · Versioning Policy)
        │
        ▼
ENGINE_CATALOG    (derived index — this document)
        │
        ▼
28 Engine Specifications
```

The catalog is a downstream projection. It never overrides upstream sources.

---

## References

- [`docs/10-erp-core/README.md`](./README.md)
- [`docs/FOUNDATION_FREEZE_v1.md`](../FOUNDATION_FREEZE_v1.md)
- [`docs/canon.md`](../canon.md)
