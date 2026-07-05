---
title: "ADR-014: Audit Strategy"
summary: "Accepted ADR: Audit Strategy."
adr_id: "ADR-014"
status: "Accepted"
owner: "Platform"
category: "Data"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/security-architecture.md", "docs/10-erp-core/foundation/audit-engine.md"]
related_engines: ["ENG-004"]
affected_documents: ["docs/02-architecture/security-architecture.md", "docs/10-erp-core/foundation/audit-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "data"]
document_type: "Architecture Decision Record"
---

# ADR-014: Audit Strategy

## Metadata

- **ADR ID:** ADR-014
- **Title:** Audit Strategy
- **Status:** Accepted
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Data
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/security-architecture.md`, `docs/10-erp-core/foundation/audit-engine.md`
- **Affected Documents:** `docs/02-architecture/security-architecture.md`, `docs/10-erp-core/foundation/audit-engine.md`
- **Related ERP Core Engines:** ENG-004
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Regulatory and forensic needs require who/what/when/why for every mutation.

## Problem Statement

Choose a uniform audit approach.

## Decision

The **Audit Engine** captures immutable, append-only audit records for every write via a shared middleware. Records are hash-chained per tenant to detect tampering. Audit is a platform capability, not a per-module concern.

## Alternatives Considered

Trigger-based audit per table; ad-hoc per-module audit; no audit.

## Trade-offs

Central control and consistent format vs. a mandatory write path.

## Consequences

Every mutating command flows through the Audit Engine; direct DB writes bypass this and are forbidden outside migrations.

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
