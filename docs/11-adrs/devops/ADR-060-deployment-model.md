---
title: "ADR-060: Deployment Model"
summary: "Proposed ADR: Deployment Model."
adr_id: "ADR-060"
status: "Proposed"
owner: "Platform"
category: "DevOps"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/deployment-architecture.md", "docs/02-architecture/devops-architecture.md"]
related_engines: []
affected_documents: ["docs/02-architecture/deployment-architecture.md", "docs/02-architecture/devops-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "devops"]
document_type: "Architecture Decision Record"
---

# ADR-060: Deployment Model

## Metadata

- **ADR ID:** ADR-060
- **Title:** Deployment Model
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** DevOps
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/deployment-architecture.md`, `docs/02-architecture/devops-architecture.md`
- **Affected Documents:** `docs/02-architecture/deployment-architecture.md`, `docs/02-architecture/devops-architecture.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

The platform must ship frequently and roll back safely.

## Problem Statement

Choose the deployment topology and rollout pattern.

## Decision

BusinessOS deploys as **containers to a managed runtime**, with rolling deploys and immediate rollback capability. Blue/green or canary is used for high-risk releases. Infrastructure is defined as code.

## Alternatives Considered

VM-per-service; ad-hoc deploys; long-lived pets.

## Trade-offs

Container operational surface vs. reproducibility and rollback.

## Consequences

Every deploy is reproducible from git SHA + config; rollback is a first-class action.

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

A more suitable runtime (e.g. edge-only) becomes strategic.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
