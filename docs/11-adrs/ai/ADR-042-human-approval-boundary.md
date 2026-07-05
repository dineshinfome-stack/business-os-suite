---
title: "ADR-042: Human Approval Boundary"
summary: "Proposed ADR: Human Approval Boundary."
adr_id: "ADR-042"
status: "Proposed"
owner: "Platform"
category: "AI"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/09-ai/ai-guardrails.md", "docs/10-erp-core/workflow/approval-engine.md"]
related_engines: ["ENG-028", "ENG-011"]
affected_documents: ["docs/09-ai/ai-guardrails.md", "docs/10-erp-core/workflow/approval-engine.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "ai"]
document_type: "Architecture Decision Record"
---

# ADR-042: Human Approval Boundary

## Metadata

- **ADR ID:** ADR-042
- **Title:** Human Approval Boundary
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** AI
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/09-ai/ai-guardrails.md`, `docs/10-erp-core/workflow/approval-engine.md`
- **Affected Documents:** `docs/09-ai/ai-guardrails.md`, `docs/10-erp-core/workflow/approval-engine.md`
- **Related ERP Core Engines:** ENG-028, ENG-011
- **Related Module PRDs:** TBD (Pass 7+)

## Context

Autonomous AI writes must not bypass business controls.

## Problem Statement

Decide when AI actions require human approval.

## Decision

Any AI-initiated action that mutates financial state, sends external communication, or affects auditable records **requires human approval** by default, routed through the Approval Engine. Configuration can raise or lower the bar per tenant, never below regulatory minima.

## Alternatives Considered

AI can execute all actions autonomously; AI can never execute any actions.

## Trade-offs

Some friction in copilot flows vs. protected business state.

## Consequences

Copilot surfaces show a diff and approval action for guarded operations.

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

A new class of AI action requires a distinct approval policy.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
