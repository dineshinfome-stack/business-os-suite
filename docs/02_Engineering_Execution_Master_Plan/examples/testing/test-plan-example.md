---
document: EEMP Example — Test Plan
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

> **Illustrative only. Not an authoritative engineering standard. Cites the standard it demonstrates.**

# Test Plan Example

Illustrates orchestration of the seven testing dimensions from Ch. 15.

| Dimension | Approach | Authoritative Reference |
|-----------|----------|-------------------------|
| Unit | Vitest around pure functions | `PLATFORM_TESTING_STANDARD.md` |
| Integration | Server function + Supabase test project | `PLATFORM_TESTING_STANDARD.md` |
| E2E | Playwright happy-path per sprint scope | Ch. 15 |
| Performance | Budget checks | `PERFORMANCE_BUDGETS_STANDARD.md` |
| Security | RBAC and RLS assertions | Ch. 08, `RBAC_STANDARD.md` |
| Accessibility | axe scan on key screens | `docs/20-design/ACCESSIBILITY_STANDARD.md` |
| AI evaluation | Prompt regression suite | Ch. 14 |

## Non-Authority Notice
Illustration only. Authoritative rules live in Ch. 15 and the referenced standards.
