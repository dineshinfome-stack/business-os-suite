---
title: "AI Platform Layer Standard"
summary: "Every AI capability flows through a shared platform layer. Modules never instantiate LLM providers directly."
document_type: "Governance Standard"
layer: "governance"
owner: "AI Platform"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["governance", "ai", "platform-layer", "llm"]
---

# AI Platform Layer Standard

## Purpose

Consolidate all AI capabilities behind a single, governed platform layer so that provider volatility, cost governance, audit, and guardrails are handled once — not per module.

## Layer Architecture

```text
Modules
  │
  ▼
AI Workspace  (MOD-018)
  │
  ▼
Prompt Service ──▶ Document Service ──▶ Knowledge Base ──▶ Embeddings
  │
  ▼
LLM Provider Layer  (single entry point; providers are swappable)
```

## Rules

- Modules MUST call the AI Workspace or a Prompt Service endpoint. They MUST NOT import a provider SDK directly.
- The Provider Layer is the only place that holds provider credentials.
- Every AI call is audited with prompt hash, tool calls, citations, latency, and cost.
- No AI action performs a state change without explicit human approval (Canon Ch. 9).
- Cost governance is enforced at the Provider Layer per ADR-045.

## Anchor ADRs

- ADR-040 AI Provider Abstraction
- ADR-041 Tool Calling Contract
- ADR-042 Human Approval Boundary
- ADR-043 Prompt Governance
- ADR-044 RAG Architecture
- ADR-045 AI Cost Governance

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
