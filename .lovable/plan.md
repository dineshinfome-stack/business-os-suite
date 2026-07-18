# Pass 36.1.0 — Governance Enhancement: Finding Severity Standard

**Repository State (in):** `REFERENCE_IMPLEMENTATION_CERTIFIED`
**Repository State (out):** `FINDING_SEVERITY_STANDARD_ADOPTED`
**Nature:** Pure governance pass. Zero implementation, zero spec authoring, zero remediation of F-01 (deferred to Pass 36.2.0).

## Objective

Promote the report-scoped Finding Severity Taxonomy declared inside `REFERENCE_IMPLEMENTATION_CERTIFICATION_MOD001_20260718T190000Z.md` into a permanent, repository-wide governance standard, so every future audit, certification, and verification pass consumes a single canonical severity vocabulary and certification rule.

## Scope

In scope:
- Authoring one new governance standard document.
- Registering it on all four governance surfaces.
- Cross-linking existing audit/verification templates and prior certification report.
- Terminal read-only repository audit for Pass mechanics.

Out of scope (explicitly deferred):
- Remediation of MINOR finding F-01 → Pass 36.2.0.
- Retro-editing historical audits (immutable). New standard applies prospectively; historical report-scoped taxonomy remains valid via grandfather clause.
- Any Solution Design, Sprint PRD, Baseline, or Publication edits.

## Deliverables

### D1 — New governance standard
`docs/15-governance/FINDING_SEVERITY_STANDARD.md` (v1.0), containing:
- **Severity taxonomy** — `INFO`, `MINOR`, `MAJOR`, `CRITICAL` with precise definitions, example patterns, and disposition rules (who may close, remediation SLA class).
- **Certification rule (canonical):** repository/module is CERTIFIED iff `Failed = 0 ∧ Outstanding Risks = 0 ∧ MAJOR = 0 ∧ CRITICAL = 0`. MINOR findings are non-blocking and MUST be tracked as scheduled remediation. INFO is advisory.
- **Verification Summary invariant:** `Checklist Items = Passed + Remediated + Failed` (unchanged from repository-wide Verification Reporting Standard).
- **Findings register columns:** `ID | Severity | Area | Description | Disposition | Remediation Pass`.
- **Applicability matrix:** applies to repository audits (GT-005), certification reports, sprint verification passes, module baseline verifications, and migration audits.
- **Grandfather clause:** report-scoped taxonomies used in audits dated ≤ 2026-07-18 remain valid and are considered semantically equivalent to this standard. No retro-edits.
- **Interaction with existing standards:** references Verification Reporting Standard (in `MODULE_IMPLEMENTATION_WORKFLOW.md`) and audit template `GT-005`.

### D2 — Governance surface registrations
- `docs/15-governance/README.md` — add row for the new standard.
- `docs/15-governance/GOVERNANCE_FRAMEWORK_MANIFEST.json` — add manifest entry (id, path, version, status Active, adopted 2026-07-19).
- `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` — add "Applies To" matrix row (audits, certifications, verifications).
- `docs/DOCUMENT_INDEX.md` — register document.
- `docs/_meta.json` — register under the 15 Governance group in ordinal position.

### D3 — Template cross-links (reference only, no semantic changes)
- `docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md` — add a Reference line pointing to the new standard as the canonical severity vocabulary.
- Prior certification report (`REFERENCE_IMPLEMENTATION_CERTIFICATION_MOD001_20260718T190000Z.md`) is immutable; not edited. The new standard's grandfather clause acknowledges its report-scoped taxonomy.

### D4 — Terminal audit
`docs/50-audit-reports/REPOSITORY_AUDIT_20260719T000000Z.md` — read-only Pass 36.1.0 mechanics audit using the Verification Reporting Standard. Expected ~12 checks covering: standard authored at correct path, taxonomy complete, certification rule stated, invariant stated, applicability matrix present, grandfather clause present, four registration surfaces updated, template cross-link added, no spec/baseline/publication edited, no F-01 remediation attempted, repository state transition recorded, roadmap names Pass 36.2.0 as next.

### D5 — Execution record
Append Pass 36.1.0 entry to `.lovable/plan.md`.

## Technical Details

- **Document type / template:** new governance standard; frontmatter follows `GOVERNANCE_FRONTMATTER_STANDARD` — `document_type: "Governance Standard"`, `status: "Active"`, `version: "1.0"`, owner `Architecture Office`, `updated: 2026-07-19`.
- **Naming:** `FINDING_SEVERITY_STANDARD.md` — matches sibling standards (`GOVERNANCE_FRONTMATTER_STANDARD.md`, `SCREEN_IDENTIFIER_STANDARD.md`).
- **Ordering in `_meta.json`:** placed alphabetically within the 15 Governance group, adjacent to other `*_STANDARD.md` entries.
- **Roadmap after this pass:** Pass 36.2.0 — Migration Corrections (F-01 WEB-001 stale `MOB-003`/`API-003` frontmatter → canonical `MOB-001`/`API-001`), then begin next Published Module Solution Design set using MOD-001 as certified reference.

## Verification (in the terminal audit)

Each check states expected evidence in one line; result column PASS/REMEDIATED/FAILED; action column empty on PASS. Summary reports `Passed + Remediated + Failed = Checklist Items` and `Outstanding Risks = 0` for READY.
