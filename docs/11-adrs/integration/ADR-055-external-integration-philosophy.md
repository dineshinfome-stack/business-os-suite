---
title: "ADR-055: External Integration Philosophy"
summary: "Proposed ADR: External Integration Philosophy."
adr_id: "ADR-055"
status: "Proposed"
owner: "Platform"
category: "Integration"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/integration-architecture.md", "docs/10-erp-core/integration/integration-engine.md"]
related_engines: ["ENG-026"]
affected_documents: ["docs/02-architecture/integration-architecture.md", "docs/10-erp-core/integration/integration-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "integration"]
document_type: "Architecture Decision Record"
---

# ADR-055: External Integration Philosophy

## Metadata

- **ADR ID:** ADR-055
- **Title:** External Integration Philosophy
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** Integration
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/integration-architecture.md`, `docs/10-erp-core/integration/integration-engine.md`
- **Affected Documents:** `docs/02-architecture/integration-architecture.md`, `docs/10-erp-core/integration/integration-engine.md`
- **Related ERP Core Engines:** ENG-026
- **Related Module PRDs:** TBD (Pass 7+)

## Context

The platform will integrate with many external systems (tax authorities, payment gateways, messaging).

## Problem Statement

Set the ground rules for external integration.

## Decision

External systems are integrated via **anti-corruption adapters** inside the Integration Engine; internal models are never bent to match a vendor. Failures are isolated; each integration owns its retry, circuit breaker, and DLQ.

## Alternatives Considered

Direct vendor SDK usage in domain code; leaking vendor DTOs across the boundary.

## Trade-offs

Adapter maintenance cost vs. clean internal model.

## Consequences

Adding an integration is a bounded, template-driven task.

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
