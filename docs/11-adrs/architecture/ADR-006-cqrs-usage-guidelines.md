---
title: "ADR-006: CQRS Usage Guidelines"
summary: "Proposed ADR: CQRS Usage Guidelines."
adr_id: "ADR-006"
status: "Proposed"
owner: "Platform"
category: "Architecture"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/master-architecture.md", "docs/10-erp-core/intelligence/reporting-engine.md"]
related_engines: ["ENG-022", "ENG-023", "ENG-024"]
affected_documents: ["docs/02-architecture/master-architecture.md", "docs/10-erp-core/intelligence/reporting-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "architecture"]
document_type: "Architecture Decision Record"
---

# ADR-006: CQRS Usage Guidelines

## Metadata

- **ADR ID:** ADR-006
- **Title:** CQRS Usage Guidelines
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Architecture
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/master-architecture.md`, `docs/10-erp-core/intelligence/reporting-engine.md`
- **Affected Documents:** `docs/02-architecture/master-architecture.md`, `docs/10-erp-core/intelligence/reporting-engine.md`
- **Related ERP Core Engines:** ENG-022, ENG-023, ENG-024
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Reads and writes in an ERP have very different shapes: transactional writes need invariants; reads span many entities and demand tuned projections.

## Problem Statement

Decide when to separate command and query models.

## Decision

**CQRS is applied selectively**: transactional writes go through aggregate command handlers; heavy read models (dashboards, reports, search) use dedicated read projections maintained via the Event Bus. Full CQRS is not mandated for every module.

## Alternatives Considered

CQRS everywhere; single model for reads and writes always.

## Trade-offs

Additional projection maintenance vs. much better read performance and clearer boundaries where it matters.

## Consequences

Reporting and Dashboard engines rely on read projections; simple CRUD modules keep a single model.

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

A read model becomes a persistent bottleneck or a projection consistency gap harms UX.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
