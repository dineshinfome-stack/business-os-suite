---
title: "ADR-013: Money Representation"
summary: "Proposed ADR: Money Representation."
adr_id: "ADR-013"
status: "Proposed"
owner: "Platform"
category: "Data"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/data-dictionary.md", "docs/10-erp-core/financial/currency-engine.md"]
related_engines: ["ENG-016", "ENG-017"]
affected_documents: ["docs/02-architecture/data-dictionary.md", "docs/10-erp-core/financial/currency-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "data"]
document_type: "Architecture Decision Record"
---

# ADR-013: Money Representation

## Metadata

- **ADR ID:** ADR-013
- **Title:** Money Representation
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Data
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/data-dictionary.md`, `docs/10-erp-core/financial/currency-engine.md`
- **Affected Documents:** `docs/02-architecture/data-dictionary.md`, `docs/10-erp-core/financial/currency-engine.md`
- **Related ERP Core Engines:** ENG-016, ENG-017
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Financial calculations require exact arithmetic and unambiguous currency.

## Problem Statement

Choose the representation for monetary values.

## Decision

All money is stored as `numeric(20,4)` alongside an ISO-4217 `currency_code`. No floating point. Presentation rounding is applied at the UI/report layer only.

## Alternatives Considered

Float/double; integer minor units without scale; string amounts.

## Trade-offs

Slightly more storage vs. correctness and simplicity of tax/rounding rules.

## Consequences

Currency and Tax engines assume this representation; all APIs return `{amount, currency}` objects.

## Migration Strategy

Not applicable at this stage — no existing production system. Adoption is by construction as engines and modules are authored.

## Backward Compatibility

Governed by ADR-075. Any future change to this decision follows the deprecation window defined there.

## Risks

- The decision proves too rigid for a future use case → mitigated by ADR supersession.
- The decision proves too lax and permits drift → mitigated by dependency linters and CI gates where applicable.

## Rejected Options

See Alternatives Considered.

## Implementation Notes

Realised in code and configuration by the related engines and by the architecture documents listed above.

## Future Review Trigger

No scheduled review required.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
