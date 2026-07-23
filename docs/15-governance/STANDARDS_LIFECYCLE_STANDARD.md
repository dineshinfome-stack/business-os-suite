---
title: "Standards Lifecycle Standard"
summary: "Governance meta-standard that governs how every platform governance standard is versioned, reviewed, deprecated, and superseded."
document_type: "Governance Meta-Standard"
layer: "governance"
owner: "Platform / Architecture Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["governance", "meta-standard", "lifecycle", "standards"]
---

# Standards Lifecycle Standard

## Purpose

This document is the **Governance Meta-Standard**: it governs the platform
governance standards themselves. Every governance document under
`docs/15-governance/` (and every future governance document in this
repository) MUST comply with this standard.

It is deliberately separate from the nine Platform Governance Standards
introduced by the Wave 0.5 Platform Validation Charter. Those standards
govern how the platform is built and validated. This standard governs how
those standards evolve.

## 1. Required Frontmatter

Every governance document MUST publish with the following YAML frontmatter
at the top of the file:

```yaml
---
title: "<Human-readable title>"
summary: "<One-sentence summary>"
document_type: "Governance Standard | Governance Meta-Standard | Governance Charter | Governance Catalog"
layer: "governance"
owner: "<Team or role>"
status: "Draft | Approved | Deprecated"
version: "<semver, e.g. 1.0.0>"
last_reviewed: "YYYY-MM-DD"
next_review: "YYYY-MM-DD"   # optional for Draft; REQUIRED when status = Approved
supersedes: "<doc path or 'none'>"
tags: ["governance", ...]
---
```

Additional frontmatter fields permitted by other standards (for example
`created`, `updated`, `depends_on`, `referenced_by`) MAY appear and MUST
NOT contradict the fields above.

## 2. Status Lifecycle

Allowed status values and transitions:

```text
Draft ──approve──▶ Approved ──deprecate──▶ Deprecated
   │                   │
   └──withdraw─────────┘
```

Rules:

- **Draft** — under authorship or open review. Not authoritative. `next_review` is optional.
- **Approved** — authoritative. `next_review` is REQUIRED and MUST be no more than 12 months after `last_reviewed`.
- **Deprecated** — no longer authoritative. `supersedes` on the replacement, or a body-level explanation of why the standard was withdrawn without replacement, is REQUIRED.

Status changes MUST bump `version` and update `last_reviewed`.

## 3. Versioning

`version` follows semantic versioning applied to governance intent:

- **MAJOR** — a rule change that would break existing modules or require rework.
- **MINOR** — a rule addition or clarification that does not break existing modules.
- **PATCH** — editorial, formatting, or non-normative fixes.

## 4. Review Cadence

- Approved standards MUST be reviewed at least every 12 months.
- A standard whose `next_review` date has passed by more than 30 days without action MUST be listed in the next Architecture Review Gate as an overdue-review finding.

## 5. Supersession

- A superseding standard MUST set `supersedes` to the path of the standard it replaces.
- The superseded standard MUST be updated to `status: Deprecated`, with a top-of-body pointer to the successor.
- Supersession chains MUST be reflected in `docs/11-adrs/ADR_INDEX.md` whenever an ADR anchors the change.

## 6. Relationship to ADRs

- **ADRs** record architectural decisions and their rationale at a point in time. They are immutable once accepted.
- **Standards** are living operational rulesets derived from one or more accepted ADRs.
- When a standard changes materially, the change MUST cite the ADR (or new ADR) that justifies it.

## 7. Scope

This standard applies to:

- Every file under `docs/15-governance/**` with `document_type` beginning with `Governance`.
- The `WAVE_0_5_PLATFORM_VALIDATION_CHARTER.md`.
- Every future Platform Governance Standard, Governance Catalog, or Governance Meta-Standard.

It does NOT govern module PRDs, sprint PRDs, ADRs, audit reports, or solution-design documents; those artifacts have their own governance frames.

## 8. Enforcement

- The Wave 0.5 Verification Report checks that every governance document authored in Wave 0.5 carries lifecycle frontmatter conforming to this standard.
- Future Architecture Review Gates re-check the population, flagging missing or malformed frontmatter as findings against `FINDING_SEVERITY_STANDARD.md`.

## 9. Related Documents

- `GOVERNANCE_FRONTMATTER_STANDARD.md` — legacy frontmatter fields; retained for non-governance documents.
- `FINDING_SEVERITY_STANDARD.md` — severity classification used when this standard is violated.
- `WAVE_0_5_PLATFORM_VALIDATION_CHARTER.md` — first consumer of this standard.
