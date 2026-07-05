---
title: "ADR-041: Tool Calling Contract"
summary: "Proposed ADR: Tool Calling Contract."
adr_id: "ADR-041"
status: "Proposed"
owner: "Platform"
category: "AI"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/09-ai/tool-calling.md", "docs/10-erp-core/ai/ai-copilot-engine.md"]
related_engines: ["ENG-028"]
affected_documents: ["docs/09-ai/tool-calling.md", "docs/10-erp-core/ai/ai-copilot-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "ai"]
document_type: "Architecture Decision Record"
---

# ADR-041: Tool Calling Contract

## Metadata

- **ADR ID:** ADR-041
- **Title:** Tool Calling Contract
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** AI
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/09-ai/tool-calling.md`, `docs/10-erp-core/ai/ai-copilot-engine.md`
- **Affected Documents:** `docs/09-ai/tool-calling.md`, `docs/10-erp-core/ai/ai-copilot-engine.md`
- **Related ERP Core Engines:** ENG-028
- **Related Module PRDs:** TBD (Pass 7+)

## Context

The AI Copilot must execute business actions safely.

## Problem Statement

Define how AI tools are declared, authorised, and invoked.

## Decision

AI tools are declared as **typed capabilities** with input/output schemas generated from OpenAPI, authorised through the Authorization Engine as the invoking user (never a super-user), and every invocation is audited.

## Alternatives Considered

Free-form function calling; hard-coded per-model tool lists; direct DB access.

## Trade-offs

Requires disciplined schema generation vs. safe, auditable AI actions.

## Consequences

Every tool has a permission requirement; unauthorised invocations fail closed.

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

A model class no longer supports typed tool calling.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
