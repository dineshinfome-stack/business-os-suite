---
title: "ADR-022: Error Envelope"
summary: "Proposed ADR: Error Envelope."
adr_id: "ADR-022"
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

# ADR-022: Error Envelope

## Metadata

- **ADR ID:** ADR-022
- **Title:** Error Envelope
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

Callers (including AI tools) need a predictable error shape.

## Problem Statement

Standardise API error responses.

## Decision

All errors return a **uniform envelope** conforming to RFC 9457 Problem Details, extended with `code`, `trace_id`, `errors[]`, and `docs_url`. HTTP status codes are used semantically.

## Alternatives Considered

Free-form error strings; per-endpoint error shapes; SOAP-style faults.

## Trade-offs

Slight overhead for trivial errors vs. universal client and AI handling.

## Consequences

SDKs and the AI Copilot rely on this envelope; validation errors are machine-actionable.

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
