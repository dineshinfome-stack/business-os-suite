---
title: "ADR-001: Modular Monolith"
summary: "Accepted ADR: Modular Monolith."
adr_id: "ADR-001"
status: "Accepted"
owner: "Platform"
category: "Architecture"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/master-architecture.md", "docs/02-architecture/domain-driven-design.md", "docs/10-erp-core/README.md"]
related_engines: ["ENG-001..ENG-028"]
affected_documents: ["docs/02-architecture/master-architecture.md", "docs/02-architecture/domain-driven-design.md", "docs/10-erp-core/README.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "architecture"]
document_type: "Architecture Decision Record"
---

# ADR-001: Modular Monolith

## Metadata

- **ADR ID:** ADR-001
- **Title:** Modular Monolith
- **Status:** Accepted
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Architecture
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/master-architecture.md`, `docs/02-architecture/domain-driven-design.md`, `docs/10-erp-core/README.md`
- **Affected Documents:** `docs/02-architecture/master-architecture.md`, `docs/02-architecture/domain-driven-design.md`, `docs/10-erp-core/README.md`
- **Related ERP Core Engines:** ENG-001..ENG-028
- **Related Module PRDs:** TBD (Pass 7+)

## Context

BusinessOS must serve dozens of ERP domains for multi-tenant SMB and mid-market customers on a small operations team. Distributed microservices at day one would multiply operational cost, cross-cutting change latency, and integration complexity before product-market fit is proven.

## Problem Statement

Choose a runtime deployment topology that maximises delivery velocity and change safety across many domains without foreclosing future decomposition.

## Decision

BusinessOS is built as a **modular monolith**: one deployable process per environment, internally partitioned into bounded contexts with explicit module boundaries, communicating in-process via typed interfaces and asynchronously via the Event Bus. Any future service extraction MUST first be preceded by a superseding ADR.

## Alternatives Considered

Microservices from day one; service-per-domain; serverless-per-endpoint.

## Trade-offs

Faster refactors and cross-cutting changes; simpler local dev, testing, and observability; some scale-out limits and a discipline burden on module boundaries.

## Consequences

All engines are packaged in one runtime; boundaries are enforced by Dependency Rules, not network calls; horizontal scale is by process replication.

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

A single tenant crosses the load ceiling of one process, or a domain has an independent scale/isolation requirement that the monolith cannot meet.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
