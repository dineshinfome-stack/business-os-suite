---
document: EEMP Chapter 18 — Project Governance
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 18 — Project Governance

## Purpose *(Normative)*

Orchestrate roles, approvals, ADR lifecycle, decision registration, and exception handling for engineering execution. Chapter 18 references authoritative governance artifacts and never restates them (R-19, R-20).

## Scope *(Normative)*

All engineering decisions, ADRs, exceptions, and approvals produced during EEMP execution.

## Audience *(Informative)*

Architecture Board · Technical Leads · Product Owner · Security Review · QA Lead · Contributors.

## Responsibilities *(Normative)*

| Role | Primary responsibility |
|------|------------------------|
| Architecture Board | Approve EEMP chapters, ADRs, governance changes. |
| Technical Lead | Sponsor sprint scope, approve module publications. |
| Product Owner | Approve PRDs and scope changes. |
| Security Review | Approve security-impacting ADRs and exceptions. |
| QA Lead | Approve testing strategy conformance and release readiness. |

## Authoritative Sources *(Normative — orchestration only)*

| Concern | Authoritative source |
|---------|----------------------|
| Governance framework | `docs/governance.md` |
| Decision register | `docs/decision-register.md` |
| ADR index and lifecycle | `docs/11-adrs/ADR_INDEX.md`, `docs/11-adrs/README.md` |
| Document ownership | `docs/DOCUMENT_OWNERSHIP_MATRIX.md` |
| Architecture review gate | `docs/15-governance/ARCHITECTURE_REVIEW_GATE_STANDARD.md` |
| Finding severity | `docs/15-governance/FINDING_SEVERITY_STANDARD.md` |
| Standards lifecycle | `docs/15-governance/STANDARDS_LIFECYCLE_STANDARD.md` |

## Approval Workflow *(Normative)*

Levels: **Draft → Under Review → Approved → Deprecated → Archived**. EEMP chapters carry approval level in frontmatter (`approval_status`) and record the approving role in the Revision History entry that promoted them.

## Exception Handling *(Normative)*

Deviations from an authoritative standard require: (a) written exception in the decision register, (b) referencing ADR or waiver, (c) expiry date, (d) approving role per the RACI above. Exceptions without all four are invalid.

## Related Documents *(Informative)*

[02_Repository_Governance](02_Repository_Governance.md), [17_Documentation_Standards](17_Documentation_Standards.md), [19_Go_Live_And_Release](19_Go_Live_And_Release.md).

## Cross References

- **Referenced Standards:** ARCHITECTURE_REVIEW_GATE_STANDARD, FINDING_SEVERITY_STANDARD, STANDARDS_LIFECYCLE_STANDARD, GOVERNANCE_FRONTMATTER_STANDARD.
- **Referenced ADRs:** ADR Index and all ADRs listed there.
- **Referenced Modules:** All.
- **Referenced Sprint PRDs:** All (governance applies universally).
- **Referenced Solution Designs:** All.

## Open Questions

- None at initial draft.

## Approval Status

Draft — pending Architecture Board sign-off.

## Evidence

```
Source:             docs/governance.md
Authority:          Governance Root
Reference:          Governance framework and approval flow
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/11-adrs/ADR_INDEX.md
Authority:          ADRs
Reference:          ADR lifecycle and index
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/DOCUMENT_OWNERSHIP_MATRIX.md
Authority:          Governance Root
Reference:          RACI ownership per artifact
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Scanned: `docs/governance.md`, `docs/decision-register.md`, `docs/DOCUMENT_OWNERSHIP_MATRIX.md`, `docs/11-adrs/**`, `docs/15-governance/**`.
- Referenced: seven authoritative sources listed above.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---------|---------------------|-----------------|-----------------|-----------------------------|--------------------|--------------------|
| 18 | Architecture Review Gate, Finding Severity, Standards Lifecycle, Frontmatter | ADR Index (all) | All | All | All | All |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — Phase 4. |
