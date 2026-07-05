---
title: "ADR-036: Audit Integrity"
summary: "Proposed ADR: Audit Integrity."
adr_id: "ADR-036"
status: "Proposed"
owner: "Platform"
category: "Security"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/10-erp-core/foundation/audit-engine.md"]
related_engines: ["ENG-004"]
affected_documents: ["docs/10-erp-core/foundation/audit-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "security"]
document_type: "Architecture Decision Record"
---

# ADR-036: Audit Integrity

## Metadata

- **ADR ID:** ADR-036
- **Title:** Audit Integrity
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Security
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/10-erp-core/foundation/audit-engine.md`
- **Affected Documents:** `docs/10-erp-core/foundation/audit-engine.md`
- **Related ERP Core Engines:** ENG-004
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Audit logs are only useful if they can be trusted.

## Problem Statement

Guarantee tamper-evidence for audit records.

## Decision

Audit records are **hash-chained per tenant** and periodically anchored (checksum published to an append-only store). Deletion is impossible via the application path; direct DB tampering breaks the chain and is detected by a scheduled verifier.

## Alternatives Considered

Plain insert-only tables; write-once cloud storage without chaining.

## Trade-offs

Chain verification cost vs. cryptographic tamper evidence.

## Consequences

Verifier is a scheduled job; a broken chain raises a P1 incident.

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

A compliance regime requires external notarisation (e.g. blockchain anchoring).

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
