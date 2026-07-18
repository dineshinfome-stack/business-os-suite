---
title: "Finding Severity Standard"
summary: "Repository-wide governance standard that promotes the Finding Severity Taxonomy (INFO, MINOR, MAJOR, CRITICAL) and the canonical certification rule into a permanent, reusable vocabulary for every audit, certification, and verification pass."
spec_id: "FINDING_SEVERITY_STANDARD"
template: "GOVERNANCE_STANDARD"
template_version: "v1.0"
layer: "platform"
owner: "Architecture Office"
status: "Active"
lifecycle_state: "Active"
version: "1.0"
updated: "2026-07-19"
tags: ["governance", "standard", "findings", "severity", "audit", "certification"]
document_type: "Governance Standard"
governance_specification: "v1.0"
release_pass: "36.1.0"
---

# Finding Severity Standard (v1.0)

Authoritative repository-wide standard for the classification and disposition of findings raised in repository audits, certification reports, sprint verification passes, module baseline verifications, and migration audits. Promotes the report-scoped taxonomy declared in [`REFERENCE_IMPLEMENTATION_CERTIFICATION_MOD001_20260718T190000Z`](../50-audit-reports/REFERENCE_IMPLEMENTATION_CERTIFICATION_MOD001_20260718T190000Z.md) (Pass 36.0.1) into permanent repository-wide governance. Consumed prospectively; historical audits are grandfathered per §6.

## 1. Purpose & Scope

- **Purpose.** Provide a single canonical severity vocabulary and a single deterministic certification rule so every verification artifact — regardless of pass, module, or family — reports findings and outcomes using the same semantics.
- **Applies To.** Prospectively (from Pass 36.1.0 forward), the standard governs:
  - Repository audits authored under [`GT-005 — Repository Audit`](./templates/GT-005_REPOSITORY_AUDIT.md).
  - Certification reports (e.g. Reference Implementation Certification).
  - Sprint verification passes authored under [`GT-003 — Sprint Authoring`](./templates/GT-003_SPRINT_AUTHORING.md).
  - Module baseline verifications authored under [`GT-004 — Baseline Consolidation`](./templates/GT-004_BASELINE_CONSOLIDATION.md).
  - Migration audits registered in [`MIGRATION_REGISTRY.md`](./MIGRATION_REGISTRY.md).
- **Does Not Apply To.** Product/business defect triage, engineering ticket severity, or runtime incident classification. Those are independent taxonomies owned outside the governance framework.
- **Independent Standard.** This standard is deliberately separate from [`GOVERNANCE_FRONTMATTER_STANDARD.md`](./GOVERNANCE_FRONTMATTER_STANDARD.md) and [`SCREEN_IDENTIFIER_STANDARD.md`](./SCREEN_IDENTIFIER_STANDARD.md) — those govern metadata and internal content identifiers respectively; this one governs verification semantics.

## 2. Severity Taxonomy

Every finding raised in an in-scope artifact MUST be classified using exactly one of the four canonical severities below. No alternative labels ("Note", "Warning", "Blocker", "P0/P1/P2") may substitute; if a legacy label appears, it MUST be projected to the canonical severity in the same artifact.

| Severity | Definition | Example Patterns | Blocks Certification? | Who May Close |
| --- | --- | --- | --- | --- |
| `INFO` | Advisory observation. Documents a fact, recommendation, or future opportunity. No repository defect asserted. | Style recommendation, roadmap suggestion, opportunistic cleanup identified during review. | No | Author of the artifact. |
| `MINOR` | Non-blocking defect. Real inconsistency exists but does not compromise correctness, safety, traceability, or downstream consumption. Remediation is scheduled, not urgent. | Stale cross-reference in frontmatter after a migration, cosmetic drift, minor registration ordering. | No | Owning role via a scheduled remediation pass. |
| `MAJOR` | Blocking defect. Compromises correctness, traceability, downstream consumption, or governance integrity. MUST be remediated (or explicitly waived under an approved waiver) before the pass may be marked complete. | Missing traceability row, capability without a mapped screen/endpoint, broken registration on a required surface, taxonomy mismatch. | Yes | Owning role via an in-pass remediation or approved waiver. |
| `CRITICAL` | Severe, systemic, or safety-relevant defect. Threatens repository invariants (isolation, identifier uniqueness, immutability of frozen artifacts, contract of a Published Module). MUST be remediated immediately; a waiver is not sufficient without Architecture Office sign-off. | Modification of a frozen baseline or publication, identifier collision, violation of Multi-Tenant Isolation ADR, breach of Frozen Execution Wrapper. | Yes | Architecture Office. |

### 2.1 Severity Assignment Rules

- Assignment is deterministic: the same fact pattern MUST receive the same severity in every artifact.
- Uncertainty biases upward: if an author cannot confidently distinguish `MINOR` from `MAJOR`, the finding is `MAJOR`.
- Severity is fixed at the moment of the finding. It is not lowered by later disposition (a `MAJOR` remediated in-pass remains `MAJOR` in the register).

## 3. Canonical Certification Rule

A repository or module is **CERTIFIED** (equivalently, a repository audit reports `Status: READY`) iff **all** of the following hold:

```text
Failed              = 0
Outstanding Risks   = 0
Count(MAJOR)        = 0
Count(CRITICAL)     = 0
```

- `MINOR` findings are non-blocking and do not prevent certification, but MUST be recorded and scheduled for remediation in a named downstream pass.
- `INFO` findings do not affect certification and require no scheduled remediation.
- The rule is stated identically in every in-scope artifact.

## 4. Verification Summary Invariant

Every in-scope artifact MUST report a Verification Summary that satisfies the invariant:

```text
Checklist Items = Passed + Remediated + Failed
```

The invariant is unchanged from the repository-wide Verification Reporting Standard defined in [`MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md). This standard restates it so the certification rule (§3) and the summary invariant are colocated with the severity taxonomy.

## 5. Findings Register Columns

Every in-scope artifact that raises at least one finding MUST include a Findings Register with the following columns, in this order:

| Column | Definition |
| --- | --- |
| ID | Stable, artifact-scoped identifier (`F-01`, `F-02`, …). Immutable within the artifact. |
| Severity | Exactly one of `INFO` \| `MINOR` \| `MAJOR` \| `CRITICAL` (§2). |
| Area | Short domain tag (e.g. `Traceability`, `Registration`, `Frontmatter`, `Isolation`). |
| Description | One-sentence factual statement of the observed condition. |
| Disposition | One of `OPEN` \| `REMEDIATED_IN_PASS` \| `SCHEDULED` \| `WAIVED` \| `INFO_ONLY`. |
| Remediation Pass | The named downstream pass that will close this finding, or `—` when disposition is `REMEDIATED_IN_PASS`, `WAIVED`, or `INFO_ONLY`. |

Artifacts with zero findings MAY omit the register but MUST state "No findings raised." explicitly.

## 6. Applicability & Grandfathering

- **Prospective adoption.** From Pass 36.1.0 forward, every in-scope artifact adopts this standard.
- **Grandfather clause.** Verification artifacts dated **on or before 2026-07-18** are grandfathered. Where those artifacts declared a report-scoped severity taxonomy (notably `REFERENCE_IMPLEMENTATION_CERTIFICATION_MOD001_20260718T190000Z`), that report-scoped taxonomy is deemed **semantically equivalent** to this standard. Grandfathered artifacts MUST NOT be retro-edited to reference this standard.
- **No retroactive re-classification.** Findings closed in grandfathered artifacts retain their original severity labels.

## 7. Interaction With Other Standards

- [`GOVERNANCE_FRONTMATTER_STANDARD.md`](./GOVERNANCE_FRONTMATTER_STANDARD.md) — governs frontmatter fields (`spec_id`, `template`, `template_version`). Independent of this standard.
- [`SCREEN_IDENTIFIER_STANDARD.md`](./SCREEN_IDENTIFIER_STANDARD.md) — governs internal content identifiers for MOB specifications. Independent of this standard.
- Repository-wide Verification Reporting Standard (defined in [`MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md)) — this standard restates and extends the summary invariant and formalizes the severity vocabulary and certification rule referenced there.
- [`GT-005 — Repository Audit`](./templates/GT-005_REPOSITORY_AUDIT.md) — consuming template. Repository audits from Pass 36.1.0 forward cite this standard as their canonical severity vocabulary.

## 8. Lifecycle

`Draft → Review → Active → Deprecated → Archived`. This document enters lifecycle state **Active** at Pass 36.1.0. Successor revisions follow Semantic Versioning per the [`GOVERNANCE_TEMPLATE_LIFECYCLE.md`](./GOVERNANCE_TEMPLATE_LIFECYCLE.md) conventions (Minor = additive; Major = breaking).

## 9. Change Authority

Changes to this standard require Architecture Office approval and a numbered governance pass. In-place edits that alter §2 (taxonomy), §3 (certification rule), §4 (invariant), or §5 (register columns) constitute a **Major** revision.

## 10. References

- [`REFERENCE_IMPLEMENTATION_CERTIFICATION_MOD001_20260718T190000Z`](../50-audit-reports/REFERENCE_IMPLEMENTATION_CERTIFICATION_MOD001_20260718T190000Z.md) — origin of the report-scoped taxonomy promoted here.
- [`GOVERNANCE_FRONTMATTER_STANDARD.md`](./GOVERNANCE_FRONTMATTER_STANDARD.md)
- [`SCREEN_IDENTIFIER_STANDARD.md`](./SCREEN_IDENTIFIER_STANDARD.md)
- [`MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — Verification Reporting Standard.
- [`templates/GT-005_REPOSITORY_AUDIT.md`](./templates/GT-005_REPOSITORY_AUDIT.md)
- [`GOVERNANCE_TEMPLATE_LIFECYCLE.md`](./GOVERNANCE_TEMPLATE_LIFECYCLE.md)
- [`GOVERNANCE_FRAMEWORK_MANIFEST.json`](./GOVERNANCE_FRAMEWORK_MANIFEST.json)
