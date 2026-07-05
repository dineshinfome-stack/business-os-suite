---
title: "ADR-024: Webhook Delivery"
summary: "Proposed ADR: Webhook Delivery."
adr_id: "ADR-024"
status: "Proposed"
owner: "Platform"
category: "Platform"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/integration-architecture.md", "docs/10-erp-core/integration/integration-engine.md"]
related_engines: ["ENG-025", "ENG-026"]
affected_documents: ["docs/02-architecture/integration-architecture.md", "docs/10-erp-core/integration/integration-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "platform"]
document_type: "Architecture Decision Record"
---

# ADR-024: Webhook Delivery

## Metadata

- **ADR ID:** ADR-024
- **Title:** Webhook Delivery
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Platform
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/integration-architecture.md`, `docs/10-erp-core/integration/integration-engine.md`
- **Affected Documents:** `docs/02-architecture/integration-architecture.md`, `docs/10-erp-core/integration/integration-engine.md`
- **Related ERP Core Engines:** ENG-025, ENG-026
- **Related Module PRDs:** TBD (Pass 7+)

## Context

External systems subscribe to platform events; delivery must be reliable and tamper-evident.

## Problem Statement

Define webhook mechanics.

## Decision

Webhooks are delivered from the Integration Engine with **HMAC-signed payloads**, at-least-once semantics, exponential backoff, and a dead-letter queue. Consumers verify signature and `event_id` for idempotency.

## Alternatives Considered

Unsigned webhooks; polling-only; per-integration bespoke retry.

## Trade-offs

Consumers must be idempotent vs. a single reliable outbound surface.

## Consequences

All outbound event delivery uses this pipeline; a public verification guide accompanies the docs.

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

A regulator requires mutual TLS or per-tenant signing keys.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
