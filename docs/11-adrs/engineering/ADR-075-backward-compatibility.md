---
title: "ADR-075: Backward Compatibility"
summary: "Proposed ADR: Backward Compatibility."
adr_id: "ADR-075"
status: "Proposed"
owner: "Platform"
category: "Engineering"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/api-architecture.md", "docs/02-architecture/event-catalog.md"]
related_engines: ["ENG-021", "ENG-025"]
affected_documents: ["docs/02-architecture/api-architecture.md", "docs/02-architecture/event-catalog.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "engineering"]
document_type: "Architecture Decision Record"
---

# ADR-075: Backward Compatibility

## Metadata

- **ADR ID:** ADR-075
- **Title:** Backward Compatibility
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Engineering
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/api-architecture.md`, `docs/02-architecture/event-catalog.md`
- **Affected Documents:** `docs/02-architecture/api-architecture.md`, `docs/02-architecture/event-catalog.md`
- **Related ERP Core Engines:** ENG-021, ENG-025
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Consumers (internal modules, external integrators, AI tools) rely on stable contracts.

## Problem Statement

State the compatibility contract.

## Decision

Within a **major version**, APIs, events, and engine capability interfaces are backward compatible. Breaking changes require a new major version and a deprecation window of at least two minor releases or 90 days, whichever is longer.

## Alternatives Considered

No compatibility guarantee; per-release breaking changes; frozen contracts.

## Trade-offs

Slower breaking change cadence vs. trust and integrator sanity.

## Consequences

Deprecations are tracked and surfaced to consumers well before removal.

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

A security fix legitimately requires an immediate breaking change.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
