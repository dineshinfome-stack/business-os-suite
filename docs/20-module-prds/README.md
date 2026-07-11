---
title: "20 Module PRDs — Overview"
summary: "Authoritative business specifications for all BusinessOS bounded contexts. Modules consume Foundation, Architecture, ERP Core Engines, and Accepted ADRs; they never redefine them."
layer: "business"
owner: "Product"
status: "approved"
updated: "2026-07-05"
tags: ["modules", "prd", "overview"]
document_type: "Module Layer Guide"
---

# 20 Module PRDs — Overview

> **Authoritative for the business layer.** Each Module PRD is the authoritative business specification for its bounded context. Module PRDs **consume** the frozen platform (Foundation, Architecture, ERP Core Engines, Accepted ADRs) — they never redefine it. On any conflict with an upstream authoritative document, the upstream wins.

## Module Architecture

Each module is a **bounded context** with:

- a stable identifier `MOD-NNN`,
- a `README.md` (this layer guide's companion, one per folder),
- a `MODULE_PRD.md` (authoritative business specification).

Modules interact through **published events**, **approved APIs**, and **shared master data** — never through direct database access or in-process coupling.

## Reading Order

1. This overview.
2. The Module Dependency Rules below.
3. The Module Identifier Registry.
4. Any individual module — start with its `README.md`, then its `MODULE_PRD.md`.

## Module Dependency Philosophy

Modules exist to encode **business capabilities**. Reusable platform behavior lives in **ERP Core Engines**. When a module needs security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI capability, it **consumes the engine** rather than reimplementing the behavior. This keeps the business layer thin and the platform layer stable.

## Relationship to ERP Core Engines

- Every module declares its consumed engines in Section 12 of its PRD.
- Engines are referenced by their stable identifier `ENG-NNN` from `docs/10-erp-core/ENGINE_CATALOG.md`.
- Modules MUST NOT redefine engine behavior. Engine contracts are versioned; breaking changes require an Accepted ADR.

## Relationship to ADRs

- Every module declares the ADRs it relies on in its PRD frontmatter (`related_adrs`) and body.
- Only **Accepted** ADRs from `docs/11-adrs/ADR_INDEX.md` may be relied upon. A Proposed ADR may only be referenced when explicitly flagged as an awaited dependency.
- Modules do not create or ratify ADRs. When a module raises an architectural question, an ADR is opened in `docs/11-adrs/` and referenced back.

## Relationship to Sprint PRDs

- Sprint PRDs (Pass 8+) implement subsets of Module PRDs.
- Sprint PRDs MUST NOT introduce new business requirements that are not first captured in a Module PRD.
- API contracts, database schemas, UI mockups, and test cases live in Sprint PRDs, not here.

## Module Lifecycle

`Draft → Approved → Superseded | Deprecated`. Approved is the default here; lifecycle transitions are recorded via `updated` and are governed per `docs/DOCUMENT_OWNERSHIP_MATRIX.md`.

## Module Dependency Rules

- Modules **may** depend on:
  - ERP Core Engines (`ENG-NNN`)
  - Accepted ADRs (`ADR-NNN`)
  - Foundation (`docs/FOUNDATION_FREEZE_v1.md`)
  - Architecture (`docs/02-architecture/`)
- Modules **MUST NOT**:
  - redefine ERP Core Engines,
  - redefine Architecture,
  - redefine Canon,
  - redefine Accepted ADRs.
- Cross-module communication occurs **only** through:
  - published events,
  - approved APIs,
  - shared master data (read-only, owned by the source module).
- **No cyclic module dependencies.** The dependency graph is acyclic and mirrored (a module's `Depends On` set is the inverse of the counterpart's `Provides To` set).

## Module Identifier Registry

Canonical, permanent registry. Folder names, module names, and sidebar labels **may** evolve for business clarity; the `MOD-NNN` identifier **must not** change and is never reused, even if the module is renamed, merged, split, or retired.

| Module ID | Folder | Module Name | Domain | Owner |
| --- | --- | --- | --- | --- |
| MOD-001 | `platform` | Platform Administration | Platform | Platform |
| MOD-002 | `accounting` | Accounting | Finance | Finance |
| MOD-003 | `sales` | Sales | Revenue | Revenue |
| MOD-004 | `purchase` | Purchase | Procurement | Procurement |
| MOD-005 | `inventory` | Inventory | Supply Chain | Supply Chain |
| MOD-006 | `crm` | CRM | Customer | Revenue |
| MOD-007 | `hrms` | HRMS | People | People |
| MOD-008 | `payroll` | Payroll | People | People |
| MOD-009 | `manufacturing` | Manufacturing | Operations | Operations |
| MOD-010 | `projects` | Projects | Delivery | Delivery |
| MOD-011 | `amc` | AMC | Service | Service |
| MOD-012 | `field-service` | Field Service | Service | Service |
| MOD-013 | `assets` | Assets | Operations | Operations |
| MOD-014 | `fleet` | Fleet | Operations | Operations |
| MOD-015 | `pos` | POS | Revenue | Revenue |
| MOD-016 | `service-desk` | Service Desk | Service | Service |
| MOD-017 | `analytics` | Analytics | Insights | Insights |
| MOD-018 | `ai` | AI Workspace | AI | AI Platform |
| MOD-019 | `warehouse` | Warehouse | Operations | Operations |

## Identifier Cross-Reference Convention

Whenever an ERP Core Engine, ADR, or Module is referenced in documentation, its stable identifier (`ENG-NNN`, `ADR-NNN`, or `MOD-NNN`) SHOULD accompany the human-readable name on first reference within a document. Subsequent references in the same document may use either the identifier or the name where context is unambiguous. Examples: *Accounting (MOD-002)*, *Posting Engine (ENG-016)*, *RBAC + ABAC (ADR-032)*.

## References

- `docs/FOUNDATION_FREEZE_v1.md`
- `docs/canon.md`
- `docs/02-architecture/master-architecture.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/README.md`
- `docs/11-adrs/ADR_INDEX.md`
- `docs/MODULE_CATALOG.md`
- `docs/ENGINE_USAGE_MATRIX.md`
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md`
