---
document: EEMP Checklist — AI Prompt Review
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# AI Prompt Review Checklist

Scoped to **engineering prompts** only. Business/application prompts follow `docs/09-ai/prompt-library.md`.

## Required Inputs
- Prompt drafted using `../templates/prompts/engineering-prompt.md`
- Target model and tool set identified

## Checks
- [ ] Structural compliance (Ch. 13)
- [ ] Six AI quality gates satisfied (Ch. 14)
- [ ] Tool invocations validated
- [ ] Context-window budget respected
- [ ] Hallucination mitigation declared
- [ ] Traceability recorded (prompt ID / version)
- [ ] Human approval gate identified

## Exit Criteria
Prompt is APPROVED when every check passes and the reviewer signs the prompt-review template.

## Evidence Required
- Completed `../templates/prompts/prompt-review.md`

## Owner
Prompt Author

## Approval Role
AI Governance Reviewer (per Ch. 18 RACI)

## Related Standards
- EEMP Ch. 13, Ch. 14
- `docs/09-ai/ai-guardrails.md`, `docs/09-ai/tool-calling.md`
