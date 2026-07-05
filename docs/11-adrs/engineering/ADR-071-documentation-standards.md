---
title: "ADR-071: Documentation Standards"
summary: "Proposed ADR: Documentation Standards."
adr_id: "ADR-071"
status: "Proposed"
owner: "Platform"
category: "Engineering"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/canon.md", "docs/governance.md"]
related_engines: []
affected_documents: ["docs/canon.md", "docs/governance.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "engineering"]
document_type: "Architecture Decision Record"
---

# ADR-071: Documentation Standards

## Metadata

- **ADR ID:** ADR-071
- **Title:** Documentation Standards
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Engineering
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/canon.md`, `docs/governance.md`
- **Affected Documents:** `docs/canon.md`, `docs/governance.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Documentation must stay in sync with code, and be discoverable.

## Problem Statement

Standardise how documentation is authored.

## Decision

Docs live in the repo as Markdown with typed frontmatter. Every document declares `owner`, `status`, `updated`, and cross-links. Governance and Canon set the top-level rules. Docs changes flow through the same review as code.

## Alternatives Considered

Wiki-only docs; unlinked PDFs.

## Trade-offs

Discipline vs. authoritative living documentation.

## Consequences

The docs portal is the single reading surface; PRs update docs alongside code.

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
