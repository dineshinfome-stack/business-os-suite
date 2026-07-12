---
title: "Governance Template Standard"
summary: "Canonical 16-section structure every governance template MUST implement."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "templates", "standard"]
document_type: "Governance Standard"
standard_version: v1.4
governance_specification: v1.0
---

# Governance Template Standard

Every governance template in `docs/15-governance/` MUST implement the following 16 sections, in order. This standard is normatively parented to Governance Specification v1.0 (`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`) until superseded.

## Mandatory Sections

1. **Header** — `template_id`, `template_name`, `template_version`, `compatible_governance`, `schema_version`, `lifecycle_state`, `template_sha256`.
2. **Purpose** — one-paragraph statement of what the template produces and why.
3. **Scope** — what the template covers.
4. **Applicability** — which passes, modules, or artifacts may invoke this template.
5. **Preconditions** — repository state required before execution (frozen inputs, prior passes complete).
6. **Inputs** — enumerated inputs with authoritative source citations.
7. **Outputs** — enumerated deliverables with target paths.
8. **Authoritative Sources** — evidence class per row: **Primary** | **Secondary** | **Informational**.
9. **Execution Workflow** — ordered steps; deterministic; idempotent per the Determinism Invariant.
10. **Validation Rules** — checklist with PASS/FAIL semantics; enumerate every check.
11. **Failure Handling** — behavior when any Validation check fails; must specify Draft rollback.
12. **Completion Criteria** — objective conditions for the template to be considered executed.
13. **Versioning** — SemVer `Major.Minor`. Minor = additive; Major = breaking.
14. **Compatibility** — Compatibility Matrix row (`template_version | governance_version | matrix_entry | result`).
15. **Audit Metadata** — verbatim note preserving prior verification/audit counts and semantic invariants (excluded from `template_sha256`).
16. **Change Control** — Audit Trail table: version, change summary, governance version, lifecycle state.

## Rules

- **SHA-256 scope:** computed over Sections 1–14 and 16. Section 15 (audit metadata) and any example instantiation are excluded.
- **Additive discipline:** Minor bumps MUST NOT change validation semantics of prior versions or invalidate prior executions.
- **Governance parenting:** every template MUST cite Governance Specification v1.0 (or its successor) as its normative parent. Templates SHALL declare `governance_specification` and `template_standard` as independent metadata fields.
- **Finding schema:** all findings in template outputs use `Finding ID | Severity | Evidence | Resolution | Status`. Severity enum `INFO | MINOR | MAJOR | CRITICAL`; Status enum `Open | Resolved | Waived`.
- **Determinism:** rerunning a template against identical inputs MUST produce identical output except for execution metadata (instance ID, sequence, timestamp, environment, repository revision when available).
- **Example instantiations:** MUST be labeled non-retainable and excluded from `template_sha256`.
- **Versioning Thresholds (R20):** `Patch` — editorial only (typos, formatting). `Minor` — additive rules, new optional fields, new capabilities, or new relationship kinds; backward compatible. `Major` — removal, breaking semantic change to existing rules or existing relationship kinds, or changes that invalidate prior executions.
- **Canonical Capability Vocabulary (R21):** allowed `capabilities` values are defined exclusively in `GOVERNANCE_TEMPLATE_CAPABILITIES.md`. Templates SHALL NOT introduce free-form capability strings. `slug → capability_id` resolution is authoritative.
- **Capability Identity (R22):** every capability has an immutable `capability_id` of the form `CAP-NNN`. Templates SHOULD store slugs for human readability; automation MUST resolve to `capability_id` for equality, dependency, and traceability operations. Retired `capability_id` values MUST NOT be reused.
- **Capability Relationships (R23):** the Capabilities registry MAY declare optional per-row relationship metadata using the fields `depends_on`, `supersedes`, and `related_to`. Targets MUST be existing `capability_id` values. The `depends_on ∪ supersedes` graph MUST be acyclic. Empty relationship fields are valid; existing templates remain conformant when their referenced capabilities carry no edges.
- **Capability Relationship Semantics (R24):** the operational meaning of each relationship kind is declared once in `GOVERNANCE_TEMPLATE_CAPABILITIES.md → §Relationship Semantics` across four axes: `execution`, `validation`, `traceability`, and `version_scope`. Individual capability rows SHALL NOT override these semantics. `depends_on` is execution-required and validation-blocking (`VAL-014` FAIL, `DEPENDENCY-FAIL`, `exit_code 20`). `supersedes` is non-executing, deprecates its target at commit time, is blocking-on-commit, and is permitted only across Major registry versions. `related_to` is informational only and never blocks. Version-comparison operations SHALL follow Semantic Versioning 2.0 precedence rules.
- **Matrix Authority (R25):** automation resolving inter-template relationships (execution dependencies, successors, replacements, audits, compatibility) SHALL consult `GOVERNANCE_TEMPLATE_DEPENDENCY_MATRIX.md` as the authoritative graph. Template-local relationship declarations are advisory and are cross-checked against the matrix by MVAL-006.
- **Conflict = FAIL (R26):** any mismatch between a template's §1 Identity and the corresponding row in the Dependency Matrix is FAIL (`exit_code 10`), waivable only via the Matrix §12 waiver schema.
- **YAML Generation Policy (R27):** for governance assets that publish a machine-readable export, markdown is normative and YAML is generated one-way from markdown. Manual edits to the YAML export are prohibited. Divergence between markdown and YAML at commit time or at any governance verification pass = FAIL.
- **Version Resolution (R28):** given a versioned dependency constraint (SemVer range), automation SHALL select the highest `Active` version of the target that satisfies the range; on ties, apply Semantic Versioning 2.0 precedence rules; if no `Active` version qualifies, fall back to the highest qualifying `Deprecated` version and emit `WARN`; `Archived` and `Planned` versions never satisfy execution prerequisites.

## Compliance

A template document is **conformant** to this Standard iff:

- All 16 sections are present and in order.
- `template_identity` block is complete.
- Validation Rules enumerate every check with unambiguous PASS/FAIL criteria.
- A Compatibility Matrix row exists for the current version.
- The Audit Metadata note appears verbatim.

Non-conformant templates remain in **Draft** and are not executable.
