---
title: "Governance Template Standard"
summary: "Canonical 16-section structure every governance template MUST implement."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "templates", "standard"]
document_type: "Governance Standard"
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
- **Governance parenting:** every template MUST cite Governance Specification v1.0 (or its successor) as its normative parent.
- **Finding schema:** all findings in template outputs use `Finding ID | Severity | Evidence | Resolution | Status`. Severity enum `INFO | MINOR | MAJOR | CRITICAL`; Status enum `Open | Resolved | Waived`.
- **Determinism:** rerunning a template against identical inputs MUST produce identical output except for execution metadata (instance ID, sequence, timestamp, environment, repository revision when available).
- **Example instantiations:** MUST be labeled non-retainable and excluded from `template_sha256`.

## Compliance

A template document is **conformant** to this Standard iff:

- All 16 sections are present and in order.
- `template_identity` block is complete.
- Validation Rules enumerate every check with unambiguous PASS/FAIL criteria.
- A Compatibility Matrix row exists for the current version.
- The Audit Metadata note appears verbatim.

Non-conformant templates remain in **Draft** and are not executable.
