---
title: "ADR-063: Testing Strategy"
summary: "Proposed ADR: Testing Strategy."
adr_id: "ADR-063"
status: "Proposed"
owner: "Platform"
category: "DevOps"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/testing-strategy.md"]
related_engines: []
affected_documents: ["docs/02-architecture/testing-strategy.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "devops"]
document_type: "Architecture Decision Record"
---

# ADR-063: Testing Strategy

## Metadata

- **ADR ID:** ADR-063
- **Title:** Testing Strategy
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** DevOps
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/testing-strategy.md`
- **Affected Documents:** `docs/02-architecture/testing-strategy.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Testing must scale with the ERP surface without blocking delivery.

## Problem Statement

Define the test pyramid and gates.

## Decision

The pyramid is **unit → integration → contract → end-to-end**, with unit tests dominating. Contract tests protect module boundaries and event schemas. Coverage targets are quality signals, not gates; failing critical-path E2E is a hard gate.

## Alternatives Considered

Manual QA-only; UI-first testing; 100% coverage mandate.

## Trade-offs

Upfront investment vs. reliable change.

## Consequences

Every module publishes contract tests for its ports; CI fails on contract regression.

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

A shift in cost/benefit for a test layer (e.g. much cheaper E2E infra).

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
