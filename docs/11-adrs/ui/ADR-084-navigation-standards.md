---
title: "ADR-084: Navigation Standards"
summary: "Proposed ADR: Navigation Standards."
adr_id: "ADR-084"
status: "Proposed"
owner: "Platform"
category: "UI"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/03-design/ui-ux-design-system.md", "docs/03-design/ux-standards.md"]
related_engines: []
affected_documents: ["docs/03-design/ui-ux-design-system.md", "docs/03-design/ux-standards.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "ui"]
document_type: "Architecture Decision Record"
---

# ADR-084: Navigation Standards

## Metadata

- **ADR ID:** ADR-084
- **Title:** Navigation Standards
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** UI
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/03-design/ui-ux-design-system.md`, `docs/03-design/ux-standards.md`
- **Affected Documents:** `docs/03-design/ui-ux-design-system.md`, `docs/03-design/ux-standards.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Users move across many modules daily; navigation must be predictable.

## Problem Statement

Standardise navigation shape and behaviour.

## Decision

Navigation uses a **stable global structure**: primary module rail, per-module secondary nav, contextual actions bar, and universal search/command palette. Deep links are stable and shareable within RBAC constraints.

## Alternatives Considered

Per-module bespoke navigation; hamburger-only navigation.

## Trade-offs

Less freedom per module vs. predictable UX and lower training cost.

## Consequences

Every module conforms to the navigation layout defined in the design system.

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
