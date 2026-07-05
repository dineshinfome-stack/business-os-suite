---
title: "ADR-012: UUID Primary Keys"
summary: "Proposed ADR: UUID Primary Keys."
adr_id: "ADR-012"
status: "Proposed"
owner: "Platform"
category: "Data"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/database-standards.md", "docs/02-architecture/data-dictionary.md"]
related_engines: []
affected_documents: ["docs/02-architecture/database-standards.md", "docs/02-architecture/data-dictionary.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "data"]
document_type: "Architecture Decision Record"
---

# ADR-012: UUID Primary Keys

## Metadata

- **ADR ID:** ADR-012
- **Title:** UUID Primary Keys
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Data
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/database-standards.md`, `docs/02-architecture/data-dictionary.md`
- **Affected Documents:** `docs/02-architecture/database-standards.md`, `docs/02-architecture/data-dictionary.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Identifiers are exchanged across modules, events, and external systems; they must be stable, non-guessable, and safe to generate client-side or server-side.

## Problem Statement

Choose the primary key strategy.

## Decision

All entities use **UUID v7** primary keys stored as `uuid` in Postgres. Human-facing document numbers are separate and issued by the Numbering Engine.

## Alternatives Considered

Bigint sequences; ULIDs as text; composite keys.

## Trade-offs

Slightly larger keys and less locality than sequences; but portable, non-enumerable, and mergeable across environments.

## Consequences

Every table's primary key is `uuid`; document numbers are never used as foreign keys.

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

Index/storage overhead becomes a measurable bottleneck for a hot table.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
