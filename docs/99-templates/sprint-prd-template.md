---
title: "Sprint PRD Template"
summary: "Authoritative template for Sprint PRDs. Sprint PRDs consume Foundation, Architecture, ERP Core Engines, and Accepted ADRs — they never redefine them."
layer: "delivery"
owner: "Engineering"
status: "approved"
updated: "2026-07-05"
tags: ["template", "sprint", "prd"]
document_type: "Template"
sprint_id: "SPR-MOD-NNN-NNN"
parent_module: "MOD-NNN"
iteration: "Sprint N"
related_engines: []
related_adrs: []
---

# Sprint PRD Template

> **Instructions (delete before publishing):** Copy this file into the correct module subfolder under `docs/30-sprint-prds/<module>/`, rename it to the sprint identifier (`SPR-MOD-NNN-NNN.md`), and fill in every section below. Sprint PRDs **consume** upstream layers and MUST NOT redefine them. The `sprint_id` is permanent; the `iteration` label MAY change if scheduling is reorganized.

## Frontmatter Fields

| Field | Description |
| --- | --- |
| `sprint_id` | Permanent identifier `SPR-MOD-NNN-NNN`. Never reassigned or reused. |
| `parent_module` | Parent module ID (`MOD-NNN`). |
| `iteration` | Human-readable schedule label (e.g. `Sprint 1`, `2026-Q3-S1`). Renumberable without touching `sprint_id`. |
| `related_engines` | Array of `ENG-NNN` this sprint consumes. |
| `related_adrs` | Array of `ADR-NNN` this sprint relies on. Accepted ADRs only, unless explicitly flagged as an awaited dependency. |
| `status` | `Draft` \| `Planned` \| `In Progress` \| `Done` \| `Superseded`. |
| `owner` | Sprint owning team. |
| `updated` | Last update date (ISO). |

## 1. Sprint Objective and Scope

State the sprint's single primary objective in one or two sentences, followed by a short scope statement (in-scope surface). Sprints have exactly one objective; multiple objectives are a split-sprint signal.

## 2. Features Included

List each feature this sprint delivers as a bullet or table row. Reference the parent Module PRD section that authorizes the feature.

## 3. User Stories

Enumerate user stories in the standard form:

> *As a &lt;persona&gt;, I want &lt;capability&gt;, so that &lt;outcome&gt;.*

Each user story MUST trace to one or more features in Section 2.

## 4. Acceptance Criteria

For each user story or feature, list the observable acceptance criteria (Given / When / Then, or equivalent). Acceptance criteria are the objective test that Definition of Done is met.

## 5. ERP Core Engine Dependencies

List the ERP Core Engines this sprint consumes. Reference by stable identifier:

- `ENG-NNN` — <engine name> — <how it is used in this sprint>.

Engine behavior is NOT redefined here. Consult the engine specification for capability details.

## 6. Accepted ADR References

List the ADRs this sprint relies upon:

- `ADR-NNN` — <title> — <how it applies in this sprint>.

Only Accepted ADRs may be relied upon, except an explicitly awaited ADR (call this out).

## 7. Parent Module Reference

- **Parent Module:** `MOD-NNN` — <module name>.
- **Module PRD:** [link to `MODULE_PRD.md`].
- **Module PRD sections fulfilled by this sprint:** list section numbers (see Section 11).

## 8. Out-of-Scope

Explicitly enumerate items that are NOT delivered in this sprint, especially items a reader might reasonably expect to be included. Out-of-scope items either belong to a later sprint (link to it if known) or to a different module.

## 9. Risks and Assumptions

- **Risks** — technical, dependency, resource, or timing risks that could affect delivery.
- **Assumptions** — conditions assumed to be true. If any assumption is broken, the sprint is re-planned.

## 10. Definition of Done

The objective, verifiable checklist that determines whether the sprint is complete. Typical items:

- All acceptance criteria met.
- Automated tests pass per the authoritative testing standard.
- Observability signals in place per the authoritative observability standard.
- Documentation updated (per Sprint PRD, not by redefining upstream docs).
- Sprint moved to `Done` in `docs/SPRINT_CATALOG.md` and in the module subfolder README.

## 11. Traceability to Module PRD

Explicit trace back to `docs/20-module-prds/<module>/MODULE_PRD.md`:

| MODULE_PRD Section | Delivered By |
| --- | --- |
| e.g. §4 Business Processes: Sales Order → Invoice | Feature X, User Story Y |

This section is mandatory. A sprint with no traceable link to its Module PRD is out of scope.

## 12. Test Strategy Summary

Brief summary of the test approach for this sprint, referencing (not redefining) the authoritative testing standards in `docs/02-architecture/testing-strategy.md` and `docs/11-adrs/devops/ADR-063-testing-strategy.md`. Enumerate the test categories exercised (unit, integration, contract, end-to-end) and any sprint-specific fixtures or data.

## 13. References

- Parent Module PRD (`MOD-NNN`)
- Referenced ERP Core Engines (`ENG-NNN` list)
- Referenced ADRs (`ADR-NNN` list)
- `docs/30-sprint-prds/README.md`
- `docs/SPRINT_CATALOG.md`
- `docs/FOUNDATION_FREEZE_v1.md`
- `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md`
