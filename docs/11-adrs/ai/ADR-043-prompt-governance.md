---
title: "ADR-043: Prompt Governance"
summary: "Proposed ADR: Prompt Governance."
adr_id: "ADR-043"
status: "Proposed"
owner: "Platform"
category: "AI"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/09-ai/prompt-library.md"]
related_engines: ["ENG-028"]
affected_documents: ["docs/09-ai/prompt-library.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "ai"]
document_type: "Architecture Decision Record"
---

# ADR-043: Prompt Governance

## Metadata

- **ADR ID:** ADR-043
- **Title:** Prompt Governance
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** AI
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/09-ai/prompt-library.md`
- **Affected Documents:** `docs/09-ai/prompt-library.md`
- **Related ERP Core Engines:** ENG-028
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Prompts materially affect behaviour and must be versioned like code.

## Problem Statement

Manage prompts as first-class artifacts.

## Decision

Prompts live in a **versioned Prompt Library** with metadata (owner, model, evaluation status). Production prompts are pinned; changes go through review and evaluation before rollout.

## Alternatives Considered

Inline strings scattered across code; per-developer prompt tuning in production.

## Trade-offs

Extra tooling vs. reproducibility and safety.

## Consequences

The AI Copilot loads prompts by ID + version; unpinned prompts cannot be used in production.

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

A prompt regression evades evaluation and reaches production.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
