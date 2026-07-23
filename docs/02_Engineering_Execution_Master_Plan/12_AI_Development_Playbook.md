---
document: EEMP Chapter 12 — AI Development Playbook
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2026-10-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 12 — AI Development Playbook

> Orchestration only. AI architecture, guardrails, and platform layers are defined in Governance, Architecture, and the `docs/09-ai/` corpus (R-19, R-20).

## Lifecycle Note *(Normative)*

AI-specific guidance evolves quickly. This chapter is reviewed on a **quarterly cadence** (default) while still following the handbook's versioning and approval workflow (R-08, R-11). `next_review` is set accordingly.

## Purpose *(Normative)*

Direct AI collaborators and engineers to the authoritative AI-platform sources and describe how they are consumed during implementation, review, and release of AI-assisted features.

## Scope *(Normative)*

Every AI collaborator (human-guided or agent-driven) contributing to Business OS, every server function that invokes an AI provider, and every module that ships an AI capability.

## Audience *(Informative)*

AI collaborators · Backend engineers · Product owners · Security review · QA.

## Responsibilities *(Normative)*

- AI collaborators operate under the same governance rules as humans (Ch. 01 principle 4).
- Engineers reference `AI_PLATFORM_LAYER_STANDARD.md` for provider integration; never bypass the sanctioned gateway.
- Reviewers reject AI-assisted changes that lack evidence for prompts, tools, or outputs.

## Inputs *(Informative)*

Verified during Repository Discovery:

- `docs/02-architecture/ai-architecture.md`
- `docs/15-governance/AI_PLATFORM_LAYER_STANDARD.md`
- `docs/09-ai/ai-copilot.md`
- `docs/09-ai/ai-guardrails.md`
- `docs/09-ai/business-advisor.md`
- `docs/09-ai/document-ai.md`
- `docs/09-ai/forecasting.md`
- `docs/09-ai/rag.md`
- `docs/09-ai/tool-calling.md`
- `docs/09-ai/prompt-library.md`
- `docs/05-adr/ADR-0008-ai-copilot-pattern.md`

## Outputs *(Informative)*

- A single pointer surface for AI-assisted development.
- Traceability from AI features to their governing standards.

## Consumption Guidance *(Normative)*

| Concern | Source of Truth | How Engineers Consume |
|---|---|---|
| Provider gateway | `AI_PLATFORM_LAYER_STANDARD.md` | Use the sanctioned gateway; no direct provider calls from modules. |
| Copilot pattern | ADR-0008, `docs/09-ai/ai-copilot.md` | Follow the copilot pattern for interactive assistance. |
| Guardrails | `docs/09-ai/ai-guardrails.md` | Apply guardrails before shipping AI-generated content to users. |
| Tool calling | `docs/09-ai/tool-calling.md` | Register tools; validate every invocation (see Ch. 14). |
| RAG | `docs/09-ai/rag.md` | Follow the retrieval and citation contract. |
| Domain playbooks | `docs/09-ai/business-advisor.md`, `document-ai.md`, `forecasting.md` | Consume as module-specific guidance. |

## Dependencies *(Informative)*

- Chapters 02, 06, 08, 13, 14.

## Related Documents *(Informative)*

- [13_AI_Prompt_Standards](13_AI_Prompt_Standards.md), [14_AI_Quality_Gates](14_AI_Quality_Gates.md), [08_Security_Standards](08_Security_Standards.md)

## Cross References *(Informative)*

- **Referenced Standards:** AI_PLATFORM_LAYER_STANDARD, PLATFORM_OBSERVABILITY_STANDARD, FINDING_SEVERITY_STANDARD
- **Referenced ADRs:** ADR-0008
- **Referenced Modules:** MOD-018 (AI Workspace) + any module shipping AI capability
- **Referenced Sprint PRDs:** All AI-touching sprints
- **Referenced Solution Designs:** WEB-018, MOB-018, API-018 (and per-module AI SDs)

## Open Questions

- None at initial draft.

## Approval Status

Draft — pending Architecture Board + Security Review sign-off.

## Evidence

```
Source:             docs/02-architecture/ai-architecture.md
Authority:          Master Architecture
Reference:          AI platform architecture
Applicable Modules: All AI-shipping modules
Confidence:         High
```

```
Source:             docs/15-governance/AI_PLATFORM_LAYER_STANDARD.md
Authority:          Governance Standards
Reference:          Provider gateway and layering
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/09-ai/ (8 documents)
Authority:          Domain playbooks (Delivery corpus)
Reference:          Copilot, guardrails, RAG, tool-calling, domain playbooks
Applicable Modules: All AI-shipping modules
Confidence:         Medium
```

## Discovery Inventory

- Discovery order followed as required by R-18.
- 8 files under `docs/09-ai/` enumerated and referenced.
- No duplicate standards detected in this scope.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---|---|---|---|---|---|---|
| 12 AI Development | AI_PLATFORM_LAYER, PLATFORM_OBSERVABILITY, FINDING_SEVERITY | ADR-0008 | MOD-018 PRD + AI-touching PRDs | WEB/MOB/API-018 + per-module AI SDs | MOD-018 + AI-shipping modules | All AI-touching sprints |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft. |
