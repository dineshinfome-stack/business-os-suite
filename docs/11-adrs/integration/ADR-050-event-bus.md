---
title: "ADR-050: Event Bus"
summary: "Proposed ADR: Event Bus."
adr_id: "ADR-050"
status: "Proposed"
owner: "Platform"
category: "Integration"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/integration-architecture.md", "docs/10-erp-core/integration/event-engine.md"]
related_engines: ["ENG-025"]
affected_documents: ["docs/02-architecture/integration-architecture.md", "docs/10-erp-core/integration/event-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "integration"]
document_type: "Architecture Decision Record"
---

# ADR-050: Event Bus

## Metadata

- **ADR ID:** ADR-050
- **Title:** Event Bus
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Integration
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/integration-architecture.md`, `docs/10-erp-core/integration/event-engine.md`
- **Affected Documents:** `docs/02-architecture/integration-architecture.md`, `docs/10-erp-core/integration/event-engine.md`
- **Related ERP Core Engines:** ENG-025
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Events are the backbone of cross-module and outbound integration.

## Problem Statement

Choose the event bus technology and topology.

## Decision

Inside the monolith, events are dispatched by the **Event Engine** using an in-process bus backed by a durable outbox in Postgres. External subscribers receive events via the Integration Engine. A managed broker (e.g. Kafka/PubSub) may be introduced later without changing producer contracts.

## Alternatives Considered

External broker from day one; direct method calls; unbounded queues.

## Trade-offs

Deferred broker cost vs. simple day-one topology.

## Consequences

All events pass through the outbox; producers never call HTTP directly.

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

In-process delivery cannot meet throughput or fan-out targets.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
