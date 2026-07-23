---
document: EEMP Chapter 07 — Database Standards
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 07 — Database Standards

> Orchestration only. `docs/15-governance/DATABASE_STANDARD.md` is the authoritative database standard. This chapter does not derive, reinterpret, or expand it (R-20).

## Purpose *(Normative)*

Point engineers at the authoritative database standard and architecture and describe how they are consumed during migrations and data access.

## Scope *(Normative)*

All Supabase/PostgreSQL migrations under `supabase/migrations/**`, all data access from server functions, all RLS policies, all schema/grant/policy sequences.

## Audience *(Informative)*

Backend engineers · DBAs · Reviewers · Security · AI collaborators.

## Responsibilities *(Normative)*

- Engineers apply `DATABASE_STANDARD.md` verbatim; the EEMP does not restate its rules.
- Reviewers reject migrations that fail the migration ordering (CREATE → GRANT → ENABLE RLS → POLICY).
- Chapter owner updates the Traceability Matrix when new authoritative documents are added.

## Inputs *(Informative)*

Authoritative sources verified during Repository Discovery:

- `docs/15-governance/DATABASE_STANDARD.md`
- `docs/15-governance/TENANCY_STANDARD.md`
- `docs/15-governance/MIGRATION_REGISTRY.md`
- `docs/02-architecture/database-architecture.md`
- `docs/02-architecture/database-standards.md`
- `docs/02-architecture/data-dictionary.md`
- `docs/02-architecture/multi-tenant-architecture.md`
- `docs/02-architecture/reference-data.md`
- `docs/05-adr/ADR-0002-multi-tenant-strategy.md`
- `docs/05-adr/ADR-0004-database-postgres.md`
- `docs/11-erd/foundation.mmd`

## Outputs *(Informative)*

- A single pointer surface for schema, RLS, grants, tenancy, and reference data.
- Traceability from every database concern back to its source of truth.

## Consumption Guidance *(Normative)*

| Concern | Source of Truth | How Engineers Consume |
|---|---|---|
| Migration structure | `DATABASE_STANDARD.md` | Every `CREATE TABLE public.*` is followed by explicit `GRANT`s, then `ENABLE RLS`, then policies. |
| Multi-tenancy | `TENANCY_STANDARD.md`, ADR-0002 | Every tenant-scoped table carries `org_id`; every policy scopes by `private.current_org_id()`. |
| Role model | `RBAC_STANDARD.md` (cross-ref Ch. 08), `user_roles` pattern | Never store roles on `profiles`. |
| Reference data | `docs/02-architecture/reference-data.md` | Load via seed migrations; never editable by end-users unless flagged. |
| Migration registry | `MIGRATION_REGISTRY.md` | Append every migration; never rename or renumber. |
| Data dictionary | `docs/02-architecture/data-dictionary.md` | Any new column/entity is registered before use. |
| ERD baseline | `docs/11-erd/foundation.mmd` | Extend ERDs when adding tables; keep diagrams committed. |
| Auth-only helpers | `private` schema pattern (Sprint 0.4B) | Security-definer helpers live in `private`, `EXECUTE` revoked from public roles. |

## Duplicate-Standard Note *(Informative)*

`docs/02-architecture/database-standards.md` and `docs/15-governance/DATABASE_STANDARD.md` cover overlapping territory. Under R-19 (Lowest Duplication Wins) the **Governance** document is the source of truth for engineering rules; the Architecture document is consulted for rationale. Reported to `20_Appendix.md → Detected Conflicts` for review.

## Dependencies *(Informative)*

- Chapter 02 (R-01…R-23), Chapter 08 (Security Standards).

## Related Documents *(Informative)*

- [README](README.md), [06_Backend_Standards](06_Backend_Standards.md), [08_Security_Standards](08_Security_Standards.md), [09_Module_Development_Framework](09_Module_Development_Framework.md)

## Cross References *(Informative)*

- **Referenced Standards:** DATABASE_STANDARD, TENANCY_STANDARD, MIGRATION_REGISTRY, RBAC_STANDARD
- **Referenced ADRs:** ADR-0002, ADR-0004
- **Referenced Modules:** All
- **Referenced Sprint PRDs:** All database-touching sprints
- **Referenced Solution Designs:** All API-### (backing data models)

## Open Questions

- Confirm which of the two overlapping DB docs owns the ORM-level guidance.

## Approval Status

Draft — pending Architecture Board sign-off.

## Evidence

```
Source:             docs/15-governance/DATABASE_STANDARD.md
Authority:          Governance Standards
Reference:          Migration and RLS rules
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/02-architecture/database-architecture.md, multi-tenant-architecture.md, data-dictionary.md
Authority:          Master Architecture
Reference:          Physical model and tenancy
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/05-adr/ADR-0002-multi-tenant-strategy.md, ADR-0004-database-postgres.md
Authority:          ADR
Reference:          Tenancy and DBMS choice
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Discovery order followed as listed in R-18.
- Duplicate detected: `database-standards.md` vs `DATABASE_STANDARD.md` — logged in Appendix.
- No missing references at author time.

## Traceability Matrix

| Chapter | Referenced Standards | Referenced ADRs | Referenced PRDs | Referenced Solution Designs | Applicable Modules | Applicable Sprints |
|---|---|---|---|---|---|---|
| 07 Database | DATABASE_STANDARD, TENANCY_STANDARD, MIGRATION_REGISTRY, RBAC_STANDARD | ADR-0002, ADR-0004 | All | All API-### | MOD-001 … MOD-019 | All migration-emitting sprints |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — orchestration surface for database standards. |
