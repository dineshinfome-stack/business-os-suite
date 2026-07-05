---
title: "ADR-070: Coding Standards"
summary: "Proposed ADR: Coding Standards."
adr_id: "ADR-070"
status: "Proposed"
owner: "Platform"
category: "Engineering"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/03-design/coding-standards.md"]
related_engines: []
affected_documents: ["docs/03-design/coding-standards.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "engineering"]
document_type: "Architecture Decision Record"
---

# ADR-070: Coding Standards

## Metadata

- **ADR ID:** ADR-070
- **Title:** Coding Standards
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Engineering
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/03-design/coding-standards.md`
- **Affected Documents:** `docs/03-design/coding-standards.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Consistent code is faster to read, review, and modify.

## Problem Statement

Establish coding standards.

## Decision

The Coding Standards document is authoritative. Formatting, linting, typing, and naming rules are enforced by CI. Public APIs are documented; TODO comments carry an owner and a ticket.

## Alternatives Considered

Team-by-team styles; optional linting.

## Trade-offs

Minor churn during onboarding vs. long-term readability.

## Consequences

PRs that fail lint or type checks are auto-blocked.

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

A widely adopted standard supersedes ours.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
