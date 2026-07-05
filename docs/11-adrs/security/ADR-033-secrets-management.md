---
title: "ADR-033: Secrets Management"
summary: "Proposed ADR: Secrets Management."
adr_id: "ADR-033"
status: "Proposed"
owner: "Platform"
category: "Security"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/security-architecture.md", "docs/02-architecture/devops-architecture.md"]
related_engines: []
affected_documents: ["docs/02-architecture/security-architecture.md", "docs/02-architecture/devops-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "security"]
document_type: "Architecture Decision Record"
---

# ADR-033: Secrets Management

## Metadata

- **ADR ID:** ADR-033
- **Title:** Secrets Management
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Security
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/security-architecture.md`, `docs/02-architecture/devops-architecture.md`
- **Affected Documents:** `docs/02-architecture/security-architecture.md`, `docs/02-architecture/devops-architecture.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Secrets (API keys, DB creds, signing keys) must never be committed and must be rotated.

## Problem Statement

Choose the secrets store and access pattern.

## Decision

All secrets live in a **managed secrets store** (cloud provider KMS/Secret Manager) and are injected at runtime. No secrets in code, config files, images, or logs. Rotation is scheduled and auditable.

## Alternatives Considered

Environment variables set in CI only; committed vaults; ad-hoc per-service handling.

## Trade-offs

Provider coupling vs. a single controlled surface.

## Consequences

Application code reads a secret client, never a literal; leaked-secret detection runs in CI.

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

A cross-cloud strategy is adopted.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
