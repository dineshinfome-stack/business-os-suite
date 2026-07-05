---
title: "ADR-054: Dead Letter Handling"
summary: "Proposed ADR: Dead Letter Handling."
adr_id: "ADR-054"
status: "Proposed"
owner: "Platform"
category: "Integration"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/integration-architecture.md"]
related_engines: ["ENG-025", "ENG-026"]
affected_documents: ["docs/02-architecture/integration-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "integration"]
document_type: "Architecture Decision Record"
---

# ADR-054: Dead Letter Handling

## Metadata

- **ADR ID:** ADR-054
- **Title:** Dead Letter Handling
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Integration
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/integration-architecture.md`
- **Affected Documents:** `docs/02-architecture/integration-architecture.md`
- **Related ERP Core Engines:** ENG-025, ENG-026
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Some deliveries will exceed their retry budget.

## Problem Statement

Define what happens after retries are exhausted.

## Decision

Failed deliveries land in a **per-integration dead-letter store** with the original payload, delivery history, and error. A operator UI supports inspection, redrive, and discard, all audited.

## Alternatives Considered

Silent drop; unbounded retry; email-only alerts.

## Trade-offs

One more surface to operate vs. no lost events.

## Consequences

Every consumer has a DLQ; DLQ depth is an SLO signal.

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
