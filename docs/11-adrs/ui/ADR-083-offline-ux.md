---
title: "ADR-083: Offline UX"
summary: "Proposed ADR: Offline UX."
adr_id: "ADR-083"
status: "Proposed"
owner: "Platform"
category: "UI"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/03-design/ux-standards.md", "docs/performance.md"]
related_engines: []
affected_documents: ["docs/03-design/ux-standards.md", "docs/performance.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "ui"]
document_type: "Architecture Decision Record"
---

# ADR-083: Offline UX

## Metadata

- **ADR ID:** ADR-083
- **Title:** Offline UX
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** UI
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/03-design/ux-standards.md`, `docs/performance.md`
- **Affected Documents:** `docs/03-design/ux-standards.md`, `docs/performance.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Field workers (delivery, service) operate on flaky networks.

## Problem Statement

Set the offline UX baseline.

## Decision

The default posture is **online-first with graceful degradation**: read-mostly views tolerate short offline windows; specific field flows (delivery, service visits) provide explicit offline capture with sync-on-reconnect and conflict surfaces.

## Alternatives Considered

Fully offline-first for all modules; strictly online-only.

## Trade-offs

Complexity confined to opted-in flows vs. useful field UX.

## Consequences

Offline-capable flows are declared in Module PRDs.

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

A major offline requirement extends beyond the current opted-in set.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
