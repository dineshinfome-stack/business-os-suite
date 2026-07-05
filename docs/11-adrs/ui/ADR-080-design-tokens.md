---
title: "ADR-080: Design Tokens"
summary: "Proposed ADR: Design Tokens."
adr_id: "ADR-080"
status: "Proposed"
owner: "Platform"
category: "UI"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/03-design/ui-ux-design-system.md"]
related_engines: []
affected_documents: ["docs/03-design/ui-ux-design-system.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "ui"]
document_type: "Architecture Decision Record"
---

# ADR-080: Design Tokens

## Metadata

- **ADR ID:** ADR-080
- **Title:** Design Tokens
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** UI
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/03-design/ui-ux-design-system.md`
- **Affected Documents:** `docs/03-design/ui-ux-design-system.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

A consistent UI across many modules requires shared visual primitives.

## Problem Statement

Standardise the design token system.

## Decision

The UI is themed exclusively via **semantic design tokens** (colour, spacing, typography, radius, shadow) declared in the design system. Components consume tokens; no raw hex or ad-hoc values in components. Dark mode and tenant theming derive from token overrides.

## Alternatives Considered

Per-page styling; hex values sprinkled through components.

## Trade-offs

Discipline for developers vs. coherent product and easy re-skinning.

## Consequences

Design system components enforce token usage; lint blocks raw colours.

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
