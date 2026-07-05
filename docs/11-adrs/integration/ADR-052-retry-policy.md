---
title: "ADR-052: Retry Policy"
summary: "Proposed ADR: Retry Policy."
adr_id: "ADR-052"
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

# ADR-052: Retry Policy

## Metadata

- **ADR ID:** ADR-052
- **Title:** Retry Policy
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

Transient failures are the norm for distributed calls.

## Problem Statement

Standardise retry behaviour.

## Decision

All outbound calls and consumer handlers use **exponential backoff with full jitter**, a bounded attempt count, and a dead-letter destination. Non-retryable errors short-circuit immediately.

## Alternatives Considered

Fixed-delay retries; unbounded retries; no retries.

## Trade-offs

Latency variance on failure vs. improved success rate and load fairness.

## Consequences

The Integration Engine provides retry as a service; hand-rolled retries in modules are forbidden.

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

A downstream ecosystem standardises on a different backoff scheme.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
