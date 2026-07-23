---
document: SIP Template
version: 1.0.0
owner: Program Delivery
approver: Architecture Board
authority: Execution / Non-authoritative
lifecycle_state: Living
---

# Sprint Implementation Plan — Template

> Copy this file to `active/SIP-<SPRINT_ID>.md` and fill each section from the approved PRD, Solution Design(s), Sprint Plan, ADRs, EEMP, and IMP. Do **not** introduce new requirements. Acceptance Criteria are restated **verbatim** from the Sprint Plan.

## Frontmatter (per SIP)

```yaml
---
document: Sprint Implementation Plan
sip_id: SIP-<SPRINT_ID>
sprint_id: <SPRINT_ID>
module_id: <MOD-###>
version: 1.0.0
owner: Program Delivery
approver: Architecture Board
authority: Execution / Non-authoritative
lifecycle_state: Draft
---
```

## Execution Metadata

Mutable during the sprint (status and dates). Frozen substantive content lives below.

```yaml
execution_status: Not Started   # Not Started | Draft | Approved | In Progress | Under Review | Completed | Archived
completion_date:
implemented_by:
reviewed_by:
quality_gate:
archive_date:
```

## Evidence

| Field | Value |
|---|---|
| Source | <PRD / SD / Sprint Plan> |
| Path | `<repo-relative path>` |
| Authority | Approved |
| Reference | <sections / IDs> |
| Confidence | High / Medium / Low |

---

## 1. Sprint Overview

- **Sprint ID:** `<SPRINT_ID>`
- **Module:** `<MOD-###>` — `<name>`
- **Objective:** one paragraph, quoted from Sprint PRD.
- **Scope:** one paragraph, quoted from Sprint PRD.
- **Dependencies:** upstream sprints, engines, ADRs.
- **Expected Duration:** as per Sprint Plan estimate.

## 2. Input Documents

| Document | Path | Version |
|---|---|---|
| Module PRD | `docs/20-module-prds/…/MODULE_PRD.md` | — |
| Web SD | `docs/60-solution-design/web/WEB-###_…md` | — |
| Mobile SD | `docs/60-solution-design/mobile/MOB-###_…md` | — |
| API SD | `docs/60-solution-design/api/API-###_…md` | — |
| Sprint Plan | `docs/30-sprint-prds/…/MOD-###_SPRINT_PLAN.md` | — |
| Sprint PRD | `docs/30-sprint-prds/…/SPR-…md` | — |
| ADRs | `docs/11-adrs/…/ADR-###-…md` | — |
| EEMP | `docs/02_Engineering_Execution_Master_Plan/` | v1.0 |
| IMP | `docs/03_Implementation_Master_Plan/` | v1.x |

## 3. Implementation Scope

Bulleted list — restated from Sprint PRD §In Scope. Do not expand.

## 4. Development Tasks

Each row carries a stable **Task ID** and a **Source Requirement**.

| Task ID | Task | Layer | Source Requirement | Status |
|---|---|---|---|---|
| SIP-001 | <task> | Backend / Frontend / Mobile / API / Database / Security / Infrastructure / Testing | PRD-… / SPR-…-R## / ADR-… / SD-… | Not Started |
| SIP-002 | … | … | … | Not Started |

## 5. Repository Impact

Expected surface only — no code changes here.

- **Files to create:** …
- **Files to modify:** …
- **Components affected:** …
- **Services affected:** …
- **APIs affected:** …
- **Database objects affected:** …

## 6. Testing Plan

References EEMP Ch 15 — do not restate.

- **Unit tests:** …
- **Integration tests:** …
- **API tests:** …
- **UI tests (if applicable):** …
- **Security checks:** …
- **Regression tests:** …

## 7. Acceptance Criteria

Restated **verbatim** from the Sprint PRD §Acceptance Criteria. No additions, no rewording.

## 8. Definition of Done

Restated from the Sprint PRD §Definition of Done. Add EEMP quality-gate references only.

## 9. Risks and Assumptions

Implementation-specific only. Cannot alter approved architecture. Reference `docs/01-master/risk-register.md` where applicable.

## 10. Execution Checklist

Concise, ordered checklist for developers / AI agents:

- [ ] Read Sprint PRD end-to-end
- [ ] Read applicable ADRs
- [ ] Confirm dependency sprints are Complete
- [ ] Execute Development Tasks in order
- [ ] Run tests per §6
- [ ] Verify each Acceptance Criterion (§7)
- [ ] Confirm Definition of Done (§8)
- [ ] Prepare Sprint Completion Report
- [ ] Archive SIP (see `SIP_LIFECYCLE.md`)

## 11. Out of Scope

Restated from the Sprint PRD §Out of Scope. Explicit exclusions to prevent scope creep.

## 12. Sprint Outcome

> **Populated at archival only.** Do not edit during the sprint.

```yaml
status: Completed | Partially Completed | Cancelled
implemented_tasks: X / Y
deferred:
blocked:
known_issues:
lessons_learned:
references:
  sprint_completion_report:
  pull_requests: []
  release_tag:
```
