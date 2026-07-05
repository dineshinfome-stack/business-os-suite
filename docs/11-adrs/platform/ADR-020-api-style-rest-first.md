---
title: "ADR-020: API Style: REST-First"
summary: "Proposed ADR: API Style: REST-First."
adr_id: "ADR-020"
status: "Proposed"
owner: "Platform"
category: "Platform"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/api-architecture.md"]
related_engines: ["ENG-021"]
affected_documents: ["docs/02-architecture/api-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "platform"]
document_type: "Architecture Decision Record"
---

# ADR-020: API Style: REST-First

## Metadata

- **ADR ID:** ADR-020
- **Title:** API Style: REST-First
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Platform
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/api-architecture.md`
- **Affected Documents:** `docs/02-architecture/api-architecture.md`
- **Related ERP Core Engines:** ENG-021
- **Related Module PRDs:** TBD (Pass 7+)

## Context

APIs are consumed by web, mobile, partner integrations, and AI tools. Consistency and tooling maturity dominate.

## Problem Statement

Select the primary API style.

## Decision

External APIs are **REST-first**, JSON, resource-oriented, with OpenAPI as the source of truth. GraphQL, gRPC, or streaming are added only where REST is a poor fit and only via ADR.

## Alternatives Considered

GraphQL-first; gRPC-first; RPC over JSON.

## Trade-offs

Widest ecosystem support vs. verbosity for aggregate reads.

## Consequences

Every public endpoint is documented in OpenAPI; SDKs and AI tool schemas are generated from that spec.

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

A major consumer class (e.g. mobile) is materially harmed by REST payloads.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
