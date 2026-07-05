---
title: "ADR-034: Encryption Policy"
summary: "Proposed ADR: Encryption Policy."
adr_id: "ADR-034"
status: "Proposed"
owner: "Platform"
category: "Security"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/security-architecture.md"]
related_engines: []
affected_documents: ["docs/02-architecture/security-architecture.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "security"]
document_type: "Architecture Decision Record"
---

# ADR-034: Encryption Policy

## Metadata

- **ADR ID:** ADR-034
- **Title:** Encryption Policy
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Security
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/security-architecture.md`
- **Affected Documents:** `docs/02-architecture/security-architecture.md`
- **Related ERP Core Engines:** —
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Sensitive data must be protected at rest and in transit; keys must be manageable.

## Problem Statement

Define encryption baselines.

## Decision

**TLS 1.2+** is required for all network traffic. Data at rest uses provider-managed disk encryption plus column-level encryption for classified fields (PII, financial credentials). Keys are managed by KMS with per-tenant key hierarchies for BYOK-ready tenants.

## Alternatives Considered

TLS only, no at-rest encryption of classified fields; application-managed keys.

## Trade-offs

Some latency and integration cost vs. defense-in-depth.

## Consequences

Data Classification (ADR-035) drives which columns are encrypted; the Audit Engine records key usage.

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

Post-quantum guidance materially changes recommended algorithms.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
