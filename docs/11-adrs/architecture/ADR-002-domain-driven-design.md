---
title: "ADR-002: Domain-Driven Design"
summary: "Accepted ADR: Domain-Driven Design."
adr_id: "ADR-002"
status: "Accepted"
owner: "Platform"
category: "Architecture"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/domain-driven-design.md", "docs/02-architecture/domain-map.md", "docs/10-erp-core/README.md"]
related_engines: ["ENG-001..ENG-028"]
affected_documents: ["docs/02-architecture/domain-driven-design.md", "docs/02-architecture/domain-map.md", "docs/10-erp-core/README.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "architecture"]
document_type: "Architecture Decision Record"
---

# ADR-002: Domain-Driven Design

## Metadata

- **ADR ID:** ADR-002
- **Title:** Domain-Driven Design
- **Status:** Accepted
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Architecture
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/domain-driven-design.md`, `docs/02-architecture/domain-map.md`, `docs/10-erp-core/README.md`
- **Affected Documents:** `docs/02-architecture/domain-driven-design.md`, `docs/02-architecture/domain-map.md`, `docs/10-erp-core/README.md`
- **Related ERP Core Engines:** ENG-001..ENG-028
- **Related Module PRDs:** TBD (Pass 7+)

## Context

The ERP surface is broad (Accounting, Inventory, Sales, HR, …). Without disciplined modelling, terminology collapses, data ownership becomes ambiguous, and modules become entangled.

## Problem Statement

Establish a single modelling discipline that lets many domains evolve independently while sharing platform capabilities.

## Decision

Adopt **Domain-Driven Design** as the modelling method for BusinessOS: bounded contexts own their language and data; aggregates protect invariants; cross-context communication is via published contracts (APIs or events) only. Shared kernel is limited to platform primitives (identity, money, tenancy, audit).

## Alternatives Considered

Anemic CRUD-first models; transaction-script style per module; global shared schema.

## Trade-offs

Higher up-front modelling investment; strict boundaries can require translation layers; but pays back in independent evolution and clear ownership.

## Consequences

Every module has an explicit ubiquitous language, aggregate roots, and context map entries; cross-context calls follow the contracts defined by Architecture and ERP Core Engines.

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
