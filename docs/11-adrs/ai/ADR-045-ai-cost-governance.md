---
title: "ADR-045: AI Cost Governance"
summary: "Proposed ADR: AI Cost Governance."
adr_id: "ADR-045"
status: "Proposed"
owner: "Platform"
category: "AI"
created: "2026-07-05"
updated: "2026-07-05"
related_docs: ["docs/09-ai/ai-guardrails.md"]
related_engines: ["ENG-028"]
affected_documents: ["docs/09-ai/ai-guardrails.md"]
supersedes: ""
superseded_by: ""
layer: "platform"
tags: ["adr", "ai"]
document_type: "Architecture Decision Record"
---

# ADR-045: AI Cost Governance

## Metadata

- **ADR ID:** ADR-045
- **Title:** AI Cost Governance
- **Status:** Proposed
- **Date:** 2026-07-05
- **Owner:** Platform
- **Decision Type:** AI
- **Related Canon Chapters:** see `docs/canon.md`
- **Related Architecture Documents:** `docs/09-ai/ai-guardrails.md`
- **Affected Documents:** `docs/09-ai/ai-guardrails.md`
- **Related ERP Core Engines:** ENG-028
- **Related Module PRDs:** TBD (Pass 7+)

## Context

AI usage is a real cost line and can be abused.

## Problem Statement

Contain and observe AI cost.

## Decision

Every AI call carries **tenant, user, feature, and prompt-ID** attribution. Per-tenant quotas and rate limits are enforced by the Copilot; anomalous usage triggers throttling and alerts.

## Alternatives Considered

Unmetered AI usage; global-only quotas.

## Trade-offs

Some overhead per call vs. predictable cost.

## Consequences

AI cost dashboards are a first-class part of Observability.

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

Pricing models change to make current attribution insufficient.

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/10-erp-core/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
