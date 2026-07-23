---
document: IMP Chapter 13 — Database Strategy
version: 1.0.0
owner: Data Platform
approval_status: Draft
---

# 13 — Database Strategy

## Migration Sequencing
Migrations execute in numerical order (`0NN_*.sql`) matching sprint order. Wave order dictates the migration order across modules.

## Categories
- **Shared tables** — MOD-001 (organizations, profiles, roles, audit_logs, settings, notifications, search_indexes, documents, workflow_state).
- **Reference data** — seeded per module in the sprint that introduces the table.
- **Seed data** — first-screen demo rows included in the same migration per EEMP Ch. 07.

## Backward Compatibility
Every new migration is additive-first. Breaking changes require a paired data migration and an ADR.

## References
- EEMP Ch. 07 Database Standards
- `docs/15-governance/DATABASE_STANDARD.md`
- Existing migrations under `supabase/migrations/`
