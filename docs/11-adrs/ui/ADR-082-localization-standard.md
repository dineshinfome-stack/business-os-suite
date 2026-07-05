---
title: "ADR-082: Localization Standard"
summary: "Proposed ADR: Localization Standard."
adr_id: "ADR-082"
status: "Proposed"
owner: "Platform"
category: "UI"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/03-design/ui-ux-design-system.md", "docs/14-localization/global.md", "docs/10-erp-core/foundation/localization-engine.md"]
related_engines: ["ENG-006"]
affected_documents: ["docs/03-design/ui-ux-design-system.md", "docs/14-localization/global.md", "docs/10-erp-core/foundation/localization-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "ui"]
document_type: "Architecture Decision Record"
---

# ADR-082: Localization Standard

## Metadata

- **ADR ID:** ADR-082
- **Title:** Localization Standard
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** UI
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/03-design/ui-ux-design-system.md`, `docs/14-localization/global.md`, `docs/10-erp-core/foundation/localization-engine.md`
- **Affected Documents:** `docs/03-design/ui-ux-design-system.md`, `docs/14-localization/global.md`, `docs/10-erp-core/foundation/localization-engine.md`
- **Related ERP Core Engines:** ENG-006
- **Related Module PRDs:** TBD (Pass 7+)

## Context

The platform ships to India and GCC, with more locales planned. Currency, tax terminology, and RTL matter.

## Problem Statement

Set the localization approach.

## Decision

All user-facing strings are externalised and served through the **Localization Engine**. Dates, numbers, currency, and calendars are locale-aware. RTL is a first-class requirement for Arabic locales.

## Alternatives Considered

Hard-coded English; per-module translations.

## Trade-offs

Translation ops overhead vs. serving target markets.

## Consequences

No PR that adds a raw user-facing string passes lint.

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

A new locale requires script or calendar support outside current libraries.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
