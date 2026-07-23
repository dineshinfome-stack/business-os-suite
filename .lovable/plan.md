# Phase 2 — Platform Standards (EEMP) — v3

Incorporates all v2 refinements plus the four optional enhancements (Traceability Matrix, Normative vs Informative classification, Compliance Verification, Repository Health taxonomy). Approved defaults locked in: `owner: Project Architecture`, default approver `Architecture Board`, one phase per turn.

## Scope

Author or update, as needed, the following chapters under `docs/02_Engineering_Execution_Master_Plan/`:

- `06_Backend_Standards.md`
- `07_Database_Standards.md`
- `08_Security_Standards.md`
- `09_Module_Development_Framework.md`
- `10_Module_Dependency_Matrix.md`

Supporting work (only if needed after Repository Discovery):

- Amend `02_Repository_Governance.md` with:
  - **R-18 Repository Discovery Enhancement** — mandatory search order, orchestration-only, no duplication.
  - **R-19 Lowest Duplication Wins** — reference the highest-authority, most reusable, least-duplicated source.
  - **R-20 No Derived Standards** — if an authoritative standard exists, do not derive, reinterpret, or expand it; describe only how engineers consume it.
  - **R-21 Evidence Confidence Definitions** — High: single approved authoritative doc. Medium: two or more authoritative docs. Low: requires manual verification. Unknown: reference unavailable.
  - **R-22 Section Classification** — every major section is explicitly marked **Normative** (mandatory engineering rule) or **Informative** (explanatory guidance).
  - **R-23 Traceability** — every chapter carries a Traceability Matrix.
- Ensure `20_Appendix.md` contains a **Detected Conflicts** section (create only if absent).
- Update `README.md` chapter index and `indexes/chapter_index.md` only where status transitions actually change.
- Author `docs/50-audit-reports/EEMP_PHASE_2_REPORT.md`.

## Expected Deliverables

Create or update **only** the files required to complete Phase 2. Actual counts of created vs modified files depend on repository state discovered during Repository Discovery. No writes outside `docs/02_Engineering_Execution_Master_Plan/` and `docs/50-audit-reports/`. No edits to `src/**`, migrations, or config.

## Execution Order (single turn)

1. **Repository Discovery (read-only)** in this order:
   Master Architecture → Governance Standards → Architecture Documents → Design Documents → ADRs → Module Publications → PRDs → Solution Designs → Sprint PRDs → Existing EEMP.

   Possible authoritative sources include, but are not limited to, documents under `docs/01-master/`, `docs/02-architecture/`, `docs/03-design/`, `docs/05-adr/`, `docs/11-adrs/`, `docs/11-erd/`, `docs/15-governance/`, `docs/20-design/`, `docs/20-module-prds/`, `docs/30-sprint-prds/`, `docs/40-module-baselines/`, `docs/45-module-publications/`, `docs/46-solution-design/`, `docs/60-solution-design/`, and root indices (`MODULE_CATALOG.md`, `module-dependency-matrix.md`, `SPRINT_DEPENDENCY_MATRIX.md`, `ADR_IMPACT_MATRIX.md`, `ENGINE_USAGE_MATRIX.md`). Repository Discovery determines the final authoritative source. Never assume any file exists.

2. **Emit Discovery Statistics** into the audit report:
   Documents Scanned · Documents Referenced · Duplicate Standards · Missing References · Conflicts · Skipped Documents · Outdated Documents.

3. **Amend `02_Repository_Governance.md`** with R-18 through R-23.

4. **Author chapters 06–10** using the standard chapter template (Purpose · Scope · Audience · Responsibilities · Inputs · Outputs · Dependencies · Related Documents · Revision History · Cross References · Open Questions · Approval Status · Evidence · Discovery Inventory · **Traceability Matrix**). Each chapter:
   - References authoritative sources; does not restate them.
   - Marks each major section **Normative** or **Informative** (R-22).
   - Carries Evidence with Confidence per R-21.
   - Obeys **Lowest Duplication Wins** (R-19) and **No Derived Standards** (R-20).
   - Includes a **Traceability Matrix** with columns:
     Chapter → Referenced Standards → Referenced ADRs → Referenced PRDs → Referenced Solution Designs → Applicable Modules → Applicable Sprints.

   `10_Module_Dependency_Matrix.md` diagrams may use Mermaid `flowchart` or `gitGraph`, whichever is more readable.

5. **`20_Appendix.md`** — ensure a **Detected Conflicts** section exists; populate from discovery (empty if none). Governance conflicts are recorded, never resolved inside the EEMP.

6. **Update `README.md` and `indexes/chapter_index.md`** only if status transitions actually change.

7. **Author `docs/50-audit-reports/EEMP_PHASE_2_REPORT.md`** in this fixed section order:
   1. Discovery Summary (incl. Discovery Statistics)
   2. Files (Created / Modified — actual, not predicted)
   3. Cross References (chapter → authoritative source)
   4. Repository Health Findings — each classified by **severity** (Critical / Major / Minor / Informational) **and category** (Duplicate — same content · Overlapping — similar topic, different scope · Conflicting — contradictory guidance)
   5. Duplicate Standards
   6. Missing References
   7. Broken Links
   8. Conflicts (mirrors `20_Appendix.md → Detected Conflicts`)
   9. Metrics (Success Metrics snapshot)
   10. **Compliance Verification** — checklist:
       - Repository Protection respected
       - No duplicate standards introduced
       - No architecture redefined
       - No governance superseded
       - Documentation hierarchy respected
       - Evidence present
       - Confidence assigned
       - Cross-references validated
       - Traceability Matrix present in every new/amended chapter
       - Normative vs Informative classification applied
   11. Checklist (R-17 completion)
   12. Questions (Outstanding)
   13. Approval (request)

8. **Stop.** Do not begin Phase 3 automatically. Do not anticipate future work.

## Non-Goals

- No new architecture, no new standards, no changes to PRD/SD/module/sprint scope.
- No renames or moves.
- No resolution of governance conflicts inside the EEMP — only recording them.
- No modification of documents outside the EEMP folder (Repository Health issues are reported, not fixed).

## Closing Directive

If all Phase 2 completion criteria are satisfied, execute Phase 2. At completion, stop, generate the audit report, request approval, and wait for explicit authorization before beginning Phase 3.
