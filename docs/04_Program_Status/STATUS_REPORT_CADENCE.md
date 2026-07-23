---
document: Status Report Cadence
version: 1.0.0
owner: Project Architecture
approver: Architecture Board
lifecycle_state: Living
authority: Informative-only
---

# Status Report Cadence

## Cadence

| Cadence | Trigger | Deliverable | Owner |
|---|---|---|---|
| **Weekly** | End of each calendar week (Fri) | `reports/YYYYMMDD_status_report.md` | Program Delivery |
| **Wave Exit** | On wave completion | `reports/WAVE_<X>_EXIT_REPORT.md` | Project Architecture |
| **Ad-hoc** | Escalation, red-flag risk | `reports/YYYYMMDD_adhoc_<slug>.md` | Any accountable owner |

## Ownership

- **Author**: Program Delivery (weekly) / Project Architecture (wave-exit).
- **Reviewer**: Architecture Board.
- **Distribution**: repository commit + note in IMP `CHANGELOG.md` when the report triggers an IMP revision.

## Evidence Rules

Every report MUST:

1. Fill the Evidence block in `STATUS_REPORT_TEMPLATE.md`.
2. Reference authoritative sources by path — do not restate them.
3. Declare confidence (High / Medium / Low).
4. Link risks to `docs/01-master/risk-register.md` by ID.
5. Link decisions to ADR paths under `docs/11-adrs/`.

## Reference-Don't-Duplicate Rule

Status reports MUST NOT contain:

- Rewritten IMP chapters.
- Restated PRD, SD, or Sprint Plan content.
- New standards, new modules, or new requirements.

Violations are grounds for withdrawing the report.

## Naming Convention

- Weekly: `YYYYMMDD_status_report.md`
- Wave exit: `WAVE_<A|B|C|…>_EXIT_REPORT.md`
- Ad-hoc: `YYYYMMDD_adhoc_<slug>.md`
- Baseline: `PROGRAM_STATUS_BASELINE_<TS>.md`
