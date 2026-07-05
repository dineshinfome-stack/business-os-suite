---
title: "ADR-021: API Versioning"
summary: "Proposed ADR: API Versioning."
adr_id: "ADR-021"
status: "Proposed"
owner: "Platform"
category: "Platform"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/api-architecture.md"]
related_engines: ["ENG-021"]
affected_documents: ["docs/02-architecture/api-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "platform"]
document_type: "Architecture Decision Record"
---

# ADR-021: API Versioning

## Metadata

- **ADR ID:** ADR-021
- **Title:** API Versioning
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Platform
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/api-architecture.md`
- **Affected Documents:** `docs/02-architecture/api-architecture.md`
- **Related ERP Core Engines:** ENG-021
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Public APIs must evolve without breaking integrators.

## Problem Statement

Choose an API versioning scheme.

## Decision

Public APIs use **URL path versioning** (`/v1/…`). Within a major version, only additive, backward-compatible changes are allowed. Breaking changes require a new major version with an announced deprecation window.

## Alternatives Considered

Header versioning; media-type versioning; no versioning.

## Trade-offs

Slightly less elegant than header versioning vs. maximum operator and integrator clarity.

## Consequences

Every endpoint carries `/vN/`; the OpenAPI file per major version is immutable within its lifetime.

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

A partner ecosystem needs finer-grained versioning than the major-version cadence supports.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
