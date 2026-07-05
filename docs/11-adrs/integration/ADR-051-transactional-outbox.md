---
title: "ADR-051: Transactional Outbox"
summary: "Proposed ADR: Transactional Outbox."
adr_id: "ADR-051"
status: "Proposed"
owner: "Platform"
category: "Integration"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/10-erp-core/integration/event-engine.md"]
related_engines: ["ENG-025"]
affected_documents: ["docs/10-erp-core/integration/event-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "integration"]
document_type: "Architecture Decision Record"
---

# ADR-051: Transactional Outbox

## Metadata

- **ADR ID:** ADR-051
- **Title:** Transactional Outbox
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Integration
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/10-erp-core/integration/event-engine.md`
- **Affected Documents:** `docs/10-erp-core/integration/event-engine.md`
- **Related ERP Core Engines:** ENG-025
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Events must not be lost when the producing transaction commits, and must not be emitted if it rolls back.

## Problem Statement

Guarantee producer atomicity for events.

## Decision

Producers write events to an **outbox table** in the same transaction as state changes. A relay worker publishes and marks them delivered. Outbox rows are the source of truth for replay.

## Alternatives Considered

Publish-then-commit; commit-then-publish without outbox; two-phase commit with a broker.

## Trade-offs

Adds a table and a worker vs. eliminates the dual-write problem.

## Consequences

No event exists without a committed source-of-truth change.

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
