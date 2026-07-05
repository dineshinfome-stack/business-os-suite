---
title: "ADR-072: Module Boundaries"
summary: "Proposed ADR: Module Boundaries."
adr_id: "ADR-072"
status: "Proposed"
owner: "Platform"
category: "Engineering"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/domain-driven-design.md", "docs/03-design/coding-standards.md"]
related_engines: ["ENG-001..ENG-028"]
affected_documents: ["docs/02-architecture/domain-driven-design.md", "docs/03-design/coding-standards.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "engineering"]
document_type: "Architecture Decision Record"
---

# ADR-072: Module Boundaries

## Metadata

- **ADR ID:** ADR-072
- **Title:** Module Boundaries
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Engineering
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/domain-driven-design.md`, `docs/03-design/coding-standards.md`
- **Affected Documents:** `docs/02-architecture/domain-driven-design.md`, `docs/03-design/coding-standards.md`
- **Related ERP Core Engines:** ENG-001..ENG-028
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Inside a modular monolith, only enforced boundaries prevent entanglement.

## Problem Statement

Enforce module boundaries structurally.

## Decision

Modules expose a **public package** (types, ports, events). Cross-module imports outside that package are forbidden and enforced by a dependency linter. Shared code lives in platform engines or explicitly shared kernels.

## Alternatives Considered

Convention-only boundaries; free imports.

## Trade-offs

Some friction on cross-module refactors vs. real boundaries.

## Consequences

The dependency linter is part of CI.

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
