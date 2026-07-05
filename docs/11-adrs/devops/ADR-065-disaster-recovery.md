---
title: "ADR-065: Disaster Recovery"
summary: "Proposed ADR: Disaster Recovery."
adr_id: "ADR-065"
status: "Proposed"
owner: "Platform"
category: "DevOps"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/deployment-architecture.md"]
related_engines: []
affected_documents: ["docs/02-architecture/deployment-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "devops"]
document_type: "Architecture Decision Record"
---

# ADR-065: Disaster Recovery

## Metadata

- **ADR ID:** ADR-065
- **Title:** Disaster Recovery
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** DevOps
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/deployment-architecture.md`
- **Affected Documents:** `docs/02-architecture/deployment-architecture.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Tenants must survive infrastructure loss.

## Problem Statement

Set RPO/RTO targets and the DR approach.

## Decision

**RPO ≤ 15 min, RTO ≤ 4 h** for production. Backups are cross-region; restore is exercised at least quarterly against a DR environment. Runbooks are versioned with the code.

## Alternatives Considered

Best-effort backups; single-region only; annual drills.

## Trade-offs

Ongoing DR spend vs. survivable service.

## Consequences

A restore drill result gates the release train quarterly.

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

Contractual SLAs tighten RPO/RTO beyond current targets.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
