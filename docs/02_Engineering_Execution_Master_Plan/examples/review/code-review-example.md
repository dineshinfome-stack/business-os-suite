---
document: EEMP Example — Code Review
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

> **Illustrative only. Not an authoritative engineering standard. Cites the standard it demonstrates.**

# Code Review Example

Shows the checklist in `../../checklists/code-review.md` applied to a hypothetical PR that adds a server function.

## Sample Findings
- **Finding 1 (Medium):** Missing input validator on `createServerFn` handler — violates Ch. 06.
- **Finding 2 (Low):** Missing observability span — violates Ch. 16 baseline.
- **Finding 3 (Info):** Doc frontmatter not updated — violates Ch. 17.

Each finding cites the standard and severity per `FINDING_SEVERITY_STANDARD.md`.

## Non-Authority Notice
Illustration only. Authoritative rules live in Ch. 04, Ch. 06, Ch. 08, Ch. 15, Ch. 16, Ch. 17.
