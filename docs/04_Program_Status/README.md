---
document: Program Status
version: 1.0.0
owner: Project Architecture
approver: Architecture Board
lifecycle_state: Living
authority: Informative-only
---

# Business OS — Program Status

This folder holds **informative-only** program status artifacts. It is **not authoritative** and does not replace:

- **EEMP** (`docs/02_Engineering_Execution_Master_Plan/`) — engineering standards.
- **IMP** (`docs/03_Implementation_Master_Plan/`) — execution roadmap (living).
- **PRDs / Solution Designs / Sprint Plans / ADRs** — module-level authority.

Per EEMP R-25 (spirit), this folder is a dashboard surface. All content references authoritative sources; nothing here overrides them.

## Contents

| File | Purpose |
|---|---|
| `STATUS_REPORT_TEMPLATE.md` | 8-section template for every status report. |
| `STATUS_REPORT_CADENCE.md` | Reporting cadence, ownership, evidence rules. |
| `reports/` | All issued status reports and wave-exit reports. |

## Rules

1. **Reference, don't duplicate.** Every report links to IMP chapters, ADRs, risk register, and PRDs.
2. **Cadence-driven.** Weekly + per-wave-exit (see `STATUS_REPORT_CADENCE.md`).
3. **Immutable once issued.** Corrections are issued as new reports, not edits.
4. **No new standards or requirements** may originate here.
