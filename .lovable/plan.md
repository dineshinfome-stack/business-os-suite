# Pass 37.2.0 — WEB-002 Accounting Solution Design (v2)

**Repository State:** `MOD002_PUBLICATION_COMPLETE` → `MOD002_WEB_SOLUTION_DESIGN_COMPLETE`
**Nature:** Solution Design pass. Zero governance evolution, zero implementation, zero new business requirements.

## Objective

Author the canonical WEB-002 Solution Design for MOD-002 Accounting, deriving exclusively from the approved GT-005 Module Publication and mirroring the WEB-001 reference implementation pattern.

## Resolved Open Questions

1. **Filename:** `WEB-002_ACCOUNTING.md` (canonical post-33.1.0 short form, consistent with `WEB-001_PLATFORM_ADMINISTRATION.md`).
2. **Screen IDs:** Retain WEB-001 page-based inventory. No `MOD<NNN>-SCR-<NNN>` identifiers — those remain Mobile-scoped per SCREEN_IDENTIFIER_STANDARD v1.0.

## Authoritative Inputs (read-only)

- `docs/45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md` (sole functional contract)
- `docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`
- `docs/20-module-prds/accounting/MODULE_PRD.md`
- `docs/30-sprint-prds/accounting/*` (Sprint Plan + 6 Sprint PRDs)
- `docs/60-solution-design/web/WEB-001_PLATFORM_ADMINISTRATION.md` (reference pattern)
- `docs/11-adrs/ADR_INDEX.md`, `docs/10-erp-core/ENGINE_CATALOG.md`
- Governance standards: `SD-001`, `GOVERNANCE_FRONTMATTER_STANDARD`, `FINDING_SEVERITY_STANDARD`, `SCREEN_IDENTIFIER_STANDARD`

## Deliverables

### A. WEB-002 Solution Design

Create `docs/60-solution-design/web/WEB-002_ACCOUNTING.md` mirroring WEB-001 structure:

1. Frontmatter (`spec_id: WEB-002`, `template: SD-001_WEB_SPEC`, `template_version: 1.0`, status, dependencies)
2. Pass Classification · Purpose · Scope · Business Context
3. User Personas (Accountant, Controller, CFO, Auditor, AP Clerk, AR Clerk, Tax Officer)
4. Functional Domains — 1:1 to MOD-002 Publication §4 authorities: GL Foundation, Vouchers, Journals, Statements, Taxation, Period Close
5. Information Architecture · Navigation Model
6. Screen Inventory (page-based, no stable screen IDs)
7. Page Specifications · User Workflows
8. UI Component Architecture · Validation Rules
9. Permissions & RBAC · State Management
10. Search & Filtering · Reporting & Dashboards · Notifications
11. Error Handling · Responsive Design · Accessibility (WCAG 2.1 AA per ADR-081)
12. Engine Integration Mapping (14 engines)
13. Cross-module Integration (MOD-003, MOD-004, MOD-008, MOD-015, MOD-017)
14. Non-functional Requirements
15. **Design Constraints** (new subsection, adopted from validation feedback):
    - Introduces no business requirements beyond GT-005
    - Introduces no implementation-specific technology decisions unless already established by an ADR
    - Preserves traceability to every GT-005 authority
    - Remains implementation-independent (multiple compliant web implementations possible)
16. Acceptance Criteria
17. Traceability Matrix — 5-column: `MOD-002 Authority | Sprint | Page | Engine(s) | ADR(s)`
18. Repository State Transition

### B. Registration Surfaces

- `docs/60-solution-design/web/README.md`
- `docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`
- `docs/_meta.json`
- `docs/DOCUMENT_INDEX.md`
- `.lovable/plan.md` (execution record with Pass Classification)

No governance standards, templates, or unrelated catalogs modified.

### C. Verification Report

Create `docs/50-audit-reports/WEB002_SOLUTION_DESIGN_VERIFICATION_20260719T050000Z.md`.

| # | Check | Method |
|---|-------|--------|
| 1 | Frontmatter valid | Read |
| 2 | Structure matches WEB-001 | Section diff |
| 3 | Every functional requirement traces to GT-005 | Traceability scan |
| 4 | No orphan functionality | Reverse trace |
| 5 | Navigation consistent | Read |
| 6 | Screen inventory covers all 6 domains | Enumerate |
| 7 | RBAC consistent with publication | Cross-check |
| 8 | Engine mappings valid (14 engines) | ENGINE_CATALOG match |
| 9 | Cross-module integrations valid | MOD ref match |
| 10 | Responsive requirements defined | Read |
| 11 | Accessibility (WCAG 2.1 AA) defined | Read |
| 12 | Design Constraints present | Read |
| 13 | No governance modifications | Diff scope |
| 14 | Repository state transition authorized | Confirm |

Summary: `Checklist Items = Passed + Remediated + Failed` per FINDING_SEVERITY_STANDARD. Certification: `MAJOR = 0 ∧ CRITICAL = 0`.

## Out of Scope

Mobile / API Solution Design, code generation, schema changes, ADR authoring, Baseline/Publication revisions, governance evolution, repository-wide audit, any MOD-001 modification.

## Exit Criteria

- WEB-002 authored, mirrors WEB-001, includes Design Constraints subsection
- 100% functional trace to GT-005 Publication §4
- Verification report PASS with zero MAJOR/CRITICAL findings
- All 5 registration surfaces updated
- Repository state → `MOD002_WEB_SOLUTION_DESIGN_COMPLETE`
- Authorizes Pass 37.3.0 — MOB-002 Accounting Solution Design
