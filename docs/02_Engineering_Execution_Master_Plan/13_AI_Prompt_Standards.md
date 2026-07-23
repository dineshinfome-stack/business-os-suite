---
document: EEMP Chapter 13 — AI Prompt Standards
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2026-10-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 13 — AI Prompt Standards

> **Scope boundary.** This chapter governs **engineering prompt governance** — how prompts used inside the engineering workflow are structured, evidenced, reviewed, versioned, and approved. It is **not** a repository of business/application prompts (those live in `docs/09-ai/prompt-library.md` and per-module Solution Designs).

## Lifecycle Note *(Normative)*

Prompt patterns evolve quickly. Reviewed on a **quarterly cadence** while following handbook versioning and approval (R-08, R-11).

## Purpose *(Normative)*

Define governance for engineering prompts: structure, evidence, tool-calling conventions, safety, review process, versioning, and approval.

## Scope *(Normative)*

Every prompt used by an AI collaborator to author, review, or modify Business OS artifacts (code, docs, migrations, tests). Explicitly excludes application-level prompts served to end users.

## Audience *(Informative)*

AI collaborators · Prompt authors · Reviewers · Security · QA.

## Responsibilities *(Normative)*

- Prompt authors follow the structure below.
- Reviewers reject any prompt lacking evidence or the required safety clauses.
- Chapter owner curates the shared prompt registry and its versions.

## Consumption Guidance *(Normative)*

### 13.1 Prompt Structure

Every engineering prompt carries:

- **Role** — who the AI is acting as.
- **Task** — the deliverable in one sentence.
- **Context** — links to authoritative documents (never inlined restatements).
- **Constraints** — repository-safety and governance rules the AI must obey.
- **Evidence Requirement** — the prompt requires cited sources for every material claim.
- **Tool-Calling Contract** — permitted tools, argument shapes, and parallelism rules.
- **Stop Rule** — explicit end condition (phase gate, approval wait, or handoff).

### 13.2 Evidence Requirements

- Every material claim in a prompt output cites a repository path or an approved external source.
- Prompts must forbid fabrication (`Reference not found — verify with owner` when a source is missing).
- Confidence values follow R-21.

### 13.3 Tool-Calling Conventions

- Reference the authoritative `docs/09-ai/tool-calling.md`; do not restate it.
- Prompts declare which tools are permitted and require parallel calls for independent operations.
- Destructive operations (writes, deletes, schema changes) require explicit user or gate approval.

### 13.4 Safety

- No secrets in prompts or outputs.
- No exfiltration of PII beyond scoped need.
- Guardrails per `docs/09-ai/ai-guardrails.md` apply to any prompt output shipped to users.

### 13.5 Review Process

- Prompts are reviewed like code: two-reviewer minimum for prompts affecting production.
- Prompts touching security, tenancy, or RBAC require Security review.

### 13.6 Versioning

- Prompts are stored with SemVer.
- MAJOR = behavior change; MINOR = additive; PATCH = editorial.
- Prompt registry is versioned alongside chapter versioning (R-11).

### 13.7 Approval

- Draft → Under Review → Approved → Deprecated (R-08).
- Approval authority: Architecture Board (default); Security Review for security-scoped prompts.

## Dependencies *(Informative)*

- Chapters 02, 12, 14.

## Related Documents *(Informative)*

- [12_AI_Development_Playbook](12_AI_Development_Playbook.md), [14_AI_Quality_Gates](14_AI_Quality_Gates.md)

## Cross References *(Informative)*

- **Referenced Standards:** AI_PLATFORM_LAYER_STANDARD, PLATFORM_OBSERVABILITY_STANDARD, FINDING_SEVERITY_STANDARD
- **Referenced ADRs:** ADR-0008
- **Referenced Modules:** All AI-collaborator-authored modules
- **Referenced Sprint PRDs:** All AI-assisted sprints
- **Referenced Solution Designs:** N/A (governance of engineering prompts)

## Open Questions

- Location for the engineering prompt registry (candidate: `docs/02_Engineering_Execution_Master_Plan/templates/prompt-library/`, deferred to Phase 4).

## Approval Status

Draft — pending Architecture Board sign-off.

## Evidence

```
Source:             docs/09-ai/prompt-library.md, tool-calling.md, ai-guardrails.md
Authority:          Delivery corpus
Reference:          Prompt patterns, tool-calling contract, guardrails
Applicable Modules: All
Confidence:         Medium
```

```
Source:             docs/05-adr/ADR-0008-ai-copilot-pattern.md
Authority:          ADR
Reference:          AI collaborator pattern
Applicable Modules: All
Confidence:         High
```

```
Source:             EEMP Ch. 02 (R-01…R-23)
Authority:          EEMP Governance
Reference:          Evidence, discovery, versioning, approval
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Discovery order followed as required by R-18.
- Application prompts explicitly out of scope.
- No duplicate standards detected in engineering prompt scope.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---|---|---|---|---|---|---|
| 13 AI Prompt Standards | AI_PLATFORM_LAYER, PLATFORM_OBSERVABILITY, FINDING_SEVERITY | ADR-0008 | All (engineering prompts apply universally) | N/A | All | All AI-assisted sprints |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — engineering prompt governance. |
