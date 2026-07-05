---
title: "ADR-016: Data Versioning"
summary: "Proposed ADR: Data Versioning."
adr_id: "ADR-016"
status: "Proposed"
owner: "Platform"
category: "Data"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/database-standards.md", "docs/02-architecture/event-catalog.md"]
related_engines: ["ENG-025"]
affected_documents: ["docs/02-architecture/database-standards.md", "docs/02-architecture/event-catalog.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "data"]
document_type: "Architecture Decision Record"
---

# ADR-016: Data Versioning

## Metadata

- **ADR ID:** ADR-016
- **Title:** Data Versioning
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Data
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/database-standards.md`, `docs/02-architecture/event-catalog.md`
- **Affected Documents:** `docs/02-architecture/database-standards.md`, `docs/02-architecture/event-catalog.md`
- **Related ERP Core Engines:** ENG-025
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Both schema and event payloads must evolve without breaking consumers.

## Problem Statement

Define versioning conventions for data at rest and in transit.

## Decision

Schemas evolve via **expand-migrate-contract** migrations; every event schema is versioned in the Event Catalog with additive-only changes within a major version. Breaking changes require a new major version and a superseded predecessor.

## Alternatives Considered

In-place breaking migrations; unversioned events; per-consumer schemas.

## Trade-offs

Slower change cadence vs. safe rolling deploys and consumer independence.

## Consequences

All migrations pass under both old and new code; Event Catalog is the single source of truth for event versions.

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

An event's cardinality of consumers makes coordinated major upgrades intractable.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
