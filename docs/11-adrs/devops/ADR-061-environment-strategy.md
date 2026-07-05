---
title: "ADR-061: Environment Strategy"
summary: "Proposed ADR: Environment Strategy."
adr_id: "ADR-061"
status: "Proposed"
owner: "Platform"
category: "DevOps"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/devops-architecture.md"]
related_engines: []
affected_documents: ["docs/02-architecture/devops-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "devops"]
document_type: "Architecture Decision Record"
---

# ADR-061: Environment Strategy

## Metadata

- **ADR ID:** ADR-061
- **Title:** Environment Strategy
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** DevOps
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/devops-architecture.md`
- **Affected Documents:** `docs/02-architecture/devops-architecture.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Multiple environments are needed for safe change.

## Problem Statement

Define the environment set and their guarantees.

## Decision

Four environments: **local · preview · staging · production**. Preview is created per pull request; staging mirrors production topology; production is the only environment with real tenant data.

## Alternatives Considered

Only dev/prod; ad-hoc preview environments; shared long-lived integration environment.

## Trade-offs

Preview cost vs. safe change.

## Consequences

Migrations run in staging before production on every release.

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
