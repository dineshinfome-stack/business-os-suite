---
title: "ADR-040: AI Provider Abstraction"
summary: "Proposed ADR: AI Provider Abstraction."
adr_id: "ADR-040"
status: "Proposed"
owner: "Platform"
category: "AI"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/02-architecture/ai-architecture.md", "docs/10-erp-core/ai/ai-copilot-engine.md"]
related_engines: ["ENG-028"]
affected_documents: ["docs/02-architecture/ai-architecture.md", "docs/10-erp-core/ai/ai-copilot-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "ai"]
document_type: "Architecture Decision Record"
---

# ADR-040: AI Provider Abstraction

## Metadata

- **ADR ID:** ADR-040
- **Title:** AI Provider Abstraction
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** AI
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/02-architecture/ai-architecture.md`, `docs/10-erp-core/ai/ai-copilot-engine.md`
- **Affected Documents:** `docs/02-architecture/ai-architecture.md`, `docs/10-erp-core/ai/ai-copilot-engine.md`
- **Related ERP Core Engines:** ENG-028
- **Related Module PRDs:** TBD (Pass 7+)

## Context

AI vendors, models, and prices change frequently; lock-in is a strategic risk.

## Problem Statement

Isolate the platform from any single AI vendor.

## Decision

All AI calls go through an **AI Provider abstraction** owned by the AI Copilot Engine. Prompts, tool schemas, and outputs are provider-agnostic; provider selection is a runtime configuration.

## Alternatives Considered

Direct SDK calls from application code; single-vendor prompts.

## Trade-offs

Some feature-parity friction across providers vs. supplier independence.

## Consequences

Application code never imports a provider SDK directly; provider adapters translate to a shared interface.

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

A single provider dominates capability so decisively that abstraction cost exceeds its benefit.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
