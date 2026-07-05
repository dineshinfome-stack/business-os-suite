---
title: "ADR-081: Accessibility Standard"
summary: "Proposed ADR: Accessibility Standard."
adr_id: "ADR-081"
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

# ADR-081: Accessibility Standard

## Metadata

- **ADR ID:** ADR-081
- **Title:** Accessibility Standard
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

The ERP is used by operators for whole workdays; accessibility is table stakes.

## Problem Statement

Set the accessibility target.

## Decision

The UI conforms to **WCAG 2.2 AA**. New components include accessibility acceptance criteria; automated axe checks run in CI on every design-system component.

## Alternatives Considered

Ad-hoc accessibility; WCAG A only.

## Trade-offs

More design and test work vs. inclusive product and reduced legal risk.

## Consequences

Every design-system component has documented keyboard and screen-reader behaviour.

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

A stricter accessibility level (AAA) becomes contractual.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
