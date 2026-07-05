---
title: "ADR-044: RAG Architecture"
summary: "Proposed ADR: RAG Architecture."
adr_id: "ADR-044"
status: "Proposed"
owner: "Platform"
category: "AI"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/09-ai/rag.md", "docs/10-erp-core/ai/ai-copilot-engine.md"]
related_engines: ["ENG-028", "ENG-022"]
affected_documents: ["docs/09-ai/rag.md", "docs/10-erp-core/ai/ai-copilot-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "ai"]
document_type: "Architecture Decision Record"
---

# ADR-044: RAG Architecture

## Metadata

- **ADR ID:** ADR-044
- **Title:** RAG Architecture
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** AI
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/09-ai/rag.md`, `docs/10-erp-core/ai/ai-copilot-engine.md`
- **Affected Documents:** `docs/09-ai/rag.md`, `docs/10-erp-core/ai/ai-copilot-engine.md`
- **Related ERP Core Engines:** ENG-028, ENG-022
- **Related Module PRDs:** TBD (Pass 7+)

## Context

The copilot must ground answers in tenant data without leaking across tenants.

## Problem Statement

Define retrieval-augmented generation shape.

## Decision

RAG uses **per-tenant vector indexes** built from indexable content; retrieval is tenant-scoped by construction and passes through Authorization for row-level checks before context assembly.

## Alternatives Considered

Global vector store filtered at query time; keyword-only retrieval.

## Trade-offs

Index maintenance cost vs. isolation guarantees.

## Consequences

No context assembled for a user contains rows they cannot read.

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

A materially better retrieval strategy emerges.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
