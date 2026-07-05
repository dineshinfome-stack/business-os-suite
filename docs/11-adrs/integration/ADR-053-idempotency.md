---
title: "ADR-053: Idempotency"
summary: "Proposed ADR: Idempotency."
adr_id: "ADR-053"
status: "Proposed"
owner: "Platform"
category: "Integration"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/api-architecture.md", "docs/02-architecture/integration-architecture.md"]
related_engines: ["ENG-025", "ENG-026", "ENG-021"]
affected_documents: ["docs/02-architecture/api-architecture.md", "docs/02-architecture/integration-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "integration"]
document_type: "Architecture Decision Record"
---

# ADR-053: Idempotency

## Metadata

- **ADR ID:** ADR-053
- **Title:** Idempotency
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Integration
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/api-architecture.md`, `docs/02-architecture/integration-architecture.md`
- **Affected Documents:** `docs/02-architecture/api-architecture.md`, `docs/02-architecture/integration-architecture.md`
- **Related ERP Core Engines:** ENG-025, ENG-026, ENG-021
- **Related Module PRDs:** TBD (Pass 7+)

## Context

At-least-once delivery and client retries create duplicate requests.

## Problem Statement

Guarantee idempotency for write operations.

## Decision

Mutating APIs accept an **`Idempotency-Key`** header; event consumers deduplicate by `event_id`. The Idempotency store persists request fingerprints and responses for a bounded window.

## Alternatives Considered

Trust-the-client; per-endpoint bespoke dedup; no dedup.

## Trade-offs

Storage cost for keys vs. correct behaviour under retry.

## Consequences

SDKs generate idempotency keys automatically for mutating calls.

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

A workload exceeds the practical retention window for the key store.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
