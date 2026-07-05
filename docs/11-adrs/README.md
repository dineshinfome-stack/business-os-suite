---
title: "ADR Repository"
summary: "Governance, lifecycle, categories, numbering, and review cadence for BusinessOS Architecture Decision Records."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["adr", "governance", "index"]
document_type: "Governance Guide"
---

# Architecture Decision Records

The **ADR Repository** is the Decision Layer of BusinessOS. Passes 1–5 (Canon, Business Blueprint, Architecture, ERP Core Engines) are considered **frozen**; from Pass 6 onward, all architectural evolution flows through ADRs.

## Purpose

- Record every significant engineering decision that implements the frozen architecture.
- Preserve context, alternatives, and trade-offs so future maintainers understand *why*.
- Provide a stable reference target for Module PRDs, Sprint PRDs, and AI-assisted generation.

## Lifecycle

ADR lifecycle statuses:

| Status | Meaning |
| --- | --- |
| Draft | Being written; not yet proposed. |
| Proposed | Complete draft; open for review. |
| Accepted | Ratified; authoritative for implementation. |
| Superseded | Replaced by a newer ADR; the replacement is linked in `superseded_by`. |
| Deprecated | No longer recommended, but not yet replaced. |
| Rejected | Considered and declined. Kept for the record. |

Superseded and Rejected ADRs are **never deleted**; their IDs are permanent.

## Reading Order

1. This README (governance & rules).
2. `ADR_TEMPLATE.md` (mandatory template).
3. `ADR_INDEX.md` (master index of every ADR).
4. Category folder READMEs.
5. Individual ADRs by ID.

## ADR Categories

| Category | Purpose |
| --- | --- |
| Architecture | Structural decisions |
| Data | Data governance decisions |
| Platform | API / platform decisions |
| Security | Security decisions |
| AI | AI governance |
| Integration | Cross-system integration |
| DevOps | Runtime & operations |
| Engineering | Development practices |
| UI | Design standards |

## ADR Number Ranges

Every ADR receives a permanent identifier `ADR-NNN`. Numbers are allocated inside a reserved range per category:

- `ADR-001–009` → Architecture
- `ADR-010–019` → Data
- `ADR-020–029` → Platform
- `ADR-030–039` → Security
- `ADR-040–049` → AI
- `ADR-050–059` → Integration
- `ADR-060–069` → DevOps
- `ADR-070–079` → Engineering
- `ADR-080–089` → UI
- `ADR-090+` reserved for future categories.

A new ADR MUST use the next unused number **within its category's range**. If a range fills, allocate the next unused block of ten and record the extension in this section. IDs are permanent; ranges are structural guidance, not license to renumber.

## ADR Review Cadence

Accepted ADRs are **not permanent by default**. They SHOULD be reviewed when one or more of the following occurs:

- A new Foundation baseline is proposed.
- A major platform capability is introduced or retired.
- A technology limitation materially affects business goals.
- Security, regulatory, or compliance requirements change.
- An Accepted ADR is proposed to be superseded.

Each ADR SHOULD record its next review trigger in the **Future Review Trigger** field, or explicitly state that no scheduled review is required.

## Authoring an ADR

1. Copy `ADR_TEMPLATE.md`.
2. Claim the next unused number in your category's range.
3. Fill every mandatory field, including `affected_documents` and `Future Review Trigger`.
4. Add a row to `ADR_INDEX.md` in ID order in the same change.
5. Open a review; upon approval the status moves from `Proposed` to `Accepted`.

## Governance Chain

```text
Foundation
    ↓
Architecture
    ↓
ERP Core Engines
    ↓
ADRs
    ↓
Module PRDs
    ↓
Sprint PRDs
    ↓
Implementation
```

## Observation for Pass 7+

Beginning with Pass 7 (Domain / Module PRDs), platform architecture is considered complete. Module PRDs MUST consume Canon, Architecture, ERP Core Engines, and Accepted ADRs. They MUST NOT redefine platform behavior, architectural patterns, or reusable engine capabilities.

If a Module PRD requires a change to platform behavior, the change MUST first be proposed through a new or superseding ADR. Only after that ADR is Accepted may the Module PRD reference the updated behavior.

This preserves a single direction of dependency:
**Foundation → Architecture → ERP Core Engines → ADRs → Module PRDs → Sprint PRDs → Implementation.**

## References

- `docs/canon.md`
- `docs/FOUNDATION_FREEZE_v1.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/11-adrs/ADR_TEMPLATE.md`
- `docs/11-adrs/ADR_INDEX.md`
