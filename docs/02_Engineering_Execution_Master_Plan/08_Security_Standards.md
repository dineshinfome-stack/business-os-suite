---
document: EEMP Chapter 08 — Security Standards
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 08 — Security Standards

> Orchestration only. Authoritative security rules live in Governance and Architecture; this chapter references them (R-19, R-20).

## Purpose *(Normative)*

Direct engineers to the authoritative security, tenancy, RBAC, and finding-severity sources, and describe how they are consumed during implementation and review.

## Scope *(Normative)*

Authentication, authorization, tenancy isolation, secrets, audit logging, RLS, security review gates, and finding classification.

## Audience *(Informative)*

Security reviewers · Backend engineers · AI collaborators · QA · Auditors.

## Responsibilities *(Normative)*

- Engineers apply the authoritative security standards verbatim.
- Reviewers block any change that bypasses RLS, hardcodes secrets, checks roles on client-side storage, or introduces `SECURITY DEFINER` helpers outside the `private` schema pattern.
- Chapter owner keeps this chapter aligned with new ADRs and standards.

## Inputs *(Informative)*

Verified during Repository Discovery:

- `docs/02-architecture/security-architecture.md`
- `docs/02-architecture/multi-tenant-architecture.md`
- `docs/15-governance/TENANCY_STANDARD.md`
- `docs/15-governance/RBAC_STANDARD.md`
- `docs/15-governance/ROLE_MODEL.md`
- `docs/15-governance/PERMISSION_CATALOG.md`
- `docs/15-governance/FINDING_SEVERITY_STANDARD.md`
- `docs/15-governance/PLATFORM_OBSERVABILITY_STANDARD.md`
- `docs/15-governance/permission-catalog.manifest.yaml`
- `docs/05-adr/ADR-0002-multi-tenant-strategy.md`
- `docs/01-master/risk-register.md`

## Outputs *(Informative)*

- Single pointer surface for security concerns.
- Traceability of every security concern to its authoritative source.

## Consumption Guidance *(Normative)*

| Concern | Source of Truth | How Engineers Consume |
|---|---|---|
| Tenancy isolation | `TENANCY_STANDARD.md`, ADR-0002 | All policies filter by `private.current_org_id()`. |
| Role storage | `RBAC_STANDARD.md`, `ROLE_MODEL.md` | Roles live in `user_roles`; never on `profiles`. |
| Permission catalog | `PERMISSION_CATALOG.md`, `permission-catalog.manifest.yaml` | Add keys via the manifest and generator; never hand-edit generated code. |
| Server-side auth | Bundled skill `auth-protected-server-functions` (see EEMP Ch. 04) | Use `requireSupabaseAuth`; check role via `has_role`. |
| Admin operations | `client.server.ts` + `supabaseAdmin` pattern | Load `supabaseAdmin` only inside verified handlers; never at module scope. |
| Secrets | Standard secrets flow | Store via the secrets tool; publishable keys OK in code. |
| Finding severity | `FINDING_SEVERITY_STANDARD.md` | Classify all security findings by its taxonomy. |
| Accepted risks | `docs/01-master/risk-register.md` | Log accepted risks (e.g. R-074) with justification and review date. |
| Audit logging | Existing `audit_logs` + server-function audit inserts (Sprint 0.2/0.3) | Every write of consequence emits an audit entry. |

## Dependencies *(Informative)*

- Chapters 02, 06, 07.

## Related Documents *(Informative)*

- [06_Backend_Standards](06_Backend_Standards.md), [07_Database_Standards](07_Database_Standards.md), [09_Module_Development_Framework](09_Module_Development_Framework.md)

## Cross References *(Informative)*

- **Referenced Standards:** TENANCY_STANDARD, RBAC_STANDARD, ROLE_MODEL, PERMISSION_CATALOG, FINDING_SEVERITY_STANDARD, PLATFORM_OBSERVABILITY_STANDARD
- **Referenced ADRs:** ADR-0002
- **Referenced Modules:** All
- **Referenced Sprint PRDs:** All security-touching sprints (0.3, 0.4, 0.4A, 0.4B, 0.5, 0.7A)
- **Referenced Solution Designs:** All API-###

## Open Questions

- None at initial draft.

## Approval Status

Draft — pending Architecture Board and Security Review sign-off.

## Evidence

```
Source:             docs/02-architecture/security-architecture.md, multi-tenant-architecture.md
Authority:          Master Architecture
Reference:          Security and tenancy model
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/15-governance/TENANCY_STANDARD.md, RBAC_STANDARD.md, ROLE_MODEL.md, PERMISSION_CATALOG.md, FINDING_SEVERITY_STANDARD.md
Authority:          Governance Standards
Reference:          Tenancy, RBAC, permissions, finding severity
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/01-master/risk-register.md
Authority:          Master Risk Register
Reference:          Accepted risks (e.g. R-074 leaked password protection)
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Discovery order followed as listed in R-18.
- No duplicates detected among cited sources.
- Missing/unverified: none at author time.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---|---|---|---|---|---|---|
| 08 Security | TENANCY, RBAC, ROLE_MODEL, PERMISSION_CATALOG, FINDING_SEVERITY, PLATFORM_OBSERVABILITY | ADR-0002 | All | All API-### | MOD-001 … MOD-019 | 0.3, 0.4, 0.4A, 0.4B, 0.5, 0.7A, + all module sprints |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — orchestration surface for security standards. |
