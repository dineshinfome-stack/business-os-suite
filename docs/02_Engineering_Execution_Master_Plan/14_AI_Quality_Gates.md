---
document: EEMP Chapter 14 — AI Quality Gates
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2026-10-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 14 — AI Quality Gates

> Orchestration only. Quality is enforced by Governance and Architecture standards; this chapter defines the review checkpoints (R-19, R-20).

## Lifecycle Note *(Normative)*

Reviewed on a **quarterly cadence** while following handbook versioning and approval (R-08, R-11).

## Purpose *(Normative)*

Define the mandatory quality gates for AI-assisted work, mapped to the six required controls.

## Scope *(Normative)*

Every AI-assisted change entering the repository, whether human-guided or agent-driven.

## Audience *(Informative)*

Reviewers · Security · QA · AI collaborators · Sprint leads.

## Responsibilities *(Normative)*

- Reviewers verify every gate before approving an AI-assisted change.
- Security enforces gates 4 and 6 for sensitive changes.
- Chapter owner keeps gate mappings aligned with governance updates.

## The Six Required Controls *(Normative)*

Each control is a mandatory gate. Failure blocks merge.

| # | Control | Gate Question | Source of Truth |
|---|---|---|---|
| 1 | **Prompt Validation** | Does the prompt match the approved structure (Ch. 13.1)? Is it versioned and approved? | Ch. 13, prompt registry |
| 2 | **Tool-Invocation Validation** | Are all tool calls in the permitted set with valid arguments? Are independent calls parallelized? | `docs/09-ai/tool-calling.md`, Ch. 13.3 |
| 3 | **Context-Window Management** | Was the necessary context loaded before authoring? Were files re-read after edits when needed? | Ch. 03, Ch. 09; discovery discipline (R-04, R-18) |
| 4 | **Hallucination Mitigation** | Every material claim cites a verified repository path or approved source; unknowns marked `Reference not found — verify with owner`. | R-05, R-21, `docs/09-ai/ai-guardrails.md` |
| 5 | **Traceability** | Change references its Sprint PRD, module, ADRs, and applicable standards. | R-23, Ch. 09, Ch. 10, Ch. 11 |
| 6 | **Human Approval Gates** | Destructive or governance-affecting changes have explicit human approval before execution. | Ch. 02 R-08, phase-gated workflow |

## Consumption Guidance *(Normative)*

- Reviewers use the six controls as a checklist on every AI-assisted PR.
- Sprint audit reports include a Compliance Verification block covering these controls.
- Findings from failed gates are classified per `FINDING_SEVERITY_STANDARD.md`.

## Dependencies *(Informative)*

- Chapters 02, 03, 08, 09, 10, 11, 12, 13, 15.

## Related Documents *(Informative)*

- [12_AI_Development_Playbook](12_AI_Development_Playbook.md), [13_AI_Prompt_Standards](13_AI_Prompt_Standards.md), [15_Testing_Strategy](15_Testing_Strategy.md)

## Cross References *(Informative)*

- **Referenced Standards:** AI_PLATFORM_LAYER_STANDARD, PLATFORM_OBSERVABILITY_STANDARD, PLATFORM_TESTING_STANDARD, FINDING_SEVERITY_STANDARD, ARCHITECTURE_REVIEW_GATE_STANDARD
- **Referenced ADRs:** ADR-0008
- **Referenced Modules:** All
- **Referenced Sprint PRDs:** All AI-assisted sprints
- **Referenced Solution Designs:** All (gates apply universally)

## Open Questions

- Automation surface for gates 1–2 (script vs. manual checklist) — deferred to Phase 4.

## Approval Status

Draft — pending Architecture Board + Security Review sign-off.

## Evidence

```
Source:             docs/09-ai/ai-guardrails.md, tool-calling.md
Authority:          Delivery corpus
Reference:          Guardrails and tool contract
Applicable Modules: All
Confidence:         Medium
```

```
Source:             docs/15-governance/FINDING_SEVERITY_STANDARD.md, ARCHITECTURE_REVIEW_GATE_STANDARD.md, PLATFORM_TESTING_STANDARD.md
Authority:          Governance Standards
Reference:          Finding classification and gate approval
Applicable Modules: All
Confidence:         High
```

```
Source:             EEMP Ch. 02, 13
Authority:          EEMP Governance
Reference:          R-05, R-08, R-18, R-21, R-23
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Discovery order followed as required by R-18.
- No new authoritative sources introduced; all six controls map to existing standards or EEMP rules.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---|---|---|---|---|---|---|
| 14 AI Quality Gates | AI_PLATFORM_LAYER, PLATFORM_OBSERVABILITY, PLATFORM_TESTING, FINDING_SEVERITY, ARCHITECTURE_REVIEW_GATE | ADR-0008 | All | All | All | All AI-assisted sprints |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — six mandatory AI quality gates. |
