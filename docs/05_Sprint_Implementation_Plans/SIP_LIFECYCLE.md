---
document: SIP Lifecycle
version: 1.0.0
owner: Program Delivery
approver: Architecture Board
authority: Execution / Non-authoritative
lifecycle_state: Living
---

# SIP Lifecycle

## Lifecycle Diagram

```
Approved Sprint Plan
        │
        ▼
Generate SIP  (execution_status: Draft)
        │
        ▼
Architecture Approval  (execution_status: Approved)
        │
        ▼
Implementation  (execution_status: In Progress; per-task Status updates)
        │
        ▼
Testing
        │
        ▼
Quality Gate  (execution_status: Under Review)
        │
        ▼
Sprint Complete  (execution_status: Completed; Sprint Completion Report issued)
        │
        ▼
Archive SIP  (execution_status: Archived; Sprint Outcome populated; copied to archive/<YYYY>/)
```

## Mutability Rules

| Field | Mutable During Sprint? | Mutable At Archival? |
|---|---|---|
| Frontmatter substantive fields | ❌ | ❌ |
| Execution Metadata (`execution_status`, dates, reviewers, quality_gate) | ✅ | ✅ |
| Per-task `Status` column | ✅ | ❌ (frozen at archival) |
| Sections 1–11 substantive content | ❌ | ❌ |
| Section 12 Sprint Outcome | ❌ | ✅ (one-time write) |

Substantive content is immutable once approved. Corrections require a new SIP that references and supersedes the prior one.

## Archival Procedure

1. Confirm the sprint has passed its Quality Gate.
2. Set `execution_status: Completed`, populate `completion_date`, `implemented_by`, `reviewed_by`, `quality_gate`.
3. Populate the **Sprint Outcome** (§12) with status, tallies, deferred/blocked items, known issues, lessons learned, and references (Completion Report, PRs, release tag).
4. **Copy** the SIP to `archive/<YYYY>/SIP-<SPRINT_ID>.md` (year of completion). Set `archive_date` and `execution_status: Archived` in the archived copy.
5. The archived copy is the immutable record. The `active/` copy may be pruned at the team's discretion; the archive is authoritative.

## Approval Chain

- **Author:** Program Delivery.
- **Approver:** Architecture Board (before `execution_status: Approved`).
- **Quality Gate Owner:** per EEMP Ch 14.
- **Archivist:** Program Delivery.

## Constraints

- A SIP **cannot** introduce new requirements, features, or architectural decisions.
- Acceptance Criteria are **verbatim** from the Sprint Plan.
- Every Development Task **must** carry a `Task ID` and a `Source Requirement`.
- Archived SIPs are **read-only**; corrections issue a new document referencing the archived one.
