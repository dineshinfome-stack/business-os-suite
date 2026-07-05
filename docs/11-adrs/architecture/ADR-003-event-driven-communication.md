---
title: "ADR-003: Event-Driven Communication"
summary: "Accepted ADR: Event-Driven Communication."
adr_id: "ADR-003"
status: "Accepted"
owner: "Platform"
category: "Architecture"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/master-architecture.md", "docs/02-architecture/event-catalog.md", "docs/10-erp-core/integration/event-engine.md"]
related_engines: ["ENG-025", "ENG-004", "ENG-019", "ENG-020"]
affected_documents: ["docs/02-architecture/master-architecture.md", "docs/02-architecture/event-catalog.md", "docs/10-erp-core/integration/event-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "architecture"]
document_type: "Architecture Decision Record"
---

# ADR-003: Event-Driven Communication

## Metadata

- **ADR ID:** ADR-003
- **Title:** Event-Driven Communication
- **Status:** Accepted
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Architecture
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/master-architecture.md`, `docs/02-architecture/event-catalog.md`, `docs/10-erp-core/integration/event-engine.md`
- **Affected Documents:** `docs/02-architecture/master-architecture.md`, `docs/02-architecture/event-catalog.md`, `docs/10-erp-core/integration/event-engine.md`
- **Related ERP Core Engines:** ENG-025, ENG-004, ENG-019, ENG-020
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Modules must react to each other (invoice posted → inventory updated → notification sent) without direct coupling.

## Problem Statement

Choose the primary inter-module communication style inside the modular monolith.

## Decision

Inter-module communication for side-effects is **event-driven** via the Event Engine. Synchronous calls are reserved for read queries that require immediate consistency within a single bounded context. Every published event is registered in the Event Catalog with a versioned schema.

## Alternatives Considered

Direct method calls across modules; RPC-only between contexts; polling.

## Trade-offs

Loose coupling and better auditability vs. eventual consistency and the need for outbox/idempotency discipline.

## Consequences

All cross-context side-effects flow through events; producers own the schema; consumers are idempotent and version-tolerant.

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
