---
title: "ADR-005: Clean Architecture"
summary: "Accepted ADR: Clean Architecture."
adr_id: "ADR-005"
status: "Accepted"
owner: "Platform"
category: "Architecture"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/03-design/coding-standards.md", "docs/02-architecture/master-architecture.md"]
related_engines: ["ENG-001..ENG-028"]
affected_documents: ["docs/03-design/coding-standards.md", "docs/02-architecture/master-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "architecture"]
document_type: "Architecture Decision Record"
---

# ADR-005: Clean Architecture

## Metadata

- **ADR ID:** ADR-005
- **Title:** Clean Architecture
- **Status:** Accepted
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Architecture
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/03-design/coding-standards.md`, `docs/02-architecture/master-architecture.md`
- **Affected Documents:** `docs/03-design/coding-standards.md`, `docs/02-architecture/master-architecture.md`
- **Related ERP Core Engines:** ENG-001..ENG-028
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Long-lived ERP code must survive framework churn and vendor changes without rewriting business logic.

## Problem Statement

Determine how dependencies flow inside each module.

## Decision

Every module follows **Clean Architecture** layering: Domain → Application → Interface Adapters → Infrastructure. Dependencies point inward. Frameworks, databases, and vendors are plugged in at the outermost layer.

## Alternatives Considered

Framework-first structure; DAO-only layering; hexagonal-only without concentric enforcement.

## Trade-offs

Requires up-front layering discipline; enables replaceable infrastructure and testable domain logic.

## Consequences

Domain code has no framework imports; Infrastructure implements ports defined by Application; unit tests exercise the Domain without a database.

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
