# Revised Plan — Skip DER v1.0, Establish IMP-as-Living + Lightweight Status Reporting

## Decision
Do **not** author the DER v1.0 as originally specified. It overlaps materially with the already-approved IMP v1.0 (module sequence, backlog, release strategy, milestones, dependency graph, resource planning, quality gates, readiness). A parallel document would create two sources of truth and ongoing sync burden.

Instead, adopt a two-part lightweight approach that preserves every execution-management concern from the DER prompt without duplicating the IMP.

## Part 1 — Promote IMP v1.0 to Living Document

Scope (docs-only, no code):

1. **Amend `docs/03_Implementation_Master_Plan/README.md`** — mark IMP as **Living / v1.x** (EEMP stays frozen at v1.0). Add a "Living Document Protocol" section covering:
   - Update triggers: wave start/complete, milestone reached, release cut, ADR change, risk state change.
   - Update discipline: bump minor version, append changelog entry, preserve Evidence blocks, no rewrites of authoritative sources.
   - Ownership: Project Architecture; approver: Architecture Board.
2. **Add `docs/03_Implementation_Master_Plan/CHANGELOG.md`** — seeded with v1.0.0 baseline entry.
3. **Add `docs/03_Implementation_Master_Plan/LIVING_UPDATE_PROTOCOL.md`** — one page: what to update, when, by whom, evidence requirements, and the small set of chapters/indexes touched per trigger (Ch 06 Milestones, Ch 07 Module Sequence, Ch 08 Backlog, Ch 09 Sprint Roadmap, `master_implementation_backlog.md`).
4. **No content rewrites** of existing IMP chapters in this pass.

## Part 2 — Lightweight Program Status Reporting (replaces DER)

Create a minimal, dashboard-style surface under a new folder — small, cadence-driven, non-authoritative.

Path: `docs/04_Program_Status/` (write-allowed; single new folder, no chapter sprawl)

Deliverables:

1. `README.md` — declares folder as **Informative-only** (per EEMP R-25 spirit); IMP remains authoritative for plan, EEMP for standards.
2. `STATUS_REPORT_TEMPLATE.md` — 8-section template mirroring the reduced DER the user proposed:
   1. Executive Summary
   2. Current Program Status
   3. Wave Progress
   4. Release Status
   5. Risks (references `risk-register.md`)
   6. KPIs
   7. Decisions (references ADRs)
   8. Next Milestones (references IMP Ch 06)
3. `STATUS_REPORT_CADENCE.md` — weekly + per-wave-exit cadence, ownership, evidence rules, "reference-don't-duplicate" rule.
4. `reports/` — empty directory with `.gitkeep` and a `README.md` explaining naming: `YYYYMMDD_status_report.md` / `WAVE_<X>_EXIT_REPORT.md`.
5. First seeded report: `reports/PROGRAM_STATUS_BASELINE_<TS>.md` — captures current state (EEMP v1.0 Approved, IMP v1.0 GO, Wave A pending kickoff, no execution yet), citing IMP indexes.

## Part 3 — Audit Report

`docs/50-audit-reports/DER_DECISION_AND_STATUS_FRAMEWORK_REPORT.md`:
- Records the decision to skip DER v1.0 with rationale (overlap analysis vs. IMP).
- Lists artifacts produced (Parts 1 & 2).
- Confirms zero writes outside allowed paths.
- Confirms EEMP unchanged, IMP chapter content unchanged (only living-doc metadata added).
- Recommends: proceed to Wave A kickoff using IMP as the living roadmap and `04_Program_Status/` for cadence reporting.

## Scope & Boundaries
- **Write allowed:**
  - `docs/03_Implementation_Master_Plan/README.md` (metadata + protocol section)
  - `docs/03_Implementation_Master_Plan/CHANGELOG.md` (new)
  - `docs/03_Implementation_Master_Plan/LIVING_UPDATE_PROTOCOL.md` (new)
  - `docs/04_Program_Status/**` (new folder)
  - `docs/50-audit-reports/DER_DECISION_AND_STATUS_FRAMEWORK_REPORT.md` (new)
- **Read-only:** entire rest of repository.
- No source, infra, config, or EEMP changes. No IMP chapter body rewrites.

## Governance
- Frontmatter on every new file: `owner: Project Architecture`, `approver: Architecture Board`, status `Draft` pending approval.
- Evidence blocks (Source, Path, Authority, Reference, Confidence) on major sections.
- Follows EEMP R-18–R-29.

## Stop Condition
After the audit report is generated, stop and request explicit approval. Do not begin Wave A implementation.

## If You'd Rather Keep the Full DER
Say the word and I'll re-issue the original 20-chapter DER v1.0 plan unchanged. Default recommendation is the lean approach above.
