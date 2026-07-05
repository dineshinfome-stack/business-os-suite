---
title: "ADR-073: Dependency Rules"
summary: "Proposed ADR: Dependency Rules."
adr_id: "ADR-073"
status: "Proposed"
owner: "Platform"
category: "Engineering"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/10-erp-core/README.md", "docs/03-design/coding-standards.md"]
related_engines: ["ENG-001..ENG-028"]
affected_documents: ["docs/10-erp-core/README.md", "docs/03-design/coding-standards.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "engineering"]
document_type: "Architecture Decision Record"
---

# ADR-073: Dependency Rules

## Metadata

- **ADR ID:** ADR-073
- **Title:** Dependency Rules
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Engineering
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/10-erp-core/README.md`, `docs/03-design/coding-standards.md`
- **Affected Documents:** `docs/10-erp-core/README.md`, `docs/03-design/coding-standards.md`
- **Related ERP Core Engines:** ENG-001..ENG-028
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Both application modules and engines must respect a clear dependency direction.

## Problem Statement

Codify dependency rules.

## Decision

Dependencies flow **only downward** through the layer order defined in the ERP Core README (Foundation → Document → Workflow → Financial → Intelligence → Integration → Data Exchange → AI). Upward or lateral dependencies require an ADR and either an event-only edge or an explicit engine dependency.

## Alternatives Considered

Free graph; hub-and-spoke.

## Trade-offs

Occasional workaround via events vs. sustainable evolution.

## Consequences

The Engine Catalog and dependency linter both reflect this rule.

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

A structural refactor of engine layers is proposed.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
