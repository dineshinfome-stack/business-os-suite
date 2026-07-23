---
document: Sprint Implementation Plans
version: 1.0.0
owner: Program Delivery
approver: Architecture Board
authority: Execution / Non-authoritative
lifecycle_state: Living
---

# Sprint Implementation Plans (SIPs)

This folder holds **Sprint Implementation Plans (SIPs)** — execution artifacts that translate an already-approved Sprint PRD into an implementation-ready checklist.

A SIP is **not** authoritative. It **must not** introduce new requirements, features, or architectural decisions. It exists to help developers (human or AI) implement a single sprint deterministically and then becomes part of the historical record.

## Authority Hierarchy

```
Business Vision
      ↓
Master Architecture
      ↓
PRDs
      ↓
Solution Designs
      ↓
Sprint Plans
      ↓
EEMP (Engineering Governance — frozen v1.0)
      ↓
IMP (Living Roadmap)
      ↓
Program Status
      ↓
Sprint Implementation Plans (Execution — this folder)
      ↓
Source Code
      ↓
Testing
      ↓
Release
```

Every layer above the SIP is authoritative. The SIP is derived, temporary, and non-authoritative.

## Folder Layout

```
docs/05_Sprint_Implementation_Plans/
├── README.md              (this file)
├── SIP_TEMPLATE.md        (template for all SIPs)
├── SIP_LIFECYCLE.md       (approval, execution, archival)
├── active/                (SIPs for sprints currently in flight)
└── archive/               (immutable record of completed sprints, by year)
```

## Rules

1. **Reference, don't duplicate.** SIPs cite authoritative sources; they never restate them.
2. **No scope expansion.** Acceptance Criteria are restated **verbatim** from the Sprint Plan. An `Out of Scope` section is mandatory.
3. **No new architectural decisions.** If an ADR is needed, create one first — do not resolve it inside the SIP.
4. **Traceability.** Every Development Task carries a `Task ID` (`SIP-###`) and a `Source Requirement` (PRD-*, SPR-*-R##, ADR-*, SD-*).
5. **Controlled mutability.** During a sprint, only **Execution Metadata** and per-task **Status** may change. At archival, the **Sprint Outcome** section is written once. All other content is immutable.
6. **Archival on completion.** Completed SIPs are copied to `archive/<YYYY>/` with the Sprint Outcome populated. The archive copy is the immutable historical record.
7. **This is the last framework artifact.** Future documents shall be execution-tied: subsequent SIPs, Sprint Completion Reports, bug/incident reports, release notes, and new ADRs only when implementation genuinely exposes an architectural decision.

See `SIP_TEMPLATE.md` and `SIP_LIFECYCLE.md` for details.
