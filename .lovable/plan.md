# Sprint Implementation Plan (SIP) Framework + First SIP — v5 (Approved Final)

## Objective
Establish the SIP framework as the standard, non-authoritative execution artifact for Business OS, then produce the first SIP for `SPR-MOD-001-001 Tenancy Foundation`. Documentation-only; no source code.

## Scope & Boundaries
- **Read:** PRDs, Solution Designs, Sprint Plans, EEMP v1.0, IMP v1.x, ADRs.
- **Write allowed:** `docs/05_Sprint_Implementation_Plans/**` only.
- No source, infra, config, EEMP, or IMP changes.

## Folder Layout

```
docs/05_Sprint_Implementation_Plans/
├── README.md
├── SIP_TEMPLATE.md
├── SIP_LIFECYCLE.md
├── active/
│   └── SIP-SPR-MOD-001-001.md
└── archive/
    └── README.md   (+ .gitkeep; year folders created on first archival)
```

Active SIPs live under `active/`. On sprint completion, the SIP is **copied** to `archive/<YYYY>/` with the Sprint Outcome section populated. The archive copy is the immutable record.

## Deliverables (single phase)

### 1. Framework scaffold

- `README.md` — declares folder as **execution artifact / non-authoritative / expires on sprint completion**; documents authority hierarchy (Vision → Architecture → PRDs → SDs → Sprint Plans → EEMP → IMP → Program Status → **SIP** → Code → Testing → Release); rules (no new requirements, no scope expansion, no architectural decisions).

- `SIP_TEMPLATE.md` — **12 sections** plus **Execution Metadata block**:

  Execution Metadata (per SIP):
  ```
  execution_status: Not Started | Draft | Approved | In Progress | Under Review | Completed | Archived
  completion_date:
  implemented_by:
  reviewed_by:
  quality_gate:
  archive_date:
  ```

  Sections:
  1. Sprint Overview
  2. Input Documents
  3. Implementation Scope
  4. **Development Tasks** — table columns: `Task ID` (**`SIP-001`, `SIP-002`, …** — SIP-scoped, distinct from the Implementation Master Plan IMP prefix), `Task`, `Source Requirement` (PRD-*, SPR-*-R##, ADR-*, SD-*), `Status`
  5. Repository Impact
  6. Testing Plan
  7. Acceptance Criteria (**restated verbatim** from Sprint Plan)
  8. Definition of Done
  9. Risks and Assumptions
  10. Execution Checklist
  11. **Out of Scope** — items explicitly excluded, sourced from Sprint Plan
  12. **Sprint Outcome** — populated only at archival:
     ```
     Status: Completed | Partially Completed | Cancelled
     Implemented Tasks: X / Y
     Deferred:
     Blocked:
     Known Issues:
     Lessons Learned:
     References: Sprint Completion Report | PR(s) | Release Tag
     ```

- `SIP_LIFECYCLE.md` — documents the lifecycle:
  ```
  Approved Sprint Plan → Generate SIP → Architecture Approval →
  Implementation → Testing → Quality Gate → Sprint Complete → Archive SIP
  ```
  Covers derivation, approval, execution-metadata transitions, per-task `Status` progression, Sprint Outcome authoring at archival (copy to `archive/<YYYY>/`), and immutability of substantive content.

- `archive/README.md` — naming (`SIP-<SPRINT_ID>.md`), year-folder convention, immutability rule.

### 2. First SIP — `active/SIP-SPR-MOD-001-001.md`

Derived strictly from:
- `docs/20-module-prds/platform/MODULE_PRD.md`
- `docs/60-solution-design/web/WEB-001_PLATFORM_ADMINISTRATION.md`, `mobile/MOB-001_*`, `api/API-001_*`
- `docs/30-sprint-prds/platform/SPR-MOD-001-001-tenancy-foundation.md`
- `docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN.md`
- Applicable ADRs (ADR-001, ADR-005, ADR-007) and EEMP chapters (Ch 04, 07, 08, 09, 15).

All 12 sections present. Execution Metadata seeded (`execution_status: Draft`). Every Development Task row carries `SIP-###` Task ID + `Source Requirement`. Acceptance Criteria restated verbatim. Out of Scope populated from the Sprint Plan. Sprint Outcome section is present but blank with the note "Populated at archival."

## Governance
- Frontmatter: `owner: Program Delivery`, `approver: Architecture Board`, `authority: Execution / Non-authoritative`, `lifecycle_state: Draft` (SIP) / `Living` (template).
- Reference-don't-duplicate.
- SIP cannot introduce requirements, features, or architectural decisions.
- Mutable fields during a sprint: **Execution Metadata** and per-task **Status** only.
- Mutable at archival: **Sprint Outcome** section (one-time write when moving to `archive/<YYYY>/`).
- Substantive content otherwise immutable.

## Post-Framework Discipline
This is the last framework-level artifact. Further documentation is limited to execution artifacts: subsequent SIPs, Sprint Completion Reports, bug/incident reports, release notes, and new ADRs only when implementation genuinely exposes an architectural decision.

## Stop Condition
After the framework and first SIP are issued, stop and await Architecture Board approval before production code is generated for SPR-MOD-001-001.
