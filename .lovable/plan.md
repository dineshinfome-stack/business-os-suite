
# Pass 8.11.2 — Governance Template Registry & Framework (Governance Infrastructure)

## Objective

Establish `docs/15-governance/` as the authoritative home of the Governance Template Framework. Extract reusable template governance out of execution logs so `.lovable/plan.md` returns to being an execution log only. Documentation-only pass.

## Non-Goals

- No changes to Governance Specification v1.0.
- No changes to Module PRDs, Sprint Plans, Baselines, or prior Repository Audits.
- No changes to existing execution logs (including `.lovable/plan.md` v1.0/v1.1 template body).
- No new module or sprint work.

## Path Resolution

- Target folder: **`docs/15-governance/`** (chosen; `docs/12-` is occupied by `ui-components`).

## Deliverables

Create the following under `docs/15-governance/`:

1. `README.md` — purpose, folder layout, lifecycle, versioning, registration process, how to add a new template.
2. `GOVERNANCE_TEMPLATE_STANDARD.md` — canonical 16-section template specification.
3. `GOVERNANCE_TEMPLATE_LIFECYCLE.md` — Draft → Review → Active → Deprecated → Archived, plus SemVer (Major.Minor) rules.
4. `GOVERNANCE_TEMPLATE_REGISTRY.md` — one record per template with the 13 fields specified.
5. `GOVERNANCE_TEMPLATE_INDEX.md` — tabular summary (ID, Name, Version, Status).

Register the framework in:

- `docs/DOCUMENT_INDEX.md`
- `docs/REPOSITORY_MAP.md`
- `docs/_meta.json`

## Part A — GOVERNANCE_TEMPLATE_REGISTRY.md

One record per template with these fields (verbatim):

Template ID, Template Name, Current Version, Status, Compatible Governance Version, Owner, Lifecycle State, Template SHA256, First Release, Latest Revision, Superseded By, Used By, Notes.

Seed entry:

- **GT-001** — Legacy Reconciliation Corrective — v1.1 — Active — Governance v1.0 — Architecture Office — Active — SHA256: `<recorded in Template v1.1 identity>` — First Release: v1.0 (Pass 8.11.1-C v10) — Latest Revision: v1.1 (Pass 8.11.1-C v11) — Superseded By: — — Used By: MOD-006 CRM (Pass 8.11.1-C, execution instance `LEGACY-RECON-CORRECTIVE-v1.1-MOD006-001`) — Notes: Additive v1.1 enhancements E1–E15.

Planned entries (Status: Planned, Version: TBD): GT-002 Stage 1 Authoring, GT-003 Sprint Authoring, GT-004 Baseline Consolidation, GT-005 Repository Audit.

## Part B — GOVERNANCE_TEMPLATE_STANDARD.md

Canonical structure every governance template MUST implement, in order:

1. Header (Template ID, name, version, governance compatibility, lifecycle)
2. Purpose
3. Scope
4. Applicability
5. Preconditions
6. Inputs
7. Outputs
8. Authoritative Sources (Primary / Secondary / Informational — evidence class)
9. Execution Workflow
10. Validation Rules
11. Failure Handling
12. Completion Criteria
13. Versioning (SemVer Major.Minor)
14. Compatibility (Compatibility Matrix row)
15. Audit Metadata (verbatim note protecting prior verification/audit counts)
16. Change Control (Audit Trail table)

Rules:
- Additive-only revisions bump Minor; breaking revisions bump Major and require a new `compatible_governance`.
- Template SHA-256 is computed over Sections 1–14 and 16, excluding Section 15 audit metadata and any example instantiation.
- Every template MUST cite Governance Specification v1.0 as its normative parent until superseded.

## Part C — GOVERNANCE_TEMPLATE_LIFECYCLE.md

Lifecycle states and transitions:

```text
Draft → Review → Active → Deprecated → Archived
```

Rules:
- Only **Active** templates may be executed.
- **Deprecated** templates remain valid for historical executions; not for new work.
- **Archived** templates are immutable.
- **Draft** and **Review** are not executable.

Versioning (SemVer, Major.Minor):
- Major: breaking governance changes (new `compatible_governance` required).
- Minor: additive-only enhancements; backward compatible.

Transition authority: Governance Board (per E12 asset metadata).

## Part D — GOVERNANCE_TEMPLATE_INDEX.md

| ID | Template | Version | Status |
|---|---|---|---|
| GT-001 | Legacy Reconciliation Corrective | v1.1 | Active |
| GT-002 | Stage 1 Authoring | TBD | Planned |
| GT-003 | Sprint Authoring | TBD | Planned |
| GT-004 | Baseline Consolidation | TBD | Planned |
| GT-005 | Repository Audit | TBD | Planned |

## Part E — README.md

Sections: Purpose, Folder Layout, Lifecycle summary, Versioning summary, Registration Process, How to Add a New Template (Draft → Review → Active), Cross-references to `MODULE_IMPLEMENTATION_WORKFLOW.md` and Governance Specification v1.0.

## Part F — Registration

- `docs/DOCUMENT_INDEX.md`: add a "Governance Templates" section listing the five new files.
- `docs/REPOSITORY_MAP.md`: add `docs/15-governance/` node with children.
- `docs/_meta.json`: append entries for each new file with SHA-256 change-set hashes.

## Part G — Validation Checks (6)

1. Registry complete (GT-001 populated with all 13 fields; GT-002–005 Planned rows present).
2. Index complete (matches Registry).
3. README complete (all 7 sections present).
4. Lifecycle complete (5 states + SemVer rules).
5. Standard complete (all 16 sections defined).
6. Registration complete (DOCUMENT_INDEX, REPOSITORY_MAP, _meta.json all updated).

Result recorded as `PASS/FAIL` per check.

## Part H — Repository Audit (Spec v1.0)

Confirm:
- Governance Specification v1.0 unchanged.
- Existing templates unchanged (v1.0 frozen block in `.lovable/plan.md` untouched; v1.1 body untouched — only re-referenced by the Registry).
- Existing execution logs unchanged (Pass 8.11.1 verification/audit counts, semantic invariants, Repository Status, Confidence all preserved).
- New framework registered in all three catalogs.
- Repository Status: **READY**. Confidence: **MEDIUM** (D3 Repository Revision Waiver).

## Success Criteria

- `docs/15-governance/` exists with all five files.
- GT-001 Legacy Reconciliation Corrective v1.1 registered as **Active** with SHA-256 referenced.
- GT-002–GT-005 present as **Planned** placeholders.
- Registration updated in `DOCUMENT_INDEX.md`, `REPOSITORY_MAP.md`, and `_meta.json`.
- All 6 Part G checks PASS; Part H audit PASS.
- `.lovable/plan.md` and Governance Specification v1.0 unchanged.

## Failure Criteria

Any Part G check FAIL → framework marked Draft; no updates to catalogs committed; findings enumerated under the standard `Finding ID | Severity | Evidence | Resolution | Status` schema.
