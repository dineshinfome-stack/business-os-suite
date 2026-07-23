---
document: EEMP Example — Engineering Prompt
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

> **Illustrative only. Not an authoritative engineering standard. Cites the standard it demonstrates.**

# Engineering Prompt Example

Illustrates the structure required by Ch. 13 and gated by Ch. 14.

## Metadata
- Prompt ID: EP-EXAMPLE-001
- Purpose: Generate a code review summary for a bounded PR diff
- Owner: Platform AI Guild
- Model target: general-purpose reasoning model
- Version: 0.1.0

## Body
"Given the following PR diff, produce a review that flags violations of the referenced coding, security, and testing standards. Cite each finding with file and line."

## Tool Invocations
- `read_file(path)` — allowed, arguments validated
- No write tools permitted

## Evidence Requirements
Every finding must cite (path, line, standard section).

## Safety and Refusal
Refuse to output secrets, credentials, or content unrelated to the diff.

## Non-Authority Notice
Illustration only. Authoritative rules live in Ch. 13, Ch. 14, and `docs/09-ai/**`.
